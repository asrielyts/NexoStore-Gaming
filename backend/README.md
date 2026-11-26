# NexoStore API — Spring Boot / Maven

Requisitos: JDK 17 y Maven 3.9+.

Desde esta carpeta:

```bash
mvn spring-boot:run
```

En IntelliJ IDEA: abre `backend/pom.xml` como proyecto Maven; configura Project SDK, Maven importer y runner en JDK 17;
ejecuta `spring-boot:run` desde la ventana Maven.

- Health: `http://localhost:8080/api/health`
- Catálogo público: `http://localhost:8080/api/catalog`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- H2 Console: `http://localhost:8080/h2-console` (requiere cookie de ADMIN)
- JDBC: `jdbc:h2:file:./data/nexostore`, usuario `sa`, contraseña vacía solo en desarrollo local.

Cuentas demo locales: admin@nexostore.cl / Admin123! y cliente@nexostore.cl / Cliente123!. No publicar estas
credenciales.

El frontend no carga ni sube snapshots completos. `StoreDataService` valida las operaciones y persiste en H2. JWT se
entrega mediante cookie HttpOnly. Configura `JWT_SECRET`, `COOKIE_SECURE` y `FRONTEND_ORIGIN` al desplegar.
