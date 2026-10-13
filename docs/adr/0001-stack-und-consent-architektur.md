# ADR 0001 — Stack, Consent-Architektur & Docker-Packaging

| | |
|---|---|
| **Status** | Akzeptiert (verbindlich für MARAA-3, MARAA-4, MARAA-5, MARAA-6) |
| **Datum** | 2026-10-13 |
| **Autor** | Lead Architect (PixelForge Studio), Issue MARAA-2 |
| **Kontext** | MARAA-1 — Ivo-Mertsch-Relaunch |
| **Wirkt auf** | MARAA-3 (Content), MARAA-4 (Design), MARAA-5 (Frontend), MARAA-6 (QA) |
| **Quellen** | `docs/contracts/reviews.schema.json`, `docs/contracts/consent.schema.json`, `docs/contracts/reviews.example.json` |
| **Abweichungen von CEO-Vorgaben** | Abschnitt 10 — vier Punkte, Entscheidung durch CEO erforderlich |

---

## 1. Kontext

Der Kunde Ivo Mertsch (Einzelunternehmen, Schwoerstadt/Baden) beauftragt einen Relaunch von
<https://ivo-mertsch.de/> (bisher WordPress). Das Kundenbriefing verlangt wörtlich: *"baue die
webseite besser. fuege die google rezeisionen hinzu, und mache sie dsgvo konform mit cookibanner
etc. Arbeite das mit einer agency aus. ich will am schluss einen fertigen docker contianer haben"*.

Der CEO (MARAA-1) hat daraus einen messbaren Konsens-Zielzustand abgeleitet und vier harte,
nicht verhandelbare Randbedingungen gesetzt:

1. **Ein Docker-Container** als Abnahmeartefakt; `docker build` + `docker run` ohne weitere Services,
   mit Healthcheck.
2. **Keine Drittanbieter-Ressourcen** (Fonts, Scripts, Maps, Embeds) vor erfolgter Einwilligung;
   Consent-Architektur mit granularen Kategorien.
3. **Lighthouse Performance ≥ 95, WCAG 2.1 AA (BITV-orientiert)** als Abnahmekriterium; die
   Budget-Zahlen legt der Lead Architect fest.
4. **Keine Secrets** in Repo, Issues, Kommentaren oder Logs; ein Places-API-Key ist zur Laufzeit per
   Env-Variable injizierbar und in dieser ADR dokumentiert.

Zusätzlich liegt ein CEO-Befund vor, der die Bewertungs-Sektion prägt: Ein öffentlich
verifizierbarer Review-Korpus existiert derzeit **nicht**. Der Google-Eintrag *"Ivo Mertsch Design"*
(Quelle: golocal) weist **0 Bewertungen, 0,0 Sterne** aus. Konsequenz, die der CEO bereits gezogen
hat und die diese ADR technisch absichert: **Keine Bewertungen erfinden.**

Der Relaunch ist eine kleine, inhaltsstabile Marketing-Site: vier Leistungsbereiche, Kontakt,
Impressum, Datenschutz, optional eine Bewertungs-Sektion. Sie muss von einem Einzelunternehmen
betrieben werden können, ohne dass dafür ein Server-Stack entsteht.

Diese ADR entscheidet deshalb nicht „schönste Architektur", sondern die Architektur mit dem
geringsten Betriebsrisiko bei gleichzeitig erfüllbaren Performance- und DSGVO-Budgets.

---

## 2. Entscheidung im Überblick

| # | Entscheidung | Gewählte Option | Status |
|---|---|---|---|
| D1 | Stack & Rendering | **Astro, `output: 'server'`, pro Route `prerender = true`, Node-Standalone-Adapter** | akzeptiert |
| D2 | Consent-Architektur | **`localStorage`-Datensatz, `pixelforge.consent.v1`, 3 Kategorien, Zero-Request-Garantie vor Consent** | akzeptiert |
| D3 | Google-Bewertungen | **Ein Normalformat `docs/contracts/reviews.schema.json`, zwei Quellen, identisches Renderergebnis** | akzeptiert |
| D4 | Performance-Budgets | **Zahlen-Tabelle Abschnitt 7** | akzeptiert |
| D5 | Kontaktformular | **same-origin-POST serverseitig, lokale SMTP-Config, mailto-Fallback ohne Consent** | akzeptiert |
| D6 | Docker-Packaging | **Multi-Stage `node:22-alpine`, Non-Root, `GET /api/healthz`** | akzeptiert |
| D7 | Repo-Struktur | **Layout + Namensregeln Abschnitt 11** | akzeptiert |

---

## 3. D1 — Stack & Rendering-Strategie

### Kontext

Die CEO-Randbedingung 4 zwingt zu einem Prozess, der zur Laufzeit Umgebungsvariablen entgegennimmt
(ein Places-API-Key). Ein reines Static-File-Artefakt kann das nicht. Gleichzeitig verbietet
Randbedingung 2 jede Drittanbieter-Ressource vor Consent — das schließt clientseitige Fetch-Aufrufe
zu Google als Datenquelle für die Bewertungs-Sektion praktisch aus, weil ein Request an Google eine
Drittanbieter-Verbindung ist.

### Entscheidung

**Astro mit `output: 'server'` und dem Node-Standalone-Adapter. Jede Route entscheidet einzeln per
`export const prerender = true|false`.**

- Alle Inhaltsseiten (`/`, `/leistungen/*`, `/kontakt`, `/impressum`, `/datenschutzerklaerung`,
  `/bewertungen`, ...): `prerender = true`. Ergebnis ist statisches HTML im Build-Output.
- Genau drei on-demand-Routen: `GET /api/healthz`, `POST /api/contact`, `GET /api/reviews`.
- Es gibt **keinen** zweiten Prozess, keine Sidecar-Datenbank, keinen Reverse Proxy im Container.

Astro deshalb, weil es Inhalt/Rendering trennt, serverseitig rendert, ohne clientseitiges Hydration-
Gerüst zu erzwingen, und weil der Node-Adapter ein einziges, schlankes Artefakt erzeugt. Der
View-Transition- und Islands-Mechanismus erlaubt es, Interaktion nur dort hinzuzufügen, wo sie
wirklich gebraucht wird.

### Begründung

1. **Performance.** Vorgerendertes HTML erreicht LCP-Werte im Sub-Sekunden-Bereich, weil HTML,
   kritisches CSS und die Bild-`srcset`-Tags schon im Dokument stehen und kein RSC-/Hydration-
   Roundtrip den First Contentful Paint verzögert. Ein Lighthouse-Wert ≥ 95 ist mit reinem Static
   plus minimalem JS realistisch; mit einem clientseitig hydratisierenden Framework (Next.js App
   Router, Remix, SvelteKit) muss das Budget aktiv gegen das Framework-Runtime-Gewicht verteidigt
   werden.
