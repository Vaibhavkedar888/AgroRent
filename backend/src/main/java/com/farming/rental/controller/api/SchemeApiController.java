package com.farming.rental.controller.api;

import com.farming.rental.entity.Scheme;
import com.farming.rental.service.SchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/schemes")
@RequiredArgsConstructor
public class SchemeApiController {

    private final SchemeService schemeService;

    @GetMapping
    public ResponseEntity<List<Scheme>> getAllSchemes(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(schemeService.getSchemesByCategory(category));
        }
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Scheme> getSchemeById(@PathVariable String id) {
        return schemeService.getSchemeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
