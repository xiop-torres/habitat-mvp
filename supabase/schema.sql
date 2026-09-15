-- ==============================================================================
-- Habitat MVP - Esquema Inicial Supabase PostgreSQL con Row Level Security (RLS)
-- Costo objetivo: S/ 0 (Supabase Free Tier)
-- ==============================================================================

-- Habilitar extensión pgcrypto para generación de UUIDs y funciones criptográficas
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TIPOS PERSONALIZADOS (ENUMS)
-- ------------------------------------------------------------------------------
create type public.user_role as enum ('student', 'owner', 'admin');
create type public.listing_status as enum ('draft', 'published', 'paused', 'rented', 'archived');
create type public.visit_status as enum ('pending', 'accepted', 'rejected', 'cancelled', 'rescheduled', 'completed');
create type public.notification_type as enum ('visit', 'message', 'favorite', 'listing', 'system');

-- ------------------------------------------------------------------------------
-- 2. TABLAS PRINCIPALES
-- ------------------------------------------------------------------------------

-- Perfiles de usuario (vinculados 1:1 con auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  university text,
  district text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_email_lowercase check (email = lower(email)),
  constraint profiles_first_name_not_blank check (length(trim(first_name)) > 0),
  constraint profiles_last_name_not_blank check (length(trim(last_name)) > 0)
);

-- Publicaciones de alojamientos universitarios
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  property_type text not null,
  district text not null,
  address_reference text,
  lat numeric(10, 7),
  lng numeric(10, 7),
  university_nearby text,
  distance_label text,
  price_monthly numeric(10, 2) not null,
  currency text not null default 'PEN',
  amenities text[] not null default '{}',
  rules text[] not null default '{}',
  status public.listing_status not null default 'draft',
  verified boolean not null default false,
  available_from date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint listings_title_not_blank check (length(trim(title)) > 0),
  constraint listings_property_type_not_blank check (length(trim(property_type)) > 0),
  constraint listings_district_not_blank check (length(trim(district)) > 0),
  constraint listings_price_positive check (price_monthly >= 0),
  constraint listings_currency_pen check (currency = 'PEN'),
  constraint listings_lat_range check (lat is null or (lat >= -90 and lat <= 90)),
  constraint listings_lng_range check (lng is null or (lng >= -180 and lng <= 180))
);

-- Fotografías de alojamientos (apuntan a Supabase Storage: bucket listing-images)
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order integer not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now(),
  constraint listing_images_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint listing_images_sort_order_non_negative check (sort_order >= 0)
);

-- Favoritos guardados por estudiantes
create table public.favorites (
  student_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, listing_id)
);

-- Solicitudes de visita a alojamientos (presencial o virtual)
create table public.visit_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  requested_date date not null,
  requested_time text not null,
  mode text not null default 'presencial',
  message text,
  status public.visit_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visit_requests_student_owner_diff check (student_id <> owner_id),
  constraint visit_requests_requested_time_not_blank check (length(trim(requested_time)) > 0),
  constraint visit_requests_mode_valid check (mode in ('presencial', 'virtual'))
);

-- Conversaciones / Hilos de chat entre estudiante y propietario
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete set null,
  student_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_student_owner_diff check (student_id <> owner_id),
  unique (listing_id, student_id, owner_id)
);

-- Mensajes dentro de una conversación
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint messages_body_not_blank check (length(trim(body)) > 0)
);

-- Notificaciones para estudiantes y propietarios
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_title_not_blank check (length(trim(title)) > 0)
);

-- ------------------------------------------------------------------------------
-- 3. ÍNDICES DE RENDIMIENTO Y CLAVES FORÁNEAS
-- ------------------------------------------------------------------------------
create index profiles_role_idx on public.profiles(role);

create index listings_owner_id_idx on public.listings(owner_id);
create index listings_status_idx on public.listings(status);
create index listings_district_idx on public.listings(district);
create index listings_university_nearby_idx on public.listings(university_nearby);
create index listings_status_created_idx on public.listings(status, created_at desc);

create index listing_images_listing_id_idx on public.listing_images(listing_id);
create index listing_images_sort_idx on public.listing_images(listing_id, sort_order asc);

create index favorites_listing_id_idx on public.favorites(listing_id);

create index visit_requests_student_id_idx on public.visit_requests(student_id);
create index visit_requests_owner_id_idx on public.visit_requests(owner_id);
create index visit_requests_listing_id_idx on public.visit_requests(listing_id);
create index visit_requests_status_idx on public.visit_requests(status);
create index visit_requests_created_idx on public.visit_requests(created_at desc);

create index conversations_student_id_idx on public.conversations(student_id);
create index conversations_owner_id_idx on public.conversations(owner_id);
create index conversations_updated_idx on public.conversations(updated_at desc);

