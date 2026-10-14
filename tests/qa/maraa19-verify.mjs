/**
 * MARAA-19 (Q1) — Abnahme-Verifikation des Design-Deltas (D1) und der
 * Light-Pflicht (A1/ADR 0003), unabhaengig vom Entwickler-E2E-Set.
 *
 * Aufruf:  node tests/qa/maraa19-verify.mjs <section>
 *   sections: light | axe | interaction | responsive | consent | contact |
 *             drawer | briefing | reviews | all
 *
 * Server: npm run build && node ./dist/server/entry.mjs (QA_BASE, Default
 *         http://127.0.0.1:4321)
 *
 * Schreibt JSON-Belege nach docs/qa/evidence/maraa19/ und Screenshots nach
 * docs/qa/evidence/maraa19/screens/.
 *
 * Grundsatz: Bei Zweifeln wird Fail gemeldet. waitForTimeout() ist verboten.
 */
import { chromium, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EVID = join(ROOT, "docs", "qa", "evidence", "maraa19");
const SCR = join(EVID, "screens");
mkdirSync(SCR, { recursive: true });

// Verifikationsmatrix MARAA-19: Start, Leistungen (Sammelseite + 4),
// Kontakt, Bewertungen, Rechtstexte.
const PAGES = [
  ["start", "/"],
  ["leistungen", "/leistungen/"],
  ["leistungen-fugenlose-baeder", "/leistungen/fugenlose-bäder/"],
  ["leistungen-fugenlose-boeden", "/leistungen/fugenlose-böden/"],
  ["leistungen-innenausbau", "/leistungen/innenausbau/"],
  ["leistungen-fassaden", "/leistungen/fassaden/"],
  ["ueber-uns", "/über-uns/"],
  ["kontakt", "/kontakt/"],
  ["bewertungen", "/bewertungen/"],
  ["impressum", "/impressum/"],
  ["datenschutzerklaerung", "/datenschutzerklaerung/"],
  ["404", "/gibt-es-nicht/"],
];
const section = process.argv[2] ?? "all";
let failures = 0;
const results = [];

function save(name, data) {
  writeFileSync(join(EVID, name), JSON.stringify(data, null, 2));
}
function ok(id, pass, detail) {
  if (!pass) failures++;
  const row = { id, status: pass ? "pass" : "fail", detail: detail ?? null };
  results.push(row);
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}${detail ? "  — " + detail : ""}`);
  return row;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Lazy-Bilder laden + Fonts fertig, dann zurueck an den Anfang. Wartet, bis
 *  wirklich JEDES Bild dekodiert ist (naturalWidth > 0) — kein stiller Timeout,
 *  sonst entstehen Screenshots mit leeren Bildflaechen. */
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight / 2));
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise((r) => requestAnimationFrame(r));
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(
    () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
    null,
    { timeout: 25000 },
  );
}
async function dismissConsent(page) {
  const reject = page.getByRole("button", { name: /Nur notwendige/i });
  if (await reject.count()) {
    await reject.click().catch(() => {});
  }
}
/** Vollseiten-Belege: viewport-fixierte Mobile-Chrome (Action-Bar und floating
 *  "Cookie-Einstellungen", komponenten §10.3) wird von Chromium mitten ins
 *  gestitchte Bild gesetzt (fixe Elemente liegen auf Viewport-Hoehe). Fuer die
 *  Design-Belege ausblenden und die echte Position separat als Viewport-
 *  Screenshot zeigen (`mobile-chrome-360.png`). Nur fuer Screenshots, nie fuer
 *  Messungen (A11y/Overflow/Touch). */
async function hideFixedChrome(page) {
  await page.addStyleTag({
    content: ".pf-action-bar{display:none !important} #pf-consent-floating{display:none !important}",
  });
}

/** Screenshot-Beleg schreiben. JPEG (q82) haelt die vollstaendige Belegdecke
 *  (13 Seiten x 3 Breiten + Problem-/Zustandsbelege) klein; die massgeblichen
 *  Messwerte stehen in den JSON-Belegen, nicht im Bildformat. */
async function shot(page, name, fullPage = true) {
  const file = join(SCR, `${name}.jpg`);
  await page.screenshot({ path: file, type: "jpeg", quality: 82, fullPage });
  return file;
}

// ---------------------------------------------------------------- light-pflicht
async function light() {
  const browser = await chromium.launch();
  const out = {};
  const darkScreens = [];
  for (const [label, path] of [["start", "/"], ["leistungen", "/leistungen/"], ["kontakt", "/kontakt/"], ["bewertungen", "/bewertungen/"], ["impressum", "/impressum/"]]) {
    const rec = {};
    for (const scheme of ["dark", "light"]) {
      const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1440, height: 900 }, colorScheme: scheme });
      const page = await ctx.newPage();
      await page.goto(path, { waitUntil: "load" });
      await dismissConsent(page);
      await settle(page);
      await hideFixedChrome(page);
      const file = await shot(page, `light-${label}-${scheme}-1440`);
      if (label === "start") darkScreens.push(file);
      rec[scheme] = await page.evaluate(() => ({
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
        colorScheme: getComputedStyle(document.documentElement).colorScheme,
        dataTheme: document.documentElement.getAttribute("data-theme"),
      }));
      await ctx.close();
    }
    out[label] = { ...rec, identical: rec.dark.bodyBackground === rec.light.bodyBackground };
    ok(
      `Light-Pflicht  ${path}: dark-OS rendert hell (body != #15120D)`,
      rec.dark.bodyBackground !== "rgb(21, 18, 13)" && rec.dark.bodyBackground === "rgb(251, 250, 246)",
      `dark=${rec.dark.bodyBackground} light=${rec.light.bodyBackground}`,
    );
  }
  out._screens = darkScreens;
  save("light-pflicht.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- axe (WCAG 2.2 AA)
async function axe() {
  const browser = await chromium.launch();
  const out = [];
  const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"];
  for (const [label, path] of PAGES) {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
    await page.goto(path, { waitUntil: "load" });
    const res = await new AxeBuilder({ page }).withTags(tags).analyze();
    const violations = res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      tags: v.tags.filter((t) => t.startsWith("wcag")),
      nodes: v.nodes.map((n) => n.target.join(" ")),
    }));
    const seriousCritical = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const record = {
      label,
      path,
      axeVersion: res.testEngine?.version ?? "unknown",
      violations,
      seriousCritical: seriousCritical.length,
      h1: await page.locator("h1").count(),
      landmarks: {
        header: await page.locator("header").count(),
        main: await page.locator("main#hauptinhalt").count(),
        footer: await page.locator("footer").count(),
      },
      lang: await page.getAttribute("html", "lang"),
      consoleErrors,
    };
    out.push(record);
    ok(`axe WCAG 2.2 AA ohne serious/critical  ${path}`, seriousCritical.length === 0, `${violations.length} Verstoss/Verstoesse`);
    if (label !== "404") ok(`genau ein h1  ${path}`, record.h1 === 1, `h1=${record.h1}`);
    ok(
      `Landmarks  ${path}`,
      record.landmarks.main === 1 && record.landmarks.header === 1 && record.landmarks.footer === 1,
      JSON.stringify(record.landmarks),
    );
    ok(`lang=de  ${path}`, record.lang === "de", `lang=${record.lang}`);
    await ctx.close();
  }
  save("axe.json", { tags, results: out });
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- interaction
async function interaction() {
  const browser = await chromium.launch();
  const out = {};

  // Touch-Targets >= 44px (Projekt-Gate komponenten.md §0.4/§14.3) und >= 24px (WCAG 2.2 2.5.8)
  {
    const ctx = await browser.newContext({ baseURL: BASE, ...devices["Pixel 5"] });
    const page = await ctx.newPage();
    const scan = async (path) => {
      await page.goto(path, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready);
      return page.evaluate(() => {
        const els = Array.from(document.querySelectorAll("a[href], button, input:not([type=hidden]), select, textarea"));
        const under44 = [];
        const under24 = [];
        for (const el of els) {
          if (el.closest("[data-consent-dialog]")) continue;
          if (el.closest('[aria-hidden="true"]')) continue;
          if (el.closest(".pf-honeypot")) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") continue;
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          const label = (el.textContent || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 40);
          const inlineInText =
            el.tagName === "A" &&
            el.parentElement !== null &&
            /^(P|LI|SPAN|LABEL|EM|STRONG|SMALL)$/.test(el.parentElement.tagName) &&
            (el.parentElement.textContent || "").trim().length > (el.textContent || "").trim().length + 8;
          const item = { tag: el.tagName, id: el.id, cls: String(el.className), label, w: Math.round(r.width), h: Math.round(r.height), inlineInText };
          if (r.height < 44 || r.width < 44) under44.push(item);
          if ((r.height < 24 || r.width < 24) && !inlineInText) under24.push(item);
        }
        return { under44, under24 };
      });
    };
    const scanPages = ["/", "/leistungen/", "/kontakt/", "/bewertungen/"];
    const under44All = {};
    const under24All = {};
    for (const p of scanPages) {
      const r = await scan(p);
      under44All[p] = r.under44;
      under24All[p] = r.under24;
    }
    out.touch = { under44All, under24All };
    const count44 = Object.values(under44All).flat().length;
    const count24 = Object.values(under24All).flat().length;
    ok("Touch-Targets >= 44px (Projekt-Gate)", count44 === 0, `${count44}: ${JSON.stringify(Object.values(under44All).flat().slice(0, 6))}`);
    ok("Touch-Targets >= 24px (WCAG 2.2 AA 2.5.8)", count24 === 0, `${count24}: ${JSON.stringify(Object.values(under24All).flat().slice(0, 6))}`);
    await ctx.close();
  }

  // Sichtbarer Fokus: Tastatur-Durchlauf, Fokusindikator am aktiven Element gemessen.
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "load" });
    const seen = [];
    let invisible = 0;
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const rec = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const outlineWidth = parseFloat(cs.outlineWidth) || 0;
        const hasOutline = cs.outlineStyle !== "none" && outlineWidth > 0;
        const hasShadow = cs.boxShadow !== "none" && cs.boxShadow !== "";
        return {
          tag: el.tagName,
          label: (el.textContent || el.getAttribute("aria-label") || el.getAttribute("href") || "").trim().replace(/\s+/g, " ").slice(0, 30),
          outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
          boxShadow: hasShadow,
          visibleIndicator: hasOutline || hasShadow,
        };
      });
      if (!rec) continue;
      if (!rec.visibleIndicator) invisible++;
      seen.push(rec);
    }
    out.focus = { steps: seen.length, invisibleIndicators: invisible, samples: seen.slice(0, 6) };
    ok("Sichtbarer Fokus bei 30 Tab-Schritten", seen.length >= 10 && invisible === 0, `${seen.length} Schritte, ${invisible} ohne Indikator`);
    await ctx.close();
  }

  // prefers-reduced-motion: Dauer-Token -> 1ms
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "load" });
    const dur = await page.evaluate(() => {
      const btn = document.querySelector(".pf-btn--primary");
      return {
        durationToken: getComputedStyle(document.documentElement).getPropertyValue("--pf-duration-fast").trim(),
        btnTransition: btn ? getComputedStyle(btn).transitionDuration : null,
      };
    });
    out.reducedMotion = dur;
    ok("prefers-reduced-motion: --pf-duration-fast = 1ms", dur.durationToken === "1ms", dur.durationToken);
    await ctx.close();
  }

  save("interaction.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- responsive
async function responsive() {
  const browser = await chromium.launch();
  const out = [];
  const widths = [360, 768, 1440];
  const pages = ["/", "/leistungen/", "/leistungen/fugenlose-bäder/", "/kontakt/", "/bewertungen/", "/über-uns/", "/impressum/", "/datenschutzerklaerung/"];
  for (const w of widths) {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    for (const path of pages) {
      await page.goto(path, { waitUntil: "load" });
      await dismissConsent(page);
      const m = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        bodyScrollW: document.body.scrollWidth,
      }));
      const overflow = m.scrollW > m.clientW + 1;
      out.push({ path, width: w, ...m, overflow });
      ok(`Kein horizontaler Overflow  ${path} @${w}px`, !overflow, `scrollW=${m.scrollW} clientW=${m.clientW}`);
    }
    await ctx.close();
  }
  // Screens: ALLE Inhaltsseiten bei 360/768/1440 (gerendert + angesehen) —
  // vollstaendige Belegdecke statt nur Kernseiten.
  const scr = [];
  for (const w of widths) {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    for (const [label, path] of PAGES) {
      await page.goto(path, { waitUntil: "load" });
      await dismissConsent(page);
      await settle(page);
      await hideFixedChrome(page);
      scr.push(await shot(page, `${label}-${w}`));
    }
    await ctx.close();
  }
  // Echte Position der fixen Mobile-Chrome (in der Vollseite nicht darstellbar).
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 360, height: 720 } });
    const page = await ctx.newPage();
    await page.goto("/kontakt/#formular", { waitUntil: "load" });
    await dismissConsent(page);
    scr.push(await shot(page, "mobile-chrome-360", false));
    await ctx.close();
  }
  save("responsive.json", { overflow: out, screens: scr });
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- consent
async function consent() {
  const browser = await chromium.launch();
  const out = {};

  // 1) Frischer Zustand: 0 Dritt-Requests, 0 Cookies, 0 Consent-Key
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const requests = [];
    ctx.on("request", (r) => requests.push(r.url()));
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "load" });
    await page.goto("/bewertungen/", { waitUntil: "load" });
    const cookies = await ctx.cookies();
    const ls = await page.evaluate(() => Object.keys(localStorage));
    const thirdParty = requests.filter((u) => {
      try {
        const h = new URL(u).host;
        return h !== "127.0.0.1:4321" && h !== "localhost:4321";
      } catch {
        return false;
      }
    });
    out.fresh = { thirdParty, cookies: cookies.map((c) => c.name), localStorage: ls, totalRequests: requests.length };
    ok("Consent: 0 Dritt-Requests vor Einwilligung", thirdParty.length === 0, thirdParty.slice(0, 6).join(" | "));
    ok("Consent: keine Cookies vor Einwilligung", cookies.length === 0, cookies.map((c) => c.name).join(","));
    ok("Consent: kein Consent-Key vor Einwilligung", !ls.includes("pixelforge.consent.v1"), ls.join(","));
    await ctx.close();
  }

  // 2) Banner sichtbar + Aktionen; Ablehnen in 1 Klick; Ablehnen gleichwertig prominent
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "load" });
    const measure = async (name) => {
      const el = page.getByRole("button", { name });
      const box = await el.boundingBox();
      const style = await el.evaluate((e) => {
        const cs = getComputedStyle(e);
        return { fontSize: cs.fontSize, minHeight: cs.minHeight, padding: cs.padding };
      });
      return { box, style };
    };
    const bannerVisible = await page.locator("#pf-consent-banner").isVisible();
    const reject = await measure(/Nur notwendige/i);
    const accept = await measure(/Alle akzeptieren/i);
    out.banner = { bannerVisible, reject, accept };
    ok("Consent: Banner beim Erstbesuch sichtbar", bannerVisible);
    ok("Consent: Ablehnen >= 44px hoch", reject.box.height >= 44, `${reject.box.height}`);
    ok(
      "Consent: Ablehnen gleichwertig gross/Prominenz wie Akzeptieren",
      Math.abs(reject.box.width - accept.box.width) <= 1 && Math.abs(reject.box.height - accept.box.height) <= 1 && reject.style.fontSize === accept.style.fontSize,
      `reject ${reject.box.width}x${reject.box.height} / accept ${accept.box.width}x${accept.box.height}`,
    );
    // 1 Klick -> Banner weg, Zustand gespeichert, keine Dritt-Requests
    await page.getByRole("button", { name: /Nur notwendige/i }).click();
    const bannerGone = await page.locator("#pf-consent-banner").count();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem("pixelforge.consent.v1") || "null"));
    ok("Consent: Ablehnen in 1 Klick (Banner entfernt, Zustand gespeichert)", bannerGone === 0 && record?.entscheidung === "abgelehnt", JSON.stringify(record));
    await ctx.close();
  }

  // 3) Persistenz ueber Reload und Seitenwechsel
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: /Nur notwendige/i }).click();
    await page.reload();
    const afterReload = { banner: (await page.locator("#pf-consent-banner").isVisible()) ? 1 : 0, state: await page.getAttribute("html", "data-pf-consent") };
    await page.goto("/kontakt/");
    const afterNav = { banner: (await page.locator("#pf-consent-banner").isVisible()) ? 1 : 0, state: await page.getAttribute("html", "data-pf-consent") };
    out.persistence = { afterReload, afterNav };
    ok("Consent: Zustand uebersteht Reload und Seitenwechsel", afterReload.banner === 0 && afterNav.banner === 0, JSON.stringify(out.persistence));
    await ctx.close();
  }

  // 4) Optionale Kategorien nicht vorausgewaehlt
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.locator('#pf-consent-banner [data-consent-action="open-settings"]').click();
    const stat = await page.locator('input[data-consent-category="statistik"]').isChecked();
    const ext = await page.locator('input[data-consent-category="externe_medien"]').isChecked();
    out.toggles = { stat, ext };
    ok("Consent: optionale Kategorien nicht vorausgewaehlt", stat === false && ext === false, `stat=${stat} ext=${ext}`);
    await ctx.close();
  }

  // 5) Widerruf ueber Footer-Link: vorhanden+sichtbar, stoppt aktive Gates
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: /Alle akzeptieren/i }).click();
    const footerBtn = page.locator("footer").getByRole("button", { name: /Cookie-Einstellungen/i });
    const footerVisible = await footerBtn.count();
    await footerBtn.scrollIntoViewIfNeeded();
    await footerBtn.click();
    const stat = page.locator('input[data-consent-category="statistik"]');
    const ext = page.locator('input[data-consent-category="externe_medien"]');
    if (await stat.isChecked()) await stat.uncheck();
    if (await ext.isChecked()) await ext.uncheck();
    await page.getByRole("button", { name: /Auswahl speichern/i }).click();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem("pixelforge.consent.v1") || "null"));
    const gateSlotsActive = await page.locator('[data-consent-slot][data-consent-active="true"]').count();
    out.revoke = { footerVisible, record, gateSlotsActive };
    ok("Consent: Footer-Link 'Cookie-Einstellungen' vorhanden", footerVisible === 1);
    ok("Consent: Widerruf setzt Kategorien zurueck und stoppt aktive Gates", record?.kategorien?.statistik === false && record?.kategorien?.externe_medien === false && gateSlotsActive === 0, JSON.stringify(out.revoke));
    await ctx.close();
  }

  // 6) Policy-Version-Wechsel laesst den Banner wiederkommen
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "pixelforge.consent.v1",
        JSON.stringify({ version: 2, entscheidung: "akzeptiert", kategorien: { essenziell: true, statistik: true, externe_medien: true }, zeitstempel: new Date().toISOString(), methode: "banner-alle", textfassung: "x" }),
      );
    });
    await page.reload();
    const banner = await page.locator("#pf-consent-banner").isVisible();
    out.versionChange = { banner };
    ok("Consent: Policy-Versionswechsel -> Banner kommt wieder", banner);
    await ctx.close();
  }

  save("consent.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- contact
async function contact() {
  const browser = await chromium.launch();
  const out = {};
  const fill = async (page) => {
    await page.fill("#contact-name", "QA Abnahme");
    await page.fill("#contact-email", "qa@example.com");
    await page.fill("#contact-nachricht", "Automatischer QA-Test der Abnahme MARAA-19. Bitte ignorieren.");
    await page.check("#contact-einwilligung");
    await page.evaluate(() => {
      const ts = document.querySelector("[data-contact-ts]");
      if (ts) ts.value = String(Date.now() - 5000);
    });
  };

  // 1) Fehlerfall (echter Server): leeres Absenden -> Zusammenfassung + aria-invalid, Eingaben bleiben
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/kontakt/#formular");
    await page.fill("#contact-name", "Behalten");
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    await page.locator("[data-contact-summary]").waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    const summaryVisible = await page.locator("[data-contact-summary]").isVisible();
    const summaryText = (await page.locator("[data-contact-summary]").innerText().catch(() => "")).replace(/\s+/g, " ");
    const emailInvalid = await page.locator("#contact-email").getAttribute("aria-invalid");
    const nameKept = await page.inputValue("#contact-name");
    out.error = { summaryVisible, summaryText, emailInvalid, nameKept };
    ok("Kontakt: Fehlerfall zeigt Meldung (nicht leerer Screen)", summaryVisible && /Prüfen|Fehler|Pflicht/i.test(summaryText), summaryText.slice(0, 120));
    ok("Kontakt: Fehler markiert Feld (aria-invalid) und behaelt Eingaben", emailInvalid === "true" && nameKept === "Behalten", `aria-invalid=${emailInvalid} name=${nameKept}`);
    await ctx.close();
  }

  // 2) Ladezustand sichtbar (verzoegert aufgeloeste Antwort)
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.route("**/api/contact", async (route) => {
      await sleep(800);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, messageId: "qa" }) });
    });
    await page.goto("/kontakt/#formular");
    await fill(page);
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    const busy = await page.locator("[data-contact-submit]").getAttribute("aria-busy");
    const disabled = await page.locator("[data-contact-submit]").isDisabled();
    out.loading = { busy, disabled };
    ok("Kontakt: Ladezustand sichtbar (aria-busy + disabled)", busy === "true" && disabled, JSON.stringify(out.loading));
    await page.getByRole("status").waitFor({ timeout: 15000 });
    const statusGone = await page.locator("[data-contact-submit]").count();
    ok("Kontakt: Erfolg ersetzt das Formular (Submit-Button weg)", statusGone === 0);
    await ctx.close();
  }

  // 3) Erfolgszustand (gemockt 200) -> role=status "Anfrage gesendet"
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, messageId: "qa" }) }));
    await page.goto("/kontakt/#formular");
    await fill(page);
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    const statusText = (await page.getByRole("status").innerText()).replace(/\s+/g, " ");
    out.success = { statusText };
    ok("Kontakt: Erfolgszustand zeigt 'Anfrage gesendet'", /Anfrage gesendet/i.test(statusText), statusText.slice(0, 120));
    await ctx.close();
  }

  // 4) Rate-Limit (gemockt 429) -> Wartezeit-Hinweis
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.route("**/api/contact", (route) => route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ ok: false, error: "rate_limited", retryAfterSeconds: 600 }) }));
    await page.goto("/kontakt/#formular");
    await fill(page);
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    await page.locator("[data-contact-summary]").waitFor({ state: "visible", timeout: 15000 }).catch(() => {});
    const summaryText = (await page.locator("[data-contact-summary]").innerText()).replace(/\s+/g, " ");
    out.rateLimitedMocked = { summaryText };
    ok("Kontakt: Rate-Limit zeigt Meldung mit Wartezeit/Telefonweg", /mehrere Anfragen|Telefon|Minuten|Sekunden/i.test(summaryText), summaryText.slice(0, 120));
    await ctx.close();
  }

  // 5) Erfolgszustand am ECHTEN Server (kein SMTP -> mailto-Weg, status sichtbar)
  {
    const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/kontakt/#formular");
    await fill(page);
    await page.getByRole("button", { name: /Anfrage senden/i }).click();
    const status = page.locator(".pf-form__status");
    await status.waitFor({ timeout: 15000 }).catch(() => {});
    const statusText = (await status.innerText().catch(() => "")).replace(/\s+/g, " ");
    const formGone = (await page.locator("[data-contact-form]").count()) === 0;
    out.successReal = { statusText, formGone };
    ok("Kontakt: echter Submit fuehrt zu Ergebnis (mailto-Erfolg, kein leerer Screen)", formGone, statusText.slice(0, 120));
    await ctx.close();
  }

  save("contact.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- drawer / header
async function drawer() {
  const browser = await chromium.launch();
  const out = {};
  const ctx = await browser.newContext({ baseURL: BASE, ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "load" });
  await dismissConsent(page);
  const btn = page.locator("[data-nav-open]");
  await btn.click();
  const open = await page.locator("[data-nav-drawer]").isVisible();
  const expandedOpen = await btn.getAttribute("aria-expanded");
  const escapeSeen = await page.evaluate(() => !!document.activeElement?.closest("[data-nav-drawer]"));
  await page.keyboard.press("Escape");
  const closed = await page.locator("[data-nav-drawer]").isHidden();
  const expandedClosed = await btn.getAttribute("aria-expanded");
  const focusReturned = await page.evaluate(() => document.activeElement?.hasAttribute("data-nav-open"));
  out.drawer = { open, expandedOpen, escapeSeen, closed, expandedClosed, focusReturned };
  ok("Header/Drawer: Drawer oeffnet und aria-expanded=true", open && expandedOpen === "true");
  ok("Header/Drawer: Fokus geht in den Drawer", escapeSeen);
  ok("Header/Drawer: Escape schliesst und gibt Fokus zurueck", closed && expandedClosed === "false" && focusReturned, JSON.stringify(out.drawer));
  await ctx.close();

  // Desktop: Hauptnavigation sichtbar, kein Drawer
  {
    const ctx2 = await browser.newContext({ baseURL: BASE, viewport: { width: 1440, height: 900 } });
    const page2 = await ctx2.newPage();
    await page2.goto("/", { waitUntil: "load" });
    await dismissConsent(page2);
    out.desktopNav = { navVisible: await page2.locator("header nav[aria-label='Hauptnavigation']").first().isVisible() };
    ok("Header: Desktop-Hauptnavigation sichtbar", out.desktopNav.navVisible);
    await ctx2.close();
  }
  save("drawer.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- reviews
async function reviews() {
  const browser = await chromium.launch();
  const out = {};
  const filled = process.env.MARA19_REVIEWS_FILLED === "1";
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  if (!filled) {
    await page.goto("/bewertungen/", { waitUntil: "load" });
    const empty = {
      listCount: await page.locator(".pf-reviews__list").count(),
      reviewCount: await page.locator(".pf-review").count(),
      starCount: await page.locator(".pf-review__stars").count(),
      emptyBox: await page.locator(".pf-empty").count(),
      ctaGoogle: await page.getByRole("link", { name: /Jetzt bei Google bewerten/i }).count(),
      bodyText: (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 400),
    };
    out.empty = empty;
    ok("Bewertungen: Leerzustand ohne erfundene Bewertungen (0 Karten, 0 Sterne)", empty.reviewCount === 0 && empty.starCount === 0, `reviews=${empty.reviewCount} stars=${empty.starCount}`);
    ok("Bewertungen: Leerzustand ehrlicher Hinweis + Google-CTA", /Bewertungen|Google/i.test(empty.bodyText) && empty.ctaGoogle >= 1, empty.bodyText.slice(0, 100));
    await ctx.close();
    save("reviews.json", out);
    await browser.close();
    return out;
  }

  // Fixture-Build: Inhalt-Zustand (Bewertungs-Grid) als Karten-Grid
  const rec = {};
  for (const w of [360, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.goto("/bewertungen/", { waitUntil: "load" });
    await dismissConsent(page);
    rec[w] = await page.evaluate(() => {
      const list = document.querySelector(".pf-reviews__list");
      const firstCard = document.querySelector(".pf-review");
      return {
        reviewCount: document.querySelectorAll(".pf-review").length,
        gridTemplateColumns: list ? getComputedStyle(list).gridTemplateColumns : null,
        starCount: document.querySelectorAll(".pf-review__stars").length,
        attribution: document.querySelectorAll(".pf-attribution").length,
        cardRadius: firstCard ? getComputedStyle(firstCard).borderRadius : null,
        cardShadow: firstCard ? getComputedStyle(firstCard).boxShadow : null,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      };
    });
    await hideFixedChrome(page);
    await shot(page, `bewertungen-filled-${w}`);
  }
  out.filled = rec;
  ok(
    "Bewertungen: Inhalt-Zustand rendert Bewertungskarten als Karten-Grid (1/2/3 Spalten)",
    rec[1440].reviewCount > 0 &&
      rec[360].gridTemplateColumns.split(" ").length === 1 &&
      rec[768].gridTemplateColumns.split(" ").length === 2 &&
      rec[1440].gridTemplateColumns.split(" ").length === 3 &&
      rec[1440].cardRadius === "16px",
    `1440: ${rec[1440].reviewCount} Karten, ${rec[1440].gridTemplateColumns.split(" ").length} Spalten`,
  );
  ok("Bewertungen: Inhalt-Zustand ohne horizontalen Overflow (360/768/1440)", !rec[360].overflow && !rec[768].overflow && !rec[1440].overflow);
  await ctx.close();
  save("reviews-filled.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- briefing-abgleich (gemessen)
async function briefing() {
  const browser = await chromium.launch();
  const out = {};
  const ctx = await browser.newContext({ baseURL: BASE, viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/", { waitUntil: "load" });
  await dismissConsent(page);
  const start = await page.evaluate(() => {
    const card = document.querySelector(".pf-card");
    const hero = document.querySelector(".pf-hero__media");
    const heroBody = document.querySelector(".pf-hero__body");
    const grid = document.querySelector(".pf-grid--services");
    const h1 = document.querySelector("h1");
    const body = document.body;
    const cards = Array.from(document.querySelectorAll(".pf-grid--services > .pf-card"));
    const r = (el) => (el ? el.getBoundingClientRect() : null);
    return {
      bodyBackground: getComputedStyle(body).backgroundColor,
      bodyFont: getComputedStyle(body).fontFamily,
      h1Font: h1 ? getComputedStyle(h1).fontFamily : null,
      cardBackground: card ? getComputedStyle(card).backgroundColor : null,
      cardRadius: card ? getComputedStyle(card).borderRadius : null,
      cardShadow: card ? getComputedStyle(card).boxShadow : null,
      heroRadius: hero ? getComputedStyle(hero).borderRadius : null,
      heroShadow: hero ? getComputedStyle(hero).boxShadow : null,
      heroBody: r(heroBody),
      heroMedia: r(hero),
      servicesGrid: grid ? getComputedStyle(grid).gridTemplateColumns : null,
      cardWidths: cards.map((c) => Math.round(r(c).width)),
      fontFaces: Array.from(document.fonts).map((f) => f.family).filter((v, i, a) => a.indexOf(v) === i),
    };
  });
  out.start = start;
  ok("Briefing Mode: Seite rendert hell (body = neutral.50)", start.bodyBackground === "rgb(251, 250, 246)", start.bodyBackground);
  ok("Briefing Karten: Flaeche neutral.0, Radius 16px, genau ein Kartenschatten", start.cardBackground === "rgb(255, 255, 255)" && start.cardRadius === "16px" && /rgb/.test(start.cardShadow), `bg=${start.cardBackground} radius=${start.cardRadius}`);
  ok("Briefing Hero: Bild rechts (media.x > body.x)", start.heroMedia && start.heroBody && start.heroMedia.x > start.heroBody.x, `media.x=${start.heroMedia?.x} body.x=${start.heroBody?.x}`);
  ok("Briefing Typo: nur Instrument Sans (kein Fraunces)", /Instrument Sans/.test(start.bodyFont) && /Instrument Sans/.test(start.h1Font) && !start.fontFaces.some((f) => /Fraunces/i.test(f)), `faces=${start.fontFaces.join(",")}`);
  ok("Briefing Bento: asymmetrisches 12-Spalten-Raster, Karte 1 breiter als 2–4", start.servicesGrid && start.cardWidths.length === 4 && start.cardWidths[0] > start.cardWidths[1], `grid=${start.servicesGrid} widths=${start.cardWidths.join(",")}`);

  // Kontakt: Formular als Karte neben Kontaktwegen (ab md)
  await page.goto("/kontakt/", { waitUntil: "load" });
  await dismissConsent(page);
  const kontakt = await page.evaluate(() => {
    const form = document.querySelector(".pf-form");
    const grid = document.querySelector(".pf-contact-grid");
    const ways = document.querySelector(".pf-contact-ways");
    const rf = form ? form.getBoundingClientRect() : null;
    const rw = ways ? ways.getBoundingClientRect() : null;
    const input = document.querySelector(".pf-input");
    return {
      formRadius: form ? getComputedStyle(form).borderRadius : null,
      formShadow: form ? getComputedStyle(form).boxShadow : null,
      inputRadius: input ? getComputedStyle(input).borderRadius : null,
      gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : null,
      formX: rf?.x ?? null,
      waysX: rw?.x ?? null,
      formCard: rf ? { w: Math.round(rf.width), h: Math.round(rf.height) } : null,
    };
  });
  out.kontakt = kontakt;
  ok("Briefing Formular: Formular als Karte (Radius 16px, Schatten)", kontakt.formRadius === "16px" && /rgb/.test(kontakt.formShadow), `radius=${kontakt.formRadius}`);
  ok("Briefing Formular: Eingaben Radius 12px", kontakt.inputRadius === "12px", kontakt.inputRadius);
  ok("Briefing Formular: Formular neben Kontaktwegen (ab md zweispaltig)", kontakt.gridColumns && kontakt.formX > kontakt.waysX, `cols=${kontakt.gridColumns} waysX=${kontakt.waysX} formX=${kontakt.formX}`);

  // Footer: 3-Spalten ab md, dunkel
  const footer = await page.evaluate(() => {
    const f = document.querySelector("footer.pf-footer");
    const g = document.querySelector(".pf-footer__grid");
    return { bg: f ? getComputedStyle(f).backgroundColor : null, columns: g ? getComputedStyle(g).gridTemplateColumns : null };
  });
  out.footer = footer;
  ok("Briefing Footer: 3-Spalten-Layout ab md", footer.columns && footer.columns.split(" ").length >= 3, footer.columns);

  save("briefing.json", out);
  await browser.close();
  return out;
}

const sections = { light, axe, interaction, responsive, consent, contact, drawer, reviews, briefing };
async function run() {
  const list = section === "all" ? Object.keys(sections) : [section];
  if (list.some((s) => !sections[s])) {
    console.error("Unbekannte Section:", section, "— erlaubt:", Object.keys(sections).join(", "), "| all");
    process.exit(2);
  }
  for (const s of list) {
    console.log(`\n===== ${s} =====`);
    await sections[s]();
  }
  save("results.json", results);
  console.log(`\n== MARAA-19 ${section}: ${failures} Fehlschlag(e) ==`);
  process.exit(0);
}
await run();
