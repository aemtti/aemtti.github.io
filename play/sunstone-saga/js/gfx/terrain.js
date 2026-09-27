"use strict";
// ---------- Height-field terrain renderer ----------
// Terrain lives on "ground-screen" coordinates: x across, v down the screen,
// where v is the row at which a ground point of height 0 appears. Heights h
// are in screen pixels, so a surface point (x, v, h) is drawn at (x, v - h).
// This is exactly the sprite camera of model3d.js (h = z*COS_P, v = y*SIN_P),
// so cliffs, walls and props all share one viewpoint and one light.

const TT = 32;                                   // tile size in screen pixels
const TER = { W: 512, H: 352, M: 64, HMAX: 52, HMIN: -16, CLIFF: 42, WATER: -6, MOAT: -14 };
const TM = {
  VOID: 0, GRASS: 1, GRASSD: 2, DIRT: 3, SAND: 4, ROCKY: 5, DEAD: 6,
  CTOP: 7, CFACE: 8, WATER: 9, BANK: 10, PLANK: 11, PLANKF: 12,
  FLOOR: 13, WTOP: 14, WFACE: 15, DOORWAY: 16, MOATF: 17,
  ICE: 18, LAVA: 19, PITB: 20, SWITCH: 21,
};
const TCLS = { GROUND: 0, CLIFF: 1, WATER: 2, PLANK: 3, WALL: 4, MOAT: 5, FLOOR: 6, PIT: 7, LAVA: 8 };
// What a screen pixel shows, for the finishing passes after the ray march.
const PXK = { GROUND: 1, WATER: 2, DECK: 3, DECKF: 4, PIT: 5, PITF: 6, LAVA: 7, LAVAF: 8, POOLF: 9, CURB: 10 };
// A bridge or dock deck stands this many pixels proud of the water line (a look only:
// the tiles, and so where the hero may walk, are unchanged).
const DECK_H = 2;
// how far a deck's front edge reaches out into the water tile south of it (see renderTerrain)
const DECK_EXT = 6;

// Direction toward the (shadow) light per pixel of height: short shadows to the lower right.
const SHD = (() => {
  const ls = vNorm([-0.45, -0.3, 1.3]);
  const dh = ls[2] * COS_P;
  return { dx: ls[0] / dh, dv: ls[1] * SIN_P / dh };
})();

function boxBlur(mask, w, h, r) {
  const W1 = w + 1;
  const sat = new Int32Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let row = 0;
    for (let x = 0; x < w; x++) {
      row += mask[y * w + x];
      sat[(y + 1) * W1 + x + 1] = sat[y * W1 + x + 1] + row;
    }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1);
      const s = sat[y1 * W1 + x1] - sat[y0 * W1 + x1] - sat[y1 * W1 + x0] + sat[y0 * W1 + x0];
      out[y * w + x] = s / ((x1 - x0) * (y1 - y0));
    }
  }
  return out;
}

