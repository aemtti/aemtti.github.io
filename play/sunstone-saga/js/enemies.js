"use strict";
// ---------- Enemies ----------

const ENEMY_STATS = {
  grub_r: { hp: 1, dmg: 1, spd: 0.5 },
  grub_b: { hp: 2, dmg: 1, spd: 0.65 },
  snap: { hp: 2, dmg: 1, spd: 0 },
  caster: { hp: 2, dmg: 1, spd: 0.45 },
  maw: { hp: 2, dmg: 1, spd: 0.4 },
  bat: { hp: 1, dmg: 1, spd: 1.2, frail: true, fly: true },
  wisp: { hp: 1, dmg: 0, spd: 0.5, friendly: true, fly: true },
  oozelet: { hp: 1, dmg: 1, spd: 0, frail: true },
  ooze: { hp: 2, dmg: 1, spd: 0 },
  iron: { hp: 3, dmg: 2, spd: 0.5 },
  hexer: { hp: 3, dmg: 1, spd: 0 },
  clutch: { hp: 2, dmg: 0, spd: 0.7, grabber: true },
  spiketrap: { hp: 1, dmg: 2, immune: true },
  // later levels (sturdier and harder-hitting than the foes of levels 1-3)
  scarab: { hp: 3, dmg: 1, spd: 0.6 },                  // charges along a line of sight
  chiller: { hp: 3, dmg: 1, spd: 0.4, fly: true },       // throws ice four ways
  fireimp: { hp: 3, dmg: 2, spd: 0 },                    // hops, lobs embers
  shellback: { hp: 4, dmg: 2, spd: 0.35, shell: true },  // only a hammer blow opens its guard
};

function spawnEnemy(kind, x, y, opts) {
  const st = ENEMY_STATS[kind] || ENEMY_STATS.grub_r;
  const e = Object.assign({
    kind, x, y, hp: st.hp, dmg: st.dmg, spd: st.spd,
    dir: rngIntU(4), anim: 0, spawnT: 24, iframes: 0, stunT: 0, kbT: 0, kbDir: DOWN,
    frail: !!st.frail, fly: !!st.fly, friendly: !!st.friendly, immune: !!st.immune,
    grabber: !!st.grabber, shell: !!st.shell, dead: false, boss: false,
    turnT: 20, state: 0, t: 0,
  }, opts || {});
  if (kind === "maw") { e.state = "buried"; e.t = 60 + rngIntU(90); }
  if (kind === "hexer") { e.t = 40 + rngIntU(40); }
  if (kind === "spiketrap") { e.ox = x; e.oy = y; e.state = "idle"; e.spawnT = 0; }
  if (kind === "clutch") { e.wallPos = 0; }
  if (kind === "snap") { e.t = 60 + rngIntU(90); }
  if (kind === "chiller") { e.t = 60 + rngIntU(60); }
  if (kind === "fireimp") { e.t = 30 + rngIntU(40); }
  G.enemies.push(e);
  return e;
}

function rngIntU(n) { return Math.floor(Math.random() * n); }

// ---------- what a foe sounds like (js/sound/sfx.js) ----------
// Struck and felled by what it is made of and how big it is; a guardian's blow grunts
// (the crusted and rime-cased ones ring), and its fall is bossDefeated's own sound.
const FOE_SLIME = new Set(["ooze", "oozelet"]), FOE_ARMOR = new Set(["iron", "shellback", "spiketrap"]);
const FOE_SPIRIT = new Set(["hexer", "wisp", "chiller", "clutch"]), FOE_SMALL = new Set(["bat", "grub_r"]);
// a scarab lined up with the hero rears this many ticks before it charges (legacy_audit GM-13)
const SCARAB_WIND = 14;
const FOE_BIG = new Set(["iron", "shellback", "scarab"]);
function foeHitSound(e) {
  if (e.boss) return e.kind === "boss_frostmaw" || e.kind === "boss_emberhulk" ? "boss_hurt_armor" : "boss_hurt";
  return FOE_SLIME.has(e.kind) ? "hit_slime" : FOE_ARMOR.has(e.kind) ? "hit_armor" : FOE_SPIRIT.has(e.kind) ? "hit_spirit" : "hit";
}
function foeDieSound(e) {
  return FOE_SLIME.has(e.kind) ? "enemy_die_slime" : FOE_SPIRIT.has(e.kind) ? "enemy_die_spirit"
    : FOE_BIG.has(e.kind) ? "enemy_die_big" : FOE_SMALL.has(e.kind) ? "enemy_die_small" : "enemy_die";
}
// Where a foe is, for left/right in the effects.
function foeX(e) { return e.x + (e.w || 16) / 2; }

