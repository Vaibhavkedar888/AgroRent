package com.farming.rental.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * OTP Verification Entity - Handles One-Time Password authentication
 * Used for login verification via SMS OTP
 */
@Document(collection = "otp_verifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OTPVerification {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("phone_number")
    private String phoneNumber;

    @Field("otp_code")
    private String otpCode; // 6-digit OTP

    @Field("is_verified")
    private Boolean isVerified = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Field("expires_at")
    private LocalDateTime expiresAt; // OTP expiry time (usually 10 minutes)

    /**
     * Check if OTP is still valid
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    /**
     * Check if OTP is valid for verification
     */
    public boolean isValidForVerification() {
        return !isVerified && !isExpired();
    }
}
