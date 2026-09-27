"use strict";
// ---------- Player ----------
let P = null;

function initPlayer() {
  P = {
    x: OW_START.x, y: OW_START.y, dir: UP,
    anim: 0, moving: false, state: "idle",
    attackT: 0, itemT: 0, iframes: 0, kbT: 0, kbDir: DOWN,
    dead: false, laddering: null, rafting: null, dockLatch: false,
    pushT: 0, pushTX: -1, pushTY: -1,
  };
  return P;
}

function swordDmg() { return [0, 1, 2, 4][G.inv.sword] || 0; }

function terrainBlocked(nx, ny) {
  if (P.rafting) return false;
  for (const [ox, oy] of [[2, 8], [13, 8], [2, 15], [13, 15]]) {
    const tx = Math.floor((nx + ox) / TS), ty = Math.floor((ny + oy) / TS);
    if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) {
      // a dungeon room's walls run on past its edge: the tile across the edge is the edge
      // tile of the same column or row, so in a doorway at the very edge a side step
      // can't carry him along below (or beside) the wall
      if (G.area === "dungeon") {
        const te = G.tiles[clamp(ty, 0, ROWS - 1)][clamp(tx, 0, COLS - 1)];
        if (tileSolid(te) || tileWater(te)) return true;
        continue;
      }
      // the overworld is one continuous map, so the tile across the screen edge decides
      if (G.area !== "overworld") continue;
      const gx = G.sx * COLS + tx, gy = G.sy * ROWS + ty;
      if (gx < 0 || gy < 0 || gx >= WW || gy >= WH) return true;
      const tw = worldMap().T[gy * WW + gx];
      if (tileSolid(tw) || tileWater(tw)) return true;
      continue;
    }
    const t = G.tiles[ty][tx];
    if (P.laddering && P.laddering.tx === tx && P.laddering.ty === ty) continue;
    if (tileSolid(t) || tileWater(t)) return true;
  }
  // in a dungeon room he keeps HERO_WALL_GAP off the west and east walls
  if (G.area === "dungeon") for (const oy of [8, 15]) if (sideWallAt(nx + 2 - HERO_WALL_GAP, ny + oy) || sideWallAt(nx + 13 + HERO_WALL_GAP, ny + oy)) return true;
  return false;
}
// The hero's picture reaches a pixel or two past his feet box at the sides, so in a dungeon
// room he keeps 2 px off the west and east walls: he is never drawn on their faces. (A
// doorway is open floor, so the gap doesn't narrow it; the lattice lines by both walls,
// x 32 and 208, stay in reach, so the 8 px lattice never pulls him into a wall. Off the
// trim bricks altogether would need 6 px more, and then a block by the wall could no
// longer be pushed from beside it.)
const HERO_WALL_GAP = 2;
function sideWallAt(px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  return (tx < 2 || tx > 13) && tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS && tileSolid(G.tiles[ty][tx]);
}

