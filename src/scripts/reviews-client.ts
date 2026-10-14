/**
 * Bewertungs-Client: ueberschreibt das statische CTA-Ziel des Buttons
 * "Jetzt bei Google bewerten" mit einem zur Laufzeit gesetzten GOOGLE_REVIEW_URL.
 *
 * Der statische Standard steht in content/site.json (`reviews.cta_url`) und ist
 * serverseitig gerendert. Der Laufzeitwert kommt aus der Env GOOGLE_REVIEW_URL und
 * wird von /api/reviews als Response-Header `X-Google-Review-Url` geliefert
 * (same-origin, kein Cross-Origin-Request, nicht consent-pflichtig). Fehlt der
 * Wert, bleibt das statische Ziel unveraendert; ist auch kein statisches Ziel
 * gesetzt, bleibt der CTA ausgeblendet (ADR §5.4) — kein toter Link.
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
