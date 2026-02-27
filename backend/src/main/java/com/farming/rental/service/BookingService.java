package com.farming.rental.service;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import com.farming.rental.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for Booking management
 * Handles booking creation, confirmation, and cancellation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentService equipmentService;

    /**
     * Create new booking
     */
    public Booking createBooking(Booking booking) {
        log.info("Creating booking for farmer: {} equipment: {}", 
            booking.getFarmer().getId(), booking.getEquipment().getId());
        
        // Check for conflicting bookings
        List<Booking> conflicts = bookingRepository.findConflictingBookings(
            booking.getEquipment().getId(),
            booking.getStartDate(),
            booking.getEndDate()
        );
        
        if (!conflicts.isEmpty()) {
            throw new RuntimeException("Equipment not available for selected dates");
        }
        
        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setBookingDate(LocalDate.now());
        
        return bookingRepository.save(booking);
    }

    /**
     * Get booking by ID
     */
    public Optional<Booking> getBookingById(String id) {
        return bookingRepository.findById(id);
    }

    /**
     * Get all bookings of a farmer
     */
    public List<Booking> getFarmerBookings(User farmer) {
        return bookingRepository.findByFarmer(farmer);
    }

    /**
     * Get all bookings for an owner's equipment
     */
    public List<Booking> getOwnerBookings(User owner) {
        // In Mongo, deep traversal is hard.
        // We fetch all equipment for owner, then fetch bookings for those equipment.
        // OR we can use the repository method if we fix the query, but manual is safer here.
        List<Equipment> equipmentList = equipmentService.getOwnerEquipment(owner);
        // This is inefficient (N+1), but simple for now. 
        // Optimization: bookingRepository.findByEquipmentIn(equipmentList)
        // Since we don't have findByEquipmentIn yet, let's just stream/concat.
        
        return equipmentList.stream()
            .flatMap(eq -> bookingRepository.findByEquipment(eq).stream())
            .toList();
    }

    /**
     * Approve booking (Owner confirms rental)
     */
    public Booking approveBooking(String bookingId) {
        log.info("Approving booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        return bookingRepository.save(booking);
    }

    /**
     * Reject booking
     */
    public Booking rejectBooking(String bookingId) {
        log.info("Rejecting booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    /**
     * Cancel booking
     */
    public Booking cancelBooking(String bookingId) {
        log.info("Cancelling booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.canBeCancelled()) {
            throw new RuntimeException("Booking cannot be cancelled at this time");
        }
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    /**
     * Mark booking as completed
     */
    public Booking completeBooking(String bookingId) {
        log.info("Completing booking: {}", bookingId);
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(Booking.BookingStatus.COMPLETED);
        return bookingRepository.save(booking);
    }

    /**
     * Get all pending bookings
     */
    public List<Booking> getPendingBookings() {
        return bookingRepository.findByStatus(Booking.BookingStatus.PENDING);
    }

    /**
     * Get all bookings for a specific equipment
     */
    public List<Booking> getEquipmentBookings(Equipment equipment) {
        return bookingRepository.findByEquipment(equipment);
    }

    /**
     * Get all bookings (Admin)
     */
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
