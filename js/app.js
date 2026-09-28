/**
 * learn-cmd application shell.
 *
 * Wires the virtual filesystem, command executor, tree visualization,
 * terminal UI, and level dialogs together.
 */

'use strict';

import { VirtualFileSystem, defaultFsSpec, normalizePath } from './vfs.js';
import { executeLine, detectMeta } from './shell.js';
import { COMMANDS, lookupCommand, commandNames } from './commands.js';
import { renderTree, diffNewPaths } from './tree.js';
import {
  sequences,
  allLevels,
  getLevel,
  locateLevel,
  nextLevel,
  prevLevel,
  baseTree,
  registerCustomLevel,
  listCustomLevels,
  levelFromJson,
} from './levels.js';
import { getDialogFa } from './i18n.js';

/** @typedef {import('./levels.js').Level} Level */

// ---------------------------------------------------------------------------
// Tiny markdown renderer (headings, code, bold, italic, lists, tables, inline)
// ---------------------------------------------------------------------------

/**
 * @param {string} md
 * @returns {string}
 */
function renderMarkdown(md) {
  const lines = md.split('\n');
  /** @type {string[]} */
  const html = [];
  let inCode = false;
  let inList = false;
  let inTable = false;
  /** @type {string[]} */
  let codeBuf = [];
  /** @type {string[]} */
  let tableBuf = [];

  const flushList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };
  const flushTable = () => {
    if (inTable) {
      html.push(renderTable(tableBuf));
      tableBuf = [];
      inTable = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = [];
        inCode = false;
      } else {
        flushList();
        flushTable();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (line.trim().startsWith('|') && line.includes('|', 1)) {
      flushList();
      inTable = true;
      tableBuf.push(line);
      continue;
    }
    flushTable();

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    flushList();

    if (line.startsWith('### ')) {
      html.push(`<h4>${inline(line.slice(4))}</h4>`);
    } else if (line.startsWith('## ')) {
      html.push(`<h3>${inline(line.slice(3))}</h3>`);
    } else if (line.startsWith('# ')) {
      html.push(`<h2>${inline(line.slice(2))}</h2>`);
    } else if (line.trim() === '') {
      html.push('<p class="md-gap"></p>');
    } else {
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inCode && codeBuf.length) {
    html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }
  flushList();
  flushTable();
  return html.join('\n');
}

/**
 * @param {string[]} rows
 * @returns {string}
 */
function renderTable(rows) {
  const parsed = rows
    .filter((r) => !/^\s*\|[\s:-|]+\|\s*$/.test(r))
    .map((r) =>
      r
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim())
    );
  if (!parsed.length) return '';
  const [head, ...body] = parsed;
  let html = '<table class="md-table"><thead><tr>';
  for (const h of head) html += `<th>${inline(h)}</th>`;
  html += '</tr></thead><tbody>';
  for (const row of body) {
    html += '<tr>';
    for (const cell of row) html += `<td>${inline(cell)}</td>`;
    html += '</tr>';
  }
  html += '</tbody></table>';
  return html;
}

/**
 * @param {string} text
 * @returns {string}
 */
function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return s;
}

/**
 * @param {string} s
 * @returns {string}
 */
function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Progress store
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'learn-cmd.progress.v1';

/**
 * @returns {Record<string, { best: number | null, solved: boolean, sawSolution: boolean }>}
 */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * @param {Record<string, unknown>} progress
 */
function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* ignore quota errors */
  }
}

// ---------------------------------------------------------------------------
// App state
// ---------------------------------------------------------------------------

/** @type {VirtualFileSystem} */
let fs = new VirtualFileSystem(defaultFsSpec());
/** @type {{ spec: Record<string, unknown>, cwd: string, env: Map<string, string> }[]} */
let undoStack = [];
/** @type {Level | null} */
let currentLevel = null;
/** @type {'sandbox' | 'level'} */
let mode = 'sandbox';
/** @type {number} */
let commandCount = 0;
/** @type {string[]} */
let history = [];
/** @type {number} */
let historyIndex = -1;
/** @type {Set<string>} */
let flashPaths = new Set();
/** @type {Record<string, { best: number | null, solved: boolean, sawSolution: boolean }>} */
let progress = loadProgress();
/** @type {boolean} */
let dialogOpen = false;

