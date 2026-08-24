import { todo } from "./placeholder";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  SINGLE SOURCE OF TRUTH — Stora Sundby GOIF
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Alla klubbuppgifter bor här och bara här. Ändrar du organisationsnumret
 *  på den här raden ändras det i sidfoten, i integritetspolicyn, på fakturor,
 *  i strukturerad data och i Swish-konfigurationen samtidigt.
 *
 *  ABSOLUT REGEL: ingen komponent, sida, mejlmall eller migration får
 *  hårdkoda ett klubbfaktum. Om du är på väg att skriva "Hammargårdsvägen 1"
 *  i en komponent, importera det härifrån istället. Detta kontrolleras av
 *  `npm run lint:hardcoded`, som failar bygget vid överträdelse.
 *
 *  KÄLLPRINCIP: storasundbygoif.com är primärkälla. Där webbplatsen och en
 *  extern plattform (laget.se, IdrottOnline) säger olika saker gäller
 *  webbplatsen. Avvikelsen noteras i note-fältet men ändrar inte värdet.
 *
 *  Värden wrappade i todo() är påhittade eller obekräftade och listas
 *  automatiskt av `npm run swap-list`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const club = {
  // ─── Identitet ──────────────────────────────────────────────────────────
  identity: {
    legalName: "Stora Sundby Gymnastik och Idrottsförening",
    shortName: "Stora Sundby GOIF",
    /** Externa sajter skriver "GoIF". Webbplatsen skriver "GOIF". Vi följer webbplatsen. */
    alternateNames: ["Stora Sundby GoIF", "SSGOIF"],
    foundedISO: "1925-06-14",
    get foundedYear() {
      return Number(this.foundedISO.slice(0, 4));
    },
    /** Räknas ut, hårdkodas aldrig. Jubileumsår ska inte bli fel i en fotnot. */
    ageAt(date: Date = new Date()) {
      const f = new Date(this.foundedISO);
      let age = date.getFullYear() - f.getFullYear();
      const before =
        date.getMonth() < f.getMonth() ||
        (date.getMonth() === f.getMonth() && date.getDate() < f.getDate());
      return before ? age - 1 : age;
    },
    /** Citeras ordagrant från stadgarna 1925. Modernisera aldrig texten. */
    purposeVerbatim:
      "Föreningen har till ändamål att genom utövning av idrott och friluftsliv " +
      "verka för höjande av medlemmarnas andliga och fysiska fostran samt för " +
      "främjandet av god kamrat- och idrottsanda.",
    /**
     * Hittat i två oberoende externa källor och matematiskt kontrollerat.
     * Webbplatsen anger inget organisationsnummer, så externa källor får
     * komplettera enligt källprincipen — de motsäger ingenting.
     *
     * allabolag.se anger STORA SUNDBY GYMNASTIK- O IDROTTSFÖRENING, ideell
     * förening, på Hammargårdsvägen 1, 635 34 Stora Sundby. Att adressen och
     * postnumret matchar webbplatsen exakt — och inte laget.se:s avvikande
     * 640 40 — är det som gör källan trovärdig. laget.se anger samma nummer.
     * Kontrollsiffran stämmer enligt Luhn, vilket kontrolleras av ett test.
     *
     * Står kvar som todo() eftersom numret går in i en bankansökan och i
     * integritetspolicyn. Kassören bör stämma av mot ett registerutdrag
     * innan Swish Handel söks — men det blockerar inte lanseringen.
     */
    orgNumber: todo("818000-3694", {
      path: "club.identity.orgNumber",
      note:
        "Hittat i två oberoende källor (allabolag.se och laget.se) och Luhn-kontrollerat. " +
        "Be kassören bekräfta mot Skatteverkets registerutdrag innan Swish Handel söks.",
      confidence: "extern",
      source: "https://www.allabolag.se/8180003694",
    }),
  },

  // ─── Kontakt ────────────────────────────────────────────────────────────
  contact: {
    email: "info@storasundbygoif.com",
    address: {
      street: "Hammargårdsvägen 1",
      /** Webbplatsen anger 635 34. laget.se anger 640 40. Webbplatsen gäller. */
      postalCode: "635 34",
      city: "Stora Sundby",
      country: "SE",
      municipality: "Eskilstuna",
      region: "Södermanland",
    },
    phone: todo(null as string | null, {
      path: "club.contact.phone",
      note:
        "Webbplatsen har inget kanslinummer. laget.se anger 016-621 37. " +
        "Bekräfta att numret är i bruk innan det publiceras.",
      confidence: "extern",
    }),
    coordinates: todo({ lat: 59.2833, lng: 16.1667 }, {
      path: "club.contact.coordinates",
      note:
        "Ungefärlig position för Stora Sundby. Ersätt med exakt position för " +
        "Hammargårdsvägen 1 — används i kartan och i JSON-LD för Place.",
    }),
  },

  // ─── Sociala kanaler ────────────────────────────────────────────────────
  social: {
    facebook: "https://www.facebook.com/storasundbygoif/",
    /** Sidfoten på gamla sajten stavade fel: storasunbygoif (utan d). Rättat här. */
    instagram: "https://www.instagram.com/storasundbygoif/",
    instagramOcr: todo("https://www.instagram.com/storasundbygoifocr/", {
      path: "club.social.instagramOcr",
      note:
        "OCR-konto som hittades i sökresultat men aldrig nämns på webbplatsen. " +
        "Bekräfta att sektionen finns innan den publiceras.",
      confidence: "extern",
    }),
    facebookGroup: "Stora Sundby GOIF",
  },

  // ─── Betalning ──────────────────────────────────────────────────────────
  payment: {
    bankgiro: "342-8232",
    /**
     * Klubben har Swish Företag idag (inget API, ingen callback).
     * Sätt provider till "swish-handel" när bankavtalet är på plats — inget
     * annat i koden behöver ändras.
     */
    provider: "swish-manual" as
      | "swish-manual"
      | "swish-handel"
      | "stripe",
    swishNumber: todo("123 456 78 90", {
      path: "club.payment.swishNumber",
      note:
        "Klubbens Swish-nummer för inbetalningar. Används för QR-generering. " +
        "Måste vara korrekt innan medlemsmodulen går live.",
      blocksLaunch: true,
    }),
    swishHandelNumber: todo(null as string | null, {
      path: "club.payment.swishHandelNumber",
      note:
        "Separat 123-nummer som fås vid tecknande av Swish Handel. " +
        "Krävs för automatisk aktivering av medlemskap.",
    }),
    currency: "SEK",
    /** Referensprefix i betalmeddelanden, t.ex. SSG-2026-0431. */
    referencePrefix: "SSG",
  },

  // ─── Medlemsavgifter ────────────────────────────────────────────────────
  membership: {
    /** Från webbplatsens sida "bli medlem". Bekräftade siffror. */
    fees: {
      junior: { amount: 250, maxAgeInclusive: 17, label: "Junior t.o.m. 17 år" },
      senior: { amount: 300, minAge: 18, label: "Senior från 18 år" },
      family: {
        amount: 800,
        label: "Hel familj",
        note: "Hemmavarande barn under 18 år räknas in.",
      },
    },
    /** Vad medlemskapet ger, ordagrant från webbplatsen. */
    benefits: [
      "Tillgång till alla aktiviteter",
      "Försäkring under aktiviteter",
      '"Tack för hjälpen"-fester (kräver att man hjälper till inom klubben)',
      "En tillhörighet",
    ],
    seasonStartMonth: todo(1, {
      path: "club.membership.seasonStartMonth",
      note:
        "Antaget kalenderår. Bekräfta om medlemsåret följer kalenderår eller " +
        "säsong — styr när påminnelser går ut och när status sätts till inaktiv.",
      blocksLaunch: true,
    }),
    /**
     * Personnummer krävs sannolikt för LOK-stöd. Bekräfta omfattningen innan
     * insamling aktiveras — se docs/GDPR.md.
     */
    collectsPersonalId: todo(true, {
      path: "club.membership.collectsPersonalId",
      note:
        "Bekräfta med kassören exakt vad LOK-stöd och IdrottOnline kräver. " +
        "Samla aldrig in mer än det. Kolumnen krypteras med pgcrypto.",
      blocksLaunch: true,
    }),
  },

  // ─── Styrelse ───────────────────────────────────────────────────────────
  /**
   * Webbplatsen: "I styrelsen sitter ordförande tillsammans med 7 ledamöter."
   * laget.se listar bara fem personer. Webbplatsen är primärkälla, så vi
   * utgår från åtta platser och lämnar de okända som placeholders.
   */
  board: {
    expectedSize: 8,
    members: [
      {
        name: "Christoffer Fallqvist",
        role: "Ordförande",
        phone: "070-543 71 33",
        email: null,
      },
      ...todo(
        [
          { name: "Ledamot 2", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 3", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 4", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 5", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 6", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 7", role: "Ledamot", phone: null, email: null },
          { name: "Ledamot 8", role: "Ledamot", phone: null, email: null },
        ],
        {
          path: "club.board.members",
          note:
            "Webbplatsen anger ordförande plus 7 ledamöter. Endast ordföranden är " +
            "namngiven där. laget.se listar Isabell Kärrfeldt Andersson (sekreterare), " +
            "Linn Wolfram, Johan Gallardo Eriksson och Louise Gyldenlöve — men den " +
            "listan är inte primärkälla och kan vara inaktuell. Be styrelsen om " +
            "aktuell uppställning med roller.",
          blocksLaunch: true,
        },
      ),
    ],
  },

  // ─── Anläggning ─────────────────────────────────────────────────────────
  facility: {
    pitches: { count: 2, type: "11-manna", surface: "gräs" },
    hasFloodlitSkiTrack: true,
    hasPadelCourt: true,
    padelBookingUrl:
      "https://playtomic.io/stora-sundby-goif-padel/2211e147-172c-4413-b2f7-e44ba565bf15",
    school: {
      name: "Hammargärdets skola",
      note: "Gympasal används för gymnastik. Idrottshall kan nyttjas vid större läger.",
    },
    /**
     * Webbplatsen: 8 bäddar per stuga, totalt 48 personer. 48 / 8 = 6 stugor.
     * Härlett, inte utskrivet — därför todo().
     */
    cabins: {
      totalBeds: 48,
      bedsPerCabin: 8,
      count: todo(6, {
        path: "club.facility.cabins.count",
        note:
          "Härlett ur 48 bäddar delat på 8 per stuga. Webbplatsen skriver aldrig " +
          "ut antalet stugor. Bekräfta med kansliet.",
        confidence: "härlett",
      }),
      dogFriendlyCount: 1,
    },
  },

  // ─── Sektioner ──────────────────────────────────────────────────────────
  sections: [
    { slug: "fotboll", name: "Fotboll", active: true, contactName: "Johan", contactPhone: "073-806 41 49" },
    { slug: "orientering", name: "Orientering", active: true, contactName: "Johan Ryding",
      contactPhone: todo(null as string | null, {
        path: "sections.orientering.contactPhone",
        note: "Gamla sajten hade tel:07232912217 — elva siffror, ogiltigt. Be om rätt nummer.",
        blocksLaunch: true,
      }) },
    { slug: "orientering-ungdom", name: "Orientering barn och ungdom", active: true,
      contactName: "Emelie Gustafsson", contactPhone: "076-908 86 01",
      note: "Verksamheten återupptogs hösten 2023." },
    { slug: "gymnastik", name: "Barngymnastik och Cirkelfys", active: true,
      contactName: "Linda", contactPhone: "076-006 19 92" },
    { slug: "padel", name: "Padel", active: true, contactName: null, contactPhone: null,
      note: "Bokas via Playtomic. Öppen för alla, medlemskap uppmuntras." },
    { slug: "skidor", name: "Skidor", active: true, contactName: null, contactPhone: null,
      note: "Elljusspåret spåras när snön tillåter." },
    { slug: "ocr", name: "OCR", active: todo(false, {
      path: "sections.ocr.active",
      note: "Sektionen finns inte på webbplatsen men har ett Instagram-konto. Bekräfta.",
      confidence: "extern",
    }), contactName: null, contactPhone: null },
  ],

  // ─── Uthyrning ──────────────────────────────────────────────────────────
  rental: {
    /** Inga priser finns publicerade någonstans. Alla siffror nedan är påhittade. */
    prices: todo(
      {
        cabinPerNight: 1200,
        cabinPerNightMember: 900,
        wholeFacilityPerNight: 6000,
        cleaningFee: 500,
        depositRequired: false,
      },
      {
        path: "club.rental.prices",
        note:
          "PÅHITTADE SIFFROR. Kansliet har de riktiga. Måste bytas innan " +
          "uthyrningsmodulen publiceras — annars offereras fel pris till kunder.",
        blocksLaunch: true,
      },
    ),
    minNights: todo(1, {
      path: "club.rental.minNights",
      note: "Antaget. Bekräfta om det finns minimikrav vid helger eller läger.",
    }),
    /**
     * In- och utcheckning i Europe/Stockholm. Bokningar lagras som
     * tidpunkter (timestamptz), och en tidpunkt kräver ett klockslag —
     * annars går dubbelbokningsskyddet inte att uttrycka.
     */
    checkInTime: todo("15:00", {
      path: "club.rental.checkInTime",
      note: "Antagen incheckningstid. Bekräfta med kansliet.",
    }),
    checkOutTime: todo("11:00", {
      path: "club.rental.checkOutTime",
      note: "Antagen utcheckningstid. Bekräfta med kansliet.",
    }),
    /** Kansliet bekräftar manuellt. Sätt till true den dag direktbokning önskas. */
    instantBooking: false,
  },

  // ─── Webbshop ───────────────────────────────────────────────────────────
  shop: {
    provider: "tifosi" as const,
    url: "https://www.tifosi.se/storasundbygoif",
    /**
     * Tifosi kör en egenbyggd Next.js-plattform, inte en standardplattform.
     * Ingen publik produktfeed eller API är känd. Läge sätts efter Tifosis svar.
     */
    mode: todo("link-out" as "link-out" | "curated" | "feed", {
      path: "club.shop.mode",
      note:
        "Sätts till 'feed' om Tifosi kan leverera produktdata, 'curated' om " +
        "produkterna underhålls manuellt i admin, annars 'link-out'. " +
        "Se docs/TIFOSI-FORFRAGAN.md.",
    }),
    feedUrl: null as string | null,
  },

  // ─── Varumärke ──────────────────────────────────────────────────────────
  brand: todo(
    {
      primary: "#1B4D3E",
      secondary: "#F0B429",
      ink: "#14180F",
      paper: "#FBFAF5",
    },
    {
      path: "club.brand",
      note:
        "PÅHITTADE FÄRGER. Hämta de riktiga från klubbdräkten, logotypen och " +
        "sortimentet i webbshoppen innan designen låses.",
      blocksLaunch: true,
    },
  ),

  // ─── Drift ──────────────────────────────────────────────────────────────
  site: {
    domain: "storasundbygoif.com",
    locale: "sv-SE",
    timezone: "Europe/Stockholm",
    repository: "https://github.com/gundersenerik/StoraSundby-100",
  },
} as const;

export type Club = typeof club;