2. **DSGVO-Fußabdruck.** Kein Drittanbieter-Request, kein Cookie von Dritten, kein CDN-Aufruf.
   Fonts, Bilder, CSS und JS liegen alle auf derselben Origin. Damit ist Randbedingung 2 bereits
   architektonisch erfüllt und nicht nur per Banner-Konfiguration „versprochen".
3. **Betreibbarkeit in einem Container.** Genau ein Node-Prozess, ein Port, ein Volume-Pfad für den
   Cache. Kein `docker-compose`, keine zweite Service-Definition, keine Migration zur Abnahme.
4. **Wartbarkeit.** Ein Build-Befehl, ein Start-Befehl, ein Testbefehl. Ein Einzelunternehmen kann
   den Container betreiben; ein Freelancer kann ihn in 20 Minuten aftervollziehen.
5. **Env-Key-Fähigkeit.** Die on-demand-Routen lesen `process.env` zur Laufzeit — exakt die
   Dokumentationsanforderung aus Randbedingung 4.

### Konsequenzen

- Positiv: Kleinstes JS-Budget erreichbar; einfachste DSGVO-Lage; ein Artefakt.
- Positiv: Der Platzhalter für eine spätere Statistik-Kategorie existiert, ohne heute schon Code zu
  erzeugen (siehe Abschnitt 4.2).
- Negativ: Astro erzeugt ein Node-Runtime-Artefakt, kein reines nginx-Static-Image. Das Image ist
  etwas größer und braucht ein `HEALTHCHECK`-Ziel, das ein Prozess bedienen kann.
- Negativ: Der Build ist Voraussetzung für jede Inhaltsänderung an vorgerenderten Seiten — der
  Redaktionsweg läuft über Git bzw. `content/`, nicht über ein Admin-UI.
- Risiko: Wer versehentlich auf einer statischen Route Daten aus `process.env` liest, bekommt sie
  ins Build-Image. Gegenmaßnahme: eine Lint-/CI-Regel „kein `process.env` in `prerender = true`"
  (MARAA-5, MARAA-6).

### Verworfene Alternativen

| Alternative | Warum verworfen |
|---|---|
| **Reines Static-File-Artefakt (z. B. nginx)** | Erfüllt Randbedingung 4 nicht: kein Prozess, der `GOOGLE_PLACES_API_KEY` zur Laufzeit entgegennehmen kann. Kontaktformular ebenfalls unmöglich. |
| **SSR-Framework mit clientseitiger Hydration (Next.js/Remix/SvelteKit)** | Liefert das beste Ökosystem für interaktive Apps, ist für eine 5-Seiten-Marketing-Site aber Overhead: Framework-Runtime frisst JS-Budget, Hydration kostet INP, und der DSGVO-Vorteil gegenüber Astro ist null. |
| **Eleventy + separater Express-Server** | Zwei Build-Systeme, zwei Verantwortlichkeiten, mehr Pflege. Astro liefert beides in einem. |
| **WordPress im Container** | Widerspricht dem Ziel „messbar besser" und randbedingung 3: PHP+MySQL im Container heißt mehrere Prozesse, ein angreifbares Admin-UI und keine Lighthouse-95-Chance. |

---

## 4. D2 — Consent-Architektur (verbindlicher Contract für MARAA-5)

MARAA-5 implementiert 1:1 gegen diesen Abschnitt und gegen
`docs/contracts/consent.schema.json`. Abweichungen brauchen ein Review mit Label `[blocker]`.

### 4.1 Kategorien

| Kategorie | Schlüssel | Default | Rechtsnatur heute |
|---|---|---|---|
| Essenziell | `essenziell` | immer `true`, kein Toggle | Seitenauslieferung, der Consent-Datensatz selbst |
| Statistik | `statistik` | `false` | derzeit **kein** Nutzer; Platzhalter für späteres cookieloses Statistiktool |
| Externe Medien | `externe_medien` | `false` | Google-Avatare, Karten, Social-Embeds |

### 4.2 Before-Consent-Garantien

Vor jeder Einwilligung, im Zustand `entscheidung: "unbekannt"`:

**Verboten**
- Jede HTTP-Anfrage an eine andere Origin als die ausliefernde Domain.
- Jedes Nachladen von Fonts, CSS, JS, Bildern, Karten, Avataren von Drittanbietern.
- Jedes Setzen eines Cookies durch uns oder Dritte.
- Jedes Schreiben in `localStorage`/`sessionStorage` außer dem Consent-Datensatz selbst.
- Jedes Übertragen von Personenbeziehungsdaten (IP, Standort) an Dritte.
- Jedes Einbetten eines `iframe` mit fremder Quelle.

**Erlaubt**
- HTML, CSS, JS, woff2-Fonts, Bilder und Favicon von der eigenen Origin.
- Lokale SVG-Icons und lokal gerenderte Initialen-Avatare.
- Der Consent-Datensatz in `localStorage` unter `pixelforge.consent.v1`.

**Beweisbare Prüfung (MARAA-6):** Playwright-Test mit Request-Interception, der über eine
komplette Seiteninteraktion (Scroll, Klick auf CTA, Öffnen der Navigation) sammelt und genau null
Cross-Origin-Requests erwartet. Der Test läuft ohne gesetzten Consent. Er ist ein **Blocker-Gate**,
kein Nice-to-have. Ein grünes Lighthouse-A11y-Ergebnis ersetzt ihn nicht.

### 4.3 Consent-Speicher

- **Medium:** `localStorage`, Schlüssel `pixelforge.consent.v1`. Kein Cookie, damit ist weder ein
  Banner-Plugin noch eine Cookie-Auswertung für unseren eigenen Datensatz nötig.
- **Format:** genau `docs/contracts/consent.schema.json`. Keine zusätzlichen Felder; zusätzliche
  Felder gelten als `[blocker]` im Review, weil sie unbemerkt Profiling ermöglichen.
- **Rücklesbarkeit:** Der Footer-Eintrag *„Cookie-Einstellungen"* öffnet denselben Dialog und zeigt
  zusätzlich den aktuellen Datensatz als menschenlesbaren JSON-Text (Version, Zeitstempel, Methode,
  Textfassung). Damit ist der Widerruf nachweisbar, nicht nur behauptet.
- **Protokollierung:** ausschließlich lokal im Browser. Kein Consent-Log an einen Server, keine
  Übertragung an einen Dritten. Server-seitig wird der Consent nicht gespeichert.
- **Migration:** Versionsänderung ⇒ neuer Schlüssel (`…v2`). Nie Felder im Alt-Schema uminterpretieren.

