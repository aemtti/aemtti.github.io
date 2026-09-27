"use strict";
// ---------- Enemy and boss models (built from primitives, same camera and light) ----------
// Authored facing +y like the hero; facing is applied by yaw. Sizes follow the
// ratio table in style_guide.md (hero = 31 px on screen).

Object.assign(MATS, {
  dune:   { ramp: "plaster", base: 3 },
  ember:  { ramp: "gold", base: 3, shiny: true },
  shadow: { ramp: "purple", base: 1 },
  bone:   { ramp: "stone", base: 4 },
});

function yawed(P, dir) { return xformPrims(P, mRotZ(yawOf(dir))); }
function eyeDecals(pts, yaw, col, face) {
  return pts.map(p => ({ p: yawPt(p, yaw), face: yawPt(face || [0, 1, 0.2], yaw), px: [[0, 0, col], [0, 1, col]], minFacing: 0.15 }));
}

// Rock-slinging imp in a patched red hood (about 0.85x the hero). The red keeps it off
// brown cliffs and sand; the hood turns toward the viewer in profile like everyone's
// head, so its dark opening and glowing eyes read from the side too.
// A hat's or hood's point that flops over: it bends the same way in every facing (back,
// away from the viewer, and a little to the right, as the front view shows it) and ends
// as high on screen as it does from the front, so the figure keeps one height as it turns.
// (flopping "backward" with the head, the point leaned away from the camera from the front
// and toward it from behind, and the figure came 2-4 px shorter from behind)
// base: the point's root on the head (model space, head not yet turned); flop: the bend
// as authored for the front view; HTof(d): the head's turn and tilt for facing d.
function floppedTip(dir, base, flop, HTof, pivot) {
  const move = (d, p) => vAdd(pivot, mVec(HTof(d), vSub(p, pivot)));
  const flopW = mVec(HTof(DOWN), flop);
  const tipOf = (d) => { const b = move(d, base); return [b, vAdd(b, mVec(mRotZ(-yawOf(d)), flopW))]; };
  const scr = (d, p) => mVec(mRotZ(yawOf(d)), p)[1] * SIN_P - p[2] * COS_P;
  const [b, e] = tipOf(dir);
  e[2] += (scr(dir, e) - scr(DOWN, tipOf(DOWN)[1])) / COS_P;
  return [b, e];
}
function casterPrims(dir, frame) {
  const P = [];
  // (in profile the feet stand closer together: the near boot, a full step toward the
  // viewer, reached a pixel below the front view's hem)
  const prof = dir === LEFT || dir === RIGHT;
  for (const sx of [-1, 1]) P.push(P_ell([sx * 3.2 * (prof ? 0.55 : 1), 0, 2.2], [2.6, 3.2, 2.2], "boot", { part: 1, grp: 10 + sx }));
  // a cloak flaring to a hem, with folds running down it and a darker hem band, under a
  // short capelet whose edge draws a line below the hood (a round body under a round
  // hood read, from behind, as a pointed heap of earth)
  const cloak = (q) => ((((Math.atan2(q[1], q[0]) + 4) * 2.4) % 1) < 0.15 ? -0.9 : 0) + (q[2] < 5.0 ? -0.9 : 0) + (hash2(Math.floor(q[0] / 4 + 9), Math.floor(q[2] / 4), 91) < 0.12 ? 0.7 : 0);
  P.push(P_frustum([0, 0, 3.2], [0, 0, 12.5], 6.4, 5.6, "red", { part: 2, grp: 2, tone: 1, tex: cloak }));
  P.push(P_ell([0, 0, 12.2], [5.9, 5.6, 2.6], "red", { part: 2, grp: 2, tone: 1 }));
  P.push(P_cyl([0, 0, 8.4], [0, 0, 9.8], 6.15, "leather", { part: 2, grp: 2, tone: 2, line: false }));
  P.push(P_frustum([0, 0.1, 11.6], [0, 0.2, 15.6], 7.1, 5.2, "red", { part: 9, grp: 9, tone: 2 }));
  const Hd = [
    P_ell([0, 0.4, 19.6], [6.4, 6.0, 5.8], "red", { part: 3, grp: 3, tone: 2 }),
    P_ell([0, 5.2, 19.2], [3.9, 1.6, 3.4], "ink", { part: 4, grp: 3, flat: true, line: false }),
  ];
  const HTof = (d) => mMul(mRotZ(HEAD_TURN[d]), mRotX(HEAD_TILT[d] * 0.6)), HT = HTof(dir), pivot = [0, 0.4, 15];
  for (const q of Hd) P.push(xformPrims([q], HT, vSub(pivot, mVec(HT, pivot)))[0]);
  // the hood's point flops back and to one side (pointing straight back it was seen
  // end-on from behind and read as a hole in the hood)
  // (mostly upward, so the point also shows from behind)
  const [hp0, hp1] = floppedTip(dir, [0.3, -1.0, 23.8], [1.5, -0.2, 8.7], HTof, pivot);
  P.push(P_cone(hp0, hp1, 3.0, 0.7, "red", { part: 3, grp: 3, tone: 2 }));
  const headMove = (p) => vAdd(pivot, mVec(HT, vSub(p, pivot)));
  // (seen from behind the stone is held out at the side, so it still shows)
  // (facing left that hand is the far one, and held out ahead of him the stone rose on
  // screen to his face: it hangs lower there, at the waist, half behind his body)
  const rHand = frame ? [-5.4, -2.0, 25.5] : dir === UP ? [-8.4, 2.2, 9.5] : dir === LEFT ? [-1.5, 6.0, 4.6] : [-5.6, 5.6, 10.5];
  P.push(P_cap([-6.2, 0.4, 15], rHand, 1.8, "red", { part: 5, grp: 5, tone: 1 }));
  P.push(P_ell(rHand, [3.3, 3.3, 3.1], "stone", { part: 6, grp: 6, tone: 3, tex: stoneTex }));
  // (facing left the pouch hand is the near one: held a little higher and closer, so the
  // pouch does not hang below the hem, lower than his feet in the other facings)
  const lHand = dir === LEFT ? [6.4, 2.4, 11] : [7.2, 2.4, 9.5], pouch = dir === LEFT ? [6.0, 2.8, 8.4] : [7.0, 2.8, 6.8];
  P.push(P_cap([6.2, 0.4, 15], lHand, 1.8, "red", { part: 7, grp: 7, tone: 1 }));
  P.push(P_ell(pouch, [3.2, 2.6, 3.0], "wood", { part: 8, grp: 7, tone: 1 }));
  const yaw = yawOf(dir), face = mVec(HT, [0, 1, 0.2]);
  return { prims: yawed(P, dir), decals: eyeDecals([[-1.5, 6.8, 19.6], [1.5, 6.8, 19.6]].map(headMove), yaw, ["gold", 3], face) };
}

// Sand maw: a mound while it tunnels, a ringed worm with a toothed mouth when up.
function mawPrims(state, frame) {
  const P = [];
  const crack = (q, n) => (n[2] > 0.3 && Math.abs(vnoise(q[0] * 0.35 + 4, q[1] * 0.35, 93) - 0.5) < 0.05 ? -1.2 : 0);
  if (state === "mound") {
    P.push(P_ell([0, 0, 1.2], [11, 8.5, 4.4], "dune", { part: 1, grp: 1, tone: 2, tex: crack }));
    P.push(P_ell([0.5, 0.5, 3.8], [6, 4.6, 3], "dune", { part: 1, grp: 1, tone: 2, tex: crack }));
    return { prims: P, decals: [] };
  }
  const open = frame ? 1.4 : 0;
  P.push(P_ell([0, 0, 0.8], [12, 9.5, 2.6], "dune", { part: 1, grp: 1, tone: 1 }));
  P.push(P_cap([0, 0, 1.5], [0, 1.2, 13.5], 7.2, "red", { part: 2, grp: 2, tone: 3, tex: (q) => (((q[2] + 40) % 4.2) < 0.9 ? -1 : 0) }));
  P.push(P_ell([0, 2.2, 16.2], [8.4, 7.4, 6.4], "red", { part: 3, grp: 3, tone: 3 }));
  for (let i = 0; i < 5; i++) {
    const a = -1.1 + i * 0.55;
    P.push(P_cone([Math.sin(a) * 6.5, -3.5, 19 + Math.cos(a) * 2], [Math.sin(a) * 8.5, -6.5, 23 + Math.cos(a) * 3], 1.6, 0.3, "gold", { part: 4, grp: 3, tone: 2 }));
  }
  P.push(P_ell([0, 8.4, 15.4], [5.0, 1.4, 3.4 + open], "redD", { part: 5, grp: 5, tone: 0, flat: true, line: false }));
  const decals = [];
  for (const x of [-3, -1, 1, 3]) {
    decals.push({ p: [x, 9.0, 18.4 + open * 0.7], face: [0, 1, 0.1], px: [[0, 0, "white"]], minFacing: 0.2, tol: 4 });
    decals.push({ p: [x, 9.0, 12.4 - open * 0.7], face: [0, 1, 0.1], px: [[0, 0, "white"]], minFacing: 0.2, tol: 4 });
  }
  for (const s of [-1, 1]) decals.push({ p: [s * 4.4, 7.4, 20.0], face: [s * 0.3, 1, 0.3], px: [[0, 0, ["gold", 3]]], minFacing: 0.2 });
  return { prims: P, decals };
}

