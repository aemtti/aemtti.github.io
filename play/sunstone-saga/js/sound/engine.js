"use strict";
// ---------- Sound engine: 16-bit style music and effects on Web Audio ----------
// Plays the code-made instruments of synth.js the way a 16-bit sample chip did: each channel
// has an instrument, a stereo position, a level and sends into ONE shared echo (a feedback
// delay whose repeats get darker) and ONE shared reverb (a generated impulse response).
// Songs are written as text (MML-like, see tools/sound_format.md), checked bar by bar when
// they are added, and scheduled 0.5 s ahead on the audio clock from Sound.update().
// Public API (unchanged for the game): Sound.unlock(), toggleMute(), muted, sfx(name),
// music(name[, force]), stopMusic(), update(), trackName. New: duck, pauseMusic, resumeMusic,
// stinger, setLayer, describeTrack, sfxNames, note, key, setRoom, loop/stopLoop, stepDelay.
// Test hook: Sound.onReset(fn) - fn runs on every Sound.resetForTest() (AudioLab calls it before
// each render), so a file that keeps its own state between plays (sfx.js: the heartbeat count,
// the gem climb) can clear it there, e.g. Sound.onReset(() => { hb.n = 0; hb.last = -99; }).
// Start-up: unlock() builds only the samples the waiting track needs in its first 0.8 s; the
// rest (that track's other samples first, in the order it needs them, then every instrument
// and effect) is built from update() in slices of about 4 ms. Finished voices are unplugged.
// Globals made here: TRACKS, SFX, SONG, Sound (synth.js makes SYNTH and midiHz).

const TRACKS = {};      // song registry: SONG.add(name, def) (checked at once) or TRACKS.name = def
const SFX = {};         // effect table: placeholders at the end of this file, js/sound/sfx.js replaces them

