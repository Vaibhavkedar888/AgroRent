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
    private final InvoiceService invoiceService;
    private final EmailService emailService;

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
                booking.getEndDate());

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
        List<Equipment> equipmentList = equipmentService.getOwnerEquipment(owner);
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
        Booking saved = bookingRepository.save(booking);

        // Generate and send Invoice
        try {
            byte[] pdfBytes = invoiceService.generateInvoicePdf(saved);
            String subject = "AgroRent Booking Approved: " + saved.getEquipment().getName();
            String body = "Dear " + saved.getFarmer().getFullName() + ",\n\n" +
                    "Your booking request for " + saved.getEquipment().getName() + " has been APPROVED by the owner.\n"
                    +
                    "Please find the attached invoice for your reference.\n\n" +
                    "Happy Farming!\nTeam AgroRent";

            emailService.sendEmailWithAttachment(
                    saved.getFarmer().getEmail(),
                    subject,
                    body,
                    pdfBytes,
                    "Invoice_" + saved.getId().substring(0, 8) + ".pdf");
            log.info("Invoice email sent for booking: {}", bookingId);
        } catch (Exception e) {
            log.error("Failed to send invoice email for booking: {}", bookingId, e);
            // We don't fail the approval if email fails, but we log it
        }

        return saved;
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
