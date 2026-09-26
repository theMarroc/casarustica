"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type FotoAlumna = { id: string; url: string; caption: string | null; taller?: string };

/** Grilla de trabajos de alumnas; al tocar una foto se abre en grande. */
export function GaleriaAlumnas({ fotos }: { fotos: FotoAlumna[] }) {
  const [abierta, setAbierta] = useState<number | null>(null);
  const dialogo = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialogo.current;
    if (!d) return;
    if (abierta !== null && !d.open) d.showModal();
    if (abierta === null && d.open) d.close();
  }, [abierta]);

  const mover = (paso: number) =>
    setAbierta((i) => (i === null ? i : (i + paso + fotos.length) % fotos.length));
  const actual = abierta === null ? null : fotos[abierta];

  return (
    <>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {fotos.map((foto, indice) => (
          <li key={foto.id}>
            <button
              type="button"
              onClick={() => setAbierta(indice)}
              className="group block w-full text-left"
            >
              <span className="relative block aspect-square overflow-hidden rounded-marca bg-arena/20">
                <Image
                  src={foto.url}
                  alt={foto.caption ?? "Trabajo de una alumna"}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </span>
              {foto.caption || foto.taller ? (
                <span className="mt-2 block text-xs leading-snug text-carbon/75">
                  {foto.caption}
                  {foto.taller ? (
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.12em] text-piedra-oscura">
                      {foto.taller}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogo}
        onClose={() => setAbierta(null)}
        onKeyDown={(evento) => {
          if (evento.key === "ArrowRight") mover(1);
          if (evento.key === "ArrowLeft") mover(-1);
        }}
        aria-label="Trabajo de una alumna"
        className="m-auto w-[min(92vw,56rem)] max-w-none overflow-visible bg-transparent p-0 backdrop:bg-carbon/95 backdrop:backdrop-blur-sm"
      >
        {actual ? (
          <figure className="flex flex-col items-center">
            <span className="relative block h-[72dvh] w-full">
              <Image
                src={actual.url}
                alt={actual.caption ?? "Trabajo de una alumna"}
                fill
                sizes="92vw"
                className="object-contain"
              />
            </span>
            {actual.caption || actual.taller ? (
              <figcaption className="mt-3 text-center text-sm leading-snug text-hueso">
                {actual.caption}
                {actual.taller ? (
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-hueso/70">
                    {actual.taller}
                  </span>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ) : null}

        <button
          type="button"
          onClick={() => setAbierta(null)}
          aria-label="Cerrar"
          className="absolute -top-2 right-0 rounded-full bg-hueso/90 p-2 text-carbon shadow-sm transition-colors hover:bg-hueso sm:-right-12 sm:top-0"
        >
          <X className="h-5 w-5" />
        </button>
        {fotos.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => mover(-1)}
              aria-label="Foto anterior"
              className="absolute left-1 top-[36dvh] -translate-y-1/2 rounded-full bg-hueso/90 p-2 text-carbon shadow-sm transition-colors hover:bg-hueso sm:-left-14"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => mover(1)}
              aria-label="Foto siguiente"
              className="absolute right-1 top-[36dvh] -translate-y-1/2 rounded-full bg-hueso/90 p-2 text-carbon shadow-sm transition-colors hover:bg-hueso sm:-right-14"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </dialog>
    </>
  );
}
