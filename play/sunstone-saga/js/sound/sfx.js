"use strict";
// ---------- Sound effects: every effect in the game as a layered recipe ----------
// Fills the SFX table of engine.js (format: tools/sound_format.md, section 10). Each effect is
// a small stack of layers rendered once in plain JS (seeded, so every run is identical) and
// levelled to its loudness class:
//   - a transient on top (click, crack), a body that says what it is (wood, metal, flesh,
//     slime, glass, stone), a low thump for weight and a tail for space;
//   - 16-bit habits: sample instruments (glock, harp, bells, brass, choir) for anything tuned,
//     filtered noise with moving cutoffs, pitch envelopes, a little echo on magic, stereo only
//     where a sound is spread out (debris, coins, bells, rolling explosions);
//   - frequent sounds have short tails, several seeded variants and a small pitch spread
//     (never the same variant twice in a row), and limits on copies and re-triggers.
// Jingles are written as scale degrees and follow the playing track's key (the engine keeps
// one buffer per key a jingle has played in, so keyed jingles stay mono). Big rewards pause
// the music and it resumes at the same place (item_fanfare, heart_fanfare, heart_piece,
// shard); short cues duck it 10-12 dB (secret, solved, key).
// Every sound and melody here is new; principles came from the references listed in
// review/_audio/refs/sfx_designer.md (no code, sound or melody was copied).
// New names and where the game should call them: the list at the end of this file.

