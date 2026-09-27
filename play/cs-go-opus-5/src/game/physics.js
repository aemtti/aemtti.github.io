// physics.js — Source-style player movement. Follows the original PM_* ordering:
// duck -> categorise -> friction -> accelerate -> TryPlayerMove (4 clips) -> step.
import * as C from './constants.js';
import { clamp } from '../core/math.js';

const EPS = 0.03125;          // Source's DIST_EPSILON
const tmpBox = { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };

function playerBox(p, hw, h, out) {
  out.min.x = p.x - hw; out.min.y = p.y - hw; out.min.z = p.z;
  out.max.x = p.x + hw; out.max.y = p.y + hw; out.max.z = p.z + h;
  return out;
}

/**
 * Sweep an axis-aligned hull (feet at `pos`) by `delta`.
 * Returns { frac, nx, ny, nz, ent, startSolid }.
 */
export function traceHull(world, pos, delta, hw, h, others, ignore) {
  const cx = pos.x, cy = pos.y, cz = pos.z + h / 2;
  const ex = hw, ey = hw, ez = h / 2;
  const minx = Math.min(cx, cx + delta.x) - ex - 1;
  const maxx = Math.max(cx, cx + delta.x) + ex + 1;
  const miny = Math.min(cy, cy + delta.y) - ey - 1;
  const maxy = Math.max(cy, cy + delta.y) + ey + 1;

  let frac = 1, nx = 0, ny = 0, nz = 0, ent = null, startSolid = false;
  const o = { x: cx, y: cy, z: cz };

  const test = (b, entity) => {
    // Minkowski-expanded slab test
    const lo = [b.min.x - ex, b.min.y - ey, b.min.z - ez];
    const hi = [b.max.x + ex, b.max.y + ey, b.max.z + ez];
    const op = [o.x, o.y, o.z], dp = [delta.x, delta.y, delta.z];
    let tmin = -Infinity, tmax = Infinity, axis = -1, sgn = 0;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(dp[i]) < 1e-9) {
        if (op[i] <= lo[i] || op[i] >= hi[i]) return;
        continue;
      }
      const inv = 1 / dp[i];
      let t1 = (lo[i] - op[i]) * inv, t2 = (hi[i] - op[i]) * inv, s = -1;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; }
      if (t1 > tmin) { tmin = t1; axis = i; sgn = s; }
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return;
    }
    if (tmax <= 0) return;
    // tmin === 0 means we are resting exactly against the face. That is a normal
    // contact, not an overlap — reporting it as startSolid would leave a player
    // standing on the floor permanently "airborne".
    if (tmin < -1e-4) { startSolid = true; frac = 0; ent = entity; return; }
    if (axis < 0) { startSolid = true; frac = 0; ent = entity; return; }
    if (tmin >= frac) return;
    frac = tmin < 0 ? 0 : tmin;
    nx = axis === 0 ? sgn : 0; ny = axis === 1 ? sgn : 0; nz = axis === 2 ? sgn : 0;
    ent = entity;
  };

  const boxes = world.query(minx, miny, maxx, maxy);
  for (let i = 0; i < boxes.length; i++) test(boxes[i], null);

  if (others) {
    for (let i = 0; i < others.length; i++) {
      const p = others[i];
      if (p === ignore || !p.alive) continue;
      const ph = p.height;
      const b = {
        min: { x: p.pos.x - C.HULL_HW, y: p.pos.y - C.HULL_HW, z: p.pos.z },
        max: { x: p.pos.x + C.HULL_HW, y: p.pos.y + C.HULL_HW, z: p.pos.z + ph },
      };
      if (b.max.x < minx || b.min.x > maxx || b.max.y < miny || b.min.y > maxy) continue;
      test(b, p);
    }
  }

  // pull back a hair so we never rest exactly on the surface
  if (frac < 1 && frac > 0) {
    const len = Math.hypot(delta.x, delta.y, delta.z);
    if (len > 1e-6) frac = Math.max(0, frac - EPS / len);
  }
  return { frac, nx, ny, nz, ent, startSolid };
}

/** true when the hull at `pos` overlaps anything solid */
export function hullBlocked(world, pos, hw, h, others, ignore) {
  const b = playerBox(pos, hw, h, tmpBox);
  const boxes = world.query(b.min.x, b.min.y, b.max.x, b.max.y);
  for (let i = 0; i < boxes.length; i++) {
    const o = boxes[i];
    if (b.min.x < o.max.x && b.max.x > o.min.x &&
        b.min.y < o.max.y && b.max.y > o.min.y &&
        b.min.z < o.max.z && b.max.z > o.min.z) return true;
  }
  if (others) {
    for (let i = 0; i < others.length; i++) {
      const p = others[i];
      if (p === ignore || !p.alive) continue;
      if (b.min.x < p.pos.x + C.HULL_HW && b.max.x > p.pos.x - C.HULL_HW &&
          b.min.y < p.pos.y + C.HULL_HW && b.max.y > p.pos.y - C.HULL_HW &&
          b.min.z < p.pos.z + p.height && b.max.z > p.pos.z) return true;
    }
  }
  return false;
}

