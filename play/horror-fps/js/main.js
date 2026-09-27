// ============================================
// HORROR FPS - Phase 5: Audio System
// Added: Programmatic audio using Web Audio API
// ============================================

// --- ES MODULE IMPORTS ---
import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { setupTouch } from './touch-controls.js';

// --- AUDIO SYSTEM ---
// Web Audio API context (created on first user interaction)
let audioContext = null;
let masterGain = null;
let ambientGain = null;
let ambientOscillators = [];
let audioInitialized = false;

// Initialize audio context (must be called after user interaction)
function initAudio() {
    if (audioInitialized) return;

    audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Master volume control
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioContext.destination);

    // Separate gain for ambient sounds
    ambientGain = audioContext.createGain();
    ambientGain.gain.value = 0.3;
    ambientGain.connect(masterGain);

    audioInitialized = true;
    console.log('Audio system initialized');

    // Start ambient drone
    startAmbientDrone();

    // Start random sounds timer
    scheduleRandomSound();
}

// --- AMBIENT DRONE ---
// Creates a low, ominous background hum
function startAmbientDrone() {
    if (!audioContext) return;

    // Base drone - low frequency oscillator
    const droneOsc = audioContext.createOscillator();
    droneOsc.type = 'sine';
    droneOsc.frequency.value = 55; // Low A

    const droneGain = audioContext.createGain();
    droneGain.gain.value = 0.15;

    // Add slight wobble to the drone
    const lfo = audioContext.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Very slow wobble
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(droneOsc.frequency);
    lfo.start();

    droneOsc.connect(droneGain);
    droneGain.connect(ambientGain);
    droneOsc.start();

    // Second layer - slightly dissonant
    const droneOsc2 = audioContext.createOscillator();
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.value = 82.5; // Slightly off from harmonic

    const droneGain2 = audioContext.createGain();
    droneGain2.gain.value = 0.08;

    droneOsc2.connect(droneGain2);
    droneGain2.connect(ambientGain);
    droneOsc2.start();

    // Third layer - filtered noise for texture
    const noiseBuffer = createNoiseBuffer(2);
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 200;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.05;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ambientGain);
    noiseSource.start();

    ambientOscillators.push(droneOsc, droneOsc2, lfo, noiseSource);
}

// Create a buffer of white noise
function createNoiseBuffer(duration) {
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

// --- FOOTSTEP SOUNDS ---
let lastFootstepTime = 0;
const footstepInterval = 350; // ms between footsteps

function playFootstep() {
    if (!audioContext) return;

    const now = Date.now();
    if (now - lastFootstepTime < footstepInterval) return;
    lastFootstepTime = now;

    // Short burst of filtered noise
    const buffer = createNoiseBuffer(0.1);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter for "thump" sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 150 + Math.random() * 50; // Slight variation
    filter.Q.value = 1;

    // Quick envelope
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    source.stop(audioContext.currentTime + 0.1);
}

// --- KEY PICKUP SOUND ---
function playKeyPickup() {
    if (!audioContext) return;

    // Metallic ping - two detuned oscillators
    const osc1 = audioContext.createOscillator();
    const osc2 = audioContext.createOscillator();
    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.value = 1200;
    osc2.frequency.value = 1205; // Slight detune for shimmer

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();
    osc1.stop(audioContext.currentTime + 0.5);
    osc2.stop(audioContext.currentTime + 0.5);

    // Add a lower "clink"
    const osc3 = audioContext.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = 800;

    const gain2 = audioContext.createGain();
    gain2.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc3.connect(gain2);
    gain2.connect(masterGain);
    osc3.start();
    osc3.stop(audioContext.currentTime + 0.3);
}

// --- DOOR SOUNDS ---
function playDoorLocked() {
    if (!audioContext) return;

    // Rattle sound - short bursts of noise
    for (let i = 0; i < 3; i++) {
        const delay = i * 0.08;

        const buffer = createNoiseBuffer(0.05);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 2;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0, audioContext.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + delay + 0.05);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        source.start(audioContext.currentTime + delay);
        source.stop(audioContext.currentTime + delay + 0.05);
    }

    // Low thud
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.2);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 0.2);
}

function playDoorOpen() {
    if (!audioContext) return;

    // Creaking sound - frequency sweep with noise
    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(80, audioContext.currentTime + 0.8);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 5;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.15, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 0.8);

    // Add some noise texture
    const buffer = createNoiseBuffer(0.8);
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = buffer;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 1;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.05, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();
    noiseSource.stop(audioContext.currentTime + 0.8);
}

// --- RANDOM DISTANT SOUNDS ---
const randomSounds = [
    playDistantCreak,
    playDistantThud,
    playDistantWhisper,
    playMetalClang,
    playDistantMoan
];

