// Taps and typing: every handler on the app shell.
import { $, THEMES } from './components.js';
import { goTab, render, toast } from './render.js';
import { save, state } from './state.js';

$('nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goTab(b.dataset.tab); });

const main = $('main');
main.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  const d = t.dataset;
  if ('themeNext' in d || d.theme) {
    const order = Object.keys(THEMES);
    state.theme = d.theme ?? order[(order.indexOf(state.theme ?? 'system') + 1) % order.length];
    if ('themeNext' in d) toast(`Theme: ${THEMES[state.theme][1]}`);
  } else return;
  save(); render();
});

main.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if ('goal' in d) { if (Number(t.value) > 0) state.goal = Number(t.value); }
  else return;
  save(); // no re-render: keeps focus while typing
});
