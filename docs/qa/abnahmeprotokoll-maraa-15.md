# Abnahmeprotokoll — MARAA-15 / Q1 (Professionalisierung: A11y, Kontrast, Browser, Light-Pflicht)

| | |
|---|---|
| **Issue** | **MARAA-19** (Q1) — Abnahme der Umsetzung aus F1 |
| **Board-Auftrag** | **MARAA-15** (Nutzer-Briefing Professionalisierung) |
| **Prüfobjekt** | Umsetzung **F1 (MARAA-18)** — Design-Delta **D1 (MARAA-16)** + Light-Pflicht **A1 (ADR 0003, MARAA-17)** |
| **Autor** | QA Engineer, PixelForge Studio |
| **Datum** | 2026-10-14 |
| **Geprüfter Stand** | Commit **`d325fa6`** (`main`), frisch gebaut mit `npm run build`; Working Tree sauber (nur unversionierte QA-Dateien) |
| **QA-Harness** | `tests/qa/maraa19-verify.mjs` (eigenständig, unabhängig vom Entwickler-E2E-Set) |
| **Gesamturteil** | **BESTANDEN — 6 von 6 Verifikationspunkten erfüllt, 114 von 114 Einzelprüfungen grün.** Keine abnahmerelevanten Verstöße. Der CEO bestätigt die Abnahme. |

> Grundsatz dieses Protokolls: Jeder **Pass** hat einen **Beleg** (JSON-Messwert, Screenshot,
> Audit-Ausgabe, HTTP-Status). Nicht gerendert und angesehen = nicht verifiziert. Bei Zweifeln
> wurde **Fail** gemeldet, nicht Pass. `waitForTimeout()` wurde nicht verwendet.

---

## 1. Prüfumgebung

| | |
|---|---|
| Host | Agenten-Sandbox (Linux) |
| Node | v26.8.1 |
| Auslieferung | `node ./dist/server/entry.mjs` (Production-Build), `http://127.0.0.1:4321` |
| Playwright | 1.64.0 (Chromium 1248 `headless_shell` / `chromium`) |
| axe | axe-core **4.13.0** über `@axe-core/playwright`, Tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22a, wcag22aa` |
| Kontrast-Audit | `tools/audit-tokens.py`, `tools/build-tokens.py --check/--audit` (Python 3.14) |
| Rate-Limit-Nachweis | direkter POST gegen den laufenden Server (Python `urllib`) |
| Bewertungs-Inhalt-Zustand | temporärer Fixture-Build (QA-Korpus, **nicht** committet; `content/reviews.json` unverändert) |

---

## 2. Ergebnistabelle (binär)

| # | Kriterium (Quelle) | Status | Beleg |
|---|---|---|---|
| **1** | **Light-Pflicht (P1/ADR 0003):** Render bei `prefers-color-scheme: dark` MUSS hell sein; `body`-Hintergrund ≠ `#15120D` | **Pass** | `evidence/maraa19/light-pflicht.json`, `screens/light-*-{dark,light}-1440.jpg` |
| 1a | Keine Auto-Dark-At-Regel im erzeugten **und** gebauten CSS | **Pass** | `grep`-Zähler (0 / 0), s. §3.1 |
| 1b | `body`-Fläche dark-OS = light-OS = `rgb(251,250,246)` (`#FBFAF6`), `color-scheme: light` | **Pass** | `light-pflicht.json` (`identical: true`, 5 Seiten) |
| **2** | **Kontrast:** `python3 tools/audit-tokens.py` Exit 0 | **Pass** | Audit-Ausgabe (§3.2); 62 Paare, alle ≥ Minimum |
| 2a | axe/WCAG 2.2 AA auf Start, Leistungen (4), Kontakt, Bewertungen, Rechtstexte | **Pass** | `evidence/maraa19/axe.json` — **0** Verstöße (auch 0 serious/critical) auf 12 Seiten |
| 2b | Genau ein `<h1>`, Landmarks (`header`/`main`/`footer`), `lang="de"` | **Pass** | `axe.json` je Seite |
| **3** | **Interaktion:** Touch-Targets ≥ 44 px | **Pass** | `evidence/maraa19/interaction.json` — 0 Ziele < 44 px (und < 24 px) |
| 3a | Sichtbarer Fokus im Tastatur-Durchlauf | **Pass** | `interaction.json` — 30 Tab-Schritte, 0 ohne Fokusindikator |
| 3b | `prefers-reduced-motion` (Dauer-Token → 1 ms) | **Pass** | `interaction.json` — `--pf-duration-fast = 1ms` |
| **4** | **Browser/Responsive:** Chromium 360 / 768 / 1440, kein horizontales Scrollen | **Pass** | `evidence/maraa19/responsive.json` — 24/24 Messungen ohne Overflow, Screens |
| **5** | **Regression:** Consent-Banner/-Dialog/Widerruf | **Pass** | `evidence/maraa19/consent.json` (11 Prüfungen) |
| 5a | Kontaktformular: Erfolg + Fehler + Rate-Limit | **Pass** | `evidence/maraa19/contact.json`, `evidence/maraa19/rate-limit.json` |
| 5b | Bewertungs-Grid **und** Leerzustand | **Pass** | `evidence/maraa19/reviews.json`, `reviews-filled.json`, `screens/bewertungen-filled-*.jpg` |
| 5c | Header/Drawer (mobil) + Desktop-Navigation | **Pass** | `evidence/maraa19/drawer.json` |
| **6** | **Briefing-Abgleich:** jeder Briefing-Punkt erfüllt oder als Abweichung dokumentiert | **Pass** | `evidence/maraa19/briefing.json` + §3.6 (gemessen, nicht geschätzt) |

