package com.schoolmanagement.User_Service.model;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "permission")
@Getter
@Setter
@NoArgsConstructor
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id", updatable = false, nullable = false)
    private Long permissionId;

    @NotNull(message = "School ID cannot be null")
    @Column(name = "school_id", nullable = false)
    private String schoolId;

    @NotBlank(message = "Permission name cannot be blank")
    @Size(max = 50, message = "Permission name cannot exceed 50 characters")
    @Column(unique = true, nullable = false)
    private String name;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;

     @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by cannot be blank")
    private String createdBy;
}
