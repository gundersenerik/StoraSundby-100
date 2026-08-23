import { supabase } from "./supabase";
import type { Pass, Sektion } from "./traning";

/**
 * Dataåtkomsten ligger separat från formateringen med avsikt.
 *
 * Låg de ihop drog ett enhetstest av formateraTid() in Supabase-klienten,
 * som kastar vid modulladdning om miljövariablerna saknas. Rena funktioner
 * ska gå att testa utan att en databas finns.
 */
export async function hamtaSchema(season: string) {
  const [pass, sektioner] = await Promise.all([
    supabase.from("training_sessions").select("*").eq("season", season).order("sort_order"),
    supabase.from("sections").select("slug, heading, sort_order").order("sort_order"),
  ]);

  if (pass.error) throw pass.error;
  if (sektioner.error) throw sektioner.error;

  return {
    pass: (pass.data ?? []) as Pass[],
    sektioner: (sektioner.data ?? []) as Sektion[],
  };
}
