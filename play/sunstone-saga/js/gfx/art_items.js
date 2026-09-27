"use strict";
// ---------- Items, pickups and missiles as small models ----------
// Treasures stand upright and lean back toward the viewer so their face reads;
// missiles are modelled per direction (never rotated or mirrored as pixels).

Object.assign(MATS, { glow: { ramp: "white", base: 0 }, crystal: { ramp: "water", base: 3, shiny: true } });

const FACE_CAM = mRotX(40 * Math.PI / 180);          // stand a flat item up, turned to the camera
function upright(P, lift) { return xformPrims(P, FACE_CAM, [0, 0, lift || 0]); }

// Two round lobes with a clear notch between them over a pointed base. The base is
// built from rounded tapers running from each lobe down to the point (a cone's flat
// top, tilted to the camera, filled the notch and the heart read as a red gem).
// Returned in order: left lobe, right lobe, left taper, right taper, middle filler.
function heartPrims(r, mat) {
  mat = mat || "red";
  const o = { part: 1, grp: 1, tone: 2 };
  return [
    P_ell([-r * 0.56, 0, r * 0.3], [r * 0.52, r * 0.42, r * 0.52], mat, o),
    P_ell([r * 0.56, 0, r * 0.3], [r * 0.52, r * 0.42, r * 0.52], mat, o),
    P_cone([-r * 0.5, 0, r * 0.22], [0, 0, -r * 1.02], r * 0.5, r * 0.06, mat, o),
    P_cone([r * 0.5, 0, r * 0.22], [0, 0, -r * 1.02], r * 0.5, r * 0.06, mat, o),
    P_cone([0, 0, -r * 0.2], [0, 0, -r * 0.9], r * 0.42, r * 0.06, mat, o),
  ];
}
function crystalPrims(r, mat, tone) {
  return [
    P_cone([0, 0, 0], [0, 0, r * 1.3], r, 0.2, mat, { part: 1, grp: 1, tone, shiny: true }),
    P_cone([0, 0, 0], [0, 0, -r * 0.9], r, 0.2, mat, { part: 2, grp: 1, tone: tone - 1 }),
  ];
}
// (the same three looks as in the hero's hand: dull iron, bright steel, golden dawnblade)
function swordItemPrims(lv) {
  const blade = lv === 3 ? "gold" : lv === 2 ? "steel" : "iron", guard = lv === 1 ? "iron" : "gold", grip = lv === 3 ? "purple" : "leather";
  const len = [0, 14, 17, 20][lv];
  const P = [
    P_cone([0, 0, 2], [0, 0, 2 + len], [0, 1.3, 1.6, 2.0][lv], 0.3, blade, { part: 1, grp: 1, shiny: true, tone: lv === 3 ? 3 : lv === 2 ? 4 : 2 }),
    P_cap([-[0, 3.2, 4, 5][lv], 0, 1.2], [[0, 3.2, 4, 5][lv], 0, 1.2], 1.0, guard, { part: 2, grp: 2 }),
    P_cap([0, 0, 0.5], [0, 0, -5], 1.1, grip, { part: 3, grp: 2 }),
    P_ell([0, 0, -6], [1.5, 1.5, 1.5], guard, { part: 3, grp: 2 }),
  ];
  return upright(xformPrims(P, mRotY(-0.5)), 8);
}