function updatePlayer() {
  if (P.dead) return;
  P.anim++;
  if (P.iframes > 0) P.iframes--;
  if (G.stepCooldown > 0) G.stepCooldown--;

  // rafting: auto-float across water
  if (P.rafting) { updateRaft(); return; }

  // holding up a new treasure: stand still until the fanfare ends (the world waits too,
  // so no knockback is stored up; the blink left from a hit before comes back after)
  if (P.holdT > 0) {
    P.holdT--; P.moving = false; P.kbT = 0;
    if (P.holdT === 0 && P.holdBlink > 0) { P.iframes = Math.max(P.iframes, P.holdBlink); P.holdBlink = 0; }
    return;
  }
  // falling into a pit, reeled in by the hook, sliding on ice
  if (mechUpdate()) return;

  // knockback
  if (P.kbT > 0) {
    P.kbT--;
    const nx = P.x + DX[P.kbDir] * 4, ny = P.y + DY[P.kbDir] * 4;
    if (!terrainBlocked(nx, ny) && nx > -2 && nx < PW - 14 && ny > -2 && ny < PH - 14) { P.x = nx; P.y = ny; }
    return;
  }

  // attacking
  if (P.state === "attack") {
    P.attackT--;
    if (P.attackT >= 3 && P.attackT <= 11) swordHits();
    if (P.attackT <= 0) P.state = "idle";
    return;
  }
  if (P.state === "item") {
    P.itemT--;
    if (P.hammerT && P.itemT === 7) hammerImpact();
    if (P.itemT <= 0) { P.state = "idle"; P.hammerT = 0; }
    return;
  }

  // A lifts what's in front, throws what's held, and otherwise swings the sword
  if (Input.pressed("a") && tryLiftOrThrow()) return;
  if (Input.pressed("a") && G.inv.sword > 0 && !P.carry) {
    P.state = "attack";
    P.attackT = 14;
    // (the iron blade rings dully, steel sings, the dawn blade shimmers)
    Sound.sfx(G.inv.sword >= 3 ? "slash3" : G.inv.sword === 2 ? "slash2" : "slash", { x: P.x + 8 });
    if (G.hp === G.maxhp && !G.beamActive) {
      G.beamActive = true;
      const bp = dirProj("beam", P.x + 8, P.y + 8, P.dir, 3.4, { dmg: swordDmg(), size: 8 });
      bp.onDead = () => { G.beamActive = false; };
      Sound.sfx("beam");
    }
    return;
  }
  // use B item
  if (Input.pressed("b")) { useBItem(); if (P.state === "item") return; }

  // movement (4-directional, 8px lattice snapping like the NES)
  const held = [];
  if (Input.held("up")) held.push(UP);
  if (Input.held("down")) held.push(DOWN);
  if (Input.held("left")) held.push(LEFT);
  if (Input.held("right")) held.push(RIGHT);
  P.moving = false;
  let dir = -1;
  if (held.length) {
    dir = held.includes(P.dir) && held.length > 1 ? P.dir : held[0];
    if (!held.includes(P.dir)) dir = held[0];
  }
  if (dir >= 0) walkPlayer(dir);
  else { P.pushT = 0; }
  checkFloorUnderfoot();

  // clear the temp ladder once we've crossed and fully left it (or walked away
  // without stepping on it: it only stays while the hero stands right beside it)
  if (P.laddering) {
    const lt = P.laddering;
    const overlaps = rectsOverlap(P.x + 2, P.y + 8, 12, 8, lt.tx * TS, lt.ty * TS, TS, TS);
    if (overlaps) lt.entered = true;
    else if (lt.entered || !rectsOverlap(P.x - 3, P.y + 2, 22, 20, lt.tx * TS, lt.ty * TS, TS, TS)) P.laddering = null;
  }

  // step-on triggers
  const ftx = Math.floor((P.x + 8) / TS), fty = Math.floor((P.y + 12) / TS);
  const ft = tileAt(G.tiles, ftx, fty);
  // a dock launches the raft once per visit: step off it before it launches again
  if (ft !== T_DOCK) P.dockLatch = false;
  if (G.stepCooldown <= 0) {
    if (ft === T_CAVE || ft === T_STAIRS || ft === T_HDOOR) enterAt(ftx, fty);
    else if (ft === T_DOCK && G.inv.raft && !P.dockLatch) launchRaft(ftx, fty);
  }
}