function scheduleRandomSound() {
    if (!audioContext) return;

    // Random interval between 5-15 seconds
    const delay = 5000 + Math.random() * 10000;

    setTimeout(() => {
        if (audioContext && document.visibilityState === 'visible') {
            // Pick a random sound
            const soundFn = randomSounds[Math.floor(Math.random() * randomSounds.length)];
            soundFn();
        }
        scheduleRandomSound(); // Schedule next random sound
    }, delay);
}

function playDistantCreak() {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200 + Math.random() * 100, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(100 + Math.random() * 50, audioContext.currentTime + 0.4);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 600;
    filter.Q.value = 3;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 0.4);
}

function playDistantThud() {
    if (!audioContext) return;

    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, audioContext.currentTime + 0.3);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.2, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 0.3);
}

function playDistantWhisper() {
    if (!audioContext) return;

    // Filtered noise that sounds like whispering
    const buffer = createNoiseBuffer(1.5);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1500;
    filter.Q.value = 0.5;

    // Tremolo effect
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = 8;
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 0.03;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 0.3);
    gain.gain.linearRampToValueAtTime(0.06, audioContext.currentTime + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    lfo.start();
    lfo.stop(audioContext.currentTime + 1.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    source.stop(audioContext.currentTime + 1.5);
}

function playMetalClang() {
    if (!audioContext) return;

    // Metallic ping
    const frequencies = [440, 880, 1320, 1760];
    frequencies.forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq * (0.9 + Math.random() * 0.2);

        const gain = audioContext.createGain();
        const volume = 0.08 / (i + 1);
        gain.gain.setValueAtTime(volume, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioContext.currentTime + 0.8);
    });
}

function playDistantMoan() {
    if (!audioContext) return;

    // Low, eerie moan
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(120, audioContext.currentTime + 1.0);
    osc.frequency.linearRampToValueAtTime(140, audioContext.currentTime + 2.0);

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 2.0);
}

// --- SCENE SETUP ---
// The scene is the container for all 3D objects
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000); // Pure black background

// --- CAMERA SETUP ---
// PerspectiveCamera(field of view, aspect ratio, near clip, far clip)
// - FOV 75 gives a nice wide view typical for FPS games
// - Near/far clip determines what distance range is visible
const camera = new THREE.PerspectiveCamera(
    75,                                     // FOV in degrees
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1,                                    // Near clipping plane
    1000                                    // Far clipping plane
);

// Position the camera at player eye height (1.6 units ≈ human eye level)
// Y is up in Three.js - start at one end of the hallway
camera.position.set(0, 1.6, 18); // x, y, z - near the back of the hallway

// --- RENDERER SETUP ---
// The renderer draws the scene to the screen
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Crisp on high-DPI screens (capped at 2 for phones)
document.body.appendChild(renderer.domElement);  // Add canvas to page

// --- POINTER LOCK CONTROLS (Mouse Look) ---
// PointerLockControls locks the mouse cursor and uses movement for camera rotation
const controls = new PointerLockControls(camera, document.body);

// Get the overlay element
const overlay = document.getElementById('overlay');

// Touch screens (no pointer lock): on-screen stick, drag-to-look and buttons
const touch = setupTouch({ controls, camera, overlay });

// Click overlay to start (locks the pointer; a tap starts touch play instead)
overlay.addEventListener('click', () => {
    if (touch.startIfTouch()) return;
    // same as controls.lock(), but a refused request (e.g. a click right after ESC) is not an error
    const request = document.body.requestPointerLock();
    if (request && request.catch) request.catch(() => {});
});

// When pointer is locked, hide the overlay and start audio
controls.addEventListener('lock', () => {
    overlay.classList.add('hidden');
    initAudio(); // Initialize audio on first user interaction
    console.log('Controls locked - move mouse to look around');
});

// When pointer is unlocked (ESC pressed), show the overlay
controls.addEventListener('unlock', () => {
    overlay.classList.remove('hidden');
    console.log('Controls unlocked - click to resume');
});

// --- KEYBOARD CONTROLS (WASD Movement) ---
// Track which keys are currently pressed
const keysPressed = {
    forward: false,   // W
    backward: false,  // S
    left: false,      // A
    right: false      // D
};

// Movement speed (units per second)
const moveSpeed = 5.0;

// Listen for key presses
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            keysPressed.forward = true;
            break;
        case 'KeyS':
            keysPressed.backward = true;
            break;
        case 'KeyA':
            keysPressed.left = true;
            break;
        case 'KeyD':
            keysPressed.right = true;
            break;
    }
});

// Listen for key releases
document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            keysPressed.forward = false;
            break;
        case 'KeyS':
            keysPressed.backward = false;
            break;
        case 'KeyA':
            keysPressed.left = false;
            break;
        case 'KeyD':
            keysPressed.right = false;
            break;
    }
});

// --- LIGHTING (Horror atmosphere - very dark) ---
// Minimal ambient light - just enough to see vague shapes in the darkness
const ambientLight = new THREE.AmbientLight(0x111111, 0.3);
scene.add(ambientLight);

