"use strict";
// ---------- Character sprites: model frames rendered once, drawn at 2x logic positions ----------
// Every actor is anchored at its ground contact point (feet), which is also the
// depth-sort key; frames are cached by pose.

const CHAR_CACHE = new Map();
function charFrame(key, build) {
  let f = CHAR_CACHE.get(key);
  if (!f) { f = build(); CHAR_CACHE.set(key, f); }
  return f;
}
// Frames an actor is about to need are rendered a few milliseconds per display frame,
// so a new enemy or pose never stalls the game the first time it appears.
const CHAR_QUEUE = [];
function queueFrame(key, build) { if (!CHAR_CACHE.has(key)) CHAR_QUEUE.push([key, build]); }
function pumpFrames(ms) {
  const t0 = performance.now();
  while (CHAR_QUEUE.length && performance.now() - t0 < ms) {
    const [key, build] = CHAR_QUEUE.shift();
    if (!CHAR_CACHE.has(key)) CHAR_CACHE.set(key, build());
  }
}

// Draw a frame so that its anchor lands on (x, y) in canvas pixels; returns where it went.
function blitFrame(c, f, x, y) {
  const px = Math.round(x - f.ax), py = Math.round(y - f.ay);
  c.drawImage(f.canvas, px, py);
  return { img: f.canvas, x: px, y: py };
}

// An actor hidden behind something tall is shown through it as a ghost: its full
// outline plus every other pixel of its body (drawn over itself this changes nothing,
// so it can be laid over the whole sprite). No new colours, no blending.
const _ghostCache = new WeakMap();
function ghostOf(img, parity) {
  let m = _ghostCache.get(img);
  if (!m) { m = {}; _ghostCache.set(img, m); }
  if (m[parity]) return m[parity];
  const w = img.width, h = img.height;
  const k = document.createElement("canvas"); k.width = w; k.height = h;
  const g = k.getContext("2d");
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, w, h), a = d.data;
  const ink = hexU32(STYLE.ramps.ink[0]);
  const ir = ink & 255, ig = (ink >>> 8) & 255, ib = (ink >>> 16) & 255;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (!a[i + 3]) continue;
    const isInk = a[i] === ir && a[i + 1] === ig && a[i + 2] === ib;
    if (!isInk && ((x + y + parity) & 1)) a[i + 3] = 0;
  }
  g.putImageData(d, 0, 0);
  m[parity] = k;
  return k;
}
function drawGhost(c, drawn) { c.drawImage(ghostOf(drawn.img, (drawn.x + drawn.y) & 1), drawn.x, drawn.y); }

// Render a model into a roomy box, then crop to the pixels actually drawn.
// flash: the hit-flash version (body in the palette's white, outline kept).
function renderFit(m, flash, W, H, AX, AY) {
  W = W || 128; H = H || 128;
  const r = render3D(m.prims, W, H, AX === undefined ? W / 2 : AX, AY === undefined ? H * 0.7 : AY, { outline: "char", decals: m.decals });
  const d = r.pix.d;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[y * W + x] >>> 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) return { canvas: r.canvas, ax: r.ax, ay: r.ay };
  if (flash) {
    // a white silhouette inside its outline: interior ink (eyes, lines between parts)
    // goes white too, or it shows as stray dark specks in the flash
    const ink = inkU32(), wh = pc("white", 0);
    const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && (d[y * W + x] >>> 24);
    const inner = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (d[i] === ink && solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1) && solid(x, y + 1)) inner.push(i);
    }
    // (pixels that were already white stay white below: thin white frost on Frostmaw is all
    // edge, and inking it turned it into dark scribbles in the flash)
    const was = d.slice();
    for (let i = 0; i < d.length; i++) if ((d[i] >>> 24) && d[i] !== ink) d[i] = wh;
    for (const i of inner) d[i] = wh;
    // one even ink outline all round (the lit side's outline is a light tone, which went
    // white, so only the shadow side kept a dark edge)
    const edge = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (solid(x, y) && !(solid(x - 1, y) && solid(x + 1, y) && solid(x, y - 1) && solid(x, y + 1))) edge.push(y * W + x);
    for (const i of edge) if (was[i] !== wh) d[i] = ink;
  }
  const w = x1 - x0 + 1, h = y1 - y0 + 1;
  const src = flash ? r.pix.toCanvas() : r.canvas;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  c.getContext("2d").drawImage(src, x0, y0, w, h, 0, 0, w, h);
  return { canvas: c, ax: r.ax - x0, ay: r.ay - y0 };
}

