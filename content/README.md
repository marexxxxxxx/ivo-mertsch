# Content-Pack — Ivo Mertsch Relaunch (MARAA-3)

Vollständiger Texte-, SEO- und Schema-Baustein für die neue Website. Grundlage
ausschließlich: der Live-Auftritt <https://ivo-mertsch.de/> (abgerufen 2026-10-13),
die CEO-Discovery in MARAA-1 (`docs/discovery/00-kundenbriefing-und-befund.md`),
das Kundenbriefing sowie die bestätigten Kundenantworten aus Interaktion
`950f0d46` (2026-10-14). **Keine erfundenen Fakten, Zahlen, Kunden oder
Bewertungen.**

## Stimme (verbindlich für alle Texte)

Drei Wörter, die die Stimme beschreiben:

- **handwerklich** — konkret, materiell, vom Macher geschrieben
- **präzise** — genau das, was stimmt; kein „einzigartig", kein „exklusiv"
- **verbindlich** — direkte Ansprache, klare nächste Schritte, keine Floskeln

Drei Wörter, die sie ausschließen:

- **marktschreierisch** — keine Superlative, keine Kundengewinn-Rhetorik
- **floskelhaft** — keine „Lösungen", „Konzepte", „ganzheitlich"
- **unpersönlich** — kein Behördendeutsch, kein Agentur-Anonymus

Verbotene Wörter (Signale dafür, dass noch nichts gesagt wurde):
„revolutionär", „innovativ", „bahnbrechend", „lösungsorientiert", „ganzheitlich",
„synergistisch". Diese Wörter kommen im Pack nicht vor.

Anrede: **Sie** (Höflichkeitsform, konsistent — nie Mischung aus „du" und „Sie").

## Marker (in allen Dateien verwendet)

| Marker | Bedeutung |
|---|---|
| `[OFFENER KUNDENPUNKT: …]` | Kundenantwort nötig, keine Annahme treffen |
| `[FREIGABE NÖTIG: …]` | Text steht, darf erst nach Bestätigung live gehen |
| `[PRÜFUNG: …]` | QA-/Frontend-Check vor Livegang |

Vollständige Liste: `content/offene-kundenpunkte.md`.

## Dateien

| Datei | Inhalt |
|---|---|
| `informationsarchitektur.md` | Seitenstruktur + Begründung je Seite |
| `site.json` | Stammdaten (Firma, Adresse, Kontakt, E-Mail, Instagram) — zentrale Quelle |
| `start.md` | Startseite |
| `leistungen.md` | Sammelseite Leistungen |
| `leistungen-fugenlose-baeder.md` | Leistungsseite 1 |
| `leistungen-fugenlose-boeden.md` | Leistungsseite 2 |
| `leistungen-innenausbau.md` | Leistungsseite 3 |
| `leistungen-fassaden.md` | Leistungsseite 4 |
| `ueber-uns.md` | Über uns / Arbeitsweise |
| `bewertungen.md` | Google-Bewertungen — beide Zustände |
| `kontakt.md` | Kontaktseite + Formular-Logik |
| `micro-ux-consent.md` | Labels, Fehler, Leer-/Lade-/Erfolgstexte, Consent-Banner |
| `impressum.md` | Impressum (§ 5 DDG) |
| `datenschutzerklaerung.md` | Datenschutzerklärung (neu, dokumentiert) |
| `seo-meta.md` | Title, Description, OG, Canonical, Keywords |
| `schema-org.jsonld` | JSON-LD-Bausteine |
| `reviews.json` | Datenquelle der Bewertungs-Sektion (Leerzustand; keine Places-API) |
| `ki-bildhinweis.md` | KI-Transparenz: finaler Wortlaut, Alt-Texte, Caption-/UWG-Regeln (ADR 0002) |
| `bild-provenienz.json` | Provenienz-Akte der KI-Bilder (ADR 0002, §5.2) |
| `offene-kundenpunkte.md` | nummerierte Kundenpunkte |

Dateinamen ohne Umlaute (ASCII), damit Build, Router und Git keine
Kodierungs-Sonderfälle produzieren. Umlaute in Titeln und Pfaden der Website
bleiben selbstverständlich erhalten (z. B. `/leistungen/fugenlose-bäder/`).

## Harte Regeln, die in diesem Pack gelten

