package com.farming.rental.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    private String id;

    @Field("booking_id")
    private String bookingId;

    @DBRef
    @Field("sender_id")
    private User sender;

    @DBRef
    @Field("receiver_id")
    private User receiver;

    private String content;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("is_read")
    private Boolean isRead = false;
}
