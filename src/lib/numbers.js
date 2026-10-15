// Number helpers for charts.

// Round axis values covering lo..hi, 3 to 5 of them, steps of 1, 2, 2.5 or 5 times a power of ten.
export function niceTicks(lo, hi) {
  if (lo === hi) { lo -= 1; hi += 1; }
  const raw = (hi - lo) / 3, mag = 10 ** Math.floor(Math.log10(raw)), step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  const a = Math.floor(lo / step) * step, n = Math.round((Math.ceil(hi / step) * step - a) / step);
  return Array.from({ length: n + 1 }, (_, i) => +(a + i * step).toFixed(10));
}
