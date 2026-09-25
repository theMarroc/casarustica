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
  servicios_titulo: "Nuestros",
  servicios_titulo_cursiva: "servicios",
  servicios_texto:
    "Restauramos, ambientamos y te asesoramos. Contanos qué necesitás y te pasamos un presupuesto.",
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
  talleres_titulo: "Próximos",
  talleres_titulo_cursiva: "talleres",
  talleres_texto:
    "Clases, workshops y el profesorado de Arte Mix Media en el taller Azul Tiffany, en Miramar.",
  newsletter_titulo: "Sumate a Casa Rústica",
  newsletter_texto: "Recibí novedades, piezas nuevas y las fechas de los próximos talleres.",

  nosotros_titulo: "Sobre",
  nosotros_titulo_cursiva: "Casa Rústica",
  nosotros_subtitulo: "Diseño con",
  nosotros_subtitulo_cursiva: "alma",
  nosotros_imagen: "",
  nosotros_texto:
    "Casa Rústica es el taller de Silvina Scalzo en Miramar. Profesora de Arte Mix Media, pinta, recicla y restaura muebles y objetos, y crea piezas de deco para el hogar y para eventos.\n\nCada bandeja, lata o cartel se pinta y se termina a mano, con técnicas que van del efecto madera al zincado y el mármol. La idea es siempre la misma: dar nueva vida a lo que parecía perdido.",

  // --- Taller Azul Tiffany ----------------------------------------------
  taller_nombre: "Azul Tiffany",
  taller_bajada: "Espacio de arte",
  taller_titulo: "Taller de arte",
  taller_titulo_cursiva: "Azul Tiffany",
  taller_texto:
    "Talleres, workshops, clases intensivas y el profesorado de Arte Mix Media. Aprendés técnicas de pintura y decoración, y te llevás tu pieza terminada.",
  taller_imagen: "",
  // Horas que una inscripción sin pagar guarda el lugar (lo lee también la base).
  taller_reserva_horas: "48",

  // --- Contacto y redes --------------------------------------------------
  whatsapp_numero: "5492291000000",
  whatsapp_mensaje: "¡Hola Silvina! Quería hacerte una consulta",
  instagram_url: "https://www.instagram.com/casarustica.deco",
  facebook_url: "",
  email_contacto: "",

  // --- Pagos -------------------------------------------------------------
  pago_transferencia_activo: "true",
  pago_mercadopago_activo: "false",
  pago_efectivo_activo: "true",
  transferencia_titular: "",
  transferencia_alias: "",
  transferencia_cbu: "",
  transferencia_banco: "",

  // --- Envíos ------------------------------------------------------------
  // Los costos de envío van por zona (tabla shipping_zones).
  envio_condiciones: "",
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

/**
 * Como `ajuste`, pero si se guardó vacío queda vacío: sirve para lo que se
 * puede sacar del sitio (por ejemplo, el link de Instagram).
 */
export function ajusteQuitable(ajustes: Settings, clave: ClaveAjuste) {
  return clave in ajustes ? ajustes[clave] : AJUSTES_POR_DEFECTO[clave];
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

/**
 * Lleva un número al formato de wa.me. Los argentinos llegan de mil maneras
 * (0223 15 555-1234, 2291 50 0000, +54 9 11...) y wa.me los necesita como
 * 549 + característica sin 0 + número sin 15. Lo que no encaja queda en dígitos.
 */
export function normalizarWhatsapp(numero: string) {
  const crudo = numero.replace(/\D/g, "").replace(/^00/, "");
  let digitos = crudo;
  if (digitos.startsWith("54")) digitos = digitos.slice(2);
  if (digitos.startsWith("9") && (digitos.length === 11 || digitos.length === 13)) {
    digitos = digitos.slice(1);
  }
  digitos = digitos.replace(/^0/, "");
  if (digitos.length === 12) {
    const corte = [2, 3, 4].find((i) => digitos.slice(i, i + 2) === "15");
    if (corte !== undefined) digitos = digitos.slice(0, corte) + digitos.slice(corte + 2);
  }
  return digitos.length === 10 ? `549${digitos}` : crudo;
}

export function linkWhatsapp(numero: string, mensaje: string) {
  const limpio = normalizarWhatsapp(numero);
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
