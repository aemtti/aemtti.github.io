// textures.js — every texture in the game is drawn with canvas2d at load time.
import * as THREE from 'three';

const cache = new Map();

function mk(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return c;
}

/** blobby multi-octave noise using canvas blur */
function fbm(g, size, octaves = 4, alpha = 0.22, hue = '0,0,0') {
  for (let o = 0; o < octaves; o++) {
    const cells = 4 << o;
    const step = size / cells;
    g.save();
    g.filter = `blur(${Math.max(0.4, step * 0.35)}px)`;
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const v = Math.random();
        g.fillStyle = `rgba(${hue},${(alpha / (o + 1)) * v})`;
        g.fillRect(x * step, y * step, step + 1, step + 1);
      }
    }
    g.restore();
  }
}

function grain(g, size, amount = 16) {
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * amount;
    d[i] += n; d[i + 1] += n; d[i + 2] += n;
  }
  g.putImageData(img, 0, 0);
}

function tex(canvas, repeat = 1, aniso = 8) {
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = aniso;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

// ------------------------------------------------------------ generators
function sandFloor(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#c9ab77'; g.fillRect(0, 0, size, size);
  fbm(g, size, 5, 0.30, '90,70,40');
  fbm(g, size, 3, 0.20, '235,215,170');
  // scattered pebbles
  for (let i = 0; i < 220; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = Math.random() * 2.2 + 0.6;
    g.fillStyle = `rgba(${90 + Math.random() * 60},${75 + Math.random() * 50},${50 + Math.random() * 40},.5)`;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  // faint flagstone seams
  g.strokeStyle = 'rgba(70,55,32,.20)'; g.lineWidth = 2;
  for (let i = 1; i < 4; i++) {
    g.beginPath(); g.moveTo(0, (size / 4) * i + (Math.random() * 6 - 3)); g.lineTo(size, (size / 4) * i + (Math.random() * 6 - 3)); g.stroke();
    g.beginPath(); g.moveTo((size / 4) * i + (Math.random() * 6 - 3), 0); g.lineTo((size / 4) * i + (Math.random() * 6 - 3), size); g.stroke();
  }
  grain(c.getContext('2d'), size, 20);
  return c;
}

function sandWall(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#c2a273'; g.fillRect(0, 0, size, size);
  fbm(g, size, 4, 0.26, '95,75,45');
  // big sandstone blocks, 4 rows with alternating offset
  const rows = 4, h = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / 6);
    for (let x = -1; x < 3; x++) {
      const bx = off + x * (size / 2.5), by = r * h;
      const bw = size / 2.5, bh = h;
      g.fillStyle = `rgba(${205 + Math.random() * 22},${178 + Math.random() * 20},${132 + Math.random() * 18},.30)`;
      g.fillRect(bx + 2, by + 2, bw - 4, bh - 4);
      g.strokeStyle = 'rgba(78,60,34,.55)'; g.lineWidth = 2.5;
      g.strokeRect(bx + 1.5, by + 1.5, bw - 3, bh - 3);
      g.strokeStyle = 'rgba(255,240,205,.13)'; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(bx + 3, by + bh - 3); g.lineTo(bx + 3, by + 3); g.lineTo(bx + bw - 3, by + 3); g.stroke();
    }
  }
  fbm(g, size, 2, 0.14, '60,45,25');
  grain(c.getContext('2d'), size, 16);
  return c;
}

function concrete(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#8f8d86'; g.fillRect(0, 0, size, size);
  fbm(g, size, 5, 0.24, '40,40,44');
  fbm(g, size, 3, 0.16, '220,220,215');
  // cracks — kept faint, they tile every 128u and get obvious fast
  g.strokeStyle = 'rgba(45,45,48,.20)';
  for (let i = 0; i < 5; i++) {
    g.lineWidth = Math.random() * 0.9 + 0.3;
    let x = Math.random() * size, y = Math.random() * size;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 7; s++) { x += (Math.random() - 0.5) * 42; y += (Math.random() - 0.5) * 42; g.lineTo(x, y); }
    g.stroke();
  }
  // form-panel seams
  g.strokeStyle = 'rgba(60,60,64,.35)'; g.lineWidth = 2;
  g.strokeRect(1, 1, size - 2, size - 2);
  grain(c.getContext('2d'), size, 18);
  return c;
}

