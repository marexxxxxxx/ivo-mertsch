/**
 * MARAA-7 — Render-Nachweis AUS DEM CONTAINER.
 *
 * Startet selbst keinen Container. Erwartet das laufende Image unter QA_BASE
 * (z. B. http://127.0.0.1:14321). Rendert die Seite mit Chromium, legt
 * Vollbild-Screenshots ab und protokolliert Status, Titel, H1 sowie
 * Console-Fehler und fehlgeschlagene Requests.
 *
 * Aufruf:
 *   QA_BASE=http://127.0.0.1:14321 node docs/qa/evidence/docker/render-from-container.mjs
 *
 * Belege: docs/qa/evidence/docker/screens/*.png + render-from-container.json
 * Exit 0 nur, wenn jede Seite HTTP 200 liefert.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const HERE = dirname(fileURLToPath(import.meta.url));
const SCR = join(HERE, "screens");
mkdirSync(SCR, { recursive: true });

const PAGES = ["/", "/leistungen/", "/kontakt/", "/impressum/", "/datenschutzerklaerung/"];
const VIEWPORTS = [
  { name: "desktop-1280", width: 1280, height: 900 },
  { name: "mobil-360", width: 360, height: 800 },
];

const slug = (p) => (p === "/" ? "root" : p.replace(/\/$/, "").replace(/\//g, "_"));

const out = { base: BASE, at: new Date().toISOString(), pages: [] };
const browser = await chromium.launch();

for (const vp of VIEWPORTS) {
  for (const path of PAGES) {
    const ctx = await browser.newContext({
      baseURL: BASE,
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await ctx.newPage();
    const consoleErrors = [];
    const failedRequests = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("requestfailed", (r) => failedRequests.push(`${r.url()} :: ${r.failure()?.errorText ?? ""}`));

    let status = null, title = null, h1 = null, cookieButton = false, error = null;
    let imagesTotal = null, imagesLoaded = null;
    try {
      const resp = await page.goto(path, { waitUntil: "load" });
      status = resp ? resp.status() : null;
      title = await page.title();
      h1 = (await page.locator("h1").first().textContent().catch(() => null))?.trim() ?? null;
      cookieButton = await page
        .getByRole("button", { name: /cookie-einstellungen/i })
        .first()
        .isVisible()
        .catch(() => false);
      // Lazy-Bilder durch die Seite hindurch antriggern, dann deterministisch
      // warten, bis alle <img> dekodiert sind — sonst ist der Vollbild-
      // Screenshot unter dem Falz weiss (Capture-Artefakt, kein Seitenfehler).
      await page.evaluate(async () => {
        const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 30));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(
        () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
        null,
        { timeout: 20000 },
      );
      imagesTotal = await page.evaluate(() => document.images.length);
      imagesLoaded = await page.evaluate(
        () => Array.from(document.images).filter((i) => i.complete && i.naturalWidth > 0).length,
      );
      await page.screenshot({
        path: join(SCR, `${vp.name}__${slug(path)}.jpg`),
        fullPage: true,
        type: "jpeg",
        quality: 80,
      });
    } catch (e) {
      error = String(e);
    }
    out.pages.push({
      viewport: vp.name,
      path,
      status,
      title,
      h1,
      cookieSettingsButtonVisible: cookieButton,
      imagesLoaded,
      imagesTotal,
      screenshot: `screens/${vp.name}__${slug(path)}.jpg`,
      consoleErrors,
      failedRequests,
      error,
    });
    await ctx.close();
  }
}
await browser.close();

writeFileSync(join(HERE, "render-from-container.json"), JSON.stringify(out, null, 2));
console.log(JSON.stringify(out.pages.map((p) => ({
  viewport: p.viewport, path: p.path, status: p.status, title: p.title,
  cookie: p.cookieSettingsButtonVisible, images: `${p.imagesLoaded}/${p.imagesTotal}`,
  consoleErrors: p.consoleErrors.length,
  failedRequests: p.failedRequests.length, error: p.error,
})), null, 2));
process.exit(out.pages.some((p) => p.status !== 200) ? 1 : 0);
