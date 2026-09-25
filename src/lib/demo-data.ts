import type {
  AntesDespues,
  Category,
  Combo,
  Evento,
  Offer,
  Product,
  Section,
  Servicio,
  Taller,
  ZonaEnvio,
} from "./types";

/**
 * Datos de demostración.
 * Se usan únicamente cuando todavía no hay Supabase configurado, para poder
 * ver y mostrar el diseño del sitio sin haber creado la base de datos.
 * En cuanto se completan las variables de entorno, esto deja de usarse.
 */

export const CATEGORIAS_DEMO: Category[] = [
  {
    id: "cat-bandejas",
    slug: "bandejas",
    name: "Bandejas",
    description: "Desayunadores, con manijas o con cajoncito, pintadas a mano.",
    image_url: null,
    sort_order: 1,
    is_active: true,
  },
  {
    id: "cat-latas-y-organizadores",
    slug: "latas-y-organizadores",
    name: "Latas y organizadores",
    description: "Latas de yerba, azúcar y café, y sets para la cocina.",
    image_url: null,
    sort_order: 2,
    is_active: true,
  },
  {
    id: "cat-souvenirs",
    slug: "souvenirs",
    name: "Souvenirs",
    description: "Mates, latas y kits personalizados para tu evento.",
    image_url: null,
    sort_order: 3,
    is_active: true,
  },
  {
    id: "cat-platos-de-sitio",
    slug: "platos-de-sitio",
    name: "Platos de sitio",
    description: "Para poner una mesa linda todos los días.",
    image_url: null,
    sort_order: 4,
    is_active: true,
  },
  {
    id: "cat-sets-decorativos",
    slug: "sets-decorativos",
    name: "Sets decorativos",
    description: "Técnicas de efecto madera, zincado y mármol.",
    image_url: null,
    sort_order: 5,
    is_active: true,
  },
  {
    id: "cat-carteleria-y-cuadros",
    slug: "carteleria-y-cuadros",
    name: "Cartelería y cuadros",
    description: "Carteles de bienvenida, relojes, cuadros y láminas.",
    image_url: null,
    sort_order: 6,
    is_active: true,
  },
  {
    id: "cat-tejidos-a-mano",
    slug: "tejidos-a-mano",
    name: "Tejidos a mano",
    description: "Camperitas y abrigos tejidos en colores suaves.",
    image_url: null,
    sort_order: 7,
    is_active: true,
  },
  {
    id: "cat-insumos-de-arte",
    slug: "insumos-de-arte",
    name: "Insumos de arte",
    description: "Pintura a la tiza, stencils y transfers.",
    image_url: null,
    sort_order: 8,
    is_active: true,
  },
];

function producto(
  parcial: Partial<Product> & Pick<Product, "id" | "slug" | "name" | "price">,
): Product {
  return {
    description: null,
    long_description: null,
    category_id: null,
    unit: null,
    stock: 10,
    track_stock: false,
    is_active: true,
    is_featured: false,
    sort_order: 0,
    created_at: new Date().toISOString(),
    fulfillment: "stock",
    lead_time: null,
    custom_fields: [],
    deposit_type: "none",
    deposit_value: 0,
    images: [],
    category: null,
    ...parcial,
  };
}

