-- ===========================================================================
-- Casa Rústica: esquema completo de la base de datos
-- ---------------------------------------------------------------------------
-- Como usarlo:
--   1. Entrá a https://supabase.com/dashboard  ->  tu proyecto
--   2. Menú lateral  ->  SQL Editor  ->  New query
--   3. Pegá TODO este archivo y apretá Run
--
-- El script es idempotente: se puede volver a correr sin romper nada.
-- ===========================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfiles de usuario
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- Devuelve true si el usuario logueado es administrador.
-- SECURITY DEFINER para que las politicas RLS no entren en recursion.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = auth.uid()), false);
$$;

-- Crea el perfil automaticamente cuando alguien se registra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catalogo
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  long_description text,
  category_id uuid references public.categories on delete set null,
  price numeric(12, 2) not null default 0 check (price >= 0),
  unit text,
  stock integer not null default 0,
  track_stock boolean not null default false,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);

-- Modalidad, personalización y seña. Van con alter para que el script sirva
-- también en bases ya creadas.
alter table public.products
  add column if not exists fulfillment text not null default 'stock',
  add column if not exists lead_time text,
  add column if not exists custom_fields jsonb not null default '[]'::jsonb,
  add column if not exists deposit_type text not null default 'none',
  add column if not exists deposit_value numeric(12, 2) not null default 0;

alter table public.products drop constraint if exists products_fulfillment_check;
alter table public.products add constraint products_fulfillment_check
  check (fulfillment in ('stock', 'a_pedido'));

alter table public.products drop constraint if exists products_deposit_check;
alter table public.products add constraint products_deposit_check
  check (
    deposit_type in ('none', 'percent', 'amount')
    and deposit_value >= 0
    and (deposit_type <> 'percent' or deposit_value <= 100)
  );

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists product_images_product_idx on public.product_images (product_id);

-- ---------------------------------------------------------------------------
-- Ofertas y combos
-- ---------------------------------------------------------------------------

create table if not exists public.offers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'percent' check (kind in ('percent', 'amount')),
  value numeric(12, 2) not null default 0 check (value >= 0),
  scope text not null default 'all' check (scope in ('all', 'category', 'product')),
  category_id uuid references public.categories on delete cascade,
  product_id uuid references public.products on delete cascade,
  label text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.combo_items (
  id uuid primary key default gen_random_uuid(),
  combo_id uuid not null references public.combos on delete cascade,
  product_id uuid not null references public.products on delete cascade,
  quantity integer not null default 1 check (quantity > 0)
);

create index if not exists combo_items_combo_idx on public.combo_items (combo_id);

