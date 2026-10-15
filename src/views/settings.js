// Settings tab.
import { icon, THEMES } from '../components.js';
import { state } from '../state.js';

export function settings() {
  const theme = state.theme ?? 'system';
  return `<div class="appbar"><h1>Settings</h1></div>
    <h2>Appearance</h2>
    <div class="segmented">${Object.entries(THEMES).map(([t, [ic, label]]) =>
      `<button class="${t === theme ? 'on' : ''}" data-theme="${t}">${t === theme ? icon('check') : icon(ic)}${t === 'system' ? 'System' : label}</button>`).join('')}</div>
    <h2>Daily goal</h2>
    <label class="field"><span>Calories (kcal)</span><input type="number" step="50" inputmode="numeric" data-goal value="${state.goal}"></label>`;
}
