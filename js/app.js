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
  registerCustomLevel,
  listCustomLevels,
  levelFromJson,
} from './levels.js';
import { renderTree, diffNewPaths } from './tree.js';
import { TerminalView } from './terminal.js';
import { launchConfetti, playFanfare } from './confetti.js';
import { loadProgress, saveProgress, summarizeCurriculum, resumeLine } from './progress.js';
import { buildShareTargets, shareWithClipboard, COFFEE_BUTTON_HTML, REPO_URL } from './share.js';
import { getVisitorCount } from './visitor-counter.js';
import { formatUiHelpText, uiHelpModalHtml, startUiTour } from './ui-help.js';
import { getLocale, setLocale, ui, localizeLevel, getDialogFa, LOCALES } from './i18n.js';

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

function renderInline(text) {
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
      const name =
        (this.level.name && (this.level.name[loc] || this.level.name.en_US || Object.values(this.level.name)[0])) ||
        this.level.id;
      const par = this.level.par || 1;
      this.titleEl.textContent = typeof u.titleLine === 'function'
        ? u.titleLine(this.level.id, name, par)
        : `${name} (${this.level.id}) · Par ${par}`;
    } else {
      this.titleEl.textContent = u.sandboxTitle || 'Free Sandbox — Virtual Drive C:';
    }
  }

  remountAfterLocale() {
    const loc = getLocale();
    this.renderToolbar();

    if (this.level) {
      this.level = localizeLevel(this.level, loc);
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
  }

  async initVisitorCounter() {
    this.cachedVisitorCount = 5;
    this.renderVisitorBadge();
    const count = await getVisitorCount();
    if (count !== null) {
      this.cachedVisitorCount = count;
      this.renderVisitorBadge();
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

    const nextBox = solved
      ? `<div class="next-box met">${escapeHtml(u.allSolutionMet)}</div>`
      : `<div class="next-box">
          <div class="next-title">${escapeHtml(u.typeNextTitle)}</div>
          <div class="next-row">
            <span class="g-label">${escapeHtml(u.remainingLabel)}</span>
            <code class="g-cmd">${escapeHtml(lvl.solutionCommand)}</code>
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
        <div class="g-label" dir="ltr">${isMet ? '✓' : isCurrent ? '▶' : '○'} <code>${escapeHtml(cmd)}</code>${
          isCurrent ? ` <span class="chip current-chip">${escapeHtml(u.nowChip || 'now')}</span>` : ''
        }</div>
        <div class="g-detail" dir="ltr">${escapeHtml(isMet ? 'Criterion met' : `run '${cmd}'`)}</div>
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
    this.confettiHandle = launchConfetti(4500);
    playFanfare();

    const u = ui();
    const lvl = this.level;
    const nextLvl = nextLevel(lvl.id);
    const curriculum = summarizeCurriculum(this.progress, getLocale());
    const count = this.golf.length;
    const par = lvl.par || 1;
    const scoreMsg =
      count <= par
        ? `Par met! ${count}/${par} commands.`
        : `Solved in ${count} commands (par was ${par}).`;

    const share = buildShareTargets({
      levelName: lvl.name[getLocale()] || lvl.name.en_US || lvl.id,
      levelId: lvl.id,
      commands: count,
      par,
      curriculum,
    });

    const cheers = u.cheers;
    const cheer = cheers[Math.floor(Math.random() * cheers.length)];

    const modalHtml = `
      <div class="celebrate" aria-live="polite">
        <div class="celebrate-visual" aria-hidden="true">
          <div class="celebrate-ring"></div>
          <div class="celebrate-star">★</div>
        </div>
        <div class="celebrate-badge">${escapeHtml(u.levelSolvedBanner)}</div>
        <h3 class="celebrate-title">${escapeHtml(lvl.name[getLocale()] || lvl.name.en_US)}</h3>
        <p class="celebrate-sub"><code>${escapeHtml(lvl.id)}</code></p>
        <p class="celebrate-cheer">${escapeHtml(cheer)}</p>
        <div class="celebrate-stats">
          <strong>${escapeHtml(scoreMsg)}</strong>
        </div>
        <div class="celebrate-progress">
          <div class="prog-track">
            <div class="prog-fill" style="width: ${curriculum.percent}%"></div>
          </div>
          <div class="par-note">${curriculum.solvedCount} / ${curriculum.total} levels solved (${curriculum.percent}%)</div>
        </div>
        <div class="share-block">
          <div class="next-title">${escapeHtml(u.shareTitle)}</div>
          <div class="share-row">
            <button type="button" class="btn share-btn linkedin" data-share="linkedin">LinkedIn</button>
            <button type="button" class="btn share-btn x" data-share="x">X / Twitter</button>
            <button type="button" class="btn share-btn facebook" data-share="facebook">Facebook</button>
            <button type="button" class="btn share-btn copy" data-share="copy">${escapeHtml(u.copyPost)}</button>
          </div>
          <div class="share-status" id="share-status" hidden></div>
        </div>
        <div class="modal-actions">
          ${
            nextLvl
              ? `<button type="button" class="btn primary" data-action="next-level">${escapeHtml(u.celebrateOn(nextLvl.id))}</button>`
              : `<button type="button" class="btn primary" data-action="open-levels">${escapeHtml(u.browseLevels)}</button>`
          }
          <button type="button" class="btn ghost" data-action="close-modal">${escapeHtml(u.baskInIt)}</button>
        </div>
      </div>
    `;

    this.openModal(modalHtml, { isCelebrate: true });

    this.modalContentEl.querySelectorAll('[data-share]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const kind = btn.getAttribute('data-share');
        const res = await shareWithClipboard(kind, share);
        const status = document.getElementById('share-status');
        if (status) {
          status.hidden = false;
          status.textContent = res.copied ? u.copyOk : u.shareOpened;
        }
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

  replayLesson() {
    if (!this.level) {
      this.openModal(`
        <div class="levels-dialog">
          <h2>${escapeHtml(ui().aboutTitle)}</h2>
          <p>An interactive Windows CMD learning environment with live filesystem visualizer.</p>
          <div class="modal-actions">
            <button type="button" class="btn primary" id="btn-close-about">${escapeHtml(ui().close)}</button>
          </div>
        </div>
      `);
      document.getElementById('btn-close-about')?.addEventListener('click', () => this.closeModal());
      return;
    }

    const loc = getLocale();
    const dialog =
      (loc === 'fa' && getDialogFa(this.level.id)) ||
      (this.level.startDialog && (this.level.startDialog[loc] || this.level.startDialog.en_US)) ||
      getDialogFa(this.level.id);

    if (!dialog || !dialog.childViews || !dialog.childViews.length) return;

    let html = `<div class="lesson-dialog">`;
    dialog.childViews.forEach((view, idx) => {
      if (view.type === 'ModalAlert') {
        const md = (view.options.markdowns || []).join('\n');
        html += `<section class="lesson-card">${renderMarkdown(md)}</section>`;
      } else if (view.type === 'CmdDemonstrationView') {
        const before = (view.options.beforeMarkdowns || []).join('\n');
        const after = (view.options.afterMarkdowns || []).join('\n');
        html += `<section class="lesson-card demo-card">
          ${renderMarkdown(before)}
          <div class="demo-run">
            <code>${escapeHtml(view.options.command || '')}</code>
            <button class="btn primary" data-demo="${idx}" data-cmd="${escapeHtml(view.options.command || '')}">Run</button>
          </div>
          <div id="demo-after-${idx}" hidden>${renderMarkdown(after)}</div>
        </section>`;
      }
    });

    html += `
      <div class="modal-actions">
        <button type="button" class="btn primary" id="btn-start-lvl">${escapeHtml(ui().startLevel)}</button>
        <button type="button" class="btn" id="btn-show-sol">${escapeHtml(ui().solution)}</button>
        <button type="button" class="btn ghost" id="btn-close-dlg">${escapeHtml(ui().close)}</button>
      </div>
    </div>`;

    this.openModal(html);

    this.modalContentEl.querySelectorAll('[data-demo]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        const idx = btn.getAttribute('data-demo');
        if (cmd) {
          const clone = this.fs.clone();
          const res = executeLine(cmd, { fs: clone });
          res.lines.forEach((l) => this.terminal.push('out', l));
        }
        const afterEl = document.getElementById(`demo-after-${idx}`);
        if (afterEl) {
          afterEl.hidden = false;
          btn.disabled = true;
        }
      });
    });

    document.getElementById('btn-start-lvl')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-show-sol')?.addEventListener('click', () => this.showSolution());
    document.getElementById('btn-close-dlg')?.addEventListener('click', () => this.closeModal());
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

    let tabs = '';
    let panels = '';
    groups.forEach((g, i) => {
      tabs += `<button type="button" class="tab-btn ${i === 0 ? 'active' : ''}" data-tab="${g.key}">${escapeHtml(g.title)}</button>`;
      const items = g.levels
        .map((lvl) => {
          const prog = this.progress[lvl.id];
          const solved = prog && prog.solved;
          const best = prog?.best != null ? prog.best : '—';
          const name = lvl.name[loc] || lvl.name.en_US;
          return `
            <li class="level-item ${solved ? 'solved' : ''}" data-level="${lvl.id}">
              <span class="level-name">${escapeHtml(name)}</span>
              <span class="level-golf">best ${best} / par ${lvl.par || 1}</span>
            </li>
          `;
        })
        .join('');

      panels += `
        <div class="tab-panel ${i === 0 ? 'active' : ''}" data-panel="${g.key}">
          <p class="seq-about">${escapeHtml(g.about)}</p>
          <ul class="level-list">${items}</ul>
        </div>
      `;
    });

    this.openModal(`
      <div class="levels-dialog">
        <h2>${escapeHtml(u.levelsTitle)}</h2>
        <p class="levels-sub">${escapeHtml(u.pickChallenge)}</p>
        <div class="levels-tabs">${tabs}</div>
        ${panels}
        <div class="modal-actions">
          <button type="button" class="btn ghost" id="btn-close-lvls">${escapeHtml(u.close)}</button>
        </div>
      </div>
    `);

    this.modalContentEl.querySelectorAll('[data-tab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-tab');
        this.modalContentEl.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
        this.modalContentEl.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        this.modalContentEl.querySelector(`[data-panel="${key}"]`)?.classList.add('active');
      });
    });

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
      this.terminal.push('meta', loc === 'fa' ? 'پیشرفت شما در مرورگر ذخیره می‌شود.' : 'Progress is saved automatically in this browser.');
    }

    if (levelId) {
      this.startLevel(levelId);
    } else {
      this.enterSandbox();
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
