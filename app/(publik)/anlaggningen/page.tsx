import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { skolnamnArPlatshallare } from "@/lib/foreningen";
import { breadcrumbs, jsonLd, place } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Anläggningen",
  description:
    `${club.identity.shortName}s anläggning i ${club.contact.address.city}: ` +
    `${club.facility.pitches.count} ${club.facility.pitches.type}planer i ${club.facility.pitches.surface}, ` +
    `stugor, padelbana och elljusspår.`,
  alternates: { canonical: routes.facility },
};

/**
 * Anläggningen. Varje påstående är belagt i KALLOR.md — planerna,
 * stugorna, padelbanan, elljusspåret och att skolan kan nyttjas. Skolans
 * NAMN är däremot obelagt och skrivs inte ut förrän det bekräftats
 * (todo() kring club.facility.school.name). "Våra fina gräsplaner" och
 * "våra fina stugor" är föreningens egna ord och behålls.
 */
export default function Anlaggningen() {
  const { facility, contact } = club;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Anläggningen</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Vår anläggning ligger på {contact.address.street} i{" "}
        {contact.address.city}. Här finns våra fina gräsplaner, stugorna,
        padelbanan och elljusspåret — och på sommaren fylls området av läger.
      </p>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Gräsplanerna</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          {facility.pitches.count} {facility.pitches.type}planer i{" "}
          {facility.pitches.surface}. Här tränar och spelar fotbollen från
          våren fram till sent in på hösten, och hit kommer lag på läger för
          att utvecklas. Träningstiderna hittar du{" "}
          <Link href={routes.training}>här</Link>.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Stugorna</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          I våra fina stugor på området finns {facility.cabins.bedsPerCabin}{" "}
          bäddar per stuga och plats för {facility.cabins.totalBeds} personer
          totalt. Stugorna går att hyra för övernattning — se lediga datum och
          skicka en förfrågan på <Link href={routes.rental}>uthyrningssidan</Link>.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Padelbanan</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Padelbanan är öppen för alla och bokas via{" "}
          <a href={facility.padelBookingUrl}>Playtomic</a>.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Elljusspåret</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          På vintern spåras elljusspåret för längdskidor när snön tillåter.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Skolan</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          {skolnamnArPlatshallare() ? "Skolans" : `${facility.school.name}s`}{" "}
          gympasal används för barngymnastiken, och vid större läger kan även
          skolan och skolans idrottshall nyttjas — läs mer under{" "}
          <Link href={routes.camps}>läger</Link>.
        </p>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(place())} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Anläggningen", href: routes.facility }]))}
      />
    </div>
  );
}
