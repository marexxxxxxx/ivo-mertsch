# Kontakt — Copy (`/kontakt/`)

Rolle: Conversion. Der Besucher soll in unter zehn Sekunden einen Weg finden, mit
Ivo Mertsch zu sprechen — telefonisch, per WhatsApp, per E-Mail oder über das
Formular. Jede andere Seite endet in einem CTA auf diese Seite.

SEO-Zuordnung: `seo-meta.md`, Seite „Kontakt".

Die H1 darf **nicht** „Kontakt" allein lauten (kein reines Schlagwort als H1);
eine Aussage ist Pflicht.

## H1 — drei Varianten (Entscheidung: Kunde)

**Variante A — Nutzen** (Muster: [Ergebnis] ohne [typischer Preis])

> „Erzählen Sie mir von Ihrem Vorhaben — den Rest klären wir im Gespräch."

Begründung: Senkt die Schwelle, macht das Gespräch zum nächsten Schritt und
verspricht keine Entscheidung. Passt zum Formular als Primärweg.

**Variante B — Problem** (Muster: Kennen Sie das?)

> „Sie haben eine Frage, die sich schlecht in ein Kontaktfeld passt? Rufen Sie an."

Begründung: Passt zu Handwerksleistungen, bei denen Beratung oft im Dialog
einfacher ist als im Formular. Stärkt den `tel:`-Link als Primärweg.

**Variante C — Spezifität** (Muster: konkret statt allgemein)

> „Direkt zum Handwerker: Telefon, WhatsApp oder Formular."

Begründung: Listet die tatsächlichen Wege, keine Behauptung. Gut für Besucher, die
nur wissen wollen, wie sie anrufen.

> **Empfehlung:** Variante A, weil sie den Gesprächscharakter trägt und den
> Formularweg als ersten Schritt etabliert. Entscheidung beim Kunden.

## Subheadline

> Telefon, WhatsApp, E-Mail oder Formular — suchen Sie sich den Weg aus, der Ihnen
> am liebsten ist.

## Die Kontaktwege (Reihenfolge im Layout)

| Kanal | Sichtbarer Text | Ziel | Hinweis |
|---|---|---|---|
| Telefon (primär) | `Anrufen: +49 174 2164071` | `tel:+491742164071` | Auf Mobil ein Tipp, der direkt wählt. |
| WhatsApp | `WhatsApp schreiben` | `https://wa.me/491742164071` | Öffnet einen fremden Dienst erst nach Klick; kein Embed. |
| Formular (primär) | `Anfrage senden` | `/kontakt/#formular` | Serverseitiger Versand oder mailto-Fallback (ADR 0001, Abschnitt 6). |
| E-Mail | `E-Mail schreiben` | `mailto:` aus `content/site.json` | Adresse bestätigt: `info@ivo-mertsch.de` (OP-1). Austausch nur in `site.json`. |

## Adresse

> Ivo Mertsch
> Niederdossenbach 1
> 79739 Schwörstadt
> Deutschland

`[PRÜFUNG: Die Kontaktseite der Alt-Seite nennt zusätzlich „Lörrach". Das ist nicht
die Betriebsadresse (Impressum und Footer nennen Schwörstadt). „Lörrach" wird nicht
übernommen, solange der Kunde es nicht als zweiten Standort bestätigt — OP-9.]`

## Formular

Struktur, Labels, Platzhalter, Hilfetexte, Fehler- und Erfolgszustände:
siehe `micro-ux-consent.md`. Kurzfassung:

- Felder: name (Pflicht), email (Pflicht), telefon (optional), nachricht (Pflicht),
  Einwilligungs-Checkbox (Pflicht).
- Kein Betreff-Feld, kein Adressfeld, keine Newsletter-Option (ADR 0001, Abschnitt 6.3).
- Spam-Schutz ohne Drittanbieter: Honeypot, Zeitfalle, Rate-Limit (kein Captcha).

## Ablauf nach dem Absenden (Erfolgstext)

- **Versandweg aktiv (SMTP):** `Anfrage gesendet. Ich melde mich in der Regel
  innerhalb von zwei Werktagen.`
- **Kein SMTP (mailto-Fallback):** `Ihr E-Mail-Programm öffnet sich mit der fertigen
  Nachricht. Bitte senden Sie sie dort ab.`

`[PRÜFUNG: „zwei Werktage" ist eine Regelfrist, keine Garantie. Kunde bestätigt
oder ersetzt sie.]`

## Karte & Anfahrt

Es wird **keine** Karte eingebettet (Google Maps wäre eine Drittanbieter-Ressource
und damit consent-pflichtig, ADR 0001, Abschnitt 4.2). Die Adresse steht als Text;
ein Link „Route planen" führt auf einen externen Kartendienst erst nach Klick.

`[FREIGABE NÖTIG: Falls ein Karten-Embed trotz Consent gewünscht ist, ist das eine
Architekturänderung (neue ADR), nicht eine reine Textänderung.]`

## CTA-Band (Seitenende)

> Lieber direkt sprechen? Das ist der schnellste Weg.

- Primär-CTA: **Anrufen: +49 174 2164071** → `tel:+491742164071`
- Sekundär-CTA: **WhatsApp schreiben** → `https://wa.me/491742164071`
