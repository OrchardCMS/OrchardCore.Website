(() => {
  const isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

  const track = (eventName, detail = {}) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, detail);
      return;
    }

    if (isDev && typeof window.console !== 'undefined') {
      console.info('[canopy analytics]', eventName, detail);
    }
  };

  const bindClickTracking = (selector, eventName) => {
    document.querySelectorAll(selector).forEach((element) => {
      element.addEventListener('click', () => {
        track(eventName, {
          label: element.getAttribute('data-analytics-label') || element.textContent.trim(),
          href: element.getAttribute('href') || ''
        });
      });
    });
  };

  [
    'quickstart_command_copied',
    'docker_command_copied',
    'starter_repo_clicked',
    'docs_clicked',
    'discord_clicked',
    'compare_viewed',
    'casestudy_viewed',
    'business_path_entered'
  ].forEach((eventName) => {
    document.addEventListener(eventName, (event) => track(eventName, event.detail || {}));
  });

  bindClickTracking('[data-analytics-event="starter_repo_clicked"]', 'starter_repo_clicked');
  bindClickTracking('[data-analytics-event="docs_clicked"]', 'docs_clicked');
  bindClickTracking('[data-analytics-event="discord_clicked"]', 'discord_clicked');

  document.querySelectorAll('[data-observe-event]').forEach((element) => {
    const eventName = element.getAttribute('data-observe-event');
    if (!eventName) {
      return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        track(eventName, {
          id: element.id || '',
          label: element.getAttribute('data-analytics-label') || ''
        });
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    observer.observe(element);
  });
})();
