import eventBus from './EventBus.js';
import {
    PLAYER_HEIGHT,
    PLAYER_WALK_SPEED,
    PLAYER_RUN_SPEED,
    PITCH_LIMIT,
    GRAVITY,
    FOOTSTEP_WALK_INTERVAL,
    FOOTSTEP_RUN_INTERVAL,
    SurfaceType,
} from './utils/Constants.js';

/**
 * PlayerController — First-person camera movement with collision, ramp support,
 * zone detection, and footstep events.
 *
 * Depends on:
 *   - InputManager (passed in)
 *   - CollisionManager (passed in)
 *   - THREE.Camera (passed in)
 *
 * Emits via EventBus:
 *   - player:moved { position }
 *   - player:footstep { surface, position, running }
 *   - player:enteredRoom { zoneId, surfaceType }
 */
class PlayerController {
    constructor(camera, inputManager, collisionManager) {
        this._camera = camera;
        this._input = inputManager;
        this._collision = collisionManager;

        // Euler angles
        this._yaw = 0;
        this._pitch = 0;

        // Vertical velocity for gravity
        this._velocityY = 0;
        this._grounded = true;

        // Floor height at current position (updated by zone/ramp checks)
        this._floorY = 0;

        // Footstep timer
        this._footstepTimer = 0;

        // Current surface
        this._surface = SurfaceType.WOOD;

        // Zones and ramps (set by map:built event)
        this._zones = [];
        this._ramps = [];
        this._currentZoneId = null;

        // Spawn position (updated by map:built)
        this._camera.position.set(4, PLAYER_HEIGHT, 5);

        // Listen for map data
        eventBus.on('map:built', (data) => {
            if (data.zones) this._zones = data.zones;
            if (data.ramps) this._ramps = data.ramps;
            if (data.spawn) {
                this._camera.position.set(data.spawn.x, PLAYER_HEIGHT, data.spawn.z);
                this._yaw = data.spawn.rotation || 0;
            }
        });
    }

    set floorY(y) { this._floorY = y; }
    set surface(s) { this._surface = s; }

    update(dt) {
        if (!this._input.isLocked) return;
        this._updateLook(dt);
        this._updateMovement(dt);
        this._updateZone();
    }

    // ── Look ────────────────────────────────────────────

    _updateLook(_dt) {
        const { dx, dy } = this._input.consumeMouseDelta();
        this._yaw -= dx;
        this._pitch -= dy;
        this._pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this._pitch));

        this._camera.rotation.order = 'YXZ';
        this._camera.rotation.y = this._yaw;
        this._camera.rotation.x = this._pitch;
    }

    // ── Movement ────────────────────────────────────────

    _updateMovement(dt) {
        const { x: inputX, z: inputZ } = this._input.getMovementInput();
        const isMoving = inputX !== 0 || inputZ !== 0;
        const running = this._input.isRunning();
        const speed = running ? PLAYER_RUN_SPEED : PLAYER_WALK_SPEED;

        const sinYaw = Math.sin(this._yaw);
        const cosYaw = Math.cos(this._yaw);

        // Three.js camera: forward = (-sinYaw, 0, -cosYaw), right = (cosYaw, 0, -sinYaw)
        // inputZ: -1 = forward (W), +1 = backward (S)
        // inputX: -1 = left (A), +1 = right (D)
        const worldVX = (inputX * cosYaw + inputZ * sinYaw) * speed * dt;
        const worldVZ = (-inputX * sinYaw + inputZ * cosYaw) * speed * dt;

        // Debug: log velocity when moving
        if (isMoving) {
            console.log(`[MOVE] input(${inputX.toFixed(2)}, ${inputZ.toFixed(2)}) vel(${worldVX.toFixed(4)}, ${worldVZ.toFixed(4)})`);
        }

        // Resolve collision (2D, top-down)
        const pos = this._camera.position;
        const resolved = this._collision.resolveMovement(pos.x, pos.z, worldVX, worldVZ);

        // Debug: log if collision blocked movement
        if (isMoving && (Math.abs(resolved.x - (pos.x + worldVX)) > 0.0001 || Math.abs(resolved.z - (pos.z + worldVZ)) > 0.0001)) {
            console.log(`[COLLISION] blocked! pos(${pos.x.toFixed(2)}, ${pos.z.toFixed(2)}) -> resolved(${resolved.x.toFixed(2)}, ${resolved.z.toFixed(2)})`);
        }

        pos.x = resolved.x;
        pos.z = resolved.z;

        // Compute floor height from zones and ramps
        this._floorY = this._getFloorHeight(pos.x, pos.z);

        // Gravity / floor snap
        this._velocityY -= GRAVITY * dt;
        pos.y += this._velocityY * dt;
        const targetY = this._floorY + PLAYER_HEIGHT;
        if (pos.y <= targetY) {
            pos.y = targetY;
            this._velocityY = 0;
            this._grounded = true;
        }

        // Footstep events
        if (isMoving && this._grounded) {
            const interval = running ? FOOTSTEP_RUN_INTERVAL : FOOTSTEP_WALK_INTERVAL;
            this._footstepTimer += dt;
            if (this._footstepTimer >= interval) {
                this._footstepTimer -= interval;
                eventBus.emit('player:footstep', {
                    surface: this._surface,
                    position: { x: pos.x, y: pos.y, z: pos.z },
                    running,
                });
            }
        } else {
            this._footstepTimer = 0;
        }

        eventBus.emit('player:moved', {
            position: { x: pos.x, y: pos.y, z: pos.z },
        });
    }

    // ── Floor height ────────────────────────────────────

    _getFloorHeight(px, pz) {
        // Check ramps first (stairs)
        for (const ramp of this._ramps) {
            if (px >= ramp.x && px <= ramp.x + ramp.width &&
                pz >= ramp.z && pz <= ramp.z + ramp.depth) {
                // Linear interpolation along depth (z-axis)
                const t = (pz - ramp.z) / ramp.depth;
                return ramp.fromY + t * (ramp.toY - ramp.fromY);
            }
        }

        // Check zones (rooms/hallways)
        for (const zone of this._zones) {
            if (px >= zone.x && px <= zone.x + zone.width &&
                pz >= zone.z && pz <= zone.z + zone.depth) {
                return zone.floorY;
            }
        }

        return 0; // Default ground level
    }

    // ── Zone detection ──────────────────────────────────

    _updateZone() {
        const pos = this._camera.position;
        let foundZone = null;

        for (const zone of this._zones) {
            if (pos.x >= zone.x && pos.x <= zone.x + zone.width &&
                pos.z >= zone.z && pos.z <= zone.z + zone.depth) {
                foundZone = zone;
                break;
            }
        }

        if (foundZone && foundZone.id !== this._currentZoneId) {
            this._currentZoneId = foundZone.id;
            this._surface = foundZone.surfaceType || SurfaceType.WOOD;
            eventBus.emit('player:enteredRoom', {
                zoneId: foundZone.id,
                surfaceType: foundZone.surfaceType,
            });
        }
    }
}

export default PlayerController;
