import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, CheckCircle2, ExternalLink, Trash2 } from "lucide-react";

import { borrarServicio, guardarServicio } from "@/actions/admin/servicios";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { SubidorImagen } from "@/components/admin/subidor";
import { estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import { getServicioPorId } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar servicio",
  robots: { index: false, follow: false },
};

export default async function EditorServicio({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string; error?: string }>;
}) {
  const [{ id }, { nuevo, error }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";
  const servicio = esNuevo ? null : await getServicioPorId(id);
  if (!esNuevo && !servicio) notFound();

  const opcion = (nombre: string, activa: boolean, titulo: string, detalle: string) => (
    <label className="flex items-start gap-2.5 text-sm text-carbon/80">
      <input
        type="checkbox"
        name={nombre}
        defaultChecked={activa}
        className="mt-0.5 h-4 w-4 accent-acento-fuerte"
      />
      <span>
        <span className="font-semibold text-nogal">{titulo}</span>
        <br />
        {detalle}
      </span>
    </label>
  );

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo servicio" : (servicio?.name ?? "Servicio")}
        volverA={{ href: "/admin/servicios", texto: "Volver a servicios" }}
      >
        {servicio ? (
          <Link
            href={`/servicios/${servicio.slug}`}
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
          Servicio creado.
        </p>
      ) : null}
      {error === "borrar" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          No se pudo borrar. Recargá la página y probá de nuevo.
        </p>
      ) : null}

      <FormularioAdmin
        accion={guardarServicio}
        textoBoton={esNuevo ? "Crear servicio" : "Guardar cambios"}
        className="flex flex-col gap-6"
        extraBoton={
          <Link href="/admin/servicios" className={estilosBoton("fantasma", "md")}>
            Cancelar
          </Link>
        }
      >
        {servicio ? <input type="hidden" name="id" value={servicio.id} /> : null}

        <PanelAdmin titulo="Lo básico">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Nombre" requerido className="sm:col-span-4">
              <Campo
                name="name"
                required
                defaultValue={servicio?.name}
                placeholder="Restauración y reciclado"
              />
            </CampoConEtiqueta>
            <CampoConEtiqueta etiqueta="Orden" ayuda="Menor número, primero" className="sm:col-span-2">
              <Campo
                name="sort_order"
                type="number"
                step={1}
                defaultValue={servicio ? String(servicio.sort_order) : "0"}
              />
            </CampoConEtiqueta>
            <CampoConEtiqueta
              etiqueta="Resumen"
              ayuda="Se ve en la tarjeta. Máximo 240 caracteres."
              className="sm:col-span-6"
            >
              <AreaTexto
                name="summary"
                rows={2}
                maxLength={240}
                defaultValue={servicio?.summary ?? ""}
              />
            </CampoConEtiqueta>
            <CampoConEtiqueta
              etiqueta="Descripción"
              ayuda="Se ve en la página del servicio. Dejá un renglón vacío para separar párrafos."
              className="sm:col-span-6"
            >
              <AreaTexto name="description" rows={6} defaultValue={servicio?.description ?? ""} />
            </CampoConEtiqueta>
            <div className="sm:col-span-6">
              <SubidorImagen
                nombre="image_url"
                carpeta="servicios"
                etiqueta="Foto"
                ayuda="La de la tarjeta y la página. Mejor horizontal."
                valorInicial={servicio?.image_url ?? ""}
              />
            </div>
          </div>
        </PanelAdmin>

        <PanelAdmin
          titulo="El formulario de presupuesto"
          texto="Siempre pide nombre, WhatsApp, localidad y un mensaje. Elegí qué más pedir."
        >
          <div className="flex flex-col gap-3">
            {opcion("asks_photos", servicio?.asks_photos ?? true, "Fotos", "El cliente puede mandar hasta 6 fotos.")}
            {opcion("asks_measures", servicio?.asks_measures ?? false, "Medidas", "Alto, ancho y profundidad, para muebles.")}
            {opcion("asks_date", servicio?.asks_date ?? false, "Fecha del evento", "Para ambientaciones y eventos.")}
          </div>
        </PanelAdmin>

        <PanelAdmin titulo="Trabajos que se muestran">
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoConEtiqueta
              etiqueta="En la página del servicio"
              ayuda="Se toman de Trabajos, los que estén visibles"
            >
              <Selector name="showcase" defaultValue={servicio?.showcase ?? "none"}>
                <option value="none">Ninguno</option>
                <option value="antes_despues">Antes y después</option>
                <option value="eventos">Eventos</option>
              </Selector>
            </CampoConEtiqueta>
            <label className="flex items-start gap-2.5 self-end text-sm text-carbon/80">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={servicio?.is_active ?? true}
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

      {servicio ? (
        <PanelAdmin
          titulo="Borrar el servicio"
          texto="Los pedidos de presupuesto que ya llegaron no se borran."
          className="mt-10 border-alerta/30"
        >
          <FormularioConfirmado
            accion={borrarServicio}
            mensaje={`¿Borrar "${servicio.name}" para siempre? Si solo querés esconderlo, destildá Visible.`}
          >
            <input type="hidden" name="id" value={servicio.id} />
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
