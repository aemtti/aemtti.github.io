"use strict";
// ---------- Full-screen pages at 512x480: title, opening, pause/inventory, game over,
// and the ending (the shards made whole, dawn over the valley, credits, the record) ----------
// Palette colours only, hard edges, no blending. Text uses the 9 px font; the title's
// big letters are the same glyphs with every glyph pixel built as a lit 3-D block, so
// they are still drawn in single, unscaled pixels.

const SCR = {};
function scrCol(ramp, tone) { return STYLE.ramps[ramp][Math.max(0, Math.min(STYLE.ramps[ramp].length - 1, tone || 0))]; }

// ---------- bevelled "stone" letters ----------
// scale: glyph pixel -> scale x scale block; ramp: colour ramp (4+ tones).
function bevelText(str, scale, ramp) {
  const key = "bev|" + str + "|" + scale + "|" + ramp;
  if (SCR[key]) return SCR[key];
  str = String(str).toUpperCase();
  const w0 = textWidth2(str), W = w0 * scale + 6, H = FONT_H * scale + 6;
  const m = new Uint8Array(W * H);
  let gx = 2;
  for (const ch of str) {
    const g = GLYPHS[ch] || GLYPHS["?"];
    for (let y = 0; y < FONT_H; y++) for (let x = 0; x < g[0].length; x++) {
      if (g[y][x] !== "#") continue;
      for (let dy = 0; dy < scale; dy++) for (let dx = 0; dx < scale; dx++) m[(2 + y * scale + dy) * W + gx + x * scale + dx] = 1;
    }
    gx += (g[0].length + FONT_GAP) * scale;
  }
  const p = new Pix(W, H), n = STYLE.ramps[ramp].length;
  const at = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  const ink = hexU32(STYLE.ramps.ink[0]);
  // drop shadow down-right, then the lit block faces, then an ink outline
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!at(x, y) && at(x - 2, y - 2)) p.d[y * W + x] = ink;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (!at(x, y)) continue;
    const top = !at(x, y - 1), left = !at(x - 1, y), bot = !at(x, y + 1), right = !at(x + 1, y);
    const ly = (y - 2) % scale;
    let t;
    if (top || left) t = n - 1;
    else if (bot || right) t = Math.max(0, n - 4);
    else t = ly < scale / 2 ? n - 2 : n - 3;
    p.d[y * W + x] = hexU32(STYLE.ramps[ramp][Math.max(0, t)]);
    if (top && left && n > 4) p.d[y * W + x] = hexU32(STYLE.ramps.white[0]);
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (at(x, y)) continue;
    if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) p.d[y * W + x] = ink;
  }
  return (SCR[key] = p.toCanvas());
}
function drawBevelC(c, str, cx, y, scale, ramp) { const k = bevelText(str, scale, ramp); c.drawImage(k, Math.round(cx - k.width / 2), y); }

// ---------- the Sunstone, whole and in pieces ----------
function sunstonePrims() {
  const P = [
    P_cone([0, 0, 0], [0, 0, 15], 11, 0.4, "ember", { part: 1, grp: 1, tone: 3 }),
    P_cone([0, 0, 0], [0, 0, -12], 11, 0.4, "ember", { part: 1, grp: 1, tone: 2 }),
    P_ell([0, 3, 1], [5, 3, 5], "glow", { part: 2, grp: 1, line: false }),
  ];
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 + Math.PI / 12, L = i & 1 ? 20 : 25;
    P.push(P_cone([Math.cos(a) * 11, -1, Math.sin(a) * 10], [Math.cos(a) * L, -1, Math.sin(a) * L * 0.9], 2.2, 0.2, "gold", { part: 3, grp: 3, tone: 3 }));
  }
  return { prims: upright(P, 0), decals: [] };
}
function sunstoneImg() { return SCR.sun || (SCR.sun = renderFit(sunstonePrims(), false, 96, 96, 48, 48)); }
// (rim: the glow edge for dark pages)
function shardImg(i, k, rim) { i = i || 0; k = k || 1; return charFrame("shard|" + i + "|" + k + (rim ? "r" : ""), () => shardFrame(i, k, rim)); }
function itemImg(kind) { return itemFrame(kind); }
// the pause screen shows its treasures larger than they lie in the world
function itemImgBig(kind, k) { return charFrame("itemBig|" + kind + "|" + k, () => { const m = itemPrims(kind); return m ? renderFit(scaleModel(m, k)) : null; }); }
// a big heart cut in four: the pieces you hold are red, the rest are dark stone
function heartPieceImg(n) {
  const key = "hpc" + n;
  if (SCR[key]) return SCR[key];
  const full = renderFit(scaleModel(itemPrims("heart"), 2.3)).canvas;
  // (a missing piece is a flat dark hollow, like an empty heart in the HUD: shaded in
  // blue steel it read as a piece of another colour)
  const W = full.width, H = full.height, a = full.getContext("2d").getImageData(0, 0, W, H).data;
  const p = new Pix(W, H), cx = W >> 1, cy = Math.round(H * 0.45);
  const ink = hexU32(STYLE.ramps.ink[0]), hollow = hexU32(scrCol("neutral", 1)), hollowLip = hexU32(scrCol("neutral", 2));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = y < cy ? (x < cx ? 0 : 1) : (x < cx ? 3 : 2), i = (y * W + x) * 4;
    if (!a[i + 3]) continue;
    const col = ((255 << 24) | (a[i + 2] << 16) | (a[i + 1] << 8) | a[i]) >>> 0;
    p.d[y * W + x] = q < n || col === ink ? col : (y > 0 && !a[((y - 1) * W + x) * 4 + 3] ? hollowLip : hollow);
    if ((x === cx || y === cy)) p.d[y * W + x] = ink;
  }
  return (SCR[key] = p.toCanvas());
}
// A copy of a picture with a 1px dim gold rim round it (on dark pages the ink outline
// sinks into the background).
function withRim(f) {
  if (f.rimmed) return f.rimmed;
  const W = f.canvas.width + 2, H = f.canvas.height + 2, src = f.canvas.getContext("2d").getImageData(0, 0, W - 2, H - 2).data;
  const p = new Pix(W, H), on = (x, y) => x >= 1 && y >= 1 && x < W - 1 && y < H - 1 && src[((y - 1) * (W - 2) + x - 1) * 4 + 3];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (on(x, y)) { const i = ((y - 1) * (W - 2) + x - 1) * 4; p.d[y * W + x] = ((255 << 24) | (src[i + 2] << 16) | (src[i + 1] << 8) | src[i]) >>> 0; }
    else if (on(x - 1, y) || on(x + 1, y) || on(x, y - 1) || on(x, y + 1)) p.d[y * W + x] = pc("gold", 0);
  }
  return (f.rimmed = { canvas: p.toCanvas(), ax: f.ax + 1, ay: f.ay + 1 });
}
function blitCentered(c, f, cx, cy) { c.drawImage(f.canvas, Math.round(cx - f.canvas.width / 2), Math.round(cy - f.canvas.height / 2)); }

