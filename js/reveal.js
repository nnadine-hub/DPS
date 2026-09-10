/* Scroll reveal: 24px rise + fade, fires once, children stagger. */
export function initReveal(scope = document) {
  const items = scope.querySelectorAll('.reveal:not(.is-visible)');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => io.observe(el));

  // stagger direct children of any [data-stagger] container
  scope.querySelectorAll('[data-stagger]').forEach((group) => {
    [...group.children].forEach((child, i) => {
      if (child.classList.contains('reveal')) {
        child.style.setProperty('--reveal-delay', `${i * 80}ms`);
      }
    });
  });
}
