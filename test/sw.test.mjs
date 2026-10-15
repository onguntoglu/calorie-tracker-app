// The service worker precaches every file the app loads, so it works offline after an update.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const listed = new Set([...sw.match(/const FILES = \[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(m => m[1]));
const src = readdirSync(new URL('../src', import.meta.url), { recursive: true }).filter(f => f.endsWith('.js')).map(f => 'src/' + f);
for (const f of ['index.html', 'style.css', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', ...src])
  assert.ok(listed.has(f), `${f} is missing from FILES in sw.js`);
