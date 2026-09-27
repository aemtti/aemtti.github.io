// combat.js — hitscan bullets, hitgroups, the CS:GO armour formula and wall penetration.
import * as C from './constants.js';
import { currentWeapon, hitboxes, ammoOf } from './player.js';
import { fireDelay, inaccuracy, recoilFor } from './weapons.js';
import {
  angleVectors, rayAabb, rayAabbN, forwardVec, clamp, rng, DEG,
} from '../core/math.js';
import { eyePos } from './physics.js';
import * as A from '../core/audio.js';

const MAX_PEN_THICKNESS = [0, 20, 42, 76];   // units of wall a pen level can chew through

function pointSolid(world, p) {
  const boxes = world.query(p.x - 1, p.y - 1, p.x + 1, p.y + 1);
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    if (p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y &&
        p.z >= b.min.z && p.z <= b.max.z) return b;
  }
  return null;
}

/** nearest world surface along a ray */
function traceWorldRay(world, from, dir, maxDist) {
  const to = {
    x: from.x + dir.x * maxDist, y: from.y + dir.y * maxDist, z: from.z + dir.z * maxDist,
  };
  const boxes = world.query(
    Math.min(from.x, to.x) - 2, Math.min(from.y, to.y) - 2,
    Math.max(from.x, to.x) + 2, Math.max(from.y, to.y) + 2);
  let best = maxDist, hit = null, nrm = null;
  for (let i = 0; i < boxes.length; i++) {
    const r = rayAabbN(from, dir, boxes[i]);
    if (r && r.t < best && r.t >= 0) { best = r.t; hit = boxes[i]; nrm = r.n; }
  }
  if (!hit) return null;
  return {
    t: best, box: hit, normal: nrm, surf: hit.surf,
    point: { x: from.x + dir.x * best, y: from.y + dir.y * best, z: from.z + dir.z * best },
  };
}

/** nearest player hitbox along a ray */
function tracePlayers(players, from, dir, maxDist, shooter) {
  let best = maxDist, hp = null, hg = -1;
  for (const p of players) {
    if (p === shooter || !p.alive) continue;
    const dx = p.pos.x - from.x, dy = p.pos.y - from.y;
    if (dx * dx + dy * dy > (maxDist + 64) * (maxDist + 64)) continue;
    for (const box of hitboxes(p)) {
      const t = rayAabb(from, dir, box);
      if (t < best) { best = t; hp = p; hg = box.g; }
    }
  }
  if (!hp) return null;
  return {
    t: best, player: hp, group: hg,
    point: { x: from.x + dir.x * best, y: from.y + dir.y * best, z: from.z + dir.z * best },
  };
}

export { traceWorldRay, tracePlayers };

/** CS:GO armour maths */
export function scaleDamage(dmg, group, armor, helmet, armorPen) {
  dmg *= C.HITGROUP_MULT[group];
  const covered = group === C.HITGROUP.HEAD ? helmet : group !== C.HITGROUP.LEG;
  if (!covered || armor <= 0) return { dmg, armorLoss: 0 };
  let newDmg = dmg * armorPen;
  let armorLoss = (dmg - newDmg) * C.ARMOR_BONUS;
  if (armorLoss > armor) {
    armorLoss = armor;
    newDmg = dmg - armor * 2;
  }
  return { dmg: Math.max(0, newDmg), armorLoss };
}