// A shard of the Sunstone: a broken, flat-faced wedge of golden crystal with a glowing
// heart and a glint (round cones read as a candle flame). v 0..5 gives six different
// breaks, so the six pieces are not one picture repeated.
function shardPrims(v) {
  const h = (i) => hash2(v * 7 + i, 3, 881) - 0.5;
  // a crystal: a prism seen on its edge (the lit left face, the shaded right face, a
  // ridge between) with a pyramid point at each end; each piece is tilted, sized and
  // broken its own way, some with a smaller crystal grown at the foot
  const facet = (q, n) => (n[0] < -0.15 ? 1 : n[0] > 0.15 ? -1 : 0);
  const crystal = (base, len, r, tilt, broken, part) => {
    const R = mRotY(tilt), at = (p) => vAdd(base, mVec(R, p));
    return [
      xformPrims([P_box([0, 0, 0], [r, r, len / 2], "gold", { part, grp: 1, tone: 2, tex: facet })], mMul(R, mRotZ(Math.PI / 4)), at([0, 0, len / 2]))[0],
      P_cone(at([0, 0, len]), at([0, 0, len + (broken ? 1.6 : r * 2.2)]), r * 1.41, broken ? r * 0.8 : 0.1, "gold", { part: part + 1, grp: 1, tone: 3, tex: facet }),
      P_cone(at([0, 0, 0]), at([0, 0, -r * 1.3]), r * 1.41, 0.1, "gold", { part: part + 1, grp: 1, tone: 1, tex: facet }),
    ];
  };
  const tilt = h(1) * 0.9, len = 7 + h(2) * 3;
  const P = crystal([0, 0, 4], len, 2.5, tilt, v & 1, 1);
  if (v % 3 !== 1) P.push(...crystal([tilt > 0 ? -2.6 : 2.6, 0.6, 2.6], 3.4 + h(3) * 1.5, 1.4, tilt + (tilt > 0 ? -0.7 : 0.7), 0, 4));
  // a glowing heart in the crystal, and a glint on the lit face
  const R = mRotY(tilt);
  P.push(P_ell(vAdd([0, 2.2, 4], mVec(R, [0, 0, len * 0.45])), [0.8, 0.5, 1.5], "ember", { part: 7, grp: 1, tone: 3, line: false }));
  P.push(P_ell(vAdd([0, 2.4, 4], mVec(R, [-1.1, 0, len * 0.75])), [0.45, 0.3, 0.9], "white", { part: 8, grp: 1, tone: 4, line: false }));
  return scaleModel({ prims: upright(P, 2), decals: [] }, 1.15);
}
// kind -> { prims, decals }
function itemPrims(kind) {
  switch (kind) {
    case "heart": {
      const P = heartPrims(5.6);
      P.push(P_ell([-3.2, 1.2, 2.4], [1.1, 0.8, 1.1], "white", { part: 2, grp: 1, tone: 4, line: false }));
      return { prims: upright(P, 6), decals: [] };
    }
    case "heartcont": {
      const P = heartPrims(8.4);
      P.push(P_ell([-3.5, 1.2, 3.5], [1.6, 1, 1.4], "white", { part: 2, grp: 1, tone: 4, line: false }));
      return { prims: upright(P, 10), decals: [] };
    }
    case "gem1": return { prims: upright(crystalPrims(3.6, "crystal", 3), 6), decals: [] };
    case "gem5": case "gems10": case "gems30": case "gems50": case "gamble": case "donate20": case "donate60": {
      // a cut stone seen from the side: a flat table on top, a sloping crown, the girdle
      // and a pointed pavilion below, cut into eight facets round its axis. Each facet
      // takes one flat tone by the way it faces (the lit facets on the left and front of
      // the crown bright, the front-right one mid, the right edge dark; the pavilion mid
      // on the left, dark on the right), with a one-pixel white glint on the lit crown
      // facet. (Round cones have a ball at each end: the crown's ball hid the pavilion and
      // the stone was a smooth egg, and with the gold ramp's top tone as the lit side there
      // was nowhere brighter to go, so it read as a pale lemon drop. Frustums keep the
      // flat table and the sharp girdle.)
      // (lift: the point hangs one pixel above the ground line, level with the blue gem's,
      // so both float the same one-pixel gap over their shadows)
      const r = 3.8, h1 = 3.0, h2 = 5.0, lift = 7.5;
      const facet = (tones) => (q, n) => {
        const l = mTVec(FACE_CAM, n);                  // the normal in the stone's own frame
        let az = Math.atan2(l[1], l[0]) * 180 / Math.PI;
        if (az < -90) az += 360;                          // round the back to the left side
        const k = Math.max(0, Math.min(4, Math.round(az / 45)));   // right .. front .. left
        return tones[k] - 2 - shadeOffset(n, true);       // cancel the smooth shading: one tone per facet
      };
      const P = [
        P_frustum([0, 0, 0], [0, 0, h1], r, r * 0.5, "gold", { part: 1, grp: 1, tone: 2, tex: facet([1, 2, 3, 3, 3]) }),
        P_frustum([0, 0, 0], [0, 0, -h2], r, 0.1, "gold", { part: 2, grp: 1, tone: 2, tex: facet([1, 1, 2, 2, 2]) }),
      ];
      const ga = 140 * Math.PI / 180, gp = vAdd(mVec(FACE_CAM, [Math.cos(ga) * r * 0.65, Math.sin(ga) * r * 0.65, h1 * 0.4]), [0, 0, lift]);
      return { prims: upright(P, lift), decals: [{ p: gp, face: null, px: [[0, 0, "white"]], minFacing: -1, tol: 99 }] };
    }
    case "key": {
      const P = [
        P_cyl([0, -0.8, 8.5], [0, 0.8, 8.5], 3.4, "gold", { part: 1, grp: 1, tone: 2 }),
        P_cyl([0, -0.9, 8.5], [0, 0.9, 8.5], 1.4, "ink", { part: 4, grp: 4, flat: true, line: false }),
        P_cap([0, 0, 5], [0, 0, -6.5], 1.1, "gold", { part: 2, grp: 1, tone: 2 }),
        P_box([1.9, 0, -4.8], [1.4, 0.8, 0.8], "gold", { part: 3, grp: 1, tone: 2 }),
        P_box([1.6, 0, -2.2], [1.1, 0.8, 0.7], "gold", { part: 3, grp: 1, tone: 2 }),
      ];
      return { prims: upright(P, 8), decals: [] };
    }
    case "sword1": return { prims: swordItemPrims(1), decals: [] };
    case "sword2": return { prims: swordItemPrims(2), decals: [] };
    case "sword3": return { prims: swordItemPrims(3), decals: [] };
    case "shield2": case "shield3":
      return { prims: upright(shieldPrims([0, 0, 0], [0, 1, 0], [0, 0, 1], 6.4, kind === "shield3" ? 3 : 2, 1, 1), 10), decals: [] };
    // the widow's lost sea chart: a parchment roll tied with a red ribbon and sealed
    case "chart": return { prims: upright([
      P_cyl([-8, 0, 0], [8, 0, 0], 3.2, "plaster", { part: 1, grp: 1, tone: 4, rot: null, tex: (q) => (Math.abs(((q[0] + 20) % 3.2) - 1.6) < 0.25 ? -0.8 : 0) }),
      P_cyl([-8.4, 0, 0], [-7.6, 0, 0], 3.4, "plaster", { part: 2, grp: 1, tone: 2, rot: null }),
      P_cyl([7.6, 0, 0], [8.4, 0, 0], 3.4, "plaster", { part: 2, grp: 1, tone: 2, rot: null }),
      P_cyl([-1.2, 0, 0], [1.2, 0, 0], 3.6, "red", { part: 3, grp: 3, tone: 2, rot: null }),
      P_ell([0, 3.4, -0.6], [1.7, 0.8, 1.7], "red", { part: 4, grp: 3, tone: 1 }),
      P_cone([0.6, 2.6, -2.8], [2.2, 2.6, -7.2], 0.9, 0.5, "red", { part: 3, grp: 3, tone: 2 }),
      P_cone([-0.6, 2.6, -2.8], [-2.0, 2.6, -6.8], 0.9, 0.5, "red", { part: 3, grp: 3, tone: 2 }),
    ], 8), decals: [] };
    // the elder's lost bell: bronze, with a loop to hang it by and its clapper showing
    case "bell": return { prims: [
      P_frustum([0, 0, 1.6], [0, 0, 10], 6.6, 3.4, "gold", { part: 1, grp: 1, tone: 1 }),
      P_ell([0, 0, 10], [3.6, 3.6, 2.6], "gold", { part: 1, grp: 1, tone: 2 }),
      P_cyl([0, 0, 0.8], [0, 0, 2.2], 7.0, "gold", { part: 2, grp: 1, tone: 2 }),
      P_ell([0, 2.4, 0.4], [1.6, 1.6, 1.6], "iron", { part: 3, grp: 3, tone: 1 }),
      P_cap([-1.6, 0, 13.2], [1.6, 0, 13.2], 0.9, "iron", { part: 4, grp: 4, tone: 2 }),
      P_cap([-1.8, 0, 12], [-1.6, 0, 13.2], 0.9, "iron", { part: 4, grp: 4, tone: 2 }),
      P_cap([1.8, 0, 12], [1.6, 0, 13.2], 0.9, "iron", { part: 4, grp: 4, tone: 2 }),
      P_ell([-3.2, 2.6, 6.6], [0.9, 0.6, 1.6], "white", { part: 5, grp: 1, tone: 4, line: false }),
    ], decals: [] };
    case "candle": return { prims: [
      P_cyl([0, 0, 0], [0, 0, 1.4], 5, "gold", { part: 1, grp: 1, tone: 2 }),
      P_cyl([0, 0, 1.2], [0, 0, 11], 2.6, "white", { part: 2, grp: 2, tone: 4 }),
      P_cap([0, 0, 11.4], [0, 0, 12.6], 0.5, "ink", { part: 3, grp: 3, flat: true }),
      P_ell([0, 0, 15], [1.7, 1.7, 2.8], "ember", { part: 4, grp: 4, tone: 3 }),
    ], decals: [] };
    case "potion": return { prims: [
      P_ell([0, 0, 5.5], [5.4, 5.4, 5.4], "red", { part: 1, grp: 1, tone: 2, shiny: true }),
      P_cyl([0, 0, 9.5], [0, 0, 13], 2.1, "crystal", { part: 2, grp: 1, tone: 3 }),
      P_cyl([0, 0, 12.8], [0, 0, 14.6], 2.5, "wood", { part: 3, grp: 3, tone: 2 }),
      P_ell([-2.2, 3.2, 7.8], [1, 0.6, 1.4], "white", { part: 4, grp: 1, tone: 4, line: false }),
    ], decals: [] };
    case "ring": return { prims: upright([
      P_cyl([0, -0.8, 0], [0, 0.8, 0], 4.6, "gold", { part: 1, grp: 1, tone: 2 }),
      P_cyl([0, -0.9, 0], [0, 0.9, 0], 2.6, "ink", { part: 2, grp: 2, flat: true, line: false }),
      P_ell([0, 0, 5], [2, 1.6, 1.8], "red", { part: 3, grp: 3, tone: 3, shiny: true }),
    ], 8), decals: [] };
    case "ladder": {
      const P = [];
      for (const s of [-1, 1]) P.push(P_box([s * 4.5, 0, 0], [1, 1, 10], "wood", { part: 1, grp: 1, tone: 3 }));
      for (const z of [-6, -2, 2, 6]) P.push(P_box([0, 0, z], [3.6, 0.8, 0.8], "wood", { part: 2, grp: 1, tone: 2 }));
      return { prims: upright(P, 10), decals: [] };
    }
    case "raft": {
      const P = [];
      for (const x of [-6, -2, 2, 6]) P.push(P_cyl([x, -7, 1.5], [x, 7, 1.5], 1.9, "wood", { part: 1, grp: 1, tone: 3 }));
      for (const y of [-4.5, 4.5]) P.push(P_box([0, y, 3.4], [8.4, 0.9, 0.6], "leather", { part: 2, grp: 2, tone: 1 }));
      return { prims: P, decals: [] };
    }
    case "boomerang": return { prims: xformPrims(boomPrims(1), M_ID, [0, 0, 4]), decals: [] };
    case "bow": {
      // a limb bent in an arc, strung straight between its tips
      const P = [], pts = [];
      for (let i = 0; i <= 6; i++) { const a = -1.1 + i * (2.2 / 6); pts.push([-4 + 9 * Math.cos(a), 0, 9 * Math.sin(a)]); }
      for (let i = 0; i < 6; i++) P.push(P_cap(pts[i], pts[i + 1], 1.1, "wood", { part: 1, grp: 1, tone: 3 }));
      // (a hair-thin string vanished at this size: it is a full pixel wide and pale)
      P.push(P_cap(pts[0], pts[6], 0.7, "white", { part: 2, grp: 2, tone: 4, line: false }));
      P.push(P_cap([4.8, 0, -1.4], [4.8, 0, 1.4], 1.4, "leather", { part: 3, grp: 1, tone: 1 }));
      return { prims: upright(P, 10), decals: [] };
    }
    case "map": return { prims: upright([
      P_box([0, 0, 0], [6.5, 0.5, 8], "plaster", { part: 1, grp: 1, tone: 4, tex: (q) => (Math.abs(q[0] - q[2] * 0.4) < 0.8 || Math.abs(q[2] + 2) < 0.6 ? -1.5 : 0) }),
      P_cyl([-7, 0, 0], [-6, 0, 0], 1.8, "wood", { part: 2, grp: 2, tone: 2, rot: null }),
      P_cap([-6.8, 0, -8.6], [-6.8, 0, 8.6], 1.4, "plaster", { part: 3, grp: 3, tone: 3 }),
    ], 9), decals: [] };
    // a gold case with a ring on top, four marks round the dial and a needle set on a
    // slant (upright, a red-over-grey needle read as an exclamation mark)
    case "compass": {
      const a = 0.62, u = [Math.sin(a), 0, Math.cos(a)];
      const P = [
        P_cyl([0, -1, 0], [0, 1, 0], 6.4, "gold", { part: 1, grp: 1, tone: 2 }),
        P_cyl([0, -0.5, 7.4], [0, 0.5, 7.4], 1.9, "gold", { part: 5, grp: 1, tone: 2 }),
        P_cyl([0, 0.9, 0], [0, 1.3, 0], 5.1, "white", { part: 2, grp: 1, tone: 4 }),
        P_cone([0, 1.6, 0], vAdd([0, 1.6, 0], vMul(u, 4.6)), 1.3, 0.2, "red", { part: 3, grp: 3, tone: 2, line: false }),
        P_cone([0, 1.6, 0], vAdd([0, 1.6, 0], vMul(u, -4.6)), 1.3, 0.2, "stone", { part: 3, grp: 3, tone: 1, line: false }),
      ];
      const decals = [[0, 4.2], [0, -4.2], [4.2, 0], [-4.2, 0]].map(([x, z]) => ({ p: [x, 1.4, z], face: [0, 1, 0], px: [[0, 0, "ink"]], minFacing: -1, tol: 4 }));
      decals.push({ p: [0, 1.7, 0], face: [0, 1, 0], px: [[0, 0, ["gold", 3]]], minFacing: -1, tol: 4 });
      const R = FACE_CAM;
      return { prims: upright(P, 9), decals: decals.map(d => Object.assign(d, { p: vAdd(mVec(R, d.p), [0, 0, 9]), face: mVec(R, d.face) })) };
    }
    case "shard": return shardPrims(0);
    case "bomb": case "bombs4": case "bombs": return { prims: bombPrims(0), decals: [] };
    case "hook": return { prims: hookItemPrims(), decals: [] };
    case "glove": return { prims: gloveItemPrims(), decals: [] };
    case "hammer": return { prims: hammerItemPrims(), decals: [] };
    case "heartpiece": {
      // (not drawn: the heart piece in the world and held up is heartPieceFrame in
      // chars.js, a heart with one quarter red. This older model is kept only as a
      // fallback.) A broken-off half of a heart vessel, its jagged break edged in gold.
      const h = heartPrims(8.4), P = [h[1], h[3]];
      P.push(P_ell([4.2, 1.4, 4.2], [1.4, 0.9, 1.3], "white", { part: 2, grp: 1, tone: 4, line: false }));
      const zig = [[0.6, 0.4, 6.6], [2.0, 0.6, 3.6], [0.4, 0.6, 1.0], [1.8, 0.6, -2.2], [0.4, 0.6, -5.2], [0.8, 0.4, -8.2]];
      for (let i = 0; i < zig.length - 1; i++) P.push(P_cap(zig[i], zig[i + 1], 0.9, "gold", { part: 3, grp: 3, tone: 3 }));
      const R = FACE_CAM, sp = vAdd(mVec(R, [6.2, 3.6, 7.4]), [0, 0, 10]);
      return { prims: upright(P, 10), decals: [{ p: sp, face: mVec(R, [0, 1, 0]), px: [[0, -2, "white"], [0, -1, "white"], [0, 0, "white"], [0, 1, "white"], [0, 2, "white"], [-2, 0, "white"], [-1, 0, "white"], [1, 0, "white"], [2, 0, "white"], [-1, -1, ["gold", 3]], [1, 1, ["gold", 3]], [1, -1, ["gold", 3]], [-1, 1, ["gold", 3]]], minFacing: -1, tol: 99, overhang: true }] };
    }
  }
  return null;
}

