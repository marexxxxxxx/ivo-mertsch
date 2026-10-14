# Bewertungen — Copy (`/bewertungen/`), beide Zustände

Rolle: Social Proof zeigen — oder ehrlich sagen, dass noch keine öffentlichen
Bewertungen für die Anzeige vorliegen — und zur Bewertung bei Google einladen.
Datenquelle ist `content/reviews.json` (Stand: leer). Ein Abruf über die
Places-API ist **nicht** beauftragt (Kundenantwort Interaktion `950f0d46`, OP-11:
nein, statischer Pfad); `content/reviews.json` bleibt die einzige Quelle. Der
Renderer kennt nur das Normalformat; diese Datei liefert **beide** Textfassungen.

**Verbindlich:** keine Bewertungstexte erfinden. Nichts von anderen Portalen als
„Google" ausgeben. Kein `aggregateRating` (siehe `schema-org.jsonld`).
Attribution ist **„Bewertungen von Google Maps"**, nicht „Google" (Google-Policy
für neue Implementierungen; CEO-Entscheidung, ADR Abschnitt 10.1).

---

## A — Zustand: Bewertungen vorhanden

### H1

> Was Kundinnen und Kunden über die Arbeit sagen.

Kein Superlativ, keine Zahl in der Überschrift. Die Zahl steht erst im Zähler
(z. B. „12 Bewertungen"), weil sie aus den Daten kommt, nicht aus dem Text.

### Einleitung

> Die folgenden Bewertungen stammen von Nutzerinnen und Nutzern von Google Maps.
> Sie geben die persönliche Meinung der jeweiligen Person wieder — nicht die
> Bewertung durch uns.

### Sortierungs-Hinweis (Pflichtfeld `sortierung_hinweis`, Google-Policy #5)

> Angezeigt werden die Bewertungen in der Reihenfolge, die Google Maps vorgibt
> (Standard: Relevanz). Es werden keine Bewertungen ausgefiltert.

`[PRÜFUNG: Sobald eine eigene Sortierung/Filterung implementiert wird, muss dieser
Satz die tatsächliche Logik beschreiben — sonst ist er falsch.]`

### Attributions-Zeile (Pflicht, Google-Policy #6)

> Bewertungen von **Google Maps**

- Das Wort „Google Maps" mit `translate="no"` auszeichnen und **nicht** übersetzen.
- Visuell: Text-Attribution bevorzugt zusammen mit dem Google-Maps-Logo
  (Umsetzung durch MARAA-4; Mindesthöhe und Freiraum nach Google-Stilregeln).
- Kein Datum im Attributions-Text selbst; das Aktualisierungsdatum steht
  separat (siehe unten).

### Aktualisierungs-Hinweis

> Stand: `<aktualisiert_am im Format TT.MM.JJJJ>`

`[PRÜFUNG: Datum kommt aus `reviews.json` bzw. der API-Antwort (`aktualisiert_am`).
Nie manuell eintragen. Ohne gültiges Datum wird die Zeile ausgeblendet.]`

### Hinweis „Wie Google Bewertungen prüft" (Pflicht, Google-Policy #7)

> **Wie Google Bewertungen prüft:** Google erhebt Bewertungen über Google Maps.
> Google kontrolliert Beiträge automatisch auf Verstöße gegen seine Richtlinien
> und entfernt auffällige Bewertungen. Einzelne Bewertungen werden dabei nicht auf
> ihren Wahrheitsgehalt geprüft; sie geben die persönliche Meinung der jeweiligen
> Person wieder.

`[PRÜFUNG: Wortlaut und Aussage gegen die aktuelle Google-Hilfeseite zum Prüfen
von Beiträgen abgleichen und die Quellen-URL ergänzen. Inhalt stammt laut
CEO-Entscheidung aus MARAA-3 — vor Livegang mit Belegzeile versehen.]`

### CTA

- Primär-CTA: **Jetzt bei Google bewerten** → Ziel-URL aus `GOOGLE_REVIEW_URL`,
  Standardwert `https://maps.app.goo.gl/4w3i7sVLrrs8di5v9` (Kundenantwort
  Interaktion `950f0d46`; OP-2 geklärt). Zentral in `content/site.json`
  (`reviews.cta_url`).
- Sekundär-CTA: **Beratung anfragen** → `/kontakt/#formular`

HTML-Skizze einer Karte (Umsetzung MARAA-5 gegen `docs/contracts/reviews.schema.json`):

| Element | Quelle im Datensatz |
|---|---|
| Autor | `autor` (Pflicht) |
| Sterne | `sterne` (1–5, ganzzahlig) |
| Datum | `datum` (ISO, aus `review_time`) |
| Text | `text` (unverändert) |
| Avatar | `avatar_status`/`avatar_url` (Initialen lokal, Google-Avatar nur nach Consent „Externe Medien") |
| Link zur Einzelbewertung | `profil_link` (immer rendern — ein Link ist keine Ressourcen-Anfrage) |

### Platzhalter-Beispiel (nur für Layout/QA, NICHT ausliefern)

```text
[PLATZHALTER-BEWERTUNG — NICHT AUSLIEFERN, KUNDE/QA ERSETZT DURCH ECHTE DATEN]
Autor:  [PLATZHALTER]
Sterne: 5 [PLATZHALTER]
Datum:  JJJJ-MM-TT [PLATZHALTER]
Text:   [PLATZHALTER — hier steht später eine echte, unveränderte Google-Bewertung]
```

---

## B — Zustand: keine Bewertungen für die Anzeige (Phase 1, aktueller Liefertext)

Das ist der zum Launch gültige Text: Es liegt kein öffentlich auffindbarer
Bewertungskorpus vor (CEO-Befund; `docs/discovery/00-kundenbriefing-und-befund.md`,
Abschnitt 4). Überschrift und CTA bleiben, nur der Mittelteil wechselt.

### H1

> Bewertungen

`[GEKLÄRT: Der Kunde liefert keine Bewertungstexte (Interaktion `950f0d46`),
deshalb bleibt der ehrliche Leerzustand. Die H1 unterscheidet sich bewusst vom
Zustand-A-Titel und enthält keine Behauptung. Alternativ: „Bewertungen von Google
Maps" — dann aber nur, wenn keine Inhalte von Google gezeigt werden; hier wird
bewusst keine Attribution gezeigt, weil keine Google-Inhalte dargestellt werden
(ADR 0001, Abschnitt 5.4).]`

### Leerzustand-Text

> Aktuell liegen für diese Website keine Google-Bewertungen zur Anzeige vor.
>
> Wenn Sie mit meiner Arbeit zufrieden waren, freue ich mich über Ihre Bewertung
> bei Google. Sie hilft anderen in der Region, eine Entscheidung zu treffen. Über
> den Knopf unten gelangen Sie direkt zum Google-Maps-Profil dieses Betriebs.

`[GEKLÄRT: Der Kunde liefert keine Bewertungstexte (Interaktion `950f0d46`),
deshalb bleibt dieser Leerzustand. Der zweite Absatz ist eine Bitte, keine
Behauptung, und darf nicht zu einer verkappten Gegenleistung werden („für eine
gute Bewertung gibt es …") — das wäre ein Verstoß gegen Googles Richtlinien.
Der Hinweis auf das Google-Maps-Profil ist ergänzt; das Ziel steht in
`content/site.json` (`reviews.cta_url`).]`

### Verboten im Leerzustand

- Keine Sterne-Anzeige, keine erfundenen Initialen, kein „Bald verfügbar".
- Keine Attributions-Zeile „Bewertungen von Google Maps", weil keine
  Google-Inhalte angezeigt werden.
- Keine von anderen Portalen übernommenen Bewertungen als Google-Bewertung.

### CTA

- Primär-CTA: **Jetzt bei Google bewerten** → Ziel-URL aus `GOOGLE_REVIEW_URL`,
  Standardwert `https://maps.app.goo.gl/4w3i7sVLrrs8di5v9` (OP-2 geklärt,
  Kundenantwort Interaktion `950f0d46`). Zentral in `content/site.json`
  (`reviews.cta_url`). Ohne gültigen Wert wird der CTA nicht gerendert (ADR 5.4,
  kein toter Link) — der Leerzustandstext bleibt trotzdem stehen.
- Sekundär-CTA: **Zufrieden? Schreiben Sie mir.** → `/kontakt/#formular`

---

## Übergang zwischen den Zuständen

Der Wechsel A ↔ B ist datengetrieben (`reviews.length === 0` ⇒ B, sonst A). Es gibt
keinen manuellen Schalter. Sobald echte Bewertungen in `content/reviews.json`
stehen oder die API einen Korpus liefert, zeigt die Sektion automatisch Zustand A —
ohne Textänderung.
