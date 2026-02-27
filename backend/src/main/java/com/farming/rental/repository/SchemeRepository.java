package com.farming.rental.repository;

import com.farming.rental.entity.Scheme;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemeRepository extends MongoRepository<Scheme, String> {
    List<Scheme> findByCategory(String category);
}
