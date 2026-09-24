"use client";

import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

import { Isotipo } from "@/components/ui/marca";
import { cn } from "@/lib/utils";

function Foto({
  url,
  alt,
  sizes,
  momento,
}: {
  url: string;
  alt: string;
  sizes: string;
  momento: "antes" | "despues";
}) {
  if (url) {
    return <Image src={url} alt={alt} fill sizes={sizes} className="object-cover" />;
  }

  // Sin foto (modo demo): el antes apagado y el después con color.
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center",
        momento === "antes" && "grayscale",
      )}
      style={{
        background:
          momento === "antes"
            ? "linear-gradient(150deg, var(--color-piedra) 0%, var(--color-piedra-oscura) 100%)"
            : "linear-gradient(150deg, var(--color-hueso) 10%, var(--color-acento) 100%)",
      }}
    >
      <Isotipo className="h-12 w-12 text-white/80" />
    </div>
  );
}

/**
 * Comparador de antes y después. Se arrastra con el mouse o el dedo (el
 * scroll vertical sigue funcionando) y con las flechas del teclado.
 */
export function Comparador({
  antes,
  despues,
  titulo,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className,
}: {
  antes: string;
  despues: string;
  titulo: string;
  sizes?: string;
  className?: string;
}) {
  const [posicion, setPosicion] = useState(50);
  const caja = useRef<HTMLDivElement>(null);
  const arrastrando = useRef(false);

  function moverA(x: number) {
    const rect = caja.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const nueva = ((x - rect.left) / rect.width) * 100;
    setPosicion(Math.min(100, Math.max(0, nueva)));
  }

  function alPresionar(evento: PointerEvent<HTMLDivElement>) {
    arrastrando.current = true;
    evento.currentTarget.setPointerCapture(evento.pointerId);
    moverA(evento.clientX);
  }

  function alMover(evento: PointerEvent<HTMLDivElement>) {
    if (arrastrando.current) moverA(evento.clientX);
  }

  function alSoltar() {
    arrastrando.current = false;
  }

  function alTeclear(evento: KeyboardEvent<HTMLDivElement>) {
    const pasos: Record<string, number> = {
      ArrowLeft: -5,
      ArrowDown: -5,
      ArrowRight: 5,
      ArrowUp: 5,
      PageDown: -20,
      PageUp: 20,
    };
    if (evento.key === "Home") setPosicion(0);
    else if (evento.key === "End") setPosicion(100);
    else if (evento.key in pasos) {
      setPosicion((actual) => Math.min(100, Math.max(0, actual + pasos[evento.key])));
    } else return;
    evento.preventDefault();
  }

  return (
    <div
      ref={caja}
      onPointerDown={alPresionar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={alSoltar}
      className={cn(
        "relative aspect-4/3 cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-marca bg-arena/20",
        className,
      )}
    >
      <Foto url={despues} alt={`${titulo}, después`} sizes={sizes} momento="despues" />

      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - posicion}% 0 0)` }}
      >
        <Foto url={antes} alt={`${titulo}, antes`} sizes={sizes} momento="antes" />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-carbon/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
        Antes
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-carbon/65 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
        Después
      </span>

      <span
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgb(0_0_0/0.35)]"
        style={{ left: `${posicion}%` }}
      />

      <div
        role="slider"
        tabIndex={0}
        aria-label={`Comparar el antes y el después: ${titulo}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(posicion)}
        aria-valuetext={`${Math.round(posicion)}% de la foto de antes`}
        onKeyDown={alTeclear}
        className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-nogal shadow-tarjeta"
        style={{ left: `${posicion}%` }}
      >
        <ChevronsLeftRight className="h-5 w-5" strokeWidth={1.6} />
      </div>
    </div>
  );
}
