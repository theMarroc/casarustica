"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirAdmin } from "@/lib/auth";
import { buscarPorLink, desconectar, fotosDe, leerConexion, leerPublicacion } from "@/lib/instagram";
import { slugDisponible } from "@/lib/slugs";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { EstadoAdmin } from "@/lib/types";

export async function desconectarInstagram() {
  await exigirAdmin();
  await desconectar();
  revalidatePath("/admin/instagram");
  redirect("/admin/instagram");
}

export async function buscarPublicacion(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();
  const link = String(datos.get("link") ?? "").trim();
  if (!link.includes("instagram.com/")) {
    return { ok: false, mensaje: "Pegá el link completo de la publicación de Instagram." };
  }

  const conexion = await leerConexion();
  if (!conexion) return { ok: false, mensaje: "Primero conectá tu cuenta de Instagram." };

  let encontrada;
  try {
    encontrada = await buscarPorLink(conexion.access_token, link);
  } catch (error) {
    console.error("[instagram] no se pudo buscar", error);
    return { ok: false, mensaje: "Instagram no respondió. Probá de nuevo en un rato." };
  }
  if (!encontrada) {
    return {
      ok: false,
      mensaje: "No la encontramos entre tus publicaciones. Fijate que sea de tu cuenta.",
    };
  }
  redirect(`/admin/instagram/publicacion/${encontrada.id}`);
}

