import { expect, test } from "@playwright/test";
import { club } from "@/config/club";
import { voice } from "@/config/content";

const SEKTIONER = club.sections.filter((s) => s.active).map((s) => s.slug);

test.describe("sektionssidor", () => {
  for (const slug of SEKTIONER) {
    test(`/${slug} svarar och har exakt en h1`, async ({ page }) => {
      const svar = await page.goto(`/${slug}`);
      expect(svar?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
    });
  }

  test("okänd sektion ger 404, inte en tom sida", async ({ page }) => {
    const svar = await page.goto("/bandy");
    expect(svar?.status()).toBe(404);
  });

  test("sektionssidan visar sektionens egna träningstider", async ({ page }) => {
    await page.goto("/gymnastik");
    await expect(page.getByRole("heading", { name: "Träningstider" })).toBeVisible();
    await expect(page.getByText("Cirkelfys vuxen").first()).toBeVisible();
    // Fotbollens pass hör inte hemma här.
    await expect(page.getByText("F/P 2017")).toHaveCount(0);
  });

  test("kontaktuppgifter renderas ur club.ts, inte ur brödtexten", async ({ page }) => {
    await page.goto("/fotboll");
    const fotboll = club.sections.find((s) => s.slug === "fotboll");
    await expect(page.getByText(fotboll!.contactName!)).toBeVisible();
  });

  test("padel länkar till Playtomic ur config", async ({ page }) => {
    await page.goto("/padel");
    await expect(
      page.getByRole("link", { name: /boka padelbanan/i }),
    ).toHaveAttribute("href", club.facility.padelBookingUrl);
  });

  test("bär SportsOrganization i strukturerad data", async ({ page }) => {
    await page.goto("/skidor");
    const rader = await page.locator('script[type="application/ld+json"]').allTextContents();
    const typer = rader.map((r) => JSON.parse(r)["@type"]);
    expect(typer).toContain("SportsOrganization");
  });
});

test.describe("röstreglerna hålls", () => {
  const sidor = ["/", ...SEKTIONER.map((s) => `/${s}`)];

  test("inga förbjudna ord någonstans", async ({ page }) => {
    for (const sida of sidor) {
      await page.goto(sida);
      const text = (await page.locator("main").innerText()).toLowerCase();
      for (const ord of voice.forbidden) {
        expect(text, `"${ord}" finns på ${sida}`).not.toContain(ord.toLowerCase());
      }
    }
  });

  test("gamla sajtens skrivfel är rättade", async ({ page }) => {
    for (const sida of sidor) {
      await page.goto(sida);
      const text = await page.locator("main").innerText();
      expect(text, `talspråkligt "medans" på ${sida}`).not.toMatch(/\bmedans\b/);
      expect(text, `versalrubrik på ${sida}`).not.toMatch(/\b(WEBBSHOP|barnGYMNASTIK)\b/);
      expect(text, `saknat mellanslag på ${sida}`).not.toMatch(/[a-zåäö]\d{2}\.\d{2}/);
    }
  });

  test("föreningens egna fraser finns kvar", async ({ page }) => {
    await page.goto("/fotboll");
    const text = await page.locator("main").innerText();
    expect(text).toContain("våra fina gräsplaner");
    expect(text).toContain("tveka inte, hör av er");
  });
});
