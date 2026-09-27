"use strict";
// ---------- Primitive models -> pixel art (orthographic ray-caster) ----------
// One camera and one light for everything in the game:
//   camera: orthographic, pitched CAM_PITCH below the horizon, looking north
//   light:  from the upper left of the screen (west, north, above)
// World axes: x east, y south (toward the viewer), z up. 1 unit = 1 screen pixel across.
// A world point (x, y, z) lands on screen at (ax + x, ay + y*SIN_P - z*COS_P),
// where (ax, ay) is the sprite's anchor = the object's ground contact point.

const CAM_PITCH = 50 * Math.PI / 180;
const SIN_P = Math.sin(CAM_PITCH), COS_P = Math.cos(CAM_PITCH);

function vAdd(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function vSub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function vMul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function vDot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function vLen(a) { return Math.sqrt(vDot(a, a)); }
function vNorm(a) { const l = vLen(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
function vLerp(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }

const LIGHT = vNorm([-0.6, -0.12, 0.79]);    // toward the light
const TO_CAM = [0, COS_P, SIN_P];            // toward the camera
const RAY_DIR = [0, -COS_P, -SIN_P];         // camera ray direction (unit)

// 3x3 row-major matrices
const M_ID = [1, 0, 0, 0, 1, 0, 0, 0, 1];
function mRotZ(a) { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]; }
function mRotX(a) { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; }
function mRotY(a) { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; }
function mMul(a, b) {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
    r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
  }
  return r;
}
function mVec(m, v) { return [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]]; }
function mTVec(m, v) { return [m[0] * v[0] + m[3] * v[1] + m[6] * v[2], m[1] * v[0] + m[4] * v[1] + m[7] * v[2], m[2] * v[0] + m[5] * v[1] + m[8] * v[2]]; }

// ---------- materials: ramp + base tone ----------
const MATS = {
  skin:    { ramp: "skin", base: 2 },
  hair:    { ramp: "hair", base: 2 },
  tunic:   { ramp: "cloth", base: 2 },
  tunicD:  { ramp: "cloth", base: 1 },
  leather: { ramp: "earth", base: 1 },
  boot:    { ramp: "hair", base: 1 },
  wood:    { ramp: "earth", base: 2 },
  bark:    { ramp: "earth", base: 1 },
  steel:   { ramp: "neutral", base: 3, shiny: true },
  iron:    { ramp: "neutral", base: 2, shiny: true },
  gold:    { ramp: "gold", base: 2, shiny: true },
  leaf:    { ramp: "green", base: 3 },
  leafD:   { ramp: "green", base: 2 },
  plant:   { ramp: "green", base: 3 },
  stone:   { ramp: "stone", base: 2 },
  stoneL:  { ramp: "stone", base: 3 },
  dstone:  { ramp: "dstone", base: 2 },
  red:     { ramp: "red", base: 2 },
  redD:    { ramp: "red", base: 1 },
  purple:  { ramp: "purple", base: 2 },
  slime:   { ramp: "green", base: 4 },
  moss:    { ramp: "green", base: 2 },
  teal:    { ramp: "water", base: 3 },
  white:   { ramp: "neutral", base: 4 },
  cloth2:  { ramp: "red", base: 2 },
  ink:     { ramp: "ink", base: 0 },
};

// ---------- primitive constructors ----------
// Options: part (int, contour grouping), grp, tone (base override), shiny, flat, tex(q, n) -> tone delta
function P_ell(c, r, mat, o) { return Object.assign({ k: "ell", c, r: Array.isArray(r) ? r : [r, r, r], mat, rot: null, part: 0 }, o); }
function P_cap(a, b, r, mat, o) { return Object.assign({ k: "rc", a, b, ra: r, rb: r, mat, part: 0 }, o); }
function P_cone(a, b, ra, rb, mat, o) { return Object.assign({ k: "rc", a, b, ra, rb, mat, part: 0 }, o); }
function P_cyl(a, b, r, mat, o) { return Object.assign({ k: "cyl", a, b, r, mat, part: 0 }, o); }
function P_box(c, h, mat, o) { return Object.assign({ k: "box", c, h, mat, rot: null, part: 0 }, o); }
// Frustum: a cone cut flat at both ends (cloaks, robes, skirts, lampshades).
function P_frustum(a, b, ra, rb, mat, o) { return Object.assign({ k: "fr", a, b, ra, rb, mat, part: 0 }, o); }

