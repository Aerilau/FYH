import { tasks } from '../data/tasks';
import { shopCards } from '../data/shopItems';
import { clampHealth } from '../data/wellbeing';

export type PetState = { coins: number; health: number; claimed: string[]; ownedCards: string[] };
export type PurchaseResult = { state: PetState; purchased: boolean };
type StorageListener = (changes: Record<string, { newValue?: unknown }>, area: string) => void;
type ChromeStorageEvents = { addListener: (callback: StorageListener) => void; removeListener: (callback: StorageListener) => void };
type ChromeStorage = { get: (key: string) => Promise<Record<string, unknown>>; set: (items: Record<string, unknown>) => Promise<void> };
const KEY = 'procrastipet-state';
const fallback: PetState = { coins: 0, health: 45, claimed: [], ownedCards: [] };
let stateChangesInFlight = Promise.resolve();

function getChromeStorage() {
  return (globalThis as typeof globalThis & { chrome?: { storage?: { local?: ChromeStorage } } }).chrome?.storage?.local;
}

export function subscribePetState(onChange: (state: PetState) => void) {
  const chromeStorage = (globalThis as typeof globalThis & { chrome?: { storage?: { onChanged?: ChromeStorageEvents } } }).chrome?.storage;
  if (!chromeStorage?.onChanged) return () => undefined;
  const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area !== 'local' || !changes[KEY]?.newValue) return;
    const value = changes[KEY].newValue as Partial<PetState>;
    onChange({ ...fallback, ...value, coins: Math.max(0, Number(value.coins) || 0), health: clampHealth(Number(value.health)), claimed: Array.isArray(value.claimed) ? value.claimed : [], ownedCards: Array.isArray(value.ownedCards) ? value.ownedCards : [] });
  };
  chromeStorage.onChanged.addListener(listener);
  return () => chromeStorage.onChanged?.removeListener(listener);
}

function getLocal(): PetState {
  try {
    const value = localStorage.getItem(KEY);
    if (value) return { ...fallback, ...JSON.parse(value) };
  } catch { /* use the cozy starter wallet */ }
  return fallback;
}

function saveLocal(state: PetState) { localStorage.setItem(KEY, JSON.stringify(state)); }

export async function loadPetState(): Promise<PetState> {
  const chromeStorage = getChromeStorage();
  let state: PetState;
  if (chromeStorage) {
    const result = await chromeStorage.get(KEY);
    state = { ...fallback, ...(result[KEY] as Partial<PetState> | undefined) };
  } else {
    state = getLocal();
  }
  return { ...fallback, ...state, coins: Math.max(0, Number(state.coins) || 0), health: clampHealth(state.health), claimed: Array.isArray(state.claimed) ? state.claimed : [], ownedCards: Array.isArray(state.ownedCards) ? state.ownedCards : [] };
}

export function claimTask(id: string): Promise<PetState> {
  const claim = stateChangesInFlight.then(async () => {
    const state = await loadPetState();
    if (state.claimed.includes(id)) return state;
    const task = tasks.find((item) => item.id === id);
    if (!task) return state;
    const updated = { ...state, coins: state.coins + task.reward, health: clampHealth(state.health + task.healthReward), claimed: [...state.claimed, id] };
    const chromeStorage = getChromeStorage();
    if (chromeStorage) await chromeStorage.set({ [KEY]: updated });
    else saveLocal(updated);
    return updated;
  });
  stateChangesInFlight = claim.then(() => undefined, () => undefined);
  return claim;
}

export function purchaseShopCard(id: string): Promise<PurchaseResult> {
  const purchase = stateChangesInFlight.then(async () => {
    const state = await loadPetState();
    const card = shopCards.find((item) => item.id === id);
    if (!card || state.ownedCards.includes(id) || state.coins < card.price) return { state, purchased: false };
    const updated: PetState = { ...state, coins: state.coins - card.price, ownedCards: [...state.ownedCards, id] };
    const chromeStorage = getChromeStorage();
    if (chromeStorage) await chromeStorage.set({ [KEY]: updated });
    else saveLocal(updated);
    return { state: updated, purchased: true };
  });
  stateChangesInFlight = purchase.then(() => undefined, () => undefined);
  return purchase;
}
