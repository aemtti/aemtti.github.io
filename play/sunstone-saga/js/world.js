"use strict";
// ---------- Overworld: 16x8 screens cut from one continuous map ----------
// The whole world (256 x 88 tiles) is generated once from global noise fields,
// so forests, rock masses, the lake and the river continue across screen edges.
// Hand-placed features (caves, dungeon mouths, secrets, islands) are stamped on
// top, then every required spot is checked for reachability and paths are cut
// where needed.

const OWW = 16, OWH = 8;
const WW = OWW * COLS, WH = OWH * ROWS;

// Biomes: P plains, F forest, M mountain, D desert, G graveyard, L lake
const BIOME = [
  "MMMMMMMMMMMMMMMM",
  "GGGMMMMMPMMMLLLM",
  "GGGPPPPPPPPLLLLL",
  "FFGPPPPPPPLLLLLL",
  "FFFFPPPPPPLLLLLL",
  "FFFFPPPPPPDDDDLL",
  "FFFFPPPPPDDDDDDD",
  "FFPPPPPPPDDDDDDD",
];

const OW_START = { sx: 7, sy: 6, x: 7 * TS + 8, y: 8 * TS };

function biomeAt(sx, sy) { return BIOME[clamp(sy, 0, OWH - 1)][clamp(sx, 0, OWW - 1)]; }

// ---------- hand-placed features ----------
// caves: {"x,y": caveId}; dungeon: {"x,y": id}; secrets: [{x,y,kind,cave}]; stamp: special layout
const OVERRIDES = {
  "7,6": { stamp: "start", caves: { "7,2": "hermit_sword" }, enemies: [] },
  // Brambleford, the village north of the start (house x,y = its door tile)
  "7,5": { stamp: "village", enemies: [], deco: [
    { kind: "house", x: 3, y: 3, v: 0, cave: "house_elder" },
    { kind: "house", x: 12, y: 3, v: 1, cave: "house_smith" },
    { kind: "house", x: 4, y: 8, v: 2, cave: "house_widow" },
    { kind: "house", x: 11, y: 8, v: 3, cave: "house_kids" },
    { kind: "well", x: 7, y: 5 },
    { kind: "sign", x: 9, y: 9 },
    { kind: "fence", x: 1, y: 5 }, { kind: "fence", x: 2, y: 5 }, { kind: "fence", x: 3, y: 5 },
    { kind: "fence", x: 12, y: 5 }, { kind: "fence", x: 13, y: 5 }, { kind: "fence", x: 14, y: 5 },
    { kind: "barrel", x: 1, y: 3 }, { kind: "pot", x: 14, y: 3 }, { kind: "barrel", x: 13, y: 8 },
    { kind: "tree", x: 1, y: 9 }, { kind: "tree", x: 14, y: 1 },
  ] },
  "13,3": { stamp: "d1isle", dungeon: { "8,5": 1 }, enemies: ["snap", "bat"] },
  "2,5": { dungeon: { "7,2": 2 } },
  "1,1": { dungeon: { "7,2": 3 } },
  // later levels: the desert vault, the ice well behind a moat (ladder), the cinder
  // deep behind heavy rocks (power glove)
  "14,7": { dungeon: { "7,3": 4 } },
  "2,0": { stamp: "moatmouth", dungeon: { "7,3": 5 }, enemies: ["caster", "bat"] },
  "13,0": { stamp: "rockmouth", dungeon: { "7,3": 6 }, enemies: ["caster", "caster"] },
  // a heart piece on a lake islet, reached with the tether hook from a post on the shore
  "12,4": { stamp: "hookislet", hp: [8, 5], enemies: ["snap"] },
  // a heart piece under a lone bush in the deep forest (burn it)
  "1,6": { secrets: [{ x: 8, y: 5, kind: "burnhp" }] },
  "6,0": { stamp: "keep", dungeon: { "7,2": 7 }, gate: { x: 7, y: 2, need: 6 }, enemies: ["caster", "caster", "bat"] },
  "13,1": { stamp: "raftisle", caves: { "7,3": "hc_isle" }, enemies: ["bat"] },
  "13,2": { stamp: "raftlane" },
  "15,4": { stamp: "ladderislet", caves: { "6,5": "hc_islet" } },
  "2,2": { secrets: [{ x: 7, y: 3, kind: "push", cave: "dawn_blade" }] },
  "0,2": { secrets: [{ x: 10, y: 3, kind: "burn", cave: "hc_grave" }] },
  "4,1": { caves: { "7,3": "steel_sword" } },
  "9,0": { secrets: [{ x: 11, y: 2, kind: "bomb", cave: "hc_mtn" }] },
  "10,1": { secrets: [{ x: 4, y: 2, kind: "bomb", cave: "ladder_cave" }] },
  "5,5": { caves: { "4,2": "shop_a" } },
  "8,3": { caves: { "11,3": "shop_b" } },
  "8,4": { caves: { "4,7": "gamble" } },
  "3,3": { caves: { "11,7": "donate" } },
  "10,2": { caves: { "4,2": "hint1" } },
  "8,6": { caves: { "11,2": "gift10" } },
  "5,6": { secrets: [{ x: 5, y: 3, kind: "burn", cave: "gift30" }] },
  "4,6": { secrets: [{ x: 10, y: 7, kind: "burn", cave: "hc_forest" }] },
  "13,6": { caves: { "11,2": "shop_c" } },
  "11,6": { secrets: [{ x: 11, y: 7, kind: "bomb", cave: "hc_desert" }] },
  // side quests: the elder's bell under a leaning stone in the boneyard, and the three
  // children hiding in the western woods, on the lake shore and under a bush east of town
  "1,2": { secrets: [{ x: 10, y: 3, kind: "push", cave: "bell_crypt" }] },
  "2,4": { caves: { "5,3": "kid_pip" } },
  "10,4": { caves: { "12,6": "kid_wren" } },
  "8,5": { secrets: [{ x: 11, y: 3, kind: "burn", cave: "kid_tam" }] },
  // a heart piece in a notch of the east peaks, shut in by a boulder (the power glove)
  "12,0": { stamp: "glovenook", hp: [3, 4] },
  // the pool in the meadow by the river: the noise left it boot-shaped, so it is laid out
  // by hand as a rounded pool ('~' water, ' ' as generated), its left-hand corner x, y
  "9,1": { stamp: "pond", pond: { x: 9, y: 4, rows: [" ~~", "~~~", "~~ "] } },
};

// Caves that get a trail to their door; the rest are found by exploring.
const ROAD_CAVES = new Set(["hermit_sword", "steel_sword", "shop_a", "shop_b", "shop_c"]);

// ---------- Enemy tables ----------
const BIOME_ENEMIES = {
  P: ["grub_r", "grub_r", "grub_r", "snap", "grub_b"],
  F: ["grub_b", "snap", "bat", "grub_b"],
  M: ["caster", "caster", "bat", "grub_b"],
  D: ["maw", "maw", "maw", "caster"],
  G: ["bat", "bat", "grub_b", "caster"],
  L: ["snap", "grub_r", "bat"],
};

