import type { Metadata } from "next";

import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { TarjetaAntesDespues, TarjetaEvento } from "@/components/trabajos/tarjetas";
import { estilosBoton } from "@/components/ui/boton";
import { IconoWhatsapp, Isotipo } from "@/components/ui/marca";
import { getAjustes, getAntesDespues, getEventos } from "@/lib/db";
import { ajuste, linkWhatsapp } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Trabajos",
  description:
    "Muebles restaurados, piezas recicladas y eventos ambientados por Casa Rústica en Miramar, Mar del Plata y zona.",
};

export default async function PaginaTrabajos() {
  const [ajustes, trabajos, eventos] = await Promise.all([
    getAjustes(),
    getAntesDespues(),
    getEventos(),
  ]);

  const whatsapp = linkWhatsapp(
    ajuste(ajustes, "whatsapp_numero"),
    "¡Hola Silvina! Vi sus trabajos en la web y quería consultarte por",
  );

  return (
    <>
      <CabeceraPagina
        titulo={ajuste(ajustes, "trabajos_titulo")}
        tituloCursiva={ajuste(ajustes, "trabajos_titulo_cursiva")}
        texto={ajuste(ajustes, "trabajos_texto")}
        migas={[{ href: "/trabajos", texto: "Trabajos" }]}
      />

      {trabajos.length === 0 && eventos.length === 0 ? (
        <section className="contenedor py-16">
          <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-14 text-center">
            <Isotipo className="h-10 w-10" />
            <p className="text-sm leading-relaxed text-carbon/75">
              Muy pronto vas a ver acá los muebles restaurados y los eventos que
              ambientamos. Mientras tanto, mirá nuestro Instagram o escribinos.
            </p>
          </div>
        </section>
      ) : null}

      {trabajos.length > 0 ? (
        <section id="antes-y-despues" className="contenedor scroll-mt-24 py-14 lg:py-20">
          <EncabezadoSeccion
            titulo={ajuste(ajustes, "antes_despues_titulo")}
            tituloCursiva={ajuste(ajustes, "antes_despues_titulo_cursiva")}
            texto={ajuste(ajustes, "antes_despues_texto")}
          />
          <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {trabajos.map((trabajo) => (
              <TarjetaAntesDespues key={trabajo.id} trabajo={trabajo} />
            ))}
          </div>
        </section>
      ) : null}

      {eventos.length > 0 ? (
        <section id="eventos" className="scroll-mt-24 bg-lino py-14 lg:py-20">
          <div className="contenedor">
            <EncabezadoSeccion
              titulo={ajuste(ajustes, "eventos_titulo")}
              tituloCursiva={ajuste(ajustes, "eventos_titulo_cursiva")}
              texto={ajuste(ajustes, "eventos_texto")}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="contenedor py-14 text-center lg:py-20">
        <h2 className="titulo-seccion text-nogal">
          ¿Tenés algo para <span className="cursiva-marca">recuperar?</span>
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-carbon/70">
          Mandanos una foto del mueble o contanos de tu evento, y te pasamos un
          presupuesto.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("primario", "md", "mt-7")}
        >
          <IconoWhatsapp className="h-4 w-4" />
          Escribinos por WhatsApp
        </a>
      </section>
    </>
  );
}