### 4.4 Consent-Änderung und -Widerruf

- Dauerhaft sichtbarer Footer-Eintrag **„Cookie-Einstellungen"** auf **jeder** Seite.
- Klick öffnet denselben Dialog wie der Erstbanner, mit aktuellem Zustand vorbelegt.
- Änderung wirkt **sofort**: Consent-Gates werden neu ausgewertet, nachgeladene externe Ressourcen
  werden aus dem DOM entfernt und ihr Ladeversuch abgebrochen, nicht nur ausgeblendet.
- Widerruf ist gleich aufwändig wie Erteilung. Kein Dark Pattern: „Alle ablehnen" ist auf derselben
  Ebene wie „Alle akzeptieren", gleiche Schriftgröße, gleicher Kontrast.
- Nach Widerruf wird `entscheidung` auf den neuen Stand gesetzt, nicht gelöscht — sonst lässt sich
  die Historie nicht nachweisen.

### 4.5 Consent-Gating im Markup

Jedes externe Element trägt ein explizites Gate-Attribut. Vor Zustimmung wird es gar nicht erzeugt.

| Attribut | Wirkung |
|---|---|
| `data-consent-gate="externe_medien"` | Element wird erst nach `externe_medien === true` ins DOM eingefügt |
| `data-consent-gate="statistik"` | Element wird erst nach `statistik === true` ins DOM eingefügt |

Zwei Regeln, die Review-Blocker sind, wenn verletzt:
1. Ein Gate-Element wird **erzeugt**, nicht per CSS/`hidden`/`display:none` verschleiert. Ein
   `src`-Attribut auf einem `img` läd auch dann, wenn das Element ausgeblendet ist.
2. Gate-Attribute sind maschinenlesbar, damit MARAA-6 sie in Playwright ohne DOM-Heuristik zählen
   kann.

### 4.6 Barrierefreiheit des Dialogs (Vorgabe, nicht Vorschlag)

`role="dialog"`, `aria-modal="true"`, benannter Titel, Fokusfalle, `Escape` schließt, Fokus zurück
auf den Auslöser. Tastaturbedienung komplett, sichtbarer Fokusindikator. Kontrast der Toggle- und
Button-Beschriftungen ≥ 4,5:1. Animation respektiert `prefers-reduced-motion`. Der Dialog darf den
LCP nicht blockieren: er wird asynchron eingebunden.

### 4.7 Statistik-Kategorie heute

Es gibt **keine** Statistik im Launch. Die Kategorie existiert im Datenvertrag, damit ein späteres
cookieloses Werkzeug ohne Schema-Änderung und ohne erneute Architektur-Debatte ergänzt werden kann.
Eine nachträgliche Aktivierung ist eine ADR-Änderung (neue ADR), weil sie das Budget verändert.

---

## 5. D3 — Google-Bewertungen: Datenkontrakt

### 5.1 Das Problem

Der CEO-Befund ist eindeutig: Es gibt derzeit **keine** öffentlich verifizierbaren Bewertungen für
dieses Unternehmen. Ziel des Kunden (*"fuege die google rezeisionen hinzu"*) muss deshalb mit einer
datengetriebenen Sektion erreicht werden, die **beide** Zustände korrekt darstellt, statt mit
erfundenen Inhalten.

### 5.2 Entscheidung

Es gibt **ein** Normalformat und **zwei** Quellenpfade, die auf dasselbe Normalformat abgebildet
werden. Der Renderer kennt nur das Normalformat und nie die Quelle.

```
Quelle A: content/reviews.json  ──┐
                                  ├──► normalize() ──► Review[]  ──► <ReviewList>  ──► identisches HTML
Quelle B: Google Places API     ──┘        (Docs)
   via /api/reviews + Cache
```

Verbindliches Schema: `docs/contracts/reviews.schema.json`.
Beispiel-Datensätze inkl. Negativfälle: `docs/contracts/reviews.example.json`.

Feldnamen (CEO-Vorgabe, nicht verhandelbar): `autor`, `sterne`, `datum`, `text`, `avatar_status`,
`profil_link`, `review_time`.

#### Quelle A — statischer Export (Default)

- Datei `content/reviews.json`, vom Kunden ohne Code pflegbar, menschenlesbar mit Kommentarzeile.
- Wird beim Build gelesen und validiert. Ungültige Datensätze ⇒ **Build-Fehler**, nicht stille
  Anzeige. Ein falsches Feld im Kunden-Content darf nicht auf der Produktions-Site landen.
- Fehlt die Datei oder ist sie leer ⇒ Leerzustand,kein Fehler.

#### Quelle B — Google-Places-Proxy mit Cache + Env-Key-Fallback

- `GET /api/reviews` (on-demand, nicht vorgerendert).
- Nutzt `GOOGLE_PLACES_API_KEY` und `GOOGLE_PLACE_ID` aus der Laufzeit-Umgebung.
- Feldmaske bewusst minimal: `id,displayName,rating,userRatingCount,reviews,googleMapsUri`.
  Ist der Key nicht gesetzt ⇒ Antwort `{ "quelle": "static_export", "reviews": [] }` und der
  statische Pfad greift. Der Container läuft also **mit und ohne** Key.
- **Cache:** In-Memory plus Datei-Cache unter `REVIEWS_CACHE_DIR`. Zeitstempel-basiert,
  Standard-TTL 3600 s, per `REVIEWS_CACHE_TTL_S` konfigurierbar. Hard-Obergrenze **30 Tage**, siehe
  5.6. Der Cache dient dazu, das Google-Kostenbudget nicht pro Seitenaufruf zu verbrauchen und die
  Antwortzeit nicht von Google abhängig zu machen.

### 5.3 Normalisierung (verbindliche Abbildung)

| Google-Feld | Unser Feld | Regel |
|---|---|---|
| `reviews[].authorAttribution.displayName` | `autor` | 1:1, Pflichtfeld. Fehlt es ⇒ Datensatz wird verworfen, nicht angezeigt. |
| `reviews[].rating` | `sterne` | Integer, 1..5. |
| `reviews[].publishTime` | `datum` | ISO-Kalendertag, `YYYY-MM-DD`. |
| `reviews[].publishTime` | `review_time` | Unix-Epoch-Sekunden. |
| `reviews[].text.text` | `text` | Unverändert. Kein serverseitiges Kürzen ohne Kennzeichnung. |
| `reviews[].authorAttribution.photoUri` | `avatar_status: "google"` + `avatar_url` | Nur wenn eine URI existiert. |
| — | `avatar_status: "initials"` | Sonst; lokal gerenderte Initialen aus `autor`. |
| `reviews[].authorAttribution.uri` | `profil_link` | 1:1. |
| `reviews[].relativePublishTimeDescription` | — | **Nicht** speichern: relative Zeitangaben altern im Cache. `datum` ist kanonisch. |

