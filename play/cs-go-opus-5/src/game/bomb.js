// bomb.js — the C4: carry, drop, plant, defuse, detonate.
import * as THREE from 'three';
import * as C from './constants.js';
import { SITES } from '../world/brushes.js';
import { pointInAabb2d, clamp, vnorm } from '../core/math.js';
import { applyDamage } from './combat.js';
import * as A from '../core/audio.js';

const BOMB_GEO = new THREE.BoxGeometry(14, 10, 6);
const LED_GEO = new THREE.SphereGeometry(1.6, 8, 6);

export class Bomb {
  constructor(game) {
    this.game = game;
    this.state = 'none';         // none | carried | dropped | planted | exploded | defused
    this.carrier = null;
    this.pos = { x: 0, y: 0, z: 0 };
    this.timer = C.BOMB_TIMER;
    this.plantProgress = 0;
    this.defuseProgress = 0;
    this.defuser = null;
    this.planter = null;
    this.site = null;
    this.beepAt = 0;
    this.mesh = new THREE.Mesh(BOMB_GEO, new THREE.MeshPhongMaterial({ color: 0x2b2b30, shininess: 20 }));
    this.led = new THREE.Mesh(LED_GEO, new THREE.MeshBasicMaterial({ color: 0xff2020 }));
    this.mesh.add(this.led);
    this.led.position.set(4, 0, 4);
    this.mesh.castShadow = true;
    this.mesh.visible = false;
    game.scene.root.add(this.mesh);
  }

  reset() {
    this.state = 'none';
    this.carrier = null;
    this.timer = C.BOMB_TIMER;
    this.plantProgress = 0;
    this.defuseProgress = 0;
    this.defuser = null;
    this.planter = null;
    this.site = null;
    this.mesh.visible = false;
  }

  giveTo(pl) {
    this.state = 'carried';
    this.carrier = pl;
    pl.inv.c4 = true;
    this.mesh.visible = false;
  }

  dropAt(pos) {
    if (this.state !== 'carried') return;
    if (this.carrier) this.carrier.inv.c4 = false;
    this.carrier = null;
    this.state = 'dropped';
    const z = this.game.world.floorAt(pos.x, pos.y);
    this.pos = { x: pos.x, y: pos.y, z: (z < -1000 ? pos.z : z) + 4 };
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(0, 0, Math.random() * 6.28);
    this.mesh.visible = true;
  }

  pickUp(pl) {
    if (this.state !== 'dropped' || pl.team !== C.TEAM.T || !pl.alive) return false;
    const d = Math.hypot(pl.pos.x - this.pos.x, pl.pos.y - this.pos.y, pl.pos.z + 30 - this.pos.z);
    if (d > 70) return false;
    this.giveTo(pl);
    if (pl === this.game.localPlayer) A.SFX.pickup();
    this.game.hud.log(`${pl.name} picked up the bomb`);
    return true;
  }

  siteAt(x, y) {
    for (const s of SITES) if (pointInAabb2d({ x, y }, { min: s.min, max: s.max })) return s;
    return null;
  }

  canPlant(pl) {
    return this.state === 'carried' && this.carrier === pl && pl.alive && pl.onGround &&
      !!this.siteAt(pl.pos.x, pl.pos.y) && this.game.match.state === 'live';
  }

  canDefuse(pl) {
    if (this.state !== 'planted' || pl.team !== C.TEAM.CT || !pl.alive || !pl.onGround) return false;
    const d = Math.hypot(pl.pos.x - this.pos.x, pl.pos.y - this.pos.y);
    return d < 68 && Math.abs(pl.pos.z - this.pos.z) < 72;
  }

  /** returns 'planting' | 'planted' | null */
  updatePlant(pl, holding, dt) {
    if (!this.canPlant(pl)) { if (pl.planting) { pl.planting = false; pl.plantProgress = 0; } return null; }
    if (!holding) {
      if (pl.planting) { pl.planting = false; pl.plantProgress = 0; }
      return null;
    }
    if (Math.hypot(pl.vel.x, pl.vel.y) > 30) { pl.plantProgress = 0; return 'planting'; }
    pl.planting = true;
    pl.plantProgress += dt / C.PLANT_TIME;
    if (Math.floor(pl.plantProgress * 8) !== Math.floor((pl.plantProgress - dt / C.PLANT_TIME) * 8)) {
      A.click(pl.pos, 2100, 0.04, 0.3, 6);
    }
    if (pl.plantProgress >= 1) {
      this.plant(pl);
      return 'planted';
    }
    return 'planting';
  }

