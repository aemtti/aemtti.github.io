// sfx.js - Web Audio API 기반 절차적 효과음 합성
// 이미지/사운드 파일 없이 오실레이터 + 필터 + 게인 envelope 만으로 모든 SFX 생성.
// 사용: SFX.laser("base"), SFX.explosion("big"), SFX.uiClick(), ...
//
// 브라우저 정책상 AudioContext 는 사용자 인터랙션 이후에야 활성화됨.
// 첫 호출 시 자동 init + resume.

const SFX = {
    ctx: null,
    master: null,
    volume: 0.35,          // 마스터 볼륨 (0.0 ~ 1.0)
    enabled: true,

    init() {
        if (this.ctx) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) { this.enabled = false; return; }
        this.ctx = new Ctx();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.volume;
        this.master.connect(this.ctx.destination);
    },

    _ensure() {
        if (!this.enabled) return false;
        if (!this.ctx) this.init();
        if (!this.ctx) return false;
        if (this.ctx.state === "suspended") this.ctx.resume();
        return true;
    },

    // 모바일(iOS/Android): 사용자 제스처(터치/클릭/키) 핸들러 안에서 AudioContext 를 만들고 resume 해야
    // 소리가 난다. 첫 효과음이 게임 루프(제스처 밖)에서 나도 되도록 첫 입력 때 미리 잠금 해제.
    unlock() {
        if (!this.enabled) return;
        if (!this.ctx) this.init();
        const ctx = this.ctx;
        if (!ctx) return;
        if (ctx.state !== "running") { try { ctx.resume(); } catch (e) { /* 무시 */ } }
        if (!this._unlocked) {
            this._unlocked = true;
            try {   // iOS: 무음 버퍼 1개 재생으로 출력 활성화
                const src = ctx.createBufferSource();
                src.buffer = ctx.createBuffer(1, 1, 22050);
                src.connect(ctx.destination);
                src.start(0);
            } catch (e) { /* 무시 */ }
        }
    },

    setVolume(v) {
        this.volume = Math.max(0, Math.min(1, v));
        if (this.master) this.master.gain.value = this.volume;
    },

    setEnabled(b) {
        this.enabled = !!b;
        if (this.master) this.master.gain.value = b ? this.volume : 0;
    },

    // === 헬퍼: 노이즈 버퍼 생성 (decay 적용) ===
    _noiseBuffer(duration, decay = true) {
        const sr = this.ctx.sampleRate;
        const len = Math.floor(sr * duration);
        const buf = this.ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            const env = decay ? (1 - i / len) : 1;
            data[i] = (Math.random() * 2 - 1) * env;
        }
        return buf;
    },

    // === 레이저 사격 ===
    //  type: "base"  - 노란 베이스 레이저 (높은 짧은 핑)
    //        "heavy" - 시안 헤비 레이저 (낮은 굵은 줌)
    //        "god"   - 갓모드 (높고 빠른 더블 펄스)
    //        "enemy" - 적 함선 (더 둔탁)
    laser(type = "base") {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        let f0, f1, peak, dur;
        if (type === "heavy") {
            f0 = 720; f1 = 220; peak = 0.30; dur = 0.18;
        } else if (type === "god") {
            f0 = 1900; f1 = 700; peak = 0.22; dur = 0.10;
        } else if (type === "enemy") {
            f0 = 900;  f1 = 280; peak = 0.16; dur = 0.14;
            osc.type = "sawtooth";
        } else {  // base
            f0 = 1300; f1 = 420; peak = 0.20; dur = 0.12;
        }
        osc.frequency.setValueAtTime(f0, t);
        osc.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.9);
        gain.gain.setValueAtTime(peak, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(gain).connect(this.master);
        osc.start(t);
        osc.stop(t + dur + 0.02);
    },

    // === 폭발 ===
    //  size: "small" - 적 격침, 작은 폭발 (~0.4s)
    //        "big"   - 상선/거대 폭발 (~0.8s + 더 강한 베이스 hum)
    explosion(size = "small") {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const big = (size === "big");
        const dur = big ? 0.85 : 0.42;

        // 1) 화이트 노이즈 + 로우패스 sweep
        const noise = ctx.createBufferSource();
        noise.buffer = this._noiseBuffer(dur, true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        const cutoff0 = big ? 6000 : 4200;
        filter.frequency.setValueAtTime(cutoff0, t);
        filter.frequency.exponentialRampToValueAtTime(90, t + dur);
        filter.Q.value = 0.7;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(big ? 0.55 : 0.35, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(filter).connect(noiseGain).connect(this.master);
        noise.start(t);

        // 2) 베이스 hum (low sine sweep)
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(big ? 90 : 140, t);
        osc.frequency.exponentialRampToValueAtTime(big ? 35 : 55, t + dur);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(big ? 0.50 : 0.28, t);
        oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(oscGain).connect(this.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    },

    // === 피격 (자기가 맞음) ===
    hit() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const dur = 0.10;
        const noise = ctx.createBufferSource();
        noise.buffer = this._noiseBuffer(dur, true);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1500;
        filter.Q.value = 1.2;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.30, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(filter).connect(gain).connect(this.master);
        noise.start(t);
    },

    // === 카고 픽업 (상승 2음) ===
    pickupCargo() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const notes = [523.25, 783.99];   // C5, G5
        notes.forEach((f, i) => {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = f;
            const g = ctx.createGain();
            const t0 = t + i * 0.06;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.18, t0 + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
            osc.connect(g).connect(this.master);
            osc.start(t0);
            osc.stop(t0 + 0.15);
        });
    },

    // === 연료 픽업 (낮은 부드러운 ding) ===
    pickupFuel() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine"; osc1.frequency.value = 392;   // G4
        osc2.type = "sine"; osc2.frequency.value = 587.33; // D5
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
        osc1.connect(g); osc2.connect(g); g.connect(this.master);
        osc1.start(t); osc2.start(t);
        osc1.stop(t + 0.32); osc2.stop(t + 0.32);
    },

    // === 골드 획득 (코인 ding) ===
    pickupGold() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        // 동시에 두 음 — 880 + 1320 (5도 화음)
        for (const f of [880, 1318.5]) {
            const osc = ctx.createOscillator();
            osc.type = "sine";
            osc.frequency.value = f;
            const g = ctx.createGain();
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.18, t + 0.008);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(g).connect(this.master);
            osc.start(t);
            osc.stop(t + 0.28);
        }
    },

    // === 미사일 발사 ===
    missile() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const dur = 0.35;
        // 위로 sweep 하는 노이즈 (whoosh)
        const noise = ctx.createBufferSource();
        noise.buffer = this._noiseBuffer(dur, false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(400, t);
        filter.frequency.exponentialRampToValueAtTime(2400, t + dur);
        filter.Q.value = 4;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        noise.connect(filter).connect(g).connect(this.master);
        noise.start(t);
    },

    // === 워프 (구조선/상선 사라질때) ===
    warp() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const dur = 0.80;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(200, t);
        osc.frequency.exponentialRampToValueAtTime(2400, t + dur * 0.7);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(8000, t + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22, t + 0.05);
        g.gain.setValueAtTime(0.22, t + dur * 0.7);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        osc.connect(filter).connect(g).connect(this.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    },

    // === UI 클릭 (짧은 블립) ===
    uiClick() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "square";
        osc.frequency.value = 720;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.12, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.connect(g).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.06);
    },

    // === UI 거래 성공 (구매/판매) ===
    uiPurchase() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const notes = [659.25, 880, 1318.5];   // E5, A5, E6
        notes.forEach((f, i) => {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = f;
            const g = ctx.createGain();
            const t0 = t + i * 0.04;
            g.gain.setValueAtTime(0, t0);
            g.gain.linearRampToValueAtTime(0.15, t0 + 0.005);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.18);
            osc.connect(g).connect(this.master);
            osc.start(t0);
            osc.stop(t0 + 0.20);
        });
    },

    // === UI 거절/실패 (낮은 짧은 톤) ===
    uiError() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.18);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.18, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.20);
        osc.connect(g).connect(this.master);
        osc.start(t);
        osc.stop(t + 0.22);
    },

    // === 게임 오버 (하강 사인) ===
    gameOver() {
        if (!this._ensure()) return;
        const ctx = this.ctx;
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(110, t + 1.2);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.30, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
        osc.connect(g).connect(this.master);
        osc.start(t);
        osc.stop(t + 1.35);
    },
};

window.SFX = SFX;

// 오디오 잠금 해제: 터치는 pointerup/touchend/click 이 사용자 제스처로 인정됨 (pointerdown 은 아님)
// 앱 전환 등으로 다시 멈춘(suspended/interrupted) 경우에도 다음 입력 때 되살림
["pointerup", "touchend", "click", "keydown"].forEach(ev =>
    addEventListener(ev, () => { if (!SFX.ctx || SFX.ctx.state !== "running") SFX.unlock(); }, true));
