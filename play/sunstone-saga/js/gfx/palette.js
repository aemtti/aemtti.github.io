"use strict";
// ---------- Master palette (style B, "soft 16-bit") ----------
// Every pixel the game draws must come from this palette (59 colours).
// Ramps run dark -> light. Shadows lean blue/purple, highlights lean yellow.

const STYLE_VARIANTS = {
  B: {
    key: "B", label: "Soft",
    ramps: {
      ink:     ["#221a2c"],
      white:   ["#f2eee0"],
      neutral: ["#292636", "#474255", "#6d6677", "#9a919f", "#c9c0c3"],
      skin:    ["#6b3434", "#a55a48", "#d68c68", "#f2c49c"],
      hair:    ["#3a2226", "#673a2c", "#955c38", "#c48a52"],
      // tunic leans periwinkle; water stays teal so the hero never melts into it
      cloth:   ["#22284f", "#34458a", "#5270bd", "#90a8e0"],
      green:   ["#18302e", "#244c34", "#37703e", "#58903f", "#86ae4c", "#c0cf6c"],
      earth:   ["#35262a", "#5a3c32", "#84603e", "#ae8a58", "#d2b682"],
      sand:    ["#e2d2a2", "#f0e6c2"],
      stone:   ["#302c36", "#4f4850", "#766b6b", "#a09484", "#cabfa8"],
      water:   ["#1a2a4c", "#244a74", "#387896", "#64aab8", "#abdcd6"],
      red:     ["#461a28", "#80302e", "#b85236", "#e28c5c"],
      gold:    ["#553a22", "#8e6a2a", "#c69e42", "#ecd688"],
      purple:  ["#2c1c42", "#4a326a", "#765894", "#a68ebc"],
      dstone:  ["#1c2034", "#2e3654", "#48547a", "#6e7c9e", "#a4b0c6"],
      // derived ramp (no new colours): lime plaster runs from earth into sand
      plaster: ["#84603e", "#ae8a58", "#d2b682", "#e2d2a2", "#f0e6c2"],
    },
    // 2-pixel dither bands between shading steps; coloured outline on the lit side
    shade: { dither: 0.2, contour: "step", strata: 2 },
    outline: { char: "selout", prop: "ramp" },
    tex: { tuft: 0.5, flower: 0.03, patch: 1, pebble: 0.3 },
  },
};

let STYLE = null;
const PAL_SET = new Set();
// packed colour -> the next darker step of its ramp (shadows swap colours, never blend)
const PAL_DARKER = new Map();

function useStyle(key) {
  STYLE = STYLE_VARIANTS[key || "B"] || STYLE_VARIANTS.B;
  PAL_SET.clear();
  PAL_DARKER.clear();
  for (const r in STYLE.ramps) {
    const ramp = STYLE.ramps[r];
    ramp.forEach((c, t) => {
      PAL_SET.add(c.toLowerCase());
      const k = hexU32(c);
      if (!PAL_DARKER.has(k)) PAL_DARKER.set(k, hexU32(ramp[Math.max(0, t - 1)]));
    });
  }
  // sand extends the earth ramp: its darker step is earth's lightest
  PAL_DARKER.set(hexU32(STYLE.ramps.sand[0]), hexU32(STYLE.ramps.earth[4]));
  return STYLE;
}
function darker(c) { return PAL_DARKER.get(c) || c; }

// Colour of ramp `name` at `tone` (clamped), as a packed pixel.
function pc(name, tone) {
  const r = STYLE.ramps[name];
  return hexU32(r[tone < 0 ? 0 : (tone >= r.length ? r.length - 1 : tone)]);
}
function rampLen(name) { return STYLE.ramps[name].length; }
function inkU32() { return hexU32(STYLE.ramps.ink[0]); }
