package com.schoolmanagement.Assessment_Service.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeResponseDTO {
    private Long gradeId;
    private String studentId;
    private String schoolId;
    private AssessmentResponseDTO assessment;
    private Double percentage;
    private String remarks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}