**Konsolidiert:** `docs/qa/evidence/maraa19/results.json` — **114 Prüfungen, 0 Fehlschläge.**

---

## 3. Detailnachweise

### 3.1 Light-Pflicht (P1 / ADR 0003 §4.4)

**A. Generator-/Artefakt-Gate (At-Regel, nicht Zeichenfolge):**

| Prüfung | Erwartet | Gemessen |
|---|---|---|
| `grep -cE '^[[:space:]]*@media[^{]*prefers-color-scheme' docs/design/tokens.css` | 0 | **0** |
| `grep -c 'color-scheme: dark' docs/design/tokens.css` | 0 | **0** |
| `grep -c 'color-scheme: light' docs/design/tokens.css` | 1 | **1** |
| `grep -c '^\[data-theme="dark"\] {' docs/design/tokens.css` | 1 (dormant) | **1** |
| `grep -c '^\.pf-invert {' docs/design/tokens.css` | 1 | **1** |
| `grep -rlE '@media[^{]*prefers-color-scheme' dist/client/` | 0 Dateien | **0** |
| `python3 tools/build-tokens.py --check` | Exit 0 | **Exit 0** (`tokens.css ist aktuell`) |
| `python3 tools/build-tokens.py --audit` | Exit 0 | **Exit 0** (`AUDIT BESTANDEN`) |
| `python3 tools/audit-tokens.py` | Exit 0 | **Exit 0** |

**B. Render bei erzwungenem `prefers-color-scheme: dark` (Chromium 1440 px):**

Beide Schemata liefern **dasselbe helle** Ergebnis; `data-theme` wird **nicht** gesetzt (ADR D2).

| Seite | `dark` body-bg | `light` body-bg | `color-scheme` | identisch |
|---|---|---|---|---|
| `/` (Start) | `rgb(251,250,246)` | `rgb(251,250,246)` | `light` | **ja** |
| `/leistungen/` | `rgb(251,250,246)` | `rgb(251,250,246)` | `light` | **ja** |
| `/kontakt/` | `rgb(251,250,246)` | `rgb(251,250,246)` | `light` | **ja** |
| `/bewertungen/` | `rgb(251,250,246)` | `rgb(251,250,246)` | `light` | **ja** |
| `/impressum/` | `rgb(251,250,246)` | `rgb(251,250,246)` | `light` | **ja** |

