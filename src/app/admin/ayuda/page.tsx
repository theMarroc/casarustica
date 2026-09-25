import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";

export const metadata: Metadata = {
  title: "Ayuda",
  robots: { index: false, follow: false },
};

const PRIMEROS_PASOS: { texto: string; href: string; donde: string }[] = [
  {
    texto: "Tu número de WhatsApp: es adonde te escriben los clientes. También tus redes.",
    href: "/admin/ajustes",
    donde: "Ajustes › Marca y contacto",
  },
  {
    texto: "El alias o CBU y el titular, para que te puedan transferir.",
    href: "/admin/ajustes",
    donde: "Ajustes › Cómo cobrás",
  },
  {
    texto: "La dirección de retiro (es también la del taller), las condiciones de envío y el costo de cada zona.",
    href: "/admin/ajustes",
    donde: "Ajustes › Envíos y retiro",
  },
  {
    texto: "El logo de Casa Rústica y el de la mariposa del taller.",
    href: "/admin/ajustes",
    donde: "Ajustes › Logos",
  },
  {
    texto: "La foto grande de la portada.",
    href: "/admin/contenido",
    donde: "Textos y fotos › Portada",
  },
  { texto: "Los primeros productos, con sus fotos.", href: "/admin/productos", donde: "Productos" },
  {
    texto: "Las fechas de cada taller, para abrir la inscripción.",
    href: "/admin/talleres",
    donde: "Talleres",
  },
];

const TEMAS: { titulo: string; puntos: string[] }[] = [
  {
    titulo: "Pedidos: cómo se cobra",
    puntos: [
      "Cada pedido llega a Pedidos con un código: CR- para la tienda y TA- para las inscripciones al taller. El menú y el Resumen te muestran los que hay que revisar.",
      "Transferencia: el cliente ve tu alias y sube el comprobante. Abrí el pedido, tocá Ver el comprobante, fijate en tu banco que llegó y pasalo a Pagado, o a Seña pagada si pagó solo la seña.",
      "Efectivo: es solo para retirar en el showroom y sin seña. Cobrás cuando lo entregás.",
      "Mercado Pago (cuando lo actives): el pedido pasa solo a Pagado o a Seña pagada.",
      "Después seguís con En preparación, Listo para entregar y Entregado. Si lo cancelás, el stock vuelve solo.",
      "El botón Escribirle abre WhatsApp con el cliente y el código del pedido ya escrito.",
    ],
  },
  {
    titulo: "Productos",
    puntos: [
      "Lo básico: nombre, precio, categoría y descripciones. La primera foto es la de la tarjeta; las fotos se achican solas.",
      "Cómo se vende: con stock (se descuenta con cada pedido) o a pedido (se muestra la demora). La seña es opcional, en porcentaje o monto fijo.",
      "Personalización: campos que completa el cliente, como nombres, una fecha o colores. Aparecen en el pedido.",
      "Destildá Visible para esconder un producto sin borrarlo. Los destacados aparecen en la portada.",
      "Sets y kits: varios productos juntos a un precio especial.",
    ],
  },
  {
    titulo: "Precios y ofertas",
    puntos: [
      "Ofertas: por porcentaje o monto fijo, para toda la tienda, una categoría o un producto, con fecha de inicio y fin. Si un producto entra en varias, se aplica la que más le conviene al cliente.",
      "Aumentar precios: sube (o baja) todos los precios un porcentaje, con vista previa y redondeo. Se puede deshacer desde el Historial.",
    ],
  },
  {
    titulo: "Taller Azul Tiffany",
    puntos: [
      "En Talleres creás cada taller o profesorado con su contenido, duración, materiales y foto.",
      "Cada taller tiene fechas: día y hora de inicio, horario, cupo, precio por persona y seña (opcional). Si destildás Inscripción abierta, la fecha deja de verse en la página.",
      "La gente se inscribe y paga desde la web. Cada inscripción llega a Pedidos con código TA- y se confirma igual que un pedido.",
      "Si alguien se inscribe y no paga, le guardamos el lugar 48 horas (lo cambiás en Ajustes › Inscripciones al taller). Después el lugar se libera y en la fecha aparece Reserva vencida: podés cancelarla.",
      "Lista de espera: si la fecha se llena, la gente se anota. En cada fecha ves quiénes esperan, con un botón para avisarles por WhatsApp; marcalas como Avisada así llevás la cuenta. Si un taller no tiene fechas, pueden pedir que les avises cuando abras.",
      "Una fecha con inscripciones no se puede borrar: cancelá las inscripciones o cerrá la fecha.",
    ],
  },
  {
    titulo: "Presupuestos de servicios",
    puntos: [
      "Restauración, ambientación y asesoría tienen su página con un formulario. Las consultas llegan a Presupuestos con las fotos que mandaron.",
      "Respondé con Responder por WhatsApp, anotá el monto y tus notas (solo las ves vos) y cambiá el estado: Presupuestada, Aceptada, Terminada o Descartada.",
      "En Servicios elegís qué pide cada formulario (fotos, medidas, fecha del evento) y qué trabajos se muestran en su página.",
    ],
  },
  {
    titulo: "Trabajos",
    puntos: [
      "Antes y después: dos fotos del mismo mueble u objeto. En la página se comparan deslizando.",
      "Eventos: las fotos de cada boda o celebración que ambientaste.",
    ],
  },
  {
    titulo: "La página",
    puntos: [
      "Secciones: prendé, apagá y ordená los bloques de la portada.",
      "Textos y fotos: todos los textos, la portada, la página Nosotros, la del taller, los beneficios y las preguntas frecuentes.",
      "Ajustes › Apariencia: la tipografía y el estilo de color (Casa Rústica o Azul Tiffany).",
    ],
  },
  {
    titulo: "Consejos",
    puntos: [
      "Las fotos quedan mejor horizontales y con buena luz.",
      "Antes de borrar algo, pensá en esconderlo (destildar Visible): así no se pierde nada.",
      "Los enlaces a comprobantes y fotos de clientes vencen en una hora. Si no abren, recargá la página.",
      "Los clientes pueden comprar sin cuenta: con el link de su pedido ven cómo va.",
    ],
  },
];

