// audio.js — everything is synthesized at runtime; no audio files exist in this project.
// A tiny positional model: inverse-distance gain, stereo pan from the listener basis,
// and a low-pass that opens/closes with distance so far gunfire sounds "outside".
import { settings } from './settings.js';
import { clamp } from './math.js';

let ctx = null, master = null, muffle = null, comp = null, noiseBuf = null;
let listener = { x: 0, y: 0, z: 0 }, right = { x: 0, y: -1, z: 0 };
let deafUntil = 0;

export const Audio = {
  get ready() { return !!ctx; },
  get time() { return ctx ? ctx.currentTime : 0; },
};

export function initAudio() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = settings.volume;
  muffle = ctx.createBiquadFilter();
  muffle.type = 'lowpass';
  muffle.frequency.value = 20000;
  comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12; comp.knee.value = 24; comp.ratio.value = 6;
  comp.attack.value = 0.002; comp.release.value = 0.18;
  master.connect(muffle); muffle.connect(comp); comp.connect(ctx.destination);

  // 2 s of white noise reused by every noise-based voice
  const n = ctx.sampleRate * 2;
  noiseBuf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
}

export function resumeAudio() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}
export function setVolume(v) { if (master) master.gain.value = v; }
export function setListener(pos, rightVec) { listener = pos; right = rightVec; }

/** temporary hearing loss (flashbang / explosion) */
export function deafen(seconds, cutoff = 420) {
  if (!ctx) return;
  deafUntil = Math.max(deafUntil, ctx.currentTime + seconds);
  const t = ctx.currentTime;
  muffle.frequency.cancelScheduledValues(t);
  muffle.frequency.setValueAtTime(cutoff, t);
  muffle.frequency.exponentialRampToValueAtTime(20000, t + seconds);
  // ear ringing
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 4300;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.10, t + 0.05);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + seconds + 0.05);
}

// ---------------------------------------------------------------- routing
function spatial(pos, refDist = 380, maxDist = 4200) {
  const g = ctx.createGain();
  if (!pos) { g.gain.value = 1; g.connect(master); return { node: g, dist: 0, gain: 1 }; }
  const dx = pos.x - listener.x, dy = pos.y - listener.y, dz = pos.z - listener.z;
  const dist = Math.hypot(dx, dy, dz);
  const att = clamp(refDist / (refDist + Math.max(0, dist - refDist) * 1.55), 0.02, 1) *
              clamp(1 - dist / maxDist, 0, 1);
  g.gain.value = att;
  const inv = dist > 0.001 ? 1 / dist : 0;
  const pan = clamp((dx * right.x + dy * right.y + dz * right.z) * inv, -1, 1);
  let out = g;
  if (ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = pan * 0.85;
    g.connect(p); out = p;
  }
  if (dist > 500) {                       // distance muffling
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = clamp(16000 - (dist - 500) * 4.2, 900, 16000);
    out.connect(f); out = f;
  }
  out.connect(master);
  return { node: g, dist, gain: att };
}

function noise(dur, when) {
  const s = ctx.createBufferSource();
  s.buffer = noiseBuf;
  s.loop = true;
  s.start(when, Math.random() * 1.5, dur);
  s.stop(when + dur);
  return s;
}
function env(g, when, peak, attack, decay, curve = 'exp') {
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + attack);
  if (curve === 'exp') g.gain.exponentialRampToValueAtTime(0.0001, when + attack + decay);
  else g.gain.linearRampToValueAtTime(0.0001, when + attack + decay);
}

// ---------------------------------------------------------------- voices
const GUN_VOICE = {
  rifle:    { g: 0.85, dur: 0.20, hp: 260, lp: 7200, q: 0.7, sub: 150, subDur: 0.10, crack: 0.9 },
  rifle_lo: { g: 0.90, dur: 0.24, hp: 180, lp: 5200, q: 0.8, sub: 120, subDur: 0.13, crack: 1.0 },
  smg:      { g: 0.62, dur: 0.13, hp: 380, lp: 8200, q: 0.6, sub: 190, subDur: 0.06, crack: 0.7 },
  pistol:   { g: 0.68, dur: 0.16, hp: 340, lp: 9000, q: 0.6, sub: 175, subDur: 0.07, crack: 0.8 },
  deagle:   { g: 0.95, dur: 0.26, hp: 200, lp: 6600, q: 0.9, sub: 105, subDur: 0.15, crack: 1.1 },
  sniper:   { g: 1.00, dur: 0.42, hp: 140, lp: 5200, q: 1.0, sub: 85,  subDur: 0.22, crack: 1.2 },
  shotgun:  { g: 0.92, dur: 0.30, hp: 120, lp: 4800, q: 0.7, sub: 95,  subDur: 0.16, crack: 1.0 },
  silenced: { g: 0.30, dur: 0.11, hp: 300, lp: 2400, q: 0.5, sub: 160, subDur: 0.05, crack: 0.25 },
};

