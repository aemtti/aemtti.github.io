// viewmodel.js — procedural first-person weapon models plus bob / sway / recoil /
// reload animation. Rendered in its own scene so it never clips into walls.
import * as THREE from 'three';
import { rng, clamp, damp } from '../core/math.js';
import { sprite } from '../world/textures.js';

const BOX = new THREE.BoxGeometry(1, 1, 1);
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const SPH = new THREE.SphereGeometry(0.5, 12, 8);

const mats = new Map();
const M = (c, s = 30) => {
  const k = c + '_' + s;
  if (!mats.has(k)) mats.set(k, new THREE.MeshPhongMaterial({ color: c, shininess: s, specular: 0x2a2d33 }));
  return mats.get(k);
};
const GUNMETAL = 0x2b2e34, DARK = 0x191b1e, WOOD = 0x6d4726, TAN = 0x9a8259;
const POLY = 0x33363c, STEEL = 0x6a7078, SKIN = 0xc09070, GLOVE = 0x3a3d42;

function bx(parent, m, sx, sy, sz, x, y, z, rx = 0, ry = 0, rz = 0) {
  const o = new THREE.Mesh(BOX, m);
  o.scale.set(sx, sy, sz); o.position.set(x, y, z); o.rotation.set(rx, ry, rz);
  parent.add(o); return o;
}
function cy(parent, m, r, len, x, y, z, axis = 'z') {
  const o = new THREE.Mesh(CYL, m);
  o.scale.set(r * 2, len, r * 2);
  if (axis === 'z') o.rotation.x = Math.PI / 2;
  else if (axis === 'x') o.rotation.z = Math.PI / 2;
  o.position.set(x, y, z);
  parent.add(o); return o;
}

function hands(g, gripZ, foreZ, foreY = -1.2) {
  bx(g, M(GLOVE, 6), 3.0, 3.4, 3.2, 0.2, -3.0, gripZ);         // trigger hand
  bx(g, M(SKIN, 6), 2.4, 2.2, 2.0, 0.2, -1.4, gripZ + 1.4);
  bx(g, M(GLOVE, 6), 3.0, 3.0, 4.2, -0.3, foreY - 1.6, foreZ); // support hand
  bx(g, M(SKIN, 6), 2.2, 2.0, 2.2, -0.3, foreY, foreZ + 0.6);
}