create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index messages_conv_created_idx on public.messages(conversation_id, created_at asc);

create index notifications_user_id_idx on public.notifications(user_id);
create index notifications_user_created_idx on public.notifications(user_id, created_at desc);

-- ------------------------------------------------------------------------------
-- 4. FUNCIONES DE SEGURIDAD Y DISPARADORES (TRIGGERS)
-- ------------------------------------------------------------------------------

-- Función genérica para mantener updated_at actualizado automáticamente
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger listings_set_updated_at
before update on public.listings
for each row execute function public.set_updated_at();

create trigger visit_requests_set_updated_at
before update on public.visit_requests
for each row execute function public.set_updated_at();

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

-- Función SECURITY DEFINER para verificar rol admin sin recursión de políticas RLS
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Seguridad: Impedir que un usuario modifique su propio 'role' (prevención de escalada de privilegios a admin)
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    if not public.is_admin() then
      raise exception 'No está permitido modificar el rol del perfil.';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
before update on public.profiles
for each row execute function public.prevent_profile_role_escalation();

-- Seguridad: Solo administradores pueden marcar un alojamiento como verificado (verified = true)
create or replace function public.check_listing_verification()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'INSERT' and new.verified = true) or (tg_op = 'UPDATE' and new.verified is distinct from old.verified) then
    if not public.is_admin() then
      new.verified = coalesce(old.verified, false);
    end if;
  end if;
  return new;
end;
$$;

create trigger listings_check_verification
before insert or update on public.listings
for each row execute function public.check_listing_verification();

-- Integridad: Proteger participantes e inmueble de solicitudes de visita ante mutaciones indebidas
create or replace function public.prevent_visit_requests_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  if new.student_id is distinct from old.student_id
     or new.owner_id is distinct from old.owner_id
     or new.listing_id is distinct from old.listing_id then
    raise exception 'No se pueden transferir solicitudes de visita a otros participantes o alojamientos.';
  end if;
  return new;
end;
$$;

create trigger visit_requests_prevent_immutable_mutation
before update on public.visit_requests
for each row execute function public.prevent_visit_requests_immutable_fields();

-- Integridad: Proteger participantes de conversaciones ante mutaciones indebidas
create or replace function public.prevent_conversation_participant_mutation()
returns trigger
language plpgsql
as $$
begin
  if new.student_id is distinct from old.student_id
     or new.owner_id is distinct from old.owner_id then
    raise exception 'No se pueden transferir conversaciones a otros participantes.';
  end if;
  return new;
end;
$$;

create trigger conversations_prevent_participant_mutation
before update on public.conversations
for each row execute function public.prevent_conversation_participant_mutation();

-- ------------------------------------------------------------------------------
-- 5. AUTOMATIZACIÓN DE NOTIFICACIONES MEDIANTE TRIGGERS (SECURITY DEFINER)
-- ------------------------------------------------------------------------------

-- Notificar al propietario cuando un estudiante crea una solicitud de visita
create or replace function public.handle_new_visit_request_notification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, href)
  values (
    new.owner_id,
    'visit',
    'Nueva solicitud de visita',
    'Un estudiante ha solicitado agendar una visita para tu alojamiento.',
    '/propietario/solicitudes'
  );
  return new;
end;
$$;

create trigger tr_notify_new_visit_request
after insert on public.visit_requests
for each row execute function public.handle_new_visit_request_notification();

-- Notificar al estudiante cuando el estado de su visita cambia
create or replace function public.handle_visit_request_status_notification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, type, title, body, href)
    values (
      new.student_id,
      'visit',
      'Actualización de tu solicitud de visita',
      case new.status
        when 'accepted' then '¡Tu solicitud de visita fue aceptada por el propietario!'
        when 'rejected' then 'Tu solicitud de visita no pudo ser aceptada.'
        when 'rescheduled' then 'El propietario propuso un nuevo horario para tu visita.'
        when 'cancelled' then 'La solicitud de visita ha sido cancelada.'
        when 'completed' then 'La visita fue marcada como realizada.'
        else 'El estado de tu visita ha cambiado a: ' || new.status::text
      end,
      '/visitas'
    );
  end if;
  return new;
end;
$$;

create trigger tr_notify_visit_request_status
after update on public.visit_requests
for each row execute function public.handle_visit_request_status_notification();

-- Notificar al destinatario cuando se recibe un nuevo mensaje
create or replace function public.handle_new_message_notification()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  recipient_id uuid;
  conv record;
begin
  select student_id, owner_id into conv from public.conversations where id = new.conversation_id;
  if found then
    if new.sender_id = conv.student_id then
      recipient_id := conv.owner_id;
    else
      recipient_id := conv.student_id;
    end if;

    insert into public.notifications (user_id, type, title, body, href)
    values (
      recipient_id,
      'message',
      'Nuevo mensaje recibido',
      substring(new.body from 1 for 80),
      '/mensajes'
    );
  end if;
  return new;
