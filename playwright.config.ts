import { defineConfig, devices } from "@playwright/test";

/**
 * E2E-Gates (ADR §9.2): Consent (0 Cross-Origin-Requests ohne Einwilligung),
 * Kontakt, A11y. Der Webserver baut zuerst und startet dann den Container-Entry
 * lokal — dieselbe Auslieferung wie im Docker-Image.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4321",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && node ./dist/server/entry.mjs",
    url: "http://127.0.0.1:4321/api/healthz",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: { PORT: "4321", HOST: "127.0.0.1", NODE_ENV: "production" },
  },
});