Zusicherung für beide Pfade: **dieselbe `normalize()`-Funktion, derselbe Renderer, denselbe
Sortierung** (`review_time` absteigend). Der statische Pfad ist nicht „der einfache Pfad" — er wird
vor dem Rendern durch exakt dieselbe Normalisierung geschickt. Das ist die technische Garantie für
"beide Pfade erzeugen dasselbe Renderergebnis".

### 5.4 Leerzustand (verbindlich)

Bedingungen: `reviews.length === 0` — aus **jedem** Grund: keine Datei, leere Datei, kein API-Key,
API-Fehler, Netzwerkfehler.

Darstellung, unveränderlich:
- Keine Sterne-Anzeige, keine erfundenen Initialen, kein „Bald verfügbar".
- Überschrift in der Sektion, z. B. *„Bewertungen"*, und ein sachlicher Satz, der den Zustand
  benennt.
- Ein primärer CTA **„Jetzt bei Google bewerten"**, verlinkt auf den Google-Eintrag
  (`GOOGLE_REVIEW_URL`, Laufzeit-Env, Default leer ⇒ CTA ausgeblendet).
- Attribution **„Quelle: Google"** wird **nicht** im Leerzustand gezeigt, weil keine Google-Inhalte
  angezeigt werden. Das ist ehrlich und vermeidet eine irreführende Herkunftsangabe.

Der Leerzustand ist ein **Blocker-Gate**: Es darf keinen Code-Pfad geben, der im Leerzustand ein
Sterne-Symbol oder einen Platzhalter-Avatar rendert.

### 5.5 Consent-Gating der Sektion

| Element | Vor Consent | Nach `externe_medien` |
|---|---|---|
| Autor, Sterne, `datum`, `text` | **erlaubt** — eigener Origin-Content | erlaubt |
| `profil_link` | **erlaubt** — ein Link ist keine Ressourcen-Anfrage | erlaubt |
| `avatar_status: "initials"` | **erlaubt** — lokal gerendert | erlaubt |
| `avatar_status: "google"` | **verboten** | erlaubt |
| Karte, Social-Embed | **verboten** | erlaubt |

Wichtig für MARAA-5: Ein `<a href="https://www.google.com/...">` ist **keine** Drittanbieter-Ressource
und damit **nicht** consent-pflichtig. Er läd nichts nach. Wird er als Ressource missverstanden und
gesperrt, ist das ein `[nötig]`-Kommentar, weil es die Google-Attributionspflicht verletzt.

### 5.6 Google-Places-Policy — harte technische Randbedingungen

Am 2026-10-13 von <https://developers.google.com/maps/documentation/places/web-service/policies>
abgerufen (Seite zuletzt aktualisiert 2026-10-08). Diese Regeln sind für die Architektur bindend,
nicht optional:

| # | Policy | Architektonische Folge |
|---|---|---|
| 1 | *"You must not pre-fetch, cache, or store Places API content beyond the allowed exceptions."* `place_id` ist explizit ausgenommen. | `place_id` darf dauerhaft gespeichert werden. `review_time`, `datum`, `text`, `autor`, `sterne`, `profil_link` sind **Places Content** und unterliegen der Frist. |
| 2 | Temporäres Caching von Google-Maps-Content ist zeitlich begrenzt zulässig (Google Maps Platform Service Specific Terms). | Cache-TTL **hart auf 30 Tage begrenzt**. `REVIEWS_CACHE_TTL_S` default 3600; jeder Wert > 2 592 000 s ist ein Startup-Fehler. |
| 3 | Autoren von Reviews müssen mit Avatar, Name und Profil-Link genannt werden, *"when space allows"*. Bei Reviews ist im Minimum der Autoren-Avatar zu zeigen. | `autor` und `profil_link` sind Pflicht im Normalformat. `avatar_status` existiert genau deshalb. |
| 4 | Für jede Review muss der Link auf die Einzelansicht bei Google bereitstehen (`googleMapsUri` / `authorAttribution.uri`). | `profil_link` ist Pflicht im Places-Pfad. |
| 5 | Reihenfolge und Filterung der Bewertungen müssen beschrieben werden (Default: Relevanz). | Pflichtfeld `sortierung_hinweis` im Dokument, im UI anzuzeigen. |
| 6 | Beim Anzeigen von Places-Daten ohne Google-Map ist das **Google-Maps-Logo bzw. Textattribution „Google Maps"** zu verwenden, mit den Stilregeln (u. a. `translate="no"`). | Attribution-Pflicht. Abweichung vom CEO-Goal, siehe Abschnitt 10. |
| 7 | Nutzer sind darüber zu informieren, wie Google Reviews prüft. | Pflicht-Hinweistext, Inhalt durch MARAA-3. |
| 8 | Für Kunden mit Rechnungsadresse im EWR gelten gesonderte EEA-ToS; Funktionsumfang kann abweichen. | Klärung mit CEO/Kunde vor Aktivierung von Quelle B. |

**Wichtigster Punkt für den Build:** Der Datei-Cache ist ein **Inhalts-Cache** (HTTP-Antwort von
Google), nicht Übernahme in die statische Site. Er liegt zur Laufzeit in `REVIEWS_CACHE_DIR`, wird
per Volume ausgelagert und ist in `.gitignore` und `.dockerignore`. Wird der Cache-Pfad ins Repo
committet oder ins Image gebacken, ist das ein `[blocker]`.

---

## 6. D4 — Kontaktformular-Architektur

### 6.1 Entscheidung

Same-origin-`POST` auf `/api/contact`. Serverseitiger Versand per SMTP mit lokalem Transport.
mailto-Fallback nur, wenn kein SMTP konfiguriert ist.

| Zustand | Verhalten |
|---|---|
| `SMTP_HOST` gesetzt | Normales Formular, serverseitiger Versand, danke-Zustand. |
| Nicht gesetzt | Das Formular rendert sich als **mailto-Formular**: Klick füllt ein `mailto:` mit Betreff/Body; sichtbarer Hinweis, dass das E-Mail-Programm geöffnet wird. |

Kein externes JS für das Formular. Keine Drittanbieter-API (kein Formulardienst, kein
Captcha-Anbieter).

### 6.2 Spam-Schutz ohne Drittanbieter

Gestaffelt, jede Stufe allein betreibbar:

1. **Honeypot** — verstecktes Feld, per CSS ausgeblendet, `aria-hidden="true"`, Tabindex aus dem
   Fokus. Nur serverseitig ausgewertet; ein leerer Wert heißt „menschlich".
