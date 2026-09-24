import type { ItemCarrito } from "@/components/cart/carrito";
import { formatARS } from "@/lib/utils";

/** Lo que completó el cliente, la demora y la seña de una línea del carrito. */
export function DetalleLinea({
  item,
}: {
  item: Pick<ItemCarrito, "detalle" | "demora" | "sena">;
}) {
  if (!item.detalle?.length && !item.demora && !item.sena) return null;

  return (
    <ul className="mt-1 flex flex-col gap-0.5 text-xs leading-snug text-piedra-oscura">
      {item.detalle?.map((linea) => (
        <li key={linea.etiqueta}>
          <span className="font-semibold text-nogal/80">{linea.etiqueta}:</span> {linea.valor}
        </li>
      ))}
      {item.demora ? <li>A pedido, demora {item.demora}</li> : null}
      {item.sena ? <li>Seña de {formatARS(item.sena)} por unidad</li> : null}
    </ul>
  );
}
