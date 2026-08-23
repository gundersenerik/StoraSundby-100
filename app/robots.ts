import type { MetadataRoute } from "next";
import { bassadress } from "@/lib/strukturerad-data";

/**
 * Admin, inloggning och auth-callbacken ska aldrig indexeras.
 *
 * robots.txt är dock ingen säkerhetsspärr — den är en artighet mot
 * välartade robotar. Spärren är RLS. Sidorna har dessutom noindex i sin
 * metadata, vilket är det som faktiskt håller dem ur sökresultaten.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/logga-in", "/auth/", "/designsystem"],
    },
    sitemap: `${bassadress()}/sitemap.xml`,
  };
}
