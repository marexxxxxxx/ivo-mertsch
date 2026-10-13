# Content-Pack — Ivo Mertsch Relaunch (MARAA-3)

Vollständiger Texte-, SEO- und Schema-Baustein für die neue Website. Grundlage
ausschließlich: der Live-Auftritt <https://ivo-mertsch.de/> (abgerufen 2026-10-13),
die CEO-Discovery in MARAA-1 (`docs/discovery/00-kundenbriefing-und-befund.md`) und
das Kundenbriefing. **Keine erfundenen Fakten, Zahlen, Kunden oder Bewertungen.**

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
| `reviews.json` | Datenquelle der Bewertungs-Sektion (Phase 1: Leerzustand) |
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
6. **Rechtsseiten tragen den Prüfvermerk** für den Kundenanwalt / IT-Recht-Dienstleister
   (Abnahmekriterium). Siehe jeweilige Datei.

## Hinweis für Frontend (MARAA-5)

- Alle UI-Texte vollständig in `micro-ux-consent.md` — Labels, Fehler, Leer-,
  Lade-, Erfolgszustände, Consent.
- Bildalt-Texte stehen bei den Bildern in den jeweiligen Seitendateien.
- Die Originalbilder sind schwere PNGs — für Lighthouse ≥ 95 konvertieren
  (AVIF/WebP, Größenattribute). Rechte/Nutzung s. offene Punkte.
- Consent: keine Drittanbieter-Ressource vor Einwilligung. Google-Bewertungen
  werden serverseitig geladen (Proxy + Cache) oder statisch exportiert —
  Details in `datenschutzerklaerung.md`, Abschnitt Consent.
