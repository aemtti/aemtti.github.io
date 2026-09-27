// nav.js — A* over the grid-derived nav graph, plus visibility helpers for bots.
import { rayAabb } from '../core/math.js';
import { LANDMARKS } from './brushes.js';

/** Resolve an arbitrary world position to a usable navigation node. */
export function nearestNode(nav, p, maxRadius = Infinity) {
  if (!nav || !nav.nodes || !nav.nodes.length) return -1;
  const direct = nav.nodeAt(p.x, p.y);
  if (direct >= 0) {
    const n = nav.nodes[direct];
    if (n && !n.blocked && n.links.length) return direct;
  }
  const max2 = maxRadius * maxRadius;
  let best = -1, bestScore = Infinity;
  for (const n of nav.nodes) {
    if (n.blocked || !n.links.length) continue;
    const dx = n.x - p.x, dy = n.y - p.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > max2) continue;
    const dz = p.z === undefined ? 0 : Math.abs(n.z - p.z);
    const score = d2 + dz * dz * 9;
    if (score < bestScore) { bestScore = score; best = n.id; }
  }
  return best;
}

/** weighted length of a nav path, including authored obstacle penalties */
export function pathDistance(nav, path) {
  if (!path || path.length < 2) return path ? 0 : Infinity;
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const a = nav.nodes[path[i - 1]], b = nav.nodes[path[i]];
    const link = a.links.find((l) => l.to === b.id);
    total += link ? link.cost :
      Math.hypot(b.x - a.x, b.y - a.y) + Math.abs(b.z - a.z) * 2;
  }
  return total;
}
/**
 * Pick a spot to hold an angle from, in the spirit of the Counter-Strike bot's
 * precomputed "hiding spots": somewhere that can see a long way down the
 * approach you care about, with cover touching it, without standing in the
 * middle of an open field. Returns a nav node.
 */
// Deliberately small. Searching a wide radius found "better" cover that bots
// then struggled to actually reach, so they spent the round in transit instead
// of defending. Take the best cover *within* the assigned position, not a
// different position.
export function pickHoldSpot(nav, world, spot, watch, radius = 170) {
  const from = nearestNode(nav, spot, radius + 256);
  if (from < 0) return null;
  const base = nav.nodes[from];
  const wx = watch.x - spot.x, wy = watch.y - spot.y;
  const wl = Math.hypot(wx, wy);
  if (wl < 1) return base;
  const wnx = wx / wl, wny = wy / wl;

  // which of the 8 sampled directions best matches the angle we want to watch
  let k = 0, bestDot = -2;
  for (let i = 0; i < nav.sightDirs.length; i++) {
    const d = nav.sightDirs[i].x * wnx + nav.sightDirs[i].y * wny;
    if (d > bestDot) { bestDot = d; k = i; }
  }

  const watchPt = { x: watch.x, y: watch.y, z: (watch.z !== undefined ? watch.z : base.z) + 50 };
  let best = base, bestScore = -Infinity;
  for (const n of nav.nodes) {
    if (!n.links.length) continue;
    if (Math.abs(n.z - base.z) > 80) continue;
    const dx = n.x - spot.x, dy = n.y - spot.y;
    const d = Math.hypot(dx, dy);
    if (d > radius) continue;
    // A cover spot that cannot see the approach is just a place to hide and
    // lose the round. Covering the angle is a requirement, not a bonus.
    if (world && !traceClear(world, { x: n.x, y: n.y, z: n.z + 64 }, watchPt)) continue;
    const score = (n.sight ? n.sight[k] : 0) * 30   // can watch a long way down it
      + (n.wallAdj || 0) * 26                       // something at our back
      - (n.exposure || 0) * 1.6                     // not marooned in the open
      - d * 0.12;                                   // stay near the assignment
    if (score > bestScore) { bestScore = score; best = n; }
  }
  return best;
}

/** binary min-heap keyed by f-score */
class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(id, f) {
    const a = this.a;
    a.push({ id, f });
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      const t = a[p]; a[p] = a[i]; a[i] = t; i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l].f < a[s].f) s = l;
        if (r < a.length && a[r].f < a[s].f) s = r;
        if (s === i) break;
        const t = a[s]; a[s] = a[i]; a[i] = t; i = s;
      }
    }
    return top;
  }
}

const gScore = new Map();
const cameFrom = new Map();

