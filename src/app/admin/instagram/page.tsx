import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Link2Off } from "lucide-react";

import { buscarPublicacion, desconectarInstagram } from "@/actions/admin/instagram";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { FormularioConfirmado } from "@/components/admin/formulario-confirmado";
import { PanelAdmin, TituloAdmin } from "@/components/admin/piezas";
import { estilosBoton } from "@/components/ui/boton";
import { Campo, Insignia } from "@/components/ui/campos";
import { IconoInstagram } from "@/components/ui/marca";
import {
  fechaCorta,
  instagramConfigurado,
  leerConexion,
  limpiarTexto,
  listarPublicaciones,
  type PublicacionInstagram,
} from "@/lib/instagram";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Desde Instagram",
  robots: { index: false, follow: false },
};

const ERRORES: Record<string, string> = {
  configuracion: "La conexión con Instagram todavía no está configurada. Pedíselo a quien administra la página.",
  cancelado: "Cancelaste la conexión en Instagram. Podés volver a intentarlo cuando quieras.",
  vencido: "El pedido de conexión venció. Tocá Conectar con Instagram de nuevo.",
  conexion: "Instagram no aceptó la conexión. Revisá que tu cuenta sea profesional y probá de nuevo.",
};

type Borrador = {
  id: string;
  caption: string | null;
  taken_at: string | null;
  images: string[];
  status: "pendiente" | "importada" | "descartada";
};

