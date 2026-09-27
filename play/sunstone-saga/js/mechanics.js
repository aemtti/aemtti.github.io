"use strict";
// ---------- Dungeon devices of the later levels ----------
// Pits and lava, ice floors, floor switches, pots and heavy rocks you lift and throw,
// pegs for the earth hammer, and hook posts for the tether hook.

function feetTile() { return [Math.floor((P.x + 8) / TS), Math.floor((P.y + 12) / TS)]; }
function facingTile() {
  const cx = P.x + 8, cy = P.y + 12;
  return [Math.floor((cx + DX[P.dir] * 12) / TS), Math.floor((cy + DY[P.dir] * 10) / TS)];
}
function floorAt(tx, ty) {
  const f = G.tiles && G.tiles.floor;
  return f && ty >= 0 && ty < ROWS && tx >= 0 && tx < COLS ? f[ty][tx] : tileAt(G.tiles, tx, ty);
}
function setPiece(tx, ty, t) {
  const k = tx + "," + ty;
  if (t) G.roomPieces.set(k, t); else G.roomPieces.delete(k);
  G.tiles[ty][tx] = t || G.tiles.floor[ty][tx];
}

// ---------- motion the player doesn't steer: falling, being reeled in, sliding ----------
// Returns true when the normal update should be skipped this frame.
function mechUpdate() {
  if (P.fallT > 0) {
    P.fallT--;
    if (P.fallT === 0) {
      // back at the door you came in by, a little worse for wear
      addEffect("poof0", "poof1", P.x, P.y, 12);
      P.x = G.roomEntry ? G.roomEntry.x : 120; P.y = G.roomEntry ? G.roomEntry.y : PH - 26;
      Sound.sfx("respawn", { x: P.x + 8 });
      // the fall always costs health (once): lift any blink first, or damagePlayer
      // would shrug it off; it then grants the usual blink itself
      P.iframes = 0;
      damagePlayer(P.fallBurn ? 2 : 1, P.x + 8, P.y - 8);
      P.kbT = 0;
    }
    return true;
  }
  if (P.pull) {
    // the tether reels the hero straight to the post, over pits, water and lava
    const pl = P.pull, sp = 4;
    // a blow taken on the way still hurts and blinks, but stores no knockback: after he
    // lands it would throw him back into the gap he just crossed
    P.kbT = 0;
    const tx = pl.lx * TS, ty = pl.ly * TS;
    const dx = tx - P.x, dy = ty - P.y, d = Math.hypot(dx, dy);
    if (d <= sp) { P.x = tx; P.y = ty; P.pull = null; G.hookActive = false; }
    else { P.x += dx / d * sp; P.y += dy / d * sp; }
    return true;
  }
  if (P.slide !== undefined && P.slide !== null) {
    const nx = P.x + DX[P.slide] * 2, ny = P.y + DY[P.slide] * 2;
    if (terrainBlocked(nx, ny)) { P.slide = null; return false; }
    P.x = nx; P.y = ny; P.moving = false;
    const [fx, fy] = feetTile();
    if (floorAt(fx, fy) !== T_DICE) P.slide = null;
    return true;
  }
  return false;
}

// After walking: what the floor under the hero does to him.
function checkFloorUnderfoot() {
  if (G.area !== "dungeon" || P.pull || P.fallT > 0) return;
  const [fx, fy] = feetTile();
  const f = floorAt(fx, fy);
  if (f === T_DPIT || f === T_DLAVA) {
    P.fallT = 26; P.fallBurn = f === T_DLAVA; P.fallTile = [fx, fy];
    P.carry = null;
    // (lava: a splash and steam, not the hurt, which comes with the burn at the door)
    Sound.sfx(f === T_DLAVA ? "lava" : "fall", { x: P.x + 8 });
    return;
  }
  if (f === T_DICE && P.moving && P.slide == null) P.slide = P.dir;
}

