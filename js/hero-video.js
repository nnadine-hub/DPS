/* Hero video: hold on the poster frame when reduced motion is requested. */
export function initHeroVideo() {
  const video = document.querySelector('[data-hero-video]');
  if (!video) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const apply = () => {
    if (reduced.matches) {
      video.pause();
      video.removeAttribute('autoplay');
    } else {
      video.play().catch(() => { /* autoplay blocked — the poster stands in */ });
    }
  };
  reduced.addEventListener('change', apply);
  apply();
}
