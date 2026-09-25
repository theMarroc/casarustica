"use client";

import { Loader2 } from "lucide-react";
import { startTransition, useOptimistic, useState, useTransition } from "react";

import { cambiarEstadoEspera } from "@/actions/admin/talleres";
import { ESTADOS_ESPERA, type EstadoEspera } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Tres botoncitos: esperando, avisada, descartada. Cambio optimista. */
export function EstadoEsperaSelector({
  id,
  estadoInicial,
}: {
  id: string;
  estadoInicial: EstadoEspera;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [mostrado, setMostrado] = useOptimistic(estado);
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function elegir(nuevo: EstadoEspera) {
    if (nuevo === mostrado || pendiente) return;
    setError(null);
    iniciar(async () => {
      setMostrado(nuevo);
      const resultado = await cambiarEstadoEspera(id, nuevo);
      startTransition(() => {
        if (resultado.ok) setEstado(nuevo);
        else setError(resultado.mensaje);
      });
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex rounded-full border border-piedra/35 p-0.5" role="group" aria-label="Estado">
        {(Object.keys(ESTADOS_ESPERA) as EstadoEspera[]).map((clave) => (
          <button
            key={clave}
            type="button"
            onClick={() => elegir(clave)}
            disabled={pendiente}
            aria-pressed={clave === mostrado}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] transition-colors disabled:cursor-wait",
              clave === mostrado ? ESTADOS_ESPERA[clave].clase : "text-carbon/55 hover:text-carbon",
            )}
          >
            {clave === mostrado && pendiente ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
            {ESTADOS_ESPERA[clave].label}
          </button>
        ))}
      </div>
      {error ? (
        <p aria-live="polite" className="text-[11px] text-alerta-oscura">
          {error}
        </p>
      ) : null}
    </div>
  );
}
