/**
 * CMD line parser and executor.
 *
 * Handles quoting, redirection (> >>), pipes (|), and chaining (&& || &).
 */

'use strict';

import { lookupCommand, tokenize, cmdError, COMMANDS } from './commands.js';
import { normalizePath } from './vfs.js';

/** @typedef {import('./commands.js').CmdContext} CmdContext */

/**
 * Split a line by operators while respecting quotes.
 *
 * @param {string} line
 * @param {string[]} operators
 * @returns {{ type: 'text' | 'op', value: string }[]}
 */
function splitOperators(line, operators) {
  const parts = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '^') {
      if (i + 1 < line.length) {
        current += line[i + 1];
        i += 1;
        continue;
      }
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }
    if (!inQuotes) {
      let matched = null;
      for (const op of operators) {
        if (line.startsWith(op, i)) {
          matched = op;
          break;
        }
      }
      if (matched) {
        if (current.trim()) parts.push({ type: 'text', value: current });
        parts.push({ type: 'op', value: matched });
        current = '';
        i += matched.length - 1;
        continue;
      }
    }
    current += ch;
  }
  if (current.trim() || current === '') {
    if (current) parts.push({ type: 'text', value: current });
  }
  return parts;
}

/**
 * Split off redirection targets from a simple command.
 *
 * @param {string} segment
 * @returns {{ command: string, redirect: { mode: 'out' | 'append', target: string, isError?: boolean, mergeStderr?: boolean } | null, stdinFile: string | null }}
 */
function parseRedirection(segment) {
  let command = segment;
  /** @type {{ mode: 'out' | 'append', target: string, isError?: boolean, mergeStderr?: boolean } | null} */
  let redirect = null;
  /** @type {string | null} */
  let stdinFile = null;

  let mergeStderr = false;
  if (/(?:^|\s)2>&1\s*$/.test(command)) {
    command = command.replace(/\s*2>&1\s*$/, '');
    mergeStderr = true;
  }

  // Handle 2> (stderr redirection)
  const errMatch = command.match(/(.*?)(?:^|\s)2>>\s*(\S.*)$/);
  const errOutMatch = command.match(/(.*?)(?:^|\s)2>\s*(\S.*)$/);
  if (errMatch) {
    command = errMatch[1];
    redirect = { mode: 'append', target: errMatch[2].trim().replace(/^"|"$/g, ''), isError: true };
  } else if (errOutMatch) {
    command = errOutMatch[1];
    redirect = { mode: 'out', target: errOutMatch[2].trim().replace(/^"|"$/g, ''), isError: true };
  } else {
    // > and >>
    const appendMatch = command.match(/(.*?)>>\s*(\S.*)$/);
    const outMatch = command.match(/(.*?)>\s*(\S.*)$/);

    if (appendMatch && (!outMatch || appendMatch.index <= outMatch.index)) {
      command = appendMatch[1];
      redirect = { mode: 'append', target: appendMatch[2].trim().replace(/^"|"$/g, ''), mergeStderr };
    } else if (outMatch) {
      command = outMatch[1];
      redirect = { mode: 'out', target: outMatch[2].trim().replace(/^"|"$/g, ''), mergeStderr };
    }
  }

  const inMatch = command.match(/(.*?)<\s*(\S.*)$/);
  if (inMatch && inMatch[1] === command.trim()) {
    command = inMatch[1];
    stdinFile = inMatch[2].trim().replace(/^"|"$/g, '');
  } else if (inMatch) {
    const reparse = command.match(/^(.*?)<\s*(\S.*)$/);
    if (reparse) {
      command = reparse[1];
      stdinFile = reparse[2].trim().replace(/^"|"$/g, '');
    }
  }

  return { command: command.trim(), redirect, stdinFile };
}

/**
 * Execute a single simple command (no chaining).
 *
 * @param {string} segment
 * @param {CmdContext} ctx
 * @param {string} [stdinText]
 * @returns {string[]}
 */
