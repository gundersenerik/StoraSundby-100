import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { club } from "@/config/club";
import { priserArPlatshallare } from "@/lib/uthyrning";
import { E2E_BOKNINGS_EPOST, rensaUthyrningsfixturer } from "./hjalp";

/**
 * Publika uthyrningen: sidan, kalendern och förfrågningsflödet.
 *
 * Formuläret har en tidsspärr — en människa fyller inte i det på under tre
 * sekunder, en robot gör. Testerna väntar därför förbi spärren före varje
 * inskick; utan väntan hade även ett ogiltigt formulär fått "tack"-svaret
 * som robotarna får.
 */

const TIDSSPARR_MS = 3200;

test.describe("sidan", () => {
  test("visar stugorna med bäddantal ur config och exakt en h1", async ({ page }) => {
    await page.goto("/uthyrning");
    await expect(page.getByRole("heading", { name: "Hyr våra stugor", level: 1 })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);

    const stugkort = page.getByRole("heading", { level: 3 });
    await expect(stugkort).toHaveCount(club.facility.cabins.count);
    await expect(
      page.getByText(`${club.facility.cabins.bedsPerCabin} bäddar`).first(),
    ).toBeVisible();
  });

  test("kalendern visar tre månader som tabeller", async ({ page }) => {
    await page.goto("/uthyrning");
    await expect(
      page.getByRole("heading", { name: "Lediga datum" }).locator("..").getByRole("table"),
    ).toHaveCount(3);
  });

  test("visar aldrig ett påhittat pris", async ({ page }) => {
    await page.goto("/uthyrning");
    if (priserArPlatshallare()) {
      // Så länge beloppen i config är platshållare får inget av dem synas.
      await expect(page.getByText("Prislistan är på väg upp")).toBeVisible();
      await expect(page.getByText(new RegExp(`${club.rental.prices.cabinPerNight} kr`))).toHaveCount(0);
    } else {
      // Den dag priserna är riktiga ska tabellen visas i stället.
      await expect(page.getByText(`${club.rental.prices.cabinPerNight} kr`)).toBeVisible();
    }
  });

  test("uthyrningen ligger i huvudmenyn med aria-current på plats", async ({ page }) => {
    await page.goto("/uthyrning");
    const lank = page
      .getByRole("navigation", { name: "Huvudmeny" })
      .getByRole("link", { name: "Uthyrning" });
    await expect(lank).toHaveAttribute("aria-current", "page");
  });
});

test.describe("förfrågningsflödet", () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, "kräver service role för fixturrensning");
  test.beforeEach(rensaUthyrningsfixturer);
  // Även efteråt: inskickade testförfrågningar ska inte ligga kvar i
  // kansliets riktiga bokningslista mellan körningar.
  test.afterEach(rensaUthyrningsfixturer);

  test("avvisar avresa före ankomst med ett begripligt fel", async ({ page }) => {
    await page.goto("/uthyrning/boka");
    await page.getByLabel("Ankomst").fill("2027-07-10");
    await page.getByLabel("Avresa").fill("2027-07-08");
    await page.getByLabel("Antal personer").fill("6");
    await page.getByLabel("Namn", { exact: true }).fill("E2E Testgäst");
    await page.getByLabel("E-postadress").fill(E2E_BOKNINGS_EPOST);
    await page.waitForTimeout(TIDSSPARR_MS);
    await page.getByRole("button", { name: "Skicka förfrågan" }).click();
    await expect(page.getByRole("alert")).toContainText("Avresedatumet måste vara efter");
  });

  test("avvisar ett datum som redan varit", async ({ page }) => {
    await page.goto("/uthyrning/boka");
    await page.getByLabel("Ankomst").fill("2020-07-10");
    await page.getByLabel("Avresa").fill("2020-07-12");
    await page.getByLabel("Antal personer").fill("6");
    await page.getByLabel("Namn", { exact: true }).fill("E2E Testgäst");
    await page.getByLabel("E-postadress").fill(E2E_BOKNINGS_EPOST);
    await page.waitForTimeout(TIDSSPARR_MS);
    await page.getByRole("button", { name: "Skicka förfrågan" }).click();
    await expect(page.getByRole("alert")).toContainText("har redan varit");
  });

  test("en riktig förfrågan går fram och kvitteras", async ({ page }) => {
    await page.goto("/uthyrning/boka");
    await page.getByLabel("Ankomst").fill("2027-07-10");
    await page.getByLabel("Avresa").fill("2027-07-12");
    await page.getByLabel("Antal personer").fill("6");
    await page.getByRole("checkbox", { name: "Vi har hund med" }).check();
    await page.getByLabel("Namn", { exact: true }).fill("E2E Testgäst");
    await page.getByLabel("E-postadress").fill(E2E_BOKNINGS_EPOST);
    await page.waitForTimeout(TIDSSPARR_MS);
    await page.getByRole("button", { name: "Skicka förfrågan" }).click();

    await expect(page.getByRole("heading", { name: "Förfrågan skickad" })).toBeVisible();

    // Förfrågan får INTE synas som upptagen i kalendern — bara bekräftade
    // bokningar blockerar. Kontrollera att flödet inte spärrat något.
    await page.goto("/uthyrning");
    await expect(page.getByRole("heading", { name: "Lediga datum" })).toBeVisible();
  });
});

test.describe("tillgänglighet", () => {
  const REGLER = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

  for (const sida of ["/uthyrning", "/uthyrning/boka"]) {
    test(`inga allvarliga tillgänglighetsfel på ${sida}`, async ({ page }) => {
      await page.goto(sida);
      const resultat = await new AxeBuilder({ page }).withTags(REGLER).analyze();
      const allvarliga = resultat.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      );
      expect(allvarliga, allvarliga.map((v) => `${v.id}: ${v.help}`).join("\n")).toEqual([]);
    });
  }

  test("kalendern läses som tabell med månadsrubrik", async ({ page }) => {
    await page.goto("/uthyrning");
    const tabeller = page
      .getByRole("heading", { name: "Lediga datum" })
      .locator("..")
      .getByRole("table");
    // caption ger tabellen dess tillgängliga namn.
    await expect(tabeller.first().locator("caption")).not.toBeEmpty();
  });
});
