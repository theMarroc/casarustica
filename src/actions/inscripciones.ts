"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ResultadoPedido } from "@/actions/pedidos";
import { getUsuario } from "@/lib/auth";
import { crearPreferencia } from "@/lib/mercadopago";
import { esVerdadero } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { supabaseConfigurado } from "@/lib/supabase/server";
import { describirInicio, MAXIMO_PERSONAS, senaDeFecha } from "@/lib/talleres";
import type { TipoSena } from "@/lib/types";
import { generarCodigoPedido, tokenAleatorio } from "@/lib/utils";

/*
 * Inscripción a un taller. Es un pedido más (kind "inscripcion") con una
 * línea por fecha, así reutiliza Mercado Pago, la transferencia con
 * comprobante, la página del pedido y el panel de pedidos. El cupo lo cuenta
 * la función lugares_tomados() de la base.
 */

const SIN_BASE =
  "El sitio todavía no está conectado a la base de datos. Escribinos por WhatsApp y te anotamos a mano.";

const datosPersona = {
  nombre: z.string().trim().min(2, "Escribí tu nombre y apellido.").max(80),
  telefono: z.string().trim().min(6, "Necesitamos un WhatsApp para confirmarte el lugar.").max(30),
  email: z.union([z.string().trim().email("Revisá el correo."), z.literal("")]),
  personas: z.coerce
    .number()
    .int()
    .min(1, "Elegí cuántas personas se anotan.")
    .max(MAXIMO_PERSONAS, `Podés anotar hasta ${MAXIMO_PERSONAS} personas por vez.`),
};

const esquemaInscripcion = z.object({
  fecha: z.string().uuid("Elegí una fecha."),
  pago: z.enum(["mercadopago", "transfer"]),
  notas: z.string().trim().max(500).default(""),
  ...datosPersona,
});

type Admin = ReturnType<typeof createAdminClient>;

async function lugaresTomados(supabase: Admin, fechaId: string) {
  const { data } = await supabase.rpc("lugares_tomados");
  const fila = ((data ?? []) as { session_id: string; tomados: number }[]).find(
    (f) => f.session_id === fechaId,
  );
  return fila?.tomados ?? 0;
}

export async function inscribirEnTaller(
  _anterior: ResultadoPedido,
  datos: FormData,
): Promise<ResultadoPedido> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, mensaje: SIN_BASE };
  }
  if (datos.get("sitio_web")) return { ok: false, mensaje: "No pudimos registrar la inscripción." };

  const analisis = esquemaInscripcion.safeParse({
    fecha: datos.get("fecha"),
    pago: datos.get("pago"),
    notas: datos.get("notas") ?? "",
    nombre: datos.get("nombre"),
    telefono: datos.get("telefono"),
    email: datos.get("email") ?? "",
    personas: datos.get("personas") ?? 1,
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };
  const formulario = analisis.data;

  const supabase = createAdminClient();
  const { data: filasAjustes } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["pago_mercadopago_activo", "pago_transferencia_activo"]);
  const ajustes = Object.fromEntries((filasAjustes ?? []).map((f) => [f.key, f.value ?? ""]));

  if (formulario.pago === "mercadopago" && !esVerdadero(ajustes.pago_mercadopago_activo)) {
    return { ok: false, mensaje: "El pago con Mercado Pago no está disponible." };
  }
  if (formulario.pago === "transfer" && !esVerdadero(ajustes.pago_transferencia_activo ?? "true")) {
    return { ok: false, mensaje: "El pago por transferencia no está disponible." };
  }

  const { data: fecha } = await supabase
    .from("workshop_sessions")
    .select("*, workshop:workshops(id, slug, name, is_active)")
    .eq("id", formulario.fecha)
    .maybeSingle();

  const taller = fecha?.workshop as { id: string; slug: string; name: string; is_active: boolean } | null;
  if (!fecha || !taller || !taller.is_active || !fecha.is_open) {
    return { ok: false, mensaje: "Esa fecha ya no está disponible. Elegí otra." };
  }
  if (new Date(fecha.starts_at).getTime() <= Date.now()) {
    return { ok: false, mensaje: "Esa fecha ya empezó. Elegí otra." };
  }

  const libres = fecha.capacity - (await lugaresTomados(supabase, fecha.id));
  if (formulario.personas > libres) {
    return {
      ok: false,
      mensaje:
        libres <= 0
          ? "Se completó el cupo de esa fecha. Podés anotarte en la lista de espera."
          : `Queda${libres === 1 ? "" : "n"} ${libres} lugar${libres === 1 ? "" : "es"} en esa fecha.`,
    };
  }

  // Precio y seña salen de la base, nunca del navegador.
  const precio = Number(fecha.price);
  const sena = senaDeFecha({
    price: precio,
    deposit_type: fecha.deposit_type as TipoSena,
    deposit_value: Number(fecha.deposit_value),
  });
  const total = precio * formulario.personas;
  const saldo = sena > 0 ? (precio - sena) * formulario.personas : 0;

  const usuario = await getUsuario();
  const { data: pedido, error } = await supabase
    .from("orders")
    .insert({
      kind: "inscripcion",
      code: generarCodigoPedido("TA"),
      access_token: tokenAleatorio(28),
      user_id: usuario?.id ?? null,
      customer_name: formulario.nombre,
      customer_phone: formulario.telefono,
      customer_email: formulario.email || usuario?.email || null,
      delivery_type: "pickup",
      payment_method: formulario.pago,
      // Si es gratis no hay nada que cobrar: el lugar queda confirmado.
      status: total > 0 ? "pendiente_pago" : "pagado",
      items_total: total,
      total,
      deposit_total: sena * formulario.personas,
      balance_due: saldo,
      notes: formulario.notas || null,
    })
    .select("id, code, access_token")
    .single();

  if (error || !pedido) {
    console.error("[inscripcion] no se pudo registrar", error?.message);
    return { ok: false, mensaje: "No pudimos registrar la inscripción. Probá de nuevo." };
  }

  const linea = {
    kind: "workshop" as const,
    product_id: null,
    combo_id: null,
    session_id: fecha.id,
    name: `${taller.name} · ${describirInicio(fecha.starts_at)}`,
    unit_price: precio,
    quantity: formulario.personas,
    subtotal: total,
    personalization: fecha.schedule ? [{ etiqueta: "Horario", valor: fecha.schedule }] : null,
    deposit_unit: sena,
  };
  const { error: errorLinea } = await supabase
    .from("order_items")
    .insert({ ...linea, order_id: pedido.id });

  // Si dos personas se anotaron a la vez por el último lugar, la segunda no entra.
  const tomadosDespues = errorLinea ? Infinity : await lugaresTomados(supabase, fecha.id);
  if (tomadosDespues > fecha.capacity) {
    await supabase.from("orders").delete().eq("id", pedido.id);
    return {
      ok: false,
      mensaje: errorLinea
        ? "No pudimos registrar la inscripción. Probá de nuevo."
        : "Justo se completó el cupo de esa fecha. Podés anotarte en la lista de espera.",
    };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/taller", "layout");

  const urlPedido = `/pedido/${pedido.code}?t=${pedido.access_token}`;

  if (formulario.pago === "mercadopago" && total > 0) {
    const enlace = await crearPreferencia({
      pedidoId: pedido.id,
      codigo: pedido.code,
      token: pedido.access_token,
      lineas: [linea],
      envio: 0,
      aPagarAhora: saldo > 0 ? total - saldo : null,
      tituloSena: `Inscripción ${pedido.code}: seña`,
      email: formulario.email || usuario?.email || undefined,
    });
    if (enlace) return { ok: true, url: enlace };

    // Si Mercado Pago falla, la inscripción sigue por transferencia.
    await supabase.from("orders").update({ payment_method: "transfer" }).eq("id", pedido.id);
  }

  return { ok: true, url: urlPedido };
}

