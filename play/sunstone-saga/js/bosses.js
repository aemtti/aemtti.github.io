"use strict";
// ---------- Bosses ----------
// Bosses are enemies with boss:true, custom tick/draw/guard/onDeath.

function bossDefeated(e, dropHeart) {
  G.flags["d" + G.dungeon + ":boss"] = 1;
  // the guardian's fall, once (killEnemy sounds no cry for a boss's last blow: C-02 settled):
  // six blasts and a long boom with the music ducked; as it dies away the victory stinger
  // plays and the level's own track goes on. After the Tyrant the keep goes quiet at once
  // (the sage's room and the ending carry on), and the stinger rings out over the silence.
  Sound.sfx("boss_defeat", { x: e.x + (e.w || 16) / 2 });
  const vex = e.kind === "boss_vex", after = DUNGEONS[G.dungeon].music;
  if (vex) Sound.stopMusic(1.2);
  queueMusic(84, () => { if (!vex) Sound.music(after); Sound.stinger("st_victory"); });
  for (let i = 0; i < 6; i++) {
    addEffect("boomexp0", "boomexp1", e.x + rngIntU(24) - 4, e.y + rngIntU(24) - 4, 20 + i * 4);
  }
  if (dropHeart && !G.flags["d" + G.dungeon + ":bosshc"]) {
    spawnPickup("item", e.x + 8, e.y + 8, { floor: true, item: "heartcont", flag: "d" + G.dungeon + ":bosshc", kind: "item", wait: 340 });
  }
  rebuildRoomTiles();
}

function spawnBoss(type, x, y) {
  if (type === "wyrm") return spawnWyrm(x, y);
  if (type === "worm") return spawnWorm(x, y);
  if (type === "gazer") return spawnGazer(x, y);
  if (type === "vex") return spawnVex(x, y);
  if (type === "dunescale") return spawnDunescale(x, y);
  if (type === "frostmaw") return spawnFrostmaw(x, y);
  if (type === "emberhulk") return spawnEmberhulk(x, y);
}

function clampBossIn(e) {
  e.x = clamp(e.x, 36, PW - 36 - (e.w || 16));
  e.y = clamp(e.y, 36, PH - 36 - (e.h || 16));
}

// ---- Dunescale: stalks, sinks into the sand and bursts up under the hero.
// Its armour turns every blow until the tether hook yanks its tail and it sprawls. ----
function spawnDunescale(x, y) {
  return spawnEnemy("boss_dunescale", x, y, {
    boss: true, hp: 10, dmg: 2, w: 30, h: 22, spawnT: 0,
    state: "walk", t: 140,
    // (steel only glances off its shell: after a third turned blow in a fight, a one-time
    // banner says the hook is the way, since the level's hint speaks only of iron-bound wood)
    guard(e) {
      if (e.state === "stun") return false;
      if (Math.abs(G.frame - (e.blkF === undefined ? -99 : e.blkF)) > 12) {
        e.blkF = G.frame; e.blocked = (e.blocked || 0) + 1;
        if (e.blocked === 3 && !e.hinted) { e.hinted = true; G.banner = { text: "STEEL GLANCES OFF. HOOK IT FIRST!", t: 200 }; }
      }
      return true;
    },
    onHook(e) { if (e.state !== "stun" && e.state !== "burrow") { e.state = "stun"; e.t = 160; Sound.sfx("dune_hooked", { x: e.x + 15 }); G.shake = 6; } },
    // (under the sand it rumbles along: main.js updateSoundLoops, burrow_loop)
    tick(e) {
      e.t--;
      const a = Math.atan2(P.y - e.y, P.x - e.x);
      if (e.state === "walk") {
        e.x += Math.cos(a) * 0.6; e.y += Math.sin(a) * 0.6; clampBossIn(e);
        if (e.t <= 0) { e.state = "burrow"; e.t = 100; }
      } else if (e.state === "burrow") {
        e.x += Math.cos(a) * 1.3; e.y += Math.sin(a) * 1.3; clampBossIn(e);
        // its warning swells for the last 20 ticks before it bursts up
        if (e.t === 20) Sound.sfx("tell_dunescale", { x: e.x + 15 });
        if (e.t <= 0) { e.state = "lunge"; e.t = 36; Sound.sfx("dune_emerge", { x: e.x + 15 }); G.shake = 10; }
      } else if (e.state === "lunge") {
        if (e.t <= 0) { e.state = "walk"; e.t = 150 + rngIntU(60); }
      } else if (e.state === "stun") {
        if (e.t <= 0) { e.state = "walk"; e.t = 120; }
      }
    },
    onDeath(e) { bossDefeated(e, true); },
  });
}

