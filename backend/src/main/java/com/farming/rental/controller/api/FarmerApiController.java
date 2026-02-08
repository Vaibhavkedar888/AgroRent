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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
@Slf4j
public class FarmerApiController {

    private final BookingService bookingService;
    private final EquipmentService equipmentService;

    private boolean isFarmer(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        return user != null && user.getRole() == User.UserRole.FARMER;
    }

    @PostMapping("/booking")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload, HttpSession session) {
        if (!isFarmer(session)) return ResponseEntity.status(403).build();

        try {
            User farmer = (User) session.getAttribute("loggedInUser");
            String equipmentId = (String) payload.get("equipmentId");
            String startDateStr = (String) payload.get("startDate");
            String endDateStr = (String) payload.get("endDate");
            String startTimeStr = (String) payload.get("startTime");
            String endTimeStr = (String) payload.get("endTime");
            String rentalTypeStr = (String) payload.get("rentalType");
            List<Double> farmerCoords = (List<Double>) payload.get("farmerCoordinates");
            String notes = (String) payload.get("notes");

            Equipment equipment = equipmentService.getEquipmentById(equipmentId)
                    .orElseThrow(() -> new RuntimeException("Equipment not found"));

            Booking booking = new Booking();
            booking.setFarmer(farmer);
            booking.setEquipment(equipment);
            booking.setNotes(notes);
            
            if (farmerCoords != null && farmerCoords.size() == 2) {
                booking.setFarmerCoordinates(new double[]{farmerCoords.get(0), farmerCoords.get(1)});
            }

            Booking.RentalType type = Booking.RentalType.valueOf(rentalTypeStr != null ? rentalTypeStr : "DAILY");
            booking.setRentalType(type);

            BigDecimal totalAmount = BigDecimal.ZERO;
            if (type == Booking.RentalType.HOURLY) {
                booking.setStartDate(LocalDate.parse(startDateStr));
                java.time.LocalTime startT = java.time.LocalTime.parse(startTimeStr);
                java.time.LocalTime endT = java.time.LocalTime.parse(endTimeStr);
                booking.setStartTime(startT.atDate(booking.getStartDate()));
                booking.setEndTime(endT.atDate(booking.getStartDate()));
                
                long hours = java.time.Duration.between(booking.getStartTime(), booking.getEndTime()).toHours();
                if (hours <= 0) hours = 1; // Min 1 hour
                booking.setTotalDuration((int)hours);
                
                BigDecimal rate = equipment.getPricePerHour() != null ? equipment.getPricePerHour() : equipment.getPricePerDay().divide(BigDecimal.valueOf(8), 2, java.math.RoundingMode.HALF_UP);
                totalAmount = rate.multiply(BigDecimal.valueOf(hours));
            } else if (type == Booking.RentalType.DAILY) {
                LocalDate start = LocalDate.parse(startDateStr);
                LocalDate end = LocalDate.parse(endDateStr);
                booking.setStartDate(start);
                booking.setEndDate(end);
                
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, end);
                if (days <= 0) days = 1;
                booking.setTotalDuration((int)days);
                totalAmount = equipment.getPricePerDay().multiply(BigDecimal.valueOf(days));
            } else if (type == Booking.RentalType.WEEKLY) {
                LocalDate start = LocalDate.parse(startDateStr);
                LocalDate end = LocalDate.parse(endDateStr);
                booking.setStartDate(start);
                booking.setEndDate(end);
                
                long days = java.time.temporal.ChronoUnit.DAYS.between(start, end);
                long weeks = (long) Math.ceil(days / 7.0);
                if (weeks <= 0) weeks = 1;
                booking.setTotalDuration((int)weeks);
                
                BigDecimal rate = equipment.getPricePerWeek() != null ? equipment.getPricePerWeek() : equipment.getPricePerDay().multiply(BigDecimal.valueOf(6));
                totalAmount = rate.multiply(BigDecimal.valueOf(weeks));
            }

            booking.setTotalAmount(totalAmount);
            Booking saved = bookingService.createBooking(booking);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats(HttpSession session) {
        if (!isFarmer(session)) return ResponseEntity.status(403).build();
        User farmer = (User) session.getAttribute("loggedInUser");
        List<Booking> bookings = bookingService.getFarmerBookings(farmer);
        
        long activeBookings = bookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING || b.getStatus() == Booking.BookingStatus.CONFIRMED)
            .count();

        Map<String, Object> stats = Map.of(
            "activeBookings", activeBookings,
            "bookings", bookings
        );
        
        return ResponseEntity.ok(stats);
    }
}
