import type { Metadata } from "next";
import { arAktuell } from "@/lib/evenemang";
import { hamtaAllaEvenemang } from "@/lib/evenemang-data";
import { supabaseServer } from "@/lib/supabase-server";
import { Handelserad } from "./handelserad";
import { NyHandelse } from "./ny";

export const metadata: Metadata = {
  title: "Kalender — admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kansliets kalendervy. Kommande händelser överst i tidsordning; det som
 * passerat ligger hopfällt längst ner — det ska gå att se vad som varit,
 * men det ska inte vara i vägen.
 */
export default async function AdminKalender() {
  const supabase = await supabaseServer();
  const alla = await hamtaAllaEvenemang(supabase);

  const nu = new Date();
  const kommande = alla.filter((e) => arAktuell(e, nu));
  const passerade = alla.filter((e) => !arAktuell(e, nu)).reverse();

  return (
    <main style={{ padding: "var(--spacing-6)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Kalender</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Matcher, tävlingar, läger, årsmöte och städdagar. Det du lägger in
        här syns direkt i den publika kalendern — dölj en händelse om den
        inte är spikad än.
      </p>

      <NyHandelse />

      {kommande.length === 0 ? (
        <p style={{ marginTop: "var(--spacing-6)", color: "var(--ink-muted)" }}>
          Inga kommande händelser inlagda.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "var(--spacing-5) 0 0" }}>
          {kommande.map((handelse) => (
            <Handelserad key={handelse.id} handelse={handelse} />
          ))}
        </ul>
      )}

      {passerade.length > 0 && (
        <details style={{ marginTop: "var(--spacing-7)" }}>
          <summary style={{ cursor: "pointer", color: "var(--ink-muted)" }}>
            Passerade händelser ({passerade.length})
          </summary>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {passerade.map((handelse) => (
              <Handelserad key={handelse.id} handelse={handelse} />
            ))}
          </ul>
        </details>
      )}
    </main>
  );
}
