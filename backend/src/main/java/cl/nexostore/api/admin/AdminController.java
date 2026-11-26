package cl.nexostore.api.admin;

import cl.nexostore.api.user.*;
import cl.nexostore.api.state.StoreDataService;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "cookie-jwt")
public class AdminController {
    private final StoreUserRepository users;
    private final PasswordEncoder encoder;
    private final StoreDataService data;

    public AdminController(StoreUserRepository u, PasswordEncoder e, StoreDataService d) {
        users = u;
        encoder = e;
        data = d;
    }

    @PostMapping("/reset")
    public ResponseEntity<?> reset() {
        data.resetStore();
        return ResponseEntity.ok(Map.of("ok", true));
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return users.findAll().stream().map(this::safe).toList();
    }

    @PostMapping("/users")
    public ResponseEntity<?> create(@RequestBody JsonNode b) {
        String name = b.path("name").asText().trim(), email = b.path("email").asText().trim().toLowerCase(), password = b.path("password").asText();
        if (name.isBlank() || !email.contains("@") || password.length() < 6)
            return ResponseEntity.badRequest().body(Map.of("error", "Datos inválidos; contraseña mínima de 6 caracteres."));
        if (users.findByEmailIgnoreCase(email).isPresent())
            return ResponseEntity.badRequest().body(Map.of("error", "Ese correo ya existe."));
        StoreUser u = new StoreUser();
        u.setName(name);
        u.setEmail(email);
        u.setPassword(encoder.encode(password));
        u.setRole("admin".equalsIgnoreCase(b.path("role").asText()) ? "ADMIN" : "CLIENT");
        u.setActive(true);
        return ResponseEntity.status(201).body(safe(users.save(u)));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody JsonNode b, @AuthenticationPrincipal String currentEmail) {
        StoreUser u = users.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        boolean self = u.getEmail().equalsIgnoreCase(currentEmail);
        if (self && ((b.has("role") && !"admin".equalsIgnoreCase(b.path("role").asText())) || (b.has("active") && !b.path("active").asBoolean())))
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes quitarte el rol ni desactivar tu propia cuenta."));
        if ("ADMIN".equals(u.getRole()) && ((b.has("role") && !"admin".equalsIgnoreCase(b.path("role").asText())) || (b.has("active") && !b.path("active").asBoolean())) && users.findAll().stream().filter(x -> x.isActive() && "ADMIN".equals(x.getRole())).count() < 2)
            return ResponseEntity.badRequest().body(Map.of("error", "Debe existir al menos un administrador activo."));
        if (b.has("name")) {
            String n = b.path("name").asText().trim();
            if (n.isBlank()) return ResponseEntity.badRequest().body(Map.of("error", "Nombre obligatorio"));
            u.setName(n);
        }
        if (b.has("role")) u.setRole("admin".equalsIgnoreCase(b.path("role").asText()) ? "ADMIN" : "CLIENT");
        if (b.has("active")) u.setActive(b.path("active").asBoolean());
        if (b.has("password") && !b.path("password").asText().isBlank()) {
            String p = b.path("password").asText();
            if (p.length() < 6)
                return ResponseEntity.badRequest().body(Map.of("error", "Contraseña mínima de 6 caracteres"));
            u.setPassword(encoder.encode(p));
        }
        return ResponseEntity.ok(safe(users.save(u)));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @AuthenticationPrincipal String currentEmail) {
        StoreUser u = users.findById(id).orElse(null);
        if (u == null) return ResponseEntity.notFound().build();
        if (u.getEmail().equalsIgnoreCase(currentEmail))
            return ResponseEntity.badRequest().body(Map.of("error", "No puedes eliminar tu propia cuenta."));
        if ("ADMIN".equals(u.getRole()) && users.findAll().stream().filter(x -> x.isActive() && "ADMIN".equals(x.getRole())).count() < 2)
            return ResponseEntity.badRequest().body(Map.of("error", "No se puede eliminar el último administrador activo."));
        users.delete(u);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/messages/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable String id) {
        data.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<?> order(@PathVariable String id, @RequestBody JsonNode b) {
        try {
            return ResponseEntity.ok(data.updateOrder(id, b.path("status").asText()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private Map<String, Object> safe(StoreUser u) {
        return Map.of("id", String.valueOf(u.getId()), "name", u.getName(), "email", u.getEmail(), "role", u.getRole().toLowerCase(), "active", u.isActive());
    }
}