// Cave bat: furred body, leathery wings up (0) or down (1). Drawn in the air.
function batPrims(frame) {
  const P = [];
  P.push(P_ell([0, 0, 0], [3.6, 3.2, 4.0], "shadow", { part: 1, grp: 1, tone: 2 }));
  for (const s of [-1, 1]) {
    P.push(P_cone([s * 1.8, 0.6, 3.0], [s * 2.8, 0.4, 6.6], 1.3, 0.3, "shadow", { part: 1, grp: 1, tone: 2 }));
    const up = frame ? -0.55 : 0.75;
    const wing = P_ell([s * 7.6, -0.4, 1.2 + (frame ? -2 : 2.4)], [6.6, 1.0, 3.8], "shadow", { part: 2, grp: 2, tone: 1, rot: mRotY(s * up) });
    P.push(wing);
    P.push(P_ell([s * 11.6, -0.4, 0.6 + (frame ? -4.4 : 5.8)], [2.4, 0.9, 1.4], "shadow", { part: 2, grp: 2, tone: 1, rot: mRotY(s * up) }));
  }
  const decals = [-1, 1].map(s => ({ p: [s * 1.4, 3.1, 0.9], face: [0, 1, 0.1], px: [[0, 0, ["red", 3]]], minFacing: 0.2 }));
  decals.push({ p: [0, 3.2, -1.4], face: [0, 1, 0], px: [[-1, 0, "white"], [1, 0, "white"]], minFacing: 0.2 });
  return { prims: P, decals };
}

// Healing wisp: a pale glowing mote with two pairs of wings.
function wispPrims(frame) {
  const P = [P_ell([0, 0, 0], [3.6, 3.6, 3.6], "white", { part: 1, grp: 1, tone: 4 })];
  for (const s of [-1, 1]) for (const [z, r] of [[1.4, 1], [-1.2, 0.7]]) {
    const a = (frame ? 0.9 : 0.35) * s;
    P.push(P_ell([s * 4.4, -0.6, z], [3.4 * r, 0.5, 2.0 * r], "teal", { part: 2, grp: 2, tone: 4, rot: mRotY(a), line: false }));
  }
  return { prims: P, decals: [] };
}

