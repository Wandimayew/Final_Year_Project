package com.schoolmanagement.student_service.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EnrollmentResponse {

    private Long id;
    private String schoolId;
    private Long classId;
    private String academicYear;
    private LocalDate enrollmentDate;
    private Boolean isTransferred;
    private String transferReason;
    private Long studentId;
}