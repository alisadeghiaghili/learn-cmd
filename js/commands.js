/**
 * Windows CMD command implementations for learn-cmd.
 *
 * Each handler mutates a VirtualFileSystem and returns printed lines.
 * Handlers receive a context with the fs, cwd helpers, and meta services.
 */

'use strict';

import { normalizePath, splitPath, globToRegExp, ROOT_PATH } from './vfs.js';

/**
 * @typedef {Object} CmdContext
 * @property {import('./vfs.js').VirtualFileSystem} fs
 * @property {boolean} [countCommands]
 * @property {{ showSolution?: () => void, resetLevel?: () => void, undo?: () => void }} [meta]
 */

/**
 * @param {string} message
 * @returns {Error}
 */
function cmdError(message) {
  const err = new Error(message);
  err.name = 'CmdError';
  return err;
}

/**
 * Pad a string to width (left or right).
 *
 * @param {string} s
 * @param {number} width
 * @param {boolean} [right]
 * @returns {string}
 */
function pad(s, width, right) {
  const str = String(s);
  if (str.length >= width) return str;
  const spaces = ' '.repeat(width - str.length);
  return right ? spaces + str : str + spaces;
}

/**
 * Format a timestamp like Windows `dir` (MM/DD/YYYY  HH:MM AM).
 *
 * @param {number} ts
 * @returns {string}
 */
