import { describe, expect, it } from "vitest";
import { bilder, sektionsbilder, type Foreningsbild } from "@/lib/bilder";
import { voice } from "@/config/content";

/**
 * Alt-texterna är innehåll och lyder under samma regler som all annan
 * text: föreningens röst, aldrig marknadsföringsspråk, aldrig tomma.
 * axe fångar en saknad alt men inte en dålig — det här testet tar vid
 * där axe slutar.
 */

const alla: Array<[string, Foreningsbild]> = [
  ...Object.entries(bilder),
  ...Object.entries(sektionsbilder).filter((par): par is [string, Foreningsbild] => Boolean(par[1])),
];

describe("föreningens bilder", () => {
  it("har minst en bild att testa", () => {
    expect(alla.length).toBeGreaterThan(0);
  });

  for (const [namn, foto] of alla) {
    describe(namn, () => {
      it("har en beskrivande alt-text, inte en etikett", () => {
        // En alt under 20 tecken är i praktiken en filnamnsetikett
        // ("fotbollsplan") — beskriv det som syns i stället.
        expect(foto.alt.trim().length).toBeGreaterThanOrEqual(20);
      });

      it("skriver inte marknadsföringsspråk i alt eller bildtext", () => {
        const text = `${foto.alt} ${foto.bildtext ?? ""}`.toLowerCase();
        for (const ord of voice.forbidden) {
          expect(text).not.toContain(ord.toLowerCase());
        }
      });

    });
  }

  it("återanvänder inte samma foto på flera sidor", () => {
    const kallor = alla.map(([, f]) => f.bild.src);
    expect(new Set(kallor).size).toBe(kallor.length);
  });
});
