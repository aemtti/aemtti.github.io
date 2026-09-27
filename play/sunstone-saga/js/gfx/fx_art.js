"use strict";
// ---------- 2D effect art: flames (emissive, no outline) ----------
// Four frames, 10 x 16: a white core at the foot, gold inside, red outside. The foot stays
// put while the tip sways and a spark or two breaks away, rises and goes out. Torches,
// braziers and the gatehouse bowls pick their frame with an offset of their own, so no two
// flames in a room ever flicker together.
const FLAME_DEFS = [
  [
    "..........",
    ".......s..",
    "...r......",
    "...rr.....",
    "...ror....",
    "..rroor...",
    "..rooor...",
    ".rrooyor..",
    ".rooyyorr.",
    ".rooyyyor.",
    ".royywyyor",
    ".roywwwyor",
    ".roywwwyor",
    "..roywyor.",
    "..rooyoor.",
    "...rrrrr..",
  ],
  [
    "........s.",
    "..r.......",
    "..rr......",
    "..ror.....",
    "..roor....",
    ".rrooor...",
    ".rooyor...",
    ".rooyyorr.",
    ".rooyyyor.",
    ".royyyyor.",
    ".royywyyor",
    ".roywwyyor",
    ".roywwwyor",
    "..roywyor.",
    "..rooyoor.",
    "...rrrrr..",
  ],
  [
    "..........",
    "..........",
    ".s...r....",
    "....rr....",
    "....ror...",
    "...roorr..",
    "..rrooor..",
    "..rooyoor.",
    ".rrooyyor.",
    ".rooyyyor.",
    ".royywyyor",
    ".roywwwyor",
    ".roywwwyor",
    "..roywyor.",
    "..rooyoor.",
    "...rrrrr..",
  ],
  [
    ".s........",
    "......r...",
    "......rr..",
    ".....ror..",
    "....roor..",
    "...rooorr.",
    "..rrooyor.",
    "..rooyyor.",
    ".rrooyyor.",
    ".rooyyyor.",
    ".royyyyyor",
    ".roywwyyor",
    ".roywwwyor",
    "..roywyor.",
    "..rooyoor.",
    "...rrrrr..",
  ],
];
// A torch catching fire: a spark in the cup, then a small flame, then the full one.
const FLAME_IGNITE_DEFS = [
  [
    "....y.....",
    "...ywy....",
    "....y.....",
    "..........",
  ],
  [
    "....r.....",
    "...ror....",
    "...roor...",
    "..rooyor..",
    "..royyor..",
    "..roywor..",
    "...rrrr...",
  ],
];
const FLAMES = [], FLAME_IGNITE = [];
function buildFlames() {
  FLAMES.length = 0;
  FLAME_IGNITE.length = 0;
  const lg = { r: pc("red", 2), o: pc("red", 3), y: pc("gold", 3), w: pc("white", 0), s: pc("gold", 3) };
  for (const rows of FLAME_DEFS) FLAMES.push(pixFromRows(rows, lg).toCanvas());
  // (bottom-aligned in the same 10 x 16 box as the full flame)
  for (const rows of FLAME_IGNITE_DEFS) FLAME_IGNITE.push(pixFromRows(Array(16 - rows.length).fill("..........").concat(rows), lg).toCanvas());
}

// ---------- the wall torch's iron bracket (north face), head-on ----------
// A wall plate with two rivets, an arm rising from it and an iron cup; the unlit torch keeps
// a charred stub in its cup. Built with the door kit's elevation camera (1 unit = 1 px).
// TORCH_BRACKET = { lit: {canvas, pix}, unlit: {canvas, pix}, ax, ay }: (ax, ay) is the foot of
// the plate's centre line; the cup's top (the flame's foot) is 13 px above it.
let TORCH_BRACKET = null;
function buildTorchBracket() {
  const iron = DoorKit.mat("neutral", true), B = DoorKit.block;
  const build = (unlit) => {
    const P = [
      B(-3, 3, 0, 10, 1, 1, iron, 1, 1),
      P_cyl([0, 1, 2], [0, 1.9, 2], 0.8, iron, { part: 2, grp: 2, tone: 3 }),
      P_cyl([0, 1, 8], [0, 1.9, 8], 0.8, iron, { part: 2, grp: 2, tone: 3 }),
      P_cyl([0, 1.5, 4], [0, 4, 9.5], 1, iron, { part: 3, grp: 3, tone: 2 }),
      P_frustum([0, 4, 9], [0, 4, 13], 2.4, 4.4, iron, { part: 4, grp: 4, tone: 2 }),
      P_cyl([-4.6, 4, 12.6], [4.6, 4, 12.6], 0.6, iron, { part: 5, grp: 4, tone: 3 }),
    ];
    if (unlit) P.push(P_cyl([0, 4, 12], [0, 4, 16.2], 1.5, DoorKit.mat("hair"), { part: 6, grp: 6, tone: 0 }));
    const r = render3D(DoorKit.snapTones(xformPrims(P, DoorKit.ELEV)), 14, 22, 7, 19, { outline: "prop" });
    if (unlit) {
      // a dim ember left in the charred stub
      const d = r.pix.d;
      for (let y = 0; y < 22; y++) { const i = y * 14 + 7; if (d[i] && d[i] !== inkU32()) { d[i + 14] = pc("red", 1); break; } }
    }
    return { canvas: r.pix.toCanvas(), pix: r.pix };
  };
  TORCH_BRACKET = { lit: build(false), unlit: build(true), ax: 7, ay: 19 };
}
