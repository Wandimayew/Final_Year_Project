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
public class ProgressTrackerResponseDTO {
    private Long progressTrackerId;
    private String schoolId;
    private String studentId;
    private Long streamId;
    private Long sectionId;
    private Long classId;
    private Long subjectId;
    private AssessmentResponseDTO assessment;
    private Double averageMarks;
    private String progressStatus;
    private String remarks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
}