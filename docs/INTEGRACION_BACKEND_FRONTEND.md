# Integración React — Spring Boot

## Endpoints principales

| Método                | Ruta                     | Acceso                 | Propósito                                               |
|-----------------------|--------------------------|------------------------|---------------------------------------------------------|
| GET                   | `/api/catalog`           | Público                | Productos, categorías y publicaciones únicamente        |
| POST                  | `/api/auth/login`        | Público                | Autenticar y emitir cookie JWT HttpOnly                 |
| POST                  | `/api/auth/register`     | Público                | Crear cuenta CLIENT y emitir cookie                     |
| GET                   | `/api/auth/me`           | Cookie JWT             | Recuperar sesión al recargar                            |
| POST                  | `/api/auth/logout`       | Público                | Invalidar cookie en navegador                           |
| GET                   | `/api/state`             | ADMIN                  | Estado administrativo sin contraseñas                   |
| POST/PUT/DELETE       | `/api/products/**`       | ADMIN                  | CRUD productos                                          |
| POST/PUT/DELETE       | `/api/categories/**`     | ADMIN                  | CRUD categorías                                         |
| POST                  | `/api/orders`            | Público/usuario        | Checkout simulado validado por servidor                 |
| GET                   | `/api/orders/{id}`       | Propietario o invitado | Resultado seguro de orden; no devuelve datos de cliente |
| POST                  | `/api/messages`          | Público                | Guardar mensaje en H2                                   |
| GET/POST/PATCH/DELETE | `/api/admin/users/**`    | ADMIN                  | Administración de cuentas                               |
| PATCH                 | `/api/admin/orders/{id}` | ADMIN                  | Cambiar estado de orden                                 |
| POST                  | `/api/admin/reset`       | ADMIN                  | Restaurar catálogo demo y limpiar órdenes/mensajes      |

## Sesión

La respuesta de login no entrega el JWT en JSON. El servidor lo coloca en `NEXOSTORE_TOKEN` con `HttpOnly`; fetch usa
`credentials: include`. React solo conserva el perfil de sesión en memoria. Al recargar, consulta `/api/auth/me`; el
navegador envía la cookie automáticamente.

## Datos

- Usuarios: tabla JPA `store_users`.
- Catálogo, publicaciones, inventario, órdenes y mensajes: snapshot persistido en la tabla `store_snapshot` de H2.
- El cliente nunca sube un snapshot completo ni sobrescribe el estado del servidor.
