import { createClient } from "@supabase/supabase-js";

/**
 * Läsklient för publikt innehåll.
 *
 * Publishable key är inte en hemlighet — den skickas till webbläsaren och
 * skyddas av Row Level Security. Service role-nyckeln, som går förbi RLS,
 * får aldrig nå klienten och ligger inte i den här filen.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL och NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY måste vara satta. Se .env.example.",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});
