"use strict";
// ---------- Village models: houses, fences, well, signpost, furniture ----------
// Same camera, light and units as art_models.js (x: px, y: ground depth, z: height;
// screen y = y * SIN_P - z * COS_P). A house is anchored at the middle of its front
// wall's base, which sits on the bottom edge of its door tile.

Object.assign(MATS, {
  plaster: { ramp: "plaster", base: 4 },
  glass:   { ramp: "water", base: 1 },
  tile:    { ramp: "red", base: 2 },
  slate:   { ramp: "cloth", base: 2 },
  thatch:  { ramp: "gold", base: 2 },
  shingle: { ramp: "earth", base: 2 },
});

// Front wall 45px tall, door 36px (hero 31px), roof ~42px, whole house ~95px.
const HOUSE = { halfW: 45, front: -2, back: -58, wallTop: 72, eaveZ: 69, eaveY: 3, ridgeY: -30, backY: -63, eaveX: 51, pitch: 38 * Math.PI / 180 };

// Roof courses: shadowed lower lip on every course, staggered joints, per-tile tone.
function roofCourses(rowH, tileW, amp) {
  return (q) => {
    const zz = 300 - q[2];
    const r = Math.floor(zz / rowH), f = zz / rowH - r;
    if (f > 0.74) return -1.2;
    const xx = q[0] + 200 + (r & 1) * tileW / 2;
    if (xx % tileW < 1.1) return -0.8;
    return (hash2(Math.floor(xx / tileW), r, 61) - 0.5) * amp + (f < 0.22 ? 0.45 : 0);
  };
}
function thatchTex(q) {
  const zz = 300 - q[2];
  return (vnoise(q[0] * 0.8 + 3, zz * 0.1, 63) - 0.5) * 1.3 + ((zz % 7.5) > 6.2 ? -0.9 : 0);
}
function plasterTex(q) { return (vnoise(q[0] * 0.25, q[2] * 0.25, 65) - 0.5) * 0.5; }
function brickTex(q, n) {
  if (n[2] > 0.5) return 0;
  const r = Math.floor(q[2] / 6.5), f = q[2] / 6.5 - r;
  if (f < 0.16) return -1.1;
  const xx = q[0] + 200 + (r & 1) * 6;
  if (xx % 12 < 1.2) return -1.1;
  return (hash2(Math.floor(xx / 12), r, 67) - 0.5) * 0.9;
}
function plankTex(q, n) {
  if (n[2] > 0.5) return 0;
  const r = Math.floor(q[2] / 5.5), f = q[2] / 5.5 - r;
  if (f < 0.16) return -1.2;
  const xx = q[0] + 200 + r * 13;
  return (vnoise(q[0] * 0.12 + r * 7, r, 69) - 0.5) * 0.9 + ((xx % 23) < 1 && hash2(Math.floor(xx / 23), r, 70) < 0.5 ? -1 : 0);
}
function doorTex(q) { return (((q[0] + 100) % 5) < 0.9 ? -0.9 : 0) + (Math.abs(q[2] - 12) < 1.2 || Math.abs(q[2] - 44) < 1.2 ? -0.7 : 0); }
function glassTex(q) { return ((q[0] + q[2] * 0.7 + 100) % 10) < 2.2 ? 1.6 : 0; }
// Wooden shakes: narrow split boards of uneven tone in staggered courses, their lower
// ends ragged (so the shake roof never reads as the clay tiles recoloured).
function shakeTex(q) {
  const zz = 300 - q[2];
  const r = Math.floor(zz / 4.4), f = zz / 4.4 - r;
  const xx = q[0] + 200 + hash2(r, 3, 72) * 7, k = Math.floor(xx / 3.3);
  if (f > 0.8 - hash2(k, r, 73) * 0.22) return -1.2;
  if (xx % 3.3 < 0.75) return -0.9;
  return (hash2(k, r, 74) - 0.5) * 1.1 + (f < 0.2 ? 0.35 : 0);
}

// How each house dresses its front, so no two share a door, window or doorstep:
// door leaf and frame [material, tone], window frame, what sits under the windows.
const HOUSE_DRESS = [
  { leaf: ["wood", 2], frame: ["wood", 3], sash: ["wood", 3], sill: "flowers", flowers: [["red", 3], ["gold", 3], ["red", 3], ["white", 0]] },
  // (the smithy's door is a warm red-brown under its iron bands: in dark wood it read as an
  // open doorway)
  { leaf: ["hair", 2], frame: ["stone", 3], sash: ["stone", 2], sill: "bars", straps: true },
  { leaf: ["moss", 2], frame: ["wood", 1], sash: ["wood", 1], sill: "flowers", shutters: ["moss", 2], flowers: [["purple", 3], ["white", 0], ["purple", 3], ["gold", 3]] },
  { leaf: ["tunic", 2], frame: ["white", 4], sash: ["white", 4], sill: "flowers", box: ["red", 2], flowers: [["gold", 3], ["white", 0], ["cloth", 3], ["gold", 3]] },
];

