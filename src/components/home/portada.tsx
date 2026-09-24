import Image from "next/image";
import Link from "next/link";

import { estilosBoton } from "@/components/ui/boton";
import { Isotipo } from "@/components/ui/marca";
import { ajuste, ajusteCrudo } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export function Portada({ ajustes }: { ajustes: Settings }) {
  const imagen = ajusteCrudo(ajustes, "hero_imagen");

  return (
    <section className="border-b border-piedra/25 bg-lino">
      <div className="mx-auto grid w-full max-w-[110rem] items-stretch lg:grid-cols-2">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-24 xl:px-24">
          <h1 className="font-display text-[clamp(2.25rem,1.5rem+3.2vw,4rem)] leading-[1.08] text-nogal">
            {ajuste(ajustes, "hero_titulo")}
            <br />
            <span className="cursiva-marca">
              {ajuste(ajustes, "hero_titulo_cursiva")}
            </span>
          </h1>

          <span className="linea-decorativa mt-7" />

          <p className="mt-7 max-w-md text-[15px] leading-relaxed text-carbon/75">
            {ajuste(ajustes, "hero_texto")}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href={ajuste(ajustes, "hero_cta_link")}
              className={estilosBoton("primario", "lg")}
            >
              {ajuste(ajustes, "hero_cta_texto")}
            </Link>
            <Link href="/sets" className={estilosBoton("secundario", "lg")}>
              Ver sets y kits
            </Link>
          </div>
        </div>

        <div className="relative min-h-[18rem] overflow-hidden bg-arena/30 lg:min-h-[34rem]">
          {imagen ? (
            <Image
              src={imagen}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          ) : (
            <DecoradoPortada />
          )}
        </div>
      </div>
    </section>
  );
}

/** Fondo decorativo mientras no haya una foto cargada en el panel. */
function DecoradoPortada() {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center"
      style={{
        background:
          "radial-gradient(120% 95% at 15% 10%, var(--color-hueso) 0%, var(--color-lino) 45%, var(--color-acento) 100%)",
      }}
    >
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full opacity-20"
        aria-hidden="true"
      >
        <g stroke="var(--color-nogal)" strokeWidth="1" fill="none">
          <circle cx="200" cy="200" r="150" />
          <circle cx="200" cy="200" r="118" />
          <circle cx="200" cy="200" r="86" />
        </g>
      </svg>
      <div className="relative flex flex-col items-center gap-3 text-center">
        <Isotipo className="h-14 w-14 text-nogal/70" />
        <p className="font-script text-4xl leading-none text-nogal/80">Diseño con alma</p>
      </div>
    </div>
  );
}
