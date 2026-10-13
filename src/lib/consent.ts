/**
 * Consent-Logik — reine Funktionen, kein DOM, kein Storage-Zugriff.
 *
 * Vertrag: docs/contracts/consent.schema.json und ADR 0001 §4.
 * Speicher: ausschliesslich localStorage['pixelforge.consent.v1'].
 *
 * Dieses Modul ist absichtlich frei von window/localStorage, damit es
 *   (a) in Vitest ohne DOM getestet werden kann und
 *   (b) im Client-Script nur als duenne Huelle mit echtem Storage dient.
 * Die Versionsaenderung erzeugt einen neuen Schluessel (v1 -> v2), nie eine
 * Umdeutung alter Felder (ADR §4.3).
 */

export const CONSENT_STORAGE_KEY = "pixelforge.consent.v1";
export const CONSENT_VERSION = 1;
/** Textfassung der Banner-/Datenschutztexte (MARAA-3). Bei Textaenderung erhoehen. */
export const CONSENT_TEXT_VERSION = "2026-10-13.1";

export const CONSENT_CATEGORIES = ["essenziell", "statistik", "externe_medien"] as const;
export type ConsentCategory = (typeof CONSENT_CATEGORIES)[number];

export const OPTIONAL_CATEGORIES = ["statistik", "externe_medien"] as const;
export type OptionalCategory = (typeof OPTIONAL_CATEGORIES)[number];

export const GATE_CATEGORIES = ["statistik", "externe_medien"] as const;
export type GateCategory = (typeof GATE_CATEGORIES)[number];

export type ConsentDecisionStatus = "unbekannt" | "akzeptiert" | "abgelehnt" | "individuell";

export const CONSENT_METHODS = [
  "initial",
  "banner-alle",
  "banner-ablehnen",
  "banner-individuell",
  "footer-einstellungen",
] as const;
export type ConsentMethod = (typeof CONSENT_METHODS)[number];

export interface ConsentCategories {
  essenziell: true;
  statistik: boolean;
  externe_medien: boolean;
}

export interface ConsentRecord {
  version: typeof CONSENT_VERSION;
  entscheidung: ConsentDecisionStatus;
  kategorien: ConsentCategories;
  zeitstempel: string;
  methode: ConsentMethod;
  textfassung: string;
  widerruf_zaehler?: number;
}

/** Default im Zustand „unbekannt": optional alles aus (ADR §4.1). */
export function defaultCategories(): ConsentCategories {
  return { essenziell: true, statistik: false, externe_medien: false };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMethod(value: unknown): value is ConsentMethod {
  return typeof value === "string" && (CONSENT_METHODS as readonly string[]).includes(value);
}

function isDecision(value: unknown): value is ConsentDecisionStatus {
  return (
    value === "unbekannt" ||
    value === "akzeptiert" ||
    value === "abgelehnt" ||
    value === "individuell"
  );
}

function isIsoDateTime(value: unknown): value is string {
  return typeof value === "string" && value.length >= 10 && Number.isFinite(Date.parse(value));
}

/**
 * Strenge Ruecklesepruefung des Consent-Datensatzes.
 * Ein fremder, alter oder manipulierter Datensatz ergibt `null` — und damit
 * den Zustand „unbekannt", nie eine stille Einwilligung.
 */
export function parseConsent(raw: unknown): ConsentRecord | null {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!isRecord(value)) return null;
  if (value.version !== CONSENT_VERSION) return null;
  if (!isDecision(value.entscheidung)) return null;
  if (!isMethod(value.methode)) return null;
  if (!isIsoDateTime(value.zeitstempel)) return null;
  if (typeof value.textfassung !== "string" || value.textfassung.length < 1 || value.textfassung.length > 40) {
    return null;
  }
  const kategorien = value.kategorien;
  if (!isRecord(kategorien)) return null;
  if (kategorien.essenziell !== true) return null;
  if (typeof kategorien.statistik !== "boolean") return null;
  if (typeof kategorien.externe_medien !== "boolean") return null;

  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    entscheidung: value.entscheidung,
    kategorien: {
      essenziell: true,
      statistik: kategorien.statistik,
      externe_medien: kategorien.externe_medien,
    },
    zeitstempel: value.zeitstempel,
    methode: value.methode,
    textfassung: value.textfassung,
  };
  if (
    typeof value.widerruf_zaehler === "number" &&
    Number.isInteger(value.widerruf_zaehler) &&
    value.widerruf_zaehler >= 0
  ) {
    record.widerruf_zaehler = value.widerruf_zaehler;
  }
  return record;
}

