"use client";

import { useState } from "react";
import {
  VECKODAGAR,
  formateraAlder,
  formateraTid,
  type Pass,
  type Sektion,
} from "@/lib/traning";

/**
 * Filtrerbar vy, inte löptext.
 *
 * Gamla sajten listade alla tider som brödtext på startsidan, så en förälder
 * som ville veta när sjuåringen tränar fick läsa hela listan. Här filtreras
 * det i stället — och filtren finns bara när de behövs.
 *
 * Ett pausat pass visas som pausat. Det får inte försvinna ur listan bara
 * för att det saknar tider.
 */
export function SchemaVy({ pass, sektioner }: { pass: Pass[]; sektioner: Sektion[] }) {
  const [sektion, setSektion] = useState<string>("alla");
  const [alder, setAlder] = useState<string>("");

  const medPass = sektioner.filter((s) => pass.some((p) => p.section_slug === s.slug));

  const alderTal = alder === "" ? null : Number(alder);

  const filtrerat = pass.filter((p) => {
    if (sektion !== "alla" && p.section_slug !== sektion) return false;
    if (alderTal === null || Number.isNaN(alderTal)) return true;
    // Pass utan angiven ålder gäller alla och filtreras aldrig bort.
    if (p.age_from === null && p.age_to === null) return true;
    if (p.age_from !== null && alderTal < p.age_from) return false;
    if (p.age_to !== null && alderTal > p.age_to) return false;
    return true;
  });

  const grupperat = medPass
    .map((s) => ({ sektion: s, rader: filtrerat.filter((p) => p.section_slug === s.slug) }))
    .filter((g) => g.rader.length > 0);

  const fal = {
    display: "inline-flex",
    flexDirection: "column" as const,
    gap: "var(--spacing-1)",
    fontSize: "var(--text-sm)",
  };

  const kontroll = {
    minHeight: "44px",
    padding: "var(--spacing-2) var(--spacing-3)",
    fontSize: "var(--text-base)",
    background: "var(--surface)",
    color: "var(--ink)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius-md)",
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--spacing-4)",
          margin: "var(--spacing-6) 0",
        }}
      >
        <label style={fal}>
          <span style={{ color: "var(--ink-muted)" }}>Sektion</span>
          <select value={sektion} onChange={(e) => setSektion(e.target.value)} style={kontroll}>
            <option value="alla">Alla sektioner</option>
            {medPass.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.heading ?? s.slug}
              </option>
            ))}
          </select>
        </label>

        <label style={fal}>
          <span style={{ color: "var(--ink-muted)" }}>Ålder</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={120}
            value={alder}
            placeholder="Alla åldrar"
            onChange={(e) => setAlder(e.target.value)}
            style={{ ...kontroll, width: "10rem" }}
          />
        </label>
      </div>

      {grupperat.length === 0 ? (
        <p style={{ color: "var(--ink-muted)" }}>
          Inga pass matchar. Prova en annan ålder eller välj alla sektioner.
        </p>
      ) : (
        grupperat.map(({ sektion: s, rader }) => (
          <section key={s.slug} style={{ marginBottom: "var(--spacing-7)" }}>
            <h2 style={{ fontSize: "var(--text-xl)" }}>{s.heading ?? s.slug}</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {rader.map((p) => {
                const pausat = p.status === "uppehall";
                const tid = formateraTid(p.starts_at, p.ends_at);
                const dag = p.weekday ? VECKODAGAR[p.weekday] : null;
                const alderText = formateraAlder(p.age_from, p.age_to);

                return (
                  <li
                    key={p.id}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "baseline",
                      gap: "var(--spacing-3)",
                      padding: "var(--spacing-3) 0",
                      borderBottom: "1px solid var(--line)",
                      opacity: pausat ? 0.65 : 1,
                    }}
                  >
                    <strong style={{ flex: "1 1 14rem" }}>
                      {p.grupp}
                      {alderText && (
                        <span
                          style={{
                            fontWeight: 400,
                            color: "var(--ink-muted)",
                            fontSize: "var(--text-sm)",
                          }}
                        >
                          {" "}
                          · {alderText}
                        </span>
                      )}
                    </strong>

                    <span>
                      {pausat ? (
                        <em
                          style={{
                            color: "var(--warn)",
                            fontStyle: "normal",
                            fontSize: "var(--text-sm)",
                          }}
                        >
                          Uppehåll
                        </em>
                      ) : (
                        <>
                          {dag} {tid}
                          {p.place && (
                            <span style={{ color: "var(--ink-muted)" }}> · {p.place}</span>
                          )}
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </>
  );
}
