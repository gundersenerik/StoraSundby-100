"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/config/content";
import { slugga } from "@/lib/nyheter";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Kansliets nyhetsåtgärder. Ingen behörighetskontroll i koden — RLS är
 * spärren: en icke-administratör får noll rader tillbaka och det tolkas
 * som nekat.
 *
 * SLUGGEN SÄTTS EN GÅNG, VID SKAPANDET, och följer inte med när titeln
 * ändras. En publicerad nyhet har en URL som kan vara delad på Facebook
 * eller i ett mejl, och "en gammal URL slutar fungera" är ett av besluten
 * som kräver en människa (CLAUDE.md). Hellre en slug som släpar efter
 * titeln än en död länk.
 */

export interface AtgardsResultat {
  ok: boolean;
  meddelande?: string;
}

export type NyhetsFalt = "title" | "lead" | "body" | "author";

const NYHETSFALT: ReadonlySet<string> = new Set(["title", "lead", "body", "author"]);

function uppdateraPublikt(slug?: string) {
  // Bara publika sidor — adminsidan är force-dynamic och renderas färskt
  // vid varje besök; att revalidera den skulle bara göra action-svaret
  // långsammare (se bokningarnas actions).
  revalidatePath(routes.news);
  if (slug) revalidatePath(`${routes.news}/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function skapaNyhet(formData: FormData): Promise<AtgardsResultat> {
  const titel = String(formData.get("titel") ?? "").trim();
  if (titel.length === 0) {
    return { ok: false, meddelande: "Skriv en rubrik först." };
  }
  if (titel.length > 200) {
    return { ok: false, meddelande: "Rubriken är för lång — högst 200 tecken." };
  }

  const bas = slugga(titel);
  if (!bas) {
    return { ok: false, meddelande: "Rubriken måste innehålla bokstäver eller siffror." };
  }

  const supabase = await supabaseServer();

  // Krockar sluggen med en befintlig prövas -2, -3 … — två nyheter kan
  // heta samma sak ("Årsmötet 2027" återkommer varje år).
  for (let forsok = 1; forsok <= 9; forsok++) {
    const slug = forsok === 1 ? bas : `${bas}-${forsok}`;
    const { data, error } = await supabase
      .from("posts")
      .insert({ slug, title: titel })
      .select("id")
      .maybeSingle();

    if (!error && data) {
      uppdateraPublikt();
      return { ok: true };
    }
    if (error && error.code !== "23505") {
      return { ok: false, meddelande: "Kunde inte skapa nyheten. Har du behörighet?" };
    }
  }
  return { ok: false, meddelande: "Kunde inte hitta en ledig adress för nyheten." };
}

export async function sparaNyhetsfalt(
  id: string,
  falt: NyhetsFalt,
  varde: string,
): Promise<AtgardsResultat> {
  if (!NYHETSFALT.has(falt)) {
    return { ok: false, meddelande: "Ogiltigt fält." };
  }
  if (falt === "title" && varde.trim().length === 0) {
    return { ok: false, meddelande: "Rubriken kan inte vara tom." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("posts")
    .update({ [falt]: varde.trim() === "" ? null : varde })
    .eq("id", id)
    .select("slug");

  if (error) return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt(data[0].slug);
  return { ok: true };
}

export async function sattPublicering(
  id: string,
  publicera: boolean,
): Promise<AtgardsResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("posts")
    .update({ published_at: publicera ? new Date().toISOString() : null })
    .eq("id", id)
    .select("slug");

  if (error) return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt(data[0].slug);
  return { ok: true };
}

export async function taBortNyhet(id: string): Promise<AtgardsResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select("slug");

  if (error) return { ok: false, meddelande: "Kunde inte ta bort nyheten." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt(data[0].slug);
  return { ok: true };
}
