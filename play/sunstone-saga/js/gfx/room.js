"use strict";
// ---------- Dungeon room shell: the classic 16-bit "picture frame" room ----------
// Every wall shows its inner face, the four faces meet in 45-degree mitres, a
// light rim (the wall tops) runs round the outside and a trim band borders the
// floor. Courses run parallel to each wall. Light still comes from the upper
// left: the east face (turned toward the light) is brightest, the west face
// darkest, north and south in between.
// Objects inside the room keep the regular 3/4 camera, as in the genre.

const ROOM = {
  W: 512, H: 352, RIM: 10,
  X0: 64, Y0: 64, X1: 448, Y1: 288,   // floor rectangle (logic floor tiles 2..13 x 2..8)
  TRIM: 12,
};
ROOM.FACE = ROOM.X0 - ROOM.RIM;         // face depth in pixels (54)

// Base tone of each face on the theme ramp (0..4), from its orientation to the light:
// east face turns toward the light, the south face tips up toward it, the west face turns away.
const FACE_TONE = { N: 2, S: 3, W: 1, E: 3 };

// Which part of the frame a pixel belongs to.
function roomPart(x, y) {
  const R = ROOM, r = R.RIM;
  if (x < r || y < r || x >= R.W - r || y >= R.H - r) return { side: "RIM" };
  if (x >= R.X0 && x < R.X1 && y >= R.Y0 && y < R.Y1) return { side: "FLOOR" };
  const L = R.W - r, B = R.H - r;           // inner edges of the rim (exclusive)
  let side;
  if (y < R.Y0 && x < R.X0) side = (y - r) < (x - r) ? "N" : "W";
  else if (y < R.Y0 && x >= R.X1) side = (y - r) < (L - 1 - x) ? "N" : "E";
  else if (y >= R.Y1 && x < R.X0) side = (B - 1 - y) < (x - r) ? "S" : "W";
  else if (y >= R.Y1 && x >= R.X1) side = (B - 1 - y) < (L - 1 - x) ? "S" : "E";
  else if (y < R.Y0) side = "N";
  else if (y >= R.Y1) side = "S";
  else if (x < R.X0) side = "W";
  else side = "E";
  // depth across the face (0 at the rim, FACE at the floor) and position along the wall
  const d = side === "N" ? y - r : side === "S" ? (B - 1 - y) : side === "W" ? x - r : (L - 1 - x);
  const u = (side === "N" || side === "S") ? x : y;
  // on the mitre line itself
  let seam = false;
  if (y < R.Y0 && x < R.X0) seam = (y - r) === (x - r);
  else if (y < R.Y0 && x >= R.X1) seam = (y - r) === (L - 1 - x);
  else if (y >= R.Y1 && x < R.X0) seam = (B - 1 - y) === (x - r);
  else if (y >= R.Y1 && x >= R.X1) seam = (B - 1 - y) === (L - 1 - x);
  return { side, d, u, seam };
}

// Pilaster centres along each wall (pixels along the wall), kept clear of doors.
const PILASTERS = { N: [112, 400], S: [112, 400], W: [112, 240], E: [112, 240] };

