import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { club } from "@/config/club";
import { hamtaSektion, publiceradeSektioner, sektionsFakta } from "@/lib/sektioner";
import { VECKODAGAR, formateraAlder, formateraTid } from "@/lib/traning";
import { bassadress, breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const revalidate = 300;

export async function generateStaticParams() {
  const sektioner = await publiceradeSektioner();
  return sektioner.map((s) => ({ sektion: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sektion: string }>;
}): Promise<Metadata> {
  const { sektion } = await params;
  const { innehall } = await hamtaSektion(sektion);
  if (!innehall) return {};

  return {
    title: innehall.heading ?? sektion,
    description:
      innehall.intro ??
      `${innehall.heading} i ${club.identity.shortName}.`,
    alternates: { canonical: `/${sektion}` },
  };
}

export default async function Sektionssida({
  params,
}: {
  params: Promise<{ sektion: string }>;
}) {
  const { sektion } = await params;
  const { innehall, pass } = await hamtaSektion(sektion);

  if (!innehall) notFound();

  const fakta = sektionsFakta(sektion);
  const harKontakt = fakta?.contactName || fakta?.contactPhone;

  return (
    <div style={{ padding: "var(--spacing-7) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>{innehall.heading}</h1>

      {innehall.intro && (
        <p style={{ fontSize: "var(--text-lg)", color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
          {innehall.intro}
        </p>
      )}

      {innehall.body?.split("\n\n").map((stycke, i) => (
        <p key={i} style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          {stycke}
        </p>
      ))}

      {sektion === "padel" && club.facility.padelBookingUrl && (
        <p>
          <a
            href={club.facility.padelBookingUrl}
            style={{
              display: "inline-flex",
              alignItems: "center",
              minHeight: "44px",
              padding: "0 var(--spacing-5)",
              background: "var(--brand)",
              color: "var(--brand-ink)",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
            }}
          >
            Boka padelbanan via Playtomic
          </a>
        </p>
      )}

      {pass.length > 0 && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2>Träningstider</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {pass.map((p) => {
              const pausat = p.status === "uppehall";
              const alder = formateraAlder(p.age_from, p.age_to);
              return (
                <li
                  key={p.id}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "var(--spacing-3)",
                    padding: "var(--spacing-3) 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <strong style={{ flex: "1 1 12rem" }}>
                    {p.grupp}
                    {alder && (
                      <span style={{ fontWeight: 400, color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                        {" "}· {alder}
                      </span>
                    )}
                  </strong>
                  <span>
                    {pausat ? (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "var(--spacing-1) var(--spacing-3)",
                          borderRadius: "var(--radius-pill)",
                          background: "var(--surface-alt)",
                          border: "1px solid var(--warn)",
                          color: "var(--warn)",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        Uppehåll
                      </span>
                    ) : (
                      <>
                        {p.weekday ? VECKODAGAR[p.weekday] : null}{" "}
                        {formateraTid(p.starts_at, p.ends_at)}
                      </>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p style={{ fontSize: "var(--text-sm)" }}>
            <Link href="/traningstider">Alla träningstider</Link>
          </p>
        </section>
      )}

      {harKontakt && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2>Kontakt</h2>
          <p>
            {fakta?.contactName}
            {fakta?.contactPhone && (
              <>
                {" · "}
                <a href={`tel:${fakta.contactPhone.replace(/[^\d+]/g, "")}`}>
                  {fakta.contactPhone}
                </a>
              </>
            )}
          </p>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
            Går det inte att nå fram? Mejla{" "}
            <a href={`mailto:${club.contact.email}`}>{club.contact.email}</a>.
          </p>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd({
          "@context": "https://schema.org",
          "@type": "SportsOrganization",
          "@id": `${bassadress()}/${sektion}#sektion`,
          name: `${innehall.heading} — ${club.identity.shortName}`,
          parentOrganization: { "@id": `${bassadress()}/#klubb` },
          sport: fakta?.name ?? innehall.heading,
          url: `${bassadress()}/${sektion}`,
        })}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([{ namn: innehall.heading ?? sektion, href: `/${sektion}` }]),
        )}
      />
    </div>
  );
}
