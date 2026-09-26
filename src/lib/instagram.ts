import { createAdminClient } from "./supabase/admin";

/*
 * Conexión oficial con Instagram (Instagram API with Instagram Login).
 * Silvina autoriza una vez desde el panel; el permiso dura 60 días y el cron
 * diario lo renueva antes de que venza. Las URLs de las fotos de Instagram
 * vencen, por eso al importar se copian a nuestro almacenamiento.
 */

const GRAPH = "https://graph.instagram.com";

export type PublicacionInstagram = {
  id: string;
  caption: string | null;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  children?: { data: { id: string; media_type: string; media_url?: string; thumbnail_url?: string }[] };
};

export type Conexion = {
  ig_user_id: string;
  username: string | null;
  access_token: string;
  expires_at: string;
  refreshed_at: string;
};

export function instagramConfigurado() {
  return Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET);
}

export function urlDeVuelta() {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/api/instagram/callback`;
}

export function urlDeAutorizacion(estado: string) {
  const parametros = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID ?? "",
    redirect_uri: urlDeVuelta(),
    response_type: "code",
    scope: "instagram_business_basic",
    state: estado,
  });
  return `https://www.instagram.com/oauth/authorize?${parametros}`;
}

async function pedir<T>(url: string, opciones?: RequestInit): Promise<T> {
  const respuesta = await fetch(url, { ...opciones, cache: "no-store" });
  const datos = await respuesta.json();
  if (!respuesta.ok || datos.error) {
    throw new Error(datos.error?.message ?? datos.error_message ?? `Instagram respondió ${respuesta.status}`);
  }
  return datos as T;
}

/** Canjea el código de autorización por un permiso de 60 días y lo guarda. */
export async function conectar(codigo: string) {
  const corto = await pedir<{ access_token: string; user_id: number | string }>(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID ?? "",
        client_secret: process.env.INSTAGRAM_APP_SECRET ?? "",
        grant_type: "authorization_code",
        redirect_uri: urlDeVuelta(),
        code: codigo,
      }),
    },
  );

  const largo = await pedir<{ access_token: string; expires_in: number }>(
    `${GRAPH}/access_token?${new URLSearchParams({
      grant_type: "ig_exchange_token",
      client_secret: process.env.INSTAGRAM_APP_SECRET ?? "",
      access_token: corto.access_token,
    })}`,
  );

  const yo = await pedir<{ user_id?: string; username?: string }>(
    `${GRAPH}/me?fields=user_id,username&access_token=${largo.access_token}`,
  );

  const { error } = await createAdminClient()
    .from("instagram_connection")
    .upsert({
      id: true,
      ig_user_id: String(yo.user_id ?? corto.user_id),
      username: yo.username ?? null,
      access_token: largo.access_token,
      expires_at: new Date(Date.now() + largo.expires_in * 1000).toISOString(),
      refreshed_at: new Date().toISOString(),
    });
  if (error) throw new Error(`No se pudo guardar la conexión: ${error.message}`);
  return yo.username ?? null;
}

export async function leerConexion(): Promise<Conexion | null> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  const { data } = await createAdminClient()
    .from("instagram_connection")
    .select("ig_user_id, username, access_token, expires_at, refreshed_at")
    .maybeSingle();
  if (!data || new Date(data.expires_at).getTime() < Date.now()) return null;
  return data;
}

export async function desconectar() {
  await createAdminClient().from("instagram_connection").delete().eq("id", true);
}

/**
 * La llama el cron diario. Instagram deja renovar un permiso que tenga más de
 * 24 horas; lo renovamos cuando le quedan menos de 30 días.
 */
export async function renovarSiHaceFalta() {
  const conexion = await leerConexion();
  if (!conexion) return "sin conexión";

  const quedan = new Date(conexion.expires_at).getTime() - Date.now();
  const edad = Date.now() - new Date(conexion.refreshed_at).getTime();
  if (quedan > 30 * 24 * 3600 * 1000 || edad < 24 * 3600 * 1000) return "vigente";

  const nuevo = await pedir<{ access_token: string; expires_in: number }>(
    `${GRAPH}/refresh_access_token?grant_type=ig_refresh_token&access_token=${conexion.access_token}`,
  );
  await createAdminClient()
    .from("instagram_connection")
    .update({
      access_token: nuevo.access_token,
      expires_at: new Date(Date.now() + nuevo.expires_in * 1000).toISOString(),
      refreshed_at: new Date().toISOString(),
    })
    .eq("id", true);
  return "renovado";
}

