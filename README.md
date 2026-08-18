# Pastoral Emaús Varones PSAH

Aplicación web responsive para administrar integrantes, cuotas mensuales y donaciones de la Pastoral Emaús Varones PSAH. La V2 reemplaza la persistencia local de `v1.html` por React, TypeScript y PostgreSQL/Supabase compartido entre administradores.

La versión original se conserva sin modificar en `legacy/v1.html`; su logo Base64 fue extraído a `src/assets/logo.png`.

## Requisitos e instalación

- Node.js 20.19 o superior (o 22.12+)
- npm
- Un proyecto de Supabase

```bash
npm install
cp .env.example .env
npm run dev
```

En Windows PowerShell, usa `Copy-Item .env.example .env` en lugar de `cp`.

Configura `.env`:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_PUBLISHABLE_O_ANON_KEY
VITE_PUBLIC_APP_URL=http://localhost:5173
```

`VITE_PUBLIC_APP_URL` es opcional: si no existe, la aplicación usa `window.location.origin` al compartir por WhatsApp. Nunca uses `service_role` en el frontend.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Aplica `supabase/migrations/202608180001_initial_schema.sql` desde **SQL Editor**, o enlaza Supabase CLI y ejecuta:

   ```bash
   supabase link --project-ref TU_PROJECT_REF
   supabase db push
   ```

3. En **Authentication → Users**, crea manualmente el primer usuario con correo y contraseña. No hay alta pública de administradores.
4. Autoriza esa cuenta en **SQL Editor**, reemplazando el correo:

   ```sql
   insert into public.administradores (user_id, nombre)
   select id, 'Tesorero'
   from auth.users
   where email = 'tesorero@ejemplo.cl';
   ```

5. En **Authentication → URL Configuration**, configura como Site URL el dominio de producción y agrega `http://localhost:5173` entre las redirect URLs para desarrollo.
6. Copia la URL del proyecto y su publishable/anon key a `.env`.

Solo los usuarios presentes y activos en `public.administradores` se consideran administradores. Para autorizar otro encargado, crea primero su cuenta Auth y agrega su UUID a esa tabla. Para revocar acceso sin borrar la cuenta, cambia `activo` a `false` desde SQL Editor.

## Seguridad y RLS

RLS está habilitado en `integrantes`, `pagos`, `donaciones` y `administradores`. Las operaciones de datos exigen una sesión Auth cuyo UUID esté activo en la lista administrativa; una cuenta Auth no autorizada no obtiene acceso aunque el alta de usuarios se habilite por error.

El formulario `/registro` no recibe `SELECT` ni `INSERT` directo. Invoca únicamente `registrar_integrante_publico(...)`, una función `security definer` que:

- valida nombre, RUT chileno, teléfono, correo y dirección;
- fija el estado en `Activo`;
- limita tamaños de texto;
- impide duplicados mediante un RUT normalizado único, con respuesta idempotente que no revela públicamente si ese RUT ya existía;
- devuelve únicamente el UUID creado, sin exponer filas.

Para una publicación con tráfico desconocido o ataques automatizados, el siguiente endurecimiento recomendado es poner CAPTCHA/rate limiting delante de esa RPC mediante una Supabase Edge Function. No es necesario para operar la aplicación y no se incluyó un proveedor externo.

## Rutas

- `/`: información pública, cuota y transferencia.
- `/registro`: inscripción pública de integrantes.
- `/admin/login`: acceso con Supabase Auth.
- `/admin`: dashboard, integrantes, pagos, donaciones y exportaciones.
- `/admin/integrantes/:id`: perfil e historial anual de cuotas.

## Funcionalidades

- Dashboard filtrado por mes/año con activos, pagados, pendientes, cuotas y donaciones.
- CRUD de integrantes con búsqueda y filtros.
- Historial mensual, registro, edición y anulación de pagos; máximo un pago por integrante/mes/año.
- CRUD y total mensual de donaciones.
- Recordatorios y enlace público por `wa.me`, con normalización de teléfonos chilenos y confirmación manual del envío.
- Exportación CSV anual y respaldo JSON administrativo.
- Estados de carga, error, vacío, sin conexión y confirmaciones destructivas.
- Interfaz mobile-first desde 320 px y routing SPA compatible con Vercel.

La importación del JSON antiguo aún no se ejecuta. El contrato y el mapeo futuro están preparados en `src/types/legacy.ts` y `docs/legacy-import.md`.

## Verificación y build

```bash
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Desplegar en Vercel

1. Importa el repositorio en Vercel (framework preset: **Vite**).
2. Configura estas variables para Production y Preview:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_PUBLIC_APP_URL` con el dominio de producción (opcional, recomendado).
3. Despliega. `vercel.json` reescribe las rutas hacia `index.html`, por lo que `/registro` y `/admin` funcionan al recargar directamente.
4. Agrega el dominio definitivo en las URL permitidas de Supabase Auth.

Los datos permanecen en el mismo proyecto Supabase, por lo que una futura app Capacitor/Android podrá usar el mismo backend y las mismas políticas.
