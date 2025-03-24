package com.schoolmanagement.student_service.model;

import java.time.LocalDate;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.Data;

@Entity
@Data
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "School ID cannot be null")
    private String schoolId;

    @NotNull(message = "Class ID cannot be null")
    private Long classId;

    @NotBlank(message = "Academic year cannot be blank")
    @Pattern(regexp = "\\d{4}-\\d{4}", message = "Academic year must be in the format YYYY-YYYY")
    private String academicYear;

    @NotNull(message = "Enrollment date cannot be null")
    @PastOrPresent(message = "Enrollment date must be in the past or present")
    private LocalDate enrollmentDate;

    @NotNull(message = "Transferred status cannot be null")
    private Boolean isTransferred;

    @Size(max = 500, message = "Transfer reason cannot exceed 500 characters")
    private String transferReason;

    @OneToOne
    @JoinColumn(name = "studentId")
    @NotNull(message = "Student cannot be null")
    private Student student;
}