// ---------- global generation ----------
let WORLD = null;
function worldMap() { if (!WORLD) WORLD = generateWorld(); return WORLD; }

function fbm(x, y, s) { return vnoise(x, y, s) * 0.6 + vnoise(x * 2.1, y * 2.1, s + 1) * 0.3 + vnoise(x * 4.3, y * 4.3, s + 2) * 0.1; }

// The mountain ridge: a wandering band of rock two or three tiles thick around the
// first screen boundary. Neighbouring columns always overlap, so it never leaks.
let _ridge = null;
function ridgeSpan(gx) {
  if (!_ridge) {
    _ridge = [];
    let pt = ROWS - 1, pb = ROWS;
    for (let x = 0; x < WW; x++) {
      const c = ROWS + 0.5 + (fbm(x / 7, 0.5, 951) - 0.5) * 9;
      const th = vnoise(x / 4, 2.5, 952) > 0.55 ? 3 : 2;
      let t = clamp(Math.round(c - th / 2), ROWS - 2, ROWS + 1);
      let b = Math.min(ROWS + 3, t + th - 1);
      if (x > 0) { t = Math.min(t, pb); b = Math.max(b, pt); }
      _ridge.push([t, b]); pt = t; pb = b;
    }
  }
  return _ridge[clamp(gx, 0, WW - 1)];
}

// Biome of a global tile, as the world is generated from it. Region borders wander (a
// broad warp plus fine raggedness); everything north of the ridge is mountain.
function biomeNoise(gx, gy) {
  if (gy <= ridgeSpan(gx)[1]) return "M";
  // typical displacement about five tiles, so no region line settles on a screen edge
  // (the last terms swing quickly along a border's own direction, so no north-south
  // border runs straight for long, nor any east-west one)
  const jx = (vnoise(gx / 16, gy / 16, 905) - 0.5) * 14 + (vnoise(gx / 7, gy / 7, 903) - 0.5) * 20 + (vnoise(gx / 3.5, gy / 3.5, 901) - 0.5) * 5 + (vnoise(gx / 9, gy / 2.2, 907) - 0.5) * 7;
  const jy = (vnoise(gx / 16 + 50, gy / 16, 906) - 0.5) * 10 + (vnoise(gx / 7 + 50, gy / 7, 904) - 0.5) * 14 + (vnoise(gx / 3.5 + 30, gy / 3.5, 902) - 0.5) * 4 + (vnoise(gx / 2.2, gy / 9, 908) - 0.5) * 6;
  return biomeAt(Math.floor((gx + jx) / COLS), Math.max(1, Math.floor((gy + jy) / ROWS)));
}

// Hand-shaped ground. Here and there the noise left a patch of one region inside another
// that reads as cut out. In each box such a patch is redrawn as a soft round shape (an
// ellipse, a little wobbly): inside it the ground is `inside`, and ground of that region
// left outside it becomes `outside`; a box with no ellipse just takes the patch away. Only
// the look of the ground follows this (what grass, dirt or sand is drawn); the world's
// tiles come from biomeNoise as before.
const GROUND_SHAPES = [
  // the meadow round the river pool (9,1): its west edge ran ruler-straight for 3 tiles
  { box: [151, 12, 157, 18], cx: 154.7, cy: 16.5, rx: 2.9, ry: 2.7, wob: 0.6, inside: "P", outside: "M", seed: 981 },
  // a star of sand on the lake shore (10,4 | 11,4), far from the desert. A patch the ground
  // keeps is 3 tiles across at the least, and its edge follows the tile grid (tried: a 3x3
  // and a 4x4 patch still drew as a square and a cross), so it goes back to grass
  { box: [172, 47, 183, 55], inside: "D", outside: "L" },
];
function groundShapeAt(gx, gy) {
  for (const s of GROUND_SHAPES) {
    if (gx < s.box[0] || gy < s.box[1] || gx > s.box[2] || gy > s.box[3]) continue;
    if (s.rx) {
      const dx = (gx + 0.5 - s.cx) / s.rx, dy = (gy + 0.5 - s.cy) / s.ry;
      if (dx * dx + dy * dy + (vnoise(gx / 2.2, gy / 2.2, s.seed) - 0.5) * s.wob <= 1) return s.inside;
    }
    return biomeNoise(gx, gy) === s.inside ? s.outside : null;
  }
  return null;
}
// Biome of a global tile as the ground is drawn: the noise, save for the shapes above.
function biomeJit(gx, gy) { return groundShapeAt(gx, gy) || biomeNoise(gx, gy); }

// The river falls from the ridge and winds south-east into the lake district
// (generateWorld extends it until it actually meets lake water).
const RIVER = [[150, 12], [149, 16], [151, 19], [155, 21], [159, 22], [162, 25], [166, 28], [171, 29], [176, 31], [181, 33]];
function riverDist(gx, gy, pts) {
  pts = pts || RIVER;
  let best = 1e9;
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((gx - ax) * dx + (gy - ay) * dy) / l2));
    const px = ax + dx * t, py = ay + dy * t;
    best = Math.min(best, Math.hypot(gx - px, gy - py));
  }
  return best + (vnoise(gx / 3, gy / 3, 931) - 0.5) * 0.9;
}

const R_FREE = 0, R_KEEP = 1, R_LAKE = 2, R_RIVER = 3, R_EDGE = 4;

