"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { Campo, CampoConEtiqueta, Selector } from "@/components/ui/campos";
import type { CampoPersonalizable } from "@/lib/types";
import { slugify } from "@/lib/utils";

const TIPOS: { valor: CampoPersonalizable["tipo"]; texto: string }[] = [
  { valor: "texto", texto: "Texto corto" },
  { valor: "texto_largo", texto: "Texto largo" },
  { valor: "fecha", texto: "Fecha" },
  { valor: "opciones", texto: "Opciones para elegir" },
];

type Borrador = Omit<CampoPersonalizable, "opciones" | "max"> & {
  llave: string;
  opciones: string;
  max: string;
};

function aBorrador(campo: CampoPersonalizable): Borrador {
  return {
    ...campo,
    llave: campo.clave,
    opciones: campo.opciones.join(", "),
    max: campo.max ? String(campo.max) : "",
  };
}

/** Pasa los borradores al formato que se guarda. La clave sale de la etiqueta. */
function aCampos(borradores: Borrador[]): CampoPersonalizable[] {
  const usadas = new Set<string>();
  return borradores
    .filter((b) => b.etiqueta.trim())
    .map((b) => {
      let clave = slugify(b.etiqueta) || "campo";
      for (let i = 2; usadas.has(clave); i += 1) clave = `${slugify(b.etiqueta)}-${i}`;
      usadas.add(clave);
      return {
        clave,
        etiqueta: b.etiqueta.trim(),
        tipo: b.tipo,
        opciones:
          b.tipo === "opciones"
            ? b.opciones.split(",").map((o) => o.trim()).filter(Boolean)
            : [],
        obligatorio: b.obligatorio,
        max: b.max && Number(b.max) > 0 ? Math.round(Number(b.max)) : null,
        ayuda: b.ayuda.trim(),
      };
    });
}

/**
 * Editor de los datos que completa el cliente (nombres, fecha, colores...).
 * Todo viaja en un input oculto con JSON, como las fotos del producto.
 */
export function EditorPersonalizacion({ iniciales }: { iniciales: CampoPersonalizable[] }) {
  const [campos, setCampos] = useState<Borrador[]>(() => iniciales.map(aBorrador));

  function cambiar(indice: number, cambios: Partial<Borrador>) {
    setCampos((actuales) => actuales.map((c, i) => (i === indice ? { ...c, ...cambios } : c)));
  }

  function mover(desde: number, hacia: number) {
    if (hacia < 0 || hacia >= campos.length) return;
    const copia = [...campos];
    const [movido] = copia.splice(desde, 1);
    copia.splice(hacia, 0, movido);
    setCampos(copia);
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="custom_fields" value={JSON.stringify(aCampos(campos))} />

      {campos.map((campo, indice) => (
        <div key={campo.llave} className="rounded-marca border border-piedra/30 bg-lino/40 p-4">
          <div className="grid gap-3 sm:grid-cols-6">
            <CampoConEtiqueta etiqueta="Qué le preguntás" className="sm:col-span-3">
              <Campo
                value={campo.etiqueta}
                onChange={(e) => cambiar(indice, { etiqueta: e.target.value })}
                placeholder="Nombres"
              />
            </CampoConEtiqueta>

            <CampoConEtiqueta etiqueta="Tipo de respuesta" className="sm:col-span-3">
              <Selector
                value={campo.tipo}
                onChange={(e) =>
                  cambiar(indice, { tipo: e.target.value as CampoPersonalizable["tipo"] })
                }
              >
                {TIPOS.map((tipo) => (
                  <option key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </option>
                ))}
              </Selector>
            </CampoConEtiqueta>

            {campo.tipo === "opciones" ? (
              <CampoConEtiqueta
                etiqueta="Opciones"
                ayuda="Separadas por coma"
                className="sm:col-span-6"
              >
                <Campo
                  value={campo.opciones}
                  onChange={(e) => cambiar(indice, { opciones: e.target.value })}
                  placeholder="Blanco, Dorado, Celeste"
                />
              </CampoConEtiqueta>
            ) : null}

            <CampoConEtiqueta
              etiqueta="Ayuda para el cliente"
              ayuda="Opcional"
              className={campo.tipo === "texto" || campo.tipo === "texto_largo" ? "sm:col-span-4" : "sm:col-span-6"}
            >
              <Campo
                value={campo.ayuda}
                onChange={(e) => cambiar(indice, { ayuda: e.target.value })}
                placeholder="Una aclaración para completarlo bien"
              />
            </CampoConEtiqueta>

            {campo.tipo === "texto" || campo.tipo === "texto_largo" ? (
              <CampoConEtiqueta
                etiqueta="Máximo de letras"
                ayuda="Vacío = sin límite especial"
                className="sm:col-span-2"
              >
                <Campo
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={campo.max}
                  onChange={(e) => cambiar(indice, { max: e.target.value })}
                />
              </CampoConEtiqueta>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-carbon/80">
              <input
                type="checkbox"
                checked={campo.obligatorio}
                onChange={(e) => cambiar(indice, { obligatorio: e.target.checked })}
                className="h-4 w-4 accent-acento-fuerte"
              />
              Obligatorio
            </label>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => mover(indice, indice - 1)}
                disabled={indice === 0}
                className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-arena/30 hover:text-nogal disabled:opacity-30"
                aria-label="Subir"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => mover(indice, indice + 1)}
                disabled={indice === campos.length - 1}
                className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-arena/30 hover:text-nogal disabled:opacity-30"
                aria-label="Bajar"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCampos(campos.filter((_, i) => i !== indice))}
                className="rounded-marca p-2 text-piedra-oscura transition-colors hover:bg-alerta/10 hover:text-alerta"
                aria-label="Quitar este dato"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          setCampos([
            ...campos,
            {
              llave: `nuevo-${Date.now()}`,
              clave: "",
              etiqueta: "",
              tipo: "texto",
              opciones: "",
              obligatorio: true,
              max: "",
              ayuda: "",
            },
          ])
        }
        className="flex items-center justify-center gap-2 rounded-marca border border-dashed border-piedra/60 px-4 py-3 text-sm font-semibold text-nogal transition-colors hover:border-acento-fuerte hover:bg-acento/10"
      >
        <Plus className="h-4 w-4" />
        Agregar un dato para completar
      </button>
    </div>
  );
}
