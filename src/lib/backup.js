// Restoring a backup: the file is untrusted input, so everything is rebuilt from known fields.
// Numbers become numbers and units and meals one of the known values, so nothing from the file renders as HTML
// (names are escaped wherever they are rendered). Returns null for a file that isn't this app's backup.
import { MEALS } from './diary.js';

const num = x => Number(x) || 0;
const str = x => String(x ?? '');
const per100 = p => ({ kcal: num(p?.kcal), protein: num(p?.protein), carbs: num(p?.carbs), fat: num(p?.fat) });
const unit = u => u === 'ml' ? 'ml' : 'g';
// the keys of obj that match re, with their values through f; f returning null drops the key too
const only = (obj, re, f) => Object.fromEntries(Object.entries(Object(obj)).flatMap(([k, v]) => re.test(k) && (v = f(v, k)) != null ? [[k, v]] : []));
const DAY = /^\d{4}-\d{2}-\d{2}$/;

export function sanitize(data) {
  if (!data || typeof data.log !== 'object' || typeof data.foods !== 'object' || !data.log || !data.foods) return null;
  const meals = MEALS.map(([k]) => k);
  return {
    theme: ['system', 'light', 'dark'].includes(data.theme) ? data.theme : 'system',
    goal: num(data.goal) > 0 ? num(data.goal) : 2000,
    lastBackup: num(data.lastBackup),
    log: only(data.log, DAY, day => (Array.isArray(day) ? day : []).map(e => ({
      meal: meals.includes(e?.meal) ? e.meal : 'snacks', name: str(e?.name), code: str(e?.code),
      unit: unit(e?.unit), g: num(e?.g), per100: per100(e?.per100),
    }))),
    foods: only(data.foods, /^\d{8,14}$/, (f, code) => ({
      code, name: str(f?.name) || code, brand: str(f?.brand), unit: unit(f?.unit),
      serving: num(f?.serving) > 0 ? num(f.serving) : null, per100: per100(f?.per100),
    })),
    weights: only(data.weights, DAY, kg => num(kg) > 0 ? num(kg) : null),
  };
}
