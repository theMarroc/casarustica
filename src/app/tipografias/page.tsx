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

import { estilosBoton } from "@/components/ui/boton";
import { Isotipo } from "@/components/ui/marca";

// Página temporal para elegir la combinación de tipografías. Se borra al decidir.

export const metadata: Metadata = {
  title: "Muestra de tipografías",
  robots: { index: false, follow: false },
};

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"] });
const allura = Allura({ subsets: ["latin"], weight: "400" });
const nunito = Nunito_Sans({ subsets: ["latin"] });

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"] });
const parisienne = Parisienne({ subsets: ["latin"], weight: "400" });
const mulish = Mulish({ subsets: ["latin"] });

const lora = Lora({ subsets: ["latin"], weight: ["500", "600"] });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400" });
const workSans = Work_Sans({ subsets: ["latin"] });

const OPCIONES = [
  {
    letra: "A",
    nombre: "Cormorant Garamond + Allura + Nunito Sans",
    nota: "La más parecida al logo: fina y elegante. Cormorant luce en títulos grandes y pierde en tamaños chicos.",
    titulos: cormorant.style.fontFamily,
    manuscrita: allura.style.fontFamily,
    texto: nunito.style.fontFamily,
    peso: 500,
  },
  {
    letra: "B",
    nombre: "Fraunces + Parisienne + Mulish",
    nota: "Más cálida y artesanal. Fraunces tiene cuerpo y se lee bien también en subtítulos.",
    titulos: fraunces.style.fontFamily,
    manuscrita: parisienne.style.fontFamily,
    texto: mulish.style.fontFamily,
    peso: 400,
  },
  {
    letra: "C",
    nombre: "Lora + Great Vibes + Work Sans",
    nota: "La más sobria y legible. Menos personalidad, cero riesgo.",
    titulos: lora.style.fontFamily,
    manuscrita: greatVibes.style.fontFamily,
    texto: workSans.style.fontFamily,
    peso: 500,
  },
];

export default function MuestraTipografias() {
  return (
    <main className="min-h-dvh bg-hueso py-10">
      <div className="contenedor">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-piedra-oscura">
          Casa Rústica · muestra de tipografías
        </p>
        <h1 className="mt-2 font-display text-3xl text-nogal">
          Tres combinaciones con la misma paleta
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-carbon/75">
          Cada una tiene una letra para títulos, una manuscrita para las palabras de
          acento y otra para el texto. Elegí la que más te guste (y a tu mamá).
        </p>

        <div className="mt-10 flex flex-col gap-10">
          {OPCIONES.map((opcion) => (
            <section
              key={opcion.letra}
              className="overflow-hidden rounded-marca border border-piedra/30 bg-white shadow-suave"
              style={{ fontFamily: opcion.texto }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-piedra/25 bg-carbon px-5 py-3 text-hueso">
                <p className="text-sm font-semibold">
                  Opción {opcion.letra}: {opcion.nombre}
                </p>
                <p className="text-xs text-hueso/70">{opcion.nota}</p>
              </div>

              <div className="flex items-center justify-between border-b border-piedra/25 bg-lino px-5 py-3">
                <span className="inline-flex flex-col items-center leading-none">
                  <span
                    className="whitespace-nowrap text-[2.1rem] leading-[0.85] text-nogal"
                    style={{ fontFamily: opcion.manuscrita }}
                  >
                    Casa Rústica
                  </span>
                  <span className="mt-1 pl-[0.4em] text-[9px] font-semibold uppercase tracking-[0.4em] text-piedra-oscura">
                    Deco Home
                  </span>
                </span>
                <span className="hidden gap-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-carbon/60 sm:flex">
                  <span className="text-carbon">Inicio</span>
                  <span>Tienda</span>
                  <span>Sets y kits</span>
                  <span>Nosotros</span>
                </span>
              </div>

              <div className="grid gap-8 px-5 py-8 lg:grid-cols-[1.3fr_1fr] lg:px-10">
                <div>
                  <h2
                    className="text-[clamp(2.1rem,1.5rem+2.6vw,3.6rem)] leading-[1.08] text-nogal"
                    style={{ fontFamily: opcion.titulos, fontWeight: opcion.peso }}
                  >
                    Diseño con alma,
                    <br />
                    <span
                      className="text-[1.3em] leading-[0.9] text-acento-fuerte"
                      style={{ fontFamily: opcion.manuscrita, fontWeight: 400 }}
                    >
                      hecho a mano.
                    </span>
                  </h2>
                  <span className="linea-decorativa mt-6" />
                  <p className="mt-6 max-w-md text-[15px] leading-relaxed text-carbon/75">
                    Bandejas, latas, cartelería y deco para tu casa, pintadas y
                    terminadas a mano en nuestro taller de Miramar.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <span
                      className={estilosBoton("primario", "md")}
                      style={{ fontFamily: opcion.texto }}
                    >
                      Ver la tienda
                    </span>
                    <span
                      className={estilosBoton("secundario", "md")}
                      style={{ fontFamily: opcion.texto }}
                    >
                      Ver sets y kits
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <h3
                    className="text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)] leading-[1.1] text-nogal"
                    style={{ fontFamily: opcion.titulos, fontWeight: opcion.peso }}
                  >
                    Nuestras{" "}
                    <span
                      className="text-[1.3em] leading-[0.9] text-acento-fuerte"
                      style={{ fontFamily: opcion.manuscrita, fontWeight: 400 }}
                    >
                      categorías
                    </span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["Bandeja desayunador con patas", "$ 38.000", "Bandejas"],
                      ["Set de latas yerba, azúcar y café", "$ 24.000", "Latas"],
                    ].map(([nombre, precio, categoria], indice) => (
                      <div
                        key={nombre}
                        className="overflow-hidden rounded-marca border border-piedra/25 bg-hueso"
                      >
                        <div
                          className="flex aspect-4/5 items-center justify-center"
                          style={{
                            background:
                              indice === 0
                                ? "linear-gradient(150deg, var(--color-lino) 15%, var(--color-arena) 100%)"
                                : "linear-gradient(150deg, var(--color-hueso) 15%, var(--color-acento) 100%)",
                          }}
                        >
                          <Isotipo className="h-9 w-9 text-white/80" />
                        </div>
                        <div className="p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-piedra-oscura">
                            {categoria}
                          </p>
                          <p
                            className="mt-1 text-lg leading-snug text-carbon"
                            style={{ fontFamily: opcion.titulos, fontWeight: opcion.peso }}
                          >
                            {nombre}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-nogal">{precio}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm leading-relaxed text-carbon/70">
                    ¿Hacen piezas personalizadas? Sí. Muchas piezas se hacen a pedido,
                    con nombres, fechas o los colores que elijas.
                  </p>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