// A picture shaded darker along the palette: each colour steps down its own ramp (for
// figures standing in the night; no blending, so the colours stay in the palette).
let _rampOf = null;
function shadeCanvas(src, steps) {
  if (!_rampOf) {
    _rampOf = new Map();
    for (const r in STYLE.ramps) STYLE.ramps[r].forEach((h, t) => { const u = hexU32(h); if (!_rampOf.has(u)) _rampOf.set(u, [r, t]); });
  }
  const W = src.width, H = src.height, d = src.getContext("2d").getImageData(0, 0, W, H).data, p = new Pix(W, H);
  for (let i = 0; i < W * H; i++) {
    if (!d[i * 4 + 3]) continue;
    const u = ((255 << 24) | (d[i * 4 + 2] << 16) | (d[i * 4 + 1] << 8) | d[i * 4]) >>> 0, rt = _rampOf.get(u);
    p.d[i] = rt ? pc(rt[0], rt[1] - steps) : u;
  }
  return p.toCanvas();
}

// ---------- painted backdrops (palette bands blended by an ordered 4x4 dither) ----------
function paintSky(p, y0, y1, bands) {
  const n = bands.length, h = (y1 - y0) / n;
  for (let y = y0; y < y1; y++) {
    const f = (y - y0) / h, i = Math.min(n - 1, Math.floor(f)), fr = f - i;
    // the lower 40% of each band fades into the next one
    const t = i < n - 1 ? Math.max(0, (fr - 0.6) / 0.4) : 0;
    for (let x = 0; x < p.w; x++) {
      const k = t > bayer4(x, y) ? i + 1 : i;
      p.d[y * p.w + x] = hexU32(scrCol(bands[k][0], bands[k][1]));
    }
  }
}
// a ridge line; returns the top row of each column
function paintRidge(p, base, amp, scale, seed, col, lit, yMax) {
  const tops = [];
  for (let x = 0; x < p.w; x++) {
    const top = Math.round(base - amp * (fbm(x / scale, 0.5, seed) - 0.3));
    tops.push(top);
    for (let y = Math.max(0, top); y < (yMax || p.h); y++) p.d[y * p.w + x] = hexU32(y <= top + 1 && lit ? lit : col);
  }
  return tops;
}
// round tree crowns standing on a ridge: lit upper left, dark lower right, dark rim
function paintTrees(p, tops, seed, every, dark, mid, lit, rMin, rMax, sink) {
  for (let x = 4; x < p.w - 4; x += every) {
    if (hash2(x, 1, seed) < 0.35) continue;
    const cx = x + Math.floor(hash2(x, 2, seed) * every), r = rMin + Math.floor(hash2(x, 3, seed) * (rMax - rMin + 1));
    const top = tops[Math.min(p.w - 1, cx)];
    if (top > p.h) continue;
    const cy = top + (sink || 0) - r + 1;
    for (let dy = -r - 1; dy <= r + 1; dy++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      const X = cx + dx, Y = cy + dy, d = dx * dx + dy * dy;
      if (X < 0 || Y < 0 || X >= p.w || Y >= p.h || d > (r + 0.6) * (r + 0.6)) continue;
      let c = mid;
      if (d > (r - 0.4) * (r - 0.4)) c = dark;
      else if (dx + dy < -r * 0.45) c = lit;
      else if (dx + dy > r * 0.55) c = dark;
      p.d[Y * p.w + X] = hexU32(c);
    }
  }
}
function paintStars(p, y1, seed) {
  for (let i = 0; i < 70; i++) {
    const x = Math.floor(hash2(i, 1, seed) * p.w), y = Math.floor(hash2(i, 2, seed) * y1);
    p.d[y * p.w + x] = hexU32(hash2(i, 3, seed) < 0.3 ? scrCol("gold", 3) : scrCol("white", 0));
  }
}
function fillPix(p, x, y, w, h, col) {
  const u = hexU32(col);
  for (let j = Math.max(0, y); j < Math.min(p.h, y + h); j++) for (let i = Math.max(0, x); i < Math.min(p.w, x + w); i++) p.d[j * p.w + i] = u;
}
// the dark keep on the far peaks, and the roofs of Brambleford on the hill
function paintKeep(p, x, tops, col, lit) {
  // (its foot sunk into the ridge: set on the lowest point under it, nothing shows below)
  const g = Math.max(...tops.slice(x - 22, x + 23)) + 3;
  fillPix(p, x - 16, g - 16, 32, 18, col);
  for (const [tx, w, h] of [[-20, 8, 26], [12, 8, 26], [-4, 8, 34]]) {
    fillPix(p, x + tx, g - h, w, h + 2, col);
    for (let i = 0; i < w; i += 3) fillPix(p, x + tx + i, g - h - 2, 2, 2, col);
    fillPix(p, x + tx, g - h, 1, h, lit);
    fillPix(p, x + tx + w - 2, g - h, 2, h + 2, scrCol("ink", 0));
  }
  fillPix(p, x - 2, g - 8, 4, 6, lit);
  // (the hill rises over its foot, so no ruled line cuts the slope)
  for (let dx = -30; dx <= 30; dx++) {
    const top = Math.round(g - 4 + (dx / 30) * (dx / 30) * 6), X = x + dx;
    if (X < 0 || X >= p.w) continue;
    for (let y = top; y < Math.min(p.h, g + 6); y++) p.d[y * p.w + X] = p.d[Math.min(p.h - 1, g + 8) * p.w + X];
  }
}
function paintVillage(p, x0, tops, step) {
  // (walls take the light of the hour: dusky brown at night, pale sand by morning)
  const wall = step < 2 ? scrCol("earth", 1 + step) : scrCol("sand", step - 2), shade = step < 2 ? scrCol("earth", step) : scrCol("earth", 3), roof = scrCol("red", Math.min(3, 1 + step)), roofD = scrCol("red", Math.max(0, step));
  for (const [dx, w] of [[0, 12], [18, 10], [34, 14], [54, 10]]) {
    const x = x0 + dx, g = tops[x + (w >> 1)] + 5;
    fillPix(p, x, g - 7, w, 7, wall); fillPix(p, x + w - 3, g - 7, 3, 7, shade);
    for (let r = 0; r < 5; r++) fillPix(p, x - 1 + r, g - 8 - r, w + 2 - 2 * r, 1, r < 2 ? roofD : roof);
    fillPix(p, x + 3, g - 4, 2, 4, scrCol("ink", 0));
    if (step < 2) fillPix(p, x + w - 6, g - 5, 2, 2, scrCol("gold", 3));
  }
}
// the valley at dawn: step 0 (night) .. 3 (morning)
const DAWN_SKIES = [
  [["ink", 0], ["purple", 0], ["purple", 1], ["purple", 1], ["red", 0]],
  [["purple", 0], ["purple", 1], ["purple", 2], ["red", 1], ["red", 2]],
  [["purple", 1], ["purple", 2], ["red", 2], ["red", 3], ["gold", 3]],
  [["water", 2], ["water", 3], ["water", 4], ["sand", 0], ["gold", 3]],
];
// the sky alone, and the land in front of it (transparent above the ridges)
function valleySky(step) {
  const key = "vsky" + step;
  if (SCR[key]) return SCR[key];
  const p = new Pix(RW, RH);
  paintSky(p, 0, 320, DAWN_SKIES[step]);
  if (step < 2) paintStars(p, 200, 71);
  for (let y = 320; y < RH; y++) for (let x = 0; x < RW; x++) p.d[y * RW + x] = hexU32(scrCol(DAWN_SKIES[step][4][0], DAWN_SKIES[step][4][1]));
  return (SCR[key] = p.toCanvas());
}
function valleyBackdrop(step) {
  const key = "valley" + step;
  if (SCR[key]) return SCR[key];
  const c = document.createElement("canvas"); c.width = RW; c.height = RH;
  const g = c.getContext("2d"); g.drawImage(valleySky(step), 0, 0); g.drawImage(valleyLand(step), 0, 0);
  return (SCR[key] = c);
}
function valleyLand(step) {
  const key = "vland" + step;
  if (SCR[key]) return SCR[key];
  const p = new Pix(RW, RH);
  // far peaks with the keep, green hills with the village and woods, then the near slope
  const far = [["stone", 0], ["stone", 1], ["stone", 2], ["dstone", 3]][step], farLit = [["stone", 1], ["stone", 2], ["stone", 3], ["stone", 4]][step];
  const farTops = paintRidge(p, 262, 70, 70, 501, scrCol(far[0], far[1]), scrCol(farLit[0], farLit[1]), 330);
  // (the keep stays a dark shape at night and catches the light by morning)
  paintKeep(p, 412, farTops, step < 2 ? scrCol("ink", 0) : scrCol("stone", step - 2), step < 2 ? scrCol(far[0], Math.max(0, far[1] - 1)) : scrCol("stone", step));
  const hill = [["green", 0], ["green", 1], ["green", 2], ["green", 3]][step];
  const hillTops = paintRidge(p, 318, 34, 55, 502, scrCol(hill[0], hill[1]), scrCol(hill[0], hill[1] + 1), 390);
  paintTrees(p, hillTops.map((t, x) => (x > 88 && x < 170 ? 9999 : t)), 505, 9, scrCol("green", Math.max(0, hill[1] - 1)), scrCol("green", hill[1]), scrCol("green", hill[1] + 1), 3, 5, 3);
  paintVillage(p, 96, hillTops, step);
  const near = Math.max(0, step - 1);
  const nearTops = paintRidge(p, 372, 22, 40, 503, scrCol("green", near), scrCol("green", step), RH);
  paintTrees(p, nearTops.map((t, x) => (x > 170 && x < 340 ? 9999 : t)), 506, 14, scrCol("ink", 0), scrCol("green", near), scrCol("green", near + 1), 6, 9, 4);
  return (SCR[key] = p.toCanvas());
}
function titleBackdrop() {
  if (SCR.titleBG) return SCR.titleBG;
  const p = new Pix(RW, RH);
  paintSky(p, 0, 360, [["ink", 0], ["purple", 0], ["purple", 1], ["purple", 1], ["red", 1], ["red", 2]]);
  paintStars(p, 220, 73);
  const farTops = paintRidge(p, 300, 80, 80, 511, scrCol("stone", 0), scrCol("stone", 1), RH);
  paintKeep(p, 400, farTops, scrCol("ink", 0), scrCol("stone", 0));
  paintRidge(p, 360, 36, 50, 512, scrCol("purple", 0), scrCol("purple", 1), RH);
  paintRidge(p, 420, 22, 36, 513, scrCol("ink", 0), null, RH);
  return (SCR.titleBG = p.toCanvas());
}

