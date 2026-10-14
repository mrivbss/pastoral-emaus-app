-- Ajusta instalaciones donde la tabla ingresos ya fue creada con el código #09.

alter table public.ingresos
  drop constraint if exists ingresos_codigo_tipo_check;

alter table public.ingresos
  add constraint ingresos_codigo_tipo_check check (
    (tipo = 'Ingreso' and codigo_concepto between 1 and 8)
    or (tipo = 'Egreso' and codigo_concepto between 10 and 24)
  );

comment on table public.ingresos
is 'Movimientos financieros de Emaús, basados en el catálogo oficial de ingresos 1 al 8 y egresos 10 al 24.';
