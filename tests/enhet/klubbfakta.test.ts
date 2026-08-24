import { describe, expect, it } from "vitest";
import { club } from "@/config/club";

/**
 * Åldersberäkningen är den enda riktiga logiken i club.ts, och den är där
 * för att jubileumsåret aldrig ska bli fel i en fotnot. Den räknas ut i
 * stället för att hårdkodas, alltså behöver den testas.
 */
describe("club.identity.ageAt", () => {
  const grundad = new Date("1925-06-14");

  it("räknar rätt på födelsedagen", () => {
    expect(club.identity.ageAt(new Date("2026-06-14"))).toBe(101);
  });

  it("räknar inte upp dagen före födelsedagen", () => {
    expect(club.identity.ageAt(new Date("2026-06-13"))).toBe(100);
  });

  it("räknar upp dagen efter", () => {
    expect(club.identity.ageAt(new Date("2026-06-15"))).toBe(101);
  });

  it("hanterar årsskiftet utan att hoppa ett år för tidigt", () => {
    expect(club.identity.ageAt(new Date("2026-01-01"))).toBe(100);
    expect(club.identity.ageAt(new Date("2026-12-31"))).toBe(101);
  });

  it("hanterar skottår", () => {
    expect(club.identity.ageAt(new Date("2028-02-29"))).toBe(102);
  });

  it("härleder grundningsåret ur datumet i stället för att duplicera det", () => {
    expect(club.identity.foundedYear).toBe(grundad.getFullYear());
    expect(club.identity.foundedYear).toBe(1925);
  });
});

describe("klubbfakta som kontrakt", () => {
  it("har unika sektionsslugs", () => {
    const slugs = club.sections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("citerar ändamålsparagrafen ordagrant, utan modernisering", () => {
    // Formuleringen är från 1925 och får inte skrivas om.
    expect(club.identity.purposeVerbatim).toContain("andliga och fysiska fostran");
    expect(club.identity.purposeVerbatim).toContain("god kamrat- och idrottsanda");
  });

  it("har familjeavgift som är billigare än tre enskilda seniorer", () => {
    // Annars är familjealternativet meningslöst och uträkningen i
    // medlemsmodulen kommer att välja fel.
    const { family, senior } = club.membership.fees;
    expect(family.amount).toBeLessThan(senior.amount * 3);
  });

  it("har juniorgräns som inte överlappar seniorgränsen", () => {
    const { junior, senior } = club.membership.fees;
    expect(senior.minAge).toBe(junior.maxAgeInclusive + 1);
  });
});

describe("sidkartan och redirectkartan hänger ihop", async () => {
  const { legacyRedirects, routes } = await import("@/config/content");

  it("varje redirect pekar på en URL som finns i sidkartan", () => {
    const kanda = new Set(Object.values(routes) as string[]);
    for (const mal of Object.values(legacyRedirects)) {
      // Sektionssidor matchas av mönstret /[sektion]
      const arSektion = mal.split("/").filter(Boolean).length === 1 && !kanda.has(mal);
      expect(kanda.has(mal) || arSektion, `${mal} finns varken i routes eller som sektion`).toBe(true);
    }
  });

  it("täcker alla tolv gamla sidorna", () => {
    // Elva undersidor plus startsidan.
    expect(Object.keys(legacyRedirects)).toHaveLength(11);
  });

  it("har inga nya URL:er med å, ä eller ö", () => {
    // Gamla adresser med å och ä hanteras av redirects. Nya ska vara rena.
    for (const url of Object.values(routes)) {
      expect(url, `${url} innehåller å, ä eller ö`).not.toMatch(/[åäöÅÄÖ]/);
    }
  });
});

/**
 * Organisationsnumret går in i integritetspolicyn, i strukturerad data och
 * så småningom i en bankansökan. En felskriven siffra syns inte för blotta
 * ögat men gör alla tre fel.
 *
 * Svenska organisationsnummer bär en kontrollsiffra enligt Luhn. Testet
 * bevisar inte att numret tillhör just den här föreningen — det gör
 * källorna i KALLOR.md — men det fångar felskrivningar, och det fångar om
 * någon råkar committa tillbaka en platshållare.
 */
describe("club.identity.orgNumber", () => {
  const siffror = club.identity.orgNumber.replace(/\D/g, "");

  it("är inte en platshållare", () => {
    expect(club.identity.orgNumber).not.toMatch(/X/i);
  });

  it("har tio siffror", () => {
    expect(siffror).toHaveLength(10);
  });

  it("börjar på 8, som ideella föreningar gör", () => {
    expect(siffror.startsWith("8")).toBe(true);
  });

  it("har en giltig kontrollsiffra enligt Luhn", () => {
    const summa = [...siffror]
      .map(Number)
      .reverse()
      .reduce((acc, siffra, i) => {
        if (i % 2 === 0) return acc + siffra;
        const dubblad = siffra * 2;
        return acc + (dubblad > 9 ? dubblad - 9 : dubblad);
      }, 0);

    expect(summa % 10).toBe(0);
  });
});
