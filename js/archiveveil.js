/* The way into DPS Archive: a different world from the rest of the site.

   Leaving:  a deep teal panel rises from the bottom over the page, then
             DPS ARCHIVE fades up in the middle in cream        (LEAVE_MS)
   Arriving: the Archive page starts covered by the same panel (it is in
             the page's markup, shown by html.is-veiled from the first
             paint); after a short hold the title lifts away and the
             panel slides up off the screen, revealing the page
             (HOLD_MS, then LIFT_MS)

   Only links from the rest of the site into the Archive take this way;
   moving between Archive pages is a normal page change. With reduced
   motion, links simply navigate. */

const LEAVE_MS = 950;
const HOLD_MS = 250;
const LIFT_MS = 950;
const FLAG = 'dps-archive-veil';
const isArchive = (path) => /(^|\/)dps-archive(-item)?\.html$/.test(path);

export function initArchiveVeil() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- arriving: lift the panel away ----
  if (root.classList.contains('is-veiled')) {
    const veil = document.querySelector('.archive-veil');
    setTimeout(() => {
      veil && veil.classList.add('is-lifting');
      setTimeout(() => { root.classList.remove('is-veiled'); veil && veil.classList.remove('is-lifting'); }, LIFT_MS + 50);
    }, HOLD_MS);
  }

  if (reduce || isArchive(location.pathname)) return;

  // ---- leaving for the Archive: raise the panel, then go ----
  let veil = null;
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a[href]');
    if (!a || a.target) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !isArchive(url.pathname)) return;
    e.preventDefault();
    if (!veil) {
      veil = document.createElement('div');
      veil.className = 'archive-veil is-leaving';
      veil.setAttribute('aria-hidden', 'true');
      veil.innerHTML = '<p class="archive-veil__title"><span>DPS</span> <em>Archive</em></p>';
      document.body.append(veil);
    }
    requestAnimationFrame(() => requestAnimationFrame(() => veil.classList.add('is-on')));
    try { sessionStorage.setItem(FLAG, '1'); } catch (err) {}
    setTimeout(() => { location.href = a.href; }, LEAVE_MS);
  });

  // back button: never come back to a covered page
  addEventListener('pageshow', (e) => { if (e.persisted && veil) { veil.remove(); veil = null; } });
}
