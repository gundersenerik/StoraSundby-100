import { expect, test } from "@playwright/test";
import { club } from "@/config/club";

/**
 * Föreningssidorna: om föreningen, kontakt, anläggningen och läger.
 * Allt innehåll kommer ur config och belagda källor — testerna bevakar
 * både att det rätta syns och att platshållare ALDRIG gör det.
 */

test.describe("/om-foreningen", () => {
  test("visar ändamålsparagrafen ordagrant och exakt en h1", async ({ page }) => {
    await page.goto("/om-foreningen");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByText(club.identity.purposeVerbatim)).toBeVisible();
  });

  test("visar ordföranden men aldrig en platshållarledamot", async ({ page }) => {
    await page.goto("/om-foreningen");
    await expect(page.getByText(club.board.members[0].name)).toBeVisible();
    // Regeln "publicera aldrig ett platshållarvärde" gäller namn också:
    // så länge styrelsen är todo() får inget påhittat namn synas.
    await expect(page.getByText("Ledamot 2")).toHaveCount(0);
  });

  test("föreningsuppgifterna kommer ur config", async ({ page }) => {
    await page.goto("/om-foreningen");
    await expect(page.getByText(club.identity.orgNumber)).toBeVisible();
    // first: adressen står också i sidfotens address-element på varje sida.
    await expect(page.getByText(new RegExp(club.contact.address.street)).first()).toBeVisible();
  });
});

test.describe("/kontakt", () => {
  test("visar kansliets uppgifter och sektionskontakterna", async ({ page }) => {
    await page.goto("/kontakt");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("link", { name: club.contact.email }).first(),
    ).toBeVisible();
    // Personliga kontakter, inte funktionsbrevlådor — fotbollens telefon
    // är den unika markören; "Fotboll" ensamt krockar med sektionsmenyn.
    await expect(
      page.getByRole("link", { name: club.sections[0].contactPhone! }),
    ).toBeVisible();
  });

  test("utan e-postnyckel visas mejluppmaningen, aldrig ett formulär som tappar meddelanden", async ({ page }) => {
    // CI och lokal utveckling saknar RESEND_API_KEY med flit. Formuläret
    // ska då inte finnas — ett formulär vars meddelanden går i papperskorgen
    // är värre än inget. Formulärlägets logik (spamskydd, klockskev,
    // felvägar) bevakas av enhetstesterna i tests/enhet/kontakt.test.ts;
    // att rendera det här hade krävt ett eget bygge med nyckel satt.
    await page.goto("/kontakt");
    await expect(page.getByRole("form", { name: "Skriv till oss" })).toHaveCount(0);
    await expect(page.getByText("Tveka inte, hör av er!")).toBeVisible();
  });
});

test.describe("/anlaggningen och /lager", () => {
  test("anläggningen listar planerna, stugorna och padelbokningen", async ({ page }) => {
    await page.goto("/anlaggningen");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("link", { name: "Playtomic" })).toBeVisible();
    await expect(page.getByRole("link", { name: "uthyrningssidan" })).toBeVisible();
  });

  test("lägersidan behåller föreningens egna ord och pekar mot förfrågan", async ({ page }) => {
    await page.goto("/lager");
    await expect(page.getByRole("heading", { name: "Kom på läger!", level: 1 })).toBeVisible();
    await expect(page.getByText("skapa minnen för livet")).toBeVisible();
    await expect(page.getByRole("link", { name: "berätta vad ni planerar" })).toBeVisible();
  });

  test("gamla /läger landar på en riktig sida, inte bara en ny adress", async ({ page }) => {
    // Redirect-testet i publik-vy bevakar adressbytet; det här bevakar att
    // målet faktiskt är en sida — tills nu var /lager en 404.
    await page.goto("/läger");
    await expect(page.getByRole("heading", { name: "Kom på läger!", level: 1 })).toBeVisible();
  });
});
