# Casa Rústica: tienda online

Tienda de deco hogar y arte hecho a mano de Silvina Scalzo (Miramar), con el
taller de arte Azul Tiffany. Vende productos (con stock, a pedido y
personalizables), recibe pedidos de presupuesto de sus servicios e inscribe a
sus talleres con cupo y seña. Tiene panel de administración para gestionar todo.

Publicada en <https://casarustica.vercel.app>. El manual para la administradora
está dentro del panel, en **Ayuda** (`/admin/ayuda`).

Todo el stack es **gratis**: Next.js en Vercel + Supabase (base de datos, login
y almacenamiento de imágenes). No hace falta comprar dominio: queda publicada en
una dirección `algo.vercel.app`.

---

## Qué puede hacer la administradora

| Sección del panel | Para qué sirve |
|---|---|
| **Resumen** | Pedidos por revisar, presupuestos nuevos, productos sin stock y lo que falta configurar. |
| **Pedidos** | Pedidos de la tienda (CR-) e inscripciones al taller (TA-): comprobante, estado y WhatsApp del cliente. |
| **Productos** | Fotos, precio, stock o a pedido con demora, seña opcional y campos de personalización. |
| **Categorías** | Agrupar el catálogo (bandejas, latas, souvenirs…). |
| **Sets y kits** | Armar sets de varios productos a un precio especial. |
| **Presupuestos** | Las consultas de los servicios, con fotos, monto, notas y estado. |
| **Servicios** | Restauración, ambientación y asesoría: qué pide cada formulario y qué trabajos muestra. |
| **Talleres** | Talleres y profesorado, con fechas, cupo, precio y seña; inscriptas y lista de espera. |
| **Antes y después / Eventos** | Los trabajos que se ven en `/trabajos`. |
| **Ofertas** | Descuentos por porcentaje o monto fijo, sobre toda la tienda, una categoría o un producto, con fecha de inicio y fin. |
| **Aumentar precios** | Subir (o bajar) todos los precios un porcentaje, con vista previa, redondeo y opción de deshacer. |
| **Secciones** | Prender, apagar y ordenar cada bloque de la portada. |
| **Textos y fotos** | Todos los textos, la portada, Nosotros, la página del taller, los beneficios y las preguntas frecuentes. |
| **Ajustes** | Apariencia, logos, WhatsApp y redes, cobros, envíos y zonas, retiro y horas de reserva del taller. |
| **Ayuda** | El manual de uso del panel. |

Los clientes pueden comprar **sin cuenta**. Si se registran, se les guardan las
direcciones de entrega y el historial de pedidos.

---

## 1. Probarlo en tu computadora

```bash
npm install
npm run dev
```

Abrí <http://localhost:3000>. Sin configurar nada todavía, el sitio arranca en
**modo demostración** con productos de ejemplo, para ver cómo queda el diseño.
El panel de administración pide la base de datos: eso se configura abajo.

---

## 2. Crear la base de datos (Supabase)

1. Entrá a <https://supabase.com> y creá una cuenta gratis.
2. **New project**. Elegí un nombre, una contraseña para la base (guardala) y la
   región **South America (São Paulo)**, que es la más cercana.
3. Cuando termine de crearse, andá a **SQL Editor › New query**, pegá **todo** el
   contenido del archivo [`supabase/schema.sql`](supabase/schema.sql) y apretá
   **Run**. Eso crea las tablas, los permisos, los espacios para las imágenes y
   los datos iniciales (categorías, servicios, talleres y secciones). Los
   productos no se precargan: los carga la administradora.
4. Andá a **Project Settings › API** y copiá tres valores:
   - **Project URL**
   - **anon public** (la clave pública)
   - **service_role** (la clave secreta: no se comparte con nadie)

Creá el archivo `.env.local` en la raíz del proyecto (podés copiar
`.env.example`) y completalo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Reiniciá `npm run dev`.

> `.env.local` está en el `.gitignore`: nunca se sube al repositorio.

---

## 3. Crear el usuario administrador

1. En Supabase, **Authentication › Users › Add user › Create new user**.
2. Poné el mail y la contraseña de Silvina, y **tildá "Auto Confirm User"**
   (si no, le va a pedir confirmar el mail).
3. Volvé al **SQL Editor** y corré esto, cambiando el mail:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'MAIL@EJEMPLO.COM');
```

Listo: entrando a `/ingresar` con ese mail ya ve el panel en `/admin`.

---

## 4. Publicarlo en internet (Vercel, gratis)

1. Subí el proyecto a un repositorio de GitHub.
2. Entrá a <https://vercel.com>, **Add New › Project** e importá ese repositorio.
3. En **Environment Variables** cargá las mismas cuatro variables del
   `.env.local`, pero con `NEXT_PUBLIC_SITE_URL` apuntando a la URL que te da
   Vercel (`https://casarustica.vercel.app`, por ejemplo).
4. **Deploy**.
5. Volvé a Supabase, **Authentication › URL Configuration**: poné esa URL en
   *Site URL* y agregá en *Redirect URLs* `https://tu-sitio.vercel.app/**` (y
   `http://localhost:3000/**` para probar local).
