package com.schoolmanagement.Staff_Service.model;

import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Data
@Table(name = "teacher_assignment")
public class TeacherAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.MERGE)
    @JoinColumn(name = "teacher_id", referencedColumnName = "teacherId", nullable = false)
    private Teacher teacher;

    private String schoolId;

    private Long classId;

    private Long subjectId;
    
    private Long sectionId;

    @NotBlank(message = "Role is required.")
    private String role;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private AssignmentStatus status;

    private String schedule;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    @NotNull(message = "Active status cannot be null")
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}