// ---------- menus ----------
// One wording of the controls everywhere (played by touch it names the on-screen buttons:
// input.js keyWord, touch.js).
const CONTROLS_LINE = "Z - SWORD   X - ITEM   ENTER - PAUSE   M - SOUND";
const CONTROLS_LINE_TOUCH = "A - SWORD   B - ITEM   MENU - PAUSE   SOUND - ON/OFF";
function controlsLine() { return keyWords === KEY_WORDS.touch ? CONTROLS_LINE_TOUCH : CONTROLS_LINE; }
// A menu panel: the choices left-aligned in a column, the heart cursor just before them.
function drawMenu(c, opts, y, idx) {
  const w = Math.max(...opts.map(o => textWidth2(o))) + 80, x = Math.round(RW / 2 - w / 2), tx = x + 46;
  drawPanel(c, x, y, w, opts.length * 22 + 20);
  opts.forEach((o, i) => drawText2(c, o, tx, y + 14 + i * 22, idx === i ? scrCol("gold", 3) : scrCol("neutral", 3)));
  c.drawImage(ICONS.heart, tx - 24, y + 12 + idx * 22);
}

// ---------- title ----------
function drawTitle2(c) {
  c.drawImage(titleBackdrop(), 0, 0);
  drawBevelC(c, "SHARDS OF THE", RW / 2, 34, 2, "gold");
  drawBevelC(c, "SUNSTONE", RW / 2, 64, 4, "gold");
  drawText2C(c, "A TALE OF ELDERMERE", RW / 2, 118, scrCol("water", 4));
  const sun = sunstoneImg();
  blitCentered(c, sun, RW / 2, 196);
  // light glinting round the stone
  const k = (G.frame >> 3) % 12, a = k * Math.PI / 6;
  const sp = FX.sparkle[(G.frame >> 2) & 3];
  c.drawImage(sp, Math.round(RW / 2 + Math.cos(a) * 44 - 12), Math.round(196 + Math.sin(a) * 40 - 12));
  if (!G.titleMenu) {
    if ((G.frame >> 4) & 1) drawBevelC(c, keyWord("push"), RW / 2, 292, 2, "plaster");
  } else {
    drawMenu(c, ["NEW QUEST", "LOAD QUEST"], 276, G.menuIdx);
  }
  drawText2C(c, controlsLine(), RW / 2, 440, scrCol("neutral", 3));
  drawText2C(c, "AN ORIGINAL GAME. ART AND MUSIC MADE IN CODE.", RW / 2, 458, scrCol("neutral", 2));
}

