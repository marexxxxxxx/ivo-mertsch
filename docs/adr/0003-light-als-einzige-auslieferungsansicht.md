# ADR 0003 — Light als einzige Auslieferungsansicht (Auto-Dark entfernen)

| | |
|---|---|
| **Status** | Akzeptiert (verbindlich für MARAA-18 Frontend, MARAA-19 QA) |
| **Datum** | 2026-10-14 |
| **Autor** | Lead Architect (PixelForge Studio), Issue MARAA-17 |
| **Kontext** | MARAA-15 — Professionalisierung (Nutzer-Briefing), CEO-Entscheidung **P1** |
| **Wirkt auf** | MARAA-18 (Frontend: Umsetzung Light-Pflicht), MARAA-19 (QA: Abnahme Light-Pflicht), MARAA-16 (Design: Token-Delta) |
| **Befund-Issue** | **MARAA-17** — „MARAA-15-A1 — Leitentscheidung: Light als einzige Auslieferungsansicht (Auto-Dark entfernen)" |
| **Quellen** | `docs/design/tokens.json`; `docs/design/tokens.css` §6 (Z. 418–464); `tools/build-tokens.py` §6 (Z. 347–365); `src/layouts/BaseLayout.astro`; `src/styles/global.css`; gebautes `dist/client/_astro/BaseLayout.C54cT-cW.css` |
| **Rollen** | Token-**Werte** legt der Designer fest (MARAA-16), diese ADR **ratifiziert**; die **Kodierung** der Theme-Policy ist Architektur-Entscheidung. Rollback siehe Abschnitt 8. |

---

## 1. Kontext & belegter Befund

Der Nutzer hat in MARAA-15 (CEO-Entscheidung **P1**) festgelegt: **Light ist die einzige
automatische Auslieferungsansicht.** Es gibt **keinen** Light/Dark-Umschalter; Dark ist kein
Auslieferungsziel mehr, darf aber als Token-Satz existieren.

Der gebaute Auftritt widerspricht P1 heute:

- `docs/design/tokens.css` §6 (Z. 418–464) enthält
  ```css
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { /* vollständiges Dark-Remap */ color-scheme: dark; }
  }
  :root { color-scheme: light; }
  ```
- Erzeugt wird dieser Block von `tools/build-tokens.py` §6 (Z. 347–365), **bedingungslos**.
- Das gebaute Artefakt trägt dieselbe Regel (verifiziert, Dateihash Stand Befund):
  ```
  dist/client/_astro/BaseLayout.C54cT-cW.css:
  @media (prefers-color-scheme:dark){:root:not([data-theme=light]){--pf-surface-page:#15120d; … color-scheme:dark}}
  ```
- Folge im Render (CEO, 2026-10-14, Chromium 1440 px): auf dark-konfigurierten Geräten
  `body background = #15120D`, Text `#FBFAF6` → nahezu schwarze Seite, obwohl Light der
  konzipierte Default ist.

**Ursache:** Die Policy „Light ist die Auslieferung" ist heute **nicht** im ausgelieferten
Artefakt kodiert, sondern nur eine Absicht, die eine CSS-Regel jederzeit überschreiben kann.
Die Regel ist system-getriggert (`prefers-color-scheme`), es genügt ein dark konfiguriertes
Betriebssystem – kein Nutzerwunsch, keine Auswahl.

---

## 2. Entscheidung

