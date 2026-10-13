/**
 * Informationsarchitektur, SEO-Meta und Navigation — eine Quelle fuer Routing,
 * Navigation, Breadcrumbs und Sitemap.
 *
 * Titel und Beschreibungen sind woertlich aus content/seo-meta.md (MARAA-3).
 * Pfade tragen den abschliessenden Slash und die sichtbaren Umlaute wie in der IA.
 */

export const SITE_ORIGIN = "https://ivo-mertsch.de";

export interface RouteSeo {
  id: string;
  path: string;
  title: string;
  description: string;
  /** Prioritaet fuer die Sitemap (Rechtsseiten niedrig). */
  priority: number;
  changeFrequency: "monthly" | "yearly";
}

export const ROUTES = {
  home: {
    id: "home",
    path: "/",
    title: "Fugenlose Bäder & Böden aus Schwörstadt | Ivo Mertsch",
    description:
      "Ivo Mertsch aus Schwörstadt: fugenlose Bäder und Böden, Innenausbau und Fassadengestaltung. Beratung, Planung und Abwicklung aus einer Hand.",
    priority: 1,
    changeFrequency: "monthly",
  },
  leistungen: {
    id: "leistungen",
    path: "/leistungen/",
    title: "Leistungen – Bad, Boden, Innenausbau, Fassade | Ivo Mertsch",
    description:
      "Vier Leistungen, ein Ansprechpartner: fugenlose Bäder, fugenlose Böden, Innenausbau und Fassadengestaltung aus Schwörstadt im Landkreis Waldshut.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  baeder: {
    id: "baeder",
    path: "/leistungen/fugenlose-bäder/",
    title: "Fugenlose Bäder – 2K-Beschichtung | Ivo Mertsch Schwörstadt",
    description:
      "Fugenlose Bäder aus 2K-Beschichtung für Nassbereiche: Wände und Böden ohne Fugen. Handwerk aus Schwörstadt – jetzt Beratung für Ihr Bad anfragen.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  boeden: {
    id: "boeden",
    path: "/leistungen/fugenlose-böden/",
    title: "Fugenlose Böden – matt, seidenglänzend, glänzend | Mertsch",
    description:
      "Fugenlose Böden in matt, seidenglänzend oder glänzend – für Innenräume, Garagen, Balkone und den Außenbereich. Handwerk aus Schwörstadt für Ihre Fläche.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  innenausbau: {
    id: "innenausbau",
    path: "/leistungen/innenausbau/",
    title: "Innenausbau Schwörstadt – Sanierung & Neubau | Ivo Mertsch",
    description:
      "Innenausbau aus Schwörstadt: Renovierung, Sanierung, Neubau und Modernisierung. Ein Ansprechpartner für alle Bereiche – von der Planung bis zur Abnahme.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  fassaden: {
    id: "fassaden",
    path: "/leistungen/fassaden/",
    title: "Fassaden – mit & ohne Dämmung aus Schwörstadt | Ivo Mertsch",
    description:
      "Fassaden-Neugestaltung mit oder ohne Dämmung, Anstriche im Denkmalschutz. Handwerk aus Schwörstadt für langanhaltend schöne Fassaden – jetzt anfragen.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  ueberUns: {
    id: "ueber-uns",
    path: "/über-uns/",
    title: "Über uns – Handwerk aus Leidenschaft | Ivo Mertsch",
    description:
      "Ivo Mertsch, Handwerk aus Leidenschaft aus Schwörstadt: Beratung, Planung und Abwicklung für Bad, Boden, Innenausbau und Fassade. Lernen Sie uns kennen.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  bewertungen: {
    id: "bewertungen",
    path: "/bewertungen/",
    title: "Bewertungen – Erfahrungen aus Schwörstadt | Ivo Mertsch",
    description:
      "Bewertungen von Google Maps für Ivo Mertsch aus Schwörstadt – plus die Möglichkeit, jetzt selbst eine Bewertung abzugeben und so anderen zu helfen.",
    priority: 0.7,
    changeFrequency: "monthly",
  },
  kontakt: {
    id: "kontakt",
    path: "/kontakt/",
    title: "Kontakt – Beratung anfragen in Schwörstadt | Ivo Mertsch",
    description:
      "Kontakt zu Ivo Mertsch in Schwörstadt: anrufen, WhatsApp schreiben oder eine Anfrage senden. Beratung für Bad, Boden, Innenausbau und Fassade anfragen.",
    priority: 0.9,
    changeFrequency: "monthly",
  },
  impressum: {
    id: "impressum",
    path: "/impressum/",
    title: "Impressum – Ivo Mertsch, Handwerker aus Schwörstadt",
    description:
      "Impressum und Anbieterkennzeichnung gemäß § 5 DDG: Ivo Marco Mertsch, Ivo Mertsch Design, Niederdossenbach 1, 79739 Schwörstadt, Deutschland.",
    priority: 0.3,
    changeFrequency: "yearly",
  },
  datenschutz: {
    id: "datenschutz",
    path: "/datenschutzerklaerung/",
    title: "Datenschutzerklärung – Ivo Mertsch aus Schwörstadt",
    description:
      "Datenschutzerklärung der Website von Ivo Mertsch aus Schwörstadt: Server-Logs, Kontaktformular, Google-Bewertungen und das Consent-Management ohne Cookies.",
    priority: 0.3,
    changeFrequency: "yearly",
  },
} as const satisfies Record<string, RouteSeo>;

export type RouteKey = keyof typeof ROUTES;

export const ALL_ROUTES: RouteSeo[] = Object.values(ROUTES);

export const NAV_LEISTUNGEN: RouteSeo[] = [
  ROUTES.baeder,
  ROUTES.boeden,
  ROUTES.innenausbau,
  ROUTES.fassaden,
];

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const PRIMARY_NAV: NavItem[] = [
  {
    label: "Leistungen",
    href: ROUTES.leistungen.path,
    children: NAV_LEISTUNGEN.map((route) => ({ label: serviceLabel(route.id), href: route.path })),
  },
  { label: "Über uns", href: ROUTES.ueberUns.path, children: undefined },
  { label: "Bewertungen", href: ROUTES.bewertungen.path, children: undefined },
  { label: "Kontakt", href: ROUTES.kontakt.path, children: undefined },
];

export function serviceLabel(id: string): string {
  switch (id) {
    case "baeder":
      return "Fugenlose Bäder";
    case "boeden":
      return "Fugenlose Böden";
    case "innenausbau":
      return "Innenausbau";
    case "fassaden":
      return "Fassaden";
    default:
      return id;
  }
}

export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

/** Breadcrumb-Kette (Start › Leistungen › …) fuer die Breadcrumb-Komponente. */
export interface Crumb {
  label: string;
  href: string;
}

export const LEISTUNGEN_CRUMB: Crumb = { label: "Leistungen", href: ROUTES.leistungen.path };

export function serviceCrumbs(route: RouteSeo): Crumb[] {
  return [
    { label: "Start", href: ROUTES.home.path },
    LEISTUNGEN_CRUMB,
    { label: serviceLabel(route.id), href: route.path },
  ];
}
