import type { Metadata } from "next";

import { TarjetaServicio } from "@/components/servicios/tarjeta-servicio";
import { CabeceraPagina } from "@/components/site/cabecera-pagina";
import { getAjustes, getServicios } from "@/lib/db";
import { ajuste } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Restauración y reciclado de muebles, ambientación de eventos y asesoría de estilo en Miramar, Mar del Plata y zona.",
};

export default async function PaginaServicios() {
  const [ajustes, servicios] = await Promise.all([getAjustes(), getServicios()]);

  return (
    <>
      <CabeceraPagina
        titulo={ajuste(ajustes, "servicios_titulo")}
        tituloCursiva={ajuste(ajustes, "servicios_titulo_cursiva")}
        texto={ajuste(ajustes, "servicios_texto")}
        migas={[{ href: "/servicios", texto: "Servicios" }]}
      />

      <section className="contenedor py-14 lg:py-20">
        {servicios.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicios.map((servicio) => (
              <TarjetaServicio key={servicio.id} servicio={servicio} />
            ))}
          </div>
        ) : (
          <p className="mx-auto max-w-md rounded-marca border border-dashed border-piedra/50 bg-lino/60 px-6 py-12 text-center text-sm text-carbon/75">
            Muy pronto vas a ver acá todo lo que hacemos. Mientras tanto, escribinos por
            WhatsApp.
          </p>
        )}
      </section>
    </>
  );
}
