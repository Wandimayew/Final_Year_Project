package com.schoolmanagement.Assesment_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assessment")
@Data
public class Assessment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assessmentId;

    @NotNull(message = "School ID cannot be null")
    private String schoolId;

    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotNull(message = "Stream ID cannot be null")
    private Long streamId;

    @NotNull(message = "Section ID cannot be null")
    private Long sectionId;

    @NotNull(message = "Subject ID cannot be null")
    private Long subjectId;

    @NotNull(message = "Student ID cannot be null")
    private String studentId;

    @Column(nullable = false)
    private String assessmentName;

    @Column(nullable = false)
    private LocalDateTime assessmentDate;

    private Double score;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String status;

    private String semester;
    
    @ManyToOne
    @JoinColumn(name = "analytics_id")
    private AssessmentAnalytics analytics;

    @OneToOne(mappedBy = "assessment", cascade = CascadeType.ALL)
    private ProgressTracker progressTracker;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private String createdBy;

    @Column
    private LocalDateTime updatedAt;

    @Column
    private String updatedBy;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        isActive = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}