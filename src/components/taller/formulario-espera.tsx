"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useActionState } from "react";

import { anotarEnEspera } from "@/actions/inscripciones";
import { Boton } from "@/components/ui/boton";
import { Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import { MAXIMO_PERSONAS } from "@/lib/talleres";

type Usuario = { nombre: string; email: string; telefono: string } | null;

/** Lista de espera: para una fecha llena o para un taller sin fechas. */
export function FormularioEspera({
  tallerId,
  fechaId,
  usuario,
}: {
  tallerId: string;
  /** Vacío si es "avisame cuando haya fecha". */
  fechaId: string;
  usuario: Usuario;
}) {
  const [estado, accion, enviando] = useActionState(anotarEnEspera, null);

  if (estado?.ok) {
    return (
      <p
        aria-live="polite"
        className="flex items-start gap-2.5 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3.5 text-sm leading-relaxed text-salvia"
      >
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
        {estado.mensaje}
      </p>
    );
  }

  return (
    <form action={accion} className="flex flex-col gap-4">
      <input type="hidden" name="taller" value={tallerId} />
      <input type="hidden" name="fecha" value={fechaId} />
      <input
        type="text"
        name="sitio_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoConEtiqueta etiqueta="Nombre y apellido" requerido>
          <Campo name="nombre" required autoComplete="name" defaultValue={usuario?.nombre} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="WhatsApp" requerido ayuda="Te avisamos por ahí">
          <Campo
            name="telefono"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="2291 50 0000"
            defaultValue={usuario?.telefono}
          />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Email" ayuda="Opcional">
          <Campo name="email" type="email" autoComplete="email" defaultValue={usuario?.email} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="¿Cuántas personas?">
          <Selector name="personas" defaultValue="1">
            {Array.from({ length: MAXIMO_PERSONAS }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </Selector>
        </CampoConEtiqueta>
      </div>

      {estado && !estado.ok ? (
        <p
          aria-live="polite"
          className="flex items-start gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-3 py-2.5 text-sm text-alerta-oscura"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {estado.mensaje}
        </p>
      ) : null}

      <Boton type="submit" variante="secundario" disabled={enviando} className="self-start">
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {fechaId ? "Anotarme en la lista de espera" : "Avisame cuando haya fecha"}
      </Boton>
    </form>
  );
}
