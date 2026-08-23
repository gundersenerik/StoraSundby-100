/**
 * Hämtar hem den gamla Hemsida24-sajten innan den försvinner.
 *
 * Sajten är den enda primärkällan för föreningens innehåll, och den ligger
 * hos en leverantör vi inte styr över. Bilderna ligger på leverantörens CDN.
 * Den dagen någon säger upp abonnemanget är allt borta. Därför hämtas allt
 * hem först, och skrivs om sedan.
 *
 * Skriver till content/legacy/:
 *   html/     rå HTML per sida, exakt som den levererades
 *   text/     brödtexten extraherad, för omskrivningsarbetet
 *   bilder/   originalen, oförändrade
 *   inventering.json  strukturerad sammanställning
 *
 * Körs med `npm run inventory:legacy`. Idempotent — kan köras om.
 */

import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { legacyRedirects } from "../config/content";
import { club } from "../config/club";

const BASE = `https://${club.site.domain}`;
const OUT = resolve(import.meta.dirname, "../content/legacy");

const paths = ["/", ...Object.keys(legacyRedirects)];

interface PageReport {
  path: string;
  status: number;
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  h2Count: number;
  textLength: number;
  images: { src: string; alt: string | null }[];
  links: string[];
  telLinks: string[];
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));

function extractText(html: string): string {
  return decode(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .trim();
}

function attr(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"));
  return m ? decode(m[1]) : null;
}

const slug = (p: string) => (p === "/" ? "startsida" : p.replace(/^\//, "").replace(/\//g, "-"));

for (const dir of ["html", "text", "bilder"]) {
  mkdirSync(resolve(OUT, dir), { recursive: true });
}

const report: PageReport[] = [];
const allImages = new Map<string, string | null>();

for (const path of paths) {
  const url = BASE + path;
  const res = await fetch(url, { redirect: "follow" });
  const html = await res.text();
  const name = slug(path);

  writeFileSync(resolve(OUT, "html", `${name}.html`), html, "utf8");
  const text = extractText(html);
  writeFileSync(resolve(OUT, "text", `${name}.txt`), text, "utf8");

  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const images = imgTags
    .map((tag) => ({ src: attr(tag, "src") ?? "", alt: attr(tag, "alt") }))
    .filter((i) => i.src && !i.src.startsWith("data:"));

  for (const img of images) {
    const abs = new URL(img.src, url).href;
    if (!allImages.has(abs)) allImages.set(abs, img.alt);
  }

  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map((m) => decode(m[1]));

  report.push({
    path,
    status: res.status,
    title: html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].trim() ?? null,
    metaDescription: html.match(/<meta[^>]+name=["']description["'][^>]*>/i)
      ? attr(html.match(/<meta[^>]+name=["']description["'][^>]*>/i)![0], "content")
      : null,
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    h2Count: (html.match(/<h2\b/gi) ?? []).length,
    textLength: text.length,
    images: images.map((i) => ({ src: new URL(i.src, url).href, alt: i.alt })),
    links: [...new Set(hrefs.filter((h) => /^https?:/i.test(h)))],
    telLinks: [...new Set(hrefs.filter((h) => h.startsWith("tel:")))],
  });

  console.log(`${res.status}  ${path.padEnd(18)} ${String(text.length).padStart(6)} tecken  ${images.length} bilder`);
}

/* ── Bilderna. Originalen, oförändrade. ─────────────────────────────────── */
let saved = 0;
let failed = 0;

for (const [url, alt] of allImages) {
  const file = decodeURIComponent(new URL(url).pathname.split("/").pop() || "bild")
    .replace(/[^\w.\-]/g, "_")
    .slice(-80);
  const target = resolve(OUT, "bilder", file);
  if (existsSync(target)) { saved++; continue; }

  try {
    const res = await fetch(url);
    if (!res.ok) { failed++; continue; }
    writeFileSync(target, Buffer.from(await res.arrayBuffer()));
    saved++;
  } catch {
    failed++;
  }
  void alt;
}

/* ── Sammanställning ────────────────────────────────────────────────────── */
const utanAlt = [...allImages.values()].filter((a) => a === null || a.trim() === "").length;
const titlar = report.map((r) => r.title);

const summary = {
  hamtad: new Date().toISOString(),
  kalla: BASE,
  sidor: report.length,
  totaltAntalTecken: report.reduce((s, r) => s + r.textLength, 0),
  sidorUtanH1: report.filter((r) => r.h1Count === 0).length,
  sidorUtanMetaDescription: report.filter((r) => !r.metaDescription).length,
  dubbleradeTitlar: titlar.filter((t, i) => titlar.indexOf(t) !== i).length,
  unikaBilder: allImages.size,
  bilderUtanAltText: utanAlt,
  bilderSparade: saved,
  bilderMisslyckade: failed,
  osakraLankar: [...new Set(report.flatMap((r) => r.links).filter((l) => l.startsWith("http://")))],
  telefonlankar: [...new Set(report.flatMap((r) => r.telLinks))],
  sidor_detalj: report,
};

writeFileSync(resolve(OUT, "inventering.json"), JSON.stringify(summary, null, 2) + "\n", "utf8");

console.log(
  `\n${report.length} sidor, ${summary.totaltAntalTecken} tecken brödtext.\n` +
    `${allImages.size} unika bilder, ${saved} sparade, ${failed} misslyckade, ${utanAlt} utan alt-text.\n` +
    `${summary.sidorUtanH1} sidor saknar h1. ${summary.dubbleradeTitlar} dubblerade titlar.`,
);
