import type { Metadata } from "next";
import Image from "next/image";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { TarjetaFecha, TarjetaTaller } from "@/components/taller/tarjetas";
import { estilosBoton } from "@/components/ui/boton";
import { IconoWhatsapp, LogoTaller, Ornamento, PlaceholderImagen } from "@/components/ui/marca";
import { getAjustes, getTalleres } from "@/lib/db";
import { ajuste, ajusteCrudo, linkWhatsapp } from "@/lib/settings";
import { proximasFechas } from "@/lib/talleres";

export async function generateMetadata(): Promise<Metadata> {
  const ajustes = await getAjustes();
  return {
    title: `Taller ${ajuste(ajustes, "taller_nombre")}`,
    description: ajuste(ajustes, "taller_texto"),
  };
}

export default async function PaginaTaller() {
  const [ajustes, talleres] = await Promise.all([getAjustes(), getTalleres()]);

  const fechas = proximasFechas(talleres, 12);
  const clases = talleres.filter((t) => t.kind === "taller");
  const profesorado = talleres.filter((t) => t.kind === "profesorado");
  const imagen = ajusteCrudo(ajustes, "taller_imagen");
  const consulta = linkWhatsapp(
    ajuste(ajustes, "whatsapp_numero"),
    "¡Hola Silvina! Quería consultarte por los talleres.",
  );

  return (
    <>
      <section className="border-b border-piedra/25 bg-lino">
        <div className="contenedor grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-16 lg:py-16">
          <div className="flex flex-col items-start">
            <LogoTaller
              nombre={ajuste(ajustes, "taller_nombre")}
              bajada={ajuste(ajustes, "taller_bajada")}
              logoUrl={ajusteCrudo(ajustes, "logo_taller_url") || undefined}
            />
            <h1 className="titulo-seccion mt-8 text-nogal">
              {ajuste(ajustes, "taller_titulo")}{" "}
              <span className="cursiva-marca">{ajuste(ajustes, "taller_titulo_cursiva")}</span>
            </h1>
            <span className="linea-decorativa mt-5" />
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-carbon/75">
              {ajuste(ajustes, "taller_texto")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#fechas" className={estilosBoton("primario", "md")}>
                Ver próximas fechas
              </a>
              <a href={consulta} target="_blank" rel="noreferrer" className={estilosBoton("secundario", "md")}>
                <IconoWhatsapp className="h-4 w-4" />
                Consultar
              </a>
            </div>
          </div>

          <div className="relative aspect-4/3 overflow-hidden rounded-marca bg-arena/20">
            {imagen ? (
              <Image
                src={imagen}
                alt={`Taller ${ajuste(ajustes, "taller_nombre")}`}
                fill
                priority
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderImagen texto="Taller de arte" mariposa />
            )}
          </div>
        </div>
      </section>

      <section id="fechas" className="scroll-mt-24 py-16 lg:py-20">
        <div className="contenedor">
          <EncabezadoSeccion titulo="Próximas" tituloCursiva="fechas" />
          {fechas.length > 0 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {fechas.map(({ taller, fecha }) => (
                <TarjetaFecha key={fecha.id} taller={taller} fecha={fecha} />
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-xl text-sm leading-relaxed text-carbon/70">
              Estamos armando las próximas fechas. Mirá los talleres de abajo y dejanos tus
              datos en el que te guste: te avisamos apenas haya fecha.
            </p>
          )}
        </div>
      </section>

      {clases.length > 0 ? (
        <section className="bg-hueso py-16 lg:py-20">
          <div className="contenedor">
            <EncabezadoSeccion titulo="Talleres y" tituloCursiva="clases" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {clases.map((taller) => (
                <TarjetaTaller key={taller.id} taller={taller} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {profesorado.length > 0 ? (
        <section className="bg-lino py-16 lg:py-20">
          <div className="contenedor">
            <EncabezadoSeccion
              titulo="Formación"
              tituloCursiva="profesional"
              texto="Para quienes quieren enseñar o profundizar en las técnicas."
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {profesorado.map((taller) => (
                <TarjetaTaller key={taller.id} taller={taller} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 text-center lg:py-20">
        <div className="contenedor flex flex-col items-center">
          <Ornamento mariposa />
          <p className="mt-5 max-w-md font-display text-2xl leading-snug text-nogal">
            ¿Buscás una clase para tu grupo o una fecha que no está?
          </p>
          <a
            href={consulta}
            target="_blank"
            rel="noreferrer"
            className={estilosBoton("primario", "md", "mt-6")}
          >
            <IconoWhatsapp className="h-4 w-4" />
            Escribinos
          </a>
        </div>
      </section>
    </>
  );
}
