// ============================================
// HORROR FPS - Touch controls (phones / tablets)
// No pointer lock on touch screens: a tap on the overlay starts "touch play".
// It reuses the PointerLockControls 'lock' / 'unlock' events, so the rest of
// the game (overlay, HUD, audio start, movement) works unchanged.
//   left floating stick  -> WASD (touch-kit sends real key events)
//   drag anywhere else   -> look (same math as PointerLockControls)
//   LIGHT (F), USE (E), pause
// Desktop never sees any of it.
// ============================================

import * as THREE from 'three';
import './touch-kit.js';
import { createLookZone } from './touch-look.js';

const SENS_KEY = 'horror-fps.touchLookSensitivity';
const LOOK_RATE = 2.6;          // mouse pixels per finger pixel at sensitivity 1.0 (~0.3 deg per pixel)
const PI_2 = Math.PI / 2;

function loadSensitivity() {
    try {
        const v = parseFloat(localStorage.getItem(SENS_KEY));
        if (v >= 0.3 && v <= 3) return v;
    } catch (e) { /* storage blocked */ }
    return 1;
}

export function setupTouch({ controls, camera, overlay }) {
    const TK = window.TouchKit;
    let lastPointer = 'mouse';     // device of the latest pointerdown
    let downTarget = null;         // element that pointerdown started on
    let active = false;            // touch play running
    let sens = loadSensitivity();
    let rotateDismissed = false;

    const root = document.documentElement;
    root.classList.toggle('touch', TK.isTouch());
    window.addEventListener('pointerdown', (e) => {
        lastPointer = e.pointerType || 'mouse';
        downTarget = e.target;
        root.classList.toggle('touch', lastPointer !== 'mouse');
    }, true);

    const kit = TK.create({
        show: 'never',
        landscape: true,
        sticks: [{ id: 'move', side: 'left', label: 'MOVE', keys: 'wasd' }],
        buttons: [
            { id: 'use', label: 'USE', icon: '✋', key: 'KeyE', tap: true, size: 'l', row: 0 },
            { id: 'light', label: 'LIGHT', icon: '🔦', key: 'KeyF', tap: true, row: 0 },
            { id: 'pause', label: 'PAUSE', icon: '❚❚', size: 's', place: 'top-left', onDown: () => release() },
        ],
    });
    for (const b of document.querySelectorAll('.tk-rot button')) {
        b.addEventListener('click', () => { rotateDismissed = true; });
    }

    // Look: identical to PointerLockControls' mouse handler, fed with finger movement.
    const euler = new THREE.Euler(0, 0, 0, 'YXZ');
    const look = createLookZone({
        zIndex: 60,
        onLook: (dx, dy) => {
            if (!controls.isLocked) return;
            const k = 0.002 * controls.pointerSpeed * LOOK_RATE * sens;
            euler.setFromQuaternion(camera.quaternion);
            euler.y -= dx * k;
            euler.x -= dy * k;
            euler.x = Math.max(PI_2 - controls.maxPolarAngle, Math.min(PI_2 - controls.minPolarAngle, euler.x));
            camera.quaternion.setFromEuler(euler);
            controls.dispatchEvent({ type: 'change' });
        },
    });

    function show(on) {
        kit.show(on);
        look.show(on);
        if (on && rotateDismissed) for (const r of document.querySelectorAll('.tk-rot')) r.classList.remove('need');
    }

    /**
     * Overlay click. Returns true when the click was a touch (handled here, no pointer lock).
     * Phones hit-test the click again when the finger lifts, so only a tap that *began* on the
     * overlay starts play — otherwise the pause tap would land on the overlay it just revealed.
     */
    function startIfTouch() {
        if (lastPointer === 'mouse') return false;
        if (!downTarget || !overlay.contains(downTarget) || downTarget.closest('.touch-settings')) return true;
        if (!controls.isLocked) {
            active = true;
            controls.dispatchEvent({ type: 'lock' });   // same order as PointerLockControls
            controls.isLocked = true;
            show(true);
        }
        return true;
    }

    /** Leave play: the touch pause, or the real pointer lock on desktop. */
    function release() {
        if (active) {
            active = false;
            show(false);
            if (controls.isLocked) {
                controls.dispatchEvent({ type: 'unlock' });
                controls.isLocked = false;
            }
            return;
        }
        controls.unlock();
    }

    // Look sensitivity slider on the overlay (touch only)
    const slider = document.getElementById('touch-sens');
    const out = document.getElementById('touch-sens-value');
    if (slider) {
        slider.value = String(sens);
        const label = () => { if (out) out.textContent = `${sens.toFixed(2)}x`; };
        label();
        slider.addEventListener('input', () => {
            sens = parseFloat(slider.value) || 1;
            label();
            try { localStorage.setItem(SENS_KEY, String(sens)); } catch (e) { /* storage blocked */ }
        });
    }

    return {
        startIfTouch,
        release,
        get active() { return active; },
    };
}