// Tileable value noise (period in lattice cells) for looping textures.
function vnoiseP(x, y, px, py, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const m = (a, p) => ((a % p) + p) % p;
  const x0 = m(xi, px), x1 = m(xi + 1, px), y0 = m(yi, py), y1 = m(yi + 1, py);
  const a = hash2(x0, y0, s), b = hash2(x1, y0, s), c = hash2(x0, y1, s), d = hash2(x1, y1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

// ---------- ground textures (global coordinates keep screens seamless) ----------
// bare(gx, gv): optional test that keeps a flower off a spot (never on the waterline)
function grassColor(gx, gv, base, sh, bare) {
  let t = base;
  if (STYLE.tex.patch) {
    // soft sunlit patches only; darker grass appears as a sparse speckle, never as blotches
    const m = vnoise(gx / 40, gv / 34, 3);
    if (m > 0.72) t += (m > 0.8 || ((gx + gv) & 1)) ? 1 : 0;
    else if (m < 0.24 && ((gx + gv) & 1) && bayer4(gx >> 1, gv >> 1) < 0.25) t -= 1;
  }
  // tufts: one small blade cluster per 8x8 cell (never crossing the cell)
  const cx = Math.floor(gx / 8), cy = Math.floor(gv / 8);
  if (hash2(cx, cy, 11) < STYLE.tex.tuft) {
    const ox = 1 + Math.floor(hash2(cx, cy, 12) * 2), oy = 2 + Math.floor(hash2(cx, cy, 13) * 3);
    const lx = gx - cx * 8 - ox, ly = gv - cy * 8 - oy;
    const TUFTS = [
      ["L...L", "DL.LD", ".D.D."],
      [".L.L.", "LD.DL", "D...D"],
      ["..L..", ".LDL.", ".D.D."],
    ];
    const st = TUFTS[Math.floor(hash2(cx, cy, 14) * 3)];
    if (ly >= 0 && ly < 3 && lx >= 0 && lx < 5) {
      const ch = st[ly][lx];
      if (ch === "L" && !sh) t += 1;
      else if (ch === "D") t -= 1;
    }
  }
  // flowers: rare, one per 16x16 cell at most
  const fx = Math.floor(gx / 16), fy = Math.floor(gv / 16);
  if (!sh && hash2(fx, fy, 21) < STYLE.tex.flower) {
    const px = fx * 16 + 3 + Math.floor(hash2(fx, fy, 22) * 10), py = fy * 16 + 3 + Math.floor(hash2(fx, fy, 23) * 10);
    const dx = gx - px, dy = gv - py;
    if (bare && Math.abs(dx) + Math.abs(dy) <= 2 && bare(px, py)) return pc("green", t);
    const kind = hash2(fx, fy, 24);
    if (dx === 0 && dy === 0) return kind < 0.5 ? pc("gold", 2) : pc("gold", 3);
    if (Math.abs(dx) + Math.abs(dy) === 1) return kind < 0.5 ? pc("white", 0) : (kind < 0.8 ? pc("red", 3) : pc("purple", 3));
    if (dx === 0 && dy === 2) return pc("green", base - 1);
  }
  if (sh) t -= 1;
  return pc("green", t);
}

function dirtColor(gx, gv, sh) {
  let t = 3;
  const cx = Math.floor(gx / 6), cy = Math.floor(gv / 6);
  if (hash2(cx, cy, 31) < STYLE.tex.pebble) {
    const px = cx * 6 + 1 + Math.floor(hash2(cx, cy, 32) * 3), py = cy * 6 + 1 + Math.floor(hash2(cx, cy, 33) * 3);
    if (gx === px && gv === py && !sh) return pc("earth", 4);
    if ((gx === px + 1 && gv === py) || (gx === px && gv === py + 1)) t = 2;
  }
  if (hash2(gx, gv, 34) < 0.05) t = 2;
  // darker patches as a loose random speckle (an ordered dither here reads as a grid)
  if (STYLE.tex.patch && vnoise(gx / 20, gv / 16, 35) > 0.7 && hash2(gx, gv, 36) < 0.3) t = 2;
  if (sh) t -= 1;
  return pc("earth", t);
}

// sand: earth3, earth4, sand0 (base), sand1
function sandColor(gx, gv, sh) {
  const R = ["earth", 3, "earth", 4, "sand", 0, "sand", 1];
  let t = 2;
  // wind ripples: curved, unevenly spaced, broken into dashes, turning with the dunes
  const w = gv + 9 * vnoise(gx / 24, gv / 24, 41) + gx * (vnoise(gx / 70, gv / 70, 44) - 0.5) * 0.6;
  const ph = w / (9 + 5 * vnoise(gx / 45, gv / 45, 45));
  const f = ph - Math.floor(ph);
  if (vnoise(gx / 7, gv / 7, 42) > 0.42) {
    if (f < 0.1) t = 1;
    else if (f < 0.2) t = 3;
  }
  if (hash2(gx >> 2, gv >> 2, 43) < 0.02 && (gx & 3) === 1 && (gv & 3) === 1) t = 0;
  if (sh) t -= 1;
  t = Math.max(0, Math.min(3, t));
  return pc(R[t * 2], R[t * 2 + 1]);
}

function rockyGroundColor(gx, gv, sh) {
  let t = 3;
  const cx = Math.floor(gx / 7), cy = Math.floor(gv / 7);
  if (hash2(cx, cy, 51) < 0.35) {
    const px = cx * 7 + 1 + Math.floor(hash2(cx, cy, 52) * 3), py = cy * 7 + 1 + Math.floor(hash2(cx, cy, 53) * 3);
    const dx = gx - px, dy = gv - py;
    if (dx >= 0 && dx < 3 && dy >= 0 && dy < 2) t = (dx === 0 && dy === 0) ? 4 : (dy === 1 ? 1 : 3);
  }
  if (hash2(gx, gv, 54) < 0.06) t = 2;
  if (sh) t -= 1;
  return pc("earth", Math.max(0, t));
}

// Graveyard: short, dry, low-contrast grass (calm, so the stones read).
function deadGrassColor(gx, gv, sh) {
  let t = 2;
  if (vnoise(gx / 30, gv / 24, 61) > 0.7 && ((gx + gv) & 1) && hash2(gx, gv, 64) < 0.5) t = 1;
  const cx = Math.floor(gx / 8), cy = Math.floor(gv / 8);
  if (hash2(cx, cy, 63) < 0.3) {
    const lx = gx - cx * 8 - 2, ly = gv - cy * 8 - 3;
    if (ly === 0 && (lx === 0 || lx === 2)) t = sh ? 2 : 3;
    else if (ly === 1 && lx === 1) t = 1;
  }
  if (sh) t -= 1;
  return pc("green", t);
}

// ---------- the renderer ----------
// desc = {
//   kind: "ow" | "dun",
//   ox, ov:          global ground-pixel origin of this screen (texture continuity)
//   tileAt(tx, ty):  tile id, for tx in -2..17, ty in -2..12 (neighbour screens around)
//   groundMat(tx,ty) TM.* ground material for overworld tiles
//   pathAt(tx, ty):  true when a decorative dirt path crosses the tile
//   wallH(tx, ty):   dungeon wall height (dun only)
//   theme:           dungeon ramp name (dun only)
//   shadows: [{x, v, rx, rv}] static prop shadow ellipses (screen/ground px)
// }
// returns { base, shade, strips: [{row, x, y, canvas}], waterMask }
function renderTerrain(desc) {
  const W = TER.W, H = TER.H, M = TER.M;
  const XW = W + 2 * M, VH = H + 2 * M, X0 = -M, V0 = -M;
  const N = XW * VH;
  const kind = desc.kind || "ow";
  const TW = XW / TT, TH = VH / TT, TX0 = X0 / TT, TY0 = V0 / TT;

  // --- tile classes ---
  const tid = new Int16Array(TW * TH), tcl = new Uint8Array(TW * TH);
  for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) tid[ty * TW + tx] = desc.tileAt(tx + TX0, ty + TY0);
  const tAt = (tx, ty) => tid[Math.max(0, Math.min(TH - 1, ty - TY0)) * TW + Math.max(0, Math.min(TW - 1, tx - TX0))];
  // a sealed gate is a cave mouth with a slab in it (the slab is a prop)
  const mouth = (id) => id === T_CAVE || id === T_GATE;
  const rockish = (id) => id === T_ROCK || id === T_CRACK || mouth(id);
  // the keep's gate is a wide building set into the cliff: the face stays straight on the
  // tile edge for a few tiles either side, so no ragged scrap of cliff pokes out in front
  const nearGate = (tx, ty) => { for (let dx = -3; dx <= 3; dx++) if (tAt(tx + dx, ty) === T_GATE) return true; return false; };
  for (let ty = 0; ty < TH; ty++) {
    for (let tx = 0; tx < TW; tx++) {
      const id = tid[ty * TW + tx], gx = tx + TX0, gy = ty + TY0;
      let c = TCLS.GROUND;
      if (kind === "dun") {
        c = id === T_DWALL ? TCLS.WALL : id === T_DWATER ? TCLS.MOAT : id === T_DPIT ? TCLS.PIT : id === T_DLAVA ? TCLS.LAVA : TCLS.FLOOR;
      } else if (id === T_CRACK || mouth(id)) c = TCLS.CLIFF;
      else if (id === T_ROCK) {
        c = (rockish(tAt(gx - 1, gy)) || rockish(tAt(gx + 1, gy)) || rockish(tAt(gx, gy - 1)) || rockish(tAt(gx, gy + 1))) ? TCLS.CLIFF : TCLS.GROUND;
      } else if (id === T_WATER) c = TCLS.WATER;
      else if (id === T_DOCK || id === T_BRIDGE) c = TCLS.PLANK;
      tcl[ty * TW + tx] = c;
    }
  }
  const clsAt = (tx, ty) => tcl[Math.max(0, Math.min(TH - 1, ty - TY0)) * TW + Math.max(0, Math.min(TW - 1, tx - TX0))];
  // Bridge and dock decks, per tile: which way it is crossed, which edges face open water
  // (they carry a beam), and whether its front (south) edge ends there (a pile).
  const plankMemo = new Map();
  const plankOf = (tx, ty) => {
    const key = tx * 4096 + ty;
    let pk = plankMemo.get(key);
    if (pk) return pk;
    const isP = (t) => t === T_BRIDGE || t === T_DOCK, isW = (t) => t === T_WATER;
    const at = (dx, dy) => desc.tileAt(tx + dx, ty + dy);
    const n = at(0, -1), s2 = at(0, 1), w = at(-1, 0), e = at(1, 0);
    const hx = (isW(e) ? 0 : 1) + (isW(w) ? 0 : 1), hy = (isW(n) ? 0 : 1) + (isW(s2) ? 0 : 1);
    // (a bend runs on the way its planks continue; a dock runs out from its bank)
    const run = hx === hy ? (isP(e) || isP(w) ? "x" : "y") : hx > hy ? "x" : "y";
    const front = (dx) => isP(at(dx, 0)) && isW(at(dx, 1));
    pk = { run, eN: isW(n), eS: isW(s2), eW: isW(w), eE: isW(e), pw: isW(s2) && !front(-1), pe: isW(s2) && !front(1) };
    plankMemo.set(key, pk);
    return pk;
  };

  // --- per-pixel masks (tile flags looked up once per tile) ---
  const tPath = new Uint8Array(TW * TH);
  if (desc.pathAt) for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
    if (tcl[ty * TW + tx] === TCLS.GROUND && desc.pathAt(tx + TX0, ty + TY0)) tPath[ty * TW + tx] = 1;
  }
  const cliffM = new Uint8Array(N), waterM = new Uint8Array(N), pathM = new Uint8Array(N), treeM = new Uint8Array(N);
  // Shores: a water tile whose corner juts into open land (both sides and the diagonal
  // are land) has that corner filled in along a diagonal, so a shore that steps from tile
  // to tile runs as a slope instead of a staircase. Land is only nibbled a little at its
  // own corners (a hero may stand anywhere on a land tile, and must never look as if he
  // stood in the water), and not at all on a tongue of land or beside a bridge or dock.
  const SHORE_FILL = 16, SHORE_NIB = 7;
  const clT = (tx, ty) => tcl[Math.max(0, Math.min(TH - 1, ty)) * TW + Math.max(0, Math.min(TW - 1, tx))];
  const wetT = (tx, ty) => clT(tx, ty) === TCLS.WATER;
  const dryT = (tx, ty) => clT(tx, ty) === TCLS.GROUND;
  const cornerCut = new Int8Array(TW * TH * 4);            // per tile corner: +1 flood, -1 fill
  if (kind === "ow") for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
    const c = tcl[ty * TW + tx];
    if (c !== TCLS.WATER && c !== TCLS.GROUND) continue;
    if (c === TCLS.GROUND) {
      const n4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      if (n4.some(([dx, dy]) => clT(tx + dx, ty + dy) === TCLS.PLANK)) continue;
      if (n4.filter(([dx, dy]) => wetT(tx + dx, ty + dy)).length >= 3) continue;
    }
    const other = c === TCLS.WATER ? dryT : wetT;
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy], q) => {
      if (other(tx + dx, ty) && other(tx, ty + dy) && other(tx + dx, ty + dy)) cornerCut[(ty * TW + tx) * 4 + q] = c === TCLS.WATER ? -1 : 1;
    });
  }
  // A bridge or dock counts as water for the shoreline (so the bank runs on beneath it and
  // no grass creeps along its sides), except for its last few boards next to land, which
  // count as land: the land then runs out under the planks instead of stopping short.
  const PLANK_LAND = 12;
  const plankLand = (txi, tyi, lx, lv) => {
    const g = (dx, dy) => { const x = txi + dx, y = tyi + dy; return x >= 0 && y >= 0 && x < TW && y < TH && tcl[y * TW + x] === TCLS.GROUND; };
    return (lx < PLANK_LAND && g(-1, 0)) || (lx >= TT - PLANK_LAND && g(1, 0)) || (lv < PLANK_LAND && g(0, -1)) || (lv >= TT - PLANK_LAND && g(0, 1));
  };
  // Trails are traced through a gentle sideways sway (a smooth warp in world space, the
  // same on both sides of a screen edge), so a trail that runs straight along the tile
  // grid still wanders like a trodden path.
  const pathNear = (tx, ty) => { for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = tx + dx, y = ty + dy; if (x >= 0 && y >= 0 && x < TW && y < TH && tPath[y * TW + x]) return true; } return false; };
  // A trail beside a tree bends away from it (a smooth shift, not a narrowing): each trail
  // tile is pushed away from the trees next to it and the pushes are blurred together, so
  // the trail swings clear of the trunks and back again.
  let shX = null, shV = null;
  if (kind === "ow") {
    const RS = 11, px = new Int16Array(N), pv = new Int16Array(N);
    let any = false;
    const tsx = new Int8Array(TW * TH), tsv = new Int8Array(TW * TH), own = new Uint8Array(TW * TH);
    for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
      if (!tPath[ty * TW + tx]) continue;
      let ax = 0, av = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = tx + dx, y = ty + dy;
        if (x >= 0 && y >= 0 && x < TW && y < TH && tid[y * TW + x] === T_TREE) { ax -= dx; av -= dy; }
      }
      if (!ax && !av) continue;
      ax = Math.sign(ax); av = Math.sign(av); any = true;
      const k = ty * TW + tx;
      tsx[k] = ax * RS; tsv[k] = av * RS; own[k] = 1;
      // the tile the trail is pushed into moves with it, or the far edge would stay put
      const x = tx + ax, y = ty + av, k2 = y * TW + x;
      if (x >= 0 && y >= 0 && x < TW && y < TH && !own[k2] && tid[k2] !== T_TREE) { tsx[k2] = ax * RS; tsv[k2] = av * RS; }
    }
    if (any) {
      for (let v = V0; v < V0 + VH; v++) {
        const row = (Math.floor(v / TT) - TY0) * TW - TX0, o = (v - V0) * XW - X0;
        for (let x = X0; x < X0 + XW; x++) { const t = row + Math.floor(x / TT); px[o + x] = tsx[t]; pv[o + x] = tsv[t]; }
      }
      shX = boxBlur(px, XW, VH, 14); shV = boxBlur(pv, XW, VH, 14);
    }
  }
  // (each big pass over the pixels runs in a function of its own: the browser never fully
  // optimises one function as long as this whole renderer, which then ran several times slower)
  (() => {
    for (let v = V0; v < V0 + VH; v++) {
      const tyi = Math.floor(v / TT) - TY0;
      for (let x = X0; x < X0 + XW; x++) {
        const txi = Math.floor(x / TT) - TX0;
        const k = tyi * TW + txi;
        const c = tcl[k], i = (v - V0) * XW + (x - X0);
        const lx = x - (txi + TX0) * TT, lv = v - (tyi + TY0) * TT;
        if (c === TCLS.CLIFF) cliffM[i] = 1;
        else if (c === TCLS.WATER) waterM[i] = 1;
        else if (kind === "ow" && c === TCLS.PLANK && !plankLand(txi, tyi, lx, lv)) waterM[i] = 1;
        if (kind === "ow" && (c === TCLS.WATER || c === TCLS.GROUND)) {
          const q = (lx < 16 ? 0 : 1) + (lv < 16 ? 0 : 2);
          const cut = cornerCut[k * 4 + q];
          if (cut && (q & 1 ? TT - 1 - lx : lx) + (q & 2 ? TT - 1 - lv : lv) < (cut > 0 ? SHORE_NIB : SHORE_FILL)) waterM[i] = cut > 0 ? 1 : 0;
        }
        // a tree's tile never carries the road (the sway used to lay it through trunks)
        const tree = kind === "ow" && tid[k] === T_TREE;
        if (tree) treeM[i] = 1;
        else if (kind === "ow" && pathNear(txi, tyi)) {
          const gx = desc.ox + x, gv = desc.ov + v;
          // (dx, dv: how far the trail is carried here; beside a tree the sway may carry it
          // further away from the tree but never back toward it)
          let dx = -(vnoise(gx / 48, gv / 48, 44) - 0.5) * 30, dv = -(vnoise(gx / 48 + 31, gv / 48, 45) - 0.5) * 30;
          if (shX) {
            const ax = shX[i], av = shV[i];
            if (dx * ax < 0) dx *= Math.max(0, 1 - Math.abs(ax) / 6);
            if (dv * av < 0) dv *= Math.max(0, 1 - Math.abs(av) / 6);
            dx += ax; dv += av;
          }
          const sx = x - Math.round(dx), sv = v - Math.round(dv);
          const wx = Math.max(0, Math.min(TW - 1, Math.floor(sx / TT) - TX0)), wy = Math.max(0, Math.min(TH - 1, Math.floor(sv / TT) - TY0));
          if (tPath[wy * TW + wx]) pathM[i] = 1;
        } else if (tPath[k]) pathM[i] = 1;
      }
    }
  })();
  const fC = boxBlur(cliffM, XW, VH, 9), fW = boxBlur(waterM, XW, VH, 10), fP = boxBlur(pathM, XW, VH, 7);
  const fT = kind === "ow" ? boxBlur(treeM, XW, VH, 9) : null;
  // (within ~24px of a tree, a trail's own edge is read through a small wobble, see below)
  const fTn = kind === "ow" && tPath.some(t => t) ? boxBlur(treeM, XW, VH, 24) : null;
  // Where each trunk actually stands (trees sit a few pixels off their tile, some low
  // enough to reach into the tile below): a trail keeps a clear ring of grass round it.
  // The trunks are found from the trees' own ground shadows, which sit at a fixed offset
  // from them.
  let fK = null;
  const trunks = [];
  if (kind === "ow" && typeof PROP_DEFS === "object") {
    const kinds = ["tree", "pine", "deadtree"].map(k => PROP_DEFS[k] && PROP_DEFS[k].shadow).filter(Boolean);
    const keep = new Uint8Array(N);
    let any = false;
    for (const s of desc.shadows || []) {
      const d = kinds.find(k => !s.rect && k[2] === s.rx && k[3] === s.rv);
      if (!d) continue;
      // (the ring reaches about 14px below the trunk's foot: its roots and outline end ~6px
      // down, so a clear strip of grass shows between trunk and trail)
      const tx0 = s.x - d[0], tv0 = s.v - d[1] + 1;
      trunks.push([tx0, tv0]);
      // (the ring's edge wobbles by a few pixels: a plain circle left a straight upright
      // edge where its side met the trail)
      for (let v = Math.floor(tv0 - 16); v <= tv0 + 16; v++) for (let x = Math.floor(tx0 - 18); x <= tx0 + 18; x++) {
        if (x < X0 || v < V0 || x >= X0 + XW || v >= V0 + VH) continue;
        const gx = desc.ox + x, gv = desc.ov + v;
        const wx = Math.round((vnoise(gx / 9, gv / 6, 52) - 0.5) * 10), wv = Math.round((vnoise(gx / 6 + 3, gv / 9, 53) - 0.5) * 6);
        if (((x + wx + 0.5 - tx0) / 13) ** 2 + ((v + wv + 0.5 - tv0) / 13) ** 2 <= 1) { keep[(v - V0) * XW + (x - X0)] = 1; any = true; }
      }
    }
    if (any) fK = boxBlur(keep, XW, VH, 3);
  }
  // Long straight shores wander. Where a shore runs straight along the tile grid for three
  // tiles or more, beside open water at least two tiles deep, its edge follows a slow wave
  // (about 60px long) and a small one (about 20px) in place of the usual fine raggedness:
  // mostly the land swells out into the water (up to ~9px), here and there the water bites
  // a few pixels into a land tile. The wave fades out over the last 30px or so of each
  // stretch, so corners, bridges and docks meet the shore exactly as before; a pond or a
  // small lake keeps its own shape. (runO: the edge's place in px out from the tile edge,
  // runF: how much of it applies; both only within 12px of such a shore)
  let runO = null, runF = null;
  (() => {
    if (kind === "ow") {
      // tile classes on a band a few tiles wider than the region, read from the world itself
      // (not clamped at the region's edge), so both screens at a seam find the same stretches
      const E = 3, RX0 = TX0 - E, RY0 = TY0 - E, RW = TW + 2 * E, RH = TH + 2 * E;
      const cl = new Uint8Array(RW * RH);                   // 1 water, 2 open ground, 3 planks
      for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
        const gx = x + RX0, gy = y + RY0, id = desc.tileAt(gx, gy);
        cl[y * RW + x] = id === T_WATER ? 1 : (id === T_DOCK || id === T_BRIDGE) ? 3
          : (id === T_CRACK || mouth(id) || (id === T_ROCK && (rockish(desc.tileAt(gx - 1, gy)) || rockish(desc.tileAt(gx + 1, gy)) || rockish(desc.tileAt(gx, gy - 1)) || rockish(desc.tileAt(gx, gy + 1))))) ? 0 : 2;
      }
      const clB = (x, y) => (x < 0 || y < 0 || x >= RW || y >= RH) ? 0 : cl[y * RW + x];
      const plank9 = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (clB(x + dx, y + dy) === 3) return true; return false; };
      // a pond or small lake: a body of water (with its bridges) of 24 tiles or fewer, found
      // within one screen of this one
      const smallW = new Map();
      const isSmall = (gx, gy) => {
        const key = (x, y) => (x + 64) * 256 + y + 64;
        const k0 = key(gx, gy);
        if (smallW.has(k0)) return smallW.get(k0);
        const set = new Set([k0]), stack = [gx, gy];
        let big = false;
        while (stack.length && !big) {
          const y = stack.pop(), x = stack.pop();
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = x + dx, ny = y + dy;
            if (nx < -W / TT || ny < -H / TT || nx >= 2 * W / TT || ny >= 2 * H / TT) { big = true; break; }
            const nk = key(nx, ny);
            if (set.has(nk)) continue;
            const id = desc.tileAt(nx, ny);
            if (id !== T_WATER && id !== T_DOCK && id !== T_BRIDGE) continue;
            set.add(nk); stack.push(nx, ny);
            if (set.size > 24) { big = true; break; }
          }
        }
        for (const k of set) smallW.set(k, !big);
        return !big;
      };
      // every eligible shore edge, grouped by the grid line it lies on
      const lines = new Map();
      for (let y = 0; y < RH; y++) for (let x = 0; x < RW; x++) {
        if (cl[y * RW + x] !== 1) continue;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (clB(x + dx, y + dy) !== 2 || clB(x - dx, y - dy) !== 1) continue;
          if (plank9(x, y) || plank9(x + dx, y + dy) || isSmall(x + RX0, y + RY0)) continue;
          // (vertical line at the tile edge x + (dx > 0); horizontal at y + (dy > 0))
          const vert = dx !== 0, ln = vert ? x + (dx > 0 ? 1 : 0) : y + (dy > 0 ? 1 : 0);
          const k = (vert ? 1 : 0) + "," + ln + "," + (dx + dy);
          if (!lines.has(k)) lines.set(k, []);
          lines.get(k).push(vert ? y : x);
        }
      }
      for (const [k, list] of lines) {
        const [vert, ln, sg] = k.split(",").map(Number);
        list.sort((a, b) => a - b);
        for (let n = 0; n < list.length;) {
          let m = n;
          while (m + 1 < list.length && list[m + 1] === list[m] + 1) m++;
          const t0 = list[n], t1 = list[m], lim = vert ? RH - 1 : RW - 1;
          const open0 = t0 === 0, open1 = t1 === lim;
          n = m + 1;
          if (t1 - t0 + 1 < 3 && !open0 && !open1) continue;
          // in region pixels: the line, and the stretch along it
          const L = ((vert ? RX0 : RY0) + ln) * TT, s0 = ((vert ? RY0 : RX0) + t0) * TT, s1 = ((vert ? RY0 : RX0) + t1 + 1) * TT;
          const gL = (vert ? desc.ox : desc.ov) / TT + (vert ? RX0 : RY0) + ln;
          const h = (q) => hash2(gL * 2 + (vert ? 1 : 0), sg, 230 + q);
          const P1 = 56 + 20 * h(0), P2 = 30 + 10 * h(1), P3 = 16 + 6 * h(2);
          const f1 = h(3) * 6.283, f2 = h(4) * 6.283, f3 = h(5) * 6.283;
          const sOrg = vert ? desc.ov : desc.ox;
          const fade = (t) => { const q = Math.max(0, Math.min(1, (t - 8) / 24)); return q * q * (3 - 2 * q); };
          const lo = vert ? V0 : X0, hi = vert ? V0 + VH : X0 + XW;
          for (let s = Math.max(lo, s0); s < Math.min(hi, s1); s++) {
            const f = (open0 ? 1 : fade(s + 0.5 - s0)) * (open1 ? 1 : fade(s1 - s - 0.5));
            if (f <= 0) continue;
            const gs = sOrg + s + 0.5;
            const e = 3 + 3.2 * Math.sin(gs * 6.283 / P1 + f1) + 1.6 * Math.sin(gs * 6.283 / P2 + f2) + 0.9 * Math.sin(gs * 6.283 / P3 + f3);
            for (let p = -12; p < 12; p++) {
              const x = vert ? L + p : s, v = vert ? s : L + p;
              if (x < X0 || v < V0 || x >= X0 + XW || v >= V0 + VH) continue;
              const i = (v - V0) * XW + (x - X0);
              if (!runF) { runF = new Float32Array(N); runO = new Float32Array(N); }
              if (f > runF[i]) { runF[i] = f; runO[i] = e; }
            }
          }
        }
      }
    }
  })();
  // (beyond the edge of the world the rock keeps the style of the rim it continues: read
  // there, the world's own fallback made a smooth band along the bottom of the rim)
  let rockStyle = desc.rockStyleAt || (() => "P");
  if (desc.rockStyleAt && typeof WW === "number" && typeof WH === "number") {
    const wx0 = -Math.round(desc.ox / W) * (W / TT), wy0 = -Math.round(desc.ov / H) * (H / TT);
    rockStyle = (tx, ty) => desc.rockStyleAt(Math.max(wx0, Math.min(wx0 + WW - 1, tx)), Math.max(wy0, Math.min(wy0 + WH - 1, ty)));
  }
  // The rugged highland (rock marked in lower case: the world's rim and the great ridge)
  // as one smooth region with a clean, wandering edge, so a plate is either all rubble or
  // all bare rock, never a patchwork of both along the tile grid.
  let fR = null;
  const rugU = new Int8Array(TW * TH);
  if (kind === "ow" && desc.rockStyleAt) {
    const tr = new Uint8Array(TW * TH);
    let any = false;
    // Small bays of bare rock inside the rubble are closed (a rock tile with rubble on two
    // sides joins it, three times over), so the field has no bare holes while broad plates
    // stay bare. Worked on a band 3 tiles wider than the region, so both screens at a seam
    // reach the same answer.
    const E = 3, BW = TW + 2 * E, BH = TH + 2 * E;
    const big = new Uint8Array(BW * BH), rock = new Uint8Array(BW * BH);
    for (let by = 0; by < BH; by++) for (let bx = 0; bx < BW; bx++) {
      const gtx = bx - E + TX0, gty = by - E + TY0, k = by * BW + bx;
      const s = rockStyle(gtx, gty);
      if (s && s !== s.toUpperCase()) { big[k] = 1; any = true; }
      if (rockish(desc.tileAt(gtx, gty))) rock[k] = 1;
    }
    for (let pass = 0; any && pass < 3; pass++) {
      const add = [];
      for (let by = 1; by < BH - 1; by++) for (let bx = 1; bx < BW - 1; bx++) {
        const k = by * BW + bx;
        if (big[k] || !rock[k]) continue;
        if (big[k - 1] + big[k + 1] + big[k - BW] + big[k + BW] >= 2) add.push(k);
      }
      for (const k of add) big[k] = 1;
    }
    for (let ty = 0; ty < TH; ty++) for (let tx = 0; tx < TW; tx++) {
      tr[ty * TW + tx] = big[(ty + E) * BW + tx + E];
      // (a tile whose whole 5x5 neighbourhood agrees needs no per-pixel test: the warped
      // read never reaches further than two tiles)
      let s = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) s += big[(ty + E + dy) * BW + tx + E + dx];
      rugU[ty * TW + tx] = s === 0 ? 0 : s === 25 ? 1 : -1;
    }
    if (any) {
      const rugM = new Uint8Array(N);
      for (let v = V0; v < V0 + VH; v++) {
        const row = (Math.floor(v / TT) - TY0) * TW - TX0, o = (v - V0) * XW - X0;
        for (let x = X0; x < X0 + XW; x++) rugM[o + x] = tr[row + Math.floor(x / TT)];
      }
      fR = boxBlur(rugM, XW, VH, 8);
    }
  }

  const hgt = new Int16Array(N);
  const topM = new Uint8Array(N), faceM = new Uint8Array(N);
  // (the first floor row under a dungeon room's north trim band)
  const DUN_TRIM_V = typeof ROOM === "object" ? ROOM.Y0 + ROOM.TRIM : 76;
  // Rubble or bare, per pixel of rock top. The field is read through a slow warp of up
  // to most of a tile (plus a finer one), so the edge between rubble and bare rock
  // wanders across the tile grid instead of running straight along it.
  const rugP = fR ? new Uint8Array(N) : null;
  const rugAt = (x, v, gx, gv) => {
    const u = rugU[(Math.floor(v / TT) - TY0) * TW + Math.floor(x / TT) - TX0];
    if (u >= 0) return u === 1;
    const wx = Math.round((vnoise(gx / 30, gv / 30, 46) - 0.5) * 44 + (vnoise(gx / 11, gv / 11, 49) - 0.5) * 12);
    const wv = Math.round((vnoise(gx / 30 + 17, gv / 30, 47) - 0.5) * 44 + (vnoise(gx / 11 + 5, gv / 11, 50) - 0.5) * 12);
    const xx = Math.max(X0, Math.min(X0 + XW - 1, x + wx)), vv = Math.max(V0, Math.min(V0 + VH - 1, v + wv));
    return fR[(vv - V0) * XW + (xx - X0)] > 0.5 + (vnoise(gx / 7, gv / 7, 39) - 0.5) * 0.16;
  };
  // A cracked wall, and the mouth later blown in it, keep the cliff's ragged line like the
  // rock either side (a straight one stood out as a box); the crack and the hole are drawn
  // square to the screen over it (see the faces below), so the line never splits them, and
  // the line stays put when the wall is blown open.
  const crackMemo = new Map();
  const crackish = (tx, ty) => {
    if (kind !== "ow") return false;
    const key = tx * 4096 + ty;
    let r = crackMemo.get(key);
    if (r === undefined) {
      const id = tAt(tx, ty);
      r = id === T_CRACK || (id === T_CAVE && secretKindAt(Math.round(desc.ox / TT) + tx, Math.round(desc.ov / TT) + ty) === "bomb");
      crackMemo.set(key, r);
    }
    return r;
  };
  // gUni(tx, ty): the ground material all round tile (tx, ty), read 20 px beyond its
  // edges at nine points, or -1 where that ground changes (see the ground's wander below)
  const gUniM = new Map();
  const gUni = (tx, ty) => {
    const k = tx * 4096 + ty;
    let u = gUniM.get(k);
    if (u === undefined) {
      u = desc.groundMatAt(tx * TT + 16, ty * TT + 16);
      for (const dy of [-20, 16, 52]) for (const dx of [-20, 16, 52]) if (desc.groundMatAt(tx * TT + dx, ty * TT + dy) !== u) { u = -1; break; }
      gUniM.set(k, u);
    }
    return u;
  };
  (() => {
    for (let v = V0; v < V0 + VH; v++) {
      const ty = Math.floor(v / TT);
      for (let x = X0; x < X0 + XW; x++) {
        const tx = Math.floor(x / TT), i = (v - V0) * XW + (x - X0);
        const gx = desc.ox + x, gv = desc.ov + v;
        let c = clsAt(tx, ty);
        const id = tAt(tx, ty);
        if (kind === "dun") {
          // (a pool or pit against the north wall starts below the trim band that borders the
          // floor: begun under the trim, its inner wall was hidden there and it read as a flat
          // black or blue sticker, where every other pool shows its full inner wall)
          if ((c === TCLS.MOAT || c === TCLS.PIT || c === TCLS.LAVA) && v < DUN_TRIM_V) c = TCLS.FLOOR;
          if (c === TCLS.WALL) { hgt[i] = desc.wallH(tx, ty); topM[i] = TM.WTOP; faceM[i] = TM.WFACE; }
          else if (c === TCLS.MOAT) { hgt[i] = TER.MOAT; topM[i] = TM.WATER; faceM[i] = TM.MOATF; }
          else if (c === TCLS.PIT) { hgt[i] = TER.HMIN; topM[i] = TM.PITB; faceM[i] = TM.MOATF; }
          else if (c === TCLS.LAVA) { hgt[i] = TER.MOAT; topM[i] = TM.LAVA; faceM[i] = TM.MOATF; }
          else {
            hgt[i] = 0;
            const inRing = tx < 2 || tx > 13 || ty < 2 || ty > 8;
            topM[i] = inRing ? TM.DOORWAY : id === T_DICE ? TM.ICE : id === T_DSWITCH ? TM.SWITCH : TM.FLOOR; faceM[i] = TM.MOATF;
          }
          continue;
        }
        // ragged edges: the noise only matters near a boundary, so skip it elsewhere
        // (two scales of raggedness, so a rock mass a few tiles across isn't a rounded box)
        const fc = fC[i];
        let cliff = fc >= 0.8 ? true : fc <= 0.2 ? false : fc > 0.5 + (vnoise(gx / 11, gv / 11, 31) - 0.5) * 0.5 + (vnoise(gx / 4, gv / 4, 32) - 0.5) * 0.25;
        // cave mouths need a straight face exactly on the tile edge
        // (so does a cracked wall: the crack keeps its shape, and the cliff keeps its line
        // when the wall is blown open into a mouth)
        if (mouth(id) && !crackish(tx, ty)) cliff = true;
        else if (c !== TCLS.CLIFF && !crackish(tx, ty - 1) && (mouth(tAt(tx, ty - 1)) || nearGate(tx, ty - 1))) cliff = false;
        if (cliff && c === TCLS.PLANK) cliff = false;
        // a deck's front edge over open water stands DECK_EXT px out into the water tile south
        // of it (a hero on the deck's last row has boards under his boots; lanes don't change)
        const deckLip = kind === "ow" && c === TCLS.WATER && v - ty * TT < DECK_EXT && clsAt(tx, ty - 1) === TCLS.PLANK;
        if (deckLip) cliff = false;
        // (fw rises by 1/21 per pixel across a straight shore, so a threshold of 0.5 + e/21
        // puts the edge about e pixels out into the water; on a long straight shore the
        // threshold follows its wave, see runO)
        const fw = fW[i];
        let water = false;
        if (!cliff && c !== TCLS.PLANK && !deckLip) {
          if (fw >= 0.95) water = true;
          else if (fw > 0.05) {
            const fine = vnoise(gx / 10, gv / 10, 37) - 0.5;
            let thr = 0.62 + fine * 0.16 + (vnoise(gx / 26, gv / 26, 38) - 0.5) * 0.5;
            if (runF && runF[i] > 0) thr += runF[i] * (0.5 + runO[i] / 21 + fine * 0.08 - thr);
            water = fw > thr;
          }
        }
        // the land a bridge or dock rests on is never cut back from under its end
        if (water && c === TCLS.GROUND) {
          const lx = x - tx * TT, lv = v - ty * TT, P = TCLS.PLANK, G6 = 6;
          if ((lx < G6 && clsAt(tx - 1, ty) === P) || (lx >= TT - G6 && clsAt(tx + 1, ty) === P) || (lv < G6 && clsAt(tx, ty - 1) === P) || (lv >= TT - G6 && clsAt(tx, ty + 1) === P)) water = false;
        }
        if (cliff) { hgt[i] = TER.CLIFF; topM[i] = TM.CTOP; faceM[i] = TM.CFACE; if (rugP && rugAt(x, v, gx, gv)) rugP[i] = 1; }
        else if (water) { hgt[i] = TER.WATER; topM[i] = TM.WATER; faceM[i] = TM.BANK; }
        else if (c === TCLS.PLANK || deckLip) { hgt[i] = DECK_H; topM[i] = TM.PLANK; faceM[i] = TM.PLANKF; }
        else {
          hgt[i] = 0;
          // roads keep a little clear of every tree tile (a trunk stands low in its tile, or a
          // little below it, so the clearance reaches further south); the bend itself comes
          // from the shift above, and the clearance is read through a small wobble so its
          // edge never runs straight along the tile
          // (a finer second wobble, both ways: with the slow one alone, a clearance edge down
          // the side of a tree tile could still run straight for a whole tile; all of it is
          // read only near a trail, as elsewhere it is grass whatever the trees do)
          let fp = fP[i];
          // (beside a tree the clearance makes the trail's edge fall off steeply, so the fine
          // raggedness of its edge no longer shows: there the edge itself wanders by a few
          // pixels, fading out away from the trees)
          if (fTn && fp > 0.02 && fp < 0.98) {
            const amp = Math.min(1, fTn[i] * 6);
            if (amp > 0) {
              // (a slow wander and a finer one: with the slow one alone the edge could still
              // run straight down a whole tree's side)
              const jx = Math.round(((vnoise(gx / 10, gv / 7, 54) - 0.5) * 14 + (vnoise(gx / 4, gv / 4, 56) - 0.5) * 6) * amp);
              const jv = Math.round(((vnoise(gx / 7 + 20, gv / 10, 55) - 0.5) * 10 + (vnoise(gx / 4 + 40, gv / 4, 57) - 0.5) * 5) * amp);
              if (jx || jv) fp = fP[(Math.max(V0, Math.min(V0 + VH - 1, v + jv)) - V0) * XW + Math.max(X0, Math.min(X0 + XW - 1, x + jx)) - X0];
            }
          }
          if (fp > 0.25) {
            let tg = 0;
            if (fT) {
              const wx = (vnoise(gx / 12, gv / 12, 48) - 0.5) * 16 + (vnoise(gx / 5, gv / 5, 47) - 0.5) * 10;
              const wv = (vnoise(gx / 5 + 9, gv / 5, 46) - 0.5) * 7;
              const xx = Math.max(X0, Math.min(X0 + XW - 1, x + Math.round(wx))), vv = Math.max(V0, Math.min(V0 + VH - 1, v - 3 + Math.round(wv)));
              tg = fT[(vv - V0) * XW + (xx - X0)];
            }
            fp -= tg * 1.6 + (fK ? fK[i] * 2.5 : 0);
          }
          const path = fp >= 0.75 ? true : fp <= 0.25 ? false : fp > 0.5 + (vnoise(gx / 6, gv / 6, 43) - 0.5) * 0.5;
          // (the ground's own edges, one land's ground giving way to the next, are read through
          // a fine wander of a few pixels as well: the slow one alone left a rocky patch by a
          // cliff ending in a ruled line down a whole tile)
          // (a tile whose ground is the same all round, a little beyond the reach of both
          // wanders, needs no wander: see gUni)
          let gm;
          if (path) gm = TM.DIRT;
          else if (desc.groundMatAt) {
            const u = gUni(tx, ty);
            if (u >= 0) gm = u;
            else {
              const jx = Math.round((vnoise(gx / 6, gv / 6, 58) - 0.5) * 10), jv = Math.round((vnoise(gx / 6 + 30, gv / 6, 59) - 0.5) * 8);
              gm = desc.groundMatAt(x + jx, v + jv);
            }
          } else gm = desc.groundMat ? desc.groundMat(tx, ty) : TM.GRASS;
          topM[i] = gm;
          faceM[i] = TM.BANK;
        }
      }
    }
  })();
  // A rock mass whose back (north side) meets open ground is sloped there at the camera's
  // own angle, so that slope is seen edge-on and the top starts on screen right where the
  // rock's tiles start: the top no longer covers the ground behind it, where the hero (or
  // a cactus) stands and looked as if it stood on the rock. A shallow mass keeps a steeper
  // back so that some of its top still shows (every column of a mass takes the slope of
  // its deepest neighbours, so no single column pokes up out of line). In the desert, a
  // smooth mesa standing on the rubble of the rim ends in its own striped face: the rubble
  // behind it starts low and slopes up the same way, so the two heights never run into
  // one flat plate.
  // (topFrom: where the visible top of a sloped column begins, + 1000; 0 = not sloped)
  const topFrom = kind === "ow" ? new Int16Array(N) : null;
  // (shoulderM: the lowered shoulders, whose tops are only TOPMIN deep)
  const shoulderM = kind === "ow" ? new Uint8Array(N) : null;
  (() => {
    if (kind === "ow") {
      const DEEP = 1 << 12, MESA = TER.CLIFF + 16, CUTW = 8, TOPMIN = 6;
      const sandAt = (x, v) => rockStyle(Math.floor(x / TT), Math.floor(v / TT)).toUpperCase() === "D";
      const runD = new Int16Array(N), segs = [], runs = [];
      const cutM = rugP ? new Uint8Array(N) : null;
      for (let x = X0; x < X0 + XW; x++) {
        for (let v = V0; v < V0 + VH;) {
          if (topM[(v - V0) * XW + (x - X0)] !== TM.CTOP) { v++; continue; }
          const a = v;
          // (a speck of rock split off the back edge by the ragged noise joins the mass: on
          // its own it would stand up as a one-pixel spike)
          for (;;) {
            while (v < V0 + VH && topM[(v - V0) * XW + (x - X0)] === TM.CTOP) v++;
            let g = v;
            while (g < V0 + VH && g < v + 6 && topM[(g - V0) * XW + (x - X0)] !== TM.CTOP) g++;
            if (g < V0 + VH && g < v + 6 && v - a < 8) v = g; else break;
          }
          const b = v;
          // every place in the run where a mesa gives way to rubble
          const cuts = [];
          if (rugP) for (let u = a + MESA; u < b; u++) {
            const k = (u - V0) * XW + (x - X0);
            if (rugP[k] && !rugP[k - XW] && u - (cuts.length ? cuts[cuts.length - 1] : a) >= MESA && sandAt(x, u - 1) && sandAt(x, u)) { cuts.push(u); cutM[k] = 1; }
          }
          runs.push([x, a, b, cuts]);
        }
      }
      const byCol = Array.from({ length: XW }, () => []);
      for (const r of runs) byCol[r[0] - X0].push(r);
      const toGround = (x, u) => {
        const k = (u - V0) * XW + (x - X0);
        if (topM[k] !== TM.CTOP) return;
        hgt[k] = 0; topM[k] = desc.groundMatAt ? desc.groundMatAt(x, u) : TM.GRASS; faceM[k] = TM.BANK;
        if (rugP) rugP[k] = 0;
        if (cutM) cutM[k] = 0;
      };
      // A tree standing right behind a rock keeps a strip of ground under its trunk: the rock's
      // back (sloped out of sight) is cut back there in one broad, gentle dip, so its top
      // starts a few pixels below the trunk's foot instead of touching it (the tree looked as
      // if it grew on the rock). About 7px of ground shows under the roots, which end ~6px
      // below the foot. A column left with only a sliver of rock goes altogether (a scrap of
      // it stood on the ground as a small peak of its own).
      {
        const NR = 24;
        for (const [fx, fv] of trunks) {
          if (clsAt(Math.floor(fx / TT), Math.floor((fv - 4) / TT)) === TCLS.CLIFF) continue;   // (a tree among rock)
          const cutAt = (x) => Math.round(fv - 3 + 16 * (0.5 + 0.5 * Math.cos(Math.PI * (x + 0.5 - fx) / NR)));
          // (only the back of a rock, never one the tree stands on or in front of)
          const hit = (r) => r[1] > V0 && r[1] >= fv - 8 && r[1] < cutAt(r[0]);
          // (and only where the rock's top comes up under the trunk itself)
          let under = false;
          for (let x = Math.round(fx - 7); x <= fx + 7 && !under; x++) if (x >= X0 && x < X0 + XW) under = byCol[x - X0].some(hit);
          if (!under) continue;
          for (let x = Math.ceil(fx - NR); x <= fx + NR; x++) {
            if (x < X0 || x >= X0 + XW) continue;
            const cv = cutAt(x);
            for (const r of byCol[x - X0]) {
              if (!hit(r)) continue;
              const end = r[2] - cv >= 6 ? cv : r[2];
              for (let u = r[1]; u < end; u++) toGround(x, u);
              for (const u of r[3]) if (u < end + 8 && cutM) cutM[(u - V0) * XW + (x - X0)] = 0;
              r[3] = r[3].filter(u => u >= end + 8);
              r[1] = end;
            }
          }
        }
        for (let n = runs.length - 1; n >= 0; n--) if (runs[n][1] >= runs[n][2]) runs.splice(n, 1);
        for (let x = 0; x < XW; x++) byCol[x] = byCol[x].filter(r => r[1] < r[2]);
      }
      // The back edge of a mass loses its spikes (a column or two starting well north of the
      // columns round it): with the back sloped away the top starts on screen right at that
      // edge, and a narrow top showed every spike as a dark sliver standing up. Each column's
      // back moves to at least the median of the seven columns round it; the rock cut off
      // there is hidden behind the top anyway.
      {
        const backAt = (xx, a, b) => {
          if (xx < X0 || xx >= X0 + XW) return Infinity;
          for (const r of byCol[xx - X0]) if (r[1] < b && r[2] > a) return r[1];
          return Infinity;
        };
        const moved = [];
        for (const r of runs) {
          const [x, a, b] = r;
          if (a <= V0) continue;
          const as = [-3, -2, -1, 0, 1, 2, 3].map(dx => dx ? backAt(x + dx, a, b) : a).sort((p, q) => p - q);
          const m = as[3];
          if (m > a + 1 && m < Infinity) moved.push([r, Math.min(m, b)]);
        }
        for (const [r, m] of moved) {
          const x = r[0];
          for (let u = r[1]; u < m; u++) {
            const k = (u - V0) * XW + (x - X0);
            if (topM[k] !== TM.CTOP) continue;
            hgt[k] = 0; topM[k] = desc.groundMatAt ? desc.groundMatAt(x, u) : TM.GRASS; faceM[k] = TM.BANK;
            if (rugP) rugP[k] = 0;
            if (cutM) cutM[k] = 0;
          }
          r[1] = m;
          // (a mesa face keeps its place: only a cut the new back has passed goes)
          for (const u of r[3]) if (u < m + 8 && cutM) cutM[(u - V0) * XW + (x - X0)] = 0;
          r[3] = r[3].filter(u => u >= m + 8);
        }
        for (let n = runs.length - 1; n >= 0; n--) if (runs[n][1] >= runs[n][2]) runs.splice(n, 1);
        for (let x = 0; x < XW; x++) byCol[x] = byCol[x].filter(r => r[1] < r[2]);
      }
      // A small lump of rock has a back edge that bulges, never one that dips: the ragged
      // edge could leave a dip of a few pixels between two higher corners, and with the back
      // sloped out of sight the top then read as a bucket with two ears. In the back of a
      // piece at most 48px across, a dip up to ~24px wide is filled (5px at most, and never
      // beyond the top of the rock's own tile, so no ground a hero stands on is covered).
      {
        const next = new Map(), prevUsed = new Set(), chains = [];
        for (let xi = 0; xi < XW; xi++) for (const r of byCol[xi]) {
          if (r[1] <= V0) continue;
          let q = null;
          if (xi > 0) for (const c of byCol[xi - 1]) if (c[1] > V0 && !prevUsed.has(c) && Math.abs(c[1] - r[1]) <= 3 && c[1] < r[2] && c[2] > r[1] && (!q || Math.abs(c[1] - r[1]) < Math.abs(q[1] - r[1]))) q = c;
          if (q) { prevUsed.add(q); const ch = next.get(q); ch.push(r); next.set(r, ch); }
          else { const ch = [r]; chains.push(ch); next.set(r, ch); }
        }
        const R = 12;
        for (const ch of chains) {
          const n = ch.length;
          if (n < 5 || n > 48) continue;
          const a = ch.map(r => r[1]);
          for (let j = 0; j < n; j++) {
            let mL = a[j], mR = a[j];
            for (let t = Math.max(0, j - R); t < j; t++) mL = Math.min(mL, a[t]);
            for (let t = j + 1; t <= Math.min(n - 1, j + R); t++) mR = Math.min(mR, a[t]);
            const r = ch[j], x = r[0], tx = Math.floor(x / TT), row = Math.floor(a[j] / TT);
            const lim = clsAt(tx, row) === TCLS.CLIFF ? row * TT : a[j];
            const t = Math.max(mL, mR, a[j] - 5, lim);
            if (t >= a[j]) continue;
            for (let u = t; u < a[j]; u++) {
              const k = (u - V0) * XW + (x - X0);
              hgt[k] = TER.CLIFF; topM[k] = TM.CTOP; faceM[k] = TM.CFACE;
              if (rugP) rugP[k] = rugAt(x, u, desc.ox + x, desc.ov + u) ? 1 : 0;
            }
            r[1] = t;
          }
        }
      }
      // A scrap of rock standing on its own (under 48 pixels of it: a leftover of the ragged
      // edge, or of a trunk's dip) goes back to ground: it stood there as a small peak.
      {
        const seen = new Set();
        for (let xi = 0; xi < XW; xi++) for (const r0 of byCol[xi]) {
          if (seen.has(r0)) continue;
          const comp = [r0], stack = [r0];
          seen.add(r0);
          let area = 0, edge = false;
          while (stack.length) {
            const r = stack.pop();
            area += r[2] - r[1];
            if (r[1] <= V0 || r[2] >= V0 + VH || r[0] <= X0 || r[0] >= X0 + XW - 1) edge = true;
            for (const dx of [-1, 1]) {
              const xx = r[0] + dx - X0;
              if (xx < 0 || xx >= XW) continue;
              for (const q of byCol[xx]) if (!seen.has(q) && q[1] < r[2] && q[2] > r[1]) { seen.add(q); comp.push(q); stack.push(q); }
            }
          }
          if (edge || area >= 48) continue;
          for (const r of comp) { for (let u = r[1]; u < r[2]; u++) toGround(r[0], u); r[1] = r[2]; }
        }
        for (let n = runs.length - 1; n >= 0; n--) if (runs[n][1] >= runs[n][2]) runs.splice(n, 1);
        for (let x = 0; x < XW; x++) byCol[x] = byCol[x].filter(r => r[1] < r[2]);
      }
      // A mesa's face needs a mesa behind it: where the ragged edge of a bare patch reached
      // deep enough in only a few columns, the cut stood in the rubble as a thin striped stake.
      // Cuts less than CUTW columns wide are dropped, and a bare patch at the back of the
      // rubble with no mesa face beside it is filled with rubble (a smooth scrap there read as
      // a loose plate).
      if (rugP) {
        const near = (xx, u) => { for (let d = 0; d <= 20; d++) for (const uu of [u - d, u + d]) if (uu > V0 && uu < V0 + VH && cutM[(uu - V0) * XW + (xx - X0)]) return uu; return -1; };
        const kept = [];
        for (const r of runs) {
          if (!r[3].length) continue;
          const x = r[0];
          r[3] = r[3].filter(u => {
            let w = 1;
            for (const s of [-1, 1]) {
              let uu = u;
              for (let xx = x + s; xx >= X0 && xx < X0 + XW && w < CUTW; xx += s) { const q = near(xx, uu); if (q < 0) break; uu = q; w++; }
            }
            return w >= CUTW;
          });
          for (const u of r[3]) kept.push([x, u]);
        }
        for (const [x, a, b, cuts] of runs) {
          if (cuts.length || !sandAt(x, a) || kept.some(([kx, ku]) => Math.abs(kx - x) <= 24 && ku >= a - 8 && ku <= b + 8)) continue;
          let u = a;
          while (u < b && !rugP[(u - V0) * XW + (x - X0)]) u++;
          if (u < b) for (let w = a; w < u; w++) { const k = (w - V0) * XW + (x - X0); if (topM[k] === TM.CTOP) rugP[k] = 1; }
        }
      }
      for (const [x, a, b, cuts] of runs) {
        // the run's segments: its back, then every cut
        const deep = b >= V0 + VH, ss = [a, ...cuts];
        ss.forEach((s0, n) => {
          const s1 = n + 1 < ss.length ? ss[n + 1] : b, D = deep && n + 1 === ss.length ? DEEP : s1 - s0;
          for (let u = s0; u < s1; u++) runD[(u - V0) * XW + (x - X0)] = D;
          if (s0 > V0) segs.push([x, s0, s1, n === 0]);       // (else its back lies beyond the region)
        });
      }
      // (a cave mouth, a cracked wall or a waterfall always stands at full height)
      const fullCol = (x, s0, s1) => {
        const tx = Math.floor(x / TT);
        for (let ty = Math.floor(s0 / TT); ty <= Math.floor((s1 - 1) / TT); ty++) {
          const id = tAt(tx, ty);
          if (mouth(id) || id === T_CRACK || (desc.fallAt && desc.fallAt(tx, ty))) return true;
        }
        return false;
      };
      // (a shallow column takes the slope of the deepest column near it and simply stands
      // lower, instead of rising as a pillar out of line with the rest of its mass)
      const Lof = (D) => Math.max(0, Math.min(TER.CLIFF, D - 24));
      const plan = [];
      // (shD: the depth of each column too shallow for the slope of its mass, see below)
      const shD = new Int16Array(N);
      for (const [x, s0, s1, back] of segs) {
        const D = runD[(s0 - V0) * XW + (x - X0)];
        const vm = Math.min(s1 - 1, s0 + 24);
        let L = Lof(D);
        for (let dx = -TER.CLIFF; dx <= TER.CLIFF && L < TER.CLIFF; dx++) {
          const xx = x + dx;
          if (!dx || xx < X0 || xx >= X0 + XW) continue;
          const Dn = runD[(vm - V0) * XW + (xx - X0)];
          if (Dn) L = Math.max(L, Lof(Dn));
        }
        if (L < 4) {
          // a lone speck of rock with no mass beside it goes back to plain ground
          if (D < 12) for (let u = s0; u < s1; u++) {
            const k = (u - V0) * XW + (x - X0);
            if (topM[k] !== TM.CTOP) continue;
            hgt[k] = 0; topM[k] = desc.groundMatAt ? desc.groundMatAt(x, u) : TM.GRASS; faceM[k] = TM.BANK;
            if (rugP) rugP[k] = 0;
          }
          continue;
        }
        const shallow = D < DEEP && D - L < TOPMIN && D >= 4;
        if (shallow) for (let u = s0; u < s1; u++) shD[(u - V0) * XW + (x - X0)] = D;
        plan.push([x, s0, s1, D, L, vm, shallow, back]);
      }
      // A column too shallow for the slope of its mass showed no top at all, only its face:
      // a thin board or screen, or a wide face with a small top in the middle of it. Where a
      // stretch of such columns is wide (a wing or a thin wall, not just the rounded corner of
      // a big mass, whose few columns keep their plain sloped face), it keeps a narrow top
      // (TOPMIN) across its whole width and simply stands lower, so it still covers none of
      // the ground behind it: a shoulder or step of the rock. The shallow columns joined to
      // such a stretch (the rounded ends of a small lump or of a wing) go with it: left as
      // plain sloped faces they rose above it at either end like two ears.
      const nP = plan.length, low = new Uint8Array(nP), full = new Uint8Array(nP), dead = new Uint8Array(nP);
      const pcol = Array.from({ length: XW }, () => []);
      plan.forEach((p, k) => pcol[p[0] - X0].push(k));
      // (the entries of the next column over that touch this one)
      const nbs = (k, dx) => {
        const p = plan[k], xx = p[0] + dx;
        return xx < X0 || xx >= X0 + XW ? [] : pcol[xx - X0].filter(q => plan[q][1] < p[2] && plan[q][2] > p[1]);
      };
      const queue = [];
      plan.forEach(([x, s0, s1, D, L0, vm, shallow], k) => {
        if (!shallow) return;
        if (fullCol(x, s0, s1)) { full[k] = 1; return; }
        let n = 0;
        for (let dx = -8; dx <= 8; dx++) {
          const xx = x + dx;
          if (xx < X0 || xx >= X0 + XW) continue;
          const Dn = shD[(vm - V0) * XW + (xx - X0)];
          if (Dn && Math.abs(Dn - D) <= 10) n++;
        }
        if (n >= 9) { low[k] = 1; queue.push(k); }
      });
      while (queue.length) {
        const k = queue.pop();
        for (const dx of [-1, 1]) for (const q of nbs(k, dx)) if (!low[q] && !full[q] && plan[q][6]) { low[q] = 1; queue.push(q); }
      }
      // Along a shoulder the ragged back edge moves by at most a pixel from one column to the
      // next (where it jutted by a few pixels, the rock is cut back): its thin top then runs as
      // one clean band. A bigger step is the shoulder's rounded end or another piece of rock,
      // and stays. (Only at the back of a run: a mesa's face standing in the rubble keeps its
      // place.)
      {
        const lk = [];
        for (let k = 0; k < nP; k++) if (low[k] && plan[k][7]) lk.push(k);
        lk.sort((a, b) => plan[a][0] - plan[b][0]);
        const s0n = new Map(lk.map(k => [k, plan[k][1]]));
        const relax = (order, dx) => {
          for (const k of order) for (const q of nbs(k, dx)) {
            if (s0n.has(q) && Math.abs(plan[q][1] - plan[k][1]) <= 3) s0n.set(k, Math.max(s0n.get(k), s0n.get(q) - 1));
          }
        };
        relax(lk, -1); relax(lk.slice().reverse(), 1); relax(lk, -1);
        for (const k of lk) {
          // (never more than 3px off a column: a rounded end is not cut into a long wedge)
          const p = plan[k], x = p[0], s0 = Math.min(p[1] + 3, s0n.get(k));
          if (s0 <= p[1]) continue;
          const end = s0 >= p[2] - 2 ? p[2] : s0;
          for (let u = p[1]; u < end; u++) toGround(x, u);
          if (end === p[2]) { dead[k] = 1; continue; }
          p[1] = s0; p[3] = p[2] - s0;
        }
      }
      for (let k = 0; k < nP; k++) {
        if (dead[k]) continue;
        const [x, s0, s1, D, L0] = plan[k];
        let L = L0, Hc = TER.CLIFF;
        if (full[k]) L = Math.max(4, D - TOPMIN);
        else if (low[k]) { Hc = D - Math.min(TOPMIN, Math.ceil(D / 2)); L = Hc; }
        for (let u = s0; u < s0 + L && u < s1; u++) hgt[(u - V0) * XW + (x - X0)] = Math.min(Hc, Math.ceil((u - s0) * Hc / L));
        if (Hc < TER.CLIFF) for (let u = s0 + L; u < s1; u++) { const k2 = (u - V0) * XW + (x - X0); if (hgt[k2] > Hc) hgt[k2] = Hc; }
        for (let u = s0; u < s1; u++) {
          const k2 = (u - V0) * XW + (x - X0);
          topFrom[k2] = s0 + L + 1000;
          if (low[k]) shoulderM[k2] = 1;
        }
      }
    }
  })();
  const hAt = (x, v) => (x < X0 || v < V0 || x >= X0 + XW || v >= V0 + VH) ? 0 : hgt[(v - V0) * XW + (x - X0)];

  // static prop shadows
  const propSh = new Uint8Array(N);
  for (const s of desc.shadows || []) {
    if (s.rect) {
      const [x0, v0, x1, v1] = s.rect.map(Math.round);
      for (let v = Math.max(V0, v0); v < Math.min(V0 + VH, v1); v++) for (let x = Math.max(X0, x0); x < Math.min(X0 + XW, x1); x++) propSh[(v - V0) * XW + (x - X0)] = 1;
      continue;
    }
    for (let v = Math.floor(s.v - s.rv); v <= s.v + s.rv; v++) {
      for (let x = Math.floor(s.x - s.rx); x <= s.x + s.rx; x++) {
        if (x < X0 || v < V0 || x >= X0 + XW || v >= V0 + VH) continue;
        const dx = (x + 0.5 - s.x) / s.rx, dv = (v + 0.5 - s.v) / s.rv;
        if (dx * dx + dv * dv <= 1) propSh[(v - V0) * XW + (x - X0)] = 1;
      }
    }
  }

  // per-tile maximum height: lets the shadow test skip flat neighbourhoods
  const tileMax = new Int16Array(TW * TH).fill(-32768);
  for (let v = V0; v < V0 + VH; v++) {
    const tyi = Math.floor(v / TT) - TY0;
    for (let x = X0; x < X0 + XW; x++) {
      const k = tyi * TW + Math.floor(x / TT) - TX0, h = hgt[(v - V0) * XW + (x - X0)];
      if (h > tileMax[k]) tileMax[k] = h;
    }
  }
  const tMaxAt = (tx, ty) => (tx < TX0 || ty < TY0 || tx >= TX0 + TW || ty >= TY0 + TH) ? 0 : tileMax[(ty - TY0) * TW + (tx - TX0)];
  const inShadow = (x, v, h) => {
    // the shadow ray only reaches ~28px west and ~14px north: one tile each way
    const tx = Math.floor(x / TT), ty = Math.floor(v / TT);
    if (tMaxAt(tx, ty) <= h && tMaxAt(tx - 1, ty) <= h && tMaxAt(tx, ty - 1) <= h && tMaxAt(tx - 1, ty - 1) <= h) return false;
    // (the reach of a shadow wavers by a few pixels, so the shadow a long straight side of
    // rock throws never ends in a ruled line or a box; it only ever falls a little short)
    const gx = desc.ox + x, gv = desc.ov + v;
    const j = kind === "ow" ? Math.floor(vnoise(gx / 8, gv / 6, 29) * 6 + vnoise(gx / 24, gv / 18, 30) * 6 + vnoise(gx / 3, gv / 3, 28) * 4) : 0;
    for (let s = 1; s <= TER.HMAX - h; s++) {
      const xx = Math.round(x + s * SHD.dx), vv = Math.round(v + s * SHD.dv);
      if (hAt(xx, vv) >= h + s + j) return true;
    }
    return false;
  };
  // highest surface in each screen column: rays start there instead of at HMAX
  const colMax = new Int16Array(W);
  for (let x = 0; x < W; x++) {
    let m = TER.HMIN;
    for (let v = V0; v < V0 + VH; v++) { const h = hgt[(v - V0) * XW + (x - X0)]; if (h > m) m = h; }
    colMax[x] = Math.min(TER.HMAX, m);
  }
  // What screen pixel (x, ys) shows: 0 no rock, 1 a rock face, 2 a rock top, 3 a shoulder's
  // top. A shoulder's columns stand at slightly different heights, so a side of its thin
  // top is judged on screen: outlined only where no rock shows next to it (and a taller
  // rock beside it draws no line down through its top band).
  const rockOnScreen = (x, ys) => {
    if (x < 0 || x >= W) return 1;
    for (let h = colMax[x]; h >= 1; h--) {
      const v = ys + h;
      if (v < V0 || v >= V0 + VH) continue;
      const k = (v - V0) * XW + (x - X0);
      if (hgt[k] >= h) return topM[k] !== TM.CTOP ? 0 : hgt[k] > h ? 1 : shoulderM && shoulderM[k] ? 3 : 2;
    }
    return 0;
  };
  // (is the rock at screen column x lower than lim beside a top at (hv, ys)? on a shoulder,
  // is there no rock at all on screen there)
  const sideLow = (sho, x, ys, hv, lim) => sho ? rockOnScreen(x, ys) === 0 : hAt(x, hv) < lim && rockOnScreen(x, ys) !== 3;

  // --- ray march: one step per pixel of height ---
  const base = new Pix(W, H), shade = new Pix(W, H);
  const strips = new Map();
  const waterMask = new Uint8Array(W * H);
  const theme = desc.theme || "dstone";
  const floorRamp = desc.floor || "neutral", floorDirt = desc.floorStyle === "dirt", floorPlanks = desc.floorStyle === "planks";
  // (rockStyle: rock of the region a cliff stands in: "D" sandstone, "M" bare granite,
  // "G" dark slate, else mossy stone; lower case where it is rugged highland)

  const faceNormal = (x, v, field, inward) => {
    const i = (v - V0) * XW + (x - X0);
    const gx = (field[i + 1] - field[i - 1]), gv = (field[i + XW] - field[i - XW]);
    const s = inward ? -1 : 1;
    const n = [-gx * s, -gv * SIN_P * s, 0];
    const l = Math.hypot(n[0], n[1]);
    return l < 1e-4 ? [0, 1, 0] : [n[0] / l, n[1] / l, 0];
  };
  const faceOff = (n) => Math.round(shadeOffset(n, false) - shadeOffset([0, 1, 0], false));
  // no flower within a few pixels of the water (one sat right on the waterline)
  const nearWet = (fgx, fgv) => {
    const x = fgx - desc.ox, v = fgv - desc.ov;
    return x >= X0 && v >= V0 && x < X0 + XW && v < V0 + VH && fW[(v - V0) * XW + (x - X0)] > 0.02;
  };
  // what each screen pixel shows: 1 water, 2 ground or planks (height 0)
  const scl = new Uint8Array(W * H);
  // what each screen pixel shows, for the finishing passes (see PXK)
  const pxk = new Uint8Array(W * H);
  // the flow's hottest seams (made to shimmer live) and the pools' foam line
  const seamL = [], foamL = [], seam = [0];
  // may an ice crack lie on this pixel (world coordinates)? Only 7 px or more from the ice
  // sheet's sides, 4 from its back edge and 6 from its front, where things may stand
  // (a crack that ran on under a block read as a stick poking out of it)
  const iceOK = (wx, wv) => {
    const x = wx - desc.ox, v = wv - desc.ov;
    for (const [dx, dv] of [[0, 0], [-7, 0], [7, 0], [0, -4], [0, 6], [-7, -4], [7, -4], [-7, 6], [7, 6]]) if (tAt(Math.floor((x + dx) / TT), Math.floor((v + dv) / TT)) !== T_DICE) return false;
    return true;
  };
  // a cave mouth blown open in a cracked cliff (the world's secret list tells which)
  const mouthMemo = new Map();
  const blownAt = (tx, ty) => {
    const key = tx * 4096 + ty;
    if (!mouthMemo.has(key)) mouthMemo.set(key, kind === "ow" && secretKindAt(Math.round(desc.ox / TT) + tx, Math.round(desc.ov / TT) + ty) === "bomb" ? 1 : 0);
    return mouthMemo.get(key);
  };

  (() => {
    for (let ys = 0; ys < H; ys++) {
      for (let x = 0; x < W; x++) {
        let hitType = 0, hv = 0, hh = 0;
        for (let h = colMax[x]; h >= TER.HMIN; h--) {
          const v = ys + h;
          if (v < V0 || v >= V0 + VH) continue;
          const hg = hgt[(v - V0) * XW + (x - X0)];
          if (hg >= h) { hitType = hg === h ? 1 : 2; hv = v; hh = h; break; }
        }
        const o = ys * W + x;
        if (!hitType) continue;
        const i = (hv - V0) * XW + (x - X0);
        const gx = desc.ox + x, gv = desc.ov + hv;
        const tx = Math.floor(x / TT), ty = Math.floor(hv / TT), id = tAt(tx, ty);
        const lx = x - tx * TT, lv = hv - ty * TT;
        let col = 0, colS = 0;
        if (hitType === 1) {
          const m = topM[i];
          if (m === TM.WATER) {
            // shallow rim and foam; open water is left transparent for the animated layer
            let d = 9;
            for (let r = 1; r <= 3 && d === 9; r++) {
              for (const [ddx, ddv] of [[r, 0], [-r, 0], [0, r], [0, -r]]) {
                // (a bridge or dock is no shore: the water runs on under it, in its shadow)
                const tm = topM[i + ddv * XW + ddx];
                if (tm !== TM.WATER && tm !== TM.PLANK) { d = r; break; }
              }
            }
            scl[o] = 1; pxk[o] = PXK.WATER;
            // a pool's foam line where the water meets its walls and islands (two phases,
            // the live layer swaps them; the picture holds the first)
            if (d === 1 && kind === "dun") { col = foamColor(x, ys, 0); foamL.push(o); }
            else if (d === 1 && hash2(gx >> 1, gv, 71) < 0.7) col = pc("water", 4);
            else if (d <= 2) col = pc("water", 3);
            else { waterMask[o] = 1; continue; }
            colS = pc("water", 2);
          } else {
            if (hh === 0) scl[o] = 2;
            const sh = propSh[i] || inShadow(x, hv, hh);
            // rim light on raised tops: west/south edges catch the light, east edges fall off
            let edge = 0;
            if (hh > 0) {
              if (hAt(x - 1, hv) < hh || hAt(x, hv + 1) < hh) edge = 1;
              else if (hAt(x + 1, hv) < hh) edge = -1;
              else if (hAt(x, hv - 1) < hh) edge = -2;          // back lip: the top ends here
            }
            switch (m) {
              case TM.GRASS: col = grassColor(gx, gv, 3, sh, nearWet); break;
              case TM.GRASSD: col = grassColor(gx, gv, 2, sh, nearWet); break;
              case TM.DEAD: col = deadGrassColor(gx, gv, sh); break;
              case TM.DIRT: col = dirtColor(gx, gv, sh); break;
              case TM.SAND: col = sandColor(gx, gv, sh); break;
              case TM.ROCKY: col = rockyGroundColor(gx, gv, sh); break;
              case TM.CTOP: {
                // a raised top is outlined where it meets lower ground behind or beside it,
                // with a lit bevel just inside its north and west edges (so a big mesa never
                // reads as more ground to walk on)
                // (-4: the two pixels just inside the back edge of a top whose back slopes away)
                let ce = 0;
                const db = topFrom && topFrom[i] ? hv - (topFrom[i] - 1000) : -1;
                // (a side is outlined only where the top steps down by more than a couple of
                // pixels: a rounded shoulder that falls away a pixel per column stays clean; on a
                // shoulder's thin top, only where the rock ends there, so the steps between its
                // columns never stand in it as posts)
                const sho = shoulderM ? shoulderM[i] : 0;
                if (hAt(x, hv + 1) < hh) ce = 1;
                else if (sideLow(sho, x - 1, ys, hv, hh - 2) || sideLow(sho, x + 1, ys, hv, hh - 2) || hAt(x, hv - 1) < hh) ce = -3;
                // (the darker band inside the back edge: one pixel on a shoulder's thin top; a
                // rubble field's lit lip gets a dark line under it, so its lip never merges with
                // the lit tops of the stones just below)
                else if (db === 1 || (!sho && db === 2 && rugP && rugP[i] && hAt(x, hv + 4) >= hh)) ce = -4;
                // (the desert's rubble field shows a short face of banded sandstone under its
                // lip, 5 px, so its edge stands as a low ledge and not as gravel at the sand's
                // level; where the field is too thin for it, only the dark line)
                else if (db >= 3 && db <= 7 && !sho && rugP && rugP[i] && hAt(x, hv + 12 - db) >= hh && (rockStyle(tx, ty) || "").toUpperCase() === "D") ce = -10 - (db - 3);
                else if (db === 3 && !sho && rugP && rugP[i] && hAt(x, hv + 4) >= hh) ce = -5;
                else if (sideLow(sho, x - 2, ys, hv, hh) || hAt(x, hv - 2) < hh) ce = 2;
                // (a ragged rock edge can spill a few pixels into the tile below)
                let st = desc.streamAt ? desc.streamAt(tx, ty) : 0, sv = lv;
                if (!st && desc.streamAt && id !== T_ROCK) { st = desc.streamAt(tx, ty - 1); sv = lv + TT; }
                // where the ridge's back is sloped out of sight, the stream is drawn over the
                // part of the top that still shows, so its spring is never hidden
                if (st && topFrom && topFrom[i]) {
                  const row = (st & 3) * TT, len = ((st >> 2) & 3) * TT, head = hv - sv - row;
                  const hid = topFrom[i] - 1000 - head;
                  if (hid > 0 && hid < len - 8) sv = Math.round((row + sv - hid) * (len + 6) / (len + 6 - hid)) - row;
                }
                let rs = rockStyle(tx, ty), fringe = false;
                if (rugP) {
                  rs = rugP[i] ? rs.toLowerCase() : rs.toUpperCase();
                  // the last two pixels of a rubble field show its bed only under a stone,
                  // so a thin tongue of bare bed never sticks out past the stones (nor does
                  // a speck of rubble less than ~8px across: it is just a few loose stones)
                  if (rugP[i]) {
                    const bare = (ddx, ddv) => { const k = i + ddv * XW + ddx; return !rugP[k] && topM[k] === TM.CTOP; };
                    for (const [ddx, ddv] of [[2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (bare(ddx, ddv)) { fringe = true; break; }
                    if (!fringe && ((bare(4, 0) && bare(-4, 0)) || (bare(0, 4) && bare(0, -4)))) fringe = true;
                  }
                }
                col = (st && streamTopColor(gx, gv, lx, sv, st, sh)) || cliffTopColor(gx, gv, sh, ce, rs, fringe);
                break;
              }
              // (a deck's lip out over the water belongs to the deck tile north of it)
              case TM.PLANK: { const own = id === T_BRIDGE || id === T_DOCK; col = plankColor(gx, gv, lx, own ? lv : lv + TT, plankOf(tx, own ? ty : ty - 1), sh); pxk[o] = PXK.DECK; break; }
              case TM.FLOOR:
                col = floorDirt ? dirtColor(gx, gv, sh) : floorPlanks ? plankFloorColor(gx, gv, sh, desc.floorTone) : floorColor(floorRamp, gx, gv, sh);
                // a drip hanging from the front lip of an ice sheet just north: pale, its tip darker
                if (kind === "dun" && lv <= 1 && tAt(tx, ty - 1) === T_DICE && iceDrip(gx)) col = pc("water", lv === 0 ? 4 : 2);
                break;
              case TM.WTOP: col = wallTopColor(theme, gx, gv, x, hv, hh, sh, edge); break;
              case TM.DOORWAY: col = doorwayColor(floorRamp, tx, ty, lx, lv, gx, gv, sh); break;
              case TM.ICE: col = iceColor(gx, gv, lx, lv, sh, (tAt(tx, ty - 1) !== T_DICE ? 1 : 0) | (tAt(tx - 1, ty) !== T_DICE ? 2 : 0) | (tAt(tx, ty + 1) !== T_DICE ? 4 : 0) | (tAt(tx + 1, ty) !== T_DICE ? 8 : 0), iceOK); break;
              case TM.LAVA: {
                // (a pool of one or two tiles takes finer plates, so it shows a few of them
                // and the cracks between, never one lone streak like a thing lying in it)
                let nl = 0;
                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (tAt(tx + dx, ty + dy) === T_DLAVA) nl++;
                seam[0] = 0; col = lavaColor(gx, gv, seam, nl <= 2); pxk[o] = PXK.LAVA; if (seam[0]) seamL.push(o); break;
              }
              case TM.PITB: col = inkU32(); pxk[o] = PXK.PIT; break;
              case TM.SWITCH: col = switchColor(lx, lv, sh) || floorColor(floorRamp, gx, gv, sh); break;
              default: col = pc("neutral", 2);
            }
            // (lava gives its own light: no wall's shade ever falls on it)
            colS = sh || m === TM.LAVA ? col : darker(col);
            if (hh === 0 && !pxk[o]) pxk[o] = PXK.GROUND;
            if (id === T_STAIRS && kind === "ow") {
              const sc = stairsColor(lx, lv);
              if (sc === -1) col = colS;                         // the curb's shadow on the ground
              else if (sc) { col = sc; colS = sc; pxk[o] = PXK.CURB; }
            }
          }
        } else {
          const m = faceM[i];
          if (m === TM.CFACE) {
            let ff = desc.fallAt ? desc.fallAt(tx, ty) : 0;
            if (!ff && desc.fallAt && id !== T_ROCK) ff = desc.fallAt(tx, ty - 1);
            const fall = ff ? waterfallColor(gx, hh, lx, ff) : 0;
            if (fall) col = fall;
            else {
              const n = faceNormal(x, hv, fC, false);
              // (a face under a lowered top has its lit rim at that top; a face with no flat
              // top at all, at the rounded end of a mass, has none)
              const flat = topFrom && topFrom[i] && topFrom[i] - 1000 <= hv;
              // (where the ragged line of a cracked wall, or of the mouth blown in it, juts out
              // into the tile below, its face still belongs to it; off0: how far this column's
              // foot lies above the tile's bottom row, so the crack or the hole is drawn square
              // to the screen whatever the line does)
              let fty = ty;
              if (kind === "ow" && !crackish(tx, ty) && crackish(tx, ty - 1)) fty = ty - 1;
              const fid = fty === ty ? id : tAt(tx, fty), off0 = crackish(tx, fty) ? (fty + 1) * TT - 1 - hv : 0;
              col = cliffFaceColor(gx, gv, hh, faceOff(n), fid, lx, rockStyle(tx, fty), flat ? hgt[i] : TER.CLIFF, (fid === T_CAVE) ? (blownAt(tx, fty) || (shopMouthAt(Math.round(desc.ox / TT) + tx, Math.round(desc.ov / TT) + fty) ? 2 : 0)) : 0, off0);
            }
          } else if (m === TM.BANK) {
            col = bankColor(gx, hh);
          } else if (m === TM.PLANKF) {
            col = plankFaceColor(gx, hh, lx, plankOf(tx, id === T_BRIDGE || id === T_DOCK ? ty : ty - 1)); pxk[o] = PXK.DECKF;
          } else if (m === TM.WFACE) {
            col = wallFaceColor(theme, gx, gv, hh, hgt[i], tx, ty);
          } else if (m === TM.MOATF) {
            // (what lies below this edge: the pixel just south of it, on the ground)
            const below = topM[i + XW];
            const fk = below === TM.PITB ? "pit" : below === TM.LAVA ? "lava" : "pool";
            col = moatFaceColor(theme, gx, hh, fk, floorRamp);
            pxk[o] = fk === "pit" ? PXK.PITF : fk === "lava" ? PXK.LAVAF : PXK.POOLF;
          } else col = pc("neutral", 1);
          colS = col;
        }
        base.d[o] = col;
        shade.d[o] = colS;
        // only cliff faces stand in front of what is behind them; a flat raised top drawn
        // over an actor hid it with nothing visible in the way (it looks like more ground)
        if (hh > 0 && hitType === 2 && faceM[i] !== TM.PLANKF) {
          const row = Math.max(0, Math.min(12, Math.floor(hv / TT)));
          if (!strips.has(row)) strips.set(row, []);
          strips.get(row).push(o);
        }
      }
    }
  })();

  // A shore facing away from the camera hides its own waterline behind the land's edge, so
  // the water there met the grass with no line at all: give it the same pale rim where the
  // land's edge stands against the water on screen.
  if (kind === "ow") for (let ys = 0; ys < H - 1; ys++) for (let x = 0; x < W; x++) {
    const o = ys * W + x;
    if (!waterMask[o] || !(scl[o + W] === 2 || (x > 0 && scl[o - 1] === 2) || (x < W - 1 && scl[o + 1] === 2))) continue;
    waterMask[o] = 0;
    base.d[o] = hash2(x >> 1, ys, 72) < 0.6 ? pc("water", 4) : pc("water", 3);
    shade.d[o] = pc("water", 2);
  }

  // finishing passes: what stands on the ground or glows over it (each in a function of
  // its own, see above)
  let anim = null;
  if (kind === "ow") finishOverworld({ base, shade, W, H, pxk, waterMask, tAt, desc, plankOf, blownAt, rockStyle });
  else anim = finishRoom({ base, shade, W, H, pxk, waterMask, tAt, theme, floorRamp, seamL, foamL, seed: desc.ox + desc.ov * 7 });

  // occluder strips, cropped
  const stripList = [];
  for (const [row, list] of strips) {
    let x0 = W, x1 = 0, y0 = H, y1 = 0;
    for (const o of list) { const x = o % W, y = (o / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    const p = new Pix(x1 - x0 + 1, y1 - y0 + 1);
    for (const o of list) { const x = o % W, y = (o / W) | 0; p.d[(y - y0) * p.w + (x - x0)] = base.d[o]; }
    stripList.push({ row, x: x0, y: y0, canvas: p.toCanvas() });
  }
  stripList.sort((a, b) => a.row - b.row);
  return { base: base.toCanvas(), shade: shade.toCanvas(), strips: stripList, waterMask, hgt, hAt, anim };
}

// ---------- finishing passes ----------
// A secret of the world at a tile (tiles counted across the whole overworld): what it was
// ("push" a headstone, "burn" a bush, "bomb" a cracked cliff) or "", from the world's own
// list of hand-placed features, which stays the same when the secret is found.
function secretKindAt(gtx, gty) {
  if (typeof OVERRIDES !== "object") return "";
  const sx = Math.floor(gtx / COLS), sy = Math.floor(gty / ROWS), ov = OVERRIDES[sx + "," + sy];
  if (!ov || !ov.secrets) return "";
  const x = gtx - sx * COLS, y = gty - sy * ROWS;
  for (const s of ov.secrets) if (s.x === x && s.y === y) return s.kind;
  return "";
}
// Is there a dungeon's mouth (it has its own carved portal) at this overworld tile?
function dungeonMouthAt(gtx, gty) {
  if (typeof OVERRIDES !== "object") return false;
  const sx = Math.floor(gtx / COLS), sy = Math.floor(gty / ROWS), ov = OVERRIDES[sx + "," + sy];
  if (!ov) return false;
  const k = (gtx - sx * COLS) + "," + (gty - sy * ROWS);
  return !!((ov.dungeon && ov.dungeon[k]) || (ov.gate && ov.gate.x + "," + ov.gate.y === k));
}

// Is the cave at this overworld tile a shop (its mouth stands under the shop's awning)?
function shopMouthAt(gtx, gty) {
  if (typeof OVERRIDES !== "object") return false;
  const sx = Math.floor(gtx / COLS), sy = Math.floor(gty / ROWS), ov = OVERRIDES[sx + "," + sy];
  return !!(ov && ov.caves && /^shop/.test(ov.caves[(gtx - sx * COLS) + "," + (gty - sy * ROWS)] || ""));
}

// Loose stones lying on the ground, rendered with the game's own camera (cached).
const _rubble = new Map();
function rubbleSprite(seed, big, mat, sharp) {
  const key = seed + (big ? "b" : "s") + mat + (sharp ? "x" : "o");
  let s = _rubble.get(key);
  if (!s) { s = render3D(rubblePrims(seed, big, mat, sharp), 20, 16, 10, 11, { outline: "prop" }); _rubble.set(key, s); }
  return s;
}
// Lay a stone on the ground picture (and on its shaded twin), with a 1 px contact shade
// to its lower right.
function stampRubble(base, shade, spr, x, y) {
  const P = spr.pix, W = base.w, H = base.h;
  const on = (xx, yy) => xx >= 0 && yy >= 0 && xx < P.w && yy < P.h && P.d[yy * P.w + xx];
  const x0 = Math.round(x) - spr.ax, y0 = Math.round(y) - spr.ay;
  for (let yy = 0; yy < P.h; yy++) for (let xx = 0; xx < P.w; xx++) {
    const col = P.d[yy * P.w + xx], X = x0 + xx, Y = y0 + yy;
    if (!col || X < 0 || Y < 0 || X >= W || Y >= H) continue;
    base.d[Y * W + X] = col; shade.d[Y * W + X] = darker(col);
  }
  for (let yy = 0; yy < P.h; yy++) for (let xx = 0; xx < P.w; xx++) {
    if (!on(xx, yy) || on(xx + 1, yy + 1) || on(xx, yy + 1)) continue;
    const X = x0 + xx + 1, Y = y0 + yy + 1;
    if (X >= 0 && Y >= 0 && X < W && Y < H && base.d[Y * W + X]) { base.d[Y * W + X] = darker(base.d[Y * W + X]); shade.d[Y * W + X] = darker(shade.d[Y * W + X]); }
  }
}
// How light a packed colour looks (0..255).
function lumOf(c) { return 0.3 * (c & 255) + 0.59 * ((c >> 8) & 255) + 0.11 * ((c >> 16) & 255); }
// Warm light on a floor (lava's glow): a colour swapped for the warm one just lighter than
// it, never a blend and never darker (s 3: the bright orange light right against the
// lava, s 2: a warm tan a pixel further out, s 1: the faint one at the glow's edge).
const _glow = [null, new Map(), new Map(), new Map()];
const GLOW_WARM = [null, [["earth", 3], ["skin", 2], ["skin", 3], ["sand", 1]], [["hair", 3], ["red", 3], ["skin", 3], ["gold", 3]], [["red", 3], ["skin", 3], ["gold", 3]]];
function glowOf(c, s) {
  const m = _glow[s];
  let g = m.get(c);
  if (g === undefined) {
    const L = lumOf(c);
    g = 0;
    for (const [r, t] of GLOW_WARM[s]) { const w = pc(r, t); if (lumOf(w) >= L + 2) { g = w; break; } }
    if (!g) g = c;
    m.set(c, g);
  }
  return g;
}
// The next lighter step of a colour's own ramp (a paler slab of the same rock).
const _lighter = new Map();
function lighterTone(c) {
  if (!_lighter.size) for (const r in STYLE.ramps) STYLE.ramps[r].forEach((h, t, R) => { const k = hexU32(h); if (!_lighter.has(k)) _lighter.set(k, hexU32(R[Math.min(R.length - 1, t + 1)])); });
  return _lighter.get(c) || c;
}
// The foam line of a pool: 2 px dashes of white on the palest water, which shift along
// by 2 px between the two phases.
function foamColor(x, y, phase) { return ((x + y + 2 * phase) % 5) < 2 ? pc("white", 0) : pc("water", 4); }

// The overworld's finishing pass: the decks' shade on the water and foam where their
// piles stand in it, what a found secret leaves round its stairs, and the stones before
// cave mouths, under a cracked cliff and thrown out of a blasted one.
function finishOverworld(c) {
  const { base, shade, W, H, pxk, waterMask, tAt, desc, plankOf, blownAt, rockStyle } = c;
  const B = base.d, S = shade.d;
  const gtx0 = Math.round(desc.ox / TT), gty0 = Math.round(desc.ov / TT);
  const ground = (x, y) => x >= 0 && y >= 0 && x < W && y < H && pxk[y * W + x] === PXK.GROUND;
  const water = (x, y) => x >= 0 && y >= 0 && x < W && y < H && waterMask[y * W + x];
  const paint = (x, y, col) => { const o = y * W + x; B[o] = col; S[o] = col; waterMask[o] = 0; };
  // (a loose stone is laid only where all of it lies on open ground: never on a cliff's face)
  const fits = (spr, x, y) => {
    const P = spr.pix, X = Math.round(x) - spr.ax, Y = Math.round(y) - spr.ay;
    for (let yy = 0; yy < P.h; yy++) for (let xx = 0; xx < P.w; xx++) if (P.d[yy * P.w + xx] && !ground(X + xx, Y + yy)) return false;
    return true;
  };
  const lay = (spr, x, y) => { if (fits(spr, x, y)) stampRubble(base, shade, spr, x, y); };
  // (where the ground starts under a cliff's ragged foot, in column x, near row y)
  const footAt = (x, y) => { let yy = y - 10; while (yy < y + 12 && !ground(x, yy)) yy++; return yy; };
  const rockMat = (tx, ty) => { const st = (rockStyle(tx, ty) || "P").toUpperCase(); return st === "D" ? "sandst" : st === "G" ? "darkrock" : "stone"; };
  // A pocket of sand a few pixels across left shut in by the desert's rubble field (where
  // its ragged edge folds round on itself) is filled with rubble, and so is the edge drawn
  // round it (its outline and bevel, 2 px, the lip and face under it, 9 px, and the little
  // striped face over it, 7 px): alone there it read as a tile set in by mistake.
  let desert = false;
  for (let ty = 0; ty < ROWS && !desert; ty++) for (let tx = 0; tx < COLS; tx++) if ((rockStyle(tx, ty) || "P").toUpperCase() === "D") { desert = true; break; }
  if (desert) {
    const seen = new Uint8Array(W * H), fill = [];
    for (let y0 = 1; y0 < H - 1; y0++) for (let x0 = 1; x0 < W - 1; x0++) {
      const s0 = y0 * W + x0;
      if (seen[s0] || pxk[s0] !== PXK.GROUND) continue;
      const comp = [s0];
      seen[s0] = 1;
      let open = false;
      for (let q = 0; q < comp.length; q++) {
        const o = comp[q], x = o % W, y = (o / W) | 0;
        if (x <= 0 || y <= 0 || x >= W - 1 || y >= H - 1) open = true;
        for (let n = 0; n < 4; n++) {
          const p = n === 0 ? o - 1 : n === 1 ? o + 1 : n === 2 ? o - W : o + W;
          if (p < 0 || p >= W * H) continue;
          if (pxk[p] === PXK.GROUND) { if (!seen[p]) { seen[p] = 1; comp.push(p); } }
          else if (pxk[p]) open = true;            // (water, a deck, a curb: not shut in rock)
        }
      }
      if (open || comp.length > 160) continue;
      const cx = comp.reduce((a, o) => a + (o % W), 0) / comp.length, cy = comp.reduce((a, o) => a + ((o / W) | 0), 0) / comp.length;
      if ((rockStyle(Math.floor(cx / TT), Math.floor(cy / TT)) || "P").toUpperCase() !== "D") continue;
      const mine = new Set(comp);
      for (const o of comp) {
        const x = o % W, y = (o / W) | 0;
        for (let dy = -7; dy <= 9; dy++) for (let dx = -2; dx <= 2; dx++) {
          if ((dy > 2 || dy < -2) && Math.abs(dx) > 1) continue;
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= W || yy >= H || pxk[yy * W + xx]) continue;
          mine.add(yy * W + xx);
        }
      }
      for (const o of mine) fill.push(o);
    }
    for (const o of fill) {
      const gx = desc.ox + (o % W), gv = desc.ov + ((o / W) | 0);
      const col = sst(rubbleTone(gx, gv, rubbleDrift(gx, gv) ? 0.8 : 1.25));
      B[o] = col; S[o] = darker(col); pxk[o] = 0;
    }
  }
  let decks = false;
  for (let ty = -1; ty <= ROWS; ty++) for (let tx = -1; tx <= COLS; tx++) {
    const id = tAt(tx, ty), x0 = tx * TT, y0 = ty * TT;
    const gtx = gtx0 + tx, gty = gty0 + ty, h = (k) => hash2(gtx, gty, 240 + k);
    if (id === T_BRIDGE || id === T_DOCK) {
      decks = true;
      // foam where the piles under the deck's front meet the water
      const pk = plankOf(tx, ty);
      if (!pk.eS) continue;
      for (const cx of [pk.pw ? 3 : -1, 15, pk.pe ? 28 : -1]) {
        if (cx < 0) continue;
        const px = x0 + cx;
        if (px < 2 || px >= W - 2) continue;
        let y = Math.max(0, y0 + 26);
        while (y < H && y < y0 + 48 + DECK_EXT && !water(px, y)) y++;
        if (y >= H || y >= y0 + 48 + DECK_EXT) continue;
        [pc("water", 4), pc("white", 0), pc("white", 0), pc("white", 0), pc("water", 4)].forEach((col, k) => { if (water(px - 2 + k, y)) paint(px - 2 + k, y, col); });
        if (water(px + 1, y + 1)) paint(px + 1, y + 1, pc("water", 4));
      }
      continue;
    }
    if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) continue;
    if (id === T_STAIRS) {
      const kind = secretKindAt(gtx, gty);
      if (kind === "burn" || kind === "burnhp") {
        // a burnt bush: a lopsided patch of scorched earth round the curb (wider on the side
        // the fire ran to), charcoal-dark and dense against the curb, bare dirt further out,
        // breaking up into the grass in small clumps; two or three little heaps of grey ash
        const ang = h(0) * 6.283, cxm = x0 + 16, cym = y0 + 16, X0 = x0 - 17, Y0 = y0 - 16, BW = TT + 34, BH = TT + 33;
        const mark = new Uint8Array(BW * BH);
        for (let y = Y0; y < Y0 + BH; y++) for (let x = X0; x < X0 + BW; x++) {
          if (!ground(x, y) || pxk[y * W + x] === PXK.CURB) continue;
          // (d: how far out from the curb; its own shadow counts as right against it)
          const dx = x < x0 + 2 ? x0 + 2 - x : x > x0 + 29 ? x - x0 - 29 : 0, dy = y < y0 + 3 ? y0 + 3 - y : y > y0 + 29 ? y - y0 - 29 : 0;
          const d = Math.max(0.5, Math.hypot(dx, dy)), a = Math.atan2(y - cym, x - cxm);
          const reach = Math.max(0.8, 2 + 11 * Math.pow(Math.max(0, Math.cos(a - ang)), 1.2) + (vnoise(Math.cos(a) * 1.6 + gtx * 3, Math.sin(a) * 1.6 + gty * 3, 248) - 0.5) * 5);
          const f = d / reach, n = vnoise((gtx * TT + x) / 2.6, (gty * TT + y) / 2.6, 247);
          let m = 0;
          if (f < 0.35) m = n > 0.55 ? 1 : 2;                   // char, and dark scorched earth
          else if (f < 0.75) m = n > 0.45 ? 2 : 3;              // scorched earth, and bare dirt
          else if (f < 1.25 && n > 0.45 + (f - 0.75) * 0.9) m = 3;   // clumps breaking up into the grass
          mark[(y - Y0) * BW + (x - X0)] = m;
        }
        // (no lone pixels: a mark with no marked neighbour stays grass)
        const at = (x, y) => x >= 0 && y >= 0 && x < BW && y < BH ? mark[y * BW + x] : 0;
        for (let y = 0; y < BH; y++) for (let x = 0; x < BW; x++) {
          const m = mark[y * BW + x];
          if (!m || (!at(x - 1, y) && !at(x + 1, y) && !at(x, y - 1) && !at(x, y + 1))) continue;
          const col = m === 1 ? pc("earth", 0) : m === 2 ? pc("earth", 1) : pc("earth", 2), X = X0 + x, Y = Y0 + y;
          // (in the curb's own shadow a step darker)
          paint(X, Y, X >= x0 + 2 && X <= x0 + 31 && Y >= y0 + 3 && Y <= y0 + 31 ? darker(col) : col);
        }
        // ash: small heaps of 2 x 1 or 2 x 2, on the scorched side
        const heaps = 2 + (h(1) < 0.5 ? 1 : 0);
        for (let k = 0; k < heaps; k++) {
          const a = ang + (k - 1) * 0.8 + (h(k + 2) - 0.5) * 0.4, big = h(k + 6) < 0.5;
          let x = Math.round(cxm + Math.cos(a) * 18), y = Math.round(cym + Math.sin(a) * 16);
          // (pushed out past the curb and its shadow)
          while (x >= x0 && x <= x0 + 33 && y >= y0 + 1 && y <= y0 + 33) { x += Math.sign(Math.cos(a)) || 1; y += Math.sign(Math.sin(a)); }
          x += Math.round(Math.cos(a) * 1.5); y += Math.round(Math.sin(a) * 1.5);
          const cells = big ? [[0, 0, 4], [1, 0, 3], [0, 1, 3], [1, 1, 2]] : [[0, 0, 4], [1, 0, 3]];
          if (cells.every(([ex, ey]) => ground(x + ex, y + ey))) for (const [ex, ey, t] of cells) paint(x + ex, y + ey, pc("neutral", t));
        }
      } else if (kind === "push") {
        // a headstone dragged off: a low patch of turned earth just north of the curb,
        // ragged at its ends (a checker), a darker clod or two in it
        for (let x = x0 + 7; x <= x0 + 24; x++) for (let y = y0 - 1; y <= y0 + 2; y++) {
          const e = Math.min(x - x0 - 7, x0 + 24 - x), edge = e < 3 || y === y0 - 1;
          if (y === y0 - 1 && e < 5) continue;
          if (edge && ((x + y) & 1)) continue;
          if (ground(x, y)) paint(x, y, hash2(x >> 1, y, 245) < 0.22 ? pc("earth", 1) : pc("earth", 2));
        }
      }
      continue;
    }
    if (id === T_CAVE && !dungeonMouthAt(gtx, gty)) {
      const mat = rockMat(tx, ty), bot = y0 + TT;
      if (blownAt(tx, ty)) {
        // blasted open: the ground round its foot scorched (the outer part checkered), and
        // freshly broken stone thrown out in a fan
        for (let y = bot - 2; y < bot + 12; y++) for (let x = x0 - 8; x < x0 + TT + 8; x++) {
          const r = Math.hypot((x + 0.5 - (x0 + 16)) / 22, (y + 0.5 - bot) / 9);
          if (r > 1 || !ground(x, y)) continue;
          if (r < 0.72 || ((x + y) & 1)) { const o = y * W + x; B[o] = darker(B[o]); S[o] = darker(S[o]); }
        }
        const n = 7;
        for (let k = 0; k < n; k++) {
          const a = Math.PI * (0.12 + 0.76 * (k + h(k) * 0.8) / n), dist = 5 + h(k + 20) * 16;
          const x = x0 + 16 - Math.cos(a) * dist * 1.3, y = footAt(Math.round(x), bot) + 2 + Math.sin(a) * dist * 0.55;
          // (freshly broken: a step paler than the rock's own stones)
          lay(rubbleSprite(gtx * 7 + k, k < 3, mat === "stone" ? "stoneL" : mat === "darkrock" ? "stone" : mat, true), x, y);
        }
      } else {
        // pebbles either side of the threshold (never on the path into the dark)
        const spots = [[4, 5], [9, 9], [25, 6], [29, 10]];
        spots.forEach(([dx, dy], k) => {
          if (h(k + 30) < 0.2) return;
          const x = x0 + dx + Math.round((h(k + 40) - 0.5) * 3), y = bot + dy + Math.round((h(k + 50) - 0.5) * 3);
          lay(rubbleSprite(gtx * 5 + k, k === 0 || k === 2, mat, false), x, y);
        });
      }
      continue;
    }
    if (id === T_CRACK) {
      // a little heap of chips fallen from the crack
      const mat = rockMat(tx, ty), bot = y0 + TT;
      [[8, 3, true], [14, 6, false], [20, 3, true], [25, 5, false]].forEach(([dx, dy, big], k) => {
        const x = x0 + dx + Math.round((h(k + 60) - 0.5) * 3), y = footAt(x, bot) + dy;
        lay(rubbleSprite(gtx * 3 + k, big, mat, true), x, y);
      });
    }
  }
  // the decks' shadow on the water to the lower right: a checker of the dark water tone,
  // so the ripples of the live layer still run through it
  if (decks) {
    const deck = (x, y) => x >= 0 && y >= 0 && x < W && y < H && (pxk[y * W + x] === PXK.DECK || pxk[y * W + x] === PXK.DECKF);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (!waterMask[y * W + x] || !((x + y) & 1)) continue;
      if (deck(x - 3, y - 3) || deck(x - 4, y - 4) || deck(x - 2, y - 3) || deck(x - 3, y - 2)) paint(x, y, pc("water", 1));
    }
  }
}

// A room's finishing pass: the lips of pits, the cooled rim of lava and its warm glow on
// the floor round it. Returns what the live layer animates (see drawTerrainAnim), or null.
function finishRoom(c) {
  const { base, shade, W, H, pxk, theme, floorRamp, seamL, foamL } = c;
  const B = base.d, S = shade.d;
  const R = typeof ROOM === "object" ? ROOM : { X0: 64, Y0: 64, X1: 448, Y1: 288, TRIM: 12 };
  const IX0 = R.X0 + R.TRIM, IY0 = R.Y0 + R.TRIM, IX1 = R.X1 - R.TRIM, IY1 = R.Y1 - R.TRIM;
  const k = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : pxk[y * W + x];
  const pit = (q) => q === PXK.PIT || q === PXK.PITF;
  const hole = (q) => pit(q) || q === PXK.LAVA || q === PXK.WATER;
  const set = (o, col) => { B[o] = col; S[o] = col; };
  const wl = rampLen(theme) - 1, fl = rampLen(floorRamp) - 1;
  // (a room with nothing below its floor needs none of this)
  let lava = false, any = false;
  for (let y = R.Y0; y < R.Y1 && !(lava && any); y++) for (let x = R.X0; x < R.X1; x++) {
    const q = pxk[y * W + x];
    if (q === PXK.LAVA) { lava = true; any = true; break; }
    if (q === PXK.PIT || q === PXK.PITF || q === PXK.WATER) any = true;
  }
  if (!any) return null;
  for (let y = R.Y0; y < R.Y1; y++) for (let x = R.X0; x < R.X1; x++) {
    const o = y * W + x, q = pxk[o];
    if (q === PXK.GROUND) {
      if (hole(pxk[o - W])) set(o, pc(floorRamp, fl));
      continue;
    }
    if (pit(q)) {
      // a pit's west and east sides: a 2 px curb, pale where the floor meets it, dark where
      // it drops (the side walls themselves face sideways and never show)
      if (k(x - 1, y) === PXK.GROUND) { set(o, pc(theme, Math.min(wl, 3))); if (pit(k(x + 1, y))) set(o + 1, pc(theme, 1)); }
      if (k(x + 1, y) === PXK.GROUND) { set(o, pc(theme, Math.min(wl, 3))); if (pit(k(x - 1, y)) && k(x - 2, y) !== PXK.GROUND) set(o - 1, pc(theme, 1)); }
    }
  }
  // (above: a floor pixel under a pit, a pool or the lava on screen is the near lip, the
  // floor's own edge catching the light)
  const anim = {};
  // --- lava: a cooled rim on its own edge, a crack across a pool too small for one, and its
  // warm light on the floor round it ---
  if (lava) {
    const hotQ = (q) => q === PXK.LAVA || q === PXK.LAVAF;
    const L = (x, y) => k(x, y) === PXK.LAVA;
    // the rim: the lava's outermost pixel is stone gone cold (1), the next one in a skin
    // of dark red (2)
    const edge = new Uint8Array(W * H);
    let bx0 = W, by0 = H, bx1 = -1, by1 = -1;
    for (let y = R.Y0; y < R.Y1; y++) for (let x = R.X0; x < R.X1; x++) {
      const o = y * W + x;
      if (pxk[o] !== PXK.LAVA) continue;
      if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y;
      if (!L(x - 1, y) || !L(x + 1, y) || !L(x, y - 1) || !L(x, y + 1)) { edge[o] = 1; set(o, pc("stone", 1)); }
    }
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const o = y * W + x;
      if (pxk[o] === PXK.LAVA && !edge[o] && (edge[o - 1] === 1 || edge[o + 1] === 1 || edge[o - W] === 1 || edge[o + W] === 1)) { edge[o] = 2; set(o, pc("red", 1)); }
    }
    // (the crust plates and the cracks between them are lavaColor's own)
    // the light it throws on the floor: only the flagstones' lit faces (never the joints)
    // turn a warmer, lighter tone, brightest against the rim and fading over 1 to 3 px (the
    // reach wanders along the rim, so it never reads as a frame; its outermost pixel comes
    // and goes with the flicker); nothing darker than the floor itself, no checker
    const dist = new Uint8Array(W * H).fill(9);
    for (let y = R.Y0; y < R.Y1; y++) for (let x = R.X0; x < R.X1; x++) {
      const o = y * W + x;
      if (!hotQ(pxk[o])) continue;
      // (only the lava's outer pixels reach the floor within 3 px: the rest need not look)
      if (hotQ(pxk[o - 1]) && hotQ(pxk[o + 1]) && hotQ(pxk[o - W]) && hotQ(pxk[o + W]) && hotQ(pxk[o - W - 1]) && hotQ(pxk[o - W + 1]) && hotQ(pxk[o + W - 1]) && hotQ(pxk[o + W + 1])) continue;
      for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        if (d < dist[yy * W + xx]) dist[yy * W + xx] = d;
      }
    }
    const lit = lumOf(pc(floorRamp, 2)) - 1, flick = [];
    for (let y = IY0; y < IY1; y++) for (let x = IX0; x < IX1; x++) {
      const o = y * W + x;
      if (pxk[o] !== PXK.GROUND || dist[o] > 3 || lumOf(B[o]) < lit) continue;
      const reach = 1 + Math.round(vnoise(x / 5, y / 5, 263) * 2.4), d = dist[o];
      if (d > reach) continue;
      if (d === reach && d > 1) { flick.push([o, B[o]]); set(o, glowOf(B[o], 1)); }
      else set(o, glowOf(B[o], d === 1 ? 3 : 2));
    }
    // the shimmer: along the cracks a slow wave dims the bright cores to a darker gold and
    // back, and the white-hot ones to gold
    const wave = (o, f) => ((((o % W) * 3 + ((o / W) | 0) * 5) >> 4) - f) & 3;
    const inRoom = (o) => (o % W) >= IX0 && (o % W) < IX1 && ((o / W) | 0) >= IY0 && ((o / W) | 0) < IY1;
    const seams = seamL.filter(o => !edge[o] && inRoom(o));
    const hot = new Uint8Array(W * H);
    for (const o of seams) hot[o] = 1;
    // a pool too small to have caught a crack of its own (one tile, or two) gets one across
    // its middle, so it still reads as liquid under a crust and never as a closed box
    const seen = new Uint8Array(W * H);
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const o0 = y * W + x;
      if (seen[o0] || pxk[o0] !== PXK.LAVA) continue;
      const comp = [o0];
      seen[o0] = 1;
      let n = 0, cx0 = W, cx1 = -1, cy0 = H, cy1 = -1;
      for (let q = 0; q < comp.length; q++) {
        const o = comp[q], ox = o % W, oy = (o / W) | 0;
        if (hot[o]) n++;
        if (ox < cx0) cx0 = ox; if (ox > cx1) cx1 = ox; if (oy < cy0) cy0 = oy; if (oy > cy1) cy1 = oy;
        for (const p of [o - 1, o + 1, o - W, o + W]) if (!seen[p] && pxk[p] === PXK.LAVA) { seen[p] = 1; comp.push(p); }
      }
      if ((n >= 12 && (comp.length > 1600 || n >= comp.length * 0.1)) || cx1 - cx0 < 10 || cy1 - cy0 < 8) continue;
      // (a crack of gold running right across from rim to rim, so it reads as a split in
      // the crust and never as a thing lying in the pool: 2 px, stepping up or down at two
      // places, swelling to 3 with a white-hot core in one short stretch; the crust's red
      // glow on both sides)
      const r = (i) => hash2(cx0, cy0, 264 + i);
      const yc = cy0 + Math.round((cy1 - cy0) * (0.35 + r(2) * 0.3));
      const xa = cx0 + 2, xb = cx1 - 2, len = xb - xa;
      const s1 = xa + Math.floor(len * (0.15 + r(0) * 0.3)), s2 = xa + Math.floor(len * (0.55 + r(3) * 0.3));
      const d1 = r(1) < 0.5 ? -1 : 1, d2 = r(4) < 0.5 ? -d1 : d1;
      const f0 = xa + Math.floor(len * (0.2 + r(5) * 0.5)), f1 = f0 + 4 + Math.floor(r(6) * 3);
      const put = (xx, yy, col, force) => {
        const o = yy * W + xx;
        if (pxk[o] !== PXK.LAVA || edge[o] || (hot[o] && !force)) return;
        set(o, col);
        if (force && !hot[o]) { hot[o] = 1; seams.push(o); }
      };
      for (let xx = xa; xx <= xb; xx++) {
        const yy = yc + (xx >= s1 ? d1 : 0) + (xx >= s2 ? d2 : 0);
        const fat = xx >= f0 && xx <= f1, top = fat ? yy - 1 : yy, bot = yy + 1;
        for (let v = top; v <= bot; v++) put(xx, v, fat && v === yy && xx > f0 && xx < f1 ? pc("white", 0) : pc("gold", 3), true);
        put(xx, top - 1, pc("red", 1)); put(xx, bot + 1, pc("red", 1));
      }
    }
    const white = new Set(seams.filter(o => B[o] === pc("white", 0)));
    const seamCol = (o, f) => white.has(o) ? (wave(o, f) < 2 ? pc("white", 0) : pc("gold", 3)) : (wave(o, f) === 3 ? pc("gold", 2) : pc("gold", 3));
    for (const o of seams) set(o, seamCol(o, 0));
    const flickAt = new Map(flick);
    anim.lava = animFrames(W, 4, seams.concat(flick.map(f => f[0])), (o, f) => flickAt.has(o) ? (f < 2 ? glowOf(flickAt.get(o), 1) : flickAt.get(o)) : seamCol(o, f));
    // bubbles: a few spots in each tile of lava, only on a river (the crust holds them
    // down elsewhere) and well clear of the rim
    const spots = new Map();
    for (let y = IY0 + 4; y < IY1 - 4; y++) for (let x = IX0 + 4; x < IX1 - 4; x++) {
      const o = y * W + x;
      if (!hot[o] || !hot[o - 1] || !hot[o + 1] || !(hot[o - W] || hot[o + W]) || hash2(x, y, 250) < 0.7) continue;
      let clear = true;
      for (let dy = -3; dy <= 3 && clear; dy++) for (let dx = -3; dx <= 3; dx++) if (k(x + dx, y + dy) !== PXK.LAVA || edge[o + dy * W + dx]) { clear = false; break; }
      if (!clear) continue;
      const t = Math.floor(x / TT) + "," + Math.floor(y / TT);
      if (!spots.has(t)) spots.set(t, []);
      spots.get(t).push([x, y]);
    }
    const tiles = [...spots.values()];
    // (tiles in a shuffled order, so one bubble never follows the last in the same tile)
    tiles.sort((a, b) => hash2(a[0][0], a[0][1], 251) - hash2(b[0][0], b[0][1], 251));
    if (tiles.length) anim.bubbles = { tiles, every: Math.max(8, Math.round(120 / tiles.length)) };
  }
  // --- pools: the foam line where the water meets its walls and islands ---
  if (foamL.length) {
    const inside = foamL.filter(o => { const x = o % W, y = (o / W) | 0; return x >= IX0 && x < IX1 && y >= IY0 && y < IY1; });
    anim.foam = animFrames(W, 2, inside, (o, f) => foamColor(o % W, (o / W) | 0, f));
  }
  return anim.lava || anim.foam || anim.bubbles ? anim : null;
}
// Frames for the live layer: each a small canvas holding only the animated pixels, over
// their bounding box. col(o, f) gives pixel o's colour in frame f (frame 0 is what the
// baked picture already shows).
function animFrames(W, n, list, col) {
  if (!list.length) return null;
  let x0 = W, y0 = 1e9, x1 = -1, y1 = -1;
  for (const o of list) { const x = o % W, y = (o / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const frames = [];
  for (let f = 0; f < n; f++) {
    const p = new Pix(x1 - x0 + 1, y1 - y0 + 1);
    for (const o of list) { const x = o % W, y = (o / W) | 0; p.d[(y - y0) * p.w + (x - x0)] = col(o, f); }
    frames.push(p.toCanvas());
  }
  return { x: x0, y: y0, frames };
}

// ---------- live terrain (drawn every frame over the scene's baked picture) ----------
// Lava shimmer and glow (4 frames, 12 ticks each), pool foam (2 phases, 16 ticks each),
// and lava bubbles: one rises every few ticks, each in the next tile of a shuffled round
// (so never two at once in one tile): a bright dome, a gold ring, white sparks, then gone.
// ox, oy: where the scene's picture sits on the canvas.
const _bubble = [];
function bubbleFrames() {
  if (_bubble.length) return _bubble;
  const pal = { w: pc("white", 0), g: pc("gold", 3), o: pc("red", 3) };
  const mk = (rows) => { const p = new Pix(rows[0].length, rows.length); rows.forEach((r, y) => [...r].forEach((ch, x) => { if (pal[ch]) p.d[y * p.w + x] = pal[ch]; })); return p.toCanvas(); };
  // (5 x 5, centred on the spot: a bright dome swells, opens into a ring of gold round a
  // thin skin, and bursts into a few white sparks)
  _bubble.push(mk([".....", ".....", "..g..", ".gwg.", "....."]));
  _bubble.push(mk([".....", ".wgg.", ".gog.", ".ggg.", "....."]));
  _bubble.push(mk(["w...w", ".....", "..o..", ".....", ".g.g."]));
  return _bubble;
}
function drawTerrainAnim(c, anim, ox, oy, frame) {
  if (!anim) return;
  if (anim.lava) c.drawImage(anim.lava.frames[Math.floor(frame / 12) & 3], anim.lava.x + ox, anim.lava.y + oy);
  if (anim.foam) c.drawImage(anim.foam.frames[(frame >> 4) & 1], anim.foam.x + ox, anim.foam.y + oy);
  const b = anim.bubbles;
  if (b) {
    const F = bubbleFrames(), N = Math.floor(frame / b.every);
    for (let n = Math.max(0, N - 3); n <= N; n++) {
      const age = frame - n * b.every, ph = Math.floor(age / 8);
      if (ph < 0 || ph > 2) continue;
      const spots = b.tiles[n % b.tiles.length], sp = spots[Math.floor(hash2(n, 3, 252) * spots.length)];
      c.drawImage(F[ph], sp[0] - 2 + ox, sp[1] - 2 + oy);
    }
  }
}

// ---------- cliffs ----------
// edge: +1 on the lit rim over the face, -3 on the outline where the top meets lower ground
// behind or beside it, +2 on the bevel just inside that outline (north and west), -4 on
// the band just inside the back edge of a top whose back slopes away.
// Tops stay calm (two main tones) so the walkable ground around them reads first.
// Desert sandstone runs on its own warm steps (red into peach), so a mesa top never
// matches the brown of a dirt road or the sand in a cliff's shadow.
const SANDSTONE = [["red", 0], ["skin", 0], ["skin", 1], ["red", 3], ["skin", 3]];
function sst(t) { const s = SANDSTONE[t < 0 ? 0 : t > 4 ? 4 : t]; return pc(s[0], s[1]); }

// Rubble of the rugged highland: one stone per 7x6 cell at a random spot in it (so no
// grid shows), in three sizes, now and then a heap of three; lit on the upper left with a
// short shadow to the lower right, on a bed one step darker than bare rock. Every cell
// holds a stone, so the field is evenly rough right up to its edge. Returns a tone 1..4.
function rubbleTone(gx, gv, scale) {
  const CW = 7, CH = 6;
  const cx0 = Math.floor(gx / CW), cy0 = Math.floor(gv / CH);
  let front = -1e9, tone = 0, shade = false;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = cx0 + i, cy = cy0 + j;
    const s = hash2(cx, cy, 204);
    const r0 = (s < 0.25 ? 1.3 + s * 2 : s < 0.82 ? 2.0 + (s - 0.25) : 2.9 + (s - 0.82) * 5) * scale;
    const bx = (cx + hash2(cx, cy, 202)) * CW, by = (cy + hash2(cx, cy, 203)) * CH;
    const n = hash2(cx, cy, 201) < 0.2 && r0 > 2 ? 3 : 1;
    for (let k = 0; k < n; k++) {
      const a = hash2(cx, cy, 205 + k) * 6.283;
      const r = k ? (1.1 + hash2(cx, cy, 208 + k) * 0.8) * scale : r0;
      const x = k ? bx + Math.cos(a) * (r0 + 0.6) : bx, y = k ? by + Math.sin(a) * (r0 + 0.6) * 0.8 : by;
      const dx = gx + 0.5 - x, dy = (gv + 0.5 - y) * 1.3;
      if (dx * dx + dy * dy <= r * r) {
        if (y > front) { front = y; const q = (dx + dy) / r; tone = q < -0.45 ? 4 : q > 0.55 ? 2 : 3; }
      } else {
        const sx = dx - 1.5, sy = dy - 1.3;
        if (sx * sx + sy * sy <= r * r) shade = true;
      }
    }
  }
  if (tone || shade) return tone || 1;
  // (the bed between the stones is grit, not a flat plate: a gap with no stone in it read
  // as a bare blob) a grain now and then, lit above and shadowed below right
  const gx3 = Math.floor(gx / 3), gv3 = Math.floor(gv / 3);
  if (hash2(gx3, gv3, 209) < 0.3) {
    const px = gx3 * 3 + Math.floor(hash2(gx3, gv3, 210) * 2), pv = gv3 * 3 + Math.floor(hash2(gx3, gv3, 211) * 2);
    if (gx === px && gv === pv) return 3;
    if (gx === px + 1 && gv === pv + 1) return 1;
  }
  return 2;
}

// A big block of sandstone half sunk in the desert's rubble, one at most per 64x48 cell
// (and always well inside it): a flat top with six straight sides, squashed by the view,
// over a short front face of flat facets, drawn in the same hard steps as the stones round
// it. The top is lit along its upper-left edges and over the face, with a crack across it;
// of the face, the facet turned south-west is lit, the south one mid, the south-east one
// dark; a dark outline, darkest on the lower right, and a short shadow to the lower right.
// Returns a sandstone step 0..4, or -1 where there is none.
// (the shape of each cell's block, worked out once: null where the cell has none)
const BOULDERS = new Map();
function boulderGeo(cx, cy) {
  const key = (cx + 4096) * 8192 + cy + 4096;
  let B = BOULDERS.get(key);
  if (B !== undefined) return B;
  if (BOULDERS.size > 4096) BOULDERS.clear();
  B = null;
  if (hash2(cx, cy, 221) < 0.42) {
    const h = (k) => hash2(cx, cy, 222 + k);
    const bx = cx * 64 + 20 + 24 * h(0), by = cy * 48 + 18 + 14 * h(1);
    const rw = 9 + 4 * h(2), hb = 4 + Math.floor(h(3) * 4), ty = by - hb;   // half width, face height
    const V = new Float64Array(12), rot = h(4) * 1.047;
    for (let k = 0; k < 6; k++) {
      const a = rot + k * 1.047 + (hash2(cx * 7 + k, cy, 229) - 0.5) * 0.5;
      const r = rw * (0.85 + 0.3 * hash2(cx, cy * 7 + k, 228));
      V[2 * k] = bx + Math.cos(a) * r; V[2 * k + 1] = ty + Math.sin(a) * r * 0.55;
    }
    // which way each side faces (x of its outward normal)
    const NX = new Float64Array(6);
    for (let k = 0; k < 6; k++) {
      const ax = V[2 * k], ay = V[2 * k + 1], ex = V[(2 * k + 2) % 12], ey = V[(2 * k + 3) % 12];
      let nx = ey - ay, ny = ax - ex;
      if (nx * ((ax + ex) / 2 - bx) + ny * ((ay + ey) / 2 - ty) < 0) { nx = -nx; ny = -ny; }
      NX[k] = nx / (Math.hypot(nx, ny) || 1);
    }
    // the crack: a short jagged line in from a corner of the top
    const k0 = Math.floor(h(6) * 6), c0x = V[2 * k0], c0y = V[2 * k0 + 1];
    const C = [c0x, c0y, bx + (c0x - bx) * 0.35 + (h(7) - 0.5) * 4, ty + (c0y - ty) * 0.3 + (h(8) - 0.5) * 2, bx + (h(9) - 0.5) * rw * 0.8, ty + (h(10) - 0.3) * rw * 0.4];
    B = { bx, by, rw, hb, ty, V, NX, C, bed: h(5) < 0.5 };
  }
  BOULDERS.set(key, B);
  return B;
}
// The top's span at column x (in SPAN_T..SPAN_B, SPAN_E the side under it); false if none.
let SPAN_T = 0, SPAN_B = 0, SPAN_E = -1;
function boulderSpan(V, x) {
  let t = Infinity, b = -Infinity, e = -1;
  for (let k = 0; k < 6; k++) {
    const ax = V[2 * k], ay = V[2 * k + 1], ex = V[(2 * k + 2) % 12], ey = V[(2 * k + 3) % 12];
    if ((x < ax) === (x < ex)) continue;
    const y = ay + (ey - ay) * (x - ax) / (ex - ax);
    if (y < t) t = y;
    if (y > b) { b = y; e = k; }
  }
  SPAN_T = t; SPAN_B = b; SPAN_E = e;
  return e >= 0;
}
function boulderIn(B, x, y, face) { return boulderSpan(B.V, x) && y >= SPAN_T && y <= SPAN_B + face; }
function boulderOnSeg(px, py, x0, y0, x1, y1) {
  const dx = x1 - x0, dy = y1 - y0, l2 = dx * dx + dy * dy || 1, t = ((px - x0) * dx + (py - y0) * dy) / l2;
  return t >= 0 && t <= 1 && Math.abs((px - x0) * dy - (py - y0) * dx) / Math.sqrt(l2) < 0.55;
}
function boulderTone(gx, gv) {
  const B = boulderGeo(Math.floor(gx / 64), Math.floor(gv / 48));
  if (!B) return -1;
  const px = gx + 0.5, py = gv + 0.5, hb = B.hb, rw = B.rw;
  if (px < B.bx - rw * 1.2 - 1 || px > B.bx + rw * 1.2 + 4 || py < B.ty - rw * 0.7 - 1 || py > B.by + rw * 0.7 + 3) return -1;
  if (!boulderIn(B, px, py, hb)) return boulderIn(B, px - 3, py - 2, hb) ? 1 : -1;   // its shadow, to the lower right
  const bot = SPAN_B, nx = B.NX[SPAN_E];
  // outline: dark on the lower right, a step lighter on the upper left
  if (!boulderIn(B, px + 1, py, hb) || !boulderIn(B, px, py + 1, hb)) return 0;
  if (!boulderIn(B, px - 1, py, hb) || !boulderIn(B, px, py - 1, hb)) return 1;
  if (py > bot) {
    // the face (a bed line across its middle on some blocks)
    if (B.bed && Math.abs(py - bot - hb / 2 - 0.5) < 0.5) return 1;
    return nx < -0.35 ? 3 : nx > 0.35 ? 1 : 2;
  }
  const C = B.C;
  if (boulderOnSeg(px, py, C[0], C[1], C[2], C[3]) || boulderOnSeg(px, py, C[2], C[3], C[4], C[5])) return 1;
  if (!boulderIn(B, px - 1, py - 1, 0) || !boulderIn(B, px - 1, py, 0)) return 4;     // lit upper-left edge
  if (py + 1 > bot) return nx > 0.35 ? 3 : 4;                                      // lit rim over the face
  return 3;
}
// Broad drifts of finer gravel in the desert's rubble.
function rubbleDrift(gx, gv) { return vnoise(gx / 52, gv / 40, 226) > 0.64; }

// A fine joint in a rock top runs where a noise field c crosses its middle. The band is
// kept about a pixel wide by the field's local slope: a fixed band swelled into a dark
// blob wherever the noise lay flat.
function jointAt(c, gx, gv, sx, sv, seed, band) {
  if (Math.abs(c - 0.5) >= band) return false;
  const s = Math.max(Math.abs(vnoise((gx + 1) / sx, gv / sv, seed) - c), Math.abs(vnoise(gx / sx, (gv + 1) / sv, seed) - c));
  return Math.abs(c - 0.5) < s * 0.6;
}

// fringe: the pixel lies on the outer two pixels of a rubble field (bare unless a stone
// or its shadow is there)
function cliffTopColor(gx, gv, sh, edge, style, fringe) {
  const rugged = !!style && style !== style.toUpperCase();
  if (rugged) style = style.toUpperCase();
  const sand = style === "D";
  if (edge === -3) return sand ? sst(sh ? 0 : 1) : pc("stone", sh ? 0 : 1);
  if (edge === -4) {
    // just inside the back edge of a top that slopes away: a band one step darker than the
    // top (the top rounds off out of sight there); a rubble field instead keeps a lit lip,
    // like the rim over its face, so it reads as raised ground and not as gravel underfoot
    if (rugged) return sand ? sst(sh ? 3 : 4) : pc("stone", Math.max(0, (sh ? 3 : 4) - (style === "G" ? 1 : 0)));
    return sand ? sst(sh ? 1 : 2) : pc("stone", Math.max(0, (sh ? 1 : 2) - (style === "G" ? 1 : 0)));
  }
  // (-5: the line of bed under a rubble field's lit lip)
  if (edge === -5) return sand ? sst(sh ? 1 : 2) : pc("stone", Math.max(0, (sh ? 1 : 2) - (style === "G" ? 1 : 0)));
  // (-10 .. -14: the desert rubble field's short face under its lip, row 0 to 4: beds of
  // dark sandstone and tan, a step darker than the mesas' faces, wandering a pixel up or
  // down along the edge; its last row the dark foot the stones sit on)
  if (edge <= -10) {
    const r = -10 - edge;
    if (r === 4) return sst(0);
    const k = Math.max(0, r - (vnoise(gx / 11, 0.5, 227) > 0.62 ? 1 : 0));
    const t = [[1, 2], [0, 2], [1, 1], [0, 2]][k];
    return (t[0] ? sst(t[1] - (sh ? 1 : 0)) : pc("earth", t[1] - (sh ? 1 : 0)));
  }
  // the rim of the world and the great ridge: rubble right up to the lit lip
  if (rugged && !edge) {
    // (the desert's rubble also carries a few big boulders and broad darker drifts, so a
    // wide band of it has larger forms for the eye to rest on)
    const big = sand && !fringe ? boulderTone(gx, gv) : -1;
    if (big >= 0) return sst(big - (sh && big > 0 ? 1 : 0));
    // (in a drift the stones are smaller and more of the darker bed shows between them)
    const r = rubbleTone(gx, gv, sand ? (rubbleDrift(gx, gv) ? 0.8 : 1.25) : 1);
    if (!(fringe && r === 2)) {
      const t = r - (sh ? 1 : 0) - (style === "G" ? 1 : 0);
      return sand ? sst(t) : pc("stone", Math.max(0, t));
    }
  }
  const lip = edge > 0 ? 1 : 0;
  if (sand) {
    // sandstone: a smooth wind-polished top with a few cracks and scoured pits (the layers
    // belong to the face, so top and face don't read as one striped wall)
    let t = 3;
    const c = vnoise(gx / 22, gv / 14, 86);
    if (jointAt(c, gx, gv, 22, 14, 86, 0.011) && vnoise(gx / 9, gv / 9, 87) > 0.6) t = 2;
    else {
      const cx = Math.floor(gx / 13), cy = Math.floor(gv / 10);
      if (hash2(cx, cy, 88) < 0.2) {
        // a pit: shadowed on its upper rim, lit on its lower one
        const dx = gx - (cx * 13 + 3 + Math.floor(hash2(cx, cy, 89) * 6));
        const dy = gv - (cy * 10 + 3 + Math.floor(hash2(cx, cy, 90) * 4));
        if (dy === 0 && dx >= 0 && dx <= 2) t = 2;
        else if (dy === 1 && dx >= 1 && dx <= 3) t = 4;
      }
    }
    t += lip; if (sh) t -= 1;
    return sst(t);
  }
  // lichen in a few small patches (mossy stone only): dark olive and ochre, never the
  // bright green of the grass (a grass-green patch on a rock top read as a hole)
  if (style !== "M" && style !== "G" && !edge) {
    const m = vnoise(gx / 8, gv / 7, 83);
    if (m > 0.81) return (hash2(gx, gv, 85) < 0.3) ? pc("gold", 1) : pc("green", sh ? 0 : 1);
    if (m > 0.795 && ((gx + gv) & 1)) return pc("green", sh ? 0 : 1);
  }
  // otherwise one calm tone, broken only by fine joints and a scatter of loose stones
  let t = style === "G" ? 2 : 3;
  const c = vnoise(gx / 22, gv / 14, 82);
  if (jointAt(c, gx, gv, 22, 14, 82, 0.012) && vnoise(gx / 9, gv / 9, 84) > 0.62) t -= 1;
  else {
    const cx = Math.floor(gx / 11), cy = Math.floor(gv / 9);
    if (hash2(cx, cy, 88) < 0.24) {
      // a pebble, lit on its upper left, shadowed below right
      const dx = gx - (cx * 11 + 2 + Math.floor(hash2(cx, cy, 89) * 6));
      const dy = gv - (cy * 9 + 2 + Math.floor(hash2(cx, cy, 90) * 4));
      if (dy === 0 && (dx === 0 || dx === 1)) t += 1;
      else if (dy === 1 && (dx === 1 || dx === 2)) t -= 1;
    }
    if (style === "M" && hash2(cx, cy, 91) < 0.05 && gx === cx * 11 + 8 && (gv === cy * 9 + 5 || gv === cy * 9 + 6)) return pc("green", 1);
  }
  t += lip; if (sh) t -= 1;
  return pc("stone", Math.max(0, Math.min(4, t)));
}

// The crack of a wall that can be blown open, per tile column (col = the tile's world
// column): its door-shaped outline (xl, xr per face height h; ht, the top, per column),
// how thick each run of it is (1 or 2 px, thT along the top) and where a run breaks to a
// hairline (brL, brR, brT), three hairlines running off it into the rock (hair) and the
// chips and hairline on the slab (mark); the last two as sets of lx * 64 + h.
const _crackGeo = new Map();
function crackGeo(col) {
  let g = _crackGeo.get(col);
  if (g) return g;
  let n = 0;
  const r = () => hash2(col, n++, 233);
  const sd = Math.floor(r() * 4), Z = [0, 1, 2, 1];
  g = { xl: [], xr: [], ht: [], thL: [], thR: [], thT: [], brL: [], brR: [], brT: [], hair: new Set(), mark: new Set() };
  for (let h = 0; h <= 42; h++) {
    g.xl[h] = 4 + Z[(Math.floor(h / 4) + sd) & 3];
    g.xr[h] = 27 - Z[(Math.floor(h / 4) + sd + 2) & 3];
  }
  for (let x = 0; x < TT; x++) g.ht[x] = 33 - Z[(Math.floor(x / 5) + sd + 1) & 3] - (x <= 6 || x >= 25 ? 1 : 0);
  // runs of 2 to 4 pixels, each 1 or 2 px thick, now and then broken to a hairline
  const runs = (arr, br, len) => {
    for (let i = 0; i < len;) {
      const L = 2 + Math.floor(r() * 3), th = r() < 0.5 ? 1 : 2, b = r() < 0.18;
      for (let k = 0; k < L && i < len; k++, i++) { arr[i] = th; br[i] = b; }
    }
  };
  runs(g.thL, g.brL, 43); runs(g.thR, g.brR, 43); runs(g.thT, g.brT, TT);
  // (the short gap across the top)
  for (const x of [17, 18]) g.thT[x] = 0;
  // hairlines: off the left side low down, off the right side higher up, and up from the top
  const walk = (x, h, dx, dh, steps) => {
    for (let k = 0; k < steps; k++) {
      x += dx; h += dh;
      const q = r();
      if (dx) h += q < 0.3 ? 1 : q < 0.55 ? -1 : 0; else x += q < 0.3 ? 1 : q < 0.55 ? -1 : 0;
      if (x < 0 || x >= TT || h < 1 || h > 41) break;
      g.hair.add(x * 64 + h);
    }
  };
  let h0 = 22 + Math.floor(r() * 6);
  walk(g.xl[h0] - (g.thL[h0] || 1), h0, -1, 0, 3 + Math.floor(r() * 2));
  h0 = 9 + Math.floor(r() * 6);
  walk(g.xr[h0] + (g.thR[h0] || 1) - 1, h0, 1, 0, 3 + Math.floor(r() * 2));
  const x0 = 9 + Math.floor(r() * 5);
  walk(x0, g.ht[x0] + (g.thT[x0] || 1) - 1, 0, 1, 4 + Math.floor(r() * 3));
  // on the slab: a short diagonal hairline and two chips of 2 x 1
  const sx = 9 + Math.floor(r() * 8), sh = 12 + Math.floor(r() * 10);
  for (let k = 0; k < 4; k++) g.mark.add((sx + k) * 64 + (sh - k));
  for (let k = 0; k < 2; k++) { const cx = 8 + Math.floor(r() * 14), ch = 5 + Math.floor(r() * 22); g.mark.add(cx * 64 + ch); g.mark.add((cx + 1) * 64 + ch); }
  _crackGeo.set(col, g);
  return g;
}

function cliffFaceColor(gx, gv, h, off, id, lx, style, topH, mv, off0) {
  // (topH: the height of the top this face stands under; a lower shoulder of a rock has its
  // own lit rim)
  topH = topH || TER.CLIFF;
  if (style) style = style.toUpperCase();
  const rock = (t) => (style === "D" ? sst(t) : pc("stone", Math.max(0, Math.min(4, t))));
  let soot = false;
  // cave mouth: an opening 24 wide x 36 tall (taller than the hero), centred on the tile.
  // Inside, the dirt runs in and darkens a tone every 3 px in solid steps (a few loose
  // pebbles of the step below on each step's edge), then the dark; a 1 px reveal each side
  // (the right one faces the light coming in) and the arch's shaded underside. Its boulder
  // lip is a prop (cavelip); a thin dark edge here keeps it framed without.
  // mv 1: a mouth blown open in a cracked cliff: a ragged hole (its edge breaks by up to
  // 2 px, a little differently every few rows and on each side) in a lip of freshly
  // broken pale stone, a ragged band of soot round it.
  // mv 2: a shop's mouth: only two short steps of floor show under the shop's awning, so
  // the dark doorway stands tall enough to walk into.
  // hr: the height over the tile's bottom row, square to the screen (the same as h on a
  // straight face; see off0 in renderTerrain)
  const hr = h + (off0 || 0);
  if (id === T_CAVE || id === T_GATE) {
    const blown = mv === 1, dx = lx - 15.5, adx = Math.abs(dx), col = Math.floor(gx / TT), side = dx < 0 ? 0 : 1;
    const jag = blown ? Math.round((hash2(col * 2 + side, Math.floor(Math.max(0, hr) / 3), 231) - 0.5) * 4.4) : 0;
    const R = 12 + jag, H0 = 27 + (blown ? Math.round(jag / 2) : 0), HT = 36 + (blown ? jag : 0);
    // the hole's half width at height hh, grown by g px all round
    const halfAt = (hh, g) => hh <= H0 ? R + g : (hh <= HT + g ? (R + g) * Math.sqrt(Math.max(0, 1 - ((hh - H0) / (HT + g - H0)) ** 2)) : -1);
    const top = halfAt(hr, 0);
    if (adx <= top) {
      if (adx > top - 1.2 && hr < H0 + 2) return dx < 0 ? pc("stone", 1) : pc("stone", 3);
      if (hr > HT - 3 - adx * 0.12) return pc("stone", 0);
      const bh = mv === 2 ? 2 : 3, fh = mv === 2 ? 4 : 12;
      if (h < fh) {
        const t = 2 - Math.floor(h / bh);
        const tt = (h % bh === 0 && h > 0 && hash2(gx, h, 236) < 0.14) ? t + 1 : t;
        return tt < 0 ? inkU32() : pc("earth", tt);
      }
      return inkU32();
    }
    if (blown) {
      if (adx <= halfAt(hr, 2) && hr <= HT + 2) return rock(dx < 0 || hr > H0 ? 4 : 3);
      // (the soot: solid, one step darker, 1 to 3 px wide in uneven runs)
      const sw = 1 + Math.floor(hash2(col * 2 + side, hr > HT ? 100 + (lx >> 1) : Math.max(0, hr) >> 1, 234) * 3);
      if (adx <= halfAt(hr, 2 + sw)) soot = true;
    } else if (adx <= top + 1.5 && h <= HT + 1) return pc("stone", 1);
  }
  // a wall that can be blown open: a slab of the cliff's own rock (its mid tone, lit 1 px
  // along its upper-left edge), traced round by a door-shaped crack that steps a pixel in or
  // out every few rows; the crack runs 1 or 2 px wide in uneven runs, broken here and there
  // to a hairline, with a short gap across its top, and three hairlines run off it into
  // the rock (see crackGeo). A chip or two and a hairline mark the slab itself.
  if (id === T_CRACK && h >= 1 && hr >= 0 && hr <= 42) {
    const lxx = ((gx % TT) + TT) % TT, g = crackGeo(Math.floor(gx / TT));
    const t = 2 + (style === "D" ? Math.min(1, off) : off);
    const xl = g.xl[hr], xr = g.xr[hr], ht = g.ht[lxx];
    if (h >= 2 && hr <= ht) {
      if (lxx <= xl && lxx > xl - g.thL[hr]) return g.brL[hr] ? rock(t - 2) : inkU32();
      if (lxx >= xr && lxx < xr + g.thR[hr]) return g.brR[hr] ? rock(t - 2) : inkU32();
    }
    if (lxx > xl && lxx < xr && hr >= ht && hr < ht + g.thT[lxx]) return g.brT[lxx] ? rock(t - 2) : inkU32();
    if (g.hair.has(lxx * 64 + hr)) return rock(t - 2);
    if (lxx > xl && lxx < xr && h >= 2 && hr < ht) {
      if (g.mark.has(lxx * 64 + hr)) return rock(t - 1);
      if (lxx === xl + 1 || hr === ht - 1) return rock(t + 1);
      // (sandstone: the slab carries the cliff's own beds, dropped 2 px as it cracked away)
      if (style === "D") return cliffFaceColor(gx, gv, h - 2, off, T_ROCK, lx, style, topH, 0);
      return rock(t);
    }
  }
  if (soot) {
    const c = cliffFaceColor(gx, gv, h, off, T_ROCK, lx, style, topH, 0);
    return darker(c);
  }
  let t = 2 + off;
  if (style === "D") {
    // sandstone in thick horizontal beds: warm red layers between paler tan ones (a face
    // turned toward the light is only one step brighter: two steps up, its beds went
    // peach and pale tan and read as a glow round the pillar)
    t = 2 + Math.min(1, off);
    const hh = h + 3 * vnoise(gx / 14, 0.5, 89);
    const layer = Math.floor(hh / 7);
    if (hh % 7 < 0.6) t -= 1;
    if (h >= topH - 1) t += 1;
    if (h <= 2) t -= 1;
    // (the pale tan beds stop a step short of the sand's own colours below the top rim)
    return (layer & 1) ? sst(t) : pc("earth", Math.max(0, Math.min(h >= topH - 1 ? 4 : 3, t + 1)));
  }
  // broad weathered columns and a few strata lines; small fissures kept rare
  const col = vnoise(gx / 5, 0.5, 84), band = vnoise(gx / 9, h / 12, 85);
  if (col > 0.7) t += 1;
  else if (col < 0.2) t -= 1;
  if (Math.abs(band - 0.5) < 0.022) t -= 1;
  if (h >= topH - 1) t += 1;                            // lit rim under the top edge
  if (h <= 2) t -= 1;                                        // contact darkening
  if (style === "G") t -= 1;
  return pc("stone", Math.max(0, Math.min(4, t)));
}

// Water pouring down a cliff face: broken vertical streaks, a bright lip, foam at the foot.
// ff: the tile's place in a run of falls (index | width << 2); the sheet is as wide as
// the channel above it.
function waterfallColor(gx, h, lx, ff) {
  const u = (ff & 3) * TT + lx, [x0, x1] = streamLipEdges(ff >> 2);
  if (u < x0 || u > x1) return 0;
  if (u === x0 || u === x1) return pc("water", 1);            // the sheet's edges
  if (h <= 4) return (hash2(gx, h, 98) < 0.55) ? pc("white", 0) : pc("water", 4);   // foam at the foot
  if (h >= TER.CLIFF - 2) return pc("water", 4);             // the bright lip
  const run = Math.floor((h + (gx * 7) % 11) / 6);
  const s = hash2(gx, run, 97);
  return pc("water", s < 0.25 ? 4 : s > 0.8 ? 2 : 3);
}

// Where a channel meets the lip of its falls, in run-local x (n = tiles in the run).
function streamLipEdges(n) { const w = n === 1 ? 7 : 11; return [w, n * TT - 1 - w]; }

// Is (u, sv) water, in stream-local pixels: u across the run, sv down from the head.
// A round basin at the head, then a channel whose banks wander and settle at the lip.
function streamInside(u, sv, n, len) {
  const span = n * TT, mid = (span - 1) / 2;
  const bx = (u - mid) / (mid - 2), by = (sv - 14) / 10;
  if (bx * bx + by * by + (vnoise(u / 5, sv / 4, 93) - 0.5) * 0.35 <= 1) return true;
  if (sv < 14 || sv >= len + 8) return false;           // (a ragged lip may overhang the tile)
  const [w0, e0] = streamLipEdges(n);
  const settle = Math.max(0, Math.min(1, (len - 6 - sv) / 16));
  const a = Math.round((vnoise(sv / 10, n, 94) - 0.5) * 9 * settle);
  const b = Math.round((vnoise(sv / 10, n + 5, 95) - 0.5) * 9 * settle);
  return u >= w0 + a && u <= e0 + b;
}

// The spring on a ridge top and the channel carrying it to the falls.
// st (see world.js): row from the head | rows << 2 | index << 4 | width << 6.
// sv: v within the tile (may run past it where a ragged edge spills over).
// Returns 0 where the plain rock top shows.
function streamTopColor(gx, gv, lx, lv, st, sh) {
  const n = (st >> 6) & 3, len = ((st >> 2) & 3) * TT;
  const u = ((st >> 4) & 3) * TT + lx, sv = (st & 3) * TT + lv;
  const at = (a, b) => streamInside(a, b, n, len);
  if (!at(u, sv)) {
    // wet stone around the water
    return at(u - 2, sv) || at(u + 2, sv) || at(u, sv - 2) || at(u, sv + 2) ? pc("stone", sh ? 0 : 1) : 0;
  }
  if (!at(u - 1, sv) || !at(u + 1, sv) || !at(u, sv - 1) || !at(u, sv + 1)) return pc("water", 3);   // shallows
  // the spring: a dark upwelling ringed by lighter water, bubbles breaking the surface
  const mid = (n * TT - 1) / 2;
  const d = Math.hypot(u - mid - 4, (sv - 12) * 1.3);
  if (d < 2.6) return pc("water", 1);
  if (d < 3.8 && hash2(gx, gv, 99) < 0.5) return pc("water", 3);
  if (d < 8 && hash2(gx, gv, 100) < 0.04) return pc("white", 0);
  // the lip: the water quickens and whitens where it tips over
  const toLip = len - sv;
  if (toLip <= 5) return hash2(gx, gv, 101) < (6 - toLip) * 0.14 ? pc("white", 0) : pc("water", 4);
  // flat water with short ripples, more of them as it nears the falls
  const cx = Math.floor(u / 7), cy = Math.floor(sv / 5);
  if (hash2(cx, cy, 96) < 0.22 + Math.max(0, sv - 24) / 120) {
    const ox = cx * 7 + 1 + Math.floor(hash2(cx, cy, 97) * 3), oy = cy * 5 + 2;
    if (sv === oy && u >= ox && u <= ox + 2) return pc("water", u === ox + 1 && hash2(cx, cy, 98) < 0.5 ? 4 : 3);
  }
  return pc("water", sh ? 1 : 2);
}

function bankColor(gx, h) {
  let t = h >= -1 ? 2 : 1;
  if (vnoise(gx / 3, h / 2, 91) > 0.7) t += 1;
  return pc("earth", t);
}

// Bridge and dock decks. pk (per tile, see plankInfo in renderTerrain): run "x" for a
// deck crossed east-west (boards run north-south, so their seams stand upright), "y" for
// one crossed north-south; eN/eS/eW/eE: that edge faces open water and carries a beam.
// Boards: 7 px + a 1 px gap across an east-west run; 5 px + gap on a north-south one
// (8 ground units at the camera's angle), whose gaps are a softer brown so the deck
// never reads as a ladder. A board's left (top) edge catches the light, two nails hold
// each end over the beams underneath. The deck stands 2 px proud: its beams get the lit
// rim on their west and south sides, a dark one east and north.
function plankColor(gx, gv, lx, lv, pk, sh) {
  let t;
  if (pk.eS && lv > 28 + DECK_EXT) t = lv === 31 + DECK_EXT ? 3 : lv === 29 + DECK_EXT ? 1 : 2;
  else if (pk.eN && lv < 3) t = lv === 0 ? 1 : lv === 2 ? 1 : 2;
  else if (pk.eW && lx < 3) t = lx === 0 ? 3 : lx === 2 ? 1 : 2;
  else if (pk.eE && lx > 28) t = lx === 31 ? 1 : lx === 29 ? 1 : 2;
  else {
    const ew = pk.run === "x", along = ew ? gx : gv, P = ew ? 8 : 6;
    const b = Math.floor(along / P), k = ((along % P) + P) % P;
    const hv = hash2(b, ew ? 7 : 8, 101);
    t = ew ? (hv < 0.25 ? 2 : hv > 0.9 ? 4 : 3) : (hv < 0.2 ? 4 : 3);
    if (k === 0) t = ew ? 0 : 2;                             // the gap between boards
    else if (ew && k === 1) t = Math.min(4, t + 1);          // lit edge (left)
    else if (ew && k === P - 1) t -= 1;                      // shaded edge
    const cross = ew ? lv : lx;
    // nails over the beams (both ends of an upright board; one end of a crosswise board,
    // alternating, so a north-south deck never reads as a ladder or a drawer front)
    const nail = ew ? (cross === 4 || cross === (pk.eS ? 27 + DECK_EXT : 27)) : cross === ((b & 1) ? 27 : 4);
    if (k === (P >> 1) && nail) t = 0;
  }
  if (sh) t -= 1;
  return pc("earth", Math.max(0, Math.min(4, t)));
}
// The deck's front edge where it faces the camera (h: 1 down to -5, water at -6): the
// beam's face, then the shade under the deck with the piles standing in it. A pile at
// each end of the front and one in the middle of every tile.
function plankFaceColor(gx, h, lx, pk) {
  if (h >= 1) return pc("earth", 2);
  if (h === 0) return pc("earth", 1);
  if (h === -1) return pc("earth", 0);
  const p0 = (pk && pk.pw && lx >= 2 && lx <= 4) ? 2 : (pk && pk.pe && lx >= 27 && lx <= 29) ? 27 : (lx >= 14 && lx <= 16) ? 14 : -1;
  if (p0 >= 0) return pc("earth", lx === p0 ? 2 : lx === p0 + 2 ? 0 : 1);
  return pc("water", 0);
}

// Secret stairs: a stairwell in a raised curb of four dressed stones, three treads going
// down north into the dark, each a pixel narrower on either side than the one before.
// The curb's lips facing the light are pale; the west and north curbs throw their shade
// into the well (its side walls face sideways and never show: the shade is the depth).
// Returns a packed colour, 0 = leave the ground, -1 = the ground in the curb's own shadow
// (it stands proud, so it casts 2 px to the lower right).
function stairsColor(lx, lv) {
  const X0 = 2, X1 = 29, Y0 = 3, FY = 28;                 // curb top x 2..29, y 3..27; front 28..29
  if ((lx >= X1 + 1 && lx <= X1 + 2 && lv >= Y0 + 2 && lv <= FY + 3) || (lv >= FY + 2 && lv <= FY + 3 && lx >= X0 + 2 && lx <= X1 + 2)) return -1;
  if (lx < X0 || lx > X1 || lv < Y0 || lv > FY + 1) return 0;
  const wx0 = 6, wx1 = 25, wy0 = 6, wy1 = 24;             // the well inside the curb
  if (lv >= FY) {                                          // the curb's front face
    if (lx === X0 || lx === X1) return pc("stone", 0);
    return pc("stone", lv === FY ? 2 : 1);
  }
  if (!(lx >= wx0 && lx <= wx1 && lv >= wy0 && lv <= wy1)) {
    if (lv === Y0 || lx === X0) return pc("stone", 4);     // outer rim toward the light
    if (lx === X1) return pc("stone", 1);                  // outer rim away from it
    if (lv === wy1 + 1 && lx >= wx0 && lx <= wx1) return pc("stone", 4);   // near lip of the well
    if (lx === wx1 + 1 && lv >= wy0 && lv <= wy1) return pc("stone", 4);   // east lip faces the light
    if (lx === wx0 - 1 && lv >= wy0 && lv <= wy1) return pc("stone", 2);
    if (lv === wy0 - 1 && lx >= wx0 && lx <= wx1) return pc("stone", 2);
    // joints: four stones
    if (((lx === 15 || lx === 16) && (lv < wy0 || lv > wy1)) || (lv === 15 && (lx < wx0 || lx > wx1))) return pc("stone", 2);
    return pc("stone", 3);
  }
  const up = wy1 - lv;                                     // 0 at the near (bottom) row
  const bands = [[0, 6, 2, 0], [6, 11, 1, 1], [11, 15, 0, 2]];
  let tr = null;
  for (const b of bands) if (up >= b[0] && up < b[1]) tr = b;
  if (!tr) return inkU32();                                // the far end: darkness
  const [a, b, t, inset] = tr;
  const x0 = wx0 + inset, x1 = wx1 - inset;
  if (lx < x0) return inset ? pc("stone", 0) : inkU32();   // narrowed-off side, in shade
  if (lx > x1) return pc("stone", 1);
  if (lx < x0 + 2) return lx === x0 ? inkU32() : pc("stone", Math.max(0, t - 2));   // the west curb's shade
  if (up === b - 1) return pc("stone", Math.min(4, t + 1));  // lit nosing (far edge of the tread)
  if (up === a && a > 0) return pc("stone", Math.max(0, t - 1));   // contact shade at its near edge
  return pc("stone", t);
}

// ---------- dungeon ----------
// Floors: large calm flagstones (32x16, running bond) in a neutral ramp, so the
// themed walls frame the room and actors stay readable on top.
function floorColor(ramp, gx, gv, sh) {
  const row = Math.floor(gv / 16);
  const ox = (row & 1) ? 16 : 0;
  const sx = Math.floor((gx + ox) / 32);
  const lx = (((gx + ox) % 32) + 32) % 32, ly = ((gv % 16) + 16) % 16;
  let t = 2;
  const dark = hash2(sx, row, 111) < 0.18;
  if (dark) t = 1;
  // (a darker flag keeps its joints a step darker again: with joints of its own tone, two
  // or three of them side by side on a narrow ledge read as one flat plate)
  if (lx === 0 || ly === 0) t = dark ? 0 : 1;
  else if ((lx === 1 || ly === 1) && hash2(sx, row, 113) < 0.5) t = 3;
  else if (hash2(gx, gv, 112) < 0.02) t = 1;
  if (sh) t -= 1;
  return pc(ramp, Math.max(0, Math.min(4, t)));
}

// Ice: a thin slab laid on the floor. Its north and west rims catch the light (1 px
// white), its south edge shows a 2 px front lip with pale drips hanging from it at uneven
// spacings of 6 to 10 px (each 2 px on the floor below, a darker tip; see iceDrip), the
// east rim is a step darker. On top: one calm pale tone, glint streaks in pairs of
// unequal length (3 to 7 px across, steep or shallow), and a short straight crack now and then,
// dark with a pale lit side on its upper left, kept well clear of anything standing by
// the ice. Nothing round, nothing wiggly, no blotches.
// rim: bit 1 north, 2 west, 4 south, 8 east edge of the whole sheet. ok(gx, gv): may a
// crack lie on this pixel (see renderTerrain).
function iceColor(gx, gv, lx, lv, sh, rim, ok) {
  if ((rim & 4) && lv >= 30) return pc("water", lv === 30 ? 2 : (iceDrip(gx) ? 2 : 1));
  if (((rim & 1) && lv === 0) || ((rim & 2) && lx === 0)) return sh ? pc("water", 4) : pc("white", 0);
  if ((rim & 8) && lx === 31) return pc("water", 3);
  const f = iceFeature(gx, gv, ok);
  if (f === 2) return pc("water", sh ? 1 : 2);             // crack
  if (f === 1 || f === 3) return sh ? pc("water", 4) : pc("white", 0);   // glint / crack's lit side
  const lo = sh ? 3 : 4;
  // a faint crack deep inside the sheet (it shows the ice's thickness)
  if (f === 4) return pc("water", lo - 1);
  // the sheet's front edge a step darker (its last 2 px, with 2 px of checker above them),
  // so the flat top turns down into the lip
  if ((rim & 4) && lv >= 26) return lv >= 28 || ((gx + gv) & 1) ? pc("water", lo - 1) : pc("water", lo);
  // reflections running across it on the slant, a step lighter: a band 3 to 5 px wide and
  // a 1 px line beside it, at most one pair in every 150 px, some left out (so they never
  // stand in a row like window panes; they run on from sheet to sheet)
  const u = gx + gv, bn = Math.floor(u / 150), p = u - bn * 150;
  if (hash2(bn, 0, 199) < 0.3) return pc("water", lo);
  const bw = 3 + Math.floor(hash2(bn, 1, 197) * 3);
  if (p < bw || p === bw + 2) return sh ? pc("water", 4) : pc("white", 0);
  return pc("water", lo);
}
// 0 plain ice, 1 a glint streak, 2 a crack, 3 the crack's lit side, 4 a faint crack deep inside.
// Each tile of ice owns one glint pair and every other tile a crack; a feature may reach
// into the neighbouring tiles. Each tile's own 32 x 32 map of features is drawn once (from
// its own and its eight neighbours' features) and kept. A crack any of whose pixels may
// not lie there (ok false: too near the sheet's edge, where things stand) is left out
// whole, in every tile it reaches.
const _iceTiles = new Map();
function iceFeature(gx, gv, ok) {
  const tx = Math.floor(gx / TT), ty = Math.floor(gv / TT), key = tx * 4096 + ty;
  let m = _iceTiles.get(key);
  if (!m) {
    if (_iceTiles.size > 4000) _iceTiles.clear();
    m = new Uint8Array(TT * TT);
    const put = (x, y, f) => {
      const lx = x - tx * TT, ly = y - ty * TT;
      if (lx < 0 || ly < 0 || lx >= TT || ly >= TT) return;
      const o = ly * TT + lx, c = m[o];
      // (a crack wins over a glint, a glint over a crack's lit side)
      if (f === 2 || (f === 1 && c !== 2) || ((f === 3 || f === 4) && !c)) m[o] = f;
    };
    for (let j = ty - 1; j <= ty + 1; j++) for (let i = tx - 1; i <= tx + 1; i++) {
      const r = (k) => hash2(i, j, 190 + k);
      // glints: two parallel 1 px streaks 2 px apart, the second shorter; steep (1 across
      // per 1 down) or shallow (2 across per 1 down)
      if (r(0) < 0.85) {
        const sx = i * TT + 4 + Math.floor(r(1) * 18), sy = j * TT + 3 + Math.floor(r(2) * 18);
        const flat = r(10) < 0.45, L = flat ? 4 + Math.floor(r(3) * 4) : 3 + Math.floor(r(3) * 5), L2 = Math.max(3, L - 1 - Math.floor(r(9) * 3));
        const at = (k) => flat ? [k, k >> 1] : [k, k];
        for (let k = 0; k < L; k++) { const [a, b] = at(k); put(sx + a, sy + b, 1); }
        // (the second streak beside the first: 2 px to the right of a steep one, 2 px under a
        // shallow one, starting a little further along)
        const [ox, oy] = flat ? [2, 2] : [3, 1];
        if (r(11) < 0.85) for (let k = 0; k < L2; k++) { const [a, b] = at(k); put(sx + ox + a, sy + oy + b, 1); }
      }
      // a crack: one straight segment per two tiles (never along the glints' slant)
      if (r(4) < 0.5) {
        const x0 = i * TT + 4 + r(5) * 24, y0 = j * TT + 4 + r(6) * 24;
        const ang = [0, 0.35, 1.25, 1.57, 1.9, 2.6, 2.8][Math.floor(r(7) * 7)], L = 9 + r(8) * 8;
        const vx = Math.cos(ang) * L, vy = Math.sin(ang) * L, l2 = vx * vx + vy * vy;
        const on = (px, py) => {
          const t = ((px + 0.5 - x0) * vx + (py + 0.5 - y0) * vy) / l2;
          if (t < 0 || t > 1) return false;
          return Math.max(Math.abs(x0 + vx * t - px - 0.5), Math.abs(y0 + vy * t - py - 0.5)) < 0.5;
        };
        const bx0 = Math.floor(Math.min(x0, x0 + vx)) - 2, bx1 = Math.ceil(Math.max(x0, x0 + vx)) + 2;
        const by0 = Math.floor(Math.min(y0, y0 + vy)) - 2, by1 = Math.ceil(Math.max(y0, y0 + vy)) + 2;
        const px = [];
        for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
          if (on(x, y)) px.push([x, y, 2]);
          else if (on(x + 1, y + 1) || (on(x + 1, y) && !on(x, y + 1))) px.push([x, y, 3]);
        }
        if (!ok || px.every(([x, y]) => ok(x, y))) for (const [x, y, f] of px) put(x, y, f);
      }
      // a faint crack deep inside the sheet, in about every other tile: a longer line with
      // one bend, only a step darker than the ice (under the surface: things may stand on it)
      if (r(12) < 0.45) {
        let x = i * TT + 3 + r(13) * 26, y = j * TT + 3 + r(14) * 26;
        const a0 = [0.12, 1.35, 2.35, 2.95][Math.floor(r(15) * 4)];
        for (let s = 0; s < 2; s++) {
          const ang = a0 + (s ? (r(16) - 0.5) * 1.2 : 0), L = 6 + r(17 + s) * 8, dx = Math.cos(ang), dy = Math.sin(ang);
          for (let k = 0; k < L; k++) put(Math.round(x + dx * k), Math.round(y + dy * k), 4);
          x += dx * L; y += dy * L;
        }
      }
    }
    _iceTiles.set(key, m);
  }
  return m[(gv - ty * TT) * TT + (gx - tx * TT)];
}
// Drips under an ice sheet's front lip: one in every 8 px, set 1 px left or right of the
// middle, so they hang 6 to 10 px apart.
function iceDrip(gx) { const c = Math.floor(gx / 8); return gx - c * 8 === 3 + Math.round((hash2(c, 5, 195) - 0.5) * 2.9); }

