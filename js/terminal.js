/**
 * Interactive virtual terminal component with ghost text autocomplete,
 * inline next-step hint bar, and command history.
 */

'use strict';

/**
 * @typedef {'cmd' | 'out' | 'err' | 'meta' | 'ok'} LogKind
 * @typedef {{ kind: LogKind, text: string }} LogLine
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const BASE_COMMANDS = [
  'dir',
  'dir /b',
  'dir /s',
  'cd Documents',
  'cd ..',
  'cd \\',
  'md work',
  'rd empty',
  'rd /s /q temp',
  'del notes.txt',
  'del *.tmp',
  'ren old.txt new.txt',
  'copy a.txt b.txt',
  'move a.txt Documents',
  'type notes.txt',
  'echo hello',
  'tree',
  'tree /f',
  'find "todo" notes.txt',
  'findstr /r "pattern" file.txt',
  'sort names.txt',
  'fc a.txt b.txt',
  'attrib +r file.txt',
  'set PATH',
  'set /a count=1',
  'where cmd',
  'ipconfig',
  'ipconfig /all',
  'ping 8.8.8.8',
  'whoami',
  'hostname',
  'systeminfo',
  'clip',
  'xcopy src dest /s',
  'robocopy src dest /s',
  'ls',
  'pwd',
  'cat notes.txt',
  'touch new.txt',
  'notepad notes.txt',
  'chcp 65001',
  'start .',
  'explorer .',
  'powershell',
  'cmd',
  'levels',
  'sandbox',
  'hint',
  'steps',
  'goal',
  'show solution',
  'reset',
  'undo',
  'clear',
  'cls',
  'help',
  'tour',
  'curriculum',
  'quiz',
  'share',
];

/**
 * @param {string} value
 * @returns {{ head: string[], current: string, afterSpace: boolean }}
 */
function parseLine(value) {
  const endsWithSpace = /\s$/.test(value);
  const trimmed = value.replace(/\s+$/, '');
  if (!trimmed) {
    return { head: [], current: '', afterSpace: endsWithSpace };
  }
  const parts = trimmed.split(/\s+/);
  if (endsWithSpace) {
    return { head: parts, current: '', afterSpace: true };
  }
  return { head: parts.slice(0, -1), current: parts[parts.length - 1], afterSpace: false };
}

export class TerminalView {
  /**
   * @param {HTMLElement} root
   * @param {(cmd: string) => void} onSubmit
   */
  constructor(root, onSubmit) {
    this.onSubmit = onSubmit;
    root.innerHTML = `
      <div class="term-log" id="term-log" role="log" aria-live="polite" dir="ltr"></div>
      <div class="term-hint" id="term-hint" hidden dir="ltr"></div>
      <div class="term-input-row" dir="ltr">
        <label class="prompt" id="term-prompt" for="term-input">C:\\Users\\student&gt;</label>
        <div class="term-input-wrap" id="term-input-wrap">
          <div class="term-ghost" id="term-ghost" aria-hidden="true"></div>
          <input
            id="term-input"
            class="term-input"
            type="text"
            autocomplete="off"
            spellcheck="false"
            dir="ltr"
            aria-label="Command prompt input"
          />
        </div>
      </div>
    `;

    this.logEl = /** @type {HTMLElement} */ (root.querySelector('#term-log'));
    this.hintEl = /** @type {HTMLElement} */ (root.querySelector('#term-hint'));
    this.promptEl = /** @type {HTMLElement} */ (root.querySelector('#term-prompt'));
    this.wrapEl = /** @type {HTMLElement} */ (root.querySelector('#term-input-wrap'));
    this.ghostEl = /** @type {HTMLElement} */ (root.querySelector('#term-ghost'));
    this.inputEl = /** @type {HTMLInputElement} */ (root.querySelector('#term-input'));

    /** @type {LogLine[]} */
    this.lines = [];
    /** @type {string[]} */
    this.history = [];
    this.historyIdx = -1;
    this.draft = '';
    this.hint = '';
    /** @type {string[]} */
    this.extraCompletions = [];
    /** @type {string[]} */
    this.fileCompletions = [];
    /** @type {CanvasRenderingContext2D | null} */
    this.measureCtx = null;

    this.inputEl.addEventListener('keydown', (e) => this.onKey(e));
    this.inputEl.addEventListener('input', () => this.syncGhost());
  }

