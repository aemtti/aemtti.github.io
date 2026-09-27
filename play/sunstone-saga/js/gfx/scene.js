"use strict";
// ---------- Scenes: everything static about the current screen, room or cave ----------
// A scene is rendered once when the player arrives (and cached); each frame only
// composites it with the moving actors, depth-sorted by their ground line.
// Game logic stays in 16px units; everything here draws at 2x on a 512x480 canvas.

const RW = 512, RH = 480, RHUD = 128, SC = 2;

let WATER_FRAMES = [];
function initSceneArt() {
  WATER_FRAMES = makeWaterFrames();
  _darkCanvases = null;
}

// ---------- LRU cache ----------
const SceneCache = { map: new Map(), max: 16 };
function sceneCacheGet(key) {
  const s = SceneCache.map.get(key);
  if (s) { SceneCache.map.delete(key); SceneCache.map.set(key, s); }
  return s;
}
function sceneCachePut(key, s) {
  SceneCache.map.set(key, s);
  while (SceneCache.map.size > SceneCache.max) SceneCache.map.delete(SceneCache.map.keys().next().value);
}
function clearSceneCache() { SceneCache.map.clear(); _pathCache.clear(); }

function tilesHash(tiles) {
  let h = 2166136261;
  for (let y = 0; y < tiles.length; y++) for (let x = 0; x < tiles[y].length; x++) { h ^= tiles[y][x] + 1; h = Math.imul(h, 16777619); }
  return (h >>> 0).toString(36);
}

// ---------- overworld ----------
const BIOME_GROUND = { P: TM.GRASS, F: TM.GRASSD, M: TM.ROCKY, D: TM.SAND, G: TM.DEAD, L: TM.GRASS };
function biomeGround(sx, sy) {
  return BIOME_GROUND[biomeAt(clamp(sx, 0, OWW - 1), clamp(sy, 0, OWH - 1))] || TM.GRASS;
}
function screenTilesFor(sx, sy) {
  if (sx < 0 || sy < 0 || sx >= OWW || sy >= OWH) return null;
  if (G.area === "overworld" && sx === G.sx && sy === G.sy && G.tiles) return G.tiles;
  return getScreen(sx, sy).tiles;
}
function isRockish(id) { return id === T_ROCK || id === T_CRACK || id === T_CAVE || id === T_GATE; }

// Decorative dirt roads: from every screen opening and cave mouth to a hub near the centre.
// Openings line up between neighbours, so roads run on across screen edges.
const _pathCache = new Map();
function screenPathSet(sx, sy, tiles) {
  const key = sx + "," + sy + ":" + tilesHash(tiles);
  let set = _pathCache.get(key);
  if (set) return set;
  set = new Set();
  _pathCache.set(key, set);
  const b = biomeAt(sx, sy);
  if (b === "D" || b === "M") return set;               // sand and scree need no roads
  const walk = (x, y) => x >= 0 && y >= 0 && x < COLS && y < ROWS && tiles[y][x] === T_GROUND;
  const goals = [];
  if (!edgeBlocked(sx, sy, UP) && walk(7, 0)) goals.push([7, 0]);
  if (!edgeBlocked(sx, sy, DOWN) && walk(7, ROWS - 1)) goals.push([7, ROWS - 1]);
  if (!edgeBlocked(sx, sy, LEFT) && walk(0, 5)) goals.push([0, 5]);
  if (!edgeBlocked(sx, sy, RIGHT) && walk(COLS - 1, 5)) goals.push([COLS - 1, 5]);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    if ((tiles[y][x] === T_CAVE || tiles[y][x] === T_STAIRS) && walk(x, y + 1)) goals.push([x, y + 1]);
  }
  if (goals.length < 2 && !goals.some(g => tiles[g[1] - 1] && tiles[g[1] - 1][g[0]] === T_CAVE)) return set;
  // hub: walkable tile nearest the centre
  let hub = null, hd = 1e9;
  for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
    if (!walk(x, y)) continue;
    const d = (x - 7.5) ** 2 + (y - 5) ** 2;
    if (d < hd) { hd = d; hub = [x, y]; }
  }
  if (!hub) return set;
  // Dijkstra from the hub with a little noise so roads wander
  const N = COLS * ROWS, dist = new Float32Array(N).fill(1e9), prev = new Int16Array(N).fill(-1), done = new Uint8Array(N);
  dist[hub[1] * COLS + hub[0]] = 0;
  for (;;) {
    let bi = -1, bd = 1e9;
    for (let i = 0; i < N; i++) if (!done[i] && dist[i] < bd) { bd = dist[i]; bi = i; }
    if (bi < 0) break;
    done[bi] = 1;
    const x = bi % COLS, y = (bi / COLS) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!walk(nx, ny)) continue;
      const ni = ny * COLS + nx;
      const c = bd + 1 + hash2(sx * 16 + nx, sy * 11 + ny, 405) * 0.9;
      if (c < dist[ni]) { dist[ni] = c; prev[ni] = bi; }
    }
  }
  for (const [gx, gy] of goals) {
    let i = gy * COLS + gx;
    if (dist[i] >= 1e9) continue;
    while (i >= 0) { set.add((i % COLS) + "," + ((i / COLS) | 0)); i = prev[i]; }
  }
  return set;
}

