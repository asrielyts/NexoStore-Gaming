# Matriz de cumplimiento — DSY1104 Evaluación Parcial 3

| Indicador                               | Evidencia en el proyecto                                              | Estado a validar en ejecución                                         |
|-----------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|
| IE3.1.1 Backend, BD y lógica de negocio | Spring Boot, JPA/H2, `StoreUser`, `StoreSnapshot`, `StoreDataService` | Revisar tablas H2 y datos persistidos                                 |
| IE3.2.1 CRUD REST + Swagger             | CRUD productos/categorías y usuarios; OpenAPI                         | Probar operaciones desde Swagger con cookie ADMIN                     |
| IE3.2.2 Integración frontend-backend    | cliente HTTP central y API en React                                   | DevTools Network debe mostrar solicitudes a Spring Boot               |
| IE3.3.1 JWT y roles                     | JWT firmado, BCrypt, filtro de cookie y reglas SecurityConfig         | Probar CLIENT contra `/api/state` y `/api/admin/**` (debe denegar)    |
| IE3.3.2 Gestión de sesión               | Cookie JWT HttpOnly y `/api/auth/me`                                  | Recargar y confirmar sesión; cerrar sesión y confirmar cookie borrada |
| IE3.3.3 Restricciones frontend          | panel admin condicionado por rol; protección también en backend       | Cliente no puede abrir panel ni invocar mutaciones admin              |
| IE3.1.2 Presentación backend/BD         | modelos y flujo de datos documentados                                 | Mostrar persistencia y explicar validaciones                          |
| IE3.2.3 Presentación REST/Swagger       | endpoints documentados                                                | Demostrar CRUD y respuestas HTTP                                      |
| IE3.2.4 Presentación integración        | fetch API con cookie                                                  | Mostrar checkout y refresh desde API                                  |
| IE3.3.4 Presentación JWT/roles          | login, cookie y permisos                                              | Demostrar acceso permitido/denegado                                   |
| IE3.3.5 Presentación sesión             | `/me` y cookie persistente                                            | Recargar sin volver a iniciar sesión                                  |
| IE3.3.6 Presentación restricciones      | rutas protegidas y reglas server-side                                 | Probar con cuenta CLIENT                                              |

La evaluación final requiere ejecutar el proyecto y comprobar cada evidencia; esta matriz describe la implementación del
código, no reemplaza una prueba en el equipo de entrega.