// ---- Frostmaw: a head of rime set in the north wall. It opens its maw to breathe
// ice; only a pot or rock thrown into the open maw hurts it. ----
function spawnFrostmaw(x, y) {
  return spawnEnemy("boss_frostmaw", x, y, {
    boss: true, hp: 8, dmg: 2, w: 60, h: 26, spawnT: 0,
    open: false, t: 120, breathT: 0,
    guard() { return true; },
    onThrown(e, p) {
      if (!e.open) { Sound.sfx("clank"); return; }
      e.hp -= p.kind === "hrock" ? 2 : 1;
      e.iframes = 24; G.shake = 8;
      // (the last one is its fall: boss_defeat)
      if (e.hp <= 0) killEnemy(e, DOWN);
      else { Sound.sfx("thrown_hit", { x: e.x + 30 }); e.open = false; e.t = 90; }
    },
    tick(e) {
      e.t--;
      // the rime creaks for half a second before the maw opens
      if (!e.open && e.t === 30) Sound.sfx("tell_frostmaw", { x: e.x + 30 });
      if (!e.open && e.t <= 0) { e.open = true; e.t = 120; e.breathT = 40; Sound.sfx("maw_open", { x: e.x + 30 }); }
      else if (e.open) {
        if (e.breathT > 0) {
          e.breathT--;
          if (e.breathT % 12 === 0) {
            const sx = e.x + 32, sy = e.y + 26, base = Math.atan2(P.y + 8 - sy, P.x + 8 - sx);
            // each shard keeps its heading (vx, vy; dir is the nearest of the four)
            for (const off of [-0.35, 0, 0.35]) {
              const vx = Math.cos(base + off) * 2, vy = Math.sin(base + off) * 2;
              spawnProj({ type: "ice", x: sx, y: sy, vx, vy, hostile: true, dmg: 1, life: 160, dir: dirToward(0, 0, vx, vy) });
            }
            Sound.sfx("ice_breath", { x: sx }); Sound.sfx("shot_ice", { x: sx });
          }
        }
        if (e.t <= 0) { e.open = false; e.t = 100 + rngIntU(60); }
      }
      // the chamber sheds new rocks and pots from its walls whenever the last one the hero
      // can lift has been thrown (never onto the hero: a spot he stands on stays bare until
      // the next fall). A rock counts only with the power glove in hand: without it the
      // pots come back, so the fight can't quietly become one he can't win.
      const liftable = (t) => t === T_DPOT || (t === T_DROCK && !!G.inv.glove);
      const ammo = [...G.roomPieces.values()].some(liftable);
      if (!ammo && !P.carry && !G.projectiles.some(p => p.type === "thrown")) {
        const fresh = initialRoomPieces(G.dungeon, G.rx, G.ry, G.pushState);
        for (const k of [...fresh.keys()]) {
          const [tx, ty] = k.split(",").map(Number);
          if (rectsOverlap(P.x + 2, P.y + 8, 12, 8, tx * TS, ty * TS, TS, TS)) fresh.delete(k);
        }
        if ([...fresh.values()].some(liftable)) {
          G.roomPieces = fresh;
          rebuildRoomTiles(); Sound.sfx("rock_shed"); G.shake = 6;
        }
      }
    },
    onDeath(e) { bossDefeated(e, true); },
  });
}

// ---- Emberhulk: a golem of cooled lava that trudges after the hero hurling embers.
// Blades glance off its crust; three hammer blows crack it and bare the core for a while. ----
function spawnEmberhulk(x, y) {
  return spawnEnemy("boss_emberhulk", x, y, {
    boss: true, hp: 12, dmg: 2, w: 28, h: 30, spawnT: 0,
    crust: 3, bareT: 0, t: 140,
    guard(e, dmg, dir, src) { return e.bareT <= 0; },
    onHammer(e) {
      if (e.bareT > 0) { damageEnemy(e, 2, P.dir, "hammer"); return; }
      // each blow cracks the crust a stage further (a higher crack: the core is nearer);
      // bare, its core hums (main.js updateSoundLoops, core_hum)
      e.crust--; Sound.sfx("crust_crack" + (3 - e.crust), { x: e.x + 14 }); G.shake = 8;
      if (e.crust <= 0) { e.bareT = 260; e.crust = 3; for (let i = 0; i < 4; i++) addEffect("poof0", "poof1", e.x + rngIntU(24), e.y + rngIntU(24), 14); }
    },
    tick(e) {
      if (e.bareT > 0) { e.bareT--; if (e.bareT === 30) Sound.sfx("recrust", { x: e.x + 14 }); }
      const a = Math.atan2(P.y - e.y, P.x - e.x), sp = e.bareT > 0 ? 0.25 : 0.45;
      e.x += Math.cos(a) * sp; e.y += Math.sin(a) * sp; clampBossIn(e);
      e.t--;
      if (e.t === 27) Sound.sfx("tell_emberhulk", { x: e.x + 14 });
      if (e.t <= 0) {
        e.t = 150 + rngIntU(50);
        const sx = e.x + 16, sy = e.y + 10, base = Math.atan2(P.y + 8 - sy, P.x + 8 - sx);
        for (const off of [-0.3, 0, 0.3]) spawnProj({ type: "fireball", x: sx, y: sy, vx: Math.cos(base + off) * 1.7, vy: Math.sin(base + off) * 1.7, hostile: true, dmg: 2, life: 200 });
        Sound.sfx("shot_fireball", { x: sx });
      }
    },
    onDeath(e) { bossDefeated(e, true); },
  });
}