// DOM refs
const el = {
  tree: /** @type {HTMLElement} */ (document.getElementById('fs-tree')),
  term: /** @type {HTMLElement} */ (document.getElementById('term-body')),
  input: /** @type {HTMLInputElement} */ (document.getElementById('term-input')),
  prompt: /** @type {HTMLElement} */ (document.getElementById('term-prompt')),
  modeLabel: /** @type {HTMLElement} */ (document.getElementById('mode-label')),
  levelTitle: /** @type {HTMLElement} */ (document.getElementById('level-title')),
  golf: /** @type {HTMLElement} */ (document.getElementById('golf-score')),
  golfPar: /** @type {HTMLElement} */ (document.getElementById('golf-par')),
  goalPanel: /** @type {HTMLElement} */ (document.getElementById('goal-panel')),
  modal: /** @type {HTMLElement} */ (document.getElementById('modal')),
  modalBody: /** @type {HTMLElement} */ (document.getElementById('modal-body')),
  toast: /** @type {HTMLElement} */ (document.getElementById('toast')),
  btnLevels: /** @type {HTMLButtonElement} */ (document.getElementById('btn-levels')),
  btnSandbox: /** @type {HTMLButtonElement} */ (document.getElementById('btn-sandbox')),
  btnUndo: /** @type {HTMLButtonElement} */ (document.getElementById('btn-undo')),
  btnReset: /** @type {HTMLButtonElement} */ (document.getElementById('btn-reset')),
  btnHint: /** @type {HTMLButtonElement} */ (document.getElementById('btn-hint')),
  btnShare: /** @type {HTMLButtonElement} */ (document.getElementById('btn-share')),
  langToggle: /** @type {HTMLButtonElement} */ (document.getElementById('lang-toggle')),
};

// ---------------------------------------------------------------------------
// Rendering helpers
// ---------------------------------------------------------------------------

function refreshTree() {
  renderTree(el.tree, fs, { flashPaths });
  flashPaths = new Set();
}

function refreshPrompt() {
  el.prompt.textContent = `${fs.cwd}>`;
  el.input.setAttribute('aria-label', `Command input at ${fs.cwd}`);
}

function refreshHud() {
  el.modeLabel.textContent = mode === 'level' && currentLevel ? 'LEVEL' : 'SANDBOX';
  el.levelTitle.textContent =
    mode === 'level' && currentLevel ? pick(currentLevel.name) : 'Free exploration';
  el.golf.textContent = String(commandCount);
  el.golfPar.textContent =
    mode === 'level' && currentLevel && currentLevel.par != null ? String(currentLevel.par) : '—';
  el.btnUndo.disabled = undoStack.length === 0;
  updateGoalPanel();
}

/**
 * @param {Record<string, string> | undefined} map
 * @returns {string}
 */
function pick(map) {
  if (!map) return '';
  const lang = currentLang();
  return map[lang] || map.en_US || Object.values(map)[0] || '';
}

/** @type {'en_US' | 'fa'} */
let appLang = 'fa';

/**
 * @returns {'en_US' | 'fa'}
 */
function currentLang() {
  return appLang;
}

/**
 * @param {'en_US' | 'fa'} lang
 */
function setLang(lang) {
  appLang = lang;
  try {
    localStorage.setItem('learn-cmd.lang', lang);
  } catch {
    /* ignore */
  }
  const chip = document.getElementById('lang-toggle');
  if (chip) chip.textContent = lang === 'fa' ? 'FA' : 'EN';
  refreshHud();
}

function updateGoalPanel() {
  if (mode !== 'level' || !currentLevel) {
    el.goalPanel.innerHTML = `<div class="goal-sandbox">Sandbox — type <code>levels</code> to start a lesson, <code>help</code> for commands.</div>`;
    return;
  }
  const diff = fs.diffGoalWithCommands(
    currentLevel.goalFS,
    currentLevel.goalCwd,
    currentLevel.goalCommands || null,
    history
  );
  const prog = progress[currentLevel.id];
  const rows = [];
  rows.push(`<div class="goal-title">Goal</div>`);
  rows.push(`<div class="goal-hint">${inline(pick(currentLevel.hint) || '')}</div>`);
  if (diff.ok) {
    rows.push(`<div class="goal-ok">✓ Goal state reached</div>`);
  } else {
    if (diff.missing.length) {
      rows.push(
        `<div class="goal-miss">Missing: ${diff.missing
          .slice(0, 6)
          .map((m) => `<code>${escapeHtml(m)}</code>`)
          .join(', ')}</div>`
      );
    }
    if (diff.extra.length) {
      rows.push(
        `<div class="goal-extra">Extra: ${diff.extra
          .slice(0, 6)
          .map((m) => `<code>${escapeHtml(m)}</code>`)
          .join(', ')}</div>`
      );
    }
    if (diff.cwdMismatch && currentLevel.goalCwd) {
      rows.push(
        `<div class="goal-miss">cwd should be <code>${escapeHtml(currentLevel.goalCwd)}</code></div>`
      );
    }
    if (diff.missingCommands && diff.missingCommands.length) {
      rows.push(
        `<div class="goal-miss">Run: ${diff.missingCommands
          .map((m) => `<code>${escapeHtml(m)}</code>`)
          .join(' or ')}</div>`
      );
    }
  }
  if (prog && prog.best != null) {
    rows.push(
      `<div class="goal-best">Best: ${prog.best} command${prog.best === 1 ? '' : 's'}${
        prog.sawSolution ? ' (solution seen)' : ''
      }</div>`
    );
  }
  el.goalPanel.innerHTML = rows.join('');
}

