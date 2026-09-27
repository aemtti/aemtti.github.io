"use strict";
// ---------- Dungeon, cave and house furniture built with the 3D kit ----------
// Floor switches (a real plate in a stone frame), crystal clusters and fallen stones for
// the caves, the small things hung on the house walls (windows, a shelf, a chart, a
// child's drawing, a tool rack) and the links of the hook's chain.
// Floor things use the normal game camera; things on a wall are drawn head-on with the
// door kit's elevation camera (DoorKit.ELEV: 1 model unit = 1 px across and up the wall).
// Everything lands on whole palette tones; nothing is blended.

const DunArt = (() => {
  const cache = new Map();
  const memo = (k, f) => { let v = cache.get(k); if (v === undefined) { v = f(); cache.set(k, v); } return v; };
  const mat = (ramp, shiny) => DoorKit.mat(ramp, shiny);
  // a Pix -> its canvas and a copy with every pixel one step darker (the scene's shade layer)
  function withShade(pix) {
    const sh = new Pix(pix.w, pix.h);
    for (let i = 0; i < pix.d.length; i++) if (pix.d[i]) sh.d[i] = darker(pix.d[i]);
    return { pix, canvas: pix.toCanvas(), shade: sh.toCanvas(), w: pix.w, h: pix.h };
  }
  // head-on render of a wall item (model x across, z up the wall, y out of the wall)
  function wallRender(P, W, Hh, ax, ay) {
    return render3D(DoorKit.snapTones(xformPrims(P, DoorKit.ELEV)), W, Hh, ax, ay, { outline: "prop" });
  }

  // ------------------------------------------------------------------ E17 floor switch
  // A stone frame set flush in the floor (its top one tone over the flagstones, lit on its
  // north and west rims, dark on its south and east), a dark gap ring, and a round gold
  // plate standing proud of it: up, its 3 px front face shows; pressed, it sits 3 px lower
  // with no front face, its body a step darker and its engraving (a ring and eight rays)
  // lit. Two in-between heights for the travel. A switch whose room is solved stays down
  // for good: its plate turns to cold blue steel with the engraving glowing pale.
  // Normal game camera; 36 x 36, anchored on the tile centre.
  const SW_Z = { up: 4.7, mid1: 3.1, mid2: 1.6, held: 0.45, solved: 0.45 };
  const SW_LIT = { up: false, mid1: false, mid2: true, held: true, solved: true };
  // the engraving's pixels: [sprite column, row from the top face's centre line]; the plate
  // is 20 px across (columns 8-27, centre between 17 and 18), its top face 15 rows tall
  const SW_MARK = [];
  for (const [ry, xs] of [[-4, [16, 17, 18, 19]], [-3, [14, 15, 20, 21]], [-2, [13, 22]], [-1, [13, 22]], [0, [13, 22]], [1, [13, 22]], [2, [14, 15, 20, 21]], [3, [16, 17, 18, 19]],
    [-6, [17, 18]], [5, [17, 18]], [-1, [10, 11, 24, 25]], [0, [10, 11, 24, 25]], [-5, [12, 23]], [4, [12, 23]]]) for (const x of xs) SW_MARK.push([x, ry]);
  // the sun's disc inside the ring
  const SW_FILL = [];
  for (const [ry, x0, x1] of [[-3, 16, 19], [-2, 14, 21], [-1, 14, 21], [0, 14, 21], [1, 14, 21], [2, 16, 19]]) for (let x = x0; x <= x1; x++) SW_FILL.push([x, ry]);
  // Light seeping out round the foot of a block standing on a switch (the block covers the
  // whole plate, so this is all the player sees of a pressed switch): 2 px of floor just
  // outside the tile's west, east and south edges, brightest at the middle of each edge and
  // dithered out toward the corners. stage 1: the plate half way down (a short glint); 2:
  // down. ramp: gold while held, water once the room is solved. 36 x 36 on the tile centre.
  function switchGlow(ramp, stage) {
    return memo("swg|" + ramp + "|" + stage, () => {
      const p = new Pix(36, 36), hi = ramp === "gold" ? pc("gold", 3) : pc("water", 4), mid = ramp === "gold" ? pc("gold", 2) : pc("water", 3), core = pc("white", 0);
      const put = (x, y, c) => { p.d[(y + 18) * 36 + x + 18] = c; };
      // s: 0 at the middle of the edge, 1 at its corner; row 0 against the block, row 1 outside it
      const glow = (s, row, x, y) => {
        if (stage === 1) return row === 0 ? (s < 0.2 ? hi : s < 0.4 ? mid : s < 0.6 && ((x + y) & 1) ? mid : 0) : 0;
        if (row === 0) return s < 0.22 ? core : s < 0.5 ? hi : s < 0.8 ? mid : ((x + y) & 1) ? mid : 0;
        return s < 0.5 ? mid : s < 0.75 && ((x + y) & 1) ? mid : 0;
      };
      for (let k = -16; k < 16; k++) {
        const s = Math.abs(k + 0.5) / 16;
        for (const row of [0, 1]) {
          let c = glow(s, row, k, 16 + row); if (c) put(k, 16 + row, c);            // south
          c = glow(s, row, -17 - row, k); if (c) put(-17 - row, k, c);           // west
          c = glow(s, row, 16 + row, k); if (c) put(16 + row, k, c);             // east
        }
      }
      const out = withShade(p);
      out.ax = 18; out.ay = 18;
      return out;
    });
  }
  function switchPrims(floorRamp, state) {
    const HY = 15 / SIN_P, z = SW_Z[state], lit = SW_LIT[state];
    // (flat bias, spec 1.4: an up-facing top gets +1.30 from the light; -0.3 lands it on a
    // whole tone, clear of the dither band that the stray-pixel cleanup turned into a wedge)
    const frameTex = (q, n) => {
      if (n[2] < 0.9) return 0;
      const ex = 15 - Math.abs(q[0]), ey = HY - Math.abs(q[1]);
      let t = -0.3;
      if (ex < 1.2 || ey < 1.5) t += (q[0] < 0 && ex < 1.2) || (q[1] < 0 && ey < 1.5) ? 1 : -1;
      return t;
    };
    // (the top face lands on a whole tone: base 1 + 1.30 from the light - 0.3 up, - 1.3 down;
    // its engraving is drawn pixel by pixel afterwards, see SW_MARK)
    const plateTex = (q, n) => n[2] < 0.9 ? 0 : lit ? -1.3 : -0.3;
    const plate = state === "solved" ? mat("water") : mat("gold");
    return [
      P_box([0, 0, -0.6], [15, HY, 0.6], mat(floorRamp), { part: 1, grp: 1, tone: 2, tex: frameTex }),
      // the gap round the plate: a thin dark ring
      P_cyl([0, 0, -0.2], [0, 0, 0.08], 11.6, "ink", { part: 2, grp: 2, tone: 0, flat: true }),
      P_cyl([0, 0, 0], [0, 0, z], 10, plate, { part: 3, grp: 3, tone: state === "solved" ? 1 : 1, tex: plateTex }),
    ];
  }
  function switchSprite(floorRamp, state) {
    return memo("sw|" + floorRamp + "|" + state, () => {
      const r = render3D(DoorKit.snapTones(switchPrims(floorRamp, state)), 36, 36, 18, 18, { outline: "prop" });
      const d = r.pix.d, z = SW_Z[state], lit = SW_LIT[state], W = 36;
      const frameCols0 = new Set(STYLE.ramps[floorRamp].map(hexU32)), ink = inkU32();
      // the groove shows as a dark line all round the plate (behind a raised plate too)
      const plateCols = new Set(STYLE.ramps[state === "solved" ? "water" : "gold"].map(hexU32)), grooves = [];
      for (let y = 1; y < 35; y++) for (let x = 1; x < 35; x++) {
        const i = y * W + x;
        if (!frameCols0.has(d[i])) continue;
        if (plateCols.has(d[i - 1]) || plateCols.has(d[i + 1]) || plateCols.has(d[i - W]) || plateCols.has(d[i + W])) grooves.push(i);
      }
      for (const i of grooves) d[i] = ink;
      // the raised plate throws a short shadow onto the frame, down and to the right
      const sx = Math.round(z * 0.54), sy = Math.round(z * 0.3), cy = 18 - z * COS_P;
      const frameCols = frameCols0;
      if (sx || sy) {
        const onPlate = (x, y) => { const dx = (x + 0.5 - 18) / 10, dy = (y + 0.5 - cy) / (10 * SIN_P); return dx * dx + dy * dy <= 1; };
        const upd = [];
        for (let y = 0; y < 36; y++) for (let x = 0; x < W; x++) {
          const c = d[y * W + x];
          if (!c || !frameCols.has(c) || onPlate(x, y)) continue;
          if (onPlate(x - sx, y - sy) && Math.hypot(x + 0.5 - 18, (y + 0.5 - 18) / SIN_P) > 11.6) upd.push(y * W + x);
        }
        for (const i of upd) d[i] = darker(d[i]);
      }
      // the engraving: a sun (a ring and eight rays), the same pixels in every state so it
      // never changes shape as the plate moves; cut one tone dark while the plate is up, lit
      // once it is down, pale on the solved plate with a white glint on its upper left
      const pr = state === "solved" ? "water" : "gold", prTone = new Map();
      STYLE.ramps[pr].forEach((c, t) => prTone.set(hexU32(c), t));
      const c0 = Math.round(18 - z * COS_P);          // the top face's centre line: rows c0-1 | c0
      for (const [x, ry] of SW_MARK) {
        const i = (c0 + ry) * W + x, t = prTone.get(d[i]);
        if (t === undefined) continue;                  // (never over the outline or the frame)
        d[i] = pc(pr, state === "solved" ? 4 : lit ? 3 : Math.max(0, t - 1));
      }
      // the solved sun is lit right through: its disc filled pale inside the ring (a pale ring
      // round the dark plate read as an eye), a white glint on its upper left
      if (state === "solved") {
        for (const [x, ry] of SW_FILL) { const i = (c0 + ry) * W + x; if (prTone.has(d[i])) d[i] = pc(pr, 3); }
        d[(c0 - 3) * W + 16] = pc("white", 0); d[(c0 - 2) * W + 15] = pc("white", 0);
      }
      const out = withShade(r.pix);
      out.ax = 18; out.ay = 18;
      return out;
    });
  }

  // ------------------------------------------------------------------ E23 cave accents
  // A vein of dull crystal growing out of the rock at the foot of a cave wall (normal camera):
  // five or six thin points, matt (no glint), rising from a heap of the wall's own rock that
  // wraps their feet, so they read as part of the cave and not as a gem lying on the floor
  // (a few bright points on the bare floor, blue like the gem counter, looked like loot).
  // ramp: dstone (the common slate blue), neutral (graves), hair (desert jasper).
  function crystalCluster(ramp, seed) {
    return memo("cry2|" + ramp + "|" + seed, () => {
      const m = mat(ramp), st = mat("stone"), r = (i) => hash2(seed, i, 431);
      let part = 1;
      // a point: a narrow cone standing in the rock, leaning out from the vein
      const one = (h, rad, lean, rot, dx, dy, tone) => {
        const R = mMul(mRotZ(rot), mRotX(lean)), p = part++;
        return xformPrims([P_cone([0, 0, -2], [0, 0, h], rad, 0.2, m, { part: p, grp: p, tone })], R, [dx, dy, 0]);
      };
      let P = [];
      P = P.concat(one(12.5 + r(4) * 2, 2.1, 0.1, 0.3, 0.4, -0.6, 2));
      P = P.concat(one(9.5 + r(5), 1.7, 0.42, 1.6 + r(1) * 0.3, -3.2, -0.2, 2), one(9 + r(6), 1.7, 0.46, -1.5 - r(2) * 0.3, 3.8, 0, 2));
      P = P.concat(one(6 + r(7), 1.4, 0.75, 2.2, -6.2, 0.8, 1), one(5.6 + r(8), 1.4, 0.8, -2.3, 6.8, 1, 1));
      if (r(3) < 0.6) P = P.concat(one(4.5, 1.2, 0.9, 3, 1.6, 2.6, 2));
      // the rock round their feet: round stones of the wall's rock, one behind, one either side
      // and one in front, so the points rise out of a heap (a flat slab under them read as a
      // saucer)
      P.push(P_ell([0.8, -2.4, 1.8], [3.2, 2.2, 2.8], st, { part: 23, grp: 23, tone: 1 }));
      P.push(P_ell([-5.2, 0.4, 1.6], [3, 2.6, 2.8], st, { part: 20, grp: 20, tone: 2 }));
      P.push(P_ell([5.6, 0.8, 1.5], [2.8, 2.4, 2.6], st, { part: 21, grp: 21, tone: 2 }));
      P.push(P_ell([0.4, 2.6, 1.1], [3.4, 2, 2.2], st, { part: 22, grp: 22, tone: 2 }));
      const out = render3D(DoorKit.snapTones(P), 30, 30, 15, 23, { outline: "prop" });
      return { pix: out.pix, w: 30, h: 30, ax: 15, ay: 23 };
    });
  }

  // ------------------------------------------------------------------ E24 house walls
  // Items hung on a north wall, head-on. Each returns { pix, w, h, ax, ay } with (ax, ay) the
  // point of the wall it hangs from (its model origin).
  // A four-pane window in a timber frame with a sill; curtains: a ramp for a pair of drapes
  // tied back at its sides, or null.
  function windowItem(curtains, bars) {
    return memo("win|" + curtains + "|" + (bars ? 1 : 0), () => {
      const wood = mat("earth"), P = [], B = DoorKit.block;
      // frame: jambs, head and a sill that stands out further
      P.push(B(-10, -8, 0, 16, 1.5, 2, wood, 1, 1), B(8, 10, 0, 16, 1.5, 2, wood, 1, 1));
      P.push(B(-10, 10, 14, 16, 1.5, 2, wood, 1, 1));
      P.push(B(-11, 11, -2, 0.5, 3, 4, wood, 3, 2));
      // mullion cross
      P.push(B(-0.5, 0.5, 0.5, 14, 1, 1, wood, 1, 3), B(-8, 8, 7, 8, 1, 1, wood, 1, 3));
      if (curtains) {
        const cl = mat(curtains);
        for (const s of [-1, 1]) {
          P.push(P_cone([s * 11.5, 2.5, 17], [s * 12.2, 2.5, 4], 2.4, 1.2, cl, { part: 10 + (s > 0 ? 1 : 0), grp: 10 + (s > 0 ? 1 : 0), tone: 2 }));
          P.push(P_cone([s * 12.2, 2.5, 4], [s * 11.2, 2.5, 0], 1.2, 2.2, cl, { part: 10 + (s > 0 ? 1 : 0), grp: 10 + (s > 0 ? 1 : 0), tone: 2 }));
        }
        P.push(P_cyl([-15, 3, 17.5], [15, 3, 17.5], 0.8, mat("gold", true), { part: 12, grp: 12, tone: 2 }));
      }
      const W = 34, Hh = 24, ax = 17, ay = 20;
      const r = wallRender(P, W, Hh, ax, ay);
      const d = r.pix.d;
      // the panes: daylight through the glass, brighter toward the upper left of each pane,
      // a white glint on the upper left one; iron bars on the smithy's
      const pane = pc("water", 3), paneL = pc("water", 4), wh = pc("white", 0), iron = pc("neutral", 1);
      for (let z = 1; z <= 13; z++) for (let x = -7; x <= 7; x++) {
        if (x === 0 || z === 7) continue;
        const X = ax + x, Y = ay - z - 1, i = Y * W + X;
        const px0 = x < 0 ? -7 : 1, pz1 = z > 7 ? 13 : 6, lx = x - px0, lz = pz1 - z;
        let c = (lx + lz < 4) ? paneL : pane;
        if (x < 0 && z > 7 && ((lx === 1 && lz === 1) || (lx === 2 && lz === 1) || (lx === 1 && lz === 2))) c = wh;
        if (bars && (x === -4 || x === 4)) c = iron;
        d[i] = c;
      }
      return { pix: r.pix, w: W, h: Hh, ax, ay };
    });
  }
  // The elder's shelf: a board on two brackets, a candle and two jars on it.
  function shelfItem() {
    return memo("shelf", () => {
      const wood = mat("earth"), B = DoorKit.block, P = [];
      P.push(B(-14, 14, 0, 2, 5, 5, wood, 3, 1));
      for (const x of [-10, 10]) P.push(B(x - 1, x + 1, -5, 0, 3, 3, wood, 1, 2));
      P.push(P_cyl([-8, 3, 2], [-8, 3, 8.5], 2.6, mat("red"), { part: 3, grp: 3, tone: 2 }));
      P.push(P_cyl([-8, 3, 8.5], [-8, 3, 9.5], 1.6, mat("red"), { part: 3, grp: 3, tone: 1 }));
      P.push(P_cyl([-2, 3, 2], [-2, 3, 6.5], 2.2, mat("stone"), { part: 4, grp: 4, tone: 3 }));
      P.push(P_cyl([6, 3, 2], [6, 3, 3], 2.4, mat("gold", true), { part: 5, grp: 5, tone: 1 }));
      P.push(P_cyl([6, 3, 3], [6, 3, 9], 1.1, mat("neutral"), { part: 6, grp: 6, tone: 4 }));
      const W = 34, Hh = 22, ax = 17, ay = 16;
      const r = wallRender(P, W, Hh, ax, ay);
      // the candle's flame (a bead of light, no outline) and its wick
      const d = r.pix.d, fx = ax + 6, fy = ay - 10;
      d[(fy) * W + fx] = pc("red", 1);
      d[(fy - 1) * W + fx] = pc("gold", 3); d[(fy - 2) * W + fx] = pc("white", 0); d[(fy - 3) * W + fx] = pc("gold", 3);
      d[(fy - 2) * W + fx - 1] = pc("red", 3); d[(fy - 2) * W + fx + 1] = pc("red", 3);
      return { pix: r.pix, w: W, h: Hh, ax, ay };
    });
  }
  // The widow's chart of the lake isles, framed: parchment with the lake, three isles and
  // her husband's route to the north marked in red.
  function chartItem() {
    return memo("chart", () => {
      const wood = mat("earth"), B = DoorKit.block, P = [];
      P.push(B(-11, 11, 0, 2, 1.5, 2, wood, 1, 1), B(-11, 11, 14, 16, 1.5, 2, wood, 1, 1));
      P.push(B(-11, -9, 0, 16, 1.5, 2, wood, 1, 1), B(9, 11, 0, 16, 1.5, 2, wood, 1, 1));
      const W = 26, Hh = 20, ax = 13, ay = 18;
      const r = wallRender(P, W, Hh, ax, ay);
      const d = r.pix.d, set = (x, z, c) => { d[(ay - z - 1) * W + ax + x] = c; };
      const MAP = [
        // 18 x 12, z from the top: . parchment, : darker parchment, w lake, i isle, r route, x mark
        ":.................",
        "..wwwwwwww....x...",
        ".wwwwwwwwwwwww.r..",
        ".wwwiiwwwwwwwr....",
        "wwwwiiiwwwwwr.www.",
        "wwwwwiwwwwwrwwwww.",
        "wwwwwwwwwwrwwiiww.",
        ".wwwwwwwwrwwwiiww.",
        ".wwwiiwwrwwwwwww..",
        "..wwwiwwrwwwww....",
        "...wwwwwwwww......",
        "..................",
      ];
      const col = { ".": pc("sand", 0), ":": pc("sand", 1), w: pc("water", 3), i: pc("earth", 3), r: pc("red", 1), x: pc("red", 2) };
      MAP.forEach((row, k) => [...row].forEach((ch, j) => set(j - 9, 13 - k, col[ch])));
      // a lighter top left corner of the sheet, and its edge toward the frame
      set(-9, 13, pc("sand", 1)); set(-8, 13, pc("sand", 1)); set(-9, 12, pc("sand", 1));
      return { pix: r.pix, w: W, h: Hh, ax, ay };
    });
  }
  // The children's drawing: a sheet pinned to the wall, a sun and a little house in crayon.
  function drawingItem() {
    return memo("drawing", () => {
      const W = 16, Hh = 14, p = new Pix(W, Hh);
      const k = pc("neutral", 2), s = pc("sand", 1), s0 = pc("sand", 0);
      const ROWS = [
        "kkkkkkkkkkkkkkk.",
        "kssssssssssssssk",
        "ksyyssssssssssk.",
        "kyyyysssssssssk.",
        "ksyyssssrrsssssk",
        "kssssssrrrrssssk",
        "ksssssrrrrrrssk.",
        "kssssssbbbbsssk.",
        "kssssssbssbsssk.",
        "kgggggggggggggk.",
        "kgggggggggggggsk",
        "kssssssssssssssk",
        "kkkkkkkkkkkkkkkk",
        "................",
      ];
      const lg = { k, s, y: pc("gold", 3), r: pc("red", 2), b: pc("hair", 2), g: pc("green", 4) };
      ROWS.forEach((row, y) => [...row].forEach((ch, x) => { if (lg[ch]) p.d[y * W + x] = lg[ch]; }));
      // a red tack at its top
      p.d[0 * W + 7] = pc("red", 3); p.d[0 * W + 8] = pc("red", 1);
      for (let x = 2; x < 14; x++) if (p.d[11 * W + x] === s) p.d[11 * W + x] = s0;
      return { pix: p, w: W, h: Hh, ax: 8, ay: 13 };
    });
  }
  // A painted star (gold, a darker edge on its lower right), stencilled on the wall.
  function starItem() {
    return memo("star", () => {
      const ROWS = ["...y...", "...y...", "yyyyyyd", ".yyyyd.", ".yd.yd.", "yd...yd"];
      const W = 7, Hh = 6, p = new Pix(W, Hh), lg = { y: pc("gold", 3), d: pc("gold", 1) };
      ROWS.forEach((row, y) => [...row].forEach((ch, x) => { if (lg[ch]) p.d[y * W + x] = lg[ch]; }));
      return { pix: p, w: W, h: Hh, ax: 3, ay: 5 };
    });
  }
  // The smith's rack: a board with three pegs, a hammer, tongs and a rasp hanging from them.
  function toolRackItem() {
    return memo("rack", () => {
      const wood = mat("earth"), iron = mat("neutral", true), B = DoorKit.block, P = [];
      P.push(B(-15, 15, 0, 4, 1.5, 2, wood, 2, 1));
      for (const x of [-9, 0, 9]) P.push(P_cyl([x, 1.5, 2], [x, 4.5, 2], 0.8, wood, { part: 2, grp: 2, tone: 1 }));
      // hammer: handle down from the peg, head at its foot
      P.push(B(-9.6, -8.4, -13, 1, 3, 1.2, wood, 2, 3));
      P.push(B(-12.5, -5.5, -16, -12.5, 3.5, 2, iron, 2, 4));
      // tongs: two long legs, jaws at the bottom
      P.push(B(-0.8, 0.8, -3, 1.5, 3.2, 1.2, iron, 2, 5));
      P.push(B(-3.6, -2.4, -15, -2, 3, 1, iron, 2, 5), B(2.4, 3.6, -15, -2, 3, 1, iron, 1, 5));
      P.push(B(-3.6, -0.6, -17, -15, 3, 1, iron, 2, 5), B(0.6, 3.6, -17, -15, 3, 1, iron, 1, 5));
      P.push(B(-3.6, 3.6, -3, -1.6, 3, 1, iron, 2, 5));
      // rasp: a wooden grip and a long toothed blade
      P.push(B(8.3, 9.7, -4, 1, 3, 1.2, wood, 2, 6));
      P.push(B(8, 10, -15, -4, 3, 1, iron, 2, 7, { grain: (lx, lz) => (Math.round(lz * 2) & 1) ? -1 : 0 }));
      const W = 36, Hh = 26, ax = 18, ay = 6;
      const r = wallRender(P, W, Hh, ax, ay);
      return { pix: r.pix, w: W, h: Hh, ax, ay };
    });
  }

  // ------------------------------------------------------------------ E41 hook chain
  // Iron links, alternately lying flat (a ring, its hole showing) and standing on edge (a
  // short bar lit along its top), rendered separately for a chain running across the screen
  // (H) and one running up or down it (V). g = the glint that travels along the chain.
  function linkSprite(axis, kind, glint) {
    return memo("link|" + axis + kind + (glint ? "g" : ""), () => {
      const iron = "steel", h = axis === "H";
      const r = kind === "flat" ? (h ? [2.7, 2.0, 0.7] : [1.8, 2.9, 0.7]) : (h ? [2.7, 0.6, 1.4] : [0.6, 2.9, 1.5]);
      const P = [P_ell([0, 0, 0], r, iron, { part: 1, grp: 1, tone: 3 })];
      const o = render3D(P, 12, 12, 6, 6, { outline: "char" });
      const d = o.pix.d, W = 12, ink = inkU32();
      if (kind === "flat") {
        // the hole through the ring
        let x0 = 12, x1 = -1, y0 = 12, y1 = -1;
        for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if (d[y * W + x] && d[y * W + x] !== ink) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
        const cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
        d[cy * W + cx] = ink;
        if (h && x1 - x0 >= 4) d[cy * W + cx + 1] = ink;
        if (!h && y1 - y0 >= 4) d[(cy + 1) * W + cx] = ink;
      }
      if (glint) for (let i = 0; i < d.length; i++) if (d[i] && d[i] !== ink) d[i] = (d[i] === pc("neutral", 4) || d[i] === pc("neutral", 3)) ? pc("white", 0) : pc("neutral", 4);
      // crop to what was drawn
      let x0 = 12, x1 = -1, y0 = 12, y1 = -1;
      for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) if (d[y * W + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const q = new Pix(x1 - x0 + 1, y1 - y0 + 1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) q.d[(y - y0) * q.w + x - x0] = d[y * W + x];
      return { canvas: q.toCanvas(), ax: 6 - x0, ay: 6 - y0 };
    });
  }

  return { switchSprite, switchGlow, switchPrims, SW_Z, crystalCluster, windowItem, shelfItem, chartItem, drawingItem, starItem, toolRackItem, linkSprite, withShade, wallRender };
})();