(function () {
  // ----- small helpers (units: seconds, Hz, semitones, dB) -----
  const rnd = (r, a, b) => a + (b - a) * r();
  const bp = (f, q) => ({ type: "bp", f, q: q || 1 });
  const lp = (f, q) => ({ type: "lp", f, q: q || 0.707 });
  const hp = (f, q) => ({ type: "hp", f, q: q || 0.707 });
  const click = (at, gain, w) => ({ type: "click", at: at || 0, width: w || 0.0008, env: { a: 0.00005, d: 0.02 }, gain: gain || 0 });
  const thump = (at, f0, f1, dur, gain, drive) => ({ type: "osc", wave: "sine", at, f: [f0, f1], dur, env: { a: 0.0015, d: dur }, gain: gain || 0, drive });
  const tone = (wave, at, f, dur, gain, env, flt, more) => Object.assign({ type: "osc", wave, at, f, dur, env: env || { a: 0.002, d: dur }, filter: flt, gain: gain || 0 }, more);
  const noise = (at, dur, flt, gain, env, color) => ({ type: "noise", color: color || "white", at, dur, filter: flt, env: env || { a: 0.002, d: dur }, gain: gain || 0 });
  const bed = (dur, flt, gain, color) => ({ type: "noise", color: color || "white", dur, filter: flt, env: { a: 0.001, s: 1, d: 1, r: 0 }, gain: gain || 0 });
  const fm = (at, f, ratio, index, dur, gain, env) => ({ type: "fm", at, f, ratio, index, dur, env: env || { a: 0.001, d: dur }, gain: gain || 0 });
  const grit = (at, dur, rate, flt, gain, pop, env) => ({ type: "grit", at, dur, rate, filter: flt, gain: gain || 0, pop, env: env || { a: 0.002, d: dur * 1.5 } });
  const modal = (at, f, parts, gain, mallet) => ({ type: "modal", at, f, parts, dur: Math.max.apply(null, parts.map(p => p[2])), gain: gain || 0, mallet });
  const pan = (ly, p) => Object.assign(ly, { pan: p });
  // Partials [ratio, level, 60 dB time] of struck materials (inharmonic ratios = metal/glass).
  const METAL = t => [[1, 1, t], [1.41, 0.7, t * 0.8], [2.76, 0.5, t * 0.55], [3.9, 0.3, t * 0.4], [5.4, 0.15, t * 0.3]];
  const WOOD = t => [[1, 1, t], [2.57, 0.35, t * 0.45], [4.1, 0.12, t * 0.3]];
  const GLASS = t => [[1, 1, t], [2.32, 0.5, t * 0.75], [4.25, 0.3, t * 0.5], [6.63, 0.15, t * 0.35]];
  const STONE = t => [[1, 1, t], [1.58, 0.6, t * 0.6], [2.37, 0.4, t * 0.45], [3.1, 0.25, t * 0.3]];
  const CLAY = t => [[1, 1, t], [2.09, 0.6, t * 0.6], [3.43, 0.35, t * 0.4]];
  // One instrument note as its own layer; `cut` (s) shortens a long ring: the note fades
  // (15 dB by `cut`) and then stops within 0.1 s.
  const ringEnv = cut => ({ a: 0.0003, d: cut * 4, s: 0, r: 0.1 });
  const note = (name, at, midi, len, vel, gain, cut, p) => {
    const ly = { type: "inst", inst: name, at, notes: [[0, midi, len, vel == null ? 0.8 : vel]], gain: gain || 0 };
    if (cut) { ly.dur = cut; ly.env = ringEnv(cut); }
    if (p) ly.pan = p;
    return ly;
  };
  // Several notes in one layer; `cut` stops them all at that time (counted from the layer start).
  const notes = (name, list, gain, cut) => {
    const ly = { type: "inst", inst: name, notes: list, gain: gain || 0 };
    if (cut) { ly.dur = cut; ly.env = { a: 0.0003, s: 1, d: 1, r: 0.15 }; }
    return ly;
  };
  // The playing track's key with its tonic moved into [lo, lo + 11], so a jingle keeps one register.
  const keyAt = (k, lo, mode) => ({ tonic: lo + ((((k.tonic - lo) % 12) + 12) % 12), mode: mode || k.mode || "major" });
  const deg = k => d => SONG.degree(k, d);
  const scale = k => SONG.MODES[k.mode] || SONG.MODES.major;
  // Transpositions (0..12 semitones) that keep every given scale degree inside the key.
  const safeShifts = (k, degs) => {
    const sc = scale(k), semi = degs.map(d => SONG.degree(k, d) - k.tonic), out = [];
    for (let t = 0; t <= 12; t++) if (semi.every(s => sc.indexOf((((s + t) % 12) + 12) % 12) >= 0)) out.push(t);
    return out;
  };
  // Motif notes from music_motifs.js (the Sunstone always sounds in major: it is the dawn stone).
  const motif = (form, tonic) => (typeof MotifKit !== "undefined" ? MotifKit.notes("sunstone", { form, tonic, mode: "major" })
    : form === "fragment" ? [[tonic, 2], [tonic + 2, 2], [tonic + 7, 12]] : [[tonic, 2], [tonic + 2, 2], [tonic + 7, 6], [tonic + 9, 2], [tonic + 5, 6], [tonic + 4, 2], [tonic + 2, 16]]);

  // ----- shared building blocks -----
  // Sword swing (14 frames; the blade crosses the front at about frame 3-4): a band of pink
  // noise whose centre sweeps up and back (air), a thin high edge and a faint low body. The
  // iron sword adds a dull ring, the steel one a clean "shing", the dawn blade a brighter
  // shing with a shimmer. (round 1: a crisp 8 ms "tss" at the very start, so the swing starts
  // at once instead of swelling in over 50 ms)
  const swing = tier => (v, r) => {
    const pk = rnd(r, 0.05, 0.068), top = rnd(r, 2100, 2800) * (tier === 3 ? 1.12 : 1);
    const ly = [
      noise(0, 0.01, bp(rnd(r, 3400, 4200), 1.2), -6, { a: 0.0005, h: 0.002, d: 0.008 }),
      noise(0, 0.2, bp([[0, 480], [pk, top], [0.2, 700]], 1.3), 0, { a: pk * 0.85, d: 0.17 }, "pink"),
      noise(pk - 0.012, 0.05, hp(4800), -13, { a: 0.012, d: 0.05 }),
      thump(pk - 0.02, 150, 95, 0.08, -17),
    ];
    if (tier === 1) ly.push(modal(pk, rnd(r, 1650, 1900), [[1, 1, 0.1], [2.31, 0.45, 0.07], [3.7, 0.2, 0.05]], -19));
    if (tier >= 2) ly.push(fm(pk - 0.005, tier === 3 ? 2500 : 2100, 2.76, [2.4, 0.2], 0.26, -12, { a: 0.004, d: 0.26 }));
    if (tier === 3) ly.push(fm(pk, 3500, 1, [1.1, 0.1], 0.2, -18, { a: 0.004, d: 0.2 }), noise(pk + 0.03, 0.22, hp(6500), -22, { a: 0.03, d: 0.2 }));
    return ly;
  };
  // Being struck: a crack, a thump with a little grit (drive), a non-vocal "oof" (a falling
  // sawtooth through two mouth resonances, side by side) and a short sour sting (two pulses a
  // semitone apart). heavy = 2+ damage; ring = the protective ring (softer sting).
  // dense (plain hurt): thump 3 dB lower, the oof and the sting held longer, so the sound is
  // louder over 100 ms without a higher peak (it must stand 4 LU above the loudest music).
  // (round 1: dense heavy = hurt_heavy - crack and both thumps at -10, the oof and the sting
  // held 80 ms, so it is at least as loud as the plain hurt over 100 ms at the same peak)
  const hurtLayers = (r, heavy, ring, dense) => {
    const f = heavy ? 0.85 : 1, oof = [[0, 225 * f], [0.12, 150 * f]], k = dense ? 1 : 0, hd = heavy && dense;
    const oofEnv = dense ? { a: 0.006, h: hd ? 0.08 : 0.04, d: 0.12 } : { a: 0.006, d: 0.14 }, stEnv = dense ? { a: 0.003, h: hd ? 0.08 : 0.05, d: 0.1 } : { a: 0.003, d: 0.12 };
    return [
      click(0, -12),
      noise(0, 0.008, hp(3000), hd ? -10 : heavy ? -2 : -4, { a: 0.0005, d: 0.01 }),
      thump(0.004, 190 * f, 70 * f * f, heavy ? 0.14 : 0.1, hd ? -10 : (heavy ? -5 : -2) - 3 * k, 0.9),
      tone("saw", 0.016, oof, 0.12, (heavy ? -9 : -11) + 2 * k, oofEnv, bp(700, 3.5), { drive: 2 }),
      tone("saw", 0.016, oof, 0.12, (heavy ? -12 : -14) + 2 * k, oofEnv, bp(1200, 3.5), { drive: 2 }),
      tone("pulse", 0.012, 740, 0.1, ring ? -16 : -11, stEnv, lp(3000), { duty: 0.3 }),
      tone("pulse", 0.012, 784, 0.1, ring ? -16 : -11, stEnv, lp(3000), { duty: 0.3 }),
    ].concat(heavy ? [thump(0.035, 110, 48, 0.12, hd ? -10 : -4, 1)] : []);   // a heavy blow lands twice (weight)
  };
  // An enemy struck: crack + thump (the hit-stop's 4 frames are filled by the thump).
  const hitCore = (r, low, g) => [
    click(0, -10),
    noise(0, 0.006, hp(2500), -10, { a: 0.0003, d: 0.008 }),
    thump(0.002, rnd(r, 155, 190) * low, 62 * low, 0.085, (g || 0) - 2, 0.7),
  ];
  // The little cloud an enemy leaves (16 frames = 0.27 s).
  const poof = (at, dur, f0, f1, gain) => noise(at, dur, bp([[0, f0], [dur, f1]], 1), gain, { a: 0.02, d: dur }, "pink");
  // Hammer blow: crack, a heavy sub thump, a stony body and chips (sub = the thump's dB).
  const hammerCore = sub => [
    click(0, -10),
    noise(0, 0.012, hp(1800), -5, { a: 0.0005, d: 0.014 }),
    thump(0.002, 110, 40, 0.18, sub || 0, 0.6),
    noise(0.003, 0.2, bp(500, 2), -4, { a: 0.002, d: 0.2 }, "pink"),
    grit(0.03, 0.2, [150, 20], bp(2500, 0.8), -12),
  ];
  // One blast (explosions, the boss's rolling death): crack, a darkening body and a sub.
  // full = a single big blast (explosion): the crack 4 dB softer, the body held 60 ms and the
  // sub 8 ms later, so the first 100 ms are loud without one tall peak.
  const blast = (at, p, size, g, full) => [
    pan(noise(at, 0.01, hp(1500), g - (full ? 4 : 0), { a: 0.0005, d: 0.012 }), p),
    pan(Object.assign(noise(at + 0.002, 0.45 * size, lp([[0, 2800], [0.45 * size, 170]]), g - 1, full ? { a: 0.003, h: 0.06, d: 0.5 * size } : { a: 0.003, d: 0.5 * size }, "brown"), { drive: 0.5 }), p),
    pan(thump(at + (full ? 0.011 : 0.003), 88, 34, 0.32 * size, g - (full ? 3 : 1), 0.3), p * 0.4),
    pan(thump(at + (full ? 0.011 : 0.003), 176, 68, 0.26 * size, g - 9), p * 0.4),
  ];
  // Stones and grit landing around a blast, spread left and right.
  const debris = (r, t0, t1, n, g) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = t0 + Math.pow(r(), 1.5) * (t1 - t0);
      out.push(pan(modal(t, rnd(r, 1400, 3600), STONE(rnd(r, 0.015, 0.04)), g - 9 * (t - t0) / (t1 - t0) - rnd(r, 0, 4)), rnd(r, -0.55, 0.55)));
    }
    return out;
  };
  // A creature's voice: a sawtooth with a slow wobble through two mouth resonances, a sub growl
  // an octave down (FM at ratio 0.5) and breath. f = [[t, Hz]...], forms = two resonances (Hz).
  const growl = (at, f, dur, forms, g, drv) => {
    const env = { a: Math.min(0.08, dur * 0.2), h: dur * 0.3, d: dur * 0.9, r: 0.08 };
    const saw = (flt, gg) => ({ type: "osc", wave: "saw", at, f, vib: [40, 6.5, 0.05], dur, env, filter: flt, drive: drv || 1.4, gain: g + gg });
    return [
      saw(lp(forms[1] * 1.6), -2),
      saw(bp(forms[0], 4), -3),
      saw(bp(forms[1], 5), -7),
      { type: "fm", at, f: f.map(p => [p[0], p[1] * 0.5]), ratio: 0.5, index: [3.5, 1.5], dur, env, drive: 1.2, gain: g - 6 },
      noise(at, dur, bp(forms[0] * 1.2, 0.8), g - 10, env, "pink"),
    ];
  };
  // Attack warning: a swell that brightens toward the attack (length = the wind-up).
  const swell = (dur, f0, f1, q, g, color) => noise(0, dur, bp([[0, f0], [dur, f1]], q), g, { a: dur * 0.85, d: dur * 0.3, r: 0.03 }, color || "pink");
  // A creak (hinges, wood, ice): stick-slip - narrow pulses at a wandering rate (tens per
  // second) through two resonances of the body; two copies at different wobble rates so the
  // clicks never line up into a steady tone.
  const creak = (at, dur, rate, forms, g) => [0, 1].map(i => tone("pulse", at, rate, dur, g - i * 4,
    { a: 0.02, h: dur * 0.5, d: dur * 0.7 }, bp(forms[i], 3), { duty: 0.05, vib: [300 + i * 150, 6 + i * 3.3, 0] }));
  // Coins: small bright clinks at random times and places.
  const coins = (r, t0, t1, n, g, fall) => {
    const out = [];
    for (let i = 0; i < n; i++) {
      const t = fall ? t0 + (t1 - t0) * Math.pow(i / n, 0.7) : rnd(r, t0, t1);
      const f = fall ? 3600 - 1800 * i / n : rnd(r, 2600, 4400);
      out.push(pan(modal(t, f, [[1, 1, rnd(r, 0.07, 0.14)], [2.37, 0.5, 0.06], [3.9, 0.25, 0.04]], g - (fall ? 8 * i / n : rnd(r, 0, 5))), rnd(r, -0.3, 0.3)));
    }
    return out;
  };
  // Heartbeat "lub-dub": two driven low thumps (the drive adds harmonics a laptop can play), a
  // soft skin knock and, on the lub and on the dub, a short woody "tock" at 1.1-1.8 kHz (the
  // valve click). Laptop and phone speakers lose almost everything under 150 Hz and the boss
  // tracks are loudest exactly there, so the tock carries the warning: the beat keeps nearly
  // all its loudness through a 150 Hz high-pass (the thump is 11 dB under the tock).
  const beat = urgent => () => {
    const f = urgent ? 1.12 : 1, gap = urgent ? 0.13 : 0.16;
    return [
      Object.assign(thump(0, 78 * f, 58 * f, 0.13, -11, 2.2), { env: { a: 0.002, h: 0.035, d: 0.1 } }),
      tone("sine", 0.004, [[0, 156 * f], [0.1, 118 * f]], 0.09, -16, { a: 0.004, h: 0.04, d: 0.08 }, undefined, { drive: 1.5 }),
      noise(0, 0.08, bp(360, 1.2), -14, { a: 0.004, h: 0.03, d: 0.07 }, "pink"),
      tone("tri", 0, [[0, 1600 * f], [0.075, 1400 * f]], 0.075, 0, { a: 0.001, h: 0.05, d: 0.05 }),
      noise(0, 0.03, bp(2000 * f, 2), -8, { a: 0.0005, h: 0.005, d: 0.03 }),
      thump(gap, 66 * f, 50 * f, 0.1, -12, 1.6),
      noise(gap, 0.05, bp(300, 1.4), -18, { a: 0.003, d: 0.06 }, "pink"),
      tone("tri", gap, [[0, 1250 * f], [0.05, 1100 * f]], 0.05, -3, { a: 0.001, h: 0.04, d: 0.04 }),
    ];
  };
  // States kept between plays (audio-clock seconds): low-health episodes and pickup combos.
  const hb = { last: -99, n: 0, next: 0, lastBeat: -99, kind: null }, combo = { last: -99, step: 0 };
  // Dip the music `db` for one beat at audio time b. Sound.duck() always starts at once, so a
  // beat placed later adds its dip to the engine's list of dips and lets duck() redraw the curve.
  const dipAt = (S, b, db, hold, att, rel) => {
    if (!Array.isArray(S.ducks)) return S.duck && S.duck(db, hold, Math.max(0.01, b - S.ctx.currentTime), rel);
    S.ducks.push({ t0: b, t1: b + att, t2: b + att + hold, t3: b + att + hold + rel, g: Math.pow(10, -Math.abs(db) / 20) });
    S.duck(0, 0, 0.005, 0.02);
  };
  // Low health. The game calls "heartbeat" (at half a heart "heartbeat_urgent") every 45 frames:
  // 0.75 s, exactly two beats of the 160 BPM boss track, so the heart would lock onto its drums.
  // Each call keeps a heart of its own instead (0.8 s; urgent 0.7 s) and plays the beats that
  // fall before the game's next call, each delayed to its place (after the last call at most one
  // more beat follows). Beats 1-4 of a spell are full, later ones 1.5 dB softer: a caller's own
  // softer gain (main.js asks -7) is limited to that. Every beat dips the music 3.5 dB.
  const BEAT_DROP = -1.5, CALL = 0.75;
  const beatPlay = (name, period) => (S, o, t) => {
    if (t < hb.last || t - hb.last > 1.6) { hb.n = 0; hb.next = t; hb.kind = name; }
    else if (hb.kind !== name) { hb.n = 0; hb.kind = name; hb.next = Math.max(t, hb.lastBeat + period); }
    hb.last = t;
    let id = null;
    while (hb.next < t + CALL - 0.001) {
      const b = hb.next;
      hb.n++; hb.lastBeat = b; hb.next = b + period;
      const g = Math.max(BEAT_DROP, Math.min(o.gain || 0, hb.n > 4 ? BEAT_DROP : 0));
      id = S.sfx(name, Object.assign({}, o, { gain: g, delay: (o.delay || 0) + (b - t) }));
      if (S.G && S.ctx) dipAt(S, b, -3.5, 0.1, 0.01, 0.25);
    }
    return id;
  };
  // Pickups within 1 s climb, but only by steps that keep the glint's notes in the key
  // (at most 9 semitones, so the glockenspiel stays in its range).
  const comboPlay = (name, degs) => (S, o, t) => {
    const sh = safeShifts(S.key(), degs).filter(t => t <= 9);
    combo.step = (t < combo.last || t - combo.last > 1.0) ? 0 : Math.min(combo.step + 1, sh.length - 1);
    combo.last = t;
    return S.sfx(name, Object.assign({}, o, { pitch: (o.pitch || 0) + sh[Math.min(combo.step, sh.length - 1)] }));
  };
  // Test reset: Sound.resetForTest() (AudioLab calls it before every render) also forgets the
  // heartbeat episode and the gem climb, so a render repeats exactly (engine hook onReset).
  if (typeof Sound !== "undefined" && Sound.onReset) Sound.onReset(() => { hb.last = -99; hb.n = 0; hb.next = 0; hb.lastBeat = -99; hb.kind = null; combo.last = -99; combo.step = 0; });
  // Loops: the engine cross-fades the last 40 ms into the start, so a loop of period P is
  // rendered P + 0.04 s long with a steady bed to the very end (tail: 0.0001 keeps that length).
  const LX = 0.04;
  // Dialogue voices: five vowel pairs (formants) so neighbouring blips never repeat.
  const VOWELS = [[700, 1150], [450, 1900], [330, 2300], [560, 900], [390, 1000]];

  const FX = {
    // ============ player ============
    // (round 1: slash/slash2/slash3/arrow/beam gain +2 dB)
    slash: { cls: "critical", lufs: -15, gain: 2, prio: 5, max: 2, variants: 4, vary: { cents: 60, db: 0.8 }, layers: swing(1) },
    slash2: { cls: "critical", lufs: -15, gain: 2, prio: 5, max: 2, variants: 4, vary: { cents: 60, db: 0.8 }, sr: 32000, layers: swing(2) },
    slash3: { cls: "critical", lufs: -15, gain: 2, prio: 5, max: 2, variants: 4, vary: { cents: 60, db: 0.8 }, sr: 32000, echo: 0.06, layers: swing(3) },
    // throwing a pot or rock: a slower, lower whoosh than the sword and the arms' push
    throw: { cls: "world", lufs: -17, prio: 3, max: 2, variants: 3, vary: { cents: 60, db: 1 }, layers: (v, r) => [
      noise(0, 0.24, bp([[0, 300], [0.12, rnd(r, 1000, 1300)], [0.24, 500]], 1.1), 0, { a: 0.1, d: 0.16 }, "pink"),
      noise(0, 0.03, lp(800), -12, { a: 0.003, d: 0.03 }, "pink"),
    ] },
    // sword beam: a glassy tone that leaps up a fifth, beating against a near copy (a flutter)
    beam: { cls: "critical", lufs: -16, gain: 2, prio: 4, max: 2, variants: 2, vary: { cents: 25 }, echo: 0.18, verb: 0.1, layers: () => {
      const f = [[0, 660], [0.04, 990], [0.3, 930]];
      return [
        fm(0, f, 2, [1.6, 0.3], 0.3, 0, { a: 0.006, d: 0.34 }),
        tone("sine", 0, f.map(p => [p[0], p[1] * 1.013]), 0.3, -3, { a: 0.006, d: 0.34 }),
        tone("sine", 0, f.map(p => [p[0], p[1] * 2.003]), 0.22, -12, { a: 0.01, d: 0.22 }),
        noise(0, 0.1, hp(3500), -16, { a: 0.02, d: 0.1 }),
        noise(0, 0.008, bp(4000, 1.2), -8, { a: 0.0005, h: 0.002, d: 0.006 }),   // crisp start
      ];
    } },
    // the beam breaks on a wall: four falling glass pings and a puff
    beam_burst: { cls: "world", lufs: -18, prio: 3, max: 2, cool: 0.12, variants: 2, vary: { cents: 40 }, echo: 0.2, layers: (v, r) => [
      ...[3300, 2650, 2150, 1720].map((f, i) => modal(i * 0.03, f * rnd(r, 0.97, 1.03), GLASS(0.22), -i * 1.5)),
      noise(0, 0.18, bp(1500, 0.9), -4, { a: 0.004, d: 0.18 }, "pink"),
    ] },
    hurt: { cls: "critical", lufs: -10, prio: 9, max: 1, variants: 2, vary: { cents: 30, db: 0.5 }, duck: -4, duckHold: 0.12, duckAtt: 0.01, duckRel: 0.3, layers: (v, r) => hurtLayers(r, false, false, true) },
    hurt_heavy: { cls: "critical", lufs: -10.6, prio: 9, max: 1, variants: 2, vary: { cents: 30, db: 0.5 }, duck: -5, duckHold: 0.15, duckAtt: 0.01, duckRel: 0.35, layers: (v, r) => hurtLayers(r, true, false, true) },
    hurt_ring: { cls: "critical", lufs: -11.5, prio: 9, max: 1, variants: 2, vary: { cents: 30, db: 0.5 }, duck: -3, duckHold: 0.1, duckAtt: 0.01, duckRel: 0.3, layers: (v, r) => hurtLayers(r, false, true, true) },
    // death (150 frames = 2.5 s, one buffer keyed to the frames of the animation):
    // f0 struck, f0-65 the spin (two sines 12 Hz apart = a flutter at its 5-frame steps),
    // f65 the fall, f114 the smoke and three falling bells that end before game over
    die: { cls: "big", lufs: -13.5, prio: 9, max: 1, verb: 0.2, echo: 0.1, layers: (v, r) => [
      ...hurtLayers(r, true, false),
      tone("sine", 0.05, [[0, 300], [0.5, 600], [1.03, 250]], 1.03, -9, { a: 0.12, h: 0.6, d: 0.5 }),
      tone("sine", 0.05, [[0, 312], [0.5, 612], [1.03, 262]], 1.03, -9, { a: 0.12, h: 0.6, d: 0.5 }),
      thump(1.083, 125, 48, 0.2, -2, 0.5),
      noise(1.09, 0.25, lp(1400), -8, { a: 0.01, d: 0.25 }, "pink"),
      grit(1.1, 0.2, 80, bp(1800, 0.8), -14),
      noise(1.9, 0.4, bp([[0, 1200], [0.4, 500]], 0.8), -10, { a: 0.03, d: 0.4 }, "pink"),
      Object.assign(notes("bells", [[0, 69, 0.2, 0.55], [0.15, 65, 0.2, 0.5], [0.3, 62, 0.25, 0.5]], -2), { at: 1.93, dur: 0.52, env: { a: 0.0003, s: 1, d: 1, r: 0.1 } }),
    ] },
    // low health: a heartbeat instead of the old 1 kHz beep (the first four beats loud); the
    // names the game calls keep their own beat (beatPlay), the *_beat buffers are one beat each
    heartbeat_beat: { cls: "critical", lufs: -8.7, prio: 8, max: 2, verb: 0.08, layers: beat(false) },
    heartbeat_urgent_beat: { cls: "critical", lufs: -8.7, prio: 8, max: 2, verb: 0.08, layers: beat(true) },
    heartbeat: { cls: "critical", prio: 8, play: beatPlay("heartbeat_beat", 0.8) },
    heartbeat_urgent: { cls: "critical", prio: 8, play: beatPlay("heartbeat_urgent_beat", 0.7) },
    beep: { cls: "critical", prio: 8, play: beatPlay("heartbeat_beat", 0.8) },
    // falling into a pit: wind that sinks and darkens, with a growing echo behind it
    fall: { cls: "world", lufs: -16, prio: 5, max: 1, echo: 0.35, verb: 0.15, layers: [
      noise(0, 0.45, bp([[0, 1900], [0.45, 280]], 2.5), 0, { a: 0.02, h: 0.05, d: 0.5 }, "pink"),
      tone("sine", 0, [[0, 620], [0.45, 115]], 0.45, -9, { a: 0.01, h: 0.05, d: 0.5 }),
      noise(0, 0.5, lp([[0, 900], [0.5, 250]]), -12, { a: 0.1, d: 0.4 }, "brown"),
      noise(0.16, 0.3, bp([[0, 900], [0.3, 260]], 2), -13, { a: 0.03, d: 0.3 }, "pink"),
      noise(0.32, 0.3, bp([[0, 600], [0.3, 220]], 2), -16, { a: 0.03, d: 0.3 }, "pink"),
    ] },
    // stepping into lava: a splash, a sizzle and a cloud of steam
    lava: { cls: "critical", lufs: -15, prio: 7, max: 1, verb: 0.1, layers: (v, r) => [
      thump(0, 150, 60, 0.15, 0, 0.4),
      noise(0, 0.05, bp(900, 1.5), -6, { a: 0.002, d: 0.06 }, "pink"),
      grit(0.02, 0.45, [320, 120], hp(2000), -6, 0.0015),
      noise(0.03, 0.45, bp([[0, 3500], [0.45, 6000]], 1), -10, { a: 0.04, d: 0.45 }),
      ...[0.06, 0.13, 0.22].map(t => tone("sine", t + rnd(r, 0, 0.03), [rnd(r, 300, 420), rnd(r, 700, 900)], 0.03, -12, { a: 0.002, d: 0.035 })),
    ] },
    // back at the room's entrance after a fall: a small puff and a faint up-glint
    respawn: { cls: "world", lufs: -18, prio: 4, max: 1, echo: 0.1, layers: [
      noise(0, 0.2, bp([[0, 500], [0.2, 1400]], 1), 0, { a: 0.05, d: 0.15 }, "pink"),
      fm(0.05, [1200, 1800], 2, [1, 0.2], 0.15, -10, { a: 0.02, d: 0.15 }),
    ] },

    // ============ combat ============
    // enemy struck, by material (organic is the default)
    // (loud over 100 ms, not peaky: the thump 3 dB under the others, the body held 30 ms and a
    // flesh "slap" near 2 kHz, where a little level reads as a lot of loudness)
    hit: { cls: "critical", lufs: -10.1, prio: 6, max: 3, cool: 0.03, variants: 4, vary: { cents: 90, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 1, -3),
      Object.assign(noise(0.01, 0.1, bp(rnd(r, 700, 950), 2), -2, { a: 0.008, h: 0.03, d: 0.085 }), { drive: 2.5 }),   // (drive: denser, not peakier; starts after the thump's first peak)
      noise(0.006, 0.07, bp(rnd(r, 1900, 2400), 1.4), -9, { a: 0.004, h: 0.015, d: 0.06 }),
    ] },
    // (round 1: the material variants as loud as the plain hit - thumps lower, the bodies held
    // 30-45 ms and a driven 1.7-2.8 kHz layer, so they gain 3 dB over 100 ms at the same peak)
    hit_slime: { cls: "critical", lufs: -9.8, prio: 6, max: 3, cool: 0.03, variants: 3, vary: { cents: 80, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 0.9, -7),
      Object.assign(noise(0.003, 0.12, bp([[0, 400], [0.03, rnd(r, 1250, 1550)], [0.12, 300]], 4), -1, { a: 0.004, h: 0.03, d: 0.1 }), { drive: 2.5 }),
      Object.assign(noise(0.008, 0.09, bp(rnd(r, 1700, 2100), 2.2), -6, { a: 0.006, h: 0.035, d: 0.06 }), { drive: 2 }),
      tone("sine", 0.006, [[0, 300], [0.03, 520], [0.1, 210]], 0.1, -7, { a: 0.004, h: 0.03, d: 0.09 }),
    ] },
    hit_armor: { cls: "critical", lufs: -9.7, prio: 6, max: 3, cool: 0.03, variants: 3, vary: { cents: 70, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 0.95, -8),
      modal(0.02, rnd(r, 820, 980), METAL(0.35), -4, { dur: 0.004, amp: 0.2, f: 3000, q: 1, type: "bp" }),
      Object.assign(fm(0.004, rnd(r, 1900, 2200), 1.41, [3, 1], 0.1, -4, { a: 0.003, h: 0.04, d: 0.08 }), { drive: 1.2 }),   // the plate's clang
      Object.assign(noise(0.004, 0.1, bp(2800, 1.5), -9, { a: 0.004, h: 0.04, d: 0.06 }), { drive: 2 }),
    ] },
    hit_spirit: { cls: "critical", lufs: -9.9, prio: 6, max: 3, cool: 0.03, variants: 3, vary: { cents: 70, db: 1 }, echo: 0.1, layers: (v, r) => [
      ...hitCore(r, 1.1, -9),
      modal(0.003, rnd(r, 1150, 1300), GLASS(0.3), -1),
      modal(0.01, rnd(r, 1700, 1900), GLASS(0.2), -8),
      fm(0.004, rnd(r, 2300, 2500), 2, [1.5, 0.5], 0.09, -8, { a: 0.003, h: 0.03, d: 0.08 }),
      noise(0.01, 0.15, hp(2200), -11, { a: 0.02, h: 0.04, d: 0.12 }),
    ] },
    // a blow that does nothing: bright ringing metal and sparks, no low end ("didn't hurt it")
    // (the ring lasts about twice as long as before and the mallet is softer: the same loudness
    // over 100 ms needs a much lower peak, so it can stand 4 LU above the music)
    // (a blow held on a shield can ask for the clank every few ticks: one ring per 0.2 s)
    clank: { cls: "critical", lufs: -10.8, prio: 5, max: 2, cool: 0.2, variants: 3, vary: { cents: 50, db: 0.7 }, verb: 0.08, layers: (v, r) => [
      click(0, -8),
      modal(0, rnd(r, 1000, 1250), [[1, 1, 0.75], [1.41, 0.75, 0.6], [2.76, 0.55, 0.4], [3.9, 0.35, 0.25], [5.2, 0.2, 0.14]], 0, { dur: 0.002, amp: 0.3, f: 5000, q: 1, type: "bp" }),
      grit(0.002, 0.06, 900, hp(4000), -8, 0.0008),
    ] },
    // shield blocks a shot: a plate ring and the shot glancing away upward (the ring held
    // longer and the glance louder, for the same reason as clank)
    shield: { cls: "critical", lufs: -10.8, prio: 5, max: 2, variants: 2, vary: { cents: 40, db: 0.6 }, layers: (v, r) => [
      click(0, -8),
      modal(0, rnd(r, 860, 940), [[1, 1, 0.5], [1.5, 0.7, 0.4], [2.9, 0.5, 0.26], [4.3, 0.2, 0.14]], 0),
      noise(0.01, 0.12, bp([[0, 1000], [0.12, 3200]], 1.6), -4, { a: 0.03, h: 0.03, d: 0.08 }),
    ] },
    // enemy defeated: the last blow, a pop and the cloud (sizes and materials)
    // (thump 3 dB lower, the pop and the cloud fuller: louder over 100 ms at the same peak)
    enemy_die: { cls: "critical", lufs: -10.5, prio: 5, max: 3, variants: 3, vary: { cents: 60, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 1, -3),
      noise(0.004, 0.06, bp(850, 2), -3, { a: 0.002, h: 0.02, d: 0.05 }),
      tone("sine", 0.035, [rnd(r, 460, 540), 180], 0.06, -3, { a: 0.002, h: 0.015, d: 0.05 }),
      poof(0.03, 0.27, 1100, 300, 0),
    ] },
    // (round 1: the sizes and materials as loud as the plain one, the big one a little louder:
    // thumps lower, a held driven pop body, the chimes under it)
    enemy_die_small: { cls: "critical", lufs: -9.9, prio: 5, max: 3, variants: 3, vary: { cents: 70, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 1.25, -7),
      Object.assign(noise(0.004, 0.06, bp(1100, 2), -3, { a: 0.002, h: 0.03, d: 0.04 }), { drive: 2 }),
      tone("sine", 0.035, [rnd(r, 650, 760), 260], 0.035, -6, { a: 0.002, h: 0.01, d: 0.035 }),
      poof(0.035, 0.2, 1400, 450, -2),
    ] },
    enemy_die_big: { cls: "critical", lufs: -9.9, prio: 6, max: 2, variants: 3, vary: { cents: 50, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 0.75, -6),
      thump(0.01, 120, 45, 0.15, -7, 0.5),
      Object.assign(noise(0.004, 0.09, bp(750, 2), -1, { a: 0.002, h: 0.05, d: 0.05 }), { drive: 2.5 }),
      Object.assign(noise(0.008, 0.08, bp(rnd(r, 1800, 2200), 1.6), -7, { a: 0.004, h: 0.04, d: 0.05 }), { drive: 2 }),
      modal(0.02, rnd(r, 700, 850), METAL(0.14), -12),
      modal(0.07, rnd(r, 1100, 1300), METAL(0.08), -14),
      poof(0.05, 0.35, 800, 220, -1),
    ] },
    enemy_die_slime: { cls: "critical", lufs: -10, prio: 5, max: 3, variants: 3, vary: { cents: 70, db: 1 }, layers: (v, r) => [
      ...hitCore(r, 0.9, -8),
      Object.assign(noise(0.004, 0.08, bp(rnd(r, 1300, 1600), 2.5), -5, { a: 0.004, h: 0.03, d: 0.06 }), { drive: 2 }),
      tone("sine", 0.05, [[0, 250], [0.03, 600], [0.06, 300]], 0.06, -7, { a: 0.003, d: 0.07 }),
      tone("sine", 0.11, [[0, 300], [0.03, 720], [0.06, 330]], 0.06, -6, { a: 0.003, d: 0.07 }),
      noise(0.02, 0.14, bp([[0, 500], [0.04, 1300], [0.14, 350]], 4), -6, { a: 0.004, d: 0.14 }),
      poof(0.08, 0.22, 700, 250, -8),
    ] },
    enemy_die_spirit: { cls: "critical", lufs: -11.1, prio: 5, max: 3, variants: 3, vary: { cents: 60, db: 1 }, echo: 0.25, layers: (v, r) => [
      ...hitCore(r, 1.1, -6),
      modal(0.01, rnd(r, 1500, 1700), GLASS(0.3), -4),
      modal(0.08, rnd(r, 1100, 1250), GLASS(0.3), -7),
      modal(0.15, rnd(r, 800, 900), GLASS(0.3), -10),
      noise(0.02, 0.35, bp([[0, 3000], [0.35, 900]], 1.2), -9, { a: 0.1, d: 0.3 }),
    ] },
    // frozen by the boomerang or hook: a wooden bonk and a dizzy warble (not the hurt sound)
    stun: { cls: "world", lufs: -16, prio: 4, max: 2, variants: 2, vary: { cents: 40 }, layers: [
      click(0, -6),
      fm(0, 700, 1, [2, 0], 0.08, 0, { a: 0.001, d: 0.09 }),
      tone("sine", 0.03, 1600, 0.25, -10, { a: 0.01, d: 0.3 }, null, { steps: [[0, 0], [0.042, 3], [0.083, 0], [0.125, 3], [0.167, 0], [0.208, 3]] }),
    ] },

    // ============ items ============
    // a bomb set down: an iron thump and a tick, then the fuse starts to fizz
    bomb_place: { cls: "world", lufs: -17, prio: 3, max: 2, variants: 2, vary: { cents: 40 }, layers: [
      thump(0, 140, 90, 0.06, 0, 0.3),
      fm(0.004, 400, 1, [1.5, 0.2], 0.03, -4, { a: 0.0005, d: 0.035 }),
      grit(0.03, 0.12, 200, hp(3000), -12, 0.001),
    ] },
    // fuse fizz while the bomb waits (loop; the game starts it with Sound.loop and stops it on the blast)
    bomb_fuse: { cls: "loop", prio: 2, max: 3, loop: true, tail: 0.0001, layers: [
      bed(0.8 + LX, hp(3200), -10),
      grit(0, 0.8 + LX, 220, bp(4500, 0.8), 0, 0.0008, { a: 0.001, s: 1, d: 1, r: 0 }),
    ] },
    // the last half second of the fuse: a bright tick on each blink
    bomb_tick: { cls: "world", lufs: -18, prio: 3, max: 2, layers: [
      click(0, -4),
      fm(0, 2400, 1.41, [1.5, 0.2], 0.03, 0, { a: 0.0005, d: 0.035 }),
    ] },
    explosion: { cls: "big", lufs: -10, prio: 7, max: 3, variants: 3, vary: { cents: 70, db: 1 }, duck: -6, duckHold: 0.25, duckAtt: 0.01, duckRel: 0.6, verb: 0.22, echo: 0.08, layers: (v, r) => [
      click(0, -8),
      ...blast(0, 0, 1, 0, true),
      noise(0.05, 0.7, lp([[0, 700], [0.7, 200]]), -10, { a: 0.05, d: 0.7 }, "brown"),
      ...debris(r, 0.18, 0.8, 12 + Math.floor(r() * 6), -14),
    ] },
    // arrow: the bowstring and the fletching's hiss (round 1: the string 4 dB lower and the hiss
    // held 30 ms - the string alone had filled the peak -, plus a crisp 8 ms start)
    arrow: { cls: "critical", lufs: -16, gain: 1, prio: 4, max: 2, variants: 3, vary: { cents: 50, db: 0.8 }, layers: (v, r) => [
      { type: "pluck", f: rnd(r, 165, 195), t60: 0.06, bright: 0.75, pick: 0.2, dur: 0.14, gain: -5 },
      click(0, -12),
      noise(0.01, 0.13, bp([[0, 2200], [0.13, 5500]], 1.2), -3, { a: 0.03, h: 0.03, d: 0.1 }),
      noise(0, 0.01, bp(3000, 1.2), -8, { a: 0.0005, h: 0.002, d: 0.008 }),
    ] },
    // an arrow sticks in a wall: a thunk and the shaft quivering
    arrow_thunk: { cls: "world", lufs: -17, prio: 3, max: 2, variants: 2, vary: { cents: 60 }, layers: (v, r) => [
      thump(0, 300, 120, 0.04, 0),
      noise(0, 0.03, bp(1200, 1.5), -5, { a: 0.001, d: 0.035 }),
      modal(0, rnd(r, 380, 440), WOOD(0.06), -6),
      tone("tri", 0.01, 180, 0.14, -10, { a: 0.004, d: 0.16 }, null, { vib: [70, 14, 0] }),
    ] },
    // boomerang in flight (the game repeats it every 8 frames): one soft "whup" of the spin
    boomer: { cls: "loop", lufs: -22, prio: 2, max: 2, variants: 5, vary: { cents: 45, db: 1 }, layers: (v, r) => [
      noise(0, 0.13, bp([[0, 700], [0.06, rnd(r, 1300, 1600)], [0.13, 800]], 2.2), 0, { a: 0.055, d: 0.08 }, "pink"),
      noise(0.03, 0.06, hp(4000), -16, { a: 0.02, d: 0.05 }),
    ] },
    boom_throw: { cls: "world", lufs: -18, prio: 3, max: 1, variants: 2, vary: { cents: 40 }, layers: (v, r) => [
      noise(0, 0.16, bp([[0, 500], [0.08, rnd(r, 1500, 1800)], [0.16, 900]], 1.5), 0, { a: 0.06, d: 0.1 }, "pink"),
      thump(0, 180, 120, 0.04, -12),
    ] },
    // continuous whirr while it flies (loop, 3 whups per 0.4 s = the 8-frame spin)
    boom_loop: { cls: "loop", lufs: -23, prio: 2, max: 1, loop: true, tail: 0.0001, layers: (v, r) => [
      bed(0.4 + LX, bp(1200, 1.2), -22, "pink"),
      // (the fourth whup is only the start of the next turn, cut where the loop ends)
      ...[0, 0.1333, 0.2667, 0.4].map(t => noise(t, t === 0.4 ? LX : 0.13, bp([[0, 750], [0.06, rnd(r, 1350, 1550)], [0.13, 800]], 2.2), 0, { a: 0.055, d: 0.08, r: t === 0.4 ? 0 : 0.03 }, "pink")),
    ] },
    boom_catch: { cls: "world", lufs: -18, prio: 3, max: 1, layers: [
      click(0, -6),
      modal(0, 520, WOOD(0.07), 0),
      { type: "pluck", at: 0.01, f: 330, t60: 0.05, bright: 0.5, dur: 0.1, gain: -8 },
    ] },
    // candle flame: a whoosh as it lights, a low roar and crackle
    flame: { cls: "world", lufs: -16, prio: 3, max: 2, variants: 3, vary: { cents: 50, db: 1 }, layers: [
      noise(0, 0.14, bp([[0, 450], [0.12, 2000]], 1.2), 0, { a: 0.07, d: 0.12 }, "pink"),
      noise(0.03, 0.4, lp([[0, 1400], [0.4, 500]]), -8, { a: 0.02, d: 0.45 }, "brown"),
      grit(0.05, 0.6, [260, 90], lp(3500), -7, 0.0012, { a: 0.02, d: 0.7 }),
    ] },
    flame_loop: { cls: "loop", prio: 2, max: 2, loop: true, tail: 0.0001, layers: [
      bed(1 + LX, lp(900), -6, "brown"),
      grit(0, 1 + LX, 150, lp(3500), 0, 0.0012, { a: 0.001, s: 1, d: 1, r: 0 }),
    ] },
    // a bush burnt to a stump: a whump, leaves crackling for 0.9 s
    bush_burn: { cls: "world", lufs: -16, prio: 4, max: 1, layers: [
      noise(0, 0.25, lp([[0, 600], [0.25, 1600]]), 0, { a: 0.04, d: 0.25 }, "brown"),
      grit(0.03, 0.9, [300, 60], bp(3000, 0.7), -3, 0.0012, { a: 0.05, h: 0.3, d: 0.8 }),
      noise(0.05, 0.7, hp(3000), -14, { a: 0.1, d: 0.7 }),
      thump(0.02, 120, 70, 0.1, -8),
    ] },
    // tether hook fired: a spring thump and the chain paying out
    hook: { cls: "world", lufs: -16, prio: 4, max: 2, variants: 2, vary: { cents: 40 }, layers: (v, r) => {
      const ly = [click(0, -8), thump(0, 210, 120, 0.05, -2), noise(0, 0.22, bp([[0, 900], [0.22, 2600]], 2), -6, { a: 0.02, d: 0.2 }, "pink")];
      for (let i = 0; i < 9; i++) ly.push(modal(0.02 + i * 0.025 + rnd(r, 0, 0.01), r() < 0.5 ? rnd(r, 2100, 2300) : rnd(r, 3000, 3200), [[1, 1, 0.03], [1.41, 0.5, 0.02]], -10 - i * 0.6));
      return ly;
    } },
    // the hook bites a post (success, not the clank): a clang and the chain going taut
    hook_bite: { cls: "world", lufs: -15, prio: 5, max: 1, layers: [
      click(0, -4),
      modal(0, 1300, METAL(0.25), 0),
      { type: "pluck", at: 0.02, f: 110, t60: 0.06, bright: 0.6, dur: 0.25, gain: -4 },
      tone("sine", 0.02, 90, 0.15, -8, { a: 0.004, d: 0.18 }, null, { vib: [30, 11, 0] }),
    ] },
    // reeling in (loop): a ratchet every 30 ms
    hook_reel: { cls: "loop", lufs: -21, prio: 3, max: 1, loop: true, tail: 0.0001, layers: (v, r) => {
      const ly = [bed(0.36 + LX, bp(2000, 1), -30)];
      for (let i = 0; i < 14; i++) ly.push(noise(i * 0.03, i === 13 ? 0.01 : 0.012, bp(rnd(r, 2300, 2700), 3), rnd(r, -2, 0), { a: 0.0005, d: 0.014, r: i >= 12 ? 0 : 0.01 }));
      return ly;
    } },
    // the hook coming back: the rattle slows, a clink at the catch
    hook_retract: { cls: "world", lufs: -18, prio: 3, max: 1, layers: (v, r) => {
      const ly = [];
      let t = 0;
      for (let i = 0; i < 8; i++) { ly.push(modal(t, rnd(r, 2100, 3200), [[1, 1, 0.03], [1.41, 0.5, 0.02]], -4 - i)); t += 0.02 + i * 0.012; }
      ly.push(modal(t + 0.02, 1700, METAL(0.1), 0), click(t + 0.02, -8));
      return ly;
    } },
    // earth hammer on a peg: crack, sub, stone body, a wooden tock and the peg sinking a step
    hammer: { cls: "critical", lufs: -13.5, prio: 6, max: 2, variants: 3, vary: { cents: 40, db: 0.7 }, duck: -3, duckHold: 0.1, duckAtt: 0.01, duckRel: 0.25, layers: (v, r) => [
      ...hammerCore(),
      modal(0.002, rnd(r, 380, 450), WOOD(0.08), -4),
      thump(0.075, 90, 50, 0.08, -8),
    ] },
    hammer_swing: { cls: "world", lufs: -18, prio: 3, max: 1, variants: 2, vary: { cents: 40 }, layers: [
      noise(0, 0.25, bp([[0, 200], [0.16, 900], [0.25, 400]], 1.3), 0, { a: 0.14, d: 0.12 }, "pink"),
      ...creak(0, 0.14, [55, 40], [380, 900], -12),
    ] },
    // a shellback flipped by the hammer: the blow, a shell clack and its legs scrabbling
    hammer_shell: { cls: "critical", lufs: -13, prio: 6, max: 2, variants: 2, vary: { cents: 40 }, duck: -3, duckHold: 0.1, duckAtt: 0.01, layers: (v, r) => [
      ...hammerCore(),
      modal(0.004, rnd(r, 620, 700), WOOD(0.12), -3),
      grit(0.08, 0.25, 400, bp(3000, 1), -9, 0.001),
    ] },
    // picking up a pot (clay scrape) or a rock (a low grind under it)
    lift_pot: { cls: "world", lufs: -19, prio: 3, max: 1, variants: 2, vary: { cents: 50 }, layers: (v, r) => [
      grit(0, 0.12, 400, bp(700, 1.5), 0, 0.003),
      modal(0.1, rnd(r, 900, 1100), CLAY(0.05), -6),
    ] },
    lift_rock: { cls: "world", lufs: -18, prio: 3, max: 1, variants: 2, vary: { cents: 40 }, layers: (v, r) => [
      grit(0, 0.15, 300, bp(600, 1.2), -2, 0.004),
      noise(0, 0.22, lp(250), 0, { a: 0.03, d: 0.22 }, "brown"),
      modal(0.14, rnd(r, 500, 600), STONE(0.04), -8),
    ] },
    // a pot breaks: 6-8 clay shards ringing at their own pitches, grit and a small thud
    shatter: { cls: "world", lufs: -15, prio: 4, max: 2, variants: 4, vary: { cents: 70, db: 1 }, layers: (v, r) => {
      const ly = [thump(0, 170, 80, 0.06, -4), noise(0, 0.015, hp(2500), -2, { a: 0.0005, d: 0.02 })];
      const n = 6 + Math.floor(r() * 3);
      for (let i = 0; i < n; i++) ly.push(modal(rnd(r, 0, 0.09), rnd(r, 2000, 5200), CLAY(rnd(r, 0.04, 0.12)), rnd(r, -10, -4)));
      ly.push(grit(0.01, 0.2, [500, 60], bp(4000, 0.9), -8, 0.0008));
      return ly;
    } },
    // a thrown rock lands
    rock_land: { cls: "world", lufs: -16, prio: 3, max: 2, variants: 2, vary: { cents: 50 }, layers: (v, r) => [
      thump(0, 110, 50, 0.1, 0, 0.4),
      modal(0, rnd(r, 450, 520), STONE(0.05), -6),
      grit(0.01, 0.15, [250, 30], bp(2200, 0.8), -9, 0.0015),
    ] },
    // potion: a cork pop, three gulps and a rising shimmer in the key
    potion_drink: { cls: "pickup", lufs: -17, prio: 6, max: 1, key: true, echo: 0.12, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72));
      const ly = [click(0, -8), tone("sine", 0, [600, 900], 0.03, 0, { a: 0.001, d: 0.035 })];
      [0.18, 0.29, 0.4].forEach(t => ly.push(tone("sine", t, [160, 260], 0.05, -3, { a: 0.004, d: 0.06 }), noise(t, 0.05, lp(450), -8, { a: 0.004, d: 0.06 }, "pink")));
      [4, 7, 9, 11].forEach((d, i) => ly.push(note("celesta", 0.55 + i * 0.06, m(d), 0.1, 0.7, -2, 0.5)));
      return ly;
    } },
    // one tick per half heart refilled (the game raises `pitch` 1 semitone per tick)
    heal_tick: { cls: "pickup", lufs: -19, prio: 3, max: 3, key: true, layers: (v, r, key) => [note("harp", 0, deg(keyAt(key, 67))(0), 0.1, 0.8, 0, 0.18)] },
    // the fairy wisp heals: a shimmer up and an airy chord
    wisp_heal: { cls: "pickup", prio: 5, max: 1, key: true, echo: 0.25, verb: 0.2, layers: (v, r, key) => {
      const k = keyAt(key, 67), m = deg(k);
      return [
        ...[7, 9, 11, 14].map((d, i) => note("celesta", i * 0.06, m(d), 0.12, 0.75, 0, 0.7)),
        notes("glass", [[0.1, m(0), 0.5, 0.5], [0.1, m(2), 0.5, 0.45], [0.1, m(4), 0.5, 0.45]], -3, 1.0),
      ];
    } },

    // ============ pickups and rewards ============
    // one gem: ONE struck chime, no melody: mi' and do'' (a sixth) on the glockenspiel at the
    // same instant, the top note glinting again softly (same pitch) and a high shimmer.
    // (Not a two-note rise: the old 5th -> tonic pair was the famous coin gesture.)
    // gem climbs on quick pickups.
    gem_one: { cls: "pickup", prio: 3, max: 2, key: true, vary: { db: 0.6 }, sr: 32000, layers: (v, r, key) => {
      const m = deg(keyAt(key, 77));
      return [note("glock", 0, m(2), 0.2, 0.8, -2, 0.4), note("glock", 0, m(7), 0.2, 0.85, 0, 0.45),
        note("glock", 0.075, m(7), 0.1, 0.45, -13, 0.3),
        noise(0.004, 0.09, hp(7000), -22, { a: 0.02, d: 0.08 }), grit(0.02, 0.14, 260, hp(6500), -21, 0.0005)];
    } },
    gem: { cls: "pickup", prio: 3, play: comboPlay("gem_one", [2, 7]) },
    // five gems: the same chord tones cascading DOWN (do'' - sol' - mi', 28 ms apart, all
    // ringing on) and a longer sparkle: the gem family without a rising two-note start
    gem5_notes: { cls: "pickup", prio: 3, max: 2, key: true, vary: { db: 0.6 }, sr: 32000, layers: (v, r, key) => {
      const m = deg(keyAt(key, 77));
      return [note("glock", 0, m(7), 0.22, 0.85, 0, 0.45), note("glock", 0.028, m(4), 0.2, 0.75, -2, 0.4), note("glock", 0.056, m(2), 0.2, 0.75, -2, 0.4),
        note("glock", 0.14, m(7), 0.1, 0.45, -13, 0.3),
        noise(0.004, 0.14, hp(7000), -21, { a: 0.03, d: 0.1 }), grit(0.05, 0.2, 300, hp(5500), -17, 0.0006)];
    } },
    gem5: { cls: "pickup", prio: 3, play: comboPlay("gem5_notes", [2, 4, 7]) },
    // 10/30/50 gems: a quick count-up through the pentatonic (0.6 s) and a sparkle
    gems_big: { cls: "pickup", prio: 5, max: 1, key: true, sr: 32000, layers: (v, r, key) => {
      const k = keyAt(key, 72), m = deg(k), minor = scale(k)[2] === 3;
      const pent = minor ? [0, 2, 3, 4, 6, 7, 9, 10] : [0, 1, 2, 4, 5, 7, 8, 9];
      return [...pent.map((d, i) => note("glock", i * 0.065, m(d), 0.08, 0.6 + i * 0.04, -1, i === 7 ? 0.45 : 0.2)),
        grit(0.42, 0.25, 350, hp(5000), -14, 0.0006)];
    } },
    // bombs picked up: iron clinks and a thump (not the gem glint)
    bombs_pickup: { cls: "pickup", prio: 3, max: 1, layers: [
      thump(0, 160, 90, 0.06, -4),
      modal(0, 1300, METAL(0.12), 0),
      modal(0.06, 1550, METAL(0.1), -3),
    ] },
    // small heart: a warm harp note and a soft bloom a third above, lower and rounder than a gem
    heart: { cls: "pickup", prio: 4, max: 2, key: true, vary: { db: 0.6 }, echo: 0.1, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67));
      return [note("harp", 0, m(0), 0.3, 0.9, 0, 0.45), note("harp", 0.045, m(2), 0.3, 0.7, -3, 0.45), note("ocarina", 0.04, m(2), 0.22, 0.6, -4)];
    } },
    key: { cls: "jingle", lufs: -16, prio: 6, max: 1, key: true, duck: -10, duckHold: 0.45, sr: 32000, verb: 0.15, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72));
      return [
        modal(0, 2800, [[1, 1, 0.06], [1.39, 0.6, 0.05], [1.82, 0.4, 0.03]], -2),
        modal(0.05, 3900, [[1, 1, 0.05], [1.39, 0.6, 0.04], [1.82, 0.4, 0.03]], -3),
        modal(0.1, 5100, [[1, 1, 0.05], [1.39, 0.6, 0.04], [1.82, 0.4, 0.03]], -4),
        note("glock", 0.12, m(7), 0.1, 0.85, -1, 0.7),
        note("celesta", 0.12, m(4), 0.1, 0.6, -6, 0.6),
      ];
    } },
    // dungeon map: paper fluttering open and two bell notes (sol, then mi' a sixth above)
    map: { cls: "pickup", prio: 5, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72)), ly = [];
      for (let i = 0; i < 6; i++) ly.push(noise(i * 0.04 + rnd(r, 0, 0.008), 0.025, bp(rnd(r, 2500, 4000), 1.2), -2 - i, { a: 0.004, d: 0.03 }));
      ly.push(note("glock", 0.24, m(4), 0.08, 0.7, -2, 0.4), note("glock", 0.32, m(9), 0.2, 0.85, 0, 0.6));
      return ly;
    } },
    // compass: a bell, the needle ticking and settling, a short shimmer
    compass: { cls: "pickup", prio: 5, max: 1, key: true, layers: (v, r, key) => [
      note("glock", 0, deg(keyAt(key, 72))(7), 0.2, 0.85, 0, 0.6),
      ...[0.14, 0.2, 0.24].map((t, i) => modal(t, 3000 + i * 200, [[1, 1, 0.02], [2.1, 0.4, 0.01]], -6 - i * 2)),
      grit(0.3, 0.2, 200, hp(6000), -14, 0.0006),
    ] },
    // major treasure held up (70 frames): the music pauses 1.17 s and goes on after.
    // Melody (trumpet): sol - do' - re' - fa' leaning into mi' over a sus4 chord that resolves.
    item_fanfare: { cls: "jingle", prio: 9, max: 1, key: true, pause: 1.17, echo: 0.12, verb: 0.3, layers: (v, r, key) => {
      const k = keyAt(key, 55), m = deg(k), T = m(0);
      return [
        notes("trumpet", [[0, m(4), 0.08, 0.75], [0.1, m(7), 0.19, 0.85], [0.3, m(8), 0.08, 0.8], [0.4, m(10), 0.25, 1], [0.66, m(9), 0.46, 0.95]]),
        notes("brass", [[0.1, T, 0.18, 0.7], [0.1, m(2), 0.18, 0.65], [0.1, m(4), 0.18, 0.65],
          [0.4, T, 0.25, 0.8], [0.4, m(3), 0.25, 0.75], [0.4, m(4), 0.25, 0.75],
          [0.66, T, 0.46, 0.85], [0.66, m(2), 0.46, 0.8], [0.66, m(4), 0.46, 0.8]], -3),
        notes("timpani", [[0, T - 12, 0.3, 0.55], [0.4, T - 12, 0.3, 0.85], [0.66, T - 12, 0.4, 0.95]], -2, 1.25),
        ...[14, 16, 18, 21].map((d, i) => note("glock", 0.66 + i * 0.04, m(d), 0.1, 0.55, -8, 0.5)),
        noise(0.05, 0.36, hp(3000), -16, { a: 0.33, d: 0.08 }),
        note("crash", 0.66, 69, 0.5, 0.35, -12, 0.6),
      ];
    } },
    // heart container (70 frames, music paused): a harp roll on vi7 and a turn round the
    // fifth on celesta over IV -> I (a warm "amen" close)
    heart_fanfare: { cls: "jingle", prio: 9, max: 1, key: true, pause: 1.17, echo: 0.15, verb: 0.3, layers: (v, r, key) => {
      const k = keyAt(key, 60), m = deg(k);
      return [
        ...[5, 7, 9, 11].map((d, i) => note("harp", i * 0.05, m(d), 0.4, 0.75, 0, 1.0 - i * 0.05)),
        notes("celesta", [[0.3, m(11), 0.1, 0.8], [0.4, m(10), 0.1, 0.75], [0.5, m(12), 0.1, 0.8], [0.6, m(11), 0.35, 0.9]], 0, 1.3),
        notes("glass", [[0.28, m(3), 0.32, 0.5], [0.28, m(5), 0.32, 0.45], [0.28, m(7), 0.32, 0.45],
          [0.6, m(0), 0.35, 0.55], [0.6, m(2), 0.35, 0.5], [0.6, m(4), 0.35, 0.5]], -3, 1.25),
        note("bells", 0.6, m(7), 0.4, 0.45, -8, 0.7),
      ];
    } },
    // heart piece: the game passes {count: pieces now owned, 1-4}; one more bell per piece
    heart_piece: { cls: "jingle", prio: 9, pause: 1.17, len: 1, play: (S, o) => S.sfx("heart_piece" + Math.max(1, Math.min(4, o.count || 1)), o) },
    // quest or minor item: a short marimba phrase; the music ducks 10 dB like secret/key (only
    // big rewards pause it - the owner's decision)
    item_small: { cls: "jingle", prio: 9, max: 1, key: true, duck: -10, duckHold: 0.5, duckAtt: 0.03, duckRel: 0.6, verb: 0.2, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60));
      return [notes("marimba", [[0, m(2), 0.1, 0.75], [0.08, m(4), 0.1, 0.8], [0.16, m(7), 0.3, 0.9]]), note("pizz", 0.16, m(0) - 12, 0.3, 0.7, -4),
        note("glock", 0.2, m(11), 0.2, 0.55, -8, 0.5)];
    } },
    // Sunstone shard. The game also calls it when the ending starts (right after
    // Sound.music("ending"), whose first bars already are the shards rising): then only a soft
    // glint, so the ending music keeps its timing (one owner per moment).
    shard: { cls: "jingle", prio: 9, play: (S, o) => S.sfx(S.trackName === "ending" ? "shard_glint" : "shard_get", o) },
    // shard held up (110 frames, music paused 1.83 s): the Sunstone motif's three-note
    // shard (short, short, LONG) on choir with celesta above, bells on the long note, a string
    // floor and a dawn sparkle climbing at the end. Always major: the stone's own colour.
    shard_get: { cls: "jingle", prio: 9, max: 1, key: true, pause: 1.83, echo: 0.22, verb: 0.35, layers: (v, r, key) => {
      const k = keyAt(key, 60, "major"), T = k.tonic, fr = motif("fragment", T), u = 0.075;
      const ly = [], at = [0.18, 0.18 + fr[0][1] * u, 0.18 + (fr[0][1] + fr[1][1]) * u], end = 1.62;
      fr.forEach((n, i) => {
        const len = i < 2 ? n[1] * u : end - at[i];
        ly.push(note("choir", at[i], n[0], len, 0.8 + i * 0.05), note("celesta", at[i], n[0] + 12, i < 2 ? 0.12 : 0.6, 0.7 + i * 0.1, -4));
      });
      ly.push(notes("choir", [[at[2], T, end - at[2], 0.65], [at[2], T + 4, end - at[2], 0.6]], -3),
        note("bells", at[2], fr[2][0], 0.6, 0.6, -5, 0.95), note("bells", at[2] + 0.02, T - 12 >= 48 ? T - 12 : T, 0.6, 0.5, -9, 0.95),
        note("strings", at[2], T - 12, end - at[2], 0.45, -8),
        noise(0, 0.22, hp(5000), -20, { a: 0.18, d: 0.08 }));
      [0, 4, 7, 12, 16].forEach((s, i) => ly.push(note("glock", 1.0 + i * 0.07, T + 24 + s, 0.1, 0.5 + i * 0.05, -9, 0.6)));
      return ly;
    } },
    // a soft rising glint (no notes, no pause) for the ending's first frame
    shard_glint: { cls: "pickup", lufs: -22, prio: 5, max: 1, echo: 0.2, layers: [
      noise(0, 0.8, bp([[0, 3000], [0.8, 7000]], 1.2), 0, { a: 0.5, d: 0.4 }),
      grit(0.2, 0.7, [60, 300], hp(6000), -6, 0.0006, { a: 0.4, d: 0.4 }),
    ] },
    // the ending's "rise" (4 s, D major): six bells, one per shard, stacking into one chord
    // left to right, the choir holding it and the three-note shard on celesta above
    shard_ending: { cls: "jingle", prio: 9, max: 1, key: true, verb: 0.4, echo: 0.2, layers: () => {   // (key: true = render on first use)
      const ly = [50, 57, 62, 66, 69, 76].map((n, i) => note("bells", i * 0.35, n, 1.5, 0.6, -2, 0, -0.6 + i * 0.24));
      ly.push(notes("choir", [[1.0, 62, 2.7, 0.55], [1.0, 66, 2.7, 0.5], [1.0, 69, 2.7, 0.5], [1.4, 74, 2.3, 0.45]], -4),
        note("strings", 1.0, 50, 2.8, 0.45, -8));
      motif("fragment", 74).forEach((n, i) => ly.push(note("celesta", 2.0 + [0, 0.2, 0.4][i], n[0], i < 2 ? 0.18 : 1.2, 0.75)));
      [86, 90, 93, 98].forEach((n, i) => ly.push(note("glock", 3.0 + i * 0.08, n, 0.1, 0.45, -10, 0, i % 2 ? 0.4 : -0.4)));
      return ly;
    } },
    // secret place revealed (music ducked 11 dB): re - raised 4th (held: the mystery, over an
    // open chord with no third), then la falling to a long sol as the chord gains its third.
    // (No climb to the high tonic at the end: that ending was too close to a famous secret jingle.)
    secret: { cls: "jingle", prio: 7, max: 1, key: true, duck: -11, duckHold: 0.9, duckAtt: 0.03, duckRel: 0.6, echo: 0.22, verb: 0.3, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67)), fi = m(3) + 1;
      return [
        notes("celesta", [[0, m(1), 0.1, 0.7], [0.1, fi, 0.3, 0.8], [0.43, m(5), 0.09, 0.75], [0.54, m(4), 0.56, 0.95]], 0, 1.15),
        notes("glass", [[0.08, m(0) - 12, 0.5, 0.45], [0.08, m(1) - 12, 0.5, 0.4], [0.08, m(4) - 12, 0.5, 0.4]], -4, 0.85),
        notes("glass", [[0.54, m(0) - 12, 0.45, 0.5], [0.54, m(2) - 12, 0.45, 0.5], [0.54, m(4) - 12, 0.45, 0.5]], -3, 1.3),
        note("bells", 0.54, m(4) - 12, 0.4, 0.5, -8, 0.6),
        noise(0.2, 0.42, hp(4000), -18, { a: 0.34, d: 0.06 }),
      ];
    } },
    // a room's puzzle solved (music ducked 10 dB): sol - la - do' on bells with a glass chord
    solved: { cls: "jingle", prio: 7, max: 1, key: true, duck: -10, duckHold: 0.5, echo: 0.15, verb: 0.25, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67));
      return [
        notes("glock", [[0, m(4), 0.1, 0.7], [0.1, m(5), 0.1, 0.75], [0.2, m(7), 0.3, 0.9]], 0, 0.75),
        notes("glass", [[0.2, m(0) - 12, 0.3, 0.45], [0.2, m(2) - 12, 0.3, 0.45], [0.2, m(4) - 12, 0.3, 0.45]], -5, 0.95),
        note("bells", 0.2, m(7) - 12, 0.3, 0.45, -9, 0.6),
      ];
    } },

    // ============ world ============
    // a block pushed: stone dragging (grains catching unevenly) and a thump where it stops
    push: { cls: "world", lufs: -18, prio: 3, max: 1, variants: 2, layers: (v, r) => {
      const ly = [noise(0, 0.38, lp(260), -10, { a: 0.04, h: 0.25, d: 0.15 }, "brown")];
      for (let t = 0.02; t < 0.36; t += rnd(r, 0.02, 0.04)) ly.push(noise(t, rnd(r, 0.02, 0.04), bp(rnd(r, 750, 1100), 2.5), rnd(r, -3, 0), { a: 0.004, d: 0.04 }));
      ly.push(thump(0.38, 130, 60, 0.09, -7, 0.8), noise(0.38, 0.05, lp(800), -8, { a: 0.002, d: 0.06 }, "pink"));
      return ly;
    } },
    // a block sliding on ice: longer, smoother and higher, then a thud
    block_slide_ice: { cls: "world", prio: 3, max: 1, layers: [
      noise(0, 0.6, bp([[0, 2200], [0.6, 2900]], 2), 0, { a: 0.03, h: 0.45, d: 0.2 }),
      noise(0, 0.6, lp(300), -6, { a: 0.03, h: 0.45, d: 0.2 }, "brown"),
      thump(0.6, 120, 55, 0.1, 0, 0.4),
    ] },
    // key door: the key goes in, the lock clunks, the bolt slides, the door creaks open
    unlock: { cls: "world", lufs: -16, prio: 5, max: 1, verb: 0.15, echo: 0.06, layers: [
      modal(0, 3000, [[1, 1, 0.02], [1.7, 0.5, 0.015]], -6),
      modal(0.08, 180, [[1, 1, 0.12], [1.41, 0.6, 0.1], [2.3, 0.3, 0.06]], 0, { dur: 0.003, amp: 0.8, f: 1500, q: 1, type: "bp" }),
      noise(0.18, 0.12, bp(1200, 2), -6, { a: 0.02, d: 0.1 }),
      thump(0.29, 150, 90, 0.05, -6),
      ...creak(0.32, 0.36, [[0, 42], [0.15, 68], [0.36, 34]], [520, 1250], -4),
    ] },
    // shutters open after a fight: the iron grate ratcheting up, a rumble, a clank at the top
    shutter_open: { cls: "world", lufs: -16, prio: 5, max: 1, verb: 0.15, layers: (v, r) => {
      const ly = [noise(0, 0.33, lp(220), -4, { a: 0.05, h: 0.2, d: 0.1 }, "brown")];
      for (let i = 0; i < 12; i++) ly.push(modal(i * 0.025, rnd(r, 1500, 2300), [[1, 1, 0.02], [2.2, 0.4, 0.015]], -6), click(i * 0.025, -14));
      ly.push(modal(0.33, 300, METAL(0.18), 0), thump(0.33, 140, 70, 0.07, -6));
      return ly;
    } },
    // shutters slam shut behind you: a short ratchet, a heavy iron clang, a thump and dust
    shutter: { cls: "world", lufs: -15, prio: 6, max: 1, duck: -3, duckHold: 0.2, duckAtt: 0.01, duckRel: 0.4, verb: 0.2, layers: (v, r) => {
      const ly = [];
      for (let i = 0; i < 5; i++) ly.push(modal(i * 0.024, rnd(r, 1300, 1900), [[1, 1, 0.02], [2.2, 0.4, 0.015]], -10));
      ly.push(click(0.12, -3), modal(0.12, 150, [[1, 1, 0.45], [1.41, 0.8, 0.35], [2.76, 0.6, 0.25], [4.1, 0.3, 0.15]], 0, { dur: 0.003, amp: 1, f: 1200, q: 1, type: "bp" }),
        thump(0.12, 110, 45, 0.15, -2, 0.5), noise(0.14, 0.35, lp(1000), -12, { a: 0.02, d: 0.35 }, "pink"));
      return ly;
    } },
    // house door: a wooden creak and the latch
    door: { cls: "world", prio: 3, max: 1, layers: [
      ...creak(0, 0.3, [[0, 48], [0.12, 75], [0.3, 38]], [450, 1100], 0),
      noise(0, 0.3, bp(700, 3), -12, { a: 0.03, h: 0.15, d: 0.2 }),
      modal(0.32, 900, WOOD(0.05), 0),
      click(0.32, -8),
    ] },
    // a locked door tried without a key: three small rattles and a wooden knock
    locked: { cls: "world", lufs: -18, prio: 4, max: 1, layers: [
      ...[0, 0.08, 0.16].map((t, i) => modal(t, 760 + i * 40, [[1, 1, 0.06], [1.7, 0.5, 0.04], [2.9, 0.3, 0.03]], -i)),
      thump(0, 120, 80, 0.05, -6),
      modal(0.18, 250, WOOD(0.08), -4),
    ] },
    // entering a cave or house: three soft stone steps, the cave answering the deeper ones
    stairs: { cls: "world", prio: 3, max: 1, verb: 0.25, echo: 0.08, layers: () => {
      const ly = [];
      [0, 0.17, 0.34].forEach((t, i) => ly.push(
        thump(t, 115 - i * 12, 70 - i * 6, 0.07, -i * 2),
        noise(t, 0.04, lp(900 - i * 150), -6 - i * 2, { a: 0.002, d: 0.05 }, "pink"),
        noise(t + 0.09, 0.05, lp(600 - i * 100), -18 + i * 3, { a: 0.004, d: 0.06 }, "pink")));
      ly.push(noise(0.05, 0.6, lp([[0, 200], [0.6, 500]]), -10, { a: 0.4, d: 0.3 }, "brown"));
      return ly;
    } },
    // entering a dungeon: two heavy steps and a far, low swell of the halls
    enter_dungeon: { cls: "world", prio: 4, max: 1, verb: 0.35, echo: 0.1, layers: [
      thump(0, 95, 50, 0.1, 0, 0.4), noise(0, 0.05, lp(600), -6, { a: 0.002, d: 0.06 }, "pink"),
      thump(0.28, 90, 46, 0.1, -2, 0.4), noise(0.28, 0.05, lp(550), -8, { a: 0.002, d: 0.06 }, "pink"),
      noise(0.39, 0.06, lp(450), -16, { a: 0.004, d: 0.07 }, "pink"),
      tone("sine", 0.1, [55, 52], 0.9, -8, { a: 0.4, d: 0.6 }),
      fm(0.1, 110, 1.5, [0.8, 0.3], 0.9, -16, { a: 0.4, d: 0.6 }),
      noise(0.1, 0.9, lp(300), -12, { a: 0.4, d: 0.6 }, "brown"),
    ] },
    // back outside: lighter steps going up and a breath of wind
    exit_out: { cls: "world", prio: 3, max: 1, verb: 0.08, layers: [
      ...[0, 0.14, 0.28].map((t, i) => thump(t, 100 + i * 12, 65 + i * 6, 0.06, -2 - (2 - i) * 2)),
      noise(0.1, 0.7, bp([[0, 600], [0.35, 1300], [0.7, 900]], 1.2), -6, { a: 0.3, d: 0.4 }, "pink"),
    ] },
    // a floor switch pressed / released
    switch_down: { cls: "world", lufs: -17, prio: 4, max: 2, layers: [
      click(0, -14), modal(0, 900, STONE(0.04), -2), thump(0.002, 200, 120, 0.05, 0, 0.3),
    ] },
    switch_up: { cls: "world", lufs: -21, prio: 3, max: 2, layers: [
      click(0, -14), modal(0, 1150, STONE(0.03), 0), tone("sine", 0.01, [300, 500], 0.03, -8, { a: 0.002, d: 0.035 }),
    ] },
    // a crystal eye wakes: a glassy chord (the game adds pitch +2 per eye already awake)
    eye_wake: { cls: "jingle", lufs: -17, prio: 5, max: 1, key: true, echo: 0.2, verb: 0.2, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67));
      return [notes("glass", [[0, m(0), 0.35, 0.6], [0, m(4), 0.35, 0.55], [0, m(7), 0.35, 0.55]], 0, 0.75), note("celesta", 0.02, m(9), 0.2, 0.7, -3, 0.6),
        grit(0.05, 0.25, 200, hp(5000), -16, 0.0006)];
    } },
    // the seal of the last keep breaks (2.2 s, music ducked 12 dB): six bells, one per shard,
    // left to right; the seal cracks with a huge low ring; a long rumble with falling debris
    gate_break: { cls: "big", prio: 9, max: 1, key: true, duck: -12, duckAtt: 0.05, duckRel: 0.8, verb: 0.3, echo: 0.1, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60));
      const ly = [0, 4, 7, 9, 11, 14].map((d, i) => note("bells", i * 0.08, m(d), 0.8, 0.55, -4, 0, -0.6 + i * 0.24));
      ly.push(click(0.7, 0), noise(0.7, 0.03, hp(1200), 0, { a: 0.0005, d: 0.035 }),
        modal(0.7, 55, [[1, 1, 1.2], [1.41, 0.6, 0.8], [2.76, 0.4, 0.5]], 0), thump(0.7, 80, 30, 0.5, -1, 0.5),
        noise(0.8, 1.3, lp(300), -4, { a: 0.1, h: 0.4, d: 0.9 }, "brown"), thump(0.8, 42, 38, 1.2, -6));
      return ly.concat(debris(r, 0.9, 2.0, 16, -12));
    } },
    // sliding across ice (loop): a thin high hiss
    ice_skid: { cls: "loop", prio: 2, max: 1, loop: true, tail: 0.0001, layers: [
      bed(0.8 + LX, bp(4200, 1.5), 0),
      grit(0, 0.8 + LX, 120, hp(5000), -8, 0.001, { a: 0.001, s: 1, d: 1, r: 0 }),
    ] },
    // the raft pushes off: a splash, bubbles and a wooden knock
    raft_launch: { cls: "world", prio: 4, max: 1, verb: 0.1, layers: (v, r) => [
      noise(0, 0.3, bp([[0, 1400], [0.3, 600]], 1), 0, { a: 0.01, d: 0.3 }, "pink"),
      ...[0.04, 0.09, 0.15].map(t => tone("sine", t + rnd(r, 0, 0.02), [400, 1200], 0.02, -8, { a: 0.002, d: 0.025 })),
      modal(0, 300, WOOD(0.1), -4), thump(0, 130, 80, 0.06, -6),
    ] },
    // paddling (loop, one stroke every 0.6 s)
    raft_paddle: { cls: "loop", prio: 2, max: 1, loop: true, tail: 0.0001, layers: (v, r) => {
      const ly = [bed(1.2 + LX, lp(700), -18, "pink")];
      [0.1, 0.7].forEach(t => ly.push(noise(t, 0.3, bp([[0, 500], [0.15, 900], [0.3, 600]], 1.5), 0, { a: 0.1, d: 0.2 }, "pink"),
        tone("sine", t + 0.2, [450, 1000], 0.02, -10, { a: 0.002, d: 0.025 }), tone("sine", t + 0.28, [500, 1100], 0.02, -12, { a: 0.002, d: 0.025 })));
      return ly;
    } },
    ladder_place: { cls: "world", lufs: -17, prio: 3, max: 1, layers: [
      modal(0, 330, WOOD(0.09), 0), thump(0, 150, 90, 0.04, -6),
      modal(0.12, 300, WOOD(0.09), -2), thump(0.12, 140, 85, 0.04, -8),
    ] },
    // dragged back to the entrance: a long whoosh with echo
    drag_back: { cls: "world", prio: 5, max: 1, echo: 0.35, verb: 0.2, layers: [
      noise(0, 1.2, bp([[0, 400], [0.4, 1200], [1.2, 300]], 1.3), 0, { a: 0.3, h: 0.3, d: 0.6 }, "pink"),
      noise(0, 1.2, lp(250), -6, { a: 0.4, d: 0.8 }, "brown"),
    ] },

    // ============ enemies ============
    // Hexer's blink (graveyard): exactly as before - same frame, no earlier warning; only the
    // sound is new: a swell that rises into a pop, and a chord gliding up
    teleport: { cls: "enemy", lufs: -20, prio: 4, max: 2, variants: 2, vary: { cents: 40 }, echo: 0.2, layers: [
      noise(0, 0.18, bp([[0, 400], [0.18, 3000]], 2), 0, { a: 0.16, d: 0.03, r: 0.02 }, "pink"),
      tone("sine", 0, [500, 1000], 0.18, -8, { a: 0.15, d: 0.05 }),
      tone("sine", 0, [630, 1260], 0.18, -10, { a: 0.15, d: 0.05 }),
      tone("sine", 0.175, [900, 500], 0.03, -6, { a: 0.001, d: 0.035 }),
    ] },
    // Vex's blink: darker (a minor second), a sub pulse, echo
    vex_blink: { key: true, cls: "enemy", lufs: -18, prio: 6, max: 1, echo: 0.3, verb: 0.2, layers: [
      noise(0, 0.22, bp([[0, 300], [0.22, 1800]], 2), 0, { a: 0.18, d: 0.04, r: 0.02 }, "pink"),
      tone("saw", 0, [220, 330], 0.22, -8, { a: 0.18, d: 0.06 }, lp(1200)),
      tone("saw", 0, [233, 349], 0.22, -8, { a: 0.18, d: 0.06 }, lp(1200)),
      thump(0.2, 70, 40, 0.15, -3, 0.5),
    ] },
    // a clutching hand grabs you: a cold grip and being dragged away
    grab: { cls: "critical", lufs: -15, prio: 8, max: 1, echo: 0.25, layers: [
      click(0, -6),
      modal(0, 180, [[1, 1, 0.12], [1.52, 0.6, 0.09], [2.9, 0.4, 0.05]], 0),
      noise(0.03, 0.45, bp([[0, 1500], [0.45, 400]], 1.5), -4, { a: 0.05, d: 0.4 }, "pink"),
    ] },
    // a scarab starts its charge (plays where it starts, as now): chitter and a revving buzz
    scarab_charge: { cls: "enemy", lufs: -18, prio: 4, max: 2, variants: 2, vary: { cents: 40 }, layers: [
      grit(0, 0.3, [40, 120], bp(3000, 1.5), 0, 0.002),
      tone("saw", 0, [80, 140], 0.3, -4, { a: 0.03, d: 0.3 }, lp(900), { drive: 1 }),
    ] },
    // enemies appearing (one sound for a group: 1 at a time, 0.1 s apart)
    spawn: { cls: "enemy", lufs: -21, prio: 2, max: 1, cool: 0.1, variants: 3, vary: { cents: 80, db: 1 }, layers: (v, r) => [
      poof(0, 0.22, rnd(r, 650, 800), 350, 0),
      tone("sine", 0.005, [300, 500], 0.03, -8, { a: 0.002, d: 0.035 }),
    ] },
    // a sand mole's mound (30 frames before it pops up): half a second of rumbling sand
    maw_mound: { cls: "enemy", lufs: -16, prio: 5, max: 2, variants: 2, vary: { cents: 60 }, layers: [
      noise(0, 0.5, lp([[0, 180], [0.5, 380]]), 0, { a: 0.15, h: 0.2, d: 0.25 }, "brown"),
      grit(0, 0.5, [60, 220], bp(2000, 0.9), -6, 0.002, { a: 0.2, h: 0.15, d: 0.3 }),
      tone("sine", 0, [55, 70], 0.5, -8, { a: 0.2, d: 0.4 }),
    ] },
    // a spike trap lunges: a metal scrape rising into a zing
    spike_lunge: { cls: "enemy", lufs: -16, gain: 3, prio: 5, max: 2, layers: [
      fm(0, [1200, 2600], 1.41, [2, 0.5], 0.2, 0, { a: 0.01, d: 0.25 }),
      noise(0, 0.2, hp(3000), -8, { a: 0.02, d: 0.2 }),
      click(0, -8),
    ] },
    // an ooze splits in two: a wet double pop
    ooze_split: { cls: "world", lufs: -18, prio: 3, max: 2, variants: 2, vary: { cents: 60 }, layers: [
      tone("sine", 0, [[0, 280], [0.03, 650], [0.06, 300]], 0.06, 0, { a: 0.003, d: 0.07 }),
      tone("sine", 0.07, [[0, 330], [0.03, 760], [0.06, 340]], 0.06, -2, { a: 0.003, d: 0.07 }),
      noise(0, 0.12, bp([[0, 500], [0.05, 1400], [0.12, 400]], 4), -6, { a: 0.004, d: 0.12 }),
    ] },
    // a friendly wisp nearby: a faint shimmer in the key
    wisp_near: { cls: "enemy", lufs: -23, prio: 1, max: 1, cool: 0.5, key: true, echo: 0.3, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72));
      return [note("celesta", 0, m(4), 0.1, 0.5, 0, 0.5), note("celesta", 0.09, m(9), 0.1, 0.45, -2, 0.5), noise(0, 0.3, hp(6000), -16, { a: 0.1, d: 0.2 })];
    } },
    // enemy shots, on the frame the shot appears (always softer than the player's own sounds;
    // round 1: gain +2 dB, they had sat under the music's average)
    shot_seed: { cls: "enemy", gain: 2, prio: 3, max: 2, variants: 2, vary: { cents: 60, db: 1 }, layers: [
      { type: "pluck", f: 140, t60: 0.04, bright: 0.5, dur: 0.1, gain: -2 },
      noise(0, 0.06, bp(1500, 1.2), 0, { a: 0.004, d: 0.06 }, "pink"),
      thump(0, 180, 110, 0.03, -8),
    ] },
    shot_rock: { cls: "enemy", gain: 2, prio: 3, max: 2, variants: 2, vary: { cents: 60, db: 1 }, layers: (v, r) => [
      noise(0, 0.12, bp([[0, 400], [0.12, 1100]], 1.3), 0, { a: 0.05, d: 0.08 }, "pink"),
      modal(0, rnd(r, 850, 950), STONE(0.04), -4),
    ] },
    // Hexer's bolt: quiet and exactly when it fires (the graveyard stays as hard as before)
    shot_hex: { cls: "enemy", lufs: -23, gain: 2, prio: 3, max: 2, variants: 2, vary: { cents: 40 }, layers: [
      fm(0, [900, 1400], 1.5, [2.5, 0.8], 0.12, 0, { a: 0.003, d: 0.13 }),
      fm(0, [918, 1428], 1.5, [2.5, 0.8], 0.12, -3, { a: 0.003, d: 0.13 }),
    ] },
    shot_ember: { cls: "enemy", gain: 2, prio: 3, max: 2, variants: 2, vary: { cents: 50, db: 1 }, layers: [
      noise(0, 0.14, bp([[0, 500], [0.14, 1800]], 1.2), 0, { a: 0.04, d: 0.1 }, "pink"),
      grit(0.02, 0.15, 250, lp(3500), -4, 0.001),
    ] },
    shot_ice: { cls: "enemy", gain: 2, prio: 3, max: 2, cool: 0.03, variants: 2, vary: { cents: 50 }, layers: (v, r) => [
      ...[0, 0.012, 0.025].map((t, i) => modal(t, rnd(r, 2200, 3500), GLASS(0.12), -i * 2)),
      noise(0, 0.15, hp(4000), -6, { a: 0.02, d: 0.14 }),
    ] },
    // boss fire (Cinderwyrm's fan, Emberhulk's embers)
    shot_fireball: { key: true, cls: "enemy", lufs: -19, gain: 2, prio: 4, max: 2, cool: 0.04, variants: 2, vary: { cents: 40, db: 1 }, layers: [
      noise(0, 0.25, bp([[0, 300], [0.25, 1500]], 1.1), 0, { a: 0.06, d: 0.2 }, "pink"),
      grit(0.03, 0.25, 250, lp(3000), -5, 0.0012),
      thump(0, 120, 70, 0.08, -6),
    ] },
    shot_gazer: { key: true, cls: "enemy", lufs: -20, gain: 2, prio: 4, max: 2, cool: 0.03, variants: 2, vary: { cents: 40 }, layers: [
      fm(0, [1200, 2000], 2, [2, 0.3], 0.14, 0, { a: 0.003, d: 0.15 }),
      noise(0, 0.08, hp(5000), -10, { a: 0.003, d: 0.08 }),
    ] },
    shot_vex: { key: true, cls: "enemy", lufs: -19, gain: 2, prio: 5, max: 2, cool: 0.03, variants: 2, vary: { cents: 40 }, layers: [
      fm(0, [500, 300], 1.07, [3, 1], 0.16, 0, { a: 0.003, d: 0.17 }),
      thump(0, 65, 45, 0.1, -3, 0.4),
    ] },
    // Vex enraged (HP 9 or less): lower, harsher
    shot_vex_rage: { key: true, cls: "enemy", lufs: -18, gain: 2, prio: 5, max: 2, cool: 0.03, variants: 2, vary: { cents: 40 }, layers: [
      Object.assign(fm(0, [400, 220], 1.07, [4, 1.5], 0.18, 0, { a: 0.003, d: 0.19 }), { drive: 1.5 }),
      tone("saw", 0, [90, 70], 0.15, -8, { a: 0.003, d: 0.16 }, lp(900)),
      thump(0, 60, 40, 0.12, -2, 0.5),
    ] },
    // attack warnings (tells), played when the wind-up starts; each rises toward the attack.
    // (none for the Hexer: its timing stays exactly as before) (round 1: gain +2.5..3 dB so each
    // stands clear of its region's loudest music)
    // (round 2: every tell raised again so it clears the loudest music by 4 LU, on laptop
    // speakers too: scarab and Vex lose the most below 150 Hz)
    tell_snap: { cls: "enemy", lufs: -16, gain: 4.1, prio: 4, max: 2, layers: [
      modal(0, 2100, GLASS(0.05), -7),  // (a crisp ping so the warning is heard from its first moment)
      swell(0.3, 500, 1800, 1.5, 0), fm(0, [170, 200], 1.5, [1, 0.5], 0.3, -10, { a: 0.2, d: 0.15 }),
    ] },
    tell_caster: { cls: "enemy", lufs: -16, gain: 5.6, prio: 4, max: 2, layers: [
      modal(0, 2100, GLASS(0.05), -12),  // (a crisp ping; -12, not -7: louder, it set the peak cap and pulled the tell down 1-1.6 dB)
      grit(0, 0.33, [40, 220], bp(1500, 1), 0, 0.002, { a: 0.28, d: 0.1, r: 0.03 }),
      swell(0.33, 200, 800, 1, -4, "brown"),
    ] },
    tell_chiller: { cls: "enemy", lufs: -16, gain: 5.8, prio: 4, max: 2, layers: [
      ...[0, 0.1, 0.17, 0.22, 0.26, 0.29].map((t, i) => modal(t, 1500 * Math.pow(1.18, i), GLASS(0.08), -8 + i * 1.5)),
      Object.assign(swell(0.33, 3000, 6000, 1, -8, "white"), {}),
    ] },
    tell_fireimp: { cls: "enemy", lufs: -16, gain: 5.2, prio: 4, max: 2, layers: [
      modal(0, 2100, GLASS(0.05), -12),  // (a crisp ping; -12, not -7: louder, it set the peak cap and pulled the tell down 1-1.6 dB)
      grit(0, 0.22, [60, 300], lp(3500), 0, 0.0012, { a: 0.19, d: 0.06, r: 0.02 }),
      swell(0.22, 1000, 3000, 1.2, -4),
    ] },
    tell_scarab: { cls: "enemy", lufs: -16, gain: 6.5, prio: 4, max: 2, layers: [
      modal(0, 2100, GLASS(0.05), -7),  // (a crisp ping so the warning is heard from its first moment)
      grit(0, 0.23, [40, 180], bp(3000, 1.5), 0, 0.002, { a: 0.2, d: 0.05, r: 0.02 }),
      tone("saw", 0, [70, 130], 0.23, -5, { a: 0.2, d: 0.08 }, lp(800)),
    ] },
    tell_wyrm: { key: true, cls: "enemy", lufs: -15, gain: 3.5, prio: 6, max: 1, layers: [
      modal(0, 2100, GLASS(0.05), -7),  // (a crisp ping so the warning is heard from its first moment)
      swell(0.4, 300, 1400, 1.2, 0),
      tone("saw", 0, [60, 90], 0.4, -6, { a: 0.35, d: 0.1 }, lp(500), { vib: [30, 6, 0] }),
    ] },
    tell_frostmaw: { key: true, cls: "enemy", lufs: -15, gain: 5.1, prio: 6, max: 1, layers: [
      modal(0, 2100, GLASS(0.05), -7),  // (a crisp ping so the warning is heard from its first moment)
      modal(0, 1800, GLASS(0.45), -6), modal(0.005, 1812, GLASS(0.45), -6),
      swell(0.5, 800, 3000, 1, 0, "white"),
      ...creak(0.05, 0.4, [[0, 70], [0.4, 55]], [1300, 2800], -10),
    ] },
    tell_emberhulk: { key: true, cls: "enemy", lufs: -15, gain: 3.8, prio: 6, max: 1, layers: [
      modal(0, 2100, GLASS(0.05), -12),  // (a crisp ping; -12, not -7: louder, it set the peak cap and pulled the tell down 1-1.6 dB)
      grit(0, 0.45, [60, 260], bp(1200, 1), -2, 0.003, { a: 0.4, d: 0.1, r: 0.03 }),
      swell(0.45, 120, 500, 1, 0, "brown"),
    ] },
    tell_dunescale: { key: true, cls: "enemy", lufs: -15, gain: 3.7, prio: 6, max: 1, layers: [
      modal(0, 2100, GLASS(0.05), -12),  // (a crisp ping; -12, not -7: louder, it set the peak cap and pulled the tell down 1-1.6 dB)
      swell(0.33, 150, 500, 1, 0, "brown"),
      grit(0, 0.33, [60, 260], bp(2000, 0.9), -4, 0.002, { a: 0.28, d: 0.08, r: 0.03 }),
    ] },
    tell_vex: { key: true, cls: "enemy", lufs: -15, gain: 5.0, prio: 6, max: 1, echo: 0.2, layers: [
      modal(0, 2100, GLASS(0.05), -7),  // (a crisp ping so the warning is heard from its first moment)
      tone("saw", 0, 147, 0.4, -2, { a: 0.35, d: 0.1 }, lp(1200)),
      tone("saw", 0, 156, 0.4, -2, { a: 0.35, d: 0.1 }, lp(1200)),
      swell(0.4, 400, 2000, 1.5, -4),
      thump(0.35, 60, 40, 0.1, -6),
    ] },

    // ============ bosses ============
    // (effects heard in one boss room only carry key: true although most ignore the key: the
    // engine then renders them when first played instead of at start-up, which saves memory)
    // a boss appears (plays before its music; the boss track should start at the roar's tail)
    roar: { cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: growl(0, [[0, 95], [0.3, 118], [0.9, 62]], 0.9, [520, 1150], 0) },
    // Cinderwyrm (fire wyrm): a throaty roar full of crackle, and its own mark (round 1): a
    // serpent's shriek above the roar that slides up an octave and dives
    roar_wyrm: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: [
      ...growl(0, [[0, 105], [0.3, 130], [1.0, 70]], 1.0, [600, 1300], 0),
      grit(0.05, 0.9, [300, 120], lp(4000), -6, 0.0012, { a: 0.1, h: 0.4, d: 0.6 }),
      tone("saw", 0.05, [[0, 220], [0.35, 450], [0.95, 150]], 0.95, -12, { a: 0.08, h: 0.35, d: 0.5, r: 0.08 }, bp(2200, 3), { drive: 1.5, vib: [60, 7, 0.1] }),
    ] },
    // Marrowworm (bone worm): a low hiss and a rattle of bones
    roar_worm: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: (v, r) => {
      const ly = growl(0, [[0, 80], [0.4, 95], [0.9, 60]], 0.9, [420, 900], -4);
      for (let i = 0; i < 22; i++) ly.push(modal(0.05 + Math.pow(r(), 0.8) * 0.75, rnd(r, 600, 1300), WOOD(rnd(r, 0.03, 0.06)), rnd(r, -6, 0)));
      return ly;
    } },
    // Gazer: no roar - a wet eye opening and a glassy chime
    roar_gazer: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, echo: 0.2, layers: [
      noise(0, 0.25, bp([[0, 300], [0.08, 1600], [0.25, 400]], 6), 0, { a: 0.02, d: 0.25 }),
      noise(0.18, 0.2, bp([[0, 350], [0.07, 1400], [0.2, 450]], 6), -3, { a: 0.02, d: 0.2 }),
      tone("sine", 0.02, [[0, 200], [0.1, 380], [0.3, 150]], 0.3, -6, { a: 0.02, d: 0.3 }),
      modal(0.35, 1900, GLASS(0.7), -4), modal(0.37, 2850, GLASS(0.6), -8),
    ] },
    // Dunescale (sand): a growl in a cloud of grinding sand, and its own mark (round 1): a long
    // hiss of sand pouring off its back, swelling after the roar's peak
    roar_dunescale: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: [
      ...growl(0, [[0, 90], [0.35, 110], [1.0, 58]], 1.0, [480, 1050], 0),
      noise(0, 1.0, lp(350), -6, { a: 0.1, h: 0.4, d: 0.6 }, "brown"),   // (2 dB lower: room for the hiss)
      grit(0, 1.0, [120, 40], bp(2200, 0.8), -8, 0.002, { a: 0.1, h: 0.4, d: 0.6 }),
      noise(0.15, 1.1, bp([[0, 6000], [1.1, 3500]], 0.8), -12, { a: 0.35, h: 0.3, d: 0.6 }),
    ] },
    // Frostmaw (ice): a growl with frosty breath and glassy shimmer, and its own mark (round 1):
    // ice crackling off its hide - tiny glass snaps scattered left and right through the roar
    roar_frostmaw: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.35, layers: (v, r) => {
      const ly = [
        ...growl(0, [[0, 120], [0.3, 140], [0.9, 80]], 0.9, [560, 1250], 0),
        noise(0, 0.9, bp(3000, 1), -10, { a: 0.1, h: 0.3, d: 0.6 }),
        noise(0.1, 0.8, hp(6000), -16, { a: 0.2, d: 0.6 }),
        modal(0.3, 2400, GLASS(0.5), -12),
      ];
      for (let i = 0; i < 16; i++) ly.push(pan(modal(0.08 + Math.pow(r(), 0.9) * 0.8, rnd(r, 3200, 6000), GLASS(rnd(r, 0.02, 0.05)), rnd(r, -10, -4)), rnd(r, -0.5, 0.5)));
      return ly;
    } },
    // Emberhulk (lava stone): a very low growl and stone grinding, and its own mark (round 1):
    // a low fire crackle - big slow pops of burning embers under the roar
    roar_emberhulk: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: [
      ...growl(0, [[0, 72], [0.4, 88], [1.1, 50]], 1.1, [380, 850], 0),
      grit(0, 1.0, [200, 60], bp(1200, 1), -5, 0.004, { a: 0.1, h: 0.4, d: 0.6 }),
      noise(0, 1.0, lp(250), -6, { a: 0.1, h: 0.4, d: 0.6 }, "brown"),
      grit(0.05, 1.1, [70, 30], lp(1600), -2, 0.006, { a: 0.15, h: 0.45, d: 0.6 }),
    ] },
    // Vex: a voice-like chord on the Shadow motif's notes (D F B), the B slipping to B-flat
    roar_vex: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.5, duckAtt: 0.01, verb: 0.35, echo: 0.25, layers: () => {
      const env = { a: 0.08, h: 0.4, d: 0.8, r: 0.1 }, ly = [];
      [[146.8], [174.6], [[0, 246.9], [0.55, 246.9], [0.75, 233.1]]].forEach((f, i) => {
        const fc = f.length === 1 ? f[0] : f;
        ly.push(tone("saw", 0, fc, 1.0, -4, env, bp(750, 4), { vib: [25, 5.5, 0.1] }), tone("saw", 0, fc, 1.0, -8, env, bp(1150, 5), { vib: [25, 5.5, 0.1] }));
        if (i === 0) ly.push(tone("saw", 0, fc, 1.0, -6, env, lp(500)));
      });
      ly.push(thump(0, 60, 36, 0.8, -4, 0.4), noise(0, 1.0, bp(900, 0.8), -14, env, "pink"));
      return ly;
    } },
    // a boss struck: the hit five semitones lower and a short pained growl
    boss_hurt: { cls: "critical", lufs: -12.5, prio: 7, max: 2, cool: 0.05, variants: 3, vary: { cents: 50, db: 0.8 }, layers: (v, r) => [
      ...hitCore(r, 0.75),
      noise(0.004, 0.07, bp(650, 2), -4, { a: 0.002, d: 0.075 }),
      ...growl(0.02, [[0, 150], [0.2, 100]], 0.2, [600, 1200], -6, 1.8),
    ] },
    boss_hurt_armor: { key: true, cls: "critical", lufs: -11.7, prio: 7, max: 2, cool: 0.05, variants: 3, vary: { cents: 50, db: 0.8 }, layers: (v, r) => [
      ...hitCore(r, 0.75, -6),
      modal(0.016, rnd(r, 600, 700), METAL(0.18), -5, { dur: 0.002, amp: 0.3, f: 3000, q: 1, type: "bp" }),
      Object.assign(noise(0.006, 0.08, bp(rnd(r, 1900, 2300), 1.6), -8, { a: 0.004, h: 0.03, d: 0.05 }), { drive: 1.5 }),
      ...growl(0.02, [[0, 130], [0.2, 90]], 0.2, [520, 1100], -8, 1.8),
    ] },
    // a boss defeated (about 2.4 s, music ducked 14 dB): the final blow and a white flash, six
    // blasts 0.18 s apart spreading left and right, then a long low boom (key: true only makes
    // it render on first use; it does not use the key)
    boss_defeat: { cls: "big", lufs: -10.5, prio: 9, max: 1, key: true, duck: -14, duckAtt: 0.02, duckRel: 0.8, verb: 0.3, echo: 0.1, layers: (v, r) => {
      let ly = [click(0, -2), thump(0, 120, 40, 0.25, 0, 0.6), noise(0, 0.3, hp([[0, 6000], [0.3, 2000]]), -12, { a: 0.002, d: 0.3 })];
      [-0.5, 0.45, -0.25, 0.3, -0.4, 0.5].forEach((p, i) => { ly = ly.concat(blast(0.3 + i * 0.18, p, 0.8 + i * 0.05, -2 - (i % 2))); });
      ly.push(thump(1.4, 70, 28, 0.8, -1, 0.5), noise(1.4, 1.0, lp(300), -5, { a: 0.02, d: 1.0 }, "brown"));
      return ly.concat(debris(r, 0.5, 2.0, 18, -14));
    } },
    // Dunescale caught by the hook: the chain snaps taut, a pained growl
    dune_hooked: { key: true, cls: "critical", lufs: -12.8, prio: 7, max: 1, layers: [
      click(0, -4), modal(0, 1200, METAL(0.2), -2),
      ...growl(0.03, [[0, 130], [0.3, 90]], 0.35, [520, 1100], -3, 1.8),
    ] },
    // Dunescale bursts up out of the sand
    dune_emerge: { key: true, cls: "big", lufs: -12, prio: 8, max: 1, duck: -6, duckHold: 0.3, duckAtt: 0.01, verb: 0.2, layers: (v, r) => [
      thump(0, 100, 40, 0.2, 0, 0.5),
      noise(0, 0.35, lp([[0, 2000], [0.35, 300]]), 0, { a: 0.005, d: 0.35 }, "brown"),
      grit(0, 0.4, [300, 40], bp(2200, 0.8), -6, 0.002),
      ...growl(0.08, [[0, 100], [0.2, 120], [0.5, 70]], 0.5, [480, 1050], -4),
      ...debris(r, 0.1, 0.6, 10, -14),
    ] },
    // Dunescale moving under the sand (loop; the game pans it with loopSet {x})
    burrow_loop: { key: true, cls: "loop", lufs: -21, prio: 3, max: 1, loop: true, tail: 0.0001, layers: (v, r) => {
      const ly = [bed(1.2 + LX, lp(170), 0, "brown"), grit(0, 1.2 + LX, 50, bp(1200, 1), -8, 0.003, { a: 0.001, s: 1, d: 1, r: 0 })];
      [0.1, 0.5, 0.85].forEach(t => ly.push(noise(t, 0.3, lp(300), -4, { a: 0.12, d: 0.2 }, "brown")));
      return ly;
    } },
    // Frostmaw opens its maw: ice creaking and a low exhale
    maw_open: { key: true, cls: "world", lufs: -15, prio: 6, max: 1, verb: 0.3, layers: [
      ...creak(0, 0.3, [[0, 75], [0.15, 95], [0.3, 55]], [1300, 2800], 0),
      noise(0, 0.3, bp(1200, 4), -10, { a: 0.02, d: 0.3 }),
      noise(0.15, 0.6, lp(600), 0, { a: 0.2, d: 0.5 }, "pink"),
    ] },
    // each breath of ice: a hiss and a glass cluster
    ice_breath: { key: true, cls: "enemy", gain: 2, prio: 4, max: 2, cool: 0.15, variants: 2, vary: { cents: 40 }, layers: (v, r) => [
      noise(0, 0.25, hp(3000), 0, { a: 0.03, d: 0.25 }),
      ...[0, 0.02].map(t => modal(t, rnd(r, 2500, 3600), GLASS(0.12), -6)),
    ] },
    // rocks shed from the wall
    rock_shed: { key: true, cls: "world", lufs: -15, prio: 5, max: 1, layers: (v, r) => {
      const ly = [noise(0, 0.6, lp(400), -6, { a: 0.02, d: 0.6 }, "brown")];
      for (let i = 0; i < 5; i++) { const t = 0.05 + i * 0.1 + rnd(r, 0, 0.05), p = rnd(r, -0.5, 0.5); ly.push(pan(thump(t, 120, 50, 0.08, -2 - i), p), pan(modal(t, rnd(r, 400, 600), STONE(0.05), -6 - i), p)); }
      ly.push(grit(0.05, 0.6, [150, 30], bp(2000, 0.8), -10, 0.002));
      return ly;
    } },
    // Frostmaw struck by a thrown pot: a crunch and a pained growl
    thrown_hit: { key: true, cls: "critical", lufs: -12.9, prio: 7, max: 1, layers: (v, r) => [
      thump(0, 150, 55, 0.12, 0, 0.5),
      noise(0, 0.02, hp(2500), -2, { a: 0.0005, d: 0.025 }),
      ...[0, 0.02, 0.04].map(t => modal(t, rnd(r, 2000, 4000), CLAY(0.06), -8)),
      ...growl(0.04, [[0, 140], [0.3, 95]], 0.32, [560, 1200], -4, 1.8),
    ] },
    // Emberhulk's crust cracking, stage 1-3 (each higher: how close the core is)
    crust_crack1: { key: true, cls: "critical", lufs: -10, prio: 7, max: 1, duck: -3, duckHold: 0.1, duckAtt: 0.01, layers: (v, r) => crust(r, 0) },
    crust_crack2: { key: true, cls: "critical", lufs: -9.8, prio: 7, max: 1, duck: -3, duckHold: 0.1, duckAtt: 0.01, layers: (v, r) => crust(r, 1) },
    crust_crack3: { key: true, cls: "critical", lufs: -9.5, prio: 7, max: 1, duck: -3, duckHold: 0.1, duckAtt: 0.01, layers: (v, r) => crust(r, 2) },
    // Emberhulk's bare core (loop while it can be hurt): a hum that throbs 5 times a second
    core_hum: { key: true, cls: "loop", lufs: -21, prio: 4, max: 1, loop: true, tail: 0.0001, layers: [
      // 110 and 115 Hz beat 5 times a second; both make whole cycles in the 1 s loop, so the
      // seam is in phase. A buzzy copy with its overtones lets laptop speakers show it.
      tone("sine", 0, 110, 1 + LX, 0, { a: 0.001, s: 1, d: 1, r: 0 }),
      tone("sine", 0, 115, 1 + LX, 0, { a: 0.001, s: 1, d: 1, r: 0 }),
      tone("saw", 0, 110, 1 + LX, -8, { a: 0.001, s: 1, d: 1, r: 0 }, lp(900)),
      tone("saw", 0, 115, 1 + LX, -8, { a: 0.001, s: 1, d: 1, r: 0 }, lp(900)),
      grit(0, 1 + LX, 60, hp(3000), -16, 0.001, { a: 0.001, s: 1, d: 1, r: 0 }),
    ] },
    // the crust grows back (last 30 frames of the window): a hiss and stone setting
    recrust: { key: true, cls: "critical", lufs: -15, prio: 6, max: 1, layers: [
      noise(0, 0.5, bp([[0, 3000], [0.5, 1500]], 1), -4, { a: 0.3, d: 0.2 }),
      grit(0.1, 0.4, [80, 300], bp(1000, 1), -4, 0.003, { a: 0.3, d: 0.1 }),
      thump(0.48, 120, 50, 0.1, 0, 0.5), modal(0.48, 420, STONE(0.08), -4),
    ] },
    // Gazer's eye opens / closes
    eye_open: { key: true, cls: "world", lufs: -16, prio: 6, max: 1, echo: 0.2, layers: [
      noise(0, 0.2, bp([[0, 300], [0.08, 1500], [0.2, 400]], 6), 0, { a: 0.02, d: 0.2 }),
      modal(0.15, 1800, GLASS(0.4), -4),
    ] },
    eye_close: { key: true, cls: "world", lufs: -18, prio: 5, max: 1, layers: [
      noise(0, 0.18, bp([[0, 1400], [0.18, 300]], 6), 0, { a: 0.03, d: 0.15 }),
      thump(0.12, 140, 70, 0.06, -6),
    ] },
    // Vex cloaks: a shimmer swelling and a detuned glass pair
    vex_cloak: { key: true, cls: "enemy", lufs: -19, prio: 5, max: 1, echo: 0.25, layers: [
      noise(0, 0.37, hp(4000), 0, { a: 0.3, d: 0.1, r: 0.05 }),
      modal(0.3, 1500, GLASS(0.3), -4), modal(0.3, 1590, GLASS(0.3), -4),
    ] },
    // Marrowworm loses a segment (the game raises pitch +2 per segment lost)
    // (round 1: the thump 7 dB lower and a held driven pop, as loud as a hit over 100 ms)
    worm_pop: { key: true, cls: "critical", lufs: -9.9, prio: 6, max: 2, variants: 2, vary: { db: 0.5 }, layers: (v, r) => [
      thump(0, 150, 60, 0.1, -7, 0.5),
      noise(0, 0.02, hp(2000), -10, { a: 0.0005, d: 0.025 }),
      Object.assign(noise(0.003, 0.09, bp([[0, 700], [0.03, 1600], [0.09, 900]], 2), -1, { a: 0.003, h: 0.04, d: 0.06 }), { drive: 2 }),
      modal(0.005, rnd(r, 850, 950), WOOD(0.1), -9),
      poof(0.03, 0.22, 900, 300, -4),
    ] },
    // a new tail starts to glow (it can be hurt now): mi then ti (an open fifth in every mode the
    // tracks use, unresolved)
    worm_tail: { cls: "jingle", lufs: -18, prio: 5, max: 1, key: true, echo: 0.2, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72));
      return [note("celesta", 0, m(2), 0.1, 0.7, 0, 0.6), note("celesta", 0.08, m(6), 0.2, 0.8, 0, 0.7), grit(0.05, 0.2, 200, hp(5000), -16, 0.0006)];
    } },

    // ============ menus and text ============
    // cursor: a soft tick; two pitches that alternate (2 variants never repeat back to back);
    // levelled 5 dB under the ui class (target -34..-24 LUFS over 100 ms)
    cursor: { cls: "ui", lufs: -26, bus: "ui", prio: 1, max: 1, variants: 2, layers: v => [
      { type: "pluck", f: v ? 1320 : 1175, t60: 0.05, bright: 0.45, dur: 0.05, gain: 0, filter: lp(3000) },
      click(0, -16),
    ] },
    ui_confirm: { cls: "confirm", bus: "ui", prio: 2, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67));
      return [note("harp", 0, m(0), 0.1, 0.7, 0, 0.18), note("harp", 0.06, m(4), 0.1, 0.8, 0, 0.2)];
    } },
    ui_back: { cls: "confirm", lufs: -20, bus: "ui", prio: 2, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 67));
      return [note("harp", 0, m(7), 0.1, 0.7, 0, 0.18), note("harp", 0.06, m(4), 0.1, 0.7, 0, 0.2)];
    } },
    menu_open: { cls: "ui", lufs: -20, bus: "ui", prio: 2, max: 1, layers: [
      noise(0, 0.14, bp([[0, 400], [0.14, 1600]], 1.5), 0, { a: 0.1, d: 0.06 }, "pink"),
      { type: "pluck", at: 0.06, f: 880, t60: 0.08, bright: 0.4, dur: 0.1, gain: -3, filter: lp(3000) },
      { type: "pluck", at: 0.1, f: 1320, t60: 0.08, bright: 0.4, dur: 0.1, gain: -4, filter: lp(3000) },
    ] },
    menu_close: { cls: "ui", lufs: -21, bus: "ui", prio: 2, max: 1, layers: [
      noise(0, 0.14, bp([[0, 1600], [0.14, 400]], 1.5), 0, { a: 0.02, d: 0.12 }, "pink"),
      { type: "pluck", at: 0, f: 1320, t60: 0.08, bright: 0.4, dur: 0.1, gain: -4, filter: lp(3000) },
      { type: "pluck", at: 0.05, f: 880, t60: 0.08, bright: 0.4, dur: 0.1, gain: -3, filter: lp(3000) },
    ] },
    // "press start" on the title: a bright sparkle climbing into a harp chord
    title_start: { cls: "confirm", lufs: -17, bus: "ui", prio: 3, max: 1, key: true, echo: 0.2, verb: 0.2, layers: (v, r, key) => {
      const k = keyAt(key, 72), m = deg(k), h = deg(keyAt(key, 60));
      return [...[7, 9, 11, 14, 16].map((d, i) => note("glock", i * 0.05, m(d) - 12, 0.1, 0.5 + i * 0.08, -6, 0.5)),
        noise(0, 0.28, hp(5000), -16, { a: 0.24, d: 0.06 }),
        notes("harp", [[0.28, h(0), 0.4, 0.8], [0.3, h(4), 0.4, 0.75], [0.32, h(7), 0.4, 0.8], [0.34, h(9), 0.4, 0.75]], 0, 1.1)];
    } },
    // denied: two soft wooden knocks falling a minor third (re - ti), each with a round triangle
    // tone inside - tuned, consonant and noiseless, nothing like hurt's crack, groan and sour
    // semitone sting; a little above the other menu sounds, never as loud as a blow
    denied: { cls: "confirm", lufs: -14.1, bus: "ui", prio: 2, max: 1, layers: [
      modal(0, 587, WOOD(0.07), 0),
      tone("tri", 0, 587, 0.07, -3, { a: 0.002, h: 0.02, d: 0.06 }),
      modal(0.11, 494, WOOD(0.09), -1),
      tone("tri", 0.11, 494, 0.09, -3, { a: 0.002, h: 0.03, d: 0.08 }),
    ] },
    // nothing to use (no bombs, no gems for arrows): patting an empty bag
    empty: { cls: "confirm", lufs: -20, bus: "ui", prio: 2, max: 1, layers: [
      thump(0, 180, 120, 0.05, 0), noise(0, 0.06, lp(500), -4, { a: 0.003, d: 0.06 }, "pink"),
      thump(0.11, 170, 115, 0.05, -2), noise(0.11, 0.06, lp(500), -6, { a: 0.003, d: 0.06 }, "pink"),
    ] },
    // text blips (one per 3 letters): a soft vowel; five vowels so neighbours differ, and a
    // cool-down (0.06 s: at most one blip per 4 frames) so fast text never machine-guns
    // (round 1: every voice has a little 1.3-1.9 kHz in it, above the pads' 250-700 Hz)
    text: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 5, vary: { cents: 35, db: 0.8 }, layers: v => {
      const [f1, f2] = VOWELS[v % 5], f0 = [520, 560, 600, 540, 580][v % 5], f = [[0, f0 * 1.04], [0.035, f0]];
      return [tone("pulse", 0, f, 0.034, 0, { a: 0.003, d: 0.05, r: 0.015 }, bp(f1, 3), { duty: 0.35 }), tone("pulse", 0, f, 0.034, -6, { a: 0.003, d: 0.05, r: 0.015 }, bp(f2, 4), { duty: 0.35 }),
        tone("sine", 0, f.map(p => [p[0], p[1] * 3]), 0.034, -5, { a: 0.003, d: 0.05, r: 0.015 })];   // (3rd harmonic, 1.6-1.8 kHz: cuts through pads)
    } },
    // speakers differ by how the voice is made, not only by pitch:
    // Maren = breath through vowel resonances + a small glass ping, with echo
    text_maren: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 4, vary: { cents: 30, db: 0.8 }, echo: 0.15, layers: v => {
      const [f1, f2] = VOWELS[v % 5];
      return [noise(0, 0.04, bp(f1, 5), 0, { a: 0.006, d: 0.05, r: 0.015 }, "pink"), noise(0, 0.04, bp(f2, 6), -4, { a: 0.006, d: 0.05, r: 0.015 }, "pink"),
        modal(0, [1760, 1975, 2217, 1864][v % 4], GLASS(0.08), -7), noise(0, 0.04, bp(1400, 4), -9, { a: 0.006, d: 0.05, r: 0.015 }, "pink")];
    } },
    // elder / hermit = a low, dark pulse
    text_elder: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 4, vary: { cents: 30, db: 0.8 }, layers: v => [
      tone("pulse", 0, [[0, [200, 215, 190, 225][v % 4]], [0.045, [190, 205, 182, 214][v % 4]]], 0.045, 0, { a: 0.004, d: 0.06, r: 0.015 }, lp(1200), { duty: 0.3, vib: [30, 7, 0] }),
      tone("sine", 0, [[0, [200, 215, 190, 225][v % 4] * 7], [0.045, [190, 205, 182, 214][v % 4] * 7]], 0.045, -8, { a: 0.004, d: 0.06, r: 0.015 }, null, { vib: [30, 7, 0] }),   // (7th harmonic, ~1.4 kHz)
    ] },
    // child = a bright, thin pulse that lifts
    text_kid: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 4, vary: { cents: 30, db: 0.8 }, layers: v => [
      tone("pulse", 0, [[0, [720, 780, 700, 820][v % 4]], [0.028, [790, 860, 760, 900][v % 4]]], 0.028, 0, { a: 0.002, d: 0.04, r: 0.01 }, lp(4000), { duty: 0.12 }),
      tone("sine", 0, [[0, [720, 780, 700, 820][v % 4] * 2], [0.028, [790, 860, 760, 900][v % 4] * 2]], 0.028, -8, { a: 0.002, d: 0.04, r: 0.01 }),   // (octave, 1.4-1.8 kHz)
    ] },
    // shopkeeper = a plucked string
    text_shop: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 4, vary: { cents: 30, db: 0.8 }, layers: v => [
      { type: "pluck", f: [420, 470, 500, 445][v % 4], t60: 0.1, bright: 0.5, dur: 0.05, gain: 0 },
      { type: "pluck", f: [420, 470, 500, 445][v % 4], t60: 0.1, bright: 0.9, dur: 0.05, gain: -6, filter: bp(1500, 2) },
    ] },
    // Vex = a dark, clangy tone (FM at an odd ratio, like a ring modulator)
    text_vex: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.06, variants: 4, vary: { cents: 30, db: 0.8 }, layers: v => [
      Object.assign(fm(0, [150, 160, 142, 155][v % 4], 1.37, [3, 2], 0.045, 0, { a: 0.004, d: 0.06, r: 0.015 }), { filter: lp(1500) }),
      tone("sine", 0, [150, 160, 142, 155][v % 4] * 9, 0.045, -15, { a: 0.004, d: 0.06, r: 0.015 }),   // (9th harmonic, ~1.35 kHz)
    ] },
    // dialog box open / next page / close
    dlg_open: { cls: "ui", lufs: -22, bus: "ui", prio: 2, max: 1, layers: [
      noise(0, 0.12, bp([[0, 800], [0.12, 2500]], 1.3), 0, { a: 0.08, d: 0.05 }, "pink"),
      { type: "pluck", at: 0.08, f: 1175, t60: 0.06, bright: 0.4, dur: 0.08, gain: -5, filter: lp(3000) },
    ] },
    dlg_next: { cls: "ui", lufs: -23, bus: "ui", prio: 2, max: 1, layers: [
      { type: "pluck", f: 1320, t60: 0.05, bright: 0.4, dur: 0.06, gain: 0, filter: lp(3000) },
      noise(0, 0.03, bp(2500, 1.5), -10, { a: 0.003, d: 0.03 }, "pink"),
    ] },
    dlg_close: { cls: "ui", lufs: -23, bus: "ui", prio: 2, max: 1, layers: [
      noise(0, 0.12, bp([[0, 2500], [0.12, 800]], 1.3), 0, { a: 0.02, d: 0.1 }, "pink"),
      { type: "pluck", at: 0.02, f: 990, t60: 0.06, bright: 0.4, dur: 0.08, gain: -6, filter: lp(3000) },
    ] },
    // shop: coins poured on the counter and the till's bell
    buy: { cls: "pickup", prio: 4, max: 1, key: true, layers: (v, r, key) => coins(r, 0, 0.25, 7, -2).concat([note("glock", 0.3, deg(keyAt(key, 72))(9), 0.2, 0.85, 0, 0.8)]) },
    gamble_win: { cls: "pickup", prio: 4, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60));
      return coins(r, 0, 0.2, 5, -4).concat([notes("marimba", [[0.2, m(2), 0.1, 0.75], [0.3, m(4), 0.1, 0.8], [0.4, m(7), 0.35, 0.95]]), note("glock", 0.4, m(14), 0.2, 0.6, -6, 0.6)]);
    } },
    gamble_lose: { cls: "confirm", prio: 3, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60));
      return coins(r, 0, 0.45, 8, -4, true).concat([notes("marimba", [[0.3, m(4), 0.12, 0.6], [0.45, m(3), 0.3, 0.55]])]);
    } },
    // a gift to the spirit: coins into a bowl that rings, and an airy chord
    donate: { cls: "pickup", lufs: -17, prio: 4, max: 1, key: true, verb: 0.3, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60));
      return coins(r, 0, 0.15, 3, -3).concat([modal(0.05, 520, [[1, 1, 0.7], [2.7, 0.5, 0.4], [5.1, 0.2, 0.25]], -2),
        notes("glass", [[0.15, m(0), 0.7, 0.5], [0.15, m(4), 0.7, 0.45], [0.15, m(7), 0.7, 0.45]], -4, 1.2)]);
    } },
    // game saved: a quill scratch, a stamp and two warm chords (IV -> I)
    save_ok: { cls: "confirm", lufs: -18, prio: 3, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 60)), ly = [];
      for (let i = 0; i < 8; i++) ly.push(noise(i * 0.03 + rnd(r, 0, 0.01), 0.025, bp(rnd(r, 3000, 4500), 1.5), -6, { a: 0.004, d: 0.03 }));
      ly.push(thump(0.3, 140, 70, 0.06, 0, 0.3), modal(0.3, 300, WOOD(0.06), -4),
        notes("harp", [[0.42, m(3), 0.3, 0.7], [0.42, m(5), 0.3, 0.65], [0.42, m(7), 0.3, 0.65], [0.62, m(2), 0.5, 0.75], [0.62, m(4), 0.5, 0.7], [0.62, m(7), 0.5, 0.75]], 0, 1.25));
      return ly;
    } },
    // game loaded: a book opening and a chime settling DOWN (do' then the sol below, a falling fourth)
    load_ok: { cls: "confirm", lufs: -18, prio: 3, max: 1, key: true, layers: (v, r, key) => {
      const m = deg(keyAt(key, 72)), ly = [];
      for (let i = 0; i < 4; i++) ly.push(noise(i * 0.035, 0.03, bp(rnd(r, 1800, 3000), 1.2), -4 - i, { a: 0.004, d: 0.035 }));
      ly.push(thump(0.14, 120, 80, 0.05, -4), notes("celesta", [[0.2, m(7), 0.1, 0.75], [0.3, m(4), 0.3, 0.85]], 0, 0.9));
      return ly;
    } },
    // game over: the game starts the gameover music track itself (main.js updateDeath:
    // Sound.music("gameover")), so the old sfx name plays nothing while that track exists and
    // the two can never double; without the track it plays the short jingle below
    gameover: { cls: "jingle", prio: 9, play: (S, o) => (TRACKS.gameover ? null : S.sfx("gameover_jingle", o)) },
    // fallback: low strings and a music box falling to the tonic (D minor), 1.6 s
    gameover_jingle: { cls: "jingle", prio: 9, max: 1, key: true, verb: 0.35, echo: 0.1, layers: [   // (key: true = render on first use)
      notes("strings", [[0, 50, 1.4, 0.5], [0, 57, 1.4, 0.45], [0, 65, 1.4, 0.4]], -4),
      notes("musicbox", [[0.05, 81, 0.25, 0.8], [0.35, 77, 0.25, 0.75], [0.65, 76, 0.25, 0.7], [0.95, 74, 0.6, 0.75]], 0, 1.75),
      note("bells", 0.95, 62, 0.6, 0.4, -10, 0.8),
    ] },
  };

  // Emberhulk's crust: the hammer blow, the crust splitting (three cracks), embers hissing;
  // every stage 3 semitones higher than the one before. (round 1: the sub 8 dB lower and a held
  // driven crack body, so each stage is as loud as a hit over 100 ms at the same peak)
  function crust(r, stage) {
    const k = Math.pow(2, stage * 3 / 12);
    return hammerCore(-8).concat([
      ...[0, 0.02, 0.05].map((t, i) => noise(t, 0.012, bp(1800 * k + i * 400, 2), -5 - i * 2, { a: 0.0005, d: 0.015 })),
      Object.assign(noise(0.004, 0.09, bp(1500 * k, 1.5), -1, { a: 0.003, h: 0.04, d: 0.06 }), { drive: 2 }),
      modal(0.02, 420 * k, STONE(0.1), -10),
      grit(0.05, 0.3, [250, 80], hp(3000), -8, 0.001),
    ]);
  }
  // heart pieces 1-4 (heart_piece picks one): the harp's sol-do, then one more bell per piece
  for (let n = 1; n <= 4; n++) {
    FX["heart_piece" + n] = { cls: "jingle", prio: 9, max: 1, key: true, echo: 0.15, verb: 0.3, layers: (v, r, key) => {
      const k = keyAt(key, 60), m = deg(k), up = [9, 11, 14, 16].slice(0, n), ly = [note("harp", 0, m(4), 0.3, 0.75, 0, 0.8), note("harp", 0.06, m(7), 0.3, 0.8, 0, 0.8)];
      up.forEach((d, i) => ly.push(note("celesta", 0.2 + i * 0.13, m(d), i === n - 1 ? 0.4 : 0.12, 0.7 + i * 0.07, 0, 0.75)));
      ly.push(notes("glass", [[0.2, m(0), 0.3 + n * 0.13, 0.45], [0.2, m(2), 0.3 + n * 0.13, 0.4], [0.2, m(4), 0.3 + n * 0.13, 0.4]], -5, 0.85 + n * 0.13));
      return ly;
    } };
  }

  Object.assign(SFX, FX);
})();

