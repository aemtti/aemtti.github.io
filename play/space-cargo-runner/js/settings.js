// settings.js - 1~10 단계 프리셋 + 타이틀/옵션 화면 컨트롤

// 청크당 소행성 수: [min, max) 정수 범위
const ASTEROID_PRESETS = {
    1:  { min: 0,  max: 2  },
    2:  { min: 1,  max: 4  },
    3:  { min: 2,  max: 5  },
    4:  { min: 3,  max: 7  },
    5:  { min: 5,  max: 10 },
    6:  { min: 6,  max: 13 },
    7:  { min: 8,  max: 15 },
    8:  { min: 10, max: 18 },
    9:  { min: 13, max: 22 },
    10: { min: 16, max: 26 },
};

// 적 스폰: 비콘 청크/일반 청크 [min, max) + 핫존 확률
const ENEMY_PRESETS = {
    1:  { beacon: [0,1], normal: [0,1], hotChance: 0    },
    2:  { beacon: [0,1], normal: [0,2], hotChance: 0    },
    3:  { beacon: [0,1], normal: [0,2], hotChance: 0.02 },
    4:  { beacon: [0,2], normal: [0,3], hotChance: 0.03 },
    5:  { beacon: [0,2], normal: [1,3], hotChance: 0.04 },
    6:  { beacon: [0,2], normal: [1,4], hotChance: 0.05 },
    7:  { beacon: [0,3], normal: [1,5], hotChance: 0.07 },
    8:  { beacon: [1,3], normal: [2,5], hotChance: 0.10 },
    9:  { beacon: [1,4], normal: [2,6], hotChance: 0.12 },
    10: { beacon: [1,4], normal: [3,7], hotChance: 0.15 },
};

// 비콘 출현 확률 (청크당)
const BEACON_PRESETS = {
    1: 0.04, 2: 0.08, 3: 0.14, 4: 0.20, 5: 0.28,
    6: 0.36, 7: 0.45, 8: 0.55, 9: 0.70, 10: 0.90,
};

// 정비소 출현 확률 (청크당, 단 안전지대/origin 제외)
const SHIPYARD_PRESETS = {
    1: 0.00, 2: 0.02, 3: 0.05, 4: 0.10, 5: 0.15,
    6: 0.22, 7: 0.30, 8: 0.40, 9: 0.55, 10: 0.75,
};

const SETTINGS_KEY = "scr-settings-v2";

// 정수형 단계 검증 (1-10)
function _validLevel(v) { return Number.isInteger(v) && v >= 1 && v <= 10; }

const Settings = {
    asteroidDensity: 4,
    enemyDensity:    3,
    beaconFreq:      4,
    shipyardFreq:    3,
    godMode:         "off",   // "on" 또는 "off" - 디버그 갓모드
    sfxEnabled:      "on",    // "on" 또는 "off" - 효과음 활성
    sfxVolume:       7,       // 1~10 단계 (SFX.setVolume 으로 변환)

    asteroidPreset() { return ASTEROID_PRESETS[this.asteroidDensity] || ASTEROID_PRESETS[4]; },
    enemyPreset()    { return ENEMY_PRESETS[this.enemyDensity]       || ENEMY_PRESETS[3]; },
    beaconChance()   { return BEACON_PRESETS[this.beaconFreq]   ?? 0.20; },
    shipyardChance() { return SHIPYARD_PRESETS[this.shipyardFreq] ?? 0.05; },

    save() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify({
                asteroidDensity: this.asteroidDensity,
                enemyDensity:    this.enemyDensity,
                beaconFreq:      this.beaconFreq,
                shipyardFreq:    this.shipyardFreq,
                godMode:         this.godMode,
                sfxEnabled:      this.sfxEnabled,
                sfxVolume:       this.sfxVolume,
            }));
        } catch (e) { /* 무시 */ }
    },
    load() {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return;
            const s = JSON.parse(raw);
            if (_validLevel(s.asteroidDensity)) this.asteroidDensity = s.asteroidDensity;
            if (_validLevel(s.enemyDensity))    this.enemyDensity    = s.enemyDensity;
            if (_validLevel(s.beaconFreq))      this.beaconFreq      = s.beaconFreq;
            if (_validLevel(s.shipyardFreq))    this.shipyardFreq    = s.shipyardFreq;
            if (s.godMode === "on" || s.godMode === "off") this.godMode = s.godMode;
            if (s.sfxEnabled === "on" || s.sfxEnabled === "off") this.sfxEnabled = s.sfxEnabled;
            if (_validLevel(s.sfxVolume)) this.sfxVolume = s.sfxVolume;
        } catch (e) { /* 무시 */ }
    },

    // SFX 모듈에 현재 설정값 적용
    applyToSFX() {
        if (!window.SFX) return;
        window.SFX.setEnabled(this.sfxEnabled === "on");
        // 1~10 → 0.08 ~ 0.80 선형 매핑
        window.SFX.setVolume(0.08 + (this.sfxVolume - 1) * (0.72 / 9));
    },
};

