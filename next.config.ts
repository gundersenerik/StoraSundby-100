import type { NextConfig } from "next";
import { legacyRedirects } from "./config/content";

/**
 * Redirects från den gamla Hemsida24-sajten.
 *
 * Kartan bor i config/content.ts, inte här. Ingen gammal URL får sluta
 * fungera vid växlingen — inklusive /läger och /om-föreningen, som är
 * procentkodade i praktiken men skrivs med å och ä i källan.
 */
const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(legacyRedirects)
      .filter(([from, to]) => from !== to)
      .map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default nextConfig;
