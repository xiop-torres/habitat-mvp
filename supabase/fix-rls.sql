-- ==============================================================================
-- Habitat MVP - Actualización de Políticas RLS y Permisos PostgREST
-- Ejecutar en Supabase SQL Editor para corregir recursión y permisos de API
-- ==============================================================================

-- 1. Helper function SECURITY DEFINER para verificar rol admin sin recursión de políticas RLS
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

-- 2. Conceder permisos de acceso a PostgREST (indispensable para la Data API de Supabase)
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all routines in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;

alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on routines to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- 3. Eliminar políticas que causaban recursión mutua
drop policy if exists "Public can read owner profiles for published listings" on public.profiles;
drop policy if exists "Public can read owner profiles" on public.profiles;
drop policy if exists "Public can read published listings" on public.listings;
drop policy if exists "Owners can create their own listings" on public.listings;
drop policy if exists "Owners can update their own listings" on public.listings;
drop policy if exists "Owners can delete their own listings" on public.listings;
drop policy if exists "Owners can manage images for their listings" on public.listing_images;
drop policy if exists "Students can create their own favorites" on public.favorites;
drop policy if exists "Visit participants can read requests" on public.visit_requests;
drop policy if exists "Students can create visit requests" on public.visit_requests;
drop policy if exists "Visit participants can update requests" on public.visit_requests;
drop policy if exists "Conversation participants can read conversations" on public.conversations;
drop policy if exists "Conversation participants can update conversations" on public.conversations;

-- 4. Recrear políticas limpias, directas y sin ciclos de recursión

-- PROFILES: anon solo puede ver perfiles de propietarios (sin subconsultas cruzadas a listings)
create policy "Public can read owner profiles"
on public.profiles
for select
to anon
using (role = 'owner');

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

