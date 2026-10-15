// Entry point: wires up the handlers, registers the service worker, draws the first screen.
import './actions.js';
import { render } from './render.js';

navigator.storage?.persist?.();
if ('serviceWorker' in navigator) {
  // New version took over: reload to show it now. Skipped on first install (no previous worker).
  // Safe mid-entry: every tap and keystroke is already saved.
  const hadWorker = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => hadWorker && location.reload());
  navigator.serviceWorker.register('sw.js');
}
render();
