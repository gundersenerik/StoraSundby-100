import { expect, test } from "@playwright/test";
import { club } from "@/config/club";

async function strukturerad(page: import("@playwright/test").Page) {
  const rader = await page.locator('script[type="application/ld+json"]').allTextContents();
  return rader.map((r) => JSON.parse(r));
}

test.describe("strukturerad data", () => {
  test("startsidan bär SportsClub och Place", async ({ page }) => {
    await page.goto("/");
    const typer = (await strukturerad(page)).map((d) => d["@type"]);
    expect(typer).toContain("SportsClub");
    expect(typer).toContain("Place");
  });

  test("klubbdatan kommer ur config och inte ur en kopia", async ({ page }) => {
    await page.goto("/");
    const klubb = (await strukturerad(page)).find((d) => d["@type"] === "SportsClub");
    expect(klubb.name).toBe(club.identity.legalName);
    expect(klubb.foundingDate).toBe(club.identity.foundedISO);
    expect(klubb.address.postalCode).toBe(club.contact.address.postalCode);
    expect(klubb.email).toBe(club.contact.email);
  });

  test("publicerar aldrig ett platshållarvärde", async ({ page }) => {
    await page.goto("/");
    const allt = JSON.stringify(await strukturerad(page));
    // Ett platshållarvärde i Googles index är värre än inget alls.
    // Fältet utelämnas hellre — se arPlatshallare i strukturerad-data.ts.
    expect(allt).not.toContain("XXX");
  });

  test("organisationsnumret når strukturerad data och kommer ur config", async ({ page }) => {
    await page.goto("/");
    const klubb = (await strukturerad(page)).find((d) => d["@type"] === "SportsClub");
    // Numret är belagt i två oberoende källor (se KALLOR.md) och publiceras
    // därför. Testet vaktar kedjan config -> JSON-LD: byts numret i club.ts
    // ska det slå igenom här utan att någon rör den här filen.
    expect(klubb.taxID).toBe(club.identity.orgNumber);
  });

  test("träningstider bär BreadcrumbList", async ({ page }) => {
    await page.goto("/traningstider");
    const typer = (await strukturerad(page)).map((d) => d["@type"]);
    expect(typer).toContain("BreadcrumbList");
  });
});

test.describe("sidmetadata", () => {
  const sidor = ["/", "/traningstider"];

  test("varje sida har unik title och description", async ({ page }) => {
    const sedda = new Set<string>();
    for (const sida of sidor) {
      await page.goto(sida);
      const titel = await page.title();
      const beskrivning = await page
        .locator('meta[name="description"]')
        .getAttribute("content");

      expect(titel.length, `${sida} saknar title`).toBeGreaterThan(0);
      expect(beskrivning?.length ?? 0, `${sida} saknar description`).toBeGreaterThan(0);
      expect(sedda.has(titel), `${sida} har samma title som en annan sida`).toBe(false);
      sedda.add(titel);
    }
  });

  test("admin och inloggning indexeras inte", async ({ page }) => {
    await page.goto("/logga-in");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
  });
});

test.describe("robots och sitemap", () => {
  test("robots.txt pekar ut sitemap och spärrar admin", async ({ page }) => {
    const svar = await page.request.get("/robots.txt");
    expect(svar.status()).toBe(200);
    const text = await svar.text();
    expect(text).toContain("Sitemap:");
    expect(text).toContain("/admin");
  });

  test("sitemap listar bara sidor som svarar", async ({ page }) => {
    const svar = await page.request.get("/sitemap.xml");
    expect(svar.status()).toBe(200);
    const xml = await svar.text();

    const urler = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(urler.length).toBeGreaterThan(0);

    for (const url of urler) {
      const sokvag = new URL(url).pathname;
      const sidsvar = await page.request.get(sokvag);
      expect(sidsvar.status(), `${sokvag} i sitemap svarade ${sidsvar.status()}`).toBe(200);
    }
  });
});
