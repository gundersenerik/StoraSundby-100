import { expect, test } from "@playwright/test";

/**
 * Fotona på nyckelsidorna: en bild per sida, där den belägger något sidan
 * påstår (docs/DESIGN-TRENDER.md). Testet bevakar att bilden renderas MED
 * sin alt-text — en trasig statisk import eller en tappad alt ska falla
 * här, inte upptäckas av en besökare med skärmläsare.
 *
 * Namnen är unika fragment ur alt-texterna i lib/bilder.ts (matchningen
 * är substräng). Importera inte modulen hit: Playwrights transform kan
 * inte ladda bildfiler, och att fragmenten dubblas här är en egenskap —
 * ändras en alt-text ska någon medvetet ändra på två ställen.
 */

const SIDOR: Array<[string, string | RegExp]> = [
  ["/", "träningsbollar"],
  ["/uthyrning", "uthyrningsstugor"],
  ["/anlaggningen", "Hammargärdets IP"],
  ["/lager", "småmål"],
  ["/om-foreningen", "klubbmärket"],
  ["/om-foreningen/historia", "gräsmattan för hand"],
  ["/fotboll", "västar och koner"],
  ["/orientering", "Öja Norra"],
  ["/padel", "blått underlag"],
  ["/gymnastik", "Plintar"],
  ["/skidor", "Skidåkare"],
];

for (const [sida, namn] of SIDOR) {
  test(`fotot på ${sida} renderas med sin alt-text`, async ({ page }) => {
    await page.goto(sida);
    await expect(page.getByRole("img", { name: namn })).toBeVisible();
  });
}

test("historiefotot bär sin bildtext med efterlysningen", async ({ page }) => {
  await page.goto("/om-foreningen/historia");
  await expect(page.getByText("Ur föreningens bildarkiv")).toBeVisible();
});
