// Drawing the current screen and moving between tabs; the snackbar.
import { $, esc, icon } from './components.js';
import { save, state, ui } from './state.js';
import { settings } from './views/settings.js';
import { stats } from './views/stats.js';
import { today } from './views/today.js';

export function render() {
  applyTheme();
  const tabs = [['today', 'Today'], ['stats', 'Stats'], ['settings', 'Settings']];
  $('nav').innerHTML = tabs.map(([t, label]) =>
    `<button data-tab="${t}" class="${t === ui.tab ? 'active' : ''}" aria-label="${label}"><span class="pill">${icon(t)}</span>${label}</button>`).join('');
  $('main').innerHTML = { today, stats, settings }[ui.tab]();
}

function applyTheme() {
  const t = state.theme ?? 'system';
  t === 'system' ? delete document.documentElement.dataset.theme : document.documentElement.dataset.theme = t;
  $('meta[name=theme-color]').content = getComputedStyle(document.documentElement).getPropertyValue('--md-surface').trim();
}

export function goTab(t) { ui.tab = t; render(); scrollTo(0, 0); }

// M3 snackbar: a message, optionally with an Undo action (a snapshot() taken before the change).
export function toast(msg, { undo } = {}) {
  const t = $('#snack');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>Undo</button>' : ''}`;
  t.hidden = false;
  t.onclick = undo && (e => { if (e.target.closest('button')) { t.hidden = true; Object.assign(state, JSON.parse(undo)); save(); render(); } });
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.hidden = true, undo ? 8000 : 4000);
}
