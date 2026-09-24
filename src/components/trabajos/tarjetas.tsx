import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";

import { Comparador } from "@/components/trabajos/comparador";
import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import type { AntesDespues, Evento } from "@/lib/types";
import { formatFechaDia } from "@/lib/utils";

export function TarjetaAntesDespues({ trabajo }: { trabajo: AntesDespues }) {
  return (
    <article className="flex flex-col">
      <Comparador
        antes={trabajo.before_url}
        despues={trabajo.after_url}
        titulo={trabajo.title}
        className="shadow-suave"
      />
      <h3 className="mt-4 font-display text-xl leading-snug text-nogal">{trabajo.title}</h3>
      {trabajo.description ? (
        <p className="mt-1 text-sm leading-relaxed text-carbon/70">{trabajo.description}</p>
      ) : null}
    </article>
  );
}

export function DatosEvento({ evento }: { evento: Evento }) {
  if (!evento.event_date && !evento.place) return null;

  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-piedra-oscura">
      {evento.event_date ? (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.5} />
          {formatFechaDia(evento.event_date)}
        </span>
      ) : null}
      {evento.place ? (
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          {evento.place}
        </span>
      ) : null}
    </p>
  );
}

export function TarjetaEvento({ evento }: { evento: Evento }) {
  const portada = evento.images[0];
  const enlace = `/trabajos/${evento.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca border border-piedra/25 bg-white shadow-suave">
      <Link href={enlace} className="relative block aspect-4/3 overflow-hidden bg-arena/20">
        {portada ? (
          <Image
            src={portada.url}
            alt={portada.alt ?? evento.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImagen texto={evento.title} />
        )}
        {evento.kind ? (
          <Insignia className="absolute left-3 top-3 bg-acento text-carbon">
            {evento.kind}
          </Insignia>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl leading-snug text-nogal">
          <Link href={enlace} className="transition-colors hover:text-acento-fuerte">
            {evento.title}
          </Link>
        </h3>
        <DatosEvento evento={evento} />
        {evento.images.length > 1 ? (
          <p className="mt-auto pt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte">
            Ver las {evento.images.length} fotos
          </p>
        ) : null}
      </div>
    </article>
  );
}
