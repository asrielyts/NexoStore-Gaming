package cl.nexostore.api.state;

import cl.nexostore.api.user.StoreUser;
import cl.nexostore.api.user.StoreUserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
public class StateController {
    private final StoreDataService data;
    private final StoreUserRepository users;

    public StateController(StoreDataService data, StoreUserRepository users) {
        this.data = data;
        this.users = users;
    }

    @GetMapping("/catalog")
    public ObjectNode catalog() {
        return data.publicCatalog();
    }

    @GetMapping("/state")
    @SecurityRequirement(name = "cookie-jwt")
    public ObjectNode adminState() {
        return data.adminState(users.findAll().stream().map(this::safeUser).toList());
    }

    @PostMapping("/orders")
    public ResponseEntity<?> order(@RequestBody JsonNode body, @AuthenticationPrincipal String email) {
        try {
            String userId = users.findByEmailIgnoreCase(email == null ? "" : email).map(u -> String.valueOf(u.getId())).orElse(null);
            return ResponseEntity.status(201).body(data.createOrder(body, userId));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> orderResult(@PathVariable String id, @AuthenticationPrincipal String email) {
        ObjectNode s = data.state();
        for (JsonNode n : s.path("orders"))
            if (id.equals(n.path("id").asText())) {
                String owner = n.path("userId").asText("");
                String current = users.findByEmailIgnoreCase(email == null ? "" : email).map(u -> String.valueOf(u.getId())).orElse("");
                if (!owner.isBlank() && !owner.equals(current))
                    return ResponseEntity.status(403).body(Map.of("error", "No autorizado"));
                ObjectNode safe = ((ObjectNode) n).deepCopy();
                safe.remove("customer");
                safe.remove("userId");
                return ResponseEntity.ok(safe);
            }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/messages")
    public ResponseEntity<?> message(@RequestBody JsonNode body) {
        try {
            return ResponseEntity.status(201).body(data.createMessage(body));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of("ok", true, "service", "NexoStore Spring Boot API", "database", "H2");
    }

    private Map<String, Object> safeUser(StoreUser u) {
        return Map.of("id", String.valueOf(u.getId()), "name", u.getName(), "email", u.getEmail(), "role", u.getRole().toLowerCase(), "active", u.isActive());
    }
}
