import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, ExternalLink, Trash2 } from "lucide-react";

import { borrarProducto, guardarProducto } from "@/actions/admin/productos";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { EditorPersonalizacion } from "@/components/admin/editor-personalizacion";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { GestorImagenes } from "@/components/admin/subidor";
import { estilosBoton } from "@/components/ui/boton";
import {
  AreaTexto,
  Campo,
  CampoConEtiqueta,
  Selector,
} from "@/components/ui/campos";
import { getCategorias, getProductoPorId } from "@/lib/db";

export const metadata: Metadata = {
  title: "Editar producto",
  robots: { index: false, follow: false },
};

export default async function EditorProducto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nuevo?: string }>;
}) {
  const [{ id }, { nuevo }] = await Promise.all([params, searchParams]);
  const esNuevo = id === "nuevo";

  const [producto, categorias] = await Promise.all([
    esNuevo ? Promise.resolve(null) : getProductoPorId(id),
    getCategorias(true),
  ]);

  if (!esNuevo && !producto) notFound();

  return (
    <>
      <TituloAdmin
        titulo={esNuevo ? "Nuevo producto" : (producto?.name ?? "Producto")}
        volverA={{ href: "/admin/productos", texto: "Volver a productos" }}
      >
        {producto ? (
          <Link
            href={`/producto/${producto.slug}`}
            target="_blank"
            className={estilosBoton("secundario", "sm")}
          >
            <ExternalLink className="h-4 w-4" />
            Ver en la tienda
          </Link>
        ) : null}
      </TituloAdmin>

      {nuevo === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Producto creado. Ya podés subirle las fotos.
        </p>
      ) : null}

      <FormularioAdmin
        accion={guardarProducto}
        textoBoton={esNuevo ? "Crear producto" : "Guardar cambios"}
        className="flex flex-col gap-6"
        extraBoton={
          producto ? (
            <Link
              href="/admin/productos"
              className={estilosBoton("fantasma", "md")}
            >
              Cancelar
            </Link>
          ) : undefined
        }
      >
        {producto ? <input type="hidden" name="id" value={producto.id} /> : null}

        <PanelAdmin titulo="Lo básico">
          <div className="grid gap-4 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Nombre" requerido className="sm:col-span-4">
              <Campo
                name="name"
                required
                defaultValue={producto?.name}
                placeholder="Bandeja desayunador con patas"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Presentación"
              className="sm:col-span-2"
              ayuda="250 g, unidad, x6..."
            >
              <Campo name="unit" defaultValue={producto?.unit ?? ""} />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Categoría" className="sm:col-span-3">
              <Selector name="category_id" defaultValue={producto?.category_id ?? ""}>
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.name}
                  </option>
                ))}
              </Selector>
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Precio"
              requerido
              className="sm:col-span-3"
              ayuda="Solo el número, sin puntos ni signo $"
            >
              <Campo
                name="price"
                type="number"
                min={0}
                step={1}
                required
                inputMode="numeric"
                defaultValue={producto ? String(producto.price) : ""}
                placeholder="4800"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Descripción corta"
              className="sm:col-span-6"
              ayuda="Se ve en la tarjeta del producto. Máximo 300 caracteres."
            >
              <AreaTexto
                name="description"
                rows={2}
                maxLength={300}
                defaultValue={producto?.description ?? ""}
                placeholder="Madera pintada a mano, con patas plegables."
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Descripción larga"
              className="sm:col-span-6"
              ayuda="Se ve en la página del producto. Dejá un renglón vacío para separar párrafos."
            >
              <AreaTexto
                name="long_description"
                rows={5}
                defaultValue={producto?.long_description ?? ""}
              />
            </CampoConEtiqueta>
          </div>
        </PanelAdmin>

        <PanelAdmin
          titulo="Fotos"
          texto="La primera foto es la que se ve en la tienda. Podés reordenarlas con las flechas."
        >
          <GestorImagenes
            iniciales={(producto?.images ?? []).map((imagen) => ({
              url: imagen.url,
              alt: imagen.alt ?? "",
            }))}
          />
        </PanelAdmin>

        <PanelAdmin
          titulo="Cómo se vende"
          texto="Si se hace a pedido, en la tienda se ve la demora y no se controla el stock."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-3">
              <legend className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-nogal">
                Modalidad
              </legend>
              <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                <input
                  type="radio"
                  name="fulfillment"
                  value="stock"
                  defaultChecked={(producto?.fulfillment ?? "stock") === "stock"}
                  className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                />
                <span>
                  <span className="font-semibold text-nogal">Lo tengo hecho</span>
                  <br />
                  Se entrega enseguida. Podés controlar el stock abajo.
                </span>
              </label>
              <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                <input
                  type="radio"
                  name="fulfillment"
                  value="a_pedido"
                  defaultChecked={producto?.fulfillment === "a_pedido"}
                  className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                />
                <span>
                  <span className="font-semibold text-nogal">Se hace a pedido</span>
                  <br />
                  Lo hacés cuando alguien lo compra.
                </span>
              </label>
              <CampoConEtiqueta etiqueta="Demora" ayuda="Solo si se hace a pedido. Ej: 10 a 15 días">
                <Campo name="lead_time" defaultValue={producto?.lead_time ?? ""} />
              </CampoConEtiqueta>
            </fieldset>

            <div className="flex flex-col gap-3">
              <CampoConEtiqueta
                etiqueta="Seña"
                ayuda="Lo que se paga al comprar. El resto, al retirar o al recibir."
              >
                <Selector name="deposit_type" defaultValue={producto?.deposit_type ?? "none"}>
                  <option value="none">Sin seña: se paga todo al comprar</option>
                  <option value="percent">Porcentaje del precio</option>
                  <option value="amount">Monto fijo por unidad</option>
                </Selector>
              </CampoConEtiqueta>
              <CampoConEtiqueta
                etiqueta="Valor de la seña"
                ayuda="Un número: 50 es 50% o $50, según lo que elegiste arriba"
              >
                <Campo
                  name="deposit_value"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={
                    producto && producto.deposit_type !== "none"
                      ? String(producto.deposit_value)
                      : ""
                  }
                />
              </CampoConEtiqueta>
            </div>
          </div>
        </PanelAdmin>

        <PanelAdmin
          titulo="Personalización"
          texto="Los datos que completa el cliente al pedirlo: nombres, una fecha, el color... Si no agregás ninguno, se vende tal cual."
        >
          <EditorPersonalizacion iniciales={producto?.custom_fields ?? []} />
        </PanelAdmin>

        <PanelAdmin titulo="Stock y visibilidad">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                <input
                  type="checkbox"
                  name="is_active"
                  defaultChecked={producto?.is_active ?? true}
                  className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                />
                <span>
                  <span className="font-semibold text-nogal">Visible en la tienda</span>
                  <br />
                  Si lo destildás, deja de aparecer pero no se borra.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={producto?.is_featured ?? false}
                  className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                />
                <span>
                  <span className="font-semibold text-nogal">Destacado</span>
                  <br />
                  Aparece en la sección &ldquo;Lo más elegido&rdquo; de la portada.
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                <input
                  type="checkbox"
                  name="track_stock"
                  defaultChecked={producto?.track_stock ?? false}
                  className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                />
                <span>
                  <span className="font-semibold text-nogal">Controlar stock</span>
                  <br />
                  Descuenta unidades con cada pedido y avisa cuando se agota. No
                  aplica a lo que se hace a pedido.
                </span>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Stock" ayuda="Solo si controlás stock">
                <Campo
                  name="stock"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={producto ? String(producto.stock) : "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Orden" ayuda="Menor número, primero">
                <Campo
                  name="sort_order"
                  type="number"
                  step={1}
                  defaultValue={producto ? String(producto.sort_order) : "0"}
                />
              </CampoConEtiqueta>
            </div>
          </div>
        </PanelAdmin>
      </FormularioAdmin>

      {producto ? (
        <PanelAdmin
          titulo="Borrar el producto"
          texto="Esto lo elimina para siempre, junto con sus fotos. Si solo querés dejar de venderlo, usá el interruptor de arriba."
          className="mt-10 border-alerta/30"
        >
          <FormularioConfirmado
            accion={borrarProducto}
            mensaje={`¿Borrar "${producto.name}" para siempre, con sus fotos? Si solo querés dejar de venderlo, apagá "Visible" en la lista de productos.`}
          >
            <input type="hidden" name="id" value={producto.id} />
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
