package com.schoolmanagement.Assesment_Service.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAnalyticsResponseDTO {
    private Long assessmentAnalyticsId;
    private String schoolId;
    private String studentId;
    private List<AssessmentResponseDTO> assessments;
    private Double averageMarks;
    private Double highestMarks;
    private Double lowestMarks;
    private Double totalMarks;
    private Double passPercentage;
    private Double failPercentage;
    private Long rank;
    private String status;
    private String remarks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}