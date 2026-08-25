import { createClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

/**
 * Loggar in i testet utan att gå via en inkorg.
 *
 * generateLink ger samma token_hash som mejlet skulle burit. Vi öppnar
 * alltså exakt den URL en ledare klickar på — flödet testas på riktigt,
 * bara utan mejlsteget.
 *
 * Detta kräver service role-nyckeln och sker enbart i test.
 */
export async function loggaInSom(page: Page, epost: string) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // generateLink for en adress som aldrig loggat in ar inte tillforlitlig.
  // Skapa anvandaren forst, och ignorera att hon redan finns.
  await admin.auth.admin
    .createUser({ email: epost, email_confirm: true })
    .catch(() => undefined);

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: epost,
  });

  if (error || !data.properties?.hashed_token) {
    throw new Error(`Kunde inte skapa inloggningslänk: ${error?.message ?? "okänt fel"}`);
  }

  await page.goto(
    `/auth/bekrafta?token_hash=${data.properties.hashed_token}&type=magiclink&next=/admin`,
  );
}

export function serviceKlient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

export const ADMIN_STATE = "playwright/.auth/admin.json";
export const ICKE_ADMIN_STATE = "playwright/.auth/icke-admin.json";

export const ADMIN_EPOST = "erik.gundersen@schibsted.com";
export const ICKE_ADMIN_EPOST = "provanvandare.utan.behorighet@example.com";

/**
 * Nollställer fotbollens pass till gamla sajtens värden.
 *
 * Körs FÖRE varje muterande test, inte efter. Att städa efteråt räcker inte:
 * ett test som kraschar lämnar kvar sitt tillstånd, och nästa test hittar då
 * en knapp som heter "Uppehåll" där det väntade sig "Pausa". Att i stället
 * garantera utgångsläget gör varje test oberoende av de andra.
 *
 * Direktskrivning duger här eftersom adminvyerna är force-dynamic och alltid
 * läser färskt. Publika vyer är ISR-cachade, men varje publik kontroll i
 * testen sker efter en åtgärd i gränssnittet, som kör revalidatePath.
 */
export async function nollstallFotboll() {
  const db = serviceKlient();
  const original: Record<string, [string | null, string | null]> = {
    "F/P 2013–2016": ["19:00", "20:00"],
    "F/P 2017": ["18:30", "19:30"],
    "F/P 2018–2019": ["18:00", "19:00"],
  };

  for (const [grupp, [start, slut]] of Object.entries(original)) {
    await db
      .from("training_sessions")
      .update({ starts_at: start, ends_at: slut, status: "aktiv", place: null })
      .eq("grupp", grupp)
      .eq("season", "okand-2026");
  }

  await db
    .from("training_sessions")
    .update({ starts_at: null, ends_at: null, weekday: null, status: "uppehall" })
    .eq("grupp", "Bollek från 2022");

  await db.from("training_sessions").delete().eq("grupp", "Ny grupp");
}

/* ─── Uthyrningens fixturer ────────────────────────────────────────────── */

/**
 * Egen fixtur, aldrig riktig data — konventionen från träningstiderna
 * gäller även här. E2E-bokningar märks med en adress ingen riktig gäst
 * har, läggs långt fram i tiden, och rensas FÖRE varje test: ett test som
 * kraschar lämnar kvar sitt tillstånd, och nästa körning ska inte ärva det.
 */
export const E2E_BOKNINGS_EPOST = "e2e-uthyrning@example.com";

export async function rensaUthyrningsfixturer() {
  const db = serviceKlient();
  await db.from("bookings").delete().eq("contact_email", E2E_BOKNINGS_EPOST);
  await db.from("booking_blocks").delete().like("reason", "E2E:%");
}

/**
 * Innehållsfixturer: nyheter och händelser som E2E skapar märks med
 * "E2E:" i rubriken och rensas före och efter varje test — de ligger i
 * skarpa databasen och får inte bli kvar som publika testrader.
 */
export async function rensaInnehallsfixturer() {
  const db = serviceKlient();
  await db.from("posts").delete().like("title", "E2E:%");
  await db.from("events").delete().like("title", "E2E:%");
}

export async function skapaForfragan(input: {
  cabin_id: string | null;
  fran: string; // "2027-07-10T13:00:00Z"
  till: string;
  namn?: string;
}) {
  const db = serviceKlient();
  const { data, error } = await db
    .from("bookings")
    .insert({
      cabin_id: input.cabin_id,
      starts_at: input.fran,
      ends_at: input.till,
      party_size: 6,
      purpose: "overnattning",
      contact_name: input.namn ?? "E2E Testgäst",
      contact_email: E2E_BOKNINGS_EPOST,
      status: "forfragan",
    })
    .select("id")
    .single();
  if (error) throw new Error(`Kunde inte skapa testförfrågan: ${error.message}`);
  return data.id as string;
}
