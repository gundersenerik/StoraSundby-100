import Image from "next/image";
import Link from "next/link";
import klubbmarke from "@/bilder/klubbmarke.jpg";
import { club } from "@/config/club";
import { byggda, huvudmeny, sektionsmeny, sidfotsmeny } from "@/lib/navigation";
import { Meny } from "./meny";

/**
 * Skalet runt alla publika sidor.
 *
 * Ligger i en ruttgrupp så att /admin och /logga-in slipper det — en
 * ledare som ska flytta ett pass har ingen nytta av en föreningsmeny,
 * och en inloggningssida ska inte ha utgångar åt alla håll.
 *
 * Allt om föreningen kommer ur club.ts. Skriver man adressen här failar
 * npm run lint:hardcoded, och det är meningen.
 */
export default function PublikLayout({ children }: { children: React.ReactNode }) {
  const { contact, identity, social, site } = club;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <a
        href="#innehall"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "var(--spacing-2)",
          zIndex: 10,
          padding: "var(--spacing-2) var(--spacing-4)",
          background: "var(--brand)",
          color: "var(--brand-ink)",
          borderRadius: "var(--radius-md)",
        }}
        className="hoppa-till-innehall"
      >
        Hoppa till innehållet
      </a>

      <header
        style={{
          borderBottom: "1px solid var(--line)",
          background: "var(--surface)",
        }}
      >
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            padding: "var(--spacing-3) var(--spacing-5)",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--spacing-3) var(--spacing-6)",
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-lg)",
              fontWeight: 600,
              color: "var(--ink)",
              textDecoration: "none",
              minHeight: "44px",
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--spacing-2)",
            }}
          >
            {/* Rastermärket från gamla sajten, i väntan på vektorlogotypen
                (D2). Vit bakgrund är inbakad i filen — hörnradien gör den
                till en liten bricka som fungerar även i mörkt läge. Tom
                alt: länkens namn är redan föreningens namn i text. */}
            <Image
              src={klubbmarke}
              alt=""
              width={36}
              height={28}
              style={{ borderRadius: "var(--radius-sm)", height: "28px", width: "auto" }}
            />
            {identity.shortName}
          </Link>

          {/* flex-basis 16rem: får menyn inte plats bredvid titeln bryter
              den till en egen rad i full bredd, i stället för att klämmas
              till en smal kolumn med en post per rad på mobilen. */}
          <nav aria-label="Huvudmeny" style={{ flex: "1 1 16rem" }}>
            <Meny poster={byggda(huvudmeny)} />
          </nav>
        </div>

        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            padding: "0 var(--spacing-5) var(--spacing-2)",
          }}
        >
          <nav aria-label="Sektioner">
            <Meny poster={byggda(sektionsmeny)} />
          </nav>
        </div>
      </header>

      <main id="innehall" style={{ flex: 1 }}>
        {children}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--line)",
          background: "var(--surface-alt)",
          marginTop: "var(--spacing-8)",
        }}
      >
        <div
          style={{
            maxWidth: "64rem",
            margin: "0 auto",
            padding: "var(--spacing-6) var(--spacing-5)",
            display: "grid",
            gap: "var(--spacing-6)",
            gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
            fontSize: "var(--text-sm)",
          }}
        >
          <div>
            <h2 style={{ fontSize: "var(--text-base)", marginTop: 0 }}>
              {identity.legalName}
            </h2>
            <address style={{ fontStyle: "normal", color: "var(--ink-muted)" }}>
              {contact.address.street}
              <br />
              {contact.address.postalCode} {contact.address.city}
              <br />
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </address>
            <p style={{ color: "var(--ink-muted)" }}>
              Grundad {identity.foundedYear}. Bankgiro {club.payment.bankgiro}.
            </p>
          </div>

          {byggda(sidfotsmeny).length > 0 && (
            <nav aria-label="Sidfotsmeny">
              <h2 style={{ fontSize: "var(--text-base)", marginTop: 0 }}>Mer</h2>
              <Meny poster={byggda(sidfotsmeny)} />
            </nav>
          )}

          <div>
            <h2 style={{ fontSize: "var(--text-base)", marginTop: 0 }}>Följ oss</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              <li>
                <a href={social.facebook} style={{ display: "inline-flex", minHeight: "44px", alignItems: "center" }}>
                  Facebook
                </a>
              </li>
              <li>
                <a href={social.instagram} style={{ display: "inline-flex", minHeight: "44px", alignItems: "center" }}>
                  Instagram
                </a>
              </li>
            </ul>
            <p style={{ color: "var(--ink-muted)" }}>
              Sajten byggs om. Delar av innehållet finns tills vidare på{" "}
              <a href={`https://${site.domain}`}>{site.domain}</a>.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
