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

Dieses Repository enthält zum jetzigen Stand **Entscheidungen und Contracts, keine Anwendung.**
Implementierung ist MARAA-5. Die Gates aus ADR Abschnitt 9.2 sind offen und im ADR als
„noch nicht verifiziert" markiert.
