/**
 * Virtual filesystem for learn-cmd.
 *
 * Models a single Windows drive (C:) as an in-memory tree so CMD commands
 * can be executed safely in the browser without touching the real disk.
 */

'use strict';

/** @typedef {'file' | 'dir'} NodeType */

/**
 * @typedef {Object} VfsNode
 * @property {NodeType} type
 * @property {string} name
 * @property {VfsNode | null} parent
 * @property {Map<string, VfsNode>} [children]
 * @property {string} [content]
 * @property {number} modified
 * @property {string} attrs
 */

const DRIVE = 'C:';
const ROOT_PATH = 'C:\\';

/**
 * @param {string} name
 * @param {NodeType} type
 * @param {string} [content]
 * @returns {VfsNode}
 */
function createNode(name, type, content) {
  /** @type {VfsNode} */
  const node = {
    type,
    name,
    parent: null,
    modified: Date.now(),
    attrs: type === 'dir' ? 'D' : 'A',
  };
  if (type === 'dir') {
    node.children = new Map();
  } else {
    node.content = content == null ? '' : String(content);
  }
  return node;
}

/**
 * Normalize a Windows-style path to an absolute path string.
 *
 * @param {string} input
 * @param {string} cwd
 * @returns {string}
 */
function normalizePath(input, cwd) {
  if (!input) return cwd;
  let raw = String(input).replace(/\//g, '\\').trim();
  if (!raw) return cwd;

  // Drive-relative like C:foo
  if (/^[A-Za-z]:/.test(raw) && raw.length > 2 && raw[2] !== '\\') {
    raw = raw.slice(0, 2) + '\\' + raw.slice(2);
  }

  /** @type {string[]} */
  let base;
  /** @type {string} */
  let rest;

  if (/^[A-Za-z]:\\/.test(raw)) {
    base = ['C:'];
    rest = raw.slice(3);
  } else if (raw.startsWith('\\')) {
    base = ['C:'];
    rest = raw.slice(1);
  } else if (/^[A-Za-z]:$/.test(raw)) {
    return ROOT_PATH;
  } else {
    const trimmedCwd = cwd.replace(/\\+$/, '');
    base = trimmedCwd === 'C:' ? ['C:'] : trimmedCwd.split('\\').filter(Boolean);
    rest = raw;
  }

  for (const part of rest.split('\\')) {
    if (!part || part === '.') continue;
    if (part === '..') {
      if (base.length > 1) base.pop();
    } else {
      base.push(part);
    }
  }
  return base.length <= 1 ? ROOT_PATH : base.join('\\');
}

/**
 * Split a path into parent directory path and leaf name.
 *
 * @param {string} path
 * @param {string} [cwd] working directory used when `path` is relative
 * @returns {{ parent: string, name: string }}
 */
function splitPath(path, cwd) {
  const baseCwd = cwd || ROOT_PATH;
  const norm = normalizePath(path, baseCwd);
  if (norm === ROOT_PATH) return { parent: ROOT_PATH, name: '' };
  const idx = norm.lastIndexOf('\\');
  const parent = idx <= 2 ? ROOT_PATH : norm.slice(0, idx);
  const name = norm.slice(idx + 1);
  return { parent: parent === 'C:' ? ROOT_PATH : parent, name };
}

/**
 * Convert a glob (Windows wildcards) to a RegExp.
 *
 * @param {string} pattern
 * @returns {RegExp}
 */
function globToRegExp(pattern) {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp('^' + escaped + '$', 'i');
}

class VirtualFileSystem {
  constructor(spec) {
    /** @type {VfsNode} */
    this.root = createNode('C:', 'dir');
    /** @type {string} */
    this.cwd = 'C:\\Users\\student';
    /** @type {Map<string, string>} */
    this.env = new Map([
      ['ComSpec', 'C:\\Windows\\System32\\cmd.exe'],
      ['SystemRoot', 'C:\\Windows'],
      ['windir', 'C:\\Windows'],
      ['PATH', 'C:\\Windows\\System32;C:\\Windows'],
      ['PATHEXT', '.COM;.EXE;.BAT;.CMD;.VBS;.JS'],
      ['TEMP', 'C:\\Users\\student\\AppData\\Local\\Temp'],
      ['TMP', 'C:\\Users\\student\\AppData\\Local\\Temp'],
      ['USERNAME', 'student'],
      ['USERPROFILE', 'C:\\Users\\student'],
      ['HOMEDRIVE', 'C:'],
      ['HOMEPATH', '\\Users\\student'],
      ['PROMPT', '$P$G'],
      ['OS', 'Windows_NT'],
    ]);
    /** @type {string[]} */
    this.drives = [DRIVE];
    /** @type {Array<{ name: string, pid: string, mem: string }> | null} */
    this.processes = null;
    /** @type {string[] | null} */
    this.dirStack = null;
    this.load(spec || defaultFsSpec());
  }

  /**
   * Rebuild the tree from a declarative spec.
   * Files map to string values; directories map to nested objects.
   *
   * @param {Record<string, unknown>} spec
   */
  load(spec) {
    this.root = createNode('C:', 'dir');
    /** @param {VfsNode} dir @param {Record<string, unknown>} obj */
    const build = (dir, obj) => {
      for (const [name, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          const file = createNode(name, 'file', value);
          file.parent = dir;
          dir.children.set(name.toLowerCase(), file);
        } else if (value && typeof value === 'object') {
          const sub = createNode(name, 'dir');
          sub.parent = dir;
          dir.children.set(name.toLowerCase(), sub);
          build(sub, /** @type {Record<string, unknown>} */ (value));
        }
      }
    };
    build(this.root, spec);
    this.ensureDefaultProfile();
  }

  ensureDefaultProfile() {
    const profile = this.resolve('C:\\Users\\student');
    if (!profile) {
      this.ensurePath('C:\\Users\\student');
    }
    const cwdNode = this.resolve(this.cwd);
    if (!cwdNode || cwdNode.type !== 'dir') {
      this.cwd = 'C:\\Users\\student';
    }
  }

  /**
   * Create intermediate directories for a path and return the leaf directory.
   *
   * @param {string} path
   * @returns {VfsNode}
   */
  ensurePath(path) {
    const norm = normalizePath(path, this.cwd);
    const parts = norm === ROOT_PATH ? [] : norm.split('\\').slice(1);
    let node = this.root;
    for (const part of parts) {
      const key = part.toLowerCase();
      let next = node.children.get(key);
      if (!next) {
        next = createNode(part, 'dir');
        next.parent = node;
        node.children.set(key, next);
      } else if (next.type !== 'dir') {
        throw new Error(`A subdirectory or file ${part} already exists.`);
      }
      node = next;
    }
    return node;
  }

  /**
   * Resolve a path to a node, or null if missing.
   *
   * @param {string} path
   * @returns {VfsNode | null}
   */
  resolve(path) {
    if (!path) return this.resolve(this.cwd);
    const trimmed = String(path).trim();
    if (trimmed.toLowerCase() === 'nul' || trimmed.toLowerCase() === '\\nul') {
      return createNode('nul', 'file', '');
    }
    const norm = normalizePath(path, this.cwd);
    if (norm === ROOT_PATH) return this.root;
    const parts = norm.split('\\').slice(1);
    let node = this.root;
    for (const part of parts) {
      const key = part.toLowerCase();
      const next = node.children.get(key);
      if (!next) return null;
      node = next;
    }
    return node;
  }

  /**
   * @param {string} path
   * @returns {VfsNode}
   */
  resolveDir(path) {
    const node = this.resolve(path);
    if (!node) {
      const err = new Error('The system cannot find the path specified.');
      err.name = 'CmdError';
      throw err;
    }
    if (node.type !== 'dir') {
      const err = new Error('The directory name is invalid.');
      err.name = 'CmdError';
      throw err;
    }
    return node;
  }

  /**
   * List children of a directory, optionally filtered by a wildcard pattern.
   *
   * @param {string} path
   * @param {string} [pattern]
   * @returns {VfsNode[]}
   */
  list(path, pattern) {
    const dir = this.resolveDir(path);
    const nodes = [...dir.children.values()].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    if (!pattern || pattern === '*' || pattern === '*.*') return nodes;
    const re = globToRegExp(pattern);
    return nodes.filter((n) => re.test(n.name));
  }

  /**
   * Create a file (overwrite contents).
   *
   * @param {string} path
   * @param {string} content
   * @returns {VfsNode}
   */
  writeFile(path, content) {
    const trimmed = String(path).trim();
    if (trimmed.toLowerCase() === 'nul' || trimmed.toLowerCase() === '\\nul') {
      return createNode('nul', 'file', '');
    }
    const { parent, name } = splitPath(path, this.cwd);
    if (!name) {
      const err = new Error('The filename, directory name, or volume label syntax is incorrect.');
      err.name = 'CmdError';
      throw err;
    }
    const parentDir = this.resolveDir(parent);
    const key = name.toLowerCase();
    const existing = parentDir.children.get(key);
    if (existing && existing.type === 'dir') {
      const err = new Error('Access is denied.');
      err.name = 'CmdError';
      throw err;
    }
    const file = existing || createNode(name, 'file', '');
    file.type = 'file';
    file.content = content == null ? '' : String(content);
    file.modified = Date.now();
    file.parent = parentDir;
    file.name = name;
    parentDir.children.set(key, file);
    return file;
  }

  /**
   * Append text to a file, creating it if needed.
   *
   * @param {string} path
   * @param {string} content
   * @returns {VfsNode}
   */
  appendFile(path, content) {
    const trimmed = String(path).trim();
    if (trimmed.toLowerCase() === 'nul' || trimmed.toLowerCase() === '\\nul') {
      return createNode('nul', 'file', '');
    }
    const node = this.resolve(path);
    if (node && node.type === 'file') {
      return this.writeFile(path, node.content + content);
    }
    return this.writeFile(path, content);
  }

  /**
   * Create a directory (and parents when needed).
   *
   * @param {string} path
   * @returns {VfsNode}
   */
  mkdir(path) {
    return this.ensurePath(path);
  }

  /**
   * Remove a file or wildcard-matched files in a directory.
   *
   * @param {string} path
   * @param {{ quiet?: boolean, recursive?: boolean }} [opts]
   * @returns {number} number of files deleted
   */
  deleteFile(path, opts = {}) {
    const { parent, name } = splitPath(path, this.cwd);
    const parentDir = this.resolveDir(parent);
    const re = globToRegExp(name || '*');
    let count = 0;
    for (const [key, node] of [...parentDir.children.entries()]) {
      if (node.type !== 'file') continue;
      if (!re.test(node.name)) continue;
      parentDir.children.delete(key);
      count += 1;
    }
    if (count === 0 && !opts.quiet) {
      const err = new Error('Could Not Find ' + normalizePath(path, this.cwd));
      err.name = 'CmdError';
      throw err;
    }
    return count;
  }

  /**
   * Remove a directory. When recursive, also delete descendants.
   *
   * @param {string} path
   * @param {{ recursive?: boolean, quiet?: boolean }} [opts]
   */
  rmdir(path, opts = {}) {
    const node = this.resolveDir(path);
    if (node === this.root) {
      const err = new Error('Access is denied.');
      err.name = 'CmdError';
      throw err;
    }
    if (node.children.size > 0 && !opts.recursive) {
      const err = new Error('The directory is not empty.');
      err.name = 'CmdError';
      throw err;
    }
    const parent = node.parent;
    if (!parent) return;
    parent.children.delete(node.name.toLowerCase());
  }

  /**
   * Copy a file (single file or wildcard into a directory).
   *
   * @param {string} src
   * @param {string} dest
   * @param {{ promptOverwrite?: boolean }} [opts]
   * @returns {string[]} human-readable results
   */
  copyFile(src, dest, opts = {}) {
    void opts;
    const srcPath = normalizePath(src, this.cwd);
    const destPath = normalizePath(dest, this.cwd);
    const { parent: srcParent, name: srcName } = splitPath(srcPath);
    const srcDir = this.resolveDir(srcParent);
    const re = globToRegExp(srcName || '*');
    const matches = [...srcDir.children.values()].filter((n) => n.type === 'file' && re.test(n.name));

    if (matches.length === 0) {
      const err = new Error(`The system cannot find the file specified.`);
      err.name = 'CmdError';
      throw err;
    }

    const destNode = this.resolve(destPath);
    const results = [];
    if (matches.length === 1 && (!destNode || destNode.type === 'file') && !/[?*]/.test(srcName)) {
      const srcFile = matches[0];
      let targetName = splitPath(destPath).name || srcFile.name;
      if (destNode && destNode.type === 'dir') {
        targetName = srcFile.name;
      }
      const targetParentPath =
        destNode && destNode.type === 'dir' ? destPath : splitPath(destPath).parent;
      this.writeFile(normalizePath(targetParentPath + '\\' + targetName, this.cwd), srcFile.content);
      results.push(`        1 file(s) copied.`);
      return results;
    }

    // Directory or wildcard destination
    let targetDirPath = destPath;
    if (destNode && destNode.type === 'file') {
      const err = new Error('The file cannot be copied onto itself.');
      err.name = 'CmdError';
      throw err;
    }
    if (!destNode) {
      // If dest looks like a file path (has extension and no trailing sep), treat as single rename
      if (matches.length === 1 && splitPath(destPath).name.includes('.')) {
        this.writeFile(destPath, matches[0].content);
        results.push(`        1 file(s) copied.`);
        return results;
      }
      this.ensurePath(targetDirPath);
    }
    for (const file of matches) {
      this.writeFile(normalizePath(targetDirPath + '\\' + file.name, this.cwd), file.content);
    }
    results.push(`        ${matches.length} file(s) copied.`);
    return results;
  }

  /**
   * Move or rename files/directories.
   *
   * @param {string} src
   * @param {string} dest
   * @returns {string[]}
   */
  move(src, dest) {
    const srcPath = normalizePath(src, this.cwd);
    const destPath = normalizePath(dest, this.cwd);
    const srcNode = this.resolve(srcPath);
    if (!srcNode) {
      const err = new Error('The system cannot find the file specified.');
      err.name = 'CmdError';
      throw err;
    }
    const destNode = this.resolve(destPath);

    if (srcNode.type === 'dir') {
      if (destNode && destNode.type === 'dir') {
        // move dir into dest dir
        const target = normalizePath(destPath + '\\' + srcNode.name, this.cwd);
        this.relink(srcNode, target);
      } else if (destNode && destNode.type === 'file') {
        const err = new Error('Cannot move directory to a file.');
        err.name = 'CmdError';
        throw err;
      } else {
        this.relink(srcNode, destPath);
      }
      return [`        1 dir(s) moved.`];
    }

    // file
    if (destNode && destNode.type === 'dir') {
      const target = normalizePath(destPath + '\\' + srcNode.name, this.cwd);
      this.relink(srcNode, target);
    } else {
      this.relink(srcNode, destPath);
    }
    return [`        1 file(s) moved.`];
  }

  /**
   * Relink an existing node to a new path.
   *
   * @param {VfsNode} node
   * @param {string} newPath
   */
  relink(node, newPath) {
    const { parent, name } = splitPath(newPath);
    const parentDir = this.resolveDir(parent);
    if (node.parent) {
      node.parent.children.delete(node.name.toLowerCase());
    }
    node.name = name;
    node.parent = parentDir;
    node.modified = Date.now();
    parentDir.children.set(name.toLowerCase(), node);
  }

  /**
   * Rename a file or directory.
   *
   * @param {string} src
   * @param {string} newName
   */
  rename(src, newName) {
    const srcPath = normalizePath(src, this.cwd);
    const node = this.resolve(srcPath);
    if (!node) {
      const err = new Error('The system cannot find the file specified.');
      err.name = 'CmdError';
      throw err;
    }
    if (/[\\/]/.test(newName)) {
      const err = new Error('The syntax of the command is incorrect.');
      err.name = 'CmdError';
      throw err;
    }
    const parent = node.parent;
    const key = newName.toLowerCase();
    if (parent.children.has(key) && parent.children.get(key) !== node) {
      const err = new Error('A duplicate file name exists, or the file cannot be found.');
      err.name = 'CmdError';
      throw err;
    }
    parent.children.delete(node.name.toLowerCase());
    node.name = newName;
    parent.children.set(key, node);
    node.modified = Date.now();
  }

  /**
   * Read file contents as text.
   *
   * @param {string} path
   * @returns {string}
   */
  readFile(path) {
    const trimmed = String(path).trim();
    if (trimmed.toLowerCase() === 'nul' || trimmed.toLowerCase() === '\\nul') {
      return '';
    }
    const node = this.resolve(path);
    if (!node) {
      const err = new Error('The system cannot find the file specified.');
      err.name = 'CmdError';
      throw err;
    }
    if (node.type !== 'file') {
      const err = new Error('Access is denied.');
      err.name = 'CmdError';
      throw err;
    }
    return node.content;
  }

  /**
   * Expand %VAR% references in a string.
   *
   * @param {string} text
   * @returns {string}
   */
  expandEnv(text) {
    return text.replace(/%([^%]+)%/g, (match, name) => {
      const val = this.getEnv(name);
      if (val !== null) return val;
      if (String(name).toLowerCase() === 'errorlevel') return '0';
      return match;
    });
  }

  /**
   * @param {string} name
   * @returns {string | null}
   */
  getEnv(name) {
    if (this.env.has(name)) return this.env.get(name) ?? null;
    const lower = [...this.env.keys()].find((k) => k.toLowerCase() === name.toLowerCase());
    return lower ? this.env.get(lower) ?? null : null;
  }

  /**
   * @param {string} name
   * @param {string} value
   */
  setEnv(name, value) {
    this.env.set(name, String(value));
  }

  /**
   * Serialize the tree to a plain object (files: string, dirs: object).
   *
   * @param {VfsNode} [node]
   * @returns {Record<string, unknown>}
   */
  serialize(node) {
    const start = node || this.root;
    /** @param {VfsNode} n @returns {unknown} */
    const conv = (n) => {
      if (n.type === 'file') return n.content;
      /** @type {Record<string, unknown>} */
      const obj = {};
      for (const child of n.children.values()) {
        obj[child.name] = conv(child);
      }
      return obj;
    };
    if (start === this.root) {
      /** @type {Record<string, unknown>} */
      const obj = {};
      for (const child of this.root.children.values()) {
        obj[child.name] = conv(child);
      }
      return obj;
    }
    return { [start.name]: conv(start) };
  }

  /**
   * Deep clone this filesystem (including cwd and env).
   *
   * @returns {VirtualFileSystem}
   */
  clone() {
    const fs = new VirtualFileSystem(this.serialize());
    fs.cwd = this.cwd;
    fs.env = new Map(this.env);
    if (this.processes) fs.processes = JSON.parse(JSON.stringify(this.processes));
    if (this.dirStack) fs.dirStack = [...this.dirStack];
    return fs;
  }

  /**
   * Snapshot for undo.
   *
   * @returns {{ spec: Record<string, unknown>, cwd: string, env: Map<string, string>, processes?: Array<{ name: string, pid: string, mem: string }> | null, dirStack?: string[] | null }}
   */
  snapshot() {
    return {
      spec: this.serialize(),
      cwd: this.cwd,
      env: new Map(this.env),
      processes: this.processes ? JSON.parse(JSON.stringify(this.processes)) : null,
      dirStack: this.dirStack ? [...this.dirStack] : null,
    };
  }

  /**
   * Restore a snapshot.
   *
   * @param {{ spec: Record<string, unknown>, cwd: string, env: Map<string, string>, processes?: Array<{ name: string, pid: string, mem: string }> | null, dirStack?: string[] | null }} snap
   */
  restore(snap) {
    this.load(snap.spec);
    this.cwd = snap.cwd;
    this.env = new Map(snap.env);
    this.processes = snap.processes ? JSON.parse(JSON.stringify(snap.processes)) : null;
    this.dirStack = snap.dirStack ? [...snap.dirStack] : null;
    this.ensureDefaultProfile();
  }

  /**
   * Compare this tree to a goal spec. Optionally also compare cwd.
   *
   * @param {Record<string, unknown>} goal
   * @param {string} [goalCwd]
   * @returns {{ ok: boolean, missing: string[], extra: string[], cwdMismatch: boolean }}
   */
  diffGoal(goal, goalCwd) {
    return this.diffGoalWithCommands(goal, goalCwd, null);
  }

  /**
   * Compare tree/cwd and optionally require that given commands were run.
   *
   * @param {Record<string, unknown>} goal
   * @param {string} [goalCwd]
   * @param {string[] | null} [goalCommands] normalized command lines that must appear in history
   * @param {string[]} [history]
   * @returns {{ ok: boolean, missing: string[], extra: string[], cwdMismatch: boolean, missingCommands: string[] }}
   */
  diffGoalWithCommands(goal, goalCwd, goalCommands, history) {
    const fsDiff = this.diffGoalCore(goal, goalCwd);
    /** @type {string[]} */
    const missingCommands = [];
    if (goalCommands && goalCommands.length) {
      for (const need of goalCommands) {
        if (!isGoalCommandSatisfied(need, history, this)) {
          missingCommands.push(need);
        }
      }
    }
    return {
      ...fsDiff,
      ok: fsDiff.ok && missingCommands.length === 0,
      missingCommands,
    };
  }

  /**
   * @param {Record<string, unknown>} goal
   * @param {string} [goalCwd]
   * @returns {{ ok: boolean, missing: string[], extra: string[], cwdMismatch: boolean }}
   */
  diffGoalCore(goal, goalCwd) {
    /** @param {Record<string, unknown>} spec @param {string} prefix @returns {Map<string, string>} */
    const flatten = (spec, prefix) => {
      /** @type {Map<string, string>} */
      const map = new Map();
      for (const [name, value] of Object.entries(spec)) {
        const path = prefix ? prefix + '\\' + name : name;
        if (typeof value === 'string') {
          map.set(path.toLowerCase(), 'file:' + value);
        } else {
          map.set(path.toLowerCase(), 'dir');
          for (const [k, v] of flatten(/** @type {Record<string, unknown>} */ (value), path)) {
            map.set(k, v);
          }
        }
      }
      return map;
    };

    const actual = flatten(this.serialize(), '');
    const expected = flatten(goal, '');
    const missing = [];
    const extra = [];
    for (const [key, val] of expected) {
      if (!actual.has(key)) missing.push(key);
      else if (actual.get(key) !== val) missing.push(key + ' (content differs)');
    }
    for (const key of actual.keys()) {
      if (!expected.has(key)) extra.push(key);
    }
    const cwdMismatch = goalCwd
      ? normalizePath(goalCwd, ROOT_PATH).toLowerCase() !== this.cwd.toLowerCase()
      : false;
    return {
      ok: missing.length === 0 && extra.length === 0 && !cwdMismatch,
      missing,
      extra,
      cwdMismatch,
    };
  }
}

/**
 * Default sandbox filesystem — a small Windows-like profile.
 *
 * @returns {Record<string, unknown>}
 */
function defaultFsSpec() {
  return {
    Users: {
      student: {
        'notes.txt': 'remember to learn CMD\n',
        Documents: {
          'todo.txt': '1. practice dir\n2. practice cd\n',
        },
        Desktop: {},
        Downloads: {},
      },
    },
    Windows: {
      System32: {
        'cmd.exe': 'binary',
        'where.exe': 'binary',
      },
    },
    'Program Files': {},
  };
}

/**
 * Normalize a command string for goal-matching (trim, collapse spaces, lower).
 *
 * @param {string} command
 * @returns {string}
 */
function normalizeCommand(command) {
  return String(command)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/"/g, '')
    .toLowerCase();
}

/**
 * Test whether a goal command requirement is satisfied semantically by execution history or state.
 *
 * @param {string} need
 * @param {string[]} history
 * @param {VirtualFileSystem} fs
 * @returns {boolean}
 */
export function isGoalCommandSatisfied(need, history, fs) {
  const normNeed = normalizeCommand(need);
  const rawHistory = history || [];
  const ran = new Set(rawHistory.map((h) => normalizeCommand(h)));

  // Direct match
  if (ran.has(normNeed)) return true;

  // Split chained need command (e.g. "date /t & time /t" or "cmd1 && cmd2")
  const subNeeds = need.split(/[&|]+/).map((s) => s.trim()).filter(Boolean);
  if (subNeeds.length > 1) {
    const allSubMet = subNeeds.every((sn) => isGoalCommandSatisfied(sn, history, fs));
    if (allSubMet) return true;
  }

  // 1. ECHO: any echo command with text
  if (normNeed.startsWith('echo ')) {
    return rawHistory.some((h) => /^echo\s+\S+/i.test(h.trim()));
  }

  // 2. DIR: any dir or ls command
  if (normNeed === 'dir' || normNeed.startsWith('dir ')) {
    return rawHistory.some((h) => /^(dir|ls)(\s+.*)?$/i.test(h.trim()));
  }

  // 3. TYPE: any type, more, or cat reading the specified file
  if (normNeed.startsWith('type ')) {
    const targetFile = normNeed.slice(5).trim();
    const esc = targetFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return rawHistory.some((h) => new RegExp(`^(type|more|cat)\\s+.*${esc}`, 'i').test(h.trim()));
  }

  // 4. TREE: any tree command
  if (normNeed === 'tree' || normNeed.startsWith('tree ')) {
    return rawHistory.some((h) => /^tree(\s+.*)?$/i.test(h.trim()));
  }

  // 5. FC: any fc comparison of the two files
  if (normNeed.startsWith('fc ')) {
    return rawHistory.some((h) => /^fc\s+.*a\.txt.*b\.txt/i.test(h.trim()) || /^fc\s+.*b\.txt.*a\.txt/i.test(h.trim()));
  }

  // 6. FIND: searching for text in file
  if (normNeed.startsWith('find ') || normNeed.startsWith('findstr ')) {
    if (normNeed.includes('todo')) {
      return rawHistory.some((h) => /^(find|findstr|grep)\s+.*todo.*notes\.txt/i.test(h.trim()));
    }
    if (normNeed.includes('error')) {
      return rawHistory.some((h) => /^(find|findstr|grep)\s+.*error.*app\.log/i.test(h.trim()));
    }
    return rawHistory.some((h) => /^(find|findstr|grep)\s+/i.test(h.trim()));
  }

  // 7. DATE & TIME
  if (normNeed.startsWith('date')) {
    return rawHistory.some((h) => /^date(\s+.*)?$/i.test(h.trim()));
  }
  if (normNeed.startsWith('time')) {
    return rawHistory.some((h) => /^time(\s+.*)?$/i.test(h.trim()));
  }

  // 8. ATTRIB: check attribute on file or command
  if (normNeed.startsWith('attrib ')) {
    const node = fs.resolve('config.ini') || fs.resolve('release\\app.js');
    if (node && node.attrs && node.attrs.includes('R')) return true;
    return rawHistory.some((h) => /^attrib\s+.*\+r/i.test(h.trim()));
  }

  // 9. TASKKILL: process killed or taskkill command
  if (normNeed.startsWith('taskkill')) {
    if (fs.processes && !fs.processes.some((p) => p.name.toLowerCase() === 'node.exe')) {
      return true;
    }
    return rawHistory.some((h) => /^taskkill\s+.*node/i.test(h.trim()));
  }

  // 10. IF EXIST: lock file gone or condition executed
  if (normNeed.startsWith('if exist')) {
    if (normNeed.includes('lock.tmp')) {
      return fs.resolve('lock.tmp') === null;
    }
    if (normNeed.includes('cache.tmp')) {
      return fs.resolve('cache.tmp') === null;
    }
  }

  // 11. PUSHD / POPD
  if (normNeed.includes('pushd') && normNeed.includes('popd')) {
    return fs.resolve('Documents\\bk.txt') !== null;
  }

  // 12. SORT
  if (normNeed.startsWith('sort')) {
    const node = fs.resolve('ranking.txt');
    if (node && node.content) return true;
    return rawHistory.some((h) => /sort\s+/i.test(h.trim()));
  }

  // 13. WHERE
  if (normNeed.startsWith('where')) {
    const node = fs.resolve('cmd_path.txt');
    if (node && node.content) return true;
    return rawHistory.some((h) => /^where\s+.*cmd/i.test(h.trim()));
  }

  // 14. FOR loops
  if (normNeed.startsWith('for ')) {
    return rawHistory.some((h) => /^for\s+/i.test(h.trim()));
  }

  return false;
}

export {
  VirtualFileSystem,
  normalizePath,
  splitPath,
  globToRegExp,
  createNode,
  defaultFsSpec,
  normalizeCommand,
  ROOT_PATH,
  DRIVE,
};
