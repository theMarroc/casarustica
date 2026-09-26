"use client";

import { CalendarHeart, Check, Package, Palette, SquareSplitHorizontal } from "lucide-react";
import { useState } from "react";

import { importarPublicacion } from "@/actions/admin/instagram";
import { FormularioAdmin } from "@/components/admin/formulario-admin";
import { OpcionTarjeta } from "@/components/checkout/opcion-tarjeta";
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import { cn } from "@/lib/utils";

type Destino = "producto" | "evento" | "antes_despues" | "alumnas";

const DESTINOS: { valor: Destino; titulo: string; detalle: string; icono: React.ReactNode }[] = [
  {
    valor: "producto",
    titulo: "Producto",
    detalle: "Queda oculto hasta que le pongas precio y lo hagas visible.",
    icono: <Package className="h-5 w-5" strokeWidth={1.4} />,
  },
  {
    valor: "evento",
    titulo: "Evento",
    detalle: "Para bodas y celebraciones. Queda oculto hasta que lo revises.",
    icono: <CalendarHeart className="h-5 w-5" strokeWidth={1.4} />,
  },
  {
    valor: "antes_despues",
    titulo: "Antes y después",
    detalle: "Elegí dos fotos: la primera es el antes. Queda oculto.",
    icono: <SquareSplitHorizontal className="h-5 w-5" strokeWidth={1.4} />,
  },
  {
    valor: "alumnas",
    titulo: "Galería de alumnas",
    detalle: "Las fotos se suman a la galería de un taller y se ven enseguida.",
    icono: <Palette className="h-5 w-5" strokeWidth={1.4} />,
  },
];

/** Elegir fotos, revisar el texto y decidir qué se crea con una publicación. */
export function Importador({
  origen,
  referencia,
  fotos,
  titulo,
  texto,
  talleres,
}: {
  origen: "instagram" | "archivo";
  referencia: string;
  fotos: string[];
  titulo: string;
  texto: string;
  talleres: { id: string; name: string }[];
}) {
  const [elegidas, setElegidas] = useState<number[]>(fotos.map((_, i) => i));
  const [destino, setDestino] = useState<Destino>("producto");

  const alternar = (indice: number) =>
    setElegidas((actuales) =>
      actuales.includes(indice)
        ? actuales.filter((i) => i !== indice)
        : [...actuales, indice].sort((a, b) => a - b),
    );

  return (
    <FormularioAdmin
      accion={importarPublicacion}
      textoBoton={destino === "alumnas" ? "Agregar a la galería" : "Crear borrador"}
      textoGuardando="Trayendo las fotos..."
      className="flex flex-col gap-8"
    >
      <input type="hidden" name="origen" value={origen} />
      <input type="hidden" name="referencia" value={referencia} />
      <input type="hidden" name="destino" value={destino} />
      {elegidas.map((indice) => (
        <input key={indice} type="hidden" name="foto" value={indice} />
      ))}

      <section>
        <h2 className="font-display text-xl text-nogal">Fotos</h2>
        <p className="mt-1 text-sm text-carbon/65">
          Tocá una para sacarla o volver a sumarla. Se usan en este orden.
        </p>
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {fotos.map((url, indice) => {
            const posicion = elegidas.indexOf(indice);
            const elegida = posicion >= 0;
            return (
              <li key={url}>
                <button
                  type="button"
                  onClick={() => alternar(indice)}
                  aria-pressed={elegida}
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-marca border-2 bg-arena/20 transition",
                    elegida ? "border-acento-fuerte" : "border-transparent opacity-45",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- fotos de Instagram o del archivo, sin optimizar */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <span
                    className={cn(
                      "absolute right-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                      elegida ? "bg-acento-fuerte text-white" : "bg-white/85 text-transparent",
                    )}
                  >
                    {elegida ? (
                      destino === "antes_despues" && posicion < 2 ? (
                        posicion === 0 ? "Antes" : "Después"
                      ) : (
                        posicion + 1
                      )
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl text-nogal">¿Qué querés crear?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {DESTINOS.map((opcion) => (
            <OpcionTarjeta
              key={opcion.valor}
              activa={destino === opcion.valor}
              onClick={() => setDestino(opcion.valor)}
              icono={opcion.icono}
              titulo={opcion.titulo}
              detalle={opcion.detalle}
            />
          ))}
        </div>
        {destino === "antes_despues" && elegidas.length !== 2 ? (
          <p className="mt-3 text-sm text-alerta-oscura">
            Para un antes y después tienen que quedar elegidas dos fotos (ahora hay {elegidas.length}).
          </p>
        ) : null}
        {destino === "alumnas" ? (
          <CampoConEtiqueta etiqueta="¿De qué taller?" className="mt-4 max-w-md">
            <Selector name="taller" defaultValue="" required>
              <option value="" disabled>
                Elegí un taller
              </option>
              {talleres.map((taller) => (
                <option key={taller.id} value={taller.id}>
                  {taller.name}
                </option>
              ))}
            </Selector>
          </CampoConEtiqueta>
        ) : null}
      </section>

      {destino === "alumnas" ? null : (
        <section className="grid gap-4">
          <CampoConEtiqueta etiqueta="Título" requerido ayuda="Lo armamos con el primer renglón; cambialo si querés">
            <Campo name="titulo" required maxLength={100} defaultValue={titulo} />
          </CampoConEtiqueta>
          <CampoConEtiqueta etiqueta="Texto" ayuda="El de la publicación, sin los hashtags">
            <AreaTexto name="texto" rows={7} defaultValue={texto} />
          </CampoConEtiqueta>
        </section>
      )}
      {destino === "alumnas" ? <input type="hidden" name="titulo" value={titulo} /> : null}
    </FormularioAdmin>
  );
}
