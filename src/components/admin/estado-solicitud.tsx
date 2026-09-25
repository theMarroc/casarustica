"use client";

import { AlertCircle, Check, CheckCircle2, Loader2 } from "lucide-react";
import { startTransition, useOptimistic, useState, useTransition } from "react";

import { cambiarEstadoSolicitud } from "@/actions/admin/solicitudes";
import { ESTADOS_SOLICITUD, type EstadoSolicitud } from "@/lib/types";
import { cn } from "@/lib/utils";

const RECORRIDO: EstadoSolicitud[] = ["nueva", "presupuestada", "aceptada", "terminada"];

/** Mismo patrón que el estado de los pedidos: cambio optimista y aviso. */
export function EstadoSolicitudSelector({
  solicitudId,
  estadoInicial,
}: {
  solicitudId: string;
  estadoInicial: EstadoSolicitud;
}) {
  const [estado, setEstado] = useState(estadoInicial);
  const [mostrado, setMostrado] = useOptimistic(estado);
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  function elegir(nuevo: EstadoSolicitud) {
    if (nuevo === mostrado || pendiente) return;
    setAviso(null);
    iniciar(async () => {
      setMostrado(nuevo);
      const resultado = await cambiarEstadoSolicitud(solicitudId, nuevo);
      startTransition(() => {
        if (resultado.ok) setEstado(nuevo);
        setAviso({ ok: resultado.ok, texto: resultado.mensaje });
      });
      if (resultado.ok) window.setTimeout(() => setAviso(null), 3500);
    });
  }

  const posicion = RECORRIDO.indexOf(mostrado);
  const descartada = mostrado === "descartada";

  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-1.5">
        {RECORRIDO.map((clave, indice) => {
          const actual = clave === mostrado;
          const hecho = !descartada && indice < posicion;
          return (
            <li key={clave}>
              <button
                type="button"
                onClick={() => elegir(clave)}
                disabled={pendiente}
                aria-pressed={actual}
                className={cn(
                  "flex w-full items-center gap-3 rounded-marca border px-3 py-2 text-left text-sm transition-colors disabled:cursor-wait",
                  actual
                    ? "border-acento-fuerte bg-acento-fuerte/8 font-semibold text-nogal"
                    : "border-piedra/30 text-carbon/70 hover:border-piedra hover:bg-lino/60",
                  descartada && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    actual
                      ? "border-acento-fuerte bg-acento-fuerte text-white"
                      : hecho
                        ? "border-salvia bg-salvia text-white"
                        : "border-piedra/60 text-piedra-oscura",
                  )}
                >
                  {actual && pendiente ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : actual || hecho ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : (
                    indice + 1
                  )}
                </span>
                {ESTADOS_SOLICITUD[clave].label}
              </button>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        onClick={() => elegir("descartada")}
        disabled={pendiente}
        aria-pressed={descartada}
        className={cn(
          "rounded-marca border px-3 py-2 text-left text-sm transition-colors disabled:cursor-wait",
          descartada
            ? "border-carbon/40 bg-carbon/5 font-semibold text-carbon"
            : "border-transparent text-piedra-oscura hover:bg-lino/60",
        )}
      >
        {descartada ? "Descartada" : "Marcar como descartada"}
      </button>

      {aviso ? (
        <p
          aria-live="polite"
          className={cn(
            "flex items-start gap-2 rounded-marca px-3 py-2 text-xs leading-relaxed",
            aviso.ok
              ? "border border-salvia/40 bg-salvia/10 text-salvia"
              : "border border-alerta/40 bg-alerta/10 text-alerta-oscura",
          )}
        >
          {aviso.ok ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          )}
          {aviso.texto}
        </p>
      ) : null}
    </div>
  );
}
