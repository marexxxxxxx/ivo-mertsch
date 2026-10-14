# KI-Bildhinweis — finaler Wortlaut, Alt-Texte, Bildunterschriften

Verbindliche Content-Vorlage für **MARAA-11 (Frontend)** und Prüfgrundlage für
**MARAA-12 (QA)**. Grundlage ist `docs/adr/0002-ki-bilder-transparenz.md`
(Abschnitt 5.1–5.4, ADR 0002 (MARAA-9), angenommen 2026-10-14) und die
Kundenangabe aus Interaktion `950f0d46`: die Bilder sind mit KI erzeugt und der
Auftritt soll EU-AI-Act-konform sein.

> Der hier festgeschriebene Wortlaut ist die **endgültige Redaktion** des in
> ADR 0002 §5.1 vorgegebenen Rahmens. Inhalt und Aussage sind unverändert; die
> Formulierungen sind auf „Sie", Kürze und Screenreader-Lesbarkeit finalisiert.
> **Sichtbarkeit und Platzierung sind nicht verhandelbar** (ADR 0002 §5.1).

Betroffene Bilder: `foto3, foto6, foto7, foto8, foto9, foto10, foto11`
(Provenienz-Nachweis: `content/bild-provenienz.json`).

---

## 1. Finaler Wortlaut

### 1.1 Vollform — an jeder Bildstelle (sichtbarer Absatz)

> Ein Teil der hier gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt
> oder bearbeitet. Die Aufnahmen sind beispielhafte Darstellungen von Räumen,
> Materialien und Oberflächen — keine Abbildungen konkret ausgeführter
> Kundenprojekte.

Einsatz: Startseite (Hero `foto3`), „Über uns" (Hero `foto3`), alle vier
Leistungsseiten (Hero-Bild) sowie jede Galerie/Sektion, die eines der sieben
Bilder rendert. Der Absatz steht **im selben Abschnitt/Landmark wie die Bilder**,
unmittelbar vor oder nach der Bildliste (ADR 0002 §5.1.1).

### 1.2 Kurzform — dauerhaft im Footer (jede Seite)

> Bildhinweis: Einzelne Bilder dieser Website sind KI-generiert (beispielhafte
> Darstellungen, keine realen Projekte).

Einsatz: `Footer.astro`, auf jeder Seite. Die Kurzform ist ein **echter
Textknoten** (kein `title`, kein `aria-label`). Empfohlene Verlinkung:
„Bildhinweis" → `/impressum/#bildhinweis` (dort steht die Vollform).

### 1.3 Impressum-Abschnitt „Bildhinweis" (empfohlen, ADR 0002 §5.5)

> **Bildhinweis.** Ein Teil der auf dieser Website gezeigten Bilder wurde mit
> Künstlicher Intelligenz erzeugt oder bearbeitet. Die Aufnahmen sind
> beispielhafte Darstellungen von Räumen, Materialien und Oberflächen — keine
> Abbildungen konkret ausgeführter Kundenprojekte.

Anker: `id="bildhinweis"` im Impressum. Umgesetzt in `content/impressum.md`.

### 1.4 Optionales `aria-describedby` (Empfehlung an MARAA-11)

Der Vollform-Absatz erhält `id="ki-bildhinweis"`; die umgebende
Galerie-/Hero-Sektion kann ihn per `aria-describedby="ki-bildhinweis"`
referenzieren. Der Hinweis steht in jedem Fall **zusätzlich als sichtbarer
Absatz** — nie nur in `aria-label`, `title` oder einer Caption (ADR 0002 §5.1).

---

## 2. Alt-Texte (final)

Regel (ADR 0002 §5.3): Alt-Texte **beschreiben nur den sichtbaren Inhalt**. Keine
Projektzuordnung, keine Kundennamen, keine Ortsangaben als Beleg. Quelle der
Umsetzung ist `src/lib/images.ts` — die Werte dort müssen mit dieser Liste
übereinstimmen.

