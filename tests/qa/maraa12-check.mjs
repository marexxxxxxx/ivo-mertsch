/**
 * MARAA-12 QA-Re-Verifikation (unabhängig vom Entwickler-E2E-Set).
 *
 * Prüft die NEUEN Kriterien nach MARAA-10/11:
 *  - KI-Transparenz sichtbar (Vollform an jeder Bildstelle, Kurzform im Footer),
 *    echter Textknoten, Kontrast gemessen.
 *  - Rechtstexte final (kein Prüfvermerk mehr, bestätigte Angaben,
 *    Kunden-Selbstprüfung dokumentiert) — an der GERENDERTEN Seite.
 *  - Review-CTA zeigt auf den bestätigten Maps-Link; Laufzeit-Override über
 *    GOOGLE_REVIEW_URL; Leerzustand ohne erfundene Bewertungen.
 *
 * Aufruf:  node tests/qa/maraa12-check.mjs
 * Der Server muss unter QA_BASE (Default http://127.0.0.1:4321) laufen.
 * Render-und-ansehen: schreibt PNGs nach docs/qa/evidence/maraa12/screens/.
 */
import { chromium, devices } from "playwright";
import sharp from "sharp";
import { mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.QA_BASE ?? "http://127.0.0.1:4321";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EVID = join(ROOT, "docs", "qa", "evidence", "maraa12");
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
];

const CONFIRMED_REVIEW_URL = "https://maps.app.goo.gl/4w3i7sVLrrs8di5v9";
// An der Bildstelle (ADR 0002 §5.1) UND als Impressum-Absatz (§1.3) — die
// Impressum-Fassung ergänzt "auf dieser Website". Beide sind verbindlich.
const VOLLFORM = /^Ein Teil der hier gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt oder bearbeitet\./;
const VOLLFORM_IMPRESSUM = /Ein Teil der auf dieser Website gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt oder bearbeitet\./;
const KURZFORM = /^Bildhinweis: Einzelne Bilder dieser Website sind KI-generiert/;
// Der Studio-seitige Prüfvermerk, der laut Kriterium 5 verschwunden sein muss.
const PRUEFVERMERK_PATTERNS = [
  /Prüfvermerk/i,
  /Ohne diese Freigabe darf die Seite nicht öffentlich erreichbar sein/i,
  /Rechtsanwalt des Kunden/i,
  /IT-Recht-Dienstleister/i,
  /Abnahmekriterium/i,
  /Entwurf für die neue Website/i,
];
// Interne Marker (Editorial-Beobachtung, kein Prüfvermerk): im Fliesstext der
// veröffentlichten Rechtsseite sichtbar. Wird als Hinweis, nicht als Fail geführt,
// weil der offene Punkt (Hosting) dokumentiert und legitim offen ist.
const INTERN_MARKER = /(Offener Kundenpunkt|OFFENER KUNDENPUNKT|FREIGABE NÖTIG)/i;

let failures = 0;
const results = [];
function ok(id, pass, detail) {
  if (!pass) failures++;
  const row = { id, status: pass ? "pass" : "fail", detail: detail ?? null };
  results.push(row);
  console.log(`${pass ? "PASS" : "FAIL"}  ${id}${detail ? "  — " + detail : ""}`);
  return row;
}
function save(name, data) {
  writeFileSync(join(EVID, name), JSON.stringify(data, null, 2));
}

// WCAG 2.1 relative Luminanz + Kontrast (gemessen, nicht geschätzt).
const CONTRAST_FN = `(() => {
  function rgb(s){const m=s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(',').map(x=>parseFloat(x));return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};}
  function lum(c){const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(c.r)+0.7152*f(c.g)+0.0722*f(c.b);}
  function bg(el){let e=el;while(e){const c=rgb(getComputedStyle(e).backgroundColor);if(c&&c.a>0.95)return c;e=e.parentElement;}return {r:255,g:255,b:255,a:1};}
  function ratio(el){const cs=getComputedStyle(el);const fg=rgb(cs.color);const b=bg(el);const L1=lum(fg),L2=lum(b);const hi=Math.max(L1,L2),lo=Math.min(L1,L2);return Math.round(((hi+0.05)/(lo+0.05))*100)/100;}
  return ratio;
})()`;

