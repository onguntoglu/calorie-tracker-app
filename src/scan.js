// Barcode scanning: the back camera in a dialog, read by the browser's BarcodeDetector (Chrome on Android has it),
// with a typed number as the fallback. Then the product from Open Food Facts.
import { dialogValue, dlg } from './components.js';
import { toFood } from './lib/food.js';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e']; // what's printed on groceries

// Resolves the barcode as typed or read, or null when cancelled.
export async function scanCode() {
  dlg.innerHTML = `<form method="dialog" class="scanner"><h2 tabindex="-1" autofocus>Scan barcode</h2>
    <video muted playsinline hidden></video>
    <p class="hint">Point the camera at the barcode.</p>
    <label class="field"><span>Or type the number</span><input name="code" inputmode="numeric" autocomplete="off"></label>
    <div class="actions"><button class="text" value="code">Look up</button><button class="text" value="">Cancel</button></div></form>`;
  const video = dlg.querySelector('video'), hint = dlg.querySelector('.hint');
  let stream, timer, found = null, done = false;
  const closed = dialogValue();
  const stop = () => { clearTimeout(timer); stream?.getTracks().forEach(t => t.stop()); };
  (async () => {
    const formats = 'BarcodeDetector' in window ? (await BarcodeDetector.getSupportedFormats()).filter(f => FORMATS.includes(f)) : [];
    if (!formats.length) { hint.textContent = 'This browser can’t read barcodes. Type the number instead.'; return; }
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 } } });
    if (done) return stop(); // closed while the camera was starting: don't leave it on
    video.srcObject = stream; video.hidden = false; await video.play();
    const detector = new BarcodeDetector({ formats });
    const tick = async () => {
      if (done) return;
      const [hit] = await detector.detect(video).catch(() => []);
      if (hit && !done) { found = hit.rawValue; navigator.vibrate?.(40); dlg.close(); }
      else timer = setTimeout(tick, 120);
    };
    tick();
  })().catch(() => { hint.textContent = 'No camera access. Type the number instead.'; });
  const v = await closed;
  done = true; stop();
  return found ?? (v === 'code' ? dlg.querySelector('input').value.trim() : null);
}

// The product for a barcode, or null when Open Food Facts doesn't have it. Throws when it can't be reached.
export async function lookup(code) {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_quantity,product_quantity_unit`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Open Food Facts: HTTP ${res.status}`);
  const data = await res.json();
  return data.status === 1 ? toFood(code, data.product) : null;
}
