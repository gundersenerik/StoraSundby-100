"use client";

import { useActionState } from "react";
import { skickaLank } from "./actions";

export function InloggningsFormular() {
  const [resultat, action, pagar] = useActionState(skickaLank, null);

  const kontroll = {
    width: "100%",
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  return (
    <div style={{ marginTop: "var(--spacing-5)" }}>
      <form action={action}>
        <label
          htmlFor="epost"
          style={{ display: "block", marginBottom: "var(--spacing-1)", fontSize: "var(--text-sm)" }}
        >
          E-postadress
        </label>
        <input
          id="epost"
          name="epost"
          type="email"
          autoComplete="email"
          required
          disabled={pagar}
          style={kontroll}
        />

        <button
          type="submit"
          disabled={pagar}
          style={{
            ...kontroll,
            marginTop: "var(--spacing-4)",
            background: "var(--brand)",
            color: "var(--brand-ink)",
            border: "none",
            cursor: pagar ? "wait" : "pointer",
          }}
        >
          {pagar ? "Skickar…" : "Skicka inloggningslänk"}
        </button>
      </form>

      {resultat && (
        <p
          role="status"
          aria-live="polite"
          style={{
            marginTop: "var(--spacing-4)",
            fontSize: "var(--text-sm)",
            color: resultat.status === "fel" ? "var(--danger)" : "var(--ok)",
          }}
        >
          {resultat.meddelande}
        </p>
      )}
    </div>
  );
}
