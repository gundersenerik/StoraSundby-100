import { createClient } from "@supabase/supabase-js";
import type { Bokning, Stuga } from "@/lib/uthyrning";
import { icalFeed } from "@/lib/uthyrning-ical";

/**
 * iCal-feed för kansliets kalender.
 *
 * Prenumereras på i Google Kalender eller Apple Kalender, så att den som
 * sköter uthyrningen ser bokningarna bredvid sina egna utan att logga in.
 *
 * BAKOM EN NYCKEL. Feeden innehåller gästnamn och kontaktuppgifter, så den
 * är inte publik: adressen kräver ?nyckel= som matchar UTHYRNING_ICAL_NYCKEL
 * i miljön. Utan nyckel i miljön är feeden avstängd och svarar 404 — en
 * halvkonfigurerad hemlighet ska stänga dörren, inte lämna den på glänt.
 *
 * En kalenderapp kan inte logga in, så läsningen sker med service role på
 * servern EFTER nyckelkontrollen. Nyckeln är feedens behörighet.
 */
export const dynamic = "force-dynamic";

export async function GET(begaran: Request) {
  const nyckel = process.env.UTHYRNING_ICAL_NYCKEL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!nyckel || !serviceRole) {
    return new Response("Hittades inte", { status: 404 });
  }

  const angiven = new URL(begaran.url).searchParams.get("nyckel") ?? "";
  if (angiven !== nyckel) {
    return new Response("Hittades inte", { status: 404 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRole, {
    auth: { persistSession: false },
  });

  const [bokningar, stugor] = await Promise.all([
    supabase
      .from("bookings")
      .select("*")
      .in("status", ["forfragan", "bekraftad", "betald"])
      .order("starts_at"),
    supabase.from("cabins").select("id, namn, beds, dog_friendly, description, sort_order"),
  ]);

  if (bokningar.error || stugor.error) {
    return new Response("Kunde inte läsa bokningarna", { status: 503 });
  }

  const stugnamn = new Map(((stugor.data ?? []) as Stuga[]).map((s) => [s.id, s.namn]));
  const feed = icalFeed((bokningar.data ?? []) as Bokning[], stugnamn);

  return new Response(feed, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