/** Copia una foto a nuestro almacenamiento: las URLs de Instagram vencen. */
async function copiarFoto(url: string) {
  const respuesta = await fetch(url, { cache: "no-store" });
  if (!respuesta.ok) throw new Error("No se pudo bajar una de las fotos de Instagram.");
  const tipo = respuesta.headers.get("content-type") ?? "image/jpeg";
  const extension = tipo.includes("png") ? "png" : tipo.includes("webp") ? "webp" : "jpg";
  const ruta = `instagram/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;

  const almacen = createAdminClient().storage.from("productos");
  const { error } = await almacen.upload(ruta, await respuesta.arrayBuffer(), { contentType: tipo });
  if (error) throw new Error("No se pudo guardar una de las fotos.");
  return almacen.getPublicUrl(ruta).data.publicUrl;
}

const esquema = z.object({
  origen: z.enum(["instagram", "archivo"]),
  referencia: z.string().min(1).max(200),
  destino: z.enum(["producto", "evento", "antes_despues", "alumnas"]),
  titulo: z.string().trim().min(2, "Poné un título.").max(100, "El título es muy largo."),
  texto: z.string().trim().max(4000).default(""),
  fotos: z.array(z.coerce.number().int().min(0)).min(1, "Elegí al menos una foto."),
  taller: z.union([z.string().uuid(), z.literal("")]).default(""),
});

export async function importarPublicacion(
  _anterior: EstadoAdmin,
  datos: FormData,
): Promise<EstadoAdmin> {
  await exigirAdmin();

  const analisis = esquema.safeParse({
    origen: datos.get("origen"),
    referencia: datos.get("referencia"),
    destino: datos.get("destino"),
    titulo: datos.get("titulo"),
    texto: datos.get("texto") ?? "",
    fotos: datos.getAll("foto"),
    taller: datos.get("taller") ?? "",
  });
  if (!analisis.success) return { ok: false, mensaje: analisis.error.issues[0].message };
  const { origen, referencia, destino, titulo, texto, fotos, taller } = analisis.data;

  if (destino === "antes_despues" && fotos.length !== 2) {
    return { ok: false, mensaje: "Para un antes y después elegí exactamente dos fotos: la primera es el antes." };
  }
  if (destino === "alumnas" && !taller) {
    return { ok: false, mensaje: "Elegí a qué taller van las fotos." };
  }

  const supabase = await createClient();

  // --- De dónde salen las fotos y los datos --------------------------------
  let urls: string[];
  let original: { caption: string | null; taken_at: string | null; permalink: string | null };
  try {
    if (origen === "instagram") {
      const conexion = await leerConexion();
      if (!conexion) return { ok: false, mensaje: "La conexión con Instagram venció. Volvé a conectarla." };
      const publicacion = await leerPublicacion(conexion.access_token, referencia);
      const disponibles = fotosDe(publicacion);
      const elegidas = fotos.map((i) => disponibles[i]).filter(Boolean);
      urls = [];
      for (const url of elegidas) urls.push(await copiarFoto(url));
      original = {
        caption: publicacion.caption,
        taken_at: publicacion.timestamp,
        permalink: publicacion.permalink,
      };
    } else {
      const { data: borrador } = await supabase
        .from("social_imports")
        .select("caption, taken_at, permalink, images")
        .eq("id", referencia)
        .eq("source", "archivo")
        .maybeSingle();
      if (!borrador) return { ok: false, mensaje: "No encontramos ese borrador." };
      const disponibles = (borrador.images ?? []) as string[];
      urls = fotos.map((i) => disponibles[i]).filter(Boolean);
      original = borrador;
    }
  } catch (error) {
    console.error("[instagram] no se pudieron traer las fotos", error);
    return {
      ok: false,
      mensaje: error instanceof Error ? error.message : "No se pudieron traer las fotos.",
    };
  }
  if (urls.length === 0) return { ok: false, mensaje: "Elegí al menos una foto." };

  // --- Se crea como borrador oculto (la galería de alumnas se ve enseguida) --
  let registro: string;
  let destinoUrl: string;

  if (destino === "producto") {
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: titulo,
        slug: await slugDisponible(supabase, "products", titulo),
        long_description: texto || null,
        price: 0,
        is_active: false,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, mensaje: `No se pudo crear el producto: ${error?.message}` };
    await supabase
      .from("product_images")
      .insert(urls.map((url, indice) => ({ product_id: data.id, url, sort_order: indice })));
    registro = data.id;
    destinoUrl = `/admin/productos/${data.id}?importado=1`;
  } else if (destino === "evento") {
    const { data, error } = await supabase
      .from("events")
      .insert({
        title: titulo,
        slug: await slugDisponible(supabase, "events", titulo),
        description: texto || null,
        event_date: original.taken_at ? original.taken_at.slice(0, 10) : null,
        is_active: false,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, mensaje: `No se pudo crear el evento: ${error?.message}` };
    await supabase
      .from("event_images")
      .insert(urls.map((url, indice) => ({ event_id: data.id, url, sort_order: indice })));
    registro = data.id;
    destinoUrl = `/admin/eventos/${data.id}?importado=1`;
  } else if (destino === "antes_despues") {
    const { data, error } = await supabase
      .from("before_after")
      .insert({
        title: titulo,
        description: texto || null,
        before_url: urls[0],
        after_url: urls[1],
        is_active: false,
      })
      .select("id")
      .single();
    if (error || !data) return { ok: false, mensaje: `No se pudo crear el trabajo: ${error?.message}` };
    registro = data.id;
    destinoUrl = `/admin/antes-y-despues/${data.id}?importado=1`;
  } else {
    const { data: ultimas } = await supabase
      .from("workshop_works")
      .select("sort_order")
      .eq("workshop_id", taller)
      .order("sort_order", { ascending: false })
      .limit(1);
    const desde = (ultimas?.[0]?.sort_order ?? -1) + 1;
    const { data, error } = await supabase
      .from("workshop_works")
      .insert(urls.map((url, indice) => ({ workshop_id: taller, url, sort_order: desde + indice })))
      .select("id");
    if (error || !data?.length) return { ok: false, mensaje: `No se pudieron agregar las fotos: ${error?.message}` };
    registro = taller;
    destinoUrl = `/admin/talleres/${taller}?importado=1`;
  }

  // --- Queda anotado, para no importarla dos veces ------------------------
  if (origen === "instagram") {
    await supabase.from("social_imports").upsert(
      {
        source: "instagram",
        source_ref: referencia,
        caption: original.caption,
        taken_at: original.taken_at,
        permalink: original.permalink,
        status: "importada",
        kind: destino,
        record_id: registro,
      },
      { onConflict: "source_ref" },
    );
  } else {
    await supabase
      .from("social_imports")
      .update({ status: "importada", kind: destino, record_id: registro })
      .eq("id", referencia);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
  redirect(destinoUrl);
}

export async function cambiarEstadoBorrador(datos: FormData) {
  await exigirAdmin();
  const id = String(datos.get("id") ?? "");
  const estado = datos.get("estado") === "descartada" ? "descartada" : "pendiente";
  if (!z.string().uuid().safeParse(id).success) return;

  const supabase = await createClient();
  const { data } = await supabase
    .from("social_imports")
    .update({ status: estado })
    .eq("id", id)
    .eq("source", "archivo")
    .select("id");
  if (!data?.length) console.error("[instagram] no se pudo cambiar el borrador", id);

  revalidatePath("/admin", "layout");
  redirect(estado === "descartada" ? "/admin/instagram?descartada=1" : `/admin/instagram/archivo/${id}`);
}
