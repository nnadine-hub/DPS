/* Header + navigation.
   - transparent header turns solid once the hero scrolls past a sentinel
   - header hides on scroll down, returns on scroll up
   - PROJECTS dropdown opens on hover, click and keyboard
   - mobile overlay locks scroll, traps focus, closes on Escape */

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function initNav() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  solidOnScroll(header);
  hideOnScrollDown(header);
  initDropdown();
  initMobileMenu(header);
}

/* ---- transparent → solid ---- */
function solidOnScroll(header) {
  if (!header.classList.contains('site-header--over')) return;
  const sentinel = document.querySelector('[data-hero-sentinel]');
  if (!sentinel) return;

  // the root is shrunk by the header height, so the hero counts as "passed"
  // the moment its foot slips behind the bar rather than off the screen
  const barHeight = () => header.offsetHeight;

  const io = new IntersectionObserver(([entry]) => {
    // a sentinel sitting below the viewport also fails isIntersecting, so
    // check it is above the bar before treating the hero as scrolled past
    const past = !entry.isIntersecting && entry.boundingClientRect.top < barHeight();
    header.classList.toggle('is-solid', past);
  }, { threshold: 0, rootMargin: `-${barHeight()}px 0px 0px 0px` });

  io.observe(sentinel);
}

/* ---- hide on scroll down ---- */
function hideOnScrollDown(header) {
  let last = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const menuOpen = document.body.classList.contains('is-locked');
    const down = y > last && y > 200;
    header.classList.toggle('is-hidden', down && !menuOpen);
    last = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });
}

/* ---- projects dropdown ---- */
function initDropdown() {
  const item = document.querySelector('[data-dropdown]');
  if (!item) return;
  const trigger = item.querySelector('.nav-chev');
  const menu = item.querySelector('.nav-menu');
  if (!trigger || !menu) return;

  const open = (state) => {
    item.classList.toggle('is-open', state);
    trigger.setAttribute('aria-expanded', String(state));
  };

  trigger.addEventListener('click', () => open(!item.classList.contains('is-open')));
  item.addEventListener('mouseenter', () => open(true));
  item.addEventListener('mouseleave', () => open(false));
  item.addEventListener('focusout', (e) => {
    if (!item.contains(e.relatedTarget)) open(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && item.classList.contains('is-open')) {
      open(false);
      trigger.focus();
    }
  });
  document.addEventListener('click', (e) => {
    if (!item.contains(e.target)) open(false);
  });
}

/* ---- mobile overlay ---- */
function initMobileMenu(header) {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  let scrollY = 0;

  const setOpen = (state) => {
    toggle.setAttribute('aria-expanded', String(state));
    toggle.setAttribute('aria-label', state ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', state);

    if (state) {
      scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('is-locked');
      header.classList.remove('is-hidden');
      menu.querySelector(FOCUSABLE)?.focus();
    } else {
      document.body.classList.remove('is-locked');
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    }
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (!isOpen) return;

    if (e.key === 'Escape') {
      setOpen(false);
      toggle.focus();
      return;
    }
    if (e.key !== 'Tab') return;

    const items = [toggle, ...menu.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === toggle
    );
    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // inline sub-list inside the overlay
  const sub = menu.querySelector('[data-sub-toggle]');
  sub?.addEventListener('click', () => {
    sub.setAttribute('aria-expanded', String(sub.getAttribute('aria-expanded') !== 'true'));
  });

  // leaving mobile width while open
  const mq = window.matchMedia('(min-width: 900px)');
  mq.addEventListener('change', (e) => {
    if (e.matches && toggle.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
}
