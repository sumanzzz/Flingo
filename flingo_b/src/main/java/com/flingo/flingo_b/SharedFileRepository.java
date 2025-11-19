package com.flingo.flingo_b;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface SharedFileRepository extends JpaRepository<SharedFile,String> {
    Optional<SharedFile>  findByCode(String code);
}