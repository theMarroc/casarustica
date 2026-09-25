import Image from "next/image";

import { AJUSTES_POR_DEFECTO } from "@/lib/settings";
import { cn } from "@/lib/utils";

/** Isotipo: la casita de la marca. */
export function Isotipo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-7 w-7 text-madera", className)}
    >
      <path d="M4.5 15.5 16 5.5l11.5 10" />
      <path d="M21.5 9.5V6.3h2.8v5.6" />
      <path d="M8 13v13.5h16V13" />
      <path d="M13.5 26.5v-5a2.5 2.5 0 0 1 5 0v5" />
    </svg>
  );
}

/** La mariposa del taller Azul Tiffany. */
export function Mariposa({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-7 w-7 text-acento-fuerte", className)}
    >
      <path d="M16 11.5v12" />
      <path d="M16 11.5c-.8-2.4-2.3-4.1-4.2-5M16 11.5c.8-2.4 2.3-4.1 4.2-5" />
      <path d="M16 14.5C12.2 7.8 4.6 7.6 5 12.4c.3 3.4 5.6 5 11 3.9" />
      <path d="M16 14.5c3.8-6.7 11.4-6.9 11 -2.1-.3 3.4-5.6 5-11 3.9" />
      <path d="M16 17.4c-4.6.2-8.3 3-6.8 6.3 1.4 2.9 5.2-.4 6.8-3.7" />
      <path d="M16 17.4c4.6.2 8.3 3 6.8 6.3-1.4 2.9-5.2-.4-6.8-3.7" />
    </svg>
  );
}

/**
 * Logo del taller. Si se subió uno desde Ajustes se usa esa imagen; si no,
 * la mariposa con el nombre en letra manuscrita.
 */
