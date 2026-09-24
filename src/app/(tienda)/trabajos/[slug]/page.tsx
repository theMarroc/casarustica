import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { GaleriaProducto } from "@/components/shop/galeria-producto";
import { DatosEvento, TarjetaEvento } from "@/components/trabajos/tarjetas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes, getEvento, getEventos } from "@/lib/db";
import { ajuste, linkWhatsapp } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEvento(slug);

  if (!evento) return { title: "Evento no encontrado" };

  const descripcion = evento.description?.slice(0, 160) ?? undefined;
  return {
    title: evento.title,
    description: descripcion,
    openGraph: {
      title: evento.title,
      description: descripcion,
      images: evento.images[0]?.url ? [evento.images[0].url] : undefined,
    },
  };
}

export default async function PaginaEvento({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [evento, ajustes, todos] = await Promise.all([
    getEvento(slug),
    getAjustes(),
    getEventos(),
  ]);

  if (!evento || !evento.is_active) notFound();

  const otros = todos.filter((e) => e.id !== evento.id).slice(0, 3);

  return (
    <>
      <div className="contenedor pt-8">
        <nav
          aria-label="Ubicación"
          className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-piedra-oscura"
        >
          <Link href="/" className="transition-colors hover:text-nogal">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/trabajos" className="transition-colors hover:text-nogal">
            Trabajos
          </Link>
        </nav>
      </div>

      <article className="contenedor grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <GaleriaProducto imagenes={evento.images} nombre={evento.title} />

        <div className="flex flex-col">
          {evento.kind ? (
            <Insignia className="mb-3 self-start bg-acento text-carbon">{evento.kind}</Insignia>
          ) : null}

          <h1 className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-tight text-nogal">
            {evento.title}
          </h1>

          <div className="mt-3">
            <DatosEvento evento={evento} />
          </div>

          <span className="linea-decorativa mt-5" />

          {evento.description ? (
            <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-carbon/75">
              {evento.description.split(/\n{2,}/).map((parrafo, indice) => (
                <p key={indice}>{parrafo}</p>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={linkWhatsapp(
                ajuste(ajustes, "whatsapp_numero"),
                `¡Hola Silvina! Vi el evento "${evento.title}" en la web y quería consultarte por el mío.`,
              )}
              target="_blank"
              rel="noreferrer"
              className={estilosBoton("primario", "md")}
            >
              <IconoWhatsapp className="h-4 w-4" />
              Quiero algo así
            </a>
            <Link href="/trabajos" className={estilosBoton("secundario", "md")}>
              <ArrowLeft className="h-4 w-4" />
              Todos los trabajos
            </Link>
          </div>
        </div>
      </article>

      {otros.length > 0 ? (
        <section className="bg-lino py-14 lg:py-20">
          <div className="contenedor">
            <h2 className="titulo-seccion text-nogal">
              Otros <span className="cursiva-marca">eventos</span>
            </h2>
            <span className="linea-decorativa mt-5" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((otro) => (
                <TarjetaEvento key={otro.id} evento={otro} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
