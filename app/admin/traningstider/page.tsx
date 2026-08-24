import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { Pass, Sektion } from "@/lib/traning";
import { Rad } from "./rad";
import { Sektionsatgarder } from "./sektionsatgarder";

export const metadata: Metadata = {
  title: "Ändra träningstider",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SASONG = "okand-2026";

export default async function AdminTraningstider() {
  const supabase = await supabaseServer();

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
    </main>
  );
}
