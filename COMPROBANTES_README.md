# Sistema de Comprobantes de Pago

## Funcionalidades Implementadas

### 1. **Modelo de Base de Datos**
- Nuevo modelo `Comprobante` relacionado con `Order`
- Campos: `id`, `orderId`, `archivoUrl`, `status`, `creadoEn`, `actualizadoEn`, `expiraEn`
- Estados: `pendiente_subida`, `pendiente_revision`, `pago_recibido`, `cancelado`

### 2. **APIs Creadas**

#### `/api/comprobantes/upload` (POST)
- Permite subir archivos de imagen (JPG, PNG, GIF)
- Máximo 10MB por archivo
- Validación de tipos de archivo
- Crea o actualiza el comprobante asociado al pedido

#### `/api/pedidos` (GET/PATCH)
- GET: Lista todos los pedidos con comprobantes (para admin)
- PATCH: Actualiza el estado de un comprobante (para admin)

#### `/api/mis-pedidos?email=...` (GET)
- Obtiene los pedidos de un usuario específico por email
- Incluye información de comprobantes e items

#### `/api/comprobantes/cancel-expired` (POST)
- Cancela automáticamente comprobantes expirados
- Para usar con cron jobs

### 3. **Páginas de Usuario**

#### `/cuenta/profile`
- Muestra los pedidos del usuario
- Permite subir comprobantes de pago
- Indica el estado de cada comprobante
- Muestra fecha de expiración (48h después del pedido)

### 4. **Panel de Administración**

#### `/admin/pedidos`
- Lista todos los pedidos con filtros por estado
- Permite ver comprobantes subidos
- Botones para cambiar estado: En revisión, Pago confirmado, Cancelado
- Información completa de cada pedido y cliente

### 5. **Automatización**
- Al crear un pedido, se crea automáticamente un comprobante con estado "pendiente_subida"
- Expiración automática después de 48 horas
- Endpoint para cancelación automática via cron

## Flujo de Trabajo

1. **Cliente hace un pedido** → Se crea comprobante con estado "pendiente_subida"
2. **Cliente sube comprobante** → Estado cambia a "pendiente_revision"
3. **Admin revisa** → Puede cambiar a "pago_recibido" o "cancelado"
4. **Si no se sube en 48h** → Se puede auto-cancelar via cron job

## Estados del Comprobante

- 🟡 **pendiente_subida**: Cliente debe subir el comprobante
- 🔵 **pendiente_revision**: Comprobante subido, esperando revisión del admin
- 🟢 **pago_recibido**: Pago confirmado por el admin
- 🔴 **cancelado**: Comprobante rechazado o expirado

## Configuración Cron (Opcional)

Para cancelar automáticamente comprobantes expirados, configurar un cron job:

```bash
# Ejecutar cada hora
0 * * * * curl -X POST http://localhost:3000/api/comprobantes/cancel-expired
```

## Archivos Modificados/Creados

### Base de Datos
- `prisma/schema.prisma` - Añadido modelo Comprobante
- Nueva migración creada

### APIs
- `pages/api/comprobantes/upload.ts`
- `pages/api/comprobantes/cancel-expired.ts`
- `pages/api/pedidos/index.ts`
- `pages/api/mis-pedidos.ts`
- `pages/api/orders.ts` (modificado para crear comprobante)

### Frontend
- `pages/cuenta/profile.tsx` (actualizado)
- `pages/admin/pedidos.tsx` (nuevo)
- `pages/admin.tsx` (añadido botón)
- `pages/index.tsx` (añadido subrayado al banner)

### Directorio
- `public/comprobantes/` (para almacenar archivos subidos)

## Seguridad

- Validación de tipos de archivo (solo imágenes)
- Límite de tamaño (10MB)
- Verificación de permisos de admin
- Nombres de archivo únicos para evitar conflictos
