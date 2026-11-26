# Guía técnica rápida — NexoStore

## Principio de arquitectura

React solo presenta datos y mantiene estado efímero de la interfaz. Ningún dato de negocio se guarda en `localStorage` o
`sessionStorage`. La API Spring Boot valida y persiste cada operación en H2.

## Módulos

- `src/context/StoreContext.jsx`: carga catálogo desde API, obtiene sesión mediante `/api/auth/me`, mantiene carrito
  temporal y refresca datos.
- `src/data/database.js`: cliente HTTP central; todas las operaciones CRUD usan endpoints REST.
- `src/services/authApi.js`: login, registro, sesión actual y logout.
- `backend/.../state/StoreDataService.java`: única capa de acceso al snapshot de catálogo, stock, órdenes y mensajes;
  valida checkout en servidor.
- `backend/.../user/`: entidad JPA y repositorio de cuentas.
- `backend/.../security/`: filtro JWT, validación de cookie y reglas por rol.
- `backend/.../admin/AdminController.java`: CRUD administrativo de usuarios y cambio de estado de órdenes.

## Flujo de compra

1. React envía `productId` y `quantity`, no precios ni totales.
2. Spring Boot lee el precio vigente desde el catálogo H2.
3. Spring valida los datos del cliente y el stock de cada producto.
4. El servidor calcula subtotales y total.
5. Si el pago de demostración es aprobado, el servidor descuenta stock; si es rechazado, no lo modifica.
6. Orden e inventario se guardan en H2.

## Seguridad

- BCrypt para contraseñas.
- JWT en cookie `HttpOnly`, `SameSite=Lax`; React no puede leerla.
- `/api/catalog` solo entrega catálogo público.
- `/api/state` y `/api/admin/**` requieren ADMIN.
- Registro público siempre crea rol CLIENT.
- H2 Console requiere ADMIN.
- Cambiar `JWT_SECRET`, `COOKIE_SECURE=true` y `FRONTEND_ORIGIN` antes de publicar.

## Ejecutar

Backend: `cd backend` y `mvn spring-boot:run`.
Frontend: raíz del proyecto, `npm ci` y `npm run dev`.
Smoke test: con API activa, `npm run test:backend`.