function buildOWScene(sx, sy, tiles) {
  const nb = new Map();
  const tilesOf = (ssx, ssy) => {
    const k = ssx + "," + ssy;
    if (!nb.has(k)) nb.set(k, (ssx === sx && ssy === sy) ? tiles : screenTilesFor(ssx, ssy));
    return nb.get(k);
  };
  // resolve a tile coordinate that may lie in a neighbouring screen
  const locate = (tx, ty) => {
    let ssx = sx, ssy = sy, lx = tx, ly = ty;
    if (lx < 0) { ssx--; lx += COLS; } else if (lx >= COLS) { ssx++; lx -= COLS; }
    if (ly < 0) { ssy--; ly += ROWS; } else if (ly >= ROWS) { ssy++; ly -= ROWS; }
    const t = tilesOf(ssx, ssy);
    if (!t) return { t: tiles, ssx: sx, ssy: sy, lx: clamp(tx, 0, COLS - 1), ly: clamp(ty, 0, ROWS - 1) };
    return { t, ssx, ssy, lx, ly };
  };
  const tileAt = (tx, ty) => { const l = locate(tx, ty); return l.t[l.ly][l.lx]; };
  // regions follow the world's ragged biome borders (the same field that placed the trees)
  const tbCache = new Map();
  const tb = (tx, ty) => {
    const k = tx * 64 + ty;
    let b = tbCache.get(k);
    if (b === undefined) { b = biomeJit(clamp(sx * COLS + tx, 0, WW - 1), clamp(sy * ROWS + ty, 0, WH - 1)); tbCache.set(k, b); }
    return b;
  };
  const pathAt = (tx, ty) => worldRoadAt(sx * COLS + tx, sy * ROWS + ty);
  const ox = sx * 512, ov = sy * 352;
  // the ground follows the regions without their stray one- and two-tile islands (a lone
  // square of meadow on bare dirt looks pasted on)
  const gbCache = new Map();
  const gb = (tx, ty) => {
    const k = tx * 64 + ty;
    let b = gbCache.get(k);
    if (b !== undefined) return b;
    const cnt = {};
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const c = tb(tx + dx, ty + dy); cnt[c] = (cnt[c] || 0) + 1; }
    b = tb(tx, ty);
    if (cnt[b] < 7) { let bn = 0; for (const c in cnt) if (cnt[c] > bn) { bn = cnt[c]; b = c; } }
    gbCache.set(k, b);
    return b;
  };
  const groundMatAt = (x, v) => {
    const tx = Math.floor(x / TT), ty = Math.floor(v / TT);
    const b0 = gb(tx, ty);
    if (gb(tx - 1, ty) === b0 && gb(tx + 1, ty) === b0 && gb(tx, ty - 1) === b0 && gb(tx, ty + 1) === b0) return BIOME_GROUND[b0];
    const jx = (vnoise((ox + x) / 19, (ov + v) / 19, 7) - 0.5) * 24;
    const jv = (vnoise((ox + x) / 19 + 50, (ov + v) / 19, 8) - 0.5) * 24;
    return BIOME_GROUND[gb(Math.floor((x + jx) / TT), Math.floor((v + jv) / TT))] || TM.GRASS;
  };

  // props (including the rim of neighbouring screens so edges stay continuous)
  const props = [];
  let hasWater = false;
  const scr = getScreen(sx, sy);
  // the headstone hiding the stairs leans, as the rumours say
  const leaning = new Set((scr.secrets || []).filter(s => s.kind === "push").map(s => s.x + "," + s.y));
  for (let ty = -1; ty <= ROWS; ty++) {
    for (let tx = -1; tx <= COLS; tx++) {
      const id = tileAt(tx, ty);
      if (id === T_WATER || id === T_DOCK || id === T_BRIDGE) hasWater = true;
      if (ty < 0) continue;
      const gtx = sx * COLS + tx, gty = sy * ROWS + ty, r = hash2(gtx, gty, 5);
      const b = tb(tx, ty);
      switch (id) {
        case T_TREE: {
          // trees stand a few pixels off the tile grid so groves don't read as orchards
          const p = placeProp(b === "G" ? "deadtree" : (b === "F" && r < 0.8 ? "pine" : "tree"), tx, ty, Math.floor(r * 6));
          const dy = Math.round((hash2(gtx, gty, 8) - 0.5) * 10);
          p.x += Math.round((hash2(gtx, gty, 6) - 0.5) * 18); p.y += dy; p.key += dy;
          props.push(p);
          break;
        }
        case T_BUSH: props.push(placeProp("bush", tx, ty, Math.floor(r * 4))); break;
        case T_GRAVE: props.push(placeProp(leaning.has(tx + "," + ty) ? "graveTilt" : "grave", tx, ty, Math.floor(r * 4))); break;
        case T_CACTUS: props.push(placeProp("cactus", tx, ty, Math.floor(r * 4))); break;
        case T_STUMP: props.push(placeProp("stump", tx, ty, 0)); break;
        case T_STATUE: props.push(placeProp("statue", tx, ty, 0)); break;
        case T_DPOST: props.push(placeProp("post", tx, ty, 0)); break;
        // (overworld heavy rocks keep the warm granite; dungeon ones are cold stone)
        case T_DROCK: props.push(placeProp("hrock", tx, ty, 2)); break;
        case T_ROCK:
          if (!isRockish(tileAt(tx - 1, ty)) && !isRockish(tileAt(tx + 1, ty)) && !isRockish(tileAt(tx, ty - 1)) && !isRockish(tileAt(tx, ty + 1))) {
            // (a grey field stone on the sand or among the graves read as out of place)
            props.push(placeProp("boulder", tx, ty, (r < 0.5 ? 0 : 1) + 2 * (b === "D" ? 1 : b === "G" ? 2 : 0)));
          }
          break;
      }
    }
  }
  // landmarks: dungeon mouths get carved portals, shops a painted sign
  const PORTAL = { 1: 1, 2: 3, 3: 0, 4: 4, 5: 5, 6: 6, 7: 2 };
  for (const k in scr.dungeonAt) {
    const [x, y] = k.split(",").map(Number);
    const sealed = scr.gate && scr.gate.x === x && scr.gate.y === y;
    if (scr.dungeonAt[k] === 7) props.push(placeProp("keepgate", x, y, sealed ? (G.shards >= 4 ? 2 : 1) : 0));
    else props.push(placeProp(sealed ? "sealed" : "portal", x, y, PORTAL[scr.dungeonAt[k]] || 0));
  }
  for (const k in scr.caves) {
    if (!/^shop/.test(scr.caves[k])) continue;
    const [x, y] = k.split(",").map(Number);
    props.push(placeProp("shopsign", x, y, 0));
  }
  // village buildings and furniture of the street
  const decoAt = new Set((scr.deco || []).filter(d => d.kind === "fence").map(d => d.x + "," + d.y));
  for (const d of scr.deco || []) {
    if (d.kind === "tree") continue;
    let v = d.v || 0;
    if (d.kind === "fence") v = (decoAt.has(d.x + "," + (d.y - 1)) ? 1 : 0) | (decoAt.has((d.x + 1) + "," + d.y) ? 2 : 0) | (decoAt.has(d.x + "," + (d.y + 1)) ? 4 : 0) | (decoAt.has((d.x - 1) + "," + d.y) ? 8 : 0);
    props.push(placeProp(d.kind, d.x, d.y, v));
  }
  // bridge posts and rails, the stones they land on, cave-mouth lips (props.js)
  props.push(...terrainProps(sx, sy, tileAt, scr));
  const terrain = renderTerrain({
    kind: "ow", ox, ov, tileAt, groundMatAt, pathAt,
    rockStyleAt: (tx, ty) => worldRockStyle(sx * COLS + tx, sy * ROWS + ty),
    fallAt: (tx, ty) => worldFallAt(sx * COLS + tx, sy * ROWS + ty),
    streamAt: (tx, ty) => worldStreamAt(sx * COLS + tx, sy * ROWS + ty),
    shadows: props.map(propShadow).filter(Boolean),
  });
  return { kind: "ow", terrain, props, hasWater, base: terrain.base, shade: terrain.shade, overlay: null };
}

// ---------- dungeon rooms ----------
const DUNGEON_LOOK = {
  1: { wall: "dstone", floor: "neutral", trim: "earth" },     // tidal hollow: blue stone
  2: { wall: "green", floor: "earth", trim: "stone" },        // root warren: mossy
  3: { wall: "earth", floor: "stone", trim: "red" },          // barrow deep: clay
  4: { wall: "gold", floor: "plaster", trim: "red" },         // sunscar vault: sandstone
  5: { wall: "water", floor: "dstone", trim: "dstone" },      // rimewell: ice
  6: { wall: "red", floor: "stone", trim: "dstone" },         // cinder deep: fire
  7: { wall: "purple", floor: "neutral", trim: "stone" },     // shadow keep
};
const DIR_SIDE = { [UP]: "N", [DOWN]: "S", [LEFT]: "W", [RIGHT]: "E" };

function roomDoorState(d, rx, ry, dir, shut) {
  const room = getDungeonRoom(d, rx, ry);
  const t = doorTypeOf(room, dir);
  switch (t) {
    case "exit": return "exit";
    case "open": case "shutter": return (shut && shut[dir]) ? "shutter" : "open";
    case "lock":
      // a key door held shut (the way in, behind the hero in a boss fight) reads as a
      // shutter: only a door that really wants a key looks locked
      if (shut && shut[dir]) return "shutter";
      if (G.flags[doorFlag(d, rx, ry, dir)]) return "open";
      return (room.boss && !G.flags["d" + d + ":boss"]) ? "shutter" : "locked";
    case "bomb": return G.flags[doorFlag(d, rx, ry, dir)] ? "bombed" : "crack";
    // (the gatehouse stays when its guardian falls; only the leaves are gone)
    case "boss": return G.flags["d" + d + ":boss"] ? "bossopen" : "bossdoor";
  }
  return "wall";
}
function roomDoors(d, rx, ry, shut) {
  const o = {};
  for (const dir of [UP, DOWN, LEFT, RIGHT]) o[DIR_SIDE[dir]] = roomDoorState(d, rx, ry, dir, shut);
  return o;
}

// Kinds of prop that stand for movable room pieces (drawn live, never baked).
const PIECE_PROP = { [T_DBLOCK]: "block", [T_DPOT]: "pot", [T_DROCK]: "hrock", [T_DPEG]: "peg" };
const FLOOR_KINDS = new Set([T_DWATER, T_DPIT, T_DLAVA, T_DICE, T_DSWITCH]);
function roomPiecesOf(tiles) {
  const floor = tiles.floor || tiles, out = [];
  for (let ty = 2; ty <= 8; ty++) for (let tx = 2; tx <= 13; tx++) {
    const t = tiles[ty][tx];
    if (PIECE_PROP[t] && floor[ty][tx] !== t) out.push(placeProp(PIECE_PROP[t], tx, ty, 0));
  }
  return out;
}

