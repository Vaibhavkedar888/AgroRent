package com.farming.rental.repository;

import com.farming.rental.entity.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    List<Message> findByBookingIdOrderByCreatedAtAsc(String bookingId);
}
