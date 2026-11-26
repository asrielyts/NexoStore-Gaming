package cl.nexostore.api.state;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreSnapshotRepository extends JpaRepository<StoreSnapshot, Long> {
}