// The land round each dungeon's mouth on the overworld, seen through its way out.
const OUTSIDE_OF_BIOME = { F: "forest", D: "sand", M: "scree" };
function dungeonOutside(d) {
  const e = DUNGEONS[d] && DUNGEONS[d].entranceOW;
  return (e && OUTSIDE_OF_BIOME[biomeAt(e.sx, e.sy)]) || "grass";
}
// How a room's doors are dressed (static per room; see DoorKit.paintDoorway):
//   noSeal  a boss set in the wall right in front of its gate hides the seal (seen between
//           its spikes the seal read as a jewel, a weak spot, in its crown; it shows as it breaks)
//   bossWay the sides whose door leads into a boss room through its way in (not the rooms
//           past its gatehouse), marked as the way to the boss
//   out     the land outside the dungeon's way out
function roomShellOpts(d, rx, ry) {
  const room = getDungeonRoom(d, rx, ry) || { doors: {} }, bossWay = {};
  for (const dir of [UP, DOWN, LEFT, RIGHT]) {
    const nb = getDungeonRoom(d, rx + DX[dir], ry + DY[dir]);
    const back = nb ? doorTypeOf(nb, OPP[dir]) : "wall";
    if (nb && nb.boss && doorTypeOf(room, dir) !== "wall" && back !== "boss" && back !== "wall") bossWay[DIR_SIDE[dir]] = true;
  }
  return { noSeal: room.boss === "frostmaw", bossWay, out: dungeonOutside(d) };
}
function buildRoomScene(d, rx, ry, tiles, doors) {
  const room = getDungeonRoom(d, rx, ry);
  const look = DUNGEON_LOOK[d] || DUNGEON_LOOK[1];
  const floor = tiles.floor || tiles;
  const props = [];
  let hasWater = false;
  for (let ty = 2; ty <= 8; ty++) {
    for (let tx = 2; tx <= 13; tx++) {
      const id = floor[ty][tx];
      if (id === T_STATUE) props.push(placeProp("statue", tx, ty, d));
      else if (id === T_DPOST) props.push(placeProp("post", tx, ty, 0));
      else if (id === T_DEYE || id === T_DEYEON) props.push(placeProp("eye", tx, ty, id === T_DEYEON ? 1 : 0));
      else if (id === T_DWATER) hasWater = true;
    }
  }
  const floorTile = (tx, ty) => (tx < 2 || tx > 13 || ty < 2 || ty > 8) ? T_DFLOOR : (FLOOR_KINDS.has(floor[ty][tx]) ? floor[ty][tx] : T_DFLOOR);
  const terrain = renderTerrain({
    kind: "dun", ox: d * 8192 + rx * 512, ov: ry * 352, theme: look.wall, floor: look.floor,
    tileAt: floorTile, wallH: () => 0, shadows: props.map(propShadow).filter(Boolean),
  });
  const shellOpts = roomShellOpts(d, rx, ry);
  // torches on the north face (left unlit in dark rooms, until the candle lights the room);
  // a wall with a gatehouse carries no torches (four flames in a row scattered the eye: the
  // gatehouse's two bowls are the fire of that wall)
  const gate = doors.N === "bossdoor" || doors.N === "bossopen";
  const torches = gate ? [] : [{ x: 160, lit: !room.dark }, { x: 352, lit: !room.dark }];
  const shell = renderRoomShell(look.wall, look.trim, doors, "brick", look.floor, Object.assign({ torches }, shellOpts));
  // (each unlit torch keeps the glow it will throw once lit)
  let gi = 0;
  for (const t of torches) if (!t.lit) t.glow = shell.glows[gi++];
  // bake: floor + the band of shade the north and west walls throw + the wall frame
  const base = Dev_canvas(RW, 352), bg = base.getContext("2d");
  bg.drawImage(terrain.base, 0, 0);
  bg.drawImage(terrain.shade, ROOM.X0, ROOM.Y0 + ROOM.TRIM, ROOM.X1 - ROOM.X0, 8, ROOM.X0, ROOM.Y0 + ROOM.TRIM, ROOM.X1 - ROOM.X0, 8);
  bg.drawImage(terrain.shade, ROOM.X0 + ROOM.TRIM, ROOM.Y0, 6, ROOM.Y1 - ROOM.Y0, ROOM.X0 + ROOM.TRIM, ROOM.Y0, 6, ROOM.Y1 - ROOM.Y0);
  const shade = Dev_canvas(RW, 352), sg = shade.getContext("2d");
  sg.drawImage(terrain.shade, 0, 0);
  // daylight falls in on the floor in front of the way out
  for (const side of ["N", "S", "W", "E"]) if (doors[side] === "exit") { DoorKit.daylight(base, side); DoorKit.daylight(shade, side); }
  bg.drawImage(shell.frame, 0, 0);
  sg.drawImage(shell.frame, 0, 0);
  // fire in the bowls of a boss gatehouse
  // (on the fire theme's orange rim the flame's outer colours melted into the stone: it gets a dark rim)
  if (gate) for (const [x, y] of DoorKit.bowlSpots("N")) torches.push({ x, y, lit: true, bowl: true, rim: look.wall === "red" });
  const scene = { kind: "room", terrain, props, pieces: roomPiecesOf(tiles), hasWater, base, shade, overlay: shell.overlay, torches, dark: !!room.dark, strips: [], doors, shellOpts, room: { d, rx, ry } };
  // floor switches: a plate in a stone frame, painted over the floor in the state it is in now
  scene.switches = [];
  for (let ty = 2; ty <= 8; ty++) for (let tx = 2; tx <= 13; tx++) if (floor[ty][tx] === T_DSWITCH) scene.switches.push({ tx, ty, shown: null, target: null, t0: 0, from: null });
  if (scene.switches.length) updateSwitchArt(scene, tiles, true);
  return scene;
}

