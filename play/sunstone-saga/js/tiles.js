"use strict";
// ---------- Tiles: ids, themed art, solidity ----------
const T_GROUND = 0, T_TREE = 1, T_ROCK = 2, T_WATER = 3, T_BUSH = 4, T_GRAVE = 5,
  T_CACTUS = 6, T_CAVE = 7, T_STAIRS = 8, T_DOCK = 9, T_BRIDGE = 10, T_CRACK = 11,
  T_STUMP = 12, T_DFLOOR = 13, T_DWALL = 14, T_DBLOCK = 15, T_DWATER = 16,
  T_STATUE = 17, T_GATE = 18,
  // village: T_HOUSE is any solid built thing (walls, fences, well, sign), T_HDOOR a house door
  T_HOUSE = 19, T_HDOOR = 20,
  // dungeon furniture of the later levels
  T_DPIT = 21,      // a drop: falling in hurts and puts you back at the door
  T_DPOST = 22,     // hook post: the tether hook bites here and reels you across
  T_DPOT = 23,      // clay pot: lift it and throw it
  T_DROCK = 24,     // heavy rock: needs the power glove to lift
  T_DICE = 25,      // ice: you slide until something stops you
  T_DPEG = 26,      // wooden peg: the earth hammer drives it flush
  T_DLAVA = 27,     // lava: burns
  T_DSWITCH = 28,   // floor switch: held down by a block pushed onto it
  T_DEYE = 29,      // crystal eye on a pedestal: wakes when an arrow or the boomerang strikes it
  T_DEYEON = 30;    // the same eye, awake (lit)

const SOLID_TILES = new Set([T_TREE, T_ROCK, T_BUSH, T_GRAVE, T_CACTUS, T_CRACK, T_DWALL, T_DBLOCK, T_STATUE, T_GATE, T_HOUSE, T_DPOST, T_DPOT, T_DROCK, T_DPEG, T_DEYE, T_DEYEON]);
const WATER_TILES = new Set([T_WATER, T_DWATER]);
// tiles you can step onto but that do something to you
const HAZARD_TILES = new Set([T_DPIT, T_DLAVA]);

function tileSolid(t) { return SOLID_TILES.has(t); }
function tileWater(t) { return WATER_TILES.has(t); }
function tileHazard(t) { return HAZARD_TILES.has(t); }
// Room layout letters (rows 2..8, columns 2..13 of a room)
const LAYOUT_TILES = { ".": T_DFLOOR, "B": T_DBLOCK, "S": T_STATUE, "W": T_DWATER, "P": T_DPIT, "H": T_DPOST, "o": T_DPOT, "R": T_DROCK, "I": T_DICE, "G": T_DPEG, "L": T_DLAVA, "O": T_DSWITCH, "E": T_DEYE, "#": T_DWALL };

// Overworld themes + dungeon themes. Each theme is a small palette.
const THEME_DEFS = {
  field:    { ground: "#FCD8A8", speck: "#E8B878", veg: "#00A844", vegD: "#005024", rock: "#AC7C00", rockD: "#503000" },
  forest:   { ground: "#E8C890", speck: "#C8A860", veg: "#008038", vegD: "#00401C", rock: "#AC7C00", rockD: "#503000" },
  mountain: { ground: "#FCD8A8", speck: "#D8A868", veg: "#00A844", vegD: "#005024", rock: "#B85C24", rockD: "#582000" },
  desert:   { ground: "#FCE0A8", speck: "#E0C070", veg: "#00A844", vegD: "#005024", rock: "#C08040", rockD: "#603010" },
  grave:    { ground: "#C8C8A0", speck: "#A0A078", veg: "#307030", vegD: "#183818", rock: "#8C8C8C", rockD: "#404040" },
  d1: { ground: "#0C0C2C", speck: "#202048", veg: "#5080E8", vegD: "#203880", rock: "#5080E8", rockD: "#203880" },
  d2: { ground: "#0A2008", speck: "#1C3818", veg: "#40A048", vegD: "#184020", rock: "#40A048", rockD: "#184020" },
  d3: { ground: "#280C08", speck: "#482018", veg: "#D06040", vegD: "#702010", rock: "#D06040", rockD: "#702010" },
  d4: { ground: "#180828", speck: "#301848", veg: "#8858C8", vegD: "#402068", rock: "#8858C8", rockD: "#402068" },
};

const TILESETS = {}; // theme -> { [tileId]: canvas, waterFrames: [c0,c1] }

function buildTileSprite(rows, m) { return buildSprite(rows, m); }

