"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/server";
import { generarCodigoPedido, tokenAleatorio } from "@/lib/utils";

/*
 * Pedido de presupuesto de un servicio. Mismo flujo que el comprobante: las
 * fotos no pasan por una Server Action (Next corta en 1 MB), sino que:
 *   1. crearSolicitud registra el pedido y entrega una URL firmada por foto.
 *   2. El navegador achica las fotos y las sube directo al bucket privado.
 *   3. confirmarFotosSolicitud verifica que cada foto llegó y la anota.
 */

const MAXIMO_FOTOS = 6;
const TIPOS_FOTO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const esquema = z.object({
  servicio: z.string().uuid("Elegí un servicio."),
  nombre: z.string().trim().min(2, "Escribí tu nombre.").max(80),
  telefono: z.string().trim().min(6, "Necesitamos un WhatsApp para responderte.").max(30),
  email: z.union([z.string().trim().email("Revisá el correo."), z.literal("")]),
  localidad: z.string().trim().max(80).default(""),
  fecha: z.union([z.iso.date("La fecha no es válida."), z.literal("")]).default(""),
  medidas: z.string().trim().max(300).default(""),
  mensaje: z.string().trim().min(10, "Contanos un poco más qué necesitás.").max(2000),
  fotos: z
    .array(z.object({ tipo: z.string(), peso: z.number().positive() }))
    .max(MAXIMO_FOTOS, `Podés mandar hasta ${MAXIMO_FOTOS} fotos.`),
});

export type ResultadoSolicitud =
  | {
      ok: true;
      codigo: string;
      token: string;
      servicio: string;
      subidas: { ruta: string; tokenSubida: string }[];
    }
  | { ok: false; mensaje: string };

export async function crearSolicitud(datos: {
  servicio: string;
  nombre: string;
  telefono: string;
  email: string;
  localidad: string;
  fecha: string;
  medidas: string;
  mensaje: string;
  fotos: { tipo: string; peso: number }[];
  /** Campo trampa: las personas no lo ven, los bots suelen completarlo. */
  sitioWeb?: string;
}): Promise<ResultadoSolicitud> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      ok: false,
      mensaje:
        "El sitio todavía no está conectado a la base de datos. Escribinos por WhatsApp y lo vemos por ahí.",
    };
  }
  if (datos.sitioWeb) return { ok: false, mensaje: "No pudimos enviar tu consulta." };

  const analisis = esquema.safeParse(datos);
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };
  const formulario = analisis.data;

  for (const foto of formulario.fotos) {
    if (!TIPOS_FOTO[foto.tipo]) {
      return { ok: false, mensaje: "Las fotos tienen que ser JPG, PNG o WEBP." };
    }
    if (foto.peso > 10 * 1024 * 1024) {
      return { ok: false, mensaje: "Alguna foto pesa más de 10 MB. Probá con otra." };
    }
  }

  const supabase = createAdminClient();
  const { data: servicio } = await supabase
    .from("services")
    .select("id, name, is_active")
    .eq("id", formulario.servicio)
    .maybeSingle();
  if (!servicio || !servicio.is_active) {
    return { ok: false, mensaje: "Ese servicio no está disponible." };
  }

  const codigo = generarCodigoPedido("PR");
  const token = tokenAleatorio(28);

  const { data: solicitud, error } = await supabase
    .from("quote_requests")
    .insert({
      code: codigo,
      access_token: token,
      service_id: servicio.id,
      service_name: servicio.name,
      customer_name: formulario.nombre,
      customer_phone: formulario.telefono,
      customer_email: formulario.email || null,
      location: formulario.localidad || null,
      event_date: formulario.fecha || null,
      measures: formulario.medidas || null,
      message: formulario.mensaje,
    })
    .select("id")
    .single();

  if (error || !solicitud) {
    console.error("[presupuesto] no se pudo registrar", error?.message);
    return { ok: false, mensaje: "No pudimos enviar tu consulta. Probá de nuevo." };
  }

  // Una URL firmada por foto; la ruta la decide el servidor.
  const subidas: { ruta: string; tokenSubida: string }[] = [];
  for (const [indice, foto] of formulario.fotos.entries()) {
    const ruta = `${codigo}/${indice + 1}-${tokenAleatorio(6)}.${TIPOS_FOTO[foto.tipo]}`;
    const { data } = await supabase.storage.from("solicitudes").createSignedUploadUrl(ruta);
    if (data) subidas.push({ ruta: data.path, tokenSubida: data.token });
  }

  revalidatePath("/admin", "layout");
  return { ok: true, codigo, token, servicio: servicio.name, subidas };
}

export async function confirmarFotosSolicitud(
  codigo: string,
  token: string,
  rutas: string[],
): Promise<{ ok: boolean; mensaje: string }> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, mensaje: "El sitio no está conectado a la base de datos." };
  }

  const supabase = createAdminClient();
  const { data: solicitud } = await supabase
    .from("quote_requests")
    .select("id, code, access_token, images:quote_request_images(path)")
    .eq("code", codigo)
    .maybeSingle();

  if (!solicitud || solicitud.access_token !== token) {
    return { ok: false, mensaje: "No encontramos tu consulta." };
  }

  const yaAnotadas = new Set((solicitud.images ?? []).map((i) => i.path));
  const validas: string[] = [];
  for (const ruta of [...new Set(rutas)].slice(0, MAXIMO_FOTOS - yaAnotadas.size)) {
    if (!ruta.startsWith(`${solicitud.code}/`) || ruta.includes("..")) continue;
    if (yaAnotadas.has(ruta)) continue;
    const { data: existe } = await supabase.storage.from("solicitudes").exists(ruta);
    if (existe) validas.push(ruta);
  }

  if (validas.length > 0) {
    const { error } = await supabase.from("quote_request_images").insert(
      validas.map((ruta, indice) => ({
        request_id: solicitud.id,
        path: ruta,
        sort_order: yaAnotadas.size + indice,
      })),
    );
    if (error) {
      console.error("[presupuesto] no se pudieron anotar las fotos", error.message);
      return { ok: false, mensaje: "La consulta llegó, pero no pudimos guardar las fotos." };
    }
  }

  revalidatePath("/admin", "layout");
  return { ok: true, mensaje: "Listo" };
}
