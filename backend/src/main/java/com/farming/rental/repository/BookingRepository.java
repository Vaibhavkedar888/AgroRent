package com.farming.rental.repository;

import com.farming.rental.entity.Booking;
import com.farming.rental.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository for Booking entity
 * Provides database operations for Bookings
 */
@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByFarmer(User farmer);
    
    // In Mongo, we can't easily join deep properties like Equipment.Owner
    // We might need to handle this in service by fetching Equipment first, or rely on DBRef resolution if eager.
    // However, spring data mongo *can* support property traversal if DBRefs are set up correctly, 
    // but findByEquipment_Owner might be tricky if Owner is also a DBRef.
    // Strategy: We will fetch bookings by Equipment list in service layer for Owner dashboard.
    // For now, let's keep it and see if it works (often it doesn't without aggregation).
    // ALTERNATIVE: `findByEquipmentIdIn(List<String> equipmentIds)`
    
    // List<Booking> findByEquipment_Owner(User owner); // Commented out - likely unsafe
    
    List<Booking> findByEquipment(com.farming.rental.entity.Equipment equipment);
    
    // Check for conflicts: start <= end AND end >= start
    // Status != CANCELLED
    @Query("{ 'equipment.$id' : ?0, 'startDate' : { $lte: ?2 }, 'endDate' : { $gte: ?1 }, 'status' : { $ne: 'CANCELLED' } }")
    List<Booking> findConflictingBookings(
        String equipmentId,
        LocalDate startDate,
        LocalDate endDate
    );
    
    List<Booking> findByStatus(Booking.BookingStatus status);
}