export function gunshot(voice, pos, when = 0) {
  if (!ctx) return;
  const v = GUN_VOICE[voice] || GUN_VOICE.rifle;
  const t = ctx.currentTime + when;
  const sp = spatial(pos, 520, 6000);
  if (sp.gain < 0.004) return;

  // main body: filtered noise burst
  const g1 = ctx.createGain();
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = v.hp;
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = v.q;
  lp.frequency.setValueAtTime(v.lp, t);
  lp.frequency.exponentialRampToValueAtTime(Math.max(220, v.lp * 0.14), t + v.dur);
  env(g1, t, v.g * 0.9, 0.0012, v.dur);
  const n = noise(v.dur + 0.02, t);
  n.connect(hp); hp.connect(lp); lp.connect(g1); g1.connect(sp.node);

  // sub thump
  const o = ctx.createOscillator(), g2 = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(v.sub * 2.1, t);
  o.frequency.exponentialRampToValueAtTime(v.sub * 0.55, t + v.subDur);
  env(g2, t, v.g * 0.55, 0.001, v.subDur);
  o.connect(g2); g2.connect(sp.node);
  o.start(t); o.stop(t + v.subDur + 0.02);

  // supersonic crack (only near the shooter)
  if (v.crack > 0.3) {
    const g3 = ctx.createGain();
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
    bp.frequency.value = 2600 + Math.random() * 900; bp.Q.value = 1.4;
    env(g3, t, v.g * 0.5 * v.crack, 0.0004, 0.02);
    const n2 = noise(0.03, t);
    n2.connect(bp); bp.connect(g3); g3.connect(sp.node);
  }

  // distant slap-back so far-away fights read as "outside"
  if (sp.dist > 700) {
    const dt = clamp(sp.dist / 13000, 0.03, 0.34);
    const g4 = ctx.createGain();
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
    env(g4, t + dt, v.g * 0.5, 0.01, 0.34);
    const n3 = noise(0.36, t + dt);
    n3.connect(f); f.connect(g4); g4.connect(sp.node);
  }
}

export function impact(surface, pos) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 260, 2600);
  if (sp.gain < 0.006) return;
  const table = {
    0: { f: 900, q: 0.8, d: 0.09, g: 0.5 },   // sand
    1: { f: 1800, q: 1.2, d: 0.07, g: 0.6 },  // concrete
    2: { f: 1200, q: 1.6, d: 0.08, g: 0.55 }, // wood
    3: { f: 3400, q: 3.0, d: 0.13, g: 0.6 },  // metal
    4: { f: 700, q: 0.7, d: 0.09, g: 0.45 },  // dirt
    5: { f: 2400, q: 1.8, d: 0.07, g: 0.55 }, // tile
  };
  const s = table[surface] || table[1];
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = s.f * (0.8 + Math.random() * 0.5); bp.Q.value = s.q;
  env(g, t, s.g, 0.001, s.d);
  const n = noise(s.d + 0.01, t);
  n.connect(bp); bp.connect(g); g.connect(sp.node);
  if (surface === 3) {                       // metal ricochet ping
    const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(2200 + Math.random() * 1800, t);
    o.frequency.exponentialRampToValueAtTime(900, t + 0.2);
    env(g2, t, 0.16, 0.002, 0.2);
    o.connect(g2); g2.connect(sp.node); o.start(t); o.stop(t + 0.22);
  }
}

export function fleshHit(pos, headshot) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 300, 2400);
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = headshot ? 1400 : 800;
  env(g, t, headshot ? 0.7 : 0.5, 0.001, headshot ? 0.13 : 0.09);
  const n = noise(0.14, t);
  n.connect(lp); lp.connect(g); g.connect(sp.node);
  if (headshot) {
    const o = ctx.createOscillator(), g2 = ctx.createGain();
    o.type = 'square'; o.frequency.setValueAtTime(340, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.1);
    env(g2, t, 0.22, 0.001, 0.1);
    o.connect(g2); g2.connect(sp.node); o.start(t); o.stop(t + 0.12);
  }
}

/** local UI blip when your bullet connects */
export function hitmarker(headshot, killed) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square';
  o.frequency.setValueAtTime(killed ? 1500 : headshot ? 1250 : 900, t);
  if (killed) o.frequency.exponentialRampToValueAtTime(2400, t + 0.07);
  env(g, t, 0.10, 0.001, killed ? 0.11 : 0.05);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.14);
}

