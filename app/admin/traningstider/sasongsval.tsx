"use client";

import { useRouter } from "next/navigation";

/**
 * Byter vilken säsong som redigeras.
 *
 * Fanns inte förrän kopieringsfunktionen byggdes, och saknades då direkt:
 * man kunde kopiera schemat till en ny säsong men aldrig se den. En knapp
 * som skapar något osynligt är en halvfärdig knapp.
 */
export function Sasongsval({
  sasonger,
  vald,
}: {
  sasonger: string[];
  vald: string;
}) {
  const router = useRouter();

  return (
    <label
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "var(--spacing-1)",
        fontSize: "var(--text-sm)",
      }}
    >
      <span style={{ color: "var(--ink-muted)" }}>Säsong</span>
      <select
        value={vald}
        onChange={(e) => router.push(`/admin/traningstider?sasong=${encodeURIComponent(e.target.value)}`)}
        style={{
          minHeight: "44px",
          padding: "var(--spacing-2) var(--spacing-3)",
          fontSize: "var(--text-base)",
          background: "var(--surface)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {sasonger.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
