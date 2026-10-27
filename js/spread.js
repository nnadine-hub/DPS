/* Core values: the cards spread from a pile to the four corners.

   The section pins at the top of the screen. As the page scrolls on, the
   four cards glide out of the loose pile over the title, each a beat after
   the last, and straighten as they go; once all four are in their corners
   the page carries on. Scrolling back gathers them into the pile again.

   Positions come from the two states of the Figma component, written on
   each card as data-from / data-to (x, y in the 1512-wide board, then the
   angle). The whole board is scaled to fit the screen, so the layout stays
   exactly as drawn on any laptop.

   Narrow screens and reduced motion get the cards one under another,
   without the pin or the motion. */

const BOARD_W = 1512;
const BOARD_H = 981;
const SPREAD_SCREENS = 0.6;   // scroll needed to spread the cards, in screen heights
const HOLD_SCREENS = 0.1;     // a short rest with the cards in place before the page moves on
const STAGGER = 0.06;         // each card starts this much later than the one before
const FOLLOW = 0.22;          // how quickly the cards catch up with the scroll (1 = instantly)
// the spread layout's own top and bottom inside the board, used to centre it
const CONTENT_TOP = 30;      // the CORE VALUES label
const CONTENT_BOTTOM = 895;   // the bottom of the lower cards

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v) => Math.min(1, Math.max(0, v));

export function initSpread() {
  const section = document.querySelector('[data-spread]');
  if (!section) return;
  const stage = section.querySelector('[data-spread-stage]');
  const board = section.querySelector('[data-spread-board]');
  const header = document.querySelector('.site-header');
  const cards = [...section.querySelectorAll('[data-from]')].map((el) => {
    const f = el.dataset.from.split(',').map(Number);
    const t = el.dataset.to.split(',').map(Number);
    return { el, f, t };
  });
  // cards leave in the order they sit on the pile, top card first
  const order = [...cards].sort((a, b) => getComputedStyle(b.el).zIndex - getComputedStyle(a.el).zIndex);

  const wide = matchMedia('(min-width: 900px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let live = false;
  let travel = 0;
  let target = 0;
  let shown = 0;
  let running = false;

  const place = (p) => {
    order.forEach(({ el, f, t }, i) => {
      const local = clamp((p - i * STAGGER) / (1 - (order.length - 1) * STAGGER));
      const e = easeInOut(local);
      const x = f[0] + (t[0] - f[0]) * e;
      const y = f[1] + (t[1] - f[1]) * e;
      const r = f[2] + (t[2] - f[2]) * e;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg)`;
    });
  };

  const fit = () => {
    const vw = document.documentElement.clientWidth;
    const top = header ? header.offsetHeight : 64;
    const contentH = CONTENT_BOTTOM - CONTENT_TOP;
    const room = innerHeight - top;
    const s = Math.min(vw / BOARD_W, (room - 48) / contentH, 1.25);
    const x = (vw - BOARD_W * s) / 2;
    // the same space between the header and the cards as below the cards
    const y = live ? top + (room - contentH * s) / 2 - CONTENT_TOP * s : 0;
    board.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    if (!live) stage.style.height = `${BOARD_H * s + 96}px`;
  };

  const measure = () => {
    live = wide.matches && !reduce.matches;
    section.classList.toggle('is-live', live);
    if (!wide.matches) {
      section.style.height = '';
      stage.style.height = '';
      board.style.transform = '';
      cards.forEach(({ el }) => { el.style.transform = ''; });
      return;
    }
    stage.style.height = '';
    fit();
    if (!live) { place(1); section.style.height = ''; return; }   // reduced motion: spread, still
    travel = innerHeight * (SPREAD_SCREENS + HOLD_SCREENS);
    section.style.height = `${innerHeight + travel}px`;
    update();
    shown = target;
    place(shown);
  };

  const update = () => {
    if (!live) return;
    const top = section.getBoundingClientRect().top;
    target = clamp(-top / (innerHeight * SPREAD_SCREENS));
    if (!running) { running = true; requestAnimationFrame(frame); }
  };

  // ease the drawn position toward the scroll position, so even a jumpy
  // wheel or trackpad gives an even glide
  const frame = () => {
    shown += (target - shown) * FOLLOW;
    if (Math.abs(target - shown) < 0.0005) shown = target;
    place(shown);
    if (shown !== target) requestAnimationFrame(frame);
    else running = false;
  };

  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', measure);
  wide.addEventListener('change', measure);
  reduce.addEventListener('change', measure);
  measure();
}
