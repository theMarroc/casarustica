import { cn } from "@/lib/utils";

/** Una opción elegible con ícono, título y detalle (medio de pago, entrega). */
export function OpcionTarjeta({
  activa,
  onClick,
  icono,
  titulo,
  detalle,
}: {
  activa: boolean;
  onClick: () => void;
  icono: React.ReactNode;
  titulo: string;
  detalle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex items-start gap-3 rounded-marca border p-4 text-left transition-colors",
        activa
          ? "border-acento-fuerte bg-acento-fuerte/5"
          : "border-piedra/40 bg-white hover:border-piedra",
      )}
    >
      <span className={cn("mt-0.5", activa ? "text-acento-fuerte" : "text-piedra-oscura")}>
        {icono}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-nogal">{titulo}</span>
        <span className="mt-0.5 block text-xs leading-snug text-carbon/65">
          {detalle}
        </span>
      </span>
    </button>
  );
}
