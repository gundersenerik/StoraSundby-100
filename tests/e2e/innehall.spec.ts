import { expect, test } from "@playwright/test";
import { ADMIN_EPOST, ICKE_ADMIN_EPOST, loggaInSom, serviceKlient } from "./hjalp";

/**
 * Ateruppratta via granssnittet, inte via databasen.
 *
 * En direktskrivning mot Supabase kor ingen revalidatePath, sa den cachade
 * 404:an for /skidor lag kvar och sankte fyra orelaterade test i andra
 * filer. Samma sak galler i drift: publiceringsandringar maste ga genom
 * server-actionen for att slaa igenom pa en statiskt genererad sida.
 */
async function aterstallPublicerad(page: import("@playwright/test").Page) {
  await page.goto("/admin/innehall");
  const sektion = page.locator("section").filter({ hasText: "Skidor" }).first();
  const dold = sektion.getByRole("button", { name: "Dold" });
  if (await dold.count()) {
    await dold.click();
    await expect(sektion.getByRole("button", { name: "Publicerad" })).toBeVisible();
    await page.waitForTimeout(1500);
  }
}

test("ändrad ingress slår igenom på sektionssidan", async ({ page }) => {
  const db = serviceKlient();
  const { data } = await db.from("sections").select("intro").eq("slug", "skidor").single();
  const original = data!.intro as string;

  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/innehall");

  const falt = page.locator("#ingress-skidor");
  await falt.fill("Provtext från E2E.");
  await falt.blur();
  await page.waitForTimeout(1500);

  await page.goto("/skidor");
  await expect(page.getByText("Provtext från E2E.")).toBeVisible();

  await db.from("sections").update({ intro: original }).eq("slug", "skidor");
});

test("dold sektion försvinner från sajten men texten finns kvar", async ({ page }) => {
  await loggaInSom(page, ADMIN_EPOST);
  await page.goto("/admin/innehall");

  const sektion = page.locator("section").filter({ hasText: "Skidor" }).first();
  await sektion.getByRole("button", { name: "Publicerad" }).click();
  await expect(sektion.getByRole("button", { name: "Dold" })).toBeVisible();
  await page.waitForTimeout(1500);

  // Texten ska finnas kvar i admin
  await page.reload();
  await expect(page.locator("#text-skidor")).not.toBeEmpty();

  // Men sidan ska inte langre vara publik
  const svar = await page.request.get("/skidor");
  expect(svar.status()).toBe(404);

  await aterstallPublicerad(page);
  const efter = await page.request.get("/skidor");
  expect(efter.status(), "sidan kom inte tillbaka efter publicering").toBe(200);
});

test("icke-admin kommer inte åt innehållsredigeringen", async ({ page }) => {
  await loggaInSom(page, ICKE_ADMIN_EPOST);
  await page.goto("/admin/innehall");
  await expect(page).toHaveURL(/fel=ej-behorig/);
});

test("keep-alive svarar", async ({ page }) => {
  const svar = await page.request.get("/api/keep-alive");
  expect(svar.status()).toBe(200);
  expect((await svar.json()).vaken).toBe(true);
});
