"use client";

import { useState, useTransition } from "react";
import { formateraDatum, tillLokaltDatum } from "@/lib/tid";
import {
  ANDAMAL_ETIKETT,
  STATUS_ETIKETT,
  type Bokning,
  type BokningsStatus,
} from "@/lib/uthyrning";
import { sattStatus } from "./actions";

/**
 * En bokning i kansliets lista, med ett klick per åtgärd.
 *
 * Knapparna följer flödet förfrågan → bekräftad → betald → genomförd, plus
 * avböj och avboka. Fel från databasen — som att tiden hunnit bli upptagen —
 * visas i klartext vid raden i stället för att försvinna i ett konsolfönster.
 */
export function Bokningsrad({ bokning, stugnamn }: { bokning: Bokning; stugnamn: string | null }) {
  const [rad, setRad] = useState(bokning);
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();

  const objekt = rad.cabin_id === null ? "Hela anläggningen" : stugnamn ?? rad.cabin_id;

  function byt(status: BokningsStatus, lyckat: string) {
    setBesked(null);
    start(async () => {
      // Utan catch försvinner ett tappat svar spårlöst: åtgärden kan ha
      // sparats i databasen fast anropet föll, och kansliet står kvar utan
      // besked. Säg det i stället rakt ut.
      try {
        const svar = await sattStatus(rad.id, status);
        if (svar.ok) {
          setRad((r) => ({ ...r, status }));
          setBesked({
            ok: true,
            text:
              svar.mejlSkickat === undefined
                ? lyckat
                : svar.mejlSkickat
                  ? `${lyckat} Bekräftelsemejl skickat.`
                  : `${lyckat} Inget mejl gick ut — e-posten är inte konfigurerad än, så hör av dig till gästen själv.`,
          });
        } else {
          setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
        }
      } catch {
        setBesked({
          ok: false,
          text: "Svaret från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen gick igenom.",
        });
      }
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

  const statusfarg: Partial<Record<BokningsStatus, string>> = {
    forfragan: "var(--warn)",
    bekraftad: "var(--ok)",
    betald: "var(--ok)",
    avbojd: "var(--ink-muted)",
    avbokad: "var(--ink-muted)",
    genomford: "var(--ink-muted)",
  };

  return (
    <li
      aria-busy={pagar}
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-4) var(--spacing-5)",
        background: pagar ? "var(--surface-alt)" : "transparent",
        transition: "background 120ms",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--spacing-3)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-lg)" }}>{objekt}</h3>
        <span
          style={{
            padding: "var(--spacing-1) var(--spacing-3)",
            borderRadius: "var(--radius-pill)",
            border: `1px solid ${statusfarg[rad.status] ?? "var(--line)"}`,
            color: statusfarg[rad.status] ?? "var(--ink)",
            fontSize: "var(--text-sm)",
          }}
        >
          {STATUS_ETIKETT[rad.status]}
        </span>
        <span style={{ marginLeft: "auto", color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
          {formateraDatum(tillLokaltDatum(rad.starts_at))} – {formateraDatum(tillLokaltDatum(rad.ends_at))}
        </span>
      </div>

      <p style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--text-sm)" }}>
        {rad.contact_name} · <a href={`mailto:${rad.contact_email}`}>{rad.contact_email}</a>
        {rad.contact_phone && <> · {rad.contact_phone}</>}
      </p>
      <p style={{ margin: "var(--spacing-1) 0 0", color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
        {rad.party_size} personer · {ANDAMAL_ETIKETT[rad.purpose]}
        {rad.bringing_dog && " · hund med"}
        {rad.estimated_price !== null && ` · pris ${rad.estimated_price} kr`}
      </p>
      {rad.message && (
        <p style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
          ”{rad.message}”
        </p>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-2)", marginTop: "var(--spacing-3)" }}>
        {rad.status === "forfragan" && (
          <>
            <button
              type="button"
              disabled={pagar}
              style={{ ...knapp, borderColor: "var(--ok)", color: "var(--ok)" }}
              onClick={() => byt("bekraftad", "Bokningen är bekräftad.")}
            >
              Bekräfta
            </button>
            <button type="button" disabled={pagar} style={knapp} onClick={() => byt("avbojd", "Förfrågan är avböjd.")}>
              Avböj
            </button>
          </>
        )}
        {rad.status === "bekraftad" && (
          <>
            <button
              type="button"
              disabled={pagar}
              style={{ ...knapp, borderColor: "var(--ok)", color: "var(--ok)" }}
              onClick={() => byt("betald", "Betalningen är avprickad.")}
            >
              Markera betald
            </button>
            <button type="button" disabled={pagar} style={knapp} onClick={() => byt("avbokad", "Bokningen är avbokad.")}>
              Avboka
            </button>
          </>
        )}
        {rad.status === "betald" && (
          <>
            <button
              type="button"
              disabled={pagar}
              style={knapp}
              onClick={() => byt("genomford", "Bokningen är markerad som genomförd.")}
            >
              Markera genomförd
            </button>
            <button type="button" disabled={pagar} style={knapp} onClick={() => byt("avbokad", "Bokningen är avbokad.")}>
              Avboka
            </button>
          </>
        )}
      </div>

      {besked && (
        <p
          role={besked.ok ? "status" : "alert"}
          style={{ margin: "var(--spacing-2) 0 0", fontSize: "var(--text-sm)", color: besked.ok ? "var(--ok)" : "var(--danger)" }}
        >
          {besked.text}
        </p>
      )}
    </li>
  );
}
