# Informationsarchitektur — ivo-mertsch.de (neu)

Elf Seiten, neun Inhaltsseiten plus zwei Rechtsseiten. Jede Seite hat genau eine
Aufgabe im Weg des Besuchers: verstehen → vergleichen → Vertrauen → handeln.
Keine Seite ohne Ausgang.

| # | Seite | Pfad | Aufgabe | Begründung |
|---|---|---|---|---|
| 1 | Start | `/` | In 5 Sekunden klar machen: wer, was, wo — und einen Kontaktweg anbieten. | Einstieg für den größten Teil der Besucher (mobil, lokal suchend). Hier stehen die vier Leistungen als Karten, ein Kurz-Ablauf und die Kontaktwege Telefon/WhatsApp/Formular. |
| 2 | Leistungen (Sammelseite) | `/leistungen/` | Die vier Leistungen vergleichbar zeigen und auf die Detailseiten verteilen. | Besucher, der noch nicht weiß, was er braucht, landet hier. Eine Übersicht schafft die Einordnung, die vier Detailseiten liefern die Tiefe — das ist auch die Basis für vier getrennte Keyword-Zugänge. |
| 3 | Fugenlose Bäder | `/leistungen/fugenlose-bäder/` | Die Leistung mit dem höchsten Differenzierungsmerkmal (2K-Beschichtung) erklären und Anfragen dafür gewinnen. | „Fugenlose Bäder" und „2K-Beschichtung" sind die spezifischsten Suchbegriffe — dafür lohnt eine eigene Seite mit eigenem Title. |
| 4 | Fugenlose Böden | `/leistungen/fugenlose-böden/` | Die drei Oberflächen (matt, seidenglänzend, glänzend) und die Einsatzbereiche zeigen. | Eigenes Keyword („fugenlose Böden"), eigene Entscheidungskette: Glanzgrad und Einsatzgebiet (innen/außen) sind die Fragen, die Interessenten hier haben. |
| 5 | Innenausbau | `/leistungen/innenausbau/` | Renovierung, Sanierung, Neubau, Modernisierung als Breiten-Leistung positionieren. | Der Einstiegspunkt für alle, die nicht primär „fugenlos" suchen, sondern einen Handwerker für ein größeres Vorhaben brauchen — verbindet die anderen drei Leistungen. |
| 6 | Fassaden | `/leistungen/fassaden/` | Neugestaltung mit/ohne Dämmung und Denkmalschutz-Anstriche als eigene Kompetenz zeigen. | „Fassadengestaltung" ist ein eigenes Suchvolumen und ein eigener Entscheidungskontext (Dämmung ja/nein, Denkmalschutz) — passt nicht in die Innenausbau-Seite. |
| 7 | Über uns / Arbeitsweise | `/über-uns/` | Vertrauen aufbauen: wer arbeitet, wie gearbeitet wird, woher. | Der Originalsatz („starker Begleiter in Sachen Beratung, Planung und Abwicklung") ist das stärkste Vertrauens-Asset des Auftritts — er verdient eine eigene Seite statt eines Absatzes im Footer-Bereich. |
| 8 | Bewertungen | `/bewertungen/` | Social Proof zeigen — oder ehrlich sagen, dass noch keine öffentlichen Bewertungen vorliegen — und zur Bewertung bei Google einladen. | Eigene Seite, damit (a) die Sektion datengetrieben mit- oder abgeschaltet werden kann und (b) der CTA „Jetzt bei Google bewerten" ein festes Ziel hat. Verlinkt von der Startseite. |
| 9 | Kontakt | `/kontakt/` | Den Kontakt in weniger als 10 Sekunden ermöglich: Telefon, WhatsApp, E-Mail, Formular. | Conversion-Seite. Jede andere Seite endet in einem CTA, das hierher zeigt. Das Formular ist der einzige Weg für Besucher, die nicht anrufen wollen. |
| 10 | Impressum | `/impressum/` | Pflicht. | Angaben gemäß § 5 DDG, aus der Live-Seite übernommen. |
| 11 | Datenschutzerklärung | `/datenschutzerklaerung/` | Pflicht + Beschreibung des neuen Consent-Managements. | Beschreibt Kategorien, Speicherdauern, Kontaktformular, Server-Logs und den Grundsatz „kein Drittanbieter vor Consent". |

## Bewegungsmuster (Navigationslogik)

- **Primärnavigation:** Leistungen (Dropdown: 4 Detailseiten) · Über uns · Bewertungen · Kontakt.
- **Header-CTA (persistent):** Telefonnummer als `tel:`-Link — auf Mobil ein Tipp, der direkt wählt.
- **Footer:** Adresse, Telefon/WhatsApp/E-Mail, Instagram, Impressum, Datenschutzerklärung.
- **CTA-Ziellogik seitenübergreifend:**
  - Primär-CTA → `/kontakt/` (Formular) oder direkter `tel:`-Link,
  - Sekundär → WhatsApp (`wa.me`-Link, gleiche Nummer),
  - Tertiär → E-Mail-`mailto:` (erst nach Klärung der Adresse, s. offene Kundenpunkte).
- **Breadcrumb** ab `/leistungen/…`: Start › Leistungen › [Leistung] (auch als
  BreadcrumbList-Schema, siehe `schema-org.jsonld`).

## Bewusst NICHT angelegt

- **Kein Blog / keine Ratgeber-Artikel:** Es gibt dafür keinen redaktionellen
  Betrieb. Ein ungepflegter Blog schadet mehr, als er nützt. Falls später
  Content gewünscht ist: erst mit festem Redaktionsplan anlegen.
- **Keine Referenzen/Projekte-Seite:** Es gibt keine nachweisbaren Referenzen.
  Statt zu erfinden, zeigen die Seiten die Leistungen und (vorhandene) Bilder
  ohne Projektzuordnung. Siehe offene Kundenpunkte.
- **Keine Preisseite / kein Preisrechner:** Keine belegbaren Zahlen. Preise
  entstehen im Gespräch — das sagen die CTA-Texte auch so.
- **Kein Login/Kundenbereich:** Nicht beauftragt.