end;
$$;

create trigger tr_notify_new_message
after insert on public.messages
for each row execute function public.handle_new_message_notification();

-- ------------------------------------------------------------------------------
-- 6. PERMISOS POSTGREST Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

-- Conceder permisos de acceso a PostgREST (la seguridad la gobierna RLS)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on routines to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.favorites enable row level security;
alter table public.visit_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- PROFILES
create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

create policy "Public can read owner profiles"
on public.profiles
for select
to anon
using (role = 'owner');

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- LISTINGS
create policy "Public can read published listings"
on public.listings
for select
to anon, authenticated
using (
  status = 'published'
  or owner_id = auth.uid()
  or public.is_admin()
);

create policy "Owners can create their own listings"
on public.listings
for insert
to authenticated
with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('owner', 'admin')
  )
);

create policy "Owners can update their own listings"
on public.listings
for update
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
)
with check (
  owner_id = auth.uid()
  or public.is_admin()
);

create policy "Owners can delete their own listings"
on public.listings
for delete
to authenticated
using (
  owner_id = auth.uid()
  or public.is_admin()
);

-- LISTING_IMAGES
create policy "Public can read images from published listings"
on public.listing_images
for select
to anon, authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and (
        listings.status = 'published'
        or listings.owner_id = auth.uid()
      )
  )
);

create policy "Owners can manage images for their listings"
on public.listing_images
for all
to authenticated
using (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and (
        listings.owner_id = auth.uid()
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.listings
    where listings.id = listing_images.listing_id
      and (
        listings.owner_id = auth.uid()
        or public.is_admin()
      )
  )
);

-- FAVORITES
create policy "Students can read their own favorites"
on public.favorites
for select
to authenticated
using (student_id = auth.uid());

create policy "Students can create their own favorites"
on public.favorites
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('student', 'admin')
  )
  and exists (
    select 1 from public.listings
    where listings.id = favorites.listing_id
      and listings.status = 'published'
  )
);

create policy "Students can delete their own favorites"
on public.favorites
for delete
to authenticated
using (student_id = auth.uid());

-- VISIT_REQUESTS
create policy "Visit participants can read requests"
on public.visit_requests
for select
to authenticated
using (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
);

create policy "Students can create visit requests"
on public.visit_requests
for insert
to authenticated
with check (
  student_id = auth.uid()
  and status = 'pending'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('student', 'admin')
  )
  and exists (
    select 1 from public.listings
    where listings.id = visit_requests.listing_id
      and listings.owner_id = visit_requests.owner_id
      and listings.status = 'published'
  )
);

create policy "Visit participants can update requests"
on public.visit_requests
for update
to authenticated
using (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
)
with check (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
);

-- CONVERSATIONS
create policy "Conversation participants can read conversations"
on public.conversations
for select
to authenticated
using (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
);

create policy "Participants can create conversations"
on public.conversations
for insert
to authenticated
with check (
  (student_id = auth.uid() or owner_id = auth.uid())
  and exists (
    select 1 from public.listings
    where listings.id = conversations.listing_id
      and listings.owner_id = conversations.owner_id
      and listings.status = 'published'
  )
);

create policy "Conversation participants can update conversations"
on public.conversations
for update
to authenticated
using (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
)
with check (
  student_id = auth.uid()
  or owner_id = auth.uid()
  or public.is_admin()
);

-- MESSAGES
create policy "Conversation participants can read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.student_id = auth.uid()
        or conversations.owner_id = auth.uid()
      )
  )
);

create policy "Conversation participants can send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.student_id = auth.uid()
        or conversations.owner_id = auth.uid()
      )
  )
);

create policy "Conversation participants can update messages"
on public.messages
for update
to authenticated
using (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.student_id = auth.uid()
        or conversations.owner_id = auth.uid()
      )
  )
)
with check (
  exists (
    select 1 from public.conversations
    where conversations.id = messages.conversation_id
      and (
        conversations.student_id = auth.uid()
        or conversations.owner_id = auth.uid()
      )
  )
);

-- NOTIFICATIONS
create policy "Users can read their own notifications"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert notifications for themselves"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete their own notifications"
on public.notifications
for delete
to authenticated
using (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 7. SUPABASE STORAGE (DOCUMENTACIÓN PARA FASE POSTERIOR - TAREA 6)
-- ------------------------------------------------------------------------------
-- Bucket previsto: 'listing-images' (Público para lectura).
-- - Lectura: pública (anon y authenticated).
-- - Subida/Modificación: propietarios autenticados sobre sus carpetas.
