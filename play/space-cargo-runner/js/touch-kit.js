/* touch-kit.js — on-screen touch controls for keyboard/mouse web games. No dependencies.
 * Inline it into a single-file game (<script>…</script>) or load it next to the game.
 *
 *   const kit = TouchKit.create({
 *     sticks: [
 *       { id: 'move', side: 'left',  label: 'MOVE', keys: 'wasd' },            // 'wasd' | 'arrows' | {up,down,left,right} codes
 *       { id: 'aim',  side: 'right', label: 'AIM',  onMove: (x, y, on) => {} } // analog -1..1, on=false when released
 *     ],
 *     buttons: [ { id: 'fire', label: 'FIRE', icon: '✦', key: 'Space' },      // key: KeyboardEvent.code to hold while pressed
 *                { id: 'map', label: 'MAP', key: 'KeyM', place: 'top-right' } ],
 *     landscape: true,        // ask to rotate when the phone is held upright
 *   })
 *   kit.show(false)           // hide in menus, kit.show(true) in gameplay (default: shown on touch devices)
 *   kit.stick('aim')          // → { x, y, on }   kit.pressed('fire') → boolean
 *
 * Buttons without `key` can use onDown/onUp. Sticks with `keys` send keydown/keyup (8 directions) and still report analog x/y.
 * Keys are dispatched as KeyboardEvents (key, code, keyCode, which) on document, so window/document listeners receive them.
 * Everything else on the page keeps working: the kit only captures touches that start on its own zones/buttons.
 */
