/**
 * Bewertungen — Normalisierung, Quellenaufloesung, Leerzustands-Praedikat.
 *
 * Vertrag: docs/contracts/reviews.schema.json und ADR 0001 §5.
 * Kernregel: Der Renderer kennt nur das Normalformat. Der statische Export
 * (Quelle A) und die Places-API (Quelle B) laufen durch dieselbe `normalize()`.
 * Es werden keine Bewertungen erfunden; der Leerzustand ist ein regulaerer Zustand.
 */

/** Performance-Budget, nicht Datenlimit (reviews.schema.json maxItems 50). */
export const MAX_REVIEWS = 50;

export type AvatarStatus = "none" | "initials" | "google";
export type ReviewsSource = "static_export" | "places_api";

export interface NormalizedReview {
  id?: string;
  autor: string;
  sterne: number;
  datum: string;
  text: string;
  avatar_status: AvatarStatus;
  avatar_url?: string | null;
  profil_link: string | null;
  review_time: number;
  sprache?: string;
}

export interface ReviewsPlace {
  place_id: string;
  name?: string;
  place_url: string;
}

export interface ReviewsDocument {
  reviews: NormalizedReview[];
  quelle: ReviewsSource;
  aktualisiert_am: string;
  leer: boolean;
  ort?: ReviewsPlace;
  sortierung_hinweis?: string;
}

/** Verbindlicher Text aus content/bewertungen.md (#Sortierungs-Hinweis). */
export const DEFAULT_SORTIER_HINWEIS =
  "Angezeigt werden die Bewertungen in der Reihenfolge, die Google Maps vorgibt " +
  "(Standard: Relevanz). Es werden keine Bewertungen ausgefiltert.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

export function isoDayFromEpoch(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  return new Date(safe * 1000).toISOString().slice(0, 10);
}

export function epochSecondsFromIso(iso: string): number {
  const parsed = Date.parse(iso);
  return Number.isFinite(parsed) ? Math.floor(parsed / 1000) : 0;
}

/** Stabile lokale ID, wenn die Quelle keine mitliefert (ADR §5.3). */
function deriveId(autor: string, reviewTime: number): string {
  let hash = 0;
  const seed = `${autor}|${reviewTime}`;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 2147483647;
  }
  return `rev-${reviewTime}-${hash.toString(36)}`;
}

function normalizeSterne(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > 5) return null;
  return value;
}

/**
 * Google-Places-Review (v1) erkennen: nur diese Form traegt `authorAttribution`.
 */
function isPlacesReview(value: unknown): boolean {
  return isRecord(value) && isRecord(value.authorAttribution);
}

/**
 * `normalizeReview()` — verbindliche Abbildung (ADR §5.3).
 * Unbrauchbare Datensaetze ergeben `null` und werden verworfen, nicht angezeigt.
 */
export function normalizeReview(raw: unknown): NormalizedReview | null {
  if (!isRecord(raw)) return null;

  let autor: string | null;
  let sterne: number | null;
  let reviewTime: number;
  let text: string | null;
  let avatarStatus: AvatarStatus;
  let avatarUrl: string | null = null;
  let profilLink: string | null = null;
  let sprache: string | undefined;

  if (isPlacesReview(raw)) {
    const author = isRecord(raw.authorAttribution) ? raw.authorAttribution : {};
    autor = asString(author.displayName);
    sterne = normalizeSterne(raw.rating);
    const publishTime = asString(raw.publishTime);
    reviewTime = publishTime ? epochSecondsFromIso(publishTime) : 0;
    const textNode = isRecord(raw.text) ? raw.text : null;
    text = textNode ? asString(textNode.text) : asString(raw.originalText);
    const photoUri = asString(author.photoUri);
    if (photoUri) {
      avatarStatus = "google";
      avatarUrl = photoUri;
    } else {
      avatarStatus = "initials";
    }
    profilLink = asString(author.uri);
    const language = asString(raw.originalLanguage) ?? asString(raw.languageCode);
    if (language && /^[a-z]{2}$/.test(language)) sprache = language;
  } else {
    // Bereits normalisiertes Format (statischer Export) — laeuft trotzdem durch
    // dieselbe Pruefung, damit beide Pfade identisches HTML erzeugen.
    autor = asString(raw.autor);
    sterne = normalizeSterne(raw.sterne);
    const datum = asString(raw.datum);
    const rawTime = raw.review_time;
    reviewTime =
      typeof rawTime === "number" && Number.isFinite(rawTime) && rawTime >= 0
        ? Math.floor(rawTime)
        : datum
          ? epochSecondsFromIso(datum)
          : 0;
    text = asString(raw.text);
    const rawStatus = raw.avatar_status;
    avatarStatus = rawStatus === "google" || rawStatus === "none" ? rawStatus : "initials";
    const rawUrl = asString(raw.avatar_url);
    if (avatarStatus === "google") {
      if (!rawUrl) return null; // Schema: google erfordert avatar_url.
      avatarUrl = rawUrl;
    } else {
      avatarUrl = null;
    }
    profilLink = asString(raw.profil_link);
    const rawSprache = asString(raw.sprache);
    if (rawSprache && /^[a-z]{2}$/.test(rawSprache)) sprache = rawSprache;
  }

  if (!autor || !text || sterne === null) return null;

  const review: NormalizedReview = {
    autor,
    sterne,
    datum: isoDayFromEpoch(reviewTime),
    text,
    avatar_status: avatarStatus,
    avatar_url: avatarUrl,
    profil_link: profilLink,
    review_time: reviewTime,
  };
  const rawId = asString(raw.id);
  review.id = rawId ?? deriveId(autor, reviewTime);
  if (sprache) review.sprache = sprache;
  return review;
}

