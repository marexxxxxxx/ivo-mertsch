import { describe, expect, it } from "vitest";
import { RateLimiter } from "./rate-limit";

describe("rate-limit", () => {
  it("laesst bis zur Grenze durch und blockt danach", () => {
    const now = 1_000_000;
    const limiter = new RateLimiter({ max: 3, windowSeconds: 600, now: () => now });

    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);
    expect(limiter.check("ip-1").allowed).toBe(true);

    const blocked = limiter.check("ip-1");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(600);
  });

  it("zaehlt pro Schluessel getrennt", () => {
    const limiter = new RateLimiter({ max: 1, windowSeconds: 60, now: () => 0 });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  it("gibt das Fenster nach Ablauf wieder frei", () => {
    let now = 0;
    const limiter = new RateLimiter({ max: 1, windowSeconds: 60, now: () => now });
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    now = 60_001;
    expect(limiter.check("a").allowed).toBe(true);
  });

  it("raeumt abgelaufene Eintraege auf", () => {
    let now = 0;
    const limiter = new RateLimiter({ max: 2, windowSeconds: 10, now: () => now });
    limiter.check("a");
    now = 20_000;
    limiter.prune();
    expect(limiter.check("a").allowed).toBe(true);
  });
});