// ---------- caves: boulders on the wall tops, columns of rock on the faces ----------
// Every rock is a cell of a jittered-grid Voronoi, lit along its upper-left edge and shaded
// along its lower right in SCREEN terms (each face maps its own (u, d) to the screen), so
// the light falls right on all four faces. Dark crevices where two rocks meet; no noise.
// face (du, dd) -> screen direction, per wall
const CAVE_SCR = { N: (a, b) => [a, b], S: (a, b) => [a, -b], W: (a, b) => [b, a], E: (a, b) => [-b, a] };
const _caveCell = { edge: 0, i: 0, j: 0, lit: 0, su: 0, sd: 0 };
function caveCell(side, u, d, cs, cd, seed) {
  const gu = Math.floor(u / cs), gd = Math.floor(d / cd), k = cs / cd;
  let b1 = 1e9, b2 = 1e9, bi = 0, bj = 0, su1 = 0, sd1 = 0;
  for (let j = gd - 1; j <= gd + 1; j++) for (let i = gu - 1; i <= gu + 1; i++) {
    const su = (i + 0.15 + 0.7 * hash2(i, j, seed)) * cs, sd = (j + 0.2 + 0.6 * hash2(i, j, seed + 1)) * cd;
    const du = u - su, dd = (d - sd) * k, dist = Math.sqrt(du * du + dd * dd);
    if (dist < b1) { b2 = b1; b1 = dist; bi = i; bj = j; su1 = su; sd1 = sd; } else if (dist < b2) b2 = dist;
  }
  const s = CAVE_SCR[side](u - su1, (d - sd1) * k), len = Math.hypot(s[0], s[1]) || 1;
  const o = _caveCell;
  o.edge = (b2 - b1) / 2; o.i = bi; o.j = bj; o.su = su1; o.sd = sd1; o.lit = -(s[0] + s[1]) / (len * 1.414);
  return o;
}
// The wall top: big boulders seen from above, each with a lit cap on its upper left.
// (x, y) in room pixels; returns [tone, rock base tone]
function caveRimTone(x, y) {
  const R = ROOM, r = R.RIM, side = (x < r || x >= R.W - r) && !(y < r || y >= R.H - r) ? "V" : "H";
  const c = side === "H" ? caveCell("N", x, y + (y >= R.H - r ? 5 : 0), 17, 11, 751) : caveCell("N", x + (x >= R.W - r ? 5 : 0), y, 11, 17, 761);
  const base = hash2(c.i, c.j, side === "H" ? 752 : 762) < 0.3 ? 2 : 3;
  let t = base;
  if (c.edge < 0.9) t = 1;
  else if (c.edge < 3 && c.lit > 0.35) t = base + 1;
  else if (c.edge < 2.2 && c.lit < -0.3) t = base - 1;
  return [t, base];
}
// How far a rim boulder bulges over the top of a face at position u (a round lump per boulder).
function caveBulge(side, u) {
  const R = ROOM, r = R.RIM;
  const [x, y] = side === "N" ? [u, r - 1] : side === "S" ? [u, R.H - r] : side === "W" ? [r - 1, u] : [R.W - r, u];
  const vert = side === "W" || side === "E";
  const c = vert ? caveCell("N", x + (x >= R.W - r ? 5 : 0), y, 11, 17, 761) : caveCell("N", x, y + (y >= R.H - r ? 5 : 0), 17, 11, 751);
  const base = hash2(c.i, c.j, vert ? 762 : 752) < 0.3 ? 2 : 3;
  return [c.edge < 0.9 ? 0 : Math.min(4, 1 + Math.floor(c.edge * 0.55)), base];
}
// The four corners of a cave: a chain of boulders heaped along the line where two faces meet,
// so the join wanders round their outlines (a ruled 45-degree mitre cut the rocks in half and
// made the cave a box). Seeds in each corner's own frame: k along the mitre from the rim's
// inner corner, q across it; the chain's seeds sit on the mitre, flanking seeds (the faces'
// own rock, left to faceColor) hem it in. Returns a colour, or 0 off the boulders.
const CAVE_CORNERS = [["N", "W", 1, 1], ["N", "E", -1, 1], ["S", "W", 1, -1], ["S", "E", -1, -1]];
let _caveCornerSeeds = null;
function caveCornerSeeds() {
  if (_caveCornerSeeds) return _caveCornerSeeds;
  const Lk = ROOM.FACE * Math.SQRT2;
  _caveCornerSeeds = CAVE_CORNERS.map((_, c) => {
    const pts = [];
    let i = 0;
    for (let k = 5 + hash2(c, 0, 771) * 3; k < Lk + 8; k += 16 + hash2(c, ++i, 772) * 5) pts.push({ k, q: (hash2(c, i, 773) - 0.5) * 5, band: true, i });
    for (const s of [-1, 1]) for (let k = -4 + hash2(c, s, 774) * 6; k < Lk + 14; k += 13 + hash2(c, ++i, 775) * 5) pts.push({ k, q: s * (16 + hash2(c, i, 776) * 5), band: false, i });
    return pts;
  });
  return _caveCornerSeeds;
}
function caveCornerColor(x, y) {
  const R = ROOM, r = R.RIM, F = R.FACE;
  for (let c = 0; c < 4; c++) {
    const [A, Bs, sx, sy] = CAVE_CORNERS[c];
    const ox = sx > 0 ? r : R.W - 1 - r, oy = sy > 0 ? r : R.H - 1 - r;
    const dx = (x - ox) * sx, dy = (y - oy) * sy;
    if (dx < 0 || dy < 0 || dx >= F || dy >= F) continue;
    const k = (dx + dy) / Math.SQRT2, q = (dx - dy) / Math.SQRT2;
    if (Math.abs(q) > 24) return 0;
    let b1 = 1e9, b2 = 1e9, best = null;
    for (const p of caveCornerSeeds()[c]) {
      if (Math.abs(p.k - k) > 24) continue;
      const dist = Math.hypot(p.k - k, p.q - q);
      if (dist < b1) { b2 = b1; b1 = dist; best = p; } else if (dist < b2) b2 = dist;
    }
    if (!best || !best.band) return 0;
    // the boulder's centre on screen, for its lit upper-left edge
    const cx = ox + sx * (best.k + best.q) / Math.SQRT2, cy = oy + sy * (best.k - best.q) / Math.SQRT2;
    const ex = x - cx, ey = y - cy, len = Math.hypot(ex, ey) || 1, lit = -(ex + ey) / (len * 1.414);
    const edge = (b2 - b1) / 2;
    let t = Math.round((FACE_TONE[A] + FACE_TONE[Bs]) / 2) - (hash2(c, best.i, 777) < 0.3 ? 1 : 0);
    if (edge < 0.9) t -= 2;                                   // crevice
    else if (edge < 2.6 && lit > 0.3) t += 1;                 // lit upper-left edge
    else if (edge < 2 && lit < -0.3) t -= 1;                  // shaded lower-right edge
    else if (b1 > 4.5 && lit < -0.45) t -= 1;                 // its rounded lower right in shade
    if (Math.max(dx, dy) > F - 4) t -= 1;                     // the ambient shade at the wall's foot
    return pc("stone", clampTone(t));
  }
  return 0;
}
function caveFaceColor(theme, side, d, u, x, y, seam) {
  const corner = caveCornerColor(x, y);
  if (corner) return corner;
  const F = ROOM.FACE;
  if (seam) return pc("stone", Math.max(0, FACE_TONE[side] - 2));
  // the boulders of the wall top spill over the face's top edge
  if (d < 5) {
    const [bump, rb] = caveBulge(side, u);
    if (d < bump) return pc("stone", d === bump - 1 ? 1 : d === 0 ? rb : rb - 1);
    if (d === bump && bump > 0) return pc("stone", Math.max(0, FACE_TONE[side] - 1));
  }
  // columns of rock standing up the face (cells tall along d); big footing stones at its foot
  const foot = d > F - 16 + Math.round(2.5 * Math.sin(u * 0.29 + side.charCodeAt(0)));
  const c = foot ? caveCell(side, u, d, 21, 13, 700 + side.charCodeAt(0)) : caveCell(side, u, d, 12, 30, 720 + side.charCodeAt(0));
  let t = FACE_TONE[side] - (hash2(c.i, c.j, foot ? 741 : 742) < 0.25 ? 1 : 0);
  if (c.edge < 0.9) t -= 2;                                   // crevice
  else if (c.edge < 2.6 && c.lit > 0.3) t += 1;               // lit upper-left edge of the rock
  else if (c.edge < 2 && c.lit < -0.3) t -= 1;                // shaded lower-right edge
  // the ambient shade at the wall's foot: the lower part of each footing stone, below a line of
  // its own set by the stone's middle (one dithered band at a fixed height read as a ruler
  // line drawn across the rocks)
  if (foot) {
    const th = Math.max(F - 13, Math.min(F - 4, Math.round(c.sd - 1 + hash2(c.i, c.j, 743) * 4)));
    if (d > th) t -= 1;
  }
  return pc("stone", clampTone(t));
}
// The accents of a cave's walls (2-3 per face, never noise), chosen by the land round its
// mouth: drips hang from the north face's top, wet streaks run down the side faces, roots
// push through in the woods and among the graves. Crystals grow at the foot of the walls
// (floor props, see buildCaveScene). [side, kind, u, length]
function caveAccents(v) {
  const rooty = v === "F" || v === "G";
  const N = rooty ? [["N", "root", 146, 22], ["N", "drip", 204, 5], ["N", "root", 338, 17]]
                  : [["N", "drip", 150, 7], ["N", "drip", 157, 4], ["N", "drip", 366, 6]];
  // (drips hang only from the north face: on a side face "down the wall" runs across the
  // screen, and a stalactite pointing sideways read as a spike)
  const W = rooty ? [["W", "root", 188, 20], ["W", "streak", 118, 16]] : [["W", "streak", 118, 16], ["W", "streak", 232, 11]];
  const E = [["E", "streak", 204, 12], ["E", rooty ? "root" : "streak", 262, 15]];
  const S = [["S", rooty ? "root" : "streak", 150, 14]];
  return N.concat(W, E, S);
}
// face (u, d) -> room pixel
function faceXY(side, u, d) {
  const R = ROOM, r = R.RIM;
  return side === "N" ? [u, r + d] : side === "S" ? [u, R.H - r - 1 - d] : side === "W" ? [r + d, u] : [R.W - r - 1 - d, u];
}
function paintCaveAccents(frame, v) {
  const W = ROOM.W;
  const at = (side, u, d) => { const [x, y] = faceXY(side, u, d); return y * W + x; };
  const shade = (i, n) => { for (let k = 0; k < n; k++) frame.d[i] = darker(frame.d[i]); };
  const seed = (side) => 720 + side.charCodeAt(0);
  // (a drip hangs on the face of a rock, never in a crevice between two: there it was lost)
  const onRock = (side, u0, b0, len) => {
    for (const du of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7]) {
      let ok = true;
      for (let d = b0 + 1; d < b0 + len + 6 && ok; d++) for (let k = -1; k <= 3 && ok; k++) if (caveCell(side, u0 + du + k, d, 12, 30, seed(side)).edge < 1.2) ok = false;
      if (ok) return u0 + du;
    }
    return u0;
  };
  for (const [side, kind, uu, len] of caveAccents(v)) {
    const [b0] = caveBulge(side, uu);
    const u0 = kind === "drip" ? onRock(side, uu, b0, len) : uu;
    if (kind === "drip") {
      // a little stalactite under the lip (lit down the side toward the light, a dark edge
      // down the other, so it stands off the rock behind it), a lit wet streak under its tip, a
      // round drop of water (2 px, lit on its upper left) and the dark trail the water leaves
      for (let d = 0; d < len; d++) {
        const w = Math.max(1, 3 - Math.floor(d * 3 / len));
        for (let k = 0; k < w; k++) frame.d[at(side, u0 + k, b0 + d)] = pc("stone", w === 1 ? 3 : k === 0 ? 4 : k === w - 1 ? 2 : 3);
        frame.d[at(side, u0 + w, b0 + d)] = pc("stone", 0);
      }
      const e = b0 + len;
      frame.d[at(side, u0, e)] = pc("water", 3);
      frame.d[at(side, u0 + 1, e)] = pc("stone", 0);
      frame.d[at(side, u0, e + 1)] = pc("water", 4); frame.d[at(side, u0 + 1, e + 1)] = pc("water", 3);
      frame.d[at(side, u0, e + 2)] = pc("water", 3); frame.d[at(side, u0 + 1, e + 2)] = pc("water", 2);
      frame.d[at(side, u0 - 1, e + 1)] = pc("stone", 0); frame.d[at(side, u0 - 1, e + 2)] = pc("stone", 0);
      frame.d[at(side, u0 + 2, e + 1)] = pc("stone", 0); frame.d[at(side, u0 + 2, e + 2)] = pc("stone", 0);
      frame.d[at(side, u0, e + 3)] = pc("stone", 0); frame.d[at(side, u0 + 1, e + 3)] = pc("stone", 0);
      for (let d = e + 5; d < e + 15; d++) if (d < ROOM.FACE - 10 && (d < e + 12 || (d & 1))) shade(at(side, u0, d), 1);
    } else if (kind === "streak") {
      // a wet streak: water seeping from a crack under the lip, darkening the rock below it
      for (let d = b0 + 1; d < b0 + 1 + len; d++) {
        const wob = Math.round(Math.sin(d * 0.45 + u0) * 0.8);
        const end = d > b0 + len - 4;
        if (!end || (d & 1)) { shade(at(side, u0 + wob, d), 1); if (d < b0 + len - 6) shade(at(side, u0 + wob + 1, d), 1); }
      }
      frame.d[at(side, u0, b0 + 1)] = pc("water", 3);
    } else if (kind === "root") {
      // a root pushed through between the rocks: two pixels wide, lit on its upper-left
      // side, wandering down the face and thinning to a tip, with one small side root
      for (let d = Math.max(0, b0 - 1); d < b0 + len; d++) {
        const k = d - b0, wob = Math.round(Math.sin(k * 0.32 + u0 * 0.1) * 1.6), w = k < len - 5 ? 2 : 1;
        const u = u0 + wob;
        const [sx, sy] = CAVE_SCR[side](-1, 0);
        const litFirst = sx + sy < 0;                   // which of the two columns faces the light
        for (let q = 0; q < w; q++) frame.d[at(side, u + q, d)] = pc("earth", w === 1 ? 2 : ((q === 0) === litFirst ? 3 : 1));
        frame.d[at(side, u + w, d)] = darker(frame.d[at(side, u + w, d)]);
        if (k === Math.floor(len * 0.4)) for (let s = 1; s <= 4; s++) frame.d[at(side, u + 1 + s, d + s)] = pc("earth", s < 4 ? 2 : 1);
      }
    }
  }
}

