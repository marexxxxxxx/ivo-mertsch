# Micro-UX-Copy & Consent-Texte

Alle kleinen Texte, die die Oberfläche führt: Feldbeschriftungen, Fehler,
Lade-/Leer-/Erfolgszustände und der Consent-Dialog. Umsetzungsverbindlich für
MARAA-5. Wortlaut und Länge sind auf Screenreader und 320-px-Breite geprüft.

## Formular — Labels, Platzhalter, Hilfetexte

| Feld | Label (sichtbar) | Platzhalter | Hilfetext / `aria-describedby` |
|---|---|---|---|
| Name | `Ihr Name` | — | — |
| E-Mail | `Ihre E-Mail-Adresse` | `name@beispiel.de` | `Pflichtfeld. Wir nutzen die Adresse nur, um Ihnen zu antworten.` |
| Telefon (optional) | `Telefon (optional)` | `z. B. 07742 123456` | `Nur, wenn wir Sie zurückrufen sollen.` |
| Nachricht | `Ihr Anliegen` | — | `Was soll ich mir ansehen? Ort, Raum und gewünschter Zeitraum helfen mir.` |
| Einwilligungs-Checkbox | `Ich habe die Datenschutzerklärung gelesen.` | — | `Pflichtfeld. Link: Datenschutzerklärung` |
| Absenden-Button | `Anfrage senden` | — | — |

Regeln:

- Pflichtfeld-Kennzeichnung als sichtbarer Text „Pflichtfeld", nicht nur als Sternchen.
- Autocomplete aktivieren: `name`, `email`, `tel`.
- Kein Betreff-Auswahlfeld, kein Adressfeld, keine Newsletter-Checkbox (ADR 0001,
  Abschnitt 6.3 — minimale Datenerhebung).

## Fehlertexte (Feld-Ebene)

Jeder Fehler nennt **was** falsch war und **wie** man es behebt. Keine Fehlercodes,
keine Schuldzuweisung.

| Feld / Fall | Text |
|---|---|
| Name leer | `Bitte tragen Sie Ihren Namen ein.` |
| E-Mail leer | `Bitte geben Sie Ihre E-Mail-Adresse ein.` |
| E-Mail formal falsch | `Diese E-Mail-Adresse sieht nicht vollständig aus. Beispiel: name@firma.de` |
| Telefon formal falsch | `Bitte prüfen Sie die Telefonnummer — Zahlen, Leerzeichen und ein führendes + sind möglich.` |
| Nachricht leer | `Bitte schreiben Sie kurz, worum es geht.` |
| Nachricht zu kurz (unter 10 Zeichen) | `Ihre Nachricht ist noch sehr kurz. Ein Satz genügt schon.` |
| Einwilligung fehlt | `Bitte bestätigen Sie die Datenschutzerklärung, damit ich Ihre Anfrage bearbeiten darf.` |
| Absenden fehlgeschlagen (Server 5xx) | `Das hat nicht geklappt. Bitte versuchen Sie es erneut oder rufen Sie an: +49 174 2164071.` |
| Zu viele Anfragen (429) | `Sie haben gerade mehrere Anfragen gesendet. Bitte warten Sie einen Moment — oder rufen Sie einfach an: +49 174 2164071.` |

Fehler werden über `aria-invalid="true"`, `aria-describedby` auf die Fehlermeldung
und `role="alert"` (live) an Screenreader gebunden; der Fokus wandert auf das erste
fehlerhafte Feld.

## Zustände des Formulars

