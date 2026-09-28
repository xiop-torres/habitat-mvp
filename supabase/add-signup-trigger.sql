-- ==============================================================================
-- Habitat MVP - Trigger Automático para Creación de Perfiles (auth.users -> profiles)
-- Costo objetivo: S/ 0 (Supabase Free Tier)
--
-- Ejecutar en Supabase SQL Editor para que cada registro vía Supabase Auth
-- cree automáticamente su registro correspondiente en public.profiles de forma
-- atómica y segura, aun si la confirmación de correo está activada.
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  assigned_role public.user_role;
  raw_role text;
begin
  -- Sanitización estricta de roles:
  -- Únicamente se permite 'owner' o 'student'.
  -- Cualquier intento de inyectar 'admin' u otro rol se neutraliza asignando 'student'.
  raw_role := new.raw_user_meta_data->>'role';
  if raw_role = 'owner' then
    assigned_role := 'owner';
  else
    assigned_role := 'student';
  end if;

  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    phone,
    university
  ) values (
    new.id,
    lower(new.email),
    coalesce(nullif(trim(new.raw_user_meta_data->>'first_name'), ''), 'Usuario'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'last_name'), ''), 'Habitat'),
    assigned_role,
    nullif(trim(new.raw_user_meta_data->>'phone'), ''),
    nullif(trim(new.raw_user_meta_data->>'university'), '')
  )
  on conflict (id) do update set
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone = coalesce(excluded.phone, profiles.phone),
    university = coalesce(excluded.university, profiles.university),
    updated_at = now();

  return new;
end;
$$;

-- Crear el trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Backfill idempotente en caso de que existan usuarios en auth.users sin perfil
insert into public.profiles (
  id,
  email,
  first_name,
  last_name,
  role,
  phone,
  university
)
select
  u.id,
  lower(u.email),
  coalesce(nullif(trim(u.raw_user_meta_data->>'first_name'), ''), 'Usuario'),
  coalesce(nullif(trim(u.raw_user_meta_data->>'last_name'), ''), 'Habitat'),
  case when u.raw_user_meta_data->>'role' = 'owner' then 'owner'::public.user_role else 'student'::public.user_role end,
  nullif(trim(u.raw_user_meta_data->>'phone'), ''),
  nullif(trim(u.raw_user_meta_data->>'university'), '')
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

