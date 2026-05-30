(() => {
  const storageKey = 'canopy-theme';
  const root = document.documentElement;
  const query = window.matchMedia('(prefers-color-scheme: dark)');

  const getPreferredTheme = () => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return query.matches ? 'dark' : 'light';
  };

  const applyTheme = (theme, persist) => {
    root.setAttribute('data-theme', theme);
    if (persist) {
      window.localStorage.setItem(storageKey, theme);
    }

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      const label = button.querySelector('[data-theme-label]');
      if (label) {
        label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
      }
    });
  };

  applyTheme(getPreferredTheme(), false);

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-theme-toggle]');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  const onPreferenceChanged = (event) => {
    if (window.localStorage.getItem(storageKey)) {
      return;
    }

    applyTheme(event.matches ? 'dark' : 'light', false);
  };

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', onPreferenceChanged);
  } else if (typeof query.addListener === 'function') {
    query.addListener(onPreferenceChanged);
  }
})();
