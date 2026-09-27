// touch-look.js — drag-to-look for first-person play on touch screens.
//
//   const look = createLookZone({ onLook: (dx, dy) => { ... } });
//   look.show(true);    // gameplay
//   look.show(false);   // menus / pause
//
// The zone covers the whole stage *under* the touch-kit controls, so a drag that starts
// anywhere that is not the move stick or a button turns the view. Deltas are CSS pixels;
// the caller applies sensitivity. Only the first finger on the zone looks, so a resting
// second finger never doubles the speed. Every pointerdown is preventDefault()ed, so the
// browser does not synthesise mouse events (clicks = gunfire) from these touches.
export function createLookZone(opt = {}) {
  const el = document.createElement('div');
  el.className = 'tl-zone';
  Object.assign(el.style, {
    position: 'absolute', left: '0', top: '0', right: '0', bottom: '0',
    zIndex: String(opt.zIndex ?? 10), display: 'none', touchAction: 'none',
    WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
  });
  (opt.parent || document.body).appendChild(el);

  const ptrs = new Map();                 // pointerId -> last { x, y }

  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    e.preventDefault();
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  });
  el.addEventListener('pointermove', (e) => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    e.preventDefault();
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
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
