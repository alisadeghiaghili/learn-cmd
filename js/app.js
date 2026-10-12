/**
 * learn-cmd application shell.
 *
 * Coordinates the virtual filesystem, CMD executor, live tree visualizer,
 * terminal component, persistent progress, dock guide, and celebrations.
 */

'use strict';

import { VirtualFileSystem, defaultFsSpec, normalizePath } from './vfs.js';
import { executeLine } from './shell.js';
import {
  sequences,
  allLevels,
  getLevel,
  nextLevel,
  prevLevel,
  locateLevel,
  registerCustomLevel,
  listCustomLevels,
  levelFromJson,
} from './levels.js';
import { renderTree, diffNewPaths } from './tree.js';
import { TerminalView } from './terminal.js';
import { launchConfetti, playFanfare } from './confetti.js';
import { loadProgress, saveProgress, summarizeCurriculum, resumeLine } from './progress.js';
import { buildShareTargets, shareWithClipboard, COFFEE_BUTTON_HTML, REPO_URL } from './share.js';
import { getVisitorCount, getCachedVisitorCount, BASE_COUNT } from './visitor-counter.js';
import { formatUiHelpText, uiHelpModalHtml, startUiTour } from './ui-help.js';
import { getLocale, setLocale, ui, localizeLevel, getDialogFa, LOCALES } from './i18n.js';
import {
  ELI_DEPTH_MAP,
  getEliForLevel,
  getPrimaryEliTierForLevel,
} from './eli.js';

/** @typedef {import('./levels.js').Level} Level */

// ---------------------------------------------------------------------------
// Markdown rendering helper
// ---------------------------------------------------------------------------

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderInline(raw) {
  const slots = [];
  const parts = String(raw || '').split(/(<(?:a|span|img|b|code)\b[\s\S]*?<\/(?:a|span|b|code)>|<img\b[^>]*\/?>)/gi);
  const mapped = parts.map((part, i) => {
    if (i % 2 === 1) {
      slots.push(part);
      return '@@HTML' + (slots.length - 1) + '@@';
    }
    let s = escapeHtml(part);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    return s;
  }).join('');
  return mapped.replace(/@@HTML(\d+)@@/g, (_m, i) => slots[Number(i)] || '');
}

