import Link from "next/link";
import type { ReactNode } from "react";

import { BarraBeneficios } from "@/components/home/barra-beneficios";
import { SeccionCategorias } from "@/components/home/categorias";
import { EncabezadoSeccion } from "@/components/home/encabezado-seccion";
import { FranjaFrase } from "@/components/home/franja-frase";
import { MapaDelivery } from "@/components/home/mapa-delivery";
import { Newsletter } from "@/components/home/newsletter";
import { Portada } from "@/components/home/portada";
import { SeccionPreguntas } from "@/components/home/preguntas";
import { GrillaProductos, TarjetaCombo } from "@/components/shop/tarjeta-producto";
import { TarjetaServicio } from "@/components/servicios/tarjeta-servicio";
import { TarjetaFecha, TarjetaTaller } from "@/components/taller/tarjetas";
import { TarjetaAntesDespues, TarjetaEvento } from "@/components/trabajos/tarjetas";
import { AvisoDemo } from "@/components/site/aviso-demo";
import { estilosBoton } from "@/components/ui/boton";
import {
  getAjustes,
  getAntesDespues,
  getBeneficios,
  getCategorias,
  getCombos,
  getEventos,
  getFaqs,
  getOfertas,
  getProductos,
  getSecciones,
  getServicios,
  getTalleres,
  getZonasEnvio,
  modoDemo,
} from "@/lib/db";
import { calcularPrecio } from "@/lib/pricing";
import { proximasFechas } from "@/lib/talleres";
import { ajuste } from "@/lib/settings";

export default async function Inicio() {
  const [
    ajustes,
    secciones,
    categorias,
    destacados,
    todos,
    ofertas,
    combos,
    beneficios,
    preguntas,
    trabajos,
    eventos,
    zonas,
    servicios,
    talleres,
  ] = await Promise.all([
    getAjustes(),
    getSecciones(),
    getCategorias(),
    getProductos({ destacados: true }),
    getProductos(),
    getOfertas(),
    getCombos(),
    getBeneficios(),
    getFaqs(),
    getAntesDespues(),
    getEventos(),
    getZonasEnvio(),
    getServicios(),
    getTalleres(),
  ]);

  const enOferta = todos.filter((p) => calcularPrecio(p, ofertas).oferta !== null);
  const fechasTaller = proximasFechas(talleres, 3);

  const bloques: Record<string, ReactNode> = {
    hero: <Portada ajustes={ajustes} />,
    barra_beneficios: <BarraBeneficios beneficios={beneficios} />,
    categorias: <SeccionCategorias categorias={categorias} ajustes={ajustes} />,
    destacados:
      destacados.length > 0 ? (
        <section className="bg-lino py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "destacados_titulo")}
                tituloCursiva={ajuste(ajustes, "destacados_titulo_cursiva")}
              />
              <Link href="/tienda" className={estilosBoton("secundario", "md")}>
                Ver la tienda
              </Link>
            </div>
            <div className="mt-10">
              <GrillaProductos productos={destacados.slice(0, 8)} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null,
    ofertas:
      enOferta.length > 0 ? (
        <section className="bg-hueso py-16 lg:py-24">
          <div className="contenedor">
            <EncabezadoSeccion
              titulo={ajuste(ajustes, "ofertas_titulo")}
              tituloCursiva={ajuste(ajustes, "ofertas_titulo_cursiva")}
              centrado
              className="mx-auto"
            />
            <div className="mt-10">
              <GrillaProductos productos={enOferta.slice(0, 8)} ofertas={ofertas} />
            </div>
          </div>
        </section>
      ) : null,
    combos:
      combos.length > 0 ? (
        <section className="bg-lino py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "combos_titulo")}
                tituloCursiva={ajuste(ajustes, "combos_titulo_cursiva")}
              />
              <Link href="/sets" className={estilosBoton("secundario", "md")}>
                Ver todos
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {combos.slice(0, 4).map((combo) => (
                <TarjetaCombo key={combo.id} combo={combo} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    servicios:
      servicios.length > 0 ? (
        <section className="bg-hueso py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "servicios_titulo")}
                tituloCursiva={ajuste(ajustes, "servicios_titulo_cursiva")}
                texto={ajuste(ajustes, "servicios_texto")}
              />
              <Link href="/servicios" className={estilosBoton("secundario", "md")}>
                Ver servicios
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {servicios.slice(0, 3).map((servicio) => (
                <TarjetaServicio key={servicio.id} servicio={servicio} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    antes_despues:
      trabajos.length > 0 ? (
        <section className="bg-lino py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "antes_despues_titulo")}
                tituloCursiva={ajuste(ajustes, "antes_despues_titulo_cursiva")}
                texto={ajuste(ajustes, "antes_despues_texto")}
              />
              <Link href="/trabajos" className={estilosBoton("secundario", "md")}>
                Ver todos los trabajos
              </Link>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {trabajos.slice(0, 2).map((trabajo) => (
                <TarjetaAntesDespues key={trabajo.id} trabajo={trabajo} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    talleres:
      talleres.length > 0 ? (
        <section className="marca-taller bg-acento/10 py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "talleres_titulo")}
                tituloCursiva={ajuste(ajustes, "talleres_titulo_cursiva")}
                texto={ajuste(ajustes, "talleres_texto")}
              />
              <Link href="/taller" className={estilosBoton("secundario", "md")}>
                Ver el taller
              </Link>
            </div>
            {fechasTaller.length > 0 ? (
              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {fechasTaller.map(({ taller, fecha }) => (
                  <TarjetaFecha key={fecha.id} taller={taller} fecha={fecha} />
                ))}
              </div>
            ) : (
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {talleres.slice(0, 3).map((taller) => (
                  <TarjetaTaller key={taller.id} taller={taller} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : null,
    eventos:
      eventos.length > 0 ? (
        <section className="bg-hueso py-16 lg:py-24">
          <div className="contenedor">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <EncabezadoSeccion
                titulo={ajuste(ajustes, "eventos_titulo")}
                tituloCursiva={ajuste(ajustes, "eventos_titulo_cursiva")}
                texto={ajuste(ajustes, "eventos_texto")}
              />
              <Link href="/trabajos#eventos" className={estilosBoton("secundario", "md")}>
                Ver todos
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.slice(0, 3).map((evento) => (
                <TarjetaEvento key={evento.id} evento={evento} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    frase: <FranjaFrase ajustes={ajustes} />,
    mapa_delivery: <MapaDelivery ajustes={ajustes} zonas={zonas} />,
    faq: <SeccionPreguntas preguntas={preguntas} ajustes={ajustes} />,
    newsletter: <Newsletter ajustes={ajustes} />,
  };

  const visibles = secciones
    .filter((seccion) => seccion.is_enabled && bloques[seccion.key])
    .sort((a, b) => a.sort_order - b.sort_order);

  return (
    <>
      {modoDemo() ? <AvisoDemo /> : null}
      {visibles.map((seccion) => (
        <div key={seccion.key}>{bloques[seccion.key]}</div>
      ))}
    </>
  );
}
