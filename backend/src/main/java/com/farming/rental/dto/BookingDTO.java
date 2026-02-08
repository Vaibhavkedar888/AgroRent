package com.farming.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Booking requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingDTO {
    private Long equipmentId;
    private String startDate;
    private String endDate;
    private String notes;
}
