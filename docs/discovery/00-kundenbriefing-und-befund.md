# Discovery: Ivo-Mertsch-Relaunch (MARAA-1)

_Status: v1 — CEO-Discovery am 2026-10-13, live abgerufene Quellen. Verbindliche Faktenlage fuer alle Teilaufgaben MARAA-2..MARAAR-6._

## 1. Kundenbriefing (woertlich, Quelle: Issue MARAA-1, Auftraggeber)

> erstelle mir eine webseite fuer diesen https://ivo-mertsch.de/. baue die webseite besser. fuege die google rezeisionen hinzu, und mache sie dsgvo konform mit cookibanner etc
> Arbeite das mit einer agency aus. ich will am schluss einen fertigen docker contianer haben

Interpretation (CEO, verbindlich fuer das Team):

1. **"eine webseite fuer diesen ..."** — Neubau/Ersatz des bestehenden Auftritts, Orientierung an Inhalten und Geschaeftsmodell der Alt-Seite.
2. **"baue die webseite besser"** — messbar better, nicht Geschmack: Lighthouse Performance >= 95, WCAG 2.1 AA / BITV-orientiert, Mobile-first, klarere Conversion-Pfade, bessere Ladezeiten, bessere Bildaufbereitung.
3. **"google rezeisionen hinzu"** — Sektion fuer Google-Bewertungen mit Attribution "Bewertungen von Google" (Details/Befund: Abschnitt 4).
4. **"dsgvo konform mit cookibanner etc"** — Consent-Management vor jeglicher Dritt-Ressource; keine Cookies vor Einwilligung; granulaten Kategorien; Widerruf; Rechtsseiten aktuell.
5. **"fertigen docker container"** — Abnahmeartefakt ist ein einzelner, dokumentierter Container: `docker build` + `docker run` + Healthcheck ohne externe Services.

## 2. Unternehmen (Quelle: https://ivo-mertsch.de/, live abgerufen 2026-10-13)

- **Name:** Ivo Mertsch — "Handwerk aus Leidenschaft"
- **Branche:** Handwerk: fugenlose Beschichtungen & Gebaeudeausbau
- **Adresse:** Niederdossenbach 1, 79739 Schwoerstadt, Deutschland (Region Baden, Landkreis Waldshut-Tiengen)
- **Kontakt:**
  - E-Mail: `info@ivo-mertsch.de` (mailto auf der Startseite) — ACHTUNG Konflikt: Footer zeigt `info@ivo-mertsch.com`, Kontaktseiten-Meta zeigt `ivomertsch@gmail.com`. **Offener Kundenpunkt OP-1.**
  - Telefon/WhatsApp: +49 174 2164071 (WhatsApp-Link wa.me/+491742164071)
  - Instagram: https://www.instagram.com/ivomertsch_hal/
- **Leistungen (Original-Auftritt):**
  1. **Fugenlose Baeder** — 2K-Beschichtung fuer Nassbereiche und Boeden; "exklusiv, fugenlos, hygienisch, einzigartig"
  2. **Fugenlose Boeden** — matt, seidenglaenzend, glaenzend; Innenraeume, Garagen, Balkone, Aussenbereich
  3. **Innenausbau** — Renovierung, Sanierung, Neubau, Modernisierung
  4. **Fassaden** — Neugestaltung mit/ohne Daemmung; Anstriche im Denkmalschutz oder langanhaltend schoene Fassaden
- **Positionierung (Originalsatz):** "Aus Leidenschaft wenn's ans Eingemachte geht. Dabei stehen wir Ihnen als starker Begleiter in Sachen Beratung, Planung und Abwicklung fuer Ihr Projekt zur Seite."

## 3. Alt-Auftritt (Quelle: live, 2026-10-13)

- WordPress; Seiten: `/`, `/kontakt/`, `/impressum/`, `/datenschutzerklaerung/`
- Cookie-Plugin: "Real Cookie Banner" 5.3.10 (Alt-Loesung; neue Loesung wird eigenstaendig implementiert)
- Logo: https://ivo-mertsch.de/wp-content/uploads/2025/09/logo_ivo.jpeg
- Originalbilder (wp-content/uploads/2025/07/): `foto3.png` (Hero/Team), `foto6.png` (Boeden), `foto7.png` (Fassaden), `foto8.png` (Baeder), `foto9.png`, `foto11.png` (Boeden/Detail)
- Thema/eigene Template-Info: nicht weiter erhoben — fuer Neubau irrelevant, Inhalte+Fakten sind uebernommen.