const esquemaEspera = z.object({
  taller: z.string().uuid(),
  fecha: z.union([z.string().uuid(), z.literal("")]),
  ...datosPersona,
});

export async function anotarEnEspera(
  _anterior: { ok: boolean; mensaje: string } | null,
  datos: FormData,
): Promise<{ ok: boolean; mensaje: string }> {
  if (!supabaseConfigurado() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, mensaje: SIN_BASE };
  }
  if (datos.get("sitio_web")) return { ok: false, mensaje: "No pudimos anotarte." };

  const analisis = esquemaEspera.safeParse({
    taller: datos.get("taller"),
    fecha: datos.get("fecha") ?? "",
    nombre: datos.get("nombre"),
    telefono: datos.get("telefono"),
    email: datos.get("email") ?? "",
    personas: datos.get("personas") ?? 1,
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };
  const formulario = analisis.data;

  const supabase = createAdminClient();
  const { data: taller } = await supabase
    .from("workshops")
    .select("id, is_active")
    .eq("id", formulario.taller)
    .maybeSingle();
  if (!taller?.is_active) return { ok: false, mensaje: "Ese taller no está disponible." };

  if (formulario.fecha) {
    const { data: fecha } = await supabase
      .from("workshop_sessions")
      .select("id")
      .eq("id", formulario.fecha)
      .eq("workshop_id", taller.id)
      .maybeSingle();
    if (!fecha) return { ok: false, mensaje: "Esa fecha no es de este taller." };
  }

  // Si ya estaba anotada para lo mismo, no se duplica.
  let repetida = supabase
    .from("workshop_waitlist")
    .select("id")
    .eq("workshop_id", taller.id)
    .eq("customer_phone", formulario.telefono)
    .eq("status", "esperando");
  repetida = formulario.fecha ? repetida.eq("session_id", formulario.fecha) : repetida.is("session_id", null);
  const { data: yaEstaba } = await repetida.limit(1);
  if (yaEstaba?.length) {
    return { ok: true, mensaje: "Ya estabas en la lista. Te avisamos por WhatsApp apenas haya lugar." };
  }

  const { error } = await supabase.from("workshop_waitlist").insert({
    workshop_id: taller.id,
    session_id: formulario.fecha || null,
    customer_name: formulario.nombre,
    customer_phone: formulario.telefono,
    customer_email: formulario.email || null,
    people: formulario.personas,
  });
  if (error) {
    console.error("[lista de espera] no se pudo anotar", error.message);
    return { ok: false, mensaje: "No pudimos anotarte. Probá de nuevo." };
  }

  revalidatePath("/admin", "layout");
  return {
    ok: true,
    mensaje: formulario.fecha
      ? "¡Listo! Si se libera un lugar, te avisamos por WhatsApp."
      : "¡Listo! Cuando haya fecha nueva, te avisamos por WhatsApp.",
  };
}