function formatWinDate(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();
  let hours = d.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}/${dd}/${yyyy}  ${String(hours).padStart(2, ' ')}:${mi} ${ampm}`;
}

/**
 * Split a raw command line into tokens, honoring quotes.
 *
 * @param {string} line
 * @returns {string[]}
 */
export function tokenize(line) {
  const tokens = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (ch === ' ' || ch === '\t')) {
      if (current) {
        tokens.push(current);
        current = '';
      }
      continue;
    }
    current += ch;
  }
  if (current) tokens.push(current);
  return tokens;
}

/**
 * Parse flags like /s /q /b and positional args.
 *
 * @param {string[]} args
 * @returns {{ flags: Set<string>, rest: string[] }}
 */
function parseFlags(args) {
  const flags = new Set();
  const rest = [];
  for (const arg of args) {
    if (/^\/[a-zA-Z?]/.test(arg) || /^-[a-zA-Z?]$/.test(arg)) {
      flags.add(arg.slice(1).toLowerCase().replace(/\?.*/, '?'));
    } else {
      rest.push(arg);
    }
  }
  return { flags, rest };
}

const MONTH = () => formatWinDate(Date.now());

/**
 * UTF-8 byte length without relying on Node's Buffer (browser-safe).
 *
 * @param {string} text
 * @returns {number}
 */
function utf8Length(text) {
  let bytes = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.codePointAt(i) || 0;
    if (code > 0xffff) i += 1;
    if (code <= 0x7f) bytes += 1;
    else if (code <= 0x7ff) bytes += 2;
    else if (code <= 0xffff) bytes += 3;
    else bytes += 4;
  }
  return bytes;
}

/**
 * @type {Record<string, { fn: (args: string[], ctx: CmdContext, raw: string) => string[], help: string, usage: string }>}
 */
export const COMMANDS = {
  echo: {
    usage: 'ECHO [message | .]',
    help: 'Displays messages, or turns command echoing on or off.',
    fn(args) {
      if (args.length === 0) return ['ECHO is on.'];
      const text = args.join(' ');
      if (text === '.') return [''];
      return [text];
    },
  },

  cls: {
    usage: 'CLS',
    help: 'Clears the screen.',
    fn() {
      return ['\x0CLS'];
    },
  },

  ver: {
    usage: 'VER',
    help: 'Displays the Windows version.',
    fn() {
      return ['', 'Microsoft Windows [Version 10.0.19045.4170]', ''];
    },
  },

  vol: {
    usage: 'VOL [drive:]',
    help: 'Displays a disk volume label and serial number.',
    fn(_args, ctx) {
      return [
        ` Volume in drive C is OS`,
        ` Volume Serial Number is 3C4D-1A2B`,
      ];
    },
  },

  cd: {
    usage: 'CD [/D] [drive:][path]',
    help: 'Displays the name of or changes the current directory.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      if (rest.length === 0) return [ctx.fs.cwd];
      const target = rest[0];
      if (/^[A-Za-z]:/.test(target) && target.length === 2) {
        return [ROOT_PATH.endsWith('\\') ? ROOT_PATH : ROOT_PATH];
      }
      const node = ctx.fs.resolveDir(target);
      if (node.type !== 'dir') throw cmdError('The directory name is invalid.');
      ctx.fs.cwd = normalizePath(target, ctx.fs.cwd);
      void flags;
      return [];
    },
  },

  chdir: {
    usage: 'CHDIR [/D] [drive:][path]',
    help: 'Displays the name of or changes the current directory.',
    fn(args, ctx, raw) {
      return COMMANDS.cd.fn(args, ctx, raw);
    },
  },

  pushd: {
    usage: 'PUSHD [path]',
    help: 'Changes the current directory and saves the previous one.',
    fn(args, ctx) {
      if (args.length === 0) return [];
      ctx.fs.resolveDir(args[0]);
      if (!ctx.fs.dirStack) ctx.fs.dirStack = [];
      ctx.fs.dirStack.push(ctx.fs.cwd);
      ctx.fs.cwd = normalizePath(args[0], ctx.fs.cwd);
      return [];
    },
  },

  popd: {
    usage: 'POPD',
    help: 'Restores the previous directory saved by PUSHD.',
    fn(_args, ctx) {
      const stack = ctx.fs.dirStack || [];
      if (stack.length === 0) throw cmdError('directory stack empty');
      ctx.fs.cwd = stack.pop();
      return [];
    },
  },

  dir: {
    usage: 'DIR [drive:][path][filename] [/A] [/B] [/S]',
    help: 'Displays a list of files and subdirectories in a directory.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      let targetPath = ctx.fs.cwd;
      let pattern = null;
      if (rest.length > 0) {
        const arg = rest[0];
        const last = arg.replace(/\//g, '\\').split('\\').pop();
        if (/[?*]/.test(last) || /\.[a-zA-Z0-9]+$/.test(last)) {
          // might be a file pattern
          const asPath = ctx.fs.resolve(arg);
          if (asPath && asPath.type === 'dir') {
            targetPath = normalizePath(arg, ctx.fs.cwd);
          } else if (asPath && asPath.type === 'file') {
            targetPath = splitPath(normalizePath(arg, ctx.fs.cwd)).parent;
            pattern = last;
          } else if (/[?*]/.test(last)) {
            targetPath = splitPath(normalizePath(arg, ctx.fs.cwd)).parent;
            pattern = last;
          } else if (asPath) {
            targetPath = normalizePath(arg, ctx.fs.cwd);
          } else {
            // try as directory first
            try {
              ctx.fs.resolveDir(arg);
              targetPath = normalizePath(arg, ctx.fs.cwd);
            } catch {
              targetPath = splitPath(normalizePath(arg, ctx.fs.cwd)).parent;
              pattern = last;
            }
          }
        } else {
          targetPath = normalizePath(arg, ctx.fs.cwd);
        }
      }

      const dirPath = normalizePath(targetPath, ctx.fs.cwd);
      const dirNode = ctx.fs.resolveDir(dirPath);
      let nodes = ctx.fs.list(dirPath, pattern || undefined);
      if (flags.has('a')) {
        // show all including hidden-ish — already all
      }

      if (flags.has('b')) {
        return nodes.map((n) => n.name);
      }

      const lines = [];
      lines.push(` Volume in drive C is OS`);
      lines.push(` Volume Serial Number is 3C4D-1A2B`);
      lines.push(` Directory of ${dirPath}`);
      lines.push('');

      let fileCount = 0;
      let dirCount = 0;
      let fileBytes = 0;

      if (dirPath !== ROOT_PATH) {
        lines.push(`${MONTH()}    <DIR>          .`);
        lines.push(`${MONTH()}    <DIR>          ..`);
        dirCount += 2;
      }

      for (const n of nodes) {
        if (n.type === 'dir') {
          lines.push(`${formatWinDate(n.modified)}    <DIR>          ${n.name}`);
          dirCount += 1;
        } else {
          const size = n.content ? utf8Length(n.content) : 0;
          fileBytes += size;
          fileCount += 1;
          lines.push(
            `${formatWinDate(n.modified)}    ${pad(String(size), 14, true)} ${n.name}`
          );
        }
      }

      lines.push(
        `              ${pad(String(fileCount), 14, true)} File(s)      ${pad(String(fileBytes), 14, true)} bytes`
      );
      lines.push(
        `              ${pad(String(dirCount), 14, true)} Dir(s)   42,949,672,960 bytes free`
      );
      return lines;
    },
  },

  tree: {
    usage: 'TREE [drive:][path] [/F]',
    help: 'Graphically displays the directory structure.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      const startPath = rest[0] ? normalizePath(rest[0], ctx.fs.cwd) : ctx.fs.cwd;
      const startNode = ctx.fs.resolveDir(startPath);
      const lines = [`Folder PATH listing for volume OS`, `Volume serial number is 3C4D-1A2B`, startPath];

      /** @param {import('./vfs.js').VfsNode} node @param {string} prefix */
      const walk = (node, prefix) => {
        const dirs = [...node.children.values()].filter((c) => c.type === 'dir');
        const files = flags.has('f')
          ? [...node.children.values()].filter((c) => c.type === 'file')
          : [];
        const entries = [...dirs, ...files];
        entries.forEach((child, i) => {
          const isLast = i === entries.length - 1;
          const branch = isLast ? '└───' : '├───';
          lines.push(prefix + branch + child.name);
          if (child.type === 'dir') {
            walk(child, prefix + (isLast ? '    ' : '│   '));
          }
        });
      };
      walk(startNode, '');
      return lines;
    },
  },

  md: {
    usage: 'MD [drive:]path',
    help: 'Creates a directory.',
    fn(args, ctx) {
      if (args.length === 0) throw cmdError('The syntax of the command is incorrect.');
      const created = [];
      for (const target of args) {
        const before = ctx.fs.resolve(target);
        ctx.fs.mkdir(target);
        if (!before) created.push(normalizePath(target, ctx.fs.cwd));
      }
      return [];
    },
  },

  mkdir: {
    usage: 'MKDIR [drive:]path',
    help: 'Creates a directory.',
    fn(args, ctx, raw) {
      return COMMANDS.md.fn(args, ctx, raw);
    },
  },

  rd: {
    usage: 'RD [/S] [/Q] [drive:]path',
    help: 'Removes (deletes) a directory.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      if (rest.length === 0) throw cmdError('The syntax of the command is incorrect.');
      for (const target of rest) {
        ctx.fs.rmdir(target, { recursive: flags.has('s'), quiet: flags.has('q') });
      }
      return [];
    },
  },

  rmdir: {
    usage: 'RMDIR [/S] [/Q] [drive:]path',
    help: 'Removes (deletes) a directory.',
    fn(args, ctx, raw) {
      return COMMANDS.rd.fn(args, ctx, raw);
    },
  },

  del: {
    usage: 'DEL [/P] [/F] [/S] [/Q] names',
    help: 'Deletes one or more files.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      if (rest.length === 0) throw cmdError('The syntax of the command is incorrect.');
      let count = 0;
      for (const target of rest) {
        count += ctx.fs.deleteFile(target, { quiet: flags.has('q') || flags.has('s') });
      }
      void count;
      return [];
    },
  },

  erase: {
    usage: 'ERASE names',
    help: 'Deletes one or more files.',
    fn(args, ctx, raw) {
      return COMMANDS.del.fn(args, ctx, raw);
    },
  },

  ren: {
    usage: 'REN [drive:][path]filename1 filename2.',
    help: 'Renames a file or files.',
    fn(args, ctx) {
      if (args.length < 2) throw cmdError('The syntax of the command is incorrect.');
      ctx.fs.rename(args[0], args[1]);
      return [];
    },
  },

  rename: {
    usage: 'RENAME [drive:][path]filename1 filename2.',
    help: 'Renames a file or files.',
    fn(args, ctx, raw) {
      return COMMANDS.ren.fn(args, ctx, raw);
    },
  },

  copy: {
    usage: 'COPY [/D] [/V] source [destination]',
    help: 'Copies one or more files to another location.',
    fn(args, ctx) {
      if (args.length < 1) throw cmdError('The syntax of the command is incorrect.');
      const src = args[0];
      const dest = args[1] || splitPath(normalizePath(src, ctx.fs.cwd)).name;
      return ctx.fs.copyFile(src, dest);
    },
  },

  move: {
    usage: 'MOVE [/Y | /-Y] source [destination]',
    help: 'Moves files and renames files and directories.',
    fn(args, ctx) {
      const { rest } = parseFlags(args);
      if (rest.length < 1) throw cmdError('The syntax of the command is incorrect.');
      const src = rest[0];
      const dest = rest[1] || splitPath(normalizePath(src, ctx.fs.cwd)).name;
      return ctx.fs.move(src, dest);
    },
  },

  type: {
    usage: 'TYPE [drive:][path]filename',
    help: 'Displays the contents of a text file.',
    fn(args, ctx) {
      if (args.length === 0) throw cmdError('The syntax of the command is incorrect.');
      const content = ctx.fs.readFile(args[0]);
      const lines = content.split(/\r?\n/);
      if (lines[lines.length - 1] === '') lines.pop();
      return lines;
    },
  },

  more: {
    usage: 'MORE [/E] [drive:][path]filename',
    help: 'Displays output one screen at a time.',
    fn(args, ctx) {
      if (args.length === 0) return [];
      return COMMANDS.type.fn(args, ctx);
    },
  },

  find: {
    usage: 'FIND [/V] [/C] [/N] [/I] "string" [[drive:][path]filename[ ...]]',
    help: 'Searches for a text string in a file or files.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      if (rest.length < 1) throw cmdError('The syntax of the command is incorrect.');
      let needle = rest[0].replace(/^"|"$/g, '');
      const files = rest.slice(1);
      const ignoreCase = flags.has('i');
      const invert = flags.has('v');
      const countOnly = flags.has('c');
      const numbered = flags.has('n');

      const lines = [];
      const targets = files.length ? files : [''];
      for (const file of targets) {
        let content;
        let label;
        if (!file) {
          content = ctx.stdin || '';
          label = '';
        } else {
          content = ctx.fs.readFile(file);
          label = `---------- ${normalizePath(file, ctx.fs.cwd).toUpperCase()}`;
        }
        const hay = ignoreCase ? content.toLowerCase() : content;
        const ned = ignoreCase ? needle.toLowerCase() : needle;
        const rows = content.split(/\r?\n/);
        if (rows[rows.length - 1] === '') rows.pop();
        const matched = rows
          .map((row, i) => ({ row, i }))
          .filter(({ row }) => {
            const h = ignoreCase ? row.toLowerCase() : row;
            const hit = h.includes(ned);
            return invert ? !hit : hit;
          });
        if (label) lines.push(label);
        if (countOnly) {
          lines.push(String(matched.length));
        } else {
          for (const { row, i } of matched) {
            lines.push(numbered ? `[${i + 1}]${row}` : row);
          }
        }
      }
      return lines;
    },
  },

  findstr: {
    usage: 'FINDSTR [/B] [/E] [/L] [/R] [/S] [/I] [/X] [/V] [/N] [/M] [/O] [/F:file] [/C:string] [/G:file] strings [[drive:][path]filename[ ...]]',
    help: 'Searches for strings in files.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      if (rest.length < 1) throw cmdError('The syntax of the command is incorrect.');
      const pattern = rest[0];
      const files = rest.slice(1);
      const ignoreCase = !flags.has('x') ? true : flags.has('i');
      const lines = [];
      const targets = files.length ? files : [''];
      for (const file of targets) {
        let content;
        let label;
        if (!file) {
          content = ctx.stdin || '';
          label = '';
        } else {
          content = ctx.fs.readFile(file);
          label = normalizePath(file, ctx.fs.cwd);
        }
        const rows = content.split(/\r?\n/);
        if (rows[rows.length - 1] === '') rows.pop();
        const re = flags.has('r')
          ? new RegExp(pattern, ignoreCase ? 'i' : '')
          : null;
        const matched = rows.filter((row) => {
          const h = ignoreCase ? row.toLowerCase() : row;
          const p = ignoreCase ? pattern.toLowerCase() : pattern;
          return re ? re.test(row) : h.includes(p);
        });
        if (label && matched.length) lines.push(label);
        for (const row of matched) {
          lines.push(flags.has('n') ? label + ':' + row : row);
        }
      }
      return lines;
    },
  },

  sort: {
    usage: 'SORT [/R] [/+n] [[drive1:][path1]filename1] [/O [drive2:][path2]filename2]',
    help: 'Sorts input.',
    fn(args, ctx) {
      const { flags, rest } = parseFlags(args);
      let content = '';
      if (rest[0]) content = ctx.fs.readFile(rest[0]);
      else content = ctx.stdin || '';
      let rows = content.split(/\r?\n/);
      if (rows[rows.length - 1] === '') rows.pop();
      rows.sort((a, b) => a.localeCompare(b));
      if (flags.has('r')) rows.reverse();
      return rows;
    },
  },

  attrib: {
    usage: 'ATTRIB [+R | -R] [+A | -A] [+S | -S] [+H | -H] [drive:][path][filename]',
    help: 'Displays or changes file attributes.',
    fn(args, ctx) {
      const { rest } = parseFlags(args);
      const setOps = [];
      const targets = [];
      for (const a of args) {
        if (/^[+-][rash]$/i.test(a)) setOps.push(a);
        else targets.push(a);
      }
      if (targets.length === 0) {
        // list cwd attributes
        const nodes = ctx.fs.list(ctx.fs.cwd);
        return nodes.map((n) => `A  ${n.attrs.includes('R') ? 'R' : ' '}                     ${normalizePath(ctx.fs.cwd + '\\' + n.name, ctx.fs.cwd)}`);
      }
      for (const t of targets) {
        const node = ctx.fs.resolve(t);
        if (!node) throw cmdError('File not found - ' + normalizePath(t, ctx.fs.cwd));
        for (const op of setOps) {
          const flag = op[0] === '+';
          const letter = op[1].toUpperCase();
          if (flag) {
            if (!node.attrs.includes(letter)) node.attrs += letter;
          } else {
            node.attrs = node.attrs.replace(letter, '');
          }
        }
      }
      return [];
    },
  },

  set: {
    usage: 'SET [variable=[string]]',
    help: 'Displays, sets, or removes CMD.EXE environment variables.',
    fn(args, ctx) {
      if (args.length === 0) {
        return [...ctx.fs.env.entries()].map(([k, v]) => `${k}=${v}`).sort();
      }
      const raw = args.join(' ');
      const eq = raw.indexOf('=');
      if (eq <= 0) {
        // query
        const name = raw.trim();
        const value = ctx.fs.env.has(name) ? ctx.fs.env.get(name) : null;
        if (value == null) {
          const lower = [...ctx.fs.env.keys()].find((k) => k.toLowerCase() === name.toLowerCase());
          if (lower) return [`${lower}=${ctx.fs.env.get(lower)}`];
          return [`Environment variable ${name} not defined`];
        }
        return [`${name}=${value}`];
      }
      const name = raw.slice(0, eq);
      const value = raw.slice(eq + 1);
      if (!value) {
        ctx.fs.env.delete(name);
        return [];
      }
      ctx.fs.env.set(name, value);
      return [];
    },
  },

  path: {
    usage: 'PATH [[drive:]path[;...]]',
    help: 'Displays or sets a search path for executable files.',
    fn(args, ctx) {
      if (args.length === 0) return [`PATH=${ctx.fs.env.get('PATH') || ''}`];
      ctx.fs.env.set('PATH', args.join(' '));
      return [];
    },
  },

  where: {
    usage: 'WHERE [options] [/Q] [/F] [/T] pattern',
    help: 'Displays the location of files that match the search pattern.',
    fn(args, ctx) {
      if (args.length === 0) throw cmdError('The syntax of the command is incorrect.');
      const pattern = args[0];
      const found = [];
      const pathVar = ctx.fs.env.get('PATH') || 'C:\\Windows\\System32';
      for (const dir of pathVar.split(';').filter(Boolean)) {
        try {
          const nodes = ctx.fs.list(dir, pattern.includes('.') ? pattern : pattern + '.exe');
          for (const n of nodes) {
            found.push(normalizePath(dir + '\\' + n.name, ROOT_PATH));
          }
        } catch {
          /* skip missing PATH entries */
        }
      }
      if (found.length === 0) throw cmdError('INFO: Could not find files for the given pattern(s).');
      return found;
    },
  },

  tasklist: {
    usage: 'TASKLIST [/FI filter] [/FO format]',
    help: 'Displays all currently running processes.',
    fn(_args, ctx) {
      if (!ctx.fs.processes) {
        ctx.fs.processes = [
          { name: 'System', pid: '4', mem: '140 K' },
          { name: 'smss.exe', pid: '388', mem: '1,024 K' },
          { name: 'csrss.exe', pid: '544', mem: '4,300 K' },
          { name: 'cmd.exe', pid: '4120', mem: '3,480 K' },
          { name: 'explorer.exe', pid: '2140', mem: '45,200 K' },
          { name: 'node.exe', pid: '7892', mem: '38,400 K' },
        ];
      }
      const lines = [
        '',
        'Image Name                     PID Session Name        Session#    Mem Usage',
        '========================= ======== ================ =========== ============',
      ];
      for (const p of ctx.fs.processes) {
        lines.push(
          `${pad(p.name, 25)} ${pad(String(p.pid), 8, true)} ${pad('Console', 16)} ${pad('1', 11, true)} ${pad(p.mem, 12, true)}`
        );
      }
      return lines;
    },
  },

  taskkill: {
    usage: 'TASKKILL [/F] [/IM imagename | /PID processid]',
    help: 'Terminates tasks by process id (PID) or image name.',
    fn(args, ctx) {
      if (!args || args.length === 0) throw cmdError('ERROR: Invalid syntax. Specify /IM or /PID.');
      let targetName = null;
      let targetPid = null;
      for (let i = 0; i < args.length; i += 1) {
        const a = args[i].toUpperCase();
        if (a === '/IM' && args[i + 1]) {
          targetName = args[i + 1].toLowerCase();
          i += 1;
        } else if (a.startsWith('/IM:')) {
          targetName = a.slice(4).toLowerCase();
        } else if (a === '/PID' && args[i + 1]) {
          targetPid = args[i + 1];
          i += 1;
        } else if (a.startsWith('/PID:')) {
          targetPid = a.slice(5);
        }
      }
      if (!targetName && !targetPid) {
        const nonFlag = args.find((x) => !x.startsWith('/'));
        if (nonFlag) targetName = nonFlag.toLowerCase();
      }
      if (!targetName && !targetPid) throw cmdError('ERROR: Parameter /IM or /PID required.');

      if (!ctx.fs.processes) {
        ctx.fs.processes = [
          { name: 'System', pid: '4', mem: '140 K' },
          { name: 'smss.exe', pid: '388', mem: '1,024 K' },
          { name: 'csrss.exe', pid: '544', mem: '4,300 K' },
          { name: 'cmd.exe', pid: '4120', mem: '3,480 K' },
          { name: 'explorer.exe', pid: '2140', mem: '45,200 K' },
          { name: 'node.exe', pid: '7892', mem: '38,400 K' },
        ];
      }

      const idx = ctx.fs.processes.findIndex((p) => {
        if (targetName && p.name.toLowerCase() === targetName) return true;
        if (targetPid && String(p.pid) === String(targetPid)) return true;
        return false;
      });

      if (idx === -1) {
        throw cmdError(`ERROR: The process "${targetName || targetPid}" not found.`);
      }

      const killed = ctx.fs.processes.splice(idx, 1)[0];
      return [`SUCCESS: The process "${killed.name}" with PID ${killed.pid} has been terminated.`];
    },
  },

  title: {
    usage: 'TITLE [string]',
    help: 'Sets the window title for a CMD.EXE session.',
    fn(args, ctx) {
      ctx.fs.env.set('TITLE', args.join(' '));
      return [];
    },
  },

  prompt: {
    usage: 'PROMPT [text]',
    help: 'Changes the CMD.EXE prompt.',
    fn(args, ctx) {
      if (args.length === 0) return ['PROMPT=$P$G'];
      ctx.fs.env.set('PROMPT', args.join(' '));
      return [];
    },
  },

  date: {
    usage: 'DATE [/T | date]',
    help: 'Displays or sets the date.',
    fn() {
      return [`The current date is: ${formatWinDate(Date.now()).slice(0, 10)}`];
    },
  },

  time: {
    usage: 'TIME [/T | time]',
    help: 'Displays or sets the system time.',
    fn() {
      const d = new Date();
      return [
        `The current time is: ${String(d.getHours()).padStart(2, '0')}:${String(
          d.getMinutes()
        ).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(
          d.getMilliseconds()
        ).slice(0, 2)}`,
      ];
    },
  },

  help: {
    usage: 'HELP [command]',
    help: 'Provides help information for CMD commands.',
    fn(args, ctx) {
      void ctx;
      if (args.length > 0) {
        const name = args[0].toLowerCase();
        const cmd = COMMANDS[name];
        if (!cmd) {
          throw cmdError(`This command is not supported by the help utility. Try "${args[0]} /?".`);
        }
        return [`For more information on a specific command, type HELP command-name`, cmd.usage, '', cmd.help];
      }
      const lines = [
        'For more information on a specific command, type HELP command-name',
        '',
      ];
      const names = Object.keys(COMMANDS).sort();
      for (const name of names) {
        lines.push(pad(name.toUpperCase(), 10) + COMMANDS[name].help);
      }
      return lines;
    },
  },

  exit: {
    usage: 'EXIT',
    help: 'Quits the CMD.EXE program.',
    fn() {
      return [''];
    },
  },

  rem: {
    usage: 'REM [comment]',
    help: 'Records comments in batch files.',
    fn() {
      return [];
    },
  },

  pause: {
    usage: 'PAUSE',
    help: 'Suspends processing of a batch program.',
    fn() {
      return ['Press any key to continue . . .'];
    },
  },

  fc: {
    usage: 'FC [/N] [/L] file1 file2',
    help: 'Compares two files or sets of files and displays the differences.',
    fn(args, ctx) {
      const { rest } = parseFlags(args);
      if (rest.length < 2) throw cmdError('The syntax of the command is incorrect.');
      const a = ctx.fs.readFile(rest[0]).split(/\r?\n/);
      const b = ctx.fs.readFile(rest[1]).split(/\r?\n/);
      const lines = [`Comparing files ${rest[0]} and ${rest[1]}`];
      const max = Math.max(a.length, b.length);
      let diffs = 0;
      for (let i = 0; i < max; i += 1) {
        if ((a[i] || '') !== (b[i] || '')) {
          diffs += 1;
          lines.push(`***** ${rest[0]}`);
          lines.push(a[i] || '');
          lines.push(`***** ${rest[1]}`);
          lines.push(b[i] || '');
          lines.push('*****');
        }
      }
      if (diffs === 0) lines.push('FC: no differences encountered');
      return lines;
    },
  },

  if: {
    usage: 'IF [NOT] EXIST filename command\nIF [/I] [NOT] string1==string2 command',
    help: 'Performs conditional processing in batch programs.',
    fn() {
      return ['The syntax of the command is incorrect.'];
    },
  },
};

// Aliases commonly typed by Windows users
COMMANDS.chdir.help = COMMANDS.cd.help;
COMMANDS.mkdir.help = COMMANDS.md.help;
COMMANDS.rmdir.help = COMMANDS.rd.help;
COMMANDS.erase.help = COMMANDS.del.help;
COMMANDS.rename.help = COMMANDS.ren.help;

/**
 * Look up a command by name (case-insensitive).
 *
 * @param {string} name
 * @returns {{ name: string, def: (typeof COMMANDS)[string] } | null}
 */
export function lookupCommand(name) {
  const key = name.toLowerCase();
  if (COMMANDS[key]) return { name: key, def: COMMANDS[key] };
  // allow /? style by stripping
  const bare = key.replace(/\/\?$/, '');
  if (COMMANDS[bare]) return { name: bare, def: COMMANDS[bare] };
  return null;
}

/**
 * @returns {string[]}
 */
export function commandNames() {
  return Object.keys(COMMANDS).sort();
}

export { cmdError, parseFlags, formatWinDate, pad };
