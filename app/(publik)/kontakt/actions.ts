"use server";

import { club } from "@/config/club";
import { skickaEpost } from "@/lib/epost";

/**
 * Kontaktformulärets mottagning.
 *
 * Samma spamskydd som bokningsförfrågan: honeypot och tidsspärr, båda
 * kontrollerade FÖRST så att en robot aldrig når valideringen. Roboten
 * får ett "tack" — att berätta för den att den avslöjats lär den bara
 * att fylla i annorlunda.
 *
 * PERSONUPPGIFTER LOGGAS ALDRIG. Namn, adress och meddelande går till
 * kansliets inkorg och ingen annanstans.
 */

const TIDSSPARR_MS = 3000;

export interface KontaktResultat {
  ok: boolean;
  meddelande?: string;
}

export async function skickaMeddelande(formData: FormData): Promise<KontaktResultat> {
  // Honeypot: ett fält människor inte ser. Ifyllt = robot.
  if (String(formData.get("hemsida") ?? "") !== "") {
    return { ok: true };
  }
  const renderadKl = Number(formData.get("renderadKl") ?? 0);
  const tidAtgangen = Date.now() - renderadKl;
  if (!renderadKl || (tidAtgangen >= 0 && tidAtgangen < TIDSSPARR_MS)) {
    return { ok: true };
  }
  // Negativ tid är inte en robot — det är en enhetsklocka som går före
  // serverns. Ett tyst "tack" hade slängt ett riktigt meddelande och
  // nollställt formuläret; säg i stället vad besökaren kan göra.
  if (tidAtgangen < 0) {
    return {
      ok: false,
      meddelande: `Något gick fel med formuläret. Försök igen, eller mejla oss direkt på ${club.contact.email}.`,
    };
  }

  const namn = String(formData.get("namn") ?? "").trim();
  const epost = String(formData.get("epost") ?? "").trim();
  const meddelande = String(formData.get("meddelande") ?? "").trim();

  if (namn.length === 0 || namn.length > 200) {
    return { ok: false, meddelande: "Skriv ditt namn." };
  }
  if (!epost.includes("@") || epost.length > 320) {
    return { ok: false, meddelande: "E-postadressen ser inte riktig ut — kontrollera den." };
  }
  if (meddelande.length === 0) {
    return { ok: false, meddelande: "Skriv ett meddelande." };
  }
  if (meddelande.length > 4000) {
    return { ok: false, meddelande: "Meddelandet är för långt — högst 4000 tecken." };
  }

  // Ämnesraden är personuppgiftsfri med flit: lib/epost loggar den vid
  // fel, och besökarens namn får aldrig hamna i en serverlogg. Namnet
  // står i mejlkroppen, där bara kansliet läser det.
  const svar = await skickaEpost({
    till: club.contact.email,
    amne: "Meddelande från kontaktformuläret på sajten",
    text: `${meddelande}\n\n—\nFrån: ${namn} <${epost}>\nSvara direkt på det här mejlet.`,
    svarTill: epost,
  });

  if (!svar.skickat) {
    // Formuläret visas bara när e-posten är konfigurerad, så det här är
    // ett driftfel, inte ett väntat läge. Var ärlig och ge en utväg.
    return {
      ok: false,
      meddelande: `Meddelandet kunde inte skickas just nu. Mejla oss direkt på ${club.contact.email}.`,
    };
  }

  return { ok: true };
}
