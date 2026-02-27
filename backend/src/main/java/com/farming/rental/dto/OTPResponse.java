package com.farming.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for OTP verification response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTPResponse {
    private boolean success;
    private String message;
    private String sessionId;
}
