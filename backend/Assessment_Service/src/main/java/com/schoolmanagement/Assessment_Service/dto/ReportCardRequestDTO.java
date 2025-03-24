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
public class ReportCardRequestDTO {
    private String studentId;
    private String schoolId;
    private Long streamId;
    private Long classId;
    private Long sectionId;
    List<Long> assessmentId;
    private String academicYear;
    private String remarks;
}