package com.schoolmanagement.academic_service.model;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import javax.validation.constraints.NotBlank;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Entity
@Table(name = "timetable")
public class TimeTable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long timeTableId;

    @Column(nullable = false)
    @NotBlank(message = "School ID must not be null or empty")
    private String schoolId;

    @Column(nullable = false)
    @NotBlank(message = "Day of week must not be null or empty")
    private String dayOfWeek;

    @Column(nullable = false)
    @NotNull(message = "Start time must not be null")
    private LocalTime startTime;

    @Column(nullable = false)
    @NotNull(message = "End time must not be null")
    private LocalTime endTime;

    @OneToOne
    @JoinColumn(name = "sectionId", referencedColumnName = "sectionId", nullable = false)
    private Section section;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "subject_timeTable", joinColumns = @JoinColumn(name = "timeTableId"), inverseJoinColumns = @JoinColumn(name = "subjectId"))
    private List<Subject> subjects;

    // @OneToOne
    // @JoinColumn(name = "teacherId", referencedColumnName = "teacherId", nullable
    // = true)
    @Column(nullable = false)
    @NotBlank(message = "Teacher Id must not be null or empty")
    private String teacher;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = true)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = true)
    private String updatedBy;

    @Column(nullable = false)
    private boolean isActive = true;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFormattedCreatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return createdAt.format(formatter);
    }

    public String getFormattedUpdatedOn() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return updatedAt.format(formatter);
    }
}
