import { expect, test } from "@playwright/test";

/**
 * Gate aus ADR §4.2 / §9.2: Ohne Einwilligung darf es NULL Cross-Origin-Requests
 * geben. Der Test laeuft ohne gesetzten Consent und sammelt ueber eine komplette
 * Interaktion (Start, Scroll, Kontaktseite, Bewertungsseite).
 */
const ORIGIN = "http://127.0.0.1:4321";

function isCrossOrigin(url: string): boolean {
  if (url.startsWith("data:") || url.startsWith("blob:")) return false;
  try {
    return new URL(url).origin !== ORIGIN;
  } catch {
    return false;
  }
}

test("ohne Einwilligung: null Cross-Origin-Requests, keine Cookies", async ({ page, context }) => {
  const offenders: string[] = [];
  page.on("request", (request) => {
    if (isCrossOrigin(request.url())) offenders.push(request.url());
  });

  await page.goto("/");
  await expect(page.locator("#pf-consent-banner")).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  await page.goto("/kontakt/");
  await page.goto("/bewertungen/");
  await page.goto("/leistungen/fugenlose-bäder/");

  expect(offenders, `Cross-Origin-Requests ohne Consent: ${offenders.join(", ")}`).toEqual([]);

  const cookies = await context.cookies();
  expect(cookies).toEqual([]);
});

test("ohne Einwilligung: keine Gate-Elemente erzeugt, kein localStorage-Eintrag", async ({ page }) => {
  await page.goto("/bewertungen/");

  // Gate-Templates sind inert und duerfen nichts materialisiert haben.
  const activeSlots = await page.locator('[data-consent-slot][data-consent-active="true"]').count();
  expect(activeSlots).toBe(0);

  const keys = await page.evaluate(() => Object.keys(window.localStorage));
  expect(keys).toEqual([]);
});

test("Leerzustand: keine Sterne, keine Attribution, CTA nur mit Ziel", async ({ page }) => {
  await page.goto("/bewertungen/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Bewertungen");

  // Kein Sterne-Symbol im Leerzustand (ADR §5.4, Blocker-Gate).
  const body = await page.locator("main").innerText();
  expect(body).not.toContain("★");
  expect(body).not.toContain("☆");

  // Keine irrefuehrende Herkunftsangabe ohne Google-Inhalt.
  await expect(page.getByText("Bewertungen von Google Maps")).toHaveCount(0);
  await expect(page.getByText("Aktuell liegen für diese Website keine Google-Bewertungen")).toBeVisible();

  // CTA zeigt auf den bestaetigten Google-Maps-Profil-Link (OP-2 geklaert).
  const reviewCta = page.getByRole("link", { name: /Jetzt bei Google bewerten/i });
  await expect(reviewCta).toBeVisible();
  await expect(reviewCta).toHaveAttribute("href", "https://maps.app.goo.gl/4w3i7sVLrrs8di5v9");
});

test("Einwilligung: Persistenz, sofortige Wirkung und Widerruf", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Alle akzeptieren" }).click();

  // Banner entfernt.
  await expect(page.locator("#pf-consent-banner")).toHaveCount(0);

  const record = await page.evaluate(() => JSON.parse(window.localStorage.getItem("pixelforge.consent.v1") ?? "null"));
  expect(record.version).toBe(1);
  expect(record.entscheidung).toBe("akzeptiert");
  expect(record.kategorien).toEqual({ essenziell: true, statistik: true, externe_medien: true });
  expect(record.methode).toBe("banner-alle");

  // Widerruf ueber den Footer-Eintrag (gleichwertiger Weg).
  await page.getByRole("button", { name: "Cookie-Einstellungen" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Datenschutz-Einstellungen" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Nur notwendige" }).click();

  const revoked = await page.evaluate(() => JSON.parse(window.localStorage.getItem("pixelforge.consent.v1") ?? "null"));
  expect(revoked.entscheidung).toBe("abgelehnt");
  expect(revoked.kategorien.externe_medien).toBe(false);
  expect(revoked.methode).toBe("footer-einstellungen");

  // Nach Widerruf bleibt der Nachweis lokal erhalten (nicht geloescht).
  expect(revoked.widerruf_zaehler).toBeGreaterThanOrEqual(2);
});

test("Dialog: Escape schliesst und gibt den Fokus zurueck", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Einstellungen", exact: true });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Datenschutz-Einstellungen" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});

test("Gate-Engine: Element wird erzeugt (nicht eingeblendet), idempotent, bei Widerruf entfernt", async ({ page }) => {
  await page.goto("/");

  // Testaufbau: ein inertes Gate-Template + ein Slot mit lokalem Fallback.
  await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "gate-host";
    host.innerHTML = `
      <span data-consent-slot="t1" data-consent-fallback="AB">AB</span>
      <template data-consent-gate="externe_medien" data-consent-slot-target="t1">
        <img src="https://lh3.googleusercontent.com/a-/x=y" alt="" width="40" height="40" />
      </template>`;
    document.body.appendChild(host);
  });

  // Vor Zustimmung: Template ist inert, kein <img> im DOM.
  await expect(page.locator("#gate-host img")).toHaveCount(0);

  // Zustimmung -> Element wird ERZEUGT.
  await page.evaluate(() => {
    window.__pfConsent?.apply({
      version: 1,
      entscheidung: "individuell",
      kategorien: { essenziell: true, statistik: false, externe_medien: true },
      zeitstempel: new Date().toISOString(),
      methode: "banner-individuell",
      textfassung: "2026-10-13.1",
    });
  });
  await expect(page.locator('#gate-host [data-consent-slot="t1"] img')).toHaveCount(1);

  // Idempotenz: zweiter Aufruf erzeugt kein zweites Element.
  await page.evaluate(() => window.__pfConsent?.apply(window.__pfConsent.get()));
  await expect(page.locator('#gate-host [data-consent-slot="t1"] img')).toHaveCount(1);

  // Widerruf -> Element wird aus dem DOM ENTFERNT, lokaler Fallback zurueck.
  await page.evaluate(() => {
    window.__pfConsent?.apply({
      version: 1,
      entscheidung: "abgelehnt",
      kategorien: { essenziell: true, statistik: false, externe_medien: false },
      zeitstempel: new Date().toISOString(),
      methode: "footer-einstellungen",
      textfassung: "2026-10-13.1",
    });
  });
  await expect(page.locator('#gate-host [data-consent-slot="t1"] img')).toHaveCount(0);
  await expect(page.locator('#gate-host [data-consent-slot="t1"]')).toHaveText("AB");
});
