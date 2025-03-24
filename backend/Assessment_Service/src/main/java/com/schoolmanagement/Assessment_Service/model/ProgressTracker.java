package com.schoolmanagement.Assessment_Service.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "progress_tracker")
@Data
public class ProgressTracker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long progressTrackerId;

    @Column(nullable = false)
    private String schoolId;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private Long streamId;

    @Column(nullable = false)
    private Long sectionId;

    @Column(nullable = false)
    private Long classId;

    @Column(nullable = false)
    private Long subjectId;

    @OneToOne
    @JoinColumn(name = "assessment_id", nullable = false, unique = true)
    private Assessment assessment;

    @OneToMany(mappedBy = "progressTracker", cascade = CascadeType.ALL) // Fixed mapping
    private List<Grade> grades;

    @Column(nullable = false)
    private Double averageMarks;

    @Column(nullable = false)
    private String progressStatus;

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