"use strict";
// ---------- Dungeons ----------
// Rooms are 16x11 tiles: 2-thick walls, doors centered on each side.
// Door types: open, wall, lock, shutter, bomb, boss (opens on boss death), exit.

const DUNGEONS = {
  1: {
    name: "TIDAL HOLLOW", music: "dungeon_water",
    entranceOW: { sx: 13, sy: 3, x: 8, y: 5 },
    start: "2,4",
    rooms: {
      "2,4": { doors: { n: "open", s: "exit", e: "open", w: "wall" }, e: ["oozelet", "oozelet", "oozelet"] },
      "3,4": { doors: { w: "open" }, item: "compass", e: ["oozelet", "oozelet", "oozelet", "oozelet"] },
      "2,3": { doors: { s: "open", n: "open", e: "open", w: "open" }, e: ["ooze", "ooze"] },
      "1,3": { doors: { e: "open" }, old: ["THE WYRM FEARS STEEL.", "A SLEEPING EYE GUARDS", "HIS DOOR. WAKE IT FROM", "AFAR."] },
      "3,3": { doors: { w: "open" }, e: ["oozelet", "oozelet", "oozelet", "spiketrap", "spiketrap"] },
      // the wyrm's door wakes with the crystal eye on the islet: only a thrown boomerang
      // (or, later, an arrow) reaches it
      "2,2": { doors: { s: "open", n: "shutter", w: "lock", e: "open" }, eyes: true, e: ["iron", "iron"],
        layout: ["........WWW.", "........WEW.", "........WWW.", "............", "............", "............", "............"] },
      "1,2": { doors: { e: "lock" }, item: "boomerang", e: ["ooze", "ooze", "clutch"] },
      "3,2": { doors: { w: "open", n: "shutter" }, item: "map", e: ["oozelet", "spiketrap"], push: { x: 10, y: 3 } },
      "3,1": { doors: { s: "open" }, item: "key", e: ["clutch", "clutch"] },
      "2,1": { doors: { s: "open", n: "boss" }, boss: "wyrm" },
      "2,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  2: {
    name: "ROOT WARREN", music: "dungeon_root",
    entranceOW: { sx: 2, sy: 5, x: 7, y: 2 },
    start: "1,4",
    rooms: {
      "1,4": { doors: { n: "open", s: "exit", e: "open", w: "open" }, e: ["oozelet", "oozelet", "oozelet"] },
      // the compass shows itself once the eye in the pit is struck from afar
      "0,4": { doors: { e: "open" }, item: "compass", eyes: true, itemOn: "eyes", e: ["ooze", "oozelet", "oozelet"],
        layout: ["............", ".PPP........", ".PEP........", ".PPP........", "............", "............", "............"] },
      "2,4": { doors: { w: "open" }, old: ["SHADOWS FLEE A FLAME,", "SO CARRY FIRE BELOW.", "THE FAR EYE WAKES ONLY", "TO A HUNTER'S ARROW."] },
      "1,3": { doors: { s: "open", n: "shutter", w: "open", e: "open" }, e: ["iron", "iron"] },
      "0,3": { doors: { e: "open" }, dark: true, item: "key", e: ["ooze", "oozelet", "oozelet"] },
      "2,3": { doors: { w: "open", e: "bomb", n: "open" }, item: "map", e: ["spiketrap", "spiketrap", "ooze"] },
      "3,3": { doors: { w: "bomb" }, item: "gems30" },
      "2,2": { doors: { s: "open", w: "open" }, e: ["iron", "iron", "iron"] },
      // the marrowworm's door wakes with the eye across the chasm: too far for the
      // boomerang (it turns back over the pits), so only an arrow reaches it. The iron-bound
      // post under the eye bars the throw from below, whatever the hero carries (a statue
      // there, tall as it is, stood against the eye's pedestal; the east doorway keeps it
      // from moving down a tile, and a rock or peg could be cleared)
      "1,2": { doors: { s: "open", n: "shutter", e: "open", w: "lock" }, eyes: true, e: ["clutch", "clutch"],
        layout: [".......PPPPS", ".....PPPPPPE", ".....PPPPPPH", "............", "............", "............", "............"] },
      "0,2": { doors: { e: "lock" }, item: "bow", e: ["ooze", "ooze", "spiketrap"] },
      "1,1": { doors: { s: "open", n: "boss" }, boss: "worm" },
      "1,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  3: {
    name: "BARROW DEEP", music: "dungeon_grave",
    entranceOW: { sx: 1, sy: 1, x: 7, y: 2 },
    start: "2,4",
    rooms: {
      "2,4": { doors: { s: "exit", n: "open", e: "open", w: "open" }, e: ["oozelet", "oozelet", "oozelet"] },
      "1,4": { doors: { e: "open" }, old: ["ONLY A HUNTER'S ARROW", "PIERCES THE EYE THAT", "NEVER SLEEPS."] },
      "3,4": { doors: { w: "open" }, item: "compass", e: ["clutch", "oozelet", "oozelet"] },
      "2,3": { doors: { s: "open", n: "open", e: "open", w: "open" }, e: ["hexer", "hexer"] },
      "1,3": { doors: { e: "open" }, moat: true, item: "key", e: ["clutch", "clutch"] },
      "3,3": { doors: { w: "open", e: "bomb", n: "open" }, dark: true, item: "map", e: ["iron", "iron"] },
      "4,3": { doors: { w: "bomb" }, item: "gems30" },
      "2,2": { doors: { s: "shutter", n: "lock", w: "lock", e: "open" }, e: ["iron", "iron", "iron"] },
      "3,2": { doors: { w: "open", s: "open" }, keyDrop: true, e: ["hexer", "hexer", "hexer"] },
      "1,2": { doors: { e: "lock" }, item: "raft", e: ["spiketrap", "spiketrap", "spiketrap", "spiketrap", "ooze"] },
      "2,1": { doors: { s: "lock", n: "boss" }, boss: "gazer" },
      "2,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  // ---- Level 4: the desert vault. The tether hook crosses its pits. ----
  4: {
    name: "SUNSCAR VAULT", music: "desert",
    entranceOW: { sx: 14, sy: 7, x: 7, y: 3 },
    start: "2,4",
    rooms: {
      "2,4": { doors: { n: "open", s: "exit", w: "open", e: "open" }, e: ["scarab", "scarab", "bat"],
        layout: ["............", "..S......S..", "............", "............", "............", "..S......S..", "............"] },
      "1,4": { doors: { e: "open" }, e: ["ooze", "ooze", "scarab"], item: "compass",
        layout: ["............", ".PP......PP.", ".P........P.", "............", ".P........P.", ".PP......PP.", "............"] },
      "3,4": { doors: { w: "open" }, old: ["THE TETHER BITES ONLY", "WOOD BOUND IN IRON.", "AIM, AND IT CARRIES", "YOU OVER THE DROP."] },
      // the drop across the middle is crossed with the hook, from the post on the far side
      "2,3": { doors: { s: "open", w: "open", n: "open", e: "lock" }, e: ["bat", "bat", "caster", "caster"],
        layout: ["...H....H...", "PP........PP", ".PPPPPPPPPP.", "..PPPPPPPP..", "..PPPPPPPP..", "............", "............"] },
      "1,3": { doors: { e: "open" }, e: ["ooze", "ooze", "iron"], item: "hook",
        layout: ["............", ".PP......PP.", ".P........P.", "............", ".P........P.", ".PP......PP.", "............"] },
      "3,3": { doors: { w: "lock", n: "open" }, e: ["caster", "caster", "iron", "scarab"], item: "map" },
      "2,2": { doors: { s: "open", n: "lock", e: "open", w: "open" }, e: ["scarab", "scarab", "scarab", "caster", "iron"], keyDrop: true,
        layout: ["............", "..S......S..", "............", "............", "............", "..S......S..", "............"] },
      // hook west over the chasm to the key, and hook back east
      "1,2": { doors: { e: "open" }, e: ["bat", "bat"], item: "key", itemAt: [2, 2],
        layout: ["....PPPP....", "....PPPP....", "....PPPP....", "..H.PPPP....", "....PPPP....", "....PPPP.H..", "....PPPP...."] },
      // two blocks onto two switches
      "3,2": { doors: { w: "open", s: "open", n: "shutter" }, e: ["scarab", "scarab"], switches: true,
        layout: ["............", "..O......O..", "............", "...B....B...", "............", "............", "............"] },
      "3,1": { doors: { s: "shutter" }, item: "heartpiece" },
      "2,1": { doors: { s: "lock", n: "boss" }, boss: "dunescale" },
      "2,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  // ---- Level 5: the ice well. The power glove lifts its rocks. ----
  5: {
    name: "RIMEWELL", music: "ice",
    entranceOW: { sx: 2, sy: 0, x: 7, y: 3 },
    start: "2,4",
    rooms: {
      "2,4": { doors: { n: "open", s: "exit", w: "open", e: "open" }, e: ["bat", "bat", "chiller", "chiller"],
        layout: ["............", ".IIII..IIII.", ".IIII..IIII.", "............", ".IIII..IIII.", "............", "............"] },
      "1,4": { doors: { e: "open" }, e: ["ooze", "ooze", "chiller"], item: "compass", potItems: { "3,2": "heart", "12,7": "gems10" },
        layout: [".o........o.", "............", "............", "............", "............", "..........o.", "............"] },
      "3,4": { doors: { w: "open" }, old: ["WHAT BARS YOUR WAY", "CAN BE LIFTED AWAY.", "THE GLOVE LENDS THE", "ARMS FOR IT."] },
      // slide the block along the ice onto the switch
      "2,3": { doors: { s: "open", n: "shutter", w: "open", e: "lock" }, e: ["chiller", "chiller", "bat"], switches: true,
        layout: ["............", "..S......S..", "IIIIIIIIIIII", "..IIIIIIII..", "IIIIIIIIIIII", ".OIIIIIIB...", "............"] },
      "1,3": { doors: { e: "open" }, e: ["ooze", "ooze", "iron", "bat"], item: "glove" },
      // heavy rocks bar the way north
      "3,3": { doors: { w: "lock", n: "open" }, e: ["chiller", "chiller", "iron", "bat"], item: "map", itemAt: [11, 6],
        layout: ["....RRRR....", "....R..R....", "............", "............", "............", "............", "............"] },
      // (no door east: the far rooms 3,2 and 3,1 are reached only past the rocks of 3,3)
      // heavy rocks bar the guardian's door too, as in 3,3: the key the foes drop here
      // can't take him to Frostmaw before he has the glove
      "2,2": { doors: { s: "open", n: "lock", e: "wall", w: "open" }, e: ["chiller", "chiller", "iron", "iron", "bat"], keyDrop: true,
        layout: ["....RRRR....", ".II.R..R.II.", ".II......II.", "............", ".II......II.", ".II......II.", "............"] },
      // the key's pot is ringed with heavy rocks: the glove from 1,3 opens the way to it
      "1,2": { doors: { e: "open" }, e: ["bat", "bat", "chiller"], potItems: { "7,5": "key" },
        layout: ["............", "..o..R..o...", ".....R......", "..R.RoR.R...", ".....R......", "..o..R..o...", "............"] },
      "3,2": { doors: { w: "wall", s: "open", n: "shutter" }, e: ["chiller", "chiller", "bat"], switches: true,
        layout: ["............", ".O........O.", ".IIIIIIIIII.", ".IIIIIIIIII.", ".IIIIIIIIII.", "...B....B...", "............"] },
      "3,1": { doors: { s: "shutter" }, item: "heartpiece" },
      // (a rock and a pot by each wall, and a rock a tile in from them: none on the south
      // wall's trim, and none stacked right over another)
      "2,1": { doors: { s: "lock", n: "boss" }, boss: "frostmaw",
        layout: ["............", "............", "............", ".R........R.", "............", ".oR......Ro.", "............"] },
      "2,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  // ---- Level 6: the cinder depths. The earth hammer drives its pegs. ----
  6: {
    name: "CINDER DEEP", music: "fire",
    entranceOW: { sx: 13, sy: 0, x: 7, y: 3 },
    start: "2,4",
    rooms: {
      "2,4": { doors: { n: "open", s: "exit", w: "open", e: "open" }, e: ["fireimp", "fireimp", "fireimp", "bat"],
        layout: ["............", ".LL......LL.", ".LL......LL.", "............", ".LL......LL.", ".LL......LL.", "............"] },
      "1,4": { doors: { e: "open" }, e: ["fireimp", "fireimp", "ooze", "ooze"], item: "compass",
        layout: ["............", "..G......G..", "............", "............", "............", "..G......G..", "............"] },
      "3,4": { doors: { w: "open" }, old: ["STAKES THAT BAR THE", "PATH GIVE WAY TO A", "HEAVY BLOW. SO DO", "THE SHELLED ONES."] },
      // a lava moat, crossed where the pegs stand; the pegs need the hammer
      "2,3": { doors: { s: "open", n: "open", w: "open", e: "lock" }, e: ["fireimp", "fireimp", "shellback", "bat"],
        layout: ["....GGGG....", "LLLL....LLLL", ".LLL....LLL.", "............", "............", "............", "............"] },
      "1,3": { doors: { e: "open" }, e: ["shellback", "shellback", "fireimp"], item: "hammer" },
      "3,3": { doors: { w: "lock", n: "open" }, e: ["fireimp", "fireimp", "shellback", "bat"], item: "map",
        layout: ["....G..G....", "............", "..GGG..GGG..", "..G......G..", "..GGG..GGG..", "............", "............"] },
      "2,2": { doors: { s: "open", n: "lock", e: "open", w: "open" }, e: ["shellback", "shellback", "fireimp", "fireimp", "bat"], keyDrop: true,
        layout: ["............", ".L........L.", ".L..S..S..L.", "............", ".L..S..S..L.", ".L........L.", "............"] },
      // the key sits in a corner walled off by two pegs
      "1,2": { doors: { e: "open" }, e: ["fireimp", "fireimp", "bat"], item: "key", itemAt: [2, 2],
        layout: [".G..........", "G...........", "............", "...LLLL.....", "...LLLL.....", "............", "............"] },
      "3,2": { doors: { w: "open", s: "open", n: "shutter" }, e: ["fireimp", "shellback", "bat"], switches: true,
        layout: ["............", "..O......O..", "..G......G..", "............", "...B....B...", "............", "............"] },
      "3,1": { doors: { s: "shutter" }, item: "heartpiece" },
      "2,1": { doors: { s: "lock", n: "boss" }, boss: "emberhulk",
        layout: ["............", ".LL......LL.", "............", "............", "............", ".LL......LL.", "............"] },
      "2,0": { doors: { s: "open" }, item: "shard" },
    },
  },
  // ---- Level 7: the Shadow Keep. Six shards break its seal. ----
  7: {
    name: "SHADOW KEEP", music: "finale",
    entranceOW: { sx: 6, sy: 0, x: 7, y: 2 },
    start: "3,4",
    // Every treasure of the quest is needed on the way to Vex: the glove in the first
    // hall, an arrow or the boomerang for the eyes above it, the hook for the keys
    // east, and the hammer at his door.
    rooms: {
      // heavy rocks heaped in the north doorway (the power glove)
      "3,4": { doors: { s: "exit", n: "open", w: "open", e: "open" }, e: ["iron", "hexer", "scarab"],
        layout: ["....RRRR....", "....R..R....", "............", "............", "............", "............", "............"] },
      "2,4": { doors: { e: "open" }, old: ["VEX FLITS FROM SHADOW", "TO SHADOW. WHILE HE", "TAKES FORM NO BLADE", "BITES: STRIKE AFTER!"] },
      // the key waits past a chasm: hook east to the post, and west again from the far ledge
      "4,4": { doors: { w: "open" }, item: "key", itemAt: [12, 7], e: ["bat", "bat", "hexer"],
        layout: [".....PPP....", ".....PPP.H..", ".....PPP....", ".....PPP....", ".....PPP....", "...H.PPP....", ".....PPP...."] },
      // two eyes in the far corners, over pits: wake both from afar to open the hall's
      // three onward doors (east and west lead round to the Tyrant's hall too)
      "3,3": { doors: { s: "open", n: "shutter", w: "shutter", e: "shutter" }, eyes: true, e: ["hexer", "iron", "clutch", "fireimp"],
        layout: ["EP........PE", "PP........PP", "............", "............", "............", "............", "............"] },
      "2,3": { doors: { e: "open", w: "shutter", n: "open" }, push: { x: 10, y: 5 }, e: ["ooze", "ooze", "shellback"] },
      "1,3": { doors: { e: "shutter" }, item: "heartcont", e: ["clutch", "clutch", "chiller"] },
      "2,2": { doors: { s: "open", n: "lock", e: "open" }, e: ["hexer", "hexer", "iron", "scarab"] },
      "2,1": { doors: { s: "lock" }, item: "heartcont", e: ["spiketrap", "spiketrap", "spiketrap", "spiketrap"] },
      // stakes fence the Tyrant's door (the earth hammer)
      "3,2": { doors: { s: "open", n: "lock", w: "open", e: "open" }, dark: true, e: ["shellback", "hexer", "clutch", "chiller"],
        layout: ["....G..G....", "....GGGG....", "............", "............", "............", "............", "............"] },
      "4,2": { doors: { w: "open", n: "lock", s: "open" }, e: ["iron", "iron", "iron", "scarab"] },
      // the key lies on an island ringed by a drop: hook onto the island's post, and off
      // again to the post by the east wall
      "4,3": { doors: { n: "open", w: "open" }, item: "key", itemAt: [6, 5], e: ["hexer", "chiller", "bat"],
        layout: ["............", "...PPPPPP...", "...P...HP...", "...P....P...", "...P....P.H.", "...PPPPPP...", "............"] },
      "4,1": { doors: { s: "lock" }, dark: true, item: "key", e: ["hexer", "hexer", "hexer"] },
      "3,1": { doors: { s: "lock", n: "boss" }, boss: "vex" },
      "3,0": { doors: { s: "open" }, sage: true },
    },
  },
};

function getDungeonRoom(dnum, rx, ry) {
  const d = DUNGEONS[dnum];
  return d ? d.rooms[rx + "," + ry] : null;
}

// Canonical persistent flag for a door edge shared between two rooms.
function doorFlag(dnum, rx, ry, dir) {
  const nx = rx + DX[dir], ny = ry + DY[dir];
  if (dir === UP || dir === DOWN) {
    const top = Math.min(ry, ny);
    return "d" + dnum + ":V:" + rx + "," + top;
  }
  const left = Math.min(rx, nx);
  return "d" + dnum + ":H:" + left + "," + ry;
}

// A peg driven flush with the hammer (remembered for good).
function pieceFlag(dnum, rx, ry, tx, ty) { return "d" + dnum + ":pc:" + rx + "," + ry + ":" + tx + "," + ty; }
// A crystal eye woken by an arrow or the boomerang (remembered for good).
function eyeFlag(dnum, rx, ry, tx, ty) { return "d" + dnum + ":eye:" + rx + "," + ry + ":" + tx + "," + ty; }
// A room of floor switches or crystal eyes that has been solved (its shutters stay open).
function solvedFlag(dnum, rx, ry) { return "d" + dnum + ":sw:" + rx + "," + ry; }

// Door cell coordinates per side (2-tile passage through 2-thick walls).
const DOOR_CELLS = {
  [UP]: [[7, 0], [8, 0], [7, 1], [8, 1]],
  [DOWN]: [[7, 9], [8, 9], [7, 10], [8, 10]],
  [LEFT]: [[0, 5], [1, 5]],
  [RIGHT]: [[14, 5], [15, 5]],
};

// Is this door currently passable? `shut` is the live shutter state for the room.
function doorPassable(dnum, rx, ry, dir, shut) {
  const room = getDungeonRoom(dnum, rx, ry);
  if (!room) return false;
  const t = room.doors[["n", "s", "w", "e"][dir === UP ? 0 : dir === DOWN ? 1 : dir === LEFT ? 2 : 3]];
  if (!t || t === "wall") return false;
  if (t === "open" || t === "exit") return !(shut && shut[dir]);
  if (t === "lock" || t === "bomb") return !!G.flags[doorFlag(dnum, rx, ry, dir)];
  if (t === "shutter") return !(shut && shut[dir]);
  if (t === "boss") return !!G.flags["d" + dnum + ":boss"];
  return false;
}

function doorTypeOf(room, dir) {
  return room.doors[dir === UP ? "n" : dir === DOWN ? "s" : dir === LEFT ? "w" : "e"] || "wall";
}

// Movable room pieces: drawn every frame on top of the baked room, never baked in.
const PIECE_TILES = new Set([T_DBLOCK, T_DPOT, T_DROCK, T_DPEG]);

// The pieces a room starts with (from its layout, blocks and push block), as a Map
// "x,y" -> tile. Pegs already driven flush are left out.
function initialRoomPieces(dnum, rx, ry, pushState) {
  const room = getDungeonRoom(dnum, rx, ry), m = new Map();
  if (room.layout) {
    for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
      const t = LAYOUT_TILES[room.layout[r][c] || "."];
      const tx = c + 2, ty = r + 2;
      if (!PIECE_TILES.has(t)) continue;
      if (t === T_DPEG && G.flags && G.flags[pieceFlag(dnum, rx, ry, tx, ty)]) continue;
      m.set(tx + "," + ty, t);
    }
  }
  if (room.blocks) for (const [bx, by] of room.blocks) m.set(bx + "," + by, T_DBLOCK);
  if (room.push) {
    const p = pushState && pushState.done ? pushState : room.push;
    m.set(p.x + "," + p.y, T_DBLOCK);
  }
  return m;
}

// Build the tile grid for a room given live door passability. `pieces` is the live
// piece map (defaults to the room's starting pieces). The grid carries `floor`: the
// same room without any pieces, which is what the baked scene shows.
function buildRoomTiles(dnum, rx, ry, shut, pushState, pieces) {
  const room = getDungeonRoom(dnum, rx, ry);
  const tiles = [];
  for (let y = 0; y < ROWS; y++) {
    tiles.push(new Array(COLS));
    for (let x = 0; x < COLS; x++) {
      tiles[y][x] = (x < 2 || x > 13 || y < 2 || y > 8) ? T_DWALL : T_DFLOOR;
    }
  }
  if (room.moat) {
    for (let y = 3; y <= 7; y++) for (let x = 5; x <= 10; x++) {
      const island = (x >= 6 && x <= 9 && y >= 4 && y <= 6);
      tiles[y][x] = island ? T_DFLOOR : T_DWATER;
    }
  }
  // hand-drawn interior: 7 rows x 12 letters (see LAYOUT_TILES); pieces come separately
  if (room.layout) {
    const solved = G.flags && G.flags[solvedFlag(dnum, rx, ry)];
    for (let r = 0; r < 7; r++) for (let c = 0; c < 12; c++) {
      let t = LAYOUT_TILES[room.layout[r][c] || "."];
      if (t === undefined || PIECE_TILES.has(t)) t = T_DFLOOR;
      // an eye once woken stays awake
      if (t === T_DEYE && (solved || (G.flags && G.flags[eyeFlag(dnum, rx, ry, c + 2, r + 2)]))) t = T_DEYEON;
      tiles[r + 2][c + 2] = t;
    }
  }
  if (room.boss) {
    // a statue in each corner, save where the layout sets a pot or rock (lifted, it
    // must leave bare floor behind, not a statue)
    for (const [x, y] of [[3, 3], [12, 3], [3, 7], [12, 7]]) {
      if (room.layout && PIECE_TILES.has(LAYOUT_TILES[room.layout[y - 2][x - 2]])) continue;
      tiles[y][x] = T_STATUE;
    }
  }
  for (let dir = 0; dir < 4; dir++) {
    if (doorPassable(dnum, rx, ry, dir, shut)) {
      for (const [cx, cy] of DOOR_CELLS[dir]) tiles[cy][cx] = T_DFLOOR;
    }
  }
  tiles.floor = tiles.map(row => row.slice());
  for (const [k, t] of (pieces || initialRoomPieces(dnum, rx, ry, pushState))) {
    const [x, y] = k.split(",").map(Number);
    tiles[y][x] = t;
  }
  return tiles;
}

// Tiles just inside each doorway of a room (they must stay passable, or hold only a
// piece the hero can clear: a rock, a peg, a pot or a block).
const DOOR_ENTRY = { n: [[7, 2], [8, 2]], s: [[7, 8], [8, 8]], w: [[2, 5]], e: [[13, 5]] };

// Boot-time sanity checks; logs problems to the console.
function validateDungeons() {
  const compat = { open: ["open", "shutter", "boss"], lock: ["lock"], bomb: ["bomb"], shutter: ["open", "shutter"], boss: ["open"], exit: [] };
  for (const dnum in DUNGEONS) {
    const d = DUNGEONS[dnum];
    let keys = 0, locks = new Set();
    for (const key in d.rooms) {
      const [rx, ry] = key.split(",").map(Number);
      const room = d.rooms[key];
      // hand-drawn rooms: 7 rows of 12 known letters; crystal eyes only in (and always
      // in) a room that waits on them; doorways left clear
      if (room.layout) {
        if (room.layout.length !== 7 || room.layout.some(row => row.length !== 12 || [...row].some(ch => !(ch in LAYOUT_TILES)))) {
          console.warn("D" + dnum + " room " + key + ": layout must be 7 rows of 12 known letters");
        }
        const eyes = room.layout.join("").split("E").length - 1;
        if (!!room.eyes !== eyes > 0) console.warn("D" + dnum + " room " + key + ": eyes " + (room.eyes ? "expected but missing" : "in a room that doesn't wait on them"));
        for (const side in DOOR_ENTRY) {
          if (!room.doors[side] || room.doors[side] === "wall") continue;
          for (const [tx, ty] of DOOR_ENTRY[side]) {
            const t = LAYOUT_TILES[room.layout[ty - 2][tx - 2]];
            if (t !== T_DFLOOR && !PIECE_TILES.has(t) && t !== T_DSWITCH && t !== T_DICE) console.warn("D" + dnum + " room " + key + ": doorway " + side + " blocked at " + tx + "," + ty);
          }
        }
      } else if (room.eyes) console.warn("D" + dnum + " room " + key + ": eyes but no layout");
      if (room.itemOn === "eyes" && !(room.eyes && room.item)) console.warn("D" + dnum + " room " + key + ": item waits on eyes the room lacks");
      if (room.eyes && room.switches) console.warn("D" + dnum + " room " + key + ": eyes and floor switches can't share a room");
      if (room.item === "key") keys++;
      if (room.keyDrop) keys++;
      if (room.potItems) for (const k in room.potItems) if (room.potItems[k] === "key") keys++;
      for (let dir = 0; dir < 4; dir++) {
        const t = doorTypeOf(room, dir);
        if (t === "wall") continue;
        if (t === "lock") locks.add(doorFlag(Number(dnum), rx, ry, dir));
        const nk = (rx + DX[dir]) + "," + (ry + DY[dir]);
        const nroom = d.rooms[nk];
        if (t === "exit") {
          if (key !== d.start) console.warn("D" + dnum + " exit door not in start room:", key);
          continue;
        }
        if (!nroom) { console.warn("D" + dnum + " door to missing room", key, "dir", dir); continue; }
        const back = doorTypeOf(nroom, OPP[dir]);
        if (compat[t] && !compat[t].includes(back)) {
          console.warn("D" + dnum + " door mismatch", key, t, "<->", nk, back);
        }
      }
    }
    if (keys < locks.size) console.warn("D" + dnum + " has " + keys + " keys for " + locks.size + " locks");
  }
}