// House interiors: lime plaster above a board wainscot, timber posts, a beam along the top.
const HOUSE_POSTS = { N: [100, 412], S: [100, 412], W: [112], E: [112] };
// the timber frame: a top beam along the face's rim edge (its lower edge lit, a thin shadow
// under it on the wall) and, on the north face, a knee brace each side of each post
const HOUSE_BEAM = 6;
function houseBrace(side, d, u) {
  if (side !== "N" || d < HOUSE_BEAM || d > HOUSE_BEAM + 11) return -1;
  for (const p of HOUSE_POSTS.N) for (const s of [-1, 1]) {
    // from the post's edge 11 px down, up and outward to the beam at 45 degrees
    const k = (u - (p + s * 5)) * s - (HOUSE_BEAM + 11 - d);   // 0 on the brace's upper edge
    if (k === 0 || k === -1) return k === 0 ? 2 : 1;            // lit top edge, body
    if (k === -2) return 0;                                    // its shadow on the wall
  }
  return -1;
}
function houseFaceColor(side, d, u, x, y, seam, upper) {
  const F = ROOM.FACE;
  if (seam) return pc("earth", 0);
  const base = FACE_TONE[side];
  for (const p of HOUSE_POSTS[side]) {
    const du = u - p;
    if (Math.abs(du) <= 4) {
      let t = base >= 2 ? 2 : 1;
      if (du === -4) t += 1; else if (du === 4) t -= 1;
      if (d > F - 3) t -= 1;
      return pc("earth", clampTone(t));
    }
  }
  if (d < HOUSE_BEAM) {
    if (d === 0) return pc("earth", 0);
    if (d === HOUSE_BEAM - 1) return pc("earth", 3);
    // (a grain line along the beam, broken every so often)
    if (d === 2 && ((u + 7) % 23) < 13) return pc("earth", 0);
    return pc("earth", 1);
  }
  const br = houseBrace(side, d, u);
  if (br > 0) return pc("earth", br);
  const c = houseWallColor(side, d, u, upper, base);
  return (br === 0 || d === HOUSE_BEAM) ? darker(c) : c;
}
function houseWallColor(side, d, u, upper, base) {
  const F = ROOM.FACE;
  const wain = F - 20;
  if (d >= wain) {
    if (d === wain) return pc("earth", 3);
    if (d === wain + 1) return pc("earth", 1);
    const bu = ((u % 12) + 12) % 12;
    let t = base >= 2 ? 2 : 1;
    if (bu === 0) t = 0; else if (bu === 1) t += 1;
    if (d > F - 3) t -= 1;
    return pc("earth", clampTone(t));
  }
  let t = base + 1;
  if (d < 7) t -= 1;
  if (upper === "stone") {
    // rubble-stone walls (the smithy): coursed blocks instead of plaster
    const course = Math.floor((d - 4) / 8), off = (course & 1) ? 7 : 0;
    if ((d - 4) % 8 === 7 || ((u + off) % 14 + 14) % 14 === 0) t -= 1;
    return pc("stone", clampTone(t - 1));
  }
  if (upper === "wood") {
    // the plank cottage: upright boards with dark seams and the odd knot
    const bu = ((u % 9) + 9) % 9;
    if (bu === 0) return pc("earth", clampTone(t - 2));
    if (bu === 1) t += 1;
    if (hash2(Math.floor(u / 9), Math.floor(d / 11), 352) < 0.12 && (d % 11) === 5 && bu === 4) t -= 1;
    return pc("earth", clampTone(t));
  }
  if (upper === "blue") {
    // limewash tinted blue, with a painted band of red under the rim
    if (d >= 9 && d <= 10) return pc("red", clampTone(base + 1));
    const cu = ((u % 16) + 16) % 16, cd = (d + ((Math.floor(u / 16) & 1) ? 8 : 0)) % 16;
    if ((cu === 8 && (cd === 7 || cd === 9)) || (cd === 8 && (cu === 7 || cu === 9))) return pc("dstone", clampTone(t - 1));
    if (cu === 8 && cd === 8) return pc("gold", 2);
    return pc("dstone", clampTone(t + 1));
  }
  // clean lime plaster with only a faint trowel grain: a few short level strokes one step
  // darker (soft blotches here read as damp or mould)
  const cu = Math.floor(u / 11), cd = Math.floor((d - 4) / 6);
  if (hash2(cu, cd, 351) < 0.22) {
    const su = cu * 11 + 1 + Math.floor(hash2(cu, cd, 353) * 5), sd = 4 + cd * 6 + 2 + Math.floor(hash2(cu, cd, 354) * 3);
    if (d === sd && u >= su && u < su + 3 + Math.floor(hash2(cu, cd, 355) * 3)) t -= 1;
  }
  return pc("plaster", clampTone(t));
}
function houseRimColor(x, y) {
  const R = ROOM, dOut = Math.min(x, y, R.W - 1 - x, R.H - 1 - y);
  if (dOut === 0) return pc("earth", 0);
  if (dOut === R.RIM - 1) return pc("earth", 3);
  const along = (x < R.RIM || x >= R.W - R.RIM) ? y : x;
  if (((along % 64) + 64) % 64 === 0) return pc("earth", 0);
  return pc("earth", dOut < 3 ? 1 : 2);
}

