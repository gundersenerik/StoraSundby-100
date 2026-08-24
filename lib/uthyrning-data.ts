import { supabase } from "./supabase";
import type { Bokning, Stuga, UpptagenPeriod } from "./uthyrning";

/**
 * Dataåtkomsten för uthyrningen, skild från logiken av samma skäl som
 * traning-data: rena funktioner ska gå att testa utan databas.
 *
 * Publika läsningar går via läsklienten. Bokningstabellen har INGEN publik
 * läspolicy — den innehåller kontaktuppgifter — så kalendern läser i
 * stället upptagna_perioder(), en funktion som bara lämnar ut objekt och
 * datum. Skrivningar sker i server actions med sessionsklienten, där RLS
 * avgör vad som får ske.
 */

export async function hamtaStugor(): Promise<Stuga[]> {
  const { data, error } = await supabase
    .from("cabins")
    .select("id, namn, beds, dog_friendly, description, sort_order")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as Stuga[];
}

export async function hamtaUpptagnaPerioder(): Promise<UpptagenPeriod[]> {
  const { data, error } = await supabase.rpc("upptagna_perioder");
  if (error) throw error;
  return (data ?? []) as UpptagenPeriod[];
}

/** Admin: alla bokningar, senaste förfrågan först. RLS släpper bara igenom admin. */
export async function hamtaBokningar(
  klient: typeof supabase,
): Promise<Bokning[]> {
  const { data, error } = await klient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Bokning[];
}