1. **Keine erfundenen Fakten.** Keine Auszeichnungen, Kundenzahlen, Referenzprojekte,
   Zitate, Dauern oder Jahreszahlen, die nicht auf der Live-Seite stehen.
2. **Jede Headline behauptet genau eine Sache.** Drei Varianten je Seite, die
   Entscheidung trifft der Kunde.
3. **CTAs sagen konkret, was passiert.** „Mehr erfahren" ist nie Primär-CTA.
4. **Bewertungen:** keine Bewertungstexte erfinden, nichts von anderen Portalen als
   Google ausgeben. Attribution „Bewertungen von Google Maps". Kein
   `aggregateRating` im Schema.
5. **Schreibweise 1:1 aus der Live-Seite:** „Schwörstadt", „Niederdossenbach 1",
   „79739 Schwörstadt".
6. **Rechtsseiten:** Der Kunde prüft und gibt sie selbst frei (OP-5; Kundenantwort
   `950f0d46`). Kein Studio-seitiger Prüfvermerk mehr; Freigabe-Hinweis in
   `impressum.md` / `datenschutzerklaerung.md`. In den kundenlesbaren Rechtsseiten
   stehen **keine** internen Marker (`[OFFENER KUNDENPUNKT: …]` /
   `[FREIGABE NÖTIG: …]`) im Fließtext — ein offener Punkt wird dort als
   kundenlesbarer Freigabe-Hinweis ausgewiesen (Beispiel: OP-14, Hosting/AVV in
   `datenschutzerklaerung.md`, Abschnitt 3).
7. **KI-Bilder:** sichtbarer Hinweis an jeder Bildstelle + Footer-Kurzform
   (`ki-bildhinweis.md`, ADR 0002). Alt-Texte ohne Projektbehauptung; Provenienz in
   `bild-provenienz.json`.

## Hinweis für Frontend (MARAA-11)

- **Bestätigte Werte (Interaktion `950f0d46`) sind jetzt in `content/site.json`:**
  `kontakt.email = info@ivo-mertsch.de` (`email_status: bestaetigt`) und
  `reviews.cta_url = https://maps.app.goo.gl/4w3i7sVLrrs8di5v9`
  (`cta_url_status: bestaetigt`). Die ersetzen `email_konflikt`/`email_hinweis`
  und `cta_url_hinweis`.
- **`src/lib/content.ts` nachziehen:** Der dortige `SiteConfig`-Typ und der
  `SITE_FALLBACK` spiegeln noch den alten Stand (`email_status`/`cta_url_status:
  "offener_kundenpunkt"`, `email_konflikt`, `email_hinweis`, `cta_url_hinweis`).
  Diese Felder existieren in `content/site.json` nicht mehr; der Fallback muss auf
  `bestaetigt` und die neuen Felder (`cta_url`, `places_api`) umgestellt werden.
  **Bewusst nicht in MARAA-10 geändert** (Grenze: kein `src/`-Code).
- **CTA-Verdrahtung:** Der Button „Jetzt bei Google bewerten" nutzt bisher
  `GOOGLE_REVIEW_URL` aus der Laufzeit-Env (`src/lib/reviews.server.ts`). Als
  Standardwert ist jetzt `reviews.cta_url` aus `site.json` gesetzt.
- **KI-Hinweis rendern:** Vollform an jeder Bildstelle, Kurzform im Footer —
  Wortlaut, Platzierung und A11y-Regeln in `content/ki-bildhinweis.md` (ADR 0002,
  §5.1). Sichtbarer Absatz, kein `title`/`aria-label`-Only.
- Alle UI-Texte vollständig in `micro-ux-consent.md` — Labels, Fehler, Leer-,
  Lade-, Erfolgszustände, Consent.
- Bildalt-Texte stehen bei den Bildern in den jeweiligen Seitendateien;
  KI-Hinweis-/Caption-Regeln in `ki-bildhinweis.md`.
- Die Originalbilder sind schwere PNGs — für Lighthouse ≥ 95 konvertieren
  (AVIF/WebP, Größenattribute). Nutzungsrechte: OP-6 geklärt.
- Consent: keine Drittanbieter-Ressource vor Einwilligung. Google-Bewertungen
  werden statisch exportiert (keine Places-API, OP-11) —
  Details in `datenschutzerklaerung.md`, Abschnitt Consent.