// ---------- floor switches (E17) ----------
// A switch's look: "up" (nothing on it; the hero's own weight is not enough), "held" (a
// block stands on it) or "solved" (its room is solved: it stays down for good, in another
// colour). Going down it passes through two in-between heights, 3 ticks each (and back up
// the same way when a block is pushed off it).
function switchWant(scene, sw, tiles) {
  const r = scene.room;
  if (G.flags && G.flags[solvedFlag(r.d, r.rx, r.ry)]) return "solved";
  return tiles[sw.ty][sw.tx] !== T_DSWITCH ? "held" : "up";
}
const SWITCH_TRAVEL = 3;
function switchFrame(sw, now) {
  if (!sw.from || sw.from === sw.target) return sw.target;
  const t = Math.floor((now - sw.t0) / SWITCH_TRAVEL);
  const down = sw.from === "up", up = sw.target === "up";
  if (down && t < 2) return t === 0 ? "mid1" : "mid2";
  if (up && t < 2) return t === 0 ? "mid2" : "mid1";
  return sw.target;
}
// Paint each switch whose look changed into the scene's baked floor (and its shade layer, so
// a shadow falling on it shows the switch as it is). instant: no travel (a new scene).
function updateSwitchArt(scene, tiles, instant) {
  const floorRamp = (DUNGEON_LOOK[scene.room.d] || DUNGEON_LOOK[1]).floor;
  let bg = null, sg = null;
  for (const sw of scene.switches) {
    const want = switchWant(scene, sw, tiles);
    // (instant: a room just entered or scrolling in shows its switches as they are, even
    // when its cached picture still holds an older look; no travel plays on arrival)
    if (instant) { sw.from = sw.target = want; }
    else if (want !== sw.target) { sw.from = sw.target === null ? want : sw.shown; sw.target = want; sw.t0 = G.frame; }
    const f = switchFrame(sw, G.frame);
    // a block standing on it hides the whole plate: light seeps out round its foot instead
    // (a short glint half way down, then full; gold while held, blue once solved)
    const covered = tiles[sw.ty][sw.tx] !== T_DSWITCH;
    const glow = covered && (f === "mid2" || f === "held" || f === "solved") ? (f === "mid2" ? 1 : 2) : 0;
    const look = f + "|" + glow;
    if (look === sw.look) continue;
    const spr = DunArt.switchSprite(floorRamp, f);
    if (!bg) { bg = scene.base.getContext("2d"); sg = scene.shade.getContext("2d"); }
    const x = sw.tx * TT + 16 - spr.ax, y = sw.ty * TT + 16 - spr.ay;
    // (the floor under the switch is kept from its first painting and put back each time: the
    // glow reaches past the plate's frame, and a later look must not leave it behind)
    if (!sw.under) {
      sw.under = { b: Dev_canvas(36, 36), s: Dev_canvas(36, 36) };
      sw.under.b.getContext("2d").drawImage(scene.base, x, y, 36, 36, 0, 0, 36, 36);
      sw.under.s.getContext("2d").drawImage(scene.shade, x, y, 36, 36, 0, 0, 36, 36);
    }
    bg.clearRect(x, y, 36, 36); sg.clearRect(x, y, 36, 36);
    bg.drawImage(sw.under.b, x, y); sg.drawImage(sw.under.s, x, y);
    bg.drawImage(spr.canvas, x, y);
    sg.drawImage(spr.shade, x, y);
    if (glow) {
      const gl = DunArt.switchGlow(f === "solved" ? "water" : "gold", glow);
      bg.drawImage(gl.canvas, x, y); sg.drawImage(gl.shade, x, y);
    }
    sw.shown = f; sw.look = look;
    scene.snapshot = null;
  }
}
// A room whose doors only swap leaf, bars or seal (open / locked / shutter, or the two boss
// states) is not rebuilt: the picture it had is copied and each changed door box repainted.
// (a whole rebuild would stall the very frame a door starts to move)
function deriveRoomScene(src, doors, look) {
  const changed = [];
  for (const side of ["N", "S", "W", "E"]) {
    if (src.doors[side] === doors[side]) continue;
    if (!DoorKit.canSwap(src.doors[side], doors[side])) return null;
    changed.push(side);
  }
  const base = Dev_canvas(RW, 352), shade = Dev_canvas(RW, 352), bg = base.getContext("2d"), sg = shade.getContext("2d");
  bg.drawImage(src.base, 0, 0);
  sg.drawImage(src.shade, 0, 0);
  for (const side of changed) {
    const im = DoorKit.doorImage(side, doors[side], look.wall, look.floor, src.shellOpts);
    bg.drawImage(im.canvas, im.x, im.y);
    sg.drawImage(im.canvas, im.x, im.y);
  }
  return Object.assign({}, src, { base, shade, doors, snapshot: null, switches: (src.switches || []).map(sw => Object.assign({}, sw)) });
}
// the room's floor inside the walls (door cells left out: they open and shut)
function interiorHash(tiles) {
  let h = 2166136261;
  for (let y = 2; y <= 8; y++) for (let x = 2; x <= 13; x++) { h ^= tiles[y][x] + 1; h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Furniture of a house interior, in logic tiles (h = tiles tall). Kept clear of the
// host's spot, the speech lines and the doorway.
// Each home is furnished for who lives there (and walled and floored differently):
// 0 the elder's plastered hall with books and a rug, 1 the widow's plank cottage with
// her spinning wheel, 2 the children's painted room with two cots and toys, 3 the smithy.
// (v picks a prop's variant: the elder's second case holds scrolls, and his table carries
// a book where the widow's has bread; the children keep a toy box and blocks, not a
// chest and a barrel)
const HOUSE_LAYOUTS = [
  { wall: "plaster", floorTone: 0, rugs: [[7.5, 6]], items: [{ kind: "bed", tx: 2, ty: 3, h: 2 }, { kind: "bookcase", tx: 10, ty: 2, h: 1 }, { kind: "bookcase", v: 1, tx: 12, ty: 2, h: 1 }, { kind: "table", v: 1, tx: 12, ty: 6, h: 1 }, { kind: "chair", tx: 10, ty: 6, h: 1 }, { kind: "plant", tx: 2, ty: 8, h: 1 }, { kind: "barrel", tx: 13, ty: 8, h: 1 }] },
  { wall: "wood", floorTone: -1, items: [{ kind: "bed", tx: 13, ty: 3, h: 2 }, { kind: "wheel", tx: 3, ty: 3, h: 1 }, { kind: "table", tx: 3, ty: 7, h: 1 }, { kind: "chair", tx: 5, ty: 7, h: 1 }, { kind: "chest", tx: 12, ty: 8, h: 1 }, { kind: "plant", tx: 13, ty: 6, h: 1 }, { kind: "pot", tx: 2, ty: 8, h: 1 }] },
  { wall: "blue", floorTone: 1, rugs: [[7.5, 6, 1]], items: [{ kind: "cot", tx: 2, ty: 3, h: 2 }, { kind: "cot", tx: 13, ty: 3, h: 2 }, { kind: "toys", tx: 4, ty: 7, h: 1 }, { kind: "toybox", tx: 7, ty: 2, h: 1 }, { kind: "plant", tx: 12, ty: 7, h: 1 }, { kind: "blocks", tx: 13, ty: 8, h: 1 }] },
  // the smithy: stone walls, a forge on the back wall and an anvil by it
  { wall: "stone", floor: "dirt", items: [{ kind: "forge", tx: 3, ty: 2, h: 1 }, { kind: "anvil", tx: 5, ty: 3, h: 1 }, { kind: "shelf", tx: 12, ty: 2, h: 1 }, { kind: "barrel", tx: 13, ty: 7, h: 1 }, { kind: "barrel", tx: 13, ty: 8, h: 1 }, { kind: "pot", tx: 12, ty: 8, h: 1 }] },
];
function houseFurniture(layout) { return HOUSE_LAYOUTS[(layout || 0) % HOUSE_LAYOUTS.length].items; }

// The land round a cave's mouth (its region letter) picks the cave's accents: roots push
// through in the woods and among the graves; its crystal veins are dull slate, grey among the
// graves, rusty jasper in the desert (never the gem counter's blue or the loot's gold).
function caveVariant() {
  const r = G.caveReturn, b = r ? biomeAt(r.sx, r.sy) : "P";
  return b === "L" ? "P" : b;
}
const CAVE_CRYSTAL = { P: "dstone", F: "dstone", M: "dstone", D: "hair", G: "neutral" };
// the land seen through the cave's way out (the dungeons' exit views, DoorKit OUTSIDE): the
// graves' grass is the forest's dark grass
const CAVE_OUTSIDE = { F: "forest", G: "forest", D: "sand", M: "scree" };
function buildCaveScene(style, layout, variant) {
  if (style === "house") return buildHouseScene(layout);
  const v = variant || "P";
  const terrain = renderTerrain({
    kind: "dun", ox: 7 * 8192, ov: 0, theme: "stone", floorStyle: "dirt",
    tileAt: () => T_DFLOOR, wallH: () => 0, shadows: [],
  });
  const shell = renderRoomShell("stone", "earth", { S: "outside" }, "cave", "earth", { variant: v, out: CAVE_OUTSIDE[v] || "grass" });
  const base = Dev_canvas(RW, 352), bg = base.getContext("2d");
  bg.drawImage(terrain.base, 0, 0);
  wallShadeBand(bg, terrain.shade, 0, 4, 3);
  const shade = Dev_canvas(RW, 352), sg = shade.getContext("2d");
  sg.drawImage(terrain.shade, 0, 0);
  DoorKit.daylight(base, "S"); DoorKit.daylight(shade, "S");
  bg.drawImage(shell.frame, 0, 0);
  sg.drawImage(shell.frame, 0, 0);
  caveFloorRubble(base, shade, v);
  // two braziers flank the host, where the old campfires stood
  const props = [
    { kind: "brazier", v: 0, x: 64 * SC + 16, y: 40 * SC + 28, key: 40 * SC + 28 },
    { kind: "brazier", v: 0, x: 176 * SC + 16, y: 40 * SC + 28, key: 40 * SC + 28 },
  ];
  return { kind: "cave", terrain, props, hasWater: false, base, shade, overlay: shell.overlay, braziers: props, strips: [] };
}
// The band of shade the north and west walls throw on the floor (sk: the skirting's width,
// nb / wb: the band's depth), its far edge dithered into the lit floor.
function wallShadeBand(bg, shadeCv, sk, nb, wb) {
  const X0 = ROOM.X0 + sk, Y0 = ROOM.Y0 + sk;
  bg.drawImage(shadeCv, X0, Y0, ROOM.X1 - X0, nb, X0, Y0, ROOM.X1 - X0, nb);
  bg.drawImage(shadeCv, X0, Y0, wb, ROOM.Y1 - Y0, X0, Y0, wb, ROOM.Y1 - Y0);
  const dith = (x, y) => { if ((x + y) & 1) bg.drawImage(shadeCv, x, y, 1, 1, x, y, 1, 1); };
  for (let y = Y0 + nb; y < Y0 + nb + 2; y++) for (let x = X0 + wb + 2; x < ROOM.X1; x++) dith(x, y);
  for (let x = X0 + wb; x < X0 + wb + 2; x++) for (let y = Y0 + nb; y < ROOM.Y1; y++) dith(x, y);
}
// Fallen stones along the foot of the cave walls: a strip of pebbles (2-4 px, lit on their
// upper left, a contact shade on their lower right), bigger chunks every so often, and the
// crystal clusters growing at the foot of the side walls and the south wall. Kept off the
// way out and short of the walk lane. Painted into the floor and its shade layer.
const _darkSpr = new WeakMap();
function darkSprite(spr) {
  let o = _darkSpr.get(spr);
  if (!o) {
    const p = new Pix(spr.pix.w, spr.pix.h);
    for (let i = 0; i < p.d.length; i++) if (spr.pix.d[i]) p.d[i] = darker(spr.pix.d[i]);
    o = { pix: p, w: spr.w, h: spr.h, ax: spr.ax, ay: spr.ay };
    _darkSpr.set(spr, o);
  }
  return o;
}
function caveFloorRubble(base, shade, v) {
  const R = ROOM, W = RW, H = 352;
  const bufs = [base, shade].map(cv => { const g = cv.getContext("2d"), id = g.getImageData(0, 0, W, H); return { g, id, t: { w: W, h: H, d: new Uint32Array(id.data.buffer) } }; });
  const exit = (x) => x >= DOOR_BOX.S.x0 - 10 && x < DOOR_BOX.S.x1 + 10;
  // (the wall's foot runs along each side; u along it, e out from it into the room)
  const at = (side, u, e) => side === "N" ? [u, R.Y0 + e] : side === "S" ? [u, R.Y1 - 1 - e] : side === "W" ? [R.X0 + e, u] : [R.X1 - 1 - e, u];
  // a pebble w x h (screen px) with its top-left corner at (x, y)
  const pebble = (x, y, w, h, tone) => {
    bufs.forEach((b, k) => {
      const d = b.t.d;
      for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
        if ((xx === 0 || xx === w - 1) && (yy === 0 || yy === h - 1) && w > 2 && h > 2) continue;   // round the corners
        const t = (xx === 0 && yy < h - 1) || yy === 0 ? tone + 1 : (xx === w - 1 || yy === h - 1) ? tone - 1 : tone;
        const c = pc("stone", Math.max(0, Math.min(4, t)));
        d[(y + yy) * W + x + xx] = k ? darker(c) : c;
      }
      // contact shade: the floor just below and right of the pebble
      for (let xx = 1; xx <= w; xx++) { const i = (y + h) * W + x + xx; d[i] = darker(d[i]); }
      for (let yy = 1; yy < h; yy++) { const i = (y + yy) * W + x + w; d[i] = darker(d[i]); }
    });
  };
  const sprite = (spr, x, y) => bufs.forEach((b, k) => DoorKit.stampSprite(b.t, k ? darkSprite(spr) : spr, x, y));
  let n = 0;
  for (const side of ["N", "W", "E", "S"]) {
    const vert = side === "W" || side === "E", u0 = vert ? R.Y0 + 8 : R.X0 + 8, u1 = vert ? R.Y1 - 8 : R.X1 - 8;
    // pebbles: a loose strip, 1-4 px out from the wall
    for (let u = u0 + Math.floor(hash2(n, 1, 811) * 6); u < u1; u += 5 + Math.floor(hash2(u, n, 812) * 9)) {
      if (!vert && side === "S" && exit(u)) continue;
      const w = 2 + Math.floor(hash2(u, 3, 813) * 3), h = 2 + Math.floor(hash2(u, 4, 813) * 2), e = 1 + Math.floor(hash2(u, 5, 813) * 4);
      const pw = vert ? h : w, ph = vert ? w : h;
      let [x, y] = at(side, u, e);
      if (side === "E") x -= pw - 1;
      if (side === "S") y -= ph - 1;
      pebble(x, y, pw, ph, hash2(u, 6, 813) < 0.3 ? 3 : 2);
    }
    // bigger chunks, 20-40 px apart
    for (let u = u0 + 10 + Math.floor(hash2(n, 2, 814) * 12); u < u1 - 6; u += 20 + Math.floor(hash2(u, n, 815) * 20)) {
      if (!vert && side === "S" && exit(u)) continue;
      n++;
      // (on the north side a little way out, so the stone's lit top does not touch the wall's
      // foot line and read as a stub of the wall)
      const [x, y] = at(side, u, side === "N" ? 10 : side === "S" ? 2 : 6);
      sprite(DoorKit.rubbleSprite("stone", 30 + (n % 9), hash2(n, 3, 816) < 0.45, 2, hash2(n, 4, 816) < 0.5), x, y);
    }
  }
  // crystal veins growing out of the foot of the west, east and south walls
  const cr = CAVE_CRYSTAL[v] || "dstone";
  for (const [side, u, e, seed] of [["W", 262, 3, 1], ["E", 118, 3, 2], ["S", 420, 1, 3]]) {
    const [x, y] = at(side, u, e);
    sprite(DunArt.crystalCluster(cr, seed), x, y);
  }
  for (const b of bufs) b.g.putImageData(b.id, 0, 0);
}

function buildHouseScene(layout) {
  const L = HOUSE_LAYOUTS[(layout || 0) % HOUSE_LAYOUTS.length];
  const props = L.items.map(f => {
    // (the smith's forge burns again once his quest is done)
    const p = placeProp(f.kind, f.tx, f.ty, f.kind === "forge" && G.flags["q:forge"] ? 1 : f.v || 0);
    if (f.h === 2) { p.y = (f.ty + 1) * TT; p.key = (f.ty + 2) * TT - 4; }
    // keep clear of the skirting along the side walls
    if (f.tx <= 2) p.x += 5; else if (f.tx >= 13) p.x -= 5;
    return p;
  });
  const terrain = renderTerrain({
    kind: "dun", ox: 6 * 8192 + (layout || 0) * 512, ov: 0, theme: "earth", floorStyle: L.floor || "planks", floor: L.floorRamp, floorTone: L.floorTone,
    tileAt: () => T_DFLOOR, wallH: () => 0, shadows: props.map(propShadow).filter(Boolean),
  });
  const shell = renderRoomShell(L.wall, "earth", { S: "outside" }, "house", "earth", { variant: (layout || 0) % HOUSE_LAYOUTS.length });
  const base = Dev_canvas(RW, 352), bg = base.getContext("2d");
  bg.drawImage(terrain.base, 0, 0);
  // rugs are part of the floor (as props they would be sorted over people's feet)
  for (const [tx, ty, rv] of L.rugs || []) { const s = getProp("rug", rv || 0); bg.drawImage(s.canvas, Math.round(tx * TT + 16 - s.ax), Math.round(ty * TT + 16 - s.ay)); }
  // the band of shade the north and west walls throw, laid right against the house's 4px
  // skirting board (set out past the dungeon's 12px trim, it floated on the planks as a
  // loose dark strip a few px from the wall), its far edge dithered into the lit floor
  wallShadeBand(bg, terrain.shade, 4, 6, 4);
  const shade = Dev_canvas(RW, 352), sg = shade.getContext("2d");
  sg.drawImage(terrain.shade, 0, 0);
  // the daylight each window throws on the floor below it
  houseWindowLight(base, shade, layout);
  DoorKit.daylight(base, "S"); DoorKit.daylight(shade, "S");
  bg.drawImage(shell.frame, 0, 0);
  sg.drawImage(shell.frame, 0, 0);
  return { kind: "cave", terrain, props, hasWater: false, base, shade, overlay: shell.overlay, braziers: [], strips: [] };
}
// A window's patch of daylight on the floor: 24 x 14, leaning right (the sun stands to the
// upper left), a step lighter and warmer (palette swaps only), its edge on a checkerboard.
function houseWindowLight(base, shade, layout) {
  const map = DoorKit.lighterMap(), y0 = ROOM.Y0 + 10, Hh = 14, Wd = 24;
  for (const cv of [base, shade]) {
    const g = cv.getContext("2d"), id = g.getImageData(0, 0, RW, 352), d = new Uint32Array(id.data.buffer);
    for (const u of houseWindows(layout)) {
      for (let r = 0; r < Hh; r++) {
        const y = y0 + r, x0 = u - Wd / 2 + Math.round(r * 0.7);
        for (let x = x0; x < x0 + Wd; x++) {
          const edge = r === 0 || r === Hh - 1 || x === x0 || x === x0 + Wd - 1;
          if (edge && ((x + y) & 1)) continue;
          const i = y * RW + x;
          d[i] = map.get(d[i]) || d[i];
        }
      }
    }
    g.putImageData(id, 0, 0);
  }
}

function Dev_canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").imageSmoothingEnabled = false;
  return c;
}