// v: 0 plaster + timber under a tiled roof, 1 stone under slate, 2 planks under thatch,
//    3 brick under wooden shakes
function housePrims(v) {
  // the bodies differ too: the smithy's roof is low-pitched, the widow's cottage has a
  // steep thatch, the children's house wears wooden shakes and a porch
  // (the thatch's eave sits higher than the others', so its door keeps a lintel and its
  // windows stay clear under the deep overhang)
  const H = Object.assign({}, HOUSE, [{}, { pitch: 28 * Math.PI / 180 }, { eaveZ: 75, wallTop: 78, pitch: 47 * Math.PI / 180 }, {}][v]);
  const rise = (H.eaveY - H.ridgeY) * Math.tan(H.pitch), ridgeZ = H.eaveZ + rise;
  const roofMat = ["tile", "slate", "thatch", "shingle"][v], wallMat = ["plaster", "stone", "wood", "red"][v];
  const roofTex = v === 2 ? thatchTex : v === 3 ? shakeTex : roofCourses(v === 1 ? 4.2 : 5, v === 1 ? 7 : 9, 0.6);
  const wallTex = [plasterTex, brickTex, plankTex, brickTex][v];
  const wallTone = [undefined, 4, 3, 2][v];
  const D = HOUSE_DRESS[v];
  const F = H.front;
  const P = [];
  let pipeFoot = null;
  const wy = (H.front + H.back) / 2, wd = (H.front - H.back) / 2;
  // footing and walls
  P.push(P_box([0, wy, 3], [H.halfW + 1.5, wd + 1.5, 3], "stone", { part: 1, grp: 1, tone: 2, tex: stoneTex }));
  P.push(P_box([0, wy, H.wallTop / 2 + 3], [H.halfW, wd, H.wallTop / 2 - 3], wallMat, { part: 1, grp: 1, tex: wallTex, tone: wallTone }));
  const trim = (c, h, tone) => P.push(P_box(c, h, "wood", { part: 2, grp: 1, tone: tone === undefined ? 1 : tone }));
  if (v === 0) {
    // timber frame
    for (const x of [-43, 43]) trim([x, F + 0.4, 38], [2.4, 1.4, 32]);
    for (const x of [-16, 16]) trim([x, F + 0.4, 36], [2, 1.4, 30]);
    trim([0, F + 0.4, 66], [H.halfW, 1.4, 2.2]);
    trim([0, F + 0.4, 8], [H.halfW, 1.5, 2]);
    for (const s of [-1, 1]) trim([s * 29.5, F + 0.4, 29], [12, 1.3, 1.6]);
  } else if (v === 1 || v === 3) {
    // dressed corner stones
    for (const x of [-43, 43]) for (let z = 9; z < 66; z += 13) P.push(P_box([x, F + 0.3, z + 3], [3.2, 1.3, 3], "stone", { part: 2, grp: 1, tone: 4 }));
  } else {
    // corner posts of the plank house (no higher than its walls: they poked up through
    // the thatch as two dark squares)
    for (const x of [-43.5, 43.5]) trim([x, F + 0.4, H.wallTop / 2], [2.2, 1.4, H.wallTop / 2], 1);
  }
  // door (36 tall: taller than the hero) with frame and doorstep
  P.push(P_box([0, F + 0.6, 29], [12.5, 1.0, 29], D.frame[0], { part: 3, grp: 1, tone: D.frame[1] }));
  P.push(P_box([0, F + 1.2, 28], [10, 0.8, 28], D.leaf[0], { part: 3, grp: 1, tone: D.leaf[1], tex: doorTex }));
  if (D.straps) for (const z of [13, 43]) P.push(P_box([0, F + 1.8, z], [9.4, 0.5, 1.3], "iron", { part: 3, grp: 1, tone: 1, line: false }));
  // the cottage's door has a timber lintel under the thatch, so its top doesn't just run
  // into the eave
  if (v === 2) P.push(P_box([0, F + 1.6, 60.6], [15, 1.6, 2.2], "wood", { part: 9, grp: 9, tone: 2 }));
  if (v === 0) P.push(P_box([0, 3.5, 1.5], [14, 4.5, 1.5], "stone", { part: 4, grp: 4, tone: 3 }));
  else if (v === 1) P.push(P_box([0, 4, 1.2], [16.5, 5, 1.2], "stone", { part: 4, grp: 4, tone: 2, tex: stoneTex }));
  else if (v === 2) P.push(P_box([0, 3.2, 1.8], [12.5, 4, 1.8], "wood", { part: 4, grp: 4, tone: 2, tex: plankTex }));
  // (the children's house: a low doorstep of the same red brick as its walls; two round
  // pale stepping stones read as eggs or rocks to pick up)
  else P.push(P_box([0, 3.6, 1.7], [13, 4.4, 1.7], "red", { part: 4, grp: 4, tone: 1, tex: brickTex }));
  // windows: a frame, the glass, its bars, and under it flowers or a stone sill
  for (const s of [-1, 1]) {
    const x = s * 29.5;
    P.push(P_box([x, F + 0.5, 42], [8.5, 1.0, 8.5], D.sash[0], { part: 5, grp: 1, tone: D.sash[1] }));
    P.push(P_box([x, F + 1.0, 42], [6.5, 0.8, 6.5], "glass", { part: 5, grp: 1, tex: glassTex }));
    if (D.sill === "bars") {
      // the smithy: iron bars and a plain stone sill, no flowers by the forge
      for (const bx of [-3.4, 0, 3.4]) P.push(P_box([x + bx, F + 1.6, 42], [0.7, 0.6, 6.5], "iron", { part: 5, grp: 1, tone: 1, line: false }));
      P.push(P_box([x, F + 2, 33], [9.8, 2.2, 1.1], "stone", { part: 6, grp: 6, tone: 3 }));
      continue;
    }
    P.push(P_box([x, F + 1.5, 42], [6.5, 0.6, 0.8], D.sash[0], { part: 5, grp: 1, tone: D.sash[1] }));
    if (v !== 2) P.push(P_box([x, F + 1.5, 42], [0.8, 0.6, 6.5], D.sash[0], { part: 5, grp: 1, tone: D.sash[1] }));
    if (D.shutters) for (const o of [-1, 1]) P.push(P_box([x + o * 12, F + 1.0, 42], [3.2, 0.7, 8.5], D.shutters[0], { part: 8, grp: 1, tone: D.shutters[1], tex: (q) => (((q[0] + 100) % 2.2) < 0.6 ? -0.8 : 0) }));
    const box = D.box || ["wood", 2];
    P.push(P_box([x, F + 3, 32], [9.5, 3.2, 1.6], box[0], { part: 6, grp: 6, tone: box[1] }));
    for (const fx of [-6, -2, 2, 6]) P.push(P_ell([x + fx, F + 3.4, 35], [2.6, 2.4, 2.4], "leaf", { part: 7, grp: 6, tone: 3, line: false }));
  }
  // roof: two slabs meeting at a capped ridge, a dark fascia under the front eave
  const half = Math.hypot(H.eaveY - H.ridgeY, rise) / 2, mz = (H.eaveZ + ridgeZ) / 2;
  P.push(P_box([0, (H.eaveY + H.ridgeY) / 2, mz], [H.eaveX, half + 0.8, 1.8], roofMat, { part: 10, grp: 10, tex: roofTex, rot: mRotX(-H.pitch) }));
  P.push(P_box([0, (H.ridgeY + H.backY) / 2, mz], [H.eaveX, half + 0.8, 1.8], roofMat, { part: 11, grp: 10, tex: roofTex, rot: mRotX(H.pitch) }));
  P.push(P_cyl([-H.eaveX - 1, H.ridgeY, ridgeZ + 1.4], [H.eaveX + 1, H.ridgeY, ridgeZ + 1.4], 2.6, roofMat, { part: 12, grp: 10, tone: 1 }));
  P.push(P_box([0, H.eaveY - 0.2, H.eaveZ - 1.2], [H.eaveX, 1.1, 1.8], "wood", { part: 13, grp: 10, tone: 1 }));
  // Each house has its own outline, not just its own materials:
  if (v === 0) {
    // the elder's hall: a chimney behind, and on the ridge a little bell-cote
    P.push(P_box([27, -44, 96], [5.5, 5.5, 18], "stone", { part: 14, grp: 14, tone: 3, tex: brickTex }));
    P.push(P_box([27, -44, 114.6], [7, 7, 1.6], "stone", { part: 14, grp: 14, tone: 2 }));
    // (a plaster footing astride the ridge, four posts - the front pair pale so they frame
    // the opening - a dark back board so the bell shows against it, a steep gabled cap in
    // the house's tiles with dark barge boards drawing its peak, and the bell hung from its
    // beam: a flared bronze bell with a lip, a crown and a clapper, smaller than the opening)
    const bx = -8, by = H.ridgeY, bz = ridgeZ;
    P.push(P_box([bx, by, bz], [9.5, 6, 4.5], "plaster", { part: 15, grp: 15, tex: plasterTex }));
    for (const px of [-7.8, 7.8]) for (const py of [-4.4, 4.4]) P.push(P_box([bx + px, by + py, bz + 15.5], [1.3, 1.3, 11], "wood", { part: 15, grp: 15, tone: py > 0 ? 3 : 1 }));
    P.push(P_box([bx, by - 4.4, bz + 15.5], [6.6, 0.5, 11], "wood", { part: 15, grp: 15, tone: 0, line: false }));
    P.push(P_box([bx, by, bz + 25.5], [8.6, 5.4, 1], "wood", { part: 15, grp: 15, tone: 1 }));
    const cp = 0.9, cl = 7.8, cz = bz + 30, peak = cz + cl * Math.sin(cp);
    for (const s of [-1, 1]) {
      const cx = bx + s * cl * Math.cos(cp);
      P.push(P_box([cx, by, cz], [cl, 6.8, 0.9], roofMat, { part: 16, grp: 16, tone: 2, tex: roofCourses(3, 4, 0.4), rot: mRotY(s * cp) }));
      P.push(P_box([cx, by + 7.1, cz + 0.3], [cl + 0.4, 0.5, 1.3], "wood", { part: 17, grp: 16, tone: 0, rot: mRotY(s * cp) }));
    }
    P.push(P_cyl([bx, by - 7, peak + 0.6], [bx, by + 7.4, peak + 0.6], 1.1, roofMat, { part: 16, grp: 16, tone: 1 }));
    P.push(P_box([bx, by, bz + 4.7], [6.5, 4.4, 0.3], "wood", { part: 15, grp: 15, tone: 0, flat: true, line: false }));
    P.push(P_cyl([bx, by, bz + 24.4], [bx, by, bz + 20], 0.7, "iron", { part: 18, grp: 18, tone: 1, line: false }));
    // (the bell's body only carries its drawing: seen from above a turned bell reads as a
    // bowl, so its flared outline is painted on, below)
    P.push(P_frustum([bx, by + 0.5, bz + 11.5], [bx, by + 0.5, bz + 19], 3.4, 1.7, "gold", { part: 18, grp: 18, tone: 2, line: false }));
  } else if (v === 1) {
    // the smithy: a broad forge chimney up the gable end
    P.push(P_box([37, -40, 60], [9, 9, 52], "stone", { part: 14, grp: 14, tone: 2, tex: brickTex }));
    P.push(P_box([37, -40, 113], [10.5, 10.5, 2], "stone", { part: 14, grp: 14, tone: 1 }));
    // and a signboard with an anvil painted on it, hung from an iron arm off the corner
    P.push(P_box([-50, F + 2, 62], [5.5, 1.1, 1.1], "iron", { part: 18, grp: 18, tone: 1 }));
    P.push(P_box([-50.5, F + 2.6, 51.5], [6, 0.8, 7], "wood", { part: 19, grp: 18, tone: 3 }));
  } else if (v === 2) {
    // the widow's cottage: a deep, soft thatch (below) and only a thin iron stovepipe,
    // standing on the front slope near the ridge with a collar where it meets the thatch
    // and a turned rim round its dark open mouth (set behind the ridge, only its top
    // showed, as a grey ball on the grass behind the roof)
    // (2px further down the slope than first placed: its rim touched the dark line under
    // the ridge, so it seemed to hang from it)
    // (its open round top, dark inside a pale rim over a narrow pipe, read as a keyhole
    // set in the roof: it wears a wide conical cap instead, and only a thin bright collar
    // where it meets the thatch)
    const sy = -16.8, sz = H.eaveZ + (H.eaveY - sy) * Math.tan(H.pitch);
    P.push(P_cyl([-26, sy, sz - 4], [-26, sy, sz + 15], 2.1, "iron", { part: 14, grp: 14, tone: 2 }));
    P.push(P_cyl([-26, sy, sz + 0.2], [-26, sy, sz + 1.6], 2.8, "iron", { part: 15, grp: 14, tone: 3 }));
    P.push(P_frustum([-26, sy, sz + 14.6], [-26, sy, sz + 22.4], 4.8, 0.3, "iron", { part: 16, grp: 14, tone: 2 }));
    // (where the pipe meets the slope its foot curved like a bottle's: straw painted over
    // that curve leaves it a flat base sunk in the thatch)
    pipeFoot = [-26, sy + 3.3, sz + 1.5];
  } else {
    // the children's house: a gabled porch on two posts over the door, set high enough
    // that its beam clears the top of the door
    P.push(P_box([-24, -44, 96], [5.5, 5.5, 18], "stone", { part: 14, grp: 14, tone: 3, tex: brickTex }));
    P.push(P_box([-24, -44, 114.6], [7, 7, 1.6], "stone", { part: 14, grp: 14, tone: 2 }));
    for (const s of [-1, 1]) {
      P.push(P_box([s * 15, F + 12, 35], [1.6, 1.6, 35], "wood", { part: 21, grp: 21, tone: 3 }));
      P.push(P_box([s * 8.6, F + 7, 74], [9.8, 8, 1.3], roofMat, { part: 22, grp: 22, tex: shakeTex, rot: mRotY(s * 0.62) }));
    }
    P.push(P_box([0, F + 14.6, 72], [15.5, 0.8, 1.2], "wood", { part: 23, grp: 22, tone: 1 }));
  }
  if (v === 2) {
    // thatch piled thick over the eaves, with a rolled ridge
    // (its lower edge clears the door's lintel)
    P.push(P_box([0, H.eaveY + 2.4, H.eaveZ - 0.5], [H.eaveX + 2, 2.6, 2.8], roofMat, { part: 24, grp: 10, tex: roofTex }));
    P.push(P_cyl([-H.eaveX - 2, H.ridgeY, ridgeZ + 2.4], [H.eaveX + 2, H.ridgeY, ridgeZ + 2.4], 4.2, roofMat, { part: 12, grp: 10, tone: 2, tex: roofTex }));
  }
  const decals = [];
  // flowers in the window boxes (each house its own) and a door ring
  if (D.flowers) for (const s of [-1, 1]) D.flowers.forEach((c, k) => {
    decals.push({ p: [s * 29.5 - 6 + k * 4, F + 5.8, 36.5], face: [0, 1, 0.4], px: [[0, 0, c]], minFacing: 0.1, tol: 4 });
  });
  decals.push({ p: [5.5, F + 2.1, 26], face: [0, 1, 0], px: [[0, 0, [D.straps ? "neutral" : "gold", 3]], [0, 1, [D.straps ? "neutral" : "gold", 1]]], minFacing: 0.2, tol: 3 });
  if (pipeFoot) {
    decals.push({ p: pipeFoot, face: [0, 1, 0], px: [[-2, 1, ["gold", 2]], [-1, 1, ["gold", 3]], [0, 1, ["gold", 2]], [1, 1, ["gold", 2]], [0, 0, ["gold", 3]]], minFacing: 0.1, tol: 3 });
    // (and a short shadow on the thatch, falling to the lower right of its foot)
    const S = ["gold", 1];
    decals.push({ p: pipeFoot, face: [0, 1, 0], px: [[3, -2, S], [3, -1, S], [4, -1, S], [3, 0, S], [4, 0, S], [5, 0, S], [4, 1, S], [5, 1, S], [6, 1, S], [6, 2, S], [7, 2, S]], minFacing: 0.1, tol: 3 });
  }
  if (v === 0) {
    // the elder's bell, painted over its body: a narrow crown flaring to a wide lip, lit
    // on the left, the clapper showing under the mouth
    const BELL = ["...LMD...", "...LMD...", "..LLMDD..", "..LMMMD..", ".LLMMMDD.", "LLMMMMMDD", "ooooooooo", "...kk...."];
    const C = { o: ["gold", 0], L: ["gold", 3], M: ["gold", 2], D: ["gold", 1], k: ["neutral", 3] };
    const px = [];
    BELL.forEach((row, y) => [...row].forEach((ch, x) => { if (C[ch]) px.push([x - 4, y - 3, C[ch]]); }));
    decals.push({ p: [-8, H.ridgeY + 3.1, ridgeZ + 15.2], face: [0, 1, 0], px, minFacing: 0.1, tol: 4, overhang: true });
  }
  if (v === 1) {
    const anvil = [];
    for (let x = -4; x <= 3; x++) anvil.push([x, -2, "ink"]);
    for (let x = -2; x <= 3; x++) anvil.push([x, -1, "ink"]);
    anvil.push([-5, -2, "ink"], [-6, -3, "ink"], [0, 0, "ink"], [1, 0, "ink"], [-1, 1, "ink"], [0, 1, "ink"], [1, 1, "ink"], [2, 1, "ink"]);
    decals.push({ p: [-50, F + 3.5, 51.5], face: [0, 1, 0], px: anvil, minFacing: 0.2, tol: 4 });
  }
  return { prims: P, decals };
}

