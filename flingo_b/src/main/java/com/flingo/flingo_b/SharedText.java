package com.flingo.flingo_b;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.annotation.Generated;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.GenerationType;

// getters and setters can be configured using Lombok instead of manually entering the get and set methods for each components

//import lombok.Getter;
//import lombok.Setter;

//@Getter
//@Setter
@Entity
public class SharedText {
    @Id
   

    private String id;

    private String code;

    private String content;

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
// Manual way for configuring getters and setters

// Getters
    public String getId(){
        return id;
    }

    public String getCode(){
        return code;

    }

    public String getContent(){
        return content;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setId(String id){
        this.id = id;
    }

    public void setCode(String code){
        this.code = code;
    }

    public void setContent(String content){
        this.content = content;
    }

    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }


}