function renderMarkdown(md) {
  const lines = String(md || '').split('\n');
  const html = [];
  let inCode = false;
  let inList = false;
  const codeBuf = [];

  const flushList = () => {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
        codeBuf.length = 0;
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) {
      codeBuf.push(line);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`);
      continue;
    }
    flushList();

    if (line.startsWith('### ')) {
      html.push(`<h4>${renderInline(line.slice(4))}</h4>`);
    } else if (line.startsWith('## ')) {
      html.push(`<h3>${renderInline(line.slice(3))}</h3>`);
    } else if (line.startsWith('# ')) {
      html.push(`<h2>${renderInline(line.slice(2))}</h2>`);
    } else if (line.trim() === '') {
      html.push('<p class="md-gap"></p>');
    } else {
      html.push(`<p>${renderInline(line)}</p>`);
    }
  }
  if (inCode && codeBuf.length) {
    html.push(`<pre><code>${escapeHtml(codeBuf.join('\n'))}</code></pre>`);
  }
  flushList();
  return html.join('\n');
}

/**
 * Difficulty of a level on a 1–5 scale (higher is harder), derived from its
 * primary teaching tier so the meter reuses existing curated logic.
 *
 * @param {string} levelId
 * @returns {number}
 */
const TIER_TO_DIFFICULTY = { eli5: 1, eli10: 2, eli15: 3, eli20: 4, eliphd: 5 };
function difficultyForLevel(levelId) {
  const tier = getPrimaryEliTierForLevel(levelId);
  return TIER_TO_DIFFICULTY[tier] ?? 3;
}

/**
 * Five equal-size dots; filled count = difficulty (1–5).
 *
 * @param {number} difficulty
 * @returns {string}
 */
function renderDiffDots(difficulty) {
  const n = Math.max(0, Math.min(5, difficulty));
  return Array.from({ length: 5 }, (_, i) => `<i class="diff-dot${i < n ? ' on' : ''}"></i>`).join('');
}

// ---------------------------------------------------------------------------
// App Controller
// ---------------------------------------------------------------------------

class App {
  constructor() {
    this.fs = new VirtualFileSystem(defaultFsSpec());
    /** @type {Level | null} */
    this.level = null;
    /** @type {'sandbox' | 'level'} */
    this.mode = 'sandbox';
    this.startSnapshot = this.fs.snapshot();
    this.golf = [];
    this.undoStack = [];
    this.flashPaths = new Set();
    this.progress = loadProgress();
    this.solvedFlash = false;
    this.cachedVisitorCount = null;
    this.quizIndex = 0;
    try {
      this.eliDepth = localStorage.getItem('learn-cmd.eli') || 'eli15';
    } catch (_) {
      this.eliDepth = 'eli15';
    }

    // DOM references
    this.treeEl = document.getElementById('fs-tree');
    this.dockEl = document.getElementById('dock');
    this.titleEl = document.getElementById('level-title');
    this.modalEl = document.getElementById('modal');
    this.modalContentEl = document.getElementById('modal-body') || document.getElementById('modal-content');
    this.toastEl = document.getElementById('toast');
    this.visitorStatEl = document.getElementById('visitor-stat');
    this.visitorCountEl = document.getElementById('visitor-count');
    this.navDrawerEl = document.getElementById('nav-drawer');
    this.navToggleEl = document.querySelector('[data-action="nav-toggle"]');
    this.langBtnEl = document.querySelector('[data-action="lang-toggle"]');
    this.langDropdownEl = document.getElementById('lang-dropdown');

    const terminalContainer = document.getElementById('terminal');
    this.terminal = new TerminalView(terminalContainer, (cmd) => this.handleCommand(cmd));

    this.bindEvents();
    this.initVisitorCounter();
    this.boot();
  }

  bindEvents() {
    // Toolbar buttons
    document.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const action = btn.getAttribute('data-action');
        if (action === 'nav-toggle') {
          this.toggleNav();
          return;
        }
        if (action === 'lang-toggle') {
          this.toggleLang();
          return;
        }
        this.closeNav();
        this.closeLang();

        if (action === 'levels') this.openLevelsDialog();
        else if (action === 'lesson') this.replayLesson();
        else if (action === 'goal') this.focusGuide();
        else if (action === 'hint') this.showHint();
        else if (action === 'solution') this.showSolution();
        else if (action === 'undo') this.doUndo();
        else if (action === 'reset') this.doReset();
        else if (action === 'sandbox') this.enterSandbox();
        else if (action === 'help') this.openUiHelp(true);
      });
    });

    // Language options
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const loc = btn.getAttribute('data-lang');
        if (loc) {
          setLocale(loc);
          this.closeLang();
          this.remountAfterLocale();
        }
      });
    });

    // Modal background click
    // Modal background click
    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) {
        this.closeModal();
      }
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.modalEl.classList.contains('open')) {
          this.closeModal();
        }
        this.closeNav();
        this.closeLang();
      }
    });

    // Outside clicks close menus
    document.addEventListener('click', (e) => {
      const target = /** @type {HTMLElement} */ (e.target);
      if (!target.closest('.lang-menu')) {
        this.closeLang();
      }
      if (!target.closest('.nav-drawer') && !target.closest('[data-action="nav-toggle"]')) {
        this.closeNav();
      }
    });
  }

  toggleNav() {
    if (!this.navDrawerEl) return;
    const open = this.navDrawerEl.classList.toggle('is-open');
    this.navDrawerEl.hidden = !open;
    if (this.navToggleEl) this.navToggleEl.setAttribute('aria-expanded', String(open));
    if (open) this.closeLang();
  }

  closeNav() {
    if (!this.navDrawerEl) return;
    this.navDrawerEl.classList.remove('is-open');
    this.navDrawerEl.hidden = true;
    if (this.navToggleEl) this.navToggleEl.setAttribute('aria-expanded', 'false');
  }

  toggleLang() {
    if (!this.langDropdownEl) return;
    const open = this.langDropdownEl.classList.toggle('is-open');
    this.langDropdownEl.hidden = !open;
    if (this.langBtnEl) this.langBtnEl.setAttribute('aria-expanded', String(open));
    if (open) this.closeNav();
  }

  closeLang() {
    if (!this.langDropdownEl) return;
    this.langDropdownEl.classList.remove('is-open');
    this.langDropdownEl.hidden = true;
    if (this.langBtnEl) this.langBtnEl.setAttribute('aria-expanded', 'false');
  }

  setEliDepth(depth) {
    if (['eli5', 'eli10', 'eli15', 'eli20', 'eliphd'].includes(depth)) {
      this.eliDepth = depth;
      try {
        localStorage.setItem('learn-cmd.eli', depth);
      } catch (_) {}
      this.renderDock();
    }
  }

  showEliExplanation(depth) {
    const d = depth || this.eliDepth;
    if (!this.level) {
      this.terminal.push('meta', ui().noHintSandbox || 'Start a level to view cognitive explanations.');
      return;
    }
    const loc = getLocale();
    const eli = getEliForLevel(this.level.id, loc, d);
    const label = ELI_DEPTH_MAP[d]?.name?.[loc] || ELI_DEPTH_MAP[d]?.name?.en || d.toUpperCase();
    this.terminal.push('out', '══════════════════════════════════════════════════════');
    this.terminal.push('out', `🎓 [${label}] — ${eli.metaphor}`);
    this.terminal.push('out', '──────────────────────────────────────────────────────');
    this.terminal.push('out', `${eli.explanation}`);
    this.terminal.push('out', `💡 ${eli.takeaway}`);
    this.terminal.push('out', '══════════════════════════════════════════════════════');
  }

  renderToolbar() {
    const u = ui();
    const current = getLocale();

    if (this.langBtnEl) {
      this.langBtnEl.setAttribute('aria-label', u.language || 'Language');
    }
    const label = document.querySelector('[data-lang-label]');
    if (label) {
      label.textContent = current.toUpperCase();
    }
    document.querySelectorAll('[data-lang]').forEach((btn) => {
      const loc = btn.getAttribute('data-lang');
      const isCurrent = loc === current;
      btn.classList.toggle('on', isCurrent);
      btn.setAttribute('aria-checked', String(isCurrent));
    });

    if (this.navToggleEl) {
      this.navToggleEl.setAttribute('aria-label', u.menuLabel || 'Navigation menu');
    }

    const actionConfig = {
      levels: { text: u.levels },
      lesson: { text: u.lesson, title: u.lessonTitle },
      goal: { text: u.guide },
      hint: { text: u.hint },
      solution: { text: u.solution },
      undo: { text: u.undo },
      reset: { text: u.reset },
      sandbox: { text: u.sandboxBtn },
      help: { text: '?', title: u.uiGuideTitle, ariaLabel: u.help },
    };

    for (const [action, cfg] of Object.entries(actionConfig)) {
      const btn = document.querySelector(`[data-action="${action}"]`);
      if (btn) {
        btn.textContent = cfg.text;
        if (cfg.title) btn.title = cfg.title;
        if (cfg.ariaLabel) btn.setAttribute('aria-label', cfg.ariaLabel);
      }
    }

    if (this.visitorStatEl) {
      this.visitorStatEl.title = u.visitorsTitle || 'Total unique visitors';
    }

    const ghLink = document.querySelector('.tb-link.gh');
    if (ghLink) {
      ghLink.title = u.githubTitle || 'View repository on GitHub';
    }

    const supportLink = document.querySelector('.tb-link.support');
    if (supportLink) {
      supportLink.textContent = u.support || 'Support';
      supportLink.title = u.supportTitle || 'Buy me a coffee';
    }

    if (this.dockEl) {
      this.dockEl.setAttribute('aria-label', u.learningGuide || 'Learning Guide');
    }

    this.renderLevelTitle();
  }

  renderLevelTitle() {
    if (!this.titleEl) return;
    const u = ui();
    if (this.mode === 'level' && this.level) {
      const loc = getLocale();
      const raw = getLevel(this.level.id);
      const name =
        (this.level.name && (this.level.name[loc] || this.level.name.en_US)) ||
        (raw && raw.name && (raw.name[loc] || raw.name.en_US)) ||
        this.level.id;
      const par = this.level.par || 1;
      this.titleEl.textContent = typeof u.titleLine === 'function'
        ? u.titleLine(this.level.id, name, par)
        : loc === 'fa'
          ? `${name} (${this.level.id}) · ${par} کامند`
          : loc === 'de'
            ? `${name} (${this.level.id}) · ${par} ${par === 1 ? 'Befehl' : 'Befehle'}`
            : `${name} (${this.level.id}) · ${par} ${par === 1 ? 'command' : 'commands'}`;
    } else {
      this.titleEl.textContent = u.sandboxTitle || 'Free Sandbox — Virtual Drive C:';
    }
  }

  remountAfterLocale() {
    const loc = getLocale();
    this.renderToolbar();

    if (this.level) {
      const raw = getLevel(this.level.id) || this.level;
      this.level = localizeLevel(raw, loc);
    }
    this.renderAll();
    this.renderVisitorBadge();
    this.terminal.push(
      'meta',
      loc === 'fa'
        ? 'زبان به فارسی تغییر کرد.'
        : loc === 'de'
          ? 'Sprache auf Deutsch geändert.'
          : 'Language set to English.'
    );
    if (this.level) {
      const lvlName = this.level.name[loc] || this.level.name.en_US || this.level.id;
      this.terminal.push('meta', ui().levelMeta(this.level.id, lvlName));
    }
  }

  async initVisitorCounter() {
    this.cachedVisitorCount = getCachedVisitorCount() || BASE_COUNT;
    this.renderVisitorBadge();
    try {
      const count = await getVisitorCount();
      if (typeof count === 'number' && Number.isFinite(count)) {
        this.cachedVisitorCount = Math.max(BASE_COUNT, count);
        this.renderVisitorBadge();
      }
    } catch {
      // offline or adblock fallback
    }
  }

  renderVisitorBadge() {
    if (this.cachedVisitorCount === null || !this.visitorStatEl || !this.visitorCountEl) return;
    this.visitorStatEl.title = ui().visitorsTitle || 'Total unique visitors';
    this.visitorCountEl.textContent = this.cachedVisitorCount.toLocaleString('en-US');
    this.visitorStatEl.hidden = false;
  }

  focusGuide() {
    this.dockEl.classList.remove('dock-pulse');
    void this.dockEl.offsetWidth;
    this.dockEl.classList.add('dock-pulse');
    this.dockEl.scrollTop = 0;
  }

  toast(message) {
    this.toastEl.textContent = message;
    this.toastEl.classList.add('show');
    setTimeout(() => this.toastEl.classList.remove('show'), 2400);
  }

  openModal(html, { isCelebrate = false } = {}) {
    this.modalContentEl.innerHTML = html;
    this.modalEl.classList.toggle('overlay-celebrate', isCelebrate);
    this.modalContentEl.classList.toggle('modal-celebrate', isCelebrate);
    this.modalEl.classList.add('open');
  }

  closeModal() {
    this.confettiHandle?.stop?.();
    this.confettiHandle = null;
    this.modalEl.classList.remove('open', 'overlay-celebrate');
    this.modalContentEl.classList.remove('modal-celebrate');
    this.modalContentEl.innerHTML = '';
    this.terminal.focus();
  }

  renderAll() {
    renderTree(this.treeEl, this.fs, { flashPaths: this.flashPaths });
    this.flashPaths = new Set();
    this.terminal.setPrompt(`${this.fs.cwd}>`);

    this.renderLevelTitle();

    this.renderDock();
    this.syncHints();
  }

  syncHints() {
    const files = this.fs ? this.fs.list(this.fs.cwd).map((n) => n.name) : [];
    if (this.terminal && typeof this.terminal.setFileCompletions === 'function') {
      this.terminal.setFileCompletions(files);
    }

    if (this.mode !== 'level' || !this.level) {
      this.terminal.setHint('dir');
      this.terminal.setExtraCompletions([]);
      return;
    }

    const sol = this.level.solutionCommand;
    this.terminal.setHint(sol, ui().hint);
    this.terminal.setExtraCompletions([sol]);
  }

  renderDock() {
    const u = ui();
    const loc = getLocale();

    if (this.mode !== 'level' || !this.level) {
      this.dockEl.innerHTML = `
        <h2>${escapeHtml(u.learningGuide)}</h2>
        <p class="objective">${escapeHtml(u.guideAlwaysOn)}</p>
        <div class="learning-box">
          <div class="next-title">${escapeHtml(u.startHere)}</div>
          <ul>
            ${u.startHereItems.map((item) => `<li>${renderMarkdown(item)}</li>`).join('')}
          </ul>
        </div>
        <div class="learning-box">
          <div class="next-title">${escapeHtml(u.sandboxTip)}</div>
          <ul>
            ${u.sandboxTipItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>
        <ul class="goal-list">
          <li class="met">
            <div class="g-label">${escapeHtml(u.noActiveLevel)}</div>
            <div class="g-detail">${escapeHtml(u.noActiveLevelDetail)}</div>
          </li>
        </ul>
        <div class="par-note">${u.guideFlashNote}</div>
      `;
      return;
    }

    const lvl = this.level;
    const diff = this.fs.diffGoalWithCommands(
      lvl.goalFS,
      lvl.goalCwd,
      lvl.goalCommands || null,
      this.golf
    );
    const solved = diff.ok;
    const prog = this.progress[lvl.id];
    const golfNote =
      prog?.best !== undefined
        ? u.bestSoFar(prog.best, lvl.par || 1)
        : u.idealSolution(lvl.par || 1);

    const name = lvl.name[loc] || lvl.name.en_US || lvl.id;
    const obj = lvl.objective || lvl.about[loc] || lvl.about.en_US || '';
    const learning = lvl.learning || [];
    const fieldNotes = lvl.fieldNotes || [];

    const clickToFillTitle = escapeHtml(loc === 'fa' ? 'برای درج در خط فرمان کلیک کنید' : 'Click to fill into terminal');

    const nextBox = solved
      ? `<div class="next-box met">${escapeHtml(u.allSolutionMet)}</div>`
      : `<div class="next-box">
          <div class="next-title">${escapeHtml(u.typeNextTitle)}</div>
          <div class="next-row">
            <span class="g-label">${escapeHtml(u.remainingLabel)}</span>
            <code class="g-cmd" data-fill="${escapeHtml(lvl.solutionCommand)}" style="cursor: pointer;" title="${clickToFillTitle}">${escapeHtml(lvl.solutionCommand)}</code>
          </div>
          <div class="par-note">${escapeHtml(u.wrongCommandNote)}</div>
        </div>`;

    const steps = (lvl.goalCommands && lvl.goalCommands.length > 0)
      ? lvl.goalCommands
      : (lvl.solutionCommand ? lvl.solutionCommand.split(' & ') : [lvl.id]);

    const items = steps.map((cmd, i) => {
      const isCurrent = !solved && i === 0;
      const isMet = solved;
      return `<li class="${isMet ? 'met' : ''}${isCurrent ? ' current' : ''}">
        <div class="g-label" dir="ltr">${isMet ? '✓' : isCurrent ? '▶' : '○'} <code class="g-cmd" data-fill="${escapeHtml(cmd)}" style="cursor: pointer;" title="${clickToFillTitle}">${escapeHtml(cmd)}</code>${
          isCurrent ? ` <span class="chip current-chip">${escapeHtml(u.nowChip || 'now')}</span>` : ''
        }</div>
        <div class="g-detail">${escapeHtml(isMet ? (u.criterionMet || 'Criterion met') : (typeof u.runCommand === 'function' ? u.runCommand(cmd) : `run '${cmd}'`))}</div>
      </li>`;
    });

    const stateNotesHtml = !solved && diff.missingPaths && diff.missingPaths.length
      ? `<div class="par-note">${escapeHtml(u.stateNotes || 'State notes:')} ${escapeHtml(diff.missingPaths.slice(0, 3).join(' · '))}</div>`
      : '';

    this.dockEl.innerHTML = `
      <h2>${escapeHtml(name)}</h2>
      <p class="objective">${escapeHtml(obj)}</p>
      ${
        learning.length
          ? `<div class="learning-box">
              <div class="next-title">${escapeHtml(u.youAreLearning)}</div>
              <ul>${learning.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>
            </div>`
          : ''
      }
      ${
        fieldNotes.length
          ? `<div class="field-box">
              <div class="next-title">${escapeHtml(u.fieldNotesTitle)}</div>
              <ul>${fieldNotes.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>
            </div>`
          : ''
      }
      <div class="par-note">${escapeHtml(golfNote)}</div>
      ${this.solvedFlash ? `<div class="next-box met">${escapeHtml(u.levelSolvedBanner)}</div>` : ''}
      ${nextBox}
      <ul class="goal-list">${items.join('')}</ul>
      ${stateNotesHtml}
    `;

    this.dockEl.querySelectorAll('[data-fill]').forEach((el) => {
      el.addEventListener('click', () => {
        const cmdToFill = el.getAttribute('data-fill');
        if (cmdToFill && this.terminal) {
          this.terminal.inputEl.value = cmdToFill;
          this.terminal.focus();
          this.terminal.syncGhost();
        }
      });
    });
  }

  handleCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;

    this.terminal.push('cmd', `${this.fs.cwd}>${cmd}`);
    const lower = cmd.toLowerCase();

    // Meta routing
    if (lower === 'levels' || lower === 'level') {
      this.openLevelsDialog();
      return;
    }
    if (lower.startsWith('level ')) {
      const id = cmd.slice(6).trim();
      this.startLevel(id);
      return;
    }
    if (lower === 'sandbox') {
      this.enterSandbox();
      return;
    }
    if (lower === 'hint') {
      this.showHint();
      return;
    }
    if (lower === 'eli' || lower === 'explain') {
      this.showEliExplanation(this.eliDepth);
      return;
    }
    if (/^eli(5|10|15|20|phd)$/.test(lower)) {
      this.setEliDepth(lower);
      this.showEliExplanation(lower);
      return;
    }
    if (lower.startsWith('eli ') || lower.startsWith('explain ') || lower.startsWith('depth ')) {
      const parts = lower.split(/\s+/);
      const arg = (parts[1] || '').trim();
      const targetDepth = arg.startsWith('eli') ? arg : `eli${arg}`;
      if (['eli5', 'eli10', 'eli15', 'eli20', 'eliphd'].includes(targetDepth)) {
        this.setEliDepth(targetDepth);
        this.showEliExplanation(targetDepth);
      } else {
        this.terminal.push('meta', 'Available depths: eli5, eli10, eli15, eli20, eliphd');
      }
      return;
    }
    if (lower === 'steps' || lower === 'goal' || lower === 'show goal') {
      this.focusGuide();
      this.terminal.push('meta', ui().guideAlwaysRight);
      return;
    }
    if (lower === 'solution' || lower === 'show solution') {
      this.showSolution();
      return;
    }
    if (lower === 'reset') {
      this.doReset();
      return;
    }
    if (lower === 'undo') {
      this.doUndo();
      return;
    }
    if (lower === 'clear' || lower === 'cls') {
      this.terminal.clear();
      return;
    }
    if (lower === 'lesson' || lower === 'intro' || lower === 'about') {
      this.replayLesson();
      return;
    }
    if (lower === 'help' || lower === '?') {
      this.terminal.push('out', formatUiHelpText(getLocale()));
      this.terminal.push('meta', ui().helpLinks);
      return;
    }
    if (lower === 'help ui' || lower === 'tour') {
      this.openUiHelp(true);
      return;
    }
    if (lower === 'curriculum' || lower === 'outcomes') {
      const summary = summarizeCurriculum(this.progress, getLocale());
      this.terminal.push('out', ui().curriculumOutcomes);
      summary.learned.forEach((l, i) => {
        this.terminal.push('out', `  ${i + 1}. ${l.name} (${l.id})`);
      });
      this.terminal.push('meta', ui().progressLevels(summary.solvedCount, summary.total));
      return;
    }
    if (lower === 'quiz' || lower.startsWith('quiz ')) {
      this.runQuiz(lower.slice(4).trim());
      return;
    }
    if (lower === 'share') {
      this.openShareDialog();
      return;
    }

    // Standard CMD execution
    const beforeSnap = this.fs.snapshot();
    const beforeSpec = this.fs.serialize();

    const result = executeLine(cmd, { fs: this.fs });
    for (const line of result.lines) {
      if (line === '\x0CLS') {
        this.terminal.clear();
        continue;
      }
      this.terminal.push(line.startsWith('ERROR:') ? 'err' : 'out', line);
    }

    const afterSpec = this.fs.serialize();
    if (result.ok) {
      this.undoStack.push(beforeSnap);
      if (this.undoStack.length > 50) this.undoStack.shift();
      if (this.mode === 'level') {
        this.golf.push(cmd);
      }
    }

    this.flashPaths = diffNewPaths(beforeSpec, afterSpec);
    this.renderAll();
    this.checkGoal();
  }

  runQuiz(arg) {
    const qList = ui().quiz;
    if (!arg) {
      this.quizIndex = 0;
      this.askQuiz();
      return;
    }
    const item = qList[this.quizIndex];
    if (!item) return;

    const pick = arg.toUpperCase();
    const idx = pick === 'A' ? 0 : pick === 'B' ? 1 : pick === 'C' ? 2 : -1;
    if (idx < 0) {
      this.terminal.push('err', ui().quizAnswerUsage);
      return;
    }
    if (idx === item.correct) {
      this.terminal.push('ok', ui().correct);
    } else {
      this.terminal.push('err', `Incorrect. Best answer: ${['A', 'B', 'C'][item.correct]} — ${item.a[item.correct]}`);
    }
    this.quizIndex += 1;
    this.askQuiz();
  }

  askQuiz() {
    const qList = ui().quiz;
    const item = qList[this.quizIndex];
    if (!item) {
      this.terminal.push('ok', ui().quizFinished);
      this.quizIndex = 0;
      return;
    }
    this.terminal.push('out', `${ui().quizHeader(this.quizIndex + 1, qList.length)}: ${item.q}`);
    item.a.forEach((ans, i) => {
      this.terminal.push('out', `  ${['A', 'B', 'C'][i]}) ${ans}`);
    });
    this.terminal.push('meta', ui().quizAnswerUsage);
  }

  checkGoal() {
    if (this.mode !== 'level' || !this.level) return;
    const diff = this.fs.diffGoalWithCommands(
      this.level.goalFS,
      this.level.goalCwd,
      this.level.goalCommands || null,
      this.golf
    );
    if (!diff.ok) return;

    const id = this.level.id;
    const count = this.golf.length;
    const prev = this.progress[id] || { solved: false, best: count, sawSolution: false };
    prev.solved = true;
    prev.best = prev.best ? Math.min(prev.best, count) : count;
    this.progress[id] = prev;
    saveProgress(this.progress);

    if (!this.solvedFlash) {
      this.solvedFlash = true;
      this.terminal.push('out', '');
      this.terminal.push('ok', `${ui().levelSolvedBanner} — ${this.level.name[getLocale()] || this.level.name.en_US}`);
      this.terminal.push('meta', ui().partyMode);
      this.celebrateSolve();
    }
  }

  celebrateSolve() {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    this.confettiHandle = launchConfetti(4800);
    playFanfare();

    const u = ui();
    const loc = getLocale();
    const lvl = this.level;
    const nextLvl = nextLevel(lvl.id);
    const cmds = this.golf.length || null;
    const curriculum = summarizeCurriculum(this.progress, loc);
    const par = lvl.par || 1;
    const underPar = cmds !== null && cmds <= par;
    const golfLine =
      cmds === null
        ? u.idealForLevel(par)
        : underPar
          ? `**${cmds}** ${u.idealForLevelShort(par)}`
          : loc === 'fa'
            ? `**${cmds}** کامند (هدف: ${par} کامند). هرچند بیشتر شد اما مرحله با موفقیت تکمیل گردید.`
            : loc === 'de'
              ? `**${cmds}** Befehle (Ziel: ${par} Befehle). Trotzdem gemeistert!`
              : `**${cmds}** ${cmds === 1 ? 'command' : 'commands'} (target: ${par} commands). Still counts — you got there.`;

    const share = buildShareTargets({
      levelName: lvl.name[loc] || lvl.name.en_US || lvl.id,
      levelId: lvl.id,
      commands: cmds,
      par,
      curriculum,
    });

    const cheers = u.cheers;
    const cheer = cheers[Math.floor(Math.random() * cheers.length)] || '';

    const locSeq = locateLevel(lvl.id);
    const seq = locSeq ? sequences[locSeq.sequenceKey] : null;
    const seriesTitle = seq && seq.displayName
      ? (seq.displayName[loc] || seq.displayName.en_US || locSeq.sequenceKey)
      : (locSeq?.sequenceKey || '');

    const total = allLevels().length;
    const solvedCount = curriculum.solvedCount;

    const learnedPreview = curriculum.learned
      .map((l) => `<li>${escapeHtml(l.seriesTitle ? l.seriesTitle + ': ' : '')}${escapeHtml(l.name)}</li>`)
      .join('');

    const modalHtml = `
      <div class="celebrate" aria-live="polite">
        <div class="celebrate-visual" aria-hidden="true">
          <div class="celebrate-ring"></div>
          <div class="celebrate-star">★</div>
        </div>
        <div class="celebrate-badge">${escapeHtml(u.levelSolvedBanner)}</div>
        <h3 class="celebrate-title">${escapeHtml(lvl.name[loc] || lvl.name.en_US)}</h3>
        <p class="celebrate-sub">${escapeHtml(seriesTitle)} · <code>${escapeHtml(lvl.id)}</code></p>
        <p class="celebrate-cheer">${escapeHtml(cheer)}</p>
        <div class="celebrate-stats">${renderMarkdown(golfLine)}</div>
        <div class="celebrate-progress">
          <div class="prog-track"><div class="prog-fill" style="width: ${curriculum.percent}%"></div></div>
          <div class="par-note">${escapeHtml(u.solvedCountLabel ? u.solvedCountLabel(solvedCount, total) : `${solvedCount} / ${total} levels solved`)}</div>
        </div>
        <div class="share-block">
          <div class="next-title">${escapeHtml(u.shareTitle)}</div>
          <div class="learned-preview">
            <div class="par-note">${escapeHtml(u.styleList)}</div>
            <ul>${learnedPreview || `<li>${escapeHtml(u.solveMoreLevels)}</li>`}</ul>
          </div>
          <div class="share-row" role="group" aria-label="${escapeHtml(u.shareGroupLabel)}">
            <button type="button" class="share-btn linkedin" data-share="linkedin">${escapeHtml(u.linkedin)}</button>
            <button type="button" class="share-btn x" data-share="x">${escapeHtml(u.xTwitter)}</button>
            <button type="button" class="share-btn facebook" data-share="facebook">${escapeHtml(u.facebook)}</button>
            <button type="button" class="share-btn copy" data-share="copy">${escapeHtml(u.copyPost)}</button>
          </div>
          <div class="share-status" data-share-status hidden></div>
        </div>
        ${
          nextLvl
            ? `<div class="celebrate-next">${renderMarkdown(u.nextCelebration(nextLvl.id, nextLvl.name[loc] || nextLvl.name.en_US))}</div>`
            : `<div class="celebrate-next">${renderMarkdown(u.lastInPack)}</div>`
        }
        <div class="modal-actions">
          <button type="button" class="btn ghost" data-action="close-modal">${escapeHtml(u.baskInIt)}</button>
          ${
            nextLvl
              ? `<button type="button" class="btn primary" data-action="next-level">${escapeHtml(u.celebrateOn(nextLvl.id))}</button>`
              : `<button type="button" class="btn primary" data-action="open-levels">${escapeHtml(u.browseLevels)}</button>`
          }
        </div>
      </div>
    `;

    this.openModal(modalHtml, { isCelebrate: true });

    this.modalContentEl.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', async (ev) => {
        ev.preventDefault();
        const kind = btn.getAttribute('data-share') || 'copy';
        const status = this.modalContentEl.querySelector('[data-share-status]');
        const result = await shareWithClipboard(kind, share);
        if (!status) return;
        status.hidden = false;
        if (kind === 'copy') {
          status.textContent = result.copied ? u.copyOk : u.copyFail;
          return;
        }
        status.textContent = result.copied ? u.shareCopied : u.shareOpened;
      });
    });

    const nextBtn = this.modalContentEl.querySelector('[data-action="next-level"]');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.closeModal();
        if (nextLvl) this.startLevel(nextLvl.id);
      });
    }

    const levelsBtn = this.modalContentEl.querySelector('[data-action="open-levels"]');
    if (levelsBtn) {
      levelsBtn.addEventListener('click', () => {
        this.closeModal();
        this.openLevelsDialog();
      });
    }

    const closeBtn = this.modalContentEl.querySelector('[data-action="close-modal"]');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    this.modalContentEl.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        ev.stopPropagation();
      }
    });
  }

  showHint() {
    if (this.mode === 'level' && this.level) {
      const hint = this.level.hint[getLocale()] || this.level.hint.en_US;
      this.terminal.push('out', hint);
    } else {
      this.terminal.push('meta', ui().noHintSandbox);
    }
  }

  showSolution() {
    if (this.mode !== 'level' || !this.level) {
      this.terminal.push('meta', ui().noSolutionSandbox);
      return;
    }
    const u = ui();
    const lvl = this.level;
    this.openModal(`
      <div class="levels-dialog">
        <h2>${escapeHtml(u.solutionTitle(lvl.id))}</h2>
        <p>${escapeHtml(u.solutionCommands)}</p>
        <pre><code>${escapeHtml(lvl.solutionCommand)}</code></pre>
        <p class="par-note">${escapeHtml(u.solutionWarn)}</p>
        <div class="modal-actions">
          <button type="button" class="btn primary" id="btn-run-sol">${escapeHtml(u.runSolution)}</button>
          <button type="button" class="btn ghost" id="btn-cancel-sol">${escapeHtml(u.cancel)}</button>
        </div>
      </div>
    `);

    document.getElementById('btn-run-sol')?.addEventListener('click', () => {
      this.closeModal();
      this.doReset();
      const prog = this.progress[lvl.id] || { solved: false, best: null, sawSolution: true };
      prog.sawSolution = true;
      this.progress[lvl.id] = prog;
      saveProgress(this.progress);
      this.handleCommand(lvl.solutionCommand);
    });

    document.getElementById('btn-cancel-sol')?.addEventListener('click', () => {
      this.closeModal();
    });
  }

  doUndo() {
    if (!this.undoStack.length) {
      this.terminal.push('meta', ui().nothingToUndo);
      return;
    }
    const snap = this.undoStack.pop();
    this.fs.restore(snap);
    if (this.golf.length) this.golf.pop();
    this.terminal.push('meta', ui().undoMeta);
    this.renderAll();
    this.checkGoal();
  }

  doReset() {
    if (this.mode === 'level' && this.level) {
      this.fs = new VirtualFileSystem(this.level.startFS);
      if (this.level.startCwd) this.fs.cwd = normalizePath(this.level.startCwd, this.fs.cwd);
      this.fs.ensureDefaultProfile();
      this.golf = [];
      this.undoStack = [];
      this.solvedFlash = false;
      this.terminal.push('meta', ui().resetLevel(this.level.id));
    } else {
      this.fs = new VirtualFileSystem(defaultFsSpec());
      this.golf = [];
      this.undoStack = [];
      this.solvedFlash = false;
      this.terminal.push('meta', ui().resetSandbox);
    }
    this.renderAll();
  }

  enterSandbox() {
    this.mode = 'sandbox';
    this.level = null;
    this.fs = new VirtualFileSystem(defaultFsSpec());
    this.golf = [];
    this.undoStack = [];
    this.solvedFlash = false;
    this.renderAll();
    this.terminal.push('meta', ui().sandboxTitle);
    const url = new URL(window.location.href);
    url.searchParams.delete('level');
    window.history.replaceState({}, '', url.toString());
  }

  startLevel(id) {
    const raw = getLevel(id);
    if (!raw) {
      this.terminal.push('err', ui().unknownLevel(id));
      return;
    }
    this.mode = 'level';
    this.level = localizeLevel(raw, getLocale());
    this.fs = new VirtualFileSystem(this.level.startFS);
    if (this.level.startCwd) this.fs.cwd = normalizePath(this.level.startCwd, this.fs.cwd);
    this.fs.ensureDefaultProfile();
    this.golf = [];
    this.undoStack = [];
    this.solvedFlash = false;
    this.renderAll();
    this.terminal.push('meta', ui().levelMeta(this.level.id, this.level.name[getLocale()] || this.level.name.en_US));
    this.replayLesson();

    const url = new URL(window.location.href);
    url.searchParams.set('level', id);
    window.history.replaceState({}, '', url.toString());
  }

  openWelcomeModal() {
    const u = ui();
    const loc = getLocale();
    const total = allLevels().length;

    const w =
      loc === 'fa'
        ? {
            intro: 'آموزش تعاملی **خط فرمان ویندوز (CMD)** — سندباکس + مراحل هدایت‌شده.',
            board:
              'بورد درخت زنده‌ی فایل‌سیستم مجازی درایو **C:** را نشان می‌دهد. هر فرمانی که اجرا کنید، آن را بلافاصله به‌روز می‌کند.',
            tracks:
              '- مبانی: `echo`, `dir`, `cd`\n- فایل‌ها و مسیرها: `md`, `del`, `copy`\n- پایپ‌ها و فیلترها: `findstr`, `sort`, `>`\n- موضوعات پیشرفته: `&&`, `set`, `for`\n- سیستم و صفات فایل: `attrib`, `where`, `date`\n- اسکریپت و اتوماسیون: `.bat`, `if`, `errorlevel`',
            meta: 'متا: `levels`, `curriculum`, `help`, `hint`, `steps`, `show solution`.',
            levelsCount: `**${total}** مرحله گنجانده شده. برای شروع مرحله‌ها را باز کنید، یا در سندباکس بمانید.`,
            what: '**learn-cmd چیست؟**',
            whatBody:
              'یک آزمایشگاه مرورگری برای CMD: فرمان‌های واقعی ویندوز تایپ می‌کنید و تغییرات درایوی مجازی C: را می‌بینید. برای هسته‌ی آموزش نصب لازم نیست.',
            publisher: '**ناشر**',
            publisherBody:
              'انتشار و نگهداری توسط **Ali Sadeghi Aghili** — برنامه‌نویس، سیستم‌های ویندوز و اتوماسیون. [linktr.ee/aliaghili](https://linktr.ee/aliaghili)',
            github: '- [GitHub — سورس و ایشو](https://github.com/alisadeghiaghili/learn-cmd)',
            coffee: 'Buy Me a Coffee (از ناشر حمایت می‌کند):',
          }
        : loc === 'de'
          ? {
              intro: 'Interaktives **Windows-CMD**-Tutorial — Sandbox + geführte Levels.',
              board:
                'Das Board zeigt die Live-Baumstruktur des virtuellen Laufwerks **C:**. Jeder Befehl aktualisiert sie sofort.',
              tracks:
                '- Basics: `echo`, `dir`, `cd`\n- Dateien & Pfade: `md`, `del`, `copy`\n- Pipes & Filter: `findstr`, `sort`, `>`\n- Fortgeschritten: `&&`, `set`, `for`\n- System & Attribute: `attrib`, `where`, `date`\n- Skripting & Automation: `.bat`, `if`, `errorlevel`',
              meta: 'Meta: `levels`, `curriculum`, `help`, `hint`, `steps`, `show solution`.',
              levelsCount: `**${total}** Levels enthalten. Öffne Levels zum Starten oder bleib in der Sandbox.`,
              what: '**Was ist learn-cmd?**',
              whatBody:
                'Eine Browser-Laborbank für CMD: du tippst echte Windows-Befehle und siehst, wie sich das virtuelle Laufwerk C: ändert. Kein Install für den Tutorial-Kern nötig.',
              publisher: '**Publisher**',
              publisherBody:
                'Veröffentlicht und gepflegt von **Ali Sadeghi Aghili** — Programmer, Windows Systems & Automation. [linktr.ee/aliaghili](https://linktr.ee/aliaghili)',
              github: '- [GitHub — Quelle & Issues](https://github.com/alisadeghiaghili/learn-cmd)',
              coffee: 'Buy Me a Coffee (unterstützt den Publisher):',
            }
          : {
              intro: 'Interactive **Windows Command Line (CMD)** tutorial — sandbox + guided levels.',
              board:
                'The board shows the live virtual **C:** filesystem tree. Every command you run updates it instantly.',
              tracks:
                '- Basics: `echo`, `dir`, `cd`\n- Files & Paths: `md`, `del`, `copy`\n- Pipes & Filters: `findstr`, `sort`, `>`\n- Advanced: `&&`, `set`, `for`\n- System & Attributes: `attrib`, `where`, `date`\n- Scripting & Automation: `.bat`, `if`, `errorlevel`',
              meta: 'Meta: `levels`, `curriculum`, `help`, `hint`, `steps`, `show solution`.',
              levelsCount: `**${total}** levels included. Open Levels to begin, or stay in sandbox.`,
              what: '**What is learn-cmd?**',
              whatBody:
                'A browser lab bench for CMD: you type real Windows commands and watch the virtual C: drive change. No install required for the tutorial core.',
              publisher: '**Publisher**',
              publisherBody:
                'Published and maintained by **Ali Sadeghi Aghili** — programmer, Windows systems & automation. [linktr.ee/aliaghili](https://linktr.ee/aliaghili)',
              github: '- [GitHub — source & issues](https://github.com/alisadeghiaghili/learn-cmd)',
              coffee: 'Buy Me a Coffee (supports the publisher):',
            };

    const bodyHtml = renderMarkdown(
      [
        w.intro,
        '',
        w.board,
        '',
        w.tracks,
        '',
        w.meta,
        '',
        w.levelsCount,
        '',
        w.what,
        w.whatBody,
        '',
        w.publisher,
        w.publisherBody,
        '',
        w.github,
        '',
        w.coffee,
        '',
        COFFEE_BUTTON_HTML,
      ].join('\n')
    );

    this.openModal(`
      <h2>Welcome to Learn <span class="brand-cmd">CMD</span></h2>
      <div class="markdown">${bodyHtml}</div>
      <div class="modal-actions">
        <button type="button" class="btn ghost" id="btn-welcome-sandbox">${escapeHtml(u.sandboxBtn)}</button>
        <button type="button" class="btn primary" id="btn-welcome-levels">${escapeHtml(u.levels)}</button>
      </div>
    `);

    document.getElementById('btn-welcome-levels')?.addEventListener('click', () => {
      this.closeModal();
      this.openLevelsDialog();
    });
    document.getElementById('btn-welcome-sandbox')?.addEventListener('click', () => {
      this.closeModal();
    });
  }

  replayLesson() {
    if (!this.level) {
      this.openWelcomeModal();
      return;
    }

    const loc = getLocale();
    const u = ui();
    const level = this.level;
    const dialog =
      (loc === 'fa' && getDialogFa(this.level.id)) ||
      (this.level.startDialog && (this.level.startDialog[loc] || this.level.startDialog.en_US)) ||
      getDialogFa(this.level.id);

    const childViews = (dialog && dialog.childViews) || [];
    if (!childViews.length) return;

    const fallbackTitle = () =>
      escapeHtml(level.name[loc] || level.name.en_US) || ui().levelMeta(level.id, '');

    let idx = 0;
    const renderSlide = () => {
      const view = childViews[idx];
      const last = idx === childViews.length - 1;
      let title = fallbackTitle();
      let body = '';

      if (view.type === 'ModalAlert') {
        body = renderMarkdown((view.options.markdowns || []).join('\n'));
      } else if (view.type === 'CmdDemonstrationView') {
        const cmd = view.options.command || '';
        const before = (view.options.beforeMarkdowns || []).join('\n');
        const after = (view.options.afterMarkdowns || []).join('\n');
        title = escapeHtml(cmd);
        body = `
          ${renderMarkdown(before)}
          <div class="demo-run">
            <code>${escapeHtml(cmd)}</code>
            <button type="button" class="btn primary" data-demo="${idx}" data-cmd="${escapeHtml(cmd)}">${escapeHtml(u.run)}</button>
          </div>
          <div class="demo-after" hidden>${renderMarkdown(after)}</div>`;
      }

      let actions = '';
      if (idx > 0) {
        actions += `<button type="button" class="btn ghost" data-lesson="back">${escapeHtml(u.back)}</button>`;
      }
      if (!last) {
        actions += `<button type="button" class="btn primary" data-lesson="next">${escapeHtml(u.next)}</button>`;
      } else {
        actions += `<button type="button" class="btn primary" data-lesson="start">${escapeHtml(u.startLevel)}</button>`;
      }

      this.openModal(`<h2>${title}</h2><div class="markdown">${body}</div><div class="modal-actions">${actions}</div>`);

      this.modalContentEl.querySelector('[data-lesson="back"]')?.addEventListener('click', () => {
        idx -= 1;
        renderSlide();
      });
      this.modalContentEl.querySelector('[data-lesson="next"]')?.addEventListener('click', () => {
        idx += 1;
        renderSlide();
      });
      this.modalContentEl.querySelector('[data-lesson="start"]')?.addEventListener('click', () => {
        this.closeModal();
      });

      const demo = this.modalContentEl.querySelector('[data-demo]');
      demo?.addEventListener('click', () => {
        const cmd = demo.getAttribute('data-cmd');
        if (cmd) {
          const clone = this.fs.clone();
          const res = executeLine(cmd, { fs: clone });
          res.lines.forEach((l) => this.terminal.push('out', l));
        }
        const afterEl = this.modalContentEl.querySelector('.demo-after');
        if (afterEl) afterEl.hidden = false;
        demo.disabled = true;
      });
    };

    renderSlide();
  }

  openLevelsDialog() {
    const u = ui();
    const loc = getLocale();
    const groups = Object.entries(sequences).map(([key, seq]) => ({
      key,
      title: seq.displayName[loc] || seq.displayName.en_US,
      about: seq.about[loc] || seq.about.en_US,
      levels: seq.levels,
    }));

    const parNote = (par) =>
      loc === 'fa'
        ? `هدف ${par} کامند`
        : loc === 'de'
          ? `ideal ${par} Befehle`
          : `ideal ${par} cmd${par === 1 ? '' : 's'}`;

    const body = groups
      .map((g) => {
        const rows = g.levels
          .map((lvl) => {
            const prog = this.progress[lvl.id];
            const solved = Boolean(prog && prog.solved);
            const best = prog?.best != null ? prog.best : '';
            const name = lvl.name[loc] || lvl.name.en_US;
            const diff = difficultyForLevel(lvl.id);
            const par = lvl.par || 1;
            const chipInner = solved
              ? `${escapeHtml(u.solvedLabel)} ${escapeHtml(best)}`
              : `<span class="diff-dots" aria-label="${escapeHtml(u.difficultyOf(diff))}">${renderDiffDots(diff)}</span>`;
            return `
              <button type="button" class="level-row ${solved ? 'solved' : ''}" data-level="${escapeHtml(lvl.id)}">
                <span class="id">${escapeHtml(lvl.id)}</span>
                <span class="name">${escapeHtml(name)}</span>
                <span class="par-note">${escapeHtml(parNote(par))}</span>
                <span class="chip ${solved ? 'ok' : ''}" title="${escapeHtml(u.difficultyOf(diff))}">${chipInner}</span>
              </button>
            `;
          })
          .join('');
        return `<div class="series-block"><h3>${escapeHtml(g.title)}</h3><div class="level-list">${rows}</div></div>`;
      })
      .join('');

    this.openModal(`
      <div class="levels-dialog">
        <h2>${escapeHtml(u.levelsTitle)}</h2>
        <p class="levels-sub">${escapeHtml(u.pickChallenge)}</p>
        <div class="legend-box">
          <div class="next-title">${escapeHtml(u.howToRead)}</div>
          <ul class="legend-list">
            <li><span class="diff-dots" aria-hidden="true">${renderDiffDots(3)}</span> ${renderMarkdown(u.difficultyLegend)}</li>
            <li><span class="par-note">${escapeHtml(parNote(3))}</span> ${renderMarkdown(u.idealLegend)}</li>
            <li><span class="chip ok">${escapeHtml(u.solvedLabel)} 3</span> ${renderMarkdown(u.solvedLegend)}</li>
          </ul>
        </div>
        ${body}
        <div class="modal-actions">
          <button type="button" class="btn ghost" id="btn-close-lvls">${escapeHtml(u.close)}</button>
        </div>
      </div>
    `);

    this.modalContentEl.querySelectorAll('[data-level]').forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-level');
        this.closeModal();
        if (id) this.startLevel(id);
      });
    });

    document.getElementById('btn-close-lvls')?.addEventListener('click', () => this.closeModal());
  }

  openUiHelp(runTour = false) {
    if (runTour) startUiTour(document);
    const u = ui();
    this.openModal(`
      <div class="levels-dialog">
        <h2>${escapeHtml(u.uiGuideTitle)}</h2>
        ${uiHelpModalHtml(getLocale())}
        <div class="modal-actions">
          <button type="button" class="btn primary" id="btn-close-help">${escapeHtml(u.close)}</button>
        </div>
      </div>
    `);

    this.modalContentEl.querySelectorAll('[data-focus-id]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-focus-id');
        this.closeModal();
        if (id) startUiTour(document, id, 3500);
      });
    });

    document.getElementById('btn-close-help')?.addEventListener('click', () => this.closeModal());
  }

  openShareDialog() {
    const u = ui();
    const lvl = this.level || { id: 'sandbox', name: { en_US: 'Sandbox' }, par: 1 };
    const count = this.golf.length || null;
    const curriculum = summarizeCurriculum(this.progress, getLocale());
    const share = buildShareTargets({
      levelName: lvl.name[getLocale()] || lvl.name.en_US,
      levelId: lvl.id,
      commands: count,
      par: lvl.par || 1,
      curriculum,
    });

    this.openModal(`
      <div class="levels-dialog">
        <h2>${escapeHtml(u.shareTitle)}</h2>
        <div class="share-block">
          <div class="share-row">
            <button type="button" class="btn share-btn linkedin" data-share="linkedin">LinkedIn</button>
            <button type="button" class="btn share-btn x" data-share="x">X / Twitter</button>
            <button type="button" class="btn share-btn facebook" data-share="facebook">Facebook</button>
            <button type="button" class="btn share-btn copy" data-share="copy">${escapeHtml(u.copyPost)}</button>
          </div>
          <div class="share-status" id="share-dlg-status" hidden></div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn ghost" id="btn-close-share">${escapeHtml(u.close)}</button>
        </div>
      </div>
    `);

    this.modalContentEl.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const kind = btn.getAttribute('data-share');
        const res = await shareWithClipboard(kind, share);
        const status = document.getElementById('share-dlg-status');
        if (status) {
          status.hidden = false;
          status.textContent = res.copied ? u.copyOk : u.shareOpened;
        }
      });
    });

    document.getElementById('btn-close-share')?.addEventListener('click', () => this.closeModal());
  }

  boot() {
    const params = new URLSearchParams(window.location.search);
    const levelId = params.get('level');
    const loc = getLocale();
    setLocale(loc);
    this.renderToolbar();

    this.terminal.push('meta', 'Microsoft Windows [Version 10.0.19045.4170]');
    this.terminal.push('meta', '(learn-cmd virtual machine)');
    this.terminal.push('out', '');

    const summary = summarizeCurriculum(this.progress, loc);
    if (summary.solvedCount > 0) {
      this.terminal.push('out', resumeLine(summary, loc));
    } else {
      this.terminal.push('meta', loc === 'fa' ? 'پیشرفت شما در مرورگر ذخیره می‌شود.' : loc === 'de' ? 'Fortschritt wird automatisch in diesem Browser gespeichert.' : 'Progress is saved automatically in this browser.');
    }

    if (levelId) {
      this.startLevel(levelId);
    } else {
      this.enterSandbox();
      if (!params.has('NODEMO') && !params.has('no-welcome')) {
        this.openWelcomeModal();
      }
    }
  }
}

// Instantiate on load
function bootstrap() {
  if (typeof window !== 'undefined' && !window.learnCmdApp) {
    const app = new App();
    window.learnCmdApp = app;
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
}
