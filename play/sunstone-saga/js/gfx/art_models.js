"use strict";
// ---------- Character, enemy and prop models (built from primitives) ----------
// Models are authored facing +y (south, toward the viewer). A character's right
// hand is on -x. Facing is applied by yaw rotation, never by mirroring, so the
// sword stays in the right hand and the shield on the left arm in every direction.

const FACE_YAW = { [DOWN]: 0, [UP]: Math.PI, [LEFT]: Math.PI / 2, [RIGHT]: -Math.PI / 2 };
// Heads tip back toward the camera so faces read from the high 3/4 view
// (strongest when facing the viewer, a little in profile, not at all from behind).
// (from behind the head leans the other way, so he is as tall seen from the back)
const HEAD_TILT = { [DOWN]: 28 * Math.PI / 180, [UP]: -18 * Math.PI / 180, [LEFT]: 16 * Math.PI / 180, [RIGHT]: 16 * Math.PI / 180 };
// In profile the head turns partly toward the viewer so the face stays readable.
// (facing right the face is on the side away from the light, so it turns a little
// further to show as much face as it does facing left)
const HEAD_TURN = { [DOWN]: 0, [UP]: 0, [LEFT]: -38 * Math.PI / 180, [RIGHT]: 47 * Math.PI / 180 };

function yawOf(dir) { return FACE_YAW[dir]; }
// A shield with a round top and a pointed foot (a disc over a square turned on its
// corner), faced along a, "up" along u: a gold rim round a pale silver face, a boss in
// the middle and a glint (level 2, the mirror shield), or a red boss in a gold sun
// (level 3, the sunforged shield). Shared by the hero's arm and the treasure.
function shieldPrims(c, a, u, R, level, part, grp) {
  a = vNorm(a); u = vNorm(vSub(u, vMul(a, vDot(u, a))));
  const r = [a[1] * u[2] - a[2] * u[1], a[2] * u[0] - a[0] * u[2], a[0] * u[1] - a[1] * u[0]], d1 = vNorm(vAdd(r, u)), d2 = vNorm(vSub(u, r));
  const rot = [d1[0], d2[0], a[0], d1[1], d2[1], a[1], d1[2], d2[2], a[2]];
  const at = (x, y, z) => vAdd(c, vAdd(vMul(r, x), vAdd(vMul(u, y), vMul(a, z))));
  const k = R * 0.72, T = 0.7, o = (p, g, t, line) => ({ part: p, grp, tone: t, line });
  // (the mirror face: a step darker toward the lower right, where it curves away from the
  // light, with the pale disc of the lit side over the upper left)
  const P = [
    P_cyl(at(0, R * 0.2, -T - 0.4), at(0, R * 0.2, T - 0.4), R + 0.9, "gold", o(part, grp, 3, true)),
    P_box(at(0, -R * 0.3, -0.4), [k + 0.7, k + 0.7, T], "gold", Object.assign(o(part, grp, 3, true), { rot })),
    // (flat tones, so the small shield on his arm doesn't break into a dither between them)
    P_cyl(at(0, R * 0.2, -T + 0.3), at(0, R * 0.2, T + 0.3), R, "steel", Object.assign(o(part + 1, grp, level === 3 ? 4 : 3, false), { flat: level !== 3 })),
    P_box(at(0, -R * 0.3, 0.3), [k, k, T], "steel", Object.assign(o(part + 1, grp, level === 3 ? 4 : 3, false), { rot, flat: level !== 3 })),
    P_cyl(at(-R * 0.24, R * 0.44, -T + 0.35), at(-R * 0.24, R * 0.44, T + 0.35), R * 0.64, "steel", Object.assign(o(part + 1, grp, 4, false), { flat: level !== 3 })),
    P_cyl(at(0, 0, T), at(0, 0, T + 0.9), R * 0.3, level === 3 ? "red" : "gold", o(part + 2, grp, 3, false)),
  ];
  if (level === 3) {
    for (let i = 0; i < 8; i++) {
      const t = i * Math.PI / 4, L = i & 1 ? 0.62 : 0.8;
      P.push(P_cap(at(Math.cos(t) * R * 0.42, Math.sin(t) * R * 0.42, T + 0.6), at(Math.cos(t) * R * L, Math.sin(t) * R * L, T + 0.6), R * 0.1, "gold", o(part + 2, grp, 3, false)));
    }
  } else {
    // the glint: a short white streak slanting across the upper left (in the neutral ramp
    // a glint came out darker than the silver round it)
    P.push(P_cap(at(-R * 0.66, R * 0.36, T + 0.55), at(-R * 0.3, R * 0.72, T + 0.55), Math.max(0.5, R * 0.1), "glow", o(part + 2, grp, 0, false)));
  }
  return P;
}
function faceDirVec(dir) { return [DX[dir], DY[dir], 0]; }

// Rotate a local point by yaw (for decals etc.)
function yawPt(p, yaw) { return mVec(mRotZ(yaw), p); }

// ---------- texture helpers ----------
function leafTex(scale, amp) {
  return (q) => {
    const v = vnoise(q[0] / scale + 11.3, (q[1] + q[2] * 0.7) / scale + 3.1, 7);
    return (v - 0.5) * amp;
  };
}
function barkTex(q) { return (hash2(Math.floor(q[0] * 1.2 + 40), 3, 9) < 0.3 ? -0.8 : 0) + (vnoise(q[0] * 0.6, q[2] * 0.25, 5) - 0.5) * 0.8; }
function stoneTex(q) { return (vnoise(q[0] * 0.35 + 5, q[1] * 0.35 + q[2] * 0.35, 13) - 0.5) * 1.2; }

