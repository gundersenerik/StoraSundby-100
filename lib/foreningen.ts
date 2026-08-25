import { club } from "@/config/club";
import { allPlaceholders } from "@/config/placeholder";

/**
 * Föreningssidornas rena logik.
 *
 * Styrelsen publiceras inte förrän namnen är riktiga: ledamöterna utöver
 * ordföranden är platshållare (club.board.members, blockerar lansering),
 * och regeln "publicera aldrig ett platshållarvärde" gäller namn lika
 * mycket som organisationsnummer. Samma mekanik som prislistan — listan
 * aktiverar sig själv när todo()-wrappern tas bort.
 */
export function styrelsenArPlatshallare(): boolean {
  return (
    allPlaceholders().find((e) => e.path === "club.board.members")?.confidence ===
    "placeholder"
  );
}

/**
 * Skolans namn är obelagt — gamla sajten skriver bara "skolan". Tills
 * namnet bekräftats mot kommunen skrivs det inte ut.
 */
export function skolnamnArPlatshallare(): boolean {
  return (
    allPlaceholders().find((e) => e.path === "club.facility.school.name")?.confidence ===
    "placeholder"
  );
}

/** "14 juni 1925" ur foundedISO — datumet hårdkodas aldrig i en sida. */
export function stiftelsedatum(): string {
  return new Intl.DateTimeFormat(club.site.locale, {
    dateStyle: "long",
    timeZone: club.site.timezone,
  }).format(new Date(`${club.identity.foundedISO}T12:00:00Z`));
}