/** every model points down -Z, origin at the receiver */
function buildModel(kind) {
  const g = new THREE.Group();
  const muzzle = new THREE.Object3D();
  switch (kind) {
    case 'ak': {
      bx(g, M(GUNMETAL), 2.6, 3.6, 15, 0, 0, 0);
      bx(g, M(WOOD, 10), 3.0, 3.0, 7.5, 0, -0.2, -9.5);
      cy(g, M(DARK), 0.55, 13, 0, 0.8, -14);
      bx(g, M(WOOD, 10), 2.6, 3.4, 7.5, 0, -0.6, 10.5);
      bx(g, M(GUNMETAL), 2.2, 6.4, 3.4, 0, -4.2, -1.5, 0.28);
      bx(g, M(DARK), 1.0, 1.6, 1.0, 0, 2.4, -6.0);
      bx(g, M(DARK), 1.0, 1.8, 1.0, 0, 2.4, 5.5);
      muzzle.position.set(0, 0.8, -21);
      hands(g, 2.0, -9.0);
      break;
    }
    case 'm4': {
      bx(g, M(POLY), 2.5, 3.4, 14, 0, 0, 0);
      bx(g, M(DARK), 2.8, 2.8, 9, 0, 0, -10);
      cy(g, M(DARK), 0.5, 12, 0, 0.4, -15);
      bx(g, M(POLY), 2.4, 3.0, 8, 0, -0.4, 10);
      bx(g, M(POLY), 2.0, 6.0, 3.0, 0, -4.0, -1.0, 0.18);
      bx(g, M(DARK), 1.2, 1.4, 12, 0, 2.3, -2);
      muzzle.position.set(0, 0.4, -21.5);
      hands(g, 2.2, -9.5);
      break;
    }
    case 'rifle': {
      bx(g, M(TAN, 12), 2.6, 3.6, 14, 0, 0, 0);
      bx(g, M(DARK), 2.6, 2.6, 8, 0, 0, -9);
      cy(g, M(DARK), 0.5, 11, 0, 0.5, -14);
      bx(g, M(TAN, 12), 2.4, 3.2, 7, 0, -0.4, 9.5);
      bx(g, M(DARK), 2.0, 6.2, 3.0, 0, -4.2, -1.0, 0.22);
      bx(g, M(DARK), 1.0, 1.6, 1.0, 0, 2.4, -5.5);
      muzzle.position.set(0, 0.5, -20);
      hands(g, 2.0, -8.5);
      break;
    }
    case 'smg': {
      bx(g, M(POLY), 2.6, 3.6, 10, 0, 0, 0);
      cy(g, M(DARK), 0.45, 7, 0, 0.4, -8);
      bx(g, M(DARK), 2.2, 5.6, 2.6, 0, -3.8, -0.5, 0.1);
      bx(g, M(DARK), 1.8, 2.4, 5, 0, -0.4, 7, -0.15);
      bx(g, M(DARK), 1.0, 1.4, 1.0, 0, 2.3, -3.5);
      muzzle.position.set(0, 0.4, -12.5);
      hands(g, 1.4, -5.5);
      break;
    }
    case 'p90': {
      bx(g, M(POLY), 3.0, 4.6, 14, 0, -0.4, 0);
      bx(g, M(DARK), 2.6, 1.6, 9, 0, 2.2, -1);
      cy(g, M(DARK), 0.45, 5, 0, 0.2, -9);
      bx(g, M(DARK), 2.2, 3.6, 2.4, 0, -2.6, 1.5);
      muzzle.position.set(0, 0.2, -12.5);
      hands(g, 2.5, -5.0, -2.4);
      break;
    }
    case 'pistol': {
      bx(g, M(GUNMETAL), 2.0, 2.8, 8.5, 0, 0, -1);
      bx(g, M(DARK), 1.6, 1.6, 6, 0, -0.4, -3.5);
      bx(g, M(POLY), 2.0, 5.4, 2.6, 0, -3.6, 2.6, 0.28);
      bx(g, M(DARK), 0.8, 1.0, 0.8, 0, 1.8, -4.6);
      muzzle.position.set(0, 0, -6.0);
      bx(g, M(GLOVE, 6), 3.0, 3.6, 3.4, 0.2, -3.4, 2.6);
      bx(g, M(SKIN, 6), 2.4, 2.2, 2.0, 0.2, -1.6, 3.0);
      break;
    }
    case 'deagle': {
      bx(g, M(STEEL, 60), 2.4, 3.4, 11, 0, 0, -1);
      bx(g, M(DARK), 1.8, 1.8, 8, 0, -0.6, -4);
      bx(g, M(POLY), 2.2, 5.6, 2.8, 0, -4.0, 3.2, 0.3);
      muzzle.position.set(0, 0, -7.5);
      bx(g, M(GLOVE, 6), 3.0, 3.8, 3.6, 0.2, -3.8, 3.2);
      bx(g, M(SKIN, 6), 2.4, 2.2, 2.0, 0.2, -1.8, 3.6);
      break;
    }
    case 'awp':
    case 'sniper': {
      const wood = kind === 'awp' ? 0x2c4a35 : 0x4b4f55;
      bx(g, M(wood, 14), 3.0, 4.0, 20, 0, -0.4, 2);
      cy(g, M(DARK), 0.55, 22, 0, 0.6, -14);
      cy(g, M(DARK), 1.5, 9, 0, 3.4, -3);            // scope tube
      cy(g, M(0x0a0a0c), 1.75, 1.2, 0, 3.4, -7.6);
      bx(g, M(DARK), 1.4, 1.4, 3, 0, 2.0, 1.5);
      bx(g, M(wood, 14), 2.6, 5.2, 8, 0, -1.6, 13);
      bx(g, M(DARK), 2.0, 5.4, 2.6, 0, -3.8, 0.5, 0.16);
      muzzle.position.set(0, 0.6, -25);
      hands(g, 2.0, -10.0);
      break;
    }
    case 'shotgun': {
      bx(g, M(0x4a3a26, 12), 2.8, 3.6, 12, 0, 0, 2);
      cy(g, M(DARK), 0.75, 20, 0, 0.8, -10);
      cy(g, M(GUNMETAL), 0.55, 16, 0, -0.8, -8);
      bx(g, M(0x4a3a26, 12), 2.6, 4.4, 8, 0, -1.2, 12);
      muzzle.position.set(0, 0.8, -20);
      hands(g, 3.0, -8.0, -2.0);
      break;
    }
    case 'knife': {
      bx(g, M(0x1c1e22), 1.6, 2.6, 5, 0, -0.6, 2.5);
      const blade = bx(g, M(0xb9c2cc, 90), 0.5, 2.6, 9, 0, 0.4, -4.5);
      blade.rotation.x = -0.05;
      bx(g, M(0x8c96a2, 90), 0.52, 1.2, 3.4, 0, 1.5, -8.2, -0.2);
      bx(g, M(GLOVE, 6), 3.0, 3.4, 3.4, 0.2, -1.2, 3.0);
      muzzle.position.set(0, 0, -9);
      break;
    }
    case 'nade': {
      const s = new THREE.Mesh(SPH, M(0x3f4a34, 20));
      s.scale.setScalar(5); s.position.set(0, -0.5, 0); g.add(s);
      bx(g, M(0x6a6a60), 1.2, 1.6, 1.2, 0, 2.6, 0);
      bx(g, M(0x8a8a80), 0.6, 0.6, 3.4, 1.2, 2.2, 0.6);
      bx(g, M(GLOVE, 6), 3.4, 4.0, 4.6, 0.6, -2.6, 1.4);
      muzzle.position.set(0, 0, -4);
      break;
    }
    case 'c4': {
      bx(g, M(0x2a2a2e), 5.5, 3.5, 8, 0, -0.5, 0);
      bx(g, M(0xb8a05a), 4.2, 1.2, 6.2, 0, 1.4, 0);
      bx(g, M(0xcc2222), 0.8, 0.8, 0.8, 1.6, 2.2, -2.6);
      bx(g, M(0x1a1a1a), 0.5, 0.5, 6, -1.4, 2.1, 0.5);
      bx(g, M(GLOVE, 6), 3.2, 3.6, 4.0, 0.4, -2.6, 2.0);
      muzzle.position.set(0, 0, -4);
      break;
    }
    default: {
      bx(g, M(GUNMETAL), 2.5, 3.5, 14, 0, 0, 0);
      muzzle.position.set(0, 0, -12);
      hands(g, 2, -8);
    }
  }
  g.add(muzzle);
  g.traverse((o) => { o.castShadow = false; o.receiveShadow = false; });
  return { group: g, muzzle };
}