// Rail fence; m = connection mask (1 N, 2 E, 4 S, 8 W). Tile centre anchor.
function fencePrims(m) {
  const P = [
    P_box([0, 0, 10.5], [2.3, 2.3, 10.5], "wood", { part: 1, grp: 1, tone: 3 }),
    P_cone([0, 0, 21], [0, 0, 24.5], 2.3, 0.5, "wood", { part: 1, grp: 1, tone: 3 }),
  ];
  const hx = 16, hy = 16 / SIN_P;
  const rail = (c, h) => P.push(P_box(c, h, "wood", { part: 2, grp: 2, tone: 2 }));
  for (const z of [8.5, 16.5]) {
    if (m & 2) rail([hx / 2, 0, z], [hx / 2, 1.1, 1.5]);
    if (m & 8) rail([-hx / 2, 0, z], [hx / 2, 1.1, 1.5]);
    if (m & 1) rail([0, -hy / 2, z], [1.1, hy / 2, 1.5]);
    if (m & 4) rail([0, hy / 2, z], [1.1, hy / 2, 1.5]);
  }
  return P;
}

// Village well: brick ring, dark water, windlass and a little tiled roof.
function wellPrims() {
  const P = [];
  P.push(P_cyl([0, 0, 0], [0, 0, 17], 13.5, "stone", { part: 1, grp: 1, tone: 3, tex: brickTex }));
  P.push(P_cyl([0, 0, 17], [0, 0, 18.4], 14.2, "stone", { part: 1, grp: 1, tone: 4 }));
  P.push(P_cyl([0, 0, 18.3], [0, 0, 18.7], 10.5, "glass", { part: 2, grp: 2, tone: 0, flat: true, line: false }));
  for (const s of [-1, 1]) P.push(P_box([s * 12, 0, 33], [1.8, 1.8, 15], "wood", { part: 3, grp: 3, tone: 2 }));
  P.push(P_cyl([-12, 0, 38], [12, 0, 38], 1.9, "wood", { part: 4, grp: 3, tone: 3 }));
  P.push(P_cyl([0, 0.5, 36.5], [0, 0.5, 28], 0.55, "leather", { part: 4, grp: 3, tone: 1, line: false }));
  P.push(P_cyl([0, 0.5, 23], [0, 0.5, 28.5], 3.3, "wood", { part: 5, grp: 5, tone: 2 }));
  const pitch = 40 * Math.PI / 180, run = 11.5, rise = run * Math.tan(pitch), half = Math.hypot(run, rise) / 2;
  const rt = roofCourses(3.6, 6, 0.5);
  P.push(P_box([0, run / 2, 48 + rise / 2], [17, half + 0.8, 1.3], "tile", { part: 6, grp: 6, tex: rt, rot: mRotX(-pitch) }));
  P.push(P_box([0, -run / 2, 48 + rise / 2], [17, half + 0.8, 1.3], "tile", { part: 7, grp: 6, tex: rt, rot: mRotX(pitch) }));
  P.push(P_cyl([-18, 0, 48 + rise + 1], [18, 0, 48 + rise + 1], 1.6, "tile", { part: 8, grp: 6, tone: 1 }));
  return P;
}

