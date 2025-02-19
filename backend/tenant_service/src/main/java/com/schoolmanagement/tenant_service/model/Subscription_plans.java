package com.schoolmanagement.tenant_service.model;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Data;

@Data
@Table(name = "subscription_plans")
@Entity
public class Subscription_plans {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long plan_id;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Name must not be null or empty")
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, length = 50)
    @NotBlank(message = "Billing Cycle must not be null or empty")
    private String billing_cycle;

    @Column(columnDefinition = "JSON")
    private String featuresJson;

    // Other fields like name, price, etc.

    private static final ObjectMapper mapper = new ObjectMapper();

    // Custom getter for features
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFeatures() {
        if (featuresJson == null || featuresJson.isEmpty()) {
            return new HashMap<>(); // Return an empty map if the JSON is null or empty
        }
        try {
            // Deserialize JSON string to Map
            return mapper.readValue(featuresJson, Map.class);
        } catch (JsonProcessingException e) {
            // Handle deserialization error
            throw new RuntimeException("Failed to deserialize features", e);
        }
    }

    // Custom setter for features
    public void setFeatures(Map<String, Object> features) {
        try {
            // Serialize Map to JSON string
            this.featuresJson = mapper.writeValueAsString(features);
        } catch (JsonProcessingException e) {
            // Handle serialization error
            throw new RuntimeException("Failed to serialize features", e);
        }
    }

    // One-to-Many relationship with SchoolSubscription
    @OneToMany(mappedBy = "subscriptionPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<School_subscriptions> schoolSubscriptions;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(nullable = false)
    private LocalDateTime updated_at;

    @Column(nullable = false)
    private String created_by;

    private boolean isActive;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

}