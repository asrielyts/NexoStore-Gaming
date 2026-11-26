package cl.nexostore.api.user;

import jakarta.persistence.*;

@Entity
@Table(name = "store_users")
public class StoreUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false)
    private String role = "CLIENT";
    @Column(nullable = false)
    private boolean active = true;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String v) {
        name = v;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String v) {
        email = v;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String v) {
        password = v;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String v) {
        role = v;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean v) {
        active = v;
    }
}