export function applyDamage(game, victim, attacker, rawDmg, group, weaponId, hitPoint, dir) {
  if (!victim.alive) return 0;
  const friendly = attacker && attacker !== victim && attacker.team === victim.team;
  if (friendly && !game.friendlyFire) return 0;

  // unknown / non-weapon sources (bomb, falling) ignore armour penetration
  const wRef = weaponId ? game.weaponOf(weaponId) : null;
  const r = scaleDamage(rawDmg, group, victim.armor, victim.helmet, wRef ? wRef.ap : 1);
  let dmg = Math.round(r.dmg);
  victim.armor = Math.max(0, victim.armor - Math.round(r.armorLoss));
  const before = victim.health;
  victim.health -= dmg;
  const applied = before - Math.max(0, victim.health);

  if (attacker && attacker !== victim) {
    attacker.damageDealt += Math.min(applied, before);
    victim.damagedBy[attacker.id] = (victim.damagedBy[attacker.id] || 0) + applied;
    victim.lastDamageFrom = attacker;
    victim.lastDamageTime = game.now;
  }

  // view punch + directional damage indicator
  if (dir) {
    victim.punch.y += clamp(dmg * 0.06, 0, 3.2);
    victim.punch.x += rng.gauss() * clamp(dmg * 0.04, 0, 2.0);
    if (victim === game.localPlayer) game.hud.damageFrom(dir, dmg);
    if (victim.bot) victim.bot.onDamaged(attacker, dir);
  }
  if (game.settings.blood && hitPoint) game.fx.blood(hitPoint, dir);
  if (hitPoint) A.fleshHit(hitPoint, group === C.HITGROUP.HEAD);

  if (victim.health <= 0) {
    killPlayer(game, victim, attacker, weaponId, group === C.HITGROUP.HEAD);
  }
  return applied;
}

export function killPlayer(game, victim, attacker, weaponId, headshot) {
  if (!victim.alive) return;
  victim.alive = false;
  victim.health = 0;
  victim.deaths++;
  victim.deathTime = game.now;
  victim.killedBy = attacker || null;
  victim.deathPos.x = victim.pos.x;
  victim.deathPos.y = victim.pos.y;
  victim.deathPos.z = victim.pos.z;
  victim.anim.deathT = 0;
  victim.anim.deathYaw = victim.yaw;
  victim.st.scopeLevel = 0;

  if (attacker && attacker !== victim && attacker.team !== victim.team) {
    attacker.kills++;
    attacker.roundKills++;
    attacker.score += headshot ? 3 : 2;
    const w = game.weaponOf(weaponId);
    attacker.money = Math.min(C.MAX_MONEY, attacker.money + (w ? w.reward : 300));
  } else if (attacker && attacker.team === victim.team && attacker !== victim) {
    attacker.kills--;
    attacker.money = Math.max(0, attacker.money - 300);
  }
  // assist credit
  for (const idStr of Object.keys(victim.damagedBy)) {
    const id = +idStr;
    if (attacker && id === attacker.id) continue;
    if (victim.damagedBy[id] >= 40) {
      const a = game.players.find((p) => p.id === id);
      if (a && a.team !== victim.team) { a.assists++; a.score += 1; }
    }
  }
  game.onKill(victim, attacker, weaponId, headshot);
}

/** one bullet, including wall penetration */
function shootRay(game, shooter, from, dir, w, penLeft, dmgScale, seen) {
  const world = game.world;
  const wHit = traceWorldRay(world, from, dir, w.range || 8192);
  const pHit = tracePlayers(game.players, from, dir, wHit ? wHit.t : (w.range || 8192), shooter);

  if (pHit && (!wHit || pHit.t < wHit.t)) {
    const dist = pHit.t;
    let dmg = w.dmg * Math.pow(w.rangeMod, dist / 500) * dmgScale;
    const applied = applyDamage(game, pHit.player, shooter, dmg, pHit.group, w.id, pHit.point, dir);
    if (applied > 0 && !seen.has(pHit.player.id)) {
      seen.set(pHit.player.id, { hs: pHit.group === C.HITGROUP.HEAD, dead: !pHit.player.alive });
    }
    return { end: pHit.point, hitPlayer: pHit.player };
  }

  if (wHit) {
    game.fx.impact(wHit.point, wHit.normal, wHit.surf);
    A.impact(wHit.surf, wHit.point);
    // try to punch through
    if (penLeft > 0 && (w.pen || 0) > 0) {
      const maxThick = MAX_PEN_THICKNESS[Math.min(w.pen, 3)];
      let travelled = 2;
      let exit = null;
      while (travelled < maxThick) {
        const p = {
          x: wHit.point.x + dir.x * travelled,
          y: wHit.point.y + dir.y * travelled,
          z: wHit.point.z + dir.z * travelled,
        };
        if (!pointSolid(world, p)) { exit = p; break; }
        travelled += 3;
      }
      if (exit) {
        game.fx.impact(exit, { x: -dir.x, y: -dir.y, z: -dir.z }, wHit.surf);
        return shootRay(game, shooter, exit, dir, w, penLeft - 1, dmgScale * 0.62, seen);
      }
    }
    return { end: wHit.point, hitPlayer: null };
  }
  return {
    end: { x: from.x + dir.x * 8192, y: from.y + dir.y * 8192, z: from.z + dir.z * 8192 },
    hitPlayer: null,
  };
}

