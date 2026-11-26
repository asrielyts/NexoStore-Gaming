package cl.nexostore.api.config;

import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@SecurityScheme(name = "cookie-jwt", type = SecuritySchemeType.APIKEY, in = SecuritySchemeIn.COOKIE, paramName = "NEXOSTORE_TOKEN", description = "Cookie JWT HttpOnly emitida por /api/auth/login")
public class OpenApiConfig {
    @Bean
    OpenAPI api() {
        return new OpenAPI().info(new Info().title("NexoStore Gaming API").version("2.0.0").description("API REST backend-céntrica para catálogo, inventario, órdenes, usuarios y autenticación JWT mediante cookie HttpOnly."));
    }
}
