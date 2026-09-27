"use strict";
// ---------- Projectiles, pickups, effects, drops, item grants ----------

function spawnProj(p) {
  // defaults
  p.dead = false;
  p.life = p.life !== undefined ? p.life : 999;
  G.projectiles.push(p);
  return p;
}

function projBox(p) {
  const s = p.size || 8;
  return [p.x - s / 2, p.y - s / 2, s, s];
}

// Fire a projectile in a cardinal direction.
function dirProj(type, x, y, dir, speed, opts) {
  return spawnProj(Object.assign({
    type, x, y, dir, vx: DX[dir] * speed, vy: DY[dir] * speed,
  }, opts || {}));
}

function updateProjectiles() {
  const tiles = G.tiles;
  for (const p of G.projectiles) {
    if (p.dead) continue;
    p.anim = (p.anim || 0) + 1;

    if (p.type === "bomb") {
      p.life--;
      // (its fuse fizzes meanwhile: main.js updateSoundLoops) a bright tick each time it
      // blinks back on in its last half second (the picture: chars.js, life & 4)
      if (p.life <= 30 && (p.life & 7) === 7) Sound.sfx("bomb_tick", { x: p.x });
      if (p.life <= 0) { p.dead = true; explode(p.x, p.y, p.ax, p.ay); }
      continue;
    }
    if (p.type === "flame") {
      if (p.travel > 0) { p.x += p.vx; p.y += p.vy; p.travel -= Math.abs(p.vx) + Math.abs(p.vy); }
      else {
        p.life--;
        if (!p.burnChecked) {
          p.burnChecked = true;
          burnAt(p.x, p.y + 4);
        }
        if (p.life <= 0) p.dead = true;
      }
      // flame damages enemies (once each)
      if (!p.hostile) hitEnemiesWithProj(p, 1);
      continue;
    }

    if (p.type === "hook") { updateHook(p); continue; }
    if (p.type === "thrown") { updateThrown(p); continue; }

    if (p.type === "boomerang") {
      // (it whirrs while it flies: main.js updateSoundLoops, boom_loop)
      if (p.phase === "out") {
        p.x += p.vx; p.y += p.vy; p.dist += Math.hypot(p.vx, p.vy);
        // a crystal eye wakes where the boomerang strikes it
        if (strikeEye(p.x, p.y) || p.dist >= p.range || solidAtPx(p.x, p.y)) p.phase = "back";
      } else {
        const tx = P.x + 8, ty = P.y + 8;
        const d = Math.hypot(tx - p.x, ty - p.y);
        if (d < 10) { p.dead = true; G.boomerActive = false; Sound.sfx("boom_catch", { x: tx }); continue; }
        p.x += (tx - p.x) / d * 3.2;
        p.y += (ty - p.y) / d * 3.2;
      }
      // stun / clip enemies, gather pickups
      for (const e of G.enemies) {
        if (e.dead || e.spawnT > 0) continue;
        if (rectsOverlap(p.x - 4, p.y - 4, 8, 8, e.x + 2, e.y + 2, e.w || 12, e.h || 12)) {
          if (!e.boss && e.kind !== "spiketrap") {
            if (e.frail) damageEnemy(e, 1, p.lastDir !== undefined ? p.lastDir : DOWN, "boomerang");
            else if (!e.stunT) { e.stunT = 90; Sound.sfx("stun", { x: foeX(e) }); }
          }
          if (p.phase === "out") p.phase = "back";
        }
      }
      for (const k of G.pickups) {
        if (!k.dead && !k.floor && rectsOverlap(p.x - 6, p.y - 6, 12, 12, k.x, k.y, 14, 14)) { k.x = p.x - 7; k.y = p.y - 7; }
      }
      continue;
    }

    // linear projectiles
    p.x += p.vx; p.y += p.vy;
    p.life--;
    if (p.life <= 0 || p.x < -8 || p.x > PW + 8 || p.y < -8 || p.y > PH + 8) { p.dead = true; continue; }
    // an arrow wakes a crystal eye (and stops in it)
    if (p.type === "arrow" && strikeEye(p.x, p.y)) { p.dead = true; continue; }
    if (p.type !== "magic" && p.type !== "fireball" && p.type !== "vexbolt" && solidAtPx(p.x, p.y)) {
      // (the beam breaks on the wall, an arrow sticks in it)
      if (p.type === "beam") { addEffect("poof0", "poof1", p.x - 8, p.y - 8, 12); Sound.sfx("beam_burst", { x: p.x }); }
      else if (p.type === "arrow") Sound.sfx("arrow_thunk", { x: p.x });
      p.dead = true; continue;
    }
    // spells and fire fly on over a room's blocks, statues and pots, but its outer wall
    // stops them with a puff (the graveyard hexer's bolt alone flies on, as it always has);
    // a spell breaks there with a small glassy burst, one for a volley's bolts arriving
    // together (at most one per 8 ticks; a fireball just puffs out)
    if (G.area === "dungeon" && stopsAtOuterWall(p) && deepInOuterWall(p)) {
      addEffect("poof0", "poof1", p.x - 8, p.y - 8, 10);
      if (p.type !== "fireball" && !(Math.abs(G.frame - (G.wallBurstF === undefined ? -99 : G.wallBurstF)) < 8)) { G.wallBurstF = G.frame; Sound.sfx("beam_burst", { x: p.x, gain: -6 }); }
      p.dead = true; continue;
    }

    if (p.hostile) {
      // vs player
      if (P.iframes <= 0 && !P.dead && rectsOverlap(p.x - 4, p.y - 4, 8, 8, P.x + 3, P.y + 4, 10, 10)) {
        if (projBlocked(p)) {
          Sound.sfx("shield");
          p.dead = true;
        } else {
          p.dead = true;
          damagePlayer(p.dmg || 1, p.x, p.y);
        }
      }
    } else {
      hitEnemiesWithProj(p, p.dmg || 1);
    }
  }
  G.projectiles = G.projectiles.filter(p => {
    if (p.dead && p.onDead) p.onDead();
    return !p.dead;
  });
}