// ---------- scene selection ----------
function sceneKeyFor(area, a, b, c, tiles, doors) {
  return area + ":" + a + "," + b + "," + c + ":" + tilesHash(tiles) + ":" + (doors ? doors.N + doors.S + doors.W + doors.E : "");
}
function sceneForOverworld(sx, sy, tiles) {
  // (the keep's seal starts to glow at four shards)
  const key = sceneKeyFor("ow", sx, sy, G.shards >= 4 ? 1 : 0, tiles);
  let s = sceneCacheGet(key);
  if (!s) { s = buildOWScene(sx, sy, tiles); sceneCachePut(key, s); }
  return s;
}
// The door set last shown for the room the hero is in: a change starts a door animation.
let _lastDoors = null, _lastScene = null;
function sceneForRoom(d, rx, ry, tiles, shut) {
  const doors = roomDoors(d, rx, ry, shut);
  const live = G.area === "dungeon" && d === G.dungeon && rx === G.rx && ry === G.ry;
  if (!live && G.area === "dungeon" && d === G.dungeon && Math.abs(rx - G.rx) + Math.abs(ry - G.ry) === 1) {
    // the room scrolling in: its shutters are still up as the hero walks through; they
    // slam once he is inside
    for (const side in doors) if (doors[side] === "shutter") doors[side] = "open";
    DoorAnim.clear();
  }
  // movable pieces are drawn live, so they don't make a new scene when they move
  const key = sceneKeyFor("room", d, rx, ry, tiles.floor || tiles, doors);
  let s = sceneCacheGet(key);
  if (!s) {
    const rk = d + ":" + rx + "," + ry, ih = interiorHash(tiles.floor || tiles);
    // the room as it was a moment ago, or as it scrolled in with its shutters still up
    let src = (live && _lastScene && _lastScene.rk === rk && _lastScene.ih === ih) ? _lastScene : null;
    if (!src && live) {
      const up = {};
      for (const side in doors) up[side] = doors[side] === "shutter" ? "open" : doors[side];
      const c = sceneCacheGet(sceneKeyFor("room", d, rx, ry, tiles.floor || tiles, up));
      if (c && c.ih === ih) src = c;
    }
    s = (src && deriveRoomScene(src, doors, DUNGEON_LOOK[d] || DUNGEON_LOOK[1])) || buildRoomScene(d, rx, ry, tiles, doors);
    s.rk = rk; s.ih = ih;
    sceneCachePut(key, s);
  }
  // a cached picture of a room scrolling in, or just entered, shows its floor switches as they
  // are now (a switch whose room was solved meanwhile does not sink on arrival)
  if (s.switches && s.switches.length && (!live || !_lastDoors || _lastDoors.key !== d + ":" + rx + "," + ry)) updateSwitchArt(s, tiles, true);
  if (live) {
    _lastScene = s;
    const rk = d + ":" + rx + "," + ry, look = DUNGEON_LOOK[d] || DUNGEON_LOOK[1];
    if (!_lastDoors || _lastDoors.key !== rk) {
      // a new room: the shutters fall behind the hero
      DoorAnim.clear();
      for (const side in doors) if (doors[side] === "shutter") DoorAnim.start(side, "open", "shutter", look, s);
      DoorAnim.warmRoom(doors, look, false, s.shellOpts);
    } else {
      for (const side in doors) if (_lastDoors.doors[side] !== doors[side]) DoorAnim.start(side, _lastDoors.doors[side], doors[side], look, s);
    }
    _lastDoors = { key: rk, doors };
  }
  return s;
}
function sceneForCave() {
  const def = G.cave && G.cave.def;
  const style = def && def.room === "house" ? "house" : "cave", layout = def && def.layout || 0;
  const v = style === "cave" ? caveVariant() : "";
  const key = "cave:" + style + (style === "house" ? layout + (layout === 3 && G.flags["q:forge"] ? "lit" : "") : v);
  let s = sceneCacheGet(key);
  if (!s) { s = buildCaveScene(style, layout, v); sceneCachePut(key, s); }
  return s;
}
function currentScene() {
  if (G.area !== "dungeon") { _lastDoors = null; _lastScene = null; DoorAnim.clear(); }
  if (G.area === "overworld") return sceneForOverworld(G.sx, G.sy, G.tiles);
  if (G.area === "dungeon") return sceneForRoom(G.dungeon, G.rx, G.ry, G.tiles, G.shut);
  return sceneForCave();
}

