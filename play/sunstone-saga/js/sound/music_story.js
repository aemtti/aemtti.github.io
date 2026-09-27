"use strict";
// ---------- Story music: title, ending, credits, record page, game over, Maren's voice ----------
// All melodies here are newly written for this game. The Sunstone motif (music_motifs.js) is
// stated as a question in the title, answered for the first time in the ending (its high
// tonic), sung in minor at game over and grows a step with each shard in the voice scenes.
// Key plan: the story tonic is D (title, ending, credits close, voice, game over in D minor).
// Notation and instruments: tools/sound_format.md. Motifs: tools/sound_motifs.md.
// References used (principles only): review/_audio/refs/story.md.
(function () {
  // A roll or swell: n strokes of one note or drum letter, velocity v0 -> v1.
  function roll(note, n, len, v0, v1) {
    const out = [];
    for (let i = 0; i < n; i++) out.push("v" + Math.round(v0 + (v1 - v0) * i / Math.max(1, n - 1)) + " " + note + len);
    return out.join(" ");
  }

  // =========================================================================================
  // TITLE (MUS-03): 12 bars played once (logo 3 bars = 10.0 s, story scroll 9 bars = 30 s),
  // then a calm 16-bar loop (53 s). D major, 72 BPM, 4/4, hymn-like.
  //   I  logo: choir + bells swell (the bells toll D E | A, the motif's first notes slowly),
  //      horn states the Sunstone question (D E | A. B G. F# | E), flute answers a fifth up.
  //   S  story: quiet strings + celesta. Light (bar 4), the stone breaks (bar 5: six falling
  //      celesta notes, the Shadow motif in the low horn and bass), Maren taken (bars 7-8:
  //      the motif in minor on celesta), the wanderer sets out (bars 9-10: the village cell in
  //      D Lydian on flute), the call to gather the shards (bars 11-12: the three-note
  //      fragment rising a step, horn then flute) into the loop.
  //   A  loop 1: the motif on flute with the "wistful" chords and a new answering phrase.
  //   B  loop 2: a new horn melody with a celesta counter-line; ends on A7sus4 so the loop
  //      turns back to Bm7 (a soft deceptive cadence), never to the high tonic (kept for the ending).
  // =========================================================================================
  SONG.add("title", {
    bpm: 72, meter: "4/4", key: "D", gain: 5,
    echo: { len: "16", fb: 0.3, mix: 0.2, lp: 2600 },
    verb: { sec: 2.2, mix: 0.3, lp: 5500 },
    chans: [
      { name: "horn", inst: "horn", pan: 0.05, vol: 0.8, oct: 4, vib: true, echo: 0.1, verb: 0.35 },
      { name: "flute", inst: "flute", pan: 0.28, vol: 0.6, oct: 5, vib: true, echo: 0.2, verb: 0.35 },
      { name: "strings", inst: "strings", pan: -0.3, vol: 0.55, oct: 3, q: 100, verb: 0.4 },
      { name: "choir", inst: "choir", pan: 0.38, vol: 0.4, oct: 4, q: 100, verb: 0.5 },
      { name: "harp", inst: "harp", pan: -0.55, vol: 0.5, oct: 3, len: "8", echo: 0.25, verb: 0.35 },
      { name: "cel", inst: "celesta", pan: 0.55, vol: 0.5, oct: 5, echo: 0.35, verb: 0.4 },
      { name: "bass", inst: "strings", pan: -0.08, vol: 0.6, oct: 2, q: 100, verb: 0.3 },
      { name: "timp", inst: "timpani", pan: 0.15, vol: 0.6, oct: 2, verb: 0.35 },
      { name: "kit", inst: "kit", pan: 0, vol: 0.5, verb: 0.4 },
    ],
    parts: {
      I: {
        horn: "r2. v78 d8 e8 | a4. b8 g4. f#8 | e1 |",
        flute: "r1 | v55 a4. b8 g4. f#8 | v58 e4 r8 a8 b8 > e4. |",
        strings: "v38 {d a > e}2 v48 {d a > f#}2 | v62 {a > d f#}2 {b > d g}2 | {a > d e}2 {a > c# e}4 {g > c# e}4 |",
        choir: "r4 v34 {a > d}2. | v52 {a > d}2 {b > d}2 | {a > e}2 {a > c# e}2 |",
        harp: "r4 v46 l16 o2 d a > d f# a > d f# a > d f# a > d | v54 l8 o3 d a > d f# < g b > d g | o2 a > e a > c# e c# < a e |",
        cel: "@bells o4 v56 d2 e2 | v64 a1 | r1 |",
        bass: "v45 d1 | v60 d2 g4 e4 | a2. g4 |",
        timp: "r2 " + roll("a", 16, 32, 16, 62) + " | v85 d4 r2. | v52 a4 r2. |",
        kit: "r2 " + roll("C", 8, 16, 6, 34) + " | v60 C4 r2. | z |",
      },
      S: {
        horn: "r1 | o3 v50 d2 f4 b4& | b4 b-4 e2 | z3 | r2. o4 v62 d8 e8 | a2. r4 | r2 d4 c#4 |",
        flute: "z4 | r2 r8 v52 c#8 d8 e8 | a4 f#8 g#8 f#4 e4 | b2 a4 r4 | r2. e8 f#8 | b2 r4 d8 e8 |",
        strings: "v48 {a > d f#}2 {b > d g}2 | v52 {a > d f}2. {g > d f}4 | {g > d f}4 {g > d g}4 {g > c# a}2 | " +
          "v46 {f > d a}2 {f > d b-}2 | {e > c# a}2 {e g > c#}2 | v50 {f# a > d}1 | {g# b > e}2 {f# a > d}2 | " +
          "v54 {a > c# e}2 {b > d g}2 | v58 {b > d g}2 {a > d g}4 {a > c# g}4 |",
        choir: "z3 | v38 {d a}2 {d b-}2 | {c# a}1 | v42 {f# a}1 | {g# b}2 {f# a}2 | v48 {a > c#}2 {b > d}2 | v55 {b > d}2 {a > d}4 {a > c#}4 |",
        harp: "v42 o2 f# a o3 d f# o2 g b o3 d g | r1 | r1 | v40 o2 b- o3 f a o4 d o2 g o3 d f b- | " +
          "o2 a o3 e a o4 c# o2 a o3 e g o4 c# | v45 o3 d a o4 d f# g# f# d o3 a | o3 d b o4 e g# o3 d a o4 d f# | " +
          "v48 o2 f# o3 c# e a o2 g o3 d g b | o2 e o3 b o4 d g o2 a o3 e g o4 c# |",
        cel: "v50 o6 f#4 a8 f#8 d4 < b8 > d8 | v55 l16 o6 d < a f d < a f r8 r2 | l8 r2. o5 d8 e8 | a4. b-8 g4. f8 | e2. r4 | r1 | " +
          "r2 o6 a8 f#8 g#8 f#8 | r1 | r2 l16 o5 e a > c# e a > c# e a |",
        bass: "v50 f#2 g2 | v55 d2 f4 b4& | b4 b-4 e2 | v48 b-2 g2 | a1 | v45 d1 | d1 | v50 f#2 g2 | e2 a2 |",
        timp: "r1 | v70 d4 r2. | z6 | r2 v38 a4 a4 |",
        kit: "r1 | v44 C4 r2. | z7 |",
      },
      A: {
        flute: "v58 a4. b8 g4. f#8 | e2. f#8 a8 | > c#4. < b8 a4 f#4 | g4. f#8 e2 | d4 g8 a8 b4 g4 | a2 f#8 g8 a8 f#8 | g4. f#8 e4 c#4 | d2. r4 |",
        strings: "v46 {a > d f#}2 {g > d e}2 | {g > d e}2 {g > c# e}2 | {a > c# e}1 | {g b > d}2 {g > c# e}2 | " +
          "{f# b > d}2 {g b > d}2 | {f# a > d}1 | {g b > d}2 {g > c# e}2 | {f# > d f#}1 |",
        choir: "z4 | v34 {b > d}1 | {a > d}1 | {b > d}2 {> c# e}2 | {a > d}1 |",
        harp: "v40 o2 b o3 f# a o4 d o3 e b o4 d g | o2 a o3 e g o4 d o2 a o3 e g o4 c# | o2 f# o3 c# e a o4 c# o3 a e c# | " +
          "o2 e b o3 d g o2 a o3 e g o4 c# | o2 g o3 d f# b o2 e b o3 d g | o2 f# o3 d a o4 d o2 b o3 f# a o4 d | " +
          "o2 e b o3 d g o2 a o3 e g o4 c# | o2 d a o3 d f# a o4 d o3 a f# |",
        bass: "v48 b2 e2 | a2 a4 g4 | f#1 | e2 a2 | g2 e2 | f#2 b2 | e2 a2 | d1 |",
      },
      B: {
        // bar 2: A. B E A (horn-call fifth and fourth): A-B-A-F# was a famous carol's opening cell;
        // G-E / C#-F# / F#-A here joined bar 3 into a lullaby turn, a film song or a carol chorus
        horn: "v64 b4 a8 b8 > d4. c#8 | < a4. b8 e4 a4 | d4. e8 f#4 a4 | g2. r4 | b4 a8 b8 > d4. c#8 | < a4 > c#8 < b8 > d2 | c#4. < a8 b4 g4 | f#2 e2 |",
        flute: "z7 | r2. v55 d8 e8 |",
        strings: "v48 {g b > f#}1 | {a > c# e}1 | {a > d f#}1 | {b > d e}2 {g > d e}2 | {g b > f#}1 | {a > c# e}2 {a > d f#}2 | " +
          "{a > c# e}2 {g b > e}2 | {a > d f#}2 {g > d e}2 |",
        choir: "z4 | v34 {b > d}1 | {a > c#}2 {a > d}2 | {a > c#}2 {g b}2 | {a > d}2 {a > d}2 |",
        harp: "v40 o2 g o3 d f# b o4 d o3 b f# d | o2 g o3 c# e a o2 f# o3 c# e a | o2 b o3 f# a o4 d o2 a o3 f# a o4 d | " +
          "o2 g o3 e b o4 d o2 a o3 e g o4 d | o2 g o3 d f# b o4 d f# d o3 b | o2 g o3 c# e a o2 b o3 f# a o4 d | " +
          "o2 f# o3 c# e a o2 e b o3 d g | o2 f# o3 d f# a o2 a o3 e g o4 d |",
        cel: "z2 | v46 o6 f#4 d4 < a4 b4 | g4 b8 a8 e4 d8 e8 | z2 | e4 f#4 a4 b4 | > d4 c#8 < a8 r2 |",
        bass: "v48 g1 | g2 f#2 | b2 a2 | g2 a2 | g1 | g2 b2 | f#2 e2 | f#2 a2 |",
      },
    },
    intro: ["I", "S"],
    loop: ["A", "B"],
  });

  // =========================================================================================
  // ENDING (MUS-10): 16 s once, then a 2-bar hold. D major, 90 BPM, 3/4 (the hymn in triple
  // time: bar = 2 s, so the picture's phases fall on bar lines).
  //   R  "rise" (bars 1-2 = 4.0 s): the three-note fragment climbs by steps on celesta
  //      (D E A, E F# B, F# G C#, G A D) over a choir swell; timpani and cymbal roll; the horn's
  //      pickup D E leads into the fuse.
  //   W  "dawn" (bars 3-8 = 12 s): crash + timpani + bells on the fuse, and the Sunstone motif
  //      complete for the first time in the game (horn, flute an octave up, strings join in
  //      octaves for the answer); its high tonic D arrives at 14.0 s and is held.
  //   H  hold loop: the tonic chord sustained (horn and flute tied, harp turning), waits
  //      for the credits. fadeOut 1.45 s: credits start 0.45 s after the call, so the two
  //      overlap for 1.0 s in the same key.
  // =========================================================================================
  SONG.add("ending", {
    bpm: 90, meter: "3/4", key: "D", fadeOut: 1.45, memory: false,
    echo: { len: "16", fb: 0.28, mix: 0.18, lp: 2800 },
    verb: { sec: 2.4, mix: 0.3, lp: 6000 },
    chans: [
      { name: "horn", inst: "horn", pan: 0, vol: 0.85, oct: 4, vib: true, echo: 0.1, verb: 0.35 },
      { name: "flute", inst: "flute", pan: 0.3, vol: 0.55, oct: 5, vib: true, echo: 0.15, verb: 0.35 },
      { name: "strings", inst: "strings", pan: -0.3, vol: 0.58, oct: 3, q: 100, verb: 0.4 },
      { name: "choir", inst: "choir", pan: 0.38, vol: 0.48, oct: 4, q: 100, verb: 0.5 },
      { name: "cel", inst: "celesta", pan: 0.55, vol: 0.5, oct: 5, echo: 0.3, verb: 0.4 },
      { name: "harp", inst: "harp", pan: -0.55, vol: 0.5, oct: 3, len: "8", echo: 0.2, verb: 0.35 },
      { name: "bass", inst: "strings", pan: -0.05, vol: 0.62, oct: 2, q: 100, verb: 0.3 },
      { name: "timp", inst: "timpani", pan: 0.15, vol: 0.65, oct: 2, verb: 0.35 },
      { name: "kit", inst: "kit", pan: 0, vol: 0.55, verb: 0.4 },
    ],
    parts: {
      R: {
        cel: "l8 v44 d e a v48 e f# b | v54 f# g > c# v60 < g a > d |",
        horn: "r2. | r4 r4 v76 d8 e8 |",
        choir: "v32 {d a}2. | v44 {e a}2. |",
        strings: "v34 {d a > e}2. | v46 {f# a > c#}2 {e g > c#}4 |",
        harp: "r2. | r4 v40 l24 o3 a > c# e g a > c# e g a > c# e g |",
        bass: "v42 d2. | v50 f#2 a4 |",
        timp: "r2. | " + roll("a", 24, 32, 18, 72) + " |",
        kit: "r2. | " + roll("C", 12, 16, 5, 36) + " |",
      },
      W: {
        horn: "v86 a2 b4 | g2 f#4 | e2 d8 e8 | a2 b4 | > d2 c#4 | d2. |",
        flute: "v60 a2 b4 | g2 f#4 | e2 d8 e8 | a2 b4 | > d2 c#4 | d2. |",
        strings: "v60 {f# a > d}2 {g b > d}4 | {g b > d}2 {f# a > d}4 | {g b > e}2 {g > c# e}4 | " +
          "o4 v68 {a > a}2 {b > b}4 | {> d > d}2 {> c# > c#}4 | o3 v66 {a > d f# a}2. |",
        choir: "v58 {a > d f#}2 {b > d g}4 | {b > d g}2 {a > d f#}4 | {b > d e}2 {g > c# e}4 | " +
          "v64 {g b > d}2 {g b > e}4 | {f# a > d}2 {g a > c# e}4 | v70 {f# a > d f#}2. |",
        cel: "@bells o5 v70 {d a}2 r4 | r2. | v55 e2 r4 | r2. | r2. | v76 {d a > d}2. |",
        harp: "v48 o2 d a o3 d f# o2 b o3 g | o2 g o3 d g b o2 f# o3 d | o2 e b o3 d g o2 a o3 g | " +
          "o2 g o3 d a b o2 e o3 b | o2 a o3 d f# a o2 a o3 g | v52 o2 d a o3 d f# a o4 d |",
        bass: "v65 d2 b4 | g2 f#4 | e2 a4 | g2 e4 | a2 a4 | d2. |",
        timp: "v95 d4 r2 | r2. | r2. | r2. | v55 a4 r4 " + roll("a", 8, 32, 40, 78) + " | v92 d4 r2 |",
        kit: "v85 C4 r2 | r2. | r2. | r2. | r2. | v68 C4 r2 |",
      },
      H: {
        horn: "v58 f#2.& | f#2. |",
        flute: "v43 a2.& | a2. |",
        strings: "v60 {d a > d f#}2. | {d a > d f#}2. |",
        choir: "v55 {f# a > d}2. | {f# a > d}2. |",
        harp: "v48 o3 d a o4 d e f# a | o5 d o4 a f# e d o3 a |",
        cel: "r2. | r4 v34 o6 d8 e8 a4 |",
        bass: "v58 d2. | d2. |",
      },
    },
    intro: ["R", "W"],
    loop: ["H"],
  });

  // =========================================================================================
  // CREDITS (MUS-11): a 64 s medley played once, 120 BPM, 4/4 (bar = 2 s), timed to the
  // 65 s roll (music starts 0.45 s after the call), then the record-page loop.
  //   I  bars 1-2   D, the ending's chord (1 s crossfade), turning to D7 -> G
  //   F  bars 3-10  field: the Hero call (trumpet, G Mixolydian), again in plain major with
  //                 the flute an octave up, a new answering phrase, then the band thins out
  //   U  bars 11-16 a quiet dungeon passage: E minor, marimba 3+3+2 ostinato, oboe, glass,
  //                 pizzicato bass, hand drum and rim, celesta drips
  //   V  bars 17-24 the village tune (C Lydian, re-barred into 4/4 at the same pace), horn
  //                 counter-line; D/C -> G/B -> A7 turns home to D
  //   S  bars 25-30 the Sunstone motif complete with the "wistful" chords (horn + flute
  //                 octave), a coda that leans on G minor (a last look back)
  //   E  bars 31-32 the final D chord (lands at 60.0 s of music = 60.45 s of the roll)
  //   R  loop: the record page (8 bars, harp + strings + celesta, no drums), then R2 (8 bars,
  //      a flute answer over the same chords; r1 P9), so the loop is 16 bars = 32 s
  // =========================================================================================
  const CREDIT_CHANS = [
    { name: "lead", inst: "horn", pan: 0.05, vol: 0.78, oct: 4, vib: true, echo: 0.12, verb: 0.3 },
    { name: "counter", inst: "flute", pan: 0.3, vol: 0.55, oct: 5, vib: true, echo: 0.2, verb: 0.3 },
    { name: "strings", inst: "strings", pan: -0.3, vol: 0.5, oct: 3, q: 100, verb: 0.35 },
    { name: "brass", inst: "brass", pan: 0.4, vol: 0.5, oct: 3, verb: 0.3 },
    { name: "harp", inst: "harp", pan: -0.5, vol: 0.5, oct: 3, len: "8", echo: 0.25, verb: 0.3 },
    { name: "bass", inst: "pickbass", pan: 0, vol: 0.72, oct: 2, verb: 0.15 },
    { name: "choir", inst: "choir", pan: 0.2, vol: 0.45, oct: 4, q: 100, verb: 0.45 },
    { name: "timp", inst: "timpani", pan: 0.15, vol: 0.6, oct: 2, verb: 0.3 },
    { name: "kit", inst: "kit", pan: 0, vol: 0.6, verb: 0.2 },
  ];
  // The record page: Dmaj7 | Gmaj7/D | Dmaj7 | Gmaj7/D | Bm7 | Em9 | Gmaj7 | A7sus4, the
  // three-note fragment once on celesta and a slow answer; harp in quarter notes, the low
  // strings in half notes.
  const RECORD = {
    counter: "@celesta v76 r2. o5 d8 e8 | a2. r4 | r2 f#4 e4 | d2. r4 | r4 b4 > d4 c#4 | e2 d4 < b4 | a2 f#2 | e2. r4 |",
    harp: "l4 v73 o2 d o3 a o4 c# f# | o2 d o3 g b o4 f# | o2 d o3 a o4 c# f# | o2 d o3 g b o4 f# | " +
      "o2 b o3 f# a o4 d | o2 e o3 b o4 d f# | o2 g o3 d f# b | o2 a o3 e g o4 d |",
    strings: "v67 {a > c# f#}1 | {g b > f#}1 | {a > c# f#}1 | {g b > f#}1 | {a > d f#}1 | {g b > d f#}1 | {f# b > d}1 | {g > d e}1 |",
    // bowed bass re-bowed on beats 1 and 3 (half notes): a held whole note let the string
    // sample's own slow swell set a false pulse (tempo read 76.5 instead of 120)
    bass: "@strings q100 v71 d2 d2 | d2 d2 | d2 d2 | d2 d2 | b2 b2 | e2 e2 | g2 g2 | a2 a2 |",
  };
  // Second pass of the record loop (review r1 P9: 8 bars = 16 s was too short to leave running):
  // the same eight chords, the flute sings a new answer (chord tones on the strong beats), the
  // harp breaks each chord in 8ths up and back, the strings a little softer. Loop R R2 = 32 s.
  const RECORD2 = {
    counter: "@flute v58 o5 a2. f#8 a8 | b2 a4 e4 | f#2 e4 d4 | e2. r4 | r4 d4 f#4 a4 | b2 a4 g4 | d2 b2 | a2 e4 r4 |",
    harp: "l8 v64 o2 d o3 a o4 c# f# a f# c# o3 a | o2 d o3 g b o4 d f# d o3 b g | o2 d o3 a o4 c# f# a f# c# o3 a | o2 d o3 g b o4 d f# d o3 b g | " +
      "o2 b o3 f# a o4 d f# d o3 a f# | o2 e o3 b o4 d f# g f# d o3 b | o2 g o3 d f# b o4 d o3 b f# d | o2 a o3 e g o4 d e d o3 g e |",
    strings: "v60 {a > c# f#}1 | {g b > f#}1 | {a > c# f#}1 | {g b > f#}1 | {a > d f#}1 | {g b > d f#}1 | {f# b > d}1 | {g > d e}1 |",
    bass: "@strings q100 v68 d2 d2 | d2 d2 | d2 d2 | d2 d2 | b2 b2 | e2 e2 | g2 g2 | a2 a2 |",
  };
  const CREDIT_KIT_RUN = "l8 v42 Z Z? Z Z? {Z R} Z? Z Z? |";
  SONG.add("credits", {
    bpm: 120, meter: "4/4", key: "D", gain: 1.5,
    echo: { len: "8", fb: 0.28, mix: 0.2, lp: 3000 },
    verb: { sec: 1.4, mix: 0.25, lp: 6500 },
    chans: CREDIT_CHANS,
    parts: {
      I: {
        counter: "v40 a1 | a2 r2 |",
        strings: "v44 {d a > d f#}1 | v50 {c a > d f#}1 |",
        choir: "v40 {f# a > d}1 | {f# a > c}1 |",
        harp: "v40 o3 d a o4 d f# a o5 d o4 a f# | o3 c a o4 d f# o3 c a o4 d f# |",
        bass: "v50 d2 r2 | c2 r2 |",
        timp: "r1 | r2 " + roll("d", 16, 32, 20, 70) + " |",
        kit: "r1 | r2 " + roll("S", 8, 16, 10, 60) + " |",
      },
      F: {
        lead: "@trumpet o4 v88 g4 > d8 c8 f2 | e4 d8 c8 d2 | < g4 > d8 c8 g2 | e4 d8 c8 d2 | < b4 > e8 f#8 g4 e4 | d4 a4 g2 | " +
          "g4. f#8 e4 c4 | < a4. g8 f#4 d#4 |",
        counter: "z2 | o5 v52 g4 > d8 c8 g2 | e4 d8 c8 d2 | < b4 > e8 f#8 g4 e4 | d4 a4 g2 | o6 v44 e2 c2 | c2 < b2 |",
        strings: "v52 {g b > d}2 {f a > c}2 | {g > c e}2 {g b > d}2 | {g b > d}2 {g > c e}2 | {g > c e}2 {f# a > d}2 | " +
          "{g b > e}2 {g > c e}2 | {f# a > d}2 {g b > d}2 | v46 {g b > e}2 {g > c e}2 | {a > c e}2 {a b > d#}2 |",
        brass: "l8 v62 r {g b > d}' r {g b > d}' r {f a > c}' r {f a > c}' | r {g > c e}' r {g > c e}' r {g b > d}' r {g b > d}' | " +
          "r {g b > d}' r {g b > d}' r {g > c e}' r {g > c e}' | r {g > c e}' r {g > c e}' r {f# a > d}' r {f# a > d}' | " +
          "r {g b > e}' r {g b > e}' r {g > c e}' r {g > c e}' | {f# a > d}4' r8 {f# a > d}8' {g b > d}4 r4 | z2 |",
        harp: "z | r2. l32 v44 o3 g b > d g b > d g b | z3 | r2. l32 o3 g b > d g b > d g b | " +
          "l8 v42 o2 c g o3 e b o2 a o3 e g o4 c | o2 f# o3 c e a o2 b o3 d# f# a |",
        bass: "v70 g4 b4 f4 a4 | c4 e4 g4 b4 | g4 b4 a4 > c4 | < c4 e4 d4 f#4 | e4 d4 c4 e4 | d4 f#4 g4 d4 | c4 e4 a4 g4 | f#4 a4 b4 f#4 |",
        choir: "z6 | v36 {g b > e}2 {g > c e}2 | {a > c e}2 {a b > d#}2 |",
        timp: "v80 g4 r2. | z | v70 g4 r2. | r2 d4 d4 | v68 e4 r2. | d4 r4 g4 r4 | z2 |",
        kit: "l8 v78 {K C} H {S H} H {K H} H {S H} H | {K H} H {S H} H {K H} {K H} {S H} O | {K C} H {S H} H {K H} H {S H} H | " +
          "{K H} H {S H} H l16 T T M M L L S S | l8 {K C} H {S H} H {K H} H {S H} H | {K H} H {S H} H {K H} {K H} {S H} O | " +
          "v52 K4 R4 r8 K8 R4 | K4 R4 r4 l16 R? R? R R |",
      },
      U: {
        lead: "@oboe o4 v82 r4 b4 > e4 f#8 g8 | g2 e4 < b4 | > c4. d8 e4 a4 | a4. g8 f#4 d#4 | e2. r4 | r1 |",
        counter: "z | @celesta v47 r2 r8 o6 b8 r4 | r1 | r4 o6 f#8 r8 r2 | r2 r8 o6 g8 r4 | r2. o6 e8 r8 |",
        brass: "@glass o4 v47 {g b > e}1 | {g b > e}1 | {g > c e}1 | {a > c e}2 {a b > d#}2 | {g b > e}1 | {g > c e}1 |",
        harp: "@marimba v58 o3 e b o4 g o3 e b o4 f# o3 e b | o3 c g o4 e o3 c g o4 d o3 c g | o2 a o3 e o4 c o2 a o3 e b o2 a o3 e | " +
          "o3 f# o4 c e o3 f# o4 c o2 b o3 f# o4 d# | o3 e b o4 g o3 e b o4 f# o3 e b | o3 c g o4 e o3 c g o4 e o3 c g |",
        bass: "@pizz o2 v70 e4 r4 b4 r4 | o3 c4 r4 o2 g4 r4 | a4 r4 e4 r4 | f#4 r4 b4 r4 | e4 r4 b4 r4 | o3 c4 r4 o2 g4 r4 |",
        timp: "v56 e4 r2. | z | v52 a4 r2. | r2 b4 r4 | v56 e4 r2. | z |",
        kit: "v49 D4 R4 r8 D8 R4 | D4 R4 r8 D8 R4 | D4 R4 r8 D8 R4 | D4 R4 D8 D8 R4 | D4 R4 r8 D8 R4 | D4 R4 l16 D D R R D D R R |",
      },
      V: {
        counter: "o5 v76 g4 e8 f#8 e2 | d4 a2. | g1 | > e4 c8 d8 < b2 | a4 f#4 d2 | c1 | d4 e8 f#8 a2 | g2 r2 |",
        lead: "z3 | o4 v64 e4 f#4 g2 | a2 b4 a4 | g1 | r1 | r2. v78 d8 e8 |",
        strings: "v56 {g b > e}1 | {f# a > d}1 | {g > d e}1 | {g b > d}1 | {f# a > d}1 | {g > c e}1 | {f# a > d}1 | {g b > d}2 {g a > d}4 {g a > c#}4 |",
        harp: "v58 o2 c g o3 e b o4 c o3 b g e | o2 c a o3 d f# a o4 d o3 a f# | o2 c g o3 d e g o4 d o3 g e | " +
          "o2 e b o3 d g b o4 d o3 b g | o2 f# o3 d f# a o4 d o3 a f# d | o2 c g o3 c e g o4 c o3 g e | " +
          "o2 c a o3 d f# a o4 d o3 a f# | o2 b o3 d g b o2 a o3 e g o4 c# |",
        bass: "v72 c2 e2 | c1 | c2 g2 | e2 d2 | f#2 a2 | c2 e2 | c1 | < b2 a2 |",
        timp: "z7 | r2 v50 a4 a4 |",
        kit: "[" + CREDIT_KIT_RUN + "]7 l8 Z Z? Z Z? v48 l16 T T M M L L S S |",
      },
      S: {
        lead: "o4 v86 a4. b8 g4. f#8 | e2. d8 e8 | a4. b8 > d4. c#8 | d1 | < v60 b2 b-2 | a2 g4 e4 |",
        counter: "o5 v60 a4. b8 g4. f#8 | e2. d8 e8 | a4. b8 > d4. c#8 | d1 | @celesta v50 r2. o5 d8 e8 | a2 r2 |",
        strings: "v58 {a > d f#}2 {g > d e}2 | {g > d e}2 {g > c# e}4 {f# a > d}4 | {g b > d}2 {g > d e}4 {g > c# e}4 | " +
          "v64 {f# a > d}1 | v54 {f# b > d}2 {e b- > d}2 | {f# a > d}2 {g > d e}4 {g > c# e}4 |",
        choir: "v50 {f# a > d}2 {g b > e}2 | {a > d e}2 {a > c# e}4 {a > d f#}4 | {b > d}2 {a > d e}4 {a > c# e}4 | " +
          "v58 {f# a > d f#}1 | v48 {f# b > d}2 {e b- > d}2 | {f# a > d}2 {g a > d}4 {g a > c#}4 |",
        brass: "z2 | v50 {g b > d}2 {g > d e}4 {g > c# e}4 | v58 {f# a > d}1 | z2 |",
        harp: "v48 o2 b o3 f# a o4 d o3 e b o4 d g | o2 a o3 e g o4 d o2 a o3 e o2 f# o3 d | o2 g o3 d a b o2 a o3 d o2 a o3 c# | " +
          "o2 d a o3 d f# a o4 d f# a | o2 g o3 d f# b o2 g o3 d e b- | o2 a o3 d f# a o2 a o3 e g o4 c# |",
        bass: "@strings q100 o2 v60 b2 e2 | a2 a4 f#4 | g2 a2 | d1 | g2 g2 | a2 a2 |",
        timp: "z | r2 v60 a4 r4 | v72 g4 r4 a4 a4 | v90 d4 r2. | z | v55 a2 " + roll("a", 16, 32, 30, 75) + " |",
        kit: "l8 v60 {K C} H? H? H? {S H} H? H? H? | {K H} H? H? H? {S H} H? H? H? | {K H} H? H? H? l16 T T M M L L S S | " +
          "v70 {K C}4 r2. | l8 v56 {K H} H? H? H? {S H} H? H? H? | {K H} H? H? H? " + roll("S", 8, 16, 20, 60) + " |",
      },
      E: {
        lead: "o4 v70 d1& | d1 |",
        counter: "@celesta v46 o6 d2 r2 | r1 |",
        strings: "v62 {d a > d f#}1 | v50 {d a > d f#}1 |",
        choir: "v60 {f# a > d f#}1 | v48 {f# a > d f#}1 |",
        brass: "v62 {f# a > d}1 | r1 |",
        harp: "v50 o2 d a o3 d f# a o4 d f# a | l24 o3 d f# a > d f# a > d f# a > d f# a r2 |",
        bass: "@strings q100 o2 v58 d1& | d1 |",
        timp: "v88 d4 r2. | z |",
        kit: "v72 C4 r2. | z |",
      },
      R: RECORD,
      R2: RECORD2,
    },
    intro: ["I", "F", "U", "V", "S", "E"],
    loop: ["R", "R2"],
  });

  // RECORD: the record page's loop on its own (the credits end in it too), for a skipped roll.
  SONG.add("record", {
    bpm: 120, meter: "4/4", key: "D", gain: 1.5,
    echo: { len: "8", fb: 0.28, mix: 0.2, lp: 3000 },
    verb: { sec: 1.4, mix: 0.25, lp: 6500 },
    chans: CREDIT_CHANS.filter(c => RECORD[c.name] != null || RECORD2[c.name] != null),
    parts: { R: RECORD, R2: RECORD2 },
    loop: ["R", "R2"],
  });

  // =========================================================================================
  // GAME OVER (MUS-14): D minor, 72 BPM, 4/4. Two bars once (6.7 s): low strings swell under
  // the music box singing the Sunstone lament shortened (D E A. Bb G F | E. C# D, i - iv -
  // V - i), settling on D at 5.0 s; then a quiet 4-bar loop (13.3 s):
  // Dm | Bbmaj7 | Gm7 | A7 with the fragment on the music box and a low alto-flute sigh.
  // =========================================================================================
  SONG.add("gameover", {
    bpm: 72, meter: "4/4", key: "D minor", gain: 7.5,
    echo: { ms: 230, fb: 0.32, mix: 0.24, lp: 2400 },
    verb: { sec: 2.4, mix: 0.32, lp: 5000 },
    chans: [
      { name: "box", inst: "musicbox", pan: 0.2, vol: 0.7, oct: 5, echo: 0.3, verb: 0.45 },
      { name: "cel", inst: "celesta", pan: 0.5, vol: 0.4, oct: 6, echo: 0.35, verb: 0.5 },
      { name: "strings", inst: "strings", pan: -0.3, vol: 0.55, oct: 3, q: 100, verb: 0.45 },
      { name: "bass", inst: "strings", pan: -0.05, vol: 0.55, oct: 2, q: 100, verb: 0.35 },
      { name: "harp", inst: "harp", pan: -0.5, vol: 0.4, oct: 2, len: "4", verb: 0.4 },
      { name: "afl", inst: "altoflute", pan: 0.35, vol: 0.42, oct: 4, vib: true, verb: 0.5 },
    ],
    parts: {
      G: {
        box: "v72 d8 e8 a4. b-8 g8 f8 | e4. c#8 d2 |",
        strings: "v40 {d a > f}2 v44 {d a > f}4 {d g b-}4 | v46 {c# g > e}2 {d a > f}2 |",
        bass: "v48 d2. g4 | a2 d2 |",
        harp: "v50 d4 r2. | r2 {d a > d f}4 r4 |",
        cel: "r4 r8 v30 a8 r2 | r2 r4 v26 d4 |",
      },
      L: {
        box: "v70 r2. d8 e8 | a2. r4 | r4 b-4 g4 f4 | e2. r4 |",
        strings: "v41 {d a > f}1 | {d a > f}1 | {d b- > f}1 | {c# g > e}1 |",
        bass: "v46 d1 | b-1 | g1 | a1 |",
        harp: "v43 o2 d4 a4 o3 d4 f4 | o2 b-4 o3 f4 a4 o4 d4 | o2 g4 o3 d4 f4 b-4 | o2 a4 o3 e4 g4 o4 c#4 |",
        cel: "r1 | r1 | r2 r4 v31 d4 | c#2 r2 |",
        afl: "r1 | r1 | r2 v46 d2 | c#1 |",
      },
    },
    intro: ["G"],
    loop: ["L"],
  });

  // =========================================================================================
  // VOICE (CR-M2): Maren speaks after each shard. "voice" = after shard 1, "voice_2" ..
  // "voice_6" = after shards 2-6 (hook: Sound.music(n > 1 ? "voice_" + n : "voice")).
  // 66 BPM, 4/4; 1 bar in (pad + pickup), then an 8-bar pp loop (29 s). The motif grows
  // with MOTIFS.sunstone.shardSteps: 1 the fragment (slow, minor), 2 five notes, 3 the whole
  // question in minor, 4 the question in major, 5 the answer begins (stops on B), 6 all but
  // the last note (hangs on C#; the high D is left for the ending). The celesta states it,
  // the harp echoes it an octave lower (from 2 on); the colour brightens step by step:
  // 1 pad + celesta, 2 + harp, 3 + glass, 4 major, harp arpeggios, 5 + choir, 6 + flute.
  // =========================================================================================
  const VOICE_CHANS = {
    pad: { inst: "strings", pan: -0.25, vol: 0.5, oct: 3, q: 100, verb: 0.5 },
    low: { inst: "strings", pan: -0.05, vol: 0.45, oct: 2, q: 100, verb: 0.4 },
    cel: { inst: "celesta", pan: 0.3, vol: 0.55, oct: 5, echo: 0.35, verb: 0.5 },
    harp: { inst: "harp", pan: -0.5, vol: 0.42, oct: 3, len: "8", echo: 0.25, verb: 0.45 },
    air: { inst: "glass", pan: 0.45, vol: 0.32, oct: 5, q: 100, verb: 0.55 },
    choir: { inst: "choir", pan: 0.35, vol: 0.34, oct: 4, q: 100, verb: 0.55 },
    fl: { inst: "flute", pan: 0.18, vol: 0.4, oct: 5, vib: true, echo: 0.2, verb: 0.45 },
  };
  // Harmony frames: minor Dm | Bbmaj7 Gm7 | Asus4 A | Dm | Dm/C | Bbmaj7 Gm7 | Asus4 A | Gm7 | A7sus4 A7
  // (the loop turns A7 -> Bbmaj7, a deceptive cadence); major D | Bm7 Em7 | Asus4 A | D | D/C# |
  // Bm7 Em7 | Asus4 A | Gmaj7 | A7sus4 A7 (A7 -> Bm7).
  const MINOR_PAD = "{d a > f}2 {d b- > f}2 | {d a > e}2 {c# a > e}2 | {d a > f}1 | {d a > f}1 | {d a > f}2 {d b- > f}2 | {d a > e}2 {c# a > e}2 | {d b- > f}1 | {d g > e}2. {c# g > e}4 |";
  const MINOR_LOW = "b-2 g2 | a1 | d1 | c1 | b-2 g2 | a1 | g1 | a1 |";
  const MAJOR_PAD = "{f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}2 | {f# a > d}1 | {f# a > d}1 | {f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}2 | {f# b > d}1 | {g > d e}2 {g > c# e}2 |";
  const MAJOR_LOW = "b2 e2 | a1 | d1 | c#1 | b2 e2 | a1 | g1 | a1 |";
  // harp arpeggios (8ths) per chord of the major frame
  const HA = {
    bm_em: "o2 b o3 f# a o4 d o2 e b o3 d g", asus_a: "o2 a o3 e a o4 d o2 a o3 e a o4 c#", d: "o2 d a o3 d f# a o4 d o3 a f#",
    gmaj7: "o2 g o3 d f# b o4 d o3 b f# d", a7: "o2 a o3 e g o4 d o2 a o3 e g o4 c#",
    asus_a_d: "o2 a o3 e a o4 d o2 a o3 e o2 f# o3 d", gadd9: "o2 g o3 d a b o4 d o3 b a d",
    g_asus_a: "o2 g o3 d a b o2 a o3 d o2 a o3 c#", a_pick: "o2 a o3 e a o4 c# e c# d e",
  };
  const STEPS = [
    { // 1: the fragment alone, twice as slow, minor
      gain: 11.5, key: "D minor", pad: ["v36", MINOR_PAD], low: MINOR_LOW,
      cel: ["r2 v46 d4 e4 |", "a2 r2 | r1 | r1 | r2 o4 d4 e4 | a2 r2 | r1 | r1 | r2 o5 d4 e4 |"],
    },
    { // 2: rise and first fall (D E A Bb G), minor; the harp echoes it
      gain: 10.7, key: "D minor", pad: ["v39", MINOR_PAD], low: MINOR_LOW,
      cel: ["r2. v48 d8 e8 |", "a4. b-8 g4. r8 | r1 | r1 | r1 | r1 | r1 | r1 | r2. d8 e8 |"],
      harp: "r1 | v38 o2 a4 o3 e4 a4 o4 e4 | o2 d4 a4 o3 d4 f4 | r2. o4 d8 e8 | a4. b-8 g4. r8 | o2 a4 o3 e4 a4 o4 e4 | o2 g4 o3 d4 f4 b-4 | r1 |",
    },
    { // 3: the whole question, minor; glass air
      gain: 9.8, key: "D minor", pad: ["v42", MINOR_PAD], low: MINOR_LOW,
      cel: ["r2. v50 d8 e8 |", "a4. b-8 g4. f8 | e1 | r1 | r1 | r1 | r1 | r1 | r2. d8 e8 |"],
      harp: "r1 | v40 o2 a4 o3 e4 a4 o4 e4 | o2 d4 a4 o3 d4 f4 | r2. o4 d8 e8 | a4. b-8 g4. f8 | e1 | o2 g4 o3 d4 f4 b-4 | o2 a4 o3 e4 g4 o4 c#4 |",
      air: "v28 d1 | e1 | f1 | f1 | d1 | e1 | d1 | e1 |",
    },
    { // 4: the question in major; harp arpeggios
      gain: 8.9, key: "D", pad: ["v46", MAJOR_PAD], low: MAJOR_LOW,
      cel: ["r2. v52 d8 e8 |", "a4. b8 g4. f#8 | e1 | r1 | r1 | r1 | r1 | r1 | r2. d8 e8 |"],
      harp: "v40 " + HA.bm_em + " | " + HA.asus_a + " | " + HA.d + " | r2. o4 d8 e8 | a4. b8 g4. f#8 | e1 | " + HA.gmaj7 + " | " + HA.a7 + " |",
      air: "v30 f#1 | e1 | f#1 | f#1 | f#1 | e1 | f#1 | e1 |",
    },
    { // 5: the answer begins to climb and stops on B (over G); choir
      gain: 7.5, key: "D", low: "b2 e2 | a2. f#4 | g1 | e1 | b2 e2 | a1 | g1 | a1 |",
      pad: ["v50", "{f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}4 {f# a > d}4 | {g b > d}1 | {g b > d}1 | {f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}2 | {f# b > d}1 | {g > d e}2 {g > c# e}2 |"],
      cel: ["r2. v54 d8 e8 |", "a4. b8 g4. f#8 | e2. d8 e8 | a4. b8 r2 | r1 | r1 | r1 | r1 | r2. d8 e8 |"],
      harp: "v42 " + HA.bm_em + " | " + HA.asus_a_d + " | " + HA.gadd9 + " | r2. o4 d8 e8 | a4. b8 g4. f#8 | e1 | " + HA.gmaj7 + " | " + HA.a7 + " |",
      air: "v32 f#1 | e1 | d1 | d1 | f#1 | e1 | f#1 | e1 |",
      choir: "v30 {f# a}2 {g b}2 | {a > d}2 {a > c#}4 {a > d}4 | {g b > d}1 | {g b > d}1 | {f# a}2 {g b}2 | {a > d}2 {a > c#}2 | {f# b > d}1 | {g a > d}2 {g a > c#}2 |",
    },
    { // 6: everything but the last note: hangs on C# over A (flute holds it); brightest
      gain: 6.4, key: "D", low: "b2 e2 | a2. f#4 | g2 a2 | a1 | b2 e2 | a1 | g1 | a1 |",
      pad: ["v54", "{f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}4 {f# a > d}4 | {g b > d}2 {a > d e}4 {a > c# e}4 | {a > c# e}1 | {f# a > d}2 {g b > d}2 | {a > d e}2 {a > c# e}2 | {f# b > d}1 | {g > d e}2 {g > c# e}2 |"],
      cel: ["r2. v56 d8 e8 |", "a4. b8 g4. f#8 | e2. d8 e8 | a4. b8 > d4. c#8 | r1 | r1 | r1 | r1 | r2. o5 d8 e8 |"],
      harp: "v44 " + HA.bm_em + " | " + HA.asus_a_d + " | " + HA.g_asus_a + " | " + HA.a_pick + " | o4 a4. b8 g4. f#8 | e1 | " + HA.gmaj7 + " | " + HA.a7 + " |",
      air: "v34 f#1 | e1 | d2 e2 | e1 | f#1 | e1 | f#1 | e1 |",
      choir: "v32 {f# a}2 {g b}2 | {a > d}2 {a > c#}4 {a > d}4 | {g b > d}2 {a > d}4 {a > c#}4 | {a > c# e}1 | {f# a}2 {g b}2 | {a > d}2 {a > c#}2 | {f# b > d}1 | {g a > d}2 {g a > c#}2 |",
      fl: "z2 | r2 o6 v44 d4. c#8& | c#1 | o5 v40 f#2 g2 | a1 | b1 | a2 r2 |",
    },
  ];
  STEPS.forEach((st, i) => {
    const minor = st.key !== "D", chans = [], I = {}, L = {};
    for (const name in VOICE_CHANS) {
      if (name === "pad" || name === "low" || name === "cel" || st[name]) chans.push(Object.assign({ name }, VOICE_CHANS[name]));
    }
    I.pad = st.pad[0] + (minor ? " {d a > f}1 |" : " {f# a > d}1 |");
    I.low = "v40 d1 |";
    I.cel = st.cel[0];
    L.pad = st.pad[0] + " " + st.pad[1];
    L.low = "v42 " + st.low;
    // the loop's celesta keeps the intro pickup's velocity (a section starts from the channel
    // default v80 otherwise: the loop's first note then jumped about 5 dB over the loop's end)
    L.cel = st.cel[0].match(/v\d+/)[0] + " " + st.cel[1];
    for (const k of ["harp", "air", "choir", "fl"]) if (st[k]) L[k] = st[k];
    SONG.add(i ? "voice_" + (i + 1) : "voice", {
      bpm: 66, meter: "4/4", key: st.key, gain: st.gain, memory: false, fadeIn: 0.4,
      echo: { ms: 240, fb: 0.35, mix: 0.25, lp: 2600 },
      verb: { sec: 2.8, mix: 0.35, lp: minor ? 4500 : 6000 },
      chans, parts: { I, L }, intro: ["I"], loop: ["L"],
    });
  });
})();
