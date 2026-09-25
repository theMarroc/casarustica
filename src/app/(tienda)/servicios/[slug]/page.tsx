import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { FormularioPresupuesto } from "@/components/servicios/formulario-presupuesto";
import { TarjetaAntesDespues, TarjetaEvento } from "@/components/trabajos/tarjetas";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getAjustes, getAntesDespues, getEventos, getServicio } from "@/lib/db";
import { ajuste } from "@/lib/settings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const servicio = await getServicio(slug);
  if (!servicio) return { title: "Servicio no encontrado" };

  return {
    title: servicio.name,
    description: servicio.summary ?? undefined,
    openGraph: {
      title: servicio.name,
      description: servicio.summary ?? undefined,
      images: servicio.image_url ? [servicio.image_url] : undefined,
    },
  };
}

export default async function PaginaServicio({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [servicio, ajustes] = await Promise.all([getServicio(slug), getAjustes()]);
  if (!servicio || !servicio.is_active) notFound();

  const [trabajos, eventos] = await Promise.all([
    servicio.showcase === "antes_despues" ? getAntesDespues() : Promise.resolve([]),
    servicio.showcase === "eventos" ? getEventos() : Promise.resolve([]),
  ]);

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
          <Link href="/servicios" className="transition-colors hover:text-nogal">
            Servicios
          </Link>
        </nav>
      </div>

      <section className="contenedor grid items-center gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <div className="relative aspect-4/3 overflow-hidden rounded-marca bg-arena/20">
          {servicio.image_url ? (
            <Image
              src={servicio.image_url}
              alt={servicio.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImagen texto={servicio.name} />
          )}
        </div>

        <div>
          <h1 className="font-display text-[clamp(2rem,1.5rem+1.8vw,3rem)] leading-tight text-nogal">
            {servicio.name}
          </h1>
          <span className="linea-decorativa mt-5" />
          {servicio.description ? (
            <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-carbon/75">
              {servicio.description.split(/\n{2,}/).map((parrafo, indice) => (
                <p key={indice}>{parrafo}</p>
              ))}
            </div>
          ) : null}
          <a href="#presupuesto" className="mt-7 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte hover:underline">
            Pedir presupuesto
          </a>
        </div>
      </section>

      {trabajos.length > 0 ? (
        <section className="bg-lino py-14 lg:py-20">
          <div className="contenedor">
            <h2 className="titulo-seccion text-nogal">
              Algunos <span className="cursiva-marca">trabajos</span>
            </h2>
            <span className="linea-decorativa mt-5" />
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {trabajos.slice(0, 2).map((trabajo) => (
                <TarjetaAntesDespues key={trabajo.id} trabajo={trabajo} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {eventos.length > 0 ? (
        <section className="bg-lino py-14 lg:py-20">
          <div className="contenedor">
            <h2 className="titulo-seccion text-nogal">
              Eventos que <span className="cursiva-marca">ambientamos</span>
            </h2>
            <span className="linea-decorativa mt-5" />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.slice(0, 3).map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="presupuesto" className="scroll-mt-24 py-14 lg:py-20">
        <div className="contenedor max-w-3xl">
          <h2 className="titulo-seccion text-nogal">
            Pedí tu <span className="cursiva-marca">presupuesto</span>
          </h2>
          <span className="linea-decorativa mt-5" />
          <p className="mt-5 text-sm leading-relaxed text-carbon/70">
            Completá lo que puedas y te respondemos por WhatsApp. No es un compromiso de
            compra.
          </p>
          <div className="mt-8 rounded-marca border border-piedra/30 bg-white p-5 shadow-suave sm:p-8">
            <FormularioPresupuesto
              servicio={servicio}
              whatsapp={ajuste(ajustes, "whatsapp_numero")}
            />
          </div>
        </div>
      </section>
    </>
  );
}