// ---------- the raft ----------
// A trip runs straight along a lane of open water, a tile at a time, and ends on the
// first firm tile it reaches. It only sets out along a lane that ends on another dock
// (a bare shore could be a patch with no way off), so knocked onto a dock facing the
// wrong way the hero still sails to the far dock. Tiles past the screen edge are read
// from the world map, so lanes run on from screen to screen.
function raftLaneOK(tx, ty, d) {
  for (let k = 1; k <= 3 * ROWS; k++) {
    const t = owTileAt(tx + DX[d] * k, ty + DY[d] * k);
    if (tileWater(t)) continue;
    return k > 1 && t === T_DOCK;
  }
  return false;
}
function launchRaft(tx, ty) {
  P.dockLatch = true;
  // the way the hero faces first, else any lane that reaches another dock
  for (const d of [P.dir, UP, DOWN, LEFT, RIGHT]) {
    if (!raftLaneOK(tx, ty, d)) continue;
    P.x = tx * TS; P.y = ty * TS; P.dir = d;
    P.rafting = { dir: d, moved: 0 };
    P.laddering = null;
    // (then the paddle, while he sails: main.js updateSoundLoops)
    Sound.sfx("raft_launch", { x: P.x + 8 });
    return true;
  }
  return false;
}
function updateRaft() {
  const r = P.rafting;
  P.moving = false;
  // decide only when squarely on a tile of this screen
  if (P.x % TS === 0 && P.y % TS === 0) {
    const tx = P.x / TS, ty = P.y / TS;
    if (tx >= 0 && tx < COLS && ty >= 0 && ty < ROWS) {
      if (r.moved > 0 && standableTile(G.tiles[ty][tx])) {
        // ashore: a dock here stays quiet until the hero steps off it
        P.rafting = null; P.kbT = 0; P.dockLatch = true;
        return;
      }
      const ahead = owTileAt(tx + DX[r.dir], ty + DY[r.dir]);
      if (!tileWater(ahead) && !standableTile(ahead)) { r.dir = OPP[r.dir]; P.dir = r.dir; }
    }
  }
  P.x += DX[r.dir]; P.y += DY[r.dir];
  r.moved++;
}

function walkPlayer(dir) {
  P.dir = dir;
  P.moving = true;
  const sp = 1.5;
  // snap to 8px lattice on the perpendicular axis first (corner assist)
  if (dir === LEFT || dir === RIGHT) {
    const align = Math.round(P.y / 8) * 8;
    if (Math.abs(P.y - align) > 0.01) { moveAxis(0, clamp(align - P.y, -sp, sp), dir); return; }
  } else {
    const align = Math.round(P.x / 8) * 8;
    if (Math.abs(P.x - align) > 0.01) { moveAxis(clamp(align - P.x, -sp, sp), 0, dir); return; }
  }
  moveAxis(DX[dir] * sp, DY[dir] * sp, dir);
}

function moveAxis(dx, dy, dir) {
  const nx = P.x + dx, ny = P.y + dy;
  if (!terrainBlocked(nx, ny)) {
    P.x = nx; P.y = ny;
    P.pushT = 0;
    return;
  }
  handleBump(dir);
}

function handleBump(dir) {
  const cx = P.x + 8, cy = P.y + 12;
  const ftx = Math.floor((cx + DX[dir] * 10) / TS), fty = Math.floor((cy + DY[dir] * 9) / TS);
  const t = tileAt(G.tiles, ftx, fty);

  // ladder: cross one tile of water
  if (tileWater(t) && G.inv.ladder && !P.laddering) {
    const bx = ftx + DX[dir], by = fty + DY[dir];
    const beyond = tileAt(G.tiles, bx, by);
    if (standableTile(beyond)) {
      P.laddering = { tx: ftx, ty: fty };
      Sound.sfx("ladder_place", { x: ftx * TS + 8 });
      return;
    }
  }
  // sealed gate of the Shadow Keep
  if (t === T_GATE) { gateBump(); return; }

  // locked dungeon doors
  if (G.area === "dungeon" && t === T_DWALL) { tryUnlockDoor(ftx, fty, dir); }

  // pushing (graves hiding stairs, dungeon blocks)
  if (isPushable(ftx, fty)) {
    if (P.pushTX === ftx && P.pushTY === fty) {
      P.pushT++;
      if (P.pushT > 20) { doPush(ftx, fty, dir); P.pushT = 0; }
    } else {
      P.pushTX = ftx; P.pushTY = fty; P.pushT = 1;
    }
  } else {
    P.pushT = 0;
  }
}

