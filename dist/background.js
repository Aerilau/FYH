importScripts('peek-logic.js');

const ALARM_NAME = 'procrastipet-visit';
const PEEK_ALARM_NAME = 'procrastipet-peek';
const PEEK_WATCHDOG_NAME = 'procrastipet-peek-watchdog';
const SETTINGS_KEY = 'procrastipet-overlay-settings';
const DISMISSED_KEY = 'procrastipet-dismissed-tabs';
const PEEK_STATE_KEY = 'procrastipet-peek-state';
const PEEK_ACTIVE_KEY = 'procrastipet-peek-active';
const PET_STATE_KEY = 'procrastipet-state';
const TEST_INTERVAL_MINUTES = 1;
const PEEK_MIN_DELAY_MINUTES = 0.5;
const PEEK_MAX_DELAY_MINUTES = 2;
const PEEK_DURATION_MS = 6500;
const PEEK_WATCHDOG_DELAY_MINUTES = 0.25;
const DEFAULT_SETTINGS = { enabled: true, peekEnabled: true, intervalMinutes: TEST_INTERVAL_MINUTES, visibleSeconds: 8, dismissSnoozeMinutes: 15 };
let peekQueue = Promise.resolve();

async function getSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) };
}

async function initializeSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  if (!stored[SETTINGS_KEY]) await chrome.storage.local.set({ [SETTINGS_KEY]: DEFAULT_SETTINGS });
}

async function initializePetState() {
  const stored = await chrome.storage.local.get(PET_STATE_KEY);
  if (!stored[PET_STATE_KEY]) await chrome.storage.local.set({ [PET_STATE_KEY]: { coins: 0, health: 45, claimed: [] } });
}

async function syncMessageAlarm() {
  await initializeSettings();
  const settings = await getSettings();
  if (!settings.enabled) {
    await chrome.alarms.clear(ALARM_NAME);
    return;
  }
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: TEST_INTERVAL_MINUTES,
    periodInMinutes: TEST_INTERVAL_MINUTES
  });
}

function enqueuePeek(action) {
  const result = peekQueue.then(action);
  peekQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function scheduleNextPeek() {
  const settings = await getSettings();
  if (!settings.peekEnabled) return;
  const delayInMinutes = PEEK_MIN_DELAY_MINUTES + Math.random() * (PEEK_MAX_DELAY_MINUTES - PEEK_MIN_DELAY_MINUTES);
  chrome.alarms.create(PEEK_ALARM_NAME, { delayInMinutes });
}

async function syncPeekAlarm() {
  const settings = await getSettings();
  if (!settings.peekEnabled) {
    await chrome.alarms.clear(PEEK_ALARM_NAME);
    await chrome.alarms.clear(PEEK_WATCHDOG_NAME);
    const stored = await chrome.storage.local.get(PEEK_ACTIVE_KEY);
    const active = stored[PEEK_ACTIVE_KEY];
    if (active) {
      try { await chrome.tabs.sendMessage(active.tabId, { type: 'PROCRASTIPET_PEEK_HIDE', appearanceId: active.id }); } catch { /* tab may have closed */ }
      await chrome.storage.local.remove(PEEK_ACTIVE_KEY);
    }
    return;
  }
  const stored = await chrome.storage.local.get(PEEK_ACTIVE_KEY);
  if (stored[PEEK_ACTIVE_KEY]) return;
  if (!(await chrome.alarms.get(PEEK_ALARM_NAME))) await scheduleNextPeek();
}

async function syncAlarms() {
  await initializeSettings();
  await initializePetState();
  await Promise.all([syncMessageAlarm(), syncPeekAlarm()]);
}

chrome.runtime.onInstalled.addListener(() => { void syncAlarms(); });
chrome.runtime.onStartup.addListener(() => { void recoverPeekAfterRestart(); void syncAlarms(); });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[SETTINGS_KEY]) void syncAlarms();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === PEEK_ALARM_NAME) {
    await showPeek();
    return;
  }
  if (alarm.name === PEEK_WATCHDOG_NAME) {
    const stored = await chrome.storage.local.get(PEEK_ACTIVE_KEY);
    if (stored[PEEK_ACTIVE_KEY]) await finishPeek(stored[PEEK_ACTIVE_KEY].id);
    return;
  }
  if (alarm.name !== ALARM_NAME) return;
  const settings = await getSettings();
  if (!settings.enabled) return;

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) return;

  const now = Date.now();
  const stored = await chrome.storage.local.get(DISMISSED_KEY);
  const dismissedUntil = stored[DISMISSED_KEY] || {};
  const until = dismissedUntil[tab.id] || 0;
  if (until > now) return;

  if (until) {
    delete dismissedUntil[tab.id];
    await chrome.storage.local.set({ [DISMISSED_KEY]: dismissedUntil });
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'PROCRASTIPET_SHOW', durationMs: settings.visibleSeconds * 1000 });
  } catch {
    // The active page may not have a content script (for example, a restricted browser page).
  }
});

