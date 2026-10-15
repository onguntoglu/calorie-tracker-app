import assert from 'node:assert/strict';
import { amount, dayKey, mealAt, total } from '../src/lib/diary.js';

assert.equal(dayKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05'); // late evening stays on its own day
assert.equal(dayKey(new Date(2026, 11, 31, 0, 5)), '2026-12-31');
const at = h => mealAt(new Date(2026, 0, 5, h));
assert.deepEqual([3, 7, 12, 16, 19, 23].map(at), ['snacks', 'breakfast', 'lunch', 'snacks', 'dinner', 'snacks']);
const nutella = { g: 30, per100: { kcal: 539, protein: 6.3, carbs: 57.5, fat: 30.9 } };
assert.equal(amount(nutella), 161.7);
assert.equal(Math.round(amount(nutella, 'fat') * 100) / 100, 9.27);
assert.equal(total([nutella, { g: 200, per100: { kcal: 42 } }]), 245.7);
assert.equal(total([]), 0);
