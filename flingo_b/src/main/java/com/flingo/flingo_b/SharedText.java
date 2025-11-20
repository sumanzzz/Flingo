package com.flingo.flingo_b;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.annotation.Generated;//can remove this
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;//this too
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.GenerationType;//this too , bcs we r using pre persistent 

// getters and setters can be configured using Lombok instead of manually entering the get and set methods for each components

//import lombok.Getter;
//import lombok.Setter;

//@Getter
//@Setter
@Entity
//the above line tells the spring to create a table for this class in the database name of the table will be sharedtext
public class SharedText {
    @Id
   
//@Id says tht it is the PK
    private String id;
//so this id is PK
    private String code;

    private String content;

    private LocalDateTime createdAt;

    @PrePersist
// before saving info to db/table once need to run the below method
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
