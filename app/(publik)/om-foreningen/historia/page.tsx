import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { stiftelsedatum } from "@/lib/foreningen";
import { breadcrumbs, jsonLd } from "@/lib/strukturerad-data";

export const metadata: Metadata = {
  title: "Föreningens historia",
  description:
    `${club.identity.shortName} stiftades ${club.identity.foundedYear}. ` +
    `Det här är det vi vet ur belagda källor — och en efterlysning av resten.`,
  alternates: { canonical: routes.history },
};

/**
 * Historiesidan. Varje faktapåstående här har en källa i KALLOR.md —
 * tidningsartiklar, förbundsregister eller föreningens egna sidor. Det
 * som bara finns i en entusiastdatabas eller motsäger primärkällan står
 * INTE här utan ligger som fråga till klubben i TILL-KLUBBEN.md
 * (sammanslagningen 1932, damlagets namnbyte). Kort och sant slår långt
 * och påhittat.
 *
 * Uppgifter ur enskilda källor attribueras i löptexten — "enligt
 * seriearkiven", "skrev Eskilstuna-Kuriren" — så att läsaren ser var
 * uppgiften kommer ifrån.
 */
export default function Historia() {
  const { identity, contact } = club;

  return (
    <div style={{ padding: "var(--spacing-6) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Föreningens historia</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        {identity.legalName} stiftades den {stiftelsedatum()}. Ett sekel av
        idrott i bygden lämnar spår — men långt ifrån allt är nedtecknat.
        Det här är det vi vet, ur källor som går att kontrollera. Resten
        hoppas vi att ni hjälper oss med.
      </p>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>1925 — starten</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Föreningen stiftades mitt i sommaren, den {stiftelsedatum()}. Så
          här beskriver föreningen än i dag sitt ändamål:
        </p>
        <blockquote
          style={{
            margin: "var(--spacing-4) 0",
            padding: "var(--spacing-4) var(--spacing-5)",
            borderLeft: "3px solid var(--brand)",
            background: "var(--surface-alt)",
            maxWidth: "var(--measure)",
          }}
        >
          <p style={{ margin: 0, fontFamily: "var(--font-display)" }}>{identity.purposeVerbatim}</p>
        </blockquote>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Fotboll sedan 1930-talet</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Enligt seriearkiven hos svenskafotbollsklubbar.se spelade
          herrlaget seriespel i Södermanland, med uppehåll, från säsongen
          1930–31 fram till 2015, för det mesta i division 6 och 7, med
          Hammargärdet som hemmaplan. Ett damlag fanns i seriespel under
          flera perioder mellan 1972 och 2010 och nådde som högst division
          4, där laget spelade 1985–1990.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Hammargärdet och eldsjälarna</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Anläggningen vid Hammargärdet är byggd av ideella krafter. När
          föreningsprofilen Arne Hall gick bort 2015 skrev
          Eskilstuna-Kuriren i minnesorden att han var den drivande kraften
          bakom byggnationen av Hammargärdets idrottsplats och lägercamp,
          att han var föreningen trogen hela livet — och att han 1976 togs
          ut i orienteringslandslaget, där han sprang i några år.
        </p>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Det ideella byggandet har fortsatt. 2014 fick föreningen 200 000
          kronor i bidrag från Eskilstuna kommun för att rusta elljusspåret
          — kommunstyrelsens ordförande kallade det en viktig
          landsbygdssatsning. Och sommaren 2021 byggde fyra eldsjälar i
          föreningen, på initiativ av Rickard Granander, en padelbana vid
          Hammargärdets idrottsplats.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Föreningen i bygden i dag</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Orienteringssektionen är medlemsklubb i Södermanlands
          orienteringsdistrikt och var 2021 en av fyra lokala föreningar
          bakom orienteringsprojektet Hitta ut i Eskilstuna. Till
          Vasaloppet 2026 var, enligt loppets anmälningslista, fem åkare
          anmälda i föreningens namn. Och
          våren 2025 tog föreningen, tillsammans med Stora Sundby slott och
          Öja-Västermo hembygdsförening, initiativ till gruppen Stora
          Sundby Samhälle på Facebook — för lokal information och gemenskap
          i bygden. I en ideell förening är alla beroende av varandra, och
          så har det varit i {identity.ageAt()} år.
        </p>
      </section>

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Hjälp oss med resten</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          Har du gamla fotografier, tidningsklipp, jubileumsskrifter eller
          egna minnen från föreningens hundra år? Vi vill gärna fylla den
          här sidan med mer. Mejla{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> eller{" "}
          <Link href={routes.contact}>hör av dig</Link> — allt är
          välkommet, stort som smått.
        </p>
      </section>

      <p style={{ marginTop: "var(--spacing-7)", color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
        Uppgifterna på den här sidan kommer från Eskilstuna-Kuriren,
        Strengnäs Tidning, Svenska Orienteringsförbundet, seriearkiven hos
        svenskafotbollsklubbar.se, Vasaloppets anmälningslista, bygdens
        kanaler och föreningens egna sidor.{" "}
        <Link href={routes.about}>Mer om föreningen i dag</Link>.
      </p>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLd(
          breadcrumbs([
            { namn: "Om föreningen", href: routes.about },
            { namn: "Historia", href: routes.history },
          ]),
        )}
      />
    </div>
  );
}
