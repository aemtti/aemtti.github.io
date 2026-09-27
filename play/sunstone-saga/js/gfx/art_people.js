"use strict";
// ---------- People: one body plan shared with the hero, dressed per character ----------
Object.assign(MATS, { ash: { ramp: "neutral", base: 2 } });   // plain grey cloth (iron is shiny)
// o: { dir, frame, scale, robe: [mat, tone] | null, tunic: [mat, tone], skin, hair: [mat, tone] | null,
//      style: "short"|"bald"|"long"|"messy", beard: [mat, tone], hat: "cap"|"scarf"|"circlet"|"hood",
//      hatMat: [mat, tone], apron: [mat, tone], tray: [mat, tone], staff: true, brows: [mat, tone],
//      upTilt: degrees (the head's lean seen from behind, when HEAD_TILT[UP] leaves it short) }
function personPrims(o) {
  const P = [];
  const dir = o.dir === undefined ? DOWN : o.dir;
  const bob = o.frame ? 0.5 : 0;
  const M = (spec, extra) => Object.assign({ tone: spec[1] }, extra);
  // legs and shoes show under a tunic; a robe or dress hides them
  if (!o.robe) {
    // (the shoe has a heel behind the ankle, so from behind the feet still show; seen
    // from behind it sits a little further back, so the heel comes as far toward the
    // viewer as the toe does from the front and the back view stands on the same line)
    // (in profile the feet stand closer together: the near shoe, a full stride toward the
    // viewer, reached a pixel below the front view's toes and the side view sank a pixel)
    const shoeY = dir === UP ? -0.4 : 0.4, sp = dir === LEFT || dir === RIGHT ? 0.6 : 1;
    for (const sx of [-1, 1]) {
      P.push(P_cap([sx * 2.5 * sp, 0, 9.4], [sx * 2.7 * sp, 0.2, 2.6], 1.9, o.legs ? o.legs[0] : "tunicD", M(o.legs || ["tunicD", 1], { part: 1, grp: 11 + sx })));
      P.push(P_ell([sx * 2.8 * sp, shoeY, 1.7], [2.3, 3.5, 1.8], "boot", { part: 2, grp: 11 + sx }));
    }
    P.push(P_cone([0, 0, 17.6], [0, 0.3, 8.6], 4.6, 5.7, o.tunic[0], M(o.tunic, { part: 3, grp: 3 })));
    P.push(P_ell([0, 0, 16.4], [6.0, 4.0, 3.2], o.tunic[0], M(o.tunic, { part: 3, grp: 3 })));
  } else {
    P.push(P_frustum([0, dir === UP ? -0.2 : 0.2, 0], [0, 0, 17.5], 7.8, 5.0, o.robe[0], M(o.robe, { part: 3, grp: 3, tex: (q) => (((Math.atan2(q[1], q[0]) + 4) * 2.5) % 1 < 0.12 ? -0.7 : 0) })));
    P.push(P_ell([0, 0, 16.6], [6.2, 4.2, 3.2], o.robe[0], M(o.robe, { part: 3, grp: 3 })));
  }
  // (apronTop: a shorter apron that leaves a band of shirt under a long beard)
  if (o.apron) { const t = o.apronTop || 17; P.push(P_box([0, 5.2, (t + 4.6) / 2], [4.0, 0.5, (t - 4.6) / 2], o.apron[0], M(o.apron, { part: 4, grp: 3, rot: mRotX(-0.12) }))); }
  // a tray of wares held level at the belly, a red fruit and a blue bottle standing on it.
  // Each facing gets the board it needs (drawn per direction, like a sprite): from the
  // front a board 8 px wide held close under his hands, high enough to sit on the shirt
  // (far forward it dropped on screen to his knees, pale on the sand); in profile a thin
  // level plank sticking out 4-5 px, only 2-3 px tall, with the goods standing up above
  // its top edge (the camera's steep look down turned the front view's width into height,
  // and the board stood up as a box or a book). Dark red-brown wood, clear of the sand.
  const trayAt = o.tray && ((dir === LEFT || dir === RIGHT)
    ? { y: 7.8, z: 14.0, hw: 0.7, hd: 3.3, ht: 0.6, fruit: [0, 0.4, 1.4], fr: 1.0, bottle: [0, -1.6], hands: [[-1.3, -2.4, -0.9], [1.3, -2.4, -0.9]] }
    : { y: 6.6, z: 16.0, hw: 4.2, hd: 1.2, ht: 0.8, rim: true, fruit: [-2.0, 0.1, 1.9], fr: 1.2, bottle: [2.0, -0.2], hands: [[-3.9, -0.3, -1.6], [3.9, -0.3, -1.6]] });
  if (trayAt) {
    const { y: ty, z: tz, ht } = trayAt;
    P.push(P_box([0, ty, tz], [trayAt.hw, trayAt.hd, ht], o.tray[0], M(o.tray, { part: 4, grp: 4 })));
    // (from the front the board lies inside his outline, where nothing edges it: a dark
    // backing a size larger shows as a one-pixel rim round it)
    if (trayAt.rim) P.push(P_box([0, ty - 0.5, tz - 0.4], [trayAt.hw + 1.0, trayAt.hd, ht + 1.3], "hair", { part: 4, grp: 4, tone: 0, flat: true, line: false }));
    P.push(P_ell(vAdd([0, ty, tz + ht - 0.6], trayAt.fruit), [trayAt.fr, trayAt.fr, trayAt.fr], "red", { part: 12, grp: 12, tone: 2 }));
    const bx = trayAt.bottle[0], by = ty + trayAt.bottle[1];
    P.push(P_cyl([bx, by, tz + ht], [bx, by, tz + ht + 2.4], 0.9, "teal", { part: 13, grp: 13, tone: 3 }));
  }
  if (o.belt) P.push(P_cyl([0, 0.1, 10.9], [0, 0.1, 12.7], 5.95, o.belt[0], M(o.belt, { part: 4, grp: 3, line: false })));
  P.push(P_cap([0, 0, 17.5], [0, 0.3, 20], 2.1, "skin", { part: 5, grp: 5, tone: o.skin }));
  // head (tilted toward the camera like the hero's)
  const H = [P_ell([0, 0.7, 25.2], [7, 7, 7], "skin", { part: 5, grp: 5, tone: o.skin })];
  const hair = o.hair;
  if (hair && o.style !== "bald") {
    H.push(P_ell([0, -1.8, 27.4], [7.3, 6.6, 6.5], hair[0], M(hair, { part: 6, grp: 5 })));
    if (o.style === "long") {
      H.push(P_ell([0, -3.4, 21.5], [7.0, 4.2, 7.5], hair[0], M(hair, { part: 6, grp: 5 })));
      for (const s of [-1, 1]) H.push(P_ell([s * 6.1, 1.6, 23.5], [1.9, 2.6, 5.2], hair[0], M(hair, { part: 6, grp: 5 })));
    } else {
      // (sideburns; under a peaked cap they are left out in profile, where the near one
      // stuck out under the peak in tan like a skin-coloured brim or a long nose)
      if (!(o.hat === "cap" && (dir === LEFT || dir === RIGHT))) for (const s of [-1, 1]) H.push(P_ell([s * 5.9, 2.4, 26.4], [1.9, 2.4, 3.7], hair[0], M(hair, { part: 6, grp: 5 })));
      // (tufts stand up, not back: pointing back they faced the camera from behind and
      // the back of the head read as a flat-topped box)
      if (o.style === "messy") for (const [x, y] of [[-3, -5], [2, -6], [4.5, -3]]) H.push(P_cone([x * 0.6, y * 0.3, 31.5], [x * 0.9, y * 0.35, 35.5], 1.8, 0.5, hair[0], M(hair, { part: 6, grp: 5 })));
      else H.push(P_ell([0, 4.2, 30.1], [6.8, 3.0, 2.4], hair[0], M(hair, { part: 6, grp: 5 })));
    }
  } else if (hair) {
    // bald crown with a fringe of hair round the back and sides
    H.push(P_ell([0, -3.2, 25.4], [7.2, 5.2, 4.2], hair[0], M(hair, { part: 6, grp: 5 })));
  }
  if (o.beard && o.beardStyle === "short") {
    // a trimmed beard that stays on the chin (the hermit's hangs to his chest)
    H.push(P_ell([0, 5.2, 20.8], [5.4, 2.8, 3.4], o.beard[0], M(o.beard, { part: 7, grp: 5 })));
  } else if (o.beard && o.beardStyle === "full") {
    // a broad, squared beard close to the chest (in profile it must not jut like a beak)
    H.push(P_ell([0, 4.6, 20.4], [5.8, 2.9, 4.6], o.beard[0], M(o.beard, { part: 7, grp: 5 })));
    H.push(P_ell([0, 5.0, 17.4], [4.2, 2.3, 3.0], o.beard[0], M(o.beard, { part: 7, grp: 5 })));
  } else if (o.beard) {
    H.push(P_ell([0, 5.6, 20.6], [5.2, 3.2, 5.2], o.beard[0], M(o.beard, { part: 7, grp: 5 })));
    H.push(P_ell([0, 6.6, 17.2], [3.2, 2.2, 3.6], o.beard[0], M(o.beard, { part: 7, grp: 5 })));
  }
  // (the mustache sits close to the lip and keeps to the hair's darker tones: lit to the
  // top of the ramp it jutted out tan in profile, under the cap, like a long nose)
  if (o.mustache) for (const s of [-1, 1]) H.push(P_ell([s * 2.2, 6.9, 22.6], [2.4, 1.1, 1.1], o.mustache[0], M(o.mustache, { part: 7, grp: 5, rot: mRotY(s * 0.3), tex: () => -0.8 })));
  if (o.hat === "cap") {
    // the crown, and a peaked brim in the same cloth jutting well out over the brow, so in
    // profile the peak reads as part of the cap
    // (in profile the crown's rim and the peak sit higher, the crown's top where it was:
    // pulled down to the brow they left only 4 px of face over the collar, mostly
    // moustache, and no eye)
    const pf = dir === LEFT || dir === RIGHT;
    H.push(P_ell([0, -0.6, pf ? 31.0 : 30.2], [7.4, 7.2, pf ? 3.8 : 4.6], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
    H.push(P_ell([0, 6.6, pf ? 30.2 : 29.0], [5.4, 3.8, 0.9], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
  } else if (o.hat === "scarf") {
    H.push(P_ell([0, -0.8, 27.4], [7.8, 7.4, 7.0], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
    H.push(P_ell([0, -4.4, 20.4], [4.8, 3.2, 4.2], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
  } else if (o.hat === "circlet") {
    H.push(P_cyl([0, 0.2, 29.6], [0, 0.2, 30.8], 7.35, "gold", { part: 8, grp: 5, tone: 2, line: false }));
  } else if (o.hat === "felt") {
    // a soft round-crowned hat with a turned-down brim and a band
    H.push(P_cyl([0, 0.2, 29.0], [0, 0.2, 30.0], 9.2, o.hatMat[0], M(o.hatMat, { part: 8, grp: 8, tone: o.hatMat[1] - 1 })));
    H.push(P_ell([0, -0.2, 30.6], [6.6, 6.4, 4.0], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
    H.push(P_cyl([0, -0.1, 29.9], [0, -0.1, 31.2], 6.6, "gold", { part: 8, grp: 8, tone: 2, line: false }));
  } else if (o.hat === "hood") {
    H.push(P_ell([0, -1.2, 26.4], [8.2, 7.8, 8.2], o.hatMat[0], M(o.hatMat, { part: 8, grp: 8 })));
  }
  // (upTilt: seen from behind, a head whose hair or cap sits at the back leans a little
  // further, so the back view stands as tall as the front one)
  // (in profile the head leans less toward the camera than from the front and its top
  // came a pixel lower on most people; lifted 0.8 it stands exactly as tall as the front
  // view for all seven, with the feet on the same line too)
  const tilt = dir === UP && o.upTilt !== undefined ? o.upTilt * Math.PI / 180 : HEAD_TILT[dir];
  const hb = bob + (dir === LEFT || dir === RIGHT ? 0.8 : 0);
  const HT = mMul(mRotZ(HEAD_TURN[dir]), mRotX(tilt)), pivot = [0, 0.3, 19.5 + hb];
  for (const q of xformPrims(H, M_ID, [0, 0, hb])) P.push(xformPrims([q], HT, vSub(pivot, mVec(HT, pivot)))[0]);
  // arms: hanging, one hand on a staff, or both holding the tray by its sides
  const arm = o.robe ? o.robe : o.tunic;
  const trayHand = (i) => vAdd([0, trayAt.y, trayAt.z], trayAt.hands[i]);
  const rHand = o.staff ? [-7.6, 3.4, 13.5] : trayAt ? trayHand(0) : [-7.0, 1.4, 9.2 + bob];
  const lHand = trayAt ? trayHand(1) : [7.0, 1.4, 9.2 + bob];
  for (const [s, hand] of [[-1, rHand], [1, lHand]]) {
    const elbow = [s * 6.9, 0.6, 12.8 + bob];
    P.push(P_cap([s * 6.0, 0, 16.2 + bob], elbow, 1.9, arm[0], M(arm, { part: 9, grp: 12 + s })));
    P.push(P_cap(elbow, hand, 1.6, "skin", { part: 10, grp: 12 + s, tone: o.skin }));
    P.push(P_ell(hand, [2, 2, 2], "skin", { part: 10, grp: 12 + s, tone: o.skin }));
  }
  if (o.staff) {
    P.push(P_cap([-7.8, 3.6, 0.5], [-7.4, 3.2, 33], 0.95, "wood", { part: 11, grp: 11, tone: 2 }));
    P.push(P_ell([-7.4, 3.2, 33.5], [1.8, 1.8, 1.6], "wood", { part: 11, grp: 11, tone: 3 }));
  }
  const yaw = yawOf(dir);
  let prims = xformPrims(P, mRotZ(yaw));
  const decals = [];
  const headMove = (p) => vAdd(pivot, mVec(HT, vSub(p, pivot)));
  for (const s of [-1, 1]) {
    const d0 = vNorm([s * 0.36, 0.92, 0.12]);
    const p = headMove(vAdd([0, 0.7, 25.2 + hb], vMul(d0, 7.0)));
    decals.push({ p: yawPt(p, yaw), face: yawPt(mVec(HT, d0), yaw), px: o.closedEyes ? [[0, 0, "ink"], [s, 0, "ink"]] : [[0, 0, "ink"], [0, 1, "ink"]], minFacing: 0.25 });
    if (o.brows) {
      const b = headMove(vAdd([0, 0.7, 25.2 + hb], vMul(vNorm([s * 0.4, 0.86, 0.32]), 7.0)));
      decals.push({ p: yawPt(b, yaw), face: yawPt(mVec(HT, d0), yaw), px: [[-1, 0, o.brows], [0, 0, o.brows], [1, 0, o.brows]], minFacing: 0.25, tol: 3 });
    }
  }
  if (o.scale && o.scale !== 1) return scaleModel({ prims, decals }, o.scale);
  return { prims, decals };
}

// The cast. frame 1 = talking (a small nod).
const PEOPLE = {
  npc_hermit: { robe: ["red", 1], skin: 2, hair: ["white", 4], style: "bald", beard: ["white", 4], brows: ["white", 0], staff: true, closedEyes: true },
  npc_shop:   { tunic: ["moss", 3], legs: ["leather", 2], skin: 2, hair: ["hair", 1], mustache: ["hair", 1], hat: "cap", hatMat: ["red", 2], tray: ["hair", 2], belt: ["leather", 1], upTilt: -24 },
  npc_sage:   { robe: ["white", 4], skin: 3, hair: ["white", 4], style: "long", hat: "circlet", belt: ["gold", 2], scale: 0.96 },
  // the village elder wears a felt hat and a trimmed beard: nothing like the bald,
  // long-bearded hermit in his cave
  npc_elder:  { robe: ["tunic", 2], skin: 2, hair: ["white", 4], style: "short", beard: ["white", 4], beardStyle: "short", brows: ["white", 0], staff: true, hat: "felt", hatMat: ["leather", 2], belt: ["gold", 2], scale: 0.96 },
  // the smith: sooty grey shirt, brown leather apron, black beard (all browns ran together)
  npc_smith:  { tunic: ["ash", 2], legs: ["leather", 1], skin: 2, hair: ["hair", 0], style: "bald", beard: ["hair", 0], beardStyle: "full", apron: ["leather", 3], apronTop: 13, belt: ["leather", 0], scale: 1.05 },
  npc_widow:  { robe: ["purple", 2], skin: 2, hair: ["white", 4], hat: "scarf", hatMat: ["dstone", 3], closedEyes: true, scale: 0.96 },
  npc_kid:    { tunic: ["red", 3], legs: ["tunicD", 1], skin: 3, hair: ["hair", 3], style: "messy", scale: 0.8, upTilt: -32 },
};
function npcPrims(key, dir, frame) {
  const o = Object.assign({ dir, frame }, PEOPLE[key]);
  return personPrims(o);
}
