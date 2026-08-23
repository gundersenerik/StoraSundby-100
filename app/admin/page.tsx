import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function Admin() {
  const supabase = await supabaseServer();

  const [{ count: antalPass }, { count: antalSektioner }] = await Promise.all([
    supabase.from("training_sessions").select("*", { count: "exact", head: true }),
    supabase.from("sections").select("*", { count: "exact", head: true }),
  ]);

  return (
    <main style={{ padding: "var(--spacing-6)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Vad vill du göra?</h1>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-5)",
            marginTop: "var(--spacing-5)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            <Link href="/admin/traningstider">Ändra träningstider</Link>
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
            {antalPass ?? 0} pass i {antalSektioner ?? 0} sektioner. Klicka på en tid
            och ändra den direkt i listan.
          </p>
        </li>
      </ul>
    </main>
  );
}