function generateWorld() {
  const T = new Uint8Array(WW * WH).fill(T_GROUND);
  const role = new Uint8Array(WW * WH);
  const road = new Uint8Array(WW * WH);
  const I = (x, y) => y * WW + x;
  const inW = (x, y) => x >= 0 && y >= 0 && x < WW && y < WH;
  const get = (x, y) => inW(x, y) ? T[I(x, y)] : T_ROCK;
  const put = (x, y, t, r) => { if (!inW(x, y)) return; T[I(x, y)] = t; if (r !== undefined) role[I(x, y)] = r; };
  const obstacleFor = (b) => (b === "M" || b === "D" || b === "G") ? T_ROCK : T_TREE;

  // --- A. base terrain ---
  for (let gy = 0; gy < WH; gy++) {
    for (let gx = 0; gx < WW; gx++) {
      const b = biomeNoise(gx, gy);
      const h = hash2(gx, gy, 911);
      let t = T_GROUND;
      switch (b) {
        case "F": t = fbm(gx / 4.5, gy / 4, 910) > 0.55 ? T_TREE : (h < 0.03 ? T_BUSH : T_GROUND); break;
        case "P": {
          // groves, ponds, and lone trees, shrubs and boulders scattered between them
          if (fbm(gx / 5.5, gy / 5, 910) > 0.66) t = T_TREE;
          else if (fbm(gx / 3.2, gy / 2.8, 912) > 0.8) t = T_WATER;
          else if (h < 0.022) t = T_BUSH;
          else if (h < 0.032) t = T_TREE;
          else if (h < 0.037) t = T_ROCK;
          break;
        }
        case "M": t = (fbm(gx / 5.5, gy / 4, 913) > 0.56 || h < 0.02) ? T_ROCK : T_GROUND; break;
        case "D": t = fbm(gx / 4.5, gy / 3.5, 914) > 0.71 ? T_ROCK : (h < 0.03 ? T_CACTUS : T_GROUND); break;
        case "G": {
          if (fbm(gx / 5, gy / 4, 915) > 0.74) t = T_ROCK;
          // rows of stones, well inside the boneyard (a lone cross among pines is a puzzle)
          else if (gy % 3 === 1 && gx % 3 !== 0 && hash2(gx, gy, 916) < 0.5 &&
                   [[2, 0], [-2, 0], [0, 2], [0, -2], [1, 1], [-1, -1], [1, -1], [-1, 1]].every(([dx, dy]) => biomeNoise(gx + dx, gy + dy) === "G")) t = T_GRAVE;
          else if (h < 0.03) t = T_TREE;
          break;
        }
        case "L": {
          // lake district: several lakes, islands and spits of land rather than one flat sheet
          const w = fbm(gx / 6.5, gy / 5, 917);
          if (w > 0.41) { t = T_WATER; role[I(gx, gy)] = R_LAKE; }
          else t = (h < 0.12 ? T_TREE : (h < 0.15 ? T_BUSH : T_GROUND));
          break;
        }
      }
      T[I(gx, gy)] = t;
    }
  }
  // a dead tree right in front of (or behind) a headstone reads as a stone on a stick
  for (let gy = 1; gy < WH - 1; gy++) for (let gx = 0; gx < WW; gx++) {
    const k = I(gx, gy);
    if (T[k] === T_TREE && biomeNoise(gx, gy) === "G" && (T[k - WW] === T_GRAVE || T[k + WW] === T_GRAVE)) T[k] = T_GROUND;
  }
  // square corners of rock masses (a block of tiles read as a rectangular slab): knock a
  // corner tile off here and there (only open ground, which can't cut anything off)
  for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
    const k = I(gx, gy);
    if (T[k] !== T_ROCK) continue;
    const n = T[k - WW] === T_ROCK, sN = T[k + WW] === T_ROCK, w = T[k - 1] === T_ROCK, e = T[k + 1] === T_ROCK;
    if (n + sN + w + e === 2 && n !== sN && w !== e && hash2(gx, gy, 927) < 0.5) T[k] = T_GROUND;
  }
  // a lone stone just north of a tree shows only its top over the canopy, like a hat
  for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
    const k = I(gx, gy);
    if (T[k] === T_ROCK && T[k + WW] === T_TREE && T[k - 1] !== T_ROCK && T[k + 1] !== T_ROCK && T[k - WW] !== T_ROCK) T[k] = T_GROUND;
  }
  // single-tile puddles read as mistakes
  for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
    const k = I(gx, gy);
    if (T[k] !== T_WATER || role[k] === R_LAKE) continue;
    if (T[k - 1] !== T_WATER && T[k + 1] !== T_WATER && T[k - WW] !== T_WATER && T[k + WW] !== T_WATER) T[k] = T_GROUND;
  }
  // A canopy or a cliff top hangs over the tile north of it, so a lane one tile wide
  // between trees or rocks can't be seen: open every such lane to two tiles.
  const tall = (t) => t === T_TREE || t === T_ROCK;
  for (let pass = 0; pass < 2; pass++) {
    for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
      const k = I(gx, gy);
      if (T[k] !== T_GROUND) continue;
      if (tall(T[k - WW]) && tall(T[k + WW])) T[k + WW] = T_GROUND;
      if (T[k - 1] === T_TREE && T[k + 1] === T_TREE) T[hash2(gx, gy, 918) < 0.5 ? k - 1 : k + 1] = T_GROUND;
    }
  }
  // where the lake district meets another region keep a walkable band of shore
  const lake0 = role.slice();
  for (let gy = 0; gy < WH; gy++) {
    for (let gx = 0; gx < WW; gx++) {
      if (lake0[I(gx, gy)] !== R_LAKE) continue;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) {
        const x = gx + dx, y = gy + dy;
        if (!inW(x, y) || Math.abs(dx) + Math.abs(dy) > 2) continue;
        if (biomeNoise(x, y) !== "L") { near = true; break; }
      }
      if (near) {
        T[I(gx, gy)] = hash2(gx, gy, 923) < 0.18 ? T_TREE : T_GROUND;
        role[I(gx, gy)] = R_FREE;
      }
    }
  }
  // east shore strip along the world edge beside the lake (walkable from the desert);
  // its width wanders so the shoreline isn't ruled straight
  for (let gy = 2 * ROWS; gy < 6 * ROWS; gy++) {
    const depth = 5 + Math.round(fbm(gy / 3.5, 0.5, 924) * 5);
    for (let gx = WW - depth; gx < WW; gx++) {
      if (role[I(gx, gy)] === R_LAKE) { T[I(gx, gy)] = T_GROUND; role[I(gx, gy)] = R_FREE; }
    }
  }
  // river from the northern hills down into the lake: follow the course, then keep
  // going (with a gentle wander) until it reaches open lake water
  const course = RIVER.map(p => p.slice());
  {
    const [ex, ey] = course[course.length - 1];
    let best = null, bd = 1e9;
    for (let gy = Math.max(0, ey - 30); gy < Math.min(WH, ey + 30); gy++) for (let gx = Math.max(0, ex - 40); gx < Math.min(WW, ex + 40); gx++) {
      if (role[I(gx, gy)] !== R_LAKE) continue;
      // prefer water that lies downstream (south and east)
      const d = Math.hypot(gx - ex, gy - ey) + (gx < ex ? 6 : 0) + (gy < ey ? 6 : 0);
      if (d < bd) { bd = d; best = [gx, gy]; }
    }
    if (best) {
      const n = Math.max(1, Math.round(Math.hypot(best[0] - ex, best[1] - ey) / 4));
      for (let i = 1; i <= n; i++) {
        const t = i / n, w = i < n ? (hash2(i, 7, 932) - 0.5) * 3 : 0;
        course.push([ex + (best[0] - ex) * t + w, ey + (best[1] - ey) * t - w * 0.5]);
      }
    }
  }
  for (let gy = 0; gy < WH; gy++) {
    for (let gx = 0; gx < WW; gx++) {
      if (role[I(gx, gy)] === R_LAKE) continue;
      if (riverDist(gx, gy, course) < 1.15) { T[I(gx, gy)] = T_WATER; role[I(gx, gy)] = R_RIVER; }
    }
  }

  // --- B. world border (two or three tiles deep) and the mountain ridge ---
  const edgeD = (u, s) => 2 + Math.floor(fbm(u / 4, 0.5, s) * 3.2);
  for (let gy = 0; gy < WH; gy++) {
    for (let gx = 0; gx < WW; gx++) {
      const d = Math.min(gx - edgeD(gy, 961), gy - edgeD(gx, 962), WW - 1 - gx - edgeD(gy, 963), WH - 1 - gy - edgeD(gx, 964));
      if (d < 0) put(gx, gy, obstacleFor(biomeNoise(gx, gy)), R_EDGE);
      // straggling outliers just inside the border break its straight line
      else if (d < 2 && T[I(gx, gy)] === T_GROUND && hash2(gx, gy, 965) < (d === 0 ? 0.4 : 0.15)) put(gx, gy, obstacleFor(biomeNoise(gx, gy)));
    }
  }
  const passX0 = 8 * COLS + 6, passX1 = 8 * COLS + 9;
  let passBot = ROWS;
  for (let gx = 0; gx < WW; gx++) {
    const [t, b] = ridgeSpan(gx);
    for (let gy = t; gy <= b; gy++) {
      if (gx >= passX0 && gx <= passX1) put(gx, gy, T_GROUND, R_KEEP);
      else put(gx, gy, T_ROCK, R_EDGE);
    }
    if (gx >= passX0 - 1 && gx <= passX1 + 1) passBot = Math.max(passBot, b);
  }
  // the river springs from the foot of the ridge: run its head up to the rock, and
  // show the ridge face above it as a waterfall
  const falls = new Set();
  for (let gx = 0; gx < WW; gx++) {
    const b = ridgeSpan(gx)[1];
    let y = b + 1;
    while (y < Math.min(WH, b + 3) && role[I(gx, y)] !== R_RIVER) y++;
    if (y >= Math.min(WH, b + 3)) continue;
    for (let yy = b + 1; yy < y; yy++) { T[I(gx, yy)] = T_WATER; role[I(gx, yy)] = R_RIVER; }
    falls.add(I(gx, b));
  }
  // a one-tile notch in rock (rock on three sides) shows nothing but cliff face: fill it
  for (let pass = 0; pass < 2; pass++) {
    for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
      const k = I(gx, gy);
      if (T[k] !== T_GROUND || role[k] === R_KEEP) continue;
      const n = (T[k - WW] === T_ROCK) + (T[k + WW] === T_ROCK) + (T[k - 1] === T_ROCK) + (T[k + 1] === T_ROCK);
      if (n >= 3) T[k] = T_ROCK;
    }
  }


  // --- C. screen-to-screen gates, cut identically from both sides ---
  const gates = {};
  const isObst = (t) => t === T_TREE || t === T_ROCK || t === T_BUSH || t === T_CACTUS || t === T_GRAVE;
  const carveCell = (x, y) => {
    const k = I(x, y);
    if (role[k] === R_KEEP || role[k] === R_EDGE || role[k] === R_LAKE) return;
    if (role[k] === R_RIVER) { T[k] = T_BRIDGE; return; }
    if (isObst(T[k]) || T[k] === T_WATER) T[k] = T_GROUND;
  };
  for (let sy = 0; sy < OWH; sy++) {
    for (let sx = 0; sx < OWW; sx++) {
      // east edge (between sx and sx+1): pick a row
      if (sx < OWW - 1) {
        const ex = (sx + 1) * COLS;
        let best = null, bc = 1e9;
        for (let gy = sy * ROWS + 2; gy <= sy * ROWS + 8; gy++) {
          let c = hash2(ex, gy, 941) * 2;
          for (let dx = -3; dx <= 2; dx++) for (let dy = 0; dy <= 1; dy++) {
            const k = I(ex + dx, gy + dy);
            if (role[k] === R_LAKE || role[k] === R_EDGE) c += 100;
            else if (isObst(T[k])) c += 3;
            else if (T[k] === T_WATER) c += 5;
          }
          if (c < bc) { bc = c; best = gy; }
        }
        if (best !== null && bc < 100) {
          gates["e" + sx + "," + sy] = best;
          for (let dx = -3; dx <= 2; dx++) for (let dy = 0; dy <= 1; dy++) carveCell(ex + dx, best + dy);
        }
      }
      // south edge (between sy and sy+1): pick a column
      if (sy < OWH - 1) {
        const ey = (sy + 1) * ROWS;
        let best = null, bc = 1e9;
        for (let gx = sx * COLS + 3; gx <= sx * COLS + 11; gx++) {
          let c = hash2(gx, ey, 942) * 2;
          for (let dy = -3; dy <= 2; dy++) for (let dx = 0; dx <= 1; dx++) {
            const k = I(gx + dx, ey + dy);
            if (role[k] === R_LAKE || role[k] === R_EDGE) c += 100;
            else if (isObst(T[k])) c += 3;
            else if (T[k] === T_WATER) c += 5;
          }
          if (c < bc) { bc = c; best = gx; }
        }
        if (best !== null && bc < 100) {
          gates["s" + sx + "," + sy] = best;
          for (let dy = -3; dy <= 2; dy++) for (let dx = 0; dx <= 1; dx++) carveCell(best + dx, ey + dy);
        }
      }
    }
  }
  // the mountain pass is the only way north. Its walls step in and out a tile row by
  // row (cut to a ruler they left a rectangular slab of rock on either side)
  gates["s8,0"] = passX0 + 1;
  for (let gy = ROWS - 4; gy <= passBot + 3; gy++) {
    const wl = vnoise(gy / 2.2, 0.5, 925) > 0.55 ? 1 : 0, wr = vnoise(gy / 2.2, 3.5, 926) > 0.55 ? 1 : 0;
    for (let gx = passX0 - wl; gx <= passX1 + wr; gx++) {
      const k = I(gx, gy);
      // (the ridge itself is only ever cut to the pass's own width)
      if ((gx >= passX0 && gx <= passX1) || role[k] !== R_EDGE) { T[k] = T_GROUND; role[k] = R_KEEP; }
    }
  }

  // --- D. stamps ---
  const targets = [];          // [gx, gy, needsItem]
  const plaza = [];            // village ground that is always trodden (drawn as path)
  const streetGoals = [];      // village spots the road network must reach
  const S = (sx, sy) => ({ x: sx * COLS, y: sy * ROWS });
  const keep = (x, y, t) => put(x, y, t, R_KEEP);
  const clearKeep = (x, y) => { const k = I(x, y); if (inW(x, y) && role[k] !== R_EDGE) { T[k] = T_GROUND; role[k] = R_KEEP; } };
  // a knob of cliff around a cave mouth, open ground in front
  const stampCave = (gx, gy, mouth) => {
    for (let dx = -1; dx <= 1; dx++) keep(gx + dx, gy - 1, T_ROCK);
    keep(gx - 1, gy, T_ROCK); keep(gx + 1, gy, T_ROCK);
    keep(gx, gy, mouth || T_CAVE);
    clearKeep(gx, gy + 1); clearKeep(gx - 1, gy + 1); clearKeep(gx + 1, gy + 1); clearKeep(gx, gy + 2);
    targets.push([gx, gy + 1, null]);
  };
  for (const key in OVERRIDES) {
    const ov = OVERRIDES[key];
    const [sx, sy] = key.split(",").map(Number);
    const o = S(sx, sy);
    switch (ov.stamp) {
      case "start": {
        for (let y = 3; y <= 9; y++) for (let x = 2; x <= 13; x++) clearKeep(o.x + x, o.y + y);
        // the hermit's crag: an uneven knob of rock, not a box
        for (const [x, y] of [[6, 1], [7, 1], [8, 1], [9, 1], [4, 2], [5, 2], [6, 2], [8, 2], [9, 2], [10, 2], [4, 3], [5, 3], [10, 3], [11, 3], [11, 2]]) keep(o.x + x, o.y + y, T_ROCK);
        keep(o.x + 6, o.y + 7, T_BUSH); keep(o.x + 9, o.y + 7, T_BUSH);
        keep(o.x + 3, o.y + 8, T_TREE); keep(o.x + 12, o.y + 8, T_TREE);
        break;
      }
      case "d1isle": {
        // open water around an island; a long bridge runs west to the shore
        for (let y = 0; y <= 10; y++) for (let x = 1; x <= 14; x++) keep(o.x + x, o.y + y, T_WATER);
        // (corners left to the water, so the island isn't a rectangle)
        for (let y = 1; y <= 8; y++) for (let x = 5; x <= 11; x++) if (!((x === 5 || x === 11) && (y === 1 || y === 8)) && !(x === 11 && y === 2)) clearKeep(o.x + x, o.y + y);
        // the ruin sits three rows back from the landing: its roof hides the row behind it,
        // and the path round it has to stay in view
        for (let y = 4; y <= 5; y++) for (let x = 6; x <= 10; x++) keep(o.x + x, o.y + y, T_ROCK);
        keep(o.x + 7, o.y + 0, T_DOCK);                        // raft landing, north shore
        let bx = o.x + 4;
        while (bx >= 0 && (T[I(bx, o.y + 6)] === T_WATER || role[I(bx, o.y + 6)] === R_LAKE)) { keep(bx, o.y + 6, T_BRIDGE); bx--; }
        for (let x = bx - 1; x <= bx; x++) clearKeep(x, o.y + 6);
        break;
      }
      case "raftlane": {
        // a clear channel of open water between the two islands (the raft floats straight north)
        for (let y = 0; y <= 10; y++) for (let x = 5; x <= 9; x++) keep(o.x + x, o.y + y, T_WATER);
        break;
      }
      case "raftisle": {
        // open water below the ridge; the islet's rock may lean on the ridge itself
        for (let y = 1; y <= 10; y++) for (let x = 2; x <= 13; x++) if (role[I(o.x + x, o.y + y)] !== R_EDGE) keep(o.x + x, o.y + y, T_WATER);
        for (let y = 2; y <= 4; y++) for (let x = 5; x <= 9; x++) keep(o.x + x, o.y + y, T_ROCK);
        clearKeep(o.x + 7, o.y + 4);                           // ground in front of the mouth
        keep(o.x + 7, o.y + 5, T_DOCK);
        break;
      }
      case "ladderislet": {
        // a rounded meadow with a pool, the cave islet in the middle of the pool
        for (let y = 1; y <= 9; y++) for (let x = 1; x <= 14; x++) {
          const e = ((x - 7.5) / 6.4) ** 2 + ((y - 5.2) / 4.3) ** 2 + (vnoise(x / 2.5, y / 2.5, 933) - 0.5) * 0.5;
          if (e < 1) clearKeep(o.x + x, o.y + y);
        }
        for (let y = 4; y <= 6; y++) for (let x = 5; x <= 7; x++) keep(o.x + x, o.y + y, T_WATER);
        break;
      }
      case "village": {
        for (let y = 1; y <= 9; y++) for (let x = 1; x <= 14; x++) clearKeep(o.x + x, o.y + y);
        for (const d of ov.deco) {
          if (d.kind === "house") {
            for (let yy = d.y - 1; yy <= d.y; yy++) for (let xx = d.x - 1; xx <= d.x + 1; xx++) keep(o.x + xx, o.y + yy, T_HOUSE);
            keep(o.x + d.x, o.y + d.y, T_HDOOR);
            clearKeep(o.x + d.x, o.y + d.y + 1);
            targets.push([o.x + d.x, o.y + d.y + 1, null]);
            plaza.push([o.x + d.x, o.y + d.y + 1]);
            streetGoals.push([o.x + d.x, o.y + d.y + 1]);
          } else keep(o.x + d.x, o.y + d.y, d.kind === "tree" ? T_TREE : T_HOUSE);
        }
        // a trodden square round the well
        for (let y = 4; y <= 6; y++) for (let x = 5; x <= 10; x++) plaza.push([o.x + x, o.y + y]);
        streetGoals.push([o.x + 8, o.y + 6]);
        break;
      }
      case "moatmouth": case "rockmouth": {
        // open ground round the crag; the doorstep's barrier goes in after the mouth is cut
        for (let y = 2; y <= 8; y++) for (let x = 3; x <= 12; x++) clearKeep(o.x + x, o.y + y);
        break;
      }
      case "hookislet": {
        // open water with a small islet; hook posts on the shore and on the islet
        for (let y = 2; y <= 8; y++) for (let x = 2; x <= 13; x++) keep(o.x + x, o.y + y, T_WATER);
        for (let y = 2; y <= 8; y++) for (let x = 1; x <= 3; x++) clearKeep(o.x + x, o.y + y);
        for (const [x, y] of [[7, 4], [8, 4], [7, 5], [8, 5]]) clearKeep(o.x + x, o.y + y);
        keep(o.x + 9, o.y + 4, T_DPOST);                    // islet post (hooked from the shore)
        // shore post (hooked from the islet), one tile back from the water so the
        // tether sets the hero down on the shore at (3,5), not in the lake
        keep(o.x + 2, o.y + 5, T_DPOST);
        break;
      }
      case "glovenook": {
        // the heart piece's notch: rock on three sides, a heavy boulder in the fourth,
        // open ground in front of the boulder (reached on foot; the notch needs the glove)
        const x = o.x + ov.hp[0], y = o.y + ov.hp[1];
        for (const [dx, dy] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]) keep(x + dx, y + dy, T_ROCK);
        keep(x, y, T_GROUND); keep(x, y + 1, T_DROCK); clearKeep(x, y + 2);
        targets.push([x, y + 2, null]); targets.push([x, y, "glove"]);
        break;
      }
      case "pond": {
        // the pool as drawn in ov.pond (the noise's own pool water round it goes dry first)
        const p = ov.pond, h = p.rows.length, w = p.rows[0].length;
        for (let y = p.y - 1; y <= p.y + h; y++) for (let x = p.x - 1; x <= p.x + w; x++) {
          const k = I(o.x + x, o.y + y);
          if (T[k] === T_WATER && role[k] === R_FREE) T[k] = T_GROUND;
        }
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (p.rows[y][x] === "~") keep(o.x + p.x + x, o.y + p.y + y, T_WATER);
        break;
      }
      case "keep": {
        for (let y = 0; y <= 2; y++) for (let x = 3; x <= 12; x++) keep(o.x + x, o.y + y, T_ROCK);
        for (let y = 3; y <= 9; y++) for (let x = 2; x <= 13; x++) clearKeep(o.x + x, o.y + y);
        // guardian statues line the approach to the gate (a bare yard read as unfinished)
        for (const [x, y] of [[4, 5], [10, 5], [4, 7], [10, 7]]) keep(o.x + x, o.y + y, T_STATUE);
        break;
      }
    }
    for (const k in (ov.caves || {})) {
      const [x, y] = k.split(",").map(Number);
      if (ov.stamp === "ladderislet") { keep(o.x + x, o.y + y, T_CAVE); targets.push([o.x + x, o.y + y + 2, null]); continue; }
      if (ov.stamp === "raftisle") { keep(o.x + x, o.y + y, T_CAVE); continue; }
      stampCave(o.x + x, o.y + y);
    }
    for (const k in (ov.dungeon || {})) {
      const [x, y] = k.split(",").map(Number);
      if (ov.stamp === "d1isle") { keep(o.x + x, o.y + y, T_CAVE); clearKeep(o.x + x, o.y + y + 1); continue; }
      stampCave(o.x + x, o.y + y);
      // doorsteps that need an item: a ring of water one stride wide (ladder) or heavy
      // boulders (power glove). Checked later with the item in hand, never carved open.
      if (ov.stamp === "moatmouth" || ov.stamp === "rockmouth") {
        const t = ov.stamp === "moatmouth" ? T_WATER : T_DROCK;
        for (const [dx, dy] of [[-1, 1], [1, 1], [-1, 2], [0, 2], [1, 2]]) keep(o.x + x + dx, o.y + y + dy, t);
        const tg = targets[targets.length - 1];
        tg[2] = ov.stamp === "moatmouth" ? "ladder" : "glove";
      }
    }
    if (ov.gate) {
      const gx = o.x + ov.gate.x, gy = o.y + ov.gate.y;
      keep(gx, gy, T_GATE);
      // the approach is judged from the tile in front of the sealed gate
      for (const tg of targets) if (tg[0] === gx && tg[1] === gy) tg[1] = gy + 1;
      clearKeep(gx, gy + 1);
    }
    for (const s of (ov.secrets || [])) {
      const gx = o.x + s.x, gy = o.y + s.y;
      if (s.kind === "bomb") stampCave(gx, gy, T_CRACK);
      else {
        keep(gx, gy, (s.kind === "burn" || s.kind === "burnhp") ? T_BUSH : T_GRAVE);
        for (const [dx, dy] of [[0, 1], [-1, 0], [1, 0], [0, -1]]) clearKeep(gx + dx, gy + dy);
        targets.push([gx, gy + 1, null]);
      }
    }
  }
  // every screen with land should be reachable: aim at a hub near its centre
  for (let sy = 0; sy < OWH; sy++) for (let sx = 0; sx < OWW; sx++) {
    const o = S(sx, sy);
    let hub = null, hd = 1e9;
    for (let y = 2; y < ROWS - 2; y++) for (let x = 2; x < COLS - 2; x++) {
      const k = I(o.x + x, o.y + y);
      // stamped ground is checked through its own targets (some of it is meant to need an item)
      if (T[k] !== T_GROUND || role[k] === R_KEEP) continue;
      const d = (x - 7.5) ** 2 + (y - 5) ** 2;
      if (d < hd) { hd = d; hub = [o.x + x, o.y + y]; }
    }
    if (hub && !isIsland(key2(sx, sy))) targets.push([hub[0], hub[1], null]);
  }

  // --- E. connect everything to the start ---
  const start = [OW_START.sx * COLS + Math.floor(OW_START.x / TS), OW_START.sy * ROWS + Math.floor(OW_START.y / TS)];
  const walkable = (t) => t === T_GROUND || t === T_BRIDGE || t === T_DOCK || t === T_STAIRS || t === T_CAVE;
  const report = { carved: 0, unreached: [], pockets: 0 };
  const reached = new Uint8Array(WW * WH);
  const flood = () => {
    reached.fill(0);
    const q = [I(start[0], start[1])];
    reached[q[0]] = 1;
    while (q.length) {
      const k = q.pop(), x = k % WW, y = (k / WW) | 0;
      if (T[k] === T_CAVE) continue;              // caves are entered, not walked through
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inW(nx, ny)) continue;
        const nk = I(nx, ny);
        if (!reached[nk] && walkable(T[nk])) { reached[nk] = 1; q.push(nk); }
      }
    }
  };
  flood();
  for (const [tx, ty, need] of targets) {
    if (need || reached[I(tx, ty)]) continue;
    // cheapest path from the target back to the reached area; obstacles and river cost extra
    const dist = new Float32Array(WW * WH).fill(1e9), prev = new Int32Array(WW * WH).fill(-1);
    const heap = new MinHeap();
    const s0 = I(tx, ty);
    dist[s0] = 0; heap.push(0, s0);
    let hit = -1;
    while (heap.size()) {
      const [d, k] = heap.pop();
      if (d > dist[k]) continue;
      if (reached[k]) { hit = k; break; }
      const x = k % WW, y = (k / WW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inW(nx, ny)) continue;
        const nk = I(nx, ny), r = role[nk], t = T[nk];
        if (r === R_EDGE || (r === R_KEEP && !walkable(t))) continue;
        // obstacles are cheap to clear, rivers and lakes get bridges (lakes only as a last resort)
        const c = walkable(t) ? 1 : (r === R_RIVER ? 14 : (r === R_LAKE ? 30 : (t === T_WATER ? 20 : 8)));
        if (d + c < dist[nk]) { dist[nk] = d + c; prev[nk] = k; heap.push(d + c, nk); }
      }
    }
    if (hit < 0) { report.unreached.push([tx, ty]); continue; }
    for (let k = prev[hit]; k >= 0 && k !== s0; k = prev[k]) {
      if (!walkable(T[k])) { T[k] = (role[k] === R_RIVER || role[k] === R_LAKE || T[k] === T_WATER) ? T_BRIDGE : T_GROUND; report.carved++; }
    }
    if (!walkable(T[s0]) && role[s0] !== R_KEEP) T[s0] = T_GROUND;
    flood();
  }
  report.unreached = targets.filter(([tx, ty, need]) => !need && !reached[I(tx, ty)]);
  report.gated = targets.filter(([, , need]) => need);
  // With every path cut, tidy what the paths left behind (only ever opening ground or
  // filling ground nobody can reach, so nothing reachable is lost):
  // - a lane one tile deep between rock or trees north and south is hidden under the
  //   southern rock's top (or canopy): open it to two tiles
  for (let pass = 0; pass < 2; pass++) {
    for (let gy = 1; gy < WH - 1; gy++) for (let gx = 1; gx < WW - 1; gx++) {
      const k = I(gx, gy);
      if (!walkable(T[k]) || T[k] === T_CAVE) continue;
      const n = T[k - WW], sN = T[k + WW];
      if ((n === T_ROCK || n === T_TREE || n === T_CAVE || n === T_CRACK || n === T_GATE) && (sN === T_ROCK || sN === T_TREE) && role[k + WW] !== R_KEEP && role[k + WW] !== R_EDGE) {
        T[k + WW] = T_GROUND; report.carved++;
      }
    }
  }
  // - small pockets shut in by rock on every side that nobody can reach (a few tiles of
  //   floor sunk in a rock top, all cliff face) read as holes: fill them
  flood();
  report.pockets = fillRockPockets(T, role, 10, reached);

  // --- F. roads: one network grown from the start to the places worth walking to ---
  // Branches leave the network wherever it is closest, so the result is a tree of
  // trails rather than a web; they only show on grass-like ground.
  const roadGoals = [];
  for (const key in OVERRIDES) {
    const ov = OVERRIDES[key];
    if (isIsland(key) || ov.stamp === "ladderislet") continue;
    const [sx, sy] = key.split(",").map(Number), o = S(sx, sy);
    const spots = Object.keys(ov.dungeon || {}).concat(Object.keys(ov.caves || {}).filter(k => ROAD_CAVES.has(ov.caves[k])));
    for (const k of spots) { const [x, y] = k.split(",").map(Number); roadGoals.push([o.x + x, o.y + y + 1]); }
  }
  roadGoals.push([passX0 + 1, passBot + 2]);
  roadGoals.push(...streetGoals);
  const rCost = new Float32Array(WW * WH);
  for (let y = 0; y < WH; y++) for (let x = 0; x < WW; x++) {
    // meander over gentle rises, keep off obstacles, and cross screen edges rather than follow them
    // (the rises are steep enough that no trail runs ruler-straight for a whole screen)
    let c = 1 + fbm(x / 6, y / 6, 971) * 4.5 + vnoise(x / 2.6, y / 2.6, 972) * 2.2;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const t = get(x + dx, y + dy); if (isObst(t) || t === T_WATER) c += 0.7; }
    const lx = x % COLS, ly = y % ROWS;
    if (lx === 0 || lx === COLS - 1 || ly === 0 || ly === ROWS - 1) c += 2.5;
    else if (lx === 1 || lx === COLS - 2 || ly === 1 || ly === ROWS - 2) c += 1;
    rCost[I(x, y)] = c;
  }
  const roadWalk = (t) => t === T_GROUND || t === T_BRIDGE || t === T_DOCK;
  const net = new Uint8Array(WW * WH);
  const rDist = new Float64Array(WW * WH), rPrev = new Int32Array(WW * WH);
  const search = (goal) => {
    rDist.fill(1e9); rPrev.fill(-1);
    const heap = new MinHeap();
    for (let k = 0; k < WW * WH; k++) if (net[k]) { rDist[k] = 0; heap.push(0, k); }
    while (heap.size()) {
      const [d, k] = heap.pop();
      if (d > rDist[k]) continue;
      if (k === goal) return;
      const x = k % WW, y = (k / WW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inW(nx, ny)) continue;
        const nk = I(nx, ny);
        if (!roadWalk(T[nk])) continue;
        const nd = d + rCost[nk];
        if (nd < rDist[nk]) { rDist[nk] = nd; rPrev[nk] = k; heap.push(nd, nk); }
      }
    }
  };
  net[I(start[0], start[1])] = 1;
  search(-1);
  // nearest goals first, so later branches join the trunk instead of running beside it
  roadGoals.sort((a, b) => rDist[I(a[0], a[1])] - rDist[I(b[0], b[1])]);
  for (const [gx, gy] of roadGoals) {
    const gk = I(gx, gy);
    search(gk);
    if (rDist[gk] >= 1e9) continue;
    for (let k = gk; k >= 0 && !net[k]; k = rPrev[k]) net[k] = 1;
  }
  for (let k = 0; k < WW * WH; k++) {
    if (net[k] && T[k] === T_GROUND && role[k] !== R_EDGE && "PFGLM".includes(biomeNoise(k % WW, (k / WW) | 0))) road[k] = 1;
  }
  for (const [x, y] of plaza) if (T[I(x, y)] === T_GROUND) road[I(x, y)] = 1;

  // --- G. one kind of rock per rock mass (the region most of it stands in), so a mesa
  // on a border is all sandstone or all granite, the same on both screens ---
  const rockish = (t) => t === T_ROCK || t === T_CRACK || t === T_CAVE || t === T_GATE;
  const rockStyle = new Uint8Array(WW * WH);
  for (let k0 = 0; k0 < WW * WH; k0++) {
    if (rockStyle[k0] || !rockish(T[k0])) continue;
    const cells = [k0], counts = {};
    rockStyle[k0] = 1;
    for (let i = 0; i < cells.length; i++) {
      const k = cells[i], x = k % WW, y = (k / WW) | 0;
      const b = biomeNoise(x, y); counts[b] = (counts[b] || 0) + 1;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inW(nx, ny)) continue;
        const nk = I(nx, ny);
        if (!rockStyle[nk] && rockish(T[nk])) { rockStyle[nk] = 1; cells.push(nk); }
      }
    }
    if (cells.length <= 4) {
      for (const k of cells) {
        const x = k % WW, y = (k / WW) | 0;
        for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (!inW(x + dx, y + dy)) continue; const b = biomeNoise(x + dx, y + dy); counts[b] = (counts[b] || 0) + 1; }
      }
    }
    let best = "P", bn = -1;
    for (const b in counts) if (counts[b] > bn) { bn = counts[b]; best = b; }
    // (rock of the world's rim and the great ridge is marked in lower case: it is drawn
    // as rough, boulder-strewn highland, so it never reads as flat ground to walk on)
    for (const k of cells) rockStyle[k] = (role[k] === R_EDGE ? best.toLowerCase() : best).charCodeAt(0);
  }

  // the falls are fed by a spring on the ridge top: a channel runs from its basin to the
  // lip. Side-by-side falls pour as one sheet from one channel, so each tile stores its
  // place in the run. fallInfo: index | width << 2. streams: row from the head |
  // rows << 2 | index << 4 | width << 6.
  const streams = new Map(), fallInfo = new Map();
  const fallList = [...falls].filter(k => T[k] === T_ROCK).sort((a, b) => a - b);
  for (let i = 0; i < fallList.length;) {
    let j = i;
    while (j + 1 < fallList.length && fallList[j + 1] === fallList[j] + 1) j++;
    const by = (fallList[i] / WW) | 0, n = Math.min(3, j - i + 1);
    let head = by - 2;
    for (let q = i; q < i + n; q++) {
      const x = fallList[q] % WW;
      let y = by;
      while (y - 1 >= head && T[I(x, y - 1)] === T_ROCK) y--;
      head = Math.max(head, y);
    }
    for (let q = i; q < i + n; q++) {
      const x = fallList[q] % WW;
      fallInfo.set(fallList[q], (q - i) | (n << 2));
      for (let y = head; y <= by; y++) streams.set(I(x, y), (y - head) | ((by - head + 1) << 2) | ((q - i) << 4) | (n << 6));
    }
    i = j + 1;
  }

  return { T, role, road, gates, falls: fallInfo, streams, rockStyle, report };
}

