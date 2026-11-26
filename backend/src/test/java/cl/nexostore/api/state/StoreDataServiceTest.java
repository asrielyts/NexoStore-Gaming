package cl.nexostore.api.state;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class StoreDataServiceTest {
    @Autowired
    StoreDataService data;
    @Autowired
    ObjectMapper mapper;

    @BeforeEach
    void reset() {
        data.resetStore();
    }

    @Test
    void publicCatalogDoesNotContainPrivateCollections() {
        var catalog = data.publicCatalog();
        assertTrue(catalog.has("products"));
        assertTrue(catalog.has("categories"));
        assertTrue(catalog.has("posts"));
        assertFalse(catalog.has("users"));
        assertFalse(catalog.has("orders"));
        assertFalse(catalog.has("messages"));
    }

    @Test
    void backendCalculatesPriceAndRejectedPaymentDoesNotReduceStock() throws Exception {
        int stock = data.publicCatalog().path("products").get(1).path("stock").asInt();
        var request = mapper.readTree("{\"customer\":{\"name\":\"Test\",\"email\":\"test@example.cl\",\"address\":\"Demo 1\",\"region\":\"RM\"},\"items\":[{\"productId\":\"P102\",\"quantity\":2,\"price\":1}],\"paymentMethod\":\"demo\",\"simulateFailure\":true}");
        var order = data.createOrder(request, null);
        assertEquals("rechazado", order.path("status").asText());
        assertEquals(69980, order.path("total").asDouble());
        assertEquals(stock, data.publicCatalog().path("products").get(1).path("stock").asInt());
    }

    @Test
    void duplicateLinesCannotBypassStockValidation() throws Exception {
        int stock = data.publicCatalog().path("products").get(1).path("stock").asInt();
        var request = mapper.readTree("{\"customer\":{\"name\":\"Test\",\"email\":\"test@example.cl\",\"address\":\"Demo 1\",\"region\":\"RM\"},\"items\":[{\"productId\":\"P102\",\"quantity\":15},{\"productId\":\"P102\",\"quantity\":15}],\"paymentMethod\":\"demo\"}");
        assertThrows(IllegalArgumentException.class, () -> data.createOrder(request, null));
        assertEquals(stock, data.publicCatalog().path("products").get(1).path("stock").asInt());
    }

    @Test
    void successfulOrderReducesServerStock() throws Exception {
        int stock = data.publicCatalog().path("products").get(1).path("stock").asInt();
        var request = mapper.readTree("{\"customer\":{\"name\":\"Test\",\"email\":\"test@example.cl\",\"address\":\"Demo 1\",\"region\":\"RM\"},\"items\":[{\"productId\":\"P102\",\"quantity\":1}],\"paymentMethod\":\"demo\",\"simulateFailure\":false}");
        var order = data.createOrder(request, null);
        assertEquals("pagado", order.path("status").asText());
        assertEquals(stock - 1, data.publicCatalog().path("products").get(1).path("stock").asInt());
    }
}
