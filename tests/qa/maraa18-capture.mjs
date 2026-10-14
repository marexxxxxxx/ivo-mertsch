/**
 * MARAA-18 (F1) — Beleg-Capture fuer das Design-Delta (D1) und die
 * Light-Pflicht (A1, ADR 0003).
 *
 * Aufruf:  node tests/qa/maraa18-capture.mjs
 * Server:  npm run build && node ./dist/server/entry.mjs   (QA_BASE, Default
 *          http://127.0.0.1:4321)
 *
 * Erzeugt:
 *  - docs/qa/evidence/screens/{home,leistungen,kontakt,bewertungen}-{360,768,1440}.png
 *  - docs/qa/evidence/screens/light-scheme-{dark,light}-1440.png   (Home, erzwungenes Schema)
 *  - docs/qa/evidence/screens/consent-banner-360.png
 *  - docs/qa/evidence/screens.json
 *  - docs/qa/evidence/maraa18/light-pflicht.json  (gemessene body-Flaeche je Schema)
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EVID = join(ROOT, "docs", "qa", "evidence");
const SCR = join(EVID, "screens");
mkdirSync(SCR, { recursive: true });
mkdirSync(join(EVID, "maraa18"), { recursive: true });

const TARGETS = [
  ["home", "/"],
  ["leistungen", "/leistungen/"],
  ["kontakt", "/kontakt/"],
  ["bewertungen", "/bewertungen/"],
];
const WIDTHS = [360, 768, 1440];

const saved = [];

async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 })
    .catch(() => {});
}

/** Consent ablehnen, damit der Banner die Design-Flaeche nicht verdeckt. */
async function dismissConsent(page) {
  const reject = page.getByRole("button", { name: /Nur notwendige/i });
  if (await reject.count()) {
    await reject.click();
  }
}

const browser = await chromium.launch();

// --- 1) Seiten x Viewports ---------------------------------------------------
for (const width of WIDTHS) {
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width, height: 900 } });
  const page = await ctx.newPage();
  for (const [label, path] of TARGETS) {
    await page.goto(path, { waitUntil: "load" });
    await dismissConsent(page);
    await settle(page);
    const file = join(SCR, `${label}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    saved.push(file);
  }
  if (width === 360) {
    const ctx2 = await browser.newContext({ baseURL: BASE, viewport: { width: 360, height: 720 } });
    const page2 = await ctx2.newPage();
    await page2.goto("/", { waitUntil: "load" });
    await page2.screenshot({ path: join(SCR, "consent-banner-360.png") });
    saved.push(join(SCR, "consent-banner-360.png"));
    await ctx2.close();
  }
  await ctx.close();
}

// --- 2) Light-Pflicht: Home bei erzwungenem colorScheme dark UND light --------
const proof = {};
for (const scheme of ["dark", "light"]) {
  const ctx = await browser.newContext({
    baseURL: BASE,
    viewport: { width: 1440, height: 900 },
    colorScheme: scheme,
  });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "load" });
  await dismissConsent(page);
  await settle(page);
  const file = join(SCR, `light-scheme-${scheme}-1440.png`);
  await page.screenshot({ path: file, fullPage: true });
  saved.push(file);
  proof[scheme] = await page.evaluate(() => {
    return {
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      bodyColor: getComputedStyle(document.body).color,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      dataTheme: document.documentElement.getAttribute("data-theme"),
    };
  });
  await ctx.close();
}
await browser.close();

writeFileSync(
  join(EVID, "maraa18", "light-pflicht.json"),
  JSON.stringify(
    {
      note:
        "Light ist die einzige automatische Auslieferungsansicht (P1, ADR 0003). " +
        "Erzwungenes prefers-color-scheme:dark liefert dieselbe helle body-Flaeche (#FBFAF6) wie light.",
      colorSchemeDark: proof.dark,
      colorSchemeLight: proof.light,
      identical:
        proof.dark.bodyBackground === proof.light.bodyBackground &&
        proof.dark.bodyBackground === "rgb(251, 250, 246)",
    },
    null,
    2,
  ),
);
writeFileSync(join(EVID, "screens.json"), JSON.stringify(saved, null, 2));

console.log(`[maraa18] ${saved.length} Screens erzeugt.`);
console.log(`[maraa18] dark="${proof.dark.bodyBackground}" light="${proof.light.bodyBackground}"`);
