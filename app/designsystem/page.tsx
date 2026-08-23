import type { Metadata } from "next";
import { design } from "@/config/design";

export const metadata: Metadata = {
  title: "Designsystem",
  robots: { index: false, follow: false },
};

/**
 * Visar hela skalan på ett ställe.
 *
 * Finns för att en avvikelse ska synas direkt: en färgroll som ser fel ut i
 * mörkt läge, ett textsteg som inte hänger ihop med de andra, en å/ä/ö som
 * renderar illa i displayfonten. Indexeras inte.
 *
 * Värdena läses ur design.ts. Sidan får aldrig skriva ett eget hex-värde.
 */
export default function Designsystem() {
  const roles = Object.keys(design.color.light) as Array<keyof typeof design.color.light>;

  return (
    <main style={{ padding: "var(--spacing-6)", maxWidth: "var(--measure)" }}>
      <h1>Designsystem</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        Genererad ur <code>config/design.ts</code>. Byt ett värde där och den
        här sidan följer med.
      </p>

      <h2 style={{ marginTop: "var(--spacing-7)" }}>Färgroller</h2>
      <p style={{ color: "var(--ink-muted)" }}>
        Komponenter refererar till rollen, aldrig till färgen. Växla systemets
        mörka läge för att se båda paletterna.
      </p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {roles.map((role) => (
          <li
            key={role}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-4)",
              padding: "var(--spacing-2) 0",
              borderBottom: "1px solid var(--line)",
            }}
          >
            <span
              style={{
                width: "var(--spacing-8)",
                height: "var(--spacing-8)",
                background: `var(--${role.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)})`,
                border: "1px solid var(--line)",
                borderRadius: "var(--radius-sm)",
              }}
            />
            <code>{role}</code>
          </li>
        ))}
      </ul>

      <h2 style={{ marginTop: "var(--spacing-7)" }}>Typografisk skala</h2>
      <p style={{ color: "var(--ink-muted)" }}>
        Kontrollera att å, ä och ö renderar rent i båda fonterna.
      </p>
      {(Object.keys(design.type.scale) as Array<keyof typeof design.type.scale>).map((step) => (
        <p key={step} style={{ fontSize: `var(--text-${step})`, margin: "var(--spacing-3) 0" }}>
          <span style={{ color: "var(--ink-muted)", fontSize: "var(--text-xs)" }}>{step} </span>
          Föreningen på Hammargärdets ängar — å, ä, ö
        </p>
      ))}

      <h2 style={{ marginTop: "var(--spacing-7)" }}>Spacingskala</h2>
      {design.space.map((rem, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
          <code style={{ fontSize: "var(--text-xs)", minWidth: "var(--spacing-9)" }}>
            {i} · {rem}rem
          </code>
          <div style={{ height: "var(--spacing-3)", width: `var(--spacing-${i})`, background: "var(--brand)" }} />
        </div>
      ))}

      <h2 style={{ marginTop: "var(--spacing-7)" }}>Tillgänglighetskrav</h2>
      <ul style={{ color: "var(--ink-muted)" }}>
        <li>Kontrast brödtext: minst {design.a11y.minContrastBody}:1</li>
        <li>Kontrast stor text: minst {design.a11y.minContrastLarge}:1</li>
        <li>Minsta träffyta: {design.a11y.minTouchTargetPx} px</li>
        <li>Synlig fokusmarkering: {design.a11y.focusVisibleRequired ? "krav" : "nej"}</li>
        <li>Respekterar reducerad rörelse: {design.a11y.respectReducedMotion ? "ja" : "nej"}</li>
      </ul>
    </main>
  );
}