function faceColor(theme, side, d, u, x, y, seam) {
  const F = ROOM.FACE;
  if (seam) return pc(theme, 0);
  let f = FACE_TONE[side];
  // (N and W faces: a larger d is further right or down on screen; S and E: further up or left)
  const nw = side === "N" || side === "W";
  // raised pilaster strips (smooth stone, lit edge toward the light)
  for (const p of PILASTERS[side]) {
    const du = u - p;
    if (Math.abs(du) <= 7) {
      let t = f + 0.6;
      const leading = (side === "N" || side === "S") ? -1 : -1;   // light from left / top
      if (du * leading >= 6) t += 1;           // edge facing the light
      else if (-du * leading >= 6) t -= 1.4;   // edge in shadow
      if (d < 2) t += 1;
      if (d > F - 3) t -= 1;
      let tone = Math.round(t);
      // a capital block under the coping and a base block at the foot: the edge of each that
      // meets the shaft is lit where it faces the upper left, dark where it faces away
      if (d === 5) tone += nw ? -1 : 1;
      else if (d === F - 6) tone += nw ? 1 : -1;
      return pc(theme, clampTone(tone));
    }
    if (Math.abs(du) === 8) return pc(theme, clampTone(Math.round(f - 1.2)));  // cast line beside the pilaster
  }
  // coping at the top of the face, ambient shade at its foot
  if (d < 2) f += 1;
  else if (d > F - 4) f -= 1;
  // courses parallel to the wall, running-bond joints across them
  const course = Math.floor(d / 9), inC = d % 9;
  const off = (course & 1) ? 10 : 0;
  const ju = ((u + off) % 20 + 20) % 20;
  let line = false;
  if (inC === 0 && d > 1) line = true;
  else if (ju === 0 && d > 1 && d < F - 3) line = true;
  if (line) f -= 1;
  else if (d >= 2 && d <= F - 4) {
    // each brick bevelled: a lit row along its screen-top edge, and on the N and S faces a lit
    // column on its screen-left edge too (on the side faces the bricks stand 20 px tall and
    // lit columns lined up into stripes that read as planks); one brick in twelve a step darker
    const top = side === "N" ? inC === 1 : side === "S" ? inC === 8 : ju === 1;
    const left = (side === "N" || side === "S") && ju === 1;
    if (top || left) f += 1;
    if (hash2(Math.floor((u + off) / 20), course, 977) < 0.08) f -= 1;
  }
  // the ambient shade at the foot of the face fades in through a 2px dither band
  if (STYLE.shade.dither && d >= F - 6 && d < F - 4 && ((x + y) & 1)) f -= 1;
  return pc(theme, clampTone(Math.round(f)));
}
function clampTone(t) { return Math.max(0, Math.min(4, t)); }