function plaster(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#cdb891';
  g.fillRect(0, 0, size, size);
  fbm(g, size, 5, 0.16, '120,100,68');
  fbm(g, size, 3, 0.12, '245,232,205');
  // trowel streaks
  for (let i = 0; i < 90; i++) {
    g.save();
    g.filter = 'blur(2px)';
    g.strokeStyle = `rgba(${Math.random() < 0.5 ? '150,128,92' : '235,222,196'},.10)`;
    g.lineWidth = 3 + Math.random() * 9;
    const x = Math.random() * size, y = Math.random() * size;
    const a = Math.random() * Math.PI;
    const l = 20 + Math.random() * 70;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
    g.restore();
  }
  // small chips where the render has come away
  for (let i = 0; i < 7; i++) {
    const x = Math.random() * size, y = Math.random() * size;
    const w = 5 + Math.random() * 13, h = 4 + Math.random() * 10;
    g.beginPath();
    for (let a = 0; a < 8; a++) {
      const an = (a / 8) * Math.PI * 2;
      const px = x + Math.cos(an) * w * (0.6 + Math.random() * 0.4);
      const py = y + Math.sin(an) * h * (0.6 + Math.random() * 0.4);
      a ? g.lineTo(px, py) : g.moveTo(px, py);
    }
    g.closePath();
    g.fillStyle = 'rgba(150,120,92,.5)';
    g.fill();
  }
  // hairline cracks
  g.strokeStyle = 'rgba(120,100,76,.30)';
  for (let i = 0; i < 5; i++) {
    g.lineWidth = Math.random() * 1.1 + 0.3;
    let x = Math.random() * size, y = Math.random() * size;
    g.beginPath(); g.moveTo(x, y);
    for (let s = 0; s < 6; s++) { x += (Math.random() - 0.5) * 46; y += (Math.random() - 0.5) * 46; g.lineTo(x, y); }
    g.stroke();
  }
  // base stain
  const gr = g.createLinearGradient(0, size * 0.72, 0, size);
  gr.addColorStop(0, 'rgba(110,92,66,0)');
  gr.addColorStop(1, 'rgba(110,92,66,.22)');
  g.fillStyle = gr; g.fillRect(0, size * 0.72, size, size * 0.28);
  grain(c.getContext('2d'), size, 12);
  return c;
}

function crateWood(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#a9763f'; g.fillRect(0, 0, size, size);
  // planks
  const planks = 5, ph = size / planks;
  for (let i = 0; i < planks; i++) {
    g.fillStyle = `rgba(${150 + Math.random() * 45},${105 + Math.random() * 35},${52 + Math.random() * 25},1)`;
    g.fillRect(0, i * ph, size, ph - 1.5);
    // grain lines
    g.strokeStyle = 'rgba(90,55,25,.30)';
    for (let k = 0; k < 6; k++) {
      g.lineWidth = Math.random() * 1.2 + 0.3;
      const y = i * ph + Math.random() * ph;
      g.beginPath(); g.moveTo(0, y);
      for (let x = 0; x <= size; x += 16) g.lineTo(x, y + Math.sin(x * 0.06 + i) * 1.6);
      g.stroke();
    }
    g.fillStyle = 'rgba(40,24,10,.5)'; g.fillRect(0, i * ph + ph - 2.5, size, 2.5);
  }
  // frame
  g.strokeStyle = 'rgba(120,80,38,.95)'; g.lineWidth = 9;
  g.strokeRect(4.5, 4.5, size - 9, size - 9);
  g.strokeStyle = 'rgba(60,36,16,.5)'; g.lineWidth = 2;
  g.strokeRect(9, 9, size - 18, size - 18);
  // stencil
  g.save(); g.translate(size / 2, size / 2); g.rotate(-0.06);
  g.strokeStyle = 'rgba(50,32,14,.42)'; g.lineWidth = 4;
  g.strokeRect(-size * 0.19, -size * 0.19, size * 0.38, size * 0.38);
  g.beginPath(); g.moveTo(-size * 0.1, size * 0.06); g.lineTo(0, -size * 0.1); g.lineTo(size * 0.1, size * 0.06); g.stroke();
  g.restore();
  grain(c.getContext('2d'), size, 12);
  return c;
}

