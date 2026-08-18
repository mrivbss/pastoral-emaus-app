-- Pastoral Emaús Varones PSAH
-- Esquema inicial, permisos mínimos y RLS.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.rut_chileno_valido(value text)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  clean text := regexp_replace(upper(coalesce(value, '')), '[^0-9K]', '', 'g');
  body text;
  verifier text;
  total integer := 0;
  multiplier integer := 2;
  result integer;
  expected text;
  position integer;
begin
  if clean !~ '^\d{7,8}[0-9K]$' then
    return false;
  end if;

  body := left(clean, length(clean) - 1);
  verifier := right(clean, 1);
  position := length(body);

  while position > 0 loop
    total := total + substring(body from position for 1)::integer * multiplier;
    multiplier := case when multiplier = 7 then 2 else multiplier + 1 end;
    position := position - 1;
  end loop;

  result := 11 - (total % 11);
  expected := case when result = 11 then '0' when result = 10 then 'K' else result::text end;
  return verifier = expected;
end;
$$;

create table public.integrantes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rut text not null,
  rut_normalizado text generated always as (
    regexp_replace(upper(rut), '[^0-9K]', '', 'g')
  ) stored,
  telefono text,
  email text,
  fecha_ingreso date,
  estado text not null default 'Activo',
  direccion text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint integrantes_nombre_length check (char_length(trim(nombre)) between 3 and 160),
  constraint integrantes_rut_valido check (public.rut_chileno_valido(rut)),
  constraint integrantes_rut_unique unique (rut_normalizado),
  constraint integrantes_estado_check check (estado in ('Activo', 'Inactivo', 'Suspendido')),
  constraint integrantes_telefono_length check (telefono is null or char_length(telefono) <= 30),
  constraint integrantes_email_check check (
    email is null or (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  ),
  constraint integrantes_direccion_length check (direccion is null or char_length(direccion) <= 300),
  constraint integrantes_observaciones_length check (observaciones is null or char_length(observaciones) <= 2000)
);

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  integrante_id uuid not null references public.integrantes(id) on delete cascade,
  anio smallint not null,
  mes smallint not null,
  monto integer not null default 3000,
  fecha_pago date not null default current_date,
  registrado_por uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pagos_periodo_check check (anio between 2020 and 2100 and mes between 1 and 12),
  constraint pagos_monto_check check (monto > 0),
  constraint pagos_integrante_periodo_unique unique (integrante_id, anio, mes)
);

create table public.donaciones (
  id uuid primary key default gen_random_uuid(),
  nombre_donante text not null default 'Donante anónimo',
  telefono text,
  email text,
  monto integer not null,
  fecha date not null default current_date,
  medio text not null default 'Transferencia bancaria',
  observacion text,
  registrado_por uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint donaciones_nombre_length check (char_length(trim(nombre_donante)) between 2 and 160),
  constraint donaciones_monto_check check (monto > 0),
  constraint donaciones_medio_check check (medio in ('Transferencia bancaria', 'Efectivo', 'Mercado Pago', 'Otro')),
  constraint donaciones_telefono_length check (telefono is null or char_length(telefono) <= 30),
  constraint donaciones_email_check check (
    email is null or (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
  ),
  constraint donaciones_observacion_length check (observacion is null or char_length(observacion) <= 2000)
);

create table public.administradores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  constraint administradores_nombre_length check (nombre is null or char_length(nombre) <= 160)
);

-- Los índices de FK y filtros reflejan las consultas del frontend.
create index pagos_anio_mes_idx on public.pagos (anio, mes);
create index pagos_registrado_por_idx on public.pagos (registrado_por) where registrado_por is not null;
create index donaciones_fecha_idx on public.donaciones (fecha desc);
create index donaciones_registrado_por_idx on public.donaciones (registrado_por) where registrado_por is not null;
create index integrantes_estado_nombre_idx on public.integrantes (estado, nombre);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.administradores
    where user_id = (select auth.uid())
      and activo = true
  );
$$;

create trigger integrantes_set_updated_at
before update on public.integrantes
for each row execute function public.set_updated_at();

create trigger pagos_set_updated_at
before update on public.pagos
for each row execute function public.set_updated_at();

create trigger donaciones_set_updated_at
before update on public.donaciones
for each row execute function public.set_updated_at();

-- El registro público pasa exclusivamente por esta función. No se concede INSERT
-- anónimo directo ni SELECT público sobre integrantes.
create or replace function public.registrar_integrante_publico(
  p_nombre text,
  p_rut text,
  p_telefono text,
  p_email text,
  p_fecha_ingreso date,
  p_direccion text,
  p_observaciones text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_id uuid;
begin
  if char_length(trim(coalesce(p_nombre, ''))) not between 3 and 160 then
    raise exception using errcode = '22023', message = 'El nombre ingresado no es válido.';
  end if;
  if not public.rut_chileno_valido(p_rut) then
    raise exception using errcode = '22023', message = 'El RUT ingresado no es válido.';
  end if;
  if char_length(regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g')) not between 8 and 13 then
    raise exception using errcode = '22023', message = 'El teléfono ingresado no es válido.';
  end if;
  if coalesce(p_email, '') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception using errcode = '22023', message = 'El correo ingresado no es válido.';
  end if;
  if char_length(trim(coalesce(p_direccion, ''))) not between 2 and 300 then
    raise exception using errcode = '22023', message = 'La dirección o comuna es obligatoria.';
  end if;

  insert into public.integrantes (
    nombre, rut, telefono, email, fecha_ingreso, estado, direccion, observaciones
  ) values (
    trim(p_nombre),
    trim(p_rut),
    nullif(trim(p_telefono), ''),
    lower(nullif(trim(p_email), '')),
    p_fecha_ingreso,
    'Activo',
    nullif(trim(p_direccion), ''),
    nullif(left(trim(coalesce(p_observaciones, '')), 2000), '')
  )
  on conflict (rut_normalizado) do nothing
  returning id into new_id;

  -- Respuesta opaca e idempotente: no confirma públicamente si el RUT ya existía.
  return coalesce(new_id, gen_random_uuid());
end;
$$;

alter table public.integrantes enable row level security;
alter table public.pagos enable row level security;
alter table public.donaciones enable row level security;
alter table public.administradores enable row level security;

create policy integrantes_admin_all
on public.integrantes
for all
to authenticated
using ((select public.es_administrador()))
with check ((select public.es_administrador()));

create policy pagos_admin_all
on public.pagos
for all
to authenticated
using ((select public.es_administrador()))
with check ((select public.es_administrador()));

create policy donaciones_admin_all
on public.donaciones
for all
to authenticated
using ((select public.es_administrador()))
with check ((select public.es_administrador()));

revoke all on table public.integrantes, public.pagos, public.donaciones, public.administradores from public, anon, authenticated;
grant select, insert, update, delete on table public.integrantes, public.pagos, public.donaciones to authenticated;

revoke all on function public.rut_chileno_valido(text) from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.es_administrador() from public, anon, authenticated;
revoke all on function public.registrar_integrante_publico(text, text, text, text, date, text, text) from public, anon, authenticated;
grant execute on function public.rut_chileno_valido(text) to authenticated;
grant execute on function public.es_administrador() to authenticated;
grant execute on function public.registrar_integrante_publico(text, text, text, text, date, text, text) to anon, authenticated;

comment on function public.registrar_integrante_publico(text, text, text, text, date, text, text)
is 'Único punto de escritura anónima. Valida campos y RUT; no permite leer integrantes ni elegir estado.';
