/**
 * Bewertungen zur Laufzeit (Quelle B / Places-Proxy) — NUR von `output: 'server'`-
 * Routen importieren. Dieses Modul liest `process.env`, deshalb ist ein Import in
 * einer `prerender = true`-Route ein Review-Blocker (ADR §3, §11.4).
 *
 * Google-Places-Policy (ADR §5.6): minimales Feldset, Datei-Cache = Inhalts-Cache
 * (nicht Site-Inhalt), harte Obergrenze 30 Tage, `place_id` als einziger dauerhaft
 * speicherbarer Wert. API-Fehler lassen die Seite NIE scheitern — sie ergeben den
 * Leerzustand.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildEmptyDocument, normalize, type ReviewsDocument } from "./reviews";
import { readStaticReviews } from "./content";

export const MAX_CACHE_TTL_S = 2592000; // 30 Tage
export const DEFAULT_CACHE_TTL_S = 3600;

/** Bewusst minimales Feldset (ADR §5.2) — jedes Feld ist ein Abrechnungsposten. */
export const PLACES_FIELD_MASK = "id,displayName,rating,userRatingCount,reviews,googleMapsUri";

export interface ReviewsRuntimeConfig {
  source: "static_export" | "places_api";
  apiKey: string;
  placeId: string;
  reviewUrl: string;
  cacheTtlS: number;
  cacheDir: string;
}

export type EnvLike = Record<string, string | undefined>;

/**
 * Liest die Laufzeitkonfiguration. Ein Cache-TTL ueber der harten Obergrenze ist
 * ein Startup-Fehler, kein stiller Fallback (ADR §5.6 #2).
 */
export function readReviewsConfig(env: EnvLike = process.env): ReviewsRuntimeConfig {
  const rawTtl = env.REVIEWS_CACHE_TTL_S;
  const cacheTtlS = rawTtl === undefined || rawTtl === "" ? DEFAULT_CACHE_TTL_S : Number(rawTtl);
  if (!Number.isFinite(cacheTtlS) || cacheTtlS < 0 || cacheTtlS > MAX_CACHE_TTL_S) {
    throw new Error(
      `REVIEWS_CACHE_TTL_S ungueltig: ${String(rawTtl)} (erlaubt 0..${MAX_CACHE_TTL_S} Sekunden)`,
    );
  }
  return {
    source: env.REVIEWS_SOURCE === "places_api" ? "places_api" : "static_export",
    apiKey: env.GOOGLE_PLACES_API_KEY ?? "",
    placeId: env.GOOGLE_PLACE_ID ?? "",
    reviewUrl: env.GOOGLE_REVIEW_URL ?? "",
    cacheTtlS,
    cacheDir: env.REVIEWS_CACHE_DIR && env.REVIEWS_CACHE_DIR.length > 0 ? env.REVIEWS_CACHE_DIR : ".cache",
  };
}

export type ReviewsErrorReason =
  | "static_source"
  | "missing_credentials"
  | "cache_miss_fetch_error"
  | "invalid_response";

export interface ReviewsResult {
  document: ReviewsDocument;
  cached: boolean;
  reason?: ReviewsErrorReason;
}

interface CacheFile {
  fetchedAt: string;
  payload: unknown;
}

function cacheFilePath(config: ReviewsRuntimeConfig): string {
  return join(process.cwd(), config.cacheDir, "reviews-cache.json");
}

function readCache(config: ReviewsRuntimeConfig): CacheFile | null {
  try {
    const file = cacheFilePath(config);
    if (!existsSync(file)) return null;
    return JSON.parse(readFileSync(file, "utf8")) as CacheFile;
  } catch {
    return null;
  }
}

function cacheAgeSeconds(file: CacheFile): number {
  const fetchedAt = Date.parse(file.fetchedAt);
  if (!Number.isFinite(fetchedAt)) return Number.POSITIVE_INFINITY;
  return (Date.now() - fetchedAt) / 1000;
}

function writeCache(config: ReviewsRuntimeConfig, payload: unknown): void {
  try {
    const file = cacheFilePath(config);
    mkdirSync(join(process.cwd(), config.cacheDir), { recursive: true });
    const data: CacheFile = { fetchedAt: new Date().toISOString(), payload };
    writeFileSync(file, JSON.stringify(data), "utf8");
  } catch {
    // Ein nicht schreibbarer Cache ist kein Grund, die Anfrage scheitern zu lassen.
  }
}

async function fetchPlace(
  config: ReviewsRuntimeConfig,
  fetchImpl: typeof fetch,
): Promise<unknown | null> {
  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(config.placeId)}`);
  url.searchParams.set("languageCode", "de");
  try {
    const response = await fetchImpl(url, {
      headers: {
        "X-Goog-Api-Key": config.apiKey,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as unknown;
  } catch {
    return null;
  }
}

/**
 * Liefert das normalisierte Bewertungsdokument.
 * - Quelle A (Default): statischer Export, sonst Leerzustand.
 * - Quelle B: Cache (frisch) -> Places-Abruf -> alter Cache als Gnadenpfad -> Leerzustand.
 */
export async function getReviewsDocument(
  env: EnvLike = process.env,
  fetchImpl: typeof fetch = fetch,
  now?: string,
): Promise<ReviewsResult> {
  const config = readReviewsConfig(env);

  if (config.source !== "places_api" || config.apiKey === "" || config.placeId === "") {
    return {
      document: readStaticReviews(now),
      cached: false,
      reason: config.source === "places_api" ? "missing_credentials" : "static_source",
    };
  }

  const cachedFile = readCache(config);
  if (cachedFile && cacheAgeSeconds(cachedFile) <= config.cacheTtlS) {
    return {
      document: normalize(cachedFile.payload, { quelle: "places_api", now }),
      cached: true,
    };
  }

  const payload = await fetchPlace(config, fetchImpl);
  if (payload) {
    writeCache(config, payload);
    return {
      document: normalize(payload, { quelle: "places_api", now }),
      cached: false,
    };
  }

  if (cachedFile) {
    // Gnadenpfad: lieber ein alter, als gar kein Korpus. Kein Fehler nach aussen.
    return {
      document: normalize(cachedFile.payload, { quelle: "places_api", now }),
      cached: true,
      reason: "cache_miss_fetch_error",
    };
  }

  return {
    document: buildEmptyDocument("places_api", { now }),
    cached: false,
    reason: "cache_miss_fetch_error",
  };
}