function metal(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#6b7076'; g.fillRect(0, 0, size, size);
  // brushed streaks
  for (let i = 0; i < 300; i++) {
    g.strokeStyle = `rgba(${Math.random() > 0.5 ? 255 : 20},${Math.random() > 0.5 ? 255 : 20},255,.035)`;
    g.lineWidth = Math.random() * 2;
    const y = Math.random() * size;
    g.beginPath(); g.moveTo(0, y); g.lineTo(size, y + (Math.random() - 0.5) * 4); g.stroke();
  }
  // panel + rivets
  g.strokeStyle = 'rgba(30,34,38,.8)'; g.lineWidth = 4;
  g.strokeRect(2, 2, size - 4, size - 4);
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      if (i !== 0 && i !== 3 && k !== 0 && k !== 3) continue;
      const x = 14 + i * ((size - 28) / 3), y = 14 + k * ((size - 28) / 3);
      const gr = g.createRadialGradient(x - 1, y - 1, 0, x, y, 4.5);
      gr.addColorStop(0, '#b9c0c6'); gr.addColorStop(1, '#4a5057');
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, 4.5, 0, 7); g.fill();
    }
  }
  fbm(g, size, 3, 0.12, '90,60,30');   // rust tint
  grain(c.getContext('2d'), size, 12);
  return c;
}

function brick(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#8d6a55'; g.fillRect(0, 0, size, size);
  const rows = 8, h = size / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * (size / 8);
    for (let x = -1; x < 5; x++) {
      const bx = off + x * (size / 4), by = r * h;
      const v = Math.random();
      g.fillStyle = `rgb(${Math.round(134 + v * 46)},${Math.round(74 + v * 32)},${Math.round(56 + v * 26)})`;
      g.fillRect(bx + 1.5, by + 1.5, size / 4 - 3, h - 3);
    }
  }
  fbm(g, size, 4, 0.18, '60,40,26');
  grain(c.getContext('2d'), size, 14);
  return c;
}

function tile(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#b8b2a4'; g.fillRect(0, 0, size, size);
  const n = 4, s = size / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    // one random per tile, applied to every channel — independent channels
    // would give the floor a pastel-confetti look
    const v = Math.random() * 26;
    g.fillStyle = `rgb(${Math.round(178 + v)},${Math.round(172 + v * 0.94)},${Math.round(158 + v * 0.86)})`;
    g.fillRect(x * s + 2, y * s + 2, s - 4, s - 4);
    g.strokeStyle = 'rgba(255,255,255,.16)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x * s + 3, y * s + s - 3); g.lineTo(x * s + 3, y * s + 3); g.lineTo(x * s + s - 3, y * s + 3); g.stroke();
  }
  fbm(g, size, 3, 0.14, '70,66,58');
  grain(c.getContext('2d'), size, 10);
  return c;
}

function gravel(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#7d6f5c'; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size, y = Math.random() * size, r = Math.random() * 3.4 + 0.8;
    const v = 70 + Math.random() * 90;
    g.fillStyle = `rgba(${v + 20},${v + 6},${v - 12},.75)`;
    g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  }
  fbm(g, size, 3, 0.2, '30,26,20');
  grain(c.getContext('2d'), size, 16);
  return c;
}