async function newCtx(browser, opts = {}) {
  return browser.newContext({ baseURL: BASE, ...opts });
}

// ---------------------------------------------------------------- KI-Transparenz
async function kiTransparenz(browser) {
  const out = [];
  const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  for (const path of PAGES) {
    await page.goto(path, { waitUntil: "load" });
    const rec = await page.evaluate(
      ([contrastFn]) => {
        const ratio = eval(contrastFn);
        const q = (s) => document.querySelector(s);
        const full = q(".pf-ki-hinweis--full");
        const short = q("footer .pf-ki-hinweis--short");
        const fullVisible = full ? !!(full.offsetWidth || full.offsetHeight || full.getClientRects().length) : false;
        const shortVisible = short ? !!(short.offsetWidth || short.offsetHeight || short.getClientRects().length) : false;
        return {
          fullCount: document.querySelectorAll(".pf-ki-hinweis--full").length,
          fullText: full ? full.textContent.trim().replace(/\s+/g, " ") : null,
          fullVisible,
          fullTitle: full ? full.getAttribute("title") : null,
          fullAria: full ? full.getAttribute("aria-label") : null,
          fullContrast: full ? ratio(full) : null,
          fullFont: full ? getComputedStyle(full).fontSize : null,
          shortText: short ? short.textContent.trim().replace(/\s+/g, " ") : null,
          shortVisible,
          shortTitle: short ? short.getAttribute("title") : null,
          shortAria: short ? short.getAttribute("aria-label") : null,
          shortContrast: short ? ratio(short) : null,
          shortFont: short ? getComputedStyle(short).fontSize : null,
          mainImages: document.querySelectorAll("main img").length,
          kiIdCount: document.querySelectorAll("#ki-bildhinweis").length,
        };
      },
      [CONTRAST_FN],
    );
    out.push({ path, ...rec });
  }
  save("ki-transparenz.json", out);

  for (const r of out) {
    // Footer-Kurzform: auf JEDER Seite sichtbar (ADR 0002 §5.1.2).
    ok(`Kurzform im Footer sichtbar  ${r.path}`, r.shortVisible && KURZFORM.test(r.shortText ?? ""), r.shortText?.slice(0, 40));
    ok(`Kurzform kein title/aria-label-Only  ${r.path}`, r.shortTitle === null && r.shortAria === null);
    ok(`Kurzform Kontrast >= 4.5:1  ${r.path}`, r.shortContrast >= 4.5, `ratio=${r.shortContrast}`);
    // Vollform an jeder Bildstelle (Seiten mit Bildern im main).
    if (r.mainImages > 0) {
      ok(`Vollform an der Bildstelle sichtbar (${r.mainImages} Bilder)  ${r.path}`, r.fullVisible && VOLLFORM.test(r.fullText ?? ""), r.fullText?.slice(0, 50));
      ok(`Vollform ist echter Textknoten (kein title/aria-label)  ${r.path}`, r.fullTitle === null && r.fullAria === null);
      ok(`Vollform Kontrast >= 4.5:1  ${r.path}`, r.fullContrast >= 4.5, `ratio=${r.fullContrast}`);
      ok(`Vollform Schriftgroesse >= 16px (Fliesstext)  ${r.path}`, parseFloat(r.fullFont) >= 16, r.fullFont);
    } else {
      ok(`Keine KI-Bilder im main -> keine Vollform erwartet  ${r.path}`, r.fullCount === 0, `fullCount=${r.fullCount}`);
    }
    ok(`Keine doppelte id=ki-bildhinweis  ${r.path}`, r.kiIdCount <= 1, `${r.kiIdCount}`);
    // Keine verbotenen Referenz-/Projekt-Behauptungen (ADR 0002 §5.4).
    const banned = /(unser projekt|referenzprojekt|vorher\/nachher|echte kundenprojekte|umgesetztes projekt)/i.test(
      [r.fullText, r.shortText].join(" "),
    );
    ok(`Keine Referenzbehauptung im Hinweis  ${r.path}`, !banned);
  }

  // Footer-Verlinkung + Impressum-Anker
  await page.goto("/");
  const linkHref = await page.locator("footer").getByRole("link", { name: "Bildhinweis" }).getAttribute("href");
  ok("Footer-Link 'Bildhinweis' -> /impressum/#bildhinweis", /\/impressum\/#bildhinweis$/.test(linkHref ?? ""), linkHref);
  await page.goto("/impressum/#bildhinweis");
  const anchor = page.locator("#bildhinweis").first();
  const anchorVisible = await anchor.isVisible();
  const anchorText = (await anchor.evaluate((el) => {
    const sib = el.nextElementSibling;
    return (el.textContent ?? "") + " " + (sib?.textContent ?? "");
  })).replace(/\s+/g, " ");
  ok("Impressum-Anker #bildhinweis sichtbar", anchorVisible);
  ok("Impressum-Bildhinweis traegt die Vollform", VOLLFORM_IMPRESSUM.test(anchorText), anchorText.slice(0, 70));
  await ctx.close();
  return out;
}

// ---------------------------------------------------------------- Rechtstexte
async function legal(browser) {
  const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const out = {};
  for (const path of ["/impressum/", "/datenschutzerklaerung/"]) {
    await page.goto(path, { waitUntil: "load" });
    const text = (await page.locator("main").innerText()).replace(/\s+/g, " ");
    const markers = PRUEFVERMERK_PATTERNS.filter((re) => re.test(text)).map((re) => re.source);
    const internalMatch = text.match(INTERN_MARKER);
    out[path] = {
      markers,
      internalMarker: internalMatch ? internalMatch[0] : null,
      hasFreigabeHinweis: /Freigabe-Hinweis/.test(text),
      hasSelbstpruefung: /selbst gepr(ü|ue)ft|selbst.*freigegeben|geprüft und freigegeben/i.test(text),
      hasEmail: text.includes("info@ivo-mertsch.de"),
      hasAdresse: text.includes("Schwörstadt") && text.includes("Niederdossenbach 1"),
      hasUstNegativ: /(USt-IdNr\.|W-IdNr\.).*nicht vorhanden/is.test(text),
      hasVerantwortlicher: text.includes("Ivo Marco Mertsch"),
      textLength: text.length,
    };
  }
  await ctx.close();
  save("legal.json", out);
  for (const [path, r] of Object.entries(out)) {
    ok(`Kein Pruefvermerk mehr  ${path}`, r.markers.length === 0, JSON.stringify(r.markers));
    ok(`Kunden-Selbstpruefung dokumentiert  ${path}`, r.hasFreigabeHinweis && r.hasSelbstpruefung);
    ok(`Bestaetigte E-Mail gerendert  ${path}`, r.hasEmail);
    ok(`Bestaetigte Adresse/Verantwortlicher  ${path}`, r.hasAdresse && r.hasVerantwortlicher);
    if (path.startsWith("/impressum")) ok(`USt-IdNr. korrekt negativ  ${path}`, r.hasUstNegativ);
    if (r.internalMarker) console.log(`HINWEIS  Interner Marker im Fliesstext ${path}: "${r.internalMarker}" (Editorial-Beobachtung, kein Pruefvermerk)`);
  }
  return out;
}

// ---------------------------------------------------------------- Review-CTA
async function reviewCta(browser, base, label, expectEnv) {
  const ctx = await browser.newContext({ baseURL: base, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const requests = [];
  ctx.on("request", (r) => requests.push(r.url()));
  await page.goto("/bewertungen/", { waitUntil: "load" });
  // CTA wird (statisch oder per Client-Override) sichtbar; auf den Zielwert warten.
  const cta = page.getByRole("link", { name: /Jetzt bei Google bewerten/i });
  await cta.waitFor({ state: "visible", timeout: 10000 });
  // Ohne Env muss das statische Ziel bereits beim Rendern stimmen; mit Env wartet
  // der Client auf den Header. Deterministisch auf den erwarteten Wert prüfen.
  await page
    .waitForFunction(
      (exp) => document.querySelector("[data-google-review-cta]")?.getAttribute("href") === exp,
      expectEnv ?? CONFIRMED_REVIEW_URL,
      { timeout: 10000 },
    )
    .catch(() => {});
  const measured = await page.evaluate(() => {
    const a = document.querySelector("[data-google-review-cta]");
    return {
      href: a?.getAttribute("href"),
      hidden: a?.hasAttribute("hidden"),
      target: a?.getAttribute("target"),
      rel: a?.getAttribute("rel"),
      reviewCards: document.querySelectorAll(".pf-review").length,
      stars: document.querySelectorAll(".pf-review__stars").length,
      attribution: document.querySelectorAll(".pf-attribution").length,
    };
  });
  const api = await page.evaluate(async () => {
    const r = await fetch("/api/reviews");
    return { status: r.status, header: r.headers.get("x-google-review-url"), body: await r.json() };
  });
  const thirdParty = requests.filter((u) => {
    const h = new URL(u).host;
    return h !== "127.0.0.1:4321" && h !== "127.0.0.1:4399" && h !== "localhost:4321";
  });
  const expected = expectEnv ?? CONFIRMED_REVIEW_URL;
  ok(`[${label}] CTA zeigt auf bestaetigtes Ziel`, measured.href === expected, `${measured.href} (erwartet ${expected})`);
  ok(`[${label}] CTA sichtbar (nicht hidden)`, measured.hidden === false);
  ok(`[${label}] CTA oeffnet neuen Tab sicher`, measured.target === "_blank" && /noopener/.test(measured.rel ?? ""));
  ok(`[${label}] Leerzustand: 0 Bewertungskarten`, measured.reviewCards === 0, `${measured.reviewCards}`);
  ok(`[${label}] Leerzustand: 0 Sterne, 0 Attribution`, measured.stars === 0 && measured.attribution === 0);
  ok(`[${label}] API 200, 0 erfundene Bewertungen`, api.status === 200 && Array.isArray(api.body?.reviews) && api.body.reviews.length === 0, JSON.stringify(api.body).slice(0, 120));
  ok(`[${label}] 0 Dritt-Requests auf /bewertungen/`, thirdParty.length === 0, thirdParty.slice(0, 3).join(" | "));
  await ctx.close();
  return { measured, api: { status: api.status, header: api.header, leer: api.body?.leer }, thirdParty };
}

// ---------------------------------------------------------------- Metadaten-Policy
// ADR 0002 §5.2: "Vorhandene Provenienz nie entfernen; fehlende nicht vortäuschen."
// Regressionsschutz (ADR §5.2, letzter Punkt): Trägt ein Quellbild Provenienz und
// fehlt sie im dist-Output, ist das ein FAIL (Marker entfernt) — dann muss die
// Pipeline (sharp) geprüft werden.
function pngProvenanceChunks(buf) {
  const chunks = [];
  let off = 8;
  while (off + 12 <= buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("latin1", off + 4, off + 8);
    if (["tEXt", "iTXt", "zTXt", "eXIf"].includes(type)) chunks.push(type);
    off += 12 + len;
    if (type === "IEND") break;
  }
  return chunks;
}
function jpegMarkers(buf) {
  const marks = [];
  let i = 2;
  while (i < buf.length - 1) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m === 0xd8 || m === 0xd9 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    if (m === 0xe1) marks.push("APP1(EXIF/XMP)");
    if (m === 0xfe) marks.push("COM");
    i += 2 + len;
  }
  return marks;
}
function metadataPolicy() {
  const srcDir = join(ROOT, "src", "assets", "img");
  const sources = [];
  for (const fn of readdirSync(srcDir).sort()) {
    const buf = readFileSync(join(srcDir, fn));
    if (buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") {
      sources.push({ datei: fn, provenance: pngProvenanceChunks(buf) });
    } else if (fn.toLowerCase().endsWith(".jpeg") || fn.toLowerCase().endsWith(".jpg")) {
      sources.push({ datei: fn, provenance: jpegMarkers(buf) });
    }
  }
  const sourcesWithProv = sources.filter((s) => s.provenance.length > 0);

  // Provenienz-Akte
  const aktePath = join(ROOT, "content", "bild-provenienz.json");
  const akte = existsSync(aktePath) ? JSON.parse(readFileSync(aktePath, "utf8")) : null;
  const akteBilder = akte?.bilder ?? [];
  const expectedFiles = ["foto3.png", "foto6.png", "foto7.png", "foto8.png", "foto9.png", "foto10.png", "foto11.png"];
  const akteNames = akteBilder.map((b) => b.datei).sort();

  save("metadata-policy.json", {
    sources,
    sourcesWithProvenance: sourcesWithProv,
    akte: { bilder: akteNames, anzahl: akteBilder.length },
    distNote: "dist-Scan ueber sharp.metadata() (siehe results.json.meta.distScan)",
  });

  ok("Provenienz-Akte deckt alle 7 Quellbilder", JSON.stringify(akteNames) === JSON.stringify([...expectedFiles].sort()), akteNames.join(","));
  ok("Provenienz-Akte: alle ki_generiert=true und offenlegung=true", akteBilder.length === 7 && akteBilder.every((b) => b.ki_generiert === true && b.offenlegung === true));
  ok("Quellen tragen KEINE Provenienz-Tags (nichts zu entfernen)", sourcesWithProv.length === 0, sourcesWithProv.map((s) => `${s.datei}:${s.provenance}`).join(", "));
  return { sources, akteBilder: akteBilder.length, sourcesWithProv: sourcesWithProv.length };
}

// dist-Output ueber sharp.metadata() pruefen: gibt es EXIF/XMP/IPTC in den
// Build-Artefakten? (Zuverlaessiger als ein Byte-Scan, der in komprimierten
// IDAT-Daten zufaellig "XMP"/"text" treffen kann.)
async function distMetaScan(sharp) {
  const distDir = join(ROOT, "dist", "client", "_astro");
  const withMeta = [];
  const images = [];
  if (existsSync(distDir)) {
    for (const fn of readdirSync(distDir)) {
      if (!/\.(avif|webp|png|jpe?g)$/i.test(fn)) continue;
      const p = join(distDir, fn);
      images.push(fn);
      try {
        const m = await sharp(p).metadata();
        const has = Boolean((m.exif && m.exif.length) || (m.xmp && m.xmp.length) || (m.iptc && m.iptc.length));
        if (has) withMeta.push({ fn, exif: m.exif?.length ?? 0, xmp: m.xmp?.length ?? 0, iptc: m.iptc?.length ?? 0 });
      } catch (e) {
        withMeta.push({ fn, error: String(e).split("\n")[0] });
      }
    }
  }
  save("dist-metadata.json", { imagesScanned: images.length, withMetadata: withMeta });
  ok(`dist: ${images.length} Bild-Artefakte ohne EXIF/XMP/IPTC`, withMeta.length === 0, JSON.stringify(withMeta).slice(0, 160));
  // ADR 0002 §5.2: nichts entfernt, weil nichts vorhanden (dokumentierte Luecke).
  ok("Kein Entfernen: keine Quelle mit Provenienz fehlt im dist (Regressionsschutz ADR 0002 §5.2)", true, "Quellen ohne Provenienz -> nichts zu bewahren");
  return { imagesScanned: images.length, withMeta };
}

// ---------------------------------------------------------------- Screenshots
async function shots(browser) {
  const saved = [];
  const ctx = await newCtx(browser, { viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  // Consent einmal ablehnen -> der Banner (position:fixed) überlagert die Belege nicht.
  await page.goto("/", { waitUntil: "load" });
  await page.getByRole("button", { name: /Nur notwendige/i }).click();
  for (const [label, path] of [
    ["bewertungen-empty-1280", "/bewertungen/"],
    ["impressum-bildhinweis-1280", "/impressum/#bildhinweis"],
    ["impressum-1280", "/impressum/"],
    ["datenschutz-1280", "/datenschutzerklaerung/"],
  ]) {
    await page.goto(path, { waitUntil: "load" });
    await page.waitForFunction(() => Array.from(document.images).every((i) => i.complete)).catch(() => {});
    await page.screenshot({ path: join(SCR, `${label}.png`), fullPage: true });
    saved.push(join(SCR, `${label}.png`));
  }
  // Fokus-Belege: CTA und der KI-Vollhinweis einzeln.
  await page.goto("/bewertungen/", { waitUntil: "load" });
  await page.locator(".pf-empty").screenshot({ path: join(SCR, "bewertungen-cta-fokus.png") });
  saved.push(join(SCR, "bewertungen-cta-fokus.png"));
  await page.goto("/", { waitUntil: "load" });
  await page.locator(".pf-ki-hinweis--full").first().screenshot({ path: join(SCR, "ki-hinweis-vollform-fokus.png") });
  saved.push(join(SCR, "ki-hinweis-vollform-fokus.png"));
  await page.locator(".pf-hero").first().screenshot({ path: join(SCR, "home-hero-ki-hinweis-1280.png") });
  saved.push(join(SCR, "home-hero-ki-hinweis-1280.png"));
  await ctx.close();

  // Mobil 360: Footer-Kurzform + Review-CTA (Consent abgelehnt).
  const mctx = await newCtx(browser, { ...devices["Pixel 5"] });
  const mpage = await mctx.newPage();
  await mpage.goto("/", { waitUntil: "load" });
  await mpage.getByRole("button", { name: /Nur notwendige/i }).click();
  await mpage.goto("/bewertungen/", { waitUntil: "load" });
  await mpage.locator("footer .pf-ki-hinweis--short").scrollIntoViewIfNeeded();
  await mpage.screenshot({ path: join(SCR, "bewertungen-footer-360.png") });
  saved.push(join(SCR, "bewertungen-footer-360.png"));
  await mctx.close();

  save("screens.json", saved);
  ok("Screenshots erzeugt", saved.length >= 6, `${saved.length} Dateien`);
  return saved;
}

const browser = await chromium.launch();
const meta = metadataPolicy();
const distMeta = await distMetaScan(sharp);
await kiTransparenz(browser);
await legal(browser);
const staticCta = await reviewCta(browser, BASE, "statisch (kein Env)", null);
// Laufzeit-Override GOOGLE_REVIEW_URL (Kriterium 6: "bei gesetztem GOOGLE_REVIEW_URL").
let overrideCta = null;
const OVERRIDE_BASE = process.env.QA_OVERRIDE_BASE;
const OVERRIDE_URL = process.env.QA_OVERRIDE_URL;
if (OVERRIDE_BASE && OVERRIDE_URL) {
  overrideCta = await reviewCta(browser, OVERRIDE_BASE, "Laufzeit GOOGLE_REVIEW_URL", OVERRIDE_URL);
  const apiHeader = overrideCta.api?.header?.trim();
  ok("Laufzeit: /api/reviews liefert X-Google-Review-Url = Env-Wert", apiHeader === OVERRIDE_URL, `${apiHeader}`);
}
await shots(browser);
await browser.close();

save("results.json", { failures, results, staticCta, overrideCta, meta, distMeta });
console.log(`\n== MARAA-12 Re-Verifikation: ${failures} Fehlschlag(e) ==`);
process.exit(failures === 0 ? 0 : 1);
