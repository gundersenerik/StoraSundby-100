import Link from "next/link";
import type { Metadata } from "next";
import { byggda, huvudmeny } from "@/lib/navigation";

export const metadata: Metadata = {
  title: "Sidan finns inte",
  robots: { index: false, follow: true },
};

/**
 * 404 med utgångar.
 *
 * Sajten byter plattform, och gamla länkar finns i mejl, på Facebook och i
 * bokmärken. De tolv gamla adresserna redirectar, men allt annat landar
 * här — och då ska besökaren komma vidare i stället för att backa.
 */
export default function IckeFunnen() {
  return (
    <main style={{ padding: "var(--spacing-7) var(--spacing-5)", maxWidth: "40rem", margin: "0 auto" }}>
      <h1>Sidan finns inte</h1>
      <p style={{ color: "var(--ink-muted)", maxWidth: "var(--measure)" }}>
        Sajten byggs om, så sidan kan ha flyttat eller ännu inte vara klar.
        Här är det som finns just nu:
      </p>

      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}>
          <Link href="/" style={{ display: "inline-flex", minHeight: "44px", alignItems: "center" }}>
            Startsidan
          </Link>
        </li>
        {byggda(huvudmeny).map((post) => (
          <li key={post.href} style={{ padding: "var(--spacing-2) 0", borderBottom: "1px solid var(--line)" }}>
            <Link href={post.href} style={{ display: "inline-flex", minHeight: "44px", alignItems: "center" }}>
              {post.etikett}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
