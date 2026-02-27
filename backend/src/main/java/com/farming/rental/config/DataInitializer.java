package com.farming.rental.config;

import com.farming.rental.entity.Scheme;
import com.farming.rental.repository.SchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final SchemeRepository schemeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (schemeRepository.count() == 0) {
            Scheme s1 = new Scheme();
            s1.setTitle("PM Kisan Samman Nidhi");
            s1.setDescription("Financial assistance to small and marginal farmers.");
            s1.setCategory("Financial Support");
            s1.setBenefits("₹6000 per year in three installments.");
            s1.setEligibility("Small and marginal farmers with landholdings.");
            s1.setApplyLink("https://pmkisan.gov.in/");

            Scheme s2 = new Scheme();
            s2.setTitle("Pradhan Mantri Fasal Bima Yojana");
            s2.setDescription("Crop insurance scheme for farmers.");
            s2.setCategory("Insurance");
            s2.setBenefits("Insurance coverage and financial support in case of crop failure.");
            s2.setEligibility("All farmers including sharecroppers and tenant farmers.");
            s2.setApplyLink("https://pmfby.gov.in/");

            Scheme s3 = new Scheme();
            s3.setTitle("Sub-Mission on Agricultural Mechanization (SMAM)");
            s3.setDescription("Subsidy for purchasing farm machinery.");
            s3.setCategory("Mechanization");
            s3.setBenefits("40% to 50% subsidy on various farm equipment.");
            s3.setEligibility("Individual farmers, SHGs, and Co-operative Societies.");
            s3.setApplyLink("https://agrimachinery.nic.in/");

            schemeRepository.saveAll(List.of(s1, s2, s3));
        }
    }
}