// ---------- keeping clear of a room's frame ----------
// A dungeon room's walls are drawn as a frame, with a band of trim bricks (6 px) round the
// floor. A foe's whole picture, and its ground shadow, stays off the trim of the west, east
// and south walls (against the north wall a head over the trim is how this view works); a
// flier's shadow stays off the north trim too, so it never hovers over a wall. Measured
// from each kind's frames (logic px from the corner of its box): picture and shadow span
// x+left .. x+right and reach down to y+bottom; a flier's shadow starts at y+top. The hexer
// (locked by the owner), the clutch (it clings to the wall) and the spike trap (it waits
// in a corner) are left as they were.
const FOE_REACH = {
  grub_r: [3, 15, 14], grub_b: [3, 15, 14], caster: [2, 15, 17], oozelet: [3, 15, 13], ooze: [2, 15, 15],
  iron: [1, 15, 18], scarab: [0, 16, 16], fireimp: [3, 15, 18], shellback: [-2, 18, 19],
  bat: [0, 16, 18, 13], chiller: [-1, 17, 18, 13],
};
const ROOM_TRIM = { x0: 38, y0: 38, x1: 218, y1: 138 };   // the floor inside the trim (logic px)
// Where in a room a foe of this kind may be: [x min, x max, y min, y max], or null (out of
// doors, a guardian, or a kind left as it was).
function foeRoomBox(e) {
  const r = G.area === "dungeon" && !e.boss && FOE_REACH[e.kind];
  if (!r) return null;
  return [ROOM_TRIM.x0 - r[0], ROOM_TRIM.x1 - r[1], r[3] !== undefined ? ROOM_TRIM.y0 - r[3] : 0, ROOM_TRIM.y1 - r[2]];
}
// Firm, open ground for its body at (nx, ny) (a flier goes anywhere).
function foeGroundOK(nx, ny) {
  for (const [ox, oy] of [[2, 2], [13, 2], [2, 13], [13, 13]]) {
    const t = tileAt(G.tiles, Math.floor((nx + ox) / TS), Math.floor((ny + oy) / TS));
    if (tileSolid(t) || tileWater(t) || tileHazard(t)) return false;
  }
  return true;
}
// Set a new foe inside its room box, at the nearest spot to where it was put, when that
// spot is open floor; false when it is not (the foe stays where it was put).
function settleInRoom(e) {
  const b = foeRoomBox(e);
  if (!b) return true;
  const x = clamp(e.x, b[0], b[1]), y = clamp(e.y, b[2], b[3]);
  if (!foeGroundOK(x, y)) return false;
  e.x = x; e.y = y;
  return true;
}

function enemyCanMove(e, nx, ny) {
  if (nx < 0 || nx + 16 > PW || ny < 0 || ny + 16 > PH) return false;
  // (in a room it keeps off the frame's trim; one that stands on it may still step off)
  const b = foeRoomBox(e);
  if (b && ((nx < b[0] && nx < e.x) || (nx > b[1] && nx > e.x) || (ny < b[2] && ny < e.y) || (ny > b[3] && ny > e.y))) return false;
  if (e.fly) return true;
  return foeGroundOK(nx, ny);
}

function enemyWalk(e) {
  const nx = e.x + DX[e.dir] * e.spd, ny = e.y + DY[e.dir] * e.spd;
  if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; }
  else e.dir = rngIntU(4);
  e.turnT--;
  if (e.turnT <= 0) {
    e.turnT = 30 + rngIntU(60);
    if (Math.random() < 0.3) e.dir = dirToward(e.x, e.y, P.x, P.y);
    else e.dir = rngIntU(4);
  }
}