2. **Zeitfalle** — verborgener Zeitstempel beim Rendern; serverseitig wird eine minimal plausible
   Bearbeitungsdauer verlangt (`CONTACT_MIN_FILL_SECONDS`, default 3). Bots sind zu schnell.
3. **Rate-Limit** — pro IP, Token-Bucket, default 5/10 min. In-Memory-Karte, dokumentierte
   Einschränkung: bei horizontaler Skalierung nicht shared. Bei einer Instanz korrekt.
4. **Kein Captcha** — jedes gängige Captcha ist eine Drittanbieter-Ressource und würde vor Consent
   eine externe Verbindung aufbauen bzw. nach Consent ein zusätzliches Tracking-Fenster öffnen.

### 6.3 Minimale Datenerhebung (DSGVO)

Pflicht: `name`, `email`, `nachricht`. Optional: `telefon`. Kein Adressfeld, kein Betreff-Select,
keine Newsletter-Checkbox, kein Tracking-Parameter.

Der Client sendet **keine IP** und keinen User-Agent an uns; die SMTP-Mail enthält ausschließlich
die Formularfelder. Der Server loggt keine Formularinhalte, nur Statuscodes. Consent-Pflichtig ist
das Formular nicht, weil es ein reiner Eigenbedarf-Kanal ist — die Datenschutzerklärung von MARAA-3
muss die Verarbeitung aber benennen.

### 6.4 Antwortvertrag

```jsonc
// 200
{ "ok": true, "messageId": "<lokal-erzeugt>" }
// 400
{ "ok": false, "error": "validation", "fields": ["nachricht"] }
// 429
{ "ok": false, "error": "rate_limited", "retryAfterSeconds": 600 }
// 503
{ "ok": false, "error": "mail_not_configured" }   // nur wenn SMTP fehlt UND Fallback nicht greift
```

Kein Stacktrace, keine internen Pfade, keine SMTP-Fehlermeldung im Response-Body. Details gehen in
das Server-Log, nie zum Client.

---

## 7. D5 — Performance-Budgets

Messverfahren (verbindlich, damit Zahlen vergleichbar sind): **Lighthouse**, Mobile-Profil,
*Simulated throttling* (4G, 4× CPU), Produktions-Build, `dist=build`. Gemessen wird gegen den
laufenden Container per `docker run`.

### 7.1 Kernmetriken

| Metrik | Ziel | Blocker | Kommentar |
|---|---|---|---|
| LCP | ≤ 2,0 s | > 2,5 s | Randbedingung des Auftrags |
| INP | ≤ 200 ms | > 300 ms | eigenes Budget des Lead Architect |
| CLS | ≤ 0,1 | > 0,1 | < 0,1 = kein spürbares Springen |
| TBT | ≤ 200 ms | > 400 ms | Proxy für Interaktionsreife |
| Lighthouse Performance | ≥ 95 | < 90 | harte Abnahmeschwelle |
| Lighthouse Accessibility | ≥ 95 | < 90 | harte Abnahmeschwelle |
| Lighthouse Best Practices | ≥ 95 | < 90 | |
| Lighthouse SEO | ≥ 95 | < 90 | |

### 7.2 Übertragungsbudgets

| Budget | Ziel | Blocker |
|---|---|---|
| **JS first load (gzip)** | **≤ 60 KB** | > 100 KB |
| CSS (gzip, je Seite) | ≤ 25 KB | > 40 KB |
| HTML (gzip, je Seite) | ≤ 30 KB | > 50 KB |
| woff2-Fonts, gesamt | ≤ 120 KB | > 160 KB |
| LCP-Bild | ≤ 120 KB | > 200 KB |
| Bildbudget je Seite, erstes Viewport | ≤ 300 KB | > 500 KB |

JS-Architektur, die diese Zahlen trägt: **Islands, kein Framework-Hydration**. Der Consent-Manager
ist ein Inline-Snippet von ≤ 1 KB im `<head>` (reicht für das Gate-Attribut, das vor jedem Nachladen
schützen muss); alles weitere ist `type="module"` und `defer`. Es gibt kein jQuery, kein
Slider-Framework, kein Animation-Framework.

### 7.3 Bildbudgets

- **Moderne Formate:** AVIF first, WebP als Fallback. Kein PNG/JPEG für Fotos.
- **Responsive `srcset`:** mindestens drei Breiten (400w, 800w, 1200w); `sizes` je Seite explizit,
  nicht `100vw` pauschal.
- **LCP-Bild:** `fetchpriority="high"`, **kein** `loading="lazy"`, serverseitig vorgerendert.
- Alle übrigen Bilder: `loading="lazy"`, `decoding="async"`.
- **Höhe reservieren:** jede Bildposition bekommt `width`/`height` oder ein festes
  Seitenverhältnis per CSS `aspect-ratio`, sonst entsteht CLS.
- Deko-Bilder: `alt=""` und `aria-hidden` — sonst a11y-Relevanz.

### 7.4 Fonts

- Ausschließlich **selbst gehostete** woff2, `font-display: swap`, `preload` nur für das
  Used-Above-the-Fold-Font.
- **Kein Google-Fonts-Request, auch nicht nach Consent.** Google Fonts wäre ein Drittanbieter-Request
  und nach gängiger Rechtsauffassung einwilligungspflichtig; Selbst-Hosten ist sowohl technisch als
  auch datenschutzrechtlich die überlegene Lösung und spart obendrein eine DNS-/TLS-Runde.
- Maximal zwei Familien (eine Display, eine Text), maximal vier Gewichte.

### 7.5 Umgang mit Budgetüberschreitung

Eine Überschreitung ist ein **Blocker**, kein Hinweis. Darf ein Wert gerissen werden, ist das eine
**dokumentierte Entscheidung mit Begründung** — als Kommentar in der zugehörigen ADR-Änderung oder
als eigene ADR — und keine stille Ausnahme im Commit.
---

## 8. D6 — Docker-Packaging-Plan

### 8.1 Zielbild

Ein Image, ein Prozess. Zwei Stages. Kein Root-Prozess. Keine Secrets im Image.

```dockerfile
# ---- Stage 1: build ----
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build                      # astro build

# ---- Stage 2: runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=4321 HOST=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build /app/package.json ./package.json
USER node
EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||4321)+'/api/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "./dist/server/entry.mjs"]
```

Das ist das **Zielbild**, das MARAA-5 umsetzt. Verbindlich sind: Multi-Stage, Non-Root, Healthcheck,
genau ein `CMD`. Details (Basis-Image, Dependency-Cache-Mount, installierter Astro-Adapter) sind
Umsetzungsdetails und reviewpflichtig, aber nicht Gegenstand dieser ADR.

