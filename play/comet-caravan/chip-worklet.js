(function chipWorklet() {
    const CPU = 1789773;                                  // NTSC 2A03 clock
    const NOISE_P = [4, 8, 16, 32, 64, 96, 128, 160, 202, 254, 380, 508, 762, 1016, 2034, 4068];
    const DUTY = [[0, 1, 0, 0, 0, 0, 0, 0], [0, 1, 1, 0, 0, 0, 0, 0], [0, 1, 1, 1, 1, 0, 0, 0], [1, 0, 0, 1, 1, 1, 1, 1]];
    const TRI = [];
    for (let i = 15; i >= 0; i--) TRI.push(i);
    for (let i = 0; i < 16; i++) TRI.push(i);
    // band-limited step: windowed-sinc impulse table, integrated at read time
    const TAPS = 32, PH = 64, LAT = TAPS / 2 - 1;
    const KER = new Float32Array((PH + 1) * TAPS);
    (function () {
      const fc = 0.86, half = TAPS / 2;
      for (let p = 0; p <= PH; p++) {
        let sum = 0;
        for (let k = 0; k < TAPS; k++) {
          const x = k - LAT - p / PH;
          let v = 0;
          if (Math.abs(x) < half) {
            const w = 0.42 + 0.5 * Math.cos(Math.PI * x / half) + 0.08 * Math.cos(2 * Math.PI * x / half);
            v = (Math.abs(x) < 1e-9 ? 1 : Math.sin(Math.PI * fc * x) / (Math.PI * fc * x)) * w;
          }
          KER[p * TAPS + k] = v; sum += v;
        }
        for (let k = 0; k < TAPS; k++) KER[p * TAPS + k] /= sum;
      }
    })();
    const seqv = (a, loop, t) => { const n = a.length; if (t < n) return a[t]; if (loop != null && loop >= 0) return a[loop + (t - loop) % (n - loop)]; return a[n - 1]; };

    class Blip {
      constructor() { this.buf = new Float32Array(128 + TAPS + 4); this.acc = 0; }
      add(t, d) {
        const i = t | 0, pf = (t - i) * PH, p = pf | 0, fr = pf - p, b = this.buf, o = p * TAPS;
        for (let k = 0; k < TAPS; k++) { const a0 = KER[o + k]; b[i + k] += d * (a0 + (KER[o + TAPS + k] - a0) * fr); }
      }
      read(out, n) {
        const b = this.buf; let acc = this.acc;
        for (let j = 0; j < n; j++) { acc += b[j]; out[j] = acc; }
        this.acc = acc; b.copyWithin(0, n, n + TAPS); b.fill(0, TAPS);
      }
      reset() { this.buf.fill(0); this.acc = 0; }
    }

    class Chan {
      constructor(kind, P) { this.kind = kind; this.P = P; this.blip = new Blip(); this.evs = []; this.idx = 0; this.clear(); }
      clear() {
        this.ev = null; this.ins = null; this.level = 0; this.vol = 0; this.duty = 2; this.phase = 0; this.rate = 0;
        this.lfsr = 1; this.mode = 0; this.gate = false; this.nextTick = Infinity; this.relAt = Infinity; this.released = false;
        this.pitch = 60; this.target = 60; this.slide = 0; this.tick = 0; this.relTick = 0; this.relBase = 0; this.lastPitch = null; this.nbase = 0; this.nv = 15;
      }
      nextTime() {
        let t = this.idx < this.evs.length ? this.evs[this.idx].s : Infinity;
        if (this.ev) { if (this.nextTick < t) t = this.nextTick; if (!this.released && this.relAt < t) t = this.relAt; }
        return t;
      }
      handle(g) {
        const evs = this.evs;
        while (this.idx < evs.length && evs[this.idx].s <= g) this.noteOn(evs[this.idx++]);
        if (this.ev && !this.released && g >= this.relAt) this.release();
        if (this.ev && g >= this.nextTick) { this.doTick(); this.nextTick += this.P.tickLen; }
      }
      noteOn(e) {
        const ins = this.P.ins[e.i], prev = this.ev ? this.pitch : this.lastPitch;
        this.ev = e; this.ins = ins; this.tick = 0; this.released = false; this.relAt = e.r; this.nextTick = e.s; this.nv = e.v;
        if (this.kind === 2) { this.nbase = e.n; return; }
        this.target = e.n; this.slide = 0;
        if (e.sl && prev != null) { this.pitch = prev; this.slide = e.sl; }
        else if (e.g) { this.pitch = e.n + e.g; this.slide = Math.abs(e.g) / (e.gt || 3); }
        else this.pitch = e.n;
        if (this.kind === 0 && !e.sl) this.phase = 0;     // writing $4003 restarts the pulse sequencer
      }
      release() {
        if (this.ins.norel) { this.relAt = Infinity; return; }
        this.released = true; this.relTick = this.tick;
        this.relBase = seqv(this.ins.vol, this.ins.volLoop, Math.max(0, this.tick - 1));
      }
      doTick() {
        const e = this.ev, ins = this.ins, t = this.tick;
        let v;
        if (!this.released) v = seqv(ins.vol, ins.volLoop, t);
        else v = ins.rel ? this.relBase * seqv(ins.rel, -1, t - this.relTick) : 0;
        let vol = (v <= 0 || this.nv <= 0) ? 0 : Math.max(1, Math.round(v * this.nv / 15));
        if (this.kind === 2) {
          let ix = this.nbase + (ins.noise ? seqv(ins.noise, -1, t) : 0) + (e.ns ? e.ns * t : 0);
          ix = ix < 0 ? 0 : ix > 15 ? 15 : Math.round(ix);
          this.mode = e.m != null ? e.m : (ins.mode ? seqv(ins.mode, -1, t) : 0);
          this.rate = CPU / NOISE_P[ix] / this.P.sr;
        } else {
          if (this.slide) {
            const d = this.target - this.pitch;
            if (Math.abs(d) <= this.slide) { this.pitch = this.target; this.slide = 0; } else this.pitch += d > 0 ? this.slide : -this.slide;
          }
          let p = this.pitch;
          if (e.a) p += e.a[Math.floor(t / (e.as || 1)) % e.a.length];
          if (ins.pitch) p += seqv(ins.pitch, -1, t);
          const vb = ins.vib, depth = e.vd != null ? e.vd : (vb ? vb.depth : 0);
          if (depth > 0) {
            const dl = e.vdl != null ? e.vdl : (vb ? vb.delay : 8);
            if (t >= dl) p += depth * Math.min(1, (t - dl + 1) / ((vb && vb.ramp) || 8)) * Math.sin(2 * Math.PI * ((vb && vb.rate) || 5.5) * (t - dl) / 60);
          }
          if (e.f && this.released) p -= e.f * (t - this.relTick);
          const f = 440 * Math.pow(2, (p - 69) / 12);
          if (this.kind === 0) {
            const per = Math.round(CPU / (16 * f) - 1);                    // 11-bit timer → authentic pitch quantisation
            if (per < 8 || per > 2047) { this.rate = 0; vol = 0; } else this.rate = CPU / (16 * (per + 1)) * 8 / this.P.sr;
            this.duty = e.du != null ? e.du : seqv(ins.duty, ins.dutyLoop, t);
          } else {
            const per = Math.round(CPU / (32 * f) - 1);
            this.rate = (per < 2 || per > 2047) ? 0 : CPU / (32 * (per + 1)) * 32 / this.P.sr;
            this.gate = vol > 0 && this.rate > 0;                           // triangle: no volume, only run / halt
          }
        }
        this.vol = vol; this.tick = t + 1;
        if (vol === 0 && (this.released || (ins.volLoop == null && t >= ins.vol.length - 1))) {
          this.lastPitch = this.pitch; this.ev = null; this.nextTick = Infinity; this.gate = false;
        }
      }
      setLevel(at) {
        let L;
        if (this.kind === 0) L = this.vol && this.rate > 0 ? DUTY[this.duty][Math.floor(this.phase)] * this.vol : 0;
        else if (this.kind === 1) L = TRI[Math.floor(this.phase)];
        else L = this.vol ? ((this.lfsr & 1) ? 0 : this.vol) : 0;
        if (L !== this.level) { this.blip.add(at, L - this.level); this.level = L; }
      }
      synth(a, b) {
        this.setLevel(a);
        const k = this.kind, r = this.rate;
        if (r <= 0) return;
        let ph = this.phase, t = a;
        if (k === 0) {
          if (this.vol === 0) { this.phase = (ph + (b - a) * r) % 8; return; }
          const dt = DUTY[this.duty], vol = this.vol;
          for (;;) {
            const fl = Math.floor(ph), toN = (fl + 1 - ph) / r;
            if (t + toN >= b) { ph += (b - t) * r; break; }
            t += toN; ph = fl + 1; if (ph >= 8) ph -= 8;
            const L = dt[ph] * vol;
            if (L !== this.level) { this.blip.add(t, L - this.level); this.level = L; }
          }
          this.phase = ph >= 8 ? ph - 8 : ph;
        } else if (k === 1) {
          if (!this.gate) return;
          for (;;) {
            const fl = Math.floor(ph), toN = (fl + 1 - ph) / r;
            if (t + toN >= b) { ph += (b - t) * r; break; }
            t += toN; ph = fl + 1; if (ph >= 32) ph -= 32;
            const L = TRI[ph];
            if (L !== this.level) { this.blip.add(t, L - this.level); this.level = L; }
          }
          this.phase = ph >= 32 ? ph - 32 : ph;
        } else {
          if (this.vol === 0 && this.level === 0) { ph += (b - a) * r; this.phase = ph - Math.floor(ph); return; }
          const vol = this.vol, tap = this.mode ? 6 : 1;
          for (;;) {
            const toN = (1 - ph) / r;
            if (t + toN >= b) { ph += (b - t) * r; break; }
            t += toN; ph = 0;
            const s = this.lfsr;
            this.lfsr = (s >> 1) | (((s ^ (s >> tap)) & 1) << 14);
            const L = (this.lfsr & 1) ? 0 : vol;
            if (L !== this.level) { this.blip.add(t, L - this.level); this.level = L; }
          }
          this.phase = ph;
        }
      }
    }

    class ChipProc extends AudioWorkletProcessor {
      constructor(opt) {
        super();
        const o = (opt && opt.processorOptions) || {};
        this.sr = sampleRate; this.tickLen = sampleRate / 60;
        this.ch = [new Chan(0, this), new Chan(0, this), new Chan(1, this), new Chan(2, this)];
        this.buf = [0, 1, 2, 3].map(() => new Float32Array(128));
        this.mute = [0, 0, 0, 0];
        // P2 is summed with inverted polarity: narrow-duty pulses only spike one way, so P1 and P2 spikes now land on opposite sides
        const M = o.master || 2.85, W = o.weights || [0.00752, -0.00752, 0.00851 * 0.92, 0.00494];
        this.w = W.map(x => x * M); this.wk = this.w.slice();
        const pan = o.pan || [-0.2, 0.3, 0, 0.1];
        this.pl = pan.map(p => (p > 0 ? 1 - p : 1)); this.pr = pan.map(p => (p < 0 ? 1 + p : 1));
        this.hpR = Math.exp(-2 * Math.PI * (o.hp || 25) / this.sr);
        this.hx = new Float64Array(4); this.hy = new Float64Array(4);
        this.lpA = 1 - Math.exp(-2 * Math.PI * (o.lp || 16000) / this.sr);
        this.lpL = 0; this.lpR = 0;
        this.ctrl = []; this.ci = 0; this.dmc = 0; this.dmcT = 0; this.kt = 1; this.kn = 1;
        this.report = o.report !== false; this.blocks = 0; this.ended = false;
        this.pos = 0; this.ins = null; this.stats = null;
        if (o.stats) this.initStats(o.stats);
        this.port.onmessage = m => this.onMsg(m.data);
        if (o.song) this.load(o.song, o.start || 0);
      }
      now() { return typeof currentTime === 'number' ? currentTime : 0; }   // the main-thread fallback overrides this
      onMsg(d) {
        if (d.type === 'seek') this.seek(d.pos);
        else if (d.type === 'mute') this.mute = d.mute.slice();
        else if (d.type === 'load') this.load(d.song, d.start || 0);
      }
      load(song, start) {
        this.ins = song.ins; this.dur = song.duration; this.ctrl = (song.ctrl || []).map(c => ({ s: Math.round(c.t * this.sr), dmc: c.dmc }));
        const sr = this.sr;
        for (let c = 0; c < 4; c++) this.ch[c].evs = song.ev[c].map(e => Object.assign({}, e, { s: Math.round(e.t * sr), r: Math.round((e.t + e.d) * sr) }));
        this.seek(start);
      }
      seek(sec) {
        const g = Math.max(0, Math.round(sec * this.sr));
        this.pos = g; this.ended = false;
        for (const c of this.ch) {
          c.blip.reset(); c.clear();
          const evs = c.evs; let lo = 0, hi = evs.length;
          while (lo < hi) { const m = (lo + hi) >> 1; if (evs[m].s <= g) lo = m + 1; else hi = m; }
          c.idx = lo;
          const k = lo - 1;
          if (k >= 0 && g - evs[k].s < this.sr * 8) {        // re-run the note's macros up to the seek point
            if (k > 0 && c.kind !== 2) c.lastPitch = evs[k - 1].n;
            c.noteOn(evs[k]);
            while (c.ev && c.nextTick <= g) {
              if (!c.released && c.relAt <= c.nextTick) c.release();
              c.doTick(); c.nextTick += this.tickLen;
            }
            if (c.ev && !c.released && c.relAt <= g) c.release();
          }
        }
        this.hx.fill(0); this.hy.fill(0);
        this.ci = 0; while (this.ci < this.ctrl.length && this.ctrl[this.ci].s <= g) this.dmcT = this.ctrl[this.ci++].dmc;
        this.setDmc(this.dmcT);
      }
      // $4011 trick: with the DPCM DAC held at level d, the non-linear TND mixer gives triangle/noise less swing
      setDmc(d) {
        const tnd = (t, n, dd) => { const x = t / 8227 + n / 12241 + dd / 22638; return x <= 0 ? 0 : 159.79 / (1 / x + 100); };
        this.dmc = d;
        this.kt = (tnd(15, 0, d) - tnd(0, 0, d)) / tnd(15, 0, 0);
        this.kn = (tnd(0, 15, d) - tnd(0, 0, d)) / tnd(0, 15, 0);
        this.wk = [this.w[0], this.w[1], this.w[2] * this.kt, this.w[3] * this.kn];
      }
      initStats(o) {
        const sr = this.sr;
        const hs = (() => { const G = 3.999843853973347, f0 = 1681.974450955533, Q = 0.7071752369554196; const A = Math.pow(10, G / 40), w0 = 2 * Math.PI * f0 / sr, al = Math.sin(w0) / (2 * Q), c = Math.cos(w0), sA = Math.sqrt(A); const a0 = (A + 1) - (A - 1) * c + 2 * sA * al;
          return [A * ((A + 1) + (A - 1) * c + 2 * sA * al) / a0, -2 * A * ((A - 1) + (A + 1) * c) / a0, A * ((A + 1) + (A - 1) * c - 2 * sA * al) / a0, 2 * ((A - 1) - (A + 1) * c) / a0, ((A + 1) - (A - 1) * c - 2 * sA * al) / a0]; })();
        const hp = (() => { const f0 = 38.13547087602444, Q = 0.5003270373238773; const w0 = 2 * Math.PI * f0 / sr, al = Math.sin(w0) / (2 * Q), c = Math.cos(w0), a0 = 1 + al;
          return [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0]; })();
        this.stats = { win: o.win, end: o.end, n: 0, acc: new Float64Array(12), out: [], kc: [hs, hp], ks: new Float64Array(32), done: false };
      }
      statSample(c, y) {
        const S = this.stats, K = S.ks, o = c * 8;
        let b = S.kc[0], x = y;
        let z = b[0] * x + b[1] * K[o] + b[2] * K[o + 1] - b[3] * K[o + 2] - b[4] * K[o + 3];
        K[o + 1] = K[o]; K[o] = x; K[o + 3] = K[o + 2]; K[o + 2] = z;
        b = S.kc[1]; x = z;
        z = b[0] * x + b[1] * K[o + 4] + b[2] * K[o + 5] - b[3] * K[o + 6] - b[4] * K[o + 7];
        K[o + 5] = K[o + 4]; K[o + 4] = x; K[o + 7] = K[o + 6]; K[o + 6] = z;
        const a = S.acc, i = c * 3; a[i] += y * y; a[i + 1] += z * z; const ay = y < 0 ? -y : y; if (ay > a[i + 2]) a[i + 2] = ay;
      }
      statFlush(force) {
        const S = this.stats;
        if (S.out.length && (force || S.out.length >= 12 * 128)) { const f = new Float32Array(S.out); S.out = []; this.port.postMessage({ type: 'stats', data: f }, [f.buffer]); }
      }
      process(inputs, outputs) {
        const out = outputs[0], L = out[0], R = out[1] || out[0], n = L.length, stem = outputs[1];
        if (!this.ins) return true;
        const pos = this.pos, ch = this.ch;
        let local = 0;
        while (local < n) {
          const g = pos + local;
          for (let c = 0; c < 4; c++) ch[c].handle(g);
          let next = n;
          for (let c = 0; c < 4; c++) { const nt = ch[c].nextTime() - pos; if (nt < next) next = nt; }
          next = Math.ceil(next);
          if (next <= local) next = local + 1;
          for (let c = 0; c < 4; c++) ch[c].synth(local, next);
          local = next;
        }
        for (let c = 0; c < 4; c++) ch[c].blip.read(this.buf[c], n);
        while (this.ci < this.ctrl.length && this.ctrl[this.ci].s <= pos) this.dmcT = this.ctrl[this.ci++].dmc;
        if (this.dmc !== this.dmcT) { const st = 60 * n / this.sr; this.setDmc(Math.abs(this.dmcT - this.dmc) <= st ? this.dmcT : this.dmc + Math.sign(this.dmcT - this.dmc) * st); }
        const w = this.wk, hx = this.hx, hy = this.hy, hpR = this.hpR, lpA = this.lpA, S = this.stats, buf = this.buf, mute = this.mute;
        for (let j = 0; j < n; j++) {
          let l = 0, r = 0;
          for (let c = 0; c < 4; c++) {
            const x = buf[c][j] * w[c];
            const y = x - hx[c] + hpR * hy[c]; hx[c] = x; hy[c] = y;
            if (stem && stem[c]) stem[c][j] = y;
            if (S) this.statSample(c, y);
            if (!mute[c]) { l += y * this.pl[c]; r += y * this.pr[c]; }
          }
          this.lpL += lpA * (l - this.lpL); this.lpR += lpA * (r - this.lpR);
          L[j] = this.lpL; if (R !== L) R[j] = this.lpR;
          if (S && ++S.n >= S.win) { for (let q = 0; q < 12; q++) S.out.push(S.acc[q]); S.acc.fill(0); S.n = 0; }
        }
        this.pos += n;
        if (S && !S.done) { if (this.pos >= S.end) { S.done = true; this.statFlush(true); this.port.postMessage({ type: 'statsDone' }); } else this.statFlush(false); }
        if (this.report && ++this.blocks % 8 === 0) this.port.postMessage({ type: 'pos', pos: pos / this.sr, ct: this.now() });
        if (!this.ended && this.pos > (this.dur + 0.3) * this.sr) { this.ended = true; if (this.report) this.port.postMessage({ type: 'end' }); }
        return true;
      }
    }
    registerProcessor('cc-chip', ChipProc);
  })();
