# Correcciones de arquitectura y seguridad

- Eliminado el sincronizador que enviaba el snapshot completo desde React al backend.
- Eliminados `localStorage`/`sessionStorage` de la lógica runtime de la tienda.
- Eliminado el servidor Node de demostración y las páginas HTML legacy que duplicaban la persistencia local.
- Catálogo público separado del estado administrativo; el catálogo no entrega usuarios, órdenes ni mensajes.
- Estado administrativo protegido por rol ADMIN y devuelve usuarios sin password/hash.
- Login/registro emiten cookie JWT HttpOnly; React no recibe ni guarda el token.
- Backend valida checkout, usa precio almacenado, agrega líneas duplicadas por producto, calcula total y controla stock.
- Pago simulado rechazado no descuenta stock; aprobado descuenta stock en el servidor.
- Usuarios administrados en JPA/H2 con BCrypt, roles, estado activo y protección contra eliminación/democión del último
  administrador.
- Órdenes, inventario, catálogo y mensajes persistidos en H2; se agregó gestión administrativa de mensajes.
- Reinicio de demo restaurado como operación backend ADMIN.
- Añadidos tests de servicio Spring Boot y smoke test de API.
- Actualizados README, guías, matriz de pauta e informe técnico.

## Validación del paquete generado

- Sintaxis JS/JSX revisada con parser TypeScript: PASS.
- Sintaxis Java revisada por `javac`: no se detectaron errores de parseo.
- `npm run build`, `npm test`, `mvn test` y `mvn package` no pudieron ejecutarse en el entorno de empaquetado: npm
  registry inaccesible y Maven no instalado. Deben ejecutarse localmente con las dependencias disponibles antes de la
  entrega final.