// --- FLASHLIGHT ---
// SpotLight attached to camera - player's main light source
const flashlight = new THREE.SpotLight(
    0xffffee,   // Slightly warm white color
    3.0,        // Intensity (bright enough to see far)
    80,         // Distance (reaches end of 40-unit hallway)
    Math.PI / 6, // Angle (~30 degrees, slightly wider cone)
    0.4,        // Penumbra (soft edge, 0-1)
    1.0         // Decay (lower = less falloff over distance)
);

// Flashlight state
let flashlightOn = true;

// Attach flashlight to camera so it moves and points with the player
camera.add(flashlight);
flashlight.position.set(0, 0, 0); // At camera position
flashlight.target.position.set(0, 0, -1); // Point forward
camera.add(flashlight.target); // Target must also be added to camera

// Add camera to scene (required for attached lights to work)
scene.add(camera);

// Toggle flashlight function
function toggleFlashlight() {
    flashlightOn = !flashlightOn;
    flashlight.visible = flashlightOn;
    console.log('Flashlight:', flashlightOn ? 'ON' : 'OFF');
}

// F key to toggle flashlight
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyF') {
        toggleFlashlight();
    }
});

// Left mouse click to toggle flashlight (only when controls are locked)
document.addEventListener('mousedown', (event) => {
    if (event.button === 0 && controls.isLocked && !touch.active) { // Left click (touch play has a LIGHT button)
        toggleFlashlight();
    }
});

// --- HALLWAY GEOMETRY ---
// Dimensions for a long, narrow corridor (horror feel)
const HALLWAY_WIDTH = 6;    // X axis (narrow)
const HALLWAY_LENGTH = 40;  // Z axis (long)
const HALLWAY_HEIGHT = 3.5; // Y axis (slightly claustrophobic)

// Materials - muted colors that look good under flashlight
const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d3d3d,  // Dark gray concrete floor
    roughness: 0.95
});

const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,  // Darker ceiling
    roughness: 1.0
});

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a4a4a,  // Gray walls
    roughness: 0.9
});

// --- FLOOR ---
const floorGeometry = new THREE.PlaneGeometry(HALLWAY_WIDTH, HALLWAY_LENGTH);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2; // Lay flat
floor.position.set(0, 0, 0);     // Ground level, centered
scene.add(floor);

// --- CEILING ---
const ceilingGeometry = new THREE.PlaneGeometry(HALLWAY_WIDTH, HALLWAY_LENGTH);
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2; // Face downward
ceiling.position.set(0, HALLWAY_HEIGHT, 0);
scene.add(ceiling);

// --- LEFT WALL (negative X) ---
const sideWallGeometry = new THREE.PlaneGeometry(HALLWAY_LENGTH, HALLWAY_HEIGHT);
const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
leftWall.rotation.y = Math.PI / 2; // Face inward (toward +X)
leftWall.position.set(-HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, 0);
scene.add(leftWall);

// --- RIGHT WALL (positive X) ---
const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
rightWall.rotation.y = -Math.PI / 2; // Face inward (toward -X)
rightWall.position.set(HALLWAY_WIDTH / 2, HALLWAY_HEIGHT / 2, 0);
scene.add(rightWall);

// --- BACK WALL (positive Z - where player starts) ---
const endWallGeometry = new THREE.PlaneGeometry(HALLWAY_WIDTH, HALLWAY_HEIGHT);
const backWall = new THREE.Mesh(endWallGeometry, wallMaterial);
backWall.rotation.y = Math.PI; // Face inward (toward -Z)
backWall.position.set(0, HALLWAY_HEIGHT / 2, HALLWAY_LENGTH / 2);
scene.add(backWall);

// --- FRONT WALL (negative Z - far end of hallway) ---
const frontWall = new THREE.Mesh(endWallGeometry, wallMaterial);
// No rotation needed - default faces +Z which is toward player
frontWall.position.set(0, HALLWAY_HEIGHT / 2, -HALLWAY_LENGTH / 2);
scene.add(frontWall);

// --- KEY OBJECT ---
// A glowing key placed somewhere in the hallway
const keyGroup = new THREE.Group();

// Key body (cylinder)
const keyBodyGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
const keyMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd700,      // Gold color
    emissive: 0xffa500,   // Orange glow
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
});
const keyBody = new THREE.Mesh(keyBodyGeometry, keyMaterial);
keyBody.rotation.z = Math.PI / 2; // Lay horizontal
keyGroup.add(keyBody);

// Key head (torus)
const keyHeadGeometry = new THREE.TorusGeometry(0.08, 0.02, 8, 16);
const keyHead = new THREE.Mesh(keyHeadGeometry, keyMaterial);
keyHead.position.x = -0.15;
keyHead.rotation.y = Math.PI / 2;
keyGroup.add(keyHead);

