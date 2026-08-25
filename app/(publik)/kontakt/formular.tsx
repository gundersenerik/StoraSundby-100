"use client";

import { useRef, useState, useTransition } from "react";
import { skickaMeddelande } from "./actions";

const TAPPAT_SVAR =
  "Meddelandet kanske inte kom fram. Försök igen, eller mejla oss direkt.";

/**
 * Kontaktformuläret. Tidsspärren fryses vid montering — granskningen av
 * bokningsformuläret hittade att ett värde som sätts vid varje rendering
 * tyst klassar en människa som robot om hon rättar ett fel snabbt.
 */
export function Kontaktformular() {
  const [renderadKl] = useState(() => Date.now());
  const [skickat, setSkickat] = useState(false);
  const [fel, setFel] = useState<string | null>(null);
  const [pagar, start] = useTransition();
  const formularRef = useRef<HTMLFormElement>(null);

  function skicka(formData: FormData) {
    setFel(null);
    start(async () => {
      try {
        const svar = await skickaMeddelande(formData);
        if (svar.ok) {
          formularRef.current?.reset();
          setSkickat(true);
        } else {
          setFel(svar.meddelande ?? "Något gick fel. Försök igen.");
        }
      } catch {
        setFel(TAPPAT_SVAR);
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

  if (skickat) {
    return (
      <p
        role="status"
        style={{
          background: "var(--surface-alt)",
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-md)",
          padding: "var(--spacing-3) var(--spacing-4)",
          maxWidth: "var(--measure)",
        }}
      >
        Tack för ditt meddelande! Kansliet sköts ideellt, så ha lite tålamod
        med svaret.
      </p>
    );
  }

  return (
    <form ref={formularRef} action={skicka} aria-label="Skriv till oss" style={{ maxWidth: "34rem" }}>
      <input type="hidden" name="renderadKl" value={renderadKl} />
      {/* Honeypot: osynligt för människor, oemotståndligt för robotar. */}
      <div style={{ position: "absolute", left: "-9999px" }} aria-hidden="true">
        <label>
          Hemsida
          <input name="hemsida" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label style={etikett} htmlFor="kontakt-namn">
        Namn
      </label>
      <input id="kontakt-namn" name="namn" type="text" required maxLength={200} autoComplete="name" style={kontroll} />

      <label style={etikett} htmlFor="kontakt-epost">
        E-postadress — så vi kan svara dig
      </label>
      <input id="kontakt-epost" name="epost" type="email" required maxLength={320} autoComplete="email" style={kontroll} />

      <label style={etikett} htmlFor="kontakt-meddelande">
        Meddelande
      </label>
      <textarea id="kontakt-meddelande" name="meddelande" required rows={6} maxLength={4000} style={{ ...kontroll, lineHeight: "var(--leading-normal)" }} />

      <button
        type="submit"
        disabled={pagar}
        style={{
          marginTop: "var(--spacing-4)",
          minHeight: "44px",
          padding: "0 var(--spacing-5)",
          fontSize: "var(--text-base)",
          background: "var(--brand)",
          color: "var(--brand-ink)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          fontWeight: 600,
          cursor: pagar ? "wait" : "pointer",
        }}
      >
        {pagar ? "Skickar …" : "Skicka"}
      </button>

      {fel && (
        <p role="alert" style={{ color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {fel}
        </p>
      )}
    </form>
  );
}
