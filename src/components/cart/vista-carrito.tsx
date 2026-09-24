"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { useCarrito } from "@/components/cart/carrito";
import { Boton, estilosBoton } from "@/components/ui/boton";
import { PlaceholderImagen } from "@/components/ui/marca";
import { formatARS } from "@/lib/utils";

export function VistaCarrito({
  costoEnvio,
  envioGratisDesde,
  pedidoMinimo,
}: {
  costoEnvio: number;
  envioGratisDesde: number;
  pedidoMinimo: number;
}) {
  const { items, listo, subtotal, ahorro, cambiarCantidad, quitar, vaciar } =
    useCarrito();

  if (!listo) {
    return (
      <div className="h-64 animate-pulse rounded-marca border border-piedra/25 bg-lino/60" />
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-16 text-center">
        <ShoppingBag className="h-12 w-12 text-piedra-oscura/60" strokeWidth={1.1} />
        <div>
          <p className="font-display text-xl text-nogal">Tu pedido está vacío</p>
          <p className="mt-1 text-sm text-piedra-oscura">
            Cuando agregues productos los vas a ver acá.
          </p>
        </div>
        <Link href="/tienda" className={estilosBoton("primario", "md")}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const envioGratis = envioGratisDesde > 0 && subtotal >= envioGratisDesde;
  const envio = envioGratis ? 0 : costoEnvio;
  const faltaParaMinimo = Math.max(pedidoMinimo - subtotal, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <div>
        <ul className="divide-y divide-piedra/25 border-y border-piedra/25">
          {items.map((item) => (
            <li key={item.clave} className="flex gap-4 py-5">
              <Link
                href={
                  item.tipo === "combo"
                    ? `/sets/${item.slug}`
                    : `/producto/${item.slug}`
                }
                className="relative h-28 w-24 shrink-0 overflow-hidden rounded-marca bg-arena/25"
              >
                {item.imagen ? (
                  <Image
                    src={item.imagen}
                    alt={item.nombre}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <PlaceholderImagen texto={item.nombre} />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={
                        item.tipo === "combo"
                          ? `/sets/${item.slug}`
                          : `/producto/${item.slug}`
                      }
                      className="font-display text-lg leading-snug text-nogal transition-colors hover:text-acento-fuerte"
                    >
                      {item.nombre}
                    </Link>
                    {item.unidad ? (
                      <p className="text-xs text-piedra-oscura">{item.unidad}</p>
                    ) : null}
                    <p className="mt-1 text-sm text-carbon/70">
                      {formatARS(item.precio)} por unidad
                      {item.precioLista > item.precio ? (
                        <span className="ml-2 text-xs text-piedra-oscura line-through">
                          {formatARS(item.precioLista)}
                        </span>
                      ) : null}
                    </p>
                  </div>

                  <button
                    onClick={() => quitar(item.clave)}
                    className="p-1 text-piedra-oscura transition-colors hover:text-acento-fuerte"
                    aria-label={`Quitar ${item.nombre}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-marca border border-piedra/40 bg-white">
                    <button
                      onClick={() => cambiarCantidad(item.clave, item.cantidad - 1)}
                      className="px-2.5 py-2 text-nogal transition-colors hover:bg-arena/25"
                      aria-label="Quitar uno"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-semibold tabular-nums">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => cambiarCantidad(item.clave, item.cantidad + 1)}
                      className="px-2.5 py-2 text-nogal transition-colors hover:bg-arena/25"
                      aria-label="Agregar uno"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="font-display text-xl text-carbon">
                    {formatARS(item.precio * item.cantidad)}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <Link href="/tienda" className={estilosBoton("fantasma", "sm")}>
            Seguir comprando
          </Link>
          <Boton variante="peligro" tamano="sm" onClick={vaciar}>
            Vaciar el pedido
          </Boton>
        </div>
      </div>

      <aside className="h-fit rounded-marca border border-piedra/30 bg-white p-6 shadow-suave lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-nogal">Resumen</h2>
        <span className="linea-decorativa mt-3" />

        <dl className="mt-5 flex flex-col gap-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-carbon/70">Productos</dt>
            <dd className="font-semibold text-carbon">{formatARS(subtotal)}</dd>
          </div>

          {ahorro > 0 ? (
            <div className="flex justify-between text-salvia">
              <dt>Descuentos aplicados</dt>
              <dd className="font-semibold">-{formatARS(ahorro)}</dd>
            </div>
          ) : null}

          <div className="flex justify-between">
            <dt className="text-carbon/70">Envío</dt>
            <dd className="font-semibold text-carbon">
              {envioGratis ? (
                <span className="text-salvia">Sin cargo</span>
              ) : envio > 0 ? (
                formatARS(envio)
              ) : (
                "A coordinar"
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-piedra/25 pt-4">
          <span className="text-sm uppercase tracking-[0.1em] text-piedra-oscura">Total</span>
          <span className="font-display text-2xl text-nogal">
            {formatARS(subtotal + envio)}
          </span>
        </div>

        {!envioGratis && envioGratisDesde > 0 ? (
          <p className="mt-3 rounded-marca bg-acento/20 px-3 py-2 text-xs text-nogal">
            Te faltan {formatARS(envioGratisDesde - subtotal)} para el envío sin cargo.
          </p>
        ) : null}

        {faltaParaMinimo > 0 ? (
          <p className="mt-3 rounded-marca bg-alerta/10 px-3 py-2 text-xs text-alerta-oscura">
            El pedido mínimo es de {formatARS(pedidoMinimo)}. Te faltan{" "}
            {formatARS(faltaParaMinimo)}.
          </p>
        ) : null}

        <Link
          href="/checkout"
          aria-disabled={faltaParaMinimo > 0}
          className={estilosBoton(
            "primario",
            "lg",
            `mt-5 w-full ${faltaParaMinimo > 0 ? "pointer-events-none opacity-50" : ""}`,
          )}
        >
          Finalizar pedido
        </Link>

        <p className="mt-3 text-center text-xs leading-relaxed text-piedra-oscura">
          En el paso siguiente elegís cómo pagar y dónde querés recibirlo.
        </p>
      </aside>
    </div>
  );
}
