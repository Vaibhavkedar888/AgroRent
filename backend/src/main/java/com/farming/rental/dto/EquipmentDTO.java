package com.farming.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Equipment registration/update
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private Double pricePerDay;
    private String imageUrl;
    private Boolean isAvailable;
    private String availabilityFrom;
    private String availabilityTo;
    private String location;
}
