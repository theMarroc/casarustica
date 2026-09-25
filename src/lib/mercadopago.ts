import type { OrderItem } from "./types";

type DatosPreferencia = {
  pedidoId: string;
  codigo: string;
  token: string;
  lineas: Omit<OrderItem, "id" | "order_id">[];
  envio: number;
  /** Si el pedido lleva seña, lo que se cobra ahora, en una sola línea. */
  aPagarAhora: number | null;
  /** Título de esa línea única. */
  tituloSena?: string;
  email?: string;
};

/** Crea la preferencia de Checkout Pro y devuelve el link de pago. */
export async function crearPreferencia(datos: DatosPreferencia): Promise<string | null> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const sitio = process.env.NEXT_PUBLIC_SITE_URL;
  if (!accessToken || !sitio) return null;

  try {
    const { MercadoPagoConfig, Preference } = await import("mercadopago");
    const cliente = new MercadoPagoConfig({ accessToken });
    const preferencia = new Preference(cliente);

    const volverA = `${sitio}/pedido/${datos.codigo}?t=${datos.token}`;

    const items =
      datos.aPagarAhora !== null
        ? [
            {
              id: datos.codigo,
              title: datos.tituloSena ?? `Pedido ${datos.codigo}: seña y pago al confirmar`,
              quantity: 1,
              unit_price: datos.aPagarAhora,
              currency_id: "ARS",
            },
          ]
        : [
            ...datos.lineas.map((linea) => ({
              id: linea.product_id ?? linea.combo_id ?? linea.session_id ?? linea.name,
              title: linea.name,
              quantity: linea.quantity,
              unit_price: Number(linea.unit_price),
              currency_id: "ARS",
            })),
            ...(datos.envio > 0
              ? [
                  {
                    id: "envio",
                    title: "Envío a domicilio",
                    quantity: 1,
                    unit_price: datos.envio,
                    currency_id: "ARS",
                  },
                ]
              : []),
          ];

    const respuesta = await preferencia.create({
      body: {
        items,
        payer: datos.email ? { email: datos.email } : undefined,
        external_reference: datos.pedidoId,
        statement_descriptor: "CASA RUSTICA",
        back_urls: { success: volverA, pending: volverA, failure: volverA },
        auto_return: "approved",
        notification_url: `${sitio}/api/mercadopago/webhook`,
      },
    });

    return respuesta.init_point ?? null;
  } catch (error) {
    console.error("[mercadopago] no se pudo crear la preferencia", error);
    return null;
  }
}
