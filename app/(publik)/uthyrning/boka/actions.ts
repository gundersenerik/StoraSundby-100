"use server";

import { revalidatePath } from "next/cache";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { skickaEpost } from "@/lib/epost";
import { idag, natterMellan, tillUtc } from "@/lib/tid";
import {
  HELA_ANLAGGNINGEN,
  priserArPlatshallare,
  uppskattaPris,
  type Andamal,
  type Bokning,
} from "@/lib/uthyrning";
import { hamtaStugor } from "@/lib/uthyrning-data";
import { kvittensmall, notismall } from "@/lib/uthyrning-epost";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Tar emot en bokningsförfrågan.
 *
 * Ingen behörighetskontroll — vem som helst får fråga, det är formulärets
 * syfte. Spärren ligger som alltid i RLS: raden kan bara bli en förfrågan,
 * aldrig en bekräftad bokning som blockerar kalendern.
 *
 * SPAMSKYDD UTAN EXTERN TJÄNST: ett honeypot-fält människor inte ser, och
 * en tidsspärr — ett formulär ifyllt på under tre sekunder är en robot.
 * Båda svarar "tack" utåt, så roboten inte lär sig något av svaret.
 *
 * Uppskattat pris räknas bara när priserna inte längre är platshållare.
 * Ett påhittat belopp får aldrig nå en kund, inte ens som uppskattning.
 */

export interface ForfraganResultat {
  status: "vilar" | "skickad" | "fel";
  meddelande?: string;
  mejlSkickat?: boolean;
}

const ANDAMAL: ReadonlySet<string> = new Set(["overnattning", "fest", "lager", "annat"]);
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export async function skickaForfragan(
  _foregaende: ForfraganResultat,
  formData: FormData,
): Promise<ForfraganResultat> {
  const honeypot = String(formData.get("webbplats") ?? "");
  const renderadKl = Number(formData.get("renderadKl") ?? 0);
  const tidAtgangen = Date.now() - renderadKl;
  if (honeypot || (renderadKl > 0 && tidAtgangen >= 0 && tidAtgangen < 3000)) {
    return { status: "skickad", mejlSkickat: false };
  }
  // Negativ tid är en enhetsklocka som går före serverns, inte en robot.
  // Ett tyst "tack" hade slängt en riktig förfrågan — säg till i stället.
  if (renderadKl > 0 && tidAtgangen < 0) {
    return {
      status: "fel",
      meddelande: `Något gick fel med formuläret. Försök igen, eller mejla oss på ${club.contact.email}.`,
    };
  }

  const objekt = String(formData.get("objekt") ?? "");
  const fran = String(formData.get("fran") ?? "");
  const till = String(formData.get("till") ?? "");
  const antal = Number(formData.get("antal") ?? 0);
  const hund = formData.get("hund") === "ja";
  const andamal = String(formData.get("andamal") ?? "");
  const namn = String(formData.get("namn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim();
  const telefon = String(formData.get("telefon") ?? "").trim() || null;
  const meddelande = String(formData.get("meddelande") ?? "").trim() || null;

  if (!DATUM.test(fran) || !DATUM.test(till)) {
    return { status: "fel", meddelande: "Välj både ankomstdatum och avresedatum." };
  }
  if (fran < idag()) {
    return { status: "fel", meddelande: "Ankomstdatumet har redan varit — välj ett datum framåt i tiden." };
  }
  if (till <= fran) {
    return { status: "fel", meddelande: "Avresedatumet måste vara efter ankomstdatumet." };
  }
  const natter = natterMellan(fran, till);
  if (natter < club.rental.minNights) {
    return {
      status: "fel",
      meddelande: `Kortaste bokning är ${club.rental.minNights} ${club.rental.minNights === 1 ? "natt" : "nätter"}.`,
    };
  }
  if (!Number.isInteger(antal) || antal < 1 || antal > 200) {
    return { status: "fel", meddelande: "Ange hur många ni blir." };
  }
  if (!ANDAMAL.has(andamal)) {
    return { status: "fel", meddelande: "Välj vad bokningen gäller." };
  }
  if (!namn || namn.length > 200) {
    return { status: "fel", meddelande: "Fyll i ditt namn." };
  }
  if (!/^.+@.+\..+$/.test(epost) || epost.length > 320) {
    return { status: "fel", meddelande: "Fyll i en giltig e-postadress, så vi kan svara dig." };
  }
  if (meddelande && meddelande.length > 4000) {
    return { status: "fel", meddelande: "Meddelandet är för långt — korta ner det lite." };
  }

  const helaAnlaggningen = objekt === HELA_ANLAGGNINGEN;
  const stugor = await hamtaStugor();
  const stuga = helaAnlaggningen ? null : stugor.find((s) => s.id === objekt);
  if (!helaAnlaggningen && !stuga) {
    return { status: "fel", meddelande: "Välj en stuga eller hela anläggningen." };
  }

  const uppskattatPris = priserArPlatshallare()
    ? null
    : uppskattaPris({ helaAnlaggningen, fran, till, medlem: false }).totalt;

  // Skickas bara till mejlen — raden i databasen får sitt id och sina
  // tidsstämplar av databasen, och priset sätts först när kansliet
  // bekräftar. Anon-rollen KAN inte skriva de kolumnerna (migration 009),
  // så uppskattningen här är ett besked till gästen, inte ett sparat värde.
  const bokning: Bokning = {
    id: "",
    cabin_id: helaAnlaggningen ? null : objekt,
    starts_at: tillUtc(fran, club.rental.checkInTime).toISOString(),
    ends_at: tillUtc(till, club.rental.checkOutTime).toISOString(),
    party_size: antal,
    bringing_dog: hund,
    purpose: andamal as Andamal,
    contact_name: namn,
    contact_email: epost,
    contact_phone: telefon,
    message: meddelande,
    estimated_price: uppskattatPris,
    status: "forfragan",
    created_at: new Date().toISOString(),
  };

  const supabase = await supabaseServer();
  const { error } = await supabase.from("bookings").insert({
    cabin_id: bokning.cabin_id,
    starts_at: bokning.starts_at,
    ends_at: bokning.ends_at,
    party_size: bokning.party_size,
    bringing_dog: bokning.bringing_dog,
    purpose: bokning.purpose,
    contact_name: bokning.contact_name,
    contact_email: bokning.contact_email,
    contact_phone: bokning.contact_phone,
    message: bokning.message,
  });

  if (error) {
    // Inga personuppgifter i loggen — felkoden räcker för felsökning.
    console.error(`[bokning] Förfrågan kunde inte sparas: ${error.code ?? "okänt fel"}`);
    return {
      status: "fel",
      meddelande: "Något gick fel när förfrågan skulle sparas. Prova igen om en stund, eller mejla oss direkt.",
    };
  }

  const stugnamn = stuga?.namn ?? null;
  const kvittens = kvittensmall(bokning, stugnamn);
  const notis = notismall(bokning, stugnamn);

  const [kvittensSvar] = await Promise.all([
    skickaEpost({ till: epost, amne: kvittens.amne, text: kvittens.text }),
    skickaEpost({ till: club.contact.email, amne: notis.amne, text: notis.text, svarTill: epost }),
  ]);

  revalidatePath(routes.rental);

  return { status: "skickad", mejlSkickat: kvittensSvar.skickat };
}
