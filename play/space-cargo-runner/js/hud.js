// hud.js - HP/연료/골드/카고 + 미니맵 + SOS + Pause + GameOver

const HUD = {
    elHpFill:    null, elFuelFill: null, elEnergyFill: null,
    elGold: null, elCargo: null,
    elPos: null, elSector: null,
    elGameOver: null, elFinalGold: null,
    elRestart: null, elTitleBtn: null,
    elPause: null, elResume: null, elPauseTitle: null,
    elSosPrompt: null, elSosText: null,
    minimapCanvas: null, minimapCtx: null,

    init() {
        this.elHpFill     = document.getElementById("hp-fill");
        this.elFuelFill   = document.getElementById("fuel-fill");
        this.elEnergyFill = document.getElementById("energy-fill");
        this.elGold       = document.getElementById("gold-value");
        this.elCargo     = document.getElementById("cargo-value");
        this.elPos       = document.getElementById("pos-value");
        this.elSector    = document.getElementById("sector-value");
        this.elGameOver  = document.getElementById("game-over");
        this.elFinalGold = document.getElementById("final-gold");
        this.elRestart   = document.getElementById("restart-btn");
        this.elTitleBtn  = document.getElementById("title-btn");
        this.elPause        = document.getElementById("pause-screen");
        this.elResume       = document.getElementById("resume-btn");
        this.elPauseTitle   = document.getElementById("pause-title-btn");
        this.elSosPrompt = document.getElementById("sos-prompt");
        this.elSosText   = document.getElementById("sos-text");
        this.elSosChoice = document.getElementById("sos-choice");   // 터치 전용 수락/거절 버튼
        this.minimapCanvas = document.getElementById("minimap");
        this.minimapCtx    = this.minimapCanvas.getContext("2d");
    },

    _cargoText(p) {
        const n = p.cargoChain.length;
        const cap = p.cargoSoftCap || 6;
        if (n <= cap) return `${n} / ${cap}`;
        return `${n} / ${cap}  (속도 -90%)`;
    },
    updateText(world) {
        const p = world.player;
        if (!p) return;
        this.elHpFill.style.width   = `${(p.hp / p.maxHp) * 100}%`;
        // 갓모드면 HP 바 네온 청록 그라데이션, 아니면 기본 빨강-주황
        if (p.godMode) {
            this.elHpFill.style.background = "linear-gradient(90deg, #5fffe0, #a0ffff)";
            this.elHpFill.style.boxShadow = "0 0 6px rgba(95, 255, 224, 0.7)";
        } else if (this.elHpFill.style.background) {
            this.elHpFill.style.background = "";
            this.elHpFill.style.boxShadow = "";
        }
        this.elFuelFill.style.width = `${(p.fuel / p.maxFuel) * 100}%`;
        // 에너지 바
        if (this.elEnergyFill) {
            this.elEnergyFill.style.width = `${(p.energy / p.maxEnergy) * 100}%`;
            // 부족 시 (다음 발사 비용보다 낮음) low 클래스 활성
            const low = (p._noEnergyBlinkTimer > 0) || (p.energy < p.maxEnergy * 0.15);
            this.elEnergyFill.classList.toggle("low", low && !p.godMode);
            // 갓모드 시 청백 그라데이션
            if (p.godMode) {
                this.elEnergyFill.style.background = "linear-gradient(90deg, #a0ffff, #ffffff)";
                this.elEnergyFill.style.boxShadow = "0 0 8px rgba(160, 255, 255, 0.7)";
            } else if (this.elEnergyFill.style.background) {
                this.elEnergyFill.style.background = "";
                this.elEnergyFill.style.boxShadow = "";
            }
        }
        this.elGold.textContent   = `${Math.floor(p.gold)}`;
        this.elCargo.textContent  = this._cargoText(p);
        this.elPos.textContent    = `${Math.round(p.x)}, ${Math.round(p.y)}`;
        const [cx, cy] = world.chunkOf(p.x, p.y);
        this.elSector.textContent = `${cx}, ${cy}`;

        const r = world.rescueShip;
        const rAlive = r && r.alive;
        // 터치 모드: 키 대신 화면 버튼 안내 + 구조선 제안엔 수락/거절 버튼 표시
        const touch = !!(window.TouchControls && window.TouchControls.active);
        let choice = false;
        if (p.outOfFuel && !rAlive) {
            this.elSosText.textContent = touch ? "⚠ 연료 고갈 — SOS 버튼으로 구조신호 송출"
                                               : "⚠ 연료 고갈 — H 키로 구조신호 송출";
            this.elSosPrompt.classList.remove("hidden");
        } else if (rAlive && r.state === "approach") {
            this.elSosText.textContent = "● 구조선 접근 중...";
            this.elSosPrompt.classList.remove("hidden");
        } else if (rAlive && r.state === "waiting") {
            const left = Math.max(0, r.waitTimer).toFixed(1);
            this.elSosText.textContent = touch ? `● 구조선: ${r.cost} G에 연료를 받을까요? (${left}s)`
                                               : `● 구조선 의사 결정 — [1] 수락 / [2] 거절  (${left}s)`;
            choice = touch;
            this.elSosPrompt.classList.remove("hidden");
        } else if (rAlive && r.state === "hostile") {
            this.elSosText.textContent = "⚠ 구조선이 적대적입니다 — 격파!";
            this.elSosPrompt.classList.remove("hidden");
        } else {
            this.elSosPrompt.classList.add("hidden");
        }
        if (this.elSosChoice) this.elSosChoice.classList.toggle("hidden", !choice);
    },

    drawMinimap(world) {
        const ctx = this.minimapCtx;
        const W = this.minimapCanvas.width;
        const H = this.minimapCanvas.height;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = "rgba(5, 14, 26, 0.65)";
        ctx.fillRect(0, 0, W, H);

        if (!world.player) return;
        const p = world.player;
        const range = 2400;
        const scale = (W * 0.5) / range;

        const ents = world.nearbyForMinimap(range);
        for (const e of ents) {
            const dx = (e.x - p.x) * scale + W * 0.5;
            const dy = (e.y - p.y) * scale + H * 0.5;
            if (e.type === "asteroid") {
                ctx.fillStyle = "rgba(140, 130, 120, 0.55)";
                ctx.beginPath();
                ctx.arc(dx, dy, Math.max(1, e.r * scale), 0, TAU);
                ctx.fill();
            } else if (e.type === "merchant") {
                // 정규 상선 (큰 원 + 상태 색상)
                let col = "#5fd0ff";
                if (e.state === "warning") col = "#ffb84a";
                else if (e.state === "hostile") col = "#ff6b78";
                else if (e.state === "fleeing") col = "#aabbcc";
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.arc(dx, dy, 6, 0, TAU);
                ctx.fill();
                ctx.strokeStyle = `rgba(95, 208, 255, 0.4)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(dx, dy, 10, 0, TAU);
                ctx.stroke();
            } else if (e.type === "pirate") {
                const col = e.state === "hostile" ? "#ff6b78" : "#c87aff";
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.arc(dx, dy, 5, 0, TAU);
                ctx.fill();
                ctx.strokeStyle = `rgba(200, 122, 255, 0.4)`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(dx, dy, 9, 0, TAU);
                ctx.stroke();
            } else if (e.type === "shipyard") {
                ctx.fillStyle = "#7be39a";
                // 의무 십자 (작은)
                ctx.fillRect(dx - 1, dy - 4, 2, 8);
                ctx.fillRect(dx - 4, dy - 1, 8, 2);
                ctx.strokeStyle = "rgba(123, 227, 154, 0.4)";
                ctx.beginPath();
                ctx.arc(dx, dy, 8, 0, TAU);
                ctx.stroke();
            } else if (e.type === "enemy") {
                ctx.fillStyle = "#ff6b78";
                ctx.fillRect(dx - 2, dy - 2, 4, 4);
            } else if (e.type === "cargo") {
                ctx.fillStyle = "#7be39a";
                ctx.fillRect(dx - 1.5, dy - 1.5, 3, 3);
            } else if (e.type === "fuel") {
                ctx.fillStyle = "#ffd86b";
                ctx.fillRect(dx - 1.5, dy - 1.5, 3, 3);
            } else if (e.type === "rescue") {
                ctx.fillStyle = e.state === "hostile" ? "#ff5b6c" : "#d8d8e0";
                ctx.beginPath();
                ctx.arc(dx, dy, 3.5, 0, TAU);
                ctx.fill();
                if (e.state === "approach" || e.state === "hostile") {
                    ctx.strokeStyle = e.state === "hostile" ? "rgba(255, 91, 108, 0.5)"
                                                            : "rgba(216, 216, 224, 0.5)";
                    ctx.beginPath();
                    ctx.arc(dx, dy, 7, 0, TAU);
                    ctx.stroke();
                }
            }
        }

        ctx.save();
        ctx.translate(W * 0.5, H * 0.5);
        ctx.rotate(p.angle);
        ctx.fillStyle = "#ffe066";
        ctx.beginPath();
        ctx.moveTo(6, 0); ctx.lineTo(-4, -3); ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const beacon = world.nearestMerchant();
        if (beacon) {
            const dx = beacon.x - p.x, dy = beacon.y - p.y;
            const d = Math.hypot(dx, dy);
            if (d > range) {
                const ang = Math.atan2(dy, dx);
                const ax = Math.cos(ang) * (W * 0.4) + W * 0.5;
                const ay = Math.sin(ang) * (H * 0.4) + H * 0.5;
                ctx.save();
                ctx.translate(ax, ay);
                ctx.rotate(ang);
                ctx.fillStyle = "#5fd0ff";
                ctx.beginPath();
                ctx.moveTo(8, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        ctx.strokeStyle = "rgba(120, 200, 240, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1);
    },

    showGameOver(player) {
        this.elFinalGold.textContent = Math.floor(player.gold);
        this.elGameOver.classList.remove("hidden");
    },
    hideGameOver() { this.elGameOver.classList.add("hidden"); },

    showPause() { this.elPause.classList.remove("hidden"); },
    hidePause() { this.elPause.classList.add("hidden"); },

    onRestart(handler)    { this.elRestart.addEventListener("click", handler); },
    onTitle(handler)      { this.elTitleBtn.addEventListener("click", handler); },
    onResume(handler)     { this.elResume.addEventListener("click", handler); },
    onPauseTitle(handler) { this.elPauseTitle.addEventListener("click", handler); },
};

window.HUD = HUD;
