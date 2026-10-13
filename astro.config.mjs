// Astro-Konfiguration — MARAA-5, gegen ADR 0001 Abschnitt 3 (D1).
// output: 'server' + Node-Standalone-Adapter; jede Route entscheidet einzeln
// per `export const prerender`. Es gibt keinen zweiten Prozess.
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  site: "https://ivo-mertsch.de",
  output: "server",
  adapter: node({ mode: "standalone" }),
  // 'ignore': /api/healthz antwortet direkt mit 200 (ADR §8.2) und wird nicht auf
  // eine Slash-Variante umgeleitet. Die kanonische Form der Inhaltsseiten steht in
  // <link rel="canonical"> und in der Sitemap (mit abschliessendem Slash).
  trailingSlash: "ignore",
  build: {
    // Verzeichnis-URLs (/leistungen/fugenlose-bäder/index.html) passend zu den
    // kanonischen Pfaden aus content/seo-meta.md.
    format: "directory",
    inlineStylesheets: "auto",
  },
  server: { port: 4321, host: true },
  compressHTML: true,
  devToolbar: { enabled: false },
  // Kein Prefetch: jeder vorzeitige Request ist ein Request, den der Consent-
  // Vertrag nicht kennt. Sparsam ist hier auch datenschutzfreundlich.
  prefetch: false,
});
