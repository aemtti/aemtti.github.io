"use strict";
// ---------- Sound synth: instruments and effect sounds made in code (no audio files) ----------
// The 16-bit sampler idea: every instrument is a short sample computed here in plain JS when
// the sound unlocks - an attack followed by a seamless loop (winds, brass, pads) or a one-shot
// that rings out (plucks, mallets, bells, drums). The engine (engine.js) plays the samples
// with a pitch, an envelope, a pan and echo/reverb sends per channel.
//   - Two or three root samples per instrument, so no note is shifted by more than about
//     half an octave (no "sped-up tape" sound).
//   - Loops are exactly periodic: every partial and the breath noise complete a whole number
//     of cycles in the loop, and the loop starts on an upward zero crossing.
//   - All noise comes from a seeded generator, so every run makes identical samples.
// Effects (the SFX table) are rendered from layer recipes by SYNTH.renderFx the same way.
// Principles came from the references in review/_audio/refs/engine.md; no code was copied.

function midiHz(m) { return 440 * Math.pow(2, (m - 69) / 12); }

const SYNTH = {
  SR: 32000,          // default sample rate of instrument samples (the 16-bit sampler's rate)
  TAB: 2048,          // points per single-cycle wavetable (enough for 400+ harmonics)
  smp: {},            // instrument name -> [{buf, sr, hz, root, loop, ls, le}] once every root is built
  rs: {},             // instrument name -> [sample per root index] as single roots get built
  jobs: {},           // "name#i" -> a root sample being built in slices (a generator)
  lazy: false,        // true while buildRoot(.., budget) calls make(): sus/fmhit/metal return generators
  bytes: 0,           // memory held by instrument samples (4 bytes per sample)
  buildMs: 0,         // time spent rendering them
  // Run a generator (a sliced job) to its end and return its result.
  run(g) { let s; do { s = g.next(); } while (!s.done); return s.value; },

  // ----- small tools -----
  // Seeded xorshift32 generator: the same seed gives the same numbers on every run.
  rng(seed) {
    let s = (seed >>> 0) || 0x9e3779b9;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  },
  hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; },
  db(v) { return Math.pow(10, v / 20); },

  // In-place radix-2 FFT (inv = true gives the unscaled inverse transform).
  fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inv ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang), h = len >> 1;
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < h; k++) {
          const a = i + k, b = a + h, tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
          re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  },
  // One cycle of a waveform from harmonic amplitudes amp(k), k = 1..kmax (sine partials; with
  // rnd the phases are scrambled, which lowers the peak of dense spectra like strings).
  // TAB + 1 points: the last repeats the first so reads can interpolate across the wrap.
  table(amp, kmax, rnd) {
    const N = this.TAB, re = new Float64Array(N), im = new Float64Array(N);
    for (let k = 1; k <= Math.min(kmax, N / 2 - 1); k++) {
      const a = amp(k);
      const p = rnd ? rnd() * 2 * Math.PI : 0;
      if (!a) continue;
      re[k] = Math.cos(p - Math.PI / 2) * a / 2; im[k] = Math.sin(p - Math.PI / 2) * a / 2;
      re[N - k] = re[k]; im[N - k] = -im[k];
    }
    this.fft(re, im, true);
    const t = new Float32Array(N + 1);
    for (let i = 0; i < N; i++) t[i] = re[i];
    t[N] = t[0];
    return t;
  },
  tread(t, ph) { const x = (ph - Math.floor(ph)) * this.TAB, i = x | 0; return t[i] + (x - i) * (t[i + 1] - t[i]); },
  // Sine by table (phase in cycles, any value): much faster than Math.sin in long loops.
  SIN: (() => { const t = new Float32Array(4097); for (let i = 0; i <= 4096; i++) t[i] = Math.sin(2 * Math.PI * i / 4096); return t; })(),
  sin1(ph) { const x = (ph - Math.floor(ph)) * 4096, i = x | 0, S = this.SIN; return S[i] + (x - i) * (S[i + 1] - S[i]); },
  // Harmonic shaping helpers: a gentle low-pass (order 1 = 6 dB per octave) and a formant bump.
  lpS(f, fc, order) { return 1 / Math.sqrt(1 + Math.pow(f / fc, 2 * (order || 1))); },
  fmt(f, fc, bw, g) { const d = (f - fc) / bw; return 1 + g / (1 + d * d); },

  // Zero-delay state-variable filter (the textbook trapezoidal form). fc is a number or a
  // function of the sample index; type lp / bp / hp; circ = filter a looping buffer
  // (a warm-up pass first, so the result is exactly periodic).
  svf(x, type, fc, q, sr, circ) {
    const k = 1 / (q || 0.707), dyn = typeof fc === "function", T = type === "lp" ? 0 : type === "bp" ? 1 : 2, st = [0, 0];
    if (circ) this._svfRun(x, T, fc, dyn, k, sr, false, st);
    this._svfRun(x, T, fc, dyn, k, sr, true, st);
    return x;
  },
  // The filter loop itself, with its state in plain locals (st = [ic1, ic2] between passes).
  _svfRun(x, T, fc, dyn, k, sr, write, st) {
    const n = x.length;
    let ic1 = st[0], ic2 = st[1], a1 = 0, a2 = 0, a3 = 0, g = 0;
    if (!dyn) { g = Math.tan(Math.PI * Math.min(fc, sr * 0.49) / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; }
    for (let i = 0; i < n; i++) {
      if (dyn && (i & 7) === 0) { g = Math.tan(Math.PI * Math.min(fc(i), sr * 0.49) / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2; }
      const v3 = x[i] - ic2, v1 = a1 * ic1 + a2 * v3, v2 = ic2 + a2 * ic1 + a3 * v3;
      ic1 = 2 * v1 - ic1; ic2 = 2 * v2 - ic2;
      if (write) x[i] = T === 0 ? v2 : T === 1 ? v1 : x[i] - k * v1 - v2;
    }
    st[0] = ic1; st[1] = ic2;
  },
  rms(x, a, b) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); },
  // One-pole DC-blocking high-pass (about fc Hz), in place: removes offsets and slow drift.
  dcBlock(x, sr, fc) {
    const R = Math.exp(-2 * Math.PI * (fc || 10) / sr);
    let px = 0, py = 0;
    for (let i = 0; i < x.length; i++) { const v = x[i]; py = v - px + R * py; px = v; x[i] = py; }
    return x;
  },
  // Take the DC off an instrument sample (a held note or a drum pattern must not push the mix
  // off centre; the FM bass with carrier = modulator makes a real 0 Hz sideband).
  //   loops: the loop's own mean comes off the loop and the rest (it stays exactly periodic);
  //          the attack loses a moving average over whole periods (its DC changes while the
  //          timbre changes), blended into the loop's mean over the last period before ls.
  //   one-shots: a gentle 10 Hz high-pass, then a short fade so the last sample is 0.
  dcFix(s) {
    const x = s.data, n = x.length;
    if (!s.loop) { this.dcBlock(x, s.sr, 10); this.fadeEnd(x, s.sr, 0.003); return; }
    const ls = s.ls, le = s.le;
    let m = 0;
    for (let i = ls; i < le; i++) m += x[i];
    m /= Math.max(1, le - ls);
    const P0 = s.sr / s.hz, P = Math.max(2, Math.round(P0 * Math.max(1, Math.round(0.015 * s.sr / P0)))), h = P >> 1;
    const end = Math.min(n, ls + P), cs = new Float64Array(end + 1), d = new Float32Array(ls);
    for (let i = 0; i < end; i++) cs[i + 1] = cs[i] + x[i];
    for (let i = 0; i < ls; i++) {
      const a = Math.max(0, Math.min(i - h, end - P)), b = Math.min(end, a + P);
      let v = (cs[b] - cs[a]) / Math.max(1, b - a);
      const w = (i - (ls - P)) / P;
      if (w > 0) v += (m - v) * w;
      d[i] = v;
    }
    for (let i = 0; i < ls; i++) x[i] -= d[i];
    for (let i = ls; i < n; i++) x[i] -= m;
  },
  // Loudest 50 ms RMS window (hop 10 ms) of a one-shot.
  peakWin(x, sr) {
    const w = Math.max(1, Math.round(0.05 * sr)), h = Math.max(1, Math.round(0.01 * sr));
    let best = 0;
    for (let s = 0; s < Math.max(1, x.length - w); s += h) best = Math.max(best, this.rms(x, s, Math.min(x.length, s + w)));
    return best;
  },
  // BS.1770 K-weighting (high shelf + high-pass), designed for any sample rate.
  kweight(x, sr) {
    const bq = (x, c) => {
      const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
      for (let i = 0; i < x.length; i++) {
        const v = c[0] * x[i] + c[1] * x1 + c[2] * x2 - c[3] * y1 - c[4] * y2;
        x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v;
      }
      return y;
    };
    let w = 2 * Math.PI * 1681.97 / sr;
    const A = Math.pow(10, 4 / 40), sA = Math.sqrt(A);
    let al = Math.sin(w) / (2 * 0.7072), cs = Math.cos(w);
    let a0 = (A + 1) - (A - 1) * cs + 2 * sA * al;
    const sh = [A * ((A + 1) + (A - 1) * cs + 2 * sA * al) / a0, -2 * A * ((A - 1) + (A + 1) * cs) / a0,
      A * ((A + 1) + (A - 1) * cs - 2 * sA * al) / a0, 2 * ((A - 1) - (A + 1) * cs) / a0, ((A + 1) - (A - 1) * cs - 2 * sA * al) / a0];
    w = 2 * Math.PI * 38.14 / sr; al = Math.sin(w) / (2 * 0.5003); cs = Math.cos(w); a0 = 1 + al;
    const hp = [(1 + cs) / 2 / a0, -(1 + cs) / a0, (1 + cs) / 2 / a0, -2 * cs / a0, (1 - al) / a0];
    return bq(bq(x, sh), hp);
  },
  // Loudest 50 ms K-weighted loudness (LUFS-like) of one or two channels.
  st50(chans, sr) {
    const ks = chans.map(c => this.kweight(c, sr)), n = ks[0].length;
    const w = Math.max(1, Math.round(0.05 * sr)), h = Math.max(1, Math.round(0.01 * sr));
    // running sums of the squares (all channels), so each 50 ms window costs one subtraction
    const cs = new Float64Array(n + 1);
    for (const k of ks) { let a = 0; for (let i = 0; i < n; i++) { a += k[i] * k[i]; cs[i + 1] += a; } }
    let best = 0;
    for (let s = 0; s < Math.max(1, n - w); s += h) best = Math.max(best, (cs[Math.min(n, s + w)] - cs[s]) / w);
    return best > 0 ? -0.691 + 10 * Math.log10(best) : -99;
  },
  noise(n, r) { const x = new Float32Array(n); for (let i = 0; i < n; i++) x[i] = r() * 2 - 1; return x; },
  mkbuf(chans, sr) {
    const len = chans[0].length;
    let b;
    try { b = new AudioBuffer({ length: len, numberOfChannels: chans.length, sampleRate: sr }); }
    catch (e) { b = (Sound.ctx || new OfflineAudioContext(1, 1, sr)).createBuffer(chans.length, len, sr); }
    chans.forEach((c, i) => { if (b.copyToChannel) b.copyToChannel(c, i); else b.getChannelData(i).set(c); });
    return b;
  },

  // ----- instrument makers -----
  // Hot loops live in small functions so the JS engine optimises them.
  // out[i0..i1) += amp * table read, cross-fading table ta -> tb with weight w0 -> w1;
  // the phase comes from an integer accumulator (acc/L cycles), so loops are exact.
  _tabLoop(out, i0, i1, ta, tb, w0, w1, c, L, acc, ph0, amp) {
    const N = this.TAB, dw = i1 > i0 ? (w1 - w0) / (i1 - i0) : 0;
    let w = w0;
    for (let i = i0; i < i1; i++) {
      let ph = acc / L + ph0; ph -= Math.floor(ph);
      const x = ph * N, j = x | 0, f = x - j;
      const b = tb[j] + f * (tb[j + 1] - tb[j]);
      out[i] += amp * (w >= 1 ? b : (1 - w) * (ta[j] + f * (ta[j + 1] - ta[j])) + w * b);
      acc += c; if (acc >= L) acc -= L;
      w += dw;
    }
  },
  // 2-operator FM voice for sus(): the index falls from i0 to i1 during the attack A.
  _fmLoop(out, ia, ib, A, c, cm, L, acc, accm, ph0, amp, i0, i1) {
    const S = this.SIN, k2 = 1 / (2 * Math.PI);
    for (let i = ia; i < ib; i++) {
      const I = i < A ? i1 + (i0 - i1) * (1 - i / A) * (1 - i / A) : i1;
      let x = accm / L * 4096, j = x | 0;
      const m = S[j] + (x - j) * (S[j + 1] - S[j]);
      let ph = acc / L + ph0 + I * k2 * m; ph -= Math.floor(ph);
      x = ph * 4096; j = x | 0;
      out[i] += amp * (S[j] + (x - j) * (S[j + 1] - S[j]));
      acc += c; if (acc >= L) acc -= L;
      accm += cm; while (accm >= L) accm -= L;
    }
  },
  // Decaying sine by rotation (4 multiplies per sample).
  _rot(out, i0, n, zr, zi, cr, ci) {
    for (let i = i0; i < n; i++) { out[i] += zi; const t = zr * cr - zi * ci; zi = zr * ci + zi * cr; zr = t; }
  },
  // The two loops above in pieces of CH samples (a yield after each piece), for sliced builds.
  CH: 8192,
  *_tabLoopG(out, i0, i1, ta, tb, w0, w1, c, L, acc, ph0, amp) {
    const dw = i1 > i0 ? (w1 - w0) / (i1 - i0) : 0;
    for (let a = i0; a < i1; a += this.CH) {
      const b = Math.min(i1, a + this.CH);
      this._tabLoop(out, a, b, ta, tb, w0 + dw * (a - i0), w0 + dw * (b - i0), c, L, (acc + (c * (a - i0)) % L) % L, ph0, amp);
      yield;
    }
  },
  *_fmLoopG(out, n, A, c, cm, L, acc, accm, ph0, amp, i0, i1) {
    for (let a = 0; a < n; a += this.CH) {
      this._fmLoop(out, a, Math.min(n, a + this.CH), A, c, cm, L, (acc + (c * a) % L) % L, (accm + (cm * a) % L) % L, ph0, amp, i0, i1);
      yield;
    }
  },
  // Sustained voice: attack, then an exactly periodic loop. o = {sr, loop (s), att (s),
  //   voices: [{harm(k, hz) -> amp, det (cents), ratio, amp, rphase, stages: [[t, harm]...]}
  //            or {fm: {ratio, i0, i1}, amp, det}],
  //   breath: {amp, f, q} (looping band-passed noise), chiff: {amp, dur, f, q} (attack noise)}
  // The loop is `loop` seconds; each voice's pitch is rounded to a whole number of cycles in
  // it, and the sample remembers its true root frequency (hz), so the engine stays in tune.
  // (sus, fmhit and metal are generators underneath: with SYNTH.lazy they hand back the
  // generator so the engine can build a sample a slice at a time; otherwise they finish at once)
  sus(root, r, o) { const g = this.susG(root, r, o); return this.lazy ? g : this.run(g); },
  *susG(root, r, o) {
    const sr = o.sr || this.SR, L = Math.round((o.loop || 0.5) * sr), A = Math.max(2, Math.round((o.att || 0.08) * sr));
    const c0 = Math.max(1, Math.round(midiHz(root) * L / sr)), hz = c0 * sr / L;
    const per = Math.ceil(sr / hz) + 2, n = A + per + L + 8;
    const out = new Float32Array(n), tabs = new Map();
    // one table per harmonic recipe, shared by the detuned copies of a voice (made at the root pitch)
    const tabOf = (h, rp) => {
      const key = h;
      if (!tabs.has(key)) tabs.set(key, this.table(k => h(k, k * hz), Math.floor(sr * 0.45 / hz), rp ? this.rng(this.hash("ph") + c0) : null));
      return tabs.get(key);
    };
    for (const v of o.voices) {
      const ratio = v.ratio || 1, det = v.det || 0, base = Math.round(c0 * ratio);
      let c = Math.round(c0 * ratio * Math.pow(2, det / 1200));
      if (det && c === base) c += det > 0 ? 1 : -1;
      const amp = v.amp == null ? 1 : v.amp, ph0 = r();
      const acc0 = ((-c * A) % L + L) % L;          // integer phase at sample 0: exact over the loop
      if (v.fm) { yield* this._fmLoopG(out, n, A, c, c * v.fm.ratio, L, acc0, ((-c * v.fm.ratio * A) % L + L) % L, ph0, amp, v.fm.i0, v.fm.i1); continue; }
      // with a high `ratio` the table must hold fewer harmonics (band limit at this voice's pitch)
      const h = ratio === 1 ? v.harm : (k, f) => (k * hz * ratio < sr * 0.45 ? v.harm(k, f * ratio) : 0);
      const tab = tabOf(h, v.rphase);
      const st = (v.stages || []).map(q => [Math.round(q[0] * sr), tabOf(q[1], v.rphase)]);
      if (!st.length) { yield* this._tabLoopG(out, 0, n, tab, tab, 1, 1, c, L, acc0, ph0, amp); continue; }
      // attack: cross-fade stage to stage, reaching the steady table at A
      st.push([A, tab]);
      if (st[0][0] > 0) this._tabLoop(out, 0, st[0][0], st[0][1], st[0][1], 1, 1, c, L, acc0, ph0, amp);
      for (let k = 0; k + 1 < st.length; k++) {
        const i0 = st[k][0], i1 = Math.max(i0, st[k + 1][0]);
        if (i1 > i0) this._tabLoop(out, i0, i1, st[k][1], st[k + 1][1], 0, 1, c, L, (acc0 + (c * i0) % L) % L, ph0, amp);
      }
      yield;
      yield* this._tabLoopG(out, A, n, tab, tab, 1, 1, c, L, 0, ph0, amp);
    }
    if (o.breath) {
      const b = o.breath, nz = this.svf(this.noise(L, r), "bp", b.f, b.q || 0.8, sr, true);
      yield;
      const k = b.amp / Math.max(1e-9, this.rms(nz, 0, L));
      for (let i = 0, j = ((-A) % L + L) % L; i < n; i++) { out[i] += k * nz[j]; if (++j === L) j = 0; }
      yield;
    }
    if (o.chiff) {
      const c = o.chiff, m = Math.min(A - 1, Math.round(c.dur * sr));
      const nz = this.svf(this.noise(m, r), "bp", c.f, c.q || 1.5, sr);
      const k = c.amp / Math.max(1e-9, this.rms(nz, 0, m));
      for (let i = 0; i < m; i++) { const t = i / m; out[i] += k * nz[i] * Math.sin(Math.PI * Math.min(1, t * 4)) * (1 - t) * (1 - t); }
    }
    // loop starts on an upward zero crossing inside the first period after the attack
    let ls = A;
    for (let i = A + 1; i < A + per; i++) if (out[i - 1] < 0 && out[i] >= 0) { ls = i; break; }
    return { data: out, sr, hz, loop: true, ls, le: ls + L };
  },
  // Plucked string (Karplus-Strong idea): noise circulating in a delay line whose loop
  // averages neighbours, so the highs die first. o = {sr, len, t60, bright 0..1, pick 0..0.5,
  // body: [[f, q, gain]...]}. The delay is a whole number of samples; hz is the true pitch.
  ks(root, r, o) { const g = this.ksG(root, r, o); return this.lazy ? g : this.run(g); },
  *ksG(root, r, o) {
    const sr = o.sr || this.SR, N = Math.max(2, Math.round(sr / midiHz(root) - 0.5)), hz = sr / (N + 0.5);
    const n = Math.round(o.len * sr), out = new Float32Array(n), d = new Float32Array(N);
    let lp = 0, mean = 0;
    const a = 0.08 + 0.92 * o.bright;
    for (let i = 0; i < N; i++) { lp += a * (r() * 2 - 1 - lp); d[i] = lp; }
    if (o.pick) {
      const P = Math.max(1, Math.round(N * o.pick)), c = d.slice();
      for (let i = 0; i < N; i++) d[i] = c[i] - 0.9 * c[(i + P) % N];
    }
    for (let i = 0; i < N; i++) mean += d[i] / N;
    for (let i = 0; i < N; i++) d[i] -= mean;
    const rho = Math.pow(0.001, 1 / (o.t60 * hz));
    let p = 0;
    for (let i = 0; i < n; i++) {
      const p1 = p + 1 === N ? 0 : p + 1;
      out[i] = d[p];
      d[p] = rho * 0.5 * (d[p] + d[p1]);
      p = p1;
    }
    yield;
    if (o.body) {
      const dry = out.slice();
      for (const [f, q, g] of o.body) {
        const bp = this.svf(dry.slice(), "bp", f, q, sr);
        for (let i = 0; i < n; i++) out[i] += g * bp[i];
        yield;
      }
    }
    this.fadeEnd(out, sr, 0.03);
    return { data: out, sr, hz, loop: false };
  },
  // Struck bar / plate / membrane: decaying sine partials [ratio, amp, t60] plus a short
  // mallet noise; o.drop bends the pitch down from (1 + drop) at the strike (membranes).
  modal(root, r, o) { const g = this.modalG(root, r, o); return this.lazy ? g : this.run(g); },
  *modalG(root, r, o) {
    const sr = o.sr || this.SR, hz = o.hz || midiHz(root), n = Math.round(o.len * sr), out = new Float32Array(n);
    for (const [ratio, amp, t60] of o.parts) {
      const f = hz * ratio;
      if (f > sr * 0.45) continue;
      const dec = Math.exp(-6.91 / (t60 * sr));
      if (o.drop) {
        // pitch falls from f*(1+drop) to f; table sine while it bends, then a rotation
        const S = this.SIN, dd = Math.exp(-1 / ((o.dropT || 0.05) * sr)), bendN = Math.min(n, Math.round((o.dropT || 0.05) * 7 * sr));
        let ph = 0, e = amp, d = o.drop, i = 0;
        for (; i < bendN; i++) {
          const x = ph * 4096, j = x | 0;
          out[i] += e * (S[j] + (x - j) * (S[j + 1] - S[j]));
          ph += f * (1 + d) / sr; ph -= Math.floor(ph); d *= dd; e *= dec;
        }
        const w = 2 * Math.PI * f / sr, cr = Math.cos(w) * dec, ci = Math.sin(w) * dec;
        this._rot(out, i, n, e * Math.cos(2 * Math.PI * ph), e * Math.sin(2 * Math.PI * ph), cr, ci);
      } else {
        const w = 2 * Math.PI * f / sr, cr = Math.cos(w) * dec, ci = Math.sin(w) * dec;
        this._rot(out, 0, n, amp, 0, cr, ci);
      }
      yield;
    }
    if (o.mallet) {
      const m = o.mallet, len = Math.min(n, Math.round(m.dur * 6 * sr));
      const nz = this.svf(this.noise(len, r), m.type || "lp", m.f, m.q || 0.7, sr);
      for (let i = 0; i < len; i++) out[i] += m.amp * nz[i] * Math.exp(-i / (m.dur * sr));
    }
    this.fadeEnd(out, sr, 0.03);
    return { data: out, sr, hz, loop: false };
  },
  // Two-operator FM strikes (bells, metal): pairs {c, m (ratios), i0 -> i1 index over ti s,
  // amp, t60}. Inharmonic m (3.5, 1.41) gives the bell's clangy partials.
  fmhit(root, r, o) { const g = this.fmhitG(root, r, o); return this.lazy ? g : this.run(g); },
  // One FM pair over samples i0..i1; st = {e, I, pc, pm} carries the running state between slices.
  _fmPair(out, i0, i1, st, fc, fmr, i1x, dec, idec) {
    const S = this.SIN, k2 = 1 / (2 * Math.PI);
    let e = st.e, I = st.I, pc = st.pc, pm = st.pm;
    for (let i = i0; i < i1; i++) {
      let x = pm * 4096, j = x | 0;
      const m = S[j] + (x - j) * (S[j + 1] - S[j]);
      let ph = pc + (i1x + I) * k2 * m; ph -= Math.floor(ph);
      x = ph * 4096; j = x | 0;
      out[i] += e * (S[j] + (x - j) * (S[j + 1] - S[j]));
      pc += fc; if (pc >= 1) pc -= 1;
      pm += fmr; if (pm >= 1) pm -= 1;
      e *= dec; I *= idec;
    }
    st.e = e; st.I = I; st.pc = pc; st.pm = pm;
  },
  *fmhitG(root, r, o) {
    const sr = o.sr || this.SR, hz = midiHz(root), n = Math.round(o.len * sr), out = new Float32Array(n);
    for (const p of o.pairs) {
      const fc = hz * p.c / sr, fmr = hz * p.m / sr, dec = Math.exp(-6.91 / (p.t60 * sr));
      const idec = Math.exp(-1 / (p.ti * sr)), st = { e: p.amp, I: p.i0 - p.i1, pc: 0, pm: 0 };
      for (let i = 0; i < n; i += 12000) { this._fmPair(out, i, Math.min(n, i + 12000), st, fc, fmr, p.i1, dec, idec); yield; }
    }
    if (o.mallet) {
      const m = o.mallet, len = Math.min(n, Math.round(m.dur * 6 * sr));
      const nz = this.svf(this.noise(len, r), "bp", m.f, 1, sr);
      for (let i = 0; i < len; i++) out[i] += m.amp * nz[i] * Math.exp(-i / (m.dur * sr));
    }
    this.fadeEnd(out, sr, 0.04);
    return { data: out, sr, hz, loop: false };
  },
  // Metallic cluster (hats, cymbals): square partials at inharmonic frequencies + noise,
  // band-limited by filters, with an exponential decay (tau s) after a short attack.
  metal(r, o) { const g = this.metalG(r, o); return this.lazy ? g : this.run(g); },
  *metalG(r, o) {
    const sr = o.sr || this.SR, n = Math.round(o.len * sr), out = new Float32Array(n);
    for (const f of o.freqs) {
      const w = f / sr; let ph = r();
      for (let a = 0; a < n; a += 16384) {
        for (let i = a, e = Math.min(n, a + 16384); i < e; i++) { out[i] += ph < 0.5 ? 0.25 : -0.25; ph += w; if (ph >= 1) ph -= 1; }
        yield;
      }
    }
    for (let i = 0; i < n; i++) out[i] += o.noise * (r() * 2 - 1);
    yield;
    this.svf(out, "bp", o.bp, o.q || 0.7, sr);
    yield;
    this.svf(out, "hp", o.hp, 0.7, sr);
    yield;
    const at = Math.max(1, Math.round((o.att || 0.001) * sr)), kd = Math.exp(-1 / (o.tau * sr));
    for (let i = 0, e = 1; i < n; i++, e *= kd) out[i] *= Math.min(1, i / at) * e;
    yield;
    this.fadeEnd(out, sr, 0.02);
    return { data: out, sr, hz: 440, loop: false };
  },
  fadeEnd(x, sr, sec) { const m = Math.min(x.length, Math.round(sec * sr)); for (let i = 0; i < m; i++) x[x.length - 1 - i] *= i / m; },

  // ----- the instrument set -----
  // kind: "sus" (attack + loop; note length = gate), "one" (rings out; `ring` s minimum),
  // "drum" (a kit hit; also playable as a pitched one-shot). env [attack, decay, sustain,
  // release] in s / level; vib [cents, Hz, delay s] used by `~` or a channel's vib: true;
  // lp [base Hz, octaves added at full velocity] = per-note low-pass that opens with velocity;
  // gain = level trim in dB after the automatic sample normalisation.
  INST: {
    flute: {
      kind: "sus", roots: [67, 79, 91], range: [60, 98], env: [0.05, 0.3, 0.85, 0.14], vib: [14, 5.2, 0.28], gain: 0,
      about: "soft wooden flute, a little breath and a chiff at the start", uses: "field/village melodies, calm counter-lines, doubling a lead an octave up",
      make(S, root, r) {
        const p = root >= 84 ? 0.5 : 1;
        return S.sus(root, r, { loop: 0.5, att: 0.09,
          voices: [{ harm: (k, f) => (k === 1 ? 1 : k === 2 ? 0.3 * p : k === 3 ? 0.13 * p : 0.07 * p / ((k - 2) * (k - 2))) * S.lpS(f, 6500, 2),
            stages: [[0, (k, f) => (k === 1 ? 0.6 : k === 2 ? 0.5 : k === 3 ? 0.3 : 0.1 / k) * S.lpS(f, 7000, 2)]] }],
          breath: { amp: 0.05, f: 2600, q: 0.6 }, chiff: { amp: 0.28, dur: 0.05, f: Math.min(9000, 3 * midiHz(root)), q: 1.5 } });
      },
    },
    altoflute: {
      kind: "sus", roots: [60, 72], range: [53, 84], env: [0.07, 0.35, 0.85, 0.2], vib: [12, 4.8, 0.32], gain: 0,
      about: "dark, airy low flute with more breath", uses: "ice and night moods, slow melodies, mysterious rooms",
      make(S, root, r) {
        return S.sus(root, r, { loop: 0.5, att: 0.11,
          voices: [{ harm: (k, f) => (k === 1 ? 1 : k === 2 ? 0.17 : k === 3 ? 0.06 : 0.02 / k) * S.lpS(f, 4200, 2),
            stages: [[0, (k, f) => (k === 1 ? 0.7 : k === 2 ? 0.35 : 0.08 / k) * S.lpS(f, 5000, 2)]] }],
          breath: { amp: 0.09, f: 1900, q: 0.6 }, chiff: { amp: 0.18, dur: 0.06, f: 2 * midiHz(root) + 800, q: 1.2 } });
      },
    },
    oboe: {
      kind: "sus", roots: [62, 74, 86], range: [57, 91], env: [0.03, 0.25, 0.9, 0.09], vib: [16, 5.6, 0.22], gain: -1,
      about: "nasal double-reed tone (formants near 1.1 and 2.8 kHz)", uses: "plaintive solos, desert and root-cave colour, counter-melodies that must cut through",
      make(S, root, r) {
        const h = (k, f) => (k === 1 ? 0.45 : Math.pow(k, -0.8)) * S.fmt(f, 1150, 280, 5) * S.fmt(f, 2900, 550, 2.5) * S.lpS(f, 5200, 2);
        return S.sus(root, r, { loop: 0.4, att: 0.06,
          voices: [{ harm: h, stages: [[0, (k, f) => h(k, f) * S.lpS(f, 1400, 1)]] }],
          breath: { amp: 0.018, f: 3200, q: 0.9 }, chiff: { amp: 0.12, dur: 0.03, f: 2400, q: 1 } });
      },
    },
    ocarina: {
      kind: "sus", roots: [69, 81], range: [60, 93], env: [0.04, 0.25, 0.9, 0.1], vib: [10, 5, 0.3], gain: 0,
      about: "round clay-whistle tone, nearly pure with a soft breath", uses: "gentle lullaby-like lines, village, memories",
      make(S, root, r) {
        return S.sus(root, r, { loop: 0.5, att: 0.07,
          voices: [{ harm: k => (k === 1 ? 1 : k === 2 ? 0.05 : k === 3 ? 0.07 : k === 5 ? 0.012 : 0) }],
          breath: { amp: 0.07, f: 1600, q: 0.7 }, chiff: { amp: 0.12, dur: 0.04, f: 2200, q: 1.2 } });
      },
    },
    brass: {
      kind: "sus", roots: [48, 60, 70], range: [41, 79], env: [0.04, 0.3, 0.8, 0.16], vib: [9, 5.2, 0.35], lp: [1500, 2.3], gain: 1,
      about: "brass section (three players, slightly detuned), dark attack that brightens", uses: "heroic field melody, boss stabs, fanfares, chords",
      make(S, root, r) {
        const h = (k, f) => (1 / k) * S.lpS(f, 2400, 2) * S.fmt(f, 1200, 500, 1.5);
        const dark = (k, f) => (1 / k) * S.lpS(f, 700, 2);
        const bright = (k, f) => (1 / k) * S.lpS(f, 4200, 2) * S.fmt(f, 1400, 600, 2);
        return S.sus(root, r, { sr: 24000, loop: 1, att: 0.14, voices: [-8, 0, 7].map((d, i) => ({ harm: h, det: d, amp: i === 1 ? 0.5 : 0.4, rphase: true, stages: [[0, dark], [0.04, bright]] })),
          chiff: { amp: 0.04, dur: 0.03, f: 1200, q: 1 } });
      },
    },
    horn: {
      kind: "sus", roots: [46, 58, 68], range: [38, 75], env: [0.07, 0.35, 0.85, 0.22], vib: [8, 4.8, 0.4], lp: [900, 2], gain: 1,
      about: "mellow French-horn-like tone, round and warm", uses: "noble held notes, inner harmony, title and ending",
      make(S, root, r) {
        const h = (k, f) => (1 / k) * S.lpS(f, 850, 2) * S.fmt(f, 420, 200, 1.5);
        return S.sus(root, r, { sr: 16000, loop: 1, att: 0.14, voices: [-4, 4].map(d => ({ harm: h, det: d, amp: 0.6, rphase: true, stages: [[0, (k, f) => (1 / k) * S.lpS(f, 380, 2)]] })) });
      },
    },
    trumpet: {
      kind: "sus", roots: [62, 74, 83], range: [55, 88], env: [0.02, 0.22, 0.85, 0.11], vib: [14, 5.6, 0.3], lp: [2200, 1.8], gain: 0,
      about: "solo trumpet, bright with a quick 'blat' at the attack", uses: "calls and fanfares, heroic lead, boss motifs",
      make(S, root, r) {
        const h = (k, f) => Math.pow(k, -0.85) * S.fmt(f, 1300, 450, 3) * S.lpS(f, 4500, 2);
        return S.sus(root, r, { loop: 0.5, att: 0.1, voices: [{ harm: h, rphase: true,
          stages: [[0, (k, f) => (1 / k) * S.lpS(f, 600, 2)], [0.03, (k, f) => Math.pow(k, -0.7) * S.fmt(f, 1500, 600, 4) * S.lpS(f, 7000, 2)]] }],
          chiff: { amp: 0.05, dur: 0.02, f: 1800, q: 1 } });
      },
    },
    strings: {
      kind: "sus", roots: [47, 62, 77], range: [36, 88], env: [0.18, 0.4, 0.9, 0.35], vib: [8, 5, 0.4], lp: [1800, 1.5], gain: 0,
      about: "string ensemble pad (five detuned bowed voices)", uses: "harmony bed under everything, swells, sad or grand chords",
      make(S, root, r) {
        const h = (k, f) => (1 / k) * S.lpS(f, 3200, 1.5) * S.fmt(f, 500, 250, 1.2) * S.fmt(f, 1600, 700, 0.8);
        return S.sus(root, r, { sr: 24000, loop: 1, att: 0.05, voices: [-11, -4, 0, 5, 12].map(d => ({ harm: h, det: d, amp: 0.35, rphase: true })),
          breath: { amp: 0.012, f: 3000, q: 0.7 } });
      },
    },
    choir: {
      kind: "sus", roots: [50, 62, 72], range: [43, 79], env: [0.25, 0.5, 0.9, 0.4], vib: [10, 4.6, 0.35], gain: 0,
      about: "wordless 'ah' choir (vowel formants, five voices)", uses: "title hymn, sacred rooms, final keep, the Sunstone motif",
      make(S, root, r) {
        const h = (k, f) => Math.pow(k, -1.1) * S.fmt(f, 750, 110, 12) * S.fmt(f, 1200, 140, 7) * S.fmt(f, 2600, 220, 3.5) * S.fmt(f, 3400, 300, 1.5) * S.lpS(f, 4500, 2);
        return S.sus(root, r, { sr: 24000, loop: 1, att: 0.05, voices: [-9, -3, 0, 3, 9].map(d => ({ harm: h, det: d, amp: 0.3, rphase: true })),
          breath: { amp: 0.03, f: 1100, q: 0.8 } });
      },
    },
    glass: {
      kind: "sus", roots: [67, 84], range: [55, 96], env: [0.12, 0.8, 0.7, 0.6], vib: [5, 3.5, 0.6], gain: -1,
      about: "glassy, hollow pad with a soft ting at the start", uses: "ice dungeon, magic, dreams, sparkle over strings",
      make(S, root, r) {
        const odd = k => (k === 1 ? 1 : k === 2 ? 0.2 : k === 3 ? 0.32 : k === 5 ? 0.18 : k === 7 ? 0.07 : 0);
        return S.sus(root, r, { loop: 1, att: 0.1, voices: [
          { harm: odd, stages: [[0, k => odd(k) + (k === 9 ? 0.35 : k === 11 ? 0.25 : k === 13 ? 0.12 : 0)]] },
          { harm: k => (k === 1 ? 1 : k === 3 ? 0.2 : 0), ratio: 2, det: 6, amp: 0.35 },
          { harm: k => (k === 1 ? 1 : 0), ratio: 3, det: -5, amp: 0.12 }] });
      },
    },
    organ: {
      kind: "sus", roots: [48, 64, 80], range: [36, 96], env: [0.01, 0.1, 1, 0.07], vib: [0, 5, 0], gain: -1,
      about: "pipe/drawbar organ with a key click, steady (no vibrato)", uses: "graveyard and keep, fire dungeon B section, hymns",
      make(S, root, r) {
        const bars = { 1: 1, 2: 0.7, 3: 0.45, 4: 0.35, 6: 0.2, 8: 0.16, 10: 0.05, 12: 0.05 };
        return S.sus(root, r, { sr: 24000, loop: 1, att: 0.03, voices: [
          { harm: (k, f) => (bars[k] || 0) * S.lpS(f, 7000, 2) },
          { harm: (k, f) => (k === 1 ? 1 : k === 2 ? 0.5 : 0), det: 4, amp: 0.25 }],
          chiff: { amp: 0.15, dur: 0.008, f: 3000, q: 0.7 } });
      },
    },
    square: {
      kind: "sus", roots: [48, 66, 84], range: [36, 96], env: [0.004, 0.2, 0.75, 0.05], vib: [18, 6, 0.25], gain: -4,
      about: "plain 50% square wave - a deliberate 8-bit colour", uses: "nostalgic echoes, credits, a chip line on purpose (never the default lead)",
      make(S, root, r) { return S.sus(root, r, { loop: 0.05, att: 0.01, voices: [{ harm: k => (k % 2 ? 1 / k : 0) }] }); },
    },
    pulse25: {
      kind: "sus", roots: [48, 66, 84], range: [36, 96], env: [0.004, 0.2, 0.75, 0.05], vib: [18, 6, 0.25], gain: -4,
      about: "25% pulse wave (thinner, reedier chip tone)", uses: "retro colour, arpeggio sparkle",
      make(S, root, r) { return S.sus(root, r, { loop: 0.05, att: 0.01, voices: [{ harm: k => Math.sin(Math.PI * k * 0.25) / k }] }); },
    },
    pulse12: {
      kind: "sus", roots: [48, 66, 84], range: [36, 96], env: [0.004, 0.2, 0.75, 0.05], vib: [18, 6, 0.25], gain: -4,
      about: "12.5% pulse wave (thin, buzzy chip tone)", uses: "retro colour, tiny echo lines",
      make(S, root, r) { return S.sus(root, r, { loop: 0.05, att: 0.01, voices: [{ harm: k => Math.sin(Math.PI * k * 0.125) / k }] }); },
    },
    triangle: {
      kind: "sus", roots: [40, 58, 76], range: [28, 88], env: [0.004, 0.2, 0.9, 0.05], vib: [12, 6, 0.3], gain: -1,
      about: "triangle wave (soft, hollow chip bass/flute)", uses: "retro bass colour, soft high whistles",
      make(S, root, r) { return S.sus(root, r, { loop: 0.05, att: 0.01, voices: [{ harm: k => (k % 2 ? ((k - 1) / 2 % 2 ? -1 : 1) / (k * k) : 0) }] }); },
    },
    sub: {
      // review r1 S4: 3 dB lower (gain -1 -> -4) and a little more 2nd/3rd harmonic, so the
      // fundamental no longer rules the 40-55 Hz band and laptops keep more of the line
      kind: "sus", roots: [31, 43], range: [24, 55], env: [0.01, 0.3, 0.9, 0.08], vib: [0, 5, 0], gain: -4,
      about: "sub bass: sine with a little 2nd/3rd harmonic so small speakers still show it", uses: "under a picked bass, drones, final boss pedal",
      make(S, root, r) { return S.sus(root, r, { sr: 16000, loop: 0.25, att: 0.02, voices: [{ harm: k => (k === 1 ? 1 : k === 2 ? 0.35 : k === 3 ? 0.16 : k === 4 ? 0.05 : 0) }] }); },
    },
    fmbass: {
      kind: "sus", roots: [36, 48], range: [28, 62], env: [0.004, 0.6, 0.6, 0.08], vib: [0, 5, 0], gain: 1,
      about: "FM bass: bright growling attack that settles into a round tone", uses: "fire dungeon, boss drive, punchy 8th-note lines",
      make(S, root, r) { return S.sus(root, r, { sr: 24000, loop: 0.5, att: 0.35, voices: [{ fm: { ratio: 1, i0: 3.4, i1: 0.9 }, amp: 0.8 }, { harm: k => (k === 1 ? 1 : 0), amp: 0.45 }] }); },
    },
    harp: {
      kind: "one", roots: [48, 64, 80], range: [36, 96], env: [0.002, 0, 1, 0.3], ring: 1.2, gain: 0,
      about: "concert harp pluck (rings over the next notes)", uses: "arpeggios, village, title, ice, chord spreads",
      make(S, root, r) { const i = root < 56 ? 0 : root < 72 ? 1 : 2; return S.ks(root, r, { sr: i < 2 ? 24000 : 32000, len: [1.6, 1.3, 0.9][i], t60: [3.2, 2.2, 1.4][i], bright: 0.45, pick: 0.13, body: [[230, 1.2, 0.25]] }); },
    },
    guitar: {
      kind: "one", roots: [50, 64, 76], range: [40, 86], env: [0.002, 0, 1, 0.2], ring: 0.8, gain: 0,
      about: "plucked guitar-like string with a small wooden body", uses: "village, desert (with oboe), rhythm strums (write chords)",
      make(S, root, r) { const i = root < 57 ? 0 : root < 70 ? 1 : 2; return S.ks(root, r, { sr: 24000, len: [1.3, 1.1, 0.9][i], t60: [2.4, 1.9, 1.4][i], bright: 0.72, pick: 0.2, body: [[105, 2, 0.45], [230, 2.5, 0.3], [410, 2, 0.12]] }); },
    },
    pizz: {
      kind: "one", roots: [50, 67], range: [40, 86], env: [0.002, 0, 1, 0.12], ring: 0.3, gain: 0,
      about: "pizzicato strings (short plucked violin/cello)", uses: "sneaky or spooky figures, playful village bass, graveyard",
      make(S, root, r) { return S.ks(root, r, { len: 0.55, t60: 0.5, bright: 0.5, pick: 0.15, body: [[480, 1.5, 0.5], [1100, 2, 0.25]] }); },
    },
    pickbass: {
      kind: "one", roots: [36, 48], range: [28, 62], env: [0.002, 0, 1, 0.12], ring: 0.5, gain: 1,
      about: "picked electric-style bass string", uses: "walking bass in the field, driving 8ths in dungeons",
      make(S, root, r) { return S.ks(root, r, { sr: 16000, len: 1.4, t60: 3, bright: 0.38, pick: 0.25, body: [[90, 1.5, 0.3]] }); },
    },
    marimba: {
      kind: "one", roots: [57, 72, 86], range: [45, 96], env: [0.001, 0, 1, 0.15], ring: 0.4, gain: 0,
      about: "wooden bar with tube resonance (tuned 1:4 overtone)", uses: "water cave, playful ostinati, soft pulses",
      make(S, root, r) {
        const t = Math.min(1.3, 1.0 * Math.sqrt(262 / midiHz(root)));
        return S.modal(root, r, { len: Math.min(1.1, t * 1.1), parts: [[1, 1, t], [3.98, 0.28, t * 0.22], [9.1, 0.07, t * 0.08]], mallet: { amp: 0.25, dur: 0.003, f: 2500 } });
      },
    },
    celesta: {
      kind: "one", roots: [72, 88], range: [60, 108], env: [0.001, 0, 1, 0.3], ring: 0.9, gain: 0,
      about: "celesta: soft struck metal plates, bell-like but gentle", uses: "ice, magic, the Sunstone voice scenes, lullabies",
      make(S, root, r) { return S.modal(root, r, { len: root > 80 ? 1.0 : 1.3, parts: [[1, 1, 1.6], [2, 0.12, 0.9], [4.1, 0.16, 0.35], [10.2, 0.05, 0.08]], mallet: { amp: 0.15, dur: 0.002, f: 4000 } }); },
    },
    musicbox: {
      kind: "one", roots: [79, 96], range: [67, 108], env: [0.001, 0, 1, 0.3], ring: 0.8, gain: 0,
      about: "music-box comb tine: bright pluck, thin sustain", uses: "game over, memories, a fragile motif",
      make(S, root, r) { return S.modal(root, r, { len: root > 88 ? 0.8 : 1.1, parts: [[1, 1, 1.3], [1.0035, 0.3, 1.0], [2, 0.06, 0.9], [5.35, 0.24, 0.22], [8.96, 0.1, 0.08], [13.2, 0.04, 0.04]], mallet: { amp: 0.3, dur: 0.0008, f: 6000, type: "hp" } }); },
    },
    glock: {
      kind: "one", roots: [84, 98], range: [72, 108], env: [0.001, 0, 1, 0.35], ring: 1, gain: -1,
      about: "glockenspiel: hard mallet on steel bars, long bright ring", uses: "ice colour in the boss track, sparkle doubling, pickups",
      make(S, root, r) { return S.modal(root, r, { len: root > 90 ? 0.9 : 1.2, parts: [[1, 1, 2.0], [2.76, 0.3, 0.55], [5.4, 0.18, 0.25], [8.93, 0.08, 0.1]], mallet: { amp: 0.35, dur: 0.001, f: 7000, type: "hp" } }); },
    },
    bells: {
      kind: "one", roots: [57, 72], range: [48, 88], env: [0.001, 0, 1, 0.6], ring: 2, gain: -1,
      about: "FM tubular bells: clangy strike, long humming tail", uses: "graveyard tolls, the six shards, ceremonies, dungeon entries",
      make(S, root, r) {
        return S.fmhit(root, r, { sr: 24000, len: root < 64 ? 2.6 : 2.0, pairs: [
          { c: 1, m: 3.5, i0: 4.2, i1: 0.6, ti: 0.45, amp: 1, t60: 3.2 },
          { c: 2, m: 1.41, i0: 2.0, i1: 0.3, ti: 0.3, amp: 0.3, t60: 1.6 },
          { c: 0.5, m: 1, i0: 0.3, i1: 0, ti: 1, amp: 0.22, t60: 3.5 }], mallet: { amp: 0.15, dur: 0.002, f: 3000 } });
      },
    },
    timpani: {
      kind: "one", roots: [43, 53], range: [36, 60], env: [0.001, 0, 1, 0.5], ring: 1.2, gain: 1,
      about: "timpani: tuned kettle drum with a soft felt stick", uses: "accents on 1, rolls (write 32nds), boss and fanfare weight",
      *make(S, root, r) {
        const o = yield* S.modalG(root, r, { sr: 16000, len: root < 48 ? 2.0 : 1.6, drop: 0.03, dropT: 0.08,
          parts: [[1, 1, 2.2], [1.5, 0.55, 1.5], [1.98, 0.3, 1.1], [2.44, 0.16, 0.8], [2.9, 0.08, 0.5]], mallet: { amp: 0.4, dur: 0.012, f: 1800 } });
        const x = o.data, w = 2 * Math.PI * midiHz(root) * 0.75 / 16000;
        for (let i = 0; i < Math.min(x.length, 6000); i++) x[i] += 0.3 * Math.sin(w * i) * Math.exp(-i / 950);
        return o;
      },
    },
    // ----- drum kit (letters in drum channels: see SONG.KIT in engine.js) -----
    kick: { kind: "drum", roots: [33], gain: 0, about: "kick drum: fast falling thump + click", uses: "K",
      *make(S, root, r) {
        const sr = 32000, n = 0.5 * sr, x = new Float32Array(n), d1 = Math.exp(-1 / (0.028 * sr)), d2 = Math.exp(-1 / (0.004 * sr)), de = Math.exp(-1 / (0.13 * sr)), hold = 0.01 * sr;
        let ph = 0, a1 = 115, a2 = 60, env = 1;
        for (let i = 0; i < n; i++) {
          ph += (50 + a1 + a2) / sr; ph -= Math.floor(ph); a1 *= d1; a2 *= d2;
          x[i] = S.sin1(ph) * env;
          if (i >= hold) env *= de;
          if ((i & 4095) === 4095) yield;
        }
        yield;
        for (let i = 0; i < 0.003 * sr; i++) x[i] += 0.5 * (r() * 2 - 1) * (1 - i / (0.003 * sr));
        for (let i = 0; i < n; i++) x[i] = Math.tanh(1.8 * x[i]) / Math.tanh(1.8);
        S.fadeEnd(x, sr, 0.02);
        return { data: x, sr, hz: 55, loop: false };
      } },
    snare: { kind: "drum", roots: [50], gain: 0, about: "snare: two drum-head tones + bright snare-wire noise", uses: "S",
      *make(S, root, r) {
        const o = yield* S.modalG(root, r, { hz: 185, len: 0.35, drop: 0.15, dropT: 0.01, parts: [[1, 0.7, 0.12], [1.78, 0.45, 0.08]] }), x = o.data, sr = o.sr;
        const nz = S.svf(S.svf(S.noise(x.length, r), "hp", 1400, 0.7, sr), "bp", 5200, 0.5, sr);
        for (let i = 0; i < x.length; i++) x[i] += 1.4 * nz[i] * Math.exp(-i / (0.075 * sr));
        return o;
      } },
    rim: { kind: "drum", roots: [72], gain: -3, about: "rim click / side stick: short woody knock", uses: "R",
      make(S, root, r) { return S.modal(root, r, { hz: 520, len: 0.12, parts: [[1, 0.8, 0.05], [3.37, 0.5, 0.03], [5.1, 0.2, 0.02]], mallet: { amp: 0.6, dur: 0.0008, f: 5000, type: "hp" } }); } },
    hat: { kind: "drum", roots: [96], gain: -6, choke: "hat", about: "closed hi-hat", uses: "H",
      make(S, root, r) { return S.metal(r, { len: 0.12, freqs: [317, 419, 551, 623, 811, 1029], noise: 0.35, bp: 9000, q: 0.8, hp: 6500, tau: 0.02 }); } },
    ohat: { kind: "drum", roots: [96], gain: -7, choke: "hat", about: "open hi-hat (a closed hat cuts it off)", uses: "O",
      make(S, root, r) { return S.metal(r, { len: 0.6, freqs: [317, 419, 551, 623, 811, 1029], noise: 0.35, bp: 8500, q: 0.7, hp: 6000, att: 0.003, tau: 0.16 }); } },
    crash: { kind: "drum", roots: [96], gain: -5, about: "crash cymbal, long wash", uses: "C",
      make(S, root, r) { return S.metal(r, { len: 1.8, freqs: [263, 377, 441, 593, 707, 853, 1013, 1231], noise: 0.6, bp: 7000, q: 0.5, hp: 3500, att: 0.004, tau: 0.42 }); } },
    tomlo: { kind: "drum", roots: [43], gain: 0, about: "low tom", uses: "L",
      make(S, root, r) { return S.modal(root, r, { hz: 92, len: 0.6, drop: 0.3, dropT: 0.05, parts: [[1, 1, 0.5], [1.51, 0.35, 0.3], [2.03, 0.12, 0.2]], mallet: { amp: 0.3, dur: 0.004, f: 1500 } }); } },
    tommid: { kind: "drum", roots: [48], gain: 0, about: "middle tom", uses: "M",
      make(S, root, r) { return S.modal(root, r, { hz: 130, len: 0.5, drop: 0.3, dropT: 0.045, parts: [[1, 1, 0.42], [1.51, 0.35, 0.25], [2.03, 0.12, 0.17]], mallet: { amp: 0.3, dur: 0.004, f: 1800 } }); } },
    tomhi: { kind: "drum", roots: [53], gain: 0, about: "high tom", uses: "T",
      make(S, root, r) { return S.modal(root, r, { hz: 182, len: 0.45, drop: 0.3, dropT: 0.04, parts: [[1, 1, 0.36], [1.51, 0.35, 0.22], [2.03, 0.12, 0.15]], mallet: { amp: 0.3, dur: 0.004, f: 2200 } }); } },
    shaker: { kind: "drum", roots: [96], gain: -6, about: "shaker: a short swish of grains", uses: "Z",
      make(S, root, r) {
        const sr = 32000, n = Math.round(0.15 * sr), x = S.svf(S.svf(S.noise(n, r), "bp", 6200, 1.2, sr), "hp", 3000, 0.7, sr);
        for (let i = 0; i < n; i++) { const t = i / sr; x[i] *= (t < 0.025 ? t / 0.025 : Math.exp(-(t - 0.025) / 0.028)); }
        return { data: x, sr, hz: 440, loop: false };
      } },
    sleigh: { kind: "drum", roots: [96], gain: -4, about: "sleigh bells: a cluster of tiny jingles", uses: "J",
      *make(S, root, r) {
        const sr = 32000, n = Math.round(0.5 * sr), x = new Float32Array(n);
        for (let b = 0; b < 12; b++) {
          if (b % 4 === 3) yield;
          const on = Math.round(r() * 0.035 * sr), f = 3400 + r() * 3600, t60 = 0.1 + r() * 0.15, a = 0.4 + r() * 0.6;
          for (const [ratio, g] of [[1, 1], [1.43, 0.5]]) {
            const w = 2 * Math.PI * f * ratio / sr, dec = Math.exp(-6.91 / (t60 * sr)), cr = Math.cos(w) * dec, ci = Math.sin(w) * dec;
            S._rot(x, on, n, a * g, 0, cr, ci);
          }
        }
        const nz = S.svf(S.noise(n, r), "hp", 7000, 0.7, sr);
        for (let i = 0; i < n; i++) x[i] += 0.5 * nz[i] * Math.exp(-i / (0.05 * sr));
        S.fadeEnd(x, sr, 0.03);
        return { data: x, sr, hz: 440, loop: false };
      } },
    anvil: { kind: "drum", roots: [86], gain: -3, about: "anvil strike: bright ringing metal clang", uses: "A (also as a pitched one-shot in fire tracks)",
      make(S, root, r) { return S.modal(root, r, { hz: midiHz(root) * 1.0, len: 1.1, parts: [[1, 1, 1.3], [2.41, 0.55, 0.9], [3.93, 0.45, 0.6], [5.87, 0.3, 0.35], [8.13, 0.2, 0.2]], mallet: { amp: 0.5, dur: 0.001, f: 4000, type: "bp", q: 1 } }); } },
    handlo: { kind: "drum", roots: [43], gain: 0, about: "low hand drum: deep open palm stroke", uses: "D",
      make(S, root, r) { return S.modal(root, r, { hz: 96, len: 0.45, drop: 0.5, dropT: 0.02, parts: [[1, 1, 0.35], [1.58, 0.3, 0.2], [2.3, 0.1, 0.1]], mallet: { amp: 0.35, dur: 0.008, f: 600 } }); } },
    handhi: { kind: "drum", roots: [64], gain: -1, about: "high hand drum: sharp rim slap", uses: "E",
      make(S, root, r) { return S.modal(root, r, { hz: 330, len: 0.25, drop: 0.1, dropT: 0.01, parts: [[1, 0.6, 0.12], [1.62, 0.5, 0.08], [2.7, 0.3, 0.05]], mallet: { amp: 0.9, dur: 0.008, f: 2500, type: "bp", q: 1 } }); } },
    clap: { kind: "drum", roots: [60], gain: -2, about: "hand clap (three quick bursts and a short tail)", uses: "X",
      make(S, root, r) {
        const sr = 32000, n = Math.round(0.35 * sr), x = S.svf(S.svf(S.noise(n, r), "bp", 1150, 1.3, sr), "hp", 600, 0.7, sr);
        for (let i = 0; i < n; i++) {
          const t = i / sr; let e = 0;
          for (const s of [0, 0.009, 0.019]) if (t >= s && t < s + 0.012) e = Math.max(e, Math.exp(-(t - s) / 0.004));
          if (t >= 0.03) e = Math.max(e, Math.exp(-(t - 0.03) / 0.06));
          x[i] *= e;
        }
        return { data: x, sr, hz: 440, loop: false };
      } },
  },

  // ----- building and picking samples -----
  // Render one instrument's root samples (once; later calls return the cache). Samples are
  // normalised (sustained: loop RMS 0.18; one-shots: loudest 50 ms RMS 0.25) so every
  // instrument starts at a similar level; INST.gain then trims the balance.
  // The level is measured before the DC comes off, so the audible part keeps the level it
  // was balanced at; the DC fix only removes the offset.
  ensure(name) {
    if (this.smp[name]) return this.smp[name];
    const d = this.INST[name];
    if (!d) return null;
    for (let i = 0; i < d.roots.length; i++) this.buildRoot(name, i);
    return this.smp[name];
  },
  // Render the next root sample of an instrument; true when the instrument is complete.
  step(name) {
    if (this.smp[name]) return true;
    const d = this.INST[name];
    if (!d) return true;
    const rs = this.rs[name] || [];
    let i = 0;
    while (i < d.roots.length && rs[i]) i++;
    if (i < d.roots.length) this.buildRoot(name, i);
    return !!this.smp[name];
  },
  has(name, i) { const rs = this.rs[name]; return !!(rs && rs[i]); },
  // Build root sample i of an instrument. With a budget (ms) the work stops after about that
  // long (between two slices of at most ~1-2 ms) and goes on at the next call: false = not yet.
  // Every slice draws the same seeded random numbers in the same order, so a sample built in
  // slices is identical to one built at once.
  buildRoot(name, i, budget) {
    const d = this.INST[name];
    if (!d || i >= d.roots.length) return true;
    const rs = this.rs[name] || (this.rs[name] = []);
    if (rs[i]) return true;
    const t0 = performance.now(), key = name + "#" + i, over = () => budget != null && performance.now() - t0 >= budget;
    let job = this.jobs[key], s = null;
    if (!job) {
      this.lazy = budget != null;
      try { s = d.make(this, d.roots[i], this.rng(this.hash(name) + i * 977)); } finally { this.lazy = false; }
      if (s && typeof s.next === "function") { job = this.jobs[key] = { g: s, s: null }; s = null; }
    }
    if (job) {
      while (!job.s) {
        const st = job.g.next();
        if (st.done) job.s = st.value;
        else if (over()) { this.buildMs += performance.now() - t0; return false; }
      }
      // levelling, DC and the buffer (1-2 ms for a long sample) wait for the next call if the time is up
      if (over()) { this.buildMs += performance.now() - t0; return false; }
      s = job.s; delete this.jobs[key];
    }
    const lvl = s.loop ? this.rms(s.data, s.ls, s.le) : this.peakWin(s.data, s.sr);
    const k = (s.loop ? 0.18 : 0.25) / Math.max(1e-9, lvl);
    // a loop is never played past its end (the source jumps back to ls), so keep only 8 samples
    // of the wrap-around copy after le (enough for interpolation); the rest was a partial period
    // that held memory and made the whole-buffer mean look like DC
    if (s.loop && s.data.length > s.le + 8) s.data = s.data.slice(0, s.le + 8);
    this.dcFix(s);
    for (let j = 0; j < s.data.length; j++) s.data[j] *= k;
    const buf = this.mkbuf([s.data], s.sr);
    this.bytes += s.data.length * 4;
    rs[i] = { buf, sr: s.sr, hz: s.hz, root: d.roots[i], loop: s.loop, ls: s.loop ? s.ls / s.sr : 0, le: s.loop ? s.le / s.sr : 0, len: s.data.length };
    let all = true;
    for (let j = 0; j < d.roots.length; j++) if (!rs[j]) all = false;
    if (all) this.smp[name] = rs.slice();
    this.buildMs += performance.now() - t0;
    return true;
  },
  buildAll() { for (const n in this.INST) this.ensure(n); },
  // Index of the root sample nearest to a note (ties go to the lower root, so shifts are upward).
  rootIndex(name, midi) {
    const R = this.INST[name].roots;
    let b = 0;
    for (let i = 1; i < R.length; i++) if (Math.abs(midi - R[i]) < Math.abs(midi - R[b])) b = i;
    return b;
  },
  // The root sample for a note; only that root is built if it is missing (never the whole set).
  pick(name, midi) {
    if (!this.INST[name]) return null;
    const i = this.rootIndex(name, midi);
    if (!this.has(name, i)) this.buildRoot(name, i);
    return this.rs[name][i];
  },
  names(kind) { return Object.keys(this.INST).filter(n => !kind || this.INST[n].kind === kind); },

  // ----- effect renderer (SFX recipes -> buffers) -----
  // Loudness classes: the loudest 50 ms of every effect is scaled to its class level
  // (K-weighted, LUFS-like). Music sits near -20 LUFS integrated (M); see tools/sound_format.md.
  FX_SR: 22050,       // default rate of rendered effects (sr: 32000 or 44100 for crackle and glass)
  FXLEVEL: { critical: -14, big: -11, pickup: -16, world: -17, enemy: -20.5, ui: -21, confirm: -19, text: -24.5, loop: -24, jingle: -18 },
  fxLog: {},          // name -> {st50, peak, gainDb, capped, ms} of the last render (for AudioLab)

  // A parameter that may change over time: a number, [a, b, c] (spread evenly over dur) or
  // [[t, v], [t, v], ...]. expo = interpolate in ratios (for frequencies).
  curve(p, dur, expo) {
    if (p == null) return null;
    if (typeof p === "number") return () => p;
    if (typeof p === "function") return p;
    let pts = p;
    if (!Array.isArray(p[0])) pts = p.map((v, i) => [p.length === 1 ? 0 : i * dur / (p.length - 1), v]);
    return t => {
      if (t <= pts[0][0]) return pts[0][1];
      for (let i = 1; i < pts.length; i++) {
        if (t < pts[i][0]) {
          const [t0, v0] = pts[i - 1], [t1, v1] = pts[i], w = (t - t0) / Math.max(1e-9, t1 - t0);
          return expo && v0 > 0 && v1 > 0 ? v0 * Math.pow(v1 / v0, w) : v0 + (v1 - v0) * w;
        }
      }
      return pts[pts.length - 1][1];
    };
  },
  // Amplitude envelope: linear attack a, hold h (with a `punch` overshoot), decay toward
  // sustain s (d = time to fall 60 dB of the way), release after the gate (r = 60 dB time).
  envFn(e, dur) {
    e = e || {};
    const a = e.a == null ? 0.002 : e.a, h = e.h || 0, d = e.d == null ? dur : e.d, s = e.s || 0, r = e.r == null ? 0.03 : e.r, pk = 1 + (e.punch || 0);
    const at = t => (t < a ? t / a : t < a + h ? pk : d > 0 ? s + (pk - s) * Math.exp(-6.91 * (t - a - h) / d) : s);
    const g = at(dur);
    return t => (t < dur ? at(t) : r > 0 ? g * Math.exp(-6.91 * (t - dur) / r) : 0);
  },
  // The same envelope applied to x in place, with running multiplies instead of exp().
  envApply(x, e, dur, sr) {
    e = e || {};
    const a = Math.max(1, Math.round((e.a == null ? 0.002 : e.a) * sr)), h = Math.round((e.h || 0) * sr), d = e.d == null ? dur : e.d;
    const s = e.s || 0, r = e.r == null ? 0.03 : e.r, pk = 1 + (e.punch || 0), gate = Math.round(dur * sr);
    const kd = d > 0 ? Math.exp(-6.91 / (d * sr)) : 0, kr = r > 0 ? Math.exp(-6.91 / (r * sr)) : 0;
    let ex = pk - s, v = 0;
    for (let i = 0; i < x.length; i++) {
      if (i < gate) {
        if (i < a) v = i / a * pk;
        else if (i < a + h) v = pk;
        else { v = s + ex; ex *= kd; }
      } else v *= kr;
      x[i] *= v;
    }
  },
  // Render one layer to a mono array. Layer types: osc (wave sine/tri/saw/square/pulse),
  // fm, noise (color white/pink/brown), grit (random crackle), click, pluck, modal, inst.
  fxLayer(ly, sr, r, where) { return this.run(this.fxLayerG(ly, sr, r, where)); },
  *fxLayerG(ly, sr, r, where) {
    const dur = ly.dur == null ? 0.2 : ly.dur;
    const rel = ly.env && ly.env.r != null ? ly.env.r : 0.03;
    let n = Math.max(1, Math.round((dur + rel) * sr));
    let x = new Float32Array(n);
    const F = this.curve(ly.f == null ? 440 : ly.f, dur, true), semi = ly.semi || 0;
    const steps = ly.steps ? ly.steps.slice().sort((a, b) => a[0] - b[0]) : null;
    const vib = ly.vib;
    const pitch = t => {
      let st = semi;
      if (steps) for (const s of steps) if (t >= s[0]) st = semi + s[1];
      if (vib && t > (vib[2] || 0)) st += vib[0] / 100 * Math.sin(2 * Math.PI * vib[1] * (t - (vib[2] || 0)));
      return F(t) * Math.pow(2, st / 12);
    };
    const type = ly.type || "osc";
    if (type === "osc") {
      const wave = ly.wave || "sine", D = this.curve(ly.duty == null ? 0.5 : ly.duty, dur, false);
      let ph = r(), dt = 0, du = 0.5;
      const blep = (t, dt) => { if (t < dt) { t /= dt; return t + t - t * t - 1; } if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; } return 0; };
      for (let i = 0; i < n; i++) {
        if ((i & 15) === 0) { const t = i / sr; dt = Math.min(0.5, pitch(t) / sr); if (wave === "pulse") du = Math.min(0.95, Math.max(0.02, D(t))); }
        let y;
        if (wave === "sine") y = Math.sin(2 * Math.PI * ph);
        else if (wave === "tri") y = 1 - 4 * Math.abs(ph - 0.5);
        else if (wave === "saw") y = 2 * ph - 1 - blep(ph, dt);
        else {
          let p2 = ph + 1 - du; if (p2 >= 1) p2 -= 1;
          y = (ph < du ? 1 : -1) + blep(ph, dt) - blep(p2, dt);
        }
        x[i] = y;
        ph += dt; if (ph >= 1) ph -= 1;
      }
    } else if (type === "fm") {
      const I = this.curve(ly.index == null ? 2 : ly.index, dur, false), ratio = ly.ratio || 1;
      let pc = 0, pm = 0, f = 0, ix = 0;
      for (let i = 0; i < n; i++) {
        if ((i & 15) === 0) { const t = i / sr; f = pitch(t); ix = I(t) / (2 * Math.PI); }
        x[i] = this.sin1(pc + ix * this.sin1(pm));
        pc += f / sr; pm += f * ratio / sr; pc -= Math.floor(pc); pm -= Math.floor(pm);
      }
    } else if (type === "noise") {
      const col = ly.color || "white";
      if (col === "pink") {           // octave-band random generators summed (Voss idea)
        const rows = new Float32Array(8);
        for (let i = 0; i < n; i++) {
          let k = 0, c = i + 1; while ((c & 1) === 0 && k < 7) { c >>= 1; k++; }
          rows[k] = r() * 2 - 1;
          let s = r() * 2 - 1; for (let j = 0; j < 8; j++) s += rows[j];
          x[i] = s / 4;
        }
      } else if (col === "brown") {
        let b = 0;
        for (let i = 0; i < n; i++) { b = (b + 0.04 * (r() * 2 - 1)) * 0.996; x[i] = b * 3; }
      } else for (let i = 0; i < n; i++) x[i] = r() * 2 - 1;
    } else if (type === "grit") {  // sparse random pops (crackle, debris, fuses)
      const R = this.curve(ly.rate == null ? 60 : ly.rate, dur, false), tau = (ly.pop || 0.002) * sr;
      let e = 0, sgn = 1;
      for (let i = 0; i < n; i++) {
        if (i < dur * sr && r() < R(i / sr) / sr) { e = 0.3 + 0.7 * r(); sgn = r() < 0.5 ? -1 : 1; }
        x[i] = sgn * e * (r() * 2 - 1); e *= Math.exp(-1 / tau);
      }
    } else if (type === "click") {
      const w = Math.max(1, Math.round((ly.width || 0.0005) * sr));
      for (let i = 0; i < Math.min(n, w); i++) x[i] = 1 - i / w;
    } else if (type === "pluck") {
      const o = this.ks(69, r, { sr, len: dur + rel, t60: ly.t60 || 0.6, bright: ly.bright == null ? 0.6 : ly.bright, pick: ly.pick || 0.15 });
      const src = o.data, rate = F(0) / o.hz;                  // retune the A4 string by resampling
      for (let i = 0; i < n; i++) { const p = i * rate, j = p | 0; x[i] = j + 1 < src.length ? src[j] + (p - j) * (src[j + 1] - src[j]) : 0; }
    } else if (type === "modal") {
      const o = this.modal(69, r, { sr, hz: F(0), len: dur + rel, parts: ly.parts || [[1, 1, dur]], drop: ly.drop, dropT: ly.dropT, mallet: ly.mallet });
      x = o.data; n = x.length;
    } else if (type === "inst") {
      const notes = ly.notes || [[0, ly.midi == null ? 69 : ly.midi, dur, ly.vel == null ? 1 : ly.vel]];
      const d = this.INST[ly.inst];
      if (!d) throw new Error("[sfx] " + where + ": unknown instrument '" + ly.inst + "'");
      let end = 0;
      for (const nt of notes) end = Math.max(end, nt[0] + (d.kind === "sus" ? nt[2] : Math.max(nt[2], d.ring || 0.5)) + (d.env ? d.env[3] : 0.2) * 1.5 + 0.01);
      n = Math.round(end * sr); x = new Float32Array(n);
      for (const [t0, midi, nd, vel] of notes) {
        const s = this.pick(ly.inst, midi), src = s.buf.getChannelData(0), rate = midiHz(midi) / s.hz * s.sr / sr;
        const ie = d.env || [0.002, 0, 1, 0.2], sus = d.kind === "sus", gate = sus ? nd : Math.max(nd, d.ring || 0.5);
        const g = Math.pow(vel == null ? 1 : vel, 1.5) * this.db(d.gain || 0), o0 = Math.round(t0 * sr);
        this._instNote(x, o0, Math.min(n, o0 + Math.round((gate + ie[3] * 1.5) * sr)), src, rate, s.loop ? s.ls * s.sr : -1, s.le * s.sr, g,
          Math.round(gate * sr), Math.max(1, Math.round(ie[0] * sr)), sus ? ie[2] : 1, sus ? Math.exp(-3 / Math.max(1, ie[1] * sr)) : 1, Math.exp(-4.6 / Math.max(1, ie[3] * sr)));
        yield;
      }
    } else throw new Error("[sfx] " + where + ": unknown layer type '" + type + "'");
    yield;
    // filters, envelope, shaping
    const flt = ly.filter ? (Array.isArray(ly.filter) ? ly.filter : [ly.filter]) : [];
    for (const f of flt) {
      const C = this.curve(f.f, dur, true);
      this.svf(x, f.type || "lp", typeof f.f === "number" ? f.f : i => C(i / sr), f.q || 0.707, sr);
      yield;
    }
    if (type !== "inst" && type !== "modal" && type !== "pluck" || ly.env) this.envApply(x, ly.env, dur, sr);
    if (ly.drive) { const k = Math.tanh(ly.drive); for (let i = 0; i < n; i++) x[i] = Math.tanh(ly.drive * x[i]) / k; }
    if (ly.crush) {
      const q = Math.pow(2, (ly.crush.bits || 8) - 1), hold = Math.max(1, Math.round(sr / (ly.crush.hz || sr)));
      let v = 0;
      for (let i = 0; i < n; i++) { if (i % hold === 0) v = Math.round(x[i] * q) / q; x[i] = v; }
    }
    const g = this.db(ly.gain || 0);
    if (g !== 1) for (let i = 0; i < n; i++) x[i] *= g;
    return { data: x, at: Math.round((ly.at || 0) * sr), pan: ly.pan || 0, rep: ly.rep };
  },
  // One instrument note mixed into x (resampled from its root sample, attack/decay/release).
  _instNote(x, i0, i1, src, rate, ls, le, g, gateN, aN, sus, dDec, rDec) {
    let p = 0, e = 0, lvl = 1;
    for (let i = i0; i < i1; i++) {
      const k = i - i0;
      if (k < aN) e = k / aN;
      else if (k < gateN) { lvl = sus + (lvl - sus) * dDec; e = lvl; }
      else e *= rDec;
      if (ls >= 0 && p >= le) p -= le - ls;
      const j = p | 0;
      if (j + 1 >= src.length) break;
      x[i] += g * e * (src[j] + (p - j) * (src[j + 1] - src[j]));
      p += rate;
    }
  },
  // Render an effect recipe (variant v) to channel arrays; auto-level to its class.
  // (renderFxG is the same work as a generator: one layer per slice, so the engine can build
  // effects in the background without a long frame.)
  renderFx(def, name, v, key) { return this.run(this.renderFxG(def, name, v, key)); },
  *renderFxG(def, name, v, key) {
    let busy = 0, tb = performance.now();
    const sr = def.sr || this.FX_SR, r = this.rng(this.hash(name) + v * 7919 + 17);
    const layers = typeof def.layers === "function" ? def.layers(v, r, key || { tonic: 60, mode: "major" }) : def.layers;
    if (!Array.isArray(layers) || !layers.length) throw new Error("[sfx] '" + name + "': layers must be a non-empty array");
    const segs = [];
    for (let i = 0; i < layers.length; i++) {
      const g = this.fxLayerG(layers[i], sr, r, "'" + name + "' layer " + i);
      let s;
      for (;;) { const st = g.next(); if (st.done) { s = st.value; break; } busy += performance.now() - tb; yield; tb = performance.now(); }
      const reps = s.rep ? s.rep[0] : 1, every = s.rep ? Math.round(s.rep[1] * sr) : 0;
      for (let k = 0; k < reps; k++) segs.push({ data: s.data, at: s.at + k * every, pan: s.pan });
      busy += performance.now() - tb; yield; tb = performance.now();
    }
    let n = 0, stereo = false;
    for (const s of segs) { n = Math.max(n, s.at + s.data.length); if (s.pan) stereo = true; }
    n += Math.round((def.tail || 0.01) * sr);
    const L = new Float32Array(n), R = stereo ? new Float32Array(n) : null;
    for (const s of segs) {
      const gl = stereo ? Math.cos((s.pan + 1) * Math.PI / 4) : 1, gr = stereo ? Math.sin((s.pan + 1) * Math.PI / 4) : 0;
      for (let i = 0; i < s.data.length; i++) { L[s.at + i] += gl * s.data[i]; if (R) R[s.at + i] += gr * s.data[i]; }
    }
    // no DC: a one-shot gets the gentle 10 Hz high-pass (before the silent end is trimmed, so
    // the filter's own settling is trimmed with it); a loop loses its mean (stays seamless)
    for (const c of R ? [L, R] : [L]) {
      if (!def.loop) this.dcBlock(c, sr, 10);
      else { let m = 0; for (let i = 0; i < n; i++) m += c[i]; m /= n; for (let i = 0; i < n; i++) c[i] -= m; }
    }
    busy += performance.now() - tb; yield; tb = performance.now();
    // trim the silent end (below -80 dB) but keep a few ms
    let end = n;
    while (end > 1 && Math.abs(L[end - 1]) < 1e-4 && (!R || Math.abs(R[end - 1]) < 1e-4)) end--;
    end = Math.min(n, end + Math.round(0.005 * sr));
    let chans = R ? [L.subarray(0, end), R.subarray(0, end)] : [L.subarray(0, end)];
    chans = chans.map(c => c.slice());
    const target = def.lufs != null ? def.lufs : this.FXLEVEL[def.cls || "world"];
    let gainDb = 0, capped = false;
    const lv = this.st50(chans, sr);
    busy += performance.now() - tb; yield; tb = performance.now();
    let peak = 0;
    for (const c of chans) for (let i = 0; i < c.length; i++) peak = Math.max(peak, Math.abs(c[i]));
    if (target != null && lv > -90) {
      gainDb = target - lv + (def.gain || 0);
      const maxDb = 20 * Math.log10(0.89 / Math.max(1e-9, peak));
      if (gainDb > maxDb) { gainDb = maxDb; capped = true; }
      const k = this.db(gainDb);
      for (const c of chans) for (let i = 0; i < c.length; i++) c[i] *= k;
      peak *= k;
    }
    if (def.loop) {          // seamless loop: cross-fade the last 40 ms into the start
      const X = Math.min(Math.round(0.04 * sr), chans[0].length >> 2);
      chans = chans.map(c => {
        const m = c.length - X, o = c.slice(0, m);
        for (let i = 0; i < X; i++) { const w = i / X; o[i] = c[i] * Math.sqrt(w) + c[m + i] * Math.sqrt(1 - w); }
        return o;
      });
    }
    busy += performance.now() - tb;
    this.fxLog[name] = { st50: Math.round((lv + gainDb) * 10) / 10, peakDb: Math.round(20 * Math.log10(Math.max(1e-9, peak)) * 10) / 10, gainDb: Math.round(gainDb * 10) / 10, capped, ms: Math.round(busy * 10) / 10 };
    return { chans, sr };
  },
};
