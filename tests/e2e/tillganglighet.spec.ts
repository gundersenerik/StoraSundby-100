import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { ADMIN_EPOST, loggaInSom } from "./hjalp";

/**
 * Noll allvarliga fel är kravet i prompten. Vi mäter på riktiga sidor med
 * riktigt innehåll, inte på isolerade komponenter.
 */
const REGLER = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function granska(page: import("@playwright/test").Page) {
  const resultat = await new AxeBuilder({ page }).withTags(REGLER).analyze();
  return resultat.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
}

for (const sida of ["/", "/traningstider", "/logga-in"]) {
  test(`inga allvarliga tillgänglighetsfel på ${sida}`, async ({ page }) => {
    await page.goto(sida);
    const allvarliga = await granska(page);
    expect(
      allvarliga,
      allvarliga.map((v) => `${v.id}: ${v.help}`).join("\n"),
    ).toEqual([]);
  });
}

test("inga allvarliga tillgänglighetsfel i redigeringsvyn", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");
  const allvarliga = await granska(page);
  expect(
    allvarliga,
    allvarliga.map((v) => `${v.id}: ${v.help}`).join("\n"),
  ).toEqual([]);
});

test("går att nå filtren med enbart tangentbord", async ({ page }) => {
  await page.goto("/traningstider");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  const fokuserad = await page.evaluate(() => document.activeElement?.tagName);
  expect(["SELECT", "INPUT", "A", "BUTTON"]).toContain(fokuserad);
});