// Ooze (large, splits) and oozelet (small). Squashes when it hops.
function oozeletPrims(frame) {
  const sq = frame ? 0.8 : 0;
  const P = [
    P_ell([0, 0, 3.8 - sq * 0.5], [5.4 + sq, 4.8 + sq, 4.2 - sq], "slime", { part: 1, grp: 1, tone: 3 }),
    P_ell([0, 0.3, 1.1], [5.9 + sq, 5.2 + sq, 1.2], "slime", { part: 1, grp: 1, tone: 2 }),
  ];
  const decals = [-1, 1].map(s => ({ p: [s * 1.8, 3.9 + sq * 0.2, 4.6 - sq], face: [0, 1, 0.3], px: [[0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.1 }));
  decals.push({ p: [-2.6, 0.8, 7.2 - sq], face: [-0.4, 0.2, 0.9], px: [[0, 0, "white"]], minFacing: 0.1 });
  return { prims: P, decals };
}

// Hexer: a robed spell-thrower under a broad pointed hat; raises the staff to cast.
function hexerPrims(dir, frame) {
  const P = [];
  // (the robe stands centred under him, so its hem comes as low from behind as from the front)
  P.push(P_cone([0, 0, 21], [0, 0, 1.5], 4.2, 8.6, "purple", { part: 1, grp: 1, tone: 2, tex: (q) => (((Math.atan2(q[1], q[0]) + 4) * 2.2) % 1 < 0.12 ? -0.8 : 0) }));
  P.push(P_cyl([0, 0, 0], [0, 0, 2.2], 8.8, "purple", { part: 1, grp: 1, tone: 1 }));
  P.push(P_ell([0, 0, 21.5], [6.6, 4.6, 3.4], "purple", { part: 2, grp: 1, tone: 2 }));
  // the shadowed face and the hat turn toward the viewer in profile (like every head);
  // the hat's crown rises straight and its tip flops to one side, so it stays a
  // point from behind as well as from the front
  const Hd = [
    P_ell([0, 1.4, 25.2], [4.4, 4.4, 4.2], "ink", { part: 3, grp: 3, flat: true }),
    P_cyl([0, 0.4, 30.2], [0, 0.4, 31.2], 7.8, "purple", { part: 4, grp: 4, tone: 1 }),
    P_cone([0, 0.2, 31], [0.4, -0.6, 40.5], 5.8, 3.0, "purple", { part: 4, grp: 4, tone: 2 }),
    P_cyl([0, 0.3, 31.6], [0, 0.3, 33.0], 5.95, "gold", { part: 5, grp: 4, tone: 2, line: false }),
  ];
  const HTof = (d) => mMul(mRotZ(HEAD_TURN[d]), mRotX(HEAD_TILT[d] * 0.4)), HT = HTof(dir), pivot = [0, 0.4, 22];
  for (const q of Hd) P.push(xformPrims([q], HT, vSub(pivot, mVec(HT, pivot)))[0]);
  // (the hat's tip bends the same way and ends at the same height in every facing: from
  // behind the hat was 4 px shorter than from the front)
  const [hp0, hp1] = floppedTip(dir, [0.4, -0.6, 40.2], [0.5, -1.6, 7.3], HTof, pivot);
  P.push(P_cone(hp0, hp1, 3.1, 0.5, "purple", { part: 4, grp: 4, tone: 2 }));
  const headMove = (p) => vAdd(pivot, mVec(HT, vSub(p, pivot)));
  // sleeves and hands; the staff in the right hand, lifted forward while casting
  const rHand = frame ? [-6.2, 6.6, 21] : [-7.6, 2.4, 13];
  P.push(P_cap([-5.6, 0, 20.5], rHand, 2.4, "purple", { part: 6, grp: 6, tone: 2 }));
  P.push(P_ell(rHand, [1.8, 1.8, 1.8], "skin", { part: 6, grp: 6, tone: 0 }));
  const sTop = vAdd(rHand, frame ? [0.4, 1.6, 17] : [0, 0.4, 19]), sBot = vAdd(rHand, frame ? [-0.3, -1.2, -12] : [0, -0.2, -12.5]);
  P.push(P_cap(sBot, sTop, 0.9, "wood", { part: 7, grp: 7, tone: 1 }));
  P.push(P_ell(vAdd(sTop, [0, 0, 1.6]), [2.2, 2.2, 2.4], frame ? "white" : "purple", { part: 8, grp: 7, tone: frame ? 4 : 3 }));
  P.push(P_cap([5.6, 0, 20.5], [7.2, 2.6, 13.5], 2.4, "purple", { part: 9, grp: 9, tone: 2 }));
  const yaw = yawOf(dir);
  return { prims: yawed(P, dir), decals: eyeDecals([[-1.6, 5.7, 25.2], [1.6, 5.7, 25.2]].map(headMove), yaw, ["gold", 3], mVec(HT, [0, 1, 0])) };
}

// Clutch: a grasping shadow-hand that creeps along the walls.
function clutchPrims(frame) {
  const P = [P_ell([0, -1, 4.2], [7.2, 6.4, 3.2], "shadow", { part: 1, grp: 1, tone: 2 })];
  const curl = frame ? 1 : 0;
  for (let i = 0; i < 4; i++) {
    const x = -4.8 + i * 3.2;
    const k = [P_cap([x, 3.4, 4.8], [x * 1.25, 9.2 - curl * 1.2, 5.4 + curl * 3.2], 1.45, "shadow", { part: 2 + i, grp: 2 + i, tone: 2 })];
    k.push(P_cap(k[0].b, [x * 1.3, 11.4 - curl * 3.2, 3.8 + curl * 3.6], 1.25, "shadow", { part: 2 + i, grp: 2 + i, tone: 2 }));
    P.push(...k);
  }
  P.push(P_cap([6.4, -0.4, 4.4], [10.2, 2.8 - curl, 5.4], 1.6, "shadow", { part: 7, grp: 7, tone: 2 }));
  const decals = [0, 1, 2, 3].map(i => ({ p: [(-4.8 + i * 3.2) * 1.1, 10.4 - curl * 6.2, 5.4 + curl * 3.2], face: [0, 0.6, 0.8], px: [[0, 0, ["red", 3]]], minFacing: 0.1, tol: 4 }));
  return { prims: P, decals };
}

// Blade trap: a studded iron block with spikes on every side.
function spikeTrapPrims() {
  const P = [P_box([0, 0, 6.5], [8.5, 8.5, 6.5], "iron", { part: 1, grp: 1, tone: 2, tex: (q, n) => n[2] > 0.5 ? ((Math.abs(q[0]) < 3 && Math.abs(q[1]) < 3) ? 0.8 : 0) : 0 })];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    for (const o of [-4, 4]) {
      const base = [dx * 8.2 + (dy ? o : 0), dy * 8.2 + (dx ? o : 0), 6.5];
      P.push(P_cone(base, vAdd(base, [dx * 5.2, dy * 5.2, 0]), 2.3, 0.3, "steel", { part: 2, grp: 2 }));
    }
  }
  for (const [x, y] of [[-4, -4], [4, -4], [-4, 4], [4, 4]]) P.push(P_cone([x, y, 12.8], [x, y, 17.4], 1.9, 0.3, "steel", { part: 3, grp: 2 }));
  return { prims: P, decals: [] };
}

// Sand scarab: a gilded beetle with a split carapace, mandibles and six legs.
function scarabPrims(dir, frame, charging) {
  const P = [];
  const lift = frame ? 0.8 : 0;
  for (const s of [-1, 1]) for (const [y, ph] of [[4, 0], [0, 1], [-4, 0]]) {
    const up = (ph ^ frame) ? lift : 0;
    P.push(P_cap([s * 5, y, 3.5], [s * 9.5, y + (y > 0 ? 1.5 : y < 0 ? -1.5 : 0), 0.8 + up], 0.9, "hair", { part: 1, grp: 10 + s, tone: 0 }));
  }
  P.push(P_ell([0, -1, 5.5], [7.2, 8.5, 4.6], "gold", { part: 2, grp: 2, tone: 2, shiny: true, tex: (q) => (Math.abs(q[0]) < 0.55 ? -1.5 : 0) }));
  P.push(P_ell([0, 7.5, 4.2], [4.2, 3.2, 3.2], "hair", { part: 3, grp: 3, tone: 1 }));
  for (const s of [-1, 1]) P.push(P_cone([s * 2.2, 9.5, 4], [s * (charging ? 3.6 : 1.2), 13.5, 3.6], 1.1, 0.3, "bone", { part: 4, grp: 3, tone: 3 }));
  const yaw = yawOf(dir);
  return { prims: yawed(P, dir), decals: eyeDecals([[-1.8, 10.2, 5.2], [1.8, 10.2, 5.2]], yaw, ["red", 3], [0, 1, 0.3]) };
}
// Chiller: a floating shard of living ice with a pale face; crystals flare when it casts.
function chillerPrims(frame, casting) {
  // a cluster of ice crystals: one tall spike with the face in it and four smaller
  // ones leaning out in pairs round it (a round body read as a blue slime; an uneven
  // cluster read as a gloved hand), over a point beneath. Each crystal is cut in two
  // facets: pale on the lit left, deep blue on the right, so it shows on the ice floor.
  const facet = (q, n) => (n[0] < -0.15 ? 1.2 : n[0] > 0.3 ? -1 : 0.2);
  const P = [
    P_cone([0, 0, -1], [0, 0, 16], 4.8, 0.2, "teal", { part: 1, grp: 1, tone: 3, tex: facet }),
    P_cone([0, 0, 1], [0, 0, -9], 4.4, 0.3, "teal", { part: 1, grp: 1, tone: 1, tex: facet }),
  ];
  const spread = casting ? 1.5 : (frame ? 1.12 : 1);
  for (const [x, y, h, r] of [[-1, -0.6, 11, 2.6], [1, -0.6, 11, 2.6], [-1, 0.7, 7, 2.2], [1, 0.7, 7, 2.2]]) {
    const out = y < 0 ? 6.5 : 8;
    P.push(P_cone([x * 2.6, y * 2, 0.5], [x * out * spread, y * 5, h * (casting ? 0.85 : 1)], r, 0.2, "teal", { part: 2, grp: 2, tone: 3, tex: facet }));
  }
  if (casting) for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    P.push(P_cone([Math.cos(a) * 3, Math.sin(a) * 3, 3], [Math.cos(a) * 11, Math.sin(a) * 11, 5], 1.4, 0.2, "white", { part: 3, grp: 3, tone: 4 }));
  }
  const decals = [-1, 1].map(s => ({ p: [s * 1.6, 4.2, 5.2], face: [0, 1, 0.2], px: [[0, 0, "ink"], [0, 1, "ink"], [0, -1, ["water", 4]]], minFacing: 0.1, tol: 5 }));
  decals.push({ p: [0, 4.2, 2.2], face: [0, 1, 0], px: [[-1, 0, "ink"], [0, 0, "ink"], [1, 0, "ink"]], minFacing: 0.1, tol: 5 });
  decals.push({ p: [-1.6, 2, 11], face: [-0.5, 0.4, 0.8], px: [[0, 0, "white"], [0, 1, "white"], [0, 2, "white"]], minFacing: 0.05, tol: 6 });
  return scaleModel({ prims: P, decals }, 1.3);
}
// Fire imp: a pot-bellied red imp with horns and a flame for hair.
function fireImpPrims(dir, frame, throwing) {
  // a pot-bellied red imp with short arms and feet, horns and a flame for hair (limbless
  // it read as a burning clay pot); its head turns to the viewer in profile like everyone's
  const P = [];
  const crouch = frame ? -1.2 : 0;
  const prof = dir === LEFT || dir === RIGHT;
  // (in profile the feet stand one ahead and one behind, side by side on screen at the
  // same depth: stacked one in front of the other they pinched the body to a point at
  // the bottom and the near one hung a pixel low)
  for (const s of [-1, 1]) {
    // (a little toward the viewer, so they show below the round belly)
    const cs = dir === RIGHT ? -1 : 1;
    const hip = prof ? [cs * 0.4, s * 2.6, 5 + crouch] : [s * 2.6, 0, 5 + crouch], ft = prof ? [cs * 0.6, s * 4.2, 1.3] : [s * 3.1, 0.3, 1.3];
    P.push(P_cap(hip, [ft[0], ft[1] * 0.95, 2], 1.4, "red", { part: 1, grp: 10 + s, tone: 1 }));
    P.push(P_ell(ft, [2.1, 2.1, 1.4], "redD", { part: 1, grp: 10 + s, tone: 0 }));
  }
  // (a round belly the same width from every side, feet under it and the flame straight
  // up, so it keeps one height when it turns)
  P.push(P_ell([0, 0, 8.5 + crouch], [5.4, 6.4, 5.8], "red", { part: 2, grp: 2, tone: 2 }));
  P.push(P_ell([0, 2, 7.5 + crouch], [3.3, 2.9, 3.4], "ember", { part: 3, grp: 2, tone: 2, line: false }));
  // (in profile the horns sweep back instead of out to the sides: pointing sideways the
  // far one stood up behind the flame and made the side view taller than the front)
  const horn = (s) => prof ? [[s * 1.8, -1.2, 18.3 + crouch], [s * 2.2, -3.8, 21 + crouch]] : [[s * 3, 0, 18.5 + crouch], [s * 4.6, 0, 22.5 + crouch]];
  const Hd = [
    P_ell([0, 0.8, 15.5 + crouch], [4.6, 4.2, 4.2], "red", { part: 4, grp: 4, tone: 2 }),
    P_cone([0, 0, 19 + crouch], [0, 0, 25.5 + crouch], 2.8, 0.3, "ember", { part: 6, grp: 6, tone: 3 }),
  ];
  const Hn = [P_cone(...horn(-1), 1.2, 0.2, "bone", { part: 5, grp: 4, tone: 3 }), P_cone(...horn(1), 1.2, 0.2, "bone", { part: 5, grp: 4, tone: 3 })];
  // (in profile its head turns further toward the viewer than a person's: turned as far
  // as the hero's, its eyes sat right on the edge of its round head and were lost)
  const HT = mRotZ(HEAD_TURN[dir] * (prof ? 1.45 : 1)), pivot = [0, 0.6, 12 + crouch];
  for (const q of Hd) P.push(xformPrims([q], HT, vSub(pivot, mVec(HT, pivot)))[0]);
  // (facing right the head turns further than facing left, which swung the horns round
  // behind the flame: one sat against its edge as a pale stripe on it. The horns keep the
  // mirror of the left-facing turn, so they stand clear of the flame with an outline
  // between, as they do facing left.)
  const HTh = dir === RIGHT ? mRotZ(-HEAD_TURN[LEFT] * 1.45) : HT;
  for (const q of Hn) P.push(xformPrims([q], HTh, vSub(pivot, mVec(HTh, pivot)))[0]);
  const headMove = (p) => vAdd(pivot, mVec(HT, vSub(p, pivot)));
  // arms: the right one hurls, the left one balances
  const rHand = throwing ? [-5.2, 0.5, 20 + crouch] : [-6.4, 2.2, 8 + crouch];
  P.push(P_cap([-4.4, 0, 11.5 + crouch], rHand, 1.3, "red", { part: 7, grp: 7, tone: 1 }));
  P.push(P_ell(rHand, [1.7, 1.7, 1.7], "red", { part: 7, grp: 7, tone: 2 }));
  P.push(P_cap([4.4, 0, 11.5 + crouch], [6.4, 2.2, 8 + crouch], 1.3, "red", { part: 8, grp: 8, tone: 1 }));
  P.push(P_ell([6.4, 2.2, 8 + crouch], [1.7, 1.7, 1.7], "red", { part: 8, grp: 8, tone: 2 }));
  const yaw = yawOf(dir);
  const decals = eyeDecals([[-1.6, 4.9, 16.4 + crouch], [1.6, 4.9, 16.4 + crouch]].map(headMove), yaw, ["gold", 3], mVec(HT, [0, 1, 0.2]));
  // in profile each eye gets a dark pupil on the side it looks toward, so the glowing
  // slits read as eyes looking ahead and not as sparks on its cheek
  // (each eye sits one pixel in from where it is pinned, the pupil on its outer side: on
  // the pinned pixel the far eye's pupil fell on the outline and it showed as a sliver)
  if (prof) { const d = dir === LEFT ? -1 : 1; for (const dc of decals) dc.px = [[-d, 0, ["gold", 3]], [-d, 1, ["gold", 3]], [0, 0, "ink"], [0, 1, "ink"]]; }
  return { prims: yawed(P, dir), decals };
}
// Shellback: a squat turtle under a spiked slate shell; knocked on its back it is helpless.
for (const k in STYLE_VARIANTS) {
  const R = STYLE_VARIANTS[k].ramps;
  if (!R.spikebone) R.spikebone = [R.earth[0], R.earth[1], R.earth[2], R.stone[3], R.stone[4]];
}
Object.assign(MATS, { tan: { ramp: "green", base: 1 }, tortoise: { ramp: "earth", base: 2 }, spikebone: { ramp: "spikebone", base: 3 } });
function shellbackPrims(dir, frame, flipped) {
  // an olive shell cut into six-sided plates, ringed with pale spikes that stand out of
  // its outline; a tan head and legs (a smooth blue-grey dome read as a boulder)
  const plates = (q) => {
    const a = ((q[0] + 60) % 6 + 6) % 6, b = ((q[0] * 0.5 + q[1] * 0.866 + 60) % 6 + 6) % 6, c = ((q[0] * 0.5 - q[1] * 0.866 + 60) % 6 + 6) % 6;
    return (a < 0.8 || b < 0.8 || c < 0.8) ? -1.2 : 0;
  };
  const P = [];
  if (flipped) {
    P.push(P_ell([0, 0, 5], [10, 11, 5], "tortoise", { part: 1, grp: 1, tone: 1, tex: plates }));
    P.push(P_ell([0, 0, 9], [7.5, 8.5, 2.2], "gold", { part: 2, grp: 1, tone: 1, tex: (q) => ((((q[0] + 40) % 5) < 0.8 || ((q[1] + 40) % 5) < 0.8) ? -0.8 : 0) }));
    for (const [x, y] of [[-8, 6], [8, 6], [-8, -6], [8, -6]]) P.push(P_cap([x * 0.8, y * 0.8, 9], [x, y, 12.5 + (frame ? 1 : 0)], 1.8, "tan", { part: 3, grp: 3, tone: 2 }));
    return { prims: yawed(P, dir), decals: [] };
  }
  for (const [x, y] of [[-7, 5], [7, 5], [-7, -5], [7, -5]]) P.push(P_ell([x, y + ((x > 0) === !!frame ? 1 : -1), 1.8], [2.6, 3, 2], "tan", { part: 1, grp: 1, tone: 2 }));
  P.push(P_ell([0, 0, 6.5], [10, 11, 6.2], "tortoise", { part: 2, grp: 2, tone: 2, tex: plates }));
  P.push(P_cyl([0, 0, 2.2], [0, 0, 3.6], 10.6, "tortoise", { part: 2, grp: 2, tone: 1, line: false }));
  // spikes: a crown on top and a ring round the rim, all poking past the shell's edge
  // (the top ones lean out and back, the way they show longest from above: seen end on
  // they read as rivets)
  for (const [x, y, z, dx, dy, dz, r] of [[-9.5, 0, 6.5, -5, 0, 2.5, 2.3], [9.5, 0, 6.5, 5, 0, 2.5, 2.3], [0, -10.5, 6.5, 0, -5, 2.5, 2.3]]) {
    P.push(P_cone([x, y, z], [x + dx, y + dy, z + dz], r, 0.25, "bone", { part: 3, grp: 3, tone: 3 }));
  }
  // the spikes over the middle of the shell stand straight up as little pyramids: the
  // face toward the light pale, the one away from it dark, a white point on top (leaning
  // back they were seen end on and read as flat grey blobs or tape)
  // (their shadow side is a warm dark brown from the shell's own earth colours, not a
  // cold slate grey: a derived ramp, spikebone, of palette colours)
  const facet = (q, n) => -shadeOffset(n, false) + (n[0] < -0.2 ? 1 : n[0] > 0.18 ? -2 : 0);
  const prof = dir === LEFT || dir === RIGHT;
  const crown = prof ? [] : [[0, -3.8, 12.3], [-5.4, -0.6, 11.6], [5.4, -0.6, 11.6], [-3.4, 4.8, 11.4], [3.4, 4.8, 11.4]];
  for (const [x, y, z] of crown) P.push(P_cone([x, y, z - 1.2], [x, y, z + 5.2], 2.5, 0.2, "spikebone", { part: 3, grp: 3, tone: 3, tex: facet }));
  const tips = crown.map(([x, y, z]) => ({ p: [x, y + 0.15, z + 4.1], face: [0, 0.6, 0.8], px: [[0, 0, "white"]], minFacing: 0.05, tol: 3 }));
  P.push(P_cap([0, 8, 4], [0, 12, 5.5], 2.4, "tan", { part: 4, grp: 4, tone: 2 }));
  P.push(P_ell([0, 13.5, 6], [4.4, 4.4, 3.8], "tan", { part: 4, grp: 4, tone: 2 }));
  const yaw = yawOf(dir);
  const W = yawed(P, dir), tipDecals = tips.map(d => Object.assign({}, d, { p: yawPt(d.p, yaw) }));
  if (prof) {
    // side views: three spikes along the shell's ridge lean back from the camera, so they
    // stand up out of the top of the outline as little pointed triangles (standing
    // straight up they sank into the shell's outline and showed as grey bars), and two
    // lower on the near flank. Laid out in world space: x across the screen, y toward
    // the camera. The shell here is 22 wide and 20 deep.
    for (const [x, y, lean] of [[-5.5, -2.5, -0.12], [0, -3.4, 0], [5.5, -2.5, 0.12], [-3.2, 5.2, -0.1], [3.4, 5.2, 0.1]]) {
      const zs = 6.5 + 6.2 * Math.sqrt(Math.max(0, 1 - (x / 11) ** 2 - (y / 10) ** 2));
      // (the flank ones are short and broad-based, so they show as little pyramids)
      const ridge = y < 0, base = [x, y, zs - (ridge ? 1.4 : 0.7)], d = vNorm([lean, ridge ? -0.6 : -0.25, 0.8]), tip = vAdd(base, vMul(d, ridge ? 7.2 : 4.4));
      W.push(P_cone(base, tip, ridge ? 2.4 : 2.5, 0.2, "spikebone", { part: 3, grp: 3, tone: 3, tex: facet }));
      tipDecals.push({ p: vAdd(base, vMul(d, ridge ? 5.9 : 3.4)), face: vNorm(vAdd(TO_CAM, [0, 0, 0.3])), px: [[0, 0, "white"]], minFacing: 0.05, tol: 3 });
    }
  }
  return { prims: W, decals: eyeDecals([[-1.9, 16.6, 7], [1.9, 16.6, 7]], yaw, ["gold", 3], [0, 1, 0.2]).concat(tipDecals) };
}
// A thrown spike of ice, point first.
function iceShardPrims(a) {
  // a long needle of ice (pale, with a white edge) tapering to a point at the front,
  // and a few specks of frost trailing behind; a = heading in eighths of a turn
  const ang = a * Math.PI / 4, h = vNorm([Math.cos(ang), Math.sin(ang) / SIN_P, 0]), n = vMul(h, -1), side = [n[1], -n[0], 0];
  // (the needle runs through the middle of a pixel row or column, not along the line
  // between two: laid between them, the level and upright ones came out two pixels thick
  // right to the end and their points looked cut off flat)
  const o = [0.5, 0.5 / SIN_P, 0], at = (v) => vAdd(v, o);
  // (level and upright, the point tapers three pixels, two, one, over about four pixels:
  // its axis is nudged a third of a pixel to one side so the two outer rows of the body
  // run out one after the other; tapering evenly the three-pixel body stepped straight
  // down to a long one-pixel needle and read as a syringe. The diagonals taper already.)
  const even = a % 2 === 0, side2 = [side[0], side[1] / SIN_P, 0], off = even ? vMul(side2, 0.4) : [0, 0, 0];
  const P = even ? [
    P_cone(at(vMul(n, 4)), at(vMul(h, 3)), 1.9, 1.5, "teal", { part: 1, grp: 1, tone: 3 }),
    P_cone(at(vMul(h, 3)), vAdd(at(vMul(h, 9)), off), 1.5, 0.05, "teal", { part: 1, grp: 1, tone: 3 }),
  ] : [
    P_cone(at(vMul(n, 4)), at(vMul(h, 3)), 1.9, 1.1, "teal", { part: 1, grp: 1, tone: 3 }),
    P_cone(at(vMul(h, 3)), at(vMul(h, 10)), 1.1, 0.05, "teal", { part: 1, grp: 1, tone: 3 }),
  ];
  for (const [f, sd, r] of [[7, 1.4, 0.9], [9.5, -1.2, 0.75], [12, 0.6, 0.6]]) P.push(P_ell(at(vAdd(vMul(n, f), vMul(side, sd))), [r, r, r], "teal", { part: 3 + (f > 8 ? 1 : 0), grp: 3, tone: 4 }));
  // the frost glint: one white pixel on the lit top of the body (a white rod inside it
  // showed as a grey-white block near the point)
  return { prims: P, decals: [{ p: at(vAdd(vMul(n, 0.5), [0, 0, 1.5])), face: [-0.3, 0.2, 0.9], px: [[0, 0, "white"]], minFacing: 0.05, tol: 3 }] };
}

