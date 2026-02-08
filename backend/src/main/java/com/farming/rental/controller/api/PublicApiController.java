package com.farming.rental.controller.api;

import com.farming.rental.entity.Equipment;
import com.farming.rental.service.EquipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/equipment")
@RequiredArgsConstructor
public class PublicApiController {

    private final EquipmentService equipmentService;

    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        
        if (lat != null && lng != null) {
            return ResponseEntity.ok(equipmentService.getNearestEquipment(lat, lng));
        }
        
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(equipmentService.getEquipmentByCategory(category));
        }
        return ResponseEntity.ok(equipmentService.getAvailableEquipment());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Equipment> getEquipmentById(@PathVariable String id) {
        return equipmentService.getEquipmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
