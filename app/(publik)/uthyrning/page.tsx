import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";
import { priserArPlatshallare } from "@/lib/uthyrning";
import { hamtaStugor, hamtaUpptagnaPerioder } from "@/lib/uthyrning-data";
import { Kalender } from "./kalender";

export const metadata: Metadata = {
  title: "Hyr våra stugor",
  description:
    `Hyr stuga hos ${club.identity.shortName} — ${club.facility.cabins.bedsPerCabin} bäddar per stuga ` +
    `och plats för ${club.facility.cabins.totalBeds} personer totalt. Se lediga datum och skicka en förfrågan.`,
  alternates: { canonical: routes.rental },
};

/**
 * Uthyrningen. Gamla sidan var en textrad som hänvisade till Facebook —
 * ingen kalender, inga priser, inget formulär. Här ser besökaren vad som
 * finns, vad som är ledigt, och kan skicka en förfrågan direkt.
 *
 * PRISER VISAS BARA NÄR DE FINNS PÅ RIKTIGT. Beloppen i config är
 * platshållare tills kansliet svarat (A4 i TILL-KLUBBEN), och regeln
 * "publicera aldrig ett platshållarvärde" gäller priser lika mycket som
 * organisationsnummer. Sektionen aktiverar sig själv den dag todo()-
 * wrappern kring club.rental.prices tas bort.
 *
 * Revalideras var femte minut, som träningstiderna: kalendern ska hinna
 * ikapp när kansliet bekräftar en bokning, utan att varje besök slår mot
 * databasen.
 */
export const revalidate = 300;

export default async function Uthyrning() {
  const [stugor, perioder] = await Promise.all([hamtaStugor(), hamtaUpptagnaPerioder()]);
  const priser = priserArPlatshallare() ? null : club.rental.prices;
  const { cabins } = club.facility;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Hyr våra stugor</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Genom föreningen kan du hyra stuga för övernattning — perfekt vid en
        större fest eller långväga besök. I varje stuga finns{" "}
        {cabins.bedsPerCabin} bäddar, och i en av stugorna är det tillåtet
        att ha hund.
      </p>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Stugorna</h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(11rem, 1fr))",
            gap: "var(--spacing-3)",
          }}
        >
          {stugor.map((stuga) => (
            <li
              key={stuga.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--spacing-4)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "var(--text-base)" }}>{stuga.namn}</h3>
              <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                {stuga.beds} bäddar
                {stuga.dog_friendly === true && " · hund välkommen"}
              </p>
              {stuga.description && (
                <p style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--text-sm)" }}>
                  {stuga.description}
                </p>
              )}
            </li>
          ))}
        </ul>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
          Har ni hund med? Säg det i förfrågan, så placerar vi er i stugan där
          hunden är välkommen. Totalt finns plats för {cabins.totalBeds}{" "}
          personer, så även ett helt läger får rum —{" "}
          <Link href={routes.rentalBooking}>berätta vad ni planerar</Link> så
          hjälper vi er att få ihop helheten.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Lediga datum</h2>
        <Kalender perioder={perioder} antalStugor={stugor.length} />
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Priser</h2>
        {priser ? (
          <>
            <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "28rem" }}>
              <tbody>
                <Prisrad namn="Stuga per natt" belopp={priser.cabinPerNight} />
                <Prisrad namn="Stuga per natt, medlem" belopp={priser.cabinPerNightMember} />
                <Prisrad namn="Hela anläggningen per natt" belopp={priser.wholeFacilityPerNight} />
                <Prisrad namn="Slutstädning" belopp={priser.cleaningFee} />
              </tbody>
            </table>
            <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
              Priset bekräftas alltid av kansliet innan bokningen blir bindande.
            </p>
          </>
        ) : (
          <p
            style={{
              background: "var(--surface-alt)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              padding: "var(--spacing-3) var(--spacing-4)",
              maxWidth: "var(--measure)",
            }}
          >
            Prislistan är på väg upp. Skicka din förfrågan som vanligt, så
            återkommer kansliet med pris innan något blir bindande.
          </p>
        )}
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Så bokar du</h2>
        <ol style={{ maxWidth: "var(--measure)", paddingLeft: "var(--spacing-5)", lineHeight: "var(--leading-normal)" }}>
          <li>Skicka en förfrågan med datum och hur många ni blir.</li>
          <li>
            Kansliet tittar på den och bekräftar att det är ledigt. Kansliet
            sköts ideellt, så ha lite tålamod med svaret.
          </li>
          <li>Ni betalar, och bokningen är klar. Välkomna!</li>
        </ol>
        <p>
          <Link
            href={routes.rentalBooking}
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: "44px",
              padding: "0 var(--spacing-5)",
              background: "var(--brand)",
              color: "var(--brand-ink)",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Skicka en förfrågan
          </Link>
        </p>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
          Planerar ni läger? Vid större läger kan även skolan och skolans
          idrottshall nyttjas, och det går att välja mellan självhushåll och
          lagad och serverad mat. Skriv vad ni tänker er i förfrågan.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Uthyrning", href: routes.rental }]))}
      />
    </div>
  );
}

function Prisrad({ namn, belopp }: { namn: string; belopp: number }) {
  return (
    <tr>
      <th
        scope="row"
        style={{
          textAlign: "left",
          fontWeight: 400,
          padding: "var(--spacing-2) 0",
          borderBottom: "1px solid var(--line)",
        }}
      >
        {namn}
      </th>
      <td
        style={{
          textAlign: "right",
          padding: "var(--spacing-2) 0",
          borderBottom: "1px solid var(--line)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {belopp} kr
      </td>
    </tr>
  );
}
