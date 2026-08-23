/**
 * Kontrollerar att inget klubbfaktum och inget designvärde är hårdkodat
 * utanför config/.
 *
 * Kontraktet i config/club.ts och config/design.ts säger att en rättelse ska
 * slå igenom överallt samtidigt. Det håller bara så länge ingen komponent,
 * migration eller mejlmall skriver adressen, bankgirot eller ett hex-värde
 * själv. Det här scriptet är det som gör regeln bindande i stället för
 * välmenande.
 *
 * Nålarna härleds ur config, inte ur en lista här. Byter någon adressen i
 * club.ts letar scriptet efter den nya adressen nästa gång det körs.
 *
 * Undantag i enskilda fall: skriv `lint-hardcoded-ignore-next-line` i en
 * kommentar raden ovanför. Använd sparsamt och motivera i BESLUTSLOGG.md.
 *
 * Körs med `npm run lint:hardcoded`, och i CI. Exit-kod 1 vid träff.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, extname } from "node:path";
import { club } from "../config/club";
import { design } from "../config/design";

const ROOT = resolve(import.meta.dirname, "..");

/** Kataloger som aldrig granskas. config/ är undantaget per definition. */
const SKIP_DIRS = new Set([
  "config", "docs", "node_modules", ".git", ".next", "dist", "build", ".vercel",
]);

/** Prosa granskas inte. README och markdown får nämna adressen i klartext. */
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".css", ".sql"]);

/** Scriptet granskar inte sig självt. */
const SKIP_FILES = new Set(["scripts/lint-hardcoded.ts"]);

interface Needle {
  pattern: RegExp;
  label: string;
  use: string;
}

function literal(value: unknown, label: string, use: string): Needle[] {
  if (value === null || value === undefined || value === "") return [];
  const escaped = String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [{ pattern: new RegExp(escaped, "g"), label, use }];
}

const a = club.contact.address;

const needles: Needle[] = [
  ...literal(club.identity.legalName, "föreningens fullständiga namn", "club.identity.legalName"),
  ...literal(club.identity.shortName, "föreningens kortnamn", "club.identity.shortName"),
  ...literal(a.street, "gatuadressen", "club.contact.address.street"),
  ...literal(a.postalCode, "postnumret", "club.contact.address.postalCode"),
  ...literal(club.contact.email, "e-postadressen", "club.contact.email"),
  ...literal(club.payment.bankgiro, "bankgirot", "club.payment.bankgiro"),
  ...literal(club.payment.swishNumber, "Swish-numret", "club.payment.swishNumber"),
  ...literal(club.site.domain, "domänen", "club.site.domain"),
  ...literal(club.facility.padelBookingUrl, "Playtomic-länken", "club.facility.padelBookingUrl"),
  ...literal(club.shop.url, "webbshopens adress", "club.shop.url"),
  // Avgiftsbelopp fångas bara när de står som pengar, annars blir bruset för stort.
  {
    pattern: new RegExp(
      `\\b(${Object.values(club.membership.fees).map((f) => f.amount).join("|")})\\s?kr\\b`,
      "g",
    ),
    label: "en medlemsavgift",
    use: "club.membership.fees",
  },
  // Designkontraktet: inget hex-värde får skrivas utanför config/design.ts.
  {
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    label: "ett hex-färgvärde",
    use: "en roll i design.color, exponerad som CSS-variabel",
  },
];

void design; // importeras för att kontraktet ska följa med i typkontrollen

interface Hit {
  file: string;
  line: number;
  text: string;
  label: string;
  use: string;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!SKIP_DIRS.has(entry)) walk(full, out);
    } else if (EXTENSIONS.has(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

const hits: Hit[] = [];

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (SKIP_FILES.has(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (i > 0 && lines[i - 1].includes("lint-hardcoded-ignore-next-line")) return;

    for (const needle of needles) {
      needle.pattern.lastIndex = 0;
      if (needle.pattern.test(line)) {
        hits.push({ file: rel, line: i + 1, text: line.trim(), label: needle.label, use: needle.use });
        break;
      }
    }
  });
}

if (hits.length === 0) {
  console.log("lint:hardcoded — inget klubbfaktum eller designvärde hårdkodat utanför config/.");
  process.exit(0);
}

console.error(`\nlint:hardcoded — ${hits.length} träff${hits.length === 1 ? "" : "ar"}:\n`);
for (const hit of hits) {
  console.error(`  ${hit.file}:${hit.line}`);
  console.error(`    ${hit.text.slice(0, 100)}`);
  console.error(`    Här står ${hit.label} i klartext. Importera ${hit.use} i stället.\n`);
}
console.error("Ett klubbfaktum ska bo på ett ställe, annars slår en rättelse inte igenom.\n");
process.exit(1);
