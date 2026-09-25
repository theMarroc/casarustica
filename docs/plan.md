# Plan de Casa Rústica

Plan por fases aprobado el 23/09/2026. El relevamiento original está en
[`prompt-casa-rustica.md`](prompt-casa-rustica.md).

Cada fase cierra con `npm run build` y `npm run lint` limpios, prueba en el
navegador en escritorio y a 375 px sin scroll horizontal, y control de que cada
operación nueva del panel se guarda de verdad (RLS: `.select()` después de cada
update o delete).

## Fases

| Fase | Qué incluye | Estado |
|---|---|---|
| 0. Arranque | Copia de Nahilén, repo propio, textos fijos de Nahilén afuera, esquema con datos iniciales de Casa Rústica, conexión a Supabase | Hecha |
| 1. Identidad | Paleta con acento intercambiable (celeste / tiffany en `.marca-taller`), tipografías y estilo elegibles desde Ajustes › Apariencia, logos desde Ajustes, textos por defecto, datos de ejemplo, primer deploy | Hecha |
| 2. Antes y después, eventos y portada | Comparador deslizable, portfolio de eventos (página `/trabajos`), secciones nuevas de portada, sacar el carrusel | Hecha |
| 3. Catálogo y checkout | Productos con stock, a pedido y personalizables; seña opcional; efectivo al retirar; zonas de envío; estados nuevos del pedido | Hecha |
| 4. Servicios con presupuesto | Restauración, ambientación y asesoría: formulario con fotos (URL firmada), solicitudes con estados en el panel | Hecha |
| 5. Taller Azul Tiffany | `/taller`, talleres y profesorado con fechas, cupo, duración y contenido; inscripción y seña por la web; lista de espera | Hecha |
| 6. Publicación | Variables en Vercel, Auth y webhook, prueba completa, cron para que Supabase no se pause, manual del panel | Hecha |

## Decisiones tomadas

- Casa Rústica es la marca principal; Azul Tiffany es la sección del taller.
- Los combos se llaman "Sets y kits" (ruta pública `/sets`; la tabla sigue siendo `combos`).
- Los productos no se precargan en la base: los carga Silvina. Las categorías sí.
- Errores y botones de borrar usan su propio color (`alerta`), no el acento.
- Las fotos de clientes se suben con URL firmada directo a Storage.
- Repo público en GitHub (theMarroc/casarustica). Funciones de Vercel en São Paulo (`gru1`), igual que la base.
- Antes y después y eventos viven en la página Trabajos (`/trabajos`, cada evento en `/trabajos/<slug>`). El carrusel de fotos se sacó.
- Las fotos que se suben desde el panel se achican en el navegador (menos los PNG, para no perder la transparencia de los logos).
- Cambios de esquema en la base de producción: primero se publica el código que ya no usa lo que se borra, y recién después se corre el SQL.
- Servicios: cada uno tiene su página (`/servicios/<slug>`) con formulario de presupuesto. Desde el panel se elige qué pide (fotos, medidas, fecha del evento) y qué trabajos muestra (antes y después o eventos). La dirección se arma al crearlo y no cambia al editarlo.
- Presupuestos (`/admin/solicitudes`): estados Nueva, Presupuestada, Aceptada, Terminada y Descartada; monto y notas internas; las fotos quedan en el bucket privado `solicitudes` y se ven con enlaces firmados de una hora. El menú del panel y el Resumen cuentan los nuevos.
- Los números de WhatsApp se normalizan a 549 + característica + número, sin 0 ni 15, escriba como escriba el cliente.
- Taller Azul Tiffany (`/taller`, acento tiffany con `.marca-taller` y la mariposa como logo mientras no se suba uno): talleres de dos tipos (taller o clase, y profesorado), cada uno con fechas que tienen cupo, precio, aclaración del precio y seña opcional.
- Una inscripción es un pedido más (`orders.kind = 'inscripcion'`, código `TA-`, línea `workshop` con `session_id`): reutiliza Mercado Pago, transferencia con comprobante, la página del pedido y el panel de Pedidos. Solo Mercado Pago o transferencia; si es sin costo queda confirmada.
- El cupo lo cuenta la función `lugares_tomados()` de la base: suma las inscripciones no canceladas, y una sin pagar deja de contar pasadas las horas de Ajustes › Inscripciones al taller (48 por defecto). Si dos personas se anotan a la vez por el último lugar, la segunda no entra.
- Lista de espera por fecha llena, o "avisame cuando haya fecha" si el taller no tiene fechas. Se ve en el panel con botón de WhatsApp; el menú cuenta las personas esperando.
- La dirección del taller es la misma de retiro (Ajustes › Envíos y retiro).
- Los formularios del panel se envían a mano: React 19 vaciaba el formulario después de un error y se perdía lo escrito.
- Dominio propio (25/09/2026): `www.estilorustica.com`, comprado en Namecheap. DNS en Namecheap: dos registros A de `@` (216.198.79.1 y 64.29.17.1) y un CNAME de `www` hacia Vercel. `estilorustica.com` y `casarustica.vercel.app` redirigen a `www`. `NEXT_PUBLIC_SITE_URL` en Vercel apunta al dominio nuevo.
- Auth (25/09/2026): Site URL `https://www.estilorustica.com`, Redirect URLs del dominio, de `casarustica.vercel.app` y de `localhost:3000`, y **Confirm email apagado**: el servidor de mails gratis de Supabase solo entrega al equipo del proyecto. Si más adelante se configura un correo propio (SMTP), se puede volver a prender.
- Mercado Pago queda para más adelante: por ahora se cobra por transferencia con comprobante y en efectivo al retirar.
- Vercel llama todos los días a `/api/mantener-activo` (cron en `vercel.json`) para que Supabase no pause el proyecto.
- El manual de uso está dentro del panel, en Ayuda (`/admin/ayuda`).
- Sitemap, robots, imagen para compartir en redes, y páginas 404 y de error en castellano.

## Respuestas de Silvina (24/09/2026)

1. La seña es opcional, producto por producto y taller por taller (porcentaje o monto fijo).
2. Talleres y profesorado se crean y editan desde el panel: fechas, cupos, duración, contenido.
3. Inscripción y seña por la web.
4. Sigue haciendo restauración, ambientación y asesoría.
5. Hace envíos y carga ella las condiciones (zonas con costo y un texto libre).

Criterios tomados a partir de eso: si un pedido lleva seña, la seña se paga online y el resto al retirar o al recibir; el efectivo es solo para retiro; una inscripción sin pagar guarda el lugar 48 h (configurable); las cuotas mensuales del profesorado quedan fuera de la web.

## Pendientes para el lanzamiento

- Silvina carga desde el panel su WhatsApp, el alias o CBU y la dirección de retiro (el Resumen avisa lo que falta), además de productos, fotos y fechas de los talleres.
- Mercado Pago, cuando quiera: cargar `MP_ACCESS_TOKEN` en Vercel, redesplegar y tildarlo en Ajustes › Cómo cobrás.

## Decisiones abiertas

- Tipografía y estilo de color: se eligen y se cambian desde Ajustes › Apariencia (Clásica, Cálida o Sobria; Casa Rústica o Azul Tiffany).
