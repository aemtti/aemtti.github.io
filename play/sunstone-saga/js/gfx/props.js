"use strict";
// ---------- Static props: model, sprite box, anchor, baked shadow ----------
// Anchors are ground contact points. `oy` is the anchor's offset inside its tile
// (from the tile's top edge); it is also the prop's depth-sort key within the tile.
// shadow: [dx, dv, rx, rv] ellipse baked into the terrain, offset toward the lower right.

const PORTAL_MATS = [["stoneL", "gold"], ["dstone", "teal"], ["purple", "red"], ["stoneL", "moss"], ["dune", "gold"], ["white", "teal"], ["dstone", "ember"]];

const PROP_DEFS = {
  tree:    { variants: 3, w: 56, h: 84, ax: 28, ay: 76, oy: 27, shadow: [10, 3, 15, 7], make: v => ({ prims: treePrims(v) }) },
  pine:    { variants: 2, w: 48, h: 92, ax: 24, ay: 84, oy: 27, shadow: [9, 3, 12, 6], make: v => ({ prims: pinePrims(v) }) },
  deadtree: { variants: 2, w: 48, h: 72, ax: 24, ay: 64, oy: 27, shadow: [8, 3, 10, 4], make: v => ({ prims: deadTreePrims(v) }) },
  // dungeon mouths: 0 barrow, 1 tidal, 2 keep, 3 warren, 4 sunscar, 5 rimewell, 6 cinder
  portal:  { variants: 7, w: 64, h: 76, ax: 32, ay: 60, oy: 32, sortOy: 33, shadow: [0, 0, 0, 0], make: v => ({ prims: portalPrims(PORTAL_MATS[v][0], PORTAL_MATS[v][1]) }) },
  sealed:  { variants: 7, w: 64, h: 76, ax: 32, ay: 60, oy: 32, sortOy: 33, shadow: [0, 0, 0, 0], make: v => ({ prims: portalPrims(PORTAL_MATS[v][0], PORTAL_MATS[v][1], true) }) },
  // the Shadow Keep's gate (0 open, 1 sealed until the six shards break the seal,
  // 2 sealed and glowing once four are found)
  keepgate: { variants: 3, w: 132, h: 112, ax: 66, ay: 100, oy: 32, sortOy: 33, shadow: [0, 0, 0, 0], make: v => ({ prims: keepGatePrims(v >= 1, v === 2) }) },
  shopsign: { variants: 1, w: 56, h: 64, ax: 20, ay: 56, oy: 32, sortOy: 33, shadow: [0, 0, 0, 0], make: () => shopSignPrims() },
  bush:    { variants: 2, w: 40, h: 32, ax: 20, ay: 26, oy: 22, shadow: [5, 2, 12, 5], make: v => ({ prims: bushPrims(v) }) },
  boulder: { variants: 6, w: 40, h: 32, ax: 20, ay: 26, oy: 22, shadow: [6, 2, 13, 5], make: v => ({ prims: boulderPrims(v) }) },
  grave:   { variants: 2, w: 32, h: 40, ax: 16, ay: 32, oy: 24, shadow: [6, 2, 10, 4], make: v => gravePrims(v) },
  graveTilt: { variants: 1, w: 36, h: 40, ax: 18, ay: 32, oy: 24, shadow: [7, 2, 11, 4], make: () => gravePrims(2) },
  cactus:  { variants: 2, w: 36, h: 44, ax: 18, ay: 36, oy: 24, shadow: [6, 2, 8, 3], make: v => ({ prims: cactusPrims(v) }) },
  stump:   { variants: 1, w: 28, h: 24, ax: 14, ay: 18, oy: 20, shadow: [4, 1, 9, 4], make: () => ({ prims: stumpPrims() }) },
  // one guardian statue per dungeon (by its number), 0 on the overworld
  statue:  { variants: 8, w: 44, h: 64, ax: 22, ay: 52, oy: 22, shadow: [6, 2, 13, 6], make: v => statuePrims(v) },
  block:   { variants: 1, w: 40, h: 48, ax: 20, ay: 34, oy: 16, sortOy: 30, shadow: [6, 14, 16, 5], make: () => ({ prims: blockPrims() }) },
  brazier: { variants: 1, w: 24, h: 24, ax: 12, ay: 20, oy: 20, shadow: [3, 1, 7, 3], make: () => ({ prims: brazierPrims() }) },
  // later dungeons' furniture (tile-centred)
  post:    { variants: 1, w: 24, h: 36, ax: 12, ay: 26, oy: 20, shadow: [4, 1, 8, 4], make: () => ({ prims: hookPostPrims() }) },
  hrock:   { variants: 3, w: 36, h: 32, ax: 18, ay: 22, oy: 20, shadow: [5, 2, 14, 6], make: v => ({ prims: heavyRockPrims(v) }) },
  eye:     { variants: 2, w: 36, h: 56, ax: 18, ay: 44, oy: 20, shadow: [4, 1, 9, 4], make: v => ({ prims: eyeSwitchPrims(v === 1) }) },
  ladderflat: { variants: 2, w: 64, h: 64, ax: 32, ay: 32, oy: 16, shadow: [0, 0, 0, 0], make: v => ({ prims: ladderFlatPrims(v) }) },
  raft:    { variants: 1, w: 72, h: 56, ax: 36, ay: 28, oy: 16, shadow: [0, 0, 0, 0], make: () => ({ prims: raftPrims() }) },
  peg:     { variants: 1, w: 24, h: 28, ax: 12, ay: 20, oy: 20, shadow: [3, 1, 8, 3], make: () => ({ prims: pegPrims() }) },
  // village (houses stand on the bottom edge of their door tile; the shadow falls east)
  // (4px of headroom over the elder's bell-cote)
  house:   { variants: 4, w: 124, h: 128, ax: 62, ay: 114, oy: 32, sortOy: 32, shadowRect: [-28, -44, 64, 3], make: v => housePrims(v) },
  fence:   { variants: 16, w: 36, h: 48, ax: 18, ay: 28, oy: 16, shadow: [3, 1, 5, 2], make: v => ({ prims: fencePrims(v) }) },
  well:    { variants: 1, w: 44, h: 58, ax: 22, ay: 44, oy: 18, shadow: [7, 3, 16, 6], make: () => ({ prims: wellPrims() }) },
  sign:    { variants: 1, w: 32, h: 30, ax: 16, ay: 24, oy: 20, shadow: [4, 1, 8, 3], make: () => ({ prims: signPrims() }) },
  // house furniture
  bed:     { variants: 1, w: 40, h: 62, ax: 20, ay: 40, oy: 20, shadow: [5, 2, 16, 20], make: () => ({ prims: bedPrims() }) },
  table:   { variants: 2, w: 44, h: 46, ax: 22, ay: 32, oy: 16, shadow: [5, 2, 18, 9], make: v => tablePrims(v) },
  shelf:   { variants: 1, w: 44, h: 46, ax: 22, ay: 38, oy: 12, shadow: [6, 2, 18, 5], make: () => ({ prims: shelfPrims() }) },
  barrel:  { variants: 1, w: 24, h: 32, ax: 12, ay: 23, oy: 20, shadow: [3, 1, 9, 4], make: () => ({ prims: barrelPrims() }) },
  pot:     { variants: 1, w: 22, h: 28, ax: 11, ay: 19, oy: 20, shadow: [3, 1, 8, 3], make: () => ({ prims: potPrims() }) },
  anvil:   { variants: 1, w: 36, h: 32, ax: 18, ay: 22, oy: 20, shadow: [4, 1, 12, 4], make: () => ({ prims: anvilPrims() }) },
  forge:   { variants: 2, w: 48, h: 64, ax: 24, ay: 46, oy: 12, shadow: [0, 0, 0, 0], make: v => ({ prims: forgePrims(v === 1) }) },
  bookcase: { variants: 2, w: 40, h: 64, ax: 20, ay: 44, oy: 12, shadow: [6, 2, 16, 4], make: v => bookcasePrims(v) },
  chair:   { variants: 1, w: 20, h: 32, ax: 10, ay: 22, oy: 20, shadow: [3, 1, 7, 3], make: () => ({ prims: chairPrims() }) },
  wheel:   { variants: 1, w: 40, h: 44, ax: 20, ay: 30, oy: 20, shadow: [5, 2, 13, 4], make: () => ({ prims: wheelPrims() }) },
  chest:   { variants: 1, w: 32, h: 32, ax: 16, ay: 22, oy: 20, shadow: [4, 2, 12, 5], make: () => chestPrims() },
  toys:    { variants: 1, w: 44, h: 36, ax: 24, ay: 24, oy: 20, shadow: [3, 2, 13, 4], make: () => toysPrims() },
  toybox:  { variants: 1, w: 40, h: 44, ax: 20, ay: 26, oy: 20, shadow: [4, 2, 13, 5], make: () => toyboxPrims() },
  blocks:  { variants: 1, w: 28, h: 30, ax: 14, ay: 20, oy: 20, shadow: [3, 1, 10, 4], make: () => blocksPrims() },
  plant:   { variants: 1, w: 20, h: 32, ax: 10, ay: 22, oy: 20, shadow: [3, 1, 6, 3], make: () => plantPrims() },
  cot:     { variants: 1, w: 32, h: 48, ax: 16, ay: 30, oy: 20, shadow: [4, 2, 12, 15], make: () => ({ prims: cotPrims() }) },
  rug:     { variants: 2, w: 60, h: 40, ax: 30, ay: 20, oy: 16, shadow: [0, 0, 0, 0], make: v => ({ prims: rugPrims(v) }) },
  // terrain furniture, placed by terrainProps below (never by tile: their places come from
  // the shape of the bridge or the mouth they belong to)
  // (bridge posts: 0 on the deck, 1 on its front edge, running on down into the water;
  // rails: v = which ends stop at a post inside the tile, see bridgeRailPrims)
  bridgepost: { variants: 2, w: 12, h: 26, ax: 6, ay: 13, oy: 0, shadow: [0, 0, 0, 0], make: v => ({ prims: bridgePostPrims(v === 1) }) },
  bridgerail_x: { variants: 4, w: 32, h: 16, ax: 16, ay: 12, oy: 0, shadow: [0, 0, 0, 0], make: v => ({ prims: bridgeRailPrims("x", v) }) },
  bridgerail_y: { variants: 4, w: 12, h: 32, ax: 6, ay: 38, oy: 0, shadow: [0, 0, 0, 0], make: v => ({ prims: bridgeRailPrims("y", v) }) },
  bankstone: { variants: 4, w: 14, h: 12, ax: 7, ay: 8, oy: 0, shadow: [2, 1, 4, 2], make: v => ({ prims: bankStonePrims(v) }) },
  // cave mouths: v = rock (0 grey, 1 sandstone, 2 slate) + 3 for a shop's timber frame
  cavelip: { variants: 6, w: 48, h: 64, ax: 24, ay: 52, oy: 32, shadow: [0, 0, 0, 0], make: v => ({ prims: caveLipPrims(["stone", "sandst", "darkrock"][v % 3], v >= 3) }) },
};

