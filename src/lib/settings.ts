import type { Settings } from "./types";

/**
 * Valores por defecto de todos los textos y parámetros editables.
 * La tabla `settings` de Supabase solo guarda lo que se cambia:
 * si una clave no está guardada, se usa el valor de acá.
 */
export const AJUSTES_POR_DEFECTO = {
  // --- Marca -------------------------------------------------------------
  marca_nombre: "Casa Rústica",
  marca_bajada: "Deco Home",
  marca_claim: "Estilo y decoración by Silvina Scalzo",
  frase_destacada: "Dar nueva vida a lo que parecía perdido.",
  // Si no hay logo subido, se muestra el nombre con la tipografía de la marca.
  logo_url: "",
  logo_taller_url: "",
  // Ver src/lib/apariencia.ts
  apariencia_letra: "a",
  apariencia_estilo: "rustica",

  // --- Portada -----------------------------------------------------------
  hero_titulo: "Diseño con alma,",
  hero_titulo_cursiva: "hecho a mano.",
  hero_texto:
    "Bandejas, latas, cartelería y deco para tu casa, pintadas y terminadas a mano en nuestro taller de Miramar.",
  hero_cta_texto: "Ver la tienda",
  hero_cta_link: "/tienda",
  hero_imagen: "",

  // --- Textos de secciones ----------------------------------------------
  categorias_titulo: "Nuestras",
  categorias_titulo_cursiva: "categorías",
  categorias_texto:
    "Cada pieza se pinta y se termina a mano, una por una, en el taller.",
  destacados_titulo: "Lo más",
  destacados_titulo_cursiva: "elegido",
  ofertas_titulo: "Ofertas de la",
  ofertas_titulo_cursiva: "semana",
  combos_titulo: "Sets para",
  combos_titulo_cursiva: "regalar",
  antes_despues_titulo: "Antes y",
  antes_despues_titulo_cursiva: "después",
  antes_despues_texto:
    "Muebles y objetos que recuperaron su historia en el taller. Deslizá para ver el cambio.",
  eventos_titulo: "Eventos y",
  eventos_titulo_cursiva: "bodas",
  eventos_texto: "Ambientaciones, mesas y souvenirs pensados para cada celebración.",
  trabajos_titulo: "Nuestros",
  trabajos_titulo_cursiva: "trabajos",
  trabajos_texto:
    "Muebles restaurados, piezas recicladas y eventos ambientados en Miramar, Mar del Plata y zona.",
  faq_titulo: "Preguntas",
  faq_titulo_cursiva: "frecuentes",
  newsletter_titulo: "Sumate a Casa Rústica",
  newsletter_texto: "Recibí novedades, piezas nuevas y las fechas de los próximos talleres.",

  nosotros_titulo: "Sobre",
  nosotros_titulo_cursiva: "Casa Rústica",
  nosotros_subtitulo: "Diseño con",
  nosotros_subtitulo_cursiva: "alma",
  nosotros_imagen: "",
  nosotros_texto:
    "Casa Rústica es el taller de Silvina Scalzo en Miramar. Profesora de Arte Mix Media, pinta, recicla y restaura muebles y objetos, y crea piezas de deco para el hogar y para eventos.\n\nCada bandeja, lata o cartel se pinta y se termina a mano, con técnicas que van del efecto madera al zincado y el mármol. La idea es siempre la misma: dar nueva vida a lo que parecía perdido.",

  // --- Contacto y redes --------------------------------------------------
  whatsapp_numero: "5492291000000",
  whatsapp_mensaje: "¡Hola Silvina! Quería hacerte una consulta",
  instagram_url: "https://www.instagram.com/casarustica.deco",
  facebook_url: "",
  email_contacto: "",

  // --- Pagos -------------------------------------------------------------
  pago_transferencia_activo: "true",
  pago_mercadopago_activo: "false",
  transferencia_titular: "",
  transferencia_alias: "",
  transferencia_cbu: "",
  transferencia_banco: "",

  // --- Envíos ------------------------------------------------------------
  envio_costo: "0",
  envio_gratis_desde: "0",
  pedido_minimo: "0",
  retiro_activo: "true",
  retiro_direccion: "",
  zona_delivery_titulo: "Zona de",
  zona_delivery_titulo_cursiva: "entrega",
  zona_delivery_texto:
    "Trabajamos en Miramar, Mar del Plata y zona. Podés retirar por el showroom o coordinar el envío por WhatsApp.",
  mapa_embed_url: "",
} satisfies Record<string, string>;

export type ClaveAjuste = keyof typeof AJUSTES_POR_DEFECTO;

/** Lee un ajuste con su valor por defecto como respaldo. */
export function ajuste(ajustes: Settings, clave: ClaveAjuste) {
  const valor = ajustes[clave];
  if (valor === undefined || valor === null || valor === "") {
    return AJUSTES_POR_DEFECTO[clave];
  }
  return valor;
}

/** Igual que `ajuste` pero devuelve "" si no hay valor guardado (sin default). */
export function ajusteCrudo(ajustes: Settings, clave: ClaveAjuste) {
  return ajustes[clave] ?? "";
}

export function esVerdadero(valor: string | undefined) {
  return valor === "true" || valor === "1" || valor === "on";
}

export function aNumero(valor: string | undefined, porDefecto = 0) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : porDefecto;
}

/** Normaliza un número de WhatsApp a solo dígitos (formato wa.me). */
export function normalizarWhatsapp(numero: string) {
  return numero.replace(/\D/g, "");
}

export function linkWhatsapp(numero: string, mensaje: string) {
  const limpio = normalizarWhatsapp(numero);
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
