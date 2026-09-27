// player.js — the entity shared by the human and every bot.
import * as C from './constants.js';
import { WEAPONS, SLOT, getWeapon } from './weapons.js';
import { v3 } from '../core/math.js';

let nextId = 1;

export function createPlayer(opts) {
  const p = {
    id: nextId++,
    name: opts.name || 'player',
    team: opts.team,
    isBot: !!opts.isBot,
    bot: null,

    pos: v3(0, 0, 0),
    vel: v3(0, 0, 0),
    yaw: 0, pitch: 0,
    punch: { x: 0, y: 0 },        // recoil applied to the view, degrees
    punchTarget: { x: 0, y: 0 },
    viewOffsetZ: 0,

    alive: false,
    health: 100, armor: 0, helmet: false, hasKit: false,
    height: C.STAND_H, ducked: false, duckTime: 0,
    onGround: false, groundEnt: null, jumpCooldown: 0,
    speed2d: 0, wishSpeed: 0, maxSpeedNow: C.MAX_SPEED, landSpeed: 0,

    money: C.START_MONEY,
    kills: 0, deaths: 0, assists: 0, damageDealt: 0, score: 0, mvps: 0,
    roundKills: 0,

    inv: { primary: null, secondary: null, knife: 'knife', nades: [], c4: false },
    ammo: {},                      // id -> { mag, reserve }
    cur: 'knife',
    lastWeapon: 'knife',

    st: {
      nextFire: 0, shotsFired: 0, shotInacc: 0, lastShot: -99,
      reloading: false, reloadEnd: 0, shellsLoaded: 0,
      deployEnd: 0, scopeLevel: 0, triggerHeld: false,
      lastAttackTime: -99, burst: 0,
    },

    flashAmount: 0, flashDecay: 1,
    footAccum: 0, stepSide: 0,
    planting: false, plantProgress: 0,
    defusing: false, defuseProgress: 0,
    lastDamageFrom: null, lastDamageTime: -99, damagedBy: {},
    killedBy: null, deathTime: -99, deathPos: v3(0, 0, 0),
    spawnPos: v3(0, 0, 0),
    anim: { t: 0, cycle: 0, lastPos: v3(0, 0, 0), fireT: 0, deathT: 0, deathYaw: 0 },
    model: null,
  };
  return p;
}

export function giveWeapon(p, id, opts = {}) {
  const w = getWeapon(id);
  if (!w) return false;
  if (w.slot === SLOT.NADE) {
    const count = p.inv.nades.filter((n) => n === id).length;
    if (count >= (w.maxCarry || 1)) return false;
    p.inv.nades.push(id);
    if (!opts.silent && p.cur === 'knife') { /* keep current */ }
    return true;
  }
  if (w.slot === SLOT.C4) { p.inv.c4 = true; return true; }
  if (w.slot === SLOT.PRIMARY) p.inv.primary = id;
  else if (w.slot === SLOT.SECONDARY) p.inv.secondary = id;
  p.ammo[id] = { mag: w.mag, reserve: w.ammo };
  if (!opts.noSwitch) switchTo(p, id);
  return true;
}

export function hasWeapon(p, id) {
  return p.inv.primary === id || p.inv.secondary === id ||
    (id === 'knife') || (id === 'c4' && p.inv.c4) || p.inv.nades.includes(id);
}

export function nadeCount(p, id) {
  return p.inv.nades.filter((n) => n === id).length;
}

export function removeNade(p, id) {
  const i = p.inv.nades.indexOf(id);
  if (i >= 0) p.inv.nades.splice(i, 1);
}

export function currentWeapon(p) { return WEAPONS[p.cur] || WEAPONS.knife; }

export function ammoOf(p, id) {
  return p.ammo[id] || { mag: -1, reserve: -1 };
}

export function switchTo(p, id, now = 0) {
  if (!id || p.cur === id) return false;
  if (!hasWeapon(p, id)) return false;
  p.lastWeapon = p.cur;
  p.cur = id;
  const w = getWeapon(id);
  p.st.reloading = false;
  p.st.scopeLevel = 0;
  p.st.shotsFired = 0;
  p.st.shellsLoaded = 0;
  p.st.deployEnd = now + w.deploy;
  p.st.nextFire = p.st.deployEnd;
  return true;
}

