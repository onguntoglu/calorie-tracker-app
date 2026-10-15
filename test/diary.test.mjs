import assert from 'node:assert/strict';
import { dayKey, total } from '../src/lib/diary.js';

assert.equal(dayKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05'); // late evening stays on its own day
assert.equal(dayKey(new Date(2026, 11, 31, 0, 5)), '2026-12-31');
assert.equal(total([{ kcal: 120 }, { kcal: 80.5 }]), 200.5);
assert.equal(total([]), 0);