// Rotate (3x3) then translate a list of primitives.
function xformPrims(prims, m, t) {
  t = t || [0, 0, 0];
  const pt = (p) => vAdd(mVec(m, p), t);
  return prims.map(p => {
    const q = Object.assign({}, p);
    if (p.k === "ell" || p.k === "box") { q.c = pt(p.c); q.rot = p.rot ? mMul(m, p.rot) : m.slice(); }
    else { q.a = pt(p.a); q.b = pt(p.b); }
    return q;
  });
}

// ---------- ray intersections (return distance t along RAY_DIR, Infinity = miss) ----------
function hitEll(p, o, d) {
  let lo = vSub(o, p.c), ld = d;
  if (p.rot) { lo = mTVec(p.rot, lo); ld = mTVec(p.rot, ld); }
  const r = p.r;
  const ox = lo[0] / r[0], oy = lo[1] / r[1], oz = lo[2] / r[2];
  const dx = ld[0] / r[0], dy = ld[1] / r[1], dz = ld[2] / r[2];
  const a = dx * dx + dy * dy + dz * dz, b = ox * dx + oy * dy + oz * dz, c = ox * ox + oy * oy + oz * oz - 1;
  const disc = b * b - a * c;
  if (disc < 0) return Infinity;
  return (-b - Math.sqrt(disc)) / a;
}

function hitRC(p, o, d) {
  const ra = p.ra, rb = p.rb;
  const ba = vSub(p.b, p.a), oa = vSub(o, p.a), ob = vSub(o, p.b);
  const rr = ra - rb;
  const m0 = vDot(ba, ba), m1 = vDot(ba, oa), m2 = vDot(ba, d), m3 = vDot(d, oa), m5 = vDot(oa, oa), m6 = vDot(ob, d), m7 = vDot(ob, ob);
  const d2 = m0 - rr * rr;
  const k2 = d2 - m2 * m2;
  if (Math.abs(k2) > 1e-9) {
    const k1 = d2 * m3 - m1 * m2 + m2 * rr * ra;
    const k0 = d2 * m5 - m1 * m1 + m1 * rr * ra * 2 - m0 * ra * ra;
    const h = k1 * k1 - k0 * k2;
    if (h < 0) return Infinity;
    const t = (-Math.sqrt(h) - k1) / k2;
    const y = m1 - ra * rr + t * m2;
    if (y > 0 && y < d2) return t;
  }
  const h1 = m3 * m3 - m5 + ra * ra;
  const h2 = m6 * m6 - m7 + rb * rb;
  let best = Infinity;
  if (h1 > 0) best = -m3 - Math.sqrt(h1);
  if (h2 > 0) { const t2 = -m6 - Math.sqrt(h2); if (t2 < best) best = t2; }
  return best;
}

function hitCyl(p, o, d) {
  const ca = vSub(p.b, p.a), oc = vSub(o, p.a);
  const caca = vDot(ca, ca), card = vDot(ca, d), caoc = vDot(ca, oc);
  const a = caca - card * card, b = caca * vDot(oc, d) - caoc * card;
  const c = caca * vDot(oc, oc) - caoc * caoc - p.r * p.r * caca;
  if (Math.abs(a) < 1e-9) {
    // ray parallel to the axis: only the caps can be hit
    const t = (card > 0 ? 0 - caoc : caca - caoc) / card;
    const q = vSub(vAdd(oc, vMul(d, t)), vMul(ca, (caoc + t * card) / caca));
    return vDot(q, q) <= p.r * p.r ? t : Infinity;
  }
  let h = b * b - a * c;
  if (h < 0) return Infinity;
  h = Math.sqrt(h);
  let t = (-b - h) / a;
  const y = caoc + t * card;
  if (y > 0 && y < caca) return t;
  t = (((y < 0) ? 0 : caca) - caoc) / card;
  if (Math.abs(b + a * t) < h) return t;
  return Infinity;
}

