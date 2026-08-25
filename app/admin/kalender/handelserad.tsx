"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { club } from "@/config/club";
import {
  EVENEMANG_ETIKETT,
  formateraNar,
  tillLokaltKlockslag,
  type Evenemang,
  type EvenemangsTyp,
} from "@/lib/evenemang";
import { tillLokaltDatum, tillUtc } from "@/lib/tid";
import {
  sattSynlighet,
  sparaHandelsefalt,
  sparaHandelsetid,
  taBortHandelse,
  type HandelseFalt,
} from "./actions";

const TAPPAT_SVAR =
  "Svaret från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen gick igenom.";

/**
 * En händelse i kansliets lista. Textfält sparas när de lämnas; tiderna
 * hänger ihop (start före slut) och sparas därför tillsammans med en
 * knapp i stället för fält för fält.
 */
export function Handelserad({ handelse }: { handelse: Evenemang }) {
  const [rad, setRad] = useState(handelse);
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();
  const router = useRouter();

  function kor(atgard: () => Promise<{ ok: boolean; meddelande?: string }>, lyckat?: () => void, lyckatText?: string) {
    setBesked(null);
    start(async () => {
      try {
        const svar = await atgard();
        if (svar.ok) {
          lyckat?.();
          if (lyckatText) setBesked({ ok: true, text: lyckatText });
        } else {
          setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  function spara(falt: HandelseFalt, varde: string) {
    const innan = rad;
    setRad((r) => ({ ...r, [falt]: varde === "" ? null : varde }));
    setBesked(null);
    start(async () => {
      try {
        const svar = await sparaHandelsefalt(rad.id, falt, varde);
        if (!svar.ok) {
          setRad(innan);
          setBesked({ ok: false, text: svar.meddelande ?? "Kunde inte spara." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  function sparaTider(formData: FormData) {
    const datum = String(formData.get("datum") ?? "");
    const klockslag = String(formData.get("klockslag") ?? "");
    const slutdatum = String(formData.get("slutdatum") ?? "");
    const slutklockslag = String(formData.get("slutklockslag") ?? "");
    kor(
      () => sparaHandelsetid(rad.id, { datum, klockslag, slutdatum, slutklockslag }),
      () => {
        // Radens lokala tillstånd måste synka, annars visar radhuvudet den
        // gamla tiden trots att servern sparat — och React återställer
        // fältens defaultValue från just det tillståndet efter en form
        // action. Samma tolkningsregler som i actions.ts tolkaTider.
        const nyttSlut =
          slutdatum || slutklockslag
            ? tillUtc(slutdatum || datum, slutklockslag || "23:59").toISOString()
            : null;
        setRad((r) => ({
          ...r,
          starts_at: tillUtc(datum, klockslag).toISOString(),
          ends_at: nyttSlut,
        }));
        router.refresh();
      },
      "Tiden är sparad.",
    );
  }

  function vaxlaSynlighet() {
    const visa = !rad.published;
    kor(
      () => sattSynlighet(rad.id, visa),
      () => setRad((r) => ({ ...r, published: visa })),
      visa ? "Händelsen syns i kalendern." : "Händelsen är dold.",
    );
  }

  function taBort() {
    if (!window.confirm(`Ta bort "${rad.title}"? Det går inte att ångra.`)) return;
    kor(
      () => taBortHandelse(rad.id),
      () => router.refresh(),
    );
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
    <li
      aria-busy={pagar}
      style={{
        border: "1px solid var(--line)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--spacing-5)",
        marginTop: "var(--spacing-4)",
        background: pagar ? "var(--surface-alt)" : "transparent",
      }}
    >
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--spacing-3)" }}>
        <p style={{ margin: 0, flex: 1, color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
          {formateraNar(rad)} · {EVENEMANG_ETIKETT[rad.kind]}
          {!rad.published && " · dold"}
        </p>
        <button
          type="button"
          disabled={pagar}
          onClick={vaxlaSynlighet}
          style={{
            minHeight: "44px",
            padding: "0 var(--spacing-4)",
            fontSize: "var(--text-sm)",
            border: "1px solid",
            borderRadius: "var(--radius-md)",
            cursor: pagar ? "wait" : "pointer",
            background: rad.published ? "transparent" : "var(--ok)",
            color: rad.published ? "var(--ink-muted)" : "var(--paper)",
            borderColor: rad.published ? "var(--line)" : "var(--ok)",
          }}
        >
          {rad.published ? "Dölj" : "Visa"}
        </button>
        <button
          type="button"
          disabled={pagar}
          onClick={taBort}
          style={{
            minHeight: "44px",
            padding: "0 var(--spacing-4)",
            fontSize: "var(--text-sm)",
            background: "transparent",
            color: "var(--danger)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            cursor: pagar ? "wait" : "pointer",
          }}
        >
          Ta bort
        </button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-3)", marginTop: "var(--spacing-4)" }}>
        <label style={{ ...falt, flex: "1 1 14rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>Rubrik</span>
          <input
            defaultValue={rad.title}
            maxLength={200}
            onBlur={(e) => e.target.value !== rad.title && spara("title", e.target.value)}
            style={kontroll}
          />
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Typ</span>
          <select
            defaultValue={rad.kind}
            onChange={(e) => spara("kind", e.target.value)}
            style={kontroll}
          >
            {Object.entries(EVENEMANG_ETIKETT).map(([varde, etikett]) => (
              <option key={varde} value={varde}>
                {etikett}
              </option>
            ))}
          </select>
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Sektion</span>
          <select
            defaultValue={rad.section_slug ?? ""}
            onChange={(e) => spara("section_slug", e.target.value)}
            style={kontroll}
          >
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
      </div>

      <form
        action={sparaTider}
        style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "var(--spacing-3)", marginTop: "var(--spacing-3)" }}
      >
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Datum</span>
          <input name="datum" type="date" required defaultValue={tillLokaltDatum(rad.starts_at)} style={kontroll} />
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Klockslag</span>
          <input name="klockslag" type="time" required defaultValue={tillLokaltKlockslag(rad.starts_at)} style={kontroll} />
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Slutdatum (frivilligt)</span>
          <input name="slutdatum" type="date" defaultValue={rad.ends_at ? tillLokaltDatum(rad.ends_at) : ""} style={kontroll} />
        </label>
        <label style={falt}>
          <span style={{ color: "var(--ink-muted)" }}>Slut klockan</span>
          <input name="slutklockslag" type="time" defaultValue={rad.ends_at ? tillLokaltKlockslag(rad.ends_at) : ""} style={kontroll} />
        </label>
        <button
          type="submit"
          disabled={pagar}
          style={{
            minHeight: "44px",
            padding: "0 var(--spacing-4)",
            fontSize: "var(--text-sm)",
            background: "var(--surface)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            cursor: pagar ? "wait" : "pointer",
          }}
        >
          Spara tid
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-3)", marginTop: "var(--spacing-3)" }}>
        <label style={{ ...falt, flex: "1 1 12rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>Plats (frivilligt)</span>
          <input
            defaultValue={rad.place ?? ""}
            maxLength={200}
            onBlur={(e) => e.target.value !== (rad.place ?? "") && spara("place", e.target.value)}
            style={kontroll}
          />
        </label>
        <label style={{ ...falt, flex: "2 1 16rem" }}>
          <span style={{ color: "var(--ink-muted)" }}>Beskrivning (frivilligt)</span>
          <input
            defaultValue={rad.description ?? ""}
            maxLength={4000}
            onBlur={(e) => e.target.value !== (rad.description ?? "") && spara("description", e.target.value)}
            style={kontroll}
          />
        </label>
      </div>

      {besked && (
        <p
          role={besked.ok ? "status" : "alert"}
          style={{
            margin: "var(--spacing-3) 0 0",
            fontSize: "var(--text-sm)",
            color: besked.ok ? "var(--ok)" : "var(--danger)",
          }}
        >
          {besked.text}
        </p>
      )}
    </li>
  );
}
