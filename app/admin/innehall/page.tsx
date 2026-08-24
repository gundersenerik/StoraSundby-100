import type { Metadata } from "next";
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import type { SektionsInnehall } from "@/lib/sektioner";
import { Redigerare } from "./redigerare";

export const metadata: Metadata = {
  title: "Sektionstexter",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInnehall() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("sections")
    .select("slug, heading, sort_order, intro, body, hero_image, published")
    .order("sort_order");

  const sektioner = (data ?? []) as (SektionsInnehall & { published: boolean })[];

  return (
    <main style={{ padding: "var(--spacing-5)", maxWidth: "48rem", margin: "0 auto" }}>
      <p style={{ fontSize: "var(--text-sm)" }}>
        <Link href="/admin">← Admin</Link>
      </p>

      <h1>Sektionstexter</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Ändra direkt i fälten. Allt sparas när du lämnar fältet.{" "}
        <strong>Dold</strong> gömmer sektionen för besökare men behåller texten —
        du behöver aldrig radera något för att ta bort det från menyn.
      </p>

      {sektioner.map((s) => (
        <Redigerare key={s.slug} sektion={s} />
      ))}
    </main>
  );
}
