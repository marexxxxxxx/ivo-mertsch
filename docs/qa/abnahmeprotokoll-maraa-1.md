# Abnahmeprotokoll — MARAA-6 (QA)

| | |
|---|---|
| **Issue** | MARAA-6 — QA: Abnahme A11y, DSGVO, Browser & Docker-Container |
| **Prüfobjekt** | Ivo-Mertsch-Relaunch (MARAA-1), Implementierung aus MARAA-5 |
| **Autor** | QA Engineer, PixelForge Studio |
| **Datum** | 2026-10-13 |
| **Geprüfter Stand** | Commit `0397479` (`main`), frisch gebaut mit `npm run build` |
| **Gesamturteil** | **Abnahme mit Mängeln** — 4 von 6 Prüfbereichen vollständig bestanden, 1 teilweise (WebKit), 1 nicht verifizierbar (Docker); zusätzlich 1 Ziel-Verfehlung (mobiler LCP) und offene Rechts-/Kundenpunkte vor Livegang |

> Grundsatz dieses Protokolls: Jeder „Pass" hat einen Beleg (JSON, Screenshot, Messwert,
> Netzwerkaufzeichnung). Nicht gerendert und angesehen = nicht verifiziert. Bei Zweifel
> wurde Fail gemeldet, nicht Pass.

---

## 1. Prüfumgebung

| | |
|---|---|
| Host | Agenten-Sandbox (Linux, geteilte CPU) |
| Node | v26.8.1 |
| Auslieferung | `node ./dist/server/entry.mjs` (Production-Build), `http://127.0.0.1:4321` |
| Playwright | 1.64.0 |
| Browser | Chromium (chromium-1248), Firefox 157.0; **WebKit nicht lauffähig** (fehlende Systembibliotheken, s. F-4) |
| Lighthouse | 13.5.0 (Chrome = Playwright-Chromium), mobiles Emulations-Throttling bzw. `--preset=desktop` |
| axe | axe-core 4.13.0 über `@axe-core/playwright`, Tags `wcag2a, wcag2aa, wcag21a, wcag21aa` |
| QA-Harness | `tests/qa/qa-run.mjs` (eigenständig, unabhängig vom Entwickler-E2E-Set) |

Ausgangslage: MARAA-5 ist `done` (Commit `0397479`). Der Docker-Build war bereits in
MARAA-5 umgebungsbedingt offen und ist es weiterhin (F-5).

---

## 2. Ergebnistabelle

| # | Kriterium (Quelle) | Status | Beleg |
|---|---|---|---|
| 1 | **Barrierefreiheit** — axe ohne serious/critical, Start + 4 Leistungsseiten + Kontakt + Rechtsseiten + 404 | **Pass** | `evidence/a11y.json` |
| 1a | Genau ein `<h1>` je Seite, Landmarks, `lang="de"` | **Pass** | `evidence/a11y.json` |
| 1b | Vollständiger Tastatur-Durchlauf (Skip-Link, Consent-Dialog-Fokusfalle, Mobile-Nav-Fokusfalle, Formular) | **Pass** | `evidence/keyboard.json` |
| 1c | `prefers-reduced-motion` (Dauer-Token → 1 ms) | **Pass** | `evidence/keyboard.json` |
| 1d | Touch-Targets ≥ 44 px (Projekt-Gate, `komponenten.md` §0.4/§14.3) | **Fail (leicht)** | `evidence/overflow.json` → F-1 |
| 1e | Touch-Targets ≥ 24 px (WCAG 2.2 AA 2.5.8) | **Fail** | `evidence/overflow.json` → F-2 |
| 2 | **DSGVO/Consent** — 0 Dritt-Requests + 0 Cookies vor Einwilligung | **Pass** | `evidence/consent.json` |
| 2a | Banner: Alle akzeptieren / Nur notwendige / Einstellungen; Ablehnen in 1 Klick; gleichwertige Größe | **Pass** | `evidence/consent.json` |
| 2b | Persistenz über Reload und Seitenwechsel | **Pass** | `evidence/consent.json` |
| 2c | Widerruf wirkt (Kategorien aus, Gate-Elemente aus dem DOM entfernt), Footer-Link vorhanden | **Pass** | `evidence/consent.json` |
| 2d | Policy-/Versionswechsel lässt Banner wiederkommen; korrupter Datensatz = keine stille Einwilligung | **Pass** | `evidence/consent.json` |
| 2e | Optionale Kategorien nicht vorausgewählt | **Pass** | `evidence/consent.json` |
| 3 | **Google-Bewertungen** — Attribution sichtbar (Inhaltszustand), statischer Pfad rendert | **Pass** | `evidence/screens/bewertungen-filled-1280.jpg` |
| 3a | Leerzustand plausibel, keine erfundenen Bewertungen (Abgleich Datenquelle) | **Pass** | `evidence/reviews.json` |
| 3b | Gate-Engine: Google-Avatar erst nach Zustimmung, vorher Initialen, 0 Dritt-Requests | **Pass** | (Filled-Build, s. §5) |
| 4 | **Performance** — Lighthouse Performance ≥ 95 (mobil + desktop) | **Pass** | `evidence/lighthouse-mobil.json`, `lighthouse-desktop.json` |
| 4a | LCP ≤ 2,0 s (ADR §7.1 Ziel) | **Fail (mobil)** | `evidence/lighthouse-mobil*.json` → F-3 |
| 4b | CLS ≤ 0,1 · TBT ≤ 200 ms | **Pass** | `evidence/lighthouse-mobil.json`, `lighthouse-desktop.json` |
| 5 | **Browser-Matrix** — Chromium Desktop, Chromium Mobil, Firefox: Navigation, Consent, Formular, Mobile-Nav | **Pass** | `evidence/browser-matrix.json` |
| 5a | WebKit/Safari | **Nicht verifizierbar** | F-4 |
| 6 | **Docker** — `docker build`, `docker run`, Healthcheck, Seite aus Container, keine Artefakte/Secrets, Image-Größe | **Nicht verifizierbar** | F-5 |
| 7 | **Abnahmeprotokoll** (dieses Dokument) + Belege | **Pass** | `docs/qa/abnahmeprotokoll-maraa-1.md`, `docs/qa/evidence/` |

