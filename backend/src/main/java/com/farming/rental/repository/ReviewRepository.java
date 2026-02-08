package com.farming.rental.repository;

import com.farming.rental.entity.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Review entity
 */
@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByEquipmentId(String equipmentId);
}