// ---------- floor switches ----------
// Every switch weighed down by a block opens the room's shutters for good. (The hero's
// own foot doesn't count: standing on a switch would skip the block puzzle.)
function updateSwitches() {
  if (G.area !== "dungeon" || !G.tiles.floor) return;
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  if (!room.switches) return;
  const fl = solvedFlag(G.dungeon, G.rx, G.ry);
  if (G.flags[fl]) return;
  let all = true, any = false, down = 0;
  for (let ty = 2; ty <= 8; ty++) for (let tx = 2; tx <= 13; tx++) {
    if (G.tiles.floor[ty][tx] !== T_DSWITCH) continue;
    any = true;
    if (G.tiles[ty][tx] === T_DSWITCH) all = false; else down++;
  }
  // each plate clicks as a block weighs it down or leaves it (counted per room)
  const rk = G.dungeon + ":" + G.rx + "," + G.ry, was = G.switchesDown;
  if (was && was.rk === rk && down !== was.n) Sound.sfx(down > was.n ? "switch_down" : "switch_up");
  G.switchesDown = { rk, n: down };
  if (any && all) {
    G.flags[fl] = 1;
    let opened = false;
    for (let d2 = 0; d2 < 4; d2++) if (G.shut[d2]) { G.shut[d2] = false; opened = true; }
    // the room's puzzle is solved (its shutters rise)
    Sound.sfx("solved");
    if (opened) { Sound.sfx("shutter_open"); rebuildRoomTiles(); }
  }
}

// ---------- crystal eyes ----------
// An arrow or the boomerang striking a sleeping eye wakes it for good. With every eye
// in the room awake, the room is solved like a switch room: its shutters open, and an
// item the eyes kept back appears. Returns true when (px, py) is on an eye at all, so
// the shot stops there.
function strikeEye(px, py) {
  if (G.area !== "dungeon" || !G.tiles || !G.tiles.floor) return false;
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  const t = tileAt(G.tiles, tx, ty);
  if (t === T_DEYEON) return true;
  if (t !== T_DEYE) return false;
  // (the floor grid changes too: the room's picture is drawn from it); each eye's chord
  // sits 2 semitones above the one woken before it
  const awake = G.tiles.floor.reduce((n, row) => n + row.filter(t => t === T_DEYEON).length, 0);
  G.tiles[ty][tx] = G.tiles.floor[ty][tx] = T_DEYEON;
  G.flags[eyeFlag(G.dungeon, G.rx, G.ry, tx, ty)] = 1;
  Sound.sfx("eye_wake", { x: tx * TS + 8, pitch: 2 * awake });
  addEffect("sparkle", "sparkle", tx * TS, ty * TS, 18);
  if (!G.tiles.floor.some(row => row.includes(T_DEYE))) eyesSolved();
  return true;
}
function eyesSolved() {
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  G.flags[solvedFlag(G.dungeon, G.rx, G.ry)] = 1;
  // the room's puzzle is solved (its shutters rise)
  Sound.sfx("solved");
  let opened = false;
  for (let d2 = 0; d2 < 4; d2++) if (G.shut[d2]) { G.shut[d2] = false; opened = true; }
  if (opened) { Sound.sfx("shutter_open"); rebuildRoomTiles(); }
  spawnRoomItem(room);
}

// ---------- blocks that slide (Sokoban rooms) ----------
function pushLayoutBlock(tx, ty, dir) {
  let x = tx, y = ty, ice = false;
  // one tile, or on and on across ice
  for (let n = 0; n < 12; n++) {
    const nx = x + DX[dir], ny = y + DY[dir];
    if (nx < 2 || nx > 13 || ny < 2 || ny > 8) break;
    const t = G.tiles[ny][nx];
    if (t !== T_DFLOOR && t !== T_DSWITCH && t !== T_DICE) break;
    // (a foe on the ground there stops the block: it would be shut inside the stone)
    if (G.enemies.some(e => !e.dead && !e.fly && rectsOverlap(e.x + 2, e.y + 2, e.w || 12, e.h || 12, nx * TS, ny * TS, TS, TS))) break;
    x = nx; y = ny;
    if (floorAt(x, y) !== T_DICE) break;
    ice = true;
  }
  if (x === tx && y === ty) return false;
  setPiece(tx, ty, 0); setPiece(x, y, T_DBLOCK);
  // (stone dragging a tile, or a long glide across the ice)
  Sound.sfx(ice ? "block_slide_ice" : "push", { x: tx * TS + 8 });
  return true;
}

