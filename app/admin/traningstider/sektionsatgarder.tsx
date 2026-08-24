"use client";

import { useState, useTransition } from "react";
import { flyttaSektion, nyttPass, pausaSektion } from "./actions";

/**
 * Massåtgärderna som faktiskt behövs i verkligheten.
 *
 * Att flytta en hel grupp en timme är det vanligaste när en hall byter tid.
 * Utan den knappen blir det fyra separata ändringar, och då är minuten borta.
 */
export function Sektionsatgarder({
  sektion,
  sasong,
}: {
  sektion: string;
  sasong: string;
}) {
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();

  function kor(atgard: () => Promise<{ ok: boolean; meddelande?: string; antal?: number }>, lyckat: (n?: number) => string) {
    setBesked(null);
    start(async () => {
      const svar = await atgard();
      setBesked(
        svar.ok
          ? { ok: true, text: lyckat(svar.antal) }
          : { ok: false, text: svar.meddelande ?? "Något gick fel." },
      );
    });
  }

  const knapp: React.CSSProperties = {
    minHeight: "44px",
    padding: "0 var(--spacing-4)",
    fontSize: "var(--text-sm)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
    cursor: pagar ? "wait" : "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--spacing-2)",
        margin: "var(--spacing-3) 0",
      }}
    >
      <button
        type="button"
        disabled={pagar}
        style={knapp}
        onClick={() =>
          kor(
            () => flyttaSektion(sektion, sasong, -60),
            (n) => `${n} pass flyttade en timme tidigare.`,
          )
        }
      >
        En timme tidigare
      </button>

      <button
        type="button"
        disabled={pagar}
        style={knapp}
        onClick={() =>
          kor(
            () => flyttaSektion(sektion, sasong, 60),
            (n) => `${n} pass flyttade en timme senare.`,
          )
        }
      >
        En timme senare
      </button>

      <button
        type="button"
        disabled={pagar}
        style={knapp}
        onClick={() =>
          kor(
            () => pausaSektion(sektion, sasong, true),
            (n) => `${n} pass satta på uppehåll.`,
          )
        }
      >
        Pausa hela sektionen
      </button>

      <button
        type="button"
        disabled={pagar}
        style={knapp}
        onClick={() =>
          kor(
            () => pausaSektion(sektion, sasong, false),
            (n) => `${n} pass återstartade.`,
          )
        }
      >
        Återstarta
      </button>

      <button
        type="button"
        disabled={pagar}
        style={{ ...knapp, borderColor: "var(--brand)", color: "var(--brand)" }}
        onClick={() => kor(() => nyttPass(sektion, sasong), () => "Nytt pass tillagt. Fyll i dag och tid, och återstarta det sedan.")}
      >
        Lägg till pass
      </button>

      {besked && (
        <p
          role="status"
          aria-live="polite"
          style={{
            flexBasis: "100%",
            margin: 0,
            fontSize: "var(--text-sm)",
            color: besked.ok ? "var(--ok)" : "var(--danger)",
          }}
        >
          {besked.text}
        </p>
      )}
    </div>
  );
}