function rimColor(theme, x, y) {
  const R = ROOM, r = R.RIM;
  // square caps crown the four outer corners
  const cx = Math.min(x, R.W - 1 - x), cy = Math.min(y, R.H - 1 - y);
  if (cx < r + 4 && cy < r + 4) {
    if (cx === 0 || cy === 0) return pc(theme, 0);
    const right = x > R.W / 2, bottom = y > R.H / 2;
    const ex = right ? (R.W - 1 - x) : x, ey = bottom ? (R.H - 1 - y) : y;
    if (ex === r + 3 || ey === r + 3) return pc(theme, 1);     // shadow edge of the cap
    if (ex === 1 || ey === 1) return pc(theme, 4);             // lit edge
    return pc(theme, 3);
  }
  const dOut = Math.min(x, y, R.W - 1 - x, R.H - 1 - y);
  if (dOut === 0) return pc(theme, 0);
  if (dOut === r - 1) return pc(theme, 4);           // lit lip where the rim meets the face
  const along = (x < r || x >= R.W - r) ? y : x;
  const m = ((along % 32) + 32) % 32;
  if (m === 0) return pc(theme, 2);
  // coping stones: each lit along the edge after its joint and along the outer edge
  if (m === 1 || dOut === 1) return pc(theme, 4);
  return pc(theme, 3);
}

