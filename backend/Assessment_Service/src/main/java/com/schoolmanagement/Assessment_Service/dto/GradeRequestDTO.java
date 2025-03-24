package com.schoolmanagement.Assessment_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradeRequestDTO {
    private String studentId;
    private String schoolId;
    private Long assessmentId;
    private Double percentage;
    private String remarks;
}