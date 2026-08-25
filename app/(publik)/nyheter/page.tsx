import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { beskrivning } from "@/lib/nyheter";
import { hamtaPublicerade } from "@/lib/nyheter-data";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";
import { formateraDatum, tillLokaltDatum } from "@/lib/tid";

export const metadata: Metadata = {
  title: "Nyheter",
  description: `Nyheter från ${club.identity.shortName} — vad som händer i föreningen, på planen och i spåren.`,
  alternates: { canonical: routes.news },
};

/**
 * Nyheterna. Gamla sajten hänvisar till Facebook för "aktuella händelser" —
 * det här är hemtagningen till egen domän. Revalideras var femte minut så
 * en publicering syns snabbt utan att varje besök slår mot databasen.
 */
export const revalidate = 300;

export default async function Nyheter() {
  // Listan visar de 50 senaste. Äldre artiklar lever kvar på sina adresser
  // och i sitemapen (som hämtar utan tak) — de faller bara ur listan.
  // Paginering byggs när föreningen närmar sig taket, se BESLUTSLOGG.
  const nyheter = await hamtaPublicerade(50);

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Nyheter</h1>

      {nyheter.length === 0 ? (
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Inga nyheter är publicerade här än. Följ oss gärna på{" "}
          <a href={club.social.facebook}>Facebook</a> och{" "}
          <a href={club.social.instagram}>Instagram</a> så länge — där
          händer det saker löpande.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "var(--spacing-6) 0 0" }}>
          {nyheter.map((nyhet) => (
            <li
              key={nyhet.id}
              style={{
                borderBottom: "1px solid var(--line)",
                padding: "var(--spacing-5) 0",
              }}
            >
              <article>
                <h2 style={{ margin: 0, fontSize: "var(--text-xl)" }}>
                  <Link href={`${routes.news}/${nyhet.slug}`}>{nyhet.title}</Link>
                </h2>
                <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                  {formateraDatum(tillLokaltDatum(nyhet.published_at!))}
                  {nyhet.author && <> · {nyhet.author}</>}
                </p>
                {beskrivning(nyhet) && (
                  <p style={{ margin: "var(--spacing-2) 0 0", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
                    {beskrivning(nyhet)}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Nyheter", href: routes.news }]))}
      />
    </div>
  );
}
