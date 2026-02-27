package com.farming.rental.service;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.Review;
import com.farming.rental.entity.User;
import com.farming.rental.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingService bookingService;

    public Review addReview(Review review) {
        log.info("Adding review for equipment: {} by farmer: {}", 
            review.getEquipment().getId(), review.getFarmer().getId());
        
        if (!review.isValidRating()) {
            throw new RuntimeException("Invalid rating. Must be between 1 and 5.");
        }

        // Check if farmer has a completed booking for this equipment
        List<Booking> bookings = bookingService.getFarmerBookings(review.getFarmer());
        boolean hasCompletedBooking = bookings.stream()
            .anyMatch(b -> b.getEquipment().getId().equals(review.getEquipment().getId()) 
                        && b.getStatus() == Booking.BookingStatus.COMPLETED);

        if (!hasCompletedBooking) {
            throw new RuntimeException("You can only review equipment you have successfully rented and returned.");
        }

        review.setCreatedAt(LocalDateTime.now());
        return reviewRepository.save(review);
    }

    public List<Review> getEquipmentReviews(String equipmentId) {
        return reviewRepository.findByEquipmentId(equipmentId);
    }

    public void deleteReview(String reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}