async function showPeek() {
  const settings = await getSettings();
  if (!settings.peekEnabled) return;
  const current = await chrome.storage.local.get(PEEK_ACTIVE_KEY);
  if (current[PEEK_ACTIVE_KEY]) return;

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const tab = tabs[0];
  if (!tab?.id || !tab.url || !/^https?:\/\//i.test(tab.url)) {
    await scheduleNextPeek();
    return;
  }

  const stored = await chrome.storage.local.get(PEEK_STATE_KEY);
  const peekState = { ...ProcrastiPetPeekLogic.initialState(), ...(stored[PEEK_STATE_KEY] || {}) };
  const position = ProcrastiPetPeekLogic.choosePosition(peekState.lastPosition);
  const active = {
    id: crypto.randomUUID(), tabId: tab.id, position,
    showBubble: ProcrastiPetPeekLogic.shouldShowBubble(peekState),
    rewarded: false, startedAt: Date.now()
  };
  await chrome.storage.local.set({ [PEEK_ACTIVE_KEY]: active });
  try {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'PROCRASTIPET_PEEK', appearanceId: active.id, position,
      showBubble: active.showBubble, durationMs: PEEK_DURATION_MS
    });
    await chrome.storage.local.set({ [PEEK_STATE_KEY]: { ...peekState, lastPosition: position } });
    chrome.alarms.create(PEEK_WATCHDOG_NAME, { delayInMinutes: PEEK_WATCHDOG_DELAY_MINUTES });
  } catch {
    await chrome.storage.local.remove(PEEK_ACTIVE_KEY);
    await scheduleNextPeek();
  }
}

async function awardPeekCoin(appearanceId, tabId) {
  return enqueuePeek(async () => {
    const stored = await chrome.storage.local.get([PEEK_ACTIVE_KEY, PEEK_STATE_KEY, PET_STATE_KEY]);
    const active = stored[PEEK_ACTIVE_KEY];
    const petState = { coins: 0, health: 45, claimed: [], ...(stored[PET_STATE_KEY] || {}) };
    const peekState = { ...ProcrastiPetPeekLogic.initialState(), ...(stored[PEEK_STATE_KEY] || {}) };
    if (!active || active.id !== appearanceId || active.tabId !== tabId) return { awarded: false, coins: petState.coins };
    const reward = ProcrastiPetPeekLogic.reward(active, appearanceId, petState, peekState);
    if (!reward) return { awarded: false, coins: petState.coins };
    await chrome.storage.local.set({
      [PEEK_ACTIVE_KEY]: reward.active,
      [PEEK_STATE_KEY]: reward.peekState,
      [PET_STATE_KEY]: reward.petState
    });
    return { awarded: true, coins: reward.coins };
  });
}

async function finishPeek(appearanceId) {
  const finished = await enqueuePeek(async () => {
    const stored = await chrome.storage.local.get([PEEK_ACTIVE_KEY, PEEK_STATE_KEY]);
    const active = stored[PEEK_ACTIVE_KEY];
    if (!active || active.id !== appearanceId) return false;
    const peekState = ProcrastiPetPeekLogic.afterAppearance(
      stored[PEEK_STATE_KEY], active.showBubble, Boolean(active.rewarded)
    );
    await chrome.storage.local.set({ [PEEK_STATE_KEY]: peekState });
    await chrome.storage.local.remove(PEEK_ACTIVE_KEY);
    await chrome.alarms.clear(PEEK_WATCHDOG_NAME);
    return true;
  });
  if (finished) await scheduleNextPeek();
}

async function recoverPeekAfterRestart() {
  const stored = await chrome.storage.local.get(PEEK_ACTIVE_KEY);
  if (stored[PEEK_ACTIVE_KEY]) await finishPeek(stored[PEEK_ACTIVE_KEY].id);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'PROCRASTIPET_PEEK_CLAIM') {
    void awardPeekCoin(message.appearanceId, sender.tab?.id).then(sendResponse).catch(() => sendResponse({ awarded: false }));
    return true;
  }
  if (message?.type === 'PROCRASTIPET_PEEK_FINISHED') {
    if (sender.tab?.id != null) {
      void chrome.storage.local.get(PEEK_ACTIVE_KEY).then(async (stored) => {
        const active = stored[PEEK_ACTIVE_KEY];
        if (active?.tabId !== sender.tab.id) return false;
        await finishPeek(message.appearanceId);
        return true;
      }).then((finished) => sendResponse({ finished })).catch(() => sendResponse({ finished: false }));
    } else sendResponse({ finished: false });
    return true;
  }
  return false;
});

chrome.runtime.onMessage.addListener((message, sender) => {
  if (message?.type !== 'PROCRASTIPET_DISMISSED' || sender.tab?.id == null) return;
  void Promise.all([chrome.storage.local.get(DISMISSED_KEY), getSettings()]).then(([stored, settings]) => {
    const dismissedUntil = stored[DISMISSED_KEY] || {};
    dismissedUntil[sender.tab.id] = Date.now() + settings.dismissSnoozeMinutes * 60 * 1000;
    return chrome.storage.local.set({ [DISMISSED_KEY]: dismissedUntil });
  });
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void chrome.storage.local.get(DISMISSED_KEY).then((stored) => {
    const dismissedUntil = stored[DISMISSED_KEY] || {};
    if (!(tabId in dismissedUntil)) return;
    delete dismissedUntil[tabId];
    return chrome.storage.local.set({ [DISMISSED_KEY]: dismissedUntil });
  });
  void chrome.storage.local.get(PEEK_ACTIVE_KEY).then((stored) => {
    const active = stored[PEEK_ACTIVE_KEY];
    if (active?.tabId === tabId) return finishPeek(active.id);
  });
});
