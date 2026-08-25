import { expect, test } from "@playwright/test";
import { ADMIN_STATE, rensaInnehallsfixturer } from "./hjalp";

/**
 * Nyheter och kalender: att en volontär faktiskt kan skriva, publicera och
 * avpublicera en nyhet, lägga in och dölja en händelse — och att resultatet
 * syns respektive försvinner publikt. Flödet testas, inte att komponenterna
 * renderar.
 *
 * Fixturerna märks "E2E:" och rensas före och efter varje test. Alla
 * alert/status-sökningar är skopade — Next har en egen route-announcer
 * med role=alert (fällan i CLAUDE.md).
 */

test.describe("publika sidorna", () => {
  test("nyhetslistan har exakt en h1 och ett ärligt tomläge eller riktiga poster", async ({ page }) => {
    await page.goto("/nyheter");
    await expect(page.getByRole("heading", { name: "Nyheter", level: 1 })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
  });

  test("kalendern har exakt en h1 och pekar mot träningstiderna", async ({ page }) => {
    await page.goto("/kalender");
    await expect(page.getByRole("heading", { name: "Kalender", level: 1 })).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    // exact skiljer brödtextens "träningstider" från menyns "Träningstider".
    await expect(page.getByRole("link", { name: "träningstider", exact: true })).toBeVisible();
  });

  test("nyheter och kalender ligger i huvudmenyn", async ({ page }) => {
    await page.goto("/nyheter");
    const meny = page.getByRole("navigation", { name: "Huvudmeny" });
    await expect(meny.getByRole("link", { name: "Nyheter" })).toHaveAttribute("aria-current", "page");
    await expect(meny.getByRole("link", { name: "Kalender" })).toBeVisible();
  });
});

/**
 * Fixturdatum: alltid nästa kalenderår, aldrig hårdkodat årtal — ett fast
 * "2027-09-11" hade börjat faila tyst den dag datumet passerat, eftersom
 * kalendern bara visar aktuella händelser. Veckodagen varierar med året
 * och ingår därför inte i påståendena; formateraNar bevisas i enhetstesten.
 */
const AR = new Date().getFullYear() + 1;

test.describe("kansliets flöden", () => {
  test.skip(!process.env.SUPABASE_SERVICE_ROLE_KEY, "kräver service role för fixturrensning");
  test.use({ storageState: ADMIN_STATE });
  test.beforeEach(rensaInnehallsfixturer);
  test.afterEach(rensaInnehallsfixturer);

  test("en nyhet skrivs, publiceras, syns publikt och avpubliceras", async ({ page }) => {
    const titel = "E2E: Provnyhet från testflödet";

    await page.goto("/admin/nyheter");
    await page.getByLabel("Rubrik på den nya nyheten").fill(titel);
    await page.getByRole("button", { name: "Skapa utkast" }).click();
    // Skopat till namngivna formuläret: admin-headern har ett
    // utloggningsformulär före innehållet, så ett oscopat "form" är fel.
    await expect(page.getByRole("form", { name: "Ny nyhet" }).getByRole("status")).toContainText(
      "Utkastet är skapat",
    );

    const rad = page.locator("li", { hasText: titel }).first();
    await expect(rad).toContainText("Utkast — syns inte på sajten");

    // Utkastet är osynligt publikt redan innan vi rört något mer.
    await page.goto("/nyheter");
    await expect(page.getByText(titel)).toHaveCount(0);

    // Skriv ingress och publicera.
    await page.goto("/admin/nyheter");
    const radIgen = page.locator("li", { hasText: titel }).first();
    await radIgen.getByLabel(/Ingress/).fill("En mening om vad som hänt.");
    await radIgen.getByLabel(/Ingress/).blur();
    await radIgen.getByRole("button", { name: "Publicera" }).click();
    await expect(radIgen.getByRole("status")).toContainText("publicerad");

    // Publikt: listan, artikeln och tillbakalänken.
    await page.goto("/nyheter");
    await page.getByRole("link", { name: titel }).click();
    await expect(page.getByRole("heading", { name: titel, level: 1 })).toBeVisible();
    await expect(page.getByText("En mening om vad som hänt.")).toBeVisible();

    // Avpublicera — nyheten försvinner publikt men finns kvar i admin.
    await page.goto("/admin/nyheter");
    const radSist = page.locator("li", { hasText: titel }).first();
    await radSist.getByRole("button", { name: "Avpublicera" }).click();
    await expect(radSist.getByRole("status")).toContainText("avpublicerad");
    await page.goto("/nyheter");
    await expect(page.getByText(titel)).toHaveCount(0);
  });

  test("en händelse läggs in, syns i kalendern och kan döljas", async ({ page }) => {
    const titel = "E2E: Städdag i testflödet";

    await page.goto("/admin/kalender");
    await page.getByLabel("Rubrik").first().fill(titel);
    await page.getByLabel("Typ").first().selectOption("staddag");
    await page.getByLabel("Datum", { exact: true }).first().fill(`${AR}-09-11`);
    await page.getByLabel("Klockslag", { exact: true }).first().fill("09:00");
    await page.getByLabel("Plats (frivilligt)").first().fill("Klubbstugan");
    await page.getByRole("button", { name: "Lägg in" }).click();
    await expect(page.getByRole("form", { name: "Ny händelse" }).getByRole("status")).toContainText(
      "inlagd",
    );

    // Publikt: under rätt månadsrubrik, med etikett och plats.
    await page.goto("/kalender");
    await expect(page.getByRole("heading", { name: `September ${AR}` })).toBeVisible();
    const kort = page.locator("li", { hasText: titel }).first();
    await expect(kort).toContainText("Städdag");
    await expect(kort).toContainText("Klubbstugan");
    await expect(kort).toContainText("11 september 09.00");

    // Dölj — händelsen försvinner publikt utan att raderas.
    await page.goto("/admin/kalender");
    const rad = page.locator("li", { hasText: titel }).first();
    await rad.getByRole("button", { name: "Dölj" }).click();
    await expect(rad).toContainText("dold");
    await page.goto("/kalender");
    await expect(page.getByText(titel)).toHaveCount(0);
  });

  test("ett slut före starten avvisas med ett begripligt fel", async ({ page }) => {
    await page.goto("/admin/kalender");
    await page.getByLabel("Rubrik").first().fill("E2E: Baklängeshändelse");
    await page.getByLabel("Datum", { exact: true }).first().fill(`${AR}-09-11`);
    await page.getByLabel("Klockslag", { exact: true }).first().fill("10:00");
    await page.getByLabel("Slutdatum (frivilligt)").first().fill(`${AR}-09-11`);
    await page.getByLabel("Slut klockan").first().fill("08:00");
    await page.getByRole("button", { name: "Lägg in" }).click();
    await expect(page.getByRole("form", { name: "Ny händelse" }).getByRole("alert")).toContainText(
      "Slutet måste ligga efter starten",
    );
  });
});
