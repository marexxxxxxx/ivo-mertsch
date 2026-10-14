/**
 * MARAA-20 (F1) — Beleg-Capture fuer die Galerie „Flächen ansehen"
 * (konzept.md §5 / komponenten.md §19.4, Zielzustand docs/design/mockup/start.html).
 *
 * Aufruf:  node tests/qa/maraa20-capture.mjs
 * Server:  npm run build && node ./dist/server/entry.mjs   (QA_BASE,
 *          Default http://127.0.0.1:4321)
 *
 * Erzeugt (nichts wird ueberschrieben, was MARAA-18/19 gehoert):
 *  - docs/qa/evidence/maraa20/screens/start-{360,768,1024,1440}.png
 *  - docs/qa/evidence/maraa20/screens/galerie-{1024,1440}.png
 *  - docs/qa/evidence/maraa20/gallery.json   (DOM-/Bildbudget-Belege)
 *  - docs/qa/evidence/maraa20/overflow.json  (alle Seiten x {360,768,1024,1440})
 *  - docs/qa/evidence/maraa20/a11y.json      (axe, serious/critical)
 */
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "docs", "qa", "evidence", "maraa20");
const SCR = join(OUT, "screens");
mkdirSync(SCR, { recursive: true });

const PAGES = [
  "/",
  "/leistungen/",
  "/leistungen/fugenlose-bäder/",
  "/leistungen/fugenlose-böden/",
  "/leistungen/innenausbau/",
  "/leistungen/fassaden/",
  "/über-uns/",
  "/bewertungen/",
  "/kontakt/",
  "/impressum/",
  "/datenschutzerklaerung/",
];

async function dismissConsent(page) {
  const reject = page.getByRole("button", { name: /Nur notwendige/i });
  if (await reject.count()) await reject.click();
}

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
  });
  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 })
    .catch(() => {});
}

const browser = await chromium.launch();
const saved = [];

// --- 1) Startseite x Viewports ----------------------------------------------
for (const width of [360, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "load" });
  await dismissConsent(page);
  await settle(page);
  const full = join(SCR, `start-${width}.png`);
  await page.screenshot({ path: full, fullPage: true });
  saved.push(full);
  if (width >= 1024) {
    const section = page.locator('section[aria-labelledby="galerie-titel"]');
    const box = join(SCR, `galerie-${width}.png`);
    await section.screenshot({ path: box });
    saved.push(box);
  }
  await ctx.close();
}

// --- 2) Galerie-DOM + Bildbudget (1440) -------------------------------------
let galleryProof;
{
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const thirdParty = [];
  page.on("request", (req) => {
    const u = new URL(req.url());
    if (!["127.0.0.1", "localhost"].includes(u.hostname)) thirdParty.push(req.url());
  });
  await page.goto("/", { waitUntil: "load" });
  await dismissConsent(page);
  await settle(page);
  galleryProof = await page.evaluate(() => {
    const section = document.querySelector('section[aria-labelledby="galerie-titel"]');
    const items = Array.from(section.querySelectorAll(".pf-gallery__item"));
    const imgs = Array.from(section.querySelectorAll("img"));
    const perf = performance.getEntriesByType("resource").filter((e) => e.initiatorType === "img");
    const srcs = imgs.map((i) => i.currentSrc || i.src);
    const galleryBytes = perf
      .filter((e) => srcs.some((s) => s && e.name.includes(s.split("/").pop().split(".")[0])))
      .reduce((sum, e) => sum + (e.transferSize || 0), 0);
    return {
      sectionHeading: section.querySelector("h2")?.textContent?.trim() ?? null,
      itemCount: items.length,
      bigCellCount: section.querySelectorAll(".pf-gallery__item--big").length,
      bigCellIsFirst: items[0]?.classList.contains("pf-gallery__item--big") ?? false,
      decorativeCount: section.querySelectorAll('figure[aria-hidden="true"]').length,
      imgs: imgs.map((i) => ({
        src: i.currentSrc || i.src,
        alt: i.getAttribute("alt"),
        loading: i.getAttribute("loading"),
        decoding: i.getAttribute("decoding"),
        width: i.getAttribute("width"),
        height: i.getAttribute("height"),
        naturalWidth: i.naturalWidth,
        aspectRatio: getComputedStyle(i).aspectRatio,
        complete: i.complete,
      })),
      kiHinweisFullInSection: section.querySelectorAll(".pf-ki-hinweis--full").length,
      galleryBytes,
      totalPageTransferBytes: perf.reduce((s, e) => s + (e.transferSize || 0), 0),
    };
  });
  galleryProof.thirdPartyRequestsWithoutConsent = thirdParty;
  await ctx.close();
}
writeFileSync(join(OUT, "gallery.json"), JSON.stringify(galleryProof, null, 2));

// --- 3) Overflow: alle Seiten x 4 Breiten -----------------------------------
const overflow = [];
for (const w of [360, 768, 1024, 1440]) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "load" });
    const m = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    }));
    overflow.push({ path, width: w, ...m, overflow: m.scrollW > m.clientW + 1 });
  }
  await ctx.close();
}
writeFileSync(join(OUT, "overflow.json"), JSON.stringify(overflow, null, 2));

// --- 4) axe (serious/critical) ----------------------------------------------
const a11y = [];
{
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "load" });
    await dismissConsent(page);
    await settle(page);
    const res = await new AxeBuilder({ page }).analyze();
    const bad = res.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    a11y.push({ path, seriousCritical: bad.length, ids: bad.map((v) => `${v.impact}:${v.id}`) });
  }
  await ctx.close();
}
writeFileSync(join(OUT, "a11y.json"), JSON.stringify(a11y, null, 2));
await browser.close();

const overflowFail = overflow.filter((o) => o.overflow);
const a11yFail = a11y.filter((a) => a.seriousCritical > 0);

console.log(`[maraa20] ${saved.length} Screens erzeugt.`);
console.log(
  `[maraa20] Galerie: ${galleryProof.itemCount} Items, big=${JSON.stringify(galleryProof.bigCellIsFirst)}, ` +
    `dekorativ=${galleryProof.decorativeCount}, KI-Vollform=${galleryProof.kiHinweisFullInSection}`,
);
console.log(`[maraa20] Bild-Transfer Galerie ≈ ${Math.round(galleryProof.galleryBytes / 1024)} KB (Seite gesamt ≈ ${Math.round(galleryProof.totalPageTransferBytes / 1024)} KB)`);
console.log(`[maraa20] Dritt-Requests ohne Consent: ${galleryProof.thirdPartyRequestsWithoutConsent.length}`);
console.log(`[maraa20] Overflow-Verstoesse: ${overflowFail.length}`);
console.log(`[maraa20] axe serious/critical: ${a11yFail.length}`);

if (overflowFail.length || a11yFail.length || galleryProof.thirdPartyRequestsWithoutConsent.length > 0) {
  process.exitCode = 1;
}