Legende: **Pass** = verifiziert mit Beleg · **Fail** = Kriterium nicht erfüllt (mit Beleg) ·
**Nicht verifizierbar** = Prüfung in dieser Umgebung technisch nicht möglich (Lücke dokumentiert).

Zusätzlich wurden die projekteigenen Gates gegengeprüft und bestätigt:
`npm test` **42/42**, `npm run contracts` **14/14**, `npx playwright test` **19/19** (Chromium).

---

## 3. Befunde (Mängel, priorisiert)

### F-1 — Touch-Targets unter dem Projekt-Gate von 44 px — *leicht*
- **Befund:** Mehrere interaktive Ziele sind kleiner als die im eigenen Design verbindlich
  gesetzten 44 × 44 px (`komponenten.md` §0.4 „Jedes interaktive Ziel ist ≥ 44 × 44 px",
  §14.3, Milestone I3):
  - `.pf-header__brand` (Logo/Wortmarke): **169 × 40 px** — auf allen Seiten.
  - Breadcrumb-Link „Start": **37 × 40 px** — auf Unterseiten.
  - Checkbox `#contact-einwilligung`: **24 × 24 px** (Label vergrößert die Klickfläche,
    der native Input selbst bleibt 24 px) — `/kontakt/`.
- **Beleg:** `docs/qa/evidence/overflow.json` → `touchTargetsUnder44`.
- **Erwartet:** Jedes interaktive Ziel ≥ 44 × 44 px (Projekt-Spec), z. B. via
  `min-height: var(--pf-touch-target)` bzw. `::before`-Overlay.
- **Einordnung:** **Kein** WCAG-2.1-AA-Verstoß (2.5.5/2.5.8 sind 2.2/AAA). Verstoß gegen
  die eigene, messbare Spec.

### F-2 — Consent-Banner-Links unter 24 px — *mittel*
- **Befund:** Die Links „Datenschutzerklärung" (135 × 20 px) und „Impressum" (67 × 20 px)
  im Erstbanner sind 20 px hoch. Sie stehen als eigenständige Flex-Items (keine Inline-Links
  im Satz), daher greift die Inline-Ausnahme **nicht**.
- **Beleg:** `docs/qa/evidence/overflow.json` → `touchTargetsUnder24`.
- **Erwartet:** Mindestens 24 × 24 px (WCAG 2.2 AA, 2.5.8 Target Size Minimum) — besser
  44 px gemäß Projekt-Gate. Vorschlag: vertikales Padding im Banner-Linkblock.

### F-3 — Mobiler LCP über dem Zielwert — *mittel, nicht blockierend*
- **Befund:** Lighthouse mobil (3 Messungen, Startseite):
  LCP **2,3 s / 2,1 s / 2,3 s**, Performance **97 / 98 / 97**.
  Ziel ADR §7.1: **LCP ≤ 2,0 s**; Blocker-Schwelle: > 2,5 s. Desktop: LCP **0,5 s**, Perf **100**.
