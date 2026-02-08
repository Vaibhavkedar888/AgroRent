package com.farming.rental.service;

import com.farming.rental.entity.User;
import com.farming.rental.dto.UserRegistrationDTO;
import com.farming.rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service for User management
 * Handles user registration, profile updates, and admin operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    /**
     * Register new user
     */
    public User registerUser(UserRegistrationDTO registrationDTO) {
        log.info("Registering new user: {}", registrationDTO.getPhoneNumber());
        
        // Check if user already exists
        if (userRepository.findByPhoneNumber(registrationDTO.getPhoneNumber()).isPresent()) {
            throw new RuntimeException("User with this phone number already exists");
        }
        
        User user = new User();
        user.setPhoneNumber(registrationDTO.getPhoneNumber());
        user.setFullName(registrationDTO.getFullName());
        user.setEmail(registrationDTO.getEmail());
        user.setRole(User.UserRole.valueOf(registrationDTO.getRole()));
        user.setAddress(registrationDTO.getAddress());
        user.setCity(registrationDTO.getCity());
        user.setState(registrationDTO.getState());
        user.setPincode(registrationDTO.getPincode());
        user.setIsActive(true);
        user.setIsBlocked(false);
        
        return userRepository.save(user);
    }

    /**
     * Get user by phone number
     */
    public Optional<User> getUserByPhoneNumber(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber);
    }

    /**
     * Get user by ID
     */
    /**
     * Get user by ID
     */
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Update user profile
     */
    public User updateUserProfile(User user) {
        log.info("Updating user profile: {}", user.getId());
        return userRepository.save(user);
    }

    /**
     * Block user (Admin only)
     */
    public User blockUser(String userId) {
        log.info("Blocking user: {}", userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(true);
        return userRepository.save(user);
    }

    /**
     * Unblock user (Admin only)
     */
    public User unblockUser(String userId) {
        log.info("Unblocking user: {}", userId);
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsBlocked(false);
        return userRepository.save(user);
    }

    /**
     * Get all farmers
     */
    public List<User> getAllFarmers() {
        return userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.UserRole.FARMER)
            .toList();
    }

    /**
     * Get all equipment owners
     */
    public List<User> getAllOwners() {
        return userRepository.findAll().stream()
            .filter(u -> u.getRole() == User.UserRole.OWNER)
            .toList();
    }

    /**
     * Get all users
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