// ---------- the opening story ----------
const STORY2 = [
  "LONG AGO THE SUNSTONE,", "HEART OF DAWN, KEPT THE VALE", "OF ELDERMERE IN GENTLE LIGHT.", "",
  "THEN VEX, TYRANT OF SHADOW,", "SHATTERED THE STONE INTO", "SIX SHARDS AND BURIED THEM", "IN SIX DEEP PLACES.", "",
  "MAREN, SAGE OF THE FLAME,", "WAS DRAGGED AWAY TO HIS", "KEEP BEYOND THE PEAKS.", "",
  "NOW A YOUNG WANDERER NAMED", "RILL SETS OUT FROM THE", "VILLAGE OF BRAMBLEFORD.", "",
  "GATHER THE SIX SHARDS.", "BREAK THE SEAL OF THE KEEP.", "FREE THE SAGE, AND LET", "DAWN RETURN TO ELDERMERE.", "",
  "Z - SWORD|X - ITEM", "ENTER - PAUSE|M - SOUND",
];
// (the same two lines of controls when the game is played by touch)
const STORY2_TOUCH = { "Z - SWORD|X - ITEM": "A - SWORD|B - ITEM", "ENTER - PAUSE|M - SOUND": "MENU - PAUSE|SOUND - ON/OFF" };
const STORY_LH = 20, STORY_TOP = 150;
// where a new quest's telling comes to rest: its last line at y 360, so the whole last
// paragraph stays below the stone
const STORY_STOP = RH + (STORY2.length - 1) * 20 - 360;
function storyEnd() { return STORY2.length * STORY_LH + (RH - STORY_TOP) + 40; }
function drawStory2(c) {
  c.fillStyle = scrCol("ink", 0); c.fillRect(0, 0, RW, RH);
  if (!SCR.storyStars) { const p = new Pix(RW, RH); paintStars(p, RH, 77); SCR.storyStars = p.toCanvas(); }
  c.drawImage(SCR.storyStars, 0, 0);
  // the stone, whole until the telling reaches its breaking; then six shards drift apart
  const broke = G.storyY > STORY_LH * 5.5;
  if (!broke) blitCentered(c, withRim(sunstoneImg()), RW / 2, 76);
  else {
    // (the ring opens no wider than the top of the page allows)
    const t = Math.min(1, (G.storyY - STORY_LH * 5.5) / 120);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 - Math.PI / 2, r = 8 + t * 44;
      blitCentered(c, shardImg(i, 1.3, true), RW / 2 + Math.cos(a) * r * 1.3, 76 + Math.sin(a) * r * 0.8);
    }
  }
  c.save();
  c.beginPath(); c.rect(0, STORY_TOP, RW, RH - STORY_TOP); c.clip();
  const sy = G.storyThenPlay ? Math.min(G.storyY, STORY_STOP) : G.storyY;
  for (let i = 0; i < STORY2.length; i++) {
    const y = Math.round(RH - sy + i * STORY_LH);
    if (!(y > STORY_TOP - 12 && y < RH)) continue;
    if (STORY2[i].includes("|")) {
      // the controls: two columns, each left-aligned, the pair centred under the text
      const [l, r] = ((keyWords === KEY_WORDS.touch && STORY2_TOUCH[STORY2[i]]) || STORY2[i]).split("|");
      drawText2(c, l, 158, y, scrCol("water", 4)); drawText2(c, r, 298, y, scrCol("water", 4));
    } else drawText2C(c, STORY2[i], RW / 2, y, scrCol("white", 0));
  }
  c.restore();
  if (G.storyThenPlay && ((G.frame >> 4) & 1)) {
    // while it scrolls, a quiet skip hint in the corner; once told, the title's own prompt
    // in the empty space below
    if (G.storyY >= STORY_STOP) drawBevelC(c, keyWord("push"), RW / 2, 410, 2, "plaster");
    else drawText2C(c, keyWord("skip"), RW - 80, 12, scrCol("neutral", 3));
  }
}