Weshalb `node` und nicht `wget`/`curl` im Healthcheck: `node` ist in diesem Image garantiert
vorhanden, die Alpine-Coreutils-Varianten unterscheiden sich je nach Basis-Image. Das hält den
Healthcheck portabel.

### 8.2 Healthcheck-Endpunkt

`GET /api/healthz` ⇒ `200`, `application/json`:

```jsonc
{
  "status": "ok",
  "checks": {
    "render": "ok",          // Build-Artefakt vorhanden
    "config": "ok",          // Pflicht-Env konsistent
    "smtp": "unconfigured"   // "ok" | "unconfigured" | "error"
  },
  "version": "<git-sha oder build-id>",
  "uptime": 12.5
}
```

Nicht `200` bei fehlendem Render-Artefakt. Nie Secrets, nie Env-Werte, nie SMTP-Credentials im
Body.

### 8.3 Run-Befehle (dokumentiert für Abnahme)

```bash
# Abnahmeartefakt 1 — ohne Google-Bewertungen (Default)
docker build -t ivo-mertsch:1.0.0 .
docker run --rm -p 8080:4321 ivo-mertsch:1.0.0
# → http://localhost:8080

# Abnahmeartefakt 2 — mit Google-Bewertungen (Env-Key, Laufzeit)
docker run --rm -p 8080:4321 \
  -e GOOGLE_PLACES_API_KEY='<zur-Laufzeit-injiziert>' \
  -e GOOGLE_PLACE_ID='<place-id>' \
  -v ivo-reviews-cache:/app/.cache \
  ivo-mertsch:1.0.0

# Abnahmeartefakt 3 — mit Kontaktformular
docker run --rm -p 8080:4321 \
  -e SMTP_HOST='smtp.example.org' -e SMTP_PORT=587 \
  -e SMTP_USER='<benutzer>' -e SMTP_PASS='<zur-Laufzeit-injiziert>' \
  -e MAIL_TO='<kunden-mail>' \
  ivo-mertsch:1.0.0
```

Beispiel 1 ist die **Basisschwelle**: Ohne jede Env-Variable muss die Seite vollständig rendern,
inklusive Leerzustand der Bewertungs-Sektion und mailto-Kontaktweg.

### 8.4 Umgebungsvariablen

| Variable | Default | Bedeutung | Geheim |
|---|---|---|---|
| `PORT` | `4321` | HTTP-Port im Container | nein |
| `HOST` | `0.0.0.0` | Bind-Adresse | nein |
| `NODE_ENV` | `production` | gesetzt im Image | nein |
| `GOOGLE_PLACES_API_KEY` | — | Key für Quelle B | **ja — nur Laufzeit-Env** |
| `GOOGLE_PLACE_ID` | — | Eintrag, aus dem gelesen wird | nein, aber kundenspezifisch |
| `GOOGLE_REVIEW_URL` | — | Ziel des CTA „Jetzt bei Google bewerten" | nein |
| `REVIEWS_SOURCE` | `static_export` | `static_export` oder `places_api` | nein |
| `REVIEWS_CACHE_TTL_S` | `3600` | Cache-Lebensdauer, **max. 2 592 000** | nein |
| `REVIEWS_CACHE_DIR` | `.cache` | Datei-Cache, per Volume auslagern | nein |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | — | Versand des Kontaktformulars | **ja** |
| `MAIL_TO` | — | Empfänger der Kontaktanfragen | nein |
| `CONTACT_MIN_FILL_SECONDS` | `3` | Anti-Spam-Zeitfalle | nein |
| `CONTACT_RATE_LIMIT_MAX` | `5` | Anfragen pro IP pro Fenster | nein |
| `CONTACT_RATE_LIMIT_WINDOW_S` | `600` | Fenster in Sekunden | nein |
| `TRUST_PROXY` | `false` | Nur hinter Reverse Proxy auf `true` | nein |

### 8.5 Secrets-Regeln (Randbedingung 4)

- **Nie** im Repo, im Issue, im Kommentar, im Log, im Screenshot, im Dockerfile-`ARG`.
- Kein `ARG GOOGLE_PLACES_API_KEY` — ein Build-`ARG` landet in der Image-History.
- Injiziert wird ausschließlich zur **Laufzeit** (`docker run -e`, oder ein Secret-Mechanismus der
  Deployment-Plattform).
- Das Repo enthält `.env.example` mit **Namen, leeren Werten und einem erklärenden Kommentar**.
  Kein echter Wert. `.env` ist in `.gitignore` und `.dockerignore`.
- Ist ein Key exponiert: sofort rotieren. Kein „ Herausreden", kein Teil-Rotation.
- Vor jedem Commit: `git diff --cached` gegen `SMTP_PASS`, `API_KEY`, `PLACES`, `Bearer` prüfen.

---

## 9. Qualitäts- und A11y-Standards (D5, verbindlich für MARAA-6)

### 9.1 A11y-Basislinie

- WCAG 2.1 Level AA, BITV-orientiert. Referenzmaschine: axe-core, Regelset `wcag2a,wcag2aa,wcag21a,wcag21aa`.
- **Null** kritische/serious Verstöße. Best-Practice-Verstöße werden mit `[Vorschlag]` behandelt.
- Tastaturbedienung komplett, sichtbarer Fokus, Skip-Link, Landmarks, eine `h1` je Seite,
  sinnvolle Hierarchie, `lang="de"`, Beschriftungen für alle Controls, `prefers-reduced-motion`.
- Kontrast: 4,5:1 für Fließtext, 3:1 für große Schrift und UI-Komponenten.

### 9.2 Test-Gates vor Abnahme

| Gate | Werkzeug | Schwelle |
|---|---|---|
| Typecheck | `astro check` / tsc | 0 Fehler |
| Lint | ESLint (Konfig aus MARAA-5, ratifiziert hier) | 0 Fehler |
| Unit | Vitest — Consent-Logik, `normalize()`, Preis/Budget-Rechner | 100 % der Kernlogik |
| E2E Consent | Playwright + Request-Interception | **0 Cross-Origin-Requests** ohne Consent |
| E2E Kontakt | Playwright — Validierung, Rate-Limit, mailto-Fallback | alle Pfade grün |
| E2E A11y | Playwright + axe-core | 0 serious/critical |
| Lighthouse | CLI, Mobile-Profil | Performance ≥ 95, A11y ≥ 95 |
| Schema-Validierung | `content/reviews.json` gegen `reviews.schema.json` | gültig oder Build-Fehler |
| Docker-Health | `docker run` + `curl /api/healthz` | 200 |

Die E2E-Consent-Prüfung und die Schema-Validierung sind die beiden Gates, die die harten
Randbedingungen 2 und 4 technisch beweisen. Sie dürfen nicht „für später" verschoben werden.

### 9.3 Betroffene Rollen

