/**
 * CMD line parser and executor.
 *
 * Handles quoting, redirection (> >>), pipes (|), and chaining (&& || &).
 */

'use strict';

import { lookupCommand, tokenize, cmdError, COMMANDS } from './commands.js';

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
 * @returns {{ command: string, redirect: { mode: 'out' | 'append', target: string } | null, stdinFile: string | null }}
 */
function parseRedirection(segment) {
  let command = segment;
  /** @type {{ mode: 'out' | 'append', target: string } | null} */
  let redirect = null;
  /** @type {string | null} */
  let stdinFile = null;

  // > and >> (not >&1 etc.)
  const appendMatch = command.match(/(.*?)>>\s*(\S.*)$/);
  const outMatch = command.match(/(.*?)>\s*(\S.*)$/);
  const inMatch = command.match(/(.*?)<\s*(\S.*)$/);

  if (appendMatch && (!outMatch || appendMatch.index <= outMatch.index)) {
    command = appendMatch[1];
    redirect = { mode: 'append', target: appendMatch[2].trim().replace(/^"|"$/g, '') };
  } else if (outMatch) {
    command = outMatch[1];
    redirect = { mode: 'out', target: outMatch[2].trim().replace(/^"|"$/g, '') };
  }
  if (inMatch && inMatch[1] === command.trim()) {
    command = inMatch[1];
    stdinFile = inMatch[2].trim().replace(/^"|"$/g, '');
  } else if (inMatch) {
    // stdin still useful
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

  const expandedTokens = tokenize(expanded);
  let name = expandedTokens[0];
  const args = expandedTokens.slice(1);

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

  let lines = found.def.fn(args, cmdCtx, command);

  if (redirect) {
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
    } catch (err) {
      ok = false;
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
  ]);
  if (!metaNames.has(name)) return null;
  // `show solution` is two tokens
  if (name === 'show') {
    return { name: 'show', args: tokens.slice(1) };
  }
  return { name, args: tokens.slice(1) };
}

export { executeSimple, executePipeline, parseRedirection, splitOperators };
