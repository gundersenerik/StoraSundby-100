import { describe, expect, it } from "vitest";
import {
  arAktuell,
  formateraKlockslag,
  formateraNar,
  grupperaPerManad,
  manadsrubrik,
  type Evenemang,
} from "@/lib/evenemang";
import { beskrivning, slugga, stycken } from "@/lib/nyheter";

/** Samma mönster som migrationens CHECK — de två får aldrig glida isär. */
const SLUG_MONSTER = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("slugga", () => {
  it("gör å, ä och ö till ascii — redirects-fällan får inte återuppstå", () => {
    expect(slugga("Årsmötet 2027")).toBe("arsmotet-2027");
    expect(slugga("Fotbollsläger på Ekbacken!")).toBe("fotbollslager-pa-ekbacken");
    expect(slugga("Höstens städdag — välkomna!")).toBe("hostens-staddag-valkomna");
  });

  it("klarar skiljetecken, dubbla mellanslag och kanter", () => {
    expect(slugga("  Hej   —  hallå!!  ")).toBe("hej-halla");
    expect(slugga("!!!")).toBe("");
  });

  it("ger alltid något migrationens CHECK godkänner", () => {
    const prov = [
      "Årsmötet 2027",
      "Tack för hjälpen-festen",
      "Nr. 1: Fotboll & skidor (vinter)",
      "ÅÄÖ åäö é è ü",
    ];
    for (const titel of prov) {
      expect(slugga(titel)).toMatch(SLUG_MONSTER);
    }
  });

  it("håller sig under längdgränsen utan att sluta på bindestreck", () => {
    const lang = slugga(`${"långt ord ".repeat(20)}slut`);
    expect(lang.length).toBeLessThanOrEqual(80);
    expect(lang).toMatch(SLUG_MONSTER);
  });
});

describe("beskrivning", () => {
  it("föredrar ingressen framför brödtexten", () => {
    expect(beskrivning({ lead: "Ingressen.", body: "Brödtexten." })).toBe("Ingressen.");
  });

  it("faller tillbaka på brödtexten och klipper på ordgräns", () => {
    const text = beskrivning({ lead: null, body: "ord ".repeat(100).trim() }, 50);
    expect(text.length).toBeLessThanOrEqual(52);
    expect(text.endsWith(" …")).toBe(true);
    expect(text).not.toContain("or …");
  });

  it("plattar radbrytningar till mellanslag", () => {
    expect(beskrivning({ lead: "En\nrad\n\ntill", body: null })).toBe("En rad till");
  });
});

describe("stycken", () => {
  it("delar på tomrad och behåller inte ensamma radbrytningar", () => {
    expect(stycken("Första stycket\nfortsätter här.\n\nAndra stycket.")).toEqual([
      "Första stycket fortsätter här.",
      "Andra stycket.",
    ]);
  });

  it("tål null och tomma stycken", () => {
    expect(stycken(null)).toEqual([]);
    expect(stycken("\n\n  \n\nEnda stycket.\n\n")).toEqual(["Enda stycket."]);
  });
});

function handelse(overr: Partial<Evenemang>): Evenemang {
  return {
    id: "x",
    title: "Test",
    kind: "ovrigt",
    starts_at: "2027-07-10T16:00:00Z",
    ends_at: null,
    place: null,
    description: null,
    section_slug: null,
    published: true,
    created_at: "",
    updated_at: "",
    ...overr,
  };
}

describe("formateraNar", () => {
  it("visar svensk tid: 16.00 UTC i juli är 18.00", () => {
    expect(formateraNar(handelse({}))).toBe("lördag 10 juli 18.00");
  });

  it("följer röstregeln HH.mm–HH.mm när slutet är samma dag", () => {
    expect(formateraNar(handelse({ ends_at: "2027-07-10T18:00:00Z" }))).toBe(
      "lördag 10 juli 18.00–20.00",
    );
  });

  it("visar dagsspann när händelsen sträcker sig över flera dagar", () => {
    expect(formateraNar(handelse({ ends_at: "2027-07-12T09:00:00Z" }))).toBe(
      "lördag 10 juli – måndag 12 juli",
    );
  });

  it("hanterar sommartidsskiftet: 02.00 UTC den 28 mars 2027 är 04.00 svensk tid", () => {
    expect(formateraKlockslag("2027-03-28T02:00:00Z")).toBe("04.00");
    // Och kvällen före skiftet är vintertid: 18.00 UTC är 19.00.
    expect(formateraKlockslag("2027-03-27T18:00:00Z")).toBe("19.00");
  });
});

describe("grupperaPerManad", () => {
  it("delar upp per svensk månad utan att ändra ordningen", () => {
    const grupper = grupperaPerManad([
      handelse({ id: "a", starts_at: "2027-07-10T16:00:00Z" }),
      handelse({ id: "b", starts_at: "2027-07-20T16:00:00Z" }),
      handelse({ id: "c", starts_at: "2027-08-02T16:00:00Z" }),
    ]);
    expect(grupper.map((g) => g.manad)).toEqual(["Juli 2027", "Augusti 2027"]);
    expect(grupper[0].poster.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("grupperar på svensk månad, inte UTC-månad, vid månadsskiftet", () => {
    // 22.30 UTC den 31 juli är 00.30 den 1 augusti i Sverige.
    expect(manadsrubrik("2027-07-31T22:30:00Z")).toBe("Augusti 2027");
  });
});

describe("arAktuell", () => {
  const nu = new Date("2027-07-10T10:00:00Z");

  it("en händelse med slut är aktuell tills slutet passerat", () => {
    expect(arAktuell(handelse({ ends_at: "2027-07-10T11:00:00Z" }), nu)).toBe(true);
    expect(arAktuell(handelse({ ends_at: "2027-07-10T09:00:00Z" }), nu)).toBe(false);
  });

  it("en händelse utan slut står kvar hela startdygnet", () => {
    // Startade 08.00 samma dag — pågår eller nyss avslutad, ska synas.
    expect(arAktuell(handelse({ starts_at: "2027-07-10T06:00:00Z" }), nu)).toBe(true);
    // I går — ska bort.
    expect(arAktuell(handelse({ starts_at: "2027-07-09T06:00:00Z" }), nu)).toBe(false);
  });
});