// ============================================================
// BOSSES (2 to 3.5 times the hero's height, per the ratio table)
// ============================================================
// Scale a model about its ground origin; textures keep their pattern size relative to the model.
function scaleModel(m, s) {
  const prims = m.prims.map(p => {
    const q = Object.assign({}, p);
    if (p.k === "ell") { q.c = vMul(p.c, s); q.r = p.r.map(v => v * s); }
    else if (p.k === "box") { q.c = vMul(p.c, s); q.h = p.h.map(v => v * s); }
    else { q.a = vMul(p.a, s); q.b = vMul(p.b, s); if (p.r !== undefined) q.r = p.r * s; if (p.ra !== undefined) { q.ra = p.ra * s; q.rb = p.rb * s; } }
    if (p.tex) { const t = p.tex; q.tex = (qq, n, px, py) => t(vMul(qq, 1 / s), n, px, py); }
    return q;
  });
  const decals = (m.decals || []).map(d => Object.assign({}, d, { p: vMul(d.p, s), tol: (d.tol || 2.5) * s }));
  return { prims, decals };
}

// Cinderwyrm: a squat fire drake (~2.3x the hero); drops its jaw to spit embers.
function wyrmPrims(frame) {
  const P = [];
  const scl = (q) => ((Math.floor((q[0] + 60) / 4) + Math.floor((q[2] + 60) / 3.5)) & 1 ? -0.5 : 0.2);
  for (const s of [-1, 1]) {
    P.push(P_ell([s * 12, -3, 7], [5.6, 7, 7], "red", { part: 1, grp: 10 + s, tone: 1 }));
    P.push(P_ell([s * 13, 1, 1.8], [4.2, 5.4, 2.2], "red", { part: 1, grp: 10 + s, tone: 0 }));
  }
  P.push(P_cone([6, -12, 7], [22, -20, 4], 5.4, 1.4, "red", { part: 2, grp: 2, tone: 1, tex: scl }));
  P.push(P_ell([0, -2, 17], [15, 12, 13], "red", { part: 3, grp: 3, tone: 2, tex: scl }));
  P.push(P_ell([0, 6.5, 14.5], [9.5, 5, 10], "ember", { part: 4, grp: 3, tone: 2, tex: (q) => (((q[2] + 40) % 4) < 0.9 ? -1 : 0) }));
  for (const s of [-1, 1]) {
    // bat-like wings spread out to the sides behind the shoulders: a bony leading edge
    // with a claw, three finger spars and a thin membrane facing the viewer (a thick
    // lobe pointing up read as a raised arm)
    const root = [s * 11, -7, 29], wrist = [s * 24, -11, 41];
    P.push(P_cap(root, wrist, 2.0, "red", { part: 5, grp: 5 + s, tone: 1 }));
    P.push(P_cone(wrist, vAdd(wrist, [s * 2.5, -1, 4]), 1.3, 0.3, "bone", { part: 5, grp: 5 + s, tone: 3 }));
    for (const tip of [[s * 30, -12, 33], [s * 27, -12, 24], [s * 19, -10, 19]]) P.push(P_cap(wrist, tip, 1.1, "red", { part: 5, grp: 5 + s, tone: 1 }));
    P.push(P_ell([s * 20.5, -10.5, 30], [8.5, 0.9, 9.5], "redD", { part: 5, grp: 5 + s, tone: 2, rot: mRotY(s * 0.35), tex: (q) => (((Math.atan2(q[2] - 41, q[0] - s * 24) * 5.2 + 40) % 1.6) < 0.25 ? -1 : 0) }));
    P.push(P_cap([s * 9, 5, 14], [s * 10, 9, 3], 3.2, "red", { part: 6, grp: 20 + s, tone: 2 }));
    for (const c of [-1.6, 0, 1.6]) P.push(P_cone([s * 10 + c, 11, 2], [s * 10 + c * 1.4, 14, 0.8], 1.0, 0.25, "bone", { part: 7, grp: 20 + s }));
  }
  const open = frame ? 1 : 0;
  P.push(P_cap([0, 2, 28], [0, 8, 36], 6, "red", { part: 8, grp: 8, tone: 2, tex: scl }));
  P.push(P_ell([0, 10, 39.5 + open], [8.6, 9, 7], "red", { part: 9, grp: 9, tone: 2 }));
  P.push(P_ell([0, 16.5, 38.5 + open], [5.6, 5, 4], "red", { part: 9, grp: 9, tone: 2 }));
  P.push(P_ell([0, 16, 33.2 - open * 3.4], [5.2, 4.8, 2.2], "red", { part: 10, grp: 10, tone: 1 }));
  if (open) P.push(P_ell([0, 19.4, 35.4], [4.2, 1, 2.6], "ember", { part: 11, grp: 11, tone: 3, flat: true, line: false }));
  for (const s of [-1, 1]) P.push(P_cone([s * 5, 6, 45], [s * 9, -2, 53], 2.2, 0.4, "bone", { part: 12, grp: 12 + s }));
  // heavy brow ridges over larger slit-pupilled eyes (two gold dots read as nothing)
  for (const s of [-1, 1]) P.push(P_ell([s * 4.4, 14.2, 44.6 + open], [3.2, 2.4, 1.3], "red", { part: 13, grp: 9, tone: 1, rot: mRotY(s * -0.35) }));
  const decals = [-1, 1].map(s => ({ p: [s * 4.6, 16.2, 42.4 + open], face: [s * 0.4, 0.8, 0.4], px: [[0, 0, ["gold", 3]], [s, 0, ["gold", 3]], [-s, 0, ["gold", 2]], [0, 1, ["gold", 2]], [s, 1, ["gold", 2]], [0, -1, "ink"], [0, 0, "ink"]], minFacing: 0.1, tol: 4 }));
  decals.push({ p: [-2, 21.4, 38.6 + open], face: [0, 1, 0], px: [[0, 0, "ink"], [4, 0, "ink"]], minFacing: 0.2 });
  return scaleModel({ prims: P, decals }, 1.45);
}

