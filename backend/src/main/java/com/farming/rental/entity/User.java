package com.farming.rental.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * User Entity - Represents farmers, equipment owners, and admins
 */
@Document(collection = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("phone_number")
    private String phoneNumber;

    @Field("full_name")
    private String fullName;

    @Indexed(unique = true)
    private String email;

    private String password; // Only for non-OTP login

    @Indexed
    private UserRole role; // FARMER, OWNER, ADMIN

    private String address;

    private String city;

    private String state;

    private String pincode;

    @Field("profile_image")
    private String profileImage;

    @Field("is_active")
    private Boolean isActive = true;

    @Field("is_blocked")
    private Boolean isBlocked = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // Enum for User Roles
    public enum UserRole {
        FARMER,
        OWNER,
        ADMIN
    }
}
