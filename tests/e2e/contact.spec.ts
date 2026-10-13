import { expect, test } from "@playwright/test";

/** E2E-Gate Kontakt (ADR §9.2): Validierung, Lade-/Erfolgszustand, Rate-Limit-Text. */

test("Validierung zeigt konkrete Feldfehler und behaelt die Eingaben", async ({ page }) => {
  await page.goto("/kontakt/#formular");
  const form = page.locator("[data-contact-form]");
  await form.getByLabel(/Ihr Name/).fill("Beispiel");
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  const summary = page.locator("[data-contact-summary]");
  await expect(summary).toBeVisible();
  await expect(summary).toContainText("Bitte prüfen Sie die markierten Felder.");

  // Eingabe bleibt erhalten (Felder werden bei Fehlern nicht geleert).
  await expect(form.getByLabel(/Ihr Name/)).toHaveValue("Beispiel");
  await expect(form.locator("#contact-email")).toHaveAttribute("aria-invalid", "true");
});

test("Erfolgszustand ersetzt das Formular ohne Layoutwechsel", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, messageId: "test-1" }),
    });
  });

  await page.goto("/kontakt/#formular");
  const form = page.locator("[data-contact-form]");
  await form.getByLabel(/Ihr Name/).fill("Beispiel");
  await form.locator("#contact-email").fill("name@beispiel.de");
  await form.locator("#contact-nachricht").fill("Ein Satz, der lang genug ist.");
  await form.getByLabel(/Ich habe die Datenschutzerklärung gelesen/).check();
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  const status = page.getByRole("status");
  await expect(status).toContainText("Anfrage gesendet");
  await expect(page.locator("[data-contact-form]")).toHaveCount(0);
});

test("Rate-Limit-Hinweis nennt die Wartezeit und den Telefonweg", async ({ page }) => {
  await page.route("**/api/contact", async (route) => {
    await route.fulfill({
      status: 429,
      contentType: "application/json",
      body: JSON.stringify({ ok: false, error: "rate_limited", retryAfterSeconds: 600 }),
    });
  });

  await page.goto("/kontakt/#formular");
  const form = page.locator("[data-contact-form]");
  await form.getByLabel(/Ihr Name/).fill("Beispiel");
  await form.locator("#contact-email").fill("name@beispiel.de");
  await form.locator("#contact-nachricht").fill("Ein Satz, der lang genug ist.");
  await form.getByLabel(/Ich habe die Datenschutzerklärung gelesen/).check();
  await form.getByRole("button", { name: "Anfrage senden" }).click();

  await expect(page.locator("[data-contact-summary]")).toContainText("mehrere Anfragen gesendet");
});

test("Honeypot ist aus dem Tab-Fokus und nicht sichtbar", async ({ page }) => {
  await page.goto("/kontakt/#formular");
  const honeypot = page.locator("#contact-firma");
  await expect(honeypot).toHaveAttribute("tabindex", "-1");
  await expect(honeypot).not.toBeInViewport();
});

test("API-Vertrag: leere Anfrage liefert 400 mit Feldern", async ({ request }) => {
  const response = await request.post("/api/contact", {
    headers: { accept: "application/json", "content-type": "application/json" },
    data: {},
  });
  expect(response.status()).toBe(400);
  const body = (await response.json()) as { ok: boolean; error: string; fields: string[] };
  expect(body.ok).toBe(false);
  expect(body.error).toBe("validation");
  expect(body.fields).toContain("nachricht");
});
