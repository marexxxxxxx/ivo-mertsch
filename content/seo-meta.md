# SEO-Meta — Titles, Descriptions, Open Graph, Canonical, Keywords

Alle Angaben je Seite. Längen in Zeichen, inklusive Leerzeichen.

- **Title:** 50–60 Zeichen, Muster `[Hauptbegriff] – [Nutzen] | [Marke]`.
- **Description:** 140–160 Zeichen.
- **Genau eine H1** je Seite, Hierarchie ohne Sprünge (H1 → H2 → H3).
- **Intent-Regel:** Kommerzielle Suchen (z. B. „fugenlose Böden Schwörstadt")
  landen auf einer Leistungsseite, nicht auf einem Informationstext.

Erst Inhalt, dann Keywords. Keine Keyword-Wiederholung im sichtbaren Text ohne
Grund; die Keywords ergeben sich aus dem, was tatsächlich auf der Seite steht.

## Titles & Descriptions

| Seite | Pfad | Title (Länge) | Description (Länge) |
|---|---|---|---|
| Start | `/` | `Fugenlose Bäder & Böden aus Schwörstadt \| Ivo Mertsch` (53) | `Ivo Mertsch aus Schwörstadt: fugenlose Bäder und Böden, Innenausbau und Fassadengestaltung. Beratung, Planung und Abwicklung aus einer Hand.` (140) |
| Leistungen | `/leistungen/` | `Leistungen – Bad, Boden, Innenausbau, Fassade \| Ivo Mertsch` (59) | `Vier Leistungen, ein Ansprechpartner: fugenlose Bäder, fugenlose Böden, Innenausbau und Fassadengestaltung aus Schwörstadt im Landkreis Waldshut.` (145) |
| Fugenlose Bäder | `/leistungen/fugenlose-bäder/` | `Fugenlose Bäder – 2K-Beschichtung \| Ivo Mertsch Schwörstadt` (59) | `Fugenlose Bäder aus 2K-Beschichtung für Nassbereiche: Wände und Böden ohne Fugen. Handwerk aus Schwörstadt – jetzt Beratung für Ihr Bad anfragen.` (145) |
| Fugenlose Böden | `/leistungen/fugenlose-böden/` | `Fugenlose Böden – matt, seidenglänzend, glänzend \| Mertsch` (58) | `Fugenlose Böden in matt, seidenglänzend oder glänzend – für Innenräume, Garagen, Balkone und den Außenbereich. Handwerk aus Schwörstadt für Ihre Fläche.` (152) |
| Innenausbau | `/leistungen/innenausbau/` | `Innenausbau Schwörstadt – Sanierung & Neubau \| Ivo Mertsch` (58) | `Innenausbau aus Schwörstadt: Renovierung, Sanierung, Neubau und Modernisierung. Ein Ansprechpartner für alle Bereiche – von der Planung bis zur Abnahme.` (152) |
| Fassaden | `/leistungen/fassaden/` | `Fassaden – mit & ohne Dämmung aus Schwörstadt \| Ivo Mertsch` (59) | `Fassaden-Neugestaltung mit oder ohne Dämmung, Anstriche im Denkmalschutz. Handwerk aus Schwörstadt für langanhaltend schöne Fassaden – jetzt anfragen.` (150) |
| Über uns | `/über-uns/` | `Über uns – Handwerk aus Leidenschaft \| Ivo Mertsch` (50) | `Ivo Mertsch, Handwerk aus Leidenschaft aus Schwörstadt: Beratung, Planung und Abwicklung für Bad, Boden, Innenausbau und Fassade. Lernen Sie uns kennen.` (152) |
| Bewertungen | `/bewertungen/` | `Bewertungen – Erfahrungen aus Schwörstadt \| Ivo Mertsch` (55) | `Bewertungen von Google Maps für Ivo Mertsch aus Schwörstadt – plus die Möglichkeit, jetzt selbst eine Bewertung abzugeben und so anderen zu helfen.` (147) |
| Kontakt | `/kontakt/` | `Kontakt – Beratung anfragen in Schwörstadt \| Ivo Mertsch` (56) | `Kontakt zu Ivo Mertsch in Schwörstadt: anrufen, WhatsApp schreiben oder eine Anfrage senden. Beratung für Bad, Boden, Innenausbau und Fassade anfragen.` (151) |
| Impressum | `/impressum/` | `Impressum – Ivo Mertsch, Handwerker aus Schwörstadt` (51) | `Impressum und Anbieterkennzeichnung gemäß § 5 DDG: Ivo Marco Mertsch, Ivo Mertsch Design, Niederdossenbach 1, 79739 Schwörstadt, Deutschland.` (141) |
| Datenschutzerklärung | `/datenschutzerklaerung/` | `Datenschutzerklärung – Ivo Mertsch aus Schwörstadt` (50) | `Datenschutzerklärung der Website von Ivo Mertsch aus Schwörstadt: Server-Logs, Kontaktformular, Google-Bewertungen und das Consent-Management ohne Cookies.` (155) |

`[PRÜFUNG: Die Zählung gilt für die Zeichen des Title-Texts ohne Marken-Suffix-Trenner-
Probleme. Nach dem finalen Branding (OP-8) erneut prüfen, ob „Ivo Mertsch" die
Marke bleibt.]`

## Open Graph (Basics, je Seite)

| Eigenschaft | Wert |
|---|---|
| `og:type` | `website` (Start, Leistungen, Über uns, Bewertungen, Kontakt, Rechtsseiten), `article` nicht verwenden |
| `og:site_name` | `Ivo Mertsch` (ggf. `Ivo Mertsch Design`, s. OP-8) |
| `og:locale` | `de_DE` |
| `og:title` | identisch zum Title der jeweiligen Seite |
| `og:description` | identisch zur Description der jeweiligen Seite |
| `og:url` | identisch zum Canonical der jeweiligen Seite |
| `og:image` | `[PRÜFUNG: eigenes, lokal gehostetes Vorschaubild 1200×630 nachliefern (AVIF/WebP/JPEG, ≤ 200 KB). Kein Verweis auf eine Dritt-URL. Bis dahin weglassen.]` |
| `og:image:alt` | 1 Satz, beschreibt das Bild (kein Markenclaim) |
| `twitter:card` | `summary_large_image` (optional; nur mit vorhandenem `og:image`) |

## Canonical-Logik

- **Selbstreferenzierend** auf jeder Seite: `<link rel="canonical" href="https://ivo-mertsch.de{path}">`.
- Pfad mit **abschließendem Slash** wie in der IA (`/leistungen/fugenlose-bäder/`).
- **Keine** Parameter, keine `utm_`-Werte im Canonical.
- Trailing-Slash-Variante und die `www`-Variante werden per Redirect auf die
  kanonische Form geführt (Umsetzung: MARAA-5).
- Impressum und Datenschutzerklärung erhalten `canonical` und `noindex`? **Nein** —
  Rechtsseiten bleiben indexierbar (Vertrauenssignal), aber sie tragen Priorität
  niedrig in der Sitemap.

`[PRÜFUNG: Domain ist `ivo-mertsch.de` (Live-Auftritt). Sollte die neue Seite unter
einer anderen Domain ausgeliefert werden, müssen Canonical, OG-URL und Schema.org
zentral getauscht werden — `content/site.json` ist die Quelle.]`

## Keywords (Basis, je Seite — keine Stuffing-Liste)

| Seite | Hauptbegriff | Nebenbegriffe |
|---|---|---|
| Start | Handwerker Schwörstadt | fugenlose Bäder, fugenlose Böden, Innenausbau, Fassadengestaltung |
| Leistungen | Leistungen Handwerk Schwörstadt | Bad, Boden, Innenausbau, Fassade |
| Fugenlose Bäder | fugenlose Bäder | 2K-Beschichtung, Nassbereich, Badsanierung, fugenloses Bad |
| Fugenlose Böden | fugenlose Böden | matt, seidenglänzend, glänzend, Garagenboden, Balkon, Außenbereich |
| Innenausbau | Innenausbau Schwörstadt | Renovierung, Sanierung, Neubau, Modernisierung |
| Fassaden | Fassadengestaltung Schwörstadt | Dämmung, Fassadenanstrich, Denkmalschutz |
| Über uns | Handwerk aus Leidenschaft | Schwörstadt, Landkreis Waldshut, Baden |
| Bewertungen | Bewertungen Ivo Mertsch | Google-Bewertungen, Google Maps |
| Kontakt | Kontakt Ivo Mertsch | Handwerker Schwörstadt, Beratung anfragen |

## Technisches SEO (Hinweis an MARAA-5)

- `<html lang="de">`, genau eine H1 je Seite am Inhaltsanfang.
- `robots.txt`: alles erlaubt außer `/api/`.
- `sitemap.xml`: die neun Inhaltsseiten + zwei Rechtsseiten, ohne on-demand-Routen.
- Strukturierte Daten: siehe `content/schema-org.jsonld` — **kein** `aggregateRating`.
- Interne Verlinkung: jede Leistungsseite verlinkt auf `/kontakt/#formular` und
  zurück auf `/leistungen/`; die Startseite verlinkt auf alle vier Leistungen.

## Hinweise zu `schema-org.jsonld`

- Die Datei enthält 14 eigenständige JSON-LD-Knoten (WebSite, LocalBusiness +
  HomeAndConstructionBusiness, vier Service, acht BreadcrumbList). Jeder Knoten
  ist einzeln einbettbar (`<script type="application/ld+json">`).
- **Kein `aggregateRating`** und keine Review-Markup-Blöcke: Es liegen keine
  Bewertungen vor. Sobald echte Bewertungen existieren, wird Review-Markup nur für
  **sichtbare** Bewertungen ergänzt (und dann mit `aggregateRating` nur, wenn alle
  Bewertungen vollständig gezeigt werden — Google-Regel).
- Die `email` im LocalBusiness-Knoten folgt `content/site.json` (OP-1). Nach der
  Adressentscheidung zentral nachziehen.
- `image`/`logo` sind **bewusst nicht** gesetzt: solange kein lokal gehostetes,
  absolutes Bild-URL existiert, wird keins erfunden. Nach Aufbereitung der
  Originalbilder (`public/img/…`) ergänzen.
- `priceRange` und `geo`-Koordinaten fehlen bewusst — keine belegten Werte.
- `url`-Werte: die Service-/Breadcrumb-`@id` nutzt prozentkodierte Umlaute
  (z. B. `fugenlose-b%C3%A4der`), die `url`-Felder die lesbare Form. MARAA-5 hält
  beides konsistent zum tatsächlichen Routing.
