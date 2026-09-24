# Prompt: tienda online de Casa Rústica (con el taller Azul Tiffany)

Quiero que construyas la página web del emprendimiento de mi mamá, **Silvina Scalzo**, de Miramar (Buenos Aires). La idea es reutilizar la estructura y la arquitectura de una tienda que ya hicimos para mi prima (**Nahilén**), pero con la identidad, los productos y los servicios de mi mamá. Abajo tenés el relevamiento de sus redes, lo que hay que reutilizar, lo que cambia y los errores que ya cometimos para no repetirlos.

Antes de escribir código, leé este documento completo, revisá el proyecto de Nahilén y **proponeme un plan por fases con las decisiones que necesitás que confirme**. Recién cuando lo apruebe, empezá a construir.

---

## 1. El proyecto base a reutilizar

- **Código:** `C:\Users\Scalzo\Desktop\Nahilén` (repo público: https://github.com/theMarroc/nahilen). En producción: https://nahilen.vercel.app
- **Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Supabase (Postgres, Auth, Storage) + Vercel. Todo en planes gratuitos.
- **Leé primero:** `README.md`, `supabase/schema.sql`, `src/lib/db.ts`, `src/lib/pricing.ts`, `src/lib/settings.ts`, `src/actions/`, `src/components/admin/` y `src/app/globals.css`.

**Cómo arrancar:** la carpeta del proyecto ya existe, `C:\Users\Scalzo\Desktop\CasaRustica`, y por ahora solo tiene este prompt (movelo a `docs/` cuando armes la estructura). Copiá ahí el código de Nahilén **sin** `node_modules`, `.next`, `.vercel`, `.env.local` ni `.git`, e inicializá un repo nuevo. Es una copia independiente, no un template compartido: si más adelante aparece una tercera tienda, recién ahí conviene extraer una base común.

**Qué se reutiliza tal cual (ya está probado en producción):**
- Capa única de lectura `db.ts` con **modo demo** (el sitio se ve con datos de ejemplo si todavía no hay Supabase).
- Motor de precios y ofertas (`pricing.ts`: se aplica la mejor oferta, no se acumulan), combos, y **aumentos de precio en lote** con vista previa, redondeo y deshacer (hay inflación: es clave).
- Carrito en localStorage con `useSyncExternalStore`, y checkout que **recalcula precios en el servidor**.
- Pagos: Mercado Pago (Checkout Pro + webhook) y transferencia con **comprobante obligatorio** subido a un bucket privado.
- Página de pedido con token secreto en la URL (sirve para comprar sin cuenta).
- Cuentas de cliente opcionales con direcciones guardadas.
- Panel de administración completo: `FormularioAdmin`, `Interruptor`, `FormularioConfirmado` (confirmación antes de borrar), `EstadoPedido` (cambio de estado optimista), secciones de portada que se prenden/apagan y reordenan, textos editables con valores por defecto en `settings.ts`.
- Esquema con RLS y función `is_admin()`, trigger que impide auto-asignarse admin, y creación de perfil al registrarse.

---

## 2. Quién es y qué hace (relevado de sus redes)

Son tres cuentas del **mismo emprendimiento**, con el mismo taller en Miramar:

| Canal | Qué muestra |
|---|---|
| Instagram **@casarustica.deco** — "Estilo y Decoración by Silvina Scalzo" (≈2,1 mil seguidores) | Profesora de Arte Mix Media · reciclado y restauración de muebles · ambientación y deco-hogar · souvenirs y decoración de eventos. Destacadas: Tejido, Bodas, Latas, Souvenirs, Alumnas, Estilos, Clientes, Insumos, Taller, Profesorado, Láminas. |
| Instagram **@arena_y_mar_20** — "Showroom de arte y deco-hogar", logo "¡SiLa!" | Showroom dentro del taller. "Todos los medios de pago" y "pedidos con anticipación". Bandejas, platos de sitio, organizadores. |
| Facebook **Espacio de ARTE y Decoración Azul Tiffany** — "Taller de arte" (≈1,2 mil seguidores) | "Workshop, clases intensivas, seminarios". Trabajos de ambientación de bodas. |
| heylink.me/silvina8 — "Silvina · Taller de Arte" | Además es **punto de venta de insumos** de *Antique Chalked* (pintura a la tiza) y *Estampa Felicce*. |

Trabaja en **Miramar, Mar del Plata y zona**. La dirección exacta del taller la carga ella desde el panel.

### Productos
- **Bandejas** decorativas y personalizadas: desayunadores con patas, con manijas, con cajoncito multifunción, estilo azulejo/mosaico.
- **Platos de sitio**.
- **Latas pintadas** (yerba, azúcar, café) y sets u organizadores de cocina.
- **Sets con técnicas decorativas**: efecto madera con nudo, zincado, mármol.
- **Cartelería y cuadros personalizados**: bienvenida de boda, libro de firmas en forma de árbol, relojes y cuadros pintados, láminas.
- **Tejidos a mano**: camperitas infantiles de lana en tonos pastel (lila, verde menta), con punto trenza.
- **Souvenirs para eventos**: mates de madera personalizados, latas, kits.
- **Insumos de arte** (reventa): pintura a la tiza, stencils, transfers.

Muchos productos son **a pedido o personalizables** (nombres, fecha, colores), con demora de fabricación.

### Servicios (bajo el nombre del taller Azul Tiffany)
- **Clases y talleres:** "Taller de decoración y técnicas múltiples", clases de pintura personalizadas, **Profesorado de Arte Mix Media** (formación larga: confirmar duración), workshops, clases intensivas, seminarios, y clases de renovación de muebles.
- **Restauración y reciclado de muebles y cuadros**, con presupuesto a partir de fotos ("Mandanos foto y te pasamos presupuesto"). Tiene publicaciones de antes y después muy fuertes.
- **Ambientación y decoración de eventos**, sobre todo bodas: mesas vintage blancas, cartelería, centros con hortensias en latas, souvenirs.
- **Asesoría de estilo / deco-hogar**: publica tips de interiorismo ("Definí tu estilo", iluminación por ambiente).

> Mi mamá estuvo más activa con Casa Rústica. Azul Tiffany parece menos activo, aunque su Facebook publicó el 9 de marzo de 2026. **Confirmá conmigo qué talleres dicta hoy** antes de armar la agenda.

---

## 3. Marca e identidad visual

**Decisión tomada:** la marca principal es **Casa Rústica** (logo: "Rústica · Deco Home"). **Azul Tiffany** vive dentro del sitio como su taller de arte: la sección de clases, talleres y servicios, con su propio acento de color y su logo de mariposa. **Arena y Mar / SiLa** no se usa como marca: su contenido (bandejas, platos, sets) entra al catálogo de Casa Rústica, y "Showroom en Miramar" pasa a ser el punto de retiro.

**Estética que se repite en todo su trabajo:** madera natural, piedra, blanco, texturas artesanales. Hay un **celeste empolvado** muy característico en latas, bandejas y tortas, y pasteles suaves en los tejidos. Las fotos son reales, de taller y de eventos, con mucho "antes y después".

**Paleta propuesta** (valores aproximados, sacados de las fotos de sus redes; alcanzan para construir y se pueden ajustar si después aparece el logo original):

| Token | Hex | Uso |
|---|---|---|
| `hueso` | `#FAF7F2` | fondo general |
| `lino` | `#EFE6DA` | superficies, bandas |
| `arena` | `#BFA98F` | tono del logo, detalles |
| `madera` | `#A67C52` | acento cálido, botones secundarios |
| `nogal` | `#5A4636` | títulos |
| `celeste` | `#8FB2D6` | su azul de latas y bandejas: acento principal de Casa Rústica |
| `tiffany` | `#81D8D0` | acento **solo** de la sección del taller Azul Tiffany |
| `piedra` | `#9C968E` | bordes, texto secundario |
| `carbon` | `#33302C` | texto |

**Tipografías:** el logo usa una script fina ("Rústica") y versalitas ("DECO HOME"). Propongo una serif cálida para títulos (por ejemplo Cormorant Garamond), una script solo para palabras sueltas de acento (el mismo recurso que la cursiva terracota de Nahilén) y una sans legible para texto (por ejemplo Nunito Sans). Proponeme alternativas: no tiene que parecerse a Nahilén.

**Tono de voz:** cálido y cercano, en voseo rioplatense. Frases suyas que marcan el tono: "dar nueva vida a lo que parecía perdido", "diseño con alma", "hecho a mano con amor". En el sitio, emojis con moderación.

---

## 4. Qué cambia en la arquitectura respecto de Nahilén

1. **Tres tipos de producto:** con stock (showroom, insumos), **a pedido** (con demora de fabricación visible y posibilidad de seña) y **personalizable** (campos de texto que el cliente completa: nombres, fecha, colores; se guardan en la línea del pedido).
2. **Servicios con presupuesto** (restauración, ambientación, asesoría): formulario con **subida de fotos**, medidas, zona y fecha del evento. Se guarda como "solicitud" en la base, avisa por WhatsApp y el panel tiene una pantalla de solicitudes con estados (nueva → presupuestada → aceptada → terminada).
3. **Talleres y clases:** entidad con fechas u horarios, cupo, precio, seña y materiales incluidos. Inscripción con pago de seña reutilizando el flujo de pedido (Mercado Pago o transferencia + comprobante). El panel muestra inscriptos y cupos disponibles; si se llena el cupo, pasa a lista de espera.
4. **Galería "Antes y después"** con comparador deslizable: es su mejor contenido de venta para la restauración. Sección de portada que se puede apagar.
5. **Portfolio de eventos y bodas** (fotos por evento).
6. **Pago en efectivo al retirar en el showroom**, además de Mercado Pago y transferencia ("todos los medios de pago").
7. **Sub-marca del taller:** la sección del taller (por ejemplo `/taller`) usa el acento `tiffany` y el logo de la mariposa, dentro del mismo layout de Casa Rústica.
8. Los **combos** de Nahilén se reutilizan como "sets" o "kits" (por ejemplo, un kit de souvenirs o un set de latas).

**Secciones de portada propuestas (todas se prenden y apagan desde el panel):** portada, beneficios, categorías, destacados, ofertas, sets, antes y después, talleres próximos, servicios, eventos, zona de entrega y showroom, preguntas frecuentes, newsletter.

---

## 5. Infraestructura

- **Supabase:** proyecto nuevo, separado del de Nahilén, en la región South America (São Paulo). **Ojo: el plan gratis permite 2 proyectos activos**, y hoy hay dos: `nahilen` (ref `rddpaxcamctzzjfmdglj`, el que usa la tienda de mi prima: **no tocar**) y un duplicado vacío llamado "Nahilén" con tilde. Ese duplicado hay que borrarlo antes; pedímelo, no lo borres vos.
- **Vercel:** proyecto nuevo (`casarustica` si está libre). Ya estoy autenticado en la CLI.
- **GitHub:** repo nuevo en mi cuenta (theMarroc). Preguntame si lo querés público o privado.
- Las claves secretas (`SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`) las cargo yo. Pasame el comando y lo ejecuto.

---

## 6. Errores que ya cometimos con Nahilén (no los repitas)

- **Next 16:** el middleware se llama `proxy.ts`; `params` y `searchParams` son Promises; las carpetas que empiezan con `_` son privadas y **no generan rutas**. `revalidatePath` dentro de una Server Action refresca la vista.
- **El proyecto vive dentro de un repo git accidental en `C:\Users\Scalzo`:** configurá `turbopack.root` en `next.config.ts`, y hacé `git init` dentro de la carpeta del proyecto.
- **Tailwind v4:** los tokens van en `@theme` de `globals.css`. Un elemento `absolute` sin `left-0` parte del centro del botón (así se rompieron los interruptores).
- **lucide-react no trae íconos de marcas** (Instagram, Facebook, WhatsApp). Están dibujados en `src/components/ui/marca.tsx`.
- **Supabase RLS descarta en silencio** los cambios que no permite: no da error, simplemente no actualiza ni borra. En Nahilén, borrar pedidos "no hacía nada" porque faltaba la política. Hacé `.select()` después de cada update o delete y verificá que devolvió filas, y definí políticas para **cada operación** que use el panel.
- **Claves nuevas de Supabase** (`sb_publishable_…` / `sb_secret_…`): funcionan con supabase-js 2.116.
- **Vercel:** la CLI global está desactualizada. Usá `npx vercel@latest`. Cambiar una variable de entorno requiere redesplegar.
- **Escribí los textos en español con tildes desde el principio.** En Nahilén hubo que corregirlos todos después.
- Toda acción destructiva lleva confirmación, y todo cambio de estado lleva respuesta visual inmediata.

---

## 7. El contenido lo carga ella: vos construí con placeholders

La página es autoadministrable, así que **no esperes material para avanzar**. Todo el contenido se carga desde el panel, y el sitio tiene que verse bien vacío o con datos de ejemplo, como en Nahilén (`PlaceholderImagen`, modo demo, textos por defecto en `settings.ts`).

**Lo carga Silvina desde el panel:** fotos y precios de productos, antes y después, fotos de eventos, talleres con fechas y cupos, textos, WhatsApp, alias o CBU, envíos y horarios del showroom.

**Para que eso sea posible:**
- **Los logos también se suben desde el panel** (en Ajustes: el de Casa Rústica y el del taller). Mientras no haya archivo, se muestra el nombre con la tipografía de la marca. En Nahilén el logo estaba fijo en el código; acá no.
- Cada entidad nueva (antes y después, eventos, talleres) tiene su propio subidor de imágenes, reutilizando `SubidorImagen` y `GestorImagenes`.
- Los placeholders tienen que verse intencionales, no rotos.

**Lo único que hay que confirmar con ella**, porque cambia *qué funcionalidades construir* y no el contenido: qué servicios y talleres ofrece hoy y cómo funcionan (si tienen cupo, si cobra seña, si la inscripción es por la web o solo por WhatsApp, si los productos a pedido llevan seña). Preguntámelo en la fase de planificación.

---

## 8. Cómo quiero que trabajes

- Todo en español rioplatense, en la interfaz y en tus mensajes.
- Construí por fases. En cada una: `npm run build` y `npm run lint` limpios, y verificación en el navegador (escritorio y 375 px de ancho, sin scroll horizontal).
- No inventes datos reales (precios, horarios, direcciones): usá valores de ejemplo marcados como tales. Los reales los carga ella desde el panel.
- Al terminar cada fase, dame un resumen corto de qué quedó hecho, qué probaste y qué queda pendiente.
