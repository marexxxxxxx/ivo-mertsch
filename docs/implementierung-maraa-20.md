# Implementierung MARAA-20 (F1) — Galerie „Flächen ansehen" (mehr/andere Bilder)

| | |
|---|---|
| **Issue** | MARAA-20 — Website: mehr/andere Bilder einsetzen (Board-Auftrag aus MARAA-19) |
| **Auftraggeber** | Board-Antwort MARAA-19 (Interaktion `606ea587`, Option `site_bilder`) — „Website: mehr/andere Bilder allgemein" |
| **Umbrella** | MARAA-15 („Professionaliser"), Design **D1** (MARAA-16), Umsetzung **F1** (MARAA-18) |
| **Rolle** | Frontend Developer (PixelForge Studio) |
| **Datum** | 2026-10-14 |
| **Grenze** | Keine neuen Design-Entscheidungen, keine neuen Bilder, keine Content-Texte geändert, keine neue Abhängigkeit, DSGVO/Consent-Mechanik unangetastet. |

## 1. Befund — die Lücke war spezifiziert, aber nicht gebaut

Der Designer hat in **D1 (MARAA-16)** eine Galerie-Sektion bereits entschieden und
gerendert; **F1 (MARAA-18)** hat die Komponente gebaut, aber **nie auf einer Seite
eingebunden**. Folge: die Sektion fehlt im Produktionscode ganz, und die beiden Bilder
`foto9` und `foto10` kommen im gesamten Auftritt **nirgends** vor.

| Design-Artefakt | Inhalt |
|---|---|
| `docs/design/konzept.md` **§5 Bildsprache** | Bildposition „Galerie": `foto3, 6, 7, 8, 9, 10, 11`, gemischt 1:1 / 4:3, AVIF/WebP, `lazy` |
| `docs/design/komponenten.md` **§7 / §19.4** | Galerie als Card/Bento-Raster: **eine** große Zelle (2×2 ab `lg`) + gleich große Nachbarn; 1 Spalte mobil → 2 ab `sm` → 3 ab `lg` |
| `docs/design/mockup/start.html` **Zielzustand** | Sektion `<!-- GALERIE: Bento -->` mit `foto9` (groß, dekorativ) + `foto10` + `foto7` + `foto6` |
| `docs/design/start-light.jpg` (Beleg D1) | Zielzustand-Render der Startseite **mit** Galerie-Bento |
| Produktionscode (vorher) | `GalleryGrid.astro` existiert, wird aber **von keiner Seite importiert**; `foto9`/`foto10` ungenutzt |

`foto10` war zusätzlich in `content/leistungen-fassaden.md` als „ergänzend" geführt, aber
nicht eingebaut. Diese Umsetzung schließt die Lücke **nach der vorliegenden Spezifikation**
— sie erfindet keine Platzierung.

## 2. Umsetzung (kein neues Design)

- **`src/pages/index.astro`** bindet `GalleryGrid` als Sektion „Flächen ansehen" ein —
  **an der Stelle des Zielzustands**: direkt nach dem Leistungs-Bento, vor „So arbeite ich".
  Bilder und Reihenfolge **exakt** wie `docs/design/mockup/start.html`:
  `foto9` (groß, dekorativ), `foto10`, `foto7`, `foto6`.
- **`src/components/GalleryGrid.astro`** erhält die optionale Eigenschaft
  `decorative?: boolean`. Für dekorative Bilder wird zusätzlich zum vorhandenen
  `alt=""` das Bild aus dem Baum der Hilfstechnologien genommen (`aria-hidden="true"`,
  komponenten.md §7 „Deko-Bilder `alt=""` + `aria-hidden`"). Der KI-Vollform-Hinweis der
  Komponente bleibt unberührt — er ist ein eigener sichtbarer Absatz (ADR 0002 §5.1.1).
- **Alt-Texte unverändert** aus `src/lib/images.ts` / `content/start.md`; keine
  Referenzbehauptung, keine Projektzuordnung. `foto9` bleibt dekorativ.
- **KI-Hinweis:** die Galerie-Sektion trägt die **Vollform** aus `KiBildHinweis`
  (selbes Landmark wie die Bildliste) — gemessen `1` Vollform-Absatz in der Sektion.
- **Provenienz:** `foto9`/`foto10` stehen bereits in `content/bild-provenienz.json`
  (`herkunft: Alt-Auftritt`, `ki_generiert: true`, `offenlegung: true`). Keine Änderung nötig.

Keine neue Abhängigkeit, keine neuen Bilddateien, kein Hex-Literal, kein `!important`,
kein `any`.

## 3. Belege (Befehl → Ergebnis)

| Beleg | Kommando | Ergebnis |
|---|---|---|
| Lieferdefinition | `npm run verify` | **EXIT 0** — build ✓, `astro check` 0/0/0, eslint ✓, vitest **42/42** ✓ |
| E2E-Gates | `npm run test:e2e` | **EXIT 0** — **25/25** (a11y, consent, contact, ki-hinweis) |
| Marquee-Belege | `node tests/qa/maraa20-capture.mjs` | **EXIT 0** (s. u.) |

`docs/qa/evidence/maraa20/`:

| Datei | Aussage |
|---|---|
| `gallery.json` | Sektion „Flächen ansehen", **4** Items, **1** große Zelle (erste), **1** dekorativ (`aria-hidden`), `loading="lazy"` + `decoding="async"`, `width`/`height` je Bild, KI-Vollform **1** in der Sektion, **0** Dritt-Requests ohne Consent, Galerie-Transfer ≈ **393 KB** (Seite gesamt ≈ **439 KB**) |
| `overflow.json` | **0** Overflow — 11 Seiten × {360, 768, 1024, 1440} px |
| `a11y.json` | **0** serious/critical (axe) über alle 11 Seiten |
| `screens/start-{360,768,1024,1440}.png` | Vollseiten-Belege (**angesehen**) |
| `screens/galerie-{1024,1440}.png` | Bento-Raster der Galerie (**angesehen**) |

## 4. Abgabe-Checkliste (Frontend Developer)

- [x] `npm run build && npm run typecheck && npm run lint && npm test` (über `verify`, **EXIT 0**)
- [x] Screenshots 360 / 768 / 1024 / 1440 px, **angesehen** (Bento: 1 große + 3 Nachbarn; 360 px einspaltig)
- [x] Zustände: die Galerie ist **nicht interaktiv** (keine Links) → keine Hover/Focus/Active-Zustände;
      Karten-Zustände unverändert (komponenten.md §19.4: S1 ruhige Karte, S2 nur bei Ganz-Link)
- [x] Tastatur-Durchlauf: `test:e2e` grün (Skip-Link zuerst, Drawer, Dialog, Formular)
- [x] Kein Hex-Literal, kein `!important`, kein `any` im neuen Code (geprüft)
- [x] Kein horizontaler Overflow bei 360 px (`overflow.json`: 0)
- [x] Keine neue Abhängigkeit — **keine** neue Bilddatei, nur bereits vorhandene Assets
- [x] `prefers-reduced-motion` unberührt (keine neue Bewegung)
- [x] Nur semantische Tokens/CSS-Klassen im neuen Code (`.pf-gallery*`, `.pf-card`-Radien/Schatten)

## 5. Offene Punkte an Board/Designer (bewusst nicht geraten)

Diese Umsetzung deckt **nur** die bereits spezifizierte Galerie-Lücke. Weiterhin offen
(im Issue benannt, in der Interaktion gestellt):

1. **Weitere Bildstellen** jenseits der Galerie (`foto10` ist in
   `content/leistungen-fassaden.md` als „ergänzend" geführt, aber ohne Layout-Vorgabe) —
   Platzierung ist eine Design-Entscheidung.
2. **Woher neue Bilder** — echte Projektfotos (Kunde) vs. weitere KI-Bilder (dann ADR 0002:
   sichtbarer Hinweis + `content/bild-provenienz.json`). Es liegen keine neuen Quellen vor.
3. **Erneute QA-Verifikation** dieser Erweiterung (neues Issue, blockierend durch MARAA-20?).

## 6. Nebenbefund (behoben) — Lint-Regression aus MARAA-19

`npm run verify` war **vor** dieser Änderung rot: `tests/qa/maraa19-verify.mjs` (committed in
`abbb501`/`9bceed0`) enthielt die nie gelesene Konstante `KEY`, die `eslint .` als
`@typescript-eslint/no-unused-vars` mit **1 error** abbrach. Die tote Zeile wurde entfernt
(verhaltensneutral), damit die Lieferdefinition wieder EXIT 0 liefert.