function hitBox(p, o, d) {
  let lo = vSub(o, p.c), ld = d;
  if (p.rot) { lo = mTVec(p.rot, lo); ld = mTVec(p.rot, ld); }
  let tN = -Infinity, tF = Infinity;
  for (let i = 0; i < 3; i++) {
    const h = p.h[i];
    if (Math.abs(ld[i]) < 1e-12) { if (Math.abs(lo[i]) > h) return Infinity; continue; }
    const inv = 1 / ld[i];
    let t1 = (-h - lo[i]) * inv, t2 = (h - lo[i]) * inv;
    if (t1 > t2) { const s = t1; t1 = t2; t2 = s; }
    if (t1 > tN) tN = t1;
    if (t2 < tF) tF = t2;
    if (tN > tF) return Infinity;
  }
  return tN;
}

// Capped cone (after Inigo Quilez's ray-cone intersector).
function hitFr(p, o, d) {
  const ba = vSub(p.b, p.a), oa = vSub(o, p.a), ob = vSub(o, p.b);
  const m0 = vDot(ba, ba), m1 = vDot(oa, ba), m2 = vDot(d, ba), m3 = vDot(d, oa), m5 = vDot(oa, oa), m9 = vDot(ob, ba);
  const ra = p.ra, rb = p.rb;
  if (m1 < 0) {
    const q = vSub(vMul(oa, m2), vMul(d, m1));
    if (vDot(q, q) < ra * ra * m2 * m2) return -m1 / m2;
  } else if (m9 > 0) {
    const t = -m9 / m2, q = vAdd(ob, vMul(d, t));
    if (vDot(q, q) < rb * rb) return t;
  }
  const rr = ra - rb, hy = m0 + rr * rr;
  const k2 = m0 * m0 - m2 * m2 * hy;
  const k1 = m0 * m0 * m3 - m1 * m2 * hy + m0 * ra * (rr * m2);
  const k0 = m0 * m0 * m5 - m1 * m1 * hy + m0 * ra * (rr * m1 * 2 - m0 * ra);
  const h = k1 * k1 - k2 * k0;
  if (h < 0) return Infinity;
  const t = (-k1 - Math.sqrt(h)) / k2;
  const y = m1 + t * m2;
  if (y < 0 || y > m0) return Infinity;
  return t;
}

function hitPrim(p, o, d) {
  switch (p.k) {
    case "ell": return hitEll(p, o, d);
    case "rc": return hitRC(p, o, d);
    case "cyl": return hitCyl(p, o, d);
    case "box": return hitBox(p, o, d);
    case "fr": return hitFr(p, o, d);
  }
  return Infinity;
}

function sdRC(p, q) {
  const ba = vSub(p.b, p.a), l2 = vDot(ba, ba), rr = p.ra - p.rb, a2 = l2 - rr * rr, il2 = 1 / l2;
  const pa = vSub(q, p.a), y = vDot(pa, ba), z = y - l2;
  const w = vSub(vMul(pa, l2), vMul(ba, y));
  const x2 = vDot(w, w), y2 = y * y * l2, z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - p.rb;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - p.ra;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - p.ra;
}

