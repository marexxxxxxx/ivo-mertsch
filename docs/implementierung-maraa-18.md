# Implementierung MARAA-18 (F1) — Design-Delta Professionalisierung

| | |
|---|---|
| **Issue** | MARAA-18 (F1) — Umsetzung Light-Pflicht + Design-Delta |
| **Auftrag** | Board-Auftrag **MARAA-15** (Nutzer-Briefing) |
| **Design-Vorgabe** | **D1** (MARAA-16): `docs/design/tokens.json` **v1.1.0**, `docs/design/konzept.md` §16, `docs/design/komponenten.md` §19 |
| **Theme-Kodierung** | **A1** (MARAA-17): `docs/adr/0003-light-als-einzige-auslieferungsansicht.md` |
| **Rolle** | Frontend Developer (PixelForge Studio) |
| **Datum** | 2026-10-14 |
| **Grenze** | Keine Content-Texte geändert (Copywriter), keine neuen Dritt-Skripte, DSGVO/Consent-Mechanik unangetastet. |

Dieses Issue entscheidet nichts neu — es setzt D1 und A1 im Produktionscode um.

---

## 1. A1 — Light ist die einzige Auslieferungsansicht

A1 wurde durch **D1 bereits im Generator verankert** (Flag `meta.colorScheme.autoDark`).
F1 hat den Stand **verifiziert** und das CSS **neu erzeugt** (Regenerat war bereits in
`e8017b6` enthalten); es wurde **keine zweite Umsetzung** angelegt (ADR 0003 §4, Reihenfolge-Hinweis).

| Prüfung | Datei | Ergebnis |
|---|---|---|
| `meta.colorScheme.autoDark` | `docs/design/tokens.json` | **`false`** |
| Auto-Dark-Block wird nur bei `autoDark=true` emittiert | `tools/build-tokens.py` §6 | bedingtes `if auto_dark:` ✓ |
| `data-theme="light"` wird **nicht** gesetzt (D2) | `src/layouts/BaseLayout.astro` | unverändert, kein Attribut ✓ |

Invarianten (gemessen):

```
grep -cE '^[[:space:]]*@media[^{]*prefers-color-scheme' docs/design/tokens.css  → 0
grep -c 'color-scheme: dark'   docs/design/tokens.css  → 0
grep -c 'color-scheme: light'  docs/design/tokens.css  → 1
grep -c '^\[data-theme="dark"\] {' docs/design/tokens.css → 1   (dormantes Remap bleibt)
grep -c '^\.pf-invert {'       docs/design/tokens.css  → 1
grep -rlE '@media[^{]*prefers-color-scheme' dist/client/_astro/  → 0 Treffer
python3 tools/build-tokens.py --check  → "[check] tokens.css ist aktuell"  EXIT 0
python3 tools/build-tokens.py --audit  → "AUDIT BESTANDEN"                 EXIT 0
```

**Render bei erzwungenem `prefers-color-scheme` (Chromium 1440 px):**

| Schema | `body` background | `body` color | `color-scheme` |
|---|---|---|---|
| `dark` | `rgb(251, 250, 246)` = `#FBFAF6` | `rgb(36, 31, 25)` | `light` |
| `light` | `rgb(251, 250, 246)` = `#FBFAF6` | `rgb(36, 31, 25)` | `light` |

Beide Schemata liefern **dasselbe helle** Ergebnis (`identical: true`).
Belege: `docs/qa/evidence/maraa18/light-pflicht.json`,
`docs/qa/evidence/screens/light-scheme-dark-1440.png`,
`docs/qa/evidence/screens/light-scheme-light-1440.png`.

---

## 2. D1 — Design-Delta umgesetzt

### 2.1 Die eine Kartenregel (§19.0/§19.1)