-- Historial de aumentos de precio (para poder auditar y volver atras)
create table if not exists public.price_changes (
  id uuid primary key default gen_random_uuid(),
  -- batch_id agrupa todos los cambios de un mismo aumento masivo,
  -- para poder deshacerlo completo desde el panel.
  batch_id uuid not null default gen_random_uuid(),
  product_id uuid references public.products on delete set null,
  product_name text,
  old_price numeric(12, 2),
  new_price numeric(12, 2),
  reason text,
  reverted_at timestamptz,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists price_changes_batch_idx on public.price_changes (batch_id);

-- ---------------------------------------------------------------------------
-- Contenido editable del sitio
-- ---------------------------------------------------------------------------

create table if not exists public.settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

create table if not exists public.sections (
  key text primary key,
  label text not null,
  description text,
  is_enabled boolean not null default true,
  sort_order integer not null default 0
);

create table if not exists public.benefits (
  id uuid primary key default gen_random_uuid(),
  icon text not null default 'hoja',
  title text not null unique,
  subtitle text,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null unique,
  answer text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Trabajos: antes y después, y eventos
-- ---------------------------------------------------------------------------

create table if not exists public.before_after (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  before_url text not null,
  after_url text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  kind text,
  event_date date,
  place text,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_images (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events on delete cascade,
  url text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists event_images_event_idx on public.event_images (event_id);

-- El carrusel de fotos se reemplazó por Antes y después y Eventos.
drop table if exists public.gallery_images;

-- ---------------------------------------------------------------------------
-- Direcciones de entrega
-- ---------------------------------------------------------------------------

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  label text not null default 'Mi casa',
  street text not null,
  number text not null,
  apartment text,
  city text not null,
  zone text,
  postal_code text,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists addresses_user_idx on public.addresses (user_id);

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  access_token text not null,
  user_id uuid references auth.users on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_type text not null default 'delivery' check (delivery_type in ('delivery', 'pickup')),
  address_street text,
  address_number text,
  address_apartment text,
  address_city text,
  address_zone text,
  address_notes text,
  payment_method text not null default 'transfer' check (payment_method in ('mercadopago', 'transfer', 'cash')),
  status text not null default 'pendiente_pago' check (
    status in (
      'pendiente_pago',
      'comprobante_enviado',
      'sena_pagada',
      'pagado',
      'en_preparacion',
      'listo',
      'entregado',
      'cancelado'
    )
  ),
  items_total numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  shipping_total numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  receipt_path text,
  mp_payment_id text,
  mp_preference_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  kind text not null default 'product' check (kind in ('product', 'combo')),
  product_id uuid references public.products on delete set null,
  combo_id uuid references public.combos on delete set null,
  name text not null,
  unit_price numeric(12, 2) not null default 0,
  quantity integer not null default 1 check (quantity > 0),
  subtotal numeric(12, 2) not null default 0
);

create index if not exists order_items_order_idx on public.order_items (order_id);

-- Seña, saldo, zona de envío, efectivo y los estados nuevos.
alter table public.orders
  add column if not exists deposit_total numeric(12, 2) not null default 0,
  add column if not exists balance_due numeric(12, 2) not null default 0,
  add column if not exists shipping_zone text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('mercadopago', 'transfer', 'cash'));

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (
    status in (
      'pendiente_pago',
      'comprobante_enviado',
      'sena_pagada',
      'pagado',
      'en_preparacion',
      'listo',
      'entregado',
      'cancelado'
    )
  );

alter table public.order_items
  add column if not exists personalization jsonb,
  add column if not exists deposit_unit numeric(12, 2) not null default 0;

-- ---------------------------------------------------------------------------
-- Zonas de envío (el costo null significa "a coordinar")
-- ---------------------------------------------------------------------------

create table if not exists public.shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cost numeric(12, 2) check (cost is null or cost >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  for t in
    select unnest(array['categories', 'products', 'offers', 'combos', 'orders', 'settings', 'before_after', 'events', 'shipping_zones'])
  loop
    execute format('drop trigger if exists set_updated_at_%1$s on public.%1$s', t);
    execute format(
      'create trigger set_updated_at_%1$s before update on public.%1$s
         for each row execute function public.set_updated_at()', t
    );
  end loop;
end
$$;

-- Nadie puede darse permisos de administrador a si mismo desde el navegador:
-- el cambio de `is_admin` solo pasa desde el SQL Editor o el backend.
create or replace function public.protect_is_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin
     and current_user not in ('postgres', 'service_role', 'supabase_admin')
  then
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_is_admin_trigger on public.profiles;
create trigger protect_is_admin_trigger
  before update on public.profiles
  for each row execute function public.protect_is_admin();

-- ===========================================================================
-- Row Level Security
-- ===========================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.offers enable row level security;
alter table public.combos enable row level security;
alter table public.combo_items enable row level security;
alter table public.price_changes enable row level security;
alter table public.settings enable row level security;
alter table public.sections enable row level security;
alter table public.benefits enable row level security;
alter table public.faqs enable row level security;
alter table public.before_after enable row level security;
alter table public.events enable row level security;
alter table public.event_images enable row level security;
alter table public.shipping_zones enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- --- Perfiles --------------------------------------------------------------
drop policy if exists "perfil propio visible" on public.profiles;
create policy "perfil propio visible" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- El trigger `protect_is_admin` impide que alguien se auto-asigne el panel.
drop policy if exists "perfil propio editable" on public.profiles;
create policy "perfil propio editable" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- --- Contenido publico de lectura -----------------------------------------
-- Lectura abierta (el sitio es publico); escritura solo para la administradora.

drop policy if exists "categorias visibles" on public.categories;
create policy "categorias visibles" on public.categories
  for select using (is_active or public.is_admin());

drop policy if exists "categorias administrables" on public.categories;
create policy "categorias administrables" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "productos visibles" on public.products;
create policy "productos visibles" on public.products
  for select using (is_active or public.is_admin());

drop policy if exists "productos administrables" on public.products;
create policy "productos administrables" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "imagenes visibles" on public.product_images;
create policy "imagenes visibles" on public.product_images for select using (true);

drop policy if exists "imagenes administrables" on public.product_images;
create policy "imagenes administrables" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ofertas visibles" on public.offers;
create policy "ofertas visibles" on public.offers
  for select using (is_active or public.is_admin());

drop policy if exists "ofertas administrables" on public.offers;
create policy "ofertas administrables" on public.offers
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "combos visibles" on public.combos;
create policy "combos visibles" on public.combos
  for select using (is_active or public.is_admin());

drop policy if exists "combos administrables" on public.combos;
create policy "combos administrables" on public.combos
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items de combo visibles" on public.combo_items;
create policy "items de combo visibles" on public.combo_items for select using (true);

drop policy if exists "items de combo administrables" on public.combo_items;
create policy "items de combo administrables" on public.combo_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ajustes visibles" on public.settings;
create policy "ajustes visibles" on public.settings for select using (true);

drop policy if exists "ajustes administrables" on public.settings;
create policy "ajustes administrables" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "secciones visibles" on public.sections;
create policy "secciones visibles" on public.sections for select using (true);

drop policy if exists "secciones administrables" on public.sections;
create policy "secciones administrables" on public.sections
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "beneficios visibles" on public.benefits;
create policy "beneficios visibles" on public.benefits
  for select using (is_active or public.is_admin());

drop policy if exists "beneficios administrables" on public.benefits;
create policy "beneficios administrables" on public.benefits
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "faqs visibles" on public.faqs;
create policy "faqs visibles" on public.faqs
  for select using (is_active or public.is_admin());

drop policy if exists "faqs administrables" on public.faqs;
create policy "faqs administrables" on public.faqs
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "antes y despues visibles" on public.before_after;
create policy "antes y despues visibles" on public.before_after
  for select using (is_active or public.is_admin());

drop policy if exists "antes y despues administrables" on public.before_after;
create policy "antes y despues administrables" on public.before_after
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "eventos visibles" on public.events;
create policy "eventos visibles" on public.events
  for select using (is_active or public.is_admin());

drop policy if exists "eventos administrables" on public.events;
create policy "eventos administrables" on public.events
  for all using (public.is_admin()) with check (public.is_admin());

-- Las fotos de un evento oculto tampoco se ven.
drop policy if exists "fotos de eventos visibles" on public.event_images;
create policy "fotos de eventos visibles" on public.event_images
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_images.event_id and (e.is_active or public.is_admin())
    )
  );

drop policy if exists "fotos de eventos administrables" on public.event_images;
create policy "fotos de eventos administrables" on public.event_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "zonas de envio visibles" on public.shipping_zones;
create policy "zonas de envio visibles" on public.shipping_zones
  for select using (is_active or public.is_admin());

drop policy if exists "zonas de envio administrables" on public.shipping_zones;
create policy "zonas de envio administrables" on public.shipping_zones
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Newsletter ------------------------------------------------------------
drop policy if exists "cualquiera se suscribe" on public.newsletter_subscribers;
create policy "cualquiera se suscribe" on public.newsletter_subscribers
  for insert with check (true);

drop policy if exists "suscriptores solo admin" on public.newsletter_subscribers;
create policy "suscriptores solo admin" on public.newsletter_subscribers
  for select using (public.is_admin());

-- --- Historial de precios --------------------------------------------------
drop policy if exists "historial solo admin" on public.price_changes;
create policy "historial solo admin" on public.price_changes
  for all using (public.is_admin()) with check (public.is_admin());

-- --- Direcciones -----------------------------------------------------------
drop policy if exists "direcciones propias" on public.addresses;
create policy "direcciones propias" on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- --- Pedidos ---------------------------------------------------------------
-- Los pedidos se CREAN desde el servidor (service_role), asi los precios
-- siempre se calculan en el backend y no se pueden falsear desde el navegador.
drop policy if exists "pedidos propios" on public.orders;
create policy "pedidos propios" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "pedidos administrables" on public.orders;
create policy "pedidos administrables" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "items de pedido propios" on public.order_items;
create policy "items de pedido propios" on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );

