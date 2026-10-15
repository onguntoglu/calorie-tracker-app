// The food dialog: amount and meal for a scanned product, or changing an entry already logged.
import { dialogValue, dlg, esc, fmt, kcal } from './components.js';
import { MEALS } from './lib/diary.js';

// Resolves { g, meal, kcal } (kcal per 100, typed in when Open Food Facts has none), 'remove', or null.
export async function foodDialog(food, { g, meal, edit = false }) {
  const ask = food.per100.kcal == null, u = food.unit;
  dlg.innerHTML = `<form method="dialog" class="food"><h2 tabindex="-1" autofocus>${esc(food.name)}</h2>
    <p>${food.brand ? `${esc(food.brand)} · ` : ''}${ask ? 'No calories on Open Food Facts' : `${kcal(food.per100.kcal)} kcal per 100 ${u}`}</p>
    ${ask ? `<label class="field"><span>kcal per 100 ${u}, from the package</span><input type="number" inputmode="decimal" step="any" min="0" name="k" required></label>` : ''}
    <label class="field"><span>Amount (${u})</span><input type="number" inputmode="decimal" step="any" min="0.1" name="g" value="${fmt(g)}" required></label>
    <div class="segmented">${MEALS.map(([k, label]) => `<button type="button" class="${k === meal ? 'on' : ''}" data-meal="${k}">${label}</button>`).join('')}</div>
    <p class="sum"></p>
    <div class="actions"><button class="text" value="ok">${edit ? 'Save' : 'Add'}</button><button class="text" value="" formnovalidate>Cancel</button>
      ${edit ? '<button class="text danger" value="remove" formnovalidate>Remove</button>' : ''}</div></form>`;
  const f = dlg.querySelector('form'), per = () => ask ? Number(f.k.value) : food.per100.kcal;
  const sum = () => f.querySelector('.sum').textContent = `${kcal(per() * Number(f.g.value) / 100 || 0)} kcal`;
  f.oninput = sum; sum();
  f.querySelector('.segmented').onclick = e => {
    const b = e.target.closest('[data-meal]'); if (!b) return;
    meal = b.dataset.meal;
    f.querySelectorAll('[data-meal]').forEach(x => x.classList.toggle('on', x === b));
  };
  const v = await dialogValue();
  return v === 'remove' ? 'remove' : v === 'ok' ? { g: Number(f.g.value), meal, kcal: per() } : null;
}
