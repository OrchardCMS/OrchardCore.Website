(function () {
  'use strict';

  var root = document.documentElement;
  var storageKey = 'canopy-theme';

  function dispatch(name, detail) {
    var event = new CustomEvent(name, { detail: detail || {} });
    document.dispatchEvent(event);
    window.dispatchEvent(event);
  }

  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function prefers(query) {
    return window.matchMedia && window.matchMedia(query).matches;
  }

  (function darkModeToggle() {
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function getPreferredTheme() {
      var stored = window.localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }

      return media.matches ? 'dark' : 'light';
    }

    function syncButtons(theme) {
      toArray(document.querySelectorAll('[data-theme-toggle]')).forEach(function (button) {
        button.setAttribute('aria-pressed', String(theme === 'dark'));
        var label = button.querySelector('[data-theme-label]');
        if (label) {
          label.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
        }
      });
    }

    function applyTheme(theme, persist) {
      root.setAttribute('data-theme', theme);
      if (persist) {
        window.localStorage.setItem(storageKey, theme);
      }
      syncButtons(theme);
    }

    applyTheme(getPreferredTheme(), false);

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-theme-toggle]');
      if (!trigger) {
        return;
      }

      event.preventDefault();
      var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme, true);
    });

    function handlePreferenceChange(event) {
      if (window.localStorage.getItem(storageKey)) {
        return;
      }

      applyTheme(event.matches ? 'dark' : 'light', false);
    }

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handlePreferenceChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handlePreferenceChange);
    }
  })();

  (function copyToClipboard() {
    var copiedLabel = 'Copied!';

    function resolveTarget(trigger) {
      var selector = trigger.getAttribute('data-copy-target');
      if (selector) {
        return document.querySelector(selector);
      }

      var container = trigger.closest('[data-copy-container]');
      if (!container) {
        return null;
      }

      return container.querySelector('code, pre');
    }

    function getEventName(trigger, text) {
      return trigger.getAttribute('data-copy-event') || (text.toLowerCase().includes('docker') ? 'docker_command_copied' : 'quickstart_command_copied');
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }

      return new Promise(function (resolve, reject) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', 'readonly');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.focus();
        area.select();

        try {
          var successful = document.execCommand('copy');
          document.body.removeChild(area);
          if (successful) {
            resolve();
          } else {
            reject(new Error('execCommand copy failed'));
          }
        } catch (error) {
          document.body.removeChild(area);
          reject(error);
        }
      });
    }

    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-copy]');
      if (!trigger) {
        return;
      }

      event.preventDefault();

      var target = resolveTarget(trigger);
      var text = (target && (target.innerText || target.textContent) || '').trim();
      if (!text) {
        return;
      }

      var original = trigger.textContent;
      var eventName = getEventName(trigger, text);

      copyText(text)
        .then(function () {
          trigger.classList.add('is-copied');
          trigger.textContent = copiedLabel;
          dispatch(eventName, { text: text, trigger: trigger });
        })
        .catch(function (error) {
          if (window.console) {
            console.error('Unable to copy text.', error);
          }
        })
        .finally(function () {
          window.setTimeout(function () {
            trigger.classList.remove('is-copied');
            trigger.textContent = original;
          }, 1800);
        });
    });
  })();

  (function scrollReveal() {
    var items = toArray(document.querySelectorAll('.reveal'));
    if (!items.length) {
      return;
    }

    if (prefers('(prefers-reduced-motion: reduce)') || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.15
    });

    items.forEach(function (item) {
      observer.observe(item);
    });
  })();

  (function tabs() {
    toArray(document.querySelectorAll('[data-tabs]')).forEach(function (group) {
      var tabs = toArray(group.querySelectorAll('[role="tab"]'));
      var panels = toArray(group.querySelectorAll('[role="tabpanel"]'));

      if (!tabs.length) {
        return;
      }

      function activate(tab) {
        var target = tab.getAttribute('data-tab');

        tabs.forEach(function (item) {
          var active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
          item.setAttribute('tabindex', active ? '0' : '-1');
        });

        panels.forEach(function (panel) {
          var active = panel.getAttribute('data-tab-panel') === target;
          panel.hidden = !active;
          panel.classList.toggle('is-active', active);
        });
      }

      activate(tabs.filter(function (tab) {
        return tab.getAttribute('aria-selected') === 'true';
      })[0] || tabs[0]);

      group.addEventListener('click', function (event) {
        var tab = event.target.closest('[role="tab"]');
        if (!tab || !group.contains(tab)) {
          return;
        }

        event.preventDefault();
        activate(tab);
        tab.focus();
      });

      group.addEventListener('keydown', function (event) {
        var currentIndex = tabs.indexOf(document.activeElement);
        if (currentIndex === -1) {
          return;
        }

        var nextIndex = currentIndex;
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
        activate(tabs[nextIndex]);
        tabs[nextIndex].focus();
      });
    });
  })();

  (function analytics() {
    var isDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    function track(eventName, detail) {
      if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, detail || {});
        return;
      }

      if (isDev && window.console) {
        console.info('[canopy analytics]', eventName, detail || {});
      }
    }

    [
      'quickstart_command_copied',
      'docker_command_copied',
      'starter_repo_clicked',
      'docs_clicked',
      'discord_clicked',
      'compare_viewed',
      'casestudy_viewed',
      'business_path_entered'
    ].forEach(function (eventName) {
      document.addEventListener(eventName, function (event) {
        track(eventName, event.detail || {});
      });
    });

    toArray(document.querySelectorAll('[data-analytics-event]')).forEach(function (element) {
      element.addEventListener('click', function () {
        var eventName = element.getAttribute('data-analytics-event');
        if (!eventName) {
          return;
        }

        track(eventName, {
          label: element.getAttribute('data-analytics-label') || element.textContent.trim(),
          href: element.getAttribute('href') || ''
        });
      });
    });

    if ('IntersectionObserver' in window) {
      toArray(document.querySelectorAll('[data-observe-event]')).forEach(function (element) {
        var eventName = element.getAttribute('data-observe-event');
        if (!eventName) {
          return;
        }

        var observer = new IntersectionObserver(function (entries, currentObserver) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            track(eventName, {
              id: element.id || '',
              label: element.getAttribute('data-analytics-label') || ''
            });
            currentObserver.unobserve(entry.target);
          });
        }, {
          threshold: 0.4
        });

        observer.observe(element);
      });
    }
  })();

  (function faqAccordion() {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('.faq-item__button');
      if (!trigger) {
        return;
      }

      var item = trigger.closest('.faq-item');
      if (!item) {
        return;
      }

      var expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      item.classList.toggle('is-open', !expanded);
    });
  })();
})();
