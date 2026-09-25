"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { slugDisponible } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";
import { desdeHoraLocal } from "@/lib/talleres";
import { ESTADOS_ESPERA, type EstadoAdmin, type EstadoEspera } from "@/lib/types";

function refrescar() {
  // El contador de la lista de espera vive en el menú del panel.
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

const opcional = z.string().trim().max(4000).default("");

const esquemaTaller = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "Ponele un nombre al taller.").max(100),
  kind: z.enum(["taller", "profesorado"]),
  summary: z.string().trim().max(240).default(""),
  description: opcional,
  duration: z.string().trim().max(120).default(""),
  includes_materials: z.boolean(),
  materials_note: z.string().trim().max(300).default(""),
  image_url: z.union([z.string().url(), z.literal("")]).default(""),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean(),
});

export async function guardarTaller(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaTaller.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    kind: datos.get("kind") ?? "taller",
    summary: datos.get("summary") ?? "",
    description: datos.get("description") ?? "",
    duration: datos.get("duration") ?? "",
    includes_materials: datos.get("includes_materials") === "on",
    materials_note: datos.get("materials_note") ?? "",
    image_url: datos.get("image_url") ?? "",
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };

  const { id, ...campos } = analisis.data;
  const fila = {
    ...campos,
    summary: campos.summary || null,
    description: campos.description || null,
    duration: campos.duration || null,
    materials_note: campos.materials_note || null,
    image_url: campos.image_url || null,
  };

  // La dirección se arma al crearlo y no cambia: así no se rompen los enlaces compartidos.
  const supabase = await createClient();
  const { data: guardado, error } = id
    ? await supabase.from("workshops").update(fila).eq("id", id).select("id").single()
    : await supabase
        .from("workshops")
        .insert({ ...fila, slug: await slugDisponible(supabase, "workshops", campos.name) })
        .select("id")
        .single();

  if (error || !guardado) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  refrescar();
  if (!id) redirect(`/admin/talleres/${guardado.id}?nuevo=1`);
  return { ok: true, mensaje: "Taller guardado." };
}

export async function alternarTaller(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("workshops")
    .update({ is_active: activo })
    .eq("id", id)
    .select("id");
  if (!data?.length) console.error("[talleres] no se pudo cambiar la visibilidad", id);

  refrescar();
}

/** Cuenta las inscripciones no canceladas de un conjunto de fechas. */
async function inscripcionesVigentes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  fechas: string[],
) {
  if (fechas.length === 0) return 0;
  const { data } = await supabase
    .from("order_items")
    .select("id, order:orders!inner(status)")
    .in("session_id", fechas)
    .neq("order.status", "cancelado");
  return data?.length ?? 0;
}

export async function borrarTaller(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: fechas } = await supabase.from("workshop_sessions").select("id").eq("workshop_id", id);
  if ((await inscripcionesVigentes(supabase, (fechas ?? []).map((f) => f.id))) > 0) {
    redirect(`/admin/talleres/${id}?error=inscriptos`);
  }

  const { data } = await supabase.from("workshops").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/talleres/${id}?error=borrar`);

  refrescar();
  redirect("/admin/talleres");
}

/* --- Fechas ------------------------------------------------------------- */

const esquemaFecha = z
  .object({
    id: z.string().uuid().optional(),
    workshop_id: z.string().uuid(),
    starts_at: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Elegí el día y la hora de inicio."),
    schedule: z.string().trim().max(160).default(""),
    capacity: z.coerce.number().int().min(1, "El cupo tiene que ser de al menos 1.").max(500),
    price: z.coerce.number().min(0, "El precio no puede ser negativo."),
    price_note: z.string().trim().max(200).default(""),
    deposit_type: z.enum(["none", "percent", "amount"]),
    deposit_value: z.coerce.number().min(0).default(0),
    is_open: z.boolean(),
  })
  .refine((f) => f.deposit_type !== "percent" || f.deposit_value <= 100, {
    message: "La seña en porcentaje no puede pasar del 100%.",
  })
  .refine((f) => f.deposit_type === "none" || f.deposit_value > 0, {
    message: "Poné el valor de la seña, o elegí Sin seña.",
  });

export async function guardarFecha(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaFecha.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    workshop_id: datos.get("workshop_id"),
    starts_at: datos.get("starts_at"),
    schedule: datos.get("schedule") ?? "",
    capacity: datos.get("capacity"),
    price: datos.get("price") || 0,
    price_note: datos.get("price_note") ?? "",
    deposit_type: datos.get("deposit_type") ?? "none",
    deposit_value: datos.get("deposit_value") || 0,
    is_open: datos.get("is_open") === "on",
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };

  const { id, ...campos } = analisis.data;
  const fila = {
    ...campos,
    starts_at: desdeHoraLocal(campos.starts_at),
    schedule: campos.schedule || null,
    price_note: campos.price_note || null,
    deposit_value: campos.deposit_type === "none" ? 0 : campos.deposit_value,
  };

  const supabase = await createClient();
  const { data: guardada, error } = id
    ? await supabase
        .from("workshop_sessions")
        .update(fila)
        .eq("id", id)
        .eq("workshop_id", campos.workshop_id)
        .select("id")
        .single()
    : await supabase.from("workshop_sessions").insert(fila).select("id").single();

  if (error || !guardada) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  refrescar();
  if (!id) redirect(`/admin/talleres/${campos.workshop_id}/fechas/${guardada.id}?nueva=1`);
  return { ok: true, mensaje: "Fecha guardada." };
}

export async function borrarFecha(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const tallerId = String(datos.get("workshop_id") ?? "");
  if (!id || !tallerId) return;

  const supabase = await createClient();
  if ((await inscripcionesVigentes(supabase, [id])) > 0) {
    redirect(`/admin/talleres/${tallerId}/fechas/${id}?error=inscriptos`);
  }

  const { data } = await supabase.from("workshop_sessions").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/talleres/${tallerId}/fechas/${id}?error=borrar`);

  refrescar();
  redirect(`/admin/talleres/${tallerId}`);
}

/* --- Lista de espera ---------------------------------------------------- */

const ESTADOS = Object.keys(ESTADOS_ESPERA) as [EstadoEspera, ...EstadoEspera[]];

export async function cambiarEstadoEspera(
  id: string,
  estado: EstadoEspera,
): Promise<{ ok: boolean; mensaje: string }> {
  await exigirAdmin();

  const analisis = z
    .object({ id: z.string().uuid(), estado: z.enum(ESTADOS) })
    .safeParse({ id, estado });
  if (!analisis.success) return { ok: false, mensaje: "Ese estado no es válido." };

  const supabase = await createClient();
  const { data } = await supabase
    .from("workshop_waitlist")
    .update({ status: estado })
    .eq("id", id)
    .select("id");
  if (!data?.length) return { ok: false, mensaje: "No se pudo cambiar. Probá de nuevo." };

  refrescar();
  return { ok: true, mensaje: `Marcada como ${ESTADOS_ESPERA[estado].label.toLowerCase()}.` };
}

export async function borrarEspera(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const volver = String(datos.get("volver") ?? "/admin/talleres");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase.from("workshop_waitlist").delete().eq("id", id).select("id");
  if (!data?.length) console.error("[lista de espera] no se pudo borrar", id);

  refrescar();
  redirect(volver.startsWith("/admin/") ? volver : "/admin/talleres");
}
