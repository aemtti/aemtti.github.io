"use strict";
// ---------- Dungeon doors, cracks and exits: a small 3D kit drawn head-on ----------
// Every door part that stands in the wall plane (frame, leaf, bars, gatehouse, seal) is
// a model3d model built in FRONT ELEVATION for the north wall: model x across the
// doorway (0 = centre), model z up the wall (0 = threshold, 54 = rim), model y toward
// the camera (0 = wall face). ELEV = mRotX(CAM_PITCH) turns it so its front faces the
// camera exactly, 1 unit = 1 px on both axes.
// The S, W and E doors reuse the north pixels mapped through the wall's local frame
// (S flipped vertically, E turned 90 degrees clockwise, W mirrored across the
// diagonal), but each is rendered on its own with the light swapped for G^T*LIGHT
// (G = the same flip or turn as a 3D rotation or mirror about the camera axis). After
// the mapping the light still comes from the screen's upper left on every wall: that is
// the same as drawing the door separately for each wall (style guide 2-1).
// Symbols (the lock plate, the boss seal) are rendered once with the normal light and
// stamped upright on every wall. The passage seen through a doorway, the sill, the
// crack and the breach belong to the room's picture-frame perspective and are painted
// per pixel; loose stones on the floor are small models under the normal game camera.
// DoorAnim draws short door animations (unlock, shutters, boss seal) over the baked room.