function normalizeSortierung(raw: unknown): string {
  const text = asString(raw);
  return text ?? DEFAULT_SORTIER_HINWEIS;
}

function normalizeAktualisiertAm(raw: unknown, fallbackIso: string): string {
  const text = asString(raw);
  if (text && Number.isFinite(Date.parse(text))) return new Date(text).toISOString();
  return fallbackIso;
}

export interface NormalizeOptions {
  quelle: ReviewsSource;
  /** Zeitpunkt der Beschaffung, wenn die Quelle keinen mitliefert. */
  now?: string;
}

export interface EmptyDocumentOverrides {
  now?: string;
  sortierung_hinweis?: string;
}

/** Verbindlicher Leerzustand (ADR §5.4). */
export function buildEmptyDocument(quelle: ReviewsSource, overrides: EmptyDocumentOverrides = {}): ReviewsDocument {
  return {
    reviews: [],
    quelle,
    aktualisiert_am: overrides.now ?? new Date().toISOString(),
    leer: true,
    sortierung_hinweis: overrides.sortierung_hinweis ?? DEFAULT_SORTIER_HINWEIS,
  };
}

/**
 * Ein Normalformat, zwei Quellen.
 * Akzeptiert sowohl ein Dokument (statischer Export) als auch eine
 * Places-Antwort (Place-Objekt mit `reviews`). Sortiert kanonisch nach
 * `review_time` absteigend und begrenzt auf MAX_REVIEWS.
 */
export function normalize(input: unknown, options: NormalizeOptions): ReviewsDocument {
  const now = options.now ?? new Date().toISOString();
  if (!isRecord(input)) return buildEmptyDocument(options.quelle, { now });

  const rawReviews = Array.isArray(input.reviews) ? input.reviews : [];
  const reviews = rawReviews
    .map((entry) => normalizeReview(entry))
    .filter((entry): entry is NormalizedReview => entry !== null)
    .sort((a, b) => b.review_time - a.review_time)
    .slice(0, MAX_REVIEWS);

  const document: ReviewsDocument = {
    reviews,
    quelle: options.quelle,
    aktualisiert_am: normalizeAktualisiertAm(input.aktualisiert_am, now),
    leer: reviews.length === 0,
    sortierung_hinweis: normalizeSortierung(input.sortierung_hinweis),
  };

  if (options.quelle === "places_api") {
    const place = buildPlace(input);
    if (place) document.ort = place;
  }
  return document;
}

function buildPlace(input: Record<string, unknown>): ReviewsPlace | null {
  const rawOrt = isRecord(input.ort) ? input.ort : input;
  const placeId = asString(rawOrt.place_id) ?? asString(rawOrt.id);
  const placeUrl = asString(rawOrt.place_url) ?? asString(rawOrt.googleMapsUri);
  if (!placeId || !placeUrl) return null;
  const place: ReviewsPlace = { place_id: placeId, place_url: placeUrl };
  const name = asString(rawOrt.name) ?? asString(rawOrt.displayName);
  if (name) place.name = name;
  return place;
}

/** Leerzustands-Praedikat: gilt bei jedem Grund fuer „keine Bewertungen". */
export function isEmptyDocument(document: ReviewsDocument): boolean {
  return document.reviews.length === 0;
}

/** Sortierhinweis-Anzeige: nur wenn Bewertungen existieren (ADR §5.4). */
export interface PublishSummaryOptions {
  /** Maximal so viele Karten werden sichtbar gerendert (Spec §8.1: 6). */
  limit?: number;
  /** Google-Review-CTA-Ziel; leer => CTA wird nicht gerendert. */
  googleReviewUrl?: string | null;
}

export function visibleReviews(
  document: ReviewsDocument,
  options: PublishSummaryOptions = {},
): NormalizedReview[] {
  const limit = options.limit ?? document.reviews.length;
  return document.reviews.slice(0, Math.max(0, limit));
}
