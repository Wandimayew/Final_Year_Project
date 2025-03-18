package com.schoolmanagement.Assesment_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "assessment_analytics")
@Data
public class AssessmentAnalytics {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long assessmentAnalyticsId;

    @NotNull(message = "School ID cannot be null")
    private String schoolId;

    @NotNull(message = "Student ID cannot be null")
    private String studentId; // Added to store the student context

    @OneToMany(mappedBy = "analytics", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Assessment> assessments; 

    private Double averageMarks;

    private Double highestMarks;

    private Double lowestMarks;

    private Double totalMarks;

    private Double passPercentage;

    private Double failPercentage;

    private String semester;
    
    @Column(name = "rank_column")
    private Long rank;

    private String status;

    private String remarks;

    private boolean isActive;

    private LocalDateTime createdAt;

    private String createdBy;

    private LocalDateTime updatedAt;
    
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