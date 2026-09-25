"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_SOLICITUD, type EstadoAdmin, type EstadoSolicitud } from "@/lib/types";

const ESTADOS = Object.keys(ESTADOS_SOLICITUD) as [EstadoSolicitud, ...EstadoSolicitud[]];

function refrescar(id: string) {
  // El contador de pendientes vive en el menú del panel.
  revalidatePath("/admin", "layout");
  revalidatePath(`/admin/solicitudes/${id}`);
}

export async function cambiarEstadoSolicitud(
  id: string,
  estado: EstadoSolicitud,
): Promise<{ ok: boolean; mensaje: string }> {
  await exigirAdmin();

  const analisis = z
    .object({ id: z.string().uuid(), estado: z.enum(ESTADOS) })
    .safeParse({ id, estado });
  if (!analisis.success) return { ok: false, mensaje: "Ese estado no es válido." };

  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_requests")
    .update({ status: estado })
    .eq("id", id)
    .select("id");
  if (!data?.length) return { ok: false, mensaje: "No se pudo cambiar el estado. Probá de nuevo." };

  refrescar(id);
  return { ok: true, mensaje: `Estado actualizado: ${ESTADOS_SOLICITUD[estado].label}.` };
}

const esquemaPresupuesto = z.object({
  id: z.string().uuid(),
  quoted_amount: z.union([z.literal(""), z.coerce.number().min(0, "El monto no puede ser negativo.")]),
  internal_notes: z.string().trim().max(3000).default(""),
});

export async function guardarPresupuesto(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquemaPresupuesto.safeParse({
    id: datos.get("id"),
    quoted_amount: String(datos.get("quoted_amount") ?? "").trim(),
    internal_notes: datos.get("internal_notes") ?? "",
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };

  const { id, quoted_amount, internal_notes } = analisis.data;
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_requests")
    .update({
      quoted_amount: quoted_amount === "" ? null : quoted_amount,
      internal_notes: internal_notes || null,
    })
    .eq("id", id)
    .select("id");
  if (!data?.length) return { ok: false, mensaje: "No se pudo guardar. Probá de nuevo." };

  refrescar(id);
  return { ok: true, mensaje: "Guardado." };
}

/** Borra el pedido de presupuesto y sus fotos del bucket. */
export async function borrarSolicitud(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  const supabase = await createClient();
  const { data: solicitud } = await supabase
    .from("quote_requests")
    .select("id, images:quote_request_images(path)")
    .eq("id", id)
    .maybeSingle();
  if (!solicitud) redirect("/admin/solicitudes");

  const { data } = await supabase.from("quote_requests").delete().eq("id", id).select("id");
  if (!data?.length) redirect(`/admin/solicitudes/${id}?error=borrar`);

  const rutas = (solicitud.images ?? []).map((i) => i.path);
  if (rutas.length && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    await createAdminClient().storage.from("solicitudes").remove(rutas);
  }

  revalidatePath("/admin", "layout");
  redirect("/admin/solicitudes");
}