function executeSimple(segment, ctx, stdinText) {
  const { command, redirect, stdinFile } = parseRedirection(segment);
  if (!command.trim()) return [];

  // Support `command /?`
  const tokens = tokenize(command);
  if (tokens.length === 0) return [];

  // Environment variable expansion on the raw line before tokenizing again
  const expanded = ctx.fs.expandEnv(command);

  // IF command support (IF [NOT] EXIST ..., IF [/I] [NOT] "A"=="B" ...)
  const ifExistMatch = expanded.match(/^if\s+(not\s+)?exist\s+(\S+)\s+(.+)$/i);
  if (ifExistMatch) {
    const isNot = Boolean(ifExistMatch[1]);
    const target = ifExistMatch[2].replace(/^"|"$/g, '');
    const thenCmd = ifExistMatch[3];
    const exists = ctx.fs.resolve(target) !== null;
    const cond = isNot ? !exists : exists;
    if (cond) {
      const out = executePipeline(thenCmd, ctx);
      if (redirect) {
        const text = out.join('\n') + (out.length ? '\n' : '');
        if (redirect.mode === 'append') {
          ctx.fs.appendFile(redirect.target, text);
        } else {
          ctx.fs.writeFile(redirect.target, text);
        }
        return [];
      }
      return out;
    }
    return [];
  }

  const ifEqMatch = expanded.match(/^if\s+(\/i\s+)?(not\s+)?(".*?"|\S+)\s*==\s*(".*?"|\S+)\s+(.+)$/i);
  if (ifEqMatch) {
    const ignoreCase = Boolean(ifEqMatch[1]);
    const isNot = Boolean(ifEqMatch[2]);
    let left = ifEqMatch[3].replace(/^"|"$/g, '');
    let right = ifEqMatch[4].replace(/^"|"$/g, '');
    const thenCmd = ifEqMatch[5];
    if (ignoreCase) {
      left = left.toLowerCase();
      right = right.toLowerCase();
    }
    const equal = left === right;
    const cond = isNot ? !equal : equal;
    if (cond) {
      const out = executePipeline(thenCmd, ctx);
      if (redirect) {
        const text = out.join('\n') + (out.length ? '\n' : '');
        if (redirect.mode === 'append') {
          ctx.fs.appendFile(redirect.target, text);
        } else {
          ctx.fs.writeFile(redirect.target, text);
        }
        return [];
      }
      return out;
    }
    return [];
  }

  const ifErrorMatch = expanded.match(/^if\s+(not\s+)?errorlevel\s+(\d+)\s+(.+)$/i);
  if (ifErrorMatch) {
    const isNot = Boolean(ifErrorMatch[1]);
    const threshold = parseInt(ifErrorMatch[2], 10);
    const thenCmd = ifErrorMatch[3];
    const currentCode = parseInt(ctx.fs.getEnv('ERRORLEVEL') || '0', 10);
    const cond = isNot ? currentCode < threshold : currentCode >= threshold;
    if (cond) {
      const out = executePipeline(thenCmd, ctx);
      if (redirect) {
        const text = out.join('\n') + (out.length ? '\n' : '');
        if (redirect.mode === 'append') {
          ctx.fs.appendFile(redirect.target, text);
        } else {
          ctx.fs.writeFile(redirect.target, text);
        }
        return [];
      }
      return out;
    }
    return [];
  }

  // FOR /F ["options"] %var IN (source) DO command
  const forFMatch = command.match(/^for\s+\/f(?:\s+"([^"]*)")?\s+(%{1,2}[a-zA-Z])\s+in\s*\(([^)]+)\)\s+do\s+(.+)$/i);
  if (forFMatch) {
    const optStr = forFMatch[1] || '';
    const varToken = forFMatch[2];
    const baseVarChar = varToken.slice(-1);
    const isDoublePercent = varToken.startsWith('%%');
    const sourceRaw = forFMatch[3].trim();
    const doCmd = forFMatch[4].trim();

    let delims = ' \t';
    let tokenList = [1];
    let skipCount = 0;
    let eolChar = ';';

    if (optStr) {
      const eolMatch = optStr.match(/eol=([^\s"])/i);
      if (eolMatch) eolChar = eolMatch[1];
      const skipMatch = optStr.match(/skip=(\d+)/i);
      if (skipMatch) skipCount = parseInt(skipMatch[1], 10) || 0;
      const delimsMatch = optStr.match(/delims=([^"]*?)(?:\s+tokens=|\s+skip=|\s+eol=|$)/i);
      if (delimsMatch) {
        delims = delimsMatch[1] === '' ? '' : delimsMatch[1];
      }
      const tokensMatch = optStr.match(/tokens=([0-9,\-*]+)/i);
      if (tokensMatch) {
        tokenList = [];
        const rawToks = tokensMatch[1].split(',');
        for (const rt of rawToks) {
          if (rt === '*') tokenList.push('*');
          else if (rt.includes('-')) {
            const [s, e] = rt.split('-').map(Number);
            for (let k = s; k <= e; k += 1) tokenList.push(k);
          } else {
            const n = parseInt(rt, 10);
            if (!Number.isNaN(n)) tokenList.push(n);
          }
        }
      }
    }

    let inputLines = [];
    if (sourceRaw.startsWith("'") && sourceRaw.endsWith("'")) {
      const sub = sourceRaw.slice(1, -1);
      inputLines = executePipeline(sub, ctx);
    } else if (sourceRaw.startsWith('"') && sourceRaw.endsWith('"')) {
      inputLines = [sourceRaw.slice(1, -1)];
    } else {
      const fileNames = sourceRaw.split(/[\s,]+/).filter(Boolean);
      for (const fn of fileNames) {
        try {
          const abs = ctx.fs.resolve(fn.replace(/^"|"$/g, ''));
          if (abs && abs.type === 'file') {
            inputLines.push(...abs.content.split(/\r?\n/));
          }
        } catch {}
      }
    }

    if (skipCount > 0) {
      inputLines = inputLines.slice(skipCount);
    }

    const outLines = [];
    for (const line of inputLines) {
      const trimmed = line.trim();
      if (!trimmed || (eolChar && trimmed.startsWith(eolChar))) continue;

      let parts = [];
      if (delims === '') {
        parts = [line];
      } else {
        const delimRegex = new RegExp(`[${delims.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}]+`);
        parts = line.split(delimRegex).filter(Boolean);
      }

      let subCmd = doCmd;
      const varCharCode = baseVarChar.charCodeAt(0);

      for (let tIdx = 0; tIdx < tokenList.length; tIdx += 1) {
        const tokSpec = tokenList[tIdx];
        const curVarChar = String.fromCharCode(varCharCode + tIdx);
        const curVarPattern = isDoublePercent ? `%%${curVarChar}` : `%${curVarChar}`;
        const curVarRegex = new RegExp(curVarPattern, 'g');

        let val = '';
        if (tokSpec === '*') {
          val = parts.slice(tIdx).join(' ');
        } else if (typeof tokSpec === 'number') {
          val = parts[tokSpec - 1] || '';
        }
        subCmd = subCmd.replace(curVarRegex, val);
      }

      const res = executePipeline(subCmd, ctx);
      outLines.push(...res);
    }

    if (redirect) {
      const text = outLines.join('\n') + (outLines.length ? '\n' : '');
      if (redirect.mode === 'append') {
        ctx.fs.appendFile(redirect.target, text);
      } else {
        ctx.fs.writeFile(redirect.target, text);
      }
      return [];
    }
    return outLines;
  }

  // FOR command support: FOR [%/%%]var IN (set) DO command
  const forMatch = command.match(/^for\s+(\/l\s+)?(%{1,2}[a-zA-Z0-9_])\s+in\s*\(([^)]+)\)\s+do\s+(.+)$/i);
  if (forMatch) {
    const isRange = Boolean(forMatch[1]);
    const varToken = forMatch[2];
    const rawSet = forMatch[3].trim();
    const doCmd = forMatch[4].trim();

    let items = [];
    if (isRange) {
      const nums = rawSet.split(/[,\s]+/).map((n) => parseInt(n.trim(), 10)).filter((n) => !Number.isNaN(n));
      if (nums.length >= 3) {
        const [start, step, end] = nums;
        if (step > 0) {
          for (let val = start; val <= end; val += step) items.push(String(val));
        } else if (step < 0) {
          for (let val = start; val >= end; val += step) items.push(String(val));
        }
      }
    } else {
      const tokens = rawSet.split(/[,\s]+/).filter(Boolean);
      for (const token of tokens) {
        if (token.includes('*') || token.includes('?')) {
          try {
            const matches = ctx.fs.list(ctx.fs.cwd, token);
            if (matches.length > 0) {
              for (const m of matches) items.push(m.name);
            } else {
              items.push(token);
            }
          } catch {
            items.push(token);
          }
        } else {
          items.push(token);
        }
      }
    }

    const outLines = [];
    const varRegex = new RegExp(varToken.replace(/%/g, '\\%'), 'gi');
    for (const item of items) {
      const subCmd = doCmd.replace(varRegex, item);
      const res = executePipeline(subCmd, ctx);
      outLines.push(...res);
    }

    if (redirect) {
      const text = outLines.join('\n') + (outLines.length ? '\n' : '');
      if (redirect.mode === 'append') {
        ctx.fs.appendFile(redirect.target, text);
      } else {
        ctx.fs.writeFile(redirect.target, text);
      }
      return [];
    }
    return outLines;
  }

  const expandedTokens = tokenize(expanded);
  let name = expandedTokens[0];
  const args = expandedTokens.slice(1);

  // Drive selection e.g. "C:" or "c:\"
  if (/^[a-zA-Z]:\\?$/.test(name)) {
    const driveLetter = name[0].toUpperCase();
    if (driveLetter === 'C') {
      return [];
    }
    throw cmdError('The system cannot find the drive specified.');
  }

  // echo. / echo/ / echo\ / echo, / echo; prints a blank line
  if (/^echo[./\\,;]$/i.test(name)) {
    if (redirect) {
      if (redirect.mode === 'append') ctx.fs.appendFile(redirect.target, '\n');
      else ctx.fs.writeFile(redirect.target, '\n');
      return [];
    }
    return [''];
  }

  // Batch script execution (CALL script.bat or direct script.bat / script.cmd)
  let scriptPath = null;
  let scriptArgs = [];
  if (name.toLowerCase() === 'call' && args.length > 0) {
    scriptPath = args[0];
    scriptArgs = args.slice(1);
  } else if (name.toLowerCase().endsWith('.bat') || name.toLowerCase().endsWith('.cmd')) {
    scriptPath = name;
    scriptArgs = args;
  } else if (!lookupCommand(name)) {
    if (ctx.fs.resolve(name + '.bat')) {
      scriptPath = name + '.bat';
      scriptArgs = args;
    } else if (ctx.fs.resolve(name + '.cmd')) {
      scriptPath = name + '.cmd';
      scriptArgs = args;
    }
  }

  if (scriptPath && ctx.fs.resolve(scriptPath)) {
    const content = ctx.fs.readFile(scriptPath);
    const rawLines = content.split(/\r?\n/);
    const outLines = [];

    // Pre-scan labels (:label_name)
    const labelIndices = new Map();
    for (let i = 0; i < rawLines.length; i += 1) {
      const trimmedLine = rawLines[i].trim();
      if (trimmedLine.startsWith(':') && !trimmedLine.startsWith('::')) {
        const lbl = trimmedLine.slice(1).trim().split(/\s+/)[0].toLowerCase();
        if (lbl && !labelIndices.has(lbl)) {
          labelIndices.set(lbl, i);
        }
      }
    }

    let pc = 0;
    let iterations = 0;
    const maxIterations = 2000;
    const callStack = [];

    const scriptNorm = normalizePath(scriptPath, ctx.fs.cwd);
    const scriptFullDir = scriptNorm.includes('\\') ? scriptNorm.replace(/\\[^\\]+$/, '\\') : ctx.fs.cwd + '\\';

    while (pc < rawLines.length && iterations < maxIterations) {
      iterations += 1;
      const sLine = rawLines[pc];
      pc += 1;
      let t = sLine.trim();

      // Skip empty lines, comments, labels
      if (!t || t.toLowerCase() === '@echo off' || t.toLowerCase().startsWith('rem ') || t.startsWith('::') || t.startsWith(':')) {
        continue;
      }

      // Check for EXIT /B
      const exitBMatch = t.match(/^exit\s+\/b(?:\s+(\d+))?/i);
      if (exitBMatch) {
        const code = exitBMatch[1] ? parseInt(exitBMatch[1], 10) : 0;
        ctx.fs.setEnv('ERRORLEVEL', String(code));
        if (callStack.length > 0) {
          pc = callStack.pop();
          continue;
        } else {
          break;
        }
      }

      // Check for CALL :label
      const callLabelMatch = t.match(/^call\s+:([a-zA-Z0-9_\-]+)(.*)$/i);
      if (callLabelMatch) {
        const targetLabel = callLabelMatch[1].toLowerCase();
        if (labelIndices.has(targetLabel)) {
          callStack.push(pc);
          pc = labelIndices.get(targetLabel) + 1;
          continue;
        }
      }

      // Replace batch parameters %0..%9, %* and modifiers
      t = t.replace(/%~?dp0/gi, scriptFullDir);
      t = t.replace(/%0/g, scriptPath);
      t = t.replace(/%\*/g, scriptArgs.join(' '));
      for (let p = 1; p <= 9; p += 1) {
        const val = scriptArgs[p - 1] !== undefined ? scriptArgs[p - 1] : '';
        const rawVal = val.replace(/^"|"$/g, '');
        const filename = rawVal.split('\\').pop() || '';
        const ext = filename.includes('.') ? '.' + filename.split('.').pop() : '';
        const nameNoExt = ext ? filename.slice(0, -ext.length) : filename;

        t = t.replace(new RegExp(`%~dp${p}`, 'gi'), scriptFullDir);
        t = t.replace(new RegExp(`%~nx${p}`, 'gi'), filename);
        t = t.replace(new RegExp(`%~n${p}`, 'gi'), nameNoExt);
        t = t.replace(new RegExp(`%~x${p}`, 'gi'), ext);
        t = t.replace(new RegExp(`%~f${p}`, 'gi'), normalizePath(rawVal, ctx.fs.cwd));
        t = t.replace(new RegExp(`%~${p}`, 'g'), rawVal);
        t = t.replace(new RegExp(`%${p}`, 'g'), val);
      }

      // Check for standalone GOTO
      const gotoMatch = t.match(/^goto\s+:?([a-zA-Z0-9_\-]+)$/i);
      if (gotoMatch) {
        const targetLabel = gotoMatch[1].toLowerCase();
        if (targetLabel === 'eof') {
          if (callStack.length > 0) {
            pc = callStack.pop();
            continue;
          } else {
            break;
          }
        }
        if (labelIndices.has(targetLabel)) {
          pc = labelIndices.get(targetLabel) + 1;
          continue;
        } else {
          outLines.push(`The system cannot find the batch label specified - ${gotoMatch[1]}`);
          break;
        }
      }

      const batchCtx = { ...ctx, inBatch: true };
      const res = executeLine(t, batchCtx);
      const gotoSignal = res.lines.find((l) => l.startsWith('__GOTO__:'));
      if (gotoSignal) {
        const actualLines = res.lines.filter((l) => !l.startsWith('__GOTO__:'));
        outLines.push(...actualLines);
        const targetLabel = gotoSignal.replace('__GOTO__:', '').trim().replace(/^:/, '').toLowerCase();
        if (targetLabel === 'eof') {
          if (callStack.length > 0) {
            pc = callStack.pop();
            continue;
          } else {
            break;
          }
        }
        if (labelIndices.has(targetLabel)) {
          pc = labelIndices.get(targetLabel) + 1;
          continue;
        } else {
          outLines.push(`The system cannot find the batch label specified - ${targetLabel}`);
          break;
        }
      }
      outLines.push(...res.lines);
      if (!res.ok) break;
    }

    if (redirect) {
      const text = outLines.join('\n') + (outLines.length ? '\n' : '');
      if (redirect.mode === 'append') {
        ctx.fs.appendFile(redirect.target, text);
      } else {
        ctx.fs.writeFile(redirect.target, text);
      }
      return [];
    }
    return outLines;
  }

  // Internal meta commands are handled by the app shell via name prefix
  if (name.toLowerCase() === 'cd' && args.length === 0) {
    return COMMANDS.cd.fn([], ctx);
  }

  // /? help
  if (args.includes('/?') || args.includes('-?')) {
    const found = lookupCommand(name);
    if (found) {
      return [
        `For more information on a specific command, type HELP command-name`,
        found.def.usage,
        '',
        found.def.help,
      ];
    }
  }

  const found = lookupCommand(name);
  if (!found) {
    // `echo` special: already handled. Otherwise unknown.
    if (name.toLowerCase() === 'echo') {
      // fallthrough
    } else {
      throw cmdError(`'${name}' is not recognized as an internal or external command,\noperable program or batch file.`);
    }
  }

  const cmdCtx = { ...ctx, stdin: stdinText || '' };
  if (stdinFile) {
    cmdCtx.stdin = ctx.fs.readFile(stdinFile);
  }

  let lines = [];
  try {
    lines = found.def.fn(args, cmdCtx, command);
  } catch (err) {
    if (redirect && (redirect.isError || redirect.mergeStderr)) {
      const errMsg = err && err.message ? err.message : String(err);
      const text = errMsg + (errMsg.endsWith('\n') ? '' : '\n');
      if (redirect.mode === 'append') {
        ctx.fs.appendFile(redirect.target, text);
      } else {
        ctx.fs.writeFile(redirect.target, text);
      }
      if (ctx.fs && typeof ctx.fs.setEnv === 'function') {
        ctx.fs.setEnv('ERRORLEVEL', '1');
      }
      return [];
    }
    throw err;
  }

  if (redirect) {
    if (redirect.isError) {
      if (redirect.mode === 'out') {
        ctx.fs.writeFile(redirect.target, '');
      }
      return lines;
    }
    const text = lines.join('\n') + (lines.length ? '\n' : '');
    if (redirect.mode === 'append') {
      ctx.fs.appendFile(redirect.target, text);
    } else {
      ctx.fs.writeFile(redirect.target, text);
    }
    return [];
  }

  return lines;
}

/**
 * Execute a pipeline of simple commands.
 *
 * @param {string} segment
 * @param {CmdContext} ctx
 * @returns {string[]}
 */
function executePipeline(segment, ctx) {
  const stages = splitOperators(segment, ['|']).filter((p) => p.type === 'text');
  if (stages.length === 0) return [];
  let stdin = '';
  let out = [];
  for (let i = 0; i < stages.length; i += 1) {
    out = executeSimple(stages[i].value, ctx, stdin);
    stdin = out.join('\n');
  }
  return out;
}

/**
 * Execute a full command line (may contain && || & and | and redirection).
 *
 * @param {string} line
 * @param {CmdContext} ctx
 * @returns {{ lines: string[], ok: boolean }}
 */
export function executeLine(line, ctx) {
  const trimmed = line.trim();
  if (!trimmed) return { lines: [], ok: true };
  if (trimmed.toLowerCase().startsWith('rem ') || trimmed.toLowerCase() === 'rem') {
    return { lines: [], ok: true };
  }

  // Meta / app commands — return a special marker for the UI layer
  const meta = detectMeta(trimmed);
  if (meta) {
    return { lines: [], ok: true, meta };
  }

  const segments = splitOperators(trimmed, ['&&', '||', '&']);
  /** @type {string[]} */
  const allLines = [];
  let ok = true;
  let skipUntilOr = false;
  let lastWasAnd = false;

  for (const seg of segments) {
    if (seg.type === 'op') {
      if (seg.value === '&&') {
        lastWasAnd = true;
        skipUntilOr = !ok;
      } else if (seg.value === '||') {
        lastWasAnd = false;
        skipUntilOr = ok;
      } else {
        skipUntilOr = false;
        lastWasAnd = false;
      }
      continue;
    }
    if (skipUntilOr) {
      if (lastWasAnd) continue;
      continue;
    }
    try {
      const out = executePipeline(seg.value, ctx);
      // CLS marker
      if (out.includes('\x0CLS')) {
        allLines.push('\x0CLS');
        // keep only the marker
        continue;
      }
      allLines.push(...out);
      ok = true;
      if (ctx.fs && typeof ctx.fs.setEnv === 'function') {
        if (ctx.fs.getEnv('ERRORLEVEL') !== '1') {
          ctx.fs.setEnv('ERRORLEVEL', '0');
        }
      }
    } catch (err) {
      ok = false;
      if (ctx.fs && typeof ctx.fs.setEnv === 'function') {
        ctx.fs.setEnv('ERRORLEVEL', '1');
      }
      const message = err && err.message ? err.message : String(err);
      allLines.push('ERROR: ' + message);
    }
    lastWasAnd = false;
  }

  return { lines: allLines, ok };
}

/**
 * Detect app-level meta commands that the UI must handle.
 *
 * @param {string} line
 * @returns {{ name: string, args: string[] } | null}
 */
export function detectMeta(line) {
  const tokens = tokenize(line);
  if (tokens.length === 0) return null;
  const name = tokens[0].toLowerCase();
  const metaNames = new Set([
    'levels',
    'level',
    'sandbox',
    'undo',
    'reset',
    'hint',
    'solution',
    'show',
    'build',
    'import',
    'goal',
    'next',
    'prev',
    'progress',
    'golf',
    'share',
    'help!',
    'eli',
    'explain',
    'eli5',
    'eli10',
    'eli15',
    'eli20',
    'eliphd',
    'depth',
  ]);
  if (!metaNames.has(name)) return null;
  // `show solution` is two tokens
  if (name === 'show') {
    return { name: 'show', args: tokens.slice(1) };
  }
  return { name, args: tokens.slice(1) };
}

export { executeSimple, executePipeline, parseRedirection, splitOperators };
