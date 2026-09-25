import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CalendarPlus, CheckCircle2, ChevronRight, ExternalLink, Trash2 } from "lucide-react";

import { borrarTaller, guardarTaller } from "@/actions/admin/talleres";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { ListaEspera } from "@/components/admin/lista-espera";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Insignia, Selector } from "@/components/ui/campos";
import { getTallerPorId } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { describirInicio, lugaresLibres, ordenarFechasPanel } from "@/lib/talleres";
import type { AnotadaEnEspera } from "@/lib/types";
import { cn, formatARS } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Editar taller",
  robots: { index: false, follow: false },
};

const ERRORES: Record<string, string> = {
  borrar: "No se pudo borrar. Recargá la página y probá de nuevo.",
  inscriptos:
    "No se puede borrar: tiene inscripciones. Cancelalas desde Pedidos, o destildá Visible para esconderlo.",
};

export default async function EditorTaller({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const [{ id }, { nuevo, error }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";
  const taller = esNuevo ? null : await getTallerPorId(id);
  if (!esNuevo && !taller) notFound();

  let espera: AnotadaEnEspera[] = [];
  if (taller) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("workshop_waitlist")
      .select("*")
      .eq("workshop_id", taller.id)
      .is("session_id", null)
      .order("created_at");
    espera = (data ?? []) as AnotadaEnEspera[];
  }

  const sitio = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const fechas = ordenarFechasPanel(taller?.sessions ?? []);

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo taller" : (taller?.name ?? "Taller")}
        volverA={{ href: "/admin/talleres", texto: "Volver a talleres" }}
      >
        {taller ? (
          <Link
            href={`/taller/${taller.slug}`}
            target="_blank"
            className={estilosBoton("secundario", "sm")}
          >
            <ExternalLink className="h-4 w-4" />
            Ver en la página
          </Link>
        ) : null}
      </TituloAdmin>

      {nuevo === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Taller creado. Ahora agregale una fecha para abrir la inscripción.
        </p>
      ) : null}
      {error && ERRORES[error] ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          {ERRORES[error]}
        </p>
      ) : null}

      {taller ? (
        <PanelAdmin
          titulo="Fechas"
          texto="Cada fecha tiene su cupo, su precio y su seña. Las que pasaron quedan abajo."
          className="mb-6"
        >
          {fechas.length === 0 ? (
            <p className="mb-4 text-sm text-carbon/65">
              Todavía no tiene fechas: en la página aparece como &quot;fechas a confirmar&quot; y
              la gente puede pedir que le avisen.
            </p>
          ) : (
            <ul className="mb-4 divide-y divide-piedra/20">
              {fechas.map((fecha) => {
                const { pasada } = fecha;
                return (
                  <li key={fecha.id}>
                    <Link
                      href={`/admin/talleres/${taller.id}/fechas/${fecha.id}`}
                      className={cn(
                        "flex flex-wrap items-center gap-3 py-3 transition-colors hover:bg-lino/50",
                        pasada && "opacity-60",
                      )}
                    >
                      <div className="min-w-48 flex-1">
                        <p className="text-sm font-semibold text-nogal first-letter:uppercase">
                          {describirInicio(fecha.starts_at)}
                        </p>
                        <p className="mt-0.5 text-xs text-piedra-oscura">
                          {fecha.schedule ? `${fecha.schedule} · ` : ""}
                          {fecha.price > 0 ? formatARS(fecha.price) : "Sin costo"}
                        </p>
                      </div>
                      <span className="text-sm text-carbon/80">
                        <strong className="font-semibold text-nogal">{fecha.tomados}</strong> de{" "}
                        {fecha.capacity}
                      </span>
                      {pasada ? (
                        <Insignia className="bg-carbon/10 text-carbon/60">Pasada</Insignia>
                      ) : !fecha.is_open ? (
                        <Insignia className="bg-carbon/10 text-carbon/60">Cerrada</Insignia>
                      ) : lugaresLibres(fecha) === 0 ? (
                        <Insignia className="bg-acento-fuerte text-white">Completa</Insignia>
                      ) : (
                        <Insignia className="bg-salvia/20 text-salvia">Abierta</Insignia>
                      )}
                      <ChevronRight className="h-4 w-4 text-piedra-oscura" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href={`/admin/talleres/${taller.id}/fechas/nueva`}
            className={estilosBoton("primario", "sm")}
          >
            <CalendarPlus className="h-4 w-4" />
            Agregar fecha
          </Link>
        </PanelAdmin>
      ) : null}

      <FormularioAdmin
        accion={guardarTaller}
        textoBoton={esNuevo ? "Crear taller" : "Guardar cambios"}
        className="flex flex-col gap-6"
        extraBoton={
          <Link href="/admin/talleres" className={estilosBoton("fantasma", "md")}>
            Cancelar
          </Link>
        }
      >
        {taller ? <input type="hidden" name="id" value={taller.id} /> : null}

        <PanelAdmin titulo="Lo básico">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Nombre" requerido className="sm:col-span-4">
              <Campo
                name="name"
                required
                defaultValue={taller?.name}
                placeholder="Workshop de pintura a la tiza"
              />
            </CampoConEtiqueta>
            <CampoConEtiqueta etiqueta="Orden" ayuda="Menor número, primero" className="sm:col-span-2">
              <Campo
                name="sort_order"
                type="number"
                step={1}
                defaultValue={taller ? String(taller.sort_order) : "0"}
              />
            </CampoConEtiqueta>
            <CampoConEtiqueta etiqueta="Tipo" className="sm:col-span-3">
              <Selector name="kind" defaultValue={taller?.kind ?? "taller"}>
                <option value="taller">Taller, clase, workshop o seminario</option>
                <option value="profesorado">Profesorado o formación larga</option>
              </Selector>
            </CampoConEtiqueta>
            <CampoConEtiqueta
              etiqueta="Duración"
              ayuda="Por ejemplo: 4 encuentros de 2 horas"
              className="sm:col-span-3"
            >
              <Campo name="duration" defaultValue={taller?.duration ?? ""} />
            </CampoConEtiqueta>
            <CampoConEtiqueta
              etiqueta="Resumen"
              ayuda="Se ve en la tarjeta. Máximo 240 caracteres."
              className="sm:col-span-6"
            >
              <AreaTexto name="summary" rows={2} maxLength={240} defaultValue={taller?.summary ?? ""} />
            </CampoConEtiqueta>
            <CampoConEtiqueta
              etiqueta="Contenido"
              ayuda="Qué se aprende, para quién es, qué hay que traer. Dejá un renglón vacío para separar párrafos."
              className="sm:col-span-6"
            >
              <AreaTexto name="description" rows={7} defaultValue={taller?.description ?? ""} />
            </CampoConEtiqueta>
            <div className="sm:col-span-6">
              <SubidorImagen
                nombre="image_url"
                carpeta="talleres"
                etiqueta="Foto"
                ayuda="La de la tarjeta y la página. Mejor horizontal."
                valorInicial={taller?.image_url ?? ""}
              />
            </div>
          </div>
        </PanelAdmin>

        <PanelAdmin titulo="Materiales y visibilidad">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex items-start gap-2.5 text-sm text-carbon/80">
              <input
                type="checkbox"
                name="includes_materials"
                defaultChecked={taller?.includes_materials ?? false}
                className="mt-0.5 h-4 w-4 accent-acento-fuerte"
              />
              <span>
                <span className="font-semibold text-nogal">Materiales incluidos</span>
                <br />
                Se muestra en la página del taller.
              </span>
            </label>
            <label className="flex items-start gap-2.5 text-sm text-carbon/80">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={taller?.is_active ?? true}
                className="mt-0.5 h-4 w-4 accent-acento-fuerte"
              />
              <span>
                <span className="font-semibold text-nogal">Visible en la página</span>
                <br />
                Si lo destildás, deja de aparecer pero no se borra.
              </span>
            </label>
            <CampoConEtiqueta
              etiqueta="Aclaración sobre materiales"
              ayuda="Por ejemplo: traé tu pieza, o los materiales se compran aparte"
              className="sm:col-span-2"
            >
              <Campo name="materials_note" defaultValue={taller?.materials_note ?? ""} />
            </CampoConEtiqueta>
          </div>
        </PanelAdmin>
      </FormularioAdmin>

      {taller ? (
        <>
          <PanelAdmin
            titulo="Avisame cuando haya fecha"
            texto="Personas que pidieron que les avises cuando abras fechas. Las de una fecha llena están en cada fecha."
            className="mt-10"
          >
            <ListaEspera
              anotadas={espera}
              taller={taller.name}
              enlaceTaller={`${sitio}/taller/${taller.slug}`}
              volver={`/admin/talleres/${taller.id}`}
            />
          </PanelAdmin>

          <PanelAdmin
            titulo="Borrar el taller"
            texto="Se borran también sus fechas y su lista de espera. Si tiene inscripciones, no se puede."
            className="mt-6 border-alerta/30"
          >
            <FormularioConfirmado
              accion={borrarTaller}
              mensaje={`¿Borrar "${taller.name}" con sus fechas para siempre? Si solo querés esconderlo, destildá Visible.`}
            >
              <input type="hidden" name="id" value={taller.id} />
              <button type="submit" className={estilosBoton("peligro", "sm")}>
                <Trash2 className="h-4 w-4" />
                Borrar definitivamente
              </button>
            </FormularioConfirmado>
          </PanelAdmin>
        </>
      ) : null}
    </>
  );
}