-- ===========================================================================
-- Storage: imagenes de productos (publico) y comprobantes (privado)
-- ===========================================================================

insert into storage.buckets (id, name, public)
values ('productos', 'productos', true)
on conflict (id) do update set public = true;

-- Los comprobantes se suben desde el navegador con una URL firmada (no pasan
-- por el servidor de la app), así que el límite lo pone el propio bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'comprobantes', 'comprobantes', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagenes de productos publicas" on storage.objects;
create policy "imagenes de productos publicas" on storage.objects
  for select using (bucket_id = 'productos');

drop policy if exists "subir imagenes de productos" on storage.objects;
create policy "subir imagenes de productos" on storage.objects
  for insert with check (bucket_id = 'productos' and public.is_admin());

drop policy if exists "borrar imagenes de productos" on storage.objects;
create policy "borrar imagenes de productos" on storage.objects
  for delete using (bucket_id = 'productos' and public.is_admin());

drop policy if exists "comprobantes solo admin" on storage.objects;
create policy "comprobantes solo admin" on storage.objects
  for select using (bucket_id = 'comprobantes' and public.is_admin());

-- ===========================================================================
-- Datos iniciales
-- ===========================================================================

-- Secciones de la portada que se pueden prender y apagar desde el panel
delete from public.sections where key = 'carrusel';