export function slotWeapon(p, slot) {
  switch (slot) {
    case SLOT.PRIMARY: return p.inv.primary;
    case SLOT.SECONDARY: return p.inv.secondary;
    case SLOT.KNIFE: return 'knife';
    case SLOT.NADE: return p.inv.nades[0] || null;
    case SLOT.C4: return p.inv.c4 ? 'c4' : null;
    default: return null;
  }
}

/** cycle to the next grenade type when the nade slot is pressed again */
export function nextNade(p, now) {
  if (!p.inv.nades.length) return false;
  const order = ['he', 'flash', 'smoke'];
  const owned = order.filter((id) => p.inv.nades.includes(id));
  if (!owned.length) return false;
  const i = owned.indexOf(p.cur);
  return switchTo(p, owned[(i + 1) % owned.length], now);
}

export function bestWeapon(p) {
  if (p.inv.primary) return p.inv.primary;
  if (p.inv.secondary) return p.inv.secondary;
  return 'knife';
}

export function speedCap(p) {
  const w = currentWeapon(p);
  let s = w.speed;
  if (p.st.scopeLevel > 0) s = Math.min(s, w.id === 'awp' ? 100 : 120);
  return s;
}

export function resetForRound(p, spawn) {
  p.alive = true;
  p.health = 100;
  p.pos.x = spawn.x; p.pos.y = spawn.y; p.pos.z = spawn.z;
  p.spawnPos.x = spawn.x; p.spawnPos.y = spawn.y; p.spawnPos.z = spawn.z;
  p.vel.x = p.vel.y = p.vel.z = 0;
  p.yaw = (spawn.yaw || 0) * Math.PI / 180;
  p.pitch = 0;
  p.punch.x = p.punch.y = 0;
  p.punchTarget.x = p.punchTarget.y = 0;
  p.ducked = false; p.duckTime = 0; p.height = C.STAND_H;
  p.onGround = false;
  p.flashAmount = 0;
  p.roundKills = 0;
  p.planting = false; p.plantProgress = 0;
  p.defusing = false; p.defuseProgress = 0;
  p.damagedBy = {};
  p.st.reloading = false; p.st.shotsFired = 0; p.st.shotInacc = 0;
  p.st.scopeLevel = 0; p.st.nextFire = 0; p.st.deployEnd = 0;
  p.anim.deathT = 0;
  p.inv.c4 = false;
  // refill magazines
  for (const id of [p.inv.primary, p.inv.secondary]) {
    if (!id) continue;
    const w = getWeapon(id);
    p.ammo[id] = { mag: w.mag, reserve: w.ammo };
  }
  p.cur = bestWeapon(p);
  p.lastWeapon = 'knife';
}

export function clearInventory(p) {
  p.inv.primary = null;
  p.inv.secondary = null;
  p.inv.nades = [];
  p.inv.c4 = false;
  p.ammo = {};
  p.armor = 0; p.helmet = false; p.hasKit = false;
  p.cur = 'knife';
}

export function addMoney(p, amount) {
  p.money = Math.max(0, Math.min(C.MAX_MONEY, p.money + amount));
}

/** hit boxes in world space, ordered head-first so headshots win ties */
export function hitboxes(p) {
  const h = p.height;
  const x = p.pos.x, y = p.pos.y, z = p.pos.z;
  const bw = 15, hw = 7.5, lw = 12;
  return [
    { g: C.HITGROUP.HEAD, min: { x: x - hw, y: y - hw, z: z + h * 0.855 }, max: { x: x + hw, y: y + hw, z: z + h } },
    { g: C.HITGROUP.CHEST, min: { x: x - bw, y: y - bw, z: z + h * 0.62 }, max: { x: x + bw, y: y + bw, z: z + h * 0.855 } },
    { g: C.HITGROUP.STOMACH, min: { x: x - bw, y: y - bw, z: z + h * 0.44 }, max: { x: x + bw, y: y + bw, z: z + h * 0.62 } },
    { g: C.HITGROUP.LEG, min: { x: x - lw, y: y - lw, z: z }, max: { x: x + lw, y: y + lw, z: z + h * 0.44 } },
  ];
}
