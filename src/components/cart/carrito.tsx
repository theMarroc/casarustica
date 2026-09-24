"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { huellaPersonalizacion, type LineaPersonalizacion } from "@/lib/personalizacion";

export type ItemCarrito = {
  /**
   * Identifica la línea del carrito: `product:<id>` o `combo:<id>`, más una
   * huella de la personalización si la tiene (dos carteles con nombres
   * distintos son dos líneas).
   */
  clave: string;
  tipo: "product" | "combo";
  id: string;
  slug: string;
  nombre: string;
  precio: number;
  precioLista: number;
  unidad: string | null;
  imagen: string | null;
  cantidad: number;
  /** Lo que completó el cliente tal cual lo escribió (lo valida el servidor). */
  valores?: Record<string, string>;
  /** Lo mismo, listo para mostrar. */
  detalle?: LineaPersonalizacion[];
  /** Seña por unidad; 0 o ausente si no lleva. */
  sena?: number;
  /** Demora, si se hace a pedido. */
  demora?: string | null;
};

export type NuevoItem = Omit<ItemCarrito, "clave" | "cantidad">;

const CLAVE_STORAGE = "casarustica.carrito.v1";

/* ==========================================================================
   El carrito vive en localStorage. Lo exponemos como un "store externo" para
   que React lo lea con useSyncExternalStore: así el HTML del servidor y el
   primer render del navegador coinciden (carrito vacío) y recién después se
   hidrata con lo que había guardado.
   ========================================================================== */

type EstadoCarrito = { items: ItemCarrito[]; hidratado: boolean };

const VACIO: EstadoCarrito = { items: [], hidratado: false };

let estado: EstadoCarrito = VACIO;
let crudoEnCache = "";
const oyentes = new Set<() => void>();

function parsear(crudo: string | null): ItemCarrito[] {
  if (!crudo) return [];
  try {
    const datos = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      (i): i is ItemCarrito =>
        i &&
        typeof i.id === "string" &&
        typeof i.clave === "string" &&
        typeof i.cantidad === "number" &&
        i.cantidad > 0,
    );
  } catch {
    return [];
  }
}

function avisar() {
  for (const oyente of oyentes) oyente();
}

/** Relee el storage y publica un estado nuevo solo si algo cambió. */
function sincronizar() {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE_STORAGE);
  } catch {
    // Storage bloqueado: el carrito vive solo en memoria.
  }

  const normalizado = crudo ?? "";
  if (normalizado === crudoEnCache && estado.hidratado) return;

  crudoEnCache = normalizado;
  estado = { items: parsear(crudo), hidratado: true };
  avisar();
}

function alCambiarStorage(evento: StorageEvent) {
  if (evento.key === CLAVE_STORAGE) sincronizar();
}

function suscribir(oyente: () => void) {
  const primero = oyentes.size === 0;
  oyentes.add(oyente);

  if (primero) {
    window.addEventListener("storage", alCambiarStorage);
  }
  // Se hidrata en el primer suscriptor, ya montado el componente.
  if (!estado.hidratado) sincronizar();

  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0) {
      window.removeEventListener("storage", alCambiarStorage);
    }
  };
}

const instantanea = () => estado;
const instantaneaServidor = () => VACIO;

/** Guarda una lista nueva y avisa a todos los componentes suscriptos. */
function guardar(items: ItemCarrito[]) {
  crudoEnCache = JSON.stringify(items);
  estado = { items, hidratado: true };

  try {
    window.localStorage.setItem(CLAVE_STORAGE, crudoEnCache);
  } catch {
    // Si el navegador bloquea el storage, el carrito vive solo en memoria.
  }

  avisar();
}

function claveDe(item: NuevoItem) {
  const base = `${item.tipo}:${item.id}`;
  return item.detalle?.length ? `${base}:${huellaPersonalizacion(item.detalle)}` : base;
}

/* ========================================================================== */

type ContextoCarrito = {
  items: ItemCarrito[];
  listo: boolean;
  cantidadTotal: number;
  subtotal: number;
  ahorro: number;
  /** Seña de los productos que la llevan. */
  senaTotal: number;
  /** Lo que queda de esos productos para pagar al retirar o al recibir. */
  saldoTotal: number;
  panelAbierto: boolean;
  agregar: (item: NuevoItem, cantidad?: number) => void;
  cambiarCantidad: (clave: string, cantidad: number) => void;
  quitar: (clave: string) => void;
  vaciar: () => void;
  abrirPanel: () => void;
  cerrarPanel: () => void;
};

const Contexto = createContext<ContextoCarrito | null>(null);

export function ProveedorCarrito({ children }: { children: ReactNode }) {
  const { items, hidratado } = useSyncExternalStore(
    suscribir,
    instantanea,
    instantaneaServidor,
  );

  const [panelAbierto, setPanelAbierto] = useState(false);

  const agregar = useCallback((item: NuevoItem, cantidad = 1) => {
    const clave = claveDe(item);
    const actuales = estado.items;
    const existente = actuales.find((i) => i.clave === clave);

    guardar(
      existente
        ? actuales.map((i) =>
            i.clave === clave ? { ...i, cantidad: i.cantidad + cantidad } : i,
          )
        : [...actuales, { ...item, clave, cantidad }],
    );

    setPanelAbierto(true);
  }, []);

  const cambiarCantidad = useCallback((clave: string, cantidad: number) => {
    guardar(
      cantidad <= 0
        ? estado.items.filter((i) => i.clave !== clave)
        : estado.items.map((i) => (i.clave === clave ? { ...i, cantidad } : i)),
    );
  }, []);

  const quitar = useCallback((clave: string) => {
    guardar(estado.items.filter((i) => i.clave !== clave));
  }, []);

  const vaciar = useCallback(() => guardar([]), []);

  const valor = useMemo<ContextoCarrito>(() => {
    const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0);
    const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const ahorro = items.reduce(
      (acc, i) => acc + Math.max(i.precioLista - i.precio, 0) * i.cantidad,
      0,
    );
    const senaTotal = items.reduce((acc, i) => acc + (i.sena ?? 0) * i.cantidad, 0);
    const saldoTotal = items.reduce(
      (acc, i) => acc + (i.sena ? (i.precio - i.sena) * i.cantidad : 0),
      0,
    );

    return {
      items,
      listo: hidratado,
      cantidadTotal,
      subtotal,
      ahorro,
      senaTotal,
      saldoTotal,
      panelAbierto,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      abrirPanel: () => setPanelAbierto(true),
      cerrarPanel: () => setPanelAbierto(false),
    };
  }, [items, hidratado, panelAbierto, agregar, cambiarCantidad, quitar, vaciar]);

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrito() {
  const contexto = useContext(Contexto);
  if (!contexto) {
    throw new Error("useCarrito debe usarse dentro de <ProveedorCarrito>");
  }
  return contexto;
}