// Key teeth (small boxes)
const toothGeometry = new THREE.BoxGeometry(0.03, 0.06, 0.02);
for (let i = 0; i < 3; i++) {
    const tooth = new THREE.Mesh(toothGeometry, keyMaterial);
    tooth.position.set(0.08 + i * 0.04, -0.04, 0);
    keyGroup.add(tooth);
}

// Position key in the middle of the hallway, on the floor
keyGroup.position.set(1.5, 0.3, -5); // Slightly off-center, near floor
keyGroup.userData.type = 'key'; // Tag for interaction detection
scene.add(keyGroup);

// Add a point light to make the key more visible
const keyLight = new THREE.PointLight(0xffd700, 0.5, 5);
keyLight.position.copy(keyGroup.position);
scene.add(keyLight);

// --- EXIT DOOR ---
// Door at the far end of the hallway (in front wall)
const doorWidth = 1.2;
const doorHeight = 2.5;

// Door frame (slightly larger than door, darker)
const doorFrameGeometry = new THREE.BoxGeometry(doorWidth + 0.2, doorHeight + 0.1, 0.15);
const doorFrameMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a1a0a, // Dark brown
    roughness: 0.9
});
const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
doorFrame.position.set(0, doorHeight / 2, -HALLWAY_LENGTH / 2 + 0.05);
scene.add(doorFrame);

// Door itself
const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, 0.1);
const doorMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a3020, // Brown wood color
    roughness: 0.8
});
const door = new THREE.Mesh(doorGeometry, doorMaterial);
door.position.set(0, doorHeight / 2, -HALLWAY_LENGTH / 2 + 0.1);
door.userData.type = 'door'; // Tag for interaction detection
scene.add(door);

// Door handle
const handleGeometry = new THREE.SphereGeometry(0.06, 8, 8);
const handleMaterial = new THREE.MeshStandardMaterial({
    color: 0xccaa00,
    metalness: 0.9,
    roughness: 0.3
});
const doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
doorHandle.position.set(0.4, doorHeight / 2, -HALLWAY_LENGTH / 2 + 0.2);
scene.add(doorHandle);

// --- JUMPSCARE SYSTEM ---
const scareFlashEl = document.getElementById('scare-flash');

// Jumpscare state
let scare1Triggered = false;

// --- STEP COUNTER (for Scare 2) ---
let stepCount = 0;
let lastStepCountTime = 0;
const STEP_COUNT_INTERVAL = 350; // Same as footstep interval

// Generate pseudo-random trigger points at game start
// These are step counts where scare 2 will trigger
function generateScareSteps(seed) {
    // Simple seeded random number generator
    const random = () => {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return seed / 0x7fffffff;
    };

    // Generate 5 trigger points between steps 50-400
    const triggers = [];
    const baseSteps = [50, 120, 200, 280, 350];

    for (let i = 0; i < 5; i++) {
        // Add some randomness to each base value (+/- 20 steps)
        const variation = Math.floor(random() * 40) - 20;
        triggers.push(baseSteps[i] + variation);
    }

    return triggers.sort((a, b) => a - b);
}

// Initialize with current timestamp as seed (different each playthrough)
const scareTriggerSteps = generateScareSteps(Date.now());
let scareStepIndex = 0; // Which trigger point we're waiting for
console.log('Scare trigger steps:', scareTriggerSteps);

// Increment step counter (called when player walks)
function incrementStepCount() {
    const now = Date.now();
    if (now - lastStepCountTime < STEP_COUNT_INTERVAL) return;
    lastStepCountTime = now;
    stepCount++;
}

// --- JUMPSCARE SOUNDS ---
function playScareSound1() {
    if (!audioContext) return;

    // Loud, sudden dissonant chord
    const frequencies = [100, 150, 200, 280, 400];
    frequencies.forEach((freq) => {
        const osc = audioContext.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.4, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioContext.currentTime + 0.8);
    });

    // Add distorted noise burst
    const buffer = createNoiseBuffer(0.3);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(400);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.5, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    source.connect(distortion);
    distortion.connect(gain);
    gain.connect(masterGain);
    source.start();
    source.stop(audioContext.currentTime + 0.3);
}

function playScareSound2() {
    if (!audioContext) return;

    // Eerie whoosh/whisper
    const buffer = createNoiseBuffer(1.5);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(500, audioContext.currentTime + 1.5);
    filter.Q.value = 2;

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.2);
    gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    source.start();
    source.stop(audioContext.currentTime + 1.5);

    // Low rumble
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 40;

    const oscGain = audioContext.createGain();
    oscGain.gain.setValueAtTime(0.2, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);

    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 1.5);
}