function normalAt(p, q) {
  switch (p.k) {
    case "ell": {
      let l = vSub(q, p.c);
      if (p.rot) l = mTVec(p.rot, l);
      let n = [l[0] / (p.r[0] * p.r[0]), l[1] / (p.r[1] * p.r[1]), l[2] / (p.r[2] * p.r[2])];
      if (p.rot) n = mVec(p.rot, n);
      return vNorm(n);
    }
    case "box": {
      let l = vSub(q, p.c);
      if (p.rot) l = mTVec(p.rot, l);
      let bi = 0, bv = -1;
      for (let i = 0; i < 3; i++) { const v = Math.abs(l[i]) / p.h[i]; if (v > bv) { bv = v; bi = i; } }
      const n = [0, 0, 0];
      n[bi] = l[bi] < 0 ? -1 : 1;
      return p.rot ? mVec(p.rot, n) : n;
    }
    case "cyl": {
      const ba = vSub(p.b, p.a), L = vLen(ba);
      const ax = vDot(vSub(q, p.a), ba) / L;
      if (ax < 0.06) return vMul(ba, -1 / L);
      if (ax > L - 0.06) return vMul(ba, 1 / L);
      return vNorm(vSub(q, vAdd(p.a, vMul(ba, ax / L))));
    }
    case "rc": {
      const e = 0.04;
      return vNorm([
        sdRC(p, [q[0] + e, q[1], q[2]]) - sdRC(p, [q[0] - e, q[1], q[2]]),
        sdRC(p, [q[0], q[1] + e, q[2]]) - sdRC(p, [q[0], q[1] - e, q[2]]),
        sdRC(p, [q[0], q[1], q[2] + e]) - sdRC(p, [q[0], q[1], q[2] - e]),
      ]);
    }
    case "fr": {
      const ba = vSub(p.b, p.a), m0 = vDot(ba, ba), oa = vSub(q, p.a), y = vDot(oa, ba);
      if (y < 0.06 * Math.sqrt(m0)) return vMul(ba, -1 / Math.sqrt(m0));
      if (y > m0 - 0.06 * Math.sqrt(m0)) return vMul(ba, 1 / Math.sqrt(m0));
      const rr = p.ra - p.rb, hy = m0 + rr * rr;
      return vNorm(vSub(vMul(vAdd(vMul(oa, m0), vMul(ba, rr * p.ra)), m0), vMul(ba, hy * y)));
    }
  }
  return [0, 0, 1];
}

function primBounds(p) {
  let lo, hi;
  if (p.k === "ell") {
    const r = p.rot ? Math.max(p.r[0], p.r[1], p.r[2]) : 0;
    const rr = p.rot ? [r, r, r] : p.r;
    lo = vSub(p.c, rr); hi = vAdd(p.c, rr);
  } else if (p.k === "box") {
    let e = p.h;
    if (p.rot) {
      const m = p.rot;
      e = [0, 1, 2].map(i => Math.abs(m[i * 3]) * p.h[0] + Math.abs(m[i * 3 + 1]) * p.h[1] + Math.abs(m[i * 3 + 2]) * p.h[2]);
    }
    lo = vSub(p.c, e); hi = vAdd(p.c, e);
  } else {
    const r = p.k === "cyl" ? p.r : Math.max(p.ra, p.rb);   // "rc" and "fr"
    lo = [Math.min(p.a[0], p.b[0]) - r, Math.min(p.a[1], p.b[1]) - r, Math.min(p.a[2], p.b[2]) - r];
    hi = [Math.max(p.a[0], p.b[0]) + r, Math.max(p.a[1], p.b[1]) + r, Math.max(p.a[2], p.b[2]) + r];
  }
  return [lo, hi];
}

// Continuous tone offset from the surface normal. Surfaces facing the
// camera land on the material's base tone; toward the light brighter.
function shadeOffset(n, shiny) {
  const nl = vDot(n, LIGHT);
  let f;
  if (nl < -0.25) f = -1.5 - (-0.25 - nl) * 1.2;
  else if (nl < 0.15) f = -1.5 + (nl + 0.25) * 2.5;
  else if (nl < 0.55) f = -0.5 + (nl - 0.15) * 2.5;
  else if (nl < 0.85) f = 0.5 + (nl - 0.55) * 3.33;
  else f = 1.5 + (nl - 0.85) * 3.33;
  if (shiny) f = f * 1.25 + 0.15;
  return f;
}

