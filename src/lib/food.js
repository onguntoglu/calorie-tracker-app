// An Open Food Facts product reduced to what the log needs. Returns null without a usable product.

const num = v => { const n = Number(v); return v != null && v !== '' && Number.isFinite(n) ? n : null; };
export function toFood(code, p) {
  if (!p) return null;
  const n = p.nutriments ?? {};
  // kcal when given, else from kJ (energy_100g is in kJ); null when neither is there, the dialog then asks for it
  const kj = num(n['energy-kj_100g']) ?? num(n.energy_100g);
  const kcal = num(n['energy-kcal_100g']) ?? (kj != null ? Math.round(kj / 4.184) : null);
  return {
    code, name: p.product_name?.trim() || p.brands?.split(',')[0].trim() || code,
    brand: p.product_name?.trim() ? p.brands?.split(',')[0].trim() ?? '' : '',
    unit: p.product_quantity_unit === 'ml' ? 'ml' : 'g',
    serving: num(p.serving_quantity),
    per100: { kcal, protein: num(n.proteins_100g) ?? 0, carbs: num(n.carbohydrates_100g) ?? 0, fat: num(n.fat_100g) ?? 0 },
  };
}