// ---------- pause / inventory ----------
const B_ITEM_MODEL = { boomerang: "boomerang", bomb: "bomb", bow: "bow", candle: "candle", hook: "hook", hammer: "hammer", potion: "potion" };
function drawSlot(c, x, y, w, h, img, lit) {
  drawPanel(c, x, y, w, h);
  if (lit) {
    c.fillStyle = scrCol("gold", 3);
    c.fillRect(x - 2, y - 2, w + 4, 2); c.fillRect(x - 2, y + h, w + 4, 2); c.fillRect(x - 2, y, 2, h); c.fillRect(x + w, y, 2, h);
  }
  if (img) c.drawImage(img.canvas, Math.round(x + (w - img.canvas.width) / 2), Math.round(y + (h - img.canvas.height) / 2));
}
function drawInventory2(c) {
  c.fillStyle = scrCol("ink", 0); c.fillRect(0, 0, RW, RH);
  drawBevelC(c, "PAUSED", RW / 2, 10, 2, "gold");
  // one grid for every row: from x 34 to 478
  const L = 34, R = 478;
  // items for the X key
  drawText2(c, "ITEMS", L, 50, scrCol("water", 3));
  drawText2(c, keyWord("pick"), R - textWidth2(keyWord("pick")), 50, scrCol("neutral", 3));
  const n = B_ITEMS.length, sw = 52, gap = Math.floor((R - L - n * sw) / (n - 1));
  for (let i = 0; i < n; i++) {
    const kind = B_ITEMS[i], x = L + i * (sw + gap), y = 68;
    const own = bItemOwned(kind);
    drawSlot(c, x, y, sw, sw, own ? itemImgBig(B_ITEM_MODEL[kind], 1.6) : null, i === G.invCursor && ((G.frame >> 3) & 1));
    if (G.bItem === kind) drawText2C(c, keyWord("b"), x + sw / 2, y + sw + 4, scrCol("water", 4));
    if (kind === "bomb" && own) { const t = String(G.bombs).padStart(2, "0"); drawText2(c, t, x + sw - 5 - textWidth2(t), y + sw - 13, scrCol("white", 0)); }
  }
  // gear, on the same grid as the items; the heart being pieced together in the last slot
  drawText2(c, "GEAR", L, 150, scrCol("water", 3));
  // (each piece of gear has its own slot, like the items: nothing shifts when one is found)
  const gear = [
    G.inv.sword ? "sword" + G.inv.sword : null, G.inv.shield >= 2 ? "shield" + Math.min(3, G.inv.shield) : null,
    ...["ring", "glove", "ladder", "raft"].map(k => (G.inv[k] ? k : null)),
  ];
  for (let i = 0; i < 6; i++) drawSlot(c, L + i * (sw + gap), 166, sw, sw, gear[i] ? itemImgBig(gear[i], 1.4) : null, false);
  const hx6 = L + 6 * (sw + gap), hp = G.heartPieces || 0, hk = heartPieceImg(hp);
  const nh = "NEXT HEART  " + hp + " / 4";
  drawText2(c, "NEXT HEART", R - textWidth2(nh), 150, scrCol("water", 3));
  drawText2(c, hp + " / 4", R - textWidth2(hp + " / 4"), 150, scrCol("white", 0));
  drawPanel(c, hx6, 166, sw, sw);
  c.drawImage(hk, Math.round(hx6 + sw / 2 - hk.width / 2), Math.round(166 + sw / 2 - hk.height / 2));
  // where you are: an icon, a name and a white number on every row
  // (five rows centred in the panel: three for the place, then the quests' finds, each on
  // its own labelled row; the panel is 220 wide so "FRIENDS FOUND" and its count sit
  // apart, the shards' panel beside it starts at SX)
  const T = 250, B = 404, PWL = 220, SX = 270, VR = L + PWL - 18, rowY = (i) => T + 20 + i * 29, row = (m, name, v, i, have) => {
    const ry = rowY(i);
    if (have === false) { c.fillStyle = scrCol("neutral", 0); c.fillRect(54, ry - 10, 18, 18); }
    else blitCentered(c, itemImgBig(m, 1.3), 62, ry);
    drawText2(c, name, 86, ry - 5, scrCol("neutral", 3));
    drawText2(c, v, VR - textWidth2(v), ry - 5, scrCol("white", 0));
  };
  const two = (n) => String(n).padStart(2, "0");
  if (G.area === "dungeon") {
    const d = DUNGEONS[G.dungeon], dm = G.dmaps[G.dungeon] || {};
    drawText2(c, d.name, L, 232, scrCol("gold", 3));
    drawPanel(c, L, T, PWL, B - T);
    row("map", "MAP", dm.map ? "FOUND" : "--", 0, !!dm.map);
    row("compass", "COMPASS", dm.compass ? "FOUND" : "--", 1, !!dm.compass);
    row("key", "KEYS", two(G.keys), 2);
  } else {
    drawText2(c, "ELDERMERE", L, 232, scrCol("gold", 3));
    drawPanel(c, L, T, PWL, B - T);
    row("gem1", "GEMS", String(G.gems).padStart(3, "0"), 0);
    row("key", "KEYS", two(G.keys), 1);
    row("bomb", "BOMBS", two(G.bombs), 2);
  }
  // the side quests: the widow's chart and the elder's bell, lost things found for their
  // owners (bright while carried, dim once handed over, a dark hollow until found), and
  // below them, on a row of its own, the friends found at hide and seek
  // (the two icons share the icon column, so the label lines up with the rows above)
  const qy = rowY(3), lost = [["chart", 49, "q:chart", "qh:chart"], ["bell", 71, "q:bell", "qh:bell"]];
  for (const [kind, cx, got, given] of lost) {
    if (!G.flags[got]) { c.fillStyle = scrCol("neutral", 0); c.fillRect(cx - 8, qy - 9, 16, 16); continue; }
    const f = itemImgBig(kind, 1.1);
    blitCentered(c, G.flags[given] ? charFrame("dimBig|" + kind, () => ({ canvas: shadeCanvas(f.canvas, 3) })) : f, cx, qy);
  }
  const lostN = lost.filter(q => G.flags[q[2]]).length + " / " + lost.length;
  drawText2(c, "LOST THINGS", 86, qy - 5, scrCol("neutral", 3));
  drawText2(c, lostN, VR - textWidth2(lostN), qy - 5, scrCol("white", 0));
  const ky = rowY(4), kidsN = KIDS.filter(k => G.flags["q:kid:" + k.id]).length + " / " + KIDS.length;
  drawText2(c, "FRIENDS FOUND", 86, ky - 5, scrCol("neutral", 3));
  drawText2(c, kidsN, VR - textWidth2(kidsN), ky - 5, scrCol("white", 0));
  // the six shards round the empty heart of the stone
  drawText2(c, "SHARDS OF THE SUNSTONE", SX, 232, scrCol("water", 3));
  drawText2(c, G.shards + " / " + SHARDS_NEEDED, R - textWidth2(G.shards + " / " + SHARDS_NEEDED), 232, scrCol("white", 0));
  drawPanel(c, SX, T, R - SX, B - T);
  const cx = (SX + R) / 2, cy = T + (B - T) / 2;
  for (let i = 0; i < SHARDS_NEEDED; i++) {
    const a = i * 2 * Math.PI / SHARDS_NEEDED - Math.PI / 2, x = cx + Math.cos(a) * 70, y = cy + Math.sin(a) * 50;
    // an empty socket is a dark hollow in the panel; a found shard stands in its place
    if (i < G.shards) { const f = shardImg(i, 1.1, true); c.drawImage(f.canvas, Math.round(x - f.canvas.width / 2), Math.round(y + 12 - f.canvas.height)); }
    else {
      c.fillStyle = scrCol("neutral", 0); c.fillRect(Math.round(x - 9), Math.round(y - 9), 18, 18);
      c.fillStyle = scrCol("neutral", 2); c.fillRect(Math.round(x - 9), Math.round(y + 9), 18, 1);
    }
  }
  if (G.shards >= SHARDS_NEEDED) blitCentered(c, withRim(sunstoneImg()), cx, cy);
  drawText2C(c, keyWord("saveLine"), RW / 2, 424, scrCol("neutral", 3));
  // (the notes' clocks run in main.js step; a save refused on the raft, a ladder, the
  // tether or in a fall says why right under the save line)
  if (G.saveMsg > 0) drawText2C(c, "QUEST SAVED!", RW / 2, 448, scrCol("green", 5));
  else if (G.saveNote > 0) drawText2C(c, "STAND ON LAND TO SAVE", RW / 2, 448, scrCol("red", 3));
}