// ============================================================
// SONG: the text notation -> event lists (all checks happen here)
// ============================================================
const SONG = {
  WHOLE: 384,           // ticks in a whole note (quarter = 96; every length 1..96 that divides it works)
  // Default drum letters for channels with inst "kit" (a track or channel may add its own via kit:{}).
  KIT: { K: "kick", S: "snare", R: "rim", H: "hat", O: "ohat", C: "crash", L: "tomlo", M: "tommid", T: "tomhi",
    Z: "shaker", J: "sleigh", A: "anvil", D: "handlo", E: "handhi", X: "clap" },
  MODES: { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], harmonic: [0, 2, 3, 5, 7, 8, 11], dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10], lydian: [0, 2, 4, 6, 7, 9, 11], mixolydian: [0, 2, 4, 5, 7, 9, 10] },
  cache: {},            // name -> compiled track (rebuilt when TRACKS[name] is replaced)
  failed: {},           // name -> error message of the last failed compile

  // Add a track and check it now: a wrong bar throws an error naming track, section, channel, bar.
  add(name, def) {
    TRACKS[name] = def;
    delete this.cache[name];
    this.get(name);
    return def;
  },
  get(name) {
    const def = TRACKS[name];
    if (!def) return null;
    const c = this.cache[name];
    if (c && c.def === def) return c;
    try { this.cache[name] = this.compile(name, def); }
    catch (e) { this.failed[name] = e.message; throw e; }
    delete this.failed[name];
    return this.cache[name];
  },
  // Compile every track; returns {name: error message} for the ones that fail.
  checkAll() {
    const bad = {};
    for (const n in TRACKS) { try { this.get(n); } catch (e) { bad[n] = e.message; } }
    return bad;
  },
  // Scale degree -> MIDI note in a key {tonic, mode}: degree 0 = tonic, 7 = the octave above.
  degree(key, d, oct) {
    const sc = this.MODES[key.mode] || this.MODES.major, i = ((d % 7) + 7) % 7;
    return key.tonic + sc[i] + 12 * (Math.floor(d / 7) + (oct || 0));
  },
  // Note list -> notation text (for quoting motifs kept as data). notes: [[midi, sixteenths], ...],
  // midi 0 / null = rest. Bar lines are added; a note crossing one is tied with '&'.
  // o: {meter (default "4/4"), at: 16ths of rest before the first note, bars: pad with rests
  // to this many bars, vel: 0..100 for every note, acc: array of note indexes to accent}.
  text(notes, o) {
    o = o || {};
    const fail = m => { throw new Error("[music] SONG.text: " + m); };
    const bar16 = this.meter(o.meter || "4/4", fail).barTicks / 24;
    if (bar16 % 1) fail("the meter must be a whole number of 16ths");
    const NM = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"], PIECES = [16, 12, 8, 6, 4, 3, 2, 1];
    const LEN = { 16: "1", 12: "2.", 8: "2", 6: "4.", 4: "4", 3: "8.", 2: "8", 1: "16" };
    const lens = d => { const out = []; for (const p of PIECES) while (d >= p) { out.push(LEN[p]); d -= p; } return out; };
    const out = [];
    let pos = 0, oct = null;
    const put = (midi, d, idx) => {
      if (!(d > 0) || d % 1) fail("lengths must be whole 16ths (note " + idx + ")");
      let first = true;
      while (d > 0) {
        const seg = Math.min(d, bar16 - pos % bar16), ls = lens(seg);
        if (!midi) out.push("r" + ls.join("^"));
        else {
          const o2 = Math.floor(midi / 12) - 1;
          if (o2 !== oct) { out.push("o" + o2); oct = o2; }
          out.push(NM[midi % 12] + ls.join("^") + (first && o.acc && o.acc.indexOf(idx) >= 0 ? "!" : "") + (d - seg > 0 ? "&" : ""));
        }
        first = false; pos += seg; d -= seg;
        if (pos % bar16 === 0) out.push("|");
      }
    };
    if (o.vel != null) out.push("v" + o.vel);
    if (o.at) put(0, o.at, -1);
    notes.forEach((n, i) => put(n[0], n[1], i));
    const bars = Math.max(o.bars || 0, Math.ceil(pos / bar16));
    if (pos < bars * bar16) put(0, bars * bar16 - pos, -1);
    return out.join(" ");
  },
  lenTicks(v, fail) {
    const m = /^(\d+)(\.*)$/.exec(String(v));
    if (!m || this.WHOLE % +m[1]) fail("bad length '" + v + "' (use 1, 2, 4, 8, 16, 32 ... with optional dots)");
    let d = this.WHOLE / +m[1], add = d;
    for (let k = 0; k < m[2].length; k++) { add /= 2; d += add; }
    return d;
  },
  // "4/4", "3/4", "6/8", "3+3+2/8" -> bar length and beat starts (ticks within the bar).
  meter(s, fail) {
    const m = /^\s*(\d+(?:\s*\+\s*\d+)*)\s*\/\s*(1|2|4|8|16)\s*$/.exec(String(s));
    if (!m) fail("meter '" + s + "' must look like 4/4, 3/4, 6/8 or 3+3+2/8");
    const parts = m[1].split("+").map(x => +x), unit = +m[2], ut = this.WHOLE / unit, n = parts.reduce((a, b) => a + b, 0);
    let groups = parts;
    if (parts.length === 1) {
      if (unit >= 8 && n % 3 === 0 && n > 3) groups = Array(n / 3).fill(3);
      else if (unit >= 8 && n > 4) { groups = []; let left = n; while (left > 3) { groups.push(2); left -= 2; } groups.push(left); }
      else groups = Array(n).fill(1);
    }
    const beats = []; let acc = 0;
    for (const g of groups) { beats.push(acc * ut); acc += g; }
    const unitName = { 1: "whole notes", 2: "half notes", 4: "quarter notes", 8: "eighth notes", 16: "sixteenth notes" }[unit];
    return { text: m[1].replace(/\s/g, "") + "/" + unit, barTicks: n * ut, beats, unitTicks: ut, unitName, units: n, groups };
  },

  compile(name, def) {
    const W = "track '" + name + "'";
    const fail = m => { throw new Error("[music] " + W + ": " + m); };
    if (!def || typeof def !== "object") fail("must be an object");
    if (typeof def.bpm !== "number" || !(def.bpm >= 20 && def.bpm <= 400)) fail("bpm must be a number 20..400");
    const meter = this.meter(def.meter || "4/4", fail);
    const beatTicks = def.beat ? this.lenTicks(def.beat, fail) : 96;
    const spt = 60 / (def.bpm * beatTicks);
    const list = Array.isArray(def.chans) ? def.chans : def.chans && typeof def.chans === "object" ?
      Object.keys(def.chans).map(k => Object.assign({ name: k }, def.chans[k])) : null;
    if (!list || !list.length) fail("needs chans: [{ name, inst, pan, vol, ... }]");
    if (list.length > (def.test ? 48 : 16)) fail("has " + list.length + " channels; keep 6-8 (16 at most)");
    const seen = {}, known = Object.keys(SYNTH.INST).join(", ");
    const chans = list.map((o, i) => {
      const nm = o && o.name;
      if (!/^[A-Za-z0-9_]+$/.test(nm || "")) fail("channel " + (i + 1) + " needs a name (letters, digits, _)");
      if (seen[nm]) fail("two channels are called '" + nm + "'");
      seen[nm] = 1;
      const cf = m => fail("channel '" + nm + "': " + m);
      const drums = o.inst === "kit" || o.inst === "drums";
      if (!drums && !SYNTH.INST[o.inst]) cf("unknown instrument '" + o.inst + "' (known: kit, " + known + ")");
      const num = (v, d, lo, hi, what) => {
        if (v == null) return d;
        if (typeof v !== "number" || !(v >= lo && v <= hi)) cf(what + " must be a number " + lo + ".." + hi);
        return v;
      };
      const arr = (v, n, what) => { if (v == null || v === false) return null; if (v === true) return true; if (!Array.isArray(v) || v.length < n) cf(what + " must be an array of " + n + " numbers"); return v; };
      return {
        name: nm, inst: drums ? "kit" : o.inst, drums, index: i,
        pan: num(o.pan, 0, -1, 1, "pan"), vol: num(o.vol, 0.7, 0, 2, "vol"), echo: num(o.echo, 0, 0, 1, "echo"), verb: num(o.verb, 0.2, 0, 1, "verb"),
        layer: o.layer ? String(o.layer) : null, oct: num(o.oct, 4, 0, 8, "oct"), len: o.len ? this.lenTicks(o.len, cf) : 48,
        vel: num(o.vel, 80, 0, 100, "vel"), q: num(o.q, 90, 1, 100, "q"), port: num(o.port, 80, 0, 2000, "port") / 1000,
        vib: arr(o.vib, 3, "vib"), lp: arr(o.lp, 2, "lp"), env: arr(o.env, 4, "env"), ring: num(o.ring, null, 0, 10, "ring"),
        poly: num(o.poly, drums ? 12 : 8, 1, 32, "poly"), trans: num(o.trans, 0, -48, 48, "trans"), fixed: !!o.fixed,
        trem: arr(o.trem, 2, "trem"), kit: Object.assign({}, this.KIT, def.kit, o.kit),
      };
    });
    const byName = {};
    chans.forEach(c => { byName[c.name] = c; });
    const parts = def.parts || {}, secCache = {}, warnings = [];
    const section = (label, part, trans) => {
      const key = label + "|" + trans;
      if (secCache[key]) return secCache[key];
      if (!part || typeof part !== "object") fail("section '" + label + "' must be an object { channelName: \"notes\" }");
      for (const k in part) if (!byName[k]) fail("section '" + label + "' has a line for '" + k + "', which is not a channel (" + chans.map(c => c.name).join(", ") + ")");
      let ticks = null, first = null;
      const events = [];
      for (const ch of chans) {
        const text = part[ch.name];
        if (text == null) continue;
        if (typeof text !== "string") fail("section '" + label + "', channel '" + ch.name + "' must be a string");
        const where = W + ", section '" + label + "', channel '" + ch.name + "'";
        const r = this.walk(this.expand(this.lex(text, where), text, where), ch, { where, text, meter, trans: ch.drums || ch.fixed ? 0 : trans, warnings });
        if (ticks == null) { ticks = r.ticks; first = ch.name; }
        else if (r.ticks !== ticks) fail("section '" + label + "': channel '" + ch.name + "' is " + r.ticks / meter.barTicks + " bars but '" + first + "' is " + ticks / meter.barTicks + " bars");
        for (const e of r.events) events.push(e);
      }
      if (ticks == null) fail("section '" + label + "' has no channel lines");
      if (!ticks) fail("section '" + label + "' is empty");
      events.sort((a, b) => a.tick - b.tick || a.ch - b.ch);
      return (secCache[key] = { events, ticks, bars: ticks / meter.barTicks });
    };
    const order = key => {
      const s = def[key], out = { events: [], ticks: 0, bars: 0, sections: [] };
      if (s == null) return out;
      const items = Array.isArray(s) ? s : [s];
      for (const it of items) {
        let label = key, trans = 0, times = 1, part;
        if (typeof it === "string") {
          const m = /^\s*([A-Za-z0-9_]+)\s*([+-]\s*\d+)?\s*(?:\*\s*(\d+))?\s*$/.exec(it);
          if (!m) fail(key + " item '" + it + "' must look like \"A\", \"B+1\" or \"A*2\"");
          label = m[1]; trans = m[2] ? +m[2].replace(/\s/g, "") : 0; times = m[3] ? +m[3] : 1;
          part = parts[label];
          if (!part) fail(key + " names section '" + label + "' but parts has no such section (" + (Object.keys(parts).join(", ") || "none") + ")");
        } else if (it && typeof it === "object") part = it;
        else fail(key + " must be a list of section names or a section object");
        const sec = section(label, part, trans);
        for (let k = 0; k < times; k++) {
          out.sections.push({ label, trans, bar: out.bars, bars: sec.bars });
          for (const e of sec.events) out.events.push(Object.assign({}, e, { tick: e.tick + out.ticks }));
          out.ticks += sec.ticks; out.bars += sec.bars;
        }
      }
      return out;
    };
    const intro = order("intro"), loop = order("loop");
    if (!intro.ticks && !loop.ticks) fail("needs an intro and/or a loop");
    // shared effects for this track
    const e = def.echo === false ? { mix: 0 } : def.echo || {};
    let ems = e.ms != null ? e.ms : e.len ? this.lenTicks(e.len, fail) * spt * 1000 : 180;
    ems = Math.max(20, Math.min(700, ems));
    const v = def.verb === false ? { mix: 0 } : def.verb || {};
    const echo = { sec: ems / 1000, fb: Math.max(0, Math.min(0.75, e.fb == null ? 0.3 : e.fb)), lp: e.lp || 3000, hp: e.hp || 250, mix: e.mix == null ? 0.3 : e.mix };
    const verb = { sec: Math.max(0.3, Math.min(4, v.sec || 1.6)), mix: v.mix == null ? 0.25 : v.mix, lp: v.lp || 6000, pre: v.pre == null ? 0.015 : v.pre };
    let tonic = 60, mode = "major";
    if (typeof def.tonic === "number") tonic = def.tonic;
    if (typeof def.key === "string") {
      const km = /^\s*([A-Ga-g])([#b]?)\s*([a-z]*)\s*$/.exec(def.key);
      if (!km) fail("key '" + def.key + "' must look like \"C\", \"A minor\" or \"D dorian\"");
      tonic = 60 + { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[km[1].toLowerCase()] + (km[2] === "#" ? 1 : km[2] === "b" ? -1 : 0);
      if (km[3]) { if (!this.MODES[km[3]]) fail("unknown mode '" + km[3] + "' (" + Object.keys(this.MODES).join(", ") + ")"); mode = km[3]; }
    }
    const layers = [], insts = [];
    chans.forEach(c => { if (c.layer && layers.indexOf(c.layer) < 0) layers.push(c.layer); });
    for (const e of intro.events.concat(loop.events)) if (insts.indexOf(e.inst) < 0) insts.push(e.inst);
    const layerDefaults = Object.assign({}, def.layers || {});
    for (const k in layerDefaults) if (layers.indexOf(k) < 0) warnings.push("layers lists '" + k + "' but no channel uses that layer");
    const swing = Math.max(0, Math.min(0.5, def.swing || 0)), swingUnit = def.swing16 ? 24 : 48;
    const stinger = !!def.stinger;
    return {
      name, def, bpm: def.bpm, beatTicks, qbpm: def.bpm * beatTicks / 96, spt, meter: meter.text, barTicks: meter.barTicks, beats: meter.beats, groups: meter.groups,
      chans, intro, loop, introSec: intro.ticks * spt, loopSec: loop.ticks * spt, layers, layerDefaults, warnings, insts,
      echo, verb, gain: def.gain || 0, tonic, mode, swing, swingUnit,
      fadeIn: def.fadeIn || 0, fadeOut: def.fadeOut == null ? 0.5 : def.fadeOut, instant: !!def.instant,
      stinger, hold: def.hold || "pause", duckDb: def.duck || -12, tail: def.tail == null ? 0.3 : def.tail,
      memory: !stinger && def.memory !== false, clearMemory: !!def.clearMemory,
    };
  },

  // Text -> tokens. Comments run from ';' to the end of the line.
  lex(text, where) {
    const s = text.replace(/;[^\n]*/g, m => " ".repeat(m.length)), toks = [];
    let i = 0;
    const fail = (msg, at) => { throw new Error("[music] " + where + ": " + msg + " near '" + s.slice(Math.max(0, at - 10), at + 14).replace(/\s+/g, " ").trim() + "'"); };
    const NUM = /[0-9]+/y, SNUM = /[+-]?[0-9]+/y, NAME = /[a-z0-9_]+/y;
    const read = re => { re.lastIndex = i; const m = re.exec(s); if (!m) return null; i = re.lastIndex; return m[0]; };
    const len = () => { const n = read(NUM); let dots = 0; while (s[i] === ".") { dots++; i++; } return { n: n == null ? null : +n, dots }; };
    const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
    const acc = () => { let a = 0; for (;;) { if (s[i] === "#" || s[i] === "+") { a++; i++; } else if (s[i] === "-") { a--; i++; } else return a; } };
    const mods = tk => {
      for (;;) {
        const c = s[i];
        if (c === "^") { i++; const l = len(); if (l.n == null) fail("'^' (tie) needs a length, like c4^8", i); (tk.ties = tk.ties || []).push(l); }
        else if (c === "!") { i++; tk.acc = true; }
        else if (c === "?") { i++; tk.ghost = true; }
        else if (c === "'") { i++; tk.stac = true; }
        else if (c === "_") { i++; tk.ten = true; }
        else if (c === "~") { i++; tk.vib = true; }
        else if (c === "\\") { i++; const n = read(NUM); tk.fall = n == null ? 2 : +n; }
        else if (c === "&") { i++; tk.slur = true; }
        else return tk;
      }
    };
    const need = (t, what) => { const at = i - 1, n = read(t === "s" ? SNUM : NUM); if (n == null) fail("'" + s[at] + "' needs " + what, at); return n; };
    while (i < s.length) {
      const c = s[i], at = i;
      if (c === " " || c === "\n" || c === "\t" || c === "\r" || c === ",") { i++; continue; }
      i++;
      if (c === "|") toks.push({ t: "bar", at });
      else if (c === "[") toks.push({ t: "rep", at });
      else if (c === "]") { const n = read(NUM); toks.push({ t: "end", n: n == null ? 2 : +n, at }); }
      else if (c === ":") toks.push({ t: "volta", at });
      else if (c === "/") toks.push({ t: "glide", at });
      else if (PC[c] != null) toks.push(mods({ t: "note", semi: PC[c] + acc(), len: len(), at }));
      else if (c >= "A" && c <= "Z") toks.push(mods({ t: "drum", key: c, len: len(), at }));
      else if (c === "{") {
        const notes = []; let oct = 0;
        while (i < s.length && s[i] !== "}") {
          const d = s[i];
          if (d === " " || d === "\n" || d === "\t" || d === "\r" || d === ",") { i++; continue; }
          i++;
          if (d === ">") oct++;
          else if (d === "<") oct--;
          else if (PC[d] != null) notes.push({ semi: PC[d] + acc() + 12 * oct });
          else if (d >= "A" && d <= "Z") notes.push({ key: d });
          else fail("unexpected '" + d + "' inside a chord { }", i - 1);
        }
        if (s[i] !== "}") fail("a chord '{' is never closed", at);
        i++;
        if (!notes.length) fail("empty chord { }", at);
        toks.push(mods({ t: "chord", notes, len: len(), at }));
      }
      else if (c === "r") toks.push(mods({ t: "rest", len: len(), at }));
      else if (c === "z") { const n = read(NUM); toks.push({ t: "zbar", n: n == null ? 1 : +n, at }); }
      else if (c === "o") toks.push({ t: "o", v: +need("n", "an octave number (o4)"), at });
      else if (c === ">") toks.push({ t: "o+", at });
      else if (c === "<") toks.push({ t: "o-", at });
      else if (c === "l") { const l = len(); if (l.n == null) fail("'l' needs a length (l8)", at); toks.push({ t: "l", len: l, at }); }
      else if (c === "v") { const n = need("s", "a velocity 0..100 (v80, or v+10 / v-10)"); toks.push({ t: "v", v: +n, rel: n[0] === "+" || n[0] === "-", at }); }
      else if (c === "q") toks.push({ t: "q", v: +need("n", "a gate percent 1..100 (q90)"), at });
      else if (c === "k") toks.push({ t: "k", v: +need("s", "semitones (k2, k-3, k0)"), at });
      else if (c === "p") toks.push({ t: "p", v: +need("n", "a glide time in ms (p80)"), at });
      else if (c === "w") toks.push({ t: "w", v: +need("n", "a vibrato depth in cents (w15, w0 = off)"), at });
      else if (c === "@") { const n = read(NAME); if (!n) fail("'@' needs an instrument name (@flute)", at); toks.push({ t: "inst", name: n, at }); }
      else fail("unknown sign '" + c + "'", at);
    }
    return toks;
  },
  // Expand [ ... ]n repeats ([a : b]3 plays "a b a b a": the part after ':' is skipped last time).
  expand(toks, text, where) {
    const fail = (m, at) => { throw new Error("[music] " + where + ": " + m + " near '" + text.slice(Math.max(0, at - 10), at + 14).replace(/\s+/g, " ").trim() + "'"); };
    let i = 0;
    const block = depth => {
      const out = [];
      while (i < toks.length) {
        const tk = toks[i];
        if (tk.t === "rep") {
          i++;
          const inner = block(depth + 1);
          if (i >= toks.length || toks[i].t !== "end") fail("'[' is never closed with ']'", tk.at);
          const n = toks[i].n;
          i++;
          if (n < 1 || n > 64) fail("repeat count must be 1..64", tk.at);
          const vi = inner.findIndex(x => x.t === "volta");
          for (let k = 0; k < n; k++) for (const x of (vi >= 0 && k === n - 1 ? inner.slice(0, vi) : inner)) if (x.t !== "volta") out.push(x);
          continue;
        }
        if (tk.t === "end") { if (!depth) fail("']' without a '['", tk.at); return out; }
        if (tk.t === "volta" && !depth) fail("':' only works inside [ ... ]", tk.at);
        out.push(tk); i++;
      }
      return out;
    };
    return block(0);
  },
  // Tokens -> note events with every bar checked against the meter.
  walk(toks, ch, info) {
    const W = this.WHOLE, meter = info.meter, bt = meter.barTicks, text = info.text;
    const snip = (a, b) => text.slice(Math.max(0, Math.min(a, b)), Math.max(a, b) + 1).replace(/\s+/g, " ").trim().slice(0, 70);
    const failAt = (m, at) => { throw new Error("[music] " + info.where + ", bar " + barNo + ": " + m + " near '" + snip(Math.max(0, at - 12), at + 12) + "'"); };
    const st = { oct: ch.oct, len: ch.len, vel: ch.vel, q: ch.q, k: 0, inst: ch.inst, port: ch.port, w: 0 };
    let tick = 0, barStart = 0, barNo = 1, barAt = toks.length ? toks[0].at : 0, last = null, slur = false, glide = false;
    const events = [];
    const T = (l, at) => {
      if (l.n == null) { if (l.dots) failAt("a dot needs a length (c4.)", at); return st.len; }
      if (l.n < 1 || W % l.n) failAt("length " + l.n + " is not allowed (use 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64 or 96)", at);
      let d = W / l.n, add = d;
      for (let k = 0; k < l.dots; k++) { add /= 2; d += add; }
      if (d % 1) failAt("too many dots for length " + l.n, at);
      return d;
    };
    const dur = tk => { let d = T(tk.len, tk.at); for (const x of tk.ties || []) d += T(x, tk.at); return d; };
    const units = t => { const u = t / meter.unitTicks; return (Math.round(u * 100) / 100) + " " + meter.unitName; };
    const bar = at => {
      const got = tick - barStart;
      if (got !== bt) throw new Error("[music] " + info.where + ", bar " + barNo + ": has " + units(got) + " but " + meter.text + " needs " + units(bt) + " - '" + snip(barAt, at) + "'");
      barStart = tick; barNo++;
    };
    const velOf = tk => Math.min(1.3, st.vel / 100 * (tk.acc ? 1.25 : 1) * (tk.ghost ? 0.5 : 1));
    const gateOf = (tk, d) => (tk.slur || tk.ten ? d : tk.stac ? Math.max(1, Math.round(d * 0.45)) : Math.max(1, Math.round(d * st.q / 100)));
    const vibOf = tk => {
      if (ch.drums) return null;
      const iv = SYNTH.INST[st.inst].vib || [0, 5.5, 0.25], cv = Array.isArray(ch.vib) ? ch.vib : null;
      const on = tk.vib || st.w > 0 || ch.vib;
      if (!on) return null;
      const depth = st.w > 0 ? st.w : cv ? cv[0] : iv[0] || 12;
      return depth > 0 ? [depth, cv ? cv[1] : iv[1] || 5.5, cv ? cv[2] : iv[2] == null ? 0.25 : iv[2]] : null;
    };
    const pitch = (semi, at) => {
      const m = 12 * (st.oct + 1) + semi + st.k + info.trans + ch.trans;
      if (m < 12 || m > 120) failAt("note is out of range (MIDI " + m + "); check the octave", at);
      const r = SYNTH.INST[st.inst].range;
      if (r && (m < r[0] - 3 || m > r[1] + 3) && info.warnings.length < 40) info.warnings.push(info.where + ", bar " + barNo + ": MIDI " + m + " is outside " + st.inst + "'s range " + r[0] + ".." + r[1]);
      return m;
    };
    for (const tk of toks) {
      switch (tk.t) {
        case "bar": if (tick !== barStart) bar(tk.at); barAt = tk.at + 1; break;
        case "note": {
          if (ch.drums) failAt("notes need a pitched instrument; this channel is a drum kit (use letters like K S H)", tk.at);
          const d = dur(tk), midi = pitch(tk.semi, tk.at);
          if (slur || glide) {
            if (!last || last.tick + last.dur !== tick) failAt(slur ? "'&' must be followed directly by a note" : "'/' (glide) needs a note right before it", tk.at);
            const rel = tick - last.tick;
            if (midi !== last.cur || glide) last.bends.push({ at: rel, midi, glide: glide ? st.port : 0 });
            last.cur = midi; last.dur += d; last.gate = rel + gateOf(tk, d); last.stac = !!tk.stac;
            if (tk.fall) last.fall = tk.fall;
            if (tk.vib && !last.vib) last.vib = vibOf(tk);
          } else {
            last = { tick, dur: d, gate: gateOf(tk, d), midi, cur: midi, vel: velOf(tk), inst: st.inst, drum: null, bends: [], vib: vibOf(tk), fall: tk.fall || 0, stac: !!tk.stac, ch: ch.index };
            events.push(last);
          }
          slur = !!tk.slur; glide = false; tick += d;
          break;
        }
        case "drum": case "chord": {
          if (slur || glide || tk.slur) failAt("'&' and '/' work on single notes only", tk.at);
          const d = dur(tk), vel = velOf(tk), notes = tk.t === "drum" ? [{ key: tk.key }] : tk.notes;
          for (const n of notes) {
            if (n.key) {
              if (!ch.drums) failAt("'" + n.key + "' is a drum letter, but this channel plays " + st.inst + " (drum letters need inst: \"kit\")", tk.at);
              const nm = ch.kit[n.key];
              if (!nm || !SYNTH.INST[nm]) failAt("no drum for letter '" + n.key + "' (kit: " + Object.keys(ch.kit).map(k => k + "=" + ch.kit[k]).join(" ") + ")", tk.at);
              events.push({ tick, dur: d, gate: d, midi: null, drum: nm, inst: nm, vel, bends: [], vib: null, fall: 0, stac: false, ch: ch.index });
            } else {
              if (ch.drums) failAt("notes need a pitched instrument; this channel is a drum kit", tk.at);
              events.push({ tick, dur: d, gate: gateOf(tk, d), midi: pitch(n.semi, tk.at), drum: null, inst: st.inst, vel, bends: [], vib: vibOf(tk), fall: tk.fall || 0, stac: !!tk.stac, ch: ch.index });
            }
          }
          last = null; tick += d;
          break;
        }
        case "rest": if (slur) failAt("'&' cannot tie into a rest", tk.at); tick += dur(tk); last = null; glide = false; break;
        case "zbar":
          if (tick !== barStart) failAt("'z' (whole-bar rest) must start a bar", tk.at);
          if (slur) failAt("'&' cannot tie into a rest", tk.at);
          tick += tk.n * bt; barStart = tick; barNo += tk.n; last = null; barAt = tk.at + 1;
          break;
        case "glide": glide = true; break;
        case "o": if (tk.v > 8) failAt("octave must be 0..8", tk.at); st.oct = tk.v; break;
        case "o+": st.oct++; break;
        case "o-": st.oct--; break;
        case "l": st.len = T(tk.len, tk.at); break;
        case "v": st.vel = Math.max(0, Math.min(100, tk.rel ? st.vel + tk.v : tk.v)); break;
        case "q": if (tk.v < 1 || tk.v > 100) failAt("gate must be 1..100", tk.at); st.q = tk.v; break;
        case "k": if (Math.abs(tk.v) > 48) failAt("transpose must be -48..48", tk.at); st.k = tk.v; break;
        case "p": st.port = tk.v / 1000; break;
        case "w": st.w = tk.v; break;
        case "inst":
          if (ch.drums) failAt("a drum-kit channel cannot switch instrument", tk.at);
          if (!SYNTH.INST[tk.name]) failAt("unknown instrument '" + tk.name + "'", tk.at);
          st.inst = tk.name;
          break;
      }
    }
    if (slur) failAt("'&' at the end has no next note to tie to", toks.length ? toks[toks.length - 1].at : 0);
    if (tick !== barStart) bar(text.length - 1);
    return { events, ticks: tick };
  },
};

// ============================================================
// Sound: mixer, scheduler, music memory, stingers and effects
// ============================================================
const Sound = {
  ctx: null, offline: false, G: null,
  muted: false,
  trackName: null, track: null,   // current music: name and TRACKS entry
  song: null,                     // the playing song instance
  songs: [],                      // every song instance still sounding (fading ones included)
  stingerSong: null, stingerResume: null,
  memory: {},                     // CR-M1: name -> {pass, tick, passBar, at} where it stopped
  layerState: {},                 // layer name -> on/off (see setLayer)
  mvoices: [], svoices: [],       // music and effect voices still sounding
  ducks: [], loops: {}, fxCache: {}, fxQueue: [], fxLast: {}, fxLastVar: {}, warned: {},
  room: { echo: 1, verb: 1 },     // effect send factors (SFX-E5 area factor)
  stepDelay: 0,                   // CR-X3: seconds added to effect start times (catch-up steps)
  fieldW: 256,                    // logical playfield width used to pan effects from opts.x
  solo: null, log: null,          // test hooks: channel names to hear alone / array of scheduled notes
  LOOKAHEAD: 0.5, MUSIC_VOICES: 48, SFX_VOICES: 24,
  SOON: 0.8,                      // unlock/music build now the samples needed within this many seconds
  BUILD_MS: 4,                    // background building per update() call (ms; one 60 Hz frame is 16.7)
  renderLive: false,              // AudioLab sets true when update() runs while an offline context renders
  resetHooks: [], fxJob: null,
  MUSIC_VOL: 0.73,                // music level into the master (measured: _test gives -20 LUFS)
  MUSIC_HP: 38,                   // Hz: high-pass on the music and stinger buses (review r1 S4)
  NOTE_GAIN: 0.9,                 // instrument notes played as effects (Sound.note)
  COMP_TRIM: 0.686,               // cancels the music compressor's automatic make-up gain (+3.3 dB, measured)
  LIM_TRIM: 0.877,                // cancels the limiter's automatic make-up gain (-1.14 dB)
  stats: { unlockMs: 0, sampleBytes: 0, resyncs: 0, voicesPeak: 0, stolen: 0 },

  // ----- start-up -----
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === "suspended" && !this.offline && !(typeof document !== "undefined" && document.hidden)) this.ctx.resume();
      return;
    }
    if (!(window.AudioContext || window.webkitAudioContext)) return;
    const tU = performance.now(), b0 = SYNTH.buildMs;
    let ctx;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    this.ctx = ctx;
    this.offline = typeof ctx.startRendering === "function";
    this._resetState();
    // Samples: offline renders build everything now; the live game builds (in music() below)
    // only what the waiting track needs in its first SOON seconds and renders the rest in
    // slices from update(): that track's other samples first, then every other instrument.
    if (this.offline) SYNTH.buildAll();
    else for (const n of SYNTH.names()) SYNTH.INST[n].roots.forEach((r, i) => { if (!SYNTH.has(n, i)) this.instQueue.push([n, i]); });
    this.stats.sampleBytes = SYNTH.bytes;
    const pending = this.trackName;
    this._graph(ctx, !!pending);        // a waiting track sets its own reverb at once (no default room first)
    if (!this.offline) {
      // a coarse timer keeps music scheduled if the game loop stalls; never used to time sounds
      if (!this.timer) this.timer = setInterval(() => this.update(), 40);
      if (!this.visHooked && typeof document !== "undefined") {
        this.visHooked = true;
        document.addEventListener("visibilitychange", () => {
          if (!this.ctx || this.offline) return;
          if (document.hidden) this.ctx.suspend(); else this.ctx.resume();
        });
      }
      for (const n in SFX) for (let v = 0; v < ((SFX[n] && SFX[n].variants) || 1); v++) this.fxQueue.push([n, v]);
    }
    if (pending) { this.trackName = null; this.music(pending); }
    this.stats.unlockBuildMs = Math.round((SYNTH.buildMs - b0) * 10) / 10;
    this.stats.unlockMs = Math.round((performance.now() - tU) * 10) / 10;
    this.stats.sampleBytes = SYNTH.bytes;
  },
  _resetState() {
    this.song = null; this.songs = []; this.stingerSong = null; this.stingerResume = null;
    this.memory = {}; this.mvoices = []; this.svoices = []; this.ducks = []; this.loops = {}; this.fxLast = {}; this.fxLastVar = {};
    this.fxQueue = []; this.instQueue = []; this.fxJob = null; this.irCache = {}; this.fxRnd = SYNTH.rng(24681357); this.nextId = 1; this.pruneT = 0;
    this.stats.resyncs = 0; this.stats.voicesPeak = 0; this.stats.stolen = 0;
    this.stats.bgCalls = 0; this.stats.bgMs = 0; this.stats.sliceMsMax = 0; this.stats.unplugged = 0;
  },
  // Test hook (AudioLab): forget everything that depends on earlier runs, here and in every
  // file that registered a reset with onReset(fn).
  resetForTest() {
    this._resetState(); this.layerState = {}; this.solo = null; this.log = null; this.stepDelay = 0; this.renderLive = false;
    for (const f of this.resetHooks) { try { f(); } catch (e) { console.error("Sound.resetForTest hook: " + e.message); } }
  },
  onReset(fn) { if (typeof fn === "function" && this.resetHooks.indexOf(fn) < 0) this.resetHooks.push(fn); },

  gain(v, to) { const g = this.ctx.createGain(); g.gain.value = v; if (to) g.connect(to); return g; },
  panner(p, to) {
    let n;
    if (this.ctx.createStereoPanner) { n = this.ctx.createStereoPanner(); n.pan.value = p; } else n = this.ctx.createGain();
    if (to) n.connect(to);
    return n;
  },
  // Soft ceiling after the limiter: straight up to -2.5 dBFS, then bends smoothly to -1 dBFS.
  // The curve's input is the signal x 0.5, so it covers +/-2 before it would flatten.
  _curve() {
    const n = 8193, c = new Float32Array(n), K = 0.75, C = 0.891;
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1) * 2 - 1) * 2, a = Math.abs(x);
      c[i] = Math.sign(x) * (a <= K ? a : K + (C - K) * Math.tanh((a - K) / (C - K)));
    }
    return c;
  },
  _graph(ctx, noVerb) {
    const G = this.G = {}, g = (v, to) => this.gain(v, to);
    G.shaper = ctx.createWaveShaper(); G.shaper.curve = this._curve(); G.shaper.connect(ctx.destination);
    G.pre = g(0.5, G.shaper);
    G.limTrim = g(this.LIM_TRIM, G.pre);
    G.lim = ctx.createDynamicsCompressor();
    G.lim.threshold.value = -2; G.lim.knee.value = 0; G.lim.ratio.value = 20; G.lim.attack.value = 0.001; G.lim.release.value = 0.08;
    G.lim.connect(G.limTrim);
    G.master = g(this.muted ? 0 : 1, G.lim);
    // music: songs -> glue compressor -> duck -> make-up cancel -> music volume -> master
    // (the duck sits after the compressor so the compressor cannot undo it; stingers skip both)
    G.musicVol = g(this.MUSIC_VOL, G.master);
    G.compTrim = g(this.COMP_TRIM, G.musicVol);
    G.duckDry = g(1, G.compTrim);
    G.comp = ctx.createDynamicsCompressor();
    G.comp.threshold.value = -16; G.comp.knee.value = 10; G.comp.ratio.value = 2; G.comp.attack.value = 0.015; G.comp.release.value = 0.3;
    G.comp.connect(G.duckDry);
    // rumble filter (review r1 S4): a 38 Hz Butterworth high-pass (12 dB/oct) in front of the
    // compressor, so sub-bass under ~40 Hz neither booms on headphones nor pumps the compressor.
    // An IIRFilterNode (double precision), not a BiquadFilterNode: measured, the biquad made two
    // offline renders of the same track differ by up to -74 dB (the check wants under -100 dB);
    // the IIR filter keeps them within -126 dB, as without a filter.
    const hp = () => {
      const w0 = 2 * Math.PI * this.MUSIC_HP / ctx.sampleRate, al = Math.sin(w0) / (2 * Math.SQRT1_2), cs = Math.cos(w0);
      if (ctx.createIIRFilter) return ctx.createIIRFilter([(1 + cs) / 2, -(1 + cs), (1 + cs) / 2], [1 + al, -2 * cs, 1 - al]);
      const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = this.MUSIC_HP; f.Q.value = -3.01; return f;   // Q in dB here: -3.01 dB = 0.707 (Butterworth)
    };
    G.mHP = hp(); G.mHP.connect(G.comp);
    G.musicIn = g(1, G.mHP);
    G.sHP = hp(); G.sHP.connect(G.musicVol);
    G.stingBus = g(1, G.sHP);
    // shared echo: delay -> low-pass -> high-pass -> feedback (repeats get darker), out to master
    G.echoIn = g(1);
    G.delay = ctx.createDelay(1.0); G.delay.delayTime.value = 0.18;
    G.eLP = ctx.createBiquadFilter(); G.eLP.type = "lowpass"; G.eLP.frequency.value = 3000; G.eLP.Q.value = 0.5;
    G.eHP = ctx.createBiquadFilter(); G.eHP.type = "highpass"; G.eHP.frequency.value = 250; G.eHP.Q.value = 0.5;
    G.eFB = g(0.3);
    G.echoIn.connect(G.delay); G.delay.connect(G.eLP); G.eLP.connect(G.eHP); G.eHP.connect(G.eFB); G.eFB.connect(G.delay);
    G.eRet = g(0.3, G.master); G.eHP.connect(G.eRet);
    // shared reverb: two convolvers so a room change can cross-fade
    G.verbIn = g(1);
    G.vRet = g(0.25, G.master);
    G.cv = [0, 1].map(() => { const c = ctx.createConvolver(), i = g(0), o = g(0, G.vRet); G.verbIn.connect(i); i.connect(c); c.connect(o); return { c, i, o, key: null }; });
    G.cvOn = 0;
    G.duckE = g(1, G.echoIn); G.duckV = g(1, G.verbIn);
    // effects
    G.sfxBus = g(1, G.master); G.uiBus = g(1, G.master);
    if (!noVerb) this._verb({ sec: 1.2, mix: 0.25, lp: 6000, pre: 0.015 }, 0);
  },
  // Generated room: decorrelated seeded noise per side, exponential decay, darker with time.
  _ir(sec, lp, pre) {
    const key = sec + "|" + lp + "|" + pre;
    if (this.irCache[key]) return this.irCache[key];
    const sr = this.ctx.sampleRate, P = Math.round(pre * sr), n = P + Math.round(sec * 1.15 * sr), buf = this.ctx.createBuffer(2, n, sr);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c), seed = 9001 + c * 131 + Math.round(sec * 100), hpA = Math.exp(-2 * Math.PI * 160 / sr);
      const dk = Math.exp(-6.91 / (sec * sr)), fade = 0.008 * sr;
      // the same xorshift numbers as SYNTH.rng(seed), written out in the loop (it runs ~250 000
      // times at start-up, so the call per sample was most of the reverb's build time)
      let s = (seed >>> 0) || 0x9e3779b9, lpS = 0, hpX = 0, hpY = 0, a = 0, e = 1;
      for (let i = P; i < n; i++) {
        const k = i - P;
        if ((k & 63) === 0) a = 1 - Math.exp(-2 * Math.PI * Math.max(1200, lp * Math.exp(-k / sr * 1.6 / sec)) / sr);
        s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0;
        lpS += a * (s / 2147483648 - 1 - lpS);
        hpY = hpA * (hpY + lpS - hpX); hpX = lpS;
        d[i] = hpY * e * (k < fade ? k / fade : 1);
        e *= dk;
      }
      let q = s;                                  // (a copy, so the loop's s stays a plain local)
      const r = () => { q ^= q << 13; q >>>= 0; q ^= q >>> 17; q ^= q << 5; q >>>= 0; return q / 4294967296; };   // same sequence, going on
      for (let k = 0; k < 6; k++) { const at = P + Math.round((0.004 + r() * 0.03) * sr); if (at < n) d[at] += (r() < 0.5 ? -1 : 1) * (0.25 + 0.3 * r()); }
    }
    this.irCache[key] = buf;
    return buf;
  },
  _verb(v, t) {
    const G = this.G, key = v.sec + "|" + v.lp + "|" + v.pre, on = G.cv[G.cvOn];
    G.vRet.gain.setTargetAtTime(v.mix, t, 0.05);
    if (on.key === key) return;
    let nx = on.key == null ? on : G.cv[1 - G.cvOn];
    if (this.offline && nx !== on) {
      const c = this.ctx.createConvolver(), i = this.gain(0), o = this.gain(0, G.vRet);
      G.verbIn.connect(i); i.connect(c); c.connect(o);
      nx = G.cv[1 - G.cvOn] = { c, i, o, key: null };
    }
    nx.c.buffer = this._ir(v.sec, v.lp, v.pre); nx.key = key;
    nx.i.gain.setValueAtTime(1, t); nx.o.gain.setValueAtTime(1, t);
    if (nx !== on) { on.i.gain.setValueAtTime(0, t); on.o.gain.setTargetAtTime(0, t + 0.2, 0.6); G.cvOn = 1 - G.cvOn; }
  },
  _echo(e, t) {
    const G = this.G;
    G.delay.delayTime.setTargetAtTime(e.sec, t, 0.03);
    G.eFB.gain.setTargetAtTime(e.fb, t, 0.03);
    G.eLP.frequency.setTargetAtTime(e.lp, t, 0.03);
    G.eHP.frequency.setTargetAtTime(e.hp, t, 0.03);
    G.eRet.gain.setTargetAtTime(e.mix, t, 0.03);
  },

  toggleMute() {
    this.muted = !this.muted;
    if (!this.G) return;
    const p = this.G.master.gain, now = this.ctx.currentTime;
    p.cancelScheduledValues(now); p.setValueAtTime(this.muted ? 1 : 0, now); p.linearRampToValueAtTime(this.muted ? 0 : 1, now + 0.03);
  },
  // Optional level controls (0..1) for an options menu.
  setVolume(music, sfx) {
    if (!this.G) return;
    const now = this.ctx.currentTime;
    if (music != null) this.G.musicVol.gain.setTargetAtTime(this.MUSIC_VOL * music, now, 0.03);
    if (sfx != null) { this.G.sfxBus.gain.setTargetAtTime(sfx, now, 0.03); this.G.uiBus.gain.setTargetAtTime(sfx, now, 0.03); }
  },

  // ----- music -----
  music(name, force) {
    if (name === undefined || name === "") name = null;
    if (this.trackName === name && !force) return;
    let c = null;
    if (name) {
      try { c = SONG.get(name); } catch (e) { if (!this.warned["c:" + name]) { this.warned["c:" + name] = 1; console.error(e.message); } }
      if (!c && !TRACKS[name] && !this.warned[name]) { this.warned[name] = 1; console.warn("Sound.music: no track named '" + name + "'"); }
    }
    this.trackName = name;
    this.track = name ? TRACKS[name] || null : null;
    if (!this.ctx) return;             // unlock() starts it
    const now = this.ctx.currentTime, old = this.song;
    let startT = now + 0.03;
    this.stingerResume = null;
    if (old && !old.stopping) {
      const fade = c && c.instant ? 0.12 : old.c.fadeOut;
      this._stopSong(old, now, fade, true);
      if (!(c && c.instant)) startT = now + Math.min(0.45, fade * 0.8);
    }
    this.song = null;
    if (!c) return;
    if (name === "title" || name === "gameover" || c.clearMemory) this.memory = {};
    let pass = c.intro.ticks ? 0 : 1, tick = 0, passBar = 0, fadeIn = c.fadeIn, fresh = true;
    const mem = this.memory[name];
    if (!force && mem && c.memory && c.loop.ticks) {
      if (now - mem.at < 120) {                   // came back soon: go on from the next bar
        pass = mem.pass; passBar = mem.passBar;
        tick = Math.ceil(mem.tick / c.barTicks - 1e-6) * c.barTicks;
        if (tick >= (pass === 0 ? c.intro.ticks : c.loop.ticks)) { passBar += (pass === 0 ? c.intro.bars : c.loop.bars); pass = 1; tick = 0; }
        fadeIn = Math.max(fadeIn, 0.3); fresh = false;
      } else pass = 1;                            // long ago: start at the loop (skip the intro)
    }
    delete this.memory[name];
    this._ensureTrack(name, pass, tick);
    if (fresh) for (const k in c.layerDefaults) this.layerState[k] = !!c.layerDefaults[k];
    this._echo(c.echo, startT);
    this._verb(c.verb, startT);
    this.song = this._start(name, c, { t: startT, pass, tick, passBar, fadeIn, catchNotes: !fresh });
  },
  stopMusic(fade) {
    this.trackName = null; this.track = null;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.song && !this.song.stopping) this._stopSong(this.song, now, fade == null ? 0.5 : fade, true);
    this.song = null; this.stingerResume = null;
  },
  // The samples a track uses. Offline: all of them now. Live: only the root samples its first
  // SOON seconds need (from pass/tick on) are built now; the others go to the front of the
  // background queue in the order the song needs them (update() builds ~4 ms of them per call,
  // far ahead of the 0.5 s look-ahead; a note whose sample is still missing builds just that
  // one root when it is scheduled).
  _ensureTrack(name, pass, tick) {
    let c = null;
    try { c = name ? SONG.get(name) : null; } catch (e) { return; }
    if (!c) return;
    if (this.offline) { for (const n of c.insts) SYNTH.ensure(n); return; }
    const need = this._rootsByTime(c, pass || 0, tick || 0), later = [];
    for (const it of need) {
      if (SYNTH.has(it[0], it[1])) continue;
      if (it[2] < this.SOON) SYNTH.buildRoot(it[0], it[1]); else later.push([it[0], it[1]]);
    }
    if (!later.length) return;
    const k = q => q[0] + "#" + q[1], first = {};
    for (const q of later) first[k(q)] = 1;
    this.instQueue = later.concat(this.instQueue.filter(q => !first[k(q)]));
  },
  // [instrument, root index, first use in seconds from (pass, tick)] for every sample a track
  // plays, earliest first (the loop counts as coming round again after the end of the pass).
  _rootsByTime(c, pass, tick) {
    const seen = {}, out = [], add = (ev, t) => {
      const n = ev.drum || ev.inst, i = ev.drum ? 0 : SYNTH.rootIndex(n, ev.midi), key = n + "#" + i;
      if (seen[key]) return;
      seen[key] = 1; out.push([n, i, t]);
    };
    const P = pass === 0 ? c.intro : c.loop;
    for (const ev of P.events) if (ev.tick >= tick - 1e-6) add(ev, (ev.tick - tick) * c.spt);
    const off = (P.ticks - tick) * c.spt;
    for (const ev of c.loop.events) add(ev, off + ev.tick * c.spt);
    return out;
  },
  _start(name, c, o) {
    const ctx = this.ctx;
    const song = { name, c, pass: 0, idx: 0, passT0: 0, passBar: 0, prevAnchor: null, schedT: o.t, t0: o.t, ltl: {}, chans: [], nodes: [],
      stopping: false, paused: false, done: false, stinger: !!o.stinger, once: !!o.once, lv: { t0: 0, v0: 0, t1: 0, v1: 0 } };
    const G = this.G;
    song.out = [this.gain(0, o.stinger ? G.stingBus : G.musicIn), this.gain(0, o.stinger ? G.echoIn : G.duckE), this.gain(0, o.stinger ? G.verbIn : G.duckV)];
    this._level(song, o.t, 1, Math.max(0.004, o.fadeIn || 0));
    const tg = SYNTH.db(c.gain);
    for (const ch of c.chans) {
      const inp = this.gain(ch.vol * tg), pan = this.panner(ch.pan, song.out[0]);
      if (ch.trem) {
        const d = Math.max(0, Math.min(1, ch.trem[0])), lfo = ctx.createOscillator(), lg = this.gain(d / 2);
        inp.gain.value = ch.vol * tg * (1 - d / 2); lfo.frequency.value = ch.trem[1];
        lfo.connect(lg); lg.connect(inp.gain); lfo.start(o.t); song.nodes.push(lfo);
      }
      inp.connect(pan);
      if (ch.echo > 0) pan.connect(this.gain(ch.echo, song.out[1]));
      if (ch.verb > 0) pan.connect(this.gain(ch.verb, song.out[2]));
      song.chans.push({ in: inp, pan });
      song.nodes.push(inp, pan);
    }
    for (const l of c.layers) {
      const st = this.layerState[l];
      song.ltl[l] = [[0, st != null ? st : (l in c.layerDefaults ? !!c.layerDefaults[l] : true)]];
    }
    this._seek(song, o.pass, o.tick, o.t, o.catchNotes, o.passBar || 0);
    this.songs.push(song);
    return song;
  },
  // Fade a song out; remember where it was (music memory) unless it is a stinger.
  _stopSong(song, now, fade, remember) {
    if (remember && song.c.memory && !song.done) {
      const p = this._posAt(song, now);
      if (p) this.memory[song.name] = { pass: p.pass, tick: p.tick, passBar: p.passBar, at: now };
    }
    song.stopping = true; song.stopT = now + fade;
    this._level(song, now, 0, fade);
    for (const v of this.mvoices) if (v.song === song && v.end > song.stopT) this._cut(v, Math.max(song.stopT, v.t), 0.01);
  },
  _level(song, t, v, dur) {
    const lv = song.lv, cur = t <= lv.t0 ? lv.v0 : t >= lv.t1 ? lv.v1 : lv.v0 + (lv.v1 - lv.v0) * (t - lv.t0) / (lv.t1 - lv.t0);
    const d = Math.max(0.003, dur);
    for (const g of song.out) { const p = g.gain; p.cancelScheduledValues(t); p.setValueAtTime(cur, t); p.linearRampToValueAtTime(v, t + d); }
    song.lv = { t0: t, v0: cur, t1: t + d, v1: v };
  },
  // Where a song is (pass 0 = intro, 1 = loop; tick in that pass) at audio time T.
  _posAt(song, T) {
    if (song.paused) return song.pausePos;
    const c = song.c;
    let a = { pass: song.pass, t0: song.passT0, bar: song.passBar };
    if (T < song.passT0 && song.prevAnchor) a = song.prevAnchor;
    const P = a.pass === 0 ? c.intro : c.loop;
    if (!P.ticks) return null;
    return { pass: a.pass, tick: Math.max(0, Math.min(P.ticks - 1, (T - a.t0) / c.spt)), passBar: a.bar };
  },
  // Put the play position at (pass, tick) sounding at time t. catchNotes: also start the held
  // notes (sustained instruments) that began before this point and are still going.
  _seek(song, pass, tick, t, catchNotes, passBar) {
    const c = song.c, P = pass === 0 ? c.intro : c.loop;
    song.pass = pass; song.passBar = passBar; song.prevAnchor = null;
    let i = 0;
    while (i < P.events.length && P.events[i].tick < tick - 1e-6) i++;
    song.idx = i; song.passT0 = t - tick * c.spt; song.schedT = t;
    if (!catchNotes) return;
    const abar = passBar + Math.floor(tick / c.barTicks);
    for (let j = 0; j < i; j++) {
      const ev = P.events[j];
      if (ev.drum || ev.bends.length || SYNTH.INST[ev.inst].kind !== "sus") continue;
      if (ev.tick + ev.gate - tick < 24) continue;
      if (!this._layerOn(song, c.chans[ev.ch].layer, abar)) continue;
      this._play(song, Object.assign({}, ev, { tick, gate: ev.tick + ev.gate - tick }), this._tq(t));
    }
  },
  _tq(t) { const sr = this.ctx.sampleRate; return Math.round(t * sr) / sr; },
  _tickTime(c, tick) {
    let t = tick * c.spt;
    if (c.swing && tick % (2 * c.swingUnit) === c.swingUnit) t += c.swing * c.swingUnit * c.spt;
    return t;
  },
  _layerOn(song, layer, abar) {
    if (!layer) return true;
    const tl = song.ltl[layer];
    let on = true;
    if (tl) for (const e of tl) if (e[0] <= abar) on = e[1];
    return on;
  },
  // The next event to schedule (moving on to the loop when a pass ends); null = song over.
  _peek(song) {
    const c = song.c;
    for (let k = 0; k < 3; k++) {
      const P = song.pass === 0 ? c.intro : c.loop;
      if (song.idx < P.events.length) {
        const ev = P.events[song.idx];
        return { ev, t: this._tq(song.passT0 + this._tickTime(c, ev.tick)), abar: song.passBar + Math.floor(ev.tick / c.barTicks) };
      }
      if (!c.loop.ticks || !c.loop.events.length || (song.once && song.pass === 1)) {
        if (!song.done) { song.done = true; song.endT = song.passT0 + P.ticks * c.spt; }
        return null;
      }
      song.prevAnchor = { pass: song.pass, t0: song.passT0, bar: song.passBar };
      song.passT0 += P.ticks * c.spt; song.passBar += P.bars; song.pass = 1; song.idx = 0;
    }
    return null;
  },
  _schedule(song, now) {
    const c = song.c, horizon = now + this.LOOKAHEAD;
    for (let guard = 0; guard < 5000; guard++) {
      const nx = this._peek(song);
      if (!nx || nx.t >= horizon) break;
      if (nx.t < now - 0.03) { this._resync(song, now); continue; }   // fell behind: no burst
      song.idx++;
      const ch = c.chans[nx.ev.ch];
      if (!this._layerOn(song, ch.layer, nx.abar)) continue;
      if (this.solo && this.solo.indexOf(ch.name) < 0) continue;
      this._play(song, nx.ev, nx.t);
    }
    song.schedT = Math.max(song.schedT, horizon);
  },
  // After a stall longer than the look-ahead: skip to the next beat, a moment from now.
  _resync(song, now) {
    const c = song.c, P = song.pass === 0 ? c.intro : c.loop, ev = P.events[song.idx];
    if (!ev) return;
    const bs = Math.floor(ev.tick / c.barTicks) * c.barTicks;
    let b = bs + c.barTicks;
    for (const bt of c.beats) if (bs + bt >= ev.tick) { b = bs + bt; break; }
    while (song.idx < P.events.length && P.events[song.idx].tick < b) song.idx++;
    song.passT0 = now + 0.08 - b * c.spt; song.prevAnchor = null;
    this.stats.resyncs++;
  },
  _play(song, ev, t) {
    const c = song.c, ch = c.chans[ev.ch], sch = song.chans[ev.ch];
    if (this.log) this.log.push({ t, ch: ch.name, midi: ev.midi, drum: ev.drum, inst: ev.inst, vel: ev.vel, gate: ev.gate * c.spt, song: song.name });
    const idef = SYNTH.INST[ev.inst];
    let v;
    if (ev.drum) {
      const s = SYNTH.pick(ev.drum, idef.roots[0]);
      if (idef.choke) for (const o of this.mvoices) if (o.song === song && o.ch === ev.ch && o.choke === idef.choke && o.end > t && o.t < t) this._cut(o, t, 0.004);
      v = this._voice({ smp: s, rate: 1, t, gate: s.len / s.sr, vel: ev.vel, gain: idef.gain, env: [0.0005, 0, 1, 0.05], dest: sch.in, oneShot: true });
      v.choke = idef.choke;
    } else {
      const s = SYNTH.pick(ev.inst, ev.midi);
      v = this._voice({ smp: s, midi: ev.midi, t, gate: ev.gate * c.spt, vel: ev.vel, gain: idef.gain, env: ch.env || idef.env, lp: ch.lp || idef.lp,
        ring: ch.ring != null ? ch.ring : idef.ring, vib: ev.vib, fall: ev.fall, stac: ev.stac, dest: sch.in,
        bends: ev.bends.length ? ev.bends.map(b => ({ t: b.at * c.spt, midi: b.midi, glide: b.glide })) : null });
    }
    v.song = song; v.ch = ev.ch; v.layer = ch.layer;
    // channel polyphony and the global music voice cap: the oldest voice gives way
    let same = 0, all = 0, oldS = null, oldA = null;
    for (const o of this.mvoices) {
      if (o.end <= t || o.t > t || o.cutAt != null) continue;
      all++; if (!oldA || o.t < oldA.t) oldA = o;
      if (o.song === song && o.ch === ev.ch) { same++; if (!oldS || o.t < oldS.t) oldS = o; }
    }
    if (same >= ch.poly && oldS) { this._cut(oldS, t, 0.012); this.stats.stolen++; }
    else if (all >= this.MUSIC_VOICES && oldA) { this._cut(oldA, t, 0.012); this.stats.stolen++; }
    this.mvoices.push(v);
    this.stats.voicesPeak = Math.max(this.stats.voicesPeak, all + 1);
  },
  // One sample voice: source (pitch, loop, bends, fall, vibrato) -> [low-pass] -> envelope -> dest.
  _voice(o) {
    const ctx = this.ctx, s = o.smp, t = o.t, env = o.env || [0.002, 0, 1, 0.1], sus = s.loop;
    const rate0 = o.midi != null ? midiHz(o.midi) / s.hz : (o.rate || 1);
    const src = ctx.createBufferSource();
    src.buffer = s.buf;
    if (sus) { src.loop = true; src.loopStart = s.ls; src.loopEnd = s.le; }
    const pr = src.playbackRate;
    pr.setValueAtTime(rate0, t);
    let rate = rate0;
    if (o.bends) for (const b of o.bends) {
      const r2 = midiHz(b.midi) / s.hz;
      if (b.glide > 0) { pr.setValueAtTime(rate, t + b.t); pr.exponentialRampToValueAtTime(r2, t + b.t + b.glide); }
      else pr.setValueAtTime(r2, t + b.t);
      rate = r2;
    }
    const gate = Math.max(0.01, o.gate), a = Math.min(Math.max(0.0005, env[0]), gate * 0.5);
    let rel = Math.max(0.01, env[3]);
    let gateEnd;
    if (sus) gateEnd = t + gate;
    else {
      gateEnd = t + (o.stac ? gate : Math.max(gate, o.ring || 0));
      if (o.stac) rel = Math.min(rel, 0.08);
    }
    let stopAt = gateEnd + rel * 1.5 + 0.01;
    if (!sus) stopAt = Math.min(stopAt, t + s.len / s.sr / Math.min(rate0, rate) + 0.01);
    if (o.fall && !o.bends) {
      const f0 = t + Math.max(0.02, gate * 0.6);
      pr.setValueAtTime(rate, f0); pr.exponentialRampToValueAtTime(rate * Math.pow(2, -o.fall / 12), Math.max(f0 + 0.03, gateEnd));
    }
    const g = ctx.createGain(), pk = Math.pow(Math.max(0, o.vel), 1.5) * SYNTH.db(o.gain || 0);
    const p = g.gain;
    // review r1 S11: start the envelope gain at 0, not the node's default 1. When a note time
    // falls a hair before a sample frame, Chrome lets the source play its first (interpolated)
    // frame before the setValueAtTime(0, t) event, and that one frame went out at full gain:
    // one-sample clicks of up to 0.6 (finale choir chords at 33.4 s, 38.4 s and 66.7 s).
    p.value = 0;
    p.setValueAtTime(0, t);
    p.linearRampToValueAtTime(pk, t + a);
    const em = { t, a, pk, s: sus && env[2] < 1 ? pk * env[2] : pk, td: Math.max(0.005, env[1] / 3), tg: gateEnd < stopAt ? Math.max(t + a + 0.001, gateEnd) : Infinity, tr: Math.max(0.003, rel / 4.6) };
    if (em.s !== pk) p.setTargetAtTime(em.s, t + a, em.td);
    if (em.tg < Infinity) p.setTargetAtTime(0, em.tg, em.tr);
    let lfo = null, f = null;
    if (o.vib && src.detune && gate > o.vib[2] + 0.08) {
      lfo = ctx.createOscillator();
      const dg = ctx.createGain();
      dg.gain.value = 0;                    // (same reason as the envelope gain above)
      lfo.frequency.value = o.vib[1];
      dg.gain.setValueAtTime(0, t); dg.gain.setValueAtTime(0, t + o.vib[2]); dg.gain.linearRampToValueAtTime(o.vib[0], t + o.vib[2] + 0.25);
      lfo.connect(dg); dg.connect(src.detune);
      lfo.start(t); lfo.stop(stopAt);
    }
    let head = src;
    if (o.lp) {
      f = ctx.createBiquadFilter();
      f.type = "lowpass"; f.Q.value = 0.5;
      f.frequency.value = Math.min(16000, o.lp[0] * Math.pow(2, o.lp[1] * Math.min(1, o.vel)));
      src.connect(f); head = f;
    }
    head.connect(g); g.connect(o.dest);
    src.start(t); src.stop(stopAt);
    return { src, g, f, lfo, t, end: stopAt, cutAt: null, em };
  },
  // The envelope value of a voice at time T, from the numbers its automation was built with.
  _envAt(em, T) {
    if (T <= em.t) return 0;
    if (T < em.t + em.a) return em.pk * (T - em.t) / em.a;
    const at = u => em.s + (em.pk - em.s) * Math.exp(-(u - em.t - em.a) / em.td);
    if (T < em.tg) return at(T);
    return at(em.tg) * Math.exp(-(T - em.tg) / em.tr);
  },
  // Fade a voice out from time t (stealing, chokes, layer cuts, pauses). The value at t is
  // computed from the envelope numbers rather than read back, so offline renders repeat exactly.
  _cut(v, t, tau) {
    if (v.cutAt != null && v.cutAt <= t) return;
    v.cutAt = t;
    tau = tau || 0.006;
    const end = t + tau * 7, p = v.g.gain;
    if (t <= v.t) { try { v.src.stop(t); } catch (e) { /* fine */ } v.end = Math.min(v.end, t); return; }   // never started
    if (v.em && t >= v.em.t + v.em.a) { p.cancelScheduledValues(t); p.setValueAtTime(this._envAt(v.em, t), t); }
    else if (v.em) { if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(t); else p.cancelScheduledValues(t); }
    else { p.cancelScheduledValues(t); p.setValueAtTime(v.gv == null ? p.value : v.gv, t); }
    p.setTargetAtTime(0, t, tau);
    try { v.src.stop(end); } catch (e) { /* already stopped */ }
    v.end = Math.min(v.end, end);
  },

  // ----- per-frame work (the game calls this every frame) -----
  update() {
    const ctx = this.ctx;
    if (!ctx || !this.G) return;
    if (!this.offline && ctx.state !== "running") return;
    const now = ctx.currentTime;
    if (now >= this.pruneT) {
      this.pruneT = now + 0.25;
      // Voices that ended more than 50 ms ago leave the lists and are unplugged from the graph,
      // so the audio thread never keeps processing old notes. (An offline render that builds the
      // whole graph before playing it must keep them; AudioLab's stepped renders set renderLive.)
      const unplug = !this.offline || this.renderLive, old = now - 0.05;
      const keep = list => list.filter(v => { if (v.end > old) return true; if (unplug) this._unplug(v); return false; });
      this.mvoices = keep(this.mvoices);
      this.svoices = keep(this.svoices);
      this.songs = this.songs.filter(s => {
        const gone = (s.stopping && now > s.stopT + 0.3) || (s.done && now > s.endT + 4);
        if (gone && unplug) { for (const n of s.out.concat(s.nodes)) { try { if (n.stop) n.stop(); n.disconnect(); } catch (e) { /* fine */ } } }
        return !gone;
      });
      if (this.stingerSong && this.songs.indexOf(this.stingerSong) < 0) this.stingerSong = null;
    }
    const sr = this.stingerResume;
    if (sr && now >= sr.at - 0.3) {
      this.stingerResume = null;
      if (sr.song === this.song && sr.song.paused && sr.song.resumeAt === Infinity) this._resume(sr.song, Math.max(sr.at, now + 0.03));
    }
    for (const song of this.songs) {
      if (song.stopping || song.done) continue;
      if (song.paused) { if (now >= song.resumeAt - 0.3) this._resume(song, Math.max(song.resumeAt, now + 0.03)); else continue; }
      this._schedule(song, now);
    }
    if (!this.offline && (this.instQueue.length || this.fxQueue.length || this.fxJob)) this._background();
  },
  // Background building, about BUILD_MS per call: instrument root samples (the playing track's
  // first), then effect variants. Big items are generators that stop between slices of ~1-3 ms
  // (a voice or 12 000 samples of an instrument, one layer of an effect) and go on next call.
  _background() {
    const t0 = performance.now(), B = this.BUILD_MS;
    for (let guard = 0; guard < 400; guard++) {
      const left = B - (performance.now() - t0);
      if (left <= 0.2) break;
      const late = left < B * 0.5;       // past half the time: go on with a started item, start no new one
      if (this.instQueue.length) {
        const q = this.instQueue[0];
        if (late && !SYNTH.has(q[0], q[1]) && !SYNTH.jobs[q[0] + "#" + q[1]]) break;
        if (!SYNTH.buildRoot(q[0], q[1], left)) break;
        this.instQueue.shift();
        if (!this.instQueue.length) this.stats.sampleBytes = SYNTH.bytes;
        continue;
      }
      if (!this.fxJob) {
        if (!this.fxQueue.length || late) break;
        const [n, v] = this.fxQueue.shift(), d = SFX[n], e = this.fxCache[n];
        if (!d || d.play || d.key || !d.layers || (e && e.def === d && e.bufs[v])) continue;
        this.fxJob = { n, v, d, g: SYNTH.renderFxG(d, n, v, null) };
      }
      const j = this.fxJob;
      let res = null;
      try {
        for (;;) { const st = j.g.next(); if (st.done) { res = st.value; break; } if (performance.now() - t0 >= B) break; }
      } catch (err) { this.fxJob = null; console.error(err.message); continue; }
      if (!res) break;
      this.fxJob = null;
      this._fxStore(j.n, j.d, j.v, res);
    }
    const ms = performance.now() - t0;
    this.stats.bgCalls++; this.stats.bgMs += ms;
    this.stats.sliceMsMax = Math.max(this.stats.sliceMsMax || 0, Math.round(ms * 10) / 10);
  },
  // Unplug a finished voice (music note, effect or Sound.note) from the graph.
  _unplug(v) {
    for (const n of [v.src, v.f, v.lfo, v.g, v.pn, v.dest]) if (n) { try { n.disconnect(); } catch (e) { /* fine */ } }
    if (v.sends) for (const n of v.sends) { try { n.disconnect(); } catch (e) { /* fine */ } }
    this.stats.unplugged = (this.stats.unplugged || 0) + 1;
  },

  // ----- pause, duck, stingers, layers -----
  // Stop the music now and go on from the same place after `sec` (no sec: until resumeMusic()).
  pauseMusic(sec) {
    const song = this.song;
    if (!this.ctx || !song || song.stopping || song.done) return;
    const now = this.ctx.currentTime;
    if (song.paused) { song.resumeAt = sec == null ? Infinity : song.resumeAt === Infinity ? Infinity : Math.max(song.resumeAt, now + sec); return; }
    song.pausePos = this._posAt(song, now + 0.02);
    if (!song.pausePos) return;
    song.paused = true;
    song.resumeAt = sec == null ? Infinity : now + sec;
    this._level(song, now, 0, 0.03);
    for (const v of this.mvoices) if (v.song === song && v.end > now) this._cut(v, Math.max(now + 0.03, v.t), 0.01);
  },
  resumeMusic() {
    const song = this.song;
    if (!this.ctx || !song || !song.paused) return;
    this._resume(song, this.ctx.currentTime + 0.03);
  },
  _resume(song, t) {
    const p = song.pausePos;
    song.paused = false;
    this._seek(song, p.pass, p.tick, t, true, p.passBar);
    this._level(song, t, 1, 0.15);
  },
  // Lower the music by db (10-12 for short cues) for `sec`, with attack and release times.
  // Overlapping requests: the deepest wins. Music effect sends go down with it.
  duck(db, sec, att, rel) {
    if (!this.G) return;
    const now = this.ctx.currentTime;
    att = att == null ? 0.03 : Math.max(0.005, att); rel = rel == null ? 0.6 : Math.max(0.02, rel); sec = sec == null ? 0.5 : Math.max(0, sec);
    this.ducks = this.ducks.filter(x => x.t3 > now);
    this.ducks.push({ t0: now, t1: now + att, t2: now + att + sec, t3: now + att + sec + rel, g: SYNTH.db(-Math.abs(db)) });
    const at = T => {
      let v = 1;
      for (const x of this.ducks) {
        let k = 1;
        if (T >= x.t0 && T < x.t1) k = 1 + (x.g - 1) * (T - x.t0) / (x.t1 - x.t0);
        else if (T >= x.t1 && T < x.t2) k = x.g;
        else if (T >= x.t2 && T < x.t3) k = x.g + (1 - x.g) * (T - x.t2) / (x.t3 - x.t2);
        v = Math.min(v, k);
      }
      return v;
    };
    const times = [];
    for (const x of this.ducks) for (const tt of [x.t0, x.t1, x.t2, x.t3]) if (tt > now) times.push(tt);
    times.sort((a, b) => a - b);
    for (const node of [this.G.duckDry, this.G.duckE, this.G.duckV]) {
      const p = node.gain;
      p.cancelScheduledValues(now); p.setValueAtTime(at(now), now);
      for (const tt of times) p.linearRampToValueAtTime(at(tt), tt);
    }
  },
  // Play a short track flagged stinger: true over the current music (paused or ducked, as the
  // stinger's hold says), then let the music go on.
  stinger(name) {
    if (!this.ctx) return;
    let c = null;
    try { c = SONG.get(name); } catch (e) { console.error(e.message); return; }
    if (!c) { if (!this.warned["s:" + name]) { this.warned["s:" + name] = 1; console.warn("Sound.stinger: no track named '" + name + "'"); } return; }
    const now = this.ctx.currentTime, t = now + 0.03;
    if (this.stingerSong && !this.stingerSong.stopping) this._stopSong(this.stingerSong, now, 0.08, false);
    this._ensureTrack(name);
    const len = (c.intro.ticks + c.loop.ticks) * c.spt, endT = t + len + c.tail, main = this.song;
    if (main && !main.stopping && !main.done) {
      if (c.hold === "duck") this.duck(c.duckDb, Math.max(0, endT - now - 0.05), 0.05, 0.6);
      else if (!main.paused) { this.pauseMusic(null); this.stingerResume = { song: main, at: endT }; }
    }
    this.stingerSong = this._start(name, c, { t, pass: c.intro.ticks ? 0 : 1, tick: 0, fadeIn: 0, stinger: true, once: true });
  },
  // Switch a layer (channels tagged layer: name) on or off from the next bar line.
  // Accepts setLayer("forest", true) or setLayer({ forest: true, desert: false }).
  setLayer(name, on) {
    if (name && typeof name === "object") { for (const k in name) this.setLayer(k, name[k]); return; }
    on = !!on;
    this.layerState[name] = on;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    for (const song of this.songs) {
      const tl = song.ltl[name];
      if (!tl || song.stopping || song.done) continue;
      const c = song.c;
      let B;
      if (song.schedT <= song.t0 + 1e-6) B = { abar: -1e9, t: song.t0 };       // nothing scheduled yet: from the start
      else {
        const p = this._posAt(song, Math.max(now + 0.03, song.t0));
        if (!p) continue;
        const bar = Math.ceil(p.tick / c.barTicks - 1e-6);
        const a = (song.prevAnchor && p.pass === song.prevAnchor.pass && p.passBar === song.prevAnchor.bar) ? song.prevAnchor : { t0: song.passT0 };
        B = { abar: p.passBar + bar, t: a.t0 + bar * c.barTicks * c.spt };
      }
      while (tl.length > 1 && tl[tl.length - 1][0] >= B.abar) tl.pop();
      if (tl.length === 1 && tl[0][0] >= B.abar) tl[0][1] = on; else tl.push([B.abar, on]);
      if (!on) { for (const v of this.mvoices) if (v.song === song && v.layer === name && v.end > B.t) this._cut(v, Math.max(B.t, v.t), 0.03); }
      else if (song.schedT > B.t && !song.paused) this._rescan(song, name, Math.max(B.t, now + 0.01), song.schedT);
    }
  },
  layerOn(name) { return this.layerState[name] !== false; },
  // Schedule a layer's notes between tA and tB that were skipped while it was off.
  _rescan(song, layer, tA, tB) {
    const c = song.c, anchors = [];
    if (song.prevAnchor) anchors.push(song.prevAnchor);
    anchors.push({ pass: song.pass, t0: song.passT0, bar: song.passBar });
    for (const a of anchors) {
      const P = a.pass === 0 ? c.intro : c.loop;
      for (const ev of P.events) {
        if (c.chans[ev.ch].layer !== layer) continue;
        const t = this._tq(a.t0 + this._tickTime(c, ev.tick));
        if (t < tA || t >= tB) continue;
        if (this.solo && this.solo.indexOf(c.chans[ev.ch].name) < 0) continue;
        this._play(song, ev, t);
      }
    }
  },

  // ----- looking inside a track (AudioLab, checks) -----
  describeTrack(name) {
    const c = SONG.get(name);
    if (!c) return null;
    const events = [], r6 = x => Math.round(x * 1e6) / 1e6;
    const add = (P, off) => {
      for (const e of P.events) events.push({ t: r6(this._tickTime(c, off + e.tick)), dur: r6(e.gate * c.spt), len: r6(e.dur * c.spt), midi: e.drum ? null : e.midi, ch: e.ch, vel: Math.round(e.vel * 100) / 100,
        inst: e.drum ? "kit" : e.inst, drum: e.drum, tick: off + e.tick, bends: e.bends.length ? e.bends.map(b => ({ t: r6(b.at * c.spt), midi: b.midi })) : undefined });
    };
    add(c.intro, 0); add(c.loop, c.intro.ticks);
    return {
      name, bpm: c.bpm, qbpm: c.qbpm, meter: c.meter, barTicks: c.barTicks, spt: c.spt, barSec: c.barTicks * c.spt,
      introBars: c.intro.bars, loopBars: c.loop.bars, introSec: c.introSec, loopSec: c.loopSec,
      layers: c.layers.slice(), layerDefaults: Object.assign({}, c.layerDefaults), stinger: c.stinger, tonic: c.tonic, mode: c.mode,
      echo: Object.assign({}, c.echo), verb: Object.assign({}, c.verb), gain: c.gain,
      sections: c.intro.sections.map(s => Object.assign({ part: "intro" }, s)).concat(c.loop.sections.map(s => Object.assign({ part: "loop" }, s, { bar: s.bar + c.intro.bars }))),
      chans: c.chans.map(ch => ({ name: ch.name, inst: ch.inst, pan: ch.pan, vol: ch.vol, layer: ch.layer, echo: ch.echo, verb: ch.verb })),
      events, warnings: c.warnings.slice(),
    };
  },
  // Key of the playing track (for effects written as scale degrees).
  key() { const c = this.song ? this.song.c : this.trackName ? SONG.cache[this.trackName] : null; return c ? { tonic: c.tonic, mode: c.mode } : { tonic: 60, mode: "major" }; },

  // ----- sound effects -----
  get sfxNames() { return Object.keys(SFX); },
  setRoom(r) { if (typeof r === "number") this.room = { echo: r, verb: r }; else if (r) this.room = { echo: r.echo == null ? 1 : r.echo, verb: r.verb == null ? 1 : r.verb }; },
  _fxBuf(name, def, v, key) {
    let e = this.fxCache[name];
    if (!e || e.def !== def) e = this.fxCache[name] = { def, bufs: {} };
    const k = v + (key ? "@" + key.tonic + key.mode : "");
    if (!e.bufs[k]) {
      const j = this.fxJob;
      if (j && !key && j.n === name && j.v === v && j.d === def) { this.fxJob = null; this._fxStore(name, def, v, SYNTH.run(j.g)); }   // finish the half-built one
      else { const r = SYNTH.renderFx(def, name, v, key); e.bufs[k] = SYNTH.mkbuf(r.chans, r.sr); }
    }
    return e.bufs[k];
  },
  _fxStore(name, def, v, r) {
    let e = this.fxCache[name];
    if (!e || e.def !== def) e = this.fxCache[name] = { def, bufs: {} };
    e.bufs[v] = SYNTH.mkbuf(r.chans, r.sr);
  },
  // Play an effect. opts: {x (playfield px, pans), pan, pitch (semitones), gain (dB), delay (s)}.
  // Returns an id (for stopLoop) or null.
  sfx(name, o) {
    if (!this.ctx || !this.G || this.muted) return null;
    const def = SFX[name];
    if (!def) { if (!this.warned["x:" + name]) { this.warned["x:" + name] = 1; console.warn("Sound.sfx: no effect named '" + name + "'"); } return null; }
    o = o || {};
    const now = this.ctx.currentTime, t = now + Math.max(0, (o.delay || 0) + (this.stepDelay || 0));
    const last = this.fxLast[name];
    if (def.cool && last != null && t >= last && t - last < def.cool) return null;
    // voice limits: this effect's own maximum, then the global cap by priority
    const live = this.svoices.filter(v => v.end > t && v.cutAt == null), prio = def.prio || 0;
    const mine = live.filter(v => v.name === name);
    if (mine.length >= (def.max || 4)) { mine.sort((a, b) => a.t - b.t); this._cut(mine[0], t, 0.01); }
    else if (live.length >= this.SFX_VOICES) {
      let low = null;
      for (const v of live) if (!low || v.prio < low.prio || (v.prio === low.prio && v.t < low.t)) low = v;
      if (low.prio > prio) return null;
      this._cut(low, t, 0.01);
    }
    this.fxLast[name] = t;
    // music interplay: pause (seconds, or true = as long as the effect), duck (dB), stinger (track)
    const hold = len => {
      if (def.pause) this.pauseMusic(def.pause === true ? len + 0.05 : def.pause);
      if (def.duck) this.duck(def.duck, def.duckHold != null ? def.duckHold : len, def.duckAtt, def.duckRel);
      if (def.stinger) this.stinger(def.stinger);
    };
    if (def.play || !def.layers) {
      hold(def.len || 0.5);
      if (!def.play) return null;
      try { return def.play(this, o, t); } catch (e) { console.error("Sound.sfx '" + name + "': " + e.message); return null; }
    }
    const nv = Math.max(1, def.variants || 1), r = this.fxRnd;
    let vi = 0;
    if (nv > 1) { vi = Math.floor(r() * (nv - 1)); if (this.fxLastVar[name] != null && vi >= this.fxLastVar[name]) vi++; }
    this.fxLastVar[name] = vi;
    let buf;
    try { buf = this._fxBuf(name, def, vi, def.key ? this.key() : null); } catch (e) { console.error(e.message); return null; }
    hold(buf.duration);
    const vary = def.vary || {}, cents = (r() * 2 - 1) * (vary.cents || 0), dbv = (r() * 2 - 1) * (vary.db || 0);
    const pan = o.pan != null ? o.pan : o.x != null ? Math.max(-1, Math.min(1, (o.x - this.fieldW / 2) / (this.fieldW / 2))) * 0.5 : def.pan || 0;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const rate = Math.pow(2, (cents / 100 + (o.pitch || 0)) / 12);
    src.playbackRate.value = rate;
    if (def.loop) src.loop = true;
    const g = this.gain(SYNTH.db(dbv + (o.gain || 0))), pn = this.panner(pan, def.bus === "ui" ? this.G.uiBus : this.G.sfxBus), sends = [];
    src.connect(g); g.connect(pn);
    if (def.echo) { const s = this.gain(def.echo * this.room.echo, this.G.echoIn); pn.connect(s); sends.push(s); }
    if (def.verb) { const s = this.gain(def.verb * this.room.verb, this.G.verbIn); pn.connect(s); sends.push(s); }
    src.start(t);
    const v = { name, src, g, gv: g.gain.value, pn, sends, t, end: def.loop ? Infinity : t + buf.duration / rate + 0.02, prio, cutAt: null, id: this.nextId++ };
    this.svoices.push(v);
    if (def.loop) this.loops[o.id || v.id] = v;
    return v.id;
  },
  // Looping effects (fuse, whirr): start with an id, adjust, stop with a short fade.
  loop(id, name, o) { this.stopLoop(id); const r = this.sfx(name, Object.assign({}, o, { id })); return r; },
  loopSet(id, o) {
    const v = this.loops[id];
    if (!v || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (o.pan != null && v.pn.pan) v.pn.pan.setTargetAtTime(o.pan, now, 0.03);
    if (o.x != null && v.pn.pan) v.pn.pan.setTargetAtTime(Math.max(-1, Math.min(1, (o.x - this.fieldW / 2) / (this.fieldW / 2))) * 0.5, now, 0.03);
    if (o.pitch != null) v.src.playbackRate.setTargetAtTime(Math.pow(2, o.pitch / 12), now, 0.03);
    if (o.gain != null) { v.gv = SYNTH.db(o.gain); v.g.gain.setTargetAtTime(v.gv, now, 0.03); }
  },
  stopLoop(id, fade) {
    const v = this.loops[id];
    if (!v) return;
    delete this.loops[id];
    if (this.ctx) this._cut(v, this.ctx.currentTime, fade || 0.03);
  },
  // An instrument note on the effect bus (for effect functions and jingles in the song's key).
  // o: {vel, delay, pan, gain (dB), vib: [cents, Hz, delay], bus: "ui"}
  note(inst, midi, dur, o) {
    if (!this.ctx || !this.G || this.muted) return null;
    const d = SYNTH.INST[inst];
    if (!d) { if (!this.warned["i:" + inst]) { this.warned["i:" + inst] = 1; console.warn("Sound.note: no instrument '" + inst + "'"); } return null; }
    o = o || {};
    const t = this.ctx.currentTime + Math.max(0, (o.delay || 0) + (this.stepDelay || 0));
    const pn = this.panner(o.pan || 0, o.bus === "ui" ? this.G.uiBus : this.G.sfxBus);
    const dest = this.gain(this.NOTE_GAIN, pn);
    const v = this._voice({ smp: SYNTH.pick(inst, midi), midi, t, gate: dur, vel: o.vel == null ? 0.8 : o.vel, gain: (d.gain || 0) + (o.gain || 0), env: d.env, lp: d.lp,
      ring: d.ring, vib: o.vib || null, dest });
    v.name = "note:" + inst; v.prio = o.prio || 3; v.pn = pn; v.dest = dest;
    this.svoices.push(v);
    return v;
  },
};

