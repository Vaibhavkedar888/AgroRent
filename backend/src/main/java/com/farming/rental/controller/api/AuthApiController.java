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

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthApiController {

    private final OTPService otpService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<?> requestOTP(@RequestParam String phoneNumber, HttpSession session) {
        log.info("API OTP request for: {}", phoneNumber);
        try {
            // Check if user exists before generating OTP
            if (!otpService.userExists(phoneNumber)) {
                return ResponseEntity.status(404).body(Map.of(
                    "error", "Phone number not registered. Please register first."
                ));
            }
            otpService.generateOTP(phoneNumber);
            session.setAttribute("tempPhoneNumber", phoneNumber);

            // Get user's email to show masked version to user (e.g. u***@gmail.com)
            String maskedEmail = otpService.getMaskedEmail(phoneNumber);
            return ResponseEntity.ok(Map.of(
                "message", "OTP sent to your email",
                "email", maskedEmail
            ));
        } catch (Exception e) {
            log.error("OTP request failed for {}: {}", phoneNumber, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOTP(@RequestParam String phoneNumber,
                                       @RequestParam String otp,
                                       HttpSession session,
                                       HttpServletRequest request,
                                       HttpServletResponse response) {
        log.info("API OTP verification for: {}", phoneNumber);
        Optional<User> user = otpService.verifyOTP(phoneNumber, otp);

        if (user.isPresent()) {
            User loggedInUser = user.get();
            if (loggedInUser.getIsBlocked()) {
                return ResponseEntity.status(403).body(Map.of("error", "Account blocked"));
            }

            // Session Logic
            session.setAttribute("loggedInUser", loggedInUser);
            session.setAttribute("userId", loggedInUser.getId());
            session.setAttribute("userRole", loggedInUser.getRole());

            // Security Context
            String roleName = "ROLE_" + loggedInUser.getRole().name();
            var authorities = java.util.List.of(new SimpleGrantedAuthority(roleName));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(loggedInUser.getPhoneNumber(), null, authorities);
            SecurityContextHolder.getContext().setAuthentication(auth);
            
            HttpSessionSecurityContextRepository repo = new HttpSessionSecurityContextRepository();
            repo.saveContext(SecurityContextHolder.getContext(), request, response);

            return ResponseEntity.ok(loggedInUser);
        } else {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid OTP"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRegistrationDTO dto) {
        try {
            if (userService.getUserByPhoneNumber(dto.getPhoneNumber()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User already exists"));
            }
            User user = userService.registerUser(dto);
            // Send OTP to the email provided during registration
            otpService.generateOTPForRegistration(
                user.getPhoneNumber(),
                user.getEmail(),
                user.getFullName()
            );
            return ResponseEntity.ok(Map.of(
                "message", "Registered successfully. OTP sent to your email: " + user.getEmail(),
                "user", user
            ));
        } catch (Exception e) {
            log.error("Registration failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).build();
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(Map.of("message", "Logged out"));
    }
}
