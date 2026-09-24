import type { Metadata } from "next";
import { Allura, Cormorant_Garamond, Nunito_Sans } from "next/font/google";

import { getAjustes } from "@/lib/db";
import { ajuste } from "@/lib/settings";

import "./globals.css";

const titulos = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-titulos",
  display: "swap",
});

const manuscrita = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-manuscrita",
  display: "swap",
});

const texto = Nunito_Sans({
  subsets: ["latin"],
  variable: "--font-texto",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const ajustes = await getAjustes();
  const nombre = ajuste(ajustes, "marca_nombre");
  const descripcion = ajuste(ajustes, "hero_texto");
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  const titulo = `${nombre} | Deco hogar y arte hecho a mano`;

  return {
    title: {
      default: titulo,
      template: `%s | ${nombre}`,
    },
    description: descripcion,
    ...(base ? { metadataBase: new URL(base) } : {}),
    openGraph: {
      title: titulo,
      description: descripcion,
      type: "website",
      locale: "es_AR",
      siteName: nombre,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${titulos.variable} ${manuscrita.variable} ${texto.variable}`}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