// Marrowworm: a bone-plated skull with snapping mandibles, vertebra-like segments.
function wormHeadPrims(frame, dir) {
  const P = [];
  const open = frame ? 1 : 0;
  P.push(P_ell([0, -1, 9], [10.5, 10.5, 8.5], "bone", { part: 1, grp: 1, tex: stoneTex }));
  P.push(P_ell([0, -2, 16.5], [4, 9, 2.2], "bone", { part: 1, grp: 1, tone: 3 }));
  P.push(P_ell([0, 7, 7.5], [8.2, 5, 5.2], "bone", { part: 2, grp: 1, tone: 3 }));
  for (const s of [-1, 1]) {
    P.push(P_ell([s * 4.2, 9.6, 10.6], [2.8, 1.2, 2.4], "ink", { part: 3, grp: 3, flat: true, line: false }));
    const root = [s * 5.6, 9.2, 4.4], tip = [s * (3.2 + open * 3.6), 15.4, 3.2];
    P.push(P_cone(root, tip, 2.2, 0.5, "bone", { part: 4, grp: 4 + s, tone: 4 }));
    P.push(P_cone([s * 6, -6, 13], [s * 11, -12, 19], 2.4, 0.4, "bone", { part: 5, grp: 6 + s, tone: 3 }));
  }
  const yaw = yawOf(dir);
  const decals = [-1, 1].map(s => ({ p: yawPt([s * 4.2, 10.7, 10.8], yaw), face: yawPt([s * 0.2, 1, 0.2], yaw), px: [[0, 0, ["red", 3]]], minFacing: 0.1, tol: 4 }));
  return scaleModel({ prims: yawed(P, dir), decals }, 1.4);
}
function wormSegPrims(glow) {
  const mat = glow ? "ember" : "bone";
  const P = [
    P_ell([0, 0, 8], [9, 9, 7.2], mat, { part: 1, grp: 1, tone: glow ? 3 : 3 }),
    P_cyl([0, 0, 7.6], [0, 0, 9.4], 9.6, glow ? "red" : "stone", { part: 2, grp: 1, tone: glow ? 3 : 2, line: false }),
    P_cone([0, -1, 13], [0, -3, 20], 2.6, 0.4, "bone", { part: 3, grp: 3, tone: 4 }),
  ];
  for (const s of [-1, 1]) P.push(P_cone([s * 7.5, 0, 8.5], [s * 13, 1, 8], 2.2, 0.4, "bone", { part: 4, grp: 4 + s, tone: 4 }));
  return scaleModel({ prims: P, decals: [] }, 1.25);
}
// The joint between two pieces of the worm: a smaller, darker vertebra drawn under
// them, so head and segments read as one spine instead of loose balls. (Only the
// pieces are hit; the joints are drawing, like a tail's thin end.)
function wormLinkPrims() {
  const P = [
    P_ell([0, 0, 6.2], [6.4, 6.4, 5.4], "bone", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, 0, 5.8], [0, 0, 7.2], 6.8, "stone", { part: 2, grp: 1, tone: 1, line: false }),
  ];
  return scaleModel({ prims: P, decals: [] }, 1.25);
}

// Gazer: a floating eye in a stone-browed husk; the stone lid parts to fire.
function gazerPrims(open) {
  const P = [];
  P.push(P_ell([0, -2, 18], [16, 14, 14], "purple", { part: 1, grp: 1, tone: 2, tex: (q) => (vnoise(q[0] * 0.3, q[2] * 0.3, 95) - 0.5) * 1 }));
  for (let i = 0; i < 5; i++) {
    const x = -10 + i * 5, sway = (i & 1) ? 2 : -2;
    P.push(P_cap([x, 0, 7], [x + sway, 3, -4], 2.3, "purple", { part: 2, grp: 20 + i, tone: 1 }));
    P.push(P_cap([x + sway, 3, -4], [x - sway * 0.5, 5, -11], 1.5, "purple", { part: 2, grp: 20 + i, tone: 1 }));
  }
  P.push(P_ell([0, 8, 18], [10.5, 7.5, 10], "white", { part: 3, grp: 3, tone: 4 }));
  if (open) {
    P.push(P_ell([0, 14.6, 18.4], [5.2, 1.6, 5.2], "red", { part: 4, grp: 4, tone: 2, line: false }));
    P.push(P_ell([0, 15.8, 18.6], [2.2, 0.8, 2.8], "ink", { part: 5, grp: 4, flat: true, line: false }));
    P.push(P_ell([0, 8, 28.5], [11.5, 7.5, 2.6], "stone", { part: 6, grp: 6, tone: 3, tex: stoneTex }));
    P.push(P_ell([0, 8, 7.8], [11.5, 7.5, 2.6], "stone", { part: 7, grp: 7, tone: 3, tex: stoneTex }));
  } else {
    P.push(P_ell([0, 8.6, 18], [11.4, 8, 10.6], "stone", { part: 6, grp: 6, tone: 3, tex: stoneTex }));
    P.push(P_box([0, 16.3, 18], [9.5, 0.5, 0.7], "stone", { part: 8, grp: 6, tone: 0, line: false }));
  }
  for (const [x, z] of [[-9, 30], [0, 33], [9, 30]]) P.push(P_cone([x, -3, z], [x * 1.5, -6, z + 9], 2.6, 0.4, "stone", { part: 9, grp: 9, tone: 3 }));
  return scaleModel({ prims: P, decals: [] }, 1.35);
}