/** returns an array of node ids from start to goal (inclusive), or null */
export function findPath(nav, start, goal, penalty) {
  if (start < 0 || goal < 0) return null;
  if (start === goal) return [start];
  const nodes = nav.nodes;
  gScore.clear(); cameFrom.clear();
  const openSet = new Heap();
  const gn = nodes[goal];
  const h = (n) => Math.hypot(n.x - gn.x, n.y - gn.y) + Math.abs(n.z - gn.z);
  gScore.set(start, 0);
  openSet.push(start, h(nodes[start]));
  const closed = new Set();
  let guard = 0;
  while (openSet.size && guard++ < 20000) {
    const cur = openSet.pop().id;
    if (cur === goal) break;
    if (closed.has(cur)) continue;
    closed.add(cur);
    const n = nodes[cur];
    const gc = gScore.get(cur);
    for (const l of n.links) {
      if (closed.has(l.to)) continue;
      let cost = l.cost;
      if (penalty) cost += penalty(nodes[l.to]);
      const ng = gc + cost;
      if (ng < (gScore.get(l.to) ?? Infinity)) {
        gScore.set(l.to, ng);
        cameFrom.set(l.to, cur);
        openSet.push(l.to, ng + h(nodes[l.to]));
      }
    }
  }
  if (!cameFrom.has(goal) && start !== goal) return null;
  const path = [goal];
  let c = goal;
  while (c !== start) {
    c = cameFrom.get(c);
    if (c === undefined) return null;
    path.push(c);
    if (path.length > 4000) return null;
  }
  path.reverse();
  return path;
}

/** drop waypoints that a straight line already covers */
export function smoothPath(world, nav, path, eyeOff = 40) {
  if (!path || path.length < 3) return path;
  const nodes = nav.nodes;
  const out = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    for (; j > i + 1; j--) {
      const a = nodes[path[i]], b = nodes[path[j]];
      if (Math.abs(a.z - b.z) > 8) continue;
      if (traceClear(world,
        { x: a.x, y: a.y, z: a.z + eyeOff },
        { x: b.x, y: b.y, z: b.z + eyeOff }, 20)) break;
    }
    out.push(path[j]);
    i = j;
  }
  return out;
}

/** true if nothing solid blocks the segment (optionally with a radius margin) */
export function traceClear(world, from, to, radius = 0) {
  const d = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
  const len = Math.hypot(d.x, d.y, d.z);
  if (len < 1e-4) return true;
  const dir = { x: d.x / len, y: d.y / len, z: d.z / len };
  const boxes = world.query(
    Math.min(from.x, to.x) - radius, Math.min(from.y, to.y) - radius,
    Math.max(from.x, to.x) + radius, Math.max(from.y, to.y) + radius);
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    let box = b;
    if (radius > 0) {
      box = {
        min: { x: b.min.x - radius, y: b.min.y - radius, z: b.min.z - radius },
        max: { x: b.max.x + radius, y: b.max.y + radius, z: b.max.z + radius },
      };
    }
    const t = rayAabb(from, dir, box);
    if (t < len) return false;
  }
  return true;
}

/** first world hit along a ray: {t, box, point, normal} or null */
export function traceWorld(world, from, dir, maxDist) {
  const to = { x: from.x + dir.x * maxDist, y: from.y + dir.y * maxDist, z: from.z + dir.z * maxDist };
  const boxes = world.query(
    Math.min(from.x, to.x) - 2, Math.min(from.y, to.y) - 2,
    Math.max(from.x, to.x) + 2, Math.max(from.y, to.y) + 2);
  let best = maxDist, hit = null;
  for (let i = 0; i < boxes.length; i++) {
    const b = boxes[i];
    const t = rayAabb(from, dir, b);
    if (t < best) { best = t; hit = b; }
  }
  if (!hit) return null;
  const p = { x: from.x + dir.x * best, y: from.y + dir.y * best, z: from.z + dir.z * best };
  // face normal from which slab we touched
  const n = { x: 0, y: 0, z: 0 };
  const e = 0.6;
  if (Math.abs(p.x - hit.min.x) < e) n.x = -1;
  else if (Math.abs(p.x - hit.max.x) < e) n.x = 1;
  else if (Math.abs(p.y - hit.min.y) < e) n.y = -1;
  else if (Math.abs(p.y - hit.max.y) < e) n.y = 1;
  else if (Math.abs(p.z - hit.min.z) < e) n.z = -1;
  else n.z = 1;
  return { t: best, box: hit, point: p, normal: n, surf: hit.surf };
}

export function landmarkFor(x, y) {
  let best = LANDMARKS[0], bd = Infinity;
  for (const l of LANDMARKS) {
    const d = (l.x - x) * (l.x - x) + (l.y - y) * (l.y - y);
    if (d < bd) { bd = d; best = l; }
  }
  return best.name;
}

/** nav node ids inside a world-space rectangle */
export function nodesInRect(nav, min, max) {
  const out = [];
  for (const n of nav.nodes) {
    if (n.x >= min.x && n.x <= max.x && n.y >= min.y && n.y <= max.y) out.push(n.id);
  }
  return out;
}

/** nav nodes near a point, sorted by distance */
export function nodesNear(nav, p, radius) {
  const out = [];
  const r2 = radius * radius;
  for (const n of nav.nodes) {
    const d2 = (n.x - p.x) ** 2 + (n.y - p.y) ** 2;
    if (d2 <= r2) out.push({ id: n.id, d: Math.sqrt(d2) });
  }
  out.sort((a, b) => a.d - b.d);
  return out;
}
