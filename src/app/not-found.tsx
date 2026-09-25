import Link from "next/link";

import { estilosBoton } from "@/components/ui/boton";
import { Logo, Ornamento } from "@/components/ui/marca";

/** Para lo que no se encuentra fuera de la tienda (por ejemplo, en el panel). */
export default function NoEncontrada() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-hueso px-5 text-center">
      <Logo />
      <h1 className="titulo-seccion mt-10 text-nogal">
        No encontramos esta <span className="cursiva-marca">página</span>
      </h1>
      <Ornamento className="mt-5" />
      <p className="mt-5 max-w-md text-sm leading-relaxed text-carbon/70">
        Puede que el link esté mal escrito o que eso ya no exista.
      </p>
      <Link href="/" className={estilosBoton("primario", "md", "mt-8")}>
        Ir al inicio
      </Link>
    </main>
  );
}
