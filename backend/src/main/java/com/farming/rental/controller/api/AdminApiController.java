package com.farming.rental.controller.api;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import com.farming.rental.service.BookingService;
import com.farming.rental.service.EquipmentService;
import com.farming.rental.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminApiController {

    private final UserService userService;
    private final EquipmentService equipmentService;
    private final BookingService bookingService;

    private boolean isAdmin(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        return user != null && user.getRole() == User.UserRole.ADMIN;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();

        List<User> allUsers = userService.getAllUsers();
        List<Equipment> allEquipment = equipmentService.getAllEquipment();
        List<Booking> allBookings = bookingService.getAllBookings();

        BigDecimal totalRevenue = allBookings.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.CONFIRMED || b.getStatus() == Booking.BookingStatus.COMPLETED)
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = Map.of(
                "totalUsers", allUsers.size(),
                "totalEquipment", allEquipment.size(),
                "totalBookings", allBookings.size(),
                "totalRevenue", totalRevenue,
                "pendingEquipment", allEquipment.stream().filter(e -> !e.getIsApproved()).toList(),
                "recentBookings", allBookings.stream().limit(10).toList()
        );

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<?> blockUser(@PathVariable String userId, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        try {
            userService.blockUser(userId);
            return ResponseEntity.ok(Map.of("message", "User blocked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<?> unblockUser(@PathVariable String userId, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        try {
            userService.unblockUser(userId);
            return ResponseEntity.ok(Map.of("message", "User unblocked"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/equipment/{equipmentId}/approve")
    public ResponseEntity<?> approveEquipment(@PathVariable String equipmentId, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        try {
            equipmentService.approveEquipment(equipmentId);
            return ResponseEntity.ok(Map.of("message", "Equipment approved"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> deleteEquipment(@PathVariable String equipmentId, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        try {
            equipmentService.deleteEquipment(equipmentId);
            return ResponseEntity.ok(Map.of("message", "Equipment removed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/equipment")
    public ResponseEntity<?> getAllEquipment(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(equipmentService.getAllEquipment());
    }

    @PutMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> updateEquipment(@PathVariable String equipmentId,
                                             @RequestParam String name,
                                             @RequestParam String category,
                                             @RequestParam String description,
                                             @RequestParam BigDecimal pricePerDay,
                                             @RequestParam(required = false) BigDecimal pricePerHour,
                                             @RequestParam(required = false) BigDecimal pricePerWeek,
                                             @RequestParam(required = false) Double latitude,
                                             @RequestParam(required = false) Double longitude,
                                             @RequestParam String location,
                                             @RequestParam String availabilityFrom,
                                             @RequestParam String availabilityTo,
                                             @RequestParam(required = false) MultipartFile image,
                                             HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();

        try {
            Equipment equipment = equipmentService.getEquipmentById(equipmentId)
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));

            equipment.setName(name);
            equipment.setCategory(category);
            equipment.setDescription(description);
            equipment.setPricePerHour(pricePerHour);
            equipment.setPricePerDay(pricePerDay);
            equipment.setPricePerWeek(pricePerWeek);
            equipment.setLocation(location);
            
            if (latitude != null && longitude != null) {
                equipment.setCoordinates(new double[]{longitude, latitude});
            }
            
            equipment.setAvailabilityFrom(LocalDate.parse(availabilityFrom));
            equipment.setAvailabilityTo(LocalDate.parse(availabilityTo));

            if (image != null && !image.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                java.nio.file.Path uploadPath = java.nio.file.Paths.get("uploads/equipment/");
                java.nio.file.Files.createDirectories(uploadPath);
                java.nio.file.Files.write(uploadPath.resolve(fileName), image.getBytes());
                equipment.setImageUrl("/images/uploads/" + fileName);
            }

            Equipment updated = equipmentService.updateEquipment(equipment);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings(HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId, HttpSession session) {
        if (!isAdmin(session)) return ResponseEntity.status(403).build();
        try {
            bookingService.rejectBooking(bookingId); // reusable logic
            return ResponseEntity.ok(Map.of("message", "Booking cancelled by admin"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
