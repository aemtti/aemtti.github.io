// mapbuild.js — turns the ASCII grid into render geometry, collision boxes and a nav graph.
import * as THREE from 'three';
import {
  CELL, GRID, GRID_W, GRID_H, RAISE, STAIRS, ROOFS, REGION_MATS, PROPS,
  DEFAULT_FLOOR_MAT, DEFAULT_WALL_MAT, DEFAULT_SURF,
} from './brushes.js';
import { worldTex } from './textures.js';

export const WALL_TOP = 448;
export const FLOOR_THICK = 96;
const STEP_RISE = 16;
const SOLID = -100000;

const idx = (c, r) => r * GRID_W + c;
export const cellX = (c) => (c - (GRID_W / 2 - 0.5)) * CELL;
export const cellY = (r) => ((GRID_H / 2 - 0.5) - r) * CELL;
export const xToCell = (x) => Math.round(x / CELL + (GRID_W / 2 - 0.5));
export const yToCell = (y) => Math.round((GRID_H / 2 - 0.5) - y / CELL);

// ---------------------------------------------------------------- grid pass
function buildGrid() {
  const n = GRID_W * GRID_H;
  const solid = new Uint8Array(n);
  const height = new Float32Array(n);
  const stairId = new Int8Array(n).fill(-1);
  const roofZ = new Float32Array(n).fill(0);
  const floorMat = new Array(n).fill(DEFAULT_FLOOR_MAT);
  const wallMat = new Array(n).fill(DEFAULT_WALL_MAT);
  const surf = new Uint8Array(n).fill(DEFAULT_SURF);

  for (let r = 0; r < GRID_H; r++) {
    const row = GRID[r];
    if (!row || row.length !== GRID_W) throw new Error(`grid row ${r} is ${row ? row.length : 'missing'}, expected ${GRID_W}`);
    for (let c = 0; c < GRID_W; c++) {
      const i = idx(c, r);
      if (row[c] !== '.') { solid[i] = 1; height[i] = SOLID; }
    }
  }
  for (const [c0, r0, c1, r1, z] of RAISE) {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const i = idx(c, r); if (!solid[i]) height[i] = z;
    }
  }
  // stairs override the flat height with the ramp height at the cell centre
  STAIRS.forEach(([c0, r0, c1, r1, zl, zh, dir], si) => {
    const along = (dir === 'N' || dir === 'S') ? (r1 - r0 + 1) : (c1 - c0 + 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const i = idx(c, r); if (solid[i]) continue;
      let t;
      if (dir === 'N') t = (r1 - r + 0.5) / along;
      else if (dir === 'S') t = (r - r0 + 0.5) / along;
      else if (dir === 'E') t = (c - c0 + 0.5) / along;
      else t = (c1 - c + 0.5) / along;
      height[i] = zl + (zh - zl) * t;
      stairId[i] = si;
    }
  });
  for (const [c0, r0, c1, r1, z] of ROOFS) {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const i = idx(c, r); if (!solid[i]) roofZ[i] = z;
    }
  }
  for (const [c0, r0, c1, r1, fm, wm, sf] of REGION_MATS) {
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const i = idx(c, r);
      floorMat[i] = fm; wallMat[i] = wm; surf[i] = sf;
    }
  }
  return { solid, height, stairId, roofZ, floorMat, wallMat, surf };
}

/** merge equal-key cells into maximal rectangles */
function greedyRects(key) {
  const used = new Uint8Array(GRID_W * GRID_H);
  const out = [];
  for (let r = 0; r < GRID_H; r++) {
    for (let c = 0; c < GRID_W; c++) {
      const i = idx(c, r);
      if (used[i]) continue;
      const k = key(c, r);
      if (k === null) { used[i] = 1; continue; }
      let w = 1;
      while (c + w < GRID_W && !used[idx(c + w, r)] && key(c + w, r) === k) w++;
      let h = 1;
      grow: while (r + h < GRID_H) {
        for (let j = 0; j < w; j++) {
          if (used[idx(c + j, r + h)] || key(c + j, r + h) !== k) break grow;
        }
        h++;
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) used[idx(c + x, r + y)] = 1;
      out.push({ c, r, w, h, key: k });
    }
  }
  return out;
}

