"use client";

import { Check } from "lucide-react";
import { useState } from "react";

import { estilosBoton } from "@/components/ui/boton";
import { Isotipo, Logo } from "@/components/ui/marca";
import { ESTILOS, LETRAS, type Estilo, type Letra } from "@/lib/apariencia";
import { cn } from "@/lib/utils";

const CLASE_OPCION =
  "relative flex cursor-pointer flex-col gap-2 rounded-marca border bg-hueso p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-acento-fuerte";

function Marca({ elegida }: { elegida: boolean }) {
  if (!elegida) return null;
  return (
    <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-acento-fuerte text-white">
      <Check className="h-3 w-3" strokeWidth={2.5} />
    </span>
  );
}

/**
 * Elección de tipografía y estilo de color. Cada opción se dibuja con su
 * propia letra y paleta; la muestra de abajo combina lo elegido antes de guardar.
 */
export function SelectorApariencia({
  letra,
  estilo,
  nombre,
  bajada,
}: {
  letra: Letra;
  estilo: Estilo;
  nombre: string;
  bajada: string;
}) {
  const [letraElegida, setLetra] = useState(letra);
  const [estiloElegido, setEstilo] = useState(estilo);

  return (
    <div className="flex flex-col gap-6">
      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-nogal">
          Tipografía
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {(Object.keys(LETRAS) as Letra[]).map((clave) => (
            <label
              key={clave}
              data-letra={clave}
              className={cn(
                CLASE_OPCION,
                letraElegida === clave
                  ? "border-acento-fuerte"
                  : "border-piedra/30 hover:border-piedra",
              )}
            >
              <input
                type="radio"
                name="ajuste_apariencia_letra"
                value={clave}
                checked={letraElegida === clave}
                onChange={() => setLetra(clave)}
                className="sr-only"
              />
              <Marca elegida={letraElegida === clave} />
              <span className="font-script text-3xl leading-none text-nogal">
                {nombre}
              </span>
              <span className="font-display text-xl leading-tight text-nogal [font-weight:var(--peso-titulos)]">
                Diseño con alma
              </span>
              <span className="text-xs leading-relaxed text-piedra-oscura">
                <strong className="font-semibold text-nogal">
                  {LETRAS[clave].nombre}.
                </strong>{" "}
                {LETRAS[clave].nota}
                <br />
                {LETRAS[clave].fuentes}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-nogal">
          Estilo de color
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(ESTILOS) as Estilo[]).map((clave) => (
            <label
              key={clave}
              data-estilo={clave}
              className={cn(
                CLASE_OPCION,
                estiloElegido === clave
                  ? "border-acento-fuerte"
                  : "border-piedra/30 hover:border-piedra",
              )}
            >
              <input
                type="radio"
                name="ajuste_apariencia_estilo"
                value={clave}
                checked={estiloElegido === clave}
                onChange={() => setEstilo(clave)}
                className="sr-only"
              />
              <Marca elegida={estiloElegido === clave} />
              <span className="flex gap-1.5" aria-hidden="true">
                {["bg-lino", "bg-arena", "bg-madera", "bg-nogal", "bg-acento", "bg-acento-fuerte"].map(
                  (color) => (
                    <span
                      key={color}
                      className={cn("h-7 w-7 rounded-full border border-carbon/10", color)}
                    />
                  ),
                )}
              </span>
              <span className="text-sm font-semibold text-nogal">
                {ESTILOS[clave].nombre}
              </span>
              <span className="text-xs text-piedra-oscura">{ESTILOS[clave].nota}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-nogal">
          Así se va a ver
        </p>
        <div
          data-letra={letraElegida}
          data-estilo={estiloElegido}
          className="overflow-hidden rounded-marca border border-piedra/30 bg-hueso"
        >
          <div className="flex items-center justify-between border-b border-piedra/25 bg-lino px-4 py-3">
            <Logo nombre={nombre} bajada={bajada} />
            <span className="hidden gap-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-carbon/60 sm:flex">
              <span className="text-carbon">Inicio</span>
              <span>Tienda</span>
              <span>Sets y kits</span>
            </span>
          </div>

          <div className="grid gap-6 p-5 sm:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="font-display text-[2rem] leading-[1.1] text-nogal [font-weight:var(--peso-titulos)]">
                Diseño con alma, <span className="cursiva-marca">hecho a mano.</span>
              </p>
              <span className="linea-decorativa mt-4" />
              <p className="mt-4 text-sm leading-relaxed text-carbon/75">
                Bandejas, latas, cartelería y deco para tu casa, pintadas y terminadas
                a mano en el taller.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className={estilosBoton("primario", "sm")}>Ver la tienda</span>
                <span className={estilosBoton("secundario", "sm")}>Sets y kits</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-marca border border-piedra/25 bg-white">
              <div
                className="flex aspect-4/3 items-center justify-center"
                style={{
                  background:
                    "linear-gradient(150deg, var(--color-hueso) 15%, var(--color-acento) 100%)",
                }}
              >
                <Isotipo className="h-9 w-9 text-white/85" />
              </div>
              <div className="p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-piedra-oscura">
                  Bandejas
                </p>
                <p className="mt-1 font-display text-lg leading-snug text-carbon">
                  Bandeja desayunador
                </p>
                <p className="mt-1 font-display text-lg text-nogal">$ 38.000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
