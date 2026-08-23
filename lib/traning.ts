import { supabase } from "./supabase";

export type Status = "aktiv" | "uppehall" | "installd";

export interface Pass {
  id: string;
  section_slug: string;
  grupp: string;
  age_from: number | null;
  age_to: number | null;
  weekday: number | null;
  starts_at: string | null;
  ends_at: string | null;
  place: string | null;
  status: Status;
  note: string | null;
  sort_order: number;
}

export interface Sektion {
  slug: string;
  heading: string | null;
  sort_order: number;
}

/** ISO-8601: 1 = måndag. Index 0 används aldrig. */
export const VECKODAGAR = [
  "",
  "Måndagar",
  "Tisdagar",
  "Onsdagar",
  "Torsdagar",
  "Fredagar",
  "Lördagar",
  "Söndagar",
] as const;

/**
 * Tidsintervall enligt röstreglerna i config/content.ts: punkt som avdelare
 * och kort tankstreck, alltså 19.00–20.00. Gamla sajten skrev bindestreck
 * och missade ibland mellanslaget helt.
 */
export function formateraTid(start: string | null, slut: string | null): string | null {
  if (!start || !slut) return null;
  const hhmm = (t: string) => t.slice(0, 5).replace(":", ".");
  return `${hhmm(start)}–${hhmm(slut)}`;
}

export function formateraAlder(from: number | null, to: number | null): string | null {
  if (from === null && to === null) return null;
  if (from !== null && to === null) return `från ${from} år`;
  if (from === null && to !== null) return `t.o.m. ${to} år`;
  return `${from}–${to} år`;
}

export async function hamtaSchema(season: string) {
  const [pass, sektioner] = await Promise.all([
    supabase
      .from("training_sessions")
      .select("*")
      .eq("season", season)
      .order("sort_order"),
    supabase.from("sections").select("slug, heading, sort_order").order("sort_order"),
  ]);

  if (pass.error) throw pass.error;
  if (sektioner.error) throw sektioner.error;

  return {
    pass: (pass.data ?? []) as Pass[],
    sektioner: (sektioner.data ?? []) as Sektion[],
  };
}
