// math.js — small vector/angle library. Game space is Z-up, Source convention.
//   forward = (cos(yaw)cos(pitch), sin(yaw)cos(pitch), -sin(pitch))
// Vectors are plain {x,y,z} objects so gameplay code has no renderer dependency.

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;
export const TAU = Math.PI * 2;

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const sign = (v) => (v < 0 ? -1 : v > 0 ? 1 : 0);
export const approach = (cur, tgt, step) =>
  cur < tgt ? Math.min(cur + step, tgt) : Math.max(cur - step, tgt);
/** frame-rate independent exponential smoothing */
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

export const v3 = (x = 0, y = 0, z = 0) => ({ x, y, z });
export const vcopy = (a) => ({ x: a.x, y: a.y, z: a.z });
export const vset = (o, x, y, z) => { o.x = x; o.y = y; o.z = z; return o; };
export const vsetv = (o, a) => { o.x = a.x; o.y = a.y; o.z = a.z; return o; };
export const vadd = (a, b) => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
export const vsub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
export const vmul = (a, s) => ({ x: a.x * s, y: a.y * s, z: a.z * s });
/** a + b*s */
export const vmadd = (a, b, s) => ({ x: a.x + b.x * s, y: a.y + b.y * s, z: a.z + b.z * s });
export const vdot = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
export const vcross = (a, b) => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
});
export const vlen = (a) => Math.hypot(a.x, a.y, a.z);
export const vlen2d = (a) => Math.hypot(a.x, a.y);
export const vdist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
export const vdist2d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const vdistSq = (a, b) => {
  const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
};
export function vnorm(a) {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return { x: a.x / l, y: a.y / l, z: a.z / l };
}
export const vlerp = (a, b, t) => ({
  x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t),
});

/** forward / right / up basis from yaw+pitch (radians) */
export function angleVectors(yaw, pitch) {
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return {
    f: { x: cy * cp, y: sy * cp, z: -sp },
    r: { x: sy, y: -cy, z: 0 },          // right-hand side of the view
    u: { x: cy * sp, y: sy * sp, z: cp },
  };
}
export const forwardVec = (yaw, pitch) => {
  const cp = Math.cos(pitch);
  return { x: Math.cos(yaw) * cp, y: Math.sin(yaw) * cp, z: -Math.sin(pitch) };
};
/** yaw+pitch that point along v */
export function vecToAngles(v) {
  return { yaw: Math.atan2(v.y, v.x), pitch: -Math.atan2(v.z, Math.hypot(v.x, v.y)) };
}
/** wrap to (-PI, PI] */
export function normAngle(a) {
  a = a % TAU;
  if (a > Math.PI) a -= TAU;
  if (a <= -Math.PI) a += TAU;
  return a;
}
export const angleDelta = (a, b) => normAngle(a - b);
/** move angle `cur` toward `tgt` by at most `step` radians */
export function approachAngle(cur, tgt, step) {
  const d = normAngle(tgt - cur);
  if (Math.abs(d) <= step) return normAngle(tgt);
  return normAngle(cur + sign(d) * step);
}

