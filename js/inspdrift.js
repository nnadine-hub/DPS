/* Home Inspiration section, after the Viabizzuno reference.

   The words are sticky in the middle of the screen. The four photographs scroll up past them with the page,
   and each one is also lifted by its own extra amount as it goes
   (data-rise: a share of how far it has travelled), so they rise at
   different speeds and overtake one another. The drawn position eases
   toward the scroll position for an even glide on any wheel or trackpad.
   Off on narrow screens and with reduced motion. */
const section = document.querySelector('[data-insp6]');
const wide = matchMedia('(min-width: 900px)');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

export function initInspDrift() {
  if (!section) return;

  const photos = [...section.querySelectorAll('[data-rise]')].map((el) => ({
    el, rise: parseFloat(el.dataset.rise), y: 0, target: 0,
  }));
  let running = false;

  const measure = () => {
    const on = wide.matches && !reduce.matches;
    const r = section.getBoundingClientRect();
    // how far the section has travelled up past the screen, in px
    const travelled = innerHeight - r.top;
    photos.forEach((p) => { p.target = on ? -travelled * p.rise : 0; });
    if (!running) { running = true; requestAnimationFrame(frame); }
  };

  const frame = () => {
    let moving = false;
    photos.forEach((p) => {
      p.y += (p.target - p.y) * 0.12;
      if (Math.abs(p.target - p.y) < 0.1) p.y = p.target; else moving = true;
      p.el.style.transform = `translate3d(0, ${p.y.toFixed(1)}px, 0)`;
    });
    if (moving) requestAnimationFrame(frame); else running = false;
  };

  addEventListener('scroll', measure, { passive: true });
  addEventListener('resize', measure);
  measure();
}