// ---------- game over ----------
function drawGameOver2(c) {
  c.fillStyle = scrCol("ink", 0); c.fillRect(0, 0, RW, RH);
  if (!SCR.goBG) { const p = new Pix(RW, RH); paintRidge(p, 420, 26, 40, 520, scrCol("red", 0), scrCol("red", 1), RH); SCR.goBG = p.toCanvas(); }
  c.drawImage(SCR.goBG, 0, 0);
  drawBevelC(c, "GAME OVER", RW / 2, 110, 4, "red");
  drawMenu(c, ["CONTINUE", "SAVE QUEST", "QUIT"], 222, G.menuIdx);
  if (G.saveMsg > 0) drawText2C(c, "QUEST SAVED!", RW / 2, 330, scrCol("green", 5));
}

// ---------- the ending ----------
// phases: "rise" (in the sage's room the six shards lift, circle and fuse), "dawn" (the
// valley at sunrise), "credits" (the cast walks by), "record" (the journey in numbers)
function startEnding() {
  G.mode = "win"; G.endPhase = "rise"; G.winT = 0; SCR.lit = null;
  Sound.music("ending");
  Sound.sfx("shard");
}
function updateWin() {
  G.winT++;
  const skip = Input.pressed("start") || Input.pressed("a");
  switch (G.endPhase) {
    case "rise": if (G.winT >= 240 || (skip && G.winT > 60)) { G.endPhase = "dawn"; G.winT = 0; } break;
    case "dawn": if (G.winT >= 720 || (skip && G.winT > 120)) { G.endPhase = "credits"; G.winT = 0; G.credY = 0; Sound.music("credits"); } break;
    case "credits":
      G.credY += skip ? 6 : 0.6;
      // (a roll let run to its end is already in the credits track's own record-page loop;
      // one hurried past gets the record page's music on its own)
      if (G.credY > creditsLength()) { G.endPhase = "record"; if (G.winT < 3600) Sound.music("record"); G.winT = 0; }
      break;
    case "record": if (G.winT > 90 && skip) { G.mode = "title"; G.titleT = 0; G.titleMenu = false; Sound.music("title"); } break;
  }
}
function drawWin2(c) {
  if (G.endPhase === "rise") return drawEndRise(c);
  if (G.endPhase === "dawn") return drawEndDawn(c);
  if (G.endPhase === "credits") return drawCredits(c);
  return drawRecord(c);
}
// The light of the whole stone on the floor: a dithered pool round the sage, dense at
// its heart and thinning outward, laid only on bare floor pixels; and the stone's own
// small shadow on the floor below it.
function litRoom(c) {
  const W = RW, H = 352, cur = c.getImageData(0, RHUD, W, H).data;
  const base = currentScene().base.getContext("2d").getImageData(0, 0, W, H).data;
  const pool = new Pix(W, H), cx = 256, cy = 128;
  const bare = (i) => cur[i] === base[i] && cur[i + 1] === base[i + 1] && cur[i + 2] === base[i + 2];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - cx) / 90, dy = (y - cy) / 32, d = dx * dx + dy * dy, i = (y * W + x) * 4;
    if (d > 1 || !bare(i)) continue;
    const on = d < 0.35 ? ((x + y) & 1) === 0 : d < 0.7 ? ((x & 1) === 0 && (y & 1) === 0) || ((x + y) & 3) === 0 && (y & 1) : (y & 1) === 0 && ((x + ((y >> 1) & 1) * 2) & 3) === 0;
    if (on) pool.d[y * W + x] = hexU32(scrCol(d < 0.35 ? "gold" : "plaster", 3));
  }
  // the stone's shadow: a small flat dark dither just under its lowest ray (tip at y ~292),
  // on the bare floor between the stone and the hero
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const sx = (x - END_STONE[0]) / 13, sy = (y - (END_STONE[1] + 7 - RHUD)) / 3.5, i = (y * W + x) * 4;
    if (sx * sx + sy * sy <= 1 && bare(i)) pool.d[y * W + x] = hexU32(scrCol("neutral", (x + y) & 1 ? 0 : 1));
  }
  return { pool: pool.toCanvas() };
}
// where the joined stone hangs: over the floor, in front of the sage (canvas pixels)
const END_STONE = [256, 290];
function drawEndRise(c) {
  renderWorld(c);
  const t = Math.min(1, G.winT / 200);
  const hx = (P.x + 8) * SC, hy = (P.y + 4) * SC + RHUD, sx = END_STONE[0], sy = END_STONE[1] - 20;
  const cx = hx + (sx - hx) * t, cy = hy + (sy - hy) * t;
  if (t < 1) {
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + G.winT * 0.06, r = 40 * (1 - t) + 6;
      blitCentered(c, shardImg(i), cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.6);
    }
  } else blitCentered(c, sunstoneImg(), cx, cy);
  // as they join, a flash of light fills the room, and sparks circle the stone after
  if (G.winT >= 200 && G.winT < 212) {
    if (!SCR.flash) { const p = new Pix(RW, 352), w = hexU32(scrCol("white", 0)); for (let y = 0; y < 352; y++) for (let x = (y & 1); x < RW; x += 2) p.d[y * RW + x] = w; SCR.flash = p.toCanvas(); }
    c.drawImage(SCR.flash, 0, RHUD);
  }
  if (G.winT > 200) {
    if (!SCR.lit) SCR.lit = litRoom(c);
    c.drawImage(SCR.lit.pool, 0, RHUD);
    for (let i = 0; i < 3; i++) {
      const a = G.winT * 0.05 + i * 2.1, sp = FX.sparkle[((G.frame >> 2) + i) & 3];
      c.drawImage(sp, Math.round(cx + Math.cos(a) * 46 - sp.width / 2), Math.round(cy + Math.sin(a) * 30 - sp.height / 2));
    }
    drawPanel(c, RW / 2 - 150, RH - 58, 300, 34); drawText2C(c, "THE SIX SHARDS ARE ONE AGAIN!", RW / 2, RH - 46, scrCol("gold", 3));
  }
}
const DAWN_PAGES = [
  [80, ["THE SUNSTONE IS WHOLE AGAIN.", "DAWN RETURNS TO ELDERMERE."]],
  [300, ["MAREN IS FREE, AND THE SHADOW", "OF VEX HAS PASSED FROM THE VALE."]],
  [500, ["THANK YOU, RILL."]],
];
function drawEndDawn(c) {
  const step = Math.min(3, Math.floor(G.winT / 150));
  // the stone climbs from behind the peaks as the sky lightens: sky, stone, then the land
  const sunY = Math.max(96, 330 - Math.floor(G.winT / 2));
  c.drawImage(valleySky(step), 0, 0);
  blitCentered(c, sunstoneImg(), RW / 2, sunY);
  c.drawImage(valleyLand(step), 0, 0);
  // Rill and Maren on the near hill, looking out over the valley (in the dark of the
  // night at first, like everything round them)
  const sw = Math.max(1, G.inv.sword || 1), sd = Math.max(1, Math.min(3, G.inv.shield || 1)), dark = [2, 1, 0, 0][step];
  const hero = charFrame("hero|" + UP + "|-1|-1||" + sw + sd, () => renderHero({ dir: UP, walk: -1, attack: -1, sword: sw, shield: sd }));
  const sage = charFrame("npc|npc_sage" + UP, () => renderFit(npcPrims("npc_sage", UP, 0)));
  const night = (f, k) => dark ? charFrame(k + "|night" + dark, () => ({ canvas: shadeCanvas(f.canvas, dark), ax: f.ax, ay: f.ay })) : f;
  blitFrame(c, night(hero, "hero" + sw + sd), 236, 404);
  blitFrame(c, night(sage, "sage"), 280, 404);
  const page = DAWN_PAGES.filter(([t]) => G.winT >= t).pop();
  if (!page) return;
  drawPanel(c, 40, 420, RW - 80, 52);
  const lines = page[1], y0 = lines.length > 1 ? 432 : 441;
  lines.forEach((line, i) => drawText2C(c, line, RW / 2, y0 + i * 18, page === DAWN_PAGES[DAWN_PAGES.length - 1] ? scrCol("gold", 3) : scrCol("white", 0)));
}

