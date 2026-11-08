/* Core values: the photograph is pinned in the middle column and only its
   image changes as the values scroll past it. Nothing else moves.

   Which value is "current" is decided by distance: whichever value's box is
   closest to the middle of the pinned photograph wins. That is steadier than
   an IntersectionObserver here, because several values can be on screen at
   once and an observer cannot say which one the photograph is beside. */

export function initValues() {
  const stage = document.querySelector('[data-values-photo]');
  if (!stage) return;

  const shots = [...stage.querySelectorAll('img')];
  const values = [...document.querySelectorAll('[data-value]')];
  if (shots.length < 2 || values.length !== shots.length) return;

  let current = -1;
  let ticking = false;

  const show = (i) => {
    if (i === current) return;
    current = i;
    shots.forEach((img, n) => img.classList.toggle('is-active', n === i));
  };

  const read = () => {
    ticking = false;
    // the photograph is only pinned on the wide layout
    if (getComputedStyle(stage).display === 'none') return;

    const anchor = stage.getBoundingClientRect();
    const middle = anchor.top + anchor.height / 2;

    let best = 0;
    let shortest = Infinity;
    values.forEach((el, i) => {
      const r = el.getBoundingClientRect();
      const gap = Math.abs(r.top + r.height / 2 - middle);
      if (gap < shortest) { shortest = gap; best = i; }
    });
    show(best);
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(read);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  read();
}
