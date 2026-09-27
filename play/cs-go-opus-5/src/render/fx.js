// fx.js — tracers, impact sparks, decals, blood, muzzle flashes, smoke and explosions.
// Particles live in two batched Points systems (additive + alpha) so this stays cheap.
import * as THREE from 'three';
import { sprite } from '../world/textures.js';
import { rng } from '../core/math.js';

const MAX_PARTS = 900;
const MAX_TRACERS = 64;
const MAX_DECALS = 140;

const PARTICLE_VS = `
attribute float size;
attribute float alpha;
varying vec3 vColor;
varying float vAlpha;
uniform float uScale;
void main() {
  vColor = color;
  vAlpha = alpha;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = max(1.0, size * uScale / max(1.0, -mv.z));
  gl_Position = projectionMatrix * mv;
}`;

const PARTICLE_FS_ADD = `
uniform sampler2D map;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 t = texture2D(map, gl_PointCoord);
  gl_FragColor = vec4(vColor * t.rgb * t.a * vAlpha, 1.0);
}`;

const PARTICLE_FS_ALPHA = `
uniform sampler2D map;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec4 t = texture2D(map, gl_PointCoord);
  float a = t.a * vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor * t.rgb, a);
}`;

function makePoints(texName, additive) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_PARTS * 3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_PARTS * 3), 3));
  geo.setAttribute('size', new THREE.BufferAttribute(new Float32Array(MAX_PARTS), 1));
  geo.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(MAX_PARTS), 1));
  geo.setDrawRange(0, 0);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
  const mat = new THREE.ShaderMaterial({
    uniforms: { map: { value: sprite(texName) }, uScale: { value: 600 } },
    vertexShader: PARTICLE_VS,
    fragmentShader: additive ? PARTICLE_FS_ADD : PARTICLE_FS_ALPHA,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return pts;
}

export class FX {
  constructor(root, sceneCtl) {
    this.root = root;
    this.ctl = sceneCtl;
    this.time = 0;
    this.onLocalAttack = null;

    this.addPts = makePoints('spark', true);
    this.alphaPts = makePoints('dot', false);
    root.add(this.addPts); root.add(this.alphaPts);
    this.addList = [];
    this.alphaList = [];

    // ---- tracers: one batched LineSegments, colour fades to black (additive)
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRACERS * 6), 3));
    tg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_TRACERS * 6), 3));
    tg.setDrawRange(0, 0);
    tg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.tracerGeo = tg;
    this.tracerMesh = new THREE.LineSegments(tg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, depthWrite: false,
      blending: THREE.AdditiveBlending, fog: false,
    }));
    this.tracerMesh.frustumCulled = false;
    root.add(this.tracerMesh);
    this.tracers = [];

    // ---- decals
    this.decalGeo = new THREE.PlaneGeometry(1, 1);
    this.decalMats = {
      bullet: new THREE.MeshBasicMaterial({
        map: sprite('bullet'), transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -6, fog: true,
      }),
      blood: new THREE.MeshBasicMaterial({
        map: sprite('blood'), transparent: true, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -6, fog: true,
      }),
    };
    this.decals = [];
    this.decalIdx = 0;

    // ---- world muzzle flash sprites (for other players)
    this.flashPool = [];
    for (let i = 0; i < 8; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite('flash'), transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending, fog: false, opacity: 0,
      }));
      m.visible = false;
      m.scale.set(46, 46, 1);
      root.add(m);
      this.flashPool.push({ spr: m, t: 0 });
    }
    this.flashIdx = 0;

    this.smokes = [];
  }

  setViewportScale(height, fovDeg) {
    const s = height / (2 * Math.tan((fovDeg * Math.PI / 180) / 2));
    this.addPts.material.uniforms.uScale.value = s;
    this.alphaPts.material.uniforms.uScale.value = s;
  }

  // ------------------------------------------------------------ particles
  _spawn(list, p) {
    if (list.length >= MAX_PARTS) list.shift();
    list.push(p);
  }

  particle(list, x, y, z, vx, vy, vz, size, life, r, g, b, grav, drag, fade) {
    this._spawn(list, {
      x, y, z, vx, vy, vz, size, life, max: life, r, g, b,
      grav: grav ?? 800, drag: drag ?? 0.6, fade: fade ?? 1, size0: size,
    });
  }

  impact(point, normal, surf) {
    const n = normal || { x: 0, y: 0, z: 1 };
    const spark = surf === 3 ? 10 : 5;
    for (let i = 0; i < spark; i++) {
      const sp = 120 + rng() * 420;
      const vx = n.x * sp + rng.gauss() * 130;
      const vy = n.y * sp + rng.gauss() * 130;
      const vz = n.z * sp + rng.gauss() * 130 + 60;
      const warm = surf === 3 ? 1 : 0.75;
      this.particle(this.addList, point.x + n.x, point.y + n.y, point.z + n.z,
        vx, vy, vz, 2.2 + rng() * 2.4, 0.18 + rng() * 0.3,
        1 * warm, (0.72 + rng() * 0.25) * warm, 0.32 * warm, 900, 1.4, 1);
    }
    // dust puff in the surface colour
    const tint = surf === 0 || surf === 4 ? [0.78, 0.68, 0.5] : [0.66, 0.65, 0.62];
    for (let i = 0; i < 4; i++) {
      this.particle(this.alphaList, point.x + n.x * 2, point.y + n.y * 2, point.z + n.z * 2,
        n.x * 40 + rng.gauss() * 40, n.y * 40 + rng.gauss() * 40, n.z * 40 + rng.gauss() * 40 + 25,
        9 + rng() * 12, 0.4 + rng() * 0.4, tint[0], tint[1], tint[2], 60, 1.6, 0.55);
    }
    this.decal('bullet', point, n, 9 + rng() * 5);
  }

  blood(point, dir) {
    for (let i = 0; i < 12; i++) {
      this.particle(this.alphaList, point.x, point.y, point.z,
        (dir ? dir.x * 90 : 0) + rng.gauss() * 130,
        (dir ? dir.y * 90 : 0) + rng.gauss() * 130,
        (dir ? dir.z * 90 : 0) + rng.gauss() * 110 + 40,
        3 + rng() * 5, 0.35 + rng() * 0.4, 0.55 + rng() * 0.2, 0.03, 0.03, 900, 0.9, 1);
    }
    const mist = 3;
    for (let i = 0; i < mist; i++) {
      this.particle(this.alphaList, point.x, point.y, point.z,
        rng.gauss() * 40, rng.gauss() * 40, rng.gauss() * 30,
        14 + rng() * 12, 0.5, 0.42, 0.02, 0.02, 30, 2.0, 0.5);
    }
  }

  /** blood pool under a corpse */
  bloodPool(pos, z) {
    this.decal('blood', { x: pos.x, y: pos.y, z: z + 1.2 }, { x: 0, y: 0, z: 1 }, 46 + rng() * 26);
  }

  decal(kind, point, n, size) {
    let d = this.decals[this.decalIdx];
    if (!d) {
      d = new THREE.Mesh(this.decalGeo, this.decalMats[kind]);
      this.decals[this.decalIdx] = d;
      this.root.add(d);
    }
    d.material = this.decalMats[kind];
    d.visible = true;
    d.scale.set(size, size, 1);
    d.position.set(point.x + n.x * 0.8, point.y + n.y * 0.8, point.z + n.z * 0.8);
    d.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(n.x, n.y, n.z));
    d.rotateZ(rng() * Math.PI * 2);
    this.decalIdx = (this.decalIdx + 1) % MAX_DECALS;
  }

  tracer(from, to, local) {
    if (this.tracers.length >= MAX_TRACERS) this.tracers.shift();
    // start the tracer a little ahead of the muzzle so it does not fill the screen
    const dx = to.x - from.x, dy = to.y - from.y, dz = to.z - from.z;
    const len = Math.hypot(dx, dy, dz) || 1;
    const off = local ? 90 : 20;
    const f = Math.min(0.85, off / len);
    this.tracers.push({
      x0: from.x + dx * f, y0: from.y + dy * f, z0: from.z + dz * f,
      x1: to.x, y1: to.y, z1: to.z, t: 0, life: 0.07 + rng() * 0.03,
    });
  }

  /** world-space flash for third-person shooters; the local player gets the
   *  viewmodel flash instead, which would otherwise blind them */
  muzzle(pl, w, isLocal) {
    if (w.silenced || isLocal) return;
    const f = { x: Math.cos(pl.yaw), y: Math.sin(pl.yaw), z: 0 };
    const p = {
      x: pl.pos.x + f.x * 26, y: pl.pos.y + f.y * 26,
      z: pl.pos.z + (pl.ducked ? 40 : 55),
    };
    const item = this.flashPool[this.flashIdx];
    this.flashIdx = (this.flashIdx + 1) % this.flashPool.length;
    item.spr.position.set(p.x, p.y, p.z);
    item.spr.material.rotation = rng() * 6.28;
    item.spr.scale.setScalar(34 + rng() * 22);
    item.spr.visible = true;
    item.t = 0.055;
    // smoke wisp
    this.particle(this.alphaList, p.x, p.y, p.z, f.x * 60, f.y * 60, 30,
      6, 0.35, 0.62, 0.6, 0.58, -20, 1.8, 0.45);
  }

  knifeSwing(pl) {
    if (this.onLocalAttack) this.onLocalAttack(pl);
  }

  explosion(pos, power = 1) {
    for (let i = 0; i < 46; i++) {
      const a = rng() * Math.PI * 2, e = rng() * Math.PI - Math.PI / 2;
      const sp = (240 + rng() * 900) * power;
      this.particle(this.addList, pos.x, pos.y, pos.z,
        Math.cos(a) * Math.cos(e) * sp, Math.sin(a) * Math.cos(e) * sp, Math.sin(e) * sp + 200,
        4 + rng() * 7, 0.28 + rng() * 0.4, 1, 0.66 + rng() * 0.3, 0.24, 700, 1.1, 1);
    }
    for (let i = 0; i < 26; i++) {
      const a = rng() * Math.PI * 2;
      const sp = (60 + rng() * 260) * power;
      this.particle(this.alphaList, pos.x, pos.y, pos.z,
        Math.cos(a) * sp, Math.sin(a) * sp, rng() * 180 + 40,
        30 + rng() * 46, 0.9 + rng() * 0.9, 0.28, 0.26, 0.25, 12, 1.5, 0.7);
    }
    this.decal('bullet', { x: pos.x, y: pos.y, z: pos.z }, { x: 0, y: 0, z: 1 }, 120 * power);
  }

  flashPop(pos) {
    for (let i = 0; i < 30; i++) {
      const a = rng() * Math.PI * 2, e = rng() * Math.PI - Math.PI / 2;
      const sp = 300 + rng() * 700;
      this.particle(this.addList, pos.x, pos.y, pos.z,
        Math.cos(a) * Math.cos(e) * sp, Math.sin(a) * Math.cos(e) * sp, Math.sin(e) * sp,
        3 + rng() * 5, 0.18 + rng() * 0.2, 1, 1, 0.92, 500, 1.6, 1);
    }
  }

  // ------------------------------------------------------------ smoke cloud
  spawnSmoke(pos, radius = 165) {
    const group = new THREE.Group();
    group.position.set(pos.x, pos.y, pos.z + 8);
    const puffs = [];
    for (let i = 0; i < 38; i++) {
      const m = new THREE.Sprite(new THREE.SpriteMaterial({
        map: sprite('smoke'), transparent: true, depthWrite: false, opacity: 0,
        color: new THREE.Color(0.86 + rng() * 0.12, 0.86 + rng() * 0.1, 0.85 + rng() * 0.1),
      }));
      // point in a ball, then shrink the puffs near the rim so the silhouette
      // rounds off instead of reading as a slab
      const a = rng() * Math.PI * 2;
      const el = Math.acos(2 * rng() - 1) - Math.PI / 2;
      const t = Math.pow(rng(), 0.5);
      const rr = t * radius * 0.58;
      m.position.set(
        Math.cos(a) * Math.cos(el) * rr,
        Math.sin(a) * Math.cos(el) * rr,
        Math.max(-radius * 0.4, Math.sin(el) * rr * 0.85 + radius * 0.14),
      );
      m.material.rotation = rng() * 6.28;
      // big overlapping puffs, tapering at the rim so the ball still reads round
      const sc = radius * (1.05 - t * 0.28) * (0.86 + rng() * 0.3);
      m.scale.set(sc, sc, 1);
      m.userData = { sc, spin: rng.gauss() * 0.2, base: m.position.clone() };
      group.add(m);
      puffs.push(m);
    }
    this.root.add(group);
    const cloud = { group, puffs, radius, t: 0, alpha: 0, dead: false };
    this.smokes.push(cloud);
    return cloud;
  }

  updateSmoke(cloud, alpha, grow, dt) {
    cloud.alpha = alpha;
    for (const p of cloud.puffs) {
      p.material.opacity = alpha * (0.82 + 0.16 * Math.sin(cloud.t * 0.7 + p.userData.spin * 10));
      p.material.rotation += p.userData.spin * dt;
      const s = p.userData.sc * grow;
      p.scale.set(s, s, 1);
      p.position.z = p.userData.base.z * grow + Math.sin(cloud.t * 0.6 + p.userData.spin * 6) * 3;
    }
    cloud.t += dt;
  }

  removeSmoke(cloud) {
    this.root.remove(cloud.group);
    for (const p of cloud.puffs) p.material.dispose();
    const i = this.smokes.indexOf(cloud);
    if (i >= 0) this.smokes.splice(i, 1);
  }

  // ------------------------------------------------------------ per frame
  update(dt) {
    this.time += dt;

    for (const list of [this.addList, this.alphaList]) {
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.life -= dt;
        if (p.life <= 0) { list.splice(i, 1); continue; }
        const drag = Math.exp(-p.drag * dt);
        p.vx *= drag; p.vy *= drag; p.vz *= drag;
        p.vz -= p.grav * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      }
    }
    this._writePoints(this.addPts, this.addList);
    this._writePoints(this.alphaPts, this.alphaList);

    // tracers
    const tp = this.tracerGeo.attributes.position.array;
    const tc = this.tracerGeo.attributes.color.array;
    let n = 0;
    for (let i = this.tracers.length - 1; i >= 0; i--) {
      const t = this.tracers[i];
      t.t += dt;
      if (t.t >= t.life) { this.tracers.splice(i, 1); continue; }
      const k = 1 - t.t / t.life;
      const o = n * 6;
      tp[o] = t.x0; tp[o + 1] = t.y0; tp[o + 2] = t.z0;
      tp[o + 3] = t.x1; tp[o + 4] = t.y1; tp[o + 5] = t.z1;
      const a = k * 0.85;
      tc[o] = 1.0 * a * 0.35; tc[o + 1] = 0.85 * a * 0.35; tc[o + 2] = 0.5 * a * 0.35;
      tc[o + 3] = 1.0 * a; tc[o + 4] = 0.9 * a; tc[o + 5] = 0.6 * a;
      n++;
    }
    this.tracerGeo.attributes.position.needsUpdate = true;
    this.tracerGeo.attributes.color.needsUpdate = true;
    this.tracerGeo.setDrawRange(0, n * 2);

    // muzzle flash sprites
    for (const f of this.flashPool) {
      if (f.t > 0) {
        f.t -= dt;
        f.spr.material.opacity = Math.max(0, f.t / 0.055);
        if (f.t <= 0) { f.spr.visible = false; f.spr.material.opacity = 0; }
      }
    }
  }

  _writePoints(pts, list) {
    const g = pts.geometry;
    const pos = g.attributes.position.array;
    const col = g.attributes.color.array;
    const siz = g.attributes.size.array;
    const alp = g.attributes.alpha.array;
    const n = Math.min(list.length, MAX_PARTS);
    for (let i = 0; i < n; i++) {
      const p = list[i];
      pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      col[i * 3] = p.r; col[i * 3 + 1] = p.g; col[i * 3 + 2] = p.b;
      const k = p.life / p.max;
      siz[i] = p.size0 * (p.fade < 1 ? (2 - k) : 1);
      alp[i] = p.fade >= 1 ? k : Math.min(1, k * 2) * p.fade;
    }
    g.attributes.position.needsUpdate = true;
    g.attributes.color.needsUpdate = true;
    g.attributes.size.needsUpdate = true;
    g.attributes.alpha.needsUpdate = true;
    g.setDrawRange(0, n);
  }

  clearRound() {
    this.addList.length = 0;
    this.alphaList.length = 0;
    this.tracers.length = 0;
    for (const d of this.decals) if (d) d.visible = false;
    for (const c of [...this.smokes]) this.removeSmoke(c);
  }
}
