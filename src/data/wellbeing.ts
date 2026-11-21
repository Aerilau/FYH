export type WellbeingStage = {
  id: 'cozy' | 'comfy' | 'distracted' | 'overworked' | 'burnt-out' | 'corporate-prisoner';
  name: string;
  minHealth: number;
  personality: string;
  dialogue: string;
};

export const wellbeingStages: WellbeingStage[] = [
  { id: 'cozy', name: 'Cozy', minHealth: 85, personality: 'Happy, relaxed and unbothered', dialogue: 'Life is good. No spreadsheets in sight.' },
  { id: 'comfy', name: 'Comfy', minHealth: 70, personality: 'Relaxed and enjoying life', dialogue: 'Let’s keep this lovely little lifestyle going.' },
  { id: 'distracted', name: 'Distracted', minHealth: 50, personality: 'Starting to lose focus', dialogue: 'I think we deserve a little break...' },
  { id: 'overworked', name: 'Overworked', minHealth: 30, personality: 'Looking tired and unimpressed', dialogue: 'Feeling a little overworked... complete a task to restore my health!' },
  { id: 'burnt-out', name: 'Burnt Out', minHealth: 15, personality: 'Grumpy and fed up with productivity', dialogue: 'Another deadline? I can’t do this anymore.' },
  { id: 'corporate-prisoner', name: 'Corporate Prisoner', minHealth: 0, personality: 'Completely done with working', dialogue: 'Please... take me away from these spreadsheets.' }
];

export function clampHealth(health: number) {
  return Math.max(0, Math.min(100, Number.isFinite(health) ? health : 0));
}

export function getWellbeingStage(health: number): WellbeingStage {
  const safeHealth = clampHealth(health);
  return wellbeingStages.find((stage) => safeHealth >= stage.minHealth) ?? wellbeingStages[wellbeingStages.length - 1];
}