// ---------- enemies and bosses ----------
function wormDir(e) { const c = Math.cos(e.ang || 0), s = Math.sin(e.ang || 0); return Math.abs(c) > Math.abs(s) ? (c > 0 ? RIGHT : LEFT) : (s > 0 ? DOWN : UP); }
// Which frame an enemy shows right now: { key, build, alt, box }, "none" when it is
// hidden (buried, shimmering), or null when the kind has no model yet.
function foeSpec(e) {
  const f = (e.anim >> 3) & 1;
  let key, build, alt = 0, box = null;
  switch (e.kind) {
    case "grub_r": case "grub_b": key = e.kind + e.dir + f; build = () => grubPrims(e.dir, f, e.kind === "grub_b" ? "b" : "r"); break;
    case "snap": { const k = e.shootT > 0 ? 1 : 0; key = "snap" + k; build = () => snapPrims(k); break; }
    case "caster": { const k = e.throwT > 0 ? 1 : 0, d = e.dir; key = "caster" + d + k; build = () => casterPrims(d, k); break; }
    case "maw": {
      if (e.state === "buried") return "none";
      const st = e.state === "up" ? "up" : "mound";
      key = "maw" + st + f; build = () => mawPrims(st, f); break;
    }
    case "bat": key = "bat" + f; build = () => batPrims(f); alt = 16; box = [64, 48, 32, 24]; break;
    case "wisp": key = "wisp" + f; build = () => wispPrims(f); alt = 12; box = [40, 32, 20, 16]; break;
    case "oozelet": { const k = e.state === 1 ? 1 : 0; key = "oozelet" + k; build = () => oozeletPrims(k); break; }
    case "ooze": { const k = e.state === 1 ? 1 : 0; key = "ooze" + k; build = () => oozePrims(k); break; }
    case "iron": key = "iron" + e.dir + f; build = () => ironPrims(e.dir, f); break;
    case "hexer": { const k = e.t > 40 && e.t < 70 ? 1 : 0, d = dirToward(e.x, e.y, P.x, P.y); key = "hexer" + d + k; build = () => hexerPrims(d, k); break; }
    case "clutch": key = "clutch" + f; build = () => clutchPrims(f); break;
    case "spiketrap": key = "spike"; build = () => spikeTrapPrims(); break;
    case "scarab": { const ch = e.state === "charge" || e.state === "wind" ? 1 : 0, d = e.dir; key = "scarab" + d + f + ch; build = () => scarabPrims(d, f, ch); break; }
    case "chiller": { const k = e.castT > 0 ? 1 : 0; key = "chiller" + f + k; build = () => chillerPrims(f, k); alt = 14; box = [48, 48, 24, 26]; break; }
    case "fireimp": {
      const hop = e.state === "hop" ? 1 : 0, th = e.throwT > 0 ? 1 : 0, d = e.dir;
      key = "imp" + d + hop + th; build = () => fireImpPrims(d, hop, th);
      alt = hop ? Math.round(Math.sin((16 - e.t) / 16 * Math.PI) * 8) : 0;
      break;
    }
    case "shellback": { const fl = e.flipped > 0 ? 1 : 0, d = e.dir; key = "shell" + d + f + fl; build = () => shellbackPrims(d, f, fl); break; }
    case "boss_dunescale": { const st = e.state === "burrow" ? "burrow" : e.state === "stun" ? "stun" : "walk"; key = "dune" + st + f; build = () => dunescalePrims(f, st); box = [220, 200, 110, 130]; break; }
    case "boss_frostmaw": { const k = e.open ? 1 : 0; key = "frost" + k; build = () => frostmawPrims(k); box = [220, 200, 110, 150]; break; }
    case "boss_emberhulk": { const k = e.bareT > 0 ? 1 : 0; key = "ember" + f + k; build = () => emberhulkPrims(f, k); box = [200, 200, 100, 160]; break; }
    case "boss_wyrm": { const k = e.spitT > 0 ? 1 : 0; key = "wyrm" + k; build = () => wyrmPrims(k); box = [160, 140, 80, 100]; break; }
    case "worm_head": { const d = wormDir(e); key = "wormh" + d + f; build = () => wormHeadPrims(f, d); break; }
    case "worm_seg": {
      let tail = true;
      for (const o of G.enemies) if (!o.dead && o.shared === e.shared && o.segIndex > e.segIndex) tail = false;
      const g = tail && (e.anim & 8) ? 1 : 0;
      key = "worms" + g; build = () => wormSegPrims(g); break;
    }
    case "boss_gazer": { const k = e.open ? 1 : 0; key = "gazer" + k; build = () => gazerPrims(k); alt = 18; box = [128, 112, 64, 72]; break; }
    case "boss_vex": {
      if (e.cloak > 0 && (e.anim & 2)) return "none";
      const k = (e.anim >> 4) & 1; key = "vex" + k; build = () => vexPrims(k); box = [200, 200, 100, 160]; break;
    }
    default: return null;
  }
  return { key, build, alt, box };
}
function foeFrameFor(s, flash) {
  const box = s.box;
  return charFrame("foe|" + s.key + (flash ? "|f" : ""), () => box ? renderFit(s.build(), flash, box[0], box[1], box[2], box[3]) : renderFit(s.build(), flash));
}
// Returns false when the kind has no model yet (the old sprite is drawn instead).
function drawFoe2(c, e) {
  if (e.dead) return true;
  if (e.spawnT > 0) {
    // it arrives in a puff of smoke
    const fr = FX.poof[Math.max(0, Math.min(5, 5 - Math.floor(e.spawnT / 4)))];
    c.drawImage(fr, Math.round((e.x + 8) * SC - fr.width / 2), Math.round((e.y + 8) * SC + RHUD - fr.height / 2));
    return true;
  }
  if (!e._warm) { e._warm = true; prewarmFoe(e); }
  const s = foeSpec(e);
  if (s === "none") return true;
  if (!s) return false;
  const fr = foeFrameFor(s, e.iframes > 0 && (e.iframes & 2));
  // (a scarab about to charge rattles side to side)
  const cx = e.x + (e.boss ? (e.w || 12) / 2 + 2 : 8) + (e.state === "wind" && e.kind === "scarab" ? ((e.t & 2) ? 1 : -1) : 0);
  const shake = e.stunT > 0 && (e.anim & 4) ? 2 : 0;
  e._drawn = blitFrame(c, fr, cx * SC, foeFootOf(e, s, fr) * SC + RHUD - s.alt + shake);
  return true;
}
// Where an enemy's feet are drawn (logic y). A creature lower than the hero stands so
// its body is centred on the box the game tests (e.y+2..e.y+14), not with its feet on
// the tile's bottom edge.
function foeFootOf(e, s, fr) {
  const foot = enemyFootY(e);
  if (e.boss || !s || s === "none" || s.alt || !fr) return foot;
  return Math.min(foot, e.y + 8 + fr.ay / SC / 2);
}
function foeFootY(e) {
  if (e.boss || e.spawnT > 0) return enemyFootY(e);
  const s = foeSpec(e);
  return foeFootOf(e, s, s && s !== "none" ? CHAR_CACHE.get("foe|" + s.key) : null);
}
// Queue every pose this enemy can show (both animation frames, all facings, its states).
function prewarmFoe(e) {
  const variants = [];
  for (const anim of [0, 8, 16, 24]) for (const dir of [UP, DOWN, LEFT, RIGHT]) {
    variants.push({ anim, dir });
    variants.push({ anim, dir, shootT: 1, throwT: 1, spitT: 1, open: true, t: 50, state: e.kind === "maw" ? "up" : 1 });
    if (e.kind === "maw") variants.push({ anim, dir, state: "mound" });
  }
  for (const v of variants) {
    const s = foeSpec(Object.assign({}, e, v));
    if (s && s !== "none") queueFrame("foe|" + s.key, () => { const box = s.box; return box ? renderFit(s.build(), false, box[0], box[1], box[2], box[3]) : renderFit(s.build(), false); });
  }
}
function prewarmHero() {
  const sword = Math.max(1, (G.inv && G.inv.sword) || 1), shield = G.inv ? Math.max(1, Math.min(3, G.inv.shield || 1)) : 1;
  for (const dir of [DOWN, UP, LEFT, RIGHT]) {
    const base = { dir, walk: -1, attack: -1, sword, shield };
    const poses = [base, ...[0, 1, 2, 3].map(w => Object.assign({}, base, { walk: w })), ...[0, 1, 2, 3].map(a => Object.assign({}, base, { attack: a })), Object.assign({}, base, { use: true })];
    for (const p of poses) queueFrame(heroKey(p), () => renderHero(p));
  }
}

