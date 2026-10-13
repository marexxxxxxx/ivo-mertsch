/**
 * GET /api/reviews — normalisiertes Bewertungsdokument (ADR §5.2, Quelle B).
 * On-demand. Ohne Key liefert die Route { quelle: "static_export", reviews: [] }
 * (bzw. den statischen Export, falls vorhanden) und der Container laeuft weiter.
 * API-Fehler lassen die Seite nie scheitern.
 */
import type { APIRoute } from "astro";
import { buildEmptyDocument } from "../../lib/reviews";
import { getReviewsDocument, readReviewsConfig } from "../../lib/reviews.server";

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const result = await getReviewsDocument();
    return new Response(JSON.stringify(result.document), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        // Der Inhalt ist serverseitig gecacht; der Browser soll Places-Inhalte
        // nicht ueber die TTL hinaus vorhalten (Google-Policy, ADR §5.6).
        "cache-control": "no-store",
        // Laufzeit-Link fuer den CTA im Leerzustand (kein Schema-Feld, deshalb
        // als Header — der Datenvertrag bleibt unveraendert).
        "x-google-review-url": readReviewsConfig().reviewUrl,
      },
    });
  } catch {
    return new Response(JSON.stringify(buildEmptyDocument("static_export")), {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }
};
