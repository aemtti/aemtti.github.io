"use strict";
// ---------- HUD at native resolution (512 x 128) ----------
const HUD2_H = 128;

function hx(name, tone) { const r = STYLE.ramps[name]; return r[Math.max(0, Math.min(r.length - 1, tone || 0))]; }

// Bevelled panel frame, palette colours only.
function drawPanel(ctx, x, y, w, h, fill) {
  ctx.fillStyle = hx("neutral", 1); ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill || hx("ink"); ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = hx("neutral", 3); ctx.fillRect(x, y, w - 1, 1); ctx.fillRect(x, y, 1, h - 1);
  ctx.fillStyle = hx("neutral", 0); ctx.fillRect(x + 1, y + h - 1, w - 1, 1); ctx.fillRect(x + w - 1, y + 1, 1, h - 1);
}

// ---------- missing art ----------
// A thing with no picture shows as a loud box (ink, a white rim, a red cross; palette
// colours only) and is named once in the console, so it is seen at once; it never falls
// back to an old 8-bit sprite. (x, y) is its top-left in screen px, `size` its side.
const MISSING_TOLD = {};
function drawMissing(ctx, x, y, kind, size) {
  const s = size || 32;
  x = Math.round(x); y = Math.round(y);
  ctx.fillStyle = hx("white"); ctx.fillRect(x, y, s, s);
  ctx.fillStyle = hx("ink"); ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
  ctx.fillStyle = hx("red", 3);
  for (let i = 4; i < s - 5; i++) { ctx.fillRect(x + i, y + i, 2, 2); ctx.fillRect(x + s - 2 - i, y + i, 2, 2); }
  if (!MISSING_TOLD[kind]) { MISSING_TOLD[kind] = true; console.warn("no picture for '" + kind + "'"); }
}
// The same box on a thing's 16 px tile in the play area, given in logic px. (It undoes
// whatever scale the caller set: the old 2x fallbacks still call it through drawEnemy,
// drawPickup and drawProjectiles.)
function drawMissingAt(ctx, lx, ly, kind) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawMissing(ctx, lx * SC, ly * SC + RHUD, kind);
  ctx.restore();
}

const MINI_BIOME = { P: ["green", 3], F: ["green", 1], M: ["earth", 2], D: ["sand", 0], G: ["neutral", 2], L: ["water", 2] };

