import assert from 'node:assert/strict';
import { sanitize } from '../src/lib/backup.js';

// the app's own state comes back unchanged
const per100 = { kcal: 539, protein: 6.3, carbs: 57.5, fat: 30.9 };
const st = { theme: 'dark', goal: 1800, lastBackup: 1760000000000,
  log: { '2026-10-15': [{ meal: 'lunch', name: 'Nutella', code: '3017624010701', unit: 'g', g: 30, per100 }] },
  foods: { '3017624010701': { code: '3017624010701', name: 'Nutella', brand: 'Ferrero', unit: 'g', serving: null, per100 } },
  weights: { '2026-10-14': 72.4, '2026-10-15': 72.1 } };
assert.deepEqual(sanitize(JSON.parse(JSON.stringify(st))), st);

// a hostile or broken file: only known values get through
// (parsed from text like a real file, so "__proto__" is a plain key)
const bad = sanitize(JSON.parse(`{ "theme": "\\"><script>", "goal": -5, "log": { "2026-10-15": [{ "meal": "<img>", "unit": "<b>", "g": "x",
  "per100": { "kcal": "1e3" } }, null], "__proto__": [], "nope": [] }, "foods": { "abc": {}, "12345678": { "serving": 0 } },
  "weights": { "2026-10-15": "0", "2026-10-14": "71,5", "2026-10-13": "71.5", "x": 70 } }`));
assert.equal(bad.theme, 'system'); assert.equal(bad.goal, 2000);
assert.deepEqual(Object.keys(bad.log), ['2026-10-15']);
assert.deepEqual(bad.log['2026-10-15'][0], { meal: 'snacks', name: '', code: '', unit: 'g', g: 0, per100: { kcal: 1000, protein: 0, carbs: 0, fat: 0 } });
assert.equal(bad.log['2026-10-15'][1].meal, 'snacks');
assert.deepEqual(bad.weights, { '2026-10-13': 71.5 });
assert.deepEqual(sanitize({ log: {}, foods: {} }).weights, {}); // a file without weights
assert.deepEqual(Object.keys(bad.foods), ['12345678']); assert.equal(bad.foods['12345678'].name, '12345678'); assert.equal(bad.foods['12345678'].serving, null);

// not this app's backup (the weightlifting app's has a log but no foods)
for (const x of [null, 42, {}, { log: {} }, { log: null, foods: {} }]) assert.equal(sanitize(x), null);
