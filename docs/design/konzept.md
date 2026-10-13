# Design-Konzept — Ivo-Mertsch-Relaunch

| | |
|---|---|
| **Status** | Abgabe MARAA-4 (Design). Vorgabe für MARAA-5 (Frontend). |
| **Datum** | 2026-10-13 |
| **Autor** | Designer, PixelForge Studio, Issue MARAA-4 |
| **Kontext** | MARAA-1 — Ivo-Mertsch-Relaunch. |
| **Grundlage** | `docs/adr/0001-stack-und-consent-architektur.md` (verbindlich), `content/informationsarchitektur.md`, `content/start.md`, `docs/contracts/*` |
| **Ergebnisdateien** | `docs/design/konzept.md` (dieses), `docs/design/tokens.json` (kanonisch), `docs/design/tokens.css` (generiert), `docs/design/komponenten.md` |

---

## 0. Der Richtungssatz

> **Fugenlos heißt hier: die Seite hat keine Trennlinien. Sektionen wechseln den Ton und
> das Korn der Fläche — und die eine waagerechte Linie des ganzen Auftritts steht genau
> an der Stelle, an der der Besucher sich entscheidet.**

Der Satz enthält eine Entscheidung, keine Stimmung: *keine* Divider-Linien zwischen
Sektionen, *Tondifferenz + Korn* statt Kante, *genau eine* Linie im gesamten Auftritt,
und zwar an der Conversion-Stelle (Übergang in das CTA-Band). Wer fragt „Was war die Idee
dahinter?", bekommt diese Entscheidung — nicht „modern, clean, hochwertig".

Das ist keine Metapher auf Vorrat: Das Produkt des Kunden ist die **2K-Beschichtung** —
eine Oberfläche ohne Fuge, bei der zwei Bereiche ineinander übergehen, statt an einer
Kante aufeinanderzutreffen. Die Gestaltung übersetzt das Produktversprechen in die
Oberfläche der Seite selbst. Ein Besucher, der das versteht, hat die Leistung schon
verstanden, bevor er die Leistungsseite öffnet.

---

## 1. Zwei Richtungen, eine Empfehlung

### Richtung A — „Werkstoff-Premium: Fugenlos"

- **Grundidee:** Das Produktprinzip (fugenlos) wird Gestaltungsprinzip. Keine Kanten
  zwischen Sektionen; Übergänge über Tonwert und Korn, wie der Wechsel von matt zu
  seidenglänzend auf derselben Fläche.
- **Farbwelt:** warme Kalkstein-Neutrals (von „Kalkweiß" bis „Schwarzstein"), **eine**
  Akzentfarbe **Tiefpetrol** (ausgehärteter 2K-Film), Semantik nur für Feedback.
- **Typografie:** Serif/Sans-Mix — **Fraunces** (Display) trägt Substanz und Materialität,
  **Instrument Sans** (Text) trägt Präzision und Ruhe. Hierarchie über Familie, Gewicht,
  Laufweite und Farbe, nicht nur über Größe.
- **Bildsprache:** die **Originalfotos des Kunden** als Werkstoffproben — groß, ruhig,
  feste Seitenverhältnisse, keine Stockfotos, keine Projektbehauptungen.
- **Icon-Stil:** dünne, geometrische Linienikonen (1,5 px, 24-px-Raster), runde Kappen.
  Kein Icon-Framework (Gewichtsbudget), kein gefülltes Icon außer den Bewertungssternen.
- **Weißraum:** Rhythmus aus der Abstandsskala; Sektionen atmen unterschiedlich (nicht
  uniform), mit genau einer Durchatemstelle vor dem CTA-Band.
- **Risiko:** Eine so ruhige Gestaltung kann „leer" wirken, wenn die Originalbilder
  schwach sind oder die Rechte fehlen — siehe offene Punkte.

### Richtung B — „Handwerk-Klassisch"

- **Grundidee:** Der klassische Meisterbetrieb: dunkles Anthrazit/Navy als Rahmen, Messing/
  Gold als „hochwertig"-Signal, Serif-Headline, ornamentale Trennlinien, gerahmte Karten.
- **Farbwelt:** dunkle Fläche dominant, Gold als zweite „Wert"-Farbe.
- **Typografie:** Serif-Display plus Utility-Sans.
- **Bildsprache:** gerahmte Fotos, Label-Plakette, Zertifikats-Icons.
- **Icon-Stil:** gefüllte, kräftige Icons mit Kreis-Hintergrund.
- **Weißraum:** gleichmäßig, rahmend.
- **Risiko:** Das ist eine **Kostümierung**, keine Designidee. Sie könnte 1:1 über jeden
  Meisterbetrieb gestülpt werden, sagt nichts über fugenlose Flächen, und das Gold
  signalisiert „hochwertig" über Klischee statt über das Material.

### Empfehlung

**Richtung A wird empfohlen und ist Vorgabe für MARAA-5.** Drei Gründe:

