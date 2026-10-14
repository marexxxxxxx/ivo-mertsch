# ADR 0002 — KI-Bilder: EU-AI-Act-Transparenz & UWG-Trennschärfe

| | |
|---|---|
| **Status** | Akzeptiert (verbindlich für MARAA-10 Content, MARAA-11 Frontend, MARAA-12 QA) |
| **Datum** | 2026-10-14 |
| **Autor** | Lead Architect (PixelForge Studio), Issue MARAA-9 |
| **Kontext** | MARAA-1 — Ivo-Mertsch-Relaunch |
| **Wirkt auf** | MARAA-10 (Content: Texte/Rechtsseiten), MARAA-11 (Frontend: Rendering), MARAA-12 (QA) |
| **Quellen** | Verordnung (EU) 2024/1689 (AI Act), Art. 3, 25, 50, 113; UWG § 5; `content/site.json`; `src/assets/img/*`; `src/lib/images.ts`; `docs/design/komponenten.md` §7/§11 |
| **Kundenfakten** | Interaktion `950f0d46` (2026-10-14): „die bilder habe ich mit ki generiert. mach das so das das eu ai act konform ist" |
| **Rechtlicher Status** | Technische/Compliance-by-Design-Spezifikation. **Keine Rechtsberatung.** Vor Livegang durch den Rechtsprüfer des Kunden freigeben (Prüfvermerk in `content/impressum.md`, `content/datenschutzerklaerung.md`). |

---

## 1. Kontext

Der Kunde hat am 2026-10-14 bestätigt, dass die auf der Website verwendeten Bilder
**mit Künstlicher Intelligenz erzeugt** wurden, und die verbindliche Vorgabe gemacht, den
Auftritt **EU-AI-Act-konform** zu machen (Interaktion `950f0d46`).

Betroffen sind sieben Foto-Assets und das Logo aus dem Alt-Auftritt:

`src/assets/img/foto3.png`, `foto6.png` … `foto11.png`, `logo_ivo.jpeg`
(Quelle: `content/site.json` → `beschaffung.bilder` / `beschaffung.logo`).

Diese ADR entscheidet **nicht**, wie die Website aussieht, sondern:

1. **ob** die KI-Bilder bleiben dürfen und unter welchen Bedingungen,
2. **welche** Transparenzpflichten den Betreiber (Deployer) treffen und
3. **welche** technisch prüfbaren Anforderungen daraus für Content und Frontend folgen.

Der AI Act ist kein „schönes Extra": Art. 50 fordert die Offenlegung von KI-Erzeugung
für bestimmte Inhalte, und die deutsche Rechtsprechung kann eine KI-Illustration, die wie
eine echte Referenz wirkt, als **irreführende geschäftliche Handlung** nach UWG § 5
werten. Beide Risiken werden hier zusammen adressiert.

> Hinweis zur Auslegung: Der AI Act ist neu, mehrere Fragen sind noch nicht höchstrichterlich
> entschieden. Diese ADR wählt bewusst die **risikoärmste, klar belegbare** Lesart: sichtbare
> Offenlegung für **alle** KI-erzeugten Bilder, unabhängig von der Deepfake-Grenze. Das erfüllt
> Art. 50 in jeder vertretbaren Auslegung und schließt das UWG-Risiko.

---

## 2. Entscheidung im Überblick

| # | Entscheidung | Gewählte Option | Status |
|---|---|---|---|
| D1 | Bestand | **Bilder behalten + alle kennzeichnen** (nicht ersetzen) — Abschnitt 6 | akzeptiert |
| D2 | Sichtbarer KI-Hinweis | **Sichtbarer Text an jeder Bildstelle + dauerhafter Footer-Hinweis**, nicht overlay-, nicht tooltip-only (Abschnitt 5.1) | akzeptiert |
| D3 | Metadaten-Policy | **Kein Vertrauen auf maschinenlesbare Kennzeichnung**; interne Provenienz-Akte führt den Nachweis; Pipeline entfernt Metadaten heute vollständig (Abschnitt 5.2) | akzeptiert |
| D4 | Alt-Text/Caption | **Nur Inhaltsbeschreibung, keine Projektzuordnung** (Abschnitt 5.3) | akzeptiert |
| D5 | UWG § 5 | **Copy-Verbot von Referenz-/Projekt-Behauptungen auf KI-Bildern**; Positivliste zulässiger Formulierungen (Abschnitt 5.4) | akzeptiert |
| D6 | Impressum/Datenschutz | **DSGVO: keine Änderung nötig**; **Impressum: ein Satz „Bildhinweis" empfohlen** (Abschnitt 5.5) | akzeptiert |
| D7 | Logo | **Logo getrennt behandelt**; kein Deepfake i. S. v. Art. 3(60), keine Pflichtkennzeichnung (Abschnitt 5.6) | akzeptiert |

