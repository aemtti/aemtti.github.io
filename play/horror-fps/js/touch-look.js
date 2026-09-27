/*
 * touch-look.js — drag-to-look for first-person play on touch screens.
 *
 *   const look = createLookZone({ onLook: (dx, dy) => { ... } })
 *   look.show(true)   // gameplay
 *   look.show(false)  // menus / pause
 *
 * The zone covers the whole screen *under* the touch-kit controls, so a drag that starts anywhere
 * that is not the move stick or a button turns the camera (the right half, and the free strips
 * around the stick). touch-kit sits above it and keeps its own touches.
 * Deltas are CSS pixels; the game applies its own sensitivity. Only the first finger on the zone
 * looks, so a second resting finger never doubles the speed.
 * Every pointerdown is preventDefault()ed, so the browser does not synthesise mouse events from
 * these touches (mouse-driven game code would otherwise see clicks and camera jumps).
 */
export function createLookZone(opt = {}) {
    const el = document.createElement('div');
    el.className = 'tl-zone';
    Object.assign(el.style, {
        position: 'fixed', left: '0', top: '0', right: '0', bottom: '0',
        zIndex: String(opt.zIndex ?? 50), display: 'none', touchAction: 'none',
        WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
    });
    (opt.parent || document.body).appendChild(el);

    const ptrs = new Map(); // pointerId → last { x, y }

    el.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse') return;
        e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch (_) { /* already gone */ }
        ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
    });
    el.addEventListener('pointermove', (e) => {
        const p = ptrs.get(e.pointerId);
        if (!p) return;
        e.preventDefault();
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        p.x = e.clientX;
        p.y = e.clientY;
        if (e.pointerId === ptrs.keys().next().value && (dx || dy)) opt.onLook(dx, dy);
    });
    const end = (e) => { ptrs.delete(e.pointerId); };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('contextmenu', (e) => e.preventDefault());

    return {
        el,
        show(on) {
            el.style.display = on ? 'block' : 'none';
            if (!on) ptrs.clear();
        },
        get active() { return ptrs.size > 0; },
    };
}
