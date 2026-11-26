package cl.nexostore.api.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreUserRepository extends JpaRepository<StoreUser, Long> {
    Optional<StoreUser> findByEmailIgnoreCase(String email);
}
