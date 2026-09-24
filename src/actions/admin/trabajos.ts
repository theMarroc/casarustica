"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { slugDisponible } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

function refrescarSitio() {
  revalidatePath("/", "layout");
}

/* ==========================================================================
   Antes y después
   ========================================================================== */

const esquemaAntesDespues = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Ponele un título al trabajo."),
  description: z.string().trim().max(500).default(""),
  before_url: z.string().url("Falta la foto de antes."),
  after_url: z.string().url("Falta la foto de después."),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function guardarAntesDespues(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaAntesDespues.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    title: datos.get("title"),
    description: datos.get("description") ?? "",
    before_url: datos.get("before_url"),
    after_url: datos.get("after_url"),
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  const { id, ...campos } = analisis.data;
  const fila = { ...campos, description: campos.description || null };
  const supabase = await createClient();

  const { data: guardado, error } = id
    ? await supabase.from("before_after").update(fila).eq("id", id).select("id").single()
    : await supabase.from("before_after").insert(fila).select("id").single();

  if (error || !guardado) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  refrescarSitio();
  revalidatePath("/admin/antes-y-despues");

  if (!id) redirect(`/admin/antes-y-despues/${guardado.id}?nuevo=1`);
  return { ok: true, mensaje: "Trabajo guardado." };
}

export async function alternarAntesDespues(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("before_after")
    .update({ is_active: activo })
    .eq("id", id)
    .select("id");
  if (!data?.length) console.error("[antes y después] no se pudo cambiar la visibilidad", id);

  refrescarSitio();
  revalidatePath("/admin/antes-y-despues");
}

export async function borrarAntesDespues(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase.from("before_after").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/antes-y-despues/${id}?error=borrar`);

  refrescarSitio();
  revalidatePath("/admin/antes-y-despues");
  redirect("/admin/antes-y-despues");
}

/* ==========================================================================
   Eventos
   ========================================================================== */

const esquemaImagen = z.object({ url: z.string().url(), alt: z.string().default("") });

const esquemaEvento = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2, "Ponele un nombre al evento."),
  kind: z.string().trim().max(40).default(""),
  event_date: z.union([z.iso.date("La fecha no es válida."), z.literal("")]).default(""),
  place: z.string().trim().max(80).default(""),
  description: z.string().trim().max(3000).default(""),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export async function guardarEvento(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaEvento.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    title: datos.get("title"),
    kind: datos.get("kind") ?? "",
    event_date: datos.get("event_date") ?? "",
    place: datos.get("place") ?? "",
    description: datos.get("description") ?? "",
    sort_order: datos.get("sort_order") ?? 0,
    is_active: datos.get("is_active") === "on",
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }

  let imagenes: z.infer<typeof esquemaImagen>[] = [];
  try {
    imagenes = z
      .array(esquemaImagen)
      .parse(JSON.parse(String(datos.get("imagenes") ?? "[]")));
  } catch {
    imagenes = [];
  }

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();

  const fila = {
    ...campos,
    slug: await slugDisponible(supabase, "events", campos.title, id),
    kind: campos.kind || null,
    event_date: campos.event_date || null,
    place: campos.place || null,
    description: campos.description || null,
  };

  const { data: guardado, error } = id
    ? await supabase.from("events").update(fila).eq("id", id).select("id").single()
    : await supabase.from("events").insert(fila).select("id").single();

  if (error || !guardado) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  // Las fotos se reemplazan enteras, como en los productos.
  const { error: errorBorrado } = await supabase
    .from("event_images")
    .delete()
    .eq("event_id", guardado.id);

  if (!errorBorrado && imagenes.length > 0) {
    const { data: insertadas } = await supabase
      .from("event_images")
      .insert(
        imagenes.map((imagen, indice) => ({
          event_id: guardado.id,
          url: imagen.url,
          alt: imagen.alt || null,
          sort_order: indice,
        })),
      )
      .select("id");

    if ((insertadas?.length ?? 0) !== imagenes.length) {
      return { ok: false, mensaje: "El evento se guardó, pero no todas las fotos. Probá de nuevo." };
    }
  }

  refrescarSitio();
  revalidatePath("/admin/eventos");

  if (!id) redirect(`/admin/eventos/${guardado.id}?nuevo=1`);
  return { ok: true, mensaje: "Evento guardado." };
}

export async function alternarEvento(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .update({ is_active: activo })
    .eq("id", id)
    .select("id");
  if (!data?.length) console.error("[eventos] no se pudo cambiar la visibilidad", id);

  refrescarSitio();
  revalidatePath("/admin/eventos");
}

export async function borrarEvento(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data } = await supabase.from("events").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/eventos/${id}?error=borrar`);

  refrescarSitio();
  revalidatePath("/admin/eventos");
  redirect("/admin/eventos");
}