// ---------------------------------------------------------------- random
/** deterministic PRNG (mulberry32) */
export function makeRng(seed = 1) {
  let a = seed >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.range = (lo, hi) => lo + r() * (hi - lo);
  r.int = (lo, hi) => Math.floor(lo + r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.sign = () => (r() < 0.5 ? -1 : 1);
  /** approx standard normal via 3-sample CLT, clamped to +/-3 sigma */
  r.gauss = () => clamp((r() + r() + r() - 1.5) * 1.5386, -3, 3);
  return r;
}

/** Stable 32-bit seed for a number/string pair. Useful for reproducible bots. */
export function deriveSeed(base = 1, salt = '') {
  let h = (Number(base) >>> 0) || 1;
  const text = String(salt);
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}
export const rng = makeRng((Math.random() * 0xffffffff) >>> 0);

// ---------------------------------------------------------------- AABB
export const aabb = (min, max) => ({ min, max });
export function aabbFromCenter(c, hx, hy, hz) {
  return {
    min: { x: c.x - hx, y: c.y - hy, z: c.z - hz },
    max: { x: c.x + hx, y: c.y + hy, z: c.z + hz },
  };
}
export const aabbOverlap = (a, b) =>
  a.min.x < b.max.x && a.max.x > b.min.x &&
  a.min.y < b.max.y && a.max.y > b.min.y &&
  a.min.z < b.max.z && a.max.z > b.min.z;
export const pointInAabb2d = (p, b) =>
  p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y && p.y <= b.max.y;
export const pointInAabb = (p, b) =>
  p.x >= b.min.x && p.x <= b.max.x && p.y >= b.min.y &&
  p.y <= b.max.y && p.z >= b.min.z && p.z <= b.max.z;

/**
 * Slab test: ray (o,d) vs AABB expanded by half-extents `e` (Minkowski sum,
 * i.e. sweeping a box hull). Returns {t, nx, ny, nz} or null.
 * `d` is the full displacement, so t is in [0,1].
 */
export function traceBoxAabb(o, d, box, e) {
  let tmin = 0, tmax = 1, nx = 0, ny = 0, nz = 0;
  const lo = [box.min.x - e.x, box.min.y - e.y, box.min.z - e.z];
  const hi = [box.max.x + e.x, box.max.y + e.y, box.max.z + e.z];
  const op = [o.x, o.y, o.z], dp = [d.x, d.y, d.z];
  let axis = -1, sgn = 0;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(dp[i]) < 1e-9) {
      if (op[i] < lo[i] || op[i] > hi[i]) return null;
      continue;
    }
    const inv = 1 / dp[i];
    let t1 = (lo[i] - op[i]) * inv, t2 = (hi[i] - op[i]) * inv, s = -1;
    if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; s = 1; }
    if (t1 > tmin) { tmin = t1; axis = i; sgn = s; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  if (axis < 0) return null;          // started inside — caller handles
  if (axis === 0) nx = sgn; else if (axis === 1) ny = sgn; else nz = sgn;
  return { t: tmin, nx, ny, nz };
}

/** ray vs AABB, unbounded t>=0. returns t or Infinity */
export function rayAabb(o, d, box) {
  let tmin = 0, tmax = Infinity;
  const lo = [box.min.x, box.min.y, box.min.z];
  const hi = [box.max.x, box.max.y, box.max.z];
  const op = [o.x, o.y, o.z], dp = [d.x, d.y, d.z];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(dp[i]) < 1e-9) {
      if (op[i] < lo[i] || op[i] > hi[i]) return Infinity;
      continue;
    }
    const inv = 1 / dp[i];
    let t1 = (lo[i] - op[i]) * inv, t2 = (hi[i] - op[i]) * inv;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
    if (t1 > tmin) tmin = t1;
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return Infinity;
  }
  return tmin;
}

/** ray vs AABB returning hit distance and face normal, or null */
export function rayAabbN(o, d, box) {
  let tmin = 0, tmax = Infinity, axis = -1, sgn = 0;
  const lo = [box.min.x, box.min.y, box.min.z];
  const hi = [box.max.x, box.max.y, box.max.z];
  const op = [o.x, o.y, o.z], dp = [d.x, d.y, d.z];
  for (let i = 0; i < 3; i++) {
    if (Math.abs(dp[i]) < 1e-9) {
      if (op[i] < lo[i] || op[i] > hi[i]) return null;
      continue;
    }
    const inv = 1 / dp[i];
    let t1 = (lo[i] - op[i]) * inv, t2 = (hi[i] - op[i]) * inv, s = -1;
    if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; }
    if (t1 > tmin) { tmin = t1; axis = i; sgn = s; }
    if (t2 < tmax) tmax = t2;
    if (tmin > tmax) return null;
  }
  const n = { x: 0, y: 0, z: 0 };
  if (axis === 0) n.x = sgn; else if (axis === 1) n.y = sgn; else if (axis === 2) n.z = sgn;
  else return null;
  return { t: tmin, n };
}

/** shortest distance from point p to segment ab */
export function distPointSeg(p, a, b) {
  const abx = b.x - a.x, aby = b.y - a.y, abz = b.z - a.z;
  const apx = p.x - a.x, apy = p.y - a.y, apz = p.z - a.z;
  const len2 = abx * abx + aby * aby + abz * abz;
  let t = len2 > 0 ? (apx * abx + apy * aby + apz * abz) / len2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(apx - abx * t, apy - aby * t, apz - abz * t);
}

export const fmtTime = (s) => {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
