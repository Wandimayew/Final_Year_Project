package com.schoolmanagement.Assesment_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressTrackerRequestDTO {
    private String schoolId;
    private String studentId;
    private Long streamId;
    private Long sectionId;
    private Long classId;
    private Long subjectId;
    private Long assessmentId;
    private Double averageMarks;
    private String progressStatus;
    private String remarks;
}