export class ViewModel {
  constructor(vmRoot) {
    this.root = vmRoot;
    this.holder = new THREE.Group();
    this.holder.position.set(5.2, -4.1, -20);
    this.holder.scale.setScalar(0.60);
    this.baseRot = { x: 0.02, y: -0.10, z: 0 };   // slight profile angle, CS-style
    vmRoot.add(this.holder);
    this.models = new Map();
    this.current = null;
    this.kind = null;

    this.sway = { x: 0, y: 0 };
    this.swayT = { x: 0, y: 0 };
    this.bob = 0;
    this.kick = 0;
    this.kickRot = 0;
    this.lower = 0;          // reload / deploy dip
    this.swing = 0;
    this.hidden = false;

    this.flash = new THREE.Sprite(new THREE.SpriteMaterial({
      map: sprite('flash'), transparent: true, depthWrite: false, depthTest: false,
      blending: THREE.AdditiveBlending, fog: false, opacity: 0,
    }));
    this.flash.scale.set(16, 16, 1);
    vmRoot.add(this.flash);
    this.flashT = 0;

    // brass
    this.shells = [];
    for (let i = 0; i < 10; i++) {
      const s = new THREE.Mesh(BOX, M(0xc9a24b, 60));
      s.scale.set(0.5, 0.5, 1.3);
      s.visible = false;
      vmRoot.add(s);
      this.shells.push({ m: s, t: 0, v: new THREE.Vector3(), rot: new THREE.Vector3() });
    }
    this.shellIdx = 0;
  }

  setWeapon(kind) {
    if (this.kind === kind) return;
    this.kind = kind;
    if (this.current) this.current.group.visible = false;
    if (!this.models.has(kind)) {
      const m = buildModel(kind);
      this.holder.add(m.group);
      this.models.set(kind, m);
    }
    this.current = this.models.get(kind);
    this.current.group.visible = true;
    this.lower = 1;
  }

