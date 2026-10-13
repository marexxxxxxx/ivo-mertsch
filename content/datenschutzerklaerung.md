# Datenschutzerklärung (`/datenschutzerklaerung/`)

> **[PRÜFVERMERK — ABNAHMEKRITERIUM]** Diese Datenschutzerklärung ist ein Entwurf
> für die **neue** Website. Sie beschreibt die tatsächlich implementierte
> Consent-Architektur (ADR 0001, Abschnitt 4) und den Kontaktweg (ADR 0001,
> Abschnitt 6). Sie **muss vor Livegang von einem Rechtsanwalt bzw. einem
> IT-Recht-Dienstleister des Kunden final geprüft und freigegeben werden.** Ohne
> diese Freigabe darf die Seite nicht öffentlich erreichbar sein.
>
> Kritische Prüfpunkte: Verantwortlicher (OP-3 — die Alt-Seite nannte eine andere
> Person), Hosting-Anbieter (unten markiert), Aufbewahrungsfristen, Rechtsgrundlagen.
> Siehe `content/offene-kundenpunkte.md`.
>
> Stand des Entwurfs: 2026-10-13. Vorlage nicht aus der Alt-Seite übernommen — die
> Alt-Fassung beschrieb „Real Cookie Banner" und ein Hosting bei Strato, beides
> trifft auf die neue Lösung nicht mehr zu.

---

## 1. Verantwortlicher

Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:

Ivo Marco Mertsch
Ivo Mertsch Design
Niederdossenbach 1
79739 Schwörstadt
Deutschland
Telefon: +49 174 2164071
E-Mail: `info@ivo-mertsch.de`

`[OFFENER KUNDENPUNKT OP-3: Die Datenschutzerklärung des Alt-Auftritts nannte als
Verantwortlichen eine dritte Person („Marec Salzmann, Waldstraße 7, 79713 Bad
Säckingen") statt des Betreibers. Für die neue Seite ist der tatsächliche
Verantwortliche zu bestätigen — voraussichtlich Ivo Mertsch. Bis zur Bestätigung
nicht live stellen.]`

`[OFFENER KUNDENPUNKT OP-1: E-Mail-Adresse wie im Impressum; zentraler Wert in
`content/site.json`.]`

## 2. Ihre Rechte

Ihnen stehen gegenüber dem Verantwortlichen folgende Rechte zu:

- Auskunft über die verarbeiteten Daten (Art. 15 DSGVO),
- Berichtigung unrichtiger Daten (Art. 16 DSGVO),
- Löschung (Art. 17 DSGVO),
- Einschränkung der Verarbeitung (Art. 18 DSGVO),
- Widerspruch gegen die Verarbeitung (Art. 21 DSGVO),
- Datenübertragbarkeit (Art. 20 DSGVO),
- Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft (Art. 7 Abs. 3 DSGVO).

Zur Ausübung können Sie sich jederzeit an die oben genannten Kontaktdaten wenden.

**Beschwerderecht (Art. 77 DSGVO).** Zuständige Aufsichtsbehörde ist der
Landesbeauftragte für den Datenschutz und die Informationsfreiheit
Baden-Württemberg, Lautenschlagerstraße 20, 70173 Stuttgart.

`[PRÜFUNG: Anschrift der Aufsichtsbehörde vor Livegang aktualisieren. Die Alt-Seite
nannte „Postfach 10 29 32, 70025 Stuttgart"; die aktuelle Hausanschrift lautet
Lautenschlagerstraße 20, 70173 Stuttgart. Vom Rechtsprüfer bestätigen lassen.]`

## 3. Hosting und Server-Logs

Die Website wird in einem eigenen Container betrieben. Beim Aufruf der Seite
erhebt und speichert der ausliefernde Server automatisch:

- IP-Adresse des anfragenden Geräts,
- Datum und Uhrzeit des Zugriffs,
- die aufgerufene Seite bzw. Datei,
- die zuvor besuchte Seite (Referrer),
- Browsertyp und -version,
- Betriebssystem.

