package com.schoolmanagement.User_Service.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Entity
@Table(name = "permission_templates")
@Data
@AllArgsConstructor
@RequiredArgsConstructor
public class PermissionTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be blank")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    @NotBlank(message = "Endpoint cannot be blank")
    private String endpoint;

    @NotBlank(message = "HTTP method cannot be blank")
    private String httpMethod;

    @NotNull(message = "Is active cannot be null")
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @NotBlank(message = "Created by cannot be blank")
    private String createdBy;

    private String updatedBy;

    // Custom constructor for bootstrapper with default createdBy
    public PermissionTemplate(String name, String description, String endpoint, String httpMethod) {
        this.name = name;
        this.description = description;
        this.endpoint = endpoint;
        this.httpMethod = httpMethod;
        this.createdBy = "system"; // Default value to satisfy @NotBlank
    }

    // Optional: Constructor with explicit createdBy
    // public PermissionTemplate(String name, String description, String endpoint, String httpMethod, String createdBy) {
    //     this.name = name;
    //     this.description = description;
    //     this.endpoint = endpoint;
    //     this.httpMethod = httpMethod;
    //     this.createdBy = createdBy;
    // }
}