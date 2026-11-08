/* Page transition into About, after the reference recording:
   a fade through one solid colour, no slide.

   Leaving:  the cream fades in over the whole page   (FADE_IN_MS)
   Between:  it holds solid while About loads          (HOLD_MS)
   Arriving: it fades away, revealing About            (FADE_OUT_MS)

   The leaving page sets a flag in sessionStorage; About's inline head
   script sees it and starts covered (html.is-arriving), so there is no
   flash of the page before the fade out. With reduced motion, links just
   navigate normally. */

const FADE_IN_MS = 350;
const HOLD_MS = 200;
const FADE_OUT_MS = 350;
const FLAG = 'dps-page-fade';

const isAboutLink = (a) => {
  if (!a || a.target || a.hasAttribute('download')) return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (!/(^|\/)about\.html$/.test(url.pathname)) return false;
  // a link to the page we are already on is not a page change
  return url.pathname !== location.pathname;
};

export function initPageFade() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- arriving on About: fade the cover away ----
  if (root.classList.contains('is-arriving')) {
    setTimeout(() => {
      root.classList.add('is-arrived');
      setTimeout(() => root.classList.remove('is-arriving', 'is-arrived'), FADE_OUT_MS + 50);
    }, HOLD_MS);
  }

  if (reduce) return;

  // ---- leaving for About: fade the cover in, then go ----
  let cover = null;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!isAboutLink(a)) return;
    e.preventDefault();

    cover = cover || Object.assign(document.createElement('div'), { className: 'page-fade' });
    cover.setAttribute('aria-hidden', 'true');
    document.body.append(cover);
    requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add('is-on')));

    try { sessionStorage.setItem(FLAG, '1'); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, FADE_IN_MS);
  });

  // coming back with the back button can restore this page still covered
  addEventListener('pageshow', (e) => {
    if (e.persisted && cover) { cover.classList.remove('is-on'); cover.remove(); }
  });
}
