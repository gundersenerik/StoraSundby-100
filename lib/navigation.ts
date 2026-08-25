import { club } from "@/config/club";
import { routes } from "@/config/content";

/**
 * Menyn, härledd ur sidkartan i config/content.ts.
 *
 * URL:erna dupliceras aldrig — de refereras. Ändras ett URL-mönster i
 * kontraktet följer menyn med automatiskt.
 *
 * `byggd` säger om sidan finns än. En meny som länkar till tomma sidor är
 * värre än en kort meny: besökaren klickar, får 404, och slutar lita på
 * navigationen. Flaggan sätts till true i samma leverans som bygger sidan.
 */
export interface MenyPost {
  href: string;
  etikett: string;
  byggd: boolean;
}

export const huvudmeny: MenyPost[] = [
  { href: routes.news, etikett: "Nyheter", byggd: true },
  { href: routes.training, etikett: "Träningstider", byggd: true },
  { href: routes.calendar, etikett: "Kalender", byggd: true },
  { href: routes.rental, etikett: "Uthyrning", byggd: true },
  { href: routes.membership, etikett: "Bli medlem", byggd: true },
  { href: routes.shop, etikett: "Webbshop", byggd: true },
  { href: routes.about, etikett: "Om föreningen", byggd: true },
  { href: routes.contact, etikett: "Kontakt", byggd: true },
];

/**
 * Sektionerna, härledda ur club.ts så att listan aldrig kan skilja sig från
 * vilka sektioner föreningen faktiskt har. Bara aktiva sektioner visas —
 * OCR står som inaktiv tills klubben bekräftat att den finns.
 */
export const sektionsmeny: MenyPost[] = club.sections
  .filter((s) => s.active)
  .map((s) => ({ href: `/${s.slug}`, etikett: s.name, byggd: true }));

export const sidfotsmeny: MenyPost[] = [
  { href: routes.facility, etikett: "Anläggningen", byggd: true },
  { href: routes.camps, etikett: "Läger", byggd: true },
  { href: routes.history, etikett: "Historia", byggd: true },
  { href: routes.documents, etikett: "Dokument", byggd: false },
  { href: routes.sponsors, etikett: "Sponsorer", byggd: false },
  { href: routes.privacy, etikett: "Integritetspolicy", byggd: false },
  { href: routes.accessibility, etikett: "Tillgänglighet", byggd: true },
];

export const byggda = (poster: MenyPost[]) => poster.filter((p) => p.byggd);
