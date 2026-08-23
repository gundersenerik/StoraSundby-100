import { describe, expect, it } from "vitest";
import { formateraTid, formateraAlder, VECKODAGAR } from "@/lib/traning";

/**
 * Röstreglerna i config/content.ts säger punkt som avdelare och kort
 * tankstreck: 19.00–20.00. Gamla sajten skrev bindestreck och missade
 * ibland mellanslaget helt ("Onsdagar18.00-19.00"). Det är just sådant
 * som smyger tillbaka, så det testas.
 */
describe("formateraTid", () => {
  it("använder punkt och kort tankstreck, inte kolon och bindestreck", () => {
    expect(formateraTid("19:00:00", "20:00:00")).toBe("19.00–20.00");
  });

  it("innehåller inget bindestreck", () => {
    expect(formateraTid("18:30:00", "19:30:00")).not.toContain("-");
  });

  it("klarar tider utan sekunder", () => {
    expect(formateraTid("09:00", "09:40")).toBe("09.00–09.40");
  });

  it("ger null när passet saknar tider, i stället för att hitta på", () => {
    expect(formateraTid(null, null)).toBeNull();
    expect(formateraTid("19:00", null)).toBeNull();
    expect(formateraTid(null, "20:00")).toBeNull();
  });
});

describe("formateraAlder", () => {
  it("skriver ut ett intervall", () => {
    expect(formateraAlder(3, 5)).toBe("3–5 år");
  });

  it("hanterar öppen övre gräns, som seniorernas 55+", () => {
    expect(formateraAlder(55, null)).toBe("från 55 år");
  });

  it("hanterar öppen undre gräns", () => {
    expect(formateraAlder(null, 17)).toBe("t.o.m. 17 år");
  });

  it("ger null när ingen ålder är angiven, så att passet gäller alla", () => {
    expect(formateraAlder(null, null)).toBeNull();
  });
});

describe("VECKODAGAR", () => {
  it("följer ISO-8601 där måndag är 1", () => {
    expect(VECKODAGAR[1]).toBe("Måndagar");
    expect(VECKODAGAR[7]).toBe("Söndagar");
  });

  it("har en tom platshållare på index 0 så att indexeringen stämmer", () => {
    expect(VECKODAGAR[0]).toBe("");
    expect(VECKODAGAR).toHaveLength(8);
  });
});