// ============================================================
// Placeholder effects for the 37 names the game uses (the sfx job replaces them in sfx.js).
// Each is a layer recipe (see tools/sound_format.md); cls sets its loudness class.
// ============================================================
Object.assign(SFX, {
  slash: { cls: "critical", prio: 5, max: 2, variants: 3, vary: { cents: 40, db: 1 }, layers: [
    { type: "noise", dur: 0.13, env: { a: 0.03, d: 0.1 }, filter: { type: "bp", f: [[0, 900], [0.13, 5000]], q: 1.4 } },
    { type: "noise", at: 0.02, dur: 0.05, env: { d: 0.05 }, filter: { type: "hp", f: 5000 }, gain: -10 }] },
  beam: { cls: "critical", prio: 4, max: 2, vary: { cents: 20 }, echo: 0.25, verb: 0.15, layers: [
    { type: "fm", f: [1400, 700], ratio: 3.5, index: [3, 0.3], dur: 0.3, env: { a: 0.005, d: 0.3 } },
    { type: "osc", wave: "sine", f: [2100, 1050], dur: 0.25, env: { d: 0.25 }, vib: [40, 22], gain: -8 }] },
  hit: { cls: "critical", prio: 6, max: 3, cool: 0.03, variants: 3, vary: { cents: 80, db: 1 }, layers: [
    { type: "click", gain: -4 },
    { type: "osc", wave: "sine", f: [220, 90], dur: 0.09, env: { d: 0.09 } },
    { type: "noise", dur: 0.06, env: { d: 0.06 }, filter: { type: "bp", f: 1800, q: 1 }, gain: -6 }] },
  clank: { cls: "critical", prio: 5, max: 2, variants: 2, vary: { cents: 40 }, verb: 0.1, layers: [
    { type: "fm", f: 1320, ratio: 1.41, index: [5, 1], dur: 0.35, env: { d: 0.35 } },
    { type: "noise", dur: 0.03, env: { d: 0.03 }, filter: { type: "hp", f: 4000 }, gain: -6 }] },
  hurt: { cls: "critical", prio: 9, max: 1, duck: -4, duckHold: 0.12, duckAtt: 0.01, duckRel: 0.3, layers: [
    { type: "click", gain: -3 },
    { type: "osc", wave: "tri", f: [180, 70], dur: 0.2, env: { d: 0.2 } },
    { type: "osc", wave: "saw", f: [466, 440], dur: 0.12, env: { d: 0.12 }, filter: { type: "lp", f: 1800 }, gain: -10 },
    { type: "noise", dur: 0.08, env: { d: 0.08 }, filter: { type: "lp", f: 1200 }, gain: -6 }] },
  die: { cls: "big", prio: 9, max: 1, verb: 0.3, layers: [
    { type: "osc", wave: "tri", f: [[0, 300], [0.9, 60]], dur: 0.9, env: { a: 0.01, d: 1.2 } },
    { type: "inst", inst: "bells", notes: [[0.9, 64, 0.5, 0.7], [1.2, 60, 0.5, 0.6], [1.5, 55, 0.8, 0.5]] }] },
  enemy_die: { cls: "critical", prio: 5, max: 3, variants: 3, vary: { cents: 60, db: 1 }, layers: [
    { type: "noise", dur: 0.3, env: { a: 0.005, d: 0.3 }, filter: { type: "lp", f: [[0, 3000], [0.3, 300]] } },
    { type: "osc", wave: "sine", f: [300, 60], dur: 0.15, env: { d: 0.15 }, gain: -3 },
    { type: "grit", rate: 120, dur: 0.25, filter: { type: "hp", f: 2000 }, gain: -10 }] },
  gem: { cls: "pickup", prio: 3, max: 2, key: true, vary: { cents: 8 }, layers: (v, r, k) => [
    { type: "inst", inst: "glock", notes: [[0, SONG.degree(k, 18), 0.1, 0.7], [0.06, SONG.degree(k, 16), 0.1, 0.7], [0.12, SONG.degree(k, 21), 0.3, 0.9]] }] },
  heart: { cls: "pickup", prio: 3, max: 2, key: true, layers: (v, r, k) => [
    { type: "inst", inst: "harp", notes: [[0, SONG.degree(k, 11), 0.3, 0.8], [0.08, SONG.degree(k, 13), 0.5, 0.9]] }] },
  key: { cls: "pickup", prio: 4, max: 1, key: true, duck: -10, duckHold: 0.5, layers: (v, r, k) => [
    { type: "inst", inst: "glock", notes: [[0, SONG.degree(k, 14), 0.1, 0.8], [0.07, SONG.degree(k, 18), 0.1, 0.8], [0.14, SONG.degree(k, 21), 0.6, 1]] },
    { type: "noise", dur: 0.05, env: { d: 0.05 }, filter: { type: "hp", f: 6000 }, gain: -12, rep: [3, 0.07] }] },
  unlock: { cls: "world", prio: 4, max: 1, layers: [
    { type: "modal", f: 900, parts: [[1, 1, 0.08], [2.3, 0.6, 0.05]], dur: 0.06 },
    { type: "modal", at: 0.12, f: 520, parts: [[1, 1, 0.12], [2.7, 0.5, 0.06]], dur: 0.1 },
    { type: "noise", at: 0.2, dur: 0.25, env: { a: 0.02, d: 0.25 }, filter: { type: "bp", f: [[0, 300], [0.25, 700]], q: 3 }, gain: -6 }] },
  door: { cls: "world", prio: 3, max: 1, layers: [
    { type: "noise", dur: 0.3, env: { a: 0.02, d: 0.3 }, filter: { type: "bp", f: [[0, 400], [0.3, 250]], q: 4 } },
    { type: "modal", at: 0.28, f: 140, parts: [[1, 1, 0.15]], dur: 0.12, gain: -3 }] },
  shutter: { cls: "world", prio: 4, max: 1, duck: -4, duckHold: 0.2, layers: [
    { type: "noise", dur: 0.12, env: { d: 0.12 }, filter: { type: "lp", f: 900 } },
    { type: "modal", f: 180, parts: [[1, 1, 0.3], [2.76, 0.5, 0.2], [5.4, 0.2, 0.1]], dur: 0.25 }] },
  stairs: { cls: "world", prio: 3, max: 1, verb: 0.25, layers: [
    { type: "noise", dur: 0.05, env: { d: 0.05 }, filter: { type: "lp", f: 700 }, rep: [3, 0.14] },
    { type: "osc", wave: "sine", f: [110, 70], dur: 0.05, env: { d: 0.05 }, gain: -4, rep: [3, 0.14] }] },
  bomb_place: { cls: "world", prio: 3, max: 2, layers: [
    { type: "modal", f: 210, parts: [[1, 1, 0.1], [2.3, 0.3, 0.05]], dur: 0.08 },
    { type: "grit", at: 0.05, rate: 40, dur: 0.3, filter: { type: "hp", f: 3000 }, gain: -12 }] },
  explosion: { cls: "big", prio: 7, max: 3, variants: 3, vary: { cents: 70, db: 1 }, duck: -6, duckHold: 0.25, duckAtt: 0.01, verb: 0.3, echo: 0.1, layers: [
    { type: "noise", dur: 0.02, env: { d: 0.02 }, filter: { type: "bp", f: 3500, q: 0.8 } },
    { type: "noise", color: "brown", dur: 0.8, env: { a: 0.005, d: 0.8 }, filter: { type: "lp", f: [[0, 2500], [0.8, 150]] } },
    { type: "osc", wave: "sine", f: [90, 35], dur: 0.5, env: { d: 0.5 }, gain: -2 },
    { type: "grit", at: 0.05, rate: [200, 20], dur: 0.6, filter: { type: "bp", f: 2500, q: 0.8 }, gain: -8, pan: 0.3 }] },
  arrow: { cls: "critical", prio: 4, max: 2, variants: 2, vary: { cents: 50 }, layers: [
    { type: "pluck", f: 180, t60: 0.15, bright: 0.8, dur: 0.1 },
    { type: "noise", dur: 0.15, env: { a: 0.01, d: 0.15 }, filter: { type: "bp", f: [[0, 2000], [0.15, 900]], q: 2 }, gain: -6 }] },
  boomer: { cls: "world", prio: 2, max: 2, cool: 0.1, vary: { cents: 30 }, layers: [
    { type: "noise", dur: 0.12, env: { a: 0.04, d: 0.08 }, filter: { type: "bp", f: [[0, 700], [0.06, 1400], [0.12, 700]], q: 3 } }] },
  flame: { cls: "world", prio: 3, max: 2, variants: 2, vary: { cents: 40 }, layers: [
    { type: "noise", dur: 0.35, env: { a: 0.03, d: 0.35 }, filter: { type: "bp", f: [[0, 600], [0.1, 1500], [0.35, 500]], q: 0.8 } },
    { type: "grit", rate: 70, dur: 0.4, filter: { type: "hp", f: 2500 }, gain: -8 }] },
  shield: { cls: "critical", prio: 5, max: 2, vary: { cents: 30 }, layers: [
    { type: "fm", f: 1700, ratio: 2.76, index: [4, 0.5], dur: 0.2, env: { d: 0.2 } },
    { type: "noise", dur: 0.1, env: { a: 0.01, d: 0.1 }, filter: { type: "bp", f: [[0, 3000], [0.1, 1500]], q: 2 }, gain: -8 }] },
  beep: { cls: "world", prio: 8, max: 1, layers: [
    { type: "osc", wave: "sine", f: [95, 60], dur: 0.09, env: { d: 0.09 } },
    { type: "click", gain: -10 },
    { type: "osc", wave: "sine", at: 0.16, f: [85, 55], dur: 0.09, env: { d: 0.09 }, gain: -3 }] },
  text: { cls: "text", bus: "ui", prio: 1, max: 2, cool: 0.045, vary: { cents: 25 }, layers: [
    { type: "osc", wave: "pulse", duty: 0.25, f: 740, dur: 0.028, env: { a: 0.002, d: 0.03 }, filter: { type: "lp", f: 3000 } }] },
  cursor: { cls: "ui", bus: "ui", prio: 1, max: 1, layers: [
    { type: "modal", f: 1200, parts: [[1, 1, 0.06], [2.4, 0.3, 0.03]], dur: 0.05 }] },
  denied: { cls: "confirm", bus: "ui", prio: 2, max: 1, layers: [
    { type: "osc", wave: "tri", f: 330, dur: 0.07, env: { d: 0.07 } },
    { type: "osc", wave: "tri", at: 0.09, f: 277, dur: 0.11, env: { d: 0.11 } }] },
  buy: { cls: "pickup", prio: 3, max: 1, layers: [
    { type: "grit", rate: 300, dur: 0.18, filter: { type: "bp", f: 5000, q: 1 }, gain: -6 },
    { type: "inst", inst: "glock", notes: [[0.05, 88, 0.1, 0.7], [0.12, 95, 0.4, 0.9]] }] },
  roar: { cls: "big", prio: 8, max: 1, duck: -6, duckHold: 0.4, duckAtt: 0.01, verb: 0.3, layers: [
    { type: "fm", f: [[0, 90], [0.3, 110], [0.9, 60]], ratio: 1.5, index: [6, 2], dur: 0.9, env: { a: 0.05, d: 1 }, drive: 2 },
    { type: "noise", color: "pink", dur: 0.9, env: { a: 0.08, d: 0.9 }, filter: { type: "bp", f: 700, q: 0.7 }, gain: -6 }] },
  teleport: { cls: "world", prio: 4, max: 2, echo: 0.3, layers: [
    { type: "noise", dur: 0.3, env: { a: 0.25, h: 0, d: 0.06 }, filter: { type: "bp", f: [[0, 600], [0.3, 4000]], q: 4 } },
    { type: "osc", wave: "sine", f: [[0, 400], [0.3, 1600]], dur: 0.3, env: { a: 0.25, d: 0.08 }, gain: -8 }] },
  grab: { cls: "world", prio: 4, max: 2, layers: [
    { type: "noise", dur: 0.25, env: { a: 0.01, d: 0.25 }, filter: { type: "bp", f: [[0, 1500], [0.25, 400]], q: 3 } },
    { type: "osc", wave: "saw", f: [300, 120], dur: 0.2, env: { d: 0.2 }, filter: { type: "lp", f: 900 }, gain: -8 }] },
  push: { cls: "world", prio: 2, max: 1, layers: [
    { type: "noise", color: "brown", dur: 0.25, env: { a: 0.04, d: 0.25 }, filter: { type: "lp", f: 600 } },
    { type: "grit", rate: 60, dur: 0.25, filter: { type: "bp", f: 1200, q: 1 }, gain: -10 }] },
  secret: { cls: "jingle", prio: 6, max: 1, key: true, duck: -11, duckHold: 0.8, verb: 0.3, echo: 0.2, layers: (v, r, k) => [
    { type: "inst", inst: "celesta", notes: [[0, SONG.degree(k, 11) + 1, 0.12, 0.7], [0.11, SONG.degree(k, 10), 0.12, 0.7], [0.22, SONG.degree(k, 13), 0.12, 0.8], [0.33, SONG.degree(k, 14), 0.6, 1]] },
    { type: "inst", inst: "glass", notes: [[0.33, SONG.degree(k, 7), 0.6, 0.6], [0.33, SONG.degree(k, 9), 0.6, 0.5], [0.33, SONG.degree(k, 11), 0.6, 0.5]] }] },
  item_fanfare: { cls: "jingle", prio: 9, max: 1, key: true, pause: 1.17, verb: 0.25, layers: (v, r, k) => [
    { type: "inst", inst: "brass", notes: [[0, SONG.degree(k, 3), 0.1, 0.8], [0.11, SONG.degree(k, 4), 0.1, 0.85], [0.22, SONG.degree(k, 5), 0.1, 0.9],
      [0.36, SONG.degree(k, 7), 0.65, 1], [0.36, SONG.degree(k, 4), 0.65, 0.8], [0.36, SONG.degree(k, 2), 0.65, 0.8]] },
    { type: "inst", inst: "glock", notes: [[0.36, SONG.degree(k, 18), 0.3, 0.7], [0.5, SONG.degree(k, 21), 0.4, 0.8]] }] },
  shard: { cls: "jingle", prio: 9, max: 1, key: true, pause: 1.83, verb: 0.35, echo: 0.2, layers: (v, r, k) => [
    { type: "inst", inst: "celesta", notes: [[0, SONG.degree(k, 7), 0.12, 0.8], [0.15, SONG.degree(k, 8), 0.12, 0.8], [0.3, SONG.degree(k, 11), 0.12, 0.85], [0.45, SONG.degree(k, 14), 0.8, 1]] },
    { type: "inst", inst: "choir", notes: [[0.55, SONG.degree(k, 0), 0.9, 0.7], [0.55, SONG.degree(k, 4), 0.9, 0.6], [0.55, SONG.degree(k, 9), 0.9, 0.6]] },
    { type: "inst", inst: "bells", notes: [[0.55, SONG.degree(k, 7), 1, 0.7]] }] },
  gameover: { cls: "jingle", prio: 9, max: 1, verb: 0.35, layers: [
    { type: "inst", inst: "musicbox", notes: [[0, 81, 0.3, 0.8], [0.32, 77, 0.3, 0.75], [0.64, 76, 0.3, 0.7], [0.96, 72, 0.3, 0.7], [1.28, 74, 0.9, 0.7]] },
    { type: "inst", inst: "strings", notes: [[0, 50, 1.8, 0.5], [0, 57, 1.8, 0.45], [0, 65, 1.8, 0.4]] }] },
  fall: { cls: "world", prio: 5, max: 1, echo: 0.3, layers: [
    { type: "noise", dur: 0.6, env: { a: 0.05, d: 0.6 }, filter: { type: "bp", f: [[0, 1800], [0.6, 300]], q: 3 } },
    { type: "osc", wave: "sine", f: [[0, 600], [0.6, 150]], dur: 0.6, env: { d: 0.6 }, gain: -10 }] },
  shatter: { cls: "world", prio: 3, max: 2, variants: 3, vary: { cents: 60 }, layers: [
    { type: "noise", dur: 0.02, env: { d: 0.02 }, filter: { type: "hp", f: 2500 } },
    { type: "grit", rate: [400, 30], dur: 0.3, filter: { type: "bp", f: 2200, q: 0.8 }, gain: -2 },
    { type: "modal", f: 650, parts: [[1, 1, 0.1], [2.1, 0.6, 0.08], [3.4, 0.4, 0.05]], dur: 0.1, gain: -6 }] },
  hammer: { cls: "critical", prio: 5, max: 2, variants: 2, vary: { cents: 40 }, duck: -3, duckHold: 0.1, layers: [
    { type: "noise", dur: 0.03, env: { d: 0.03 }, filter: { type: "bp", f: 2500, q: 1 } },
    { type: "osc", wave: "sine", f: [120, 45], dur: 0.25, env: { d: 0.25 } },
    { type: "modal", f: 240, parts: [[1, 1, 0.2], [1.7, 0.5, 0.12], [2.9, 0.3, 0.08]], dur: 0.2, gain: -4 }] },
  hook: { cls: "world", prio: 4, max: 2, layers: [
    { type: "noise", dur: 0.2, env: { a: 0.01, d: 0.2 }, filter: { type: "bp", f: [[0, 1200], [0.2, 3000]], q: 3 } },
    { type: "grit", rate: 90, dur: 0.25, filter: { type: "hp", f: 4000 }, gain: -8 },
    { type: "fm", at: 0.02, f: 2400, ratio: 1.41, index: [3, 0.5], dur: 0.12, env: { d: 0.12 }, gain: -8 }] },
});

