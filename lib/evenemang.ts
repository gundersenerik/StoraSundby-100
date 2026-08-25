import { club } from "@/config/club";
import { tillLokaltDatum } from "@/lib/tid";

/**
 * Evenemang: typer och ren logik. Händelser är tidpunkter i UTC
 * (timestamptz), visas i klubbens tidszon. Dataåtkomsten bor i
 * evenemang-data.ts.
 */

export type EvenemangsTyp =
  | "match"
  | "tavling"
  | "lager"
  | "arsmote"
  | "staddag"
  | "fest"
  | "ovrigt";

export interface Evenemang {
  id: string;
  title: string;
  kind: EvenemangsTyp;
  starts_at: string;
  ends_at: string | null;
  place: string | null;
  description: string | null;
  section_slug: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const EVENEMANG_ETIKETT: Record<EvenemangsTyp, string> = {
  match: "Match",
  tavling: "Tävling",
  lager: "Läger",
  arsmote: "Årsmöte",
  staddag: "Städdag",
  fest: "Fest",
  ovrigt: "Övrigt",
};

/** "18.30" i klubbens tidszon — punkt som avdelare enligt röstreglerna. */
export function formateraKlockslag(tidpunkt: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: club.site.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(new Date(tidpunkt))
    .replace(":", ".");
}

/** "18:30" i klubbens tidszon — med kolon, för time-inputs i admin. */
export function tillLokaltKlockslag(tidpunkt: string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: club.site.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(tidpunkt));
}

/** "lördag 15 mars" i klubbens tidszon. */
export function formateraDag(tidpunkt: string): string {
  return new Intl.DateTimeFormat(club.site.locale, {
    timeZone: club.site.timezone,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(tidpunkt));
}

/**
 * När en händelse äger rum, som en människa säger det:
 * samma dag utan slut  → "lördag 15 mars 18.30"
 * samma dag med slut   → "lördag 15 mars 18.30–20.00"  (röstregeln HH.mm–HH.mm)
 * över flera dagar     → "fredag 12 juni – söndag 14 juni"
 */
export function formateraNar(evenemang: Pick<Evenemang, "starts_at" | "ends_at">): string {
  const start = `${formateraDag(evenemang.starts_at)} ${formateraKlockslag(evenemang.starts_at)}`;
  if (!evenemang.ends_at) return start;

  const sammaDag =
    tillLokaltDatum(evenemang.starts_at) === tillLokaltDatum(evenemang.ends_at);
  if (sammaDag) {
    return `${start}–${formateraKlockslag(evenemang.ends_at)}`;
  }
  return `${formateraDag(evenemang.starts_at)} – ${formateraDag(evenemang.ends_at)}`;
}

/**
 * "Mars 2027" — rubriken en månadsgrupp visas under. Svenska månadsnamn är
 * gemena i löptext, men det här är en rubrik och röstregeln headingCase
 * kräver versal begynnelsebokstav.
 */
export function manadsrubrik(tidpunkt: string): string {
  const rubrik = new Intl.DateTimeFormat(club.site.locale, {
    timeZone: club.site.timezone,
    month: "long",
    year: "numeric",
  }).format(new Date(tidpunkt));
  return rubrik.charAt(0).toUpperCase() + rubrik.slice(1);
}

/**
 * Grupperar händelser per månad i klubbens tidszon, i den ordning de
 * kommer. Indata förutsätts sorterad på starts_at — grupperingen sorterar
 * inte om, den delar bara upp.
 */
export function grupperaPerManad(
  evenemang: Evenemang[],
): { manad: string; poster: Evenemang[] }[] {
  const grupper: { manad: string; poster: Evenemang[] }[] = [];
  for (const post of evenemang) {
    const manad = manadsrubrik(post.starts_at);
    const sista = grupper[grupper.length - 1];
    if (sista && sista.manad === manad) {
      sista.poster.push(post);
    } else {
      grupper.push({ manad, poster: [post] });
    }
  }
  return grupper;
}

/**
 * En händelse är aktuell tills den är slut — inte tills den börjat.
 * En städdag som pågår ska stå kvar i kalendern under dagen. Utan slut
 * räknas den som aktuell hela startdygnet i klubbens tidszon.
 */
export function arAktuell(
  evenemang: Pick<Evenemang, "starts_at" | "ends_at">,
  nu: Date,
): boolean {
  if (evenemang.ends_at) return new Date(evenemang.ends_at) > nu;
  return tillLokaltDatum(evenemang.starts_at) >= tillLokaltDatum(nu);
}
