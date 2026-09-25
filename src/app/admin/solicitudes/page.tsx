import type { Metadata } from "next";
import Link from "next/link";
import { Camera } from "lucide-react";

import { PanelAdmin, SinDatos, TituloAdmin } from "@/components/admin/piezas";
import { Insignia } from "@/components/ui/campos";
import { createClient } from "@/lib/supabase/server";
import { ESTADOS_SOLICITUD, type EstadoSolicitud, type Solicitud } from "@/lib/types";
import { cn, formatFecha } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Presupuestos",
  robots: { index: false, follow: false },
};

const FILTROS: { valor: "" | EstadoSolicitud; texto: string }[] = [
  { valor: "", texto: "Todos" },
  { valor: "nueva", texto: "Nuevos" },
  { valor: "presupuestada", texto: "Presupuestados" },
  { valor: "aceptada", texto: "Aceptados" },
  { valor: "terminada", texto: "Terminados" },
  { valor: "descartada", texto: "Descartados" },
];

type Fila = Pick<
  Solicitud,
  "id" | "code" | "service_name" | "customer_name" | "location" | "status" | "created_at"
> & { images: { id: string }[] };

export default async function SolicitudesAdmin({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado = "" } = await searchParams;
  const supabase = await createClient();

  let consulta = supabase
    .from("quote_requests")
    .select("id, code, service_name, customer_name, location, status, created_at, images:quote_request_images(id)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (estado in ESTADOS_SOLICITUD) consulta = consulta.eq("status", estado);

  const { data } = await consulta;
  const solicitudes = (data ?? []) as Fila[];

  return (
    <>
      <TituloAdmin
        titulo="Presupuestos"
        texto="Los pedidos de presupuesto que llegan desde la página de cada servicio."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTROS.map((filtro) => (
          <Link
            key={filtro.valor}
            href={filtro.valor ? `/admin/solicitudes?estado=${filtro.valor}` : "/admin/solicitudes"}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors",
              estado === filtro.valor
                ? "border-carbon bg-carbon text-hueso"
                : "border-piedra/45 text-carbon/70 hover:border-carbon",
            )}
          >
            {filtro.texto}
          </Link>
        ))}
      </div>

      <PanelAdmin className="p-0! sm:p-0!">
        {solicitudes.length === 0 ? (
          <div className="p-6">
            <SinDatos mensaje="No hay pedidos de presupuesto por acá." />
          </div>
        ) : (
          <ul className="divide-y divide-piedra/20">
            {solicitudes.map((solicitud) => {
              const estadoFila = ESTADOS_SOLICITUD[solicitud.status];
              return (
                <li key={solicitud.id}>
                  <Link
                    href={`/admin/solicitudes/${solicitud.id}`}
                    className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-lino/50"
                  >
                    <div className="min-w-40 flex-1">
                      <p className="font-mono text-xs font-semibold tracking-wider text-nogal">
                        {solicitud.code}
                      </p>
                      <p className="text-sm text-carbon/80">
                        {solicitud.customer_name}
                        <span className="text-piedra-oscura"> · {solicitud.service_name}</span>
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-piedra-oscura">
                        {solicitud.location ? <>{solicitud.location} · </> : null}
                        {formatFecha(solicitud.created_at)}
                        {solicitud.images.length > 0 ? (
                          <span className="flex items-center gap-1">
                            · <Camera className="h-3 w-3" /> {solicitud.images.length}
                          </span>
                        ) : null}
                      </p>
                    </div>
                    <Insignia className={estadoFila.clase}>{estadoFila.label}</Insignia>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PanelAdmin>
    </>
  );
}