const _propCache = new Map();
function getProp(kind, variant) {
  const def = PROP_DEFS[kind];
  const v = def.variants > 1 ? (variant % def.variants) : 0;
  const key = kind + v;
  let s = _propCache.get(key);
  if (!s) {
    const m = def.make(v);
    s = render3D(m.prims, def.w, def.h, def.ax, def.ay, { outline: "prop", decals: m.decals });
    _propCache.set(key, s);
  }
  return s;
}
function clearPropCache() { _propCache.clear(); }

// A placed prop: { kind, v, x, y (anchor, screen px in play area), key (sort) }
function placeProp(kind, tx, ty, variant) {
  const def = PROP_DEFS[kind];
  const x = tx * TT + 16, y = ty * TT + def.oy;
  return { kind, v: variant || 0, x, y, key: ty * TT + (def.sortOy || def.oy) };
}
function propShadow(p) {
  const def = PROP_DEFS[p.kind];
  if (def.shadowRect) { const r = def.shadowRect; return { rect: [p.x + r[0], p.y + r[1], p.x + r[2], p.y + r[3]] }; }
  const s = def.shadow;
  if (!s || !s[2]) return null;
  return { x: p.x + s[0], v: p.y + s[1], rx: s[2], rv: s[3] };
}

// ---------- terrain furniture of an overworld screen ----------
// Bridge posts and rails, the stones a bridge lands on, and the boulder lips of cave
// mouths, as props (so the hero passes behind a north rail and in front of a south one).
// tileAt resolves tiles in the neighbouring screens (-1 and COLS / ROWS), so a bridge
// across a screen edge gets the same posts on both screens.
function terrainProps(sx, sy, tileAt, scr) {
  const out = [];
  const add = (kind, v, x, y, key) => out.push({ kind, v, x, y, key: key === undefined ? y : key });
  const T = (tx, ty) => tileAt(tx, ty);
  const plank = (t) => t === T_BRIDGE || t === T_DOCK;
  const wet = (t) => t === T_WATER;
  const dry = (t) => !plank(t) && !wet(t);
  // (a deck's front edge over the water stands DECK_EXT px out into the tile south of it)
  const EXT = typeof DECK_EXT === "number" ? DECK_EXT : 0;
  // --- bridges: a rail along every deck edge that faces open water ---
  // rail lines in screen px: a north edge's rail runs 2 px inside the deck, a south edge's
  // 2 px inside its front edge, and so on
  const railH = (tx, ty, s) => T(tx, ty) === T_BRIDGE && wet(T(tx, ty + (s === "N" ? -1 : 1)));
  const railV = (tx, ty, s) => T(tx, ty) === T_BRIDGE && wet(T(tx + (s === "W" ? -1 : 1), ty));
  const lineV = (ty, s) => ty * TT + (s === "N" ? 2 : TT - 2 + EXT);
  const southLine = (v) => (((v - EXT) % TT) + TT) % TT === TT - 2;
  const lineX = (tx, s) => tx * TT + (s === "W" ? 2 : TT - 2);
  const posts = new Map();
  const post = (x, y, long) => { const k = Math.round(x) + "," + Math.round(y); if (!posts.has(k)) posts.set(k, [x, y, long]); else if (long) posts.get(k)[2] = true; };
  // the vertical rail through a vertex (vx, vy in tiles), if any: its screen x
  const vAt = (vx, vy) => {
    for (const [tx, ty, s] of [[vx, vy, "W"], [vx - 1, vy, "E"], [vx, vy - 1, "W"], [vx - 1, vy - 1, "E"]]) if (railV(tx, ty, s)) return lineX(tx, s);
    return null;
  };
  const hAt = (vx, vy) => {
    for (const [tx, ty, s] of [[vx, vy, "N"], [vx, vy - 1, "S"], [vx - 1, vy, "N"], [vx - 1, vy - 1, "S"]]) if (railH(tx, ty, s)) return lineV(ty, s);
    return null;
  };
  const gx0 = sx * COLS, gy0 = sy * ROWS;
  const stones = [];
  for (let ty = -1; ty <= ROWS; ty++) for (let tx = -1; tx <= COLS; tx++) {
    const t = T(tx, ty);
    if (!plank(t)) continue;
    const x0 = tx * TT, y0 = ty * TT;
    if (t === T_DOCK) {
      // a dock: a post at each of its free corners, over the water and on the bank alike
      // (the south ones on its front edge, running on down into the water where it is wet)
      const n = plank(T(tx, ty - 1)), s = plank(T(tx, ty + 1)), w = plank(T(tx - 1, ty)), e = plank(T(tx + 1, ty));
      const sw = wet(T(tx, ty + 1)), yS = y0 + TT - 3 + (sw ? EXT : 0);
      if (!n && !w) post(x0 + 3, y0 + 3, false);
      if (!n && !e) post(x0 + TT - 3, y0 + 3, false);
      if (!s && !w) post(x0 + 3, yS, sw);
      if (!s && !e) post(x0 + TT - 3, yS, sw);
      continue;
    }
    for (const s of ["N", "S"]) {
      if (!railH(tx, ty, s)) continue;
      const v = lineV(ty, s), vy = ty + (s === "S" ? 1 : 0), long = s === "S";
      let cut = 0;
      // each end: the rail runs on into the next tile, stops at the bank, or turns a corner
      for (const [dx, vx, bit, inset] of [[-1, tx, 1, 4], [1, tx + 1, 2, TT - 4]]) {
        if (railH(tx + dx, ty, s)) { if (dx < 0 && (gx0 + vx) % 2 === 0) post(vx * TT, v, long); continue; }
        if (dry(T(tx + dx, ty))) { cut |= bit; post(x0 + inset, v, long); continue; }
        const xv = vAt(vx, vy);
        post(xv !== null ? xv : vx * TT + (dx < 0 ? 2 : -2), v, long);
      }
      add("bridgerail_x", cut, x0 + TT / 2, v, v);
    }
    for (const s of ["W", "E"]) {
      if (!railV(tx, ty, s)) continue;
      const x = lineX(tx, s);
      let cut = 0;
      for (const [dy, vy, bit, inset] of [[-1, ty, 1, 4], [1, ty + 1, 2, TT - 4]]) {
        if (railV(tx, ty + dy, s)) { if (dy < 0 && (gy0 + vy) % 2 === 0) post(x, vy * TT, false); continue; }
        if (dry(T(tx, ty + dy))) { cut |= bit; post(x, y0 + inset, false); continue; }
        const hv = hAt(tx + (s === "E" ? 1 : 0), vy);
        // (a corner with a south rail, whose line lies 4 px into this tile: the rail starts
        // at that corner's post)
        if (hv !== null && dy < 0 && southLine(hv)) cut |= 1;
        post(x, hv !== null ? hv : vy * TT + (dy < 0 ? 2 : -2), hv !== null && southLine(hv));
      }
      add("bridgerail_y", cut, x, y0 + TT - 1, y0 + TT - 4);
    }
    // a bridge's bank ends: one stone half sunk in the bank beside one of the end's outer
    // posts, on a side (and in a size) of its own, out of the way in; one per end however
    // many tiles wide the end is (its first tile places it, never between two of its tiles,
    // where the hero walks), and none where no open ground lies beside the landing
    const run = (dry(T(tx - 1, ty)) || dry(T(tx + 1, ty))) && !(dry(T(tx, ty - 1)) || dry(T(tx, ty + 1))) ? "x" : "y";
    const ends = run === "x" ? [[-1, 0], [1, 0]] : [[0, -1], [0, 1]];
    for (const [dx, dy] of ends) {
      if (!dry(T(tx + dx, ty + dy))) continue;
      const ax = run === "y" ? 1 : 0, ay = 1 - ax;
      const endAt = (k) => plank(T(tx + ax * k, ty + ay * k)) && dry(T(tx + ax * k + dx, ty + ay * k + dy));
      if (endAt(-1)) continue;
      let n = 1;
      while (n < 8 && endAt(n)) n++;
      // (xL, yL: the corner of the end's last tile)
      const xL = x0 + ax * (n - 1) * TT, yL = y0 + ay * (n - 1) * TT;
      const r = (k) => hash2(gx0 + tx + dx, gy0 + ty + dy, 980 + k), j = Math.round(r(1) * 2), j2 = Math.round(r(2) * 2);
      const cand = run === "x"
        ? [[dx < 0 ? x0 - 5 - j2 : x0 + TT + 4 + j2, y0 + 3 + j], [dx < 0 ? x0 - 5 - j2 : x0 + TT + 4 + j2, yL + TT - 2 - j]]
        : [[x0 - 3 - j2, dy < 0 ? y0 - 5 - j : y0 + TT + 6 + j], [xL + TT + 3 + j2, dy < 0 ? y0 - 5 - j : y0 + TT + 6 + j],
           [x0 + 3, dy < 0 ? y0 - 8 - j : y0 + TT + 7 + j], [xL + TT - 3, dy < 0 ? y0 - 8 - j : y0 + TT + 7 + j]];
      if (r(3) < 0.5) { [cand[0], cand[1]] = [cand[1], cand[0]]; if (cand.length > 2) [cand[2], cand[3]] = [cand[3], cand[2]]; }
      const ok = (x, y) => T(Math.floor(x / TT), Math.floor(y / TT)) === T_GROUND;
      const c = cand.find(([x, y]) => ok(x, y) && ok(x - 4, y) && ok(x + 4, y));
      if (c) stones.push([c[0], c[1], Math.floor(r(4) * 4)]);
    }
  }
  // (posts after the rails: at a shared spot the post hides the rail's cut end)
  for (const [x, y, long] of posts.values()) add("bridgepost", long ? 1 : 0, x, y, y + 0.2);
  for (const [x, y, v] of stones) add("bankstone", v, x, y);
  // --- cave mouths: a boulder lip round every plain cave's opening ---
  // (not a dungeon's mouth, which has its portal, nor a mouth blown open in a cracked cliff)
  for (let ty = 0; ty < ROWS; ty++) for (let tx = 0; tx < COLS; tx++) {
    if (T(tx, ty) !== T_CAVE) continue;
    const key = tx + "," + ty;
    if (scr.dungeonAt && scr.dungeonAt[key]) continue;
    if (scr.gate && scr.gate.x === tx && scr.gate.y === ty) continue;
    if (typeof secretKindAt === "function" && secretKindAt(gx0 + tx, gy0 + ty) === "bomb") continue;
    const st = (typeof worldRockStyle === "function" ? worldRockStyle(gx0 + tx, gy0 + ty) : "P").toUpperCase();
    const m = st === "D" ? 1 : st === "G" ? 2 : 0;
    const shop = scr.caves && /^shop/.test(scr.caves[key] || "");
    // (the lip is 44 px across and its lowest stones sit 8 px out either side and a little
    // below the mouth: a face with water beside it or under those stones gets none, so no
    // stone ever hangs out over the water; the mouth's own dark edge frames it there)
    if ([[-1, 0], [1, 0], [-1, 1], [1, 1]].some(([dx, dy]) => wet(T(tx + dx, ty + dy)) || plank(T(tx + dx, ty + dy)))) continue;
    // (sorted just before a shop's sign, which hangs in front of it)
    add("cavelip", m + (shop ? 3 : 0), tx * TT + 16, ty * TT + 32, ty * TT + 32.5);
  }
  return out;
}
