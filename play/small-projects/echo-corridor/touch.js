/* 잔향 통로 — 휴대폰·태블릿 터치 조작 (touch-kit.js 사용)
   왼쪽 스틱: 좌우 이동 · 위로 밀면 점프
   오른쪽 스틱: 조준 · 절반 이상 밀면 연속 발사 (뒤를 조준하거나 쏘는 동안 느려지는 규칙은 그대로)
   오른쪽 버튼: 점프 · 재장전, 오른쪽 위: 일시정지 · 소리
   키보드와 같은 키 코드/마우스 좌표를 넣어 주므로 게임 규칙은 바뀌지 않는다. 조작은 플레이 중에만 보인다. */
(function () {
  "use strict";
  const game = window.echoGame;
  if (!game || !window.TouchKit) return;
  const W = 960, H = 540, AIM_R = 220;
  const root = document.documentElement;
  let touched = TouchKit.isTouch();
  const markTouch = () => { root.classList.add("touch"); relabel(); };

  // 터치용 문구: 'ENTER ·' 같은 키보드 안내를 떼어 낸다
  function relabel() {
    for (const b of document.querySelectorAll("#startButton, #howStartButton, .restart-button")) {
      if (!b.dataset.deskText) b.dataset.deskText = b.textContent;
      b.textContent = b.dataset.deskText.replace(/^ENTER\s*·\s*/, "");
    }
  }

  const held = { KeyA: false, KeyD: false, Space: false };
  const hold = (code, on) => { if (held[code] === on) return; held[code] = on; (on ? TouchKit.press : TouchKit.release)(code); };
  let aimActive = false, aimX = 1, aimY = 0, aimFire = false;

  const kit = TouchKit.create({
    landscape: true,
    show: "manual",
    sticks: [
      { id: "move", side: "left", label: "이동", onMove: (x, y, on) => {
        const side = on && Math.abs(x) > 0.25;
        hold("KeyA", side && x < 0); hold("KeyD", side && x > 0);
        hold("Space", on && y < -0.55);                       // 위로 밀면 점프
      } },
      { id: "aim", side: "right", label: "조준", onMove: (x, y, on) => {
        const m = Math.hypot(x, y);
        if (on && m > 0.2) { aimActive = true; aimX = x / m; aimY = y / m; aimFire = m > 0.5; }
        else if (!on) { aimActive = false; aimFire = false; aimX = 1; aimY = 0; applyAim(true); }
        else aimFire = false;
      } },
    ],
    buttons: [
      { id: "jump", label: "점프", icon: "▲", key: "Space", size: "l" },
      { id: "reload", label: "재장전", icon: "↻", key: "KeyR", size: "s" },
      { id: "pause", icon: "❚❚", key: "Escape", tap: true, place: "top-right", size: "s" },
      { id: "sound", icon: "🔊", place: "top-right", size: "s", onDown: () => document.getElementById("muteButton").click() },
    ],
  });

  // 조준 스틱 → 게임의 마우스 좌표(캔버스 960×540 기준)와 발사 버튼, 조준점 표시
  const cross = document.getElementById("crosshair"), canvas = document.getElementById("gameCanvas");
  function applyAim(once) {
    const p = game.player, mouse = game.input.mouse;
    mouse.x = p.x - game.camera + 15 + aimX * AIM_R;
    mouse.y = p.y + 21 + aimY * AIM_R;
    mouse.down = !once && aimFire;
    const r = canvas.getBoundingClientRect();
    cross.style.left = mouse.x / W * r.width + "px";
    cross.style.top = mouse.y / H * r.height + "px";
    cross.style.opacity = once ? 0 : 0.85;
  }

  const rot = document.querySelector(".tk-rot");
  let rotDismissed = false;
  if (rot) rot.querySelector("button").addEventListener("click", () => { rotDismissed = true; });
  addEventListener("touchstart", () => { if (!touched) { touched = true; markTouch(); } }, { capture: true, passive: true });
  if (touched) markTouch();

  // 일시정지 화면의 '흔들림' 토글 (가로 화면에서는 상단 막대가 숨겨지므로)
  const shakeProxy = document.getElementById("pauseShakeButton"), shakeBtn = document.getElementById("shakeButton");
  if (shakeProxy && shakeBtn) shakeProxy.addEventListener("click", () => { shakeBtn.click(); shakeProxy.textContent = shakeBtn.textContent; });

  let shown = null;
  (function sync() {
    const want = touched && game.state === "playing";
    if (want !== shown) {
      shown = want; kit.show(want);
      if (!want) { held.KeyA = held.KeyD = held.Space = false; aimActive = aimFire = false; game.input.mouse.down = false; }
      else if (rotDismissed && rot) rot.classList.remove("need");
      if (shakeProxy && shakeBtn) shakeProxy.textContent = shakeBtn.textContent;
    }
    if (want && aimActive) applyAim(false);
    const sb = kit.buttons.sound, icon = game.audio.muted ? "🔇" : "🔊";
    if (sb && sb.icon !== icon) { sb.icon = icon; sb.el.querySelector("i").textContent = icon; }
    requestAnimationFrame(sync);
  })();
})();
