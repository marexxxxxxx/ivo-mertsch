/**
 * Bewertungs-Client: ergaenzt den serverseitig vorgerenderten Leerzustand um das
 * Laufzeit-Ziel des CTA "Jetzt bei Google bewerten".
 *
 * Der Wert kommt aus der Laufzeit-Env GOOGLE_REVIEW_URL und wird von /api/reviews
 * als Response-Header `X-Google-Review-Url` geliefert (same-origin, kein
 * Cross-Origin-Request, nicht consent-pflichtig). Fehlt der Wert, bleibt der CTA
 * ausgeblendet (ADR §5.4) — kein toter Link.
 */
const cta = document.querySelector<HTMLAnchorElement>("[data-google-review-cta]");

if (cta) {
  void (async () => {
    try {
      const response = await fetch("/api/reviews", {
        headers: { accept: "application/json" },
        credentials: "same-origin",
      });
      const url = response.headers.get("x-google-review-url")?.trim();
      if (url) {
        cta.href = url;
        cta.hidden = false;
      }
    } catch {
      // Kein Ziel erreichbar: CTA bleibt ausgeblendet.
    }
  })();
}
