import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { skickaEpost } from "@/lib/epost";
import type { Bokning, Stuga } from "@/lib/uthyrning";
import { PAMINNELSE_DAGAR_FORE, paminnelsemall } from "@/lib/uthyrning-epost";

/**
 * Påminnelse före ankomst. Körs dagligen via Vercel Cron.
 *
 * BAKOM CRON_SECRET. Rutten läser med service role och skickar mejl — en
 * öppen endpoint hade låtit vem som helst trigga utskick och bränna
 * mejlkvoten. Vercel skickar automatiskt `Authorization: Bearer <värdet>`
 * till cron-anrop när miljövariabeln CRON_SECRET finns. Utan secret i
 * miljön är rutten avstängd, av samma skäl som iCal-feeden: en
 * halvkonfigurerad hemlighet ska stänga dörren, inte lämna den på glänt.
 *
 * STÄMPLA FÖRST, SKICKA SEDAN. Stämpeln tas i en villkorad UPDATE
 * (where paminnelse_skickad_at is null), så två samtidiga körningar kan
 * inte båda göra anspråk på samma bokning — bara den som fick raden
 * skickar. Misslyckas utskicket rullas stämpeln tillbaka, så bokningen
 * plockas upp igen nästa dygn.
 */
export const dynamic = "force-dynamic";

export async function GET(begaran: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return new Response("Hittades inte", { status: 404 });
  }
  if (begaran.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Hittades inte", { status: 404 });
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRole) {
    return NextResponse.json({ skickade: 0, notering: "SUPABASE_SERVICE_ROLE_KEY saknas" });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skickade: 0, notering: "RESEND_API_KEY saknas — inga påminnelser går ut än" });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRole, {
    auth: { persistSession: false },
  });

  const nu = Date.now();
  const fonster = new Date(nu + PAMINNELSE_DAGAR_FORE * 86_400_000).toISOString();

  const [kandidater, stugor] = await Promise.all([
    supabase
      .from("bookings")
      .select("id")
      .in("status", ["bekraftad", "betald"])
      .is("paminnelse_skickad_at", null)
      .gt("starts_at", new Date(nu).toISOString())
      .lte("starts_at", fonster),
    supabase.from("cabins").select("id, namn, beds, dog_friendly, description, sort_order"),
  ]);

  if (kandidater.error) {
    return NextResponse.json({ skickade: 0, fel: kandidater.error.code ?? "läsfel" }, { status: 503 });
  }

  const stugnamn = new Map(((stugor.data ?? []) as Stuga[]).map((s) => [s.id, s.namn]));
  let skickade = 0;

  for (const kandidat of kandidater.data ?? []) {
    // Anspråket: bara den körning som lyckas stämpla raden skickar mejlet.
    const { data: ansprak } = await supabase
      .from("bookings")
      .update({ paminnelse_skickad_at: new Date().toISOString() })
      .eq("id", kandidat.id)
      .is("paminnelse_skickad_at", null)
      .select("*");

    const bokning = (ansprak?.[0] ?? null) as Bokning | null;
    if (!bokning) continue;

    const mall = paminnelsemall(bokning, bokning.cabin_id ? stugnamn.get(bokning.cabin_id) ?? null : null);
    const svar = await skickaEpost({ till: bokning.contact_email, amne: mall.amne, text: mall.text });

    if (!svar.skickat) {
      // Rulla tillbaka anspråket så nästa körning försöker igen.
      await supabase
        .from("bookings")
        .update({ paminnelse_skickad_at: null })
        .eq("id", bokning.id);
      continue;
    }
    skickade++;
  }

  return NextResponse.json({ skickade });
}
