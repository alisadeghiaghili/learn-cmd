/**
 * Progress persistence and curriculum summary.
 *
 * Persists solved levels and command-golf scores across sessions using
 * synchronized localStorage and cookie storage.
 */

'use strict';

import { allLevels, nextLevel } from './levels.js';

export const STORAGE_KEY = 'learn-cmd.progress.v2';
export const COOKIE_KEY = 'learn_cmd_progress';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~400 days

/**
 * @typedef {Object} LevelProgress
 * @property {boolean} solved
 * @property {number} [best]
 * @property {boolean} [sawSolution]
 */

/**
 * @returns {string | null}
 */
function readCookie() {
  if (typeof document === 'undefined') return null;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey !== COOKIE_KEY) continue;
    try {
      return decodeURIComponent(rest.join('='));
    } catch {
      return rest.join('=');
    }
  }
  return null;
}

/**
 * @param {string} payload
 */
function writeCookie(payload) {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(payload);
  document.cookie = `${COOKIE_KEY}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * @param {string | null} raw
 * @returns {Record<string, LevelProgress> | null}
 */
function parseBlob(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'progress' in parsed) {
      return parsed.progress || {};
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Load progress merged from localStorage and cookies.
 *
 * @returns {Record<string, LevelProgress>}
 */
export function loadProgress() {
  let fromLocal = null;
  let fromCookie = null;
  try {
    fromLocal = parseBlob(localStorage.getItem(STORAGE_KEY));
  } catch {
    fromLocal = null;
  }
  try {
    fromCookie = parseBlob(readCookie());
  } catch {
    fromCookie = null;
  }

  /** @type {Record<string, LevelProgress>} */
  const merged = {};
  for (const src of [fromCookie || {}, fromLocal || {}]) {
    for (const [id, prog] of Object.entries(src)) {
      if (!prog) continue;
      const prev = merged[id];
      merged[id] = {
        solved: Boolean(prog.solved || prev?.solved),
        sawSolution: Boolean(prog.sawSolution || prev?.sawSolution),
        best:
          prev?.best === undefined
            ? prog.best
            : prog.best === undefined
              ? prev.best
              : Math.min(prev.best, prog.best),
      };
    }
  }
  return merged;
}

/**
 * Save progress to both localStorage and cookie.
 *
 * @param {Record<string, LevelProgress>} progress
 */
export function saveProgress(progress) {
  const blob = {
    progress,
    savedAt: new Date().toISOString(),
  };
  const payload = JSON.stringify(blob);
  try {
    localStorage.setItem(STORAGE_KEY, payload);
  } catch {
    // LocalStorage quota or restricted mode
  }
  writeCookie(payload);
}

/**
 * @typedef {Object} CurriculumSummary
 * @property {number} solvedCount
 * @property {number} total
 * @property {Array<{ id: string, name: string, commands: string[] }>} learned
 * @property {Array<{ id: string, name: string, commands: string[] }>} remaining
 * @property {{ id: string, name: string, commands: string[] } | null} next
 * @property {number} percent
 */

/**
 * Summarize student progress across all sequenced lessons.
 *
 * @param {Record<string, LevelProgress>} progress
 * @param {string} [lang='en']
 * @returns {CurriculumSummary}
 */
export function summarizeCurriculum(progress, lang = 'en') {
  const levels = allLevels();
  const learned = [];
  const remaining = [];
  let next = null;

  for (const lvl of levels) {
    const nameStr =
      (lvl.name && (lvl.name[lang] || lvl.name.en_US || Object.values(lvl.name)[0])) || lvl.id;
    const item = {
      id: lvl.id,
      name: nameStr,
      commands: [lvl.solutionCommand],
    };
    if (progress[lvl.id]?.solved) {
      learned.push(item);
    } else {
      remaining.push(item);
      if (!next) next = item;
    }
  }

  const lastSolvedIdx = levels.reduce(
    (acc, l, i) => (progress[l.id]?.solved ? i : acc),
    -1
  );
  if (lastSolvedIdx >= 0) {
    const n = nextLevel(levels[lastSolvedIdx].id);
    if (n && !progress[n.id]?.solved) {
      const match = remaining.find((r) => r.id === n.id);
      if (match) next = match;
    }
  }

  return {
    solvedCount: learned.length,
    total: levels.length,
    learned,
    remaining,
    next,
    percent: levels.length ? Math.round((learned.length / levels.length) * 100) : 0,
  };
}

/**
 * Generate a welcome resume message based on stored progress.
 *
 * @param {CurriculumSummary} summary
 * @param {string} [lang='en']
 * @returns {string}
 */
export function resumeLine(summary, lang = 'en') {
  const isFa = lang === 'fa';
  if (!summary.solvedCount) {
    return isFa
      ? `هنوز مرحله‌ای تکمیل نشده (${summary.total} مرحله آماده است). با دستور \`levels\` شروع کن.`
      : `No saved progress yet (${summary.total} levels waiting). Start with \`levels\`.`;
  }
  const nextText = summary.next
    ? isFa
      ? `مرحله بعدی: ${summary.next.name} (${summary.next.id})`
      : `Next up: ${summary.next.name} (${summary.next.id})`
    : isFa
      ? 'تمامی مراحل با موفقیت به پایان رسیده‌اند.'
      : 'All levels cleared.';

  if (isFa) {
    return [
      `خوش آمدید — پیشرفت ذخیره‌شده: ${summary.solvedCount}/${summary.total} مرحله (${summary.percent}٪).`,
      nextText,
      `برای انتخاب مرحله \`levels\` را تایپ کن.`,
    ].join('\n');
  }

  return [
    `Welcome back — progress saved: ${summary.solvedCount}/${summary.total} levels (${summary.percent}%).`,
    nextText,
    `Open \`levels\` to resume. Type \`steps\` inside a level for guidance.`,
  ].join('\n');
}
