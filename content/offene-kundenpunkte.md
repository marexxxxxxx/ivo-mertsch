# OFFENE KUNDENPUNKTE — Ivo-Mertsch-Relaunch (MARAA-3)

Jeder Punkt ist eine Frage an den Kunden. **Keine Annahme ist geraten.** Bis zur
Antwort steht im Content-Pack an der jeweiligen Stelle ein Marker
(`[OFFENER KUNDENPUNKT: …]` / `[FREIGABE NÖTIG: …]`).

## Block A — Muss vor Livegang geklärt sein

**OP-1 · Korrekte E-Mail-Adresse.** Der Alt-Auftritt nennt drei verschiedene:
`info@ivo-mertsch.de` (mailto der Startseite), `info@ivo-mertsch.com` (Footer aller
Seiten) und `ivomertsch@gmail.com` (Impressum, Kontaktseite, Kontaktseiten-Meta).
Welche ist die richtige, und welche soll sichtbar sein? Umsetzung: Wert steht
zentral in `content/site.json`; Versand läuft über `MAIL_TO`. Kein Textumbau nötig.

**OP-2 · Ziel des CTA „Jetzt bei Google bewerten".** Der Google-Maps-Eintrag des
Kunden muss verlinkt werden (`GOOGLE_REVIEW_URL`) und für die Places-API die
`GOOGLE_PLACE_ID`. Ohne Wert bleibt der CTA ausgeblendet (ADR 0001, Abschnitt 5.4);
der Leerzustandstext bleibt trotzdem sichtbar.

**OP-3 · Verantwortlicher in der Datenschutzerklärung.** Die alte
Datenschutzerklärung nennt als Verantwortlichen **nicht** den Betreiber, sondern
eine dritte Person („Marec Salzmann, Waldstraße 7, 79713 Bad Säckingen,
marecsalzm@gmail.com" — vermutlich der Ersteller der Alt-Seite). Für die neue
Seite muss der tatsächliche Verantwortliche (Ivo Mertsch, Niederdossenbach 1,
79739 Schwörstadt) bestätigt und die Alt-Angabe ersetzt werden. Siehe
`datenschutzerklaerung.md`, Abschnitt 1.

**OP-4 · Impressums-Pflichtangaben bestätigen.** Die Alt-Seite enthält:
Diensteanbieter „Ivo Marco Mertsch / Ivo Mertsch Design", keine Registereintragung,
**keine** USt-IdNr./W-IdNr. (ausdrücklich „nicht vorhanden"), Berufsbezeichnung
„Handwerksbetrieb", zuständige Kammer Handwerkskammer Freiburg, berufsrechtliche
Regelung HwO, keine Verbraucherschlichtung. Bitte bestätigen, dass diese Angaben
**heute noch** zutreffen (insbesondere: keine USt-IdNr., kein Eintrag in der
Handwerksrolle mit abweichender Bezeichnung). Siehe `impressum.md`.

**OP-5 · Rechtsseiten fallen unter den Prüfvermerk.** Impressum und
Datenschutzerklärung müssen vor Livegang von einem Kundenanwalt bzw.
IT-Recht-Dienstleister final geprüft werden (Abnahmekriterium, im jeweiligen
Dokument vermerkt).

**OP-6 · Nutzungsrechte an Bildern und Logo.** Verwendet werden
`foto3.png`, `foto6.png`, `foto7.png`, `foto8.png`, `foto9.png`, `foto10.png`,
`foto11.png` und `logo_ivo.jpeg` (alle aus dem Alt-Auftritt,
`wp-content/uploads/`). Download und technische Aufbereitung (AVIF/WebP) klären
MARAA-4/5; die **Rechte** an den Aufnahmen muss der Kunde bestätigen.

## Block B — Text-/Auftritts-Entscheidungen des Kunden

**OP-7 · Anrede „ich" oder „wir".** Der Alt-Auftritt schreibt „wir", das
Einzelunternehmen spricht oft mit „ich". Beide Fassungen liegen in
`ueber-uns.md` und `start.md`. Der Kunde wählt eine; sie gilt dann durchgehend
(nie gemischt).

**OP-8 · Firmierung.** „Ivo Mertsch" (Startseite/Footer) oder „Ivo Mertsch Design"
(Impressum)? Betrifft Logo, Schema.org-`name` und Footer.

**OP-9 · Adresse „Lörrach".** Die Alt-Kontaktseite nennt „Lörrach" über der
tatsächlichen Adresse Schwörstadt. Kein zweiter Standort belegt. Bitte bestätigen,
dass Schwörstadt die einzige Betriebsadresse ist (oder Lörrach als zweiter
Standort nennen).

**OP-10 · Antwortzeit im Formular-Erfolgstext.** Der Vorschlag lautet „in der Regel
innerhalb von zwei Werktagen" — eine Regelfrist, keine Garantie. Kunde bestätigt
oder ersetzt sie.

## Block C — Technik/Fachliches (teils CEO-entschieden, teils offen)

**OP-11 · Places-API aktivieren oder rein statischer Pfad?** Die Places-API wäre
Quelle B (Live-Bewertungen). Klärung: EEA-ToS (Rechnungsadresse in Deutschland),
Kosten, Freischaltung (ADR 0001, Abschnitt 10.2). Bis dahin liefert Phase 1 den
statischen Leerzustand (`content/reviews.json`).

**OP-12 · Statistik-Kategorie.** Im Consent-Vertrag reserviert, aber **kein**
Analyse-Werkzeug im Lieferumfang. Wünscht der Kunde Statistik, ist das eine neue
ADR mit neuem Performance-Budget (ADR 0001, Abschnitt 4.7).

**OP-13 · Aktualisierung des Leerzustands.** Sobald echte Bewertungen vorliegen,
muss `content/reviews.json` (oder die API) befüllt werden. Kein manueller Schalter
— die Sektion wechselt datengetrieben.

## Nicht offen, sondern belegt

- **Keine Bewertungen vorhanden:** CEO-Befund (golocal „Ivo Mertsch Design":
  0 Bewertungen, 0,0 Sterne). Der Leerzustand ist der Launch-Text.
- **Keine USt-IdNr. behaupten:** Die Alt-Seite sagt ausdrücklich „nicht vorhanden";
  die neue Seite übernimmt diese Aussage nur nach OP-4-Bestätigung.
- **Keine Referenzen/Auszeichnungen:** Es gibt keine belegbaren. Die Seiten zeigen
  Leistungen und Bilder, keine Projekt- oder Kundennamen.