// ---------------------------------------------------------------- mesh building
class MeshBuf {
  constructor() { this.pos = []; this.nor = []; this.uv = []; this.col = []; }
  /**
   * Quad from 4 corners with a per-corner AO term. The winding is auto-corrected
   * to agree with `n`, so callers only have to get the outward normal right.
   */
  quad(a, b, c, d, n, uvs, ao) {
    const P = this.pos, N = this.nor, U = this.uv, C = this.col;
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    const gx = uy * vz - uz * vy, gy = uz * vx - ux * vz, gz = ux * vy - uy * vx;
    if (gx * n[0] + gy * n[1] + gz * n[2] < 0) {
      const t = b; b = d; d = t;                 // reverse winding
      uvs = [uvs[0], uvs[1], uvs[6], uvs[7], uvs[4], uvs[5], uvs[2], uvs[3]];
      ao = [ao[0], ao[3], ao[2], ao[1]];
    }
    const pts = [a, b, c, a, c, d];
    const uvi = [0, 1, 2, 0, 2, 3];
    for (let i = 0; i < 6; i++) {
      const p = pts[i];
      P.push(p[0], p[1], p[2]);
      N.push(n[0], n[1], n[2]);
      U.push(uvs[uvi[i] * 2], uvs[uvi[i] * 2 + 1]);
      const s = ao[uvi[i]];
      C.push(s, s, s);
    }
  }
  geometry() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.nor, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.col, 3));
    g.computeBoundingSphere();
    return g;
  }
  get empty() { return this.pos.length === 0; }
}

