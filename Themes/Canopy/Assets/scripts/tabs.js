(() => {
  const groups = document.querySelectorAll('[data-tabs]');

  const activateTab = (group, tab) => {
    const tabs = group.querySelectorAll('[role="tab"]');
    const panels = group.querySelectorAll('[role="tabpanel"]');
    const target = tab.getAttribute('data-tab');

    tabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.setAttribute('tabindex', active ? '0' : '-1');
    });

    panels.forEach((panel) => {
      const active = panel.getAttribute('data-tab-panel') === target;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
  };

  groups.forEach((group) => {
    const tabs = Array.from(group.querySelectorAll('[role="tab"]'));
    if (!tabs.length) {
      return;
    }

    activateTab(group, tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0]);

    group.addEventListener('click', (event) => {
      const tab = event.target.closest('[role="tab"]');
      if (!tab || !group.contains(tab)) {
        return;
      }

      event.preventDefault();
      activateTab(group, tab);
      tab.focus();
    });

    group.addEventListener('keydown', (event) => {
      const currentIndex = tabs.indexOf(document.activeElement);
      if (currentIndex === -1) {
        return;
      }

      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      activateTab(group, tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
})();