`#15120D` = `rgb(21,18,13)` ist der frühere Auto-Dark-Wert — **nirgends** gemessen.
Beleg-Screens: die `dark`- und `light`-Aufnahmen der Startseite sind **byte-identisch**
(`md5 d7af8276786790de0ad70a92bafe946b`, 1.979.206 B je Datei).
`docs/qa/evidence/maraa19/screens/light-start-{dark,light}-1440.jpg`.

### 3.2 Kontrast (WCAG 2.2 AA)

- **Token-Audit** (`tools/audit-tokens.py`): **Exit 0**, `20 Text- / 22 Non-Text- / 20 Dark-Paare`,
  alle Text ≥ 4,5:1, Non-Text ≥ 3,0:1. Die neue Kartenfläche `raised` (`neutral.0`) ist als
  realer Hintergrund mitgeprüft (u. a. Kartentitel **16,34:1**, Sekundärtext **8,99:1**).
- **axe 4.13.0**, Tags inkl. `wcag22aa`, **12 Seiten** (Start, 4 Leistungsseiten, Über uns,
  Kontakt, Bewertungen, Impressum, Datenschutz, 404):
  **0 Verstöße** insgesamt — nicht nur 0 serious/critical.
  `axe.json`. Konsolenfehler nur der erwartete `404`-Ressourcen-Fehler auf `/gibt-es-nicht/`.

### 3.3 Interaktion

- **Touch-Targets:** 0 interaktive Ziele < 44 px **und** 0 < 24 px auf
  `/`, `/leistungen/`, `/kontakt/`, `/bewertungen/` (Pixel-5-Emulation). Honeypot,
  Dialog- und `aria-hidden`-Elemente ausgenommen (wie die Projektregel).
