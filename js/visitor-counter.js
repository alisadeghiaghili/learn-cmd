/**
 * Visitor counter client with local deduplication and badge SVG parsing.
 * Fetches page visitor count and renders a clean numeric stat in the toolbar.
 *
 * Implements strict browser-level deduplication via localStorage (identical
 * to learn-dvc) so that page reloads do not increment the counter, ensuring
 * only unique visitors are counted.
 */

'use strict';

export const STORAGE_KEY = 'learn-cmd:visitor-count-unique';
export const LAST_VISIT_KEY = 'learn-cmd:last-visit-date';
export const COUNT_API_BASE = 'https://countapi.mileshilliard.com/api/v1';
export const COUNT_KEY = 'alisadeghiaghili-learn-cmd';
export const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=alisadeghiaghili-learn-cmd-unique';
export const HISTORICAL_OFFSET = 43;
export const BASE_COUNT = 44;

/**
 * Normalizes Eastern Arabic and Persian numerals to Western digits (0-9).
 *
 * @param {string} str
 * @returns {string}
 */
export function normalizeDigits(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1776 + 48))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632 + 48));
}

/**
 * Extracts the numeric unique visitor count from the visitorbadge SVG payload.
 * Handles commas, K/M/B abbreviations, and Persian/Arabic numerals.
 *
 * @param {string} svg
 * @returns {number | null}
 */
export function parseVisitorBadgeSvg(svg) {
  if (!svg || typeof svg !== 'string') return null;
  const normalized = normalizeDigits(svg);
  const match =
    normalized.match(/VISITORS:\s*([\d.,]+[KMB]?)/i) ||
    normalized.match(/aria-label=["']VISITORS:\s*([\d.,]+[KMB]?)/i);
  const raw = (match ? match[1] : '').replace(/,/g, '');
  if (!raw) return null;

  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix] || 1;
  const numPart = scale > 1 ? raw.slice(0, -1) : raw;
  const numeric = Number.parseFloat(numPart) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

/**
 * Retrieves the cached visitor count from localStorage if available.
 * Always ensures the count is at least BASE_COUNT.
 *
 * @returns {number | null}
 */
export function getCachedVisitorCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (typeof cached?.count === 'number' && Number.isFinite(cached.count)) {
        return Math.max(BASE_COUNT, cached.count);
      }
    }
  } catch {
    // LocalStorage may fail in restricted private browsing
  }
  return null;
}

/**
 * Saves count to local cache.
 *
 * @param {number} count
 * @returns {void}
 */
function cacheCount(count) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count, at: Date.now() }));
  } catch {}
}

/**
 * Checks if the user already visited today (UTC day string).
 *
 * @returns {boolean}
 */
function isNewDailyVisit() {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    if (lastVisit === today) {
      return false;
    }
    localStorage.setItem(LAST_VISIT_KEY, today);
    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieves the visitor count, incrementing on the first visit per day per browser,
 * while returning cached / read-only count on subsequent visits to count unique visitors.
 * Always ensures the displayed count starts from at least BASE_COUNT (44).
 *
 * @returns {Promise<number>}
 */
export async function getVisitorCount() {
  // 1. Check local cache first: if already visited in this browser, return cached count
  // to avoid re-fetching and artificially inflating visitor counts on page reload.
  const cached = getCachedVisitorCount();
  if (cached !== null) {
    return cached;
  }

  const isNew = isNewDailyVisit();
  const action = isNew ? 'hit' : 'get';

  // 2. Try CountAPI (JSON, CORS enabled, fast, distinct get vs hit without uncontrolled increments)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`${COUNT_API_BASE}/${action}/${COUNT_KEY}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (typeof data?.value === 'number' && Number.isFinite(data.value) && data.value > 0) {
        const total = Math.max(BASE_COUNT, data.value + HISTORICAL_OFFSET);
        cacheCount(total);
        return total;
      }
    }
  } catch {
    // CountAPI network error or timeout, proceed to fallback
  }

  // 3. Fallback to SVG Badge Provider ONLY on genuine new visits if CountAPI failed
  if (isNew) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(BADGE_URL, {
        cache: 'no-store',
        signal: controller.signal,
        headers: {
          Accept: 'image/svg+xml, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const svg = await res.text();
        const parsed = parseVisitorBadgeSvg(svg);
        if (parsed !== null && parsed > 0) {
          const total = Math.max(BASE_COUNT, BASE_COUNT + (parsed - 1));
          cacheCount(total);
          return total;
        }
      }
    } catch {}
  }

  return BASE_COUNT;
}
