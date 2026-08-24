import { fullbokadeDagar, kalendermanad, type UpptagenPeriod } from "@/lib/uthyrning";

/**
 * Tillgänglighetskalendern: tre månader framåt, en tabell per månad.
 *
 * Ingen ska behöva mejla för att få veta om en helg är ledig. En dag
 * markeras som fullbokad först när allting är upptaget — enstaka bokade
 * stugor syns inte per dag, eftersom vilken stuga man får ändå avgörs av
 * kansliet vid bekräftelsen.
 *
 * Ren HTML-tabell utan JavaScript: läsbar med skärmläsare (statusen står
 * som text i varje cell, inte bara som färg) och navigerbar med tangentbord
 * eftersom ingenting kräver fokus.
 */

const VECKODAGSRUBRIKER = ["mån", "tis", "ons", "tor", "fre", "lör", "sön"];

export function Kalender({
  perioder,
  antalStugor,
  manader = 3,
}: {
  perioder: UpptagenPeriod[];
  antalStugor: number;
  manader?: number;
}) {
  const fullbokade = fullbokadeDagar(perioder, antalStugor);
  const nu = new Date();

  const start = manadslista(nu.getUTCFullYear(), nu.getUTCMonth() + 1, manader);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))",
        gap: "var(--spacing-5)",
      }}
    >
      {start.map(({ ar, manad }) => {
        const { rubrik, veckor } = kalendermanad(ar, manad);
        return (
          <table
            key={`${ar}-${manad}`}
            style={{ borderCollapse: "collapse", width: "100%", textAlign: "center" }}
          >
            <caption
              style={{
                fontWeight: 600,
                marginBottom: "var(--spacing-2)",
                textTransform: "capitalize",
              }}
            >
              {rubrik}
            </caption>
            <thead>
              <tr>
                {VECKODAGSRUBRIKER.map((dag) => (
                  <th
                    key={dag}
                    scope="col"
                    style={{
                      fontWeight: 400,
                      fontSize: "var(--text-xs)",
                      color: "var(--ink-muted)",
                      paddingBottom: "var(--spacing-1)",
                    }}
                  >
                    {dag}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {veckor.map((vecka, i) => (
                <tr key={i}>
                  {vecka.map((dag, j) => {
                    if (!dag) return <td key={j} />;
                    const upptagen = fullbokade.has(dag);
                    return (
                      <td
                        key={j}
                        style={{
                          border: "1px solid var(--line)",
                          padding: "var(--spacing-1)",
                          fontVariantNumeric: "tabular-nums",
                          background: upptagen ? "var(--surface-alt)" : "var(--surface)",
                          color: upptagen ? "var(--ink-muted)" : "var(--ink)",
                          textDecoration: upptagen ? "line-through" : "none",
                        }}
                      >
                        {Number(dag.slice(8, 10))}
                        <span style={{ position: "absolute", left: "-9999px" }}>
                          {upptagen ? " fullbokat" : " ledigt"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        );
      })}
      <p
        style={{
          gridColumn: "1 / -1",
          margin: 0,
          fontSize: "var(--text-sm)",
          color: "var(--ink-muted)",
          maxWidth: "var(--measure)",
        }}
      >
        Överstrukna dagar är fullbokade. Övriga dagar finns minst en stuga
        ledig — kansliet bekräftar alltid innan en bokning blir bindande.
      </p>
    </div>
  );
}

function manadslista(ar: number, manad: number, antal: number) {
  return Array.from({ length: antal }, (_, i) => {
    const m = manad + i;
    return { ar: ar + Math.floor((m - 1) / 12), manad: ((m - 1) % 12) + 1 };
  });
}
