"use server";

import { revalidatePath } from "next/cache";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { supabaseServer } from "@/lib/supabase-server";
import { tillUtc } from "@/lib/tid";
import type { EvenemangsTyp } from "@/lib/evenemang";

/**
 * Kansliets kalenderåtgärder. RLS är spärren, som överallt annars.
 *
 * Tider matas in som datum och klockslag i svensk tid och lagras som
 * tidpunkter i UTC — händelser är händelser i tiden (migration 010),
 * och tillUtc hanterar sommartidsskiftena.
 */

export interface AtgardsResultat {
  ok: boolean;
  meddelande?: string;
}

const TYPER: ReadonlySet<string> = new Set([
  "match", "tavling", "lager", "arsmote", "staddag", "fest", "ovrigt",
]);

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const KLOCKSLAG = /^\d{2}:\d{2}$/;

const sektionsslugs: ReadonlySet<string> = new Set(club.sections.map((s) => s.slug));

function uppdateraPublikt() {
  revalidatePath("/admin/kalender");
  revalidatePath(routes.calendar);
  revalidatePath("/");
}

interface TidFalt {
  datum: string;
  klockslag: string;
  slutdatum: string;
  slutklockslag: string;
}

/**
 * Tolkar tidsfälten till start och slut i UTC.
 *
 * Slut är frivilligt. Bara ett slutdatum utan klockslag betyder "hela den
 * dagen" och blir 23.59 — händelsen ska stå kvar i kalendern tills dagen
 * är över, inte försvinna vid midnatt innan.
 */
function tolkaTider(falt: TidFalt):
  | { ok: true; starts_at: string; ends_at: string | null }
  | { ok: false; meddelande: string } {
  if (!DATUM.test(falt.datum) || !KLOCKSLAG.test(falt.klockslag)) {
    return { ok: false, meddelande: "Ange datum och klockslag för starten." };
  }
  const start = tillUtc(falt.datum, falt.klockslag);

  let slut: Date | null = null;
  if (falt.slutdatum || falt.slutklockslag) {
    const datum = falt.slutdatum || falt.datum;
    const klockslag = falt.slutklockslag || "23:59";
    if (!DATUM.test(datum) || !KLOCKSLAG.test(klockslag)) {
      return { ok: false, meddelande: "Sluttiden är inte fullständig." };
    }
    slut = tillUtc(datum, klockslag);
    if (slut <= start) {
      return { ok: false, meddelande: "Slutet måste ligga efter starten." };
    }
  }

  return { ok: true, starts_at: start.toISOString(), ends_at: slut?.toISOString() ?? null };
}

export async function skapaHandelse(formData: FormData): Promise<AtgardsResultat> {
  const titel = String(formData.get("titel") ?? "").trim();
  const typ = String(formData.get("typ") ?? "ovrigt");
  const sektion = String(formData.get("sektion") ?? "");
  const plats = String(formData.get("plats") ?? "").trim();
  const beskrivning = String(formData.get("beskrivning") ?? "").trim();

  if (titel.length === 0) return { ok: false, meddelande: "Skriv en rubrik först." };
  if (titel.length > 200) return { ok: false, meddelande: "Rubriken är för lång — högst 200 tecken." };
  if (!TYPER.has(typ)) return { ok: false, meddelande: "Ogiltig typ." };
  if (sektion && !sektionsslugs.has(sektion)) return { ok: false, meddelande: "Ogiltig sektion." };

  const tider = tolkaTider({
    datum: String(formData.get("datum") ?? ""),
    klockslag: String(formData.get("klockslag") ?? ""),
    slutdatum: String(formData.get("slutdatum") ?? ""),
    slutklockslag: String(formData.get("slutklockslag") ?? ""),
  });
  if (!tider.ok) return { ok: false, meddelande: tider.meddelande };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .insert({
      title: titel,
      kind: typ as EvenemangsTyp,
      starts_at: tider.starts_at,
      ends_at: tider.ends_at,
      place: plats || null,
      description: beskrivning || null,
      section_slug: sektion || null,
    })
    .select("id");

  if (error || !data?.length) {
    return { ok: false, meddelande: "Kunde inte skapa händelsen. Har du behörighet?" };
  }

  uppdateraPublikt();
  return { ok: true };
}

export type HandelseFalt = "title" | "place" | "description" | "kind" | "section_slug";

const HANDELSEFALT: ReadonlySet<string> = new Set([
  "title", "place", "description", "kind", "section_slug",
]);

export async function sparaHandelsefalt(
  id: string,
  falt: HandelseFalt,
  varde: string,
): Promise<AtgardsResultat> {
  if (!HANDELSEFALT.has(falt)) return { ok: false, meddelande: "Ogiltigt fält." };
  if (falt === "title" && varde.trim().length === 0) {
    return { ok: false, meddelande: "Rubriken kan inte vara tom." };
  }
  if (falt === "kind" && !TYPER.has(varde)) return { ok: false, meddelande: "Ogiltig typ." };
  if (falt === "section_slug" && varde && !sektionsslugs.has(varde)) {
    return { ok: false, meddelande: "Ogiltig sektion." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .update({ [falt]: varde.trim() === "" ? null : varde })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt();
  return { ok: true };
}

export async function sparaHandelsetid(id: string, falt: TidFalt): Promise<AtgardsResultat> {
  const tider = tolkaTider(falt);
  if (!tider.ok) return { ok: false, meddelande: tider.meddelande };

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .update({ starts_at: tider.starts_at, ends_at: tider.ends_at })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt();
  return { ok: true };
}

export async function sattSynlighet(id: string, published: boolean): Promise<AtgardsResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .update({ published })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt();
  return { ok: true };
}

export async function taBortHandelse(id: string): Promise<AtgardsResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, meddelande: "Kunde inte ta bort händelsen." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  uppdateraPublikt();
  return { ok: true };
}