`src/styles/global.css` — `.pf-card` ist jetzt die gehobene Platte: Fläche
`--pf-surface-raised`, Radius `--pf-radius-card` (16 px), **ein** warmes Schattenrezept
`--pf-shadow-card`, kein Rand, `overflow: hidden` (Bild wird am Kartenradius beschnitten).
`.pf-card__body` trägt Padding `--pf-space-6` (mobil) / `--pf-space-7` (ab `md`).
`src/components/ServiceCard.astro` wurde in `__media` + `__body` strukturiert.

### 2.2 Leistungs-Bento (§19.3) — asymmetrisch, kein 3-Kästen-Grid

`src/styles/global.css` — `.pf-grid--services` ist ab `md` ein **12-Spalten**-Raster:
Karte 1 (`--pf-card--wide`, das differenzierende 2K-Thema) spannt **volle Breite** (Medien-/
Textfläche zweigeteilt), die Karten 2–4 je **4 Spalten**. Mobil eine Spalte.
`src/pages/leistungen/index.astro` setzt dafür `wide: true` an der ersten Karte (wie der
Startseiten-Bento und das Mock-Up `docs/design/mockup/leistungen.html`).

### 2.3 Galerie-Bento (§19.4)

`src/styles/global.css` + `src/components/GalleryGrid.astro` — Zellen als Karten
(`--pf-radius-card` + `--pf-shadow-card`), eine große Zelle (2×2 ab `lg`), Bilder im
Kartenradius beschnitten, feste `aspect-ratio` (kein CLS).

### 2.4 Hero — Bild rechts (§19.2)

`src/styles/global.css` — zweispaltig ab `md` (`1fr 1.15fr`, Bild **rechts**), Bild-Radius
`--pf-radius-media`, `--pf-shadow-card`, feste `aspect-ratio` 16/10 (mobil) → 4/3 (ab `md`)
→ 16/10 (ab `lg`). Mobil steht der **Text über dem Bild** (media-below), damit der Textkontrast
unabhängig vom Foto garantiert ist. Die Struktur aus `Hero.astro` (Eyebrow → H1 → Lead → CTAs)
blieb unverändert; der Primär-CTA „Beratung anfragen" und der Telefon-`tel:`-Link lagen bereits vor.

### 2.5 Kontaktblock (Bewertungen / Formular / Footer)

- **Formular (§19.6):** `.pf-form` liegt jetzt als Karte (`--pf-radius-card` +
  `--pf-shadow-card`, Padding `--pf-space-7`); Eingaben nutzen `--pf-radius-input` (12 px)
  statt der Stufen-Radius-Rolle. `src/pages/kontakt.astro` führt Kontaktwege **und** Formular
  in einem `.pf-contact-grid` (Kontaktwege links, Formularkarte rechts, ab `md`), wie
  `komponenten.md` §9/§19.6 und das Mock-Up. IDs/`aria-labelledby`/`#formular`-Anker blieben erhalten.
- **Bewertungs-Grid (§19.5):** `.pf-review` und der bewusste Leerzustand `.pf-empty` liegen auf
  `--pf-radius-card` + `--pf-shadow-card` (1 / 2 / 3 Spalten).
- **Footer (§19.7):** ruhiges Spaltenlayout 1 (mobil) / 2 (ab `sm`) / `1.4fr 1fr 1fr` (ab `md`);
  bleibt die **eine** theme-unabhängig dunkle Fläche (`.pf-invert`).

### 2.6 Display-Typografie auf Sans (P3) — Instrument Sans, Fraunces entfernt

`--pf-font-display` zeigt bereits auf **Instrument Sans** (D1). F1 hat die tote
Fraunces-Ressource **aus dem Bundle entfernt**: `@font-face` in `src/styles/fonts.css`
gelöscht, Abhängigkeit `@fontsource-variable/fraunces` aus `package.json`/`package-lock.json`
entfernt. Ergebnis: `0` Fraunces-Referenzen, das gebaute Bundle enthält nur noch
`instrument-sans-…woff2` (Font-Budget ≤ 120 KB bleibt eingehalten, **keine neue Abhängigkeit**).

---

## 3. Belege (Befehl → Ergebnis)

