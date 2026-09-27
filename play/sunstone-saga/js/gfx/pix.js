"use strict";
// ---------- Pixel buffers, packed colours, deterministic noise ----------

const _hexU32 = new Map();
// "#rrggbb" -> packed ImageData pixel (little-endian ABGR), opaque.
function hexU32(hex) {
  let v = _hexU32.get(hex);
  if (v === undefined) {
    const n = parseInt(hex.slice(1), 16);
    v = ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | ((n >> 16) & 255)) >>> 0;
    _hexU32.set(hex, v);
  }
  return v;
}
function u32Hex(v) {
  const r = v & 255, g = (v >>> 8) & 255, b = (v >>> 16) & 255;
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

class Pix {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? 0 : this.d[y * this.w + x]; }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = c; }
  fill(x, y, w, h, c) {
    for (let yy = Math.max(0, y); yy < Math.min(this.h, y + h); yy++) {
      for (let xx = Math.max(0, x); xx < Math.min(this.w, x + w); xx++) this.d[yy * this.w + xx] = c;
    }
  }
  // Copy opaque pixels of src at (dx, dy).
  blit(src, dx, dy) {
    for (let y = 0; y < src.h; y++) {
      for (let x = 0; x < src.w; x++) {
        const c = src.d[y * src.w + x];
        if (c) this.set(dx + x, dy + y, c);
      }
    }
  }
  toCanvas() {
    const c = document.createElement("canvas");
    c.width = this.w; c.height = this.h;
    const g = c.getContext("2d");
    const id = g.createImageData(this.w, this.h);
    new Uint32Array(id.data.buffer).set(this.d);
    g.putImageData(id, 0, 0);
    return c;
  }
}

// ASCII pixel map -> Pix. legend: char -> packed colour (0/undefined = transparent)
function pixFromRows(rows, legend) {
  const h = rows.length, w = rows[0].length;
  const p = new Pix(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const c = legend[rows[y][x]];
      if (c) p.d[y * w + x] = c;
    }
  }
  return p;
}

// ---------- deterministic hash / noise (global world coordinates) ----------
function hash2(x, y, s) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
// 4x4 ordered-dither threshold in [0,1)
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function bayer4(x, y) { return (BAYER4[(y & 3) * 4 + (x & 3)] + 0.5) / 16; }