  focus() {
    if (document.querySelector('.modal.open, .overlay.open')) return;
    this.inputEl.focus();
    const len = this.inputEl.value.length;
    try {
      this.inputEl.setSelectionRange(len, len);
    } catch {
      // ignore
    }
  }

  /**
   * @param {string} promptText
   */
  setPrompt(promptText) {
    this.promptEl.textContent = promptText;
  }

  /**
   * @param {LogLine[]} lines
   */
  setLog(lines) {
    this.lines = lines;
    this.render();
  }

  /**
   * @param {LogKind} kind
   * @param {string} text
   */
  push(kind, text) {
    if (kind === 'cmd' && text) {
      this.history.push(text);
      this.historyIdx = this.history.length;
    }
    this.lines.push({ kind, text });
    if (this.lines.length > 500) this.lines = this.lines.slice(-350);
    this.render();
  }

  clear() {
    this.lines = [];
    this.render();
  }

  render() {
    const html = this.lines
      .map((l) => {
        const prefix = l.kind === 'cmd' ? '' : '';
        const lines = l.text.split('\n');
        return lines
          .map((row) => `<div class="term-line term-${l.kind}">${prefix}${escapeHtml(row)}</div>`)
          .join('');
      })
      .join('');
    this.logEl.innerHTML = html;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  /**
   * @param {string | null} command
   * @param {string} [hintNote]
   */
  setHint(command, hintNote = '') {
    this.hint = command ? command.trim() : '';
    this.inputEl.placeholder = this.hint
      ? `Next: ${this.hint}`
      : 'Type a command — help · levels · hint · steps';
    this.hintEl.hidden = !this.hint;
    if (this.hint) {
      const note = hintNote || 'Tab autocompletes';
      this.hintEl.innerHTML = `Next: <code>${escapeHtml(this.hint)}</code> <span class="term-hint-note">· ${escapeHtml(note)}</span>`;
    } else {
      this.hintEl.textContent = '';
    }
    this.syncGhost();
  }

  /**
   * @param {string[]} commands
   */
  setExtraCompletions(commands) {
    this.extraCompletions = commands.filter(Boolean);
  }

  /**
   * @param {string[]} names
   */
  setFileCompletions(names) {
    this.fileCompletions = (names || []).filter(Boolean);
  }

  /**
   * @returns {string[]}
   */
  allCompletions() {
    return [
      ...new Set([
        ...(this.hint ? [this.hint] : []),
        ...this.extraCompletions,
        ...BASE_COMMANDS,
        ...this.history.slice().reverse(),
      ]),
    ];
  }

  /**
   * @param {string[]} head
   * @param {string} current
   * @returns {string[]}
   */
  matchingCommands(head, current) {
    const cur = current.toLowerCase();
    return this.allCompletions().filter((cmd) => {
      const words = cmd.split(/\s+/);
      if (words.length <= head.length) {
        if (head.length && words.length === head.length) {
          return words.every((w, i) => w.toLowerCase() === head[i].toLowerCase());
        }
        return false;
      }
      for (let i = 0; i < head.length; i += 1) {
        if (words[i].toLowerCase() !== head[i].toLowerCase()) return false;
      }
      if (!cur) return true;
      return (words[head.length] || '').toLowerCase().startsWith(cur);
    });
  }

  /**
   * @param {string[]} head
   * @param {string} current
   * @returns {string[]}
   */
  nextWords(head, current) {
    const matches = this.matchingCommands(head, current);
    /** @type {string[]} */
    const words = [];
    const push = (w) => {
      if (!w) return;
      if (!words.some((x) => x.toLowerCase() === w.toLowerCase())) words.push(w);
    };

    if (this.hint) {
      const hw = this.hint.split(/\s+/);
      const matchHead = head.every((h, i) => hw[i] && hw[i].toLowerCase() === h.toLowerCase());
      if (matchHead && hw[head.length]) push(hw[head.length]);
    }
    for (const cmd of matches) {
      push(cmd.split(/\s+/)[head.length]);
    }
    if (head.length >= 1 && this.fileCompletions && this.fileCompletions.length) {
      for (const fn of this.fileCompletions) {
        push(fn);
      }
    }
    return words.filter((w) => !current || w.toLowerCase().startsWith(current.toLowerCase()));
  }

  /**
   * @param {string} text
   * @returns {number}
   */
  measureText(text) {
    if (!this.measureCtx) {
      const canvas = document.createElement('canvas');
      this.measureCtx = canvas.getContext('2d');
    }
    const ctx = this.measureCtx;
    if (!ctx) return text.length * 8.2;
    const font = getComputedStyle(this.inputEl).font;
    ctx.font = font || '13px "Cascadia Code", Consolas, monospace';
    return ctx.measureText(text).width;
  }

  syncGhost() {
    const value = this.inputEl.value;
    this.ghostEl.textContent = '';
    this.wrapEl.classList.remove('has-ghost');

    if (!value) return;

    const { head, current, afterSpace } = parseLine(value);
    const words = this.nextWords(head, afterSpace ? '' : current);
    const first = words[0];
    if (!first) return;

    if (afterSpace) {
      this.ghostEl.textContent = first;
      this.ghostEl.style.left = `${this.measureText(value)}px`;
      this.wrapEl.classList.add('has-ghost');
      return;
    }

    if (!first.toLowerCase().startsWith(current.toLowerCase()) || first.length <= current.length) {
      return;
    }

    const rest = first.slice(current.length);
    this.ghostEl.textContent = rest;
    this.ghostEl.style.left = `${this.measureText(value)}px`;
    this.wrapEl.classList.add('has-ghost');
  }

  /**
   * @param {KeyboardEvent} e
   */
  onKey(e) {
    const value = this.inputEl.value;

    if (e.key === 'Tab') {
      e.preventDefault();
      const ghost = this.ghostEl.textContent;
      if (ghost) {
        const needsSpace = !value.endsWith(' ') && !ghost.startsWith(' ');
        this.inputEl.value = value + ghost + (needsSpace ? ' ' : '');
        this.syncGhost();
      } else {
        // Fallback: cycle through completions
        const match = this.allCompletions().find((c) =>
          c.toLowerCase().startsWith(value.toLowerCase().trim())
        );
        if (match) {
          this.inputEl.value = match;
          this.syncGhost();
        }
      }
      return;
    }

    if (e.key === 'ArrowRight' && this.inputEl.selectionStart === value.length) {
      const ghost = this.ghostEl.textContent;
      if (ghost) {
        e.preventDefault();
        this.inputEl.value = value + ghost;
        this.syncGhost();
        return;
      }
    }

    if (e.key === 'Enter') {
      const cmd = value;
      this.inputEl.value = '';
      this.syncGhost();
      this.onSubmit(cmd);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.historyIdx === this.history.length) {
        this.draft = value;
      }
      if (this.historyIdx > 0) {
        this.historyIdx -= 1;
        this.inputEl.value = this.history[this.historyIdx] || '';
        this.syncGhost();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.historyIdx < this.history.length - 1) {
        this.historyIdx += 1;
        this.inputEl.value = this.history[this.historyIdx] || '';
        this.syncGhost();
      } else if (this.historyIdx === this.history.length - 1) {
        this.historyIdx += 1;
        this.inputEl.value = this.draft;
        this.syncGhost();
      }
      return;
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      this.push('cmd', (this.promptEl.textContent || '') + value + '^C');
      this.inputEl.value = '';
      this.syncGhost();
    }
  }
}