export function buildMap() {
  const G = buildGrid();
  const { solid, height, stairId, roofZ, floorMat, wallMat, surf } = G;
  const open = (c, r) => c >= 0 && r >= 0 && c < GRID_W && r < GRID_H && !solid[idx(c, r)];
  const hAt = (c, r) => (open(c, r) ? height[idx(c, r)] : SOLID);

  const bufs = new Map();
  const buf = (m) => { if (!bufs.has(m)) bufs.set(m, new MeshBuf()); return bufs.get(m); };

  // ---- ambient occlusion helper: darken corners next to solid/taller cells
  const cornerAO = (c, r, dc, dr, z) => {
    let occ = 0;
    const s1 = hAt(c + dc, r) > z + 24 ? 1 : 0;
    const s2 = hAt(c, r + dr) > z + 24 ? 1 : 0;
    const s3 = hAt(c + dc, r + dr) > z + 24 ? 1 : 0;
    occ = s1 + s2 + (s1 && s2 ? 1 : s3);
    return 1 - Math.min(occ, 3) * 0.13;
  };

  // ---- floors -----------------------------------------------------------
  for (let r = 0; r < GRID_H; r++) {
    for (let c = 0; c < GRID_W; c++) {
      const i = idx(c, r);
      if (solid[i]) continue;
      const x0 = cellX(c) - CELL / 2, x1 = x0 + CELL;
      const y0 = cellY(r) - CELL / 2, y1 = y0 + CELL;
      const m = buf(floorMat[i]);
      const u0 = x0 / CELL, u1 = x1 / CELL, v0 = y0 / CELL, v1 = y1 / CELL;

      if (stairId[i] >= 0) {
        // physical steps
        const [sc0, sr0, sc1, sr1, zl, zh, dir] = STAIRS[stairId[i]];
        const along = (dir === 'N' || dir === 'S') ? (sr1 - sr0 + 1) : (sc1 - sc0 + 1);
        const steps = Math.max(1, Math.round((zh - zl) / STEP_RISE));
        const runLen = along * CELL;
        const depth = runLen / steps;
        const horiz = (dir === 'E' || dir === 'W');
        const lo = horiz ? cellX(sc0) - CELL / 2 : cellY(sr1) - CELL / 2;   // low-coordinate end
        for (let s = 0; s < steps; s++) {
          // step s spans [lo + s*depth, lo + (s+1)*depth] in the ascent axis
          let a0 = lo + s * depth, a1 = a0 + depth;
          let t = (s + 1) / steps;                      // top height of this step
          if (dir === 'W' || dir === 'S') t = 1 - s / steps;
          const zTop = zl + (zh - zl) * t;
          let bx0, bx1, by0, by1;
          if (horiz) { bx0 = a0; bx1 = a1; by0 = y0; by1 = y1; }
          else { by0 = a0; by1 = a1; bx0 = x0; bx1 = x1; }
          if (bx1 <= x0 || bx0 >= x1 || by1 <= y0 || by0 >= y1) continue;
          bx0 = Math.max(bx0, x0); bx1 = Math.min(bx1, x1);
          by0 = Math.max(by0, y0); by1 = Math.min(by1, y1);
          m.quad([bx0, by0, zTop], [bx1, by0, zTop], [bx1, by1, zTop], [bx0, by1, zTop],
            [0, 0, 1], [bx0 / CELL, by0 / CELL, bx1 / CELL, by0 / CELL, bx1 / CELL, by1 / CELL, bx0 / CELL, by1 / CELL],
            [0.94, 0.94, 1, 1]);
          // Riser. It belongs on the step's downhill edge only — a0/a1 are the
          // step's true bounds, while bx/by have been clipped to this cell, so
          // using those would stamp an extra riser on every cell seam.
          const zBot = zTop - (zh - zl) / steps;
          const ao = [0.7, 0.7, 0.86, 0.86];
          if (horiz) {
            const up = dir === 'E';
            const edge = up ? a0 : a1;
            const nx = up ? -1 : 1;
            // exactly one cell owns the edge; which bound is inclusive depends on
            // whether the riser sits on the step's low or high side, otherwise a
            // riser landing on a cell boundary is dropped by both cells
            if (up ? (edge >= x0 && edge < x1) : (edge > x0 && edge <= x1)) {
              m.quad([edge, by0, zBot], [edge, by1, zBot], [edge, by1, zTop], [edge, by0, zTop],
                [nx, 0, 0],
                [by0 / CELL, zBot / CELL, by1 / CELL, zBot / CELL, by1 / CELL, zTop / CELL, by0 / CELL, zTop / CELL],
                ao);
            }
          } else {
            // ascending +Y puts the drop at the step's low edge pointing -Y
            const up = dir === 'N';
            const edge = up ? a0 : a1;
            const ny = up ? -1 : 1;
            if (up ? (edge >= y0 && edge < y1) : (edge > y0 && edge <= y1)) {
              m.quad([bx0, edge, zBot], [bx1, edge, zBot], [bx1, edge, zTop], [bx0, edge, zTop],
                [0, ny, 0],
                [bx0 / CELL, zBot / CELL, bx1 / CELL, zBot / CELL, bx1 / CELL, zTop / CELL, bx0 / CELL, zTop / CELL],
                ao);
            }
          }
        }
      } else {
        const z = height[i];
        m.quad([x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [0, 0, 1],
          [u0, v0, u1, v0, u1, v1, u0, v1],
          [cornerAO(c, r, -1, 1, z), cornerAO(c, r, 1, 1, z), cornerAO(c, r, 1, -1, z), cornerAO(c, r, -1, -1, z)]);
      }

      // ---- walls toward each neighbour ---------------------------------
      // On a stair cell `height` is the ramp value at the cell *centre*; the
      // steps inside the cell sit both above and below it, so start the wall at
      // the run's lowest point or a slit opens along the bottom of the wall.
      const z = stairId[i] >= 0 ? STAIRS[stairId[i]][4] : height[i];
      // normals point back into this cell — that is the face the player sees
      const sides = [
        { dc: 0, dr: -1, n: [0, -1, 0], ax: [x0, y1, x1, y1] },  // wall on the north edge
        { dc: 0, dr: 1, n: [0, 1, 0], ax: [x1, y0, x0, y0] },
        { dc: 1, dr: 0, n: [-1, 0, 0], ax: [x1, y1, x1, y0] },
        { dc: -1, dr: 0, n: [1, 0, 0], ax: [x0, y0, x0, y1] },
      ];
      for (const s of sides) {
        const nOpen = open(c + s.dc, r + s.dr);
        const ni = nOpen ? idx(c + s.dc, r + s.dr) : -1;
        const nh = hAt(c + s.dc, r + s.dr);
        let zTop;
        if (!nOpen) zTop = WALL_TOP;
        else if (nh > z + 1) {
          // Two cells of the same run differ in ramp height, but there is no
          // real ledge between them — the risers already supply every vertical
          // face. Emitting one puts a wall across the middle of the staircase.
          if (stairId[i] >= 0 || stairId[ni] >= 0) continue;
          zTop = nh;
        } else continue;
        const wm = buf(nOpen ? floorMat[ni] : wallMat[i]);
        const [ax0, ay0, ax1, ay1] = s.ax;
        const len = Math.hypot(ax1 - ax0, ay1 - ay0);
        const uo = (Math.abs(s.n[0]) > 0.5 ? y0 : x0) / CELL;
        const uvs = [uo, z / CELL, uo + len / CELL, z / CELL, uo + len / CELL, zTop / CELL, uo, zTop / CELL];
        const aoB = 0.62, aoT = nOpen ? 0.9 : 1.0;
        wm.quad([ax0, ay0, z], [ax1, ay1, z], [ax1, ay1, zTop], [ax0, ay0, zTop], s.n, uvs,
          [aoB, aoB, aoT, aoT]);
      }

      // ---- ceiling ------------------------------------------------------
      if (roofZ[i] > 0) {
        const rz = roofZ[i];
        const cm = buf('concrete');
        cm.quad([x0, y1, rz], [x1, y1, rz], [x1, y0, rz], [x0, y0, rz], [0, 0, -1],
          [u0, v1, u1, v1, u1, v0, u0, v0], [0.5, 0.5, 0.5, 0.5]);
        // top of the slab — the collision box is rz..rz+32, so without this the
        // roof is an invisible collider when seen from above
        const rt = rz + 32;
        cm.quad([x0, y0, rt], [x1, y0, rt], [x1, y1, rt], [x0, y1, rt], [0, 0, 1],
          [u0, v0, u1, v0, u1, v1, u0, v1], [1, 1, 1, 1]);
        // Face above the opening, running up to the neighbour's ceiling — or to
        // the wall top when they have none. This also closes a step between two
        // roofed cells of different heights, which would otherwise be a slit.
        for (const s of sides) {
          if (!open(c + s.dc, r + s.dr)) continue;   // solid neighbour: wall covers it
          const ni = idx(c + s.dc, r + s.dr);
          const nTop = roofZ[ni] > 0 ? roofZ[ni] : WALL_TOP;
          if (nTop <= rz + 0.5) continue;            // their ceiling is not higher
          const [ax0, ay0, ax1, ay1] = s.ax;
          const len = Math.hypot(ax1 - ax0, ay1 - ay0);
          const uo = (Math.abs(s.n[0]) > 0.5 ? y0 : x0) / CELL;
          const ln = [-s.n[0], -s.n[1], -s.n[2]];    // seen from the neighbour's side
          buf(wallMat[i]).quad([ax0, ay0, rz], [ax1, ay1, rz], [ax1, ay1, nTop], [ax0, ay0, nTop],
            ln, [uo, rz / CELL, uo + len / CELL, rz / CELL, uo + len / CELL, nTop / CELL, uo, nTop / CELL],
            [0.75, 0.75, 1, 1]);
        }
      }
    }
  }

  // ---- top surface of the surrounding rock, so the skyline is not hollow ----
  // Roofed cells count as rock too: a covered corridor is a tunnel through the
  // massif, so it must be capped and solid above its ceiling.
  {
    const rects = greedyRects((c, r) => {
      const i = idx(c, r);
      return (solid[i] || roofZ[i] > 0) ? 'S' : null;
    });
    const m = buf('gravel');
    for (const q of rects) {
      const x0 = cellX(q.c) - CELL / 2, x1 = cellX(q.c + q.w - 1) + CELL / 2;
      const y1 = cellY(q.r) + CELL / 2, y0 = cellY(q.r + q.h - 1) - CELL / 2;
      m.quad([x0, y0, WALL_TOP], [x1, y0, WALL_TOP], [x1, y1, WALL_TOP], [x0, y1, WALL_TOP],
        [0, 0, 1], [x0 / CELL, y0 / CELL, x1 / CELL, y0 / CELL, x1 / CELL, y1 / CELL, x0 / CELL, y1 / CELL],
        [1, 1, 1, 1]);
    }
  }

  // ---- props -------------------------------------------------------------
  for (const p of PROPS) {
    const m = buf(p.mat);
    const x0 = p.x - p.hx, x1 = p.x + p.hx, y0 = p.y - p.hy, y1 = p.y + p.hy;
    const z0 = p.z, z1 = p.z + p.h;
    const su = (a, b) => [0, 0, (b - a) / CELL, 0, (b - a) / CELL, 0, 0, 0];
    const uvBox = (w, h) => [0, 0, w / CELL, 0, w / CELL, h / CELL, 0, h / CELL];
    const W2 = x1 - x0, D = y1 - y0, H2 = z1 - z0;
    m.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], uvBox(W2, D), [1, 1, 1, 1]);
    m.quad([x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], [0, 1, 0], uvBox(W2, H2), [0.72, 0.72, 1, 1]);
    m.quad([x1, y0, z0], [x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [0, -1, 0], uvBox(W2, H2), [0.72, 0.72, 1, 1]);
    m.quad([x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [1, 0, 0], uvBox(D, H2), [0.8, 0.8, 1, 1]);
    m.quad([x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [-1, 0, 0], uvBox(D, H2), [0.8, 0.8, 1, 1]);
    void su;
  }

  // ---- assemble meshes ----------------------------------------------------
  const group = new THREE.Group();
  group.name = 'world';
  for (const [matName, mb] of bufs) {
    if (mb.empty) continue;
    const mat = new THREE.MeshPhongMaterial({
      map: worldTex(matName),
      vertexColors: true,
      shininess: matName === 'metal' ? 26 : 2,
      specular: matName === 'metal' ? 0x60666c : 0x0a0a0a,
    });
    const mesh = new THREE.Mesh(mb.geometry(), mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'world_' + matName;
    group.add(mesh);
  }

  // ---- collision ----------------------------------------------------------
  const boxes = [];
  const addBox = (x0, y0, z0, x1, y1, z1, sf, kind) => {
    boxes.push({
      min: { x: x0, y: y0, z: z0 }, max: { x: x1, y: y1, z: z1 },
      surf: sf, kind: kind || 'world',
    });
  };
  // solid columns
  for (const q of greedyRects((c, r) => (solid[idx(c, r)] ? 'S' : null))) {
    addBox(cellX(q.c) - CELL / 2, cellY(q.r + q.h - 1) - CELL / 2, -FLOOR_THICK,
      cellX(q.c + q.w - 1) + CELL / 2, cellY(q.r) + CELL / 2, WALL_TOP, 1);
  }
  // flat floors, merged per height+surface
  for (const q of greedyRects((c, r) => {
    const i = idx(c, r);
    if (solid[i] || stairId[i] >= 0) return null;
    return height[i] + ':' + surf[i];
  })) {
    const z = parseFloat(q.key.split(':')[0]);
    const sf = parseInt(q.key.split(':')[1], 10);
    addBox(cellX(q.c) - CELL / 2, cellY(q.r + q.h - 1) - CELL / 2, z - FLOOR_THICK,
      cellX(q.c + q.w - 1) + CELL / 2, cellY(q.r) + CELL / 2, z, sf);
  }
  // stairs -> one box per step
  STAIRS.forEach(([c0, r0, c1, r1, zl, zh, dir]) => {
    const horiz = (dir === 'E' || dir === 'W');
    const along = horiz ? (c1 - c0 + 1) : (r1 - r0 + 1);
    const steps = Math.max(1, Math.round((zh - zl) / STEP_RISE));
    const runLen = along * CELL;
    const depth = runLen / steps;
    const lo = horiz ? cellX(c0) - CELL / 2 : cellY(r1) - CELL / 2;
    const cross0 = horiz ? cellY(r1) - CELL / 2 : cellX(c0) - CELL / 2;
    const cross1 = horiz ? cellY(r0) + CELL / 2 : cellX(c1) + CELL / 2;
    for (let s = 0; s < steps; s++) {
      const a0 = lo + s * depth, a1 = a0 + depth;
      let t = (s + 1) / steps;
      if (dir === 'W' || dir === 'S') t = 1 - s / steps;
      const zTop = zl + (zh - zl) * t;
      if (horiz) addBox(a0, cross0, zTop - FLOOR_THICK - 64, a1, cross1, zTop, 1);
      else addBox(cross0, a0, zTop - FLOOR_THICK - 64, cross1, a1, zTop, 1);
    }
  });
  // Ceilings, taken from the per-cell roof grid rather than the raw ROOFS list.
  // Where two ROOFS rects overlap the grid keeps the last one, so building
  // collision from the list directly would leave an invisible slab behind.
  for (const q of greedyRects((c, r) => {
    const i = idx(c, r);
    if (solid[i] || roofZ[i] <= 0) return null;
    return 'R' + roofZ[i];
  })) {
    const z = parseFloat(q.key.slice(1));
    // solid all the way to the wall top — the lintel above the opening is drawn
    // as wall, so it has to stop bullets and grenades like one
    addBox(cellX(q.c) - CELL / 2, cellY(q.r + q.h - 1) - CELL / 2, z,
      cellX(q.c + q.w - 1) + CELL / 2, cellY(q.r) + CELL / 2, WALL_TOP, 1);
  }
  // props
  for (const p of PROPS) {
    addBox(p.x - p.hx, p.y - p.hy, p.z, p.x + p.hx, p.y + p.hy, p.z + p.h, p.surf, 'prop');
  }

  // ---- broadphase ---------------------------------------------------------
  const BP = 384;
  const bpMinX = -GRID_W * CELL / 2 - CELL, bpMinY = -GRID_H * CELL / 2 - CELL;
  const bpW = Math.ceil((GRID_W * CELL + CELL * 2) / BP);
  const bpH = Math.ceil((GRID_H * CELL + CELL * 2) / BP);
  const bins = new Array(bpW * bpH);
  for (let i = 0; i < bins.length; i++) bins[i] = [];
  const bpIdx = (bx, by) => by * bpW + bx;
  boxes.forEach((b, i) => {
    const x0 = Math.max(0, Math.floor((b.min.x - bpMinX) / BP));
    const x1 = Math.min(bpW - 1, Math.floor((b.max.x - bpMinX) / BP));
    const y0 = Math.max(0, Math.floor((b.min.y - bpMinY) / BP));
    const y1 = Math.min(bpH - 1, Math.floor((b.max.y - bpMinY) / BP));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) bins[bpIdx(x, y)].push(i);
  });
  let queryStamp = 0;
  const stamps = new Int32Array(boxes.length);
  const scratch = [];
  /** boxes overlapping the given xy rect (deduped, reused array) */
  function query(minx, miny, maxx, maxy) {
    queryStamp++;
    scratch.length = 0;
    const x0 = Math.max(0, Math.floor((minx - bpMinX) / BP));
    const x1 = Math.min(bpW - 1, Math.floor((maxx - bpMinX) / BP));
    const y0 = Math.max(0, Math.floor((miny - bpMinY) / BP));
    const y1 = Math.min(bpH - 1, Math.floor((maxy - bpMinY) / BP));
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const list = bins[bpIdx(x, y)];
        for (let k = 0; k < list.length; k++) {
          const bi = list[k];
          if (stamps[bi] === queryStamp) continue;
          stamps[bi] = queryStamp;
          scratch.push(boxes[bi]);
        }
      }
    }
    return scratch;
  }

  // ---- nav graph ----------------------------------------------------------
  // props are not part of the grid, so the graph has to be told about them or
  // it will happily route a bot straight through a crate
  const nav = buildNav(G, open, boxes.filter((b) => b.kind === 'prop'));

  return {
    grid: G, boxes, query, group, nav,
    open, height, solid, surf, roofZ, stairId,
    cellX, cellY, xToCell, yToCell, idx,
    /** floor height under a world position (SOLID if inside rock) */
    floorAt(x, y) {
      const c = xToCell(x), r = yToCell(y);
      if (c < 0 || r < 0 || c >= GRID_W || r >= GRID_H) return SOLID;
      const i = idx(c, r);
      return solid[i] ? SOLID : height[i];
    },
    surfaceAt(x, y) {
      const c = xToCell(x), r = yToCell(y);
      if (c < 0 || r < 0 || c >= GRID_W || r >= GRID_H) return DEFAULT_SURF;
      return surf[idx(c, r)];
    },
    isOpenAt(x, y) {
      const c = xToCell(x), r = yToCell(y);
      return c >= 0 && r >= 0 && c < GRID_W && r < GRID_H && !solid[idx(c, r)];
    },
  };
}

