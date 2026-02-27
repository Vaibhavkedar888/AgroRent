package com.farming.rental.controller.api;

import com.farming.rental.dto.UserRegistrationDTO;
import com.farming.rental.entity.User;
import com.farming.rental.service.OTPService;
import com.farming.rental.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthApiController {

    private final OTPService otpService;
    private final UserService userService;

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: Request OTP (by EMAIL — primary login flow)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> requestOTP(@RequestParam String email, HttpSession session) {
        log.info("OTP request for email: {}", email);
        try {
            User user = otpService.generateOTPByEmail(email.trim().toLowerCase());
            session.setAttribute("tempEmail", email.trim().toLowerCase());
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", otpService.getMaskedEmail(email.trim().toLowerCase()),
                "name", user.getFullName() != null ? user.getFullName() : ""
            ));
        } catch (RuntimeException e) {
            log.warn("OTP request failed for {}: {}", email, e.getMessage());
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("OTP request error for {}: {}", email, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to send OTP. Please try again."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Verify OTP (by EMAIL)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestParam String email,
                                       @RequestParam String otp,
                                       HttpSession session,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        log.info("OTP verification for email: {}", email);

        Optional<User> userOpt = otpService.verifyOTPByEmail(email.trim().toLowerCase(), otp.trim());

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (Boolean.TRUE.equals(user.getIsBlocked())) {
                return ResponseEntity.status(403).body(Map.of("error", "Account blocked. Contact support."));
            }

            // Store in session
            session.setAttribute("loggedInUser", user);
            session.setAttribute("userId", user.getId());
            session.setAttribute("userRole", user.getRole());
            session.setAttribute("userEmail", email.trim().toLowerCase());

            // Set Spring Security context
            String roleName = "ROLE_" + user.getRole().name();
            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(roleName));
            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user.getEmail(), null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);

            new HttpSessionSecurityContextRepository()
                .saveContext(SecurityContextHolder.getContext(), request, response);

            log.info("User authenticated via email OTP: {}", email);
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired OTP. Please try again."));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // REGISTER
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDTO dto) {
        try {
            if (userService.getUserByPhoneNumber(dto.getPhoneNumber()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Phone number already registered."));
            }
            if (dto.getEmail() != null && !dto.getEmail().isBlank()
                    && otpService.userExistsByEmail(dto.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already registered."));
            }

            User user = userService.registerUser(dto);

            // Send OTP to the email provided at registration
            otpService.generateOTPForRegistration(
                user.getPhoneNumber(),
                user.getEmail(),
                user.getFullName()
            );

            return ResponseEntity.ok(Map.of(
                "message", "Registered! OTP sent to " + otpService.getMaskedEmail(user.getEmail()) + ". Use it to log in.",
                "user", user
            ));
        } catch (Exception e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ME / LOGOUT
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session, HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
