/* Zoom for the archive item photograph.
   Pointer in: the photo scales up and the origin tracks the cursor, so
   moving around pans the enlarged image. Click (or Enter/Space) holds the
   zoom, which is what touch and keyboard need since they have no hover.
   Escape lets go. Disabled under reduced motion. */

export function initZoom() {
  const stage = document.querySelector('[data-zoom]');
  if (!stage) return;

  const hint = document.querySelector('[data-zoom-hint]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let held = false;

  const setOrigin = (e) => {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    stage.style.setProperty('--zx', `${Math.min(100, Math.max(0, x))}%`);
    stage.style.setProperty('--zy', `${Math.min(100, Math.max(0, y))}%`);
  };

  const zoom = (state) => {
    stage.classList.toggle('is-zoomed', state);
    hint?.classList.toggle('is-hidden', state);
    stage.setAttribute('aria-pressed', String(state));
  };

  stage.addEventListener('pointerenter', (e) => {
    if (reduced.matches || held) return;
    setOrigin(e);
    zoom(true);
  });

  stage.addEventListener('pointermove', (e) => {
    if (!stage.classList.contains('is-zoomed')) return;
    setOrigin(e);
  });

  stage.addEventListener('pointerleave', () => {
    if (held) return;
    zoom(false);
  });

  // click holds the zoom, so it works without a hover at all
  stage.addEventListener('click', (e) => {
    setOrigin(e);
    held = !held;
    zoom(held);
  });

  stage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      held = !held;
      // no cursor to follow, so open from the middle
      stage.style.setProperty('--zx', '50%');
      stage.style.setProperty('--zy', '50%');
      zoom(held);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (held || stage.classList.contains('is-zoomed'))) {
      held = false;
      zoom(false);
    }
  });

  reduced.addEventListener('change', () => {
    if (reduced.matches) { held = false; zoom(false); }
  });
}
