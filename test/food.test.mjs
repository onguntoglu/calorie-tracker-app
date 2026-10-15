import assert from 'node:assert/strict';
import { toFood } from '../src/lib/food.js';

// shapes as the API returns them (fields trimmed)
const nutella = { product_name: 'Nutella', brands: 'Ferrero', product_quantity_unit: 'g', serving_quantity: null,
  nutriments: { 'energy-kcal_100g': 539, 'energy-kj_100g': 2228, proteins_100g: 6.3, carbohydrates_100g: 57.5, fat_100g: 30.9 } };
assert.deepEqual(toFood('3017624010701', nutella), { code: '3017624010701', name: 'Nutella', brand: 'Ferrero', unit: 'g', serving: null,
  per100: { kcal: 539, protein: 6.3, carbs: 57.5, fat: 30.9 } });
// a drink: ml, a serving, and a real 0 kcal that must stay 0
const diet = toFood('0049000028911', { product_name: 'Diet Coke', brands: 'Coke', product_quantity_unit: 'ml', serving_quantity: 354.9,
  nutriments: { 'energy-kcal_100g': 0, proteins_100g: 0 } });
assert.equal(diet.unit, 'ml'); assert.equal(diet.serving, 354.9); assert.equal(diet.per100.kcal, 0);
// only kJ: converted; nothing at all: null so the dialog asks
assert.equal(toFood('1', { nutriments: { energy_100g: 2228 } }).per100.kcal, 533);
assert.equal(toFood('1', { product_name: 'X', nutriments: {} }).per100.kcal, null);
assert.equal(toFood('1', { product_name: 'X', nutriments: { 'energy-kcal_100g': '' } }).per100.kcal, null);
// no name: the brand, then the code
assert.equal(toFood('42', { brands: 'Acme, Other' }).name, 'Acme');
assert.equal(toFood('42', {}).name, '42');
assert.equal(toFood('42', null), null);
