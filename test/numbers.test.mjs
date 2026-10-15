import assert from 'node:assert/strict';
import { niceTicks } from '../src/lib/numbers.js';

assert.deepEqual(niceTicks(47, 75), [40, 50, 60, 70, 80]);
assert.deepEqual(niceTicks(0, 100), [0, 50, 100]);
assert.deepEqual(niceTicks(78.2, 79), [78, 78.5, 79]);
assert.deepEqual(niceTicks(80, 80), [79, 80, 81]); // one value: a band around it
