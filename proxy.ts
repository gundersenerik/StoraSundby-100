import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Håller sessionen levande.
 *
 * Hette middleware.ts fram till Next 16, som fasar ut den konventionen till
 * förmån för proxy.ts. Samma funktion, nytt namn.
 *
 * Supabase-tokens går ut. Utan en uppdatering på varje request loggas en
 * ledare ut mitt i arbetet, vilket är särskilt irriterande på en telefon.
 * Middleware förnyar token och skriver tillbaka cookien.
 *
 * Proxyn gör INGEN behörighetskontroll. Den vore fel plats för det:
 * spärren ska ligga i RLS, som gäller oavsett hur någon når datan.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
