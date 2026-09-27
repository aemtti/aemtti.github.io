"use strict";
// ---------- Game state, fixed-timestep loop, mode dispatch ----------

const G = {};
let cv = null, ctx = null;

function resetGameState() {
  G.mode = "title";
  G.area = "overworld";
  G.sx = OW_START.sx; G.sy = OW_START.sy;
  G.screen = null; G.tiles = null;
  G.enemies = []; G.projectiles = []; G.pickups = []; G.effects = [];
  G.flags = {};
  G.dmaps = { 1: {}, 2: {}, 3: {}, 4: {}, 5: {}, 6: {}, 7: {} };
  G.inv = { sword: 0, shield: 1, boomerang: 0, bow: 0, candle: 0, ladder: 0, raft: 0, ring: 0, potion: 0, hook: 0, glove: 0, hammer: 0 };
  G.heartPieces = 0;                       // pieces toward the next heart (0..3)
  G.stats = { frames: 0, deaths: 0 };      // for the record shown after the credits
  G.hp = 6; G.maxhp = 6;
  G.gems = 0; G.keys = 0; G.bombs = 0; G.bombMax = 8;
  G.bItem = null; G.invCursor = 0; G.invReturn = "play";
  G.shards = 0; G.hintIdx = 0;
  G.dungeon = 0; G.rx = 0; G.ry = 0;
  G.shut = {}; G.pushState = null; G.roomClearHandled = false;
  G.roomNPC = null; G.roomLit = false;
  G.cave = null; G.caveReturn = null;
  G.stepCooldown = 0; G.gateCooldown = 0; G.lockMsgT = 0;
  G.boomerActive = false; G.beamActive = false; G.flameUsed = false;
  G.dragToEntrance = false; G.shardWarp = 0;
  G.keyRest = {};                          // where dropped keys left lying came to rest
  G.trans = null; G.dialog = null; G.banner = null;
  G.deathT = 0; G.winT = 0;
  G.frame = 0; G.titleT = 0; G.titleMenu = false; G.menuIdx = 0;
  G.saveMsg = 0; G.saveNote = 0; G.loadErr = 0;
  G.musicCue = null; G.beatN = 0;
}

function newGame() {
  resetGameState();
  initPlayer();
  G.mode = "play";
  // (the screen's own music starts with it: overworldMusic)
  loadOverworldScreen(OW_START.sx, OW_START.sy, OW_START.x, OW_START.y);
}

// ---------- Music for the place the hero is in (js/sound/music_*.js) ----------
// Out of doors: Brambleford's own tune on its screen, else the field theme with the colour
// layer of the region the screen lies in (music_field.js: one region on at a time; a change
// lands on the next bar line, and the tune itself never restarts between screens).
const REGION_LAYER = { P: "plains", F: "forest", M: "mountain", L: "lake", D: "desert", G: "graveyard" };
function overworldMusic(sx, sy) {
  G.musicCue = null;
  const o = OVERRIDES[sx + "," + sy];
  if (o && o.stamp === "village") { Sound.music("village"); return; }
  Sound.music("overworld");
  // (only the layers that change: told to switch on a layer that is already on, the engine
  // plays that layer's notes up to its look-ahead a second time, a doubled drum hit at the
  // next bar line when the hero crosses between two screens of the same region)
  const on = REGION_LAYER[biomeAt(sx, sy)] || "plains", layers = {};
  for (const k in REGION_LAYER) {
    const n = REGION_LAYER[k], want = n === on;
    if (!Sound.layerOn || Sound.layerOn(n) !== want) layers[n] = want;
  }
  Sound.setLayer(layers);
}
// Indoors: a Brambleford home, a shop, or the cave's ambience (hermits, gifts, the gamble,
// the spirit, the children's hiding places).
function caveMusic(def) {
  G.musicCue = null;
  Sound.music(def.room === "house" ? "house" : def.shop ? "shop" : "cave");
}
// Music that waits for a sound to end (the boss theme after the roar, the victory stinger
// after the guardian's fall), counted in game ticks by step(). Any other music call for a
// place clears it.
function queueMusic(ticks, fn) { G.musicCue = { t: ticks, fn }; }
// A guardian's hall: its roar first, then (at the roar's tail) the boss theme with this
// level's colour layer (music_boss.js: d1..d6), or Vex's own theme, calm until he rages.
function bossMusic(kind) {
  const d = G.dungeon;
  queueMusic(36, () => {
    if (kind === "vex") { Sound.music("lastboss"); Sound.setLayer("rage", false); return; }
    Sound.music("boss");
    const layers = {};
    for (let i = 1; i <= 6; i++) layers["d" + i] = i === d;
    Sound.setLayer(layers);
  });
}

// ---------- Overworld ----------
function loadOverworldScreen(sx, sy, px, py) {
  G.area = "overworld";
  G.sx = sx; G.sy = sy;
  G.screen = getScreen(sx, sy);
  G.tiles = G.screen.tiles;
  G.enemies = []; G.projectiles = []; G.pickups = []; G.effects = [];
  G.boomerActive = false; G.beamActive = false; G.flameUsed = false;
  G.roomNPC = null; G.dungeon = 0;
  if (px !== undefined) { P.x = px; P.y = py; }
  // a ladder, raft or tether never carries over to a newly loaded screen, and a dock
  // under the hero's feet waits until he steps off and on again
  P.laddering = null; P.rafting = null; P.pull = null; P.slide = null; G.hookActive = false;
  P.dockLatch = true;
  G.stepCooldown = 30;
  spawnScreenEnemies(G.screen.enemies);
  spawnScreenTreasures();
  overworldMusic(sx, sy);
}

