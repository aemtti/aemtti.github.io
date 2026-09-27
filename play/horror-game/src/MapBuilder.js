import * as THREE from 'three';
import eventBus from './EventBus.js';

/**
 * MapBuilder — Shell-first architecture.
 *
 * Build order:
 *   1. Global lighting
 *   2. Floor shells (outer perimeter walls + floor/ceiling slabs)
 *   3. Interior partition walls (with door gaps)
 *   4. Staircase
 *   5. Doors
 *   6. Area details (per-room lights, furniture, floor overlays, zones)
 *
 * This approach builds the building envelope first, then divides it
 * into rooms with interior walls — like a real building.
 */

const WALL_THICKNESS = 0.2;
const DOOR_WIDTH = 1.8;
const DOOR_HEIGHT = 2.6;

class MapBuilder {
    constructor(scene, collisionManager) {
        this._scene = scene;
        this._collision = collisionManager;
        this._textureCache = {};
        this._mapData = null;

        /** @type {Map<string, {mesh: THREE.Mesh, pivot: THREE.Group, data: object, isOpen: boolean, animating: boolean}>} */
        this._doors = new Map();

        /** @type {Array<{x: number, z: number, width: number, depth: number, fromY: number, toY: number}>} */
        this._ramps = [];

        /** @type {Array<{id: string, x: number, z: number, width: number, depth: number, floorY: number, surfaceType: string}>} */
        this._zones = [];

        /** Doors currently swinging (Game refreshes the static shadow maps while > 0) */
        this._animatingDoors = 0;
    }

    /** True while any door is mid-swing */
    get isAnimating() { return this._animatingDoors > 0; }

    // ═══════════════════════════════════════════════════
    // Public API
    // ═══════════════════════════════════════════════════

    async buildFromJSON(url) {
        const response = await fetch(url);
        this._mapData = await response.json();

        this._addGlobalLighting();
        this._buildShells();
        this._buildInteriorWalls();
        this._buildStairs();
        this._buildDoors();
        this._buildAreaDetails();

        eventBus.emit('map:built', {
            rooms: this._mapData.rooms.map(r => r.id),
            spawn: this._mapData.playerSpawn,
            zones: this._zones,
            ramps: this._ramps,
        });
    }

    /** Get door data by ID */
    getDoor(id) { return this._doors.get(id); }

    /** Get all doors */
    getAllDoors() { return this._doors; }

    /** Get ramp data for stair floor-height calculation */
    getRamps() { return this._ramps; }

    /** Get all zones for surface/room detection */
    getZones() { return this._zones; }

