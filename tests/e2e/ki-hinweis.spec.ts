import { expect, test } from "@playwright/test";

/**
 * KI-Transparenz (ADR 0002 §5.1, content/ki-bildhinweis.md §1).
 *
 * Gate: Die Vollform steht an jeder Bildstelle (sichtbarer Absatz, kein
 * title/aria-label-Only), die Kurzform dauerhaft im Footer jeder Seite. Der
 * Impressum-Abschnitt "Bildhinweis" traegt den Anker fuer die Verlinkung.
 */
const BILDSELTEN = ["/", "/über-uns/", "/leistungen/", "/leistungen/fugenlose-bäder/"];

const VOLLFORM = /Ein Teil der hier gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt/;
const KURZFORM = /Bildhinweis: Einzelne Bilder dieser Website sind KI-generiert/;

for (const path of BILDSELTEN) {
  test(`Vollform des KI-Hinweises sichtbar an der Bildstelle: ${path}`, async ({ page }) => {
    await page.goto(path);
    const hinweis = page.locator(".pf-ki-hinweis--full").first();
    await expect(hinweis).toBeVisible();
    await expect(hinweis).toHaveText(VOLLFORM);
    // Echter Textknoten: nicht nur ueber title/aria-label transportiert.
    expect(await hinweis.getAttribute("title")).toBeNull();
    expect(await hinweis.getAttribute("aria-label")).toBeNull();
  });
}

test("Kurzform des KI-Hinweises steht im Footer jeder Seite", async ({ page }) => {
  for (const path of ["/", "/kontakt/", "/datenschutzerklaerung/"]) {
    await page.goto(path);
    await expect(page.locator("footer .pf-ki-hinweis--short")).toBeVisible();
    await expect(page.locator("footer .pf-ki-hinweis--short")).toHaveText(KURZFORM);
  }
});

test("Footer verlinkt den Bildhinweis auf den Impressum-Abschnitt", async ({ page }) => {
  await page.goto("/");
  const link = page.locator("footer").getByRole("link", { name: "Bildhinweis" });
  await expect(link).toHaveAttribute("href", /\/impressum\/#bildhinweis$/);

  await link.click();
  await expect(page).toHaveURL(/\/impressum\/#bildhinweis$/);
  await expect(page.locator("h2#bildhinweis")).toBeVisible();
  await expect(page.locator("h2#bildhinweis + p")).toContainText(
    "Ein Teil der auf dieser Website gezeigten Bilder wurde mit Künstlicher Intelligenz erzeugt",
  );
});
