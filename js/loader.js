// Loading screen: the logo in cream on oxblood, its two stars at 10% cream.
// The stars fill from the bottom like a glass being filled, and at 100% the
// layer slides up and away to reveal the page.
//
// The fill follows the real page load. While the page is still loading it
// creeps towards 90% and slows as it gets there; once everything has loaded
// it finishes the last stretch and the site opens. It always takes at least
// MIN_MS so the fill reads as a deliberate moment rather than a flicker, and
// it gives up waiting after MAX_MS so a slow video can never hold the site.

const MIN_MS = 2200;
const MAX_MS = 9000;
const HOLD_MS = 280;      // a short pause on a full star before opening
const FADE_MS = 900;      // the slide away; matches .loader transition in components.css

export function initLoader() {
  const el = document.querySelector('[data-loader]');
  const root = document.documentElement;
  if (!el || !root.classList.contains('is-loading')) { el?.remove(); return; }

  const liquids = [...el.querySelectorAll('[data-liquid]')].map((g) => ({
    g, h: g.ownerSVGElement.viewBox.baseVal.height,
  }));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let loaded = document.readyState === 'complete';
  let shown = 0;          // what the star currently displays, 0..1
  let done = false;

  if (!loaded) addEventListener('load', () => { loaded = true; }, { once: true });

  // the water line travels from just below each star to just above it,
  // so both stars in the logo fill together
  const setLevel = (p) => {
    for (const { g, h } of liquids) {
      const y = (h + 1) - p * (h + 3);
      g.setAttribute('transform', `translate(0 ${y.toFixed(3)})`);
    }
    el.setAttribute('aria-valuenow', Math.round(p * 100));
  };

  const finish = () => {
    if (done) return;
    done = true;
    setLevel(1);
    setTimeout(() => {
      el.classList.add('is-done');
      root.classList.remove('is-loading');
      try { sessionStorage.setItem('dps-loaded', '1'); } catch (e) {}
      dispatchEvent(new CustomEvent('dps:loaded'));
      setTimeout(() => el.remove(), FADE_MS + 50);
    }, HOLD_MS);
  };

  const tick = (now) => {
    if (done) return;
    const t = now - start;
    const ready = (loaded && t >= MIN_MS) || t >= MAX_MS;

    // while waiting: an eased approach to 90% that never quite arrives
    const waiting = 0.9 * (1 - Math.exp(-t / (MIN_MS * 0.55)));
    const target = ready ? 1 : waiting;

    // follow the target smoothly, a sip at a time rather than a jump
    shown += (target - shown) * (ready ? 0.075 : 0.06);
    setLevel(shown);

    if (ready && shown > 0.995) { finish(); return; }
    requestAnimationFrame(tick);
  };

  if (reduce) {
    // no rising water: a simple wait, a full star, then open
    const go = () => setTimeout(finish, Math.max(0, 600 - (performance.now() - start)));
    loaded ? go() : addEventListener('load', go, { once: true });
    setTimeout(finish, MAX_MS);
    return;
  }
  requestAnimationFrame(tick);
}