// ---------- palette-safe drop shadows ----------
const _ellMask2 = new Map();
function sceneEllipseMask(rx, ry) {
  const key = rx + "x" + ry;
  let m = _ellMask2.get(key);
  if (m) return m;
  const p = new Pix(rx * 2 + 1, ry * 2 + 1);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    const dx = (x - rx) / (rx + 0.5), dy = (y - ry) / (ry + 0.5);
    if (dx * dx + dy * dy <= 1) p.d[y * p.w + x] = 0xff000000;
  }
  m = p.toCanvas();
  _ellMask2.set(key, m);
  return m;
}
const _shTmp = Dev_canvas(64, 64);
function sceneDynShadow(c, shadeCanvas, cx, cy, rx, ry) {
  const m = sceneEllipseMask(rx, ry);
  if (_shTmp.width < m.width || _shTmp.height < m.height) { _shTmp.width = m.width; _shTmp.height = m.height; }
  const t = _shTmp.getContext("2d");
  const x0 = Math.round(cx - rx), y0 = Math.round(cy - ry);
  t.clearRect(0, 0, m.width, m.height);
  t.drawImage(shadeCanvas, x0, y0, m.width, m.height, 0, 0, m.width, m.height);
  t.globalCompositeOperation = "destination-in";
  t.drawImage(m, 0, 0);
  t.globalCompositeOperation = "source-over";
  c.drawImage(_shTmp, 0, 0, m.width, m.height, x0, y0 + RHUD, m.width, m.height);
}

// ---------- darkness for unlit rooms (checker dither, clear circle around the hero) ----------
let _darkCanvases = null;
function darkCanvases() {
  if (_darkCanvases) return _darkCanvases;
  const ink = inkU32();
  const mk = (keep) => { const p = new Pix(RW, 352); for (let y = 0; y < 352; y++) for (let x = 0; x < RW; x++) if (keep(x, y)) p.d[y * RW + x] = ink; return p.toCanvas(); };
  const hole = (r) => { const p = new Pix(r * 2 + 1, r * 2 + 1); for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if ((x - r) ** 2 + (y - r) ** 2 <= r * r) p.d[y * p.w + x] = 0xff000000; return p.toCanvas(); };
  _darkCanvases = { a: mk((x, y) => ((x + y) & 1) === 0), b: mk((x, y) => ((x + y) & 1) === 1), hIn: hole(56), hOut: hole(84), tmp: Dev_canvas(RW, 352) };
  return _darkCanvases;
}
function drawDarkness(c, hx, hy) {
  const D = darkCanvases();
  const t = D.tmp.getContext("2d");
  for (const [layer, hole] of [[D.a, D.hIn], [D.b, D.hOut]]) {
    t.clearRect(0, 0, RW, 352);
    t.drawImage(layer, 0, 0);
    t.globalCompositeOperation = "destination-out";
    t.drawImage(hole, Math.round(hx - hole.width / 2), Math.round(hy - hole.height / 2));
    t.globalCompositeOperation = "source-over";
    c.drawImage(D.tmp, 0, RHUD);
  }
}

