import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Landningspunkt för den magiska länken.
 *
 * Hanterar TVÅ flöden med avsikt.
 *
 * `token_hash` är det som fungerar överallt. Supabase verifierar token på
 * servern, och inget behöver finnas i webbläsaren sedan tidigare. Det här är
 * fallet när någon begär länken på datorn och öppnar den i mobilens mejlapp,
 * vilket är precis vad folk gör.
 *
 * `code` är PKCE. Det är säkrare men kräver att kodverifieraren ligger kvar i
 * en cookie från när länken begärdes — alltså samma webbläsare. Stöds för att
 * Supabase skickar det när flödet startats därifrån.
 *
 * Bara ett av dem behöver lyckas. Att stödja enbart `code`, som jag först
 * gjorde, ger en inloggning som fungerar på skrivbordet och tyst misslyckas
 * på telefonen.
 *
 * Engångskoden är förbrukad efter första användningen. Ett andra klick på
 * samma länk misslyckas, och det är avsiktligt.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const nasta = searchParams.get("next") ?? "/admin";

  const tokenHash = searchParams.get("token_hash");
  const typ = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await supabaseServer();

  if (tokenHash && typ) {
    const { error } = await supabase.auth.verifyOtp({ type: typ, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(`${origin}${nasta}`);
    return NextResponse.redirect(`${origin}/logga-in?fel=ogiltig-lank`);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${nasta}`);
    return NextResponse.redirect(`${origin}/logga-in?fel=ogiltig-lank`);
  }

  return NextResponse.redirect(`${origin}/logga-in?fel=saknad-kod`);
}
