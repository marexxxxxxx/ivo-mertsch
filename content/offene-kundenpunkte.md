# OFFENE KUNDENPUNKTE — Ivo-Mertsch-Relaunch

Stand: **2026-10-14**. Grundlage der Klärungen: Kundenantwort **Interaktion
`950f0d46`** (E-Mail, Google-Maps-Profil, Places-API, Rechtsangaben,
Rechtsprüfung, KI-Bilder) sowie `docs/adr/0002-ki-bilder-transparenz.md` (MARAA-9).

Jeder Punkt ist eine Frage an den Kunden. **Keine Annahme ist geraten.** Geklärte
Punkte tragen die Kundenantwort; offene Punkte stehen weiter im Content-Pack als
Marker (`[OFFENER KUNDENPUNKT: …]` / `[FREIGABE NÖTIG: …]`).

Legende: **GEKLÄRT** = vom Kunden beantwortet, Text final. **OFFEN** = Frage steht,
keine Annahme getroffen.

## Block A — GEKLÄRT am 2026-10-14

**OP-1 · Korrekte E-Mail-Adresse. — GEKLÄRT.**
Kundenantwort (`950f0d46`): **`info@ivo-mertsch.de`**. Sie ist die sichtbare
Adresse in Kontakt, Impressum und Datenschutz. Umgesetzt zentral in
`content/site.json` (`kontakt.email`, `email_status: "bestaetigt"`); die
Konflikt-/Hinweisfelder (`.com`, `gmail.com`) sind entfernt. Versand läuft
unverändert über `MAIL_TO`.