function isPushable(tx, ty) {
  if (G.area === "overworld") {
    if (!G.screen || !G.screen.secrets) return false;
    for (const s of G.screen.secrets) if (s.kind === "push" && s.x === tx && s.y === ty) return true;
    return false;
  }
  if (G.area === "dungeon") {
    const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
    if (room && room.push && G.pushState && !G.pushState.done && room.push.x === tx && room.push.y === ty) return true;
    // every block in a hand-drawn room slides
    if (room && room.layout && tileAt(G.tiles, tx, ty) === T_DBLOCK) return true;
  }
  return false;
}

function doPush(tx, ty, dir) {
  if (G.area === "overworld") {
    Sound.sfx("push");
    for (const s of G.screen.secrets) {
      if (s.kind === "push" && s.x === tx && s.y === ty) { revealSecret(s); return; }
    }
    return;
  }
  // (a hand-drawn room's block sounds as it slides: stone, or a long glide over ice)
  const lroom = getDungeonRoom(G.dungeon, G.rx, G.ry);
  if (lroom && lroom.layout) { pushLayoutBlock(tx, ty, dir); return; }
  Sound.sfx("push");
  // dungeon block
  const dx = tx + DX[dir], dy = ty + DY[dir];
  if (dx >= 2 && dx <= 13 && dy >= 2 && dy <= 8 && walkableTile(tileAt(G.tiles, dx, dy))) {
    G.pushState = { done: true, x: dx, y: dy };
    G.roomPieces.delete(tx + "," + ty); G.roomPieces.set(dx + "," + dy, T_DBLOCK);
    const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
    const wasShut = Object.values(G.shut).some(v => v);
    G.shut = computeShut(room, G.pushState);
    // the room's puzzle is solved (its shutters rise)
    Sound.sfx("solved");
    if (wasShut && !Object.values(G.shut).some(v => v)) Sound.sfx("shutter_open");
    rebuildRoomTiles();
  }
}

// ---------- Sword ----------
// Measured from the drawn blade at full reach (the sword hand is on the viewer's
// side when facing right and on the far side when facing left).
// Where the blade is while it can hit. Mid-swing (the first frames) it cuts across
// the diagonal between the sword hand's side and the front; then it reaches straight
// ahead. Facing away the thrust comes from the hand beside the head, right of centre.
function swordRect() {
  if (P.state === "attack" && P.attackT >= 9) {
    switch (P.dir) {
      case UP: return [P.x + 11, P.y - 2, 8, 10];
      case DOWN: return [P.x - 3, P.y + 11, 8, 8];
      case LEFT: return [P.x - 5, P.y + 2, 9, 8];
      default: return [P.x + 11, P.y + 11, 9, 7];
    }
  }
  switch (P.dir) {
    case UP: return [P.x + 8, P.y - 8, 6, 13];
    case DOWN: return [P.x + 4, P.y + 12, 6, 14];
    case LEFT: return [P.x - 10, P.y + 6, 13, 6];
    default: return [P.x + 13, P.y + 8, 13, 6];
  }
}
function swordHits() {
  const [sx, sy, sw, sh] = swordRect();
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    const ex = e.x + 2, ey = e.y + 2, ew = e.w || 12, eh = e.h || 12;
    if (rectsOverlap(sx, sy, sw, sh, ex, ey, ew, eh)) {
      const r = damageEnemy(e, swordDmg(), P.dir, "sword");
      if (r) {
        // a spark where blade meets body, and a few frames' pause so the blow lands
        const cx = (Math.max(sx, ex) + Math.min(sx + sw, ex + ew)) / 2, cy = (Math.max(sy, ey) + Math.min(sy + sh, ey + eh)) / 2;
        addEffect("spark", "spark", cx - 8, cy - 8, 9);
        G.hitStop = r === "immune" ? 2 : 4;
      }
    }
  }
}

