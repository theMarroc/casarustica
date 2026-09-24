import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { alternarAntesDespues } from "@/actions/admin/trabajos";
import { Interruptor } from "@/components/admin/interruptor";
import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { getAntesDespues } from "@/lib/db";

export const metadata: Metadata = {
  title: "Antes y después",
  robots: { index: false, follow: false },
};

function Miniatura({ url, texto }: { url: string; texto: string }) {
  return (
    <span className="relative block h-14 w-14 shrink-0 overflow-hidden rounded-marca bg-arena/25">
      {url ? <Image src={url} alt="" fill sizes="56px" className="object-cover" /> : null}
      <span className="absolute inset-x-0 bottom-0 bg-carbon/60 py-0.5 text-center text-[8px] font-bold uppercase tracking-wider text-white">
        {texto}
      </span>
    </span>
  );
}

export default async function AntesDespuesAdmin() {
  const trabajos = await getAntesDespues(true);

  return (
    <>
      <TituloAdmin
        titulo="Antes y después"
        texto="Tus trabajos de restauración con una foto de antes y otra de después. En la página se comparan deslizando."
      >
        <Link href="/admin/antes-y-despues/nuevo" className={estilosBoton("primario", "sm")}>
          <Plus className="h-4 w-4" />
          Nuevo trabajo
        </Link>
      </TituloAdmin>

      <PanelAdmin className="p-0! sm:p-0!">
        {trabajos.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="Todavía no cargaste ningún antes y después.">
              <Link
                href="/admin/antes-y-despues/nuevo"
                className={estilosBoton("primario", "sm")}
              >
                Cargar el primero
              </Link>
            </SinDatos>
          </div>
        ) : (
          <ul className="divide-y divide-piedra/20">
            {trabajos.map((trabajo) => (
              <li
                key={trabajo.id}
                className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-lino/50"
              >
                <Link href={`/admin/antes-y-despues/${trabajo.id}`} className="flex gap-1.5">
                  <Miniatura url={trabajo.before_url} texto="Antes" />
                  <Miniatura url={trabajo.after_url} texto="Después" />
                </Link>

                <div className="min-w-40 flex-1">
                  <Link
                    href={`/admin/antes-y-despues/${trabajo.id}`}
                    className="font-display text-lg leading-snug text-nogal transition-colors hover:text-acento-fuerte"
                  >
                    {trabajo.title}
                  </Link>
                  {trabajo.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-piedra-oscura">
                      {trabajo.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-piedra-oscura">
                      Visible
                    </span>
                    <Interruptor
                      accion={alternarAntesDespues}
                      campos={{ id: trabajo.id }}
                      activo={trabajo.is_active}
                      etiqueta={`Mostrar ${trabajo.title} en la página`}
                    />
                  </label>

                  <Link
                    href={`/admin/antes-y-despues/${trabajo.id}`}
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

      <p className="mt-5 text-xs leading-relaxed text-piedra-oscura">
        En la portada se ven los dos primeros (según el orden) y en la página
        Trabajos, todos los visibles.
      </p>
    </>
  );
}
