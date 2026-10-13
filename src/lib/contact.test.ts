import { describe, expect, it } from "vitest";
import { buildMailText, buildMailto, toContactInput, validateContact } from "./contact";
import { FORM_ERRORS } from "./copy";

const valid = {
  name: "Beispiel",
  email: "name@beispiel.de",
  telefon: "+49 174 2164071",
  nachricht: "Ein Satz, der lang genug ist.",
  einwilligung: true,
};

describe("contact: Validierung", () => {
  it("akzeptiert eine vollstaendige Anfrage", () => {
    const result = validateContact(valid);
    expect(result.ok).toBe(true);
    expect(result.fields).toEqual([]);
  });

  it("meldet jedes Pflichtfeld einzeln", () => {
    const result = validateContact({});
    expect(result.ok).toBe(false);
    expect(result.fields).toEqual(["name", "email", "nachricht", "einwilligung"]);
    expect(result.errors.name).toBe(FORM_ERRORS.name);
    expect(result.errors.email).toBe(FORM_ERRORS.emailEmpty);
    expect(result.errors.nachricht).toBe(FORM_ERRORS.nachrichtEmpty);
    expect(result.errors.einwilligung).toBe(FORM_ERRORS.einwilligung);
  });

  it("unterscheidet formale Fehler mit konkreter Anleitung", () => {
    const result = validateContact({ ...valid, email: "keine-adresse", telefon: "abc" });
    expect(result.errors.email).toBe(FORM_ERRORS.emailInvalid);
    expect(result.errors.telefon).toBe(FORM_ERRORS.telefonInvalid);
  });

  it("verlangt eine Mindestlaenge der Nachricht", () => {
    const result = validateContact({ ...valid, nachricht: "kurz" });
    expect(result.errors.nachricht).toBe(FORM_ERRORS.nachrichtShort);
  });

  it("behandelt Telefon als optional", () => {
    const result = validateContact({ ...valid, telefon: "" });
    expect(result.ok).toBe(true);
  });

  it("trimmt Eingaben und begrenzt Laengen", () => {
    const input = toContactInput({ name: "  A  ", email: "a@b.de", telefon: "", nachricht: "x".repeat(9000), einwilligung: "true" });
    expect(input.name).toBe("A");
    expect(input.nachricht).toHaveLength(5000);
    expect(input.einwilligung).toBe(true);
  });
});

describe("contact: mailto-Fallback", () => {
  it("baut Betreff und Body aus den Feldern", () => {
    const input = toContactInput(valid);
    const mailto = buildMailto("info@ivo-mertsch.de", input);
    expect(mailto.startsWith("mailto:info@ivo-mertsch.de?")).toBe(true);
    expect(decodeURIComponent(mailto)).toContain("Name: Beispiel");
    expect(decodeURIComponent(mailto)).toContain("Telefon: +49 174 2164071");
    expect(decodeURIComponent(mailto)).toContain("Ein Satz, der lang genug ist.");
  });

  it("enthaelt keine IP und keinen User-Agent", () => {
    const text = buildMailText(toContactInput(valid));
    expect(text).not.toMatch(/ip|user-agent|useragent/i);
  });
});
