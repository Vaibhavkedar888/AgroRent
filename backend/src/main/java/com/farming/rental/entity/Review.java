package com.farming.rental.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Review Entity - User reviews and ratings for equipment
 */
@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    private String id;

    @DBRef
    @Field("equipment_id")
    private Equipment equipment;

    @DBRef
    @Field("farmer_id")
    private User farmer;

    private Integer rating; // 1-5 stars

    private String comment;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    /**
     * Validate rating is within 1-5 range
     */
    public boolean isValidRating() {
        return rating != null && rating >= 1 && rating <= 5;
    }
}
