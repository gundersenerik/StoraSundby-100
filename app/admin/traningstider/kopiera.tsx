"use client";

import { useState, useTransition } from "react";
import { kopieraSasong } from "./actions";

/**
 * Gränssnitt för kopiera_sasong.
 *
 * Server-actionen och databasfunktionen fanns redan, men hade ingen knapp —
 * funktionen gick alltså inte att nå från sajten. Åtgärden ligger kvar i
 * databasen där den hör hemma; det här är bara vägen in.
 *
 * Databasfunktionen vägrar skriva till en säsong som redan har pass. Att
 * slå ihop två scheman tyst vore värre än att be någon välja ett annat
 * namn — dubbletter i ett träningsschema upptäcks först när en förälder
 * står i fel hall.
 */
export function Kopiera({ fran }: { fran: string }) {
  const [till, setTill] = useState("");
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();

  const kontroll: React.CSSProperties = {
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  return (
    <section
      style={{
        marginTop: "var(--spacing-7)",
        padding: "var(--spacing-5)",
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <h2 style={{ fontSize: "var(--text-lg)", marginTop: 0 }}>Kopiera till en ny säsong</h2>
      <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
        Skapar en kopia av alla pass i <code>{fran}</code> under ett nytt namn.
        Nuvarande säsong lämnas orörd, och du kan växla mellan dem här ovanför.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", alignItems: "flex-end" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)", fontSize: "var(--text-sm)" }}>
          Namn på den nya säsongen
          <input
            value={till}
            onChange={(e) => setTill(e.target.value)}
            placeholder="var-2027"
            disabled={pagar}
            style={{ ...kontroll, minWidth: "12rem" }}
          />
        </label>

        <button
          type="button"
          disabled={pagar || till.trim() === ""}
          onClick={() => {
            setBesked(null);
            start(async () => {
              const svar = await kopieraSasong(fran, till.trim());
              setBesked(
                svar.ok
                  ? { ok: true, text: `${svar.antal ?? 0} pass kopierade till ${till.trim()}.` }
                  : { ok: false, text: svar.meddelande ?? "Kopieringen misslyckades." },
              );
            });
          }}
          style={{
            ...kontroll,
            background: "var(--brand)",
            color: "var(--brand-ink)",
            border: "none",
            cursor: pagar ? "wait" : "pointer",
          }}
        >
          {pagar ? "Kopierar…" : "Kopiera"}
        </button>
      </div>

      {besked && (
        <p
          role="status"
          aria-live="polite"
          style={{
            marginBottom: 0,
            fontSize: "var(--text-sm)",
            color: besked.ok ? "var(--ok)" : "var(--danger)",
          }}
        >
          {besked.text}
        </p>
      )}
    </section>
  );
}
