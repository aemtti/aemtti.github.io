// bots.js — a deliberately small bot.
//
// One bot has exactly one goal at a time, and the goal is a pure function of
// things that almost never change mid-round: my team, my role, where the bomb
// is, and how far along my route I am. Nothing "cancels" a decision, because
// there is nothing to cancel — recompute it every tick and you get the same
// answer, so the bot keeps walking the same way until it actually arrives.
//
// It knows only what its own eyes have seen. No shared vision, no callouts, no
// rotation orders, no reservations, no cooldown tables.
//
// Six goals:
//   advance  walk the next point on my route (T) or to my post (CT)
//   hold     stand at my post and watch an angle
//   plant    put the bomb down
//   defuse   take the bomb up
//   getbomb  pick a dropped bomb back up
//   fight    an enemy is visible — aim and shoot (suspends the others)
import * as C from './constants.js';
import { LANDMARKS, SITES } from '../world/brushes.js';
import { findPath, smoothPath, traceClear, nearestNode } from '../world/nav.js';
import {
  angleVectors, approachAngle, clamp, forwardVec, makeRng, normAngle, vecToAngles,
} from '../core/math.js';
import { eyePos } from './physics.js';
import {
  currentWeapon, ammoOf, switchTo, giveWeapon, bestWeapon, nadeCount, removeNade,
} from './player.js';
import { fireWeapon, startReload } from './combat.js';
import { recoilFor, WEAPONS } from './weapons.js';
import { ROUTES_T, CT_HOLDS } from './teamai.js';

const L = Object.fromEntries(LANDMARKS.map((l) => [l.name, l]));
const ARRIVE = 120;              // close enough to count as "there"
const WAYPOINT_HIT = 70;         // close enough to move on to the next waypoint
const SEPARATION = 130;          // start easing away from a teammate

let seed = 1;

export class Bot {
  constructor(game, pl, difficulty) {
    this.game = game;
    this.pl = pl;
    this.diff = C.DIFFICULTY[clamp(difficulty, 0, 3)];
    this.rng = makeRng((seed = (seed * 1664525 + 1013904223) >>> 0));
    pl.bot = this;

    // round assignment (written by teamai)
    this.role = 'support';
    this.hold = CT_HOLDS[0];
    this.route = ROUTES_T.rushA;
    this.post = null;
    this.watch = null;
    this.startAt = 0;
    this.postSpread = 0;

    // goal
    this.goalKind = 'advance';
    this.routeIdx = 0;
    this.isDefuser = false;
    this.isRecoverer = false;
    this.bombKey = '';
    this.mateCount = -1;

    // vision
    this.enemy = null;
    this.seenAt = -99;
    this.lastSeenPos = null;
    this.fireAt = 0;
    this.onTargetFor = 0;
    this.aimErr = { x: 0, y: 0 };
    this.aimZone = 0.62;
    this.alertUntil = 0;
    this.glance = null;
    this.glanceUntil = 0;
    this.hurtBy = null;
    this.hurtAt = 0;

    // shooting
    this.burst = 0;
    this.burstRest = 0;
    this.strafeDir = 1;
    this.strafeAt = 0;

    // movement
    this.goal = null;            // world point we are pathing to
    this.path = null;
    this.pathIdx = 0;
    this.repathAt = 0;
    this.stuckFor = 0;
    this.dodgeUntil = 0;
    this.dodgeDir = 1;
    this.lastPos = { x: 0, y: 0 };
    this.holdTimer = 0;
    this.flashAt = 0;
    this.nadeAt = 0;
    this.aggression = 0.35 + this.rng() * 0.5;
  }

  // the debug inspector reads these
  get state() { return this.enemy ? 'fight' : this.goalKind; }
  get goalName() { return this.goalKind; }
  diagnostics() {
    return {
      role: this.role,
      goal: this.goalKind,
      routeIdx: this.routeIdx,
      enemy: this.enemy ? this.enemy.name : '-',
      stuckFor: +this.stuckFor.toFixed(1),
      path: this.path ? `${this.pathIdx}/${this.path.length}` : 'none',
    };
  }

  // ------------------------------------------------------------- lifecycle
  onSideSwap() { this.route = null; this.post = null; this.path = null; }

