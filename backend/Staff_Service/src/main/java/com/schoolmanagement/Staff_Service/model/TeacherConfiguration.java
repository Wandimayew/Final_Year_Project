package com.schoolmanagement.Staff_Service.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "teacher_configuration")
public class TeacherConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "teacher_config_seq")
    @SequenceGenerator(name = "teacher_config_seq", sequenceName = "teacher_config_sequence", allocationSize = 1)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @NotNull(message = "School ID is required")
    private String schoolId;

    @NotNull(message = "Courses per day is required")
    @Min(value = 0, message = "Courses per day cannot be negative")
    @Max(value = 10, message = "Courses per day cannot exceed 10") 
    private Integer coursesPerDay;

    @NotNull(message = "Teaching days per week is required")
    @Min(value = 1, message = "Teaching days per week must be at least 1")
    @Max(value = 7, message = "Teaching days per week cannot exceed 7")
    private Integer teachingDaysPerWeek;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; 
}