/**
 * @param {string} text
 * @param {'out' | 'in' | 'err' | 'sys'} [kind]
 */
function print(text, kind = 'out') {
  const lines = text.split('\n');
  for (const line of lines) {
    const div = document.createElement('div');
    div.className = 'term-line term-' + kind;
    div.textContent = line;
    el.term.appendChild(div);
  }
  el.term.scrollTop = el.term.scrollHeight;
}

/**
 * @param {string} promptText
 * @param {string} command
 */
function printPromptLine(promptText, command) {
  const div = document.createElement('div');
  div.className = 'term-line term-in';
  div.innerHTML = `<span class="term-prompt">${escapeHtml(promptText)}</span><span class="term-cmd">${escapeHtml(command)}</span>`;
  el.term.appendChild(div);
  el.term.scrollTop = el.term.scrollHeight;
}

/**
 * @param {string} message
 */
function toast(message) {
  el.toast.textContent = message;
  el.toast.classList.add('show');
  setTimeout(() => el.toast.classList.remove('show'), 2200);
}

// ---------------------------------------------------------------------------
// Command execution entry
// ---------------------------------------------------------------------------

/**
 * @param {string} raw
 * @param {{ silent?: boolean, count?: boolean }} [opts]
 */
function runCommand(raw, opts = {}) {
  const line = raw.trim();
  if (!line) return;

  if (!opts.silent) {
    printPromptLine(fs.cwd + '>', line);
  }
  if (!opts.count === false || opts.count) {
    /* handled below */
  }
  if (opts.count !== false) {
    commandCount += 1;
    history.push(line);
    historyIndex = history.length;
  }

  const before = fs.snapshot();
  const beforeSpec = fs.serialize();

  // Meta commands first
  const meta = detectMeta(line);
  if (meta) {
    handleMeta(meta, line);
    refreshHud();
    refreshTree();
    return;
  }

  const result = executeLine(line, { fs });
  for (const outLine of result.lines) {
    if (outLine === '\x0CLS') {
      el.term.innerHTML = '';
      continue;
    }
    print(outLine, outLine.startsWith('ERROR:') ? 'err' : 'out');
  }

  // Only push undo if something changed
  const afterSpec = fs.serialize();
  if (JSON.stringify(beforeSpec) !== JSON.stringify(afterSpec) || before.cwd !== fs.cwd) {
    undoStack.push(before);
    if (undoStack.length > 50) undoStack.shift();
  }

  flashPaths = diffNewPaths(beforeSpec, afterSpec);
  refreshTree();
  refreshPrompt();
  refreshHud();
  checkGoal();
}



/**
 * @param {{ name: string, args: string[] }} meta
 * @param {string} line
 */
function handleMeta(meta, line) {
  switch (meta.name) {
    case 'levels':
      openLevelsDialog();
      break;
    case 'level': {
      const id = meta.args[0];
      if (!id) {
        print('Usage: level <id>', 'err');
        break;
      }
      startLevel(id);
      break;
    }
    case 'sandbox':
      enterSandbox();
      break;
    case 'undo':
      doUndo();
      break;
    case 'reset':
      doReset();
      break;
    case 'hint':
      if (currentLevel) {
        print(pick(currentLevel.hint), 'sys');
      } else {
        print('No active level. Type `levels` to choose one.', 'sys');
      }
      break;
    case 'solution':
    case 'show':
      if (meta.name === 'show' && meta.args[0] && meta.args[0].toLowerCase() !== 'solution') {
        print('Usage: show solution', 'err');
        break;
      }
      showSolution();
      break;
    case 'goal':
      if (currentLevel) {
        print(JSON.stringify(currentLevel.goalFS, null, 2), 'sys');
        if (currentLevel.goalCwd) print('cwd: ' + currentLevel.goalCwd, 'sys');
      } else {
        print('No active level.', 'sys');
      }
      break;
    case 'next': {
      const n = currentLevel && nextLevel(currentLevel.id);
      if (n) startLevel(n.id);
      else print('No next level.', 'sys');
      break;
    }
    case 'prev': {
      const p = currentLevel && prevLevel(currentLevel.id);
      if (p) startLevel(p.id);
      else print('No previous level.', 'sys');
      break;
    }
    case 'progress':
    case 'golf':
      printGolfBoard();
      break;
    case 'share':
      sharePermalink();
      break;
    case 'build':
      openLevelBuilder();
      break;
    case 'import': {
      const rest = meta.args.slice();
      if (rest[0] && rest[0].toLowerCase() === 'level') rest.shift();
      openLevelImporter(rest.join(' '));
      break;
    }
    default:
      print(`Unknown meta command: ${line}`, 'err');
  }
}

