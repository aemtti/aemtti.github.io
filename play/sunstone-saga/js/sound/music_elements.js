"use strict";
// ---------- Music: the three element dungeons (desert, ice, fire) ----------
// Written for the song notation of engine.js (see tools/sound_format.md). All melodies,
// harmonies and rhythms are new for this game; the July tracks were not reused.
//   desert - Sunscar Vault, a made-up sun temple: E Dorian, 104 BPM, 3+3+2 grouping, reed lead
//            with slides, plucked strings, hand drums; B section turns to E Mixolydian (MUS-06)
//   ice    - Rimewell: D minor waltz, 88 BPM, celesta/glockenspiel arpeggios, harp, glass pad,
//            alto flute, sleigh bells, 3 s reverb, no drum kit; B section in Bb Lydian (MUS-07)
//   fire   - Cinder Deep: C minor, 144 BPM, growling FM bass riff, anvil on 2 and 4, low
//            drums, brass stabs; half-time B section with organ in F minor (MUS-08)
// Each track: an intro played once, then a loop of four sections whose last bar leads back
// into the first. The Sunstone fragment (music_motifs.js) appears once per loop.
// References (principles only): review/_audio/refs/elements.md.

(function () {
  // Sunstone fragment (D E | A shape: short-short-LONG) as song text in any key and meter.
  // Falls back to the same notes written out if music_motifs.js is missing.
  const frag = (tonic, mode, meter, at, bars, vel, fallback) => {
    if (typeof MotifKit === "undefined") return fallback;
    return SONG.text(MotifKit.notes("sunstone", { form: "fragment", tonic, mode }), { meter, at, bars, vel });
  };

  // ============================================================
  // DESERT: Sunscar Vault (MUS-06)
  // ============================================================
  // E Dorian (raised 6th C#; no augmented seconds, no flat 2nd). Every bar is 3+3+2 eighths:
  // the guitar ostinato, the bass and the hand drums all accent eighths 1, 4 and 7.
  // Melody idea: a slide up a fourth to a long note (B->E, D->G, E->A), then a step.
  // Form: I 2 | A 8 (oboe + guitar + bass + drums) | A2 8 (flute counter-line, horn) |
  //       B 8 (E Mixolydian: horn tune, then oboe + flute; 3+3+3+3+2+2 drum cycle) |
  //       C 4 (breakdown: Sunstone fragment on a bell, drum build) -> A.
  const G = {                         // guitar ostinato shapes, one bar each (start and end in octave 3)
    Em9: "e8! b8 > f#8 g8! < b8 > e8 d8! < b8",
    Em6: "e8! b8 > f#8 g8! < b8 > e8 c#8! < b8",
    A9: "< a8! > e8 b8 > c#8! < e8 a8 g8! e8",
    A69: "< a8! > e8 b8 > c#8! < e8 a8 f#8! e8",
    A7s: "< a8! > e8 b8 > d8! < e8 a8 g8! e8",
    D9: "d8! a8 > e8 f#8! < a8 > d8 e8! < a8",
    DF: "< f#8! > d8 a8 > d8! < a8 > e8 d8! < a8",
    G9: "< g8! > d8 a8 b8! d8 g8 a8! d8",
    Bm7: "< b8! > f#8 > c#8 d8! < f#8 b8 a8! f#8",
    E9: "e8! b8 > f#8 g#8! < b8 > e8 d8! < b8",
    Ac: "c#8! a8 > e8 c#8! < a8 > e8 < b8! a8",
    Eb: "< b8! > e8 b8 > g#8! < b8 > e8 f#8! < b8",
    Cm7: "c#8! g#8 > e8 < b8! g#8 > c#8 e8! < g#8",
    B7s: "< b8! > f#8 > e8 < a8! f#8 b8 > e8! < f#8",
    Ae: "e8! a8 > e8 c#8! < a8 > e8 < b8! a8",
  };
  const gtr = list => list.map(k => G[k]).join(" | ") + " |";
  const DR = {                        // hand-drum bars (D low drum, E slap, Z shaker, R rim, X clap, L M T toms)
    p1: "{D Z}8! Z8 E8? {D Z}8 Z8 E8? {E Z}8! D16? E16? |",
    p2: "{D Z}8! Z8 E8? {D Z}8 Z8 E16 E16 {E Z}8! {D L}8 |",
    q1: "{D Z}8! Z16 Z16 {E R}8 {D Z}8! Z16 Z16 {E R}8? {E Z}8! {D Z}16 E16? |",
    fill: "{D L}8! E16 E16 E8 {D M}8! E16 E16 E8 {E T}16! T16 M16 L16 |",
    b1: "{D Z}8! Z8 E8? {D Z}8! Z8 E8? {E Z}8! Z8 |",               // 3+3+3+3+2+2 over two bars
    b2: "E8? {D Z X}8! Z8 E8? {E Z X}8! Z8 {D Z X}8! E8? |",
    bfill: "E8? {D Z X}8! E16 E16 E8? {E X}8! L16 L16 {D M}8! T16 T16 |",
  };

  SONG.add("desert", {
    bpm: 104, meter: "3+3+2/8", key: "E dorian",
    echo: { len: "8", fb: 0.3, mix: 0.24, lp: 2800 },         // 0.29 s slap on the reed (heat shimmer)
    verb: { sec: 1.8, mix: 0.26, lp: 5000 },                 // stone hall
    gain: 1.5,
    chans: [
      { name: "lead", inst: "oboe", pan: 0.05, vol: 0.74, echo: 0.28, verb: 0.3, oct: 4, port: 110, vel: 76 },
      { name: "flute", inst: "flute", pan: 0.42, vol: 0.46, echo: 0.3, verb: 0.38, oct: 5, vel: 62, vib: true },
      { name: "horn", inst: "horn", pan: -0.25, vol: 0.5, verb: 0.35, oct: 3, vel: 62 },
      { name: "guitar", inst: "guitar", pan: -0.45, vol: 0.5, echo: 0.12, verb: 0.25, oct: 3, vel: 56 },
      { name: "pad", inst: "strings", pan: 0.3, vol: 0.4, verb: 0.4, oct: 3, vel: 55 },
      { name: "bass", inst: "pickbass", pan: 0, vol: 0.78, verb: 0.06, oct: 2, vel: 80 },
      { name: "drums", inst: "kit", vol: 0.72, verb: 0.16, vel: 70 },
    ],
    parts: {
      I: {                                                   // open fifth swells, ostinato enters, reed pickup
        pad: "o2 v48 {e b}1 | v56 {e b > f#}1 |",
        guitar: "z | v48 " + gtr(["Em9"]),
        bass: "e1 | e4. b4. d4 |",
        drums: "v55 D4. D4. E4? | v66 " + DR.p1,
        lead: "z | r2. f#8 a8 |",
      },
      A: {                                                   // Em9 | A9 | Em9 | D | G | A9 | Bm7 | D
        lead: "o4 b4. /> e4.~ f#4 | e4. c#4. < b8 a8 | g4. b4. a8 g8 | f#4. a2^8~ |" +
              " > d4. /g4. f#8 e8 | a4.~ g4. e4 | f#4. d4. < b8 > c#8 | < a2.~ f#8 a8 |",
        guitar: "v50 " + gtr(["Em9", "A9", "Em6", "D9", "G9", "A9", "Bm7", "D9"]),
        pad: "o3 v50 {g b > d f#}1 | {g b > c# e}1 | {g b > c# e}1 | {f# a > d e}1 |" +
             " {g b > d e}1 | {g b > c# e}1 | {f# a b > d}1 | {f# a > d e}1 |",
        bass: "e4. > e4. < b4 | a4. > e4. < f#4 | e4. b4. > c#4 | d4. < a4. f#4 |" +
              " g4. > d4. < b4 | a4. > e4. c#4 | < b4. > f#4. c#4 | d4. < a4. f#4 |",
        drums: "v60 [" + DR.p1 + "]3 " + DR.p2 + " [" + DR.p1 + "]3 v70 " + DR.fill,
      },
      A2: {                                                  // same start; flute answers, horn line; closes on Em
        lead: "o4 b4. /> e4.~ f#4 | e4. c#4. < b8 a8 | g4. b4 > c#16 < b16 a8 g8 | f#4. a2^8~ |" +
              " > d4. /g4. f#8 e8 | a4.~ f#4. d4 | e4. d4. c#4 | < b2.~ r4 |",
        // bar 4 leaps D -> A and meets the reed an octave up, then steps on to B: the earlier
        // D F# B shape copied a July line's intervals (originality check, round 2)
        flute: "r4. g4. b4 | a4. e4. f#8 e8 | < b4. > g4. f#8 e8 | d4. a2^8 |" +
               " b2. a8 g8 | > d4. < a4. f#4 | a4. g4. e4 | g2. r4 |",
        horn: "b1 | > c#1 | < b1 | a1 | b1 | a1 | > d2. c#4 | < b1 |",
        guitar: "v56 " + gtr(["Em9", "A9", "Em6", "D9", "G9", "DF", "A7s", "Em9"]),
        pad: "o3 v58 {e g b > d}1 | {g b > c# e}1 | {g b > c# e}1 | {f# a > d e}1 |" +
             " {g b > d e}1 | {f# a > d e}1 | {g b > d e}2. {g b > c# e}4 | {e g b > d}1 |",
        bass: "e4. > e4. < b8 g8 | a4. > e4. c#8 < b8 | e4. b4. b8 > c#8 | d4. < a4. a8 f#8 |" +
              " g4. > d4. < b8 g8 | f#4. a4. f#8 g8 | a4. > e4. c#8 < b8 | e4. b4. g8 f#8 |",
        drums: "v72 [" + DR.q1 + "]3 " + DR.p2 + " [" + DR.q1 + "]3 " + DR.fill,
      },
      B: {                                                   // E | D | A/C# | E/B | C#m7 | D | A | B7sus4 (Mixolydian)
        horn: "v88 b4. > e4. f#8 g#8 | a2. f#4 | e4. a2^8 | b2. g#8 f#8 | v64 e1 | d1 | c#1 | e1 |",
        lead: "z3 | r2. f#8 a8 | v80 g#4. b4. > c#4 | d4. < a4. f#4 | > c#4. < b4. a4 | b2.~\\ r4 |",
        flute: "z2 | v44 > c#1 | < b1 | v60 g#4. b4. > c#4 | d4. < a4. f#4 | > c#4. < b4. a4 | b2.~ r4 |",
        guitar: "v66 " + gtr(["E9", "D9", "Ac", "Eb", "Cm7", "D9", "A69", "B7s"]),
        pad: "o3 v68 {e g# b}1 | {d f# a}1 | {c# e a}1 | < {b > e g#}1 | v76 > {e g# b}1 | {f# a > d}1 | {e a > c#}1 | {e f# a b}1 |",
        bass: "v88 e4. b4. > e8 d8 | d4. < a4. > d8 c#8 | c#4. < a4. > c#8 < b8 | b4. > e4. < b8 > c#8 |" +
              " c#4. g#4. c#8 d8 | d4. a4. d8 < a8 | a4. > e4. < a8 > c#8 | < b4. > f#4. < b8 b8 |",
        drums: "v84 [" + DR.b1 + " " + DR.b2 + "]3 " + DR.b1 + " " + DR.bfill,
      },
      C: {                                                   // Em pedal: bell fragment, then A/E | D and the pickup
        guitar: "@bells " + frag(64, "dorian", "3+3+2/8", 12, 2, 70, "v70 r2. o4 e8 f#8 | b2. r4 |") +
                " @guitar v56 o3 " + gtr(["Ae", "D9"]),
        lead: "z2 | o4 r4 b8 /> c#4.~ < b8 a8 | a2.~ f#8 a8 |",
        horn: "o2 v50 b1 | b1 | > c#1 | d1 |",
        pad: "o2 v52 {e b > e}1 | {e b > f#}1 | > {e a > c#}1 | {d a > e}1 |",
        bass: "e1 | e2. b4 | a4. > e4. < a4 | > d4. < a4. f#4 |",
        drums: "v60 D4. D4. E8? E8? | D4. {D Z}8 E8? E8 {D Z}8 E16 E16 |" +
               " v68 {D L}8! Z8 E8? {D L}8 Z8 E8 {E M}8! {D M}8 | " + DR.fill,
      },
    },
    intro: ["I"],
    loop: ["A", "A2", "B", "C"],
  });

  // ============================================================
  // ICE: Rimewell (MUS-07)
  // ============================================================
  // D minor waltz, no drum kit (sleigh bells only), long 3 s reverb, bells on echo.
  // Melody idea: a rising minor sixth (A up to F) that sinks by steps; the answer climbs to
  // a high Bb and drops an octave back to the pickup.
  // Form: I 4 | A 8 (alto flute, celesta arpeggios, harp waltz, glass pad) | A2 8 (flute
  //       counter-line, glockenspiel doubles the tune) | B 8 (Bb Lydian: flute tune, alto flute
  //       below, harp rolls, bass pedal) | C 6 (Sunstone fragment on glockenspiel, return) -> A.
  const CE = {                        // celesta arpeggios, one bar of 8ths each (start and end in octave 5)
    Dm9: "d8 a8 > e8 f8 e8 < a8",
    Dm: "d8 a8 > d8 f8 d8 < a8",
    Am: "< a8 > e8 a8 > c8 < a8 e8",
    Bb11: "< b-8 > f8 a8 > e8 < a8 f8",
    Bb: "< b-8 > f8 a8 > d8 < a8 f8",
    A7s: "< a8 > e8 g8 > d8 c#8 < e8",
    A7: "< a8 > e8 g8 > c#8 < g8 e8",
    Gm6: "< g8 > d8 e8 b-8 g8 d8",
    Gm7: "< g8 > d8 f8 b-8 f8 d8",
    CB: "c8 g8 > c8 e8 c8 < g8",
    Am7: "< a8 > e8 g8 > c8 < g8 e8",
  };
  const cel = list => list.map(k => CE[k]).join(" | ") + " |";
  const HP = {                        // harp waltz: bass note on 1, chord on 2 and 3 (start and end in octave 3)
    Dm: "d4 {a > d f}4 {a > d f}4",
    Am: "c4 {a > c e}4 {a > c e}4",
    Bb: "< b-4 > {f a > d}4 {f a > d}4",
    Bbt: "< b-4 > {f b- > d}4 {f b- > d}4",
    A7s: "< a4 > {e a > d}4 {e g > c#}4",
    A4: "< a4 > {e a > d}4 {e a > d}4",
    A7: "< a4 > {e g > c#}4 {e g > c#}4",
    Gm6: "< g4 > {e g b-}4 {e g b-}4",
    DmC: "c4 {a > d f}4 {a > d f}4",
  };
  const hp = list => list.map(k => HP[k]).join(" | ") + " |";

  SONG.add("ice", {
    bpm: 88, meter: "3/4", key: "D minor",
    echo: { len: "8", fb: 0.38, mix: 0.3, lp: 3500 },        // 0.34 s repeats on the bells
    verb: { sec: 3.0, mix: 0.36, lp: 7000, pre: 0.03 },      // big icy hall
    gain: 4.4,
    chans: [
      { name: "lead", inst: "altoflute", pan: 0.05, vol: 0.8, echo: 0.18, verb: 0.45, oct: 4, vel: 72, vib: true },
      { name: "flute", inst: "flute", pan: 0.35, vol: 0.5, echo: 0.3, verb: 0.5, oct: 5, vel: 58, vib: true },
      { name: "celesta", inst: "celesta", pan: -0.35, vol: 0.52, echo: 0.35, verb: 0.5, oct: 5, vel: 48 },
      { name: "glock", inst: "glock", pan: 0.5, vol: 0.38, echo: 0.45, verb: 0.55, oct: 6, vel: 40 },
      { name: "harp", inst: "harp", pan: -0.5, vol: 0.5, verb: 0.45, oct: 3, vel: 50 },
      { name: "glass", inst: "glass", pan: 0.25, vol: 0.42, verb: 0.55, oct: 4, vel: 50 },
      { name: "bass", inst: "strings", pan: -0.1, vol: 0.44, verb: 0.35, oct: 3, vel: 52 },
      { name: "bells", inst: "kit", vol: 0.5, verb: 0.5, vel: 55 },
    ],
    parts: {
      I: {                                                   // Dm9 | Dm9 | Bbmaj7#11 | A7sus4-A7, pickup A
        glass: "v44 {f a > d}2. | v50 {f a > d}2. | {f a > d}2. | {e a > d}2 {e g > c#}4 |",
        celesta: "v40 " + CE.Dm9 + " | v46 " + cel(["Dm9", "Bb11", "A7s"]),
        harp: "z | " + hp(["Dm", "Bb", "A7s"]),
        bass: "v48 d2. | d2. | < b-2. | a2. |",
        glock: "z2 | r4 e4 d4 | < a2. |",
        lead: "z3 | r2 a4 |",
        bells: "J4? r2 | J4 r2 | J4? r4 J8? J8? | J4 r2 |",
      },
      A: {                                                   // Dm | Am/C | Bbmaj7 | A7sus4-A7 | Dm | Bbmaj7 | Gm6 | A7
        lead: "> f2. | e2 < a4 | > d2. | e4 d4 c#4 | v76 d2 e4 | f2 g4 | b-2. | a2 < a4 |",
        celesta: "v43 " + cel(["Dm", "Am", "Bb11", "A7s", "Dm", "Bb", "Gm6", "A7"]),
        harp: "v45 " + hp(["Dm", "Am", "Bb", "A7s", "Dm", "Bb", "Gm6", "A7"]),
        glass: "v44 {f a > d}2. | {e a > c}2. | {f a > d}2. | {e a > d}2 {e g > c#}4 | {f a > d}2. | {f a > d}2. | {e g b-}2. | {e g > c#}2. |",
        bass: "d2. | c2. | < b-2. | a2. | > d2. | < b-2. | g2. | a2. |",
        glock: "z3 | r2 e4 | z3 | r4 c#4 < a4 |",
        bells: "J4? r2 | z3 | J4? r2 | z2 | r2 J8? J8? |",
      },
      A2: {                                                  // same start; flute counter-line; ends on Dm
        lead: "> f2. | e2 < a4 | > d2. | e4 d4 c#4 | v76 d2 e4 | f2 g4 | g4 e4 c#4 | d2. |",
        flute: "r4 a4 > d4 | c2. | < b-4 a4 f4 | a2. | f2 g4 | > d2. | c#2. | d2. |",
        glock: "v34 f4 r2 | e4 r2 | d4 r2 | e4 d4 c#4 | z | f4 r2 | g4 e4 c#4 | d4 r2 |",
        celesta: cel(["Dm", "Am", "Bb11", "A7s", "Dm", "Bb", "A7", "Dm"]),
        harp: hp(["Dm", "Am", "Bb", "A7s", "Dm", "Bbt", "A7", "Dm"]),
        glass: "v54 {f a > d}2. | {e a > c}2. | {f b- > d}2. | {e a > d}2 {e g > c#}4 | {f a > d}2. | {f b- > d}2. | {e g > c#}2. | {f a > d}2. |",
        bass: "d2. | c2. | < b-2. | a2. | > d2. | < b-2. | a2. | > d2. |",
        bells: "[r4 J4? J4? | z |]4",
      },
      B: {                                                   // Bbmaj7#11 | C/Bb (x2) | Gm7 | Am7 | Bbmaj7#11 | C/Bb
        flute: "o6 v68 e2 d4 | c2 < g4 | a2 > d4 | c2. | < b-2 a4 | g2 e4 | f4 a4 > e4 | d2. |",
        lead: "v56 f2. | e2. | f2. | g2 a4 | d2. | e2. | d2. | e2 g4 |",
        celesta: "v52 " + cel(["Bb11", "CB", "Bb11", "CB", "Gm7", "Am7", "Bb11", "CB"]),
        glock: "v40 r4 e4 r4 | r4 c4 r4 | r4 < a4 r4 | r4 > c4 r4 | r4 < b-4 r4 | r4 g4 r4 | r4 a4 > e4 | r4 d4 r4 |",
        harp: "o2 b-16 > f16 a16 > d16 a4 r4 | o2 b-16 > e16 g16 > c16 e4 r4 | o2 b-16 > f16 a16 > d16 a4 r4 | o2 b-16 > e16 g16 > c16 e4 r4 |" +
              " o2 g16 > d16 f16 b-16 > d4 r4 | o2 a16 > e16 g16 > c16 e4 r4 | o2 b-16 > f16 a16 > d16 a4 r4 | o2 b-16 > e16 g16 > c16 e4 g16 > c16 e16 g16 |",
        glass: "v56 {f a > d}2. | {e g > c}2. | {f a > d}2. | {e g > c}2. | {f b- > d}2. | {e g > c}2. | {f a > d}2. | {e g > c}2. |",
        bass: "< b-2. | b-2. | b-2. | b-2. | g2. | a2. | b-2. | b-2. |",
        bells: "v48 [r4 J8? J8? J8? J8? |]8",
      },
      C: {                                                   // Dm | Dm/C | Bbmaj7 | Gm6 | A7sus4 | A7, pickup A
        glock: frag(86, "minor", "3/4", 8, 6, 52, "v52 r2 o6 d8 e8 | a2. | r2. | r2. | r2. | r2. |"),
        lead: "z2 | > d2 c4 | < b-2. | a2. | r2 a4 |",
        celesta: "v38 " + cel(["Dm", "Dm", "Bb", "Gm6", "A7s", "A7"]),
        harp: hp(["Dm", "DmC", "Bb", "Gm6", "A4"]) + " o2 a8 > e8 g8 > c#8 e8 g8 |",
        glass: "v40 {f a > d}2. | {f a > d}2. | v44 {f a > d}2. | {e g b-}2. | v48 {e a > d}2. | {e g > c#}2. |",
        bass: "d2. | c2. | < b-2. | g2. | a2. | a2. |",
        bells: "z4 | r4 J8? J8? J8? J8? | J8 J8 J8 J8 J8! J8 |",
      },
    },
    intro: ["I"],
    loop: ["A", "A2", "B", "C"],
  });

  // ============================================================
  // FIRE: Cinder Deep (MUS-08)
  // ============================================================
  // C minor with a Phrygian Db over the C pedal. The bass riff hammers 3+3+2 | 3+3+2 in
  // 16ths; the anvil and snare strike beats 2 and 4. Melody idea: two short hammer blows and
  // a long ring (3+3+10 sixteenths): the hammer drops a fourth, the spark flies up a sixth.
  // Form: I 4 | A 8 (trumpet, riff, anvil) | A2 8 (horn line, stabs, tremolo strings, climbs to
  //       C6, ends on C major) | B 8 (half time, organ, F minor, broad trumpet tune) |
  //       C 8 (forge breakdown, Sunstone fragment on horn, rising build) -> A.
  const RF = {                        // FM bass riff bars: root root fifth | root, two passing notes
    C1: "o2 c8. c8. g8 c8. < b-8. g8 |",                     // C C G | C Bb G
    C2: "o2 c8. c8. < a-8 > d-8. c8. < b-8 |",               // C C Ab | Db C Bb (Phrygian colour)
    // r1 S4: the riffs on Ab, Bb, F and G sit an octave higher (F1-Bb1 = 44-58 Hz ruled the mix);
    // C and Db stay on C2, and the leading tone into C stays low (B1)
    Ab: "o2 a-8. a-8. > e-8 < a-8. > e-8. < a-8 |",
    Bb: "o2 b-8. b-8. > f8 < b-8. f8. d8 |",
    Bc: "o2 b-8. b-8. > f8 < b-8. f8. c8 |",
    F: "o2 f8. f8. > c8 < f8. c8. c8 |",
    G: "o2 g8. g8. > d8 < g8. a-8. < b8 |",                    // leading tone B into C
    G2: "o2 g8. g8. > d8 < g8. d8. < b8 |",                // same with D (under the melody's D) into C
    Cmaj: "o2 c8. c8. g8 c8. < g8. > e8 |",                  // E natural (E2) leads to F minor (F2)
    Db: "o2 d-8. d-8. a-8 d-8. < a-8. a-8 |",
  };
  const rf = list => list.map(k => RF[k]).join(" ");
  const FD = {                        // kit bars (A anvil, K kick, S snare, H/O hats, L M T toms, C crash)
    a1: "{K H}8. K16 {S A}8 H8 K8. K16 {S A}8 H16 H16 |",
    a1c: "{K C}8. K16 {S A}8 H8 K8. K16 {S A}8 H16 H16 |",
    a2: "{K H}8. K16 {S A}8 H8 K8. K16 {S A}16 S16 {S T}16 S16 |",
    a3: "{K H}8. {K H}16 {S A}8 H16 H16 {K H}8. {K H}16 {S A}8 H16 O16 |",
    a3c: "{K C}8. {K H}16 {S A}8 H16 H16 {K H}8. {K H}16 {S A}8 H16 O16 |",
    fillA: "{K S}8. S16 {S A}8 S16 S16 {K T}16 T16 M16 M16 {K L}16 L16 {S L}16 S16 |",
    fillB: "{K S}8. S16 {S A}8 S16 S16 {K T}16 T16 T16 M16 {K M}16 M16 {S L}16! L16 |",
    b1c: "{K C}8 H8 H8 H8 {S A}8 H8 H8 K8 |",
    b1: "{K H}8 H8 H8 H8 {S A}8 H8 H8 K8 |",
    b2: "{K H}8 H8 H8 {K H}8 {S A}8 H8 {K H}8 H8 |",
    fillC: "{K H}8 H8 {S A}8 S16 S16 {K T}8 T16 T16 {S M}16 M16 {K L}16 L16 |",
    cA: "{K L}8! L8 A8 L16 L16 {K L}8 A8 {L S}8 A8 |",
    cB: "{K L}8! A16 A16 {M A}8 L8 {K L}8 A16 A16 {M S}8 L8 |",
    big: "{K S}16 S16 S16 S16 {K T}16 T16 T16 T16 {K M}16 M16 M16 M16 {K L}16! L16 {S L}16! S16 |",
  };
  const stab11 = ch => "r2 r8. " + ch + "8.! r8 |";           // one stab on the riff's accent (16th 12)

  SONG.add("fire", {
    bpm: 144, meter: "4/4", key: "C minor",
    echo: { len: "8.", fb: 0.28, mix: 0.2, lp: 2600 },       // dotted-8th (0.31 s) repeats on the stabs
    verb: { sec: 1.6, mix: 0.2, lp: 4500 },                  // hot, dense room
    gain: 0.3,                                               // r1: -0.3 -> +0.3 after the quieter bass
    chans: [
      { name: "lead", inst: "trumpet", pan: 0.08, vol: 0.7, echo: 0.16, verb: 0.22, oct: 4, vel: 76 },
      { name: "stabs", inst: "brass", pan: -0.5, vol: 0.58, echo: 0.3, verb: 0.25, oct: 4, vel: 78, q: 70 },
      { name: "horn", inst: "horn", pan: 0.45, vol: 0.55, verb: 0.3, oct: 4, vel: 64 },
      { name: "organ", inst: "organ", pan: -0.4, vol: 0.46, verb: 0.35, oct: 3, vel: 62 },
      { name: "strings", inst: "strings", pan: 0.55, vol: 0.42, verb: 0.35, oct: 3, vel: 52, trem: [0.3, 7] },
      { name: "bass", inst: "fmbass", pan: 0, vol: 0.5, verb: 0.04, oct: 2, vel: 84 },   // r1 S4: 0.8 -> 0.5 (40-55 Hz ruled the mix)
      { name: "timp", inst: "timpani", pan: -0.3, vol: 0.6, verb: 0.25, oct: 2, vel: 78 },
      { name: "drums", inst: "kit", vol: 0.68, verb: 0.14, vel: 74 },   // r1 S4: 0.74 -> 0.68 (kick in the 40-55 Hz band)
    ],
    parts: {
      I: {                                                   // anvil alone, the growl, the riff, dominant
        drums: "v70 {A L}4! r4 A4 r8 A16? A16? | {A L}4! r8 L8 A4 L8 L8 |" +
               " {A K L}8.! K16 {S A}8 L8 {K L}8. K16 {S A}8 L16 L16 | {K L}8! L16 L16 {S M}8 M16 M16 {S T}8 T16 T16 {S L}16! S16 S16 S16 |",
        bass: "z | o2 v70 c1 | v84 " + rf(["C1", "G"]),
        timp: "c4! r2. | c4 r4 g4 r4 | c4 r2. | r2 [c32]16 |",
        stabs: "z | r4 {c e- g}8! r8 r2 | {c e- g}8! r4. r4 {c e- g}8! r8 | < {b > d f a-}2! r2 |",
        strings: "z2 | v44 {c g > c}1 | v52 {d g b}1 |",
      },
      A: {                                                   // Cm | Db/C | Ab | Bb | Cm | Db/C | Fm | G7
        lead: "o5 c8. < g8. > e-2^8~ | f8. e-8. d-4. c4 | e-8. c8. a-2^8~ | g8. f8. d4. < b-4 |" +
              " > c8. < g8. > e-4. g4 | a-8. f8. d-4. c4 | f8. c8. a-4. g4 | f8. d8. < b2^8 |",
        bass: rf(["C1", "C2", "Ab", "Bb", "C1", "C2", "F", "G"]),
        drums: "v71 " + FD.a1c + " [" + FD.a1 + "]2 " + FD.a2 + " [" + FD.a1 + "]3 " + FD.fillA,
        timp: "c4! r2. | z | a-4 r2. | b-4 r2. | c4! r2. | z | f4 r2. | g4 r4 g8 g8 g4 |",
        stabs: "z | " + stab11("{d- f a-}") + " z | " + stab11("{d f b-}") + " z | " + stab11("{d- f a-}") +
               " z | o3 {b > d f}8.! r16 r4 {b > d f}8.! {b > d f}8.! {b > d f}8! |",
      },
      A2: {                                                  // Cm | Db/C | Ab | Bb | Cm | Ab | Bb | C (major, V of F minor)
        lead: "o5 c8. < g8. > e-2^8~ | f8. e-8. d-4. c4 | e-8. c8. a-2^8~ | g8. f8. d4. < b-4 |" +
              " > c8. < g8. > e-4. g4 | > c8. < b-8. a-2^8~ | f8. d8. < b-4. > d4 | v84 e8. g8. > c2^8~ |",
        horn: "e-1 | f1 | e-1 | d1 | e-2 g2 | a-1 | f1 | e2 g2 |",
        bass: rf(["C1", "C2", "Ab", "Bb", "C1", "Ab", "Bc", "Cmaj"]),
        drums: "v78 " + FD.a3c + " [" + FD.a3 + "]2 " + FD.a2 + " [" + FD.a3 + "]3 " + FD.fillB,
        timp: "c4! r2. | z | a-4 r2. | b-4 r2. | c4! r2. | a-4 r2. | b-4 r2. | c4! r2 [c32]8 |",
        stabs: stab11("{c e- g}") + " " + stab11("{d- f a-}") + " " + stab11("{c e- a-}") + " " + stab11("{d f b-}") + " " +
               stab11("{c e- g}") + " " + stab11("{c e- a-}") + " " + stab11("{d f b-}") + " r2 r8. {c e g}8.! {c e g}8! |",
        strings: "v54 {g > c e-}1 | {a- > d- f}1 | {a- > c e-}1 | {f b- > d}1 | {g > c e-}1 | {a- > c e-}1 | {f b- > d}1 | {g > c e}1 |",
      },
      B: {                                                   // half time: Fm | Db | Ab | Eb/G | Fm | Db | Bbm7 | G7(b9)
        lead: "o4 v72 a-2 > c2 | f2.~ e-4 | e-2 c4 < a-4 | b-1~ | a-2 > c2 | f2 a-2 | > d-2~ c2 | < b2.~ r4 |",
        horn: "z4 | o3 v60 a-2 > c2 | f2 a-2 | > d-2 c2 | < b2. r4 |",
        organ: "{f a- > c}1 | {f a- > d-}1 | {e- a- > c}1 | {e- g b-}1 | {f a- > c}1 | {f a- > d-}1 | {f a- > d-}1 | {f a- b > d}1 |",
        strings: "o5 v46 f1 | f1 | e-1 | e-1 | f1 | a-1 | f1 | f1 |",
        bass: "o2 f4. f8 r4 > c8 < f8 | o2 d-4. d-8 r4 < a-8 > d-8 | o2 a-4. a-8 r4 > e-8 < a-8 | o2 g4. g8 r4 b-8 g8 |" +   // r1 S4: held notes an octave up
              " o2 f4. f8 r4 > c8 < f8 | o2 d-4. d-8 r4 < a-8 > d-8 | o2 b-4. b-8 r4 > f8 < b-8 | o2 g4. g8 a-8. g8. < b8 |",
        timp: "f4! r2. | d-4 r2. | a-4 r2. | g4 r2. | f4! r2. | d-4 r2. | b-4 r2. | g4 r2 [g32]8 |",
        drums: "v72 " + FD.b1c + " " + FD.b2 + " " + FD.b1 + " " + FD.b2 + " " + FD.b1c + " " + FD.b2 + " " + FD.b1 + " " + FD.fillC,
        stabs: "z3 | r2 {e- g b-}4. r8 | z3 | r2 < {b > d f a-}4.! r8 |",
      },
      C: {                                                   // Cm x4 (forge) | Ab | Bb | Db | G7
        lead: "z4 | o5 c8. e-8. a-4 r4 r8 | d8. f8. b-4 r4 r8 | f8. a-8. > d-4 r4 r8 | d8. < b8. g4 f8 d8 < b8 |",
        horn: frag(60, "minor", "4/4", 28, 4, 70, "v70 r1 | r2. o4 c8 d8 | g2. r4 | r1 |") + " o4 v58 e-1 | d1 | d-1 | d1 |",
        stabs: "[{c e- g}8.! {c e- g}8. {c e- g}8! r2 | r2 {c e- g}8. {c e- g}8. {c e- g}8! |]2" +
               " {c e- a-}2! r2 | {d f b-}2! r2 | {d- f a-}2! r2 | < {b > d f}8.! {b > d f}8. {b > d f}8! r2 |",
        organ: "z4 | {e- a- > c}1 | {f b- > d}1 | {f a- > d-}1 | {f a- b > d}1 |",
        strings: "o3 v42 c1 | v46 e-1 | v50 g1 | v54 b-1 | v58 > c1 | v62 d1 | v66 f1 | v70 g1 |",
        bass: rf(["C1", "C1", "C1", "C1", "Ab", "Bc", "Db", "G2"]),
        timp: "c4! r2. | z | c4! r2. | r2 g4 g4 | a-4 r2. | b-4 r2. | d-4 r2. | g4 [g32]8 g4! r4 |",
        drums: "v68 [" + FD.cA + " " + FD.cB + "]2 v80 " + FD.a1c + " " + FD.a1 + " " + FD.a1 + " " + FD.big,
      },
    },
    intro: ["I"],
    loop: ["A", "A2", "B", "C"],
  });
})();