(function () {
  'use strict'
  if (window.TouchKit) return
  const KEYS = { Space: [' ', 32], Enter: ['Enter', 13], Escape: ['Escape', 27], Tab: ['Tab', 9], ShiftLeft: ['Shift', 16],
    ControlLeft: ['Control', 17], AltLeft: ['Alt', 18], ArrowLeft: ['ArrowLeft', 37], ArrowUp: ['ArrowUp', 38],
    ArrowRight: ['ArrowRight', 39], ArrowDown: ['ArrowDown', 40], Backspace: ['Backspace', 8] }
  const keyInfo = code => {
    if (KEYS[code]) return KEYS[code]
    if (/^Key[A-Z]$/.test(code)) return [code[3].toLowerCase(), code.charCodeAt(3)]
    if (/^Digit\d$/.test(code)) return [code[5], code.charCodeAt(5)]
    return [code, 0]
  }
  const held = new Map()                                   // code → count of sources holding it
  function sendKey(type, code) {
    const [key, kc] = keyInfo(code)
    const ev = new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true, composed: true })
    try { Object.defineProperty(ev, 'keyCode', { get: () => kc }); Object.defineProperty(ev, 'which', { get: () => kc }) } catch (e) {}
    const t = document.activeElement && document.activeElement !== document.body ? document.activeElement : document
    t.dispatchEvent(ev)
  }
  function press(code) { const n = held.get(code) || 0; held.set(code, n + 1); if (n === 0) sendKey('keydown', code) }
  function release(code) { const n = held.get(code) || 0; if (n <= 1) { held.delete(code); if (n === 1) sendKey('keyup', code) } else held.set(code, n - 1) }
  function tapKey(code) { press(code); setTimeout(() => release(code), 80) }

  const isTouch = () => matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0
  const CSS = `
.tk-root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font:600 11px/1 system-ui,-apple-system,'Segoe UI',sans-serif;
  letter-spacing:.06em;color:#fff;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.tk-root.tk-off{display:none}
.tk-zone{position:absolute;bottom:0;top:22%;pointer-events:auto;touch-action:none}
.tk-zone.l{left:0;width:42%}.tk-zone.r{right:0;width:42%}
.tk-base{position:absolute;width:128px;height:128px;margin:-64px 0 0 -64px;border-radius:50%;border:2px solid rgba(255,255,255,.28);
  background:radial-gradient(circle,rgba(255,255,255,.07),rgba(255,255,255,.02) 70%);transition:opacity .15s;opacity:.55}
.tk-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;
  background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.55);box-shadow:0 2px 10px rgba(0,0,0,.35)}
.tk-base.on{opacity:.95}
.tk-lab{position:absolute;left:0;right:0;top:50%;margin-top:-5px;text-align:center;opacity:.75;text-shadow:0 1px 2px #000;pointer-events:none}
.tk-btns{position:absolute;display:flex;gap:12px;pointer-events:none}
.tk-btns.br{right:calc(18px + env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom));flex-direction:column-reverse;align-items:flex-end}
.tk-btns.tr{right:calc(12px + env(safe-area-inset-right));top:calc(10px + env(safe-area-inset-top));flex-direction:row-reverse}
.tk-btns.tl{left:calc(12px + env(safe-area-inset-left));top:calc(10px + env(safe-area-inset-top))}
.tk-btns.bl{left:calc(18px + env(safe-area-inset-left));bottom:calc(20px + env(safe-area-inset-bottom));flex-direction:column-reverse}
.tk-row{display:flex;gap:12px;flex-direction:row-reverse;align-items:flex-end}
.tk-btn{pointer-events:auto;touch-action:none;width:68px;height:68px;border-radius:50%;border:2px solid rgba(255,255,255,.5);
  background:rgba(20,22,30,.42);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  box-shadow:0 2px 12px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.tk-btn.s{width:48px;height:48px;font-size:9px}.tk-btn.l{width:84px;height:84px}
.tk-btn i{font-style:normal;font-size:22px;line-height:1}.tk-btn.s i{font-size:17px}
.tk-btn.on{background:rgba(255,255,255,.34);border-color:#fff;transform:scale(.94)}
.tk-rot{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;
  background:rgba(8,9,14,.94);color:#eee;font:500 16px/1.5 system-ui,sans-serif;text-align:center;pointer-events:auto;padding:24px}
.tk-rot b{font-size:44px;display:block;animation:tkr 1.8s ease-in-out infinite}
.tk-rot button{margin-top:6px;background:none;border:1px solid #666;color:#bbb;border-radius:20px;padding:8px 18px;font:inherit;font-size:13px}
@keyframes tkr{0%,20%{transform:rotate(0)}55%,100%{transform:rotate(-90deg)}}
@media (orientation:portrait){.tk-rot.need{display:flex}}
`
  function el(tag, cls, parent, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e }

  function create(opt) {
    opt = opt || {}
    if (!document.getElementById('tk-style')) { const st = el('style'); st.id = 'tk-style'; st.textContent = CSS; document.head.appendChild(st) }
    const root = el('div', 'tk-root', document.body)
    const api = { root, sticks: {}, buttons: {}, visible: false }

    // ---- sticks: floating — the base appears where the thumb lands inside its half of the screen
    for (const s of opt.sticks || []) {
      const side = s.side === 'right' ? 'r' : 'l'
      const zone = el('div', 'tk-zone ' + side, root)
      if (s.zone) Object.assign(zone.style, s.zone)
      const base = el('div', 'tk-base', zone), knob = el('div', 'tk-knob', base)
      if (s.label) el('div', 'tk-lab', knob, s.label)
      const R = s.radius || 52, dz = s.deadzone == null ? 0.3 : s.deadzone
      const keys = s.keys === 'wasd' ? { up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD' }
        : s.keys === 'arrows' ? { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' } : s.keys || null
      const st = { x: 0, y: 0, on: false, pid: null, cx: 0, cy: 0, dirs: {} }
      api.sticks[s.id || side] = st
      const rest = () => {                                   // idle hint position; keeps clear of the bottom-right buttons
        const zr = zone.getBoundingClientRect(); let x = side === 'l' ? 96 : zr.width - 96
        if (side === 'r' && groups.br) { const gr = groups.br.getBoundingClientRect(); if (gr.width) x = Math.min(x, gr.left - zr.left - 80) }
        base.style.left = x + 'px'; base.style.top = (zr.height - 110) + 'px'
      }
      const setDirs = (want) => {
        if (!keys) return
        for (const d of ['up', 'down', 'left', 'right']) {
          if (want[d] && !st.dirs[d]) { st.dirs[d] = true; press(keys[d]) }
          else if (!want[d] && st.dirs[d]) { st.dirs[d] = false; release(keys[d]) }
        }
      }
      const move = (px, py) => {
        let dx = px - st.cx, dy = py - st.cy; const d = Math.hypot(dx, dy)
        if (d > R) { dx *= R / d; dy *= R / d }
        knob.style.transform = `translate(${dx}px,${dy}px)`
        st.x = dx / R; st.y = dy / R
        const m = Math.hypot(st.x, st.y), a = Math.atan2(st.y, st.x)
        const want = { up: false, down: false, left: false, right: false }
        if (m > dz) { const oct = Math.round(a / (Math.PI / 4)); // 8 directions
          want.right = [0, 1, -1].includes(oct); want.left = [4, -4, 3, -3].includes(oct); want.down = [1, 2, 3].includes(oct); want.up = [-1, -2, -3].includes(oct) }
        setDirs(want)
        if (s.onMove) s.onMove(st.x, st.y, true)
      }
      zone.addEventListener('pointerdown', e => {
        if (st.pid !== null) return
        e.preventDefault(); st.pid = e.pointerId; try { zone.setPointerCapture(e.pointerId) } catch (x) {}
        const zr = zone.getBoundingClientRect(); st.cx = e.clientX; st.cy = e.clientY
        base.style.left = (e.clientX - zr.left) + 'px'; base.style.top = (e.clientY - zr.top) + 'px'
        base.classList.add('on'); st.on = true; move(e.clientX, e.clientY)
        if (s.onStart) s.onStart()
      })
      zone.addEventListener('pointermove', e => { if (e.pointerId === st.pid) { e.preventDefault(); move(e.clientX, e.clientY) } })
      const end = e => {
        if (e.pointerId !== st.pid) return
        st.pid = null; st.on = false; st.x = st.y = 0; knob.style.transform = ''; base.classList.remove('on'); setDirs({}); rest()
        if (s.onMove) s.onMove(0, 0, false); if (s.onEnd) s.onEnd()
      }
      zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end)
      st.reset = () => { if (st.pid !== null) end({ pointerId: st.pid }) }
      requestAnimationFrame(rest); addEventListener('resize', rest)
    }

    // ---- buttons: grouped by place (default bottom-right cluster)
    const groups = {}
    for (const b of opt.buttons || []) {
      const place = b.place || 'bottom-right', code = { 'bottom-right': 'br', 'top-right': 'tr', 'top-left': 'tl', 'bottom-left': 'bl' }[place] || 'br'
      if (!groups[code]) groups[code] = el('div', 'tk-btns ' + code, root)
      let parent = groups[code]
      if (code === 'br' && b.row != null) { parent = groups['br' + b.row] || (groups['br' + b.row] = el('div', 'tk-row', groups.br)) }
      const btn = el('div', 'tk-btn' + (b.size ? ' ' + b.size : ''), parent, (b.icon ? `<i>${b.icon}</i>` : '') + (b.label ? `<span>${b.label}</span>` : ''))
      const bs = { down: false, pid: null, el: btn }
      api.buttons[b.id || b.label] = bs
      const down = e => {
        e.preventDefault(); e.stopPropagation()
        if (b.toggle) { bs.down = !bs.down; btn.classList.toggle('on', bs.down); if (b.key) (bs.down ? press : release)(b.key); (bs.down ? b.onDown : b.onUp) && (bs.down ? b.onDown : b.onUp)(); return }
        if (bs.pid !== null) return
        bs.pid = e.pointerId; try { btn.setPointerCapture(e.pointerId) } catch (x) {}
        bs.down = true; btn.classList.add('on')
        if (b.key) { if (b.tap) tapKey(b.key); else press(b.key) }
        if (b.onDown) b.onDown()
        if (navigator.vibrate && b.buzz !== false) try { navigator.vibrate(8) } catch (x) {}
      }
      const up = e => {
        if (b.toggle || e.pointerId !== bs.pid) return
        bs.pid = null; bs.down = false; btn.classList.remove('on')
        if (b.key && !b.tap) release(b.key)
        if (b.onUp) b.onUp()
      }
      btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up)
      btn.addEventListener('contextmenu', e => e.preventDefault())
    }

    // ---- portrait → ask to rotate (can be dismissed)
    let rot = null
    if (opt.landscape) {
      rot = el('div', 'tk-rot', document.body, `<b>⟳</b><div>${opt.rotateText || '휴대폰을 가로로 돌려 주세요'}<br><small style="opacity:.6">Rotate your phone</small></div><button type="button">그래도 세로로 하기</button>`)
      rot.querySelector('button').addEventListener('click', () => rot.classList.remove('need'))
    }

    // ---- page hygiene for touch play: no pinch/double-tap zoom, no pull-to-refresh, no long-press menu on the game
    if (opt.preventGestures !== false) {
      document.documentElement.style.overscrollBehavior = 'none'
      document.addEventListener('gesturestart', e => e.preventDefault())
      let lastT = 0
      document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastT < 300 && !(e.target.closest && e.target.closest('input,textarea,select,a,button'))) e.preventDefault(); lastT = now }, { passive: false })
    }

    api.show = on => {
      api.visible = on; root.classList.toggle('tk-off', !on); if (rot) rot.classList.toggle('need', on && !!opt.landscape)
      if (!on) { for (const s of Object.values(api.sticks)) s.reset && s.reset(); for (const [code] of held) sendKey('keyup', code); held.clear()
        for (const b of Object.values(api.buttons)) { b.down = false; b.pid = null; b.el.classList.remove('on') } }
    }
    api.stick = id => api.sticks[id] || { x: 0, y: 0, on: false }
    api.pressed = id => !!(api.buttons[id] && api.buttons[id].down)
    api.destroy = () => { api.show(false); root.remove(); if (rot) rot.remove() }
    const mode = opt.show || 'auto'
    api.show(mode === 'always' || (mode === 'auto' && isTouch()))
    if (mode === 'auto' && !api.visible) addEventListener('touchstart', function once() { removeEventListener('touchstart', once); api.show(true) }, { passive: true })
    return api
  }

  // Helpers for games that read the mouse: fire mouse events at a point (client coords).
  function mouse(target, type, x, y, extra) {
    const ev = new MouseEvent(type, Object.assign({ clientX: x, clientY: y, bubbles: true, cancelable: true, button: 0, buttons: type === 'mouseup' ? 0 : 1 }, extra || {}))
    ;(target || document.elementFromPoint(x, y) || document).dispatchEvent(ev)
  }
  // Resume every AudioContext the game creates, on the first real touch (iOS/Android need a user gesture).
  function unlockAudio() {
    const ctxs = new Set(), AC = window.AudioContext || window.webkitAudioContext
    if (AC && !AC.__tk) { const W = function (...a) { const c = new AC(...a); ctxs.add(c); return c }; W.prototype = AC.prototype; W.__tk = true; window.AudioContext = W; if (window.webkitAudioContext) window.webkitAudioContext = W }
    const go = () => { for (const c of ctxs) if (c.state === 'suspended') c.resume().catch(() => {}) }
    addEventListener('pointerdown', go, true); addEventListener('touchend', go, true)
  }
  window.TouchKit = { create, press, release, tapKey, sendKey, mouse, unlockAudio, isTouch }
})()
