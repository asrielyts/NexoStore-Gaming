# NexoStore Gaming — Full Stack

Tienda demostrativa académica. React es solo la capa de presentación; la API Spring Boot es la única autoridad para autenticación, catálogo, inventario, usuarios, órdenes y mensajes. Los datos persistentes se guardan en H2.

## Arquitectura

- `src/`: frontend React + Vite. Mantiene únicamente estado de interfaz en memoria (carrito y formularios temporales). No usa `localStorage` ni `sessionStorage` para datos de negocio ni tokens.
- `backend/`: API REST Spring Boot 3, Java 17, Maven, Spring Security, JWT y Spring Data JPA.
- `backend/data/nexostore.mv.db`: base H2 local creada al ejecutar la API.
- `backend/src/main/resources/store-seed.json`: catálogo y publicaciones iniciales, cargados por el backend una sola vez.
- `docs/`: guía de arquitectura, integración, pauta y pruebas.

## Requisitos

- JDK 17
- Maven 3.9+
- Node.js 20+ y npm

## Ejecutar en Windows

1. Abre `backend/pom.xml` como proyecto Maven en IntelliJ IDEA y selecciona JDK 17 para Project SDK, Maven importer y runner.
2. Ejecuta `mvn spring-boot:run` desde la carpeta `backend` (o desde la ventana Maven de IntelliJ).
3. En una terminal de la raíz ejecuta `npm ci` y luego `npm run dev`.
4. Abre `http://localhost:5173`.

También puedes usar `INICIAR_NEXOSTORE.bat` si Maven y Node están disponibles en PATH.

## URLs

- React: `http://localhost:5173`
- API health: `http://localhost:8080/api/health`
- Catálogo público: `http://localhost:8080/api/catalog`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- H2 Console: `http://localhost:8080/h2-console` (requiere sesión de administrador)
- JDBC: `jdbc:h2:file:./data/nexostore`, usuario `sa`, contraseña vacía para desarrollo local

## Cuentas demo locales

- Administrador: `admin@nexostore.cl` / `Admin123!`
- Cliente: `cliente@nexostore.cl` / `Cliente123!`

Estas credenciales son únicamente para la evaluación local. Cambia las contraseñas y la configuración de cuentas demo antes de publicar el sistema.

## Seguridad y flujo de datos

- Login y registro se procesan en Spring Boot; la contraseña se almacena con BCrypt.
- JWT se entrega en cookie `NEXOSTORE_TOKEN` `HttpOnly`, `SameSite=Lax`; React no puede leer ni guardar el token.
- `GET /api/catalog` devuelve solo productos, categorías y publicaciones.
- `GET /api/state` y `/api/admin/**` requieren rol ADMIN y devuelven usuarios sin hashes ni contraseñas.
- El backend calcula precios y totales de órdenes, valida stock y lo descuenta únicamente cuando la compra simulada se aprueba.
- Los mensajes, órdenes, usuarios, catálogo e inventario se guardan en H2. El carrito es temporal en memoria y se valida nuevamente en el servidor al comprar.
- Los pagos son simulados; no se procesan tarjetas ni transacciones reales.

## Variables de entorno

Configura en el entorno del backend:

- `JWT_SECRET`: clave aleatoria de al menos 32 bytes; la clave predeterminada es solo para desarrollo.
- `COOKIE_SECURE=true` cuando se despliegue con HTTPS.
- `FRONTEND_ORIGIN`: origen exacto del frontend publicado.

## Pruebas

- Frontend: `npm test` (requiere Chrome disponible para Karma).
- Build: `npm run build`.
- Smoke test de API: inicia Spring Boot y ejecuta `npm run test:backend`.

El smoke test valida health, separación de catálogo público, protección del estado, cookie JWT, CRUD administrativo y validación del checkout en el backend.
