// weapons.js — the weapon table, authored spray patterns and the inaccuracy model.
// Damage / armour-penetration / price / kill-reward follow CS:GO.
import { makeRng, clamp } from '../core/math.js';

export const SLOT = { PRIMARY: 0, SECONDARY: 1, KNIFE: 2, NADE: 3, C4: 4 };

// ---------------------------------------------------------------- patterns
// Cumulative aim offsets in degrees: [right, up]. Bullet n is fired from
// view + pattern[n]. Learning to pull against these is the whole game.
const AK47_PATTERN = [
  [0.00, 0.00], [0.10, 1.10], [0.15, 2.05], [0.20, 2.85], [0.10, 3.45],
  [-0.30, 3.90], [-0.90, 4.20], [-1.80, 4.35], [-2.70, 4.25], [-3.40, 4.05],
  [-3.60, 3.85], [-3.20, 3.65], [-2.20, 3.55], [-0.80, 3.45], [0.90, 3.35],
  [2.40, 3.30], [3.50, 3.25], [4.00, 3.20], [3.90, 3.15], [3.20, 3.10],
  [2.10, 3.05], [1.00, 3.05], [0.20, 3.00], [-0.60, 2.95], [-1.40, 2.95],
  [-2.00, 2.90], [-2.20, 2.85], [-1.80, 2.85], [-1.00, 2.80], [0.00, 2.80],
];

const M4A4_PATTERN = [
  [0.00, 0.00], [0.00, 0.90], [0.10, 1.70], [0.15, 2.40], [0.10, 2.90],
  [-0.20, 3.30], [-0.70, 3.50], [-1.30, 3.60], [-1.80, 3.60], [-2.10, 3.60],
  [-2.00, 3.55], [-1.50, 3.50], [-0.70, 3.45], [0.30, 3.40], [1.30, 3.40],
  [2.10, 3.35], [2.50, 3.30], [2.40, 3.30], [1.90, 3.25], [1.10, 3.20],
  [0.30, 3.20], [-0.40, 3.15], [-0.90, 3.10], [-1.10, 3.10], [-0.90, 3.05],
  [-0.40, 3.00], [0.20, 3.00], [0.80, 3.00], [1.20, 2.95], [1.30, 2.95],
];

/** procedural pattern: vertical climb that saturates, then a horizontal wander */
function makePattern(seed, n, climb, sat, wander, hstep) {
  const r = makeRng(seed);
  const out = [];
  let hx = 0, dir = r.sign();
  for (let i = 0; i < n; i++) {
    const up = climb * (1 - Math.exp(-i / sat));
    if (i > 2) {
      hx += dir * hstep * (0.55 + r() * 0.9);
      if (Math.abs(hx) > wander) dir = -dir;
    }
    out.push([hx + r.gauss() * 0.12, up + r.gauss() * 0.07]);
  }
  return out;
}

const PATTERNS = {
  ak47: AK47_PATTERN,
  m4a4: M4A4_PATTERN,
  m4a1s: M4A4_PATTERN.map(([x, y]) => [x * 0.82, y * 0.88]),
  galil: makePattern(11, 30, 3.9, 5.0, 3.2, 0.42),
  famas: makePattern(12, 30, 3.5, 4.6, 2.6, 0.38),
  sg553: makePattern(13, 30, 4.2, 5.4, 3.0, 0.40),
  aug: makePattern(14, 30, 3.4, 4.8, 2.4, 0.34),
  mac10: makePattern(21, 30, 3.0, 3.4, 3.4, 0.50),
  mp9: makePattern(22, 30, 2.6, 3.2, 2.6, 0.42),
  mp5sd: makePattern(23, 30, 2.4, 3.4, 2.2, 0.38),
  ump45: makePattern(24, 30, 2.8, 3.0, 2.4, 0.44),
  p90: makePattern(25, 30, 2.7, 4.0, 3.0, 0.40),
  glock: makePattern(31, 12, 1.5, 2.2, 1.2, 0.30),
  usp: makePattern(32, 12, 1.3, 2.0, 1.0, 0.26),
  p250: makePattern(33, 12, 1.7, 2.0, 1.2, 0.30),
  fiveseven: makePattern(34, 12, 1.4, 2.2, 1.1, 0.28),
  tec9: makePattern(35, 12, 1.9, 2.4, 1.8, 0.40),
  deagle: makePattern(36, 8, 3.4, 1.4, 1.4, 0.55),
  nova: makePattern(41, 8, 3.0, 1.6, 1.2, 0.5),
  xm1014: makePattern(42, 10, 3.2, 2.4, 1.8, 0.5),
  awp: [[0, 0]],
  ssg08: [[0, 0]],
};

