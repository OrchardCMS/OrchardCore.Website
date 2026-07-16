// Theme chrome behaviour. The initial dark/light mode is applied before paint by
// the inline script in <head>; this file wires the interactive parts.
(function () {
  'use strict';

  // --- Scroll reveal: fade + rise each section's content as it enters the viewport. The `.js .band`
  // rules in site.css hide it first; this reveals it once. Runs FIRST so an error in a later block
  // can never leave content stuck hidden. Degrades safely: without IntersectionObserver (or without
  // JS at all) everything is shown. One-shot (unobserve) so it doesn't replay on scroll-up.
  (function () {
    var items = document.querySelectorAll('.band');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { observer.observe(el); });
  })();

  // --- Dark / light mode toggle: persist the choice and keep the label in sync.
  (function () {
    var root = document.documentElement;
    var btn = document.getElementById('themeToggle');
    if (!btn) return;

    function sync() {
      var dark = root.classList.contains('dark');
      btn.setAttribute('aria-checked', dark ? 'true' : 'false');
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    }
    sync();

    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem('ocTheme', dark ? 'dark' : 'light'); } catch (error) {}
      sync();
    });
  })();

  // --- Language selector: switch the content culture via OrchardCore's ContentCulturePicker.
  // The endpoint redirects to the matching translation for the current page (falls back to the
  // home of the target culture when the page has no translation). We build the path in JS so it
  // works on any page, not just the homepage.
  (function () {
    var selects = document.querySelectorAll('[data-lang-select]');
    if (!selects.length) return;
    selects.forEach(function (select) {
      select.addEventListener('change', function () {
        var endpoint = select.getAttribute('data-culture-endpoint');
        if (!endpoint) return;
        window.location.href = endpoint +
          '?targetCulture=' + encodeURIComponent(select.value) +
          '&contentItemUrl=' + encodeURIComponent(window.location.pathname) +
          '&queryStringValue=' + encodeURIComponent(window.location.search);
      });
    });
  })();

  // --- Header: deepen the shadow once the page is scrolled.
  (function () {
    var header = document.getElementById('siteHeader');
    if (!header) return;
    function onScroll() { header.classList.toggle('is-stuck', window.scrollY > 8); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // --- Mobile menu: a fixed overlay panel with a dimmed backdrop, laid over the page (it does not
  // push content down). Body scroll is locked while open and the panel scrolls itself if it is taller
  // than the viewport. Closes on link selection, backdrop click, or Escape.
  (function () {
    var btn = document.getElementById('menuBtn');
    var nav = document.getElementById('mobileNav');
    var backdrop = document.getElementById('mobileNavBackdrop');
    var header = document.getElementById('siteHeader');
    if (!btn || !nav || !backdrop) return;

    var icons = btn.querySelectorAll('svg'); // [0] = menu (open), [1] = close (X)

    function isOpen() { return !nav.classList.contains('hidden'); }

    function openMenu() {
      // Anchor the panel just below the actual header height.
      if (header) document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
      nav.classList.remove('hidden');
      backdrop.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Close menu');
      if (icons[0]) icons[0].classList.add('hidden');
      if (icons[1]) icons[1].classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.add('hidden');
      backdrop.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Open menu');
      if (icons[0]) icons[0].classList.remove('hidden');
      if (icons[1]) icons[1].classList.add('hidden');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () { isOpen() ? closeMenu() : openMenu(); });
    backdrop.addEventListener('click', closeMenu);
    nav.addEventListener('click', function (event) { if (event.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && isOpen()) closeMenu(); });
  })();

  // --- Copy buttons: copy paste-ready commands from the same code block.
  (function () {
    // Turn the displayed snippet into runnable commands: drop comment lines and
    // strip the shell prompt so the clipboard holds exactly what you'd type.
    function toCommands(text) {
      return text.replace(/\r\n?/g, '\n').split('\n')
        .filter(function (line) { return !/^\s*#/.test(line); })   // drop comments
        .map(function (line) { return line.replace(/^\s*[$>]\s+/, ''); }) // strip prompt
        .join('\n')
        .replace(/\n{2,}/g, '\n')                                  // collapse blank runs
        .trim();
    }

    document.querySelectorAll('.copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var block = btn.closest('[data-code-block]');
        var code = block ? block.querySelector('code') : null;
        var text = code ? toCommands(code.textContent) : '';
        if (!text || !navigator.clipboard) return;
        navigator.clipboard.writeText(text).then(function () {
          var original = btn.textContent;
          btn.textContent = 'Copied';
          btn.disabled = true;
          setTimeout(function () { btn.textContent = original; btn.disabled = false; }, 1500);
        });
      });
    });
  })();

  // --- Tab blocks: the segmented card tabs and the feature-explorer rail. Buttons + panels (no
  // radios); clicking a tab toggles `.is-active` on it and `hidden` on the matching panel. The look
  // lives in CSS (.tab-toggle / .feat-tab via @apply). Without JS the first panel stays visible (the
  // rest are `hidden`) — acceptable progressive degradation.
  (function () {
    function wire(group, tabSelector, panelSelector) {
      var tabs = group.querySelectorAll(tabSelector);
      var panels = group.querySelectorAll(panelSelector);
      if (!tabs.length) return;

      function activate(activeIndex) {
        tabs.forEach(function (tab, index) {
          var isActive = index === activeIndex;
          tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
          tab.classList.toggle('is-active', isActive);
        });
        panels.forEach(function (panel, index) { panel.classList.toggle('hidden', index !== activeIndex); });
      }

      tabs.forEach(function (tab, index) {
        tab.addEventListener('click', function () { activate(index); });
      });
    }

    document.querySelectorAll('[data-card-tabs]').forEach(function (group) { wire(group, '[data-card-tab]', '[data-card-tab-set]'); });
    document.querySelectorAll('[data-feature-explorer]').forEach(function (group) { wire(group, '[data-feat-tab]', '[data-feat-panel]'); });
  })();

  // --- Photo lightbox: Gallery block photos ([data-photo]) open larger in the shared #photoModal
  // singleton (rendered once in the Layout). Close with the backdrop, the button, or Escape. Without
  // JS the photos are still visible in the grid; this is a progressive enhancement.
  (function () {
    var modal = document.getElementById('photoModal');
    if (!modal) return;
    var imgEl = document.getElementById('photoModalImg');
    var lastFocus = null;

    function openModal(btn) {
      var img = btn.querySelector('img');
      // Prefer the full-resolution original (data-full) over the resized grid thumbnail.
      imgEl.src = btn.getAttribute('data-full') || (img ? (img.currentSrc || img.src) : '');
      imgEl.alt = (img && img.alt) || '';
      lastFocus = btn;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      imgEl.removeAttribute('src');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    }

    document.querySelectorAll('[data-photo]').forEach(function (btn) {
      btn.addEventListener('click', function () { openModal(btn); });
    });
    modal.querySelectorAll('[data-photo-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
  })();

  // --- Profile bios: ProfileCards renders a [data-profile] button for anyone with a bio; it opens the
  // shared #profileModal singleton (rendered once in the Layout). The bio markup rides along in a
  // sibling <template>, so it needs no escaping. Close with the backdrop, the button, or Escape.
  // Cards without a bio are not buttons at all, so this is a progressive enhancement.
  (function () {
    var modal = document.getElementById('profileModal');
    if (!modal) return;
    var nameEl = document.getElementById('profileModalName');
    var roleEl = document.getElementById('profileModalRole');
    var bioEl = document.getElementById('profileModalBio');
    var photoEl = document.getElementById('profileModalPhoto');
    var lastFocus = null;

    function openModal(btn) {
      var name = btn.getAttribute('data-profile-name') || '';
      var role = btn.getAttribute('data-profile-role') || '';
      var img = btn.querySelector('img');
      var tpl = btn.parentNode.querySelector('[data-profile-bio]');

      nameEl.textContent = name;
      roleEl.textContent = role;
      roleEl.hidden = !role;
      photoEl.src = img ? (img.currentSrc || img.src) : '';
      photoEl.alt = name;
      bioEl.replaceChildren(tpl ? tpl.content.cloneNode(true) : '');

      lastFocus = btn;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
      photoEl.removeAttribute('src');
      bioEl.replaceChildren();
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    }

    document.querySelectorAll('[data-profile]').forEach(function (btn) {
      btn.addEventListener('click', function () { openModal(btn); });
    });
    modal.querySelectorAll('[data-profile-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });
  })();

  // --- Accordions (FAQ, mobile features): a double/triple-click on a <summary> toggles it but
  // also selects the heading text, which looks odd. Suppress selection from multi-clicks only —
  // single clicks still toggle, and deliberate drag-selection (so the text stays copyable) is left
  // untouched. Without JS the <details> still works; this is a progressive enhancement.
  (function () {
    document.querySelectorAll('details > summary').forEach(function (summary) {
      summary.addEventListener('mousedown', function (event) {
        if (event.detail > 1) {
          event.preventDefault();
        }
      });
    });
  })();

  // --- Scroll-spy: highlight the header nav link for the section currently in view. Nav links carry
  // data-spy="<section id>" (rendered from each block's AnchorId); desktop and mobile links share the
  // same ids, so both stay in sync. No-op without IntersectionObserver or when there are no spy links
  // (e.g. a non-landing page). Progressive enhancement — the nav still works without it.
  (function () {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link[data-spy]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    function setCurrent(id) {
      links.forEach(function (l) { l.classList.toggle('is-current', l.getAttribute('data-spy') === id); });
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-12% 0px -80% 0px', threshold: 0 });
    var seen = {};
    links.forEach(function (l) {
      var id = l.getAttribute('data-spy');
      if (seen[id]) { return; }
      seen[id] = true;
      var sec = document.getElementById(id);
      if (sec) { io.observe(sec); }
    });
  })();
})();
