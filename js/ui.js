import { initReveal } from './reveal.js';

/* ---- Experience accordion (About) ---- */
export function initAccordion() {
  const acc = document.querySelector('[data-accordion]');
  if (!acc) return;

  acc.querySelectorAll('.acc__head').forEach((head) => {
    head.addEventListener('click', () => {
      const open = head.getAttribute('aria-expanded') === 'true';
      acc.querySelectorAll('.acc__head').forEach((h) => h.setAttribute('aria-expanded', 'false'));
      head.setAttribute('aria-expanded', String(!open));
    });
  });
}

/* ---- Ethos carousel (About) ---- */
export function initCarousel() {
  const stage = document.querySelector('[data-carousel]');
  if (!stage) return;

  // each photograph is paired with its own paragraph; both move together
  const media = [...stage.querySelectorAll('[data-carousel-media] img')];
  const texts = [...stage.querySelectorAll('[data-carousel-text] > *')];
  const live = stage.querySelector('[data-carousel-status]');
  const count = Math.max(media.length, texts.length);
  if (count < 2) return;

  let index = media.findIndex((s) => s.classList.contains('is-active'));
  if (index < 0) index = 0;

  const show = (next) => {
    index = (next + count) % count;
    media.forEach((el, i) => el.classList.toggle('is-active', i === index));
    texts.forEach((el, i) => el.classList.toggle('is-active', i === index));
    if (live) live.textContent = `${index + 1} of ${count}`;
  };

  stage.querySelector('[data-carousel-prev]')?.addEventListener('click', () => show(index - 1));
  stage.querySelector('[data-carousel-next]')?.addEventListener('click', () => show(index + 1));
  show(index);
}


/* ---- Load more (Archive) ---- */
const MORE_POSTS = [
  { img: 'img/post-stairs.jpg', title: 'Layered Materials and the Quiet Logic of a Nile-Side Stair' },
  { img: 'img/post-gff.jpg', title: 'Building a Festival Set That Reads From Every Angle' },
  { img: 'img/post-chair.jpg', title: 'Pattern, Pile and Palette in a Zamalek Living Room' },
  { img: 'img/post-stairs.jpg', title: 'Plaster Relief: Reviving a Cairene Craft for a New Interior' },
  { img: 'img/post-gff.jpg', title: 'Colour Under Floodlight — Designing for Night Photography' },
  { img: 'img/post-chair.jpg', title: 'How a Single Curtain Fabric Set the Direction for a Whole Flat' },
];

export function initLoadMore() {
  const wrap = document.querySelector('[data-load-more]');
  if (!wrap) return;
  const grid = document.querySelector('[data-post-grid]');
  const button = wrap.querySelector('button');
  if (!grid || !button) return;

  button.addEventListener('click', () => {
    const fragment = document.createDocumentFragment();

    MORE_POSTS.forEach((post) => {
      const article = document.createElement('article');
      article.className = 'card reveal';
      article.innerHTML = `
        <a href="archive-details.html">
          <div class="media media--zoom card__media">
            <img src="${post.img}" alt="" width="1000" height="1000" loading="lazy">
          </div>
          <h3 class="card__title">${post.title}</h3>
          <span class="arrow-link">Read more
            <svg viewBox="0 0 24 12" aria-hidden="true"><path d="M0 6h21M16 1l6 5-6 5" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>
          </span>
        </a>`;
      fragment.appendChild(article);
    });

    grid.appendChild(fragment);
    initReveal(grid);
    wrap.hidden = true;
    grid.querySelector('.card:nth-last-child(6) a')?.focus();
  });
}

/* ---- Forms ---- */
export function initForms() {
  document.querySelectorAll('[data-form]').forEach((form) => {
    const status = form.querySelector('.form__status');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      form.querySelectorAll('[required]').forEach((input) => {
        const field = input.closest('.field');
        const ok = input.checkValidity() && input.value.trim() !== '';
        field?.classList.toggle('is-invalid', !ok);
        input.setAttribute('aria-invalid', String(!ok));

        let error = field?.querySelector('.field-error');
        if (!ok) {
          if (!error && field) {
            error = document.createElement('span');
            error.className = 'field-error';
            field.appendChild(error);
          }
          if (error) {
            error.textContent = input.type === 'email' && input.value.trim()
              ? 'Enter a valid email address.'
              : 'This field is required.';
          }
          if (valid) input.focus();
          valid = false;
        } else if (error) {
          error.remove();
        }
      });

      if (!valid) {
        if (status) status.textContent = 'Check the highlighted fields and try again.';
        return;
      }

      form.reset();
      if (status) status.textContent = form.dataset.success || 'Message sent. We\u2019ll be in touch shortly.';
    });

    form.querySelectorAll('input, textarea').forEach((input) => {
      input.addEventListener('input', () => {
        input.closest('.field')?.classList.remove('is-invalid');
        input.removeAttribute('aria-invalid');
        input.closest('.field')?.querySelector('.field-error')?.remove();
      });
    });
  });
}
