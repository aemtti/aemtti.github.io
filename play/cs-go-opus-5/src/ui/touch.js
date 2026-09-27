// touch.js — on-screen controls for phones and tablets. Nothing here shows on desktop.
//
// There is no pointer lock on touch screens: while the last pointer was a finger,
// core/input.js turns requestLock()/exitLock() into a "touch lock" and this module
// shows the controls for whatever is running:
//
//   match      left stick = W A S D, drag anywhere else = look (FIRE and SCOPE can be
//              dragged too, so a spray can be pulled down while firing),
//              FIRE / SCOPE (mouse 1 / 2), JUMP, CROUCH (toggle), RELOAD, USE (hold E),
//              WALK (toggle Shift), GUNS (slots 1-5, last weapon, drop), BUY, SCORE, pause
//   inspector  fly stick, UP / DOWN, TP / PATH (mouse 1 / 2), FAST / SLOW, MODE (F),
//              KEYS (every other inspector key), EXIT
//
// Everything goes through the same Input state the keyboard and mouse fill, so the
// game code does not know the difference.
import './touch-kit.js';
import { createLookZone } from './touch-look.js';
import { Input, addLook } from '../core/input.js';
import { resumeAudio } from '../core/audio.js';
import { WEAPONS, SLOT } from '../game/weapons.js';
import { slotWeapon } from '../game/player.js';

const $ = (id) => document.getElementById(id);

// inspector keys that have no button of their own ("/ help" lists keyboard keys, so touch
// screens hide that panel and this pad takes its place)
const INSPECTOR_KEYS = [
  ['KeyR', 'R  reset'], ['KeyB', 'B  boxes'], ['KeyN', 'N  nav'], ['KeyV', 'V  hull'],
  ['KeyH', 'H  hitbox'], ['KeyM', 'M  render'], ['KeyL', 'L  shadow'], ['KeyK', 'K  sky'],
  ['KeyJ', 'J  dummy'], ['KeyX', 'X  clear'], ['KeyI', 'I  info'],
  ['BracketLeft', '[  prev'], ['BracketRight', ']  next'],
  ['Digit1', '1'], ['Digit2', '2'], ['Digit3', '3'], ['Digit4', '4'], ['Digit5', '5'],
  ['Digit6', '6'], ['Digit7', '7'], ['Digit8', '8'], ['Digit9', '9'], ['Digit0', '0'],
  ['wheel+', 'speed −'], ['wheel-', 'speed +'],
];

export class TouchUI {
  constructor(game) {
    this.game = game;
    this.mode = null;               // controls on screen: null | 'match' | 'debug'
    this.pad = null;                // open pop-up: null | 'guns' | 'keys'
    this.rotateDismissed = false;
    const TK = this.TK = window.TouchKit;
    const stage = $('stage');

    const mouseButton = (i) => ({
      onDown: () => { Input.mouse[i] = true; Input.mousePressed[i] = true; },
      onUp: () => { Input.mouse[i] = false; Input.mouseReleased[i] = true; },
    });

    // ---- match controls (bottom-right rows fill from the right edge)
    this.match = TK.create({
      show: 'never',
      landscape: true,
      sticks: [{ id: 'move', side: 'left', label: 'MOVE', keys: 'wasd' }],
      buttons: [
        { id: 'fire', label: 'FIRE', icon: '✦', size: 'l', row: 0, buzz: false, ...mouseButton(0) },
        { id: 'jump', label: 'JUMP', icon: '▲', key: 'Space', row: 0 },
        { id: 'scope', label: 'SCOPE', icon: '◎', row: 1, ...mouseButton(2) },
        { id: 'crouch', label: 'CROUCH', icon: '▼', key: 'KeyC', toggle: true, row: 1 },
        { id: 'reload', label: 'RELOAD', icon: '↻', key: 'KeyR', tap: true, row: 1 },
        { id: 'guns', label: 'GUNS', size: 's', row: 2, onDown: () => this.togglePad('guns') },
        { id: 'walk', label: 'WALK', size: 's', key: 'ShiftLeft', toggle: true, row: 2 },
        { id: 'use', label: 'USE', size: 's', key: 'KeyE', row: 2 },
        { id: 'pause', icon: '❚❚', size: 's', place: 'top-right', key: 'Escape', tap: true },
        { id: 'score', label: 'SCORE', size: 's', place: 'top-right', key: 'Tab', toggle: true },
        { id: 'buy', label: 'BUY', size: 's', place: 'top-right', key: 'KeyB', tap: true },
      ],
    });
    this.match.root.classList.add('tk-match');
    this.dragLook(this.match.buttons.fire.el);
    this.dragLook(this.match.buttons.scope.el);

    // ---- map inspector controls
    this.inspector = TK.create({
      show: 'never',
      landscape: true,
      sticks: [{ id: 'move', side: 'left', label: 'FLY', keys: 'wasd' }],
      buttons: [
        { id: 'up', label: 'UP', icon: '▲', key: 'Space', size: 'l', row: 0 },
        { id: 'down', label: 'DOWN', icon: '▼', key: 'KeyC', row: 0 },
        { id: 'tp', label: 'TP', icon: '⌖', row: 1, ...mouseButton(0) },
        { id: 'path', label: 'PATH', icon: '⋯', row: 1, ...mouseButton(2) },
        { id: 'mode', label: 'MODE', size: 's', key: 'KeyF', tap: true, row: 2 },
        { id: 'slow', label: 'SLOW', size: 's', key: 'AltLeft', toggle: true, row: 2 },
        { id: 'fast', label: 'FAST', size: 's', key: 'ShiftLeft', toggle: true, row: 2 },
        { id: 'exit', label: 'EXIT', size: 's', place: 'top-right', key: 'Escape', tap: true },
        { id: 'keys', label: 'KEYS', size: 's', place: 'top-right', onDown: () => this.togglePad('keys') },
      ],
    });
    this.inspector.root.classList.add('tk-inspector');
    this.dragLook(this.inspector.buttons.tp.el);

    // ---- drag anywhere else to look (inside #stage, under menus, over the HUD canvas)
    this.look = createLookZone({ parent: stage, zIndex: 10, onLook: (dx, dy) => addLook(dx, dy) });

    // ---- pop-up pad (weapon slots / inspector keys). It lives above the touch-kit layer:
    // under it, the kit's full-height stick zone would take every tap on its left half.
    this.padEl = document.createElement('div');
    this.padEl.id = 'touch-pad';
    this.padEl.className = 'hidden';
    document.body.appendChild(this.padEl);

    // ---- buy menu: a close button for fingers (keyboard players press B / Esc)
    const close = $('buy-close');
    if (close) close.addEventListener('click', () => game.buy.toggle(false));

    // the rotate hint can be dismissed; keep it dismissed after pause / resume
    for (const b of document.querySelectorAll('.tk-rot button')) {
      b.addEventListener('click', () => { this.rotateDismissed = true; this.hideRotateHints(); });
    }

    // safe-area insets (notch, home bar) for the canvas HUD — canvas drawing cannot see CSS env()
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;' +
      'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
    document.body.appendChild(probe);
    const readSafe = () => {
      const cs = getComputedStyle(probe);
      game.safe = {
        t: parseFloat(cs.paddingTop) || 0, r: parseFloat(cs.paddingRight) || 0,
        b: parseFloat(cs.paddingBottom) || 0, l: parseFloat(cs.paddingLeft) || 0,
      };
    };
    readSafe();
    addEventListener('resize', readSafe);
    addEventListener('orientationchange', () => setTimeout(readSafe, 200));

    // page text follows the device in use; audio is resumed inside touch gestures (iOS)
    const root = document.documentElement;
    root.classList.toggle('touch', Input.touch);
    addEventListener('pointerdown', () => {
      root.classList.toggle('touch', Input.touch);
      if (Input.touch) resumeAudio();
    }, true);
    addEventListener('touchend', () => resumeAudio(), true);
  }