function doUndo() {
  if (!undoStack.length) {
    print('Nothing to undo.', 'sys');
    return;
  }
  const snap = undoStack.pop();
  fs.restore(snap);
  commandCount = Math.max(0, commandCount - 1);
  print('Undo complete.', 'sys');
  refreshTree();
  refreshPrompt();
  refreshHud();
  checkGoal();
}

function doReset() {
  if (mode === 'level' && currentLevel) {
    loadLevelState(currentLevel);
    print('Level reset.', 'sys');
  } else {
    fs = new VirtualFileSystem(defaultFsSpec());
    undoStack = [];
    commandCount = 0;
    print('Sandbox reset.', 'sys');
  }
  refreshTree();
  refreshPrompt();
  refreshHud();
}

function showSolution() {
  if (!currentLevel) {
    print('No active level.', 'sys');
    return;
  }
  const prog = progress[currentLevel.id] || { best: null, solved: false, sawSolution: false };
  prog.sawSolution = true;
  progress[currentLevel.id] = prog;
  saveProgress(progress);
  print('Solution: ' + currentLevel.solutionCommand, 'sys');
  print('(Run it yourself to keep a clean score — golf is marked as "solution seen".)', 'sys');
}

function printGolfBoard() {
  print('Command golf — solved levels', 'sys');
  const levels = allLevels();
  let any = false;
  for (const level of levels) {
    const prog = progress[level.id];
    if (!prog || !prog.solved) continue;
    any = true;
    const par = level.par != null ? level.par : '—';
    print(
      `  ${level.id.padEnd(18)} best=${prog.best}  par=${par}${prog.sawSolution ? '  (solution seen)' : ''}`,
      'out'
    );
  }
  if (!any) print('  (none yet)', 'sys');
}

