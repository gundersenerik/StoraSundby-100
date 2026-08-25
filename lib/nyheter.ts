/**
 * Nyheter: typer och ren logik, utan databas. Dataåtkomsten bor i
 * nyheter-data.ts, samma delning som träning och uthyrning.
 */

export interface Nyhet {
  id: string;
  slug: string;
  title: string;
  lead: string | null;
  body: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Slug ur titel, alltid ascii. Redirects-fällan i CLAUDE.md kom av å och ä
 * i URL:er — nya URL:er får aldrig innehålla dem. NFD-normalisering plockar
 * bort diakriterna (å→a, ä→a, ö→o, é→e), resten blir bindestreck.
 */
export function slugga(titel: string): string {
  return titel
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "");
}

/**
 * Beskrivning för listor och meta description: ingressen om den finns,
 * annars brödtextens början. Klipps på ordgräns så ingen mening slutar
 * mitt i ett ord med tre punkter efter halva.
 */
export function beskrivning(nyhet: Pick<Nyhet, "lead" | "body">, max = 160): string {
  const text = (nyhet.lead ?? nyhet.body ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const klippt = text.slice(0, max);
  const sistaMellanslag = klippt.lastIndexOf(" ");
  return `${klippt.slice(0, sistaMellanslag > 0 ? sistaMellanslag : max)} …`;
}

/** Brödtext till stycken: tomrad avgränsar, ensamma radbrytningar behålls inte. */
export function stycken(body: string | null): string[] {
  if (!body) return [];
  return body
    .split(/\n\s*\n/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length > 0);
}