// Shield logic: block small shots from the front while not attacking. The mirror shield
// (2) also turns spells; the sunforged shield (3) turns spells and fire as well.
function projBlocked(p) {
  if (P.state === "attack") return false;
  const blockableSmall = (p.type === "rock" || p.type === "seed" || p.type === "ice");
  const blockableMagic = (p.type === "magic") && G.inv.shield >= 2;
  const blockableFire = (p.type === "fireball") && G.inv.shield >= 3;
  if (!blockableSmall && !blockableMagic && !blockableFire) return false;
  const fromDir = Math.abs(p.vx) > Math.abs(p.vy) ? (p.vx > 0 ? LEFT : RIGHT) : (p.vy > 0 ? UP : DOWN);
  return P.dir === fromDir;
}

function hitEnemiesWithProj(p, dmg) {
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    if (rectsOverlap(p.x - 4, p.y - 4, 8, 8, e.x + 2, e.y + 2, e.w || 12, e.h || 12)) {
      const dir = Math.abs(p.vx) > Math.abs(p.vy) ? (p.vx > 0 ? RIGHT : LEFT) : (p.vy > 0 ? DOWN : UP);
      const hurt = damageEnemy(e, dmg, dir, p.type);
      if (p.type !== "flame") { if (hurt !== "immune") p.dead = true; }
      if (p.dead) break;
    }
  }
}

function solidAtPx(px, py) {
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  return tileSolid(tileAt(G.tiles, tx, ty));
}

// Wall-crossing shots that the room's outer wall stops: fire (imps, the Cinderwyrm, the
// Emberhulk), the Gazer's bolts and Vex's. Not the hexer's.
function stopsAtOuterWall(p) { return p.type === "fireball" || p.type === "vexbolt" || (p.type === "magic" && p.src === "gazer"); }
// Is shot p in the outer wall of a dungeon room with no way left to hit the hero, now or
// on any later frame of its straight flight (until it leaves the screen or runs out)?
// His body reaches 4 px above the ground his feet may stand on and a shot's box 4 px
// round its centre, so at every step all ground from 4 px left, right and above the shot
// to 8 px below it must be solid (an open doorway is not). A shot sinks 8 px into the
// north wall and 4 px into the others before it stops, and one sliding along the wall
// toward a doorway flies on: stopping shots only here takes away no hit, so every fight
// stays as hard as it was.
function deepInOuterWall(p) {
  const cx = Math.floor(p.x / TS), cy = Math.floor(p.y / TS);
  if (cx >= 2 && cx <= 13 && cy >= 2 && cy <= 8) return false;
  let x = p.x, y = p.y;
  for (let k = 0; k <= p.life; k++, x += p.vx, y += p.vy) {
    if (x < -8 || x > PW + 8 || y < -8 || y > PH + 8) break;
    for (const [ox, oy] of [[-4, -4], [4, -4], [-4, 8], [4, 8]]) {
      // (past the room's edge the hero can only be where he walks out of a doorway)
      const tx = clamp(Math.floor((x + ox) / TS), 0, COLS - 1), ty = clamp(Math.floor((y + oy) / TS), 0, ROWS - 1);
      if (!tileSolid(G.tiles[ty][tx])) return false;
    }
  }
  return true;
}

