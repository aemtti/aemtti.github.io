"use strict";
// ---------- Dungeon music: dungeons 1-3, the Shadow Keep, caves and shops ----------
// Tracks: dungeon_water (d1 Tidal Hollow), dungeon_root (d2 Root Warren), dungeon_grave
// (d3 Barrow Deep), dungeon (= dungeon_water until the dungeon data names its own track),
// finale (d7 Shadow Keep), cave (ambience, no tune), shop (the shopkeeper's little loop).
// The three dungeon tracks share ONE skeleton (bass line + chord plan, E minor, 32-bar loop)
// and one theme; each arrangement recolours it with its own mode (water E dorian, root E
// aeolian, grave E phrygian), tempo, instruments, percussion and its own breakdown section.
// In the shared text "X" is the 6th degree (C# dorian, C otherwise) and "Y" the 2nd degree
// (F# dorian/aeolian, F phrygian); colour() swaps them in before the text reaches SONG.
// Everything here is newly written for this game (see review/_audio/refs/dungeon.md).
(function () {
  // ---------- small text helpers (MIDI numbers -> the engine's notation) ----------
  const NM = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  const LEN16 = { 16: "1", 12: "2.", 8: "2", 6: "4.", 4: "4", 3: "8.", 2: "8", 1: "16" };
  const pieces = n => { const out = []; for (const p of [16, 12, 8, 6, 4, 3, 2, 1]) while (n >= p) { out.push(p); n -= p; } return out; };
  const rest = n => pieces(n).map(p => "r" + LEN16[p]).join(" ");
  const oct = m => Math.floor(m / 12) - 1;
  const note = (m, l16, mark) => "o" + oct(m) + " " + NM[m % 12] + LEN16[l16] + (mark || "");
  // chord token: "o3 {g b > e}2" (lowest note sets the octave, ">" climbs inside the braces)
  const chord = (ms, l16, mark) => {
    const s = ms.slice().sort((a, b) => a - b), base = oct(s[0]), t = [];
    let cur = base;
    for (const m of s) { while (cur < oct(m)) { t.push(">"); cur++; } t.push(NM[m % 12]); }
    return "o" + base + " {" + t.join(" ") + "}" + LEN16[l16] + (mark || "");
  };
  const NOTE_RE = /^([a-g])([#b-]?)(\d)$/;
  const midi = s => { const m = NOTE_RE.exec(s); if (!m) throw new Error("[music_dungeon] bad note " + s);
    return 12 * (+m[3] + 1) + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]] + (m[2] === "#" ? 1 : m[2] ? -1 : 0); };
  // Mode colour: X = 6th degree, Y = 2nd degree of E (see the header).
  const COL = { dorian: { X: "c#", Y: "f#" }, minor: { X: "c", Y: "f#" }, phrygian: { X: "c", Y: "f" } };
  const colour = (text, mode) => text.replace(/[XY]/g, k => COL[mode][k]);
  const cols = (part, mode, drums) => { const o = {}; for (const k in part) o[k] = drums && drums.indexOf(k) >= 0 ? part[k] : colour(part[k], mode); return o; };
  // Seeded random numbers (the same drips every run and every render).
  const rng = seed => { let s = seed >>> 0; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; };
  // One bar of single hits from [pos16, midi, vel] (each hit lasts until the next one, max 2 16ths).
  const hitsBar = (hits, bar16, len) => {
    hits = hits.slice().sort((a, b) => a[0] - b[0]);
    const out = []; let pos = 0;
    hits.forEach((h, i) => {
      if (h[0] > pos) out.push(rest(h[0] - pos));
      const next = i + 1 < hits.length ? hits[i + 1][0] : bar16, l = Math.min(len || 2, next - h[0]);
      out.push("v" + h[2] + " " + note(h[1], l, "'"));
      pos = h[0] + l;
    });
    if (pos < bar16) out.push(rest(bar16 - pos));
    return out.join(" ") + " |";
  };

  // ============================================================
  // The dungeon skeleton (E minor): chord slots, voicings per mode, progressions, bass, theme
  // ============================================================
  // slot -> [bass note, pad voicing]; X/Y are coloured per mode. "X" in dorian is A/C# (the
  // dorian IV in first inversion) instead of a diminished chord on C#.
  const SLOT = {
    i: ["e2", "g3 b3 e4"], iM7: ["d#2", "g3 b3 e4"], i7: ["d2", "g3 b3 e4"],
    X: ["X2", "g3 c4 e4"], IV: ["a2", "g3 X4 e4"], VII: ["d2", "Y3 a3 d4"], VII7: ["d2", "Y3 a3 X4"],
    III: ["g2", "g3 b3 d4"], IIIM7: ["g2", "Y3 b3 d4"], Y: ["Y2", "a3 X4 e4"],
    V: ["b1", "a3 d#4 f#4"], Vsus: ["b1", "a3 e4 f#4"], v: ["b1", "a3 d4 Y4"],
    dim: ["e2", "g3 a#3 c#4"], Fr6: ["c2", "e3 f#3 a#3"],            // grave breakdown (Shadow harmony)
  };
  const slot = (name, mode) => {
    const pedal = /\/E$/.test(name), key = name.replace("/E", "");
    let s = SLOT[key];
    if (key === "X" && mode === "dorian") s = ["c#2", "a3 c#4 e4"];
    if (key === "Y" && mode === "phrygian") s = ["f2", "a3 c4 d4"];      // bII as F6 (no E against the F)
    const bass = midi(colour(pedal ? "e2" : s[0], mode)), pad = colour(s[1], mode).split(" ").map(midi);
    return { bass, pad };
  };
  // Progressions: [slot, beats] (4/4).
  const PROG = {
    I: [["i", 4], ["i", 4]],
    A: [["i", 4], ["iM7", 4], ["i7", 4], ["X", 4], ["IV", 4], ["VII", 4], ["III", 2], ["X", 2], ["Y", 2], ["V", 2]],
    A2: [["i", 4], ["iM7", 4], ["i7", 4], ["X", 4], ["IV", 4], ["VII7", 4], ["IIIM7", 4], ["X", 2], ["V", 2]],
    B: [["X", 4], ["VII", 4], ["v", 4], ["i", 4], ["X", 4], ["IV", 4], ["Y", 4], ["Vsus", 2], ["V", 2]],
    C: [["i", 4], ["X/E", 4], ["VII/E", 4], ["i", 4], ["Y/E", 4], ["i", 4], ["IV/E", 4], ["V", 4]],
    CG: [["i", 4], ["dim", 4], ["Fr6", 4], ["V", 4], ["i", 4], ["dim", 4], ["Fr6", 4], ["V", 4]],
  };
  // Sustained chords from a progression. o: {up: semitones, top: keep the n highest notes,
  // bass: add the bass note, mark, lens: split every chord into this many 16ths}.
  const pad = (prog, mode, o) => {
    o = o || {};
    const out = []; let beat = 0;
    for (const [nm, beats] of prog) {
      const c = slot(nm, mode);
      let ms = c.pad.map(m => m + (o.up || 0));
      if (o.top) ms = ms.slice(-o.top);
      if (o.bass) ms = [c.bass + (o.bassUp || 0)].concat(ms);
      if (o.floor) ms = ms.map(m => { while (m < o.floor) m += 12; return m; });
      ms = ms.filter((m, i) => ms.indexOf(m) === i);
      const each = o.lens || beats * 4;
      for (let k = 0; k < beats * 4; k += each) out.push(chord(ms, Math.min(each, beats * 4 - k), o.mark));
      beat += beats;
      if (beat % 4 === 0) out.push("|");
    }
    return out.join(" ");
  };
  // Broken chords in 8ths: tones = [bass+12, pad..., pad[0]+12] (+ o.up); p4 / p2 = tone
  // indexes for a 4-beat / 2-beat chord (-1 = rest); acc = 8th positions to accent.
  const arp = (prog, mode, p4, p2, o) => {
    o = o || {};
    const out = []; let n8 = 0;
    for (const [nm, beats] of prog) {
      const c = slot(nm, mode), T = [c.bass + 12].concat(c.pad, [c.pad[0] + 12]).map(m => m + (o.up || 0));
      const pat = beats === 4 ? p4 : beats === 2 ? p2 : p2.slice(0, beats * 2);
      for (const ix of pat) {
        const mark = (o.acc || []).indexOf(n8 % 8) >= 0 ? "!" : (o.ghost || []).indexOf(n8 % 8) >= 0 ? "?" : "";
        out.push(ix < 0 ? "r8" : note(T[ix], 2, (o.stac ? "'" : "") + mark));
        n8++;
        if (n8 % 8 === 0) out.push("|");
      }
    }
    return out.join(" ");
  };
  // Water drips / sparkles: chord tones high up at irregular off-beat 16ths.
  const drips = (prog, mode, seed, per, o) => {
    o = o || {};
    const R = rng(seed), bars = [];
    let beat = 0, hits = [];
    for (const [nm, beats] of prog) {
      const c = slot(nm, mode);
      const n = per[Math.floor(R() * per.length)];
      for (let k = 0; k < n * beats / 4; k++) {
        let pos, tries = 0;
        do { pos = (beat % 4) * 4 + Math.floor(R() * beats * 4); tries++; } while (tries < 50 && (pos % 8 === 0 || hits.some(h => Math.abs(h[0] - pos) < 3)));
        if (tries >= 50) continue;
        let m = c.pad[Math.floor(R() * c.pad.length)] + (R() < 0.5 ? 24 : 36) + (o.up || 0);
        while (m > (o.max || 100)) m -= 12;
        hits.push([pos, m, Math.round((o.v0 || 34) + R() * (o.dv || 22))]);
      }
      beat += beats;
      if (beat % 4 === 0) { bars.push(hitsBar(hits, 16, o.len)); hits = []; }
    }
    return bars.join(" ");
  };

  // ---- the shared bass line (placeholders; octave 2) ----
  const BASS = {
    A: "o2 e4. e8 b4 e4 | d#4. d#8 b4 d#4 | d4. d8 a4 d4 | X4. X8 e4 g4 | a4. a8 e4 X4 | d4. d8 a4 Y4 | g4. d8 X4. e8 | Y4. Y8 b4 < b4 |",
    A2: "o2 e4. e8 b4 e4 | d#4. d#8 b4 d#4 | d4. d8 a4 d4 | X4. X8 e4 g4 | a4. a8 e4 X4 | d4. d8 a4 Y4 | g4. g8 d4 < b4 > | X4. X8 b4 < b4 |",
    B: "o2 X4. X8 e4 a4 | d4. d8 Y4 a4 | b4. b8 a4 Y4 | e4. e8 b4 d4 | X4. X8 e4 g4 | a4. a8 e4 g4 | Y4. Y8 a4 X4 | b4. b8 f#4 d#4 |",
  };
  // ---- the dungeon theme (placeholders; lead register E5-E6) ----
  // Bar 1 turns back after the leap (B G A F#, not a scale run down from B): the run matched
  // the opening notes of a carol, and in A2 its climb back up the shape of a folk song.
  const MEL = {
    A: "o5 r8 e8 b4. g8 a8 Y8 | g2. b4 | r8 d8 a4. b8 g4 | e2. e8 Y8 | g4. a8 e8 g8 b4 | a4. Y8 d2 | b4 > e4 X4. d8 | < a4 Y8 g8 d#2 |",
    A2: "o5 r8 e8 b4. g8 a8 Y8 | g4. a8 b4 Y4 | r8 d8 a4. b8 > d8 < b8 | e2 r8 g8 b8 > e8 < | > X4. < b8 a4 e4 | Y4. g8 a2 | > d4. < b8 Y4 b4 | > X4. < a8 b4 > d#4 |",
    B: "o6 e2. d8 X8 | d2 < Y4 a4 | b2. a8 b8 | g2 e2 | a4. b8 > X2 | X4 < b8 a8 e2 | a4. g8 Y4 e4 | e2 d#2 |",
  };

  // ============================================================
  // dungeon_water: Tidal Hollow. E dorian, 92 BPM. Marimba current, drips, flutes.
  // ============================================================
  (function () {
    const M = "dorian";
    const P4 = [0, 2, 4, 1, 3, 4, 3, 2], P2 = [0, 2, 4, 3];          // 3+3+2 rolling figure
    const P4B = [0, 1, 2, 3, 4, 3, 2, 1], P2B = [0, 2, 4, 2];        // up-and-down in B
    const P4C = [0, -1, 4, -1, -1, 3, -1, -1], P2C = [0, -1, 3, -1];  // thinned out in C
    const ACC = { acc: [0, 3, 6], ghost: [1, 4, 7] };
    const parts = {
      I: {
        marimba: "v58 " + arp(PROG.I, M, P4, P2, ACC),
        drip: drips(PROG.I, M, 11, [2, 3], { v0: 30 }),
        sub: "o1 e1& | e2. r4 |",
        drums: "v42 l8 Z Z? Z? Z Z? Z? Z Z? | Z Z? Z? Z l16 Z? Z? Z Z D? D? E? E? |",
      },
      A: {
        lead: "v70 " + MEL.A,
        marimba: "v54 " + arp(PROG.A, M, P4, P2, ACC),
        drip: drips(PROG.A, M, 21, [1, 1, 2]),
        pad: "z4 | v38 " + pad(PROG.A.slice(4), M),
        bass: "v62 " + BASS.A,
        drums: "v42 [l8 {K Z}! Z? Z? Z Z? Z? Z Z? | l8 Z Z? Z? Z Z? Z? Z Z? |]3 l8 {K Z}! Z? Z? Z Z? Z? Z Z? | l8 Z Z? Z? Z l16 E? E? D D E D D D |",
      },
      A2: {
        lead: "v76 " + MEL.A2,
        alto: "v66 o4 b2 g2 | g2. f#4 | a2 b2 | > X2 < a2 | e2 g2 | Y2 a4 > X4 < | > d2 < Y2 | e2 f#2 |",
        marimba: "v60 " + arp(PROG.A2, M, P4, P2, ACC),
        drip: drips(PROG.A2, M, 31, [0, 1, 1]),
        pad: "v46 " + pad(PROG.A2, M),
        bass: "v74 " + BASS.A2,
        drums: "v56 [l8 {K Z}! Z? Z? {R Z} Z? Z? {K Z} Z? | l8 Z Z? Z? {R Z} Z? Z? Z {R Z}? |]3 l8 {K Z}! Z? Z? {R Z} Z? Z? {K Z} Z? | l8 {K Z} Z? Z? {R Z} l16 T? T M M L L L L |",
      },
      B: {
        lead: "v90 " + MEL.B,
        alto: "v78 o5 X2. e4 | Y2 d2 | d2. Y4 | e2 < b2 | > e2. < a4 | a2 > X4 < b4 | > X2 < a2 | a2 b2 |",
        marimba: "v78 " + arp(PROG.B, M, P4B, P2B, ACC),
        drip: drips(PROG.B, M, 41, [0, 1]),
        pad: "v64 " + pad(PROG.B, M, { bass: true, bassUp: 12 }),
        bass: "v84 " + BASS.B,
        sub: "v90 o1 X1 | d1 | b1 | e1 | X1 | a1 | Y1 | b1 |",
        drums: "v66 l16 {K Z C}! Z Z? Z Z? Z {R Z} Z? Z? Z {K Z} Z? {R Z} Z Z? Z | " +
          "[l16 {K Z}! Z Z? Z Z? Z {R Z} Z? {K Z}? Z {K Z} Z? {R Z} Z Z? Z | l16 {K Z}! Z Z? Z Z? Z {R Z} Z? Z? Z {K Z} Z? {R Z} Z Z? Z |]3 " +
          "l16 {K Z} Z Z? Z {R Z} Z Z? Z l8 T M L {K L} |",
      },
      C: {
        lead: "v64 o5 r8 e8 b4. r4. | r8 e8 a4. r4. | r8 d8 a4. r4. | r8 b8 g4. r4. | r8 Y8 > X4. < r4. | r8 e8 b4. g8 a8 Y8 | g2. r4 | r2 a8 g8 d#4 |",
        alto: "z4 | v60 o4 a1 | g2 e2 | e2 X2 | f#2 d#2 |",
        marimba: "v50 " + arp(PROG.C, M, P4C, P2C, { ghost: [5] }),
        drip: drips(PROG.C, M, 51, [2, 3, 3, 4], { v0: 36, dv: 26 }),
        pad: "v40 " + pad(PROG.C, M),
        bass: "v58 o2 e1 | e2. e4 | e1 | e2 r4 < b4 > | e1 | e2. e4 | e2 r4 e4 | b4. b8 f#4 < b4 |",
        sub: "v70 o1 e1& | e1& | e1& | e1 | e1& | e1& | e1 | b1 |",
        drums: "v44 [E4? r8 D8? r4 r8 E16? E16? | D4? r4 r8 E8? r4 |]3 E4? r8 D8? r4 r8 E16? E16? | l16 D? D E? E D D E E T? T? M M L L L L |",
      },
    };
    SONG.add("dungeon_water", {
      bpm: 92, meter: "4/4", key: "E dorian", gain: 2.4,
      echo: { len: "16", fb: 0.46, lp: 2600, hp: 300, mix: 0.34 },     // 163 ms (the chip echo stops at 240)
      verb: { sec: 2.2, mix: 0.3, lp: 5000, pre: 0.02 },
      chans: [
        { name: "lead", inst: "flute", pan: 0.08, vol: 0.72, echo: 0.28, verb: 0.3, oct: 5, vib: true },
        { name: "alto", inst: "altoflute", pan: -0.38, vol: 0.62, echo: 0.15, verb: 0.35, vib: true },
        { name: "marimba", inst: "marimba", pan: 0.36, vol: 0.52, echo: 0.2, verb: 0.25 },
        { name: "drip", inst: "celesta", pan: -0.62, vol: 0.46, echo: 0.75, verb: 0.45 },
        { name: "pad", inst: "strings", pan: -0.12, vol: 0.4, verb: 0.45, q: 100 },
        { name: "bass", inst: "pickbass", pan: 0.02, vol: 0.72, oct: 2, verb: 0.08 },
        { name: "sub", inst: "sub", pan: 0, vol: 0.45, verb: 0, q: 100 },
        { name: "drums", inst: "kit", pan: 0, vol: 0.5, verb: 0.15 },
      ],
      parts: { I: cols(parts.I, M, ["drums"]), A: cols(parts.A, M, ["drums"]), A2: cols(parts.A2, M, ["drums"]), B: cols(parts.B, M, ["drums"]), C: cols(parts.C, M, ["drums"]) },
      intro: ["I"],
      loop: ["A", "A2", "B", "C"],
    });
  })();

  // ============================================================
  // dungeon_root: Root Warren. E aeolian, 96 BPM. Reed lead, pizzicato, hand drums, cello drone.
  // ============================================================
  (function () {
    const M = "minor";
    // pizzicato "digging" figure: root, 5th/3rd, rests on the offbeats of the 3+3+2
    const P4 = [0, 2, -1, 1, 3, -1, 2, 1], P2 = [0, 2, 1, 3];
    const P4B = [0, 2, 3, 1, 2, 3, 4, 2], P2B = [0, 3, 2, 1];
    const parts = {
      I: {
        cello: "v52 o2 {e b}1 | {e b}1 |",
        pizz: "v62 " + arp(PROG.I, M, P4, P2, { stac: true, acc: [0] }),
        wood: "v60 o3 e8' r8 r4 r8 e8' r4 | e8' r8 r4 r8 e8' b8' e8' |",
        drums: "v50 l8 D r16 D16? E r D D? r16 E16? R | l16 D D? E D? {D Z} Z? E Z? L L M M T T M L |",
      },
      A: {
        lead: "v70 " + MEL.A,
        pizz: "v56 " + arp(PROG.A, M, P4, P2, { stac: true, acc: [0, 3] }),
        cello: "v44 " + pad(PROG.A, M, { up: -12, top: 2, bass: true, floor: 36 }),
        bass: "v66 " + BASS.A,
        wood: "v52 [o3 e8' r8 r4 r8 e8' r4 |]2 o3 d8' r8 r4 r8 d8' r4 | c8' r8 r4 r8 c8' r4 | o2 a8' r8 r4 r8 a8' r4 | o3 d8' r8 r4 r8 d8' r4 | g8' r8 r8 d8' c8' r8 r8 e8' | f#8' r8 r8 f#8' o2 b8' r8 b8' r8 |",
        drums: "v50 [l8 D r16 D16? E r D D? r16 E16? R | l8 D r16 D16? E r D r E? {R E}? |]3 l8 D r16 D16? E r D D? r16 E16? R | l16 D D? E D? {D Z} Z? E Z? L L M M T T M L |",
      },
      A2: {
        lead: "v76 " + MEL.A2,
        horn: "v60 o4 g1 | < b1 | a2 b2 | > X2 e2 | e2 X2 | d2 Y2 | d2 < b2 > | e2 d#2 |",
        pizz: "v60 " + arp(PROG.A2, M, P4, P2, { stac: true, acc: [0, 3] }),
        cello: "v50 " + pad(PROG.A2, M, { bass: true, floor: 36 }),
        bass: "v76 " + BASS.A2,
        drums: "v56 [l16 {D Z} Z? {D Z}? Z {E Z} Z? Z Z? {D Z} Z? {D Z} Z? {E Z}? Z {R Z} Z? | l16 {D Z} Z? Z Z? {E Z} Z? {D Z}? Z? {D Z} Z? Z Z? {E Z} Z? {R Z} R? |]3 " +
          "l16 {D Z} Z? {D Z}? Z {E Z} Z? Z Z? {D Z} Z? {D Z} Z? {E Z}? Z {R Z} Z? | l16 {D Z} Z? E E? {L Z} Z? L L M M M M T T T T |",
      },
      B: {
        lead: "v90 " + MEL.B,
        horn: "v74 o4 g2. e4 | Y2 a2 | d2 Y2 | e2 g2 | g2 e2 | a2 g2 | e2 X2 | a2 f#2 |",
        pizz: "v74 " + arp(PROG.B, M, P4B, P2B, { stac: true, acc: [0, 3, 6] }),
        cello: "v64 " + pad(PROG.B, M, { bass: true, floor: 36 }),
        bass: "v84 " + BASS.B,
        wood: "v60 " + arp(PROG.B, M, [0, -1, -1, 0, -1, -1, 0, -1], [0, -1, -1, 0], { stac: true }),
        drums: "v70 [l16 {D L}! Z? {D Z} Z? {E Z}! Z? Z D? {D Z} Z? {L Z} Z? {E Z}! Z? {R Z} R? | l16 {D L}! Z? {D Z} Z? {E Z}! Z? Z D? {D Z} Z? {D Z} Z? {E Z}! Z? {R Z} Z? |]3 " +
          "l16 {D L}! Z? {D Z} Z? {E Z}! Z? Z D? {D Z} Z? {L Z} Z? {E Z}! Z? {R Z} R? | l16 {D L} D? E D {L Z} L L L M M M M T T {E T}! {E T}! |",
      },
      C: {
        lead: "v70 o4 b2 a8 g8 e4 | a2. r4 | a4. Y8 d4 e4 | e2. r4 | > X2 < a8 g8 Y4 | g2. r4 | e4 a4 > X4 e4 | d#2. r4 |",
        horn: "z | v60 r2. o3 a4& | a2 r2 | r2. g4& | g2 r2 | r2. b4 | a1 | b2. r4 |",
        pizz: "v66 " + arp(PROG.C, M, [0, 2, -1, 0, 3, -1, 2, 0], [0, 2, 3, 0], { stac: true, acc: [0, 3, 6] }),
        cello: "v46 " + pad(PROG.C, M, { up: -12, top: 2, bass: true, floor: 36 }),
        bass: "v72 o2 e4. e8 r4 e4 | e4. e8 r4 e4 | e4. e8 r4 d4 | e4. e8 r4 < b4 > | e4. e8 r4 e4 | e4. e8 r4 g4 | a4. e8 r4 e4 | b4. b8 f#4 < b4 |",
        wood: "v62 [o3 e8' r8 e8' r8 r8 e8' r8 b8' |]3 o3 e8' r8 e8' r8 r8 e8' g8' b8' | [o3 e8' r8 e8' r8 r8 e8' r8 b8' |]2 o3 a8' r8 a8' r8 r8 e8' r8 a8' | o2 b8' r8 b8' r8 b8' > d#8' f#8' a8' |",
        drums: "v70 [l16 D! D? E D? E! D? D E? D! D? E D? E! E? R R? | l16 D! D? E D? E! D? {D Z} E? D! Z? E Z? {E L}! L? L L? |]3 " +
          "l16 D! D? E D? E! D? D E? D! D? E D? E! E? R R? | l16 {D L}! L L? L M! M M? M T! T T? T {E T}! E E? {E T}! |",   // last slap pushes into the loop (seam level)
      },
    };
    SONG.add("dungeon_root", {
      bpm: 96, meter: "4/4", key: "E minor", gain: 1.6,
      echo: { ms: 150, fb: 0.26, lp: 2400, hp: 300, mix: 0.18 },
      verb: { sec: 1.6, mix: 0.2, lp: 4500, pre: 0.012 },
      chans: [
        { name: "lead", inst: "oboe", pan: 0.06, vol: 0.7, echo: 0.12, verb: 0.22, oct: 5, vib: true },
        { name: "horn", inst: "horn", pan: -0.34, vol: 0.55, verb: 0.3 },
        { name: "pizz", inst: "pizz", pan: 0.42, vol: 0.6, echo: 0.1, verb: 0.2 },
        { name: "cello", inst: "strings", pan: -0.2, vol: 0.46, verb: 0.3, lp: [700, 1.6], q: 100 },
        { name: "bass", inst: "pickbass", pan: 0, vol: 0.74, oct: 2, verb: 0.06 },
        { name: "wood", inst: "marimba", pan: 0.22, vol: 0.5, verb: 0.15 },
        { name: "drums", inst: "kit", pan: 0, vol: 0.62, verb: 0.12 },
      ],
      parts: { I: cols(parts.I, M, ["drums"]), A: cols(parts.A, M, ["drums"]), A2: cols(parts.A2, M, ["drums"]), B: cols(parts.B, M, ["drums"]), C: cols(parts.C, M, ["drums"]) },
      intro: ["I"],
      loop: ["A", "A2", "B", "C"],
    });
  })();

  // ============================================================
  // dungeon_grave: Barrow Deep. E phrygian, 88 BPM. Organ, tolling bells, trembling strings,
  // choir; the breakdown turns to the Shadow motif (its fragment on the bells, E G C#) over
  // the Shadow's own harmony (diminished 7th on E, then a French sixth on C that leans to B7).
  // ============================================================
  (function () {
    const M = "phrygian";
    const frag = MotifKit.notes("shadow", { form: "fragment", tonic: 64 });   // E4 G4 C#5
    const fragBell = SONG.text(frag, { vel: 62 });                              // one bar
    const fragHigh = SONG.text(MotifKit.notes("shadow", { form: "fragment", tonic: 76 }), { vel: 64 });   // E5 G5 C#6
    const parts = {
      I: {
        bells: "v70 o4 e1 | v52 o3 b2 r2 |",
        organ: "v44 " + pad(PROG.I, M, { bass: true, floor: 36 }),
        pizz: "v50 z | o3 r2 e8' r8 d#8' < b8' |",
        sub: "o2 e1& | e1 |",
        drums: "v46 r1 | r2 l16 L? L? L L M? M L L |",
      },
      A: {
        lead: "v64 " + MEL.A,
        organ: "v42 " + pad(PROG.A, M, { bass: true, floor: 36 }),
        strings: "v40 o4 {b > e}1 | {g b}1 | {g b}1 | {g > c}1 | {g > c}1 | {a > d}1 | {b > d}2 {g > c}2 | {a > c}2 {a > d#}2\\ |",   // the last chord sags a whole step (R048)
        bells: "v68 o4 e2 r2 | z3 | v60 o3 a2 r2 | z3 |",
        pizz: "v50 " + BASS.A.replace("o2", "o3").replace(/([a-gXY][#]?)(4\.?|8)/g, "$1$2'"),
        sub: "o2 e1 | d#1 | d1 | X1 | a1 | d1 | g2 X2 | Y2 b2 |",
        drums: "v44 [L4? r4 r8 R8? r4 | r4 r8 R8? r2 |]3 L4? r4 r8 R8? r4 | r2 l16 L? L? L L M? M L L |",
      },
      A2: {
        lead: "v72 " + MEL.A2,
        organ: "v46 " + pad(PROG.A2, M, { bass: true, floor: 36 }),
        strings: "v54 o4 b2. a4 | g1 | a2 b2 | g1 | a2 g2 | a1 | b2 a2 | g2 f#2 |",
        bells: "v68 o4 e2 r2 | z3 | v60 o3 a2 r2 | z | r2 v54 o4 d2 | r2 v56 o3 b2 |",
        pizz: "v58 " + BASS.A2.replace("o2", "o3").replace(/([a-gXY][#]?)(4\.?|8)/g, "$1$2'"),
        sub: "o2 e1 | d#1 | d1 | X1 | a1 | d1 | g1 | X2 b2 |",
        drums: "v54 [{K L}4? r4 r8 R8? r4 | r4 r8 R8? K4? r8 R8? |]3 {K L}4? r4 r8 R8? r4 | r2 l16 L L L L M M L L |",
      },
      B: {
        lead: "v88 " + MEL.B,
        choir: "v62 " + pad(PROG.B, M, { up: 0 }),
        organ: "v54 " + pad(PROG.B, M, { bass: true, floor: 36 }),
        strings: "v64 o5 e1 | d1 | d1 | < b1 | > X1 | X2 < a2 | a1 | a2 b2 |",
        bells: "v70 o4 X2 r2 | z3 | v64 o4 X2 r2 | z | r2 v56 o4 e2 | r2 v60 o3 b2 |",
        pizz: "v66 " + BASS.B.replace("o2", "o3").replace(/([a-gXY][#]?)(4\.?|8)/g, "$1$2'"),
        sub: "o2 X1 | d1 | b1 | e1 | X1 | a1 | Y1 | b1 |",
        drums: "v64 [{K L}4 r8 R8? K4? r8 R8 | K4? r8 R8? r8 K8? r8 R8? |]3 {K L}4 r8 R8? K4? r8 R8 | l16 L L L L M M M M L L L L {K L}4 |",
      },
      C: {
        lead: "z4 | " + fragHigh + " z3 |",
        choir: "v42 " + pad(PROG.CG, M),
        organ: "v40 " + pad(PROG.CG, M, { bass: true, floor: 36 }),
        strings: "v44 o5 e1 | c#1 | a#1 | a1 | g1 | g1 | f#1 | f#2 d#2\\ |",
        bells: fragBell + " z | z | v56 o3 b2 r2 | v62 o4 e2 r2 | z | v50 o4 e2 r2 | v58 o3 b2 r2 |",
        pizz: "z3 | v54 o3 b8' r8 r4 f#8' r8 r4 | z3 | o3 b8' r8 f#8' r8 d#8' r8 < b8' r8 |",
        sub: "o2 e1& | e1 | c1 | b1 | e1& | e1 | c1 | b1 |",
        drums: "z6 | v44 r2 L4? L4 | v52 l16 L L L L M M M M T? T T T {K L}4 |",
      },
    };
    SONG.add("dungeon_grave", {
      bpm: 88, meter: "4/4", key: "E phrygian", gain: 4,
      echo: { ms: 240, fb: 0.36, lp: 1800, hp: 250, mix: 0.24 },
      verb: { sec: 2.6, mix: 0.36, lp: 3200, pre: 0.03 },
      chans: [
        { name: "lead", inst: "organ", pan: 0.08, vol: 0.58, echo: 0.2, verb: 0.4, oct: 5 },
        { name: "choir", inst: "choir", pan: -0.1, vol: 0.46, verb: 0.5, q: 100 },
        { name: "organ", inst: "organ", pan: -0.3, vol: 0.44, verb: 0.45, q: 100 },
        { name: "strings", inst: "strings", pan: 0.4, vol: 0.44, verb: 0.5, trem: [0.55, 6.5], q: 100 },
        { name: "bells", inst: "bells", pan: -0.45, vol: 0.5, echo: 0.15, verb: 0.55 },
        { name: "pizz", inst: "pizz", pan: 0.48, vol: 0.52, verb: 0.3 },
        { name: "sub", inst: "sub", pan: 0, vol: 0.5, verb: 0, q: 100 },
        { name: "drums", inst: "kit", pan: 0, vol: 0.55, verb: 0.25 },
      ],
      parts: { I: cols(parts.I, M, ["drums"]), A: cols(parts.A, M, ["drums"]), A2: cols(parts.A2, M, ["drums"]), B: cols(parts.B, M, ["drums"]), C: cols(parts.C, M, ["drums"]) },
      intro: ["I"],
      loop: ["A", "A2", "B", "C"],
    });
  })();

  // ============================================================
  // finale: the Shadow Keep. D minor, 6/8 with the dotted quarter at 72 (a resting heartbeat).
  // A (16): the Shadow on low choir over its tritone pedal (D + G#: D dim7, then a French
  //   sixth), answered on A, stated again higher, then a rising chain of diminished chords
  //   with the Shadow's fragment on the bells.
  // B (16): a solo oboe takes the Shadow, then sings a lament while the bass walks the Shadow
  //   (D F B Bb E -> A), the Shadow climbs to F, and the fragments pile up with timpani.
  // Bridge (8): the tritone drone and the heart grow for six bars (a Sunstone glimmer on a
  //   bell), one huge dominant chord, then a bar where only a soft organ D + G# drone and the sub
  //   D hold (review r1 S2: the old near-silence read as a bug every 67 s), and a timpani roll
  //   breathes in for the last 0.4 s, so the loop comes back at the level it left.
  // ============================================================
  (function () {
    // the Shadow in 6/8: each quarter of the 4/4 motif becomes a dotted-quarter beat
    const sh68 = (tonic, vel) => SONG.text(MotifKit.notes("shadow", { tonic }).map(n => [n[0], n[1] * 1.5]), { meter: "6/8", vel });
    const sun = MotifKit.notes("sunstone", { form: "fragment", tonic: 74 });            // D5 E5 A5
    const glimmer = SONG.text([sun[0], sun[1], [sun[2][0], 6]], { meter: "6/8", at: 2, vel: 46 });
    const HB = "K8 K8? r8 K8 K8? r8 |", HB2 = "{K L}8 K8? r8 K8 K8? r8 |", HB3 = "{K L}8 K8? r8 {K L}8 K8? r8 |";
    const DIM = "o2 {d g# > f b}", FR6 = "o2 {d g# a# > e}", CDIM = "o2 {c# > e g a#}", A7B9 = "o2 {a > c# g a#}";
    const parts = {
      I: {
        organ: "z2 | v38 o2 {d g#}2. | v50 {d g#}2. |",      // bar 4 = the loop end drone (r1 S2), so both loop starts match
        timp: "z3 | r4. r8. v36 o2 l32 [d v+4]6 |",
        strings: "z3 | v30 o5 g#2. |",
        bells: "v46 o4 d2. | z | v38 o3 g#2. | z |",
        sub: "z2 | o2 d2.& | d2. |",
        drums: "v34 " + HB + " " + HB + " v40 " + HB + " " + HB,
      },
      A: {
        choir: sh68(50, 52) + " " + sh68(57, 50) + " " + sh68(62, 60) +
          " v50 o3 {f g# b > d}2. | o3 {e g a# > c#}2. | o3 {f g# b > d}2. | v54 o3 {e g a# > c#}2. |",
        organ: "v42 " + DIM + "2. | " + DIM + "2. | " + DIM + "4. " + FR6 + "4. | " + FR6 + "2. | " +
          "o2 {a > c d# f#}2. | o2 {a > c d# f#}2. | o2 {a > c d# f#}4. o2 {f a b > d#}4. | o2 {f a b > d#}2. | " +
          "v48 " + DIM + "2. | " + DIM + "2. | " + DIM + "4. " + FR6 + "4. | " + FR6 + "2. | " +
          "v50 " + DIM + "2. | " + CDIM + "2. | " + DIM + "2. | " + A7B9 + "2. |",
        strings: "v38 o4 {g# > d}2. | {g# > d}2. | {g# > d}4. {g# > e}4. | {g# > e}2. | " +
          "o5 {d# a}2. | {d# a}2. | {d# a}2. | {d# a}2. | " +
          "v46 o5 d2. | f2. | g#4. e4. | e2. | " +
          "v50 o5 {f b}2. | {e g}2. | {f g#}2. | v56 {e g}2. |",
        bells: "v50 o4 d2. | z | v42 o3 g#2. | z | v48 o3 a2. | z | v42 o4 d#2. | z | " +
          "v54 o4 d2. | d2. | o3 g#2. | g#2. | v56 o5 d8. f8. b4. | e8. g8. > c#4. < | f8. g#8. > d4. < | a2. |",
        sub: "o2 d2.& | d2.& | d2.& | d2. | a2.& | a2.& | a4. f4.& | f2. | d2.& | d2.& | d2.& | d2. | d2. | c#2. | d2. | a2. |",
        timp: "z15 | v34 o2 l32 [a v+1]24 |",
        drums: "v44 [" + HB + "]8 v50 [" + HB + "]8",
      },
      B: {
        oboe: sh68(74, 70) + " v70 o6 d4. < a4 f8 | a4. g4. | f4 e8 a#4. | a4. c#4. | " + sh68(77, 76) +   // F E Bb: the tritone sigh, not a hymn's turn
          " v80 o5 d8. f8. b4. | e8. g8. > c#4. < | f8. g#8. > d4. < | e2. |",
        choir: "v48 o3 {f g# b > d}2. | {f g# b > d}2. | {f g# b > d}4. {e g# a# > d}4. | {e g# a# > d}2. | z4 | " +
          sh68(53, 64) + " v70 o4 d8. f8. b4. | e8. g8. > c#4. < | f8. g#8. > d4. < | e2. |",
        organ: "v50 " + DIM + "2. | " + DIM + "2. | " + DIM + "4. " + FR6 + "4. | " + FR6 + "2. | " +
          "v52 o3 {d f a}2. | {d f a}4. o2 {b > d f g}4. | o2 {b > d f g}4. o2 {a# > d g}4. | o3 {c# e g a}2. | " +
          "v56 o2 {f b > d g#}2. | {f b > d g#}2. | {f b > d g#}4. o3 {c# f g b}4. | o3 {c# f g b}2. | " +
          "v60 " + DIM + "2. | " + CDIM + "2. | " + DIM + "2. | " + A7B9 + "2. |",
        strings: "v50 o5 g#2. | g#2. | g#2. | g#2. | v48 o4 f2. | f4. f4. | g4. g4. | e2. | " +
          "v56 o5 b2. | b2. | b2. | b2. | v62 o5 {f b}2. | {g a#}2. | {f g#}2. | {g > c#}2. |",
        bells: "v56 o4 d2. | z | o3 g#2. | z | v52 o4 d2. | z | o3 g2. | o4 e2. | " +
          "v58 o3 f2. | z | r4. o4 c#4. | z | v62 o4 d2. | c#2. | d2. | < a2. > |",
        sub: "o2 d2.& | d2.& | d2.& | d2. | d2. | f4. b4.& | b4. a#4. | e4. a4. | f2.& | f2.& | f4. c#4.& | c#2. | d2. | c#2. | d2. | a2. |",
        timp: "v50 o2 d4. r4. | z3 | d4. r4. | z2 | r4. a4. | v54 f4. r4. | z | f4. r4. | z | " +
          "v60 d4. r4. | c#4. r4. | d4. r4. | v50 l32 [a v+2]24 |",
        drums: "v56 [" + HB2 + "]8 v64 [" + HB3 + "]8",
      },
      Z: {   // bridge: tritone drone and a long crescendo, then a quiet drone breath (r1 S2: no near-silence before the loop)
        organ: "v44 o2 {d g#}2. | {d g#}2. | v50 {d g# > d g#}2. | {d g# > d g#}2. | v58 " + DIM + "2. | v66 " + DIM + "2. | v84 " + A7B9 + "2. | v50 o2 {d g#}2. |",
        choir: "z4 | v58 o3 {f g# b > d}2. | v66 {f g# b > d}2. | v80 o3 {e g a# > c#}2. | z |",
        strings: "v50 o5 g#2. | v54 g#2. | v58 a2. | v62 a2. | v68 a#2. | v74 b2. | v84 > c#2. | z |",
        bells: "v50 o4 d2. | v54 d2. | " + glimmer + " z | v62 o4 d2. | v66 d2. | v76 o3 a2. | z |",
        sub: "o2 d2.& | d2.& | d2.& | d2.& | d2.& | d2. | a2. | v66 d2. |",
        timp: "v44 o2 d4. r4. | v48 d4. r4. | v52 d4. r4. | v56 d4. r4. | v50 l32 [d v+1]24 | [d v+1]24 | v70 [a v+1]24 | r4. r8. v36 o2 l32 [d v+4]6 |",
        drums: "v68 [" + HB3 + "]4 v74 [{K L}8 K8? K8? {K L}8 K8? K8? |]2 v84 {K L}8 K8 K8 {K L}8 K8 K8 | v30 K8? r8 r8 r4. |",
      },
    };
    SONG.add("finale", {
      bpm: 72, beat: "4.", meter: "6/8", key: "D minor", gain: 3,
      echo: { ms: 240, fb: 0.32, lp: 1400, hp: 300, mix: 0.16 },
      verb: { sec: 2.6, mix: 0.42, lp: 2800, pre: 0.035 },
      chans: [
        { name: "oboe", inst: "oboe", pan: 0.06, vol: 0.66, echo: 0.2, verb: 0.4, vib: true },
        { name: "choir", inst: "choir", pan: -0.12, vol: 0.6, verb: 0.55, q: 100 },
        { name: "organ", inst: "organ", pan: -0.28, vol: 0.46, verb: 0.5, q: 100 },
        { name: "strings", inst: "strings", pan: 0.38, vol: 0.44, verb: 0.5, trem: [0.5, 6], q: 100 },
        { name: "bells", inst: "bells", pan: -0.5, vol: 0.46, echo: 0.2, verb: 0.6 },
        { name: "sub", inst: "sub", pan: 0, vol: 0.55, verb: 0, q: 100 },
        { name: "timp", inst: "timpani", pan: 0.22, vol: 0.5, verb: 0.35 },
        { name: "drums", inst: "kit", pan: 0, vol: 0.48, verb: 0.3 },   // r1 S4: 0.6 -> 0.48 (the kick heartbeat now ruled 40-55 Hz)
      ],
      parts,
      intro: ["I"],
      loop: ["A", "B", "Z"],
    });
  })();

  // ============================================================
  // cave: an ambience bed for the rock caves (no tune). 60 BPM, 30-bar loop = 2 minutes.
  // A low drone (strings + a filtered organ fifth + sub) moves slowly and irregularly around
  // A; water drips (celesta) and pool plops (marimba) fall at seeded, uneven times through a
  // cave-sized echo; a pitched-down cymbal wash with a slow swell is the distant wind.
  // ============================================================
  (function () {
    const BAR = 16, BARS = 30;
    // [start16, len16, midi, vel] -> text with rests and ties over bar lines (no overlaps).
    // legato: every note slurs into the next one (a drone that changes pitch without a new attack).
    const line = (evs, mark, legato) => {
      evs = evs.slice().sort((a, b) => a[0] - b[0]);
      const out = []; let pos = 0;
      const put = (m, n, v, mk, more) => {      // m 0 = rest; more = another note follows
        let first = true;
        while (n > 0) {
          const seg = Math.min(n, BAR - pos % BAR), ps = pieces(seg);
          ps.forEach((p, k) => {
            const end = k === ps.length - 1 && n === seg;
            if (!m) out.push("r" + LEN16[p]);
            else out.push((first && v != null ? "v" + v + " " : "") + "o" + oct(m) + " " + NM[m % 12] + LEN16[p] + (end ? (legato && more ? "&" : mk || "") : "&"));
            first = false;
          });
          pos += seg; n -= seg;
          if (pos % BAR === 0) out.push("|");
        }
      };
      evs.forEach((e, i) => { if (e[0] > pos) put(0, e[0] - pos); put(e[2], e[1], e[3], mark, i < evs.length - 1); });
      if (pos < BARS * BAR) put(0, BARS * BAR - pos);
      return out.join(" ");
    };
    // drone plan: [bars, drone, fifth above] (A2 = 45)
    const PLAN = [[3, 45, 52], [3, 45, 50], [2, 43, 50], [4, 45, 52], [3, 41, 48], [3, 45, 48], [3, 45, 52], [2, 40, 47], [4, 45, 52], [3, 45, 50]];
    const drone = [], fifth = [], sub = [];
    let at = 0;
    // r1 S4: the sub (an octave under the drone) now swells in for only the first 2 bars (8 s) of
    // each drone note and dies away, instead of holding E1-A1 for 12-16 s (40-55 Hz was the
    // loudest band of the cave). (At the drone's own pitch it beat against the string chorus.)
    for (const [n, d, f] of PLAN) { drone.push([at, n * BAR, d, 44]); fifth.push([at, n * BAR, f, 40]); sub.push([at, Math.min(n, 2) * BAR, d - 12, 50]); at += n * BAR; }
    const slurred = evs => line(evs, "", true);
    const R = rng(2718), PENTA = [0, 3, 5, 7, 10];              // A minor pentatonic
    const drips = [], plops = [], wind = [];
    for (let t = 6; t < BARS * BAR - 2;) {
      const oc = R() < 0.55 ? 84 : R() < 0.7 ? 96 : 72, m = 57 + oc - 48 + PENTA[Math.floor(R() * 5)];
      if (t % BAR <= 13) {
        drips.push([t, 1, Math.min(m, 105), Math.round(28 + R() * 28)]);
        if (R() < 0.22 && t % BAR <= 12) drips.push([t + 2, 1, Math.min(m, 105), 22]);     // a drop that splits
      }
      t += 8 + Math.floor(R() * 13);                                                      // 2-5 s apart
    }
    for (let t = 20; t < BARS * BAR - 4;) {
      if (t % BAR <= 13) plops.push([t, 2, 45 + 12 * Math.floor(R() * 2) + PENTA[Math.floor(R() * 5)], Math.round(34 + R() * 20)]);
      t += 26 + Math.floor(R() * 22);                                                     // 6.5-12 s apart
    }
    for (let t = 8; t < BARS * BAR - 40;) {
      const len = 24 + Math.floor(R() * 20);
      wind.push([t, len, 33 + Math.floor(R() * 8), Math.round(40 + R() * 22)]);      // the cymbal played ~6x slower
      t += len + 40 + Math.floor(R() * 60);                                              // gusts 16-25 s apart
    }
    const parts = {
      I: { drone: "v40 o2 a1 |", fifth: "v34 o3 e1 |", sub: "v44 o1 a1 |" },
      L: { drone: slurred(drone), fifth: slurred(fifth), sub: line(sub, ""), drip: line(drips, "'"), plop: line(plops), wind: line(wind) },
    };
    SONG.add("cave", {
      bpm: 60, meter: "4/4", key: "A minor", fadeIn: 2, fadeOut: 1, gain: 8.1,   // r1: +0.6 dB for the shorter sub
      echo: { ms: 240, fb: 0.48, lp: 2200, hp: 300, mix: 0.32 },
      verb: { sec: 2.4, mix: 0.4, lp: 4000, pre: 0.025 },
      chans: [
        { name: "drone", inst: "strings", pan: -0.22, vol: 0.7, verb: 0.5, lp: [320, 1.2], env: [2.5, 1, 0.9, 3] },
        { name: "fifth", inst: "organ", pan: 0.28, vol: 0.34, verb: 0.55, lp: [380, 0.8], env: [3, 1, 0.9, 3] },
        { name: "sub", inst: "sub", pan: 0, vol: 0.4, verb: 0, env: [2, 1, 0.9, 3] },   // r1 S4: 0.55 -> 0.4, shorter notes (see PLAN)
        { name: "wind", inst: "crash", pan: 0.42, vol: 0.7, verb: 0.6, lp: [900, 0.6], env: [2.5, 0, 1, 3] },
        { name: "drip", inst: "celesta", pan: -0.5, vol: 0.6, echo: 0.6, verb: 0.5 },
        { name: "plop", inst: "marimba", pan: 0.36, vol: 0.55, echo: 0.4, verb: 0.5 },
      ],
      parts,
      intro: ["I"],
      loop: ["L"],
    });
  })();

  // ============================================================
  // shop: the shopkeeper's little tune. F major, 104 BPM, lightly swung, 16-bar loop.
  // A: the shop motif on marimba (a doubled "ding" note, a neighbour and a drop), answered by
  // ocarina; B: the ocarina takes the motif over a marimba off-beat line, then the marimba
  // answers with a new ending; harp chords, walking pizzicato bass, shaker and rim. The last
  // beat (held ocarina A, a harp run up to C) leads into the loop without a level drop.
  // ============================================================
  (function () {
    const MOTIF = "o5 c8 f8 g8 e8 f4 a4 | a#4 g8 e8 c4 e4 | c8 f8 a8 > c8 < a#4 > d4 | c8 < a#8 g8 e8 f2 |";
    const ANSWER = "o5 d8 g8 a8 f8 > c4 < a4 | > d4 < b8 g8 f4 b4 | a#4 > d8 < a#8 g4 e4 | f4 c8 < a8 f4 r4 |";
    const CH = { F: "o3 {a > c f}", C7: "o3 {g a# > e}", Bb: "o3 {a# > d f}", Dm7: "o3 {a > c d f}", G7: "o3 {g b > d f}", Gm7: "o3 {g a# > d f}", C7b: "o3 {g a# > c e}" };
    const off = (c, beats) => "[r8 " + CH[c] + "8']" + beats;             // off-beat chords
    const strum = (c, beats) => beats === 4 ? CH[c] + "4. " + CH[c] + "4. " + CH[c] + "4'" : CH[c] + "4. " + CH[c] + "8'";
    const PROG8 = [["F", 4], ["C7", 4], ["F", 2], ["Bb", 2], ["C7", 2], ["F", 2], ["Dm7", 4], ["G7", 4], ["Gm7", 2], ["C7b", 2], ["F", 4]];
    const harp = f => { let b = 0; return PROG8.map(([c, n]) => { b += n; return f(c, n) + (b % 4 ? "" : " |"); }).join(" "); };
    const BASS = "o2 f4 a4 > c4 < a4 | o3 c4 < g4 e4 g4 | o2 a4 f4 a#4 > d4 | o3 c4 < g4 f4 a4 | o3 d4 < a4 > c4 < a4 | o2 g4 b4 > d4 < b4 | o2 g4 a#4 > c4 < g4 | o2 f4 > c4 < f4 e4 |";
    const SHK = "l8 Z Z? {R Z} Z? Z Z? {R Z} Z? |";
    const parts = {
      I: {
        harp: "v56 o3 l8 f a > c f a > c f r8 |",
        drums: "v40 r2 l8 Z Z? {R Z} Z? |",
      },
      A: {
        lead: "v74 " + MOTIF + " z4 |",
        answer: "v68 z4 | " + ANSWER,
        harp: "v50 " + harp(off),
        bass: "v70 " + BASS,
        drums: "v46 [" + SHK + "]7 l8 Z Z? {R Z} Z? l16 R R? R R {R Z}4 |",
      },
      B: {
        answer: "v70 " + MOTIF + " o5 c2 d2 | d2 < b2 > | c2 < a#2 | a1_ |",       // held A4 carries the level into the loop
        lead: "v60 o4 r8 c8' r8 a8' r8 c8' r8 a8' | r8 a#8' r8 g8' r8 a#8' r8 e8' | r8 c8' r8 f8' r8 d8' r8 f8' | r8 e8' r8 a#8' a2 | " +
          "v74 o5 d8 g8 a8 f8 > c4 < a4 | > d4 < b8 g8 f4 b4 | > c4 < a#8 g8 e4 g4 | f4 a4 f4 e8 d8 |",     // falls into the motif's first C
        harp: "v52 " + harp(strum).replace(/o3 \{a > c f\}4' \|$/, "o4 l16 c f a > c |"),   // last beat: a run up to the motif's first C
        bass: "v72 " + BASS.replace("o2 f4 > c4 < f4 e4 |", "o2 f4 a4 > c4 < e4 |"),
        glock: "z3 | v50 r2 o6 c8' f8' r4 | z3 | v54 r2 o6 f8' > c8' r4 |",
        drums: "v50 [" + SHK + "]7 l8 Z Z? {R Z} Z? l16 R R? R R {R Z}4 |",
      },
    };
    SONG.add("shop", {
      bpm: 104, meter: "4/4", key: "F", swing: 0.18, gain: 6.3,
      echo: { len: "16", fb: 0.24, lp: 3000, hp: 300, mix: 0.18 },
      verb: { sec: 1.1, mix: 0.2, lp: 6000, pre: 0.01 },
      chans: [
        { name: "lead", inst: "marimba", pan: 0.16, vol: 0.62, echo: 0.12, verb: 0.2 },
        { name: "answer", inst: "ocarina", pan: -0.18, vol: 0.54, echo: 0.15, verb: 0.25, vib: true },
        { name: "harp", inst: "harp", pan: -0.42, vol: 0.46, verb: 0.25 },
        { name: "bass", inst: "pizz", pan: 0.08, vol: 0.62, verb: 0.12 },
        { name: "glock", inst: "glock", pan: 0.48, vol: 0.3, echo: 0.35, verb: 0.3 },
        { name: "drums", inst: "kit", pan: 0, vol: 0.42, verb: 0.12 },
      ],
      parts,
      intro: ["I"],
      loop: ["A", "B"],
    });
  })();

  // The game's dungeon data still asks for "dungeon": play the water arrangement for now.
  SONG.add("dungeon", TRACKS.dungeon_water);
})();
