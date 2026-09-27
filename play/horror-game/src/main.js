import * as THREE from 'three';
import eventBus from './EventBus.js';
import InputManager from './InputManager.js';
import PlayerController from './PlayerController.js';
import CollisionManager from './utils/CollisionManager.js';
import MapBuilder from './MapBuilder.js';
import DebugMode from './DebugMode.js';
import Game from './Game.js';
import TouchControls from './TouchControls.js';

/**
 * main.js — Entry point.
 * Creates the Three.js renderer, scene, camera, instantiates all systems,
 * and hands them to Game to start the loop.
 */

// ── Renderer ────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.8;
document.getElementById('game-container').appendChild(renderer.domElement);

// ── Scene ───────────────────────────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x050508, 0.06);

// ── Camera ──────────────────────────────────────────────
const camera = new THREE.PerspectiveCamera(
    70,                                      // FOV
    window.innerWidth / window.innerHeight,  // aspect
    0.1,                                     // near
    100                                      // far
);

// ── Systems ─────────────────────────────────────────────
const inputManager = new InputManager(renderer.domElement);
const collisionManager = new CollisionManager();
const mapBuilder = new MapBuilder(scene, collisionManager);
const playerController = new PlayerController(camera, inputManager, collisionManager);
const debugMode = new DebugMode(scene, renderer, camera);

// ── Light units ─────────────────────────────────────────
// The map's light values were authored for three.js legacy light units (r154 and earlier: point/spot decay 1,
// intensities effectively ×π). This page loads r170 (physical units), where the same numbers render almost
// black. Convert the map's lights once, right after the map is built, so the level looks as designed.
// (Debug lights are created later with their own values and are left alone.)
const buildFromJSON = mapBuilder.buildFromJSON.bind(mapBuilder);
mapBuilder.buildFromJSON = async (url) => {
    const result = await buildFromJSON(url);
    scene.traverse((o) => {
        if (!o.isLight || o.userData.legacyUnits) return;
        o.userData.legacyUnits = true;
        if (o.isPointLight || o.isSpotLight) o.decay = 1;
        o.intensity *= Math.PI;
    });
    return result;
};

// ── Game ────────────────────────────────────────────────
const game = new Game({
    renderer,
    scene,
    camera,
    inputManager,
    playerController,
    mapBuilder,
    debugMode,
});

game.start();

// ── Touch controls (phones/tablets only — nothing appears on desktop) ──
new TouchControls(inputManager);

// Read-only handle for headless checks (touch-port tests read camera/state through it).
window.__horror = { game, camera, inputManager, playerController, renderer };

// ── Start screen toggle ─────────────────────────────────
const startScreen = document.getElementById('start-screen');
eventBus.on('input:pointerLock', ({ locked }) => {
    startScreen.style.display = locked ? 'none' : 'flex';
});

// ── Window resize ───────────────────────────────────────
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