// ---- Cinderwyrm: patrols and spits fireball fans; weak to the sword ----
function spawnWyrm(x, y) {
  const e = spawnEnemy("boss_wyrm", x, y, {
    boss: true, hp: 8, dmg: 2, w: 26, h: 22, spawnT: 0,
    vx: 0.5, spitT: 0, t: 90,
    tick(e) {
      e.x += e.vx;
      if (e.x < 48 || e.x > PW - 80) e.vx = -e.vx;
      e.y = 40 + Math.sin(e.anim / 40) * 10;
      e.t--;
      if (e.spitT > 0) e.spitT--;
      if (e.t === 24) Sound.sfx("tell_wyrm", { x: e.x + 13 });
      if (e.t <= 0) {
        e.t = 90 + rngIntU(60);
        e.spitT = 25;
        const sx = e.x + 4, sy = e.y + 12;
        const dx = (P.x + 8) - sx, dy = (P.y + 8) - sy;
        const base = Math.atan2(dy, dx);
        for (const off of [-0.35, 0, 0.35]) {
          spawnProj({ type: "fireball", x: sx, y: sy, vx: Math.cos(base + off) * 1.7, vy: Math.sin(base + off) * 1.7, hostile: true, dmg: 2, life: 220 });
        }
        Sound.sfx("shot_fireball", { x: sx });
      }
    },
    onDeath(e) { bossDefeated(e, true); },
  });
  return e;
}

// ---- Marrowworm: multi-segment; only the glowing tail takes damage ----
function spawnWorm(x, y) {
  // (killEnemy pops a segment 2 semitones higher for each one lost before it; a new tail
  // that starts to glow chimes a moment later)
  const shared = { trail: [], alive: 5, total: 5 };
  const tailGlows = () => { if (shared.alive > 0) Sound.sfx("worm_tail", { delay: 0.3 }); };
  const head = spawnEnemy("worm_head", x, y, {
    boss: true, hp: 2, dmg: 2, w: 12, h: 12, spawnT: 0,
    ang: 0, shared, segIndex: 0,
    guard(e) { return shared.alive > 1; }, // only vulnerable when last alive
    tick(e) {
      e.ang += Math.sin(e.anim / 23) * 0.09 + (Math.random() - 0.5) * 0.06;
      let nx = e.x + Math.cos(e.ang) * 1.3;
      let ny = e.y + Math.sin(e.ang) * 1.3;
      if (nx < 40 || nx > PW - 56) { e.ang = Math.PI - e.ang; nx = e.x; }
      if (ny < 40 || ny > PH - 56) { e.ang = -e.ang; ny = e.y; }
      e.x = nx; e.y = ny;
      shared.trail.unshift([e.x, e.y]);
      if (shared.trail.length > 90) shared.trail.pop();
    },
    onDeath(e) { shared.alive--; if (shared.alive <= 0) bossDefeated(e, true); else tailGlows(); },
  });
  for (let i = 1; i <= 4; i++) {
    spawnEnemy("worm_seg", x, y, {
      boss: true, hp: 2, dmg: 2, w: 10, h: 10, spawnT: 0,
      shared, segIndex: i,
      guard(e) {
        // vulnerable only if it is the highest-index (tail) living segment
        for (const o of G.enemies) {
          if (!o.dead && o.shared === shared && o.segIndex > e.segIndex) return true;
        }
        return false;
      },
      tick(e) {
        const p = shared.trail[e.segIndex * 14];
        if (p) { e.x = p[0]; e.y = p[1]; }
      },
      onDeath(e) { shared.alive--; if (shared.alive <= 0) bossDefeated(e, true); else tailGlows(); },
    });
  }
  return head;
}