function sharePermalink() {
  const url = new URL(window.location.href);
  url.search = '';
  if (currentLevel) url.searchParams.set('level', currentLevel.id);
  print(url.toString(), 'sys');
  try {
    navigator.clipboard.writeText(url.toString());
    toast('Permalink copied');
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Level builder / import
// ---------------------------------------------------------------------------

/** @type {{ startFS: Record<string, unknown> | null, goalFS: Record<string, unknown> | null, startCwd: string, goalCwd: string }} */
const builderState = {
  startFS: null,
  goalFS: null,
  startCwd: 'C:\\Users\\student',
  goalCwd: 'C:\\Users\\student',
};

function openLevelBuilder() {
  openModal(`
    <div class="levels-dialog builder">
      <h2>Build level</h2>
      <p class="levels-sub">
        Arrange the sandbox filesystem for the <strong>start</strong> state, capture it,
        rearrange it to the <strong>goal</strong>, capture that too, then export JSON.
        <code>import level</code> plays it back.
      </p>

      <label class="field-label">Name (en_US)</label>
      <input id="bl-name" class="text-input" type="text" placeholder="My challenge" value="" />

      <label class="field-label">Hint (en_US)</label>
      <input id="bl-hint" class="text-input" type="text" placeholder="Try md + echo redirection" />

      <label class="field-label">About</label>
      <input id="bl-about" class="text-input" type="text" placeholder="What this level teaches" />

      <label class="field-label">Solution command</label>
      <input id="bl-solution" class="text-input" type="text" placeholder="md app &amp;&amp; echo hi&gt;app\\a.txt" />

      <label class="field-label">Par (command golf)</label>
      <input id="bl-par" class="text-input" type="number" min="1" value="2" />

      <label class="field-label">Intro markdown</label>
      <textarea id="bl-intro" class="text-area" rows="4" placeholder="## Task&#10;Create app\\a.txt containing hi"></textarea>

      <div class="builder-captures">
        <div class="capture-card">
          <div class="capture-title">Start tree</div>
          <div id="bl-start-status" class="capture-status">not captured</div>
          <button class="btn" type="button" data-action="bl-capture-start">Capture current FS</button>
        </div>
        <div class="capture-card">
          <div class="capture-title">Goal tree</div>
          <div id="bl-goal-status" class="capture-status">not captured</div>
          <button class="btn" type="button" data-action="bl-capture-goal">Capture current FS</button>
        </div>
      </div>
      <p class="builder-cwd">Builder cwd recorded as <code id="bl-cwd">${escapeHtml(fs.cwd)}</code></p>

      <label class="field-label">Export JSON</label>
      <textarea id="bl-json" class="text-area" rows="8" readonly placeholder="Capture start + goal, then click Export"></textarea>

      <div class="modal-actions">
        <button class="btn primary" type="button" data-action="bl-export">Export JSON</button>
        <button class="btn" type="button" data-action="bl-save">Save &amp; play</button>
        <button class="btn" type="button" data-action="bl-copy">Copy JSON</button>
        <button class="btn ghost" type="button" data-action="close-modal">Close</button>
      </div>
    </div>
  `);
}

/**
 * Collect builder form values into a level JSON object.
 *
 * @returns {Record<string, unknown>}
 */
function collectBuilderLevel() {
  const name = /** @type {HTMLInputElement} */ (document.getElementById('bl-name')).value.trim();
  const hint = /** @type {HTMLInputElement} */ (document.getElementById('bl-hint')).value.trim();
  const about = /** @type {HTMLInputElement} */ (document.getElementById('bl-about')).value.trim();
  const solution = /** @type {HTMLInputElement} */ (
    document.getElementById('bl-solution')
  ).value.trim();
  const par = Number(/** @type {HTMLInputElement} */ (document.getElementById('bl-par')).value) || 1;
  const intro = /** @type {HTMLTextAreaElement} */ (document.getElementById('bl-intro')).value;

  if (!name) throw new Error('Name is required.');
  if (!builderState.startFS) throw new Error('Capture the start tree first.');
  if (!builderState.goalFS) throw new Error('Capture the goal tree first.');

  return {
    id: 'custom-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: { en_US: name },
    hint: { en_US: hint || 'Inspect the goal and use CMD commands.' },
    about: { en_US: about || 'Custom level' },
    intro: intro || 'Reach the goal tree.',
    startFS: builderState.startFS,
    goalFS: builderState.goalFS,
    startCwd: builderState.startCwd,
    goalCwd: builderState.goalCwd,
    solutionCommand: solution,
    par,
  };
}

function openLevelImporter(prefill) {
  openModal(`
    <div class="levels-dialog">
      <h2>Import level</h2>
      <p class="levels-sub">Paste a level JSON blob exported by <code>build level</code>.</p>
      <label class="field-label">Level JSON</label>
      <textarea id="li-json" class="text-area" rows="12" placeholder='{"id":"...","name":{"en_US":"..."},"startFS":{},"goalFS":{}}'></textarea>
      <div id="li-error" class="goal-miss" hidden></div>
      <div class="modal-actions">
        <button class="btn primary" type="button" data-action="li-load">Load level</button>
        <button class="btn ghost" type="button" data-action="close-modal">Close</button>
      </div>
    </div>
  `);
  if (prefill) {
    /** @type {HTMLTextAreaElement} */ (document.getElementById('li-json')).value = prefill;
  }
}

/**
 * @param {string} jsonText
 */
function loadImportedLevel(jsonText) {
  const errBox = document.getElementById('li-error');
  try {
    const raw = JSON.parse(jsonText);
    const level = levelFromJson(raw);
    registerCustomLevel(level);
    closeModal();
    startLevel(level.id);
    print(`Imported custom level: ${pick(level.name)}`, 'sys');
  } catch (err) {
    if (errBox) {
      errBox.hidden = false;
      errBox.textContent = err && err.message ? err.message : String(err);
    }
  }
}

function checkGoal() {
  if (mode !== 'level' || !currentLevel) return;
  const diff = fs.diffGoalWithCommands(
    currentLevel.goalFS,
    currentLevel.goalCwd,
    currentLevel.goalCommands || null,
    history
  );
  if (!diff.ok) return;

  const id = currentLevel.id;
  const prev = progress[id] || { best: null, solved: false, sawSolution: false };
  prev.solved = true;
  if (prev.best == null || commandCount < prev.best) prev.best = commandCount;
  progress[id] = prev;
  saveProgress(progress);

  const par = currentLevel.par;
  const scoreMsg =
    par != null
      ? commandCount <= par
        ? `Par met! ${commandCount}/${par} commands.`
        : `Solved in ${commandCount} commands (par ${par}).`
      : `Solved in ${commandCount} commands.`;

  openModal(`
    <div class="win-card">
      <div class="win-badge">LEVEL SOLVED</div>
      <h2>${escapeHtml(pick(currentLevel.name))}</h2>
      <p class="win-score">${escapeHtml(scoreMsg)}</p>
      ${prev.sawSolution ? '<p class="win-note">Solution was revealed for this level.</p>' : ''}
      <div class="win-actions">
        <button class="btn primary" data-action="next-level">Next level</button>
        <button class="btn" data-action="replay">Replay</button>
        <button class="btn ghost" data-action="close-modal">Stay here</button>
      </div>
    </div>
  `);
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------

/**
 * @param {Level} level
 */
function loadLevelState(level) {
  fs = new VirtualFileSystem(level.startFS);
  if (level.startCwd) fs.cwd = normalizePath(level.startCwd, fs.cwd);
  fs.ensureDefaultProfile();
  undoStack = [];
  commandCount = 0;
}

/**
 * @param {string} id
 */
function startLevel(id) {
  const level = getLevel(id);
  if (!level) {
    print(`Unknown level id: ${id}`, 'err');
    return;
  }
  currentLevel = level;
  mode = 'level';
  loadLevelState(level);
  refreshTree();
  refreshPrompt();
  refreshHud();
  print(`Loaded level: ${pick(level.name)}`, 'sys');
  print(`Type 'hint' if stuck, 'show solution' to peek, 'reset' to start over.`, 'sys');
  openLevelDialog(level);
  const url = new URL(window.location.href);
  url.searchParams.set('level', id);
  window.history.replaceState({}, '', url.toString());
}

function enterSandbox() {
  currentLevel = null;
  mode = 'sandbox';
  fs = new VirtualFileSystem(defaultFsSpec());
  undoStack = [];
  commandCount = 0;
  refreshTree();
  refreshPrompt();
  refreshHud();
  print('Sandbox mode. Type `levels` for lessons, `help` for commands.', 'sys');
  const url = new URL(window.location.href);
  url.searchParams.delete('level');
  window.history.replaceState({}, '', url.toString());
}

// ---------------------------------------------------------------------------
// Dialogs
// ---------------------------------------------------------------------------

/**
 * @param {string} html
 */
function openModal(html) {
  el.modalBody.innerHTML = html;
  el.modal.classList.add('open');
  dialogOpen = true;
}

function closeModal() {
  el.modal.classList.remove('open');
  el.modalBody.innerHTML = '';
  dialogOpen = false;
  el.input.focus();
}

function openLevelsDialog() {
  /** @type {{ key: string, title: string, about: string, levels: Level[] }[]} */
  const groups = Object.entries(sequences).map(([key, seq]) => ({
    key,
    title: pick(seq.displayName),
    about: pick(seq.about),
    levels: seq.levels,
  }));
  const customs = listCustomLevels();
  if (customs.length) {
    groups.push({
      key: 'custom',
      title: 'Custom',
      about: 'Levels you built or imported in this session.',
      levels: customs,
    });
  }

  let html = `<div class="levels-dialog">
    <h2>Levels</h2>
    <p class="levels-sub">Command golf: try to match par. Progress is saved in your browser.</p>
    <div class="levels-tabs">`;
  groups.forEach((g, i) => {
    html += `<button class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${escapeHtml(g.key)}">${escapeHtml(
      g.title
    )}</button>`;
  });
  html += `</div>`;

  groups.forEach((g, i) => {
    html += `<div class="tab-panel ${i === 0 ? 'active' : ''}" data-panel="${escapeHtml(g.key)}">
      <p class="seq-about">${escapeHtml(g.about)}</p>
      <ul class="level-list">`;
    for (const level of g.levels) {
      const prog = progress[level.id];
      const status = prog && prog.solved ? 'solved' : 'open';
      const best = prog && prog.best != null ? String(prog.best) : '—';
      const par = level.par != null ? String(level.par) : '—';
      const label = g.key === 'custom' ? 'custom' : `best ${best} / par ${par}`;
      html += `<li class="level-item ${status}" data-level="${escapeHtml(level.id)}">
        <span class="level-name">${escapeHtml(pick(level.name))}</span>
        <span class="level-golf">${label}</span>
      </li>`;
    }
    html += `</ul></div>`;
  });

  html += `<div class="modal-actions">
    <button class="btn ghost" data-action="close-modal">Close</button>
    <button class="btn" data-action="open-builder">Build level</button>
    <button class="btn" data-action="open-importer">Import level</button>
  </div></div>`;
  openModal(html);
}

/**
 * @param {Level} level
 */
function openLevelDialog(level) {
  const lang = currentLang();
  const dialog =
    (level.startDialog && level.startDialog[lang]) ||
    (lang === 'fa' ? getDialogFa(level.id) : null) ||
    (level.startDialog && level.startDialog.en_US) ||
    getDialogFa(level.id) ||
    null;
  if (!dialog || !dialog.childViews || !dialog.childViews.length) return;
  let html = `<div class="lesson-dialog">`;
  dialog.childViews.forEach((view, index) => {
    if (view.type === 'ModalAlert') {
      const md = (view.options.markdowns || []).join('\n');
      html += `<section class="lesson-card">${renderMarkdown(md)}</section>`;
    } else if (view.type === 'CmdDemonstrationView') {
      const before = (view.options.beforeMarkdowns || []).join('\n');
      const after = (view.options.afterMarkdowns || []).join('\n');
      html += `<section class="lesson-card demo-card">
        ${renderMarkdown(before)}
        <div class="demo-run">
          <code class="demo-cmd">${escapeHtml(view.options.command || '')}</code>
          <button class="btn primary" data-action="run-demo" data-cmd="${escapeHtml(
            view.options.command || ''
          )}" data-pre="${escapeHtml(view.options.beforeCommand || '')}" data-demo="${index}">Run</button>
        </div>
        <div class="demo-after" id="demo-after-${index}" hidden>${renderMarkdown(after)}</div>
      </section>`;
    }
  });
  html += `<div class="modal-actions">
    <button class="btn primary" data-action="close-modal">Start</button>
    <button class="btn" data-action="show-solution">Show solution</button>
    <button class="btn ghost" data-action="close-modal">Close</button>
  </div></div>`;
  openModal(html);
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

el.input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const value = el.input.value;
    el.input.value = '';
    runCommand(value);
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    if (historyIndex > 0) {
      historyIndex -= 1;
      el.input.value = history[historyIndex] || '';
    }
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    if (historyIndex < history.length) {
      historyIndex += 1;
      el.input.value = history[historyIndex] || '';
    }
    return;
  }
  if (event.key === 'c' && event.ctrlKey) {
    printPromptLine(fs.cwd + '>', el.input.value + '^C');
    el.input.value = '';
  }
});

el.btnLevels.addEventListener('click', () => openLevelsDialog());
el.btnSandbox.addEventListener('click', () => enterSandbox());
el.btnUndo.addEventListener('click', () => doUndo());
el.btnReset.addEventListener('click', () => doReset());
el.btnHint.addEventListener('click', () => {
  if (currentLevel) print(pick(currentLevel.hint), 'sys');
  else print('No active level.', 'sys');
});
el.btnShare.addEventListener('click', () => sharePermalink());
el.langToggle.addEventListener('click', () => {
  setLang(currentLang() === 'fa' ? 'en_US' : 'fa');
  print(currentLang() === 'fa' ? 'زبان: فارسی' : 'Language: English', 'sys');
});

el.modal.addEventListener('click', (event) => {
  const target = /** @type {HTMLElement} */ (event.target);
  if (target === el.modal) {
    closeModal();
    return;
  }
  const btn = target.closest('[data-action]');
  if (!btn) {
    const tab = target.closest('[data-tab]');
    if (tab) {
      const key = tab.getAttribute('data-tab');
      el.modalBody.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      el.modalBody.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = el.modalBody.querySelector(`[data-panel="${key}"]`);
      if (panel) panel.classList.add('active');
    }
    const levelItem = target.closest('[data-level]');
    if (levelItem) {
      const id = levelItem.getAttribute('data-level');
      closeModal();
      startLevel(id);
    }
    return;
  }
  const action = btn.getAttribute('data-action');
  if (action === 'close-modal') {
    closeModal();
  } else if (action === 'next-level') {
    const n = currentLevel && nextLevel(currentLevel.id);
    closeModal();
    if (n) startLevel(n.id);
    else {
      toast('That was the last level');
      enterSandbox();
    }
  } else if (action === 'replay') {
    if (currentLevel) {
      loadLevelState(currentLevel);
      refreshTree();
      refreshPrompt();
      refreshHud();
    }
    closeModal();
  } else if (action === 'show-solution') {
    showSolution();
  } else if (action === 'run-demo') {
    const cmd = btn.getAttribute('data-cmd') || '';
    const pre = btn.getAttribute('data-pre') || '';
    const demoId = btn.getAttribute('data-demo');
    // Run demo on a clone so the learner's state is untouched
    const clone = fs.clone();
    const ctx = { fs: clone, _dirStack: [] };
    if (pre) {
      try {
        executeLine(pre, ctx);
      } catch {
        /* demo setup best-effort */
      }
    }
    try {
      const result = executeLine(cmd, ctx);
      for (const line of result.lines) {
        if (line !== '\x0CLS') print(line, 'out');
      }
    } catch (err) {
      print('ERROR: ' + (err && err.message ? err.message : String(err)), 'err');
    }
    if (demoId != null) {
      const after = document.getElementById('demo-after-' + demoId);
      if (after) {
        after.hidden = false;
        btn.disabled = true;
        btn.textContent = 'Done';
      }
    }
  } else if (action === 'bl-capture-start') {
    builderState.startFS = fs.serialize();
    builderState.startCwd = fs.cwd;
    const st = document.getElementById('bl-start-status');
    if (st) {
      st.textContent = `captured (${Object.keys(builderState.startFS).length} top-level entries)`;
      st.classList.add('ok');
    }
    const cwdEl = document.getElementById('bl-cwd');
    if (cwdEl) cwdEl.textContent = fs.cwd;
    toast('Start tree captured');
  } else if (action === 'bl-capture-goal') {
    builderState.goalFS = fs.serialize();
    builderState.goalCwd = fs.cwd;
    const st = document.getElementById('bl-goal-status');
    if (st) {
      st.textContent = `captured (${Object.keys(builderState.goalFS).length} top-level entries)`;
      st.classList.add('ok');
    }
    toast('Goal tree captured');
  } else if (action === 'bl-export') {
    try {
      const levelJson = collectBuilderLevel();
      /** @type {HTMLTextAreaElement} */ (document.getElementById('bl-json')).value =
        JSON.stringify(levelJson, null, 2);
      toast('JSON ready');
    } catch (err) {
      toast(err && err.message ? err.message : 'Export failed');
    }
  } else if (action === 'bl-copy') {
    try {
      const levelJson = collectBuilderLevel();
      const text = JSON.stringify(levelJson, null, 2);
      /** @type {HTMLTextAreaElement} */ (document.getElementById('bl-json')).value = text;
      navigator.clipboard.writeText(text);
      toast('Copied to clipboard');
    } catch (err) {
      toast(err && err.message ? err.message : 'Copy failed');
    }
  } else if (action === 'bl-save') {
    try {
      const levelJson = collectBuilderLevel();
      const level = levelFromJson(levelJson);
      registerCustomLevel(level);
      closeModal();
      startLevel(level.id);
    } catch (err) {
      toast(err && err.message ? err.message : 'Save failed');
    }
  } else if (action === 'li-load') {
    const text = /** @type {HTMLTextAreaElement} */ (document.getElementById('li-json')).value;
    loadImportedLevel(text);
  } else if (action === 'open-builder') {
    openLevelBuilder();
  } else if (action === 'open-importer') {
    openLevelImporter('');
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && dialogOpen) {
    closeModal();
  }
});

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

function boot() {
  const params = new URLSearchParams(window.location.search);
  const levelId = params.get('level');
  const commands = params.get('command');

  try {
    const saved = localStorage.getItem('learn-cmd.lang');
    if (saved === 'fa' || saved === 'en_US') appLang = saved;
  } catch {
    /* ignore */
  }
  if (el.langToggle) el.langToggle.textContent = currentLang() === 'fa' ? 'FA' : 'EN';

  print('Microsoft Windows [Version 10.0.19045.4170]', 'sys');
  print('(learn-cmd virtual machine)', 'sys');
  print('', 'out');

  if (levelId) {
    startLevel(levelId);
  } else if (params.has('NODEMO') || params.has('demo')) {
    enterSandbox();
  } else {
    enterSandbox();
    openModal(`
      <div class="intro-card">
        <h2>learn-cmd</h2>
        <p>An interactive Windows CMD trainer — sandbox, live filesystem tree, and leveled challenges with command golf. Inspired by <em>learnGitBranching</em>.</p>
        <ul class="intro-list">
          <li><strong>Sandbox</strong> — free play with <code>undo</code> / <code>reset</code></li>
          <li><strong>Levels</strong> — type <code>levels</code> or use the button</li>
          <li><strong>Golf</strong> — solve in as few commands as par</li>
        </ul>
        <div class="modal-actions">
          <button class="btn primary" data-action="close-modal">Open sandbox</button>
          <button class="btn" id="intro-levels">Browse levels</button>
        </div>
      </div>
    `);
    const introLevels = document.getElementById('intro-levels');
    if (introLevels) {
      introLevels.addEventListener('click', () => {
        closeModal();
        openLevelsDialog();
      });
    }
  }

  if (commands) {
    for (const cmd of commands.split(';')) {
      runCommand(cmd, { count: false, silent: true });
    }
    printPromptLine(fs.cwd + '>', commands.split(';').join('; '));
  }

  refreshTree();
  refreshPrompt();
  refreshHud();
  el.input.focus();
}

boot();

// Expose a few helpers for debugging in the console
window.learnCmd = {
  get fs() {
    return fs;
  },
  runCommand,
  COMMANDS,
  commandNames,
  lookupCommand,
  sequences,
  allLevels,
  baseTree,
  listCustomLevels,
  levelFromJson,
  registerCustomLevel,
};