export const PRODUCTOS_DEMO: Product[] = [
  producto({
    id: "p-1",
    slug: "bandeja-desayunador-con-patas",
    name: "Bandeja desayunador con patas",
    description: "Madera pintada a mano, con patas plegables.",
    long_description:
      "Ideal para desayunar en la cama o servir en el living. Se pinta en el color que elijas y se termina con barniz para que dure.",
    category_id: "cat-bandejas",
    category: { id: "cat-bandejas", name: "Bandejas", slug: "bandejas" },
    price: 38000,
    unit: "unidad",
    is_featured: true,
    sort_order: 1,
  }),
  producto({
    id: "p-2",
    slug: "bandeja-con-manijas-estilo-azulejo",
    name: "Bandeja con manijas estilo azulejo",
    description: "Decorada con motivo de azulejos en celeste.",
    category_id: "cat-bandejas",
    category: { id: "cat-bandejas", name: "Bandejas", slug: "bandejas" },
    price: 29000,
    unit: "unidad",
    sort_order: 2,
  }),
  producto({
    id: "p-3",
    slug: "bandeja-con-cajoncito",
    name: "Bandeja con cajoncito multifunción",
    description: "Con un cajón para servilletas o cubiertos.",
    category_id: "cat-bandejas",
    category: { id: "cat-bandejas", name: "Bandejas", slug: "bandejas" },
    price: 42000,
    unit: "unidad",
    sort_order: 3,
  }),
  producto({
    id: "p-4",
    slug: "set-de-latas-yerba-azucar-cafe",
    name: "Set de latas yerba, azúcar y café",
    description: "Tres latas pintadas a mano para la cocina.",
    category_id: "cat-latas-y-organizadores",
    category: { id: "cat-latas-y-organizadores", name: "Latas y organizadores", slug: "latas-y-organizadores" },
    price: 24000,
    unit: "set x 3",
    is_featured: true,
    sort_order: 1,
  }),
  producto({
    id: "p-5",
    slug: "organizador-de-cocina",
    name: "Organizador de cocina pintado",
    description: "Para tener a mano cucharas, especias y trapos.",
    category_id: "cat-latas-y-organizadores",
    category: { id: "cat-latas-y-organizadores", name: "Latas y organizadores", slug: "latas-y-organizadores" },
    price: 19500,
    unit: "unidad",
    sort_order: 2,
  }),
  producto({
    id: "p-6",
    slug: "mate-de-madera-personalizado",
    name: "Mate de madera personalizado",
    description: "Con nombre o fecha, para souvenirs de eventos.",
    category_id: "cat-souvenirs",
    category: { id: "cat-souvenirs", name: "Souvenirs", slug: "souvenirs" },
    price: 7800,
    unit: "unidad",
    is_featured: true,
    sort_order: 1,
    fulfillment: "a_pedido",
    lead_time: "7 días",
    custom_fields: [
      {
        clave: "nombre-o-frase",
        etiqueta: "Nombre o frase",
        tipo: "texto",
        opciones: [],
        obligatorio: true,
        max: 25,
        ayuda: "Va grabado en el mate",
      },
    ],
  }),
  producto({
    id: "p-7",
    slug: "plato-de-sitio-celeste",
    name: "Plato de sitio celeste",
    description: "Pintado a mano, en el celeste de la casa.",
    category_id: "cat-platos-de-sitio",
    category: { id: "cat-platos-de-sitio", name: "Platos de sitio", slug: "platos-de-sitio" },
    price: 9500,
    unit: "unidad",
    sort_order: 1,
  }),
  producto({
    id: "p-8",
    slug: "set-efecto-madera-con-nudo",
    name: "Set efecto madera con nudo",
    description: "Técnica decorativa que imita la madera natural.",
    category_id: "cat-sets-decorativos",
    category: { id: "cat-sets-decorativos", name: "Sets decorativos", slug: "sets-decorativos" },
    price: 27000,
    unit: "set",
    sort_order: 1,
  }),
  producto({
    id: "p-9",
    slug: "cartel-de-bienvenida-para-boda",
    name: "Cartel de bienvenida para boda",
    description: "Personalizado con los nombres y la fecha.",
    category_id: "cat-carteleria-y-cuadros",
    category: { id: "cat-carteleria-y-cuadros", name: "Cartelería y cuadros", slug: "carteleria-y-cuadros" },
    price: 45000,
    unit: "unidad",
    is_featured: true,
    sort_order: 1,
    fulfillment: "a_pedido",
    lead_time: "10 a 15 días",
    deposit_type: "percent",
    deposit_value: 50,
    custom_fields: [
      {
        clave: "nombres",
        etiqueta: "Nombres",
        tipo: "texto",
        opciones: [],
        obligatorio: true,
        max: 40,
        ayuda: "Por ejemplo: Lucía y Martín",
      },
      {
        clave: "fecha-de-la-boda",
        etiqueta: "Fecha de la boda",
        tipo: "fecha",
        opciones: [],
        obligatorio: true,
        max: null,
        ayuda: "",
      },
      {
        clave: "color",
        etiqueta: "Color de las letras",
        tipo: "opciones",
        opciones: ["Blanco", "Dorado", "Celeste"],
        obligatorio: false,
        max: null,
        ayuda: "",
      },
    ],
  }),
  producto({
    id: "p-10",
    slug: "camperita-tejida-punto-trenza",
    name: "Camperita tejida con punto trenza",
    description: "Lana suave en lila o verde menta.",
    category_id: "cat-tejidos-a-mano",
    category: { id: "cat-tejidos-a-mano", name: "Tejidos a mano", slug: "tejidos-a-mano" },
    price: 32000,
    unit: "unidad",
    sort_order: 1,
  }),
  producto({
    id: "p-11",
    slug: "pintura-a-la-tiza",
    name: "Pintura a la tiza",
    description: "Para renovar muebles y objetos sin lijar.",
    category_id: "cat-insumos-de-arte",
    category: { id: "cat-insumos-de-arte", name: "Insumos de arte", slug: "insumos-de-arte" },
    price: 6500,
    sort_order: 1,
  }),
];

