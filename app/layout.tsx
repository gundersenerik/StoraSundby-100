import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { club } from "@/config/club";
import { bassadress, jsonLd, place, sportsClub } from "@/lib/strukturerad-data";
import "./globals.css";

/*
 * Archivo Variable per typografiprofilen i content/design/typografi/:
 * en familj för både rubriker och brödtext, vikt via font-weight och
 * bredd via font-stretch (wdth-axeln måste laddas explicit). next/font
 * självhostar filen versionslåst vid bygget — ingen CDN-hämtning i
 * produktion, ingen layoutförskjutning via storleksjusterad fallback.
 * Kursiv laddas inte: ingen komponent använder italic i dag.
 */
const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(bassadress()),
  title: {
    default: `${club.identity.shortName} — förening i ${club.contact.address.city}`,
    template: `%s | ${club.identity.shortName}`,
  },
  description:
    `Föreningssajt för ${club.identity.legalName}, grundad ${club.identity.foundedYear}. ` +
    `Träningstider, sektioner, uthyrning och medlemskap.`,
  openGraph: {
    type: "website",
    locale: club.site.locale,
    siteName: club.identity.shortName,
  },
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={club.site.locale} className={archivo.variable}>
      <body>
        {children}
        {/* Klubben och anläggningen gäller hela sajten och ligger därför i
            rotlayouten. Sidspecifik strukturerad data läggs per sida. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(sportsClub())} />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(place())} />
      </body>
    </html>
  );
}
