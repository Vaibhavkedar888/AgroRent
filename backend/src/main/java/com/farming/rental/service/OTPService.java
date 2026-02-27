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
 * OTPService — handles all OTP generation & verification
 * Supports email-based login: enter email → OTP sent to that email
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPVerificationRepository otpRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int OTP_VALIDITY_MINUTES = 10;

    // ─────────────────────────────────────────────────────────────────────────
    // EMAIL-BASED OTP (primary login flow)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Generate & send OTP for login by EMAIL.
     * Returns the User if the email is registered, throws if not found.
     */
    public User generateOTPByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("No account registered with this email."));

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new RuntimeException("Your account has been blocked. Contact support.");
        }

        String otpCode = generateSixDigitOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        // Upsert OTP record keyed on email
        OTPVerification otp = otpRepository.findByEmail(email)
            .orElse(new OTPVerification());

        otp.setEmail(email);
        otp.setPhoneNumber(user.getPhoneNumber());   // keep phone for backward compat
        otp.setOtpCode(otpCode);
        otp.setIsVerified(false);
        otp.setExpiresAt(expiresAt);
        otpRepository.save(otp);

        // Send email asynchronously
        emailService.sendOTPEmail(email, otpCode, user.getFullName());
        log.info("OTP email dispatched to: {}", email);

        return user;
    }

    /**
     * Verify OTP by EMAIL and return authenticated User.
     */
    public Optional<User> verifyOTPByEmail(String email, String otpCode) {
        Optional<OTPVerification> otpVerification = otpRepository.findByEmail(email);

        if (otpVerification.isEmpty()) {
            log.warn("OTP not found for email: {}", email);
            return Optional.empty();
        }

        OTPVerification otp = otpVerification.get();

        if (otp.isExpired()) {
            log.warn("OTP expired for email: {}", email);
            return Optional.empty();
        }

        if (!otp.getOtpCode().equals(otpCode)) {
            log.warn("Invalid OTP for email: {}", email);
            return Optional.empty();
        }

        otp.setIsVerified(true);
        otpRepository.save(otp);

        return userRepository.findByEmail(email);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PHONE-BASED OTP (registration flow — sends OTP after user signs up)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Used after registration — sends OTP to the email provided in the form.
     */
    public OTPVerification generateOTPForRegistration(String phoneNumber, String email, String fullName) {
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

    // ─────────────────────────────────────────────────────────────────────────
    // LEGACY PHONE-BASED (kept for backward compat)
    // ─────────────────────────────────────────────────────────────────────────

    public OTPVerification generateOTP(String phoneNumber) {
        User user = userRepository.findByPhoneNumber(phoneNumber).orElse(null);
        String otpCode = generateSixDigitOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(OTP_VALIDITY_MINUTES);

        OTPVerification otp = otpRepository.findByPhoneNumber(phoneNumber)
            .orElse(new OTPVerification());

        otp.setPhoneNumber(phoneNumber);
        otp.setOtpCode(otpCode);
        otp.setIsVerified(false);
        otp.setExpiresAt(expiresAt);

        if (user != null && user.getEmail() != null) {
            otp.setEmail(user.getEmail());
            otpRepository.save(otp);
            emailService.sendOTPEmail(user.getEmail(), otpCode, user.getFullName());
        } else {
            otpRepository.save(otp);
        }

        return otp;
    }

    public Optional<User> verifyOTP(String phoneNumber, String otpCode) {
        return otpRepository.findByPhoneNumber(phoneNumber)
            .filter(otp -> !otp.isExpired() && otp.getOtpCode().equals(otpCode))
            .map(otp -> {
                otp.setIsVerified(true);
                otpRepository.save(otp);
                return userRepository.findByPhoneNumber(phoneNumber).orElse(null);
            })
            .filter(java.util.Objects::nonNull)
            .map(Optional::of)
            .orElse(Optional.empty());
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    private String generateSixDigitOTP() {
        return String.valueOf(100000 + new Random().nextInt(900000));
    }

    public boolean userExists(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber).isPresent();
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public Optional<OTPVerification> getOTPStatus(String phoneNumber) {
        return otpRepository.findByPhoneNumber(phoneNumber);
    }

    public String getMaskedEmail(String email) {
        if (email == null || !email.contains("@")) return "your registered email";
        int atIdx = email.indexOf('@');
        String local = email.substring(0, atIdx);
        String domain = email.substring(atIdx);
        String masked = local.length() <= 2
            ? local + "***"
            : local.charAt(0) + "***" + local.charAt(local.length() - 1);
        return masked + domain;
    }
}