/** nudge a stuck hull out along the shallowest penetration axis */
export function unstick(world, pl, others) {
  const hw = C.HULL_HW, h = pl.height;
  if (!hullBlocked(world, pl.pos, hw, h, others, pl)) return;
  const b = playerBox(pl.pos, hw, h, { min: {}, max: {} });
  const boxes = world.query(b.min.x, b.min.y, b.max.x, b.max.y);
  for (let iter = 0; iter < 4; iter++) {
    let moved = false;
    for (const o of boxes) {
      const bb = playerBox(pl.pos, hw, h, { min: {}, max: {} });
      if (!(bb.min.x < o.max.x && bb.max.x > o.min.x &&
            bb.min.y < o.max.y && bb.max.y > o.min.y &&
            bb.min.z < o.max.z && bb.max.z > o.min.z)) continue;
      const px = Math.min(o.max.x - bb.min.x, bb.max.x - o.min.x);
      const py = Math.min(o.max.y - bb.min.y, bb.max.y - o.min.y);
      const pz = Math.min(o.max.z - bb.min.z, bb.max.z - o.min.z);
      if (pz <= px && pz <= py) {
        pl.pos.z += (bb.min.z + h / 2 < o.min.z + (o.max.z - o.min.z) / 2) ? -pz - EPS : pz + EPS;
      } else if (px <= py) {
        pl.pos.x += (bb.min.x + hw < o.min.x + (o.max.x - o.min.x) / 2) ? -px - EPS : px + EPS;
      } else {
        pl.pos.y += (bb.min.y + hw < o.min.y + (o.max.y - o.min.y) / 2) ? -py - EPS : py + EPS;
      }
      moved = true;
    }
    if (!moved) break;
  }
}

function clipVelocity(v, nx, ny, nz, overbounce = 1.0) {
  const backoff = (v.x * nx + v.y * ny + v.z * nz) * overbounce;
  v.x -= nx * backoff; v.y -= ny * backoff; v.z -= nz * backoff;
  // guard against creeping into the plane
  const adjust = v.x * nx + v.y * ny + v.z * nz;
  if (adjust < 0) { v.x -= nx * adjust; v.y -= ny * adjust; v.z -= nz * adjust; }
}

/** slide-move with up to 4 plane clips. mutates pos/vel. returns blocked mask */
function tryPlayerMove(world, pl, others, dt) {
  const primal = { x: pl.vel.x, y: pl.vel.y, z: pl.vel.z };
  const planes = [];
  let timeLeft = dt, blocked = 0;
  for (let bump = 0; bump < 4; bump++) {
    if (pl.vel.x === 0 && pl.vel.y === 0 && pl.vel.z === 0) break;
    const delta = { x: pl.vel.x * timeLeft, y: pl.vel.y * timeLeft, z: pl.vel.z * timeLeft };
    const tr = traceHull(world, pl.pos, delta, C.HULL_HW, pl.height, others, pl);
    if (tr.startSolid) { unstick(world, pl, others); break; }
    if (tr.frac > 0) {
      pl.pos.x += delta.x * tr.frac;
      pl.pos.y += delta.y * tr.frac;
      pl.pos.z += delta.z * tr.frac;
    }
    if (tr.frac === 1) break;
    if (tr.nz > 0.7) blocked |= 1; else if (tr.nz === 0) blocked |= 2;
    timeLeft -= timeLeft * tr.frac;
    planes.push({ x: tr.nx, y: tr.ny, z: tr.nz });
    if (planes.length === 1) {
      clipVelocity(pl.vel, tr.nx, tr.ny, tr.nz, 1.0);
    } else {
      // slide along the crease of the two planes
      let done = false;
      for (const p of planes) {
        const v = { x: primal.x, y: primal.y, z: primal.z };
        clipVelocity(v, p.x, p.y, p.z, 1.0);
        let ok = true;
        for (const q of planes) {
          if (q === p) continue;
          if (v.x * q.x + v.y * q.y + v.z * q.z < 0) { ok = false; break; }
        }
        if (ok) { pl.vel.x = v.x; pl.vel.y = v.y; pl.vel.z = v.z; done = true; break; }
      }
      if (!done) {
        if (planes.length !== 2) { pl.vel.x = pl.vel.y = pl.vel.z = 0; break; }
        const a = planes[0], b = planes[1];
        const dir = {
          x: a.y * b.z - a.z * b.y,
          y: a.z * b.x - a.x * b.z,
          z: a.x * b.y - a.y * b.x,
        };
        const l = Math.hypot(dir.x, dir.y, dir.z) || 1;
        const d = (dir.x * primal.x + dir.y * primal.y + dir.z * primal.z) / (l * l);
        pl.vel.x = dir.x * d; pl.vel.y = dir.y * d; pl.vel.z = dir.z * d;
      }
      if (pl.vel.x * primal.x + pl.vel.y * primal.y + pl.vel.z * primal.z <= 0) {
        pl.vel.x = pl.vel.y = pl.vel.z = 0;
        break;
      }
    }
  }
  return blocked;
}

