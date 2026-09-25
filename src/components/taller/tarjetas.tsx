import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { describirInicio, diaYMes, fechasVigentes, lugaresLibres } from "@/lib/talleres";
import { TIPOS_TALLER, type FechaTaller, type Taller } from "@/lib/types";
import { cn, formatARS } from "@/lib/utils";

/** "Cupo completo", "Quedan 2 lugares" o "Hay lugar". */
export function EstadoCupo({ fecha, className }: { fecha: FechaTaller; className?: string }) {
  const libres = lugaresLibres(fecha);
  if (libres === 0) {
    return <Insignia className={cn("bg-carbon/10 text-carbon/65", className)}>Cupo completo</Insignia>;
  }
  if (libres <= 3) {
    return (
      <Insignia className={cn("bg-acento-fuerte text-white", className)}>
        Queda{libres === 1 ? "" : "n"} {libres} lugar{libres === 1 ? "" : "es"}
      </Insignia>
    );
  }
  return <Insignia className={cn("bg-acento/45 text-nogal", className)}>Hay lugar</Insignia>;
}

/** Una fecha próxima, con el calendarito a la izquierda. */
export function TarjetaFecha({ taller, fecha }: { taller: Taller; fecha: FechaTaller }) {
  const { dia, mes } = diaYMes(fecha.starts_at);
  const enlace = `/taller/${taller.slug}?fecha=${fecha.id}#inscripcion`;

  return (
    <article className="flex gap-4 rounded-marca border border-piedra/25 bg-white p-4 shadow-suave transition-shadow duration-300 hover:shadow-tarjeta sm:p-5">
      <div className="flex h-18 w-16 shrink-0 flex-col items-center justify-center rounded-marca bg-acento/25 text-nogal">
        <span className="font-display text-3xl leading-none">{dia}</span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em]">{mes}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="font-display text-xl leading-snug text-nogal">
          <Link href={enlace} className="transition-colors hover:text-acento-fuerte">
            {taller.name}
          </Link>
        </h3>
        <p className="text-xs leading-relaxed text-carbon/70 first-letter:uppercase">
          {describirInicio(fecha.starts_at)}
          {fecha.schedule ? <span className="block">{fecha.schedule}</span> : null}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-display text-lg text-carbon">
            {fecha.price > 0 ? formatARS(fecha.price) : "Sin costo"}
          </span>
          <EstadoCupo fecha={fecha} />
        </div>
        <Link
          href={enlace}
          className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte transition-colors hover:text-acento-profundo"
        >
          {lugaresLibres(fecha) > 0 ? "Inscribirme" : "Anotarme en la lista de espera"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function TarjetaTaller({ taller }: { taller: Taller }) {
  const enlace = `/taller/${taller.slug}`;
  const proxima = fechasVigentes(taller)[0];

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca border border-piedra/25 bg-white shadow-suave transition-shadow duration-300 hover:shadow-tarjeta">
      <Link href={enlace} className="relative block aspect-4/3 overflow-hidden bg-arena/20">
        {taller.image_url ? (
          <Image
            src={taller.image_url}
            alt={taller.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImagen texto={taller.name} mariposa />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-acento-fuerte">
          {TIPOS_TALLER[taller.kind]}
        </p>
        <h3 className="font-display text-2xl leading-snug text-nogal">
          <Link href={enlace} className="transition-colors hover:text-acento-fuerte">
            {taller.name}
          </Link>
        </h3>
        {taller.summary ? (
          <p className="text-sm leading-relaxed text-carbon/70">{taller.summary}</p>
        ) : null}
        {taller.duration ? (
          <p className="flex items-center gap-1.5 text-xs text-piedra-oscura">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
            {taller.duration}
          </p>
        ) : null}
        <p className="mt-1 text-xs leading-relaxed text-carbon/70 first-letter:uppercase">
          {proxima ? (
            <>
              <span className="font-semibold text-nogal">Próxima fecha: </span>
              {describirInicio(proxima.starts_at)}
            </>
          ) : (
            "Fechas a confirmar"
          )}
        </p>
        <Link
          href={enlace}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte transition-colors hover:text-acento-profundo"
        >
          {proxima ? "Ver fechas e inscribirme" : "Quiero que me avisen"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}