// ---------- Bombs & fire reveal secrets ----------
// (ax, ay): where the bomb was aimed, 18 px ahead of the hero. A bomb set against a wall or
// a cliff is drawn back onto open ground (bombSpot), but what it cracks is judged from the
// aim, so every wall and cliff cracks from just where it always did.
function explode(x, y, ax, ay) {
  if (ax === undefined) { ax = x; ay = y; }
  Sound.sfx("explosion");
  G.shake = 12;
  addEffect("boomexp0", "boomexp1", x - 8, y - 8, 24);
  addEffect("boomexp0", "boomexp1", x - 18, y - 4, 24);
  addEffect("boomexp0", "boomexp1", x + 2, y - 14, 24);
  // damage enemies
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    if (dist2(x, y, e.x + 8, e.y + 8) < 28 * 28) damageEnemy(e, 4, dirToward(x, y, e.x, e.y), "bomb");
  }
  if (G.area === "overworld") {
    // crack open hidden caves
    if (G.screen && G.screen.secrets) {
      for (const s of G.screen.secrets) {
        if (s.kind !== "bomb") continue;
        const cx = s.x * TS + 8, cy = s.y * TS + 8;
        if (dist2(ax, ay, cx, cy) < 30 * 30) revealSecret(s);
      }
    }
  } else if (G.area === "dungeon") {
    // bombable walls: door centers in play coords
    const centers = { [UP]: [128, 12], [DOWN]: [128, PH - 12], [LEFT]: [12, 88], [RIGHT]: [PW - 12, 88] };
    const room = getDungeonRoom(G.dungeon, G.rx, G.ry);
    for (let dir = 0; dir < 4; dir++) {
      if (doorTypeOf(room, dir) !== "bomb") continue;
      const fl = doorFlag(G.dungeon, G.rx, G.ry, dir);
      if (G.flags[fl]) continue;
      const [cx, cy] = centers[dir];
      if (dist2(ax, ay, cx, cy) < 40 * 40) {
        G.flags[fl] = 1;
        Sound.sfx("secret");
        rebuildRoomTiles();
      }
    }
  }
}

function burnAt(px, py) {
  // (indoors a flame may wake the smith's forge)
  if (G.area === "cave") { caveFlame(px, py); return; }
  if (G.area !== "overworld") { G.roomLit = true; return; }
  G.roomLit = true;
  const tx = Math.floor(px / TS), ty = Math.floor(py / TS);
  // check the flame tile and its neighbors: a bush hiding something burns first, else
  // the first plain bush (the candle lights once a visit, so it must not go to waste)
  const near = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]].map(([ox, oy]) => [tx + ox, ty + oy]).filter(([x, y]) => tileAt(G.tiles, x, y) === T_BUSH);
  for (const [x, y] of near) {
    const secret = G.screen && G.screen.secrets && G.screen.secrets.find(s => s.x === x && s.y === y && (s.kind === "burn" || s.kind === "burnhp"));
    if (secret) { revealSecret(secret); return; }
  }
  if (near.length) { const [x, y] = near[0]; G.tiles[y][x] = T_STUMP; Sound.sfx("bush_burn", { x: x * TS + 8 }); }
}

function revealSecret(s) {
  G.flags[s.flag] = 1;
  Sound.sfx("secret");
  const scr = getScreen(G.sx, G.sy);
  G.screen = scr;
  G.tiles = scr.tiles;
  addEffect("poof0", "poof1", s.x * TS, s.y * TS, 20);
  spawnScreenTreasures();
}

// Heart pieces lying on this screen (in the open, or uncovered by a secret).
function spawnScreenTreasures() {
  const scr = G.screen;
  if (!scr || !scr.hp) return;
  for (const [x, y, flag] of scr.hp) {
    if (G.flags[flag] || G.pickups.some(k => k.flag === flag)) continue;
    spawnPickup("item", x * TS, y * TS, { floor: true, item: "heartpiece", flag });
  }
}

