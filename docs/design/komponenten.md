# Komponenten-Spezifikation — Ivo-Mertsch-Relaunch

| | |
|---|---|
| **Status** | Abgabe MARAA-4 (Design). Umsetzungsvorgabe für MARAA-5 (Frontend). |
| **Datum** | 2026-10-13 |
| **Autor** | Designer, PixelForge Studio, Issue MARAA-4 |
| **Richtung** | siehe `docs/design/konzept.md` — „Fugenlos: keine Trennlinien, Ton + Korn statt Kante, genau eine Linie am Entscheidungspunkt" |
| **Tokens** | `docs/design/tokens.json` (kanonisch), `docs/design/tokens.css` (generiert) |
| **Verbindliche Contracts** | `docs/adr/0001-stack-und-consent-architektur.md` §4 (Consent), §5 (Reviews), §6 (Kontakt), §9 (A11y) |

---

## 0. Konventionen (gelten für jede Komponente)

### 0.1 Token-Disziplin

- **Keine Primitive in Komponenten.** Komponenten verwenden ausschließlich die
  **semantische Schicht** (`--pf-surface-*`, `--pf-text-*`, `--pf-border-*`,
  `--pf-accent-*`, `--pf-focus-*`, `--pf-shadow-*`, `--pf-type-*`, `--pf-space-*`,
  `--pf-radius-*`, `--pf-duration-*`, `--pf-ease-*`). `--pf-color-*` ist tabu.
- **Ausnahme Weiß/Schwarz** nur mit Kommentar im Code. Alles andere ist ein Token.
- Dieselbe Regel wiegeht für jede `px`-Zahl: sie stammt aus der Abstandsskala, einer
  Radienstufe oder einem Layout-Token.

### 0.2 Das Zustandsmodell — sieben Zustände

Jede interaktive Komponente wird gegen **genau diese sieben Zustände** spezifiziert.
Ist ein Zustand nicht anwendbar, steht das ausdrücklich als „—" in der Tabelle, statt
zu fehlen.

| # | Zustand | Auslöser | Muss sichtbar sein als |
|---|---|---|---|
| S1 | **default** | Ruhe | Fläche + Kante + Text |
| S2 | **hover** | Zeiger (`@media (hover: hover)`) | Flächenwechsel **und** zusätzlich Form/Schatten — nie nur Farbe |
| S3 | **focus-visible** | Tastaturfokus | 3-px-Ring außen (`:focus-visible`), nie als Ersatz der Kante |
| S4 | **active** | laufende Betätigung | Fläche dunkler/heller **+** Press-Transform `translateY(1px)` |
| S5 | **disabled** | `disabled`/`aria-disabled="true"` | Fläche entsättigt, Text ≤ 4,5:1 bleibt erhalten, `cursor: not-allowed`, nicht fokussierbar |
| S6 | **busy** | laufende Aktion | Inhalt bleibt, Spinner/Status, `aria-busy="true"`, keine Doppelauslösung |
| S7 | **selected/current** | dauerhafter Zustand (aktive Navi, gewählte Sterne, gewählte Consent-Kategorie) | zusätzlich zu Farbe immer eine **zweite** Achse: Unterstreichung, Häkchen, `aria-current`, `aria-pressed`, `aria-checked`, Gewicht |

Nicht-interaktive Komponenten (Karte, Footer, Attribution) werden nur gegen die
Zustände spezifiziert, die sie haben (kein erfundener Hover auf einem Absatz).

**Zusätzliche Achsen** (komponentenspezifisch, kein Ersatz für S1–S7):
`invalid` (Formfehler), `empty` (kein Inhalt), `success`/`error` (Antwortzustand),
`open`/`closed` (Dialog/Drawer).

### 0.3 Fokus, global

```css
:focus-visible {
  outline: var(--pf-focus-ring-width) solid var(--pf-focus-ring); /* 3px accent-700 */
  outline-offset: var(--pf-focus-ring-offset);                      /* 2px */
  border-radius: inherit;
}
/* auf Akzentfuellung: weisser Ring */
.pf-on-accent :focus-visible,
.pf-button--primary:focus-visible { outline-color: var(--pf-focus-ring-on-accent); }
/* invertierte Flaeche (Footer): heller Ring */
.pf-invert :focus-visible { outline-color: var(--pf-focus-ring-on-inverted); }
/* Mausklick zeigt keinen Ring */
:focus:not(:focus-visible) { outline: none; }
```

Regeln: Der Ring liegt **außen** (`outline` + `offset`), ersetzt nie die Kante. Ist das
Element an einem Containerrand, sorgt `scroll-margin`/Innenabstand dafür, dass der Ring
nicht abgeschnitten wird. **Kein** `outline: none` ohne Ersatz.

### 0.4 Touch, global

Jedes interaktive Ziel ist **≥ 44 × 44 px** (`--pf-touch-target`). Ist die sichtbare
Form kleiner (z. B. ein Icon-Kreuz), wird die Trefferfläche über Padding oder ein
`::before`-Overlay auf 44 px gebracht — ohne die optische Größe zu ändern.

### 0.5 Dark Mode

Alle Komponenten sind gegen beide Belegungen spezifiziert. Sie **konsumieren nur
semantische Tokens**, deshalb braucht keine Komponente Dark-spezifische Regeln — Dark ist
ein Remap. Default ist **Light**; Dark wird bei `prefers-color-scheme: dark` aktiv, solange
kein `data-theme="light"` gesetzt ist. Die invertierte Fläche (Footer) ist theme-unabhängig
dunkel (`.pf-invert`).

---

## 1. SkipLink

**Zweck.** Der erste tabulierbare Fokuspunkt jeder Seite springt zum Hauptinhalt; WCAG 2.4.1.

**Aufbau.** `<a class="pf-skip" href="#hauptinhalt">Direkt zum Inhalt</a>`, direkt nach
`<body>`.

**Varianten.** Eine. Kein Icon, keine Zierde.

**Zustände.**

| S1 | S2 hover | S3 focus | S4 active | S5 | S6 | S7 |
|---|---|---|---|---|---|---|
| `transform: translateY(-150%)`, ausserhalb des Viewports, aber im DOM | — | wird sichtbar: `translateY(0)`, Ring an | Fläche dunkler | — | — | — |

**Token-Verwendung.** Fläche `--pf-surface-accent`, Text `--pf-text-on-accent`, Radius
`--pf-radius-none` (volle Breite oben), Padding `--pf-space-4 --pf-space-6`, `z-index:
--pf-z-skiplink`, Typo `--pf-type-label`. Übergang `--pf-duration-fast`

**A11y.** Immer das erste fokussierbare Element. Ziel `#hauptinhalt` existiert auf jeder
Seite. Bei reduzierter Bewegung erscheint er ohne Übergang (Dauer → 1 ms über Tokens).

**Responsive.** Volle Breite, linksbündig, ab `md` als links oben schwebende Pille
(`--pf-radius-full`), damit der Ring nicht am Rand klebt.

**Dark.** `--pf-surface-accent` wird `accent.400`; Text bleibt weiß (≥ 4,5:1, auditiert).

---

## 2. SiteHeader + Navigation

### 2.1 SiteHeader

**Zweck.** Orientierung und der schnellste Kontaktweg (Telefon). Bleibt beim Scrollen
sichtbar, ohne den Inhalt zu überdecken.

**Aufbau.** `<header class="pf-header">` mit drei Bereichen: links **Logo/Wortmarke**
(Link auf `/`), Mitte **Primärnavigation** (ab `lg`), rechts **CTA-Gruppe**: Telefonnummer
als `tel:`-Link (immer sichtbar) und — mobil — der Menü-Button.