// Vex, the Shadow Tyrant: a flared shadow cloak, spiked pauldrons, a horned crown,
// arms thrown wide with bolts of light when attacking (~2.8x the hero).
function vexPrims(frame) {
  const P = [];
  const flare = frame ? 2.5 : 0;
  const folds = (q) => (((Math.atan2(q[1] + 1, q[0]) + 4) * 2.9) % 1 < 0.16 ? -0.9 : 0);
  P.push(P_frustum([0, -1, 0], [0, 0, 38], 16 + flare, 7.5, "shadow", { part: 1, grp: 1, tone: 1, tex: folds }));
  P.push(P_frustum([0, 3.5, 1], [0, 3, 36], 8, 5, "purple", { part: 2, grp: 2, tone: 2 }));
  P.push(P_ell([0, 1, 39], [11, 7.5, 5], "shadow", { part: 3, grp: 3, tone: 2 }));
  // (a horn's rising tip leans outward, so on the left one the face turned to the camera
  // also turned away from the light and it came out dark while the right one was pale:
  // the horns are shaded by their own left/up versus right/down faces instead, so both
  // are lit on the upper left and dark on the lower right)
  const hornTex = (q, n) => -shadeOffset(n, false) + Math.max(-1.3, Math.min(1.8, -1.5 * n[0] + 1.0 * n[2] - 0.05));
  for (const s of [-1, 1]) {
    P.push(P_ell([s * 9.5, 1, 41], [5, 5, 3.8], "purple", { part: 4, grp: 4 + s, tone: 1 }));
    // spikes curving out, then up (straight up-and-out, the left one turned its top side
    // away from the light and looked dark beside the right one)
    P.push(P_cone([s * 10, 1, 43], [s * 14.5, 0.6, 44.6], 2.4, 1.5, "bone", { part: 4, grp: 4 + s, tone: 2, tex: hornTex }));
    P.push(P_cone([s * 14.5, 0.6, 44.6], [s * 16.2, 0.2, 51], 1.5, 0.3, "bone", { part: 4, grp: 4 + s, tone: 2, tex: hornTex }));
  }
  P.push(P_ell([0, 2.5, 48], [5.4, 5.4, 6], "purple", { part: 5, grp: 5, tone: 1 }));
  P.push(P_ell([0, 6.2, 47.2], [3.4, 1.8, 3.2], "ink", { part: 6, grp: 5, flat: true, line: false }));
  // a dark iron circlet with gold-tipped points, wider than the head so it reads as a crown
  P.push(P_cyl([0, 2.5, 52.6], [0, 2.5, 54.0], 6.3, "iron", { part: 7, grp: 7, tone: 1 }));
  // a domed iron cap inside it (the circlet's flat top read as one flat grey disc): lit
  // on its upper left, a step darker round its lower right
  P.push(P_ell([0, 2.5, 53.6], [6.0, 6.0, 3.0], "iron", { part: 7, grp: 7, tone: 1, tex: () => -0.3 }));
  for (let i = 0; i < 5; i++) {
    const a = -1.3 + i * 0.65, x = Math.sin(a) * 6.3, y = 2.5 + Math.cos(a) * 6.3;
    const tip = [x * 1.35, y + 0.8, 60 + (i === 2 ? 3 : 0)];
    P.push(P_cone([x, y, 53.5], tip, 0.9, 0.2, "iron", { part: 7, grp: 7, tone: 1 }));
    P.push(P_ell(tip, [0.9, 0.9, 0.9], "gold", { part: 7, grp: 7, tone: 3, line: false }));
  }
  for (const s of [-1, 1]) P.push(P_cone([s * 4.5, 1, 51], [s * 11, -2, 60], 1.8, 0.35, "shadow", { part: 8, grp: 8 + s, tone: 2 }));
  for (const s of [-1, 1]) {
    const elbow = frame ? [s * 15, 5, 40] : [s * 12, 4, 31];
    const hand = frame ? [s * 21, 9, 44] : [s * 13, 7, 24];
    P.push(P_cap([s * 8.5, 2, 40], elbow, 3, "shadow", { part: 9, grp: 10 + s, tone: 2 }));
    P.push(P_cap(elbow, hand, 2.6, "shadow", { part: 9, grp: 10 + s, tone: 2 }));
    for (const c of [-1.4, 0, 1.4]) P.push(P_cone(hand, vAdd(hand, [s * 1.6 + c, 3, frame ? 1.5 : -3]), 1, 0.25, "bone", { part: 10, grp: 10 + s }));
    if (frame) {
      // a crackling bolt of light held in each claw: white core, violet rays (a plain
      // pale ball read as a tuft of cotton)
      const b = vAdd(hand, [0, 3, 4.5]);
      P.push(P_ell(b, [2.4, 2.4, 2.4], "glow", { part: 11, grp: 12 + s, line: false }));
      for (let i = 0; i < 5; i++) {
        const a = i * 2 * Math.PI / 5 + 0.3;
        P.push(P_cone(b, vAdd(b, [Math.cos(a) * 5.4, 1.5, Math.sin(a) * 5.4]), 1.5, 0.2, "purple", { part: 12, grp: 12 + s, tone: 3 }));
      }
    }
  }
  const decals = [-1, 1].map(s => ({ p: [s * 1.6, 7.9, 47.6], face: [0, 1, 0], px: [[0, 0, ["red", 3]]], minFacing: 0.1, tol: 5 }));
  return scaleModel({ prims: P, decals }, 1.4);
}


// Dunescale: a giant sand scorpion. Pincers snap, the tail arches over the back with a
// hooked sting; it can sink into the sand (a mound with the sting showing) and, when
// the hook yanks its tail, it sprawls stunned with the tail flat.
// (dark red-brown shell, so it stands off the pale sand and off the hero's brown hair;
// seen from above a tail raised straight up folds into a "neck", so it curls up and
// over to the right, where its bend shows; the pincers are swollen hands with two
// curved fingers and dark tips; two black eyes shine on the head plate)
Object.assign(MATS, { chitin: { ramp: "red", base: 1 } });
function dunescalePrims(frame, state) {
  const P = [];
  const sting = (bulb, dir, len) => {
    P.push(P_ell(bulb, [3.2, 3.6, 3], "gold", { part: 8, grp: 6, tone: 2 }));
    const a = vAdd(bulb, vMul(dir, 2.6)), b = vAdd(bulb, vMul(dir, len));
    P.push(P_cone(a, b, 1.5, 0.25, "chitin", { part: 9, grp: 6, tone: 0 }));
  };
  if (state === "burrow") {
    // a ragged hump of speckled sand, the tip of the tail and its hooked sting showing
    const grit = (q) => (hash2(Math.floor(q[0] * 1.3 + 50), Math.floor(q[1] * 1.3 + 50), 57) < 0.14 ? -1 : 0);
    for (const [x, y, z, rx, ry, rz] of [[0, 0, 2.2, 20, 15, 6], [-12, 5, 1.2, 9, 7, 3.2], [13, -4, 1.4, 9, 8, 3.4], [5, 11, 1, 8, 5, 2.6], [-8, -10, 1.2, 8, 6, 3], [2, -2, 6, 10, 8, 3.5]]) {
      P.push(P_ell([x, y, z], [rx, ry, rz], "dune", { part: 1, grp: 1, tone: 2, tex: grit }));
    }
    P.push(P_ell([4, -3, 9.5], [3.4, 3.2, 3], "chitin", { part: 2, grp: 2, tone: 2 }));
    P.push(P_ell([5, -1, 13.5], [3, 2.8, 2.8], "chitin", { part: 3, grp: 2, tone: 1 }));
    sting([5.5, 1.5, 17], vNorm([0, 0.6, -0.8]), 7);
    return scaleModel({ prims: P, decals: [] }, 1.3);
  }
  const stun = state === "stun", snap = !stun && frame === 1;
  // four pairs of thin dark legs, each bent up at the knee (curled in when stunned)
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
    const y = 8.5 - i * 6, lift = ((i + frame) & 1) && !stun ? 1.5 : 0;
    const splay = [4.5, 1.5, -1.5, -4.5][i];
    const knee = stun ? [s * 12, y + splay * 0.4, 11] : [s * 15, y + splay * 0.5, 10 + lift];
    const foot = stun ? [s * 13, y + splay, 8] : [s * 20, y + splay, 0.6 + lift * 0.5];
    P.push(P_cap([s * 8, y, 5], knee, 1.3, "chitin", { part: 1, grp: 20 + s * (i + 1), tone: 0 }));
    P.push(P_cone(knee, foot, 1.15, 0.45, "chitin", { part: 1, grp: 20 + s * (i + 1), tone: 0 }));
  }
  // the head plate, then the back in overlapping plates (alternate parts draw a seam
  // between each)
  P.push(P_ell([0, 12.5, 6.4], [8.5, 6.5, 5], "chitin", { part: 3, grp: 3, tone: 1 }));
  [[5.5, 10.5, 4.6, 5.4], [0.5, 11, 4.4, 5.6], [-4.5, 10.5, 4.4, 5.4], [-9.5, 9, 4.2, 5], [-14, 7, 3.8, 4.4]].forEach(([y, rx, ry, rz], i) =>
    P.push(P_ell([0, y, 6.6 - i * 0.2], [rx, ry, rz], "chitin", { part: 2 + (i & 1) * 10, grp: 2, tone: 1 + (i & 1) })));
  // eyes: two black beads with a glint on the head plate, small mouth pincers in front
  for (const s of [-1, 1]) {
    P.push(P_ell([s * 2.2, 14.5, 10.6], [1.5, 1.4, 1.2], "ink", { part: 20, grp: 3, line: false }));
    P.push(P_cone([s * 1.6, 18, 6], [s * 1.1, 21, 5.2], 1.3, 0.5, "chitin", { part: 21, grp: 3, tone: 1 }));
  }
  // pincers: a two-part arm reaching forward and out, a swollen hand and two curved
  // fingers that meet at the tips (flung wide open to snap)
  const open = snap ? 1 : stun ? 0 : 0.15;
  for (const s of [-1, 1]) {
    const z = stun ? 2.6 : 7;
    const elbow = [s * 18, 15, stun ? 3.5 : 8], wrist = [s * 16.5, snap ? 27 : 24, z];
    P.push(P_cap([s * 7, 15, 5.5], elbow, 2.3, "chitin", { part: 4, grp: 30 + s, tone: 1 }));
    P.push(P_cap(elbow, wrist, 2.5, "chitin", { part: 5, grp: 30 + s, tone: 1 }));
    const palm = vAdd(wrist, [0, 4.5, 0.3]);
    P.push(P_ell(palm, [5, 6.2, 4.3], "chitin", { part: 6, grp: 30 + s, tone: 2 }));
    const b = vAdd(palm, [0, 5, 0]), at = (x, y) => vAdd(b, [s * x, y, 0]);
    // (each finger bows outward and hooks back in, so at rest the two tips meet with a
    // lens-shaped gap between them: straight thick fingers side by side read as mittens
    // or the roots of a tooth)
    const oM = at(3.9 + 2.0 * open, 3.9 - 0.4 * open), oT = at(-0.6 + 6.4 * open, 8.4 - 1 * open);
    const iM = at(-3.2 - 1.8 * open, 3.6 - 0.4 * open), iT = at(0.3 - 5.4 * open, 7.8 - 1.2 * open);
    P.push(P_cone(at(2.2, 0), oM, 2.1, 1.4, "chitin", { part: 7, grp: 30 + s, tone: 2 }));
    P.push(P_cone(oM, oT, 1.4, 0.35, "chitin", { part: 7, grp: 30 + s, tone: 0 }));
    P.push(P_cone(at(-2.0, 0), iM, 1.7, 1.15, "chitin", { part: 17, grp: 30 + s, tone: 2 }));
    P.push(P_cone(iM, iT, 1.15, 0.3, "chitin", { part: 17, grp: 30 + s, tone: 0 }));
  }
  // tail: separate segments from the rear, rising behind the body in a hook (a "?"
  // seen from the front) with the sting bulb hanging at its end and the barb aimed
  // down at the hero; stunned, it lies flat out to one side.
  // (screen height is y*sin - z*cos, so the curl is laid out by its screen position:
  // each segment keeps y near the rear and takes the height that puts it there)
  const SP = Math.sin(50 * Math.PI / 180), CP = Math.cos(50 * Math.PI / 180), Y = -19;
  const up = (x, sy) => [x, Y, (SP * Y - sy) / CP];
  // (stunned, the tail flops out of the back and round the right side, flat on the
  // ground, the sting bulb lying limp beside the body: curled up behind it the bulb
  // still stood above the back and it looked ready to strike)
  const tail = stun
    ? [[4, -16, 4.0], [9.5, -17, 3.4], [14.5, -15, 3.0], [18.5, -11, 2.7], [21, -6, 2.5]]
    : [[0, -16.5, 6.8], up(3.5, -22.5), up(7, -28.5), up(8.5, -34.5), up(6.5, -39.5), up(2, -41.5)];
  tail.forEach((p, i) => P.push(P_ell(p, [4.2 - i * 0.3, 3.9 - i * 0.25, 3.8 - i * 0.25], "chitin", { part: 10 + (i & 1), grp: 6, tone: 2 - (i & 1) })));
  if (stun) sting([22.5, -1, 2.4], vNorm([0.2, 0.9, -0.2]), 6.5);
  else sting(up(-2.8, -39), vNorm([-0.25, 0.9, -0.35]), 9.5);
  let decals;
  if (stun) {
    // dazed: the eyes crossed out, three little stars wheeling in a ring just over them
    // (laid out in screen pixels round a point above the eyes, the ring turned a third of
    // the way between the two frames so they circle; two stars resting on the shell,
    // the same in both frames, read as shiny studs)
    for (let i = P.length - 1; i >= 0; i--) if (P[i].part === 20) P.splice(i, 1);
    decals = [-1, 1].map(s => ({ p: [s * 2.2, 14.8, 10.9], face: [0, 0.3, 1], px: [[-1, -1, "ink"], [1, -1, "ink"], [0, 0, "ink"], [-1, 1, "ink"], [1, 1, "ink"]], minFacing: 0.05, tol: 3 }));
    const star = [[0, -2, "ink"], [-1, -1, "ink"], [0, -1, ["gold", 3]], [1, -1, "ink"], [-2, 0, "ink"], [-1, 0, ["gold", 3]], [0, 0, "white"], [1, 0, ["gold", 3]], [2, 0, "ink"], [-1, 1, "ink"], [0, 1, ["gold", 2]], [1, 1, "ink"], [0, 2, "ink"]];
    const ring = [];
    for (let k = 0; k < 3; k++) {
      // (the ring is as wide as the shell, so the side stars break its outline)
      const t = (frame ? 90 : 30) * Math.PI / 180 + k * 2 * Math.PI / 3, cx = Math.round(14 * Math.cos(t)), cy = Math.round(-8.5 + 3.5 * Math.sin(t));
      for (const [x, y, c] of star) ring.push([cx + x, cy + y, c]);
    }
    decals.push({ p: [0, 14.8, 10.9], face: [0, 0.3, 1], px: ring, minFacing: 0, tol: 999, overhang: true });
  } else {
    decals = [-1, 1].map(s => ({ p: [s * 2.2 - 0.5, 14.5, 11.8], face: [0, 0.3, 1], px: [[0, 0, ["white", 0]]], minFacing: 0.1, tol: 2.5 }));
  }
  return scaleModel({ prims: P, decals }, 1.3);
}

