import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/config/content";
import { supabaseServer } from "@/lib/supabase-server";
import type { Bokning, Stuga } from "@/lib/uthyrning";
import { Bokningsrad } from "./bokningsrad";
import { Sparrar, type SparrRad } from "./sparr";

export const metadata: Metadata = {
  title: "Bokningar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Kansliets bokningsvy. Nya förfrågningar överst — det är de som väntar på
 * någon. Därefter kommande bekräftade, och sist historiken.
 *
 * Läsningen går genom sessionsklienten så att RLS avgör: en administratör
 * ser allt, alla andra ser ingenting. Layouten har redan omdirigerat
 * utloggade, men det är RLS som är spärren.
 */
export default async function AdminBokningar() {
  const supabase = await supabaseServer();

  const [bokningar, stugor, sparrar] = await Promise.all([
    supabase.from("bookings").select("*").order("created_at", { ascending: false }),
    supabase.from("cabins").select("id, namn, beds, dog_friendly, description, sort_order").order("sort_order"),
    supabase.from("booking_blocks").select("id, cabin_id, starts_at, ends_at, reason").order("starts_at"),
  ]);

  const alla = (bokningar.data ?? []) as Bokning[];
  const stuglista = (stugor.data ?? []) as Stuga[];
  const stugnamn = new Map(stuglista.map((s) => [s.id, s.namn]));

  const forfragningar = alla.filter((b) => b.status === "forfragan");
  const aktiva = alla
    .filter((b) => b.status === "bekraftad" || b.status === "betald")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
  const historik = alla.filter(
    (b) => b.status === "genomford" || b.status === "avbojd" || b.status === "avbokad",
  );

  return (
    <main style={{ padding: "var(--spacing-5)", maxWidth: "64rem", margin: "0 auto" }}>
      <p style={{ fontSize: "var(--text-sm)" }}>
        <Link href="/admin">← Admin</Link>
      </p>

      <h1>Bokningar</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Bekräfta skickar ett bekräftelsemejl till gästen med betalinstruktioner.
        Vad som är ledigt syns i{" "}
        <Link href={routes.rental}>kalendern på sajten</Link>, som uppdateras
        när du bekräftar eller spärrar.
      </p>

      <section style={{ marginTop: "var(--spacing-6)" }}>
        <h2 style={{ fontSize: "var(--text-lg)" }}>
          Att ta ställning till{forfragningar.length > 0 ? ` (${forfragningar.length})` : ""}
        </h2>
        {forfragningar.length === 0 ? (
          <p style={{ color: "var(--ink-muted)" }}>Inga obesvarade förfrågningar. Skönt.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--spacing-3)" }}>
            {forfragningar.map((bokning) => (
              <Bokningsrad
                key={bokning.id}
                bokning={bokning}
                stugnamn={bokning.cabin_id ? stugnamn.get(bokning.cabin_id) ?? null : null}
              />
            ))}
          </ul>
        )}
      </section>

      {aktiva.length > 0 && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2 style={{ fontSize: "var(--text-lg)" }}>Kommande bokningar</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--spacing-3)" }}>
            {aktiva.map((bokning) => (
              <Bokningsrad
                key={bokning.id}
                bokning={bokning}
                stugnamn={bokning.cabin_id ? stugnamn.get(bokning.cabin_id) ?? null : null}
              />
            ))}
          </ul>
        </section>
      )}

      <Sparrar sparrar={(sparrar.data ?? []) as SparrRad[]} stugor={stuglista} />

      {historik.length > 0 && (
        <section style={{ marginTop: "var(--spacing-7)" }}>
          <h2 style={{ fontSize: "var(--text-lg)" }}>Historik</h2>
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--spacing-3)" }}>
            {historik.map((bokning) => (
              <Bokningsrad
                key={bokning.id}
                bokning={bokning}
                stugnamn={bokning.cabin_id ? stugnamn.get(bokning.cabin_id) ?? null : null}
              />
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