1. **Sie ist aus dem Produkt ableitbar, nicht aus einem Geschmack.** „Fugenlos" ist der
   einzige echte Differenzierungsbegriff des Auftritts — A macht ihn zur Gestaltungsregel
   („es gibt keine Kanten"), B nur zur Behauptung im Text.
2. **Sie trägt Barrierefreiheit und Performance.** Warme, helle Neutrals mit einem dunklen
   Textton ergeben Kontraste von 4,87:1 bis 15,65:1 ohne Tricks; keine Verläufe, keine
   Schatten-Kaskade, keine Slider. Die Kosten der Richtung sind CSS, nicht Bytes.
3. **Sie altert.** „Fugenlos" bleibt die Aussage des Kunden, solange er 2K-Beschichtungen
   macht. Ein Messing-Gold-Look wäre in zwei Jahren ein Zeitstempel.

Die alten WordPress-Auftritte dieses Segments sehen sich alle ähnlich (Richtung B). A ist
der einzige Weg, „messbar besser" auch *sichtbar* zu machen.

---

## 2. Richtungs-Referenz

Drei Vorbilder, **alle aus derselben Welt** (Oberfläche, Material, Präzisionshandwerk) —
plus der ausdrückliche Gegenpol.

| Rolle | Referenz | Was genau übernommen wird |
|---|---|---|
| Material-Farbe | **Farrow & Ball** (Anstrich/Farbe) | Farbe als *Material*, nicht als Dekor. Ein tiefer, satter Ton wird sparsam und flächig eingesetzt; die Neutrals sind warm und haben Namen, keine Nummern. |
| Präzision | **Vitsœ** (Möbelsystem) | Kein Chrome, keine Verzierung. Hierarchie trägt die Typografie; Module atmen; Weißraum ist Funktion, nicht Rest. Keine Schatten, um Flächen zu trennen. |
| Ruhe & Taktilität | **Aesop** (Hautpflege) | Warme neutrale Palette, ein Akzent, sichtbare Materialkörnigkeit, extrem zurückhaltende Navigation — Bild und Fläche dürfen der Inhalt sein. |
| **Gegenpol** | **Das „Meisterbetrieb-Template"** (Handwerker-/Portal-Seiten) | Dient als Warnbild: blaue CTA-Leiste, drei gleich große Icon-Kästen, „Ihr starker Partner für …", uniforme Sektionsrhythmik. Was hier zutrifft, wird verworfen. |

Die Referenzen liefern Prinzipien, keine Designs. Übernommen wird **die Haltung** —
sparsamer Akzent, typografische Hierarchie, Materialkorn, ruhige Navigation — nicht das
Aussehen der Vorbilder.

---

## 3. Farbwelt

**Dokumentierte Palette, eine Akzentfarbe.** Kanonische Werte: `docs/design/tokens.json`
→ `primitives.color`. Semantische Belegung: `alias.light` / `alias.dark`.

| Rolle | Skala | Wert(e) | Einsatz |
|---|---|---|---|
| Neutral (dominant) | `neutral.0 … 950` | `#FFFFFF` … `#15120D` | Flächen, Text, Linien, Korn. Warmer „Kalkstein"-Ton, nie reines Grau. |
| **Akzent (die EINE)** | `accent.50 … 900` | `#EDF3F1` … `#061C1A`, Kern `accent.700 #0E3A36` | Primär-CTA, Links, Fokusring, aktive Zustände. Sonst nichts. |
| Success | `success.1/3/5/7` | `#E3EFE1` `/ #7FB984 / #2E6B34 / #215227` | Nur Formular-Erfolg. Nie als Markenfarbe. |
| Error | `error.1/3/5/7` | `#FBE9E5 / #E8907F / #B02A18 / #8C1F11` | Nur Fehler-/Ungültig-Feedback. |
| Warning | `warning.1/3/5/7` | `#FBF0DA / #D9A441 / #8A5A06 / #6B4404` | Nur Hinweis, z. B. Denkmalschutz-Notiz. |

**60-30-10 (verbindlich):**

- **60 %** neutrale Fläche (`neutral.50` Seite, `neutral.100` vertieft, `neutral.0` Karten).
- **30 %** Ink und Struktur — Text (`neutral.900/700/600`), Linien (`neutral.200/700`),
  fotografierte Fläche (Bilder tragen denselben warmen Ton).
- **10 %** Petrol-Akzent plus Semantik — CTA-Flächen, Links, Fokusringe.

**Farbregeln (Prüfpunkte, nicht Geschmack):**

- Farbe ist **nie das alleinige** Unterscheidungsmerkmal. Aktive Navigation, Fehler,
  Erfolg und Bewertungssterne tragen immer zusätzlich Form, Text oder Symbol.
- Der Akzent erscheint **nie** in Validierungs-Feedback. Begründung: `accent-700`
  (Hue 174,5°) und `success-500` (125,9°) liegen nur ~49° auseinander; bei Farbfehlsicht
  ist die Verwechslung real. Validierung ist immer Success/Error/Warning + Icon + Text.
- Es gibt **genau eine** Akzentfarbe. Keine zweite „Hervorhebungs"-Farbe, kein Verlauf
  als Markenfarbe.
- Kontraste sind gegen den **realen** Hintergrund berechnet, nicht gegen eine Annahme
  (Karte `neutral.0` vs. Seite `neutral.50` vs. vertieft `neutral.100` sind getrennt
  geprüft). Alle Werte: `tokens.json → audit`, nachrechenbar via
  `python3 tools/build-tokens.py --audit`.

**Funktion der Tondifferenz (statt Linien):** `surface.page (neutral.50)` → `sunken
(neutral.100)` → `raised (neutral.0)` sind drei benachbarte, klar lesbare Töne. Sektionen
wechseln zwischen ihnen und dem Korn; es gibt keine `border-bottom` zwischen Sektionen.

---

## 4. Typografie-Prinzip

**Serif/Sans-Mix.** Zwei Familien, beide self-hosted, beide OFL, **kein Google-Fonts-
Request — auch nicht nach Consent** (ADR §7.4).

| Famile | Rolle | Stack (Fallback) | Quelle/Lizenz |
|---|---|---|---|
| **Fraunces** | Display: H1–H4, Ziffern-Momente, Zitate | `"Fraunces", "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif` | Undercase Type, SIL OFL 1.1 — self-hosted woff2, latin-Subset |
| **Instrument Sans** | Text: Fließtext, UI, Labels, Meta | `"Instrument Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` | Rodrigo Fuenzalida/Jordan Egstad, SIL OFL 1.1 — self-hosted woff2, latin-Subset |

**Prinzip:** Die Serif trägt **Substanz** (Material, Handwerk, Bestand), die Sans trägt
**Präzision** (Oberfläche, Bedienung, Ordnung). Deshalb: Überschriften in Fraunces,
alles Bedienbare und alles Lesetext in Instrument Sans. Keine dritte Familie, keine
Mono-Familie.

**Hierarchie über mehr als Größe** — jede Überschriftenebene ändert mindestens drei
Achsen gleichzeitig:

| Ebene | Familie | Größe | Gewicht | Laufweite | Farbe/Struktur |
|---|---|---|---|---|---|
| H1 Hero | Fraunces | `text.5xl` | 600 | `-0.02em` | `text.primary`, Maß 22ch |
| H2 Sektion | Fraunces | `text.3xl` | 600 | `-0.02em` | `text.primary`, oft mit Eyebrow darüber |
| H3 Karte | Fraunces | `text.lg` | 500 | `0` | `text.primary` |
| Lead | Instrument Sans | `text.md` | 400 | `0` | `text.secondary`, Maß 44ch |
| Body | Instrument Sans | `text.base` (16 px fix) | 400 | `0` | `text.primary`, Maß 62ch |
| Eyebrow/Label | Instrument Sans | `text.xs` (13 px) | 600 | `0.14em`, uppercase | `text.muted`, mind. 7:1 |

**Größenskala fluid** über `clamp()` zwischen 360 px und 1440 px Viewport (`tokens.json`
→ `typography.scale`, generiert in `tokens.css` als `--pf-text-*`). `base` bleibt **fix
16 px**, damit iOS-Inputs nicht zoomen.

**Zeilenlänge auf `ch` begrenzt** — die einzige ehrliche Sperre gegen zu breite Zeilen:
`measure.text 62ch` (Fließtext), `measure.lead 44ch` (Vorspann), `measure.display 22ch`
(Hero), `measure.micro 18ch` (Labels/Attribution).

**Text unter 16 px:** nur `text.xs` (13 px), und **nur** für uppercase-Eyebrows und Meta/
Attribution, die als Kompensation mindestens 7:1 erreichen (`neutral.600` auf hellen
Flächen: 4,87–6,06:1; auf der vertieften Fläche ist der Einsatz auf `neutral.700` zu
heben). Für alles Lesbare ist 16 px die Untergrenze. **Kein Text unter 16 px ohne diese
Kontrastkompensation.**

**Zahlen:** jeder Zahlenlauf in Spalte/Reihe (Telefonnummer, Adresse, Bewertungsdatum,
Sterne) bekommt `font-variant-numeric: tabular-nums` (`--pf-numeric-tabular`).

**Font-Budget (ADR §7.2, verbindlich ≤ 120 KB woff2 gesamt):** Fraunces als **variable**
woff2 (wght-Achse 400–700, latin-Subset) + Instrument Sans als **variable** woff2
(400–700, latin-Subset) = zwei Dateien. `font-display: swap`, `preload` nur für die
above-the-fold-Familie (Fraunces). Kein Preload für die Textfamilie, kein Preload für
beide. Erreicht das Paar 120 KB nicht, wird **nicht** auf eine dritte Familie
ausgewichen, sondern der Subset verkleinert und die Serif auf latin-basic reduziert
(§13, Rückfrage 3).

---

## 5. Bildsprache

**Grundsatz: nur eigenes Material.** Es werden ausschließlich die Originalbilder des
Kunden verwendet — `foto3`, `foto6`, `foto7`, `foto8`, `foto9`, `foto10`, `foto11`
sowie `logo_ivo.jpeg`. Keine Stockfotos, keine KI-Bilder, keine Referenzbehauptungen
(es gibt keine belegbaren Referenzen, siehe `content/informationsarchitektur.md`).

**Rolle der Bilder: Werkstoffproben.** Ein Foto zeigt eine Oberfläche, nicht „unsere
Arbeit". Deshalb keine Bildunterschrift, die ein Projekt behauptet; der Alt-Text
beschreibt nur, was sichtbar ist (Vorgaben in `content/start.md`).

| Position | Bild | Zuschnitt | Format / Budget |
|---|---|---|---|
| Hero Start | `foto3` | 16:10, `object-fit: cover` | AVIF, WebP-Fallback, 1200w LCP ≤ 120 KB, `fetchpriority="high"`, kein `lazy` |
| Leistungs-Karten (4) | `foto8`, `foto11`, `foto6`, `foto7` | 4:3 | AVIF/WebP, `srcset` 400/800w, `loading="lazy"`, `decoding="async"` |
| Leistungsdetail Hero | jeweiliges `foto*` | 16:9 | AVIF/WebP, 1200w, `fetchpriority="high"` |
| Galerie | `foto3, 6, 7, 8, 9, 10, 11` | 1:1 oder 4:3 gemischt | AVIF/WebP, `lazy` |
| Logo | `logo_ivo.jpeg` → rundes Abzeichen | 1:1, Kreis | als Avatar-Größe 40/48 px; SVG/PNG-Neuzeichnung angefragt (§13) |

**Technische Bildregeln (ADR §7.3, verbindlich):**

- Jede Bildposition hat ein **festes Seitenverhältnis** (`aspect-ratio`) und `width`/
  `height` — sonst CLS. `CLS ≤ 0,1` ist ein Gate.
- AVIF zuerst, WebP als Fallback, **kein PNG/JPEG** für Fotos im Auslieferungsstand
  (die 0,7–1,7 MB großen PNGs sind Rohmaterial, nicht Lieferformat).
- Deko-Bilder `alt=""` + `aria-hidden="true"`; inhaltstragende Bilder mit echtem Alt-Text.
- Kein Parallax, kein Zoom-on-Hover über `transform: scale` auf dem Foto (das ist
  Deko-Bewegung ohne Aussage) — Hover geschieht über Fläche und Rahmen des Containers.

**Behandlung:** eine ruhige, konsistente Gradation; die warme Neutralpalette verlangt keine
Farbkorrektur der Fotos. Keine Filter, keine Duotone, keine starken Vignetten. Das Foto
**ist** das Material und bleibt unangetastet.

---

## 6. Icon-Stil

- **Linien-Ikonen**, Strichstärke **1,5 px** (bei 24 px Box, `vector-effect: non-scaling-stroke`
  vermeiden), **runde Kappen und runde Ecken**, geometrisch, offen.
- **Inline-SVG**, entweder einzeln im Markup oder als ein `<symbol>`-Sprite auf der
  eigenen Origin. **Kein Icon-Framework, kein Icon-Font** (Bytes, DSGVO, CLS).
- **Set (minimal, nur was gebraucht wird):** Telefon, WhatsApp/Chat, E-Mail, Instagram,
  Pfeil rechts, externer Link, Häkchen, Ausrufezeichen/Warnung, Schließen (×), Menü,
  Chevron, Stern.
- **Gefüllt** wird nur der **Stern** (Bewertung) — und Füllung als *Zustand* (gewählte
  Sterne), weil `aria-label`-Text die Wertung ohnehin nennt.
- **Barrierefreiheit:** dekorative Icons `aria-hidden="true"` und `focusable="false"`;
  ein Icon, das allein eine Aktion trägt, hat einen unsichtbaren Textnamen
  (`<span class="pf-visually-hidden">`).
- **Optische Korrektur:** runde Ikonen und das runde Logo erhalten denselben optischen
  Radius; ein Icon in einem Kreis wird 1 px kleiner gezeichnet als die Kreisfläche
  (optische Mitte), damit es nicht „auf dem Rand klebt".

---

## 7. Weißraum & Raster

- **Rhythmus nur aus der Abstandsskala** (`space.0 … 14`, 4 px bis 160 px). Keine
  Zwischenwerte, kein Magic-Number-Margin.
- **Sektionen atmen unterschiedlich** — das ist die Gegenmaßnahme gegen uniforme
  Sektionsrhythmik (Template-Signal 1): Standard ist `section-y` (64 px) mobil /
  `section-y-md` (128 px) ab `md`; das Hero und die Leistungsübersicht dürfen größer
  atmen, das CTA-Band bekommt die **eine Durchatemstelle** (`breathe-y` = 160 px).
- **Konsistentes Raster:** 4 Spalten mobil / 12 Spalten ab `md`, Gap `grid-gap` 16 px /
  `grid-gap-md` 24 px. Der Container ist `container.max` 1200 px, `prose` 640 px.
- **Text bleibt im Container:** `max-width` am Container, `measure.*` am Text. Beides
  zusammen, weil ein Container allein zu breiten Text erlaubt.
- **Optische Korrektur:** runde Ikonen/Avatare optisch ausrichten; Serif-Großbuchstaben
  mit negativer Laufweite bekommen visuell ausgeglichenen Rand (Hero-Zeile leicht
  „hängen" lassen, kein mathematisch gleiches Padding).
- **Whitespace variiert:** nicht jede Sektion hat denselben vertikalen Abstand. Eine
  bewusst große Fläche (Durchatemstelle) vor dem CTA-Band ist eingeplant.

---

## 8. Mobile-first-Grundhaltung

- **Basis ist 360 px**, alles darüber sind `min-width`-Erweiterungen (`bp.sm 480`,
  `md 768`, `lg 1024`, `xl 1280`, `2xl 1440`). Kein `max-width`-Downsizing als
  Primärstrategie.
- **Touch-Targets ≥ 44 px** (`touch-target` aus Tokens) — auch für Icon-Buttons,
  Breadcrumb-Links und Toggle-Switches.
- **Primär-CTA mobil = wählen/erreichen.** Der Header trägt die Telefonnummer als
  `tel:`-Link; unterhalb des Inhalts eine **Action-Bar** (Anrufen / WhatsApp) auf
  `--pf-z-sticky`, die den Inhalt nicht überdeckt (Body erhält unten `padding-bottom`
  in Höhe der Bar).
- **Lesbarkeit ohne Zoom:** 16 px Basisschrift, 1,5 Zeilenhöhe, `ch`-Maß auch mobil.
- **Kein horizontales Scrollen**, keine überbreiten Tabellen — Bewertungs- und
  Leistungsdaten brechen um.
- **Mobile-Navigation** als Drawer mit Fokusfalle (siehe `komponenten.md`).

---

## 9. Token-Deltas (was sich gegenüber dem Naheliegenden ändert)

Die „Deltas" sind die Stellen, an denen dieses System bewusst **anders** ist als ein
Standard-Tokenset. Sie sind für MARAA-5 verbindlich.

| Token-Rolle | Naheliegender Default | Delta dieses Auftritts | Warum |
|---|---|---|---|
| `surface.page` | `#FFFFFF` | **`neutral.50 #FBFAF6`** + Korn (`grain` 3,5 %) | Weiß ist kein Werkstoff; der warme Ton trägt die Materialität, das Korn nimmt das digitale „Blanken". |
| Sektions-Trennung | `border-bottom`/Divider | **Tondifferenz** (`page`/`sunken`/`raised`) + Korn | Fugenlos-Prinzip; kein Linienraster. |
| Waagerechte Linie | viele | **genau eine** (`seam`: `neutral.300`, 1 px) am CTA-Übergang | Die Ausnahme macht die Regel sichtbar. |
| Kartenschatten | `box-shadow` für Karten | **kein Kartenschatten**; nur `shadow-header/overlay/modal` | Karten trennen sich über Ton, nicht über Höhe. Schatten ist Overlay-only. |
| Radius | einheitlich 8 px | **Buttons `full` (Pill)**, Karten `lg` (20 px), Inputs `md` (12 px), Media `xl` (28 px) | Das Logo ist ein rundes Abzeichen → das Pill-Motiv ist begründet, nicht dekorativ. |
| Akzent | Primärblau | **ein** Akzent: Tiefpetrol `accent.700` | Farbe als Marke, nicht als Standard-CTA-Blau. |
| Semantikfarbe | frei nutzbar | **nie als Markenfarbe, nie in Validierung mit Akzent** | Hue-Distanz Akzent↔Success nur 49°. |
| Fokus | `outline: none` / dünn | **3 px Ring, außen, `accent.700`**, auf Akzentfüllung `neutral.0`, auf invertiert `accent.200` | WCAG 2.4.7/2.4.11; Ring nie „Border-Ersatz". |
| Dunkelmodus | aufhellen | **Rolle umbelegen**: Dark *dunkelt* auf Hover ab; CTA-Füllung wird `accent.400` (weißer Text 4,90:1, Fläche 3,81:1 gegen Seite) | Ein einziger Wert erfüllt beide Kontrastbedingungen. Default bleibt **Light** (Bildsprache ist hell), Dark ist vollständig spezifiziert und per `data-theme` aktivierbar. |
| Invertierte Fläche | theme-abhängig | **themenunabhängig dunkel** (`neutral.900`), genau eine im Produkt (Footer) | Der Footer ist in beiden Themes dunkel; spart eine zweite geprüfte Belegung. |
| Typo-Skala | statische px | **fluid `clamp()`** 360–1440, `base` bleibt fix 16 px | Skaliert ruhig, ohne iOS-Input-Zoom. |
| Motion | Übergänge überall | **zwei erlaubte Bewegungen** (Naht zeichnen, Oberfläche heben/senken); `prefers-reduced-motion` setzt alle Dauer auf 1 ms | Bewegung muss etwas erklären. |

---

## 10. Ein „Wow"-Detail pro Seite

Genau eines pro Seite. Zwei wären keins.

| Seite | Wow-Detail |
|---|---|
| **Start** | **Die eine Fuge.** Beim Übergang von den Leistungen in das CTA-Band zeichnet sich die einzige waagerechte Linie des Auftritts von links nach rechts (CSS `transform: scaleX`, `duration.slower`). Bei `prefers-reduced-motion: reduce` steht sie sofort. |
| **Leistungen (Sammel)** | **Werkstoffregister.** Die vier Leistungen stehen als vollbreite Registerzeilen mit einem Finish-Streifen; Hover/Focus beleuchtet den passenden Glanzgrad (matt / seidenglänzend / glänzend). Die Seite lehrt den Materialunterschied, statt ihn zu behaupten. |
| **Leistungen — Fugenlose Bäder** | **Der Detailausschnitt.** Ein gezoomter Ausschnitt aus `foto8` mit **einer** Callout-Linie auf die Stelle, an der üblicherweise eine Fuge sitzt — „hier ist bei uns keine Kante". Keine Montage, kein Vorher/Nachher ohne Beleg. |
| **Leistungen — Fugenlose Böden** | **Der Glanzgrad-Schalter.** Drei Zustände (matt / seidenglänzend / glänzend) verändern ausschließlich das Spekular-Highlight einer Vorschaufläche per CSS-Verlauf — rein dekorativ, per `aria-pressed` beschriftet. |
| **Leistungen — Innenausbau** | **Das Tonband.** Die vier Aufgabentypen (Renovierung, Sanierung, Neubau, Modernisierung) liegen auf vier benachbarten Flächen, deren Tonwert von links nach rechts *wandernd* gestuft ist — die Uniformität des 4er-Rasters wird bewusst gebrochen. |
| **Leistungen — Fassaden** | **Der Bestandsschutz-Vermerk.** Der Hinweis auf Denkmalschutz-Anstriche ist eine rahmenlose inline-Notiz in `warning` mit Icon + Text — die einzige Stelle im Auftritt, an der die Warnfarbe sichtbar wird. |
| **Über uns** | **Der Originalsatz.** Der Positionierungssatz des Kunden steht als typografischer Gipfel in `display.4xl` Serif auf der einzigen warmen Akzent-Subtle-Fläche der Seite. |
| **Bewertungen** | **Der gestaltete Leerzustand.** Liegt kein Korpus vor, ist die Abwesenheit gestaltet: eine ruhige Einladungskarte auf `sunken` mit dem CTA „Jetzt bei Google bewerten" — kein Loch, keine Sterne, kein Platzhalter-Avatar. Das ehrliche Nichts als Haltung. |
| **Kontakt** | **Die Direktwahl-Bar.** Mobil eine sticky Action-Bar (Anrufen / WhatsApp) mit der Nummer in `tabular-nums`, die den Inhalt nie überdeckt; ab `md` löst sie sich in die Kontaktwege-Liste auf. |
| **Impressum / Datenschutz** | **Die Randspalte.** Rechtsseiten bekommen ab `lg` eine sticky Inhalts-Randspalte mit Sprungmarken; mobil eine aufklappbare Sektionsliste. Nur bei Rechtstexten — sonst nie. |

**Der eine Überschriftentyp, der nicht in das Schema passt:** Alle Überschriften sind
Fraunces — **außer** der Eyebrow über der H2, die Sans ist. Damit markiert die
Familienachse den Übergang von der Ordnung (Sans) zur Aussage (Serif).

---

## 11. Der Template-Test

Frage: *Könnte man diese Seite 1:1 als Template verkaufen?*

Die drei Signale und ihre Gegenmittel:

1. **Uniforme Sektionsrhythmik** — verworfen: Sektionen wechseln Ton und Korn (nicht die
   Kante) und atmen unterschiedlich groß; eine definierte Durchatemstelle.
2. **Generische Hero-Formel** („Ihr Partner für Ihr Projekt") — verworfen: die H1 nennt
   ein konkretes Ergebnis ohne Floskel (`content/start.md`, Variante A, Empfehlung) und
   der Hero trägt **einen** Primär-CTA (kein CTA-Dreiklang als Textzeile; Telefon und
   WhatsApp sind Sekundär-/Tertiärwege in ruhiger Darstellung).
3. **Feature-Grid mit drei gleich großen Kästen und Icon** — verworfen: die vier
   Leistungen liegen in einem **asymmetrischen** Raster — die erste Karte
   (Fugenlose Bäder, das differenzierende 2K-Thema) spannt ab `md` **volle Breite**,
   die übrigen drei füllen darunter. Zudem tragen die Karten Bild und Finish-Streifen,
   keine Icon-Chips.

**Die eine Sektion, die die Erwartung bricht:** die Leistungsübersicht auf der Startseite
(asymmetrisches Register statt Dreier-Grid). Sie ist der Grund, warum die Seite nicht als
Template durchgeht.

---

## 12. Die 30 Prüfpunkte

Jeder Punkt binär. „Spec" = in dieser Spezifikation festgelegt und durch Tokens/Regeln
erzwingbar; „Messbar" = erst am gebauten Artefakt prüfbar, Gate für MARAA-6.

### Typografie (10)

| # | Punkt | Status | Beleg / Ort |
|---|---|---|---|
| T1 | Skala definiert | Spec | `typography.scale` 9 Stufen, fluid |
| T2 | Fließtext auf `ch` begrenzt | Spec | `measure.text 62ch`; `p { max-width }` |
| T3 | Hierarchie über mehr als Größe | Spec | §4-Tabelle: Familie+Gewicht+Laufweite+Farbe |
| T4 | Groß-/Kleinschreibung geregelt | Spec | Nur Eyebrow uppercase (`tx` 13 px, ≥7:1); H1–H4 in Normalschreibung |
| T5 | `tabular-nums` bei Zahlen | Spec | `--pf-numeric-tabular`, Klasse `.pf-numeric` |
| T6 | max. 2 Familien | Spec | Fraunces + Instrument Sans, keine dritte |
| T7 | kein Text < 16 px ohne Kontrastkompensation | Spec | nur `text.xs`=13 px, nur uppercase-Meta, ≥7:1 |
| T8 | Zeilenhöhe an Größe gekoppelt *(ergänzt)* | Spec | Rollen: Hero `tight` 1,08 → Body `normal` 1,5 → Lead `relaxed` 1,62 |
| T9 | Umbruchqualität statt Silbentrennung *(ergänzt)* | Spec | `text-wrap: balance` für H1–H4; kein `hyphens: auto` |
| T10 | Laufweite je Punktgröße korrigiert *(ergänzt)* | Spec | große Serif negativ (−0,02 … −0,03 em), Kleintext/Meta positiv (0,06 … 0,14 em) |

### Farbe (6)

| # | Punkt | Status | Beleg / Ort |
|---|---|---|---|
| F1 | dokumentierte Palette mit **einer** Akzentfarbe | Spec | `primitives.color`, `accent.*` |
| F2 | 60-30-10 eingehalten | Spec | §3 |
| F3 | Farbe nie alleiniges Unterscheidungsmerkmal | Spec | §3-Regeln; Icon+Text bei jedem Zustand |
| F4 | Kontrast gegen **realen** Hintergrund | Spec + messbar | `audit` je Fläche (page/sunken/raised/getrennt), `--audit` grün |
| F5 | Hover/Focus/Active unterscheidbar | Spec | §9 + `komponenten.md` Zustandstabellen |
| F6 | Palette funktioniert in Abstufungen | Spec | 11/10/4/4-Stufen-Skalen, Dark-Remap auditiert |

### Raum (7)

| # | Punkt | Status | Beleg / Ort |
|---|---|---|---|
| R1 | Rhythmus aus Scale | Spec | `space.0…14` |
| R2 | Sektionen atmen | Spec | `section-y`/`section-y-md` |
| R3 | konsistentes Raster | Spec | 4/12 Spalten, Container 1200 px |
| R4 | optische Korrektur bei Icons/Kreisen | Spec | §6, §7 |
| R5 | Text im Container | Spec | Container + `measure`, doppelt |
| R6 | Whitespace variiert | Spec | §7; Durchatemstelle `breathe-y` |
| R7 | eine Durchatemstelle | Spec | vor dem CTA-Band (160 px) |

### Interaktion (4)

| # | Punkt | Status | Beleg / Ort |
|---|---|---|---|
| I1 | Fokus überall sichtbar | Spec + messbar | globale `:focus-visible`-Regel, 3 px, `--audit` |
| I2 | echte Hover-Reaktion | Spec | jeder interaktive Zustand definiert (kein „kein Hover") |
| I3 | Touch-Targets ≥ 44 px | Spec + messbar | `touch-target`, Gate in `komponenten.md` |
| I4 | Fehlerzustände erklären **was** und **wie** | Spec | Formfeld-Spec: Fehlertext nennt Feld + Korrektur |

### Motion (3)

| # | Punkt | Status | Beleg / Ort |
|---|---|---|---|
| M1 | Bewegung erklärt etwas | Spec | nur 2 Bewegungen: Naht zeichnen, Fläche heben/senken |
| M2 | kein Element bewegt sich grundlos | Spec | keine Slider, kein Parallax, kein Auto-Play |
| M3 | `prefers-reduced-motion` umgesetzt | Spec + messbar | `tokens.css` §5: Dauer→1 ms, Easing→linear |

**Zählung:** 30 Punkte, 0 Verstöße in der Spezifikation. Die „messbar"-markierten Punkte
(F4, I1, I3, M3) sind zusätzlich Gates für MARAA-6 — sie gelten hier als spezifiziert,
nicht als gemessen. Diese Unterscheidung ist Absicht: eine Spezifikation darf nicht
behaupten, was erst der Build beweist.

---

## 13. Offene Punkte / Rückfragen an den CEO

> Diese Punkte sind **keine** Abhängigkeiten des Designs. Es ist vollständig entschieden
> und umsetzbar. Die Punkte betreffen Inhalte/Kosten/Recht und liegen bei MARAA-1/MARAA-3.

1. **Attribution „Google Maps" statt „Quelle: Google".** Die Komponenten-Spec setzt die
   CEO-Vorgabe um (Attribution-Mark in zwei Varianten, Logo und Text, `translate="no"`,
   Mindesthöhe, Mindestfreiraum). Der **sichtbare Wortlaut** ist damit „Google Maps",
   nicht die im GOAL genannte Formulierung „Quelle: Google". Das ist die aktuellere
   Places-Policy (ADR §10.1 / die CEO-Entscheidung vom 2026-10-13). Das Content-Pack
   (MARAA-3, `content/bewertungen.md`) verwendet bereits „Bewertungen von Google Maps";
   Design und Content sind damit deckungsgleich. Bestätigung erbeten, damit der Wortlaut
   nicht später geändert wird.
2. **Sektion-Gating vs. ADR §5.5.** Die ADR erlaubt Autor/Sterne/Datum/Text vor Consent
   als Own-Origin-Inhalt; die CEO-Vorgabe sagt „die Sektion selbst bleibt consent-gated".
   Die Spec löst das über ein `gate`-Prop: Default `content` (ADR-konform: eigene Inhalte
   sichtbar, Google-Avatar/Karte erst nach `externe_medien`, Textattribution immer
   sichtbar), Option `section` (gesamte Sektion erst nach Consent). **Welche Variante
   gilt, entscheidet der CEO** — baulich ist beides vorbereitet.
3. **Font-Budget.** Das Paar Fraunces + Instrument Sans als variable woff2 soll ≤ 120 KB
   bleiben. Erreicht der Subset das nicht, ist die im Konzept hinterlegte Rückfalllinie
   „Serif auf latin-basic reduzieren, Instrument Sans latin" — **nicht** eine dritte
   Familie und **nicht** eine Google-Fonts-Anfrage.
4. **Bildrechte + Logo.** Sind die sieben Originalfotos und `logo_ivo.jpeg` lizenzfrei
   verwendbar? Das Logo liegt nur als JPEG vor (kein transparenter/hintergrundfreier
   Vektor); für die runde Abzeichen-Darstellung wird eine freigestellte Fassung (SVG
   oder PNG mit Transparenz) benötigt. Fallback: Wortmarke in Fraunces, bis die Fassung
   vorliegt.
5. **Korrekte E-Mail-Adresse.** Drei verschiedene Adressen im Alt-Auftritt (ADR §10.3).
   Das Design zeigt die Adresse aus einem Content-Slot; der **Wert** kommt von MARAA-3/
   Kunde. Kein Designentscheid.

**Grundsatzentscheidung dieses Dokuments:** Wo eine Gestaltungswahl gegen Barrierefreiheit
oder DSGVO stünde, gewinnt Barrierefreiheit/DSGVO. Das ist in diesem Konzept an keiner
Stelle nötig gewesen — die Richtung ist mit beiden vereinbar.

---

## 14. Verifikation & Reproduzierbarkeit

`docs/design/tokens.json` ist die **einzige Wahrheit**; `tokens.css` ist generiert und
trägt einen „GENERATED — nicht editieren"-Kopf. Damit kann die CSS-Schicht nicht
unbemerkt von der JSON-Schicht abweichen.

```bash
# 1) Audit-Block aus den tatsaechlichen Alias-Werten NEU berechnen (Kontrast, Hue)
python3 tools/audit-tokens.py          # Exit 0 = alle Paare >= 4.5:1 (Text) / >= 3.0:1 (Non-Text)

# 2) tokens.css aus tokens.json erzeugen und Audit nachpruefen
python3 tools/build-tokens.py          # schreibt tokens.css + prueft Audit

# 3) Pruefen, ob tokens.css zum Stand von tokens.json passt (Regression)
python3 tools/build-tokens.py --check  # Exit 0 = aktuell
```

Zum Abgabezeitpunkt:

- `python3 tools/audit-tokens.py` → **54 Paare** (16 Text, 22 Non-Text, 16 Dark) über dem
  Minimum, Exit 0.
- `python3 tools/build-tokens.py` → `AUDIT BESTANDEN`, Exit 0.
- `python3 tools/build-tokens.py --check` → `tokens.css ist aktuell`, Exit 0.

Die Kontrastwerte sind damit **berechnet, nicht behauptet**. Wer einen Token ändert,
führt Schritt 1 aus; das Audit fällt sonst rot aus dem Gate (ADR §7.5: Überschreitung ist
ein Blocker).

---

## 15. Dateien & Reihenfolge für MARAA-5

| Datei | Inhalt | Status |
|---|---|---|
| `docs/design/konzept.md` | Richtung, Farbwelt, Typografie, Bildsprache, Tokens-Deltas, 30 Prüfpunkte | **fertig** |
| `docs/design/tokens.json` | kanonische Token-Werte inkl. Audit | **fertig** |
| `docs/design/tokens.css` | generierte CSS-Custom-Properties | **fertig, generiert** |
| `docs/design/komponenten.md` | Komponenten-Spec mit allen Zuständen + A11y | **fertig** |

**Lese-Reihenfolge für MARAA-5:** ADR §4 (Consent), ADR §7 (Budgets), dieses Konzept,
`tokens.json`, `komponenten.md`.

---

*Ende des Design-Konzepts. Änderungen an der Richtung brauchen ein Update dieses
Dokuments und ein neues Token-Audit — keine stille Abweichung im Commit.*
