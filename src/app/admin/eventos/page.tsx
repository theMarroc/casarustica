import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { alternarEvento } from "@/actions/admin/trabajos";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getEventos } from "@/lib/db";
import { formatFechaDia } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Eventos",
  robots: { index: false, follow: false },
};

export default async function EventosAdmin() {
  const eventos = await getEventos(true);

  return (
    <>
      <TituloAdmin
        titulo="Eventos"
        texto="Bodas, cumpleaños y celebraciones que ambientaste, con sus fotos. Se ven en la página Trabajos."
      >
        <Link href="/admin/eventos/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo evento
        </Link>
      </TituloAdmin>

      <PanelAdmin className="p-0! sm:p-0!">
        {eventos.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no cargaste ningún evento.">
              <Link href="/admin/eventos/nuevo" className={estilosBoton("primario", "sm")}>
                Cargar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-piedra/20">
            {eventos.map((evento) => {
              const portada = evento.images[0]?.url;
              return (
                <li
                  key={evento.id}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-lino/50"
                >
                  <Link
                    href={`/admin/eventos/${evento.id}`}
                    className="relative h-14 w-18 shrink-0 overflow-hidden rounded-marca bg-arena/25"
                  >
                    {portada ? (
                      <Image src={portada} alt="" fill sizes="72px" className="object-cover" />
                    ) : (
                      <PlaceholderImagen texto={evento.title} />
                    )}
                  </Link>

                  <div className="min-w-40 flex-1">
                    <Link
                      href={`/admin/eventos/${evento.id}`}
                      className="font-display text-lg leading-snug text-nogal transition-colors hover:text-acento-fuerte"
                    >
                      {evento.title}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-piedra-oscura">
                      {evento.kind ? (
                        <Insignia className="bg-acento/40 text-nogal">{evento.kind}</Insignia>
                      ) : null}
                      {evento.event_date ? formatFechaDia(evento.event_date) : null}
                      {evento.place ? <>· {evento.place}</> : null}
                      <>
                        · {evento.images.length}{" "}
                        {evento.images.length === 1 ? "foto" : "fotos"}
                      </>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-piedra-oscura">
                        Visible
                      </span>
                      <Interruptor
                        accion={alternarEvento}
                        campos={{ id: evento.id }}
                        activo={evento.is_active}
                        etiqueta={`Mostrar ${evento.title} en la página`}
                      />
                    </label>

                    <Link
                      href={`/admin/eventos/${evento.id}`}
                      title="Editar"
                      className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-arena/30 hover:text-nogal"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </PanelAdmin>

      <p className="mt-5 text-xs leading-relaxed text-piedra-oscura">
        En la portada se ven los tres primeros (según el orden y la fecha).
      </p>
    </>
  );
}