// s: { area, sx, sy, biome(sx,sy) -> letter, rooms: [{x,y,seen,here}], gems, keys, bombs, aModel, bModel, hp, maxhp, frame, place }
function drawHUD2(ctx, s) {
  ctx.fillStyle = hx("ink"); ctx.fillRect(0, 0, 512, HUD2_H);
  ctx.fillStyle = hx("neutral", 1); ctx.fillRect(0, HUD2_H - 2, 512, 1);
  ctx.fillStyle = hx("neutral", 0); ctx.fillRect(0, HUD2_H - 1, 512, 1);
  // (the contents sit a little lower, so the margins above and below them match)
  ctx.save(); ctx.translate(0, 9);

  // --- minimap ---
  const mx = 16, my = 20, cw = 7, ch = 6;
  drawPanel(ctx, mx - 4, my - 4, 16 * cw + 8, 8 * ch + 8);
  if (s.area === "ow") {
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 16; x++) {
        const b = MINI_BIOME[s.biome(x, y)] || MINI_BIOME.P;
        ctx.fillStyle = hx(b[0], b[1]);
        ctx.fillRect(mx + x * cw, my + y * ch, cw - 1, ch - 1);
      }
    }
    const on = (s.frame >> 4) & 1;
    ctx.fillStyle = on ? hx("white") : hx("gold", 3);
    const px = mx + s.sx * cw, py = my + s.sy * ch;
    ctx.fillRect(px - 1, py - 1, cw + 1, 1); ctx.fillRect(px - 1, py + ch - 1, cw + 1, 1);
    ctx.fillRect(px - 1, py - 1, 1, ch + 1); ctx.fillRect(px + cw - 1, py - 1, 1, ch + 1);
  } else {
    // the dungeon's rooms, centred in the frame
    const xs = s.rooms.map(r => r.x), ys = s.rooms.map(r => r.y);
    const x0 = Math.min(...xs), y0 = Math.min(...ys);
    const ox = mx + Math.round((16 * cw - (Math.max(...xs) - x0 + 1) * 14) / 2) - x0 * 14;
    const oy = my + Math.round((8 * ch - (Math.max(...ys) - y0 + 1) * 9) / 2) - y0 * 9;
    for (const r of s.rooms) {
      if (!r.seen && !r.mapped) continue;
      ctx.fillStyle = r.seen ? hx("neutral", 3) : hx("neutral", 1);
      ctx.fillRect(ox + 1 + r.x * 14, oy + 1 + r.y * 9, 12, 7);
      if (r.shard && ((s.frame >> 4) & 1)) { ctx.fillStyle = hx("red", 3); ctx.fillRect(ox + 8 + r.x * 14, oy + 3 + r.y * 9, 3, 3); }
      if (r.isHere) {
        // the room you are in: a gold rim always, its middle blinking
        const rx0 = ox + r.x * 14, ry0 = oy + r.y * 9;
        ctx.fillStyle = hx("gold", 3);
        ctx.fillRect(rx0, ry0, 14, 1); ctx.fillRect(rx0, ry0 + 8, 14, 1); ctx.fillRect(rx0, ry0, 1, 9); ctx.fillRect(rx0 + 13, ry0, 1, 9);
        if (r.here) ctx.fillRect(rx0 + 5, ry0 + 3, 4, 3);
      }
    }
  }
  if (s.place) drawText2(ctx, s.place, mx - 2, my + 8 * ch + 12, hx("neutral", 3));

  // --- counters ---
  const cx = 150;
  const rowsY = [18, 48, 78];
  // (the counters' icons are the treasures themselves, small; one without a model shows
  // the missing-art box, not the old flat icon)
  const icons = [["gem1", s.gems, 3], ["key", s.keys, 2], ["bomb", s.bombs, 2]];
  icons.forEach(([model, n, pad], k) => {
    const f = itemImgBig(model, model === "key" ? 0.9 : 1.1), y = rowsY[k];
    if (f) ctx.drawImage(f.canvas, cx + Math.round((14 - f.canvas.width) / 2), y + Math.round((14 - f.canvas.height) / 2));
    else drawMissing(ctx, cx, y, model, 14);
    drawText2(ctx, "*" + String(n).padStart(pad, "0"), cx + 20, y + 3, hx("white"));
  });

  // --- the two item boxes, named for their keys: Z the sword (left), X the item (right)
  // (played by touch: A and B, the on-screen buttons) ---
  const boxes = [[keyWord("a"), 238, s.aModel], [keyWord("b"), 292, s.bModel]];
  for (const [label, bx, model] of boxes) {
    drawText2C(ctx, label, bx + 22, 12, hx("water", 3));
    drawPanel(ctx, bx, 26, 44, 60);
    const f = model && itemImgBig(model, 1.5);
    if (f) ctx.drawImage(f.canvas, bx + Math.round((44 - f.canvas.width) / 2), 26 + Math.round((60 - f.canvas.height) / 2));
    else if (model) drawMissing(ctx, bx + 6, 40, model);
  }

  // --- hearts: a framed box like the item boxes, named the same way above it (rows of
  // eight from the top; twenty hearts fill three rows) ---
  const hbx = 358, hbw = 142;
  drawText2C(ctx, "HEARTS", hbx + hbw / 2, 12, hx("water", 3));
  drawPanel(ctx, hbx, 26, hbw, 60);
  const hearts = Math.floor(s.maxhp / 2);
  for (let i = 0; i < hearts; i++) {
    const hpx = hbx + 8 + (i % 8) * 16, hpy = 34 + Math.floor(i / 8) * 16;
    const left = s.hp - i * 2;
    ctx.drawImage(left >= 2 ? ICONS.heart : left === 1 ? ICONS.heartHalf : ICONS.heartEmpty, hpx, hpy);
  }
  ctx.restore();
}
