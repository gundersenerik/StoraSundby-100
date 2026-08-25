import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Kom på läger",
  description:
    `Läger hos ${club.identity.shortName}: ${club.facility.pitches.count} ${club.facility.pitches.type}planer i gräs, ` +
    `stugor för ${club.facility.cabins.totalBeds} personer och mat efter era önskemål.`,
  alternates: { canonical: routes.camps },
};

/**
 * Lägersidan. Texten är gamla sajtens egen, med länkar dit besökaren
 * faktiskt kan agera: uthyrningens förfrågningsflöde har ändamålet läger,
 * så "kontakta kansliet via Facebook" har blivit ett flöde på egen domän —
 * utan att tonen ändrats.
 */
export default function Lager() {
  const { facility, contact, social } = club;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Kom på läger!</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Vi anordnar läger, stora som små. Till oss kan era lag komma och
        utvecklas och skapa minnen för livet!
      </p>

      <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Ni får utnyttja våra stora fina gräsplaner ({facility.pitches.count}{" "}
        {facility.pitches.type}planer) och ni kan välja mellan flera olika
        lösningar med självhushåll eller med lagad och serverad mat. Vi har
        våra fina stugor på området där vi kan husera{" "}
        {facility.cabins.totalBeds} personer. Vid större läger kan även skolan
        och skolans idrottshall nyttjas.
      </p>

      <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Se lediga datum i <Link href={routes.rental}>uthyrningskalendern</Link>{" "}
        och <Link href={routes.rentalBooking}>berätta vad ni planerar</Link> i
        en förfrågan, så hjälper vi er att få ihop helheten. För gällande
        priser, kontakta kansliet via Facebook (Gruppen {social.facebookGroup})
        eller via <a href={`mailto:${contact.email}`}>mail</a>.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Läger", href: routes.camps }]))}
      />
    </div>
  );
}