---

## 3. Anwendbarkeit der Transparenzpflichten (Art. 50)

### 3.1 Rollen: Anbieter (Provider) vs. Betreiber (Deployer)

Der AI Act unterscheidet zwei Rollen:

- **Anbieter / Provider** — Art. 3 Nr. 3: wer ein KI-System *entwickelt* (oder entwickeln
  lässt) und es **unter eigenem Namen oder eigener Marke** in Verkehr bringt oder in Betrieb
  nimmt. Das sind hier die **Hersteller der Bildgenerator-Werkzeuge** (z. B. Midjourney, DALL·E,
  Stable Diffusion, Firefly …). Welches Werkzeug der Kunde genutzt hat, ist **nicht bekannt**
  (Kundenangabe: „mit KI generiert", Interaktion `950f0d46`).
- **Betreiber / Deployer** — Art. 3 Nr. 4: wer ein KI-System **unter seiner Verantwortung
  verwendet**. Das ist hier **Ivo Mertsch / der Betreiber der Website**, weil er die generierten
  Bilder auf seiner geschäftlichen Website einsetzt.

Der Kunde hat die Bilder nach derzeitigem Kenntnisstand **nicht weiterverarbeitet** (keine
Substanzänderung, kein Retraining) und sie nicht unter eigener Marke als KI-System in Verkehr
gebracht. Er ist damit **Deployer, nicht Provider**. Ein Provider-Status durch bloße Nutzung
generierter Ausgaben (Art. 25) ist hier nicht erkennbar. Diese Einordnung ist Teil der
Rechtsprüfung (Abschnitt 7).

### 3.2 Art. 50 Abs. 2 — maschinenlesbare Kennzeichnung: trägt der **Anbieter**

Art. 50 Abs. 2 verpflichtet **Anbieter** von KI-Systemen, die synthetische Bildinhalte
erzeugen, dafür zu sorgen, dass **die Ausgaben in einem maschinenlesbaren Format markiert und
als künstlich erzeugt oder manipuliert erkennbar** sind (robust, interoperabel, soweit
technisch machbar).

> **Konsequenz:** Diese Pflicht trifft den **Hersteller des Bildgenerators**, nicht den
> Website-Betreiber. Der Deployer kann sie für fremde Ausgaben **nicht nachträglich erfüllen**
> und darf sie auch **nicht behaupten**. Er darf vorhandene Kennzeichnungen aber auch nicht
> beseitigen (Abschnitt 3.5 / 5.2).

### 3.3 Art. 50 Abs. 4 — Offenlegung: trägt der **Deployer**

Art. 50 Abs. 4 Satz 1 verpflichtet **Deployer** eines KI-Systems, das Bild-, Audio- oder
Videoinhalte erzeugt oder manipuliert, **die einen Deepfake darstellen**, offenzulegen, dass
der Inhalt künstlich erzeugt oder manipuliert wurde.

**Deepfake** ist in Art. 3 Nr. 60 definiert als *KI-erzeugter oder -manipulierter Bild-,
Audio- oder Videoinhalt, der existierenden Personen, Objekten, Orten, Einrichtungen oder
Ereignissen ähnelt und einer Person fälschlich als authentisch oder wahrheitsgemäß erscheinen
würde.*

**Anwendung auf diese Bilder:** Die Bilder zeigen **fotorealistische Räume, Materialien und
Fassaden** (Bäder, Böden, Innenräume, Fassaden). Sie ähneln **Orten/Objekten** und sind in
einem kommerziellen Marketing-Kontext geeignet, einem Betrachter als **Dokumentation
ausgeführter Arbeiten** zu erscheinen. Diese Konstellation ist **nach der risikoärmsten
Lesart von Art. 50 Abs. 4 erfasst** — unabhängig davon, ob man jede Marketing-Aufnahme
bereits als „Deepfake" einstuft.

> **Entscheidung:** Die Offenlegungspflicht wird **proaktiv für alle KI-Bilder** erfüllt. Das
> ist die einzige Lesart, die bei jeder vertretbaren Auslegung konform ist. Ein Streit darüber,
> welches Bild genau ein Deepfake ist, wird gar nicht erst eröffnet.

**Grenzen der Pflicht (zur Kenntnis):**

- *Kreativ-/Kunst-Ausnahme (Art. 50 Abs. 4 Satz 3):* Bei offensichtlich künstlerischen,
  kreativen, satirischen, fiktionalen Werken beschränkt sich die Offenlegung auf einen
  Hinweis, der die Wahrnehmung des Werks nicht beeinträchtigt. Diese Website ist eine
  **kommerzielle Marketing-Site**, kein Kunstwerk; die Ausnahme wird nicht als tragende
  Begründung herangezogen. Der gewählte sichtbare Hinweis ist ohnehin die mildeste Form.
- *Strafverfolgungs-Ausnahme:* hier nicht einschlägig.

### 3.4 Art. 50 Abs. 5 — Form und Zeitpunkt

Art. 50 Abs. 5 verlangt, dass die Information den betroffenen Personen **in klarer und
unterscheidbarer Weise spätestens bei der ersten Interaktion oder Exposition** bereitgestellt
wird und **den anwendbaren Barrierefreiheitsanforderungen** entspricht.

> **Konsequenz für das Frontend:** Ein Hinweis, der erst im Impressum steht oder nur als
> `title`-Tooltip erscheint, genügt nicht. Der Hinweis muss **sichtbar dort stehen, wo das Bild
> exponiert wird**, und **für Screenreader lesbar** sein. „Erste Exposition" eines Bildes ist in
> dem Moment, in dem es gerendert/angezeigt wird — nicht erst beim Klick.

### 3.5 Zeitliche Anwendbarkeit

- Die Transparenzpflichten des **Art. 50 (Kapitel IV)** gelten seit dem **2. August 2026**
  (Art. 113 Abs. 2 i. V. m. Art. 113 — das allgemeine Anwendungsdatum des AI Act; die
  Verordnung wurde am 12. Juli 2024 im Amtsblatt veröffentlicht, Inkrafttreten 1. August 2024).
- Bezug: Verordnung (EU) 2024/1689, Art. 113.
- Das Datum ist **überschritten**; die Pflicht ist bereits anwendbar. Es besteht kein
  Übergangszeitraum für diese Bilder.

### 3.6 UWG § 5 — Irreführung durch Bilder

§ 5 Abs. 4 UWG stellt ausdrücklich klar, dass **bildliche Darstellungen** „Angaben" im Sinne
des § 5 Abs. 2 UWG ersetzen können. Ein KI-Bild, das wie eine echte Referenz wirkt, kann daher
selbst die irreführende Angabe sein (insbesondere zur „Ausführung"/„Beschaffenheit" der
Dienstleistung und zu „Ergebnissen", § 5 Abs. 2 Nr. 1 UWG).

> Das ist **kein AI-Act-Problem**, sondern ein UWG-Problem — und es besteht **auch ohne** dass
> man sich auf eine Deepfake-Einstufung einlässt. Deshalb ist die Offenlegung hier doppelt
> begründet (AI Act **und** Lauterkeitsrecht).

### 3.7 Ergebnis der Anwendbarkeitsprüfung

| Pflicht | Norm | Träger | Für dieses Projekt |
|---|---|---|---|
| Maschinenlesbare Kennzeichnung | Art. 50 Abs. 2 | **Anbieter** (Generator) | nicht in unserer Hand; nicht behaupten |
| Offenlegung KI-Inhalt | Art. 50 Abs. 4 | **Deployer** (Betreiber) | **ja** — durch sichtbaren Hinweis erfüllen |
| Klar + unterscheidbar, zur ersten Exposition, barrierefrei | Art. 50 Abs. 5 | Deployer | **ja** — bestimmt Platzierung/Sichtbarkeit |
| Irreführungsverbot | UWG § 5 | Betreiber | **ja** — Copy-/Caption-Regeln (Abschnitt 5.4) |

---

## 4. Ist-Zustand der Dateien (Belege)

### 4.1 Quell-Assets — **keine** Provenienz-Metadaten vorhanden

Untersuchung der PNG-Chunk-Struktur (`tEXt`/`iTXt`/`zTXt`/`eXIf`) und der JPEG-Marker
(`APP1` EXIF/XMP, `COM`) in `src/assets/img/`.

**Ergebnis PNG (alle sieben Fotos):** nur Standard-Chunks, **kein** `tEXt`/`iTXt`/`zTXt`,
**kein** `eXIf`, **kein** C2PA/JUMBF-Manifest, **kein** Software-/Generator-Tag.

```
foto3.png  … foto11.png: IHDR, gAMA, sRGB, cHRM, PLTE, bKGD, pHYs, tIME, IDAT…, IEND
                          (keine Text-/Provenienz-Chunks)
```

**Ergebnis JPEG (`logo_ivo.jpeg`):** nur `APP0` (JFIF) und `APP2` (ICC-Farbprofil).
**Kein** `APP1` (EXIF/XMP), **kein** `COM`-Kommentar, **kein** Generator-Tag.

**Einziger maschinenlesbarer Zeitstempel** ist der PNG-`tIME`-Chunk (Erstell-/Änderungszeit
des Alt-Bestands):

| Datei | `tIME` |
|---|---|
| foto3.png | 2025-07-08 07:09:02 |
| foto6.png | 2025-07-08 07:11:19 |
| foto7.png | 2025-07-08 07:15:49 |
| foto8.png | 2025-07-08 07:13:52 |
| foto9.png | 2025-07-08 07:17:51 |
| foto10.png | 2025-07-08 07:19:27 |
| foto11.png | 2025-07-08 07:20:20 |

> **Befund:** Die Quelle **enthält keinerlei KI-Kennzeichnung**. Es gibt also nichts, was
> „erhalten" werden könnte. Der AI-Act-konforme Zustand muss über den **sichtbaren Hinweis**
> hergestellt werden.

### 4.2 Build-Output — Markierung überlebt den Astro-Rewrite **nicht**

Die Bilder werden über `astro:assets` (`<Image>`) zu AVIF/WebP in mehreren Breiten
umgerechnet (Bildpipeline: **Astro 7.3.8 / sharp 0.35.5**; siehe `dist/client/_astro/`).

Untersuchung aller erzeugten AVIF-/WebP-Dateien auf Metadaten-Schlüssel
(`EXIF`, `XMP`, `c2pa`, `jumbf`, `Software`, `Creator`, Generator-Namen):

```
Alle dist/client/_astro/*.avif und *.webp: meta-hits: NONE
```

**Gegenprobe (Reproduktion, Beweis der Ursache):** Eine **Kopie** von `foto3.png` wurde mit
künstlichen `tEXt`- („Software: Midjourney-TestGen 1.0") und `iTXt`-XMP-Chunks versehen und
durch dieselbe sharp-Pipeline (Default **und** `withMetadata()`) geschickt:

| Ausgabe | Default | `withMetadata()` |
|---|---|---|
| WebP | `NO METADATA` | `NO METADATA` |
| AVIF | `NO METADATA` | `NO METADATA` |

> **Befund:** sharp entfernt PNG-Text-/XMP-Chunks beim Transkodieren — auch mit
> `withMetadata()`. Eine im Quellbild eingebettete Kennzeichnung würde nach dem Astro-Rewrite
> **verschwinden**. Maschinenlesbare Kennzeichnung ist mit der heutigen Pipeline **nicht
> haltbar** und darf nicht zugesagt werden.

### 4.3 Reproduktion der Belege

```bash
# Chunk-/Marker-Analyse der Quellen (kein exiftool nötig, reines Python):
python3 - <<'PY'
import struct, os
d="src/assets/img"
for fn in sorted(os.listdir(d)):
    data=open(os.path.join(d,fn),'rb').read()
    if data[:8]==b'\x89PNG\r\n\x1a\n':
        off=8
        while off<len(data):
            ln=struct.unpack('>I',data[off:off+4])[0]
            t=data[off+4:off+8].decode('latin1')
            if t in ('tEXt','iTXt','zTXt','eXIf') or t=='tIME':
                print(fn,t,data[off+8:off+8+ln][:60])
            off+=12+ln
            if t=='IEND': break
PY

# Metadaten im Build-Output:
grep -rl -e c2pa -e jumbf -e EXIF -e Software dist/client/_astro || echo "keine Metadaten im Output"
```

---

## 5. Verbindliche Anforderungen

### 5.1 Sichtbarer KI-Transparenzhinweis (Vorgabe für MARAA-10 + MARAA-11)

**Wortlaut-Rahmen (verbindlich, endgültige Redaktion durch Content):**

- **Vollform (an der Bildstelle, z. B. Galerie / Hero / Leistungsdetail):**
  > „Ein Teil der hier gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt oder
  > bearbeitet. Die Aufnahmen sind **beispielhafte Darstellungen** von Räumen, Materialien und
  > Oberflächen — **keine Abbildungen konkret ausgeführter Kundenprojekte**."

- **Kurzform (dauerhaft im Footer, jede Seite):**
  > „Bildhinweis: Einzelne Bilder dieser Website sind KI-generiert (beispielhafte
  > Darstellungen, keine realen Projekte)."

Die Kurzform ist ein **echter Textknoten** (kein `title`, kein `aria-label`), optional mit Link
auf die Vollform bzw. den Impressum-Abschnitt „Bildhinweis".

**Platzierung (verbindlich):**

1. **An jeder Bildstelle:** Jede Seite, die ein KI-Bild rendert, zeigt die Vollform **im
   selben Abschnitt/Landmark wie die Bilder** (unmittelbar vor oder nach der Bildliste, als
   sichtbarer Absatz). Betroffen sind mindestens: Startseite (Hero `foto3`), „Über uns" (Hero
   `foto3`), alle vier Leistungsseiten (Hero-Bild) sowie jede Galerie/Sektion mit
   `foto3, 6, 7, 8, 9, 10, 11`.
2. **Seitenweit dauerhaft:** Die Kurzform steht **im Footer auf jeder Seite** (Komponente
   `Footer.astro`), damit der Hinweis nie weiter als einen Abschnitt entfernt ist.
3. Der Hinweis darf **nicht** nur im Impressum, nur in einem Tooltip oder nur als
   `alt`-Text stehen.

**Sichtbarkeit / A11y (verbindlich, greift ADR 0001 §9.1 auf):**

- Sichtbarer Text ohne Interaktion; **kein** `display:none`, **kein** `visibility:hidden`,
  **kein** `aria-hidden`, **kein** nur per Hover erscheinender Hinweis.
- **Kontrast ≥ 4,5:1** gegen den Hintergrund (WCAG 2.1 AA).
- Schriftgröße mindestens so groß wie der übrige Fließtext/„kleine" Text der Seite.
- Für Screenreader **in Lesereihenfolge** erreichbar. Empfohlen: Absatz mit `id`
  (z. B. `id="ki-bildhinweis"`), von der Galerie-Sektion per `aria-describedby="ki-bildhinweis"`
  referenziert **oder** direkt als sichtbarer Absatz benachbart. Nicht ausschließlich über
  `aria-label` transportieren.
- Sprache bleibt `de` (kein fremdsprachiger Textabschnitt).
- Fällt ein Bild mit `figcaption` aus: Der Hinweis steht **nicht** nur in der Caption, sondern
  zusätzlich als eigener sichtbarer Absatz.

**Komponenten-API (Lead-Architect-Entscheidung, Design bleibt beim Designer):**
Eine wiederverwendbare Komponente (Vorschlag `src/components/KiBildHinweis.astro`) mit
Props `{ variant: "full" | "short"; id?: string }`; sie rendert die obige Voll-/Kurzform als
`<p>` und besitzt keine eigenen Farb-/Abstands-Literale (Tokens aus dem Design-System). Die
Komponente `GalleryGrid.astro` (§7) und die Hero-/Service-Sektionen binden sie ein. **Exakte
visuelle Ausprägung legt der Designer fest; die Erfüllung der obigen Sichtbarkeits- und
A11y-Regeln ist nicht verhandelbar.**

### 5.2 Metadaten-Policy (Provenienz erhalten/ergänzen, nicht entfernen)

Grundsatz: **Vorhandene Provenienz nie entfernen; fehlende nicht vortäuschen.**

- **Heute:** Die Quellen enthalten **keine** Provenienz (Abschnitt 4.1), und die Pipeline
  entfernt solche Marker ohnehin (Abschnitt 4.2). Es gibt nichts zu bewahren.
- **Interne Provenienz-Akte (verbindlich, MARAA-10 liefert die Werte):** Ein versioniertes
  Manifest `content/bild-provenienz.json` (Beispiel-Schema siehe unten) hält je Datei:
  Dateiname, Herkunft („Alt-Auftritt"), `ki_generiert: true`, `generator:
  "unbekannt (Kundenangabe)"`, `erstellt_am` (aus `tIME`), `offenlegung` (Art. 50 Abs. 4,
  ja/nein) und `projektzuordnung: "keine"`. Das ist der **prüfbare Nachweis** (ergänzt den
  sichtbaren Hinweis, ersetzt ihn nicht).
- **Keine maschinenlesbare Kennzeichnung zusagen:** Art. 50 Abs. 2 liegt beim Generator-Anbieter
  (Abschnitt 3.2). Eine eigene C2PA-Signatur der Build-Artefakte ist mit der heutigen Pipeline
  **nicht** umsetzbar und wird **nicht** zugesagt (siehe „Nicht beansprucht", Abschnitt 8).
- **Regressionsschutz für die Zukunft:** Sobald ein Quellbild je Provenienz trägt, muss ein
  Test (MARAA-12) fehlschlagen, wenn diese im `dist`-Output fehlt. Bis dahin dokumentiert diese
  ADR die Lücke ehrlich.

Beispiel-Schema (`content/bild-provenienz.json`):

```json
{
  "$comment": "Provenienz-Akte KI-Bilder. Werte aus ADR 0002 + tIME-Chunks. Generator unbekannt.",
  "bilder": [
    { "datei": "foto3.png",  "herkunft": "Alt-Auftritt", "ki_generiert": true,
      "generator": "unbekannt (Kundenangabe)", "erstellt_am": "2025-07-08T07:09:02",
      "offenlegung": true, "projektzuordnung": "keine" }
  ]
}
```

### 5.3 Alt-Text- und Bildunterschriften-Policy

- Alt-Texte **beschreiben nur den sichtbaren Inhalt** und behaupten **keine**
  Projektzuordnung, **keine** Kundennamen, **keine** Ortsangaben als Beleg.
  Der bestehende Stand (`src/lib/images.ts`) erfüllt das bereits.
- **Keine** Formulierungen in Alt/Caption wie „Unser Projekt …", „Referenz …",
  „Vorher/Nachher unserer Arbeit", „So sieht es nach unserer Arbeit aus".
- **Kein** KI-Hinweis ausschließlich im Alt-Text oder ausschließlich in der Caption
  (Screenreader-/Sichtbarkeitsgrund, Abschnitt 5.1).
- **Dekorative Bilder** (`foto9` mit `alt=""`) bleiben dekorativ; die Offenlegung ist davon
  unabhängig (eigener sichtbarer Absatz).

### 5.4 UWG-§ 5-Textregeln (Copy darf KI-Bilder nicht als reale Projekte darstellen)

**Verboten (Blocker im Review):**

- „Referenz", „Referenzprojekt", „Unser Projekt", „Umgesetztes Projekt" im unmittelbaren
  Bezug auf ein KI-Bild.
- „Echte Kundenprojekte", „Vorher/Nachher (unserer Arbeit)", „Aus unseren Projekten".
- Jede Formulierung, die ein KI-Bild als **Dokumentation** einer real ausgeführten Leistung
  oder eines realen Ortes darstellt.

**Zulässig (Positivliste):**

- „Beispielhafte Darstellung", „So kann es aussehen", „Material- und Raumeindruck",
  „Illustration", „Symbolbild".

**Sonderfall:** Bestätigt der Kunde später, dass ein bestimmtes Bild ein **echtes** ausgeführtes
Projekt zeigt, wird für dieses Bild die Offenlegung invertiert (es bleibt dann ein reales
Referenzbild ohne KI-Hinweis). Die Zuordnung „KI" wird **nicht** stillschweigend geändert,
sondern über die Provenienz-Akte (5.2) nachgeführt.

### 5.5 Impressum und Datenschutzerklärung

- **Datenschutz (DSGVO):** Die KI-Bilder zeigen **keine Personen**, sondern Räume, Materialien
  und Fassaden, und sind **synthetisch** — es werden dadurch **keine personenbezogenen Daten**
  verarbeitet. Eine Erweiterung der Datenschutzerklärung ist **nicht erforderlich**.
  *Ausnahme (an die Content-Redaktion):* Sollte ein Bild je eine **identifizierbare reale
  Person** zeigen, ist das ein datenschutzrechtlicher Fall → Bild ersetzen oder Einwilligung
  einholen (dann zurück an den Lead Architect).
- **Impressum:** Ein KI-Hinweis ist **keine** Pflichtangabe nach § 5 DDG. **Empfohlen** ist ein
  kurzer Absatz „Bildhinweis" im Impressum mit der Vollform aus 5.1 (Content, `[empfohlen]`,
  kein Blocker). Der **tragende** Compliance-Baustein bleibt der sichtbare Hinweis an der
  Bildstelle + Footer.
- Beide Rechtsseiten liegen weiterhin unter dem bestehenden **Prüfvermerk** (Freigabe durch den
  Rechtsprüfer des Kunden vor Livegang).

### 5.6 Logo (`logo_ivo.jpeg`)

Das Logo ist eine Bildmarke zur Kennzeichnung des Betriebs, kein darstellender Bildinhalt.
Es erfüllt den Deepfake-Begriff des Art. 3 Nr. 60 **nicht** (kein „existierender Ort/Person/
Ereignis", keine Täuschung über Authentizität). Eine **Pflicht**kennzeichnung besteht nicht.
Für maximale Transparenz deckt die Formulierung in 5.1 („Ein Teil der Bilder …") das Logo
ohnehin mit ab; eine gesonderte Logo-Kennzeichnung wird **nicht** verlangt.

---

## 6. Entscheidung D1 — behalten + flaggen vs. ersetzen

**Entscheidung: Die sieben KI-Bilder und das Logo bleiben erhalten und werden gekennzeichnet.
Ersetzt werden sie nicht.**

Begründung:

1. **Rechtlich ausreichend:** Der AI Act verlangt **Offenlegung**, nicht Entfernung. UWG § 5
   verlangt **Trennschärfe** zwischen KI-Illustration und realer Referenz — beides ist über
   Hinweis + Copy-Regeln erfüllbar.
2. **Kein Referenzanspruch vorhanden:** Das Design sieht bereits „Originalbilder ohne
   Referenzbehauptung" vor (`docs/design/komponenten.md` §7). Es wird kein reales Projekt
   behauptet, das durch die KI-Bilder widerlegt würde.
3. **Kundenvorgabe:** Der Kunde will die Bilder behalten und nur konform machen
   (Interaktion `950f0d46`). Ein Austausch wäre eine ungefragte Änderung seiner Bildauswahl.
4. **Verhältnismäßigkeit:** Ersatz durch echte Fotos wäre teuer, nicht beauftragt und würde das
   Risiko nicht unter das Labeling-Niveau senken (das Labeling ist der kleinste Eingriff).

**Ausnahmen — Bild muss ersetzt/geändert werden (nicht nur geflaggt), wenn:**

- ein Bild eine **identifizierbare reale Person** zeigt (Datenschutz/Persönlichkeitsrecht),
- der Kunde die **Rechte** an den generierten Ausgaben nicht bestätigen kann (Urheberrecht —
  offener Punkt, siehe Abschnitt 7),
- das Bild tatsächlich **kein KI-Bild**, sondern ein **Echtes** ist (dann invertierte
  Kennzeichnung, Abschnitt 5.4).

---

## 7. Schnittstellen, Annahmen und offene Punkte

**Schnittstelle zu MARAA-10 (Content):**
Wortlaut 5.1, Provenienz-Akte 5.2, Alt-Texte 5.3, UWG-Formulierungen 5.4, Impressum-Satz 5.5.

**Schnittstelle zu MARAA-11 (Frontend):**
Komponente + Einbindung 5.1 (Platzierung, Sichtbarkeit, A11y), Rendering des Hints auf allen
betroffenen Seiten, Footer-Kurzform, keine Metadaten-Zusage.

**Schnittstelle zu MARAA-12 (QA):**
Prüft: Hint auf jeder Bildseite sichtbar + im DOM/`aria-describedby`, Kontrast ≥ 4,5:1,
kein `title`-Only, Alt-Texte ohne Projektbehauptung, Copy ohne Referenzbegriffe.

**Annahmen:**

- A1: Bilder sind KI-generiert (Kundenangabe `950f0d46`).
- A2: Bilder sind illustrativ, keine realen Projekte.
- A3: Der Kunde hat die Bilder nicht substanziell nachbearbeitet (kein Provider-Status).

**Offene Punkte (nicht von dieser ADR entschieden, an Rechtsprüfer/Kunde):**

- O1: **Generator/Werkzeug** unbekannt — für die Provenienz-Akte nur „unbekannt
  (Kundenangabe)". Der Kunde kann das nachliefern.
- O2: **Rechte an den Ausgaben** (Urheber-/Nutzungsrechte des Generators bzw. des Kunden) —
  nicht Teil des AI Act, aber livegang-relevant. An den Kunden/Rechtsprüfer.
- O3: **Rechtliche Freigabe** der endgültigen Texte und dieser Einordnung vor Livegang
  (bestehender Prüfvermerk der Rechtsseiten).

---

## 8. Verifikation dieses Dokuments

**Was belegt ist (ausgeführt in dieser Sitzung, 2026-10-14):**

- Quell-Assets ohne Provenienz-Metadaten: Chunk-/Marker-Analyse `src/assets/img/*`
  (`tEXt`/`iTXt`/`zTXt`/`eXIf`, JPEG `APP1`/`COM`) → keine Treffer; nur `tIME`-Werte
  (Tabelle 4.1). *Verfahren: Python-Chunk-Parser, kein externes Tool nötig (4.3).*
- Build-Output ohne Metadaten: `dist/client/_astro/*.avif|*.webp` → `meta-hits: NONE`.
- Pipeline-Ursache reproduziert: sharp 0.35.5 transkodiert eine PNG-Kopie mit `tEXt`+`iTXt`
  nach WebP/AVIF → `NO METADATA`, auch mit `withMetadata()` (Tabelle 4.2).
- Versionsstand: Astro 7.3.8, sharp 0.35.5.

**Nicht beansprucht (ehrliche Grenze):**

- **Keine** maschinenlesbare Kennzeichnung der Build-Artefakte (C2PA/JUMBF). Mit der heutigen
  Pipeline technisch nicht haltbar (4.2) und für den Deployer ohnehin nicht Pflicht (3.2).
- **Keine** Rechtsberatung; die endgültige rechtliche Würdigung erfolgt durch den Prüfer (7/O3).

---

## 9. Konsequenzen im Gesamtbild

- Die Bilder bleiben, der Auftritt wird **transparenter**: sichtbarer Hinweis an jeder Bildstelle
  plus Footer, klare Copy-Trennung zwischen „Beispiel" und „Referenz".
- **Kein** Overhead für die Performance-Budgets aus ADR 0001 §7: Der Hinweis ist Text, keine
  Bild-/Skript-Ressource; kein Drittanbieter, keine Consent-Relevanz.
- Die technische Lücke der maschinenlesbaren Kennzeichnung ist **dokumentiert**, nicht kaschiert;
  sie ist dem Generator-Anbieter zugeordnet und als offener Punkt (O1) geführt.
- MARAA-10 und MARAA-11 erhalten mit Abschnitt 5 eine **prüfbare** Arbeitsgrundlage; MARAA-12
  prüft gegen Abschnitt 7 (QA-Schnittstelle).
