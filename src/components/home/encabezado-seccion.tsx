import { cn } from "@/lib/utils";

/**
 * Titulo de seccion al estilo de la marca: la primera parte en redonda y la
 * segunda en letra manuscrita, con una linea de color madera debajo.
 */
export function EncabezadoSeccion({
  titulo,
  tituloCursiva,
  texto,
  centrado = false,
  className,
}: {
  titulo: string;
  tituloCursiva?: string;
  texto?: string;
  centrado?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(centrado && "flex flex-col items-center text-center", className)}>
      <h2 className="titulo-seccion text-nogal">
        {titulo}
        {tituloCursiva ? (
          <>
            {" "}
            <span className="cursiva-marca">{tituloCursiva}</span>
          </>
        ) : null}
      </h2>
      <span className="linea-decorativa mt-5" />
      {texto ? (
        <p className="mt-5 max-w-lg text-sm leading-relaxed text-carbon/70">{texto}</p>
      ) : null}
    </div>
  );
}
