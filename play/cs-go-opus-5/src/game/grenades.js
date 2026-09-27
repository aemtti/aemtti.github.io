// grenades.js — HE / flashbang / smoke. Smoke clouds really do block line of sight,
// for the player's eyes and for the bots' vision checks alike.
import * as THREE from 'three';
import { traceHull, eyePos } from './physics.js';
import { angleVectors, clamp, distPointSeg, rng, vnorm } from '../core/math.js';
import { traceClear } from '../world/nav.js';
import { applyDamage } from './combat.js';
import * as C from './constants.js';
import * as A from '../core/audio.js';

const FUSE = { he: 1.6, flash: 1.55, smoke: 1.5 };
const SMOKE_RADIUS = 170;
const SMOKE_LIFE = 15;
const SMOKE_FADE = 3.2;

const GEO = new THREE.SphereGeometry(4.2, 10, 8);
const MATS = {
  he: new THREE.MeshPhongMaterial({ color: 0x3f4a34, shininess: 24 }),
  flash: new THREE.MeshPhongMaterial({ color: 0x6a6f78, shininess: 60 }),
  smoke: new THREE.MeshPhongMaterial({ color: 0x8a7f4a, shininess: 24 }),
};

export class GrenadeSystem {
  constructor(game) {
    this.game = game;
    this.list = [];
    this.clouds = [];
  }

  throwNade(pl, type, power = 1) {
    const game = this.game;
    const eye = eyePos(pl);
    const { f, r, u } = angleVectors(pl.yaw, pl.pitch - 0.13);
    const speed = power > 0.6 ? 760 : 340;
    const g = {
      type,
      pos: { x: eye.x + f.x * 18, y: eye.y + f.y * 18, z: eye.z + f.z * 18 - 4 },
      vel: {
        x: f.x * speed + pl.vel.x * 0.6 + r.x * 0,
        y: f.y * speed + pl.vel.y * 0.6,
        z: f.z * speed + pl.vel.z * 0.4 + 60,
      },
      fuse: FUSE[type],
      owner: pl,
      team: pl.team,
      mesh: new THREE.Mesh(GEO, MATS[type] || MATS.he),
      spin: { x: rng.gauss() * 8, y: rng.gauss() * 8, z: rng.gauss() * 8 },
      rest: 0,
    };
    g.mesh.castShadow = true;
    game.scene.root.add(g.mesh);
    this.list.push(g);
    A.whoosh(eye, 0.25, 0.25);
    void u;
    return g;
  }

