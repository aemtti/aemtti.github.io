import { PLAYER_RADIUS } from './Constants.js';

/**
 * CollisionManager — Stores axis-aligned bounding boxes (AABBs) and resolves
 * player movement against them using slide-along-wall collision response.
 *
 * Each AABB is { minX, minZ, maxX, maxZ } (2D top-down; Y handled separately).
 */
class CollisionManager {
    constructor() {
        /** @type {{ minX: number, minZ: number, maxX: number, maxZ: number }[]} */
        this._boxes = [];
    }

    /**
     * Register a wall/obstacle AABB. Returns the box index as an ID.
     * @returns {number} Box index
     */
    addBox(minX, minZ, maxX, maxZ) {
        const id = this._boxes.length;
        this._boxes.push({
            minX: Math.min(minX, maxX),
            minZ: Math.min(minZ, maxZ),
            maxX: Math.max(minX, maxX),
            maxZ: Math.max(minZ, maxZ),
            enabled: true,
        });
        return id;
    }

    /**
     * Enable or disable a specific collision box (for doors).
     */
    setBoxEnabled(id, enabled) {
        if (id >= 0 && id < this._boxes.length) {
            this._boxes[id].enabled = enabled;
        }
    }

    /**
     * Clear all boxes (used when rebuilding the map).
     */
    clear() {
        this._boxes.length = 0;
    }

    /**
     * Resolve movement so the player (treated as a circle with PLAYER_RADIUS)
     * does not overlap any AABB.
     *
     * Uses "try X then Z independently" approach for slide-along-wall behavior.
     *
     * @param {number} px  Current position X
     * @param {number} pz  Current position Z
     * @param {number} vx  Desired movement X (already scaled by dt)
     * @param {number} vz  Desired movement Z (already scaled by dt)
     * @param {number} [radius=PLAYER_RADIUS]
     * @returns {{ x: number, z: number }} Corrected position
     */
    resolveMovement(px, pz, vx, vz, radius = PLAYER_RADIUS) {
        // Safety: find boxes the player is already inside so we can ignore them.
        // This prevents being permanently stuck when spawning inside a collision box.
        const ignoreSet = this._getOverlappingBoxes(px, pz, radius);

        // Try full movement on X axis first
        let newX = px + vx;
        let newZ = pz;

        if (this._collidesAt(newX, newZ, radius, ignoreSet)) {
            newX = px; // Revert X — wall blocks horizontal
        }

        // Then try Z axis from the (possibly reverted) X position
        newZ = pz + vz;

        if (this._collidesAt(newX, newZ, radius, ignoreSet)) {
            newZ = pz; // Revert Z — wall blocks depth
        }

        return { x: newX, z: newZ };
    }

    /**
     * Check if a circle at (cx, cz) with given radius overlaps any AABB.
     * Uses closest-point-on-AABB test.
     * @param {Set<number>} [ignoreSet] - Indices of boxes to skip (e.g., ones the player is already inside)
     */
    _collidesAt(cx, cz, radius, ignoreSet) {
        for (let i = 0; i < this._boxes.length; i++) {
            const b = this._boxes[i];
            if (!b.enabled) continue;
            if (ignoreSet && ignoreSet.has(i)) continue;
            // Find closest point on the AABB to the circle center
            const closestX = Math.max(b.minX, Math.min(cx, b.maxX));
            const closestZ = Math.max(b.minZ, Math.min(cz, b.maxZ));

            const dx = cx - closestX;
            const dz = cz - closestZ;

            if (dx * dx + dz * dz < radius * radius) {
                return true;
            }
        }
        return false;
    }

    /**
     * Returns a Set of box indices that the player circle already overlaps.
     * These will be ignored during collision resolution so the player can
     * move out of them rather than being permanently stuck.
     */
    _getOverlappingBoxes(cx, cz, radius) {
        const overlapping = new Set();
        for (let i = 0; i < this._boxes.length; i++) {
            const b = this._boxes[i];
            if (!b.enabled) continue;
            const closestX = Math.max(b.minX, Math.min(cx, b.maxX));
            const closestZ = Math.max(b.minZ, Math.min(cz, b.maxZ));
            const dx = cx - closestX;
            const dz = cz - closestZ;
            if (dx * dx + dz * dz < radius * radius) {
                overlapping.add(i);
            }
        }
        return overlapping.size > 0 ? overlapping : null;
    }
}

export default CollisionManager;