export const OFERTAS_DEMO: Offer[] = [
  {
    id: "of-1",
    name: "10% en bandejas",
    kind: "percent",
    value: 10,
    scope: "category",
    category_id: "cat-bandejas",
    product_id: null,
    label: null,
    starts_at: null,
    ends_at: null,
    is_active: true,
  },
];

export const COMBOS_DEMO: Combo[] = [
  {
    id: "combo-1",
    slug: "set-de-cocina",
    name: "Set de cocina",
    description: "Las tres latas y el organizador, en los mismos colores.",
    image_url: null,
    price: 39000,
    is_active: true,
    sort_order: 1,
    items: [
      { id: "ci-1", combo_id: "combo-1", product_id: "p-4", quantity: 1 },
      { id: "ci-2", combo_id: "combo-1", product_id: "p-5", quantity: 1 },
    ],
  },
  {
    id: "combo-2",
    slug: "kit-desayuno",
    name: "Kit desayuno",
    description: "Una bandeja desayunador y dos platos de sitio.",
    image_url: null,
    price: 52000,
    is_active: true,
    sort_order: 2,
    items: [
      { id: "ci-3", combo_id: "combo-2", product_id: "p-1", quantity: 1 },
      { id: "ci-4", combo_id: "combo-2", product_id: "p-7", quantity: 2 },
    ],
  },
];

export const SECCIONES_DEMO: Section[] = [
  { key: "hero", label: "Portada principal", description: null, is_enabled: true, sort_order: 1 },
  { key: "barra_beneficios", label: "Barra de beneficios", description: null, is_enabled: true, sort_order: 2 },
  { key: "categorias", label: "Categorías", description: null, is_enabled: true, sort_order: 3 },
  { key: "destacados", label: "Productos destacados", description: null, is_enabled: true, sort_order: 4 },
  { key: "ofertas", label: "Ofertas vigentes", description: null, is_enabled: true, sort_order: 5 },
  { key: "combos", label: "Sets y kits", description: null, is_enabled: true, sort_order: 6 },
  { key: "servicios", label: "Servicios", description: null, is_enabled: true, sort_order: 7 },
  { key: "antes_despues", label: "Antes y después", description: null, is_enabled: true, sort_order: 8 },
  { key: "talleres", label: "Talleres próximos", description: null, is_enabled: true, sort_order: 9 },
  { key: "eventos", label: "Eventos y bodas", description: null, is_enabled: true, sort_order: 10 },
  { key: "frase", label: "Franja con la frase", description: null, is_enabled: true, sort_order: 11 },
  { key: "mapa_delivery", label: "Zona de entrega", description: null, is_enabled: true, sort_order: 12 },
  { key: "faq", label: "Preguntas frecuentes", description: null, is_enabled: true, sort_order: 13 },
  { key: "newsletter", label: "Newsletter", description: null, is_enabled: true, sort_order: 14 },
];

