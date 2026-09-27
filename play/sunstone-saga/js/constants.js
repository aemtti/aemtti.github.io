"use strict";
// ---------- Global constants ----------
// Game logic runs on a 16 px grid; the screen draws it at 2x: 512 x 480, a 128 px HUD
// band over a 512 x 352 play area (RW, RH, RHUD, SC in gfx/scene.js).
const TS = 16;                     // logic tile size (drawn 32 px)
const COLS = 16, ROWS = 11;        // play-area tiles (256 x 176 logic px)
const PW = COLS * TS, PH = ROWS * TS;

const UP = 0, DOWN = 1, LEFT = 2, RIGHT = 3;
const DX = [0, 0, -1, 1];
const DY = [-1, 1, 0, 0];
const OPP = [DOWN, UP, RIGHT, LEFT];

const SAVE_VERSION = 2;
const SHARDS_NEEDED = 6;        // shards of the Sunstone that break the keep's seal
const GAME_TITLE = "SHARDS OF THE SUNSTONE";

// ---------- The keys' names on screen ----------
// Every line that names a key reads it here. Played by touch (touch.js), the same lines name
// the on-screen buttons instead: A, B, MENU, SAVE. (The title's line of controls and the
// tale's are in gfx/screens2.js, in both wordings.)
const KEY_WORDS = {
  keys: { a: "Z", b: "X", push: "PUSH ENTER", skip: "ENTER - SKIP",
    pick: "PRESS Z TO SET ONE ON X", saveLine: "S - SAVE QUEST TO FILE      ENTER - BACK" },
  touch: { a: "A", b: "B", push: "TAP THE SCREEN", skip: "TAP - SKIP",
    pick: "TAP ONE TO SET IT ON B", saveLine: "SAVE - SAVE QUEST TO FILE    MENU - BACK" },
};
let keyWords = KEY_WORDS.keys;
function keyWord(n) { return keyWords[n]; }

// ---------- Small helpers ----------
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
function dist2(x1, y1, x2, y2) { const dx = x1 - x2, dy = y1 - y2; return dx * dx + dy * dy; }
function sgn(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }

// Deterministic PRNG (mulberry32)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function rngInt(rng, n) { return Math.floor(rng() * n); }
function rngChoice(rng, arr) { return arr[rngInt(rng, arr.length)]; }

// Direction from a source point toward a target point (dominant axis)
function dirToward(sx, sy, tx, ty) {
  const dx = tx - sx, dy = ty - sy;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? LEFT : RIGHT;
  return dy < 0 ? UP : DOWN;
}
