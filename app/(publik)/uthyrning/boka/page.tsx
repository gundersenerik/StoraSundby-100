import type { Metadata } from "next";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";
import { HELA_ANLAGGNINGEN, priserArPlatshallare } from "@/lib/uthyrning";
import { hamtaStugor } from "@/lib/uthyrning-data";
import { Formular } from "./formular";

export const metadata: Metadata = {
  title: "Skicka en bokningsförfrågan",
  description:
    `Skicka en förfrågan om att hyra stuga eller hela anläggningen hos ${club.identity.shortName}. ` +
    `Kansliet bekräftar innan bokningen blir bindande.`,
  alternates: { canonical: routes.rentalBooking },
};

export const revalidate = 300;

export default async function Boka() {
  const stugor = await hamtaStugor();
  const priser = priserArPlatshallare()
    ? null
    : {
        perNattStuga: club.rental.prices.cabinPerNight,
        perNattHela: club.rental.prices.wholeFacilityPerNight,
        stadavgift: club.rental.prices.cleaningFee,
      };

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Skicka en bokningsförfrågan</h1>

      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Fyll i vad ni vill hyra och när, så återkommer kansliet med
        bekräftelse. Förfrågan är inte bindande — ingenting bokas förrän ni
        fått svar.
      </p>

      <Formular
        stugor={stugor.map((s) => ({ id: s.id, namn: s.namn, dogFriendly: s.dog_friendly }))}
        helaAnlaggningenId={HELA_ANLAGGNINGEN}
        priser={priser}
        minNatter={club.rental.minNights}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([
            { namn: "Uthyrning", href: routes.rental },
            { namn: "Boka", href: routes.rentalBooking },
          ]),
        )}
      />
    </div>
  );
}