function emptyGroundGrid() {
  const t = [];
  for (let y = 0; y < ROWS; y++) t.push(new Array(COLS).fill(T_GROUND));
  return t;
}

// Called by the player when stepping on a cave/stairs tile.
function enterAt(tx, ty) {
  if (G.area !== "overworld") return;
  const key = tx + "," + ty;
  const dnum = G.screen.dungeonAt[key];
  if (dnum) { enterDungeon(dnum); return; }
  const cid = G.screen.caves[key];
  if (cid && CAVES[cid]) {
    const [ex, ey] = mouthExit(G.sx, G.sy, G.tiles, tx, ty);
    G.caveReturn = { sx: G.sx, sy: G.sy, x: ex * TS, y: ey * TS };
    P.laddering = null;
    // (a candle, boomerang or beam spent outside is ready again indoors)
    G.boomerActive = false; G.beamActive = false; G.flameUsed = false; G.hookActive = false;
    G.cave = setupCave(cid);
    G.area = "cave";
    G.mode = "cave";
    G.tiles = emptyGroundGrid();
    if (G.cave.def.room === "house") for (const f of houseFurniture(G.cave.def.layout)) for (let i = 0; i < f.h; i++) G.tiles[f.ty + i][f.tx] = T_HOUSE;
    G.enemies = []; G.projectiles = []; G.pickups = [];
    P.x = 120; P.y = PH - 32;
    P.dir = UP;
    G.stepCooldown = 30;
    // (a home's door creaks; a cave's steps go down)
    Sound.sfx(G.cave.def.room === "house" ? "door" : "stairs");
    caveMusic(G.cave.def);
  }
}

function exitCave() {
  const r = G.caveReturn;
  G.cave = null;
  loadOverworldScreen(r.sx, r.sy, r.x, r.y);
  P.dir = DOWN;
  G.mode = "play";
  Sound.sfx("exit_out");
}

// Ground the hero can be set down on: firm, and not a doorway that would swallow him.
function firmGround(t) { return standableTile(t) && t !== T_CAVE && t !== T_STAIRS && t !== T_HDOOR; }

// Where the hero comes back out of a mouth (cave, stairs, dungeon) at (tx, ty) on
// screen (sx, sy): the tile below it, or across a pool the first firm tile beyond the
// water straight below, or else the open ground nearest the tile below.
function mouthExit(sx, sy, tiles, tx, ty) {
  for (let y = ty + 1; y < ROWS; y++) {
    const t = tiles[y][tx];
    if (firmGround(t)) return [tx, y];
    if (!tileWater(t)) break;
  }
  return openGroundNear(sx, sy, tiles, tx, ty + 1) || [tx, ty + 1];
}

// The firm tile of overworld screen (sx, sy) nearest (tx, ty), preferring ground that
// walks to the start (so never water, never a pocket cut off from the world); null if
// the screen has no firm ground at all.
function openGroundNear(sx, sy, tiles, tx, ty) {
  const home = groundFromStart();
  let best = null, bd = Infinity;
  for (let pass = 0; pass < 2 && !best; pass++) {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (!firmGround(tiles[y][x]) || (pass === 0 && !home[(sy * ROWS + y) * WW + sx * COLS + x])) continue;
      const d = (x - tx) * (x - tx) + (y - ty) * (y - ty);
      if (d < bd) { bd = d; best = [x, y]; }
    }
  }
  return best;
}

// ---------- ground joined to the start ----------
// Flags over the whole world map (index gy * WW + gx) for the overworld ground the hero
// can get to from the start: on foot when `inv` is left out (worked out once and kept);
// with the items in `inv` he also spans a tile of water with the ladder, lifts heavy
// rocks with the glove, sails from dock to dock and rides the hook's tether to a post,
// each as the game allows it on one screen. (The world is laid out so that he can
// always come back the way he went.)
function groundFromStart(inv) {
  const W = worldMap();
  if (!inv && W.home) return W.home;
  const T = W.T, ww = WW, wh = WH, cols = COLS, rows = ROWS, dxs = DX, dys = DY, dock = T_DOCK, post = T_DPOST;
  const kit = inv || {}, reach = new Uint8Array(ww * wh), q = [];
  // what each kind of tile is to him, looked up once (off the map is nothing)
  const firmT = [], waterT = [], solidT = [];
  for (let t = 0; t < 32; t++) {
    firmT[t] = firmGround(t) || (!!kit.glove && t === T_DROCK);
    waterT[t] = tileWater(t); solidT[t] = tileSolid(t);
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= ww || y >= wh) ? -1 : T[y * ww + x];
  const add = (x, y) => { const k = y * ww + x; if (!reach[k]) { reach[k] = 1; q.push(k); } };
  add(OW_START.sx * cols + Math.floor((OW_START.x + 8) / TS), OW_START.sy * rows + Math.floor((OW_START.y + 12) / TS));
  while (q.length) {
    const k = q.pop(), x = k % ww, y = (k / ww) | 0;
    // (the ladder and the hook work within one screen)
    const x0 = x - x % cols, y0 = y - y % rows;
    const onScreen = (x2, y2) => x2 >= x0 && x2 < x0 + cols && y2 >= y0 && y2 < y0 + rows;
    for (let d = 0; d < 4; d++) {
      const dx = dxs[d], dy = dys[d];
      if (firmT[at(x + dx, y + dy)]) add(x + dx, y + dy);
      if (!inv) continue;
      // the ladder: one tile of water with firm ground beyond
      if (kit.ladder && waterT[at(x + dx, y + dy)] && firmT[at(x + 2 * dx, y + 2 * dy)] && onScreen(x + 2 * dx, y + 2 * dy)) add(x + 2 * dx, y + 2 * dy);
      // the raft: from a dock along open water to the next dock
      if (kit.raft && at(x, y) === dock) {
        let j = 1;
        while (j <= 3 * rows && waterT[at(x + dx * j, y + dy * j)]) j++;
        if (j > 1 && at(x + dx * j, y + dy * j) === dock) add(x + dx * j, y + dy * j);
      }
      // the hook: a post in line within reach, flying over all but solid tiles
      if (kit.hook) {
        for (let j = 1; j <= 6 && onScreen(x + dx * j, y + dy * j); j++) {
          const t = at(x + dx * j, y + dy * j);
          if (t === post) {
            for (let i = j - 1; i >= 1; i--) if (firmT[at(x + dx * i, y + dy * i)]) { add(x + dx * i, y + dy * i); break; }
            break;
          }
          if (solidT[t]) break;
        }
      }
    }
  }
  if (!inv) W.home = reach;
  return reach;
}

