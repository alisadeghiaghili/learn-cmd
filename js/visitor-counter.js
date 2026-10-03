/**
 * Visitor counter client with local deduplication and badge SVG parsing.
 * Fetches page visitor count and renders a clean numeric stat in the toolbar.
 */

'use strict';

const STORAGE_KEY = 'learn-cmd:visitor-count-cache';
const BADGE_URL = 'https://api.visitorbadge.io/api/combined?path=learn-cmd';

/**
 * Extracts the numeric visitor count from the visitorbadge SVG payload.
 *
 * @param {string} svg
 * @returns {number | null}
 */
export function parseVisitorBadgeSvg(svg) {
  if (!svg || typeof svg !== 'string') return null;
  const match = svg.match(/VISITORS:\s*([\d.,]+[KMB]?)/i);
  const raw = (match ? match[1] : '').replace(/,/g, '');
  if (!raw) return null;

  const suffix = raw.slice(-1).toUpperCase();
  const scale = { K: 1e3, M: 1e6, B: 1e9 }[suffix] || 1;
  const numPart = scale > 1 ? raw.slice(0, -1) : raw;
  const numeric = Number.parseFloat(numPart) * scale;
  return Number.isFinite(numeric) && numeric >= 0 ? Math.round(numeric) : null;
}

/**
 * Retrieves the visitor count, incrementing on the first visit per browser,
 * while returning cached count on subsequent visits within the same session.
 *
 * @returns {Promise<number | null>}
 */
export async function getVisitorCount() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const cached = JSON.parse(raw);
      if (typeof cached.count === 'number' && Number.isFinite(cached.count)) {
        return cached.count;
      }
    }
  } catch {
    // LocalStorage may fail in restricted private browsing
  }

  try {
    const res = await fetch(BADGE_URL, {
      cache: 'no-store',
      headers: {
        Accept: 'image/svg+xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) return null;

    const svg = await res.text();
    const count = parseVisitorBadgeSvg(svg);

    if (count !== null) {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ count, at: Date.now() })
        );
      } catch {
        // quota or private mode
      }
    }

    return count;
  } catch {
    return null;
  }
}