// Trim band just inside the floor: small dark bricks that ground the walls.
function trimColor(ramp, x, y) {
  const R = ROOM;
  const dx = Math.min(x - R.X0, R.X1 - 1 - x), dy = Math.min(y - R.Y0, R.Y1 - 1 - y);
  const horiz = dy <= dx;                               // band along a north/south wall
  const d = horiz ? dy : dx, u = horiz ? x : y;
  if (d === R.TRIM - 1) return pc(ramp, 0);             // crisp edge toward the floor
  const row = Math.floor(d / 6), off = (row & 1) ? 4 : 0;
  if (d % 6 === 5 || ((u + off) % 8 + 8) % 8 === 0) return pc(ramp, 0);
  return pc(ramp, (d < 2) ? 0 : 1);
}

// ---------- doors ----------
// Opening rectangles per side (pixels) and the collision gaps they wrap.
const DOOR_BOX = {
  N: { x0: 220, x1: 292, y0: 10, y1: 64 },
  S: { x0: 220, x1: 292, y0: 288, y1: 342 },
  W: { x0: 10, x1: 64, y0: 144, y1: 208 },
  E: { x0: 448, x1: 502, y0: 144, y1: 208 },
};

// Map a pixel inside a door box to (a, b) in the door's local frame.
function doorLocal(side, x, y) {
  const d = DOOR_BOX[side];
  switch (side) {
    case "N": return { a: x - d.x0, b: d.y1 - 1 - y, A: d.x1 - d.x0, B: d.y1 - d.y0 };
    case "S": return { a: x - d.x0, b: y - d.y0, A: d.x1 - d.x0, B: d.y1 - d.y0 };
    case "W": return { a: y - d.y0, b: d.x1 - 1 - x, A: d.y1 - d.y0, B: d.x1 - d.x0 };
    case "E": return { a: y - d.y0, b: x - d.x0, A: d.y1 - d.y0, B: d.x1 - d.x0 };
  }
}

// doors: { N: "open"|"exit"|"locked"|"shutter"|"bossdoor"|"bossopen"|"wall"|"crack"|"bombed"|"outside", S: ..., W: ..., E: ... }
// style: "brick" (default), "cave" or "house". floorRamp: the room's floor ramp (the flagstones
// that run on into each doorway's passage). opts: { noSeal, bossWay, out } (see DoorKit.paintDoorway
// and roomShellOpts in scene.js), torches: [{ x, lit }] on the north face (soot, glow), variant:
// a cave's land ("F", "M", ...: its accents) or a house's layout (its windows and wall things).
// Returns { frame: canvas (ring only, floor transparent), overlay: canvas (door lintels drawn over
// actors), glows: [{ x, y, canvas }] (the glow of each unlit torch, drawn once it is lit) }
const DOORWAY_KINDS = new Set(["open", "exit", "locked", "shutter", "bossdoor", "bossopen", "outside"]);
// The walls, rim and trim of a dungeon look are the same in every room of the dungeon: drawn
// once per look (about 0.7 MB each), then copied, cut at the doorways and painted with doors.
// (caves: once per kind of land; houses: once per home)
const _shellWalls = new Map();
function renderRoomShell(theme, trimRamp, doors, style, floorRamp, opts) {
  const R = ROOM;
  const frame = new Pix(R.W, R.H), over = new Pix(R.W, R.H);
  const variant = (style === "cave" || style === "house") ? (opts && opts.variant) : "";
  const key = style + "|" + theme + "|" + trimRamp + "|" + (variant === undefined ? "" : variant);
  let walls = _shellWalls.get(key);
  if (!walls) {
    walls = shellWalls(theme, trimRamp, style, variant);
    _shellWalls.set(key, walls);
  }
  frame.d.set(walls.d);
  // every doorway has a threshold: the trim band (skirting, ledge) is cut there
  for (const side of ["N", "S", "W", "E"]) {
    if (!DOORWAY_KINDS.has(doors[side])) continue;
    const b = DOOR_BOX[side];
    const x0 = side === "W" ? R.X0 : side === "E" ? R.X1 - R.TRIM : b.x0 + 8, x1 = side === "W" ? R.X0 + R.TRIM : side === "E" ? R.X1 : b.x1 - 8;
    const y0 = side === "N" ? R.Y0 : side === "S" ? R.Y1 - R.TRIM : b.y0 + 8, y1 = side === "N" ? R.Y0 + R.TRIM : side === "S" ? R.Y1 : b.y1 - 8;
    for (let y = y0; y < y1; y++) frame.d.fill(0, y * R.W + x0, y * R.W + x1);
  }
  const glows = opts && opts.torches ? paintTorchMarks(frame, theme, opts.torches) : [];
  // doorways, cracks and breaches are painted over the finished walls (js/gfx/doors.js)
  for (const side of ["N", "S", "W", "E"]) {
    const st = doors[side];
    if (st && st !== "wall") DoorKit.paint(frame, over, side, st, theme, trimRamp, floorRamp || "neutral", style, opts);
  }
  return { frame: frame.toCanvas(), overlay: over.toCanvas(), glows };
}
// rim, wall faces and the trim band (skirting, ledge) all round, floor left transparent
function shellWalls(theme, trimRamp, style, variant) {
  const R = ROOM;
  const cave = style === "cave", house = style === "house";
  const frame = new Pix(R.W, R.H);
  for (let y = 0; y < R.H; y++) {
    for (let x = 0; x < R.W; x++) {
      const p = roomPart(x, y);
      let c = 0;
      if (p.side === "RIM") {
        if (house) c = houseRimColor(x, y);
        else if (cave) c = (x === 0 || y === 0 || x === R.W - 1 || y === R.H - 1) ? pc("stone", 0) : pc("stone", caveRimTone(x, y)[0]);
        else c = rimColor(theme, x, y);
      } else if (p.side === "FLOOR") {
        if (house) {
          // a dark skirting board instead of the dungeon's brick trim
          const e = Math.min(x - R.X0, R.X1 - 1 - x, y - R.Y0, R.Y1 - 1 - y);
          if (e < 4) c = pc("earth", e === 3 ? 0 : 1);
        } else if (cave) {
          // a dark contact line where the rock meets the floor (the fallen stones along the
          // walls are laid on the floor itself: buildCaveScene)
          const e = Math.min(x - R.X0, R.X1 - 1 - x, y - R.Y0, R.Y1 - 1 - y);
          if (e === 0) c = pc("stone", 0);
        } else {
          const inTrim = x < R.X0 + R.TRIM || x >= R.X1 - R.TRIM || y < R.Y0 + R.TRIM || y >= R.Y1 - R.TRIM;
          if (inTrim) c = trimColor(trimRamp, x, y);
        }
      } else c = house ? houseFaceColor(p.side, p.d, p.u, x, y, p.seam, theme) : cave ? caveFaceColor(theme, p.side, p.d, p.u, x, y, p.seam) : faceColor(theme, p.side, p.d, p.u, x, y, p.seam);
      if (c) frame.d[y * R.W + x] = c;
    }
  }
  if (cave) paintCaveAccents(frame, variant);
  if (house) paintHouseWalls(frame, variant || 0, theme);
  return frame;
}