function doorTex(size) {
  const c = mk(size), g = c.getContext('2d');
  g.fillStyle = '#6d4f30'; g.fillRect(0, 0, size, size);
  g.fillStyle = '#7d5c39'; g.fillRect(size * 0.08, size * 0.06, size * 0.84, size * 0.88);
  g.strokeStyle = 'rgba(40,26,12,.7)'; g.lineWidth = 5;
  g.strokeRect(size * 0.16, size * 0.14, size * 0.68, size * 0.32);
  g.strokeRect(size * 0.16, size * 0.54, size * 0.68, size * 0.32);
  for (let i = 0; i < 60; i++) {
    g.strokeStyle = 'rgba(45,28,14,.16)'; g.lineWidth = Math.random() * 1.5;
    const x = Math.random() * size;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + (Math.random() - 0.5) * 8, size); g.stroke();
  }
  grain(c.getContext('2d'), size, 12);
  return c;
}

// ------------------------------------------------------------ decals / sprites
function bulletDecal() {
  const s = 64, c = mk(s), g = c.getContext('2d');
  g.clearRect(0, 0, s, s);
  const cx = s / 2, cy = s / 2;
  const gr = g.createRadialGradient(cx, cy, 1, cx, cy, s * 0.42);
  gr.addColorStop(0, 'rgba(8,8,8,1)');
  gr.addColorStop(0.28, 'rgba(20,18,16,.92)');
  gr.addColorStop(0.55, 'rgba(90,82,70,.42)');
  gr.addColorStop(1, 'rgba(120,110,95,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, s * 0.46, 0, 7); g.fill();
  g.fillStyle = 'rgba(0,0,0,.96)';
  g.beginPath();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2, r = 6 + Math.random() * 3.4;
    i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.closePath(); g.fill();
  // radial cracks
  g.strokeStyle = 'rgba(30,28,24,.5)';
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2;
    g.lineWidth = Math.random() * 1.5 + 0.4;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7);
    g.lineTo(cx + Math.cos(a) * (12 + Math.random() * 12), cy + Math.sin(a) * (12 + Math.random() * 12));
    g.stroke();
  }
  return c;
}

function bloodDecal() {
  const s = 64, c = mk(s), g = c.getContext('2d');
  g.clearRect(0, 0, s, s);
  const cx = s / 2, cy = s / 2;
  g.fillStyle = 'rgba(112,10,10,.86)';
  g.beginPath();
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, r = s * (0.16 + Math.random() * 0.2);
    i ? g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r) : g.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.closePath(); g.fill();
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2, d = s * (0.2 + Math.random() * 0.28);
    g.fillStyle = `rgba(${90 + Math.random() * 40},6,6,${0.4 + Math.random() * 0.5})`;
    g.beginPath(); g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, Math.random() * 3.6 + 0.7, 0, 7); g.fill();
  }
  return c;
}

function softDot(color = '255,255,255', power = 2.2) {
  const s = 64, c = mk(s), g = c.getContext('2d');
  const img = g.createImageData(s, s), d = img.data;
  const [r, gg, b] = color.split(',').map(Number);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = (x - s / 2) / (s / 2), dy = (y - s / 2) / (s / 2);
    const v = Math.max(0, 1 - Math.hypot(dx, dy));
    const i = (y * s + x) * 4;
    d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = Math.pow(v, power) * 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function smokePuff() {
  const s = 128, c = mk(s), g = c.getContext('2d');
  const img = g.createImageData(s, s), d = img.data;
  // lumpy alpha
  const lumps = [];
  for (let i = 0; i < 9; i++) lumps.push({ x: Math.random(), y: Math.random(), r: 0.18 + Math.random() * 0.3 });
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const u = x / s, v = y / s;
    let a = 0;
    for (const l of lumps) a = Math.max(a, Math.max(0, 1 - Math.hypot(u - l.x, v - l.y) / l.r));
    const edge = Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) / 0.5);
    const i = (y * s + x) * 4;
    const tint = 214 + Math.random() * 16;
    d[i] = tint; d[i + 1] = tint - 2; d[i + 2] = tint - 6;
    d[i + 3] = Math.pow(a * edge, 1.5) * 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

