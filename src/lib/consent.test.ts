import { describe, expect, it } from "vitest";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_TEXT_VERSION,
  CONSENT_VERSION,
  createRecord,
  decide,
  decisionFromCategories,
  defaultCategories,
  isDecided,
  isGranted,
  parseConsent,
  readConsent,
  serializeConsent,
  writeConsent,
  type ConsentStorageLike,
} from "./consent";

function memoryStorage(initial: Record<string, string> = {}): ConsentStorageLike & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? (data[key] ?? null) : null),
    setItem: (key, value) => {
      data[key] = value;
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

describe("consent: Schema und Ruecklesepruefung", () => {
  it("legt einen gueltigen Ausgangsdatensatz an", () => {
    const record = createRecord({
      entscheidung: "abgelehnt",
      kategorien: defaultCategories(),
      methode: "banner-ablehnen",
      zeitstempel: "2026-10-13T10:00:00.000Z",
    });
    expect(record.version).toBe(CONSENT_VERSION);
    expect(record.kategorien.essenziell).toBe(true);
    expect(record.textfassung).toBe(CONSENT_TEXT_VERSION);
    expect(parseConsent(serializeConsent(record))).toEqual(record);
  });

  it.each([
    ["null", null],
    ["leerer String", ""],
    ["fremde Version", JSON.stringify({ version: 2 })],
    ["unbekannte Methode", JSON.stringify({ ...validRecord(), methode: "geklaut" })],
    ["essenziell false", JSON.stringify({ ...validRecord(), kategorien: { essenziell: false, statistik: false, externe_medien: false } })],
    ["kein Zeitstempel", JSON.stringify({ ...validRecord(), zeitstempel: "gestern" })],
    ["unbekannte Entscheidung", JSON.stringify({ ...validRecord(), entscheidung: "vielleicht" })],
    ["kein Objekt", JSON.stringify([1, 2, 3])],
  ])("verwirft ungueltigen Datensatz: %s", (_label, raw) => {
    expect(parseConsent(raw)).toBeNull();
  });

  it("liest nur den vertraglichen Schluessel und ergaenzt keine Felder", () => {
    const storage = memoryStorage({
      [CONSENT_STORAGE_KEY]: JSON.stringify({ ...validRecord(), zusatz: "profiling" }),
    });
    const record = readConsent(storage);
    expect(record).not.toBeNull();
    expect(record && "zusatz" in record).toBe(false);
  });
});

describe("consent: Entscheidungslogik", () => {
  it("leitet den Gesamtstatus aus den Kategorien ab", () => {
    expect(decisionFromCategories({ essenziell: true, statistik: true, externe_medien: true })).toBe("akzeptiert");
    expect(decisionFromCategories({ essenziell: true, statistik: false, externe_medien: false })).toBe("abgelehnt");
    expect(decisionFromCategories({ essenziell: true, statistik: true, externe_medien: false })).toBe("individuell");
  });

  it("erhoeht den Widerruf-Zaehler nur bei echter Aenderung", () => {
    const first = decide(null, {
      kategorien: { essenziell: true, statistik: false, externe_medien: false },
      methode: "banner-ablehnen",
      zeitstempel: "2026-10-13T10:00:00.000Z",
    });
    expect(first.widerruf_zaehler).toBe(1);

    const sameAgain = decide(first, {
      kategorien: { essenziell: true, statistik: false, externe_medien: false },
      methode: "footer-einstellungen",
      zeitstempel: "2026-10-13T11:00:00.000Z",
    });
    expect(sameAgain.widerruf_zaehler).toBe(1);

    const changed = decide(sameAgain, {
      kategorien: { essenziell: true, statistik: true, externe_medien: false },
      methode: "banner-individuell",
      zeitstempel: "2026-10-13T12:00:00.000Z",
    });
    expect(changed.widerruf_zaehler).toBe(2);
    expect(changed.entscheidung).toBe("individuell");
    expect(changed.methode).toBe("banner-individuell");
  });

  it("setzt den Datensatz bei Widerruf, loescht ihn nicht", () => {
    const storage = memoryStorage();
    const granted = decide(null, {
      kategorien: { essenziell: true, statistik: true, externe_medien: true },
      methode: "banner-alle",
      zeitstempel: "2026-10-13T10:00:00.000Z",
    });
    writeConsent(storage, granted);

    const revoked = decide(readConsent(storage), {
      kategorien: { essenziell: true, statistik: false, externe_medien: false },
      methode: "footer-einstellungen",
      zeitstempel: "2026-10-13T13:00:00.000Z",
    });
    writeConsent(storage, revoked);

    const persisted = readConsent(storage);
    expect(persisted?.entscheidung).toBe("abgelehnt");
    expect(persisted?.methode).toBe("footer-einstellungen");
    expect(persisted?.widerruf_zaehler).toBe(2);
  });
});

describe("consent: Gate-Praedikat", () => {
  it("ist vor jeder Entscheidung geschlossen", () => {
    const record = createRecord({
      entscheidung: "unbekannt",
      kategorien: defaultCategories(),
      methode: "initial",
      zeitstempel: "2026-10-13T10:00:00.000Z",
    });
    expect(isDecided(record)).toBe(false);
    expect(isGranted(record, "externe_medien")).toBe(false);
    expect(isGranted(record, "statistik")).toBe(false);
  });

  it("oeffnet nur die eingewilligte Kategorie", () => {
    const record = createRecord({
      entscheidung: "individuell",
      kategorien: { essenziell: true, statistik: false, externe_medien: true },
      methode: "banner-individuell",
      zeitstempel: "2026-10-13T10:00:00.000Z",
    });
    expect(isGranted(record, "externe_medien")).toBe(true);
    expect(isGranted(record, "statistik")).toBe(false);
  });

  it("behandelt fehlenden Datensatz als nicht eingewilligt", () => {
    expect(isGranted(null, "externe_medien")).toBe(false);
    expect(isDecided(null)).toBe(false);
  });
});

function validRecord() {
  return {
    version: 1,
    entscheidung: "individuell",
    kategorien: { essenziell: true, statistik: false, externe_medien: true },
    zeitstempel: "2026-10-13T19:20:00.000Z",
    methode: "footer-einstellungen",
    textfassung: "2026-10-13.1",
    widerruf_zaehler: 2,
  };
}
