import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Palette } from "lucide-react";

import { FormularioEspera } from "@/components/taller/formulario-espera";
import { FormularioInscripcion } from "@/components/taller/formulario-inscripcion";
import { PlaceholderImagen } from "@/components/ui/marca";
import { getUsuario } from "@/lib/auth";
import { getAjustes, getTaller } from "@/lib/db";
import { ajuste, esVerdadero } from "@/lib/settings";
import {
  describirInicio,
  fechasVigentes,
  horasDeReserva,
  lugaresLibres,
  senaDeFecha,
} from "@/lib/talleres";
import { TIPOS_TALLER } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const taller = await getTaller(slug);
  if (!taller) return { title: "Taller no encontrado" };

  return {
    title: taller.name,
    description: taller.summary ?? undefined,
    openGraph: {
      title: taller.name,
      description: taller.summary ?? undefined,
      images: taller.image_url ? [taller.image_url] : undefined,
    },
  };
}

export default async function PaginaDeTaller({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const [{ slug }, { fecha: fechaPedida }] = await Promise.all([params, searchParams]);
  const [taller, ajustes, usuario] = await Promise.all([
    getTaller(slug),
    getAjustes(),
    getUsuario(),
  ]);
  if (!taller || !taller.is_active) notFound();

  const fechas = fechasVigentes(taller).map((fecha) => ({
    id: fecha.id,
    inicio: describirInicio(fecha.starts_at),
    horario: fecha.schedule,
    precio: fecha.price,
    nota: fecha.price_note,
    sena: senaDeFecha(fecha),
    libres: lugaresLibres(fecha),
  }));

  const datosUsuario = usuario
    ? {
        email: usuario.email ?? "",
        nombre: (usuario.user_metadata?.full_name as string | undefined) ?? "",
        telefono: (usuario.user_metadata?.phone as string | undefined) ?? "",
      }
    : null;

  const materiales = taller.includes_materials
    ? `Materiales incluidos${taller.materials_note ? `. ${taller.materials_note}` : "."}`
    : taller.materials_note;

  return (
    <>
      <div className="contenedor pt-8">
        <nav
          aria-label="Ubicación"
          className="flex flex-wrap items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-piedra-oscura"
        >
          <Link href="/" className="transition-colors hover:text-nogal">
            Inicio
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/taller" className="transition-colors hover:text-nogal">
            Taller
          </Link>
        </nav>
      </div>

      <section className="contenedor grid items-start gap-10 py-8 lg:grid-cols-2 lg:gap-16 lg:py-12">
        <div className="relative aspect-4/3 overflow-hidden rounded-marca bg-arena/20">
          {taller.image_url ? (
            <Image
              src={taller.image_url}
              alt={taller.name}
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          ) : (
            <PlaceholderImagen texto={taller.name} mariposa />
          )}
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-acento-fuerte">
            {TIPOS_TALLER[taller.kind]}
          </p>
          <h1 className="mt-2 font-display text-[clamp(2rem,1.5rem+1.8vw,3rem)] leading-tight text-nogal">
            {taller.name}
          </h1>
          <span className="linea-decorativa mt-5" />
          {taller.description ? (
            <div className="mt-6 flex flex-col gap-4 text-[15px] leading-relaxed text-carbon/75">
              {taller.description.split(/\n{2,}/).map((parrafo, indice) => (
                <p key={indice}>{parrafo}</p>
              ))}
            </div>
          ) : null}

          {taller.duration || materiales ? (
            <ul className="mt-6 flex flex-col gap-2.5 border-t border-piedra/25 pt-5 text-sm text-carbon/75">
              {taller.duration ? (
                <li className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-acento-fuerte" strokeWidth={1.5} />
                  {taller.duration}
                </li>
              ) : null}
              {materiales ? (
                <li className="flex items-start gap-2.5">
                  <Palette className="mt-0.5 h-4 w-4 shrink-0 text-acento-fuerte" strokeWidth={1.5} />
                  {materiales}
                </li>
              ) : null}
            </ul>
          ) : null}

          <a
            href="#inscripcion"
            className="mt-7 inline-block text-[11px] font-semibold uppercase tracking-[0.12em] text-acento-fuerte hover:underline"
          >
            {fechas.length > 0 ? "Ver fechas e inscribirme" : "Quiero que me avisen"}
          </a>
        </div>
      </section>

      <section id="inscripcion" className="scroll-mt-24 bg-lino py-14 lg:py-20">
        <div className="contenedor max-w-3xl">
          <h2 className="titulo-seccion text-nogal">
            {fechas.length > 0 ? (
              <>
                Reservá tu <span className="cursiva-marca">lugar</span>
              </>
            ) : (
              <>
                Próximas <span className="cursiva-marca">fechas</span>
              </>
            )}
          </h2>
          <span className="linea-decorativa mt-5" />

          <div className="mt-8 rounded-marca border border-piedra/30 bg-white p-5 shadow-suave sm:p-8">
            {fechas.length > 0 ? (
              <FormularioInscripcion
                tallerId={taller.id}
                fechas={fechas}
                fechaInicial={fechaPedida}
                mercadopagoActivo={esVerdadero(ajustes.pago_mercadopago_activo)}
                transferenciaActiva={esVerdadero(ajustes.pago_transferencia_activo ?? "true")}
                reservaHoras={horasDeReserva(ajuste(ajustes, "taller_reserva_horas"))}
                usuario={datosUsuario}
              />
            ) : (
              <>
                <p className="mb-6 text-sm leading-relaxed text-carbon/70">
                  Todavía no hay fechas para este taller. Dejanos tus datos y te avisamos por
                  WhatsApp apenas se abra la inscripción.
                </p>
                <FormularioEspera tallerId={taller.id} fechaId="" usuario={datosUsuario} />
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
