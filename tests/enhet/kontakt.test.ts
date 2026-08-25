import { describe, expect, it } from "vitest";
import { skickaMeddelande } from "@/app/(publik)/kontakt/actions";
import { club } from "@/config/club";

/**
 * Kontaktformulärets action testas direkt: formulärläget renderas aldrig
 * i CI (RESEND_API_KEY saknas där med flit), så spamskyddet, klockskevet
 * och felvägarna bevakas här i stället för i E2E.
 */

function formulardata(overr: Record<string, string> = {}): FormData {
  const data = new FormData();
  const falt: Record<string, string> = {
    hemsida: "",
    renderadKl: String(Date.now() - 10_000),
    namn: "Provperson Testsson",
    epost: "prov@example.com",
    meddelande: "Hej! När börjar skidspåren spåras i vinter?",
    ...overr,
  };
  for (const [namn, varde] of Object.entries(falt)) data.set(namn, varde);
  return data;
}

describe("skickaMeddelande", () => {
  it("ger roboten ett tyst tack: honeypot ifylld", async () => {
    const svar = await skickaMeddelande(formulardata({ hemsida: "http://spam.example" }));
    expect(svar).toEqual({ ok: true });
  });

  it("ger roboten ett tyst tack: ifyllt på under tre sekunder", async () => {
    const svar = await skickaMeddelande(formulardata({ renderadKl: String(Date.now() - 500) }));
    expect(svar).toEqual({ ok: true });
  });

  it("behandlar en klocka som går före som fel, aldrig som robot", async () => {
    // Granskningen fann att ett tyst "tack" här hade slängt ett riktigt
    // meddelande och nollställt formuläret. Negativ tid ska ge ett ärligt
    // fel med mejlutvägen.
    const svar = await skickaMeddelande(formulardata({ renderadKl: String(Date.now() + 60_000) }));
    expect(svar.ok).toBe(false);
    expect(svar.meddelande).toContain(club.contact.email);
  });

  it("avvisar tomt namn och trasig e-postadress begripligt", async () => {
    expect((await skickaMeddelande(formulardata({ namn: "  " }))).meddelande).toBe("Skriv ditt namn.");
    const epostFel = await skickaMeddelande(formulardata({ epost: "inte-en-adress" }));
    expect(epostFel.ok).toBe(false);
    expect(epostFel.meddelande).toContain("E-postadressen");
  });

  it("utan e-postnyckel blir svaret ett ärligt fel med mejlutvägen", async () => {
    // I test och CI saknas RESEND_API_KEY, så skickaEpost är en no-op.
    // Då får besökaren aldrig ett falskt "tack" — hen får adressen.
    const svar = await skickaMeddelande(formulardata());
    expect(svar.ok).toBe(false);
    expect(svar.meddelande).toContain(club.contact.email);
  });
});