function updateEnemies() {
  for (const e of G.enemies) {
    if (e.dead) continue;
    e.anim++;
    if (e.spawnT > 0) { e.spawnT--; continue; }
    if (e.iframes > 0) e.iframes--;
    // (a stunned clutch lets go of its grab and draws back to its wall afterwards)
    if (e.stunT > 0) { e.stunT--; if (!e.boss) { if (e.kind === "clutch" && e.state !== "crawl") e.state = "back"; touchPlayer(e); continue; } }
    if (e.kbT > 0) {
      e.kbT--;
      const nx = e.x + DX[e.kbDir] * 3, ny = e.y + DY[e.kbDir] * 3;
      if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; }
      touchPlayer(e);
      continue;
    }
    if (e.boss) { e.tick(e); touchPlayer(e); continue; }

    switch (e.kind) {
      case "grub_r": case "grub_b": case "iron":
        enemyWalk(e);
        break;
      case "snap": {
        e.t--;
        // (a warning swells over the 18 ticks before it spits; the timing is as it was)
        if (e.t === 18) Sound.sfx("tell_snap", { x: foeX(e) });
        if (e.t <= 0) {
          e.t = 100 + rngIntU(80);
          const d = dirToward(e.x, e.y, P.x, P.y);
          e.shootT = 20;
          dirProj("seed", e.x + 8, e.y + 8, d, 2, { hostile: true, dmg: 1, size: 6 });
          Sound.sfx("shot_seed", { x: foeX(e) });
        }
        if (e.shootT > 0) e.shootT--;
        break;
      }
      case "caster": {
        if (e.dir === UP || e.dir === DOWN) e.dir = LEFT;
        const nx = e.x + DX[e.dir] * e.spd;
        if (enemyCanMove(e, nx, e.y)) e.x = nx; else e.dir = OPP[e.dir];
        e.t--;
        if (e.t === 20) Sound.sfx("tell_caster", { x: foeX(e) });
        if (e.t <= 0) {
          e.t = 110 + rngIntU(70);
          const dx = (P.x - e.x), dy = (P.y - e.y);
          const len = Math.hypot(dx, dy) || 1;
          spawnProj({ type: "rock", x: e.x + 8, y: e.y + 8, vx: dx / len * 2.2, vy: dy / len * 2.2, hostile: true, dmg: 1, life: 180 });
          e.throwT = 20;
          Sound.sfx("shot_rock", { x: foeX(e) });
        }
        if (e.throwT > 0) e.throwT--;
        break;
      }
      case "maw": {
        e.t--;
        if (e.state === "buried") {
          // slide beneath the sand toward the player
          const d = dirToward(e.x, e.y, P.x, P.y);
          const nx = e.x + DX[d] * e.spd, ny = e.y + DY[d] * e.spd;
          if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; }
          // the mound rumbles for the half second before it pops up (owner's decision 6)
          if (e.t <= 0) { e.state = "mound"; e.t = 30; Sound.sfx("maw_mound", { x: foeX(e) }); }
        } else if (e.state === "mound") {
          if (e.t <= 0) { e.state = "up"; e.t = 80; }
        } else if (e.state === "up") {
          if (e.t <= 0) { e.state = "sinking"; e.t = 30; }
        } else if (e.state === "sinking") {
          if (e.t <= 0) { e.state = "buried"; e.t = 90 + rngIntU(90); }
        }
        break;
      }
      case "bat": {
        e.t--;
        if (e.t <= 0) {
          e.t = 20 + rngIntU(40);
          if (Math.random() < 0.25) { e.vx = 0; e.vy = 0; }
          else {
            const ang = Math.random() * Math.PI * 2;
            e.vx = Math.cos(ang) * e.spd; e.vy = Math.sin(ang) * e.spd * 0.7;
          }
        }
        // it turns back at the screen's edge; in a room, at the edge of the floor inside the
        // trim, so neither it nor its shadow is ever over a wall
        const b = foeRoomBox(e) || [0, PW - 16, 0, PH - 16];
        let nx = e.x + (e.vx || 0), ny = e.y + (e.vy || 0);
        if ((nx < b[0] && nx < e.x) || (nx > b[1] && nx > e.x)) { e.vx = -(e.vx || 0); nx = e.x; }
        if ((ny < b[2] && ny < e.y) || (ny > b[3] && ny > e.y)) { e.vy = -(e.vy || 0); ny = e.y; }
        e.x = nx; e.y = ny;
        break;
      }
      case "wisp": {
        enemyWalk(e);
        // a faint shimmer while the hero is near the friendly wisp
        if (G.frame % 30 === 0 && dist2(e.x, e.y, P.x, P.y) < 48 * 48) Sound.sfx("wisp_near", { x: foeX(e) });
        break;
      }
      case "oozelet": case "ooze": {
        if (e.state === 0) { // resting
          e.t--;
          if (e.t <= 0) { e.state = 1; e.t = 10; e.dir = rngIntU(4); }
        } else {
          const sp = e.kind === "ooze" ? 1.4 : 1.8;
          const nx = e.x + DX[e.dir] * sp, ny = e.y + DY[e.dir] * sp;
          if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; }
          e.t--;
          if (e.t <= 0) { e.state = 0; e.t = 30 + rngIntU(50); }
        }
        break;
      }
      case "hexer": {
        e.t--;
        if (e.t === 30) {
          const dx = (P.x - e.x), dy = (P.y - e.y);
          const len = Math.hypot(dx, dy) || 1;
          spawnProj({ type: "magic", x: e.x + 8, y: e.y + 8, vx: dx / len * 2.8, vy: dy / len * 2.8, hostile: true, dmg: 2, life: 140 });
          // (quiet, on the frame it fires: no warning, the graveyard stays as hard as it was)
          Sound.sfx("shot_hex", { x: foeX(e) });
        }
        if (e.t <= 0) {
          // teleport
          Sound.sfx("teleport");
          addEffect("poof0", "poof1", e.x, e.y, 14);
          for (let tries = 0; tries < 20; tries++) {
            const tx = 2 + rngIntU(12), ty = 2 + rngIntU(7);
            if (spawnSpotOK(tileAt(G.tiles, tx, ty))) { e.x = tx * TS; e.y = ty * TS; break; }
          }
          addEffect("poof0", "poof1", e.x, e.y, 14);
          e.t = 90 + rngIntU(60);
        }
        break;
      }
      case "clutch": updateClutch(e); break;
      case "scarab": {
        if (e.state === "charge") {
          const nx = e.x + DX[e.dir] * 3, ny = e.y + DY[e.dir] * 3;
          if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; } else { e.state = 0; e.t = 50; }
        } else if (e.state === "wind") {
          // (it rears and rattles in place for SCARAB_WIND ticks before it runs down the
          // line it faces: time to step out of that line)
          if (--e.t <= 0) { e.state = "charge"; Sound.sfx("scarab_charge", { x: foeX(e) }); }
        } else {
          enemyWalk(e);
          if (e.t > 0) e.t--;
          const ax = Math.abs(P.x - e.x), ay = Math.abs(P.y - e.y);
          if (e.t <= 0 && ((ax < 8 && ay < 96) || (ay < 8 && ax < 96))) { e.state = "wind"; e.t = SCARAB_WIND; e.dir = dirToward(e.x, e.y, P.x, P.y); Sound.sfx("tell_scarab", { x: foeX(e) }); }
        }
        break;
      }
      case "chiller": {
        // drift toward the hero on a wobble, and every so often send ice four ways
        // (in a room it drifts over the floor inside the trim, never over a wall)
        const a = Math.atan2(P.y - e.y, P.x - e.x) + Math.sin(e.anim / 20) * 1.2, b = foeRoomBox(e) || [16, PW - 32, 16, PH - 32];
        e.x = clamp(e.x + Math.cos(a) * e.spd, b[0], b[1]); e.y = clamp(e.y + Math.sin(a) * e.spd, b[2], b[3]);
        e.t--;
        if (e.t === 20) Sound.sfx("tell_chiller", { x: foeX(e) });
        if (e.t <= 0) {
          e.t = 110 + rngIntU(60); e.castT = 16;
          for (const d of [UP, DOWN, LEFT, RIGHT]) dirProj("ice", e.x + 8, e.y + 8, d, 1.6, { hostile: true, dmg: 1, size: 6, life: 150 });
          Sound.sfx("shot_ice", { x: foeX(e) });
        }
        if (e.castT > 0) e.castT--;
        break;
      }
      case "fireimp": {
        // rest, then a hop toward the hero; now and then an ember is lobbed
        if (e.state === "hop") {
          const nx = e.x + e.hvx, ny = e.y + e.hvy;
          if (enemyCanMove(e, nx, ny)) { e.x = nx; e.y = ny; }
          e.t--;
          if (e.t <= 0) { e.state = 0; e.t = 30 + rngIntU(40); }
        } else {
          e.t--;
          if (e.t <= 0) {
            if (Math.random() < 0.35) {
              const dx = P.x - e.x, dy = P.y - e.y, len = Math.hypot(dx, dy) || 1;
              spawnProj({ type: "fireball", x: e.x + 8, y: e.y + 6, vx: dx / len * 1.8, vy: dy / len * 1.8, hostile: true, dmg: 1, life: 150 });
              e.throwT = 16; e.t = 40;
              Sound.sfx("shot_ember", { x: foeX(e) });
            } else {
              const d = dirToward(e.x, e.y, P.x, P.y), dd = Math.random() < 0.6 ? d : rngIntU(4);
              e.state = "hop"; e.t = 16; e.hvx = DX[dd] * 1.5; e.hvy = DY[dd] * 1.5; e.dir = dd;
            }
          }
        }
        if (e.throwT > 0) e.throwT--;
        break;
      }
      case "shellback": {
        if (e.flipped > 0) { e.flipped--; break; }     // on its back, legs in the air
        enemyWalk(e);
        break;
      }
      case "spiketrap": {
        if (e.state === "idle") {
          const pdx = (P.x + 8) - (e.x + 8), pdy = (P.y + 8) - (e.y + 8);
          if (Math.abs(pdy) < 12 && Math.abs(pdx) > 8) { e.state = "lunge"; e.lvx = sgn(pdx) * 3; e.lvy = 0; }
          else if (Math.abs(pdx) < 12 && Math.abs(pdy) > 8) { e.state = "lunge"; e.lvx = 0; e.lvy = sgn(pdy) * 3; }
          if (e.state === "lunge") Sound.sfx("spike_lunge", { x: foeX(e) });
        } else if (e.state === "lunge") {
          const nx = e.x + e.lvx, ny = e.y + e.lvy;
          if (!enemyCanMove(e, nx, ny)) e.state = "retract";
          else { e.x = nx; e.y = ny; }
        } else {
          const dx = e.ox - e.x, dy = e.oy - e.y;
          if (Math.abs(dx) < 1 && Math.abs(dy) < 1) { e.x = e.ox; e.y = e.oy; e.state = "idle"; }
          else { e.x += sgn(dx) * 0.7; e.y += sgn(dy) * 0.7; }
        }
        break;
      }
    }
    touchPlayer(e);
  }

  // sweep the dead
  G.enemies = G.enemies.filter(e => !e.dead);
}

