package com.schoolmanagement.Assesment_Service.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "report_card")
@Data
public class ReportCard {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportCardId;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String schoolId;

    @Column(nullable = false)
    private Long streamId;

    @Column(nullable = false)
    private Long classId;

    @Column(nullable = false)
    private Long sectionId;

    @ManyToMany
    @JoinTable(
        name = "report_card_assessments",
        joinColumns = @JoinColumn(name = "report_card_id"),
        inverseJoinColumns = @JoinColumn(name = "assessment_id")
    )
    private List<Assessment> assessments;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "analytics_id")
    private AssessmentAnalytics analytics;

    @Column(nullable = false)
    private Double totalMarksFirstSemester;

    @Column(nullable = false)
    private Double totalMarksSecondSemester;

    @Column(nullable = false)
    private Double averageGradeFirstSemester;

    @Column(nullable = false)
    private Double averageGradeSecondSemester;

    @Column(nullable = false)
    private String firstSemesterStatus; 

    @Column(nullable = false)
    private String secondSemesterStatus;

    @Column(nullable = false)
    private String overallStatus;

    private String academicYear;

    @Column
    private String remarks;

    @Column(nullable = false)
    private Boolean isActive;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

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