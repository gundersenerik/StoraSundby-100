import { expect, test } from "@playwright/test";
import {
  ADMIN_STATE,
  rensaUthyrningsfixturer,
  skapaForfragan,
} from "./hjalp";

/**
 * Kansliets bokningsflöde: förfrågan → bekräftad → betald, dubbelbokning
 * som stoppas av databasen, och spärrade datum.
 *
 * Sparad session enligt konventionen — bara test som byter identitet
 * loggar in själva, och inget här gör det.
 *
 * Fixturerna ligger i juli 2027, långt från allt verkligt, och rensas före
 * varje test. Ett kraschat test får inte lämna en spärrad helg i den
 * publika kalendern längre än till nästa körning.
 */

test.use({ storageState: ADMIN_STATE });
test.beforeEach(rensaUthyrningsfixturer);
// Rensning även efteråt: fixturerna ligger i den skarpa databasen, och en
// kvarlämnad spärr syns som fullbokad helg för riktiga besökare tills nästa
// körning. beforeEach räddar nästa test — afterEach räddar sajten.
test.afterEach(rensaUthyrningsfixturer);

test("utloggad skickas till inloggningen från bokningsvyn", async ({ browser }) => {
  const utloggad = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await utloggad.newPage();
  await page.goto("/admin/bokningar");
  await expect(page).toHaveURL(/\/logga-in/);
  await utloggad.close();
});

test("en förfrågan bekräftas med ett klick och syns i kalendern", async ({ page }) => {
  await skapaForfragan({
    cabin_id: "stuga-1",
    fran: "2027-07-05T13:00:00Z",
    till: "2027-07-07T09:00:00Z",
  });

  await page.goto("/admin/bokningar");
  const rad = page.locator("li", { hasText: "E2E Testgäst" }).first();
  await expect(rad).toContainText("Förfrågan");

  await rad.getByRole("button", { name: "Bekräfta" }).click();
  await expect(rad.getByRole("status")).toContainText("Bokningen är bekräftad");
  await expect(rad).toContainText("Bekräftad");

  // Nästa steg i flödet: betalningen prickas av.
  await rad.getByRole("button", { name: "Markera betald" }).click();
  await expect(rad.getByRole("status")).toContainText("Betalningen är avprickad");
});

test("databasen stoppar en dubbelbokning och kansliet får ett begripligt besked", async ({ page }) => {
  // Två förfrågningar om samma stuga och överlappande helg. Båda får
  // finnas — förfrågningar blockerar ingenting. Men bara en kan bekräftas.
  await skapaForfragan({
    cabin_id: "stuga-2",
    fran: "2027-07-09T13:00:00Z",
    till: "2027-07-11T09:00:00Z",
    namn: "E2E Testgäst A",
  });
  await skapaForfragan({
    cabin_id: "stuga-2",
    fran: "2027-07-10T13:00:00Z",
    till: "2027-07-12T09:00:00Z",
    namn: "E2E Testgäst B",
  });

  await page.goto("/admin/bokningar");

  const radA = page.locator("li", { hasText: "E2E Testgäst A" }).first();
  await radA.getByRole("button", { name: "Bekräfta" }).click();
  await expect(radA.getByRole("status")).toContainText("Bokningen är bekräftad");

  const radB = page.locator("li", { hasText: "E2E Testgäst B" }).first();
  await radB.getByRole("button", { name: "Bekräfta" }).click();
  await expect(radB.getByRole("alert")).toContainText("Tiden är redan upptagen");
  // B står kvar som förfrågan — ingenting halvbekräftades.
  await expect(radB).toContainText("Förfrågan");
});

test("hela anläggningen kan inte bekräftas över en bokad stuga", async ({ page }) => {
  await skapaForfragan({
    cabin_id: "stuga-3",
    fran: "2027-07-16T13:00:00Z",
    till: "2027-07-18T09:00:00Z",
    namn: "E2E Testgäst Stuga",
  });
  await skapaForfragan({
    cabin_id: null,
    fran: "2027-07-17T13:00:00Z",
    till: "2027-07-19T09:00:00Z",
    namn: "E2E Testgäst Läger",
  });

  await page.goto("/admin/bokningar");
  const stugrad = page.locator("li", { hasText: "E2E Testgäst Stuga" }).first();
  await stugrad.getByRole("button", { name: "Bekräfta" }).click();
  await expect(stugrad.getByRole("status")).toContainText("Bokningen är bekräftad");

  const lagerrad = page.locator("li", { hasText: "E2E Testgäst Läger" }).first();
  await lagerrad.getByRole("button", { name: "Bekräfta" }).click();
  await expect(lagerrad.getByRole("alert")).toContainText("Tiden är redan upptagen");
});

test("en spärrad period syns som fullbokad i den publika kalendern", async ({ page }) => {
  // Spärren måste ligga inom kalenderns tre månader för att gå att se
  // publikt. Nästa månads tionde till tolfte är alltid inom fönstret.
  const nu = new Date();
  const ar = nu.getUTCMonth() === 11 ? nu.getUTCFullYear() + 1 : nu.getUTCFullYear();
  const manad = ((nu.getUTCMonth() + 1) % 12) + 1;
  const mm = String(manad).padStart(2, "0");

  await page.goto("/admin/bokningar");
  await page.getByLabel("Objekt").selectOption("hela-anlaggningen");
  await page.getByLabel("Från").fill(`${ar}-${mm}-10`);
  await page.getByLabel("Till och med").fill(`${ar}-${mm}-12`);
  await page.getByLabel("Anledning (frivilligt)").fill("E2E: spärrtest");
  await page.getByRole("button", { name: "Spärra" }).click();
  await expect(page.getByRole("status").last()).toContainText("Perioden är spärrad");

  await page.goto("/uthyrning");
  const manadsnamn = new Intl.DateTimeFormat("sv-SE", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ar, manad - 1, 1)));
  const tabell = page.getByRole("table", { name: new RegExp(manadsnamn, "i") });
  // Skärmläsartexten "fullbokat" ligger i cellen, inte bara en färg.
  await expect(tabell.getByRole("cell", { name: "11 fullbokat" })).toBeVisible();
  // Dagen efter spärren är ledig.
  await expect(tabell.getByRole("cell", { name: "13 ledigt" })).toBeVisible();

  // Ta bort spärren i gränssnittet — kalendern ska släppa dagarna igen.
  await page.goto("/admin/bokningar");
  await page.getByRole("button", { name: "Ta bort" }).first().click();
  await expect(page.getByRole("status").last()).toContainText("Spärren är borttagen");
  await page.goto("/uthyrning");
  await expect(tabell.getByRole("cell", { name: "11 ledigt" })).toBeVisible();
});
