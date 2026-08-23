import { expect, test } from "@playwright/test";

test.describe("publika träningsschemat", () => {
  test("visar passen från gamla sajten med rätt tidsformat", async ({ page }) => {
    await page.goto("/traningstider");
    await expect(page.getByRole("heading", { name: "Träningstider", level: 1 })).toBeVisible();
    await expect(page.getByText("18.30–19.30")).toBeVisible();
    // Röstreglerna: tankstreck, inte bindestreck.
    await expect(page.getByText("18:30-19:30")).toHaveCount(0);
  });

  test("filtrerar på sektion", async ({ page }) => {
    await page.goto("/traningstider");
    await page.getByLabel("Sektion").selectOption({ label: "Barngymnastik och Cirkelfys" });
    await expect(page.getByRole("heading", { name: "Barngymnastik och Cirkelfys" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fotboll" })).toHaveCount(0);
  });

  test("filtrerar på ålder utan att gömma pass som gäller alla", async ({ page }) => {
    await page.goto("/traningstider");
    await page.getByLabel("Ålder").fill("4");
    // 3–5 år ska synas
    await expect(page.getByText("Barn 2–4 år (tillsammans med förälder)")).toBeVisible();
    // 6–8 år ska inte
    await expect(page.getByText("Barn 5–8 år")).toHaveCount(0);
    // Pass utan åldersgräns gäller alla och ska finnas kvar
    await expect(page.getByText("F/P 2017")).toBeVisible();
  });

  test("har exakt en h1", async ({ page }) => {
    await page.goto("/traningstider");
    await expect(page.locator("h1")).toHaveCount(1);
  });
});
