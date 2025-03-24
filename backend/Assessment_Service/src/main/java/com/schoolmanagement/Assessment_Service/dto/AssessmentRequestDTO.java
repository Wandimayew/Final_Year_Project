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
public class AssessmentRequestDTO {
    private String schoolId;
    private Long classId;
    private Long streamId;
    private Long sectionId;
    private Long subjectId;
    private String studentId;
    private String assessmentName;
    private LocalDateTime assessmentDate;
    private Double score;
    private String type;
    private String semester;
    private String status;
}