// The world tile nearest (gx, gy) that walks to the start.
function homeGroundNear(gx, gy) {
  const home = groundFromStart(), ww = WW;
  let best = null, bd = Infinity;
  for (let k = 0; k < home.length; k++) {
    if (!home[k]) continue;
    const x = k % ww, y = (k / ww) | 0, d = (x - gx) * (x - gx) + (y - gy) * (y - gy);
    if (d < bd) { bd = d; best = [x, y]; }
  }
  return best;
}

function gateBump() {
  if (G.gateCooldown > 0) return;
  G.gateCooldown = 45;
  if (G.shards >= SHARDS_NEEDED) {
    G.flags["gate:open"] = 1;
    Sound.sfx("gate_break");
    G.shake = 20;
    G.screen = getScreen(G.sx, G.sy);
    G.tiles = G.screen.tiles;
    startDialog(["THE SIX SHARDS BLAZE", "AS ONE. THE SEAL", "SHATTERS! THE KEEP", "LIES OPEN."]);
  } else {
    // from the fourth shard on the seal trembles and glows at their call
    const held = G.shards ? "YOU HOLD " + COUNT_WORDS[G.shards] + " OF SIX." : "YOU HOLD NONE YET.";
    sayBoxes([G.shards >= 4 ? ["THE SEAL TREMBLES AND", "GLOWS, BUT HOLDS.", "ALL SIX SHARDS MUST", "BURN HERE TO BREAK IT."]
      : ["THE SEAL HOLDS FAST.", "ALL SIX SHARDS OF THE", "SUNSTONE MUST BURN", "HERE TO BREAK IT."], [held]]);
  }
}

// ---------- Dungeons ----------
function enterDungeon(id) {
  G.dungeon = id;
  G.area = "dungeon";
  const [rx, ry] = DUNGEONS[id].start.split(",").map(Number);
  G.rx = rx; G.ry = ry;
  Sound.sfx("enter_dungeon");
  enterRoom(UP);
  // the shard's three notes while the name shows; the level's track waits, then begins
  Sound.stinger("st_dungeon");
  P.x = 120; P.y = PH - 26;
  P.dir = UP;
  // (the level's own name on a plaque; no number)
  G.banner = { text: DUNGEONS[id].name, t: 200 };
}

function exitDungeon() {
  const e = DUNGEONS[G.dungeon].entranceOW;
  const [ex, ey] = mouthExit(e.sx, e.sy, getScreen(e.sx, e.sy).tiles, e.x, e.y);
  loadOverworldScreen(e.sx, e.sy, ex * TS, ey * TS);
  P.dir = DOWN;
  G.mode = "play";
  Sound.sfx("exit_out");
}

function computeShut(room, pushState, rx, ry) {
  const shut = {};
  const hasEnemies = room.e && room.e.length > 0;
  if (rx === undefined) { rx = G.rx; ry = G.ry; }
  for (let dir = 0; dir < 4; dir++) {
    if (doorTypeOf(room, dir) === "shutter") {
      // floor switches and crystal eyes hold their shutters until the room is solved
      if (room.switches || room.eyes) shut[dir] = !G.flags[solvedFlag(G.dungeon, rx, ry)];
      else shut[dir] = room.push ? !(pushState && pushState.done) : hasEnemies;
    }
  }
  return shut;
}

