import type { MetadataRoute } from "next";

import { getCombos, getEventos, getProductos, getServicios, getTalleres } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [productos, combos, eventos, servicios, talleres] = await Promise.all([
    getProductos(),
    getCombos(),
    getEventos(),
    getServicios(),
    getTalleres(),
  ]);

  const fijas = ["", "/tienda", "/sets", "/servicios", "/taller", "/trabajos", "/nosotros", "/contacto"];

  return [
    ...fijas.map((ruta) => ({ url: `${base}${ruta}`, priority: ruta === "" ? 1 : 0.8 })),
    ...productos.map((p) => ({ url: `${base}/producto/${p.slug}`, priority: 0.7 })),
    ...combos.map((c) => ({ url: `${base}/sets/${c.slug}`, priority: 0.6 })),
    ...servicios.map((s) => ({ url: `${base}/servicios/${s.slug}`, priority: 0.7 })),
    ...talleres.map((t) => ({ url: `${base}/taller/${t.slug}`, priority: 0.7 })),
    ...eventos.map((e) => ({ url: `${base}/trabajos/${e.slug}`, priority: 0.5 })),
  ];
}
