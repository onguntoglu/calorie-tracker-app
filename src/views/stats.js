// Stats tab: bodyweight over time.
import { chart, fmt } from '../components.js';
import { state } from '../state.js';

// x is days since 1970 (a day key read as UTC midnight), so dates print with timeZone UTC
const DAY = 864e5, date = x => new Date(x * DAY).toLocaleDateString([], { day: 'numeric', month: 'short', timeZone: 'UTC' });

export function stats() {
  // ponytail: every weigh-in in one chart, add a range (month, year) when it gets crowded
  const pts = Object.entries(state.weights).sort().map(([k, kg]) => [Date.parse(k) / DAY, kg]);
  const first = pts[0], last = pts.at(-1), diff = last && last[1] - first[1];
  return `<div class="appbar"><h1>Stats</h1></div>
    <h2>Bodyweight (kg)</h2>
    ${pts.length ? `${chart([{ pts, cls: 'a', name: 'Weight' }], { x0: first[0], x1: last[0], ticks: [[first[0], date(first[0])], [last[0], date(last[0])]], unit: ' kg', read: date })}
      ${pts.length > 1 ? `<p class="muted">${diff > 0 ? '+' : diff < 0 ? '−' : '±'}${fmt(Math.abs(diff))} kg since ${date(first[0])}.</p>` : ''}`
    : '<p class="muted">Log your weight on Today and it shows up here.</p>'}`;
}
