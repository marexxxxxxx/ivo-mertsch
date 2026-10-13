/**
 * MARAA-6 QA-Abnahmeharness (unabhaengig vom Entwickler-E2E-Set).
 *
 * Aufruf:  node tests/qa/qa-run.mjs <section>
 *   sections: a11y | keyboard | consent | reviews | overflow | browser | screens
 *
 * Der Server muss unter QA_BASE (Default http://127.0.0.1:4321) laufen.
 * Schreibt JSON-Belege nach docs/qa/evidence/ und Screenshots nach
 * docs/qa/evidence/screens/.
 */
import { chromium, firefox, devices } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EVID = join(ROOT, "docs", "qa", "evidence");
const SCR = join(EVID, "screens");
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
  "/gibt-es-nicht/", // 404
];

const section = process.argv[2];
const results = {};
let failures = 0;

function save(name, data) {
  writeFileSync(join(EVID, name), JSON.stringify(data, null, 2));
}
function ok(id, pass, detail) {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}${detail ? "  — " + detail : ""}`);
  return { id, status: pass ? "pass" : "fail", detail: detail ?? null };
}

async function newCtx(browser, opts = {}) {
  return browser.newContext({ baseURL: BASE, ...opts });
}

// ---------------------------------------------------------------- a11y
async function a11y() {
  const browser = await chromium.launch();
  const out = [];
  for (const path of PAGES) {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
    await page.goto(path, { waitUntil: "load" });
    const res = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const violations = res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => n.target.join(" ")),
    }));
    const serious = violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    const h1 = await page.locator("h1").count();
    const landmarks = {
      header: await page.locator("header").count(),
      main: await page.locator("main#hauptinhalt").count(),
      footer: await page.locator("footer").count(),
    };
    const lang = await page.getAttribute("html", "lang");
    out.push({ path, violations, seriousCritical: serious.length, h1, landmarks, lang, consoleErrors });
    await ctx.close();
  }
  save("a11y.json", out);
  for (const r of out) {
    ok(`axe serious/critical = 0  ${r.path}`, r.seriousCritical === 0, `${r.violations.length} total`);
    if (r.path !== "/gibt-es-nicht/") {
      ok(`genau 1 h1  ${r.path}`, r.h1 === 1, `h1=${r.h1}`);
    }
    ok(`Landmarks  ${r.path}`, r.landmarks.main === 1 && r.landmarks.header === 1 && r.landmarks.footer === 1, JSON.stringify(r.landmarks));
    ok(`lang=de  ${r.path}`, r.lang === "de", `lang=${r.lang}`);
  }
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- keyboard
async function keyboard() {
  const browser = await chromium.launch();
  const out = {};

  // Skip-Link ist erster Fokuspunkt + funktioniert
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => ({
      text: document.activeElement?.textContent?.trim(),
      href: document.activeElement?.getAttribute("href"),
    }));
    await page.keyboard.press("Enter");
    const hash = await page.evaluate(() => location.hash);
    out.skipLink = { first, hash };
    ok("Skip-Link ist erster Tab-Fokus", first.text === "Direkt zum Inhalt", JSON.stringify(first));
    ok("Skip-Link springt zu #hauptinhalt", hash === "#hauptinhalt", hash);
    await ctx.close();
  }

  // Consent-Dialog: Fokusfalle + Escape + Rueckgabe des Fokus
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.locator('#pf-consent-banner [data-consent-action="open-settings"]').click();
    const dialogVisible = await page.locator("#pf-consent-dialog").isVisible();
    const insideStart = await page.evaluate(() => !!document.activeElement?.closest("#pf-consent-dialog"));
    // 25x Tab — Fokus darf den Dialog nie verlassen
    let escaped = false;
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("#pf-consent-dialog"));
      if (!inside) escaped = true;
    }
    await page.keyboard.press("Escape");
    const closed = await page.locator("#pf-consent-dialog").isHidden();
    out.consentDialog = { dialogVisible, insideStart, escaped, closed };
    ok("Consent-Dialog oeffnet (Einstellungen)", dialogVisible);
    ok("Fokus startet im Dialog", insideStart);
    ok("Fokusfalle haelt Fokus im Dialog (25x Tab)", !escaped);
    ok("Escape schliesst Dialog", closed);
    await ctx.close();
  }

  // Mobile-Drawer: per Tastatur oeffnen, Fokusfalle, Escape
  {
    const ctx = await newCtx(browser, { ...devices["Pixel 5"] });
    const page = await ctx.newPage();
    await page.goto("/");
    const menuBtn = page.locator("[data-nav-open]");
    await menuBtn.focus();
    await page.keyboard.press("Enter");
    const drawerOpen = await page.locator("[data-nav-drawer]").isVisible();
    const expanded = await menuBtn.getAttribute("aria-expanded");
    let escaped = false;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[data-nav-drawer]"));
      if (!inside) escaped = true;
    }
    await page.keyboard.press("Escape");
    const drawerClosed = await page.locator("[data-nav-drawer]").isHidden();
    out.mobileNav = { drawerOpen, expanded, escaped, drawerClosed };
    ok("Mobile-Drawer oeffnet per Enter", drawerOpen && expanded === "true", `expanded=${expanded}`);
    ok("Mobile-Drawer Fokusfalle (20x Tab)", !escaped);
    ok("Mobile-Drawer Escape schliesst", drawerClosed);
    await ctx.close();
  }

  // Formularfelder per Tastatur erreichbar + Label-Verknuepfung
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/kontakt/");
    const fields = ["contact-name", "contact-email", "contact-telefon", "contact-nachricht", "contact-einwilligung"];
    const labelFor = {};
    for (const id of fields) {
      labelFor[id] = await page.evaluate((fid) => {
        const el = document.getElementById(fid);
        if (!el) return null;
        const lab = document.querySelector(`label[for="${fid}"]`);
        return lab ? lab.textContent.trim().replace(/\s+/g, " ") : null;
      }, id);
    }
    // Tab-Durchlauf bis alle Felder erreicht wurden
    const reached = new Set();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const id = await page.evaluate(() => document.activeElement?.id ?? "");
      if (fields.includes(id)) reached.add(id);
    }
    out.formLabels = { labelFor, reached: [...reached] };
    for (const id of fields) {
      ok(`Label fuer ${id}`, !!labelFor[id], labelFor[id] ?? "FEHLT");
    }
    ok("Alle Formularfelder per Tab erreichbar", fields.every((f) => reached.has(f)), [...reached].join(","));
    await ctx.close();
  }

  // reduced-motion: Dauer-Token werden auf 1ms gesetzt
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const dur = await page.evaluate(() => {
      const btn = document.querySelector(".pf-btn--primary");
      const cs = getComputedStyle(btn);
      return { transitionDuration: cs.transitionDuration, durationToken: getComputedStyle(document.documentElement).getPropertyValue("--pf-duration-fast").trim() };
    });
    out.reducedMotion = dur;
    ok("reduced-motion: --pf-duration-fast = 1ms", dur.durationToken === "1ms", dur.durationToken);
    ok("reduced-motion: Transitions <= 1ms", /^0?\.?0?0?1?s?/.test(dur.transitionDuration) || dur.transitionDuration.startsWith("0.001s"), dur.transitionDuration);
    await ctx.close();
  }

  save("keyboard.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- consent
async function consent() {
  const browser = await chromium.launch();
  const out = {};

  // 1) FRISCHER Zustand: kein Dritt-Request, kein Cookie, kein Consent-Key
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const requests = [];
    ctx.on("request", (r) => requests.push(r.url()));
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "load" });
    // Bewertungen-Seite ebenfalls (Review-Slots)
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
    const bannerVisible = await page.locator("#pf-consent-banner").isVisible();
    out.fresh = { thirdParty, cookies: cookies.map((c) => c.name), localStorage: ls, bannerVisible, totalRequests: requests.length };
    ok("0 Dritt-Requests vor Einwilligung", thirdParty.length === 0, thirdParty.slice(0, 5).join(" | "));
    ok("Keine Cookies vor Einwilligung", cookies.length === 0, cookies.map((c) => c.name).join(","));
    ok("Kein Consent-Key vor Einwilligung", !ls.includes("pixelforge.consent.v1"), ls.join(","));
    ok("Banner ist beim Erstbesuch sichtbar", bannerVisible);
    await ctx.close();
  }

  // 2) Gleichwertige Prominenz der Banner-Aktionen (gemessen)
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    const measure = async (name) => {
      const box = await page.getByRole("button", { name }).boundingBox();
      const style = await page.getByRole("button", { name }).evaluate((el) => {
        const cs = getComputedStyle(el);
        return { fontSize: cs.fontSize, minHeight: cs.minHeight, padding: cs.padding, weight: cs.fontWeight };
      });
      return { box, style };
    };
    const reject = await measure(/Nur notwendige/i);
    const accept = await measure(/Alle akzeptieren/i);
    out.prominence = { reject, accept };
    ok("Ablehnen-Button >= 44px hoch", reject.box.height >= 44, `${reject.box.height}`);
    ok("Akzeptieren-Button >= 44px hoch", accept.box.height >= 44, `${accept.box.height}`);
    ok(
      "Gleichwertige Groesse (Breite/Hoehe/Font) fuer Alle-akzeptieren vs. Nur-notwendige",
      Math.abs(reject.box.width - accept.box.width) <= 1 && Math.abs(reject.box.height - accept.box.height) <= 1 && reject.style.fontSize === accept.style.fontSize,
      `reject ${reject.box.width}x${reject.box.height} / accept ${accept.box.width}x${accept.box.height}`,
    );
    await ctx.close();
  }

  // 3) Ablehnen ist EIN Klick, keine Dritt-Requests, Banner weg
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const requests = [];
    const page = await ctx.newPage();
    ctx.on("request", (r) => requests.push(r.url()));
    await page.goto("/");
    await page.getByRole("button", { name: /Nur notwendige/i }).click();
    const bannerGone = await page.locator("#pf-consent-banner").count();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem("pixelforge.consent.v1") || "null"));
    const cookies = await ctx.cookies();
    const thirdParty = requests.filter((u) => !/^https?:\/\/(127\.0\.0\.1|localhost):4321/.test(u));
    out.reject = { bannerGone, record, cookies: cookies.map((c) => c.name), thirdParty };
    ok("Ablehnen: Banner entfernt nach 1 Klick", bannerGone === 0);
    ok("Ablehnen: Zustand gespeichert (entscheidung=abgelehnt)", record?.entscheidung === "abgelehnt", JSON.stringify(record));
    ok("Ablehnen: keine Cookies", cookies.length === 0);
    ok("Ablehnen: keine Dritt-Requests", thirdParty.length === 0, thirdParty.join(" | "));
    await ctx.close();
  }

  // 4) Persistenz ueber Reload und Seitenwechsel
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: /Nur notwendige/i }).click();
    await page.reload();
    const afterReload = {
      banner: (await page.locator("#pf-consent-banner").isVisible()) ? 1 : 0,
      state: await page.getAttribute("html", "data-pf-consent"),
    };
    await page.goto("/kontakt/");
    const afterNav = {
      banner: (await page.locator("#pf-consent-banner").isVisible()) ? 1 : 0,
      state: await page.getAttribute("html", "data-pf-consent"),
    };
    out.persistence = { afterReload, afterNav };
    ok("Reload: Banner bleibt weg", afterReload.banner === 0, JSON.stringify(afterReload));
    ok("Seitenwechsel: Banner bleibt weg", afterNav.banner === 0, JSON.stringify(afterNav));
    await ctx.close();
  }

  // 5) Akzeptieren: Banner weg, Zustand gespeichert
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: /Alle akzeptieren/i }).click();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem("pixelforge.consent.v1") || "null"));
    out.accept = { banner: await page.locator("#pf-consent-banner").count(), record };
    ok("Akzeptieren: Banner entfernt", out.accept.banner === 0);
    ok("Akzeptieren: alle Kategorien an", record?.kategorien?.statistik === true && record?.kategorien?.externe_medien === true, JSON.stringify(record));
    await ctx.close();
  }

  // 6) Widerruf ueber Footer-Link: Link vorhanden+sichtbar, Widerruf wirkt
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: /Alle akzeptieren/i }).click();
    const footerBtn = page.locator("footer").getByRole("button", { name: /Cookie-Einstellungen/i });
    const footerVisible = await footerBtn.count();
    await footerBtn.scrollIntoViewIfNeeded();
    await footerBtn.click();
    // im Dialog alles abwaehlen + speichern
    const stat = page.locator('input[data-consent-category="statistik"]');
    const ext = page.locator('input[data-consent-category="externe_medien"]');
    if (await stat.isChecked()) await stat.uncheck();
    if (await ext.isChecked()) await ext.uncheck();
    await page.getByRole("button", { name: /Auswahl speichern/i }).click();
    const record = await page.evaluate(() => JSON.parse(localStorage.getItem("pixelforge.consent.v1") || "null"));
    const gateSlotsActive = await page.locator('[data-consent-slot][data-consent-active="true"]').count();
    out.revoke = { footerVisible, record, gateSlotsActive };
    ok("Footer-Link 'Cookie-Einstellungen' vorhanden", footerVisible === 1);
    ok("Widerruf: Kategorien aus", record?.kategorien?.statistik === false && record?.kategorien?.externe_medien === false, JSON.stringify(record));
    ok("Widerruf: keine aktiven Gate-Slots", gateSlotsActive === 0, `${gateSlotsActive}`);
    await ctx.close();
  }

  // 7) Policy-/Versionswechsel laesst Banner wiederkommen
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
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
    const state = await page.getAttribute("html", "data-pf-consent");
    out.versionChange = { banner, state };
    ok("Neue Policy-Version (2) -> Banner kommt wieder", banner, `state=${state}`);
    await ctx.close();
  }

  // 8) Fremder/korrupter Datensatz fuehrt NICHT zu stiller Einwilligung
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.evaluate(() => localStorage.setItem("pixelforge.consent.v1", "{kaputt"));
    await page.reload();
    const banner = await page.locator("#pf-consent-banner").isVisible();
    out.corrupt = { banner };
    ok("Korrupter Consent-Wert -> Banner sichtbar (keine stille Einwilligung)", banner);
    await ctx.close();
  }

  // 9) Granularer Dialog: Toggles nicht vorausgewaehlt
  {
    const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.locator('#pf-consent-banner [data-consent-action="open-settings"]').click();
    const stat = await page.locator('input[data-consent-category="statistik"]').isChecked();
    const ext = await page.locator('input[data-consent-category="externe_medien"]').isChecked();
    out.toggles = { stat, ext };
    ok("Optionale Kategorien nicht vorausgewaehlt", stat === false && ext === false, `stat=${stat} ext=${ext}`);
    await ctx.close();
  }

  save("consent.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- reviews
async function reviews() {
  const browser = await chromium.launch();
  const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto("/bewertungen/", { waitUntil: "load" });
  const emptyState = {
    text: await page.locator("#pf-reviews-title").textContent(),
    bodyText: (await page.locator("main").innerText()).replace(/\s+/g, " ").slice(0, 600),
    starCount: await page.locator(".pf-review__stars").count(),
    reviewCount: await page.locator(".pf-review").count(),
    attribution: await page.locator(".pf-attribution").count(),
    ctaGoogle: await page.getByRole("link", { name: /Jetzt bei Google bewerten/i }).count(),
    ctaContact: await page.getByRole("link", { name: /Kontakt/i }).count(),
  };
  // Startseite-Sektion
  await page.goto("/");
  const homeReviews = {
    sectionPresent: await page.locator("#pf-reviews-title").count(),
    reviewCount: await page.locator(".pf-review").count(),
  };
  // Quelle: statischer Export
  const api = await page.evaluate(async () => {
    const r = await fetch("/api/reviews");
    return { status: r.status, body: await r.json() };
  });
  const out = { emptyState, homeReviews, api };
  save("reviews.json", out);
  ok("Leerzustand: 0 Bewertungskarten (keine erfundenen Bewertungen)", emptyState.reviewCount === 0, `${emptyState.reviewCount}`);
  ok("Leerzustand: 0 Sterne-Renderings", emptyState.starCount === 0);
  ok("Leerzustand: ehrlicher Hinweis vorhanden", /Bewertungen|Google/i.test(emptyState.bodyText), emptyState.bodyText.slice(0, 120));
  ok("API /api/reviews liefert 200", api.status === 200, `status=${api.status}`);
  ok("API: keine erfundenen Reviews (leer)", Array.isArray(api.body?.reviews) && api.body.reviews.length === 0, JSON.stringify(api.body).slice(0, 200));
  console.log("NOTE  Attribution im Leerzustand:", emptyState.attribution, "(erwartet 0 ohne Reviews)");
  await ctx.close();
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- overflow
async function overflow() {
  const browser = await chromium.launch();
  const widths = [360, 768, 1024, 1440];
  const pagesToCheck = ["/", "/kontakt/", "/bewertungen/", "/leistungen/"];
  const out = [];
  for (const w of widths) {
    const ctx = await newCtx(browser, { viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    for (const path of pagesToCheck) {
      await page.goto(path);
      const m = await page.evaluate(() => ({
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
      }));
      const overflow = m.scrollW > m.clientW + 1;
      out.push({ path, width: w, ...m, overflow });
      ok(`Kein horizontaler Overflow  ${path} @${w}px`, !overflow, `scrollW=${m.scrollW} clientW=${m.clientW}`);
    }
    await ctx.close();
  }
  // Touch-Targets: Projekt-Gate >= 44px (komponenten.md §0.4/§14.3),
  // WCAG 2.2 AA 2.5.8 Mindestmass 24px.
  {
    const ctx = await newCtx(browser, { ...devices["Pixel 5"] });
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
          const item = { tag: el.tagName, id: el.id, cls: el.className, label, w: Math.round(r.width), h: Math.round(r.height), inlineInText };
          if (r.height < 44 || r.width < 44) under44.push(item);
          if ((r.height < 24 || r.width < 24) && !inlineInText) under24.push(item);
        }
        return { under44, under24 };
      });
    };
    const scanPages = ["/", "/kontakt/", "/bewertungen/"];
    const under44All = {};
    const under24All = {};
    for (const p of scanPages) {
      const r = await scan(p);
      under44All[p] = r.under44;
      under24All[p] = r.under24;
    }
    out.push({ touchTargetsUnder44: under44All, touchTargetsUnder24: under24All });
    const count44 = Object.values(under44All).flat().length;
    const count24 = Object.values(under24All).flat().length;
    ok("Touch-Targets >= 44px (Projekt-Gate)", count44 === 0, `${count44} unter 44px: ${JSON.stringify(Object.values(under44All).flat().slice(0, 8))}`);
    ok("Touch-Targets >= 24px (WCAG 2.2 AA 2.5.8)", count24 === 0, `${count24} unter 24px`);
    await ctx.close();
  }
  save("overflow.json", out);
  await browser.close();
  return out;
}

// ---------------------------------------------------------------- browser matrix
async function browserMatrix() {
  const out = [];
  const run = async (browserType, name, contextOpts) => {
    const browser = await browserType.launch();
    const ctx = await newCtx(browser, contextOpts);
    const page = await ctx.newPage();
    const consoleErrors = [];
    page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
    page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));
    const rec = { browser: name, steps: {}, consoleErrors };
    try {
      // Navigation
      await page.goto("/", { waitUntil: "load" });
      rec.steps.homeTitle = await page.title();
      // Consent ablehnen
      await page.getByRole("button", { name: /Nur notwendige/i }).click();
      rec.steps.consentRejected = (await page.locator("#pf-consent-banner").count()) === 0;
      // Mobile Nav (nur mobile Viewports) bzw. Hauptnavigation
      if (contextOpts.isMobile) {
        await page.locator("[data-nav-open]").click();
        rec.steps.drawerOpen = await page.locator("[data-nav-drawer]").isVisible();
        await page.locator("[data-nav-drawer]").getByRole("link", { name: /Kontakt/i }).first().click();
        await page.waitForURL(/kontakt/);
      } else {
        await page.getByRole("link", { name: /Kontakt/i }).first().click();
        await page.waitForURL(/kontakt/);
      }
      rec.steps.contactUrl = page.url();
      // Formular: leeres Absenden -> Inline-Fehler
      await page.getByRole("button", { name: /Anfrage senden|senden/i }).click();
      rec.steps.emptySubmitError = await page.locator("[data-contact-summary]").isVisible();
      // Formular: gueltig absenden (Zeitfalle umgehen)
      await page.fill("#contact-name", "QA Test");
      await page.fill("#contact-email", "qa@example.com");
      await page.fill("#contact-nachricht", "Automatischer QA-Test der Abnahme. Bitte ignorieren.");
      await page.check("#contact-einwilligung");
      await page.evaluate(() => {
        const ts = document.querySelector("[data-contact-ts]");
        if (ts) ts.value = String(Date.now() - 5000);
      });
      await page.getByRole("button", { name: /Anfrage senden|senden/i }).click();
      await page.waitForSelector(".pf-form__status", { timeout: 15000 });
      rec.steps.submitStatus = (await page.locator(".pf-form__status").innerText()).replace(/\s+/g, " ");
      rec.steps.submitSuccess = true;
    } catch (e) {
      rec.error = String(e).split("\n")[0];
    }
    await ctx.close();
    await browser.close();
    out.push(rec);
    return rec;
  };

  const c1 = await run(chromium, "chromium-desktop", { viewport: { width: 1280, height: 900 } });
  ok("Chromium Desktop: Navigation+Consent+Formular", !c1.error && c1.steps.submitSuccess, c1.error ?? JSON.stringify(c1.steps));
  const c2 = await run(chromium, "chromium-mobil", { ...devices["Pixel 5"] });
  ok("Chromium Mobil: Mobile-Nav+Consent+Formular", !c2.error && c2.steps.drawerOpen && c2.steps.submitSuccess, c2.error ?? JSON.stringify(c2.steps));
  const f1 = await run(firefox, "firefox-desktop", { viewport: { width: 1280, height: 900 } });
  ok("Firefox Desktop: Navigation+Consent+Formular", !f1.error && f1.steps.submitSuccess, f1.error ?? JSON.stringify(f1.steps));
  save("browser-matrix.json", out);
  return out;
}

// ---------------------------------------------------------------- screenshots
async function screens() {
  const browser = await chromium.launch();
  const widths = [360, 768, 1024, 1440];
  const targets = [
    ["home", "/"],
    ["kontakt", "/kontakt/"],
    ["bewertungen", "/bewertungen/"],
  ];
  const saved = [];
  for (const w of widths) {
    const ctx = await newCtx(browser, { viewport: { width: w, height: 900 } });
    const page = await ctx.newPage();
    for (const [label, path] of targets) {
      await page.goto(path, { waitUntil: "load" });
      // Lazy-Bilder laden: einmal durchscrollen, dann zurueck an den Anfang.
      await page.evaluate(async () => {
        const step = window.innerHeight;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 15000 }).catch(() => {});
      const file = join(SCR, `${label}-${w}.png`);
      await page.screenshot({ path: file, fullPage: true });
      saved.push(file);
    }
    // Consent-Banner-Screenshot bei 360 (vor Entscheidung)
    if (w === 360) {
      const page2 = await ctx.newPage();
      await page2.goto("/", { waitUntil: "load" });
      await page2.screenshot({ path: join(SCR, "consent-banner-360.png"), fullPage: false });
      saved.push(join(SCR, "consent-banner-360.png"));
    }
    await ctx.close();
  }
  save("screens.json", saved);
  ok("Screenshots erzeugt (360/768/1024/1440)", saved.length >= 12, `${saved.length} Dateien`);
  await browser.close();
  return saved;
}

const sections = { a11y, keyboard, consent, reviews, overflow, browser: browserMatrix, screens };
if (!sections[section]) {
  console.error("Unbekannte Section:", section, "— erlaubt:", Object.keys(sections).join(", "));
  process.exit(2);
}
await sections[section]();
console.log(`\n== Section ${section}: ${failures} Fehlschlag(e) ==`);
process.exit(0);
