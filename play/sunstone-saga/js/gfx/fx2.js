"use strict";
// ---------- Effects at 512x480: smoke, blasts, sparkles, hit sparks, sword arcs ----------
// Every frame is drawn from palette colours with hard edges (no blending), built once.

const FX = {};
function fxCircle(p, cx, cy, r, col) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
    if (dx * dx + dy * dy <= r * r && x >= 0 && y >= 0 && x < p.w && y < p.h) p.d[y * p.w + x] = col;
  }
}
// A lit ball of smoke: dark rim below/right, light cap above/left.
// (the cap is white when the ramp has no lighter tone left)
function fxPuff(p, cx, cy, r, ramp, base) {
  fxCircle(p, cx + 0.6, cy + 0.8, r, pc(ramp, base - 1));
  fxCircle(p, cx, cy, r - 0.8, pc(ramp, base));
  if (r > 2.5) fxCircle(p, cx - r * 0.3, cy - r * 0.35, r * 0.45, base + 1 < rampLen(ramp) ? pc(ramp, base + 1) : pc("white", 0));
}

function buildFx() {
  // puff of smoke (spawn, death, teleport): six frames that bloom then thin away.
  // A lumpy cloud of unequal puffs round a small lit knot, with a couple of loose
  // wisps flying off its edge (one round ball read as a stone); grey dust. (Vex's violet
  // smoke is the looser cloud built by softPoof below.)
  const poof = (ramp, base) => {
    const out = [];
    for (let f = 0; f < 6; f++) {
      const p = new Pix(44, 44), k = f / 5, c0 = 22, lift = k * 4;
      const spread = 6 + k * 10, grow = f < 2 ? 1 + f * 0.35 : 1.7 - (f - 2) * 0.28;
      const lobes = [[0.3, 1, 4.6], [1.5, 0.8, 3.6], [2.5, 1.1, 4.2], [3.6, 0.9, 3.2], [4.6, 1, 4], [5.6, 0.75, 3]];
      for (const [a, d, r] of lobes) fxPuff(p, c0 + Math.cos(a) * spread * d, c0 + Math.sin(a) * spread * d * 0.8 - lift, Math.max(1.2, r * grow), ramp, base);
      if (f < 3) fxPuff(p, c0 - 1, c0 - 1 - lift, 3.4 - f, ramp, base);
      // loose wisps off the edge
      for (const [a, d, r] of [[0.9, 1.9, 2.4], [3.9, 1.8, 2.2]]) if (f >= 1) fxPuff(p, c0 + Math.cos(a) * spread * d, c0 + Math.sin(a) * spread * d * 0.8 - lift * 1.5, Math.max(1, r * (f < 4 ? 1 : 0.7)), ramp, base);
      // a soft shaded edge on the cloud's lower right only (a dark outline all round made
      // it read as a heap of stones)
      if (f < 4) {
        const rim = pc(ramp, base - 2), d = p.d, filled = d.slice();
        for (let y = 1; y < 43; y++) for (let x = 1; x < 43; x++) {
          const i = y * 44 + x;
          if (filled[i]) continue;
          if (filled[i - 1] || filled[i - 44]) d[i] = rim;
        }
      }
      // the last wisps thin out and drift up instead of shrinking into pebbles
      if (f >= 4) for (let y = 0; y < 44; y++) for (let x = 0; x < 44; x++) {
        if (f === 4 ? ((x + y) & 1) : ((x & 1) || (y & 1))) p.d[y * 44 + x] = 0;
      }
      out.push(p.toCanvas());
    }
    return out;
  };
  // Vex's violet smoke: one soft cloud, not a heap of balls. A broad, flat-bottomed
  // billow (a wide core, three bumps of different sizes along its top, flatter lobes at
  // the sides and below, all wider than tall and all touching) filled with one flat
  // violet; one shared darker band along the bottom and the lower right of the whole
  // cloud (no shade round each lobe); a single white cap on the upper-left bump; three
  // tiny puffs flung clear of it, above and to the sides (never hanging below, where
  // they read as drips). At its widest the cloud thins to a dither at its edge, then
  // all over, then to scattered specks. (Every lobe a round ball with its own dark
  // crescent and highlight read as grapes, berries or bubbles.)
  const softPoof = (ramp, base) => {
    const out = [], N = 44, c0 = 22, K = 1.12;
    // [dx, dy, rx, ry] at full size: core, the three top bumps, the side lobes, the base
    const lobes = [[0, 1, 7.5, 5], [-6.2, -3.4, 4.2, 3.6], [0.4, -6.0, 4.6, 4.0], [6.4, -3.8, 3.6, 3.1], [-9.8, 1.5, 3.4, 2.7], [9.6, 1.0, 3.0, 2.4], [-5, 4.4, 5, 2.5], [4, 4.6, 5.5, 2.5]];
    const bits = [[-14, -4, 1.3], [13, -7, 1.0], [-6, -12, 1.0]];
    const SP = [0.55, 0.8, 1.0, 1.12, 1.25, 1.35], GR = [0.55, 0.8, 1.0, 1.05, 1.0, 0.95];
    const body = pc(ramp, base), shade = pc(ramp, base - 1), cap = base + 1 < rampLen(ramp) ? pc(ramp, base + 1) : pc("white", 0);
    const inE = (x, y, cx, cy, rx, ry) => ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1;
    for (let f = 0; f < 6; f++) {
      const p = new Pix(N, N), lift = f * 0.8, sp = SP[f] * K, gr = GR[f] * K, cy0 = c0 - lift;
      const E = lobes.map(([dx, dy, rx, ry]) => [c0 + dx * sp, c0 + dy * sp - lift, rx * gr, ry * gr]);
      const all = new Uint8Array(N * N);
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (E.some(([cx, cy, rx, ry]) => inE(x, y, cx, cy, rx, ry))) all[y * N + x] = 1;
      // fill any gap closed in between lobes (it showed the floor through the cloud)
      const outside = new Uint8Array(N * N), st = [];
      for (let i = 0; i < N; i++) st.push([i, 0], [i, N - 1], [0, i], [N - 1, i]);
      while (st.length) {
        const [x, y] = st.pop();
        if (x < 0 || y < 0 || x >= N || y >= N || outside[y * N + x] || all[y * N + x]) continue;
        outside[y * N + x] = 1; st.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      for (let i = 0; i < N * N; i++) if (!outside[i]) all[i] = 1;
      const m = (x, y) => x >= 0 && y >= 0 && x < N && y < N && all[y * N + x];
      // the shared band: the lowest two pixels of each column and the right edge, on the
      // lower half only (on the upper half they drew a dark line inside the cloud)
      const bw = f < 1 ? 1 : 2;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (!m(x, y)) continue;
        let band = false;
        if (y >= cy0) { for (let k = 1; k <= bw; k++) if (!m(x, y + k)) band = true; if (!m(x + 1, y)) band = true; }
        p.d[y * N + x] = band ? shade : body;
      }
      if (f >= 1) for (const [dx, dy, r] of bits) {
        const bs = (0.8 + f * 0.22) * K, cx = c0 + dx * bs, cy = c0 + dy * bs - lift, rr = f < 4 ? r : r * 0.8;
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (inE(x, y, cx, cy, rr, rr)) p.d[y * N + x] = body;
      }
      if (f < 3) {
        const [cx, cy, rx, ry] = E[1], gx = Math.round(cx - rx * 0.45), gy = Math.round(cy - ry * 0.5);
        for (const [dx, dy] of f === 0 ? [[0, 0], [1, 0]] : [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]) p.d[(gy + dy) * N + gx + dx] = cap;
      }
      const nearEdge = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (!m(x + dx, y + dy)) return true; return false; };
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x;
        if (f === 3 && all[i] && nearEdge(x, y) && ((x + y) & 1)) p.d[i] = 0;
        if (f >= 4 && (f === 4 ? ((x + y) & 1) : ((x & 1) || (y & 1)))) p.d[i] = 0;
      }
      out.push(p.toCanvas());
    }
    return out;
  };
  // (a pale blue-grey, lighter than any rock, with white caps)
  FX.poof = poof("dstone", 4);
  FX.poofV = softPoof("purple", 3);
  // explosion: flash, fireball, then rolling smoke with embers
  FX.boom = [];
  for (let f = 0; f < 8; f++) {
    const p = new Pix(64, 64);
    if (f === 0) { fxCircle(p, 32, 32, 12, pc("gold", 3)); fxCircle(p, 32, 32, 8, pc("white", 0)); }
    else if (f < 4) {
      const r = 12 + f * 3;
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + f; fxPuff(p, 32 + Math.cos(a) * r * 0.55, 32 + Math.sin(a) * r * 0.5, r * 0.45, "red", 3); }
      fxCircle(p, 32, 32, r * 0.55, pc("gold", 3));
      fxCircle(p, 32, 31, r * 0.3, pc("white", 0));
    } else {
      const r = 14 + (f - 4) * 3;
      // (smoke after the blast: the same pale blue-grey cloud as every puff, thinning to a
      // dither as it goes instead of breaking into grey pebbles)
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + f * 0.7; fxPuff(p, 32 + Math.cos(a) * r * 0.5, 30 + Math.sin(a) * r * 0.38 - (f - 4) * 2, 8 - (f - 4) * 0.8, "dstone", 4); }
      fxPuff(p, 31, 29 - (f - 4) * 2, 7 - (f - 4) * 0.6, "dstone", 4);
      if (f >= 6) for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) if (f === 6 ? ((x + y) & 1) : ((x & 1) || (y & 1))) p.d[y * 64 + x] = 0;
      for (let i = 0; i < 6; i++) { const a = i * 1.7 + f; const d = r + 4; const x = Math.round(32 + Math.cos(a) * d), y = Math.round(32 + Math.sin(a) * d * 0.8); if (x > 0 && y > 0 && x < 63 && y < 63) { p.d[y * 64 + x] = pc("gold", 3); p.d[y * 64 + x + 1] = pc("red", 2); } }
    }
    FX.boom.push(p.toCanvas());
  }
  // sparkle (healing, pickups): a four-pointed twinkle
  FX.sparkle = [];
  for (let f = 0; f < 4; f++) {
    const p = new Pix(24, 24), L = [4, 8, 6, 3][f];
    for (let i = -L; i <= L; i++) { p.d[12 * 24 + 12 + i] = pc("white", 0); p.d[(12 + i) * 24 + 12] = pc("white", 0); }
    for (let i = -Math.floor(L / 2); i <= Math.floor(L / 2); i++) { if (i) { p.d[(12 + i) * 24 + 12 + i] = pc("gold", 3); p.d[(12 - i) * 24 + 12 + i] = pc("gold", 3); } }
    FX.sparkle.push(p.toCanvas());
  }
  // hit spark: a quick white star with a gold rim where the blade lands
  FX.spark = [];
  for (let f = 0; f < 3; f++) {
    const p = new Pix(32, 32), L = [7, 11, 9][f];
    for (let a = 0; a < 8; a++) {
      const ang = a * Math.PI / 4 + (f === 1 ? Math.PI / 8 : 0), len = a & 1 ? L * 0.55 : L;
      for (let s = f === 2 ? 4 : 0; s <= len; s++) {
        const x = Math.round(16 + Math.cos(ang) * s), y = Math.round(16 + Math.sin(ang) * s);
        p.d[y * 32 + x] = s > len - 2 ? pc("gold", 3) : pc("white", 0);
      }
    }
    FX.spark.push(p.toCanvas());
  }
  // sword arcs: a crescent trailing the blade from the sword hand's side round to where
  // the blade is now: mid-swing, at full reach, then fading (per direction)
  FX.arc = {};
  const ARC = { [DOWN]: [Math.PI, Math.PI / 2], [UP]: [0, -Math.PI / 2], [LEFT]: [1.5 * Math.PI, Math.PI], [RIGHT]: [Math.PI / 2, 0] };
  for (const dir of [UP, DOWN, LEFT, RIGHT]) {
    FX.arc[dir] = [];
    for (let f = 0; f < 3; f++) {
      const p = new Pix(80, 80);
      const [a0, a1] = ARC[dir];
      const uMax = f === 0 ? 0.55 : 1;
      for (let y = 0; y < 80; y++) for (let x = 0; x < 80; x++) {
        const dx = x + 0.5 - 40, dy = (y + 0.5 - 40) / 0.85, r = Math.hypot(dx, dy);
        if (r < 17 || r > 27) continue;
        let a = Math.atan2(dy, dx);
        // position along the sweep, 0 at the start, 1 at the facing
        let u = (a - a0) / (a1 - a0);
        if (u < 0 || u > 1) { a += a1 > a0 ? -2 * Math.PI : 2 * Math.PI; u = (a - a0) / (a1 - a0); }
        if (u < 0 || u > 1) { a += a1 > a0 ? 4 * Math.PI : -4 * Math.PI; u = (a - a0) / (a1 - a0); }
        if (u < 0 || u > uMax) continue;
        if (f === 2 && ((x + y) & 1)) continue;                     // the fading frame thins out
        if (u < uMax * 0.4 && ((x + y) & 1)) continue;              // the tail dissolves
        p.d[y * 80 + x] = r > 24.5 ? pc("white", 0) : pc("cloth", 3);   // a bright outer rim
      }
      FX.arc[dir].push(p.toCanvas());
    }
  }
}