// Distortion curve for harsh sounds
function makeDistortionCurve(amount) {
    const samples = 44100;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((Math.PI + amount) * x) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

// --- SCREEN EFFECTS ---
function flashScreen(color, duration = 150) {
    scareFlashEl.className = `flash-${color}`;
    setTimeout(() => {
        scareFlashEl.classList.add('fade-out');
        setTimeout(() => {
            scareFlashEl.className = '';
        }, 300);
    }, duration);
}

// Screen shake effect
let originalCameraY = 1.6;
function shakeScreen(intensity = 0.1, duration = 300) {
    const startTime = Date.now();
    const shakeInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed > duration) {
            camera.position.y = originalCameraY;
            camera.rotation.z = 0;
            clearInterval(shakeInterval);
        } else {
            const decay = 1 - (elapsed / duration);
            camera.position.y = originalCameraY + (Math.random() - 0.5) * intensity * decay;
            camera.rotation.z = (Math.random() - 0.5) * 0.05 * decay;
        }
    }, 16);
}

// Flashlight flicker effect
function flickerFlashlight(duration = 500, callback) {
    const flickerPattern = [50, 30, 80, 20, 60, 40, 100]; // ms intervals
    let index = 0;
    let elapsed = 0;

    const doFlicker = () => {
        if (elapsed >= duration) {
            flashlight.visible = flashlightOn;
            if (callback) callback();
            return;
        }
        flashlight.visible = !flashlight.visible;
        const delay = flickerPattern[index % flickerPattern.length];
        elapsed += delay;
        index++;
        setTimeout(doFlicker, delay);
    };
    doFlicker();
}

// Complete darkness for a moment
function momentOfDarkness(duration = 800) {
    const wasOn = flashlightOn;
    flashlight.visible = false;
    ambientLight.intensity = 0;
    setTimeout(() => {
        flashlight.visible = wasOn;
        ambientLight.intensity = 0.3;
    }, duration);
}

// --- CREEPY HUMANOID FIGURE ---
// Tall, thin, distorted proportions (slenderman-style)
function createCreepyFigure() {
    const figure = new THREE.Group();

    // Body - very thin and tall
    const bodyGeometry = new THREE.CylinderGeometry(0.08, 0.12, 2.2, 8);
    const bodyMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1.1;
    figure.add(body);

    // Head - slightly elongated
    const headGeometry = new THREE.SphereGeometry(0.18, 8, 8);
    headGeometry.scale(1, 1.3, 1);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 2.4;
    figure.add(head);

    // Glowing eyes - piercing red
    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 2
    });

    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.06, 2.45, 0.15);
    figure.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.06, 2.45, 0.15);
    figure.add(rightEye);

    // Eye glow lights
    const eyeLight = new THREE.PointLight(0xff0000, 0.5, 3);
    eyeLight.position.set(0, 2.45, 0.2);
    figure.add(eyeLight);

    // Long, thin arms
    const armGeometry = new THREE.CylinderGeometry(0.02, 0.03, 1.2, 6);
    const armMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.25, 1.4, 0);
    leftArm.rotation.z = 0.3;
    figure.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.25, 1.4, 0);
    rightArm.rotation.z = -0.3;
    figure.add(rightArm);

    // Long fingers (creepy detail)
    for (let i = 0; i < 3; i++) {
        const fingerGeo = new THREE.CylinderGeometry(0.008, 0.005, 0.2, 4);
        const fingerMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });

        const leftFinger = new THREE.Mesh(fingerGeo, fingerMat);
        leftFinger.position.set(-0.45 + i * 0.03, 0.75, 0);
        leftFinger.rotation.z = 0.5 + i * 0.1;
        figure.add(leftFinger);

        const rightFinger = new THREE.Mesh(fingerGeo, fingerMat);
        rightFinger.position.set(0.45 - i * 0.03, 0.75, 0);
        rightFinger.rotation.z = -0.5 - i * 0.1;
        figure.add(rightFinger);
    }

    figure.visible = false;
    return figure;
}

// Create the horror figures
const horrorFigure1 = createCreepyFigure(); // For scare 1 (in your face)
scene.add(horrorFigure1);

const horrorFigure2 = createCreepyFigure(); // For scare 2 (runs at you)
scene.add(horrorFigure2);