  plant(pl) {
    this.state = 'planted';
    this.planter = pl;
    this.carrier = null;
    pl.inv.c4 = false;
    pl.planting = false;
    pl.plantProgress = 0;
    const z = this.game.world.floorAt(pl.pos.x, pl.pos.y);
    this.pos = { x: pl.pos.x, y: pl.pos.y, z: (z < -1000 ? pl.pos.z : z) + 3.5 };
    this.site = this.siteAt(this.pos.x, this.pos.y);
    this.timer = C.BOMB_TIMER;
    this.beepAt = 0;
    this.mesh.position.set(this.pos.x, this.pos.y, this.pos.z);
    this.mesh.rotation.set(0, 0, pl.yaw);
    this.mesh.visible = true;
    this.game.onBombPlanted(pl, this.site);
    if (pl.cur === 'c4') this.game.switchToBest(pl);
  }

  updateDefuse(pl, holding, dt) {
    if (!this.canDefuse(pl) || !holding) {
      if (this.defuser === pl) { this.defuser = null; this.defuseProgress = 0; }
      if (pl.defusing) { pl.defusing = false; pl.defuseProgress = 0; }
      return null;
    }
    if (Math.hypot(pl.vel.x, pl.vel.y) > 30) { this.defuseProgress = 0; pl.defuseProgress = 0; return 'defusing'; }
    if (this.defuser && this.defuser !== pl && this.defuser.alive) return null;
    this.defuser = pl;
    pl.defusing = true;
    const time = pl.hasKit ? C.DEFUSE_TIME_KIT : C.DEFUSE_TIME;
    this.defuseProgress += dt / time;
    pl.defuseProgress = this.defuseProgress;
    if (this.defuseProgress >= 1) {
      this.defuse(pl);
      return 'defused';
    }
    return 'defusing';
  }

  defuse(pl) {
    this.state = 'defused';
    this.mesh.visible = false;
    pl.defusing = false;
    pl.defuseProgress = 0;
    A.SFX.defused();
    this.game.onBombDefused(pl);
  }

  explode() {
    if (this.state !== 'planted') return;
    this.state = 'exploded';
    this.mesh.visible = false;
    const game = this.game;
    A.explosion(this.pos, 1.6);
    game.fx.explosion(this.pos, 2.4);
    game.shakeAt(this.pos, 2400, 6);
    for (const p of game.players) {
      if (!p.alive) continue;
      const eye = { x: p.pos.x, y: p.pos.y, z: p.pos.z + p.height * 0.5 };
      const d = Math.hypot(eye.x - this.pos.x, eye.y - this.pos.y, eye.z - this.pos.z);
      if (d > C.BOMB_RADIUS * 1.6) continue;
      const dmg = C.BOMB_DAMAGE * Math.pow(clamp(1 - d / (C.BOMB_RADIUS * 1.6), 0, 1), 1.2);
      if (dmg < 1) continue;
      const dir = vnorm({ x: eye.x - this.pos.x, y: eye.y - this.pos.y, z: eye.z - this.pos.z });
      applyDamage(game, p, this.planter, dmg, C.HITGROUP.STOMACH, null, eye, dir);
    }
    game.onBombExploded();
  }

  update(dt) {
    if (this.state === 'planted') {
      this.timer -= dt;
      // accelerating beep
      this.beepAt -= dt;
      if (this.beepAt <= 0) {
        const frac = clamp(this.timer / C.BOMB_TIMER, 0, 1);
        const interval = 0.12 + frac * frac * 0.95;
        this.beepAt = interval;
        A.beep(this.pos, 1500 + (1 - frac) * 1400, 0.05, 0.55);
        this.led.material.color.setHex(0xff3020);
      } else if (this.beepAt < 0.06) {
        this.led.material.color.setHex(0x400000);
      }
      this.led.visible = Math.sin(performance.now() * 0.02) > -0.4;
      if (this.timer <= 0) this.explode();
    } else if (this.state === 'carried' && this.carrier) {
      this.mesh.visible = false;
    }
  }
}
