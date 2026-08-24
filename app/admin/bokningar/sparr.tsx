"use client";

import { useRef, useState, useTransition } from "react";
import { formateraDatum, laggTillDagar, tillLokaltDatum } from "@/lib/tid";
import type { Stuga } from "@/lib/uthyrning";
import { skapaSparr, taBortSparr } from "./actions";

export interface SparrRad {
  id: string;
  cabin_id: string | null;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

/**
 * Spärrade perioder: underhåll, egna läger, helger man inte vill hyra ut.
 * En spärr syns som upptagen i den publika kalendern utan att vara en
 * bokning — kansliet ska inte behöva hitta på en låtsasgäst.
 */
export function Sparrar({ sparrar, stugor }: { sparrar: SparrRad[]; stugor: Stuga[] }) {
  const [lista, setLista] = useState(sparrar);
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();
  const formularRef = useRef<HTMLFormElement>(null);

  const stugnamn = new Map(stugor.map((s) => [s.id, s.namn]));

  function lagg(formData: FormData) {
    setBesked(null);
    start(async () => {
      const svar = await skapaSparr(formData);
      if (svar.ok) {
        formularRef.current?.reset();
        setBesked({ ok: true, text: "Perioden är spärrad. Ladda om sidan för att se den i listan." });
      } else {
        setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
      }
    });
  }

  function taBort(id: string) {
    setBesked(null);
    start(async () => {
      const svar = await taBortSparr(id);
      if (svar.ok) {
        setLista((l) => l.filter((s) => s.id !== id));
        setBesked({ ok: true, text: "Spärren är borttagen." });
      } else {
        setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
      }
    });
  }

  const kontroll: React.CSSProperties = {
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
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
    <section style={{ marginTop: "var(--spacing-7)" }}>
      <h2 style={{ fontSize: "var(--text-lg)" }}>Spärrade datum</h2>
      <p style={{ color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
        Spärra en period när något inte ska gå att boka — underhåll, egna
        läger eller helger ni vill hålla fria. Spärren syns som upptagen i
        kalendern på sajten.
      </p>

      <form
        ref={formularRef}
        action={lagg}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--spacing-3)" }}
      >
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Objekt</span>
          <select name="objekt" defaultValue="hela-anlaggningen" style={kontroll}>
            <option value="hela-anlaggningen">Hela anläggningen</option>
            {stugor.map((s) => (
              <option key={s.id} value={s.id}>
                {s.namn}
              </option>
            ))}
          </select>
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Från</span>
          <input name="fran" type="date" required style={kontroll} />
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Till och med</span>
          <input name="till" type="date" required style={kontroll} />
        </label>
        <label style={{ ...falt, flex: "1 1 10rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>Anledning (frivilligt)</span>
          <input name="anledning" type="text" style={kontroll} />
        </label>
        <button
          type="submit"
          disabled={pagar}
          style={{ ...kontroll, cursor: pagar ? "wait" : "pointer", borderColor: "var(--brand)", color: "var(--brand)" }}
        >
          Spärra
        </button>
      </form>

      {lista.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0, margin: "var(--spacing-4) 0 0" }}>
          {lista.map((sparr) => (
            <li
              key={sparr.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "var(--spacing-3)",
                padding: "var(--spacing-2) 0",
                borderBottom: "1px solid var(--line)",
                fontSize: "var(--text-sm)",
              }}
            >
              <strong>{sparr.cabin_id === null ? "Hela anläggningen" : stugnamn.get(sparr.cabin_id) ?? sparr.cabin_id}</strong>
              <span>
                {/* Lagrat halvöppet: ends_at är midnatt dagen EFTER sista
                    spärrade dagen. Visas inklusivt, som kansliet angav det —
                    annars ser en spärr t.o.m. den 12:e ut att gälla den 13:e. */}
                {formateraDatum(tillLokaltDatum(sparr.starts_at))} –{" "}
                {formateraDatum(laggTillDagar(tillLokaltDatum(sparr.ends_at), -1))}
              </span>
              {sparr.reason && <span style={{ color: "var(--ink-muted)" }}>{sparr.reason}</span>}
              <button
                type="button"
                disabled={pagar}
                onClick={() => taBort(sparr.id)}
                style={{
                  marginLeft: "auto",
                  minHeight: "44px",
                  padding: "0 var(--spacing-3)",
                  background: "transparent",
                  color: "var(--ink-muted)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-md)",
                  cursor: pagar ? "wait" : "pointer",
                }}
              >
                Ta bort
              </button>
            </li>
          ))}
        </ul>
      )}

      {besked && (
        <p
          role={besked.ok ? "status" : "alert"}
          style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--text-sm)", color: besked.ok ? "var(--ok)" : "var(--danger)" }}
        >
          {besked.text}
        </p>
      )}
    </section>
  );
}