// ---------- Pickups ----------
function spawnPickup(kind, x, y, opts) {
  const k = Object.assign({ kind, x, y, dead: false, t: 0, floor: false }, opts || {});
  G.pickups.push(k);
  return k;
}

// The small drops (anything else lying about is a treasure: kind "item").
const PICKUP_KINDS = new Set(["heart", "gem1", "gem5", "bombs", "key"]);

function updatePickups() {
  for (const k of G.pickups) {
    if (k.dead) continue;
    k.t++;
    // (a treasure may wait before it can be taken: a guardian's heart appears once its fall
    // and the victory call are over, so its fanfare is not lost under them)
    if (k.wait && k.t < k.wait) continue;
    if (!k.floor && k.t > 420) { k.dead = true; continue; }
    const box = k.floor ? [k.x - 2, k.y - 2, 18, 18] : [k.x, k.y, 12, 12];
    if (!P.dead && rectsOverlap(box[0], box[1], box[2], box[3], P.x + 2, P.y + 4, 12, 11)) {
      k.dead = true;
      takePickup(k);
    }
  }
  G.pickups = G.pickups.filter(k => !k.dead);
}

function takePickup(k) {
  switch (k.kind) {
    case "heart": healPlayer(2); Sound.sfx("heart"); break;
    case "gem1": G.gems = Math.min(255, G.gems + 1); Sound.sfx("gem"); break;
    case "gem5": G.gems = Math.min(255, G.gems + 5); Sound.sfx("gem5"); break;
    case "bombs": G.bombs = Math.min(G.bombMax, G.bombs + 4); Sound.sfx("bombs_pickup"); break;
    case "key": G.keys = Math.min(9, G.keys + 1); Sound.sfx("key"); if (k.flag) G.flags[k.flag] = 1; break;
    case "item": // dungeon floor item
      if (k.flag) G.flags[k.flag] = 1;
      grantItem(k.item);
      break;
  }
}

// (scene.js still calls this for a pickup with no picture: it shows the missing-art box,
// hud2.js drawMissing, never the July 8-bit sprite)
function drawPickup(ctx, k) {
  if (!k.dead) drawMissingAt(ctx, k.x, k.y, k.kind === "item" ? k.item : k.kind);
}

// Weighted enemy drops.
function rollDrop(x, y, rich) {
  const r = Math.random();
  if (rich) {
    if (r < 0.35) spawnPickup("gem5", x, y);
    else if (r < 0.7) spawnPickup("heart", x, y);
    else if (r < 0.85) spawnPickup("bombs", x, y);
    else spawnPickup("gem1", x, y);
    return;
  }
  if (r < 0.35) return;
  if (r < 0.60) spawnPickup("gem1", x, y);
  else if (r < 0.80) spawnPickup("heart", x, y);
  else if (r < 0.90) spawnPickup("gem5", x, y);
  else spawnPickup("bombs", x, y);
}

// ---------- Effects ----------
function addEffect(spr0, spr1, x, y, dur) {
  G.effects.push({ spr0, spr1, x, y, t: 0, dur });
}
function updateEffects() {
  for (const e of G.effects) e.t++;
  G.effects = G.effects.filter(e => e.t < e.dur);
}
// ---------- Projectile drawing ----------
// (the pictures are chars.js drawProj2; chars.js still calls this for a missile with no
// picture, which shows the missing-art box centred on it)
function drawProjectiles(ctx, list) {
  for (const p of list || G.projectiles) if (!p.dead) drawMissingAt(ctx, p.x - 8, p.y - 8, p.type);
}

