import type { MetadataRoute } from "next";
import { bassadress } from "@/lib/strukturerad-data";
import { byggda, huvudmeny, sidfotsmeny } from "@/lib/navigation";

/**
 * Sitemap härledd ur menyn, som i sin tur är härledd ur sidkartan.
 *
 * Bara byggda sidor listas. En sitemap som pekar på 404 är sämre än ingen
 * sitemap — Google slutar lita på den.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const bas = bassadress();
  const nu = new Date();

  return [
    { url: bas, lastModified: nu, changeFrequency: "weekly", priority: 1 },
    ...[...byggda(huvudmeny), ...byggda(sidfotsmeny)].map((post) => ({
      url: `${bas}${post.href}`,
      lastModified: nu,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
