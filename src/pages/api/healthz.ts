/**
 * GET /api/healthz — Healthcheck (ADR §8.2). On-demand, nicht vorgerendert.
 * Nie Secrets, nie Env-Werte, nie SMTP-Credentials im Body.
 */
import type { APIRoute } from "astro";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { readReviewsConfig } from "../../lib/reviews.server";
import { smtpStatus } from "../../lib/mail.server";

export const prerender = false;

interface HealthBody {
  status: "ok" | "degraded";
  checks: {
    render: "ok" | "error";
    config: "ok" | "error";
    smtp: "ok" | "unconfigured" | "error";
  };
  version: string;
  uptime: number;
}

export const GET: APIRoute = () => {
  // Build-Artefakt vorhanden? Im Container ist das Arbeitsverzeichnis /app mit dist/.
  const renderOk =
    existsSync(join(process.cwd(), "dist", "server", "entry.mjs")) ||
    existsSync(join(process.cwd(), "dist", "client"));

  let configOk = true;
  try {
    readReviewsConfig(process.env);
  } catch {
    configOk = false;
  }

  const body: HealthBody = {
    status: renderOk && configOk ? "ok" : "degraded",
    checks: {
      render: renderOk ? "ok" : "error",
      config: configOk ? "ok" : "error",
      smtp: smtpStatus(process.env),
    },
    version: process.env.BUILD_ID ?? process.env.GIT_SHA ?? "dev",
    uptime: Math.round(process.uptime() * 10) / 10,
  };

  return new Response(JSON.stringify(body), {
    status: renderOk ? 200 : 503,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
};
