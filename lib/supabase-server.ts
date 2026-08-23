import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Serverklient med session från cookies.
 *
 * Används i Server Components, route handlers och server actions. Sessionen
 * ligger i httpOnly-cookies, inte i localStorage — en session som JavaScript
 * kan läsa är en session som en injicerad skript kan stjäla.
 */
export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Anropas från en Server Component, där cookies är skrivskyddade.
            // Middleware uppdaterar sessionen i stället.
          }
        },
      },
    },
  );
}

/**
 * Den inloggades verifierade e-postadress, eller null.
 *
 * Använder getUser(), inte getSession(). getSession() läser cookien rakt av
 * utan att kontrollera den mot Supabase — den går alltså att förfalska.
 * getUser() verifierar token på servern. Skillnaden spelar roll här.
 */
export async function inloggadEpost(): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return data.user.email;
}

/**
 * Sant om den inloggade är administratör.
 *
 * Frågar databasen i stället för att lita på klienten. Det här är bara till
 * för att visa rätt gränssnitt — den verkliga spärren är RLS, som gäller
 * oavsett vad koden här råkar returnera.
 */
export async function arAdmin(): Promise<boolean> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.from("admin_users").select("email").limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}
