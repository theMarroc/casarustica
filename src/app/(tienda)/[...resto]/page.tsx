import { notFound } from "next/navigation";

/** Cualquier dirección que no existe: así la 404 sale con el menú y el pie del sitio. */
export default function DireccionInexistente() {
  notFound();
}