// Signpost: a post and a board with a few painted strokes.
function signPrims() {
  const strokes = (q, n) => {
    if (n[1] < 0.9 || Math.abs(q[0]) > 9) return 0;
    for (const z of [29.5, 26, 22.5]) if (Math.abs(q[2] - z) < 0.8 && hash2(Math.floor(q[0] / 2.4 + 50), Math.round(z), 71) < 0.78) return -1.6;
    return 0;
  };
  return [
    P_box([0, 0, 12], [1.9, 1.9, 12], "wood", { part: 1, grp: 1, tone: 2 }),
    P_box([0, 1.6, 26], [12.5, 1.4, 7.5], "wood", { part: 2, grp: 2, tone: 3, tex: strokes }),
  ];
}

// ---------- interior furniture ----------
function bedPrims() {
  return [
    P_box([0, 0, 7], [15, 24, 7], "wood", { part: 1, grp: 1, tone: 2 }),
    P_box([0, -25, 14], [15.5, 2, 14], "wood", { part: 2, grp: 1, tone: 2 }),
    P_box([0, 1, 15], [13.5, 22, 2.2], "white", { part: 3, grp: 3, tone: 4 }),
    P_box([0, 6, 16.6], [14, 17, 1.6], "tunic", { part: 4, grp: 3, tone: 2, tex: (q) => ((Math.floor((q[0] + 40) / 4) + Math.floor((q[1] + 40) / 4)) & 1) ? -0.7 : 0.2 }),
    P_ell([0, -16, 17.5], [8, 4.5, 2.6], "white", { part: 5, grp: 3, tone: 4 }),
  ];
}
// v 0: the widow's table, a loaf and a cup; 1: the elder's, an open book, an ink pot with
// its quill laid beside it, and a lit candle
function tablePrims(v) {
  const P = [P_box([0, 0, 17], [18, 12, 1.8], "wood", { part: 1, grp: 1, tone: 3, tex: (q, n) => n[2] > 0.5 && ((q[1] + 40) % 6) < 0.8 ? -0.8 : 0 })];
  for (const [x, y] of [[-15, -9], [15, -9], [-15, 9], [15, 9]]) P.push(P_box([x, y, 8], [1.6, 1.6, 8], "wood", { part: 2, grp: 2, tone: 1 }));
  if (v === 1) {
    const decals = [];
    // the book: a red cover under two cream pages, painted with a dark spine down the
    // middle and lines of writing (plain grey pages read as a tray or a slate)
    P.push(P_box([-5, 2, 19.2], [8.5, 6, 0.5], "red", { part: 3, grp: 3, tone: 1 }));
    P.push(P_box([-5, 2, 20.1], [7.8, 5.4, 0.5], "plaster", { part: 3, grp: 3, tone: 4, flat: true }));
    const BOOK = [
      "wwwwwwwkwwwwwww",
      "wttwtttkwttwttw",
      "wwwwwwwkwwwwwww",
      "wttttwwkwtttwtw",
      "wwwwwwwkwwwwwww",
      "wtttwtwkwttttww",
      "ggggggggggggggg",
    ];
    const BC = { w: ["white", 0], t: ["neutral", 2], k: ["earth", 1], g: ["sand", 0] };
    const bpx = [];
    BOOK.forEach((row, y) => [...row].forEach((ch, x) => bpx.push([x - 7, y - 3, BC[ch]])));
    decals.push({ p: [-5, 2, 20.6], face: [0, 0, 1], px: bpx, minFacing: 0.1, tol: 3 });
    // the ink pot: a squat square bottle of dark blue glass with a pale lip; the quill lies
    // on the table beside it (upright in a round black pot it read as a lit bomb)
    P.push(P_box([9.5, -5, 20.4], [2.4, 2.4, 1.6], "tunic", { part: 4, grp: 4, tone: 1 }));
    P.push(P_cyl([9.5, -5, 21.8], [9.5, -5, 23], 1.3, "tunic", { part: 4, grp: 4, tone: 3 }));
    P.push(P_cap([4.5, -1.8, 19.1], [15.5, 1.4, 19.1], 0.35, "white", { part: 5, grp: 5, tone: 4, line: false }));
    P.push(xformPrims([P_ell([0, 0, 0], [4.2, 1.3, 0.4], "white", { part: 5, grp: 5, tone: 4, line: false })], mRotZ(Math.atan2(3.2, 11)), [12.4, 0.5, 19.3])[0]);
    // the candle: a brass dish, a cream candle and a painted flame over its wick
    P.push(P_cyl([12, 6, 18.5], [12, 6, 19.5], 2.6, "gold", { part: 6, grp: 6, tone: 2 }));
    P.push(P_cyl([12, 6, 19.5], [12, 6, 25], 1.2, "plaster", { part: 6, grp: 6, tone: 4 }));
    const FLAME = ["..Y..", ".YWY.", ".YWY.", "..o..", "..k.."];
    const FC = { Y: ["gold", 3], W: ["white", 0], o: ["red", 3], k: ["ink", 0] };
    const fpx = [];
    FLAME.forEach((row, y) => [...row].forEach((ch, x) => { if (FC[ch]) fpx.push([x - 2, y - 4, FC[ch]]); }));
    decals.push({ p: [12, 6, 25], face: [0, 0, 1], px: fpx, minFacing: 0.1, tol: 3, overhang: true });
    return { prims: P, decals };
  }
  P.push(P_cyl([6, -2, 18.5], [6, -2, 22.5], 2.6, "white", { part: 3, grp: 3, tone: 3 }));
  P.push(P_ell([-6, 2, 20.5], [4.5, 3.5, 2.4], "wood", { part: 4, grp: 3, tone: 2 }));
  return { prims: P };
}
function shelfPrims() {
  const P = [P_box([0, 0, 24], [18, 5, 24], "wood", { part: 1, grp: 1, tone: 2 })];
  for (const z of [14, 28, 42]) P.push(P_box([0, 3.5, z], [16.5, 2.6, 0.9], "wood", { part: 2, grp: 1, tone: 3 }));
  const cols = ["red", "gold", "tunic", "leaf", "red", "white"];
  let i = 0;
  for (const z of [17.5, 31.5, 45.5]) for (const x of [-11, -3, 6, 12]) {
    if (hash2(x, z, 81) < 0.3) continue;
    P.push(P_cyl([x, 3.5, z - 3], [x, 3.5, z + 1.5], 2.1, cols[i++ % cols.length], { part: 3, grp: 3, tone: 2 }));
  }
  return P;
}
// Barrel: stacked staves stepping out to the belly, two iron hoops, a planked lid.
function barrelPrims() {
  const staves = (q, n) => n[2] > 0.5 ? (((q[0] + 40) % 4.5) < 0.8 ? -1 : 0) : ((((Math.atan2(q[1], q[0]) + 4) * 3.2) % 1) < 0.16 ? -0.9 : 0);
  const P = [];
  for (const [z0, z1, r] of [[0, 3, 7.4], [3, 8, 8.2], [8, 14, 8.7], [14, 19, 8.2], [19, 22, 7.4]]) P.push(P_cyl([0, 0, z0], [0, 0, z1], r, "wood", { part: 1, grp: 1, tone: 3, tex: staves }));
  for (const [z, r] of [[4.2, 8.5], [17.8, 8.5]]) P.push(P_cyl([0, 0, z - 1], [0, 0, z + 1], r, "iron", { part: 2, grp: 1, tone: 1, line: false }));
  // the lid sits inside the rim a shade darker, so it never matches a pale floor
  P.push(P_cyl([0, 0, 21.8], [0, 0, 22.3], 5.9, "wood", { part: 3, grp: 1, tone: 1, line: false, tex: staves }));
  return P;
}
// Smithy: an anvil on a stump, and a brick forge with glowing coals under its hood.
function anvilPrims() {
  return [
    P_cyl([0, 0, 0], [0, 0, 7], 6.5, "bark", { part: 1, grp: 1, tone: 2, tex: barkTex }),
    P_box([0.5, 0, 9], [4, 3, 2.5], "iron", { part: 2, grp: 2, tone: 1 }),
    P_box([1.5, 0, 13], [7.5, 3.6, 2], "iron", { part: 2, grp: 2, tone: 2, shiny: true }),
    P_cone([-6, 0, 13.4], [-12, 0, 13.9], 2.6, 0.4, "iron", { part: 3, grp: 2, tone: 2 }),
  ];
}
// lit: once three shards are home and the candle has woken it (the smith's quest), the
// hearth glows: a bed of red and gold coals and tongues of flame in the mouth
function forgePrims(lit) {
  const P = [
    P_box([0, 0, 8], [14, 9, 8], "stone", { part: 1, grp: 1, tone: 2, tex: brickTex }),
    P_box([0, 6.8, 7], [9, 2.8, 5.5], "ink", { part: 2, grp: 2, flat: true, line: false }),
    P_frustum([0, -1, 16], [0, -3, 34], 13, 7, "stone", { part: 4, grp: 4, tone: 3, tex: brickTex }),
    P_box([0, -3, 42], [6, 5, 8], "stone", { part: 5, grp: 4, tone: 3 }),
  ];
  if (!lit) {
    // the fire went out when the Sunstone broke: grey ash and a last dull coal
    P.push(P_ell([0, 9.4, 4.4], [7.4, 1.4, 2.8], "stone", { part: 3, grp: 2, tone: 1, line: false }));
    P.push(P_ell([2, 9.9, 5], [2, 0.8, 1.2], "redD", { part: 3, grp: 2, tone: 1, line: false }));
    return P;
  }
  P.push(P_ell([0, 9.4, 4.2], [7.6, 1.5, 2.6], "red", { part: 3, grp: 2, tone: 2, line: false }));
  for (const [x, t] of [[-4.5, 3], [-1.5, 2], [1.5, 3], [4.5, 2]]) P.push(P_ell([x, 10.2, 4.6], [1.6, 0.8, 1.2], "gold", { part: 3, grp: 2, tone: t, line: false }));
  for (const [x, h, r] of [[-3.5, 7, 1.8], [0, 10, 2.4], [3.5, 8, 1.9]]) {
    P.push(P_cone([x, 10.3, 5], [x + 0.4, 10.3, 5 + h], r, 0.3, "red", { part: 6, grp: 6, tone: 3, line: false }));
    P.push(P_cone([x, 10.8, 5.2], [x + 0.2, 10.8, 5 + h * 0.6], r * 0.55, 0.2, "gold", { part: 7, grp: 6, tone: 3, line: false }));
  }
  return P;
}

