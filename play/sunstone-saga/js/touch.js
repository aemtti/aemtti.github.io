"use strict";
// ---------- Touch controls (phones and tablets) ----------
// The game still reads only its keys (input.js); this file presses them from on-screen controls
// made by touch-kit.js. A floating stick on the left walks in four ways like the arrow keys,
// A (Z) and B (X) sit under the right thumb, MENU (Enter) and SOUND (M) at the top of the
// right side, and SAVE (S) shows while the pause page is open. A tap on the picture answers
// what is on it: the title and its menu, the tale, a talk box, the pause page's item row, the
// game-over menu, the ending.
// Held upright, the picture sits at the top with the controls under it; held sideways, the
// picture is in the middle with the controls on either side. Nothing here runs on a computer
// without a touch screen (and nothing at all in the node test harness, which has none).

// main.js fitCanvas asks this first: false = lay the picture out as always.
function touchFit(cv) { return touchUI.fit ? touchUI.fit(cv) : false; }
const touchUI = { fit: null, kit: null };

(function () {
  if (typeof window === "undefined" || typeof document === "undefined" || !window.TouchKit || typeof matchMedia !== "function") return;
  const SIDE = 180;     // held sideways: room for the controls on each side of the picture (CSS px)
  const BELOW = 290;    // held upright: room for the controls under the picture
  let kit = null, active = false, dir = null, probe = null;

  // the names the screens use for the controls (input.js keyWord): the buttons' while played by touch
  function words(touch) {
    active = touch;
    window.TOUCH_PLAY = touch;
    keyWords = touch ? KEY_WORDS.touch : KEY_WORDS.keys;
    if (kit) kit.show(touch);              // a keyboard took over: the buttons step aside
  }

  // ---- the stick: four ways like the arrow keys; the axis in use holds until the other is clearly stronger
  const ARROW = { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" };
  function stickMove(x, y, on) {
    let want = null;
    if (on && Math.hypot(x, y) > 0.35) {
      const ax = Math.abs(x), ay = Math.abs(y);
      const horiz = dir === "left" || dir === "right" ? ay <= ax * 1.3 : dir === "up" || dir === "down" ? ax > ay * 1.3 : ax > ay;
      want = horiz ? (x < 0 ? "left" : "right") : (y < 0 ? "up" : "down");
    }
    if (want === dir) return;
    if (dir) TouchKit.release(ARROW[dir]);
    if (want) TouchKit.press(ARROW[want]);
    dir = want;
  }

  function insets() {
    const cs = getComputedStyle(probe);
    return { t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0, b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0 };
  }

  // ---- the picture's size and the controls around it
  function fit(cv) {
    if (!active) return false;
    const w = window.innerWidth, h = window.innerHeight, s = insets(), land = w > h;
    let k = land ? Math.min((w - s.l - s.r - 2 * SIDE) / RW, (h - s.t - s.b) / RH)
      : Math.min((w - s.l - s.r) / RW, (h - s.t - s.b - BELOW) / RH);
    k = Math.max(0.3, k);
    // whole device pixels per game pixel when that costs less than a tenth of the size (crisper)
    const dpr = window.devicePixelRatio || 1, dev = Math.floor(k * dpr);
    if (dev >= 2 && dev / dpr >= k * 0.9) k = dev / dpr;
    cv.style.width = Math.floor(RW * k) + "px";
    cv.style.height = Math.floor(RH * k) + "px";
    document.body.classList.toggle("tk-upright", !land);
    place(cv, land);
    return true;
  }
  function place(cv, land) {
    const r = cv.getBoundingClientRect();
    const zone = kit.root.querySelector(".tk-zone.l"), top = kit.root.querySelector(".tk-btns.tr");
    if (land) {
      // the stick takes the whole strip left of the picture; MENU · SOUND · SAVE stack at the top right
      Object.assign(zone.style, { left: "0px", top: "0px", bottom: "0px", width: Math.max(120, Math.round(r.left)) + "px" });
      Object.assign(top.style, { top: "", flexDirection: "column", alignItems: "flex-end" });
    } else {
      // upright: the stick under the picture on the left, MENU · SOUND · SAVE in a row under its right side
      Object.assign(zone.style, { left: "0px", top: Math.round(r.bottom) + "px", bottom: "0px", width: "55%" });
      Object.assign(top.style, { top: Math.round(r.bottom + 12) + "px", flexDirection: "row-reverse", alignItems: "" });
    }
    // the stick's resting ring, low in its new strip (as touch-kit places it)
    const base = zone.querySelector(".tk-base"), zr = zone.getBoundingClientRect();
    if (base && !base.classList.contains("on")) { base.style.left = Math.min(96, zr.width / 2) + "px"; base.style.top = Math.max(70, zr.height - 110) + "px"; }
  }

  // ---- taps on the picture (answered when the finger lifts: a file window may open from there)
  function menuRow(opts, y0, x, y) {
    const w = Math.max(...opts.map(o => textWidth2(o))) + 80, x0 = Math.round(RW / 2 - w / 2);
    if (x < x0 - 24 || x > x0 + w + 24) return -1;
    const i = Math.floor((y - (y0 + 14 - 7)) / 22);
    return i >= 0 && i < opts.length ? i : -1;
  }
  // a menu choice by tap: the first tap moves the heart to it, a tap on the chosen one takes it
  function menuTap(opts, y0, x, y, take) {
    const i = menuRow(opts, y0, x, y);
    if (i < 0) return;
    if (i !== G.menuIdx) { G.menuIdx = i; Sound.sfx("cursor"); return; }
    take(i);
  }
  function tapAt(x, y) {
    const key = (code) => TouchKit.tapKey(code);
    switch (G.mode) {
      case "title":
        if (!G.titleMenu) { key("Enter"); return; }
        menuTap(["NEW QUEST", "LOAD QUEST"], 276, x, y, (i) => {
          if (i === 1) { Sound.sfx("ui_confirm"); loadViaFile(); } else key("Enter");
        });
        return;
      case "story": case "win": key("Enter"); return;
      case "gameover":
        menuTap(["CONTINUE", "SAVE QUEST", "QUIT"], 222, x, y, (i) => { if (i === 1) saveGame(); else key("Enter"); });
        return;
      case "inv": {
        // the row of X items (screens2.js drawInventory2): a tap picks one, as Z does on it
        const L = 34, R = 478, n = B_ITEMS.length, sw = 52, gap = Math.floor((R - L - n * sw) / (n - 1));
        if (y < 60 || y > 68 + sw + 16) return;
        const i = Math.floor((x - L + gap / 2) / (sw + gap));
        if (i < 0 || i >= n) return;
        if (G.invCursor !== i) { G.invCursor = i; Sound.sfx("cursor"); }
        key("KeyZ");
        return;
      }
      case "play":
        if (G.dialog) key("KeyZ");         // the talk box turns its page (as Z)
        return;
      case "cave": {
        // the host's talk turns on a tap; buying stays on A (a tap never spends gems)
        const s = G.cave;
        if (G.dialog || (s && s.talk && !s.focus && (!s.talk.done || s.pages.length > 1))) key("KeyZ");
        return;
      }
    }
  }

  function start() {
    if (kit) return;
    TouchKit.unlockAudio();
    probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;" +
      "padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)";
    document.body.appendChild(probe);
    kit = touchUI.kit = TouchKit.create({
      sticks: [{ id: "move", side: "left", label: "", onMove: stickMove }],
      buttons: [
        { id: "a", icon: "A", label: "SWORD", key: "KeyZ", size: "l", row: 0 },
        { id: "b", icon: "B", label: "ITEM", key: "KeyX", row: 0 },
        { id: "menu", label: "MENU", key: "Enter", place: "top-right", size: "s", tap: true },
        { id: "sound", label: "SOUND", key: "KeyM", place: "top-right", size: "s", tap: true },
        { id: "save", label: "SAVE", key: "KeyS", place: "top-right", size: "s", tap: true },
      ],
      show: "always",
    });
    // (after touch-kit's own style, so these win: labels no smaller than 12px, pill-shaped small buttons)
    const st = document.createElement("style");
    st.textContent = [
      "canvas{touch-action:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}",
      "body.tk-upright{align-items:flex-start;padding-top:env(safe-area-inset-top,0px);box-sizing:border-box}",
      ".tk-root .tk-btn span{font-size:12px}",
      ".tk-root .tk-btn i{font:800 24px/1 system-ui,-apple-system,'Segoe UI',sans-serif}",
      ".tk-root .tk-btn.s{width:66px;height:44px;border-radius:22px;font-size:12px}",
    ].join("\n");
    document.head.appendChild(st);
    words(true);
    touchUI.fit = fit;
    // a real key press (a keyboard on the tablet): the screens name the keys again; a touch: the buttons
    window.addEventListener("keydown", (e) => { if (e.isTrusted && active) { words(false); if (typeof fitCanvas === "function") fitCanvas(); } }, true);
    window.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse" && !active) { words(true); if (typeof fitCanvas === "function") fitCanvas(); } }, true);
    // sound may start only inside a touch, and a touch counts when the finger lifts
    const unlock = () => { if (typeof Sound !== "undefined") Sound.unlock(); };
    window.addEventListener("pointerup", unlock, true);
    window.addEventListener("touchend", unlock, true);
    const cv = document.getElementById("game");
    let tap = null;
    cv.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      e.preventDefault();
      tap = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() };
    });
    cv.addEventListener("pointerup", (e) => {
      if (!tap || e.pointerId !== tap.id) return;
      const t = tap; tap = null;
      if (Math.hypot(e.clientX - t.x, e.clientY - t.y) > 16 || performance.now() - t.t > 600 || typeof G === "undefined") return;
      const r = cv.getBoundingClientRect();
      tapAt((e.clientX - r.left) * RW / r.width, (e.clientY - r.top) * RH / r.height);
    });
    cv.addEventListener("pointercancel", () => { tap = null; });
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    // SAVE shows only on the pause page
    let saveShown = null;
    (function watch() {
      const show = typeof G !== "undefined" && G.mode === "inv";
      if (show !== saveShown) { saveShown = show; kit.buttons.save.el.style.display = show ? "" : "none"; }
      requestAnimationFrame(watch);
    })();
  }

  if (TouchKit.isTouch()) start();
  else window.addEventListener("touchstart", function first() { window.removeEventListener("touchstart", first); start(); if (typeof fitCanvas === "function") fitCanvas(); }, { passive: true });
})();
