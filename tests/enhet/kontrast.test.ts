import { describe, expect, it } from "vitest";
import { design } from "@/config/design";

/**
 * WCAG-kontrast för färgrollerna, räknad direkt ur kontraktet.
 *
 * Axe i E2E mäter det som faktiskt renderas, men bara på de sidor och i de
 * tillstånd testet besöker. Det här testet stänger resten: varje roll som
 * någonstans i koden används som text prövas mot varje yta den kan hamna
 * på, i båda teman. Byts ett värde i design.ts utan att kombinationerna
 * håller failar bygget — innan någon skärmläsare eller axe hunnit titta.
 *
 * Kravnivåerna kommer ur design.a11y, inte ur testet.
 */

function lineariserad(kanal: number): number {
  const c = kanal / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminans(hex: string): number {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) throw new Error(`Inte en hex-färg: ${hex}`);
  const [r, g, b] = [m[1], m[2], m[3]].map((h) => lineariserad(parseInt(h, 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function kontrast(a: string, b: string): number {
  const [ljus, mork] = [luminans(a), luminans(b)].sort((x, y) => y - x);
  return (ljus + 0.05) / (mork + 0.05);
}

const KRAV = design.a11y.minContrastBody;

/**
 * Text → ytor. Varje par speglar en faktisk användning:
 * - ink/inkMuted är brödtext på alla tre ytorna
 * - brand är länk, aktiv menypost och fokusring på paper/surface/surfaceAlt
 * - ok/warn/danger är statustext på paper och surface, och på surfaceAlt:
 *   Uppehåll-badgen står på tabellhuvudets yta, och admin-rader byter
 *   bakgrund till surfaceAlt under sparning med statustexten kvar
 * - brandInk står på brand (knappar), paper står på ok/warn/danger (badges)
 * Linjefärgen är undantagen: den bär aldrig text, och i mörkt läge är den
 * en alfaton som inte har en entydig luminans utan sin bakgrund.
 */
const TEXTROLLER = ["ink", "inkMuted", "brand", "ok", "warn", "danger"] as const;
const YTOR: Record<(typeof TEXTROLLER)[number], Array<"paper" | "surface" | "surfaceAlt">> = {
  ink: ["paper", "surface", "surfaceAlt"],
  inkMuted: ["paper", "surface", "surfaceAlt"],
  brand: ["paper", "surface", "surfaceAlt"],
  ok: ["paper", "surface", "surfaceAlt"],
  warn: ["paper", "surface", "surfaceAlt"],
  danger: ["paper", "surface", "surfaceAlt"],
};

for (const tema of ["light", "dark"] as const) {
  const palett = design.color[tema];

  describe(`kontrast i ${tema === "light" ? "ljust" : "mörkt"} läge`, () => {
    for (const roll of TEXTROLLER) {
      for (const yta of YTOR[roll]) {
        it(`${roll} på ${yta} klarar ${KRAV}:1`, () => {
          expect(kontrast(palett[roll], palett[yta])).toBeGreaterThanOrEqual(KRAV);
        });
      }
    }

    it(`brandInk på brand klarar ${KRAV}:1 (primärknappen)`, () => {
      expect(kontrast(palett.brandInk, palett.brand)).toBeGreaterThanOrEqual(KRAV);
    });

    for (const status of ["ok", "warn", "danger"] as const) {
      it(`paper på ${status} klarar ${KRAV}:1 (statusknappar med fylld bakgrund)`, () => {
        expect(kontrast(palett.paper, palett[status])).toBeGreaterThanOrEqual(KRAV);
      });
    }

    it(`accent håller ${KRAV}:1 mot paper — preliminär cobalt, men aldrig oläslig`, () => {
      expect(kontrast(palett.accent, palett.paper)).toBeGreaterThanOrEqual(KRAV);
    });
  });
}
