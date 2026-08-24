import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Pass, Sektion } from "@/lib/traning";
import { Rad } from "./rad";
import { Sektionsatgarder } from "./sektionsatgarder";
import { Sasongsval } from "./sasongsval";
import { Kopiera } from "./kopiera";

export const metadata: Metadata = {
  title: "Ändra träningstider",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Standardsäsong tills klubben bekräftat säsongsbegreppet. Se C1. */
const STANDARDSASONG = "okand-2026";

export default async function AdminTraningstider({
  searchParams,
}: {
  searchParams: Promise<{ sasong?: string }>;
}) {
  const supabase = await supabaseServer();
  const { sasong } = await searchParams;

  // Vilka säsonger som finns. Utan den här listan går en kopierad säsong
  // inte att öppna — kopiera_sasong skapade något osynligt.
  const { data: allaSasonger } = await supabase.from("training_sessions").select("season");
  const sasonger = [...new Set((allaSasonger ?? []).map((r) => r.season as string))].sort();
  const SASONG = sasong && sasonger.includes(sasong) ? sasong : STANDARDSASONG;

  const [pass, sektioner] = await Promise.all([
    supabase.from("training_sessions").select("*").eq("season", SASONG).order("sort_order"),
    supabase.from("sections").select("slug, heading, sort_order").order("sort_order"),
  ]);

  const rader = (pass.data ?? []) as Pass[];
  const alla = (sektioner.data ?? []) as Sektion[];
  const medPass = alla.filter((s) => rader.some((r) => r.section_slug === s.slug));

  return (
    <main style={{ padding: "var(--spacing-5)", maxWidth: "64rem", margin: "0 auto" }}>
      <p style={{ fontSize: "var(--text-sm)" }}>
        <Link href="/admin">← Admin</Link>
      </p>

      <h1>Träningstider</h1>

      {sasonger.length > 1 && (
        <div style={{ margin: "var(--spacing-4) 0" }}>
          <Sasongsval sasonger={sasonger} vald={SASONG} />
        </div>
      )}

      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Ändra direkt i listan. Allt sparas av sig självt när du lämnar fältet —
        det finns ingen sparaknapp. <strong>Pausa</strong> gör att passet visas
        som uppehåll på sajten i stället för att försvinna.
      </p>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)", fontSize: "var(--text-sm)" }}>
        Knapparna ovanför varje sektion ändrar alla pass i sektionen på en gång.
        Byter hallen tid är <strong>en timme tidigare</strong> en knapptryckning
        i stället för fyra separata ändringar.
      </p>

      {rader.length === 0 && (
        <p style={{ color: "var(--ink-muted)" }}>
          Inga pass för säsongen ännu.
        </p>
      )}

      {medPass.map((s) => (
        <section key={s.slug} style={{ marginTop: "var(--spacing-6)" }}>
          <h2 style={{ fontSize: "var(--text-lg)" }}>{s.heading ?? s.slug}</h2>
          <Sektionsatgarder sektion={s.slug} sasong={SASONG} />
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {rader
              .filter((r) => r.section_slug === s.slug)
              .map((r) => (
                <Rad key={r.id} pass={r} />
              ))}
          </ul>
        </section>
      ))}

      {rader.length > 0 && <Kopiera fran={SASONG} />}
    </main>
  );
}