| # | Entscheidung | Gewählte Option | Status |
|---|---|---|---|
| **D1** | **Kodierung der Light-Pflicht** | **(a) Generator-Flag:** `tools/build-tokens.py` emittiert den Auto-Dark-Block **nur**, wenn `meta.colorScheme.autoDark` in `tokens.json` **`true`** ist. **Default ist `false`** (light-only). Der Block entfällt damit vollständig aus `tokens.css` und aus dem gebauten CSS. | **akzeptiert** |
| **D2** | Attribut-Ansatz (b) | **Verworfen.** `<html data-theme="light">` wird **nicht** gesetzt. | verworfen |
| **D3** | Dark-Tokens | **Bleiben** in `tokens.json` (`alias.dark`, `audit.darkMode`) und als expliziter `[data-theme="dark"]`-Block im CSS erhalten — aber **nur manuell** aktivierbar, **nicht** automatisch. | akzeptiert |
| **D4** | UI-Umschalter | **Keiner.** Kein Light/Dark-Schalter, kein Theme-Persistenz-Code (P1). | akzeptiert |
| **D5** | `:root { color-scheme: light; }` | **Bleibt** und wird zur **einzigen** `color-scheme`-Deklaration. Sie hält auch die native UA-Steuerung (Formularfelder, Scrollbars) auf dunkel konfigurierten Geräten hell. | akzeptiert |

**Genau eine Kodierung: (a).** „Beide" wäre keine Entscheidung und würde den Widerspruch
zwischen HTML und CSS wieder einführen.

---

## 3. Begründung — warum (a) und nicht (b)

1. **Die Policy muss im Artefakt halten, nicht im HTML.** Das gebaute `tokens.css` ist das,
   was ausgeliefert wird. Nur der Generator kann garantieren, dass dort **keine**
   Auto-Dark-Regel mehr steht. Option (b) lässt die Regel **im CSS lebendig** und hofft,
   dass jedes HTML-Dokument das Attribut setzt — die Regel würde bei der ersten Seite ohne
   `BaseLayout` (404/Fehlerseite, künftige Route, HTML-Export) genau den CEO-Befund
   wiederherstellen. Das ist ein latenter Rückfall, kein behobener Fehler.
2. **Single Source of Truth.** `build-tokens.py` erklärt `tokens.json` ausdrücklich zur
   „einzigen Wahrheit"; die Color-Scheme-Politik ist eine Entscheidung **auf Token-Ebene**
   und gehört dorthin, wo die Tokens definiert werden — nicht als unsichtbares Attribut in
   eine Astro-Layoutdatei.
3. **Prüfbar (Gate).** Nach der Umstellung gilt die Invariante:
   `grep -c 'prefers-color-scheme' docs/design/tokens.css` → **0** und
   `grep -c 'color-scheme: dark'` → **0**. Das ist ein automatiserbarer Abnahme-Gate für
   MARAA-19. Option (b) kann von keinem CSS-Check erfasst werden, weil das CSS unverändert
   bleibt.
4. **Passendes Beleg-Ziel.** Die Lieferdefinition verlangt
   `python3 tools/build-tokens.py --check` → Exit 0 „nach der Umstellung". Das ist eine
   **Konsistenz-Prüfung zwischen Generator und erzeugtem CSS**: sie greift genau dann, wenn
   der Generator geändert **und** `tokens.css` neu erzeugt wurde. Option (b) ändert den
   Generator nicht, `--check` bliebe unverändert 0 und würde **nichts** über die Entscheidung
   beweisen.
5. **Rollenreinheit.** Option (b) verlegt eine Theme-Policy in die App-Schicht (Frontend) –
   eine Design-System-Governance-Entscheidung, die hier ratifiziert wird. Option (a) hält die
   Theme-Policy im Token-System, wo Design (Werte) und Architektur (Kodierung) sauber getrennt
   bleiben.

**Verworfene Option (b) – konkrete Schwächen:** Correctness hängt dauerhaft von einem
HTML-Attribut ab; die Auto-Dark-Regel bleibt aktiv; kein messbarer Gate; widerspricht der
Token-Governance. Sie wird nicht umgesetzt.

---

## 4. Umsetzung für MARAA-18 (F1) — Datei, Stelle, erwartetes Ergebnis

> **Reihenfolge-Hinweis:** MARAA-16 (D1) bearbeitet `docs/design/tokens.json` **parallel**.
> Punkte 1–2 betreffen `tokens.json` und sind **nach** dem D1-Delta (oder auf D1s Stand
> rebased) einzuarbeiten, um Merge-Konflikte zu vermeiden. Punkt 3 (`tools/build-tokens.py`)
> ist D1-frei und kann sofort erfolgen.

