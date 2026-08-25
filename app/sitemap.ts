import type { MetadataRoute } from "next";
import { routes } from "@/config/content";
import { hamtaPublicerade } from "@/lib/nyheter-data";
import { bassadress } from "@/lib/strukturerad-data";
import { byggda, huvudmeny, sektionsmeny, sidfotsmeny } from "@/lib/navigation";

/**
 * Sitemap härledd ur menyn, som i sin tur är härledd ur sidkartan, plus de
 * publicerade nyheterna ur databasen.
 *
 * Bara byggda sidor och publicerat innehåll listas. En sitemap som pekar
 * på 404 är sämre än ingen sitemap — Google slutar lita på den. Utkast
 * finns inte här av samma skäl som de inte finns på sajten: RLS släpper
 * aldrig ut dem till läsklienten.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bas = bassadress();
  const nu = new Date();
  const nyheter = await hamtaPublicerade();

  return [
    { url: bas, lastModified: nu, changeFrequency: "weekly", priority: 1 },
    ...[...byggda(huvudmeny), ...byggda(sektionsmeny), ...byggda(sidfotsmeny)].map((post) => ({
      url: `${bas}${post.href}`,
      lastModified: nu,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...nyheter.map((nyhet) => ({
      url: `${bas}${routes.news}/${nyhet.slug}`,
      lastModified: new Date(nyhet.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
