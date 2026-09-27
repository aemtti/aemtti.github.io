"use strict";
// ---------- Boss music: boss (six regular bosses), lastboss (Vex), st_victory, st_dungeon ----------
// Every melody, rhythm and progression here is new (principles and references:
// review/_audio/refs/boss.md). Hand parts are written as note lists and turned into the
// engine's song text by the small helpers below:
//   "E5:6"        E5 for 6 sixteenths (a dotted quarter); "=6" instead of a number = a raw
//                 length word (6 = quarter-note triplet); marks after the length as in the
//                 notation: ! accent, ? ghost, ' staccato, _ tenuto, ~ vibrato, & tie/slur
//   "E4+G4+B4:4"  a chord;  "r:4" a rest;  "|" a bar line (the engine checks every bar)
//   anything else (v80, @flute, k12, z ...) is passed through as song text.
// Chord-built parts (ostinati, stabs, colour layers) come from one chord per bar ("E m", "Bb M").
//
// Game hooks (for the job that wires the music in):
//   boss room:  Sound.music("boss"); Sound.setLayer("d" + dungeonNumber, true)
//               d1 marimba (tide), d2 pizzicato (roots), d3 organ (barrow), d4 hand drums (sun
//               vault), d5 glockenspiel (rime), d6 growling FM bass (cinder); all off at a fresh start
//   Vex:        Sound.music("lastboss"); at hp <= 9: Sound.setLayer("rage", true)  (joins at the next bar)
//   boss falls: Sound.music(dungeonTrack); Sound.stinger("st_victory")   (the dungeon track waits, then goes on)
//   dungeon in: Sound.music(dungeonTrack); Sound.stinger("st_dungeon")   (the same, before the first bar)
(function () {
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const NM = ["c", "c#", "d", "e-", "e", "f", "f#", "g", "g#", "a", "b-", "b"];
  const QUAL = { m: [0, 3, 7], M: [0, 4, 7], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], M7: [0, 4, 7, 11], sus: [0, 5, 7, 10] };
  const midi = s => {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(s);
    if (!m) throw new Error("[music_boss] bad note name '" + s + "'");
    return 12 * (+m[3] + 1) + PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0);
  };
  const len = n => (n[0] === "=" ? n.slice(1) : MotifKit.mmlLen(+n));
  const pitch = m => "o" + (Math.floor(m / 12) - 1) + " " + NM[m % 12];
  const chord = ms => {
    const s = ms.slice().sort((a, b) => a - b), o = Math.floor(s[0] / 12) - 1;
    let cur = o, t = "";
    for (const m of s) { const mo = Math.floor(m / 12) - 1; while (mo > cur) { t += ">"; cur++; } t += NM[m % 12] + " "; }
    return "o" + o + " {" + t.trim() + "}";
  };
  // note-list text -> song text (k = semitones added to every note)
  const M = (text, k) => text.trim().split(/\s+/).map(tok => {
    const m = /^([^:]+):(=?\d+)(.*)$/.exec(tok);
    if (!m) return tok;
    if (m[1] === "r") return "r" + len(m[2]);
    const ns = m[1].split("+").map(x => midi(x) + (k || 0));
    return (ns.length > 1 ? chord(ns) : pitch(ns[0])) + len(m[2]) + m[3];
  }).join(" ");
  // song text with bar lines <-> arrays of one string per bar
  const B = s => s.split("|").map(x => x.trim()).filter(x => x);
  const J = a => a.join(" | ") + " |";
  const rep = (x, n) => Array(n).fill(x);
  // timpani roll: n 32nds of one note, velocity from v0 to v1, then back to `after`
  const roll = (note, n, v0, v1, after) => {
    const out = [];
    for (let i = 0; i < n; i++) { if (i % 4 === 0) out.push("v" + Math.round(v0 + (v1 - v0) * i / Math.max(1, n - 1))); out.push(pitch(midi(note)) + "32"); }
    return out.join(" ") + " v" + (after || 80);
  };
  // chord per bar: "E m", "Bb 7", "B sus/7@8" (sus4 until 16th 8, then 7) -> { pc, q, q2, at };
  // qa(c, pos) = the chord's intervals at that 16th; band(pc, lo) = that pitch class in lo..lo+11
  const cs = s => {
    const m = /^([A-G])([#b]?) (\w+)(?:\/(\w+)@(\d+))?$/.exec(s);
    return { pc: (PC[m[1]] + (m[2] === "#" ? 1 : m[2] === "b" ? -1 : 0) + 12) % 12, q: QUAL[m[3]], q2: m[4] ? QUAL[m[4]] : null, at: m[5] ? +m[5] : 16 };
  };
  const qa = (c, pos) => (c.q2 && pos >= c.at ? c.q2 : c.q);
  const band = (pc, lo) => lo + ((pc - lo) % 12 + 12) % 12;
  const gen = (list, f) => list.map(s => f(cs(s)));
  // one bar of chord hits at [start, length] (16ths); voicings[i] for hit i ("E4 G4 B4")
  const stab = (hits, voicings, mark) => {
    const out = []; let pos = 0;
    hits.forEach((h, i) => {
      if (h[0] > pos) out.push("r" + MotifKit.mmlLen(h[0] - pos));
      out.push(chord(voicings[Math.min(i, voicings.length - 1)].split(" ").map(midi)) + MotifKit.mmlLen(h[1]) + (mark == null ? "'" : mark));
      pos = h[0] + h[1];
    });
    if (pos < 16) out.push("r" + MotifKit.mmlLen(16 - pos));
    return out.join(" ");
  };
  // every note of a [midi, 16ths] list repeated as 16ths (accent on the first), k semitones up
  const in16 = (list, k) => list.map(n => { const a = []; for (let i = 0; i < n[1]; i++) a.push(pitch(n[0] + k) + "16" + (i ? "" : "!")); return a.join(" "); }).join(" ");
  // parse "D2:3 F2:3 ..." into a [midi, 16ths] list
  const L = text => text.trim().split(/\s+/).map(t => { const m = t.split(":"); return [midi(m[0]), +m[1]]; });

  // ============================================================
  // BOSS - "Iron Beneath" (all six regular bosses)
  // E minor, 160 BPM. Entrance 2 bars (played once), then the loop A 16 (E minor) - B 16
  // (F minor, a semitone up) - A2 8 (breakdown: toms over a soft timpani pulse) = 40 bars = 60.0 s.
  // A: trumpet theme (a fall of a tritone that steps up: E A# B, C F# G; then rising 3+3+2 answers)
  //    over a 16th-note string ostinato and syncopated brass;
  //    bars 9-16 add the string pad, a horn counter-line in contrary motion and the climb to C6;
  //    B7 -> C7 (every voice up a half step) lifts it into F minor.
  // B: descending bass F E Eb D Db against a rising trumpet tune, brass riff (3+3+4+4+2 / 3+3+2+4+4),
  //    horn doubles the tune an octave down in bars 9-16; C7 slides down to B7 back to E minor.
  // A2: the A theme's first four bars augmented on the horn, tom groove over a soft timpani pulse on every beat (r1 S10), the intro's trumpet
  //    pickup (F# A D#, the B7 chord) leads back into A.
  // ============================================================
  const A_CH = ["E m", "C M7", "A m", "B sus/7@8", "E m", "G M", "C M7", "B sus/7@12", "C M", "D M", "B m7", "E m", "A m", "F M", "B 7", "C 7"];
  const B_CH = ["F m", "C M", "F m7", "Bb M", "Db M7", "Gb M", "C sus", "C 7", "F m", "C M", "F m7", "Bb M", "Db M", "Gb M", "C 7", "B 7"];
  const A2_CH = ["E m", "E m", "C M7", "C M7", "A m", "A m", "B sus", "B 7"];

  // --- trumpet: the theme (A), the lifted tune (B), the pickup that re-enters the loop ---
  // A bar 8: a neighbour note back up to B, then the sus4 falls to the third (E -> D#) just as
  // the chord turns B7. Not B-A-F# (too close to a famous film theme's line) and not the
  // suggested A G F# D# either: B A G F# D# in quarters is the July dungeon lead's
  // E D C B G# (same scale steps and rhythm). Checked 2026-09-25 (_work/fix_music/scan_lines.js).
  const bossLead = {
    I: "z | r:10 F#4:2 A4:2 D#5:2 |",
    A: "v84 E5:6! A#4:2 B4:8 | C5:6 F#4:2 G4:8 | A4:6 C5:6 E5:4 | F#5:4 E5:4 D#5:8 |" +
       " E5:6! F#5:2 G5:8 | G5:6 F#5:2 D5:8 | G5:6 E5:6 B5:4 | A5:4 B5:4 E5:4 D#5:4 |" +
       " v90 G5:12~ C5:2 E5:2 | A5:12~ D5:2 F#5:2 | B5:6! F#5:6 A5:4 | G5:6 B5:2 E5:8 |" +
       " E5:6 A5:6 C6:4! | C6:8 A5:4 F5:4 | D#5:6 F#5:6 A5:4 | G5:8 E5:4 Bb4:4 |",
    B: "v88 C5:6! Db5:2 C5:4 Ab4:4 | G4:12 E4:2 G4:2 | Ab4:6 G4:2 C5:4 Eb5:4 | D5:12 Bb4:2 D5:2 |" +
       " C5:6 Db5:2 Ab5:4 F5:4 | Bb5:12~ Db6:2 Bb5:2 | F5:8 G5:4 F5:4 | E5:12 F5:2 G5:2 |" +
       " v94 Ab5:6! G5:2 F5:4 C5:4 | G5:6 E5:2 C5:8 | Eb5:6 F5:2 Ab5:4 C6:4! | Bb5:12~ A5:2 F5:2 |" +
       " Ab5:6 F5:2 Db5:8 | Db5:6 Eb5:2 Gb5:4 Bb5:4 | Bb5:8! G5:4 E5:4 | F#5:6 C5:2 B4:8 |",
    A2: "z | z | z | z | z | z | z | v84 r:10 F#4:2 A4:2 D#5:2 |",
  };
  // --- horn: held inner line, then a counter-melody in contrary motion; the augmented theme in A2 ---
  const bossHorn = {
    I: "z | v70 D#4:16 |",
    A: "v70 G4:16 | G4:8 E4:8 | E4:16 | E4:8 D#4:8 | G4:16 | B4:16 | E4:8 G4:8 | F#4:12 D#4:4 |" +
       " v80 E4:8 G4:4 E4:4 | F#4:8 A4:4 F#4:4 | F#4:6 D4:6 A4:4 | B4:8 G4:8 | C5:8 A4:8 | F4:8 A4:4 C5:4 | A4:6 B4:6 F#4:4 | G4:8 C5:8 |",
    B: "v76 Ab4:16 | G4:16 | Eb4:16 | F4:8 D4:8 | F4:16 | Gb4:16 | G4:8 F4:8 | E4:16 |" +
       " v86 Ab4:6 G4:2 F4:4 C4:4 | G4:6 E4:2 C4:8 | Eb4:6 F4:2 Ab4:4 C5:4 | Bb4:12 A4:2 F4:2 |" +
       " Ab4:6 F4:2 Db4:8 | Db4:6 Eb4:2 Gb4:4 Bb4:4 | Bb4:8 G4:4 E4:4 | F#4:6 C4:2 B3:8 |",
    A2: "v66 E4:12 A#3:4 | B3:16 | C4:12 F#3:4 | G3:16 | A3:12 C4:4& | C4:8 E4:8 | v76 F#4:8 E4:8 | D#4:16 |",
  };
  // --- brass section: entrance hits, off-beat stabs (A), the riff (B), a swell in A2 ---
  const A_STAB = [["E4 G4 B4"], ["E4 G4 B4"], ["E4 A4 C5"], ["E4 F#4 A4", "D#4 F#4 A4"], ["E4 G4 B4"], ["D4 G4 B4"], ["E4 G4 B4"], ["E4 F#4 A4", "D#4 F#4 A4"],
    ["E4 G4 C5"], ["F#4 A4 D5"], ["F#4 A4 D5"], ["G4 B4 E5"], ["A4 C5 E5"], ["A4 C5 F5"], ["A4 B4 D#5"], ["Bb4 C5 E5"]];
  const B_STAB = ["F3 Ab3 C4", "E3 G3 C4", "Eb3 Ab3 C4", "D3 F3 Bb3", "F3 Ab3 C4", "Gb3 Bb3 Db4", "F3 G3 C4", "E3 G3 Bb3",
    "F3 Ab3 C4", "E3 G3 C4", "Eb3 Ab3 C4", "D3 F3 Bb3", "F3 Ab3 Db4", "Gb3 Bb3 Db4", "E3 G3 Bb3", "D#3 F#3 A3"];
  const RIFF_ODD = [[0, 3], [3, 3], [6, 4], [10, 4], [14, 2]], RIFF_EVEN = [[0, 3], [3, 3], [6, 2], [8, 4], [12, 4]];
  const bossBrass = {
    I: [M("v92 E3+B3+E4+G4:2! r:4 E3+B3+E4+G4:2 r:2 C3+G3+C4+E4:2 D3+A3+D4+F#4:4!"), M("v84 B2+F#3+A3+D#4:16")],
    A: A_STAB.map((v, i) => "v" + (i < 8 ? 74 : 84) + " " + stab(i < 8 ? [[6, 2], [14, 2]] : [[0, 2], [6, 2], [14, 2]], v)),
    B: B_STAB.map((v, i) => "v90 " + stab(i % 2 ? RIFF_EVEN : RIFF_ODD, [v])),
    A2: rep("z", 6).concat(B(M("v58 B3+E4+F#4+A4:16 | v80 B3+D#4+F#4+A4:16 |"))),
  };
  // --- low strings: 16th ostinato, accents on the 3+3+2 points (beats 1, 2&, 4) ---
  const OST = [0, 0, 2, 0, 3, 0, 2, 0, 3, 0, 2, 0, 1, 0, 2, 3];   // 0 root, 1 third, 2 fifth, 3 octave
  const ost = c => { const R = band(c.pc, 45); return OST.map((x, i) => pitch([R, R + qa(c, i)[1], R + qa(c, i)[2], R + 12][x]) + "16" + (i % 6 ? "" : "!")).join(" "); };
  const bossLow = {
    I: [M("v84 E3+E4:2! r:4 E3+E4:2 r:2 C3+C4:2 D3+D4:4"), "v70 " + rep("o2 b16 o3 b16", 8).join(" ")],
    A: gen(A_CH, ost).map((b, i) => (i === 0 ? "v74 " : i === 8 ? "v82 " : "") + b),
    B: gen(B_CH, ost).map((b, i) => (i ? "" : "v86 ") + b),
    A2: gen(A2_CH, ost).map((b, i) => (i === 0 ? "v56 " : i === 6 ? "v70 " : i === 7 ? "v82 " : "") + b),
  };
  // --- string pad: enters at A bar 9 (orchestration change), full in B, soft in A2 ---
  const bossPad = {
    I: ["z", "z"],
    A: rep("z", 8).concat(["E4 G4 C5", "F#4 A4 D5", "F#4 A4 D5", "G4 B4 E5", "A4 C5 E5", "A4 C5 F5", "A4 B4 D#5 F#5", "Bb4 C5 E5 G5"]
      .map((v, i) => (i ? "" : "v72 ") + M(v.replace(/ /g, "+") + ":16"))),
    B: ["Ab4 C5 F5", "G4 C5 E5", "Ab4 C5 Eb5", "Bb4 D5 F5", "Ab4 C5 F5", "Bb4 Db5 Gb5", "G4 C5 F5", "G4 Bb4 E5",
      "Ab4 C5 F5", "G4 C5 E5", "Ab4 C5 Eb5", "Bb4 D5 F5", "Ab4 Db5 F5", "Bb4 Db5 Gb5", "G4 Bb4 E5", "F#4 A4 D#5"]
      .map((v, i) => (i ? "" : "v80 ") + M(v.replace(/ /g, "+") + ":16")),
    A2: ["G4 B4 E5", "G4 B4 E5", "E4 G4 B4", "E4 G4 B4", "E4 A4 C5", "E4 A4 C5", "F#4 B4 E5", "F#4 A4 D#5"]
      .map((v, i) => (i ? "" : "v56 ") + M(v.replace(/ /g, "+") + ":16")),
  };
  // --- bass: locked to the kick (1, 2&, 3&, 4), walking into each next root; pumping 8ths in B ---
  const pump = (r, x, y) => { const a = midi(r); return [a, a, a + 12, a, a, a + 12].map(m => pitch(m) + "8").join(" ") + " " + M(x + ":2 " + y + ":2"); };
  const bossBass = {
    I: [M("v90 E2:2! r:4 E2:2 r:2 C2:2 D2:4!"), M(rep("B1:2", 8).join(" "))],
    A: B(M("v86 E2:6! E2:4 D2:2 B1:4 | C2:6! C3:4 B2:2 G2:4 | A2:6! A1:4 E2:2 C2:4 | B1:6! B2:4 A2:2 F#2:4 |" +
      " E2:6! E3:4 B2:2 E2:4 | D2:6! D3:4 B2:2 D3:4 | C3:6! C2:4 E2:2 D2:4 | B1:6! B2:4 A2:2 B2:4 |" +
      " C3:6! C2:4 G2:2 C3:4 | D3:6! D2:4 F#2:2 A2:4 | B2:6! B1:4 F#2:2 D2:4 | E2:6! E3:4 D3:2 B2:4 |" +
      " A2:6! A1:4 C2:2 E2:4 | F2:6! F1:4 C2:2 A1:4 | B1:6! B2:4 A2:2 B2:4 | C3:6! C2:4 Bb1:2 C2:4 |")),
    B: [pump("F2", "C3", "F2"), pump("E2", "G2", "E2"), pump("Eb2", "C3", "Eb2"), pump("D2", "F2", "D2"),
      pump("Db2", "Ab2", "F2"), pump("Gb2", "Db3", "Db2"), pump("C2", "G2", "C2"), pump("C2", "G2", "E2"),
      pump("F2", "C3", "F2"), pump("E2", "G2", "E2"), pump("Eb2", "C3", "Eb2"), pump("D2", "F2", "D2"),
      pump("Db2", "Ab2", "F2"), pump("Gb2", "Db3", "Db2"), pump("C2", "G2", "Bb1"), pump("B1", "F#2", "D#2")].map((b, i) => (i ? "" : "v88 ") + b),
    // A2: the dotted figure, then soft repeated roots on beats 3-4 (r1 S10: the beat carries on)
    A2: B(M("v78 E2:6 E2:2 v62 E2:4 E2:2 E2:2 | v78 E2:6 E2:2 v62 E2:4 E2:2 E2:2 | v78 C2:6 C2:2 v62 C2:4 C2:2 C2:2 |" +
      " v78 C2:6 C2:2 v62 C2:4 C2:2 C2:2 | v78 A1:6 A1:2 v62 A2:4 A2:2 A2:2 | v78 A1:6 A1:2 v62 A2:4 A2:2 A2:2 |" +
      " v84 " + rep("B1:2", 8).join(" ") + " | B1:2 B1:2 B1:2 B1:2 B2:2 B1:2 D#2:2 F#2:2 |")),
  };
  const bossTimp = {
    I: [M("v92 E2:2! r:4 E2:2 r:2 C2:2 D2:4"), M("r:8") + " " + roll("B2", 16, 50, 95, 80)],
    A: B(M("v84 E2:4! r:12 | z | A2:4 r:12 | r:8 B2:2 B2:2 B2:4 | E2:4! r:12 | D2:4 r:12 | C2:4 r:12 |") +
      " " + M("B2:4 r:4") + " " + roll("B2", 16, 55, 90) + " | " +
      M("C3:4! r:12 | D3:4 r:12 | B2:4 r:12 | E2:4 r:4 E2:4 r:4 | A2:4! r:12 | F2:4 r:4 F2:4 r:4 | B2:4 r:4 B2:2 B2:2 B2:4 |") +
      " " + M("C3:4 r:4") + " " + roll("C3", 16, 55, 95) + " |"),
    B: B(M("v86 F2:4! r:12 | E2:4 r:12 | Eb2:4 r:12 | D2:4 r:4 D2:2 D2:2 D2:4 | Db2:4! r:12 | Gb2:4 r:12 | C3:4 r:12 |") +
      " " + M("C3:4 r:4") + " " + roll("C3", 16, 55, 90) + " | " +
      M("F2:4! r:12 | E2:4 r:12 | Eb2:4 r:12 | D2:4 r:4 D2:2 D2:2 D2:4 | Db2:4! r:12 | Gb2:4 r:12 | C3:4 r:4 C3:2 C3:2 C3:4 |") +
      " " + M("B2:4 r:4") + " " + roll("B2", 16, 55, 95) + " |"),
    // A2: a soft timpani pulse on every beat (r1 S10/P6), accented on 1
    A2: B(M("v70 E2:4 v50 E2:4 v58 E2:4 v50 E2:4 | v66 E2:4 v48 E2:4 v56 E2:4 v48 E2:4 | v70 C2:4 v50 C2:4 v58 C2:4 v50 C2:4 |" +
      " v66 C2:4 v48 C2:4 v56 C2:4 v48 C2:4 | v70 A2:4 v50 A2:4 v58 A2:4 v50 A2:4 | v66 A2:4 v50 A2:4 v60 A2:4 v54 A2:4 |" +
      " v82 B2:4 r:4 B2:2 B2:2 B2:4 |") +
      " " + M("B2:4 r:4") + " " + roll("B2", 16, 55, 95) + " |"),
  };
  // --- drums: kick on 1, 2&, 3& with a push on the last 16th; fills end every phrase ---
  const K = {
    G: "{K H}8 H8 {S H}8 {K H}8 H8 {K H}8 {S H}8 H16 K16",
    G2: "{K H}8 H8 {S H}8 {K H}8 H8 {K H}8 {S H}8 O8",
    C: "{K C}8 H8 {S H}8 {K H}8 H8 {K H}8 {S H}8 H16 K16",
    F1: "{K H}8 H8 {S H}8 {K H}8 S16 S16 T16 T16 M16 M16 L16 L16",
    F2: "{K H}8 H8 {S H}8 H8 S16? S16 S16 S16 T16 T16 M16 L16",
    F3: "{K S}16! S16 S16 S16 {K T}16 T16 T16 T16 {K M}16 M16 M16 M16 {K L}16! L16 {K S}16! {K S}16!",
    BG: "{K H}16 H16? H16 K16 {S H}16 H16? {K H}16 H16? H16 H16? {K H}16 H16? {S H}16 H16? H16 S16?",
    BC: "{K C}16 H16? H16 K16 {S H}16 H16? {K H}16 H16? H16 H16? {K H}16 H16? {S H}16 H16? H16 S16?",
    BF1: "{K H}16 H16? H16 K16 {S H}16 H16? {K H}16 H16? S16 S16 T16 T16 M16 M16 L16 L16",
    BF2: "{K H}16 H16? H16 K16 {S H}16 H16? {K H}16 H16? {S T}8 {S M}8 {S L}8 {K S}8!",
    BX: "{K S}8! r8 {K S}8! r8 T16 T16 M16 M16 L16 L16 {K L}16! r16",
    T1: "L8 r16 L16 M8 r8 L8 r16 L16 M8 T8",
    T2: "L8 r16 L16 M8 R8 L8 r16 L16 {M R}8 T8",
    T7: "L8 r16 L16 M8 r8 S16? S16? S16 S16 S16 S16 S16! S16!",
    T8: "{K S}16! S16 S16 S16 {S T}16 T16 {S M}16 M16 {S L}16! L16 {K S}16! S16 {K T}16! {K M}16! {K L}16! {K S}16!",
  };
  const bossDrums = {
    I: ["{K C}8! r8 r8 {K S}8 r8 {K S}8 {K S}4", "{K S}16 S16? S16? S16? S16 S16? S16 S16 S16 S16 S16 S16 {K S}16! S16! T16! L16!"],
    A: ["C", "G", "G", "F1", "G", "G2", "G", "F2", "C", "G", "G", "F1", "G", "G2", "G", "F3"].map(k => K[k]),
    B: ["BC", "BG", "BG", "BF1", "BG", "BG", "BG", "BF2", "BC", "BG", "BG", "BF1", "BG", "BG", "BG", "BX"].map(k => K[k]),
    A2: ["T1", "T1", "T1", "T2", "T1", "T2", "T7", "T8"].map(k => K[k]),
  };
  // --- the six dungeon colours (layers d1..d6; exactly one is switched on per boss room) ---
  // d1 tide: marimba ripples in 8ths, long echo
  const MAR = [0, 2, 3, 4, 3, 2, 1, 2];                       // root, 3rd, 5th, octave, octave+3rd
  const mar = c => { const R = band(c.pc, 67); return MAR.map((x, i) => { const q = qa(c, 2 * i); return pitch([R, R + q[1], R + q[2], R + 12, R + 12 + q[1]][x]) + "8" + (i ? "" : "!"); }).join(" "); };
  // d2 roots: dry pizzicato chords on the off-beats (a push on the last one of each phrase)
  const piz = (c, i) => {
    const R = band(c.pc, 57), ch = p => { const q = qa(c, p); return chord([R + q[1], R + q[2], R + 12]) + "8'"; };
    return i % 4 === 3 ? ["r8", ch(2), "r8", ch(6), ch(8), ch(10), "r8", ch(14)].join(" ") : ["r8", ch(2), "r8", ch(6), "r8", ch(10), "r8", ch(14)].join(" ");
  };
  // d3 barrow: organ chords held a whole bar
  const org = c => { const R = band(c.pc, 48); return c.q2 ? chord(c.q.map(x => R + x)) + MotifKit.mmlLen(c.at) + " " + chord(c.q2.map(x => R + x)) + MotifKit.mmlLen(16 - c.at) : chord(c.q.map(x => R + x)) + "1"; };
  // d4 sun vault: hand drums (D low open stroke, E high slap), own two-bar pattern + fills
  const HD = "D16! r16 E16 r16 E16 D16 r16 E16 D16 r16 E16 r16 E16 D16 E16 E16";
  const HD2 = "D8 E16 E16 D8 E16 E16 D16 E16 D16 E16 D16 D16 E16 E16";
  const HDF = "D16! D16 E16 E16 D16 D16 E16 E16 D16 E16 D16 E16 D16! D16! E16! E16!";
  const hand = n => { const a = []; for (let i = 0; i < n; i++) a.push(i % 4 === 3 ? HDF : i % 8 === 6 ? HD2 : HD); return a; };
  // d6 cinder: growling FM bass, 16th chugs on the kick points
  const chug = c => { const R = pitch(band(c.pc, 28)); return [R + "16!", R + "16", "r16", R + "16", "r8", R + "8!", "r16", R + "16", R + "8!", "r16", R + "16", R + "8"].join(" "); };
  const dly = (arr, v) => arr.map((b, i) => (i ? "" : "v" + v + " ") + b);   // velocity from the first bar of a list
  const bossColour = {
    d1: { I: ["z", M("v70 B4:1 D#5:1 F#5:1 A5:1 B5:1 D#6:1 F#6:1 A6:1 r:8")], A: dly(gen(A_CH, mar), 72), B: dly(gen(B_CH, mar), 78), A2: dly(gen(A2_CH, mar), 60) },
    d2: { I: [M("v80 E4+G4+B4:2' r:4 E4+G4+B4:2' r:2 C4+E4+G4:2' D4+F#4+A4:4'"), piz(cs("B 7"), 3)], A: dly(A_CH.map((s, i) => piz(cs(s), i)), 76), B: dly(B_CH.map((s, i) => piz(cs(s), i)), 82), A2: dly(A2_CH.map((s, i) => piz(cs(s), i)), 62) },
    d3: { I: [org(cs("E m")), org(cs("B 7"))], A: dly(gen(A_CH, org), 70), B: dly(gen(B_CH, org), 76), A2: dly(gen(A2_CH, org), 62) },
    d4: { I: ["D8! r8 r8 D8 r8 D8 D4", "E16 E16 E16 E16 E16 E16 E16 E16 E16 E16 E16 E16 D16! D16! D16! D16!"], A: hand(16), B: hand(16), A2: dly(["D4 r4 D4 r4", HD2, "D4 r4 D4 r4", HDF, HD, HD2, HD, HDF], 70) },
    d5: { I: ["z", M(bossLead.I.split("|")[1], 12)], A: B(M(bossLead.A, 12)), B: B(M(bossLead.B, 12)), A2: B(M(bossHorn.A2, 24)) },
    d6: { I: [M("v90 E1:2! r:4 E1:2 r:2 C2:2 D2:4\\"), chug(cs("B 7"))], A: dly(gen(A_CH, chug), 80), B: dly(gen(B_CH, chug), 86), A2: dly(["E1:16", "E1:16", "C2:16", "C2:16", "A1:16", "A1:16"].map(x => M(x)).concat(gen(["B 7", "B 7"], chug)), 70) },
  };
  // every part is a list of bars; join them into one line per channel and section
  const bossParts = {};
  for (const s of ["I", "A", "B", "A2"]) {
    const p = { lead: B(M(bossLead[s])), horn: B(M(bossHorn[s])), brass: bossBrass[s], low: bossLow[s], pad: bossPad[s],
      bass: bossBass[s], timp: bossTimp[s], drums: bossDrums[s] };
    for (const d in bossColour) p[d] = bossColour[d][s];
    for (const k in p) p[k] = J(p[k]);
    bossParts[s] = p;
  }
  SONG.add("boss", {
    bpm: 160, meter: "4/4", key: "E minor", instant: true, memory: false, gain: -2.9,
    echo: { len: "8", fb: 0.3, mix: 0.24, lp: 3200, hp: 280 },
    verb: { sec: 1.9, mix: 0.2, lp: 5500 },
    layers: { d1: false, d2: false, d3: false, d4: false, d5: false, d6: false },
    chans: [
      { name: "lead", inst: "trumpet", pan: 0.08, vol: 0.72, echo: 0.2, verb: 0.25 },
      { name: "horn", inst: "horn", pan: -0.3, vol: 0.62, echo: 0.05, verb: 0.35 },
      { name: "brass", inst: "brass", pan: 0.32, vol: 0.5, verb: 0.2 },
      { name: "low", inst: "strings", pan: -0.45, vol: 0.5, verb: 0.15, env: [0.008, 0.1, 0.6, 0.06] },
      { name: "pad", inst: "strings", pan: 0.5, vol: 0.4, verb: 0.45 },
      { name: "bass", inst: "pickbass", pan: 0, vol: 0.8, verb: 0.05 },
      { name: "timp", inst: "timpani", pan: -0.15, vol: 0.6, verb: 0.3 },
      { name: "d1", inst: "marimba", layer: "d1", pan: 0.55, vol: 0.45, echo: 0.35, verb: 0.3 },
      { name: "d2", inst: "pizz", layer: "d2", pan: 0.55, vol: 0.55, verb: 0.25 },
      { name: "d3", inst: "organ", layer: "d3", pan: -0.55, vol: 0.32, verb: 0.4 },
      { name: "d4", inst: "kit", layer: "d4", pan: 0.4, vol: 0.55, verb: 0.15 },
      { name: "d5", inst: "glock", layer: "d5", pan: 0.5, vol: 0.32, echo: 0.3, verb: 0.35 },
      { name: "d6", inst: "fmbass", layer: "d6", pan: 0, vol: 0.45, verb: 0.05 },
      { name: "drums", inst: "kit", vol: 0.72, verb: 0.12 },
    ],
    parts: bossParts,
    intro: ["I"],
    loop: ["A", "B", "A2"],
  });

  // ============================================================
  // LASTBOSS - "The Kept Dawn" (Vex)
  // D minor, 165 BPM. Entrance 4 bars (Shadow on brass + trumpet over the organ's D dim7 ->
  // French sixth, choir on the D + G# tritone, crash; then the ostinato starts), loop
  // A 16 - B 16 - C 8 - D 8 = 48 bars = 69.8 s.
  // The Shadow ostinato (MOTIFS.shadow "ostinato", 3+3+2 / 3+3+2) drives the bass and, in
  // 16ths, the low strings. Under a Shadow statement the organ holds Dm6 -> Bbmaj7 | Dm -> A7b9
  // so the motif's long notes sit in the chord; between statements the "drive" chords
  // (Dm6 | A7b9/E) carry trumpet answers.
  // A: Shadow core (brass, then brass + trumpet), trumpet answers; bars 9-16 a new line in
  //    quarter-note triplets over Bb Gm Eb(bII) A7 with the peak on Eb6.
  // B: the Shadow on brass against the Sunstone (minor form) on flute: D, then both up a minor
  //    third (F); then fragments overlap the Shadow, rise in sequence (D E A, E F Bb, F G C) and
  //    are cut off by the Shadow's fall over dim7 -> French sixth.
  // C: breakdown: choir sings the slow Shadow over the tritone drone, glass plays the Sunstone
  //    upside down, heartbeat drums with ghost hats, a soft 3+3+2 bass and a timpani pulse on every beat (r1 S10); a dominant build.
  // D: the "mask" (Shadow notes in the Sunstone's rhythm) on brass + trumpet, the Shadow on F,
  //    climbing dim7 stabs back to A.
  // Layer "rage" (Vex enraged, hp <= 9): the choir an octave higher and a second kit with 16th
  //    hats and a rim ostinato on the 3+3+2 points.
  // ============================================================
  const SH = (t, form) => B(MotifKit.mml("shadow", { form: form || "core", tonic: t }));
  const OSTL = t => MotifKit.notes("shadow", { form: "ostinato", tonic: t });
  const figBar = list => list.map((n, i) => pitch(n[0]) + MotifKit.mmlLen(n[1]) + (i % 3 ? "" : "!")).join(" ");
  const ostB = t => figBar(OSTL(t)), ost16 = t => in16(OSTL(t), 12);
  // organ / choir under a Shadow statement (k = 3 for the statement on F) and on "drive" bars
  const ORG_SH = k => [M("D3+F3+A3+B3:8 D3+F3+A3:8", k), M("D3+F3+A3:8 C#3+E3+G3+Bb3:8", k)];
  const ORG_DR = M("D3+F3+A3+B3:8 C#3+E3+G3+Bb3:8");
  const CH_SH = k => [M("F3+D4:16", k), M("F3+D4:8 E3+C#4:8", k)];
  const CH_DR = M("F3+D4:8 E3+C#4:8");
  const SB = M("D4+F4+A4:3' r:3 D4+F4+B4:2' C#4+E4+Bb4:3' r:3 C#4+E4+G4:2'");   // brass on the 3+3+2 points
  const SBH = [[0, 3], [6, 2], [8, 3], [14, 2]];
  const CLIMB = M("C#4+E4+G4:3! r:3 E4+G4+Bb4:2! G4+Bb4+C#5:3! r:3 Bb4+C#5+E5:2!");
  const TD = [M("D2:4! r:12"), M("D2:3 r:8 E2:3 r:2")];     // timpani under the ostinato
  const LK = {
    G: "{K H}16 r16 H16 K16 {S H}16 r16 {K H}16 r16 {K H}16 r16 H16 K16 {S H}16 r16 {K H}16 r16",
    G2: "{K H}16 S16? H16 K16 {S H}16 r16 {K H}16 S16? {K H}16 r16 H16 K16 {S H}16 S16? {K O}16 r16",
    C: "{K C}16 r16 H16 K16 {S H}16 r16 {K H}16 r16 {K H}16 r16 H16 K16 {S H}16 r16 {K H}16 r16",
    F: "{K H}16 r16 H16 K16 {S H}16 r16 {K H}16 r16 S16 S16 T16 T16 M16 M16 L16 L16",
    F2: "{K S}16! S16 S16 S16 {K T}16 T16 T16 T16 {K M}16 M16 M16 M16 {K L}16! L16 {K S}16! {K S}16!",
    HT: "{K H}8 H8 H8 H8 {S H}8 H8 H8 {K H}8",
    HT2: "{K H}8 H8 H8 H8 {S H}8 S16 S16 T16 T16 L16 L16",
    // C breakdown heartbeat (r1 S10/P6): the beat goes on under it (a soft second beat on 3, ghost hats)
    HB: "K8 L8 H8? H8? K8? L8? H8? H8?",
    HB2: "K8 L8 H8? R8 K8? L8? R8 H8?",
    C7: "K8 L8 r4 S16? S16? S16 S16 S16 S16 S16 S16",
    C8: "S16 S16 S16 S16 {S T}16 T16 {S T}16 T16 {S M}16 M16 {S M}16 M16 {K L}16! L16 {K S}16! {K S}16!",
    I1: "{K C}4! r2.", I2: "r2 S16? S16? S16 S16 S16 S16 S16! S16!",
    RK: "{R H}16! H16? H16 {R H}16! H16? H16 {R H}16! H16? {R H}16! H16? H16 {R H}16! H16? H16 {R H}16! H16?",
    RKF: "{R H}16! H16? H16 {R H}16! H16? H16 {R H}16! H16? T16 T16 M16 M16 L16 L16 {L R}16! {L R}16!",
  };
  const lk = s => s.split(" ").map(k => LK[k]);
  // bass figures (the ostinato's 3+3+2 rhythm on other chords)
  const F9 = L("Bb1:3 F2:3 Bb2:2 Bb1:3 F2:3 A1:2"), F10 = L("G1:3 D2:3 G2:2 G1:3 D2:3 F2:2"), F11 = L("Eb2:3 Bb2:3 Eb3:2 Eb2:3 Bb1:3 Bb1:2");
  const F12 = L("A1:3 E2:3 A2:2 G2:3 E2:3 A1:2"), F14 = L("G1:3 D2:3 G2:2 E2:3 D2:3 F2:2"), F16 = L("A1:3 E2:3 A2:2 Bb2:3 G2:3 C#2:2");
  const FB13 = L("F1:3 C2:3 F2:2 F1:3 C2:3 A1:2"), FB14 = L("G1:3 D2:3 G2:2 G1:3 D2:3 Bb1:2"), FB15 = L("C2:3 G2:3 C3:2 C2:3 G2:3 Bb1:2");
  const FDOM = L("A1:3 E2:3 A2:2 Bb2:3 E2:3 A1:2"), FDPED = L("D2:3 D2:3 D3:2 D2:3 D2:3 D3:2");
  const A9 = [F9, F10, F11, F12, F9, F14, F11, F16];
  const SUN = (t, o) => B(MotifKit.mml("sunstone", Object.assign({ form: "minor", tonic: t }, o || {})));
  const FRAG = (t, s) => M(MotifKit.notes("sunstone", { form: "fragment", tonic: t, shift: s, mode: "minor" }).map(n => MotifKit.name(n[0], true) + ":" + n[1]).join(" "));
  const lastParts = {
    I: {
      organ: B(M("v70 D3+F3+G#3+B3:16 | D3+F3+G#3+B3:4 D3+E3+G#3+Bb3:12 | v64 D3+F3+A3+B3:8 C#3+E3+G3+Bb3:8 | v72 C#3+E3+G3+Bb3:16 |")),
      choir: B(M("v74 D3+G#3:16 | D3+G#3:16 | v66 F3+D4:8 E3+C#4:8 | v74 E3+C#4:16 |")),
      strings: [M("v70 D2+D3:16"), M("D2+D3:16"), "v76 " + ost16(38), "v84 " + in16(F16, 12)],
      brass: dly(SH(62), 96).concat(["z", "v90 " + CLIMB]),   // bar 4 = the same dominant build as D8, so both entries into A match
      lead: dly(SH(74), 92).concat(["z", "z"]),
      bass: [M("v84 D2:16&"), M("D2:16"), ostB(38), figBar(F16)],
      timp: [M("v94 D2:4! r:12"), M("r:8") + " " + roll("A2", 16, 45, 95), "v88 " + TD[0], M("A2:4 r:4") + " " + roll("A2", 16, 60, 100)],
      drums: lk("I1 I2 G F2"),
      ragekit: ["z", "z", LK.RK, LK.RKF],
    },
    A: {
      organ: dly([...ORG_SH(0), ORG_DR, ORG_DR, ...ORG_SH(0), ORG_DR, ORG_DR], 64).concat(B(M("v70 F3+Bb3+D4:16 | G3+Bb3+D4:16 | G3+Bb3+Eb4:16 | G3+A3+C#4+E4:16 | F3+Bb3+D4:16 | G3+Bb3+D4+E4:16 | G3+Bb3+Eb4:16 | G3+Bb3+C#4+E4:16 |"))),
      choir: dly([...CH_SH(0), CH_DR, CH_DR, ...CH_SH(0), CH_DR, CH_DR], 66).concat(B(M("v74 D4+F4:16 | D4+G4:16 | Eb4+G4:16 | C#4+E4:16 | D4+F4:16 | D4+G4:16 | Eb4+G4:16 | C#4+E4:16 |"))),
      strings: dly(rep(ost16(38), 8), 76).concat(dly(A9.map(f => in16(f, 12)), 82)),
      brass: dly([...SH(62), SB, SB, ...SH(62), SB, SB], 88).concat(dly(["D4 F4 Bb4", "D4 G4 Bb4", "Eb4 G4 Bb4", "C#4 E4 G4 A4", "D4 F4 Bb4", "D4 E4 G4 Bb4", "Eb4 G4 Bb4", "C#4 E4 G4 Bb4"].map(v => stab(SBH, [v])), 84)),
      lead: ["z", "z"].concat(B(M("v84 A5:8 G5:4 Bb5:4 | A5:6 F5:2 E5:4 C#5:4 |")), SH(74), B(M("F5:8 E5:4 G5:4 | A5:6 B5:2 Bb5:4 C#5:4 |")),
        B(M("v88 D5:8 C5:=6 Eb5:=6 D5:=6 | G5:12~ Bb5:4 | Bb5:8 G5:4 Eb5:4 | C#5:12~ E5:4 | D5:8 Bb5:=6 A5:=6 F5:=6 | Bb5:6 D6:2 G5:4 Bb5:4 | Eb6:12!~ D6:2 Bb5:2 | Bb5:6 G5:2 E5:4 C#5:4 |"))),
      bass: dly(rep(ostB(38), 8), 84).concat(A9.map(figBar)),
      timp: dly([TD[0], TD[1], TD[0], TD[1], TD[0], TD[1], TD[0], TD[1]], 84).concat(B(M("Bb2:4! r:12 | G2:4 r:12 | Eb2:4 r:4 Eb2:4 r:4 | A2:4 r:4 A2:2 A2:2 A2:4 | Bb2:4! r:12 | G2:4 r:12 | Eb2:4 r:4 Eb2:4 r:4 |")),
        [M("A2:4 r:4") + " " + roll("A2", 16, 55, 95)]),
      drums: lk("C G G F G G2 G F C G G F G G2 G F2"),
      ragekit: [...rep(LK.RK, 7), LK.RKF, ...rep(LK.RK, 7), LK.RKF],
    },
    B: {
      organ: dly(ORG_SH(0), 66).concat(B(M("D4+F4+A4:8 D4+F4+Bb4:8 | C#4+E4+A4:16 |")), ORG_SH(3), B(M("F4+Ab4+C5:8 F4+Ab4+Db5:8 | E4+G4+C5:8 E4+G4+C#5:8 |")),
        ORG_SH(0), ORG_SH(0), B(M("F3+A3+C4:16 | G3+Bb3+D4:16 | G3+C4+F4:4 G3+C4+E4:12 | D3+F3+G#3+B3:4 D3+E3+G#3+Bb3:12 |"))),
      choir: dly(CH_SH(0), 70).concat(B(M("D4+F4:16 | C#4+E4:16 |")), CH_SH(3), B(M("Ab3+F4:16 | G3+E4:16 |")), CH_SH(0), CH_SH(0),
        B(M("C4+F4:16 | D4+G4:16 | C4+F4:4 C4+E4:12 | F3+B3:4 E3+Bb3:12 |"))),
      strings: dly([ost16(38), ost16(38)], 80).concat(B(M("Bb2+F3+A3:8 G2+F3+Bb3:8 | A2+E3+C#4:16 |")), [ost16(41), ost16(41)],
        B(M("Db3+Ab3+C4:8 Bb2+F3+Db4:8 | C3+G3+E4:8 A2+E3+C#4:8 |")), rep(ost16(38), 4), [FB13, FB14, FB15].map(f => in16(f, 12)), [rep("o3 d16 o3 g#16", 8).join(" ")]),
      brass: dly(SH(62), 90).concat(["z", "z"], SH(65), ["z", "z"], SH(62), SH(62), [stab(SBH, ["C4 F4 A4"]), stab(SBH, ["D4 G4 Bb4"]), stab(SBH, ["C4 F4 G4", "E4 G4 C5"])], dly(SH(62, "fall"), 100)),
      lead: dly(["@flute z"], 78).concat(SUN(74), ["z"], SUN(77), B(M("r:12 D5:2 E5:2 | A5:8 r:8 |")), SUN(86, { form: "fragment" }), [0, 1, 2].map(s => FRAG(74, s)), ["z"]),
      bass: dly([ostB(38), ostB(38)], 86).concat(B(M("Bb1:2 Bb1:2 Bb2:2 Bb1:2 G1:2 G1:2 G2:2 G1:2 | A1:2 A1:2 A2:2 A1:2 A1:2 A2:2 G2:2 E2:2 |")), [ostB(41), ostB(41)],
        B(M("Db2:2 Db2:2 Db3:2 Db2:2 Bb1:2 Bb1:2 Bb2:2 Bb1:2 | C2:2 C2:2 C3:2 C2:2 A1:2 A1:2 A2:2 C#2:2 |")), rep(ostB(38), 4), [FB13, FB14, FB15, FDPED].map(figBar)),
      timp: dly(TD, 86).concat(B(M("Bb2:4 r:12 | A2:4 r:12 | F2:4! r:12 | F2:3 r:8 G2:3 r:2 | Db3:4 r:12 | C3:4 r:4 A2:4 r:4 |")), TD, TD,
        B(M("F2:4 r:12 | G2:4 r:12 | C3:4 r:12 |")), [M("D2:4 r:4") + " " + roll("D2", 16, 55, 95)]),
      drums: lk("C G HT HT G G2 HT HT2 C G G F G G G2 F2"),
      ragekit: [...rep(LK.RK, 7), LK.RKF, ...rep(LK.RK, 7), LK.RKF],
    },
    C: {
      organ: B(M("v58 D3+F3+G#3+B3:16 | D3+F3+G#3+B3:16 | D3+F3+G#3+B3:8 D3+E3+G#3+Bb3:8 | D3+E3+G#3+Bb3:16 | F3+Bb3+D4:8 F3+A3+C4:8 | E3+G3+C4:16 | v70 C#3+E3+G3+Bb3:16 | v82 C#3+E3+G3+Bb3:16 |")),
      choir: dly(SH(50, "slow"), 72).concat(B(M("v66 Bb3+D4:8 A3+C4:8 | C4+E4:16 | C#4+E4:16 | v76 C#4+E4+G4:16 |"))),
      strings: B(M("v60 D2+G#2:16 | D2+G#2:16 | D2+G#2:16 | D2+G#2:16 | G2+D3:8 F2+C3:8 | C3+G3:16 |")).concat(["v60 " + rep("o2 a16", 16).join(" "), "v78 " + rep("o2 a16 o3 e16", 8).join(" ")]),
      brass: rep("z", 6).concat([M("v64 C#4+E4+G4+Bb4:16"), "v90 " + CLIMB]),
      lead: ["@glass z", "z", "z"].concat(dly(SUN(86, { invert: true }), 70), ["z", "z"]),
      // r1 S4/S10: a soft 3+3+2 pulse on the pedal instead of a sub held for four bars
      bass: [M("v72 D2:3 D2:3 D2:2 D2:3 D2:3 D2:2"), M("D2:3 D2:3 D2:2 D2:3 D2:3 D2:2"), M("D2:3 D2:3 D2:2 D2:3 D2:3 D2:2"), M("D2:3 D2:3 D2:2 D2:3 D2:3 D2:2"),
        M("v76 G1:3 G1:3 G1:2 F1:3 F1:3 F1:2"), M("C2:3 C2:3 C2:2 C2:3 C2:3 C2:2"), "v80 " + M(rep("A1:2", 8).join(" ")), M("v88 A1:2 A1:2 A2:2 A1:2 Bb1:2 A1:2 C#2:2 E2:2")],
      timp: B(M("v76 D2:4 v56 D2:4 v64 D2:4 v56 D2:4 | v72 D2:4 v54 D2:4 v62 D2:4 v54 D2:4 | v76 D2:4 v56 D2:4 v64 D2:4 v56 D2:4 | v72 D2:4 v54 D2:4 v62 D2:4 v56 D2:4 |" +
        " v74 G2:4 v56 G2:4 v66 F2:4 v56 F2:4 | v74 C3:4 v56 C3:4 v64 C3:4 v56 C3:4 |")).concat([M("A2:4 r:4") + " " + roll("A2", 16, 45, 70), roll("A2", 32, 70, 100)]),
      drums: lk("HB HB HB HB HB2 HB2 C7 C8"),
      ragekit: [...rep(LK.RK, 7), LK.RKF],
    },
    D: {
      organ: dly([ORG_DR, ORG_DR, M("C#3+E3+G3+Bb3:16"), ORG_DR, ...ORG_SH(3), ORG_DR, M("C#3+E3+G3+Bb3:16")], 72),
      choir: dly([CH_DR, CH_DR, M("E3+C#4:16"), CH_DR, ...CH_SH(3), CH_DR, M("C#4+E4+G4:16")], 78),
      strings: dly([ost16(38), ost16(38), in16(FDOM, 12), ost16(38), ost16(41), ost16(41), ost16(38), in16(F16, 12)], 86),
      brass: dly(SH(62, "mask"), 98).concat([SB], SH(65), [SB, CLIMB]),
      lead: dly(SH(74, "mask"), 94).concat(B(M("A5:6 B5:2 Bb5:4 G5:4 |")), SH(77), B(M("F5:8 E5:4 G5:4 | A5:8 Bb5:4 C#6:4! |"))),
      bass: dly([ostB(38), ostB(38), figBar(FDOM), ostB(38), ostB(41), ostB(41), ostB(38), figBar(F16)], 90),
      timp: B(M("v90 D2:4! r:12 | D2:3 r:8 E2:3 r:2 | A2:4 r:4 A2:4 r:4 | D2:3 r:8 E2:3 r:2 | F2:4! r:12 | F2:3 r:8 G2:3 r:2 | D2:4 r:12 |")).concat([M("A2:4 r:4") + " " + roll("A2", 16, 60, 100)]),
      drums: lk("C G G F G G2 G F2"),
      ragekit: [...rep(LK.RK, 7), LK.RKF],
    },
  };
  for (const s in lastParts) {
    const p = lastParts[s];
    p.rage = ["k12 " + p.choir[0]].concat(p.choir.slice(1));   // the choir an octave higher
    for (const k in p) p[k] = J(p[k]);
  }
  SONG.add("lastboss", {
    bpm: 165, meter: "4/4", key: "D minor", instant: true, memory: false, gain: -3.3,
    echo: { len: "8", fb: 0.3, mix: 0.2, lp: 2800, hp: 300 },
    verb: { sec: 2.4, mix: 0.24, lp: 5000 },
    layers: { rage: false },
    chans: [
      { name: "lead", inst: "trumpet", pan: 0.05, vol: 0.68, echo: 0.2, verb: 0.3 },
      { name: "brass", inst: "brass", pan: 0.22, vol: 0.6, verb: 0.3 },
      { name: "organ", inst: "organ", pan: -0.42, vol: 0.4, verb: 0.45 },
      { name: "choir", inst: "choir", pan: 0.38, vol: 0.5, verb: 0.5 },
      { name: "strings", inst: "strings", pan: -0.25, vol: 0.46, verb: 0.25, env: [0.01, 0.15, 0.75, 0.1] },
      { name: "bass", inst: "pickbass", pan: 0, vol: 0.78, verb: 0.05 },
      { name: "timp", inst: "timpani", pan: -0.1, vol: 0.6, verb: 0.35 },
      { name: "rage", inst: "choir", layer: "rage", pan: -0.38, vol: 0.42, verb: 0.55 },
      { name: "drums", inst: "kit", vol: 0.72, verb: 0.15 },
      { name: "ragekit", inst: "kit", layer: "rage", pan: 0.2, vol: 0.4, verb: 0.1 },
    ],
    parts: lastParts,
    intro: ["I"],
    loop: ["A", "B", "C", "D"],
  });

  // ============================================================
  // Stingers
  // st_victory: after a boss falls (E major, the boss's E minor turned bright). A rising 3+3+2
  //   figure E F# A over Am - B7 - Esus4, the A falling to G# over the E major chord (a 4-3
  //   suspension) with bells. 2 bars at 144 BPM = 3.3 s (+ 0.5 s ring).
  // st_dungeon: entering a dungeon (with the name banner). The Sunstone's three-note shard
  //   (D E A, short-short-long) on bells over an open D-A fifth: the shard waiting inside.
  //   1 bar at 80 BPM = 3.0 s. Both pause the track underneath and let it go on afterwards.
  // ============================================================
  SONG.add("st_victory", {
    stinger: true, hold: "pause", tail: 0.6, bpm: 144, meter: "4/4", key: "E major", gain: -3.2,
    chans: [
      { name: "lead", inst: "trumpet", pan: 0.05, vol: 0.75, verb: 0.3, env: [0.02, 0.22, 0.85, 0.7] },
      { name: "horn", inst: "horn", pan: -0.3, vol: 0.6, verb: 0.35, env: [0.07, 0.35, 0.85, 0.9] },
      { name: "brass", inst: "brass", pan: 0.3, vol: 0.55, verb: 0.3, env: [0.04, 0.3, 0.8, 0.8] },
      { name: "strings", inst: "strings", pan: -0.45, vol: 0.45, verb: 0.4, env: [0.18, 0.4, 0.9, 1.2] },
      { name: "bass", inst: "pickbass", pan: 0, vol: 0.75 },
      { name: "timp", inst: "timpani", pan: -0.1, vol: 0.62, verb: 0.3 },
      { name: "bells", inst: "bells", pan: 0.45, vol: 0.4, verb: 0.45 },
      { name: "drums", inst: "kit", vol: 0.66, verb: 0.2 },
    ],
    parts: {
      V: {
        lead: M("v92 E5:6! F#5:6 A5:4 | G#5:16~_ |"),
        horn: M("v80 C5:6 A4:6 B4:4 | B4:16_ |"),
        brass: M("v88 A3+C4+E4:6 A3+B3+D#4+F#4:6 A3+B3+E4:4! | G#3+B3+E4+G#4:16_ |"),
        strings: M("v80 A2+E3+A3:6 B2+F#3+B3:6 E3+B3+E4:4 | E2+B2+G#3+E4:16_ |"),
        bass: M("v88 A1:6! B1:6 E2:4! | E1:16 |"),
        timp: M("v90 A2:6! B2:6 E2:4! |") + " " + roll("E2", 8, 60, 90) + " " + M("E2:4! r:8 |"),
        bells: M("z | v84 E5+B5:16 |"),
        drums: "{K C}8! r8 r8 {K S}8 r8 r8 {K S}4! | {K C}4! r2. |",
      },
    },
    intro: ["V"],
  });
  SONG.add("st_dungeon", {
    stinger: true, hold: "pause", tail: 0.4, bpm: 80, meter: "4/4", key: "D minor", gain: 1.6,
    chans: [
      { name: "bells", inst: "bells", pan: 0.2, vol: 0.62, verb: 0.5, echo: 0.25 },
      { name: "horn", inst: "horn", pan: -0.35, vol: 0.5, verb: 0.45, env: [0.07, 0.35, 0.85, 1.0] },
      { name: "strings", inst: "strings", pan: 0.4, vol: 0.45, verb: 0.5, env: [0.25, 0.5, 0.9, 1.3] },
      { name: "glass", inst: "glass", pan: 0.5, vol: 0.35, verb: 0.55, echo: 0.3, env: [0.12, 0.8, 0.7, 1.2] },
      { name: "timp", inst: "timpani", pan: -0.15, vol: 0.55, verb: 0.4 },
    ],
    parts: {
      E: {
        bells: M("r:4 v88 D5:2 E5:2 A5:8 |"),           // the Sunstone "fragment": short, short, LONG
        horn: M("v72 D3+A3:16_ |"),
        strings: M("v70 D2+A2+E4:16_ |"),
        glass: M("r:8 v70 A5+E6:8_ |"),
        timp: roll("D2", 8, 35, 70) + " " + M("D2:2! r:10 |"),
      },
    },
    intro: ["E"],
  });
})();
