"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { slugDisponible } from "@/lib/slugs";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

const esquemaImagen = z.object({ url: z.string().url(), alt: z.string().default("") });

const esquemaCampo = z.object({
  clave: z.string().trim().min(1).max(60),
  etiqueta: z.string().trim().min(1).max(80),
  tipo: z.enum(["texto", "texto_largo", "fecha", "opciones"]),
  opciones: z.array(z.string().trim().min(1).max(60)).max(30),
  obligatorio: z.boolean(),
  max: z.number().int().positive().max(1000).nullable(),
  ayuda: z.string().trim().max(160),
});

const esquema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2, "El nombre es obligatorio."),
  slug: z.string().trim().default(""),
  description: z.string().trim().max(300).default(""),
  long_description: z.string().trim().max(3000).default(""),
  category_id: z.string().default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo."),
  unit: z.string().trim().max(40).default(""),
  stock: z.coerce.number().int().min(0).default(0),
  track_stock: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
  fulfillment: z.enum(["stock", "a_pedido"]).default("stock"),
  lead_time: z.string().trim().max(40).default(""),
  deposit_type: z.enum(["none", "percent", "amount"]).default("none"),
  deposit_value: z.coerce.number().min(0, "La seña no puede ser negativa.").default(0),
});

function refrescarTienda() {
  revalidatePath("/", "layout");
}

export async function guardarProducto(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    id: String(datos.get("id") ?? "") || undefined,
    name: datos.get("name"),
    slug: datos.get("slug") ?? "",
    description: datos.get("description") ?? "",
    long_description: datos.get("long_description") ?? "",
    category_id: datos.get("category_id") ?? "",
    price: datos.get("price"),
    unit: datos.get("unit") ?? "",
    stock: datos.get("stock") ?? 0,
    track_stock: datos.get("track_stock") === "on",
    is_active: datos.get("is_active") === "on",
    is_featured: datos.get("is_featured") === "on",
    sort_order: datos.get("sort_order") ?? 0,
    fulfillment: datos.get("fulfillment") ?? "stock",
    lead_time: datos.get("lead_time") ?? "",
    deposit_type: datos.get("deposit_type") ?? "none",
    deposit_value: datos.get("deposit_value") || 0,
  });

  if (!analisis.success) {
    return { ok: false, mensaje: analisis.error.issues[0].message };
  }
  if (analisis.data.deposit_type === "percent" && analisis.data.deposit_value > 100) {
    return { ok: false, mensaje: "La seña en porcentaje no puede pasar del 100%." };
  }
  if (analisis.data.deposit_type !== "none" && analisis.data.deposit_value <= 0) {
    return { ok: false, mensaje: "Poné el valor de la seña, o elegí \"Sin seña\"." };
  }

  let camposCrudos: unknown;
  try {
    camposCrudos = JSON.parse(String(datos.get("custom_fields") || "[]"));
  } catch {
    return { ok: false, mensaje: "No se pudieron leer los datos para completar." };
  }
  const camposPersonalizados = z.array(esquemaCampo).max(12).safeParse(camposCrudos);
  if (!camposPersonalizados.success) {
    return { ok: false, mensaje: "Revisá los datos para completar: hay alguno incompleto." };
  }
  if (camposPersonalizados.data.some((c) => c.tipo === "opciones" && c.opciones.length < 2)) {
    return { ok: false, mensaje: "Cada pregunta con opciones necesita al menos dos opciones." };
  }

  let imagenes: z.infer<typeof esquemaImagen>[] = [];
  try {
    const crudas = JSON.parse(String(datos.get("imagenes") ?? "[]"));
    imagenes = z.array(esquemaImagen).parse(crudas);
  } catch {
    imagenes = [];
  }

  const { id, ...campos } = analisis.data;
  const supabase = await createClient();

  const fila = {
    ...campos,
    slug: await slugDisponible(supabase, "products", campos.slug || campos.name, id),
    description: campos.description || null,
    long_description: campos.long_description || null,
    category_id: campos.category_id || null,
    unit: campos.unit || null,
    lead_time: campos.fulfillment === "a_pedido" ? campos.lead_time || null : null,
    // Lo que se hace a pedido no descuenta stock.
    track_stock: campos.fulfillment === "a_pedido" ? false : campos.track_stock,
    deposit_value: campos.deposit_type === "none" ? 0 : campos.deposit_value,
    custom_fields: camposPersonalizados.data,
  };

  const { data: guardado, error } = id
    ? await supabase.from("products").update(fila).eq("id", id).select("id").single()
    : await supabase.from("products").insert(fila).select("id").single();

  if (error || !guardado) {
    return { ok: false, mensaje: `No se pudo guardar: ${error?.message ?? "error"}` };
  }

  // Las imágenes se reemplazan enteras: es más simple y evita duplicados.
  await supabase.from("product_images").delete().eq("product_id", guardado.id);
  if (imagenes.length > 0) {
    await supabase.from("product_images").insert(
      imagenes.map((imagen, indice) => ({
        product_id: guardado.id,
        url: imagen.url,
        alt: imagen.alt || null,
        sort_order: indice,
      })),
    );
  }

  refrescarTienda();
  revalidatePath("/admin/productos");

  if (!id) redirect(`/admin/productos/${guardado.id}?nuevo=1`);

  return { ok: true, mensaje: "Producto guardado." };
}

export async function alternarProducto(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").update({ is_active: activo }).eq("id", id);

  refrescarTienda();
  revalidatePath("/admin/productos");
}

export async function alternarDestacado(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const activo = datos.get("activo") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").update({ is_featured: activo }).eq("id", id);

  refrescarTienda();
  revalidatePath("/admin/productos");
}

export async function duplicarProducto(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const { data: original } = await supabase
    .from("products")
    .select("*, images:product_images(url, alt, sort_order)")
    .eq("id", id)
    .maybeSingle();

  if (!original) return;

  // Se copia todo menos el id, las fechas y las imágenes (van aparte).
  const { images, ...resto } = original as Record<string, unknown> & {
    images: { url: string; alt: string | null; sort_order: number }[];
  };
  delete resto.id;
  delete resto.created_at;
  delete resto.updated_at;
  const campos = resto;

  const { data: copia } = await supabase
    .from("products")
    .insert({
      ...campos,
      name: `${campos.name as string} (copia)`,
      slug: await slugDisponible(supabase, "products", `${campos.slug as string}-copia`),
      is_active: false,
    })
    .select("id")
    .single();

  if (copia && images?.length) {
    await supabase.from("product_images").insert(
      images.map((imagen) => ({ ...imagen, product_id: copia.id })),
    );
  }

  revalidatePath("/admin/productos");
  if (copia) redirect(`/admin/productos/${copia.id}`);
}

export async function borrarProducto(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);

  refrescarTienda();
  revalidatePath("/admin/productos");
  redirect("/admin/productos");
}
