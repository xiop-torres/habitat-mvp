-- ==============================================================================
-- Configuración de Supabase Storage para Imágenes de Alojamientos
-- Corrección Tarea 5A - MVP Habitat
-- ==============================================================================

-- 1. Crear el bucket 'listing-images' (Público) si no existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images', 
  'listing-images', 
  true, 
  5242880, -- 5 MB límite global
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- NOTA: Supabase Storage ya tiene RLS habilitado nativamente. 
-- NO se debe ejecutar "alter table storage.objects enable row level security;" 
-- porque causará el error "must be owner of table objects".

-- Limpieza de políticas previas (para hacer el script idempotente)
-- (La ejecución de DROP POLICY IF EXISTS sí está permitida sobre storage.objects en SQL Editor)
drop policy if exists "Imágenes de alojamientos son públicas" on storage.objects;
drop policy if exists "Propietarios pueden subir imágenes a sus alojamientos" on storage.objects;
drop policy if exists "Propietarios pueden actualizar sus imágenes" on storage.objects;
drop policy if exists "Propietarios pueden eliminar sus imágenes" on storage.objects;

-- 2. Crear Políticas de Storage



-- INSERCIÓN (Solo el owner autenticado)
-- Regla: El primer segmento de la ruta debe ser el UID del owner.
-- Regla extra: El segundo segmento (listing_id) debe pertenecer a ese owner en public.listings.
create policy "Propietarios pueden subir imágenes a sus alojamientos"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'listing-images' 
  and (string_to_array(name, '/'))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings
    where id::text = (string_to_array(name, '/'))[2]
      and owner_id = auth.uid()
  )
);

-- ACTUALIZACIÓN (Solo el owner autenticado)
create policy "Propietarios pueden actualizar sus imágenes"
on storage.objects for update
to authenticated
using (
  bucket_id = 'listing-images' 
  and (string_to_array(name, '/'))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings
    where id::text = (string_to_array(name, '/'))[2]
      and owner_id = auth.uid()
  )
)
with check (
  bucket_id = 'listing-images' 
  and (string_to_array(name, '/'))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings
    where id::text = (string_to_array(name, '/'))[2]
      and owner_id = auth.uid()
  )
);

-- ELIMINACIÓN (Solo el owner autenticado)
create policy "Propietarios pueden eliminar sus imágenes"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'listing-images' 
  and (string_to_array(name, '/'))[1] = auth.uid()::text
  and exists (
    select 1 from public.listings
    where id::text = (string_to_array(name, '/'))[2]
      and owner_id = auth.uid()
  )
);
