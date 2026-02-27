package com.farming.rental.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for User registration
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistrationDTO {
    private String phoneNumber;
    private String fullName;
    private String email;
    private String role; // FARMER, OWNER
    private String address;
    private String city;
    private String state;
    private String pincode;
}
