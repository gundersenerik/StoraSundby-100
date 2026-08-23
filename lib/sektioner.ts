import { club } from "@/config/club";
import { supabase } from "./supabase";
import type { Pass, Sektion } from "./traning";

export interface SektionsInnehall extends Sektion {
  intro: string | null;
  body: string | null;
  hero_image: string | null;
}

/** Klubbfaktumet om sektionen: namn, kontaktperson, aktiv. Bor i club.ts. */
export function sektionsFakta(slug: string) {
  return club.sections.find((s) => s.slug === slug) ?? null;
}

export async function hamtaSektion(slug: string) {
  const [innehall, pass] = await Promise.all([
    supabase
      .from("sections")
      .select("slug, heading, sort_order, intro, body, hero_image")
      .eq("slug", slug)
      .maybeSingle(),
    supabase
      .from("training_sessions")
      .select("*")
      .eq("section_slug", slug)
      .order("sort_order"),
  ]);

  if (innehall.error) throw innehall.error;

  return {
    innehall: (innehall.data ?? null) as SektionsInnehall | null,
    pass: (pass.data ?? []) as Pass[],
  };
}

export async function publiceradeSektioner() {
  const { data, error } = await supabase
    .from("sections")
    .select("slug, heading, sort_order, intro, body, hero_image")
    .order("sort_order");

  if (error) throw error;
  return (data ?? []) as SektionsInnehall[];
}
