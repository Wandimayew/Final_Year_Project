package com.schoolmanagement.tenant_service.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "school_subscriptions")
@Data
public class School_subscriptions {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long subscription_id;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    // Many-to-One relationship with SubscriptionPlan
    @ManyToOne
    @JoinColumn(name = "plan_id", nullable = false)
    private Subscription_plans subscriptionPlan;

    @Column(nullable = false)
    private LocalDate start_date;

    @Column(nullable = false)
    private LocalDate end_date;

    @Column(nullable = false)
    private String status;

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
