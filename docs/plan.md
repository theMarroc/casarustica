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
| 0. Arranque | Copia de Nahilén, repo propio, textos fijos de Nahilén afuera, esquema con datos iniciales de Casa Rústica, conexión a Supabase | Hecha, falta conectar Supabase |
| 1. Identidad | Paleta con acento intercambiable (celeste / tiffany en `.marca-taller`), tipografías, logos desde Ajustes, textos por defecto, datos de ejemplo, primer deploy | Hecha, falta elegir tipografías |
| 2. Antes y después, eventos y portada | Comparador deslizable, portfolio de eventos, secciones nuevas de portada, sacar el carrusel | Pendiente |
| 3. Catálogo y checkout | Productos con stock, a pedido y personalizables; seña; efectivo al retirar; estados nuevos del pedido | Pendiente (depende de las respuestas de Silvina) |
| 4. Servicios con presupuesto | Formulario con fotos (URL firmada), solicitudes con estados en el panel | Pendiente (depende de las respuestas) |
| 5. Taller Azul Tiffany | `/taller`, talleres con fechas, cupo, seña, inscripción y lista de espera | Pendiente (depende de las respuestas) |
| 6. Publicación | Variables en Vercel, Auth y webhook, prueba completa, cron para que Supabase no se pause, manual del panel | Pendiente |

## Decisiones tomadas

- Casa Rústica es la marca principal; Azul Tiffany es la sección del taller.
- Los combos se llaman "Sets y kits" (ruta pública `/sets`; la tabla sigue siendo `combos`).
- Los productos no se precargan en la base: los carga Silvina. Las categorías sí.
- Errores y botones de borrar usan su propio color (`alerta`), no el acento.
- Las fotos de clientes se suben con URL firmada directo a Storage.

## Preguntas abiertas para Silvina

1. ¿Los productos a pedido llevan seña? ¿De qué porcentaje? ¿El efectivo al retirar vale para todo?
2. ¿Qué talleres da hoy? Fechas fijas con cupo o a coordinar, precio y seña. Del Profesorado: duración y cómo cobra.
3. ¿Inscripción y seña por la web, o agenda y consulta por WhatsApp?
4. ¿Sigue haciendo restauración, ambientación y asesoría?
5. ¿Hace envíos? ¿A dónde y a qué costo?

## Decisiones abiertas

- Tipografías: opciones A, B y C en `/tipografias` (página temporal).
- Repo de GitHub: público o privado.
- Aviso de solicitudes nuevas: botón de WhatsApp para el cliente y contador en el panel (recomendado).
- Lugar sin pagar en talleres: se libera a las 48 h (recomendado).