// ---- furniture that tells the houses apart ----
// A woven rug (laid into the floor, never sorted over feet): red field, gold border, a
// dark diamond in the middle.
// v 0: the elder's red and gold rug; 1: the children's blue play mat in checks.
function rugPrims(v) {
  const o = (tone) => ({ part: 1, grp: 1, tone, line: false, flat: true });
  if (v === 1) {
    const P = [P_box([0, 0, 0.3], [25, 15, 0.3], "tunic", o(1))];
    for (let x = -21; x <= 21; x += 6) for (let y = -11; y <= 11; y += 6) if (((x + 21) / 6 + (y + 11) / 6) % 2 === 0) P.push(P_box([x, y, 0.5], [3, 3, 0.3], "white", o(4)));
    for (const s of [-1, 1]) { P.push(P_box([0, s * 14.2, 0.6], [25, 0.8, 0.3], "red", o(2))); P.push(P_box([s * 24.2, 0, 0.6], [0.8, 15, 0.3], "red", o(2))); }
    return P;
  }
  const P = [P_box([0, 0, 0.3], [25, 15, 0.3], "red", o(1))];
  // gold border band, then the field, then a diamond medallion and corner dots
  for (const s of [-1, 1]) {
    P.push(P_box([0, s * 13.2, 0.5], [23.5, 0.9, 0.3], "gold", o(2)));
    P.push(P_box([s * 23.2, 0, 0.5], [0.9, 13.2, 0.3], "gold", o(2)));
    for (let k = -12; k <= 12; k += 4) P.push(P_box([s * 26.2, k, 0.3], [1.1, 0.7, 0.3], "gold", o(3)));   // fringe
  }
  P.push(xformPrims([P_box([0, 0, 0.7], [7, 7, 0.3], "gold", o(2))], mRotZ(Math.PI / 4), [0, 0, 0])[0]);
  P.push(xformPrims([P_box([0, 0, 0.9], [4.2, 4.2, 0.3], "red", o(2))], mRotZ(Math.PI / 4), [0, 0, 0])[0]);
  for (const [x, y] of [[-16, -8], [16, -8], [-16, 8], [16, 8]]) P.push(P_box([x, y, 0.7], [1.6, 1.6, 0.3], "gold", o(3)));
  return P;
}
// Bookcase: a tall case packed with books, a jar on top.
// v 1: the same case made a rack of pigeonholes for rolled maps and letters, two books
// and a rolled map lying on top (so the elder's two cases are not twins). Its front is
// painted pixel by pixel: modelled, the small round ends of the rolls came out as noise.
function bookcasePrims(v) {
  const P = [P_box([0, 0, 27], [16, 5, 27], "wood", { part: 1, grp: 1, tone: 1 })];
  if (v === 1) {
    // two books lying one on the other (their cream page edges between the covers) and a
    // map rolled up with a red tie
    for (const [x, y, z, hx, hy, m] of [[-7, 0, 54.9, 5.8, 3.8, "red"], [-5.2, 0.8, 56.8, 3.8, 2.7, "tunic"]]) {
      P.push(P_box([x, y, z], [hx, hy, 0.9], m, { part: 5, grp: 5, tone: 2 }));
      P.push(P_box([x + 0.4, y + 0.3, z], [hx - 0.5, hy - 0.2, 0.45], "plaster", { part: 6, grp: 5, tone: 4 }));
    }
    P.push(P_cyl([2, 0.5, 55.8], [13.5, 0.5, 55.8], 1.8, "plaster", { part: 7, grp: 7, tone: 3 }));
    P.push(P_cyl([7.2, 0.5, 55.8], [8.4, 0.5, 55.8], 2, "red", { part: 8, grp: 7, tone: 2 }));
    // the front: a frame of rails and stiles, nine dark pigeonholes holding rolled papers
    // seen from the side (two to a hole, some tied) or a roll and a folded, sealed letter,
    // and a plinth
    const W = 32, Hh = 35, g = [];
    for (let y = 0; y < Hh; y++) g.push(new Array(W).fill("f"));
    const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < W && y < Hh) g[y][x] = c; };
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x0 = 2 + c * 10, y0 = 2 + r * 10;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) put(x0 + x, y0 + y, "d");
      // a roll lying along the hole, cy its middle row; tie: column of its red band
      const side = (cy, a, b, tie) => {
        for (let x = a; x <= b; x++) { put(x0 + x, y0 + cy - 1, x === a || x === b ? "d" : "L"); put(x0 + x, y0 + cy, x === b ? "k" : "M"); put(x0 + x, y0 + cy + 1, x === a || x === b ? "d" : "S"); }
        if (tie !== undefined) for (const dy of [-1, 0, 1]) put(x0 + tie, y0 + cy + dy, "r");
      };
      const kind = [0, 1, 2, 1, 0, 1, 2, 0, 1][r * 3 + c];
      if (kind === 0) { side(6, 0, 7, 3); side(3, 1, 6); }
      else if (kind === 1) { side(6, 0, 6); side(3, 0, 7, 5); }
      else { side(6, 0, 7); for (let x = 1; x < 7; x++) for (let y = 2; y < 4; y++) put(x0 + x, y0 + y, y === 2 ? "L" : "M"); put(x0 + 4, y0 + 3, "r"); }   // a folded letter, sealed
    }
    // the lit edge of each rail and stile, and the plinth
    for (let x = 0; x < W; x++) for (const y of [0, 10, 20, 30]) if (g[y][x] === "f") g[y][x] = "F";
    for (let y = 0; y < Hh; y++) for (const x of [0, 10, 20, 30]) if (g[y][x] === "f") g[y][x] = "F";
    for (let x = 1; x < W - 1; x++) { g[32][x] = "p"; g[33][x] = "p"; g[34][x] = "q"; }
    const GC = { f: ["earth", 2], F: ["earth", 3], d: ["earth", 0], L: ["plaster", 4], M: ["plaster", 3], S: ["plaster", 2], k: ["earth", 1], r: ["red", 2], p: ["earth", 1], q: ["earth", 0] };
    const px = [];
    g.forEach((row, y) => row.forEach((ch, x) => px.push([x - 16, y - 17, GC[ch]])));
    return { prims: P, decals: [{ p: [0, 5, 27], face: [0, 1, 0], px, minFacing: 0.1, tol: 3 }] };
  }
  for (const z of [12, 26, 40]) P.push(P_box([0, 3.6, z], [14.5, 2.6, 0.9], "wood", { part: 2, grp: 1, tone: 2 }));
  const cols = [["red", 2], ["tunic", 2], ["gold", 2], ["leaf", 2], ["purple", 2], ["red", 1], ["earth", 3]];
  let i = 0;
  for (const z of [13, 27, 41]) for (let x = -12.5; x <= 12.5; x += 2.8) {
    if (hash2(Math.round(x * 3), z, 82) < 0.12) continue;
    const [m, t] = cols[(i++ * 5 + z) % cols.length];
    const tall = 8.5 + hash2(Math.round(x * 3), z, 83) * 3;
    P.push(P_box([x, 3.4, z + tall / 2 + 0.5], [1.2, 2.2, tall / 2], m === "earth" ? "wood" : m, { part: 3, grp: 3, tone: t }));
  }
  P.push(P_ell([8, 0, 56.5], [3, 3, 3.2], "red", { part: 4, grp: 4, tone: 2 }));
  return { prims: P };
}
// A plain chair.
function chairPrims() {
  const P = [P_box([0, 0, 10], [5.5, 5.5, 1.2], "wood", { part: 1, grp: 1, tone: 3 })];
  for (const [x, y] of [[-4.5, -4.5], [4.5, -4.5], [-4.5, 4.5], [4.5, 4.5]]) P.push(P_box([x, y, 5], [0.9, 0.9, 5], "wood", { part: 2, grp: 1, tone: 1 }));
  P.push(P_box([0, -5, 17], [5.5, 0.9, 6], "wood", { part: 3, grp: 1, tone: 2 }));
  return P;
}
// Spinning wheel: a spoked wheel standing face-on beside a low bench.
function wheelPrims() {
  const P = [
    P_box([6, 1, 6], [8, 5, 1.4], "wood", { part: 1, grp: 1, tone: 2 }),
    P_box([12, 4, 3], [1, 1, 3], "wood", { part: 1, grp: 1, tone: 1 }), P_box([12, -2, 3], [1, 1, 3], "wood", { part: 1, grp: 1, tone: 1 }),
    P_box([0, 1, 3], [1, 1, 3], "wood", { part: 1, grp: 1, tone: 1 }),
    P_box([-3, 0, 12], [1.1, 1.1, 12], "wood", { part: 2, grp: 2, tone: 1 }),
  ];
  // an open rim (the wall shows between the spokes)
  for (let i = 0; i < 14; i++) {
    const a0 = i * 2 * Math.PI / 14, a1 = (i + 1) * 2 * Math.PI / 14;
    P.push(P_cap([-3 + Math.cos(a0) * 9.5, 2.2, 20 + Math.sin(a0) * 9.5], [-3 + Math.cos(a1) * 9.5, 2.2, 20 + Math.sin(a1) * 9.5], 1.1, "wood", { part: 3, grp: 3, tone: 3 }));
  }
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 4;
    P.push(xformPrims([P_box([0, 0, 0], [8.4, 0.8, 0.8], "wood", { part: 5, grp: 3, tone: 2 })], mRotY(a), [-3, 2.2, 20])[0]);
  }
  P.push(P_cyl([-3, 1.6, 20], [-3, 3.2, 20], 1.8, "wood", { part: 6, grp: 3, tone: 1 }));
  P.push(P_ell([9, 1, 9], [3, 2.6, 2.4], "white", { part: 7, grp: 7, tone: 4 }));   // a hank of wool
  return P;
}
// A household blanket chest: a plain plank box, its front two light boards between dark
// corner posts and its flat lid a shade lighter with plank joints, and a small red wool
// blanket folded on it, its fringe hanging at the lid's edge. No iron, no lock, no
// rounded lid: bound in iron with a gold lock plate it read as a dungeon's treasure
// chest. (A flat blue quilt on it read as a screen; a blanket spread over the whole lid
// with its end hanging down the front read as a red padded box, and its front in the
// floor's brown vanished into the floor.)
function chestPrims() {
  const dy = 5.8;
  const bodyTex = (q, n) => {
    if (n[2] > 0.5) return 0;
    if (q[2] > 13 || Math.abs(q[2] - 7.4) < 0.5) return -3;      // under the lid, between the boards
    return Math.abs(q[0]) > 8.6 ? -1.2 : 0;                      // corner posts
  };
  const lidTex = (q, n) => (n[2] > 0.5 && q[1] > -dy && ((q[1] + dy + 0.7) % 4.4) < 1.3 ? -1.7 : 0);
  const P = [
    P_box([0, 0, 0.9], [10.8, dy + 0.2, 0.9], "wood", { part: 1, grp: 1, tone: 3 }),
    P_box([0, 0, 7.6], [11, dy, 6.2], "wood", { part: 1, grp: 1, tone: 4.2, tex: bodyTex }),
    P_box([0, 0, 14.4], [11.8, dy + 0.7, 0.8], "wood", { part: 2, grp: 2, tone: 3.3, tex: lidTex }),
  ];
  // the folded blanket, painted pixel by pixel on the lid (left of centre, so lid shows on
  // all four sides): its top lit, one woven stripe across it, two fold edges on its front,
  // the fringe hanging at the lid's edge, its shadow falling to the right
  // (O outline, D/M/L dark/mid/light wool, s shadow on the lid)
  const ART = [
    ".OOOOOOOOO..",
    "OLLLLLLMLLO.",
    "OLLLLLLMLMOs",
    "OLLLLLLMMMOs",
    "OMMMMMMDMDOs",
    "ODDDDDDDDDOs",
    "OLMMMMMDMDOs",
    ".OMOMOMOMOs.",
    "..O.O.O.O...",
  ];
  const C = { O: ["red", 0], D: ["red", 1], M: ["red", 2], L: ["red", 3], s: ["earth", 3] };
  const px = [];
  ART.forEach((row, y) => [...row].forEach((ch, x) => { if (C[ch]) px.push([x - 7, y - 3, C[ch]]); }));
  return { prims: P, decals: [{ p: [0, 0, 15.2], face: [0, 0, 1], px, minFacing: 0.1, tol: 3 }] };
}
// Toys on the floor: three painted blocks and a ball.
function toysPrims() {
  const P = [];
  // rockers
  for (const sy of [-1, 1]) for (let k = 0; k < 5; k++) {
    const a0 = -0.9 + k * 0.45, a1 = a0 + 0.45;
    P.push(P_cap([Math.sin(a0) * 10, sy * 3, 5 - Math.cos(a0) * 5], [Math.sin(a1) * 10, sy * 3, 5 - Math.cos(a1) * 5], 0.9, "wood", { part: 1, grp: 1, tone: 1 }));
  }
  for (const [x, y] of [[-4, -3], [4, -3], [-4, 3], [4, 3]]) P.push(P_cap([x, y, 1.5], [x * 0.8, y * 0.8, 8], 0.9, "wood", { part: 2, grp: 2, tone: 2 }));
  P.push(P_ell([0, 0, 10], [7, 3.4, 3], "wood", { part: 3, grp: 3, tone: 3 }));
  P.push(P_cap([6, 0, 11], [8.5, 0, 16.5], 1.9, "wood", { part: 4, grp: 3, tone: 3 }));
  P.push(P_ell([9.8, 0, 17.2], [3.2, 2, 2.2], "wood", { part: 4, grp: 3, tone: 3 }));
  P.push(P_cap([7, 0, 17], [5, 0, 14], 1.1, "red", { part: 5, grp: 3, tone: 2 }));          // mane
  // a cloth ball sewn from four bright patches, dark stitched seams between them (a plain
  // grey ball read as something to pick up; five facets round a white centre, as a gem);
  // its body only carries the painted patches
  const r = 3.7, c = [-11, 7, r];
  P.push(P_ell(c, [r, r, r], "red", { part: 6, grp: 6, tone: 2 }));
  const PATCH = [["red", 3, 2, 1], ["gold", 3, 2, 1], ["cloth", 3, 2, 1], ["green", 4, 3, 2]];
  const px = [];
  for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
    const d = Math.hypot(dx + 0.5, dy + 0.5);
    if (d > r) continue;
    const lit = dx + dy < -2 ? 1 : dx + dy > 2 ? 3 : 2;
    const a = (Math.atan2(dy + 0.5, dx + 0.5) + Math.PI * 2 - 0.35) % (Math.PI * 2);
    const k = Math.floor(a / (Math.PI / 2)), off = (a - k * Math.PI / 2) * d;
    const p = PATCH[k % 4];
    // a seam runs along the start of each patch, stitched (every other pixel)
    if (off < 0.8 && d > 0.9 && ((dx + dy) & 1) === 0) { px.push([dx, dy, [p[0], p[3] - 1 < 0 ? 0 : p[3] - 1]]); continue; }
    px.push([dx, dy, [p[0], p[lit]]]);
  }
  const TC = [0, Math.cos(50 * Math.PI / 180), Math.sin(50 * Math.PI / 180)];
  return { prims: P, decals: [{ p: [c[0], c[1] + r * TC[1], c[2] + r * TC[2]], face: TC, px, minFacing: 0.1, tol: 3 }] };
}
// The children's toy box: an open, lidless crate painted with a star, toys poking over
// its rim (a doll, two blocks, a wooden sword), so it never reads as a dungeon's
// treasure chest (no lid, no lock, no iron).
function toyboxPrims() {
  const wall = (c, h) => P.push(P_box(c, h, "red", { part: 1, grp: 1, tone: 2, tex: plankTex }));
  const P = [];
  wall([0, 6.2, 6], [11, 0.8, 6]); wall([0, -6.2, 6], [11, 0.8, 6]);
  for (const s of [-1, 1]) wall([s * 10.2, 0, 6], [0.8, 5.4, 6]);
  P.push(P_box([0, 0, 8], [9.4, 5.4, 0.4], "wood", { part: 2, grp: 2, tone: 0, flat: true, line: false }));
  P.push(xformPrims([P_box([0, 0, 0], [2.7, 2.7, 2.7], "leaf", { part: 5, grp: 5, tone: 3 })], mRotZ(0.5), [-4.5, 1.5, 11.5])[0]);
  P.push(xformPrims([P_box([0, 0, 0], [2.4, 2.4, 2.4], "tunic", { part: 6, grp: 5, tone: 2 })], mRotZ(-0.35), [0.5, 2.5, 11])[0]);
  P.push(P_ell([5.5, -1, 13.5], [2.8, 2.6, 2.8], "skin", { part: 7, grp: 7, tone: 2 }));
  P.push(P_ell([5.5, -1.6, 15.1], [3, 2.6, 1.9], "hair", { part: 8, grp: 7, tone: 3 }));
  P.push(P_cap([-7, -2, 9], [-9.5, -5, 23], 0.8, "wood", { part: 9, grp: 9, tone: 3 }));
  P.push(P_cap([-11, -3.8, 18], [-6.6, -3.4, 17.3], 0.7, "wood", { part: 9, grp: 9, tone: 2 }));
  const star = [];
  ["..y..", "yyyyy", ".yyy.", ".y.y."].forEach((row, y) => [...row].forEach((ch, x) => { if (ch === "y") star.push([x - 2, y - 2, ["gold", 3]]); }));
  return { prims: P, decals: [{ p: [0, 7, 6], face: [0, 1, 0], px: star, minFacing: 0.1, tol: 3 }] };
}
// A little stack of painted wooden blocks: two side by side and one across them, square
// to the room (turned, the top one read as a ball or a lump of cheese and the blue one's
// faces broke into a checker), each with a letter or a mark painted on its front.
function blocksPrims() {
  const P = [
    P_box([-4.3, 0, 4], [4, 4, 4], "red", { part: 1, grp: 1, tone: 2 }),
    P_box([4.3, 1.5, 3.8], [3.8, 3.8, 3.8], "tunic", { part: 2, grp: 2, tone: 2 }),
    P_box([0.8, 0.2, 11.6], [3.6, 3.6, 3.6], "thatch", { part: 3, grp: 3, tone: 3 }),       // (matt yellow: the shiny gold ramp dithered)
  ];
  const glyph = (rows, cols, p) => {
    const px = [];
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (cols[ch]) px.push([x - 1, y - 1, cols[ch]]); }));
    return { p, face: [0, 1, 0], px, minFacing: 0.1, tol: 3 };
  };
  const decals = [
    glyph([".w.", "www", "w.w"], { w: ["white", 0] }, [-4.3, 4, 4]),
    glyph([".y.", "yyy", ".y."], { y: ["gold", 3] }, [4.3, 5.3, 3.8]),
    glyph(["c.c", ".c.", "c.c"], { c: ["cloth", 1] }, [0.8, 3.8, 11.6]),
  ];
  return { prims: P, decals };
}
// A potted plant: a terracotta flowerpot - a straight body tapering to its foot, a
// turned rim lit round its mouth and a line of dark soil inside it - with a leafy tuft
// standing up out of the back of the mouth. (A round pot under a round clump of leaves
// read as a strawberry or an acorn.) The soil is the darkest brown with a few reddish
// crumbs: in the floor's own brown the pot looked hollow, the floor showing through it.
function plantPrims() {
  const P = [
    P_frustum([0, 0, 0], [0, 0, 7.2], 3.3, 4.6, "red", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, 0, 7], [0, 0, 9], 5.4, "red", { part: 1, grp: 1, tone: 3 }),
    P_cyl([0, 0, 8.9], [0, 0, 9.2], 4.3, "bark", { part: 2, grp: 1, tone: 0, flat: true, line: false }),
  ];
  // stems, then the leaves held up off the soil, leaving a line of it in front
  for (const [x, y] of [[-2, -0.6], [1.8, -1], [0, -1.8]]) P.push(P_cap([x * 0.3, -0.6, 9], [x, y, 13], 0.55, "leafD", { part: 3, grp: 3, tone: 2, line: false }));
  for (const [x, y, z, r] of [[0, -0.2, 14.8, 4.2], [-3.4, 0.2, 12.6, 3], [3.4, 0, 13, 3], [0.4, -1.6, 18, 2.8]]) P.push(P_ell([x, y, z], [r, r * 0.85, r * 0.9], "leaf", { part: 4, grp: 3, tone: 3, line: false }));
  const crumbs = [[-3, 1, ["red", 1]], [1, 1, ["hair", 1]], [-1, 2, ["red", 1]], [2, 0, ["red", 1]]];
  return { prims: P, decals: [{ p: [0, 0, 9.2], face: [0, 0, 1], px: crumbs, minFacing: 0.1, tol: 2.5 }] };
}
// A child's bed: shorter, with a patched quilt.
function cotPrims() {
  return [
    P_box([0, 0, 5.5], [11, 17, 5.5], "wood", { part: 1, grp: 1, tone: 3 }),
    P_box([0, -18, 11], [11.5, 1.6, 11], "wood", { part: 2, grp: 1, tone: 3 }),
    P_box([0, 1, 11.5], [9.5, 15.5, 1.8], "white", { part: 3, grp: 3, tone: 4 }),
    P_box([0, 5, 12.8], [10, 11.5, 1.4], "red", { part: 4, grp: 3, tone: 3, tex: (q) => ((Math.floor((q[0] + 40) / 5) + Math.floor((q[1] + 40) / 5)) & 1) ? -0.8 : 0.3 }),
    P_ell([0, -11, 13.5], [6, 3.5, 2.2], "white", { part: 5, grp: 3, tone: 4 }),
  ];
}

// Clay pot: round belly, narrow neck, a turned lip and a dark mouth.
function potPrims() {
  return [
    P_ell([0, 0, 7], [8, 8, 7], "red", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, 0, 11.5], [0, 0, 14.5], 4.4, "red", { part: 2, grp: 1, tone: 2 }),
    P_cyl([0, 0, 14.3], [0, 0, 16.3], 5.6, "red", { part: 3, grp: 1, tone: 3 }),
    P_cyl([0, 0, 16.2], [0, 0, 16.5], 3.9, "redD", { part: 4, grp: 1, tone: 0, flat: true, line: false }),
  ];
}
