/**
 * Placeholder-registret.
 *
 * Varje uppgift vi ännu inte har fått bekräftad från klubben wrappas i `todo()`.
 * Värdet fungerar precis som ett vanligt värde i koden, men registreras samtidigt
 * i ett register som `npm run swap-list` läser för att generera SWAP-LIST.md.
 *
 * Det betyder att listan över "vad måste bytas ut" aldrig kan bli inaktuell:
 * den härleds ur koden, inte ur ett dokument någon glömmer uppdatera.
 *
 * Regel: byt aldrig ut ett värde utan att ta bort todo()-wrappern.
 * Regel: hitta aldrig på ett värde utan att wrappa det i todo().
 */

export type Confidence =
  | "placeholder" // Påhittat. Måste bytas innan lansering.
  | "webbplats"   // Hämtat från storasundbygoif.com. Behandlas som sant.
  | "härlett"     // Uträknat ur en uppgift på webbplatsen. Bör bekräftas.
  | "extern";     // Från annan källa än webbplatsen. Bekräftas innan publicering.

export interface PlaceholderEntry {
  path: string;
  value: unknown;
  confidence: Confidence;
  note: string;
  source?: string;
  blocksLaunch: boolean;
}

const registry = new Map<string, PlaceholderEntry>();

/**
 * Registrerar ett värde som behöver bytas ut eller bekräftas.
 *
 * @example
 *   orgNumber: todo("802XXX-XXXX", {
 *     path: "club.legal.orgNumber",
 *     note: "Hämtas från Skatteverket. Krävs för Swish Handel och bidragsansökningar.",
 *     blocksLaunch: true,
 *   })
 */
export function todo<T>(
  value: T,
  meta: {
    path: string;
    note: string;
    confidence?: Confidence;
    source?: string;
    blocksLaunch?: boolean;
  },
): T {
  registry.set(meta.path, {
    path: meta.path,
    value,
    confidence: meta.confidence ?? "placeholder",
    note: meta.note,
    source: meta.source,
    blocksLaunch: meta.blocksLaunch ?? false,
  });
  return value;
}

/** Allt som registrerats. Läses av scripts/swap-list.ts. */
export function allPlaceholders(): PlaceholderEntry[] {
  return [...registry.values()].sort((a, b) => {
    if (a.blocksLaunch !== b.blocksLaunch) return a.blocksLaunch ? -1 : 1;
    return a.path.localeCompare(b.path, "sv");
  });
}

/** Antal poster som blockerar lansering. Används av lanseringskontrollen. */
export function launchBlockers(): PlaceholderEntry[] {
  return allPlaceholders().filter((e) => e.blocksLaunch);
}