// Lava: broad plates of cooled crust (near-black red, a dark brown bevel on the edges that
// face the light) drifting on the molten rock, which shows only in
// the cracks between them: a thin thread of gold along most seams, and here and there a
// wider river of gold with a white-hot core, a darker gold edge and a red glow on the crust
// beside it. Dark crust and bright cracks, with no mid orange over any area (that read as
// wood grain or marble, and matched the orange brick walls): it is the brightest, hottest
// thing in its room. Its cooled rim is laid on by finishRoom.
// Returns the colour; seam (optional array) receives 1 on a crack's bright core and 2 on
// a white-hot one (the pixels the live layer makes shimmer). fine: a small pool, whose
// plates are smaller and whose rivers are narrower.
// (plates: one per 22 x 15 px cell at a random spot in it, counted a little longer across
// the flow than along it, so they are drawn out sideways)
const LAVA_CX = 22, LAVA_CY = 15, LAVA_SY = 1.3;
function lavaSiteX(i, j) { return (i + 0.2 + hash2(i, j, 312) * 0.6) * LAVA_CX; }
function lavaSiteY(i, j) { return (j + 0.2 + hash2(i, j, 313) * 0.6) * LAVA_CY; }
function lavaColor(gx, gv, seam, fine) {
  // (a slow warp, so the plates' edges wander instead of running straight)
  const k = fine ? 1.8 : 1, X = gx * k, V = gv * k;
  const wx = X + (vnoise(X / 26, V / 20, 310) - 0.5) * 12;
  const wv = V + (vnoise(X / 22, V / 17, 311) - 0.5) * 9;
  const ci = Math.floor(wx / LAVA_CX), cj = Math.floor(wv / LAVA_CY);
  // the plate this pixel lies on (the nearest site)
  let best = Infinity, bi = 0, bj = 0, bx = 0, by = 0;
  for (let j = cj - 1; j <= cj + 1; j++) for (let i = ci - 1; i <= ci + 1; i++) {
    const sx = lavaSiteX(i, j), sy = lavaSiteY(i, j), dx = wx - sx, dy = (wv - sy) * LAVA_SY, d = dx * dx + dy * dy;
    if (d < best) { best = d; bi = i; bj = j; bx = sx; by = sy; }
  }
  // e: how far it lies inside the plate's nearest edge; the plate across that edge lies
  // in the direction (ux, uy)
  let e = Infinity, ni = 0, nj = 0, ux = 0, uy = 0;
  // (the sites keep to the middle 60% of their cells, so the plates that border this one
  // are all but always among its eight neighbours)
  for (let j = bj - 1; j <= bj + 1; j++) for (let i = bi - 1; i <= bi + 1; i++) {
    if (i === bi && j === bj) continue;
    const sx = lavaSiteX(i, j), sy = lavaSiteY(i, j), vx = sx - bx, vy = (sy - by) * LAVA_SY, l = Math.hypot(vx, vy);
    const d = (((sx + bx) / 2 - wx) * vx + ((sy + by) / 2 - wv) * LAVA_SY * vy) / l;
    if (d < e) { e = d; ni = i; nj = j; ux = vx / l; uy = vy / l; }
  }
  e /= k;
  // what runs along that edge (the same for the plates on both sides of it): one in seven
  // is fused shut, most are a thread of gold that swells and pinches along its length,
  // three in ten are a river 2 to 4 px wide
  const ka = bi * 7919 + bj, kb = ni * 7919 + nj;
  const h = hash2(Math.min(ka, kb), Math.max(ka, kb), 314), sw = vnoise(gx / 8, gv / 8, 315);
  // (in a small pool a river is only a thicker thread: a wide one there filled it)
  const w = h < 0.14 ? 0 : h < 0.7 ? 0.7 + sw * 1.1 : fine ? 1.2 + sw * 0.9 : 1.8 + sw * 2.2;
  const river = !fine && w >= 1.8, t = e - w / 2;
  if (w >= 0.9 && t < 0) {
    if (seam) seam[0] = 1;
    if (w >= 2.6 && t < -0.9) { if (seam) seam[0] = 2; return pc("white", 0); }
    return pc("gold", 3);
  }
  if (river && t < 1) return pc("gold", 2);
  // (the crust's edge glows red beside a crack, a little wider beside a river)
  const glow = river ? 2.2 : w >= 0.9 ? 1 : 0.6;
  if (t < glow) return pc("red", 1);
  // (the plates are thick slabs: the edges that face the light are lit, dark brown)
  if (t < glow + 2.2 && ux + uy < -0.5) return pc("earth", 1);
  return pc("red", 0);
}
// Floor switch: a square stone plate with a sunk gold boss, lit on its upper-left rim.
function switchColor(lx, lv, sh) {
  if (lx < 5 || lx > 26 || lv < 5 || lv > 26) return 0;
  const e = Math.min(lx - 5, 26 - lx, lv - 5, 26 - lv);
  if (e === 0) return pc("neutral", (lx === 5 || lv === 5) ? 4 : 1);
  const r = Math.hypot(lx - 15.5, lv - 15.5);
  if (r < 4.5) return pc("gold", r < 2.5 ? 3 : 2);
  if (r < 5.5) return pc("gold", 1);
  return pc("neutral", sh ? 2 : 3);
}

