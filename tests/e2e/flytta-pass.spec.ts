import { expect, test } from "@playwright/test";
import { ADMIN_EPOST, loggaInSom, nollstallFotboll } from "./hjalp";

/**
 * Kravet i prompten, ordagrant: en ledare ska kunna flytta ett pass från
 * torsdag 19.00 till torsdag 18.00 på under en minut, från telefonen, utan
 * hjälp.
 *
 * Det här testet kör hela den kedjan: logga in, hitta passet, ändra tiden,
 * och kontrollera att den publika vyn faktiskt visar den nya tiden. Ett test
 * som bara kontrollerar att komponenten renderar hade inte fångat något.
 */

const GRUPP = "F/P 2013–2016";

test.beforeEach(nollstallFotboll);

test("ledare flyttar ett pass en timme och det slår igenom publikt", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const rad = page.locator("li").filter({ has: page.getByRole("textbox", { name: "Grupp" }) })
    .filter({ hasText: "" })
    .locator("visible=true");

  const gruppFalt = page.getByRole("textbox", { name: "Grupp" }).filter({ hasNot: page.locator("nothing") });
  const passRad = page.locator("li", { has: page.locator(`input[aria-label="Grupp"][value="${GRUPP}"]`) });

  await expect(passRad).toHaveCount(1);

  const start = passRad.locator('input[aria-label="Starttid"]');
  await expect(start).toHaveValue("19:00");

  await start.fill("18:00");
  await passRad.locator('input[aria-label="Sluttid"]').fill("19:00");

  // Vänta tills servern bekräftat innan vi tittar publikt.
  await expect(start).toHaveValue("18:00");
  await page.waitForTimeout(1500);

  await page.goto("/traningstider");
  const publikRad = page.locator("li", { hasText: GRUPP });
  await expect(publikRad).toContainText("18.00–19.00");
  await expect(publikRad).not.toContainText("19.00–20.00");


  void rad;
  void gruppFalt;
});

test("pausat pass försvinner inte, det visas som uppehåll", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const passRad = page.locator("li", { has: page.locator(`input[aria-label="Grupp"][value="${GRUPP}"]`) });
  await passRad.getByRole("button", { name: "Pausa" }).click();
  await expect(passRad.getByRole("button", { name: "Uppehåll" })).toBeVisible();

  await page.waitForTimeout(1500);

  await page.goto("/traningstider");
  const publikRad = page.locator("li", { hasText: GRUPP });
  await expect(publikRad).toBeVisible();
  await expect(publikRad).toContainText("Uppehåll");

});

test("databasens regler når fram till ledaren i begripligt språk", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/traningstider");

  const passRad = page.locator("li", { has: page.locator(`input[aria-label="Grupp"][value="${GRUPP}"]`) });

  // Sluttid före starttid bryter mot valid_period i databasen.
  await passRad.locator('input[aria-label="Starttid"]').fill("21:00");

  await expect(passRad.getByRole("alert")).toContainText(/sluttiden måste vara efter starttiden/i);
  // Och värdet rullas tillbaka, så gränssnittet ljuger inte om vad som sparats.
  await expect(passRad.locator('input[aria-label="Starttid"]')).toHaveValue("19:00");
});
