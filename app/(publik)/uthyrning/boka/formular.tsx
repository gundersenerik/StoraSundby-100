"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { skickaForfragan, type ForfraganResultat } from "./actions";

/**
 * Bokningsformuläret.
 *
 * Uppskattat pris visas innan avsändning — men bara när priserna finns på
 * riktigt. Sidan skickar `priser: null` så länge beloppen i config är
 * platshållare, och då säger formuläret ärligt att kansliet återkommer
 * med pris i stället för att visa en påhittad summa.
 */

export interface Prisprops {
  perNattStuga: number;
  perNattHela: number;
  stadavgift: number;
}

export interface Stugval {
  id: string;
  namn: string;
  dogFriendly: boolean | null;
}

const START: ForfraganResultat = { status: "vilar" };

export function Formular({
  stugor,
  helaAnlaggningenId,
  priser,
  minNatter,
}: {
  stugor: Stugval[];
  helaAnlaggningenId: string;
  priser: Prisprops | null;
  minNatter: number;
}) {
  const [resultat, skicka, skickar] = useActionState(skickaForfragan, START);
  const [objekt, setObjekt] = useState(stugor[0]?.id ?? helaAnlaggningenId);
  // Fryses vid montering. Skrivs värdet om vid varje rendering — som
  // value={Date.now()} gör — nollställs tidsspärren varje gång gästen
  // rättar ett fält, och den som rättar ett valideringsfel inom tre
  // sekunder kastas tyst som robot. Granskningen hittade exakt det felet.
  const [renderadKl] = useState(() => Date.now());
  const [fran, setFran] = useState("");
  const [till, setTill] = useState("");

  const uppskattning = useMemo(() => {
    if (!priser || !fran || !till || till <= fran) return null;
    const natter = Math.round(
      (Date.parse(`${till}T12:00:00Z`) - Date.parse(`${fran}T12:00:00Z`)) / 86_400_000,
    );
    if (natter < minNatter) return null;
    const perNatt = objekt === helaAnlaggningenId ? priser.perNattHela : priser.perNattStuga;
    return { natter, totalt: perNatt * natter + priser.stadavgift };
  }, [priser, fran, till, objekt, helaAnlaggningenId, minNatter]);

  if (resultat.status === "skickad") {
    return (
      <div
        role="status"
        style={{
          border: "1px solid var(--line)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--spacing-5)",
          maxWidth: "var(--measure)",
        }}
      >
        <h2 style={{ marginTop: 0, color: "var(--ok)" }}>Förfrågan skickad</h2>
        <p>
          Tack! Kansliet tittar på den och hör av sig så snart de kan —
          kansliet sköts ideellt, så ha lite tålamod med svaret.
          {resultat.mejlSkickat
            ? " En kvittens har mejlats till dig."
            : " Ingen kvittens mejlas ännu, men förfrågan är framme."}
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link href="/uthyrning">Tillbaka till uthyrningen</Link>
        </p>
      </div>
    );
  }

  const falt: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-1)",
  };

  const etikett: React.CSSProperties = {
    fontSize: "var(--text-sm)",
    color: "var(--ink-muted)",
  };

  const kontroll: React.CSSProperties = {
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  return (
    <form action={skicka} style={{ display: "grid", gap: "var(--spacing-4)", maxWidth: "34rem" }}>
      {/* Honeypot: dolt för människor, lockande för robotar. */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
        <label>
          Webbplats
          <input name="webbplats" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="renderadKl" value={renderadKl} />

      <label style={falt}>
        <span style={etikett}>Vad vill ni hyra?</span>
        <select name="objekt" value={objekt} onChange={(e) => setObjekt(e.target.value)} style={kontroll}>
          {stugor.map((stuga) => (
            <option key={stuga.id} value={stuga.id}>
              {stuga.namn}
              {stuga.dogFriendly === true ? " (hund välkommen)" : ""}
            </option>
          ))}
          <option value={helaAnlaggningenId}>Hela anläggningen (till exempel läger)</option>
        </select>
      </label>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-4)" }}>
        <label style={{ ...falt, flex: "1 1 10rem" }}>
          <span style={etikett}>Ankomst</span>
          <input name="fran" type="date" required value={fran} onChange={(e) => setFran(e.target.value)} style={kontroll} />
        </label>
        <label style={{ ...falt, flex: "1 1 10rem" }}>
          <span style={etikett}>Avresa</span>
          <input name="till" type="date" required value={till} onChange={(e) => setTill(e.target.value)} style={kontroll} />
        </label>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-4)" }}>
        <label style={{ ...falt, flex: "1 1 8rem" }}>
          <span style={etikett}>Antal personer</span>
          <input name="antal" type="number" inputMode="numeric" min={1} max={200} required style={kontroll} />
        </label>
        <label style={{ ...falt, flex: "1 1 12rem" }}>
          <span style={etikett}>Vad gäller det?</span>
          <select name="andamal" defaultValue="overnattning" style={kontroll}>
            <option value="overnattning">Övernattning</option>
            <option value="fest">Fest</option>
            <option value="lager">Läger</option>
            <option value="annat">Annat</option>
          </select>
        </label>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", minHeight: "44px" }}>
        <input name="hund" type="checkbox" value="ja" style={{ width: "1.25rem", height: "1.25rem" }} />
        Vi har hund med
      </label>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-4)" }}>
        <label style={{ ...falt, flex: "1 1 12rem" }}>
          <span style={etikett}>Namn</span>
          <input name="namn" type="text" required autoComplete="name" style={kontroll} />
        </label>
        <label style={{ ...falt, flex: "1 1 12rem" }}>
          <span style={etikett}>E-postadress</span>
          <input name="epost" type="email" required autoComplete="email" style={kontroll} />
        </label>
      </div>

      <label style={falt}>
        <span style={etikett}>Telefon (frivilligt)</span>
        <input name="telefon" type="tel" autoComplete="tel" style={{ ...kontroll, maxWidth: "14rem" }} />
      </label>

      <label style={falt}>
        <span style={etikett}>Meddelande (frivilligt)</span>
        <textarea
          name="meddelande"
          rows={4}
          style={{ ...kontroll, minHeight: "6rem", resize: "vertical" }}
          placeholder="Berätta gärna vad ni planerar — läger, fest, självhushåll eller mat."
        />
      </label>

      {uppskattning ? (
        <p
          role="status"
          style={{
            margin: 0,
            background: "var(--surface-alt)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius-md)",
            padding: "var(--spacing-3) var(--spacing-4)",
            fontSize: "var(--text-sm)",
          }}
        >
          Uppskattat pris för {uppskattning.natter}{" "}
          {uppskattning.natter === 1 ? "natt" : "nätter"}:{" "}
          <strong style={{ fontVariantNumeric: "tabular-nums" }}>{uppskattning.totalt} kr</strong>{" "}
          inklusive slutstädning. Kansliet bekräftar priset innan bokningen
          blir bindande.
        </p>
      ) : (
        !priser && (
          <p style={{ margin: 0, color: "var(--ink-muted)", fontSize: "var(--text-sm)", maxWidth: "var(--measure)" }}>
            Kansliet återkommer med pris i bekräftelsen — ingenting blir
            bindande innan dess.
          </p>
        )
      )}

      {resultat.status === "fel" && (
        <p role="alert" style={{ margin: 0, color: "var(--danger)", fontSize: "var(--text-sm)" }}>
          {resultat.meddelande}
        </p>
      )}

      <button
        type="submit"
        disabled={skickar}
        style={{
          minHeight: "44px",
          padding: "0 var(--spacing-5)",
          justifySelf: "start",
          background: "var(--brand)",
          color: "var(--brand-ink)",
          border: "none",
          borderRadius: "var(--radius-pill)",
          fontSize: "var(--text-base)",
          fontWeight: 600,
          cursor: skickar ? "wait" : "pointer",
        }}
      >
        {skickar ? "Skickar …" : "Skicka förfrågan"}
      </button>
    </form>
  );
}
