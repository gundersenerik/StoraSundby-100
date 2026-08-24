import { club } from "@/config/club";
import type { Bokning } from "./uthyrning";

/**
 * iCal-feed för kansliets kalender.
 *
 * Genererar ren iCalendar (RFC 5545): CRLF-radbrytningar, rader vikta vid
 * 75 oktetter, escapade specialtecken. Prenumereras på i valfri kalenderapp
 * så att kansliet ser bokningarna bredvid sina egna utan att logga in.
 *
 * Feeden innehåller gästens namn — den är till för kansliet, inte publiken,
 * och ligger därför bakom en nyckel i route-handlern.
 */

function escapa(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Radvikning enligt RFC 5545: max 75 oktetter, fortsättningsrad börjar med blanksteg. */
function vik(rad: string): string {
  const bytes = Buffer.from(rad, "utf8");
  if (bytes.length <= 75) return rad;
  const delar: string[] = [];
  let i = 0;
  while (i < bytes.length) {
    // Backa till en teckengräns så att å, ä och ö aldrig klyvs mitt i.
    let langd = Math.min(i === 0 ? 75 : 74, bytes.length - i);
    while (langd > 1 && (bytes[i + langd] & 0b1100_0000) === 0b1000_0000) langd--;
    delar.push(bytes.subarray(i, i + langd).toString("utf8"));
    i += langd;
  }
  return delar.join("\r\n ");
}

function tidsstampel(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function icalFeed(
  bokningar: Bokning[],
  stugnamn: Map<string, string>,
): string {
  const rader: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${club.identity.shortName}//Uthyrning//SV`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vik(`X-WR-CALNAME:${escapa(`Uthyrning ${club.identity.shortName}`)}`),
  ];

  for (const bokning of bokningar) {
    const objekt =
      bokning.cabin_id === null
        ? "Hela anläggningen"
        : stugnamn.get(bokning.cabin_id) ?? bokning.cabin_id;
    const titel = `${objekt}: ${bokning.contact_name} (${bokning.party_size} pers)`;

    rader.push(
      "BEGIN:VEVENT",
      `UID:${bokning.id}@${club.site.domain}`,
      `DTSTAMP:${tidsstampel(bokning.created_at)}`,
      `DTSTART:${tidsstampel(bokning.starts_at)}`,
      `DTEND:${tidsstampel(bokning.ends_at)}`,
      vik(`SUMMARY:${escapa(titel)}`),
      vik(`DESCRIPTION:${escapa(`Status: ${bokning.status}. Kontakt: ${bokning.contact_email}${bokning.contact_phone ? `, ${bokning.contact_phone}` : ""}.`)}`),
      `STATUS:${bokning.status === "forfragan" ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT",
    );
  }

  rader.push("END:VCALENDAR");
  return rader.join("\r\n") + "\r\n";
}
