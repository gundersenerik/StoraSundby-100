import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Bli medlem",
  description:
    `Bli medlem i ${club.identity.shortName}: ${club.membership.fees.junior.amount} kr för juniorer, ` +
    `${club.membership.fees.senior.amount} kr för seniorer och ${club.membership.fees.family.amount} kr för hel familj.`,
  alternates: { canonical: routes.membership },
};

/**
 * Bli medlem — informationssidan. Avgifterna, bankgirot och förmånerna är
 * gamla sajtens egna, bekräftade uppgifter; betalinstruktionen återges som
 * den är eftersom det är föreningens gällande rutin. Den digitala
 * medlemsportalen (registrering och betalning på sajten) väntar på
 * personnummerfrågan i TILL-KLUBBEN och byggs som en egen modul — den här
 * sidan gör att ingen behöver leta upp gamla sajten under tiden.
 */
export default function BliMedlem() {
  const { membership, payment, contact } = club;
  const avgifter = [membership.fees.junior, membership.fees.senior, membership.fees.family];

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Bli medlem</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Vill du bli medlem i föreningen? Roligt! Alla är välkomna, och det
        finns alltid plats för fler.
      </p>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Årsavgiften</h2>
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "28rem" }}>
          <tbody>
            {avgifter.map((avgift) => (
              <tr key={avgift.label}>
                <th
                  scope="row"
                  style={{
                    textAlign: "left",
                    fontWeight: 400,
                    padding: "var(--spacing-2) 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {avgift.label}
                </th>
                <td
                  style={{
                    textAlign: "right",
                    padding: "var(--spacing-2) 0",
                    borderBottom: "1px solid var(--line)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {avgift.amount} kr
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
          {membership.fees.family.note}
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Så betalar du</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Medlemsavgiften betalas in på bankgiro{" "}
          <strong>{payment.bankgiro}</strong>. I betalningen ska personnummer
          på samtliga medlemmar anges — får det inte plats,{" "}
          <a href={`mailto:${contact.email}`}>mejla kansliet</a> och lämna
          uppgifterna där.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Varför medlem? Vad får du?</h2>
        <ul style={{ maxWidth: "var(--measure)", paddingLeft: "var(--spacing-5)", lineHeight: "var(--leading-normal)" }}>
          <li>Tillgång till alla aktiviteter</li>
          <li>Försäkring under aktiviteter</li>
          <li>"Tackförhjälpen"-fester (kräver att man hjälper till inom klubben)</li>
          <li>En tillhörighet</li>
        </ul>
        <p style={{ maxWidth: "var(--measure)" }}>
          Undrar du något? <Link href={routes.contact}>Tveka inte, hör av er</Link>.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Bli medlem", href: routes.membership }]))}
      />
    </div>
  );
}