  /** a finger that holds `el` (FIRE, SCOPE, TP) also turns the view while it slides */
  dragLook(el) {
    let id = null, x = 0, y = 0;
    el.addEventListener('pointerdown', (e) => { id = e.pointerId; x = e.clientX; y = e.clientY; });
    el.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      addLook(e.clientX - x, e.clientY - y);
      x = e.clientX; y = e.clientY;
    });
    const end = (e) => { if (e.pointerId === id) id = null; };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  }

  hideRotateHints() {
    for (const r of document.querySelectorAll('.tk-rot')) r.classList.remove('need');
  }

  /** called every frame and on every lock change: show the controls that fit the game state */
  update() {
    const g = this.game;
    g.touchUI = Input.touch;
    const want = Input.touch && Input.locked && g.running && !g.paused ? g.mode : null;
    if (want === this.mode) return;
    this.mode = want;
    this.closePad();
    this.match.show(want === 'match');
    this.inspector.show(want === 'debug');
    this.look.show(!!want);
    if (this.rotateDismissed) this.hideRotateHints();
  }

  // ---------------------------------------------------------------- pop-up pad
  togglePad(kind) {
    if (this.pad === kind) { this.closePad(); return; }
    this.pad = kind;
    const items = kind === 'guns' ? this.gunItems() : INSPECTOR_KEYS.map(([code, label]) => ({ code, label }));
    this.padEl.className = 'pad-' + kind;
    this.padEl.innerHTML = '';
    for (const it of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      if (it.off) b.className = 'off';
      b.addEventListener('click', () => {
        if (it.code === 'wheel+') Input.wheel += 1;
        else if (it.code === 'wheel-') Input.wheel -= 1;
        else this.TK.tapKey(it.code);
        if (kind === 'guns') this.closePad();
      });
      this.padEl.appendChild(b);
    }
  }

  closePad() {
    this.pad = null;
    this.padEl.className = 'hidden';
  }

  /** weapon slots with the names of what the player actually carries */
  gunItems() {
    const pl = this.game.localPlayer;
    const name = (id) => (id && WEAPONS[id] ? WEAPONS[id].name : null);
    const nades = pl ? pl.inv.nades.map((n) => name(n)).join(' / ') : '';
    const rows = [
      { code: 'Digit1', label: '1  ' + (name(pl && slotWeapon(pl, SLOT.PRIMARY)) || 'Primary'), off: !(pl && pl.inv.primary) },
      { code: 'Digit2', label: '2  ' + (name(pl && slotWeapon(pl, SLOT.SECONDARY)) || 'Pistol'), off: !(pl && pl.inv.secondary) },
      { code: 'Digit3', label: '3  Knife' },
      { code: 'Digit4', label: '4  ' + (nades || 'Grenades'), off: !nades },
      { code: 'Digit5', label: '5  C4', off: !(pl && pl.inv.c4) },
      { code: 'KeyQ', label: 'Q  last weapon' },
      { code: 'KeyG', label: 'G  drop weapon' },
    ];
    return rows;
  }
}