// ---------- wall torches (north face): soot above each, a glow round a lit one ----------
// Screen rows of a torch: the glow's centre (the flame's middle), the top of its cup (the
// flame's foot) and the foot of its wall plate. The bracket and flames: js/gfx/fx_art.js.
const TORCH_Y = { glow: 27, cup: 34, plate: 47 };
function torchSoot(dx, dy) {
  // a half ellipse 5 wide, 6 tall, rising from just over the flame's tip
  const yy = dy + 9;                     // 0 at the soot's foot (just over the flame's tip)
  return yy <= 0 && yy >= -6 && (dx * dx) / 6.25 + (yy * yy) / 36 <= 1;
}
function torchGlow(dx, dy, x, y) {
  // two steps of light, a little taller than wide: +1 inside r 9, +1 on the checkerboard out to 13
  const r = Math.hypot(dx, dy / 1.12);
  return r < 9 ? 1 : (r < 13 && ((x + y) & 1)) ? 1 : 0;
}
function paintTorchMarks(frame, theme, torches) {
  const R = ROOM, W = R.W, n = rampLen(theme), glows = [];
  const tone = new Map();
  STYLE.ramps[theme].forEach((c, t) => tone.set(hexU32(c), t));
  const lighter = (c) => { const t = tone.get(c); return t === undefined ? c : pc(theme, Math.min(n - 1, 4, t + 1)); };
  const onFace = (x, y) => { const p = roomPart(x, y); return p.side === "N" && !p.seam && p.d >= 2; };
  const br = typeof TORCH_BRACKET !== "undefined" && TORCH_BRACKET && TORCH_BRACKET.unlit;
  for (const t of torches) {
    const cx = t.x, cy = TORCH_Y.glow;
    // the bracket's shadow on the wall, 2 px down and right of it
    if (br) {
      const bx = cx - TORCH_BRACKET.ax, by = TORCH_Y.plate - TORCH_BRACKET.ay, B = br.pix;
      const solid = (xx, yy) => xx >= 0 && yy >= 0 && xx < B.w && yy < B.h && B.d[yy * B.w + xx];
      for (let yy = 0; yy < B.h + 2; yy++) for (let xx = 0; xx < B.w + 2; xx++) {
        if (solid(xx, yy) || !solid(xx - 2, yy - 2)) continue;
        const x = bx + xx, y = by + yy;
        if (onFace(x, y)) frame.d[y * W + x] = darker(frame.d[y * W + x]);
      }
    }
    const patch = t.lit ? null : new Pix(28, 28);
    for (let y = cy - 14; y < cy + 14; y++) for (let x = cx - 14; x < cx + 14; x++) {
      if (!onFace(x, y)) continue;
      const i = y * W + x, dx = x - cx, dy = y - cy;
      if (torchSoot(dx, dy)) { frame.d[i] = darker(frame.d[i]); continue; }
      if (!torchGlow(dx, dy, x, y)) continue;
      if (t.lit) frame.d[i] = lighter(frame.d[i]);
      else patch.d[(y - cy + 14) * 28 + x - cx + 14] = lighter(frame.d[i]);
    }
    if (patch) glows.push({ x: cx - 14, y: cy - 14, canvas: patch.toCanvas() });
  }
  return glows;
}

