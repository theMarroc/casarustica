import { IconoBeneficio } from "@/components/ui/marca";
import type { Benefit } from "@/lib/types";

export function BarraBeneficios({ beneficios }: { beneficios: Benefit[] }) {
  if (beneficios.length === 0) return null;

  return (
    <section className="border-b border-piedra/25 bg-hueso">
      <div className="contenedor grid grid-cols-2 divide-piedra/25 py-8 sm:divide-x lg:grid-cols-4">
        {beneficios.map((beneficio) => (
          <div
            key={beneficio.id}
            className="flex items-center justify-center gap-3 px-4 py-3"
          >
            <IconoBeneficio nombre={beneficio.icon} />
            <p className="text-sm leading-snug text-carbon/80">
              {beneficio.title}
              {beneficio.subtitle ? (
                <>
                  <br />
                  <span className="text-carbon/60">{beneficio.subtitle}</span>
                </>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