// ---------- people, treasures, pickups, missiles ----------
// NPC standing at logic (lx, ly) (16px box, feet on its bottom edge).
function drawNPC2(c, key, lx, ly, dir) {
  if (!PEOPLE[key]) return false;
  const d = dir === undefined ? DOWN : dir;
  blitFrame(c, charFrame("npc|" + key + d, () => renderFit(npcPrims(key, d, 0))), (lx + 8) * SC, (ly + 15) * SC + RHUD);
  return true;
}
// A treasure's picture (cached). The heart piece is drawn by hand (heartPieceFrame), the
// shard as a cut crystal (shardFrame), the rest from their models.
function itemFrame(kind) {
  return charFrame("item|" + kind, () => {
    if (kind === "heartpiece") return heartPieceFrame();
    if (kind === "shard") return shardFrame(0, 1);
    const pm = itemPrims(kind); return pm ? renderFit(pm) : null;
  });
}
// A shard of the Sunstone, drawn as a cut crystal: straight edges, a point at each end,
// three faces (lit left, middle, shaded right), a white glint along the lit edge and an
// ink outline. v 0..5: each piece breaks its own way (tilt, proportions, a broken top,
// a smaller crystal grown beside it); k: size.
function shardFrame(v, k, rim) {
  const h = (i) => hash2(v * 11 + i, 5, 883) - 0.5, S = 1.05 * (k || 1);
  const W = Math.ceil(34 * S), H = Math.ceil(40 * S), p = new Pix(W, H), cx = W / 2, cy = H / 2 + 1;
  const tilt = h(1) * 0.55, ca = Math.cos(tilt), sa = Math.sin(tilt);
  const tf = (x, y, ox, oy, s2) => [cx + (ox + (x * ca - y * sa) * s2) * S, cy + (oy + (x * sa + y * ca) * s2) * S];
  const inPoly = (pts, x, y) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const side = (a, b, x, y) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]);
  const crystal = (ox, oy, s2, broken) => {
    // a point on top, square shoulders, straight sides and a broken, stepped foot
    const w = 5.4 + h(2) * 1.2, top = -13.5 - h(3) * 2, bot = 8.5 + h(4) * 1.5;
    // (shoulders set low, so the top comes to a clear point, never a dome)
    const L = [
      broken ? [-1.6, top + 3] : [0.3, top],
      ...(broken ? [[1.2, top + 1.8]] : []),
      [w, -2.5 + h(5)], [w * 0.95, 5.5 + h(6)], [w * 0.35, bot], [-w * 0.15, bot - 2.2], [-w * 0.6, bot + 0.6], [-w, 5 + h(7)], [-w * 1.02, -1.5 + h(8)],
    ].map(([x, y]) => tf(x, y, ox, oy, s2));
    const T = L[0], lo = L[L.length - 2], ro = L[broken ? 3 : 2], B = L[broken ? 5 : 4];
    // faces meet at the point and fan out: lit face widest, the shaded one a narrow right edge
    const A = [B[0] * 0.85 + lo[0] * 0.15, B[1] * 0.85 + lo[1] * 0.15], C = [B[0] * 0.25 + ro[0] * 0.75, B[1] * 0.25 + ro[1] * 0.75];
    const lit = pc("gold", 3), mid = pc("gold", 2), dark = pc("gold", 1), glint = pc("white", 0);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = x + 0.5, py = y + 0.5;
      if (!inPoly(L, px, py)) continue;
      const sl = side(T, A, px, py), sr = side(T, C, px, py);
      p.d[y * W + x] = sl > 0 ? lit : sr < 0 ? dark : mid;
    }
    // the glint: a white line just inside the lit edge, from the top down
    const e0 = L[0], e1 = L[L.length - 1];
    for (let t = 0.06; t < 0.85; t += 0.04) {
      const x = Math.round(e0[0] + (e1[0] - e0[0]) * t + 1.2), y = Math.round(e0[1] + (e1[1] - e0[1]) * t + 0.6);
      if (x >= 0 && y >= 0 && x < W && y < H && p.d[y * W + x] === lit) p.d[y * W + x] = glint;
    }
  };
  // a smaller crystal behind, beside the foot (on four of the six)
  if (v % 3 !== 1) crystal(h(9) > 0 ? 5.5 : -5.5, 5, 0.55, false);
  crystal(0, 0, 1, v & 1);
  // ink outline all round
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && (p.d[y * W + x] >>> 24);
  const edge = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) edge.push(y * W + x);
  const ink = inkU32();
  for (const i of edge) p.d[i] = ink;
  // on a dark page the ink outline vanishes into the background: a dim gold glow rim
  // round it keeps the crystal's edge
  if (rim) {
    const glow = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) glow.push(y * W + x);
    for (const i of glow) p.d[i] = pc("gold", 0);
  }
  // crop to the drawn pixels, anchored at the bottom centre
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (solid(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const q = new Pix(x1 - x0 + 1, y1 - y0 + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) q.d[(y - y0) * q.w + x - x0] = p.d[y * W + x];
  return { canvas: q.toCanvas(), ax: Math.round(q.w / 2), ay: q.h + 2 };
}
// The heart piece (redesign E45): a gold wire heart with one ruby quarter, so it reads at a
// glance as one piece of four. The heart is the heart treasure's own model seen from the
// game camera, cut into quarters at its centre column and at 42% of its height. The held
// (upper-left) quarter is ruby stepping darker from the upper left toward its two straight
// cuts, which meet at the heart's centre and are edged in the wire's shaded gold; its top
// and left follow the lobe's outer curve. A gold wire runs round the empty quarters, bright
// on the upper left only, and inside them the slot is a dark red-brown no floor or grass
// uses, with the piece's ink shadow along the cuts, so it reads as sunken. Ink all round the
// outside. 18x16, smaller than a whole heart container (20x18): a quarter drawn bigger than
// the whole looked like the better prize.
// (the old piece was the round left lobe cut off a pixel above its bottom, rimmed in pale
// skin along its right and lower cuts, with a white glint: it read as a round bead or a
// button lit from the lower right. A quarter cut out on its own, from any angle, read as a
// dome, a pie slice, a mushroom cap or a red drop.)
function heartPieceFrame() {
  const m = scaleModel(itemPrims("heart"), 1.4), RW0 = 48, RH0 = 48;
  const r = render3D(m.prims, RW0, RH0, RW0 / 2, RH0 * 0.7, { outline: "none", decals: m.decals });
  const src = r.pix.d, body = (x, y) => x >= 0 && y >= 0 && x < RW0 && y < RH0 && (src[y * RW0 + x] >>> 24) !== 0;
  let x0 = RW0, y0 = RH0, x1 = -1, y1 = -1;
  for (let y = 0; y < RH0; y++) for (let x = 0; x < RW0; x++) if (body(x, y)) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const cx = Math.round((x0 + x1 + 1) / 2), cy = Math.round(y0 + (y1 - y0) * 0.42);
  const W = x1 - x0 + 3, H = y1 - y0 + 3, p = new Pix(W, H), at = (x, y) => (y - y0 + 1) * W + (x - x0 + 1);
  const held = (x, y) => body(x, y) && x < cx && y < cy, ink = inkU32();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (!body(x, y)) continue;
    const edge = !body(x - 1, y) || !body(x + 1, y) || !body(x, y - 1) || !body(x, y + 1);
    let c;
    // the held quarter: ruby, its two straight cuts edged in the wire's shaded gold (they
    // face down and right, away from the light)
    // (the lobe's top faced the light and came out one flat pale tone: the ruby steps
    // darker from the upper left toward the cuts)
    if (held(x, y)) { const d = x - x0 + y - y0; c = (x === cx - 1 || y === cy - 1) ? pc("gold", 1) : pc("red", d <= 4 ? 3 : d <= 7 ? 2 : 1); }
    // the wire round the empty quarters: bright gold on the upper left, middle gold on the rest
    else if (edge) c = pc("gold", x - x0 + y - y0 < (cx - x0) + (cy - y0) ? 3 : 2);
    // the sunken slot: the held piece's shadow just right of and below it, dark elsewhere
    else c = (held(x - 1, y) || held(x, y - 1)) ? ink : pc("hair", 0);
    p.d[at(x, y)] = c;
  }
  // ink all round the outside
  const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && p.d[y * W + x];
  const rim = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) rim.push(y * W + x);
  for (const i of rim) p.d[i] = ink;
  return { canvas: p.toCanvas(), ax: Math.round(W / 2), ay: H + 3 };
}
// A treasure on display at logic (lx, ly) (16px box).
function drawItem2(c, kind, lx, ly) {
  const m = itemFrame(kind);
  if (!m) return false;
  blitFrame(c, m, (lx + 8) * SC, (ly + 14) * SC + RHUD);
  return true;
}
// A treasure held up in both hands; (hx, hy) = the hero's feet on the canvas. The
// hands of the "hold" pose are HELD_HANDS px above the feet.
const HELD_HANDS = 27;
function drawHeldItem(c, kind, hx, hy) {
  const m = itemFrame(kind);
  if (!m) return false;
  const bottom = m.canvas.height - 1 - m.ay;          // lowest drawn row, relative to the anchor
  blitFrame(c, m, hx, hy - HELD_HANDS - bottom + 1);
  return true;
}
const PICKUP_ITEM = { heart: "heart", gem1: "gem1", gem5: "gem5", bombs: "bomb", key: "key" };
function drawPickup2(c, k) {
  if (k.dead) return true;
  if (!k.floor && k.t > 300 && (k.t & 4)) return true;
  const kind = k.kind === "item" ? k.item : PICKUP_ITEM[k.kind];
  const m = kind && itemFrame(kind);
  if (!m) return false;
  // loose drops hover a little; floor treasures stand still
  const bob = k.floor ? 0 : Math.round(Math.sin(k.t / 9) * 1.5) - 2;
  const cx = k.floor ? k.x + 8 : k.x + 6, gy = k.floor ? k.y + 14 : k.y + 12;
  blitFrame(c, m, cx * SC, gy * SC + RHUD + bob);
  return true;
}
// The hook's chain from the hand (x0, y0) to the claw (x1, y1), in screen pixels: iron links
// one per 4 px, lying flat and standing on edge in turn (separate renders for a chain across
// the screen and one up or down it: js/gfx/art_dungeon.js), the flat ones first so each
// standing link seems to pass through its neighbours' holes; a white glint runs out along it,
// one link per 3 ticks.
function drawHookChain(c, x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.floor(len / 4));
  if (typeof DunArt === "undefined" || !DunArt.linkSprite) return;
  const axis = Math.abs(x1 - x0) >= Math.abs(y1 - y0) ? "H" : "V", gi = n > 2 ? 1 + Math.floor(G.frame / 3) % (n - 1) : -1;
  for (const pass of [0, 1]) for (let i = 1; i < n; i++) {
    if ((i & 1) !== pass) continue;
    const s = DunArt.linkSprite(axis, pass ? "edge" : "flat", i === gi);
    c.drawImage(s.canvas, Math.round(x0 + (x1 - x0) * i / n) - s.ax, Math.round(y0 + (y1 - y0) * i / n) - s.ay);
  }
}
function drawProj2(c, p) {
  const fl = (p.anim >> 2) & 1;
  let key, build, dy = 0;
  switch (p.type) {
    case "hook": {
      // iron links from the hand to the claw
      const x0 = (P.x + 8) * SC, y0 = (P.y + 9) * SC + RHUD, x1 = p.x * SC, y1 = p.y * SC + RHUD;
      drawHookChain(c, x0, y0, x1, y1);
      blitFrame(c, charFrame("miss|hook" + p.dir, () => renderFit(hookHeadPrims(p.dir), false, 48, 48, 24, 24)), x1, y1);
      return true;
    }
    case "thrown": {
      // an arc through the air: highest halfway, landing where it breaks
      const s = getProp(p.kind, 0), lift = Math.sin(Math.min(1, p.dist / p.range) * Math.PI) * 12 + 18;
      c.drawImage(s.canvas, Math.round(p.x * SC - s.ax), Math.round(p.y * SC + RHUD + 8 - lift - s.ay));
      return true;
    }
    case "arrow": key = "arrow" + p.dir; build = () => arrowPrims(p.dir); break;
    case "beam": key = "beam" + p.dir + fl; build = () => beamPrims(p.dir, fl); break;
    case "boomerang": { const s = (p.anim >> 1) & 3; key = "boom" + s; build = () => ({ prims: boomPrims(s), decals: [] }); break; }
    case "bomb": if (!(p.life > 30 || (p.life & 4))) return true; key = "bomb" + fl; build = () => ({ prims: bombPrims(fl), decals: [] }); dy = 8; break;
    case "rock": key = "rock"; build = () => ({ prims: rockPrims(), decals: [] }); break;
    case "ice": {
      // eight headings, the point leading
      const a = p.vx !== undefined || p.vy !== undefined ? ((Math.round(Math.atan2(p.vy || 0, p.vx || 0) / (Math.PI / 4)) % 8) + 8) % 8 : [6, 2, 4, 0][p.dir !== undefined ? p.dir : DOWN];
      key = "ice" + a; build = () => iceShardPrims(a); break;
    }
    case "seed": key = "seed"; build = () => ({ prims: seedPrims(), decals: [] }); break;
    case "magic": key = "magic" + fl; build = () => ({ prims: spellStarPrims(fl), decals: [] }); break;
    case "fireball": {
      // eight headings, so the flame's tail always streams behind it
      const a = ((Math.round(Math.atan2(p.vy || 0, p.vx || 1) / (Math.PI / 4)) % 8) + 8) % 8;
      key = "fire" + a + fl; build = () => ({ prims: fireballPrims(a, fl), decals: [] }); break;
    }
    case "vexbolt": key = "vex" + fl; build = () => ({ prims: orbPrims("purple", fl), decals: [] }); break;
    case "flame": { const f2 = (p.anim >> 3) & 1; key = "flame" + f2; build = () => ({ prims: candleFlamePrims(f2), decals: [] }); dy = 14; break; }
    default: return false;
  }
  blitFrame(c, charFrame("miss|" + key, () => renderFit(build(), false, 64, 64, 32, 32)), p.x * SC, p.y * SC + RHUD + dy);
  return true;
}
function drawProjectiles2(c) {
  for (const p of G.projectiles) if (!p.dead && !drawProj2(c, p)) withLegacy(c, () => drawProjectiles(c, [p]));
}

