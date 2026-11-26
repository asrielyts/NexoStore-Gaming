package cl.nexostore.api.state;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "cookie-jwt")
public class CatalogController {
    private final StoreDataService data;

    public CatalogController(StoreDataService data) {
        this.data = data;
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody JsonNode body) {
        try {
            return ResponseEntity.status(201).body(data.createProduct(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody JsonNode body) {
        try {
            return ResponseEntity.ok(data.updateProduct(id, body));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable String id) {
        data.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody JsonNode body) {
        try {
            return ResponseEntity.status(201).body(data.createCategory(body));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable String id, @RequestBody JsonNode body) {
        try {
            return ResponseEntity.ok(data.updateCategory(id, body));
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable String id) {
        try {
            data.deleteCategory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
