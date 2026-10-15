// Today tab: kcal left against the daily goal, then the day's meals.
import { icon, kcal, THEMES, wavyLine } from '../components.js';
import { state } from '../state.js';
import { dayKey, total } from '../lib/diary.js';

const MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snacks', 'Snacks']];

export function today() {
  const theme = THEMES[state.theme ?? 'system'];
  const h = new Date().getHours(), hello = h < 5 ? 'Late snack?' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const entries = state.log[dayKey()] ?? [], eaten = total(entries), left = state.goal - eaten;
  return `
    <div class="appbar"><hgroup><h1>${hello}</h1><p class="muted">${new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p></hgroup>
      <button class="icon-btn" data-theme-next aria-label="Theme: ${theme[1]}">${icon(theme[0])}</button></div>
    <section class="card hero${left < 0 ? ' over' : ''}">
      <span class="label">Today</span>
      <h2>${left < 0 ? `${kcal(-left)} kcal over` : `${kcal(left)} kcal left`}</h2>
      <p class="muted">${kcal(eaten)} of ${kcal(state.goal)} kcal eaten</p>
      ${wavyLine(Math.min(1, eaten / state.goal))}
    </section>
    <div class="list">${MEALS.map(([k, label]) => {
      const list = entries.filter(e => e.meal === k);
      return `<div class="item"><span class="avatar">${icon(k)}</span>
        <div class="body"><h3>${label}</h3><span class="muted">${list.length ? `${list.length} item${list.length === 1 ? '' : 's'}` : 'Nothing yet'}</span></div>
        <b>${kcal(total(list))} kcal</b></div>`;
    }).join('')}</div>`;
}
