package cl.nexostore.api.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.*;

@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http, JwtFilter jwt) throws Exception {
        return http.csrf(c -> c.disable()).cors(Customizer.withDefaults()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).authorizeHttpRequests(a -> a
                .requestMatchers("/api/auth/**", "/api/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/h2-console/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/catalog", "/api/catalog/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/orders", "/api/messages").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/orders/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**").permitAll()
                .requestMatchers("/api/admin/**", "/api/state").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**", "/api/categories/**").hasRole("ADMIN")
                .anyRequest().authenticated()).headers(h -> h.frameOptions(f -> f.sameOrigin())).addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class).build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origin}") String origin) {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of(origin, "http://127.0.0.1:5173"));
        c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        c.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource();
        s.registerCorsConfiguration("/**", c);
        return s;
    }
}