**Token-Verwendung.** Höhe `--pf-header-height` (72 px) / `--pf-header-height-md` (88 px),
Fläche `--pf-surface-page`, Trennung **keine Linie** — die Trennwirkung entsteht beim
Scrollen über `--pf-shadow-header` (Overlay-only) plus einen `--pf-grain`-Hintergrund.
Padding `--pf-gutter-sm`/`--pf-gutter-md`. `z-index: --pf-z-header`.

**Varianten.** `sticky` (Default, `position: sticky; top: 0`) und `static` (für Seiten ohne
Scroll-Fokus, z. B. Rechtstexte) — eine Prop, kein zweiter Header.

**Zustände.** Header selbst: S1 default transparent auf der Seite; S2 scroll (`--pf-shadow-header`
+ `--pf-surface-raised`-Ton). Nicht klickbar → keine weiteren Zustände.

**A11y.** `<header>` ist Landmark (`banner`) — genau eines pro Seite. Logo-Link hat
zugänglichen Namen („Ivo Mertsch — Startseite"). Die Telefonnummer ist kein Icon ohne
Text, sondern `Anrufen: +49 174 2164071` (Zahl in `tabular-nums`), mobil als
Kurzfassung `Anrufen` + Nummer in einem zugänglichen Namen.

**Responsive.** < `lg`: Logo + Telefon-CTA + Menü-Button. ≥ `lg`: zusätzlich die
Primärnavigation horizontal.

**Dark.** `--pf-surface-page`/`--pf-surface-raised` remappen; Schrift auf `--pf-text-primary`.

### 2.2 Navigation (Desktop)

**Aufbau.** `<nav aria-label="Hauptnavigation">` mit `<ul><li><a>`. „Leistungen" ist ein
Untermenü (4 Detailseiten).

**Varianten.** Einfacher Link; Link mit Untermenü (Disclosure-Muster, kein Hover-Menü, das
nur mit der Maus erreichbar ist).

**Zustände.**

| Zustand | Darstellung |
|---|---|
| S1 default | Text `--pf-text-primary`, Typo `--pf-type-label` |
| S2 hover | `--pf-text-link` + 2-px-Akzent-Unterstrich (`--pf-seam-width`, `--pf-accent-default`) |
| S3 focus-visible | globaler Ring (siehe §0.3) |
| S4 active | Text `--pf-accent-active`, Unterstrich 3 px |
| S5 disabled | — (Navigation hat keine deaktivierten Punkte) |
| S6 busy | — |
| S7 current | `aria-current="page"` + Akzent-Unterstrich dauerhaft (zweite Achse: Strich, nicht nur Farbe) |
| open (Untermenü) | Panel mit `--pf-shadow-overlay`, `aria-expanded="true"` am Auslöser |

**A11y.** Untermenü ist per Tastatur bedienbar (`Escape` schließt, `ArrowDown` öffnet,
`ArrowUp/Down` innerhalb, `Tab` verlässt und schließt). `aria-expanded`/`aria-controls`
am Auslöser. In der Untermenü-Schaltfläche steht ein Chevron-Icon **plus** Textname.

**Responsive.** Unterhalb `lg` wird die Navigation durch den Drawer ersetzt (§2.3) — die
Desktop-Navigation ist dann `display: none`, aber im DOM erreichbar bleibt nur die
sichtbare Struktur (kein Doppel-Fokus).

**Dark.** Text/Link remappen; Unterstrich `--pf-accent-default`.

### 2.3 MobileNav (Drawer mit Fokusfalle)

**Zweck.** Vollständige Navigation auf kleinen Viewports; barrierefrei bedienbar.

**Aufbau.** `<button aria-expanded aria-controls="pf-nav-drawer">` (Menü-Icon **und**
unsichtbarer Text „Menü"). Der Drawer ist `role="dialog" aria-modal="true"` mit eigenem
Titel („Navigation"), enthält dieselbe Navigationsliste plus Kontaktwege und schließt mit
sichtbarem Schließen-Button.

**Varianten.** Rechts einfahrendes Panel (100 % Breite mobil, 320 px ab `sm`).

**Zustände.**

| Zustand | Darstellung |
|---|---|
| S1 closed | Button default; Drawer nicht im DOM (nicht nur `hidden`) oder `inert` |
| S2 hover | Button-Fläche `--pf-surface-sunken` |
| S3 focus-visible | globaler Ring |
| S4 active | Press-Transform |
| S5 disabled | — |
| S6 busy | — |
| S7 open | Button `aria-expanded="true"`, Drawer mit `--pf-shadow-overlay`, Scrim `--pf-scrim`, Body-Scroll gesperrt |
| open (Fokus) | Fokus wandert in den Drawer; `Tab`/`Shift+Tab` zirkulieren innerhalb (Fokusfalle); `Escape` schließt; Fokus kehrt auf den Menü-Button zurück |

**Token-Verwendung.** Fläche `--pf-surface-raised`, Breite, Padding `--pf-space-6`,
`--pf-shadow-overlay`, Scrim `--pf-scrim`, `z-index: --pf-z-drawer` (Panel) /
`--pf-z-scrim` (Hintergrund).

**A11y (verbindlich, ADR §4.6-Sinn).** Fokusfalle, `aria-modal`, benannter Titel,
`Escape`, Fokus-Rückgabe, Scroll-Sperre (`overflow: hidden` am `html`), reduzierte
Bewegung (Drawer erscheint ohne Slide). Der Drawer ist **kein** Ort für Consent-Logik und
löst **keinen** Drittanbieter-Request aus.

**Responsive.** Erscheint < `lg`, verschwindet ≥ `lg` (und wird dann aus dem DOM
genommen).

**Dark.** Fläche remappt; Scrim `--pf-scrim`.

---

## 3. Breadcrumb

**Zweck.** Einordnung ab `/leistungen/…` (Start › Leistungen › [Leistung]); auch als
`BreadcrumbList`-Schema.

**Aufbau.** `<nav aria-label="Brotkrumen"><ol>` mit Links; das letzte Element ist
Text (aktueller Ort, `aria-current="page"`), kein Link.

**Varianten.** Einfach (2–3 Stufen).

**Zustände.** Link: S1 default `--pf-text-muted`; S2 hover `--pf-text-link` + Unterstrich;
S3 globaler Ring; S4 `--pf-accent-active`; S7 current = kein Link, `--pf-text-secondary`,
Gewicht `medium`. S5/S6 —.

**A11y.** Trenner (`›`) als `aria-hidden` über CSS `::after` — kein vorgelesenes Zeichen.
Touch-Ziel der Links ≥ 44 px über vertikales Padding.

**Responsive.** Mobil auf eine Zeile begrenzt; bei Überlänge wird der mittlere Teil
gekürzt (die Wurzel bleibt sichtbar), nicht horizontal gescrollt.

**Dark.** `--pf-text-muted`/`--pf-text-secondary` remappen.

---

## 4. Hero

**Zweck.** In Sekunden klarmachen: wer, was, wo — und einen nächsten Schritt anbieten.
Ein `h1`, ein Primär-CTA.

**Aufbau.** `<section>` mit Bild (`foto3`), darüber/neben: Eyebrow (Ort/Handwerk),
`<h1>` (Empfehlung aus `content/start.md`, Variante A), Vorspann
(`--pf-type-lead`), **Primär-CTA** „Beratung anfragen", Sekundärweg Telefon, Tertiärweg
WhatsApp ruhig darunter.

**Token-Verwendung.** Vertikaler Raum `--pf-section-y`/`--pf-section-y-md` (Hero darf bis
`--pf-breathe-y` atmen), Container `--pf-container-max`, Measure Display für H1
(`--pf-measure-display`, 22ch) und Lead (`--pf-measure-lead`, 44ch). Bild: festes
`aspect-ratio` (16/10), `--pf-radius-xl` bei eingerücktem Bild oder `none` bei
Vollflächenbild. Kein Kartenschatten.

**Varianten.** `media-right` (Default ab `md`), `media-below` (mobil/Always-Stack). Eine
Bildprop entscheidet, welches `foto*` verwendet wird (Start = `foto3`).

**Zustände.** Hero ist nicht interaktiv; die drei CTAs tragen die Button-Zustände (§12).

**A11y.** Genau ein `<h1>`. Bild ist inhaltstragend → echter Alt-Text (aus
`content/start.md`), `fetchpriority="high"`, **kein** `loading="lazy"`. Die Reihenfolge
im DOM ist Eyebrow → H1 → Lead → CTAs (Lesefluss = Tab-Reihenfolge). Der Primär-CTA ist
**nicht** allein durch Farbe ausgezeichnet, sondern durch Füllung **und** Position
**und** Text.

**Responsive.** Mobil: Bild als Vollflächen-Kopf mit Text darunter auf `--pf-surface-page`
(nicht auf dem Bild), damit Textkontrast unabhängig vom Foto garantiert ist. Ab `md`:
zweispaltig.

**Dark.** Textflächen remappen; das Foto bleibt (Material), wird aber ggf. mit einem
`--pf-surface-page`-Ton unterlegt. Text liegt nie auf dem Foto ohne Scrim.

---

## 5. ServiceCard (4×)

**Zweck.** Die vier Leistungen (Fugenlose Bäder, Fugenlose Böden, Innenausbau, Fassaden)
als Werkstoffproben zeigen und auf die Detailseite führen.

**Aufbau.** `<article>` → Link umschließt nicht die ganze Karte, sondern Titel + „Zu
fugenlosen Bädern" (eindeutiger Linktext, kein „Mehr erfahren"). Bild (4:3, `foto8/11/6/7`),
Titel (`--pf-type-title-card`), 1–2 Sätze, **Finish-Streifen** (matt/seidenglänzend/
glänzend als reine Flächenprobe), Linktext.

**Raster (Template-brechend):** ab `md` ein **asymmetrisches** 12-Spalten-Raster — Karte 1
spannt **volle Breite** (2K/Thema Fugenlose Bäder), die Karten 2–4 füllen darunter in
vier Spalten. Mobil: eine Spalte.

**Token-Verwendung.** Fläche `--pf-surface-raised`, Radius `--pf-radius-lg`,
Padding `--pf-space-6`, Gap `--pf-grid-gap-md`, **kein** Schatten, Trennung durch Ton
gegen `--pf-surface-page`. Titel `--pf-type-title-card`, Body `--pf-type-body`.

**Varianten.** `wide` (Karte 1), `default` (2–4). Prop steuert nur das Grid-Spanning und
die Bildbreite — nicht das Aussehen.

**Zustände.** Die Karte als Ganzes hat keinen Zustand; ihr **Link** hat:

| S1 | S2 hover | S3 focus | S4 active | S5 | S6 | S7 |
|---|---|---|---|---|---|---|
| Linktext `--pf-text-link`, Unterstrich aus | Unterstrich sichtbar, Pfeil-Icon rutscht 4 px nach rechts (nur mit `no-preference`) | globaler Ring am Link | `--pf-accent-active` | — | — | — |

**A11y.** Bild-Alt-Text aus `content/start.md`. Der Finish-Streifen ist **dekorativ**
(`aria-hidden`), die Glanzgrade stehen als Text im Satz — Farbe/Fläche ist nie die einzige
Information. Touch-Ziel des Links ≥ 44 px.

**Responsive.** Einspaltig mobil; das breite Bild wird auf 400/800/1200w `srcset`
zugeschnitten.

**Dark.** Fläche/Text remappen; Finish-Streifen nutzt denselben Akzent-Ton in heller/dunkler
Stufe, bleibt aber Text-unterstützt.

---

## 6. ServiceDetailLayout (Struktur einer Leistungsdetailseite)

**Zweck.** Identische Struktur für alle vier Detailseiten, damit MARAA-5 nur Inhalte
einsetzt (`content/leistungen-*.md`).

**Aufbau (Reihenfolge):**

1. Breadcrumb (§3)
2. Hero der Detailseite: `foto*`, `<h1>` (Leistung), Lead, Primär-CTA
3. Abschnitt „Was das ist" — Fließtext auf `--pf-measure-text`, ein Abschnitt, nicht zergliedert
4. Abschnitt „Wofür geeignet" — Liste (echte `<ul>`, nicht Icon-Spalten)
5. Abschnitt „Oberflächen/Ausführung" — nur bei Böden (matt/seidenglänzend/glänzend),
   je mit Finish-Fläche + Text
6. **Seiten-eigenes Wow-Detail** (siehe `konzept.md` §10), genau eines
7. „So läuft es ab" — drei Schritte (Beratung/Planung/Abwicklung) aus dem Originalsatz
8. CTA-Band (§16)
9. Optional: Teaser „Andere Leistungen" (drei Links, nicht drei Karten)

**Token-Verwendung.** Wiederkehrende Abschnittsköpfe über eine gemeinsame
`SectionHeading`-Primitive (§17). Abstände ausschließlich `--pf-section-y`/`-md`.
Keine Linien zwischen den Abschnitten.

**Varianten.** `finishes` (Böden) / `plain` (übrige). Prop blendet Abschnitt 5 ein/aus.

**Zustände.** Keine (Layout). Interaktive Kinder (CTA, Finish-Schalter bei Böden) tragen
deren Zustände. Der Finish-Schalter ist ein `role="radiogroup"` mit drei `role="radio"`-
Buttons (S1–S7 wie §5-Tabs), `aria-checked`, Tastaturnavigation mit Pfeiltasten.

**A11y.** Genau ein `<h1>`. Reihenfolge h2 → h3, nie übersprungen. CTA-Ziel `/kontakt/#formular`
oder `tel:`. Abschnitt 5 nie allein über Farbe — jeder Glanzgrad mit Namen.

**Responsive.** Mobil einspaltig, Bilder unter dem Text; ab `md` darf ein Bild rechts
stehen (Bildabfolge bleibt der Textabfolge untergeordnet).

**Dark.** Remap; Bilder bleiben.

---

## 7. GalleryGrid (Galerie / Werkstoffproben)

**Zweck.** Die Originalbilder groß und ruhig zeigen — **ohne Referenzbehauptung** (es gibt
keine belegbaren Referenzen).

**Aufbau.** `<section aria-labelledby>` mit `<ul>` aus `<figure>`+`<img>`; gemischte
Seitenverhältnisse (1:1 und 4:3), aber **jede Position mit fixem `aspect-ratio` und
`width`/`height`** (CLS ≤ 0,1).

**Varianten.** `masonry`-Anmutung über `grid-auto-rows` (kein JS), `uniform` (gleiches
Verhältnis). Default `masonry`.

**Zustände.** Kein Hover-Zoom auf dem Foto (Deko-Bewegung). Der Container darf auf Hover/
Focus den Rahmen-/Flächenton wechseln, wenn das Bild ein Link ist (z. B. zur Großansicht):

| S1 | S2 hover | S3 focus | S4 active | S5 | S6 | S7 |
|---|---|---|---|---|---|---|
| Fläche `--pf-surface-raised` | Fläche `--pf-surface-sunken` | Ring am Link | Press | — | — | — |

**A11y.** `figure`+`figcaption` nur, wenn es echten Text gibt; sonst `alt` am Bild.
Deko-Bilder `alt=""` + `aria-hidden`. Kein Lightbox-Zwang; wenn eine Großansicht
existiert, muss sie per Tastatur schließbar sein (sonst weglassen).

**Responsive.** 1 Spalte mobil → 2 ab `sm` → 3 ab `lg`. `srcset` 400/800/1200w.

**Dark.** Flächen remappen; Fotos bleiben, ggf. Tonunterlegung.

---

## 8. ReviewSection + ReviewCard (+ Attribution, EmptyState)

> Verbindlich: `docs/contracts/reviews.schema.json`. Pflichtfeldnamen `autor`, `sterne`,
> `datum`, `text`, `avatar_status`, `profil_link`, `review_time`. Das Design erfindet
> **keine** Bewertung und rendert im Leerzustand **keinen** Stern und **keinen** Avatar.

### 8.1 ReviewSection

**Zweck.** Google-Bewertungen zeigen — oder ehrlich sagen, dass keine vorliegen (ADR §5.4).

**Aufbau.** `<section aria-labelledby>` mit: `<h2>` (A: „Bewertungen", B: „Bewertungen");
**Sortierhinweis** (`sortierung_hinweis` aus dem Dokument — Text:
`[MARAA-3: bewertungen.md #Sortierungs-Hinweis]`); Liste aus `ReviewCard`;
**Attribution-Mark** (§8.4, Text: `[MARAA-3: bewertungen.md #Attributions-Zeile]`);
**Aktualisierungs-Hinweis** (`aktualisiert_am`, TT.MM.JJJJ, ohne gültiges Datum
ausgeblendet); **Prüfhinweis** („Wie Google Bewertungen prüft",
`[MARAA-3: bewertungen.md #Hinweis]`).

**Props.** `document` (normalisiertes `reviewsDocument`), `gate` (`"content"` | `"section"`),
`googleReviewUrl`.

**Varianten.** (a) **Inhalt** — `reviews.length > 0`; (b) **Leerzustand** —
`reviews.length === 0` aus irgendeinem Grund (keine Datei, leer, kein Key, Fehler).

**Gating (`gate`).** Zwei zulässige Belegungen, per Prop gewählt:

| `gate` | Vor Consent | Nach `externe_medien` | Rechtsgrundlage |
|---|---|---|---|
| `content` (Default, ADR §5.5) | Autor, Sterne, Datum, Text, `profil_link` als Link, Initialen-Avatar sichtbar; keine Google-Ressource | zusätzlich Google-Avatar, Karte | ADR §5.5 |
| `section` | gesamte Sektion erst nach Consent; nur die **Textattribution** steht sichtbar außerhalb | alles | strengere Lesart |

Welche Variante gilt, ist die offene CEO-Entscheidung (siehe `konzept.md` §13.2). Die
Attribution als **Text** ist in beiden Fällen vor Consent sichtbar; das **Google-Maps-Logo**
ist in `content` erst mit `externe_medien` erlaubt, weil ein Logo-Download ein Request ist.

**Zustände der Sektion.**

| S1 default | S2 hover | S3 focus | S4 active | S5 | S6 busy | S7 current |
|---|---|---|---|---|---|---|
| Inhalt oder Leerzustand | — | Ring auf Links | — | — | Ladezustand (§8.5) | — |

**A11y.** `<h2>`, Liste als `<ul>`/`<ol>`. Sterne werden **nicht** allein visuell
transportiert: jeder Karten-Sterne-Block hat `role="img"` mit `aria-label="4 von 5
Sternen"` (und die Zahl steht zusätzlich als Text). Der Sortierhinweis und der Prüfhinweis
sind normale Absätze. Die Attribution ist Text (kein Bild ohne Alt-Text).

**Responsive.** Karten als 1 Spalte mobil, 2 ab `md`, 3 ab `xl` (max. 6 sichtbar, Rest über
„Alle Bewertungen bei Google" — Link, kein Nachladen).

**Dark.** Flächen/Text/Sterne remappen; Google-Avatar unverändert.

### 8.2 ReviewCard

**Aufbau.** `<article>` (oder `<li>`): Avatar/Kopfzeile (Avatar + Autor + Datum),
Sterne, `text`, Link „Bewertung bei Google ansehen" (`profil_link`).

**Props.** `autor`, `sterne`, `datum`, `text`, `avatar_status` (`none`|`initials`|`google`),
`avatar_url`, `profil_link`, `review_time`, `sprache?`.

**Avatar-Regeln (verbindlich):**

| `avatar_status` | Vor Consent | Nach `externe_medien` |
|---|---|---|
| `initials` | **lokal** gerenderte Initialen, sichtbar | sichtbar |
| `none` | **kein** Avatar — kein Platzhalterbild, kein grauer Kreis mit Fragezeichen | kein Avatar |
| `google` | **nicht laden** (Gate-Attribut, Element nicht erzeugen) → ersatzweise Initialen | `<img>` von `googleusercontent/gstatic` |

**Token-Verwendung.** Fläche `--pf-surface-raised`, Radius `--pf-radius-lg`, Padding
`--pf-space-6`, **kein** Schatten. Avatar 48 px, `--pf-radius-full`, Initialen in
`--pf-type-label` auf `--pf-accent-subtle`. Sterne: 20 px in **`--pf-text-primary`** — nicht im
Markenakzent, denn der Akzent ist für Aktionen reserviert. Abstand `--pf-space-1`.
Autor `--pf-type-label`, Datum `--pf-type-meta`
(`tabular-nums`), Text `--pf-type-body` auf `--pf-measure-text`.

**Zustände.**

| S1 | S2 hover | S3 focus | S4 active | S5 | S6 | S7 |
|---|---|---|---|---|---|---|
| Karte ruhig | Fläche `--pf-surface-sunken` **nur** wenn die ganze Karte ein Link ist (sonst —) | Ring am `profil_link` | — | — | — | — |

**A11y.** Sternwert als `role="img"` + `aria-label`; Datum mit `datetime`-Attribut
(`<time datetime="YYYY-MM-DD">`). `profil_link` ist ein **normaler Link** und
**nicht** consent-pflichtig (ADR §5.5): er lädt nichts nach. Ein Link, der als Ressource
gesperrt würde, ist ein Blocker. Externer Link kennzeichnen (`externer Link`-Icon +
zugänglicher Name „(öffnet Google in neuem Tab)").

**Responsive.** Volle Kartenbreite; lange Texte brechen um, keine Kürzung ohne Kennzeichnung.

**Dark.** Flächen/Text remappen; Initialen-Avatar auf `--pf-surface-sunken`.

### 8.3 EmptyState (Leerzustand)

**Aufbau.** Gleiche Sektion, gleiche `<h2>` („Bewertungen"): der sachliche Satz, der den
Zustand benennt (`[MARAA-3: bewertungen.md #Leerzustand-Text]`), und **ein** primärer CTA
**„Jetzt bei Google bewerten"** → `googleReviewUrl`.

**Regeln (unveränderlich, ADR §5.4).** Keine Sterne, keine erfundenen Initialen, kein
„Bald verfügbar", **keine Attribution** (es werden keine Google-Inhalte gezeigt). Ist
`googleReviewUrl` leer, wird der CTA **nicht** gerendert (ehrlich, kein toter Link).

**Zustände.** CTA trägt Button-Zustände (§12). Sonst statisch.

**A11y.** Der Leerzustand ist Inhalt, keine `aria-hidden`-Zone. Der CTA hat klaren
Namen.

**Dark.** Karte auf `--pf-surface-sunken`, wie §8.2.

### 8.4 AttributionMark

**Zweck.** Google-Attributionspflicht erfüllen (ADR §5.6 / CEO-Entscheidung).

**Zwei Varianten, eine gewählt:**

| Variante | Darstellung | Einsatz |
|---|---|---|
| **Logo** (bevorzugt) | Google-Maps-Logo, Mindesthöhe **16 px**, Mindestfreiraum um das Logo (Faktor gemäß Policy), **kein** Verzerren, **kein** Umfärben | wenn Platz es erlaubt (ab `lg`, oder wenn die Sektion breit steht) |
| **Text** | `<span>Bewertungen von <span translate="no">Google Maps</span></span>` — Wortlaut nicht übersetzen, nicht lokalisieren, nicht abkürzen. Verbindlicher Text: `[MARAA-3: bewertungen.md #Attributions-Zeile]` | wenn der Raum beengt ist (mobil) oder das Logo nicht vorliegt |

**Regeln.**

- Mindesthöhe 16 px gilt **für beide** Varianten (Text: `font-size ≥ 16px` in der Linie →
  deshalb `--pf-text-base`, nicht `--pf-type-meta` 13 px).
- Der Text ist **nicht** Teil des Fließtextes: er steht als eigene, klein gesetzte
  Attributionszeile am Ende der Sektion.
- Farbe `--pf-text-muted` auf `--pf-surface-page` → geprüft ≥ 4,5:1 (§9-Tabelle).
- Das Logo ist ein **Bild-Request**. Vor Consent ist bei `gate="content"` die
  **Textvariante** zulässig und sichtbar; das Logo erscheint erst mit `externe_medien`.
- **Nicht** im Leerzustand (§8.3).

**Zustände.** S1 default; S3 falls verlinkt (Ring); sonst keine. S2/S4/S5/S6/S7 —.

**A11y.** Logovariante mit `alt="Google Maps"`; Textvariante ist Text. Beides mit
`translate="no"` (auch am `img`, damit der Alternativtext nicht übersetzt wird).

**Responsive.** Mobil Textvariante, ab `lg` Logo wenn vorhanden; die Wahl passiert per
Container-Breite (CSS), nicht per JS.

**Dark.** Text `--pf-text-muted` remappt; Logovariante ggf. auf Fläche mit ausreichend
Freiraum.

### 8.5 Ladezustand (busy)

**Aufbau.** Wenn die Sektion asynchron bestückt wird (Quelle B/Proxy), zeigt sie
**Skeleton-Karten in Kartenform** (gleiche Höhe/Breite wie echte Karten), `aria-busy="true"`
an der Liste, und einen zugänglichen Status („Bewertungen werden geladen") in einer
`role="status"`-Region. Kein Layoutsprung: die Skeletons belegen die Fläche.

**Regeln.** Kein Spinner über dem ganzen Bildschirm. Ladezeit-Abbruch: bleibt Quelle B
aus, greift der Leerzustand. `prefers-reduced-motion` deaktiviert das Skeleton-Pulsieren
(Dauer-Tokens → 1 ms).

**Dark.** Skeleton auf `--pf-surface-raised`/`--pf-surface-sunken`.

---

## 9. ContactBlock

Zwei gleichwertige Teile: **Kontaktwege** (sofort erreichbar) und **Formular**.

### 9.1 ContactWays

**Aufbau.** Liste mit: Telefon (`tel:`), WhatsApp (`wa.me`, gleiche Nummer), E-Mail
(`mailto:`, Adresse aus Content-Slot), Instagram (`externer Link`). Jeder Weg mit Icon
**und** Text **und** dem Wert (Nummer in `tabular-nums`).

**Zustände.** Link-Zustände S1–S4/S7 wie §2.2. Kein S5/S6.

**A11y.** Jeder Weg hat einen zugänglichen Namen („Anrufen: +49 174 2164071"), Icons
`aria-hidden`. WhatsApp ohne Zwang zur App: der `wa.me`-Link funktioniert auch im Browser.
Touch-Ziele ≥ 44 px.

**Responsive.** Mobil als **Action-Bar** sticky unten (`--pf-z-sticky`), Desktop als
ruhige Liste in der Kontaktspalte.

**Dark.** Remap.

### 9.2 ContactForm

**Aufbau.** `<form method="post" action="/api/contact" novalidate>` mit Feldern
`name` (Pflicht), `email` (Pflicht), `nachricht` (Pflicht), `telefon` (optional).
Honeypot-Feld (`aria-hidden`, aus dem Tab-Fokus), versteckter Zeitstempel (§6 ADR),
Absende-Button. Löst **kein** Drittanbieter-JS aus.

**Varianten.** `smtp` (Serverversand → danke-Zustand) und `mailto` (Fallback ohne SMTP:
der Absende-Button füllt ein `mailto:`; sichtbarer Hinweis, dass das E-Mail-Programm
geöffnet wird).

**Zustände.**

| S1 | S2 | S3 | S4 | S5 | S6 busy | S7 |
|---|---|---|---|---|---|---|
| Formular leer, Felder default | Feldkontur `--pf-border-input-hover` | globaler Ring am Feld-Container | Press am Button | Absende-Button `disabled` solange Pflichtfelder leer (mit Grund-Text) | `aria-busy`, Button „Wird gesendet …", Doppelklick gesperrt | — |
| **success** | danke-Zustand: `role="status"`, `--pf-surface-success`, Häkchen + Text — **ersetzt** das Formular, kein Layoutsprung | | | | | |
| **error** | Zusammenfassung `role="alert"` oben, verlinkt auf die betroffenen Felder, plus Inline-Fehler je Feld | | | | | |
| **rate_limited** | Hinweis-Block mit `--pf-surface-warning` und Wartezeit (aus `retryAfterSeconds`) | | | | | |
| **mail_not_configured** | Hinweis, dass der mailto-Weg genutzt wird (Umschaltung auf Variante `mailto`) | | | | | |

**A11y.** Jedes Feld hat ein sichtbares `<label>` (kein Placeholder-Label). `autocomplete`
gesetzt (`name`, `email`, `tel`). Fehler: `aria-invalid`, `aria-describedby` auf den
Fehlertext; der Fehlertext nennt **was** falsch ist **und wie** es zu beheben ist
(z. B. „E-Mail-Adresse fehlt das @-Zeichen. Bitte als name@beispiel.de eingeben.").
Fokus springt bei Fehlern auf die Zusammenfassung. Nichts wird bei einem Fehler geleert.
Keine IP, kein User-Agent im Formular.

**Responsive.** Einspaltig mobil; ab `md` `name`/`email` zweispaltig, Nachricht volle
Breite. Eingaben bleiben 16 px (`--pf-text-base`) — kein iOS-Zoom.

**Dark.** Flächen remappen; Fehler-/Erfolgsflächen kommen aus `--pf-surface-error/success`.

### 9.3 FormField (Primitive, auch für Consent-Toggles)

**Aufbau.** `<div class="pf-field">` mit `<label>`, `<input|textarea>`, optionalem
Hilfetext, optionalem Fehlertext. Das Feld ist die Box; `label` steht darüber.

**Zustände.**

| S1 default | S2 hover | S3 focus | S4 active | S5 disabled | S6 busy | S7 | invalid |
|---|---|---|---|---|---|---|---|
| Kontur `--pf-border-input` (1,5 px, `neutral.500`: 3,67:1 auf page) | Kontur `--pf-border-input-hover` | Ring **plus** Kontur, Fokus bleibt sichtbar | — | Fläche `--pf-surface-sunken`, Text `--pf-text-muted`, `not-allowed` | — | `filled` bleibt im Normalzustand (keine Sonderfarbe) | Kontur `--pf-text-error` + **Icon + Fehlertext**, `aria-invalid` |

**Token-Verwendung.** Konturbreite `--pf-border-width-input`, Radius `--pf-radius-md`,
Padding `--pf-space-3 --pf-space-4`, Höhe ≥ 44 px, Text `--pf-type-body`.

**A11y.** Fehler nie nur über Farbe: Icon + Text + `aria-invalid`. Pflichtfeld-Kennzeichnung
im Label (Text „(Pflichtfeld)"), nicht nur `required`. Hilfetext via `aria-describedby`.

**Dark.** Kontur `--pf-border-input` remappt (`neutral.500` = 4,88:1 auf dunkler Seite).

---

## 10. Consent: Banner, Dialog, Widerruf

> Verbindlicher Vertrag: `docs/contracts/consent.schema.json`, ADR §4. Kategorien:
> `essenziell` (immer true, kein Toggle), `statistik` (default false), `externe_medien`
> (default false). Speicher: `localStorage['pixelforge.consent.v1']`. Vor Consent:
> **null** Cross-Origin-Requests.

### 10.1 ConsentBanner (Erstbanner)

**Aufbau.** Am unteren Rand, `role="dialog"` `aria-modal="false"` **oder** besser eine
`<section role="region" aria-label="Datenschutz-Einstellungen">`, die den Inhalt **nicht**
verdeckt (kein Modal, kein Scrim, kein Fokusfang): Aussage-Satz, dann **gleich große,
gleich gewichtete** Schaltflächen `Alle akzeptieren` und `Nur notwendige` sowie die
sekundäre `Einstellungen`. Darunter Links auf Datenschutzerklärung und Impressum.
Verbindlicher Wortlaut: `[MARAA-3: micro-ux-consent.md #Consent-Banner]`.

**Regeln (kein Dark Pattern, ADR §4.4).** „Nur notwendige" hat dieselbe Größe, denselben
Kontrast und dieselbe Positionsebene wie „Alle akzeptieren". Kein Countdown, keine
Vorauswahl nicht-essenzieller Kategorien, kein „weiter ohne Auswahl"-X, das alles
akzeptiert.

**Zustände.**

| S1 sichtbar | S2 hover | S3 focus | S4 active | S5 | S6 busy | S7 |
|---|---|---|---|---|---|---|
| Banner erscheint bei `entscheidung === "unbekannt"` | Buttons reagieren | erster Fokus auf „Einstellungen" oder den Dialogtitel | Press | — | — | — |
| **dismissed** | nach Entscheidung ausgeblendet und aus dem DOM entfernt | | | | | |

**Token-Verwendung.** Fläche `--pf-surface-raised`, `--pf-shadow-overlay`,
`z-index: --pf-z-cookie`, Padding `--pf-space-6`, Radius `--pf-radius-lg`,
Text `--pf-type-body` (≥ 16 px).

**A11y.** Der Banner darf den LCP **nicht** blockieren → asynchron eingebunden, ohne
Layoutshift am Inhalt. Tastaturbedienbar, sichtbarer Fokus. `prefers-reduced-motion`
respektiert. Der Banner selbst setzt **keine** Drittanbieter-Ressource.

**Responsive.** Mobil volle Breite am unteren Rand, Buttons gestapelt (jeweils ≥ 44 px),
Reihenfolge „Alle ablehnen" vor „Alle akzeptieren" ist **nicht** zulässig unterschiedlich
gewichtet; ab `md` Buttons in einer ruhigen Reihe, Banner max. 720 px.

**Dark.** Fläche/Text remappen.

### 10.2 ConsentDialog (Einstellungen, granular)

**Aufbau.** Echter Dialog: `role="dialog"`, `aria-modal="true"`, benannter Titel
(„Datenschutz-Einstellungen"), Fokusfalle, `Escape` schließt, Fokus zurück auf den
Auslöser. Inhalt: die drei Kategorien mit **Toggle** und Erläuterung; `essenziell`
ohne Toggle, als „Technisch notwendig / lässt sich nicht abschalten" gekennzeichnet.
Footer: `Alle akzeptieren` / `Nur notwendige` / `Auswahl speichern`. Zeigt zusätzlich den
aktuellen Consent-Datensatz als menschenlesbaren Text (Version, Zeitstempel, Methode,
Textfassung) — Nachweis des Widerrufs. Texte: `[MARAA-3: micro-ux-consent.md #Consent-Banner]`.

**Zustände.**

| S1 closed | S2 hover | S3 focus | S4 active | S5/disabled | S6 busy | S7 |
|---|---|---|---|---|---|---|
| nicht im DOM | Toggle-/Button-Hover | Fokusfalle aktiv, Ring sichtbar | Press | `essenziell`-Toggle ist `disabled` **und** als „Technisch notwendig — lässt sich nicht abschalten" beschriftet (nicht einfach nur grau) | — | Toggle-Zustand `on`/`off` trägt `aria-checked` **plus** Schalterposition **plus** Textlabel „An/Aus" |

**A11y.** Toggles sind `role="switch"` mit `aria-checked`; jede Kategorie hat einen
zugänglichen Namen und eine Beschreibung (`aria-describedby`). Der Dialog schließt mit
`Escape` und mit dem sichtbaren Schließen-Button. Fokus-Rückgabe zwingend. Kontrast der
Toggle-Beschriftungen ≥ 4,5:1 (auditiert).

**Responsive.** Mobil als Vollflächen-Sheet, ab `md` zentrierter Dialog (max. 560 px).

**Dark.** Remap; `--pf-scrim` verdunkelt.

### 10.3 ConsentRevoke (Widerruf-Zugang)

**Aufbau.** Dauerhafter Footer-Eintrag **„Cookie-Einstellungen"** auf **jeder** Seite
(primärer Weg). Zusätzlich — nur wenn der Banner nicht (mehr) sichtbar ist und der Footer
nicht im Viewport liegt — ein **Floating-Button** unten links mit demselben Namen, ≥ 44 px.

**Regeln.** Widerruf ist gleich aufwändig wie Erteilung (kein Dark Pattern). Änderung
wirkt **sofort**: Gates werden neu bewertet, nachgeladene externe Ressourcen werden aus dem
DOM **entfernt** und ihr Ladeversuch abgebrochen (nicht nur `hidden`).

**Zustände.** Floating-Button: S1 default, S2 Fläche `--pf-surface-sunken`, S3 Ring, S4
Press; S5/S6/S7 —. Verschwindet, sobald der Footer sichtbar ist (kein Doppelangebot).

**Token-Verwendung.** `--pf-shadow-overlay`, `--pf-radius-full`, `z-index: --pf-z-cookie`
(nicht `toast`), Icons `aria-hidden` + Textname.

**A11y.** Der Floating-Button ist kein Ersatz für den Footer-Eintrag, nur ein schnellerer
Zugang. Zugänglicher Name identisch („Cookie-Einstellungen"), damit Screenreader-Nutzer
dasselbe Ziel finden.

**Responsive.** Nur < `lg`; ab `lg` genügt der Footer-Eintrag.

**Dark.** Remap.

---

## 11. Footer

**Zweck.** Identität, Adresse, alle Kontaktwege, Rechtsseiten, Consent-Widerruf.

**Aufbau.** `<footer class="pf-invert">` (themenunabhängig dunkel) mit Adressblock,
Kontaktwegen (Telefon/WhatsApp/E-Mail/Instagram), Rechtslinks (Impressum, Datenschutz),
„Cookie-Einstellungen". Optional Wortmarke/Logo.

**Token-Verwendung.** `.pf-invert`-Scope (§0.5): `--pf-surface-page` `neutral.900`,
Text `neutral.50/300/400`, Linien `neutral.700`, Akzent `accent.200`. Abstände aus der
Skala. **Keine** Linie zwischen den Blöcken, Ton + Korn tragen die Trennung.

**Zustände.** Links: S1 `--pf-text-secondary`, S2 `--pf-accent-text` + Unterstrich,
S3 Ring (`--pf-focus-ring-on-inverted` = `accent.200`, 8,75:1), S4 Press; S5/S6 —;
S7 nur, falls ein Footer-Link „current" sein kann (nein).

**A11y.** `<footer>` = Landmark `contentinfo` — genau eines. Adresse als `<address>`.
Externe Links (Instagram, Google) mit Hinweis im zugänglichen Namen. Touch-Ziele ≥ 44 px.

**Responsive.** Mobil gestapelt; ab `md` 2–3 Spalten. Der Floating-Revoke-Button
verschwindet, sobald der Footer sichtbar ist.

**Dark.** Der Footer ist in Light und Dark identisch dunkel (bewusste Entscheidung,
`konzept.md` §9) — keine Dark-Sonderregel.

---

## 12. Button

**Zweck.** Genau eine Aktion je Button. CTAs sagen konkret, was passiert (nie „Mehr
erfahren" als Primär-CTA).

**Varianten.**

| Variante | Einsatz | Fläche | Text |
|---|---|---|---|
| `primary` | genau einer pro Seite (Hero, CTA-Band) oder einer pro Formular | `--pf-surface-accent` | `--pf-text-on-accent` |
| `secondary` | gleichrangige Alternative (z. B. „Alle ablehnen") | transparent + Kontur `--pf-border-strong` | `--pf-text-primary` |
| `tertiary`/`link` | ruhige Wege (Telefon, WhatsApp, „Zu fugenlosen Böden") | keine Fläche | `--pf-text-link` + Unterstrich |
| `icon` | seltene Symbolaktion (Menü, Schließen) | wie secondary | Icon + `visually-hidden` Text |
| `danger` | nur zerstörerische Bestätigung (hier praktisch nicht verwendet) | `--pf-surface-error` | `--pf-text-error` |

**Token-Verwendung.** Radius `--pf-radius-full` (Pill), Höhe ≥ `--pf-touch-target`,
Padding `--pf-space-3 --pf-space-7`, Typo `--pf-type-label`, Übergang
`--pf-duration-fast --pf-ease-standard`.

**Zustände (alle sieben, je Variante).**

| # | primary | secondary | tertiary |
|---|---|---|---|
| S1 default | Fill `accent.700`, Text weiß | Kontur `neutral.600`, Text `primary` | Linktext `accent.600` |
| S2 hover | Fill `accent.800` **+** 1 px Lift (`--pf-shadow-sm`) | Fill `--pf-surface-sunken` **+** Kontur `neutral.700` | Unterstrich sichtbar, `accent.700` |
| S3 focus-visible | Ring `neutral.0` (auf Akzentfüllung) | Ring global, außen | Ring global, außen |
| S4 active | Fill `accent.900` **+** `translateY(1px)` | Fill `--pf-surface-sunken` **+** Press | `accent.900` **+** Press |
| S5 disabled | Fill `neutral.300`, Text `neutral.600`, `not-allowed` | Kontur `neutral.300`, Text `neutral.500` | Text `neutral.500`, keine Unterstreichung |
| S6 busy | Fill unverändert, Label → Status, `aria-busy`, Spinner (reduziert-motion-fest) | dito | dito |
| S7 selected | nur bei Toggle-Buttons: Fill `accent.800` **+** Häkchen-Icon (zweite Achse) | dito | dito |

**A11y.** `<button>` für Aktionen, `<a>` für Navigation — nie umgekehrt. Sichtbarer
Textname; das Label darf sich in S6 ändern („Senden" → „Wird gesendet …"), solange
`aria-busy` gesetzt ist. `disabled` nur, wenn der Grund im Formular sichtbar benannt ist
(§9.2 S5). Fokusring nie entfernen; bei Pill-Buttons folgt der Ring per
`border-radius: inherit`.

**Responsive.** Mobil dürfen CTAs über die volle Breite gehen (bequem daumen-bedienbar),
ab `sm` inhaltsbreit.

**Dark.** Fill `accent.400` (weißer Text 4,90:1; Fläche 3,81:1 gegen Seite). Hover/Active
hellen **nicht** auf, sondern dunkeln ab (`accent.500`/`accent.600`) **plus** Press-Transform
— in Dark ist die Bewegung die zweite Achse.

---

## 13. Fokus-Stile (global, nicht optional)

Siehe §0.3. Ergänzend:

- **Wo der Ring sichtbar sein muss:** jede Seite, jedes interaktive Element, in beiden
  Themes, auf jeder Fläche (`page`, `sunken`, `raised`, `accent`, invertiert). Nachgewiesen
  durch die auditierte `focus`-Belegung (§14-Tabelle).
- **Ring-Farbe wechselt mit der Fläche:** `accent.700` auf hellen Flächen, `neutral.0` auf
  Akzentfüllung, `accent.200` auf invertierter Fläche. Der Ring hält gegen den **realen**
  Hintergrund ≥ 3:1 (alles auditiert).
- **`scroll-margin-top`** auf fokussierbaren Zielen berücksichtigt `--pf-header-height`,
  damit der Ring bei Sprungmarken nicht unter dem Header verschwindet.

---

## 14. A11y-Vorgaben (Sammelabschnitt, für MARAA-5 verbindlich)

### 14.1 Landmarks & Überschriftenhierarchie

| Seite | Landmarks | Überschriften |
|---|---|---|
| Alle | `banner` (Header), `main` (`#hauptinhalt`), `contentinfo` (Footer) | genau **ein** `<h1>` |
| Start | + `<nav aria-label="Hauptnavigation">` | h1 Hero → h2 je Sektion → h3 Karte |
| Leistungsdetail | + `<nav aria-label="Brotkrumen">` | h1 Leistung → h2 Abschnitte → h3 Oberflächen |
| Kontakt | + `<form aria-labelledby>` | h1 → h2 Kontaktwege / Formular → h3 Feldgruppen |
| Bewertungen | + `role="region"` für die Sektion | h1 → h2 Bewertungen → h3 (keine) |

Keine Ebene wird übersprungen. `lang="de"` am `<html>`.

### 14.2 Kontrast (berechnet, nicht behauptet)

Auszug aus `tokens.json → audit` (`python3 tools/build-tokens.py --audit`):

| Paar | Verhältnis | Schwelle |
|---|---|---|
| `text.primary` (`neutral.900`) auf `surface.page` | 15,65:1 | ≥ 4,5 ✓ |
| `text.secondary` (`neutral.700`) auf page | 8,61:1 | ✓ |
| `text.muted` (`neutral.600`) auf page / sunken / raised | 5,81 / 5,42 / 6,06:1 | ✓ |
| `text.on-accent` (weiß) auf `surface.accent` | 12,52:1 | ✓ |
| `border.input` (`neutral.500`) auf page | 3,67:1 | ≥ 3 (Non-Text) ✓ |
| `focus.ring` (`accent.700`) auf page / sunken / raised | 11,99 / 11,19 / 12,52:1 | ≥ 3 ✓ |
| Dark: `text.primary` auf `surface.page` | 17,89:1 | ✓ |
| Dark: `text.on-accent` auf `surface.accent` (`accent.400`) | 4,90:1 | ✓ |
| Dark: `focus.ring` (`accent.200`) auf page | 10,00:1 | ✓ |
| Attributionszeile `text.muted` auf page | 5,81:1 | ≥ 4,5 ✓ |
| Sterne (`text.primary`) auf `surface.raised` | 15,65:1 | ✓ |

### 14.3 Touch-Targets ≥ 44 px

Betroffen: Navi-Links (vertikales Padding), Breadcrumb-Links, Icon-Buttons, Toggle-Switches,
Consent-Buttons, Formularfelder (Höhe), Footer-Links, Floating-Revoke. Gemessen wird die
**Trefferfläche**, nicht die sichtbare Form.

### 14.4 `prefers-reduced-motion`

Alle Übergänge nutzen `--pf-duration-*`/`--pf-ease-*`. Bei `reduce` werden Dauer → 1 ms und
Easing → linear (in `tokens.css` §5 umgesetzt). Erlaubte Bewegung (Naht zeichnen, Lift)
wird dann zum Zustand ohne Animation. Kein Slider, kein Parallax, kein Auto-Play, keine
Animation-Library.

### 14.5 Bewegung — nur zwei erlaubte Muster

1. **Die Naht zeichnet sich** (`transform: scaleX`, nur Start, nur `no-preference`).
2. **Oberflächen heben/senken sich** bei Hover/Active (1 px + Schattenwechsel).

Jede weitere Bewegung ist ein `[blocker]` im Review.

---

## 15. Copy-Micro-Spezifikation

**Ton (aus `content/README.md`, verbindlich):** handwerklich, präzise, verbindlich — in
der **Sie**-Form. Keine Superlative, keine Floskeln, keine erfundenen Zahlen oder
Bewertungen.

### 15.1 Hierarchie je Sektion

| Ebene | Funktion | Länge | Beispielmuster |
|---|---|---|---|
| Eyebrow | Ort/Thema, uppercase `tx` | 2–4 Wörter | `SCHWÖRSTADT (BADEN)` |
| H1 | genau eine Aussage | ≤ 12 Wörter, 22ch-Maß | Ergebnis ohne Floskel (Variante A) |
| Lead | was das ist, für wen | 1–2 Sätze, 44ch | — |
| Body | Detail | auf 62ch begrenzt | — |
| Button | was konkret passiert | 2–4 Wörter, Verb zuerst | „Beratung anfragen", „Jetzt bei Google bewerten" |
| Meta/Attribution | Herkunft, Rechtliches | `tx`, `tabular-nums` | „Bewertungen von Google Maps", Datum |

### 15.2 Platzhalterstrategie (kein erfundenes Faktum im Entwurf)

Es gibt **keinen** blinden Lorem-Ipsum-Text in der Spezifikation. Jeder Text ist entweder
echt (aus `content/*`) oder ein **sauberer, benannter Slot**. Das Content-Pack (MARAA-3)
liegt vor; die Spec verweist auf die konkreten Abschnitte:

- `[content/start.md #H1]` — H1 Startseite (Empfehlung: Variante A).
- `[content/start.md #Section 2]` — Texte und Alt-Texte der vier Leistungs-Karten.
- `[content/micro-ux-consent.md #Formular]` · `#Fehlertexte` · `#Zustände` — Labels,
  Hilfetexte, Fehlermeldungen, Zustandstexte.
- `[content/micro-ux-consent.md #Consent-Banner]` — Bannertexte, Titel, Buttons,
  Kategorie-Beschreibungen, Fußzeilen- und Speicherhinweis.
- `[content/bewertungen.md #Leerzustand-Text]` · `#Attributions-Zeile` ·
  `#Sortierungs-Hinweis` · `#Hinweis` — Bewertungs-Sektion in beiden Zuständen.
- `[content/site.json #email]` — Ziel-E-Mail (offener Kundenpunkt OP-1).
- `[env GOOGLE_REVIEW_URL]` — Ziel des CTA „Jetzt bei Google bewerten" (offener Punkt OP-2).

Ein Slot darf **nie** still durch Beispieltext ersetzt werden. Fehlt ein Slot, greift die
jeweils definierte Leer-/Fallback-Regel (z. B. CTA ausgeblendet, wenn URL leer;
Aktualisierungszeile ausgeblendet, wenn kein gültiges Datum).

### 15.3 Verbotene Muster (Signale, dass nichts gesagt wurde)

„revolutionär", „innovativ", „ganzheitlich", „maßgeschneidert", „Ihr starker Partner",
„Mehr erfahren" als Primär-CTA, jede Zahl ohne Beleg, jede Bewertung ohne Korpus,
jede Referenz ohne Nachweis.

### 15.4 Fehler- und Statustexte (Regel)

Ein Fehlertext nennt **was** und **wie**: „E-Mail-Adresse fehlt das @-Zeichen. Bitte als
name@beispiel.de eingeben." — nicht „Ungültige Eingabe". Ein Statustext sagt, was gerade
passiert: „Wird gesendet …", „Bewertungen werden geladen". Der Konsens: Der Nutzer soll
nach dem Lesen genau eine richtige Handlung ausführen können.

---

## 16. CtaBand + Section/Container/Seam/SectionHeading (Primitiven)

### 16.1 CtaBand

**Zweck.** Seitenende-Abschluss mit einem Ziel (`/kontakt/#formular`). Trägt die **eine
Fuge** des Auftritts.

**Aufbau.** `<section>` auf `--pf-surface-sunken` (Tondifferenz statt Linie), darüber die
**Seam** (§16.3, genau einmal im gesamten Auftritt), Text in `display.2xl`, ein
Primär-CTA, Sekundärwege ruhig darunter.

**Token.** `--pf-section-y` / `--pf-section-y-md`, davor `--pf-breathe-y` (Durchatemstelle),
`--pf-seam-color`/`--pf-seam-width`.

**Wow-Detail.** Die Fuge zeichnet sich von links (`transform: scaleX`, `--pf-duration-slower`,
`--pf-ease-out`) und steht bei reduzierter Bewegung sofort.

### 16.2 Container & Section

- `Container`: `max-width: --pf-container-max` (1200 px), Padding `--pf-gutter-sm`/`-md`.
  Varianten `prose` (640 px) und `bleed` (1440 px, nur Bilder).
- `Section`: vertikaler Rhythmus `--pf-section-y`/`-md`; **keine** Linien; optionale
  Tondifferenz (`surface`-Prop: `page`/`sunken`/`raised`/`accent-subtle`).

### 16.3 Seam (die eine Fuge)

```html
<div class="pf-seam" data-drawn="true">
  <span class="pf-seam__line"></span>
</div>
```

**Regel.** Genau **ein** Vorkommen im gesamten Auftritt (Startseite/CTA-Band). Eine
zweite Seam irgendwo ist ein `[blocker]`. Höhe 1 px (`--pf-seam-width`), Farbe
`--pf-seam-color`. Kein JS: `data-drawn` wird über `IntersectionObserver` **einmalig**
gesetzt, oder die Linie steht per Default und animiert nur mit `no-preference`.

### 16.4 SectionHeading

**Primitive** für wiederkehrende Abschnittsköpfe: optionale Eyebrow (`--pf-type-eyebrow`),
H2 (`--pf-type-display-section`), optionaler Lead. Rendersemantik werden vom Aufrufer
gesetzt (keine doppelten Ebenen). Damit ist die Sektionsrhythmik über alle Detailseiten
identisch, ohne sie mit Linien zu markieren.

---

## 17. Abnahme-Checkliste pro Komponente (MARAA-6)

Für jede Komponente gilt: **(1)** alle zutreffenden der sieben Zustände sind vorhanden und
unterscheidbar (nicht nur farblich); **(2)** Fokus sichtbar in beiden Themes; **(3)**
Touch-Ziel ≥ 44 px; **(4)** Kontrast gegen den realen Hintergrund ≥ 4,5:1 (Text) bzw. ≥ 3:1
(Non-Text); **(5)** Bewegung ausschließlich nach §14.5 und `prefers-reduced-motion`-fest;
**(6)** nur semantische Tokens, keine Primitive im Komponenten-Code; **(7)** im
Consent-Zustand „unbekannt" erzeugt die Komponente **null** Cross-Origin-Requests.

Die letzten beiden Punkte sind die Verbindung zu den Gates aus ADR §9.2
(`E2E Consent`: 0 Cross-Origin-Requests; `Lint/Composition`: Token-Disziplin).

---

## 18. Dateien & offene Punkte

| Bezug | Datei |
|---|---|
| Richtung, Farbwelt, Typografie, 30 Prüfpunkte | `docs/design/konzept.md` |
| Token-Werte (kanonisch) + Audit | `docs/design/tokens.json` |
| CSS-Custom-Properties (generiert) | `docs/design/tokens.css` |
| Consent-Contract | `docs/contracts/consent.schema.json` |
| Review-Contract | `docs/contracts/reviews.schema.json` |
| Platzhalter-Inhalte | `content/*` (MARAA-3) |

Offene Punkte, die diese Spezifikation nur als Slot enthält (Details in `konzept.md` §13):
Attribution-Wortlaut „Google Maps" (CEO-Bestätigung), Sektion-Gating `content` vs.
`section` (CEO), Font-Budget-Fallback, Bildrechte/Logo-Freistellung, korrekte E-Mail-Adresse.

---

*Ende der Komponenten-Spezifikation. Abweichungen im Build sind `[nötig]`/`[blocker]`-
Kommentare im Review, keine stillen Anpassungen. Änderungen an dieser Spec brauchen ein
Update des Dokuments und — bei Token-Wirkung — ein neues Audit.*
