// touch-controls.js - 터치(휴대폰/태블릿) 조작 연결부
//
// touch-kit.js 의 가상 스틱/버튼을 이 게임의 입력(Input: 키보드/마우스)으로 번역한다.
//  - 왼쪽 스틱  : WASD 이동 (touch-kit 가 keydown/keyup 을 대신 보냄)
//  - 오른쪽 스틱: 조준. 함선 앞의 가상 커서(Input.mouseX/Y)를 스틱 방향에 두고,
//                 스틱을 일정 이상 밀면 사격(Input.mouseDown). 적대 함선 쪽으로 살짝 조준 보정.
//                 스틱을 떼고 이동하면 잠시 뒤 진행 방향을 바라봄.
//  - 버튼      : BOOST(SHIFT 누르고 있기) · SOS(H) · DOCK(E) · CARGO(X) · ❚❚(ESC)
//                갓모드 ON 일 때만 V · 3 · 4 · 5 · 6 · + · − 버튼이 추가로 보임
//  - 구조선 제안 수락/거절([1]/[2])은 SOS 안내창 안의 버튼 (hud.js 가 표시)
//  - 휴대폰처럼 작은 화면에선 카메라를 살짝 줌 아웃 (주변 시야 확보)
// 마우스로 조작 중이면(데스크톱) 아무것도 바꾸지 않는다 → 기존 조작 그대로.

const TOUCH_AIM_DEAD     = 0.12;   // 이 이상 기울이면 조준 방향 갱신
const TOUCH_FIRE_PUSH    = 0.35;   // 이 이상 밀면 사격
const TOUCH_AIM_DIST     = 320;    // 함선 → 가상 커서 거리 (다중 포탑 수렴점)
const TOUCH_ASSIST_ANG   = 0.12;   // 조준 보정 허용 각도 (rad, + 표적 크기만큼)
const TOUCH_ASSIST_RANGE = 700;    // 조준 보정 최대 거리
const TOUCH_SMALL_ZOOM   = 0.75;   // 휴대폰 화면 (짧은 변 < 600px) 카메라 배율