function stepMove(world, pl, others, dt) {
  const startPos = { ...pl.pos }, startVel = { ...pl.vel };
  tryPlayerMove(world, pl, others, dt);
  const downPos = { ...pl.pos }, downVel = { ...pl.vel };

  // retry: hop up, move, drop back down
  pl.pos.x = startPos.x; pl.pos.y = startPos.y; pl.pos.z = startPos.z;
  pl.vel.x = startVel.x; pl.vel.y = startVel.y; pl.vel.z = startVel.z;

  let tr = traceHull(world, pl.pos, { x: 0, y: 0, z: C.STEP_SIZE }, C.HULL_HW, pl.height, others, pl);
  pl.pos.z += C.STEP_SIZE * tr.frac;
  tryPlayerMove(world, pl, others, dt);
  tr = traceHull(world, pl.pos, { x: 0, y: 0, z: -C.STEP_SIZE * 2 }, C.HULL_HW, pl.height, others, pl);
  // nothing walkable underneath (ledge / airborne) -> keep the un-stepped move,
  // otherwise the step-down would drag the player back through the floor
  if (tr.frac === 1 || tr.nz < C.MAX_CLIMB_SLOPE) {
    pl.pos.x = downPos.x; pl.pos.y = downPos.y; pl.pos.z = downPos.z;
    pl.vel.x = downVel.x; pl.vel.y = downVel.y; pl.vel.z = downVel.z;
    return;
  }
  pl.pos.z -= C.STEP_SIZE * 2 * tr.frac;

  const dDown = (downPos.x - startPos.x) ** 2 + (downPos.y - startPos.y) ** 2;
  const dUp = (pl.pos.x - startPos.x) ** 2 + (pl.pos.y - startPos.y) ** 2;
  if (dDown > dUp) {
    pl.pos.x = downPos.x; pl.pos.y = downPos.y; pl.pos.z = downPos.z;
    pl.vel.x = downVel.x; pl.vel.y = downVel.y; pl.vel.z = downVel.z;
  } else {
    pl.vel.z = downVel.z;
  }
}

function friction(pl, dt) {
  const speed = Math.hypot(pl.vel.x, pl.vel.y, pl.vel.z);
  if (speed < 0.1) return;
  const control = speed < C.SV_STOPSPEED ? C.SV_STOPSPEED : speed;
  const drop = control * C.SV_FRICTION * dt;
  const newspeed = Math.max(0, speed - drop) / speed;
  pl.vel.x *= newspeed; pl.vel.y *= newspeed; pl.vel.z *= newspeed;
}

function accelerate(pl, wishdir, wishspeed, accel, dt) {
  const current = pl.vel.x * wishdir.x + pl.vel.y * wishdir.y;
  const add = wishspeed - current;
  if (add <= 0) return;
  let accelspeed = accel * dt * wishspeed;
  if (accelspeed > add) accelspeed = add;
  pl.vel.x += accelspeed * wishdir.x;
  pl.vel.y += accelspeed * wishdir.y;
}

function airAccelerate(pl, wishdir, wishspeed, dt) {
  const wishspd = Math.min(wishspeed, C.AIR_SPEED_CAP);
  const current = pl.vel.x * wishdir.x + pl.vel.y * wishdir.y;
  const add = wishspd - current;
  if (add <= 0) return;
  let accelspeed = C.SV_AIRACCELERATE * wishspeed * dt;
  if (accelspeed > add) accelspeed = add;
  pl.vel.x += accelspeed * wishdir.x;
  pl.vel.y += accelspeed * wishdir.y;
}

function checkGround(world, pl, others) {
  if (pl.vel.z > 140) { pl.onGround = false; return; }
  const tr = traceHull(world, pl.pos, { x: 0, y: 0, z: -2 }, C.HULL_HW, pl.height, others, pl);
  if (tr.frac === 1 || tr.nz < C.MAX_CLIMB_SLOPE) {
    pl.onGround = false;
  } else {
    if (!pl.onGround && pl.vel.z <= 0) pl.landSpeed = -pl.vel.z;
    pl.onGround = true;
    pl.groundEnt = tr.ent;
    if (pl.vel.z <= 0) pl.vel.z = 0;
  }
}