function enterRoom(travelDir) {
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  G.flags["d" + G.dungeon + ":seen:" + G.rx + "," + G.ry] = 1;
  G.pushState = room.push ? { done: false } : null;
  G.roomPieces = initialRoomPieces(G.dungeon, G.rx, G.ry, G.pushState);
  G.shut = computeShut(room, G.pushState);
  G.tiles = buildRoomTiles(G.dungeon, G.rx, G.ry, G.shut, G.pushState, G.roomPieces);
  G.enemies = []; G.projectiles = []; G.pickups = []; G.effects = [];
  G.boomerActive = false; G.beamActive = false; G.flameUsed = false;
  G.roomClearHandled = false;
  G.roomLit = false;
  G.stepCooldown = 20;

  // position by travel direction
  if (travelDir === UP) { P.x = 120; P.y = PH - 26; }
  else if (travelDir === DOWN) { P.x = 120; P.y = 10; }
  else if (travelDir === LEFT) { P.x = PW - 26; P.y = 76; }
  else if (travelDir === RIGHT) { P.x = 10; P.y = 76; }
  // if the entry door shut behind us (shutter), step inward past the solid door cells
  if (travelDir !== undefined && travelDir !== null) {
    let guard = 0;
    while (terrainBlocked(P.x, P.y) && guard++ < 40) {
      P.x += DX[travelDir] * 2;
      P.y += DY[travelDir] * 2;
    }
  }
  // a fall puts you back here; anything carried is left behind at the door
  G.roomEntry = { x: P.x, y: P.y };
  P.carry = null; P.slide = null; P.pull = null; P.fallT = 0; G.hookActive = false;

  // enemies / boss
  const bossDead = G.flags["d" + G.dungeon + ":boss"];
  G.musicCue = null;
  if (room.boss && !bossDead) {
    const pos = { wyrm: [96, 36], worm: [104, 64], gazer: [96, 40], vex: [112, 48], dunescale: [100, 40], frostmaw: [100, 30], emberhulk: [104, 44] }[room.boss];
    spawnBoss(room.boss, pos[0], pos[1]);
    // its own cry, then its theme (the Shadow Tyrant has his own)
    Sound.sfx("roar_" + room.boss);
    bossMusic(room.boss);
  } else {
    spawnRoomEnemies(room.e || []);
    // the sage's room stays hushed: the ending brings its own music
    Sound.music(room.sage ? null : DUNGEONS[G.dungeon].music);
  }

  spawnRoomItem(room);
  // a key the room's foes dropped and the hero left lying waits where it fell (the foes
  // are back, but it needn't be won twice)
  if (room.keyDrop && G.flags[keyFellFlag(G.dungeon, G.rx, G.ry)]) {
    const rest = (G.keyRest && G.keyRest[keyDropFlag(G.dungeon, G.rx, G.ry)]) || [7 * TS, 5 * TS];
    layDroppedKey(rest[0], rest[1]);
  }
  // a guardian's heart container the hero walked off without waits in the middle of its hall
  const hcFlag = "d" + G.dungeon + ":bosshc";
  if (room.boss && room.boss !== "vex" && bossDead && !G.flags[hcFlag]) spawnPickup("item", 112, 74, { floor: true, item: "heartcont", flag: hcFlag });

  // NPC rooms
  G.roomNPC = room.old ? { spr: "npc_hermit", lines: room.old }
    : room.sage ? { spr: "npc_sage", lines: ["RILL! THE SHARDS!", "LET DAWN RETURN!"], sage: true }
      : null;

  if (Object.values(G.shut).some(v => v)) Sound.sfx("shutter");
}

// The room's floor item (at its centre unless the room says where), unless taken; an
// item kept back by crystal eyes shows only once they are all awake.
function spawnRoomItem(room) {
  if (!room.item) return;
  const flag = "d" + G.dungeon + ":item:" + G.rx + "," + G.ry;
  if (G.flags[flag] || G.pickups.some(k => k.flag === flag)) return;
  if (room.itemOn === "eyes" && !G.flags[solvedFlag(G.dungeon, G.rx, G.ry)]) return;
  const at = room.itemAt ? [room.itemAt[0] * TS, room.itemAt[1] * TS] : [112, 74];
  spawnPickup("item", at[0], at[1], { floor: true, item: room.item, flag });
}

function spawnRoomEnemies(list) {
  // (one soft sound for the group as it takes shape; a spike trap is simply there)
  if (list.some(k => k !== "spiketrap")) Sound.sfx("spawn");
  const corners = [[2, 2], [13, 2], [2, 8], [13, 8]];
  let ci = 0, clutchN = 0;
  for (const kind of list) {
    if (kind === "spiketrap") {
      const c = corners[ci++ % 4];
      spawnEnemy("spiketrap", c[0] * TS, c[1] * TS);
      continue;
    }
    for (let tries = 0; tries < 30; tries++) {
      const tx = 2 + rngIntU(12), ty = 2 + rngIntU(7);
      if (!spawnSpotOK(tileAt(G.tiles, tx, ty))) continue;
      const px = tx * TS, py = ty * TS;
      if (dist2(px, py, P.x, P.y) < 48 * 48) continue;
      const e = spawnEnemy(kind, px, py);
      // (a clutch takes shape on its wall ring, not where it would pop out in the room)
      if (kind === "clutch") { e.wallPos = (clutchN++) * 13; settleClutch(e); }
      // a foe put by the wall steps in off the frame's trim; where the floor there is not
      // open it tries another tile (the last try stands, and walks off the trim itself)
      else if (!settleInRoom(e) && tries < 29) { G.enemies.pop(); continue; }
      break;
    }
  }
}

function rebuildRoomTiles() {
  if (G.area !== "dungeon") return;
  G.tiles = buildRoomTiles(G.dungeon, G.rx, G.ry, G.shut, G.pushState, G.roomPieces);
}

