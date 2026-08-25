import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import {
  EVENEMANG_ETIKETT,
  formateraNar,
  grupperaPerManad,
  type Evenemang,
} from "@/lib/evenemang";
import { hamtaKommande } from "@/lib/evenemang-data";
import { breadcrumbs, jsonLd, sportsEvent } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Kalender",
  description: `Vad som händer hos ${club.identity.shortName}: matcher, tävlingar, läger, årsmöte och städdagar.`,
  alternates: { canonical: routes.calendar },
};

/**
 * Kalendern: matcher, tävlingar, läger, årsmöte, städdagar och fester.
 * Träningstiderna har en egen sida — de är återkommande mönster, inte
 * händelser, och blandas inte in här.
 */
export const revalidate = 300;

const sektionsnamn = new Map<string, string>(club.sections.map((s) => [s.slug, s.name]));

export default async function Kalender() {
  const kommande = await hamtaKommande(new Date());
  const grupper = grupperaPerManad(kommande);

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Kalender</h1>

      <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Här samlar vi det som händer i föreningen — matcher, tävlingar,
        läger, årsmöte och städdagar. Träningarna hittar du under{" "}
        <Link href={routes.training}>träningstider</Link>.
      </p>

      {grupper.length === 0 ? (
        <p
          style={{
            background: "var(--surface-alt)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "var(--spacing-3) var(--spacing-4)",
            maxWidth: "var(--measure)",
          }}
        >
          Just nu finns inga inlagda händelser. Följ oss på{" "}
          <a href={club.social.facebook}>Facebook</a> och{" "}
          <a href={club.social.instagram}>Instagram</a> för det senaste, eller
          titta in här igen snart.
        </p>
      ) : (
        grupper.map((grupp) => (
          <section key={grupp.manad} style={{ marginTop: "var(--spacing-7)" }}>
            <h2 style={{ fontSize: "var(--text-lg)" }}>{grupp.manad}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {grupp.poster.map((post) => (
                <Handelse key={post.id} post={post} />
              ))}
            </ul>
          </section>
        ))
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Kalender", href: routes.calendar }]))}
      />
      {kommande.map((post) => (
        <script
          key={post.id}
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLd(sportsEvent(post))}
        />
      ))}
    </div>
  );
}

function Handelse({ post }: { post: Evenemang }) {
  const sektion = post.section_slug ? sektionsnamn.get(post.section_slug) : null;

  return (
    <li
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-4) var(--spacing-5)",
        marginTop: "var(--spacing-3)",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--spacing-3)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-base)" }}>{post.title}</h3>
        <span
          style={{
            padding: "var(--spacing-1) var(--spacing-3)",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--line)",
            color: "var(--ink-muted)",
            fontSize: "var(--text-sm)",
          }}
        >
          {EVENEMANG_ETIKETT[post.kind]}
        </span>
      </div>
      <p style={{ margin: "var(--spacing-1) 0 0", fontSize: "var(--text-sm)" }}>
        {formateraNar(post)}
        {post.place && <> · {post.place}</>}
        {sektion && <> · {sektion}</>}
      </p>
      {post.description && (
        <p
          style={{
            margin: "var(--spacing-2) 0 0",
            color: "var(--ink-muted)",
            fontSize: "var(--text-sm)",
            maxWidth: "var(--measure)",
            lineHeight: "var(--leading-normal)",
          }}
        >
          {post.description}
        </p>
      )}
    </li>
  );
}