- **Sichtbarer Fokus:** 30 Tab-Schritte auf der Startseite, **0** ohne Indikator;
  gemessener Fokusring z. B. `solid 3px rgb(14,58,54)` (= Akzent `#0E3A36`). Der
  Skip-Link („Direkt zum Inhalt") ist erster Fokuspunkt (E2E-Abdeckung, s. §3.7).
- **`prefers-reduced-motion`:** `--pf-duration-fast` wird auf **1 ms** gesetzt
  (`btnTransition: 0.001s`).

### 3.4 Browser / Responsive (Chromium)

24 Messungen (8 Seiten × 3 Breiten) — **kein** horizontaler Overflow
(`scrollWidth == clientWidth`, Toleranz 1 px): 360 / 768 / 1440 px auf Start, Leistungen,
Leistungs-Detail, Kontakt, Bewertungen, Über uns, Impressum, Datenschutz.
Screens: **alle 12 Seiten** (Start, Leistungen + 4 Detailseiten, Über uns, Kontakt,
Bewertungen, Impressum, Datenschutz, 404) bei **360 / 768 / 1440 px** als
`screens/<seite>-<breite>.jpg` (36 Bilder, angesehen — Card/Bento, Hero mit Bild rechts,
Formular-Karte, Footer). Die viewport-fixierte Mobile-Chrome (Action-Bar, floating
„Cookie-Einstellungen") ist in den Vollseiten-Belegen ausgeblendet (sie würde von Chromium
mitten ins gestitchte Bild gesetzt) und in ihrer **echten** Position als
`screens/mobile-chrome-360.jpg` dokumentiert.
`responsive.json`.

> Abgrenzung: Der Auftrag nennt **Chromium** 360/768/1440; das ist erfüllt. Firefox/WebKit
> waren Abnahmekriterium von **MARAA-6** und wurden hier nicht erneut gefahren.

### 3.5 Regression

**Consent (`consent.json`, 11 Prüfungen — alle Pass):**

| Prüfung | Ergebnis |
|---|---|
| Frischer Besuch: **0** Dritt-Requests, **0** Cookies, kein Consent-Key | Pass (18 Anfragen, alle same-origin) |
| Banner beim Erstbesuch sichtbar; „Nur notwendige" ≥ 44 px (45,2 px) | Pass |
| „Nur notwendige" **gleichwertig prominent** wie „Alle akzeptieren" (216×45,2 px, selbe Font) | Pass |
| **Ablehnen in 1 Klick**; Zustand `entscheidung="abgelehnt"` gespeichert | Pass |
| Optionale Kategorien **nicht** vorausgewählt | Pass |
| Zustand übersteht Reload **und** Seitenwechsel | Pass |
| **Widerruf** (Footer „Cookie-Einstellungen") → Kategorien aus, **0** aktive Gate-Slots | Pass |
| Policy-Versionswechsel → Banner kommt wieder | Pass |
| Footer-Link „Cookie-Einstellungen" vorhanden | Pass |

**Kontaktformular (`contact.json` + `rate-limit.json`):**

| Zustand | Ergebnis |
|---|---|
| Fehlerfall (leeres Absenden) | Zusammenfassung sichtbar, `aria-invalid=true`, Eingaben bleiben → Pass |
| Ladezustand | `aria-busy="true"` + Button `disabled` → Pass |
| Erfolg (200, gemockt) | `role="status"` „Anfrage gesendet", Formular ersetzt → Pass |
| Rate-Limit (429, gemockt) | Meldung nennt Wartezeit **und** Telefonweg → Pass |
| **echter** Submit | kein SMTP → `mailto`-Weg, Status „E-Mail-Programm öffnet sich …", kein leerer Screen → Pass |
| **echtes** Rate-Limit (Server) | 6 schnelle POSTs derselben IP: 1–5 → `400 validation`, **6 → `429 rate_limited` (retryAfterSeconds 600)** → Pass |

**Bewertungen:** Leerzustand = ehrlicher Hinweis als Karte, **0** Karten, **0** Sterne,
Google-CTA vorhanden, keine erfundenen Bewertungen (`reviews.json`). Inhalt-Zustand
(Fixture-Build, 3 QA-Bewertungen): Karten-Grid **1 / 2 / 3 Spalten** (360/768/1440),
Radius 16 px, ohne Overflow (`reviews-filled.json`, Screens `bewertungen-filled-*.jpg`).
`content/reviews.json` blieb unverändert (Working Tree sauber).

**Header/Drawer:** Drawer öffnet (mobil), `aria-expanded="true"`, Fokus geht in den Drawer,
`Escape` schließt, `aria-expanded="false"`, Fokus kehrt zum Auslöser zurück; Desktop-Haupt­navigation
sichtbar (`drawer.json`).

### 3.6 Briefing-Abgleich (gemessen am gerenderten DOM)

| Briefing-Punkt | Status | Messwert / Abweichung |
|---|---|---|
| **Mode** — Light | **erfüllt** | body-bg `rgb(251,250,246)` unter dark-OS (§3.1) |
| **Farben** — Akzent | **erfüllt** (Abweichung dokumentiert) | Akzent `#0E3A36` (`rgb(14,58,54)` als Fokusring gemessen). Briefing ließ „Grün oder Teal" offen — Tiefpetrol erfüllt es (`konzept.md` §16.3) |
| **Farben** — „frisches Weiß" | **erfüllt** (Abweichung dokumentiert) | Seitenfläche warm-weiß `#FBFAF6`, **Karten** `#FFFFFF` (echtes `rgb(255,255,255)`). Reines Weiß als Kartenfläche („gehobene Platte"), nicht als ganze Seite (§16.3) |
| **Typografie** | **erfüllt** (Abweichung dokumentiert) | genau eine Familie: **Instrument Sans** für Body **und** H1; `fontFaces = ["Instrument Sans"]`; **kein** Fraunces im Bundle (`find dist/client -name '*.woff2'` → nur `instrument-sans-…woff2`). Briefing nannte „z. B. Inter oder Plus Jakarta" als Beispiel (§16.3) |
| **Bento / Cards** | **erfüllt** | Leistungen: 12-Spalten-Raster, Karte 1 **breit** (1120 px) + 3 × 357 px — asymmetrisch; `--pf-radius-card` + `--pf-shadow-card` |
| **Radius 12–16 px** | **erfüllt** (Abweichung dokumentiert) | Karten/Media **16 px**, Eingaben **12 px**; Pill-Buttons `full`, Overlay-Panels 28 px (§16.3) |
| **Schatten** | **erfüllt** | `rgba(36,31,25,.04) 0 1px 2px, rgba(36,31,25,.12) 0 10px 28px -14px` — warmes `neutral.900`, kein Schwarz |
| **Hero** — Bild rechts, CTA + Telefon | **erfüllt** | media.x = 693,8 > body.x = 160 (Bild rechts); Primär-CTA „Beratung anfragen" + `tel:`-Link vorhanden |
| **Formular** | **erfüllt** | Formular-Karte Radius **16 px** + Schatten, Eingaben **12 px**, liegt rechts neben den Kontaktwegen (2-spaltig ab md) |
| **Reviews** | **erfüllt** | Grid 1/2/3 + ehrlicher Leerzustand (§3.5) |
| **Footer** | **erfüllt** | dunkle Fläche `rgb(36,31,25)`, 3-Spalten-Layout ab md (428 / 306 / 306 px) |

### 3.7 Querschnitts-Gates

| Kommando | Ergebnis |
|---|---|
| `npm run build` | Exit **0** |
| `npx astro check` | 69 Dateien: **0 errors / 0 warnings / 0 hints** |
| `npx eslint .` | Exit **0** |
| `npx vitest run` | **42/42** Tests grün |
| `npx playwright test` (Entwickler-E2E-Set) | **25/25** grün |

---

## 4. Befunde

**Keine abnahmerelevanten Verstöße.** Alle 6 Punkte der Verifikationsmatrix sind erfüllt;
es gibt **keinen** Rückläufer an F1.

Hinweise (nicht abnahmerelevant, kein Fail):

- Der **floating Revoke-Button** „Cookie-Einstellungen" (`ConsentRevoke.astro`, nur < lg,
  komponenten §10.3) erscheint auf 360 px auch über Bildstellen. Das ist die spezifizierte
  Komponente; es entsteht **kein** Overflow und das Touch-Ziel ist ≥ 44 px.