/**
 * Does the walk from a to b clip a prop the player cannot step over?
 * 2D slab test against each prop expanded by the hull half-width.
 */
function segHitsProp(props, a, b) {
  const HW = 18;                       // hull half-width plus a little margin
  const footZ = Math.min(a.z, b.z);
  const headZ = Math.max(a.z, b.z) + 72;     // standing hull height
  const dx = b.x - a.x, dy = b.y - a.y;
  for (let i = 0; i < props.length; i++) {
    const p = props[i];
    if (p.max.z <= footZ + 42) continue;      // low enough to walk over
    if (p.min.z >= headZ) continue;           // clears our head
    let t0 = 0, t1 = 1, miss = false;
    for (let ax = 0; ax < 2; ax++) {
      const o = ax ? a.y : a.x;
      const d = ax ? dy : dx;
      const lo = (ax ? p.min.y : p.min.x) - HW;
      const hi = (ax ? p.max.y : p.max.x) + HW;
      if (Math.abs(d) < 1e-9) {
        if (o < lo || o > hi) { miss = true; break; }
        continue;
      }
      let n0 = (lo - o) / d, n1 = (hi - o) / d;
      if (n0 > n1) { const t = n0; n0 = n1; n1 = t; }
      if (n0 > t0) t0 = n0;
      if (n1 < t1) t1 = n1;
      if (t0 > t1) { miss = true; break; }
    }
    if (!miss && t0 <= 1 && t1 >= 0) return true;
  }
  return false;
}

