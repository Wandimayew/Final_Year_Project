package com.schoolmanagement.communication_service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;

@Entity
@Table(name = "attachments")
@Data
@Builder
@NoArgsConstructor // Added for Hibernate
@AllArgsConstructor // Optional, keeps builder compatibility
public class Attachment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attachment_id", updatable = false, nullable = false)
    private String attachmentId; // Using String for UUID

    @NotBlank(message = "School ID cannot be blank")
    @Column(name = "school_id", nullable = false)
    private String schoolId; // Multi-tenancy support

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "email_id", nullable = false)
    private EmailMessage emailMessage;

    @NotBlank(message = "File name cannot be blank")
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotBlank(message = "File path cannot be blank")
    @Column(name = "file_path", nullable = false)
    private String filePath; // Path to the file (e.g., S3 URL or local path)

    @NotBlank(message = "File type cannot be blank")
    @Column(name = "file_type", nullable = false)
    private String fileType; // e.g., "application/pdf"

    @NotNull(message = "File size cannot be null")
    @Column(name = "file_size", nullable = false)
    private Long fileSize; // Size in bytes

    @NotNull(message = "isActive cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @NotBlank(message = "The Person that who create this cannot be blank")
    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

}