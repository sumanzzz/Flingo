package com.flingo.flingo_b;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

@RestController
@CrossOrigin
public class SharedFileController {
    
    private final SharedFileService service;
    
    public SharedFileController(SharedFileService service){
        this.service = service;
    }
    
    @PostMapping("/share-file")
    public SharedFile uploadFile(@RequestParam("file")MultipartFile file ) throws Exception{
        return service.savFile(file);
    }
    
    @GetMapping("/file/{code}")
    public SharedFile getFileDetails(@PathVariable String code){
        return service.getByCode(code);
    }
    
    // ===== ADD THIS NEW METHOD =====
    @GetMapping("/download/{code}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String code) {
        try {
            SharedFile fileData = service.getByCode(code);
            File file = new File(fileData.getPath());
            
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }
            
            Resource resource = new FileSystemResource(file);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileData.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + fileData.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
