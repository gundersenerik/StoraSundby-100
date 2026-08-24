import { expect, test } from "@playwright/test";
import { ADMIN_STATE, serviceKlient } from "./hjalp";

test.use({ storageState: ADMIN_STATE });

/**
 * Kopiering och säsongsbyte, i en EGEN säsong.
 *
 * Testerna rör aldrig okand-2026, som de publika testerna läser. Första
 * versionen gjorde det, och fyra orelaterade test föll i full svit trots
 * att de passerade var för sig.
 *
 * Massåtgärderna i sig ligger i databasen och testas mot den i
 * massatgarder.spec.ts. Här testas vägen in: att en kopierad säsong går
 * att hitta och öppna.
 */

let sasong: string;
let kopia: string;

test.beforeEach(async () => {
  sasong = `prov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  kopia = `${sasong}-kopia`;

  const db = serviceKlient();
  await db.from("training_sessions").insert([
    { section_slug: "fotboll", season: sasong, grupp: "Prov A", weekday: 4, starts_at: "19:00", ends_at: "20:00", status: "aktiv", sort_order: 1 },
    { section_slug: "fotboll", season: sasong, grupp: "Prov B", weekday: 1, starts_at: "18:30", ends_at: "19:30", status: "aktiv", sort_order: 2 },
  ]);
});

test.afterEach(async () => {
  const db = serviceKlient();
  await db.from("training_sessions").delete().eq("season", sasong);
  await db.from("training_sessions").delete().eq("season", kopia);
});

test("kopierad säsong går att öppna och redigera", async ({ page }) => {
  await page.goto(`/admin/traningstider?sasong=${sasong}`);

  await page.getByLabel("Namn på den nya säsongen").fill(kopia);
  await page.getByRole("button", { name: "Kopiera", exact: true }).click();

  const ruta = page.locator("section", {
    has: page.getByRole("heading", { name: /kopiera till en ny/i }),
  });
  await expect(ruta.getByRole("status")).toContainText("2 pass kopierade");

  // Utan säsongsväljaren skapade kopieringen något osynligt.
  await page.goto(`/admin/traningstider?sasong=${kopia}`);
  await expect(page.getByRole("combobox", { name: "Säsong" })).toHaveValue(kopia);
  await expect(page.locator('input[aria-label="Grupp"][value="Prov A"]')).toBeVisible();

  // Ursprungssäsongen ska vara orörd.
  const db = serviceKlient();
  const { data } = await db.from("training_sessions").select("id").eq("season", sasong);
  expect(data?.length).toBe(2);
});

test("vägrar kopiera till en säsong som redan har pass", async ({ page }) => {
  await page.goto(`/admin/traningstider?sasong=${sasong}`);
  const ruta = page.locator("section", {
    has: page.getByRole("heading", { name: /kopiera till en ny/i }),
  });

  await page.getByLabel("Namn på den nya säsongen").fill(kopia);
  await page.getByRole("button", { name: "Kopiera", exact: true }).click();
  await expect(ruta.getByRole("status")).toContainText("kopierade");

  await page.getByRole("button", { name: "Kopiera", exact: true }).click();
  await expect(ruta.getByRole("status")).not.toContainText("2 pass kopierade till");

  const db = serviceKlient();
  const { data } = await db.from("training_sessions").select("id").eq("season", kopia);
  expect(data?.length, "kopieringen kordes tva ganger och gav dubbletter").toBe(2);
});

test("okänd säsong faller tillbaka på standardsäsongen i stället för att visa tomt", async ({ page }) => {
  await page.goto("/admin/traningstider?sasong=finns-inte");
  await expect(page.locator('input[aria-label="Grupp"][value="F/P 2017"]')).toBeVisible();
});