// ============================================================
// HERO
// ============================================================
// pose: { dir, walk: 0..3 | -1, attack: 0..3 | -1, bob }
function heroPrims(pose) {
  const P = [];
  const w = pose.walk >= 0 ? pose.walk : -1;
  // gait: 0 = left foot forward, 1 = passing (right lifted), 2 = right forward, 3 = passing (left lifted)
  const stride = 3.4;
  const lf = w < 0 ? 0 : [stride, 0, -stride, 0][w];
  const rf = -lf;
  const lLift = w === 3 ? 1.8 : 0, rLift = w === 1 ? 1.8 : 0;
  // (seen from behind, the passing frames' lift raised the top of his hair by a pixel,
  // level with the striding frames once those were set on the sole line, and walking
  // up he slid along without bobbing: there the passing frames keep the standing height)
  const bob = w < 0 ? 0 : (w === 0 || w === 2 ? -0.5 : pose.dir === UP ? 0 : 0.4);
  const armSwing = w < 0 ? 0 : [-2.2, 0, 2.2, 0][w];

  // boots and legs (in profile the legs close up, so the near foot doesn't hang a
  // pixel or two below the far one and the sole line stays put when he turns)
  const profile = pose.dir === LEFT || pose.dir === RIGHT;
  const legX = profile ? 0.55 : 1;
  // (seen from behind the boots show their heels: set back toward the viewer so the soles
  // sit on the same row as seen from the front, not a pixel higher)
  const toe = pose.dir === UP ? -0.7 : 0.8;
  for (const [sx, fy, lift] of [[-1, rf, rLift], [1, lf, lLift]]) {
    const hip = [sx * 2.5 * legX, 0, 9.4 + bob];
    const ankle = [sx * 2.7 * legX, fy * 0.8, 2.6 + lift];
    P.push(P_cap(hip, ankle, 1.9, "tunicD", { part: 1, grp: sx < 0 ? 11 : 12 }));
    P.push(P_ell([sx * 2.8 * legX, fy * 0.8 + toe, 1.7 + lift], [2.3, 3.1, 1.8], "boot", { part: 2, grp: sx < 0 ? 11 : 12 }));
  }
  // tunic (flared), shoulders, belt
  P.push(P_cone([0, 0, 17.6 + bob], [0, 0.3, 8.6 + bob], 4.6, 5.7, "tunic", { part: 3, grp: 3 }));
  P.push(P_ell([0, 0, 16.4 + bob], [6.0, 4.0, 3.2], "tunic", { part: 3, grp: 3 }));
  P.push(P_cyl([0, 0.1, 10.9 + bob], [0, 0.1, 12.7 + bob], 5.95, "leather", { part: 4, grp: 3, line: false }));
  P.push(P_cap([0, 0, 17.5 + bob], [0, 0.3, 20 + bob], 2.1, "skin", { part: 5, grp: 5 }));
  // head group: tilted back so the face turns toward the camera (3/4 chibi convention)
  // (facing right the face turns away from the light: one tone lighter skin and the
  // fringe lifted a little, or the face sank into shadow under the hair)
  const R = pose.dir === RIGHT;
  const H = [
    P_ell([0, 0.7, 25.2], [7, 7, 7], "skin", { part: 5, grp: 5, tone: R ? 3 : undefined }),
    // hair: cap over the back/top, a fringe that stops above the eyes, side locks, one swept tuft
    P_ell([0, -1.8, 27.4], [7.3, 6.6, 6.5], "hair", { part: 6, grp: 5 }),
    P_ell([0, 4.2, R ? 30.9 : 30.1], [6.8, 3.0, 2.4], "hair", { part: 6, grp: 5 }),
    P_ell([-5.9, 2.4, 26.4], [1.9, 2.4, 3.7], "hair", { part: 6, grp: 5 }),
    P_ell([5.9, 2.4, 26.4], [1.9, 2.4, 3.7], "hair", { part: 6, grp: 5 }),
    P_cone([0.8, -3.2, 31.4], [2.2, -7.0, 31.2], 2.1, 0.6, "hair", { part: 6, grp: 5 }),
  ];
  // (facing right the hero's head tips a little further back: with his face on the side
  // away from the light the fringe hid more of it, and he looked more turned away than
  // facing left)
  const tilt = pose.dir === RIGHT ? 22 * Math.PI / 180 : HEAD_TILT[pose.dir];
  const HT = mMul(mRotZ(HEAD_TURN[pose.dir]), mRotX(tilt)), pivot = [0, 0.3, 19.5 + bob];
  const headMove = (p) => vAdd(pivot, mVec(HT, vSub(p, pivot)));
  for (const q of xformPrims(H, M_ID, [0, 0, bob])) P.push(xformPrims([q], HT, vSub(pivot, mVec(HT, pivot)))[0]);

  // arms. right arm (-x) holds the sword when attacking; left arm (+x) carries the shield
  const atk = pose.attack >= 0 ? pose.attack : -1;
  const rShoulder = [-6.0, 0, 16.2 + bob], lShoulder = [6.0, 0, 16.2 + bob];
  let rHand, rElbow;
  // (facing right the shield arm is the far one: swung forward, its rim poked out by the chin)
  const lSwing = pose.dir === RIGHT ? armSwing * 0.35 : armSwing;
  let lElbow = [6.8, 0.3 + lSwing * 0.5, 12.4 + bob], lHand = [7.0, 1.3 + lSwing, 9.1 + bob];
  let swordDir = null;
  if (atk < 0) {
    rElbow = [-6.8, 0.3 - armSwing * 0.5, 12.4 + bob];
    rHand = [-7.0, 1.3 - armSwing, 8.9 + bob];
    if (pose.use) {                      // throwing / using an item: right arm thrust forward
      rElbow = [-7.4, 3.4, 15.0 + bob]; rHand = [-5.2, 7.6, 14.6 + bob];
      // facing left that fist is on the far side: out ahead of the face, not on it
      if (pose.dir === LEFT) { rElbow = [-6.8, 4.6, 12.4 + bob]; rHand = [-4.0, 11.2, 10.4 + bob]; }
      // facing the viewer a fist thrust at the camera is foreshortened into the idle
      // pose: fling the arm out to the side at chest height instead
      if (pose.dir === DOWN) { rElbow = [-10.2, 2.6, 16.4 + bob]; rHand = [-12.6, 6.0, 16.8 + bob]; }
    } else if (pose.push) {              // both hands flat against the block
      rElbow = [-6.6, 4.0, 12.8 + bob]; rHand = [-4.6, 7.8, 12.4 + bob];
      lElbow = [6.6, 4.0, 12.8 + bob]; lHand = [4.6, 7.8, 12.4 + bob];
      if (pose.dir === LEFT) rHand = [-3.6, 10.2, 10.6 + bob];
      if (pose.dir === RIGHT) lHand = [3.6, 9.4, 12.4 + bob];
    } else if (pose.hold) {              // both arms up, the treasure held over the head
      // (hands clear above the hair, not resting on the face; drawHeldItem sets the
      // treasure on them)
      rElbow = [-9.6, 0.6, 28.0]; rHand = [-4.6, -1.0, 39.5];
      lElbow = [9.6, 0.6, 28.0]; lHand = [4.6, -1.0, 39.5];
    } else if (profile) {
      // the near arm hangs toward the viewer and would read as reaching the knee:
      // carry it a little higher (its hand at the belt, as seen from the front)
      if (pose.dir === RIGHT) { rElbow = vAdd(rElbow, [0.4, 0, 1.6]); rHand = vAdd(rHand, [0.8, 0, 3.4]); }
      else { lElbow = vAdd(lElbow, [-0.4, 0, 1.6]); lHand = vAdd(lHand, [-0.8, 0, 3.4]); }
    }
  } else {
    // wind-up, sweep, full reach (hit frame), recover. The swing runs from the sword
    // hand's side round to the front. Facing the viewer or left, that side is reached
    // from overhead; facing away or right the blade is held out low on that side instead
    // (overhead would put it opposite the arc, and it would jump across the body).
    const side = pose.dir === UP || pose.dir === RIGHT;
    const A = [
      side ? { e: [-8.8, -0.8, 14.6], h: [-9.8, -0.6, 15.2], s: [-0.85, -0.3, 0.2] }
           : { e: [-8.2, -2.2, 18.5], h: [-7.2, -3.8, 22.5], s: [0.25, -0.35, 0.9] },
      { e: [-8.4, 1.8, 15.0], h: [-8.0, 5.6, 14.0], s: [-0.55, 0.8, 0.25] },
      { e: [-5.0, 4.0, 13.4], h: [-2.6, 7.6, 12.2], s: [0, 1, -0.05] },
      { e: [-7.2, 2.4, 12.6], h: [-5.6, 5.8, 10.4], s: [0.1, 0.9, -0.4] },
    ][atk];
    // facing left the sword hand is on the far side: keep it in front of the chest
    // mid-swing, clear of the head
    if (atk === 1 && pose.dir === LEFT) { A.e = [-7.0, 3.4, 13.0]; A.h = [-5.0, 7.6, 12.6]; }
    // facing left the wind-up cocks the blade up behind the far shoulder, fist and grip
    // showing beside the head (straight back at eye level it read as a skewer)
    // (and the fist at shoulder height, out past the back of the head with the guard
    // beside it: raised behind the hair the blade seemed to grow out of his head)
    // (the fist a little further out, so all of it shows past the hair and not one pixel)
    if (atk === 0 && pose.dir === LEFT) { A.e = [-6.4, -6.0, 15.0]; A.h = [-3.6, -11.0, 15.8]; A.s = [0.22, -0.5, 0.84]; }
    // At full reach the blade must cover the sword's hit area on screen: thrust up
    // from a raised arm beside the head when facing away, angled down toward the viewer
    // when facing him.
    if (atk === 2) {
      if (pose.dir === UP) { A.e = [-9.2, 2.6, 17.6]; A.h = [-8.6, 6.4, 22.0]; A.s = [0.06, 0.73, 0.68]; }
      else if (pose.dir === DOWN) { A.h = [-2.6, 8.0, 12.2]; A.s = [0, 0.84, -0.54]; }
      else { A.h = [-2.6, 9.0, 13.0]; A.s = [0, 1, -0.06]; }
    }
    // facing away the blade stays up and in view as it comes back
    if (atk === 3 && pose.dir === UP) { A.e = [-8.2, 1.6, 14.6]; A.h = [-8.6, 4.8, 15.2]; A.s = [-0.35, 0.7, 0.62]; }
    rElbow = vAdd(A.e, [0, 0, bob]);
    rHand = vAdd(A.h, [0, 0, bob]);
    swordDir = vNorm(A.s);
  }
  P.push(P_cap(rShoulder, rElbow, 1.9, "tunic", { part: 7, grp: 7 }));
  P.push(P_cap(rElbow, rHand, 1.6, "skin", { part: 8, grp: 7 }));
  P.push(P_ell(rHand, [2, 2, 2], "skin", { part: 8, grp: 7 }));
  P.push(P_cap(lShoulder, lElbow, 1.9, "tunic", { part: 9, grp: 9 }));
  P.push(P_cap(lElbow, lHand, 1.6, "skin", { part: 10, grp: 9 }));
  P.push(P_ell(lHand, [2, 2, 2], "skin", { part: 10, grp: 9 }));
  // shield strapped to the left forearm, face turned forward-left
  // (1: round buckler, 2: the larger mirror shield that turns spells)
  // (pushing, the shield rides low on the forearm instead of beside the head; facing
  // left it is on the near side and is carried higher, so it doesn't hide the legs)
  const sc = vAdd(vLerp(lElbow, lHand, 0.5), pose.push ? [1.7, 0.2, -1.4] : pose.dir === LEFT ? [1.4, 1.5, 4.0] : [1.7, 1.5, 1.6]);
  const sAxis = vNorm([0.55, 0.83, 0.05]);
  if (pose.shield >= 2) {
    // 2: the mirror shield, 3: the sunforged shield (the same look as in the shop)
    const up = vNorm(vSub([0, 0, 1], vMul(sAxis, sAxis[2])));
    P.push(...shieldPrims(vAdd(sc, vMul(sAxis, 0.6)), sAxis, up, 4.4, pose.shield, 13, 13));
  } else {
    P.push(P_cyl(sc, vAdd(sc, vMul(sAxis, 1.3)), 4.3, "red", { part: 13, grp: 13 }));
    P.push(P_cyl(vAdd(sc, vMul(sAxis, -0.3)), vAdd(sc, vMul(sAxis, 1.0)), 5.0, "gold", { part: 14, grp: 13, line: false }));
  }
  // sword (1: worn blade, 2: steel edge, 3: the dawnblade)
  if (swordDir) {
    // the three blades differ at a glance: a short dull iron one, a longer bright steel
    // one with a gold guard, and the broad golden dawnblade
    const lv = pose.sword || 1;
    const len = [23, 23, 25, 27][lv];
    const grip0 = vAdd(rHand, vMul(swordDir, -2.2)), grip1 = vAdd(rHand, vMul(swordDir, 1.6));
    const tip = vAdd(grip1, vMul(swordDir, len));
    P.push(P_cap(grip0, grip1, 1.0, lv === 3 ? "purple" : "leather", { part: 15, grp: 15 }));
    // crossguard perpendicular to the blade, horizontal-ish
    let side = vNorm([swordDir[1], -swordDir[0], 0]);
    if (vLen([swordDir[1], -swordDir[0], 0]) < 0.2) side = [1, 0, 0];
    // (the wind-up facing left points the blade up and away from the camera, and a level
    // guard ran off into the depth and vanished at the blade's root: there it is turned
    // square to the blade as seen on screen, and the dawnblade's guard is a darker gold
    // than its pale blade, so it shows as a crossbar)
    const windL = atk === 0 && pose.dir === LEFT;
    if (windL) {
      const Y = mRotZ(yawOf(pose.dir)), sw = mVec(Y, swordDir), c = TO_CAM;
      side = vNorm(mTVec(Y, [sw[1] * c[2] - sw[2] * c[1], sw[2] * c[0] - sw[0] * c[2], sw[0] * c[1] - sw[1] * c[0]]));
    }
    const gw = [0, 2.4, 3.2, 4.0][lv] + (windL ? 1.2 : 0);
    P.push(P_cap(vAdd(grip1, vMul(side, -gw)), vAdd(grip1, vMul(side, gw)), 0.9, lv === 1 ? "iron" : "gold", { part: 16, grp: 15, tone: windL && lv === 3 ? 1 : undefined }));
    P.push(P_cone(vAdd(grip1, vMul(swordDir, 0.8)), tip, [0, 1.0, 1.3, 1.7][lv], 0.35, lv === 3 ? "gold" : lv === 2 ? "steel" : "iron",
      { part: 17, grp: 17, shiny: true, tone: lv === 3 ? 3 : lv === 2 ? 4 : 2 }));
  }

  const yaw = yawOf(pose.dir);
  const prims = xformPrims(P, mRotZ(yaw));
  // eyes and buckle as decals (in local space, rotated with the model)
  const decals = [];
  const head = [0, 0.7, 25.2 + bob];
  for (const s of [-1, 1]) {
    const dir = vNorm([s * 0.36, 0.92, 0.12]);
    const p = headMove(vAdd(head, vMul(dir, 7.0)));
    const f = mVec(HT, dir);
    decals.push({ p: yawPt(p, yaw), face: yawPt(f, yaw), px: [[0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.25 });
  }
  const bdir = [0, 1, 0];
  decals.push({ p: yawPt([0, 5.85, 11.8 + bob], yaw), face: yawPt(bdir, yaw), px: [[0, 0, ["gold", 3]], [1, 0, ["gold", 2]], [0, 1, ["gold", 1]], [1, 1, ["gold", 1]]], minFacing: 0.3 });
  return { prims, decals };
}

function renderHero(pose, box) {
  const m = heroPrims(pose);
  box = box || (pose.attack >= 0 ? { w: 88, h: 88, ax: 44, ay: 56 } : pose.hold ? { w: 40, h: 52, ax: 20, ay: 48 } : { w: 40, h: 44, ax: 20, ay: 40 });
  const r = render3D(m.prims, box.w, box.h, box.ax, box.ay, { outline: "char", decals: m.decals });
  // a walking frame keeps the sole line of the standing pose: the foot stepping toward
  // the camera sat a pixel or two lower and the whole figure seemed to bob on the spot
  if (pose.walk >= 0 && !(pose.attack >= 0) && !box.keep) {
    const low = (px) => { for (let y = px.h - 1; y >= 0; y--) for (let x = 0; x < px.w; x++) if (px.d[y * px.w + x] >>> 24) return y; return -1; };
    const idle = render3D(heroPrims(Object.assign({}, pose, { walk: -1 })).prims, box.w, box.h, box.ax, box.ay, { outline: "char" });
    const dy = low(r.pix) - low(idle.pix);
    if (dy) {
      const q = new Pix(r.pix.w, r.pix.h);
      for (let y = 0; y < q.h; y++) { const sy = y + dy; if (sy >= 0 && sy < q.h) q.d.set(r.pix.d.subarray(sy * q.w, sy * q.w + q.w), y * q.w); }
      return { canvas: q.toCanvas(), ax: r.ax, ay: r.ay, pix: q };
    }
  }
  return r;
}

// ============================================================
// ENEMIES (mock-up subset; the full roster comes in stage 4)
// ============================================================
function grubPrims(dir, frame, variant) {
  const mat = variant === "b" ? "tunic" : "red";
  const P = [];
  const sq = frame ? 0.6 : 0;
  P.push(P_ell([0, 0, 7.2 - sq], [8.2 + sq, 7.4 + sq, 6.8 - sq], mat, { part: 1, grp: 1 }));
  // belly patch
  P.push(P_ell([0, 3.0, 5.6 - sq], [5.6, 5.0, 4.4], variant === "b" ? "tunicD" : "gold", { part: 2, grp: 1, tone: variant === "b" ? 3 : 2, line: false }));
  // stubby feet
  for (const [x, y] of [[-4.5, 3.5], [4.5, 3.5], [-4.8, -3], [4.8, -3]]) {
    const lift = frame && ((x < 0) === (y > 0)) ? 1 : 0;
    P.push(P_ell([x, y, 1.4 + lift], [2.2, 2.4, 1.6], mat, { part: 3, grp: 3, tone: 1 }));
  }
  // eye stalks (in profile only the near one: the far one stacked above it)
  const yaw = yawOf(dir), near = (s) => yawPt([s, 0, 0], yaw)[1] > -0.5;
  for (const s of [-1, 1]) {
    if (!near(s)) continue;
    P.push(P_ell([s * 3.0, 3.6, 11.8 - sq], [2.6, 2.4, 2.8], "white", { part: 4 + (s > 0 ? 1 : 0), grp: 4 + (s > 0 ? 1 : 0) }));
  }
  const prims = xformPrims(P, mRotZ(yaw));
  const decals = [];
  // pupils on the front-top of each eye ball, so they still show in profile
  // (white balls without pupils read as eyes popping out)
  for (const s of [-1, 1]) {
    if (!near(s)) continue;
    const p = [s * 3.0, 3.6 + 1.0, 11.8 - sq + 2.5];
    decals.push({ p: yawPt(p, yaw), face: yawPt([0, 0.4, 0.9], yaw), px: [[0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.2, tol: 5 });
  }
  // mouth with fangs
  decals.push({ p: yawPt([0, 7.3, 6.8 - sq], yaw), face: yawPt([0, 1, 0], yaw), px: [[-2, 0, "ink"], [-1, 0, "ink"], [0, 0, "ink"], [1, 0, "ink"], [2, 0, "ink"], [-1, 1, "white"], [1, 1, "white"]], minFacing: 0.3 });
  return { prims, decals };
}

function snapPrims(frame) {
  const P = [];
  // leaves around the base
  for (let i = 0; i < 5; i++) {
    const a = i / 5 * Math.PI * 2 + 0.3;
    const c = [Math.cos(a) * 5.5, Math.sin(a) * 5.5, 1.0];
    P.push(P_ell(c, [4.8, 2.2, 1.0], "leaf", { part: 1, grp: 1, rot: mRotZ(a), tone: 3 }));
  }
  // stem
  P.push(P_cap([0, 0, 1], [0, 0.8, 11], 1.6, "plant", { part: 2, grp: 2, tone: 2 }));
  // head bulb, mouth open toward the viewer
  const open = frame ? 1 : 0;
  P.push(P_ell([0, 1.2, 15.5], [7.2, 6.4, 6.2], "red", { part: 3, grp: 3 }));
  P.push(P_ell([0, 5.8 + open, 15.0], [4.4, 1.8, 3.4 + open], "ink", { part: 4, grp: 4, flat: true }));
  // spots
  const decals = [
    { p: [-4.2, 2.5, 20.2], face: [-0.5, 0.3, 0.8], px: [[0, 0, ["gold", 3]], [1, 0, ["gold", 2]]], minFacing: 0.1 },
    { p: [3.8, 3.2, 19.6], face: [0.5, 0.4, 0.75], px: [[0, 0, ["gold", 3]]], minFacing: 0.1 },
    { p: [-2.2, 6.9, 18.2], face: [0, 1, 0.2], px: [[0, 0, "white"], [2, 0, "white"], [4, 0, "white"]], minFacing: 0.2 },
  ];
  return { prims: P, decals };
}

function oozePrims(frame) {
  const P = [];
  const sq = frame ? 1.2 : 0;
  P.push(P_ell([0, 0, 6.2 - sq * 0.6], [8.6 + sq, 7.6 + sq, 6.6 - sq], "slime", { part: 1, grp: 1, tone: 3 }));
  P.push(P_ell([0, 0.5, 1.6], [9.4 + sq, 8.2 + sq, 1.8], "slime", { part: 1, grp: 1, tone: 2 }));
  const decals = [];
  for (const s of [-1, 1]) decals.push({ p: [s * 2.8, 6.0 + sq * 0.3, 7.6 - sq], face: [0, 1, 0.3], px: [[0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.1 });
  decals.push({ p: [-4.2, 1.2, 11.6 - sq], face: [-0.4, 0.2, 0.9], px: [[0, 0, "white"], [1, 0, "white"], [0, 1, "white"]], minFacing: 0.1 });
  return { prims: P, decals };
}

// Ironshell knight: about 1.2x the hero's height.
// (blued steel: a blue-grey ramp, so the armour stands off the grey stone floors)
// (gunmetal: a derived ramp of existing palette colours, warm dark grey in the shadows
// and blued steel in the light: all-blue armour sank into the blue floor of the ice
// dungeon, which is laid in that very ramp)
for (const k in STYLE_VARIANTS) {
  const R = STYLE_VARIANTS[k].ramps;
  if (!R.gunmetal) R.gunmetal = [R.neutral[0], R.neutral[1], R.dstone[2], R.dstone[3], R.dstone[4]];
}
Object.assign(MATS, { bsteel: { ramp: "gunmetal", base: 2, shiny: true } });
function ironPrims(dir, frame) {
  const P = [];
  const w = frame ? 1 : 0;
  const prof = dir === LEFT || dir === RIGHT;
  // dark blued armour (a mid grey sank into the grey dungeon floor) over a red surcoat
  // (polished: the faces turned to the light catch a pale sheen, so the dark steel
  // still stands off the blue floor of the ice dungeon)
  // (and a pale rim along the lit edges of the silhouette)
  // (the ice dungeon's floor is laid in this very ramp: the lit faces are pushed up to
  // the palest blue and the helmet carries a white glint, so the knight still stands out
  // there by its highlights)
  const sheen = (q, n) => { const l = vDot(n, LIGHT), g = vDot(n, TO_CAM); return l > 0.55 ? 2.6 : (l > 0.25 && g < 0.4) ? 1.9 : l > 0.38 ? 1.3 : 0; };
  for (const sx of [-1, 1]) {
    const fy = (sx < 0) === !!w ? 2 : -2;
    P.push(P_cap([sx * 3, 0, 12], [sx * 3.2, fy * 0.6, 3], 2.4, "bsteel", { part: 1, grp: 20 + sx, tone: 1 }));
    P.push(P_ell([sx * 3.2, fy * 0.6 + 1, 1.9], [2.8, 3.6, 2.0], "bsteel", { part: 1, grp: 20 + sx, tone: 1 }));
  }
  // (the body's lit edge carries the same pale rim: on the blue floor of the ice dungeon
  // a plain dark body sank into the floor, leaving only the crest and belt)
  P.push(P_cone([0, 0, 23], [0, 0, 11], 6.8, 7.2, "bsteel", { part: 2, grp: 2, tone: 1, tex: sheen }));
  P.push(P_frustum([0, 0.2, 9.5], [0, 0, 20], 7.5, 7.0, "red", { part: 3, grp: 2, tone: 1, tex: (q) => (Math.abs(q[0]) < 1.1 ? 0.8 : 0) }));
  P.push(P_ell([0, 0, 22.5], [8.4, 5.4, 4.0], "bsteel", { part: 2, grp: 2, tone: 1, tex: sheen }));
  P.push(P_cyl([0, 0, 12], [0, 0, 13.8], 7.6, "leather", { part: 3, grp: 2, line: false }));
  // helmet with a horsehair crest that arcs from brow to nape (a flat slab read as a box)
  // (facing right the lit side is the back of the head: its sheen there is a step
  // dimmer, so the brightest part of the helmet is not a pale "face" on the back)
  const hSheen = dir === RIGHT ? (q, n) => Math.min(sheen(q, n), q[0] < -2.2 ? 1.6 : 9) : sheen;
  P.push(P_ell([0, 0.3, 31], [7.6, 7.4, 7.8], "bsteel", { part: 4, grp: 4, tone: 1, tex: hSheen }));
  // (the crest's arc is even about the top of the helmet, brow half and nape half the
  // same: weighted to the nape it stood 4 px over the helmet from the front and only
  // 1 px from behind; it runs on a little lower down the nape)
  const crestR = [1.7, 2.0, 2.2, 2.2, 2.0, 1.7, 1.6, 1.4];
  [40, 22, 7, -7, -22, -40, -58, -74].forEach((deg, i) => {
    const a = deg * Math.PI / 180, r = crestR[i];
    P.push(P_ell([0, 7.4 * 1.17 * Math.sin(a), 31 + 7.8 * 1.17 * Math.cos(a)], [1.35, r, r * 0.9], "red", { part: 5, grp: 5, tone: 2 }));
  });
  // kite shield in front (left arm, +x side), spear in the right hand
  // (facing right the shield arm is the far one: the shield is kept behind the body,
  // not poking out beside the visor)
  const shY = dir === RIGHT ? 6.2 : 7.8, shZ = dir === RIGHT ? -2.5 : 0;
  // (facing left the shield is seen edge on, beside the spear: lit to near white, its
  // edge read as a second pale stick. There it is turned a little toward the viewer, so
  // a sliver of the red-crossed face shows, and its rim is the armour's dark blued steel)
  const shC = [4.6, shY, 16 + shZ], shRot = dir === LEFT ? mRotZ(-0.3) : null;
  const shAt = (p) => shRot ? vAdd(shC, mVec(shRot, vSub(p, shC))) : p;
  P.push(P_box(shC, [5.8, 1.2, 7.4], shRot ? "bsteel" : "iron", { part: 6, grp: 6, tone: shRot ? 1 : 3, rot: shRot }));
  P.push(P_cone([4.6, shY, 9.5 + shZ], [4.6, shY, 5.5 + shZ], 5.6, 1.2, "iron", { part: 6, grp: 6, tone: 3 }));
  // (facing right the shield's face is turned away: its cross, seen edge on, was a bright
  // orange stroke under the eye and read as a second face mark)
  if (dir !== RIGHT) {
    P.push(P_box(shAt([4.6, shY + 1.1, 15.5 + shZ]), [1.2, 0.4, 5], "red", { part: 7, grp: 6, line: false, tone: shRot ? 0 : 2, rot: shRot }));
    P.push(P_box(shAt([4.6, shY + 1.1, 17.5 + shZ]), [3.6, 0.4, 1.1], "red", { part: 7, grp: 6, line: false, tone: shRot ? 0 : 2, rot: shRot }));
  }
  // (the spear stands forward of the shoulder, so in profile its point clears the helmet)
  // (in profile it is held out ahead of the chest, level with the body: at the right
  // hand's side it stood behind the helmet facing left and in front of it facing right,
  // so the two profiles showed spears of different heights, one touching the helmet)
  // (from the front and from behind it stands at his side, level with his body, not
  // ahead of it or behind it: ahead of him it came 7 px lower on screen than in the
  // other three facings, its point under the crest and its butt on the ground. Now it
  // is one spear held at one height in all four facings)
  const sp = prof ? [0, 10.4] : [-9.4, 0], top = 48;
  P.push(P_cap([sp[0], sp[1], 4], [sp[0], sp[1], top], 0.9, "wood", { part: 8, grp: 8 }));
  P.push(P_cone([sp[0], sp[1], top], [sp[0], sp[1], top + 8], 1.9, 0.2, "steel", { part: 9, grp: 8 }));
  if (prof) P.push(P_cap([-5.8, 1, 21], [sp[0] - 0.4, sp[1] - 1.6, 19], 2.0, "bsteel", { part: 10, grp: 8, tone: 1 }));
  P.push(P_ell([sp[0] + 0.2, sp[1], 19], [2.3, 2.3, 2.3], "bsteel", { part: 10, grp: 8, tex: sheen }));
  const yaw = yawOf(dir);
  const prims = xformPrims(P, mRotZ(yaw));
  const decals = [
    { p: yawPt([0, 7.5, 31.4], yaw), face: yawPt([0, 1, 0], yaw), px: [[-3, 0, "ink"], [-2, 0, "ink"], [-1, 0, "ink"], [0, 0, "ink"], [1, 0, "ink"], [2, 0, "ink"], [3, 0, "ink"], [-2, -1, ["red", 3]], [2, -1, ["red", 3]]], minFacing: 0.3 },
  ];
  if (dir === LEFT) {
    // side views: a visor slit cut into the helmet's leading edge, the eye glowing in
    // it one pixel in from the edge (a speck right on the edge was lost in the outline
    // and the helmet read as the back of a head). Anchored a little in from the edge,
    // drawn inward along the screen row.
    const a = 74 * Math.PI / 180;
    const ep = [Math.cos(a) * 7.7, 0.3 + Math.sin(a) * 7.5, 32.4];
    decals.push({ p: yawPt(ep, yaw), face: yawPt(vNorm([Math.cos(a), Math.sin(a), 0.2]), yaw), minFacing: 0.02, tol: 3,
      // (the eye one pixel further in, the slit running on past it: right at the edge
      // the orange poked out of the helmet like a beak)
      px: [[-1, 0, "ink"], [0, 0, "ink"], [1, 0, ["red", 3]], [2, 0, ["red", 3]], [3, 0, "ink"], [4, 0, "ink"], [-1, 1, "ink"], [0, 1, "ink"], [1, 1, ["dstone", 3]], [2, 1, ["dstone", 3]], [3, 1, ["dstone", 3]], [-1, -1, "ink"], [0, -1, "ink"], [1, -1, "ink"], [2, -1, "ink"], [3, -1, "ink"]] });
  } else if (dir === RIGHT) {
    // facing right the visor is on the helmet's shadowed side, where an ink slit
    // vanished into the dark steel and the eye sat on the very edge: here the slit gets
    // a lower lip catching the light under it and a thin rim of reflected light up
    // the front edge, and the eye glows one pixel in from that edge. Laid out in screen
    // pixels from the point of the helmet facing the camera (its front edge is 7 px to
    // the right of that point on the eye's row).
    const hc = vAdd(yawPt([0, 0.3, 31], yaw), [0, 7.6 * COS_P, 7.8 * SIN_P]);
    const E = 7, r = 1, rim = ["dstone", 2], lip = ["dstone", 3];
    decals.push({ p: hc, face: TO_CAM, minFacing: 0, tol: 3,
      px: [[E, r, "ink"], [E - 1, r, ["red", 3]], [E - 2, r, ["red", 3]], [E - 3, r, "ink"], [E - 4, r, "ink"],
        [E - 1, r + 1, lip], [E - 2, r + 1, lip], [E - 3, r + 1, lip], [E - 4, r + 1, lip],
        [E, r - 1, rim], [E, r - 2, rim], [E - 1, r + 2, rim]] });
  }
  // a white glint where the light strikes the helmet (whatever way he faces)
  // (in profile it sits high on the dome under the crest, well above the visor, and is a
  // short streak slanting with the dome's curve: a level 2 px dash there read as the eye,
  // the orange eye in the slit below it as a beak, and the knight as a blue duck)
  const hc = yawPt([0, 0.3, 31], yaw), hv = prof ? vNorm([-0.15, 0.3, 0.94]) : vNorm(vAdd(LIGHT, TO_CAM));
  decals.push({ p: vAdd(hc, [hv[0] * 7.4, hv[1] * 7.2, hv[2] * 7.6]), face: hv, px: prof ? [[0, 0, "white"], [1, -1, "white"]] : [[0, 0, "white"], [1, 0, "white"], [0, 1, ["dstone", 4]]], minFacing: 0.1, tol: 3 });
  return { prims, decals };
}

// ============================================================
// PROPS
// ============================================================
// Broadleaf trees, three distinct outlines (all at least 1.8x the hero):
// 0 a round crown, 1 a tall narrow crown on a longer trunk, 2 a low, wide, lopsided oak.
function treePrims(variant) {
  const v = (variant || 0) % 3;
  const P = [];
  const lt = leafTex(4.2, 1.6);
  let blobs;
  if (v === 1) {
    P.push(P_cone([0, 0, 0], [0, 0, 8], 4.8, 3.4, "bark", { part: 1, grp: 1, tex: barkTex }));
    P.push(P_cap([0, 0, 5], [0.8, 0, 44], 3.2, "bark", { part: 1, grp: 1, tex: barkTex }));
    blobs = [
      [[0.5, 2, 46], [8.5, 7, 8]], [[0, 1, 57], [10, 8.5, 9.5]], [[1, 0, 69], [8.5, 7.5, 8.5]],
      [[0.5, -1, 79], [6, 5.5, 6]], [[-5, 2.5, 52], [5.5, 5, 6]], [[5.5, 2, 63], [5.5, 5, 6]],
    ];
  } else if (v === 2) {
    P.push(P_cone([0, 0, 0], [0, 0, 9], 6.6, 4.6, "bark", { part: 1, grp: 1, tex: barkTex }));
    P.push(P_cap([0, 0, 5], [-1, 0, 30], 4.4, "bark", { part: 1, grp: 1, tex: barkTex }));
    P.push(P_cap([-1, 0, 27], [-10, 1, 38], 2.4, "bark", { part: 1, grp: 1, tex: barkTex }));
    P.push(P_cap([-1, 0, 28], [9, 0, 40], 2.2, "bark", { part: 1, grp: 1, tex: barkTex }));
    blobs = [
      [[-2, 1.5, 50], [18, 12, 10.5]], [[-15, 2, 44], [8.5, 8, 7.5]], [[12, 1, 47], [9, 8.5, 7.5]],
      [[-3, 5, 40], [11, 7, 6.5]], [[-6, -2, 60], [10, 8.5, 7.5]], [[7, -1, 58], [8, 7.5, 7]], [[-18, 1, 52], [6, 6, 5.5]],
    ];
  } else {
    P.push(P_cone([0, 0, 0], [0, 0, 8], 5.4, 3.8, "bark", { part: 1, grp: 1, tex: barkTex }));
    P.push(P_cap([0, 0, 5], [0, 0, 36], 3.7, "bark", { part: 1, grp: 1, tex: barkTex }));
    blobs = [
      [[0, 1.5, 54], [14.5, 12, 12.5]], [[-8, 1, 46], [9, 8.5, 8.5]], [[8, 1, 46.5], [9, 8.5, 8.5]],
      [[0, 5, 42], [10.5, 7.5, 7.5]], [[-4, -2.5, 66], [9, 8.5, 8]], [[4.5, -1.5, 65], [8.5, 8, 8]],
    ];
  }
  for (const [c, r] of blobs) P.push(P_ell(c, r, "leaf", { part: 2, grp: 2, tex: lt }));
  return P;
}

// Forest conifer: stacked rounded tiers, about 2.1x the hero's height.
function pinePrims(variant) {
  const P = [P_cone([0, 0, 0], [0, 0, 11], 4.4, 3.2, "bark", { part: 1, grp: 1, tex: barkTex })];
  const lt = leafTex(3.2, 1.5);
  const s = variant === 1 ? 0.9 : 1;
  const tiers = [[12, 14, 30], [26, 11.5, 44], [40, 8.5, 58], [54, 5, 70]];
  tiers.forEach(([z0, r, z1], i) => P.push(P_cone([0, 0.5, z0 * s], [0, 0, z1 * s], r * s, 0.9, "leafD", { part: 2 + i, grp: 2, tex: lt })));
  return P;
}

// Graveyard: a bare, twisted dead tree (about 1.7x the hero).
function deadTreePrims(variant) {
  const P = [P_cone([0, 0, 0], [0, 0, 6], 4.6, 3.2, "bark", { part: 1, grp: 1, tex: barkTex, tone: 1 })];
  const lean = variant ? -1 : 1;
  P.push(P_cap([0, 0, 4], [lean * 2, 0, 30], 2.8, "bark", { part: 1, grp: 1, tex: barkTex, tone: 1 }));
  const branches = [
    [[lean * 1.2, 0, 22], [lean * -9, 1, 34], 1.6],
    [[lean * 1.6, 0, 26], [lean * 10, -1, 40], 1.5],
    [[lean * 2, 0, 30], [lean * 3, 2, 46], 1.3],
    [[lean * -9, 1, 34], [lean * -12, 0, 42], 1.0],
    [[lean * 10, -1, 40], [lean * 14, 1, 45], 0.9],
    [[lean * 3, 2, 46], [lean * -1, 1, 52], 0.8],
  ];
  branches.forEach(([a, b, r], i) => P.push(P_cap(a, b, r, "bark", { part: 1, grp: 1, tone: 1 })));
  return P;
}

// Dungeon portal: carved pillars and a lintel framing a cave mouth in a cliff face.
// Anchor = ground point at the centre of the mouth's tile bottom edge.
function portalPrims(mat, crest, sealed) {
  const P = [
    P_box([-15.5, -3, 28], [3.6, 3.6, 28], mat, { part: 1, grp: 1, tone: 3 }),
    P_box([15.5, -3, 28], [3.6, 3.6, 28], mat, { part: 2, grp: 2, tone: 3 }),
    P_box([-15.5, -3, 57.5], [5, 4.6, 2], mat, { part: 1, grp: 1, tone: 3 }),
    P_box([15.5, -3, 57.5], [5, 4.6, 2], mat, { part: 2, grp: 2, tone: 3 }),
    P_box([0, -4, 63], [21, 5, 4], mat, { part: 3, grp: 3, tone: 3 }),
  ];
  if (crest) P.push(P_cyl([0, 0.5, 63], [0, 2, 63], 5, crest, { part: 4, grp: 4 }));
  if (sealed) {
    // a stone slab fills the arch, marked with the sun of the Sunstone
    const bricks = (q, n) => (n[1] > 0.5 ? ((((q[2] + 60) % 9) < 1 || (((q[0] + 60 + (Math.floor((q[2] + 60) / 9) & 1) * 6) % 12) < 1)) ? -1 : 0) : 0);
    P.push(P_box([0, -2.6, 28], [11.9, 1.5, 28], "stone", { part: 5, grp: 5, tone: 3, tex: bricks }));
    P.push(P_cyl([0, -1.4, 32], [0, -0.5, 32], 6.2, "gold", { part: 6, grp: 6, tone: 2 }));
    P.push(P_cyl([0, -0.6, 32], [0, -0.2, 32], 3.2, "gold", { part: 6, grp: 6, tone: 3, line: false }));
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a);
      P.push(P_cone([c * 6.4, -0.9, 32 + s * 6.4], [c * 9.6, -0.9, 32 + s * 9.6], 1.3, 0.25, "gold", { part: 6, grp: 6, tone: 2 }));
    }
  }
  return P;
}

// The Shadow Keep's gate, built into the ridge: a tall arch between two round towers
// with dark conical roofs and red banners, so the last dungeon never looks like one more
// cave. Sealed, a slab bearing the sun fills the arch; open, the arch is dark.
// Anchor = the gate tile's bottom edge, like the portals.
// (glow: four shards gathered, the seal wakes: its sun burns white and runes light up
// round the arch)
function keepGatePrims(sealed, glow) {
  const P = [];
  const mat = "darkrock", ashlar = (q, n) => (n[1] > 0.5 || Math.abs(n[0]) > 0.5) ? ((((q[2] + 60) % 8) < 1 || (((q[0] + 60 + (Math.floor((q[2] + 60) / 8) & 1) * 5) % 10) < 1)) ? -1 : 0) : 0;
  // curtain wall behind, flush with the cliff
  P.push(P_box([0, -8, 44], [30, 5, 44], mat, { part: 1, grp: 1, tone: 2, tex: ashlar }));
  // the arch: jambs, a stepped lintel, a pointed crown
  for (const s of [-1, 1]) P.push(P_box([s * 20, -2.5, 36], [5, 5.5, 36], mat, { part: 2, grp: 2, tone: 3, tex: ashlar }));
  P.push(P_box([0, -2.5, 77], [25, 5.5, 5], mat, { part: 3, grp: 2, tone: 3, tex: ashlar }));
  for (const x of [-21, -10.5, 0, 10.5, 21]) P.push(P_box([x, -2.5, 85], [3, 4.5, 3], mat, { part: 3, grp: 2, tone: 3 }));   // crenels
  P.push(P_ell([0, 3.3, 77], [4, 1, 4], "red", { part: 4, grp: 2, tone: 2 }));
  if (sealed) {
    const bricks = (q, n) => (n[1] > 0.5 ? ((((q[2] + 60) % 9) < 1 || (((q[0] + 60 + (Math.floor((q[2] + 60) / 9) & 1) * 6) % 12) < 1)) ? -1 : 0) : 0);
    P.push(P_box([0, -3, 36], [15.5, 1.5, 36], "stone", { part: 5, grp: 5, tone: 3, tex: bricks }));
    P.push(P_cyl([0, -1.8, 38], [0, -0.9, 38], 7.5, "gold", { part: 6, grp: 6, tone: 2 }));
    P.push(P_cyl([0, -1, 38], [0, -0.6, 38], 3.8, glow ? "glow" : "gold", { part: 6, grp: 6, tone: 3, line: false }));
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, c = Math.cos(a), s = Math.sin(a), L = glow ? 14.5 : 11.8;
      P.push(P_cone([c * 7.8, -1.3, 38 + s * 7.8], [c * L, -1.3, 38 + s * L], 1.5, 0.25, "gold", { part: 6, grp: 6, tone: glow ? 3 : 2 }));
    }
    if (glow) {
      for (const sx of [-1, 1]) for (const z of [12, 26, 40, 54]) P.push(P_box([sx * 20, 3.2, z], [1.6, 0.4, 2.4], "gold", { part: 7, grp: 7, tone: 3, line: false }));
      for (const x of [-16, -8, 0, 8, 16]) P.push(P_box([x, 3.2, 77], [1.8, 0.4, 1.6], "gold", { part: 7, grp: 7, tone: 3, line: false }));
    }
  } else {
    P.push(P_box([0, -3, 36], [15.5, 1, 36], "ink", { part: 5, grp: 5, flat: true, line: false }));
  }
  // flanking towers with crenels, roofs and banners
  for (const s of [-1, 1]) {
    const tx = s * 42;
    P.push(P_cyl([tx, -4, 0], [tx, -4, 98], 12, mat, { part: 10 + s, grp: 10 + s, tone: 2, tex: ashlar }));
    P.push(P_cyl([tx, -4, 96], [tx, -4, 100], 13.5, mat, { part: 10 + s, grp: 10 + s, tone: 3 }));
    for (let i = 0; i < 6; i++) {
      const a = Math.PI * 0.1 + i * Math.PI / 5;
      P.push(P_box([tx + Math.cos(a) * 12, -4 + Math.sin(a) * 12, 103], [2.4, 2.4, 3], mat, { part: 10 + s, grp: 10 + s, tone: 3 }));
    }
    P.push(P_cone([tx, -4, 100], [tx, -4, 128], 12.5, 0.8, "purple", { part: 12 + s, grp: 12 + s, tone: 1 }));
    P.push(P_box([tx, -4 + 12.4, 90], [0.5, 0.5, 6], "ink", { part: 14, grp: 10 + s, flat: true }));   // arrow slit
    // a red banner hung under the crenels
    P.push(P_box([tx, 8.6, 70], [5, 0.6, 14], "red", { part: 15 + s, grp: 15 + s, tone: 2 }));
    P.push(P_cone([tx - 5, 8.6, 56], [tx, 8.6, 50], 0.6, 0.5, "red", { part: 15 + s, grp: 15 + s, tone: 2 }));
    P.push(P_cone([tx + 5, 8.6, 56], [tx, 8.6, 50], 0.6, 0.5, "red", { part: 15 + s, grp: 15 + s, tone: 2 }));
    P.push(P_box([tx, 9.3, 75], [2.2, 0.4, 2.2], "gold", { part: 17, grp: 15 + s, tone: 3, line: false }));
  }
  return P;
}

// Shop front: a striped awning over the mouth and a painted board with a gem above it,
// so a trader's cave never reads as a dungeon door.
function shopSignPrims() {
  const P = [
    P_box([-9, -2, 46], [1, 1, 8], "wood", { part: 1, grp: 1, tone: 1 }),
    P_box([9, -2, 46], [1, 1, 8], "wood", { part: 1, grp: 1, tone: 1 }),
    P_box([0, -1, 55], [13, 1.2, 6], "wood", { part: 2, grp: 2, tone: 3 }),
  ];
  const tilt = mRotX(-0.45);
  for (let i = 0; i < 6; i++) {
    const x = -15 + i * 6 + 3;
    P.push(xformPrims([P_box([0, 0, 0], [3, 5.5, 0.8], i & 1 ? "white" : "red", { part: 3, grp: 3, tone: i & 1 ? 4 : 2 })], tilt, [x, 4.5, 40])[0]);
  }
  for (const s of [-1, 1]) P.push(P_cap([s * 15.5, 9, 36.5], [s * 15.5, 1, 40.5], 0.7, "wood", { part: 4, grp: 3, tone: 1 }));
  return {
    prims: P,
    decals: [{ p: [0, 0.3, 55.5], face: [0, 1, 0], px: [[0, -2, ["water", 4]], [-1, -1, ["water", 3]], [0, -1, ["water", 4]], [1, -1, ["water", 2]], [-2, 0, ["water", 3]], [-1, 0, ["water", 3]], [0, 0, ["water", 2]], [1, 0, ["water", 2]], [2, 0, ["water", 1]], [-1, 1, ["water", 2]], [0, 1, ["water", 1]], [1, 1, ["water", 1]], [0, 2, ["water", 1]]], minFacing: 0.2 }],
  };
}

// Headstones: rounded slab (0) or cross (1), with a carved mark; 2 = a slab leaning
// over on loose, pushed-up earth (the one that moves).
function gravePrims(variant) {
  if (variant === 2) {
    const tilt = mRotY(0.32);
    const slab = xformPrims([
      P_box([0, 0, 9], [7.5, 3, 9], "stoneL", { part: 2, grp: 2 }),
      P_ell([0, 0, 18], [7.5, 3, 4.6], "stoneL", { part: 2, grp: 2 }),
    ], tilt, [1.5, 0, 1.2]);
    return {
      prims: [
        P_box([0, 0, 1.5], [10, 6.5, 1.5], "stone", { part: 1, grp: 1, tone: 1 }),
        P_ell([-6.5, 3.5, 1.2], [4.5, 3, 1.6], "leather", { part: 3, grp: 3, tone: 2 }),
        ...slab,
      ],
      decals: [{ p: vAdd(mVec(tilt, [0, 3.1, 12]), [1.5, 0, 1.2]), face: mVec(tilt, [0, 1, 0]), px: [[0, -2, ["stone", 0]], [0, -1, ["stone", 0]], [0, 0, ["stone", 0]], [0, 1, ["stone", 0]], [-1, -1, ["stone", 0]], [1, -1, ["stone", 0]]], minFacing: 0.3 }],
    };
  }
  if (variant === 1) {
    return {
      prims: [
        P_box([0, 0, 2], [8, 5.5, 2], "stone", { part: 1, grp: 1, tone: 1 }),
        P_box([0, 0, 15], [2.6, 2.6, 11.5], "stoneL", { part: 2, grp: 2 }),
        P_box([0, 0, 20.5], [8, 2.6, 2.6], "stoneL", { part: 2, grp: 2 }),
      ],
      decals: [],
    };
  }
  return {
    prims: [
      P_box([0, 0, 1.5], [10, 6.5, 1.5], "stone", { part: 1, grp: 1, tone: 1 }),
      P_box([0, 0, 11], [7.5, 3, 9], "stoneL", { part: 2, grp: 2 }),
      P_ell([0, 0, 20], [7.5, 3, 4.6], "stoneL", { part: 2, grp: 2 }),
    ],
    decals: [{ p: [0, 3.1, 14], face: [0, 1, 0], px: [[0, -2, ["stone", 0]], [0, -1, ["stone", 0]], [0, 0, ["stone", 0]], [0, 1, ["stone", 0]], [-1, -1, ["stone", 0]], [1, -1, ["stone", 0]]], minFacing: 0.3 }],
  };
}

// Desert cactus: ribbed trunk with one or two arms.
function cactusPrims(variant) {
  const rib = (q) => ((((Math.floor(q[0] * 0.9 + 20)) % 2) + 2) % 2 ? -0.6 : 0.2);
  const P = [P_cap([0, 0, 1], [0, 0, 32], 4.6, "plant", { part: 1, grp: 1, tone: 3, tex: rib })];
  P.push(P_cap([0, 0.5, 13], [-8, 0.5, 14], 2.8, "plant", { part: 2, grp: 1, tone: 3, tex: rib }));
  P.push(P_cap([-8, 0.5, 14], [-8.5, 0.5, 23], 2.8, "plant", { part: 2, grp: 1, tone: 3, tex: rib }));
  if (variant === 1) {
    P.push(P_cap([0, 0.5, 18], [7.5, 0.5, 19], 2.6, "plant", { part: 3, grp: 1, tone: 3, tex: rib }));
    P.push(P_cap([7.5, 0.5, 19], [8, 0.5, 26], 2.6, "plant", { part: 3, grp: 1, tone: 3, tex: rib }));
  }
  return P;
}

// Burnt bush / felled tree stump with growth rings on top.
// What a burnt bush leaves: a charred, split stump in a ring of grey ash.
// What a burnt shrub leaves: a solid charred stump with a pale cut top showing its
// rings (a dark top read as a hole to walk into), on a flat scorch mark.
function stumpPrims() {
  const char = (q) => (hash2(Math.floor(q[0] * 1.3 + 40), Math.floor(q[2] * 0.8), 9) < 0.4 ? -1 : 0);
  const rings = (q) => { const r = Math.hypot(q[0], q[1]); return (Math.abs(r - 2.4) < 0.5 || r > 4.1) ? -1 : 0; };
  return [
    P_ell([0, 0.5, 0.2], [10, 8, 0.5], "wood", { part: 1, grp: 1, tone: 1, line: false, tex: (q) => (hash2(Math.floor(q[0] + 30), Math.floor(q[1] + 30), 11) < 0.3 ? -1 : 0) }),
    P_cone([0, 0, 0.3], [0, 0, 3], 6.4, 5.4, "bark", { part: 2, grp: 2, tone: 1, tex: char }),
    P_cyl([0, 0, 2], [0, 0, 8], 5, "bark", { part: 2, grp: 2, tone: 1, tex: char }),
    P_ell([0, 0, 8], [4.9, 4.9, 0.7], "wood", { part: 2, grp: 2, tone: 3, tex: rings }),
    P_cone([-4, 1.5, 0.3], [-7, 2.6, 0.3], 2, 0.5, "bark", { part: 2, grp: 2, tone: 1 }),
    P_cone([3.8, 2.2, 0.3], [6.4, 4.4, 0.3], 1.8, 0.5, "bark", { part: 2, grp: 2, tone: 1 }),
    P_ell([1.8, 4.2, 4.6], [1, 0.8, 0.8], "red", { part: 3, grp: 2, tone: 2, line: false }),
  ];
}


function bushPrims(variant) {
  const P = [];
  const lt = leafTex(2.4, 2.0);
  const clumps = [
    [[0, 1, 5.5], [9.5, 7.5, 5.5]],
    [[-6, 1.5, 8], [5.5, 5, 5]],
    [[6, 1, 8.5], [5.5, 5, 5]],
    [[-2, -2, 11.5], [5.5, 5, 4.5]],
    [[3, 2.5, 11], [5, 4.5, 4.5]],
  ];
  if (variant === 1) clumps.push([[0, -3, 14.5], [4.5, 4, 3.8]]);
  for (const [c, r] of clumps) P.push(P_ell(c, r, "leaf", { part: 1, grp: 1, tex: lt, tone: 3 }));
  return P;
}

// A lone boulder in the rock of its region: variant & 1 = shape, variant >> 1 =
// 0 grey field stone, 1 sandstone (desert, banded on its sides like the mesas), 2 dark slate (graveyard)
Object.assign(MATS, { sandst: { ramp: "earth", base: 3 }, darkrock: { ramp: "stone", base: 1 } });
function boulderPrims(variant) {
  const shape = variant & 1, kind = variant >> 1;
  const mat = ["stone", "sandst", "darkrock"][kind] || "stone";
  const st = kind === 1 ? (q, n) => (n[2] < 0.6 && ((q[2] + 40) % 3.2) < 0.8 ? -1 : 0) + (vnoise(q[0] * 0.3 + 5, q[1] * 0.3, 13) - 0.5) * 0.6 : stoneTex;
  if (kind === 1) {
    // desert sandstone breaks into blocks: flat lit tops, banded sides, a crack (smooth
    // sand-coloured ovals read as loaves or potatoes)
    const crack = (q, n) => st(q, n) + (Math.abs(vnoise(q[0] * 0.3 + 2, q[1] * 0.3 + q[2] * 0.2, 31) - 0.5) < 0.035 ? -1.4 : 0) + (n[2] > 0.8 ? 0.6 : 0);
    return [
      xformPrims([P_box([0, 0, 0], [10, 7.5, 6], mat, { part: 1, grp: 1, tex: crack })], mMul(mRotZ(shape ? 0.45 : -0.3), mRotX(0.08)), [0, -1, 6])[0],
      xformPrims([P_box([0, 0, 0], [5.5, 4.5, 3.6], mat, { part: 2, grp: 1, tex: crack })], mRotZ(shape ? -0.5 : 0.8), [6, 4, 3.4])[0],
    ];
  }
  const P = [P_ell([0, 0, 7], [11.5, 9.5, 8.5], mat, { part: 1, grp: 1, tex: st, rot: mRotZ(shape ? 0.5 : -0.3) })];
  P.push(P_ell([4.5, 2.5, 4.5], [6.5, 5.5, 5], mat, { part: 1, grp: 1, tex: st }));
  return P;
}

// Dungeon props
// Guardian statues on plinths, about 1.3x the hero's height; each dungeon has its own
// (a room reads as a different place, not the same room recoloured). Their eyes are
// carved, never lit: a statue with red eyes read as a foe about to move.
// v: 0 overworld, 1..7 the dungeon it stands in.
// (the sphinx's striped headdress: a derived ramp of existing palette colours, two blue
// steps then two gold ones)
for (const k in STYLE_VARIANTS) {
  const R = STYLE_VARIANTS[k].ramps;
  if (!R.nemes) R.nemes = [R.cloth[0], R.cloth[1], R.gold[2], R.gold[3]];
}
Object.assign(MATS, { nemes: { ramp: "nemes", base: 2 }, coolrock: { ramp: "neutral", base: 1 } });
function statuePrims(v) {
  const beast = (mat, horns) => {
    const P = [
      P_box([0, 0, 4], [12, 10, 4], mat, { part: 1, grp: 1, tone: 2 }),
      P_box([0, 0, 9.5], [10, 8, 1.5], mat, { part: 1, grp: 1, tone: 3 }),
      P_ell([0, -1.5, 21], [8.5, 7, 10], mat, { part: 2, grp: 2 }),
      P_ell([0, 3.5, 34], [6.8, 6.2, 6.2], mat, { part: 3, grp: 3 }),
      P_ell([0, 8, 32.5], [3.6, 3.4, 2.9], mat, { part: 3, grp: 3 }),
    ];
    const hl = horns ? 11 : 7;
    P.push(P_cone([-4.5, 2, 39], [-7.5 - (horns ? 3 : 0), 1, 39 + hl], 2.1, 0.4, mat, { part: 3, grp: 3 }));
    P.push(P_cone([4.5, 2, 39], [7.5 + (horns ? 3 : 0), 1, 39 + hl], 2.1, 0.4, mat, { part: 3, grp: 3 }));
    for (const s2 of [-1, 1]) P.push(P_cap([s2 * 5, 4.5, 12], [s2 * 5, 7, 22], 2.4, mat, { part: 4, grp: 4 }));
    return P;
  };
  const eyes = (z) => [-1, 1].map(s2 => ({ p: [s2 * 2.9, 9.0, z], face: [0, 1, 0.2], px: [[0, 0, "ink"]], minFacing: 0.1 }));
  switch (v) {
    case 1: {
      // the tidal cave: a sea serpent coiled on its plinth, finned head raised
      const scales = (q) => (hash2(Math.floor(q[0] * 0.8 + 30), Math.floor(q[2] * 0.8 + q[1] * 0.4 + 30), 61) < 0.18 ? -0.8 : 0);
      const P = [
        P_box([0, 0, 4], [12, 10, 4], "dstone", { part: 1, grp: 1, tone: 2 }),
        P_ell([0, 0, 11], [9.5, 8, 3.2], "dstone", { part: 2, grp: 2, tone: 3, tex: scales }),
        P_ell([0.5, -0.5, 16.2], [7.8, 6.5, 3], "dstone", { part: 3, grp: 2, tone: 3, tex: scales }),
        P_ell([0, -1, 20.8], [6, 5, 2.8], "dstone", { part: 2, grp: 2, tone: 3, tex: scales }),
        P_cap([0, -0.5, 22], [0, 2.5, 30.5], 3.1, "dstone", { part: 4, grp: 4, tone: 3, tex: scales }),
        P_ell([0, 5, 33], [4.2, 6, 3.4], "dstone", { part: 5, grp: 5, tone: 3 }),
        P_ell([0, 8.4, 31.4], [2.6, 2.6, 1.4], "dstone", { part: 5, grp: 5, tone: 2 }),
      ];
      for (const [y, z, h] of [[3, 36, 5], [0, 35, 5.5], [-2.5, 32.5, 5]]) P.push(P_cone([0, y, z], [0, y - 2.5, z + h], 1.6, 0.3, "dstone", { part: 6, grp: 5, tone: 2 }));
      for (const s2 of [-1, 1]) P.push(P_cone([s2 * 3.6, 3.5, 33.5], [s2 * 8, 1.5, 37.5], 1.7, 0.3, "dstone", { part: 6, grp: 5, tone: 2 }));
      return { prims: P, decals: [-1, 1].map(s2 => ({ p: [s2 * 2.5, 8.2, 34.3], face: [s2 * 0.3, 0.7, 0.6], px: [[0, 0, "ink"]], minFacing: 0.1 })) };
    }
    case 2: {
      const P = beast("stoneL");
      for (const [x, y, z, r] of [[4, 2, 17, 2.8], [-7, 3, 7, 3], [-4, -3, 14, 3]]) P.push(P_ell([x, y, z], [r, r * 0.8, r * 0.7], "moss", { part: 5, grp: 2, tone: 2, line: false }));
      return { prims: P, decals: eyes(35.8) };
    }
    case 3: {
      // a hooded mourner with bowed head and folded hands (the barrow's dead)
      const P = [
        P_box([0, 0, 3], [10, 8, 3], "stone", { part: 1, grp: 1, tone: 2 }),
        P_frustum([0, 0, 6], [0, 0.5, 30], 8.5, 5.5, "stone", { part: 2, grp: 2, tone: 3, tex: (q) => (((Math.atan2(q[1], q[0]) + 4) * 2.4) % 1 < 0.14 ? -0.8 : 0) }),
        P_ell([0, 1.5, 33], [6, 6, 6.5], "stone", { part: 3, grp: 3, tone: 3 }),
        P_ell([0, 5.5, 31.5], [3.4, 1.4, 3.6], "ink", { part: 4, grp: 3, flat: true, line: false }),
        P_ell([0, 6.5, 20], [3.2, 2.4, 2.6], "stone", { part: 5, grp: 5, tone: 3 }),
      ];
      return { prims: P, decals: [] };
    }
    case 4: {
      // a sphinx: a lion lying on its block with its chest raised, forelegs laid out in
      // front, under a pharaoh's striped headdress (a rounded brown body read as a potato
      // or a loaf; a grey squared figure on a near-black block read as a little robot on a
      // hole in the floor)
      // (round two: carved in sandstone on a mid-grey block with a flat, unlit-looking top
      // (a pale dithered top read as sand), the lion's back and haunches swelling out
      // behind the chest, the headdress striped gold and blue right across, its side
      // panels flaring out to the shoulders round a face with two open eyes)
      // the headdress: a derived ramp of palette colours, blue in its two dark steps and
      // gold in its two light ones, toned by screen row into gold bands with a blue stripe
      // under every two (lit faces take the lighter step of each)
      const nemes = (q, n, px, py) => ((py % 3) === 0 ? 0 : 2) + (shadeOffset(n, false) > -0.4 ? 1 : 0) - 2 - shadeOffset(n, false);
      const o = (part, grp) => ({ part, grp, tone: 3 });
      const P = [
        P_box([0, 0, 3.5], [11.5, 10, 3.5], "stone", { part: 1, grp: 1, tone: 2, tex: (q, n) => (n[2] > 0.9 ? -1.3 : 0) }),
        // the lion's back and haunches, the raised chest (squared: a round one caught a
        // band of dither across it like a sash), the forelegs
        P_ell([0, -3.5, 11.5], [7.5, 6.5, 4.8], "sandst", o(2, 2)),
        P_ell([-5.2, -6.0, 11.0], [3.6, 3.6, 4.2], "sandst", o(2, 2)),
        P_ell([5.2, -6.0, 11.0], [3.6, 3.6, 4.2], "sandst", o(2, 2)),
        P_box([0, 2.6, 15.2], [5.2, 2.4, 7.0], "sandst", o(3, 3)),
        P_cap([-4.2, 2.5, 10.5], [-4.4, 8.6, 9.0], 2.1, "sandst", o(6, 5)),
        P_cap([4.2, 2.5, 10.5], [4.4, 8.6, 9.0], 2.1, "sandst", o(6, 7)),
        // the face, and the headdress: a flat top, a back, and two panels flaring out
        // beside the face down to the shoulders
        P_box([0, 3.6, 26.2], [3.0, 1.7, 3.8], "sandst", o(4, 4)),
        P_box([0, 1.6, 31.0], [4.4, 3.6, 1.2], "nemes", { part: 5, grp: 5, tone: 2, tex: nemes }),
        P_box([0, -0.8, 26.4], [4.6, 1.6, 5.0], "nemes", { part: 5, grp: 5, tone: 2, tex: nemes }),
      ];
      for (const s2 of [-1, 1]) P.push(xformPrims([P_box([0, 0, 0], [1.9, 1.3, 5.0], "nemes", { part: 5, grp: 5, tone: 2, tex: nemes })], mRotY(-s2 * 0.3), [s2 * 4.9, 3.0, 25.6])[0]);
      // open carved eyes, a mouth line, and the toes cut in the paws
      const dc = (p, px, face) => ({ p, face: face || [0, 1, 0], px, minFacing: 0.1, tol: 4 });
      return { prims: P, decals: [
        dc([0, 5.4, 27.6], [[-2, 0, "ink"], [1, 0, "ink"]]),
        dc([0, 5.4, 24.4], [[0, 0, ["earth", 1]], [-1, 0, ["earth", 1]]]),
        dc([-4.4, 10.6, 9.0], [[0, 0, ["earth", 1]], [1, 0, ["earth", 1]]], [0, 1, 0.3]),
        dc([4.4, 10.6, 9.0], [[0, 0, ["earth", 1]], [-1, 0, ["earth", 1]]], [0, 1, 0.3]),
      ] };
    }
    case 5: {
      // an obelisk of blue ice on a snow-dusted plinth
      return { prims: [
        P_box([0, 0, 3.5], [10, 8, 3.5], "dstone", { part: 1, grp: 1, tone: 3 }),
        P_cone([0, 0, 7], [0, 0, 36], 6.5, 3.5, "teal", { part: 2, grp: 2, tone: 3, tex: (q) => (((q[2] + 40) % 7) < 1 ? -1 : 0) }),
        P_cone([0, 0, 35.5], [0, 0, 44], 3.6, 0.3, "teal", { part: 2, grp: 2, tone: 4 }),
        P_cone([4, 1, 8], [8, 2, 20], 2.4, 0.3, "teal", { part: 3, grp: 3, tone: 4 }),
        P_cone([-4, 1, 8], [-8, 1, 17], 2.2, 0.3, "teal", { part: 3, grp: 3, tone: 4 }),
      ], decals: [] };
    }
    case 6: {
      // a fire altar: a square basalt pillar with a carved flame on its face and a
      // squared bowl on top, a tall flame standing up out of it, red outside and yellow at
      // the heart (a round bowl with an ember lid on a cracked round stalk read as a
      // mushroom, an acorn or a fist)
      // (round two: the pillar is cool dark basalt with a pale lit top edge, brown with a
      // dithered trim it read as a wooden crate; the bowl is square and low so its rim no
      // longer framed the flame in tan; the flame is orange with a yellow heart and red
      // only round its rim, in three pointed tongues, all flat colour like the lava)
      const bands = (q, n) => (n[2] < 0.5 && (Math.abs(q[2] - 8.2) < 0.6 || Math.abs(q[2] - 24.4) < 0.6) ? -1 : 0);
      const P = [
        P_box([0, 0, 3], [10, 8, 3], "coolrock", { part: 1, grp: 1, tone: 1 }),
        P_box([0, 0, 16], [5, 4.4, 10], "coolrock", { part: 2, grp: 2, tone: 1, tex: bands }),
        P_box([0, 0, 27.0], [6.2, 5.6, 1.0], "coolrock", { part: 3, grp: 3, tone: 2 }),
        P_box([0, 0, 29.4], [5.6, 5.0, 1.4], "coolrock", { part: 3, grp: 3, tone: 1 }),
        P_box([0, 0, 30.9], [4.6, 4.0, 0.2], "redD", { part: 4, grp: 3, tone: 0, line: false, flat: true }),
      ];
      // tongues: [base x, base radius, tip x, tip z]; each inner layer is moved toward
      // the camera (so it is drawn over the one behind without moving on screen)
      const fw = (p, k) => vAdd(p, vMul(TO_CAM, k));
      const tongues = [[0, 4.6, 0.4, 48.5], [-3.0, 2.6, -5.4, 41.5], [3.0, 2.5, 5.2, 40.5]];
      for (const [x, r, tx, tz] of tongues) {
        P.push(P_cone([x, 0.2, 30.8], [tx, 0.2, tz], r, 0.2, "red", { part: 5, grp: 5, tone: 2, flat: true }));
        P.push(P_cone(fw([x * 0.95, 0.2, 31.2], 3), fw([tx * 0.92, 0.2, tz - 1.9], 3), r - 1.0, 0.2, "red", { part: 6, grp: 5, tone: 3, flat: true, line: false }));
      }
      P.push(P_cone(fw([0, 0.2, 31.4], 6), fw([0.3, 0.2, 42.5], 6), 2.4, 0.2, "gold", { part: 7, grp: 5, tone: 3, flat: true, line: false }));
      P.push(P_ell(fw([0, 0.2, 34.0], 8), [1.1, 0.6, 1.5], "glow", { part: 8, grp: 5, tone: 0, flat: true, line: false }));
      // a flame rune glowing on the pillar's face
      const rune = [[0, -3, ["gold", 3]], [-1, -2, ["gold", 3]], [0, -2, ["gold", 3]], [-1, -1, ["gold", 3]], [0, -1, ["red", 3]], [1, -1, ["gold", 3]], [-2, 0, ["gold", 3]], [-1, 0, ["red", 3]], [0, 0, ["red", 3]], [1, 0, ["gold", 3]], [-2, 1, ["gold", 3]], [-1, 1, ["red", 3]], [0, 1, ["red", 2]], [1, 1, ["red", 3]], [2, 1, ["gold", 3]], [-1, 2, ["gold", 3]], [0, 2, ["red", 3]], [1, 2, ["gold", 3]], [0, 3, ["gold", 2]]];
      return { prims: P, decals: [{ p: [0, 4.45, 16.5], face: [0, 1, 0], px: rune, minFacing: 0.1, tol: 3 }] };
    }
    case 7: {
      // the Shadow Keep: a horned gargoyle with bat wings raised behind it
      const P = beast("purple", true);
      for (const s2 of [-1, 1]) {
        P.push(P_ell([s2 * 11, -5, 30], [7.5, 1.4, 10.5], "purple", { part: 6, grp: 6 + s2, tone: 1, rot: mRotY(-s2 * 0.45) }));
        for (const [a, L] of [[0.2, 13], [0.75, 12], [1.25, 9]]) P.push(P_cap([s2 * 7, -4.5, 26], [s2 * (7 + Math.cos(a) * L), -5.5, 26 + Math.sin(a) * L + 6], 0.9, "purple", { part: 7, grp: 6 + s2, tone: 2 }));
      }
      return { prims: P, decals: eyes(35.8) };
    }
    default: return { prims: beast("darkrock", true), decals: eyes(35.8) };
  }
}

// Push block: stone cube with a raised rim on top and a carved sun disc.
function blockTex(q, n) {
  if (n[2] > 0.9) {
    const inset = Math.max(Math.abs(q[0]) - 10.5, Math.abs(q[1]) - 14.5);
    if (inset > 0) return 0.6;                       // raised rim
    if (inset > -1.3) return -1.2;                   // carved groove
    const r = Math.hypot(q[0] / 1.0, q[1] / 1.3);
    if (r > 5.2 && r < 6.6) return -1;               // carved ring
    return 0;
  }
  if (n[1] > 0.9) return (Math.abs(q[0]) > 12.6 ? -0.6 : 0) + (q[2] > 16 ? 0.7 : 0);
  return 0;
}
function blockPrims(mat) {
  mat = mat || "stone";
  const tex = (q, n) => blockTex(q, n) + (vnoise(q[0] * 0.4 + 3, q[1] * 0.4 + q[2] * 0.4, 21) - 0.5) * 0.7;
  return [P_box([0, 0, 9.5], [14.8, 18.6, 9.5], mat, { part: 1, grp: 1, tone: 2, tex })];
}

// Door furniture. Anchor = ground point on the wall line at the door's centre.
function archPrims(mat) {
  // the opening under the lintel is 59 units (38 px) tall: clearly taller than the hero (31 px)
  const H = 48 / COS_P;                 // wall height in world units
  return [
    P_box([-37, -3, H / 2], [5, 6, H / 2], mat, { part: 1, grp: 1, tone: 2 }),
    P_box([37, -3, H / 2], [5, 6, H / 2], mat, { part: 2, grp: 2, tone: 2 }),
    P_box([0, -3, (59 + H) / 2], [42, 6.5, (H - 59) / 2], mat, { part: 3, grp: 3, tone: 2 }),
    P_box([0, -0.5, (59 + H) / 2], [5, 5, (H - 59) / 2 + 0.5], mat, { part: 4, grp: 4, tone: 3 }),
  ];
}
// Locked side door. A door slab in a side wall would be edge-on to this camera, so
// side passages are sealed by a "key block": a stone block wearing a gold keyhole
// plate on its top and its front. (North doors use a real door, face-on.)
function lockBlockPrims(depth, height, mat) {
  const hy = depth / 2, hz = height / 2;
  const tex = (q, n) => (vnoise(q[0] * 0.3 + 7, q[1] * 0.3 + q[2] * 0.3, 23) - 0.5) * 0.8;
  return [
    P_box([0, 0, hz], [30, hy, hz], mat, { part: 1, grp: 1, tone: 2, tex }),
    P_box([0, 0, height + 0.5], [9, 11, 0.7], "gold", { part: 2, grp: 2, tone: 2 }),
    P_box([0, hy + 0.5, hz + 1], [8, 0.7, 7], "gold", { part: 3, grp: 3, tone: 2 }),
  ];
}
function lockDecals(depth, height) {
  const hy = depth / 2;
  return [
    { p: [0, 1, height + 1.3], face: [0, 0, 1], px: [[-1, -2, "ink"], [0, -2, "ink"], [-1, -1, "ink"], [0, -1, "ink"], [0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.3, tol: 4 },
    { p: [0, hy + 1.3, height / 2 + 2], face: [0, 1, 0], px: [[-1, -1, "ink"], [0, -1, "ink"], [0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.3, tol: 4 },
  ];
}
// Closed shutter in a side gap: an iron grate block.
function grateBlockPrims(depth, height) {
  const hy = depth / 2, hz = height / 2;
  const bars = (q, n) => {
    const along = n[2] > 0.5 ? q[1] : q[0];
    return (((along % 7) + 7) % 7) < 2.2 ? -1.6 : 0.3;
  };
  return [P_box([0, 0, hz], [31, hy, hz], "iron", { part: 1, grp: 1, tone: 2, tex: bars })];
}
function sconcePrims() {
  return [
    P_box([0, 1.5, 38], [2.2, 3.4, 1.4], "iron", { part: 1, grp: 1 }),
    P_cyl([0, 4, 38.5], [0, 4, 42], 3, "iron", { part: 2, grp: 1 }),
  ];
}

function brazierPrims() {
  return [
    P_cone([0, 0, 0], [0, 0, 5], 5, 3, "iron", { part: 1, grp: 1 }),
    P_cap([0, 0, 4], [0, 0, 11], 2, "iron", { part: 1, grp: 1 }),
    P_cone([0, 0, 11], [0, 0, 15], 3, 7, "iron", { part: 2, grp: 2 }),
  ];
}

// Hook post: a stout iron-bound timber with a ring on top for the tether to bite.
// (painted in red and white bands under a big gold ring, so it reads as a target for
// the hook, not as a barrel)
function hookPostPrims() {
  const P = [P_cyl([0, 0, 0], [0, 0, 20], 4.6, "wood", { part: 1, grp: 1, tone: 2, tex: barkTex })];
  for (const [z0, z1, m, t] of [[3, 7, "red", 2], [7, 11, "white", 4], [11, 15, "red", 2], [15, 19, "white", 4]]) P.push(P_cyl([0, 0, z0], [0, 0, z1], 4.9, m, { part: 2, grp: 1, tone: t, line: false }));
  const n = 12, R = 6.4, cz = 27.5;
  for (let i = 0; i < n; i++) {
    const a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n;
    P.push(P_cap([Math.cos(a0) * R, 0.4, cz + Math.sin(a0) * R], [Math.cos(a1) * R, 0.4, cz + Math.sin(a1) * R], 1.5, "gold", { part: 3, grp: 3, tone: 3 }));
  }
  P.push(P_cap([0, 0, 19], [0, 0.4, cz - R], 1.4, "iron", { part: 4, grp: 3, tone: 2 }));
  return P;
}
// Crystal eye on a stone pedestal (a switch struck from afar by an arrow or the
// boomerang). Asleep: a stone ball with a violet eyelid shut over it. Awake: a white eye with a
// gold iris staring out of a gold socket ring.
function eyeSwitchPrims(awake) {
  const P = [
    P_frustum([0, 0, 0], [0, 0, 3.5], 7.2, 6.2, "stoneL", { part: 1, grp: 1, tone: 2 }),
    P_cyl([0, 0, 3.5], [0, 0, 13], 3.8, "stoneL", { part: 1, grp: 1, tone: 2, tex: (q) => (Math.abs(((q[2] + 0.5) % 3) - 1.5) < 0.3 ? -1 : 0) }),
    P_frustum([0, 0, 13], [0, 0, 15.5], 4.2, 6.4, "stoneL", { part: 1, grp: 1, tone: 3 }),
  ];
  // (asleep, the ball in the socket is pale carved stone bearing a shut eye: an almond
  // of violet eyelid outlined in ink, the lid's lower edge curving down across it and
  // lashes hanging from it. A violet ball with a dark seam read as a crystal ball.)
  // (the shut eye is laid out pixel by pixel: cells by screen column c and row r from
  // the ball's centre, K = the dark line, 1-3 = the lid's violet tones, . = bare stone)
  // (round two: the violet lid sits over a curved lid line that sags in the middle, with
  // three fine lashes hanging one pixel under it; an almond outlined all round read as a
  // violet gem or a drowsy slot. The lashes hang straight under pixels of the line, or
  // the renderer's stray-pixel pass would take them for specks and wipe them.)
  const EYE = [".........", "..33322..", "K3333222K", ".K32221K.", "..KKKKK..", "..1.1.1..", "........."];
  const cell = (q) => { const c = Math.floor(q[0]) + 4, r = Math.floor(q[1] * SIN_P - (q[2] - 21) * COS_P + 0.5) + 3; return r >= 0 && r < EYE.length && c >= 0 && c < 9 ? EYE[r][c] : "."; };
  // (asleep, the ball is cut from a derived ramp of palette colours: four violet steps
  // for the lid and its line, then three stone ones for the bare ball)
  const lidTone = (q, n) => { const k = cell(q), so = shadeOffset(n, false), f = 5 + so; return k === "." ? (f < 4 ? 4 - f : f > 6 ? 6 - f : 0) : (k === "K" ? 0 : +k) - f; };
  const E = [P_ell([0, 0, 0], [5.4, 5.4, 5.4], awake ? "white" : "lidball", { part: 2, grp: 2, tone: awake ? 4 : 5, shiny: awake, tex: awake ? undefined : lidTone })];
  const n = 14, R = 5.6;
  for (let i = 0; i < n; i++) {
    const a0 = i * 2 * Math.PI / n, a1 = (i + 1) * 2 * Math.PI / n;
    E.push(P_cap([Math.cos(a0) * R, 1.4, Math.sin(a0) * R * 0.8], [Math.cos(a1) * R, 1.4, Math.sin(a1) * R * 0.8], 1.1, "gold", { part: 3, grp: 3, tone: awake ? 3 : 2 }));
  }
  if (awake) {
    E.push(P_ell([0, 4.6, 0], [2.9, 1.0, 2.9], "gold", { part: 4, grp: 4, tone: 3, line: false }));
    E.push(P_ell([0, 5.3, 0], [1.2, 0.6, 1.8], "ink", { part: 5, grp: 4, line: false }));
    E.push(P_ell([-1.9, 5.0, 1.9], [0.8, 0.5, 0.8], "white", { part: 6, grp: 4, tone: 4, line: false }));
    return P.concat(upright(E, 21));
  }
  return P.concat(upright(E, 21));
}
for (const k in STYLE_VARIANTS) {
  const R = STYLE_VARIANTS[k].ramps;
  if (!R.lidball) R.lidball = [R.purple[0], R.purple[1], R.purple[2], R.purple[3], R.stone[2], R.stone[3], R.stone[4]];
}
Object.assign(MATS, { lidball: { ramp: "lidball", base: 5 } });
// Heavy rock: a squat boulder of broken blocks, too big to lift bare-handed.
// (angular with cracks: a smooth blue dome read as a slime. In the warm "stone" ramp its
// lit tops came out tan and it read as desert sandstone in the ice dungeon, so dungeon
// rocks are cut from the cold grey ramp instead.)
// v: 0 cold grey dungeon rock (the default everywhere), 2 warm field granite (overworld
// mountains); 1 is the same as 0 (a frost-dusted look read as a tarp or slime, and the
// plain grey already stands out on the ice dungeon's blue floor).
// (the cold rock's faces toward the camera are a step darker than its lit tops: at the
// floor's own grey they vanished into the grey-violet floor of the Shadow Keep)
Object.assign(MATS, { coldrock: { ramp: "neutral", base: 2 } });
function heavyRockPrims(v) {
  v = v || 0;
  const mat = v === 2 ? "stone" : "coldrock", front = v === 2 ? 0 : -1;
  const crack = (q, n) => (Math.abs(vnoise(q[0] * 0.3 + 3, q[1] * 0.3 + q[2] * 0.3, 27) - 0.5) < 0.035 ? -1.5 : 0) + (vnoise(q[0] * 0.4, q[2] * 0.4, 28) - 0.5) * 0.6 + (n[1] > 0.6 && n[2] < 0.5 ? front : 0);
  const blocks = [
    [[10, 8.5, 7.5], mMul(mRotZ(0.35), mRotX(0.12)), [0, 0, 7], 2],
    [[7, 6, 5.5], mMul(mRotZ(-0.5), mRotY(0.3)), [-3, 2, 14], 3],
    [[5, 5, 4], mRotZ(0.9), [7, -3, 13], 2],
  ];
  return blocks.map(([h, m, t, tone]) => xformPrims([P_box([0, 0, 0], h, mat, { part: 1, grp: 1, tone, tex: crack })], m, t)[0]);
}
// Peg: a thick wooden stake with an iron cap, standing proud until hammered flush.
function pegPrims() {
  return [
    P_cyl([0, 0, 0], [0, 0, 14], 5.8, "wood", { part: 1, grp: 1, tone: 3, tex: (q) => (((Math.atan2(q[1], q[0]) + 4) * 2) % 1 < 0.15 ? -0.8 : 0) }),
    P_cyl([0, 0, 13.6], [0, 0, 16.4], 6.4, "iron", { part: 2, grp: 2, tone: 2 }),
    P_ell([0, 0, 16.4], [4.4, 4.4, 1.4], "iron", { part: 2, grp: 2, tone: 3 }),
  ];
}

// ============================================================
// TERRAIN FURNITURE: bridges and docks, bank stones, cave mouths, loose rubble
// (placed by terrainProps in props.js; rubble is baked into the ground by terrain.js)
// ============================================================
// A bridge's deck stands 2 px proud of the water line (3 units), so everything on it
// starts there.
const DECK_Z = 3;
// Bridge post: a round log on the deck's edge with a flat end-grain top and one iron
// band. long: a post on the deck's front (south) edge, which runs on down past the
// deck into the water like a pile. Anchor = the post's foot on the deck.
function bridgePostPrims(long) {
  const bark = (q, n) => (n[2] > 0.9 ? 0 : ((Math.floor(q[2] * 0.8 + 40) + Math.floor(Math.atan2(q[1], q[0]) * 2.2 + 9)) % 3 === 0 ? -0.8 : 0));
  // (the flat top sits 0.3 below a whole tone, clear of the dither band)
  const grain = (q) => (Math.abs(Math.hypot(q[0], q[1]) - 1.2) < 0.45 ? -1.3 : -0.3);
  return [
    P_cyl([0, 0, long ? -12 : DECK_Z - 0.5], [0, 0, DECK_Z + 11.5], 2.4, "wood", { part: 1, grp: 1, tone: 2, tex: bark }),
    P_cyl([0, 0, DECK_Z + 11.5], [0, 0, DECK_Z + 12.3], 2.1, "wood", { part: 1, grp: 1, tone: 2, tex: grain }),
    // (the band's lit edge on the left only: the right half of its top rim, and its right
    // side, turn away into shade)
    P_cyl([0, 0, DECK_Z + 8.2], [0, 0, DECK_Z + 9.4], 2.65, "iron", { part: 2, grp: 2, tone: 2, tex: (q, n) => (n[2] > 0.5 ? (q[0] > 0.6 ? -2 : 0) : n[0] > 0.25 ? -1.2 : 0) }),
  ];
}
// Bridge rail: a thin pole at hand height. Each piece covers one tile and runs past its
// sprite's edges, so the pieces of neighbouring tiles join without a seam; where a post
// stands the rail ends inside it. axis "x" runs along a north or south edge, "y" along a
// west or east edge; cut bit 1 = ends at a post 4 px into the tile at its west (north)
// end, bit 2 = at its east (south) end.
// Sprites: "x" 32 x 16, anchor (16, 12) = the tile's middle on the rail's ground line;
// "y" 12 x 32, anchor (6, 38) = the tile's bottom row (the rail climbs 7 px on screen).
const RAIL_Z = DECK_Z + 8;
function bridgeRailPrims(axis, cut) {
  const tex = (q, n) => (n[2] > 0.5 ? -0.2 : 0);
  if (axis === "x") {
    const a = cut & 1 ? -12 : -24, b = cut & 2 ? 12 : 24;
    return [P_cyl([a, 0, RAIL_Z], [b, 0, RAIL_Z], 1.25, "wood", { part: 1, grp: 1, tone: 2, tex })];
  }
  const a = cut & 1 ? -27 / SIN_P : -48, b = cut & 2 ? -3 / SIN_P : 8;
  return [P_cyl([0, a, RAIL_Z], [0, b, RAIL_Z], 1.25, "wood", { part: 1, grp: 1, tone: 2, tex })];
}
// A stone half sunk in the bank where a bridge lands (one per end, beside a post):
// v 0 and 2 small, 1 and 3 larger, each turned its own way.
function bankStonePrims(v) {
  const r = (i) => hash2(v, i, 977), s = v & 1 ? 1 : 0.7;
  return [P_ell([0, 0, 1.2 * s], [(3.4 + r(1) * 1.2) * s, (2.6 + r(2) * 0.8) * s, 2.4 * s], "stone", { part: 1, grp: 1, tone: 2, tex: (q) => stoneTex(q) * 0.5, rot: mRotZ(r(3) * 3) })];
}
// Cave mouth: a rough arch of boulders standing proud of the cliff face round the 24 x 36
// opening, its lintel breaking the cliff's skyline by a few pixels.
// mat: "stone" (grey), "darkrock" (slate), "sandst" (desert). shop: a timber frame inside
// the arch (under the shop's sign). Anchor = the middle of the mouth's tile bottom edge.
function caveLipPrims(mat, shop) {
  const tex = (q) => stoneTex(q) * 0.5;
  const P = [];
  // [centre x, y, z, radii x, y, z, turn] — footing stones, the jambs, the head of the
  // arch (screen px: z units x 0.64; the opening's straight sides reach 27 px, its crown
  // 36 px); unequal stones, wider than tall, like rough-dressed voussoirs
  const stones = [
    [-15.8, 1.4, 5.5, 5.8, 4.2, 6, 0.3], [15.6, 1.2, 6.5, 5.2, 4, 6.6, -0.2],
    [-15.2, 0.8, 19, 4.6, 3.6, 7.5, -0.15], [15.4, 0.8, 21, 4.8, 3.6, 7.8, 0.25],
    [-14, 0.8, 34, 5, 3.6, 7, 0.35], [14.2, 0.8, 35.5, 4.6, 3.6, 6.6, -0.3],
    [-8.6, 0.8, 49, 6, 3.6, 5.6, 0.55], [8.8, 0.8, 49.5, 5.8, 3.6, 5.8, -0.5],
    [0, 1.2, 60, 7.4, 4, 7.4, 0.05],
  ];
  // (a shop keeps only its two footing stones: its timber frame and the sign above it
  // stand where the jambs and the head of the arch would)
  stones.forEach(([x, y, z, rx, ry, rz, a], i) => { if (!shop || i < 2) P.push(P_ell([x, y, z], [rx, ry, rz], mat, { part: 1 + i, grp: 1 + i, tone: mat === "darkrock" ? 2 : 3, tex, rot: mRotY(a) })); });
  if (shop) {
    // two posts and a head beam in the opening (the sign hangs in front of the beam)
    const wood = (q, n) => (n[0] < -0.5 ? 0.6 : 0) + ((Math.floor(q[2] * 0.7 + 40) % 5) === 0 ? -0.6 : 0);
    P.push(P_box([-10.4, -1.2, 26], [1.4, 1.2, 26], "wood", { part: 20, grp: 20, tone: 2, tex: wood }));
    P.push(P_box([10.4, -1.2, 26], [1.4, 1.2, 26], "wood", { part: 21, grp: 21, tone: 2, tex: wood }));
    P.push(P_box([0, -1, 51.5], [12.4, 1.4, 1.6], "wood", { part: 22, grp: 22, tone: 2, tex: wood }));
  }
  return P;
}
// A loose stone lying on the ground: a broken, angular chunk (sharp) or a rounded
// pebble. big stones are about 7 px across, small ones 4. Anchor = its ground contact.
function rubblePrims(seed, big, mat, sharp) {
  const r = (i) => hash2(seed, i, 961), s = big ? 1 : 0.6;
  const tex = (q, n) => (n[2] > 0.9 ? -0.3 : 0);
  const P = sharp
    ? [P_box([0, 0, 2.1 * s], [(2.8 + r(1) * 1.8) * s, (2.2 + r(2) * 1.4) * s, 2.1 * s], mat, { part: 1, grp: 1, tone: 2, tex, rot: mMul(mRotZ(r(3) * 3), mRotX((r(4) - 0.5) * 0.6)) })]
    : [P_ell([0, 0, 1.6 * s], [(3 + r(1) * 1.6) * s, (2.4 + r(2) * 1.2) * s, 1.9 * s], mat, { part: 1, grp: 1, tone: 2, rot: mRotZ(r(3) * 3) })];
  if (big && r(5) < 0.55) P.push(P_box([2.6, 1.2, 1.4], [1.8, 1.5, 1.4], mat, { part: 2, grp: 2, tone: 2, tex, rot: mRotZ(r(6) * 3) }));
  return P;
}