  onRoundStart() {
    this.goalKind = 'advance';
    this.routeIdx = 0;
    this.path = null;
    this.goal = null;
    this.enemy = null;
    this.lastSeenPos = null;
    this.glance = null;
    this.hurtBy = null;
    this.isDefuser = false;
    this.isRecoverer = false;
    this.bombKey = '';
    this.mateCount = -1;
    this.stuckFor = 0;
    this.holdTimer = 0;
    this.flashAt = 0;
    this.nadeAt = this.game.now + 5 + this.rng() * 8;
    if (!this.route) this.route = ROUTES_T.rushA;
    if (!this.post) this.post = { ...(this.hold ? this.hold.spot : { x: 0, y: 0 }) };
  }

  // ------------------------------------------------------------- buying
  buy() {
    const pl = this.pl;
    const isCT = pl.team === C.TEAM.CT;
    const rifle = isCT ? (this.rng() < 0.5 ? 'm4a4' : 'm4a1s') : 'ak47';
    const cheap = isCT ? 'famas' : 'galil';
    const smg = isCT ? 'mp9' : 'mac10';
    const gun = (id) => {
      const w = WEAPONS[id];
      if (!w || pl.money < w.price) return false;
      pl.money -= w.price;
      giveWeapon(pl, id, { noSwitch: true });
      return true;
    };
    const armour = (helm) => {
      if (pl.helmet) return false;
      const price = pl.armor > 0 ? (helm ? 350 : 0) : (helm ? 1000 : 650);
      if (price <= 0 || pl.money < price) return false;
      pl.money -= price;
      pl.armor = 100;
      if (helm) pl.helmet = true;
      return true;
    };

    const m = pl.money;
    if (!pl.inv.primary) {
      if (this.role === 'awper' && m >= 5200) { gun('awp'); armour(true); }
      else if (m >= 4000) { gun(rifle); armour(true); }
      else if (m >= 3000) { armour(false); gun(rifle) || gun(cheap); }
      else if (m >= 2200) { armour(false); gun(cheap) || gun(smg); }
      else if (m >= 1600) { armour(false); gun(smg); }
      else if (m >= 1000 && this.rng() < 0.55) armour(false);
      else if (m >= 700 && this.rng() < 0.4) gun('deagle');
    } else armour(true);

    if (isCT && !pl.hasKit && pl.money >= 400 && this.rng() < 0.8) {
      pl.money -= 400;
      pl.hasKit = true;
    }
    if (pl.money >= 300 && nadeCount(pl, 'he') === 0 && this.rng() < 0.6) {
      pl.money -= 300;
      giveWeapon(pl, 'he', { noSwitch: true });
    }
    if (pl.money >= 200 && nadeCount(pl, 'flash') === 0 && this.rng() < 0.6) {
      pl.money -= 200;
      giveWeapon(pl, 'flash', { noSwitch: true });
    }
    switchTo(pl, bestWeapon(pl), this.game.now);
  }

