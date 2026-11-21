(() => {
  const HOST_ATTRIBUTE = 'data-procrastipet-host';
  const LAST_MESSAGE_KEY = 'procrastipet-last-overlay-message';
  let host;
  let hideTimer;
  let removeTimer;
  let lastMessage = '';

  function chooseMessage() {
    const messages = globalThis.PROCRASTIPET_MESSAGES || [];
    if (!messages.length) return 'You’ve done enough. Probably.';
    const choices = messages.filter((message) => message !== lastMessage);
    const message = choices[Math.floor(Math.random() * choices.length)] || messages[0];
    lastMessage = message;
    void chrome.storage.local.set({ [LAST_MESSAGE_KEY]: message });
    return message;
  }

  async function restoreLastMessage() {
    const stored = await chrome.storage.local.get(LAST_MESSAGE_KEY);
    lastMessage = stored[LAST_MESSAGE_KEY] || '';
  }

  function dismiss(manual = false) {
    if (!host) return;
    clearTimeout(hideTimer);
    clearTimeout(removeTimer);
    const currentHost = host;
    const shadow = currentHost.shadowRoot;
    shadow?.querySelector('.visit')?.classList.add('is-leaving');
    if (manual) chrome.runtime.sendMessage({ type: 'PROCRASTIPET_DISMISSED' });
    removeTimer = window.setTimeout(() => {
      currentHost.remove();
      if (host === currentHost) host = undefined;
    }, 260);
  }

  function show(message, durationMs) {
    if (host?.isConnected) return;
    if (document.querySelector(`[${HOST_ATTRIBUTE}]`)) return;

    host = document.createElement('div');
    host.setAttribute(HOST_ATTRIBUTE, '');
    host.setAttribute('popover', 'manual');
    host.style.cssText = 'position:fixed!important;inset:auto 12px 12px auto!important;width:min(260px,calc(100vw - 24px))!important;height:min(250px,calc(100dvh - 24px))!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;z-index:2147483647!important;display:block!important;pointer-events:none!important;contain:layout style!important;isolation:isolate!important;';
    const shadow = host.attachShadow({ mode: 'closed' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('styles.css');
    shadow.append(stylesheet);

    const visit = document.createElement('section');
    visit.className = 'visit';
    visit.setAttribute('role', 'status');
    visit.setAttribute('aria-live', 'polite');

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    const bubbleText = document.createElement('span');
    bubbleText.className = 'bubble-text';
    bubbleText.textContent = message;

    const close = document.createElement('button');
    close.className = 'dismiss';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss Snorlax');
    close.textContent = '×';
    close.addEventListener('click', () => dismiss(true));
    bubble.append(bubbleText, close);

    const sprite = document.createElement('img');
    sprite.className = 'sprite';
    sprite.alt = 'Sleepy ProcrastiPet visiting';
    sprite.src = chrome.runtime.getURL('assets/message-snorlax.png');

    visit.append(bubble, sprite);
    shadow.append(visit);
    document.documentElement.append(host);
    try {
      host.showPopover();
    } catch {
      host.removeAttribute('popover');
    }
    hideTimer = window.setTimeout(() => dismiss(false), durationMs);
  }

  const lastMessageReady = restoreLastMessage();
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== 'PROCRASTIPET_SHOW') return;
    void lastMessageReady.then(() => show(chooseMessage(), Math.max(1000, Number(message.durationMs) || 8000)));
  });
})();