export function footstep(surface, pos, loud = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 200, 1800);
  if (sp.gain < 0.008) return;
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = surface === 3 ? 'bandpass' : 'lowpass';
  bp.frequency.value = surface === 3 ? 2400 : surface === 0 ? 620 : 1100;
  bp.Q.value = 1.1;
  env(g, t, 0.34 * loud, 0.004, surface === 0 ? 0.11 : 0.07);
  const n = noise(0.13, t);
  n.connect(bp); bp.connect(g); g.connect(sp.node);
}

/** generic mechanical click used for reloads, pin pulls, weapon switches */
export function click(pos, freq = 2000, dur = 0.05, gain = 0.35, q = 4) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 240, 1600);
  if (sp.gain < 0.01) return;
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
  env(g, t, gain, 0.001, dur);
  const n = noise(dur + 0.01, t);
  n.connect(bp); bp.connect(g); g.connect(sp.node);
}

export function reloadSeq(pos, dur) {
  if (!ctx) return;
  // mag out ... mag in ... bolt
  setTimeout(() => click(pos, 1500, 0.06, 0.3, 3), 40);
  setTimeout(() => click(pos, 900, 0.09, 0.34, 2.4), dur * 380);
  setTimeout(() => click(pos, 2600, 0.05, 0.32, 5), dur * 700);
  setTimeout(() => click(pos, 1900, 0.07, 0.28, 3.4), dur * 880);
}

export function beep(pos, freq = 1800, dur = 0.07, gain = 0.5) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 700, 5000);
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = 'square'; o.frequency.value = freq;
  env(g, t, gain * 0.3, 0.002, dur);
  o.connect(g); g.connect(sp.node); o.start(t); o.stop(t + dur + 0.02);
}

export function explosion(pos, power = 1) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 900, 9000);
  const g = ctx.createGain();
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass';
  lp.frequency.setValueAtTime(4200, t);
  lp.frequency.exponentialRampToValueAtTime(180, t + 1.1 * power);
  env(g, t, 1.0 * power, 0.004, 1.2 * power);
  const n = noise(1.3 * power, t);
  n.connect(lp); lp.connect(g); g.connect(sp.node);
  const o = ctx.createOscillator(), g2 = ctx.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(120, t);
  o.frequency.exponentialRampToValueAtTime(28, t + 0.7);
  env(g2, t, 0.9 * power, 0.005, 0.75);
  o.connect(g2); g2.connect(sp.node); o.start(t); o.stop(t + 0.8);
}

export function flashPop(pos) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 800, 6000);
  const g = ctx.createGain();
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  env(g, t, 0.9, 0.001, 0.5);
  const n = noise(0.55, t);
  n.connect(hp); hp.connect(g); g.connect(sp.node);
}

export function hiss(pos, dur = 3.2) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 420, 2600);
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass';
  bp.frequency.value = 5200; bp.Q.value = 0.6;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.30, t + 0.12);
  g.gain.setValueAtTime(0.30, t + dur * 0.6);
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  const n = noise(dur + 0.05, t);
  n.connect(bp); bp.connect(g); g.connect(sp.node);
}

export function whoosh(pos, dur = 0.22, gain = 0.3) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const sp = spatial(pos, 260, 1600);
  const g = ctx.createGain();
  const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
  bp.frequency.setValueAtTime(500, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + dur);
  env(g, t, gain, 0.02, dur);
  const n = noise(dur + 0.02, t);
  n.connect(bp); bp.connect(g); g.connect(sp.node);
}

/** short musical sting; notes are [freq, startOffset, dur] */
export function sting(notes, gain = 0.16, type = 'triangle') {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (const [f, off, dur] of notes) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = f;
    env(g, t0 + off, gain, 0.01, dur);
    o.connect(g); g.connect(master);
    o.start(t0 + off); o.stop(t0 + off + dur + 0.05);
  }
}

export const SFX = {
  roundStart: () => sting([[392, 0, 0.16], [523, 0.11, 0.16], [784, 0.22, 0.4]], 0.14),
  win: () => sting([[523, 0, 0.18], [659, 0.13, 0.18], [784, 0.26, 0.18], [1046, 0.39, 0.6]], 0.15),
  lose: () => sting([[392, 0, 0.22], [330, 0.17, 0.22], [262, 0.34, 0.7]], 0.13, 'sine'),
  planted: () => sting([[180, 0, 0.5], [140, 0.2, 0.7]], 0.2, 'sawtooth'),
  defused: () => sting([[880, 0, 0.1], [1174, 0.09, 0.28]], 0.14),
  buy: () => sting([[1200, 0, 0.05], [1600, 0.04, 0.07]], 0.07),
  deny: () => sting([[220, 0, 0.09], [160, 0.07, 0.12]], 0.1, 'square'),
  pickup: () => sting([[700, 0, 0.05], [1000, 0.05, 0.08]], 0.08),
  tenSec: () => sting([[1046, 0, 0.09], [1046, 0.15, 0.09]], 0.1),
};
