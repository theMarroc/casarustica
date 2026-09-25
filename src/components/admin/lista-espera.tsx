import { Trash2, Users } from "lucide-react";

import { borrarEspera } from "@/actions/admin/talleres";
import { EstadoEsperaSelector } from "@/components/admin/estado-espera";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { IconoWhatsapp } from "@/components/ui/marca";
import { linkWhatsapp } from "@/lib/settings";
import type { AnotadaEnEspera } from "@/lib/types";
import { formatFecha } from "@/lib/utils";

/** Las personas anotadas, con el botón para avisarles por WhatsApp. */
export function ListaEspera({
  anotadas,
  taller,
  enlaceTaller,
  fechaTexto,
  volver,
}: {
  anotadas: AnotadaEnEspera[];
  taller: string;
  enlaceTaller: string;
  /** Si es la lista de una fecha llena; si no, es "avisame cuando haya fecha". */
  fechaTexto?: string;
  volver: string;
}) {
  if (anotadas.length === 0) {
    return <p className="text-sm text-carbon/65">No hay nadie anotado.</p>;
  }

  return (
    <ul className="divide-y divide-piedra/20">
      {anotadas.map((anotada) => {
        const nombre = anotada.customer_name.split(" ")[0];
        const mensaje = fechaTexto
          ? `¡Hola ${nombre}! Te escribo por ${taller} (${fechaTexto}): se liberó un lugar. Si todavía te interesa, podés inscribirte acá: ${enlaceTaller}`
          : `¡Hola ${nombre}! Te escribo porque abrimos fechas para ${taller}. Podés inscribirte acá: ${enlaceTaller}`;
        return (
          <li key={anotada.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-40">
              <p className="text-sm font-semibold text-nogal">{anotada.customer_name}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-piedra-oscura">
                {anotada.customer_phone}
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" /> {anotada.people}
                </span>
                <span>·</span>
                {formatFecha(anotada.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <EstadoEsperaSelector id={anotada.id} estadoInicial={anotada.status} />
              <a
                href={linkWhatsapp(anotada.customer_phone, mensaje)}
                target="_blank"
                rel="noreferrer"
                title="Avisarle por WhatsApp"
                className="rounded-marca p-2 text-salvia transition-colors hover:bg-salvia/10"
              >
                <IconoWhatsapp className="h-4 w-4" />
              </a>
              <FormularioConfirmado
                accion={borrarEspera}
                mensaje={`¿Sacar a ${anotada.customer_name} de la lista?`}
              >
                <input type="hidden" name="id" value={anotada.id} />
                <input type="hidden" name="volver" value={volver} />
                <button
                  type="submit"
                  title="Sacar de la lista"
                  className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-alerta/10 hover:text-alerta-oscura"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </FormularioConfirmado>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