const FX_KIND = { poof0: "poof", boomexp0: "boom", sparkle: "sparkle", spark: "spark" };
// Legacy effects are 16px logic sprites at (x, y); ours are centred on the same spot.
function drawEffects2(c) {
  for (const e of G.effects) {
    const kind = FX_KIND[e.spr0];
    if (!kind) { withLegacy(c, () => drawSpr(c, (e.t & 4) ? e.spr1 : e.spr0, e.x, e.y)); continue; }
    // (Vex vanishes in violet smoke)
    const violet = kind === "poof" && G.area === "dungeon" && G.enemies.some(o => o.kind === "boss_vex" && !o.dead);
    const frames = violet ? FX.poofV : FX[kind], fr = frames[Math.min(frames.length - 1, Math.floor(e.t / e.dur * frames.length))];
    c.drawImage(fr, Math.round((e.x + 8) * SC - fr.width / 2), Math.round((e.y + 8) * SC + RHUD - fr.height / 2));
  }
}
// The sword's sweep, drawn behind the blade while it can hit.
function drawSwordArc(c) {
  if (P.dead || P.state !== "attack" || P.attackT > 11 || P.attackT < 5) return;
  const fr = FX.arc[P.dir][P.attackT >= 9 ? 0 : P.attackT >= 6 ? 1 : 2];
  c.drawImage(fr, Math.round((P.x + 8) * SC - 40), Math.round((P.y + 9) * SC + RHUD - 40));
}
