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

/**
 * Equipment Entity - Represents farm equipment available for rental
 * Linked to Equipment Owner (User with OWNER role)
 */
@Document(collection = "equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    private String id;

    @DBRef
    @Field("owner_id")
    private User owner; // Reference to Equipment Owner (User)

    @Indexed
    private String name;

    @Indexed
    private String category; // Tractors, Harvesters, Pumps, etc.

    private String description;

    @Field("price_per_hour")
    private BigDecimal pricePerHour;

    @Field("price_per_day")
    private BigDecimal pricePerDay;

    @Field("price_per_week")
    private BigDecimal pricePerWeek;

    @org.springframework.data.mongodb.core.index.GeoSpatialIndexed(type = org.springframework.data.mongodb.core.index.GeoSpatialIndexType.GEO_2DSPHERE)
    private double[] coordinates; // [longitude, latitude] for geospatial search

    @Field("image_url")
    private String imageUrl; // Path to equipment image

    @Indexed
    @Field("is_available")
    private Boolean isAvailable = true;

    @Field("availability_from")
    private LocalDate availabilityFrom;

    @Field("availability_to")
    private LocalDate availabilityTo;

    private String location; // Equipment location

    private BigDecimal rating = BigDecimal.ZERO; // Average rating

    @Field("total_bookings")
    private Integer totalBookings = 0;

    @Field("is_approved")
    private Boolean isApproved = false; // Admin approval for new equipment

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    /**
     * Check if equipment is available for booking
     */
    public boolean canBeBooked(LocalDate startDate, LocalDate endDate) {
        return isAvailable && isApproved &&
                !startDate.isBefore(availabilityFrom) &&
                !endDate.isAfter(availabilityTo);
    }
}