function tryUnlockDoor(tx, ty, dir) {
  let ddir = -1;
  for (let d2 = 0; d2 < 4; d2++) {
    for (const [cx2, cy2] of DOOR_CELLS[d2]) if (cx2 === tx && cy2 === ty) ddir = d2;
  }
  if (ddir < 0 || ddir !== dir) return;
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  const t = doorTypeOf(room, ddir);
  if (t !== "lock") return;
  const fl = doorFlag(G.dungeon, G.rx, G.ry, ddir);
  if (G.flags[fl]) return;
  if (G.keys > 0) {
    G.keys--;
    G.flags[fl] = 1;
    Sound.sfx("unlock");
    rebuildRoomTiles();
  } else if (G.lockMsgT <= 0) {
    G.lockMsgT = 40;
    Sound.sfx("locked");
  }
}

// ---------- Transitions ----------
function startTransition(dir) {
  const nsx = G.sx + DX[dir], nsy = G.sy + DY[dir];
  if (nsx < 0 || nsx >= OWW || nsy < 0 || nsy >= OWH) {
    P.x = clamp(P.x, 0, PW - 16); P.y = clamp(P.y, 0, PH - 16);
    return;
  }
  const ns = getScreen(nsx, nsy);
  G.trans = { kind: "ow", dir, t: 0, dur: 36, oldTiles: G.tiles, nsx, nsy, newScreen: ns, newTiles: ns.tiles };
  G.trans.oldScene = currentScene();
  G.trans.newScene = sceneForOverworld(nsx, nsy, ns.tiles);
  G.mode = "trans";
  // the next screen's music (its region's colour, or the village) as the view scrolls
  overworldMusic(nsx, nsy);
}

function startRoomTransition(dir) {
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  if (doorTypeOf(room, dir) === "exit") { exitDungeon(); return; }
  const nrx = G.rx + DX[dir], nry = G.ry + DY[dir];
  const nroom = getDungeonRoom(G.dungeon, nrx, nry);
  if (!nroom) {
    P.x = clamp(P.x, 0, PW - 16); P.y = clamp(P.y, 0, PH - 16);
    return;
  }
  const previewShut = computeShut(nroom, nroom.push ? { done: false } : null, nrx, nry);
  const preview = buildRoomTiles(G.dungeon, nrx, nry, previewShut, nroom.push ? { done: false } : null);
  G.trans = { kind: "d", dir, t: 0, dur: 28, oldTiles: G.tiles, nrx, nry, newTiles: preview };
  G.trans.oldScene = currentScene();
  G.trans.newScene = sceneForRoom(G.dungeon, nrx, nry, preview, previewShut);
  G.mode = "trans";
}

function updateTrans() {
  const tr = G.trans;
  tr.t++;
  if (tr.t < tr.dur) return;
  G.trans = null;
  if (tr.kind === "ow") {
    const dir = tr.dir;
    G.sx = tr.nsx; G.sy = tr.nsy;
    G.screen = tr.newScreen;
    G.tiles = tr.newTiles;
    G.enemies = []; G.projectiles = []; G.pickups = []; G.effects = [];
    G.boomerActive = false; G.beamActive = false; G.flameUsed = false; G.hookActive = false;
    P.laddering = null;
    // a raft glides straight on (its trip is judged tile by tile); on foot the hero
    // steps in just inside the new edge
    if (P.rafting) { P.x -= DX[dir] * PW; P.y -= DY[dir] * PH; }
    else if (dir === LEFT) P.x = PW - 17;
    else if (dir === RIGHT) P.x = 1;
    else if (dir === UP) P.y = PH - 17;
    // (feet reach 15px below P.y: at P.y = 0 they stay on the first row, where the map
    // continues; one pixel lower they touched the second row and a rock there shoved
    // the hero aside)
    else P.y = 0;
    nudgeIntoOpen(dir);
    G.stepCooldown = 20;
    spawnScreenEnemies(G.screen.enemies);
    // heart pieces lying in the open show up however the screen is entered
    spawnScreenTreasures();
    G.mode = "play";
  } else {
    G.rx = tr.nrx; G.ry = tr.nry;
    enterRoom(tr.dir);
    G.mode = "play";
  }
}

// After a transition, make sure the player isn't stuck inside a solid tile.
function nudgeIntoOpen(dir) {
  if (!terrainBlocked(P.x, P.y)) return;
  const vertical = (dir === UP || dir === DOWN);
  for (let off = 8; off <= 80; off += 8) {
    for (const s of [-1, 1]) {
      const nx = vertical ? P.x + s * off : P.x;
      const ny = vertical ? P.y : P.y + s * off;
      if (nx < 0 || nx > PW - 16 || ny < 0 || ny > PH - 16) continue;
      if (!terrainBlocked(nx, ny)) { P.x = nx; P.y = ny; return; }
    }
  }
  // fallback: the nearest open ground anywhere on the screen
  const best = openGroundNear(G.sx, G.sy, G.tiles, Math.round(P.x / TS), Math.round(P.y / TS));
  if (best) { P.x = best[0] * TS; P.y = best[1] * TS; }
}

