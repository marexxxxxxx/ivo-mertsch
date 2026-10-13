/**
 * Rate-Limit — Token-Bucket pro Schluessel, In-Memory.
 *
 * Grenze (ADR §6.2): standardmaessig 5 Anfragen pro 10 Minuten und IP.
 * Dokumentierte Einschraenkung: die Karte liegt im Prozessspeicher, ist also
 * bei horizontaler Skalierung NICHT geteilt. Bei einer Instanz (ein Container,
 * die Abnahmeform) ist das korrekt.
 */
export interface RateLimitOptions {
  max: number;
  windowSeconds: number;
  /** Injizierbare Uhr fuer deterministische Tests. */
  now?: () => number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly max: number;
  private readonly windowMs: number;
  private readonly now: () => number;

  constructor(options: RateLimitOptions) {
    this.max = Math.max(1, Math.floor(options.max));
    this.windowMs = Math.max(1, Math.floor(options.windowSeconds)) * 1000;
    this.now = options.now ?? (() => Date.now());
  }

  check(key: string): RateLimitResult {
    const now = this.now();
    const existing = this.buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1, retryAfterSeconds: 0 };
    }

    if (existing.count >= this.max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }

    existing.count += 1;
    return { allowed: true, remaining: this.max - existing.count, retryAfterSeconds: 0 };
  }

  /** Diagnose/Aufraeumen: entfernt abgelaufene Eintraege. */
  prune(): void {
    const now = this.now();
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}
