import { describe, expect, it } from "vitest";
import {
  MAX_REVIEWS,
  buildEmptyDocument,
  epochSecondsFromIso,
  isEmptyDocument,
  isoDayFromEpoch,
  normalize,
  normalizeReview,
  visibleReviews,
} from "./reviews";

describe("reviews: Zeitkonvertierung", () => {
  it("rechnet ISO auf Kalendertag und Epoch um", () => {
    expect(isoDayFromEpoch(1786665600)).toBe("2026-08-14");
    expect(epochSecondsFromIso("2026-08-14T00:00:00Z")).toBe(1786665600);
  });

  it("liefert 0 fuer ungueltige Zeitangaben", () => {
    expect(epochSecondsFromIso("keine Zeit")).toBe(0);
    expect(isoDayFromEpoch(Number.NaN)).toBe("1970-01-01");
  });
});

describe("reviews: normalizeReview (Places-Form)", () => {
  it("bildet die Google-Felder verbindlich ab und erzeugt Initialen ohne Foto", () => {
    const review = normalizeReview({
      authorAttribution: { displayName: "Beispiel Name B", uri: "https://www.google.com/maps/contrib/beispiel/reviews" },
      rating: 4,
      publishTime: "2026-07-02T00:00:00Z",
      text: { text: "Beispieltext." },
      originalLanguage: "de",
    });
    expect(review).not.toBeNull();
    expect(review?.autor).toBe("Beispiel Name B");
    expect(review?.sterne).toBe(4);
    expect(review?.datum).toBe("2026-07-02");
    expect(review?.avatar_status).toBe("initials");
    expect(review?.avatar_url).toBeNull();
    expect(review?.profil_link).toBe("https://www.google.com/maps/contrib/beispiel/reviews");
    expect(review?.review_time).toBe(epochSecondsFromIso("2026-07-02T00:00:00Z"));
    expect(review?.sprache).toBe("de");
  });

  it("setzt avatar_status google nur mit Foto-URI", () => {
    const withPhoto = normalizeReview({
      authorAttribution: { displayName: "A", photoUri: "https://lh3.googleusercontent.com/a-/x=y" },
      rating: 5,
      publishTime: "2026-07-02T00:00:00Z",
      text: { text: "Text" },
    });
    expect(withPhoto?.avatar_status).toBe("google");
    expect(withPhoto?.avatar_url).toBe("https://lh3.googleusercontent.com/a-/x=y");
  });

  it("verwirft Datensaetze ohne Autor, Sterne oder Text", () => {
    expect(normalizeReview({ rating: 5, publishTime: "2026-07-02T00:00:00Z", text: { text: "x" } })).toBeNull();
    expect(normalizeReview({ authorAttribution: { displayName: "A" }, rating: 9, publishTime: "2026-07-02T00:00:00Z", text: { text: "x" } })).toBeNull();
    expect(normalizeReview({ authorAttribution: { displayName: "A" }, rating: 3, publishTime: "2026-07-02T00:00:00Z" })).toBeNull();
  });
});

describe("reviews: normalizeReview (Normalformat)", () => {
  it("leitet datum kanonisch aus review_time ab", () => {
    const review = normalizeReview({
      id: "rev-1",
      autor: "Beispiel",
      sterne: 5,
      datum: "1999-01-01",
      text: "Text",
      avatar_status: "initials",
      avatar_url: null,
      profil_link: null,
      review_time: 1786665600,
    });
    expect(review?.datum).toBe("2026-08-14");
  });

  it("verwirft avatar_status google ohne avatar_url (Schema-Invariante)", () => {
    const review = normalizeReview({
      autor: "Beispiel",
      sterne: 5,
      datum: "2026-08-14",
      text: "Text",
      avatar_status: "google",
      avatar_url: null,
      profil_link: null,
      review_time: 1786665600,
    });
    expect(review).toBeNull();
  });

  it("vergibt eine stabile lokale ID, wenn keine mitgeliefert wird", () => {
    const first = normalizeReview({ autor: "A", sterne: 5, datum: "2026-08-14", text: "t", avatar_status: "none", avatar_url: null, profil_link: null, review_time: 1786665600 });
    const second = normalizeReview({ autor: "A", sterne: 5, datum: "2026-08-14", text: "t", avatar_status: "none", avatar_url: null, profil_link: null, review_time: 1786665600 });
    expect(first?.id).toBe(second?.id);
    expect(first?.id?.startsWith("rev-")).toBe(true);
  });
});

describe("reviews: normalize (Dokument)", () => {
  const staticDoc = {
    reviews: [
      { autor: "Alt", sterne: 3, datum: "2026-01-01", text: "a", avatar_status: "initials", avatar_url: null, profil_link: null, review_time: 1767225600 },
      { autor: "Neu", sterne: 5, datum: "2026-08-14", text: "b", avatar_status: "initials", avatar_url: null, profil_link: null, review_time: 1786665600 },
    ],
    quelle: "static_export",
    aktualisiert_am: "2026-10-13T09:00:00.000Z",
    leer: false,
    sortierung_hinweis: "Eigener Hinweis",
  };

  it("sortiert nach review_time absteigend", () => {
    const normalized = normalize(staticDoc, { quelle: "static_export" });
    expect(normalized.reviews.map((r) => r.autor)).toEqual(["Neu", "Alt"]);
    expect(normalized.leer).toBe(false);
    expect(normalized.sortierung_hinweis).toBe("Eigener Hinweis");
  });

  it("erkennt den Leerzustand aus jedem Grund", () => {
    expect(isEmptyDocument(normalize({ reviews: [] }, { quelle: "static_export" }))).toBe(true);
    expect(isEmptyDocument(normalize(null, { quelle: "static_export" }))).toBe(true);
    expect(isEmptyDocument(buildEmptyDocument("places_api"))).toBe(true);
  });

  it("begrenzt auf das Performance-Budget von 50", () => {
    const many = Array.from({ length: 80 }, (_, index) => ({
      autor: `A${index}`,
      sterne: 5,
      datum: "2026-08-14",
      text: "t",
      avatar_status: "initials",
      avatar_url: null,
      profil_link: null,
      review_time: 1786665600 + index,
    }));
    const normalized = normalize({ reviews: many, quelle: "static_export", aktualisiert_am: "2026-10-13T09:00:00.000Z", leer: false }, { quelle: "static_export" });
    expect(normalized.reviews).toHaveLength(MAX_REVIEWS);
  });

  it("setzt ort nur bei places_api und googleMapsUri", () => {
    const places = normalize(
      { reviews: [], id: "ChIJX", googleMapsUri: "https://maps.google.com/?cid=1", displayName: "Ivo" },
      { quelle: "places_api" },
    );
    expect(places.ort?.place_id).toBe("ChIJX");
    expect(places.ort?.place_url).toBe("https://maps.google.com/?cid=1");

    const staticResult = normalize({ reviews: [], quelle: "static_export" }, { quelle: "static_export" });
    expect(staticResult.ort).toBeUndefined();
  });

  it("liefert den verbindlichen Sortierhinweis als Fallback", () => {
    const normalized = normalize({ reviews: [] }, { quelle: "static_export" });
    expect(normalized.sortierung_hinweis).toContain("Google Maps vorgibt");
  });

  it("rendert maximal 6 Karten sichtbar", () => {
    const normalized = normalize(staticDoc, { quelle: "static_export" });
    expect(visibleReviews(normalized, { limit: 6 })).toHaveLength(2);
    expect(visibleReviews(normalized)).toHaveLength(2);
  });
});
