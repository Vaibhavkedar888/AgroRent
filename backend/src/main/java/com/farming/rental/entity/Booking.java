package com.farming.rental.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/**
 * Booking Entity - Represents equipment rental bookings
 * Links Farmers with Equipment
 */
@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    private String id;

    @DBRef
    @Field("farmer_id")
    private User farmer; // Farmer who booked the equipment

    @DBRef
    @Field("equipment_id")
    private Equipment equipment; // Equipment being booked

    @Field("booking_date")
    private LocalDate bookingDate = LocalDate.now();

    @Field("start_date")
    private LocalDate startDate; // For daily/weekly

    @Field("end_date")
    private LocalDate endDate; // For daily/weekly

    @Field("start_time")
    private LocalDateTime startTime; // For hourly

    @Field("end_time")
    private LocalDateTime endTime; // For hourly

    @Field("rental_type")
    private RentalType rentalType = RentalType.DAILY;

    @Field("farmer_coordinates")
    private double[] farmerCoordinates; // [longitude, latitude]

    public enum RentalType {
        HOURLY, DAILY, WEEKLY
    }

    @Field("total_duration")
    private Integer totalDuration; // hours, days, or weeks based on type

    @Field("price_per_day")
    private BigDecimal pricePerDay;

    @Field("total_amount")
    private BigDecimal totalAmount;

    @Indexed
    private BookingStatus status = BookingStatus.PENDING;

    private String notes;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // Enums for booking status
    public enum BookingStatus {
        PENDING,      // Waiting for owner approval
        CONFIRMED,    // Approved by owner
        CANCELLED,    // Cancelled by farmer or owner
        COMPLETED     // Rental period completed
    }

    /**
     * Calculate total days between start and end date
     */
    public void calculateTotalDays() {
        if (startDate != null && endDate != null) {
            this.totalDuration = (int) ChronoUnit.DAYS.between(startDate, endDate) + 1; // Inclusive
        }
    }

    /**
     * Calculate total amount based on price and duration
     */
    public void calculateTotalAmount() {
        if (pricePerDay != null && totalDuration != null) {
            this.totalAmount = pricePerDay.multiply(BigDecimal.valueOf(totalDuration));
        }
    }

    // Mongo does not support @PrePersist in the same way as JPA.
    // Logic should be handled in Service before saving.
    // Or use EventListeners. For simplicity, we'll ensure Service calls these methods.

    /**
     * Check if booking can be cancelled
     */
    public boolean canBeCancelled() {
        return (status == BookingStatus.PENDING || status == BookingStatus.CONFIRMED) &&
               startDate.isAfter(LocalDate.now());
    }
}
