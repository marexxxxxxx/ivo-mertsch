# Ivo Mertsch — Relaunch (MARAA-1)

Relaunch von <https://ivo-mertsch.de/> für Ivo Mertsch, „Handwerk aus Leidenschaft",
Schwoerstadt (Baden).

**Abnahmeziel:** Lighthouse Performance ≥ 95, WCAG 2.1 AA, Auslieferung als **ein**
Docker-Container.

---

## Für wen ist was verbindlich

| Rolle | Lies zuerst |
|---|---|
| **MARAA-5 Frontend Developer** | `docs/adr/0001-stack-und-consent-architektur.md` — Abschnitte 3, 4, 5, 6, 8, 11 |
| **MARAA-3 Content** | Abschnitte 5.4, 10.3, 11.2 |
| **MARAA-4 Designer** | Abschnitte 7, 11.2 — Token-Werte legst du fest, ich ratifiziere sie |
| **MARAA-6 QA** | Abschnitt 9.2 — die Gate-Tabelle mit Exit-Codes |

## Verbindliche Contracts

| Datei | Inhalt |
|---|---|
| `docs/adr/0001-stack-und-consent-architektur.md` | Stack, Rendering, Consent, Reviews, Budgets, Kontaktformular, Docker, Repo-Struktur |
| `docs/contracts/reviews.schema.json` | Datenkontrakt einer Bewertung + Bewertungs-Dokument |
| `docs/contracts/consent.schema.json` | Datenvertrag des Consent-Datensatzes (`localStorage`) |
| `docs/contracts/reviews.example.json` | Fixtures inkl. Negativfällen |
| `tests/contracts/verify-contracts.cjs` | Prüftor: validiert die Schemas und alle Fixtures |
| `docs/design/konzept.md` | Design-Richtung, Farbwelt, Typografie, Bildsprache, 30 Prüfpunkte (MARAA-4) |
| `docs/design/tokens.json` | Kanonische Design-Tokens inkl. berechnetem Kontrast-Audit (MARAA-4) |
| `docs/design/komponenten.md` | Komponenten-Spezifikation: Zustände, Props, A11y (MARAA-4) |

```bash
node tests/contracts/verify-contracts.cjs   # 14/14 bestanden, Exit 0
```

## Kurzfassung der Entscheidungen

1. **Astro, `output: 'server'`, pro Route `prerender`.** Alle Inhaltsseiten statisch,
   drei on-demand-Routen (`/api/healthz`, `/api/contact`, `/api/reviews`). Genau ein Node-Prozess.
2. **Consent in `localStorage`**, Schlüssel `pixelforge.consent.v1`, drei Kategorien. Vor Consent
   **null** Cross-Origin-Requests — maschinell geprüft, nicht behauptet.
3. **Ein Normalformat, zwei Quellen.** `content/reviews.json` (Default) und Google-Places-Proxy mit
   Cache + Env-Key-Fallback. Beide erzeugen dasselbe HTML. Kein Korpus ⇒ ehrlicher Leerzustand plus
   CTA, **keine erfundenen Bewertungen**.
4. **Budgets**: LCP ≤ 2,0 s · CLS ≤ 0,1 · INP ≤ 200 ms · JS first load ≤ 60 KB gzip ·
   LH Perf ≥ 95 · LH A11y ≥ 95. Überschreitung ist ein Blocker.
5. **Kein Google Fonts, kein Captcha, kein CDN.** Fonts selbst gehostet, Spam-Schutz lokal.

## Offene Punkte (CEO, siehe ADR Abschnitt 10)

- Attribution „Quelle: Google" vs. die von Google für neue Implementierungen geforderte
  „Google Maps"-Attribution
- Kosten-/EEA-Klärung Places-API: Quelle B aktivieren oder nur statischer Pfad
- Korrekte Kunden-E-Mail-Adresse (der Alt-Auftritt nennt drei verschiedene)
- Statistik-Kategorie ist reserviert, aber ohne Werkzeug

## Noch nicht gebaut

Nichts — die Anwendung ist implementiert (MARAA-5). Die Gates aus ADR Abschnitt 9.2
sind mit den Befehlen unten reproduzierbar.

---

## Entwicklung

Voraussetzungen: Node ≥ 22.12, npm. Kein globaler pnpm/Toolchain-Zwang.

```bash
npm ci                 # Abhängigkeiten installieren
npm run dev            # Dev-Server auf http://localhost:4321
npm run build          # Produktions-Build nach dist/ (führt prebuild aus)
npm run preview        # Build lokal ansehen
npm run start          # Node-Server aus dist/server/entry.mjs
```

### Gates (ADR §9.2)

```bash
npm run contracts      # Schema-Prüftor der Contracts (14/14, Exit 0)
npm run typecheck      # astro check — 0 Fehler
npm run lint           # ESLint — 0 Fehler
npm test               # Vitest — Consent, normalize(), Kontakt, Rate-Limit
npm run build && npm run typecheck && npm run lint && npm test
npm run test:e2e       # Playwright: Consent, Kontakt, A11y (baut selbst)
```

