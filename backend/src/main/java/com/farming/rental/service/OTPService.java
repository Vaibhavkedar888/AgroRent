package com.farming.rental.service;

import com.farming.rental.entity.OTPVerification;
import com.farming.rental.entity.User;
import com.farming.rental.repository.OTPVerificationRepository;
import com.farming.rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

/**
 * Service for OTP-based authentication
 * Handles OTP generation, verification, and user authentication
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPVerificationRepository otpRepository;
    private final UserRepository userRepository;
    
    // OTP validity period in minutes
    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and send OTP to phone number
     * In production, integrate with SMS gateway (Twilio, AWS SNS, etc.)
     */
    public OTPVerification generateOTP(String phoneNumber) {
        log.info("Generating OTP for phone: {}", phoneNumber);
        
        // For development/testing: use fixed OTP for known test accounts to simplify login
        String otpCode;
        if ("9876543210".equals(phoneNumber) || "9111111111".equals(phoneNumber) || "9000000000".equals(phoneNumber)) {
            otpCode = "123456";
        } else {
            otpCode = generateSixDigitOTP();
        }
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        OTPVerification otp = otpRepository.findByPhoneNumber(phoneNumber)
            .orElse(new OTPVerification());
        
        otp.setPhoneNumber(phoneNumber);
        otp.setOtpCode(otpCode);
        otp.setIsVerified(false);
        otp.setExpiresAt(expiresAt);
        
        otpRepository.save(otp);
        
        // TODO: Integrate SMS gateway to send OTP
        log.info("OTP generated for {}: {} (Valid until {})", phoneNumber, otpCode, expiresAt);
        
        return otp;
    }

    /**
     * Verify OTP and authenticate user
     */
    public Optional<User> verifyOTP(String phoneNumber, String otpCode) {
        log.info("Verifying OTP for phone: {}", phoneNumber);
        
        Optional<OTPVerification> otpVerification = otpRepository.findByPhoneNumber(phoneNumber);
        
        if (otpVerification.isEmpty()) {
            log.warn("OTP not found for phone: {}", phoneNumber);
            return Optional.empty();
        }
        
        OTPVerification otp = otpVerification.get();
        
        // Check if OTP has expired
        if (otp.isExpired()) {
            log.warn("OTP expired for phone: {}", phoneNumber);
            return Optional.empty();
        }
        
        // Verify OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP code for phone: {}", phoneNumber);
            return Optional.empty();
        }
        
        // Mark OTP as verified
        otp.setIsVerified(true);
        otpRepository.save(otp);
        
        // Get user by phone number
        Optional<User> user = userRepository.findByPhoneNumber(phoneNumber);
        
        if (user.isPresent()) {
            log.info("User authenticated via OTP: {}", phoneNumber);
            return user;
        }
        
        log.warn("No user found for phone: {}", phoneNumber);
        return Optional.empty();
    }

    /**
     * Generate 6-digit random OTP
     */
    private String generateSixDigitOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Check if user exists by phone number
     */
    public boolean userExists(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    /**
     * Get OTP status
     */
    public Optional<OTPVerification> getOTPStatus(String phoneNumber) {
        return otpRepository.findByPhoneNumber(phoneNumber);
    }
}