Diese Daten werden nicht mit anderen personenbezogenen Daten zusammengeführt.
Rechtsgrundlage ist das berechtigte Interesse an einem sicheren, stabilen und
fehlerfreien Betrieb (Art. 6 Abs. 1 lit. f DSGVO).

**Speicherdauer:** Die Server-Logs werden nach kurzer Frist automatisch gelöscht
(üblich sind 7–14 Tage), sofern kein Sicherheitsvorfall eine längere Aufbewahrung
erfordert.

**Empfänger / Auftragsverarbeitung:** `[OFFENER KUNDENPUNKT: Hosting-Anbieter und
Log-Aufbewahrungsfrist benennen. Der Kunde betreibt den Container voraussichtlich
bei einem Dienstleister; Name, Sitz und ggf. Auftragsverarbeitungsvertrag (Art. 28
DSGVO) müssen hier stehen. Die Alt-Seite nannte Strato AG — ob dieser Anbieter
bleibt, ist offen. Nicht raten.]`

## 4. Consent-Management (Einwilligung vor dem Laden externer Inhalte)

Die Website verwendet **keine** Cookies und lädt **keine** Inhalte von fremden
Servern, bevor Sie eingewilligt haben.

**Wie die Auswahl gespeichert wird.** Ihre Entscheidung wird ausschließlich lokal
in Ihrem Browser gespeichert (Schlüssel `pixelforge.consent.v1` im
`localStorage`). Sie enthält: Schema-Version, Gesamtstatus, die drei Kategorien,
Zeitstempel, die Art der Entscheidung und die Textfassung. Diese Angabe wird
**nicht** an einen Server und nicht an Dritte übertragen. Rechtsgrundlage ist
§ 25 Abs. 2 Nr. 2 TDDDG (technisch notwendige Speicherung zur Dokumentation der
Einwilligung).

**Kategorien:**

| Kategorie | Zweck | Zustand |
|---|---|---|
| Technisch notwendig | Auslieferung der Seite, Speicherung Ihrer Auswahl | immer aktiv, nicht abwählbar |
| Statistik | Anonyme Auswertung der Seitennutzung | zurzeit **kein** Werkzeug im Einsatz; Kategorie vorbereitet |
| Externe Medien | Nachladen fremder Inhalte, z. B. Google-Avatare in Bewertungen | nur nach Ihrer Zustimmung |

**Widerruf.** Sie können Ihre Auswahl jederzeit über den Eintrag
„Cookie-Einstellungen" im Fuß jeder Seite ändern. Nach einem Widerruf werden
bereits nachgeladene externe Inhalte aus der Seite entfernt. Der Nachweis Ihrer
Einwilligung bleibt lokal erhalten (dokumentiert den Widerruf), statt gelöscht zu
werden.

**Keine Drittanbieter vor der Einwilligung.** Vor Ihrer Zustimmung findet keine
Verbindung zu Google oder anderen Dritten statt. Es werden keine Cookies gesetzt
und keine Analyse-Daten übertragen.

## 5. Kontaktaufnahme

**a) Über das Formular.** Das Formular übermittelt Ihre Angaben serverseitig an
den Verantwortlichen. Erhoben werden: Name, E-Mail-Adresse, Nachricht und — wenn
Sie es angeben — eine Telefonnummer. Es gibt kein Adressfeld, kein Betrefffeld und
keine Newsletter-Anmeldung.

Das Formular selbst ist nicht einwilligungspflichtig (kein Tracking, kein Cookie).
Rechtsgrundlage ist die Bearbeitung Ihrer Anfrage (Art. 6 Abs. 1 lit. b DSGVO bei
Vertragsbezug, sonst Art. 6 Abs. 1 lit. f DSGVO). Spam-Schutz erfolgt serverseitig
ohne Drittanbieter (verstecktes Feld, Zeitprüfung, Ratenbegrenzung) — es werden
dabei keine Inhalte an Dritte übertragen.

