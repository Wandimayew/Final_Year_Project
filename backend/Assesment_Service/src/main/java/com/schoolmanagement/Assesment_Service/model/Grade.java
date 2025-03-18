package com.schoolmanagement.Assesment_Service.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "grade")
@Data
public class Grade {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long gradeId;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String schoolId;

    @ManyToOne
    @JoinColumn(name = "assessment_id", nullable = false)
    private Assessment assessment;

    @ManyToOne 
    @JoinColumn(name = "progress_tracker_id", nullable = false) 
    private ProgressTracker progressTracker;

    @Column(nullable = false)
    private Double percentage;

    @Column
    private String remarks;

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