// the credits: a title, then the cast walking by with their names
const CREDITS = [
  { t: "SHARDS OF THE SUNSTONE", big: true },
  { gap: 40 },
  { t: "THE CAST", head: true },
  { who: "hero", t: "RILL, THE WANDERER" }, { who: "npc_sage", t: "MAREN, SAGE OF THE FLAME" }, { who: "npc_elder", t: "THE ELDER OF BRAMBLEFORD" },
  { who: "npc_smith", t: "THE SMITH WITHOUT A FIRE" }, { who: "npc_widow", t: "THE WIDOW OF THE LAKE" }, { who: "npc_kid", t: "THE CHILDREN AT PLAY" },
  { who: "npc_hermit", t: "THE HERMIT OF THE CRAG" }, { who: "npc_shop", t: "THE TRADER" },
  { gap: 30 }, { t: "THE FOES", head: true },
  { foe: () => grubPrims(DOWN, 0, "r"), t: "GRUB" }, { foe: () => snapPrims(0), t: "SNAPBUD" }, { foe: () => casterPrims(DOWN, 0), t: "HOODED SLINGER" },
  { foe: () => mawPrims("up", 0), t: "SAND MAW" }, { foe: () => batPrims(0), box: [64, 48, 32, 24], t: "CAVE BAT" }, { foe: () => oozePrims(0), t: "OOZE" },
  { foe: () => ironPrims(DOWN, 0), t: "IRONSHELL KNIGHT" }, { foe: () => hexerPrims(DOWN, 0), t: "HEXER" }, { foe: () => clutchPrims(0), t: "CLUTCH" },
  { foe: () => scarabPrims(DOWN, 0, 0), t: "SAND SCARAB" }, { foe: () => chillerPrims(0, 0), box: [48, 48, 24, 26], t: "CHILLER" },
  { foe: () => fireImpPrims(DOWN, 0, 0), t: "FIRE IMP" }, { foe: () => shellbackPrims(DOWN, 0, 0), t: "SHELLBACK" },
  { gap: 30 }, { t: "THE GUARDIANS OF THE SHARDS", head: true },
  { foe: () => wyrmPrims(0), box: [200, 180, 100, 130], t: "CINDERWYRM" }, { foe: () => wormHeadPrims(0, DOWN), t: "MARROWWORM" },
  { foe: () => gazerPrims(1), box: [160, 140, 80, 90], t: "GAZER" }, { foe: () => dunescalePrims(0, "walk"), box: [220, 200, 110, 130], t: "DUNESCALE" },
  { foe: () => frostmawPrims(0), box: [220, 200, 110, 150], t: "FROSTMAW" }, { foe: () => emberhulkPrims(0, 0), box: [200, 200, 100, 160], t: "EMBERHULK" },
  { foe: () => vexPrims(0), box: [200, 200, 100, 160], t: "VEX, THE SHADOW TYRANT" },
  { gap: 40 },
  { t: "EVERY PICTURE, SOUND AND TUNE", head: true }, { t: "IN THIS GAME WAS MADE IN CODE." }, { t: "NOTHING WAS BORROWED." },
  { gap: 60 }, { t: "THANK YOU FOR PLAYING", big: true },
];
function creditImg(e) {
  if (e.img) return e.img;
  if (e.who === "hero") e.img = renderFit(heroPrims({ dir: DOWN, walk: -1, attack: -1, sword: 1, shield: 1 }));
  else if (e.who) e.img = renderFit(npcPrims(e.who, DOWN, 0));
  else if (e.foe) e.img = e.box ? renderFit(e.foe(), false, ...e.box) : renderFit(e.foe());
  return e.img;
}
// the widest figure among the entries of e's section (the run between two headings)
function cardWidth(e) {
  const i = CREDITS.indexOf(e);
  let a = i, b = i;
  while (a > 0 && !CREDITS[a - 1].head) a--;
  while (b < CREDITS.length - 1 && !CREDITS[b + 1].head) b++;
  let w = 0;
  for (let k = a; k <= b; k++) if (CREDITS[k].who || CREDITS[k].foe) w = Math.max(w, creditImg(CREDITS[k]).canvas.width);
  return w;
}
function creditHeight(e) {
  if (e.gap) return e.gap;
  if (e.big) return 44;
  if (e.head) return 30;
  if (e.who || e.foe) return Math.max(40, creditImg(e).canvas.height + 22);
  return 20;
}
function creditsLength() { let h = 0; for (const e of CREDITS) h += creditHeight(e); return h + RH; }
function drawCredits(c) {
  c.drawImage(valleyBackdrop(3), 0, 0);
  // a night-blue band for the text to sit on
  c.fillStyle = scrCol("purple", 0); c.fillRect(56, 0, RW - 112, RH);
  c.fillStyle = scrCol("purple", 1); c.fillRect(56, 0, 2, RH); c.fillRect(RW - 58, 0, 2, RH);
  let y = RH - Math.floor(G.credY);
  for (const e of CREDITS) {
    const h = creditHeight(e);
    if (y + h > 0 && y < RH) {
      if (e.big) drawBevelC(c, e.t, RW / 2, y + 6, 2, "gold");
      else if (e.head) drawText2C(c, e.t, RW / 2, y + 8, scrCol("gold", 3));
      else if (e.who || e.foe) {
        // (each figure on its own lighter card, so dark foes show on the night-blue band)
        const f = creditImg(e), fx = 130, fy = Math.round(y + h - 12 - f.canvas.height);
        // (every card in a section is as wide as its widest figure)
        const pw = cardWidth(e) + 12, ph = f.canvas.height + 10;
        drawPanel(c, Math.round(fx - pw / 2), fy - 5, pw, ph, scrCol("purple", 2));
        c.drawImage(f.canvas, Math.round(fx - f.canvas.width / 2), fy);
        drawText2(c, e.t, 214, Math.round(y + h / 2 - 5), scrCol("white", 0));
      } else if (e.t) drawText2C(c, e.t, RW / 2, y + 4, scrCol("white", 0));
    }
    y += h;
  }
}

