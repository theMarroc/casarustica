import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveRestore, CheckCircle2, Trash2 } from "lucide-react";

import { cambiarEstadoBorrador } from "@/actions/admin/instagram";
import { Importador } from "@/components/admin/importador";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { fechaCorta, limpiarTexto, tituloDesde } from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Publicación del archivo",
  robots: { index: false, follow: false },
};

const RUTAS: Record<string, string> = {
  producto: "/admin/productos/",
  evento: "/admin/eventos/",
  antes_despues: "/admin/antes-y-despues/",
  alumnas: "/admin/talleres/",
};

export default async function BorradorDelArchivo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: borrador }, { data: talleres }] = await Promise.all([
    supabase
      .from("social_imports")
      .select("id, caption, taken_at, images, status, kind, record_id")
      .eq("id", id)
      .eq("source", "archivo")
      .maybeSingle(),
    supabase.from("workshops").select("id, name").order("sort_order"),
  ]);
  if (!borrador) notFound();

  const fotos = (borrador.images ?? []) as string[];

  return (
    <>
      <TituloAdmin
        titulo="Publicación del archivo"
        texto={fechaCorta(borrador.taken_at)}
        volverA={{ href: "/admin/instagram", texto: "Volver a Instagram" }}
      />

      {borrador.status === "importada" && borrador.kind && borrador.record_id ? (
        <p className="mb-6 flex flex-wrap items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Esta ya la importaste.
          <Link href={`${RUTAS[borrador.kind]}${borrador.record_id}`} className="font-semibold underline">
            Ir a verla
          </Link>
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_16rem]">
        <PanelAdmin>
          <Importador
            origen="archivo"
            referencia={borrador.id}
            fotos={fotos}
            titulo={tituloDesde(borrador.caption, borrador.taken_at)}
            texto={limpiarTexto(borrador.caption)}
            talleres={talleres ?? []}
          />
        </PanelAdmin>

        <PanelAdmin
          titulo={borrador.status === "descartada" ? "Descartada" : "¿No te sirve?"}
          className="h-fit"
        >
          <p className="mb-4 text-sm leading-relaxed text-carbon/65">
            {borrador.status === "descartada"
              ? "La habías descartado. Podés recuperarla."
              : "Descartala y deja de aparecer en la lista. Se puede recuperar."}
          </p>
          <form action={cambiarEstadoBorrador}>
            <input type="hidden" name="id" value={borrador.id} />
            <input
              type="hidden"
              name="estado"
              value={borrador.status === "descartada" ? "pendiente" : "descartada"}
            />
            <button type="submit" className={estilosBoton("secundario", "sm", "w-full")}>
              {borrador.status === "descartada" ? (
                <>
                  <ArchiveRestore className="h-4 w-4" />
                  Recuperar
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Descartar
                </>
              )}
            </button>
          </form>
        </PanelAdmin>
      </div>
    </>
  );
}