// Where a key a foe dropped at (px, py) comes to rest: right there on open floor inside
// the walls that the hero can walk to, else on the nearest such floor tile (a bat can
// die over the wall, a foe over a drop or lava, or on a patch cut off by them, where no
// one could pick the key up). Not on ice either: there it is only won by sliding
// across it just so.
function keyRestingSpot(px, py) {
  const reach = heroFloor(), inside = (x, y) => x >= 2 && x <= 13 && y >= 2 && y <= 8;
  const rest = (t) => standableTile(t) && t !== T_DICE;
  const tx = Math.floor((px + 8) / TS), ty = Math.floor((py + 8) / TS);
  if (inside(tx, ty) && rest(G.tiles[ty][tx]) && (!reach || reach.has(ty * COLS + tx))) return [px, py];
  let best = [7 * TS + 8, 5 * TS], bd = Infinity;
  // (floor he can walk to first; any open floor only if he stands nowhere firm just now)
  for (const within of [reach, null]) {
    for (let y = 2; y <= 8; y++) for (let x = 2; x <= 13; x++) {
      if (!rest(G.tiles[y][x]) || (within && !within.has(y * COLS + x))) continue;
      const d = (x * TS - px) ** 2 + (y * TS - py) ** 2;
      if (d < bd) { bd = d; best = [x * TS, y * TS]; }
    }
    if (bd < Infinity) break;
  }
  return best;
}
// The tiles (y * COLS + x) the hero can walk to from where he stands; null when he
// isn't on firm floor just now (reeled in by the hook, falling).
function heroFloor() {
  const sx = Math.floor((P.x + 8) / TS), sy = Math.floor((P.y + 12) / TS);
  if (!standableTile(tileAt(G.tiles, sx, sy))) return null;
  const seen = new Set([sy * COLS + sx]), q = [[sx, sy]];
  while (q.length) {
    const [x, y] = q.pop();
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d], k = ny * COLS + nx;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || seen.has(k) || !standableTile(G.tiles[ny][nx])) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}
// A key the foes of a room dropped stays won: left lying, it waits in the room (flagged
// "kfell", which a save keeps) until the hero takes it ("kdrop").
function keyDropFlag(d, rx, ry) { return "d" + d + ":kdrop:" + rx + "," + ry; }
function keyFellFlag(d, rx, ry) { return "d" + d + ":kfell:" + rx + "," + ry; }
function layDroppedKey(px, py) {
  const fl = keyDropFlag(G.dungeon, G.rx, G.ry);
  if (G.flags[fl] || G.pickups.some(k => k.flag === fl)) return;
  const [kx, ky] = keyRestingSpot(px, py);
  spawnPickup("key", kx, ky, { flag: fl, floor: true });
  G.flags[keyFellFlag(G.dungeon, G.rx, G.ry)] = 1;
  (G.keyRest || (G.keyRest = {}))[fl] = [kx, ky];
}

// ---------- Play mode ----------
function updatePlay() {
  if (G.dialog) { updateDialog(); return; }
  if (G.gateCooldown > 0) G.gateCooldown--;
  if (G.lockMsgT > 0) G.lockMsgT--;

  if (G.shardWarp > 0) {
    G.shardWarp--;
    // the hero holds the shard up while Maren's voice reaches him; then out he goes (her
    // scene has its own music, a step further for every shard home: music_story.js)
    if (G.shardWarp === 0) {
      Sound.music(G.shards > 1 ? "voice_" + G.shards : "voice");
      sayBoxes(shardVoice(G.shards), () => { P.holdT = 0; exitDungeon(); }, MAREN_WHO);
    }
    return;
  }

  updatePlayer();

  // while he holds up a treasure the world waits with him, as it does for a shard: no
  // foe, shot or drop moves or touches him, and a grab from that frame is let go (only
  // the effects play on; Enter still pauses, as it always has)
  if (P.holdT > 0) { G.dragToEntrance = false; updateEffects(); }
  else if (updatePlayWorld()) return;

  // low health: a heartbeat on the game's own beat (faster-sounding at half a heart); the
  // first four beats of a spell of low health full, then 7 dB softer (dropping to half a
  // heart starts a new spell)
  if (G.hp > 0 && G.hp <= 2) {
    const urgent = G.hp <= 1;
    if (urgent !== G.beatUrgent) { G.beatUrgent = urgent; G.beatN = 0; }
    if (G.frame % 45 === 0) { G.beatN = (G.beatN || 0) + 1; Sound.sfx(urgent ? "heartbeat_urgent" : "heartbeat", { gain: G.beatN > 4 ? -7 : 0 }); }
  } else { G.beatN = 0; G.beatUrgent = null; }

  // (only while the frame is still a play frame: a death or a step into a cave on this
  // very frame has changed the mode, and the pause must not bring him back to 'play')
  if (G.mode === "play" && Input.pressed("start")) { G.invReturn = "play"; G.mode = "inv"; Sound.sfx("menu_open"); }
}

