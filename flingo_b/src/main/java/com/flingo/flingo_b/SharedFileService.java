package com.flingo.flingo_b;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
public class SharedFileService {

    private final SharedFileRepository repo;

    public SharedFileService(SharedFileRepository repo){
        this.repo = repo;
    }

    public SharedFile savFile(MultipartFile file) throws IOException {

    // ABSOLUTE path to project directory
    String projectDir = System.getProperty("user.dir");

    // ABSOLUTE uploads folder
    String uploadDir = projectDir + File.separator + "uploads";

    // Ensure uploads folder exists
    File folder = new File(uploadDir);
    if (!folder.exists()) {
        folder.mkdirs();
    }

    // Make a unique filename
    String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();

    // ABSOLUTE final path for file
    String uploadPath = uploadDir + File.separator + storedName;

    // Save file to disk
    File dest = new File(uploadPath);
    file.transferTo(dest);

    // Save metadata to DB
    SharedFile sf = new SharedFile();
    sf.setOriginalFilename(file.getOriginalFilename());
    sf.setStoredFilename(storedName);
    sf.setContentType(file.getContentType());
    sf.setSize(file.getSize());
    sf.setPath(uploadPath);
    sf.setCode(generateCode());
    sf.setCreatedAt(LocalDateTime.now());

    return repo.save(sf);
}


    public SharedFile getByCode(String code){
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