let _clutchRing = null;
function clutchRing() {
  if (_clutchRing) return _clutchRing;
  const ring = [];
  for (let x = 2; x <= 13; x++) ring.push([x, 2]);
  for (let y = 3; y <= 8; y++) ring.push([13, y]);
  for (let x = 12; x >= 2; x--) ring.push([x, 8]);
  for (let y = 7; y >= 3; y--) ring.push([2, y]);
  _clutchRing = ring;
  return ring;
}

// ---------- the clutch ----------
// A shadow hand that creeps round the room's inner ring of floor, next to the walls, at
// 0.7 px a frame (a lap takes about 13 s), gliding from tile to tile. It turns back where
// the ring is broken by a drop, lava, water or a piece, so it never stands on them. When
// the hero comes within 20 px it stops and spreads its fingers for 24 frames (the
// warning: its open-hand frame, trembling), then lunges up to a tile at him; only that
// lunge grabs (and drags him back to the level's entrance). A blow sends it back to its
// wall and away along the ring, a stun lets go of the grab, and either way it waits a
// moment (CLUTCH_REST) before it reaches again.
const CLUTCH_NEAR = 20, CLUTCH_WIND = 24, CLUTCH_LUNGE = 8, CLUTCH_REACH = 16, CLUTCH_REST = 40;
function clutchTileOK(i) { const [x, y] = clutchRing()[i]; return standableTile(tileAt(G.tiles, x, y)); }
// Set a new clutch on the open ring tile nearest ring place e.wallPos (with no open ring
// tile at all it keeps the spot it was given).
function settleClutch(e) {
  const ring = clutchRing(), L = ring.length, w = ((Math.floor(e.wallPos || 0) % L) + L) % L;
  e.ri = -1;
  for (let k = 0; k < L && e.ri < 0; k++) for (const s of [1, -1]) { const i = (((w + s * k) % L) + L) % L; if (clutchTileOK(i)) { e.ri = i; break; } }
  e.rj = e.ri; e.rp = 0; e.rdir = 1; e.state = "crawl"; e.ox = 0; e.oy = 0; e.rest = CLUTCH_REST;
  e.hx0 = e.x; e.hy0 = e.y;
  if (e.ri >= 0) { e.x = ring[e.ri][0] * TS; e.y = ring[e.ri][1] * TS; }
}
function updateClutch(e) {
  const ring = clutchRing(), L = ring.length;
  if (e.ri === undefined) settleClutch(e);
  // its place on the ring: between tile ri and tile rj, rp px of the way
  const home = () => {
    if (e.ri < 0) return [e.hx0, e.hy0];
    const a = ring[e.ri], b = ring[e.rj], f = e.rp / TS;
    return [(a[0] + (b[0] - a[0]) * f) * TS, (a[1] + (b[1] - a[1]) * f) * TS];
  };
  if (e.rest > 0) e.rest--;
  // the next ring tile on from ri: ahead, else back the other way, else none (stay)
  const onward = () => {
    let n = (e.ri + e.rdir + L) % L;
    if (!clutchTileOK(n)) { e.rdir = -e.rdir; n = (e.ri + e.rdir + L) % L; }
    return clutchTileOK(n) ? n : e.ri;
  };
  // turn round on the ring (between the same two tiles, heading the other way)
  const turn = () => { if (e.ri < 0) return; const t = e.ri; e.ri = e.rj; e.rj = t; e.rp = e.ri === e.rj ? 0 : TS - e.rp; e.rdir = -e.rdir; };
  // struck: it lets go of whatever it was doing and flees back along its path for a while
  if (e.struck) { e.struck = false; e.rest = e.flee = CLUTCH_REST; if (e.state === "crawl") turn(); else { e.state = "back"; e.turnBack = true; } }
  if (e.state === "crawl") {
    const [hx0, hy0] = home(), near = Math.hypot(P.x - hx0, P.y - hy0) < CLUTCH_NEAR;
    if (e.flee > 0) e.flee--;
    // (its wind-up is heard as it spreads its fingers: a stand-in warning, as sfx.js has no
    // creak of its own for the hand)
    if (near && !e.rest) { e.state = "wind"; e.t = CLUTCH_WIND; Sound.sfx("tell_snap", { x: foeX(e), pitch: -3 }); }
    // (resting, it waits beside the hero rather than creep through him, unless it flees)
    else if ((!near || e.flee > 0) && e.ri >= 0) {
      // a piece slid onto the tile ahead: go back the way it came
      if (e.rj !== e.ri && !clutchTileOK(e.rj)) turn();
      if (e.rj === e.ri) { e.rj = onward(); e.rp = 0; }
      else {
        e.rp += e.spd;
        if (e.rp >= TS) { e.ri = e.rj; e.rj = onward(); e.rp = e.rj === e.ri ? 0 : e.rp - TS; }
      }
    }
  } else if (e.state === "wind") {
    // the open hand, trembling
    const [hx, hy] = home();
    e.anim = 0;
    e.ox = (e.t & 2) && enemyCanMove(e, hx + 1, hy) ? 1 : 0; e.oy = 0;
    if (--e.t <= 0) {
      // a tile at the hero, cut short where the floor ends: every spot the hand will
      // pass, out (8 frames) and back (1 px a frame), must be over floor (never over a
      // drop, lava, water or a piece)
      const dx = P.x - hx, dy = P.y - hy, len = Math.hypot(dx, dy) || 1;
      let r = Math.min(CLUTCH_REACH, len);
      const fits = (rr) => {
        const at = (s) => enemyCanMove(e, hx + dx / len * s, hy + dy / len * s);
        for (let k = 1; k <= CLUTCH_LUNGE; k++) if (!at(rr * k / CLUTCH_LUNGE)) return false;
        for (let s = rr - 1; s > 0; s--) if (!at(s)) return false;
        return true;
      };
      while (r > 0 && !fits(r)) r -= 2;
      e.lx = r > 0 ? dx / len * r : 0; e.ly = r > 0 ? dy / len * r : 0;
      e.state = "lunge"; e.t = CLUTCH_LUNGE;
    }
  } else if (e.state === "lunge") {
    // the closed hand: this is the grab (it reaches full stretch on the last frame)
    e.anim = 8;
    if (e.t <= 0) e.state = "back";
    else { e.t--; const f = 1 - e.t / CLUTCH_LUNGE; e.ox = e.lx * f; e.oy = e.ly * f; }
  }
  if (e.state === "back") {
    // "back": drawing back to the wall at 1 px a frame
    const d = Math.hypot(e.ox, e.oy);
    if (d <= 1) { e.ox = 0; e.oy = 0; e.state = "crawl"; e.rest = CLUTCH_REST; if (e.turnBack) { e.turnBack = false; turn(); } }
    else { e.ox -= e.ox / d; e.oy -= e.oy / d; }
  }
  const [hx, hy] = home();
  e.x = hx + e.ox; e.y = hy + e.oy;
}

