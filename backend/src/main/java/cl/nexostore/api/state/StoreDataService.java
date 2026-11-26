package cl.nexostore.api.state;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.time.Instant;
import java.util.*;

@Service
public class StoreDataService {
    private final StoreSnapshotRepository repository;
    private final ObjectMapper mapper;

    public StoreDataService(StoreSnapshotRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public synchronized ObjectNode state() {
        try {
            var saved = repository.findById(1L);
            if (saved.isPresent()) {
                ObjectNode loaded = (ObjectNode) mapper.readTree(saved.get().getPayload());
                loaded.remove("users");
                ensureCollections(loaded);
                save(loaded);
                return loaded;
            }
            try (InputStream in = new ClassPathResource("store-seed.json").getInputStream()) {
                ObjectNode seed = (ObjectNode) mapper.readTree(in);
                ensureCollections(seed);
                save(seed);
                return seed;
            }
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo cargar la tienda", ex);
        }
    }

    private void ensureCollections(ObjectNode s) {
        for (String key : List.of("products", "categories", "posts", "orders", "messages"))
            if (!s.path(key).isArray()) s.set(key, mapper.createArrayNode());
    }

    public synchronized void save(ObjectNode state) {
        state.remove("users");
        try {
            StoreSnapshot row = repository.findById(1L).orElseGet(StoreSnapshot::new);
            row.setPayload(mapper.writeValueAsString(state));
            repository.save(row);
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo persistir en H2", ex);
        }
    }

    public synchronized void resetStore() {
        try (InputStream in = new ClassPathResource("store-seed.json").getInputStream()) {
            save((ObjectNode) mapper.readTree(in));
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo reiniciar la tienda", ex);
        }
    }

    public synchronized ObjectNode publicCatalog() {
        ObjectNode source = state(), result = mapper.createObjectNode();
        result.set("products", source.path("products").deepCopy());
        result.set("categories", source.path("categories").deepCopy());
        result.set("posts", source.path("posts").deepCopy());
        return result;
    }

    public synchronized ObjectNode adminState(List<?> users) {
        ObjectNode result = state().deepCopy();
        result.set("users", mapper.valueToTree(users));
        return result;
    }

    public synchronized ObjectNode createOrder(JsonNode request, String userId) {
        ObjectNode s = state();
        ArrayNode products = (ArrayNode) s.path("products");
        JsonNode customer = request.path("customer"), items = request.path("items");
        if (customer.path("name").asText().isBlank() || !customer.path("email").asText().contains("@") || customer.path("address").asText().isBlank() || customer.path("region").asText().isBlank() || !items.isArray() || items.isEmpty())
            throw new IllegalArgumentException("Completa los datos del checkout.");
        Map<String, Integer> quantities = new LinkedHashMap<>();
        for (JsonNode requested : items) {
            String productId = requested.path("productId").asText();
            JsonNode q = requested.path("quantity");
            if (!q.isIntegralNumber() || q.asInt() < 1) throw new IllegalArgumentException("Cantidad inválida.");
            quantities.merge(productId, q.asInt(), Integer::sum);
        }
        ArrayNode lines = mapper.createArrayNode();
        double total = 0;
        for (var entry : quantities.entrySet()) {
            String productId = entry.getKey();
            int quantity = entry.getValue();
            ObjectNode product = find(products, productId);
            if (product == null || product.path("stock").asInt() < quantity)
                throw new IllegalArgumentException("Stock insuficiente para " + (product == null ? productId : product.path("name").asText()) + ".");
            double price = product.path("price").asDouble();
            double subtotal = price * quantity;
            total += subtotal;
            ObjectNode line = mapper.createObjectNode();
            line.put("productId", productId);
            line.put("name", product.path("name").asText());
            line.put("unitPrice", price);
            line.put("quantity", quantity);
            line.put("subtotal", subtotal);
            lines.add(line);
        }
        boolean failure = request.path("simulateFailure").asBoolean(false);
        if (!failure) for (JsonNode line : lines) {
            ObjectNode p = find(products, line.path("productId").asText());
            p.put("stock", p.path("stock").asInt() - line.path("quantity").asInt());
        }
        ObjectNode order = mapper.createObjectNode();
        order.put("id", "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.put("createdAt", Instant.now().toString());
        order.put("userId", userId == null ? "" : userId);
        order.set("customer", customer.deepCopy());
        order.set("items", lines);
        order.put("total", total);
        order.put("paymentMethod", request.path("paymentMethod").asText("demo"));
        order.put("status", failure ? "rechazado" : "pagado");
        ArrayNode orders = (ArrayNode) s.path("orders");
        orders.insert(0, order);
        save(s);
        return order;
    }

    public synchronized ObjectNode createMessage(JsonNode body) {
        if (body.path("name").asText().isBlank() || !body.path("email").asText().contains("@") || body.path("message").asText().isBlank())
            throw new IllegalArgumentException("Completa el formulario.");
        ObjectNode s = state(), message = mapper.createObjectNode();
        message.put("id", "M-" + UUID.randomUUID().toString().substring(0, 8));
        message.put("name", body.path("name").asText().trim());
        message.put("email", body.path("email").asText().trim());
        message.put("message", body.path("message").asText().trim());
        message.put("date", Instant.now().toString());
        ((ArrayNode) s.path("messages")).insert(0, message);
        save(s);
        return message;
    }

    public synchronized void deleteMessage(String id) {
        ObjectNode s = state();
        ArrayNode a = (ArrayNode) s.path("messages");
        for (int i = a.size() - 1; i >= 0; i--) if (id.equals(a.get(i).path("id").asText())) a.remove(i);
        save(s);
    }

    public synchronized ObjectNode updateOrder(String id, String status) {
        Set<String> allowed = Set.of("pagado", "preparando", "enviado", "entregado", "rechazado");
        if (!allowed.contains(status)) throw new IllegalArgumentException("Estado de pedido inválido.");
        ObjectNode s = state();
        for (JsonNode n : s.path("orders"))
            if (id.equals(n.path("id").asText())) {
                ((ObjectNode) n).put("status", status);
                save(s);
                return (ObjectNode) n;
            }
        throw new NoSuchElementException("Pedido no encontrado.");
    }

    public synchronized ObjectNode updateProduct(String id, JsonNode patch) {
        ObjectNode s = state();
        ObjectNode p = find((ArrayNode) s.path("products"), id);
        if (p == null) throw new NoSuchElementException("Producto no encontrado.");
        patch.fields().forEachRemaining(e -> {
            if (!e.getKey().equals("id")) p.set(e.getKey(), e.getValue().deepCopy());
        });
        validateProduct(p, s);
        save(s);
        return p;
    }

    public synchronized ObjectNode createProduct(JsonNode body) {
        ObjectNode s = state(), p = body.deepCopy();
        p.put("id", "P-" + UUID.randomUUID().toString().substring(0, 8));
        validateProduct(p, s);
        ((ArrayNode) s.path("products")).add(p);
        save(s);
        return p;
    }

    public synchronized void deleteProduct(String id) {
        ObjectNode s = state();
        ArrayNode a = (ArrayNode) s.path("products");
        for (int i = a.size() - 1; i >= 0; i--) if (id.equals(a.get(i).path("id").asText())) a.remove(i);
        save(s);
    }

    public synchronized ObjectNode createCategory(JsonNode body) {
        if (body.path("name").asText().isBlank()) throw new IllegalArgumentException("Se requiere un nombre.");
        ObjectNode s = state(), c = body.deepCopy();
        c.put("id", "C-" + UUID.randomUUID().toString().substring(0, 8));
        ((ArrayNode) s.path("categories")).add(c);
        save(s);
        return c;
    }

    public synchronized ObjectNode updateCategory(String id, JsonNode patch) {
        ObjectNode s = state(), c = find((ArrayNode) s.path("categories"), id);
        if (c == null) throw new NoSuchElementException("Categoría no encontrada.");
        if (patch.has("name") && patch.path("name").asText().isBlank())
            throw new IllegalArgumentException("Nombre obligatorio.");
        patch.fields().forEachRemaining(e -> {
            if (!e.getKey().equals("id")) c.set(e.getKey(), e.getValue().deepCopy());
        });
        save(s);
        return c;
    }

    public synchronized void deleteCategory(String id) {
        ObjectNode s = state();
        for (JsonNode p : s.path("products"))
            if (id.equals(p.path("categoryId").asText()))
                throw new IllegalArgumentException("Esta categoría contiene productos.");
        ArrayNode a = (ArrayNode) s.path("categories");
        for (int i = a.size() - 1; i >= 0; i--) if (id.equals(a.get(i).path("id").asText())) a.remove(i);
        save(s);
    }

    private ObjectNode find(ArrayNode a, String id) {
        for (JsonNode n : a) if (id.equals(n.path("id").asText())) return (ObjectNode) n;
        return null;
    }

    private void validateProduct(ObjectNode p, ObjectNode s) {
        if (p.path("name").asText().isBlank() || p.path("price").asDouble(-1) < 0 || p.path("oldPrice").asDouble(0) < 0 || p.path("stock").asInt(-1) < 0 || find((ArrayNode) s.path("categories"), p.path("categoryId").asText()) == null)
            throw new IllegalArgumentException("Producto inválido.");
    }
}
