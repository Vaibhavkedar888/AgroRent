package com.farming.rental.controller.api;

import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.Review;
import com.farming.rental.entity.User;
import com.farming.rental.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewApiController {

    private final ReviewService reviewService;

    @GetMapping("/public/equipment/{equipmentId}/reviews")
    public ResponseEntity<List<Review>> getReviews(@PathVariable String equipmentId) {
        return ResponseEntity.ok(reviewService.getEquipmentReviews(equipmentId));
    }

    @PostMapping("/farmer/reviews")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload, HttpSession session) {
        User farmer = (User) session.getAttribute("loggedInUser");
        if (farmer == null || farmer.getRole() != User.UserRole.FARMER) {
            return ResponseEntity.status(403).body(Map.of("error", "Only farmers can leave reviews"));
        }

        try {
            Review review = new Review();
            
            Equipment equipment = new Equipment();
            equipment.setId((String) payload.get("equipmentId"));
            
            review.setEquipment(equipment);
            review.setFarmer(farmer);
            review.setRating((Integer) payload.get("rating"));
            review.setComment((String) payload.get("comment"));

            return ResponseEntity.ok(reviewService.addReview(review));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/reviews/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId, HttpSession session) {
        User admin = (User) session.getAttribute("loggedInUser");
        if (admin == null || admin.getRole() != User.UserRole.ADMIN) {
            return ResponseEntity.status(403).build();
        }

        reviewService.deleteReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