`npm run build` validiert zuerst `content/reviews.json` gegen
`docs/contracts/reviews.schema.json` (`scripts/validate-content.mjs`). Ungültiger
Kundencontent bricht den Build ab, statt still falsche Daten auszuliefern.

### Ordnerstruktur

```
src/
├─ components/    UI-Bausteine (Hero, ServiceCard, ReviewSection, Consent*, ContactForm, …)
├─ layouts/       BaseLayout, ServiceDetailLayout
├─ lib/           consent.ts, reviews.ts, reviews.server.ts, contact.ts, mail.server.ts, content.ts
├─ pages/         Astro-Routen (prerender = true) + api/ (on-demand)
├─ scripts/       Client-Module (consent-client, contact-client, reviews-client)
├─ styles/        global.css, fonts.css
└─ assets/img/    Originalbilder (werden zu AVIF/WebP + srcset optimiert)
content/          vom Kunden pflegbar (site.json, reviews.json)
```

**Token-Disziplin.** Komponenten verwenden ausschließlich die semantische
Token-Schicht. Kein Hex-Literal, keine freien Abstände. `docs/design/tokens.css`
wird aus `docs/design/tokens.json` generiert und ist nicht editierbar
(`python3 tools/build-tokens.py`).

**Review-Blocker, die eingehalten sind:** kein `process.env` in einer
`prerender = true`-Route (Laufzeitwerte nur über die `api/`-Routen), und keine
Token-Verstöße in Komponenten.

---

## Betrieb

Ein Image, ein Prozess (ADR §8.1). Multi-Stage, Non-Root, Healthcheck.

```bash
# Build
docker build -t ivo-mertsch:1.0.0 .

# Abnahmeartefakt 1 — ohne Google-Bewertungen (Default, Leerzustand + mailto)
docker run --rm -p 8080:4321 ivo-mertsch:1.0.0
# → http://localhost:8080

# Abnahmeartefakt 2 — mit Google-Bewertungen (Key nur zur Laufzeit)
docker run --rm -p 8080:4321 \
  -e REVIEWS_SOURCE=places_api \
  -e GOOGLE_PLACES_API_KEY='<zur-Laufzeit-injiziert>' \
  -e GOOGLE_PLACE_ID='<place-id>' \
  -e GOOGLE_REVIEW_URL='<google-maps-eintrag>' \
  -v ivo-reviews-cache:/app/.cache \
  ivo-mertsch:1.0.0

# Abnahmeartefakt 3 — mit Kontaktformular-Versand
docker run --rm -p 8080:4321 \
  -e SMTP_HOST='smtp.example.org' -e SMTP_PORT=587 \
  -e SMTP_USER='<benutzer>' -e SMTP_PASS='<zur-Laufzeit-injiziert>' \
  -e MAIL_TO='<kunden-mail>' \
  ivo-mertsch:1.0.0

# Healthcheck
docker inspect --format '{{.State.Health.Status}}' <container>
curl -s http://localhost:8080/api/healthz
```

### Umgebungsvariablen

Vollständig dokumentiert in `.env.example` (nur Namen, keine Werte) und in ADR §8.4.
Kurz: `PORT` (4321), `HOST` (0.0.0.0), `REVIEWS_SOURCE` (`static_export`),
`GOOGLE_PLACES_API_KEY` (**geheim, nur Laufzeit**), `GOOGLE_PLACE_ID`,
`GOOGLE_REVIEW_URL`, `REVIEWS_CACHE_TTL_S` (max. 2592000), `REVIEWS_CACHE_DIR`,
`SMTP_*` (**geheim**), `MAIL_TO`, `CONTACT_*`, `TRUST_PROXY`.

**Secrets** werden nie gebacken: kein `ARG` im Dockerfile, kein Wert im Repo, im
Issue, im Kommentar oder im Log. `.env` ist in `.gitignore` und `.dockerignore`.

### Bekannte Einschränkungen

- **Vorgerenderte Seiten lesen keine Laufzeit-Env.** Der CTA „Jetzt bei Google
  bewerten" wird deshalb clientseitig über den Header `X-Google-Review-Url` aus
  `GET /api/reviews` nachgerüstet (same-origin). Fehlt der Wert, bleibt der CTA
  ausgeblendet.
- **Bewertungsliste** wird zur Build-Zeit aus `content/reviews.json` (Quelle A)
  gerendert. Quelle B (Places) steht vollständig über `GET /api/reviews` bereit
  (Cache + Normalisierung); für die vorgerenderte Seite ist der statische Export
  der unterstützte Pfad.
- **Kontaktformular ohne JavaScript** sendet als nativer POST; ohne SMTP-Config
  liefert der Server dann eine HTML-Seite mit mailto-Link. Der mailto-Fallback mit
  JavaScript ist der primäre Weg.
- **Rechtsseiten** sind Entwürfe mit Prüfvermerk (OP-4/OP-5) und dürfen erst nach
  anwaltlicher Freigabe live gehen.