export const BENEFICIOS_DEMO = [
  { id: "b-1", icon: "corazon", title: "Hecho a mano", subtitle: "con amor", sort_order: 1, is_active: true },
  { id: "b-2", icon: "pincel", title: "Piezas únicas", subtitle: "y personalizadas", sort_order: 2, is_active: true },
  { id: "b-3", icon: "casa", title: "Showroom", subtitle: "en Miramar", sort_order: 3, is_active: true },
  { id: "b-4", icon: "tarjeta", title: "Todos los medios", subtitle: "de pago", sort_order: 4, is_active: true },
];

export const FAQS_DEMO = [
  {
    id: "f-1",
    question: "¿Hacen piezas personalizadas?",
    answer:
      "Sí. Muchas piezas se hacen a pedido, con nombres, fechas o los colores que elijas. Escribinos por WhatsApp y lo charlamos.",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "f-2",
    question: "¿Cuánto tarda un pedido?",
    answer:
      "Lo que está en stock te lo llevás enseguida. Las piezas a pedido llevan unos días de trabajo en el taller: te avisamos la demora antes de confirmar.",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "f-3",
    question: "¿Cómo puedo pagar?",
    answer:
      "Con transferencia o con Mercado Pago. Si elegís transferencia, te pedimos el comprobante para confirmar el pedido.",
    sort_order: 3,
    is_active: true,
  },
  {
    id: "f-4",
    question: "¿Dónde retiro mi pedido?",
    answer:
      "Podés retirarlo por el showroom en Miramar o coordinar el envío. Trabajamos en Miramar, Mar del Plata y zona.",
    sort_order: 4,
    is_active: true,
  },
];

// Sin fotos: el comparador y las tarjetas muestran sus rellenos de ejemplo.
export const ANTES_DESPUES_DEMO: AntesDespues[] = [
  {
    id: "ad-1",
    title: "Cómoda de los años 60",
    description: "Lijada, pintada a la tiza y con herrajes nuevos.",
    before_url: "",
    after_url: "",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "ad-2",
    title: "Silla de la abuela",
    description: "Estructura reforzada, efecto madera y tapizado nuevo.",
    before_url: "",
    after_url: "",
    sort_order: 2,
    is_active: true,
  },
];

export const EVENTOS_DEMO: Evento[] = [
  {
    id: "ev-1",
    slug: "boda-en-el-campo",
    title: "Boda en el campo",
    kind: "Boda",
    event_date: null,
    place: "Miramar",
    description:
      "Mesas vintage blancas, cartel de bienvenida y centros con hortensias en latas.",
    sort_order: 1,
    is_active: true,
    images: [],
  },
  {
    id: "ev-2",
    slug: "cumpleanos-de-15",
    title: "Cumpleaños de 15",
    kind: "Cumpleaños",
    event_date: null,
    place: "Mar del Plata",
    description: "Souvenirs personalizados y ambientación en tonos pastel.",
    sort_order: 2,
    is_active: true,
    images: [],
  },
];

export const ZONAS_DEMO: ZonaEnvio[] = [
  { id: "z-1", name: "Miramar", cost: null, sort_order: 1, is_active: true },
  { id: "z-2", name: "Mar del Plata", cost: null, sort_order: 2, is_active: true },
  { id: "z-3", name: "Otra localidad", cost: null, sort_order: 3, is_active: true },
];

