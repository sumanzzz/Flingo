package com.flingo.flingo_b;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class ServiceTestController {
    
    private final ShareTextService service;
    
    public ServiceTestController(ShareTextService service) {
        this.service = service;
    }
    
    @GetMapping("/test-save")
    public SharedText testSave(@RequestParam String text) {
        return service.saveText(text);
    }
    
    @GetMapping("/test-get")
    public SharedText testGet(@RequestParam String code) {
        return service.getByCode(code);
    }
}
