import eventBus from './EventBus.js';
import { MOUSE_SENSITIVITY } from './utils/Constants.js';

/**
 * InputManager — Handles keyboard state, mouse movement, and pointer lock.
 * Emits input events through EventBus; never accessed directly by other modules.
 *
 * Touch screens have no pointer lock. A tap on the start screen enters a
 * "touch lock" instead: the same 'input:pointerLock' event fires, WASD comes
 * from the on-screen stick (real key events) and look comes from addLookDelta().
 */
class InputManager {
    constructor(canvas) {
        this._canvas = canvas;
        this._keys = new Map();
        this._mouseDX = 0;
        this._mouseDY = 0;
        this._pointerLocked = false;
        this._touchMode = false;           // true while a touch-started game is running
        this._lastPointerType = 'mouse';   // device of the latest pointerdown
        this._downTarget = null;           // element the latest pointerdown started on

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onPointerLockChange = this._onPointerLockChange.bind(this);
        this._onClick = this._onClick.bind(this);
        this._onPointerDown = (e) => {
            this._lastPointerType = e.pointerType || 'mouse';
            this._downTarget = e.target;
        };

        this._attach();
    }

    _attach() {
        document.addEventListener('keydown', this._onKeyDown);
        document.addEventListener('keyup', this._onKeyUp);
        document.addEventListener('mousemove', this._onMouseMove);
        document.addEventListener('pointerlockchange', this._onPointerLockChange);
        // Listen on document so clicks on the start-screen overlay
        // still trigger pointer lock on the canvas underneath.
        document.addEventListener('click', this._onClick);
        window.addEventListener('pointerdown', this._onPointerDown, true);
    }

    // ── Pointer Lock ────────────────────────────────────

    _onClick(e) {
        if (this._lastPointerType !== 'mouse') {
            // Touch: only a tap that *began* on the start/pause screen starts play. Phones hit-test
            // the click again when the finger lifts, so the pause button's own tap would otherwise
            // land on the pause screen that just appeared under it and resume at once.
            const d = this._downTarget;
            if (!this._pointerLocked && d && d.closest &&
                d.closest('#start-screen') && !d.closest('.touch-settings')) {
                this.setTouchLock(true);
            }
            return;
        }
        console.log('click received, pointerLocked:', this._pointerLocked);
        if (!this._pointerLocked) {
            // Chrome rejects the request (e.g. a click right after Esc); that is not an error here.
            const req = this._canvas.requestPointerLock();
            if (req && req.catch) req.catch(() => {});
        }
    }

    _onPointerLockChange() {
        this._pointerLocked = document.pointerLockElement === this._canvas;
        if (this._pointerLocked) this._touchMode = false;
        eventBus.emit('input:pointerLock', { locked: this._pointerLocked });
    }

    /** Touch replacement for pointer lock: same event, no browser lock. */
    setTouchLock(locked) {
        if (locked) this._touchMode = true;
        if (this._pointerLocked === locked) return;
        this._pointerLocked = locked;
        this._mouseDX = 0;
        this._mouseDY = 0;
        eventBus.emit('input:pointerLock', { locked });
    }

    /** Leave play (pause): exits the real pointer lock, or the touch lock on phones. */
    exitLock() {
        if (this._touchMode && document.pointerLockElement !== this._canvas) {
            this.setTouchLock(false);
            return;
        }
        document.exitPointerLock();
    }

    /** Look input from the touch drag zone, in mouse-pixel units. */
    addLookDelta(dx, dy) {
        if (!this._pointerLocked) return;
        this._mouseDX += dx;
        this._mouseDY += dy;
    }

    get isLocked() {
        return this._pointerLocked;
    }

    get isTouchMode() {
        return this._touchMode;
    }

    // ── Keyboard ────────────────────────────────────────

    _onKeyDown(e) {
        const key = e.code;
        if (this._keys.get(key)) return; // ignore repeat
        this._keys.set(key, true);

        // Discrete events for single-press actions
        if (key === 'KeyE') eventBus.emit('input:interact');
        if (key === 'KeyF') eventBus.emit('input:flashlight');
        if (key === 'KeyT') eventBus.emit('input:debugToggle');
        if (key === 'KeyM') eventBus.emit('input:minimapToggle');
        if (key === 'Tab') {
            e.preventDefault();
            eventBus.emit('input:inventory');
        }
        if (key === 'Escape') eventBus.emit('input:pause');
    }

    _onKeyUp(e) {
        this._keys.set(e.code, false);
    }

    isKeyDown(code) {
        return this._keys.get(code) === true;
    }

    // ── Mouse ───────────────────────────────────────────

    _onMouseMove(e) {
        // In touch play the look comes from addLookDelta(); ignore mouse events a browser synthesises from taps.
        if (!this._pointerLocked || this._touchMode) return;
        this._mouseDX += e.movementX;
        this._mouseDY += e.movementY;
    }

    /**
     * Consume accumulated mouse delta (call once per frame).
     * Returns { dx, dy } in radians.
     */
    consumeMouseDelta() {
        const dx = this._mouseDX * MOUSE_SENSITIVITY;
        const dy = this._mouseDY * MOUSE_SENSITIVITY;
        this._mouseDX = 0;
        this._mouseDY = 0;
        return { dx, dy };
    }

    // ── Movement helpers ────────────────────────────────

    /**
     * Returns a normalized { x, z } movement vector based on WASD state.
     * x = strafe (right positive), z = forward (negative = forward in Three.js).
     */
    getMovementInput() {
        let x = 0;
        let z = 0;
        if (this.isKeyDown('KeyW')) z -= 1;
        if (this.isKeyDown('KeyS')) z += 1;
        if (this.isKeyDown('KeyA')) x -= 1;
        if (this.isKeyDown('KeyD')) x += 1;

        // Normalize diagonal movement
        const len = Math.sqrt(x * x + z * z);
        if (len > 0) {
            x /= len;
            z /= len;
        }

        return { x, z };
    }

    isRunning() {
        return this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
    }

    // ── Cleanup ─────────────────────────────────────────

    dispose() {
        document.removeEventListener('keydown', this._onKeyDown);
        document.removeEventListener('keyup', this._onKeyUp);
        document.removeEventListener('mousemove', this._onMouseMove);
        document.removeEventListener('pointerlockchange', this._onPointerLockChange);
        document.removeEventListener('click', this._onClick);
        window.removeEventListener('pointerdown', this._onPointerDown, true);
    }
}

export default InputManager;
