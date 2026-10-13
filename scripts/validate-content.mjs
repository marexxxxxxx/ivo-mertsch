/**
 * Build-Gate (ADR §9.2): content/reviews.json wird beim Build gegen
 * docs/contracts/reviews.schema.json validiert. Ungueltige Datensaetze sind ein
 * BUILD-FEHLER, keine stille Anzeige — ein falsches Feld darf nicht auf die
 * Produktions-Site gelangen (ADR §5.2).
 *
 * Laeuft als `prebuild` (npm run build) und separat ueber `npm run contracts`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), "utf8"));
}

const ajv = new Ajv2020({ strict: false, allErrors: true });
addFormats(ajv);

const schema = readJson("docs/contracts/reviews.schema.json");
const validate = ajv.compile(schema);

let failed = false;

// 1) Statischer Export des Kunden.
try {
  const document = readJson("content/reviews.json");
  if (!validate(document)) {
    failed = true;
    console.error("[FAIL] content/reviews.json verletzt reviews.schema.json:");
    for (const error of validate.errors ?? []) {
      console.error(`       ${error.instancePath || "/"} ${error.message ?? ""}`);
    }
  } else {
    console.log(
      `[PASS] content/reviews.json gueltig (${document.reviews.length} Bewertung(en), leer=${String(document.leer)})`,
    );
  }
} catch (error) {
  failed = true;
  console.error(`[FAIL] content/reviews.json nicht lesbar/parsebar: ${String(error)}`);
}

// 2) Stammdaten muessen lesbar sein (sonst rendert die Seite Fallback-Werte).
try {
  const site = readJson("content/site.json");
  if (!site?.kontakt?.telefon_tel || !site?.adresse?.ort) {
    failed = true;
    console.error("[FAIL] content/site.json: Pflichtfelder kontakt.telefon_tel/adresse.ort fehlen.");
  } else {
    console.log("[PASS] content/site.json lesbar");
  }
} catch (error) {
  failed = true;
  console.error(`[FAIL] content/site.json nicht lesbar/parsebar: ${String(error)}`);
}

if (failed) {
  console.error("\nBuild abgebrochen: Content verletzt den Datenvertrag (ADR 0001 §5.2).");
  process.exit(1);
}
console.log("\nContent-Validierung bestanden.");
