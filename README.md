# Calorie Tracker

A calorie tracker as an installable web app: scan a barcode, Open Food Facts supplies the nutrition values, and the
day's meals add up against a daily goal. Plain JavaScript modules, no build step. Data stays on the phone
(localStorage). The look follows the weightlifting app: Material 3 Expressive, here with a green seed.

Code lives on sourcehut (https://git.sr.ht/~onguntoglu/calorie-tracker-app) and is mirrored to GitHub, which serves
it at https://onguntoglu.github.io/calorie-tracker-app/. sourcehut pages can't host it: its Content-Security-Policy
blocks requests to the Open Food Facts API.

## Layout

```
index.html             app shell
style.css              Material 3 Expressive styles
sw.js                  service worker: offline cache (FILES lists every file the app loads)
manifest.webmanifest   install info, with icons/
src/
  main.js              entry point
  state.js             stored data (state) and what's on screen (ui)
  render.js            drawing the screen, moving between tabs, the snackbar
  actions.js           tap and typing handlers: scanning and adding food, editing entries, weight, backups
  scan.js              camera barcode reading (BarcodeDetector), Open Food Facts lookup
  dialogs.js           the food dialog: amount and meal
  components.js        shared UI pieces: formatting, icons, shapes, the chart, dialogs
  views/               one module per tab
  lib/                 pure logic without the DOM, tested under node
test/                  one test file per lib module, plus a check of sw.js
.github/workflows/     tests, then deploys to GitHub Pages on every push to master
```

## Working on it

- Run locally: `python3 -m http.server`, then open http://localhost:8000
- Test: `node --test`
- Publish: `git push` (pushes to sourcehut and GitHub; GitHub Actions deploys)
- A new file under `src/` goes into `FILES` in `sw.js` too; the tests fail until it does.
