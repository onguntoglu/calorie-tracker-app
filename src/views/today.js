// Today tab: kcal left against the daily goal, the scan button, the day's meals and what's in them, then the weigh-in.
import { esc, fmt, icon, kcal, THEMES, wavyLine } from '../components.js';
import { state } from '../state.js';
import { amount, dayKey, MEALS, total } from '../lib/diary.js';

export function today() {
  const theme = THEMES[state.theme ?? 'system'];
  const h = new Date().getHours(), hello = h < 5 ? 'Late snack?' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const entries = state.log[dayKey()] ?? [], eaten = total(entries), left = state.goal - eaten;
  const [wDay, kg] = Object.entries(state.weights).sort().at(-1) ?? [];
  return `
    <div class="appbar"><hgroup><h1>${hello}</h1><p class="muted">${new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}</p></hgroup>
      <button class="icon-btn" data-theme-next aria-label="Theme: ${theme[1]}">${icon(theme[0])}</button></div>
    <section class="card hero${left < 0 ? ' over' : ''}">
      <span class="label">Today</span>
      <h2>${left < 0 ? `${kcal(-left)} kcal over` : `${kcal(left)} kcal left`}</h2>
      <p class="muted">${kcal(eaten)} of ${kcal(state.goal)} kcal eaten</p>
      ${wavyLine(Math.min(1, eaten / state.goal))}
      <button class="big" data-scan>${icon('scan')}Scan barcode</button>
    </section>
    <div class="list">${MEALS.map(([k, label]) => {
      const list = entries.map((e, i) => [e, i]).filter(([e]) => e.meal === k);
      return `<div class="item"><span class="avatar">${icon(k)}</span>
        <div class="body"><h3>${label}</h3>${list.length ? '' : '<span class="muted">Nothing yet</span>'}</div>
        <b>${kcal(total(list.map(([e]) => e)))} kcal</b></div>
        ${list.map(([e, i]) => `<button class="item food" data-entry="${i}">
          <span class="body"><span>${esc(e.name)}</span><span class="muted">${fmt(e.g)} ${e.unit}</span></span>
          <span class="muted">${kcal(amount(e))} kcal</span></button>`).join('')}`;
    }).join('')}</div>
    <div class="list"><button class="item" data-weight><span class="avatar">${icon('weight')}</span>
      <span class="body"><h3>Weight</h3><span class="muted">${wDay === dayKey() ? 'Today' : wDay ? `Last on ${new Date(wDay).toLocaleDateString([], { day: 'numeric', month: 'short', timeZone: 'UTC' })}. Tap to log today’s` : 'Tap to log it'}</span></span>
      ${kg ? `<b>${fmt(kg)} kg</b>` : ''}</button></div>`;
}
