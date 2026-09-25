"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { slugDisponible } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

function refrescar() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/servicios");
}

const esquema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ponele un nombre al servicio.").max(80),
  summary: z.string().trim().max(240).default(""),
  description: z.string().trim().max(4000).default(""),
  image_url: z.union([z.string().url(), z.literal("")]).default(""),
  asks_photos: z.boolean(),
  asks_measures: z.boolean(),
  asks_date: z.boolean(),
  showcase: z.enum(["none", "antes_despues", "eventos"]).default("none"),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean(),
});

export async function guardarServicio(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    summary: datos.get("summary") ?? "",
    description: datos.get("description") ?? "",
    image_url: datos.get("image_url") ?? "",
    asks_photos: datos.get("asks_photos") === "on",
    asks_measures: datos.get("asks_measures") === "on",
    asks_date: datos.get("asks_date") === "on",
    showcase: datos.get("showcase") ?? "none",
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();
  const fila = {
    ...campos,
    summary: campos.summary || null,
    description: campos.description || null,
    image_url: campos.image_url || null,
  };

  // La dirección se arma al crearlo y no cambia: así no se rompen los enlaces compartidos.
  const { data: guardado, error } = id
    ? await supabase.from("services").update(fila).eq("id", id).select("id").single()
    : await supabase
        .from("services")
        .insert({ ...fila, slug: await slugDisponible(supabase, "services", campos.name) })
        .select("id")
        .single();

  if (error || !guardado) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  refrescar();
  if (!id) redirect(`/admin/servicios/${guardado.id}?nuevo=1`);
  return { ok: true, mensaje: "Servicio guardado." };
}

export async function alternarServicio(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .update({ is_active: activo })
    .eq("id", id)
    .select("id");
  if (!data?.length) console.error("[servicios] no se pudo cambiar la visibilidad", id);

  refrescar();
}

export async function borrarServicio(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  // Los pedidos de presupuesto de este servicio quedan: guardan su nombre.
  const supabase = await createClient();
  const { data } = await supabase.from("services").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/servicios/${id}?error=borrar`);

  refrescar();
  redirect("/admin/servicios");
}