// --- TERRIFYING SOUNDS ---
function playTerrifyingScream() {
    if (!audioContext) return;

    // Layered scream effect
    // Layer 1: High pitched shriek
    const shriekOsc = audioContext.createOscillator();
    shriekOsc.type = 'sawtooth';
    shriekOsc.frequency.setValueAtTime(800, audioContext.currentTime);
    shriekOsc.frequency.linearRampToValueAtTime(1200, audioContext.currentTime + 0.1);
    shriekOsc.frequency.linearRampToValueAtTime(600, audioContext.currentTime + 0.4);

    const shriekGain = audioContext.createGain();
    shriekGain.gain.setValueAtTime(0.6, audioContext.currentTime);
    shriekGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    const shriekFilter = audioContext.createBiquadFilter();
    shriekFilter.type = 'highpass';
    shriekFilter.frequency.value = 400;

    shriekOsc.connect(shriekFilter);
    shriekFilter.connect(shriekGain);
    shriekGain.connect(masterGain);
    shriekOsc.start();
    shriekOsc.stop(audioContext.currentTime + 0.5);

    // Layer 2: Low rumble/growl
    const growlOsc = audioContext.createOscillator();
    growlOsc.type = 'sawtooth';
    growlOsc.frequency.value = 80;

    const growlGain = audioContext.createGain();
    growlGain.gain.setValueAtTime(0.5, audioContext.currentTime);
    growlGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

    growlOsc.connect(growlGain);
    growlGain.connect(masterGain);
    growlOsc.start();
    growlOsc.stop(audioContext.currentTime + 0.6);

    // Layer 3: Distorted noise burst
    const noiseBuffer = createNoiseBuffer(0.4);
    const noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const distortion = audioContext.createWaveShaper();
    distortion.curve = makeDistortionCurve(800);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.7, audioContext.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);

    noiseSource.connect(distortion);
    distortion.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSource.start();
    noiseSource.stop(audioContext.currentTime + 0.4);

    // Layer 4: Dissonant chord stinger
    [200, 267, 356, 475].forEach(freq => {
        const osc = audioContext.createOscillator();
        osc.type = 'square';
        osc.frequency.value = freq;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(0.25, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(audioContext.currentTime + 0.3);
    });
}

function playRapidFootsteps(duration = 1000) {
    if (!audioContext) return;

    let elapsed = 0;
    const interval = 80; // Fast footsteps
    let volume = 0.1;

    const footstepLoop = setInterval(() => {
        elapsed += interval;
        volume = Math.min(0.5, volume + 0.05); // Gets louder as it approaches

        const buffer = createNoiseBuffer(0.05);
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const filter = audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;

        const gain = audioContext.createGain();
        gain.gain.setValueAtTime(volume, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        source.start();
        source.stop(audioContext.currentTime + 0.05);

        if (elapsed >= duration) {
            clearInterval(footstepLoop);
        }
    }, interval);
}

function playApproachingHorror() {
    if (!audioContext) return;

    // Eerie rising tone
    const osc = audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, audioContext.currentTime);
    osc.frequency.linearRampToValueAtTime(400, audioContext.currentTime + 1.2);

    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioContext.currentTime + 1.2);

    // Breathing/rasping sound
    const breathBuffer = createNoiseBuffer(1.2);
    const breathSource = audioContext.createBufferSource();
    breathSource.buffer = breathBuffer;

    const breathFilter = audioContext.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = 800;
    breathFilter.Q.value = 2;

    // Tremolo for breathing effect
    const lfo = audioContext.createOscillator();
    lfo.frequency.value = 6;
    const lfoGain = audioContext.createGain();
    lfoGain.gain.value = 0.15;

    const breathGain = audioContext.createGain();
    breathGain.gain.setValueAtTime(0.05, audioContext.currentTime);
    breathGain.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 1.0);
    breathGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.2);

    lfo.connect(lfoGain);
    lfoGain.connect(breathGain.gain);

    breathSource.connect(breathFilter);
    breathFilter.connect(breathGain);
    breathGain.connect(masterGain);

    lfo.start();
    breathSource.start();
    lfo.stop(audioContext.currentTime + 1.2);
    breathSource.stop(audioContext.currentTime + 1.2);

    // Start rapid footsteps
    playRapidFootsteps(1000);
}

// Animation state
let scare1Animation = null;
let scare2Animation = null;

// --- JUMPSCARE 1: IN YOUR FACE ---
function triggerScare1() {
    if (scare1Triggered) return;
    scare1Triggered = true;
    console.log('JUMPSCARE 1 triggered!');

    // Play terrifying sound
    playTerrifyingScream();

    // Flash screen red
    flashScreen('red', 80);

    // Shake the screen
    shakeScreen(0.15, 400);

    // Position figure RIGHT in player's face
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    horrorFigure1.position.copy(camera.position);
    horrorFigure1.position.add(direction.multiplyScalar(0.8)); // Very close!
    horrorFigure1.position.y = 0; // Ground level so figure towers over
    horrorFigure1.lookAt(camera.position.x, 1.6, camera.position.z);

    // Show figure
    horrorFigure1.visible = true;

    // Flicker effect then darkness
    let startTime = Date.now();
    const scareDuration = 350; // Brief but terrifying

    scare1Animation = setInterval(() => {
        const elapsed = Date.now() - startTime;

        if (elapsed > scareDuration) {
            // Figure vanishes
            horrorFigure1.visible = false;
            clearInterval(scare1Animation);
            scare1Animation = null;

            // Flicker then darkness
            flickerFlashlight(300, () => {
                momentOfDarkness(600);
            });
        } else {
            // Subtle jitter of the figure (unsettling)
            horrorFigure1.position.x += (Math.random() - 0.5) * 0.02;
            horrorFigure1.position.y += (Math.random() - 0.5) * 0.01;
        }
    }, 16);
}