// The world's part of a play frame: true when it has moved on (dragged back to the
// entrance, the ending, a new room or screen), which ends the frame there.
function updatePlayWorld() {
  if (G.dragToEntrance) {
    G.dragToEntrance = false;
    Sound.sfx("drag_back");
    const [rx, ry] = DUNGEONS[G.dungeon].start.split(",").map(Number);
    G.rx = rx; G.ry = ry;
    enterRoom(UP);
    return true;
  }

  updateEnemies();
  updateProjectiles();
  updatePickups();
  updateEffects();
  updateSwitches();

  // dungeon room-clear logic
  if (G.area === "dungeon" && !G.roomClearHandled) {
    const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
    const hadFoes = (room.e && room.e.length > 0) || room.boss;
    const alive = G.enemies.some(e => !e.dead && !e.immune && !e.friendly);
    if (hadFoes && !alive) {
      G.roomClearHandled = true;
      // (the key lies like a treasure, so it waits for the hero instead of fading like a
      // drop; with no fall seen, it lies in the middle of the room)
      if (room.keyDrop) layDroppedKey(G.lastKillPos ? G.lastKillPos.x : 7 * TS, G.lastKillPos ? G.lastKillPos.y : 5 * TS);
      if (!room.push && !room.switches && !room.eyes) {
        let opened = false;
        for (let d2 = 0; d2 < 4; d2++) if (G.shut[d2]) { G.shut[d2] = false; opened = true; }
        if (opened) { Sound.sfx("shutter_open"); rebuildRoomTiles(); }
      }
    }
  }

  // sage rescue = victory
  if (G.roomNPC && G.roomNPC.sage && !P.dead) {
    if (dist2(P.x + 8, P.y + 8, 120, 56) < 28 * 28) {
      startEnding();
      return true;
    }
  }

  // screen edges
  const cx = P.x + 8, cy = P.y + 8;
  let exitDir = -1;
  if (cx < 0) exitDir = LEFT;
  else if (cx > PW) exitDir = RIGHT;
  else if (cy < 0) exitDir = UP;
  else if (cy > PH) exitDir = DOWN;
  if (exitDir >= 0 && !P.dead) {
    if (G.area === "overworld") startTransition(exitDir);
    else startRoomTransition(exitDir);
    return true;
  }
  return false;
}

// ---------- Cave mode ----------
function updateCave() {
  const s = G.cave;
  // Z answers the host or the ware he stands at before it would swing the sword
  if (!(P.holdT > 0) && Input.pressed("a") && caveTalkPress(s)) Input.consume("a");
  updatePlayer();
  // leave through the doorway in the south wall
  if (P.y > PH - 26) { exitCave(); return; }
  P.x = clamp(P.x, 34, 206);
  const inDoor = P.x + 8 >= 114 && P.x + 8 <= 142;
  P.y = clamp(P.y, 56, inDoor ? PH : 128);
  // touch items: a gift or quest treasure is taken on touch; a ware with a price only
  // asks (walking off it says no)
  s.focus = null;
  for (const item of s.items.slice()) {
    if (rectsOverlap(item.x - 2, item.y - 2, 20, 20, P.x + 2, P.y + 4, 12, 11)) {
      if (item.price > 0) { if (!s.focus) s.focus = item; continue; }
      if (!item.touchLatch) {
        item.touchLatch = true;
        caveItemTouched(s, item);
      }
    } else {
      item.touchLatch = false;
    }
  }
  // a soft cue as a ware's question comes up in the talk box
  if (s.focus && s.focus !== s.lastFocus) Sound.sfx("dlg_open");
  s.lastFocus = s.focus;
  updateEffects();
  // (a shot in flight waits while he holds up what he was given)
  if (!(P.holdT > 0)) updateProjectiles();
  // the host's page types out; it turns only on Z
  caveTalkStep(s);
  // the talk box sits under the host, and drops below the wares while the hero walks up
  // where it would cover him (his head is ~2px above P.y; a little slack keeps it still)
  if (P.y - 2 < CAVE_BOX_BOTTOM) s.low = true;
  else if (P.y - 2 >= CAVE_BOX_BOTTOM + 4) s.low = false;
  if (G.mode === "cave" && Input.pressed("start")) { G.invReturn = "cave"; G.mode = "inv"; Sound.sfx("menu_open"); }
}

// ---------- Death ----------
function startDeath() {
  G.stats.deaths++;
  G.deathT = 150;
  G.mode = "death";
  G.musicCue = null;
  Sound.stopMusic(0.3);
  Sound.sfx("die");
}
function updateDeath() {
  G.deathT--;
  if (G.deathT <= 0) {
    G.mode = "gameover";
    G.menuIdx = 0;
    // (the game-over track replaces the old jingle: music_story.js)
    Sound.music("gameover");
  }
}

function continueGame() {
  G.hp = Math.min(G.maxhp, 6);
  P.dead = false;
  P.iframes = 60;
  G.cave = null;
  if (G.area === "dungeon") {
    const [rx, ry] = DUNGEONS[G.dungeon].start.split(",").map(Number);
    G.rx = rx; G.ry = ry;
    enterRoom(UP);
  } else {
    loadOverworldScreen(OW_START.sx, OW_START.sy, OW_START.x, OW_START.y);
  }
  G.mode = "play";
}

// ---------- Looping sounds ----------
// Every tick lists the loops that should sound now and starts, pans or stops them to match,
// so a loop never outlives its thing whatever ended it (a blast, a catch, a new room, a
// fall, the pause page): a bomb's fuse, the boomerang's whirr, a candle flame, the hook
// reeling the hero in, a slide on ice, the raft's paddle, Dunescale moving under the sand
// and Emberhulk's bare core.
let loopSeq = 0;
const liveLoops = {};
function updateSoundLoops() {
  const want = {};
  const put = (id, name, x) => { want[id] = { name, x }; };
  const sid = (o) => o.sid || (o.sid = ++loopSeq);
  // (while he holds up a treasure the world waits, and so do its loops)
  if (P && (G.mode === "play" || G.mode === "cave") && !(P.holdT > 0)) {
    for (const p of G.projectiles) {
      if (p.dead) continue;
      if (p.type === "bomb") put("bomb" + sid(p), "bomb_fuse", p.x);
      else if (p.type === "boomerang") put("boom", "boom_loop", p.x);
      else if (p.type === "flame" && !p.hostile) put("flame" + sid(p), "flame_loop", p.x);
    }
    if (P.pull) put("reel", "hook_reel", P.x + 8);
    if (P.slide != null) put("skid", "ice_skid", P.x + 8);
    if (P.rafting) put("raft", "raft_paddle", P.x + 8);
    for (const e of G.enemies) {
      if (e.dead) continue;
      if (e.kind === "boss_dunescale" && e.state === "burrow") put("burrow", "burrow_loop", e.x + 15);
      else if (e.kind === "boss_emberhulk" && e.bareT > 0) put("core", "core_hum", e.x + 14);
    }
  }
  for (const id in liveLoops) if (!want[id]) { Sound.stopLoop(id, 0.08); delete liveLoops[id]; }
  for (const id in want) {
    const w = want[id];
    if (liveLoops[id]) Sound.loopSet(id, { x: w.x });
    // (no sound yet, muted, or not built: tried again next tick)
    else if (Sound.loop(id, w.name, { x: w.x }) != null) liveLoops[id] = w.name;
  }
}

