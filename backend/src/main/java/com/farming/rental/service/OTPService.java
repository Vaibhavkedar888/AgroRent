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
    private final EmailService emailService;
    
    // OTP validity period in minutes
    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and send OTP to email
     */
    public OTPVerification generateOTP(String email) {
        log.info("Generating OTP for email: {}", email);
        
        String otpCode = generateSixDigitOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        OTPVerification otp = otpRepository.findByEmail(email)
            .orElse(new OTPVerification());
        
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setIsVerified(false);
        otp.setExpiresAt(expiresAt);
        
        otpRepository.save(otp);
        
        emailService.sendOTP(email, otpCode);
        log.info("OTP generated and sent to {}: (Valid until {})", email, expiresAt);
        
        return otp;
    }

    /**
     * Verify OTP and authenticate user
     */
    public Optional<User> verifyOTP(String email, String otpCode) {
        log.info("Verifying OTP for email: {}", email);
        
        Optional<OTPVerification> otpVerification = otpRepository.findByEmail(email);
        
        if (otpVerification.isEmpty()) {
            log.warn("OTP not found for email: {}", email);
            return Optional.empty();
        }
        
        OTPVerification otp = otpVerification.get();
        
        // Check if OTP has expired
        if (otp.isExpired()) {
            log.warn("OTP expired for email: {}", email);
            return Optional.empty();
        }
        
        // Verify OTP code
        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP code for email: {}", email);
            return Optional.empty();
        }
        
        // Mark OTP as verified
        otp.setIsVerified(true);
        otpRepository.save(otp);
        
        // Get user by email
        Optional<User> user = userRepository.findByEmail(email);
        
        if (user.isPresent()) {
            log.info("User authenticated via OTP: {}", email);
            return user;
        }
        
        log.warn("No user found for email: {}", email);
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
     * Check if user exists by email
     */
    public boolean userExists(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    /**
     * Get OTP status
     */
    public Optional<OTPVerification> getOTPStatus(String email) {
        return otpRepository.findByEmail(email);
    }
}
