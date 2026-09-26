import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ExternalLink } from "lucide-react";

import { Importador } from "@/components/admin/importador";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import {
  fechaCorta,
  fotosDe,
  leerConexion,
  leerPublicacion,
  limpiarTexto,
  tituloDesde,
} from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Importar de Instagram",
  robots: { index: false, follow: false },
};

const DESTINOS: Record<string, { texto: string; ruta: string }> = {
  producto: { texto: "un producto", ruta: "/admin/productos/" },
  evento: { texto: "un evento", ruta: "/admin/eventos/" },
  antes_despues: { texto: "un antes y después", ruta: "/admin/antes-y-despues/" },
  alumnas: { texto: "fotos de la galería de alumnas", ruta: "/admin/talleres/" },
};

export default async function PublicacionInstagram({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const conexion = await leerConexion();
  if (!conexion) redirect("/admin/instagram");

  let publicacion;
  try {
    publicacion = await leerPublicacion(conexion.access_token, id);
  } catch {
    redirect("/admin/instagram?error=conexion");
  }

  const supabase = await createClient();
  const [{ data: previa }, { data: talleres }] = await Promise.all([
    supabase.from("social_imports").select("kind, record_id").eq("source_ref", id).maybeSingle(),
    supabase.from("workshops").select("id, name").order("sort_order"),
  ]);
  const destinoPrevio = previa?.kind ? DESTINOS[previa.kind] : null;

  return (
    <>
      <TituloAdmin
        titulo="Importar publicación"
        texto={fechaCorta(publicacion.timestamp)}
        volverA={{ href: "/admin/instagram", texto: "Volver a Instagram" }}
      >
        <a
          href={publicacion.permalink}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("secundario", "sm")}
        >
          <ExternalLink className="h-4 w-4" />
          Ver en Instagram
        </a>
      </TituloAdmin>

      {destinoPrevio && previa?.record_id ? (
        <p className="mb-6 flex flex-wrap items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          Ya la importaste como {destinoPrevio.texto}.
          <Link href={`${destinoPrevio.ruta}${previa.record_id}`} className="font-semibold underline">
            Ir a verlo
          </Link>
        </p>
      ) : null}

      <PanelAdmin>
        <Importador
          origen="instagram"
          referencia={publicacion.id}
          fotos={fotosDe(publicacion)}
          titulo={tituloDesde(publicacion.caption, publicacion.timestamp)}
          texto={limpiarTexto(publicacion.caption)}
          talleres={talleres ?? []}
        />
      </PanelAdmin>
    </>
  );
}