// ---------- Item grants ----------
function grantItem(kind) {
  G.lastGrant = kind;
  switch (kind) {
    case "sword1": G.inv.sword = Math.max(G.inv.sword, 1); itemFanfare(); break;
    case "sword2": G.inv.sword = Math.max(G.inv.sword, 2); itemFanfare(); break;
    case "sword3": G.inv.sword = Math.max(G.inv.sword, 3); itemFanfare(); break;
    // shields only ever get better
    case "shield2": G.inv.shield = Math.max(G.inv.shield, 2); itemFanfare(); break;
    case "shield3": G.inv.shield = Math.max(G.inv.shield, 3); itemFanfare(); G.banner = { text: "THIS SHIELD TURNS FIRE", t: 180 }; break;
    // side-quest treasures, carried until handed over in Brambleford
    case "chart": G.flags["q:chart"] = 1; itemFanfare("item_small"); G.banner = { text: "THE WIDOW'S LOST CHART", t: 150 }; break;
    case "bell": G.flags["q:bell"] = 1; itemFanfare("item_small"); G.banner = { text: "THE ELDER'S LOST BELL", t: 150 }; break;
    case "candle": G.inv.candle = 1; itemFanfare(); if (!G.bItem) G.bItem = "candle"; break;
    case "boomerang": G.inv.boomerang = 1; itemFanfare(); if (!G.bItem) G.bItem = "boomerang"; break;
    case "bow": G.inv.bow = 1; itemFanfare(); if (!G.bItem) G.bItem = "bow"; break;
    case "ladder": G.inv.ladder = 1; itemFanfare(); break;
    case "raft": G.inv.raft = 1; itemFanfare(); break;
    case "ring": G.inv.ring = 1; itemFanfare(); break;
    case "potion": G.inv.potion = 1; itemFanfare(); break;
    case "bombs4": G.bombs = Math.min(G.bombMax, G.bombs + 4); if (!G.bItem) G.bItem = "bomb"; Sound.sfx("bombs_pickup"); break;
    case "key": G.keys = Math.min(9, G.keys + 1); Sound.sfx("key"); break;
    case "heartcont": G.maxhp = Math.min(40, G.maxhp + 2); G.hp = G.maxhp; itemFanfare("heart_fanfare"); break;
    case "heartpiece":
      // four pieces make a whole heart (its jingle has one more bell for each piece held)
      G.heartPieces = (G.heartPieces || 0) + 1;
      if (G.heartPieces >= 4) { G.heartPieces = 0; G.maxhp = Math.min(40, G.maxhp + 2); G.hp = G.maxhp; G.banner = { text: "A WHOLE NEW HEART!", t: 150 }; }
      else G.banner = { text: "HEART PIECE  " + G.heartPieces + " OF 4", t: 150 };
      itemFanfare("heart_piece", { count: G.heartPieces || 4 });
      break;
    case "hook": G.inv.hook = 1; itemFanfare(); G.bItem = "hook"; break;
    case "glove": G.inv.glove = 1; itemFanfare(); G.banner = { text: "LIFT HEAVY ROCKS WITH " + keyWord("a"), t: 180 }; break;
    case "hammer": G.inv.hammer = 1; itemFanfare(); G.bItem = "hammer"; break;
    case "gems10": G.gems = Math.min(255, G.gems + 10); Sound.sfx("gems_big"); break;
    case "gems30": G.gems = Math.min(255, G.gems + 30); Sound.sfx("gems_big"); break;
    case "gems50": G.gems = Math.min(255, G.gems + 50); Sound.sfx("gems_big"); break;
    case "map": if (G.dungeon) G.dmaps[G.dungeon].map = 1; Sound.sfx("map"); break;
    case "compass": if (G.dungeon) G.dmaps[G.dungeon].compass = 1; Sound.sfx("compass"); break;
    case "shard":
      G.shards++;
      // (its jingle pauses the music for the 110-tick pose, 1.83 s; then the level's track
      // stops outright, as it is not heard again here: Maren's scene starts its own music 120
      // ticks in. A pause alone was not enough: a shard taken while the guardian's victory
      // stinger still holds the track came back at the stinger's end, mid-pose)
      Sound.sfx("shard");
      Sound.stopMusic(0.3);
      G.shardWarp = 120; // main warps us out of the dungeon
      P.holdT = 110; P.holdItem = "shard"; P.kbT = 0;
      break;
  }
}
// A treasure worth a fanfare is held up over the hero's head for a moment. The world
// waits while he holds it (main's updatePlay): a blow or a grab that landed on this same
// frame is dropped, not delivered when he lowers it, and the blink left from an earlier
// hit waits with him (he stands whole while posing; player.js gives it back at the end).
// Its jingle (item_fanfare, heart_fanfare, heart_piece, item_small) pauses the music for
// the 70-tick pose (1.17 s: sfx.js `pause`) and the music goes on from the same place.
function itemFanfare(sound, opts) {
  Sound.sfx(sound || "item_fanfare", opts);
  if (P && !P.dead) {
    // (a second treasure mid-pose keeps the blink the first one put by)
    P.holdBlink = P.holdT > 0 ? Math.max(P.holdBlink || 0, P.iframes) : P.iframes; P.iframes = 0;
    P.holdT = 70; P.holdItem = G.lastGrant; P.kbT = 0; G.dragToEntrance = false;
  }
}
