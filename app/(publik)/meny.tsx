"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenyPost } from "@/lib/navigation";

/**
 * Markerar var besökaren är med aria-current, inte bara med färg.
 * Färg ensam säger ingenting till en skärmläsare.
 */
export function Meny({ poster }: { poster: MenyPost[] }) {
  const sokvag = usePathname();

  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--spacing-1) var(--spacing-4)",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {poster.map((post) => {
        const aktiv = sokvag === post.href;
        return (
          <li key={post.href}>
            <Link
              href={post.href}
              aria-current={aktiv ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                color: aktiv ? "var(--brand)" : "var(--ink)",
                fontWeight: aktiv ? 600 : 400,
                textDecoration: aktiv ? "underline" : "none",
                textUnderlineOffset: "0.3em",
              }}
            >
              {post.etikett}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
