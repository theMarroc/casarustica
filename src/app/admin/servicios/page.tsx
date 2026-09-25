import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { alternarServicio } from "@/actions/admin/servicios";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getServicios } from "@/lib/db";

export const metadata: Metadata = {
  title: "Servicios",
  robots: { index: false, follow: false },
};

export default async function ServiciosAdmin() {
  const servicios = await getServicios(true);

  return (
    <>
      <TituloAdmin
        titulo="Servicios"
        texto="Lo que ofrecés además de la tienda. Cada servicio tiene su página con un formulario para pedir presupuesto."
      >
        <Link href="/admin/servicios/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo servicio
        </Link>
      </TituloAdmin>

      <PanelAdmin className="p-0! sm:p-0!">
        {servicios.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no hay servicios cargados.">
              <Link href="/admin/servicios/nuevo" className={estilosBoton("primario", "sm")}>
                Cargar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-piedra/20">
            {servicios.map((servicio) => (
              <li
                key={servicio.id}
                className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-lino/50"
              >
                <Link
                  href={`/admin/servicios/${servicio.id}`}
                  className="relative h-14 w-18 shrink-0 overflow-hidden rounded-marca bg-arena/25"
                >
                  {servicio.image_url ? (
                    <Image src={servicio.image_url} alt="" fill sizes="72px" className="object-cover" />
                  ) : (
                    <PlaceholderImagen texto={servicio.name} />
                  )}
                </Link>

                <div className="min-w-40 flex-1">
                  <Link
                    href={`/admin/servicios/${servicio.id}`}
                    className="font-display text-lg leading-snug text-nogal transition-colors hover:text-acento-fuerte"
                  >
                    {servicio.name}
                  </Link>
                  {servicio.summary ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-piedra-oscura">
                      {servicio.summary}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-piedra-oscura">
                      Visible
                    </span>
                    <Interruptor
                      accion={alternarServicio}
                      campos={{ id: servicio.id }}
                      activo={servicio.is_active}
                      etiqueta={`Mostrar ${servicio.name} en la página`}
                    />
                  </label>
                  <Link
                    href={`/admin/servicios/${servicio.id}`}
                    title="Editar"
                    className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-arena/30 hover:text-nogal"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PanelAdmin>
    </>
  );
}
