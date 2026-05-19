package com.farming.rental.service;

import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import com.farming.rental.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.geo.Point;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

/**
 * Service for Equipment management
 * Handles CRUD operations and equipment-related business logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;

    /**
     * Get all available equipment
     */
    @Cacheable(value = "equipmentList")
    public List<Equipment> getAvailableEquipment() {
        return equipmentRepository.findByIsAvailableAndIsApprovedTrueOrderByCreatedAtDesc(true);
    }

    public List<Equipment> getNearestEquipment(double lat, double lng) {
        log.info("Fetching nearest equipment to [{}, {}]", lat, lng);
        return equipmentRepository.findByCoordinatesNear(new Point(lng, lat));
    }

    /**
     * Get equipment by category
     */
    @Cacheable(value = "equipmentList")
    public List<Equipment> getEquipmentByCategory(String category) {
        return equipmentRepository.findAvailableByCategoryOrderByCreatedAtDesc(category);
    }

    /**
     * Get equipment by ID
     */
    public Optional<Equipment> getEquipmentById(String id) {
        return equipmentRepository.findById(id);
    }

    /**
     * Get all equipment of an owner
     */
    public List<Equipment> getOwnerEquipment(User owner) {
        return equipmentRepository.findByOwner(owner);
    }

    /**
     * Add new equipment
     */
    @CacheEvict(value = "equipmentList", allEntries = true)
    public Equipment addEquipment(Equipment equipment) {
        log.info("Adding new equipment: {}", equipment.getName());
        equipment.setIsApproved(false); // Requires admin approval
        equipment.setTotalBookings(0);
        return equipmentRepository.save(equipment);
    }

    /**
     * Update equipment
     */
    @CacheEvict(value = "equipmentList", allEntries = true)
    public Equipment updateEquipment(Equipment equipment) {
        log.info("Updating equipment: {}", equipment.getId());
        return equipmentRepository.save(equipment);
    }

    /**
     * Delete equipment
     */
    @CacheEvict(value = "equipmentList", allEntries = true)
    public void deleteEquipment(String id) {
        log.info("Deleting equipment: {}", id);
        equipmentRepository.deleteById(id);
    }

    /**
     * Approve equipment (Admin only)
     */
    @CacheEvict(value = "equipmentList", allEntries = true)
    public Equipment approveEquipment(String id) {
        log.info("Approving equipment: {}", id);
        Equipment equipment = equipmentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Equipment not found"));
        equipment.setIsApproved(true);
        return equipmentRepository.save(equipment);
    }

    /**
     * Check if equipment is available for given date range
     */
    public boolean isAvailableForDateRange(String equipmentId, LocalDate startDate, LocalDate endDate) {
        Optional<Equipment> equipment = equipmentRepository.findById(equipmentId);
        if (equipment.isEmpty()) {
            return false;
        }
        return equipment.get().canBeBooked(startDate, endDate);
    }

    /**
     * Get all equipment (Admin only)
     */
    @Cacheable(value = "equipmentList")
    public List<Equipment> getAllEquipment() {
        return equipmentRepository.findAll();
    }
}
