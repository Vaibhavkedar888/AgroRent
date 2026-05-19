package com.farming.rental.service;

import com.farming.rental.entity.Scheme;
import com.farming.rental.repository.SchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
@RequiredArgsConstructor
public class SchemeService {

    private final SchemeRepository schemeRepository;

    @Cacheable(value = "schemes")
    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public Optional<Scheme> getSchemeById(String id) {
        return schemeRepository.findById(id);
    }

    @Cacheable(value = "schemes")
    public List<Scheme> getSchemesByCategory(String category) {
        return schemeRepository.findByCategory(category);
    }

    @CacheEvict(value = "schemes", allEntries = true)
    public Scheme saveScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    @CacheEvict(value = "schemes", allEntries = true)
    public void deleteScheme(String id) {
        schemeRepository.deleteById(id);
    }
}
