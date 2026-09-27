// debug.js — "Map Inspector": a sandbox mode separate from the match.
//
// Fly through the level as a ghost, or drop into the real player hull and walk,
// with the collision engine's actual state drawn on screen. The aim inspector
// traces the same ray twice — once against the render meshes and once against
// the collision boxes — so geometry that does not match its collision shows up
// as a non-zero delta.
import * as THREE from 'three';
import * as C from '../game/constants.js';
import { Input, takeLook, down, hit, moveAxes } from '../core/input.js';
import { clamp, normAngle, DEG, forwardVec, angleVectors, damp } from '../core/math.js';
import { toThree } from '../render/scene.js';
import { createPlayer, hitboxes } from '../game/player.js';
import { pmove, eyePos, hullBlocked, traceHull } from '../game/physics.js';
import { findPath, smoothPath, landmarkFor } from '../world/nav.js';
import { LANDMARKS, SPAWNS, SITES, BUY_ZONES } from '../world/brushes.js';
import { createPlayerModel } from '../render/playermodel.js';

const SURF_NAME = ['sand', 'concrete', 'wood', 'metal', 'dirt', 'tile'];
const RENDER_MODES = ['textured', 'wireframe', 'untextured', 'normals'];

export class DebugMode {
  constructor(game, scene) {
    this.game = game;
    this.scene = scene;
    this.active = false;

    // ghost camera state
    this.pos = { x: 0, y: -1200, z: 260 };
    this.yaw = Math.PI / 2;
    this.pitch = 0.1;
    this.vel = { x: 0, y: 0, z: 0 };
    this.flySpeed = 900;
    this.ghost = true;

    // a real player entity so walk mode uses the shipping movement code
    this.player = createPlayer({ name: 'inspector', team: C.TEAM.CT });
    this.player.alive = true;
    this.player.cur = 'knife';

    this.dummies = [];
    this.landmarkIdx = 0;
    this.renderMode = 0;
    this.show = {
      boxes: true, nav: false, hulls: true, hitboxes: false,
      panel: true, help: true, sky: true, shadows: true,
    };

    this.aim = null;
    this.path = null;
    this.overlays = new THREE.Group();
    this.overlays.name = 'debug-overlays';
    this.fps = 60;
    this.frameMs = 0;
    this._built = false;
  }

  // ------------------------------------------------------------ lifecycle
  enter() {
    this.active = true;
    if (!this._built) { this.buildOverlays(); this._built = true; }
    this.scene.root.add(this.overlays);
    const s = SPAWNS.CT[2];
    this.pos = { x: s.x, y: s.y, z: s.z + 200 };
    this.yaw = (s.yaw || -90) * DEG;
    this.pitch = 0.25;
    this.vel = { x: 0, y: 0, z: 0 };
    this.syncOverlayVisibility();
    this.applyRenderMode();
    this.scene.vmRoot.visible = false;      // no weapon in the inspector
  }

  exit() {
    this.active = false;
    this.scene.root.remove(this.overlays);
    this.renderMode = 0;
    this.applyRenderMode();
    this.clearDummies();
    this.setPath(null);
    // put anything the toggles touched back the way the game expects it
    this.scene.setShadows(this.game.settings.shadows);
    this.scene.sky.visible = true;
    if (this._fog) { this.scene.scene.fog = this._fog; this._fog = null; }
    this.show.shadows = this.game.settings.shadows;
    this.show.sky = true;
    this.scene.vmRoot.visible = true;
  }