// House floors: boards running east-west, random lengths, a lit upper edge per board.
function plankFloorColor(gx, gv, sh, shift) {
  const row = Math.floor(gv / 12), ly = ((gv % 12) + 12) % 12;
  const len = 40 + Math.floor(hash2(row, 7, 141) * 48);
  const off = Math.floor(hash2(row, 9, 142) * len);
  const bx = Math.floor((gx + off) / len), lx = (((gx + off) % len) + len) % len;
  let t = hash2(bx, row, 143) < 0.3 ? 2 : 3;
  if (ly === 11 || lx === 0) t = 1;
  else if (ly === 0 && t === 2) t = 3;
  else if (hash2(gx >> 2, gv, 144) < 0.05) t -= 1;
  if (sh) t -= 1;
  t += shift || 0;
  return pc("earth", Math.max(0, Math.min(4, t)));
}

// Wall tops stay a step darker than the lit rim so the eye rests on the floor.
function wallTopColor(theme, gx, gv, x, v, h, sh, edge) {
  const row = Math.floor(gv / 16);
  const ox = (row & 1) ? 16 : 0;
  const bx = (((gx + ox) % 32) + 32) % 32, by = ((gv % 16) + 16) % 16;
  let t = 2;
  if (bx === 0 || by === 0) t = 1;
  else if (hash2(Math.floor((gx + ox) / 32), row, 121) < 0.25) t = 1;
  if (edge > 0) t = 3;
  else if (edge < 0) t = 1;
  if (sh) t -= 1;
  return pc(theme, Math.max(0, Math.min(4, t)));
}

