"use client";

import { useState, useTransition } from "react";
import { sparaPass, type Falt } from "./actions";
import { VECKODAGAR, type Pass } from "@/lib/traning";

/**
 * En rad i schemat, redigerbar direkt.
 *
 * Inga modaler, inga sidladdningar, ingen sparaknapp. Fälten ÄR
 * kontrollerna. Målet i prompten är att en ledare ska flytta ett pass från
 * torsdag 19.00 till 18.00 på under en minut, från telefonen, utan hjälp —
 * och varje extra klick äter av den minuten.
 *
 * Ändringen sparas när fältet lämnas, inte vid varje tangenttryck. Att spara
 * per tecken hade gett en halvskriven tid till databasen och en constraint
 * som säger ifrån mitt i skrivandet.
 *
 * Värdet uppdateras lokalt direkt och rullas tillbaka om servern säger nej,
 * så att gränssnittet aldrig visar något som inte faktiskt är sparat.
 *
 * Att det sparas markeras med bakgrund och aria-busy, inte med opacity.
 * Opacity sänker kontrasten på texten, och ett tillstånd som blir oläsbart
 * för den som behöver det mest är ingen bra signal. Axe fångade exakt det
 * felet i den publika vyn.
 */
export function Rad({ pass }: { pass: Pass }) {
  const [rad, setRad] = useState(pass);
  const [fel, setFel] = useState<string | null>(null);
  const [sparar, startTransition] = useTransition();

  const pausat = rad.status === "uppehall";

  function spara(falt: Falt, varde: string) {
    const foregaende = rad;
    setRad((r) => ({ ...r, [falt]: varde === "" ? null : varde }));
    setFel(null);

    startTransition(async () => {
      const svar = await sparaPass(rad.id, falt, varde);
      if (!svar.ok) {
        setRad(foregaende);
        setFel(svar.meddelande ?? "Kunde inte spara.");
      }
    });
  }

  function vaxlaStatus() {
    spara("status", pausat ? "aktiv" : "uppehall");
  }

  const kontroll: React.CSSProperties = {
    minHeight: "44px",
    padding: "var(--spacing-2)",
    fontSize: "var(--text-base)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  return (
    <li
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-3) 0",
        borderBottom: "1px solid var(--line)",
        background: sparar ? "var(--surface-alt)" : "transparent",
        transition: "background 120ms",
      }}
      aria-busy={sparar}
    >
      <input
        aria-label="Grupp"
        defaultValue={rad.grupp}
        onBlur={(e) => e.target.value !== rad.grupp && spara("grupp", e.target.value)}
        style={{ ...kontroll, flex: "1 1 12rem", minWidth: "10rem" }}
      />

      <select
        aria-label="Veckodag"
        value={rad.weekday ?? ""}
        onChange={(e) => spara("weekday", e.target.value)}
        style={{ ...kontroll, flex: "0 1 8rem" }}
      >
        <option value="">Ingen dag</option>
        {VECKODAGAR.slice(1).map((dag, i) => (
          <option key={dag} value={i + 1}>
            {dag}
          </option>
        ))}
      </select>

      <input
        aria-label="Starttid"
        type="time"
        value={rad.starts_at?.slice(0, 5) ?? ""}
        onChange={(e) => spara("starts_at", e.target.value)}
        style={{ ...kontroll, flex: "0 1 7rem" }}
      />

      <input
        aria-label="Sluttid"
        type="time"
        value={rad.ends_at?.slice(0, 5) ?? ""}
        onChange={(e) => spara("ends_at", e.target.value)}
        style={{ ...kontroll, flex: "0 1 7rem" }}
      />

      <input
        aria-label="Plats"
        defaultValue={rad.place ?? ""}
        placeholder="Plats"
        onBlur={(e) => e.target.value !== (rad.place ?? "") && spara("place", e.target.value)}
        style={{ ...kontroll, flex: "1 1 8rem" }}
      />

      <button
        type="button"
        onClick={vaxlaStatus}
        aria-pressed={pausat}
        style={{
          ...kontroll,
          flex: "0 0 auto",
          padding: "0 var(--spacing-4)",
          cursor: "pointer",
          background: pausat ? "var(--warn)" : "transparent",
          color: pausat ? "var(--paper)" : "var(--ink-muted)",
          borderColor: pausat ? "var(--warn)" : "var(--line)",
        }}
      >
        {pausat ? "Uppehåll" : "Pausa"}
      </button>

      {fel && (
        <p
          role="alert"
          style={{
            flexBasis: "100%",
            margin: 0,
            fontSize: "var(--text-sm)",
            color: "var(--danger)",
          }}
        >
          {fel}
        </p>
      )}
    </li>
  );
}
