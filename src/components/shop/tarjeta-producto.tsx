import Image from "next/image";
import Link from "next/link";

import { BotonAgregar } from "@/components/cart/boton-agregar";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { calcularPrecio, calcularSena, etiquetaOferta } from "@/lib/pricing";
import type { Combo, Offer, Product } from "@/lib/types";
import { formatARS } from "@/lib/utils";

export function TarjetaProducto({
  producto,
  ofertas,
}: {
  producto: Product;
  ofertas: Offer[];
}) {
  const precio = calcularPrecio(producto, ofertas);
  const imagen = producto.images[0]?.url ?? null;
  const agotado = producto.track_stock && producto.stock <= 0;
  const aPedido = producto.fulfillment === "a_pedido";
  const personalizable = producto.custom_fields.length > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca border border-piedra/25 bg-white shadow-suave transition-shadow duration-300 hover:shadow-tarjeta">
      <Link
        href={`/producto/${producto.slug}`}
        className="relative block aspect-4/5 overflow-hidden bg-arena/20"
      >
        {imagen ? (
          <Image
            src={imagen}
            alt={producto.images[0]?.alt ?? producto.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImagen texto={producto.name} />
        )}

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {precio.oferta ? (
            <Insignia className="bg-acento-fuerte text-white">
              {etiquetaOferta(precio.oferta, precio)}
            </Insignia>
          ) : null}
          {producto.is_featured && !precio.oferta ? (
            <Insignia className="bg-acento text-carbon">Destacado</Insignia>
          ) : null}
          {agotado ? (
            <Insignia className="bg-carbon text-hueso">Sin stock</Insignia>
          ) : null}
          {aPedido ? (
            <Insignia className="bg-white/90 text-nogal">
              {personalizable ? "Personalizable" : "A pedido"}
            </Insignia>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {producto.category ? (
          <p className="mb-1 text-[10px] uppercase tracking-[0.14em] text-piedra-oscura">
            {producto.category.name}
          </p>
        ) : null}

        <h3 className="font-display text-lg leading-snug text-nogal">
          <Link
            href={`/producto/${producto.slug}`}
            className="transition-colors hover:text-acento-fuerte"
          >
            {producto.name}
          </Link>
        </h3>

        {producto.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-carbon/65">
            {producto.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
          <div>
            {precio.oferta ? (
              <p className="text-xs text-piedra-oscura line-through">
                {formatARS(precio.lista)}
              </p>
            ) : null}
            <p className="font-display text-xl text-carbon">{formatARS(precio.final)}</p>
            {producto.unit ? (
              <p className="text-[11px] text-piedra-oscura">{producto.unit}</p>
            ) : null}
          </div>

          {personalizable ? (
            <Link
              href={`/producto/${producto.slug}`}
              className={estilosBoton("primario", "sm", "w-full sm:w-auto")}
            >
              Personalizar
            </Link>
          ) : (
            <BotonAgregar
              tamano="sm"
              etiqueta="Agregar"
              className="w-full sm:w-auto"
              agotado={agotado}
              item={{
                tipo: "product",
                id: producto.id,
                slug: producto.slug,
                nombre: producto.name,
                precio: precio.final,
                precioLista: precio.lista,
                unidad: producto.unit,
                imagen,
                sena: calcularSena(producto, precio.final),
                demora: aPedido ? (producto.lead_time ?? "a confirmar") : null,
              }}
            />
          )}
        </div>
      </div>
    </article>
  );
}

export function TarjetaCombo({ combo }: { combo: Combo }) {
  const cantidadItems = combo.items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-marca border border-acento/40 bg-white shadow-suave transition-shadow duration-300 hover:shadow-tarjeta">
      <Link
        href={`/sets/${combo.slug}`}
        className="relative block aspect-4/5 overflow-hidden bg-arena/20"
      >
        {combo.image_url ? (
          <Image
            src={combo.image_url}
            alt={combo.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImagen texto={combo.name} />
        )}
        <Insignia className="absolute left-3 top-3 bg-acento text-carbon">Set</Insignia>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg leading-snug text-nogal">
          <Link
            href={`/sets/${combo.slug}`}
            className="transition-colors hover:text-acento-fuerte"
          >
            {combo.name}
          </Link>
        </h3>

        {combo.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-carbon/65">
            {combo.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-col gap-3 pt-1 sm:flex-row sm:items-end sm:justify-between sm:gap-2">
          <div>
            <p className="font-display text-xl text-carbon">{formatARS(combo.price)}</p>
            {cantidadItems > 0 ? (
              <p className="text-[11px] text-piedra-oscura">{cantidadItems} productos</p>
            ) : null}
          </div>

          <BotonAgregar
            tamano="sm"
            etiqueta="Agregar"
            className="w-full sm:w-auto"
            item={{
              tipo: "combo",
              id: combo.id,
              slug: combo.slug,
              nombre: combo.name,
              precio: Number(combo.price),
              precioLista: Number(combo.price),
              unidad: cantidadItems > 0 ? `${cantidadItems} productos` : null,
              imagen: combo.image_url,
            }}
          />
        </div>
      </div>
    </article>
  );
}

export function GrillaProductos({
  productos,
  ofertas,
  vacio = "Todavía no hay productos para mostrar.",
}: {
  productos: Product[];
  ofertas: Offer[];
  vacio?: string;
}) {
  if (productos.length === 0) {
    return (
      <p className="rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-12 text-center text-sm text-piedra-oscura">
        {vacio}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
      {productos.map((producto) => (
        <TarjetaProducto key={producto.id} producto={producto} ofertas={ofertas} />
      ))}
    </div>
  );
}