- **Beleg:** `docs/qa/evidence/lighthouse-mobil.json`, `lighthouse-mobil-run2.json`,
  `lighthouse-mobil-run3.json`, `lighthouse-desktop.json`.
- **Erwartet:** LCP ≤ 2,0 s mobil.
- **Einordnung:** Das Performance-Ziel (≥ 95) ist erfüllt; der LCP-**Zielwert** wird
  reproduzierbar knapp verfehlt, die **Blocker**-Schwelle (2,5 s) nicht. Die Zerlegung ist
  unkritisch (TBT 0 ms, CLS 0). Ursache ist in dieser geteilten Sandbox nicht sicher von
  Umgebungsvarianz zu trennen; eine Messung auf Produktions-Hardware bzw. über RUM ist zur
  endgültigen Klärung nötig. **Keine Rückgabe an MARAA-5** ohne Produktionsmessung.

### F-4 — WebKit/Safari nicht prüfbar — *Lücke*
- **Befund:** WebKit (Playwright `webkit-2370`) lässt sich nicht starten; es fehlen
  Systembibliotheken (u. a. `libgtk-4.so.1`, `libgraphene-1.0.so.0`, `libsoup-3.0.so.0`,
  GStreamer-Bibliotheken). Ohne Root/`apt` nicht nachinstallierbar (`sudo -n` schlägt fehl).
- **Konsequenz:** Die Safari-Säule der Browser-Matrix (Kriterium §5) ist **offen**.
  Chromium (Desktop + Mobil) und Firefox sind vollständig geprüft und bestehen.

### F-5 — Docker-Abnahme nicht ausführbar — *Blocker (umgebungsbedingt)*
- **Befund:** `docker build`/`docker run` scheitern reproduzierbar:
  `permission denied while trying to connect to the docker API at unix:///var/run/docker.sock`.
  Socket gehört `root:docker` (660); ausführender Nutzer ist nicht in der Gruppe `docker`,
  kein passwortloses `sudo`. Keine Alternativ-Runtime (`podman`, `buildah`, `nerdctl`,
  `kaniko`) vorhanden.
- **Beleg:** Ausgabe in diesem Lauf (identisch zu MARAA-5); `.dockerignore`, `Dockerfile`.
- **Was statisch geprüft werden konnte (kein Ersatz für den Build):**
  - `.dockerignore` schließt `node_modules`, `dist`, `.cache`, `.env*` (außer `.env.example`),
    `*.pem`, `*.key`, `secrets.*`, `.git`, `tests` aus.
  - Die Runtime-Stage kopiert nur `node_modules` (prod), `dist` und `package.json` — kein
    Quellcode, keine Tests, keine `.env`. Non-Root (`node`), genau ein `CMD`, `HEALTHCHECK`
    gegen `/api/healthz`.
  - `.env.example` enthält **nur leere Schlüssel**, keine Secrets.
- **Erwartet/Unblock:** `docker build -t ivo-mertsch:1.0.0 .` + `docker run` in einer Umgebung
  mit Docker-Zugriff; Healthcheck-Status, Ausgabe „Seite aus dem Container" und Image-Größe
  nachreichen. **Owner/Action:** Umgebung mit Docker-Zugriff bereitstellen (Agent in die
  `docker`-Gruppe aufnehmen oder Docker-Endpunkt) — **CEO/Infrastruktur**.
  Nachverfolgung: **MARAA-7** (Follow-up zu MARAA-6).
- **Konsequenz:** Das Goal-Kriterium „fertiger Docker-Container" ist damit **nicht abgenommen**.