function touchPlayer(e) {
  if (P.dead || P.iframes > 0 || e.dead || e.spawnT > 0) return;
  if (e.kind === "maw" && e.state !== "up") return;
  if (e.kind === "boss_dunescale" && e.state === "burrow") return;
  // the clutch grabs only with its lunge (never while it creeps, winds up or is stunned)
  if (e.kind === "clutch" && (e.state !== "lunge" || e.stunT > 0)) return;
  // while Vex takes shape he can't be struck, and his touch does no harm either
  if (e.kind === "boss_vex" && e.cloak > 0) return;
  const ew = e.w || 12, eh = e.h || 12;
  if (!rectsOverlap(e.x + 2, e.y + 2, ew, eh, P.x + 2, P.y + 4, 12, 11)) return;
  if (e.friendly) {
    // healing wisp
    healPlayer(6);
    Sound.sfx("wisp_heal", { x: foeX(e) });
    addEffect("sparkle", "sparkle", e.x, e.y, 20);
    e.dead = true;
    return;
  }
  if (e.grabber) {
    Sound.sfx("grab");
    G.dragToEntrance = true;
    return;
  }
  damagePlayer(e.dmg, e.x + 8, e.y + 8);
}

// A blow turned by a guard: "immune". Its clank rings once per 12 ticks, not on every tick
// the blade stays on the guard (a held swing touches it on up to 9 ticks in a row).
function clankOff(e) {
  if (!(Math.abs(G.frame - (e.clankF === undefined ? -99 : e.clankF)) < 12)) { e.clankF = G.frame; Sound.sfx("clank", { x: foeX(e) }); }
  return "immune";
}
// Returns true if damaged, "immune" if the hit clanked off.
function damageEnemy(e, dmg, dir, src) {
  if (e.dead || e.spawnT > 0 || e.friendly) return false;
  if (e.iframes > 0) return false;
  if (e.immune) return clankOff(e);
  if (e.kind === "maw" && e.state !== "up") return false;
  if (e.kind === "iron" && dir === OPP[e.dir] && src !== "bomb") return clankOff(e);
  if (e.shell && !(e.flipped > 0) && src !== "bomb" && src !== "hammer") return clankOff(e);
  if (e.boss && e.guard && e.guard(e, dmg, dir, src)) return clankOff(e);
  e.hp -= dmg;
  e.iframes = 14;
  // (the clutch clings to its wall: a blow drives it back along its own path instead)
  if (!e.boss && e.kind !== "clutch") { e.kbT = 8; e.kbDir = dir; }
  if (e.kind === "clutch") e.struck = true;
  if (e.hp <= 0) {
    killEnemy(e, dir);
  } else {
    Sound.sfx(foeHitSound(e), { x: foeX(e) });
  }
  return true;
}