| Datei | Alt-Text |
|---|---|
| `foto3.png` | `Modernes Badezimmer mit weißer Wanne, Doppelwaschtisch und Glasdusche.` |
| `foto6.png` | `Leerer Wohnraum mit Holzboden, Kamin und großen Fenstern.` |
| `foto7.png` | `Fassade eines Altbaus mit Gerüst und Handwerkern bei der Arbeit.` |
| `foto8.png` | `Helles Badezimmer mit beiger Wand, begehbarer Glassdusche und schwebendem Waschtisch.` |
| `foto9.png` | `""` — dekoratives Bild (`alt=""`, `aria-hidden`). Keine Beschreibung erfinden. |
| `foto10.png` | `Fassadenbereich mit aufgebrachtem Dämmaufbau.` |
| `foto11.png` | `Wohnraum mit großen Fenstern und fugenlos beschichtetem, glänzendem Boden.` |

Der KI-Hinweis steht **nie ausschließlich** im Alt-Text oder in einer Caption
(ADR 0002 §5.3) — er ist immer der sichtbare Absatz aus Abschnitt 1.

---

## 3. Bildunterschriften (Caption-Policy)

Standard: **keine** Caption. Der Alt-Text trägt die Inhaltsbeschreibung; das
`figure`-Element bleibt ohne `figcaption` (Design-Vorgabe
`docs/design/komponenten.md` §7: `figcaption` nur, wenn es echten Text gibt).

Wünscht der Kunde/Designer eine Caption, ist **nur** die UWG-Positivliste aus
Abschnitt 4 zulässig — z. B.:

> Beispielhafte Darstellung.

oder

> Material- und Raumeindruck einer beispielhaften Ausführung.

Verboten in einer Caption: „unser Projekt", „Referenz", „Vorher/Nachher",
„so sieht es nach unserer Arbeit aus" oder jede Formulierung, die das Bild als
Dokumentation einer real ausgeführten Leistung oder eines realen Ortes darstellt
(ADR 0002 §5.4).

---

## 4. UWG-§-5-Textregeln (Copy)

**Verboten im unmittelbaren Bezug auf ein KI-Bild:**

- „Referenz", „Referenzprojekt", „unser Projekt", „umgesetztes Projekt"
- „echte Kundenprojekte", „Vorher/Nachher (unserer Arbeit)", „aus unseren Projekten"
- jede Formulierung, die ein KI-Bild als Dokumentation einer real ausgeführten
  Leistung oder eines realen Ortes darstellt

**Zulässig:**

- „beispielhafte Darstellung", „so kann es aussehen", „Material- und Raumeindruck",
  „Illustration", „Symbolbild"

Der sichtbare KI-Hinweis (Abschnitt 1) ist das tragende Kennzeichen; die
Copy-Regeln verhindern zusätzlich, dass Text und Bild einander widersprechen.

---

## 5. Was dieses Dokument nicht zusagt

- **Keine** maschinenlesbare Kennzeichnung (C2PA/JUMBF) der Build-Artefakte:
  mit der heutigen Pipeline (sharp entfernt PNG-Text-/XMP-Chunks) technisch nicht
  haltbar und für den Deployer nicht Pflicht (ADR 0002 §3.2, §4.2, §8).
- **Keine** Rechtsberatung. Die endgültige Würdigung liegt beim Kunden (siehe
  OP-5 in `content/offene-kundenpunkte.md`).

---

## 6. Offene Punkte (aus ADR 0002, Abschnitt 7)

- **O1 — Generator/Werkzeug unbekannt.** In `bild-provenienz.json` als
  „unbekannt (Kundenangabe)" geführt. Der Kunde kann das nachliefern.
- **O2 — Rechte an den Ausgaben.** Urheber-/Nutzungsrechte trägt der Kunde bei;
  deckt OP-6 ab.
- **Sonderfall (ADR 0002 §5.4):** Bestätigt der Kunde später, dass ein Bild ein
  **echtes** ausgeführtes Projekt zeigt, wird die Offenlegung für dieses Bild
  invertiert und die Provenienz-Akte nachgeführt — nicht stillschweigend geändert.
