/**
 * Genererar docs/SWAP-LIST.md ur koden.
 *
 * Körs med `npm run swap-list`, och i CI. Listan kan därför aldrig hamna ur
 * synk med verkligheten: den härleds ur todo()-anropen i config, inte ur ett
 * dokument någon glömmer uppdatera.
 *
 * Exit-kod 1 om någon lanseringsblockerare finns kvar och --strict är satt.
 * Sätt --strict i pipelinen som deployar till produktion.
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { club } from "../config/club";
import { design } from "../config/design";
import { allPlaceholders, launchBlockers, type PlaceholderEntry } from "../config/placeholder";

// Importerna triggar alla todo()-anrop och fyller registret.
void club;
void design;

const strict = process.argv.includes("--strict");
const entries = allPlaceholders();
const blockers = launchBlockers();

const CONFIDENCE_LABEL: Record<PlaceholderEntry["confidence"], string> = {
  placeholder: "Påhittat värde",
  webbplats: "Från webbplatsen",
  härlett: "Härlett ur webbplatsen",
  extern: "Från extern källa",
};

function fmt(value: unknown): string {
  if (value === null) return "_(tomt)_";
  if (typeof value === "string") return `\`${value}\``;
  if (Array.isArray(value)) return `_(${value.length} poster)_`;
  if (typeof value === "object") return `\`${JSON.stringify(value)}\``;
  return `\`${String(value)}\``;
}

const now = new Date().toISOString().slice(0, 10);

const lines: string[] = [
  "# Vad som måste bytas ut",
  "",
  "> Genererad automatiskt av `npm run swap-list`. Redigera inte för hand.",
  `> Senast genererad: ${now}`,
  "",
  `**${blockers.length} poster blockerar lansering.** ` +
    `${entries.length - blockers.length} till bör bekräftas.`,
  "",
  "Varje post motsvarar ett `todo()`-anrop i `config/`. Byt värdet och ta bort",
  "`todo()`-wrappern, så försvinner posten härifrån automatiskt.",
  "",
];

if (blockers.length) {
  lines.push(
    "## Blockerar lansering",
    "",
    "Sajten får inte gå i produktion med dessa värden kvar.",
    "",
    "| Var | Nuvarande värde | Vad som behövs |",
    "|---|---|---|",
    ...blockers.map(
      (e) => `| \`${e.path}\` | ${fmt(e.value)} | ${e.note.replace(/\|/g, "\\|")} |`,
    ),
    "",
  );
}

const soft = entries.filter((e) => !e.blocksLaunch);
if (soft.length) {
  lines.push(
    "## Bör bekräftas",
    "",
    "Sajten fungerar med dessa värden, men de är inte bekräftade av klubben.",
    "",
    "| Var | Nuvarande värde | Ursprung | Vad som behövs |",
    "|---|---|---|---|",
    ...soft.map(
      (e) =>
        `| \`${e.path}\` | ${fmt(e.value)} | ${CONFIDENCE_LABEL[e.confidence]} | ` +
        `${e.note.replace(/\|/g, "\\|")} |`,
    ),
    "",
  );
}

lines.push(
  "## Så byter du ett värde",
  "",
  "```diff",
  "- orgNumber: todo(\"802XXX-XXXX\", {",
  "-   path: \"club.identity.orgNumber\",",
  "-   note: \"Hämtas från Skatteverket.\",",
  "-   blocksLaunch: true,",
  "- }),",
  "+ orgNumber: \"802461-1234\",",
  "```",
  "",
  "Kör sedan `npm run swap-list` igen. Posten är borta, och värdet slår igenom",
  "på alla ställen i sajten samtidigt.",
  "",
);

const out = resolve(import.meta.dirname, "../docs/SWAP-LIST.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, lines.join("\n"), "utf8");

console.log(`SWAP-LIST.md skriven: ${entries.length} poster, ${blockers.length} blockerar lansering.`);

if (strict && blockers.length) {
  console.error(
    `\nAvbryter: ${blockers.length} lanseringsblockerare kvar.\n` +
      blockers.map((e) => `  - ${e.path}: ${e.note.split(".")[0]}.`).join("\n"),
  );
  process.exit(1);
}