const DoorKit = (() => {
  const ELEV = mRotX(CAM_PITCH);
  const EV = [0, COS_P, SIN_P];                                    // toward the camera
  const BAS = [1, 0, 0, 0, SIN_P, COS_P, 0, -COS_P, SIN_P];      // columns: screen right, screen down, view
  const tr = (m) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
  // image transform of each wall's door relative to the north door (x right, y down)
  const T2 = { N: [1, 0, 0, 1], S: [1, 0, 0, -1], E: [0, -1, 1, 0], W: [0, 1, 1, 0] };
  function sideG(side) { const t = T2[side]; return mMul(mMul(BAS, [t[0], t[1], 0, t[2], t[3], 0, 0, 0, 1]), tr(BAS)); }
  function withSideLight(side, fn) {
    const keep = LIGHT.slice(), L = mTVec(sideG(side), keep);
    LIGHT[0] = L[0]; LIGHT[1] = L[1]; LIGHT[2] = L[2];
    try { return fn(); } finally { LIGHT[0] = keep[0]; LIGHT[1] = keep[1]; LIGHT[2] = keep[2]; }
  }
  function mat(ramp, shiny) { const k = "dk_" + ramp + (shiny ? "_s" : ""); if (!MATS[k]) MATS[k] = { ramp, base: 2, shiny: !!shiny }; return k; }

  // ---------------------------------------------------------- sizes
  const J = 8, L = 8;               // jamb width, lintel height
  const T = 12;                     // rows kept above the door box (keystone, boss crown)
  const B = 54;                     // door box depth (floor edge to rim)
  const sideA = (side) => (side === "N" || side === "S") ? 72 : 64;
  // frame blocks one tone lighter than the wall face they stand in (leaving a tone above for
  // the lit bevels where the ramp allows; on the four-tone ramps the north frame takes the top
  // tone, or it would be the wall's own tone and read as a flat outline box)
  // (on the bright S and E faces of the five-tone walls the frame takes the top tone: a tone
  // lower it was the bricks' own colour and read as an outline drawn on the wall; the
  // four-tone walls have no tone above their bright faces, so their frame steps a tone down)
  function frameTone(side, wall) {
    const n = rampLen(wall), f = FACE_TONE[side];
    if (side === "N") return Math.min(n - 1, f + 1);
    return f + 1 <= n - 2 ? f + 1 : (n - 1 > f ? n - 1 : f - 1);
  }
  // (on the clay and sandstone walls the leaf is the redder hair-ramp wood, or it melts into the wall)
  const woodOf = (wall) => (wall === "earth" || wall === "gold") ? "hair" : "earth";

  // ---------------------------------------------------------- bevelled blocks
  // a flat front face lands 0.2 over its base tone (clear of the dither band, section 1.4 of the spec)
  const flatBias = (shiny) => 0.2 - shadeOffset(EV, shiny);
  // tex for a box in model space: centre c, half sizes hw (x), hh (z). Near an edge the tone
  // steps by the sign of (shade with the normal leaned toward that edge - shade of the face)
  // under the current (possibly remapped) light, snapped to whole tones.
  function bevel(c, hw, hh, o) {
    const e = o.e === undefined ? 1 : o.e, sh = !!o.shiny, bias = o.bias === undefined ? flatBias(sh) : o.bias;
    const W = ELEV;
    const FN = mVec(W, [0, 1, 0]), UP = mVec(W, [0, 0, 1]), LF = mVec(W, [-1, 0, 0]), DN = vMul(UP, -1), RT = vMul(LF, -1);
    return (q, n) => {
      if (vDot(n, FN) < 0.9) return bias + (o.side || 0);
      const ml = mTVec(W, q), lx = ml[0] - c[0], lz = ml[2] - c[2];
      const dT = hh - lz, dB = hh + lz, dL = hw + lx, dR = hw - lx;
      const mn = Math.min(dT, dB, dL, dR);
      let d = bias;
      if (mn < e) {
        const dir = mn === dT ? UP : mn === dL ? LF : mn === dB ? DN : RT;
        d += Math.max(-1, Math.min(1, Math.round(shadeOffset(vNorm(vAdd(n, dir)), sh) - shadeOffset(n, sh))));
      }
      if (o.grain) d += o.grain(lx, lz);
      return d;
    };
  }
  // block from x0..x1, z0..z1, front face at y0, depth dp; o.m / o.t = extra model transform (hinged leaves)
  function block(x0, x1, z0, z1, y0, dp, m, tone, part, o) {
    o = o || {};
    const c = [(x0 + x1) / 2, y0 - dp / 2, (z0 + z1) / 2], hw = (x1 - x0) / 2, hh = (z1 - z0) / 2;
    const R = o.m || M_ID, t = o.t || [0, 0, 0];
    const cw = vAdd(mVec(R, c), t);
    const sh = !!MATS[m].shiny, extra = { shiny: sh };
    if (o.m && o.bias === undefined) {
      // a leaf swung away from the wall darkens in whole steps (a face left inside the dither
      // band would turn into one big checkerboard)
      const nF = mVec(ELEV, mVec(R, [0, 1, 0])), s1 = shadeOffset(nF, sh);
      // (o.step: the whole steps to take instead of the ones the turn gives)
      extra.bias = 0.2 + (o.step !== undefined ? o.step : Math.round(s1 - shadeOffset(EV, sh))) - s1;
    }
    const tex0 = bevel(c, hw, hh, Object.assign(extra, o));
    // tex in the block's own (unrotated) frame
    const tex = (o.m || o.t) ? (q, n) => {
      const qm = mTVec(ELEV, q), ql = mTVec(R, vSub(qm, t));
      return tex0(mVec(ELEV, ql), mVec(ELEV, mTVec(R, mTVec(ELEV, n))));
    } : tex0;
    return P_box(cw, [hw, dp / 2, hh], m, { part, grp: o.grp === undefined ? part : o.grp, tone, tex, rot: o.m ? R.slice() : null, line: o.line });
  }

  // ---------------------------------------------------------- frames
  // dressed-stone frame: jambs in two blocks, a lintel in two with a keystone rising into the rim
  function framePrims(A, wall, ft, key) {
    const P = [], m = mat(wall), X = A / 2, H = B - L;
    const split = Math.round(H * 0.46);
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -X : X - J, x1 = s < 0 ? -X + J : X, g = s < 0 ? 10 : 11;
      P.push(block(x0, x1, 0, split, 0, 7, m, ft, g));
      P.push(block(x0, x1, split, H, 0, 7, m, ft, g));
    }
    P.push(block(-X, -6, H, B, 0, 7, m, ft, 12));
    P.push(block(6, X, H, B, 0, 7, m, ft, 12));
    if (key === "sun") {
      // the way out: a sun medallion on a wider keystone (no other frame carries a sign)
      // (on the sandstone walls the keystone is dark old gold and the sun is stamped on it
      // with a dark rim by paintDoorway: gold on the pale gold frame, the sun melted into its
      // own stone and only its rays' shadows showed, like a cog)
      if (wall === "gold") { P.push(block(-9, 9, H - 2, B + 6, 1, 8, m, 1, 13)); return P; }
      P.push(block(-7, 7, H - 1, B + 5, 1, 8, m, ft, 13));
      const g = mat("gold", true), zc = H + 5;
      P.push(P_cyl([0, 1.2, zc], [0, 2.8, zc], 4.2, g, { part: 14, grp: 14, tone: 2 }));
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        P.push(P_cone([Math.cos(a) * 4, 2, zc + Math.sin(a) * 4], [Math.cos(a) * 6.6, 2, zc + Math.sin(a) * 6.6], 1.2, 0.2, g, { part: 14, grp: 14, tone: 2 }));
      }
    } else if (key === "boss") {
      // the way to a boss: a tall keystone that carries the boss seal in small (stamped
      // upright by paintDoorway) and two red banners hung from gold rods beside the frame
      // (on the sandstone walls the keystone is dark old gold: on the frame's pale gold, and
      // even a tone darker, the small gold sun on it was lost and read as a cog; there it also
      // gets a dark rim, see paintDoorway)
      P.push(block(-9, 9, H - 2, B + 7, 1.5, 9, m, wall === "gold" ? 1 : ft, 13));
      const red = mat("red"), gold = mat("gold", true);
      for (const s of [-1, 1]) {
        const x0 = s < 0 ? -X - 12 : X + 3, x1 = x0 + 9, g = 100 + (s < 0 ? 0 : 1);
        P.push(block(x0, x1, 31, 51, 0.8, 0.8, red, 1, g, { grp: g }));
        // a swallowtail: two points, the notch between them
        P.push(block(x0, x0 + 4, 27, 31, 0.8, 0.8, red, 1, g, { grp: g }));
        P.push(block(x1 - 4, x1, 27, 31, 0.8, 0.8, red, 1, g, { grp: g }));
        P.push(P_cyl([(x0 + x1) / 2, 1.2, 42], [(x0 + x1) / 2, 2, 42], 2.2, gold, { part: g + 10, grp: g + 10, tone: 2 }));
        P.push(P_cyl([x0 - 1.5, 1.4, 51.5], [x1 + 1.5, 1.4, 51.5], 1.2, gold, { part: g + 20, grp: g + 20, tone: 2 }));
      }
    } else {
      P.push(block(-6, 6, H - 1, B + 4, 1, 8, m, ft, 13));
    }
    return P;
  }
  // boss gatehouse: 16 px columns in drums, capitals with fire bowls, a crown through the rim
  function bossFramePrims(A, wall, ft, side) {
    const P = framePrims(A, wall, ft, null).filter(p => p.part !== 13);
    const m = mat(wall), X = A / 2, H = B - L;
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -X - 16 : X, x1 = x0 + 16, g = 15 + (s < 0 ? 0 : 1);
      P.push(block(x0 + 1, x1 - 1, 0, 4, 1, 9, m, ft - 1, g));                          // base
      for (const [z0, z1] of [[4, 18], [18, 32], [32, 44]]) P.push(block(x0 + 2, x1 - 2, z0, z1, 0, 8, m, ft, g));
      P.push(block(x0, x1, 44, 50, 1.5, 10, m, ft, g));                                   // capital
      // a gold bowl on each capital (its flame is the animated 2D torch flame, which only
      // stands upright on the north wall: a gatehouse in any other wall has bare capitals)
      if (side === "N") P.push(P_frustum([x0 + 8, 3, 50], [x0 + 8, 3, 54], 3, 6, mat("gold", true), { part: 17, grp: 17, tone: 1 }));
    }
    // crown: a flattened arch of dressed blocks behind the lintel, rising 6 px into the rim,
    // with the rim's lit and dark rows still showing above its top (reaching the wall's outer
    // edge, the screen's top edge cut it flat). Its face is flat (a domed face shaded into
    // speckles and read as a bush): upright dark joints between the blocks, the outer edge lit
    // on the left half, where it faces the light.
    // (north wall only, where the boss rooms have their gatehouse: turned onto any other wall
    // the arch bulged out of it like the rim of a drum; there the gatehouse keeps its square
    // lintel and keystone)
    const CR = [34, 9], CZ = B - 3;
    if (side === "N") P.push(P_ell([0, -4, CZ], [CR[0], 3.5, CR[1]], m, {
      part: 18, grp: 18, tone: ft,
      tex: (q, n) => {
        const ml = mTVec(ELEV, q), px = ml[0], pz = ml[2] - CZ, r = Math.hypot(px / CR[0], pz / CR[1]);
        let e = 0.2 - shadeOffset(n, false);
        const ax = Math.abs(px);
        if (r < 0.9 && [13.5, 22.5, 29.5].some(j => Math.abs(ax - j) < 0.5)) e -= 1;
        else if (r > 0.86 && px < 0) e += 1;
        return e;
      },
    }));
    P.push(block(-7, 7, H - 2, B + 4, 1.5, 9, m, ft, 19));
    // the rings the seal's chains hang from (they stay when the chains are gone)
    P.push(...ringPrims(A));
    return P;
  }
  // (caves and houses) exit to the outside: rock lip, or a timber frame with the door swung open
  const rockTex = (q) => (vnoise(q[0] * 0.35 + 5, q[1] * 0.35 + q[2] * 0.35, 13) - 0.5) * 0.72 + 0.1;
  function exitKitPrims(style, A) {
    const P = [], X = A / 2, H = B - 8;
    if (style === "cave") {
      const st = mat("stone");
      const rock = (c, r, i) => P_ell(c, r, st, { part: 80 + i, grp: 80 + i, tone: 2, tex: rockTex });
      let i = 0;
      for (const s of [-1, 1]) {
        P.push(rock([s * (X - 5), -1, 8], [6.5, 4, 8.5], i++));
        P.push(rock([s * (X - 4.5), -1.5, 24], [5.5, 4, 8], i++));
        P.push(rock([s * (X - 6), -1, 38], [7, 4, 7.5], i++));
      }
      P.push(rock([-15, -1, 49], [14, 4, 6.5], i++));
      P.push(rock([13, -1.5, 50], [16, 4, 6], i++));
      P.push(rock([0, 0, 47], [7, 3.5, 5.5], i++));
    } else {
      const wood = mat("earth");
      P.push(block(-X, -X + 7, 0, H + 1, 0, 6, wood, 3, 90));
      P.push(block(X - 7, X, 0, H + 1, 0, 6, wood, 3, 91));
      P.push(block(-X - 2, X + 2, H, B + 1, 1, 8, wood, 2, 92, { grain: (lx, lz) => (Math.abs(lz) < 0.5 && Math.abs(lx) < 20 && ((lx + 40) % 11) < 6) ? -1 : 0 }));
      // the open door: a plank leaf hinged on a jamb, swung almost flat against the
      // reveal; seams between its planks and a lit free edge, so it reads as a door and not
      // as a shadow
      // (hinged on the right jamb, so its face turns toward the light on the left)
      const R = mRotZ(1.3), pivot = [X - 7, -1, 0], t = vSub(pivot, mVec(R, pivot)), lw = 42;
      P.push(block(X - 7 - lw, X - 7, 0, H - 2, -1, 3, wood, 2, 93, {
        m: R, t, side: 1,
        grain: (lx) => { const e = lx + lw / 2; return e < 2.5 ? 1 : (Math.abs(e - lw / 3) < 1.4 || Math.abs(e - 2 * lw / 3) < 1.4) ? -1 : 0; },
      }));
    }
    return P;
  }

  // ---------------------------------------------------------- fills
  // locked leaf: planks + two iron straps with rivets; swing = 0..1 (1 = open, hinged on the left)
  function lockedPrims(A, swing, wall, side) {
    if (side === "W" || side === "E") return lockedSidePrims(A, swing, wall);
    const P = [], X = A / 2 - J, H = B - L;
    const lx = X - 3, top = H - 4;
    const wood = mat(woodOf(wall)), iron = mat("neutral");
    const n = Math.round(lx * 2 / 10), pw = lx * 2 / n;
    const R = mRotZ(-(swing || 0) * 1.45), pivot = [-lx, -3, 0];
    const o = swing ? { m: R, t: vSub(pivot, mVec(R, pivot)) } : {};
    for (let i = 0; i < n; i++) {
      const x0 = -lx + i * pw, seed = i * 7 + 3;
      const k1 = 6 + ((hash2(seed, 1, 991) * (top - 14)) | 0), k2 = 6 + ((hash2(seed, 2, 991) * (top - 14)) | 0), c1 = ((hash2(seed, 3, 991) - 0.5) * (pw - 5)) | 0;
      P.push(block(x0, x0 + pw, 0, top, -3, 3, wood, 2, 20 + i, Object.assign({
        grain: (gx, gz) => (Math.abs(gx - c1) < 0.6 && (Math.abs(gz - (k1 - top / 2)) < 2.5 || Math.abs(gz - (k2 - top / 2)) < 1.5)) ? -1 : 0,
      }, o)));
    }
    // strap hinges: an iron strap from the hinge edge two thirds across, ending in a round
    // tip, with a round knuckle on the jamb (a chest's bands run the whole way round; a
    // door's hinges start at one edge)
    const sx1 = lx * 0.4;
    for (const zc of [top * 0.2, top * 0.8]) {
      P.push(block(-lx, sx1, zc - 2, zc + 2, -2, 1.2, iron, 2, 30, o));
      const tip = [sx1, -1.4, zc];
      P.push(P_ell(swing ? vAdd(mVec(R, tip), o.t) : tip, [2.6, 0.9, 2.6], iron, { part: 32, grp: 30, tone: 2 }));
      for (let i = 0; i < 3; i++) {
        const c = [-lx + 5 + i * (sx1 + lx - 8) / 2, -1.5, zc];
        P.push(P_ell(swing ? vAdd(mVec(R, c), o.t) : c, [1.2, 0.9, 1.2], iron, { part: 31, grp: 30, tone: 3, line: false }));
      }
      // the knuckle stays on the jamb as the leaf swings
      P.push(P_cyl([-lx - 1, -1.6, zc - 3.5], [-lx - 1, -1.6, zc + 3.5], 1.9, iron, { part: 33, grp: 33, tone: 2 }));
    }
    return P;
  }
  // The side-wall leaf keeps the north door's screen grammar: a leaf seen face-on, hung on
  // ONE edge. It hangs on its outer edge (the rim side, model z = top); two strap hinges
  // run from there toward the room, the upper one longer; the planks run at right angles
  // to them; the free edge toward the room shows the leaf's thickness as a strip of end
  // grain; the lock and a ring pull sit by that free edge (paintDoorway). Mapped onto a
  // side wall this reads as a door hung on its outer jamb, not as the front of a chest.
  // swing: the leaf turns on its outer edge into the passage.
  const SIDE_STRAPS = [[-16, 0.3], [15, 0.52]];        // [model x (screen row A/2 + x), strap end / top]
  function lockedSidePrims(A, swing, wall) {
    const P = [], X = A / 2 - J, H = B - L;
    const lx = X - 3, top = H - 4, E0 = 2;
    const wood = mat(woodOf(wall)), iron = mat("neutral");
    const R = mRotX(-(swing || 0) * 1.45), pivot = [0, -3, top];
    const o = swing ? { m: R, t: vSub(pivot, mVec(R, pivot)) } : {};
    const at = (c) => swing ? vAdd(mVec(R, c), o.t) : c;
    const n = 4, pw = (top - E0) / n;
    for (let i = 0; i < n; i++) {
      const z0 = E0 + i * pw, seed = i * 7 + 5;
      const k1 = ((hash2(seed, 1, 991) - 0.5) * (2 * lx - 12)) | 0, k2 = ((hash2(seed, 2, 991) - 0.5) * (2 * lx - 12)) | 0, c1 = ((hash2(seed, 3, 991) - 0.5) * (pw - 5)) | 0;
      P.push(block(-lx, lx, z0, z0 + pw, -3, 3, wood, 2, 20 + i, Object.assign({
        grain: (gx, gz) => (Math.abs(gz - c1) < 0.6 && (Math.abs(gx - k1) < 2.5 || Math.abs(gx - k2) < 1.5)) ? -1 : 0,
      }, o)));
    }
    // the free edge: the leaf's thickness, a darker strip of end grain along the room side
    P.push(block(-lx, lx, 0, E0, -3, 3, wood, 1, 28, Object.assign({ e: 0 }, o)));
    for (const [xc, f] of SIDE_STRAPS) {
      const z1 = top * f;
      P.push(block(xc - 2, xc + 2, z1, top, -2, 1.2, iron, 2, 30, o));
      P.push(P_ell(at([xc, -1.4, z1]), [2.6, 0.9, 2.6], iron, { part: 32, grp: 30, tone: 2 }));
      for (let i = 0; i < 3; i++) P.push(P_ell(at([xc, -1.5, top - 4 - i * (top - 4 - z1 - 4) / 2]), [1.2, 0.9, 1.2], iron, { part: 31, grp: 30, tone: 3, line: false }));
      // the knuckle stays on the frame as the leaf swings
      P.push(P_cyl([xc - 3.5, -1.6, top + 1.2], [xc + 3.5, -1.6, top + 1.2], 1.9, iron, { part: 33, grp: 33, tone: 2 }));
    }
    return P;
  }
  // shutter: portcullis of round bars; p = 1 fully down, 0 raised into the slot under the lintel
  function shutterPrims(A, p) {
    const P = [], X = A / 2 - J, H = B - L, iron = mat("neutral", true);
    const n = A >= 70 ? 5 : 4, gap = (X * 2 - n * 4) / (n + 1);
    const drop = (1 - p) * H;
    for (let i = 0; i < n; i++) {
      const x = -X + gap + 2 + i * (4 + gap);
      // (short blunt spikes: long ones on the side walls read as arrows)
      if (drop + 3 < B - 1) {
        P.push(P_cyl([x, -3, drop + 3], [x, -3, B - 1], 2, iron, { part: 40 + i, grp: 40, tone: 2 }));
        P.push(P_cone([x, -3, drop + 3.2], [x, -3, drop], 2.2, 0.7, iron, { part: 40 + i, grp: 40, tone: 2 }));
      }
    }
    for (const zc of [H * 0.3, H * 0.72]) {
      const z = zc + drop;
      if (z + 2 < H) {
        P.push(block(-X + 1, X - 1, z - 2, z + 2, -0.6, 1.4, iron, 2, 50));
        for (let i = 0; i < n; i++) P.push(P_ell([-X + gap + 2 + i * (4 + gap), -0.2, z], [1.2, 0.8, 1.2], iron, { part: 51, grp: 50, tone: 3, line: false }));
      }
    }
    return P;
  }
  // boss leaves: dark iron panels with gold trim and studs; open = 0..1 (both swing inward)
  function bossLeavesPrims(A, open) {
    const P = [], X = A / 2 - J, H = B - L, iron = mat("neutral"), gold = mat("gold");
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? -X : 1, x1 = s < 0 ? -1 : X, ang = s * (open || 0) * 1.45;
      const R = mRotZ(ang), pivot = [s < 0 ? -X : X, -3, 0];
      const o = open ? { m: R, t: vSub(pivot, mVec(R, pivot)) } : {};
      const g = s < 0 ? 60 : 61;
      // The leaves take the light in steps, and never more than one tone off their closed
      // tone, so the pair stays one material: the one turning toward the light (right) goes up
      // a tone once well open, the other goes down a tone only at the end; the gold trim stays
      // put on the lit leaf (as cream it read as a second, painted door).
      const lit = s > 0, stI = open >= 0.5 ? (lit ? 1 : (open >= 0.8 ? -1 : 0)) : 0, stG = !lit && open >= 0.8 ? -1 : 0;
      P.push(block(x0, x1, 0, H, -3, 3, iron, 1, g, Object.assign({ grp: g, step: stI }, o)));
      const tr3 = [[x0, x1, H - 3, H], [x0, x1, 0, 3], [x0, x0 + 3, 3, H - 3], [x1 - 3, x1, 3, H - 3], [x0 + 3, x1 - 3, H * 0.5 - 1.5, H * 0.5 + 1.5]];
      for (const [a0, a1, z0, z1] of tr3) P.push(block(a0, a1, z0, z1, -2.2, 0.8, gold, 2, g + 10, Object.assign({ grp: g, step: stG }, o)));
      for (const zz of [H * 0.25, H * 0.75]) for (const f of [0.33, 0.67]) {
        const c = [x0 + (x1 - x0) * f, -2.3, zz];
        P.push(P_ell(open ? vAdd(mVec(R, c), o.t) : c, [1.1, 0.8, 1.1], gold, { part: g + 20, grp: g, tone: 2, line: false }));
      }
    }
    return P;
  }
  // chains from an iron ring under each column capital to the seal: big links alternating
  // face-on (an open oval with a dark eye) and edge-on (a short bar); fall 0..1 drops the seal
  // end so the chains hang from their rings
  // (the rings stand proud of the column and the chains run in front of the jambs: behind
  // the jamb face they seemed to start inside the door panel)
  const RING_Z = 41, CHAIN_Y = [2.2, 1.2];            // chain depth at the ring and at the seal
  const ringAt = (A, s) => [s * (A / 2 + 2.5), CHAIN_Y[0], RING_Z];
  function ringPrims(A) {
    const P = [], iron = mat("neutral", true);
    for (const s of [-1, 1]) {
      const c = ringAt(A, s);
      P.push(P_cyl([c[0], -1.2, c[2]], [c[0], 1.8, c[2]], 2.6, iron, {
        part: 75, grp: 75, tone: 2,
        tex: (q) => { const ml = mTVec(ELEV, q); return Math.hypot(ml[0] - c[0], ml[2] - c[2]) < 1.2 ? -3 : 0; },
      }));
    }
    return P;
  }
  function chainPrims(A, fall) {
    const P = [], iron = mat("neutral", true), X = A / 2, f = fall || 0;
    for (const s of [-1, 1]) {
      const a = ringAt(A, s), b = [s * (11 + f * (X - 8.5)), CHAIN_Y[1] + f * (CHAIN_Y[0] - CHAIN_Y[1]), 26 - f * 18];
      const d = vSub(b, a), len = vLen(d), nL = Math.max(2, Math.round(len / 4.4)), ang = Math.atan2(-d[2], d[0]), rot = mRotY(ang);
      for (let i = 1; i <= nL; i++) {
        const c = vAdd(a, vMul(d, i / nL)), flat = (i & 1) === 0;
        const tex = flat ? (q) => { const ml = mTVec(ELEV, q), lr = mTVec(rot, vSub(ml, c)); return (Math.abs(lr[0]) < 1.3 && Math.abs(lr[2]) < 0.6) ? -3 : 0; } : undefined;
        P.push(P_ell(c, flat ? [2.9, 0.7, 1.8] : [2.6, 1.3, 0.8], iron, { part: 70 + (i & 1), grp: 70 + (i & 1), tone: 2, rot, tex }));
      }
    }
    return P;
  }

  // ---------------------------------------------------------- symbols (upright on every wall)
  const _badge = new Map();
  // The brass of the lock plate: on the sandstone walls (gold bricks, a pale gold frame) plain
  // brass is the bricks' own colour, so there it is an old, darker brass.
  const brassTone = (wall) => wall === "gold" ? 1 : 2;
  function lockBadge(wall) {
    const bt = brassTone(wall), k = "lock" + bt;
    if (_badge.has(k)) return _badge.get(k);
    const P = [block(-8, 8, -9, 9, 0, 1.5, mat("neutral"), 1, 1), block(-6.5, 6.5, -7.5, 7.5, 1.2, 1.2, mat("gold"), bt, 2)];
    const r = render3D(xformPrims(P, ELEV), 20, 22, 10, 11, { outline: "prop" });
    // an ink keyhole with a round top
    const K = [".##.", "####", "####", ".##.", ".##.", "####"], ink = inkU32();
    K.forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "#") r.pix.d[(8 + y) * 20 + 8 + x] = ink; }));
    const out = { pix: r.pix, w: 20, h: 22, cx: 10, cy: 11 };
    _badge.set(k, out);
    return out;
  }
  // A ring pull (side-wall leaves): an iron rose with a drop ring hanging from it, upright
  // on every wall like the lock.
  function ringBadge() {
    if (_badge.has("ring")) return _badge.get("ring");
    const iron = mat("neutral", true), P = [P_cyl([0, -0.4, 0], [0, 1.2, 0], 2.4, iron, { part: 1, grp: 1, tone: 2 })];
    for (let i = 0; i < 16; i++) {
      const t = i / 16 * Math.PI * 2;
      P.push(P_ell([Math.sin(t) * 3.1, 0.5, -5.3 + Math.cos(t) * 3.1], [1, 0.9, 1], iron, { part: 2, grp: 2, tone: 2 }));
    }
    const r = render3D(xformPrims(P, ELEV), 11, 15, 5.5, 3.5, { outline: "prop" });
    const out = { pix: r.pix, w: 11, h: 15, cx: 5, cy: 3 };
    _badge.set("ring", out);
    return out;
  }
  // The lock plate lying where it fell: seen from above, its brass face catching the light,
  // its iron edge below.
  function fallenPlate(wall) {
    const bt = brassTone(wall), k = "fallen" + bt;
    if (_badge.has(k)) return _badge.get(k);
    const lg = { k: inkU32(), i: pc("neutral", 1), e: pc("neutral", 2), g: pc("gold", bt + 1), m: pc("gold", bt), d: pc("gold", bt - 1) };
    const pix = pixFromRows([
      "..kkkkkkkkkkkk..",
      ".kiggggggggggik.",
      ".kigggkkgggmmik.",
      ".kimmmmkmmmmdik.",
      ".kiiiiiiiiiiiik.",
      ".keeeeeeeeeeeek.",
      "..kkkkkkkkkkkk..",
    ], lg);
    const out = { pix, w: 16, h: 7, cx: 8, cy: 3 };
    _badge.set(k, out);
    return out;
  }
  // the boss seal (an original sigil): a gold sun of twelve rays whose face is a closed boss of
  // dark gold with a red gem set in its middle (an open dark centre read as an eye socket, or
  // a slot for a shard); state 0 whole, 1 flash, 2 cracked
  function sealPrims(s) {
    s = s || 1;
    const gold = mat("gold", true), dgold = mat("gold"), red = mat("red", true), P = [];
    P.push(P_cyl([0, -0.5, 0], [0, 1.0, 0], 11.5 * s, gold, { part: 1, grp: 1, tone: 2 }));
    P.push(P_cyl([0, 0.9, 0], [0, 1.8, 0], 7.4 * s, dgold, { part: 2, grp: 2, tone: 1, flat: true }));
    P.push(P_ell([0, 1.9, 0], [3.9 * s, 1.8 * s, 3.9 * s], red, { part: 4, grp: 4, tone: 1 }));
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 + Math.PI / 12;
      P.push(P_cone([Math.cos(a) * 11 * s, 0.3, Math.sin(a) * 11 * s], [Math.cos(a) * 14.5 * s, 0.3, Math.sin(a) * 14.5 * s], 1.6 * s, 0.2, gold, { part: 3, grp: 1, tone: 2 }));
    }
    return P;
  }
  // the gem's setting: a dark gold collar round it, a white glint on its upper left; the
  // flat dark gold boss round it (out to rb) lit along its upper left rim, shaded on its lower right
  function setGem(pix, W, cx, cy, rg, rb) {
    const collar = pc("gold", 0), wh = pc("white", 0), boss = pc("gold", 1);
    for (let y = 0; y < pix.h; y++) for (let x = 0; x < W; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, r0 = Math.hypot(dx, dy);
      if (r0 >= rg && r0 < rg + 1) pix.d[y * W + x] = collar;
      else if (rb && r0 >= rb - 1 && r0 < rb && pix.d[y * W + x] === boss) pix.d[y * W + x] = pc("gold", dx + dy < -1 ? 2 : dx + dy > 1 ? 0 : 1);
    }
    const gx = Math.floor(cx - rg * 0.45), gy = Math.floor(cy - rg * 0.45);
    pix.d[gy * W + gx] = wh;
  }
  function sealBadge(state) {
    const k = "seal" + state;
    if (_badge.has(k)) return _badge.get(k);
    const W = 34, Hh = 34, r = render3D(xformPrims(sealPrims(1), ELEV), W, Hh, 17, 17, { outline: "char" });
    let pix = r.pix;
    const ink = inkU32();
    setGem(pix, W, 17, 17, 4.1, 7.4);
    if (state === 2) {
      // cracked: the halves part by 2 px along a jagged split
      const q = new Pix(W + 2, Hh);
      for (let y = 0; y < Hh; y++) {
        const cut = 17 + ((y >> 2) & 1 ? 1 : -1);
        for (let x = 0; x < W; x++) { const c = pix.d[y * W + x]; if (!c) continue; q.d[y * (W + 2) + (x < cut ? x : x + 2)] = c; }
      }
      pix = q;
    }
    if (state === 1) { const wh = pc("white", 0); for (let i = 0; i < pix.d.length; i++) if (pix.d[i] && pix.d[i] !== ink) pix.d[i] = wh; }
    const out = { pix, w: pix.w, h: Hh, cx: pix.w >> 1, cy: 17 };
    _badge.set(k, out);
    return out;
  }
  // the same seal at half size, on the keystone of the door that leads to a boss
  function miniSealBadge() {
    if (_badge.has("sealmini")) return _badge.get("sealmini");
    const W = 17, r = render3D(xformPrims(sealPrims(0.5), ELEV), W, W, 8.5, 8.5, { outline: "char" });
    setGem(r.pix, W, 8.5, 8.5, 2.5);
    const out = { pix: r.pix, w: W, h: W, cx: 8, cy: 8 };
    _badge.set("sealmini", out);
    return out;
  }
  // The way-out sun on its own (the sandstone walls' exit keystone): a pale gold disc and
  // eight gold rays, rimmed in the darkest gold so it stands off the keystone.
  function sunBadge() {
    if (_badge.has("sun")) return _badge.get("sun");
    // (the rays stand a pixel clear of the disc: the dark rim runs between them too, so disc
    // and rays read apart, not as one pale splat)
    const g = mat("gold", true), P = [P_cyl([0, -0.4, 0], [0, 1.2, 0], 3.5, g, { part: 1, grp: 1, tone: 3 })];
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      P.push(P_cone([Math.cos(a) * 5.1, 0.4, Math.sin(a) * 5.1], [Math.cos(a) * 7.6, 0.4, Math.sin(a) * 7.6], 1.2, 0.3, g, { part: 2, grp: 2, tone: 3 }));
    }
    const W = 19, r = render3D(snapTones(xformPrims(P, ELEV)), W, W, 9.5, 9.5, { outline: "prop" });
    const out = { pix: r.pix, w: W, h: W, cx: 9, cy: 9 };
    _badge.set("sun", out);
    return out;
  }
  // a badge with a 1 px rim of colour col round its whole silhouette (1 px larger each way)
  function rimmedBadge(bd, col) {
    if (bd._rim && bd._rim[col]) return bd._rim[col];
    const W = bd.w + 2, Hh = bd.h + 2, p = new Pix(W, Hh), on = (x, y) => x >= 0 && y >= 0 && x < bd.w && y < bd.h && bd.pix.d[y * bd.w + x];
    for (let y = -1; y <= bd.h; y++) for (let x = -1; x <= bd.w; x++) {
      if (on(x, y)) p.d[(y + 1) * W + x + 1] = bd.pix.d[y * bd.w + x];
      else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) p.d[(y + 1) * W + x + 1] = col;
    }
    const out = { pix: p, w: W, h: Hh, cx: bd.cx + 1, cy: bd.cy + 1 };
    (bd._rim || (bd._rim = {}))[col] = out;
    return out;
  }

  // ---------------------------------------------------------- render a kit for one wall
  // Returns { pix, ext }: the N-orientation image; column c <-> a = c - 1 - ext, row r <-> b = T + B - 1 - r.
  const _kit = new Map();
  // Every kit surface lands on a whole tone: a bar, a bowl, a leaf seen edge-on or a curved
  // crown shades in clean steps instead of 1 px checker columns (at 1x those shimmer like rope).
  function snapTones(P) {
    for (const p of P) {
      if (p.flat) continue;
      const t0 = p.tex, mt = MATS[p.mat], base = p.tone !== undefined ? p.tone : mt.base, sh = !!(p.shiny || mt.shiny);
      p.tex = (q, n, px, py) => { const t = t0 ? t0(q, n, px, py) : 0, f = base + shadeOffset(n, sh) + t; return t + Math.round(f) - f; };
    }
    return P;
  }
  function renderKit(key, side, A, ext, build) {
    const k = key + "|" + side + "|" + A;
    let out = _kit.get(k);
    if (out) return out;
    const W = A + 2 * ext + 2, Hh = T + B + 1;
    const r = withSideLight(side, () => render3D(snapTones(xformPrims(build(side), ELEV)), W, Hh, A / 2 + ext + 1, T + B, { outline: "prop" }));
    out = { pix: r.pix, ext };
    _kit.set(k, out);
    return out;
  }
  // door-local (a across, b depth from the floor edge) -> room pixel
  function toScreen(side, a, b) {
    const d = DOOR_BOX[side];
    switch (side) {
      case "N": return [d.x0 + a, d.y1 - 1 - b];
      case "S": return [d.x0 + a, d.y0 + b];
      case "W": return [d.x1 - 1 - b, d.y0 + a];
      case "E": return [d.x0 + b, d.y0 + a];
    }
  }
  // targets are Pix buffers, optionally offset (t.ox, t.oy = room pixel of their corner)
  function put(t, x, y, c) {
    x -= t.ox || 0; y -= t.oy || 0;
    if (x >= 0 && y >= 0 && x < t.w && y < t.h) t.d[y * t.w + x] = c;
  }
  function stamp(dst, kit, side, over, overFromB, minB) {
    const pix = kit.pix, W = pix.w, Hh = pix.h;
    for (let r = 0; r < Hh; r++) for (let c = 0; c < W; c++) {
      const col = pix.d[r * W + c];
      if (!col) continue;
      const a = c - 1 - kit.ext, b = Hh - 2 - r;
      if (minB !== undefined && b < minB) continue;
      const [x, y] = toScreen(side, a, b);
      put(dst, x, y, col);
      if (over && b >= overFromB) put(over, x, y, col);
    }
  }
  // (dark: whole tone steps darker, for a badge riding on a leaf turned from the light)
  // (minB: only the pixels at door depth b >= minB, e.g. the part over the lintel for the overlay)
  function stampBadge(dst, bd, side, a, b, dy, dark, _s, minB) {
    const [x, y] = toScreen(side, a, b);
    for (let yy = 0; yy < bd.h; yy++) for (let xx = 0; xx < bd.w; xx++) {
      let col = bd.pix.d[yy * bd.w + xx];
      if (!col) continue;
      for (let i = 0; i < -(dark || 0); i++) col = darker(col);
      const X = Math.round(x - bd.cx + xx), Y = Math.round(y - bd.cy + yy + (dy || 0));
      if (minB !== undefined && doorLocal(side, X, Y).b < minB) continue;
      put(dst, X, Y, col);
    }
  }

  // ---------------------------------------------------------- painted passage and sill
  const REVEAL = { N: [1, 3], S: [1, 3], W: [2, 3], E: [2, 3] };
  function darkerN(c, n) { for (let i = 0; i < n; i++) c = darker(c); return c; }
  // Floors too pale for the plain steps (the sandstone vault's lime plaster): they start a
  // step darker right behind the threshold and fall into the dark in fewer, longer steps
  // (their pale bands drew a flight of stairs).
  const BRIGHT_FLOOR = new Set(["plaster"]);
  // ordered dither masks: a quarter, the opposite quarter, a half
  const q25 = (x, y) => !(x & 1) && !(y & 1), q25o = (x, y) => (x & 1) && (y & 1), q50 = (x, y) => (x + y) & 1;
  // Steps of the passage into the dark, each change graded over three rows (a quarter, a half,
  // three quarters of the next tone).
  // (a pale floor: a lit strip only 2 rows deep at the threshold, then steps of different
  // depths, each change dithered over 3-4 rows on a 2x2 ordered pattern: equal bands with a
  // short blend still drew a flight of stairs)
  const BAYER = [[0, 2], [3, 1]];
  function fadeIn(v, v0, n, x, y) {
    if (v < v0) return 0;
    if (v >= v0 + n) return 1;
    return (v - v0 + 1) * 4 / (n + 1) > BAYER[y & 1][x & 1] + 0.5 ? 1 : 0;
  }
  function passageSteps(v, x, y, bright) {
    if (bright) return 2 + fadeIn(v, 2, 3, x, y) + fadeIn(v, 11, 4, x, y);
    const s1 = 10, s2 = 20;
    let k = (v < s1 ? 1 : v < s2 ? 2 : 3) + (bright ? 1 : 0);
    for (const s of [s1, s2]) {
      if (v === s - 2 && q25(x, y)) k += 1;
      else if (v === s - 1 && q50(x, y)) k += 1;
      else if (v === s && q25o(x, y)) k -= 1;
    }
    return k;
  }
  // The passage seen through the doorway: the room's flagstones run in and fade into the
  // dark ("open"), or darken, then brighten into daylight and the land outside ("exit"; out =
  // the kind of land round the dungeon's mouth). The side walls of the tunnel show as wedges
  // that lean toward the room centre, like the room's mitres. "barred" (a shutter at rest) is
  // the same passage without the flagstone joints (between the bars they read as teeth); the
  // bars' moving frames show the open passage itself, so nothing changes behind them as they go.
  function passagePixel(kind, side, a, b, A, wall, floor, x, y, out) {
    const AI = A - 2 * J, H = B - L, ai = a - J;
    if (ai < 0 || ai >= AI || b < 0 || b >= H) return 0;
    const w = Math.round(4 * b / (H - 1)), rv = REVEAL[side], dith = (x + y) & 1;
    if (ai < w) return pc(wall, rv[0]);
    if (ai >= AI - w) return pc(wall, rv[1]);
    const u = ai - w, v = b;
    // the room's flagstones run on into the passage, their joints only on the first (lightest)
    // step: deeper in, the floor is one smooth tone (joints there drew benches in the dark)
    const col = (v < 9 && kind !== "barred") ? floorColor(floor, u + 5 + (side === "W" || side === "E" ? 300 : 0), -v + 64, false) : pc(floor, 2);
    if (kind === "exit") return exitPixel(ai, v, AI, H, floor, col, x, y, out);
    const bright = BRIGHT_FLOOR.has(floor);
    if (bright ? fadeIn(v, 23, 4, x, y) : v >= 30) return (!bright && v < 32 && dith) ? darkerN(col, 4) : inkU32();
    let k = passageSteps(v, x, y, bright);
    if (u < 2) k += 1;                                   // shade along the dark reveal
    return darkerN(col, k);
  }
  // The land outside each way out (the country round the dungeon's mouth on the overworld):
  // bank tones [in the arch's shade, near, far, lit blade, dark fleck], path tones [shade,
  // near, far, worn edge near, worn edge far, fleck]
  const OUTSIDE = {
    grass: { bank: [["green", 2], ["green", 3], ["green", 4], ["green", 5], ["green", 2]], path: [["earth", 3], ["earth", 4], ["sand", 0], ["earth", 2], ["earth", 3], ["earth", 3]] },
    // the forest's shade: darker grass, a darker earth path
    forest: { bank: [["green", 1], ["green", 2], ["green", 3], ["green", 4], ["green", 1]], path: [["earth", 2], ["earth", 3], ["earth", 4], ["earth", 1], ["earth", 2], ["earth", 2]] },
    // the desert: rippled sand banks either side of a paler trodden way, its edges worn a
    // step darker (all in the two sand tones it read as a pale smear with no path in it)
    sand: { bank: [["earth", 3], ["earth", 4], ["earth", 4], ["sand", 0], ["earth", 3]], path: [["earth", 3], ["sand", 0], ["sand", 1], ["earth", 2], ["earth", 3], ["earth", 4]] },
    // the mountains: brown scree strewn with grey stones, a paler worn track
    scree: { bank: [["earth", 2], ["earth", 3], ["earth", 3], ["earth", 4], ["earth", 2]], path: [["earth", 3], ["earth", 4], ["earth", 4], ["earth", 3], ["earth", 3], ["sand", 0]] },
  };
  // The outside seen through a way out: past a short stretch of tunnel floor, a path runs off
  // between banks, narrowing with distance, into a glare of daylight at the far end. Its edges
  // are ragged (the bank over the path here and there, a pebble or two), never ruled lines.
  // ai across the opening (0..AI-1), v depth from the sill.
  function exitPixel(ai, v, AI, H, floor, col, x, y, out) {
    const dith = (x + y) & 1, MOUTH = 13, O = OUTSIDE[out] || OUTSIDE.grass, C = (e) => pc(e[0], e[1]);
    if (v < MOUTH) return v < 9 ? darkerN(col, 1) : darkerN(col, (v === 9 && dith) ? 1 : 2);
    const t = (v - MOUTH) / (H - 1 - MOUTH);           // 0 at the mouth, 1 at the far end
    // far glare, its lower edge stepping by column pairs
    const vg = H - 7 + (hash2(ai >> 1, 3, 947) < 0.5 ? 1 : 0) - (hash2(ai >> 2, 4, 947) < 0.3 ? 1 : 0);
    if (v >= vg + 2) return pc("white", 0);
    if (v >= vg) return pc("sand", 1);
    // the path: wide at the mouth, a third as wide at the glare, each edge wobbling by row pairs
    const r2 = v >> 1, cx = AI / 2 - 1 + (v > MOUTH + 16 ? 1 : 0);
    const hw = 12 - 8 * t;
    const hl = Math.round(hw + (hash2(r2, 1, 946) < 0.35 ? 1 : 0) - (hash2(r2, 2, 946) < 0.25 ? 1 : 0));
    const hr = Math.round(hw + (hash2(r2, 5, 946) < 0.35 ? 1 : 0) - (hash2(r2, 6, 946) < 0.25 ? 1 : 0));
    const du = ai - cx;
    // a tuft of the bank leaning over the left edge, a pebble on the path (in the desert a
    // brown stone: a red chip read as a stray pixel or a drop of blood)
    const tuft = (v >= MOUTH + 6 && v < MOUTH + 9 && du >= -hl && du < -hl + (v === MOUTH + 6 ? 1 : 3)) ||
      (v >= MOUTH + 17 && v < MOUTH + 19 && du >= hr - 2 && du < hr);
    const pv = MOUTH + 10, pu = -3, pr = out === "sand" ? "earth" : "stone";
    if (!tuft && v >= pv && v < pv + 2 && du >= pu && du < pu + 3) return (v === pv && du < pu + 2) ? pc(pr, 3) : pc(pr, 1);
    // (tone steps along the path and the banks are ragged by column pairs too)
    const vs = MOUTH + 3 + (hash2(ai >> 1, 7, 949) < 0.5 ? 1 : 0);                            // the arch's shade
    const vm = MOUTH + 9 + (hash2(ai >> 1, 8, 949) < 0.5 ? 1 : 0) - (hash2(ai >> 2, 9, 949) < 0.3 ? 2 : 0);
    const Pt = O.path, Bk = O.bank;
    if (!tuft && du >= -hl && du < hr) {
      if (du === -hl || du === hr - 1) return C(v < vm ? Pt[3] : Pt[4]);                       // worn edge
      const s = hash2(x, y, 941);
      if (v < vs) return s < 0.2 ? C(Pt[3]) : C(Pt[0]);
      if (v < vm + 8) return s < 0.1 ? C(Pt[0]) : s > 0.85 ? C(Pt[5]) : C(Pt[1]);
      return s < 0.12 ? C(Pt[1]) : C(Pt[2]);
    }
    const g = hash2(x, y >> 1, 948);
    if (out === "scree" && v >= vs) {
      // grey stones on the scree: 2 x 2, lit on the upper left, one to a 4 x 3 cell at most
      const cxS = ai >> 2, cyS = Math.floor(v / 3), hs = hash2(cxS, cyS, 951);
      if (hs < 0.45) {
        const sx = (cxS << 2) + ((hs * 97) | 0) % 3, sy = cyS * 3 + ((hs * 131) | 0) % 2;
        if (ai >= sx && ai < sx + 2 && v >= sy && v < sy + 2) return pc("stone", (ai === sx && v === sy) ? 4 : (ai === sx || v === sy) ? 3 : 1);
      }
    }
    // wind ripples across the dunes: long curved strokes, each a darker trough under a lit
    // crest (short staggered dashes read as tiles or brick joints), fainter far off
    if (out === "sand" && v >= vs) {
      const ph = (v + Math.round(1.6 * Math.sin(ai * 0.21 + (ai < AI / 2 ? 0 : 2.1)))) % 5;
      if (ph === 0) return v < vm + 6 ? pc("earth", 2) : C(Bk[4]);
      if (ph === 4 && v < vm + 6) return pc("sand", 0);
    }
    // banks: darker in the arch's shade, blades or glints catching the light
    if (v < vs) return g < 0.15 ? C(Bk[1]) : C(Bk[0]);
    if (g < 0.1) return C(Bk[3]);
    if (g > 0.9) return C(Bk[4]);
    return C(v < vm ? Bk[1] : Bk[2]);
  }
  // The threshold (b < 0, in the trim band): a stone slab where the trim is cut. -1 = leave.
  function sillPixel(a, b, A, wall, trim) {
    const d = -1 - b;
    if (d >= 12) return -1;
    if ((a >= J - 2 && a < J) || (a >= A - J && a < A - J + 2)) return pc(trim, 0);   // trim end caps
    if (a < J || a >= A - J) return -1;
    if (d < 4) return pc(wall, d === 0 ? 2 : d === 1 ? Math.min(rampLen(wall) - 1, 4) : d === 3 ? 1 : 3);
    return 0;
  }
  // Two shallow steps of the wall stone in front of the boss gatehouse, across the trim band.
  function daisPixel(a, b, A, wall) {
    const d = -1 - b;
    const X0 = -16, X1 = A + 16;
    if (d < 5) { if (a < X0 + 2 || a >= X1 - 2) return -1; return pc(wall, d === 0 ? 1 : d === 1 ? 4 : d === 4 ? 1 : 3); }
    if (d < 6) return (a < X0 + 2 || a >= X1 - 2) ? -1 : pc(wall, 0);
    if (d < 11) return pc(wall, d === 6 ? 3 : d === 10 ? 1 : 2);
    if (d < 12) return pc(wall, 0);
    return -1;
  }

  // ---------------------------------------------------------- floor rubble (normal camera)
  // (round: a low rounded stone, no corner poking up)
  function rubbleSprite(ramp, seed, big, tone, round) {
    tone = tone === undefined ? 2 : tone;
    const key = "rub" + ramp + seed + (big ? "b" : "") + tone + (round ? "r" : "");
    if (_badge.has(key)) return _badge.get(key);
    // (the mossy walls' rubble is the wall's own dark green, with moss on top)
    const m = mat(ramp === "moss" ? "green" : ramp), r = (i) => hash2(seed, i, 961);
    if (ramp === "moss") tone = 1;
    const s = big ? 1 : 0.55;
    const P = round
      ? [P_ell([0, 0, 1.6 * s], [(3.2 + r(1) * 1.6) * s, (2.4 + r(2) * 1.2) * s, 1.8 * s], m, { part: 1, grp: 1, tone, rot: mRotZ(r(3) * 3) })]
      : [P_box([0, 0, 2.2 * s], [(3 + r(1) * 2) * s, (2.4 + r(2) * 1.5) * s, 2.2 * s], m, { part: 1, grp: 1, tone, rot: mMul(mRotZ(r(3) * 3), mRotX((r(4) - 0.5) * 0.5)) })];
    if (big && !round && r(5) < 0.6) P.push(P_box([2.5, 1, 1.5], [2, 1.6, 1.5], m, { part: 2, grp: 2, tone, rot: mRotZ(r(6) * 3) }));
    const out = render3D(P, 20, 16, 10, 11, { outline: "prop" });
    if (ramp === "moss") {
      // the mossy walls' rubble: the wall's dark green brick, a cap of the wall's moss on its
      // top edge (grey-white chips read as stone brought from elsewhere). The top pixel of each
      // column (two on a big stone) turns moss green, a step or two over the brick.
      const d = out.pix.d, W = out.pix.w, rim = pc("green", 0), cap = big ? 2 : 1;
      for (let x = 0; x < W; x++) {
        let n = 0;
        for (let y = 0; y < out.pix.h && n < cap; y++) {
          const c = d[y * W + x];
          if (!c || c === rim) continue;
          d[y * W + x] = pc("green", n === 0 ? 3 : 2);
          n++;
        }
      }
    }
    _badge.set(key, out);
    return out;
  }
  // a stone set down on the floor: its pixels, then a 1 px contact shade to its lower right
  function stampSprite(dst, spr, x, y) {
    const on = (xx, yy) => xx >= 0 && yy >= 0 && xx < spr.w && yy < spr.h && spr.pix.d[yy * spr.w + xx];
    for (let yy = 0; yy < spr.h; yy++) for (let xx = 0; xx < spr.w; xx++) {
      const col = spr.pix.d[yy * spr.w + xx];
      if (col) put(dst, x - spr.ax + xx, y - spr.ay + yy, col);
    }
    for (let yy = 0; yy < spr.h; yy++) for (let xx = 0; xx < spr.w; xx++) {
      if (!on(xx, yy) || on(xx + 1, yy + 1) || on(xx, yy + 1)) continue;
      const X = x - spr.ax + xx + 1, Y = y - spr.ay + yy + 1;
      if (X >= 0 && Y >= 0 && X < dst.w && Y < dst.h) dst.d[Y * dst.w + X] = darker(dst.d[Y * dst.w + X]);
    }
  }
  // mossy walls shed their own dark green brick with moss on top
  const rubbleRamp = (wall) => wall === "green" ? "moss" : wall;

  // ---------------------------------------------------------- crack and breach, in face coordinates
  // The face brick grid of room.js faceColor(): courses 9 deep, head joints every 20 (offset 10).
  const off = (d) => ((Math.floor(d / 9)) & 1) ? 10 : 0;
  function brickId(u, d) { return Math.floor(d / 9) * 1000 + Math.floor((u + off(d)) / 20); }
  function toneOf(ramp, c) { const r = STYLE.ramps[ramp]; for (let t = 0; t < r.length; t++) if (hexU32(r[t]) === c) return t; return -1; }
  // (never past tone 4: the top of the green ramp is a leafy yellow, and lit bricks turned into a plant)
  function lighter(ramp, c, n) { const t = toneOf(ramp, c); return t < 0 ? c : pc(ramp, Math.min(rampLen(ramp) - 1, 4, t + n)); }
  // A weak spot in the wall (the hint that a passage hides here): one brick knocked clean out
  // and two separate stair-step cracks running off its corners along the mortar joints, 2 px
  // wide at the hole and 1 px further out, where they stop. They never meet, and a full brick
  // of clean wall is left beyond their ends and above the floor (a closed loop of cracks read
  // as a drawn symbol). hu0 = the knocked-out brick's first column (it spans hu0..hu0+19 in
  // course 2, face depth 18..26).
  function crackSet(hu0) {
    const S = new Map(), put2 = (u, d, w) => { const k = u * 1000 + d; S.set(k, Math.max(S.get(k) || 0, w)); };
    // [u0, d0, u1, d1, width]: along a bed joint (d0 = d1) or down a head joint (u0 = u1);
    // a 2 px segment widens into the brick below or to the right of its joint
    const SEG = [
      // down and away from the hole's lower corner
      [hu0, 27, hu0 - 10, 27, 2], [hu0 - 10, 27, hu0 - 10, 36, 2], [hu0 - 10, 36, hu0 - 20, 36, 1], [hu0 - 20, 36, hu0 - 20, 41, 1],
      // up and away from its upper far corner
      [hu0 + 20, 18, hu0 + 30, 18, 2], [hu0 + 30, 18, hu0 + 30, 12, 1],
    ];
    for (const [u0, d0, u1, d1, w] of SEG) {
      if (d0 === d1) for (let u = Math.min(u0, u1); u <= Math.max(u0, u1); u++) { put2(u, d0, w); if (w === 2) put2(u, d0 + 1, 2); }
      else for (let d = Math.min(d0, d1); d <= Math.max(d0, d1); d++) { put2(u0, d, w); if (w === 2) put2(u0 + 1, d, 2); }
    }
    return S;
  }
  function paintCrack(Fp, side, wall, A) {
    const ns = side === "N" || side === "S";
    const box = DOOR_BOX[side];
    const hu0 = Math.floor(((ns ? (box.x0 + box.x1) / 2 : (box.y0 + box.y1) / 2) - 4) / 20) * 20;
    const S = crackSet(hu0);
    // (wide enough for a loosened brick beside the outer fissures)
    const x0 = box.x0 - 24, x1 = box.x1 + 24, y0 = box.y0 - 24, y1 = box.y1 + 24, w = x1 - x0;
    // face coordinates of the region, once
    const U = new Int16Array(w * (y1 - y0)), D = new Int16Array(w * (y1 - y0)), onSide = new Uint8Array(w * (y1 - y0));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const p = roomPart(x, y), i = (y - y0) * w + (x - x0);
      if (p.side === side) { onSide[i] = 1; U[i] = p.u; D[i] = p.d; }
    }
    const at = (x, y) => (x < x0 || y < y0 || x >= x1 || y >= y1) ? -1 : (y - y0) * w + (x - x0);
    const inCrack = (x, y) => { const i = at(x, y); return i >= 0 && onSide[i] && S.has(U[i] * 1000 + D[i]); };
    const bid = (x, y) => { const i = at(x, y); return (i >= 0 && onSide[i]) ? brickId(U[i], D[i]) : -1; };
    // the knocked-out brick, and the two beside it shaken proud of the face (the one past the
    // hole's far edge and the one the lower crack wraps round)
    const holes = new Set([brickId(hu0 + 1, 22)]), pushed = new Set([brickId(hu0 + 21, 22), brickId(hu0 - 9, 30)]);
    // (lit edges one tone up on the mossy green wall: two tones lit whole bricks into a plant)
    const lift = wall === "green" ? 1 : 2;
    const ink = inkU32();
    const src = Fp.d.slice();
    let notch = null;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = at(x, y);
      if (!onSide[i]) continue;
      const k = y * Fp.w + x, c0 = src[k];
      if (inCrack(x, y)) { Fp.d[k] = ink; continue; }
      // the groove's far (lower-right) wall catches the light
      if (inCrack(x - 1, y) || inCrack(x, y - 1)) { Fp.d[k] = lighter(wall, c0, lift); continue; }
      const id = bid(x, y);
      if (holes.has(id)) {
        const inner = (xx, yy) => holes.has(bid(xx, yy));
        Fp.d[k] = (!inner(x + 1, y) || !inner(x, y + 1)) ? lighter(wall, c0, 1) : (!inner(x - 1, y) || !inner(x, y - 1)) ? pc(wall, 0) : ink;
        continue;
      }
      if (pushed.has(id)) {
        // a brick pushed proud of the face: lit top and left rows, dark bottom and right rows
        const top = bid(x, y - 2) !== id, left = bid(x - 2, y) !== id, bot = bid(x, y + 2) !== id, right = bid(x + 2, y) !== id;
        if (top || left) Fp.d[k] = lighter(wall, c0, lift);
        else if (bot || right) Fp.d[k] = darker(c0);
        if (!notch && bot && right) notch = [x, y];
      }
    }
    // a chipped corner on one loose brick
    if (notch) for (let dy = -1; dy <= 0; dy++) for (let dx = -2; dx <= 0; dx++) Fp.d[(notch[1] + dy) * Fp.w + notch[0] + dx] = ink;
    // the knocked-out brick lies in pieces on the trim below it: a low pile spread along the
    // floor edge on the north and south walls, out across the trim on the side walls (a pile
    // stacked up the screen read as a small hooded figure), placed back to front
    const rr = rubbleRamp(wall), ac = hu0 + 10 - (ns ? box.x0 : box.y0);
    const PILE = ns ? [[1, -8, 0], [-7, -4, 0], [4, -5, 0], [-2, -3, 1], [8, -3, 0]]
      : [[-3, -13, 0], [4, -11, 0], [-1, -8, 0], [3, -4, 0], [-4, -3, 1]];
    const spots = PILE.map(([da, db, big], k) => { const [x, y] = toScreen(side, ac + da, db); return { x, y, big, k }; }).sort((p, q) => p.y - q.y);
    for (const p of spots) stampSprite(Fp, rubbleSprite(rr, p.k + 20, !!p.big, 2, true), p.x, p.y);
  }
  // Whole bricks blown out of a half-ellipse standing on the floor edge (25 px half-width,
  // 42 px tall), the rim bricks broken at random; the wall's thickness in shadow inside,
  // soot round the hole, rubble spilled on the trim.
  function paintBreach(Fp, Op, side, wall, floor, A) {
    const uc = (side === "N" || side === "S") ? 256 : 176, F = ROOM.FACE;
    const box = DOOR_BOX[side];
    const gone = (u, d) => {
      const k = Math.floor(d / 9), o = off(d), j = Math.floor((u + o) / 20);
      const bu = j * 20 - o + 10, bd = k * 9 + 4.5;
      const e = ((bu - uc) / 25) ** 2 + ((bd - F) / 42) ** 2;
      if (e < 0.72) return true;
      if (e < 1.15) {
        const h = hash2(j, k, 981);
        if (h < 0.35) return true;
        if (h < 0.75) return Math.abs(u - uc) < Math.abs(bu - uc);
      }
      return false;
    };
    const M = 6;
    const x0 = box.x0 - 14 - M, x1 = box.x1 + 14 + M, y0 = box.y0 - 14 - M, y1 = box.y1 + 14 + M, w = x1 - x0;
    const H = new Int8Array(w * (y1 - y0));                // 1 hole, 0 wall of this side, -1 elsewhere
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y - y0) * w + (x - x0);
      if (x < 0 || y < 0 || x >= Fp.w || y >= Fp.h) { H[i] = -1; continue; }
      const p = roomPart(x, y);
      H[i] = p.side !== side ? -1 : gone(p.u, p.d) ? 1 : 0;
    }
    const hole = (x, y) => (x < x0 || y < y0 || x >= x1 || y >= y1) ? -1 : H[(y - y0) * w + (x - x0)];
    const ink = inkU32();
    for (let y = y0 + M; y < y1 - M; y++) for (let x = x0 + M; x < x1 - M; x++) {
      const h = hole(x, y);
      if (h < 0) continue;
      const i = y * Fp.w + x;
      const l = doorLocal(side, x, y);
      if (h === 1) {
        // the rough inside: the wall's thickness on the upper and left rims (in shadow), a lit lip on the right
        if (hole(x, y - 1) === 0 || hole(x, y - 2) === 0 || hole(x - 1, y) === 0 || hole(x - 2, y) === 0) { Fp.d[i] = pc(wall, (hole(x, y - 1) === 1 && hole(x - 1, y) === 1) ? 0 : 1); }
        else if (hole(x, y - 3) === 0 || hole(x - 3, y) === 0) Fp.d[i] = ((x + y) & 1) ? pc(wall, 0) : ink;
        else if (hole(x + 1, y) === 0) Fp.d[i] = pc(wall, 3);
        else {
          const t = l.b / (B - 8);
          Fp.d[i] = t > 0.55 ? ink : t > 0.25 ? (((x + y) & 1) && t < 0.3 ? pc(floor, 0) : ink) : darkerN(floorColor(floor, x, y, true), 2);
        }
        continue;
      }
      // soot round the hole: one step darker within 3 px, dithered at 4-5
      let near = 9;
      for (let r = 1; r <= 5 && near === 9; r++) if (hole(x - r, y) === 1 || hole(x + r, y) === 1 || hole(x, y - r) === 1 || hole(x, y + r) === 1) near = r;
      if (near <= 3) Fp.d[i] = darker(Fp.d[i]);
      else if (near <= 5 && ((x + y) & 1)) Fp.d[i] = darker(Fp.d[i]);
      // the wall above the hole passes in front of an actor walking through
      if (Op && near <= 5 && l.b >= 30 && l.a >= -14 && l.a < A + 14) Op.d[i] = Fp.d[i];
    }
    // rubble spilled on the trim and a little onto the floor: never into the 32 px walk lane
    // beyond the trim (it is drawn under the hero and is not solid)
    const rr = rubbleRamp(wall);
    for (let k = 0; k < 8; k++) {
      const a = A / 2 + ((hash2(k, 1, 983) - 0.5) * 50) | 0;
      const inLane = Math.abs(a - A / 2) < 24;
      const b = -2 - ((hash2(k, 2, 983) * (inLane ? 8 : k < 5 ? 10 : 15)) | 0);
      const [x, y] = toScreen(side, a, b);
      stampSprite(Fp, rubbleSprite(rr, k + 10, k < 5), x, y);
    }
  }

  // ---------------------------------------------------------- one doorway, any state
  const DOORWAY = new Set(["open", "exit", "locked", "shutter", "bossdoor", "bossopen"]);
  // kits for a state (anim: the frame of an animation, or null for the resting state)
  function fillKit(side, st, wall, anim) {
    const A = sideA(side);
    if (st === "locked") {
      const sw = anim && anim.swing || 0, wd = woodOf(wall);
      return renderKit("locked|" + wd + "|" + sw, side, A, 0, () => lockedPrims(A, sw, wall, side));
    }
    if (st === "shutter") {
      const p = anim && anim.p !== undefined ? anim.p : 1;
      return renderKit("shutter|" + p, side, A, 0, () => shutterPrims(A, p));
    }
    if (st === "bossdoor") {
      const op = anim && anim.open || 0;
      return renderKit("bossleaves|" + op, side, A, 16, () => bossLeavesPrims(A, op));
    }
    return null;
  }
  // the seal's chains: stamped after the frame, so they run from the rings on the columns
  // over the jambs (under the jambs they seemed to start inside the door panel)
  function chainKit(side, anim) {
    const A = sideA(side), fall = anim && anim.fall !== undefined ? anim.fall : 0;
    return fall === null ? null : renderKit("chains|" + fall, side, A, 16, () => chainPrims(A, fall));
  }
  // the door into a boss room (the approach): marked on the side the hero comes from
  const bossWay = (side, st, opts) => !!(opts && opts.bossWay && opts.bossWay[side]) && (st === "open" || st === "locked" || st === "shutter");
  function frameKit(side, st, wall, opts) {
    const A = sideA(side), ft = frameTone(side, wall);
    // (the ice gatehouse one tone darker: at its own tone it was the colour of Frostmaw's
    // spikes, and boss and gate merged into one ice throne)
    // (the gatehouse keeps a tone free above it on every ramp: at the top tone its crown
    // vanished into the rim of the four-tone walls)
    if (st === "bossdoor" || st === "bossopen") { const bt = Math.min(rampLen(wall) - 2, FACE_TONE[side] + 1) - (wall === "water" ? 1 : 0); return renderKit("boss|" + wall + "|" + bt, side, A, 16, (sd) => bossFramePrims(A, wall, bt, sd)); }
    const way = bossWay(side, st, opts), key = st === "exit" ? "sun" : way ? "boss" : "";
    return renderKit("frame|" + wall + "|" + ft + "|" + key, side, A, way ? 14 : 0, () => framePrims(A, wall, ft, key));
  }
  // passage, fill, frame and symbols (everything at b >= 0)
  // opts.noSeal: the baked boss door without its seal (a boss set in the wall hides it);
  // opts.bossWay: { side: true } for a door that leads into a boss room; opts.out: the land
  // outside a way out (OUTSIDE)
  function paintDoorway(Tg, Og, side, st, wall, floor, anim, opts) {
    const A = sideA(side), H = B - L;
    // a shutter at rest shows its barred passage; its moving bars, and bars fully raised into
    // their slot, show the open passage they reveal
    const pk = st === "exit" ? "exit" : (st === "shutter" && !(anim && anim.p !== undefined && anim.p < 1)) ? "barred" : "open";
    for (let b = 0; b < H; b++) for (let a = J; a < A - J; a++) {
      const [x, y] = toScreen(side, a, b);
      const c = passagePixel(pk, side, a, b, A, wall, floor, x, y, opts && opts.out);
      if (c) put(Tg, x, y, c);
    }
    const fill = fillKit(side, st, wall, anim);
    // (a leaf's or a bar's outline stops at the threshold: the sill is the same in every state)
    if (fill) stamp(Tg, fill, side, null, 999, 0);
    if (st === "locked" && !(anim && anim.swing)) {
      // the leaf stands just clear of its sill: a dark 1 px gap along its foot
      const ink = inkU32();
      for (let a = J + 3; a < A - J - 3; a++) { const [x, y] = toScreen(side, a, 0); put(Tg, x, y, ink); }
    }
    const fk = frameKit(side, st, wall, opts);
    stamp(Tg, fk, side, Og, B - L);
    // (a frame at the wall's top tone has no lighter tone left for its lit bevels: its blocks
    // get a 1 px shade line along their lower and right edges instead, or they read as one
    // flat slab)
    const ft = frameTone(side, wall);
    if (st !== "bossdoor" && st !== "bossopen" && ft === rampLen(wall) - 1) shadeFrameEdges(Tg, Og, side, fk, pc(wall, ft), pc(wall, ft - 1));
    if (st === "bossdoor") { const ch = chainKit(side, anim); if (ch) stamp(Tg, ch, side, null, 999, 0); }
    // the way to a boss: the seal in small on its tall keystone (in the overlay too, with the
    // lintel it sits on)
    if (bossWay(side, st, opts)) {
      const ms = wall === "gold" ? rimmedBadge(miniSealBadge(), pc("gold", 0)) : miniSealBadge();
      stampBadge(Tg, ms, side, A / 2, B - 1.5);
      if (Og) stampBadge(Og, ms, side, A / 2, B - 1.5, 0, 0, side, B - L);
    }
    // the way out on the sandstone walls: the sun stamped on its dark keystone (framePrims)
    if (st === "exit" && wall === "gold") {
      stampBadge(Tg, sunBadge(), side, A / 2, H + 6);
      if (Og) stampBadge(Og, sunBadge(), side, A / 2, H + 6, 0, 0, side, B - L);
    }
    if (st === "locked") {
      const sw = anim && anim.swing || 0, sideW = side === "W" || side === "E";
      // (the lock sits one plank lower than the middle on the north and south walls; by the
      // leaf's free edge, toward the room, on the side walls)
      const la = sideW ? A / 2 + LOCK_SIDE[0] : A / 2 + 3, lb = sideW ? LOCK_SIDE[1] : LOCK_B;
      if (sideW && sw < 0.5) {
        // the ring pull under the lock rides on the leaf as it turns on its outer edge, at most
        // a tone darker; past half way it is gone from sight (turned further it went dark all
        // through and read as a lump over the lower strap)
        const top = H - 4, c = Math.cos(sw * 1.45), rb = Math.max(top - (top - RING_SIDE[1]) * c, top * (1 - c) + 5);
        stampBadge(Tg, ringBadge(), side, A / 2 + RING_SIDE[0], Math.round(rb), 0, sw ? Math.max(-1, leafStep(side, sw)) : 0);
      }
      if (!sw) {
        stampBadge(Tg, lockBadge(wall), side, la, lb, anim && anim.lock === 1 ? 3 : 0);
        if (anim && anim.lock === 0) {
          // a glint on the plate's upper right as the key turns
          const [x, y] = toScreen(side, la, lb), wh = pc("white", 0);
          for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [2, 0], [-2, 0], [0, 1], [0, -1], [0, 2], [0, -2]]) put(Tg, x + 5 + dx, y - 6 + dy, wh);
        }
      }
      if (anim && anim.plate) paintFallingPlate(Tg, side, A, la, lb, anim.plate, wall);
    }
    if (st === "bossdoor" && !(anim && anim.open) && !(opts && opts.noSeal)) stampBadge(Tg, sealBadge(anim ? anim.seal || 0 : 0), side, A / 2, 23);
    if (st === "bossdoor" && anim && anim.shards) paintShards(Tg, side, A, anim.shards);
  }
  function shadeFrameEdges(Tg, Og, side, kit, col, shadeCol) {
    const pix = kit.pix, W = pix.w, Hh = pix.h, pts = new Map();
    for (let r = 0; r < Hh; r++) for (let c = 0; c < W; c++) {
      if (pix.d[r * W + c] !== col) continue;
      const b = Hh - 2 - r, [x, y] = toScreen(side, c - 1 - kit.ext, b);
      pts.set(y * 4096 + x, b);
    }
    for (const [k, b] of pts) {
      if (pts.has(k + 1) && pts.has(k + 4096)) continue;
      const x = k % 4096, y = (k - x) / 4096;
      put(Tg, x, y, shadeCol);
      if (Og && b >= B - L) put(Og, x, y, shadeCol);
    }
  }
  // Whole tone steps a side leaf takes as it turns away from the light (the ring pull on it
  // darkens with it).
  function leafStep(side, sw) {
    const R = mRotX(-sw * 1.45);
    return withSideLight(side, () => Math.round(shadeOffset(mVec(ELEV, mVec(R, [0, 1, 0])), false) - shadeOffset(EV, false)));
  }
  // A small cloud of dust in screen pixels (grey stone, lit cap, dark lower right); thin =
  // only every other pixel of it.
  function disc(Tg, cx, cy, r, col, thin) {
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= r * r && !(thin && ((x + y) & 1))) put(Tg, x, y, col);
    }
  }
  function dustPuff(Tg, cx, cy, r, thin) {
    disc(Tg, cx + 0.6, cy + 0.8, r, pc("stone", 2), thin);
    disc(Tg, cx, cy, r - 0.8, pc("stone", 3), thin);
    if (r > 2.2) disc(Tg, cx - r * 0.3, cy - r * 0.35, r * 0.45, pc("stone", 4), thin);
  }
  // The lock plate, loosed by the key, falls down the screen away from the hero (to the
  // right on the north and south walls, where he stands in the middle of the doorway) and
  // lands at the foot of the opening: 2 falling, 3 landed with a puff of dust, 4 a glint as it
  // goes (the resting open door has no plate).
  function paintFallingPlate(Tg, side, A, la, lb, stage, wall) {
    const [x0, y0] = toScreen(side, la, lb), H = B - L;
    let tx, ty;
    if (side === "N") { tx = x0 + 14; ty = toScreen(side, la, 3)[1]; }
    else if (side === "S") { tx = x0 + 14; ty = toScreen(side, la, H - 5)[1]; }
    // (a side door: it springs out into the room and lands on the floor in front of the
    // door, below the hero; kept inside the door box it lay on the opening's lower corner)
    else { [tx, ty] = toScreen(side, A - J - 4, -9); }
    if (stage === 2) { stampAt(Tg, lockBadge(wall), Math.round(x0 + (tx - x0) * 0.45), Math.round(y0 + (ty - 4 - y0) * 0.55)); return; }
    stampAt(Tg, fallenPlate(wall), tx, ty);
    if (stage === 3) { dustPuff(Tg, tx - 9, ty + 1, 3.2); dustPuff(Tg, tx + 9, ty + 1, 2.8); }
    if (stage === 4) {
      dustPuff(Tg, tx - 11, ty - 1, 2.6, true); dustPuff(Tg, tx + 11, ty - 1, 2.2, true);
      const wh = pc("white", 0), gd = pc("gold", 3);
      for (let t = -3; t <= 3; t++) { put(Tg, tx + 3 + t, ty - 2, Math.abs(t) === 3 ? gd : wh); put(Tg, tx + 3, ty - 2 + t, Math.abs(t) === 3 ? gd : wh); }
    }
  }
  function stampAt(Tg, bd, x, y) {
    for (let yy = 0; yy < bd.h; yy++) for (let xx = 0; xx < bd.w; xx++) {
      const col = bd.pix.d[yy * bd.w + xx];
      if (col) put(Tg, x - bd.cx + xx, y - bd.cy + yy, col);
    }
  }
  // Pieces of the broken seal flung out from where it hung (upright screen offsets from its
  // centre): jagged gold shards (lit corner, dark edge, ink rim) and one white star-spark;
  // stage 2 = half of them, further out and falling.
  const LOCK_B = 21, LOCK_SIDE = [-2, 11], RING_SIDE = [11, 7];
  const SHARD_SHAPES = [
    ["w..", "gg.", "ggd"],            // a corner broken off the ring
    ["wg.", ".gd"],                   // a sliver
    [".w", "gg", "gd", "d."],         // a ray
  ];
  const SHARDS = [[-11, -9, 0], [9, -11, 1], [14, 1, 2], [-15, 2, 1], [-6, 11, 2], [7, 12, 0]];
  function paintShards(Tg, side, A, stage) {
    const [cx, cy] = toScreen(side, A / 2, 23), ink = inkU32();
    const col = { w: pc("white", 0), g: pc("gold", 3), d: pc("gold", 1) };
    const k = stage === 1 ? 1 : 1.6;
    SHARDS.forEach(([dx, dy, sh], i) => {
      if (stage === 2 && (i & 1)) return;
      const rows = SHARD_SHAPES[sh], x = cx + Math.round(dx * k), y = cy + Math.round(dy * k) + (stage === 2 ? 6 : 0);
      const on = (c, r) => r >= 0 && r < rows.length && c >= 0 && c < rows[r].length && rows[r][c] !== ".";
      for (let r = -1; r <= rows.length; r++) for (let c = -1; c <= rows[0].length; c++) {
        if (on(c, r)) put(Tg, x + c, y + r, col[rows[r][c]]);
        else if (on(c - 1, r) || on(c + 1, r) || on(c, r - 1) || on(c, r + 1)) put(Tg, x + c, y + r, ink);
      }
    });
    if (stage === 1) {
      // a star-spark above the seal's upper right
      const x = cx + 5, y = cy - 16;
      for (let t = -3; t <= 3; t++) { put(Tg, x + t, y, Math.abs(t) === 3 ? col.g : col.w); put(Tg, x, y + t, Math.abs(t) === 3 ? col.g : col.w); }
    }
  }
  // The exit of a cave or house (S wall): daylight passage + rock lip or timber frame.
  // (out: the land round the cave's mouth, as for a dungeon's way out; houses stand in the
  // village's grass)
  function paintOutside(Tg, Og, side, style, wall, out) {
    const A = sideA(side), H = B - L;
    const rw = style === "cave" ? "stone" : (wall === "stone" ? "stone" : "earth");
    for (let b = 0; b < H; b++) for (let a = J; a < A - J; a++) {
      const [x, y] = toScreen(side, a, b);
      const c = passagePixel("exit", side, a, b, A, rw, "earth", x, y, style === "cave" ? out : null);
      if (c) put(Tg, x, y, c);
    }
    const kit = renderKit("exit|" + (style === "cave" ? "cave" : "house"), side, A, 4, () => exitKitPrims(style === "cave" ? "cave" : "house", A));
    stamp(Tg, kit, side, Og, B - 8);
  }
  // Paint one side of a room shell straight into its Pix buffers (frame Fp, overlay Op).
  function paint(Fp, Op, side, st, wall, trim, floor, style, opts) {
    const A = sideA(side);
    if (st === "crack") { paintCrack(Fp, side, wall, A); return; }
    if (st === "bombed") { paintBreach(Fp, Op, side, wall, floor, A); return; }
    if (st === "outside") { paintOutside(Fp, Op, side, style, wall, opts && opts.out); return; }
    if (!DOORWAY.has(st)) return;
    const boss = st === "bossdoor" || st === "bossopen";
    // the threshold: a sill where the trim band is cut, or the gatehouse's two steps
    for (let b = -12; b < 0; b++) for (let a = boss ? -16 : 0; a < (boss ? A + 16 : A); a++) {
      const col = boss ? daisPixel(a, b, A, wall) : sillPixel(a, b, A, wall, trim);
      if (col === -1) continue;
      const [x, y] = toScreen(side, a, b);
      put(Fp, x, y, col);
    }
    paintDoorway(Fp, Op, side, st, wall, floor, null, opts);
  }
  // A small buffer over one door box (b 0..B-1, a -ext-1..A+ext, the gatehouse columns
  // included), placed in room pixels.
  // (inward: px of the room's floor in front of the box to include as well)
  function regionPix(side, ext, inward) {
    const A = sideA(side), pts = [toScreen(side, -ext - 1, -(inward || 0)), toScreen(side, A + ext, B - 1)];
    const x0 = Math.max(0, Math.min(pts[0][0], pts[1][0])), x1 = Math.min(ROOM.W - 1, Math.max(pts[0][0], pts[1][0]));
    const y0 = Math.max(0, Math.min(pts[0][1], pts[1][1])), y1 = Math.min(ROOM.H - 1, Math.max(pts[0][1], pts[1][1]));
    const p = new Pix(x1 - x0 + 1, y1 - y0 + 1);
    p.ox = x0; p.oy = y0;
    return p;
  }
  // The whole door box of a dungeon room in a resting state, wall included: drawn over a
  // copy of the room's picture it turns one door state into another without a rebuild
  // (open, locked and shutter share their sill and frame; so do the two boss states).
  const SWAP = { open: 1, locked: 1, shutter: 1, bossdoor: 2, bossopen: 2 };
  function canSwap(a, b) { return !!SWAP[a] && SWAP[a] === SWAP[b]; }
  function doorImage(side, st, wall, floor, opts) {
    const p = regionPix(side, (st === "bossdoor" || st === "bossopen") ? 16 : 0);
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const X = x + p.ox, Y = y + p.oy, q = roomPart(X, Y);
      if (q.side === "FLOOR") continue;
      p.d[y * p.w + x] = q.side === "RIM" ? rimColor(wall, X, Y) : faceColor(wall, q.side, q.d, q.u, X, Y, q.seam);
    }
    paintDoorway(p, null, side, st, wall, floor, null, opts);
    return { canvas: p.toCanvas(), x: p.ox, y: p.oy };
  }
  // Screen positions of the fire bowls on a boss gatehouse (for the scene's torch flames).
  function bowlSpots(side) {
    const A = sideA(side);
    return [toScreen(side, -8, 54), toScreen(side, A + 8, 54)];
  }

  // Daylight spilling in at an exit: floor pixels within 28 px of the threshold's middle one
  // step lighter and warmer, the outer 3 px only on a checkerboard (palette swaps, no
  // blending). The cool greys and the blue stone light up into the warm stone ramp (one
  // step lighter in their own ramp they read as mist or a spotlight), stone and earth run on
  // into sand.
  let _lighter = null;
  function lighterMap() {
    if (_lighter) return _lighter;
    _lighter = new Map();
    const R = STYLE.ramps, set = (c, to) => { const k = hexU32(c); if (!_lighter.has(k)) _lighter.set(k, hexU32(to)); };
    for (const r of ["neutral", "dstone"]) R[r].forEach((c, t) => set(c, R.stone[Math.min(4, t + 1)]));
    for (const r of ["stone", "earth"]) R[r].forEach((c, t) => set(c, t < 4 ? R[r][t + 1] : R.sand[0]));
    for (const r in R) {
      const ramp = R[r];
      ramp.forEach((c, t) => set(c, ramp[Math.min(ramp.length - 1, t + 1)]));
    }
    return _lighter;
  }
  function daylight(canvas, side) {
    const A = sideA(side), R = 28, [cx, cy] = toScreen(side, A / 2, 0);
    const x0 = Math.max(ROOM.X0, cx - R - 1), x1 = Math.min(ROOM.X1, cx + R + 1), y0 = Math.max(ROOM.Y0, cy - R - 1), y1 = Math.min(ROOM.Y1, cy + R + 1);
    if (x1 <= x0 || y1 <= y0) return;
    const g = canvas.getContext("2d"), id = g.getImageData(x0, y0, x1 - x0, y1 - y0), d = new Uint32Array(id.data.buffer);
    const map = lighterMap();
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const l = doorLocal(side, x, y);
      if (l.b >= 0) continue;                                   // the floor side only
      const r = Math.hypot(l.a + 0.5 - A / 2, l.b + 0.5);
      if (r > R || (r > R - 3 && ((x + y) & 1))) continue;
      const i = (y - y0) * (x1 - x0) + (x - x0), c = d[i];
      if (c >>> 24 !== 255) continue;
      d[i] = map.get(c) || c;
    }
    g.putImageData(id, x0, y0);
  }

  return {
    ELEV, J, L, T, B, sideA, sideG, withSideLight, mat, block, framePrims, bossFramePrims, lockedPrims, shutterPrims,
    bossLeavesPrims, chainPrims, exitKitPrims, lockBadge, sealBadge, renderKit, toScreen, stamp, stampBadge,
    passagePixel, sillPixel, daisPixel, crackSet, paintCrack, paintBreach, rubbleSprite, stampSprite, fillKit,
    frameKit, paintDoorway, paint, bowlSpots, daylight, frameTone, regionPix, doorImage, canSwap, DOORWAY, _kit,
    snapTones, lighterMap,
  };
})();

