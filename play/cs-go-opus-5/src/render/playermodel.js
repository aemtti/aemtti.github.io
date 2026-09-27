// playermodel.js — articulated box character, built in game space (Z-up, feet at origin).
import * as THREE from 'three';
import { TEAM } from '../game/constants.js';
import { sprite } from '../world/textures.js';

const BOX = new THREE.BoxGeometry(1, 1, 1);

const PALETTE = {
  [TEAM.T]: {
    cloth: 0x9a7b4a, cloth2: 0x6d5637, vest: 0x4a3c28, skin: 0xb08a63,
    head: 0x2c2c30, accent: 0xd4a04a,
  },
  [TEAM.CT]: {
    cloth: 0x3d5a7d, cloth2: 0x2a3f57, vest: 0x21313f, skin: 0xc39875,
    head: 0x1e2a36, accent: 0x6a9fd8,
  },
};

const matCache = new Map();
function mat(color, shiny = 4) {
  const key = color + ':' + shiny;
  if (!matCache.has(key)) {
    matCache.set(key, new THREE.MeshPhongMaterial({ color, shininess: shiny, specular: 0x101014 }));
  }
  return matCache.get(key);
}

function part(parent, m, sx, sy, sz, x, y, z) {
  const mesh = new THREE.Mesh(BOX, m);
  mesh.scale.set(sx, sy, sz);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * Character rig. Local axes match the game: +X forward, +Y left, +Z up.
 * Total standing height 72 units.
 */
export function createPlayerModel(team) {
  const P = PALETTE[team] || PALETTE[TEAM.CT];
  const root = new THREE.Group();

  const body = new THREE.Group();      // everything above the feet; tips over on death
  root.add(body);

  // torso
  part(body, mat(P.vest), 17, 30, 19, 0, 0, 51);          // chest + vest
  part(body, mat(P.cloth), 15, 27, 10, 0, 0, 39);         // waist
  part(body, mat(P.accent), 18, 31, 3, 0, 0, 43.5);       // team band
  part(body, mat(P.cloth2), 12, 22, 7, -4, 0, 58);        // shoulders/collar

  // head
  const neck = new THREE.Group();
  neck.position.set(0, 0, 60);
  body.add(neck);
  part(neck, mat(P.skin), 12, 12, 7, 1, 0, 4);            // face
  part(neck, mat(P.head), 14, 14, 9, 0, 0, 7);            // helmet / balaclava
  part(neck, mat(0x14161a), 3, 11, 3.5, 6.5, 0, 4.5);     // visor / goggles

  // arms — both point forward holding the weapon
  const armL = new THREE.Group(); armL.position.set(2, 11, 56); body.add(armL);
  const armR = new THREE.Group(); armR.position.set(2, -11, 56); body.add(armR);
  for (const [g, side] of [[armL, 1], [armR, -1]]) {
    part(g, mat(P.cloth), 9, 8, 8, 0, side * 1.5, -3);
    part(g, mat(P.cloth2), 16, 7, 7, 8, side * 2.5, -8);
    part(g, mat(P.skin), 6, 6, 6, 16, side * 3, -10.5);
  }

  // legs
  const legL = new THREE.Group(); legL.position.set(0, 6.5, 34); body.add(legL);
  const legR = new THREE.Group(); legR.position.set(0, -6.5, 34); body.add(legR);
  for (const g of [legL, legR]) {
    part(g, mat(P.cloth), 11, 11, 18, 0, 0, -9);
    part(g, mat(P.cloth2), 10, 10, 16, 0, 0, -25);
    part(g, mat(0x1d1d20), 14, 10, 5, 2, 0, -33.5);
  }

  // held weapon (swapped per weapon class)
  const gun = new THREE.Group();
  gun.position.set(17, 0, 46);
  body.add(gun);
  const gunBody = part(gun, mat(0x24262b, 18), 26, 4, 6, 0, 0, 0);
  const gunMag = part(gun, mat(0x2f3138, 10), 6, 3.5, 8, -1, 0, -6);
  const gunStock = part(gun, mat(0x4a3520, 8), 9, 3.5, 6, -15, 0, -1);

  // teammate marker
  const marker = new THREE.Sprite(new THREE.SpriteMaterial({
    map: sprite('dot'), color: 0x8fe38f, transparent: true, opacity: 0.9,
    depthTest: false, depthWrite: false, fog: false,
  }));
  marker.scale.set(16, 16, 1);
  marker.position.set(0, 0, 88);
  marker.visible = false;
  root.add(marker);

  const state = { cycle: 0, lean: 0, deathT: 0, muzzle: 0 };

  function setWeaponLook(cls) {
    const cfg = {
      rifle: [26, 4, 6, 6, 8, true], ak: [27, 4.4, 6.4, 6, 8, true],
      m4: [26, 4, 6, 6, 8, false], smg: [18, 4, 6, 5, 7, false],
      p90: [20, 5, 8, 4, 5, false], pistol: [11, 3, 6, 3, 4, false],
      deagle: [14, 3.4, 7, 3, 4, false], sniper: [34, 4, 6.5, 5, 6, true],
      awp: [36, 4.2, 7, 5, 6, true], shotgun: [30, 4.5, 7, 4, 5, true],
      knife: [9, 1.6, 3, 0, 0, false], nade: [5, 5, 5, 0, 0, false],
      c4: [8, 6, 5, 0, 0, false],
    }[cls] || [26, 4, 6, 6, 8, true];
    gunBody.scale.set(cfg[0], cfg[1], cfg[2]);
    gunMag.scale.set(Math.max(0.1, cfg[3]), 3.5, Math.max(0.1, cfg[4]));
    gunMag.visible = cfg[3] > 0;
    gunStock.visible = cfg[5];
    gunStock.position.x = -cfg[0] * 0.55;
  }
  setWeaponLook('rifle');

  /** pl: player entity, dt: seconds */
  function update(pl, dt, isTeammate, localTeam) {
    root.position.set(pl.pos.x, pl.pos.y, pl.pos.z);
    root.rotation.z = pl.yaw;

    if (!pl.alive) {
      state.deathT = Math.min(1, state.deathT + dt * 3.2);
      const k = 1 - Math.pow(1 - state.deathT, 3);
      body.rotation.y = k * (Math.PI / 2) * 0.94;
      body.position.z = -k * 4;
      legL.rotation.y = 0.2; legR.rotation.y = -0.2;
      armL.rotation.y = 0.6; armR.rotation.y = 0.6;
      marker.visible = false;
      return;
    }
    state.deathT = 0;
    body.rotation.y = 0;
    body.position.z = 0;

    const sp = Math.hypot(pl.vel.x, pl.vel.y);
    const duck = pl.ducked ? 1 : 0;
    body.scale.z = 1 - duck * 0.26;
    body.position.z = 0;

    if (pl.onGround && sp > 12) {
      state.cycle += dt * (3.2 + sp / 60);
      const s = Math.sin(state.cycle), c = Math.cos(state.cycle * 2);
      const amp = Math.min(1, sp / 220) * 0.72;
      legL.rotation.y = s * amp;
      legR.rotation.y = -s * amp;
      armL.rotation.y = -s * amp * 0.22;
      armR.rotation.y = s * amp * 0.22;
      body.position.z += Math.abs(c) * 1.4 * amp;
      body.rotation.x = Math.sin(state.cycle) * 0.035 * amp;
    } else {
      const relax = Math.exp(-dt * 9);
      legL.rotation.y *= relax; legR.rotation.y *= relax;
      armL.rotation.y *= relax; armR.rotation.y *= relax;
      body.rotation.x *= relax;
      if (!pl.onGround) { legL.rotation.y = 0.34; legR.rotation.y = -0.22; }
    }

    // aim pitch on the upper body
    const pitch = Math.max(-0.9, Math.min(0.9, pl.pitch));
    armL.rotation.y = -pitch + armL.rotation.y * 0.3;
    armR.rotation.y = -pitch + armR.rotation.y * 0.3;
    gun.rotation.y = -pitch;
    gun.position.z = 46 - duck * 8;
    neck.rotation.y = -pitch * 0.55;

    // recoil twitch
    if (state.muzzle > 0) {
      state.muzzle -= dt;
      gun.position.x = 17 - 3 * Math.max(0, state.muzzle / 0.06);
    } else gun.position.x = 17;

    marker.visible = isTeammate && pl.team === localTeam;
    marker.position.z = (pl.ducked ? 66 : 84);
  }

  function kick() { state.muzzle = 0.06; }

  return {
    group: root, update, setWeaponLook, kick,
    dispose() { root.parent && root.parent.remove(root); },
  };
}
