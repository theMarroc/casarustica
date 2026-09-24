import type { Category, Combo, Offer, Product, Section } from "./types";

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
  { key: "carrusel", label: "Carrusel de fotos", description: null, is_enabled: true, sort_order: 7 },
  { key: "frase", label: "Franja con la frase", description: null, is_enabled: true, sort_order: 8 },
  { key: "mapa_delivery", label: "Zona de entrega", description: null, is_enabled: true, sort_order: 9 },
  { key: "faq", label: "Preguntas frecuentes", description: null, is_enabled: true, sort_order: 10 },
  { key: "newsletter", label: "Newsletter", description: null, is_enabled: true, sort_order: 11 },
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
