"use strict";
// ---------- Leitmotifs: the game's recurring musical ideas (all newly written) ----------
// Plain data that every composer file can quote, independent of the song notation.
// Plain-language guide with harmonisations and ways to vary each idea: tools/sound_motifs.md.
//
// Pitches are written relative to the motif's tonic, so a motif moves to any key, octave or mode:
//   pitch "deg":  [degree, sixteenths, accidental?]  degree 1 = tonic, 8 = tonic an octave up,
//                 0 = the 7th below the tonic, -1 = the 6th below ... (steps of the mode's scale);
//                 accidental = semitones added (+1 raises, -1 lowers). Changing the mode recolours it.
//   pitch "semi": [semitones above the tonic, sixteenths]. Chromatic ideas keep their exact intervals.
// Lengths are in 16th notes (4 = quarter note). `pickup` = 16ths before the first bar line.
// Harmonisations: { use, list: [[symbol, root semitones above tonic, quality, sixteenths, bass?]] }
// where bass (optional) is the bass note in semitones above the tonic (for inversions and pedals).
//
// MotifKit.notes("sunstone", { form: "minor", tonic: 50 }) -> [[midi, sixteenths], ...]
// MotifKit.chords("sunstone", "hymn", { form: "core" })    -> [{ sym, len, notes: [midi...], bass }]

