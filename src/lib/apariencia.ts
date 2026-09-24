/**
 * Combinaciones de tipografías y estilos de color que se eligen en
 * Ajustes › Apariencia. Cada una se aplica con un atributo (data-letra,
 * data-estilo) y el CSS de globals.css hace el resto.
 */

export const LETRAS = {
  a: {
    nombre: "Clásica",
    fuentes: "Cormorant Garamond, Allura y Nunito Sans",
    nota: "Fina y elegante, la más parecida al logo.",
  },
  b: {
    nombre: "Cálida",
    fuentes: "Fraunces, Parisienne y Mulish",
    nota: "Más artesanal, con títulos con más cuerpo.",
  },
  c: {
    nombre: "Sobria",
    fuentes: "Lora, Great Vibes y Work Sans",
    nota: "La más legible y tranquila.",
  },
} as const;

export const ESTILOS = {
  rustica: {
    nombre: "Casa Rústica",
    nota: "Celeste empolvado, madera y lino.",
  },
  tiffany: {
    nombre: "Azul Tiffany",
    nota: "Tiffany, blanco frío y verde azulado.",
  },
} as const;

export type Letra = keyof typeof LETRAS;
export type Estilo = keyof typeof ESTILOS;

export function letraValida(valor: string | undefined): Letra {
  return valor && valor in LETRAS ? (valor as Letra) : "a";
}

export function estiloValido(valor: string | undefined): Estilo {
  return valor && valor in ESTILOS ? (valor as Estilo) : "rustica";
}
