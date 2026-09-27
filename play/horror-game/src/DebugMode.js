import * as THREE from 'three';
import eventBus from './EventBus.js';

/**
 * DebugMode — Development-only test/debug overlay.
 *
 * T key: Toggle bright lighting, disable fog, show coordinates + room name.
 * M key: Toggle top-down minimap camera in a corner viewport.
 *
 * Remove this module entirely before release.
 */
class DebugMode {
    /**
     * @param {THREE.Scene} scene
     * @param {THREE.WebGLRenderer} renderer
     * @param {THREE.PerspectiveCamera} playerCamera
     */
    constructor(scene, renderer, playerCamera) {
        this._scene = scene;
        this._renderer = renderer;
        this._playerCamera = playerCamera;

        // ── Debug light mode ────────────────────────────
        this._debugActive = false;
        this._debugLight = null;
        this._debugDirLight = null;
        this._savedFog = null;
        this._savedBackground = null;
        this._savedExposure = null;

        // ── HUD elements ────────────────────────────────
        this._debugHud = document.getElementById('debug-hud');
        this._debugCoords = document.getElementById('debug-coords');
        this._debugRoom = document.getElementById('debug-room');
        this._debugLabel = document.getElementById('debug-label');

        // ── Minimap ─────────────────────────────────────
        this._minimapActive = false;
        this._minimapCamera = null;
        this._viewSize = new THREE.Vector2();
        this._currentZoneId = 'none';
        this._currentSurface = 'unknown';
        this._playerPos = { x: 0, y: 0, z: 0 };

        // ── Player marker for minimap ───────────────────
        this._playerMarker = null;

        // ── Event listeners ─────────────────────────────
        eventBus.on('input:debugToggle', () => this._toggleDebug());
        eventBus.on('input:minimapToggle', () => this._toggleMinimap());

        eventBus.on('player:moved', ({ position }) => {
            this._playerPos = position;
        });

        eventBus.on('player:enteredRoom', ({ zoneId, surfaceType }) => {
            this._currentZoneId = zoneId;
            this._currentSurface = surfaceType;
        });
    }

    // ═══════════════════════════════════════════════════
    // Debug Light Mode (T key)
    // ═══════════════════════════════════════════════════

    _toggleDebug() {
        this._debugActive = !this._debugActive;

        if (this._debugActive) {
            // Save current state
            this._savedFog = this._scene.fog;
            this._savedBackground = this._scene.background.clone();
            this._savedExposure = this._renderer.toneMappingExposure;

            // Bright ambient light
            this._debugLight = new THREE.AmbientLight(0xffffff, 3.0);
            this._scene.add(this._debugLight);

            // Directional light for depth
            this._debugDirLight = new THREE.DirectionalLight(0xffffff, 1.5);
            this._debugDirLight.position.set(20, 30, 20);
            this._scene.add(this._debugDirLight);

            // Disable fog, lighten background
            this._scene.fog = null;
            this._scene.background = new THREE.Color(0x334455);
            this._renderer.toneMappingExposure = 1.5;

            // Show HUD
            this._debugHud.style.display = 'block';
            this._debugLabel.textContent = 'DEBUG MODE (T to toggle, M for minimap)';

            console.log('[DEBUG] Test mode ON');
        } else {
            // Restore
            if (this._debugLight) {
                this._scene.remove(this._debugLight);
                this._debugLight.dispose();
                this._debugLight = null;
            }
            if (this._debugDirLight) {
                this._scene.remove(this._debugDirLight);
                this._debugDirLight.dispose();
                this._debugDirLight = null;
            }

            this._scene.fog = this._savedFog;
            this._scene.background = this._savedBackground;
            this._renderer.toneMappingExposure = this._savedExposure;

            // Hide HUD
            this._debugHud.style.display = 'none';

            console.log('[DEBUG] Test mode OFF');
        }
    }

    // ═══════════════════════════════════════════════════
    // Minimap (M key)
    // ═══════════════════════════════════════════════════

    _toggleMinimap() {
        this._minimapActive = !this._minimapActive;

        if (this._minimapActive) {
            // Create top-down orthographic camera
            const size = 45;
            this._minimapCamera = new THREE.OrthographicCamera(
                -size, size, size, -size, 0.1, 100
            );
            // Position high above, looking down
            this._minimapCamera.position.set(15, 50, 35);
            this._minimapCamera.lookAt(15, 0, 35);
            this._minimapCamera.up.set(0, 0, -1);

            // Player marker — bright green sphere visible from above
            const markerGeo = new THREE.SphereGeometry(0.8, 8, 8);
            const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            this._playerMarker = new THREE.Mesh(markerGeo, markerMat);
            this._playerMarker.position.set(this._playerPos.x, 10, this._playerPos.z);
            this._scene.add(this._playerMarker);

            console.log('[DEBUG] Minimap ON');
        } else {
            this._minimapCamera = null;

            if (this._playerMarker) {
                this._scene.remove(this._playerMarker);
                this._playerMarker.geometry.dispose();
                this._playerMarker.material.dispose();
                this._playerMarker = null;
            }

            console.log('[DEBUG] Minimap OFF');
        }
    }

    // ═══════════════════════════════════════════════════
    // Update (called each frame)
    // ═══════════════════════════════════════════════════

    update(dt) {
        // Update debug HUD text
        if (this._debugActive && this._debugCoords && this._debugRoom) {
            const p = this._playerPos;
            this._debugCoords.textContent =
                `X: ${p.x.toFixed(1)}  Y: ${p.y.toFixed(1)}  Z: ${p.z.toFixed(1)}`;
            this._debugRoom.textContent =
                `Room: ${this._currentZoneId}  Surface: ${this._currentSurface}`;
        }

        // Update player marker position
        if (this._minimapActive && this._playerMarker) {
            this._playerMarker.position.set(this._playerPos.x, 10, this._playerPos.z);
        }
    }

    /**
     * Render minimap viewport (call after main render).
     */
    renderMinimap() {
        if (!this._minimapActive || !this._minimapCamera) return;

        // setViewport/setScissor take CSS pixels (three.js applies the pixel ratio itself).
        // Reading domElement.width here doubled every size on high-DPI screens and phones,
        // which pushed the minimap off-screen and left the main view zoomed in afterwards.
        const size = this._renderer.getSize(this._viewSize);
        const w = size.x;
        const h = size.y;

        // Minimap in top-right corner, 280x280 px
        const mapSize = Math.min(280, Math.floor(w * 0.25));
        const padding = 10;
        const mx = w - mapSize - padding;
        const my = padding;

        // Save current state
        const savedScissorTest = this._renderer.getScissorTest();

        // Set viewport + scissor for minimap region
        this._renderer.setViewport(mx, h - my - mapSize, mapSize, mapSize);
        this._renderer.setScissor(mx, h - my - mapSize, mapSize, mapSize);
        this._renderer.setScissorTest(true);

        // Clear just the minimap region
        this._renderer.setClearColor(0x222233, 1);
        this._renderer.clear();

        // Render scene from top-down
        this._renderer.render(this._scene, this._minimapCamera);

        // Restore full viewport
        this._renderer.setViewport(0, 0, w, h);
        this._renderer.setScissorTest(savedScissorTest);
    }

    get isMinimapActive() {
        return this._minimapActive;
    }
}

export default DebugMode;
