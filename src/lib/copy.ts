/**
 * UI-Copy — wörtlich aus dem Content-Pack (MARAA-3).
 *
 * Kein Text in diesem Modul ist erfunden. Jeder Wert verweist auf seine Quelle.
 * Wenn ein Text im Content-Pack fehlt, wird er hier NICHT ergaenzt, sondern der
 * jeweilige Slot bleibt leer (Leer-/Fallback-Regel der Komponente).
 *
 * Quellen:
 *  - content/micro-ux-consent.md  (Labels, Fehler, Zustaende, Consent)
 *  - content/bewertungen.md       (Bewertungs-Sektion, beide Zustaende)
 *  - content/kontakt.md           (Kontaktwege, Erfolgs-/Leertexte)
 *  - content/site.json            (Stammdaten)
 */

/** content/micro-ux-consent.md — Formular-Labels, Platzhalter, Hilfetexte. */
export const FORM_LABELS = {
  name: "Ihr Name",
  email: "Ihre E-Mail-Adresse",
  telefon: "Telefon (optional)",
  nachricht: "Ihr Anliegen",
  einwilligung: "Ich habe die Datenschutzerklärung gelesen.",
  submit: "Anfrage senden",
  pflichtfeld: "Pflichtfeld",
} as const;

export const FORM_PLACEHOLDERS = {
  email: "name@beispiel.de",
  telefon: "z. B. 07742 123456",
} as const;

export const FORM_HELP = {
  email: "Pflichtfeld. Wir nutzen die Adresse nur, um Ihnen zu antworten.",
  telefon: "Nur, wenn wir Sie zurückrufen sollen.",
  nachricht: "Was soll ich mir ansehen? Ort, Raum und gewünschter Zeitraum helfen mir.",
  einwilligung: "Pflichtfeld.",
} as const;

/** content/micro-ux-consent.md — Fehlertexte (Feld-Ebene). */
export const FORM_ERRORS = {
  name: "Bitte tragen Sie Ihren Namen ein.",
  emailEmpty: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
  emailInvalid: "Diese E-Mail-Adresse sieht nicht vollständig aus. Beispiel: name@firma.de",
  telefonInvalid:
    "Bitte prüfen Sie die Telefonnummer — Zahlen, Leerzeichen und ein führendes + sind möglich.",
  nachrichtEmpty: "Bitte schreiben Sie kurz, worum es geht.",
  nachrichtShort: "Ihre Nachricht ist noch sehr kurz. Ein Satz genügt schon.",
  einwilligung:
    "Bitte bestätigen Sie die Datenschutzerklärung, damit ich Ihre Anfrage bearbeiten darf.",
  server: "Das hat nicht geklappt. Bitte versuchen Sie es erneut oder rufen Sie an: +49 174 2164071.",
  rateLimited:
    "Sie haben gerade mehrere Anfragen gesendet. Bitte warten Sie einen Moment — oder rufen Sie einfach an: +49 174 2164071.",
  summaryTitle: "Bitte prüfen Sie die markierten Felder.",
} as const;

/** content/micro-ux-consent.md — Zustaende des Formulars. */
export const FORM_STATES = {
  loading: "Wird gesendet…",
  success: "Anfrage gesendet. Ich melde mich in der Regel innerhalb von zwei Werktagen.",
  successMailto: "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte senden Sie sie dort ab.",
  noscript:
    "Ohne JavaScript steht das Formular nicht zur Übermittlung bereit. Bitte rufen Sie an: +49 174 2164071 — oder schreiben Sie eine E-Mail.",
} as const;