// ---------- Loop ----------
const STEP_MS = 1000 / 60;
let lastT = 0, acc = 0;

function step() {
  G.frame++;
  // music waiting for a sound to end (the audio clock runs on through hit-stop and menus)
  if (G.musicCue && --G.musicCue.t <= 0) { const cue = G.musicCue; G.musicCue = null; cue.fn(); }
  updateSoundLoops();
  // play time for the record after the credits (the pause screen and menus don't count)
  if (G.stats && (G.mode === "play" || G.mode === "cave" || G.mode === "trans" || G.mode === "death")) G.stats.frames++;
  if (G.shake > 0) G.shake--;
  // notes on screen count down here, once a tick, so they last as long on a 144 Hz
  // screen as on a 60 Hz one (drawing only reads them); a banner waits while the game
  // is paused or between screens, where it isn't shown
  if (G.banner && G.banner.t > 0 && (G.mode === "play" || G.mode === "cave")) G.banner.t--;
  if (G.saveMsg > 0) G.saveMsg--;
  if (G.saveNote > 0) G.saveNote--;
  if (G.loadErr > 0) G.loadErr--;
  // hit-stop: the world holds still for a few frames when a blow lands
  // (presses made during the pause are kept for the next frame)
  if (G.hitStop > 0 && G.mode === "play") { G.hitStop--; return; }
  switch (G.mode) {
    case "title": updateTitle(); break;
    case "story": updateStory(); break;
    case "play": updatePlay(); break;
    case "inv": updateInventory(); break;
    case "cave": updateCave(); break;
    case "trans": updateTrans(); break;
    case "death": updateDeath(); break;
    case "gameover": updateGameOver(); break;
    case "win": updateWin(); break;
  }
  if (Input.pressed("mute")) Sound.toggleMute();
  if (Input.pressed("debug")) G.debugHit = !G.debugHit;
  Sound.update();
  Input.endFrame();
}

function render() {
  ctx.imageSmoothingEnabled = false;
  switch (G.mode) {
    case "play": case "cave": renderWorld(ctx); break;
    case "trans": renderTrans2(ctx); break;
    case "death": renderDeath2(ctx); break;
    case "title": drawTitle2(ctx); break;
    case "story": drawStory2(ctx); break;
    case "inv": drawInventory2(ctx); break;
    case "gameover": drawGameOver2(ctx); break;
    case "win": drawWin2(ctx); break;
  }
  if (G.loadErr > 0) drawText2C(ctx, "COULD NOT READ SAVE FILE", RW / 2, RH - 18, STYLE.ramps.red[3]);
}

function frame(t) {
  if (!lastT) lastT = t;
  acc += Math.min(t - lastT, 100);
  lastT = t;
  let guard = 0;
  while (acc >= STEP_MS && guard++ < 5) {
    // (ticks caught up in one frame keep their 1/60 s spacing in the effects they start)
    Sound.stepDelay = (guard - 1) / 60;
    step();
    acc -= STEP_MS;
  }
  Sound.stepDelay = 0;
  if (guard >= 5) acc = 0;
  render();
  pumpFrames(4);
  requestAnimationFrame(frame);
}

// Whole device pixels per game pixel when that still gives 2x or more; otherwise
// fill the window (crisp nearest-neighbour, slightly uneven pixels).
function fitCanvas() {
  // played by touch, the picture shares the screen with the on-screen buttons (touch.js)
  if (typeof touchFit === "function" && touchFit(cv)) return;
  const dpr = window.devicePixelRatio || 1;
  const fit = Math.min(window.innerWidth / RW, window.innerHeight / RH);
  const dev = Math.floor(fit * dpr);
  const cssScale = dev >= 2 ? dev / dpr : Math.max(fit, 1 / dpr);
  cv.style.width = Math.floor(RW * cssScale) + "px";
  cv.style.height = Math.floor(RH * cssScale) + "px";
}

window.addEventListener("load", () => {
  cv = document.getElementById("game");
  ctx = cv.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  useStyle("B");
  // (the July 8-bit sprites and tiles are no longer built: nothing draws them, and a
  // thing with no picture shows the missing-art box instead, hud2.js drawMissing)
  buildIcons();
  buildFlames();
  buildFx();
  buildTorchBracket();
  initSceneArt();
  validateDungeons();
  Input.init();
  initSaveUI();
  resetGameState();
  initPlayer();
  prewarmHero();
  Sound.music("title");
  fitCanvas();
  window.addEventListener("resize", fitCanvas);
  requestAnimationFrame(frame);
});
