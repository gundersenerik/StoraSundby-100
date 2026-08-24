import { club } from "@/config/club";
import { formateraDatum, tillLokaltDatum } from "./tid";
import type { Bokning } from "./uthyrning";
import { ANDAMAL_ETIKETT, HELA_ANLAGGNINGEN } from "./uthyrning";

/**
 * Bokningsflödets fyra mejl, alla i föreningens röst: vi om föreningen,
 * du/ni till läsaren, det ideella arbetet som självklarhet. Ren text, inga
 * mallmotorer — mejlen är korta nog att skriva som de ska låta.
 *
 * Klubbuppgifter kommer ur config. Priset skrivs bara ut när det finns —
 * ett påhittat belopp får inte nå en kund, inte heller i ett mejl.
 */

function objektnamn(bokning: Pick<Bokning, "cabin_id">, stugnamn: string | null): string {
  return bokning.cabin_id === null ? "hela anläggningen" : stugnamn ?? "en av våra stugor";
}

function period(bokning: Pick<Bokning, "starts_at" | "ends_at">): string {
  return `${formateraDatum(tillLokaltDatum(bokning.starts_at))} till ${formateraDatum(tillLokaltDatum(bokning.ends_at))}`;
}

function halsning(): string {
  return `Vänliga hälsningar\n${club.identity.shortName}\n${club.contact.email}`;
}

/** 1. Kvittens till den som skickat en förfrågan. */
export function kvittensmall(bokning: Bokning, stugnamn: string | null): { amne: string; text: string } {
  const objekt = objektnamn(bokning, stugnamn);
  return {
    amne: `Vi har tagit emot din förfrågan om ${objekt}`,
    text:
      `Hej ${bokning.contact_name}!\n\n` +
      `Tack för din förfrågan om ${objekt}, ${period(bokning)}, ` +
      `${bokning.party_size} ${bokning.party_size === 1 ? "person" : "personer"}` +
      `${bokning.bringing_dog ? ", med hund" : ""}.\n\n` +
      (bokning.estimated_price !== null
        ? `Uppskattat pris: ${bokning.estimated_price} kr. Priset bekräftas av kansliet innan bokningen blir bindande.\n\n`
        : `Kansliet återkommer med pris i bekräftelsen.\n\n`) +
      `Förfrågan är inte bindande än — vi hör av oss så snart vi har tittat på den. ` +
      `Kansliet sköts ideellt, så ha lite tålamod med svaret.\n\n` +
      halsning(),
  };
}

/** 2. Notis till kansliet om en ny förfrågan. */
export function notismall(bokning: Bokning, stugnamn: string | null): { amne: string; text: string } {
  const objekt = objektnamn(bokning, stugnamn);
  return {
    amne: `Ny bokningsförfrågan: ${objekt} ${tillLokaltDatum(bokning.starts_at)}`,
    text:
      `En ny förfrågan har kommit in via webbplatsen.\n\n` +
      `Objekt: ${objekt}\n` +
      `Period: ${period(bokning)}\n` +
      `Antal personer: ${bokning.party_size}\n` +
      `Hund: ${bokning.bringing_dog ? "ja" : "nej"}\n` +
      `Ändamål: ${ANDAMAL_ETIKETT[bokning.purpose]}\n` +
      (bokning.estimated_price !== null ? `Uppskattat pris: ${bokning.estimated_price} kr\n` : "") +
      `\nKontakt: ${bokning.contact_name} <${bokning.contact_email}>` +
      (bokning.contact_phone ? `, ${bokning.contact_phone}` : "") +
      `\n` +
      (bokning.message ? `\nMeddelande:\n${bokning.message}\n` : "") +
      `\nBekräfta eller avböj under Bokningar i admin på webbplatsen.`,
  };
}

/** 3. Bekräftelse när kansliet godkänt. */
export function bekraftelsemall(bokning: Bokning, stugnamn: string | null): { amne: string; text: string } {
  const objekt = objektnamn(bokning, stugnamn);
  return {
    amne: `Din bokning av ${objekt} är bekräftad`,
    text:
      `Hej ${bokning.contact_name}!\n\n` +
      `Nu är er bokning av ${objekt} bekräftad, ${period(bokning)}.\n\n` +
      (bokning.estimated_price !== null
        ? `Pris: ${bokning.estimated_price} kr. Betala till bankgiro ${club.payment.bankgiro} och ange ditt namn, så prickar kassören av betalningen.\n\n`
        : `Kansliet återkommer om pris och betalning.\n\n`) +
      `Incheckning från ${club.rental.checkInTime.replace(":", ".")}, utcheckning senast ${club.rental.checkOutTime.replace(":", ".")}. ` +
      `Frågor innan ni kommer? Tveka inte, hör av er.\n\n` +
      `Välkomna!\n\n` +
      halsning(),
  };
}

/** 4. Påminnelse några dagar före ankomst. */
export function paminnelsemall(bokning: Bokning, stugnamn: string | null): { amne: string; text: string } {
  const objekt = objektnamn(bokning, stugnamn);
  return {
    amne: `Snart ses vi — er bokning av ${objekt}`,
    text:
      `Hej ${bokning.contact_name}!\n\n` +
      `Om några dagar är det dags: ${objekt}, ${period(bokning)}.\n\n` +
      `Incheckning från ${club.rental.checkInTime.replace(":", ".")}, utcheckning senast ${club.rental.checkOutTime.replace(":", ".")}. ` +
      `Adressen är ${club.contact.address.street} i ${club.contact.address.city}.\n\n` +
      `Undrar ni något innan dess? Tveka inte, hör av er.\n\n` +
      halsning(),
  };
}

/**
 * Antal dagar före ankomst som påminnelsen går ut. Ett värde, ett ställe —
 * cron-rutten och testerna läser samma konstant.
 */
export const PAMINNELSE_DAGAR_FORE = 3;
export const HELA_ANLAGGNINGEN_NYCKEL = HELA_ANLAGGNINGEN;
