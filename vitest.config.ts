import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/**
 * Bildimporter i Next ger ett StaticImageData-objekt; utanför Next finns
 * ingen som gör det jobbet. Stubben härmar formen så att moduler som
 * lib/bilder.ts kan enhetstestas — måtten är låtsade och får aldrig
 * testas, men src är filens riktiga sökväg så att unikhet kan bevisas.
 */
const bildstub = {
  name: "next-bildimport-stub",
  enforce: "pre" as const,
  load(id: string) {
    if (/\.(jpe?g|png|webp|avif|gif)$/.test(id)) {
      return `export default { src: ${JSON.stringify(id)}, width: 1, height: 1 };`;
    }
  },
};

export default defineConfig({
  plugins: [bildstub],
  test: {
    include: ["tests/enhet/**/*.test.ts"],
    environment: "node",
  },
  resolve: {
    alias: { "@": resolve(import.meta.dirname, ".") },
  },
});
