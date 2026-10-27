/* The header has no background, so its type has to change colour with
   whatever is beneath it: cream over a photograph, dark over the page.
   Sections that read dark are marked `data-nav="dark"` in the markup.

   This hit-tests the point under the bar rather than using an
   IntersectionObserver, because the project-type panels are all pinned at
   `top: 0` at once — an observer sees several of them intersecting and
   cannot tell which is actually on top. elementsFromPoint can. */

export function initNavTone() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  let ticking = false;

  const read = () => {
    ticking = false;
    const y = header.offsetHeight * 0.55;
    const menuOpen = document.body.classList.contains('is-locked');

    // the open mobile overlay is its own dark surface
    if (menuOpen) {
      header.classList.add('is-on-dark');
      return;
    }

    let dark = false;
    for (const el of document.elementsFromPoint(window.innerWidth / 2, y)) {
      if (header.contains(el)) continue;          // skip the bar itself
      const marked = el.closest('[data-nav]');
      if (marked) { dark = marked.dataset.nav === 'dark'; break; }
    }
    header.classList.toggle('is-on-dark', dark);
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(read);
  };

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('click', schedule);   // the mobile menu opening or closing
  read();
}
