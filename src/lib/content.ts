/**
 * Content-Loader — liest die vom Kunden pflegbaren Dateien unter content/.
 *
 * Diese Funktionen laufen zur BUILD-Zeit (vorgerenderte Seiten) und im api/reviews-
 * Fallback zur Laufzeit. Sie duerfen `content/` zur Laufzeit NICHT voraussetzen:
 * das Docker-Image enthaelt nur `dist/` (ADR §8.1). Fehlt eine Datei,
 * greift der jeweilige Leerzustand — nie ein geratener Wert.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildEmptyDocument, normalize, type ReviewsDocument } from "./reviews";

function contentPath(name: string): string {
  return join(process.cwd(), "content", name);
}

export function readContentJson<T>(name: string): T | null {
  try {
    return JSON.parse(readFileSync(contentPath(name), "utf8")) as T;
  } catch {
    return null;
  }
}

export function readContentFile(name: string): string | null {
  try {
    return readFileSync(contentPath(name), "utf8");
  } catch {
    return null;
  }
}

export interface SiteAddress {
  strasse: string;
  plz: string;
  ort: string;
  region: string;
  kreis: string;
  land: string;
  land_code: string;
}

export interface SiteKontakt {
  telefon_anzeige: string;
  telefon_tel: string;
  whatsapp_url: string;
  email: string;
  /** "bestaetigt" seit Kundenantwort 950f0d46 (loest OP-1 ab). */
  email_status: string;
  email_quelle?: string;
}

export interface SiteConfig {
  firma: {
    anzeige_name: string;
    claim: string;
    rechtsform: string;
    inhaber: string;
    marke: string;
  };
  adresse: SiteAddress;
  kontakt: SiteKontakt;
  instagram: { url: string; hinweis: string };
  reviews: {
    attribution_text: string;
    attribution_translate: string;
    cta_label: string;
    cta_url_env: string;
    /** Statisches CTA-Ziel aus content/site.json (Kundenantwort 950f0d46, loest OP-2 ab). */
    cta_url: string;
    cta_url_status: string;
    cta_url_quelle?: string;
    cta_url_typ?: string;
    /** "nein" = kein Places-API-Abruf, rein statischer Pfad (Kundenantwort 950f0d46, OP-11). */
    places_api: string;
    places_api_hinweis?: string;
  };
  beschaffung: { hosting: string; bilder: string[]; logo: string };
}

const SITE_FALLBACK: SiteConfig = {
  firma: {
    anzeige_name: "Ivo Mertsch",
    claim: "Handwerk aus Leidenschaft",
    rechtsform: "Einzelunternehmen",
    inhaber: "Ivo Marco Mertsch",
    marke: "Ivo Mertsch Design",
  },
  adresse: {
    strasse: "Niederdossenbach 1",
    plz: "79739",
    ort: "Schwörstadt",
    region: "Baden",
    kreis: "Landkreis Waldshut",
    land: "Deutschland",
    land_code: "DE",
  },
  kontakt: {
    telefon_anzeige: "+49 174 2164071",
    telefon_tel: "+491742164071",
    whatsapp_url: "https://wa.me/491742164071",
    email: "info@ivo-mertsch.de",
    email_status: "bestaetigt",
    email_quelle: "Kundenantwort Interaktion 950f0d46 (2026-10-14). Loest OP-1 ab.",
  },
  instagram: {
    url: "https://www.instagram.com/ivomertsch_hal/",
    hinweis: "Reiner Hyperlink, kein eingebettetes Plugin (keine Datenuebertragung vor Klick).",
  },
  reviews: {
    attribution_text: "Bewertungen von Google Maps",
    attribution_translate: "no",
    cta_label: "Jetzt bei Google bewerten",
    cta_url_env: "GOOGLE_REVIEW_URL",
    cta_url: "https://maps.app.goo.gl/4w3i7sVLrrs8di5v9",
    cta_url_status: "bestaetigt",
    cta_url_quelle: "Kundenantwort Interaktion 950f0d46 (2026-10-14). Loest OP-2 ab.",
    cta_url_typ: "Google-Maps-Profil-Link (statisch verlinkt; keine Places-API)",
    places_api: "nein",
    places_api_hinweis: "Kundenantwort Interaktion 950f0d46 (OP-11): keine Places-API, rein statischer Pfad.",
  },
  beschaffung: {
    hosting: "eigener Docker-Container, keine Drittanbieter-Ressource vor Consent",
    bilder: ["foto3.png", "foto6.png", "foto7.png", "foto8.png", "foto9.png", "foto10.png", "foto11.png"],
    logo: "logo_ivo.jpeg",
  },
};

/** Stammdaten aus content/site.json; falls die Datei fehlt, der belegte Sollstand. */
export function getSite(): SiteConfig {
  const site = readContentJson<Partial<SiteConfig>>("site.json");
  if (!site) return SITE_FALLBACK;
  return {
    ...SITE_FALLBACK,
    ...site,
    firma: { ...SITE_FALLBACK.firma, ...site.firma },
    adresse: { ...SITE_FALLBACK.adresse, ...site.adresse },
    kontakt: { ...SITE_FALLBACK.kontakt, ...site.kontakt },
    instagram: { ...SITE_FALLBACK.instagram, ...site.instagram },
    reviews: { ...SITE_FALLBACK.reviews, ...site.reviews },
    beschaffung: { ...SITE_FALLBACK.beschaffung, ...site.beschaffung },
  };
}

/**
 * Statischer Bewertungs-Export (Quelle A). Wird durch dieselbe `normalize()`
 * geschickt wie die Places-Antwort (ADR §5.3). Fehlt die Datei oder ist sie
 * leer, ergibt sich der verbindliche Leerzustand.
 */
export function readStaticReviews(now?: string): ReviewsDocument {
  const raw = readContentJson<Record<string, unknown>>("reviews.json");
  if (!raw) return buildEmptyDocument("static_export", { now });
  return normalize(raw, { quelle: "static_export", now });
}

export interface SchemaOrgNode {
  "@type": string | string[];
  "@id": string;
  [key: string]: unknown;
}

/** JSON-LD-Bausteine aus content/schema-org.jsonld. */
export function getSchemaNodes(): SchemaOrgNode[] {
  return readContentJson<SchemaOrgNode[]>("schema-org.jsonld") ?? [];
}

export function findSchemaNode(predicate: (node: SchemaOrgNode) => boolean): SchemaOrgNode | null {
  return getSchemaNodes().find(predicate) ?? null;
}

export function hasType(node: SchemaOrgNode, type: string): boolean {
  return Array.isArray(node["@type"]) ? node["@type"].includes(type) : node["@type"] === type;
}
