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

export const ADMIN_EPOST = "erik.gundersen@schibsted.com";
export const ICKE_ADMIN_EPOST = "provanvandare.utan.behorighet@example.com";
