import type { Metadata } from "next";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Webbshop",
  description: `${club.identity.shortName}s webbshop drivs av Tifosi — här hittar du vägen dit.`,
  alternates: { canonical: routes.shop },
};

/**
 * Webbshoppen i link-out-läge — det ärliga läget tills Tifosi svarat på
 * frågan om produktfeed (B1 i TILL-KLUBBEN, club.shop.mode). Gamla sidan
 * var en rubrik och en länk; den här säger åtminstone vart man kommer och
 * varför. När mode byts till "feed" eller "curated" byggs en riktig
 * produktupplevelse på egen domän — utan att den här adressen ändras.
 */
export default function Webbshop() {
  const { shop, identity } = club;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Webbshop</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Föreningens webbshop drivs av Tifosi. Länken nedan tar dig till{" "}
        {identity.shortName}s egen butikssida hos dem, där du beställer och
        betalar direkt.
      </p>

      <p style={{ marginTop: "var(--spacing-6)" }}>
        <a
          href={shop.url}
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
          Besök vår webbshop
        </a>
      </p>

      <p style={{ marginTop: "var(--spacing-5)", color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
        Butiken öppnas hos Tifosi. Frågor om en beställning? Kontakta Tifosi
        direkt via deras butikssida.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Webbshop", href: routes.shop }]))}
      />
    </div>
  );
}
