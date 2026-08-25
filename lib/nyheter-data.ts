import { supabase } from "./supabase";
import type { Nyhet } from "./nyheter";

/**
 * Dataåtkomst för nyheter. Publika läsningar via läsklienten, där RLS bara
 * släpper igenom publicerat — filtret här är för ordning och tydlighet,
 * spärren är policyn.
 */

/**
 * Publicerade nyheter, senaste först. Utan gränsvärde hämtas allt —
 * sitemapen måste lista varje levande sida, annars blir gamla artiklar
 * onåbara utan att någon märker det. Listsidor skickar ett eget tak.
 */
export async function hamtaPublicerade(gransvarde?: number): Promise<Nyhet[]> {
  let fraga = supabase
    .from("posts")
    .select("*")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });
  if (gransvarde !== undefined) fraga = fraga.limit(gransvarde);
  const { data, error } = await fraga;
  if (error) throw error;
  return (data ?? []) as Nyhet[];
}

export async function hamtaPubliceradViaSlug(slug: string): Promise<Nyhet | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .not("published_at", "is", null)
    .maybeSingle();
  if (error) throw error;
  return (data as Nyhet) ?? null;
}

/** Admin: allt, utkast överst, därefter senast publicerad först. */
export async function hamtaAllaNyheter(klient: typeof supabase): Promise<Nyhet[]> {
  const { data, error } = await klient
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false, nullsFirst: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Nyhet[];
}
