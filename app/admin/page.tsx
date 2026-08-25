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

  const [
    { count: antalPass },
    { count: antalSektioner },
    { count: antalForfragningar },
    { count: antalUtkast },
    { count: antalHandelser },
  ] = await Promise.all([
    supabase.from("training_sessions").select("*", { count: "exact", head: true }),
    supabase.from("sections").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "forfragan"),
    supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .is("published_at", null),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", new Date().toISOString()),
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
        <li
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-5)",
            marginTop: "var(--spacing-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            <Link href="/admin/bokningar">Hantera bokningar</Link>
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
            {antalForfragningar
              ? `${antalForfragningar} ${antalForfragningar === 1 ? "förfrågan väntar" : "förfrågningar väntar"} på svar.`
              : "Inga obesvarade förfrågningar just nu."}{" "}
            Bekräfta, avböj och spärra datum.
          </p>
        </li>
        <li
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-5)",
            marginTop: "var(--spacing-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            <Link href="/admin/nyheter">Skriva nyheter</Link>
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
            {antalUtkast
              ? `${antalUtkast} utkast väntar på att publiceras.`
              : "Skriv, publicera och avpublicera nyheter."}
          </p>
        </li>
        <li
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-5)",
            marginTop: "var(--spacing-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            <Link href="/admin/kalender">Fylla i kalendern</Link>
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
            {antalHandelser
              ? `${antalHandelser} kommande ${antalHandelser === 1 ? "händelse inlagd" : "händelser inlagda"}.`
              : "Matcher, tävlingar, läger, årsmöte och städdagar."}
          </p>
        </li>
        <li
          style={{
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--spacing-5)",
            marginTop: "var(--spacing-4)",
          }}
        >
          <h2 style={{ fontSize: "var(--text-lg)", margin: 0 }}>
            <Link href="/admin/innehall">Ändra sektionstexter</Link>
          </h2>
          <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", marginBottom: 0 }}>
            Rubrik, ingress och text per sektion. Dölj en sektion utan att
            radera den.
          </p>
        </li>
      </ul>
    </main>
  );
}