// ---------------------------------------------------------------- table
const W = (o) => ({
  auto: true, pellets: 1, team: 0, scope: null, pen: 1, deploy: 0.9,
  reward: 300, silenced: false, cat: 'rifle', slot: SLOT.PRIMARY,
  crouchMul: 0.68, recoilScale: 1, recovery: 0.34, ...o,
});

export const WEAPONS = {
  // ---- knife / bomb
  knife: W({
    id: 'knife', name: 'Knife', cat: 'knife', slot: SLOT.KNIFE, price: 0, reward: 1500,
    dmg: 40, backDmg: 180, ap: 0.85, rpm: 120, mag: -1, ammo: -1, reload: 0,
    speed: 250, rangeMod: 1, range: 64, voice: 'silenced', model: 'knife',
    stand: 0, move: 0, air: 0, shot: 0, auto: false, deploy: 0.5,
  }),
  c4: W({
    id: 'c4', name: 'C4 Explosive', cat: 'c4', slot: SLOT.C4, price: 0, reward: 0,
    dmg: 0, ap: 0, rpm: 60, mag: -1, ammo: -1, reload: 0, speed: 250,
    rangeMod: 1, range: 0, voice: 'silenced', model: 'c4',
    stand: 0, move: 0, air: 0, shot: 0, auto: false, deploy: 0.6,
  }),

  // ---- pistols
  glock: W({
    id: 'glock', name: 'Glock-18', cat: 'pistol', slot: SLOT.SECONDARY, price: 200, reward: 300,
    dmg: 30, ap: 0.47, rpm: 400, mag: 20, ammo: 120, reload: 2.2, speed: 240,
    rangeMod: 0.51, range: 4096, pen: 1, voice: 'pistol', auto: false, model: 'pistol',
    stand: 0.42, move: 3.4, air: 9.5, shot: 0.62, team: 1, deploy: 0.7,
  }),
  usp: W({
    id: 'usp', name: 'USP-S', cat: 'pistol', slot: SLOT.SECONDARY, price: 200, reward: 300,
    dmg: 35, ap: 0.505, rpm: 352, mag: 12, ammo: 24, reload: 2.2, speed: 240,
    rangeMod: 0.79, range: 4096, pen: 1, voice: 'silenced', auto: false, silenced: true,
    model: 'pistol', stand: 0.34, move: 3.0, air: 8.5, shot: 0.58, team: 2, deploy: 0.7,
  }),
  p250: W({
    id: 'p250', name: 'P250', cat: 'pistol', slot: SLOT.SECONDARY, price: 300, reward: 300,
    dmg: 38, ap: 0.645, rpm: 400, mag: 13, ammo: 26, reload: 2.2, speed: 240,
    rangeMod: 0.75, range: 4096, pen: 1, voice: 'pistol', auto: false, model: 'pistol',
    stand: 0.40, move: 3.2, air: 9.0, shot: 0.66, deploy: 0.7,
  }),
  fiveseven: W({
    id: 'fiveseven', name: 'Five-SeveN', cat: 'pistol', slot: SLOT.SECONDARY, price: 500, reward: 300,
    dmg: 32, ap: 0.77, rpm: 400, mag: 20, ammo: 100, reload: 2.7, speed: 240,
    rangeMod: 0.885, range: 4096, pen: 1, voice: 'pistol', auto: false, model: 'pistol',
    stand: 0.38, move: 3.1, air: 9.0, shot: 0.60, team: 2, deploy: 0.7,
  }),
  tec9: W({
    id: 'tec9', name: 'Tec-9', cat: 'pistol', slot: SLOT.SECONDARY, price: 500, reward: 300,
    dmg: 33, ap: 0.906, rpm: 500, mag: 18, ammo: 90, reload: 2.2, speed: 240,
    rangeMod: 0.81, range: 4096, pen: 1, voice: 'pistol', auto: false, model: 'pistol',
    stand: 0.52, move: 3.8, air: 10, shot: 0.78, team: 1, deploy: 0.7,
  }),
  deagle: W({
    id: 'deagle', name: 'Desert Eagle', cat: 'pistol', slot: SLOT.SECONDARY, price: 700, reward: 300,
    dmg: 63, ap: 0.931, rpm: 267, mag: 7, ammo: 35, reload: 2.2, speed: 230,
    rangeMod: 0.81, range: 4096, pen: 2, voice: 'deagle', auto: false, model: 'deagle',
    stand: 0.36, move: 5.6, air: 14, shot: 1.55, deploy: 0.8, recovery: 0.42,
  }),

  // ---- SMGs
  mac10: W({
    id: 'mac10', name: 'MAC-10', cat: 'smg', price: 1050, reward: 600,
    dmg: 29, ap: 0.475, rpm: 800, mag: 30, ammo: 100, reload: 2.35, speed: 240,
    rangeMod: 0.74, range: 4096, pen: 1, voice: 'smg', model: 'smg',
    stand: 0.62, move: 2.4, air: 11, shot: 0.42, team: 1,
  }),
  mp9: W({
    id: 'mp9', name: 'MP9', cat: 'smg', price: 1250, reward: 600,
    dmg: 26, ap: 0.60, rpm: 857, mag: 30, ammo: 120, reload: 2.1, speed: 240,
    rangeMod: 0.75, range: 4096, pen: 1, voice: 'smg', model: 'smg',
    stand: 0.55, move: 2.2, air: 10.5, shot: 0.38, team: 2,
  }),
  mp5sd: W({
    id: 'mp5sd', name: 'MP5-SD', cat: 'smg', price: 1500, reward: 600,
    dmg: 27, ap: 0.615, rpm: 750, mag: 30, ammo: 120, reload: 2.7, speed: 235,
    rangeMod: 0.79, range: 4096, pen: 1, voice: 'silenced', silenced: true, model: 'smg',
    stand: 0.48, move: 2.0, air: 10, shot: 0.36,
  }),
  ump45: W({
    id: 'ump45', name: 'UMP-45', cat: 'smg', price: 1200, reward: 600,
    dmg: 35, ap: 0.65, rpm: 666, mag: 25, ammo: 100, reload: 3.5, speed: 230,
    rangeMod: 0.70, range: 4096, pen: 1, voice: 'smg', model: 'smg',
    stand: 0.52, move: 2.3, air: 10, shot: 0.44,
  }),
  p90: W({
    id: 'p90', name: 'P90', cat: 'smg', price: 2350, reward: 300,
    dmg: 26, ap: 0.69, rpm: 857, mag: 50, ammo: 100, reload: 3.4, speed: 230,
    rangeMod: 0.84, range: 4096, pen: 1, voice: 'smg', model: 'p90',
    stand: 0.60, move: 2.5, air: 11, shot: 0.40,
  }),

  // ---- rifles
  galil: W({
    id: 'galil', name: 'Galil AR', cat: 'rifle', price: 1800, reward: 300,
    dmg: 30, ap: 0.775, rpm: 666, mag: 35, ammo: 90, reload: 3.0, speed: 215,
    rangeMod: 0.98, range: 8192, pen: 2, voice: 'rifle', model: 'rifle',
    stand: 0.36, move: 5.4, air: 13, shot: 0.55, team: 1,
  }),
  famas: W({
    id: 'famas', name: 'FAMAS', cat: 'rifle', price: 2050, reward: 300,
    dmg: 30, ap: 0.70, rpm: 666, mag: 25, ammo: 90, reload: 3.3, speed: 220,
    rangeMod: 0.97, range: 8192, pen: 2, voice: 'rifle', model: 'rifle',
    stand: 0.32, move: 5.0, air: 12.5, shot: 0.52, team: 2,
  }),
  ak47: W({
    id: 'ak47', name: 'AK-47', cat: 'rifle', price: 2700, reward: 300,
    dmg: 36, ap: 0.775, rpm: 600, mag: 30, ammo: 90, reload: 2.5, speed: 215,
    rangeMod: 0.98, range: 8192, pen: 2, voice: 'rifle_lo', model: 'ak',
    stand: 0.30, move: 5.6, air: 13.5, shot: 0.60, team: 1, recoilScale: 1.0,
  }),
  m4a4: W({
    id: 'm4a4', name: 'M4A4', cat: 'rifle', price: 3100, reward: 300,
    dmg: 33, ap: 0.70, rpm: 666, mag: 30, ammo: 90, reload: 3.1, speed: 225,
    rangeMod: 0.97, range: 8192, pen: 2, voice: 'rifle', model: 'm4',
    stand: 0.26, move: 5.0, air: 12.5, shot: 0.53, team: 2,
  }),
  m4a1s: W({
    id: 'm4a1s', name: 'M4A1-S', cat: 'rifle', price: 2900, reward: 300,
    dmg: 38, ap: 0.70, rpm: 600, mag: 20, ammo: 75, reload: 3.1, speed: 225,
    rangeMod: 0.99, range: 8192, pen: 2, voice: 'silenced', silenced: true, model: 'm4',
    stand: 0.22, move: 4.6, air: 12, shot: 0.46, team: 2,
  }),
  sg553: W({
    id: 'sg553', name: 'SG 553', cat: 'rifle', price: 3000, reward: 300,
    dmg: 30, ap: 1.0, rpm: 545, mag: 30, ammo: 90, reload: 3.0, speed: 210,
    rangeMod: 0.98, range: 8192, pen: 2, voice: 'rifle', model: 'rifle',
    stand: 0.30, move: 5.2, air: 13, shot: 0.58, team: 1, scope: [40],
  }),
  aug: W({
    id: 'aug', name: 'AUG', cat: 'rifle', price: 3300, reward: 300,
    dmg: 28, ap: 0.90, rpm: 666, mag: 30, ammo: 90, reload: 3.8, speed: 220,
    rangeMod: 0.98, range: 8192, pen: 2, voice: 'rifle', model: 'rifle',
    stand: 0.26, move: 4.8, air: 12.5, shot: 0.50, team: 2, scope: [40],
  }),
  ssg08: W({
    id: 'ssg08', name: 'SSG 08', cat: 'sniper', price: 1700, reward: 300,
    dmg: 88, ap: 0.85, rpm: 48, mag: 10, ammo: 90, reload: 3.7, speed: 230,
    rangeMod: 0.98, range: 8192, pen: 3, voice: 'sniper', auto: false, model: 'sniper',
    stand: 0.06, move: 12, air: 26, shot: 1.2, scope: [40, 15], deploy: 1.2, recovery: 0.5,
  }),
  awp: W({
    id: 'awp', name: 'AWP', cat: 'sniper', price: 4750, reward: 100,
    dmg: 115, ap: 0.975, rpm: 41, mag: 5, ammo: 30, reload: 3.7, speed: 200,
    rangeMod: 0.99, range: 8192, pen: 3, voice: 'sniper', auto: false, model: 'awp',
    stand: 0.03, move: 14, air: 30, shot: 1.6, scope: [40, 10], deploy: 1.25, recovery: 0.6,
  }),

  // ---- heavy
  nova: W({
    id: 'nova', name: 'Nova', cat: 'heavy', price: 1050, reward: 900,
    dmg: 26, ap: 0.50, rpm: 68, mag: 8, ammo: 32, reload: 0.55, shellReload: true,
    speed: 220, rangeMod: 0.70, range: 3000, pen: 0, pellets: 9, voice: 'shotgun',
    auto: false, model: 'shotgun', stand: 2.2, move: 4.0, air: 9, shot: 1.4,
  }),
  xm1014: W({
    id: 'xm1014', name: 'XM1014', cat: 'heavy', price: 2000, reward: 900,
    dmg: 20, ap: 0.80, rpm: 171, mag: 7, ammo: 32, reload: 0.5, shellReload: true,
    speed: 215, rangeMod: 0.70, range: 3000, pen: 0, pellets: 8, voice: 'shotgun',
    auto: false, model: 'shotgun', stand: 2.6, move: 4.4, air: 10, shot: 1.6,
  }),

  // ---- grenades
  he: W({
    id: 'he', name: 'HE Grenade', cat: 'nade', slot: SLOT.NADE, price: 300, reward: 300,
    dmg: 98, ap: 0.5, rpm: 60, mag: 1, ammo: 0, reload: 0, speed: 245,
    rangeMod: 1, range: 0, voice: 'silenced', auto: false, model: 'nade',
    stand: 0, move: 0, air: 0, shot: 0, maxCarry: 1, deploy: 0.55,
  }),
  flash: W({
    id: 'flash', name: 'Flashbang', cat: 'nade', slot: SLOT.NADE, price: 200, reward: 300,
    dmg: 0, ap: 0, rpm: 60, mag: 1, ammo: 0, reload: 0, speed: 245,
    rangeMod: 1, range: 0, voice: 'silenced', auto: false, model: 'nade',
    stand: 0, move: 0, air: 0, shot: 0, maxCarry: 2, deploy: 0.55,
  }),
  smoke: W({
    id: 'smoke', name: 'Smoke Grenade', cat: 'nade', slot: SLOT.NADE, price: 300, reward: 300,
    dmg: 0, ap: 0, rpm: 60, mag: 1, ammo: 0, reload: 0, speed: 245,
    rangeMod: 1, range: 0, voice: 'silenced', auto: false, model: 'nade',
    stand: 0, move: 0, air: 0, shot: 0, maxCarry: 1, deploy: 0.55,
  }),
};

