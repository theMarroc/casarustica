import { startTransition, type FormEvent } from "react";

/**
 * onSubmit para los formularios con useActionState. Con `<form action>`,
 * React 19 vacía el formulario después de cada envío, y ante un error se
 * perdía todo lo escrito. Así se envía a mano y los campos quedan como estaban.
 */
export function enviarSinVaciar(accion: (datos: FormData) => void) {
  return (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const datos = new FormData(evento.currentTarget);
    startTransition(() => accion(datos));
  };
}