const TouchControls = {
    active: false,           // 터치 모드: 가상 컨트롤 + 터치용 안내 문구 (body.touch-ui)
    kit: null,
    aimAngle: -Math.PI / 2,  // 월드 기준 조준 각도 (시작 시 함선은 위를 봄)
    aimDist: TOUCH_AIM_DIST,
    aimOn: false,            // 조준 스틱 사용 중
    firing: false,
    aimHold: 0,              // 조준 스틱을 뗀 뒤 진행 방향으로 돌기까지 남은 시간
    rot: null,               // 세로 화면 회전 안내 (touch-kit)
    rotDismissed: false,     // "그래도 세로로 하기" 를 누르면 다시 띄우지 않음
    mqPortrait: null,
    godGroup: null,
    _lastPlayer: null,
    _hit: { a: 0, d: 0 },    // 조준 보정 결과 (매 프레임 재사용)

    init() {
        if (!window.TouchKit || this.kit) return;
        const god = (id, label, key) => ({ id, label, key, tap: true, place: "top-left", size: "s" });
        this.kit = TouchKit.create({
            show: "never",       // 표시/숨김은 sync() 가 게임 상태를 보고 직접 결정
            landscape: true,     // 세로로 들면 가로 회전 안내 (닫고 세로로 해도 플레이 가능)
            sticks: [
                { id: "move", side: "left",  label: "MOVE", keys: "wasd" },
                { id: "aim",  side: "right", label: "AIM" },
            ],
            buttons: [
                // 오른쪽 아래 2×2 : [SOS][DOCK] / [CARGO][BOOST]
                { id: "boost", label: "BOOST", icon: "»", key: "ShiftLeft", row: 0 },
                { id: "cargo", label: "CARGO", icon: "⏏", key: "KeyX", tap: true, row: 0, size: "m" },
                { id: "dock",  label: "DOCK",  icon: "✚", key: "KeyE", tap: true, row: 1, size: "m" },
                { id: "sos",   label: "SOS",   icon: "⚠", key: "KeyH", tap: true, row: 1, size: "m" },
                { id: "pause", icon: "❚❚", key: "Escape", tap: true, place: "top-right", size: "s" },
                // 갓모드(디버그) 전용 키 — 갓모드 ON 일 때만 보임
                god("gV", "V", "KeyV"), god("g3", "3", "Digit3"), god("g4", "4", "Digit4"),
                god("g5", "5", "Digit5"), god("g6", "6", "Digit6"),
                god("gPlus", "+", "Equal"), god("gMinus", "−", "Minus"),
            ],
        });
        this.godGroup = this.kit.buttons.gV.el.parentElement;
        this.godGroup.classList.add("sc-god");
        this.godGroup.style.display = "none";

        this.rot = document.querySelector(".tk-rot");
        if (this.rot) {
            const b = this.rot.querySelector("button");
            if (b) b.addEventListener("click", () => { this.rotDismissed = true; });
        }
        this.mqPortrait = window.matchMedia ? matchMedia("(orientation: portrait)") : null;

        // SOS 안내창: 연료 고갈 안내를 탭하면 구조신호(H), 구조선 제안엔 수락(1)/거절(2) 버튼
        const prompt = document.getElementById("sos-prompt");
        if (prompt) prompt.addEventListener("click", (e) => {
            if (!this.active) return;
            const btn = e.target && e.target.closest ? e.target.closest("button") : null;
            if (btn && btn.id === "sos-accept-btn")       TouchKit.tapKey("Digit1");
            else if (btn && btn.id === "sos-decline-btn") TouchKit.tapKey("Digit2");
            else                                          TouchKit.tapKey("KeyH");
        });

        // 전체 화면 (지원하는 휴대폰만: 주소창이 사라져 화면이 넓어짐)
        const fs = document.getElementById("fullscreen-btn");
        const de = document.documentElement;
        if (fs && (document.fullscreenEnabled || document.webkitFullscreenEnabled) &&
            (de.requestFullscreen || de.webkitRequestFullscreen)) {
            document.body.classList.add("can-fullscreen");
            fs.addEventListener("click", () => this.toggleFullscreen());
            const label = () => {
                fs.textContent = (document.fullscreenElement || document.webkitFullscreenElement) ? "⛶ 전체 화면 끝내기" : "⛶ 전체 화면";
            };
            document.addEventListener("fullscreenchange", label);
            document.addEventListener("webkitfullscreenchange", label);
        }

        // 입력 장치 감지: 손가락 터치 → 터치 모드, 실제 마우스 이동 → 데스크톱 모드
        addEventListener("pointerdown", (e) => { if (e.pointerType === "touch") this.setActive(true); }, true);
        addEventListener("touchstart", () => this.setActive(true), { capture: true, passive: true });
        addEventListener("pointermove", (e) => {
            if (this.active && e.pointerType === "mouse" && (e.movementX || e.movementY)) this.setActive(false);
        }, true);

        this.setActive(TouchKit.isTouch());
    },

    setActive(on) {
        on = !!on;
        if (!this.kit || this.active === on) return;
        this.active = on;
        document.body.classList.toggle("touch-ui", on);
        this._applyWording();
        if (!on) {
            this.kit.show(false);
            this.firing = false;
            this.aimOn = false;
            if (window.Input) Input.mouseDown = false;
        }
        // 상점이 열려 있으면 다시 그려서 포탑 슬롯 터치 영역/문구 갱신
        const shop = window.ShopScreen;
        if (shop && shop.player && shop.elPanel && !shop.elPanel.classList.contains("hidden")) shop.refresh();
    },

    // [data-touch] 요소: 터치 모드면 터치용 문구, 아니면 원래(데스크톱) 문구
    _applyWording() {
        for (const el of document.querySelectorAll("[data-touch]")) {
            if (el.dataset.desktop === undefined) el.dataset.desktop = el.textContent;
            el.textContent = this.active ? el.dataset.touch : el.dataset.desktop;
        }
    },

    toggleFullscreen() {
        const d = document, de = d.documentElement;
        try {
            if (d.fullscreenElement || d.webkitFullscreenElement) {
                (d.exitFullscreen || d.webkitExitFullscreen).call(d);
                return;
            }
            const req = de.requestFullscreen || de.webkitRequestFullscreen;
            const lock = () => {
                try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("landscape").catch(() => {}); } catch (e) { /* 미지원 */ }
            };
            const p = req.call(de, { navigationUI: "hide" });
            if (p && p.then) p.then(lock).catch(() => {}); else lock();
        } catch (e) { /* 전체 화면 불가 — 무시 */ }
    },

    zoomFor(w, h) { return Math.min(w, h) < 600 ? TOUCH_SMALL_ZOOM : 1; },

    // 세로 화면 회전 안내가 떠 있는 동안은 게임 진행을 멈춤 (game.js)
    blocking() {
        return !!(this.active && this.kit && this.kit.visible && this.rot &&
                  this.rot.classList.contains("need") && this.mqPortrait && this.mqPortrait.matches);
    },

    // 매 프레임 (월드 업데이트 전): 조준 스틱 → 가상 마우스 커서 / 사격
    beforeUpdate(dt, st) {
        const cam = st.camera, p = st.player;
        if (!this.active) {
            if (cam && cam.zoom !== 1) cam.zoom = 1;   // 마우스로 바뀌면 원래 배율
            return;
        }
        if (cam) cam.zoom = this.zoomFor(st.viewW, st.viewH);
        if (p !== this._lastPlayer) {                   // 새 게임: 함선 초기 방향(위)부터
            this._lastPlayer = p;
            this.aimAngle = -Math.PI / 2;
            this.aimDist = TOUCH_AIM_DIST;
            this.aimHold = 0;
        }
        if (!st.inPlay || !p || !cam || !this.kit) {
            this.firing = false;
            this.aimOn = false;
            Input.mouseDown = false;
            return;
        }
        const a = this.kit.stick("aim"), m = this.kit.stick("move");
        const ad = Math.hypot(a.x, a.y);
        this.aimOn = a.on;
        if (a.on && ad > TOUCH_AIM_DEAD) {
            const raw = Math.atan2(a.y, a.x);
            const hit = this._assist(p, st.world, raw);
            this.aimAngle = hit ? hit.a : raw;
            this.aimDist  = hit ? Math.max(120, hit.d) : TOUCH_AIM_DIST;
            this.aimHold  = 0.8;
        } else if (!a.on) {
            // 조준을 안 하면 잠시 뒤 이동 방향을 바라봄
            this.aimHold -= dt;
            if (m.on && Math.hypot(m.x, m.y) > 0.3 && this.aimHold <= 0) {
                let d = Math.atan2(m.y, m.x) - this.aimAngle;
                while (d >  Math.PI) d -= TAU;
                while (d < -Math.PI) d += TAU;
                this.aimAngle += d * Math.min(1, dt * 6);
                this.aimDist = TOUCH_AIM_DIST;
            }
        }
        this.firing = a.on && ad > TOUCH_FIRE_PUSH;
        const [sx, sy] = cam.worldToScreen(p.x + Math.cos(this.aimAngle) * this.aimDist,
                                           p.y + Math.sin(this.aimAngle) * this.aimDist);
        Input.mouseX = sx;
        Input.mouseY = sy;
        Input.mouseDown = this.firing;
    },

    // 조준 보정: 스틱 방향 근처의 적대 함선 쪽으로 끌어당김 (상선/구조선은 적대 상태일 때만)
    _assist(p, world, a) {
        if (!world) return null;
        let best = null, bs = Infinity;
        for (const e of world.entities) {
            if (!e.alive || e === p) continue;
            const hostile = e.type === "enemy" ||
                ((e.type === "pirate" || e.type === "merchant" || e.type === "rescue") && e.state === "hostile");
            if (!hostile) continue;
            const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy);
            if (d < 1 || d > TOUCH_ASSIST_RANGE) continue;
            const ea = Math.atan2(dy, dx);
            let diff = Math.abs(ea - a) % TAU;
            if (diff > Math.PI) diff = TAU - diff;
            if (diff > TOUCH_ASSIST_ANG + Math.atan2(e.r || 12, d)) continue;
            const s = diff * 400 + d * 0.3;
            if (s < bs) { bs = s; best = this._hit; best.a = ea; best.d = d; }
        }
        return best;
    },

    // 조준점 표시 (마우스 커서 대용) — 조준 스틱을 쓰는 동안만. 카메라 변환 안에서 호출.
    drawWorld(ctx) {
        if (!this.active || !this.aimOn) return;
        const x = Input.worldX, y = Input.worldY;
        ctx.save();
        ctx.strokeStyle = this.firing ? "rgba(255, 224, 102, 0.85)" : "rgba(160, 220, 255, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, TAU);
        ctx.moveTo(x - 16, y); ctx.lineTo(x - 5, y);
        ctx.moveTo(x + 5, y);  ctx.lineTo(x + 16, y);
        ctx.moveTo(x, y - 16); ctx.lineTo(x, y - 5);
        ctx.moveTo(x, y + 5);  ctx.lineTo(x, y + 16);
        ctx.stroke();
        ctx.restore();
    },

    // 매 프레임 (그린 뒤): 게임 상태에 맞춰 가상 컨트롤 표시/숨김 + 버튼 상태 표시
    sync(st) {
        if (!this.kit) return;
        const want = this.active && st.inPlay;
        if (this.kit.visible !== want) {
            this.kit.show(want);
            if (want) {
                if (this.rotDismissed && this.rot) this.rot.classList.remove("need");
                // 숨겨져 있던 동안(회전 등) 어긋났을 수 있는 스틱 대기 위치 재계산
                dispatchEvent(new Event("resize"));
            }
        }
        if (!want) return;
        const p = st.player, w = st.world;
        if (!p || !w) return;
        const b = this.kit.buttons;
        const rescueAlive = !!(w.rescueShip && w.rescueShip.alive);
        const dock = !!w.nearestShipyardInRange();
        const sos  = p.outOfFuel && !rescueAlive;
        this._mark(b.dock.el,  "sc-hot",  dock);
        this._mark(b.dock.el,  "sc-dim",  !dock);
        this._mark(b.sos.el,   "sc-warn", sos);
        this._mark(b.sos.el,   "sc-dim",  !sos);
        this._mark(b.cargo.el, "sc-dim",  p.cargoChain.length === 0);
        this._mark(b.boost.el, "sc-dim",  p.fuel <= 0);
        if (this.godGroup._on !== !!p.godMode) {
            this.godGroup._on = !!p.godMode;
            this.godGroup.style.display = p.godMode ? "" : "none";
        }
    },

    // 클래스 토글 (바뀔 때만 DOM 에 씀)
    _mark(el, cls, on) {
        const k = "_sc_" + cls;
        if (el[k] === on) return;
        el[k] = on;
        el.classList.toggle(cls, on);
    },
};

window.TouchControls = TouchControls;
