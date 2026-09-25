import Link from "next/link";

import { estilosBoton } from "@/components/ui/boton";
import { Ornamento } from "@/components/ui/marca";

export default function NoEncontrada() {
  return (
    <section className="contenedor flex flex-col items-center py-24 text-center lg:py-32">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-piedra-oscura">
        Error 404
      </p>
      <h1 className="titulo-seccion mt-4 text-nogal">
        No encontramos esta <span className="cursiva-marca">página</span>
      </h1>
      <Ornamento className="mt-5" />
      <p className="mt-5 max-w-md text-sm leading-relaxed text-carbon/70">
        Puede que el link esté mal escrito o que lo que buscabas ya no esté publicado.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={estilosBoton("primario", "md")}>
          Ir al inicio
        </Link>
        <Link href="/tienda" className={estilosBoton("secundario", "md")}>
          Ver la tienda
        </Link>
      </div>
    </section>
  );
}
