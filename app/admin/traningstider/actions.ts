"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import type { Status } from "@/lib/traning";

/**
 * Sparar en ändring på ett pass.
 *
 * Ingen behörighetskontroll här. Den ligger i RLS: en användare som inte
 * finns i admin_users får noll rader uppdaterade, oavsett vad som skickas.
 * En kontroll här hade varit ett andra lager, inte spärren — och ett andra
 * lager som kan glömmas bort är värre än inget, eftersom det inbjuder till
 * att lita på det.
 *
 * Databasen äger också reglerna: sluttid efter starttid, veckodag 1–7, och
 * att ett aktivt pass måste ha tider. Vi upprepar dem inte här. Ett fel
 * fångas och visas för användaren.
 */
export type Falt = "weekday" | "starts_at" | "ends_at" | "place" | "grupp" | "status";

export interface SparResultat {
  ok: boolean;
  meddelande?: string;
}

function tolka(falt: Falt, varde: string): unknown {
  const rensat = varde.trim();

  if (falt === "weekday") return rensat === "" ? null : Number(rensat);
  if (falt === "starts_at" || falt === "ends_at") return rensat === "" ? null : rensat;
  if (falt === "status") return rensat as Status;
  return rensat === "" ? null : rensat;
}

export async function sparaPass(id: string, falt: Falt, varde: string): Promise<SparResultat> {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("training_sessions")
    .update({ [falt]: tolka(falt, varde) })
    .eq("id", id)
    .select("id");

  if (error) {
    // Databasens egna regler, översatta till något en ledare förstår.
    const kod = error.code ?? "";
    if (kod === "23514") {
      return {
        ok: false,
        meddelande:
          "Ändringen strider mot en regel: sluttiden måste vara efter starttiden, och ett pass som inte ligger på uppehåll måste ha både dag och tider.",
      };
    }
    return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  }

  if (!data || data.length === 0) {
    return { ok: false, meddelande: "Du har inte behörighet att ändra det här passet." };
  }

  revalidatePath("/admin/traningstider");
  revalidatePath("/traningstider");
  return { ok: true };
}

/* ─── Massåtgärder ──────────────────────────────────────────────────────── */

/**
 * Ligger som databasfunktioner, inte som loopar här.
 *
 * Att hämta tjugo rader, räkna om dem i JavaScript och skriva tillbaka dem
 * en och en ger ett halvfärdigt schema om något går fel på rad tolv. I
 * databasen är hela åtgärden atomär: allt eller inget.
 */
async function anropa(namn: string, args: Record<string, unknown>): Promise<SparResultat & { antal?: number }> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.rpc(namn, args);

  if (error) {
    if (error.code === "23514") {
      return {
        ok: false,
        meddelande:
          "Flytten skulle lägga något pass över midnatt, så sluttiden hamnar före starttiden. Ingenting ändrades.",
      };
    }
    return { ok: false, meddelande: error.message };
  }

  revalidatePath("/admin/traningstider");
  revalidatePath("/traningstider");
  return { ok: true, antal: data as number };
}

export async function flyttaSektion(sektion: string, sasong: string, minuter: number) {
  return anropa("flytta_sektion", { p_sektion: sektion, p_sasong: sasong, p_minuter: minuter });
}

export async function pausaSektion(sektion: string, sasong: string, pausa: boolean) {
  return anropa("pausa_sektion", { p_sektion: sektion, p_sasong: sasong, p_pausa: pausa });
}

export async function kopieraSasong(fran: string, till: string) {
  return anropa("kopiera_sasong", { p_fran: fran, p_till: till });
}

/* ─── Skapa och ta bort ─────────────────────────────────────────────────── */

export async function nyttPass(sektion: string, sasong: string): Promise<SparResultat> {
  const supabase = await supabaseServer();

  // Skapas som pausat. Ett nytt pass har inga tider än, och ett aktivt pass
  // utan tider bryter mot tider_kravs_om_aktiv. Ledaren fyller i och
  // aktiverar sedan.
  const { error } = await supabase.from("training_sessions").insert({
    section_slug: sektion,
    grupp: "Ny grupp",
    season: sasong,
    status: "uppehall",
    sort_order: 99,
  });

  if (error) {
    return { ok: false, meddelande: "Kunde inte skapa passet. Har du behörighet?" };
  }

  revalidatePath("/admin/traningstider");
  revalidatePath("/traningstider");
  return { ok: true };
}

export async function taBortPass(id: string): Promise<SparResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, meddelande: "Kunde inte ta bort passet." };
  }

  revalidatePath("/admin/traningstider");
  revalidatePath("/traningstider");
  return { ok: true };
}
