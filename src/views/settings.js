// Settings tab.
import { canShare, icon, THEMES } from '../components.js';
import { state } from '../state.js';

export function settings() {
  const theme = state.theme ?? 'system';
  return `<div class="appbar"><h1>Settings</h1></div>
    <h2>Appearance</h2>
    <div class="segmented">${Object.entries(THEMES).map(([t, [ic, label]]) =>
      `<button class="${t === theme ? 'on' : ''}" data-theme="${t}">${t === theme ? icon('check') : icon(ic)}${t === 'system' ? 'System' : label}</button>`).join('')}</div>
    <h2>Daily goal</h2>
    <label class="field"><span>Calories (kcal)</span><input type="number" step="50" inputmode="numeric" data-goal value="${state.goal}"></label>
    <h2>Backup</h2>
    <p class="muted">Your log lives only on this phone. Clearing browser data deletes it, so keep backups.${canShare ? ' Share sends one to Drive, Nextcloud or email.' : ''}
      ${state.lastBackup ? `Last backup: ${new Date(state.lastBackup).toLocaleDateString()}.` : 'No backup yet.'}</p>
    <div class="actions">
      ${canShare ? '<button class="tonal" data-share>Share backup</button>' : ''}
      <button class="${canShare ? '' : 'tonal'}" data-export>Save to Downloads</button>
      <label class="button">Restore backup<input class="file" type="file" accept=".json,.txt,application/json,text/plain" data-restore></label>
    </div>`;
}
