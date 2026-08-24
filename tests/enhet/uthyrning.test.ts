import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { club } from "@/config/club";
import { voice } from "@/config/content";
import { idag, laggTillDagar, natterMellan, tillLokaltDatum, tillUtc } from "@/lib/tid";
import {
  HELA_ANLAGGNINGEN,
  fullbokadeDagar,
  kalendermanad,
  priserArPlatshallare,
  uppskattaPris,
  type Bokning,
  type UpptagenPeriod,
} from "@/lib/uthyrning";
import {
  bekraftelsemall,
  kvittensmall,
  notismall,
  paminnelsemall,
} from "@/lib/uthyrning-epost";
import { icalFeed } from "@/lib/uthyrning-ical";

/**
 * Uthyrningens rena logik. Ingen databas — dataåtkomsten ligger i
 * uthyrning-data.ts av precis det skälet.
 */

describe("tillUtc över sommartidsskiftet", () => {
  // EU går till sommartid sista söndagen i mars: 29 mars 2026 kl 02.00.
  it("incheckning 28 mars 15.00 svensk tid är 14.00 UTC (vintertid)", () => {
    expect(tillUtc("2026-03-28", "15:00").toISOString()).toBe("2026-03-28T14:00:00.000Z");
  });

  it("utcheckning 30 mars 11.00 svensk tid är 09.00 UTC (sommartid)", () => {
    expect(tillUtc("2026-03-30", "11:00").toISOString()).toBe("2026-03-30T09:00:00.000Z");
  });

  it("höstskiftet åt andra hållet: dygnet 24–25 oktober 2026 är 25 timmar", () => {
    const fore = tillUtc("2026-10-24", "12:00");
    const efter = tillUtc("2026-10-25", "12:00");
    expect((efter.getTime() - fore.getTime()) / 3_600_000).toBe(25);
  });

  it("vårskiftets dygn är 23 timmar", () => {
    const fore = tillUtc("2026-03-28", "12:00");
    const efter = tillUtc("2026-03-29", "12:00");
    expect((efter.getTime() - fore.getTime()) / 3_600_000).toBe(23);
  });
});