  // ------------------------------------------------------------- seeing
  canSee(target) {
    const pl = this.pl;
    if (!target.alive) return false;
    if (pl.flashAmount > 0.45) return false;
    const eye = eyePos(pl);
    const head = { x: target.pos.x, y: target.pos.y, z: target.pos.z + target.height * 0.72 };
    const dx = head.x - eye.x, dy = head.y - eye.y, dz = head.z - eye.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > 3200) return false;
    const look = forwardVec(pl.yaw, pl.pitch);
    const dot = (dx * look.x + dy * look.y + dz * look.z) / (dist || 1);
    const fov = this.diff.fovDeg * (this.game.now < this.alertUntil ? 1.2 : 1);
    if (dot < Math.cos(Math.min(178, fov) * 0.5 * Math.PI / 180)) return false;
    if (this.game.nades.blocksLOS(eye, head)) return false;
    if (traceClear(this.game.world, eye, head)) return true;
    const chest = { x: target.pos.x, y: target.pos.y, z: target.pos.z + target.height * 0.4 };
    return traceClear(this.game.world, eye, chest);
  }

  sense() {
    const game = this.game;
    const pl = this.pl;
    let best = null, bestD = Infinity;
    for (const e of game.players) {
      if (e.team === pl.team || !e.alive) continue;
      if (!this.canSee(e)) continue;
      const d = Math.hypot(e.pos.x - pl.pos.x, e.pos.y - pl.pos.y);
      if (d < bestD) { bestD = d; best = e; }
    }
    if (best) {
      if (best !== this.enemy || game.now - this.seenAt > 1.0) {
        // fresh contact: a reaction delay, and an aim error that shrinks as we
        // settle on the target but never reaches zero
        const [lo, hi] = this.diff.react;
        const alert = game.now < this.alertUntil ? 0.65 : 1;
        const aimed = this.aimedNear(best) ? 0.55 : 1;
        this.fireAt = game.now + (lo + this.rng() * (hi - lo)) * alert * aimed;
        this.onTargetFor = 0;
        this.aimErr.x = this.rng.gauss() * this.diff.aimErr;
        this.aimErr.y = this.rng.gauss() * this.diff.aimErr * 0.6;
        this.aimZone = this.rng() < 0.15 + this.diff.accBonus * 0.3 ? 0.86 : 0.62;
      }
      this.enemy = best;
      this.seenAt = game.now;
      this.lastSeenPos = { x: best.pos.x, y: best.pos.y, z: best.pos.z };
      this.alertUntil = game.now + 5;
    } else if (this.enemy && game.now - this.seenAt > 1.5) {
      this.enemy = null;
    }
  }

  /** were we already pointing at them? then it is a trigger pull, not a search */
  aimedNear(target) {
    const pl = this.pl;
    const eye = eyePos(pl);
    const look = forwardVec(pl.yaw, pl.pitch);
    const dx = target.pos.x - eye.x, dy = target.pos.y - eye.y;
    const dz = target.pos.z + target.height * 0.6 - eye.z;
    const d = Math.hypot(dx, dy, dz) || 1;
    return (dx * look.x + dy * look.y + dz * look.z) / d > 0.98;
  }

  /** noise earns a glance; it never changes what we are doing */
  hearNoise(pos, loudness, kind) {
    const d = Math.hypot(pos.x - this.pl.pos.x, pos.y - this.pl.pos.y);
    if (d > Math.min(loudness, this.diff.hearing)) return;
    this.alertUntil = Math.max(this.alertUntil, this.game.now + 4);
    if (kind === 'shot' || kind === 'explosion') {
      this.glance = { x: pos.x, y: pos.y };
      this.glanceUntil = this.game.now + 2;
    }
  }

  onDamaged(attacker) {
    const now = this.game.now;
    this.alertUntil = Math.max(this.alertUntil, now + 6);
    if (!attacker || attacker.team === this.pl.team || this.enemy === attacker) return;
    this.hurtBy = { x: attacker.pos.x, y: attacker.pos.y, z: attacker.pos.z };
    const [lo, hi] = this.diff.react;
    this.hurtAt = now + lo * 0.8 + this.rng() * (hi - lo);
    this.glance = { x: attacker.pos.x, y: attacker.pos.y };
    this.glanceUntil = now + 2.5;
  }

  // ------------------------------------------------------------- aiming
  lookAt(pos, dt, speed) {
    const pl = this.pl;
    const eye = eyePos(pl);
    const a = vecToAngles({ x: pos.x - eye.x, y: pos.y - eye.y, z: (pos.z ?? eye.z) - eye.z });
    pl.yaw = approachAngle(pl.yaw, a.yaw, speed * dt);
    pl.pitch += clamp(a.pitch - pl.pitch, -speed * dt, speed * dt);
  }

  aimAtEnemy(dt) {
    const pl = this.pl;
    const e = this.enemy;
    const eye = eyePos(pl);
    const tx = e.pos.x + e.vel.x * 0.06;
    const ty = e.pos.y + e.vel.y * 0.06;
    const tz = e.pos.z + e.height * this.aimZone;
    const a = vecToAngles({ x: tx - eye.x, y: ty - eye.y, z: tz - eye.z });
    const dist = Math.hypot(tx - eye.x, ty - eye.y, tz - eye.z);

    this.onTargetFor += dt;
    const settle = 0.25 + 0.75 * Math.exp(-this.onTargetFor / 0.4);
    const ex = this.aimErr.x * settle * Math.PI / 180;
    const ey = this.aimErr.y * settle * Math.PI / 180;

    // pull down against our own spray, imperfectly
    let cx = 0, cy = 0;
    if (pl.st.shotsFired > 1) {
      const r = recoilFor(currentWeapon(pl), pl.st.shotsFired - 1, null);
      cx = -r.x * this.diff.spray;
      cy = -r.y * this.diff.spray;
    }
    const wantYaw = a.yaw + ex + cx * Math.PI / 180;
    const wantPitch = clamp(a.pitch + ey - cy * Math.PI / 180, -1.4, 1.4);
    const off = Math.abs(normAngle(wantYaw - pl.yaw));
    const speed = this.diff.aimSpeed * (0.6 + 2.2 * Math.min(1, off));
    pl.yaw = approachAngle(pl.yaw, wantYaw, speed * dt);
    pl.pitch += clamp(wantPitch - pl.pitch, -speed * dt, speed * dt);
    return { dist, aimOff: Math.abs(normAngle(wantYaw - pl.yaw)) + Math.abs(wantPitch - pl.pitch) };
  }

  // ------------------------------------------------------------- fighting
  fight(dt, cmd) {
    const pl = this.pl;
    const game = this.game;
    const now = game.now;
    const w = currentWeapon(pl);
    const { dist, aimOff } = this.aimAtEnemy(dt);

    // weapon housekeeping
    const ammo = ammoOf(pl, w.id);
    if (ammo.mag <= 0) {
      if (ammo.reserve > 0) startReload(game, pl);
      else if (pl.inv.secondary && pl.cur !== pl.inv.secondary) switchTo(pl, pl.inv.secondary, now);
      else if (pl.cur !== 'knife') switchTo(pl, 'knife', now);
    } else if (w.cat === 'nade' || w.cat === 'c4') {
      switchTo(pl, bestWeapon(pl), now);
    }
    if (w.scope && dist > 800 && pl.st.scopeLevel === 0 && pl.speed2d < 40) pl.st.scopeLevel = 1;
    else if (w.scope && dist < 450 && pl.st.scopeLevel > 0) pl.st.scopeLevel = 0;

    // may we shoot?
    const tolerance = Math.atan2(22, Math.max(60, dist)) * 1.8 + 0.012;
    let ready = now >= this.fireAt && aimOff < tolerance && ammo.mag > 0;
    if (w.cat === 'knife') ready = dist < 70;
    if (w.cat === 'nade' || w.cat === 'c4') ready = false;
    if (w.cat === 'sniper' && pl.speed2d > 30) ready = false;

    if (ready) {
      if (this.burstRest > 0) this.burstRest -= dt;
      else {
        if (this.burst <= 0) {
          const [lo, hi] = this.diff.burst;
          this.burst = dist > 1400 ? 1 + Math.floor(this.rng() * 2)
            : lo + Math.floor(this.rng() * (hi - lo + 1));
        }
        if (fireWeapon(game, pl)) {
          this.burst--;
          if (this.burst <= 0) this.burstRest = 0.18 + this.rng() * 0.3;
        }
      }
    } else {
      pl.st.triggerHeld = false;
      this.burst = 0;
    }

    // an HE now and then
    if (now > this.nadeAt && dist > 450 && dist < 1400 && nadeCount(pl, 'he') > 0 &&
        aimOff < 0.2 && this.rng() < 0.4) {
      this.throwNade('he', { x: this.enemy.pos.x, y: this.enemy.pos.y, z: this.enemy.pos.z + 40 });
      this.nadeAt = now + 15;
    }

    // footwork: plant your feet to shoot at range, strafe up close
    let f = 0, s = 0;
    if (dist < 400) {
      if (now > this.strafeAt) {
        this.strafeDir = this.rng() < 0.5 ? -1 : 1;
        this.strafeAt = now + 0.5 + this.rng() * 0.6;
      }
      s = this.strafeDir;
      if (dist > 250) f = 0.6;
      else if (dist < 110) f = -0.6;
    } else if (pl.speed2d > 30 && pl.onGround) {
      // counter-strafe: press against our own motion so the shot is accurate
      const av = angleVectors(pl.yaw, 0);
      f = clamp(-(pl.vel.x * av.f.x + pl.vel.y * av.f.y) / 90, -1, 1);
      s = clamp(-(pl.vel.x * av.r.x + pl.vel.y * av.r.y) / 90, -1, 1);
    }
    cmd.forward = f;
    cmd.side = s;
    cmd.duck = dist > 900 && pl.onGround && !s && this.diff.accBonus > 0.7;
  }

  throwNade(type, target) {
    const pl = this.pl;
    if (nadeCount(pl, type) <= 0) return;
    const eye = eyePos(pl);
    const dx = target.x - eye.x, dy = target.y - eye.y;
    const d = Math.hypot(dx, dy);
    const a = vecToAngles({ x: dx, y: dy, z: (target.z ?? eye.z) - eye.z });
    const yaw = pl.yaw, pitch = pl.pitch;
    pl.yaw = a.yaw;
    pl.pitch = clamp(a.pitch - clamp(d / 4200, 0, 0.4), -0.9, 0.6);
    this.game.nades.throwNade(pl, type, d > 700 ? 1 : 0.4);
    removeNade(pl, type);
    pl.yaw = yaw;
    pl.pitch = pitch;
  }

  maybeFlash() {
    const pl = this.pl;
    const now = this.game.now;
    if (now < this.flashAt || nadeCount(pl, 'flash') === 0) return;
    const site = this.game.teamAI.siteObj();
    const d = Math.hypot(site.center.x - pl.pos.x, site.center.y - pl.pos.y);
    if (d < 300 || d > 1000) return;
    this.throwNade('flash', { x: site.center.x, y: site.center.y, z: site.center.z + 90 });
    this.flashAt = now + 25;
  }

  // ------------------------------------------------------------- moving
  /**
   * Walk to a point. Paths are computed once and reused; we only re-plan when
   * the destination really moves, the path runs out, or we are wedged.
   */
  moveTo(cmd, dest, dt, arrive = ARRIVE) {
    const pl = this.pl;
    const game = this.game;
    const now = game.now;

    if (!this.goal || Math.hypot(this.goal.x - dest.x, this.goal.y - dest.y) > 80) {
      this.goal = { x: dest.x, y: dest.y };
      this.path = null;
    }
    if (!this.path && now >= this.repathAt) {
      this.repathAt = now + 0.5;
      const from = nearestNode(game.world.nav, pl.pos);
      const to = nearestNode(game.world.nav, this.goal);
      if (from >= 0 && to >= 0) {
        const raw = findPath(game.world.nav, from, to);
        if (raw) {
          this.path = smoothPath(game.world, game.world.nav, raw);
          this.pathIdx = 0;
          this.skipReachedWaypoints();
        }
      }
    }

    // where are we actually heading this tick?
    let tx = this.goal.x, ty = this.goal.y;
    if (this.path && this.pathIdx < this.path.length) {
      const nodes = game.world.nav.nodes;
      let node = nodes[this.path[this.pathIdx]];
      while (Math.hypot(node.x - pl.pos.x, node.y - pl.pos.y) < WAYPOINT_HIT &&
             this.pathIdx < this.path.length - 1) {
        this.pathIdx++;
        node = nodes[this.path[this.pathIdx]];
      }
      // On the last leg walk at the real destination, not the nav node near it —
      // nodes sit on cell centres and can be most of a cell away from the thing
      // we actually came here to stand on.
      if (this.pathIdx < this.path.length - 1) { tx = node.x; ty = node.y; }
    }

    let dx = tx - pl.pos.x, dy = ty - pl.pos.y;
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;

    // ease away from teammates so a squad does not walk as one body
    for (const m of game.players) {
      if (m === pl || !m.alive || m.team !== pl.team) continue;
      const ox = pl.pos.x - m.pos.x, oy = pl.pos.y - m.pos.y;
      const d = Math.hypot(ox, oy);
      if (d > SEPARATION || d < 1) continue;
      const push = (1 - d / SEPARATION) * 0.9;
      dx += (ox / d) * push;
      dy += (oy / d) * push;
    }
    // if we have been wedged, commit to a sidestep for a moment
    if (now < this.dodgeUntil) {
      dx += -dy * this.dodgeDir * 1.2;
      dy += dx * this.dodgeDir * 1.2;
    }
    const l2 = Math.hypot(dx, dy) || 1;
    dx /= l2; dy /= l2;

    // Face first, then convert: pmove applies the command against the yaw we
    // hand it, so turning after computing forward/side smears the movement.
    this.faceTravel(Math.atan2(dy, dx), dt);
    const rel = normAngle(Math.atan2(dy, dx) - pl.yaw);
    cmd.forward = Math.cos(rel);
    cmd.side = Math.sin(rel);

    return Math.hypot(dest.x - pl.pos.x, dest.y - pl.pos.y) < arrive;
  }

  skipReachedWaypoints() {
    const pl = this.pl;
    const nodes = this.game.world.nav.nodes;
    // start at the furthest waypoint we can already see, so a fresh path never
    // sends us back to the middle of the cell we are standing in
    const eye = { x: pl.pos.x, y: pl.pos.y, z: pl.pos.z + 40 };
    for (let i = this.path.length - 1; i >= 0; i--) {
      const n = nodes[this.path[i]];
      if (Math.abs(n.z - pl.pos.z) > 60) continue;
      if (traceClear(this.game.world, eye, { x: n.x, y: n.y, z: n.z + 40 }, 18)) {
        this.pathIdx = i;
        return;
      }
    }
    this.pathIdx = 0;
  }

  /** look where we are walking, or at the corner we are about to turn */
  faceTravel(travelYaw, dt) {
    const pl = this.pl;
    const now = this.game.now;
    let want = travelYaw;
    if (this.lastSeenPos && now - this.seenAt < 2) {
      want = Math.atan2(this.lastSeenPos.y - pl.pos.y, this.lastSeenPos.x - pl.pos.x);
    } else if (this.glance && now < this.glanceUntil) {
      const g = Math.atan2(this.glance.y - pl.pos.y, this.glance.x - pl.pos.x);
      if (Math.abs(normAngle(g - travelYaw)) < 1.1) want = g;
    }
    pl.yaw = approachAngle(pl.yaw, want, 7 * dt);
    pl.pitch = approachAngle(pl.pitch, 0, 2.5 * dt);
  }

  /** detect being wedged and do something about it */
  checkStuck(cmd, dt) {
    const pl = this.pl;
    const moved = Math.hypot(pl.pos.x - this.lastPos.x, pl.pos.y - this.lastPos.y);
    this.lastPos.x = pl.pos.x;
    this.lastPos.y = pl.pos.y;
    if (!cmd.forward && !cmd.side) { this.stuckFor = 0; return; }
    const want = (cmd.walk ? 0.52 : 1) * (cmd.speedCap || 250) * dt * 0.3;
    if (moved > Math.max(0.3, want)) { this.stuckFor = 0; return; }

    this.stuckFor += dt;
    if (this.stuckFor > 0.6 && this.game.now > this.dodgeUntil) {
      // step aside; direction is fixed per attempt so we do not dither
      this.dodgeDir = this.rng() < 0.5 ? -1 : 1;
      this.dodgeUntil = this.game.now + 0.6;
    }
    if (this.stuckFor > 1.6) { this.path = null; this.repathAt = 0; }
    if (this.stuckFor > 3) {
      // give up on this waypoint entirely
      if (this.path && this.pathIdx < this.path.length - 1) this.pathIdx++;
      else if (this.goalKind === 'advance' && this.pl.team === C.TEAM.T) this.routeIdx++;
      this.stuckFor = 0;
    }
  }

  // ------------------------------------------------------------- goal
  bombKeyNow() {
    const b = this.game.bomb;
    if (b.state === 'planted' || b.state === 'dropped') {
      return `${b.state}:${Math.round(b.pos.x)}:${Math.round(b.pos.y)}`;
    }
    return b.state;
  }

  /**
   * When the bomb changes state, work out ONCE whether this bot is the one who
   * goes for it. Every bot runs the same comparison on the same data, so they
   * agree without talking, and nobody re-decides a second later.
   */
  onBombChanged() {
    const game = this.game;
    const b = game.bomb;
    const pl = this.pl;
    this.isDefuser = false;
    this.isRecoverer = false;
    const mine = (team) => {
      let closest = null, bestD = Infinity;
      for (const p of game.players) {
        if (p.team !== team || !p.alive || !p.bot) continue;
        const d = Math.hypot(p.pos.x - b.pos.x, p.pos.y - b.pos.y);
        if (d < bestD || (d === bestD && closest && p.id < closest.id)) { bestD = d; closest = p; }
      }
      return closest === pl;
    };
    if (b.state === 'planted' && pl.team === C.TEAM.CT) this.isDefuser = mine(C.TEAM.CT);
    if (b.state === 'dropped' && pl.team === C.TEAM.T) this.isRecoverer = mine(C.TEAM.T);
  }

  /** the whole decision, as a plain function of the current situation */
  chooseGoal() {
    const pl = this.pl;
    const game = this.game;
    const b = game.bomb;

    if (pl.team === C.TEAM.CT) {
      if (b.state === 'planted') return this.isDefuser ? 'defuse' : 'coverbomb';
      const d = Math.hypot(pl.pos.x - this.post.x, pl.pos.y - this.post.y);
      return d > ARRIVE ? 'advance' : 'hold';
    }

    if (b.state === 'carried' && b.carrier === pl) {
      return b.siteAt(pl.pos.x, pl.pos.y) ? 'plant' : 'toplant';
    }
    if (b.state === 'dropped' && this.isRecoverer) return 'getbomb';
    if (b.state === 'planted') return 'coverbomb';
    return 'advance';
  }

  /** where the current goal wants us to stand */
  goalPoint() {
    const pl = this.pl;
    const game = this.game;
    const b = game.bomb;
    switch (this.goalKind) {
      case 'advance':
        if (pl.team === C.TEAM.CT) return this.post;
        return this.routePoint();
      case 'hold': return this.post;
      case 'toplant': return game.teamAI.siteObj().center;
      case 'defuse': return b.pos;
      case 'getbomb': return b.pos;
      case 'coverbomb': {
        const a = (this.postSpread * 1.7 + 0.6) % (Math.PI * 2);
        return { x: b.pos.x + Math.cos(a) * 300, y: b.pos.y + Math.sin(a) * 300 };
      }
      default: return pl.pos;
    }
  }

  /** the next landmark on our route, spread so five bots do not share a tile */
  routePoint() {
    const route = this.route || ROUTES_T.rushA;
    if (this.routeIdx >= route.length) {
      const site = this.game.teamAI.siteObj();
      const a = (this.postSpread * 1.9) % (Math.PI * 2);
      return { x: site.center.x + Math.cos(a) * 260, y: site.center.y + Math.sin(a) * 260 };
    }
    const lm = L[route[this.routeIdx]] || L['T Spawn'];
    const a = (this.postSpread * 1.9) % (Math.PI * 2);
    return { x: lm.x + Math.cos(a) * 90, y: lm.y + Math.sin(a) * 90 };
  }

  whatToWatch() {
    const b = this.game.bomb;
    if (this.glance && this.game.now < this.glanceUntil) return this.glance;
    if (this.goalKind === 'coverbomb') return b.pos;
    if (this.pl.team === C.TEAM.CT) return this.watch || this.hold.watch;
    return this.game.teamAI.siteObj().center;
  }

  // ------------------------------------------------------------- think
  think(dt) {
    const pl = this.pl;
    const game = this.game;
    const now = game.now;
    const cmd = {
      forward: 0, side: 0, jump: false, duck: false, walk: false,
      yaw: pl.yaw, speedCap: currentWeapon(pl).speed,
    };
    if (!pl.alive) return cmd;
    if (game.match.state === 'over' || game.match.state === 'matchover') {
      pl.st.triggerHeld = false;
      return cmd;
    }
    if (game.match.frozen) {
      pl.pitch *= 0.9;
      cmd.yaw = pl.yaw;
      return cmd;
    }

    this.sense();

    // Two events re-open the "who goes for the bomb" decision: the bomb moving,
    // and a teammate dying. The second matters because if the one bot elected to
    // defuse gets shot, somebody has to take over — otherwise the bomb just sits
    // there. Both are discrete events, so this cannot turn into per-tick churn.
    const key = this.bombKeyNow();
    let mates = 0;
    for (const p of game.players) if (p.team === pl.team && p.alive && p.bot) mates++;
    if (key !== this.bombKey || mates !== this.mateCount) {
      this.bombKey = key;
      this.mateCount = mates;
      this.onBombChanged();
      this.path = null;
    }

    // shot from somewhere we cannot see: turn onto it
    if (this.hurtBy && now >= this.hurtAt) {
      if (!this.enemy) this.lookAt(this.hurtBy, dt, this.diff.aimSpeed * 1.3);
      if (now > this.hurtAt + 1.2) this.hurtBy = null;
    }

    // ---- an enemy in sight suspends everything else
    if (this.enemy && this.enemy.alive) {
      this.fight(dt, cmd);
      this.stuckFor = 0;
      cmd.yaw = pl.yaw;
      return cmd;
    }
    pl.st.triggerHeld = false;

    // ---- housekeeping
    const w = currentWeapon(pl);
    const ammo = ammoOf(pl, w.id);
    if (w.mag > 0 && ammo.mag < w.mag * 0.4 && ammo.reserve > 0 && !pl.st.reloading) {
      startReload(game, pl);
    }
    if (pl.st.scopeLevel > 0) pl.st.scopeLevel = 0;
    if ((w.cat === 'nade' || w.cat === 'c4') && this.goalKind !== 'plant') {
      switchTo(pl, bestWeapon(pl), now);
    }

    // ---- stagger out of spawn
    if (now < this.startAt && game.bomb.state === 'carried') {
      pl.pitch = approachAngle(pl.pitch, 0, 2 * dt);
      cmd.yaw = pl.yaw;
      return cmd;
    }

    // ---- one goal, recomputed but stable
    this.goalKind = this.chooseGoal();

    if (this.goalKind === 'plant') {
      if (pl.cur !== 'c4') switchTo(pl, 'c4', now);
      cmd.duck = true;
      game.bomb.updatePlant(pl, true, dt);
      cmd.yaw = pl.yaw;
      return cmd;
    }
    if (this.goalKind === 'defuse') {
      const d = Math.hypot(pl.pos.x - game.bomb.pos.x, pl.pos.y - game.bomb.pos.y);
      if (d < 60) {
        cmd.duck = true;
        this.lookAt(game.bomb.pos, dt, 6);
        game.bomb.updateDefuse(pl, true, dt);
        cmd.yaw = pl.yaw;
        return cmd;
      }
    }
    if (this.goalKind === 'getbomb') {
      const d = Math.hypot(pl.pos.x - game.bomb.pos.x, pl.pos.y - game.bomb.pos.y);
      if (d < 70) game.bomb.pickUp(pl);
    }

    // Goals that end in an action have to be walked closer than ordinary ones:
    // stopping at the generic arrival distance leaves the bot standing just out
    // of reach of the thing it came to do.
    const dest = this.goalPoint();
    const arrive = this.goalKind === 'defuse' ? 40
      : this.goalKind === 'getbomb' ? 45 : ARRIVE;
    const arrived = this.moveTo(cmd, dest, dt, arrive);

    if (arrived) {
      if (this.goalKind === 'advance' && pl.team === C.TEAM.T) {
        // next leg of the route
        this.routeIdx++;
        this.path = null;
      } else {
        // standing on the spot: stop and watch the angle
        cmd.forward = 0;
        cmd.side = 0;
        cmd.walk = true;
        this.holdTimer += dt;
        const watch = this.whatToWatch();
        if (watch) {
          const base = Math.atan2(watch.y - pl.pos.y, watch.x - pl.pos.x);
          const sweep = Math.sin(this.holdTimer * 0.4 + this.aggression * 5) * 0.15;
          pl.yaw = approachAngle(pl.yaw, base + sweep, 2 * dt);
          pl.pitch = approachAngle(pl.pitch, 0.02, 1.2 * dt);
        }
      }
    }

    if (pl.team === C.TEAM.T && this.goalKind === 'toplant') this.maybeFlash();

    this.checkStuck(cmd, dt);
    cmd.yaw = pl.yaw;
    if (!pl.onGround) cmd.jump = false;
    return cmd;
  }
}

export { SITES };