// ---------- New effect names and where the game should call them ----------
// (the 37 old names still work unchanged; x = the source's playfield x, for left/right)
// player.js    slash/slash2/slash3 by G.inv.sword; beam_burst where a beam dies on a wall;
//              hurt_heavy (damage >= 2) / hurt_ring (ring worn) in damagePlayer; empty instead
//              of denied for no bombs / no gems; bomb_fuse loop from placing to the blast
// items.js     arrow_thunk (arrow stops on a wall); boom_throw, boom_loop (Sound.loop, loopSet
//              {x}, stopLoop on catch), boom_catch; stun (boomerang stun) instead of hit;
//              flame_loop while the candle flame lives, bush_burn when a bush burns; bomb_tick on
//              each blink of the last 30 frames; gem -> gem / gem5 / gems_big by value,
//              bombs_pickup for bombs; heart_fanfare (container), heart_piece {count},
//              item_small (quest items), potion_drink (the potion), map, compass
// mechanics.js lava (and no hurt on entering lava), respawn; lift_pot / lift_rock, throw,
//              rock_land; hammer_swing, hammer (peg), hammer_shell; hook_bite (instead of
//              clank), hook_reel loop while pulled, hook_retract; stun (hook) instead of hit;
//              switch_down / switch_up per plate, eye_wake {pitch: 2 x eyes awake}, solved
//              instead of secret for a finished puzzle room; block_slide_ice; ice_skid loop;
//              raft_launch / raft_paddle loop; ladder_place; drag_back
// enemies.js   hit_slime / hit_armor / hit_spirit and enemy_die_small / _big / _slime /
//              _spirit by e.kind (slime: ooze, oozelet; armor: iron, shellback, spiketrap;
//              spirit: hexer, wisp, chiller, clutch; small: bat, oozelet, grub_r, wisp; big:
//              iron, shellback, scarab); boss_hurt / boss_hurt_armor (frostmaw, emberhulk) for
//              bosses; spawn (one per group); maw_mound when the mound shows; spike_lunge;
//              ooze_split; wisp_near; wisp_heal; scarab_charge (instead of grab) and grab only
//              for the clutch; shots when a shot appears: shot_seed (snap), shot_rock (caster),
//              shot_hex (hexer), shot_ember (fireimp), shot_ice (chiller); tells at the start
//              of the new wind-ups: tell_snap, tell_caster, tell_chiller, tell_fireimp,
//              tell_scarab (never for the hexer)
// bosses.js    roar_<boss> at the boss's appearance (wyrm, worm, gazer, dunescale, frostmaw,
//              emberhulk, vex); boss_defeat in bossDefeated instead of secret (and no
//              enemy_die for the killing blow); dune_hooked, dune_emerge, burrow_loop (loop,
//              x), tell_dunescale; maw_open, ice_breath + shot_ice, rock_shed, thrown_hit,
//              tell_frostmaw; crust_crack1-3, core_hum loop during bareT, recrust in its last
//              30 frames, shot_fireball, tell_emberhulk; tell_wyrm + shot_fireball
//              (Cinderwyrm); worm_pop {pitch: 2 x segments lost}, worm_tail; eye_open /
//              eye_close, shot_gazer (Gazer); vex_blink, vex_cloak, shot_vex / shot_vex_rage,
//              tell_vex (Vex)
// main.js      enter_dungeon / stairs / door (house) on entering, exit_out on leaving;
//              shutter_open instead of unlock when shutters open; locked (door without a
//              key); gate_break for the keep's seal; heartbeat / heartbeat_urgent (half a
//              heart) on the game's own timer (beep already plays the heartbeat; sfx.js keeps
//              its own 0.8 s / 0.7 s beat and limits the timer's -7 dB to -1.5 dB);
//              menu_open / menu_close for the inventory; the game over screen calls
//              Sound.music("gameover") itself (sfx "gameover" is silent while that track exists)
// ui.js        text_maren / text_elder / text_kid / text_shop / text_vex by speaker, pitch +3
//              on '?' and gain +2 on '!'; dlg_open / dlg_next / dlg_close; ui_confirm /
//              ui_back; title_start on "press start"
// caves.js     gamble_win / gamble_lose, donate; heal_tick (pitch +1 per half heart)
// save.js      save_ok / load_ok instead of secret
// gfx/screens2.js  nothing needed: "shard" at the ending plays only shard_glint while the
//              ending track plays; shard_ending (six bells fusing, 4 s) is there if the music
//              job ever drops the rise from its ending track
