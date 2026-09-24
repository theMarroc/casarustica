import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, Trash2 } from "lucide-react";

import { borrarAntesDespues, guardarAntesDespues } from "@/actions/admin/trabajos";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import { Comparador } from "@/components/trabajos/comparador";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { getAntesDespuesPorId } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar antes y después",
  robots: { index: false, follow: false },
};

export default async function EditorAntesDespues({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const [{ id }, { nuevo, error }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";
  const trabajo = esNuevo ? null : await getAntesDespuesPorId(id);

  if (!esNuevo && !trabajo) notFound();

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo antes y después" : (trabajo?.title ?? "Trabajo")}
        volverA={{ href: "/admin/antes-y-despues", texto: "Volver a antes y después" }}
      />

      {nuevo === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Trabajo creado. Así se ve el comparador en la página.
        </p>
      ) : null}

      {error === "borrar" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          No se pudo borrar. Recargá la página y probá de nuevo.
        </p>
      ) : null}

      <FormularioAdmin
        accion={guardarAntesDespues}
        textoBoton={esNuevo ? "Crear trabajo" : "Guardar cambios"}
        className="flex flex-col gap-6"
        extraBoton={
          <Link href="/admin/antes-y-despues" className={estilosBoton("fantasma", "md")}>
            Cancelar
          </Link>
        }
      >
        {trabajo ? <input type="hidden" name="id" value={trabajo.id} /> : null}

        <PanelAdmin
          titulo="Las fotos"
          texto="Conviene que las dos sean del mismo encuadre y horizontales: así el comparador se luce."
        >
          <div className="grid gap-6 sm:grid-cols-2">
            <SubidorImagen
              nombre="before_url"
              carpeta="antes-y-despues"
              etiqueta="Antes"
              valorInicial={trabajo?.before_url ?? ""}
            />
            <SubidorImagen
              nombre="after_url"
              carpeta="antes-y-despues"
              etiqueta="Después"
              valorInicial={trabajo?.after_url ?? ""}
            />
          </div>
        </PanelAdmin>

        <PanelAdmin titulo="Los datos">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Título" requerido className="sm:col-span-4">
              <Campo
                name="title"
                required
                defaultValue={trabajo?.title}
                placeholder="Cómoda de los años 60"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Orden"
              className="sm:col-span-2"
              ayuda="Menor número, primero"
            >
              <Campo
                name="sort_order"
                type="number"
                step={1}
                defaultValue={trabajo ? String(trabajo.sort_order) : "0"}
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Qué se hizo"
              className="sm:col-span-6"
              ayuda="Opcional. Máximo 500 caracteres."
            >
              <AreaTexto
                name="description"
                rows={3}
                maxLength={500}
                defaultValue={trabajo?.description ?? ""}
                placeholder="Lijada, pintada a la tiza y con herrajes nuevos."
              />
            </CampoConEtiqueta>

            <label className="flex items-start gap-2.5 text-sm text-carbon/80 sm:col-span-6">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={trabajo?.is_active ?? true}
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
      </FormularioAdmin>

      {trabajo?.before_url && trabajo.after_url ? (
        <PanelAdmin titulo="Así se ve" className="mt-6">
          <div className="max-w-xl">
            <Comparador
              antes={trabajo.before_url}
              despues={trabajo.after_url}
              titulo={trabajo.title}
              sizes="576px"
            />
          </div>
        </PanelAdmin>
      ) : null}

      {trabajo ? (
        <PanelAdmin
          titulo="Borrar el trabajo"
          texto="Esto lo elimina para siempre. Si solo querés esconderlo, destildá Visible."
          className="mt-10 border-alerta/30"
        >
          <FormularioConfirmado
            accion={borrarAntesDespues}
            mensaje={`¿Borrar "${trabajo.title}" para siempre?`}
          >
            <input type="hidden" name="id" value={trabajo.id} />
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
