"use server";

import { revalidatePath } from "next/cache";
import { routes } from "@/config/content";
import { skickaEpost } from "@/lib/epost";
import { laggTillDagar, tillLokaltDatum, tillUtc } from "@/lib/tid";
import { supabaseServer } from "@/lib/supabase-server";
import {
  priserArPlatshallare,
  uppskattaPris,
  type Bokning,
  type BokningsStatus,
} from "@/lib/uthyrning";
import { bekraftelsemall } from "@/lib/uthyrning-epost";

/**
 * Kansliets åtgärder på bokningar.
 *
 * Ingen behörighetskontroll i koden — RLS är spärren, precis som för
 * träningstiderna: en icke-administratör får noll rader uppdaterade och det
 * tolkas som nekat. Databasen äger också dubbelbokningsreglerna. Försöker
 * kansliet bekräfta en bokning som krockar med en redan bekräftad säger
 * exclusion-constrainten eller korsöverlapps-triggern nej med 23P01, och
 * det felet översätts här till något en människa förstår.
 */

export interface AtgardsResultat {
  ok: boolean;
  meddelande?: string;
  mejlSkickat?: boolean;
}

const TILLATNA: ReadonlySet<string> = new Set([
  "bekraftad", "betald", "genomford", "avbojd", "avbokad",
]);

function uppdatera() {
  // Bara den publika sidan. Adminsidan är force-dynamic och renderas
  // färskt vid varje besök ändå — att revalidera den här tvingade Next
  // att rendera om hela sidan (tre databasfrågor till) inne i action-
  // svaret, och det var den fördröjningen som fällde bekräfta-flödet i
  // CI när svaret inte hann fram inom expect-timeouten.
  revalidatePath(routes.rental);
}

export async function sattStatus(id: string, status: BokningsStatus): Promise<AtgardsResultat> {
  if (!TILLATNA.has(status)) {
    return { ok: false, meddelande: "Ogiltig status." };
  }

  const supabase = await supabaseServer();

  // Priset sätts HÄR, av kansliets bekräftelse — aldrig av den som frågar.
  // Anon kan inte skriva kolumnen (migration 009), så det som står i
  // bekräftelsemejlet är alltid serverns egen beräkning. Så länge priserna
  // i config är platshållare sätts inget, och mejlet säger i stället att
  // kansliet återkommer om pris.
  let pris: number | undefined;
  if (status === "bekraftad" && !priserArPlatshallare()) {
    const { data: rad } = await supabase
      .from("bookings")
      .select("cabin_id, starts_at, ends_at, estimated_price")
      .eq("id", id)
      .maybeSingle();
    if (rad && rad.estimated_price === null) {
      pris = uppskattaPris({
        helaAnlaggningen: rad.cabin_id === null,
        fran: tillLokaltDatum(rad.starts_at),
        till: tillLokaltDatum(rad.ends_at),
        medlem: false,
      }).totalt;
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status, ...(pris !== undefined ? { estimated_price: pris } : {}) })
    .eq("id", id)
    .select("*");

  if (error) {
    if (error.code === "23P01") {
      return {
        ok: false,
        meddelande:
          "Tiden är redan upptagen: en annan bekräftad bokning eller spärr överlappar perioden. Avböj den här, eller ändra den andra först.",
      };
    }
    return { ok: false, meddelande: "Kunde inte spara. Försök igen." };
  }
  if (!data || data.length === 0) {
    return { ok: false, meddelande: "Du har inte behörighet att ändra bokningar." };
  }

  uppdatera();

  // Bekräftelsen är det mejl gästen väntar på. Skickas efter att statusen
  // faktiskt sparats — aldrig före, så inget mejl lovar något databasen
  // sedan sa nej till.
  if (status === "bekraftad") {
    const bokning = data[0] as Bokning;
    let stugnamn: string | null = null;
    if (bokning.cabin_id) {
      const { data: stuga } = await supabase
        .from("cabins")
        .select("namn")
        .eq("id", bokning.cabin_id)
        .maybeSingle();
      stugnamn = stuga?.namn ?? null;
    }
    const mall = bekraftelsemall(bokning, stugnamn);
    const svar = await skickaEpost({ till: bokning.contact_email, amne: mall.amne, text: mall.text });
    return { ok: true, mejlSkickat: svar.skickat };
  }

  return { ok: true };
}

export async function skapaSparr(formData: FormData): Promise<AtgardsResultat> {
  const objekt = String(formData.get("objekt") ?? "");
  const fran = String(formData.get("fran") ?? "");
  const till = String(formData.get("till") ?? "");
  const anledning = String(formData.get("anledning") ?? "").trim() || null;

  // "Till och med" är inklusivt: samma dag som startdatumet betyder att
  // spärra exakt en dag, vilket är det vanligaste fallet. Granskningen
  // hittade att <= här avvisade just endagsspärren.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fran) || !/^\d{4}-\d{2}-\d{2}$/.test(till) || till < fran) {
    return { ok: false, meddelande: "Slutdatumet kan inte ligga före startdatumet." };
  }

  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("booking_blocks")
    .insert({
      cabin_id: objekt === "hela-anlaggningen" ? null : objekt,
      starts_at: tillUtc(fran, "00:00").toISOString(),
      // "Till och med" i formuläret betyder hela den dagen. Lagras halvöppet
      // som midnatt dagen efter, samma konvention som bokningarna.
      ends_at: tillUtc(laggTillDagar(till, 1), "00:00").toISOString(),
      reason: anledning,
    })
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, meddelande: "Kunde inte spärra perioden. Har du behörighet?" };
  }

  uppdatera();
  return { ok: true };
}

export async function taBortSparr(id: string): Promise<AtgardsResultat> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("booking_blocks")
    .delete()
    .eq("id", id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, meddelande: "Kunde inte ta bort spärren." };
  }

  uppdatera();
  return { ok: true };
}