// Frostmaw: a huge rime-crusted head grown out of the north wall; opens its maw to
// breathe ice, and only something heavy thrown into that maw hurts it.
function frostmawPrims(open) {
  const P = [];
  const fur = (q) => (vnoise(q[0] * 0.4, q[2] * 0.4, 97) - 0.5) * 1.2;
  // ridged ice (a smooth horn lit from the left read as one flat colour)
  // crystals cut in two facets, pale on the lit left and deep on the right (banded
  // ridges read as drill bits and soft-serve cones)
  const ridges = (q, n) => (n[0] < -0.12 ? 1 : n[0] > 0.28 ? -1.2 : 0);
  // it grows out of the north wall: a mass of ice crystals behind and above the head
  // climbs the wall face, rooting the head in it
  // (one more crystal just left of the middle closes the gap through which the door's
  // orange diamond showed between the spikes)
  for (const [x, z, r, h, lean] of [[-22, 30, 7, 30, -0.5], [-9, 36, 8, 36, -0.15], [6, 38, 8.5, 38, 0.1], [20, 32, 7, 30, 0.45], [-30, 20, 5, 20, -0.7], [30, 20, 5, 22, 0.7], [0, 44, 6, 26, 0], [-7, 46, 9, 42, 0]]) {
    P.push(P_cone([x, -20, z - 8], [x + lean * h, -26, z + h], r, 0.6, "teal", { part: 12, grp: 12, tone: 3, tex: ridges }));
  }
  P.push(P_ell([0, -18, 26], [30, 8, 20], "teal", { part: 12, grp: 12, tone: 2, tex: ridges }));
  P.push(P_ell([0, -4, 24], [26, 18, 20], "white", { part: 1, grp: 1, tone: 4, tex: fur }));
  P.push(P_ell([0, 8, 30], [18, 8, 7], "white", { part: 2, grp: 1, tone: 3, tex: fur }));
  for (const s of [-1, 1]) {
    P.push(P_cone([s * 18, -2, 36], [s * 30, -6, 50], 5, 1, "teal", { part: 3, grp: 3 + s, tone: 3, tex: ridges }));
    P.push(P_cone([s * 30, -6, 50], [s * 34, 2, 58], 1.2, 0.3, "teal", { part: 3, grp: 3 + s, tone: 4 }));
    P.push(P_ell([s * 23, 4, 14], [7, 6, 8], "white", { part: 4, grp: 1, tone: 3, tex: fur }));
    // frost tusks at the corners of the jaw (pale patches under the eyes read as tears)
    P.push(P_cone([s * 11, 15, 12], [s * 13.5, 19, 3], 2.2, 0.3, "teal", { part: 13, grp: 1, tone: 4, tex: ridges }));
    // rime spreading over the wall to either side of the head
    for (const [x, z, h] of [[36, 10, 12], [44, 22, 9], [40, 34, 10]]) P.push(P_cone([s * x, -24, z], [s * (x + 6), -26, z + h], 3.4, 0.4, "teal", { part: 16, grp: 16 + s, tone: 3, tex: ridges }));
  }
  for (const x of [-10, 0, 10]) P.push(P_cone([x, -8, 40], [x * 1.2, -10, 52 + (x ? 0 : 4)], 3, 0.5, "teal", { part: 5, grp: 5, tone: 4, tex: ridges }));
  const drop = open ? 9 : 0;
  // snout and the jaws; open, the lower jaw hangs from hinges with the dark maw between
  P.push(P_ell([0, 13, 20], [14, 8, 8], "white", { part: 6, grp: 6, tone: 4, tex: fur }));
  if (open) {
    P.push(P_ell([0, 14, 12.5], [11.5, 5, 8], "redD", { part: 8, grp: 8, tone: 0 }));
    P.push(P_ell([0, 16.8, 12], [9.5, 2.6, 6], "ink", { part: 8, grp: 8, flat: true, line: false }));
    P.push(P_ell([0, 17.4, 10.5], [5, 1.6, 3], "teal", { part: 9, grp: 8, tone: 4, line: false }));
    for (const s of [-1, 1]) P.push(P_cap([s * 12, 9, 19], [s * 12, 10, 8], 3.2, "white", { part: 14, grp: 7, tone: 3, tex: fur }));
  }
  P.push(P_ell([0, 12, 9 - drop], [13, 8, 5], "white", { part: 7, grp: 7, tone: 3, tex: fur }));
  // icicles hanging from the jaw
  for (const x of [-9, -3, 4, 10]) P.push(P_cone([x, 15, 5 - drop], [x + 0.5, 16, -1 - drop - (x & 1)], 1.6, 0.2, "teal", { part: 15, grp: 7, tone: 4 }));
  if (open) {
    for (const x of [-7, -2.5, 2.5, 7]) {
      P.push(P_cone([x, 18, 17], [x, 18.5, 13.5], 1.3, 0.2, "white", { part: 10, grp: 10, tone: 4 }));
      P.push(P_cone([x, 18, 4.5 - drop * 0.3], [x, 18.5, 8 - drop * 0.3], 1.2, 0.2, "white", { part: 10, grp: 10, tone: 4 }));
    }
  }
  // deep-set eyes under frosted brows, burning a cold blue-white
  for (const s of [-1, 1]) P.push(P_ell([s * 9, 12.4, 33.6], [5, 3, 1.8], "white", { part: 11, grp: 2, tone: 3, tex: fur, rot: mRotY(s * -0.3) }));
  const decals = [-1, 1].map(s => ({ p: [s * 9, 13.8, 31], face: [s * 0.2, 1, 0.3], px: [[-1, -1, "ink"], [0, -1, "ink"], [1, -1, "ink"], [-1, 0, "ink"], [2, 0, "ink"], [-1, 1, "ink"], [2, 1, "ink"], [0, 2, "ink"], [1, 2, "ink"], [0, 0, "white"], [1, 0, ["water", 4]], [0, 1, ["water", 4]], [1, 1, ["water", 3]]], minFacing: 0.1, tol: 5 }));
  // rime creeping over the wall face on either side of the head: feathery fronds of frost
  // spreading out over the wall beside the door, dense near it and breaking into dots at
  // their tips, drawn straight onto the wall with no outline (the crystals at the wall's
  // foot stood on the floor and the wall beside the head stayed clean, so the head
  // looked pasted in front of the door)
  for (const s of [-1, 1]) decals.push({ p: [s * 14, -2, 36], face: [0, 1, 0], minFacing: 0, tol: 999, overhang: true, px: rimeFronds(s, 14 * 1.2, (-2 * SIN_P - 36 * COS_P) * 1.2) });
  return scaleModel({ prims: P, decals }, 1.2);
}
// Frost fronds for the Frostmaw's wall (screen pixel offsets from a decal anchor at
// (ax, ay) relative to the boss's feet; s = side), growing outward over the wall.
// (round two: each frond is a fern of frost, densest where it leaves the door's pillar
// next to the head, its short barbs alternating at 45 degrees and shortening outward,
// the stem curving a little and thinning out into dots toward its tip. A straight
// stroke with a white crust at one end read as a comet or an arrow. The frost is white:
// the wall is laid in the pale ice-blues, and frost in those vanished into it. The fronds
// grow out over the bare wall beside the boss door, clear of its frame: the door's
// pillars reach 52 px either side of its middle and the wall torches start at 92, and
// the boss is drawn 8 px right of the door's middle, so the roots stand 61 px out from
// the boss and the fronds end by 83 px (clear of both whether or not the boss is later
// centred on the door). Offsets are relative to the boss's feet, y up negative; the wall
// runs from 54 to 106 px above them.)
function rimeFronds(s, ax, ay) {
  const px = new Map(), put = (x, y) => px.set(x + "," + y, [x, y, "white"]);
  // (past the stem's first half, pixels drop out more and more toward the tip)
  const keep = (t, k, i, j) => t < 0.45 || hash2(k * 53 + i, j + 11, 227) > (t - 0.45) * 1.5;
  const roots = [[61, -64, 0, 20, 0.02], [61, -77, -0.3, 19, -0.025], [61, -90, -0.45, 15, 0.03], [61, -57, 0.08, 12, -0.035], [61, -100, -0.08, 12, 0.03]];
  roots.forEach(([rx, ry, ang, len, curl], k) => {
    let x = rx, y = ry, a = ang;
    for (let i = 0; i < len; i++) {
      a += curl + (hash2(k * 31 + i, 7, 211) - 0.5) * 0.12;
      x += Math.cos(a); y += Math.sin(a);
      const t = i / len, X = Math.round(x), Y = Math.round(y);
      if (keep(t, k, i, 0)) put(X * s, Y);
      // barbs, alternating sides, at 45 degrees forward, long at the root, short at the tip
      if (i % 2 === 1 && t < 0.85) {
        const sd = (i >> 1) & 1 ? 1 : -1, b = a + sd * Math.PI / 4, bl = Math.max(1, Math.round((1 - t) * 4));
        for (let j = 1; j <= bl; j++) if (keep(t + j * 0.08, k, i, j)) put(Math.round(x + Math.cos(b) * j) * s, Math.round(y + Math.sin(b) * j));
      }
    }
  });
  return [...px.values()].map(([x, y, c]) => [x - Math.round(s * ax), y - Math.round(ay), c]);
}