function killEnemy(e, dir) {
  e.dead = true;
  // its cry: an ooze splits, a Marrowworm segment pops (2 semitones higher for each one
  // lost before it); a guardian's last blow is bossDefeated's boss_defeat alone
  if (!e.boss) Sound.sfx(e.kind === "ooze" ? "ooze_split" : foeDieSound(e), { x: foeX(e) });
  else if (e.shared && e.shared.alive > 1) Sound.sfx("worm_pop", { x: foeX(e), pitch: 2 * ((e.shared.total || 5) - e.shared.alive) });
  addEffect("poof0", "poof1", e.x, e.y, 16);
  G.lastKillPos = { x: e.x, y: e.y };
  if (e.boss) { if (e.onDeath) e.onDeath(e); return; }
  if (e.kind === "ooze") {
    for (const off of [[-8, 0], [8, 0]]) {
      const s = spawnEnemy("oozelet", clamp(e.x + off[0], 0, PW - 16), e.y, {});
      s.spawnT = 10;
      // (in a room, off the trim where the floor there is open; where it is not - an
      // ooze that died in a doorway has wall on both sides - the half starts where the
      // ooze stood, never inside the wall)
      if (!settleInRoom(s) || !foeGroundOK(s.x, s.y)) { s.x = e.x; s.y = e.y; }
    }
    return; // splitters don't drop
  }
  if (Math.random() < 0.55) rollDrop(e.x + 2, e.y + 2, false);
}

