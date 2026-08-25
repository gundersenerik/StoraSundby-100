import type { Metadata } from "next";
import { hamtaAllaNyheter } from "@/lib/nyheter-data";
import { supabaseServer } from "@/lib/supabase-server";
import { NyNyhet } from "./ny";
import { Nyhetsrad } from "./nyhetsrad";

export const metadata: Metadata = {
  title: "Nyheter — admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kansliets nyhetsvy. Utkast överst — det man håller på med ligger närmast
 * till hands — därefter publicerat, senaste först.
 */
export default async function AdminNyheter() {
  const supabase = await supabaseServer();
  const nyheter = await hamtaAllaNyheter(supabase);

  return (
    <main style={{ padding: "var(--spacing-6)", maxWidth: "48rem", margin: "0 auto" }}>
      <h1>Nyheter</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        En nyhet är ett utkast tills du publicerar den. Fälten sparas när du
        lämnar dem — det finns ingen sparaknapp.
      </p>

      <NyNyhet />

      {nyheter.length === 0 ? (
        <p style={{ marginTop: "var(--spacing-6)", color: "var(--ink-muted)" }}>
          Inga nyheter än. Skriv en rubrik ovanför så är du igång.
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: "var(--spacing-5) 0 0" }}>
          {nyheter.map((nyhet) => (
            <Nyhetsrad key={nyhet.id} nyhet={nyhet} />
          ))}
        </ul>
      )}
    </main>
  );
}
