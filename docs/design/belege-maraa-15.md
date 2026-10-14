# Belege — Delta MARAA-15 (D1)

| | |
|---|---|
| **Issue** | MARAA-16 (D1) — Design-Delta Professionalisierung |
| **Datum** | 2026-10-14 |
| **Autor** | Designer, PixelForge Studio |
| **Tokens** | `docs/design/tokens.json` **v1.1.0** → generiert `docs/design/tokens.css` |

## 1. Audit (berechnet, nicht behauptet)

`docs/design/audit-maraa-15.txt` — vollständige Ausgabe von
`python3 tools/build-tokens.py --audit` **und** `--check`:

- **62 Kontrastpaare** (20 Text, 22 Non-Text, 20 Dark) — alle über dem Minimum
  (Text ≥ 4,5:1, Non-Text ≥ 3,0:1). `AUDIT BESTANDEN`, **Exit 0**.
- `--check`: `tokens.css ist aktuell`, **Exit 0**.
- Neu geprüft: die **Kartenfläche** `raised` (`neutral.0`) als realer Hintergrund —
  Kartentitel/-text 16,34:1, Sekundärtext 8,99:1, Meta 6,06:1, Link 9,74:1.

## 2. Zielzustand-Screens (hell, erzwungenes Dark-Schema)

Die folgenden Screens wurden mit **erzwungenem `prefers-color-scheme: dark`**
(Chromium, 1440 px) aufgenommen. Sie bleiben hell — damit ist **P1** (Light als einzige
automatische Auslieferungsansicht) belegt, nicht behauptet.

| Datei | Seite |
|---|---|
| `start-light.jpg` | Start — Hero (Bild rechts, CTA + Telefon), Leistungs-Bento, Galerie-Bento, CTA-Band mit der einen Naht, dunkler Footer |
| `leistungen-light.jpg` | Leistungen — asymmetrisches Bento (1 breite + 3 gleiche Karten) |
| `kontakt-light.jpg` | Kontakt — Kontaktwege + Formular-Karte (`--pf-radius-input` 12 px, `--pf-shadow-card`) |
| `bewertungen-light.jpg` | Bewertungen — ehrlicher Leerzustand als Karte (kein erfundener Korpus) |
| `a1-path-b-data-theme-light.jpg` | A1-Kompatibilität Weg (b): historische Auto-Dark-Regel + `<html data-theme="light">` bleibt hell |

**Quelle der Screens (Mock-Up, kein Produktionscode):** `docs/design/mockup/`
(`start.html`, `leistungen.html`, `kontakt.html`, `bewertungen.html`, `mockup.css`,
`capture.mjs`). Reproduktion aus dem Projekt-Wurzelverzeichnis:

```bash
node docs/design/mockup/capture.mjs
```

Inhalte der Mock-Ups stammen aus `content/start.md`, `content/kontakt.md`,
`content/micro-ux-consent.md`, `content/bewertungen.md`, `content/site.json` — **kein**
erfundener Text, **keine** erfundene Zahl, **keine** erfundene Bewertung.

## 3. A1-Kompatibilität (beide Kodierungswege)

| Weg | Mechanik | Beleg |
|---|---|---|
| **(a) Generator-Flag** | `meta.colorScheme.autoDark = false` → `tools/build-tokens.py` erzeugt **keinen** `@media (prefers-color-scheme: dark)`-Block. Dark nur über `[data-theme="dark"]`. | `tokens.css` §6 + die vier Zielzustand-Screens (erzwungenes Dark → hell) |
| **(b) Attribut** | `<html data-theme="light">`. Die historische Regel `:root:not([data-theme="light"])` hätte nie gegriffen. | `a1-path-b-data-theme-light.png` |

Beide Wege liefern dasselbe helle Ergebnis. **Kein** UI-Umschalter (P1). Dark-Tokens
bleiben vollständig spezifiziert (`alias.dark`), sind aber nur explizit erreichbar.

## 4. Was D1 geliefert hat — und was nicht

- **Geliefert:** `tokens.json` (Radius-Rollen 12–16 px, `--pf-shadow-card`, Display auf
  Sans, Dark-Link-Fix), generierte `tokens.css`, Delta in `konzept.md` §16 und
  `komponenten.md` §19, Belege (dieser Ordner).
- **Nicht geliefert (bleibt bei anderen):** Produktionscode/Seitenumsetzung → **F1
  (MARAA-18)**; die *technische* Kodierungsentscheidung von P1 + ADR 0003 → **A1
  (MARAA-17)**. D1 ist gegen **beide** A1-Wege getestet.
