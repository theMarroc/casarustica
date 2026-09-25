import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PlaceholderImagen } from "@/components/ui/marca";
import type { Servicio } from "@/lib/types";

export function TarjetaServicio({ servicio }: { servicio: Servicio }) {
  const enlace = `/servicios/${servicio.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca border border-piedra/25 bg-white shadow-suave transition-shadow duration-300 hover:shadow-tarjeta">
      <Link href={enlace} className="relative block aspect-4/3 overflow-hidden bg-arena/20">
        {servicio.image_url ? (
          <Image
            src={servicio.image_url}
            alt={servicio.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImagen texto={servicio.name} />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-2xl leading-snug text-nogal">
          <Link href={enlace} className="transition-colors hover:text-acento-fuerte">
            {servicio.name}
          </Link>
        </h3>
        {servicio.summary ? (
          <p className="text-sm leading-relaxed text-carbon/70">{servicio.summary}</p>
        ) : null}
        <Link
          href={`${enlace}#presupuesto`}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte transition-colors hover:text-acento-profundo"
        >
          Pedir presupuesto
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
