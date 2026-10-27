/* Our Story photo rail.

   The row of photographs drifts sideways as the page scrolls: moving down
   the page slides it left, moving back up slides it right. It can also be
   dragged with a mouse or a finger, and moved with the arrow keys when it
   has focus. Dragging adds to wherever the scroll has put it, and the two
   together are kept inside the row's own length so it never runs off.

   With reduced motion the scroll drift is off; dragging and keys still
   work, and the row moves without easing. */

export function initDrift() {
  const rail = document.querySelector('[data-drift-rail]');
  const track = rail && rail.querySelector('[data-drift-track]');
  if (!rail || !track) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SCROLL_SHARE = 0.75;   // how much of the row the page scroll alone reveals

  let max = 0;        // how far left the row can go, in px
  let drag = 0;       // offset added by dragging or keys
  let shown = 0;      // where the row is drawn now
  let target = 0;     // where it is heading
  let running = false;

  const measure = () => {
    const styles = getComputedStyle(rail);
    const inset = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    max = Math.max(0, track.scrollWidth - (rail.clientWidth - inset));
  };

  // 0 as the section's top enters the bottom of the screen,
  // 1 as its bottom leaves the top
  const progress = () => {
    if (reduce) return 0;
    const r = rail.getBoundingClientRect();
    const vh = innerHeight;
    return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
  };

  const update = () => {
    const fromScroll = -progress() * max * SCROLL_SHARE;
    const raw = fromScroll + drag;
    target = Math.min(0, Math.max(-max, raw));
    drag = target - fromScroll;   // drop any drag that went past the ends
    if (!running) { running = true; requestAnimationFrame(frame); }
  };

  const frame = () => {
    shown = reduce || dragging ? target : shown + (target - shown) * 0.12;
    track.style.transform = `translate3d(${shown.toFixed(2)}px, 0, 0)`;
    if (Math.abs(target - shown) > 0.3) requestAnimationFrame(frame);
    else { shown = target; track.style.transform = `translate3d(${shown}px, 0, 0)`; running = false; }
  };

  // ---- dragging ----
  let dragging = false;
  let startX = 0;
  let startDrag = 0;
  let moved = 0;

  rail.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true;
    moved = 0;
    startX = e.clientX;
    startDrag = drag;
    rail.setPointerCapture(e.pointerId);
    rail.classList.add('is-dragging');
  });
  rail.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    drag = startDrag + dx;
    update();
  });
  const end = (e) => {
    if (!dragging) return;
    dragging = false;
    rail.classList.remove('is-dragging');
    if (rail.hasPointerCapture(e.pointerId)) rail.releasePointerCapture(e.pointerId);
    update();
  };
  rail.addEventListener('pointerup', end);
  rail.addEventListener('pointercancel', end);
  // a drag should not also count as a click on anything inside
  rail.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

  // ---- keys ----
  rail.addEventListener('keydown', (e) => {
    const step = rail.clientWidth * 0.4;
    if (e.key === 'ArrowLeft') { drag += step; update(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { drag -= step; update(); e.preventDefault(); }
  });

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', () => { measure(); update(); });
  // images can change the row's length as they load
  track.querySelectorAll('img').forEach((img) => {
    if (!img.complete) img.addEventListener('load', () => { measure(); update(); }, { once: true });
  });

  measure();
  update();
}
