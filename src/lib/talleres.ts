import { calcularSena } from "./pricing";
import type { FechaTaller, Taller } from "./types";

const ZONA = "America/Argentina/Buenos_Aires";

/** Hasta cuántas personas se pueden anotar juntas en una inscripción. */
export const MAXIMO_PERSONAS = 5;

export function lugaresLibres(fecha: FechaTaller) {
  return Math.max(fecha.capacity - fecha.tomados, 0);
}

/** Una fecha se ofrece si está abierta y todavía no empezó. */
export function fechaVigente(fecha: FechaTaller, ahora = Date.now()) {
  return fecha.is_open && new Date(fecha.starts_at).getTime() > ahora;
}

export function fechasVigentes(taller: Taller) {
  const ahora = Date.now();
  return taller.sessions
    .filter((fecha) => fechaVigente(fecha, ahora))
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));
}

/** Para el panel: primero las que vienen (la más cercana arriba), después las pasadas. */
export function ordenarFechasPanel(fechas: FechaTaller[]) {
  const ahora = Date.now();
  return fechas
    .map((fecha) => ({ ...fecha, pasada: new Date(fecha.starts_at).getTime() < ahora }))
    .sort((a, b) => {
      if (a.pasada !== b.pasada) return a.pasada ? 1 : -1;
      return a.pasada ? b.starts_at.localeCompare(a.starts_at) : a.starts_at.localeCompare(b.starts_at);
    });
}

/** Las próximas fechas de todos los talleres, de la más cercana a la más lejana. */
export function proximasFechas(talleres: Taller[], cantidad: number) {
  return talleres
    .flatMap((taller) => fechasVigentes(taller).map((fecha) => ({ taller, fecha })))
    .sort((a, b) => a.fecha.starts_at.localeCompare(b.fecha.starts_at))
    .slice(0, cantidad);
}

/** Seña por persona. */
export function senaDeFecha(fecha: Pick<FechaTaller, "deposit_type" | "deposit_value" | "price">) {
  return calcularSena(
    { deposit_type: fecha.deposit_type, deposit_value: fecha.deposit_value },
    fecha.price,
  );
}

function partes(iso: string, opciones: Intl.DateTimeFormatOptions) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("es-AR", { ...opciones, timeZone: ZONA })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
}

/** "sábado 12 de octubre · 10 h" (o "18:30 h"). */
export function describirInicio(iso: string) {
  const d = partes(iso, { weekday: "long", day: "numeric", month: "long" });
  const h = partes(iso, { hour: "numeric", minute: "2-digit", hourCycle: "h23" });
  const hora = h.minute === "00" ? h.hour : `${h.hour}:${h.minute}`;
  return `${d.weekday} ${d.day} de ${d.month} · ${hora} h`;
}

/** Día y mes cortos para el calendarito de las tarjetas. */
export function diaYMes(iso: string) {
  const d = partes(iso, { day: "numeric", month: "short" });
  return { dia: d.day, mes: d.month.replace(".", "") };
}

/** Para el campo datetime-local del panel: la hora de Argentina, sin zona. */
export function aHoraLocal(iso: string) {
  const d = partes(iso, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${d.year}-${d.month}-${d.day}T${d.hour}:${d.minute}`;
}

/** Lo contrario: "2026-10-12T18:30" en Argentina (UTC-3, sin horario de verano). */
export function desdeHoraLocal(valor: string) {
  return new Date(`${valor}:00-03:00`).toISOString();
}

/** Hasta cuándo una inscripción sin pagar guarda el lugar. */
export function venceReserva(creada: string, horas: number) {
  return new Date(new Date(creada).getTime() + horas * 60 * 60 * 1000).toISOString();
}

export function horasDeReserva(valor: string | undefined) {
  const horas = Number(valor);
  return Number.isInteger(horas) && horas > 0 && horas < 10000 ? horas : 48;
}