// --- JUMPSCARE 2: RUNNING AT YOU ---
function triggerScare2() {
    console.log('JUMPSCARE 2 triggered!');

    // Play approaching horror sound
    playApproachingHorror();

    // Flicker flashlight during approach
    flickerFlashlight(800);

    // Position figure at far end of hallway (or ahead of player)
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    // Start position: 15 units ahead in the direction player is facing
    const startZ = camera.position.z - 15;
    const clampedStartZ = Math.max(-HALLWAY_LENGTH / 2 + 2, startZ);

    horrorFigure2.position.set(0, 0, clampedStartZ);
    horrorFigure2.lookAt(camera.position.x, 0, camera.position.z);
    horrorFigure2.visible = true;

    // Animate figure RUNNING toward player
    let startTime = Date.now();
    const duration = 1200; // Fast approach
    const startPos = horrorFigure2.position.z;
    const endPos = camera.position.z - 1.5; // Stop just before reaching player

    scare2Animation = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
            // Vanish just before reaching player
            horrorFigure2.visible = false;
            clearInterval(scare2Animation);
            scare2Animation = null;
        } else {
            // Move toward player (ease-in for acceleration effect)
            const easedProgress = progress * progress; // Accelerating
            horrorFigure2.position.z = startPos + (endPos - startPos) * easedProgress;

            // Bobbing motion (running)
            horrorFigure2.position.y = Math.abs(Math.sin(elapsed * 0.02)) * 0.1;

            // Keep looking at player
            horrorFigure2.lookAt(camera.position.x, 0, camera.position.z);

            // Fade in quickly at start
            if (progress < 0.1) {
                horrorFigure2.traverse(child => {
                    if (child.material && child.material.opacity !== undefined) {
                        child.material.transparent = true;
                        child.material.opacity = progress * 10;
                    }
                });
            }
        }
    }, 16);
}

// Check step-based scare triggers (Scare 2 only - Scare 1 is event-based)
function checkJumpscares() {
    if (gameWon) return;

    // Scare 2: Check if step count reached a trigger point
    if (scareStepIndex < scareTriggerSteps.length) {
        if (stepCount >= scareTriggerSteps[scareStepIndex]) {
            console.log(`Scare 2 triggered at step ${stepCount} (trigger point ${scareStepIndex + 1}/5)`);
            triggerScare2();
            scareStepIndex++; // Move to next trigger point
        }
    }
}

// Schedule Scare 1 after key pickup (called from interact function)
function scheduleScare1() {
    if (scare1Triggered) return;

    // Random delay between 3-5 seconds
    const delay = 3000 + Math.random() * 2000;
    console.log(`Scare 1 scheduled in ${(delay / 1000).toFixed(1)} seconds`);

    setTimeout(() => {
        if (!gameWon) { // Don't scare if player already escaped
            triggerScare1();
        }
    }, delay);
}

// --- GAME STATE ---
let hasKey = false;
let gameWon = false;

// --- INTERACTABLE OBJECTS LIST ---
const interactables = [keyGroup, door];

// --- INTERACTION SYSTEM ---
// UI element references
const crosshairEl = document.getElementById('crosshair');
const interactPromptEl = document.getElementById('interact-prompt');
const messageEl = document.getElementById('message');
const inventoryEl = document.getElementById('inventory');
const winScreenEl = document.getElementById('win-screen');

// Raycaster for interaction detection
const interactRaycaster = new THREE.Raycaster();
interactRaycaster.far = 3; // Maximum interaction distance

// Currently looked-at interactable
let currentInteractable = null;

// Show a temporary message
let messageTimeout = null;
function showMessage(text, duration = 2000) {
    messageEl.textContent = text;
    messageEl.classList.add('visible');

    if (messageTimeout) clearTimeout(messageTimeout);
    messageTimeout = setTimeout(() => {
        messageEl.classList.remove('visible');
    }, duration);
}

// Update inventory display
function updateInventory() {
    if (hasKey) {
        inventoryEl.textContent = '[ Key ]';
        inventoryEl.classList.add('has-key');
    } else {
        inventoryEl.textContent = '[ No Key ]';
        inventoryEl.classList.remove('has-key');
    }
}

// Check what the player is looking at
function checkInteraction() {
    if (gameWon) return;

    // Cast ray from camera center forward
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    interactRaycaster.set(camera.position, direction);

    // Check for intersections with interactables
    const intersections = interactRaycaster.intersectObjects(interactables, true);

    if (intersections.length > 0) {
        // Find the parent object with userData.type
        let target = intersections[0].object;
        while (target && !target.userData.type) {
            target = target.parent;
        }

        if (target && target.userData.type) {
            currentInteractable = target;
            interactPromptEl.classList.add('visible');
            return;
        }
    }

    // Nothing in range
    currentInteractable = null;
    interactPromptEl.classList.remove('visible');
}

