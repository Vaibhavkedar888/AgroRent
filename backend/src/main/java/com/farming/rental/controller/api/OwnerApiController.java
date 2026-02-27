package com.farming.rental.controller.api;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import com.farming.rental.service.BookingService;
import com.farming.rental.service.EquipmentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@Slf4j
public class OwnerApiController {

    private final EquipmentService equipmentService;
    private final BookingService bookingService;
    private static final String UPLOAD_DIR = "uploads/equipment/";

    private boolean isOwner(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        return user != null && user.getRole() == User.UserRole.OWNER;
    }

    @PostMapping("/equipment")
    public ResponseEntity<?> addEquipment(@RequestParam String name,
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
        if (!isOwner(session)) return ResponseEntity.status(403).build();

        try {
            User owner = (User) session.getAttribute("loggedInUser");
            Equipment equipment = new Equipment();
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
            equipment.setOwner(owner);

            if (image != null && !image.isEmpty()) {
                String fileName = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                Path uploadPath = Paths.get(UPLOAD_DIR);
                Files.createDirectories(uploadPath);
                Files.write(uploadPath.resolve(fileName), image.getBytes());
                equipment.setImageUrl("/images/uploads/" + fileName);
            }

            Equipment saved = equipmentService.addEquipment(equipment);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
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
        if (!isOwner(session)) return ResponseEntity.status(403).build();

        try {
            User owner = (User) session.getAttribute("loggedInUser");
            Equipment equipment = equipmentService.getEquipmentById(equipmentId)
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));

            if (!equipment.getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not own this equipment"));
            }

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
                Path uploadPath = Paths.get(UPLOAD_DIR);
                Files.createDirectories(uploadPath);
                Files.write(uploadPath.resolve(fileName), image.getBytes());
                equipment.setImageUrl("/images/uploads/" + fileName);
            }

            Equipment updated = equipmentService.updateEquipment(equipment);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/equipment/{equipmentId}")
    public ResponseEntity<?> deleteEquipment(@PathVariable String equipmentId, HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();

        try {
            User owner = (User) session.getAttribute("loggedInUser");
            Equipment equipment = equipmentService.getEquipmentById(equipmentId)
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));

            if (!equipment.getOwner().getId().equals(owner.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "You do not own this equipment"));
            }

            equipmentService.deleteEquipment(equipmentId);
            return ResponseEntity.ok(Map.of("message", "Equipment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();

        User owner = (User) session.getAttribute("loggedInUser");
        List<Equipment> equipment = equipmentService.getOwnerEquipment(owner);
        List<Booking> bookings = bookingService.getOwnerBookings(owner);

        // Calculate total earnings
        BigDecimal totalEarnings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.COMPLETED 
                    || b.getStatus() == Booking.BookingStatus.CONFIRMED)
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = Map.of(
            "totalEarnings", totalEarnings,
            "equipmentCount", equipment.size(),
            "bookings", bookings,
            "equipment", equipment
        );

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/bookings/{bookingId}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable String bookingId, HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();
        try {
            return ResponseEntity.ok(bookingService.approveBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable String bookingId, HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();
        try {
            return ResponseEntity.ok(bookingService.rejectBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/complete")
    public ResponseEntity<?> completeBooking(@PathVariable String bookingId, HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();
        try {
            return ResponseEntity.ok(bookingService.completeBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bookings/{bookingId}/cancel")
    public ResponseEntity<?> ownerCancelBooking(@PathVariable String bookingId, HttpSession session) {
        if (!isOwner(session)) return ResponseEntity.status(403).build();
        try {
            // Reusing reject logic or direct cancel
            return ResponseEntity.ok(bookingService.rejectBooking(bookingId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