  onFire(w) {
    const heavy = w.cat === 'sniper' || w.id === 'deagle' || w.cat === 'heavy';
    this.kick = Math.min(3.4, this.kick + (heavy ? 2.4 : 1.05));
    this.kickRot = Math.min(0.42, this.kickRot + (heavy ? 0.30 : 0.10));
    if (!w.silenced) this.flashT = 0.045;
    if (w.cat !== 'knife' && w.cat !== 'nade') this.ejectShell();
  }

  onSwing() { this.swing = 1; }

  ejectShell() {
    const s = this.shells[this.shellIdx];
    this.shellIdx = (this.shellIdx + 1) % this.shells.length;
    const o = this.holder.position;
    s.m.position.set(o.x + 1.2, o.y + 1.6, o.z + 2);
    s.m.visible = true;
    s.t = 0.7;
    s.v.set(9 + rng() * 7, 7 + rng() * 5, 3 + rng() * 4);
    s.rot.set(rng() * 20 - 10, rng() * 20 - 10, rng() * 20 - 10);
  }

  update(dt, pl, opts) {
    const t = opts.time;
    // ---- sway from view movement
    this.swayT.x = clamp(-opts.lookDx * 34, -3.2, 3.2);
    this.swayT.y = clamp(-opts.lookDy * 34, -3.2, 3.2);
    this.sway.x = damp(this.sway.x, this.swayT.x, 9, dt);
    this.sway.y = damp(this.sway.y, this.swayT.y, 9, dt);

    // ---- bob from movement
    const sp = pl ? Math.min(1, pl.speed2d / 250) : 0;
    const grounded = pl ? pl.onGround : true;
    this.bob += dt * (6.0 + sp * 7.5);
    const bobAmt = (opts.bobEnabled ? 1 : 0.25) * sp * (grounded ? 1 : 0.25);
    const bx0 = Math.sin(this.bob) * 0.85 * bobAmt;
    const by0 = Math.abs(Math.cos(this.bob)) * 0.7 * bobAmt;

    // ---- recoil decay
    this.kick = damp(this.kick, 0, 13, dt);
    this.kickRot = damp(this.kickRot, 0, 12, dt);
    this.lower = damp(this.lower, opts.lowerTarget, 10, dt);
    if (this.swing > 0) this.swing = Math.max(0, this.swing - dt * 5.2);

    const swing = this.swing;
    const swingRot = Math.sin(swing * Math.PI) * 1.35;

    this.holder.position.set(
      5.2 + this.sway.x + bx0,
      -4.1 + this.sway.y - by0 - this.lower * 7.5,
      -20 + this.kick,
    );
    this.holder.rotation.set(
      this.baseRot.x - this.kickRot - this.lower * 0.65 - swingRot * 0.55,
      this.baseRot.y + this.sway.x * 0.035 + swingRot * 0.35,
      this.baseRot.z - this.sway.y * 0.02 + swing * 0.4,
    );
    this.holder.visible = !this.hidden;

    // ---- muzzle flash
    if (this.flashT > 0) {
      this.flashT -= dt;
      const m = this.current && this.current.muzzle;
      if (m) {
        m.getWorldPosition(this.flash.position);
        this.flash.material.opacity = Math.max(0, this.flashT / 0.045);
        this.flash.material.rotation = rng() * 6.28;
        this.flash.scale.setScalar(11 + rng() * 9);
        this.flash.visible = !this.hidden;
      }
    } else if (this.flash.material.opacity !== 0) {
      this.flash.material.opacity = 0;
      this.flash.visible = false;
    }

    // ---- shells
    for (const s of this.shells) {
      if (s.t <= 0) { if (s.m.visible) s.m.visible = false; continue; }
      s.t -= dt;
      s.v.y -= 90 * dt;
      s.m.position.addScaledVector(s.v, dt);
      s.m.rotation.x += s.rot.x * dt;
      s.m.rotation.y += s.rot.y * dt;
      s.m.rotation.z += s.rot.z * dt;
      if (s.t <= 0) s.m.visible = false;
    }
    void t;
  }
}

export const VM_KIND = (w) => w.model || 'rifle';