### 4.1 `docs/design/tokens.json` — Meta-Flag sicherstellen
Erforderlich ist ein Schlüssel `meta.colorScheme.autoDark` mit dem Wert `false`.

> **Koordination mit D1 (MARAA-16):** D1 hat im in-flight Delta bereits einen
> `meta.colorScheme`-Block angelegt (u. a. `"autoDark": false`, `"uiToggle": false`).
> Falls dieser Block vorhanden ist: **keinen zweiten** `colorScheme`-Schlüssel anlegen,
> sondern nur bestätigen, dass `autoDark` exakt `false` ist. Fehlt der Block, so ergänzen:

```json
"colorScheme": {
  "autoDark": false,
  "_comment": "P1/ADR 0003: Light ist die einzige automatische Auslieferungsansicht. true nur nach dokumentierter ADR-Aenderung."
}
```

- **Erwartetes Ergebnis:** `meta.colorScheme.autoDark === false` ist der Default-Zustand.
- Zusätzliche Felder im `colorScheme`-Objekt sind zulässig und stören den Generator nicht.
- Das `_`-Präfix ist zulässig; `build_css()` liest `meta` nicht über `flatten()`, und
  `_`-präfixierte Schlüssel werden ohnehin ignoriert (verifiziert: Generator läuft Exit 0).

### 4.2 `tools/build-tokens.py` — §6 (aktuell Z. 347–365) ersetzen
Den bisher **bedingungslos** emittierten Auto-Dark-Block durch folgende Logik ersetzen
(dies ist der in MARAA-17 prototypisch verifizierte Code):

```python
    auto_dark = bool(data.get("meta", {}).get("colorScheme", {}).get("autoDark", False))
    if auto_dark:
        A("/* ---------- 6. Dunkelmodus per Systempraeferenz (opt-in) ------------------ */")
        A("/* Nur wenn meta.colorScheme.autoDark=true. Default ist false: Light ist die")
        A("   einzige automatische Auslieferungsansicht (P1, ADR 0003). */")
        A("@media (prefers-color-scheme: dark) {")
        A("  :root:not([data-theme=\"light\"]) {")
        for group, entries in iter_entries(data["alias"]["dark"]):
            if isinstance(entries, str):
                A(f"    --pf-{group}: {resolve(entries, data)};")
                continue
            for role, target in iter_entries(entries):
                if isinstance(target, dict):
                    continue
                A(f"    --pf-{group}-{role}: {resolve(target, data)};")
        A("    color-scheme: dark;")
        A("  }")
        A("}")
    else:
        A("/* ---------- 6. Kein Auto-Dark: Light ist die Auslieferungsansicht --------- */")
        A("/* P1 (ADR 0003): der Auftritt wird immer hell ausgeliefert. Der frueher hier")
        A("   erzeugte System-Dark-Block wird bewusst NICHT mehr emittiert; im erzeugten")
        A("   CSS steht keine einzige System-Farbpraeferenz-Regel mehr. Dark bleibt als")
        A("   vollstaendiges Remap unter [data-theme=\"dark\"] definiert (Abschnitt 2), wird")
        A("   aber nicht automatisch aktiviert. Die color-scheme-Deklaration unten (light)")
        A("   haelt auch die UA-Steuerelemente hell. */")
    A(":root { color-scheme: light; }")
```

- **Wichtig:** Der Kommentar im `else`-Zweig enthält die Zeichenfolge
  `prefers-color-scheme` **absichtlich nicht**, damit der Abnahme-Grep (Abschnitt 7/9) bei
  **0** Treffern steht.
- Die **explizite** `[data-theme="dark"]`-Sektion aus Abschnitt 2 (`build_css`, Theme-Loop)
  bleibt unangetastet — sie ist kein Auto-Dark.

### 4.3 `docs/design/tokens.css` neu erzeugen
`python3 tools/build-tokens.py` (schreibt `tokens.css` und führt den Audit aus).

