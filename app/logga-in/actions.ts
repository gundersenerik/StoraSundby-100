"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Skickar en magisk länk.
 *
 * Svaret är medvetet detsamma oavsett om adressen är administratör eller
 * inte. Ett svar i stil med "den adressen har ingen behörighet" hade gjort
 * formuläret till ett verktyg för att kartlägga vilka som är administratörer.
 *
 * Att få en länk ger heller ingenting i sig. Utan rad i admin_users har man
 * exakt samma rättigheter som en anonym besökare — RLS är spärren.
 */
export async function skickaLank(_tidigare: unknown, formData: FormData) {
  const epost = String(formData.get("epost") ?? "").trim();

  if (!epost || !epost.includes("@")) {
    return { status: "fel" as const, meddelande: "Skriv en giltig e-postadress." };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await supabaseServer();

  const { error } = await supabase.auth.signInWithOtp({
    email: epost,
    options: { emailRedirectTo: `${origin}/auth/bekrafta?next=/admin` },
  });

  if (error) {
    return {
      status: "fel" as const,
      meddelande: "Länken kunde inte skickas just nu. Försök igen om en stund.",
    };
  }

  return {
    status: "skickat" as const,
    meddelande: `Om ${epost} har behörighet ligger en inloggningslänk i inkorgen. Den gäller i en timme.`,
  };
}

export async function loggaUt() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/logga-in");
}