function wallFaceColor(theme, gx, gv, h, wh, tx, ty) {
  const course = Math.floor(h / 8);
  const off = (course & 1) ? 8 : 0;
  const bx = (((gx + off) % 16) + 16) % 16, by = h % 8;
  let t = 1;
  if (hash2(Math.floor((gx + off) / 16), course, 131) < 0.35) t = 2;
  if (bx === 0 || by === 7) t = 0;
  if (h >= wh - 1) t = 3;
  else if (h <= 2) t = Math.max(0, t - 1);
  return pc(theme, t);
}

function doorwayColor(theme, tx, ty, lx, lv, gx, gv, sh) {
  // passages fade into darkness toward the outer edge of the room
  let depth;
  if (ty < 2) depth = (ty * TT + lv) / 64;             // 0 = outer edge
  else if (ty > 8) depth = 1 - ((ty - 9) * TT + lv) / 64;
  else if (tx < 2) depth = (tx * TT + lx) / 64;
  else depth = 1 - ((tx - 14) * TT + lx) / 64;
  if (depth < 0.3) return inkU32();
  if (depth < 0.55) return pc(theme, 0);
  return floorColor(theme, gx, gv, true);
}

// The inner face of anything below the floor, seen on its north side (h: -1 at the
// floor's edge, down to -16 in a pit, -14 to the water or lava). kind: "pit", "pool" or
// "lava". Laid in courses 4 px deep with head joints every 12 px.
// Pit: the room's wall stone stepping darker from the tone just darker than the floor's,
// black below.
// Pool: the floor's own stone, darkening down to the water line (an island's front is
// the same face, so both stand the same depth).
// Lava: the wall stone darkening down into the heat, its bottom 4 px lit a deep red by the
// glow from below.
const _pitTop = new Map();
function pitTop(theme, floorRamp) {
  const key = theme + "/" + floorRamp;
  let t = _pitTop.get(key);
  if (t === undefined) {
    const fl = lumOf(pc(floorRamp, 2));
    t = 0;
    for (let k = rampLen(theme) - 1; k >= 0; k--) if (lumOf(pc(theme, k)) < fl - 1) { t = k; break; }
    _pitTop.set(key, t);
  }
  return t;
}
function moatFaceColor(theme, gx, h, kind, floorRamp) {
  const d = -h;
  const course = Math.floor((d - 1) / 4), row = (d - 1) % 4;
  const joint = ((gx + (course & 1 ? 6 : 0)) % 12 + 12) % 12 === 0;
  const top = rampLen(theme) - 1;
  if (kind === "pool") {
    const fr = floorRamp || theme;
    if (d <= 1) return pc(fr, Math.min(rampLen(fr) - 1, 3));
    let t = [3, 2, 1, 0][Math.min(3, course)];
    if (row === 0 || joint) t -= 1;
    return t < 0 ? pc(fr, 0) : pc(fr, t);
  }
  if (kind === "lava") {
    // (its foot lit by the glow from below, but never brighter than the lava itself, so
    // the pool never reads as a box with a pale lid)
    if (d >= 13) return pc("red", 2);
    if (d >= 11) return pc("red", 1);
    if (d === 10) return ((gx + d) & 1) ? pc("red", 1) : inkU32();
    if (d <= 1) return pc(theme, Math.min(top, 2));
    let t = [2, 1, 0][Math.min(2, course)];
    if (row === 0 || joint) t -= 1;
    return t < 0 ? inkU32() : pc(theme, t);
  }
  // (its first course is the wall stone's tone just darker than the floor, so the far edge
  // never reads as a raised lip)
  const s0 = pitTop(theme, floorRamp || theme);
  if (d <= 1) return pc(theme, s0);
  if (d >= 13) return inkU32();
  let t = s0 - Math.min(3, course);
  if (row === 0 || joint) t -= 1;
  return t < 0 ? inkU32() : pc(theme, t);
}