export const SERVICIOS_DEMO: Servicio[] = [
  {
    id: "sv-1",
    slug: "restauracion",
    name: "Restauración y reciclado",
    summary: "Muebles y cuadros que recuperan su historia. Mandanos fotos y te pasamos presupuesto.",
    description:
      "Restauramos, reciclamos y pintamos muebles, cuadros y objetos: lijado, pintura a la tiza, efectos decorativos y herrajes nuevos.\n\nContanos qué tenés, mandanos fotos y las medidas, y te pasamos un presupuesto.",
    image_url: null,
    asks_photos: true,
    asks_measures: true,
    asks_date: false,
    showcase: "antes_despues",
    sort_order: 1,
    is_active: true,
  },
  {
    id: "sv-2",
    slug: "ambientacion",
    name: "Ambientación de eventos",
    summary: "Bodas, cumpleaños y celebraciones: mesas, cartelería, centros y souvenirs.",
    description:
      "Ambientamos tu evento con mesas vintage, cartelería de bienvenida, centros de mesa y souvenirs personalizados.\n\nContanos la fecha, el lugar y la idea que tenés, y armamos una propuesta.",
    image_url: null,
    asks_photos: true,
    asks_measures: false,
    asks_date: true,
    showcase: "eventos",
    sort_order: 2,
    is_active: true,
  },
  {
    id: "sv-3",
    slug: "asesoria",
    name: "Asesoría de estilo",
    summary:
      "Te ayudamos a definir el estilo de tu casa: colores, iluminación y deco para cada ambiente.",
    description:
      "Te acompañamos a definir el estilo de tu casa o de un ambiente: paleta de colores, iluminación, muebles y detalles de deco.\n\nMandanos fotos del lugar y contanos qué te gustaría lograr.",
    image_url: null,
    asks_photos: true,
    asks_measures: false,
    asks_date: false,
    showcase: "none",
    sort_order: 3,
    is_active: true,
  },
];

/** Fechas relativas a hoy, para que la demo siempre tenga fechas próximas. */
const enDias = (dias: number, hora: number) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(hora, 0, 0, 0);
  return fecha.toISOString();
};

// Precios y horarios de ejemplo: los reales los carga Silvina.
export const TALLERES_DEMO: Taller[] = [
  {
    id: "tl-1",
    slug: "taller-de-decoracion",
    kind: "taller",
    name: "Taller de decoración y técnicas múltiples",
    summary:
      "Pintura a la tiza, efectos decorativos y renovación de muebles y objetos, en grupos chicos.",
    description:
      "Un espacio para aprender técnicas de pintura y decoración: pintura a la tiza, efecto madera, zincado y mármol, stencils y transfers, y renovación de muebles y objetos.\n\nCada encuentro trabajás sobre tu propia pieza, con acompañamiento de Silvina.",
    duration: "4 encuentros de 2 horas (ejemplo)",
    includes_materials: true,
    materials_note: null,
    image_url: null,
    sort_order: 1,
    is_active: true,
    sessions: [
      {
        id: "tf-1",
        workshop_id: "tl-1",
        starts_at: enDias(12, 18),
        schedule: "Martes de 18 a 20 (ejemplo)",
        capacity: 8,
        price: 40000,
        price_note: "Precio de ejemplo",
        deposit_type: "percent",
        deposit_value: 30,
        is_open: true,
        tomados: 5,
      },
      {
        id: "tf-2",
        workshop_id: "tl-1",
        starts_at: enDias(26, 10),
        schedule: "Sábados de 10 a 12 (ejemplo)",
        capacity: 6,
        price: 40000,
        price_note: "Precio de ejemplo",
        deposit_type: "percent",
        deposit_value: 30,
        is_open: true,
        tomados: 6,
      },
    ],
  },
  {
    id: "tl-2",
    slug: "profesorado-arte-mix-media",
    kind: "profesorado",
    name: "Profesorado de Arte Mix Media",
    summary: "Formación para enseñar técnicas de arte decorativo y mix media.",
    description:
      "Una formación para quienes quieren enseñar o profundizar en las técnicas de arte decorativo y mix media.\n\nConsultanos por la duración y el programa.",
    duration: null,
    includes_materials: false,
    materials_note: "Los materiales se compran aparte.",
    image_url: null,
    sort_order: 2,
    is_active: true,
    sessions: [
      {
        id: "tf-3",
        workshop_id: "tl-2",
        starts_at: enDias(40, 17),
        schedule: "Un jueves por semana (ejemplo)",
        capacity: 10,
        price: 60000,
        price_note: "Matrícula de ejemplo. Las cuotas se pagan en el taller.",
        deposit_type: "none",
        deposit_value: 0,
        is_open: true,
        tomados: 2,
      },
    ],
  },
];
