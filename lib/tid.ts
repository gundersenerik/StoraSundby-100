import { club } from "@/config/club";

/**
 * Tidszonshantering utan beroenden.
 *
 * Bokningar är händelser i tiden och lagras därför som tidpunkter i UTC
 * (timestamptz) — till skillnad från träningstider, som är väggklockstider.
 * Inmatning och visning sker i Europe/Stockholm.
 *
 * tillUtc använder tvåpasstekniken med Intl: gissa en UTC-tidpunkt, mät vad
 * väggklockan då blir i zonen, justera med skillnaden. Det ger rätt svar
 * över sommartidsskiftena åt båda hållen, vilket tests/enhet/uthyrning
 * bevisar för nätterna 28–30 mars och 24–25 oktober 2026.
 */

function vaggklocka(utc: Date, tidszon: string): number {
  const delar = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tidszon,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(utc);
  const las = (typ: string) => Number(delar.find((d) => d.type === typ)?.value ?? 0);
  return Date.UTC(las("year"), las("month") - 1, las("day"), las("hour") % 24, las("minute"), las("second"));
}

/** ("2026-03-28", "15:00") → UTC-tidpunkten för 15.00 svensk tid det datumet. */
export function tillUtc(datum: string, klockslag: string, tidszon: string = club.site.timezone): Date {
  const [h = 0, m = 0] = klockslag.split(":").map(Number);
  const onskad = Date.UTC(
    Number(datum.slice(0, 4)),
    Number(datum.slice(5, 7)) - 1,
    Number(datum.slice(8, 10)),
    h,
    m,
  );
  let gissning = onskad;
  for (let i = 0; i < 3; i++) {
    const skillnad = onskad - vaggklocka(new Date(gissning), tidszon);
    if (skillnad === 0) break;
    gissning += skillnad;
  }
  return new Date(gissning);
}

/** En tidpunkt som kalenderdatum i klubbens tidszon: "2026-03-28". */
export function tillLokaltDatum(tidpunkt: Date | string, tidszon: string = club.site.timezone): string {
  const d = typeof tidpunkt === "string" ? new Date(tidpunkt) : tidpunkt;
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: tidszon,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** "2026-03-28" → "28 mars 2026". För kvitton, mejl och admin. */
export function formateraDatum(datum: string): string {
  return new Intl.DateTimeFormat(club.site.locale, {
    dateStyle: "long",
    timeZone: club.site.timezone,
  }).format(new Date(`${datum}T12:00:00Z`));
}

/**
 * Nätter mellan två kalenderdatum. Räknas i kalenderdygn, inte i timmar —
 * natten då klockan ställs om är 23 eller 25 timmar lång men fortfarande
 * en natt, och ska kosta som en natt.
 */
export function natterMellan(fran: string, till: string): number {
  const f = Date.UTC(Number(fran.slice(0, 4)), Number(fran.slice(5, 7)) - 1, Number(fran.slice(8, 10)));
  const t = Date.UTC(Number(till.slice(0, 4)), Number(till.slice(5, 7)) - 1, Number(till.slice(8, 10)));
  return Math.round((t - f) / 86_400_000);
}

/** Dagens datum i klubbens tidszon, som "2026-08-24". */
export function idag(): string {
  return tillLokaltDatum(new Date());
}

/** "2026-08-24" plus n dagar → "2026-08-25". Ren kalenderaritmetik, ingen tidszon. */
export function laggTillDagar(datum: string, dagar: number): string {
  const d = new Date(Date.UTC(
    Number(datum.slice(0, 4)),
    Number(datum.slice(5, 7)) - 1,
    Number(datum.slice(8, 10)) + dagar,
  ));
  return d.toISOString().slice(0, 10);
}