// ============================================================
// Test songs (AudioLab renders them; the game never plays names starting with "_").
// ============================================================
// _demo: every instrument in turn, one bar each (channel names = instrument names), then the kit.
(function () {
  const melodic = SYNTH.names().filter(n => SYNTH.INST[n].kind !== "drum");
  const n = melodic.length, total = n + 2, parts = { D: {} }, chans = [];
  melodic.forEach((name, i) => {
    const d = SYNTH.INST[name], mid = (d.range[0] + d.range[1]) / 2, o = Math.max(1, Math.min(7, Math.floor(mid / 12) - 1));
    const phrase = d.kind === "sus" ? "o" + o + " l8 c e g > c4 < g8 c4~" : "o" + o + " l8 c e g > c4 < g8 {c e g}4";
    chans.push({ name, inst: name, pan: i % 2 ? 0.35 : -0.35, vol: 0.8, verb: 0.2, echo: 0.1 });
    parts.D[name] = (i ? "z" + i + " | " : "") + phrase + " | z" + (total - i - 1);
  });
  chans.push({ name: "kit", inst: "kit", vol: 0.8, verb: 0.15 });
  parts.D.kit = "z" + n + " | l8 {KH} H {SH} H {KH} {KH} {SH} O | l16 L M T R Z J A D E X C4 r8";
  SONG.add("_demo", { test: true, bpm: 100, meter: "4/4", key: "C", echo: { ms: 180, fb: 0.3, mix: 0.25 }, verb: { sec: 1.6, mix: 0.25 }, chans, parts, loop: ["D"] });
})();