export default function Ayuda() {
  return (
    <>
      <TituloAdmin
        titulo="Ayuda"
        texto="Cómo se usa el panel. Tocá cada tema para abrirlo."
      />

      <PanelAdmin
        titulo="Para empezar"
        texto="Lo que conviene cargar antes de compartir la página."
        className="mb-6"
      >
        <ol className="flex flex-col gap-3">
          {PRIMEROS_PASOS.map((paso, indice) => (
            <li key={paso.texto} className="flex gap-3 text-sm leading-relaxed text-carbon/80">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-acento/40 text-[11px] font-bold text-nogal">
                {indice + 1}
              </span>
              <span>
                {paso.texto}{" "}
                <Link href={paso.href} className="font-semibold text-acento-fuerte hover:underline">
                  {paso.donde}
                </Link>
              </span>
            </li>
          ))}
        </ol>
      </PanelAdmin>

      <div className="flex flex-col gap-3">
        {TEMAS.map((tema) => (
          <details
            key={tema.titulo}
            className="group rounded-marca border border-piedra/30 bg-white shadow-suave"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-lg text-nogal">
              {tema.titulo}
              <ChevronDown className="h-4 w-4 shrink-0 text-piedra-oscura transition-transform group-open:rotate-180" />
            </summary>
            <ul className="flex flex-col gap-2.5 border-t border-piedra/20 px-5 py-4">
              {tema.puntos.map((punto) => (
                <li key={punto} className="flex gap-2.5 text-sm leading-relaxed text-carbon/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-arena" />
                  {punto}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </>
  );
}
