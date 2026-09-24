"use client";

import { Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { useCarrito, type NuevoItem } from "@/components/cart/carrito";
import { Boton, estilosBoton, type TamanoBoton, type VarianteBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import { largoMaximo, validarPersonalizacion } from "@/lib/personalizacion";
import type { CampoPersonalizable } from "@/lib/types";

export function BotonAgregar({
  item,
  variante = "primario",
  tamano = "md",
  className,
  etiqueta = "Agregar al pedido",
  agotado = false,
}: {
  item: NuevoItem;
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
  className?: string;
  etiqueta?: string;
  agotado?: boolean;
}) {
  const { agregar } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  if (agotado) {
    return (
      <span className={estilosBoton("secundario", tamano, `${className ?? ""} opacity-60`)}>
        Sin stock
      </span>
    );
  }

  return (
    <Boton
      variante={variante}
      tamano={tamano}
      className={className}
      onClick={() => {
        agregar(item);
        setAgregado(true);
        window.setTimeout(() => setAgregado(false), 1400);
      }}
    >
      {agregado ? (
        <>
          <Check className="h-4 w-4" /> Agregado
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> {etiqueta}
        </>
      )}
    </Boton>
  );
}

/** Versión con selector de cantidad, para la página de producto. */
export function AgregarConCantidad({
  item,
  agotado = false,
  stockMaximo,
  campos = [],
}: {
  item: NuevoItem;
  agotado?: boolean;
  stockMaximo?: number;
  campos?: CampoPersonalizable[];
}) {
  const { agregar } = useCarrito();
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);
  const [valores, setValores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const tope = stockMaximo && stockMaximo > 0 ? stockMaximo : 99;

  if (agotado) {
    return (
      <div className="rounded-marca border border-piedra/40 bg-arena/20 px-4 py-3 text-sm text-nogal">
        Este producto no tiene stock en este momento. Escribinos por WhatsApp y te
        avisamos cuando vuelve.
      </div>
    );
  }

  function cambiar(clave: string, valor: string) {
    setValores((actuales) => ({ ...actuales, [clave]: valor }));
    setError(null);
  }

  function alAgregar() {
    const resultado = validarPersonalizacion(campos, valores);
    if (!resultado.ok) {
      setError(resultado.mensaje);
      return;
    }

    agregar(
      campos.length > 0 ? { ...item, valores, detalle: resultado.lineas } : item,
      cantidad,
    );
    setAgregado(true);
    window.setTimeout(() => setAgregado(false), 1600);
  }

  return (
    <div className="flex flex-col gap-4">
      {campos.length > 0 ? (
        <fieldset className="flex flex-col gap-3 rounded-marca border border-piedra/30 bg-lino/50 p-4">
          <legend className="px-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-nogal">
            Personalizalo
          </legend>
          {campos.map((campo) => (
            <CampoConEtiqueta
              key={campo.clave}
              etiqueta={campo.etiqueta}
              requerido={campo.obligatorio}
              ayuda={campo.ayuda || undefined}
            >
              {campo.tipo === "opciones" ? (
                <Selector
                  value={valores[campo.clave] ?? ""}
                  onChange={(e) => cambiar(campo.clave, e.target.value)}
                >
                  <option value="">Elegí una opción</option>
                  {campo.opciones.map((opcion) => (
                    <option key={opcion} value={opcion}>
                      {opcion}
                    </option>
                  ))}
                </Selector>
              ) : campo.tipo === "texto_largo" ? (
                <AreaTexto
                  rows={3}
                  maxLength={largoMaximo(campo)}
                  value={valores[campo.clave] ?? ""}
                  onChange={(e) => cambiar(campo.clave, e.target.value)}
                />
              ) : (
                <Campo
                  type={campo.tipo === "fecha" ? "date" : "text"}
                  maxLength={campo.tipo === "texto" ? largoMaximo(campo) : undefined}
                  value={valores[campo.clave] ?? ""}
                  onChange={(e) => cambiar(campo.clave, e.target.value)}
                />
              )}
            </CampoConEtiqueta>
          ))}
        </fieldset>
      ) : null}

      {error ? (
        <p
          aria-live="polite"
          className="rounded-marca border border-alerta/40 bg-alerta/10 px-3 py-2 text-sm text-alerta-oscura"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-marca border border-piedra/40 bg-white">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="px-3 py-3 text-nogal transition-colors hover:bg-arena/25"
            aria-label="Quitar uno"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center font-semibold tabular-nums">{cantidad}</span>
          <button
            onClick={() => setCantidad((c) => Math.min(tope, c + 1))}
            className="px-3 py-3 text-nogal transition-colors hover:bg-arena/25"
            aria-label="Agregar uno"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <Boton tamano="lg" className="flex-1" onClick={alAgregar}>
          {agregado ? (
            <>
              <Check className="h-4 w-4" /> Agregado al pedido
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" /> Agregar al pedido
            </>
          )}
        </Boton>
      </div>
    </div>
  );
}