export function LogoTaller({
  nombre = AJUSTES_POR_DEFECTO.taller_nombre,
  bajada = AJUSTES_POR_DEFECTO.taller_bajada,
  logoUrl,
  className,
}: {
  nombre?: string;
  bajada?: string;
  logoUrl?: string;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={nombre}
        width={320}
        height={160}
        sizes="220px"
        className={cn("h-20 w-auto max-w-56 object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <Mariposa className="h-12 w-12" />
      <span className="flex flex-col items-start leading-none">
        <span className="whitespace-nowrap font-script text-[2.3rem] leading-[0.9] text-nogal">
          {nombre}
        </span>
        {bajada ? (
          <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.4em] text-piedra-oscura">
            {bajada}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * Logo de la marca. Si se subió uno desde el panel se usa esa imagen; si no,
 * el nombre en letra manuscrita con la bajada en versalitas.
 */
export function Logo({
  nombre = AJUSTES_POR_DEFECTO.marca_nombre,
  bajada = AJUSTES_POR_DEFECTO.marca_bajada,
  logoUrl,
  className,
  claseTexto,
}: {
  nombre?: string;
  bajada?: string;
  logoUrl?: string;
  className?: string;
  claseTexto?: string;
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={nombre}
        width={240}
        height={96}
        sizes="180px"
        className={cn("h-12 w-auto max-w-44 object-contain", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span
        className={cn(
          "whitespace-nowrap font-script text-[2.1rem] leading-[0.85] text-nogal",
          claseTexto,
        )}
      >
        {nombre}
      </span>
      {bajada ? (
        <span className="mt-1 pl-[0.4em] text-[9px] font-semibold uppercase tracking-[0.4em] text-piedra-oscura">
          {bajada}
        </span>
      ) : null}
    </span>
  );
}

/** Ornamento: la casita (o la mariposa, en el taller) centrada entre dos líneas. */
export function Ornamento({
  className,
  mariposa = false,
}: {
  className?: string;
  mariposa?: boolean;
}) {
  return (
    <span className={cn("flex items-center justify-center gap-3", className)}>
      <span className="h-px w-10 bg-arena/60" />
      {mariposa ? (
        <Mariposa className="h-5 w-5 text-acento" />
      ) : (
        <Isotipo className="h-4 w-4 text-arena" />
      )}
      <span className="h-px w-10 bg-arena/60" />
    </span>
  );
}

const ICONOS_BENEFICIO: Record<string, React.ReactNode> = {
  corazon: (
    <>
      <path d="M12 20s-6.5-4.2-6.5-8.6A3.6 3.6 0 0 1 12 9.1a3.6 3.6 0 0 1 6.5 2.3C18.5 15.8 12 20 12 20Z" />
      <path d="M12 9.1V6" />
    </>
  ),
  caja: (
    <>
      <path d="M4 8.5 12 5l8 3.5v7L12 19l-8-3.5v-7Z" />
      <path d="M4 8.5 12 12l8-3.5M12 12v7" />
    </>
  ),
  hoja: (
    <>
      <path d="M12 20V11" />
      <path d="M12 12c-4.4 0-7.5-2.7-7.5-6.8 4.1 0 7.5 2.4 7.5 6.8Z" />
      <path d="M12 14c4 0 6.8-2.4 6.8-6.2-3.7 0-6.8 2.2-6.8 6.2Z" />
    </>
  ),
  persona: (
    <>
      <circle cx="12" cy="9.5" r="3" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 8v4.2l2.8 1.8" />
    </>
  ),
  estrella: (
    <>
      <path d="m12 5 2.1 4.6 5 .6-3.7 3.4 1 4.9L12 16.1l-4.4 2.4 1-4.9L4.9 10.2l5-.6L12 5Z" />
    </>
  ),
  pincel: (
    <>
      <path d="M18.6 5.2c-2.4 1.3-5.6 4.4-7.5 6.9l1.8 1.8c2.5-1.9 5.6-5.1 6.9-7.5a.9.9 0 0 0-1.2-1.2Z" />
      <path d="M10.4 13.1c-1.8 0-3.2 1.3-3.2 3 0 1.1-.7 1.9-1.9 2.3 2.5 1.3 6.3.6 6.8-2.6" />
    </>
  ),
  casa: (
    <>
      <path d="M5 11.5 12 5.5l7 6" />
      <path d="M7 10v8.5h10V10" />
      <path d="M10.5 18.5v-4h3v4" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="4.5" y="6.5" width="15" height="11" rx="1.8" />
      <path d="M4.5 10.2h15M7.5 14.3h3" />
    </>
  ),
};

export const NOMBRES_ICONO = Object.keys(ICONOS_BENEFICIO);

export function IconoBeneficio({
  nombre,
  className,
}: {
  nombre: string;
  className?: string;
}) {
  const trazo = ICONOS_BENEFICIO[nombre] ?? ICONOS_BENEFICIO.hoja;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-9 w-9 text-madera", className)}
    >
      <circle cx="12" cy="12" r="11" strokeOpacity="0.28" strokeWidth="1" />
      {trazo}
    </svg>
  );
}

/**
 * Relleno decorativo para cuando algo todavía no tiene foto.
 * Usa un degradé determinista según el texto, así la grilla no queda plana.
 */
export function PlaceholderImagen({
  texto,
  className,
  mariposa = false,
}: {
  texto: string;
  className?: string;
  /** Con la mariposa del taller en vez de la casita. */
  mariposa?: boolean;
}) {
  const paletas = [
    ["var(--color-lino)", "var(--color-arena)"],
    ["var(--color-hueso)", "var(--color-acento)"],
    ["var(--color-lino)", "var(--color-piedra)"],
    ["var(--color-hueso)", "var(--color-madera)"],
    ["var(--color-lino)", "var(--color-acento-hover)"],
  ];
  let suma = 0;
  for (let i = 0; i < texto.length; i += 1) suma += texto.charCodeAt(i);
  const [desde, hasta] = paletas[suma % paletas.length];

  return (
    <div
      className={cn("relative flex h-full w-full items-center justify-center", className)}
      style={{ background: `linear-gradient(150deg, ${desde} 15%, ${hasta} 100%)` }}
      aria-hidden="true"
    >
      {mariposa ? (
        <Mariposa className="h-12 w-12 text-white/85" />
      ) : (
        <Isotipo className="h-10 w-10 text-white/80" />
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------
   Iconos de redes. Los dibujamos nosotros porque lucide-react ya no incluye
   iconos de marcas.
   -------------------------------------------------------------------------- */

export function IconoInstagram({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoFacebook({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path d="M14.5 8.5h2.2V5.6h-2.4c-2.2 0-3.6 1.4-3.6 3.6v1.6H8.9v2.9h1.8V21h3v-7.3h2.2l.4-2.9h-2.6V9.4c0-.6.3-.9.8-.9Z" />
    </svg>
  );
}

export function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5", className)}
    >
      <path d="M12 3a8.7 8.7 0 0 0-7.4 13.3L3.5 21l4.8-1.1A8.7 8.7 0 1 0 12 3Z" />
      <path d="M9 9.3c0 2.6 2.1 4.7 4.7 4.7.5 0 .9-.4.9-.9v-.6l-1.6-.6-.7.8a4.2 4.2 0 0 1-1.9-1.9l.8-.7-.6-1.6h-.7c-.5 0-.9.4-.9.8Z" />
    </svg>
  );
}