export const GEAR = {
  kevlar: { id: 'kevlar', name: 'Kevlar Vest', price: 650 },
  kevlarhelmet: { id: 'kevlarhelmet', name: 'Kevlar + Helmet', price: 1000 },
  defusekit: { id: 'defusekit', name: 'Defuse Kit', price: 400, team: 2 },
};

export const BUY_MENU = [
  { key: 'Pistols', items: ['glock', 'usp', 'p250', 'fiveseven', 'tec9', 'deagle'] },
  { key: 'SMGs', items: ['mac10', 'mp9', 'mp5sd', 'ump45', 'p90'] },
  { key: 'Rifles', items: ['galil', 'famas', 'ak47', 'm4a4', 'm4a1s', 'sg553', 'aug', 'ssg08', 'awp'] },
  { key: 'Heavy', items: ['nova', 'xm1014'] },
  { key: 'Equipment', items: ['kevlar', 'kevlarhelmet', 'defusekit'] },
  { key: 'Grenades', items: ['he', 'flash', 'smoke'] },
];

export const getWeapon = (id) => WEAPONS[id];
export const fireDelay = (w) => 60 / w.rpm;
export const patternFor = (w) => PATTERNS[w.id] || PATTERNS.ak47;

/** total aim-cone half-angle in degrees for the current player state */
export function inaccuracy(w, pl, st) {
  let inacc = w.stand;
  const speedFrac = clamp(pl.speed2d / 250, 0, 1.4);
  inacc += w.move * speedFrac * speedFrac;
  if (!pl.onGround) inacc += w.air;
  else if (pl.ducked) inacc *= w.crouchMul;
  inacc += (st.shotInacc || 0);
  if (st.scopeLevel > 0) inacc *= 0.06;
  return inacc;
}

/** pattern-driven recoil target for shot number n (0-based) */
export function recoilFor(w, n, rnd) {
  const pat = patternFor(w);
  let i = n;
  if (i >= pat.length) {
    // cycle the tail of the pattern with a little variance
    const tail = Math.max(1, pat.length - 12);
    i = 12 + ((n - pat.length) % tail);
  }
  const p = pat[Math.min(i, pat.length - 1)];
  const j = 1 + (rnd ? rnd.gauss() * 0.045 : 0);
  return { x: p[0] * w.recoilScale * j, y: p[1] * w.recoilScale * j };
}

export function weaponsForTeam(team) {
  return Object.values(WEAPONS).filter((w) => !w.team || w.team === team);
}
