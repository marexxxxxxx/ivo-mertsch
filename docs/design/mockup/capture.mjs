/**
 * capture.mjs — Beleg-Screens für das Design-Delta MARAA-15 (D1).
 *
 * Nimmt die vier Zielseiten-Mock-Ups mit ERZWUNGENEM prefers-color-scheme: dark
 * auf. Bleibt das Ergebnis hell, ist P1 (Light als einzige automatische Ansicht)
 * belegt. Zusätzlich ein Beleg für A1-Kodierungsweg (b): die historische
 * Auto-Dark-Media-Query PLUS `<html data-theme="light">` bleibt hell.
 *
 * Aufruf (aus dem Projekt-Wurzelverzeichnis):
 *   node docs/design/mockup/capture.mjs
 *
 * Ausgabe: docs/design/*-light.jpg und docs/design/a1-path-b-data-theme-light.jpg
 */
import { chromium } from "playwright";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "..");

const PAGES = [
  ["start.html", "start-light.jpg"],
  ["leistungen.html", "leistungen-light.jpg"],
  ["kontakt.html", "kontakt-light.jpg"],
  ["bewertungen.html", "bewertungen-light.jpg"],
];

// A1-Kodierungsweg (b): historische Auto-Dark-Regel plus data-theme="light".
const PATH_B = `<!doctype html><html lang="de" data-theme="light"><head>
<meta charset="utf-8" /><link rel="stylesheet" href="mockup.css" />
<style>
/* Simuliert die historische, generator-erzeugte Auto-Dark-Regel (A1-Weg b).
   Wegen :root:not([data-theme="light"]) darf sie mit gesetztem Attribut NICHT greifen. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --pf-surface-page: #15120D; --pf-text-primary: #FBFAF6; color-scheme: dark; }
}
</style></head>
<body>
<main style="padding:var(--pf-space-11) var(--pf-gutter-md);max-width:var(--pf-container-max);margin-inline:auto">
  <p class="eyebrow">A1-Kompatibilität · Weg (b)</p>
  <h1 style="font-size:var(--pf-text-3xl)">data-theme="light" schlägt Auto-Dark</h1>
  <p class="lead">Diese Seite wird mit erzwungenem <code>prefers-color-scheme: dark</code> gerendert und trägt die historische Auto-Dark-Regel — bleibt aber hell, weil am <code>&lt;html&gt;</code> <code>data-theme="light"</code> steht.</p>
  <p style="color:var(--pf-text-muted)">Fläche wäre bei Auto-Dark #15120D. Sichtbar: <span class="phone-link">hell</span>.</p>
</main></body></html>`;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  colorScheme: "dark", // erzwingt prefers-color-scheme: dark
  reducedMotion: "reduce",
});
const page = await context.newPage();

for (const [file, out] of PAGES) {
  const url = pathToFileURL(path.join(here, file)).href;
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outDir, out), fullPage: true, type: "jpeg", quality: 82 });
  console.log(`[ok] ${out}`);
}

// Beleg Weg (b)
fs.writeFileSync(path.join(here, "_a1-path-b.html"), PATH_B, "utf-8");
await page.goto(pathToFileURL(path.join(here, "_a1-path-b.html")).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(150);
await page.screenshot({ path: path.join(outDir, "a1-path-b-data-theme-light.jpg"), fullPage: true, type: "jpeg", quality: 82 });
console.log("[ok] a1-path-b-data-theme-light.jpg");
fs.rmSync(path.join(here, "_a1-path-b.html"));

await browser.close();
console.log("Screens in docs/design/ abgelegt (erzwungenes Dark-Schema → bleibt hell).");
