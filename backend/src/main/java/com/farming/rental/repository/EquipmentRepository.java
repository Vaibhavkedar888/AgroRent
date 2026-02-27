package com.farming.rental.repository;

import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Equipment entity
 * Provides database operations for Equipment
 */
@Repository
public interface EquipmentRepository extends MongoRepository<Equipment, String> {
    List<Equipment> findByOwner(User owner);
    List<Equipment> findByCategory(String category);
    List<Equipment> findByIsAvailableAndIsApprovedTrue(Boolean isAvailable);
    
    List<Equipment> findByCoordinatesNear(Point point);
    
    @Query("{ 'category' : ?0, 'isApproved' : true, 'isAvailable' : true }")
    List<Equipment> findAvailableByCategory(String category);
}
