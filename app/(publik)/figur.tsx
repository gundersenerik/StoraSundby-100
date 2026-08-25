import Image from "next/image";
import type { Foreningsbild } from "@/lib/bilder";

/**
 * Ett foto i löpande innehåll: figure + next/image + eventuell bildtext.
 *
 * Statiska importer ger width/height och automatisk blur-platshållare, så
 * layouten flyttar sig aldrig när bilden laddas. `preload` sätts på högst
 * EN bild per sida — den som ligger i första skärmen. Lazy loading på en
 * bild ovanför vecket är ett dokumenterat LCP-fel (web.dev), och fler än
 * en preload konkurrerar med viktigare resurser.
 */
export function Figur({ foto, preload = false }: { foto: Foreningsbild; preload?: boolean }) {
  return (
    <figure style={{ margin: "var(--spacing-6) 0" }}>
      <Image
        src={foto.bild}
        alt={foto.alt}
        preload={preload}
        placeholder="blur"
        sizes="(max-width: 768px) 100vw, 46rem"
        style={{
          width: "100%",
          // Aldrig bredare än källan: CSS skalar annars upp små arkivbilder
          // (584-603 px) till containerns 720 och gör dem synligt mjuka.
          maxWidth: `${foto.bild.width}px`,
          height: "auto",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--line)",
        }}
      />
      {foto.bildtext && (
        <figcaption
          style={{
            marginTop: "var(--spacing-2)",
            fontSize: "var(--text-sm)",
            color: "var(--ink-muted)",
            maxWidth: "var(--measure)",
          }}
        >
          {foto.bildtext}
        </figcaption>
      )}
    </figure>
  );
}