| Beleg | Kommando | Ergebnis |
|---|---|---|
| Lieferdefinition grün | `npm run verify` | **EXIT 0** — build ✓, `astro check` 0 errors/0 warnings, eslint ✓, vitest **42/42** ✓ |
| E2E-Gates | `npm run test:e2e` | **EXIT 0** — **25/25** (a11y, consent, contact, ki-hinweis) |
| A11y alle Seiten | `node tests/qa/qa-run.mjs a11y` | **0** serious/critical, genau 1 `h1`, Landmarks, `lang=de` |
| Overflow + Touch | `node tests/qa/qa-run.mjs overflow` | **0** Overflow (360/768/1024/1440), **0** Ziele < 44 px (und < 24 px) |
| Token-Konsistenz | `python3 tools/build-tokens.py --check` | `tokens.css ist aktuell`, **EXIT 0** |
| Kontrast-Audit | `python3 tools/build-tokens.py --audit` | `AUDIT BESTANDEN` (62 Paare inkl. Kartenfläche `raised`), **EXIT 0** |
| Light-Pflicht | `docs/qa/evidence/maraa18/light-pflicht.json` | dark = light = `#FBFAF6`, `identical: true` |
| Beleg-Screens | `node tests/qa/maraa18-capture.mjs` | 15 Screens (s. u.) |

### Beleg-Screens (angesehen, nicht nur erzeugt)

`docs/qa/evidence/screens/`:

| Seite | 360 px | 768 px | 1440 px |
|---|---|---|---|
| Start | `home-360.png` | `home-768.png` | `home-1440.png` |
| Leistungen | `leistungen-360.png` | `leistungen-768.png` | `leistungen-1440.png` |
| Kontakt | `kontakt-360.png` | `kontakt-768.png` | `kontakt-1440.png` |
| Bewertungen | `bewertungen-360.png` | `bewertungen-768.png` | `bewertungen-1440.png` |

Zusätzlich: `light-scheme-dark-1440.png`, `light-scheme-light-1440.png`,
`consent-banner-360.png`, Liste in `docs/qa/evidence/screens.json`.
Visuell bestätigt: Bild rechts im Hero, Card/Bento-Raster für Leistungen, Karten-Radius +
weicher Schatten, Formular als Karte neben der Kontaktwege-Liste, 3-spaltiger Footer,
dark-OS rendert hell.

---

## 4. Abgabe-Checkliste (Frontend Developer)

- [x] `npm run verify` grün (EXIT 0) — build + typecheck + lint + test
- [x] Screenshots 360 / 768 / 1024 / 1440 **angesehen**
- [x] Sieben Zustände vorhanden (Button/Link/Formfeld unverändert über Tokens; Karte: S1/S3/S6; Hover-Lift nur bei Karten-Ganz-Link)
- [x] Tastatur-Durchlauf: `test:e2e` (Skip-Link, Drawer, Dialog, Formular) grün
- [x] Kein Hex-Literal, kein `!important`, kein `any` im neuen Code (geprüft)
- [x] Kein horizontaler Overflow bei 360 px (qa-run overflow: 0)
- [x] Keine **neue** Abhängigkeit — eine (Fraunces) sogar **entfernt** (Bundle kleiner)
- [x] `prefers-reduced-motion` umgesetzt (tokens.css §5 unverändert; qa-run keyboard grün)
- [x] Nur semantische Tokens (`--pf-radius-card`, `--pf-shadow-card`) im neuen CSS

---

## 5. Übergabe an QA (MARAA-19 / Q1)

QA-Gate aus ADR 0003 §4.4:

```
grep -cE '^[[:space:]]*@media[^{]*prefers-color-scheme' <gebautes CSS>  == 0
Render bei emuliertem prefers-color-scheme: dark (1440 px):
  body-Hintergrund bleibt Light (nicht #15120D)
```

Beide Bedingungen sind oben belegt. Zusätzlich prüfbar: Card/Bento-Layout,
Radien 12–16 px, `--pf-shadow-card`, Fraunces nicht mehr im Bundle.
