package com.farming.rental.config;

import com.farming.rental.entity.Equipment;
import com.farming.rental.entity.User;
import com.farming.rental.repository.EquipmentRepository;
import com.farming.rental.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final EquipmentRepository equipmentRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            log.info("Seeding data...");
            seedUsersAndEquipment();
        }
    }

    private void seedUsersAndEquipment() {
        // Create Farmer
        User farmer = new User();
        farmer.setPhoneNumber("9876543210");
        farmer.setFullName("Ramesh Farmer");
        farmer.setEmail("ramesh@farmer.com");
        farmer.setRole(User.UserRole.FARMER);
        farmer.setCity("Pune");
        farmer.setState("Maharashtra");
        farmer.setIsActive(true);
        userRepository.save(farmer);

        // Create Owner
        User owner = new User();
        owner.setPhoneNumber("9111111111");
        owner.setFullName("Suresh Owner");
        owner.setEmail("suresh@owner.com");
        owner.setRole(User.UserRole.OWNER);
        owner.setCity("Nashik");
        owner.setState("Maharashtra");
        owner.setIsActive(true);
        userRepository.save(owner);

        // Create Admin
        User admin = new User();
        admin.setPhoneNumber("9000000000");
        admin.setFullName("Admin User");
        admin.setRole(User.UserRole.ADMIN);
        admin.setIsActive(true);
        userRepository.save(admin);

        // Create Equipment
        Equipment tractor = new Equipment();
        tractor.setName("Mahindra 575 DI");
        tractor.setCategory("Tractor");
        tractor.setDescription("45 HP Tractor, good condition");
        tractor.setPricePerDay(BigDecimal.valueOf(1500));
        tractor.setOwner(owner);
        tractor.setIsAvailable(true);
        tractor.setIsApproved(true);
        tractor.setAvailabilityFrom(LocalDate.now());
        tractor.setAvailabilityTo(LocalDate.now().plusMonths(3));
        tractor.setLocation("Nashik");
        equipmentRepository.save(tractor);

        Equipment harvester = new Equipment();
        harvester.setName("Kubota Harvester");
        harvester.setCategory("Harvester");
        harvester.setDescription("Combined harvester for rice and wheat");
        harvester.setPricePerDay(BigDecimal.valueOf(5000));
        harvester.setOwner(owner);
        harvester.setIsAvailable(true);
        harvester.setIsApproved(true);
        harvester.setAvailabilityFrom(LocalDate.now());
        harvester.setAvailabilityTo(LocalDate.now().plusMonths(2));
        harvester.setLocation("Nashik");
        equipmentRepository.save(harvester);

        log.info("Data seeding completed.");
    }
}