// ---------- lifting and throwing ----------
// A (sword button) facing a pot lifts it; heavy rocks need the power glove.
// With something held, A throws it. Returns true when the press was used.
function tryLiftOrThrow() {
  if (P.carry) {
    const k = P.carry;
    P.carry = null;
    spawnProj({ type: "thrown", kind: k, x: P.x + 8, y: P.y + 4, vx: DX[P.dir] * 3, vy: DY[P.dir] * 3, dist: 0, range: 72, dmg: k === "hrock" ? 4 : 2, life: 60 });
    Sound.sfx("throw", { x: P.x + 8 });
    P.state = "item"; P.itemT = 8;
    return true;
  }
  if (G.area !== "dungeon" && G.area !== "overworld") return false;
  const [tx, ty] = facingTile();
  const t = tileAt(G.tiles, tx, ty);
  if (t !== T_DPOT && !(t === T_DROCK && G.inv.glove)) return false;
  // out in the open a lifted boulder leaves bare ground (it is back next visit)
  if (G.area === "overworld") G.tiles[ty][tx] = T_GROUND;
  else setPiece(tx, ty, 0);
  P.carry = t === T_DPOT ? "pot" : "hrock";
  Sound.sfx(t === T_DPOT ? "lift_pot" : "lift_rock", { x: tx * TS + 8 });
  if (G.area !== "dungeon") { P.state = "item"; P.itemT = 10; return true; }
  // some pots hide things
  const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
  const hid = room.potItems && room.potItems[tx + "," + ty];
  if (hid) {
    const fl = "d" + G.dungeon + ":pot:" + G.rx + "," + G.ry + ":" + tx + "," + ty;
    // small drops (heart, gems, bombs) are pickups; a key lies on the floor until taken
    // (a drop fades after a while); anything else is a treasure that grantItem hands over
    if (!G.flags[fl]) {
      if (hid === "key") spawnPickup("key", tx * TS, ty * TS, { flag: fl, floor: true });
      else if (PICKUP_KINDS.has(hid)) spawnPickup(hid, tx * TS + 2, ty * TS + 2, {});
      else spawnPickup("item", tx * TS, ty * TS, { floor: true, item: hid });
    }
    if (hid !== "key") G.flags[fl] = 1;
  }
  P.state = "item"; P.itemT = 10;
  return true;
}

// Thrown pot/rock in flight; returns nothing (kills the projectile when it lands).
function updateThrown(p) {
  p.x += p.vx; p.y += p.vy; p.dist += Math.hypot(p.vx, p.vy);
  let land = p.dist >= p.range;
  if (!land && solidAtPx(p.x, p.y)) land = true;
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    if (rectsOverlap(p.x - 5, p.y - 5, 10, 10, e.x + 2, e.y + 2, e.w || 12, e.h || 12)) {
      if (e.boss && e.onThrown) e.onThrown(e, p);
      else damageEnemy(e, p.dmg, Math.abs(p.vx) > Math.abs(p.vy) ? (p.vx > 0 ? RIGHT : LEFT) : (p.vy > 0 ? DOWN : UP), "thrown");
      land = true;
      break;
    }
  }
  if (land) {
    p.dead = true;
    addEffect("poof0", "poof1", p.x - 8, p.y - 8, 12);
    // (a pot breaks; a heavy rock thuds down)
    Sound.sfx(p.kind === "hrock" ? "rock_land" : "shatter", { x: p.x });
  }
}

