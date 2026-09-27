"use strict";
// ---------- Field music: overworld (with region layers), village, house ----------
// Composer file (notation and instruments: tools/sound_format.md). Every melody here is new for
// this game; the only quotes are the shared motifs of music_motifs.js (Hero call, Sunstone core,
// Village), written out below in the keys and octaves the arrangement needs.
//
// overworld (MUS-01, MUS-16): G major, 128 BPM, 4/4, bright and heroic.
//   Intro 2 bars (the Hero call on brass + horn, played once), then the loop:
//   A 8 (brass tune) | A2 8 (flute doubles, horn counter-melody) | B 16 (Sunstone motif on horn,
//   Mixolydian F naturals, rising fragment sequence to a bVI-bVII-I climax) | C 8 (quiet bridge in
//   E minor, flute, hat + shaker) -> back to A. 40 bars = 75 s.
//   Region layers: the game turns exactly ONE region on (it lands on the next bar line), e.g.
//     Sound.setLayer({ plains: false, forest: true, mountain: false, lake: false, desert: false, graveyard: false })
//   Always playing: brass lead, flute, strings, harp, bass, horn counter, timpani.
//   plains = drum kit | forest = no drums, oboe counter-line | mountain = march kit, 2nd horn doubles
//   the lead | lake = soft kit, celesta ripples on a long echo | desert = hand drums, guitar strums |
//   graveyard = no drums, tolling bells. At most 8 pitched channels + 1 drum channel sound at once.
// village (MUS-12): C Lydian, 88 BPM, 3/4. Intro 4 (harp) + A 8 (flute: Village motif) + A2 8
//   (fiddle counter-line) + B 8 (E minor colour, ocarina) + A3 4 (motif returns) = loop 28 bars, 57 s.
// house (MUS-12): the village piece muffled (same parts and clock, without the flute, ocarina and
//   drums, every channel low-passed near 1 kHz, small dry room). A variant, not a new song.
(function () {
  // ----- small writing helpers (only used while this file loads) -----
  const NM = ["c", "c#", "d", "e-", "e", "f", "f#", "g", "g#", "a", "b-", "b"];
  const LEN = { 16: "1", 12: "2.", 8: "2", 6: "4.", 4: "4", 3: "8.", 2: "8", 1: "16" };
  const oct = m => Math.floor(m / 12) - 1;
  // sixteenths -> length word ("2.", or "2^16" when it needs a tie)
  const L = n => { const p = []; for (const k of [16, 12, 8, 6, 4, 3, 2, 1]) while (n >= k) { p.push(LEN[k]); n -= k; } return p.join("^"); };
  const note = m => "o" + oct(m) + " " + NM[m % 12];
  // ascending MIDI notes -> "o3 { g b > d }"
  const chord = ms => {
    let o = oct(ms[0]), s = "o" + o + " {";
    for (const m of ms) { while (oct(m) > o) { s += " >"; o++; } s += " " + NM[m % 12]; }
    return s + " }";
  };
  // chart [[symbol, sixteenths], ...] -> symbol at every 16th
  const expand = chart => { const a = []; for (const [s, d] of chart) for (let k = 0; k < d; k++) a.push(s); return a; };
  // One line from a chord chart: rhythm(bar) = [[start16, len16, pick(chord) -> midi | [midi] | null,
  // marks, look]] (look = read the chord that many 16ths later, for anticipations)
  const gen = (CH, chart, bar16, rhythm, head) => {
    const at = expand(chart), out = head ? [head] : [];
    if (at.length % bar16) throw new Error("[music_field] chart is not a whole number of bars");
    for (let b = 0; b < at.length / bar16; b++) {
      for (const [p, d, pick, mk, look] of rhythm(b)) {
        const sym = at[b * bar16 + p + (look || 0)], c = CH[sym];
        if (!c) throw new Error("[music_field] no chord '" + sym + "'");
        const v = pick ? pick(c) : null;
        out.push(v == null ? "r" + L(d) : (Array.isArray(v) ? chord(v) : note(v)) + L(d) + (mk || ""));
      }
      out.push("|");
    }
    return out.join(" ");
  };
  // Held chords (strings): one chord per chart slot, joined inside a bar, re-bowed at bar lines.
  const padLine = (CH, chart, bar16, head) => {
    const out = head ? [head] : [];
    let pos = 0;
    for (let i = 0; i < chart.length; i++) {
      let [s, d] = chart[i];
      while (i + 1 < chart.length && chart[i + 1][0] === s && (pos + d) % bar16) { d += chart[i + 1][1]; i++; }
      out.push(chord(CH[s].pad) + L(d) + "_");
      pos += d;
      if (pos % bar16 === 0) out.push("|");
    }
    return out.join(" ");
  };

  // =====================================================================
  // OVERWORLD
  // =====================================================================
  // Chords: pad = strings voicing, arp = harp notes (low to high), r = root pitch class (bells).
  const OW = {
    "G": { pad: [59, 62, 67], arp: [55, 62, 67, 71], r: 7 },
    "G+": { pad: [62, 67, 71], arp: [55, 62, 71, 74], r: 7 },
    "D/F#": { pad: [57, 62, 66], arp: [54, 57, 62, 66], r: 2 },
    "Em7": { pad: [59, 62, 64, 67], arp: [52, 59, 62, 67], r: 4 },
    "C": { pad: [60, 64, 67], arp: [48, 55, 60, 64], r: 0 },
    "C'": { pad: [55, 60, 64], arp: [48, 55, 60, 64], r: 0 },
    "D": { pad: [57, 62, 66], arp: [50, 57, 62, 66], r: 2 },
    "D'": { pad: [54, 57, 62], arp: [50, 57, 62, 66], r: 2 },
    "F": { pad: [57, 60, 65], arp: [53, 60, 65, 69], r: 5 },
    "G/B": { pad: [59, 62, 67], arp: [47, 55, 62, 67], r: 7 },
    "Cm6": { pad: [60, 63, 67, 69], arp: [48, 55, 63, 69], r: 0 },
    "G/D": { pad: [59, 62, 67], arp: [50, 59, 62, 67], r: 7 },
    "E7": { pad: [59, 62, 68], arp: [52, 59, 62, 68], r: 4 },
    "Am7": { pad: [57, 60, 64, 67], arp: [45, 55, 60, 64], r: 9 },
    "D7": { pad: [57, 60, 62, 66], arp: [50, 57, 60, 66], r: 2 },
    "C/E": { pad: [60, 64, 67], arp: [52, 60, 64, 67], r: 0 },
    "Dm7": { pad: [57, 60, 65], arp: [50, 57, 60, 65], r: 2 },
    "Dsus4": { pad: [57, 62, 67], arp: [50, 57, 62, 67], r: 2 },
    "Eb": { pad: [58, 63, 67], arp: [51, 58, 63, 67], r: 3 },
    "Cadd9": { pad: [60, 62, 64, 67], arp: [48, 55, 62, 64], r: 0 },
    "B7": { pad: [57, 63, 66], arp: [47, 54, 57, 63], r: 11 },
    "Em": { pad: [59, 64, 67], arp: [52, 59, 64, 67], r: 4 },
    "Cmaj7": { pad: [59, 64, 67], arp: [48, 55, 59, 64], r: 0 },
    "B7sus4": { pad: [57, 64, 66], arp: [47, 54, 57, 64], r: 11 },
    "Em/D": { pad: [59, 64, 67], arp: [50, 59, 64, 67], r: 4 },
    "A7/C#": { pad: [57, 64, 67], arp: [49, 57, 64, 67], r: 9 },
  };
  // Harmony per section (16ths; 16 = one bar)
  const chI = [["G", 8], ["F", 8], ["C'", 8], ["D'", 8]];
  const chA1 = [["G", 16], ["D/F#", 16], ["Em7", 16], ["C", 8], ["D", 8], ["G/B", 16], ["C", 8], ["Cm6", 8]];
  const chA = chA1.concat([["G/D", 8], ["E7", 8], ["Am7", 8], ["D7", 8]]);
  const chA2 = chA1.concat([["G/D", 8], ["D7", 8], ["G", 16]]);
  const chB = [["G", 8], ["C", 8], ["F", 16], ["C/E", 8], ["F", 8], ["Dm7", 8], ["G", 8],
    ["Em7", 8], ["Am7", 8], ["Dsus4", 8], ["D", 8], ["C", 8], ["Am7", 8], ["Dsus4", 8], ["D7", 8],
    ["G", 16], ["C", 16], ["Dm7", 16], ["Eb", 16], ["F", 16], ["G+", 16], ["Cadd9", 16], ["Am7", 8], ["B7", 8]];
  const chC = [["Em", 16], ["Cmaj7", 16], ["Am7", 16], ["B7sus4", 8], ["B7", 8], ["Em", 8], ["Em/D", 8],
    ["A7/C#", 8], ["C", 8], ["G/B", 8], ["Am7", 8], ["Dsus4", 8], ["D7", 8]];
  const CHARTS = { I: chI, A: chA, A2: chA2, B: chB, C: chC };

  // --- brass lead: the tune. A opens 1-6-3-5 (a sixth leap to a long 6th, down a fourth, up a
  // third), answered by an appoggiatura E-D; bar 5 sequences the leap up a third ---
  const leadA = "v72 o4 g4 o5 e4. o4 b8 o5 d4 | o5 e4. d8 o4 a2 | o4 g4 o5 e4. o4 b8 o5 d4 | o5 e4. d8 c4 o4 a4 |" +
    " o4 b4 o5 g4. d8 f#4 | o5 e4. d8 e-4. c8 | o5 d4. o4 b8 o5 e4. d8 | o5 c4. o4 b8 a4 f#4 |";
  const leadA2 = "v82 o4 g4 o5 e4. o4 b8 o5 d4 | o5 e4. d8 o4 a4. b8 | o4 g4 o5 e4. o4 b8 o5 d4 | o5 e4. d8 c4 o4 a4 |" +
    " o4 b4 o5 g4. d8 f#4 | o5 e4. d8 e-4. c8 | o5 g4. f#8 e4. f#8 | o5 g2. r4 |";
  // B: rests while the horn sings the Sunstone, answers in F-major colour, then the rising
  // Sunstone-fragment sequence (G A|D, A B|E, C D|F, D E|G) to G5 over Eb - F - G.
  const leadB = "v92 r1 | r2 r8 o4 a8 o5 c8 f8 | o5 e4. g8 f4. o4 a8 | o5 c4. o4 a8 b2 |" +
    " r1 | r2 r8 o5 d8 e8 f#8 | o5 g4. e8 c4. e8 | o5 d2. o4 g8 a8 |" +
    " o5 d2. o4 a8 b8 | o5 e2. o4 b8 o5 c8 | o5 f2. c8 d8 | o5 g2. e-8 c8 |" +
    " o4 a4. o5 c8 f4. f#8 | o5 g1 | r1 | r1 |";
  // horn counter-melody: moves where the tune holds
  const cntA2 = "v72 o4 d2 o3 g4 b4 | o3 a2 o4 f#4 e4 | o4 e2 d4 o3 b4 | o4 c4 e4 d2 |" +
    " o3 b2 o4 d2 | o4 g2 a4 g4 | o3 b2 o4 c2 | o3 b2. g8 a8 |";
  // horn in B: Sunstone core in G (pickup G3 A3 at the end of A2), twice, then a slow line
  const cntB = "v86 o4 d4. e8 c4. o3 b8 | o3 a1 | o3 g2 a2 | o3 f2 d4 g8 a8 |" +
    " o4 d4. e8 c4. o3 b8 | o3 a1 | o4 e2 c2 | o4 d2 c2 |" +
    " o3 b1 | o4 c1 | o4 c2 o3 a2 | o3 b-1 |" +
    " o3 a2 o4 c2 | o3 b2. g8 a8 | o4 d2. r4 | o4 c2 o3 b2 |";

  const OVER = {
    lead: {
      I: "v92 o4 g4! o5 d8 c8 f2 | o5 e4 d8 c8 d2 |",        // Hero call (MOTIFS.hero core, an octave up)
      A: leadA, A2: leadA2, B: leadB,
      C: "z7 | r2 v70 o4 d8 e8 f#4 |",
    },
    flute: {
      I: "z2", A: "z8",
      A2: "k12 " + leadA2,                                    // doubles the tune an octave up
      B: "v80 z3 | r2 r4 o5 g8 a8 | o6 d4. e8 c4. o5 b8 | o5 a2 r8 o6 d8 e8 f#8 | o6 g4. e8 c4. e8 |" +
        " o6 d2. o5 g8 a8 | o6 d2. o5 a8 b8 | o6 e2. o5 b8 o6 c8 | o6 f2. c8 d8 | o6 g2. e-8 c8 |" +
        " o5 a4. o6 c8 f4. f#8 | o6 g1 | z2 |",
      // bridge tune: long notes rising from the 5th below; the leap of a sixth (E5 -> C6) is the
      // A tune's leap, now in E minor
      C: "v62 o4 b2 o5 e4. f#8 | o5 g2. f#8 e8 | o6 c2 o5 a4. g8 | o5 f#2 d#2 | o4 b2 o5 e4. f#8 | o5 g2 e4. d8 |" +
        " o4 b2 o5 c2 | o5 d2 r2 |",
    },
    counter: {
      I: "v86 o3 g4! o4 d8 c8 f2 | o4 e4 d8 c8 d2 |",       // Hero call an octave under the brass
      A: "z8", A2: cntA2, B: cntB, C: "z8",
    },
    bass: {
      I: "v84 o2 g2 f2 | o2 c2 d4 e8 f#8 |",
      // walking quarters between chord tones; every bar leads by step into the next root
      A: "v76 o2 g4 o3 d4 o2 b4 a4 | o2 f#4 a4 o3 d4 o2 f#4 | o2 e4 g4 b4 d4 | o2 c4 e4 d4 o1 a4 |" +
        " o1 b4 o2 d4 g4 o1 b4 | o2 c4 e4 c4 e-4 | o2 d4 g4 e4 g#4 | o2 a4 o3 c4 o2 d4 f#4 |",
      A2: "v84 o2 g4 o3 d4 o2 b4 a4 | o2 f#4 a8 b8 o3 d4 o2 f#4 | o2 e4 g4 b4 d4 | o2 c4 e4 d4 c#4 |" +
        " o1 b4 o2 d4 g4 o1 b4 | o2 c4 e4 c4 e-4 | o2 d4 g4 d4 f#4 | o2 g4 o3 d4 o2 b4 a4 |",
      B: "v92 o2 g4 a4 o3 c4 o2 a4 | o2 f4 o3 c4 o2 a4 f4 | o2 e4 g4 f4 a4 | o2 d4 f4 g4 d4 |" +
        " o2 e4 b4 a4 e4 | o2 d4 a4 o3 d4 o2 d4 | o2 c4 e4 o1 a4 o2 c4 | o2 d4 a4 d4 f#4 |" +
        " l8 o2 g g b o3 d o2 g g a b | o3 c c o2 g e c c d e | o2 d d a f d d c d | o2 e- e- b- g e- e- d e- |" +
        " o2 f f o3 c o2 a f f e f | o2 g4. g8 o3 d4 o2 b4 | o3 c2 o2 g2 | o2 a2 b2 |",
      C: "v70 o2 e2 b2 | o2 c2 g2 | o1 a2 o2 e2 | o1 b2 o2 f#4 d#4 | o2 e2 d2 | o2 c#2 c2 | o1 b2 a2 |" +
        " o2 d4 o1 a4 o2 d8 e8 f#4 |",
    },
    timp: {
      I: "o2 v88 g4! r4 r2 | r2 l32 v55 d d d d d d d d v70 d d d d v84 d d d d |",
      A: "o2 v70 g4 r4 r2 | z2 | r2 d4 r4 | z3 | r2 d4 d4 |",
      A2: "o2 v74 g4 r4 r2 | z2 | r2 d4 r4 | z2 | r2 l32 v60 d d d d d d d d v76 d d d d d d d d | v90 g4! r4 r2 |",
      B: "o2 v84 g4! r4 r2 | f4 r4 r2 | r1 | r2 g4 r4 | e4 r4 r2 | d4 r4 d4 r4 | r1 |" +
        " r2 l32 v66 d d d d d d d d v80 d d d d d d d d | v90 g4! r4 r2 | c4 r4 r2 | d4 r4 r2 | e-4 r4 r2 |" +
        " l16 v68 f f f f v74 f f f f v82 f f f f v90 f f f f | v96 g4! r4 r2 | v60 c4 r4 r2 | r1 |",
      C: "o2 v52 e4 r4 r2 | z3 | e4 r4 r2 | z2 | l16 v48 d d d d v56 d d d d v66 d d d d v78 d d d d |",
    },
    // --- region colours ---
    // forest: oboe. In A it takes the counter-line an octave up (the horn rests), in A2/B it
    // doubles the horn an octave up, in the bridge it plays a duet a third under the flute.
    wood: {
      I: "z2",
      A: "k12 " + cntA2.split("|").slice(0, 6).join("|") + "| o3 b2 g#2 | o4 e2 d2 |",
      A2: "k12 " + cntA2, B: "k12 " + cntB,
      C: "v64 o4 g2 b4. a8 | o4 b2. a8 g8 | o5 e2 c4. o4 b8 | o5 e2 o4 b2 | o4 g2 b4. a8 | o4 e2 g4. a8 |" +
        " o4 g2 a2 | o4 a2 r2 |",
    },
    // mountain: a second horn doubles the brass an octave down; in the bridge it echoes the
    // Hero call's shape (1 5 4 b7) across the valley
    horn2: {
      I: "v74 o3 b2 a2 | o3 g2 f#2 |",
      A: "k-12 " + leadA, A2: "k-12 " + leadA2, B: "k-12 " + leadB,
      C: "v70 o3 e4 b8 a8 o4 d2 | o3 b1 | r2 o3 e4 g4 | o3 f#2 d#2 | o3 e4 b8 a8 o4 d2 | o4 c#2 c2 |" +
        " o3 b2 a2 | r2 o3 d8 e8 f#4 |",
    },
  };

  // generated accompaniment (same chords everywhere, so nothing can disagree)
  const PAD_V = { I: 70, A: 52, A2: 62, B: 80, C: 48 };
  const HARP = {
    I: [0, 1, 2, 3], A: [0, 1, 2, 3], A2: [0, 2, 1, 3], B: [0, 1, 2, 3], C: [3, 2, 1, 0],
  };
  const HARP_UP = { I: 0, A: 0, A2: 0, B: 12, C: 12 };
  const HARP_V = { I: 76, A: 58, A2: 66, B: 80, C: 54 };
  const eighths = (idx, up) => () => [0, 1, 2, 3, 4, 5, 6, 7].map(i => [i * 2, 2, c => c.arp[idx[i % 4]] + up]);
  const toll = bars => b => bars.indexOf(b) >= 0 ? [[0, 16, c => 48 + c.r]] : [[0, 16, null]];
  const BELL = { I: [0, 1], A: [0, 2, 4, 6], A2: [0, 2, 4, 6, 7], B: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14], C: [0, 2, 4, 6] };
  const BELL_V = { I: 70, A: 62, A2: 64, B: 66, C: 56 };
  const CEL = {                                       // [16th, pick] ripples (lake)
    I: [[2, 2], [6, 3]], A: [[2, 2], [6, 3]], A2: [[2, 2], [6, 3]], B: [[0, 2], [2, 3], [4, 2], [6, 3]], C: [[2, 3]],
  };
  const CEL_V = { I: 60, A: 56, A2: 60, B: 64, C: 52 };
  const celesta = spec => () => {
    const out = [];
    for (const half of [0, 8]) {
      let pos = half;
      for (const [p, k] of spec) {
        if (half + p > pos) { out.push([pos, half + p - pos, null]); pos = half + p; }
        out.push([pos, 2, c => c.arp[k] + 12]); pos += 2;
      }
      if (pos < half + 8) out.push([pos, half + 8 - pos, null]);
    }
    return out;
  };
  // desert guitar: strums in 3+3+2; the one on the "and" of 2 already takes the chord of beat 3
  const strum = () => [[0, 6, c => c.pad], [6, 6, c => c.pad, "", 2], [12, 4, c => c.pad]];
  const GTR_V = { I: 66, A: 56, A2: 60, B: 66, C: 48 };
  for (const s in CHARTS) {
    OVER.pad = OVER.pad || {}; OVER.harp = OVER.harp || {}; OVER.bell = OVER.bell || {};
    OVER.ripple = OVER.ripple || {}; OVER.guitar = OVER.guitar || {};
    OVER.pad[s] = padLine(OW, CHARTS[s], 16, "v" + PAD_V[s]);
    OVER.harp[s] = gen(OW, CHARTS[s], 16, eighths(HARP[s], HARP_UP[s]), "v" + HARP_V[s]);
    OVER.bell[s] = gen(OW, CHARTS[s], 16, toll(BELL[s]), "v" + BELL_V[s]);
    OVER.ripple[s] = gen(OW, CHARTS[s], 16, celesta(CEL[s]), "v" + CEL_V[s]);
    OVER.guitar[s] = gen(OW, CHARTS[s], 16, strum, "v" + GTR_V[s] + " q70");
  }

  // --- drums: one kit channel per region that has drums (only one region is on at a time) ---
  const rep = (s, n) => Array(n).fill(s).join(" ");
  const KIT = {                                       // plains: light rock-march kit
    crash: "l8 {K C} H {S H} H {K H} {K H} {S H} H |",
    g: "l8 {K H} H {S H} H {K H} {K H} {S H} H |",
    g2: "l8 {K H} H {S H} H {K H} {K H} {S H} O |",
    fs: "l8 {K H} H {S H} H {K H} H l16 S S S S |",
    fb: "l8 {K H} H S l16 S S l8 T T M L |",
    end: "l8 {K C} H {S H} H l16 S S S S T T M M |",
    bg: "l16 {K H} H H H {S H} H {K H} H {K H} H H H {S H} H H H |",
    bc: "l16 {K C} H H H {S H} H {K H} H {K H} H H H {S H} H H H |",
    bf: "l16 {K H} H H H {S H} H {K H} H {S H} S S S T T M M |",
  };
  const MTN = {                                       // mountain: snare-march, toms, more crashes
    crash: "l8 {K C} H {S H} {K H} {K H} H {S H} {K H} |",
    g: "l16 {K S} S? S? S? l8 {S H} {K H} l16 {K S} S? S S l8 {S H} H |",
    fs: "l16 {K S} S? S? S? l8 {S H} {K H} l16 {K S} S S S T T M M |",
    fb: "l16 {K S} S S S T T T T M M M M L L L L |",
    end: "l8 {K C} L {S H} L l16 S S S S T T M M |",
  };
  const LAKE = {                                      // lake: soft kick, rim, shaker
    crash: "l8 {K O} Z {R Z} Z {K Z} Z {R Z} Z |",
    g: "l8 {K Z} Z {R Z} Z {K Z} Z {R Z} Z |",
    fs: "l8 {K Z} Z {R Z} Z l16 R R R R R R R R |",
    bg: "l8 {K Z} Z {S Z} Z {K Z} {K Z} {S Z} Z |",
  };
  const HAND = {                                      // desert: hand drums in 3+3+2
    g: "l8 {D Z} Z Z {E Z} Z Z {D Z} E |",
    g2: "l8 {D Z} E Z {E Z} Z Z {D Z} {E Z} |",
    f: "l16 E E D D E E D D E E D D E E E E |",
  };
  OVER.kit = {
    I: "v84 {K C}4 r4 r2 | r2 l16 v50 S S v58 S S v66 S S v76 S S |",
    A: "v66 " + [KIT.crash, KIT.g, KIT.g, KIT.fs, KIT.g, KIT.g, KIT.g, KIT.fb].join(" "),
    A2: "v78 " + [KIT.crash, KIT.g2, KIT.g2, KIT.fs, KIT.g2, KIT.g2, KIT.fs, KIT.end].join(" "),
    B: "v88 " + [KIT.bc, KIT.bg, KIT.bg, KIT.bf, KIT.bc, KIT.bg, KIT.bg, KIT.fb, KIT.bc, KIT.bg, KIT.bg, KIT.bg,
      "l16 v70 S S S S v76 S S S S v84 S S S S v92 S S S S |", "v88 " + KIT.crash,
      "v70 l8 {K H} H H H {K H} H H H |", "v62 l8 {K H} H H H l16 R R R R R R R R |"].join(" "),
    C: "v54 l8 {K H} Z H Z H Z H Z | " + rep("l8 H Z H Z H Z H Z |", 3) + " l8 {K H} Z H Z H Z H Z | l8 H Z H Z H Z H Z |" +
      " l8 {K H} Z {R H} Z {K H} Z {R H} Z | l16 v50 S S S S v60 S S S S v70 T T M M v84 L L L L |",
  };
  OVER.kit_m = {
    I: "v86 {K C}4 l8 L L M M T T | l16 v60 S S S S v66 S S S S v74 S S S S v86 S S S S |",
    A: "v70 " + [MTN.crash, MTN.g, MTN.g, MTN.fs, MTN.g, MTN.g, MTN.g, MTN.fb].join(" "),
    A2: "v80 " + [MTN.crash, MTN.g, MTN.g, MTN.fs, MTN.g, MTN.g, MTN.fs, MTN.end].join(" "),
    B: "v86 " + [MTN.crash, MTN.g, MTN.g, MTN.fs, MTN.crash, MTN.g, MTN.g, MTN.fb, MTN.crash, MTN.g, MTN.g, MTN.g,
      "l16 v70 S S S S v76 S S S S v84 S S S S v92 S S S S |", "v90 " + MTN.crash,
      "v72 l8 {K H} H {L H} H {K H} H {M H} H |", "v66 l16 {K S} S? S? S? L L L L M M M M T T T T |"].join(" "),
    C: "v58 " + rep("l8 {K H} H {L H} H {K H} H {M H} H |", 7) + " l16 v52 S S S S v62 T T T T v72 M M M M v86 L L L L |",
  };
  OVER.kit_l = {
    I: "v60 {K O}4 r4 r2 | r2 l16 v44 R R R R R R R R |",
    A: "v52 " + [LAKE.crash, LAKE.g, LAKE.g, LAKE.fs, LAKE.g, LAKE.g, LAKE.g, LAKE.fs].join(" "),
    A2: "v60 " + [LAKE.crash, LAKE.g, LAKE.g, LAKE.fs, LAKE.g, LAKE.g, LAKE.fs, LAKE.crash].join(" "),
    B: "v64 " + [LAKE.crash, LAKE.bg, LAKE.bg, LAKE.fs, LAKE.crash, LAKE.bg, LAKE.bg, LAKE.fs,
      LAKE.crash, LAKE.bg, LAKE.bg, LAKE.bg, "l16 v50 R R R R v56 R R R R v62 S S S S v70 S S S S |", "v66 " + LAKE.crash,
      "v54 " + LAKE.g, "v50 " + LAKE.fs].join(" "),
    C: "v48 " + rep("l8 Z Z Z Z Z Z Z Z |", 7) + " l16 v44 R R R R R R R R v54 T T M M L L L L |",
  };
  OVER.hand = {
    I: "v76 l8 {D Z} r8 r4 r2 | " + HAND.f,
    A: "v62 " + [HAND.g, HAND.g, HAND.g, HAND.f, HAND.g, HAND.g, HAND.g2, HAND.f].join(" "),
    A2: "v72 " + [HAND.g, HAND.g2, HAND.g, HAND.f, HAND.g, HAND.g2, HAND.g, HAND.f].join(" "),
    B: "v78 " + [HAND.g2, HAND.g, HAND.g2, HAND.f, HAND.g2, HAND.g, HAND.g2, HAND.f,
      HAND.g2, HAND.g2, HAND.g2, HAND.g2, "l16 v70 D D D D v76 E E E E v84 D D D D v90 E E E E |", HAND.g2,
      "v64 " + HAND.g, "v58 " + HAND.f].join(" "),
    C: "v56 l8 {D Z} Z Z Z Z Z Z Z | " + rep("l8 Z Z Z Z Z Z Z Z |", 3) + " l8 {D Z} Z Z Z Z Z Z Z | " +
      rep("l8 Z Z Z Z Z Z Z Z |", 2) + " " + HAND.f,
  };

  const owParts = {};
  for (const s in CHARTS) { owParts[s] = {}; for (const ch in OVER) if (OVER[ch][s] != null) owParts[s][ch] = OVER[ch][s]; }

  SONG.add("overworld", {
    bpm: 128, meter: "4/4", key: "G",
    echo: { len: "8", fb: 0.28, mix: 0.28, lp: 2800, hp: 300 },    // 234 ms, darker repeats
    verb: { sec: 1.2, mix: 0.22, lp: 6000 },                         // open air
    gain: -0.5,
    layers: { plains: true, forest: false, mountain: false, lake: false, desert: false, graveyard: false },
    chans: [
      { name: "lead", inst: "brass", pan: 0.05, vol: 0.72, echo: 0.22, verb: 0.25, vib: true },
      { name: "flute", inst: "flute", pan: 0.3, vol: 0.42, echo: 0.2, verb: 0.3, vib: true },
      { name: "pad", inst: "strings", pan: -0.3, vol: 0.46, verb: 0.35 },
      { name: "harp", inst: "harp", pan: 0.45, vol: 0.5, echo: 0.3, verb: 0.3 },
      { name: "bass", inst: "pickbass", pan: 0, vol: 0.74, verb: 0.08 },
      { name: "counter", inst: "horn", pan: -0.45, vol: 0.62, echo: 0.1, verb: 0.3, vib: true },
      { name: "timp", inst: "timpani", pan: -0.15, vol: 0.62, verb: 0.3 },
      { name: "kit", inst: "kit", layer: "plains", pan: 0, vol: 0.6, verb: 0.12 },
      { name: "wood", inst: "oboe", layer: "forest", pan: 0.35, vol: 0.46, echo: 0.2, verb: 0.35, vib: true },
      { name: "horn2", inst: "horn", layer: "mountain", pan: -0.2, vol: 0.5, echo: 0.1, verb: 0.35, vib: true },
      { name: "kit_m", inst: "kit", layer: "mountain", pan: 0, vol: 0.6, verb: 0.2 },
      { name: "ripple", inst: "celesta", layer: "lake", pan: 0.55, vol: 0.34, echo: 0.6, verb: 0.45 },
      { name: "kit_l", inst: "kit", layer: "lake", pan: 0.1, vol: 0.52, verb: 0.2 },
      { name: "guitar", inst: "guitar", layer: "desert", pan: -0.5, vol: 0.4, echo: 0.1, verb: 0.25 },
      { name: "hand", inst: "kit", layer: "desert", pan: 0.15, vol: 0.56, verb: 0.15 },
      { name: "bell", inst: "bells", layer: "graveyard", pan: -0.25, vol: 0.4, echo: 0.15, verb: 0.5 },
    ],
    parts: owParts,
    intro: ["I"],
    loop: ["A", "A2", "B", "C"],
  });

  // =====================================================================
  // VILLAGE and HOUSE
  // =====================================================================
  // Chords for 3/4: pad = strings, arp = six harp 8ths per bar, gtr = guitar off-beat chord.
  const VL = {
    "C": { pad: [60, 64, 67], arp: [48, 55, 64, 67, 72, 67], gtr: [55, 60, 64] },
    "D/C": { pad: [62, 66, 69], arp: [48, 57, 62, 66, 69, 66], gtr: [57, 62, 66] },
    "Em7": { pad: [59, 62, 67], arp: [52, 59, 62, 67, 71, 67], gtr: [55, 59, 62] },
    "Am7": { pad: [57, 60, 64, 67], arp: [45, 52, 60, 64, 67, 64], gtr: [55, 60, 64] },
    "D": { pad: [57, 62, 66], arp: [50, 57, 62, 66, 69, 66], gtr: [57, 62, 66] },
    "Cmaj7": { pad: [59, 64, 67], arp: [48, 55, 59, 64, 67, 64], gtr: [55, 59, 64] },
    "D/F#": { pad: [57, 62, 66], arp: [54, 57, 62, 66, 69, 66], gtr: [57, 62, 66] },
    "Cmaj9": { pad: [59, 62, 64, 67], arp: [48, 55, 62, 64, 71, 64], gtr: [59, 62, 64] },
    "Cadd9": { pad: [60, 62, 64, 67], arp: [48, 55, 62, 64, 67, 64], gtr: [55, 62, 64] },
    "Bm7": { pad: [57, 62, 66], arp: [47, 54, 57, 62, 66, 62], gtr: [57, 62, 66] },
  };
  const bars = list => list.map(s => [s, 12]);
  const VCH = {
    I: bars(["C", "D/C", "C", "D/C"]),
    A: bars(["C", "D/C", "C", "Em7", "D/C", "C", "Am7", "D"]),                    // "home" chords + tag
    A2: [["Cmaj7", 8], ["Em7", 4]].concat(bars(["D/F#", "C", "Cmaj9", "D", "Cadd9", "Cmaj7", "D"])),  // "travel"
    B: bars(["Em7", "Cmaj7", "Am7", "Bm7", "Em7", "Cmaj7", "Am7", "D"]),
    A3: bars(["C", "D/C", "C", "D/C"]),
  };
  const VIL = {
    // flute: the Village motif (MOTIFS.village complete, home key) + a 2-bar tag; varied in A2
    melody: {
      I: "z4",
      A: "v72 o5 g4 e8 f#8 e4 | o5 d4 a2 | o5 g2. | o6 e4 c8 d8 o5 b4 | o5 a4 f#4 d4 | o5 c2. | o5 e4 g4 a4 | o5 f#2 a4 |",
      A2: "v70 o5 g4 e8 f#8 e4 | o5 d4 a2 | o5 g2 a8 b8 | o6 e4 c8 d8 o5 b4 | o5 a4 f#4 d4 | o5 c2 e4 | o5 g4. f#8 e4 | o5 f#2. |",
      B: "z8",
      A3: "v68 o5 g4 e8 f#8 e4 | o5 d4 a2 | o5 g2. | r4 o5 f#4 a4 |",
    },
    // ocarina: the B tune (E minor colour, same notes as C Lydian), two dotted quarters per bar
    // (a hemiola against the 3/4 accompaniment) in bars 1-2 and 5-6
    ocarina: {
      I: "z4", A: "z8", A2: "z8", A3: "z4",
      B: "v70 o5 e4. g4. | o5 b4. o6 d4. | o6 c2 o5 b8 a8 | o5 f#2. | o5 g4. b4. | o6 e4. d4. |" +
        " o6 c4 o5 a4 b4 | o5 f#2. |",
    },
    // fiddle (strings, a single line): counter-melody, moves where the tune holds. Bars 1-3 climb
    // E G | F# A | C (bar 3 goes UP a third, never back down to E: F#-A-E in this rhythm was
    // another game's lullaby cell); C5 also keeps it off the flute's held G5 octave. Bar 7 holds
    // B while the flute moves (E-G-E-D-C there was a July overworld figure).
    fiddle: {
      I: "z4", A: "z8",
      A2: "v58 o4 e2 g4 | o4 f#2 a4 | o5 c2. | o4 b2 g4 | o4 a2 f#4 | o4 e2 g4 | o4 b2. | o4 a2. |",
      B: "v60 o4 b4 a4 g4 | o4 e2. | o4 a4 g4 e4 | o4 a2. | o4 b2 g4 | o5 c4 o4 b4 g4 | o4 e4 g4 a4 | o4 d2 e4 |",
      A3: "v56 o4 e2 g4 | o4 f#2 a4 | o5 c2. | o4 a2 f#4 |",
    },
    // bass: pizzicato oom (beat 1) and a lighter note on beat 3; in B re-plucked softly on every beat (r1 S6: the bowed whole bars read as a stuck pizzicato)
    bass: {
      I: "v66 o3 c4 r4 o2 g4 | o3 c4 r4 o2 a4 | o3 c4 r4 o2 g4 | o3 c4 r4 o2 a4 |",
      A: "v68 o3 c4 r4 o2 g4 | o3 c4 r4 o2 a4 | o3 c4 r4 o2 g4 | o2 e4 r4 b4 | o3 c4 r4 o2 a4 | o3 c4 r4 o2 g4 |" +
        " o2 a4 r4 e4 | o3 d4 r4 o2 a4 |",
      A2: "v68 o3 c4 r4 o2 e4 | o2 f#4 r4 a4 | o3 c4 r4 o2 g4 | o3 c4 r4 o2 b4 | o3 d4 r4 o2 a4 | o3 c4 r4 o2 g4 |" +
        " o3 c4 r4 o2 g4 | o3 d4 r4 o2 f#4 |",
      B: "v58 o2 e4 v46 e4 e4 | v58 o3 c4 v46 c4 c4 | v58 o2 a4 v46 a4 a4 | v58 o2 b4 v46 b4 b4 | v58 o2 e4 v46 e4 e4 | v58 o3 c4 v46 c4 c4 | v58 o2 a4 v46 a4 a4 | v58 o3 d4 v46 d4 d4 |",
      A3: "v66 o3 c4 r4 o2 g4 | o3 c4 r4 o2 a4 | o3 c4 r4 o2 g4 | o3 c4 r4 o2 a4 |",
    },
    // light percussion: soft hand drum on 1, shaker, jingles as a tambourine
    perc: {
      I: "z4",
      A: "v46 [l8 {D Z} Z J Z J Z |]7 l16 D Z Z Z E Z Z Z E Z E E |",
      A2: "v48 [l8 {D Z} Z J {E Z} J Z |]7 l16 D Z Z Z E Z E Z E E D D |",
      B: "v40 [l8 {D Z} Z Z Z Z Z |]7 l8 {D Z} Z Z Z E E |",
      A3: "v46 [l8 {D Z} Z J Z J Z |]3 l16 D Z Z Z E Z E Z E E E E |",
    },
  };
  const VPAD_V = { I: 40, A: 40, A2: 48, B: 54, A3: 46 };
  const VHARP_V = { I: 62, A: 58, A2: 60, B: 56, A3: 60 };
  const VHARP = { I: [0, 1, 2, 3, 4, 5], A: [0, 1, 2, 3, 4, 5], A2: [0, 2, 1, 3, 4, 3], B: [0, 1, 2, 3, 4, 5], A3: [0, 1, 2, 3, 4, 5] };
  const oomPah = () => [[0, 4, null], [4, 4, c => c.gtr, "'"], [8, 4, c => c.gtr, "'"]];
  VIL.pad = {}; VIL.harp = {}; VIL.guitar = {};
  for (const s in VCH) {
    VIL.pad[s] = padLine(VL, VCH[s], 12, "v" + VPAD_V[s]);
    VIL.harp[s] = gen(VL, VCH[s], 12, () => VHARP[s].map((k, i) => [i * 2, 2, c => c.arp[k]]), "v" + VHARP_V[s]);
    VIL.guitar[s] = s === "I" || s === "B" ? "z" + VCH[s].length : gen(VL, VCH[s], 12, oomPah, "v52");
  }
  const vParts = {};
  for (const s in VCH) { vParts[s] = {}; for (const ch in VIL) vParts[s][ch] = VIL[ch][s]; }

  const VCHANS = [
    { name: "melody", inst: "flute", pan: 0.1, vol: 0.62, echo: 0.2, verb: 0.3, vib: true },
    { name: "ocarina", inst: "ocarina", pan: 0.2, vol: 0.62, echo: 0.2, verb: 0.3, vib: true },
    { name: "fiddle", inst: "strings", pan: 0.4, vol: 0.5, verb: 0.3, vib: true },
    { name: "pad", inst: "strings", pan: -0.25, vol: 0.4, verb: 0.35 },
    { name: "harp", inst: "harp", pan: -0.4, vol: 0.56, echo: 0.2, verb: 0.35 },
    { name: "guitar", inst: "guitar", pan: 0.35, vol: 0.42, verb: 0.2 },
    { name: "bass", inst: "pizz", pan: -0.05, vol: 0.72, verb: 0.15 },
    { name: "perc", inst: "kit", pan: 0.15, vol: 0.5, verb: 0.2 },
  ];
  SONG.add("village", {
    bpm: 88, meter: "3/4", key: "C lydian",
    echo: { len: "8", fb: 0.22, mix: 0.2, lp: 3200 },
    verb: { sec: 1.5, mix: 0.26, lp: 6500 },
    gain: 3.9,
    chans: VCHANS,
    parts: vParts,
    intro: ["I"],
    loop: ["A", "A2", "B", "A3"],
  });

  // house: the same parts without the tune channels and drums, low-passed (per-note filter near
  // 1 kHz, a little brighter on louder notes), a small room and no echo.
  const HOUSE = ["fiddle", "pad", "harp", "guitar", "bass"];
  const hParts = {};
  const HPAD_V = { I: 48, A: 54, A2: 54, B: 52, A3: 52 };        // the pad carries more without the tune
  for (const s in vParts) {
    hParts[s] = {};
    for (const ch of HOUSE) hParts[s][ch] = vParts[s][ch];
    hParts[s].pad = vParts[s].pad.replace(/^v\d+/, "v" + HPAD_V[s]);
  }
  SONG.add("house", {
    bpm: 88, meter: "3/4", key: "C lydian",
    echo: false,
    verb: { sec: 0.7, mix: 0.18, lp: 3000, pre: 0.008 },
    gain: 5.6,
    chans: VCHANS.filter(c => HOUSE.indexOf(c.name) >= 0).map(c => Object.assign({}, c, { lp: [800, 0.6], echo: 0 })),
    parts: hParts,
    intro: ["I"],
    loop: ["A", "A2", "B", "A3"],
  });
})();
