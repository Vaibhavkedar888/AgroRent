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
 * Service for OTP-based authentication via Email (Gmail SMTP)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int OTP_VALIDITY_MINUTES = 10;

    /**
     * Generate and send OTP to the user's registered email
     */
    public OTPVerification generateOTP(String phoneNumber) {
        log.info("Generating OTP for phone: {}", phoneNumber);

        // For test accounts: use fixed OTP to simplify testing
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

        // Look up user's email and name from database
        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String email = user.getEmail();
            otp.setEmail(email);
            otpRepository.save(otp);

            if (email != null && !email.isBlank()) {
                // Send OTP via email (async — does not block the response)
                emailService.sendOTPEmail(email, otpCode, user.getFullName());
                log.info("OTP email dispatched to {} for phone: {}", email, phoneNumber);
            } else {
                log.warn("User {} has no email registered — OTP not sent via email", phoneNumber);
            }
        } else {
            // User not found during registration flow — save OTP anyway
            otpRepository.save(otp);
            log.warn("No user found for phone {} — OTP saved but email not sent", phoneNumber);
        }

        return otp;
    }

    /**
     * Generate OTP and send to a specific email (used during registration when user is brand new)
     */
    public OTPVerification generateOTPForRegistration(String phoneNumber, String email, String fullName) {
        log.info("Generating registration OTP for phone: {}, email: {}", phoneNumber, email);

        String otpCode = generateSixDigitOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        OTPVerification otp = otpRepository.findByPhoneNumber(phoneNumber)
            .orElse(new OTPVerification());

        otp.setPhoneNumber(phoneNumber);
        otp.setEmail(email);
        otp.setOtpCode(otpCode);
        otp.setIsVerified(false);
        otp.setExpiresAt(expiresAt);
        otpRepository.save(otp);

        if (email != null && !email.isBlank()) {
            emailService.sendOTPEmail(email, otpCode, fullName);
            log.info("Registration OTP email dispatched to: {}", email);
        }

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

        if (otp.isExpired()) {
            log.warn("OTP expired for phone: {}", phoneNumber);
            return Optional.empty();
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP code for phone: {}", phoneNumber);
            return Optional.empty();
        }

        otp.setIsVerified(true);
        otpRepository.save(otp);

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

    public boolean userExists(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    public Optional<OTPVerification> getOTPStatus(String phoneNumber) {
        return otpRepository.findByPhoneNumber(phoneNumber);
    }

    /**
     * Returns a masked email like u***@gmail.com for UI display
     */
    public String getMaskedEmail(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .map(user -> {
                String email = user.getEmail();
                if (email == null || !email.contains("@")) return "your registered email";
                int atIdx = email.indexOf('@');
                String local = email.substring(0, atIdx);
                String domain = email.substring(atIdx);
                String masked = local.length() <= 2
                    ? local + "***"
                    : local.charAt(0) + "***" + local.charAt(local.length() - 1);
                return masked + domain;
            })
            .orElse("your registered email");
    }
}