**b) Über einen E-Mail-Link.** Nutzen Sie einen `mailto:`-Link oder den
mailto-Fallback des Formulars, öffnet sich Ihr E-Mail-Programm. Die von Ihnen
gesendeten Daten (E-Mail-Adresse, Name, Inhalt, ggf. Anhänge) verarbeiten wir zur
Bearbeitung Ihres Anliegens.

**Speicherdauer.** Ihre Anfrage wird gelöscht, sobald sie erledigt ist und keine
gesetzlichen Aufbewahrungspflichten (z. B. Handels- oder Steuerrecht) entgegenstehen.

## 6. Google-Bewertungen

Die Website zeigt Bewertungen aus Google Maps.

- Stammen die Bewertungen aus der Google Places API, werden sie über den eigenen
  Server bezogen und zwischengespeichert (maximal 30 Tage, danach erneut geladen).
  Dabei wird das Minimum der von Google bereitgestellten Felder verarbeitet.
- Autor der Bewertung, Sterne-Zahl, Datum und Text werden von unserem Server
  ausgeliefert — dafür ist keine Verbindung Ihres Browsers zu Google nötig.
- Ein **Profilbild (Avatar)**, das Google selbst hostet, wird erst geladen, wenn
  Sie die Kategorie „Externe Medien" freigegeben haben. Andernfalls zeigen wir
  lokale Initialen.
- Der **Link** auf eine Einzelbewertung bei Google erscheint immer. Ein Link ruft
  keine fremde Ressource ab, sondern wird erst durch Ihren Klick geöffnet.
- Attribution: „Bewertungen von Google Maps".

**Liegen keine Bewertungen vor** (aktueller Stand), zeigen wir keinen Inhalt von
Google. Dann wird auch keine Attribution angezeigt, weil kein Google-Inhalt
dargestellt wird.

## 7. Instagram

Die Website enthält einen einfachen Link auf unser Instagram-Profil. Es handelt
sich **nicht** um ein eingebettetes Plugin. Beim Besuch unserer Website werden
keine Daten an Instagram übertragen. Erst mit Ihrem Klick verlassen Sie unsere
Seite; ab dann gilt die Datenschutzerklärung von Meta Platforms Ireland Ltd.,
4 Grand Canal Square, Grand Canal Harbour, Dublin 2, Irland
(<https://privacycenter.instagram.com/policy>).

## 8. Schriftarten (Webfonts)

Wir verwenden ausschließlich lokal auf unserem eigenen Server gehostete
Schriftarten. Es findet **keine** Verbindung zu Servern von Drittanbietern (z. B.
Google Fonts) statt, auch nicht nach einer Einwilligung. Rechtsgrundlage ist das
berechtigte Interesse an einer einheitlichen, technisch einwandfreien Darstellung
(Art. 6 Abs. 1 lit. f DSGVO).

## 9. Keine Statistik, kein Tracking, keine Werbung

Es sind **keine** Analyse- oder Werbewerkzeuge im Einsatz. Die Statistik-Kategorie
im Einwilligungsdialog ist vorbereitet, aber ohne Funktion. Sollte künftig ein
cookieloses Statistikwerkzeug hinzukommen, wird diese Erklärung vorher ergänzt und
die Kategorie aktiv.

## 10. Keine Weitergabe an Dritte

Eine Übermittlung Ihrer Daten in Drittländer außerhalb der EU/des EWR findet nicht
statt, außer Sie rufen durch einen eigenen Klick einen externen Dienst auf (z. B.
Instagram, Google Maps). Ein Verkauf von Daten findet nicht statt.

## 11. Änderungen

Diese Datenschutzerklärung kann angepasst werden, wenn sich die Verarbeitung
ändert. Es gilt die jeweils auf der Website veröffentlichte Fassung.

`[FREIGABE NÖTIG: Textfassung im Consent-Datensatz (`textfassung`, z. B.
„2026-10-13.1") mit der veröffentlichten Fassung synchron halten. Ändert sich
dieser Text nach Freigabe, muss die Kennung mit erhöht werden.]`
