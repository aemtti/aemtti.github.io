import eventBus from './EventBus.js';
import { GameState } from './utils/Constants.js';

/**
 * Game — Master controller that owns the update loop and game state.
 *
 * Receives all subsystems at construction, calls their update() methods
 * each frame in the correct order, and manages state transitions.
 *
 * Phase 2: Handles async map loading, door interaction via raycasting.
 */
class Game {
    constructor(systems) {
        this._renderer = systems.renderer;
        this._scene = systems.scene;
        this._camera = systems.camera;
        this._inputManager = systems.inputManager;
        this._playerController = systems.playerController;
        this._mapBuilder = systems.mapBuilder;
        this._debugMode = systems.debugMode || null;

        this._state = GameState.MENU;
        this._lastTime = 0;
        this._animFrameId = null;
        this._maxDt = 1 / 15;

        this._loop = this._loop.bind(this);

        // Lights and level geometry never move, so the point-light shadow cubes only need
        // re-rendering while a door swings. Re-rendering them every frame was 60 extra scene
        // passes (10 lights x 6 faces) — the biggest cost on phones. The picture is identical.
        this._renderer.shadowMap.autoUpdate = false;
        this._shadowFrames = 2;

        // ── State transitions ───────────────────────────
        eventBus.on('input:pointerLock', ({ locked }) => {
            if (locked && (this._state === GameState.MENU || this._state === GameState.PAUSED)) {
                this._setState(GameState.PLAYING);
            }
            if (!locked && this._state === GameState.PLAYING) {
                this._setState(GameState.PAUSED);
            }
        });

        eventBus.on('input:pause', () => {
            if (this._state === GameState.PLAYING) {
                this._inputManager.exitLock(); // pointer lock, or the touch lock on phones
                this._setState(GameState.PAUSED);
            }
        });

        // ── Door interaction ────────────────────────────
        eventBus.on('input:interact', () => {
            if (this._state !== GameState.PLAYING) return;
            this._tryInteractDoor();
        });

        // Debug: log room changes
        eventBus.on('player:enteredRoom', ({ zoneId, surfaceType }) => {
            console.log(`Entered: ${zoneId} (${surfaceType})`);
        });
    }

    get state() { return this._state; }

    _setState(newState) {
        const old = this._state;
        this._state = newState;
        eventBus.emit('game:stateChanged', { from: old, to: newState });
    }

    /**
     * Load map from JSON, then start the game loop.
     */
    async start() {
        await this._mapBuilder.buildFromJSON('data/map.json');
        this._lastTime = performance.now();
        this._loop();
    }

    _loop() {
        this._animFrameId = requestAnimationFrame(this._loop);

        const now = performance.now();
        let dt = (now - this._lastTime) / 1000;
        this._lastTime = now;
        if (dt > this._maxDt) dt = this._maxDt;

        this._update(dt);
        this._render();
    }

    _update(dt) {
        if (this._state !== GameState.PLAYING) return;
        this._playerController.update(dt);
        this._mapBuilder.update?.(dt);
        this._debugMode?.update(dt);
    }

    _render() {
        // Static shadows: refresh only while doors move (+2 frames for the final pose).
        if (this._mapBuilder.isAnimating) this._shadowFrames = 2;
        if (this._shadowFrames > 0) {
            this._renderer.shadowMap.needsUpdate = true;
            this._shadowFrames--;
        }
        this._renderer.render(this._scene, this._camera);
        // Render minimap as a second viewport after main render
        this._debugMode?.renderMinimap();
    }

    // ── Door interaction ────────────────────────────────

    /**
     * Check if player is close to a door and facing it.
     * Uses distance check against all door positions.
     */
    _tryInteractDoor() {
        const pos = this._camera.position;
        const maxDist = 2.5; // Max interaction distance

        let closestDoor = null;
        let closestDistSq = maxDist * maxDist;

        for (const [doorId, door] of this._mapBuilder.getAllDoors()) {
            const d = door.data;
            const dx = pos.x - d.x;
            const dz = pos.z - d.z;
            const distSq = dx * dx + dz * dz;

            if (distSq < closestDistSq) {
                closestDistSq = distSq;
                closestDoor = doorId;
            }
        }

        if (closestDoor) {
            const result = this._mapBuilder.toggleDoor(closestDoor);
            if (!result) {
                // Door was locked — event already emitted by MapBuilder
                console.log('Door locked:', closestDoor);
            }
        }
    }

    dispose() {
        if (this._animFrameId) {
            cancelAnimationFrame(this._animFrameId);
        }
        this._inputManager.dispose();
        eventBus.clear();
    }
}

export default Game;