// ---------- Door animations, drawn over the baked room ----------
// The baked scene always shows a door's final state. When a door changes, a small image of
// the door box in each in-between state is drawn over the baked picture for a few ticks,
// after scene.base and before the actors. The lintel is the same in every frame and already
// sits in the scene's overlay, so it still passes over the hero.
const DoorAnim = (() => {
  // frames: [anim params, ticks]
  // (unlock: the loosed lock plate falls to the foot of the doorway (a side door: onto the
  // floor in front of it) and is gone in a glint,
  // plate 2..4, while the leaf swings; slam: the bars are already most of the way down in the
  // first frame, so on the south wall, whose lintel is at the bottom of the screen, they are
  // never seen standing short of the sill like bars growing up from the floor; the strike
  // throws dust out to both sides)
  const KINDS = {
    unlock: { st: "locked", frames: [[{ lock: 0 }, 6], [{ lock: 1 }, 5], [{ swing: 0.3, plate: 2 }, 4], [{ swing: 0.6, plate: 3 }, 4], [{ swing: 0.85, plate: 4 }, 4]] },
    rise: { st: "shutter", frames: [[{ p: 0.8 }, 4], [{ p: 0.6 }, 4], [{ p: 0.4 }, 4], [{ p: 0.2 }, 4], [{ p: 0 }, 4]] },
    slam: { st: "shutter", frames: [[{ p: 0.85 }, 2], [{ p: 1, dust: 1 }, 9]] },
    seal: { st: "bossdoor", frames: [[{ seal: 0 }, 10], [{ seal: 1 }, 6], [{ seal: 2 }, 10], [{ open: 0.35, fall: 0.5, shards: 1 }, 5], [{ open: 0.7, fall: 1, shards: 2 }, 5], [{ open: 0.9, fall: null }, 5]] },
  };
  function kindFor(from, to) {
    if (from === "locked" && to === "open") return "unlock";
    if (from === "shutter" && to === "open") return "rise";
    if (from === "open" && to === "shutter") return "slam";
    if (from === "bossdoor" && (to === "bossopen" || to === "open")) return "seal";
    return null;
  }
  const list = [];
  const cache = new Map();
  // the image of one frame: the door box (plus the gatehouse columns) in that state
  // (opts: the room's shell options; the door into a boss room has its own frame)
  function frameImage(kind, side, fi, look, opts) {
    const way = !!(opts && opts.bossWay && opts.bossWay[side]);
    const key = kind + "|" + look.wall + "|" + look.floor + "|" + side + "|" + fi + (way ? "|bw" : "");
    let img = cache.get(key);
    if (img) return img;
    const K = KINDS[kind], anim = K.frames[fi][0];
    // (a side door's unlock reaches onto the floor in front of it: the lock plate lands there)
    const p = DoorKit.regionPix(side, K.st === "bossdoor" ? 16 : 0, kind === "unlock" && (side === "W" || side === "E") ? 20 : 0);
    DoorKit.paintDoorway(p, null, side, K.st, look.wall, look.floor, anim, opts);
    img = { canvas: p.toCanvas(), x: p.ox, y: p.oy };
    cache.set(key, img);
    return img;
  }
  // Dust thrown out where the shutter bars strike the sill, one cloud at each jamb foot
  // blowing outward along the sill (dir -1 / +1), in three stages: a burst, spreading and
  // lifting, thinning away. Along the screen's x on the north and south walls, along its y
  // on the side walls. Each: { canvas, ax, ay } (ax, ay = the jamb foot in the canvas).
  const _dust = new Map();
  function dustFrames(vert, dir) {
    const k = (vert ? "v" : "h") + dir;
    if (_dust.has(k)) return _dust.get(k);
    const out = [];
    for (let f = 0; f < 3; f++) {
      const W = 44, Hh = 24, ax = 22, ay = 15, p = new Pix(W, Hh), sp = [0, 5, 10][f], lift = [0, 2, 4][f];
      const lobes = [[-2 + sp * 0.2, 1, 3], [2 + sp * 0.5, 0, 4.4], [6 + sp, 1.5, 3.6], [10 + sp * 1.3, 0, 2.8]];
      for (const [u, v, r] of lobes) fxPuff(p, ax + dir * u, ay - v - lift, f === 2 ? r * 0.85 : r + (f === 1 ? 0.6 : 0), "stone", 3);
      if (f === 2) for (let i = 0; i < p.d.length; i++) if (((i % W) + ((i / W) | 0)) & 1) p.d[i] = 0;
      let q = p, qax = ax, qay = ay;
      if (vert) {
        // the same cloud turned to blow along the screen's y (lit cap stays on its upper left)
        q = new Pix(Hh, W); qax = ay; qay = ax;
        for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) q.d[x * Hh + y] = p.d[y * W + x];
      }
      out.push({ canvas: q.toCanvas(), ax: qax, ay: qay });
    }
    _dust.set(k, out);
    return out;
  }
  function start(side, from, to, look, scene) {
    const kind = kindFor(from, to);
    for (let i = list.length - 1; i >= 0; i--) if (list[i].side === side) list.splice(i, 1);
    if (!kind) return;
    const opts = scene && scene.shellOpts;
    list.push({ side, kind, look, scene, opts, t0: G.frame });
    // render every frame now (a few ms), so none is built mid-animation
    KINDS[kind].frames.forEach((_, fi) => frameImage(kind, side, fi, look, opts));
  }
  function draw(c, scene, oxs, oys) {
    // one queued kit per frame (a few ms), so a room's first door event has its frames ready
    if (queue.length) queue.shift()();
    for (let i = list.length - 1; i >= 0; i--) {
      const a = list[i];
      if (a.scene !== scene) continue;
      const K = KINDS[a.kind];
      let t = G.frame - a.t0, fi = 0;
      while (fi < K.frames.length && t >= K.frames[fi][1]) { t -= K.frames[fi][1]; fi++; }
      if (fi >= K.frames.length) { list.splice(i, 1); continue; }
      const img = frameImage(a.kind, a.side, fi, a.look, a.opts);
      c.drawImage(img.canvas, img.x + oxs, img.y + RHUD + oys);
      if (K.frames[fi][0].dust) {
        const A = DoorKit.sideA(a.side), vert = a.side === "W" || a.side === "E", st = Math.min(2, Math.floor(t / 3));
        for (const [aa, dir] of [[DoorKit.J + 3, -1], [A - DoorKit.J - 3, 1]]) {
          const [x, y] = DoorKit.toScreen(a.side, aa, -2), d = dustFrames(vert, dir)[st];
          c.drawImage(d.canvas, x - d.ax + oxs, y - d.ay + RHUD + oys);
        }
      }
    }
  }
  function clear() { list.length = 0; }
  // Render the kits a room's doors may animate through ahead of time: queued, one per drawn
  // frame (now = true renders them at once).
  const queue = [];
  function warmRoom(doors, look, now, opts) {
    if (!now) queue.length = 0;
    for (const side in doors) {
      const st = doors[side];
      const kinds = st === "locked" ? ["unlock"] : st === "shutter" ? ["rise"] : st === "bossdoor" ? ["seal"] : [];
      for (const kind of kinds) KINDS[kind].frames.forEach(([anim], fi) => {
        const job = () => { DoorKit.fillKit(side, KINDS[kind].st, look.wall, anim); frameImage(kind, side, fi, look, opts); };
        if (now) job(); else queue.push(job);
      });
    }
  }
  // ... or for every door of a dungeon (e.g. during the dungeon-entry fade).
  function warm(d) {
    const dg = DUNGEONS[d], look = DUNGEON_LOOK[d];
    if (!dg || !look) return;
    const DIRS = { n: "N", s: "S", w: "W", e: "E" };
    for (const k in dg.rooms) {
      const doors = dg.rooms[k].doors || {}, o = {}, [rx, ry] = k.split(",").map(Number);
      for (const dir in doors) o[DIRS[dir]] = doors[dir] === "lock" ? "locked" : doors[dir] === "boss" ? "bossdoor" : doors[dir] === "shutter" ? "shutter" : "wall";
      warmRoom(o, look, true, typeof roomShellOpts === "function" ? roomShellOpts(d, rx, ry) : null);
    }
    for (const side of ["N", "S", "W", "E"]) KINDS.slam.frames.forEach(([anim], fi) => { DoorKit.fillKit(side, "shutter", look.wall, anim); frameImage("slam", side, fi, look); });
  }
  return { KINDS, list, kindFor, start, draw, clear, warm, warmRoom, frameImage };
})();
