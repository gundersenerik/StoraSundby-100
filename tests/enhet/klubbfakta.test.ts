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
