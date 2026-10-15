// The food log without the DOM: which day an entry belongs to, and adding up kcal.

// Local calendar date, not toISOString's UTC one: a snack at 23:30 counts for that evening.
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const total = entries => entries.reduce((t, e) => t + e.kcal, 0);
