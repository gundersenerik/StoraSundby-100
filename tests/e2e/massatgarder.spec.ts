import { expect, test } from "@playwright/test";
import { ADMIN_EPOST, loggaInSom, nollstallFotboll } from "./hjalp";

const SASONG = "okand-2026";

test.beforeEach(nollstallFotboll);

test("flyttar en hel sektion en timme med en knapptryckning", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const fotboll = page.locator("section").filter({ hasText: "Fotboll" }).first();
  await fotboll.getByRole("button", { name: "En timme tidigare" }).click();

  await expect(fotboll.getByRole("status")).toContainText("3 pass flyttade");

  await page.goto("/traningstider");
  const rad = page.locator("li", { hasText: "F/P 2017" });
  await expect(rad).toContainText("17.30–18.30");

});

test("pausade pass utan tider rör sig inte vid en flytt", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const fotboll = page.locator("section").filter({ hasText: "Fotboll" }).first();
  await fotboll.getByRole("button", { name: "En timme senare" }).click();
  await expect(fotboll.getByRole("status")).toContainText("3 pass");

  // Bollek ligger pa uppehall utan tider och ska inte ha fatt nagra.
  await page.goto("/traningstider");
  const bollek = page.locator("li", { hasText: "Bollek från 2022" });
  await expect(bollek).toContainText("Uppehåll");

});

test("återstartar inte ett pass som saknar tider", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const fotboll = page.locator("section").filter({ hasText: "Fotboll" }).first();
  await fotboll.getByRole("button", { name: "Pausa hela sektionen" }).click();
  await expect(fotboll.getByRole("status")).toContainText("4 pass");

  await fotboll.getByRole("button", { name: "Återstarta" }).click();
  // Tre, inte fyra. Bollek saknar tider och far inte bli aktivt.
  await expect(fotboll.getByRole("status")).toContainText("3 pass återstartade");
});

test("nytt pass skapas pausat och går att ta bort", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const fotboll = page.locator("section").filter({ hasText: "Fotboll" }).first();
  await fotboll.getByRole("button", { name: "Lägg till pass" }).click();
  await expect(fotboll.getByRole("status")).toContainText("Nytt pass tillagt");

  await page.reload();
  const nyRad = page.locator("li", {
    has: page.locator('input[aria-label="Grupp"][value="Ny grupp"]'),
  });
  await expect(nyRad).toHaveCount(1);

  // Ett klick bekraftar, ett andra raderar. Ingen webblasardialog.
  await nyRad.getByRole("button", { name: "Ta bort" }).click();
  await nyRad.getByRole("button", { name: "Säkert?" }).click();
  await expect(nyRad).toHaveCount(0);
});
