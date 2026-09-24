import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export type VarianteBoton =
  | "primario"
  | "secundario"
  | "fuerte"
  | "oscuro"
  | "fantasma"
  | "peligro";
export type TamanoBoton = "sm" | "md" | "lg";

const VARIANTES: Record<VarianteBoton, string> = {
  primario:
    "bg-acento text-carbon hover:bg-acento-hover disabled:hover:bg-acento",
  secundario:
    "border border-madera/55 bg-transparent text-nogal hover:border-madera hover:bg-madera/10",
  fuerte: "bg-acento-fuerte text-white hover:bg-acento-profundo",
  oscuro: "bg-carbon text-hueso hover:bg-carbon/85",
  fantasma: "bg-transparent text-carbon hover:bg-carbon/5",
  peligro:
    "border border-alerta/40 bg-transparent text-alerta-oscura hover:bg-alerta/10",
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: "px-3.5 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-sm",
};

export function estilosBoton(
  variante: VarianteBoton = "primario",
  tamano: TamanoBoton = "md",
  extra?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-marca font-sans font-semibold uppercase tracking-[0.12em]",
    "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTES[variante],
    TAMANOS[tamano],
    extra,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
};

export function Boton({
  variante = "primario",
  tamano = "md",
  className,
  ...resto
}: Props) {
  return <button className={estilosBoton(variante, tamano, className)} {...resto} />;
}
