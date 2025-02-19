package com.schoolmanagement.student_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EnrollmentRequest {

    @NotNull(message = "School ID cannot be null")
    private Long schoolId;

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

    @NotNull(message = "Student ID cannot be null")
    private Long studentId;
}