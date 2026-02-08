package com.farming.rental.controller.api;

import com.farming.rental.entity.User;
import com.farming.rental.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Slf4j
public class UserApiController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload, HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            return ResponseEntity.status(401).build();
        }

        try {
            user.setFullName(payload.get("fullName"));
            user.setEmail(payload.get("email"));
            user.setAddress(payload.get("address"));
            user.setCity(payload.get("city"));
            user.setState(payload.get("state"));
            user.setPincode(payload.get("pincode"));

            User updated = userService.updateUserProfile(user);
            session.setAttribute("loggedInUser", updated);
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
