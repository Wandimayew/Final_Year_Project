package com.schoolmanagement.tenant_service.model;

import java.util.ArrayList;
import java.util.List;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
@Table(name = "school")
@Entity
public class School {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long school_id;

    @Column(nullable = false)
    @NotBlank(message = "School Name must not be null or empty")
    private String school_name;

    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    // @JsonManagedReference // This breaks the bidirectional loop by serializing this side of the
    //                       // relationship
    private List<Address> addresses;

    @Column(nullable = false)
    @NotBlank(message = "Contact Number must not be null or empty")
    private String contact_number;

    @Column(nullable = false)
    @NotBlank(message = "Email Address must not be null or empty")
    @Email(message = "Invalid email format")
    private String email_address;

    @Column(nullable = false)
    @NotBlank(message = "School Type must not be null or empty")
    private String school_type;

    @Column(nullable = false)
    private LocalDate establishment_date;

    @Column(nullable = false)
    @NotBlank(message = "Status must not be null or empty")
    private String status;

    @Column(nullable = false, updatable = false)
    private LocalDateTime created_at;

    @Column(nullable = false)
    private LocalDateTime updated_at;

    @Column(nullable = false)
    private String created_by;

    @Column(nullable = false)
    private String school_information;

    private boolean isActive;

    @Lob
    @Column(columnDefinition = "BLOB")
    private String logo;

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    // One-to-Many relationship with SchoolSubscriptions
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<School_subscriptions> subscriptions = new ArrayList<>();
}