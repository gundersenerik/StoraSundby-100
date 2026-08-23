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