// ---------- B items ----------
// Where a bomb is set down: 18 px ahead of him, but not inside anything solid (a wall, a
// cliff, a tree, a block): then as far ahead as its base (5 px below its middle) finds open
// ground, at worst 4 px ahead. While he is in a room (not in a doorway) it also sits
// wholly on its floor, clear of the wall faces (at the wall's foot, on the trim, is where
// it goes to crack a wall). Returns [x, y, aim x, aim y]: what it cracks is judged from the
// aim (explode), so it cracks just what it always did.
function bombSpot() {
  const at = (k) => [P.x + 8 + DX[P.dir] * k, P.y + 10 + DY[P.dir] * k];
  const solidBase = (k) => { const [x, y] = at(k); return tileSolid(tileAt(G.tiles, Math.floor(x / TS), Math.floor((y + 5) / TS))); };
  let k = 18;
  while (k > 4 && solidBase(k)) k -= 2;
  let [x, y] = at(k);
  const fx = Math.floor((P.x + 8) / TS), fy = Math.floor((P.y + 12) / TS);
  if (G.area === "dungeon" && fx >= 2 && fx <= 13 && fy >= 2 && fy <= 8) { x = clamp(x, 36, 220); y = clamp(y, 34, 138); }
  return [x, y].concat(at(18));
}
function useBItem() {
  if (P.carry) return;
  switch (G.bItem) {
    case "hook": useHook(); break;
    case "hammer": useHammer(); break;
    case "boomerang":
      if (!G.inv.boomerang || G.boomerActive) return;
      G.boomerActive = true;
      spawnProj({ type: "boomerang", x: P.x + 8, y: P.y + 8, phase: "out", dist: 0, range: 88, vx: DX[P.dir] * 3.2, vy: DY[P.dir] * 3.2, lastDir: P.dir });
      Sound.sfx("boom_throw", { x: P.x + 8 });
      P.state = "item"; P.itemT = 8;
      break;
    // (with none to use: patting an empty bag, not the refusal)
    case "bomb":
      if (G.bombs <= 0) { Sound.sfx("empty"); return; }
      G.bombs--;
      { const [bx, by, ax, ay] = bombSpot(); spawnProj({ type: "bomb", x: bx, y: by, ax, ay, life: 100 }); }
      Sound.sfx("bomb_place", { x: P.x + 8 });
      P.state = "item"; P.itemT = 8;
      break;
    case "bow":
      if (!G.inv.bow) return;
      if (G.gems <= 0) { Sound.sfx("empty"); return; }
      G.gems--;
      dirProj("arrow", P.x + 8, P.y + 8, P.dir, 3.2, { dmg: 2, size: 8 });
      Sound.sfx("arrow", { x: P.x + 8 });
      P.state = "item"; P.itemT = 10;
      break;
    case "candle":
      if (!G.inv.candle || G.flameUsed) return;
      G.flameUsed = true;
      spawnProj({ type: "flame", x: P.x + 8 + DX[P.dir] * 10, y: P.y + 8 + DY[P.dir] * 10, vx: DX[P.dir] * 1, vy: DY[P.dir] * 1, travel: 18, life: 80 });
      // (it lights with a whoosh, then burns: main.js updateSoundLoops, flame_loop)
      Sound.sfx("flame", { x: P.x + 8 });
      P.state = "item"; P.itemT = 8;
      break;
    case "potion":
      if (!G.inv.potion) return;
      G.inv.potion = 0;
      G.hp = G.maxhp;
      Sound.sfx("potion_drink");
      break;
  }
}

// ---------- Damage / healing ----------
function damagePlayer(dmg, srcX, srcY) {
  if (P.iframes > 0 || P.dead) return;
  const ring = !!G.inv.ring;
  if (ring) dmg = Math.max(1, Math.ceil(dmg / 2));
  G.hp -= dmg;
  // (the ring softens the blow's sting; a heavy blow lands twice)
  Sound.sfx(ring ? "hurt_ring" : dmg >= 2 ? "hurt_heavy" : "hurt");
  P.iframes = 60;
  P.kbT = 8;
  P.kbDir = dirToward(srcX, srcY, P.x + 8, P.y + 8);
  if (G.hp <= 0) {
    G.hp = 0;
    P.dead = true;
    startDeath();
  }
}
function healPlayer(n) { G.hp = Math.min(G.maxhp, G.hp + n); }
// (the hero is drawn by chars.js drawHero2)
