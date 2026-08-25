import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { routes } from "@/config/content";
import { beskrivning, stycken } from "@/lib/nyheter";
import { hamtaPubliceradViaSlug } from "@/lib/nyheter-data";
import { breadcrumbs, jsonLd, nyhetsartikel } from "@/lib/strukturerad-data";
import { formateraDatum, tillLokaltDatum } from "@/lib/tid";

/**
 * En nyhet. Bara publicerade artiklar går att nå — utkast finns inte
 * publikt, varken som sida eller i sitemap, och det är RLS som garanterar
 * det: läsklienten får aldrig se raden.
 */
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const nyhet = await hamtaPubliceradViaSlug(slug);
  if (!nyhet) return { title: "Nyheten finns inte" };
  const text = beskrivning(nyhet);
  return {
    title: nyhet.title,
    // En tom description utelämnas hellre än publiceras — samma regel som
    // för platshållarvärden i strukturerad data.
    ...(text ? { description: text } : {}),
    alternates: { canonical: `${routes.news}/${nyhet.slug}` },
  };
}

export default async function Nyhet({ params }: Props) {
  const { slug } = await params;
  const nyhet = await hamtaPubliceradViaSlug(slug);
  if (!nyhet) notFound();

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <article>
        <h1 style={{ maxWidth: "var(--measure)" }}>{nyhet.title}</h1>
        <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
          {formateraDatum(tillLokaltDatum(nyhet.published_at!))}
          {nyhet.author && <> · {nyhet.author}</>}
        </p>

        {nyhet.lead && (
          <p
            style={{
              fontSize: "var(--text-lg)",
              maxWidth: "var(--measure)",
              lineHeight: "var(--leading-normal)",
            }}
          >
            {nyhet.lead}
          </p>
        )}

        {stycken(nyhet.body).map((stycke, i) => (
          <p
            key={i}
            style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}
          >
            {stycke}
          </p>
        ))}
      </article>

      <p style={{ marginTop: "var(--spacing-7)" }}>
        <Link href={routes.news}>← Alla nyheter</Link>
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          nyhetsartikel({
            slug: nyhet.slug,
            title: nyhet.title,
            beskrivning: beskrivning(nyhet),
            published_at: nyhet.published_at!,
            updated_at: nyhet.updated_at,
          }),
        )}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([
            { namn: "Nyheter", href: routes.news },
            { namn: nyhet.title, href: `${routes.news}/${nyhet.slug}` },
          ]),
        )}
      />
    </div>
  );
}