const MOTIFS = {
  // --- Sunstone: hope, the dawn stone, Maren's voice ---
  // A step up and a fourth up (the sun clearing the hills), then a gentle fall that stops on
  // the 2nd: a question. The complete form answers by climbing to the high tonic.
  // Notes in the home key: D4 E4 | A4. B4 G4. F#4 | E4
  sunstone: {
    title: "Sunstone", use: "title, ending (complete), credits, Maren's voice, hints elsewhere",
    key: "D", tonic: 62, mode: "major", meter: "4/4", pitch: "deg",
    forms: {
      // the motif itself (7 notes, 2 bars + pickup)
      core: { pickup: 4, notes: [[1, 2], [2, 2], [5, 6], [6, 2], [4, 6], [3, 2], [2, 16]] },
      // question + answer; the answer turns upward (6 -> 8 -> 7 -> 8) instead of falling
      complete: { pickup: 4, notes: [[1, 2], [2, 2], [5, 6], [6, 2], [4, 6], [3, 2], [2, 12],
        [1, 2], [2, 2], [5, 6], [6, 2], [8, 6], [7, 2], [8, 16]] },
      // same shape in minor: the 6th becomes a half-step sigh (A -> Bb)
      minor: { pickup: 4, mode: "minor", notes: [[1, 2], [2, 2], [5, 6], [6, 2], [4, 6], [3, 2], [2, 16]] },
      // loss / game over: the answer fails to rise and sinks to the tonic
      lament: { pickup: 4, mode: "harmonic", notes: [[1, 2], [2, 2], [5, 6], [6, 2], [4, 6], [3, 2], [2, 12],
        [1, 2], [2, 2], [3, 6], [4, 2], [2, 6], [0, 2], [1, 16]] },
      // the three-note shard: short, short, LONG (keep the last note at least 3x the first)
      fragment: { pickup: 4, notes: [[1, 2], [2, 2], [5, 12]] },
      // the falling tail alone (6 4 3 2), usable as an answer figure or counter-line
      tail: { pickup: 2, notes: [[6, 2], [4, 6], [3, 2], [2, 8]] },
      // half speed (for fast music) and double length (for the hymn and the ending horns)
      fast: { pickup: 2, notes: [[1, 1], [2, 1], [5, 3], [6, 1], [4, 3], [3, 1], [2, 8]] },
      broad: { pickup: 8, notes: [[1, 4], [2, 4], [5, 12], [6, 4], [4, 12], [3, 4], [2, 32]] },
    },
    chords: {
      core: {
        hymn: { use: "plain hymn: I - IV - V", list: [
          ["I", 0, "maj", 4], ["I", 0, "maj", 8], ["IV", 5, "maj", 8], ["V", 7, "maj", 16]] },
        wistful: { use: "softer, starts on the relative minor: vi7 - ii7 - Vsus4 V", list: [
          ["I", 0, "maj", 4], ["vi7", 9, "m7", 8], ["ii7", 2, "m7", 8], ["Vsus4", 7, "sus4", 8], ["V", 7, "maj", 8]] },
      },
      complete: {
        hymn: { use: "title / ending: I IV | V | I Vsus4 V | I", list: [
          ["I", 0, "maj", 4], ["I", 0, "maj", 8], ["IV", 5, "maj", 8], ["V", 7, "maj", 12], ["I", 0, "maj", 4],
          ["I", 0, "maj", 8], ["Vsus4", 7, "sus4", 4], ["V", 7, "maj", 4], ["I", 0, "maj", 16]] },
        wistful: { use: "credits / Maren: vi7 ii7 | Vsus4 V I/3 | IVadd9 Vsus4 V | I", list: [
          ["I", 0, "maj", 4], ["vi7", 9, "m7", 8], ["ii7", 2, "m7", 8], ["Vsus4", 7, "sus4", 8], ["V", 7, "maj", 4],
          ["I/3", 0, "maj", 4, 4], ["IVadd9", 5, "add9", 8], ["Vsus4", 7, "sus4", 4], ["V", 7, "maj", 4], ["I", 0, "maj", 16]] },
      },
      minor: {
        dark: { use: "i - iv - V (harmonic-minor V)", list: [
          ["i", 0, "min", 4], ["i", 0, "min", 8], ["iv", 5, "min", 8], ["V", 7, "maj", 16]] },
        tender: { use: "i - VImaj7 - iv7 - V", list: [
          ["i", 0, "min", 4], ["VImaj7", 8, "maj7", 8], ["iv7", 5, "m7", 8], ["V", 7, "maj", 16]] },
      },
      lament: {
        dark: { use: "i iv | V i | i/3 V | i", list: [
          ["i", 0, "min", 4], ["i", 0, "min", 8], ["iv", 5, "min", 8], ["V", 7, "maj", 12], ["i", 0, "min", 4],
          ["i/3", 0, "min", 8, 3], ["V", 7, "maj", 8], ["i", 0, "min", 16]] },
        tender: { use: "VImaj7 iv7 | V i | VI V7 | i", list: [
          ["i", 0, "min", 4], ["VImaj7", 8, "maj7", 8], ["iv7", 5, "m7", 8], ["V", 7, "maj", 12], ["i", 0, "min", 4],
          ["VI", 8, "maj", 8], ["V7", 7, "dom7", 8], ["i", 0, "min", 16]] },
      },
    },
    // Maren's voice scenes (CR-M2): the idea grows a little with each shard found.
    // Each step is an options object for MotifKit.notes(). The last tonic is kept for the ending.
    shardSteps: [
      { form: "fragment", mode: "minor", scale: 2 },  // 1: only the three-note shard, slow, minor
      { form: "minor", count: 5 },                    // 2: the rise and the first fall
      { form: "minor" },                              // 3: the whole question, still minor
      { form: "core" },                               // 4: the colour turns major
      { form: "complete", count: 11 },                // 5: the answer starts to climb (stops on the 6th)
      { form: "complete", count: 13 },                // 6: all but the final tonic (hangs on the 7th)
    ],
  },

  // --- Shadow: Vex, who was Maren's pupil and tried to keep the dawn for himself ---
  // Also starts on the tonic and climbs, like the Sunstone, but through a tritone (F -> B),
  // then slides down a half step and drops another tritone (Bb -> E). Its range is a tritone.
  // Notes in the home key: D4 F4 B4~ | B4 Bb4 E4
  shadow: {
    title: "Shadow", use: "final dungeon, Vex, Barrow Deep hints",
    key: "D", tonic: 62, mode: "minor", meter: "4/4", pitch: "semi",
    forms: {
      // the motif itself (5 notes, 2 bars; the B is tied across the bar line)
      core: { pickup: 0, notes: [[0, 8], [3, 4], [9, 8], [8, 4], [2, 8]] },
      // one-bar bass ostinato grouped 3+3+2 / 3+3+2; the low A pulls back to D on the repeat
      ostinato: { pickup: 0, notes: [[0, 3], [3, 3], [9, 2], [8, 3], [2, 3], [-5, 2]] },
      // double length, for organ / low choir at 68-76 BPM
      slow: { pickup: 0, notes: [[0, 16], [3, 8], [9, 16], [8, 8], [2, 16]] },
      // the rise alone (D F B) and the fall alone (B Bb E)
      fragment: { pickup: 0, notes: [[0, 4], [3, 4], [9, 8]] },
      fall: { pickup: 0, notes: [[9, 4], [8, 4], [2, 8]] },
      // Shadow notes in the Sunstone's rhythm: Vex wearing the dawn (final boss)
      mask: { pickup: 4, notes: [[0, 2], [3, 2], [9, 6], [8, 2], [2, 16]] },
    },
    chords: {
      core: {
        bassline: { use: "motif in the bass, chords follow it: Dm Dm/F G7/B Gm/Bb A7/E", list: [
          ["i", 0, "min", 8], ["i/3", 0, "min", 4, 3], ["IV7/3", 5, "dom7", 8, 9],
          ["iv/3", 5, "min", 4, 8], ["V7/5", 7, "dom7", 8, 2]] },
        pedal: { use: "motif on top of a D + G# (tritone) drone: dim7 -> French sixth -> (A)", pedal: [0, 6], list: [
          ["dim7", 0, "dim7", 20, 0], ["Fr6", 8, "fr6", 12, 0]] },
      },
      ostinato: {
        drive: { use: "one bar: Dm6, then A7(b9) over E", list: [
          ["i6", 0, "m6", 8], ["V7b9/5", 7, "dom7b9", 8, 2]] },
        fifths: { use: "open fifths only, the ostinato gives the colour", list: [
          ["i5", 0, "5", 16]] },
      },
    },
  },

  // --- Village: Brambleford, home ---
  // Lydian (raised 4th) in 3/4: a turn around the 3rd that touches the bright #4, a reach up
  // over the II chord, and rest on the 5th. The complete form answers a sixth higher with the
  // same zig-zag (E C-D B) and comes home down the II chord through the #4 (A F# D | C).
  // Notes in the home key: G5 E5 F#5 E5 | D5 A5 | G5
  village: {
    title: "Village", use: "Brambleford, house interiors (same tune, thinned)",
    key: "C", tonic: 72, mode: "lydian", meter: "3/4", pitch: "deg",
    forms: {
      core: { pickup: 0, notes: [[5, 4], [3, 2], [4, 2], [3, 4], [2, 4], [6, 8], [5, 12]] },
      complete: { pickup: 0, notes: [[5, 4], [3, 2], [4, 2], [3, 4], [2, 4], [6, 8], [5, 12],
        [10, 4], [8, 2], [9, 2], [7, 4], [6, 4], [4, 4], [2, 4], [1, 12]] },
      // first bar alone (the #4 is in the first three notes)
      fragment: { pickup: 0, notes: [[5, 4], [3, 2], [4, 2], [3, 4]] },
      // 6/8 lilt of the same notes
      lilt: { pickup: 0, meter: "6/8", notes: [[5, 4], [3, 2], [4, 4], [3, 2], [2, 4], [6, 8], [5, 12]] },
    },
    chords: {
      core: {
        home: { use: "Lydian vamp: I - II/I - I", list: [
          ["I", 0, "maj", 12], ["II/1", 2, "maj", 12, 0], ["I", 0, "maj", 12]] },
        travel: { use: "open ending: Imaj7 iii7 | II6 | V", list: [
          ["Imaj7", 0, "maj7", 8], ["iii7", 4, "m7", 4], ["II6", 2, "maj", 12, 6], ["V", 7, "maj", 12]] },
      },
      complete: {
        home: { use: "I | II/I | I | iii7 | II/I | I", list: [
          ["I", 0, "maj", 12], ["II/1", 2, "maj", 12, 0], ["I", 0, "maj", 12],
          ["iii7", 4, "m7", 12], ["II/1", 2, "maj", 12, 0], ["I", 0, "maj", 12]] },
        travel: { use: "Imaj7 iii7 | II6 | I | Imaj9 | II | Iadd9", list: [
          ["Imaj7", 0, "maj7", 8], ["iii7", 4, "m7", 4], ["II6", 2, "maj", 12, 6], ["I", 0, "maj", 12],
          ["Imaj9", 0, "maj9", 12], ["II", 2, "maj", 12], ["Iadd9", 0, "add9", 12]] },
      },
    },
  },

  // --- Hero: a 2-bar call that can open the field theme (optional) ---
  // Up a fifth, a step down, up a fourth to the flat 7th (the "open road" colour), then a
  // falling answer that stops on the 5th, ready for the theme to begin.
  // Notes in the home key: G3 D4 C4 F4 | E4 D4 C4 D4
  hero: {
    title: "Hero", use: "field theme opening (optional), setting out",
    key: "G", tonic: 55, mode: "mixolydian", meter: "4/4", pitch: "deg",
    forms: {
      core: { pickup: 0, notes: [[1, 4], [5, 2], [4, 2], [7, 8], [6, 4], [5, 2], [4, 2], [5, 8]] },
      // plain major: the leap goes to the octave instead of the flat 7th
      ionian: { pickup: 0, mode: "major", notes: [[1, 4], [5, 2], [4, 2], [8, 8], [6, 4], [5, 2], [4, 2], [5, 8]] },
      fragment: { pickup: 0, notes: [[1, 4], [5, 2], [4, 2], [7, 8]] },
    },
    chords: {
      core: {
        road: { use: "I bVII | IV I (Mixolydian)", list: [
          ["I", 0, "maj", 8], ["bVII", 10, "maj", 8], ["IV", 5, "maj", 8], ["I", 0, "maj", 8]] },
        quest: { use: "vi7 bVII | IV V (ends open on V)", list: [
          ["vi7", 9, "m7", 8], ["bVII", 10, "maj", 8], ["IV", 5, "maj", 8], ["V", 7, "maj", 8]] },
      },
      ionian: {
        bright: { use: "I ii7 | IV V", list: [
          ["I", 0, "maj", 8], ["ii7", 2, "m7", 8], ["IV", 5, "maj", 8], ["V", 7, "maj", 8]] },
        warm: { use: "I vi7 | IV V", list: [
          ["I", 0, "maj", 8], ["vi7", 9, "m7", 8], ["IV", 5, "maj", 8], ["V", 7, "maj", 8]] },
      },
    },
  },
};

