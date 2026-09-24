import type { CampoPersonalizable } from "./types";

export type ValoresPersonalizacion = Record<string, string>;
export type LineaPersonalizacion = { etiqueta: string; valor: string };

const LARGO_POR_DEFECTO = { texto: 60, texto_largo: 300 } as const;

export function largoMaximo(campo: CampoPersonalizable) {
  if (campo.max && campo.max > 0) return campo.max;
  return campo.tipo === "texto_largo" ? LARGO_POR_DEFECTO.texto_largo : LARGO_POR_DEFECTO.texto;
}

/**
 * Valida lo que completó el cliente contra los campos del producto. La usan
 * el navegador (para avisar antes de agregar) y el servidor (que no confía en
 * el navegador). Devuelve las líneas listas para guardar en el pedido.
 */
export function validarPersonalizacion(
  campos: CampoPersonalizable[],
  valores: ValoresPersonalizacion,
): { ok: true; lineas: LineaPersonalizacion[] } | { ok: false; mensaje: string } {
  const lineas: LineaPersonalizacion[] = [];

  for (const campo of campos) {
    const valor = (valores[campo.clave] ?? "").trim();

    if (!valor) {
      if (campo.obligatorio) {
        return { ok: false, mensaje: `Falta completar "${campo.etiqueta}".` };
      }
      continue;
    }

    if (campo.tipo === "opciones" && !campo.opciones.includes(valor)) {
      return { ok: false, mensaje: `Elegí una opción válida en "${campo.etiqueta}".` };
    }
    if (campo.tipo === "fecha" && !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
      return { ok: false, mensaje: `La fecha de "${campo.etiqueta}" no es válida.` };
    }
    if ((campo.tipo === "texto" || campo.tipo === "texto_largo") && valor.length > largoMaximo(campo)) {
      return {
        ok: false,
        mensaje: `"${campo.etiqueta}" admite hasta ${largoMaximo(campo)} caracteres.`,
      };
    }

    lineas.push({ etiqueta: campo.etiqueta, valor: mostrarValor(campo, valor) });
  }

  return { ok: true, lineas };
}

/** Texto corto y estable que distingue dos personalizaciones del mismo producto. */
export function huellaPersonalizacion(lineas: LineaPersonalizacion[]) {
  const texto = lineas.map((l) => `${l.etiqueta}=${l.valor}`).join("|");
  let hash = 0;
  for (let i = 0; i < texto.length; i += 1) {
    hash = (hash * 31 + texto.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/** "2026-03-15" → "15/03/2026" para mostrar las fechas que cargó el cliente. */
export function mostrarValor(campo: Pick<CampoPersonalizable, "tipo">, valor: string) {
  if (campo.tipo === "fecha" && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    const [anio, mes, dia] = valor.split("-");
    return `${dia}/${mes}/${anio}`;
  }
  return valor;
}
