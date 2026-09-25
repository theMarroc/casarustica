import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AlertCircle, Trash2 } from "lucide-react";

import { borrarSolicitud, guardarPresupuesto } from "@/actions/admin/solicitudes";
import { EstadoSolicitudSelector } from "@/components/admin/estado-solicitud";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { FilaDato, PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { linkWhatsapp } from "@/lib/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Solicitud } from "@/lib/types";
import { formatARS, formatFecha, formatFechaDia } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pedido de presupuesto",
  robots: { index: false, follow: false },
};

export default async function DetalleSolicitud({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data } = await supabase
    .from("quote_requests")
    .select("*, images:quote_request_images(id, path, sort_order)")
    .eq("id", id)
    .maybeSingle();

  const solicitud = data as Solicitud | null;
  if (!solicitud) notFound();

  // El bucket es privado: enlaces firmados que vencen en una hora.
  const fotos = [...(solicitud.images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  let enlaces: { id: string; url: string }[] = [];
  if (fotos.length && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { data: firmados } = await createAdminClient()
      .storage.from("solicitudes")
      .createSignedUrls(
        fotos.map((f) => f.path),
        60 * 60,
      );
    enlaces = (firmados ?? [])
      .map((firmado, indice) => ({ id: fotos[indice].id, url: firmado.signedUrl ?? "" }))
      .filter((e) => e.url);
  }

  const nombre = solicitud.customer_name.split(" ")[0];
  const mensaje = `¡Hola ${nombre}! Te escribo por tu consulta de ${solicitud.service_name} (${solicitud.code}).`;

  return (
    <>
      <TituloAdmin
        titulo={solicitud.code}
        texto={`${solicitud.service_name} · ${formatFecha(solicitud.created_at)}`}
        volverA={{ href: "/admin/solicitudes", texto: "Volver a presupuestos" }}
      >
        <a
          href={linkWhatsapp(solicitud.customer_phone, mensaje)}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("primario", "sm")}
        >
          <IconoWhatsapp className="h-4 w-4" />
          Responder por WhatsApp
        </a>
      </TituloAdmin>

      {error === "borrar" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          No se pudo borrar. Recargá la página y probá de nuevo.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-6">
          <PanelAdmin titulo="Lo que nos contó">
            <p className="whitespace-pre-line text-sm leading-relaxed text-carbon/85">
              {solicitud.message}
            </p>
            <div className="mt-4 grid gap-x-8 border-t border-piedra/25 pt-2 sm:grid-cols-2">
              <FilaDato etiqueta="Nombre">{solicitud.customer_name}</FilaDato>
              <FilaDato etiqueta="WhatsApp">{solicitud.customer_phone}</FilaDato>
              <FilaDato etiqueta="Email">{solicitud.customer_email ?? "Sin email"}</FilaDato>
              <FilaDato etiqueta="Localidad o lugar">{solicitud.location ?? "Sin dato"}</FilaDato>
              {solicitud.event_date ? (
                <FilaDato etiqueta="Fecha del evento">{formatFechaDia(solicitud.event_date)}</FilaDato>
              ) : null}
              {solicitud.measures ? (
                <FilaDato etiqueta="Medidas">{solicitud.measures}</FilaDato>
              ) : null}
            </div>
          </PanelAdmin>

          <PanelAdmin
            titulo="Fotos"
            texto={
              enlaces.length
                ? "Tocá una para verla grande. Los enlaces vencen en una hora: si se cortan, recargá la página."
                : undefined
            }
          >
            {enlaces.length ? (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {enlaces.map((foto) => (
                  <li key={foto.id}>
                    <a
                      href={foto.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block aspect-square overflow-hidden rounded-marca bg-arena/20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- enlace firmado de un bucket privado */}
                      <img src={foto.url} alt="" className="h-full w-full object-cover" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-carbon/65">No mandó fotos.</p>
            )}
          </PanelAdmin>
        </div>

        <div className="flex flex-col gap-6">
          <PanelAdmin titulo="Estado" className="h-fit">
            <EstadoSolicitudSelector solicitudId={solicitud.id} estadoInicial={solicitud.status} />
          </PanelAdmin>

          <PanelAdmin titulo="Presupuesto" className="h-fit">
            <FormularioAdmin accion={guardarPresupuesto} tamano="sm" textoBoton="Guardar">
              <input type="hidden" name="id" value={solicitud.id} />
              <div className="flex flex-col gap-3">
                <CampoConEtiqueta
                  etiqueta="Monto"
                  ayuda={
                    solicitud.quoted_amount !== null
                      ? `Ahora: ${formatARS(Number(solicitud.quoted_amount))}`
                      : "Para tener registro de lo que le pasaste"
                  }
                >
                  <Campo
                    name="quoted_amount"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    defaultValue={solicitud.quoted_amount === null ? "" : String(solicitud.quoted_amount)}
                  />
                </CampoConEtiqueta>
                <CampoConEtiqueta etiqueta="Notas" ayuda="Solo las ves vos">
                  <AreaTexto
                    name="internal_notes"
                    rows={4}
                    defaultValue={solicitud.internal_notes ?? ""}
                  />
                </CampoConEtiqueta>
              </div>
            </FormularioAdmin>
          </PanelAdmin>

          <PanelAdmin titulo="Borrar" className="h-fit border-alerta/30">
            <p className="mb-4 text-sm leading-relaxed text-carbon/65">
              Borra la consulta y sus fotos. Si no avanzó, podés marcarla como descartada.
            </p>
            <FormularioConfirmado
              accion={borrarSolicitud}
              mensaje={`¿Borrar la consulta ${solicitud.code} y sus fotos para siempre?`}
            >
              <input type="hidden" name="id" value={solicitud.id} />
              <button type="submit" className={estilosBoton("peligro", "sm", "w-full")}>
                <Trash2 className="h-4 w-4" />
                Borrar
              </button>
            </FormularioConfirmado>
          </PanelAdmin>
        </div>
      </div>
    </>
  );
}
