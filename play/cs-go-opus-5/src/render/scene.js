// scene.js — renderer, camera, sun, sky. The world root is rotated so that all
// gameplay code can stay in Source's Z-up space: three(x,y,z) = game(x, z, -y).
import * as THREE from 'three';
import { skyTexture } from '../world/textures.js';
import { settings } from '../core/settings.js';

export function toThree(v, out) {
  if (out) { out.set(v.x, v.z, -v.y); return out; }
  return new THREE.Vector3(v.x, v.z, -v.y);
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, powerPreference: 'high-performance', stencil: false,
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = settings.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.autoClear = false;
  renderer.setClearColor(0x9fb6c4, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc7c0aa, 2200, 7000);

  const root = new THREE.Object3D();      // Z-up game space lives in here
  root.rotation.x = -Math.PI / 2;
  scene.add(root);

  const camera = new THREE.PerspectiveCamera(settings.fov, 16 / 9, 3, 14000);
  scene.add(camera);

  // ---- lighting ---------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xbcd8f2, 0x8a7355, 0.72);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0xffffff, 0.12);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff0d0, 1.75);
  sun.position.set(-2600, -1800, 3400);      // game coords, inside root
  sun.castShadow = settings.shadows;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 200;
  sun.shadow.camera.far = 7000;
  sun.shadow.bias = -0.0012;
  sun.shadow.normalBias = 2.2;
  const S = 1500;
  sun.shadow.camera.left = -S; sun.shadow.camera.right = S;
  sun.shadow.camera.top = S; sun.shadow.camera.bottom = -S;
  root.add(sun);
  root.add(sun.target);

  // ---- sky --------------------------------------------------------------
  const skyGeo = new THREE.SphereGeometry(9000, 32, 20);
  const skyMat = new THREE.MeshBasicMaterial({
    map: skyTexture(), side: THREE.BackSide, fog: false, depthWrite: false,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.renderOrder = -1000;
  scene.add(sky);

  // ---- viewmodel pass ---------------------------------------------------
  const vmScene = new THREE.Scene();
  const vmCamera = new THREE.PerspectiveCamera(58, 16 / 9, 0.4, 400);
  vmScene.add(new THREE.HemisphereLight(0xdfeaf5, 0x6a655c, 1.45));
  const vmSun = new THREE.DirectionalLight(0xffffff, 1.35);
  vmSun.position.set(-30, 60, 40);
  vmScene.add(vmSun);
  const vmFill = new THREE.DirectionalLight(0x9fb4cc, 0.75);
  vmFill.position.set(40, -20, -30);
  vmScene.add(vmFill);
  const vmRim = new THREE.DirectionalLight(0xffe6c0, 0.6);   // separates the gun from dark walls
  vmRim.position.set(60, 10, 60);
  vmScene.add(vmRim);
  const vmRoot = new THREE.Object3D();
  vmScene.add(vmRoot);

  let W = 1280, H = 720;

  function resize() {
    const w = Math.max(320, window.innerWidth || canvas.clientWidth || 1280);
    const h = Math.max(240, window.innerHeight || canvas.clientHeight || 720);
    W = w; H = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vmCamera.aspect = w / h;
    vmCamera.updateProjectionMatrix();
    return { w, h };
  }

  const _v = new THREE.Vector3();
  /** place the camera from game-space eye position + Source angles */
  function setCamera(eye, yaw, pitch, roll, fov) {
    toThree(eye, camera.position);
    camera.rotation.order = 'YXZ';
    camera.rotation.set(-pitch, yaw - Math.PI / 2, roll || 0);
    if (fov && Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
    sky.position.copy(camera.position);
    // keep the shadow frustum around the player
    const gx = eye.x, gy = eye.y;
    sun.position.set(gx - 2200, gy - 1500, 2900);
    sun.target.position.set(gx, gy, 0);
    sun.target.updateMatrixWorld();
    void _v;
  }

  // main-pass counters, captured before the viewmodel pass resets renderer.info
  const stats = { calls: 0, triangles: 0 };

  function render() {
    renderer.clear();
    renderer.render(scene, camera);
    stats.calls = renderer.info.render.calls;
    stats.triangles = renderer.info.render.triangles;
    renderer.clearDepth();
    renderer.render(vmScene, vmCamera);
  }

  function setShadows(on) {
    renderer.shadowMap.enabled = on;
    sun.castShadow = on;
    scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
  }

  return {
    renderer, scene, camera, root, sun, hemi, ambient, sky, stats,
    vmScene, vmCamera, vmRoot,
    resize, setCamera, render, setShadows,
    get width() { return W; },
    get height() { return H; },
  };
}