// ---------- hit-box debug overlay (F2) ----------
// Outlines what the game logic tests, over the sprites: body boxes, the sword's
// reach while it can hit, enemies and missiles.
function drawHitboxes(c) {
  const box = (x, y, w, h, col) => {
    c.strokeStyle = col; c.lineWidth = 1;
    c.strokeRect(Math.round(x * SC) + 0.5, Math.round(y * SC) + RHUD + 0.5, Math.round(w * SC) - 1, Math.round(h * SC) - 1);
  };
  if (!P.dead) {
    box(P.x + 2, P.y + 4, 12, 11, "#f2eee0");
    if (P.state === "attack" && P.attackT >= 3 && P.attackT <= 11) { const [x, y, w, h] = swordRect(); box(x, y, w, h, "#e28c5c"); }
  }
  for (const e of G.enemies) if (!e.dead) box(e.x + 2, e.y + 2, e.w || 12, e.h || 12, "#ecd688");
  for (const p of G.projectiles) if (!p.dead) box(p.x - 4, p.y - 4, 8, 8, p.hostile ? "#e28c5c" : "#abdcd6");
}

// ---------- hero ----------
function heroPoseNow() {
  const pose = { dir: P.dir, walk: -1, attack: -1, sword: Math.max(1, G.inv.sword || 1), shield: Math.max(1, Math.min(3, G.inv.shield || 1)) };
  if (P.state === "attack") {
    const t = P.attackT;
    pose.attack = t >= 12 ? 0 : t >= 9 ? 1 : t >= 5 ? 2 : 3;
  } else if (P.state === "item") pose.use = true;
  else if (P.holdT > 0) { pose.hold = true; pose.dir = DOWN; }
  else if (P.carry) { pose.hold = true; if (P.moving) pose.walk = ((P.anim / 6) | 0) & 3; }
  else if (P.pushT > 0 && P.moving) pose.push = true;
  else if (P.moving || P.rafting) pose.walk = P.rafting ? -1 : ((P.anim / 6) | 0) & 3;
  return pose;
}
function heroKey(pose) {
  return "hero|" + pose.dir + "|" + pose.walk + "|" + pose.attack + "|" + (pose.use ? "u" : "") + (pose.push ? "p" : "") + (pose.hold ? "h" : "") + "|" + pose.sword + pose.shield;
}
// A falling hero sinks below the lip of the pit (drawn clipped, never scaled).
function drawHeroFalling(c, fr, x, y) {
  const sink = (26 - P.fallT) * 1.6;
  const lip = ((P.fallTile ? P.fallTile[1] : 0) + 1) * TS * SC + RHUD - 2;
  c.save();
  c.beginPath(); c.rect(0, RHUD, RW, Math.max(0, lip - RHUD)); c.clip();
  blitFrame(c, fr, x, y + sink);
  c.restore();
}
function heroSprite(pose) { return charFrame(heroKey(pose), () => renderHero(pose)); }
// The hero at logic position (P.x, P.y); ox/oy shift the whole play area (transitions).
function drawHero2(c, ox, oy) {
  if (P.dead) return null;
  if (P.iframes > 0 && (P.iframes & 2)) return null;
  // the ladder laid over the water he is crossing, the raft under his feet
  if (P.laddering) {
    const s = getProp("ladderflat", P.dir === LEFT || P.dir === RIGHT ? 1 : 0);
    c.drawImage(s.canvas, Math.round((P.laddering.tx * TS + 8) * SC + (ox || 0) - s.ax), Math.round((P.laddering.ty * TS + 8) * SC + RHUD + (oy || 0) - s.ay));
  }
  if (P.rafting) {
    const s = getProp("raft", 0);
    c.drawImage(s.canvas, Math.round((P.x + 8) * SC + (ox || 0) - s.ax), Math.round((P.y + 13) * SC + RHUD + (oy || 0) - s.ay));
  }
  const hx = (P.x + 8) * SC + (ox || 0), hy = (P.y + 15) * SC + RHUD + (oy || 0);
  // reeled in by the hook: the chain stays taut from his hand to the ring on the post
  if (P.pull) {
    const x0 = hx, y0 = hy - 12, x1 = (P.pull.tx * TS + 8) * SC + (ox || 0), y1 = (P.pull.ty * TS + 2) * SC + RHUD + (oy || 0);
    drawHookChain(c, x0, y0, x1, y1);
    blitFrame(c, charFrame("miss|hook" + P.pull.dir, () => renderFit(hookHeadPrims(P.pull.dir), false, 48, 48, 24, 24)), x1, y1);
  }
  if (P.fallT > 0) { drawHeroFalling(c, heroSprite({ dir: P.dir, walk: -1, attack: -1, sword: 1, shield: Math.max(1, Math.min(3, G.inv.shield || 1)) }), hx, hy); return null; }
  const drawn = blitFrame(c, heroSprite(heroPoseNow()), hx, hy);
  // the treasure just won, raised over his head: its lowest pixel rests on his hands
  if (P.holdT > 0 && P.holdItem) drawHeldItem(c, P.holdItem, hx, hy);
  // a pot or rock carried overhead
  if (P.carry) { const s = getProp(P.carry, 0); c.drawImage(s.canvas, Math.round(hx - s.ax), Math.round(hy - 30 - s.ay)); }
  // the earth hammer, raised then brought down in front
  if (P.hammerT > 0 && P.state === "item") {
    const f = P.itemT > 7 ? 0 : 1;
    const hm = charFrame("hammer|" + P.dir + f, () => renderFit(hammerPrims(P.dir, f), false, 64, 64, 32, 40));
    blitFrame(c, hm, hx + DX[P.dir] * 22, hy + DY[P.dir] * 18 - 4);
  }
  return drawn;
}
