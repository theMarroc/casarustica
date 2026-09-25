"use client";

import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { confirmarFotosSolicitud, crearSolicitud } from "@/actions/solicitudes";
import { Boton, estilosBoton } from "@/components/ui/boton";
import { AreaTexto, Campo, CampoConEtiqueta } from "@/components/ui/campos";
import { IconoWhatsapp } from "@/components/ui/marca";
import { comprimirImagen } from "@/lib/imagenes";
import { linkWhatsapp } from "@/lib/settings";
import { createClient } from "@/lib/supabase/client";
import type { Servicio } from "@/lib/types";

const MAXIMO_FOTOS = 6;

type Foto = { archivo: File; vista: string };
type Fase = "completar" | "fotos" | "enviando" | "subiendo" | "listo";

const TEXTO_BOTON: Record<Fase, string> = {
  completar: "Pedir presupuesto",
  fotos: "Preparando las fotos...",
  enviando: "Enviando...",
  subiendo: "Subiendo las fotos...",
  listo: "Enviado",
};

export function FormularioPresupuesto({
  servicio,
  whatsapp,
}: {
  servicio: Pick<Servicio, "id" | "name" | "asks_photos" | "asks_measures" | "asks_date">;
  whatsapp: string;
}) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [fase, setFase] = useState<Fase>("completar");
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<{ codigo: string; nombre: string } | null>(null);
  const vistas = useRef<string[]>([]);

  useEffect(() => {
    const creadas = vistas.current;
    return () => creadas.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const ocupado = fase !== "completar";

  function agregarFotos(lista: FileList | null) {
    const nuevas = Array.from(lista ?? [])
      .filter((archivo) => archivo.type.startsWith("image/"))
      .slice(0, MAXIMO_FOTOS - fotos.length)
      .map((archivo) => {
        const vista = URL.createObjectURL(archivo);
        vistas.current.push(vista);
        return { archivo, vista };
      });
    setFotos((actuales) => [...actuales, ...nuevas]);
    setError(null);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    const texto = (nombre: string) => String(datos.get(nombre) ?? "");
    setError(null);
    setAviso(null);

    try {
      setFase("fotos");
      const comprimidas = await Promise.all(fotos.map((foto) => comprimirImagen(foto.archivo)));

      setFase("enviando");
      const resultado = await crearSolicitud({
        servicio: servicio.id,
        nombre: texto("nombre"),
        telefono: texto("telefono"),
        email: texto("email"),
        localidad: texto("localidad"),
        fecha: texto("fecha"),
        medidas: texto("medidas"),
        mensaje: texto("mensaje"),
        fotos: comprimidas.map((c) => ({ tipo: c.tipo, peso: c.pesoFinal })),
        sitioWeb: texto("sitio_web"),
      });
      if (!resultado.ok) {
        setError(resultado.mensaje);
        setFase("completar");
        return;
      }

      if (resultado.subidas.length > 0) {
        setFase("subiendo");
        const supabase = createClient();
        const subidas = await Promise.all(
          resultado.subidas.map(async (subida, indice) => {
            const { error: fallo } = await supabase.storage
              .from("solicitudes")
              .uploadToSignedUrl(subida.ruta, subida.tokenSubida, comprimidas[indice].archivo, {
                contentType: comprimidas[indice].tipo,
              });
            return fallo ? null : subida.ruta;
          }),
        );
        const rutas = subidas.filter((ruta): ruta is string => Boolean(ruta));
        const confirmacion = await confirmarFotosSolicitud(resultado.codigo, resultado.token, rutas);
        if (!confirmacion.ok || rutas.length < comprimidas.length) {
          setAviso(
            "Tu consulta llegó, pero alguna foto no se pudo subir. Mandala por WhatsApp así la vemos.",
          );
        }
      }

      setEnviado({ codigo: resultado.codigo, nombre: texto("nombre") });
      setFase("listo");
    } catch {
      setError("Algo falló al enviar. Probá de nuevo o escribinos por WhatsApp.");
      setFase("completar");
    }
  }

  if (fase === "listo" && enviado) {
    const mensaje = `¡Hola Silvina! Soy ${enviado.nombre}. Te mandé una consulta por la web sobre ${servicio.name} (${enviado.codigo}).`;
    return (
      <div className="flex flex-col items-center gap-4 rounded-marca border border-salvia/40 bg-salvia/10 px-6 py-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-salvia" strokeWidth={1.4} />
        <div>
          <p className="font-display text-2xl text-nogal">¡Recibimos tu consulta!</p>
          <p className="mt-2 text-sm leading-relaxed text-carbon/75">
            Te respondemos por WhatsApp con el presupuesto. Si querés que la veamos antes,
            avisanos por ahí. Tu número de consulta es{" "}
            <strong className="font-semibold">{enviado.codigo}</strong>.
          </p>
          {aviso ? <p className="mt-3 text-sm text-alerta-oscura">{aviso}</p> : null}
        </div>
        <a
          href={linkWhatsapp(whatsapp, mensaje)}
          target="_blank"
          rel="noreferrer"
          className={estilosBoton("primario", "md")}
        >
          <IconoWhatsapp className="h-4 w-4" />
          Avisar por WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-5">
      {/* Campo trampa para bots: no se ve ni se puede enfocar. */}
      <input
        type="text"
        name="sitio_web"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoConEtiqueta etiqueta="Tu nombre" requerido>
          <Campo name="nombre" required autoComplete="name" disabled={ocupado} />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="WhatsApp" requerido ayuda="Te respondemos por ahí">
          <Campo
            name="telefono"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="2291 50 0000"
            disabled={ocupado}
          />
        </CampoConEtiqueta>
        <CampoConEtiqueta etiqueta="Email" ayuda="Opcional">
          <Campo name="email" type="email" autoComplete="email" disabled={ocupado} />
        </CampoConEtiqueta>
        <CampoConEtiqueta
          etiqueta={servicio.asks_date ? "Lugar del evento" : "Localidad"}
          ayuda="Miramar, Mar del Plata..."
        >
          <Campo name="localidad" disabled={ocupado} />
        </CampoConEtiqueta>
        {servicio.asks_date ? (
          <CampoConEtiqueta etiqueta="Fecha del evento" ayuda="Si ya la tenés">
            <Campo name="fecha" type="date" disabled={ocupado} />
          </CampoConEtiqueta>
        ) : null}
        {servicio.asks_measures ? (
          <CampoConEtiqueta etiqueta="Medidas" ayuda="Alto, ancho y profundidad, aunque sea a ojo">
            <Campo name="medidas" placeholder="80 x 45 x 40 cm" disabled={ocupado} />
          </CampoConEtiqueta>
        ) : null}
      </div>

      <CampoConEtiqueta etiqueta="Contanos qué necesitás" requerido>
        <AreaTexto
          name="mensaje"
          required
          rows={5}
          minLength={10}
          maxLength={2000}
          disabled={ocupado}
          placeholder={
            servicio.asks_date
              ? "Qué tipo de evento es, cuántas personas, qué te imaginás..."
              : "Qué es, en qué estado está, cómo te gustaría que quede..."
          }
        />
      </CampoConEtiqueta>

      {servicio.asks_photos ? (
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-nogal">
            Fotos
          </p>
          <p className="mb-3 text-xs text-piedra-oscura">
            Opcional, pero nos ayuda mucho. Hasta {MAXIMO_FOTOS} fotos; las grandes se
            achican solas.
          </p>

          {fotos.length > 0 ? (
            <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {fotos.map((foto, indice) => (
                <li key={foto.vista} className="relative aspect-square overflow-hidden rounded-marca bg-arena/20">
                  {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:) */}
                  <img src={foto.vista} alt="" className="h-full w-full object-cover" />
                  {!ocupado ? (
                    <button
                      type="button"
                      onClick={() => setFotos(fotos.filter((_, i) => i !== indice))}
                      className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-alerta shadow-sm"
                      aria-label="Quitar la foto"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}

          {fotos.length < MAXIMO_FOTOS ? (
            <label
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-marca border border-dashed border-piedra/60 bg-lino/50 px-4 py-6 text-center transition-colors hover:border-acento-fuerte hover:bg-acento/10 ${
                ocupado ? "pointer-events-none opacity-60" : ""
              }`}
            >
              <ImagePlus className="h-6 w-6 text-piedra-oscura" strokeWidth={1.3} />
              <span className="text-sm font-semibold text-nogal">Agregar fotos</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={ocupado}
                onChange={(evento) => {
                  agregarFotos(evento.target.files);
                  evento.target.value = "";
                }}
                className="sr-only"
              />
            </label>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p
          aria-live="polite"
          className="flex items-start gap-2 rounded-marca border border-alerta/40 bg-alerta/10 px-3 py-2.5 text-sm text-alerta-oscura"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} />
          {error}
        </p>
      ) : null}

      <Boton type="submit" tamano="lg" disabled={ocupado} className="self-start">
        {ocupado ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {TEXTO_BOTON[fase]}
      </Boton>
    </form>
  );
}
