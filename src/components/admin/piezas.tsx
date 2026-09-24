import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function TituloAdmin({
  titulo,
  texto,
  volverA,
  children,
}: {
  titulo: string;
  texto?: string;
  volverA?: { href: string; texto: string };
  children?: ReactNode;
}) {
  return (
    <header className="mb-8">
      {volverA ? (
        <Link
          href={volverA.href}
          className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-piedra-oscura transition-colors hover:text-nogal"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {volverA.texto}
        </Link>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-nogal">{titulo}</h1>
          {texto ? (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-carbon/70">
              {texto}
            </p>
          ) : null}
        </div>
        {children ? <div className="flex flex-wrap gap-2">{children}</div> : null}
      </div>
      <span className="linea-decorativa mt-5" />
    </header>
  );
}

export function PanelAdmin({
  titulo,
  texto,
  children,
  className,
}: {
  titulo?: string;
  texto?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-marca border border-piedra/30 bg-white p-5 shadow-suave sm:p-6",
        className,
      )}
    >
      {titulo ? (
        <h2 className="font-display text-xl text-nogal">{titulo}</h2>
      ) : null}
      {texto ? (
        <p className="mt-1.5 text-sm leading-relaxed text-carbon/65">{texto}</p>
      ) : null}
      <div className={titulo || texto ? "mt-5" : undefined}>{children}</div>
    </section>
  );
}

export function SinDatos({
  mensaje,
  children,
}: {
  mensaje: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-12 text-center">
      <p className="text-sm text-piedra-oscura">{mensaje}</p>
      {children}
    </div>
  );
}

export function FilaDato({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-piedra-oscura">
        {etiqueta}
      </span>
      <span className="text-sm text-carbon/85">{children}</span>
    </div>
  );
}
