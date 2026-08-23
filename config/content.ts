/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  INNEHÅLLSKONTRAKT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Låser vilka innehållstyper som finns, vilken sidkarta sajten har och
 *  vilka regler texten följer. Utan detta hittar en autonom utvecklare på
 *  egna sidtyper, egna URL-mönster och en egen ton.
 *
 *  Du bestämmer HUR sidorna ser ut och vad de säger. Det här bestämmer
 *  VILKA de är och att de hänger ihop.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Innehållstyper. Lägg inte till fler utan att notera det i BESLUTSLOGG.md. */
export const contentTypes = [
  "page",      // fristående sida: om föreningen, kontakt, integritetspolicy
  "post",      // nyhet med datum och författare
  "section",   // sportsektion: fotboll, orientering, gymnastik, padel, skidor
  "event",     // match, tävling, läger, årsmöte, städdag
  "training",  // återkommande träningspass — se 5.3, ändras oftast
  "document",  // stadgar, årsmöteshandlingar, policyer
  "person",    // styrelse, ledare, kontaktperson
  "cabin",     // uthyrningsobjekt
  "product",   // webbshopsartikel från Tifosi
  "sponsor",
] as const;

export type ContentType = (typeof contentTypes)[number];

/**
 * Sidkarta. Alla URL:er i gemener, svenska ord, bindestreck som avdelare.
 * Å, ä och ö undviks i nya URL:er — gamla med å/ä hanteras av redirects.
 */
export const routes = {
  home: "/",
  sections: "/[sektion]",              // /fotboll, /orientering, /padel …
  news: "/nyheter",
  newsPost: "/nyheter/[slug]",
  calendar: "/kalender",
  training: "/traningstider",
  results: "/resultat",
  about: "/om-foreningen",
  board: "/om-foreningen/styrelsen",
  history: "/om-foreningen/historia",
  documents: "/om-foreningen/dokument",
  facility: "/anlaggningen",
  rental: "/uthyrning",
  rentalBooking: "/uthyrning/boka",
  camps: "/lager",
  membership: "/bli-medlem",
  memberPortal: "/mina-sidor",
  shop: "/webbshop",
  shopProduct: "/webbshop/[slug]",
  sponsors: "/sponsorer",
  contact: "/kontakt",
  privacy: "/integritetspolicy",
  accessibility: "/tillganglighet",
} as const;

/**
 * Omdirigeringar från den gamla Hemsida24-sajten. Alla tolv måste fungera,
 * inklusive de med å och ä. Inga döda länkar efter växlingen.
 */
export const legacyRedirects: Record<string, string> = {
  "/orientering": "/orientering",
  "/fotboll": "/fotboll",
  "/padel": "/padel",
  "/gymnastik": "/gymnastik",
  "/skidor": "/skidor",
  "/läger": "/lager",
  "/om-föreningen": "/om-foreningen",
  "/kontakta-oss": "/kontakt",
  "/uthyrning": "/uthyrning",
  "/webbshop": "/webbshop",
  "/bli-medlem": "/bli-medlem",
};

/**
 * Röstregler, härledda ur den befintliga sajtens text.
 * Detta är det enda stället som beskriver hur föreningen låter.
 */
export const voice = {
  /** Föreningen säger "vi" om sig själv, "du" eller "ni" till läsaren. */
  pronouns: { self: "vi", reader: ["du", "ni"] },

  /** Rubriker med versal begynnelsebokstav. Aldrig VERSALER, aldrig gemener genomgående. */
  headingCase: "sentence" as const,

  /** Tidsintervall med kort tankstreck och blanksteg runt klockslag: 19.00–20.00 */
  timeFormat: "HH.mm–HH.mm",

  /** Fraser som är föreningens egna. Återanvänd dem, hitta inte på ersättare. */
  ownPhrases: [
    "Alla är välkomna att prova",
    "tveka inte, hör av er",
    "alla gör nytta",
    "skapa minnen för livet",
    "det finns alltid plats för fler",
    "våra fina gräsplaner",
  ],

  /** Bärande värden i texten. Varje sektionssida ska bära minst ett. */
  themes: [
    "ingen förkunskap krävs",
    "det ideella arbetet",
    "gemenskap före prestation",
    "träna efter egen förmåga",
  ],

  /**
   * Ord och grepp som inte hör hemma här. Om en mening låter som en
   * reklambyrå har du gått för långt — det här är en byförening i
   * Södermanland, inte ett varumärke.
   */
  forbidden: [
    "passion",
    "resa",
    "i världsklass",
    "unik upplevelse",
    "vi brinner för",
    "tillsammans skapar vi magi",
  ],

  /** Fel på gamla sajten som ska rättas utan att rösten ändras. */
  fixes: [
    "versalisering växlar mellan fotboll, Skidor, WEBBSHOP och barnGYMNASTIK",
    "saknat mellanslag i Onsdagar18.00-19.00",
    "talspråkligt medans → medan",
    "bindestreck där tidsintervall kräver tankstreck",
  ],
} as const;

/** Krav som gäller varje publicerad sida. Kontrolleras i DoD. */
export const pageRequirements = {
  exactlyOneH1: true,
  uniqueTitle: true,
  uniqueMetaDescription: true,
  altTextOnEveryImage: true,
  /** JSON-LD per sidtyp. En idrottsförening ska vara maskinläsbar. */
  jsonLd: {
    home: ["SportsClub", "Place"],
    section: ["SportsOrganization"],
    event: ["SportsEvent"],
    post: ["NewsArticle"],
    product: ["Product"],
    page: ["WebPage", "BreadcrumbList"],
  },
} as const;