// Handle interaction when E is pressed
function interact() {
    if (!currentInteractable || gameWon) return;

    const type = currentInteractable.userData.type;

    if (type === 'key') {
        // Pick up the key
        hasKey = true;
        scene.remove(keyGroup);
        scene.remove(keyLight);
        interactables.splice(interactables.indexOf(keyGroup), 1);
        showMessage('Key acquired!');
        updateInventory();
        playKeyPickup(); // Sound effect
        scheduleScare1(); // Schedule jumpscare 3-5 seconds after pickup
        currentInteractable = null;
        interactPromptEl.classList.remove('visible');
        console.log('Key picked up!');
    }
    else if (type === 'door') {
        if (hasKey) {
            // Win the game!
            gameWon = true;
            playDoorOpen(); // Sound effect
            winScreenEl.classList.add('visible');
            touch.release(); // controls.unlock(), or leave touch play on phones
            console.log('You escaped!');
        } else {
            // Door is locked
            playDoorLocked(); // Sound effect
            showMessage('The door is locked. Find the key.');
            console.log('Door is locked');
        }
    }
}

// E key to interact
document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyE' && controls.isLocked) {
        interact();
    }
});

// Show/hide UI when game starts/pauses
controls.addEventListener('lock', () => {
    crosshairEl.classList.add('visible');
    inventoryEl.classList.add('visible');
});

controls.addEventListener('unlock', () => {
    crosshairEl.classList.remove('visible');
    inventoryEl.classList.remove('visible');
    interactPromptEl.classList.remove('visible');
});

// --- COLLISION DETECTION SETUP ---
// Minimum distance from walls (player "radius")
const PLAYER_RADIUS = 0.5;

// Hard boundary limits - camera can never go outside these
const BOUNDS = {
    minX: -HALLWAY_WIDTH / 2 + PLAYER_RADIUS,   // Left wall + buffer
    maxX: HALLWAY_WIDTH / 2 - PLAYER_RADIUS,    // Right wall - buffer
    minZ: -HALLWAY_LENGTH / 2 + PLAYER_RADIUS,  // Front wall + buffer
    maxZ: HALLWAY_LENGTH / 2 - PLAYER_RADIUS    // Back wall - buffer
};

// Clamp camera position to stay inside hallway bounds
// This is called AFTER movement to ensure we never clip through walls
function clampCameraPosition() {
    camera.position.x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, camera.position.x));
    camera.position.z = Math.max(BOUNDS.minZ, Math.min(BOUNDS.maxZ, camera.position.z));
    // Y position is fixed at eye height, no need to clamp
}

// --- WINDOW RESIZE HANDLING ---
// Update camera and renderer when window size changes
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- TIMING ---
// Clock for consistent movement speed regardless of frame rate
const clock = new THREE.Clock();

// --- ANIMATION LOOP ---
// This function runs every frame (~60 times per second)
function animate() {
    requestAnimationFrame(animate); // Schedule next frame

    // Calculate time since last frame (in seconds)
    const delta = clock.getDelta();

    // Only process movement when controls are locked (game is active)
    if (controls.isLocked) {
        // Build movement direction vector (local space)
        // X = right/left, Y = forward/backward
        const direction = new THREE.Vector2(0, 0);

        if (keysPressed.forward) direction.y += 1;
        if (keysPressed.backward) direction.y -= 1;
        if (keysPressed.right) direction.x += 1;
        if (keysPressed.left) direction.x -= 1;

        // Normalize so diagonal movement isn't faster
        if (direction.length() > 0) {
            direction.normalize();
        }

        // Calculate movement distance for this frame
        const distance = moveSpeed * delta;

        // Apply movement
        controls.moveForward(direction.y * distance);
        controls.moveRight(direction.x * distance);

        // Play footstep sounds and count steps when moving
        if (direction.length() > 0) {
            playFootstep();
            incrementStepCount();
        }

        // Clamp position to stay inside hallway bounds
        // This prevents camera from ever clipping through walls
        clampCameraPosition();

        // Check if player is looking at an interactable object
        checkInteraction();

        // Check jumpscare trigger zones
        checkJumpscares();
    }

    renderer.render(scene, camera); // Draw the scene
}

// Start the loop
animate();

console.log('Horror FPS initialized - Phase 6: Jumpscares (Event-Based)');
console.log('WASD to move, mouse to look, ESC to pause');
console.log('F or Left Click to toggle flashlight');
console.log('E to interact with objects (key, door)');
console.log('Scare 1: Triggers 3-5 sec after key pickup');
console.log('Scare 2: Triggers at random step counts (5 times per playthrough)');

// Read-only handle for headless checks (touch-port tests read state through it)
window.__hfps = {
    camera, controls, touch, renderer,
    get hasKey() { return hasKey; },
    get gameWon() { return gameWon; },
    get flashlightOn() { return flashlightOn; },
    get stepCount() { return stepCount; },
};
