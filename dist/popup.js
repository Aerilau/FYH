const SETTINGS_KEY = 'procrastipet-overlay-settings';
const DEFAULT_SETTINGS = { enabled: true, peekEnabled: true, intervalMinutes: 1, visibleSeconds: 8, dismissSnoozeMinutes: 15 };
const enabledInput = document.getElementById('enabled');
const peekEnabledInput = document.getElementById('peekEnabled');
const status = document.getElementById('status');

async function loadSettings() {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}) };
  enabledInput.checked = settings.enabled;
  peekEnabledInput.checked = settings.peekEnabled;
  updateStatus(settings.enabled, settings.peekEnabled);
}

function updateStatus(enabled, peekEnabled) {
  status.textContent = enabled && peekEnabled ? 'Both visits are ready.' : enabled ? 'Message visits are on.' : peekEnabled ? 'Peek-a-boo coins are on.' : 'Both visits are paused.';
  status.parentElement.classList.toggle('is-paused', !enabled && !peekEnabled);
}

async function saveSetting(name, value) {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  const settings = { ...DEFAULT_SETTINGS, ...(stored[SETTINGS_KEY] || {}), [name]: value };
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  updateStatus(settings.enabled, settings.peekEnabled);
}

enabledInput.addEventListener('change', () => { void saveSetting('enabled', enabledInput.checked); });
peekEnabledInput.addEventListener('change', () => { void saveSetting('peekEnabled', peekEnabledInput.checked); });

void loadSettings();