const CAMPOS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

export async function listarPublicaciones(token: string, despuesDe?: string) {
  const parametros = new URLSearchParams({ fields: CAMPOS, limit: "24", access_token: token });
  if (despuesDe) parametros.set("after", despuesDe);
  const datos = await pedir<{
    data: PublicacionInstagram[];
    paging?: { cursors?: { after?: string }; next?: string };
  }>(`${GRAPH}/me/media?${parametros}`);
  return {
    publicaciones: datos.data,
    siguiente: datos.paging?.next ? (datos.paging.cursors?.after ?? null) : null,
  };
}

export async function leerPublicacion(token: string, id: string) {
  return pedir<PublicacionInstagram>(
    `${GRAPH}/${encodeURIComponent(id)}?fields=${CAMPOS},children{id,media_type,media_url,thumbnail_url}&access_token=${token}`,
  );
}

/** Todas las fotos de una publicación; de los videos, la portada. */
export function fotosDe(publicacion: PublicacionInstagram) {
  const foto = (m: { media_type: string; media_url?: string; thumbnail_url?: string }) =>
    m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url;
  const lista =
    publicacion.media_type === "CAROUSEL_ALBUM"
      ? (publicacion.children?.data ?? []).map(foto)
      : [foto(publicacion)];
  return lista.filter((url): url is string => Boolean(url));
}

/** Del link de una publicación saca su código: instagram.com/p/CÓDIGO/ o /reel/CÓDIGO/. */
export function codigoDelLink(link: string) {
  return link.match(/instagram\.com\/(?:[\w.]+\/)?(?:p|reel|reels|tv)\/([\w-]+)/)?.[1] ?? null;
}

/** Busca entre sus publicaciones la del link (recorre hasta unas 500). */
export async function buscarPorLink(token: string, link: string) {
  const codigo = codigoDelLink(link);
  if (!codigo) return null;
  let despuesDe: string | undefined;
  for (let pagina = 0; pagina < 20; pagina += 1) {
    const { publicaciones, siguiente } = await listarPublicaciones(token, despuesDe);
    const encontrada = publicaciones.find((p) => p.permalink.includes(`/${codigo}/`));
    if (encontrada) return encontrada;
    if (!siguiente) return null;
    despuesDe = siguiente;
  }
  return null;
}

/* --- Textos ------------------------------------------------------------- */

/** "12 sept 2024". Instagram manda "2024-09-12T15:04:05+0000", sin los dos puntos del huso. */
export function fechaCorta(fecha: string | null) {
  if (!fecha) return "";
  const normalizada = fecha.replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  return new Date(normalizada).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}

/** El texto de la publicación sin hashtags ni renglones vacíos de más. */
export function limpiarTexto(texto: string | null) {
  return (texto ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/(^|\s)#[\p{L}\p{N}_]+/gu, "$1")
    .split("\n")
    .map((renglon) => renglon.replace(/[ \t]{2,}/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Un título a partir del primer renglón, sin emojis y de hasta 80 letras. */
export function tituloDesde(texto: string | null, fecha?: string | null) {
  const primero =
    limpiarTexto(texto)
      .split("\n")
      .map((r) => r.replace(/\p{Extended_Pictographic}|️|‍/gu, "").trim())
      .find((r) => r.length > 2) ?? "";
  const sinCierre = primero.replace(/[.!¡¿?:;,\s]+$/u, "");
  if (sinCierre.length <= 80) {
    if (sinCierre) return sinCierre;
  } else {
    const corte = sinCierre.slice(0, 80);
    return corte.slice(0, corte.lastIndexOf(" ") > 40 ? corte.lastIndexOf(" ") : 80);
  }
  const dia = fecha ? new Date(fecha).toLocaleDateString("es-AR") : "";
  return `Publicación de Instagram ${dia}`.trim();
}