// === 타이틀 화면 ===
const TitleScreen = {
    elTitle: null,
    elStartBtn: null,
    elOptionsBtn: null,

    init(onStart, onOptions) {
        this.elTitle      = document.getElementById("title-screen");
        this.elStartBtn   = document.getElementById("start-btn");
        this.elOptionsBtn = document.getElementById("options-btn");
        this.elStartBtn.addEventListener("click", () => onStart && onStart());
        this.elOptionsBtn.addEventListener("click", () => onOptions && onOptions());
    },
    show() { if (this.elTitle) this.elTitle.classList.remove("hidden"); },
    hide() { if (this.elTitle) this.elTitle.classList.add("hidden"); },
};

// === 옵션 화면 ===
const OptionsScreen = {
    elPanel: null,
    elClose: null,

    // 단계별 힌트 텍스트 생성
    _hintFor(settingName) {
        const lvl = Settings[settingName];
        if (settingName === "asteroidDensity") {
            const p = ASTEROID_PRESETS[lvl];
            return p.min === 0 && p.max <= 1 ? "거의 없음"
                                             : `청크당 ${p.min}~${p.max - 1}개`;
        }
        if (settingName === "enemyDensity") {
            const e = ENEMY_PRESETS[lvl];
            const avg = (e.normal[0] + Math.max(e.normal[1] - 1, e.normal[0])) / 2;
            const hot = e.hotChance > 0 ? `, 핫존 ${(e.hotChance * 100).toFixed(0)}%` : "";
            return `평균 ${avg.toFixed(1)}마리/청크${hot}`;
        }
        if (settingName === "beaconFreq") {
            const p = BEACON_PRESETS[lvl];
            return `청크당 ${(p * 100).toFixed(0)}% 확률 (해적 상선은 자동으로 그 60%)`;
        }
        if (settingName === "shipyardFreq") {
            const p = SHIPYARD_PRESETS[lvl];
            return p === 0 ? "출현 없음" : `청크당 ${(p * 100).toFixed(0)}% 확률`;
        }
        if (settingName === "sfxVolume") {
            return `현재 단계: ${lvl} / 10`;
        }
        return "";
    },

    init(onClose) {
        this.elPanel = document.getElementById("options-screen");
        this.elClose = document.getElementById("opt-close-btn");
        this.elClose.addEventListener("click", () => onClose && onClose());

        // 4개 토글 동적 생성
        ["asteroidDensity", "enemyDensity", "beaconFreq", "shipyardFreq", "sfxVolume"]
            .forEach(name => this._buildLevelGroup(name));
        // 단순 ON/OFF 토글들
        this._setupGodToggle("godMode");
        this._setupGodToggle("sfxEnabled");
        this._refreshAllHints();
    },

    // 슬라이드 식 ON/OFF 토글 (갓모드 디버그용)
    _setupGodToggle(settingName) {
        const btn = document.querySelector(`.god-toggle[data-setting="${settingName}"]`);
        if (!btn) return;
        const statusEl = btn.querySelector(".god-toggle-status");
        const refresh = () => {
            const on = Settings[settingName] === "on";
            btn.classList.toggle("active", on);
            if (statusEl) statusEl.textContent = on ? "ON" : "OFF";
        };
        btn.addEventListener("click", () => {
            Settings[settingName] = (Settings[settingName] === "on") ? "off" : "on";
            Settings.save();
            refresh();
            if (settingName === "sfxEnabled") {
                Settings.applyToSFX();
                if (window.SFX) window.SFX.uiClick();
            }
        });
        refresh();
    },

    _buildLevelGroup(settingName) {
        const group = document.querySelector(`.level-group[data-setting="${settingName}"]`);
        if (!group) return;
        group.innerHTML = "";
        for (let i = 1; i <= 10; i++) {
            const b = document.createElement("button");
            b.dataset.value = String(i);
            b.textContent = String(i);
            b.addEventListener("click", () => {
                Settings[settingName] = i;
                Settings.save();
                this._refreshLevelGroup(settingName);
                this._refreshHint(settingName);
                if (settingName === "sfxVolume") {
                    Settings.applyToSFX();
                    if (window.SFX) window.SFX.uiClick();
                }
            });
            group.appendChild(b);
        }
        this._refreshLevelGroup(settingName);
    },

    _refreshLevelGroup(settingName) {
        const group = document.querySelector(`.level-group[data-setting="${settingName}"]`);
        if (!group) return;
        const cur = Settings[settingName];
        Array.from(group.querySelectorAll("button")).forEach(b => {
            const v = parseInt(b.dataset.value, 10);
            b.classList.toggle("filled", v <= cur);
            b.classList.toggle("active", v === cur);
        });
    },

    _refreshHint(settingName) {
        const el = document.getElementById(`hint-${settingName}`);
        if (el) el.textContent = this._hintFor(settingName);
    },

    _refreshAllHints() {
        ["asteroidDensity", "enemyDensity", "beaconFreq", "shipyardFreq", "sfxVolume"]
            .forEach(n => this._refreshHint(n));
    },

    show() { if (this.elPanel) this.elPanel.classList.remove("hidden"); },
    hide() { if (this.elPanel) this.elPanel.classList.add("hidden"); },
};

Settings.load();
Settings.applyToSFX();

window.Settings           = Settings;
window.TitleScreen        = TitleScreen;
window.OptionsScreen      = OptionsScreen;
window.ASTEROID_PRESETS   = ASTEROID_PRESETS;
window.ENEMY_PRESETS      = ENEMY_PRESETS;
window.BEACON_PRESETS     = BEACON_PRESETS;
window.SHIPYARD_PRESETS   = SHIPYARD_PRESETS;
