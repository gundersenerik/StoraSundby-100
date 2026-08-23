/**
 * Genererar app/tokens.css ur config/design.ts.
 *
 * Designkontraktet säger att ingen komponent får skriva ett hex-värde, en
 * fontstorlek eller en marginal utanför skalan. Det håller bara om skalan
 * faktiskt finns som CSS-variabler. Den här filen är bron.
 *
 * app/tokens.css skrivs aldrig för hand. Kör `npm run gen:tokens` efter
 * varje ändring i design.ts. CI kontrollerar att den är i synk.
 *
 * TEMASTRATEGIN, och varför den ser ut som den gör:
 *
 * Sajten ska fungera i tre lägen, inte två — ljust valt, mörkt valt, och
 * systemstyrt när inget val gjorts. Därför definieras hela den ljusa
 * paletten på :root, och de mörka värdena redefinieras på två ställen:
 * i ett media-block guardat med :root:not([data-theme="light"]), och i
 * :root[data-theme="dark"].
 *
 * En färg vars enda definition ligger i ett av de blocken gäller aldrig i
 * det systemstyrda läget. Det är buggen kontraktet varnar för.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { design } from "../config/design";

const out: string[] = [
  "/*",
  " * GENERERAD FIL — redigera inte för hand.",
  " * Källa: config/design.ts. Kör `npm run gen:tokens` efter ändring.",
  " */",
  "",
];

const light = design.color.light;
const dark = design.color.dark;

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/* ── Ljus palett på :root ─────────────────────────────────────────────── */
out.push(":root {");
for (const [role, value] of Object.entries(light)) {
  out.push(`  --${kebab(role)}: ${value};`);
}
out.push(`  --measure: ${design.type.measure};`);
for (const [name, value] of Object.entries(design.type.lineHeight)) {
  out.push(`  --leading-${name}: ${value};`);
}
out.push("}", "");

/* ── Mörka värden, båda vägarna ───────────────────────────────────────── */
const darkVars = Object.entries(dark).map(([role, value]) => `    --${kebab(role)}: ${value};`);

out.push(
  "/* Systemstyrt läge: gäller om användaren inte aktivt valt ljust. */",
  "@media (prefers-color-scheme: dark) {",
  '  :root:not([data-theme="light"]) {',
  ...darkVars.map((l) => `  ${l}`),
  "  }",
  "}",
  "",
  "/* Aktivt valt mörkt läge. */",
  ':root[data-theme="dark"] {',
  ...darkVars,
  "}",
  "",
);

/* ── Tailwind-tema ────────────────────────────────────────────────────── */
out.push(
  "/*",
  " * Färgerna måste ligga i ett `inline`-block. Utan `inline` kopierar",
  " * Tailwind det ljusa värdet in i varje utility, och mörkt läge slutar",
  " * fungera — utilityn pekar då på en färg i stället för på rollen.",
  " */",
  "@theme inline {",
);
for (const role of Object.keys(light)) {
  out.push(`  --color-${kebab(role)}: var(--${kebab(role)});`);
}
out.push("}", "");

out.push(
  "/*",
  " * Resten är fasta värden och ligger i ett `static`-block.",
  " *",
  " * `static` är inte valfritt här. Tailwind slänger annars varje token som",
  " * den inte hittar användning för i källkoden, och en dynamisk referens av",
  " * typen var(--text-${steg}) går inte att upptäcka statiskt. Utan `static`",
  " * försvinner halva skalan ur bygget och felet syns först i webbläsaren.",
  " */",
  "@theme static {",
);
out.push(`  --font-display: ${design.type.family.display};`);
out.push(`  --font-body: ${design.type.family.body};`);
out.push("");
for (const [name, value] of Object.entries(design.type.scale)) {
  out.push(`  --text-${name}: ${value};`);
}
out.push("");
design.space.forEach((rem, i) => out.push(`  --spacing-${i}: ${rem}rem;`));
out.push("");
for (const [name, value] of Object.entries(design.radius)) {
  out.push(`  --radius-${name}: ${value};`);
}
out.push("");
for (const [name, value] of Object.entries(design.breakpoints)) {
  out.push(`  --breakpoint-${name}: ${value};`);
}
out.push("}", "");

/* ── Basregler som följer av a11y-kontraktet ──────────────────────────── */
out.push(
  "/* Följer av design.a11y. Krav, inte ambition. */",
  "@layer base {",
  "  body {",
  "    background: var(--paper);",
  "    color: var(--ink);",
  "    font-family: var(--font-body);",
  "  }",
  "",
  "  h1, h2, h3 {",
  "    font-family: var(--font-display);",
  "    line-height: var(--leading-tight);",
  "  }",
  "",
);

if (design.a11y.focusVisibleRequired) {
  out.push(
    "  :focus-visible {",
    "    outline: 2px solid var(--brand);",
    "    outline-offset: 2px;",
    "  }",
    "",
  );
}

if (design.a11y.respectReducedMotion) {
  out.push(
    "  @media (prefers-reduced-motion: reduce) {",
    "    *, *::before, *::after {",
    "      animation-duration: 0.01ms !important;",
    "      animation-iteration-count: 1 !important;",
    "      transition-duration: 0.01ms !important;",
    "      scroll-behavior: auto !important;",
    "    }",
    "  }",
    "",
  );
}

out.push("}", "");

const target = resolve(import.meta.dirname, "../app/tokens.css");
writeFileSync(target, out.join("\n"), "utf8");

const roles = Object.keys(light).length;
console.log(
  `tokens.css skriven: ${roles} färgroller i tre lägen, ` +
    `${Object.keys(design.type.scale).length} textsteg, ${design.space.length} spacingsteg.`,
);