function Miniatura({ href, imagen, texto, fecha, marca }: {
  href: string;
  imagen?: string;
  texto: string;
  fecha: string | null;
  marca?: string;
}) {
  return (
    <li>
      <Link href={href} className="group block">
        <span className="relative block aspect-square overflow-hidden rounded-marca bg-arena/20">
          {imagen ? (
            // eslint-disable-next-line @next/next/no-img-element -- fotos de Instagram o del archivo, sin optimizar
            <img src={imagen} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : null}
          {marca ? (
            <Insignia className="absolute left-1.5 top-1.5 bg-salvia text-white">{marca}</Insignia>
          ) : null}
        </span>
        <span className="mt-1.5 block truncate text-xs text-carbon/75">{texto || "Sin texto"}</span>
        {fecha ? <span className="block text-[11px] text-piedra-oscura">{fechaCorta(fecha)}</span> : null}
      </Link>
    </li>
  );
}

const portada = (p: PublicacionInstagram) => (p.media_type === "VIDEO" ? p.thumbnail_url : p.media_url);

export default async function DesdeInstagram({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; conectado?: string; desde?: string; descartada?: string }>;
}) {
  const { error, conectado, desde, descartada } = await searchParams;
  const configurada = instagramConfigurado();
  const conexion = configurada ? await leerConexion() : null;

  let publicaciones: PublicacionInstagram[] = [];
  let siguiente: string | null = null;
  let errorLista: string | null = null;
  if (conexion) {
    try {
      ({ publicaciones, siguiente } = await listarPublicaciones(conexion.access_token, desde));
    } catch (fallo) {
      console.error("[instagram] no se pudieron leer las publicaciones", fallo);
      errorLista = "Instagram no respondió. Recargá la página en un rato.";
    }
  }

  const supabase = await createClient();
  const [importadas, archivo] = await Promise.all([
    supabase.from("social_imports").select("source_ref").eq("source", "instagram"),
    supabase
      .from("social_imports")
      .select("id, caption, taken_at, images, status")
      .eq("source", "archivo")
      .order("taken_at", { ascending: false }),
  ]);
  const yaImportadas = new Set((importadas.data ?? []).map((f) => f.source_ref));
  const borradores = (archivo.data ?? []) as Borrador[];
  const pendientes = borradores.filter((b) => b.status === "pendiente");
  const descartadas = borradores.filter((b) => b.status === "descartada");

  return (
    <>
      <TituloAdmin
        titulo="Desde Instagram"
        texto="Traé las fotos y el texto de tus publicaciones para cargar productos, eventos y trabajos más rápido."
      />

      {conectado === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          ¡Listo! Tu Instagram quedó conectado.
        </p>
      ) : null}
      {descartada === "1" ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-salvia/40 bg-salvia/10 px-4 py-3 text-sm text-salvia">
          <CheckCircle2 className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          La descartaste. Si te arrepentís, está abajo, en Descartadas.
        </p>
      ) : null}
      {error && ERRORES[error] ? (
        <p className="mb-6 flex items-center gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-4 py-3 text-sm text-alerta-oscura">
          <AlertCircle className="h-4 w-4 shrink-0" strokeWidth={1.6} />
          {ERRORES[error]}
        </p>
      ) : null}

      <PanelAdmin titulo="Tu cuenta de Instagram" className="mb-6">
        {!configurada ? (
          <p className="text-sm leading-relaxed text-carbon/70">
            La conexión todavía no está configurada. Pedíselo a quien administra la página
            (los pasos están en el README).
          </p>
        ) : conexion ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-sm text-carbon/80">
              <IconoInstagram className="h-5 w-5 text-nogal" />
              Conectada como{" "}
              <strong className="font-semibold text-nogal">@{conexion.username ?? "tu cuenta"}</strong>.
              El permiso se renueva solo.
            </p>
            <FormularioConfirmado
              accion={desconectarInstagram}
              mensaje="¿Desconectar Instagram? Lo que ya importaste queda en la página."
            >
              <button type="submit" className={estilosBoton("fantasma", "sm")}>
                <Link2Off className="h-4 w-4" />
                Desconectar
              </button>
            </FormularioConfirmado>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm leading-relaxed text-carbon/70">
              Te va a pedir que entres a tu Instagram y aceptes. Solo le da permiso a la página
              para leer tus publicaciones: no publica nada ni ve tus mensajes.
            </p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- es una ruta que redirige a Instagram, no una página */}
            <a href="/api/instagram/conectar" className={estilosBoton("primario", "md")}>
              <IconoInstagram className="h-4 w-4" />
              Conectar con Instagram
            </a>
          </div>
        )}
      </PanelAdmin>

      {conexion ? (
        <>
          <PanelAdmin
            titulo="Pegá el link de una publicación"
            texto="En Instagram tocá los tres puntitos de la publicación, Copiar enlace, y pegalo acá."
            className="mb-6"
          >
            <FormularioAdmin accion={buscarPublicacion} textoBoton="Buscar" tamano="sm">
              <Campo name="link" type="url" required placeholder="https://www.instagram.com/p/..." />
            </FormularioAdmin>
          </PanelAdmin>

          <PanelAdmin titulo="Tus publicaciones" className="mb-6">
            {errorLista ? (
              <p className="text-sm text-alerta-oscura">{errorLista}</p>
            ) : publicaciones.length === 0 ? (
              <p className="text-sm text-carbon/65">No encontramos publicaciones en tu cuenta.</p>
            ) : (
              <>
                <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {publicaciones.map((p) => (
                    <Miniatura
                      key={p.id}
                      href={`/admin/instagram/publicacion/${p.id}`}
                      imagen={portada(p)}
                      texto={limpiarTexto(p.caption).split("\n")[0]}
                      fecha={p.timestamp}
                      marca={yaImportadas.has(p.id) ? "Importada" : undefined}
                    />
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  {desde ? (
                    <Link href="/admin/instagram" className={estilosBoton("fantasma", "sm")}>
                      Volver a las más nuevas
                    </Link>
                  ) : null}
                  {siguiente ? (
                    <Link
                      href={`/admin/instagram?desde=${encodeURIComponent(siguiente)}`}
                      className={estilosBoton("secundario", "sm")}
                    >
                      Ver más viejas
                    </Link>
                  ) : null}
                </div>
              </>
            )}
          </PanelAdmin>
        </>
      ) : null}

      <PanelAdmin
        titulo="Del archivo descargado"
        texto={
          borradores.length
            ? `${pendientes.length} para revisar · ${borradores.filter((b) => b.status === "importada").length} importadas · ${descartadas.length} descartadas`
            : "Cuando se cargue el archivo que descargaste de Instagram, tus publicaciones van a aparecer acá para que decidas qué hacer con cada una."
        }
      >
        {pendientes.length ? (
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {pendientes.map((b) => (
              <Miniatura
                key={b.id}
                href={`/admin/instagram/archivo/${b.id}`}
                imagen={b.images[0]}
                texto={limpiarTexto(b.caption).split("\n")[0]}
                fecha={b.taken_at}
              />
            ))}
          </ul>
        ) : borradores.length ? (
          <p className="text-sm text-carbon/65">¡No quedan publicaciones por revisar!</p>
        ) : null}

        {descartadas.length ? (
          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold text-nogal">
              Descartadas ({descartadas.length})
            </summary>
            <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {descartadas.map((b) => (
                <Miniatura
                  key={b.id}
                  href={`/admin/instagram/archivo/${b.id}`}
                  imagen={b.images[0]}
                  texto={limpiarTexto(b.caption).split("\n")[0]}
                  fecha={b.taken_at}
                />
              ))}
            </ul>
          </details>
        ) : null}
      </PanelAdmin>
    </>
  );
}
