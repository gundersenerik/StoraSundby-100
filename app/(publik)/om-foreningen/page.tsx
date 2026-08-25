import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { stiftelsedatum, styrelsenArPlatshallare } from "@/lib/foreningen";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Om föreningen",
  description:
    `${club.identity.legalName} stiftades ${club.identity.foundedYear} — ` +
    `en ideell idrottsförening i ${club.contact.address.city} där alla jobbar ideellt och alla gör nytta.`,
  alternates: { canonical: routes.about },
};

/**
 * Om föreningen. Varje faktapåstående här är belagt i KALLOR.md — det som
 * inte är belagt står inte här. Föreningens egna formuleringar återges
 * ordagrant, inklusive ändamålsparagrafen från 1925.
 *
 * STYRELSEN PUBLICERAS INTE FÖRRÄN NAMNEN ÄR RIKTIGA. Ledamöterna utöver
 * ordföranden är platshållare tills styrelsen svarat (B-frågan i
 * TILL-KLUBBEN), så sidan visar det webbplatsen faktiskt säger: ordförande
 * plus sju ledamöter, med ordföranden namngiven. Listan aktiverar sig
 * själv när todo()-wrappern kring club.board.members tas bort.
 */
export default function OmForeningen() {
  const { identity, board, contact } = club;
  const ordforande = board.members[0];
  const ledamoter = board.expectedSize - 1;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Om föreningen</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        {identity.legalName} stiftades den {stiftelsedatum()}. Efter{" "}
        {identity.ageAt()} år är vi fortfarande en ideell byförening i{" "}
        {contact.address.city} — och fortfarande igång.
      </p>

      <blockquote
        style={{
          margin: "var(--spacing-6) 0",
          padding: "var(--spacing-4) var(--spacing-5)",
          borderLeft: "3px solid var(--brand)",
          background: "var(--surface-alt)",
          maxWidth: "var(--measure)",
        }}
      >
        <p style={{ margin: 0, fontFamily: "var(--font-display)" }}>{identity.purposeVerbatim}</p>
        <footer style={{ marginTop: "var(--spacing-3)", fontSize: "var(--text-sm)", color: "var(--ink-muted)" }}>
          Ur föreningens ändamålsparagraf, {identity.foundedYear}
        </footer>
      </blockquote>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Styrelsen</h2>
        {styrelsenArPlatshallare() ? (
          <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
            I styrelsen sitter ordförande tillsammans med {ledamoter} ledamöter.
            Är du intresserad och vill veta mer om vad arbetet i styrelsen
            innebär? Kontakta ordförande {ordforande.name}
            {ordforande.phone && (
              <>
                , <a href={`tel:${ordforande.phone.replace(/[^\d+]/g, "")}`}>{ordforande.phone}</a>
              </>
            )}
            .
          </p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, maxWidth: "var(--measure)" }}>
            {board.members.map((medlem) => (
              <li
                key={medlem.name}
                style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}
              >
                <strong>{medlem.name}</strong>
                <span style={{ color: "var(--ink-muted)" }}> · {medlem.role}</span>
                {medlem.phone && (
                  <>
                    {" · "}
                    <a href={`tel:${medlem.phone.replace(/[^\d+]/g, "")}`}>{medlem.phone}</a>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Vi behöver alltid mer hjälp</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          I en ideell förening är alla beroende av varandra. Tränare, styrelse,
          grässkötare, kioskpersonal, lägerpersonal m.fl. Ja, alla jobbar
          ideellt för att föreningen ska må så bra som möjligt. Det finns
          alltid plats för fler som hjälper till och alla gör nytta!
        </p>
        <p style={{ maxWidth: "var(--measure)" }}>
          Tveka inte, <Link href={routes.contact}>hör av er</Link>.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Föreningsuppgifter</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "var(--spacing-2) var(--spacing-5)",
            maxWidth: "var(--measure)",
            fontSize: "var(--text-sm)",
          }}
        >
          <dt style={{ color: "var(--ink-muted)" }}>Fullständigt namn</dt>
          <dd style={{ margin: 0 }}>{identity.legalName}</dd>
          <dt style={{ color: "var(--ink-muted)" }}>Stiftad</dt>
          <dd style={{ margin: 0 }}>{stiftelsedatum()}</dd>
          <dt style={{ color: "var(--ink-muted)" }}>Organisationsnummer</dt>
          <dd style={{ margin: 0 }}>{identity.orgNumber}</dd>
          <dt style={{ color: "var(--ink-muted)" }}>Adress</dt>
          <dd style={{ margin: 0 }}>
            {contact.address.street}, {contact.address.postalCode} {contact.address.city}
          </dd>
          <dt style={{ color: "var(--ink-muted)" }}>Kommun</dt>
          <dd style={{ margin: 0 }}>{contact.address.municipality}</dd>
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Om föreningen", href: routes.about }]))}
      />
    </div>
  );
}
