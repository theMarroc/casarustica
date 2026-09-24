import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, CreditCard, Package, Truck, Wallet } from "lucide-react";

import { AgregarConCantidad } from "@/components/cart/boton-agregar";
import { GaleriaProducto } from "@/components/shop/galeria-producto";
import { GrillaProductos } from "@/components/shop/tarjeta-producto";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { getAjustes, getOfertas, getProducto, getProductos, getZonasEnvio } from "@/lib/db";
import { calcularPrecio, calcularSena, etiquetaOferta } from "@/lib/pricing";
import { aNumero, ajuste, esVerdadero, linkWhatsapp } from "@/lib/settings";
import { formatARS } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const producto = await getProducto(slug);

  if (!producto) return { title: "Producto no encontrado" };

  return {
    title: producto.name,
    description: producto.description ?? undefined,
    openGraph: {
      title: producto.name,
      description: producto.description ?? undefined,
      images: producto.images[0]?.url ? [producto.images[0].url] : undefined,
    },
  };
}

export default async function PaginaProducto({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [producto, ofertas, ajustes, zonas] = await Promise.all([
    getProducto(slug),
    getOfertas(),
    getAjustes(),
    getZonasEnvio(),
  ]);

  if (!producto || !producto.is_active) notFound();

  const precio = calcularPrecio(producto, ofertas);
  const agotado = producto.track_stock && producto.stock <= 0;
  const sena = calcularSena(producto, precio.final);
  const aPedido = producto.fulfillment === "a_pedido";
  const envioGratis = aNumero(ajustes.envio_gratis_desde);
  const costos = zonas.map((z) => z.cost).filter((c): c is number => c !== null);
  const retiro = esVerdadero(ajustes.retiro_activo ?? "true");
  const mediosDePago = [
    esVerdadero(ajustes.pago_mercadopago_activo) ? "Mercado Pago" : null,
    esVerdadero(ajustes.pago_transferencia_activo ?? "true") ? "transferencia" : null,
    retiro && esVerdadero(ajustes.pago_efectivo_activo ?? "true") ? "efectivo al retirar" : null,
  ].filter(Boolean);

  const relacionados = producto.category
    ? (await getProductos({ categoria: producto.category.slug }))
        .filter((p) => p.id !== producto.id)
        .slice(0, 4)
    : [];

  return (
    <>
      <div className="contenedor pt-8">
        <nav
          aria-label="Ubicación"
          className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-piedra-oscura"
        >
          <Link href="/" className="transition-colors hover:text-nogal">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tienda" className="transition-colors hover:text-nogal">
            Tienda
          </Link>
          {producto.category ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/tienda?categoria=${producto.category.slug}`}
                className="transition-colors hover:text-nogal"
              >
                {producto.category.name}
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <article className="contenedor grid gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <GaleriaProducto imagenes={producto.images} nombre={producto.name} />

        <div className="flex flex-col">
          {precio.oferta ? (
            <Insignia className="mb-3 self-start bg-acento-fuerte text-white">
              {etiquetaOferta(precio.oferta, precio)}
            </Insignia>
          ) : null}

          <h1 className="font-display text-[clamp(1.75rem,1.4rem+1.4vw,2.5rem)] leading-tight text-nogal">
            {producto.name}
          </h1>

          {producto.unit ? (
            <p className="mt-2 text-sm text-piedra-oscura">{producto.unit}</p>
          ) : null}

          <span className="linea-decorativa mt-5" />

          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-display text-4xl text-carbon">{formatARS(precio.final)}</p>
            {precio.oferta ? (
              <p className="text-lg text-piedra-oscura line-through">{formatARS(precio.lista)}</p>
            ) : null}
          </div>

          {precio.descuento > 0 ? (
            <p className="mt-1 text-sm font-semibold text-salvia">
              Ahorrás {formatARS(precio.descuento)}
            </p>
          ) : null}

          {producto.description ? (
            <p className="mt-6 text-[15px] leading-relaxed text-carbon/75">
              {producto.description}
            </p>
          ) : null}

          {aPedido || sena > 0 ? (
            <div className="mt-6 flex flex-col gap-2 rounded-marca border border-acento/50 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
              {aPedido ? (
                <p className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    <strong className="font-semibold">Se hace a pedido.</strong>{" "}
                    {producto.lead_time
                      ? `Demora aproximada: ${producto.lead_time}.`
                      : "Te confirmamos la demora por WhatsApp."}
                  </span>
                </p>
              ) : null}
              {sena > 0 ? (
                <p className="flex items-start gap-2.5">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span>
                    <strong className="font-semibold">Seña de {formatARS(sena)}</strong> al
                    comprar. El resto ({formatARS(precio.final - sena)}) lo pagás al
                    retirarlo o al recibirlo.
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8">
            <AgregarConCantidad
              agotado={agotado}
              stockMaximo={producto.track_stock ? producto.stock : undefined}
              campos={producto.custom_fields}
              item={{
                tipo: "product",
                id: producto.id,
                slug: producto.slug,
                nombre: producto.name,
                precio: precio.final,
                precioLista: precio.lista,
                unidad: producto.unit,
                imagen: producto.images[0]?.url ?? null,
                sena,
                demora: aPedido ? (producto.lead_time ?? "a confirmar") : null,
              }}
            />
          </div>

          <a
            href={linkWhatsapp(
              ajuste(ajustes, "whatsapp_numero"),
              `¡Hola! Quería consultar por ${producto.name}`,
            )}
            target="_blank"
            rel="noreferrer"
            className={estilosBoton("secundario", "md", "mt-3 self-start")}
          >
            <IconoWhatsapp className="h-4 w-4" />
            Consultar por WhatsApp
          </a>

          <ul className="mt-8 flex flex-col gap-3 border-t border-piedra/25 pt-6 text-sm text-carbon/70">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-acento-fuerte" strokeWidth={1.4} />
              <span>
                Envío a domicilio{" "}
                {costos.length > 0
                  ? `desde ${formatARS(Math.min(...costos))}, según la zona`
                  : "con costo a coordinar según la zona"}
                {envioGratis > 0 ? <>, sin cargo desde {formatARS(envioGratis)}</> : null}.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CreditCard className="mt-0.5 h-4.5 w-4.5 shrink-0 text-acento-fuerte" strokeWidth={1.4} />
              <span>
                Pagás con {mediosDePago.join(", ").replace(/, ([^,]*)$/, " o $1")}.
              </span>
            </li>
            {retiro ? (
              <li className="flex items-start gap-3">
                <Package className="mt-0.5 h-4.5 w-4.5 shrink-0 text-acento-fuerte" strokeWidth={1.4} />
                <span>También podés retirarlo sin costo.</span>
              </li>
            ) : null}
          </ul>

          {producto.long_description ? (
            <div className="mt-8 border-t border-piedra/25 pt-6">
              <h2 className="font-display text-xl text-nogal">Más sobre este producto</h2>
              <div className="mt-3 flex flex-col gap-3 text-sm leading-relaxed text-carbon/75">
                {producto.long_description
                  .split(/\n{2,}/)
                  .map((parrafo, indice) => (
                    <p key={indice}>{parrafo}</p>
                  ))}
              </div>
            </div>
          ) : null}
        </div>
      </article>

      {relacionados.length > 0 ? (
        <section className="bg-lino py-16">
          <div className="contenedor">
            <h2 className="titulo-seccion text-nogal">
              También te puede <span className="cursiva-marca">gustar</span>
            </h2>
            <span className="linea-decorativa mt-5" />
            <div className="mt-10">
              <GrillaProductos productos={relacionados} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
