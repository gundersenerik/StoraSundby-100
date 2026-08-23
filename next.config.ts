import type { NextConfig } from "next";
import { legacyRedirects } from "./config/content";

/**
 * Redirects från den gamla Hemsida24-sajten.
 *
 * Kartan bor i config/content.ts, inte här.
 *
 * TVÅ SAKER SOM INTE ÄR UPPENBARA:
 *
 * 1. Källan måste vara procentkodad. Next matchar mot den kodade sökvägen,
 *    så `/läger` skrivet med å matchar aldrig en inkommande begäran — vare
 *    sig den skickas rå eller kodad. Redirecten hamnar i manifestet, ser
 *    korrekt ut, och gör ingenting. Exakt de två adresser prompten
 *    uttryckligen pekar ut, `/läger` och `/om-föreningen`, var de enda som
 *    var trasiga. Upptäckt av ett E2E-test, inte av bygget.
 *
 * 2. `statusCode: 301`, inte `permanent: true`. Det senare ger 308. För
 *    sökmotorer är de likvärdiga, men prompten säger 301 och gamla verktyg
 *    hanterar 301 mer förutsägbart. Ingen anledning att avvika.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(legacyRedirects)
      .filter(([from, to]) => from !== to)
      .map(([from, destination]) => ({
        source: encodeURI(from),
        destination,
        statusCode: 301 as const,
      }));
  },
};

export default nextConfig;
