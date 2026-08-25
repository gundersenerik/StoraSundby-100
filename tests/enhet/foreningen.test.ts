import { describe, expect, it } from "vitest";
import { club } from "@/config/club";
import { stiftelsedatum, styrelsenArPlatshallare } from "@/lib/foreningen";

describe("föreningssidornas logik", () => {
  it("formaterar stiftelsedatumet ur foundedISO — datumet hårdkodas aldrig", () => {
    expect(stiftelsedatum()).toBe("14 juni 1925");
  });

  it("styrelsen räknas som platshållare så länge todo() står kvar", () => {
    // När styrelsen svarat och wrappern tas bort ska det här testet
    // uppdateras till false — då börjar hela listan visas publikt.
    expect(styrelsenArPlatshallare()).toBe(true);
  });

  it("styrelsens förväntade storlek stämmer med antalet poster", () => {
    expect(club.board.members).toHaveLength(club.board.expectedSize);
  });
});