| Zustand | Text |
|---|---|
| Leer (vor dem ersten Absenden) | kein Text — nur die Labels und Hilfetexte |
| Laden (nach Klick auf „Anfrage senden") | Button-Label wechselt zu `Wird gesendet…`, Button deaktiviert, `aria-busy="true"` |
| Erfolg | `Anfrage gesendet. Ich melde mich in der Regel innerhalb von zwei Werktagen.` (kein Erfolg ohne tatsächlichen Versand) |
| Erfolg — mailto-Fallback aktiv | `Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte senden Sie sie dort ab.` |
| Fehler (siehe Tabelle oben) | Felder bleiben gefüllt, Eingaben gehen nicht verloren |

`[PRÜFUNG: „zwei Werktage" ist eine Regelfrist, keine Garantie. Falls der Kunde
eine andere Frist nennt, hier austauschen; keine Antwortzeit erfinden.]`

## Leere Zustände (site-weit)

| Ort | Text |
|---|---|
| Bewertungen, keine Daten (Phase 1) | siehe `bewertungen.md` |
| Leistungs-Liste, kein Ergebnis einer Filterung | `Für diese Auswahl gibt es gerade kein Projekt. Zeigen Sie alle Leistungen.` |
| 404 | `Diese Seite gibt es nicht (mehr). Zur Startseite` |

## Consent-Banner — Dialogtext

Verbindlicher Wortlaut. Umsetzung gegen `docs/contracts/consent.schema.json` und
ADR 0001, Abschnitt 4. Reihenfolge der Buttons und gleiche Schriftgröße für
„Alle akzeptieren" und „Alle ablehnen" sind Pflicht (kein Dark Pattern).

### Titel

> Datenschutz-Einstellungen

### Einleitungstext

> Diese Website verwendet keine Cookies und lädt nichts von fremden Servern,
> bevor Sie zustimmen. Technisch notwendige Funktionen brauchen keine
> Einwilligung. Alles andere schalten Sie selbst frei — und können es jederzeit
> wieder ändern. Details: Datenschutzerklärung.

### Button-Beschriftungen

| Button | Text | Wirkung |
|---|---|---|
| Primär (gleichrangig) | `Alle akzeptieren` | alle Kategorien auf `true` |
| Primär (gleichrangig) | `Nur notwendige` | alle optionalen Kategorien auf `false` |
| Sekundär | `Einstellungen` | zeigt die Kategorien im selben Dialog |

### Kategorie-Beschreibungen (aufklappbarer Teil)

| Kategorie | Überschrift | Beschreibung | Default |
|---|---|---|---|
| Essenziell | `Technisch notwendig` | `Diese Funktionen liefern die Seite aus und speichern Ihre Auswahl. Sie lassen sich nicht abschalten.` | immer an (kein Toggle) |
| Statistik | `Statistik` | `Zählt anonym, welche Seiten gelesen werden. Hilft, die Seite zu verbessern. Zurzeit nicht im Einsatz — die Kategorie ist vorbereitet.` | aus |
| Externe Medien | `Externe Medien` | `Lädt Inhalte von anderen Servern, z. B. Google-Bewertungen mit Profilbildern. Vor Ihrer Zustimmung wird keine Verbindung zu Google aufgebaut.` | aus |

### Fußzeilen-Texte des Dialogs

- Dauerhaft sichtbarer Footer-Eintrag: `Cookie-Einstellungen` (öffnet denselben Dialog).
- Speicherhinweis: `Ihre Entscheidung wird nur lokal in Ihrem Browser gespeichert — nicht auf einem Server und nicht bei Dritten.`
- Widerrufshinweis im Dialog: `Sie können diese Einstellungen jederzeit über „Cookie-Einstellungen" im Fuß jeder Seite ändern.`

### Links im Banner

- `Datenschutzerklärung` → `/datenschutzerklaerung/`
- `Impressum` → `/impressum/`

## Barrierefreiheit des Dialogs (Vorgabe aus ADR 0001, Abschnitt 4.6)

- `role="dialog"`, `aria-modal="true"`, benannter Titel (`Datenschutz-Einstellungen`).
- Fokusfalle, `Escape` schließt und gibt den Fokus an den Auslöser zurück.
- Alle Toggles per Tastatur erreichbar, sichtbarer Fokusring, Kontrast ≥ 4,5:1.
- Animation respektiert `prefers-reduced-motion`; der Dialog blockiert den LCP nicht.
- Toggle-Zustände für Screenreader verständlich (`switch` mit `aria-checked`).

## Mailto- und Telefon-Ziele

- Telefon-Link: `tel:+491742164071` — sichtbarer Text `+49 174 2164071`.
- WhatsApp: `https://wa.me/491742164071` — sichtbarer Text `WhatsApp schreiben`
  (öffnet einen fremden Dienst erst nach Klick; kein Embed).
- E-Mail: `mailto:` mit Adresse aus `content/site.json`. Solange OP-1 offen ist,
  ist das die Startseiten-Adresse; ein Adresstausch ändert nur `site.json`.