### 4.4 Erwartetes Ergebnis (Invarianten nach der Umstellung)
| Prüfung | Erwartet |
|---|---|
| `grep -c 'prefers-color-scheme' docs/design/tokens.css` | **0** |
| `grep -c 'color-scheme: dark' docs/design/tokens.css` | **0** |
| `grep -c 'color-scheme: light' docs/design/tokens.css` | **1** |
| `grep -c '^\[data-theme="dark"\] {' docs/design/tokens.css` | **1** (Dormant-Remap bleibt) |
| `grep -c '^\.pf-invert {' docs/design/tokens.css` | **1** (unverändert) |
| `python3 tools/build-tokens.py --check` | **Exit 0** (Generator ↔ CSS synchron) |
| `python3 tools/build-tokens.py --audit` | **Exit 0** (Audit inkl. `darkMode` bestanden) |
| Gebautes `dist/…/BaseLayout.*.css` nach `npm run build` | **kein** `prefers-color-scheme` mehr |

**Für MARAA-19 (QA):** Der Gate ist `grep -c 'prefers-color-scheme'` == 0 auf dem gebauten
CSS **und** ein Render bei emuliertem `prefers-color-scheme: dark` (Chromium 1440 px), in dem
`body`-Hintergrund der Light-Wert bleibt (nicht `#15120D`).

---

## 5. Nebenwirkungen (geprüft und benannt)

| Element | Status | Begründung |
|---|---|---|
| `:root { color-scheme: light; }` (tokens.css Z. 464) | **bleibt, wird einzige** Deklaration | Hält UA-Steuerelemente (Inputs, Scrollbars) auch auf dark-OS hell — die eigentliche positive Mechanik der Light-Pflicht. Kein `color-scheme: dark` mehr im CSS. |
| `.pf-invert` (Footer, global.css Z. 67; Footer.astro Z. 16) | **unverändert** | Der dark Footer ist eine **explizite** Klasse, kein Auto-Dark. Er hängt nicht am Media-Query; `--pf-focus-ring-on-inverted` bleibt nötig und korrekt. Entfernen wäre ein Kontrastbruch. |
| `[data-theme="dark"] :focus-visible` (tokens.css Z. 476–479) | **bleibt, dormant** | Greift nur, wenn jemand `data-theme="dark"` **manuell** setzt (kein UI-Schalter, kein Auto-Trigger). Für den Footer gilt weiter das `.pf-invert :focus-visible`-Teil derselben Regel. |
| `audit.darkMode`-Block (tokens.json) | **bleibt gültig** | Die Dark-Alias-Tokens existieren weiter; der Block belegt weiterhin nachrechenbar, dass das **dormante** Dark-Remap WCAG erfüllt (Text ≥ 4.5, Non-Text ≥ 3.0). `--audit` bleibt Exit 0. Semantik: prüft das inaktive Remap, **nicht** die Auslieferung. |
| `[data-theme="light"]`-Selektor in Abschnitt 2 | **bleibt** | Teil des expliziten Light-Remaps; harmlos ohne Media-Query. Kein HTML-Attribut wird gesetzt (D2). |
| Inline-Consent-Snippet (`BaseLayout.astro`) | **unberührt** | Setzt `data-pf-consent`, nicht `data-theme`. |
| Content / Rechtsseiten | **unberührt** | Nicht Teil dieser ADR (Grenze des Auftrags). |

---

## 6. Konsistenz & Abgrenzung

- **ADR 0001** (`0001-stack-und-consent-architektur.md`) definiert A11y-Standard,
  `prefers-reduced-motion` und Lighthouse-Schwellen, **keine** Color-Scheme-Policy. Es besteht
  **kein Widerspruch**; ADR 0003 ist die erste verbindliche Festlegung der
  Auslieferungsansicht.
- **ADR 0002** (KI-Bilder-Transparenz) ist unberührt.
- **P1-Erhalt:** kein UI-Umschalter (D4); Dark-Tokens bleiben, werden aber nicht automatisch
  aktiv (D3). Das erfüllt den Auftrag „Dark-Tokens dürfen im Token-System bleiben, aber nicht
  automatisch aktiv werden" wörtlich.