// _test: intro + loop with a layer, a transposed section and every notation feature.
SONG.add("_test", {
  bpm: 120, meter: "4/4", key: "D dorian", swing: 0, echo: { len: "8.", fb: 0.35, mix: 0.3 }, verb: { sec: 1.8, mix: 0.25 },
  layers: { extra: false },
  chans: [
    { name: "lead", inst: "trumpet", pan: 0.1, vol: 0.75, echo: 0.3, verb: 0.25, oct: 5 },
    { name: "flute", inst: "flute", pan: 0.4, vol: 0.6, echo: 0.2, verb: 0.3, oct: 5, vib: true },
    { name: "harp", inst: "harp", pan: -0.4, vol: 0.55, verb: 0.3 },
    { name: "bass", inst: "pickbass", pan: 0, vol: 0.8, oct: 2 },
    { name: "pad", inst: "strings", pan: -0.1, vol: 0.5, verb: 0.4, layer: "extra" },
    { name: "timp", inst: "timpani", pan: 0.2, vol: 0.6, oct: 2, verb: 0.2 },
    { name: "drums", inst: "kit", vol: 0.7, verb: 0.1 },
  ],
  parts: {
    I: {                                            // intro: 2 bars, played once
      lead: "r2 r8 o4 a8 > c8 d8 | e2& e4 /g4 |",
      harp: "o3 l16 {d a > d f}4 r4 [d a > d a <]2 | l8 {c g > c e}2 r2 |",
      bass: "d4. d8 r2 | c2 r2 |",
      timp: "d4! r4 r4 [a16]4 | d2 r2 |",
      drums: "C4 r4 r2 | z",
    },
    A: {                                            // loop section A: 4 bars
      lead: "l8 d e f' e' d4 a4 | g8. f16 e8 d8 c4\\ r4 | d8? e8 f8 a8 > c4 < a4~ | l12 g a g f4 e4 d4 |",
      flute: "z2 | o5 w15 a2 g2 | f1 |",
      harp: "o3 l8 [d a > d a <]2 | [c g > c g <]2 | [d a > d f <]2 | {g > d g}2 {a > e a}2 |",
      bass: "d4 d8 a8 d4 c4 | c4 c8 g8 c4 < a4 > | d4 d8 a8 > c4 < a4 | g4 g4 a4 a4 |",
      pad: "o4 {d f a}1 | {c e g}1 | {d f a}1 | {d g b}2 {c# e a}2 |",
      timp: "d4 r4 r2 | z | d4 r4 r2 | r2 a4 a4 |",
      drums: "[{KH} H {SH} H {KH} {KH}? {SH} H |]2 K H S H K K S {OH} | {KH} H {SH} H l16 T T M M L L S S |",
    },
    B: {                                            // loop section B: 2 bars, played at +0 and +1
      lead: "@oboe o5 p60 q70 a4 /b4 > c4 < b4_ | a2 r2 |",
      flute: "o6 d8 c8 < b8 a8 g8 f8 e8 d8 | c#2 r2 |",
      harp: "o3 l8 k0 [e b > e g <]2 | k0 {a > c# e}2 r2 |",
      bass: "e4 e4 b4 e4 | a4 r4 a4 r4 |",
      pad: "o4 {e g b}1 | {a > c# e}1 |",
      timp: "e4 r4 b4 r4 | a4 r4 r2 |",
      drums: "{KC} H S H K H S H | K H S R R R {SO}4 |",
    },
  },
  intro: ["I"],
  loop: ["A", "B", "A", "B+1"],
});

// _sting: a two-bar stinger (Sound.stinger("_sting") pauses the music, plays, then resumes it).
SONG.add("_sting", {
  stinger: true, bpm: 120, key: "D",
  chans: [
    { name: "brass", inst: "brass", vol: 0.8, verb: 0.3 },
    { name: "bells", inst: "bells", vol: 0.6, verb: 0.4, oct: 5 },
    { name: "timp", inst: "timpani", vol: 0.7, oct: 2 },
  ],
  intro: { brass: "l16 d f# a > d d4 < {d f# a > d}2 |", bells: "r4 d2. |", timp: "d4! r4 r2 |" },
});
