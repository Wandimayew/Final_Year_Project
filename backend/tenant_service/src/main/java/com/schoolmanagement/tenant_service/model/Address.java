package com.schoolmanagement.tenant_service.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;

@Data
@Table(name = "address")
@Entity
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long address_id;

    @Column(nullable = false)
    @NotBlank(message = "Address Line must not be null or empty")
    private String address_line;

    @Column(nullable = false)
    @NotBlank(message = "City must not be null or empty")
    private String city;

    @Column(nullable = false)
    @NotBlank(message = "Country must not be null or empty")
    private String Country;

    @Column(nullable = false)
    @NotBlank(message = "Zone must not be null or empty")
    private String zone;

    @Column(nullable = false)
    @NotBlank(message = "Region must not be null or empty")
    private String region;

    @ManyToOne
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(nullable = true)
    private LocalDateTime updated_at;

    @Column(nullable = false)
    private String created_by;

    @Column(nullable = false)
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

    public String getFormattedCreatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return created_at.format(formatter);
    }
    public String getFormattedUpdatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return updated_at.format(formatter);
    }

}