// ---------- Drawing ----------
// (the pictures are chars.js drawFoe2)
// Ground line of an enemy in logic units (for depth sorting).
function enemyFootY(e) { return e.y + (e.boss ? (e.h || 14) + 2 : 15); }
// (scene.js still calls this for a foe with no picture: it shows the missing-art box,
// hud2.js drawMissing, never the July 8-bit sprite)
function drawEnemy(ctx, e) {
  if (!e.dead) drawMissingAt(ctx, e.x, e.y, e.kind);
}

// Where a foe may appear: firm ground (never water, a pit or lava), and not in a doorway.
function spawnSpotOK(t) { return standableTile(t) && t !== T_CAVE && t !== T_STAIRS && t !== T_HDOOR; }

// Spawn a screen's enemy list at random firm tiles away from the player.
function spawnScreenEnemies(list) {
  // (one soft sound for the group as it takes shape)
  if (list.length) Sound.sfx("spawn");
  for (const kind of list) {
    for (let tries = 0; tries < 30; tries++) {
      const tx = 1 + rngIntU(COLS - 2), ty = 1 + rngIntU(ROWS - 2);
      if (!spawnSpotOK(tileAt(G.tiles, tx, ty))) continue;
      // (nor on a heart piece: it may lie in a nook the foe could never leave)
      if (G.screen && G.screen.hp && G.screen.hp.some(([hx, hy]) => hx === tx && hy === ty)) continue;
      const px = tx * TS, py = ty * TS;
      if (dist2(px, py, P.x, P.y) < 56 * 56) continue;
      spawnEnemy(kind, px, py);
      break;
    }
  }
}