// ---- Gazer: invulnerable until its eye opens; arrows only ----
function spawnGazer(x, y) {
  const e = spawnEnemy("boss_gazer", x, y, {
    boss: true, hp: 6, dmg: 2, w: 28, h: 18, spawnT: 0,
    open: false, t: 100, shootT: 0,
    guard(e, dmg, dir, src) { return !(e.open && src === "arrow"); },
    tick(e) {
      e.x = 112 + Math.sin(e.anim / 60) * 40;
      e.y = 40 + Math.cos(e.anim / 47) * 14;
      e.t--;
      if (e.open) {
        e.shootT--;
        if (e.shootT <= 0) {
          e.shootT = 34;
          const sx = e.x + 16, sy = e.y + 12;
          const dx = (P.x + 8) - sx, dy = (P.y + 8) - sy;
          const base = Math.atan2(dy, dx);
          for (const off of [-0.3, 0, 0.3]) {
            // (src: the Gazer's spells stop at the hall's wall; the hexer's fly on)
            spawnProj({ type: "magic", x: sx, y: sy, vx: Math.cos(base + off) * 2.2, vy: Math.sin(base + off) * 2.2, hostile: true, dmg: 2, life: 160, src: "gazer" });
          }
          Sound.sfx("shot_gazer", { x: sx });
        }
        if (e.t <= 0) { e.open = false; e.t = 130; Sound.sfx("eye_close", { x: e.x + 14 }); }
      } else if (e.t <= 0) { e.open = true; e.t = 100; e.shootT = 20; Sound.sfx("eye_open", { x: e.x + 14 }); }
    },
    onDeath(e) { bossDefeated(e, true); },
  });
  return e;
}

// Where Vex takes shape next: a firm tile of the hall at least three tiles (48 px) from
// the hero, so he never appears on top of him (failing that, the farthest firm tile
// tried; failing that, where he stands).
function vexLanding(e) {
  let best = null, bd = -1;
  for (let tries = 0; tries < 20; tries++) {
    const tx = 3 + rngIntU(10), ty = 2 + rngIntU(5);
    if (!standableTile(tileAt(G.tiles, tx, ty))) continue;
    const x = tx * TS - 8, y = ty * TS, d = Math.hypot(x + 13 - (P.x + 8), y + 15 - (P.y + 8));
    if (d >= 48) return [x, y];
    if (d > bd) { bd = d; best = [x, y]; }
  }
  return best || [e.x, e.y];
}

// ---- Vex, the Shadow Tyrant ----
function spawnVex(x, y) {
  const e = spawnEnemy("boss_vex", x, y, {
    boss: true, hp: 18, dmg: 3, w: 22, h: 26, spawnT: 0,
    cloak: 0, t: 60, volley: 0,
    guard(e) { return e.cloak > 0; },
    tick(e) {
      // wounded to half, he fires three bolts at a time and blinks about sooner (and his
      // theme's "rage" layer joins at the next bar)
      const enraged = e.hp <= 9;
      if (enraged && !e.rageHeard) { e.rageHeard = true; Sound.setLayer("rage", true); }
      if (e.cloak > 0) {
        // his warning swells over the 24 ticks before the volley's first bolt
        if (e.volley > 0 && e.cloak + e.t - Math.floor((e.t - 1) / 16) * 16 === 24) Sound.sfx("tell_vex", { x: e.x + 11 });
        e.cloak--; return;
      }
      e.t--;
      if (e.volley > 0 && e.t % 16 === 0) {
        e.volley--;
        const sx = e.x + 12, sy = e.y + 12;
        const dx = (P.x + 8) - sx, dy = (P.y + 8) - sy;
        const base = Math.atan2(dy, dx);
        const offs = enraged ? [-0.25, 0, 0.25] : [0];
        for (const off of offs) {
          spawnProj({ type: "vexbolt", x: sx, y: sy, vx: Math.cos(base + off) * 2.1, vy: Math.sin(base + off) * 2.1, hostile: true, dmg: 2, life: 180 });
        }
        Sound.sfx(enraged ? "shot_vex_rage" : "shot_vex", { x: sx });
      }
      // twelve frames before he blinks away, violet smoke rises where he will take shape
      if (e.t === 12) { e.dest = vexLanding(e); addEffect("poof0", "poof1", e.dest[0] + 5, e.dest[1] + 7, 12); Sound.sfx("vex_cloak", { x: e.dest[0] + 13 }); }
      if (e.t <= 0) {
        // teleport and begin a new volley
        Sound.sfx("vex_blink", { x: e.x + 11 });
        addEffect("poof0", "poof1", e.x + 8, e.y + 8, 14);
        [e.x, e.y] = e.dest || vexLanding(e);
        e.dest = null;
        e.cloak = 22;
        e.t = enraged ? 70 : 110;
        e.volley = enraged ? 4 : 3;
      }
    },
    onDeath(e) {
      bossDefeated(e, false);
      G.flags["vex:dead"] = 1;
    },
  });
  return e;
}
