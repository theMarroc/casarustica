import type { Metadata } from "next";
import { AlertTriangle, Trash2 } from "lucide-react";

import { guardarAjustes } from "@/actions/admin/contenido";
import { alternarZona, borrarZona, guardarZona } from "@/actions/admin/envios";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { SelectorApariencia } from "@/components/admin/selector-apariencia";
import { SubidorImagen } from "@/components/admin/subidor";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { Logo } from "@/components/ui/marca";
import { estiloValido, letraValida } from "@/lib/apariencia";
import { getAjustes, getZonasEnvio } from "@/lib/db";
import { ajuste, ajusteCrudo, ajusteQuitable, esVerdadero } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Ajustes",
  robots: { index: false, follow: false },
};

export default async function AjustesAdmin() {
  const [ajustes, zonas] = await Promise.all([getAjustes(), getZonasEnvio(true)]);
  const mpConfigurado = Boolean(process.env.MP_ACCESS_TOKEN);

  return (
    <>
      <TituloAdmin
        titulo="Ajustes"
        texto="La apariencia, los logos, los datos de contacto, cómo cobrás y cómo entregás."
      />

      <div className="flex flex-col gap-6">
        {/* ------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Apariencia"
          texto="La letra y los colores de todo el sitio. Elegí una opción, mirá la muestra y guardá para aplicarla."
        >
          <FormularioAdmin accion={guardarAjustes} textoBoton="Aplicar al sitio">
            <SelectorApariencia
              letra={letraValida(ajustes.apariencia_letra)}
              estilo={estiloValido(ajustes.apariencia_estilo)}
              nombre={ajuste(ajustes, "marca_nombre")}
              bajada={ajuste(ajustes, "marca_bajada")}
            />
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Logos"
          texto="Mientras no subas un logo, se muestra el nombre escrito con la letra de la marca."
        >
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-3">
                <SubidorImagen
                  nombre="ajuste_logo_url"
                  carpeta="marca"
                  etiqueta="Logo de Casa Rústica"
                  ayuda="Va en el encabezado y en el pie. Mejor en PNG con fondo transparente."
                  valorInicial={ajusteCrudo(ajustes, "logo_url")}
                />
                <MuestraLogo
                  nombre={ajuste(ajustes, "marca_nombre")}
                  bajada={ajuste(ajustes, "marca_bajada")}
                  logoUrl={ajusteCrudo(ajustes, "logo_url")}
                />
              </div>

              <SubidorImagen
                nombre="ajuste_logo_taller_url"
                carpeta="marca"
                etiqueta="Logo del taller Azul Tiffany"
                ayuda="El de la mariposa. Se usa en la sección del taller."
                valorInicial={ajusteCrudo(ajustes, "logo_taller_url")}
              />
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Marca y contacto">
          <FormularioAdmin accion={guardarAjustes}>
            <div className="grid gap-4 sm:grid-cols-2">
              <CampoConEtiqueta etiqueta="Nombre de la marca">
                <Campo
                  name="ajuste_marca_nombre"
                  defaultValue={ajuste(ajustes, "marca_nombre")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Bajada del nombre"
                ayuda="Va debajo del nombre cuando no hay logo"
              >
                <Campo
                  name="ajuste_marca_bajada"
                  defaultValue={ajuste(ajustes, "marca_bajada")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Frase de la marca" ayuda="Se ve en el pie y en Nosotros">
                <Campo
                  name="ajuste_marca_claim"
                  defaultValue={ajuste(ajustes, "marca_claim")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Número de WhatsApp"
                requerido
                ayuda="Con código de país y sin espacios. Ej: 5492291551234"
              >
                <Campo
                  name="ajuste_whatsapp_numero"
                  inputMode="numeric"
                  defaultValue={ajusteCrudo(ajustes, "whatsapp_numero")}
                  placeholder="5492291551234"
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Mensaje que aparece escrito"
                ayuda="Cuando alguien toca el botón de WhatsApp"
              >
                <Campo
                  name="ajuste_whatsapp_mensaje"
                  defaultValue={ajuste(ajustes, "whatsapp_mensaje")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Email de contacto" ayuda="Opcional">
                <Campo
                  name="ajuste_email_contacto"
                  type="email"
                  defaultValue={ajusteCrudo(ajustes, "email_contacto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Link de Instagram"
                ayuda="Si lo borrás, el ícono deja de aparecer"
              >
                <Campo
                  name="ajuste_instagram_url"
                  type="url"
                  defaultValue={ajusteQuitable(ajustes, "instagram_url")}
                  placeholder="https://www.instagram.com/casarustica.deco"
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Link de Facebook" ayuda="Opcional">
                <Campo
                  name="ajuste_facebook_url"
                  type="url"
                  defaultValue={ajusteCrudo(ajustes, "facebook_url")}
                />
              </CampoConEtiqueta>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Cómo cobrás">
          <FormularioAdmin accion={guardarAjustes}>
            <input
              type="hidden"
              name="__interruptores"
              value="pago_transferencia_activo,pago_mercadopago_activo,pago_efectivo_activo"
            />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 rounded-marca border border-piedra/30 bg-lino/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                  <input
                    type="checkbox"
                    name="ajuste_pago_transferencia_activo"
                    defaultChecked={esVerdadero(
                      ajustes.pago_transferencia_activo ?? "true",
                    )}
                    className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                  />
                  <span>
                    <span className="font-semibold text-nogal">
                      Cobrar por transferencia
                    </span>
                    <br />
                    El cliente transfiere y sube el comprobante en la web.
                  </span>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <CampoConEtiqueta etiqueta="Titular de la cuenta">
                    <Campo
                      name="ajuste_transferencia_titular"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_titular")}
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Banco o billetera">
                    <Campo
                      name="ajuste_transferencia_banco"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_banco")}
                      placeholder="Mercado Pago, Banco Nación..."
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="Alias">
                    <Campo
                      name="ajuste_transferencia_alias"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_alias")}
                      placeholder="casarustica.deco"
                    />
                  </CampoConEtiqueta>

                  <CampoConEtiqueta etiqueta="CBU o CVU">
                    <Campo
                      name="ajuste_transferencia_cbu"
                      inputMode="numeric"
                      defaultValue={ajusteCrudo(ajustes, "transferencia_cbu")}
                    />
                  </CampoConEtiqueta>
                </div>
              </div>

              <div className="rounded-marca border border-piedra/30 bg-lino/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                  <input
                    type="checkbox"
                    name="ajuste_pago_mercadopago_activo"
                    defaultChecked={esVerdadero(ajustes.pago_mercadopago_activo)}
                    disabled={!mpConfigurado}
                    className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                  />
                  <span>
                    <span className="font-semibold text-nogal">
                      Cobrar con Mercado Pago
                    </span>
                    <br />
                    El cliente paga con tarjeta o dinero en cuenta y el pedido se marca
                    como pagado solo.
                  </span>
                </label>

                {!mpConfigurado ? (
                  <p className="mt-3 flex items-start gap-2 rounded-marca border border-acento/50 bg-acento/15 px-3 py-2.5 text-xs leading-relaxed text-nogal">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
                    Para activarlo falta cargar la credencial de Mercado Pago
                    (MP_ACCESS_TOKEN) en el servidor. Está explicado en el README: es una
                    clave secreta, así que no se puede cargar desde acá.
                  </p>
                ) : null}
              </div>

              <div className="rounded-marca border border-piedra/30 bg-lino/40 p-4">
                <label className="flex items-start gap-2.5 text-sm text-carbon/80">
                  <input
                    type="checkbox"
                    name="ajuste_pago_efectivo_activo"
                    defaultChecked={esVerdadero(ajustes.pago_efectivo_activo ?? "true")}
                    className="mt-0.5 h-4 w-4 accent-acento-fuerte"
                  />
                  <span>
                    <span className="font-semibold text-nogal">
                      Cobrar en efectivo al retirar
                    </span>
                    <br />
                    Solo aparece si el cliente elige retirar en el showroom. Si el pedido
                    lleva seña, la seña se paga igual por Mercado Pago o transferencia.
                  </span>
                </label>
              </div>
            </div>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin titulo="Envíos y retiro">
          <FormularioAdmin accion={guardarAjustes}>
            <input type="hidden" name="__interruptores" value="retiro_activo" />

            <div className="grid gap-4 sm:grid-cols-3">
              <CampoConEtiqueta
                etiqueta="Condiciones de envío"
                className="sm:col-span-3"
                ayuda="Se ven al elegir el envío: días de entrega, cómo se coordina, qué no se envía..."
              >
                <AreaTexto
                  name="ajuste_envio_condiciones"
                  rows={3}
                  defaultValue={ajusteCrudo(ajustes, "envio_condiciones")}
                  placeholder="Enviamos los martes y viernes. Te escribimos por WhatsApp para coordinar el horario."
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Envío gratis desde"
                ayuda="0 = sin envío gratis"
              >
                <Campo
                  name="ajuste_envio_gratis_desde"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={ajustes.envio_gratis_desde ?? "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Pedido mínimo" ayuda="0 = sin mínimo">
                <Campo
                  name="ajuste_pedido_minimo"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={ajustes.pedido_minimo ?? "0"}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Dirección de retiro"
                className="sm:col-span-3"
                ayuda="Se muestra a quien elige retirar"
              >
                <Campo
                  name="ajuste_retiro_direccion"
                  defaultValue={ajusteCrudo(ajustes, "retiro_direccion")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Texto de la zona de entrega"
                className="sm:col-span-3"
              >
                <AreaTexto
                  name="ajuste_zona_delivery_texto"
                  rows={2}
                  defaultValue={ajuste(ajustes, "zona_delivery_texto")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta etiqueta="Título de la sección" className="sm:col-span-1">
                <Campo
                  name="ajuste_zona_delivery_titulo"
                  defaultValue={ajuste(ajustes, "zona_delivery_titulo")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Título en cursiva"
                className="sm:col-span-2"
                ayuda="La parte que se ve en color"
              >
                <Campo
                  name="ajuste_zona_delivery_titulo_cursiva"
                  defaultValue={ajuste(ajustes, "zona_delivery_titulo_cursiva")}
                />
              </CampoConEtiqueta>

              <CampoConEtiqueta
                etiqueta="Mapa de la zona"
                className="sm:col-span-3"
                ayuda='En Google Maps: Compartir › Insertar un mapa › copiá solo el link que está dentro de src="..."'
              >
                <Campo
                  name="ajuste_mapa_embed_url"
                  type="url"
                  defaultValue={ajusteCrudo(ajustes, "mapa_embed_url")}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
              </CampoConEtiqueta>
            </div>

            <label className="mt-4 flex items-start gap-2.5 text-sm text-carbon/80">
              <input
                type="checkbox"
                name="ajuste_retiro_activo"
                defaultChecked={esVerdadero(ajustes.retiro_activo ?? "true")}
                className="mt-0.5 h-4 w-4 accent-acento-fuerte"
              />
              <span>
                <span className="font-semibold text-nogal">Permitir retiro</span>
                <br />
                Aparece la opción de retirar sin costo al finalizar el pedido.
              </span>
            </label>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Inscripciones al taller"
          texto="Las fechas, cupos y precios se cargan en cada taller."
        >
          <FormularioAdmin accion={guardarAjustes}>
            <CampoConEtiqueta
              etiqueta="Horas que se guarda el lugar"
              ayuda="Si alguien se inscribe y no paga en ese tiempo, el lugar se libera para otra persona."
              className="max-w-xs"
            >
              <Campo
                name="ajuste_taller_reserva_horas"
                type="number"
                min={1}
                max={720}
                step={1}
                inputMode="numeric"
                defaultValue={ajuste(ajustes, "taller_reserva_horas")}
              />
            </CampoConEtiqueta>
          </FormularioAdmin>
        </PanelAdmin>

        {/* ------------------------------------------------------------- */}
        <PanelAdmin
          titulo="Zonas de envío"
          texto="El cliente elige su zona al finalizar el pedido. Si dejás el costo vacío, figura como “a coordinar”."
        >
          <div className="flex flex-col gap-3">
            {zonas.map((zona) => (
              <div
                key={zona.id}
                className="flex flex-wrap items-end gap-3 rounded-marca border border-piedra/25 bg-lino/40 p-3"
              >
                <FormularioAdmin
                  accion={guardarZona}
                  textoBoton="Guardar"
                  tamano="sm"
                  variante="secundario"
                  className="flex flex-1 flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="id" value={zona.id} />
                  <CampoConEtiqueta etiqueta="Zona" className="min-w-40 flex-1">
                    <Campo name="name" defaultValue={zona.name} />
                  </CampoConEtiqueta>
                  <CampoConEtiqueta etiqueta="Costo" className="w-32">
                    <Campo
                      name="cost"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      defaultValue={zona.cost === null ? "" : String(zona.cost)}
                      placeholder="A coordinar"
                    />
                  </CampoConEtiqueta>
                  <CampoConEtiqueta etiqueta="Orden" className="w-20">
                    <Campo name="sort_order" type="number" defaultValue={String(zona.sort_order)} />
                  </CampoConEtiqueta>
                </FormularioAdmin>

                <label className="mb-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-piedra-oscura">
                    Visible
                  </span>
                  <Interruptor
                    accion={alternarZona}
                    campos={{ id: zona.id }}
                    activo={zona.is_active}
                    etiqueta={`Ofrecer envíos a ${zona.name}`}
                  />
                </label>

                <FormularioConfirmado
                  accion={borrarZona}
                  mensaje={`¿Borrar la zona "${zona.name}"?`}
                  className="mb-1"
                >
                  <input type="hidden" name="id" value={zona.id} />
                  <button
                    type="submit"
                    title="Borrar"
                    className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-alerta/10 hover:text-alerta"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </FormularioConfirmado>
              </div>
            ))}

            <FormularioAdmin
              accion={guardarZona}
              textoBoton="Agregar zona"
              limpiarAlGuardar
              tamano="sm"
              className="flex flex-wrap items-end gap-3 rounded-marca border border-dashed border-piedra/50 p-3"
            >
              <CampoConEtiqueta etiqueta="Zona" className="min-w-40 flex-1">
                <Campo name="name" placeholder="Mar de Cobo" />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Costo" className="w-32">
                <Campo
                  name="cost"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="A coordinar"
                />
              </CampoConEtiqueta>
              <CampoConEtiqueta etiqueta="Orden" className="w-20">
                <Campo name="sort_order" type="number" defaultValue={String(zonas.length + 1)} />
              </CampoConEtiqueta>
            </FormularioAdmin>
          </div>
        </PanelAdmin>
      </div>
    </>
  );
}

function MuestraLogo(props: { nombre: string; bajada: string; logoUrl: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs text-piedra-oscura">Así se ve en el encabezado:</span>
      <div className="flex h-18 items-center rounded-marca border border-piedra/30 bg-lino px-4 sm:w-64">
        <Logo {...props} />
      </div>
    </div>
  );
}
