import type { Metadata } from "next";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";
import { Kontaktformular } from "./formular";

export const metadata: Metadata = {
  title: "Kontakta oss",
  description:
    `Kontakta ${club.identity.shortName}: ${club.contact.email}, ` +
    `${club.contact.address.street} i ${club.contact.address.city}, eller direkt till rätt sektion.`,
  alternates: { canonical: routes.contact },
};

/**
 * Kontaktsidan. Uppmaningarna är personliga som på gamla sajten — man
 * kontaktar "Johan" eller "Linda", inte en funktionsbrevlåda.
 *
 * FORMULÄRET VISAS BARA NÄR E-POSTEN ÄR KONFIGURERAD. Utan RESEND_API_KEY
 * skickar skickaEpost ingenting, och ett formulär som tyst tappar
 * meddelanden är värre än inget formulär. Tills nyckeln finns i Vercel
 * visas i stället en tydlig mejluppmaning — sektionen aktiverar sig själv
 * vid nästa deploy efter att nyckeln lagts in.
 */
export default function Kontakt() {
  const { contact, social, sections } = club;
  const formularAktivt = Boolean(process.env.RESEND_API_KEY);
  const sektionskontakter = sections.filter((s) => s.active && s.contactName);

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Kontakta oss</h1>

      <section style={{ marginTop: "var(--spacing-6)" }}>
        <h2>Kansliet</h2>
        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "var(--spacing-2) var(--spacing-5)",
            maxWidth: "var(--measure)",
          }}
        >
          <dt style={{ color: "var(--ink-muted)" }}>E-post</dt>
          <dd style={{ margin: 0 }}>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </dd>
          <dt style={{ color: "var(--ink-muted)" }}>Adress</dt>
          <dd style={{ margin: 0 }}>
            {contact.address.street}, {contact.address.postalCode} {contact.address.city}
          </dd>
          <dt style={{ color: "var(--ink-muted)" }}>Facebook</dt>
          <dd style={{ margin: 0 }}>
            <a href={social.facebook}>Gruppen {social.facebookGroup}</a>
          </dd>
          <dt style={{ color: "var(--ink-muted)" }}>Instagram</dt>
          <dd style={{ margin: 0 }}>
            {/* Handtaget härleds ur config — byts adressen följer texten med. */}
            <a href={social.instagram}>
              @{social.instagram.split("/").filter(Boolean).pop()}
            </a>
          </dd>
        </dl>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Sektionerna</h2>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
          Undrar du något om en särskild verksamhet? Hör av dig direkt.
        </p>
        <ul style={{ listStyle: "none", padding: 0, maxWidth: "var(--measure)" }}>
          {sektionskontakter.map((sektion) => (
            <li
              key={sektion.slug}
              style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}
            >
              <strong>{sektion.name}</strong>
              <span style={{ color: "var(--ink-muted)" }}> · {sektion.contactName}</span>
              {sektion.contactPhone && (
                <>
                  {" · "}
                  <a href={`tel:${sektion.contactPhone.replace(/[^\d+]/g, "")}`}>
                    {sektion.contactPhone}
                  </a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Skriv till oss</h2>
        {formularAktivt ? (
          <Kontaktformular />
        ) : (
          <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
            Tveka inte, hör av er! Mejla{" "}
            <a href={`mailto:${contact.email}`}>{contact.email}</a> eller skriv
            i Facebookgruppen {social.facebookGroup}, så återkommer vi.
          </p>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Kontakt", href: routes.contact }]))}
      />
    </div>
  );
}