// ---------- drawing ----------
function drawWater(c, oxs, oys) {
  const wf = WATER_FRAMES[(G.frame >> 4) & 3];
  for (let y = 0; y < 352; y += WATER_TILE.h) for (let x = 0; x < RW; x += WATER_TILE.w) c.drawImage(wf, x + oxs, RHUD + y + oys);
}

// Legacy (16px) sprites are drawn at 2x until the new character art replaces them.
function withLegacy(c, fn) {
  c.save();
  c.setTransform(SC, 0, 0, SC, 0, RHUD);
  c.imageSmoothingEnabled = false;
  fn();
  c.restore();
}

function drawPropAt(c, p, oxs, oys) {
  const s = getProp(p.kind, p.v);
  c.drawImage(s.canvas, Math.round(p.x - s.ax) + oxs, Math.round(p.y - s.ay) + RHUD + oys);
}

// Actors that stand on the ground, each with a sort key (screen px of its ground line).
function sceneActors(c) {
  const list = [];
  const shadows = [];
  if (!P.dead) {
    const cx = (P.x + 8) * SC, fy = (P.y + 15) * SC + RHUD;
    // the sword's arc trails the blade: always under the hero's sprite, so it never
    // covers the blade itself (drawn over it, the blade vanished into the arc)
    const hero = { key: (P.y + 15) * SC, box: [cx - 12, fy - 34, cx + 12, fy + 2], ref: P, tgt: { c } };
    hero.draw = () => { drawSwordArc(hero.tgt.c); hero.drawn = drawHero2(hero.tgt.c); };
    list.push(hero);
    if (!P.rafting) shadows.push([(P.x + 8) * SC + 2, (P.y + 15) * SC, 9, 4]);
  }
  for (const e of G.enemies) {
    if (e.dead) continue;
    const foot = foeFootY(e);
    const cx = (e.x + 8) * SC, fy = foot * SC + RHUD - (e.fly ? 16 : 0);
    const it = { key: foot * SC, box: e.boss ? null : [cx - 14, fy - 30, cx + 14, fy + 2], ref: e, tgt: { c } };
    it.draw = () => { e._drawn = null; if (!drawFoe2(it.tgt.c, e)) withLegacy(it.tgt.c, () => drawEnemy(it.tgt.c, e)); it.drawn = e._drawn; };
    list.push(it);
    // the worm's spine: a joint halfway along its path to the piece in front, drawn
    // under both pieces
    if (e.kind === "worm_seg" && e.spawnT <= 0 && e.shared && e.shared.trail) {
      const p = e.shared.trail[e.segIndex * 14 - 7];
      const prev = G.enemies.find(o => !o.dead && o.shared === e.shared && o.segIndex === e.segIndex - 1);
      if (p && prev && prev.spawnT <= 0) {
        const lf = p[1] + (e.h || 12) + 2, lx = (p[0] + (e.w || 12) / 2 + 2) * SC;
        list.push({ key: Math.min(foot, foeFootY(prev)) * SC - 1, draw: () => blitFrame(c, charFrame("foe|wormlink", () => renderFit(wormLinkPrims(), false)), lx, lf * SC + RHUD) });
        shadows.push([lx + 2, lf * SC, 8, 3]);
      }
    }
    // (the frost head grows out of the wall: no shadow on the floor)
    if (e.spawnT <= 0 && !(e.kind === "maw" && e.state === "buried") && e.kind !== "boss_frostmaw") {
      const w = (e.w || 12) + 4;
      // the scorpion lies flat, legs spread: its shadow spreads under the whole body
      if (e.kind === "boss_dunescale" && e.state !== "burrow") shadows.push([(e.x + w / 2) * SC + 6, foot * SC + 2, 42, 22]);
      // the big bodies get shadows sized to their footprints; Vex floats, so his is small
      // and sits below him, and none while he is only a shimmer
      else if (e.kind === "boss_wyrm") shadows.push([(e.x + w / 2) * SC + 2, foot * SC + 12, 22, 6]);
      else if (e.kind === "boss_emberhulk") shadows.push([(e.x + w / 2) * SC + 2, foot * SC + 8, 24, 5]);
      else if (e.kind === "boss_vex") { if (!(e.cloak > 0 && (e.anim & 2))) shadows.push([(e.x + w / 2) * SC + 2, foot * SC + 24, 12, 3]); }
      else if (e.kind === "shellback") shadows.push([(e.x + w / 2) * SC + 2, foot * SC + 6, 13, 4]);
      else shadows.push([(e.x + w / 2) * SC + 2, foot * SC, Math.round(w * 0.7), 4]);
    }
  }
  for (const k of G.pickups) {
    if (k.dead || (k.wait && k.t < k.wait)) continue;
    list.push({ key: (k.y + 12) * SC, draw: () => { if (!drawPickup2(c, k)) withLegacy(c, () => drawPickup(c, k)); } });
    // (floor treasures stand at k.x+8 on k.y+14; a drop hovers at k.x+6: the shadow falls
    // below and to the right of each, like every other shadow)
    shadows.push(k.floor ? [(k.x + 8) * SC + 2, (k.y + 14) * SC, 7, 2] : [(k.x + 6) * SC + 2, (k.y + 12) * SC + 1, 6, 2]);
  }
  return { list, shadows };
}