/**
 * One movement tick.
 * cmd = { forward, side, jump, duck, walk, yaw, speedCap }
 */
export function pmove(world, pl, cmd, dt, others) {
  pl.landSpeed = 0;

  // ---- duck ------------------------------------------------------------
  const wantDuck = !!cmd.duck;
  if (wantDuck && !pl.ducked) {
    pl.duckTime = Math.min(1, pl.duckTime + dt / C.DUCK_TIME);
    if (pl.duckTime >= 1) {
      pl.ducked = true;
      if (pl.onGround) { /* feet stay put */ } else { pl.pos.z += C.STAND_H - C.DUCK_H; }
      pl.height = C.DUCK_H;
    }
  } else if (!wantDuck && (pl.ducked || pl.duckTime > 0)) {
    if (pl.ducked) {
      const probe = { x: pl.pos.x, y: pl.pos.y, z: pl.onGround ? pl.pos.z : pl.pos.z - (C.STAND_H - C.DUCK_H) };
      if (!hullBlocked(world, probe, C.HULL_HW, C.STAND_H, others, pl)) {
        pl.ducked = false;
        pl.height = C.STAND_H;
        pl.pos.z = probe.z;
        pl.duckTime = 0;
      }
    } else {
      pl.duckTime = Math.max(0, pl.duckTime - dt / C.UNDUCK_TIME);
    }
  }
  pl.height = pl.ducked ? C.DUCK_H : C.STAND_H;

  // ---- wish direction --------------------------------------------------
  const cy = Math.cos(cmd.yaw), sy = Math.sin(cmd.yaw);
  let wx = cy * cmd.forward + sy * cmd.side;
  let wy = sy * cmd.forward - cy * cmd.side;
  const wl = Math.hypot(wx, wy);
  let wishspeed = 0;
  const wishdir = { x: 0, y: 0 };
  let maxSpeed = Math.min(cmd.speedCap ?? C.MAX_SPEED, C.MAX_SPEED);
  if (pl.ducked) maxSpeed *= C.DUCK_MOD;
  else if (cmd.walk) maxSpeed *= C.WALK_MOD;
  if (wl > 1e-5) {
    wishdir.x = wx / wl; wishdir.y = wy / wl;
    wishspeed = Math.min(wl, 1) * maxSpeed;
  }
  pl.wishSpeed = wishspeed;
  pl.maxSpeedNow = maxSpeed;

  checkGround(world, pl, others);

  // ---- jump ------------------------------------------------------------
  if (cmd.jump && pl.onGround && pl.jumpCooldown <= 0) {
    pl.vel.z = C.JUMP_IMPULSE;
    pl.onGround = false;
    pl.jumpCooldown = 0.08;
    pl.justJumped = true;
  } else {
    pl.justJumped = false;
  }
  pl.jumpCooldown = Math.max(0, pl.jumpCooldown - dt);

  if (pl.onGround) {
    pl.vel.z = 0;
    friction(pl, dt);
    accelerate(pl, wishdir, wishspeed, C.SV_ACCELERATE, dt);
    pl.vel.z = 0;
    stepMove(world, pl, others, dt);
    checkGround(world, pl, others);
  } else {
    // airborne: plain slide-move. Step logic is ground-only in Source, and
    // running it here would cancel the jump on the way up.
    pl.vel.z -= C.GRAVITY * dt * 0.5;
    airAccelerate(pl, wishdir, wishspeed, dt);
    tryPlayerMove(world, pl, others, dt);
    pl.vel.z -= C.GRAVITY * dt * 0.5;
    checkGround(world, pl, others);
  }

  // ---- landing ---------------------------------------------------------
  let fallDamage = 0;
  if (pl.onGround && pl.landSpeed > C.FALL_SAFE_SPEED) {
    fallDamage = (pl.landSpeed - C.FALL_SAFE_SPEED) *
      (100 / (C.FALL_FATAL_SPEED - C.FALL_SAFE_SPEED));
  }
  pl.speed2d = Math.hypot(pl.vel.x, pl.vel.y);
  return { fallDamage, landed: pl.onGround && pl.landSpeed > 100, landSpeed: pl.landSpeed };
}

export const eyeHeight = (pl) => (pl.ducked ? C.EYE_DUCK : C.EYE_STAND);

/** where a player's eyes are this instant, including the duck lerp */
export function eyePos(pl) {
  return { x: pl.pos.x, y: pl.pos.y, z: pl.pos.z + eyeHeight(pl) + (pl.viewOffsetZ || 0) };
}

export { clamp };
