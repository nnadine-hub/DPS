/* Core values: the four cards rise into place one after another (01 to 04)
   when the section comes into view. The order and the gap between them
   come from each card's --delay; the motion itself is in CSS. Once in,
   they stay in. */
export function initCardsRise() {
  const section = document.querySelector('[data-cards-rise]');
  if (!section) return;
  if (!('IntersectionObserver' in window)) { section.classList.add('is-in'); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { section.classList.add('is-in'); io.disconnect(); }
    });
  }, { threshold: 0.35 });
  io.observe(section.querySelector('.cv3__cards') || section);
}
