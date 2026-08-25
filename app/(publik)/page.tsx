import type { Metadata } from "next";
import Link from "next/link";
import { club } from "@/config/club";
import { routes } from "@/config/content";
import { formateraNar } from "@/lib/evenemang";
import { hamtaKommande } from "@/lib/evenemang-data";
import { hamtaPublicerade } from "@/lib/nyheter-data";
import { publiceradeSektioner } from "@/lib/sektioner";
import { formateraDatum, tillLokaltDatum } from "@/lib/tid";
import { hamtaSchema } from "@/lib/traning-data";
import { VECKODAGAR, formateraTid } from "@/lib/traning";
import { Figur } from "./figur";
import { bilder } from "@/lib/bilder";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const SASONG = "okand-2026";

/**
 * Startsidan.
 *
 * Gamla startsidan var 690 tecken text i 160 KB HTML, med träningstiderna
 * som löptext. Här är de en vy med länk vidare, och sektionerna en ingång
 * i stället för en meny att leta i.
 *
 * Ingenting hittas på. Det som inte är belagt står inte här.
 */
export default async function Start() {
  const [sektioner, { pass }, nyheter, handelser] = await Promise.all([
    publiceradeSektioner(),
    hamtaSchema(SASONG),
    hamtaPublicerade(3),
    hamtaKommande(new Date()),
  ]);

  const alder = club.identity.ageAt();
  const nastaPass = pass
    .filter((p) => p.status === "aktiv" && p.weekday !== null)
    .sort((a, b) => (a.weekday! - b.weekday!) || (a.starts_at ?? "").localeCompare(b.starts_at ?? ""))
    .slice(0, 4);

  return (
    <div style={{ padding: "var(--spacing-7) var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>{club.identity.shortName}</h1>

      <p style={{ fontSize: "var(--text-lg)", maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
        Idrottsförening i {club.contact.address.city} sedan {club.identity.foundedYear}.
        Fotboll, orientering, gymnastik, padel och skidor — {alder} år och fortfarande igång.
      </p>

      <blockquote
        style={{
          margin: "var(--spacing-6) 0",
          padding: "var(--spacing-4) var(--spacing-5)",
          borderLeft: "3px solid var(--brand)",
          background: "var(--surface-alt)",
          maxWidth: "var(--measure)",
        }}
      >
        <p style={{ margin: 0, fontFamily: "var(--font-display)" }}>
          {club.identity.purposeVerbatim}
        </p>
        <footer style={{ marginTop: "var(--spacing-3)", fontSize: "var(--text-sm)", color: "var(--ink-muted)" }}>
          Ur föreningens ändamålsparagraf, {club.identity.foundedYear}
        </footer>
      </blockquote>

      {/* Ingen preload: på mobil ligger bilden under vecket efter
          ändamålsparagrafen — uppmätt 832 px på Pixel 7-viewporten. */}
      <Figur foto={bilder.bollarPaGras} />

      {/* Aktuellt-sektionen aktiverar sig själv när det finns innehåll,
          samma mekanik som prislistan i uthyrningen. En tom rubrik med
          "inga nyheter" på startsidan vore sämre än ingen rubrik alls. */}
      {(nyheter.length > 0 || handelser.length > 0) && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2>Aktuellt</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {nyheter.map((nyhet) => (
              <li key={nyhet.id} style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}>
                <Link href={`${routes.news}/${nyhet.slug}`}>{nyhet.title}</Link>
                <span style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                  {" "}· {formateraDatum(tillLokaltDatum(nyhet.published_at!))}
                </span>
              </li>
            ))}
            {handelser.slice(0, 3).map((handelse) => (
              <li key={handelse.id} style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}>
                {handelse.title}
                <span style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                  {" "}· {formateraNar(handelse)}
                </span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "var(--text-sm)" }}>
            <Link href={routes.news}>Alla nyheter</Link>
            {" · "}
            <Link href={routes.calendar}>Hela kalendern</Link>
          </p>
        </section>
      )}

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Verksamheten</h2>
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--spacing-3)" }}>
          {sektioner.map((s) => (
            <li
              key={s.slug}
              style={{
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--spacing-4) var(--spacing-5)",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "var(--text-lg)" }}>
                <Link href={`/${s.slug}`}>{s.heading}</Link>
              </h3>
              {s.intro && (
                <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
                  {s.intro}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      {nastaPass.length > 0 && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2>Träningstider</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {nastaPass.map((p) => (
              <li
                key={p.id}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "var(--spacing-3)",
                  padding: "var(--spacing-2) 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span style={{ flex: "1 1 12rem" }}>{p.grupp}</span>
                <span style={{ color: "var(--ink-muted)" }}>
                  {p.weekday ? VECKODAGAR[p.weekday] : null} {formateraTid(p.starts_at, p.ends_at)}
                </span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "var(--text-sm)" }}>
            <Link href="/traningstider">Alla träningstider, filtrerbara på sektion och ålder</Link>
          </p>
        </section>
      )}

      <section style={{ marginTop: "var(--spacing-7)" }}>
        <h2>Alla gör nytta</h2>
        <p style={{ maxWidth: "var(--measure)", lineHeight: "var(--leading-normal)" }}>
          I en ideell förening är alla beroende av varandra. Tränare, styrelse,
          grässkötare, kioskpersonal, lägerpersonal. Alla jobbar ideellt för att
          föreningen ska må så bra som möjligt, och det finns alltid plats för fler.
        </p>
        <p style={{ maxWidth: "var(--measure)" }}>
          Man behöver ingen förkunskap för att göra stor nytta. Hör av dig till{" "}
          <a href={`mailto:${club.contact.email}`}>{club.contact.email}</a>.
        </p>
      </section>
    </div>
  );
}
