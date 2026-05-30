(() => {
  const copiedLabel = 'Copied!';

  const emit = (name, detail) => {
    const event = new CustomEvent(name, { detail });
    document.dispatchEvent(event);
    window.dispatchEvent(event);
  };

  const copy = async (trigger) => {
    const targetSelector = trigger.getAttribute('data-copy-target');
    const target = targetSelector ? document.querySelector(targetSelector) : trigger.closest('[data-copy-container]')?.querySelector('code, pre');
    const text = (target?.innerText || target?.textContent || '').trim();

    if (!text) {
      return;
    }

    const original = trigger.textContent;
    const eventName = trigger.getAttribute('data-copy-event') || (text.toLowerCase().includes('docker') ? 'docker_command_copied' : 'quickstart_command_copied');

    try {
      await navigator.clipboard.writeText(text);
      trigger.classList.add('is-copied');
      trigger.textContent = copiedLabel;
      emit(eventName, { text, trigger });
    } catch (error) {
      console.error('Unable to copy command.', error);
    } finally {
      window.setTimeout(() => {
        trigger.classList.remove('is-copied');
        trigger.textContent = original;
      }, 1800);
    }
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-copy]');
    if (!trigger) {
      return;
    }

    event.preventDefault();
    copy(trigger);
  });
})();
