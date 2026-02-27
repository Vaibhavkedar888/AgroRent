package com.farming.rental.repository;

import com.farming.rental.entity.OTPVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for OTPVerification entity
 * Handles OTP storage and retrieval
 */
@Repository
public interface OTPVerificationRepository extends MongoRepository<OTPVerification, String> {
    Optional<OTPVerification> findByPhoneNumber(String phoneNumber);
}