describe("nätter räknas som kalenderdygn", () => {
  it("skiftet stjäl ingen natt: 28–30 mars är två nätter", () => {
    expect(natterMellan("2026-03-28", "2026-03-30")).toBe(2);
  });

  it("en vanlig helg är två nätter", () => {
    expect(natterMellan("2026-10-02", "2026-10-04")).toBe(2);
  });

  it("laggTillDagar klarar månadsskiften och skottdagar", () => {
    expect(laggTillDagar("2026-08-31", 1)).toBe("2026-09-01");
    expect(laggTillDagar("2028-02-28", 1)).toBe("2028-02-29");
    expect(laggTillDagar("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("priserna är platshållare tills kansliet svarat", () => {
  it("gatingen är PÅ just nu — beloppen i config är påhittade (A4)", () => {
    // Det här testet ändrar betydelse den dag kansliet svarat: då tas
    // todo()-wrappern bort, gatingen stängs av, och testet uppdateras till
    // att bevisa motsatsen. Tills dess bevakar det att inga påhittade
    // belopp läcker ut i formulär eller mejl.
    expect(priserArPlatshallare()).toBe(true);
  });

  it("uppskattningen räknar per natt plus städavgift, ur config", () => {
    const priser = club.rental.prices;
    const helg = uppskattaPris({ helaAnlaggningen: false, fran: "2026-10-02", till: "2026-10-04", medlem: false });
    expect(helg.natter).toBe(2);
    expect(helg.totalt).toBe(2 * priser.cabinPerNight + priser.cleaningFee);

    const medlem = uppskattaPris({ helaAnlaggningen: false, fran: "2026-10-02", till: "2026-10-04", medlem: true });
    expect(medlem.totalt).toBe(2 * priser.cabinPerNightMember + priser.cleaningFee);

    const lager = uppskattaPris({ helaAnlaggningen: true, fran: "2026-03-28", till: "2026-03-30", medlem: false });
    expect(lager.totalt).toBe(2 * priser.wholeFacilityPerNight + priser.cleaningFee);
  });
});

describe("fullbokadeDagar", () => {
  const stugor = club.facility.cabins.count;
  const period = (objekt: string, fran: string, till: string): UpptagenPeriod => ({
    objekt,
    fran: tillUtc(fran, club.rental.checkInTime).toISOString(),
    till: tillUtc(till, club.rental.checkOutTime).toISOString(),
  });

  it("hela anläggningen bokad gör dagarna fullbokade — utom avresedagen", () => {
    const dagar = fullbokadeDagar([period(HELA_ANLAGGNINGEN, "2026-10-02", "2026-10-04")], stugor);
    expect(dagar.has("2026-10-02")).toBe(true);
    expect(dagar.has("2026-10-03")).toBe(true);
    // Avresedagen är ledig för nästa gäst, som i databasens [)-intervall.
    expect(dagar.has("2026-10-04")).toBe(false);
  });

  it("en enda bokad stuga gör ingen dag fullbokad", () => {
    const dagar = fullbokadeDagar([period("stuga-1", "2026-10-02", "2026-10-04")], stugor);
    expect(dagar.size).toBe(0);
  });

  it("alla stugor bokade samma natt gör dagen fullbokad", () => {
    const perioder = Array.from({ length: stugor }, (_, i) =>
      period(`stuga-${i + 1}`, "2026-10-02", "2026-10-03"),
    );
    expect(fullbokadeDagar(perioder, stugor).has("2026-10-02")).toBe(true);
  });

  it("alla utom en räcker inte", () => {
    const perioder = Array.from({ length: stugor - 1 }, (_, i) =>
      period(`stuga-${i + 1}`, "2026-10-02", "2026-10-03"),
    );
    expect(fullbokadeDagar(perioder, stugor).size).toBe(0);
  });

  it("sommartidsskiftet förskjuter inga dagar", () => {
    const dagar = fullbokadeDagar([period(HELA_ANLAGGNINGEN, "2026-03-28", "2026-03-30")], stugor);
    expect([...dagar].sort()).toEqual(["2026-03-28", "2026-03-29"]);
  });

  it("en spärr till och med en dag täcker hela den dagen", () => {
    // Spärrar lagras halvöppet: till-och-med 12 oktober blir midnatt den 13:e.
    const sparr: UpptagenPeriod = {
      objekt: HELA_ANLAGGNINGEN,
      fran: tillUtc("2026-10-10", "00:00").toISOString(),
      till: tillUtc("2026-10-13", "00:00").toISOString(),
    };
    const dagar = fullbokadeDagar([sparr], stugor);
    expect([...dagar].sort()).toEqual(["2026-10-10", "2026-10-11", "2026-10-12"]);
  });
});

describe("kalendermanad", () => {
  it("september 2026 börjar på en tisdag och alla veckor har sju celler", () => {
    const { rubrik, veckor } = kalendermanad(2026, 9);
    expect(rubrik).toContain("2026");
    expect(veckor[0][0]).toBeNull();       // måndag tom
    expect(veckor[0][1]).toBe("2026-09-01"); // tisdag
    for (const vecka of veckor) expect(vecka).toHaveLength(7);
    expect(veckor.flat().filter(Boolean)).toHaveLength(30);
  });
});

/* ─── Mejlmallarna ────────────────────────────────────────────────────────── */

const bokning: Bokning = {
  id: "00000000-0000-0000-0000-000000000000",
  cabin_id: "stuga-1",
  starts_at: tillUtc("2026-10-02", club.rental.checkInTime).toISOString(),
  ends_at: tillUtc("2026-10-04", club.rental.checkOutTime).toISOString(),
  party_size: 6,
  bringing_dog: true,
  purpose: "fest",
  contact_name: "Testgäst Testsson",
  contact_email: "gast@example.com",
  contact_phone: null,
  message: null,
  estimated_price: null,
  status: "forfragan",
  created_at: "2026-08-24T12:00:00.000Z",
};

describe("mejlmallarna", () => {
  const alla = [
    kvittensmall(bokning, "Stuga 1"),
    notismall(bokning, "Stuga 1"),
    bekraftelsemall({ ...bokning, status: "bekraftad" }, "Stuga 1"),
    paminnelsemall({ ...bokning, status: "betald" }, "Stuga 1"),
  ];

  it("håller föreningens röst — inga förbjudna marknadsföringsord", () => {
    for (const mall of alla) {
      const text = `${mall.amne} ${mall.text}`.toLowerCase();
      for (const ord of voice.forbidden) {
        expect(text, `"${ord}" i "${mall.amne}"`).not.toContain(ord.toLowerCase());
      }
    }
  });

  it("skriver aldrig ut ett pris när det inte finns något", () => {
    // estimated_price är null så länge priserna är platshållare. Mallarna
    // ska då säga att kansliet återkommer — aldrig visa ett belopp.
    for (const mall of alla) {
      expect(mall.text).not.toMatch(/\d+ kr/);
    }
    expect(kvittensmall(bokning, "Stuga 1").text).toContain("återkommer med pris");
  });

  it("bekräftelsen bär betalinstruktion ur config när priset finns", () => {
    const medPris = bekraftelsemall({ ...bokning, status: "bekraftad", estimated_price: 4321 }, "Stuga 1");
    expect(medPris.text).toContain("4321 kr");
    expect(medPris.text).toContain(club.payment.bankgiro);
  });

  it("perioden skrivs med svenska datum", () => {
    expect(kvittensmall(bokning, "Stuga 1").text).toContain("2 oktober 2026 till 4 oktober 2026");
  });

  it("hela anläggningen benämns som det, inte med en teknisk nyckel", () => {
    const mall = kvittensmall({ ...bokning, cabin_id: null }, null);
    expect(mall.amne).toContain("hela anläggningen");
    expect(mall.text).not.toContain(HELA_ANLAGGNINGEN);
  });
});

/* ─── iCal ────────────────────────────────────────────────────────────────── */

describe("icalFeed", () => {
  const feed = icalFeed(
    [
      { ...bokning, contact_name: "Namn; med, specialtecken\noch radbrytning" },
      { ...bokning, id: "11111111-0000-0000-0000-000000000000", status: "bekraftad" },
    ],
    new Map([["stuga-1", "Stuga 1"]]),
  );

  it("är en giltig kalenderstomme med CRLF-radbrytningar", () => {
    expect(feed.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(feed.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(feed).toContain("VERSION:2.0");
    expect(feed.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    // Inga ensamma \n — RFC 5545 kräver CRLF.
    expect(feed.replace(/\r\n/g, "")).not.toContain("\n");
  });

  it("viker rader vid 75 oktetter", () => {
    for (const rad of feed.split("\r\n")) {
      expect(Buffer.from(rad, "utf8").length, rad).toBeLessThanOrEqual(75);
    }
  });

  it("escapar semikolon, komma och radbrytning i text", () => {
    // Obs teckensträngarna: "\\;" är backslash + semikolon i källkoden.
    // En tidigare version skrev "\;" — som bara är ";" — och bevisade inget.
    expect(feed).toContain("\\;");
    expect(feed).toContain("\\,");
    expect(feed).toContain("\\n");
    // Ingen oescapad variant av namnet får finnas kvar.
    expect(feed).not.toContain("Namn; med");
  });

  it("förfrågningar är preliminära, bekräftade är bekräftade", () => {
    expect(feed).toContain("STATUS:TENTATIVE");
    expect(feed).toContain("STATUS:CONFIRMED");
  });

  it("tider är UTC-stämplade så kalenderappen räknar om själv", () => {
    expect(feed).toContain("DTSTART:20261002T130000Z");
    expect(feed).toContain("DTEND:20261004T090000Z");
  });
});

/* ─── Seed mot config ─────────────────────────────────────────────────────── */

describe("stugseeden och config håller ihop", () => {
  it("seedens antal stugor är samma som club.facility.cabins.count", () => {
    // Antalet är härlett (48 bäddar / 8 per stuga) och todo-flaggat. Om
    // kansliet svarar med ett annat antal ändras config — och det här
    // testet ser till att seeden inte glöms kvar med det gamla.
    const seed = readFileSync(
      resolve(import.meta.dirname, "../../supabase/seed/003_stugor.sql"),
      "utf8",
    );
    const rader = seed.match(/\('stuga-\d+'/g) ?? [];
    expect(rader).toHaveLength(club.facility.cabins.count);
  });

  it("bäddantalet i seeden är webbplatsens", () => {
    const seed = readFileSync(
      resolve(import.meta.dirname, "../../supabase/seed/003_stugor.sql"),
      "utf8",
    );
    const baddar = [...seed.matchAll(/\('stuga-\d+', '[^']+', (\d+)/g)].map((m) => Number(m[1]));
    expect(baddar.length).toBeGreaterThan(0);
    for (const antal of baddar) expect(antal).toBe(club.facility.cabins.bedsPerCabin);
  });
});

/* ─── Småsaker som annars går sönder tyst ────────────────────────────────── */

describe("tidshjälpen", () => {
  it("idag() ger ett ISO-datum", () => {
    expect(idag()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("tillLokaltDatum lägger UTC-kvällar på rätt svenskt dygn", () => {
    // 23.30 UTC på sommaren är 01.30 nästa dag i Sverige.
    expect(tillLokaltDatum("2026-07-01T23:30:00.000Z")).toBe("2026-07-02");
    expect(tillLokaltDatum("2026-01-15T23:30:00.000Z")).toBe("2026-01-16");
  });
});