6. En **Authentication › Sign In / Providers**, destildá **Confirm email**. El
   servidor de mails gratis de Supabase solo entrega a las direcciones del
   equipo del proyecto, así que los clientes nunca recibirían la confirmación.
   Si más adelante se configura un correo propio (*Emails › SMTP Settings*),
   se puede volver a prender.

Si el repositorio está conectado a Vercel, cada `git push` publica solo. Este
proyecto hoy se publica a mano con `npx vercel@latest deploy --prod`.

### Mantener el proyecto de Supabase despierto

Los proyectos gratuitos de Supabase se pausan después de **7 días sin ninguna
consulta**. Para que no pase, Vercel llama una vez por día a
`/api/mantener-activo` (el `crons` de `vercel.json`), que solo cuenta las filas
de los ajustes. Si se carga la variable `CRON_SECRET` en Vercel, la ruta exige
ese secreto (Vercel lo manda solo).

---

## 5. Cobrar con Mercado Pago (opcional)

Sin esto, la tienda cobra por transferencia: el cliente ve el alias/CBU, sube el
comprobante y el pedido queda registrado esperando confirmación. Funciona
perfecto y no requiere ningún trámite.

Para aceptar tarjetas:

1. Entrá a <https://www.mercadopago.com.ar/developers/panel>, creá una
   aplicación y copiá el **Access Token de producción**.
2. Agregalo como variable de entorno en Vercel (y en `.env.local` si querés
   probarlo local):

   ```bash
   MP_ACCESS_TOKEN=APP_USR-...
   ```

3. Volvé a desplegar y, en el panel, **Ajustes › Cómo cobrás**, tildá
   *Cobrar con Mercado Pago*.

Cuando alguien paga, Mercado Pago avisa a `/api/mercadopago/webhook` y el pedido
(o la inscripción) pasa solo a **Pagado**, o a **Seña pagada** si lleva seña. El
aviso no se cree tal cual: se le pregunta a Mercado Pago el estado real del pago.

> El Access Token es una credencial secreta, por eso se carga como variable de
> entorno y no desde el panel.

---

## Cómo está armado

```
src/
  app/
    (tienda)/        Páginas públicas: portada, tienda, producto, carrito,
                     checkout, pedido, servicios, taller, trabajos, cuenta
    admin/           Panel de administración (protegido) y su Ayuda
    api/             Webhook de Mercado Pago y el ping diario a Supabase
    auth/callback/   Confirmación de mail de Supabase
  actions/           Server Actions (todo lo que escribe en la base)
    admin/           Acciones del panel
  components/        Componentes de UI, agrupados por área
  lib/
    db.ts            Única capa de lectura del catálogo (+ modo demo)
    pricing.ts       Cálculo de precios, ofertas y seña
    talleres.ts      Cupos, fechas y reservas del taller
    mercadopago.ts   Preferencias de Checkout Pro
    settings.ts      Textos y parámetros editables, con sus valores por defecto
    supabase/        Clientes de Supabase (navegador, servidor, service_role)
supabase/
  schema.sql         Todo el esquema, los permisos y los datos iniciales
docs/
  prompt-casa-rustica.md  Relevamiento y pedido original
  plan.md                 Plan por fases y decisiones
```

### Decisiones que conviene conocer

- **Los precios se recalculan siempre en el servidor.** El carrito vive en el
  navegador, pero al confirmar el pedido se vuelven a leer los precios y las
  ofertas desde la base. Nadie puede comprar a un precio que se haya editado
  desde el navegador.
- **Los pedidos se crean con la clave `service_role`**, así no hace falta darle
  permiso de escritura a los visitantes anónimos.
- **La página del pedido se abre con un token secreto** en la URL
  (`/pedido/CR-XXXXX?t=...`), así el cliente puede volver a verla sin tener
  cuenta y nadie puede espiar pedidos ajenos.
- **Los comprobantes van a un bucket privado.** En el panel se ven con un enlace
  firmado que vence en una hora.
- **Las ofertas no se acumulan:** si un producto entra en más de una, se aplica
  la que más le conviene al cliente.
- **Cada aumento masivo queda registrado** en `price_changes` con un
  `batch_id`, y por eso se puede deshacer completo.
- **Las fotos de clientes (comprobantes y presupuestos) se suben directo a
  Storage** con una URL firmada que entrega el servidor, sin pasar por una
  Server Action (Next corta en 1 MB y Vercel en 4,5 MB).
- **Una inscripción al taller es un pedido más** (`kind = 'inscripcion'`), así
  reutiliza Mercado Pago, la transferencia y el panel. El cupo lo cuenta la
  función `lugares_tomados()` de la base: una inscripción sin pagar guarda el
  lugar las horas de Ajustes (48 por defecto) y después lo libera.
- **Cambios de esquema en producción:** si solo agregan, primero el SQL y después
  el deploy; si borran algo que usa el código publicado, al revés.
- **Si Supabase no está configurado**, el sitio público funciona igual con datos
  de ejemplo (`src/lib/demo-data.ts`) y muestra un aviso.

---

## Comandos

```bash
npm run dev     # desarrollo en http://localhost:3000
npm run build   # compilar para producción (revisa tipos)
npm run start   # levantar lo compilado
npm run lint    # revisar el código
```
