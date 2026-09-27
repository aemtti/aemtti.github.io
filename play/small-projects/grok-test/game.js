/**
 * Snake Game — vanilla JS
 * 방향키/WASD, 스와이프, 터치 버튼, 난이도, 일시정지, localStorage 최고점
 */
(function () {
  "use strict";

  // ----- DOM -----
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const scoreEl = document.getElementById("score");
  const highScoreEl = document.getElementById("high-score");
  const difficultyEl = document.getElementById("difficulty");
  const btnPause = document.getElementById("btn-pause");
  const btnRestart = document.getElementById("btn-restart");
  const btnStart = document.getElementById("btn-start");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayMessage = document.getElementById("overlay-message");
  const overlayScore = document.getElementById("overlay-score");

  // ----- Config -----
  const GRID = 20; // 셀 수 (GRID x GRID)
  const SPEEDS = { easy: 160, normal: 110, hard: 70 }; // ms per tick
  const STORAGE_KEY = "snake-high-score";
  const DIRS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const OPPOSITE = { up: "down", down: "up", left: "right", right: "left" };

  // ----- State -----
  let cellSize = 20;
  let snake = [];
  let direction = "right";
  let nextDirection = "right";
  let food = { x: 0, y: 0 };
  let score = 0;
  let highScore = 0;
  let tickMs = SPEEDS.normal;
  let lastTick = 0;
  let rafId = null;
  let running = false;
  let paused = false;
  let gameOver = false;
  let started = false;

  // 스와이프
  let touchStartX = 0;
  let touchStartY = 0;
  const SWIPE_MIN = 30;

  // ----- High score -----
  function loadHighScore() {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY), 10);
      highScore = Number.isFinite(v) && v >= 0 ? v : 0;
    } catch (_) {
      highScore = 0;
    }
    highScoreEl.textContent = String(highScore);
  }

  function saveHighScore() {
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = String(highScore);
      try {
        localStorage.setItem(STORAGE_KEY, String(highScore));
      } catch (_) {
        /* private mode 등 */
      }
    }
  }

  // ----- Canvas size (반응형) -----
  function resizeCanvas() {
    const wrap = canvas.parentElement;
    const size = Math.floor(wrap.clientWidth);
    // 내부 해상도를 그리드에 맞춤
    // 휴대폰 성능: 픽셀 비율은 최대 2배까지만
    const logical = Math.max(GRID * 10, size * Math.min(window.devicePixelRatio || 1, 2));
    // 정수 셀 크기 유지
    cellSize = Math.max(1, Math.floor(logical / GRID));
    const px = cellSize * GRID;
    canvas.width = px;
    canvas.height = px;
    draw();
  }

  // ----- Game setup -----
  function resetGame() {
    const mid = Math.floor(GRID / 2);
    snake = [
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
      { x: mid - 3, y: mid },
    ];
    direction = "right";
    nextDirection = "right";
    score = 0;
    scoreEl.textContent = "0";
    gameOver = false;
    paused = false;
    placeFood();
    btnPause.textContent = "일시정지";
    btnPause.disabled = false;
  }

  function placeFood() {
    const free = [];
    const occupied = new Set(snake.map((s) => s.x + "," + s.y));
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        if (!occupied.has(x + "," + y)) free.push({ x, y });
      }
    }
    if (free.length === 0) {
      // 보드 가득 참 → 승리 처리
      endGame(true);
      return;
    }
    food = free[Math.floor(Math.random() * free.length)];
  }

  function setDirection(dir) {
    if (!DIRS[dir]) return;
    // 현재 이동 방향의 반대로는 즉시 꺾지 않음
    if (OPPOSITE[dir] === direction) return;
    nextDirection = dir;
  }

  // ----- Tick -----
  function update() {
    direction = nextDirection;
    const d = DIRS[direction];
    const head = snake[0];
    const nx = head.x + d.x;
    const ny = head.y + d.y;

    // 벽 충돌
    if (nx < 0 || nx >= GRID || ny < 0 || ny >= GRID) {
      endGame(false);
      return;
    }

    // 자기 몸 충돌 (꼬리를 옮기기 전에 검사 — 꼬리 칸은 비게 되므로 제외 가능)
    const willGrow = nx === food.x && ny === food.y;
    for (let i = 0; i < snake.length - (willGrow ? 0 : 1); i++) {
      if (snake[i].x === nx && snake[i].y === ny) {
        endGame(false);
        return;
      }
    }

    snake.unshift({ x: nx, y: ny });

    if (willGrow) {
      score += difficultyPoints();
      scoreEl.textContent = String(score);
      saveHighScore();
      placeFood();
    } else {
      snake.pop();
    }
  }

  function difficultyPoints() {
    const d = difficultyEl.value;
    if (d === "hard") return 15;
    if (d === "easy") return 5;
    return 10;
  }

  function endGame(won) {
    gameOver = true;
    running = false;
    started = false;
    saveHighScore();
    showOverlay(
      won ? "클리어!" : "게임 종료",
      won ? "보드를 모두 채웠습니다!" : "다시 도전해 보세요",
      true
    );
    btnPause.disabled = true;
  }

  // ----- Draw -----
  function draw() {
    const w = canvas.width;
    const h = canvas.height;
    const cs = cellSize;

    // 배경
    ctx.fillStyle = "#141c28";
    ctx.fillRect(0, 0, w, h);

    // 격자
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID; i++) {
      const p = i * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(w, p);
      ctx.stroke();
    }

    // 먹이
    drawRoundedCell(food.x, food.y, "#ff6b6b", 0.25);

    // 뱀
    for (let i = snake.length - 1; i >= 0; i--) {
      const seg = snake[i];
      const isHead = i === 0;
      const t = snake.length > 1 ? i / (snake.length - 1) : 0;
      const color = isHead
        ? "#3dd68c"
        : lerpColor("#2a9d64", "#1a5c3a", t * 0.6);
      drawRoundedCell(seg.x, seg.y, color, isHead ? 0.2 : 0.28);
    }

    // 머리 눈
    if (snake.length > 0) {
      drawEyes(snake[0], direction, cs);
    }
  }

  function drawRoundedCell(gx, gy, color, padRatio) {
    const cs = cellSize;
    const pad = Math.max(1, cs * padRatio);
    const x = gx * cs + pad;
    const y = gy * cs + pad;
    const s = cs - pad * 2;
    const r = Math.max(2, s * 0.22);
    ctx.fillStyle = color;
    roundRect(x, y, s, s, r);
    ctx.fill();
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawEyes(head, dir, cs) {
    const cx = head.x * cs + cs / 2;
    const cy = head.y * cs + cs / 2;
    const eyeR = Math.max(1.5, cs * 0.1);
    const offset = cs * 0.18;
    let e1x, e1y, e2x, e2y;
    if (dir === "right") {
      e1x = cx + offset; e1y = cy - offset * 0.7;
      e2x = cx + offset; e2y = cy + offset * 0.7;
    } else if (dir === "left") {
      e1x = cx - offset; e1y = cy - offset * 0.7;
      e2x = cx - offset; e2y = cy + offset * 0.7;
    } else if (dir === "up") {
      e1x = cx - offset * 0.7; e1y = cy - offset;
      e2x = cx + offset * 0.7; e2y = cy - offset;
    } else {
      e1x = cx - offset * 0.7; e1y = cy + offset;
      e2x = cx + offset * 0.7; e2y = cy + offset;
    }
    ctx.fillStyle = "#0a1a12";
    ctx.beginPath();
    ctx.arc(e1x, e1y, eyeR, 0, Math.PI * 2);
    ctx.arc(e2x, e2y, eyeR, 0, Math.PI * 2);
    ctx.fill();
  }

  function lerpColor(a, b, t) {
    const pa = hexToRgb(a);
    const pb = hexToRgb(b);
    const r = Math.round(pa.r + (pb.r - pa.r) * t);
    const g = Math.round(pa.g + (pb.g - pa.g) * t);
    const bl = Math.round(pa.b + (pb.b - pa.b) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }

  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  // ----- Loop -----
  function loop(ts) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);
    if (paused || gameOver) {
      draw();
      return;
    }
    if (ts - lastTick >= tickMs) {
      lastTick = ts;
      update();
      draw();
    }
  }

  function startLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    running = true;
    lastTick = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stopLoop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // ----- Overlay -----
  function showOverlay(title, message, showScore) {
    overlayTitle.textContent = title;
    overlayMessage.textContent = message;
    if (showScore) {
      overlayScore.textContent = "점수: " + score + " · 최고: " + highScore;
      overlayScore.classList.remove("hidden");
    } else {
      overlayScore.classList.add("hidden");
    }
    btnStart.textContent = gameOver || !started ? "시작하기" : "계속하기";
    if (paused && !gameOver) btnStart.textContent = "계속하기";
    overlay.classList.remove("hidden");
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  // ----- Actions -----
  function startGame() {
    if (gameOver || !started) {
      resetGame();
      started = true;
    }
    paused = false;
    btnPause.textContent = "일시정지";
    btnPause.disabled = false;
    hideOverlay();
    startLoop();
    draw();
  }

  function togglePause() {
    if (!started || gameOver) return;
    if (paused) {
      paused = false;
      btnPause.textContent = "일시정지";
      hideOverlay();
      startLoop();
    } else {
      paused = true;
      btnPause.textContent = "재개";
      stopLoop();
      showOverlay("일시정지", "계속하려면 버튼을 누르세요", false);
      draw();
    }
  }

  function restart() {
    stopLoop();
    resetGame();
    started = true;
    paused = false;
    hideOverlay();
    startLoop();
    draw();
  }

  function applyDifficulty() {
    const key = difficultyEl.value;
    tickMs = SPEEDS[key] || SPEEDS.normal;
  }

  // ----- Input: keyboard -----
  const KEY_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    W: "up",
    s: "down",
    S: "down",
    a: "left",
    A: "left",
    d: "right",
    D: "right",
  };

  function onKeyDown(e) {
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (!started || gameOver) startGame();
      else togglePause();
      return;
    }
    if (e.key === "p" || e.key === "P") {
      togglePause();
      return;
    }
    const dir = KEY_MAP[e.key];
    if (dir) {
      e.preventDefault();
      if (!started || gameOver) {
        // 첫 입력으로 시작 + 방향 설정
        if (gameOver) resetGame();
        started = true;
        setDirection(dir);
        // 시작 시 반대 방향 체크 통과 위해 direction도 맞춤 가능
        if (OPPOSITE[dir] !== direction) nextDirection = dir;
        paused = false;
        hideOverlay();
        startLoop();
        return;
      }
      if (!paused) setDirection(dir);
    }
  }

  // ----- Input: D-pad -----
  function bindDpad() {
    document.querySelectorAll(".dpad-btn").forEach(function (btn) {
      const fire = function (e) {
        e.preventDefault();
        const dir = btn.getAttribute("data-dir");
        btn.classList.add("pressed");
        if (!started || gameOver) {
          if (gameOver) resetGame();
          started = true;
          if (OPPOSITE[dir] !== direction) nextDirection = dir;
          paused = false;
          hideOverlay();
          startLoop();
        } else if (!paused) {
          setDirection(dir);
        }
      };
      const release = function () {
        btn.classList.remove("pressed");
      };
      btn.addEventListener("pointerdown", fire);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointerleave", release);
      btn.addEventListener("pointercancel", release);
    });
  }

  // ----- Input: swipe on canvas -----
  function onTouchStart(e) {
    if (e.touches.length !== 1) return;
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchEnd(e) {
    if (!e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < SWIPE_MIN) return;

    let dir;
    if (absX > absY) dir = dx > 0 ? "right" : "left";
    else dir = dy > 0 ? "down" : "up";

    if (!started || gameOver) {
      if (gameOver) resetGame();
      started = true;
      if (OPPOSITE[dir] !== direction) nextDirection = dir;
      paused = false;
      hideOverlay();
      startLoop();
    } else if (!paused) {
      setDirection(dir);
    }
  }

  // ----- Events -----
  function bindEvents() {
    window.addEventListener("keydown", onKeyDown);
    btnStart.addEventListener("click", startGame);
    btnPause.addEventListener("click", togglePause);
    btnRestart.addEventListener("click", restart);
    difficultyEl.addEventListener("change", function () {
      applyDifficulty();
      // 플레이 중 난이도 변경은 속도만 반영
    });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("resize", resizeCanvas);
    bindDpad();
  }

  // ----- Init -----
  function init() {
    loadHighScore();
    applyDifficulty();
    resetGame();
    resizeCanvas();
    bindEvents();
    showOverlay("Snake", "방향키 또는 WASD로 시작 · 모바일은 스와이프/버튼", false);
    draw();
  }

  init();
})();
