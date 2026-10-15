// The app's data (state, kept in localStorage) and what's on screen (ui, not kept).

const KEY = 'ct-v1';
// goal: kcal per day. log: { 'YYYY-MM-DD': [{ meal, kcal }] }, keyed by local date (lib/diary.js).
export const DEFAULTS = { theme: 'system', goal: 2000, log: {} };
export const state = load();

// tab: the open tab.
export const ui = { tab: 'today' };

function load() {
  try { return { ...structuredClone(DEFAULTS), ...JSON.parse(localStorage.getItem(KEY)) }; }
  catch { return structuredClone(DEFAULTS); }
}
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { alert('Could not save!\n' + e.message); }
}
