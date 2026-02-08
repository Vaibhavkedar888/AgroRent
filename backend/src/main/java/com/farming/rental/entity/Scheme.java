package com.farming.rental.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "schemes")
public class Scheme {
    @Id
    private String id;
    private String title;
    private String description;
    private String category;
    private String benefits;
    private String eligibility;
    private String applyLink;
}