| Rolle | Verantwortung |
|---|---|
| MARAA-5 (Frontend) | Umsetzung gegen diesen Contract, Einreichung zum Review |
| MARAA-6 (QA) | Ausführung der Gates, Erstellung des Prüfberichts |
| Lead Architect | Bestätigung der Abnahme; QA **meldet**, ich **bestätige** |

---

## 10. Abweichungen vom CEO-Goal (Eskalation an MARAA-1)

Vier Punkte sind fachliche Entscheidungen mit Kundenwirkung, die über meine technische Kompetenz
hinausgehen. Ich entscheide sie **nicht** eigenmächtig, sondern lege sie dem CEO vor.

**10.1 Attribution „Quelle: Google" vs. „Google Maps" (GOAL-Konflikt).**
Das GOAL nennt wörtlich *„Google-Bewertungen mit Attribution 'Quelle: Google'"*. Die aktuelle
Places-API-Policy ist strenger: Für neue Implementierungen ist die Attribution **„Google Maps"**
vorgeschrieben, bei beengtem Raum als Text; „Google" gilt ausdrücklich nur für bestehende
Implementierungen als Bestandsschutz. Zusätzlich ist das Google-Maps-Logo mit Mindesthöhe 16px und
Mindestfreiraum zu verwenden, `translate="no"` am Text, und der Text ist nicht zu lokalisieren.
Technisch umsetzbar ist beides. Fachlich rate ich zu **„Quelle: Google Maps"** plus Logo, weil das
der aktuelle Policy-Stand ist und ein Verstoß eine Plattform-Sperrung aller Google-Dienste des Kunden
auslösen kann. **CEO-Entscheidung erbeten.**

**10.2 Kostenfolge Places-API (Kunden-Kostenfolge).**
Die Places-API nutzt Feldmasken zur Abrechnung; jedes abgerufene Feld ist ein eigener SKU-Posten.
Da Quelle B die Felder `reviews`, `rating`, `userRatingCount`, `googleMapsUri` abruft, fallen mehrere
SKUs an. Mit dem Cache (default 3600 s, max. 30 Tage) sind die Aufrufe streng begrenzt und damit im
kostenlosen Kontingent. Aber: Ein Konto mit **Rechnungsadresse im EWR** (Kunde ist in Deutschland)
fällt unter die gesonderten EEA-ToS mit verändertem Funktionsumfang. Ob der Kunde überhaupt ein
Google-Cloud-Projekt mit Abrechnung anlegen will und welche SKUs tatsächlich freigeschaltet sind,
kann ich nicht prüfen. **CEO-Entscheidung erbeten: Quelle B aktivieren oder vorerst nur den
statischen Pfad (A) ausliefern.**

**10.3 Korrekte Kontaktadresse (offener Kundenpunkt aus MARAA-1).**
Der Live-Auftritt nennt `info@ivo-mertsch.de` (Seite), `info@ivo-mertsch.com` (Footer) und
`ivomertsch@gmail.com` (Kontaktseite-Meta). Drei Adressen, mindestens eine falsch. Das ist
Inhaltsentscheidung (MARAA-3) mit Kundenrückfrage — technisch baue ich das Formular so, dass der
Empfänger über `MAIL_TO` konfigurierbar ist und die sichtbare Adresse aus `content/site.json` kommt.
**Rückfrage an Kunde erforderlich.**

**10.4 Statistik-Kategorie ohne Inhalt.**
Das GOAL fordert DSGVO-Konformität, aber keine Statistik. Ich habe die Kategorie im Consent-Vertrag
vorgesehen, aber **kein** Werkzeug eingebaut. Damit gibt es zum Launch keinen Analyse-Request und
keine Einwilligungsnotwendigkeit. Wünscht der Kunde Statistik, ist das eine neue ADR mit neuem
Budget — keine stille Nachrüstung.

---

## 11. D7 — Repo-Struktur & Konventionen

### 11.1 Verzeichnislayout

```
/                                   Git-Root (Branch: main)
├─ src/
│  ├─ components/                   UI-Bausteine (ReviewCard, ConsentGate, ...)
│  ├─ layouts/                      Seiten-Layouts
│  ├─ pages/                        Astro-Routen; jede Datei entscheidet `prerender`
│  ├─ styles/                       globale Styles + Tokens-Import
│  ├─ lib/
│  │  ├─ consent.ts                 Consent-Logik (ein Modul, ein Schlüssel)
│  │  ├─ consent.test.ts
│  │  ├─ reviews.ts                 normalize(), Quellen-Auflösung, Empty-State-Prädikat
│  │  └─ reviews.test.ts
│  └─ env.d.ts
├─ content/
│  ├─ reviews.json                  [Quelle A] vom Kunden pflegbar
│  ├─ site.json                     Firmenname, Adresse, Telefon, E-Mail
│  └─ pages/                        Seiteninhalte als MDX/JSON
├─ public/
│  ├─ fonts/                        selbst-gehostete woff2
│  └─ img/                          optimierte AVIF/WebP-Quellen
├─ docs/
│  ├─ adr/                          dieses Dokument, fortlaufend nummeriert
│  ├─ contracts/                    reviews.schema.json, consent.schema.json, reviews.example.json
│  └─ design/
│     └─ tokens.md                  Design-Tokens: WERTE durch Designer, RATIFIZIERUNG durch Lead Architect
├─ tests/
│  └─ e2e/                          Playwright (consent-no-third-party, contact, a11y)
├─ Dockerfile
├─ .dockerignore
├─ .env.example                     nur Namen + leere Werte + Kommentar
├─ astro.config.mjs
├─ package.json
├─ tsconfig.json
└─ README.md
```

### 11.2 Ablageorte

| Was | Wohin | Owner |
|---|---|---|
| Inhalte, vom Kunden pflegbar | `content/` | MARAA-3 |
| Design-Token-**Werte** | `docs/design/tokens.md` | Designer legt fest, Lead Architect ratifiziert |
| Design-Token-**Nutzung** | `src/styles/`, CSS-Custom-Properties | Lead Architect |
| Schema/Contracts | `docs/contracts/` | Lead Architect |
| Entscheidungen | `docs/adr/NNNN-*.md` | Lead Architect |
| Prüfberichte | `docs/qa/` | MARAA-6 |

**Tokens statt Literale.** Kein Hex-Literal in Komponenten, keine freien Abstände. Jeder Abstand,
jede Farbe, jede Schriftgröße referenziert ein Token. Ausnahme: weiß/schwarz in allgemeinen
Utility-Regeln — und die brauchen einen kurzen Kommentar.

### 11.3 Namensregeln

