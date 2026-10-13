/**
 * /sitemap.xml — die elf Inhaltsseiten (neun Inhaltsseiten + zwei Rechtsseiten)
 * ohne die on-demand-API-Routen. Vorgerendert (prerender = true).
 */
import type { APIRoute } from "astro";
import { ALL_ROUTES, absoluteUrl } from "../lib/pages";

export const prerender = true;

export const GET: APIRoute = () => {
  const urls = ALL_ROUTES.map((route) => {
    return [
      "  <url>",
      `    <loc>${absoluteUrl(route.path)}</loc>`,
      `    <changefreq>${route.changeFrequency}</changefreq>`,
      `    <priority>${route.priority.toFixed(1)}</priority>`,
      "  </url>",
    ].join("\n");
  }).join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: { "content-type": "application/xml; charset=utf-8" },
  });
};
