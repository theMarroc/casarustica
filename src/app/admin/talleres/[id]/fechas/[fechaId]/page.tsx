import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, Trash2, Users } from "lucide-react";

import { borrarFecha, guardarFecha } from "@/actions/admin/talleres";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { ListaEspera } from "@/components/admin/lista-espera";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Campo, CampoConEtiqueta, Insignia, Selector } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes, getTallerPorId } from "@/lib/db";
import { ajuste, linkWhatsapp } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { aHoraLocal, describirInicio, horasDeReserva, venceReserva } from "@/lib/talleres";
import { ESTADOS_PEDIDO, type AnotadaEnEspera, type OrderStatus } from "@/lib/types";
import { formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Fecha del taller",
  robots: { index: false, follow: false },
};

const ERRORES: Record<string, string> = {
  borrar: "No se pudo borrar. Recargá la página y probá de nuevo.",
  inscriptos:
    "No se puede borrar: tiene inscripciones. Cancelalas desde Pedidos, o destildá Inscripción abierta.",
};

type Inscripta = {
  id: string;
  quantity: number;
  order: {
    id: string;
    code: string;
    customer_name: string;
    customer_phone: string;
    status: OrderStatus;
    created_at: string;
  } | null;
};

export default async function EditorFecha({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; fechaId: string }>;
  searchParams: Promise<{ nueva?: string; error?: string }>;
}) {
  const [{ id, fechaId }, { nueva, error }] = await Promise.all([params, searchParams]);
  const [taller, ajustes] = await Promise.all([getTallerPorId(id), getAjustes()]);
  if (!taller) notFound();

  const esNueva = fechaId === "nueva";
  const fecha = esNueva ? null : taller.sessions.find((f) => f.id === fechaId);
  if (!esNueva && !fecha) notFound();

  let inscriptas: Inscripta[] = [];
  let espera: AnotadaEnEspera[] = [];
  if (fecha) {
    const supabase = await createClient();
    const [lineas, anotadas] = await Promise.all([
      supabase
        .from("order_items")
        .select("id, quantity, order:orders(id, code, customer_name, customer_phone, status, created_at)")
        .eq("session_id", fecha.id),
      supabase
        .from("workshop_waitlist")
        .select("*")
        .eq("session_id", fecha.id)
        .order("created_at"),
    ]);
    inscriptas = ((lineas.data ?? []) as unknown as Inscripta[])
      .filter((i) => i.order)
      .sort((a, b) => a.order!.created_at.localeCompare(b.order!.created_at));
    espera = (anotadas.data ?? []) as AnotadaEnEspera[];
  }

  // Una inscripción sin pagar deja de guardar el lugar pasadas estas horas.
  const horas = horasDeReserva(ajuste(ajustes, "taller_reserva_horas"));
  const vencida = (creada: string) => new Date(venceReserva(creada, horas)) < new Date();
  const titulo = fecha ? describirInicio(fecha.starts_at) : "Nueva fecha";
  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";

  return (
    <>
      <TituloAdmin
        titulo={titulo.charAt(0).toUpperCase() + titulo.slice(1)}
        texto={taller.name}
        volverA={{ href: `/admin/talleres/${taller.id}`, texto: `Volver a ${taller.name}` }}
      />

      {nueva === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Fecha creada. Si está abierta, ya se puede inscribir la gente.
        </p>
      ) : null}
      {error && ERRORES[error] ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          {ERRORES[error]}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <FormularioAdmin
          accion={guardarFecha}
          textoBoton={esNueva ? "Crear fecha" : "Guardar cambios"}
          className="flex flex-col gap-6"
          extraBoton={
            <Link href={`/admin/talleres/${taller.id}`} className={estilosBoton("fantasma", "md")}>
              Cancelar
            </Link>
          }
        >
          {fecha ? <input type="hidden" name="id" value={fecha.id} /> : null}
          <input type="hidden" name="workshop_id" value={taller.id} />

          <PanelAdmin titulo="Cuándo">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Empieza" requerido ayuda="Día y hora del primer encuentro">
                <Campo
                  name="starts_at"
                  type="datetime-local"
                  required
                  defaultValue={fecha ? aHoraLocal(fecha.starts_at) : ""}
                />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Días y horario" ayuda="Por ejemplo: martes de 18 a 20">
                <Campo name="schedule" defaultValue={fecha?.schedule ?? ""} />
              </CampoConEtiqueta>
            </div>
          </PanelAdmin>

          <PanelAdmin titulo="Cupo y precio">
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Cupo" requerido ayuda="Cuántas personas entran">
                <Campo
                  name="capacity"
                  type="number"
                  min={1}
                  step={1}
                  required
                  defaultValue={fecha ? String(fecha.capacity) : "8"}
                />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Precio por persona" ayuda="0 si es sin costo">
                <Campo
                  name="price"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={fecha ? String(fecha.price) : ""}
                />
              </CampoConEtiqueta>
              <CampoConEtiqueta
                etiqueta="Aclaración del precio"
                ayuda="Por ejemplo: matrícula, las cuotas se pagan en el taller"
                className="sm:col-span-2"
              >
                <Campo name="price_note" defaultValue={fecha?.price_note ?? ""} />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Seña" ayuda="Lo que se paga para reservar el lugar">
                <Selector name="deposit_type" defaultValue={fecha?.deposit_type ?? "none"}>
                  <option value="none">Sin seña: se paga todo al inscribirse</option>
                  <option value="percent">Porcentaje del precio</option>
                  <option value="amount">Monto fijo por persona</option>
                </Selector>
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Valor de la seña" ayuda="El % o el monto, según lo elegido">
                <Campo
                  name="deposit_value"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={fecha && fecha.deposit_type !== "none" ? String(fecha.deposit_value) : ""}
                />
              </CampoConEtiqueta>
            </div>
          </PanelAdmin>

          <PanelAdmin titulo="Inscripción">
            <label className="flex items-start gap-2.5 text-sm text-carbon/80">
              <input
                type="checkbox"
                name="is_open"
                defaultChecked={fecha?.is_open ?? true}
                className="mt-0.5 h-4 w-4 accent-acento-fuerte"
              />
              <span>
                <span className="font-semibold text-nogal">Inscripción abierta</span>
                <br />
                Si la destildás, la fecha deja de verse en la página. Las inscripciones que ya
                están no se tocan.
              </span>
            </label>
          </PanelAdmin>
        </FormularioAdmin>

        {fecha ? (
          <div className="flex flex-col gap-6">
            <PanelAdmin
              titulo="Inscriptas"
              texto={`${fecha.tomados} de ${fecha.capacity} lugares ocupados. Las sin pagar guardan el lugar ${horas} horas.`}
              className="h-fit"
            >
              {inscriptas.length === 0 ? (
                <p className="text-sm text-carbon/65">Todavía no se inscribió nadie.</p>
              ) : (
                <ul className="divide-y divide-piedra/20">
                  {inscriptas.map(({ id: lineaId, quantity, order }) => {
                    const pedido = order!;
                    const estado =
                      pedido.status === "pendiente_pago" && vencida(pedido.created_at)
                        ? { label: "Reserva vencida", clase: "bg-alerta/15 text-alerta-oscura" }
                        : ESTADOS_PEDIDO[pedido.status];
                    return (
                      <li key={lineaId} className="flex items-center justify-between gap-3 py-3">
                        <Link href={`/admin/pedidos/${pedido.id}`} className="min-w-0 hover:underline">
                          <span className="block truncate text-sm font-semibold text-nogal">
                            {pedido.customer_name}
                          </span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-piedra-oscura">
                            {pedido.code}
                            <span className="flex items-center gap-0.5">
                              · <Users className="h-3 w-3" /> {quantity}
                            </span>
                          </span>
                          <Insignia className={`mt-1.5 ${estado.clase}`}>{estado.label}</Insignia>
                        </Link>
                        <a
                          href={linkWhatsapp(
                            pedido.customer_phone,
                            `¡Hola ${pedido.customer_name.split(" ")[0]}! Te escribo por tu inscripción ${pedido.code} a ${taller.name}.`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          title="Escribirle por WhatsApp"
                          className="shrink-0 rounded-marca p-2 text-salvia transition-colors hover:bg-salvia/10"
                        >
                          <IconoWhatsapp className="h-4 w-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </PanelAdmin>

            <PanelAdmin
              titulo="Lista de espera"
              texto="Si se libera un lugar, avisales por WhatsApp."
              className="h-fit"
            >
              <ListaEspera
                anotadas={espera}
                taller={taller.name}
                enlaceTaller={`${sitio}/taller/${taller.slug}?fecha=${fecha.id}`}
                fechaTexto={formatFecha(fecha.starts_at)}
                volver={`/admin/talleres/${taller.id}/fechas/${fecha.id}`}
              />
            </PanelAdmin>

            <PanelAdmin titulo="Borrar la fecha" className="h-fit border-alerta/30">
              <p className="mb-4 text-sm leading-relaxed text-carbon/65">
                Solo se puede si no tiene inscripciones.
              </p>
              <FormularioConfirmado accion={borrarFecha} mensaje="¿Borrar esta fecha para siempre?">
                <input type="hidden" name="id" value={fecha.id} />
                <input type="hidden" name="workshop_id" value={taller.id} />
                <button type="submit" className={estilosBoton("peligro", "sm", "w-full")}>
                  <Trash2 className="h-4 w-4" />
                  Borrar
                </button>
              </FormularioConfirmado>
            </PanelAdmin>
          </div>
        ) : null}
      </div>
    </>
  );
}
