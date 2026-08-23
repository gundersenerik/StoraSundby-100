import { expect, test } from "@playwright/test";
import { ADMIN_EPOST, ICKE_ADMIN_EPOST, loggaInSom } from "./hjalp";

test.describe("behörighet", () => {
  test("utloggad skickas till inloggningen från admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/logga-in/);
    await expect(page.getByRole("heading", { name: "Logga in" })).toBeVisible();
  });

  test("utloggad skickas bort även från redigeringsvyn", async ({ page }) => {
    await page.goto("/admin/traningstider");
    await expect(page).toHaveURL(/\/logga-in/);
  });

  test("inloggad utan behörighet slipper inte in", async ({ page }) => {
    // Detta är testet som betyder något. En giltig session är inte samma sak
    // som behörighet — spärren är admin_users, inte att man är inloggad.
    await loggaInSom(page, ICKE_ADMIN_EPOST);
    await page.goto("/admin/traningstider");
    await expect(page).toHaveURL(/fel=ej-behorig/);
    await expect(page.getByText(/ingen behörighet/i)).toBeVisible();
  });

  test("administratör släpps in", async ({ page }) => {
    await loggaInSom(page, ADMIN_EPOST);
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByText(ADMIN_EPOST)).toBeVisible();
  });

  test("ogiltig länk ger felmeddelande i stället för krasch", async ({ page }) => {
    await page.goto("/auth/bekrafta?token_hash=trams&type=magiclink");
    await expect(page).toHaveURL(/fel=ogiltig-lank/);
  });

  test("länk utan token ger felmeddelande", async ({ page }) => {
    await page.goto("/auth/bekrafta");
    await expect(page).toHaveURL(/fel=saknad-kod/);
  });
});