/** returns true if the trigger pull produced a shot */
export function fireWeapon(game, pl) {
  const w = currentWeapon(pl);
  const now = game.now;
  const st = pl.st;
  if (now < st.nextFire || st.reloading) return false;
  if (w.cat === 'knife') return knifeAttack(game, pl);
  if (w.cat === 'nade' || w.cat === 'c4') return false;

  const am = ammoOf(pl, w.id);
  if (am.mag === 0) {
    if (now - st.lastShot > 0.25) { A.click(eyePos(pl), 2600, 0.03, 0.25, 6); st.lastShot = now; }
    st.nextFire = now + 0.2;
    return false;
  }
  if (!w.auto && st.triggerHeld) return false;

  am.mag--;
  st.nextFire = now + fireDelay(w);
  st.lastShot = now;
  st.triggerHeld = true;

  // ---- recoil: the view kicks along the weapon's pattern
  const rec = recoilFor(w, st.shotsFired, rng);
  pl.punchTarget.x = rec.x;
  pl.punchTarget.y = rec.y;
  pl.punch.x = rec.x;
  pl.punch.y = rec.y;
  st.shotsFired++;
  st.shotInacc = Math.min(st.shotInacc + w.shot, w.shot * 6);

  const eye = eyePos(pl);
  const cone = inaccuracy(w, pl, st);
  const seen = new Map();
  let lastEnd = null;

  for (let i = 0; i < (w.pellets || 1); i++) {
    // random direction inside the cone
    const yaw = pl.yaw + pl.punch.x * DEG;
    const pitch = pl.pitch - pl.punch.y * DEG;
    const { f, r, u } = angleVectors(yaw, pitch);
    const a = rng() * Math.PI * 2;
    const spread = cone * DEG * Math.sqrt(rng()) * (w.pellets > 1 ? 1.9 : 1);
    const sx = Math.cos(a) * spread, sy = Math.sin(a) * spread;
    const dir = {
      x: f.x + r.x * sx + u.x * sy,
      y: f.y + r.y * sx + u.y * sy,
      z: f.z + r.z * sx + u.z * sy,
    };
    const l = Math.hypot(dir.x, dir.y, dir.z);
    dir.x /= l; dir.y /= l; dir.z /= l;
    const res = shootRay(game, pl, eye, dir, w, w.pen || 0, 1, seen);
    lastEnd = res.end;
    if (i === 0 || (w.pellets || 1) <= 4 || i % 2 === 0) game.fx.tracer(eye, res.end, pl === game.localPlayer);
  }

  // ---- feedback
  const isLocal = pl === game.localPlayer;
  game.fx.muzzle(pl, w, isLocal);
  if (isLocal && game.vm) game.vm.onFire(w);
  A.gunshot(w.voice, eye);
  game.noise(pl, w.silenced ? 900 : 2600, 'shot');
  if (pl === game.localPlayer && seen.size) {
    let hs = false, dead = false;
    for (const v of seen.values()) { hs = hs || v.hs; dead = dead || v.dead; }
    game.hud.hitmark(hs, dead);
    A.hitmarker(hs, dead);
  }
  if (pl === game.localPlayer) game.shakeView(w.cat === 'sniper' ? 1.4 : 0.5);
  void lastEnd;
  return true;
}

