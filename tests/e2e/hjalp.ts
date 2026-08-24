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