// ---------- the record ----------
function completion() {
  const f = G.flags, c = { shards: [G.shards, SHARDS_NEEDED] };
  // treasures you carry
  const kit = [G.inv.sword >= 1, G.inv.sword >= 2, G.inv.sword >= 3, G.inv.shield >= 2, G.inv.shield >= 3, G.inv.boomerang, G.inv.bow, G.inv.candle, G.inv.ladder, G.inv.raft, G.inv.ring, G.inv.hook, G.inv.glove, G.inv.hammer];
  c.treasures = [kit.filter(Boolean).length, kit.length];
  // heart containers: one from each guardian that drops one, and those lying in dungeons
  let hcT = 0, hcF = 0, hpT = 0, hpF = 0;
  for (const d in DUNGEONS) {
    for (const k in DUNGEONS[d].rooms) {
      const r = DUNGEONS[d].rooms[k];
      if (r.boss && r.boss !== "vex") { hcT++; if (f["d" + d + ":bosshc"]) hcF++; }
      if (r.item === "heartcont") { hcT++; if (f["d" + d + ":item:" + k]) hcF++; }
      if (r.item === "heartpiece") { hpT++; if (f["d" + d + ":item:" + k]) hpF++; }
    }
  }
  for (const id in CAVES) {
    const cv = CAVES[id];
    if (cv.gift === "heartpiece") { hpT++; if (f["cave:" + cv.once]) hpF++; }
    for (const w of cv.wares || []) if (w.kind === "heartcont") { hcT++; if (w.once && f["cave:" + w.once]) hcF++; }
  }
  let secT = 0, secF = 0;
  for (const key in OVERRIDES) {
    const ov = OVERRIDES[key];
    if (ov.hp) { hpT++; if (f["hp:" + key]) hpF++; }
    for (const s of ov.secrets || []) {
      secT++; if (f["sec:" + key + ":" + s.x + "," + s.y]) secF++;
      if (s.kind === "burnhp") { hpT++; if (f["hp:" + key + ":" + s.x + "," + s.y]) hpF++; }
    }
  }
  for (const q of (typeof QUEST_HEARTS !== "undefined" ? QUEST_HEARTS : [])) { hpT++; if (f[q]) hpF++; }
  c.containers = [hcF, hcT]; c.pieces = [hpF, hpT]; c.secrets = [secF, secT];
  let got = 0, all = 0;
  for (const k of ["shards", "treasures", "containers", "pieces", "secrets"]) { got += c[k][0]; all += c[k][1]; }
  c.percent = all ? Math.floor(got * 100 / all) : 100;
  return c;
}
function clock(frames) {
  const s = Math.floor(frames / 60), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, ss = s % 60;
  return h + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
}
function drawRecord(c) {
  c.drawImage(valleyBackdrop(3), 0, 0);
  drawPanel(c, 72, 60, RW - 144, 330);
  drawBevelC(c, "YOUR JOURNEY", RW / 2, 76, 2, "gold");
  const k = completion();
  const rows = [
    ["PLAY TIME", clock(G.stats.frames)], ["TIMES FALLEN", String(G.stats.deaths)],
    ["SHARDS", k.shards.join(" / ")], ["TREASURES", k.treasures.join(" / ")], ["HEART CONTAINERS", k.containers.join(" / ")],
    ["HEART PIECES FOUND", k.pieces.join(" / ")], ["SECRETS FOUND", k.secrets.join(" / ")],
  ];
  rows.forEach(([a, b], i) => {
    const y = 130 + i * 26;
    if (G.winT < 20 + i * 12) return;
    drawText2(c, a, 124, y, scrCol("neutral", 4));
    drawText2(c, b, RW - 124 - textWidth2(b), y, scrCol("white", 0));
  });
  if (G.winT > 20 + rows.length * 12) {
    drawText2C(c, "COMPLETE: " + k.percent + "%", RW / 2, 330, k.percent >= 100 ? scrCol("gold", 3) : scrCol("water", 4));
    if (k.percent >= 100) drawText2C(c, "EVERY SECRET OF ELDERMERE FOUND!", RW / 2, 352, scrCol("gold", 3));
  }
  if (G.winT > 90 && ((G.frame >> 4) & 1)) drawText2C(c, keyWord("push"), RW / 2, 430, scrCol("white", 0));
}
