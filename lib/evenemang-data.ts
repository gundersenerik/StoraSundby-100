import { supabase } from "./supabase";
import { arAktuell, type Evenemang } from "./evenemang";

/**
 * Dataåtkomst för evenemang. RLS släpper bara igenom publicerat till
 * läsklienten; admin läser allt via sessionsklienten.
 */

/**
 * Kommande och pågående händelser, tidigast först.
 *
 * Frågan hämtar allt som startat de senaste 30 dagarna eller senare och
 * låter arAktuell avgöra resten i JS — ett läger som pågår ska stå kvar
 * tills det är slut, och det villkoret ("slut i framtiden, eller start i
 * dag utan slut") blir oläsligt som REST-filter. Ingen händelse i en
 * byförening pågår längre än en månad, så fönstret räcker.
 */
export async function hamtaKommande(nu: Date): Promise<Evenemang[]> {
  const aldsta = new Date(nu.getTime() - 30 * 86_400_000);
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("starts_at", aldsta.toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Evenemang[]).filter((e) => arAktuell(e, nu));
}

/** Admin: allt, tidigast först — vyn delar själv upp i kommande och passerat. */
export async function hamtaAllaEvenemang(klient: typeof supabase): Promise<Evenemang[]> {
  const { data, error } = await klient
    .from("events")
    .select("*")
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Evenemang[];
}
