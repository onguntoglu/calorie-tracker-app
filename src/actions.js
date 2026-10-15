// Taps and typing: every handler on the app shell.
import { $, ask, fmt, kcal, THEMES } from './components.js';
import { foodDialog } from './dialogs.js';
import { goTab, render, toast } from './render.js';
import { lookup, scanCode } from './scan.js';
import { save, snapshot, state } from './state.js';
import { sanitize } from './lib/backup.js';
import { amount, dayKey, mealAt } from './lib/diary.js';

$('nav').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) goTab(b.dataset.tab); });

const main = $('main');
main.addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  const d = t.dataset;
  if ('scan' in d) return addByScan();
  if (d.entry != null) return editEntry(Number(d.entry));
  if ('weight' in d) return logWeight();
  if ('share' in d) return shareBackup(); // first thing in the tap: sharing needs the user's gesture
  if ('export' in d) exportBackup();
  else if ('themeNext' in d || d.theme) {
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

// Chart readout: the values at the strip under the finger. Touch pointers are captured by the element they start on, so
// sending moves to where it started would miss; the point is looked up under the finger.
const reading = e => {
  const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest('.hit'); if (!hit) return;
  const fig = hit.closest('figure'), cross = fig.querySelector('.cross');
  cross.setAttribute('x1', hit.dataset.x); cross.setAttribute('x2', hit.dataset.x); cross.classList.add('on');
  fig.querySelector('.readout').textContent = hit.dataset.read;
};
main.addEventListener('pointerdown', reading);
main.addEventListener('pointermove', reading);

main.addEventListener('change', async e => {
  const t = e.target;
  if (!('restore' in t.dataset)) return;
  const text = await t.files[0]?.text();
  t.value = ''; // so picking the same file again still fires
  if (text == null) return;
  let data = null;
  try { data = sanitize(JSON.parse(text)); } catch {}
  if (!data) return toast('That file isn’t a Calorie Tracker backup');
  const days = Object.values(data.log).filter(day => day.length).length;
  if (!await ask('Restore this backup?', `It has ${days} day${days === 1 ? '' : 's'} logged. It replaces everything on this phone.`, 'Restore', { danger: true })) return;
  const undo = snapshot();
  Object.assign(state, data);
  save(); render();
  toast('Backup restored', { undo });
});

// Backups: a file in Downloads, or through the share sheet. Android shares text files but not .json,
// so a shared one goes as .txt; restoring reads either.
const backupName = ext => `calorie-tracker-backup-${dayKey()}.${ext}`;
function exportBackup() {
  state.lastBackup = Date.now();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' }));
  a.download = backupName('json');
  a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
async function shareBackup() {
  const was = state.lastBackup;
  state.lastBackup = Date.now(); // before writing the file, so a restored backup knows when it was made
  try { await navigator.share({ files: [new File([JSON.stringify(state, null, 1)], backupName('txt'), { type: 'text/plain' })], title: 'Calorie Tracker backup' }); }
  catch (err) { state.lastBackup = was; if (err.name !== 'AbortError') toast('Couldn’t share: ' + err.message); return; }
  save(); render();
}

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

// Today's weight: typed with a comma or a point; empty removes it.
async function logWeight() {
  const day = dayKey(), last = state.weights[day] ?? Object.entries(state.weights).sort().at(-1)?.[1];
  const v = await ask('Weight today', null, 'Save', { input: { label: 'kg', value: last == null ? '' : fmt(last) } });
  if (v == null) return;
  const kg = Number(v.trim().replace(',', '.'));
  if (!v.trim()) delete state.weights[day];
  else if (kg > 0) state.weights[day] = kg;
  else return toast('Type your weight in kg, like 72.4');
  save(); render();
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
