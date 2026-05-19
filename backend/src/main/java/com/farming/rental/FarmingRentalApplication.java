package com.farming.rental;

/**
 * Backend By the Vaibhav Kedar
 */
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableMongoAuditing
@EnableScheduling
@EnableCaching
public class FarmingRentalApplication {

    public static void main(String[] args) {
        SpringApplication.run(FarmingRentalApplication.class, args);
    }
}