// ---------------------------------------------------------------- nav graph
function buildNav(G, open, props = []) {
  const { height, roofZ } = G;
  const nodes = [];
  const cellNode = new Int32Array(GRID_W * GRID_H).fill(-1);
  for (let r = 0; r < GRID_H; r++) {
    for (let c = 0; c < GRID_W; c++) {
      if (!open(c, r)) continue;
      const i = idx(c, r);
      cellNode[i] = nodes.length;
      nodes.push({
        id: nodes.length, c, r,
        x: cellX(c), y: cellY(r), z: height[i],
        indoor: roofZ[i] > 0,
        links: [], openness: 0, blocked: false,
      });
    }
  }

  // Move waypoints off props before links are measured. The old pass ran after
  // link creation, so A* costed one segment while bots walked a different one.
  const hullFitsGrid = (x, y) => {
    const m = 17;
    for (const [px, py] of [[x - m, y - m], [x + m, y - m], [x - m, y + m], [x + m, y + m]]) {
      const c = xToCell(px), r = yToCell(py);
      if (!open(c, r)) return false;
    }
    return true;
  };
  for (const n of nodes) {
    if (!segHitsProp(props, n, n)) continue;
    let best = null, bestD = Infinity;
    for (const radius of [32, 46, 60]) {
      for (let k = 0; k < 16; k++) {
        const a = (k / 16) * Math.PI * 2;
        const probe = { x: n.x + Math.cos(a) * radius, y: n.y + Math.sin(a) * radius, z: n.z };
        if (xToCell(probe.x) !== n.c || yToCell(probe.y) !== n.r) continue;
        if (!hullFitsGrid(probe.x, probe.y) || segHitsProp(props, probe, probe)) continue;
        const d = Math.hypot(probe.x - n.x, probe.y - n.y);
        if (d < bestD) { bestD = d; best = probe; }
      }
      if (best) break;
    }
    if (best) { n.x = best.x; n.y = best.y; }
    else n.blocked = true;       // a full-cell prop: route around this cell
  }

  const MAXDZ = 40;
  for (const n of nodes) {
    if (n.blocked) continue;
    const near = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dc, dr] of near) {
      const c2 = n.c + dc, r2 = n.r + dr;
      if (!open(c2, r2)) continue;
      const diag = dc !== 0 && dr !== 0;
      if (diag && !(open(n.c + dc, n.r) && open(n.c, n.r + dr))) continue;
      const j = cellNode[idx(c2, r2)];
      const o = nodes[j];
      if (o.blocked || Math.abs(o.z - n.z) > MAXDZ) continue;
      if (diag && Math.abs(o.z - n.z) > 4) continue;   // no diagonal stair hops
      // A crate in the way costs more to walk around but must never sever the
      // link — cells are 128 wide and a single crate fills one, so pruning
      // outright disconnected whole bombsites.
      const blocked = segHitsProp(props, n, o);
      const base = Math.hypot(o.x - n.x, o.y - n.y) + Math.abs(o.z - n.z) * 2;
      n.links.push({ to: j, cost: blocked ? base * 4 + 260 : base });
      n.openness++;
    }
  }
  // ---- tactical annotation -------------------------------------------------
  // The Counter-Strike bot precomputes this kind of thing onto the nav mesh so
  // that at runtime a bot only has to look up "where is cover / how open am I"
  // instead of reasoning about geometry. sight[k] is how many cells you can see
  // along compass direction k, wallAdj is how much cover is touching you.
  const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  const sightDirs = N8.map(([dc, dr]) => {
    const l = Math.hypot(dc, dr);
    return { x: dc / l, y: -dr / l };          // grid rows run south
  });
  for (const n of nodes) {
    n.sight = new Array(8).fill(0);
    for (let k = 0; k < 8; k++) {
      const [dc, dr] = N8[k];
      let d = 0;
      while (d < 14) {
        const c = n.c + dc * (d + 1), r = n.r + dr * (d + 1);
        if (!open(c, r)) break;
        const j = cellNode[idx(c, r)];
        if (j < 0 || Math.abs(nodes[j].z - n.z) > 40) break;
        d++;
      }
      n.sight[k] = d;
    }
    n.exposure = n.sight.reduce((a, b) => a + b, 0);
    let wall = 0;
    for (const [dc, dr] of N8) if (!open(n.c + dc, n.r + dr)) wall++;
    n.wallAdj = wall;
  }


  return { nodes, cellNode, sightDirs, nodeAt: (x, y) => {
    const c = xToCell(x), r = yToCell(y);
    if (c < 0 || r < 0 || c >= GRID_W || r >= GRID_H) return -1;
    const direct = cellNode[idx(c, r)];
    if (direct >= 0 && !nodes[direct].blocked && nodes[direct].links.length) return direct;
    let best = -1, bestD = Infinity;
    for (const n of nodes) {
      if (n.blocked || !n.links.length) continue;
      const d = (n.x - x) ** 2 + (n.y - y) ** 2;
      if (d < bestD) { bestD = d; best = n.id; }
    }
    return best;
  } };
}