// ---------- the earth hammer ----------
function useHammer() {
  if (!G.inv.hammer) return;
  P.state = "item"; P.itemT = 14; P.hammerT = 1;
  Sound.sfx("hammer_swing", { x: P.x + 8 });
}
// The blow lands halfway through the swing.
function hammerImpact() {
  const [tx, ty] = facingTile();
  const t = tileAt(G.tiles, tx, ty);
  if (G.area === "dungeon" && t === T_DPEG) {
    setPiece(tx, ty, 0);
    G.flags[pieceFlag(G.dungeon, G.rx, G.ry, tx, ty)] = 1;
    G.shake = 6;
    Sound.sfx("hammer");
    addEffect("spark", "spark", tx * TS, ty * TS, 9);
  }
  // it lands on whatever stands in front
  const hx = P.x + 8 + DX[P.dir] * 14, hy = P.y + 10 + DY[P.dir] * 14;
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    if (rectsOverlap(hx - 8, hy - 8, 16, 16, e.x + 2, e.y + 2, e.w || 12, e.h || 12)) {
      if (e.boss && e.onHammer) e.onHammer(e);
      else if (e.shell && !e.flipped) { e.flipped = 180; Sound.sfx("hammer_shell", { x: foeX(e) }); }
      else damageEnemy(e, 2, P.dir, "hammer");
      addEffect("spark", "spark", hx - 8, hy - 8, 9);
      G.hitStop = 4;
    }
  }
}

// ---------- the tether hook ----------
function useHook() {
  if (!G.inv.hook || G.hookActive) return;
  G.hookActive = true;
  spawnProj({ type: "hook", x: P.x + 8, y: P.y + 8, dir: P.dir, vx: DX[P.dir] * 4.5, vy: DY[P.dir] * 4.5, dist: 0, range: 104, phase: "out", life: 400 });
  Sound.sfx("hook");
  P.state = "item"; P.itemT = 6;
}
function updateHook(p) {
  if (p.phase === "out") {
    p.x += p.vx; p.y += p.vy; p.dist += 4.5;
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    const t = tileAt(G.tiles, tx, ty);
    if (t === T_DPOST) {
      // bite: reel the hero across to the post (the reel's ratchet: main.js updateSoundLoops)
      p.dead = true;
      Sound.sfx("hook_bite", { x: p.x });
      const land = hookLanding(tx, ty, p.dir);
      if (land) { P.pull = { tx, ty, dir: p.dir, lx: land[0], ly: land[1] }; P.slide = null; }
      else G.hookActive = false;
      return;
    }
    for (const e of G.enemies) {
      if (e.dead || e.spawnT > 0) continue;
      if (rectsOverlap(p.x - 4, p.y - 4, 8, 8, e.x + 2, e.y + 2, e.w || 12, e.h || 12)) {
        if (e.boss && e.onHook) e.onHook(e);
        else if (e.frail) damageEnemy(e, 1, p.dir, "hook");
        else if (!e.boss && e.kind !== "spiketrap") { e.stunT = 90; Sound.sfx("stun", { x: foeX(e) }); }
        p.phase = "back";
        break;
      }
    }
    for (const k of G.pickups) {
      if (!k.dead && !k.floor && rectsOverlap(p.x - 6, p.y - 6, 12, 12, k.x, k.y, 14, 14)) { p.grab = k; p.phase = "back"; }
    }
    if (p.dist >= p.range || (tileSolid(t) && t !== T_DPOST) || p.x < 0 || p.y < 0 || p.x > PW || p.y > PH) p.phase = "back";
  } else {
    // (the chain rattles back in and clinks home)
    if (!p.retract) { p.retract = true; Sound.sfx("hook_retract", { x: p.x }); }
    const hx = P.x + 8, hy = P.y + 8, d = Math.hypot(hx - p.x, hy - p.y);
    if (d < 8) { p.dead = true; G.hookActive = false; return; }
    p.x += (hx - p.x) / d * 6; p.y += (hy - p.y) / d * 6;
    if (p.grab) { p.grab.x = p.x - 7; p.grab.y = p.y - 7; }
  }
}
// Where a bite on the post at (tx, ty) sets the hero down: the tile just short of the
// post, or, when that is water, a pit, lava or a wall, the nearest firm tile back
// toward the hero. Null when there is none (then the hook lets go).
function hookLanding(tx, ty, dir) {
  const hx = Math.floor((P.x + 8) / TS), hy = Math.floor((P.y + 8) / TS);
  for (let k = 1; k <= COLS; k++) {
    const lx = tx - DX[dir] * k, ly = ty - DY[dir] * k;
    if (standableTile(tileAt(G.tiles, lx, ly))) return [lx, ly];
    // the hero's own tile is the last one to try
    if ((DX[dir] && lx === hx) || (DY[dir] && ly === hy)) break;
  }
  return null;
}
