import type { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/** Genera un slug libre, agregando un número si ya existe. */
export async function slugDisponible(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tabla: "products" | "combos" | "categories" | "events",
  base: string,
  idActual?: string,
) {
  const raiz = slugify(base) || "item";
  let candidato = raiz;
  let intento = 2;

  for (;;) {
    const { data } = await supabase
      .from(tabla)
      .select("id")
      .eq("slug", candidato)
      .maybeSingle();

    if (!data || data.id === idActual) return candidato;
    candidato = `${raiz}-${intento}`;
    intento += 1;
  }
}
