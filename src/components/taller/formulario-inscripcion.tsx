"use client";

import { useRouter } from "next/navigation";
import { AlertCircle, CreditCard, Landmark, Loader2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { inscribirEnTaller } from "@/actions/inscripciones";
import type { ResultadoPedido } from "@/actions/pedidos";
import { OpcionTarjeta } from "@/components/checkout/opcion-tarjeta";
import { FormularioEspera } from "@/components/taller/formulario-espera";
import { Boton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import { MAXIMO_PERSONAS } from "@/lib/talleres";
import { cn, formatARS } from "@/lib/utils";

/** Una fecha ya preparada en el servidor (texto, seña y lugares libres). */
export type OpcionFecha = {
  id: string;
  inicio: string;
  horario: string | null;
  precio: number;
  nota: string | null;
  sena: number;
  libres: number;
};

type Usuario = { nombre: string; email: string; telefono: string } | null;

export function FormularioInscripcion({
  tallerId,
  fechas,
  fechaInicial,
  mercadopagoActivo,
  transferenciaActiva,
  reservaHoras,
  usuario,
}: {
  tallerId: string;
  fechas: OpcionFecha[];
  fechaInicial?: string;
  mercadopagoActivo: boolean;
  transferenciaActiva: boolean;
  reservaHoras: number;
  usuario: Usuario;
}) {
  const router = useRouter();
  const [fechaId, setFechaId] = useState(
    fechas.find((f) => f.id === fechaInicial)?.id ??
      fechas.find((f) => f.libres > 0)?.id ??
      fechas[0]?.id,
  );
  const [personas, setPersonas] = useState(1);
  const [pago, setPago] = useState<"mercadopago" | "transfer">(
    mercadopagoActivo ? "mercadopago" : "transfer",
  );
  const [estado, accion, enviando] = useActionState<ResultadoPedido, FormData>(
    inscribirEnTaller,
    null,
  );

  useEffect(() => {
    if (!estado?.ok) return;
    if (estado.url.startsWith("http")) window.location.href = estado.url;
    else router.push(estado.url);
  }, [estado, router]);

  const fecha = fechas.find((f) => f.id === fechaId);
  if (!fecha) return null;

  const tope = Math.min(fecha.libres, MAXIMO_PERSONAS);
  const cantidad = Math.min(personas, Math.max(tope, 1));
  const total = fecha.precio * cantidad;
  const ahora = fecha.sena > 0 ? fecha.sena * cantidad : total;
  const pagoElegido = pago === "mercadopago" && !mercadopagoActivo ? "transfer" : pago;
  const sinMediosDePago = total > 0 && !mercadopagoActivo && !transferenciaActiva;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h3 className="font-display text-2xl text-nogal">Elegí la fecha</h3>
        <span className="linea-decorativa mt-3" />
        <div className="mt-5 grid gap-3">
          {fechas.map((opcion) => {
            const activa = opcion.id === fechaId;
            return (
              <button
                key={opcion.id}
                type="button"
                onClick={() => setFechaId(opcion.id)}
                aria-pressed={activa}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-marca border p-4 text-left transition-colors",
                  activa
                    ? "border-acento-fuerte bg-acento/10"
                    : "border-piedra/40 bg-white hover:border-piedra",
                )}
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-nogal first-letter:uppercase">
                    {opcion.inicio}
                  </span>
                  {opcion.horario ? (
                    <span className="mt-0.5 block text-xs text-carbon/65">{opcion.horario}</span>
                  ) : null}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-display text-lg text-carbon">
                    {opcion.precio > 0 ? formatARS(opcion.precio) : "Sin costo"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
                      opcion.libres === 0
                        ? "bg-carbon/10 text-carbon/65"
                        : opcion.libres <= 3
                          ? "bg-acento-fuerte text-white"
                          : "bg-acento/45 text-nogal",
                    )}
                  >
                    {opcion.libres === 0
                      ? "Completo"
                      : `${opcion.libres} lugar${opcion.libres === 1 ? "" : "es"}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {fecha.nota ? <p className="mt-3 text-xs text-carbon/65">{fecha.nota}</p> : null}
      </section>

      {fecha.libres === 0 ? (
        <section>
          <h3 className="font-display text-2xl text-nogal">Esta fecha está completa</h3>
          <span className="linea-decorativa mt-3" />
          <p className="mt-4 text-sm leading-relaxed text-carbon/70">
            Dejanos tus datos y te avisamos por WhatsApp si se libera un lugar.
          </p>
          <div className="mt-5">
            <FormularioEspera key={fecha.id} tallerId={tallerId} fechaId={fecha.id} usuario={usuario} />
          </div>
        </section>
      ) : sinMediosDePago ? (
        <p className="rounded-marca border border-acento/40 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
          Por ahora la inscripción se hace por WhatsApp. Escribinos y te guardamos el lugar.
        </p>
      ) : (
        <form action={accion} className="flex flex-col gap-8">
          <input type="hidden" name="fecha" value={fecha.id} />
          <input type="hidden" name="pago" value={pagoElegido} />
          <input
            type="text"
            name="sitio_web"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-px w-px opacity-0"
          />

          <section>
            <h3 className="font-display text-2xl text-nogal">Tus datos</h3>
            <span className="linea-decorativa mt-3" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Nombre y apellido" requerido>
                <Campo name="nombre" required autoComplete="name" defaultValue={usuario?.nombre} />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="WhatsApp" requerido ayuda="Te confirmamos el lugar por ahí">
                <Campo
                  name="telefono"
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="2291 50 0000"
                  defaultValue={usuario?.telefono}
                />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Email" ayuda="Opcional">
                <Campo name="email" type="email" autoComplete="email" defaultValue={usuario?.email} />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="¿Cuántas personas?">
                <Selector
                  name="personas"
                  value={String(cantidad)}
                  onChange={(e) => setPersonas(Number(e.target.value))}
                >
                  {Array.from({ length: tope }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Selector>
              </CampoConEtiqueta>
            </div>
          </section>

          {total > 0 ? (
            <section>
              <h3 className="font-display text-2xl text-nogal">¿Cómo pagás?</h3>
              <span className="linea-decorativa mt-3" />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {mercadopagoActivo ? (
                  <OpcionTarjeta
                    activa={pagoElegido === "mercadopago"}
                    onClick={() => setPago("mercadopago")}
                    icono={<CreditCard className="h-5 w-5" strokeWidth={1.4} />}
                    titulo="Mercado Pago"
                    detalle="Tarjeta, dinero en cuenta o efectivo"
                  />
                ) : null}
                {transferenciaActiva ? (
                  <OpcionTarjeta
                    activa={pagoElegido === "transfer"}
                    onClick={() => setPago("transfer")}
                    icono={<Landmark className="h-5 w-5" strokeWidth={1.4} />}
                    titulo="Transferencia bancaria"
                    detalle="Te pasamos el alias y nos mandás el comprobante"
                  />
                ) : null}
              </div>
              {pagoElegido === "transfer" ? (
                <p className="mt-4 rounded-marca border border-acento/40 bg-acento/15 px-4 py-3 text-sm leading-relaxed text-nogal">
                  Te guardamos el lugar {reservaHoras} horas. Si en ese tiempo no nos llega el
                  comprobante, se libera para otra persona.
                </p>
              ) : null}
            </section>
          ) : null}

          <CampoConEtiqueta etiqueta="¿Querés contarnos algo?" ayuda="Si ya pintaste antes, si venís con alguien...">
            <AreaTexto name="notas" rows={3} />
          </CampoConEtiqueta>

          <div className="rounded-marca border border-piedra/30 bg-lino/60 p-5">
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-carbon/70">
                  {cantidad} {cantidad === 1 ? "persona" : "personas"} ×{" "}
                  {fecha.precio > 0 ? formatARS(fecha.precio) : "sin costo"}
                </dt>
                <dd className="font-display text-xl text-nogal">
                  {total > 0 ? formatARS(total) : "Sin costo"}
                </dd>
              </div>
              {fecha.sena > 0 ? (
                <>
                  <div className="flex justify-between gap-4 border-t border-piedra/25 pt-2">
                    <dt className="text-carbon/70">Ahora, la seña</dt>
                    <dd className="font-semibold">{formatARS(ahora)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-carbon/70">El resto, en el taller</dt>
                    <dd className="font-semibold">{formatARS(total - ahora)}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>

          {estado && !estado.ok ? (
            <p
              aria-live="polite"
              className="flex items-start gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-3 py-2.5 text-sm text-alerta-oscura"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
              {estado.mensaje}
            </p>
          ) : null}

          <Boton type="submit" tamano="lg" disabled={enviando || estado?.ok} className="self-start">
            {enviando || estado?.ok ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {total === 0
              ? "Inscribirme"
              : pagoElegido === "mercadopago"
                ? "Inscribirme y pagar"
                : "Inscribirme"}
          </Boton>
        </form>
      )}
    </div>
  );
}