function buildTiles() {
  const WATER_BLUE = "#3CBCFC", WATER_DEEP = "#0058F8";
  for (const themeName in THEME_DEFS) {
    const t = THEME_DEFS[themeName];
    const set = {};
    const m = {
      g: t.ground, s: t.speck, v: t.veg, d: t.vegD, r: t.rock, o: t.rockD,
      w: WATER_BLUE, u: WATER_DEEP, k: "#000000", a: "#BCBCBC", b: "#7C7C7C", c: "#404040",
      y: "#AC7C00", x: "#503000", e: "#F8D878",
    };
    const G16 = (ch) => Array(16).fill(ch.repeat(16));

    // ground with sparse specks
    set[T_GROUND] = buildTileSprite([
      "gggggggggggggggg", "gggggggggggggggg", "ggggggggggggsggg", "gggggggggggggggg",
      "ggsggggggggggggg", "gggggggggggggggg", "gggggggggsgggggg", "gggggggggggggggg",
      "gggggggggggggggg", "ggggsggggggggggg", "gggggggggggggggg", "gggggggggggggsgg",
      "gggggggggggggggg", "gggsgggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_TREE] = buildTileSprite([
      "gggggddddggggggg", "gggddvvvvddggggg", "ggdvvvvvvvvdgggg", "gdvvvvdvvvvvdggg",
      "gdvvvvvvvvvvdggg", "dvvdvvvvvdvvvdgg", "dvvvvvvvvvvvvdgg", "dvvvvvdvvvvvvdgg",
      "gdvvvvvvvvvvdggg", "gdvvvvvvvdvvdggg", "ggdvvvvvvvvdgggg", "gggddvvvvddggggg",
      "gggggdxxdggggggg", "gggggdxxdggggggg", "ggggdxxxxdgggggg", "gggggggggggggggg",
    ], m);
    set[T_ROCK] = buildTileSprite([
      "gggggggggggggggg", "ggggrrrrrrgggggg", "gggrrrrrrrrggggg", "ggrrrrrrrrrrgggg",
      "grrrrrrorrrrrggg", "grrrrrrorrrrrrgg", "grrrrrorrrrrrrgg", "grrrrrorrrrrrrgg",
      "grrrrorrrrrrrrgg", "grrrrorrrrorrrgg", "grrrorrrrrrorrgg", "grrorrrrrrrrorgg",
      "grorrrrrrrrrrogg", "ggoooooooooooggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_BUSH] = buildTileSprite([
      "gggggggggggggggg", "gggggddddggggggg", "ggggdvvvvdgggggg", "gggdvvvvvvdggggg",
      "ggdvvdvvvvvdgggg", "ggdvvvvvdvvdgggg", "ggdvvvvvvvvdgggg", "ggdvdvvvvvvdgggg",
      "ggdvvvvvdvvdgggg", "gggdvvvvvvdggggg", "ggggdvvvvdgggggg", "gggggddddggggggg",
      "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_GRAVE] = buildTileSprite([
      "gggggggggggggggg", "gggggaaaaaagggggg".slice(0, 16), "ggggaaaaaaaaggggg".slice(0, 16), "ggggaabbbbaaggggg".slice(0, 16),
      "ggggaabaabaaggggg".slice(0, 16), "ggggaaaaaaaaggggg".slice(0, 16), "ggggaabbbbaaggggg".slice(0, 16), "ggggaaaaaaaaggggg".slice(0, 16),
      "ggggaaaaaaaaggggg".slice(0, 16), "ggggaaaaaaaaggggg".slice(0, 16), "gggbbbbbbbbbbgggg".slice(0, 16), "gggggggggggggggg",
      "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_CACTUS] = buildTileSprite([
      "gggggggggggggggg", "ggggggvvggggggggg".slice(0, 16), "ggggggvvggggggggg".slice(0, 16), "ggvvggvvggvvgggg",
      "ggvvggvvggvvgggg", "ggvvggvvggvvgggg", "ggvvvvvvvvvvgggg", "ggggggvvggggggggg".slice(0, 16),
      "ggggggvvggggggggg".slice(0, 16), "ggggggvvggggggggg".slice(0, 16), "ggggggvvggggggggg".slice(0, 16), "ggggggvvggggggggg".slice(0, 16),
      "gggggdvvdggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_CAVE] = buildTileSprite([
      "rrrrrrrrrrrrrrrr", "rrrrrkkkkkkrrrrr", "rrrkkkkkkkkkkrrr", "rrkkkkkkkkkkkkrr",
      "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr",
      "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr",
      "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr", "rrkkkkkkkkkkkkrr",
    ], m);
    set[T_STAIRS] = buildTileSprite([
      "cccccccccccccccc", "caaaaaaaaaaaaaac", "caaaaaaaaaaaaaac", "cccccccccccccccc",
      "cbbbbbbbbbbbbbbc", "cbbbbbbbbbbbbbbc", "cccccccccccccccc", "cbbbbbbbbbbbbbbc",
      "cccccccccccccccc", "ckkkkkkkkkkkkkkc", "ckkkkkkkkkkkkkkc", "ckkkkkkkkkkkkkkc",
      "ckkkkkkkkkkkkkkc", "ckkkkkkkkkkkkkkc", "ckkkkkkkkkkkkkkc", "cccccccccccccccc",
    ], m);
    set[T_DOCK] = buildTileSprite([
      "wwyyyyyyyyyyyyww", "wwyxyyxyyxyyxyww", "wwyyyyyyyyyyyyww", "wwyyxyyxyyxyyyww",
      "wwyyyyyyyyyyyyww", "wwyxyyxyyxyyxyww", "wwyyyyyyyyyyyyww", "wwyyxyyxyyxyyyww",
      "wwyyyyyyyyyyyyww", "wwyxyyxyyxyyxyww", "wwyyyyyyyyyyyyww", "wwyyxyyxyyxyyyww",
      "wwyyyyyyyyyyyyww", "wwyxyyxyyxyyxyww", "wwyyyyyyyyyyyyww", "wwyyyyyyyyyyyyww",
    ], m);
    set[T_BRIDGE] = buildTileSprite([
      "yyyyyyyyyyyyyyyy", "yxyyxyyxyyxyyxyy", "yyyyyyyyyyyyyyyy", "xxxxxxxxxxxxxxxx",
      "yyyyyyyyyyyyyyyy", "yyxyyxyyxyyxyyxy", "yyyyyyyyyyyyyyyy", "xxxxxxxxxxxxxxxx",
      "yyyyyyyyyyyyyyyy", "yxyyxyyxyyxyyxyy", "yyyyyyyyyyyyyyyy", "xxxxxxxxxxxxxxxx",
      "yyyyyyyyyyyyyyyy", "yyxyyxyyxyyxyyxy", "yyyyyyyyyyyyyyyy", "yyyyyyyyyyyyyyyy",
    ], m);
    set[T_CRACK] = buildTileSprite([
      "gggggggggggggggg", "ggggrrrrrrgggggg", "gggrrrrkrrrggggg", "ggrrrrkkrrrrgggg",
      "grrrrrkrrrrrrggg", "grrrrkkrrrrrrrgg", "grrrrkrrrrrrrrgg", "grrrkkrrrrrrrrgg",
      "grrrrkkrrrrrrrgg", "grrrrrkrrrrrrrgg", "grrrrkkrrrrrrrgg", "grrrrkrrrrrrrogg",
      "grrrkkrrrrrrrogg", "ggoooooooooooggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_STUMP] = buildTileSprite([
      "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
      "gggggggggggggggg", "gggggxxxxggggggg", "ggggxeeeexgggggg", "ggggxexxexgggggg",
      "ggggxexxexgggggg", "ggggxeeeexgggggg", "gggggxxxxggggggg", "gggggggggggggggg",
      "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    // dungeon floor / wall / block / statue / gate
    set[T_DFLOOR] = buildTileSprite([
      "gggggggggggggggg", "gggggggggggggggg", "ggggggggggggsggg", "gggggggggggggggg",
      "ggsggggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
      "gggggggggggggggg", "gggggggggsgggggg", "gggggggggggggggg", "gggggggggggggggg",
      "ggggsggggggggggg", "gggggggggggggggg", "gggggggggggggggg", "gggggggggggggggg",
    ], m);
    set[T_DWALL] = buildTileSprite([
      "vvvvvvvdvvvvvvvd", "vvvvvvvdvvvvvvvd", "vvvvvvvdvvvvvvvd", "dddddddddddddddd",
      "vvvdvvvvvvvdvvvv", "vvvdvvvvvvvdvvvv", "vvvdvvvvvvvdvvvv", "dddddddddddddddd",
      "vvvvvvvdvvvvvvvd", "vvvvvvvdvvvvvvvd", "vvvvvvvdvvvvvvvd", "dddddddddddddddd",
      "vvvdvvvvvvvdvvvv", "vvvdvvvvvvvdvvvv", "vvvdvvvvvvvdvvvv", "dddddddddddddddd",
    ], m);
    set[T_DBLOCK] = buildTileSprite([
      "aaaaaaaaaaaaaaab", "abbbbbbbbbbbbbbb".replace(/b/g, "v").slice(0, 16), "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd",
      "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd",
      "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd",
      "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "avvvvvvvvvvvvvvd", "dddddddddddddddd",
    ], m);
    set[T_STATUE] = buildTileSprite([
      "gggggggggggggggg", "gggggabbbaagggggg".slice(0, 16), "ggggabbbbbagggggg".slice(0, 16), "ggggabcbcbagggggg".slice(0, 16),
      "ggggabbbbbagggggg".slice(0, 16), "gggggabbbagggggg", "ggggabbbbbagggggg".slice(0, 16), "gggabbbbbbbagggg",
      "ggabbabbbabbaggg", "ggabbabbbabbaggg", "gggggabbbagggggg", "gggggabbbagggggg",
      "ggggabbbbbagggggg".slice(0, 16), "gggabbbbbbbagggg", "ggbbbbbbbbbbbggg", "gggggggggggggggg",
    ], m);
    set[T_GATE] = buildTileSprite([
      "gggggggggggggggg", "gggggabbbaagggggg".slice(0, 16), "ggggabbbbbagggggg".slice(0, 16), "ggggabebebagggggg".slice(0, 16),
      "ggggabbbbbagggggg".slice(0, 16), "gggggabbbagggggg", "ggggabbbbbagggggg".slice(0, 16), "gggabbbbbbbagggg",
      "ggabbabbbabbaggg", "ggabbabbbabbaggg", "gggggabbbagggggg", "gggggabbbagggggg",
      "ggggabbbbbagggggg".slice(0, 16), "gggabbbbbbbagggg", "ggbbbbbbbbbbbggg", "gggggggggggggggg",
    ], m);
    // animated water (2 frames)
    const wf0 = buildTileSprite([
      "wwwwwwwwwwwwwwww", "wwwwwwwwwwwwwwww", "wwuuwwwwwuuwwwww", "wwwwwwwwwwwwwwww",
      "wwwwwwuuwwwwwwuu", "wwwwwwwwwwwwwwww", "wuuwwwwwwwwuuwww", "wwwwwwwwwwwwwwww",
      "wwwwwuuwwwwwwwww", "wwwwwwwwwwuuwwww", "wwwwwwwwwwwwwwww", "wuuwwwwwuuwwwwww",
      "wwwwwwwwwwwwwwww", "wwwwuuwwwwwwuuww", "wwwwwwwwwwwwwwww", "wwwwwwwwwwwwwwww",
    ], m);
    const wf1 = buildTileSprite([
      "wwwwwwwwwwwwwwww", "wuuwwwwwuuwwwwww", "wwwwwwwwwwwwwwww", "wwwwwuuwwwwwwuuw",
      "wwwwwwwwwwwwwwww", "wwuuwwwwwwuuwwww", "wwwwwwwwwwwwwwww", "wwwwwwuuwwwwwwww",
      "wwwwwwwwwwwwwwww", "wwuuwwwwwwwwuuww", "wwwwwwwwwwwwwwww", "wwwwwwwwuuwwwwww",
      "wwuuwwwwwwwwwwww", "wwwwwwwwwwwwwuuw", "wwwwwwwwwwwwwwww", "wwwwwwwwwwwwwwww",
    ], m);
    set.waterFrames = [wf0, wf1];
    set[T_WATER] = wf0;
    // dungeon water: darker
    const dm = Object.assign({}, m, { w: "#0038A8", u: "#3CBCFC" });
    set[T_DWATER] = buildTileSprite([
      "wwwwwwwwwwwwwwww", "wwwwwwwwwwwwwwww", "wwuuwwwwwuuwwwww", "wwwwwwwwwwwwwwww",
      "wwwwwwuuwwwwwwuu", "wwwwwwwwwwwwwwww", "wuuwwwwwwwwuuwww", "wwwwwwwwwwwwwwww",
      "wwwwwuuwwwwwwwww", "wwwwwwwwwwuuwwww", "wwwwwwwwwwwwwwww", "wuuwwwwwuuwwwwww",
      "wwwwwwwwwwwwwwww", "wwwwuuwwwwwwuuww", "wwwwwwwwwwwwwwww", "wwwwwwwwwwwwwwww",
    ], dm);
    TILESETS[themeName] = set;
  }
}

let waterAnimFrame = 0; // toggled by main loop
function drawTile(ctx, theme, id, px, py) {
  const set = TILESETS[theme] || TILESETS.field;
  let c;
  if (id === T_WATER) c = set.waterFrames[waterAnimFrame];
  else c = set[id];
  if (!c) c = set[T_GROUND];
  ctx.drawImage(c, px, py);
}
