package com.flingo.flingo_b;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.PrePersist;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class SharedFile {
    @Id
    private String id;

    @Column(unique = true)
    private String code;
    private String originalFilename;
    private String storedFilename;
    private String contentType;
    private Long size;

    @Column(columnDefinition = "TEXT")
    private String path;
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist(){
        if(this.id == null) {
            this.id = UUID.randomUUID().toString();
        }
        if(this.createdAt == null){
            this.createdAt = LocalDateTime.now();
        }
    }
}