// ---------- missiles ----------
function arrowPrims(dir) {
  const P = [
    P_cap([0, -7, 0], [0, 6, 0], 0.55, "wood", { part: 1, grp: 1, tone: 3 }),
    P_cone([0, 6, 0], [0, 10, 0], 1.6, 0.2, "steel", { part: 2, grp: 2 }),
    P_box([0, -6, 0], [0.3, 1.8, 1.6], "white", { part: 3, grp: 3, tone: 4 }),
    P_box([0, -6, 0], [1.6, 1.8, 0.3], "white", { part: 3, grp: 3, tone: 4 }),
  ];
  return { prims: xformPrims(P, mRotZ(yawOf(dir))), decals: [] };
}
// Sword beam: a blade of light flying point-first.
function beamPrims(dir, frame) {
  const P = [
    P_cone([0, -6, 0], [0, 9, 0], 2.2, 0.4, frame ? "ember" : "glow", { part: 1, grp: 1, tone: frame ? 3 : 0 }),
    P_cap([-4.2, -6, 0], [4.2, -6, 0], 1.2, frame ? "glow" : "ember", { part: 2, grp: 2, tone: frame ? 0 : 3 }),
    P_cap([0, -7, 0], [0, -11, 0], 1.0, frame ? "ember" : "glow", { part: 3, grp: 2, tone: frame ? 3 : 0 }),
  ];
  return { prims: xformPrims(P, mRotZ(yawOf(dir))), decals: [] };
}
// Boomerang, spun about its centre in quarter turns (step 0..3).
function boomPrims(step) {
  const P = [
    P_cap([0, 0, 0], [6.5, 3.2, 0], 1.7, "wood", { part: 1, grp: 1, tone: 3 }),
    P_cap([0, 0, 0], [-6.5, 3.2, 0], 1.7, "wood", { part: 1, grp: 1, tone: 3 }),
    P_ell([0, 0, 0.6], [1.6, 1.6, 1], "red", { part: 2, grp: 1, tone: 2, line: false }),
  ];
  return xformPrims(P, mRotZ(step * Math.PI / 4), [0, 0, 0]);
}
function bombPrims(frame) {
  return [
    P_ell([0, 0, 6], [6.2, 6.2, 6.2], "iron", { part: 1, grp: 1, tone: 1, shiny: true }),
    P_cyl([0, 0, 11.4], [0, 0, 13], 2.2, "iron", { part: 2, grp: 1, tone: 2 }),
    P_cap([0, 0, 13], [1.4, 0.4, 16], 0.55, "leather", { part: 3, grp: 3, tone: 3 }),
    P_ell([1.6, 0.4, 16.8], [1.3 + frame * 0.6, 1.3 + frame * 0.6, 1.3 + frame * 0.6], "ember", { part: 4, grp: 4, tone: 3, line: false }),
  ];
}
// Tether hook head: a three-pronged claw pointing along the throw.
function hookHeadPrims(dir) {
  const P = [
    P_cyl([0, -4, 0], [0, 2, 0], 1.6, "iron", { part: 1, grp: 1, tone: 2 }),
    P_cone([0, 2, 0], [0, 6, 0], 2.4, 0.3, "steel", { part: 2, grp: 1 }),
    P_cone([-1, 1.5, 0], [-4.5, 4, 0.5], 1.1, 0.2, "steel", { part: 3, grp: 1 }),
    P_cone([1, 1.5, 0], [4.5, 4, 0.5], 1.1, 0.2, "steel", { part: 3, grp: 1 }),
  ];
  return { prims: xformPrims(P, mRotZ(yawOf(dir))), decals: [] };
}
// Earth hammer: a stout haft and an iron-shod wooden head (0 raised, 1 struck down).
function hammerPrims(dir, frame) {
  const P = [
    P_cap([0, -6, 0], [0, 6, 0], 1.1, "wood", { part: 1, grp: 1, tone: 3 }),
    P_cyl([-5.5, 7, 0], [5.5, 7, 0], 4.2, "wood", { part: 2, grp: 2, tone: 2 }),
    P_cyl([-5.8, 7, 0], [-4.4, 7, 0], 4.5, "iron", { part: 3, grp: 2, tone: 2, line: false }),
    P_cyl([4.4, 7, 0], [5.8, 7, 0], 4.5, "iron", { part: 3, grp: 2, tone: 2, line: false }),
  ];
  // raised: the head up over the shoulder; struck: flat on the ground ahead
  const tilt = frame ? mRotX(-0.2) : mRotX(1.1);
  return { prims: xformPrims(xformPrims(P, tilt, [0, 0, frame ? 3 : 12]), mRotZ(yawOf(dir))), decals: [] };
}
// Also used as treasures on display.
// The tether hook: a grapnel standing on its three curved flukes, a ring at the top of
// the shank and a loop of chain hanging from it (the small claw alone read as a nail).
function hookItemPrims() {
  const P = [
    P_cyl([0, 0, 3], [0, 0, 17], 1.3, "iron", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, -0.8, 19.2], [0, 0.8, 19.2], 2.6, "iron", { part: 2, grp: 1, tone: 2 }),
    P_cyl([0, -0.9, 19.2], [0, 0.9, 19.2], 1.2, "ink", { part: 3, grp: 3, flat: true, line: false }),
  ];
  for (const a of [-2.3, 0, 2.3]) {
    const c = Math.sin(a), s = -Math.cos(a) * 0.5;
    const knee = [c * 4.6, s * 4.6, 2.2], tip = [c * 6.4, s * 6.4, 6.4];
    P.push(P_cap([0, 0, 4], knee, 1.2, "steel", { part: 4, grp: 4 }));
    P.push(P_cone(knee, tip, 1.1, 0.25, "steel", { part: 4, grp: 4 }));
  }
  for (let i = 0; i < 4; i++) P.push(P_ell([2.6 + i * 1.6, 0.6, 17.6 - i * 3.0], [1.3, 0.8, 1.6], "iron", { part: 5, grp: 5, tone: i & 1 ? 1 : 3 }));
  return upright(P, 1);
}
// The earth hammer on display: a great iron-shod mallet held on a slant, so its
// T-shape reads at a glance (seen end-on the head read as a bucket).
function hammerItemPrims() {
  const P = [
    P_cap([0, 0, -9], [0, 0, 9], 1.3, "wood", { part: 1, grp: 1, tone: 3 }),
    P_ell([0, 0, -9.6], [1.7, 1.7, 1.2], "leather", { part: 1, grp: 1, tone: 1 }),
    P_cyl([-7, 0, 11.5], [7, 0, 11.5], 4.0, "wood", { part: 2, grp: 2, tone: 2 }),
    P_cyl([-7.4, 0, 11.5], [-5.4, 0, 11.5], 4.4, "iron", { part: 3, grp: 2, tone: 2 }),
    P_cyl([5.4, 0, 11.5], [7.4, 0, 11.5], 4.4, "iron", { part: 3, grp: 2, tone: 2 }),
  ];
  return scaleModel({ prims: upright(xformPrims(P, mRotY(-0.55)), 11), decals: [] }, 0.85).prims;
}
function gloveItemPrims() {
  return upright([
    P_ell([0, 0, 0], [5.5, 2.6, 6], "gold", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, 0, -7], [0, 0, -4], 4.8, "leather", { part: 2, grp: 1, tone: 2 }),
    ...[-3.6, -1.2, 1.2, 3.6].map(x => P_cap([x, 0.5, 5], [x * 1.1, 1, 9.5], 1.2, "gold", { part: 3, grp: 1, tone: 2 })),
    P_cap([5, 0.5, 0], [8, 1, 3.5], 1.3, "gold", { part: 4, grp: 1, tone: 2 }),
  ], 9);
}