function muzzleFlash() {
  const s = 128, c = mk(s), g = c.getContext('2d');
  g.clearRect(0, 0, s, s);
  const cx = s / 2, cy = s / 2;
  const gr = g.createRadialGradient(cx, cy, 0, cx, cy, s * 0.3);
  gr.addColorStop(0, 'rgba(255,255,240,1)');
  gr.addColorStop(0.35, 'rgba(255,214,110,.85)');
  gr.addColorStop(1, 'rgba(255,150,30,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, s * 0.3, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,232,170,.85)';
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2, len = s * (0.16 + Math.random() * 0.3), w = 3 + Math.random() * 6;
    g.save(); g.translate(cx, cy); g.rotate(a);
    g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(len, 0); g.lineTo(0, w / 2); g.closePath(); g.fill();
    g.restore();
  }
  return c;
}

function skyCanvas() {
  const w = 512, h = 256;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0.00, '#2f6fae');
  gr.addColorStop(0.34, '#75a8cf');
  gr.addColorStop(0.55, '#c3cfd4');
  gr.addColorStop(0.72, '#e5d7b6');
  gr.addColorStop(1.00, '#d9c49a');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  // soft clouds
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * w, y = Math.random() * h * 0.55, r = 16 + Math.random() * 60;
    g.save(); g.filter = 'blur(12px)';
    g.fillStyle = `rgba(255,255,255,${0.06 + Math.random() * 0.14})`;
    g.beginPath(); g.ellipse(x, y, r * 1.8, r * 0.55, 0, 0, 7); g.fill();
    g.restore();
  }
  // sun glow
  const sg = g.createRadialGradient(w * 0.26, h * 0.19, 0, w * 0.26, h * 0.19, 90);
  sg.addColorStop(0, 'rgba(255,250,225,.95)');
  sg.addColorStop(0.25, 'rgba(255,236,180,.45)');
  sg.addColorStop(1, 'rgba(255,225,160,0)');
  g.fillStyle = sg; g.fillRect(0, 0, w, h);
  return c;
}

// ------------------------------------------------------------ public API
const BUILDERS = {
  sand: () => sandFloor(256),
  sandwall: () => sandWall(256),
  concrete: () => concrete(256),
  plaster: () => plaster(256),
  crate: () => crateWood(256),
  metal: () => metal(256),
  brick: () => brick(256),
  tile: () => tile(256),
  gravel: () => gravel(256),
  door: () => doorTex(256),
};

/** world material texture, tiled every `unitsPerTile` game units */
export function worldTex(name, unitsPerTile = 128, faceSize = 128) {
  const key = `${name}|${unitsPerTile}|${faceSize}`;
  if (cache.has(key)) return cache.get(key);
  const base = BUILDERS[name] ? BUILDERS[name]() : BUILDERS.concrete();
  const t = tex(base, 1);
  cache.set(key, t);
  return t;
}

/** raw canvas-backed texture, no tiling */
export function sprite(name) {
  if (cache.has('spr:' + name)) return cache.get('spr:' + name);
  let c;
  switch (name) {
    case 'bullet': c = bulletDecal(); break;
    case 'blood': c = bloodDecal(); break;
    case 'smoke': c = smokePuff(); break;
    case 'flash': c = muzzleFlash(); break;
    case 'dot': c = softDot('255,255,255', 2.2); break;
    case 'spark': c = softDot('255,220,140', 1.4); break;
    case 'shadow': c = softDot('0,0,0', 1.1); break;
    case 'fire': c = softDot('255,150,40', 1.6); break;
    default: c = softDot(); break;
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  cache.set('spr:' + name, t);
  return t;
}

export function skyTexture() {
  if (cache.has('sky')) return cache.get('sky');
  const t = new THREE.CanvasTexture(skyCanvas());
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.needsUpdate = true;
  cache.set('sky', t);
  return t;
}
