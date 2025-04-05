package com.schoolmanagement.Assessment_Service.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssessmentAnalyticsRequestDTO {
    private String studentId; 
    private Long streamId;
    private Long sectionId;
    private String schoolId;  
    private Long subjectId; 
    private Long classId;  
    private String remarks;
}