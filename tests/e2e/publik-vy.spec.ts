import { expect, test } from "@playwright/test";
import { club } from "@/config/club";

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
    // getByLabel("Sektion") traffar aven <nav aria-label="Sektioner">.
    // Rollen ar entydig.
    await page
      .getByRole("combobox", { name: "Sektion" })
      .selectOption({ label: "Barngymnastik och Cirkelfys" });
    await expect(page.getByRole("heading", { name: "Barngymnastik och Cirkelfys" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fotboll" })).toHaveCount(0);
  });

  test("filtrerar på ålder utan att gömma pass som gäller alla", async ({ page }) => {
    await page.goto("/traningstider");
    await page.getByRole("spinbutton", { name: "Ålder" }).fill("4");
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

test.describe("skalet runt sidorna", () => {
  test("har en hoppa-till-innehållet-länk som första fokuserbara element", async ({ page }) => {
    await page.goto("/traningstider");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /hoppa till innehållet/i })).toBeFocused();
  });

  test("markerar aktuell sida med aria-current, inte bara med färg", async ({ page }) => {
    await page.goto("/traningstider");
    const aktiv = page.getByRole("navigation", { name: "Huvudmeny" }).getByRole("link", {
      name: "Träningstider",
    });
    await expect(aktiv).toHaveAttribute("aria-current", "page");
  });

  test("sidfoten hämtar klubbuppgifterna ur config", async ({ page }) => {
    // Värdena läses ur club.ts i stället för att skrivas här. Testet bevisar
    // då att sidfoten visar vad som än står i kontraktet — byter någon
    // adress följer testet med. Att skriva dem här hade dessutom varit en
    // andra plats där ett klubbfaktum bor, vilket lint:hardcoded stoppar.
    // getByRole("contentinfo"), inte locator("footer"). Startsidans citat
    // anvander <footer> for kallhanvisningen, vilket ar ratt HTML men gor
    // taggselektorn tvetydig. Rollen contentinfo bar bara sidfoten.
    await page.goto("/");
    const sidfot = page.getByRole("contentinfo");
    await expect(sidfot).toContainText(club.contact.address.street);
    await expect(sidfot).toContainText(club.contact.address.postalCode);
    await expect(sidfot).toContainText(club.contact.email);
  });

  test("menyn länkar aldrig till en sida som inte finns", async ({ page }) => {
    await page.goto("/");
    const lankar = await page.getByRole("navigation").getByRole("link").all();
    for (const lank of lankar) {
      const href = await lank.getAttribute("href");
      if (!href || href.startsWith("http")) continue;
      const svar = await page.request.get(href);
      expect(svar.status(), `${href} svarade ${svar.status()}`).toBeLessThan(400);
    }
  });

  test("okänd adress ger 404 med vägar vidare", async ({ page }) => {
    const svar = await page.goto("/finns-inte-alls");
    expect(svar?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Sidan finns inte" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Startsidan" })).toBeVisible();
  });

  test("gamla adresser med å och ä redirectar", async ({ page }) => {
    await page.goto("/läger");
    await expect(page).toHaveURL(/\/lager$/);
    await page.goto("/om-föreningen");
    await expect(page).toHaveURL(/\/om-foreningen$/);
  });
});
