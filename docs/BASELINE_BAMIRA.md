# BAMIRA — Baseline inicial

Baseline de trabajo derivado del proyecto **AimExchange**, sin modificar la
funcionalidad existente.

- **Origen técnico**: AimExchange — https://github.com/Dyz0r/AimExchange.git
- **Commit original importado**: `8667998` ("vaqueriendo32")
- **Fecha de creación del baseline BAMIRA**: 2026-09-29
- **Historial**: preservado íntegramente. El commit `8667998` no fue reescrito.

---

## Stack principal

| Componente | Tecnología |
|---|---|
| Framework | Next.js 13.5 (Pages Router) |
| Lenguaje | TypeScript (`strict: false`) |
| UI / estilos | Tailwind CSS 3.4, CSS Modules, MUI 7 |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL |
| Autenticación | NextAuth 4 (Credentials + JWT) y sesión propia por cookie (ver deuda técnica) |
| Hash de contraseñas | bcrypt 5.1.1 (binding nativo) |
| Pagos | MercadoPago SDK v2 (Bricks) + métodos offline |
| Estado de carrito | Zustand + localStorage |
| Subida de archivos | formidable → filesystem local |

---

## Entorno local de desarrollo

| Recurso | Valor |
|---|---|
| Contenedor | `bamira_db` (imagen `postgres:16-alpine`) |
| Puerto host | `5437` → puerto contenedor `5432` |
| Base de datos | `bamira_dev` |
| Volumen persistente | `bamira_pgdata` |
| Aplicación | `npm run dev` → http://localhost:3000 |

La base de datos y `node_modules` **no forman parte del repositorio**. Ambos son
entorno local reproducible a partir de `.env.example`, las migraciones de Prisma
y `scripts/seedAll.js`.

### Puesta en marcha

```bash
npm ci                     # o npm install
cp .env.example .env.local # completar credenciales
npx prisma generate
npx prisma migrate deploy  # aplica las 3 migraciones existentes
node scripts/seedAll.js    # datos demo
npm run dev
```

---

## Estado funcional comprobado

Verificado por smoke test sobre el baseline, sin modificar código:

- [x] Catálogo
- [x] Búsqueda
- [x] Detalle de producto
- [x] Registro
- [x] Login
- [x] Perfil
- [x] Creación de pedido
- [x] Checkout hasta antes del pago

**Admin: no probado por falta de credenciales demo conocidas.** El seed incluye el
usuario `registertry999@gmail.com` con rol `admin`, pero únicamente con su hash
bcrypt; no existe contraseña en claro documentada en el repositorio.

No se realizaron pagos reales ni envíos de email durante el smoke test.

---

## Contenido de la base de datos de smoke test

La base `bamira_dev` contiene, además de los datos del seed, lo siguiente generado
por el smoke test:

- **1 usuario de prueba** — `bamira.smoketest@local.test` (rol `user`)
- **1 pedido de prueba** — id 1, método "Transferencia Bancaria"
- **2 order items** — correspondientes a ese pedido
- **1 comprobante de prueba** — asociado al pedido, estado `pendiente_subida`

---

## Deuda técnica detectada

Registrada **sin corregir**. Ninguno de estos puntos fue modificado en el baseline.

1. **El seed deja las secuencias PostgreSQL desfasadas.** `data/*.json` incluyen
   `id` explícitos y `scripts/seedAll.js` usa `createMany`, que no avanza las
   secuencias. Toda insercion posterior falla con `Unique constraint failed on (id)`.
   Requiere `setval` manual o cambiar la estrategia de seed.

2. **Coexisten dos sistemas de autenticación incompatibles.** `/api/auth/login`
   emite una cookie propia (`session`), mientras que `/api/auth/me` y
   `pages/api/auth/[...nextauth].ts` usan la sesión JWT de NextAuth
   (`next-auth.session-token`). Un login por una vía no satisface la otra, y
   `/api/orders` (GET) tampoco reconoce la sesión de NextAuth.

3. **Controles de acceso inconsistentes en endpoints admin.**
   `pages/api/admin/product/[id].ts` tiene la comprobación de sesión comentada
   como `TODO`. En la practica la peticion queda filtrada por el middleware, pero la
   defensa es de profundidad única.

4. **El middleware de API puede devolver HTML en lugar de JSON.** Las rutas bajo
   `/api/admin/*` sin sesión válida responden la página de inicio de sesión de
   NextAuth (`200 text/html`) en vez de `401` con cuerpo JSON, rompiendo el
   contrato de API para consumidores externos.

5. **Las subidas se escriben en el filesystem local** (`public/uploads`,
   `public/comprobantes`). No es funcional en despliegues serverless o
   contenedores efímeros; requiere migrar a almacenamiento de objetos.

6. **El stock se modela solamente por producto.** No hay inventario por variante.

7. **No existen variantes de talle, color ni SKU.** El color solo existe como
   clave de galería en el campo JSON `imagesByColor`, sin precio ni stock propio.

8. **Una `DATABASE_URL` global de Windows puede interferir con el proyecto.** Las
   variables de entorno de usuario tienen prioridad sobre el archivo `.env`, y
   una URL con formato no compatible rompe Prisma con `P1012`.

9. **`bcrypt` requirió un binding nativo local en este entorno.** `npm install` no
   obtuvo el prebuild ni tenía toolchain C++ para compilarlo. En esta máquina se
   instaló el binario oficial precompilado
   (`bcrypt_lib-v5.1.1-napi-v3-win32-x64`) dentro de `node_modules`, que no está
   versionado. En otros entornos puede hacer falta `npm rebuild bcrypt` con las
   Visual Studio Build Tools.

---

## Alcance del baseline

Este baseline documenta el proyecto **tal como fue recibido**. No incluye aún
adaptaciones a ropa deportiva. El modelo de datos carece de las entidades
necesarias para ese dominio (variantes, talles, tabla de medidas, inventario por
variante), que serán analizadas en una etapa posterior.
