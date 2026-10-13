/**
 * POST /api/contact — Kontaktformular (ADR §6).
 * Same-origin, serverseitig, ohne Drittanbieter und ohne Captcha.
 * Spam-Schutz: Honeypot + Zeitfalle + Rate-Limit (kein Captcha).
 * Antwortvertrag: siehe ADR §6.4. Nie Stacktraces oder SMTP-Details zum Client.
 */
import type { APIRoute } from "astro";
import {
  toContactInput,
  validateContact,
  type ContactErrorResponse,
  type ContactSuccessResponse,
} from "../../lib/contact";
import { readSmtpConfig, sendContactMail } from "../../lib/mail.server";
import { RateLimiter } from "../../lib/rate-limit";
import { getSite } from "../../lib/content";

export const prerender = false;

const HONEYPOT_FIELD = "firma";
const TIMESTAMP_FIELD = "_ts";

function numberFromEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

const limiter = new RateLimiter({
  max: numberFromEnv(process.env.CONTACT_RATE_LIMIT_MAX, 5),
  windowSeconds: numberFromEnv(process.env.CONTACT_RATE_LIMIT_WINDOW_S, 600),
});

function clientKey(request: Request, clientAddress: string | undefined): string {
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return clientAddress ?? "unknown";
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

async function readPayload(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const parsed: unknown = await request.json();
      return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  try {
    const form = await request.formData();
    const out: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) out[key] = typeof value === "string" ? value : "";
    return out;
  } catch {
    return {};
  }
}

/** Minimaler HTML-Fallback fuer native Formular-Posts (z. B. ohne JavaScript). */
function mailtoHtml(mailto: string, mailAddress: string): Response {
  const html = `<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>Anfrage per E-Mail senden</title></head>
<body style="font-family:system-ui;margin:2rem;line-height:1.5">
<h1>Anfrage per E-Mail senden</h1>
<p>Der direkte Formularversand ist auf diesem Server nicht eingerichtet. Bitte senden Sie die Nachricht per E-Mail.</p>
<p><a href="${mailto.replace(/"/g, "&quot;")}">E-Mail-Programm mit Ihrer Anfrage öffnen</a></p>
<p>Oder schreiben Sie an: ${mailAddress}</p>
</body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const accept = request.headers.get("accept") ?? "";
  const wantsJson = accept.includes("application/json");
  const payload = await readPayload(request);

  // 1) Honeypot: gefuellt => Bot. Wir antworten wie bei Erfolg, verarbeiten aber nicht.
  const honeypot = String(payload[HONEYPOT_FIELD] ?? "").trim();
  if (honeypot !== "") {
    return wantsJson
      ? json({ ok: true, messageId: "ignored" } satisfies ContactSuccessResponse, 200)
      : json({ ok: true, messageId: "ignored" }, 200);
  }

  // 2) Zeitfalle: fehlt der Zeitstempel (kein JS) -> nicht erzwingen, sonst Minimum pruefen.
  const minimumFill = numberFromEnv(process.env.CONTACT_MIN_FILL_SECONDS, 3);
  const rawTimestamp = payload[TIMESTAMP_FIELD];
  const timestamp = typeof rawTimestamp === "number" ? rawTimestamp : Number(rawTimestamp);
  if (Number.isFinite(timestamp) && timestamp > 0) {
    const elapsed = (Date.now() - timestamp) / 1000;
    if (elapsed < minimumFill) {
      return json(
        { ok: false, error: "validation", fields: ["nachricht"] } satisfies ContactErrorResponse,
        400,
      );
    }
  }

  // 3) Rate-Limit pro IP.
  const limit = limiter.check(clientKey(request, clientAddress));
  if (!limit.allowed) {
    return json(
      {
        ok: false,
        error: "rate_limited",
        retryAfterSeconds: limit.retryAfterSeconds,
      } satisfies ContactErrorResponse,
      429,
    );
  }

  // 4) Validierung.
  const validation = validateContact(payload);
  if (!validation.ok) {
    return json(
      { ok: false, error: "validation", fields: validation.fields } satisfies ContactErrorResponse,
      400,
    );
  }

  const input = toContactInput(payload);
  const smtp = readSmtpConfig(process.env);

  if (!smtp) {
    // Kein SMTP -> mailto-Fallback. Fuer JSON-Clients signalisiert der Code den
    // Umschaltpunkt; fuer native Posts liefern wir eine HTML-Seite mit mailto-Link.
    if (!wantsJson) {
      const site = getSite();
      const { buildMailto } = await import("../../lib/contact");
      return mailtoHtml(buildMailto(site.kontakt.email, input), site.kontakt.email);
    }
    return json({ ok: false, error: "mail_not_configured" } satisfies ContactErrorResponse, 503);
  }

  try {
    const result = await sendContactMail(smtp, input);
    return json({ ok: true, messageId: result.messageId } satisfies ContactSuccessResponse, 200);
  } catch (error) {
    // Nur der Statuscode geht nach aussen; Details ausschliesslich ins Server-Log.
    console.error("[contact] SMTP-Versand fehlgeschlagen:", error instanceof Error ? error.message : "unbekannt");
    return json({ ok: false, error: "server_error" } satisfies ContactErrorResponse, 502);
  }
};

/** Alles ausser POST auf dieser Route ist 405. */
export const ALL: APIRoute = () =>
  new Response(JSON.stringify({ ok: false, error: "method_not_allowed" }), {
    status: 405,
    headers: { "content-type": "application/json; charset=utf-8", allow: "POST" },
  });
