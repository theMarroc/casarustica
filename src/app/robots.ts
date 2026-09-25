import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Lo privado o personal de cada cliente no se indexa.
      disallow: ["/admin", "/api", "/auth", "/carrito", "/checkout", "/pedido", "/mi-cuenta", "/ingresar"],
    },
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}