    /**
     * Toggle a door open/closed with rotation animation.
     * Returns true if action was taken, false if locked or animating.
     */
    toggleDoor(doorId) {
        const door = this._doors.get(doorId);
        if (!door || door.animating) return false;

        if (door.data.locked) {
            eventBus.emit('door:locked', { doorId, requiredKey: door.data.requiredKey });
            return false;
        }

        door.animating = true;
        this._animatingDoors++;
        const targetAngle = door.isOpen ? 0 : -Math.PI / 2;
        const startAngle = door.pivot.rotation.y;
        const duration = 500;
        const startTime = performance.now();

        const animate = () => {
            const elapsed = performance.now() - startTime;
            const t = Math.min(elapsed / duration, 1);
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            door.pivot.rotation.y = startAngle + (targetAngle - startAngle) * eased;

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                door.pivot.rotation.y = targetAngle;
                door.isOpen = !door.isOpen;
                door.animating = false;
                this._animatingDoors--;

                // Update collision — remove old, add new if closed
                this._updateDoorCollision(door);

                eventBus.emit(door.isOpen ? 'door:opened' : 'door:closed', { doorId });
            }
        };
        requestAnimationFrame(animate);
        return true;
    }

    // ═══════════════════════════════════════════════════
    // Global lighting
    // ═══════════════════════════════════════════════════

    _addGlobalLighting() {
        const ambient = new THREE.AmbientLight(0x111122, 0.08);
        this._scene.add(ambient);
    }

    // ═══════════════════════════════════════════════════
    // Floor Shells — outer perimeter + floor/ceiling
    // ═══════════════════════════════════════════════════

    _buildShells() {
        if (!this._mapData.floorShells) return;
        for (const shell of this._mapData.floorShells) {
            this._buildShellPerimeter(shell);
            this._buildShellFloorCeiling(shell);
        }
    }

    /**
     * Walk the polygon vertices and build perimeter walls + collision.
     * Each consecutive pair of vertices forms one wall segment.
     * Openings (e.g., staircase entrance) cause the edge to be split into
     * sub-segments around the opening gap.
     */
    _buildShellPerimeter(shell) {
        const { vertices, floorY, ceilingY, wallTexture, openings } = shell;
        const height = ceilingY - floorY;
        const wallTex = this._getTexture(wallTexture || 'brick', 'wall');
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });

        const n = vertices.length;
        for (let i = 0; i < n; i++) {
            const [x1, z1] = vertices[i];
            const [x2, z2] = vertices[(i + 1) % n];

            // Split this edge into sub-segments by subtracting any openings
            const segments = this._splitEdgeByOpenings(x1, z1, x2, z2, openings);

            for (const seg of segments) {
                this._buildPerimeterWallSegment(shell, seg[0], seg[1], seg[2], seg[3], floorY, height, wallMat);
            }
        }
    }

    /**
     * Split an edge into sub-segments by removing any openings that overlap it.
     * Returns array of [x1, z1, x2, z2] segments.
     */
    _splitEdgeByOpenings(x1, z1, x2, z2, openings) {
        if (!openings || openings.length === 0) {
            return [[x1, z1, x2, z2]];
        }

        if (Math.abs(z1 - z2) < 0.01) {
            // Horizontal edge at constant z
            let minX = Math.min(x1, x2);
            let maxX = Math.max(x1, x2);
            let ranges = [[minX, maxX]];

            for (const opening of openings) {
                const [[ox1, oz1], [ox2, oz2]] = opening.edge;
                // Only apply if opening is on same axis and same position
                if (Math.abs(oz1 - oz2) < 0.01 && Math.abs(z1 - oz1) < 0.01) {
                    const oMin = Math.min(ox1, ox2);
                    const oMax = Math.max(ox1, ox2);
                    ranges = this._subtractRange(ranges, oMin, oMax);
                }
            }

            return ranges.map(([a, b]) => [a, z1, b, z1]);
        } else if (Math.abs(x1 - x2) < 0.01) {
            // Vertical edge at constant x
            let minZ = Math.min(z1, z2);
            let maxZ = Math.max(z1, z2);
            let ranges = [[minZ, maxZ]];

            for (const opening of openings) {
                const [[ox1, oz1], [ox2, oz2]] = opening.edge;
                if (Math.abs(ox1 - ox2) < 0.01 && Math.abs(x1 - ox1) < 0.01) {
                    const oMin = Math.min(oz1, oz2);
                    const oMax = Math.max(oz1, oz2);
                    ranges = this._subtractRange(ranges, oMin, oMax);
                }
            }

            return ranges.map(([a, b]) => [x1, a, x1, b]);
        }

        // Non-axis-aligned edge (shouldn't happen) — return as-is
        return [[x1, z1, x2, z2]];
    }

    /**
     * Subtract a range [cutFrom, cutTo] from a set of ranges.
     * Returns the remaining ranges.
     */
    _subtractRange(ranges, cutFrom, cutTo) {
        const result = [];
        for (const [a, b] of ranges) {
            if (cutTo <= a + 0.01 || cutFrom >= b - 0.01) {
                // No overlap
                result.push([a, b]);
            } else {
                // Overlap — split
                if (a < cutFrom - 0.01) result.push([a, cutFrom]);
                if (b > cutTo + 0.01) result.push([cutTo, b]);
            }
        }
        return result;
    }

    /**
     * Build a single perimeter wall segment.
     */
    _buildPerimeterWallSegment(shell, x1, z1, x2, z2, floorY, height, wallMat) {
        if (Math.abs(z1 - z2) < 0.01) {
            // Horizontal edge
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const length = maxX - minX;
            if (length < 0.01) return;

            const rotY = this._getPerimeterFacing(shell, minX, maxX, z1, 'z');

            const geo = new THREE.PlaneGeometry(length, height);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.set(minX + length / 2, floorY + height / 2, z1);
            mesh.rotation.y = rotY;
            mesh.receiveShadow = true;
            this._scene.add(mesh);

            this._collision.addBox(minX, z1 - WALL_THICKNESS / 2, maxX, z1 + WALL_THICKNESS / 2);
        } else if (Math.abs(x1 - x2) < 0.01) {
            // Vertical edge
            const minZ = Math.min(z1, z2);
            const maxZ = Math.max(z1, z2);
            const length = maxZ - minZ;
            if (length < 0.01) return;

            const rotY = this._getPerimeterFacing(shell, minZ, maxZ, x1, 'x');

            const geo = new THREE.PlaneGeometry(length, height);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.set(x1, floorY + height / 2, minZ + length / 2);
            mesh.rotation.y = rotY;
            mesh.receiveShadow = true;
            this._scene.add(mesh);

            this._collision.addBox(x1 - WALL_THICKNESS / 2, minZ, x1 + WALL_THICKNESS / 2, maxZ);
        }
    }

    /**
     * Determine which direction a perimeter wall should face (toward interior).
     * Tests a point slightly inside the polygon to determine interior direction.
     */
    _getPerimeterFacing(shell, from, to, pos, axis) {
        const mid = (from + to) / 2;
        const testOffset = 0.5;

        if (axis === 'z') {
            // Wall at constant z=pos, spanning x from 'from' to 'to'
            // Test points at z+offset and z-offset
            const insidePlus = this._pointInShell(shell, mid, pos + testOffset);
            if (insidePlus) return 0; // Face toward +Z (normal faces viewer at +Z)
            return Math.PI; // Face toward -Z
        } else {
            // Wall at constant x=pos, spanning z from 'from' to 'to'
            const insidePlus = this._pointInShell(shell, pos + testOffset, mid);
            if (insidePlus) return Math.PI / 2; // Face toward +X
            return -Math.PI / 2; // Face toward -X
        }
    }

    /**
     * Test if a point (px, pz) is inside a shell's polygon.
     * Uses ray casting algorithm.
     */
    _pointInShell(shell, px, pz) {
        const verts = shell.vertices;
        const n = verts.length;
        let inside = false;

        for (let i = 0, j = n - 1; i < n; j = i++) {
            const [xi, zi] = verts[i];
            const [xj, zj] = verts[j];

            if ((zi > pz) !== (zj > pz) &&
                px < (xj - xi) * (pz - zi) / (zj - zi) + xi) {
                inside = !inside;
            }
        }

        return inside;
    }

    /**
     * Build floor and ceiling planes for a shell.
     * Uses the floorRects decomposition from the shell data.
     */
    _buildShellFloorCeiling(shell) {
        const { floorY, ceilingY, floorRects } = shell;
        const floorTex = this._getTexture('concrete', 'floor');
        const ceilTex = this._getTexture('ceiling', 'ceiling');

        for (const rect of floorRects) {
            this._addFloorCeiling(rect.x, rect.z, rect.w, rect.d, floorY, floorTex, true);
            this._addFloorCeiling(rect.x, rect.z, rect.w, rect.d, ceilingY, ceilTex, false);
        }
    }

    // ═══════════════════════════════════════════════════
    // Interior Walls — partition walls with door gaps
    // ═══════════════════════════════════════════════════

    _buildInteriorWalls() {
        if (!this._mapData.interiorWalls) return;

        for (const wall of this._mapData.interiorWalls) {
            this._buildInteriorWall(wall);
        }
    }

    /**
     * Build a single interior wall. Finds any doors on this wall and
     * calls _buildWallSegment to handle gaps.
     */
    _buildInteriorWall(wall) {
        const { axis, pos, from, to, floorY, height, texture } = wall;
        const wallTex = this._getTexture(texture || 'plaster', 'wall');
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });

        // Find doors on this wall
        const doorsOnWall = this._findDoorsOnWall(axis, pos, from, to);

        // Set up coordinates for _buildWallSegment
        let x1, z1, x2, z2, rotY;

        if (axis === 'z') {
            // Horizontal wall at z=pos, from x=from to x=to
            x1 = from; z1 = pos; x2 = to; z2 = pos;
            rotY = 0; // Will be overridden by _buildWallSegment as needed
        } else {
            // Vertical wall at x=pos, from z=from to z=to
            x1 = pos; z1 = from; x2 = pos; z2 = to;
            rotY = Math.PI / 2;
        }

        // Interior walls are double-sided (visible from both sides)
        // We'll build with DoubleSide material
        const dblMat = new THREE.MeshStandardMaterial({
            map: wallTex,
            roughness: 0.85,
            side: THREE.DoubleSide,
        });

        this._buildWallSegment(x1, z1, x2, z2, axis, floorY, height, dblMat, doorsOnWall, rotY);
    }

    /**
     * Find all doors that sit on a given wall line.
     */
    _findDoorsOnWall(axis, pos, from, to) {
        if (!this._mapData || !this._mapData.doors) return [];

        return this._mapData.doors.filter(door => {
            if (axis === 'z') {
                // Wall at z=pos — door must have z near pos and x in [from, to]
                return Math.abs(door.z - pos) < 0.5 &&
                       door.x >= from - 0.01 && door.x <= to + 0.01;
            } else {
                // Wall at x=pos — door must have x near pos and z in [from, to]
                return Math.abs(door.x - pos) < 0.5 &&
                       door.z >= from - 0.01 && door.z <= to + 0.01;
            }
        });
    }

    // ═══════════════════════════════════════════════════
    // Stairs
    // ═══════════════════════════════════════════════════

    _buildStairs() {
        for (const stair of this._mapData.stairs) {
            this._buildStaircase(stair);
        }
    }

    _buildStaircase(s) {
        const { x, z, width, depth, fromY, toY } = s;
        const rise = toY - fromY;
        const stepCount = 20;
        const stepDepth = depth / stepCount;
        const stepHeight = rise / stepCount;

        const floorTex = this._getTexture(s.floorTexture, 'floor');
        const wallTex = this._getTexture(s.wallTexture, 'wall');
        const stepMat = new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.9 });
        const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.85 });

        // Build individual steps
        for (let i = 0; i < stepCount; i++) {
            const sy = fromY + i * stepHeight;
            const sz = z + i * stepDepth;

            const treadGeo = new THREE.BoxGeometry(width, stepHeight, stepDepth);
            const tread = new THREE.Mesh(treadGeo, stepMat);
            tread.position.set(x + width / 2, sy + stepHeight / 2, sz + stepDepth / 2);
            tread.castShadow = true;
            tread.receiveShadow = true;
            this._scene.add(tread);
        }

        // Side walls (these serve as interior walls between staircase and adjacent rooms)
        const totalHeight = rise + 3.5;

        // Left wall (x = stair.x)
        const lwGeo = new THREE.PlaneGeometry(depth, totalHeight);
        const lw = new THREE.Mesh(lwGeo, wallMat);
        lw.position.set(x, fromY + totalHeight / 2, z + depth / 2);
        lw.rotation.y = Math.PI / 2;
        this._scene.add(lw);
        this._collision.addBox(x - WALL_THICKNESS, z, x, z + depth);

        // Right wall (x = stair.x + width)
        const rwGeo = new THREE.PlaneGeometry(depth, totalHeight);
        const rw = new THREE.Mesh(rwGeo, wallMat);
        rw.position.set(x + width, fromY + totalHeight / 2, z + depth / 2);
        rw.rotation.y = -Math.PI / 2;
        this._scene.add(rw);
        this._collision.addBox(x + width, z, x + width + WALL_THICKNESS, z + depth);

        // Ceiling over stairs
        const ceilGeo = new THREE.PlaneGeometry(width, depth);
        const ceilMat = new THREE.MeshStandardMaterial({ map: this._getTexture('ceiling', 'ceiling'), roughness: 1 });
        const ceil = new THREE.Mesh(ceilGeo, ceilMat);
        ceil.rotation.x = Math.PI / 2;
        ceil.position.set(x + width / 2, toY + 3.5, z + depth / 2);
        this._scene.add(ceil);

        // Light
        const lightColor = parseInt(s.lightColor, 16) || 0xccaa88;
        const light = new THREE.PointLight(lightColor, s.lightIntensity || 0.1, 12);
        light.position.set(x + width / 2, toY + 3.0, z + depth / 2);
        this._scene.add(light);

        // Register as ramp for PlayerController
        this._ramps.push({ x, z, width, depth, fromY, toY });

        this._zones.push({
            id: s.id,
            x, z, width, depth,
            floorY: fromY,
            surfaceType: s.surfaceType,
        });
    }

    // ═══════════════════════════════════════════════════
    // Doors
    // ═══════════════════════════════════════════════════

    _buildDoors() {
        for (const d of this._mapData.doors) {
            this._buildDoor(d);
        }
    }

    _buildDoor(d) {
        // Find floor height at door position
        const zone = this._findZoneAt(d.x, d.z);
        const floorY = zone ? zone.floorY : 0;

        const doorColor = d.locked ? 0x5a2a2a : 0x6b4226;
        const doorMat = new THREE.MeshStandardMaterial({
            map: this._getTexture('door', 'door'),
            roughness: 0.7,
            color: doorColor,
        });

        // Door mesh
        const doorGeo = new THREE.BoxGeometry(DOOR_WIDTH, DOOR_HEIGHT, 0.08);
        // Offset geometry so pivot is at the left edge
        doorGeo.translate(DOOR_WIDTH / 2, DOOR_HEIGHT / 2, 0);
        const doorMesh = new THREE.Mesh(doorGeo, doorMat);
        doorMesh.castShadow = true;

        // Pivot group at hinge position
        const pivot = new THREE.Group();
        pivot.position.set(d.x - DOOR_WIDTH / 2, floorY, d.z);
        pivot.add(doorMesh);
        this._scene.add(pivot);

        // Door frame (darker trim)
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.9 });
        const frameThickness = 0.08;

        // Top frame
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(DOOR_WIDTH + 0.2, frameThickness, 0.12),
            frameMat
        );
        topFrame.position.set(d.x, floorY + DOOR_HEIGHT, d.z);
        this._scene.add(topFrame);

        // Side frames
        for (const side of [-1, 1]) {
            const sideFrame = new THREE.Mesh(
                new THREE.BoxGeometry(frameThickness, DOOR_HEIGHT, 0.12),
                frameMat
            );
            sideFrame.position.set(d.x + side * (DOOR_WIDTH / 2 + 0.05), floorY + DOOR_HEIGHT / 2, d.z);
            this._scene.add(sideFrame);
        }

        // Lock indicator light
        if (d.locked) {
            const indicatorGeo = new THREE.BoxGeometry(0.1, 0.1, 0.06);
            const indicatorMat = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.8,
            });
            const indicator = new THREE.Mesh(indicatorGeo, indicatorMat);
            indicator.position.set(d.x + DOOR_WIDTH / 2 - 0.3, floorY + DOOR_HEIGHT / 2, d.z + 0.05);
            this._scene.add(indicator);

            // Small red glow
            const redLight = new THREE.PointLight(0xff0000, 0.15, 2);
            redLight.position.copy(indicator.position);
            this._scene.add(redLight);
        }

        // Collision for closed door
        const collisionId = this._collision.addBox(
            d.x - DOOR_WIDTH / 2, d.z - 0.15,
            d.x + DOOR_WIDTH / 2, d.z + 0.15
        );

        // Tag mesh for interaction raycasting
        doorMesh.userData = { type: 'door', doorId: d.id };

        this._doors.set(d.id, {
            mesh: doorMesh,
            pivot,
            data: d,
            isOpen: false,
            animating: false,
            collisionId,
            floorY,
        });
    }

    _updateDoorCollision(door) {
        // Disable collision when open, re-enable when closed
        this._collision.setBoxEnabled(door.collisionId, !door.isOpen);
    }

    // ═══════════════════════════════════════════════════
    // Area Details — lights, furniture, floor overlays, zones
    // ═══════════════════════════════════════════════════

    _buildAreaDetails() {
        // Rooms
        for (const room of this._mapData.rooms) {
            this._buildRoomDetails(room);
        }

        // Hallways
        for (const hall of this._mapData.hallways) {
            this._buildHallwayDetails(hall);
        }
    }

    /**
     * For each room: add point light, furniture, room-specific floor overlay, register zone.
     * Does NOT build walls or ceiling — shell + interior walls handle those.
     */
    _buildRoomDetails(r) {
        const { id, x, z, width, depth, floorY, ceilingY } = r;
        const height = ceilingY - floorY;

        // Room-specific floor overlay (thin plane just above the shell floor)
        const floorTex = this._getTexture(r.floorTexture, 'floor');
        this._addFloorCeiling(x, z, width, depth, floorY + 0.001, floorTex, true);

        // Point light
        const lightColor = parseInt(r.lightColor, 16) || 0xffe4b5;
        const light = new THREE.PointLight(lightColor, r.lightIntensity || 0.2, Math.max(width, depth) + 5);
        light.position.set(x + width / 2, ceilingY - 0.3, z + depth / 2);
        light.castShadow = true;
        light.shadow.mapSize.width = 256;
        light.shadow.mapSize.height = 256;
        this._scene.add(light);

        // Furniture
        if (r.furniture) {
            for (const furn of r.furniture) {
                this._buildFurniture(furn, floorY, height);
            }
        }

        // Register zone
        this._zones.push({
            id: r.id,
            x, z, width, depth,
            floorY,
            surfaceType: r.surfaceType,
        });
    }

    /**
     * For each hallway: add lights, floor overlay, register zone.
     */
    _buildHallwayDetails(h) {
        const { x, z, width, depth, floorY, ceilingY } = h;

        // Hallway-specific floor overlay
        const floorTex = this._getTexture(h.floorTexture, 'floor');
        this._addFloorCeiling(x, z, width, depth, floorY + 0.001, floorTex, true);

        // Hallway lights
        const lightColor = parseInt(h.lightColor, 16) || 0xccbbaa;
        const count = h.lightCount || 1;
        for (let i = 0; i < count; i++) {
            const t = (i + 0.5) / count;
            const lx = x + width * t;
            const lz = z + depth * t;
            const light = new THREE.PointLight(lightColor, h.lightIntensity || 0.1, 10);
            light.position.set(lx, ceilingY - 0.3, lz);
            this._scene.add(light);
        }

        // Register zone
        this._zones.push({
            id: h.id,
            x, z, width, depth,
            floorY,
            surfaceType: h.surfaceType,
        });
    }

    // ═══════════════════════════════════════════════════
    // Furniture
    // ═══════════════════════════════════════════════════

    _buildFurniture(furn, floorY, roomHeight) {
        switch (furn.type) {
            case 'crate': return this._addCrate(furn.x, furn.z, floorY);
            case 'pillar': return this._addPillar(furn.x, furn.z, floorY, roomHeight);
            case 'desk': return this._addDesk(furn.x, furn.z, floorY, furn.width || 2, furn.depth || 1);
            case 'table': return this._addTable(furn.x, furn.z, floorY, furn.width || 2, furn.depth || 1.2);
            case 'chair': return this._addChair(furn.x, furn.z, floorY);
            case 'shelf': return this._addShelf(furn.x, furn.z, floorY, furn.width || 0.5, furn.depth || 3, roomHeight);
            case 'wardrobe': return this._addWardrobe(furn.x, furn.z, floorY);
            case 'server_rack': return this._addServerRack(furn.x, furn.z, floorY, furn.width || 0.6, furn.depth || 2);
        }
    }

    _addCrate(x, z, floorY) {
        const size = 0.7 + Math.random() * 0.3;
        const geo = new THREE.BoxGeometry(size, size, size);
        const mat = new THREE.MeshStandardMaterial({ color: 0x3a2510, roughness: 0.95 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, floorY + size / 2, z);
        mesh.rotation.y = Math.random() * 0.3 - 0.15;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._scene.add(mesh);
        const half = size / 2;
        this._collision.addBox(x - half, z - half, x + half, z + half);
    }

    _addPillar(x, z, floorY, height) {
        const r = 0.25;
        const geo = new THREE.BoxGeometry(r * 2, height, r * 2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x5a5550, roughness: 0.8 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, floorY + height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this._scene.add(mesh);
        this._collision.addBox(x - r, z - r, x + r, z + r);
    }

    _addDesk(x, z, floorY, w, d) {
        const h = 0.75;
        const topThick = 0.06;
        const topMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.8 });
        const legMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9 });

        // Top
        const top = new THREE.Mesh(new THREE.BoxGeometry(w, topThick, d), topMat);
        top.position.set(x, floorY + h, z);
        top.castShadow = true;
        top.receiveShadow = true;
        this._scene.add(top);

        // 4 legs
        const legW = 0.06;
        const legH = h - topThick;
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(legW, legH, legW), legMat);
            leg.position.set(x + dx * (w / 2 - 0.08), floorY + legH / 2, z + dz * (d / 2 - 0.08));
            leg.castShadow = true;
            this._scene.add(leg);
        }

        this._collision.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
    }

    _addTable(x, z, floorY, w, d) {
        const h = 0.72;
        const topMat = new THREE.MeshStandardMaterial({ color: 0x6b5b45, roughness: 0.75 });
        const legMat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 });

        const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), topMat);
        top.position.set(x, floorY + h, z);
        top.castShadow = true;
        top.receiveShadow = true;
        this._scene.add(top);

        // Central pedestal leg
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, h - 0.05, 0.1), legMat);
        leg.position.set(x, floorY + (h - 0.05) / 2, z);
        leg.castShadow = true;
        this._scene.add(leg);

        this._collision.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
    }

    _addChair(x, z, floorY) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x4a3828, roughness: 0.85 });
        const seatH = 0.45;
        const seatW = 0.45;

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(seatW, 0.04, seatW), mat);
        seat.position.set(x, floorY + seatH, z);
        seat.castShadow = true;
        this._scene.add(seat);

        // Back
        const back = new THREE.Mesh(new THREE.BoxGeometry(seatW, 0.4, 0.04), mat);
        back.position.set(x, floorY + seatH + 0.22, z - seatW / 2 + 0.02);
        back.castShadow = true;
        this._scene.add(back);

        // Legs
        for (const [dx, dz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.04, seatH, 0.04), mat);
            leg.position.set(x + dx * 0.18, floorY + seatH / 2, z + dz * 0.18);
            this._scene.add(leg);
        }

        this._collision.addBox(x - 0.25, z - 0.25, x + 0.25, z + 0.25);
    }

    _addShelf(x, z, floorY, w, d, roomHeight) {
        const shelfH = Math.min(roomHeight * 0.7, 2.2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x4a3a2a, roughness: 0.9 });

        // Back panel
        const panel = new THREE.Mesh(new THREE.BoxGeometry(w, shelfH, d), mat);
        panel.position.set(x, floorY + shelfH / 2, z);
        panel.castShadow = true;
        panel.receiveShadow = true;
        this._scene.add(panel);

        // Shelf horizontal dividers
        const shelfMat = new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.85 });
        const shelvesCount = 4;
        for (let i = 0; i <= shelvesCount; i++) {
            const sy = floorY + (shelfH * i) / shelvesCount;
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.03, d + 0.04), shelfMat);
            shelf.position.set(x, sy, z);
            this._scene.add(shelf);
        }

        this._collision.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
    }

    _addWardrobe(x, z, floorY) {
        const w = 1.2;
        const d = 0.6;
        const h = 2.0;
        const mat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.85 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        body.position.set(x, floorY + h / 2, z);
        body.castShadow = true;
        body.receiveShadow = true;
        this._scene.add(body);

        // Door line (center vertical)
        const lineMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a });
        const line = new THREE.Mesh(new THREE.BoxGeometry(0.02, h - 0.1, d + 0.01), lineMat);
        line.position.set(x, floorY + h / 2, z);
        this._scene.add(line);

        // Handle
        const handleMat = new THREE.MeshStandardMaterial({ color: 0xaa8844, metalness: 0.6 });
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), handleMat);
        handle.position.set(x + 0.08, floorY + h / 2, z + d / 2 + 0.03);
        this._scene.add(handle);

        body.userData = { type: 'hiding_spot', spotId: 'wardrobe_' + x + '_' + z };

        this._collision.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
    }

    _addServerRack(x, z, floorY, w, d) {
        const h = 2.0;
        const mat = new THREE.MeshStandardMaterial({ color: 0x2a2a30, metalness: 0.3, roughness: 0.6 });

        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        body.position.set(x, floorY + h / 2, z);
        body.castShadow = true;
        body.receiveShadow = true;
        this._scene.add(body);

        // Blinking LEDs
        const ledColors = [0x00ff00, 0x00ff00, 0xff8800, 0x00ff00];
        for (let i = 0; i < ledColors.length; i++) {
            const led = new THREE.Mesh(
                new THREE.BoxGeometry(0.03, 0.03, 0.02),
                new THREE.MeshStandardMaterial({
                    color: ledColors[i],
                    emissive: ledColors[i],
                    emissiveIntensity: 0.5,
                })
            );
            led.position.set(x + w / 2 + 0.01, floorY + 1.0 + i * 0.15, z);
            this._scene.add(led);
        }

        this._collision.addBox(x - w / 2, z - d / 2, x + w / 2, z + d / 2);
    }

    // ═══════════════════════════════════════════════════
    // Wall building with door gaps
    // ═══════════════════════════════════════════════════

    _buildWallSegment(x1, z1, x2, z2, axis, floorY, height, mat, doors, rotY) {
        // Find doors on this wall segment
        const wallDoors = [];
        for (const d of doors) {
            if (axis === 'z') {
                // Horizontal wall: check if door z matches wall z and door x is in range
                if (Math.abs(d.z - z1) < 0.5 && d.x >= Math.min(x1, x2) && d.x <= Math.max(x1, x2)) {
                    wallDoors.push(d);
                }
            } else {
                // Vertical wall: check if door x matches wall x and door z is in range
                if (Math.abs(d.x - x1) < 0.5 && d.z >= Math.min(z1, z2) && d.z <= Math.max(z1, z2)) {
                    wallDoors.push(d);
                }
            }
        }

        if (wallDoors.length === 0) {
            // Solid wall — no gaps
            const length = axis === 'z' ? Math.abs(x2 - x1) : Math.abs(z2 - z1);
            if (length < 0.01) return;

            const midX = (x1 + x2) / 2;
            const midZ = (z1 + z2) / 2;

            const geo = new THREE.PlaneGeometry(length, height);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(midX, floorY + height / 2, midZ);
            mesh.rotation.y = rotY;
            mesh.receiveShadow = true;
            this._scene.add(mesh);

            // Collision
            if (axis === 'z') {
                this._collision.addBox(
                    Math.min(x1, x2), z1 - WALL_THICKNESS / 2,
                    Math.max(x1, x2), z1 + WALL_THICKNESS / 2
                );
            } else {
                this._collision.addBox(
                    x1 - WALL_THICKNESS / 2, Math.min(z1, z2),
                    x1 + WALL_THICKNESS / 2, Math.max(z1, z2)
                );
            }
        } else {
            // Wall with door gap(s) — build segments around each door
            wallDoors.sort((a, b) => {
                return axis === 'z' ? a.x - b.x : a.z - b.z;
            });

            const halfDoor = DOOR_WIDTH / 2 + 0.1;
            let pos = axis === 'z' ? Math.min(x1, x2) : Math.min(z1, z2);
            const end = axis === 'z' ? Math.max(x1, x2) : Math.max(z1, z2);

            for (const door of wallDoors) {
                const doorCenter = axis === 'z' ? door.x : door.z;
                const gapStart = doorCenter - halfDoor;
                const gapEnd = doorCenter + halfDoor;

                // Segment before door
                if (gapStart > pos + 0.01) {
                    this._addWallPiece(axis, x1, z1, pos, gapStart, floorY, height, rotY, mat);
                }

                // Above-door piece
                const aboveDoorH = height - DOOR_HEIGHT;
                if (aboveDoorH > 0.01) {
                    this._addWallPieceAboveDoor(axis, x1, z1, gapStart, gapEnd, floorY + DOOR_HEIGHT, aboveDoorH, rotY, mat);
                }

                pos = gapEnd;
            }

            // Segment after last door
            if (end > pos + 0.01) {
                this._addWallPiece(axis, x1, z1, pos, end, floorY, height, rotY, mat);
            }
        }
    }

    _addWallPiece(axis, wallX, wallZ, from, to, floorY, height, rotY, mat) {
        const length = to - from;
        if (length < 0.01) return;

        let px, pz;
        if (axis === 'z') {
            px = from + length / 2;
            pz = wallZ;
        } else {
            px = wallX;
            pz = from + length / 2;
        }

        const geo = new THREE.PlaneGeometry(length, height);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(px, floorY + height / 2, pz);
        mesh.rotation.y = rotY;
        mesh.receiveShadow = true;
        this._scene.add(mesh);

        if (axis === 'z') {
            this._collision.addBox(from, wallZ - WALL_THICKNESS / 2, to, wallZ + WALL_THICKNESS / 2);
        } else {
            this._collision.addBox(wallX - WALL_THICKNESS / 2, from, wallX + WALL_THICKNESS / 2, to);
        }
    }

    _addWallPieceAboveDoor(axis, wallX, wallZ, from, to, floorY, height, rotY, mat) {
        const length = to - from;
        if (length < 0.01) return;

        let px, pz;
        if (axis === 'z') {
            px = from + length / 2;
            pz = wallZ;
        } else {
            px = wallX;
            pz = from + length / 2;
        }

        const geo = new THREE.PlaneGeometry(length, height);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(px, floorY + height / 2, pz);
        mesh.rotation.y = rotY;
        mesh.receiveShadow = true;
        this._scene.add(mesh);
        // No collision for above-door — player can't reach it
    }

    // ═══════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════

    _addFloorCeiling(x, z, w, d, y, texture, isFloor) {
        const geo = new THREE.PlaneGeometry(w, d);
        const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: isFloor ? 0.9 : 1.0 });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = isFloor ? -Math.PI / 2 : Math.PI / 2;
        mesh.position.set(x + w / 2, y, z + d / 2);
        mesh.receiveShadow = isFloor;
        this._scene.add(mesh);
    }

    _findDoorsForArea(areaId, x, z, w, d) {
        if (!this._mapData || !this._mapData.doors) return [];
        return this._mapData.doors.filter(door => {
            if (door.from !== areaId && door.to !== areaId) return false;
            // Check if door is on or near the boundary of this area
            const onBoundary =
                Math.abs(door.x - x) < 0.5 || Math.abs(door.x - (x + w)) < 0.5 ||
                Math.abs(door.z - z) < 0.5 || Math.abs(door.z - (z + d)) < 0.5;
            return onBoundary;
        });
    }

    _findZoneAt(x, z) {
        // Check rooms first, then hallways
        const allAreas = [...(this._mapData.rooms || []), ...(this._mapData.hallways || [])];
        for (const area of allAreas) {
            if (x >= area.x && x <= area.x + area.width &&
                z >= area.z && z <= area.z + area.depth) {
                return area;
            }
        }
        return null;
    }

    // ═══════════════════════════════════════════════════
    // Procedural Textures
    // ═══════════════════════════════════════════════════

    _getTexture(name, category) {
        const key = name + '_' + category;
        if (this._textureCache[key]) return this._textureCache[key];

        const tex = this._generateTexture(name, category);
        this._textureCache[key] = tex;
        return tex;
    }

    _generateTexture(name, category) {
        const res = 128;
        const canvas = document.createElement('canvas');
        canvas.width = res;
        canvas.height = res;
        const ctx = canvas.getContext('2d');

        switch (name) {
            case 'wood':
                this._drawWoodTexture(ctx, res);
                break;
            case 'tile':
                this._drawTileTexture(ctx, res);
                break;
            case 'concrete':
                this._drawConcreteTexture(ctx, res);
                break;
            case 'brick':
                this._drawBrickTexture(ctx, res);
                break;
            case 'metal':
                this._drawMetalTexture(ctx, res);
                break;
            case 'plaster':
                this._drawPlasterTexture(ctx, res);
                break;
            case 'wood_panel':
                this._drawWoodPanelTexture(ctx, res);
                break;
            case 'wallpaper':
                this._drawWallpaperTexture(ctx, res);
                break;
            case 'ceiling':
                this._drawCeilingTexture(ctx, res);
                break;
            case 'door':
                this._drawDoorTexture(ctx, res);
                break;
            default:
                this._drawPlasterTexture(ctx, res);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        // Adjust repeat based on category
        if (category === 'floor') texture.repeat.set(3, 3);
        else if (category === 'wall') texture.repeat.set(3, 2);
        else if (category === 'ceiling') texture.repeat.set(2, 2);
        else texture.repeat.set(1, 1);

        return texture;
    }

    _noise(ctx, res, color, density, alpha) {
        const hex = '#' + color.toString(16).padStart(6, '0');
        for (let y = 0; y < res; y++) {
            for (let x = 0; x < res; x++) {
                if (Math.random() > density) continue;
                ctx.fillStyle = hex;
                ctx.globalAlpha = Math.random() * alpha;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        ctx.globalAlpha = 1;
    }

    _drawWoodTexture(ctx, res) {
        ctx.fillStyle = '#3b2716';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x4a3420, 0.4, 0.4);

        // Horizontal wood grain lines
        ctx.strokeStyle = 'rgba(0,0,0,0.12)';
        ctx.lineWidth = 1;
        for (let y = 0; y < res; y += res / 6) {
            ctx.beginPath();
            ctx.moveTo(0, y + Math.random() * 2);
            ctx.lineTo(res, y + Math.random() * 2);
            ctx.stroke();
        }
        // Vertical plank lines
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 2;
        for (let x = 0; x < res; x += res / 4) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, res);
            ctx.stroke();
        }
    }

    _drawTileTexture(ctx, res) {
        ctx.fillStyle = '#b8b0a0';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0xa8a090, 0.3, 0.3);

        // Tile grid
        ctx.strokeStyle = 'rgba(80,70,60,0.3)';
        ctx.lineWidth = 2;
        const tileSize = res / 4;
        for (let i = 0; i <= res; i += tileSize) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, res); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(res, i); ctx.stroke();
        }

        // Grout lines
        ctx.strokeStyle = 'rgba(60,55,45,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= res; i += tileSize) {
            ctx.beginPath(); ctx.moveTo(i + 1, 0); ctx.lineTo(i + 1, res); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, i + 1); ctx.lineTo(res, i + 1); ctx.stroke();
        }
    }

    _drawConcreteTexture(ctx, res) {
        ctx.fillStyle = '#6a6560';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x7a756f, 0.5, 0.5);
        this._noise(ctx, res, 0x5a5550, 0.2, 0.3);

        // Cracks
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * res, Math.random() * res);
            ctx.lineTo(Math.random() * res, Math.random() * res);
            ctx.stroke();
        }
    }

    _drawBrickTexture(ctx, res) {
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(0, 0, res, res);

        const brickH = res / 6;
        const brickW = res / 3;
        ctx.strokeStyle = 'rgba(60,40,20,0.5)';
        ctx.lineWidth = 2;

        for (let row = 0; row < 6; row++) {
            const offset = row % 2 === 0 ? 0 : brickW / 2;
            for (let col = -1; col < 4; col++) {
                const bx = col * brickW + offset;
                const by = row * brickH;

                // Slight color variation per brick
                const shade = 0x7a3510 + Math.floor(Math.random() * 0x202020);
                ctx.fillStyle = '#' + shade.toString(16).padStart(6, '0');
                ctx.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
            }
            // Mortar lines
            ctx.beginPath();
            ctx.moveTo(0, row * brickH);
            ctx.lineTo(res, row * brickH);
            ctx.stroke();
        }

        this._noise(ctx, res, 0x5a3010, 0.2, 0.2);
    }

    _drawMetalTexture(ctx, res) {
        ctx.fillStyle = '#5a5a60';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x6a6a70, 0.4, 0.3);

        // Rivets / panel lines
        ctx.strokeStyle = 'rgba(40,40,50,0.3)';
        ctx.lineWidth = 1;
        for (let x = 0; x < res; x += res / 3) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, res); ctx.stroke();
        }
        for (let y = 0; y < res; y += res / 3) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(res, y); ctx.stroke();
        }

        // Rivet dots
        ctx.fillStyle = 'rgba(80,80,90,0.6)';
        const panel = res / 3;
        for (let py = 0; py < 3; py++) {
            for (let px = 0; px < 3; px++) {
                ctx.beginPath();
                ctx.arc(px * panel + 4, py * panel + 4, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    _drawPlasterTexture(ctx, res) {
        ctx.fillStyle = '#6b6359';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x7a7269, 0.5, 0.35);
        this._noise(ctx, res, 0x5c5449, 0.2, 0.2);

        // Stains
        ctx.fillStyle = 'rgba(50,45,35,0.1)';
        for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * res, Math.random() * res, 5 + Math.random() * 10, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawWoodPanelTexture(ctx, res) {
        ctx.fillStyle = '#4a3525';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x5a4535, 0.4, 0.35);

        // Vertical panel grooves
        ctx.strokeStyle = 'rgba(30,20,10,0.4)';
        ctx.lineWidth = 2;
        for (let x = 0; x < res; x += res / 5) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, res); ctx.stroke();
        }

        // Horizontal rail
        ctx.strokeStyle = 'rgba(30,20,10,0.25)';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, res / 2); ctx.lineTo(res, res / 2); ctx.stroke();
    }

    _drawWallpaperTexture(ctx, res) {
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x6a5a4a, 0.3, 0.3);

        // Faded diamond pattern
        ctx.strokeStyle = 'rgba(80,65,45,0.2)';
        ctx.lineWidth = 1;
        const diamond = res / 4;
        for (let y = 0; y < res; y += diamond) {
            for (let x = 0; x < res; x += diamond) {
                ctx.beginPath();
                ctx.moveTo(x + diamond / 2, y);
                ctx.lineTo(x + diamond, y + diamond / 2);
                ctx.lineTo(x + diamond / 2, y + diamond);
                ctx.lineTo(x, y + diamond / 2);
                ctx.closePath();
                ctx.stroke();
            }
        }

        // Peeling/damage spots
        ctx.fillStyle = 'rgba(100,85,65,0.15)';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * res, Math.random() * res, 3 + Math.random() * 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawCeilingTexture(ctx, res) {
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x555555, 0.4, 0.3);

        // Water stains
        ctx.fillStyle = 'rgba(55,50,40,0.1)';
        for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * res, Math.random() * res, 8 + Math.random() * 15, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawDoorTexture(ctx, res) {
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(0, 0, res, res);
        this._noise(ctx, res, 0x6a4a2a, 0.4, 0.3);

        // Panel insets
        ctx.strokeStyle = 'rgba(30,15,5,0.4)';
        ctx.lineWidth = 2;
        const pad = res * 0.15;
        // Top panel
        ctx.strokeRect(pad, pad, res - pad * 2, res * 0.35);
        // Bottom panel
        ctx.strokeRect(pad, res * 0.55, res - pad * 2, res * 0.35);
    }
}

export default MapBuilder;