- **Viewport-fixierte Mobile-Chrome im Vollseiten-Beleg (Board-Hinweis 2026-10-14):** Der
  floating Revoke-Button und die Kontakt-Action-Bar sind `position: fixed`; Chromium setzt
  fixe Elemente in einem `fullPage`-Screenshot auf Viewport-Höhe und damit „mitten ins Bild".
  Das war ein **Beleg-Artefakt der Aufnahme**, kein Fehler der Seite. Der Harness blendet
  beide für die Vollseiten-Belege aus und zeigt ihre **echte** Position separat:
  `screens/mobile-chrome-360.jpg`. In der echten Ansicht liegt der floating Button über dem
  gerade sichtbaren Inhalt (z. B. über einem Formularfeld) — das ist die bewusst schwebende
  Komponente (§10.3); für den Action-Bar reserviert die Seite Platz
  (`main { padding-bottom: var(--pf-action-bar-height) }`), der Button selbst nicht.
  Bewertung durch F1/CEO, ob das Verhalten so bleiben soll — QA meldet, ändert nicht.
- Die Seiten **Impressum/Datenschutz** tragen (inhaltsbedingt) **keine** Fotos; alle
  inhaltstragenden Seiten (Start, Leistungen + Detail, Über uns) rendern ihre Bilder —
  nachgewiesen durch die 36 Vollseiten-Belege (Bilder werden vor der Aufnahme auf
  `naturalWidth > 0` geprüft).