// Missiles are centred on their hit point (model origin = collision centre).
function rockPrims() { return [P_ell([0, 0, 0], [3.6, 3.2, 3.2], "stone", { part: 1, grp: 1, tone: 3, tex: stoneTex })]; }
function seedPrims() {
  // a hard brown seed with a pale tip (a green pellet read as a leaf or a gem)
  return [P_ell([0, 0, 0], [2.4, 2.4, 3], "wood", { part: 1, grp: 1, tone: 2 }), P_ell([0, 0.6, 2.2], [1.1, 1.1, 1], "gold", { part: 2, grp: 1, tone: 3, line: false })];
}
// A hex bolt: a four-pointed star of violet light round a white core, turning a
// quarter as it flickers (nothing like a gem lying in the grass).
function spellStarPrims(frame) {
  const P = [P_ell([0, 0, 0], [2.6, 2.6, 2.6], "glow", { part: 1, grp: 1, line: false })];
  const a0 = frame ? Math.PI / 4 : 0, L = frame ? 7.6 : 6.4;
  for (let i = 0; i < 4; i++) {
    const a = a0 + i * Math.PI / 2;
    P.push(P_cone([0, 0, 0], [Math.cos(a) * L, 0, Math.sin(a) * L], 2.0, 0.25, "purple", { part: 2, grp: 2, tone: 3 }));
  }
  return upright(P, 0);
}
// A thrown fireball: a red and orange flame round a yellow-white heart, its tail
// streaming back against the flight (a = eighth-turn of travel, 0 = east, clockwise on
// screen). Nothing like the gold gem it used to resemble.
function fireballPrims(a, frame) {
  // hottest at the front: flat discs of colour, each pushed further toward the heading
  // and nearer the viewer than the one under it: a red rim, a thin orange band, a yellow
  // heart filling over half the ball and a white-hot core at its leading edge, so the
  // core leads in all eight headings. Every layer is flat (unshaded): a shaded ball lit
  // from the upper left put its brightest pixels up-left whatever the heading and sank
  // the core on some of them, and the whole ball read as a salmon-coloured lump.
  // Behind it a tapering body of flame, narrower than the ball, so the ball's lower curve
  // shows just below its widest row whichever way it flies, and the whole reads as one
  // teardrop comet; it ends in three separate tongues with gaps between them (the middle
  // one orange and longest, the side ones red, shorter and angled a little outward), and
  // the yellow heat runs back into the tail as a streak. The tongues' lengths trade places
  // between the two flicker frames. (Tongues rooted at the ball's full width, running
  // straight back, left a straight-sided skirt: flying north, with the tail hanging below,
  // it read as a light bulb or a jellyfish.)
  // Offsets are laid out in screen pixels on the ground plane: f along the heading, s
  // across it, c = depth toward the camera (which moves nothing on screen, only in
  // front). A step north on the ground is also a step away from the camera, so that is
  // taken back out: every layer keeps its own depth whatever the heading (without it the
  // white core sank behind the yellow on the northward headings and the tail rode over
  // the ball).
  const cam = [0, COS_P, SIN_P], ang = a * Math.PI / 4, hx = Math.cos(ang), hy = Math.sin(ang);
  const at = (f, s, c) => { const y = (hy * f + hx * s) / SIN_P; return vAdd([hx * f - hy * s, y, 0], vMul(cam, c - y * COS_P)); };
  const R = 5, flat = (part, tone) => ({ part, grp: 1, tone, flat: true, line: false });
  const P = [
    P_ell(at(0, 0, 0), [R, R, R], "red", flat(1, 2)),
    P_ell(at(0.6, 0, 2), [R - 0.9, R - 0.9, R - 0.9], "red", flat(2, 3)),
    P_ell(at(1.2 + frame * 0.2, 0, 4), [R - 1.5, R - 1.5, R - 1.5], "gold", flat(3, 3)),
    P_ell(at(2.1, 0, 6), [1.9 + frame * 0.2, 1.9, 1.9], "glow", flat(4, 0)),
  ];
  const wig = frame ? 1 : -1;
  P.push(P_cone(at(-1, 0, -0.5), at(-(R + 1.4), wig * 0.4, -0.5), 3.8, 1.2, "red", flat(5, 2)));
  // the tongues root at the end of that body (4.2 px apart) and fan out a little (8 px
  // apart at the tips), the side ones well short of the middle one
  const Lm = frame ? 6.8 : 7.6, Ls = frame ? [3.6, 4.8] : [4.8, 3.6];
  P.push(P_cone(at(-(R + 0.5), 0, -1), at(-(R + Lm), wig * 0.8, -1), 1.7, 0.2, "red", flat(6, 3)));
  [-1, 1].forEach((k, i) => P.push(P_cone(at(-R, k * 2.1, -1), at(-(R + Ls[i]), k * 4.0, -1), 1.25, 0.2, "red", flat(6, 2))));
  P.push(P_cone(at(-(R - 2.5), 0, 1), at(-(R + 2.8), wig * 0.3, 1), 1.7, 0.3, "gold", flat(7, 3)));
  return P;
}
// The candle's fire on the ground: a tongue of flame, hottest at its heart, flickering.
function candleFlamePrims(frame) {
  // tall tongues of flame: red outside, a gold heart pushed toward the viewer so it
  // shows through, a white-hot core low down (a short red cone read as a lump of clay)
  const lean = frame ? 1.2 : -1.2;
  return [
    P_ell([0, 0, 1], [6, 4.5, 1.2], "red", { part: 1, grp: 1, tone: 1 }),
    P_cone([0, 0, 1], [lean, -0.5, 18 + frame * 2], 5.2, 0.4, "red", { part: 2, grp: 2, tone: 3 }),
    P_cone([-3.6, 0.5, 1], [-5.4 - lean, 0, 10 + frame * 2], 2.2, 0.3, "red", { part: 2, grp: 2, tone: 2 }),
    P_cone([3.6, 0.5, 1], [5.2 - lean, 0, 12 - frame * 2], 2.1, 0.3, "red", { part: 2, grp: 2, tone: 2 }),
    P_cone([0, 3.2, 1.5], [lean * 0.6, 3.4, 12 + frame], 3.4, 0.3, "gold", { part: 3, grp: 3, tone: 2, line: false }),
    P_cone([0, 4.6, 2], [lean * 0.3, 4.8, 7.5], 2.0, 0.3, "gold", { part: 4, grp: 3, tone: 3, line: false }),
    P_ell([0, 5.2, 3.2], [1.3, 0.8, 1.8], "white", { part: 5, grp: 3, tone: 4, line: false }),
  ];
}
// The stepladder laid across a tile of water (v 0: running north-south, 1: east-west).
function ladderFlatPrims(v) {
  const P = [];
  // (wider than the hero and resting on both banks, so it shows round him as he crosses)
  for (const s of [-1, 1]) P.push(P_cap([s * 9, -24, 1.4], [s * 9, 24, 1.4], 1.6, "wood", { part: 1, grp: 1, tone: 2, tex: barkTex }));
  for (let y = -20; y <= 20; y += 6.6) P.push(P_cap([-9, y, 1.8], [9, y, 1.8], 1.1, "wood", { part: 2, grp: 2, tone: 3 }));
  return v ? xformPrims(P, mRotZ(Math.PI / 2)) : P;
}
// The raft on the water: the same logs as the treasure (running north-south, lashed
// with two ropes), wider than the hero, riding in a ring of pale foam.
function raftPrims() {
  const P = [P_ell([0, 0, 0.2], [17, 15, 0.4], "teal", { part: 5, grp: 5, tone: 4, line: false })];
  for (let i = -3; i <= 3; i++) P.push(P_cyl([i * 4.2, -12, 2], [i * 4.2, 12, 2], 2.2, "wood", { part: 1 + (i & 1), grp: 1, tone: 2 + (i & 1), tex: barkTex }));
  for (const y of [-7, 7]) P.push(P_box([0, y, 4.1], [14.2, 0.9, 0.6], "leather", { part: 3, grp: 3, tone: 1 }));
  return P;
}
// Spell orbs: bright core, coloured halo, flickering size.
function orbPrims(mat, frame) {
  const r = frame ? 4.4 : 3.8;
  return [
    P_ell([0, 0, 0], [r, r, r], mat, { part: 1, grp: 1, tone: 3 }),
    P_ell([0, 1.4, 1], [r * 0.5, r * 0.4, r * 0.5], "glow", { part: 2, grp: 1, line: false }),
  ];
}
