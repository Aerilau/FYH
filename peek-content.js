(() => {
  const HOST_ATTRIBUTE = 'data-procrastipet-peek-host';
  const DURATION_MS = 6500;
  const EXIT_MS = 320;
  let current;

  function makeBubble(shadow, text, isReward = false) {
    let bubble = shadow.querySelector('.peek-bubble');
    if (!bubble) {
      bubble = document.createElement('div');
      bubble.className = 'peek-bubble';
      bubble.setAttribute('role', 'status');
      bubble.setAttribute('aria-live', 'polite');
      shadow.querySelector('.peek-visit').append(bubble);
    }
    bubble.textContent = text;
    bubble.classList.toggle('coin-toast', isReward);
    return bubble;
  }

  function retreat(appearanceId, notifyBackground = true) {
    if (!current || current.appearanceId !== appearanceId || current.retreating) return;
    current.retreating = true;
    clearTimeout(current.timer);
    const { host } = current;
    host.shadowRoot?.querySelector('.peek-visit')?.classList.add('is-retreating');
    const done = current;
    window.setTimeout(() => {
      host.remove();
      if (current === done) current = undefined;
      if (notifyBackground) chrome.runtime.sendMessage({ type: 'PROCRASTIPET_PEEK_FINISHED', appearanceId });
    }, EXIT_MS);
  }

  function show(message) {
    if (current?.appearanceId === message.appearanceId) return;
    if (current) retreat(current.appearanceId, false);
    if (document.querySelector(`[${HOST_ATTRIBUTE}]`)) return;

    const host = document.createElement('div');
    host.setAttribute(HOST_ATTRIBUTE, '');
    host.setAttribute('popover', 'manual');
    const position = message.position;
    const layout = position === 'top'
      ? 'left:50%!important;top:0!important;width:min(340px,calc(100vw - 16px))!important;height:196px!important;transform:translateX(-50%)!important;'
      : position === 'left'
        ? 'left:0!important;top:38vh!important;width:min(310px,calc(100vw - 16px))!important;height:200px!important;'
        : 'right:0!important;top:38vh!important;width:min(310px,calc(100vw - 16px))!important;height:200px!important;';
    host.style.cssText = `position:fixed!important;inset:auto!important;${layout}margin:0!important;padding:0!important;border:0!important;background:transparent!important;z-index:2147483646!important;display:block!important;pointer-events:none!important;overflow:visible!important;contain:layout style!important;isolation:isolate!important;`;

    const shadow = host.attachShadow({ mode: 'closed' });
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = chrome.runtime.getURL('styles.css');
    shadow.append(stylesheet);

    const visit = document.createElement('section');
    visit.className = 'peek-visit';
    visit.dataset.position = position;

    const target = document.createElement('button');
    target.type = 'button';
    target.className = 'peek-target';
    target.setAttribute('aria-label', 'Tap Snorlax for 10 coins');
    const sprite = document.createElement('img');
    sprite.className = 'peek-sprite';
    sprite.src = chrome.runtime.getURL('assets/pet-sprite.svg');
    sprite.alt = '';
    target.append(sprite);
    target.addEventListener('click', async () => {
      if (!current || current.appearanceId !== message.appearanceId || current.clicked) return;
      current.clicked = true;
      target.disabled = true;
      target.classList.add('is-tapped');
      try {
        const result = await chrome.runtime.sendMessage({ type: 'PROCRASTIPET_PEEK_CLAIM', appearanceId: message.appearanceId });
        if (result?.awarded) makeBubble(shadow, '+10 coins!', true);
        else makeBubble(shadow, 'Already collected!', true);
      } catch {
        makeBubble(shadow, 'Oops! Try again next time.', true);
      }
    });

    visit.append(target);
    shadow.append(visit);
    document.documentElement.append(host);
    try { host.showPopover(); } catch { host.removeAttribute('popover'); }
    if (message.showBubble) makeBubble(shadow, 'Click me for 10 coins!');

    current = { appearanceId: message.appearanceId, host, clicked: false, retreating: false, timer: undefined };
    current.timer = window.setTimeout(() => retreat(message.appearanceId), Math.max(1000, Number(message.durationMs) || DURATION_MS));
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === 'PROCRASTIPET_PEEK') show(message);
    if (message?.type === 'PROCRASTIPET_PEEK_HIDE' && current?.appearanceId === message.appearanceId) retreat(message.appearanceId, false);
  });
})();
