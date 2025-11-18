package com.flingo.flingo_b;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface SharedTextRepository extends JpaRepository<SharedText,String> {
    Optional<SharedText>  findByCode(String code);
}

// Why optional? 
// What happens if user tries to access an expired code? it may not return any value