  update(dt) {
    const game = this.game;
    const world = game.world;
    for (let i = this.list.length - 1; i >= 0; i--) {
      const g = this.list[i];
      g.fuse -= dt;

      // integrate with bounces
      g.vel.z -= C.GRAVITY * 0.92 * dt;
      let remaining = dt;
      for (let it = 0; it < 3 && remaining > 1e-4; it++) {
        const delta = { x: g.vel.x * remaining, y: g.vel.y * remaining, z: g.vel.z * remaining };
        const tr = traceHull(world, g.pos, delta, 4, 8, game.players, g.owner);
        g.pos.x += delta.x * tr.frac;
        g.pos.y += delta.y * tr.frac;
        g.pos.z += delta.z * tr.frac;
        if (tr.frac >= 1) { remaining = 0; break; }
        const n = { x: tr.nx, y: tr.ny, z: tr.nz };
        const dot = g.vel.x * n.x + g.vel.y * n.y + g.vel.z * n.z;
        const rest = g.type === 'smoke' ? 0.28 : 0.42;
        g.vel.x = (g.vel.x - 2 * dot * n.x) * rest;
        g.vel.y = (g.vel.y - 2 * dot * n.y) * rest;
        g.vel.z = (g.vel.z - 2 * dot * n.z) * rest;
        // tangential friction
        g.vel.x *= 0.86; g.vel.y *= 0.86;
        const sp = Math.hypot(g.vel.x, g.vel.y, g.vel.z);
        if (sp > 60) A.click(g.pos, 1400, 0.05, clamp(sp / 900, 0.05, 0.35), 2.5);
        remaining -= remaining * tr.frac;
        if (sp < 26) { g.vel.x = g.vel.y = g.vel.z = 0; break; }
      }

      g.mesh.position.set(g.pos.x, g.pos.y, g.pos.z + 4);
      g.mesh.rotation.x += g.spin.x * dt;
      g.mesh.rotation.y += g.spin.y * dt;

      if (g.fuse <= 0) {
        this.detonate(g);
        game.scene.root.remove(g.mesh);
        this.list.splice(i, 1);
      }
    }

    // smoke clouds
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.t += dt;
      let alpha, grow;
      if (c.t < 1.4) { alpha = c.t / 1.4; grow = 0.45 + 0.55 * (c.t / 1.4); }
      else if (c.t < SMOKE_LIFE) { alpha = 1; grow = 1; }
      else { alpha = Math.max(0, 1 - (c.t - SMOKE_LIFE) / SMOKE_FADE); grow = 1 + (1 - alpha) * 0.15; }
      c.alpha = alpha;
      c.radius = SMOKE_RADIUS * grow;
      c.active = alpha > 0.35;
      this.game.fx.updateSmoke(c.visual, alpha * 0.92, grow, dt);
      if (c.t > SMOKE_LIFE + SMOKE_FADE) {
        this.game.fx.removeSmoke(c.visual);
        this.clouds.splice(i, 1);
      }
    }
  }

  detonate(g) {
    const game = this.game;
    const pos = { x: g.pos.x, y: g.pos.y, z: g.pos.z + 4 };
    if (g.type === 'he') {
      A.explosion(pos, 0.8);
      game.fx.explosion(pos, 0.9);
      game.shakeAt(pos, 500, 2.2);
      for (const p of game.players) {
        if (!p.alive) continue;
        const eye = { x: p.pos.x, y: p.pos.y, z: p.pos.z + p.height * 0.55 };
        const d = Math.hypot(eye.x - pos.x, eye.y - pos.y, eye.z - pos.z);
        if (d > 420) continue;
        if (!traceClear(game.world, pos, eye)) continue;
        const falloff = Math.pow(1 - d / 420, 1.35);
        const dmg = 98 * falloff;
        if (dmg < 1) continue;
        const dir = vnorm({ x: eye.x - pos.x, y: eye.y - pos.y, z: eye.z - pos.z });
        applyDamage(game, p, g.owner, dmg, C.HITGROUP.STOMACH, 'he', eye, dir);
      }
      game.noise(g.owner, 2600, 'explosion', pos);
    } else if (g.type === 'flash') {
      A.flashPop(pos);
      game.fx.flashPop(pos);
      for (const p of game.players) {
        if (!p.alive) continue;
        const eye = eyePos(p);
        const d = Math.hypot(eye.x - pos.x, eye.y - pos.y, eye.z - pos.z);
        if (d > 1600) continue;
        if (!traceClear(game.world, pos, eye)) continue;
        // how much of the flash is in view
        const dir = vnorm({ x: pos.x - eye.x, y: pos.y - eye.y, z: pos.z - eye.z });
        const look = angleVectors(p.yaw, p.pitch).f;
        const dot = dir.x * look.x + dir.y * look.y + dir.z * look.z;
        if (dot < -0.1) continue;
        const facing = clamp((dot + 0.1) / 1.1, 0, 1);
        const prox = clamp(1 - d / 1600, 0, 1);
        const amount = Math.pow(facing, 0.8) * Math.pow(prox, 0.55);
        if (amount < 0.12) continue;
        const dur = 0.45 + amount * 4.2;
        if (amount > p.flashAmount) {
          p.flashAmount = Math.min(1.35, amount * 1.35);
          p.flashDecay = 1 / dur;
        }
        if (p === game.localPlayer && amount > 0.3) A.deafen(Math.min(3.4, dur), 380);
      }
      game.noise(g.owner, 2200, 'explosion', pos);
    } else if (g.type === 'smoke') {
      A.hiss(pos, 3.6);
      const visual = game.fx.spawnSmoke({ x: pos.x, y: pos.y, z: pos.z }, SMOKE_RADIUS);
      this.clouds.push({
        pos: { x: pos.x, y: pos.y, z: pos.z + 40 },
        radius: SMOKE_RADIUS * 0.5, t: 0, alpha: 0, active: false, visual,
        team: g.team,
      });
      game.noise(g.owner, 900, 'smoke', pos);
    }
  }

  /** does any active smoke cloud cut the segment a->b ? */
  blocksLOS(a, b) {
    for (const c of this.clouds) {
      if (!c.active) continue;
      const d = distPointSeg(c.pos, a, b);
      if (d < c.radius * 0.86) return true;
    }
    return false;
  }

  /** true when the point is inside smoke (used to blur the player's own view) */
  insideSmoke(p) {
    for (const c of this.clouds) {
      if (!c.active) continue;
      const d = Math.hypot(c.pos.x - p.x, c.pos.y - p.y, (c.pos.z - p.z) * 0.9);
      if (d < c.radius * 0.8) return true;
    }
    return false;
  }

  clear() {
    for (const g of this.list) this.game.scene.root.remove(g.mesh);
    this.list.length = 0;
    for (const c of this.clouds) this.game.fx.removeSmoke(c.visual);
    this.clouds.length = 0;
  }
}
