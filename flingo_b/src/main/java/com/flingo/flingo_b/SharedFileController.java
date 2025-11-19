package com.flingo.flingo_b;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}
