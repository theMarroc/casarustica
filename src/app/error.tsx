"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Boton, estilosBoton } from "@/components/ui/boton";
import { Logo, Ornamento } from "@/components/ui/marca";

export default function ErrorDelSitio({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-hueso px-5 text-center">
      <Logo />
      <h1 className="titulo-seccion mt-10 text-nogal">
        Algo no salió <span className="cursiva-marca">bien</span>
      </h1>
      <Ornamento className="mt-5" />
      <p className="mt-5 max-w-md text-sm leading-relaxed text-carbon/70">
        Tuvimos un problema para mostrar esta página. Probá de nuevo en unos segundos; si
        sigue pasando, escribinos por WhatsApp.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Boton onClick={() => retry()}>Probar de nuevo</Boton>
        <Link href="/" className={estilosBoton("secundario", "md")}>
          Ir al inicio
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-[11px] text-piedra-oscura">Código: {error.digest}</p>
      ) : null}
    </main>
  );
}