// Emberhulk: a hulking golem of cooled lava. While its crust holds it shrugs off
// blades; the hammer cracks the crust and bares the white-hot core.
Object.assign(MATS, { basalt: { ramp: "earth", base: 1 } });
function emberhulkPrims(frame, bare) {
  const P = [];
  // cooled lava: warm black basalt, much darker than the grey floor, split by jagged
  // seams that glow yellow at the heart and orange-red at their edges
  const crust = { part: 2, grp: 2, tone: 1, tex: (q) => (vnoise(q[0] * 0.3, q[2] * 0.3, 98) - 0.5) * 1 };
  const step = frame ? 2 : -2;
  const seam = (pts, w) => {
    for (let k = 0; k < pts.length - 1; k++) {
      P.push(P_cap(pts[k], pts[k + 1], w, "red", { part: 5, grp: 2, tone: 3, line: false }));
      P.push(P_cap(vAdd(pts[k], [0, 0.6, 0]), vAdd(pts[k + 1], [0, 0.6, 0]), w * 0.45, "ember", { part: 5, grp: 2, tone: 3, line: false }));
    }
  };
  for (const s of [-1, 1]) {
    P.push(P_cap([s * 7, 0, 18], [s * 8, s * step * 0.6, 3], 5, "basalt", { part: 1, grp: 10 + s, tone: 1 }));
    P.push(P_ell([s * 8, s * step * 0.6 + 2, 2.4], [5.5, 7, 3], "basalt", { part: 1, grp: 10 + s, tone: 0 }));
  }
  P.push(P_ell([0, 0, 28], [15, 11, 14], "basalt", crust));
  P.push(P_ell([0, 3, 38], [12, 8, 6], "basalt", Object.assign({}, crust, { tone: 2 })));
  if (bare) {
    // the crust is broken open over the chest: a ragged dark hole with white-hot
    // fissures and sparks inside (a round glow in rings read as a fried egg or an eye)
    for (const [x, z, rx, rz] of [[-2, 30, 6, 7], [3, 27, 5.5, 6], [-3.5, 24, 4, 4], [4.5, 33.5, 4, 3.6], [-6, 33, 3, 3]]) P.push(P_ell([x, 8.6, z], [rx, 3, rz], "redD", { part: 3, grp: 3, tone: 0, line: false }));
    // (the white-hot core and the cracks running out of it are drawn pixel by pixel
    // below: two zigzag fissures round an empty middle read as a grin, and round white
    // dots in the dark hole as teeth)
    // shards of crust sprung loose round the hole
    for (const [x, z] of [[-9, 36], [9, 35], [-10, 22], [10, 23]]) P.push(P_box([x, 9, z], [2.4, 1.6, 2], "basalt", { part: 6, grp: 3, tone: 2, rot: mRotY(x * 0.05) }));
  }
  // (the chest crack of the whole crust is drawn pixel by pixel below: a smooth tube of
  // even width with branches read as a twig or chopsticks stuck on)
  P.push(P_ell([0, 2, 46], [6, 5.5, 5], "basalt", { part: 6, grp: 6, tone: 1 }));
  seam([[-3, 6.8, 49], [0, 7.4, 47.5], [3, 6.8, 49]], 0.5);
  for (const s of [-1, 1]) {
    const fist = frame ? [s * 20, 8 + s * 2, 14] : [s * 21, 6 - s * 2, 16];
    P.push(P_cap([s * 13, 0, 36], fist, 4.4, "basalt", { part: 7, grp: 20 + s, tone: 1 }));
    P.push(P_ell(fist, [6, 6, 6], "basalt", { part: 8, grp: 20 + s, tone: 1 }));
    seam([vAdd(fist, [s * -3, 5, 3]), vAdd(fist, [s * -1, 5.8, 0]), vAdd(fist, [s * 2, 5, -2])], 0.7);
  }
  const decals = [-1, 1].map(s => ({ p: [s * 2.2, 7.2, 47], face: [0, 1, 0.1], px: [[0, 0, ["gold", 3]], [s, 0, ["red", 3]]], minFacing: 0.1, tol: 4 }));
  // one jagged crack from the left shoulder down to the right flank, 1 px wide: white-
  // yellow heat at its middle cooling to orange, then dark red, and breaking up into
  // dots before it ends
  if (!bare) decals.push({ p: [-1.5, 10.9, 28], face: [0, 1, 0.1], minFacing: 0.1, tol: 4,
    px: crackPx([[-13, -11], [-10, -9], [-9, -6], [-6, -5], [-5, -2], [-1, -1], [0, 2], [3, 3], [4, 6], [7, 7], [9, 10]]) });
  // crust broken: a white-hot core glowing in the middle of the hole, 2x2 yellow in a
  // ring of orange, with cracks radiating out of it, cooling to red and breaking up
  else decals.push({ p: [-0.5, 11.3, 29], face: [0, 1, 0.1], minFacing: 0.1, tol: 5, px: corePx() });
  // (about twice the hero's height, like every boss)
  return scaleModel({ prims: P, decals }, 1.55);
}
// Pixels of the Emberhulk's bared core (screen offsets): a 2x2 yellow heart in an orange
// ring, six cracks running out of it at uneven angles and lengths, orange near the core,
// then red, then dark red broken into dots.
function corePx() {
  const out = new Map(), put = (x, y, c) => out.set(x + "," + y, [x, y, c]);
  for (const [deg, L] of [[-150, 7.5], [-96, 6], [-38, 8.5], [22, 7], [88, 6], [158, 8]]) {
    const a = deg * Math.PI / 180;
    for (let r = 2; r <= L; r += 0.5) {
      if (r > 4.6 && Math.round(r * 2) % 3 === 0) continue;
      put(Math.round(0.5 + Math.cos(a) * r), Math.round(0.5 + Math.sin(a) * r), r < 3.2 ? ["red", 3] : r < 4.6 ? ["red", 2] : ["red", 1]);
    }
  }
  for (const [x, y] of [[-1, 0], [-1, 1], [2, 0], [2, 1], [0, -1], [1, -1], [0, 2], [1, 2]]) put(x, y, ["red", 3]);
  for (const [x, y] of [[-1, -1], [2, -1], [-1, 2], [2, 2]]) put(x, y, ["red", 2]);
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) put(x, y, ["gold", 3]);
  return [...out.values()];
}
// Pixels of a glowing crack along a zigzag (screen offsets): hottest at the middle of
// its length, cooler toward both ends, the last stretch broken into dots.
function crackPx(pts) {
  const line = [];
  for (let k = 0; k < pts.length - 1; k++) {
    let [x0, y0] = pts[k]; const [x1, y1] = pts[k + 1];
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      if (!line.length || line[line.length - 1][0] !== x0 || line[line.length - 1][1] !== y0) line.push([x0, y0]);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  const out = [], n = line.length;
  line.forEach(([x, y], i) => {
    const d = Math.abs(i / (n - 1) - 0.5) * 2;
    if (d > 0.84 && (i & 1)) return;
    out.push([x, y, d < 0.32 ? ["gold", 3] : d < 0.56 ? ["red", 3] : d < 0.78 ? ["red", 2] : ["red", 1]]);
    // (the hot middle is a pixel thicker, so the crack tapers toward its ends)
    if (d < 0.2) out.push([x + 1, y, ["red", 3]]);
  });
  return out;
}