| Artefakt | Regel | Beispiel |
|---|---|---|
| Dateien | `kebab-case` | `review-card.astro` |
| Komponenten | PascalCase | `ReviewCard` |
| Funktionen/Variablen | `camelCase` | `normalizeReview()` |
| Konstanten | `SCREAMING_SNAKE_CASE` | `CONSENT_STORAGE_KEY` |
| Git-Branches | `<typ>/<kurzname>` | `feat/consent-gate` |
| Commits | Conventional Commits | `feat(reviews): normalize places api response` |
| ADRs | `docs/adr/NNNN-titel.md`, 4-stellig, aufsteigend | `0002-review-protokoll.md` |
| Interne Links | **immer** Company-Prefix | `MARAA-5` |

### 11.4 Build-Output

`dist/`. Nicht committet. Enthält nach `pnpm build` vorgerenderte Seiten unter `dist/client/` und den
Server-Entry unter `dist/server/entry.mjs`. Kein Env-Wert im Output — Startzeit-Datum
`vercel.json`-Artefakte o. ä. werden über den Healthcheck-Versionstext abgebildet, nicht in den
Dateinamen.

---

## 12. Verifikation dieses Dokuments

Behauptungen in dieser ADR sind wie folgt belegt:

| Behauptung | Beleg |
|---|---|
| Google-Places-Policy: kein Caching über die Ausnahmen, `place_id` ausgenommen; Avatar/Name/Link-Pflicht; „Google Maps"-Attribution für neue Implementierungen | abgerufen 2026-10-13 von <https://developers.google.com/maps/documentation/places/web-service/policies> (Seitenstand 2026-10-08) |
| Google-Places-Feldmaske; `reviews`, `rating`, `userRatingCount`, `googleMapsUri` sind abrufbare Felder | abgerufen 2026-10-13 von <https://developers.google.com/maps/documentation/places/web-service/place-details> |
| Bewertungskorpus existiert nicht (0 Bewertungen, 0,0 Sterne) | CEO-Befund MARAA-1, golocal-Eintrag „Ivo Mertsch Design" |
| Drei unterschiedliche Kontakt-E-Mail-Adressen im Alt-Auftritt | CEO-Discovery MARAA-1, Abruf ivo-mertsch.de |
| Schemas `reviews.schema.json` und `consent.schema.json` sind valide JSON Schema 2020-12 | `ajv`-Validierung, Exit-Code 0, siehe unten |
| Negativfälle in `reviews.example.json` schlagen wie erwartet fehl | `ajv`-Validierung, Exit-Code 0 |

### 12.1 Ausführung der Schema-Validierung

Wiederholbares Prüftor: `tests/contracts/verify-contracts.cjs`. Benötigt
`ajv@^8` und `ajv-formats@^2` als devDependencies (noch nicht installiert — das ist Teil des
MARAA-5-Grundgerüsts; ohne die Abhängigkeit beendet sich das Skript mit Exit-Code 2 und einer
klaren Meldung, statt stillschweigend grün zu werden).

```bash
node tests/contracts/verify-contracts.cjs
```

**Ergebnis der Erstausführung am 2026-10-13** (mit vorinstalliertem ajv im Scratch-Verzeichnis):

```
[PASS] reviews.schema.json kompiliert (draft 2020-12)
[PASS] consent.schema.json kompiliert (draft 2020-12)
[PASS] fixture[0] gueltig: statischer Export
[PASS] fixture[1] gueltig: places_api mit ort + avatar google
[PASS] fixture[4] gueltig: Leerzustand (reviews: [], leer: true)
[PASS] negativ: avatar_url ohne avatar_status 'google' schlaegt fehl
[PASS] negativ: unbekanntes Feld 'quelle' schlaegt fehl (additionalProperties)
[PASS] negativ: sterne = 6 schlaegt fehl
[PASS] negativ: datum im falschen Format schlaegt fehl
[PASS] negativ: avatar_status 'google' ohne avatar_url schlaegt fehl
[PASS] consent: gueltiger Datensatz nach Banner-Interaktion
[PASS] negativ: consent ohne 'essenziell' schlaegt fehl (required)
[PASS] negativ: consent mit essenziell=false schlaegt fehl (const true)
[PASS] negativ: consent mit unbekannter methode schlaegt fehl

14/14 bestanden
EXIT=0
```

Damit ist nachgewiesen: Beide Schemas sind valide JSON Schema 2020-12; alle fünf Fixtures
verhalten sich wie spezifiziert; und die fünf Negativfälle (Wertebereich, Datumsformat,
Konsistenz von `avatar_status`/`avatar_url`, `additionalProperties`, Consent-Pflichtfelder)
werden zuverlässig abgewiesen.

### 12.2 Noch nicht verifiziert (offen, nicht behauptet)

Folgende Punkte sind in dieser ADR als **Entscheidung** festgehalten, aber noch nicht durch eine
laufende Implementierung bewiesen. Sie sind Gates für MARAA-5/MARAA-6:

- [ ] Docker-Image baut erfolgreich aus dem Zielbild in Abschnitt 8.1
- [ ] `HEALTHCHECK` wird im Container grün (Exit-Code 0)
- [ ] Playwright-Consent-Gate: 0 Cross-Origin-Requests ohne Einwilligung
- [ ] Lighthouse Mobile: Performance ≥ 95, Accessibility ≥ 95
- [ ] `content/reviews.json` validiert gegen `reviews.schema.json`

Diese Liste ist bewusst offen. Eine ADR darf nicht behaupten, was sie nicht gemessen hat.

---

## 13. Konsequenzen im Gesamtbild

**Was diese Architektur dem Projekt gibt:** Ein Artefakt, das der Kunde ohne Server-Kenntnisse
betreibt. Ein DSGVO-Zustand, der technisch erzwungen statt nur behauptet ist. Ein Performance-Budget,
das vor dem ersten Commit Zahlen hat statt nach dem ersten Review Meinungen. Ein Datenvertrag, der
es erlaubt, Bewertungen später zu ergänzen, ohne die Sektion neu zu bauen.

**Was sie kostet:** Astro-Node-Image statt nginx-Static. Die Review-Gates in Abschnitt 9.2 statt
„sieht gut aus". Ein Build-Schritt für jede Inhaltsänderung an vorgerenderten Seiten. Und vier
offene Fachfragen, die nur CEO beziehungsweise Kunde entscheiden können.

**Was sie verhindert:** Ein WordPress, das „besser" sein sollte, aber langsamer, unsicherer und
datenschutzrechtlich fragiler wäre. Erfundene Bewertungen. Einen Cookie-Banner, der Dritte einlädt,
bevor jemand zugestimmt hat.

---

*Ende ADR 0001. Änderungen an diesem Dokument brauchen eine neue ADR, die auf diese verweist.*
