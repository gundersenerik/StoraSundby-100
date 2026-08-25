"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { skapaNyhet } from "./actions";

const TAPPAT_SVAR =
  "Svaret från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen gick igenom.";

/**
 * Ny nyhet: bara en rubrik behövs för att komma igång. Utkastet skapas
 * direkt och resten skrivs i listan nedanför — tröskeln för att börja
 * ska vara en rad, inte ett formulär.
 */
export function NyNyhet() {
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();
  const formularRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function skapa(formData: FormData) {
    setBesked(null);
    start(async () => {
      try {
        const svar = await skapaNyhet(formData);
        if (svar.ok) {
          formularRef.current?.reset();
          setBesked({ ok: true, text: "Utkastet är skapat. Skriv klart nedanför och publicera när du är nöjd." });
          router.refresh();
        } else {
          setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  return (
    <form
      ref={formularRef}
      action={skapa}
      aria-label="Ny nyhet"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--spacing-3)" }}
    >
      <label style={{ flex: "1 1 16rem", display: "flex", flexDirection: "column", gap: "var(--spacing-1)", fontSize: "var(--text-sm)" }}>
        <span style={{ color: "var(--ink-muted)" }}>Rubrik på den nya nyheten</span>
        <input
          name="titel"
          type="text"
          required
          maxLength={200}
          style={{
            minHeight: "44px",
            padding: "var(--spacing-2) var(--spacing-3)",
            fontSize: "var(--text-base)",
            fontFamily: "inherit",
            background: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
          }}
        />
      </label>
      <button
        type="submit"
        disabled={pagar}
        style={{
          minHeight: "44px",
          padding: "0 var(--spacing-4)",
          fontSize: "var(--text-base)",
          background: "var(--surface)",
          color: "var(--brand)",
          border: "1px solid var(--brand)",
          borderRadius: "var(--radius-md)",
          cursor: pagar ? "wait" : "pointer",
        }}
      >
        Skapa utkast
      </button>

      {besked && (
        <p
          role={besked.ok ? "status" : "alert"}
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
    </form>
  );
}
