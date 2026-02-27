package com.farming.rental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Main Spring Boot Application Class
 * Entry point for the Farming Equipment Rental System
 */
@SpringBootApplication
@EnableAsync
public class FarmingRentalApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmingRentalApplication.class, args);
    }
}
