// Verifizierung fuer MARAA-2: docs/contracts/*.schema.json
// Prueft (a) Kompilierbarkeit, (b) gueltige Fixtures, (c) Negativfaelle schlagen fehl.
const fs = require("fs");
const path = require("path");

let Ajv2020, addFormats;
try {
  Ajv2020 = require("ajv/dist/2020");
  addFormats = require("ajv-formats");
} catch (e) {
  console.error(
    "FEHLT: 'ajv' und 'ajv-formats' (devDependencies).\n" +
      "  Installation: pnpm add -D ajv@^8 ajv-formats@^2\n" +
      "  (Diese Datei ist ein Prueftor aus MARAA-2 ADR 0001 Abschnitt 9.2,\n" +
      "   'Schema-Validierung'. Ohne die Abhaengigkeit schlaegt das Tor fehl.)"
  );
  process.exit(2);
}

const CDIR = path.join(__dirname, "..", "..", "docs", "contracts");

const results = [];
function check(name, fn) {
  try {
    results.push({ name, ok: fn() === true });
  } catch (e) {
    results.push({ name, ok: false, err: String(e.message || e).slice(0, 200) });
  }
}

function mkAjv() {
  const ajv = new Ajv2020({ strict: false, allErrors: true });
  addFormats(ajv);
  return ajv;
}

const reviewsSchema = JSON.parse(fs.readFileSync(path.join(CDIR, "reviews.schema.json"), "utf8"));
const consentSchema = JSON.parse(fs.readFileSync(path.join(CDIR, "consent.schema.json"), "utf8"));
const example = JSON.parse(fs.readFileSync(path.join(CDIR, "reviews.example.json"), "utf8"));

// --- 1. Kompilierbarkeit ---
check("reviews.schema.json kompiliert (draft 2020-12)", () => {
  mkAjv().compile(reviewsSchema);
  return true;
});
check("consent.schema.json kompiliert (draft 2020-12)", () => {
  mkAjv().compile(consentSchema);
  return true;
});

// --- 2. Fixtures ---
const validIdx = [0, 1, 4];   // static_export, places_api_mit_avatar, leerzustand
const invalidIdx = [2, 3];    // avatar_url ohne status google, unbekanntes Feld

const byName = Object.fromEntries(example.beispiele.map((b) => [b.name, b]));

check("fixture[0] gueltig: statischer Export", () => {
  const v = mkAjv().compile(reviewsSchema);
  return v(byName["gueltig_statischer_export"].daten) === true;
});
check("fixture[1] gueltig: places_api mit ort + avatar google", () => {
  const v = mkAjv().compile(reviewsSchema);
  return v(byName["gueltig_places_api_mit_avatar"].daten) === true;
});
check("fixture[4] gueltig: Leerzustand (reviews: [], leer: true)", () => {
  const v = mkAjv().compile(reviewsSchema);
  return v(byName["gueltig_leerzustand"].daten) === true;
});

// --- 3. Negativfaelle MUESSEN fehlschlagen ---
check("negativ: avatar_url ohne avatar_status 'google' schlaegt fehl", () => {
  const v = mkAjv().compile(reviewsSchema);
  const ok = v(byName["ungueltig_avatar_url_ohne_status_google"].daten);
  return ok === false;
});
check("negativ: unbekanntes Feld 'quelle' schlaegt fehl (additionalProperties)", () => {
  const v = mkAjv().compile(reviewsSchema);
  const ok = v(byName["ungueltig_unbekanntes_feld"].daten);
  return ok === false;
});

// --- 4. Zusatzpruefungen, die der Contract implizit verlangt ---
check("negativ: sterne = 6 schlaegt fehl", () => {
  const v = mkAjv().compile(reviewsSchema);
  const d = JSON.parse(JSON.stringify(byName["gueltig_statischer_export"].daten));
  d.reviews[0].sterne = 6;
  return v(d) === false;
});
check("negativ: datum im falschen Format schlaegt fehl", () => {
  const v = mkAjv().compile(reviewsSchema);
  const d = JSON.parse(JSON.stringify(byName["gueltig_statischer_export"].daten));
  d.reviews[0].datum = "14.08.2026";
  return v(d) === false;
});
check("negativ: avatar_status 'google' ohne avatar_url schlaegt fehl", () => {
  const v = mkAjv().compile(reviewsSchema);
  const d = JSON.parse(JSON.stringify(byName["gueltig_places_api_mit_avatar"].daten));
  d.reviews[0].avatar_url = null;
  return v(d) === false;
});

// --- 5. Consent-Datensatz ---
check("consent: gueltiger Datensatz nach Banner-Interaktion", () => {
  const v = mkAjv().compile(consentSchema);
  return v({
    version: 1,
    entscheidung: "individuell",
    kategorien: { essenziell: true, statistik: false, externe_medien: true },
    zeitstempel: "2026-10-13T19:20:00.000Z",
    methode: "footer-einstellungen",
    textfassung: "2026-10-13.1",
    widerruf_zaehler: 2,
  }) === true;
});
check("negativ: consent ohne 'essenziell' schlaegt fehl (required)", () => {
  const v = mkAjv().compile(consentSchema);
  return v({ version: 1, entscheidung: "abgelehnt", kategorien: { statistik: false }, zeitstempel: "2026-10-13T19:20:00.000Z", methode: "banner-ablehnen", textfassung: "1" }) === false;
});
check("negativ: consent mit essenziell=false schlaegt fehl (const true)", () => {
  const v = mkAjv().compile(consentSchema);
  return v({
    version: 1, entscheidung: "akzeptiert",
    kategorien: { essenziell: false, statistik: true, externe_medien: true },
    zeitstempel: "2026-10-13T19:20:00.000Z", methode: "banner-alle", textfassung: "1",
  }) === false;
});
check("negativ: consent mit unbekannter methode schlaegt fehl", () => {
  const v = mkAjv().compile(consentSchema);
  return v({ version: 1, entscheidung: "akzeptiert", kategorien: { essenziell: true, statistik: false, externe_medien: false }, zeitstempel: "2026-10-13T19:20:00.000Z", methode: "geklaut-aus-plugin", textfassung: "1" }) === false;
});

// --- Report ---
let failed = 0;
for (const r of results) {
  const mark = r.ok ? "PASS" : "FAIL";
  if (!r.ok) failed++;
  console.log(`[${mark}] ${r.name}${r.err ? " :: " + r.err : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} bestanden`);
process.exit(failed === 0 ? 0 : 1);