// Quantise a continuous tone with the active style's dither band.
function quantTone(f, px, py) {
  const w = STYLE.shade.dither;
  if (w > 0) {
    const fl = Math.floor(f), frac = f - fl;
    if (Math.abs(frac - 0.5) < w) return ((px + py) & 1) ? fl : fl + 1;
  }
  return Math.round(f);
}

// ---------- the renderer ----------
// opt: { outline: "char"|"prop"|"none", decals: [...], contour: true }
// Returns { canvas, ax, ay, w, h }
function render3D(prims, W, H, ax, ay, opt) {
  opt = opt || {};
  const n = prims.length;
  const bx0 = new Int32Array(n), bx1 = new Int32Array(n), by0 = new Int32Array(n), by1 = new Int32Array(n);
  for (let i = 0; i < n; i++) {
    const [lo, hi] = primBounds(prims[i]);
    let sx0 = Infinity, sx1 = -Infinity, sy0 = Infinity, sy1 = -Infinity;
    for (let c = 0; c < 8; c++) {
      const x = (c & 1) ? hi[0] : lo[0], y = (c & 2) ? hi[1] : lo[1], z = (c & 4) ? hi[2] : lo[2];
      const sx = ax + x, sy = ay + y * SIN_P - z * COS_P;
      if (sx < sx0) sx0 = sx; if (sx > sx1) sx1 = sx;
      if (sy < sy0) sy0 = sy; if (sy > sy1) sy1 = sy;
    }
    bx0[i] = Math.floor(sx0) - 1; bx1[i] = Math.ceil(sx1) + 1;
    by0[i] = Math.floor(sy0) - 1; by1[i] = Math.ceil(sy1) + 1;
  }
  const N = W * H;
  const hit = new Int16Array(N).fill(-1);
  const tb = new Float32Array(N);
  const o = [0, 0, 0];
  for (let py = 0; py < H; py++) {
    const ys = py + 0.5 - ay;
    o[1] = ys * SIN_P + 1000 * COS_P;
    o[2] = -ys * COS_P + 1000 * SIN_P;
    for (let px = 0; px < W; px++) {
      o[0] = px + 0.5 - ax;
      let best = Infinity, bi = -1;
      for (let i = 0; i < n; i++) {
        if (px < bx0[i] || px > bx1[i] || py < by0[i] || py > by1[i]) continue;
        const t = hitPrim(prims[i], o, RAY_DIR);
        if (t < best) { best = t; bi = i; }
      }
      if (bi >= 0) { hit[py * W + px] = bi; tb[py * W + px] = best; }
    }
  }

  // shading
  const tone = new Int8Array(N);
  const locked = new Uint8Array(N); // 1 = contour/flat, excluded from cleanup
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = py * W + px, pi = hit[i];
      if (pi < 0) continue;
      const pr = prims[pi], mat = MATS[pr.mat];
      const base = pr.tone !== undefined ? pr.tone : mat.base;
      if (pr.flat) { tone[i] = base; locked[i] = 1; continue; }
      const t = tb[i];
      const q = [px + 0.5 - ax, (py + 0.5 - ay) * SIN_P + 1000 * COS_P - t * COS_P, -(py + 0.5 - ay) * COS_P + 1000 * SIN_P - t * SIN_P];
      const nrm = normalAt(pr, q);
      let f = base + shadeOffset(nrm, pr.shiny || mat.shiny);
      if (pr.tex) f += pr.tex(q, nrm, px, py);
      tone[i] = Math.max(0, Math.min(rampLen(mat.ramp) - 1, quantTone(f, px, py)));
    }
  }

  // contour lines on the far side of occlusion edges between different groups
  if (opt.contour !== false) {
    const mark = [];
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const i = py * W + px, pi = hit[i];
        if (pi < 0) continue;
        const g = prims[pi].grp !== undefined ? prims[pi].grp : prims[pi].part;
        if (prims[pi].line === false) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const x = px + dx, y = py + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const j = y * W + x, pj = hit[j];
          if (pj < 0) continue;
          const g2 = prims[pj].grp !== undefined ? prims[pj].grp : prims[pj].part;
          if (g2 !== g && tb[j] < tb[i] - 2.2) { mark.push(i); break; }
        }
      }
    }
    for (const i of mark) {
      tone[i] = STYLE.shade.contour === "darkest" ? 0 : Math.max(0, tone[i] - 2);
      locked[i] = 1;
    }
  }

  // stray-pixel cleanup: a lone tone surrounded by one other tone of the same material
  for (let py = 1; py < H - 1; py++) {
    for (let px = 1; px < W - 1; px++) {
      const i = py * W + px, pi = hit[i];
      if (pi < 0 || locked[i]) continue;
      const m = prims[pi].mat;
      let t0 = -1, ok = true;
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        const pj = hit[j];
        if (pj < 0 || prims[pj].mat !== m) { ok = false; break; }
        if (t0 < 0) t0 = tone[j]; else if (tone[j] !== t0) { ok = false; break; }
      }
      if (ok && t0 !== tone[i]) tone[i] = t0;
    }
  }

  const img = new Pix(W, H);
  for (let i = 0; i < N; i++) {
    const pi = hit[i];
    if (pi < 0) continue;
    img.d[i] = pc(MATS[prims[pi].mat].ramp, tone[i]);
  }

  // outline
  const mode = opt.outline || "char";
  if (mode !== "none") {
    const ink = inkU32();
    for (let py = 0; py < H; py++) {
      for (let px = 0; px < W; px++) {
        const i = py * W + px;
        if (hit[i] >= 0) continue;
        let src = -1, side = 0;
        // prefer neighbours below/right (outline sits on the lit side there)
        const nb = [[0, 1, 1], [1, 0, 1], [0, -1, 0], [-1, 0, 0]];
        for (const [dx, dy, lit] of nb) {
          const x = px + dx, y = py + dy;
          if (x < 0 || y < 0 || x >= W || y >= H) continue;
          const j = y * W + x;
          if (hit[j] >= 0) { src = j; side = lit; break; }
        }
        if (src < 0) continue;
        const mat = MATS[prims[hit[src]].mat];
        let c;
        if (mode === "prop") c = pc(mat.ramp, 0);
        else if (STYLE.outline.char === "ink") c = ink;
        // (a one-colour ramp such as pure light has no darker shade: its lit-side
        // outline would vanish into the sprite, so it keeps the ink line all round)
        else c = (side && tone[src] >= mat.base && STYLE.ramps[mat.ramp].length > 1) ? pc(mat.ramp, 0) : ink;
        img.d[i] = c;
      }
    }
  }

  // decals: small hand-placed details pinned to 3D points (eyes, buckles...)
  if (opt.decals) {
    for (const dc of opt.decals) {
      if (dc.face && vDot(vNorm(dc.face), TO_CAM) < (dc.minFacing || 0.15)) continue;
      const sx = Math.floor(ax + dc.p[0]), sy = Math.floor(ay + dc.p[1] * SIN_P - dc.p[2] * COS_P);
      if (sx < 0 || sy < 0 || sx >= W || sy >= H) continue;
      const i = sy * W + sx;
      if (hit[i] < 0) continue;
      const tp = -dc.p[1] * COS_P - dc.p[2] * SIN_P + 1000;
      if (Math.abs(tb[i] - tp) > (dc.tol || 2.5)) continue;
      for (const [dx, dy, col] of dc.px) {
        const x = sx + dx, y = sy + dy;
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        if (hit[y * W + x] < 0 && !dc.overhang) continue;
        img.d[y * W + x] = typeof col === "string" ? (col === "ink" ? inkU32() : pc(col, rampLen(col) - 1)) : pc(col[0], col[1]);
      }
    }
  }

  return { canvas: img.toCanvas(), pix: img, ax, ay, w: W, h: H };
}