// Convenience aliases in the shape the plan asked for (same arrays, not copies).
for (const k in MOTIFS) {
  const m = MOTIFS[k];
  m.notes = m.forms.core.notes;
  m.pickup = m.forms.core.pickup;
  m.harmony = m.chords.core;
  if (m.forms.minor) m.minorForm = m.forms.minor.notes;
}

// ---------- MotifKit: turn motif data into notes and chords ----------
const MotifKit = {
  SCALES: {
    major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11],
    dorian: [0, 2, 3, 5, 7, 9, 10], phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10],
  },
  QUALITY: {
    maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus4: [0, 5, 7], sus2: [0, 2, 7],
    "5": [0, 7], maj7: [0, 4, 7, 11], m7: [0, 3, 7, 10], dom7: [0, 4, 7, 10], m7b5: [0, 3, 6, 10],
    dim7: [0, 3, 6, 9], dom7b9: [0, 4, 7, 10, 13], fr6: [0, 4, 6, 10], add9: [0, 4, 7, 14], maj9: [0, 4, 7, 11, 14], m6: [0, 3, 7, 9],
  },
  NAMES: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
  FLATS: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  MIXED: ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"],  // minor keys: Bb, C#, G#

  // Semitones above the tonic for a scale degree (1 = tonic, 8 = octave, 0 = 7th below).
  degSemi(deg, acc, mode) {
    const sc = this.SCALES[mode] || this.SCALES.major;
    const i = deg - 1, oct = Math.floor(i / 7), st = ((i % 7) + 7) % 7;
    return oct * 12 + sc[st] + (acc || 0);
  },

  form(name, formName) {
    const m = MOTIFS[name];
    if (!m) throw new Error("no motif " + name);
    const f = m.forms[formName || "core"];
    if (!f) throw new Error("no form " + formName + " in motif " + name);
    return f;
  },

  // Note list [[midi, sixteenths], ...]. Options:
  //   form ("core"), tonic (midi, default the motif's), mode (overrides), octave (+/- octaves),
  //   count (first n notes), scale (length factor: 2 = twice as long), invert (mirror around the
  //   first note: by scale steps for "deg" motifs, by semitones for "semi"), retro (backwards),
  //   shift (move by scale steps, for sequences; "deg" motifs only).
  notes(name, opts) {
    opts = opts || {};
    const m = MOTIFS[name], f = this.form(name, opts.form);
    const mode = opts.mode || f.mode || m.mode;
    const tonic = (opts.tonic !== undefined ? opts.tonic : m.tonic) + 12 * (opts.octave || 0);
    let src = f.notes.slice(0, opts.count || f.notes.length);
    const first = src[0][0];
    let out = src.map(n => {
      let p = n[0], acc = n[2] || 0;
      if (opts.invert) { p = 2 * first - p; acc = -acc; }
      if (m.pitch === "deg") {
        p += opts.shift || 0;
        return [tonic + this.degSemi(p, acc, mode), n[1] * (opts.scale || 1)];
      }
      return [tonic + p, n[1] * (opts.scale || 1)];
    });
    if (opts.retro) out = out.reverse();
    return out;
  },

  // Chords of one harmonisation as [{ sym, len, notes: [midi...], bass }]. Close position with
  // the root at or below `center` (default: the tonic), bass one or two octaves below the tonic.
  chords(name, harm, opts) {
    opts = opts || {};
    const m = MOTIFS[name], set = m.chords[opts.form || "core"];
    const h = set && set[harm];
    if (!h) throw new Error("no harmonisation " + harm + " for " + name);
    const tonic = (opts.tonic !== undefined ? opts.tonic : m.tonic) + 12 * (opts.octave || 0);
    const center = opts.center !== undefined ? opts.center : tonic;
    const scale = opts.scale || 1;
    return h.list.map(c => {
      let root = tonic + c[1];
      while (root > center) root -= 12;
      while (root <= center - 12) root += 12;
      let bass = tonic + (c[4] !== undefined ? c[4] : c[1]) - 12;
      while (bass >= tonic - 12) bass -= 12;
      while (bass < tonic - 24) bass += 12;
      return { sym: c[0], len: c[3] * scale, notes: this.QUALITY[c[2]].map(i => root + i), bass };
    });
  },

  // Drone notes of a harmonisation that has one (e.g. the Shadow's D + G#), as midi.
  pedal(name, harm, opts) {
    opts = opts || {};
    const m = MOTIFS[name], h = m.chords[opts.form || "core"][harm];
    const tonic = (opts.tonic !== undefined ? opts.tonic : m.tonic) + 12 * (opts.octave || 0);
    return (h.pedal || []).map(s => tonic - 24 + s);
  },

  // Note name; spell = true for flats, "mixed" for minor keys (Bb, Eb but C#, F#, G#).
  name(midi, spell) {
    const t = spell === "mixed" ? this.MIXED : spell ? this.FLATS : this.NAMES;
    return t[midi % 12] + (Math.floor(midi / 12) - 1);
  },

  // "D4/2 E4/2 A4/6 ..." (lengths in 16ths), the same style as the audiolab note lists.
  text(list, spell) { return list.map(n => (n[0] > 0 ? this.name(n[0], spell) : "-") + "/" + n[1]).join(" "); },

  // Total length in 16ths (pickup included).
  length(list) { let s = 0; for (const n of list) s += n[1]; return s; },

  // ----- engine notation (the MML-like song text of engine.js) -----
  MML_SHARP: ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"],
  MML_MIXED: ["c", "c#", "d", "e-", "e", "f", "f#", "g", "g#", "a", "b-", "b"],
  MML_LEN: [[16, "1"], [14, "2.."], [12, "2."], [8, "2"], [7, "4.."], [6, "4."], [4, "4"], [3, "8."], [2, "8"],
    [1.5, "16."], [1, "16"], [0.5, "32"]],

  // 16ths -> a length word, tied inside the bar when needed ("4^16").
  mmlLen(six) {
    const out = [];
    let left = six;
    for (const [v, s] of this.MML_LEN) while (left >= v - 1e-9) { out.push(s); left -= v; }
    if (left > 1e-6) throw new Error("length of " + six + " sixteenths cannot be written");
    return out.join("^");
  },

  barOf(name, opts) {
    const m = MOTIFS[name], f = this.form(name, opts && opts.form);
    return { "3/4": 12, "6/8": 12 }[f.meter || m.meter] || 16;
  },

  // Note list -> song text with bar lines. A rest fills the bar before a pickup and the end of
  // the last bar; a note crossing a bar line is split and joined with '&'. spell: "sharp" or mixed.
  toMml(list, pickup, bar, spell) {
    const names = spell === "sharp" ? this.MML_SHARP : this.MML_MIXED, out = [];
    let pos = 0, oct = null;
    const put = (tok, len) => { out.push(tok); pos += len; if (pos >= bar - 1e-9) { out.push("|"); pos = 0; } };
    if (pickup % bar) put("r" + this.mmlLen(bar - pickup % bar), bar - pickup % bar);
    for (const n of list) {
      const o = Math.floor(n[0] / 12) - 1;
      if (o !== oct) { out.push("o" + o); oct = o; }
      let left = n[1];
      while (left > 1e-9) {
        const part = Math.min(left, bar - pos);
        left -= part;
        put(names[n[0] % 12] + this.mmlLen(part) + (left > 1e-9 ? "&" : ""), part);
      }
    }
    if (pos > 0) put("r" + this.mmlLen(bar - pos), bar - pos);
    return out.join(" ");
  },

  // A motif form as song text (same options as notes(), plus spell).
  //   MotifKit.mml("sunstone") -> "r2. o4 d8 e8 | a4. b8 g4. f#8 | e1 |"
  mml(name, opts) {
    opts = opts || {};
    const f = this.form(name, opts.form);
    return this.toMml(this.notes(name, opts), f.pickup * (opts.scale || 1), this.barOf(name, opts), opts.spell);
  },

  // A harmonisation as song text: one {chord} per change, struck again at a bar line
  // (opts as for chords(); bass: true gives the bass notes as a single line instead).
  mmlChords(name, harm, opts) {
    opts = opts || {};
    const f = this.form(name, opts.form), bar = this.barOf(name, opts);
    const pickup = f.pickup * (opts.scale || 1), ch = this.chords(name, harm, opts);
    if (opts.bass) return this.toMml(ch.map(c => [c.bass, c.len]), pickup, bar, opts.spell);
    const names = opts.spell === "sharp" ? this.MML_SHARP : this.MML_MIXED, out = [];
    let pos = 0;
    const put = (tok, len) => { out.push(tok); pos += len; if (pos >= bar - 1e-9) { out.push("|"); pos = 0; } };
    if (pickup % bar) put("r" + this.mmlLen(bar - pickup % bar), bar - pickup % bar);
    for (const c of ch) {
      const ns = c.notes.slice().sort((a, b) => a - b), o = Math.floor(ns[0] / 12) - 1;
      let cur = o, inner = [];
      for (const n of ns) {
        let s = "";
        while (Math.floor(n / 12) - 1 > cur) { s += ">"; cur++; }
        inner.push(s + names[n % 12]);
      }
      let left = c.len;
      while (left > 1e-9) {
        const part = Math.min(left, bar - pos);
        left -= part;
        out.push("o" + o);
        put("{" + inner.join(" ") + "}" + this.mmlLen(part), part);
      }
    }
    if (pos > 0) put("r" + this.mmlLen(bar - pos), bar - pos);
    return out.join(" ");
  },
};
