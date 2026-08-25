"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { club } from "@/config/club";
import { EVENEMANG_ETIKETT } from "@/lib/evenemang";
import { skapaHandelse } from "./actions";

const TAPPAT_SVAR =
  "Svaret från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen gick igenom.";

/** Ny händelse: rubrik, typ och starttid räcker — resten kan fyllas på efteråt. */
export function NyHandelse() {
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();
  const formularRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function skapa(formData: FormData) {
    setBesked(null);
    start(async () => {
      try {
        const svar = await skapaHandelse(formData);
        if (svar.ok) {
          formularRef.current?.reset();
          setBesked({ ok: true, text: "Händelsen är inlagd och syns i kalendern." });
          router.refresh();
        } else {
          setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  const kontroll: React.CSSProperties = {
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    fontFamily: "inherit",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  const falt: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-1)",
    fontSize: "var(--text-sm)",
  };

  return (
    <form
      ref={formularRef}
      action={skapa}
      aria-label="Ny händelse"
      style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--spacing-3)" }}
    >
      <label style={{ ...falt, flex: "1 1 14rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Rubrik</span>
        <input name="titel" type="text" required maxLength={200} style={kontroll} />
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Typ</span>
        <select name="typ" defaultValue="ovrigt" style={kontroll}>
          {Object.entries(EVENEMANG_ETIKETT).map(([varde, etikett]) => (
            <option key={varde} value={varde}>
              {etikett}
            </option>
          ))}
        </select>
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Sektion</span>
        <select name="sektion" defaultValue="" style={kontroll}>
          <option value="">Hela föreningen</option>
          {club.sections
            .filter((s) => s.active)
            .map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
        </select>
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Datum</span>
        <input name="datum" type="date" required style={kontroll} />
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Klockslag</span>
        <input name="klockslag" type="time" required style={kontroll} />
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Slutdatum (frivilligt)</span>
        <input name="slutdatum" type="date" style={kontroll} />
      </label>
      <label style={falt}>
        <span style={{ color: "var(--ink-muted)" }}>Slut klockan</span>
        <input name="slutklockslag" type="time" style={kontroll} />
      </label>
      <label style={{ ...falt, flex: "1 1 10rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Plats (frivilligt)</span>
        <input name="plats" type="text" maxLength={200} style={kontroll} />
      </label>
      <label style={{ ...falt, flex: "2 1 14rem" }}>
        <span style={{ color: "var(--ink-muted)" }}>Beskrivning (frivilligt)</span>
        <input name="beskrivning" type="text" maxLength={4000} style={kontroll} />
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
        Lägg in
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