## 4. Google-Bewertungen — CEO-Befund (wichtig)

- Verzeichniseintraege existieren: "Ivo Mertsch Design" (golocal, 11880, aroundhome, cylex, infobel — Niederdossenbach 1, Schwoerstadt; Kategorien u. a. Bauunternehmen/Innenarchitekten)
- **Kein oeffentlich verifizierbarer Bewertungstext-Korpus:** golocal-Listing zeigt 0.0 Sterne / 0 Bewertungen (2026-10-13); Google Maps nur per JS/API erreichbar, ohne API-Key nicht auslesbar.
- **CEO-Entscheidung:** Keine Bewertungen erfinden. Umsetzung: datengetriebene Bewertungs-Sektion mit zwei Zustaenden:
  - (a) Bewertungen vorhanden — Quelle: statischer Export `/content/reviews.json` (Kunde pflegt ohne Code) ODER Places-API-Proxy mit Cache (Key per Env, dokumentiert); Consent-gating "Externe Medien"; Attribution "Bewertungen von Google".
  - (b) Keine Bewertungen verfuegbar/kein Key — ehrlicher Leerzustand + CTA "Jetzt bei Google bewerten".
- Datenkontrakt fuer Reviews: siehe `docs/contracts/reviews.schema.json` (aus MARAA-2).

## 5. Offene Kundenpunkte (OP)

- **OP-1:** korrekte E-Mail-Adresse bestaetigen (info@ivo-mertsch.de vs .com vs ivomertsch@gmail.com)
- **OP-2:** Google-Bewertungen: kann der Kunde seine Google-Bewertungen exportieren (Screenshots/Liste) oder einen Places-API-Schluessel bereitstellen? Solange nicht: Leerzustand (siehe 4).
- **OP-3:** Impressums-Pflichtangaben auf Vollstaendigkeit pruefen (USt-IdNr., Vertretungsberechtigter, ggf. Berufsbezeichnung/Kammer) — Alt-Impressum dient als Basis; finale Pruefung der Rechtsseiten durch Kundenanwalt vor Livegang (Abnahmekriterium).
- **OP-4:** Nutzungsrechte an den Originalbildern/Fotos fuer die neue Seite klaeren.

## 6. Ziel & Abnahme (Goal-Konsens, Company-Goal d26d4d38-140b-4c15-af8d-587b0b03aa17)

- Lighthouse Performance >= 95 (mobil, Kernseiten)
- WCAG 2.1 AA (BITV-orientiert), inkl. Kontrast, Tastatur, Fokus-States, reduced-motion
- DSGVO: keine Dritt-Ressourcen/Cookies vor Einwilligung; granulaten Consent; Widerruf
- Google-Bewertungen: Attribution + Leerzustand + Attributionsquelle korrekt
- Abnahmeartefakt: ein Docker-Container (Build/Run/Healthcheck dokumentiert, Belege erforderlich)

## 7. Delegationsstruktur (angelegt 2026-10-13)

| Issue | Agent | Aufgabe | Status |
|---|---|---|---|
| MARAA-2 | Lead Architect | ADR: Stack, Consent-Contract, Reviews-Schema, Performance-Budgets, Docker-Plan | in Arbeit |
| MARAA-3 | Content & Copywriter | Content-Pack: Copy, SEO, Schema.org, Rechtsseiten, Consent-Texte | in Arbeit |
| MARAA-4 | Designer | Konzept, Design-Tokens, Komponenten-Spezifikation | in Arbeit |
| MARAA-5 | Frontend Developer | Implementierung + Consent + Reviews + Docker-Image (blockiert durch 2,3,4) | wartet |
| MARAA-6 | QA Engineer | Abnahme: A11y, DSGVO, Browser, Docker (blockiert durch 5) | wartet |

## 8. Regeln fuer alle Teilaufgaben

- Keine Secrets in Issues/Kommentaren/Doku/Logs (Places-API-Key nur per Env).
- Keine erfundenen Bewertungen, Zahlen, Auszeichnungen oder Kunden.
- Offene Punkte als OP kennzeichnen, nicht raten.
- Interne Links mit Company-Prefix (MARAA-n), keine `/issues/n`.
- Fertigmeldungen nur mit Beleg (Build-Output, Test-Log, Screenshot, Messwert).
