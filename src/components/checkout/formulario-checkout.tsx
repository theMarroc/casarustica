"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, CreditCard, Home, Landmark, Store } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { crearPedido, type ResultadoPedido } from "@/actions/pedidos";
import { useCarrito } from "@/components/cart/carrito";
import { DetalleLinea } from "@/components/cart/detalle-linea";
import { Boton, estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import type { Address, PaymentMethod, ZonaEnvio } from "@/lib/types";
import { cn, formatARS } from "@/lib/utils";

type Props = {
  usuario: { email: string; nombre: string; telefono: string } | null;
  direcciones: Address[];
  zonas: ZonaEnvio[];
  condicionesEnvio: string;
  envioGratisDesde: number;
  pedidoMinimo: number;
  retiroActivo: boolean;
  retiroDireccion: string;
  mercadopagoActivo: boolean;
  transferenciaActiva: boolean;
  efectivoActivo: boolean;
  whatsapp: string;
};

export function FormularioCheckout({
  usuario,
  direcciones,
  zonas,
  condicionesEnvio,
  envioGratisDesde,
  pedidoMinimo,
  retiroActivo,
  retiroDireccion,
  mercadopagoActivo,
  transferenciaActiva,
  efectivoActivo,
}: Props) {
  const router = useRouter();
  const { items, listo, subtotal, ahorro, senaTotal, saldoTotal, vaciar } = useCarrito();

  const [entrega, setEntrega] = useState<"delivery" | "pickup">("delivery");
  const [zonaId, setZonaId] = useState("");
  const [pago, setPago] = useState<PaymentMethod>(
    mercadopagoActivo ? "mercadopago" : "transfer",
  );
  const [direccionElegida, setDireccionElegida] = useState<string>(
    direcciones.find((d) => d.is_default)?.id ?? direcciones[0]?.id ?? "nueva",
  );

  const [estado, accion, enviando] = useActionState<ResultadoPedido, FormData>(
    crearPedido,
    null,
  );

  // Cuando el pedido se registra bien, vaciamos el carrito y navegamos:
  // a Mercado Pago (link externo) o a la página del pedido.
  useEffect(() => {
    if (estado?.ok) {
      vaciar();
      if (estado.url.startsWith("http")) {
        window.location.href = estado.url;
      } else {
        router.push(estado.url);
      }
    }
  }, [estado, router, vaciar]);

  if (!listo) {
    return <div className="h-96 animate-pulse rounded-marca bg-lino/60" />;
  }

  if (items.length === 0 && !estado?.ok) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-16 text-center">
        <p className="font-display text-xl text-nogal">No hay nada para pedir</p>
        <Link href="/tienda" className={estilosBoton("primario", "md")}>
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const envioGratis = envioGratisDesde > 0 && subtotal >= envioGratisDesde;
  const zona = zonas.find((z) => z.id === zonaId);
  const envio = entrega === "pickup" || envioGratis ? 0 : (zona?.cost ?? 0);
  const total = subtotal + envio;
  const aPagarAhora = total - saldoTotal;
  const faltaParaMinimo = Math.max(pedidoMinimo - subtotal, 0);

  // El efectivo es solo para retirar, y si hay seña esa parte se paga online.
  const opcionesPago: PaymentMethod[] = [
    ...(mercadopagoActivo ? (["mercadopago"] as const) : []),
    ...(transferenciaActiva ? (["transfer"] as const) : []),
    ...(efectivoActivo && entrega === "pickup" && senaTotal === 0 ? (["cash"] as const) : []),
  ];
  const pagoElegido = opcionesPago.includes(pago) ? pago : (opcionesPago[0] ?? "transfer");

  const direccionSeleccionada = direcciones.find((d) => d.id === direccionElegida);

  return (
    <form action={accion} className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          items.map((i) => ({
            tipo: i.tipo,
            id: i.id,
            cantidad: i.cantidad,
            ...(i.valores ? { valores: i.valores } : {}),
          })),
        )}
      />
      <input type="hidden" name="entrega" value={entrega} />
      <input type="hidden" name="pago" value={pagoElegido} />

      <div className="flex flex-col gap-8">
        {/* ---------------------------------------------------------------- */}
        <section>
          <h2 className="font-display text-2xl text-nogal">Tus datos</h2>
          <span className="linea-decorativa mt-3" />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <CampoConEtiqueta etiqueta="Nombre y apellido" requerido>
              <Campo
                name="nombre"
                required
                defaultValue={usuario?.nombre}
                autoComplete="name"
                placeholder="Como te conocemos"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="WhatsApp" requerido ayuda="Con característica">
              <Campo
                name="telefono"
                required
                type="tel"
                inputMode="tel"
                defaultValue={usuario?.telefono}
                autoComplete="tel"
                placeholder="2291 50 0000"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta
              etiqueta="Email"
              ayuda="Opcional, para mandarte el detalle"
              className="sm:col-span-2"
            >
              <Campo
                name="email"
                type="email"
                defaultValue={usuario?.email}
                autoComplete="email"
                placeholder="tu@correo.com"
              />
            </CampoConEtiqueta>
          </div>

          {!usuario ? (
            <p className="mt-3 text-xs text-piedra-oscura">
              Podés comprar sin cuenta.{" "}
              <Link
                href="/ingresar?volver=/checkout"
                className="underline transition-colors hover:text-acento-fuerte"
              >
                Si te registrás
              </Link>{" "}
              guardamos tus direcciones para la próxima.
            </p>
          ) : null}
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <h2 className="font-display text-2xl text-nogal">¿Cómo lo recibís?</h2>
          <span className="linea-decorativa mt-3" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <OpcionTarjeta
              activa={entrega === "delivery"}
              onClick={() => setEntrega("delivery")}
              icono={<Home className="h-5 w-5" strokeWidth={1.4} />}
              titulo="Envío a domicilio"
              detalle={envioGratis ? "Sin cargo por el monto del pedido" : "El costo depende de la zona"}
            />

            {retiroActivo ? (
              <OpcionTarjeta
                activa={entrega === "pickup"}
                onClick={() => setEntrega("pickup")}
                icono={<Store className="h-5 w-5" strokeWidth={1.4} />}
                titulo="Retiro en el showroom"
                detalle={retiroDireccion || "Sin cargo. Te pasamos la dirección por WhatsApp"}
              />
            ) : null}
          </div>

          {entrega === "delivery" ? (
            <div className="mt-5 flex flex-col gap-4">
              {zonas.length > 0 ? (
                <CampoConEtiqueta etiqueta="Zona de envío" requerido>
                  <Selector
                    name="zona"
                    required
                    value={zonaId}
                    onChange={(e) => setZonaId(e.target.value)}
                  >
                    <option value="">Elegí tu zona</option>
                    {zonas.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name}: {z.cost === null ? "a coordinar" : formatARS(z.cost)}
                      </option>
                    ))}
                  </Selector>
                </CampoConEtiqueta>
              ) : null}

              {condicionesEnvio ? (
                <p className="whitespace-pre-line rounded-marca border border-piedra/30 bg-lino/60 px-4 py-3 text-sm leading-relaxed text-carbon/75">
                  {condicionesEnvio}
                </p>
              ) : null}

              {direcciones.length > 0 ? (
                <CampoConEtiqueta etiqueta="Dirección guardada">
                  <Selector
                    value={direccionElegida}
                    onChange={(e) => setDireccionElegida(e.target.value)}
                  >
                    {direcciones.map((direccion) => (
                      <option key={direccion.id} value={direccion.id}>
                        {direccion.label}: {direccion.street} {direccion.number},{" "}
                        {direccion.city}
                      </option>
                    ))}
                    <option value="nueva">Usar otra dirección</option>
                  </Selector>
                </CampoConEtiqueta>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-6">
                <CampoConEtiqueta etiqueta="Calle" requerido className="sm:col-span-4">
                  <Campo
                    name="calle"
                    required
                    autoComplete="address-line1"
                    defaultValue={direccionSeleccionada?.street ?? ""}
                    key={`calle-${direccionElegida}`}
                  />
                </CampoConEtiqueta>

                <CampoConEtiqueta etiqueta="Número" requerido className="sm:col-span-2">
                  <Campo
                    name="numero"
                    required
                    defaultValue={direccionSeleccionada?.number ?? ""}
                    key={`numero-${direccionElegida}`}
                  />
                </CampoConEtiqueta>

                <CampoConEtiqueta
                  etiqueta="Piso / depto"
                  className="sm:col-span-2"
                  ayuda="Opcional"
                >
                  <Campo
                    name="piso"
                    defaultValue={direccionSeleccionada?.apartment ?? ""}
                    key={`piso-${direccionElegida}`}
                  />
                </CampoConEtiqueta>

                <CampoConEtiqueta
                  etiqueta="Localidad"
                  requerido
                  className="sm:col-span-2"
                >
                  <Campo
                    name="ciudad"
                    required
                    autoComplete="address-level2"
                    defaultValue={direccionSeleccionada?.city ?? ""}
                    key={`ciudad-${direccionElegida}`}
                  />
                </CampoConEtiqueta>

                <CampoConEtiqueta etiqueta="Barrio" className="sm:col-span-2" ayuda="Opcional">
                  <Campo
                    name="barrio"
                    defaultValue={direccionSeleccionada?.zone ?? ""}
                    key={`barrio-${direccionElegida}`}
                  />
                </CampoConEtiqueta>

                <CampoConEtiqueta
                  etiqueta="Indicaciones para la entrega"
                  className="sm:col-span-6"
                  ayuda="Timbre, color del portón, horarios en los que estás"
                >
                  <Campo
                    name="indicaciones"
                    defaultValue={direccionSeleccionada?.notes ?? ""}
                    key={`indicaciones-${direccionElegida}`}
                  />
                </CampoConEtiqueta>
              </div>

              {usuario ? (
                <label className="flex items-center gap-2.5 text-sm text-carbon/75">
                  <input
                    type="checkbox"
                    name="guardarDireccion"
                    className="h-4 w-4 accent-acento-fuerte"
                  />
                  Guardar esta dirección en mi cuenta
                </label>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <h2 className="font-display text-2xl text-nogal">¿Cómo pagás?</h2>
          <span className="linea-decorativa mt-3" />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {opcionesPago.includes("mercadopago") ? (
              <OpcionTarjeta
                activa={pagoElegido === "mercadopago"}
                onClick={() => setPago("mercadopago")}
                icono={<CreditCard className="h-5 w-5" strokeWidth={1.4} />}
                titulo="Mercado Pago"
                detalle="Tarjeta, dinero en cuenta o efectivo"
              />
            ) : null}

            {opcionesPago.includes("transfer") ? (
              <OpcionTarjeta
                activa={pagoElegido === "transfer"}
                onClick={() => setPago("transfer")}
                icono={<Landmark className="h-5 w-5" strokeWidth={1.4} />}
                titulo="Transferencia bancaria"
                detalle="Te pasamos el alias y nos mandás el comprobante"
              />
            ) : null}

            {opcionesPago.includes("cash") ? (
              <OpcionTarjeta
                activa={pagoElegido === "cash"}
                onClick={() => setPago("cash")}
                icono={<Banknote className="h-5 w-5" strokeWidth={1.4} />}
                titulo="Efectivo al retirar"
                detalle="Pagás cuando lo pasás a buscar por el showroom"
              />
            ) : null}
          </div>

          {senaTotal > 0 ? (
            <p className="mt-4 rounded-marca border border-acento/40 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
              Tu pedido tiene productos con seña: ahora pagás {formatARS(aPagarAhora)} y el
              resto ({formatARS(saldoTotal)}) al retirarlo o al recibirlo.
              {efectivoActivo && entrega === "pickup"
                ? " Ese resto lo podés pagar en efectivo."
                : ""}
            </p>
          ) : null}

          {pagoElegido === "transfer" ? (
            <p className="mt-4 rounded-marca border border-acento/40 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
              Cuando confirmes, te mostramos los datos para transferir. Para reservar el
              pedido necesitamos que nos subas el comprobante desde esa misma pantalla.
            </p>
          ) : null}

          {pagoElegido === "cash" ? (
            <p className="mt-4 rounded-marca border border-acento/40 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
              Pagás en efectivo cuando lo retirás. Te avisamos por WhatsApp cuando esté
              listo.
            </p>
          ) : null}
        </section>

        {/* ---------------------------------------------------------------- */}
        <section>
          <CampoConEtiqueta
            etiqueta="¿Querés agregar algo?"
            ayuda="Si es un regalo, para cuándo lo necesitás, colores que te gustan..."
          >
            <AreaTexto name="notas" rows={3} placeholder="Escribinos acá" />
          </CampoConEtiqueta>
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      <aside className="h-fit rounded-marca border border-piedra/30 bg-white p-6 shadow-suave lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-nogal">Tu pedido</h2>
        <span className="linea-decorativa mt-3" />

        <ul className="mt-5 flex flex-col gap-3 text-sm">
          {items.map((item) => (
            <li key={item.clave} className="flex justify-between gap-3">
              <span className="min-w-0 text-carbon/75">
                <span className="font-semibold text-carbon">{item.cantidad}×</span>{" "}
                {item.nombre}
                <DetalleLinea item={item} />
              </span>
              <span className="shrink-0 font-semibold text-carbon">
                {formatARS(item.precio * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-5 flex flex-col gap-2 border-t border-piedra/25 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-carbon/70">Subtotal</dt>
            <dd className="font-semibold">{formatARS(subtotal)}</dd>
          </div>
          {ahorro > 0 ? (
            <div className="flex justify-between text-salvia">
              <dt>Descuentos</dt>
              <dd className="font-semibold">-{formatARS(ahorro)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between">
            <dt className="text-carbon/70">Envío</dt>
            <dd className="font-semibold">
              {entrega === "pickup" ? (
                <span className="text-salvia">Retiro</span>
              ) : envioGratis ? (
                <span className="text-salvia">Sin cargo</span>
              ) : envio > 0 ? (
                formatARS(envio)
              ) : zona || zonas.length === 0 ? (
                "A coordinar"
              ) : (
                <span className="text-piedra-oscura">Elegí la zona</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-piedra/25 pt-4">
          <span className="text-sm uppercase tracking-[0.1em] text-piedra-oscura">Total</span>
          <span className="font-display text-2xl text-nogal">{formatARS(total)}</span>
        </div>

        {saldoTotal > 0 ? (
          <dl className="mt-3 flex flex-col gap-1.5 rounded-marca bg-acento/15 px-3 py-2.5 text-sm">
            <div className="flex justify-between font-semibold text-nogal">
              <dt>Pagás ahora</dt>
              <dd>{formatARS(aPagarAhora)}</dd>
            </div>
            <div className="flex justify-between text-carbon/70">
              <dt>Al retirar o recibir</dt>
              <dd>{formatARS(saldoTotal)}</dd>
            </div>
          </dl>
        ) : null}

        {estado && !estado.ok ? (
          <p
            aria-live="polite"
            className="mt-4 flex items-start gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-3 py-2.5 text-xs leading-relaxed text-alerta-oscura"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
            {estado.mensaje}
          </p>
        ) : null}

        {faltaParaMinimo > 0 ? (
          <p className="mt-4 rounded-marca bg-alerta/10 px-3 py-2 text-xs text-alerta-oscura">
            El pedido mínimo es de {formatARS(pedidoMinimo)}. Te faltan{" "}
            {formatARS(faltaParaMinimo)}.
          </p>
        ) : null}

        <Boton
          type="submit"
          tamano="lg"
          className="mt-5 w-full"
          disabled={enviando || faltaParaMinimo > 0}
        >
          {enviando
            ? "Registrando..."
            : pagoElegido === "mercadopago"
              ? "Pagar con Mercado Pago"
              : "Confirmar pedido"}
        </Boton>

        <p className="mt-3 text-center text-xs leading-relaxed text-piedra-oscura">
          No se cobra nada hasta que confirmes el pago.
        </p>
      </aside>
    </form>
  );
}

function OpcionTarjeta({
  activa,
  onClick,
  icono,
  titulo,
  detalle,
}: {
  activa: boolean;
  onClick: () => void;
  icono: React.ReactNode;
  titulo: string;
  detalle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex items-start gap-3 rounded-marca border p-4 text-left transition-colors",
        activa
          ? "border-acento-fuerte bg-acento-fuerte/5"
          : "border-piedra/40 bg-white hover:border-piedra",
      )}
    >
      <span className={cn("mt-0.5", activa ? "text-acento-fuerte" : "text-piedra-oscura")}>
        {icono}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-nogal">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-snug text-carbon/65">
          {detalle}
        </span>
      </span>
    </button>
  );
}
