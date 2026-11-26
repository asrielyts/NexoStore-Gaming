package cl.nexostore.api.state;

import jakarta.persistence.*;

@Entity
@Table(name = "store_snapshot")
public class StoreSnapshot {
    @Id
    private Long id = 1L;
    @Lob
    @Column(nullable = false)
    private String payload;

    public Long getId() {
        return id;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String v) {
        payload = v;
    }
}
