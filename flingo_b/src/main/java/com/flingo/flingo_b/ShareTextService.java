package com.flingo.flingo_b;

import org.springframework.stereotype.Service;
import java.util.Random;

@Service
//spring creates the shareTextService bean 
public class ShareTextService {

    private final SharedTextRepository repo;
//this method is called as constructor injection 
    public ShareTextService(SharedTextRepository repo){
        this.repo = repo;
    }

    public SharedText saveText(String content){
        SharedText st = new SharedText();
        st.setContent(content);
        st.setCode(generateCode());
        return repo.save(st);
    }

    public SharedText getByCode(String code){
        return repo.findByCode(code)
            .orElseThrow(()-> new RuntimeException("Invalid code"));
    }

    private String generateCode(){
        String pool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random r = new Random();
        StringBuilder sb = new StringBuilder();

        for(int i=0;i<6;i++){
            sb.append(pool.charAt(r.nextInt(pool.length())));
        }
        return sb.toString();
    }

}
