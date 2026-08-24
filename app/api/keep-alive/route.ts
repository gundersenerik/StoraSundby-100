import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * Håller Supabase-projektet vaket.
 *
 * Free-nivån pausar ett projekt efter sju dagars låg aktivitet. Varning
 * kommer ungefär en vecka i förväg, så hela förloppet är runt två veckor.
 * En sajt med daglig trafik klarar sig, men den här har ingen ännu — och en
 * pausad databas är ett tråkigt sätt att upptäcka det.
 *
 * Läser en rad. Ingen skrivning, inga sidoeffekter. Kör via Vercel Cron.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await supabase.from("sections").select("slug").limit(1);

  if (error) {
    return NextResponse.json({ vaken: false, fel: error.message }, { status: 503 });
  }

  return NextResponse.json({ vaken: true, tid: new Date().toISOString() });
}
