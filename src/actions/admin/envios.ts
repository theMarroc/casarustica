"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

function refrescar() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/ajustes");
}

const esquemaZona = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Poné el nombre de la zona.").max(60),
  // Vacío = a coordinar.
  cost: z.union([z.literal(""), z.coerce.number().min(0, "El costo no puede ser negativo.")]),
  sort_order: z.coerce.number().int().default(0),
});

export async function guardarZona(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaZona.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    cost: String(datos.get("cost") ?? "").trim(),
    sort_order: datos.get("sort_order") ?? 0,
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };

  const { id, cost, ...campos } = analisis.data;
  const fila = { ...campos, cost: cost === "" ? null : cost };
  const supabase = await createClient();

  const { data, error } = id
    ? await supabase.from("shipping_zones").update(fila).eq("id", id).select("id")
    : await supabase.from("shipping_zones").insert(fila).select("id");

  if (error) {
    return {
      ok: false,
      mensaje:
        error.code === "23505"
          ? "Ya hay una zona con ese nombre."
          : `No se pudo guardar: ${error.message}`,
    };
  }
  if (!data?.length) return { ok: false, mensaje: "No se pudo guardar. Recargá y probá de nuevo." };

  refrescar();
  return { ok: true, mensaje: "Zona guardada." };
}

export async function alternarZona(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("shipping_zones")
    .update({ is_active: activo })
    .eq("id", id)
    .select("id");
  if (!data?.length) console.error("[zonas] no se pudo cambiar la visibilidad", id);

  refrescar();
}

export async function borrarZona(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase.from("shipping_zones").delete().eq("id", id).select("id");
  if (!data?.length) console.error("[zonas] no se pudo borrar", id);

  refrescar();
}
