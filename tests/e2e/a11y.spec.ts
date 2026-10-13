import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/** E2E-Gate A11y (ADR §9.2): 0 serious/critical Verstoesse auf den Kernseiten. */
const PAGES = ["/", "/leistungen/", "/leistungen/fugenlose-bäder/", "/bewertungen/", "/kontakt/"];

for (const path of PAGES) {
  test(`axe ohne serious/critical Verstoesse: ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (violation) => violation.impact === "serious" || violation.impact === "critical",
    );
    expect(
      blocking.map((violation) => `${violation.id}: ${violation.help}`),
      `A11y-Verstoesse auf ${path}`,
    ).toEqual([]);
  });
}

test("genau eine h1 und gueltige Landmarks", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
  await expect(page.locator("main#hauptinhalt")).toHaveCount(1);
  await expect(page.locator("footer")).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
});

test("Tab erreicht den Skip-Link zuerst", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.textContent?.trim());
  expect(focused).toBe("Direkt zum Inhalt");
});

test("kein horizontaler Overflow bei 360 px", async ({ page }) => {
  for (const path of PAGES) {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontaler Overflow auf ${path}`).toBeLessThanOrEqual(1);
  }
});
