"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/content";
import type { Nyhet } from "@/lib/nyheter";
import { formateraDatum, tillLokaltDatum } from "@/lib/tid";
import {
  sattPublicering,
  sparaNyhetsfalt,
  taBortNyhet,
  type NyhetsFalt,
} from "./actions";

const TAPPAT_SVAR =
  "Svaret från servern kom aldrig fram. Ladda om sidan och kontrollera om ändringen gick igenom.";

/**
 * En nyhet i kansliets lista: fälten sparas när de lämnas, som i
 * sektionsredigeraren. Publicering är en tydlig knapp — det är steget som
 * gör texten synlig för hela världen, och det ska kännas.
 */
export function Nyhetsrad({ nyhet }: { nyhet: Nyhet }) {
  const [rad, setRad] = useState(nyhet);
  const [besked, setBesked] = useState<{ ok: boolean; text: string } | null>(null);
  const [pagar, start] = useTransition();
  const router = useRouter();

  function spara(falt: NyhetsFalt, varde: string) {
    const innan = rad;
    setRad((r) => ({ ...r, [falt]: varde === "" ? null : varde }));
    setBesked(null);
    start(async () => {
      try {
        const svar = await sparaNyhetsfalt(rad.id, falt, varde);
        if (!svar.ok) {
          setRad(innan);
          setBesked({ ok: false, text: svar.meddelande ?? "Kunde inte spara." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  function vaxlaPublicering() {
    const publicera = rad.published_at === null;
    setBesked(null);
    start(async () => {
      try {
        const svar = await sattPublicering(rad.id, publicera);
        if (svar.ok) {
          setRad((r) => ({
            ...r,
            published_at: publicera ? new Date().toISOString() : null,
          }));
          setBesked({
            ok: true,
            text: publicera
              ? "Nyheten är publicerad och syns på sajten."
              : "Nyheten är avpublicerad och syns inte längre.",
          });
        } else {
          setBesked({ ok: false, text: svar.meddelande ?? "Något gick fel." });
        }
      } catch {
        setBesked({ ok: false, text: TAPPAT_SVAR });
      }
    });
  }

  function taBort() {
    if (!window.confirm(`Ta bort "${rad.title}"? Det går inte att ångra.`)) return;
    setBesked(null);
    start(async () => {
      try {
        const svar = await taBortNyhet(rad.id);
        if (svar.ok) {
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

  const publicerad = rad.published_at !== null;

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
      {/* Rubriken som synlig text, inte bara som värde i ett fält: en
          lista där utkasten bara går att skilja åt genom att läsa
          formulärfält går inte att skumma — och går inte heller att
          hitta med en textsökning, mänsklig eller automatisk. */}
      <h2 style={{ margin: 0, fontSize: "var(--text-lg)" }}>{rad.title}</h2>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--spacing-3)", marginTop: "var(--spacing-2)" }}>
        <p style={{ margin: 0, flex: 1, color: "var(--ink-muted)", fontSize: "var(--text-sm)" }}>
          {publicerad ? (
            <>
              Publicerad {formateraDatum(tillLokaltDatum(rad.published_at!))} ·{" "}
              <a href={`${routes.news}/${rad.slug}`}>visa på sajten</a>
            </>
          ) : (
            "Utkast — syns inte på sajten"
          )}
        </p>
        <button
          type="button"
          disabled={pagar}
          onClick={vaxlaPublicering}
          style={{
            minHeight: "44px",
            padding: "0 var(--spacing-4)",
            fontSize: "var(--text-sm)",
            border: "1px solid",
            borderRadius: "var(--radius-md)",
            cursor: pagar ? "wait" : "pointer",
            background: publicerad ? "transparent" : "var(--ok)",
            color: publicerad ? "var(--ink-muted)" : "var(--paper)",
            borderColor: publicerad ? "var(--line)" : "var(--ok)",
          }}
        >
          {publicerad ? "Avpublicera" : "Publicera"}
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

      <label style={etikett} htmlFor={`titel-${rad.id}`}>
        Rubrik
      </label>
      <input
        id={`titel-${rad.id}`}
        defaultValue={rad.title}
        maxLength={200}
        onBlur={(e) => e.target.value !== rad.title && spara("title", e.target.value)}
        style={kontroll}
      />

      <label style={etikett} htmlFor={`ingress-${rad.id}`}>
        Ingress — en eller två meningar. Syns i nyhetslistan och på startsidan.
      </label>
      <textarea
        id={`ingress-${rad.id}`}
        rows={2}
        maxLength={500}
        defaultValue={rad.lead ?? ""}
        onBlur={(e) => e.target.value !== (rad.lead ?? "") && spara("lead", e.target.value)}
        style={kontroll}
      />

      <label style={etikett} htmlFor={`text-${rad.id}`}>
        Text — tom rad mellan stycken
      </label>
      <textarea
        id={`text-${rad.id}`}
        rows={8}
        maxLength={20000}
        defaultValue={rad.body ?? ""}
        onBlur={(e) => e.target.value !== (rad.body ?? "") && spara("body", e.target.value)}
        style={{ ...kontroll, lineHeight: "var(--leading-normal)" }}
      />

      <label style={etikett} htmlFor={`avsandare-${rad.id}`}>
        Avsändare — till exempel Kansliet eller Fotbollssektionen. Kan lämnas tom.
      </label>
      <input
        id={`avsandare-${rad.id}`}
        defaultValue={rad.author ?? ""}
        maxLength={120}
        onBlur={(e) => e.target.value !== (rad.author ?? "") && spara("author", e.target.value)}
        style={kontroll}
      />

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
