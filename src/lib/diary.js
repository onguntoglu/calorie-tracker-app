// The food log without the DOM: which day and meal an entry belongs to, and adding up kcal.

// Local calendar date, not toISOString's UTC one: a snack at 23:30 counts for that evening.
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
// The meal a new entry goes into by default, from the time of day; the add dialog can change it.
export const mealAt = (d = new Date()) => { const h = d.getHours(); return h < 5 ? 'snacks' : h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 17 ? 'snacks' : h < 22 ? 'dinner' : 'snacks'; };
// An entry: { meal, name, code, unit, g, per100: { kcal, protein, carbs, fat } }; g is the amount eaten (ml for drinks).
export const amount = (e, key = 'kcal') => e.per100[key] * e.g / 100;
export const total = (entries, key = 'kcal') => entries.reduce((t, e) => t + amount(e, key), 0);
export const MEALS = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner'], ['snacks', 'Snacks']];