**OP-2 · Ziel des CTA „Jetzt bei Google bewerten". — GEKLÄRT.**
Kundenantwort (`950f0d46`): Google-Maps-Profil **`https://maps.app.goo.gl/4w3i7sVLrrs8di5v9`**
(„genau dieses Unternehmen"). Der CTA wird statisch auf dieses Ziel verlinkt.
Wert zentral in `content/site.json` (`reviews.cta_url`, `cta_url_status:
"bestaetigt"`); Laufzeit-Override bleibt `GOOGLE_REVIEW_URL`.

**OP-3 · Verantwortlicher in der Datenschutzerklärung. — GEKLÄRT.**
Kundenantwort (`950f0d46`, „Rechtsangaben bestätigt"): Verantwortlicher ist der
Betreiber, **Ivo Marco Mertsch, Niederdossenbach 1, 79739 Schwörstadt**. Die im
Alt-Auftritt genannte dritte Person („Marec Salzmann") ist ersetzt. Siehe
`datenschutzerklaerung.md`, Abschnitt 1.

**OP-4 · Impressums-Pflichtangaben bestätigen. — GEKLÄRT.**
Kundenantwort (`950f0d46`, „Rechtsangaben bestätigt"): Die Angaben treffen heute
noch zu — Diensteanbieter „Ivo Marco Mertsch / Ivo Mertsch Design", keine
Registereintragung, **keine** USt-IdNr./W-IdNr., Berufsbezeichnung
„Handwerksbetrieb", zuständige Kammer Handwerkskammer Freiburg, berufsrechtliche
Regelung HwO, keine Verbraucherschlichtung. Siehe `impressum.md`.

**OP-5 · Rechtsprüfung. — GEKLÄRT (Kunden-Selbstprüfung).**
Kundenantwort (`950f0d46`): Der Kunde **prüft die Rechtsseiten selbst** und gibt
sie in eigener Verantwortung frei. Der frühere Studio-seitige Prüfvermerk
(„Abnahmekriterium: Rechtsanwalt des Kunden") ist entfernt; an seine Stelle tritt
der Freigabe-Hinweis in `impressum.md` und `datenschutzerklaerung.md`. PixelForge
Studio sagt **keine** anwaltliche Freigabe zu.

**OP-6 · Nutzungsrechte an Bildern und Logo. — GEKLÄRT.**
Kundenantwort (`950f0d46`): Die Bilder stammen aus dem Alt-Auftritt des Kunden und
sind **mit KI erzeugt**; der Betreiber nutzt sie auf seiner eigenen Website. Die
Nutzung ist damit geklärt. Die formal-rechtliche Würdigung der
Generator-Lizenz/Urheberrechte bleibt Teil der Kunden-Selbstprüfung (OP-5;
ADR 0002, Abschnitt 7 „O2"). Siehe `content/bild-provenienz.json`.

## Block B — OFFEN (Text-/Auftritts-Entscheidungen des Kunden)

**OP-7 · Anrede „ich" oder „wir".** Der Alt-Auftritt schreibt „wir", das
Einzelunternehmen spricht oft mit „ich". Beide Fassungen liegen in
`ueber-uns.md` und `start.md`. Der Kunde wählt eine; sie gilt dann durchgehend
(nie gemischt).

**OP-8 · Firmierung.** „Ivo Mertsch" (Startseite/Footer) oder „Ivo Mertsch Design"
(Impressum)? Betrifft Logo, Schema.org-`name` und Footer. Hinweis: Im Impressum
steht rechtlich „Ivo Mertsch Design" (OP-4 bestätigt). Für Marke/Footer ist die
Entscheidung noch offen.

**OP-9 · Adresse „Lörrach".** Die Alt-Kontaktseite nennt „Lörrach" über der
tatsächlichen Adresse Schwörstadt. Kein zweiter Standort belegt. Bitte bestätigen,
dass Schwörstadt die einzige Betriebsadresse ist (oder Lörrach als zweiten
Standort nennen).

**OP-10 · Antwortzeit im Formular-Erfolgstext.** Der Vorschlag lautet „in der Regel
innerhalb von zwei Werktagen" — eine Regelfrist, keine Garantie. Kunde bestätigt
oder ersetzt sie.

## Block C — Technik/Fachliches

**OP-11 · Places-API aktivieren oder rein statischer Pfad? — GEKLÄRT.**
Kundenantwort (`950f0d46`): **nein** — kein Places-API-Abruf, rein statischer
Pfad. `content/reviews.json` bleibt die einzige Bewertungsquelle. Umgesetzt in
`content/site.json` (`reviews.places_api: "nein"`); ADR 0001, Abschnitt 10.2
bleibt damit ungenutzt.

**OP-12 · Statistik-Kategorie.** Im Consent-Vertrag reserviert, aber **kein**
Analyse-Werkzeug im Lieferumfang. Wünscht der Kunde Statistik, ist das eine neue
ADR mit neuem Performance-Budget (ADR 0001, Abschnitt 4.7).

**OP-13 · Aktualisierung des Leerzustands. — OFFEN.** Sobald echte Bewertungen
vorliegen, muss `content/reviews.json` befüllt werden. Kein manueller Schalter —
die Sektion wechselt datengetrieben (`reviews.length === 0` ⇒ Leerzustand, sonst
Liste). Bis dahin bleibt der Leerzustand aus `bewertungen.md` gültig.

**OP-14 · Produktions-Hosting/Docker-Betrieb + Auftragsverarbeitungsvertrag (AVV). — OFFEN.**
Die Website wird als eigener Docker-Container ausgeliefert. Für den
Produktivbetrieb legt der Kunde den **Hosting-Anbieter** fest und benennt ihn mit
**Name und Sitz**; außerdem die **Aufbewahrungsfrist der Server-Logs**. Betreibt der
Dienstleister den Container als Auftragsverarbeiter, kommt der
**Auftragsverarbeitungsvertrag nach Art. 28 DSGVO** hinzu. Die Angaben gehören in
`datenschutzerklaerung.md`, Abschnitt 3 („Empfänger / Auftragsverarbeitung", dort
als Freigabe-Hinweis ausgewiesen). Nicht Teil der Kundenantwort `950f0d46`; es
wird nichts angenommen.

## Nicht nummerierte, noch offene Punkte

- **Nennung der ausführenden Agentur im Impressum** (`impressum.md`, „Technische
  Umsetzung"): nur, wenn der Kunde sie wünscht.
- **`og:image`** (`seo-meta.md`): eigenes, lokal gehostetes Vorschaubild
  nachliefern (MARAA-5/11).

## Nicht offen, sondern belegt

- **Keine Bewertungen vorhanden:** CEO-Befund (golocal „Ivo Mertsch Design":
  0 Bewertungen, 0,0 Sterne). Der Leerzustand ist der Launch-Text.
- **Keine USt-IdNr. behaupten:** Die Alt-Seite sagt ausdrücklich „nicht vorhanden";
  der Kunde hat das bestätigt (OP-4).
- **Keine Referenzen/Auszeichnungen:** Es gibt keine belegbaren. Die Seiten zeigen
  Leistungen und KI-Bilder, keine Projekt- oder Kundennamen.
- **KI-Bilder:** sichtbar gekennzeichnet (ADR 0002). Wortlaut, Alt-Texte und
  Provenienz: `content/ki-bildhinweis.md`, `content/bild-provenienz.json`.
