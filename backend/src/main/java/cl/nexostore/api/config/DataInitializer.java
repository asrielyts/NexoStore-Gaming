package cl.nexostore.api.config;

import cl.nexostore.api.user.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner seedUsers(StoreUserRepository repo, PasswordEncoder encoder) {
        return args -> {
            if (repo.findByEmailIgnoreCase("admin@nexostore.cl").isEmpty()) {
                StoreUser u = new StoreUser();
                u.setName("Administrador Demo");
                u.setEmail("admin@nexostore.cl");
                u.setPassword(encoder.encode("Admin123!"));
                u.setRole("ADMIN");
                u.setActive(true);
                repo.save(u);
            }
            if (repo.findByEmailIgnoreCase("cliente@nexostore.cl").isEmpty()) {
                StoreUser u = new StoreUser();
                u.setName("Cliente Demo");
                u.setEmail("cliente@nexostore.cl");
                u.setPassword(encoder.encode("Cliente123!"));
                u.setRole("CLIENT");
                u.setActive(true);
                repo.save(u);
            }
        };
    }
}
