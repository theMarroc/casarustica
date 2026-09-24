import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";

import { borrarEvento, guardarEvento } from "@/actions/admin/trabajos";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { GestorImagenes } from "@/components/admin/subidor";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { getEventoPorId } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar evento",
  robots: { index: false, follow: false },
};

const TIPOS_SUGERIDOS = ["Boda", "Cumpleaños", "Bautismo", "Comunión", "Aniversario", "Empresa"];

export default async function EditorEvento({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const [{ id }, { nuevo, error }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";
  const evento = esNuevo ? null : await getEventoPorId(id);

  if (!esNuevo && !evento) notFound();

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo evento" : (evento?.title ?? "Evento")}
        volverA={{ href: "/admin/eventos", texto: "Volver a eventos" }}
      >
        {evento ? (
          <Link
            href={`/trabajos/${evento.slug}`}
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
          Evento creado.
        </p>
      ) : null}

      {error === "borrar" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          No se pudo borrar. Recargá la página y probá de nuevo.
        </p>
      ) : null}

      <FormularioAdmin
        accion={guardarEvento}
        textoBoton={esNuevo ? "Crear evento" : "Guardar cambios"}
        className="flex flex-col gap-6"
        extraBoton={
          <Link href="/admin/eventos" className={estilosBoton("fantasma", "md")}>
            Cancelar
          </Link>
        }
      >
        {evento ? <input type="hidden" name="id" value={evento.id} /> : null}

        <PanelAdmin titulo="Los datos">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Nombre" requerido className="sm:col-span-4">
              <Campo
                name="title"
                required
                defaultValue={evento?.title}
                placeholder="Boda de Lucía y Martín"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Tipo de evento"
              className="sm:col-span-2"
              ayuda="Se ve como etiqueta"
            >
              <Campo
                name="kind"
                list="tipos-de-evento"
                defaultValue={evento?.kind ?? ""}
                placeholder="Boda"
              />
              <datalist id="tipos-de-evento">
                {TIPOS_SUGERIDOS.map((tipo) => (
                  <option key={tipo} value={tipo} />
                ))}
              </datalist>
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Fecha" className="sm:col-span-2" ayuda="Opcional">
              <Campo name="event_date" type="date" defaultValue={evento?.event_date ?? ""} />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Lugar" className="sm:col-span-2" ayuda="Opcional">
              <Campo name="place" defaultValue={evento?.place ?? ""} placeholder="Miramar" />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Orden" className="sm:col-span-2" ayuda="Menor número, primero">
              <Campo
                name="sort_order"
                type="number"
                step={1}
                defaultValue={evento ? String(evento.sort_order) : "0"}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Qué se hizo"
              className="sm:col-span-6"
              ayuda="Ambientación, cartelería, souvenirs... Dejá un renglón vacío para separar párrafos."
            >
              <AreaTexto
                name="description"
                rows={5}
                defaultValue={evento?.description ?? ""}
                placeholder="Mesas vintage blancas, cartel de bienvenida y centros con hortensias en latas."
              />
            </CampoConEtiqueta>

            <label className="flex items-start gap-2.5 text-sm text-carbon/80 sm:col-span-6">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={evento?.is_active ?? true}
                className="mt-0.5 h-4 w-4 accent-acento-fuerte"
              />
              <span>
                <span className="font-semibold text-nogal">Visible en la página</span>
                <br />
                Si lo destildás, deja de aparecer pero no se borra.
              </span>
            </label>
          </div>
        </PanelAdmin>

        <PanelAdmin
          titulo="Fotos"
          texto="La primera es la portada del evento. Podés reordenarlas con las flechas."
        >
          <GestorImagenes
            carpeta="eventos"
            iniciales={(evento?.images ?? []).map((imagen) => ({
              url: imagen.url,
              alt: imagen.alt ?? "",
            }))}
          />
        </PanelAdmin>
      </FormularioAdmin>

      {evento ? (
        <PanelAdmin
          titulo="Borrar el evento"
          texto="Esto lo elimina para siempre, junto con sus fotos. Si solo querés esconderlo, destildá Visible."
          className="mt-10 border-alerta/30"
        >
          <FormularioConfirmado
            accion={borrarEvento}
            mensaje={`¿Borrar "${evento.title}" para siempre, con sus fotos?`}
          >
            <input type="hidden" name="id" value={evento.id} />
            <button type="submit" className={estilosBoton("peligro", "sm")}>
              <Trash2 className="h-4 w-4" />
              Borrar definitivamente
            </button>
          </FormularioConfirmado>
        </PanelAdmin>
      ) : null}
    </>
  );
}
