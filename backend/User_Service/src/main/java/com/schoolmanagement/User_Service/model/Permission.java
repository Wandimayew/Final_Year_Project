package com.schoolmanagement.User_Service.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "permission")
@Data
@NoArgsConstructor
public class Permission {
    // Existing fields remain unchanged
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id", updatable = false, nullable = false)
    private Long permissionId;

    @NotNull(message = "School ID cannot be null")
    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @NotBlank(message = "Permission name cannot be blank")
    @Size(max = 50, message = "Permission name cannot exceed 50 characters")
    @Column(nullable = false)
    private String name;

    @Column(nullable = true)
    private String endpoint;

    @Column(nullable = true)
    private String httpMethod;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean is_active;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by cannot be blank")
    @Column(nullable = false, name = "created_by")
    private String createdBy;

    @Column(nullable = true, name = "updated_by")
    private String updatedBy;

}
