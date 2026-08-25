import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Tillgänglighet",
  description: `Så arbetar ${club.identity.shortName} med webbplatsens tillgänglighet — och hit vänder du dig om något inte fungerar.`,
  alternates: { canonical: routes.accessibility },
};

/**
 * Tillgänglighetsredogörelsen. Frivillig — och därför extra viktig att den
 * är sann: här står bara det vi faktiskt gör och testar. Påstå aldrig en
 * nivå som inte bevakas av testerna.
 */
export default function Tillganglighet() {
  const { contact } = club;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Tillgänglighet</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Alla är välkomna i föreningen, och då ska alla också kunna använda
        webbplatsen — oavsett syn, hörsel, motorik eller vilket hjälpmedel
        man har. Det här är en frivillig redogörelse för hur vi arbetar med
        det.
      </p>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Vad vi gör</h2>
        <ul style={{ maxWidth: "var(--measure)", paddingLeft: "var(--spacing-5)", lineHeight: "var(--leading-normal)" }}>
          <li>
            Vi siktar på riktlinjerna WCAG 2.1 nivå AA. Vid varje ändring
            av webbplatsen granskas sidorna automatiskt mot dem, i både
            mobil- och skrivbordsläge.
          </li>
          <li>
            Webbplatsen är byggd för att gå att använda med enbart
            tangentbord, och knappar och länkar är gjorda för att vara
            lätta att träffa på en telefon.
          </li>
          <li>
            Kalendrar och scheman är riktiga tabeller med text, inte bara
            färger — en skärmläsare läser "fullbokat" och "ledigt", inte
            bara ser rött och grönt.
          </li>
          <li>Webbplatsen följer systemets ljusa eller mörka läge.</li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Vad vi vet inte fångas</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Automatiska tester hittar inte allt — de mäter kontrast, struktur
          och etiketter, men inte om en text är begriplig eller ett flöde
          känns logiskt. Någon formell granskning av utomstående experter
          har inte gjorts. Därför är dina ögon och öron viktiga.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Fungerar något inte?</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Hittar du något på webbplatsen som är svårt att läsa, nå eller
          använda — tveka inte, hör av er! Mejla{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> och
          beskriv vad som inte fungerade och gärna vilket hjälpmedel eller
          vilken webbläsare du använde, så tittar vi på det. Du kan också
          använda <Link href={routes.contact}>kontaktsidan</Link>.
        </p>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(breadcrumbs([{ namn: "Tillgänglighet", href: routes.accessibility }]))}
      />
    </div>
  );
}