- Die Kontakt-/Startseite hat unter dem jeweiligen Kartenblock großzügigen Sektions­abstand.
  Gemessen an `main > *` ist **keine** leere/überdimensionierte Sektion vorhanden; es ist die
  designkonforme `--pf-section-y`-Rhythmik.
- Lazy-Bilder (`loading="lazy"`) brauchen zum Screenshot-Zeitpunkt die fertige Dekodierung;
  der QA-Harness wartet seither auf `naturalWidth > 0` aller Bilder, sonst entstehen
  Screenshots mit leeren Bildflächen (Artefakt der Aufnahme, kein Renderfehler der Seite).

---

## 5. Belege

| Datei | Inhalt |
|---|---|
| `docs/qa/evidence/maraa19/results.json` | konsolidierte Prüfliste (114 Prüfungen, 0 Fail) |
| `docs/qa/evidence/maraa19/light-pflicht.json` | body-Fläche je Schema, 5 Seiten |
| `docs/qa/evidence/maraa19/axe.json` | axe 4.13.0, 12 Seiten, WCAG 2.2 AA |
| `docs/qa/evidence/maraa19/interaction.json` | Touch-Targets, Fokus, reduced-motion |
| `docs/qa/evidence/maraa19/responsive.json` | Overflow-Matrix + Screens |
| `docs/qa/evidence/maraa19/consent.json` | Consent-Regression |
| `docs/qa/evidence/maraa19/contact.json` | Formular Erfolg/Fehler/Laden/Rate-Limit |
| `docs/qa/evidence/maraa19/rate-limit.json` | echtes 429 am Server (6. POST) |
| `docs/qa/evidence/maraa19/reviews.json` | Leerzustand |
| `docs/qa/evidence/maraa19/reviews-filled.json` | Inhalt-Zustand (Fixture) |
| `docs/qa/evidence/maraa19/drawer.json` | Header/Drawer |
| `docs/qa/evidence/maraa19/briefing.json` | gemessene Design-Werte |
| `docs/qa/evidence/maraa19/screens/` | **50 JPEG-Belege**: 12 Seiten × {360,768,1440} + 10 Light-Pflicht (erzwungenes dark/light) + 3 Inhalt-Zustand + `mobile-chrome-360.jpg` |
| `tests/qa/maraa19-verify.mjs` | QA-Harness (reproduzierbar) |

Reproduktion (aus dem Projekt-Wurzelverzeichnis):

```bash
npm run build && node ./dist/server/entry.mjs &      # Server auf :4321
python3 tools/audit-tokens.py; echo $?               # 0
python3 tools/build-tokens.py --check; echo $?       # 0
python3 tools/build-tokens.py --audit; echo $?       # 0
node tests/qa/maraa19-verify.mjs all                 # 114 Prüfungen, 0 Fehlschläge
```

---

## 6. Gesamturteil

**BESTANDEN (6/6).** Die Umsetzung aus F1 erfüllt die Verifikationsmatrix der Abnahme
vollständig und reproduzierbar:

1. **Light-Pflicht** — dark-OS rendert hell (`#FBFAF6`), Screens byte-identisch zu light.
2. **Kontrast** — Token-Audit Exit 0; axe WCAG 2.2 AA ohne **jeden** Verstoß auf 12 Seiten.
3. **Interaktion** — Touch-Targets ≥ 44 px, sichtbarer Fokus, reduced-motion.
4. **Browser/Responsive** — Chromium 360/768/1440 ohne horizontalen Overflow.
5. **Regression** — Consent, Kontakt (Erfolg/Fehler/Rate-Limit), Bewertungen (Grid/Leer),
   Header/Drawer grün.
6. **Briefing-Abgleich** — jeder Briefing-Punkt erfüllt; die drei bewussten Abweichungen
   (Farbton-Akzent, warm-weiße Seitenfläche, Instrument-Sans statt Beispiel-Font) sind in
   `docs/design/konzept.md` §16.3 begründet dokumentiert.

**Empfehlung an den CEO: Abnahme bestätigen.** Kein Rückläufer an F1.
