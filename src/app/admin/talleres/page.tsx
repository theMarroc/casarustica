import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { alternarTaller } from "@/actions/admin/talleres";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Insignia } from "@/components/ui/campos";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getTalleres } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { describirInicio, fechasVigentes } from "@/lib/talleres";
import { TIPOS_TALLER } from "@/lib/types";

export const metadata: Metadata = {
  title: "Talleres",
  robots: { index: false, follow: false },
};

export default async function TalleresAdmin() {
  const supabase = await createClient();
  const [talleres, { data: espera }] = await Promise.all([
    getTalleres(true),
    supabase.from("workshop_waitlist").select("workshop_id").eq("status", "esperando"),
  ]);

  const enEspera = new Map<string, number>();
  for (const fila of espera ?? []) {
    enEspera.set(fila.workshop_id, (enEspera.get(fila.workshop_id) ?? 0) + 1);
  }

  return (
    <>
      <TituloAdmin
        titulo="Talleres y profesorado"
        texto="Cada taller tiene sus fechas, con cupo, precio y seña. La gente se inscribe y paga desde la página del taller."
      >
        <Link href="/admin/talleres/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo taller
        </Link>
      </TituloAdmin>

      <PanelAdmin className="p-0! sm:p-0!">
        {talleres.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no hay talleres cargados.">
              <Link href="/admin/talleres/nuevo" className={estilosBoton("primario", "sm")}>
                Cargar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-piedra/20">
            {talleres.map((taller) => {
              const proximas = fechasVigentes(taller);
              const esperando = enEspera.get(taller.id) ?? 0;
              return (
                <li
                  key={taller.id}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-lino/50"
                >
                  <Link
                    href={`/admin/talleres/${taller.id}`}
                    className="relative h-14 w-18 shrink-0 overflow-hidden rounded-marca bg-arena/25"
                  >
                    {taller.image_url ? (
                      <Image src={taller.image_url} alt="" fill sizes="72px" className="object-cover" />
                    ) : (
                      <PlaceholderImagen texto={taller.name} mariposa className="marca-taller" />
                    )}
                  </Link>

                  <div className="min-w-48 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-piedra-oscura">
                      {TIPOS_TALLER[taller.kind]}
                    </p>
                    <Link
                      href={`/admin/talleres/${taller.id}`}
                      className="font-display text-lg leading-snug text-nogal transition-colors hover:text-acento-fuerte"
                    >
                      {taller.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-piedra-oscura first-letter:uppercase">
                      {proximas.length > 0
                        ? `${describirInicio(proximas[0].starts_at)} · ${proximas[0].tomados} de ${proximas[0].capacity} lugares`
                        : "Sin fechas próximas"}
                      {proximas.length > 1 ? ` · y ${proximas.length - 1} fecha${proximas.length > 2 ? "s" : ""} más` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {esperando > 0 ? (
                      <Insignia className="bg-acento-fuerte text-white">
                        {esperando} en espera
                      </Insignia>
                    ) : null}
                    <label className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-piedra-oscura">
                        Visible
                      </span>
                      <Interruptor
                        accion={alternarTaller}
                        campos={{ id: taller.id }}
                        activo={taller.is_active}
                        etiqueta={`Mostrar ${taller.name} en la página`}
                      />
                    </label>
                    <Link
                      href={`/admin/talleres/${taller.id}`}
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
    </>
  );
}