- **Design-Treue:** Die Ratifikation bestätigt nur die Kodierung; die Token-**Werte** (u. a.
  der Light-Zielzustand aus dem D1-Delta) bleiben beim Designer (MARAA-16).
- **D1-Abstimmung:** Der Designer hat in seinem in-flight Delta bereits
  `meta.colorScheme.autoDark = false` (plus `uiToggle: false`) gesetzt und die Wahl der
  Kodierung ausdrücklich A1 überlassen. Diese ADR **ratifiziert** D1s Flag **und** entscheidet
  die Kodierung **(a)**; es entsteht kein Wertekonflikt, nur eine eindeutige Umsetzungsregel.

---

## 7. Konsequenzen

**Positiv**
- P1 ist im ausgelieferten Artefakt kodiert und **messbar** (Grep + Render-Gate).
- Kein latenter Auto-Dark-Rückfall über nachgelagerte Seiten ohne `BaseLayout`.
- `tokens.json` bleibt einzige Wahrheit; die Policy ist an einer Stelle dokumentiert und
  versionskontrolliert.

**Negativ / bewusst in Kauf genommen**
- Nutzer mit explizitem Wunsch nach Dark erhalten keinen Auto-Dark mehr. Gewollt (P1); Dark
  bleibt als Token-Satz für eine spätere, dann neu zu entscheidende Option.
- Soll Auto-Dark später doch gewünscht sein, ist es eine **neue** ADR + Flag-Flip, nicht ein
  Handgriff im CSS. Das ist beabsichtigt (Sichtbarkeit der Entscheidung).

---

## 8. Rollback

1. `meta.colorScheme.autoDark` in `docs/design/tokens.json` auf `true` setzen.
2. `python3 tools/build-tokens.py` ausführen (erzeugt §6-Auto-Dark wieder, `--check` → 0).
3. `npm run build` (dist neu erzeugen).
Rollback ist **eine Flag-Änderung + Regenerat**; kein Code-Diff. Erfordert einen neuen
ADR-Eintrag, weil er P1 widerruft.

---

## 9. Belege (MARAA-17)

Alle Belege wurden **prototypisch** in einer isolierten Kopie von `tools/` + `docs/design/`
erzeugt (kein Produktionscode im Repo, gemäß Auftrag — Umsetzung obliegt MARAA-18).

| Beleg | Kommando | Ergebnis |
|---|---|---|
| Baseline reproduziert den Befund | `python3 build-tokens.orig.py` → `diff` gegen `tokens.css` | identisch; Auto-Dark vorhanden; `--check` Exit **0** |
| Generator geändert (Flag=false) | `python3 build-tokens.py` | Exit **0** |
| Konsistenz-Gate | `python3 tools/build-tokens.py --check` | Exit **0** |
| Audit inkl. `darkMode` | `python3 tools/build-tokens.py --audit` | Exit **0** („AUDIT BESTANDEN") |
| Invariante „kein Auto-Dark" | `grep -c 'prefers-color-scheme' tokens.css` | **0** |
| Invariante „kein `color-scheme: dark`" | `grep -c 'color-scheme: dark' tokens.css` | **0** |
| Light-UA-Fixierung bleibt | `grep -c 'color-scheme: light' tokens.css` | **1** |
| Dormantes Dark-Remap bleibt | `grep -c '^\[data-theme="dark"\] {' tokens.css` | **1** |
| `.pf-invert` bleibt | `grep -c '^\.pf-invert {' tokens.css` | **1** |
| Flag ist der Schalter | `autoDark=true` setzen + regenerieren | Auto-Dark-Block kehrt zurück |
| Gebautes CSS trägt die Regel (Bestand) | `grep` in `dist/client/_astro/BaseLayout.C54cT-cW.css` | 1 Vorkommen `prefers-color-scheme:dark` → Befund bestätigt |

---

## 10. Nicht Teil dieser ADR

- Token-**Werte** und das Design-Delta (MARAA-16/Designer).
- Umsetzung im Repo (MARAA-18/F1).
- Abnahme (MARAA-19/QA).
- `dist/`-Neubau und Deployment.