### F-6 — Rechtsseiten sind Entwürfe (Livegang-Sperre) — *kritisch für Livegang*
- **Befund:** Impressum und Datenschutzerklärung tragen einen ausdrücklichen Prüfvermerk
  („Ohne diese Freigabe darf die Seite nicht öffentlich erreichbar sein") und offene Punkte
  (OP-1 … OP-13, u. a. Verantwortlicher OP-3, USt-IdNr. OP-4, Bildrechte OP-6, Hosting).
- **Technische Übereinstimmung (geprüft, nicht rechtlich bewertet):** Die Datenschutzerklärung
  beschreibt die **tatsächlich implementierte** Architektur korrekt — keine Cookies, keine
  Drittanbieter vor Einwilligung, Speicherung nur lokal unter `pixelforge.consent.v1`,
  selbst gehostete Schriften, Kontaktformular-Felder, Avatar-Gate, Instagram nur als Link,
  Leerzustand ohne Attribution. Es wurden **keine** erfundenen Angaben gefunden.
- **Erwartet:** Anwaltliche Freigabe der Rechtstexte und Klärung der offenen Kundenpunkte
  **vor** Livegang. Kein Release ohne diese Freigabe.

### OP-A — CTA „Jetzt bei Google bewerten" ohne Ziel nicht sichtbar — *Konfiguration*
- **Befund:** Ohne `GOOGLE_REVIEW_URL` bleibt der CTA ausgeblendet (kein toter Link) und es
  wird keine Attribution gezeigt (kein Google-Inhalt). Mit gesetztem Wert erscheint der CTA
  korrekt (verifiziert, s. §5).
- **Erwartet:** Vor Livegang `GOOGLE_REVIEW_URL` (und für Quelle B `GOOGLE_PLACE_ID`/`GOOGLE_PLACES_API_KEY`)
  setzen — abhängig von OP-2/OP-11.

---

## 4. Bestandene Prüfungen — Kurznachweis

- **A11y:** axe auf 11 Inhaltsseiten + 404: **0 Verstöße** (nicht nur 0 serious/critical —
  vollständig 0). Genau ein `<h1>`, je ein `header`/`main#hauptinhalt`/`footer`, `lang="de"`.
- **Tastatur:** Skip-Link ist der erste Fokuspunkt und springt zu `#hauptinhalt`; die
  Fokusfalle des Consent-Dialogs hält den Fokus über 25 Tab-Drücke; Escape schließt und gibt
  den Fokus zurück; die Mobile-Nav-Fokusfalle hält über 20 Tab-Drücke; alle fünf Formularfelder
  sind per Tab erreichbar und mit sichtbaren Labels verknüpft.
- **Reduced-Motion:** `--pf-duration-fast` = `1ms`, berechnete `transition-duration` = `0.001s`.
- **Overflow:** 0 horizontaler Overflow auf `/`, `/kontakt/`, `/bewertungen/`, `/leistungen/`
  bei 360 / 768 / 1024 / 1440 px.
- **DSGVO/Consent:** frischer Kontext → **0 Dritt-Requests**, **0 Cookies**, **kein**
  Consent-Key vor Einwilligung; „Nur notwendige" entfernt das Banner in **einem** Klick und
  setzt **keine** Dritt-Requests; „Alle akzeptieren" und „Nur notwendige" sind **exakt
  gleich groß** (216 × 45,19 px, gleiche Schriftgröße); Persistenz über Reload/Seitenwechsel;
  Widerruf über den Footer-Link setzt die Kategorien zurück und entfernt Gate-Elemente;
  Version 2 eines Datensatzes und ein korrupter Wert lassen das Banner wiederkommen.
- **Bewertungen:** Leerzustand zeigt 0 Karten und 0 Sterne (keine Erfindung); `/api/reviews`
  liefert 200 mit leerer Liste. Filled-Build aus dem Schema-Beispiel (keine echten Daten):
  2 Karten, Attribution **„Bewertungen von Google Maps"**, korrekte Sterne-`aria-label`;
  Google-Avatar liegt als inertes `<template>` vor → **0 Dritt-Requests vor Zustimmung**,
  Initialen sichtbar; nach Freigabe „Externe Medien" wird das `<img>` erzeugt und erst dann
  der Google-Request ausgelöst.
- **Browser-Matrix:** Chromium Desktop, Chromium Mobil (Pixel-5-Viewport), Firefox — jeweils
  Start → Consent ablehnen → Navigation → Kontakt → Formular-Validierungsfehler →
  erfolgreicher Submit-Zustand (mailto-Fallback, „Ihr E-Mail-Programm öffnet sich …").
  Keine unerwarteten Console-Fehler (der beobachtete 503 stammt erwartungsgemäß aus dem
  `mail_not_configured`-Zweig des Kontakt-Endpunkts; der 404 aus dem 404-Test).
- **Projekt-Gates:** `npm test` 42/42, `npm run contracts` 14/14, `npx playwright test` 19/19.

---

## 5. Filled-Review-Build (Beweis des statischen Pfads)

Der ausgelieferte Stand hat `content/reviews.json` = leer (ehrlicher Leerzustand). Um den
**Inhaltszustand** zu prüfen, wurde in einer temporären Kopie (`/tmp/opencode/qa-filled`)
`content/reviews.json` mit den Schema-**Beispielwerten** (keine echten Bewertungen) befüllt,
gebaut und auf Port 4322 gestartet. Ergebnis (siehe `docs/qa/evidence/screens/bewertungen-filled-1280.jpg`):

- 2 Bewertungskarten, Attribution „Bewertungen von Google Maps" (`translate="no"`),
  Sortierhinweis, Sterne-`aria-label` („5 von 5 Sternen", „4 von 5 Sternen").
- 1 Consent-Gate-Template (Google-Avatar); vor Zustimmung 0 `<img>`, Initialen „BA"/„BB",
  **0 Cross-Origin-Requests**; nach Freigabe „Externe Medien" wird das `<img>` erzeugt und
  der `lh3.googleusercontent.com`-Request ausgelöst.

---

## 6. Belegverzeichnis

```
docs/qa/abnahmeprotokoll-maraa-1.md      dieses Protokoll
tests/qa/qa-run.mjs                      QA-Harness (Sections a11y/keyboard/consent/reviews/overflow/browser/screens)
docs/qa/evidence/a11y.json               axe-Ergebnisse 12 Seiten + h1/Landmarks/lang/Console
docs/qa/evidence/keyboard.json           Skip-Link, Dialog-/Drawer-Fokusfalle, Formular, reduced-motion
docs/qa/evidence/consent.json            Netzwerk/Cookies/localStorage, Banner-Aktionen, Persistenz, Widerruf, Version
docs/qa/evidence/reviews.json            Leerzustand, API-Antwort, keine erfundenen Reviews
docs/qa/evidence/overflow.json           360/768/1024/1440 px + Touch-Target-Messungen
docs/qa/evidence/browser-matrix.json     Chromium Desktop/Mobil, Firefox — Kernflows
docs/qa/evidence/lighthouse-mobil.json   Lighthouse mobil (Lauf 1)
docs/qa/evidence/lighthouse-mobil-run2.json, -run3.json   Wiederholungen (Varianz)
docs/qa/evidence/lighthouse-desktop.json Lighthouse desktop
docs/qa/evidence/screens/*.jpg           Screenshots 360/768/1024/1440 (Home/Kontakt/Bewertungen) + Banner + Filled-Review
```

Reproduktion:
```bash
npm run build && node ./dist/server/entry.mjs &        # Port 4321
node tests/qa/qa-run.mjs a11y      # bzw. keyboard|consent|reviews|overflow|browser|screens
```

**Keine Secrets** in diesem Protokoll oder den Belegen: Es wurden ausschließlich öffentliche
Testdaten, Beispielwerte und Env-Variablennamen verwendet; keine API-Keys, keine Tokens,
keine realen Bewertungen.

---

## 7. Gesamturteil und offene Punkte

**Gesamturteil: Abnahme mit Mängeln.**

Vollständig bestanden: Barrierefreiheit (axe/Tastatur/Landmarks/reduced-motion), DSGVO/Consent
(der wichtigste Einzeltest: **0 Requests vor Zustimmung**), Google-Bewertungen (beide Zustände,
keine Erfindung, Gate wirkt), Performance-Ziel (≥ 95) sowie die Browser-Säulen Chromium und
Firefox. Offen bzw. mangelhaft:

| Priorität | Punkt | Owner |
|---|---|---|
| **Blocker** | F-5 Docker-Build/-Run/-Healthcheck/-Größe nicht verifizierbar → Goal-Kriterium „fertiger Docker-Container" nicht abgenommen (Follow-up **MARAA-7**) | Umgebung mit Docker-Zugriff (CEO/Infrastruktur) |
| **Kritisch (Livegang)** | F-6 Rechtstexte ohne anwaltliche Freigabe; offene Kundenpunkte OP-1…OP-13 | Kunde + CEO |
| **Mittel** | F-2 Banner-Links < 24 px (WCAG 2.2 AA 2.5.8) | Frontend Developer (MARAA-5) |
| **Mittel** | F-3 Mobiler LCP 2,1–2,3 s > Ziel 2,0 s (unter Blocker 2,5 s) | Produktionsmessung; ggf. MARAA-5 |
| **Leicht** | F-1 Touch-Targets < 44 px (Projekt-Gate) | Frontend Developer (MARAA-5) |
| **Lücke** | F-4 WebKit/Safari nicht prüfbar (fehlende Libs) | QA-Umgebung |
| **Konfiguration** | OP-A `GOOGLE_REVIEW_URL`/`GOOGLE_PLACE_ID` setzen | CEO/Kunde |

**Empfehlung:** F-2 und F-1 als kleine Fixes an MARAA-5 zurückgeben (beide betreffen nur
Padding/min-height). F-5 und F-4 erfordern Umgebungszugriff und sind keine Code-Mängel.
Ein **Go-live** ist erst nach F-6 (Rechtsfreigabe) und F-5 (verifizierter Container) möglich.
