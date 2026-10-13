/**
 * Mailversand fuer das Kontaktformular — NUR von `output: 'server'`-Routen nutzen.
 * Vertrag: ADR 0001 §6. SMTP ist optional; fehlt die Konfiguration, greift der
 * mailto-Fallback (siehe ContactForm). Fehler erreichen den Client nie als Detail.
 */
import { buildMailText, type ContactInput } from "./contact";

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  mailTo: string;
  from: string;
}

export type EnvLike = Record<string, string | undefined>;

export type SmtpStatus = "ok" | "unconfigured" | "error";

/** Ist SMTP vollstaendig konfiguriert? Fehlt MAIL_TO, ist kein Versand moeglich. */
export function readSmtpConfig(env: EnvLike = process.env): SmtpConfig | null {
  const host = env.SMTP_HOST ?? "";
  const mailTo = env.MAIL_TO ?? "";
  if (host === "" || mailTo === "") return null;
  const port = Number(env.SMTP_PORT ?? 587);
  const user = env.SMTP_USER ?? "";
  const pass = env.SMTP_PASS ?? "";
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    secure: port === 465,
    user,
    pass,
    mailTo,
    from: user !== "" ? user : "website@ivo-mertsch.de",
  };
}

export function smtpStatus(env: EnvLike = process.env): SmtpStatus {
  const config = readSmtpConfig(env);
  if (!config) return "unconfigured";
  return config.pass === "" ? "error" : "ok";
}

export interface SendResult {
  messageId: string;
}

/**
 * Versendet die Kontaktanfrage per SMTP.
 * Wirft bei Fehlern; der Aufrufer uebersetzt das in einen 5xx-Code ohne Details.
 */
export async function sendContactMail(
  config: SmtpConfig,
  input: ContactInput,
): Promise<SendResult> {
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.default.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.user !== "" ? { user: config.user, pass: config.pass } : undefined,
  });
  const subject = `Website-Anfrage: ${input.name}`;
  const info = await transport.sendMail({
    from: config.from,
    to: config.mailTo,
    replyTo: input.email,
    subject,
    text: buildMailText(input),
  });
  return { messageId: info.messageId };
}
