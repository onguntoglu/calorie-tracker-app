// Taps and typing: every handler on the app shell.
import { $, kcal, THEMES } from './components.js';
import { foodDialog } from './dialogs.js';
import { goTab, render, toast } from './render.js';
import { lookup, scanCode } from './scan.js';
import { save, snapshot, state } from './state.js';
import { amount, dayKey, mealAt } from './lib/diary.js';

$('nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goTab(b.dataset.tab); });

const main = $('main');
main.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  const d = t.dataset;
  if ('scan' in d) return addByScan();
  if (d.entry != null) return editEntry(Number(d.entry));
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

// Scan, look the product up (known ones from state.foods, so offline too), then amount and meal.
async function addByScan() {
  const code = await scanCode(); if (code == null) return;
  if (!/^\d{8,14}$/.test(code)) return toast('A barcode is 8 to 14 digits');
  let food = state.foods[code];
  if (!food) {
    toast('Looking up…');
    try { food = await lookup(code); }
    catch { return toast('Can’t reach Open Food Facts. Check the connection.'); }
    if (!food) return toast(`${code} isn’t on Open Food Facts yet`);
    $('#snack').hidden = true;
  }
  const r = await foodDialog(food, { g: food.serving ?? 100, meal: mealAt() });
  if (!r || r === 'remove') return;
  const undo = snapshot(), per100 = { ...food.per100, kcal: r.kcal };
  state.foods[code] = { ...food, per100 };
  const entry = { meal: r.meal, name: food.name, code, unit: food.unit, g: r.g, per100 };
  (state.log[dayKey()] ??= []).push(entry);
  save(); render();
  toast(`Added ${food.name}, ${kcal(amount(entry))} kcal`, { undo });
}

async function editEntry(i) {
  const list = state.log[dayKey()], e = list?.[i]; if (!e) return;
  const r = await foodDialog(e, { g: e.g, meal: e.meal, edit: true });
  if (!r) return;
  const undo = snapshot();
  if (r === 'remove') { list.splice(i, 1); toast(`Removed ${e.name}`, { undo }); }
  else Object.assign(e, { g: r.g, meal: r.meal });
  save(); render();
}