// ---------- animated water layer ----------
// Still water: calm base tone with short ripple crests that drift sideways, rows in
// either direction. Ripple rows sit at uneven spacings, each with its own dash count,
// lengths and drift direction, so no cloth-like grid shows.
// One tile covers the whole play area (a small tile repeated across the screen lined its
// glints up in a grid), and the ripples wrap at its edges, so they run on across screens.
// Every ripple has its own place anywhere along its row (a whole row sliding by a quarter
// period per frame forced the row to repeat every 128px): it rises, stretches and slides
// a couple of pixels with the row's drift, fades, and rests for a frame before it rises
// again at its own place, each on its own beat, so four frames still loop without a jump.
const WATER_TILE = { w: 512, h: 352 };
function makeWaterFrames() {
  const W = WATER_TILE.w, Hh = WATER_TILE.h;
  const rows = [];
  for (let y = 2; y < Hh - 3; y += 6 + Math.floor(hash2(y, 0, 166) * 8)) rows.push(y);
  const frames = [];
  for (let f = 0; f < 4; f++) {
    const p = new Pix(W, Hh);
    p.d.fill(pc("water", 2));
    rows.forEach((ry, i) => {
      if (hash2(i, 9, 172) < 0.15) return;                         // some rows stay calm
      const dir = hash2(i, 2, 168) < 0.5 ? 1 : -1;
      const nd = 2 + Math.floor(hash2(i, 3, 169) * 22);
      for (let k = 0; k < nd; k++) {
        const q = (f + Math.floor(hash2(i, 40 + k, 174) * 4)) & 3;
        if (q === 3) continue;                                         // resting
        const len0 = 2 + Math.floor(hash2(i, 20 + k, 171) * 4), glint = hash2(i, 30 + k, 173) < 0.3;
        const len = q === 1 ? len0 : Math.max(2, len0 - 1);
        const st = Math.floor(hash2(i, 10 + k, 170) * W) + dir * q * 2;
        for (let j = 0; j < len; j++) {
          const x = ((st + j) % W + W) % W;
          // only a few ripples carry a bright glint, and only at their fullest
          p.d[ry * W + x] = pc("water", (glint && j === 1 && q === 1) ? 4 : 3);
          if (j > 0 && j < len - 1) p.d[(ry + 1) * W + x] = pc("water", 1);
        }
      }
    });
    frames.push(p.toCanvas());
  }
  return frames;
}