insert into public.sections (key, label, description, sort_order) values
  ('hero',             'Portada principal',      'Imagen grande, título y botón de la primera pantalla.', 1),
  ('barra_beneficios', 'Barra de beneficios',    'La tira con Hecho a mano, Showroom, etc.',              2),
  ('categorias',       'Categorías',             'Las tarjetas con bandejas, latas, souvenirs, etc.',     3),
  ('destacados',       'Productos destacados',   'Los productos marcados como destacados.',               4),
  ('ofertas',          'Ofertas vigentes',       'Productos con descuento activo.',                       5),
  ('combos',           'Sets y kits',            'Los sets y kits armados desde el panel.',               6),
  ('antes_despues',    'Antes y después',        'Los trabajos de restauración, con el comparador.',      7),
  ('eventos',          'Eventos y bodas',        'Los últimos eventos ambientados.',                      8),
  ('frase',            'Franja con la frase',    'La franja con la frase de la marca.',                   9),
  ('mapa_delivery',    'Zona de entrega',        'Texto y mapa de la zona donde se entrega.',            10),
  ('faq',              'Preguntas frecuentes',   'El acordeón de preguntas y respuestas.',               11),
  ('newsletter',       'Newsletter',             'El formulario para dejar el mail.',                    12)
on conflict (key) do nothing;

insert into public.benefits (icon, title, subtitle, sort_order) values
  ('corazon', 'Hecho a mano',      'con amor',          1),
  ('pincel',  'Piezas únicas',     'y personalizadas',  2),
  ('casa',    'Showroom',          'en Miramar',        3),
  ('tarjeta', 'Todos los medios',  'de pago',           4)
on conflict (title) do nothing;

insert into public.faqs (question, answer, sort_order) values
  ('¿Hacen piezas personalizadas?',
   'Sí. Muchas piezas se hacen a pedido, con nombres, fechas o los colores que elijas. Escribinos por WhatsApp y lo charlamos.', 1),
  ('¿Cuánto tarda un pedido?',
   'Lo que está en stock te lo llevás enseguida. Las piezas a pedido llevan unos días de trabajo en el taller: te avisamos la demora antes de confirmar.', 2),
  ('¿Cómo puedo pagar?',
   'Con transferencia o con Mercado Pago. Si elegís transferencia, te pedimos el comprobante para confirmar el pedido.', 3),
  ('¿Dónde retiro mi pedido?',
   'Podés retirarlo por el showroom en Miramar o coordinar el envío. Trabajamos en Miramar, Mar del Plata y zona.', 4)
on conflict (question) do nothing;

insert into public.categories (slug, name, description, sort_order) values
  ('bandejas',              'Bandejas',               'Desayunadores, con manijas o con cajoncito, pintadas a mano.', 1),
  ('latas-y-organizadores', 'Latas y organizadores',  'Latas de yerba, azúcar y café, y sets para la cocina.',        2),
  ('souvenirs',             'Souvenirs',              'Mates, latas y kits personalizados para tu evento.',           3),
  ('platos-de-sitio',       'Platos de sitio',        'Para poner una mesa linda todos los días.',                    4),
  ('sets-decorativos',      'Sets decorativos',       'Técnicas de efecto madera, zincado y mármol.',                 5),
  ('carteleria-y-cuadros',  'Cartelería y cuadros',   'Carteles de bienvenida, relojes, cuadros y láminas.',          6),
  ('tejidos-a-mano',        'Tejidos a mano',         'Camperitas y abrigos tejidos en colores suaves.',              7),
  ('insumos-de-arte',       'Insumos de arte',        'Pintura a la tiza, stencils y transfers.',                     8)
on conflict (slug) do nothing;

-- Los productos no se precargan: los carga Silvina desde el panel.

-- Zonas sin costo cargado: se ven como "a coordinar" hasta que ella ponga el precio.
insert into public.shipping_zones (name, cost, sort_order) values
  ('Miramar',        null, 1),
  ('Mar del Plata',  null, 2),
  ('Otra localidad', null, 3)
on conflict (name) do nothing;

-- ===========================================================================
-- ULTIMO PASO (importante)
-- ---------------------------------------------------------------------------
-- 1. Creá el usuario administrador en Authentication -> Users -> Add user
--    (con email y contraseña, marcando Auto Confirm User).
-- 2. Volvé acá, reemplazá el mail y corré esta línea para darle el panel:
--
--      update public.profiles set is_admin = true
--      where id = (select id from auth.users where email = 'MAIL@EJEMPLO.COM');
--
-- ===========================================================================
