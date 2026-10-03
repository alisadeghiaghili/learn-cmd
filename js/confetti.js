/**
 * Full-page celebration confetti burst and procedural audio fanfare.
 *
 * Canvas-based particle simulation with prefers-reduced-motion fallback,
 * and a WebAudio 4-note victory chord without external audio files.
 */

'use strict';

const COLORS = ['#00A4EF', '#2DD4BF', '#F59E0B', '#34D399', '#60A5FA', '#F472B6', '#E8EEF4'];

/**
 * @typedef {Object} ConfettiHandle
 * @property {() => void} stop
 */

/**
 * Launch full-screen confetti particles.
 *
 * @param {number} [durationMs=4500]
 * @returns {ConfettiHandle | null}
 */
export function launchConfetti(durationMs = 4500) {
  if (typeof document === 'undefined') return null;

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  if (reduceMotion) {
    const layer = document.createElement('div');
    layer.className = 'confetti-static';
    layer.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layer);
    return {
      stop: () => layer.remove(),
    };
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);
  document.body.appendChild(canvas);

  /**
   * @typedef {Object} Piece
   * @property {number} x
   * @property {number} y
   * @property {number} w
   * @property {number} h
   * @property {string} color
   * @property {number} vx
   * @property {number} vy
   * @property {number} rot
   * @property {number} vr
   * @property {'rect' | 'tri' | 'ribbon'} shape
   */

  /** @type {Piece[]} */
  const pieces = [];

  /**
   * @param {number} count
   * @param {boolean} [fromSides=false]
   */
  const spawn = (count, fromSides = false) => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    for (let i = 0; i < count; i += 1) {
      const rand = Math.random();
      const shape = rand < 0.35 ? 'ribbon' : rand < 0.5 ? 'tri' : 'rect';
      pieces.push({
        x: fromSides ? (Math.random() < 0.5 ? -20 : w + 20) : w * 0.2 + Math.random() * w * 0.6,
        y: fromSides ? h * 0.35 + Math.random() * h * 0.3 : -20 - Math.random() * h * 0.35,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        vx: fromSides
          ? (Math.random() < 0.5 ? 2.5 : -2.5) + (Math.random() - 0.5)
          : (Math.random() - 0.5) * 2.5,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.25,
        shape,
      });
    }
  };

  spawn(70);
  spawn(40, true);

  const started = performance.now();
  let raf = 0;
  let rainTimer = window.setInterval(() => {
    if (performance.now() - started > durationMs - 1200) {
      window.clearInterval(rainTimer);
      return;
    }
    spawn(18);
  }, 280);

  /** @param {number} now */
  const frame = (now) => {
    const elapsed = now - started;
    const h = window.innerHeight;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (const p of pieces) {
      p.vy += 0.035;
      p.vx *= 0.995;
      p.x += p.vx + Math.sin((now + p.y) / 400) * 0.4;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = elapsed > durationMs - 600 ? Math.max(0, (durationMs - elapsed) / 600) : 1;

      if (p.shape === 'tri') {
        ctx.beginPath();
        ctx.moveTo(0, -p.h / 2);
        ctx.lineTo(p.w / 2, p.h / 2);
        ctx.lineTo(-p.w / 2, p.h / 2);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        ctx.fillRect(-p.w / 2, -p.h / 6, p.w, p.h / 3);
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();

      if (p.y > h + 40) {
        p.y = -20;
        p.x = Math.random() * window.innerWidth;
        p.vy = 2 + Math.random() * 2;
      }
    }

    if (elapsed < durationMs) {
      raf = requestAnimationFrame(frame);
    } else {
      stop();
    }
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    window.clearInterval(rainTimer);
    window.removeEventListener('resize', resize);
    canvas.remove();
  };

  raf = requestAnimationFrame(frame);
  window.setTimeout(stop, durationMs + 400);

  return { stop };
}

/**
 * Play a celebratory WebAudio 4-note chord.
 */
export function playFanfare() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const t0 = now + i * 0.09;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.08, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.25);
    });

    window.setTimeout(() => void ctx.close().catch(() => {}), 1200);
  } catch {
    // Audio optional; ignore autoplay restrictions
  }
}