function drawSceneFrame(c, scene, opts) {
  opts = opts || {};
  const oxs = opts.ox || 0, oys = opts.oy || 0;
  // (a switch pressed or let go is repainted into the baked floor first)
  if (opts.actors && scene.switches && scene.switches.length && G.area === "dungeon") updateSwitchArt(scene, G.tiles, false);
  if (scene.hasWater) drawWater(c, oxs, oys);
  else { c.fillStyle = STYLE.ramps.ink[0]; c.fillRect(oxs, RHUD + oys, RW, 352); }
  c.drawImage(scene.base, oxs, RHUD + oys);
  // live terrain: lava shimmer and bubbles, pool foam (terrain.js)
  if (scene.terrain && scene.terrain.anim) drawTerrainAnim(c, scene.terrain.anim, oxs, RHUD + oys, G.frame);
  // the glow of a torch the candle has lit, on the wall round it (under whoever passes); it
  // comes with the first small flame, not with the spark before it
  const litAt = scene.dark && opts.actors ? darkRoomLitAt(scene) : -1;
  if (litAt >= 0 && scene.torches) scene.torches.forEach((t, i) => {
    if (!t.lit && t.glow && G.frame - litAt >= torchIgniteAt(i) + TORCH_SPARK_TICKS) c.drawImage(t.glow.canvas, t.glow.x + oxs, t.glow.y + RHUD + oys);
  });
  // doors caught opening or closing (only while playing: never in a snapshot or a scroll)
  if (opts.actors) DoorAnim.draw(c, scene, oxs, oys);
  const list = [];
  let shadows = [];
  if (opts.actors) {
    const a = sceneActors(c);
    list.push(...a.list);
    shadows = a.shadows;
  }
  // movable pieces: where they stand now while playing, where they started in a snapshot
  const pieces = scene.kind === "room" ? (opts.actors && G.area === "dungeon" ? roomPiecesOf(G.tiles) : (scene.pieces || [])) : [];
  for (const p of pieces) { const s = propShadow(p); if (s) shadows.push([s.x, s.v, s.rx, s.rv]); }
  for (const sh of shadows) sceneDynShadow(c, scene.shade, sh[0], sh[1], sh[2], sh[3]);
  for (const p of scene.props.concat(pieces)) {
    const s = getProp(p.kind, p.v);
    list.push({ key: p.key, occ: { img: s.canvas, x: Math.round(p.x - s.ax) + oxs, y: Math.round(p.y - s.ay) + RHUD + oys } });
  }
  // a cliff's strip sorts at the middle of its own row: behind whatever stands south of
  // it, in front of what stands north, and under trees or props planted in the same row
  for (const s of scene.terrain.strips) list.push({ key: s.row * TT + 16, occ: { img: s.canvas, x: s.x + oxs, y: s.y + RHUD + oys } });
  if (opts.extra) list.push(...opts.extra);
  list.sort((a, b) => a.key - b.key);
  // An actor mostly hidden behind something tall (a canopy, a cliff top) shows through
  // it whole, as a ghost: its outline and every other pixel, over everything. One only
  // a little hidden (feet behind a ledge) is simply hidden there. How much was hidden is
  // measured on the pixels as drawn, and decides the next frame (with a little
  // hysteresis so it doesn't flicker on the edge).
  const seen = [];
  for (const it of list) {
    if (it.occ) {
      const o = it.occ;
      c.drawImage(o.img, o.x, o.y);
      for (const s of seen) {
        const b = s.box;
        if (b[0] < o.x + o.img.width && b[2] > o.x && b[1] < o.y + o.img.height && b[3] > o.y) (s.occs || (s.occs = [])).push(o);
      }
    } else {
      if (it.ref && it.ref._veil) { it.tgt.c = veilCtx(); it.draw(); it.tgt.c = c; it.veiled = true; }
      else it.draw();
      if (it.box) seen.push(it);
    }
  }
  for (const s of seen) {
    if (!s.drawn) continue;
    const r = s.occs ? hiddenShare(s.drawn, s.occs) : 0;
    if (s.veiled || (r > 0.3 && s.ref && !s.ref._veil)) drawGhost(c, s.drawn);
    if (s.ref) s.ref._veil = s.ref._veil ? r > 0.18 : r > 0.3;
  }
  // wall torches (animated flames), braziers' fire; each flame's frame is offset by where it
  // stands, so no two flicker together
  if (scene.torches) {
    scene.torches.forEach((t, i) => {
      const ph = ((G.frame >> 3) + (t.x >> 5)) & 3, fl = FLAMES[ph];
      if (t.bowl) {
        // fire in a gatehouse bowl (the bowl is part of the wall; clipped at the rim's top edge);
        // against a wall of the flame's own colours it burns inside a dark rim
        const f2 = t.rim ? rimFlames()[ph] : fl, r = t.rim ? 1 : 0;
        const fy = t.y - f2.height + 3 + r, cut = Math.max(0, -fy);
        if (t.lit) c.drawImage(f2, 0, cut, f2.width, f2.height - cut, t.x - 5 - r + oxs, fy + cut + RHUD + oys, f2.width, f2.height - cut);
        return;
      }
      // an unlit torch in a dark room catches fire once the candle lights the room, the left
      // one first: a spark, a small flame, then the full flame
      let lit = t.lit, ign = -1;
      if (!lit && litAt >= 0) { const k = G.frame - litAt - torchIgniteAt(i); if (k >= 0) { lit = true; ign = k; } }
      const br = lit ? TORCH_BRACKET.lit : TORCH_BRACKET.unlit;
      c.drawImage(br.canvas, t.x - TORCH_BRACKET.ax + oxs, TORCH_Y.plate - TORCH_BRACKET.ay + RHUD + oys);
      if (lit) {
        const f = ign >= 0 && ign < TORCH_SPARK_TICKS ? FLAME_IGNITE[0] : ign >= TORCH_SPARK_TICKS && ign < 8 ? FLAME_IGNITE[1] : fl;
        c.drawImage(f, t.x - 5 + oxs, TORCH_Y.cup - 15 + RHUD + oys);
      }
    });
  }
  if (scene.braziers) {
    for (const b of scene.braziers) c.drawImage(FLAMES[((G.frame >> 3) + (b.x >> 4)) & 3], b.x - 5 + oxs, b.y - 24 + RHUD + oys);
  }
  if (opts.actors) {
    drawProjectiles2(c);
    drawEffects2(c);
  }
  if (scene.overlay) c.drawImage(scene.overlay, oxs, RHUD + oys);
  if (opts.actors && G.debugHit) drawHitboxes(c);
}

// A dark room lit by the candle: the tick its light was first seen (-1 while it is dark).
// Its torches catch fire one after another, 8 ticks apart.
let _litRoom = null;
function darkRoomLitAt(scene) {
  if (!G.roomLit) { _litRoom = null; return -1; }
  if (!_litRoom || _litRoom.scene !== scene) _litRoom = { scene, at: G.frame };
  return _litRoom.at;
}
function torchIgniteAt(i) { return 8 * (i + 1); }
// ticks a torch shows only its spark before the first small flame (and its glow) appear
const TORCH_SPARK_TICKS = 3;

// The torch flames with a 1 px ink rim (built once from FLAMES).
let _rimFlames = null;
function rimFlames() {
  if (_rimFlames) return _rimFlames;
  const ink = inkU32();
  _rimFlames = FLAMES.map(f => {
    const w = f.width, h = f.height, src = new Uint32Array(f.getContext("2d").getImageData(0, 0, w, h).data.buffer);
    const p = new Pix(w + 2, h + 2), on = (x, y) => x >= 0 && y >= 0 && x < w && y < h && (src[y * w + x] >>> 24) === 255;
    for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
      if (on(x, y)) p.d[(y + 1) * p.w + x + 1] = src[y * w + x];
      else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) p.d[(y + 1) * p.w + x + 1] = ink;
    }
    return p.toCanvas();
  });
  return _rimFlames;
}

// A throwaway target for an actor that is drawn only as its ghost this frame.
let _veilCtx = null;
function veilCtx() { if (!_veilCtx) { const k = document.createElement("canvas"); k.width = k.height = 1; _veilCtx = k.getContext("2d"); } return _veilCtx; }
// Opaque-pixel mask of a canvas (cached; sprites and scene pieces never change).
const _alphaCache = new WeakMap();
function alphaOf(img) {
  let a = _alphaCache.get(img);
  if (!a) {
    const d = img.getContext("2d").getImageData(0, 0, img.width, img.height).data;
    a = new Uint8Array(img.width * img.height);
    let n = 0;
    for (let i = 0; i < a.length; i++) if (d[i * 4 + 3]) { a[i] = 1; n++; }
    a.count = n;
    _alphaCache.set(img, a);
  }
  return a;
}
// Share of an actor's drawn pixels covered by the pieces drawn over it.
function hiddenShare(drawn, occs) {
  const A = alphaOf(drawn.img), w = drawn.img.width, h = drawn.img.height;
  if (!A.count) return 0;
  const hit = new Uint8Array(w * h);
  let n = 0;
  for (const o of occs) {
    const B = alphaOf(o.img), ow = o.img.width;
    const x0 = Math.max(drawn.x, o.x), x1 = Math.min(drawn.x + w, o.x + ow);
    const y0 = Math.max(drawn.y, o.y), y1 = Math.min(drawn.y + h, o.y + o.img.height);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y - drawn.y) * w + (x - drawn.x);
      if (A[i] && !hit[i] && B[(y - o.y) * ow + (x - o.x)]) { hit[i] = 1; n++; }
    }
  }
  return n / A.count;
}

// Static snapshot of a scene (for screen-scroll transitions).
function sceneSnapshot(scene) {
  if (scene.snapshot) return scene.snapshot;
  const cvs = Dev_canvas(RW, RH);
  const g = cvs.getContext("2d");
  const saveFrame = G.frame;
  drawSceneFrame(g, scene, { actors: false });
  G.frame = saveFrame;
  scene.snapshot = Dev_canvas(RW, 352);
  scene.snapshot.getContext("2d").drawImage(cvs, 0, RHUD, RW, 352, 0, 0, RW, 352);
  return scene.snapshot;
}