// ---------- house walls: windows and the things each family hangs on its walls ----------
// On the north face, clear of the tall furniture standing against it (scene.js HOUSE_LAYOUTS)
// and of the host's spot. u: position along the wall, d: face depth of the item's hanging
// point (a window's frame foot). The elder's plaster shows old brick where it has fallen away:
// [side, u, d, half width, half height].
const HOUSE_DECO = [
  { items: [{ item: "window", curt: "red", u: 176, d: 31 }, { item: "shelf", u: 270, d: 24 }],
    bricks: [["N", 230, 14, 9, 6], ["N", 452, 19, 8, 5], ["W", 196, 22, 10, 6], ["E", 228, 16, 9, 6]] },
  { items: [{ item: "window", u: 184, d: 31 }, { item: "chart", u: 318, d: 30 }] },
  { items: [{ item: "window", u: 150, d: 31 }, { item: "star", u: 290, d: 19 }, { item: "star", u: 318, d: 26 }, { item: "drawing", u: 356, d: 30 }] },
  { items: [{ item: "rack", u: 204, d: 12 }, { item: "window", bars: true, u: 318, d: 31 }], soot: [112, 16, 30] },
];
function houseDeco(layout) { return HOUSE_DECO[(layout || 0) % HOUSE_DECO.length]; }
function houseItemArt(it) {
  switch (it.item) {
    case "window": return DunArt.windowItem(it.curt || null, !!it.bars);
    case "shelf": return DunArt.shelfItem();
    case "chart": return DunArt.chartItem();
    case "drawing": return DunArt.drawingItem();
    case "star": return DunArt.starItem();
    case "rack": return DunArt.toolRackItem();
  }
  return null;
}
function paintHouseWalls(frame, layout, upper) {
  const R = ROOM, W = R.W, deco = houseDeco(layout);
  const faceAt = (x, y) => { const p = roomPart(x, y); return p.side === "N" && !p.seam ? p : null; };
  // plaster fallen away: three or four courses of old brick in the hole (bricks a step darker
  // than the plaster, lit along their top, pale lime mortar between), the hole's outline
  // stepping along the courses as plaster breaks; the broken lip shades the hole's upper-left
  // edge and catches the light on its lower right
  for (const [side, u0, d0, rw, rh] of deco.bricks || []) {
    // the screen direction of +u and +d on this face (to find the hole's upper-left edge)
    const su = CAVE_SCR[side](1, 0), sd = CAVE_SCR[side](0, 1);
    const kLit = sd[0] + sd[1] > 0 ? 0 : 2;               // the brick row on the screen-top side
    const inside = (u, d) => {
      const course = Math.floor(d / 4), b = (course * 4 + 1.5 - d0) / (rh + 1);
      if (Math.abs(b) >= 1) return false;
      const hw = rw * Math.sqrt(1 - b * b) + (hash2(course, u0, 359) - 0.5) * 4;
      const ragged = (hash2(u, d, 358) < 0.3 ? 1 : 0);
      return Math.abs(u - u0 - (hash2(course, u0, 360) - 0.5) * 3) + ragged < hw;
    };
    const toLight = (du, dd) => (su[0] * du + sd[0] * dd) + (su[1] * du + sd[1] * dd);
    for (let d = d0 - rh - 6; d <= d0 + rh + 6; d++) for (let u = u0 - rw - 5; u <= u0 + rw + 5; u++) {
      const [x, y] = faceXY(side, u, d), p = roomPart(x, y);
      if (p.side !== side || p.seam || p.d < HOUSE_BEAM + 1) continue;
      const nb = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      if (!inside(u, d)) {
        // the plaster's broken edge on the hole's lower right, turned up toward the light
        if (nb.some(([du, dd]) => toLight(du, dd) < 0 && inside(u + du, d + dd))) frame.d[y * W + x] = pc("plaster", 4);
        continue;
      }
      const lip = nb.some(([du, dd]) => toLight(du, dd) < 0 && !inside(u + du, d + dd));
      const course = Math.floor(d / 4), k = d % 4, off = course & 1 ? 4 : 0, bu = ((u + off) % 8 + 8) % 8;
      let c;
      if (k === 3 || bu === 7) c = pc("plaster", 2);
      else c = pc("earth", (k === kLit ? 3 : 2) - (hash2(Math.floor((u + off) / 8), course, 357) < 0.3 ? 1 : 0));
      if (lip) c = pc("earth", 1);
      frame.d[y * W + x] = c;
    }
  }
  // soot over the smith's forge: [u, top d, bottom d]
  if (deco.soot) {
    const [u0, dTop, dBot] = deco.soot;
    for (let d = dTop; d <= dBot; d++) {
      const hw = 9 + (d - dTop) * 0.35;
      for (let u = Math.floor(u0 - hw); u <= u0 + hw; u++) {
        const [x, y] = faceXY("N", u, d);
        if (!faceAt(x, y)) continue;
        const edge = Math.abs(u - u0) > hw - 2 || d < dTop + 2;
        if (!edge || ((x + y) & 1)) frame.d[y * W + x] = darker(frame.d[y * W + x]);
      }
    }
  }
  for (const it of deco.items) {
    const art = houseItemArt(it);
    if (!art) continue;
    const ox = it.u - art.ax, oy = R.RIM + it.d - art.ay, P = art.pix;
    const solid = (xx, yy) => xx >= 0 && yy >= 0 && xx < P.w && yy < P.h && P.d[yy * P.w + xx];
    // a thin shadow down and right of what stands out from the wall (not of painted things)
    const sh = it.item === "star" || it.item === "drawing" ? 0 : it.item === "shelf" || it.item === "rack" ? 2 : 1;
    if (sh) for (let yy = 0; yy < P.h + sh; yy++) for (let xx = 0; xx < P.w + sh; xx++) {
      if (solid(xx, yy) || !solid(xx - sh, yy - sh)) continue;
      const x = ox + xx, y = oy + yy;
      if (faceAt(x, y)) frame.d[y * W + x] = darker(frame.d[y * W + x]);
    }
    for (let yy = 0; yy < P.h; yy++) for (let xx = 0; xx < P.w; xx++) {
      const c = P.d[yy * P.w + xx], x = ox + xx, y = oy + yy;
      if (c && faceAt(x, y)) frame.d[y * W + x] = c;
    }
  }
}
// Where the windows of a home stand (u along the north wall), for the daylight they throw on
// the floor (scene.js buildHouseScene).
function houseWindows(layout) {
  const out = [];
  for (const it of houseDeco(layout).items) if (it.item === "window") out.push(it.u);
  return out;
}
