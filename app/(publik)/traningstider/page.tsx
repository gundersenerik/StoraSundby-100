import type { Metadata } from "next";
import { club } from "@/config/club";
import { hamtaSchema } from "@/lib/traning-data";
import { SchemaVy } from "./schema-vy";

export const metadata: Metadata = {
  title: "Träningstider",
  description: `Träningstider för alla sektioner i ${club.identity.shortName}.`,
};

/**
 * Hämtas på servern. Sidan ska vara snabb på en telefon i en hall med dålig
 * täckning, och innehållet ska gå att indexera.
 *
 * Revalideras var femte minut. Tiderna ändras ofta men inte per sekund, och
 * en ledare som just flyttat ett pass ska se ändringen inom rimlig tid.
 */
export const revalidate = 300;

/** Byts när klubben bekräftat vilken säsong tiderna gäller. Se C1 i TILL-KLUBBEN. */
const SASONG = "okand-2026";

export default async function Traningstider() {
  const { pass, sektioner } = await hamtaSchema(SASONG);

  return (
    <div style={{ padding: "var(--spacing-6)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Träningstider</h1>

      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Filtrera på sektion eller ålder. Pass som ligger på uppehåll visas
        också, så att du ser att gruppen finns men är pausad.
      </p>

      <p
        style={{
          background: "var(--surface-alt)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          padding: "var(--spacing-3) var(--spacing-4)",
          fontSize: "var(--text-sm)",
          maxWidth: "var(--measure)",
        }}
      >
        Tiderna är hämtade från föreningens nuvarande webbplats och är ännu
        inte bekräftade för innevarande säsong. Kontrollera med din ledare
        innan du planerar efter dem.
      </p>

      <SchemaVy pass={pass} sektioner={sektioner} />
    </div>
  );
}