export function serializeConsent(record: ConsentRecord): string {
  return JSON.stringify(record);
}

export interface CreateRecordOptions {
  entscheidung: ConsentDecisionStatus;
  kategorien: ConsentCategories;
  methode: ConsentMethod;
  zeitstempel?: string;
  widerruf_zaehler?: number;
  textfassung?: string;
}

export function createRecord(options: CreateRecordOptions): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    entscheidung: options.entscheidung,
    kategorien: { ...options.kategorien, essenziell: true },
    zeitstempel: options.zeitstempel ?? new Date().toISOString(),
    methode: options.methode,
    textfassung: options.textfassung ?? CONSENT_TEXT_VERSION,
  };
  if (typeof options.widerruf_zaehler === "number") {
    record.widerruf_zaehler = options.widerruf_zaehler;
  }
  return record;
}

export function isDecided(record: ConsentRecord | null): boolean {
  return record !== null && record.entscheidung !== "unbekannt";
}

/** Ein Gate gilt genau dann als offen, wenn die Kategorie eingewilligt ist. */
export function isGranted(record: ConsentRecord | null, category: GateCategory): boolean {
  if (!record) return false;
  return record.kategorien[category] === true;
}

/**
 * Leitet den Gesamtstatus aus den Kategorien ab.
 * Alle optionalen an -> "akzeptiert"; alle optionalen aus -> "abgelehnt";
 * sonst "individuell" (ADR §4.1 / consent.schema.json).
 */
export function decisionFromCategories(kategorien: ConsentCategories): ConsentDecisionStatus {
  const values = OPTIONAL_CATEGORIES.map((key) => kategorien[key]);
  if (values.every((value) => value === true)) return "akzeptiert";
  if (values.every((value) => value === false)) return "abgelehnt";
  return "individuell";
}

export interface DecideInput {
  kategorien: ConsentCategories;
  methode: ConsentMethod;
  zeitstempel?: string;
}

/**
 * Erzeugt den naechsten Consent-Datensatz.
 * Widerruf ist gleichwertig zur Erteilung: die neue Entscheidung wird gesetzt,
 * nicht geloescht. Der Zaehler waechst nur bei echter Aenderung.
 */
export function decide(current: ConsentRecord | null, input: DecideInput): ConsentRecord {
  const kategorien: ConsentCategories = { ...input.kategorien, essenziell: true };
  const entscheidung = decisionFromCategories(kategorien);
  const changed =
    current === null ||
    current.kategorien.statistik !== kategorien.statistik ||
    current.kategorien.externe_medien !== kategorien.externe_medien ||
    current.entscheidung !== entscheidung;
  const previousCount = current?.widerruf_zaehler ?? 0;
  return createRecord({
    entscheidung,
    kategorien,
    methode: input.methode,
    zeitstempel: input.zeitstempel,
    widerruf_zaehler: changed ? previousCount + 1 : previousCount,
  });
}

export interface ConsentStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function readConsent(storage: ConsentStorageLike): ConsentRecord | null {
  try {
    return parseConsent(storage.getItem(CONSENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeConsent(storage: ConsentStorageLike, record: ConsentRecord): void {
  storage.setItem(CONSENT_STORAGE_KEY, serializeConsent(record));
}
