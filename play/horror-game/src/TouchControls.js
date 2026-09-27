import eventBus from './EventBus.js';
import './touch-kit.js';
import { createLookZone } from './touch-look.js';

/**
 * TouchControls — on-screen controls for phones and tablets.
 *
 * There is no pointer lock on touch screens, so a tap on the start screen puts
 * InputManager into its "touch lock" (see InputManager.setTouchLock) and this module shows:
 *   - left floating stick  → WASD (touch-kit sends real key events)
 *   - drag anywhere else   → look (fed into InputManager like mouse movement)
 *   - USE (E), RUN (Shift, toggle), MAP (M), DEBUG (T), pause (Esc)
 * Desktop never sees any of it: the controls only appear while a touch-started game is running.
 */

const SENS_KEY = 'horror-game.touchLookSensitivity';
// Mouse "pixels" per finger pixel at sensitivity 1.0 → 2.6 × MOUSE_SENSITIVITY ≈ 0.3° per finger pixel.
const LOOK_RATE = 2.6;

function loadSensitivity() {
    try {
        const v = parseFloat(localStorage.getItem(SENS_KEY));
        if (v >= 0.3 && v <= 3) return v;
    } catch (_) { /* storage blocked */ }
    return 1;
}

class TouchControls {
    constructor(inputManager) {
        this._input = inputManager;
        this._sens = loadSensitivity();
        this._rotateDismissed = false;

        const TK = window.TouchKit;
        this._kit = TK.create({
            show: 'never',            // shown by _sync() while a touch game is running
            landscape: true,
            sticks: [{ id: 'move', side: 'left', label: 'MOVE', keys: 'wasd' }],
            buttons: [
                { id: 'use', label: 'USE', icon: '✋', key: 'KeyE', tap: true, size: 'l', row: 0 },
                { id: 'run', label: 'RUN', icon: '»', key: 'ShiftLeft', toggle: true, row: 0 },
                { id: 'map', label: 'MAP', key: 'KeyM', tap: true, size: 's', row: 1 },
                { id: 'debug', label: 'DEBUG', key: 'KeyT', tap: true, size: 's', row: 1 },
                { id: 'pause', label: 'PAUSE', icon: '❚❚', key: 'Escape', tap: true, size: 's', place: 'top-left' },
            ],
        });
        this._look = createLookZone({
            zIndex: 50,
            onLook: (dx, dy) => {
                const k = LOOK_RATE * this._sens;
                this._input.addLookDelta(dx * k, dy * k);
            },
        });

        // The rotate hint is dismissible; keep it dismissed after pause/resume.
        for (const b of document.querySelectorAll('.tk-rot button')) {
            b.addEventListener('click', () => { this._rotateDismissed = true; });
        }

        // Page text follows the input device in use (html.touch → touch hints on the start screen).
        const root = document.documentElement;
        root.classList.toggle('touch', TK.isTouch());
        window.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'mouse') root.classList.remove('touch');
            else root.classList.add('touch');
        }, true);

        // First touch unlocks audio on iOS/Android (future sound systems create AudioContexts).
        TK.unlockAudio();

        eventBus.on('input:pointerLock', ({ locked }) => this._sync(locked));
        this._wireSensitivity();
    }

    _sync(locked) {
        const on = locked && this._input.isTouchMode;
        this._kit.show(on);
        this._look.show(on);
        if (on && this._rotateDismissed) {
            for (const r of document.querySelectorAll('.tk-rot')) r.classList.remove('need');
        }
    }

    _wireSensitivity() {
        const slider = document.getElementById('touch-sens');
        const out = document.getElementById('touch-sens-value');
        if (!slider) return;
        slider.value = String(this._sens);
        const show = () => { if (out) out.textContent = `${this._sens.toFixed(2)}×`; };
        show();
        slider.addEventListener('input', () => {
            this._sens = parseFloat(slider.value) || 1;
            show();
            try { localStorage.setItem(SENS_KEY, String(this._sens)); } catch (_) { /* storage blocked */ }
        });
    }
}

export default TouchControls;
