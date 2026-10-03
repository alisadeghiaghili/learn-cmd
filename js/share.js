/**
 * Social sharing links and formatted text builders for achievements.
 */

'use strict';

export const LIVE_URL = 'https://alisadeghiaghili.github.io/learn-cmd/';
export const SHARE_URL = 'https://alisadeghiaghili.github.io/learn-cmd/';
export const REPO_URL = 'https://github.com/alisadeghiaghili/learn-cmd';
export const COFFEE_URL = 'https://www.buymeacoffee.com/alisadeghil';
export const PUBLISHER = 'Ali Sadeghi Aghili';
export const COFFEE_BUTTON_HTML = `<a href="${COFFEE_URL}" target="_blank" rel="noopener noreferrer"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=alisadeghil&button_colour=2a3a4a&font_colour=ffffff&font_family=Cookie&outline_colour=ffffff&coffee_colour=FFDD00" alt="Buy me a coffee" /></a>`;

/**
 * @typedef {Object} ShareContext
 * @property {string} levelName
 * @property {string} levelId
 * @property {number | null} commands
 * @property {number} par
 * @property {import('./progress.js').CurriculumSummary} curriculum
 */

/**
 * @param {ShareContext} ctx
 * @returns {string}
 */
export function shareMessageLinkedIn(ctx) {
  const c = ctx.curriculum;
  const golfPart =
    ctx.commands !== null
      ? ` Solved in ${ctx.commands} command${ctx.commands === 1 ? '' : 's'} (par ${ctx.par}).`
      : '';
  const parts = [
    `🎯 Cleared "${ctx.levelName}" (${ctx.levelId}) on learn-cmd!${golfPart}`,
    '',
    `Learning the Windows command line and cmd.exe through an interactive live filesystem visualizer and command golf.`,
    '',
    `Progress: ${c.solvedCount} of ${c.total} levels solved (${c.percent}% completed).`,
    '',
    `Try it out here: ${SHARE_URL}`,
    '',
    `Open source on GitHub: ${REPO_URL}`,
  ];
  return parts.join('\n');
}

/**
 * @param {ShareContext} ctx
 * @returns {string}
 */
export function shareMessageX(ctx) {
  const c = ctx.curriculum;
  const golfPart = ctx.commands !== null ? ` in ${ctx.commands}/${ctx.par} cmds` : '';
  const text = `Just solved "${ctx.levelName}"${golfPart} on learn-cmd! (${c.solvedCount}/${c.total} levels clear) 💻\n${SHARE_URL}`;
  return text;
}

/**
 * @param {ShareContext} ctx
 * @returns {{ linkedin: string, x: string, facebook: string, text: string, shortText: string, url: string }}
 */
export function buildShareTargets(ctx) {
  const longText = shareMessageLinkedIn(ctx);
  const shortText = shareMessageX(ctx);
  const url = SHARE_URL;
  return {
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent('learn-cmd — Interactive Windows CMD Tutorial')}&summary=${encodeURIComponent(longText)}&source=learn-cmd`,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shortText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(longText)}`,
    text: longText,
    shortText,
    url,
  };
}

/**
 * @param {string} url
 */
export function openShareWindow(url) {
  window.open(url, '_blank', 'noopener,noreferrer,width=720,height=640');
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copySharePayload(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/**
 * @param {'linkedin' | 'facebook' | 'x' | 'copy'} kind
 * @param {ReturnType<typeof buildShareTargets>} targets
 * @returns {Promise<{ opened: boolean, copied: boolean }>}
 */
export async function shareWithClipboard(kind, targets) {
  if (kind === 'copy') {
    return { opened: false, copied: await copySharePayload(targets.text) };
  }
  const copied = await copySharePayload(kind === 'x' ? targets.shortText : targets.text);
  const href =
    kind === 'linkedin' ? targets.linkedin : kind === 'facebook' ? targets.facebook : targets.x;
  openShareWindow(href);
  return { opened: true, copied };
}
