/**
 * Kontaktformular — Validierung (client + server teilen diese Funktion).
 * Vertrag: ADR 0001 §6 (Antwortvertrag), content/micro-ux-consent.md.
 * Minimale Datenerhebung: name, email, nachricht (Pflicht), telefon (optional),
 * Einwilligungs-Checkbox. Kein Adressfeld, kein Betreff, keine Newsletter-Option.
 */
import { FORM_ERRORS } from "./copy";

export const CONTACT_FIELDS = ["name", "email", "telefon", "nachricht", "einwilligung"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export interface ContactInput {
  name: string;
  email: string;
  telefon: string;
  nachricht: string;
  einwilligung: boolean;
}

export type ContactErrors = Partial<Record<ContactField, string>>;

export interface ContactValidation {
  ok: boolean;
  fields: ContactField[];
  errors: ContactErrors;
}

export const CONTACT_LIMITS = {
  nameMax: 120,
  emailMax: 200,
  telefonMax: 40,
  nachrichtMin: 10,
  nachrichtMax: 5000,
} as const;

// Bewusst einfach gehalten: eine Adresse mit genau einem @, Punkt in der Domain.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Zahlen, Leerzeichen, Klammern, Bindestrich, Schraegstrich, fuehrendes +.
const PHONE_PATTERN = /^[+]?[0-9()\s/-]{5,}$/;

function asTrimmed(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

/** Normalisiert Rohdaten (JSON oder FormData) auf ContactInput. */
export function toContactInput(raw: Record<string, unknown>): ContactInput {
  return {
    name: asTrimmed(raw.name, CONTACT_LIMITS.nameMax),
    email: asTrimmed(raw.email, CONTACT_LIMITS.emailMax),
    telefon: asTrimmed(raw.telefon, CONTACT_LIMITS.telefonMax),
    nachricht: asTrimmed(raw.nachricht, CONTACT_LIMITS.nachrichtMax),
    einwilligung: raw.einwilligung === true || raw.einwilligung === "true" || raw.einwilligung === "on",
  };
}

export function validateContact(raw: Record<string, unknown>): ContactValidation {
  const input = toContactInput(raw);
  const errors: ContactErrors = {};
  const fields: ContactField[] = [];

  if (input.name.length === 0) {
    errors.name = FORM_ERRORS.name;
    fields.push("name");
  }
  if (input.email.length === 0) {
    errors.email = FORM_ERRORS.emailEmpty;
    fields.push("email");
  } else if (!EMAIL_PATTERN.test(input.email)) {
    errors.email = FORM_ERRORS.emailInvalid;
    fields.push("email");
  }
  if (input.telefon.length > 0 && !PHONE_PATTERN.test(input.telefon)) {
    errors.telefon = FORM_ERRORS.telefonInvalid;
    fields.push("telefon");
  }
  if (input.nachricht.length === 0) {
    errors.nachricht = FORM_ERRORS.nachrichtEmpty;
    fields.push("nachricht");
  } else if (input.nachricht.length < CONTACT_LIMITS.nachrichtMin) {
    errors.nachricht = FORM_ERRORS.nachrichtShort;
    fields.push("nachricht");
  }
  if (!input.einwilligung) {
    errors.einwilligung = FORM_ERRORS.einwilligung;
    fields.push("einwilligung");
  }

  return { ok: fields.length === 0, fields, errors };
}

/** Fehlercodes des Antwortvertrags (ADR §6.4). */
export type ContactErrorCode = "validation" | "rate_limited" | "mail_not_configured" | "server_error";

export interface ContactSuccessResponse {
  ok: true;
  messageId: string;
}

export interface ContactErrorResponse {
  ok: false;
  error: ContactErrorCode;
  fields?: ContactField[];
  retryAfterSeconds?: number;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

/**
 * Baut die mailto-Ersatzadresse fuer den Fall ohne SMTP-Config (ADR §6.1).
 * Der Adresswert ist der sichtbare Wert aus content/site.json.
 */
export function buildMailto(to: string, input: ContactInput): string {
  const subject = `Anfrage über die Website${input.name ? ` — ${input.name}` : ""}`;
  const body = [
    `Name: ${input.name}`,
    `E-Mail: ${input.email}`,
    input.telefon ? `Telefon: ${input.telefon}` : null,
    "",
    input.nachricht,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Text der Kontakt-Mail. Keine IP, kein User-Agent, nur die Formularfelder. */
export function buildMailText(input: ContactInput): string {
  return [
    "Neue Kontaktanfrage über die Website",
    "",
    `Name:    ${input.name}`,
    `E-Mail:  ${input.email}`,
    `Telefon: ${input.telefon || "—"}`,
    "",
    "Nachricht:",
    input.nachricht,
  ].join("\n");
}
