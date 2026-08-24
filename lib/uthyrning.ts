import { club } from "@/config/club";
import { allPlaceholders } from "@/config/placeholder";
import { laggTillDagar, natterMellan, tillLokaltDatum } from "./tid";

/**
 * Uthyrningens rena logik: priser, kalender, etiketter.
 *
 * Ingen dataåtkomst här — den ligger i uthyrning-data.ts, av samma skäl som
 * traning/traning-data är delade: rena funktioner ska gå att testa utan att
 * en databas finns.
 */

/** Objektnyckeln för att boka allt på en gång. Samma värde som i databasen. */
export const HELA_ANLAGGNINGEN = "hela-anlaggningen";

export type BokningsStatus =
  | "forfragan"
  | "bekraftad"
  | "betald"
  | "genomford"
  | "avbojd"
  | "avbokad";

export type Andamal = "overnattning" | "fest" | "lager" | "annat";

export interface Stuga {
  id: string;
  namn: string;
  beds: number;
  /** null = okänt vilken stuga som tillåter hund. Se B3 i TILL-KLUBBEN. */
  dog_friendly: boolean | null;
  description: string | null;
  sort_order: number;
}

export interface Bokning {
  id: string;
  cabin_id: string | null; // null = hela anläggningen
  starts_at: string;
  ends_at: string;
  party_size: number;
  bringing_dog: boolean;
  purpose: Andamal;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  message: string | null;
  estimated_price: number | null;
  status: BokningsStatus;
  created_at: string;
}

/** Upptagen period ur upptagna_perioder() — avsiktligt utan personuppgifter. */
export interface UpptagenPeriod {
  objekt: string; // cabin-id eller HELA_ANLAGGNINGEN
  fran: string;   // timestamptz
  till: string;
}

export const STATUS_ETIKETT: Record<BokningsStatus, string> = {
  forfragan: "Förfrågan",
  bekraftad: "Bekräftad",
  betald: "Betald",
  genomford: "Genomförd",
  avbojd: "Avböjd",
  avbokad: "Avbokad",
};

export const ANDAMAL_ETIKETT: Record<Andamal, string> = {
  overnattning: "Övernattning",
  fest: "Fest",
  lager: "Läger",
  annat: "Annat",
};

/* ─── Priser ──────────────────────────────────────────────────────────────── */

/**
 * Sant så länge stugpriserna i config är påhittade.
 *
 * Regeln "publicerar aldrig ett platshållarvärde" gäller priser lika mycket
 * som organisationsnummer — ett påhittat pris i ett bokningsflöde är ett
 * felaktigt anbud till en riktig kund. Så länge todo()-posten för
 * club.rental.prices står som placeholder visas inga belopp någonstans.
 * Den dag kansliet svarat byts värdena och wrappern tas bort, och då
 * aktiveras prisvisningen av sig själv. Ingen kod behöver ändras.
 */
export function priserArPlatshallare(): boolean {
  const post = allPlaceholders().find((e) => e.path === "club.rental.prices");
  return post !== undefined && post.confidence === "placeholder";
}

export interface Prisuppskattning {
  natter: number;
  totalt: number;
  perNatt: number;
  stadavgift: number;
}

/**
 * Uppskattat pris för en förfrågan. Anropas bara när priserna inte längre är
 * platshållare — det är anroparens ansvar att kontrollera priserArPlatshallare()
 * först, och formuläret gör det.
 */
export function uppskattaPris(input: {
  helaAnlaggningen: boolean;
  fran: string;
  till: string;
  medlem: boolean;
}): Prisuppskattning {
  const priser = club.rental.prices;
  const natter = natterMellan(input.fran, input.till);
  const perNatt = input.helaAnlaggningen
    ? priser.wholeFacilityPerNight
    : input.medlem
      ? priser.cabinPerNightMember
      : priser.cabinPerNight;
  return {
    natter,
    perNatt,
    stadavgift: priser.cleaningFee,
    totalt: perNatt * natter + priser.cleaningFee,
  };
}

/* ─── Kalendern ───────────────────────────────────────────────────────────── */

export type DagStatus = "ledigt" | "fullbokat";

/**
 * Vilka kalenderdagar som är helt fullbokade.
 *
 * En dag är fullbokad när hela anläggningen är upptagen, eller när varje
 * stuga är det. Enstaka upptagna stugor visas inte per dag i den publika
 * kalendern — vilken stuga man får styr kansliet ändå vid bekräftelsen,
 * så "minst en ledig" är den ärliga upplösningen utåt.
 *
 * Perioder är halvöppna intervall [från, till): avresedagen är ledig för
 * nästa gäst, precis som exclusion-constrainten räknar.
 */
export function fullbokadeDagar(perioder: UpptagenPeriod[], antalStugor: number): Set<string> {
  const perDag = new Map<string, Set<string>>();

  for (const period of perioder) {
    // En dag är upptagen när NATTEN som börjar den dagen är upptagen:
    // från ankomstdagens datum fram till men inte med avresedagens.
    // Avresedagen är ledig för nästa gäst, precis som i halvöppna
    // intervallet [) i databasens exclusion-constraint. Stegningen sker i
    // kalenderdatum, inte i 24-timmarssteg — ett 23-timmarsdygn vid
    // sommartidsskiftet får inte förskjuta markeringen.
    const franDag = tillLokaltDatum(period.fran);
    const tillDagExklusive = tillLokaltDatum(period.till);
    for (let dag = franDag; dag < tillDagExklusive; dag = laggTillDagar(dag, 1)) {
      const objekt = perDag.get(dag) ?? new Set<string>();
      objekt.add(period.objekt);
      perDag.set(dag, objekt);
    }
  }

  const fullbokade = new Set<string>();
  for (const [dag, objekt] of perDag) {
    if (objekt.has(HELA_ANLAGGNINGEN) || (antalStugor > 0 && objekt.size >= antalStugor)) {
      fullbokade.add(dag);
    }
  }
  return fullbokade;
}

export interface Kalendermanad {
  rubrik: string;      // "september 2026"
  veckor: (string | null)[][]; // ISO-datum per cell, null för utfyllnad
}

/** Månadsmatris med måndag som veckostart, för kalendervyn. */
export function kalendermanad(ar: number, manad: number): Kalendermanad {
  const forsta = new Date(Date.UTC(ar, manad - 1, 1));
  const dagarIManaden = new Date(Date.UTC(ar, manad, 0)).getUTCDate();
  const forstaVeckodag = (forsta.getUTCDay() + 6) % 7; // 0 = måndag

  const celler: (string | null)[] = [
    ...Array.from({ length: forstaVeckodag }, () => null),
    ...Array.from({ length: dagarIManaden }, (_, i) => {
      const dag = i + 1;
      return `${ar}-${String(manad).padStart(2, "0")}-${String(dag).padStart(2, "0")}`;
    }),
  ];
  while (celler.length % 7 !== 0) celler.push(null);

  const veckor: (string | null)[][] = [];
  for (let i = 0; i < celler.length; i += 7) veckor.push(celler.slice(i, i + 7));

  const rubrik = new Intl.DateTimeFormat(club.site.locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(forsta);

  return { rubrik, veckor };
}
