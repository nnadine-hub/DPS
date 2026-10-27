/* The project type filter.
   A listbox rather than a native <select>, so it can be styled to match the
   design. It reads ?type= from the URL on load, which is what the category
   links in the navigation point at, and keeps the URL in step as the reader
   changes it — so a filtered view can be linked to or reloaded. */

export function initFilter() {
  const root = document.querySelector('[data-filter]');
  if (!root) return;

  const button = root.querySelector('[data-filter-button]');
  const label = root.querySelector('[data-filter-label]');
  const list = root.querySelector('[role="listbox"]');
  const options = [...list.querySelectorAll('[role="option"]')];
  const tiles = [...document.querySelectorAll('.projects-grid .tile')];
  const status = document.querySelector('[data-filter-status]');
  if (!options.length || !tiles.length) return;

  const open = (state) => {
    root.classList.toggle('is-open', state);
    button.setAttribute('aria-expanded', String(state));
    if (state) list.focus();
  };

  const apply = (value, { push = true } = {}) => {
    const chosen = options.find((o) => o.dataset.value === value) || options[0];
    value = chosen.dataset.value;

    options.forEach((o) => o.setAttribute('aria-selected', String(o === chosen)));
    label.innerHTML = value === 'all' ? 'Type' : chosen.innerHTML;
    button.setAttribute('aria-activedescendant', chosen.id);

    let shown = 0;
    tiles.forEach((t) => {
      const match = value === 'all' || t.dataset.type === value;
      t.hidden = !match;
      if (match) shown += 1;
    });

    if (status) {
      status.textContent = value === 'all'
        ? `Showing all ${shown} projects`
        : `Showing ${shown} ${chosen.textContent.trim()} project${shown === 1 ? '' : 's'}`;
    }

    if (push) {
      const url = new URL(window.location);
      if (value === 'all') url.searchParams.delete('type');
      else url.searchParams.set('type', value);
      history.replaceState(null, '', url);
    }
  };

  button.addEventListener('click', () => open(!root.classList.contains('is-open')));

  options.forEach((o) => {
    o.addEventListener('click', () => { apply(o.dataset.value); open(false); button.focus(); });
  });

  list.addEventListener('keydown', (e) => {
    const current = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
    if (e.key === 'Escape') { open(false); button.focus(); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (current + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length;
      apply(options[next].dataset.value);
    }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(false); button.focus(); }
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) open(false);
  });

  // the navigation's category links arrive with ?type= already set
  apply(new URLSearchParams(window.location.search).get('type') || 'all', { push: false });
}