function knifeAttack(game, pl) {
  const now = game.now;
  const w = currentWeapon(pl);
  pl.st.nextFire = now + (pl.st.triggerHeld ? 0.5 : 0.4);
  pl.st.triggerHeld = true;
  pl.st.lastShot = now;
  const eye = eyePos(pl);
  const dir = forwardVec(pl.yaw, pl.pitch);
  A.whoosh(eye, 0.16, 0.35);
  game.fx.knifeSwing(pl);
  const pHit = tracePlayers(game.players, eye, dir, 72, pl);
  const wHit = traceWorldRay(game.world, eye, dir, 72);
  if (pHit && (!wHit || pHit.t < wHit.t)) {
    const target = pHit.player;
    // stabbing from behind does far more damage
    const rel = Math.atan2(target.pos.y - pl.pos.y, target.pos.x - pl.pos.x);
    const facing = Math.cos(target.yaw - rel);
    const back = facing > 0.35;
    const dmg = back ? w.backDmg : w.dmg;
    applyDamage(game, target, pl, dmg, C.HITGROUP.CHEST, 'knife', pHit.point, dir);
    A.click(pHit.point, 700, 0.1, 0.5, 2);
    if (pl === game.localPlayer) {
      game.hud.hitmark(false, !target.alive);
      A.hitmarker(false, !target.alive);
    }
    return true;
  }
  if (wHit && wHit.t < 72) {
    game.fx.impact(wHit.point, wHit.normal, wHit.surf);
    A.impact(wHit.surf, wHit.point);
  }
  return true;
}

export function startReload(game, pl) {
  const w = currentWeapon(pl);
  const am = ammoOf(pl, w.id);
  if (w.mag < 0 || pl.st.reloading) return false;
  if (am.mag >= w.mag || am.reserve <= 0) return false;
  pl.st.reloading = true;
  pl.st.scopeLevel = 0;
  pl.st.shotsFired = 0;
  if (w.shellReload) {
    pl.st.reloadEnd = game.now + 0.35;
    pl.st.shellsLoaded = 0;
    A.click(eyePos(pl), 1200, 0.06, 0.3, 3);
  } else {
    pl.st.reloadEnd = game.now + w.reload;
    A.reloadSeq(eyePos(pl), w.reload);
  }
  game.noise(pl, 600, 'reload');
  return true;
}

/** per-tick weapon bookkeeping: reload completion, recoil recovery, spread decay */
export function updateWeaponState(game, pl, dt) {
  const st = pl.st;
  const w = currentWeapon(pl);
  const now = game.now;

  if (st.reloading) {
    if (now >= st.reloadEnd) {
      const am = ammoOf(pl, w.id);
      if (w.shellReload) {
        if (am.mag < w.mag && am.reserve > 0) {
          am.mag++; am.reserve--; st.shellsLoaded++;
          A.click(eyePos(pl), 900, 0.07, 0.3, 2.6);
          st.reloadEnd = now + w.reload;
          if (am.mag >= w.mag || am.reserve <= 0) { st.reloading = false; st.nextFire = now + 0.3; }
        } else st.reloading = false;
      } else {
        const need = w.mag - am.mag;
        const take = Math.min(need, am.reserve);
        am.mag += take; am.reserve -= take;
        st.reloading = false;
        st.nextFire = now + 0.05;
      }
    }
  }

  // recoil recovery — the view drifts back once you stop shooting
  const sinceShot = now - st.lastShot;
  if (sinceShot > 0.12) {
    const k = Math.exp(-dt / Math.max(0.05, w.recovery * 0.55));
    pl.punch.x *= k;
    pl.punch.y *= k;
    if (Math.abs(pl.punch.x) < 0.005) pl.punch.x = 0;
    if (Math.abs(pl.punch.y) < 0.005) pl.punch.y = 0;
  }
  if (sinceShot > Math.max(0.25, 60 / w.rpm * 1.6)) st.shotsFired = 0;
  st.shotInacc *= Math.exp(-dt / 0.28);
  if (st.shotInacc < 0.003) st.shotInacc = 0;

  // flash blindness fades
  if (pl.flashAmount > 0) {
    pl.flashAmount = Math.max(0, pl.flashAmount - dt * pl.flashDecay);
  }
}
