// input.js — keyboard, mouse, pointer lock. Mouse deltas accumulate between ticks
// so the view never desyncs from the physics step.
//
// Touch screens have no pointer lock. While the last pointer was a finger
// (`Input.touch`), requestLock()/exitLock() toggle a "touch lock" instead: the
// same `locked` flag and onLockChange callback, no browser lock. The on-screen
// controls (ui/touch.js) then feed keys, mouse buttons and addLook().
import { settings } from './settings.js';

const M_YAW = 0.022;                    // degrees of yaw per mouse count (CS default)
const TOUCH_LOOK = 0.0048;              // radians of view per finger pixel at touch sensitivity 1

export const Input = {
  keys: Object.create(null),            // code -> true while held
  pressed: Object.create(null),         // code -> true for one consume() window
  released: Object.create(null),
  mouse: [false, false, false],
  mousePressed: [false, false, false],
  mouseReleased: [false, false, false],
  dx: 0, dy: 0,                         // accumulated raw counts
  wheel: 0,
  locked: false,
  enabled: false,                       // gameplay input active?
  lockBlocked: false,                   // a menu wants the cursor free
  touch: false,                         // last pointer was a finger/pen: touch controls, no pointer lock
  onLockChange: null,
  onEscape: null,
  _el: null,
};

const BLOCK_DEFAULT = new Set([
  'Tab', 'Space', 'KeyB', 'Digit0', 'Digit1', 'Digit2', 'Digit3', 'Digit4',
  'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Backspace',
  'F1', 'F3', 'F5', 'Slash', 'Quote',
]);

export function initInput(el) {
  Input._el = el;
  Input.touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  addEventListener('pointerdown', (e) => { Input.touch = e.pointerType !== 'mouse'; }, true);

  addEventListener('keydown', (e) => {
    if (BLOCK_DEFAULT.has(e.code)) e.preventDefault();
    if (e.repeat) return;
    if (e.code === 'Escape') { Input.onEscape && Input.onEscape(); return; }
    Input.keys[e.code] = true;
    Input.pressed[e.code] = true;
  });

  addEventListener('keyup', (e) => {
    Input.keys[e.code] = false;
    Input.released[e.code] = true;
  });

  addEventListener('blur', () => {
    for (const k in Input.keys) Input.keys[k] = false;
    Input.mouse[0] = Input.mouse[1] = Input.mouse[2] = false;
  });

  el.addEventListener('mousedown', (e) => {
    if (Input.lockBlocked) return;      // menu open: leave the cursor alone
    if (Input.touch) return;            // a mouse event the browser made from a tap: the touch buttons own firing
    if (!Input.locked && Input.enabled) { requestLock(); return; }
    if (e.button < 3) { Input.mouse[e.button] = true; Input.mousePressed[e.button] = true; }
  });
  addEventListener('mouseup', (e) => {
    if (Input.touch) return;
    if (e.button < 3) { Input.mouse[e.button] = false; Input.mouseReleased[e.button] = true; }
  });
  el.addEventListener('contextmenu', (e) => e.preventDefault());

  addEventListener('mousemove', (e) => {
    if (!Input.locked || Input.touch) return;
    Input.dx += e.movementX || 0;
    Input.dy += e.movementY || 0;
  });

  addEventListener('wheel', (e) => {
    if (!Input.locked) return;
    e.preventDefault();
    Input.wheel += Math.sign(e.deltaY);
  }, { passive: false });

  document.addEventListener('pointerlockchange', () => {
    Input.locked = document.pointerLockElement === el;
    if (!Input.locked) {
      for (const k in Input.keys) Input.keys[k] = false;
      Input.mouse[0] = Input.mouse[1] = Input.mouse[2] = false;
    }
    Input.onLockChange && Input.onLockChange(Input.locked);
  });
}

export function requestLock() {
  const el = Input._el;
  if (!el || Input.lockBlocked || document.pointerLockElement === el) return;
  if (Input.touch) { setTouchLock(true); return; }
  const p = el.requestPointerLock && el.requestPointerLock();
  if (p && p.catch) p.catch(() => {});
}

export function exitLock() {
  if (Input.locked && document.pointerLockElement !== Input._el) { setTouchLock(false); return; }
  if (document.pointerLockElement) document.exitPointerLock();
}

/** touch play: the pointer-lock state without a browser lock (same callback as pointerlockchange) */
function setTouchLock(on) {
  if (Input.locked === on) return;
  Input.locked = on;
  Input.dx = 0; Input.dy = 0;
  if (!on) {
    for (const k in Input.keys) Input.keys[k] = false;
    Input.mouse[0] = Input.mouse[1] = Input.mouse[2] = false;
  }
  Input.onLockChange && Input.onLockChange(on);
}

/** look from a finger drag (CSS pixels). Independent of the mouse sensitivity setting. */
export function addLook(dxPx, dyPx) {
  if (!Input.locked) return;
  const perCount = settings.sens * M_YAW * Math.PI / 180;
  const k = TOUCH_LOOK * (settings.touchSens || 1) / perCount;
  Input.dx += dxPx * k;
  Input.dy += dyPx * k;
}

/** radians of view movement accumulated since last call */
export function takeLook() {
  const s = settings.sens * M_YAW * Math.PI / 180;
  const yaw = -Input.dx * s;
  const pitch = (settings.invertY ? -1 : 1) * Input.dy * s;
  Input.dx = 0; Input.dy = 0;
  return { yaw, pitch };
}

/** call once at the end of every frame */
export function endFrame() {
  for (const k in Input.pressed) Input.pressed[k] = false;
  for (const k in Input.released) Input.released[k] = false;
  Input.mousePressed[0] = Input.mousePressed[1] = Input.mousePressed[2] = false;
  Input.mouseReleased[0] = Input.mouseReleased[1] = Input.mouseReleased[2] = false;
  Input.wheel = 0;
}

export const down = (code) => !!Input.keys[code];
export const hit = (code) => !!Input.pressed[code];
export const up = (code) => !!Input.released[code];

/** movement intent in local axes, -1..1 */
export function moveAxes() {
  let f = 0, s = 0;
  if (down('KeyW') || down('ArrowUp')) f += 1;
  if (down('KeyS') || down('ArrowDown')) f -= 1;
  if (down('KeyA') || down('ArrowLeft')) s -= 1;
  if (down('KeyD') || down('ArrowRight')) s += 1;
  return { f, s };
}
