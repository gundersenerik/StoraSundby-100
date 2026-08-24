"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export type SektionsFalt = "heading" | "intro" | "body" | "published";

export async function sparaSektion(
  slug: string,
  falt: SektionsFalt,
  varde: string | boolean,
) {
  const supabase = await supabaseServer();

  const { data, error } = await supabase
    .from("sections")
    .update({ [falt]: varde === "" ? null : varde })
    .eq("slug", slug)
    .select("slug");

  if (error) return { ok: false, meddelande: "Kunde inte spara." };
  if (!data?.length) return { ok: false, meddelande: "Du har inte behörighet." };

  revalidatePath("/admin/innehall");
  revalidatePath(`/${slug}`);
  revalidatePath("/");
  return { ok: true };
}
