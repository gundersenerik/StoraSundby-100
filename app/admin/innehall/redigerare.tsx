"use client";

import { useState, useTransition } from "react";
import { sparaSektion, type SektionsFalt } from "./actions";
import type { SektionsInnehall } from "@/lib/sektioner";

/**
 * Samma princip som träningstiderna: fälten är kontrollerna, ingen
 * sparaknapp, sparas när fältet lämnas.
 *
 * Avpublicering gömmer sektionen för besökare men behåller texten. En
 * volontär som vill ta bort något ur menyn ska inte behöva radera arbete.
 */
export function Redigerare({ sektion }: { sektion: SektionsInnehall & { published?: boolean } }) {
  const [rad, setRad] = useState(sektion);
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, start] = useTransition();

  function spara(falt: SektionsFalt, varde: string | boolean) {
    const innan = rad;
    setRad((r) => ({ ...r, [falt]: varde }));
    setFel(null);
    start(async () => {
      const svar = await sparaSektion(rad.slug, falt, varde);
      if (!svar.ok) {
        setRad(innan);
        setFel(svar.meddelande ?? "Kunde inte spara.");
      }
    });
  }

  const kontroll: React.CSSProperties = {
    width: "100%",
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    fontFamily: "inherit",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  const etikett: React.CSSProperties = {
    display: "block",
    marginTop: "var(--spacing-4)",
    marginBottom: "var(--spacing-1)",
    fontSize: "var(--text-sm)",
    color: "var(--ink-muted)",
  };

  return (
    <section
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-5)",
        marginTop: "var(--spacing-5)",
        background: sparar ? "var(--surface-alt)" : "transparent",
      }}
      aria-busy={sparar}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--spacing-3)" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-lg)", flex: 1 }}>
          {rad.heading ?? rad.slug}
        </h2>
        <button
          type="button"
          onClick={() => spara("published", !rad.published)}
          aria-pressed={rad.published}
          style={{
            minHeight: "44px",
            padding: "0 var(--spacing-4)",
            fontSize: "var(--text-sm)",
            border: "1px solid",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            background: rad.published ? "var(--ok)" : "transparent",
            color: rad.published ? "var(--paper)" : "var(--ink-muted)",
            borderColor: rad.published ? "var(--ok)" : "var(--line)",
          }}
        >
          {rad.published ? "Publicerad" : "Dold"}
        </button>
      </div>

      <label style={etikett} htmlFor={`rubrik-${rad.slug}`}>
        Rubrik
      </label>
      <input
        id={`rubrik-${rad.slug}`}
        defaultValue={rad.heading ?? ""}
        onBlur={(e) => e.target.value !== (rad.heading ?? "") && spara("heading", e.target.value)}
        style={kontroll}
      />

      <label style={etikett} htmlFor={`ingress-${rad.slug}`}>
        Ingress — en mening som beskriver sektionen. Syns på startsidan.
      </label>
      <textarea
        id={`ingress-${rad.slug}`}
        rows={2}
        defaultValue={rad.intro ?? ""}
        onBlur={(e) => e.target.value !== (rad.intro ?? "") && spara("intro", e.target.value)}
        style={kontroll}
      />

      <label style={etikett} htmlFor={`text-${rad.slug}`}>
        Text — tom rad mellan stycken
      </label>
      <textarea
        id={`text-${rad.slug}`}
        rows={10}
        defaultValue={rad.body ?? ""}
        onBlur={(e) => e.target.value !== (rad.body ?? "") && spara("body", e.target.value)}
        style={{ ...kontroll, lineHeight: "var(--leading-normal)" }}
      />

      {fel && (
        <p role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {fel}
        </p>
      )}
    </section>
  );
}