// Fill every 4-connected patch of non-rock tiles of at most maxSize tiles whose
// neighbours are all rock (or the world's edge). Returns how many patches were filled.
function fillRockPockets(T, role, maxSize, reached) {
  const seen = new Uint8Array(WW * WH);
  let filled = 0;
  for (let k0 = 0; k0 < WW * WH; k0++) {
    if (seen[k0] || T[k0] === T_ROCK) continue;
    const cells = [k0];
    seen[k0] = 1;
    let open = false;
    for (let i = 0; i < cells.length; i++) {
      const k = cells[i], x = k % WW, y = (k / WW) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= WW || ny >= WH) continue;
        const nk = ny * WW + nx;
        if (T[nk] === T_ROCK || seen[nk]) continue;
        seen[nk] = 1;
        cells.push(nk);
      }
      if (cells.length > maxSize) { open = true; }
    }
    if (open) continue;
    if (cells.some(k => role[k] === R_KEEP || role[k] === R_RIVER || role[k] === R_LAKE || (reached && reached[k]) || (T[k] !== T_GROUND && T[k] !== T_TREE && T[k] !== T_BUSH && T[k] !== T_WATER))) continue;
    for (const k of cells) T[k] = T_ROCK;
    filled++;
  }
  return filled;
}

function key2(sx, sy) { return sx + "," + sy; }
// Screens meant to be reached only by raft (no walking hub required)
function isIsland(key) { return key === "13,1" || key === "13,2"; }