/** content/micro-ux-consent.md — Consent-Dialog. */
export const CONSENT_COPY = {
  title: "Datenschutz-Einstellungen",
  intro:
    "Diese Website verwendet keine Cookies und lädt nichts von fremden Servern, bevor Sie zustimmen. " +
    "Technisch notwendige Funktionen brauchen keine Einwilligung. Alles andere schalten Sie selbst frei — " +
    "und können es jederzeit wieder ändern. Details: Datenschutzerklärung.",
  acceptAll: "Alle akzeptieren",
  onlyNecessary: "Nur notwendige",
  settings: "Einstellungen",
  saveSelection: "Auswahl speichern",
  footerEntry: "Cookie-Einstellungen",
  storageNotice:
    "Ihre Entscheidung wird nur lokal in Ihrem Browser gespeichert — nicht auf einem Server und nicht bei Dritten.",
  revokeNotice:
    `Sie können diese Einstellungen jederzeit über „Cookie-Einstellungen" im Fuß jeder Seite ändern.`,
  currentTitle: "Ihre aktuelle Auswahl",
  categories: {
    essenziell: {
      title: "Technisch notwendig",
      description:
        "Diese Funktionen liefern die Seite aus und speichern Ihre Auswahl. Sie lassen sich nicht abschalten.",
    },
    statistik: {
      title: "Statistik",
      description:
        "Zählt anonym, welche Seiten gelesen werden. Hilft, die Seite zu verbessern. " +
        "Zurzeit nicht im Einsatz — die Kategorie ist vorbereitet.",
    },
    externe_medien: {
      title: "Externe Medien",
      description:
        "Lädt Inhalte von anderen Servern, z. B. Google-Bewertungen mit Profilbildern. " +
        "Vor Ihrer Zustimmung wird keine Verbindung zu Google aufgebaut.",
    },
  },
} as const;

/** content/bewertungen.md — Zustand B (Leerzustand, Launch-Text). */
export const REVIEWS_COPY = {
  h1Empty: "Bewertungen",
  h1Filled: "Was Kundinnen und Kunden über die Arbeit sagen.",
  introFilled:
    "Die folgenden Bewertungen stammen von Nutzerinnen und Nutzern von Google Maps. " +
    "Sie geben die persönliche Meinung der jeweiligen Person wieder — nicht die Bewertung durch uns.",
  emptyText:
    "Aktuell liegen uns keine Google-Bewertungen für die Anzeige vor.\n\n" +
    "Das lässt sich ändern: Wenn Sie mit meiner Arbeit zufrieden waren, freue ich mich über Ihre " +
    "Bewertung bei Google. Sie hilft anderen in der Region, eine Entscheidung zu treffen.",
  attribution: "Bewertungen von Google Maps",
  ctaReview: "Jetzt bei Google bewerten",
  ctaContact: "Beratung anfragen",
  ctaContactEmpty: "Zufrieden? Schreiben Sie mir.",
  reviewLink: "Bewertung bei Google ansehen",
  googlePrivacyTitle: "Wie Google Bewertungen prüft",
  googlePrivacy:
    "Google erhebt Bewertungen über Google Maps. Google kontrolliert Beiträge automatisch auf Verstöße " +
    "gegen seine Richtlinien und entfernt auffällige Bewertungen. Einzelne Bewertungen werden dabei nicht " +
    "auf ihren Wahrheitsgehalt geprüft; sie geben die persönliche Meinung der jeweiligen Person wieder.",
  standPrefix: "Stand:",
} as const;

/** content/kontakt.md — Kontaktwege und Adresse. */
export const CONTACT_COPY = {
  h1: "Erzählen Sie mir von Ihrem Vorhaben — den Rest klären wir im Gespräch.",
  sub: "Telefon, WhatsApp, E-Mail oder Formular — suchen Sie sich den Weg aus, der Ihnen am liebsten ist.",
  callLabel: "Anrufen",
  whatsapp: "WhatsApp schreiben",
  email: "E-Mail schreiben",
  formAnchor: "formular",
  formHeading: "Anfrage senden",
  waysHeading: "Kontaktwege",
  addressHeading: "Adresse",
  externalHint: "(öffnet einen externen Dienst)",
} as const;

/** content/micro-ux-consent.md — Leere Zustaende site-weit. */
export const EMPTY_STATES = {
  notFound: "Diese Seite gibt es nicht (mehr).",
  notFoundCta: "Zur Startseite",
  noFilterResult: "Für diese Auswahl gibt es gerade kein Projekt.",
  showAll: "Zeigen Sie alle Leistungen",
} as const;

/** content/start.md / leistungen.md — seitenuebergreifende CTA-Texte. */
export const CTA_COPY = {
  primary: "Beratung anfragen",
  call: "Anrufen: +49 174 2164071",
  whatsapp: "WhatsApp schreiben",
  ctaBandHeading: "Projekt vor? Ich höre zu und sage Ihnen, was möglich ist.",
} as const;
