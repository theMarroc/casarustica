import type { Metadata } from "next";
import {
  Allura,
  Cormorant_Garamond,
  Fraunces,
  Great_Vibes,
  Lora,
  Mulish,
  Nunito_Sans,
  Parisienne,
  Work_Sans,
} from "next/font/google";

import { estiloValido, letraValida } from "@/lib/apariencia";
import { getAjustes } from "@/lib/db";
import { ajuste } from "@/lib/settings";

import "./globals.css";

// Se declaran las tres combinaciones porque se eligen desde el panel. Sin
// precarga: el navegador solo baja las que la página usa de verdad.

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--f-cormorant",
  display: "swap",
  preload: false,
});
const allura = Allura({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-allura",
  display: "swap",
  preload: false,
});
const nunito = Nunito_Sans({
  subsets: ["latin"],
  variable: "--f-nunito",
  display: "swap",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-fraunces",
  display: "swap",
  preload: false,
});
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-parisienne",
  display: "swap",
  preload: false,
});
const mulish = Mulish({
  subsets: ["latin"],
  variable: "--f-mulish",
  display: "swap",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--f-lora",
  display: "swap",
  preload: false,
});
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--f-greatvibes",
  display: "swap",
  preload: false,
});
const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--f-worksans",
  display: "swap",
  preload: false,
});

const FUENTES = [
  cormorant,
  allura,
  nunito,
  fraunces,
  parisienne,
  mulish,
  lora,
  greatVibes,
  workSans,
]
  .map((fuente) => fuente.variable)
  .join(" ");

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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ajustes = await getAjustes();

  return (
    <html
      lang="es"
      data-letra={letraValida(ajustes.apariencia_letra)}
      data-estilo={estiloValido(ajustes.apariencia_estilo)}
      className={FUENTES}
    >
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