// Minimal binary heap of [priority, value]
class MinHeap {
  constructor() { this.a = []; }
  size() { return this.a.length; }
  push(p, v) {
    const a = this.a; a.push([p, v]);
    let i = a.length - 1;
    while (i > 0) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let m = i;
        if (l < a.length && a[l][0] < a[m][0]) m = l;
        if (r < a.length && a[r][0] < a[m][0]) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

// Kept for callers that ask whether two screens connect: true when no gate was cut.
function edgeBlocked(sx, sy, dir) {
  const nx = sx + DX[dir], ny = sy + DY[dir];
  if (nx < 0 || nx >= OWW || ny < 0 || ny >= OWH) return true;
  const g = worldMap().gates;
  if (dir === RIGHT) return g["e" + sx + "," + sy] === undefined;
  if (dir === LEFT) return g["e" + nx + "," + ny] === undefined;
  if (dir === DOWN) return g["s" + sx + "," + sy] === undefined;
  return g["s" + nx + "," + ny] === undefined;
}
function worldRoadAt(gx, gy) { const W = worldMap(); return gx >= 0 && gy >= 0 && gx < WW && gy < WH && !!W.road[gy * WW + gx]; }
// Waterfall on a cliff face (encoded where the falls are built; 0 = none).
function worldFallAt(gx, gy) { return worldMap().falls.get(gy * WW + gx) || 0; }
// Stream on a ridge top (see the encoding where streams are built), 0 for none.
function worldStreamAt(gx, gy) { return worldMap().streams.get(gy * WW + gx) || 0; }
// Rock kind of a rock tile ("D" sandstone, "M" granite, "G" slate, else mossy stone).
function worldRockStyle(gx, gy) {
  const rs = worldMap().rockStyle;
  const at = (x, y) => (x < 0 || y < 0 || x >= WW || y >= WH) ? 0 : rs[y * WW + x];
  // rounded rock edges spill onto the next tile: borrow the neighbouring mass's kind
  const c = at(gx, gy) || at(gx, gy + 1) || at(gx - 1, gy) || at(gx + 1, gy) || at(gx, gy - 1);
  return c ? String.fromCharCode(c) : biomeJit(clamp(gx, 0, WW - 1), clamp(gy, 0, WH - 1));
}

// ---------- Custom map legend (kept for tools) ----------
const MAP_LEGEND = {
  ".": T_GROUND, "T": T_TREE, "R": T_ROCK, "W": T_WATER, "B": T_BUSH, "G": T_GRAVE,
  "X": T_CACTUS, "C": T_CAVE, "S": T_STAIRS, "K": T_DOCK, "=": T_BRIDGE, "c": T_CRACK,
  "u": T_STUMP, "A": T_GATE,
};

// Build the final screen object, applying persistent flags.
function getScreen(sx, sy) {
  const key = sx + "," + sy;
  const ov = OVERRIDES[key] || {};
  const W = worldMap();
  const tiles = [];
  for (let y = 0; y < ROWS; y++) {
    const row = new Array(COLS);
    for (let x = 0; x < COLS; x++) row[x] = W.T[(sy * ROWS + y) * WW + sx * COLS + x];
    tiles.push(row);
  }
  // enemies: a fixed roll per screen
  let enemies;
  if (ov.enemies !== undefined) enemies = ov.enemies.slice();
  else {
    const rng = mulberry32(sx * 131 + sy * 977 + 12345);
    const table = BIOME_ENEMIES[biomeAt(sx, sy)] || BIOME_ENEMIES.P;
    const n = 3 + rngInt(rng, 3);
    enemies = [];
    for (let i = 0; i < n; i++) enemies.push(rngChoice(rng, table));
    if (rng() < 0.04) enemies.push("wisp");
  }

  const caves = {};
  if (ov.caves) for (const k in ov.caves) caves[k] = ov.caves[k];
  const deco = ov.deco || [];
  for (const d of deco) if (d.kind === "house" && d.cave) caves[d.x + "," + d.y] = d.cave;
  const dungeonAt = {};
  if (ov.dungeon) for (const k in ov.dungeon) dungeonAt[k] = ov.dungeon[k];

  // secrets: hidden until their flag is set
  const secrets = [];
  // heart pieces on this screen: [x, y, flag]
  const hp = [];
  if (ov.hp) hp.push([ov.hp[0], ov.hp[1], "hp:" + key]);
  if (ov.secrets) {
    for (const s of ov.secrets) {
      const flag = "sec:" + key + ":" + s.x + "," + s.y;
      if (G.flags && G.flags[flag]) {
        if (s.kind === "burnhp") { tiles[s.y][s.x] = T_STUMP; hp.push([s.x, s.y + 1, "hp:" + key + ":" + s.x + "," + s.y]); continue; }
        tiles[s.y][s.x] = (s.kind === "bomb") ? T_CAVE : T_STAIRS;
        if (s.cave) caves[s.x + "," + s.y] = s.cave;
      } else {
        tiles[s.y][s.x] = (s.kind === "burn" || s.kind === "burnhp") ? T_BUSH : (s.kind === "bomb") ? T_CRACK : T_GRAVE;
        secrets.push(Object.assign({ flag }, s));
      }
    }
  }

  // final gate: a sealed slab in the keep's mouth until the shards break it
  let gate = null;
  if (ov.gate) {
    if (G.flags && G.flags["gate:open"]) tiles[ov.gate.y][ov.gate.x] = T_CAVE;
    else gate = ov.gate;
  }

  return { sx, sy, tiles, enemies, caves, dungeonAt, secrets, gate, deco, hp };
}

function tileAt(tiles, tx, ty) {
  if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return T_TREE;
  return tiles[ty][tx];
}
function walkableTile(t) { return !tileSolid(t) && !tileWater(t); }
// Firm ground: walkable and harmless (no pit, no lava).
function standableTile(t) { return walkableTile(t) && !tileHazard(t); }
// A tile of the current screen; on the overworld, tiles past its edges come from the
// world map (so a look across an edge sees the real neighbour, not a wall).
function owTileAt(tx, ty) {
  if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) return G.tiles[ty][tx];
  if (G.area !== "overworld") return T_TREE;
  const gx = G.sx * COLS + tx, gy = G.sy * ROWS + ty;
  if (gx < 0 || gy < 0 || gx >= WW || gy >= WH) return T_ROCK;
  return worldMap().T[gy * WW + gx];
}