  // ------------------------------------------------------------ overlays
  buildOverlays() {
    const world = this.game.world;

    // --- collision boxes
    const pos = [], col = [];
    const edge = (a, b, c3) => {
      pos.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      col.push(c3[0], c3[1], c3[2], c3[0], c3[1], c3[2]);
    };
    const boxEdges = (b, c3) => {
      const { min, max } = b;
      const v = [
        [min.x, min.y, min.z], [max.x, min.y, min.z], [max.x, max.y, min.z], [min.x, max.y, min.z],
        [min.x, min.y, max.z], [max.x, min.y, max.z], [max.x, max.y, max.z], [min.x, max.y, max.z],
      ];
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]];
      for (const [i, j] of E) edge(v[i], v[j], c3);
    };
    for (const b of world.boxes) {
      boxEdges(b, b.kind === 'prop' ? [1.0, 0.55, 0.15] : [0.25, 0.85, 1.0]);
    }
    const cg = new THREE.BufferGeometry();
    cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    cg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    this.boxLines = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.5, fog: false,
    }));
    this.boxLines.frustumCulled = false;
    this.overlays.add(this.boxLines);

    // --- boxes the hull is currently inside (always drawn on top)
    const hg = new THREE.BufferGeometry();
    hg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24 * 3 * 64), 3));
    hg.setDrawRange(0, 0);
    hg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.hitLines = new THREE.LineSegments(hg, new THREE.LineBasicMaterial({
      color: 0xff3020, depthTest: false, transparent: true, opacity: 0.95, fog: false,
    }));
    this.hitLines.renderOrder = 999;
    this.hitLines.frustumCulled = false;
    this.overlays.add(this.hitLines);

    // --- nav graph
    const np = [], nc = [];
    const nodes = world.nav.nodes;
    for (const n of nodes) {
      for (const l of n.links) {
        if (l.to < n.id) continue;                 // draw each link once
        const o = nodes[l.to];
        const t = clamp(n.z / 128, 0, 1);
        np.push(n.x, n.y, n.z + 6, o.x, o.y, o.z + 6);
        nc.push(0.2 + t * 0.6, 1 - t * 0.4, 0.35, 0.2 + t * 0.6, 1 - t * 0.4, 0.35);
      }
    }
    const ng = new THREE.BufferGeometry();
    ng.setAttribute('position', new THREE.Float32BufferAttribute(np, 3));
    ng.setAttribute('color', new THREE.Float32BufferAttribute(nc, 3));
    this.navLines = new THREE.LineSegments(ng, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0.55, fog: false,
    }));
    this.navLines.frustumCulled = false;
    this.overlays.add(this.navLines);

    // --- A* path preview
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 4096), 3));
    pg.setDrawRange(0, 0);
    pg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e6);
    this.pathLine = new THREE.Line(pg, new THREE.LineBasicMaterial({
      color: 0xffd23a, depthTest: false, fog: false,
    }));
    this.pathLine.renderOrder = 1000;
    this.pathLine.frustumCulled = false;
    this.overlays.add(this.pathLine);

    // --- the player hull, so you can see where collision actually sits
    this.hullBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(C.HULL_HW * 2, C.HULL_HW * 2, C.STAND_H)),
      new THREE.LineBasicMaterial({ color: 0x5ad06a, depthTest: false, fog: false }),
    );
    this.hullBox.renderOrder = 998;
    this.overlays.add(this.hullBox);

    // --- hitbox wireframes for dummies
    this.hitboxGroup = new THREE.Group();
    this.overlays.add(this.hitboxGroup);

    // --- bombsites and buy zones
    const zg = new THREE.Group();
    const zone = (min, max, z, color) => {
      const g = new THREE.BufferGeometry();
      const p = [
        min.x, min.y, z, max.x, min.y, z, max.x, min.y, z, max.x, max.y, z,
        max.x, max.y, z, min.x, max.y, z, min.x, max.y, z, min.x, min.y, z,
      ];
      g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
      zg.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, fog: false })));
    };
    for (const s of SITES) zone(s.min, s.max, s.z + 2, 0xf0a020);
    zone(BUY_ZONES.T.min, BUY_ZONES.T.max, 2, 0xd4a04a);
    zone(BUY_ZONES.CT.min, BUY_ZONES.CT.max, 66, 0x6a9fd8);
    this.zones = zg;
    this.overlays.add(zg);
  }

  syncOverlayVisibility() {
    this.boxLines.visible = this.show.boxes;
    this.hitLines.visible = this.show.boxes;
    this.navLines.visible = this.show.nav;
    this.hullBox.visible = this.show.hulls;
    this.hitboxGroup.visible = this.show.hitboxes;
    this.zones.visible = this.show.boxes;
  }

  applyRenderMode() {
    const mode = RENDER_MODES[this.renderMode];
    for (const mesh of this.game.world.group.children) {
      if (!mesh.isMesh) continue;
      if (!mesh.userData.origMat) mesh.userData.origMat = mesh.material;
      const orig = mesh.userData.origMat;
      orig.wireframe = false;
      if (mode === 'textured') {
        mesh.material = orig;
      } else if (mode === 'wireframe') {
        orig.wireframe = true;
        mesh.material = orig;
      } else if (mode === 'untextured') {
        if (!mesh.userData.flatMat) {
          mesh.userData.flatMat = orig.clone();
          mesh.userData.flatMat.map = null;
        }
        mesh.material = mesh.userData.flatMat;
      } else {
        if (!this._normalMat) this._normalMat = new THREE.MeshNormalMaterial();
        mesh.material = this._normalMat;
      }
      mesh.material.needsUpdate = true;
    }
  }

  // ------------------------------------------------------------ dummies
  spawnDummy() {
    if (!this.aim || this.dummies.length >= 12) return;
    const p = createPlayer({
      name: 'dummy' + (this.dummies.length + 1),
      team: this.dummies.length % 2 ? C.TEAM.CT : C.TEAM.T,
    });
    p.alive = true;
    p.health = 100;
    p.pos.x = this.aim.point.x;
    p.pos.y = this.aim.point.y;
    p.pos.z = this.aim.point.z + 2;
    p.yaw = normAngle(this.yaw + Math.PI);
    p.onGround = true;
    p.model = createPlayerModel(p.team);
    this.scene.root.add(p.model.group);
    this.dummies.push(p);
    this.rebuildHitboxes();
  }

  clearDummies() {
    for (const d of this.dummies) if (d.model) d.model.dispose();
    this.dummies.length = 0;
    this.rebuildHitboxes();
  }

  rebuildHitboxes() {
    while (this.hitboxGroup.children.length) {
      const c = this.hitboxGroup.children.pop();
      c.geometry.dispose();
      this.hitboxGroup.remove(c);
    }
    const colors = [0xff4040, 0xffd23a, 0x40ff80, 0x40a0ff, 0x40a0ff];
    for (const d of this.dummies) {
      for (const hb of hitboxes(d)) {
        const g = new THREE.BoxGeometry(
          hb.max.x - hb.min.x, hb.max.y - hb.min.y, hb.max.z - hb.min.z);
        const e = new THREE.LineSegments(new THREE.EdgesGeometry(g),
          new THREE.LineBasicMaterial({ color: colors[hb.g], depthTest: false, fog: false }));
        e.userData = { owner: d, g: hb.g };
        e.renderOrder = 997;
        this.hitboxGroup.add(e);
        g.dispose();
      }
    }
  }

  updateHitboxes() {
    if (!this.show.hitboxes) return;
    let i = 0;
    for (const d of this.dummies) {
      for (const hb of hitboxes(d)) {
        const e = this.hitboxGroup.children[i++];
        if (!e) return;
        e.position.set((hb.min.x + hb.max.x) / 2, (hb.min.y + hb.max.y) / 2, (hb.min.z + hb.max.z) / 2);
      }
    }
  }

  // ------------------------------------------------------------ input
  handleKeys() {
    if (hit('KeyF')) {
      this.ghost = !this.ghost;
      if (!this.ghost) {
        // drop the player hull in at the ghost position
        const p = this.player;
        p.pos.x = this.pos.x; p.pos.y = this.pos.y; p.pos.z = this.pos.z - C.EYE_STAND;
        p.vel.x = p.vel.y = p.vel.z = 0;
        p.yaw = this.yaw; p.pitch = this.pitch;
        p.ducked = false; p.height = C.STAND_H; p.onGround = false;
      }
    }
    if (hit('KeyB')) { this.show.boxes = !this.show.boxes; this.syncOverlayVisibility(); }
    if (hit('KeyN')) { this.show.nav = !this.show.nav; this.syncOverlayVisibility(); }
    if (hit('KeyV')) { this.show.hulls = !this.show.hulls; this.syncOverlayVisibility(); }
    if (hit('KeyH')) { this.show.hitboxes = !this.show.hitboxes; this.syncOverlayVisibility(); }
    if (hit('KeyM')) {
      this.renderMode = (this.renderMode + 1) % RENDER_MODES.length;
      this.applyRenderMode();
    }
    if (hit('KeyL')) {
      this.show.shadows = !this.show.shadows;
      this.scene.setShadows(this.show.shadows);
    }
    if (hit('KeyK')) {
      this.show.sky = !this.show.sky;
      this.scene.sky.visible = this.show.sky;
      this.scene.scene.fog = this.show.sky ? this._fog || this.scene.scene.fog : null;
      if (this.show.sky && this._fog) this.scene.scene.fog = this._fog;
      else if (!this.show.sky) { this._fog = this.scene.scene.fog; this.scene.scene.fog = null; }
    }
    if (hit('KeyJ')) this.spawnDummy();
    if (hit('KeyX')) this.clearDummies();
    if (hit('KeyI')) this.show.panel = !this.show.panel;
    if (hit('Slash')) this.show.help = !this.show.help;
    if (hit('KeyR')) {
      const s = SPAWNS.CT[2];
      this.teleport({ x: s.x, y: s.y, z: s.z + 80 });
    }
    if (hit('BracketLeft')) this.cycleLandmark(-1);
    if (hit('BracketRight')) this.cycleLandmark(1);
    for (let i = 1; i <= 9; i++) {
      if (hit('Digit' + i) && LANDMARKS[i - 1]) {
        this.landmarkIdx = i - 1;
        this.gotoLandmark();
      }
    }
    if (hit('Digit0') && LANDMARKS[9]) { this.landmarkIdx = 9; this.gotoLandmark(); }

    if (Input.wheel) {
      this.flySpeed = clamp(this.flySpeed * (Input.wheel > 0 ? 0.8 : 1.25), 60, 12000);
    }
    if (Input.mousePressed[0] && this.aim) {
      const n = this.aim.normal;
      this.teleport({
        x: this.aim.point.x + n.x * 40,
        y: this.aim.point.y + n.y * 40,
        z: this.aim.point.z + n.z * 40 + (n.z > 0.5 ? C.EYE_STAND : 0),
      });
    }
    if (Input.mousePressed[2]) this.tracePath();
  }

  teleport(p) {
    this.pos.x = p.x; this.pos.y = p.y; this.pos.z = p.z;
    this.vel.x = this.vel.y = this.vel.z = 0;
    const pl = this.player;
    pl.pos.x = p.x; pl.pos.y = p.y; pl.pos.z = p.z - C.EYE_STAND;
    pl.vel.x = pl.vel.y = pl.vel.z = 0;
  }

  cycleLandmark(dir) {
    this.landmarkIdx = (this.landmarkIdx + dir + LANDMARKS.length) % LANDMARKS.length;
    this.gotoLandmark();
  }

  gotoLandmark() {
    const l = LANDMARKS[this.landmarkIdx];
    const z = this.game.world.floorAt(l.x, l.y);
    this.teleport({ x: l.x, y: l.y, z: (z < -1000 ? 0 : z) + C.EYE_STAND });
  }

  /** A* from where you stand to whatever you are looking at */
  tracePath() {
    if (!this.aim) return this.setPath(null);
    const world = this.game.world;
    const from = world.nav.nodeAt(this.eye().x, this.eye().y);
    const to = world.nav.nodeAt(this.aim.point.x, this.aim.point.y);
    if (from < 0 || to < 0) return this.setPath(null);
    const raw = findPath(world.nav, from, to);
    if (!raw) return this.setPath(null);
    this.setPath(smoothPath(world, world.nav, raw), raw.length);
  }

  setPath(ids, rawLen) {
    if (!ids || !ids.length) {
      this.path = null;
      this.pathLine.geometry.setDrawRange(0, 0);
      return;
    }
    const nodes = this.game.world.nav.nodes;
    const arr = this.pathLine.geometry.attributes.position.array;
    let n = 0;
    for (const id of ids) {
      const nd = nodes[id];
      arr[n * 3] = nd.x; arr[n * 3 + 1] = nd.y; arr[n * 3 + 2] = nd.z + 12;
      n++;
      if (n * 3 >= arr.length) break;
    }
    this.pathLine.geometry.attributes.position.needsUpdate = true;
    this.pathLine.geometry.setDrawRange(0, n);
    this.path = { waypoints: ids.length, rawNodes: rawLen || ids.length };
  }

  // ------------------------------------------------------------ per frame
  eye() {
    return this.ghost
      ? this.pos
      : eyePos(this.player);
  }

  update(dt) {
    const look = takeLook();
    this.yaw = normAngle(this.yaw + look.yaw);
    this.pitch = clamp(this.pitch + look.pitch, -89 * DEG, 89 * DEG);
    this.handleKeys();

    const ax = moveAxes();
    const boost = (down('ShiftLeft') || down('ShiftRight')) ? 4 : 1;
    const slow = (down('AltLeft') || down('AltRight')) ? 0.2 : 1;

    if (this.ghost) {
      const { f, r } = angleVectors(this.yaw, this.pitch);
      let wx = f.x * ax.f + r.x * ax.s;
      let wy = f.y * ax.f + r.y * ax.s;
      let wz = f.z * ax.f;
      if (down('Space')) wz += 1;
      if (down('KeyC')) wz -= 1;
      const l = Math.hypot(wx, wy, wz);
      const spd = this.flySpeed * boost * slow;
      const tgt = l > 1e-4
        ? { x: (wx / l) * spd, y: (wy / l) * spd, z: (wz / l) * spd }
        : { x: 0, y: 0, z: 0 };
      this.vel.x = damp(this.vel.x, tgt.x, 14, dt);
      this.vel.y = damp(this.vel.y, tgt.y, 14, dt);
      this.vel.z = damp(this.vel.z, tgt.z, 14, dt);
      this.pos.x += this.vel.x * dt;
      this.pos.y += this.vel.y * dt;
      this.pos.z += this.vel.z * dt;
      // keep the walk-mode entity under the camera so F drops in cleanly
      this.player.pos.x = this.pos.x;
      this.player.pos.y = this.pos.y;
      this.player.pos.z = this.pos.z - C.EYE_STAND;
    } else {
      const cmd = {
        forward: ax.f, side: ax.s,
        jump: down('Space'),
        duck: down('KeyC'),
        walk: down('ShiftLeft') || down('ShiftRight'),
        yaw: this.yaw,
        speedCap: 250 * slow,
      };
      this.player.yaw = this.yaw;
      this.player.pitch = this.pitch;
      const res = pmove(this.game.world, this.player, cmd, dt, this.dummies);
      this.lastFall = res.fallDamage;
      if (this.player.pos.z < -800) {
        const s = SPAWNS.CT[2];
        this.teleport({ x: s.x, y: s.y, z: s.z + 60 });
      }
    }

    this.updateAim();
    this.updateHullOverlay();
    this.updateHitboxes();
    for (const d of this.dummies) if (d.model) d.model.update(d, dt, false, C.TEAM.NONE);
  }

  /** trace the crosshair against both the render meshes and the collision boxes */
  updateAim() {
    const eye = this.eye();
    const dir = forwardVec(this.yaw, this.pitch);

    // collision-side trace
    let best = 8192, hitBox = null;
    const to = { x: eye.x + dir.x * 8192, y: eye.y + dir.y * 8192, z: eye.z + dir.z * 8192 };
    const boxes = this.game.world.query(
      Math.min(eye.x, to.x) - 2, Math.min(eye.y, to.y) - 2,
      Math.max(eye.x, to.x) + 2, Math.max(eye.y, to.y) + 2);
    for (const b of boxes) {
      let tmin = 0, tmax = Infinity, axis = -1, sgn = 0;
      const lo = [b.min.x, b.min.y, b.min.z], hi = [b.max.x, b.max.y, b.max.z];
      const op = [eye.x, eye.y, eye.z], dp = [dir.x, dir.y, dir.z];
      let ok = true;
      for (let i = 0; i < 3; i++) {
        if (Math.abs(dp[i]) < 1e-9) {
          if (op[i] < lo[i] || op[i] > hi[i]) { ok = false; break; }
          continue;
        }
        const inv = 1 / dp[i];
        let t1 = (lo[i] - op[i]) * inv, t2 = (hi[i] - op[i]) * inv, s = -1;
        if (t1 > t2) { const t = t1; t1 = t2; t2 = t; s = 1; }
        if (t1 > tmin) { tmin = t1; axis = i; sgn = s; }
        if (t2 < tmax) tmax = t2;
        if (tmin > tmax) { ok = false; break; }
      }
      if (!ok || axis < 0 || tmin >= best) continue;
      best = tmin;
      hitBox = b;
      this._axis = axis; this._sgn = sgn;
    }

    // render-side trace, for comparison
    if (!this._ray) this._ray = new THREE.Raycaster();
    this._ray.far = 8192;
    this._ray.set(toThree(eye), toThree(dir).normalize());
    const vis = this._ray.intersectObject(this.game.world.group, true);
    const visHit = vis.length ? vis[0] : null;

    if (!hitBox && !visHit) { this.aim = null; return; }
    const n = { x: 0, y: 0, z: 0 };
    if (hitBox) {
      if (this._axis === 0) n.x = this._sgn;
      else if (this._axis === 1) n.y = this._sgn;
      else n.z = this._sgn;
    }
    this.aim = {
      dist: hitBox ? best : Infinity,
      visDist: visHit ? visHit.distance : Infinity,
      box: hitBox,
      normal: hitBox ? n : { x: 0, y: 0, z: 1 },
      point: hitBox
        ? { x: eye.x + dir.x * best, y: eye.y + dir.y * best, z: eye.z + dir.z * best }
        : { x: visHit.point.x, y: -visHit.point.z, z: visHit.point.y },
      visMesh: visHit ? visHit.object.name : null,
    };
  }

  /**
   * In walk mode this tracks the real hull. In ghost mode it becomes a clearance
   * probe parked at whatever you are aiming at, so you can ask "does a 32x32x72
   * player actually fit here?" without walking over.
   */
  probePos() {
    if (!this.ghost) return { p: this.player.pos, h: this.player.height, own: true };
    if (!this.aim) return null;
    const n = this.aim.normal;
    const x = this.aim.point.x + n.x * (C.HULL_HW + 1);
    const y = this.aim.point.y + n.y * (C.HULL_HW + 1);
    // drop a real hull onto whatever is underneath rather than trusting the grid
    // cell height — on stairs and crates those disagree
    const start = { x, y, z: this.aim.point.z + C.STAND_H };
    const drop = C.STAND_H + 96;
    const tr = traceHull(this.game.world, start, { x: 0, y: 0, z: -drop },
      C.HULL_HW, C.STAND_H, this.dummies, null);
    const z = start.z - drop * (tr.frac >= 1 ? 1 : tr.frac);
    return { p: { x, y, z }, h: C.STAND_H, own: false };
  }

  updateHullOverlay() {
    const probe = this.probePos();
    if (!probe) {
      this.hullBox.visible = false;
      this.hitLines.geometry.setDrawRange(0, 0);
      this.probeBlocked = false;
      return;
    }
    const p = probe.p;
    const h = probe.h;
    // when walking you are standing inside the hull, so drawing it just smears
    // lines across the screen — only show the outline for the detached probe
    this.hullBox.visible = this.show.hulls && !probe.own;
    this.hullBox.scale.set(1, 1, h / C.STAND_H);
    this.hullBox.position.set(p.x, p.y, p.z + h / 2);

    // highlight every collision box the hull overlaps
    const arr = this.hitLines.geometry.attributes.position.array;
    let n = 0;
    if (this.show.boxes) {
      const min = { x: p.x - C.HULL_HW, y: p.y - C.HULL_HW, z: p.z };
      const max = { x: p.x + C.HULL_HW, y: p.y + C.HULL_HW, z: p.z + h };
      const boxes = this.game.world.query(min.x, min.y, max.x, max.y);
      this.overlapCount = 0;
      for (const b of boxes) {
        if (!(min.x < b.max.x && max.x > b.min.x && min.y < b.max.y &&
              max.y > b.min.y && min.z < b.max.z && max.z > b.min.z)) continue;
        this.overlapCount++;
        const v = [
          [b.min.x, b.min.y, b.min.z], [b.max.x, b.min.y, b.min.z],
          [b.max.x, b.max.y, b.min.z], [b.min.x, b.max.y, b.min.z],
          [b.min.x, b.min.y, b.max.z], [b.max.x, b.min.y, b.max.z],
          [b.max.x, b.max.y, b.max.z], [b.min.x, b.max.y, b.max.z]];
        const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7]];
        for (const [i, j] of E) {
          if ((n + 2) * 3 > arr.length) break;
          arr[n * 3] = v[i][0]; arr[n * 3 + 1] = v[i][1]; arr[n * 3 + 2] = v[i][2]; n++;
          arr[n * 3] = v[j][0]; arr[n * 3 + 1] = v[j][1]; arr[n * 3 + 2] = v[j][2]; n++;
        }
      }
    }
    this.hitLines.geometry.attributes.position.needsUpdate = true;
    this.hitLines.geometry.setDrawRange(0, n);
  }

  // ------------------------------------------------------------ presentation
  updateCamera() {
    const eye = this.eye();
    this.scene.setCamera(eye, this.yaw, this.pitch, 0, this.game.settings.fov);
  }

  draw(dt, hud) {
    const g = hud.ctx;
    const W = hud.w, H = hud.h;
    g.clearRect(0, 0, W, H);
    this.fps = this.fps * 0.92 + (1 / Math.max(1e-4, dt)) * 0.08;
    this.frameMs = this.frameMs * 0.92 + dt * 1000 * 0.08;

    // crosshair
    const cx = Math.round(W / 2), cy = Math.round(H / 2);
    g.strokeStyle = 'rgba(0,0,0,.8)'; g.lineWidth = 3;
    this._cross(g, cx, cy);
    g.strokeStyle = '#38e0ff'; g.lineWidth = 1;
    this._cross(g, cx, cy);

    this.updatePanel();
  }

  _cross(g, cx, cy) {
    g.beginPath();
    g.moveTo(cx - 9, cy + 0.5); g.lineTo(cx - 3, cy + 0.5);
    g.moveTo(cx + 3, cy + 0.5); g.lineTo(cx + 9, cy + 0.5);
    g.moveTo(cx + 0.5, cy - 9); g.lineTo(cx + 0.5, cy - 3);
    g.moveTo(cx + 0.5, cy + 3); g.lineTo(cx + 0.5, cy + 9);
    g.stroke();
  }

  updatePanel() {
    const el = document.getElementById('debugtext');
    const help = document.getElementById('debughelp');
    if (!el) return;
    el.parentElement.classList.toggle('hidden', !this.show.panel);
    if (help) help.classList.toggle('hidden', !this.show.help);
    if (!this.show.panel) return;

    const world = this.game.world;
    const eye = this.eye();
    const p = this.ghost
      ? { x: this.pos.x, y: this.pos.y, z: this.pos.z - C.EYE_STAND }
      : this.player.pos;
    const c = world.xToCell(p.x), r = world.yToCell(p.y);
    const floor = world.floorAt(p.x, p.y);
    const surf = world.surfaceAt(p.x, p.y);
    const pl = this.player;
    const num = (v, d = 1) => v.toFixed(d).padStart(9);
    const info = this.scene.stats;         // main pass only, not the viewmodel pass

    let aimTxt = '  (nothing in range)';
    if (this.aim) {
      const b = this.aim.box;
      const d = this.aim.dist, vd = this.aim.visDist;
      const delta = (isFinite(d) && isFinite(vd)) ? Math.abs(d - vd) : NaN;
      aimTxt =
        `  collision  ${isFinite(d) ? d.toFixed(1) + 'u' : '     miss'}` +
        `   render ${isFinite(vd) ? vd.toFixed(1) + 'u' : '   miss'}\n` +
        `  delta      ${isNaN(delta) ? 'n/a' : delta.toFixed(2) + 'u'}` +
        `${!isNaN(delta) && delta > 1.5 ? '   <<< MISMATCH' : ''}\n`;
      if (b) {
        aimTxt +=
          `  kind       ${b.kind}  surface ${SURF_NAME[b.surf] || b.surf}\n` +
          `  box min    ${b.min.x.toFixed(0)}, ${b.min.y.toFixed(0)}, ${b.min.z.toFixed(0)}\n` +
          `  box size   ${(b.max.x - b.min.x).toFixed(0)} x ` +
          `${(b.max.y - b.min.y).toFixed(0)} x ${(b.max.z - b.min.z).toFixed(0)}\n`;
      }
      if (this.aim.visMesh) aimTxt += `  mesh       ${this.aim.visMesh}\n`;
    }

    const probe = this.probePos();
    const blocked = probe
      ? hullBlocked(world, probe.p, C.HULL_HW, probe.h, this.dummies, pl)
      : false;
    const probeLine = !probe
      ? 'probe       (aim at a surface)'
      : this.ghost
        ? `probe       ${blocked ? 'BLOCKED — a player does NOT fit here' : 'clear — a player fits'}` +
          `   overlaps ${this.overlapCount || 0}`
        : `hull        ${blocked ? 'STUCK inside geometry' : 'clear'}` +
          `   overlaps ${this.overlapCount || 0}`;

    el.textContent =
`MAP INSPECTOR — de_sandstorm
mode        ${this.ghost ? 'GHOST (noclip)' : 'WALK (collision on)'}
region      ${landmarkFor(p.x, p.y)}

position   x${num(p.x)}  y${num(p.y)}  z${num(p.z)}
angles      yaw ${(this.yaw / DEG).toFixed(1).padStart(7)}   pitch ${(this.pitch / DEG).toFixed(1).padStart(6)}
cell        col ${String(c).padStart(3)}  row ${String(r).padStart(3)}  ${
  world.isOpenAt(p.x, p.y) ? 'open' : 'SOLID'}
floor z     ${floor < -1000 ? 'n/a (solid)' : floor.toFixed(1)}   surface ${SURF_NAME[surf] || surf}
${probeLine}
${this.ghost
  ? `fly speed   ${this.flySpeed.toFixed(0)} u/s   (wheel to change)`
  : `velocity    ${pl.speed2d.toFixed(1)} u/s 2d   vz ${pl.vel.z.toFixed(1)}
ground      ${pl.onGround ? 'yes' : 'NO (airborne)'}   ducked ${pl.ducked ? 'yes' : 'no'}`}

aim ray
${aimTxt}
render      ${RENDER_MODES[this.renderMode]}   shadows ${this.show.shadows ? 'on' : 'off'}   sky ${this.show.sky ? 'on' : 'off'}
overlays    boxes ${this.show.boxes ? 'on' : 'off'}   nav ${this.show.nav ? 'on' : 'off'}   hull ${
  this.show.hulls ? 'on' : 'off'}   hitboxes ${this.show.hitboxes ? 'on' : 'off'}
world       ${world.boxes.length} collision boxes   ${world.nav.nodes.length} nav nodes
path        ${this.path ? this.path.rawNodes + ' nodes -> ' + this.path.waypoints + ' waypoints' : '-'}
dummies     ${this.dummies.length}
perf        ${this.fps.toFixed(0)} fps   ${this.frameMs.toFixed(1)} ms   ${
  info.calls} draws   ${info.triangles} tris`;
  }
}

export const DEBUG_HELP = `
W A S D / SPACE / C      fly  (SHIFT fast, ALT slow, WHEEL speed)
MOUSE1  teleport to aim      MOUSE2  A* path from here to aim
F  ghost / walk mode         R  reset to CT spawn
B  collision boxes           N  nav graph        V  hull probe (does a player fit?)
H  hitboxes                  M  render mode      L  shadows      K  sky+fog
J  spawn dummy at aim        X  clear dummies
1-9 0  jump to landmark      [ ]  cycle landmarks
I  info panel                /  this help        ESC  back to menu`;
