import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Landningspunkt för den magiska länken.
 *
 * Länken bär en engångskod som växlas mot en session. Koden är förbrukad
 * efter första användningen — ett andra klick på samma länk misslyckas, och
 * det är avsiktligt.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nasta = searchParams.get("next") ?? "/admin";

  if (!code) {
    return NextResponse.redirect(`${origin}/logga-in?fel=saknad-kod`);
  }

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/logga-in?fel=ogiltig-lank`);
  }

  return NextResponse.redirect(`${origin}${nasta}`);
}
