package com.schoolmanagement.Assessment_Service.dto;

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
public class ReportCardResponseDTO {
    private Long reportCardId;
    private String studentId;
    private String schoolId;
    private Long streamId;
    private Long classId;
    private Long sectionId;
    private List<AssessmentResponseDTO> firstSemesterAssessments;
    private List<AssessmentResponseDTO> secondSemesterAssessments;
    private Double totalMarksFirstSemester;
    private Double totalMarksSecondSemester;
    private Double averageGradeFirstSemester;
    private Double averageGradeSecondSemester;
    private String firstSemesterStatus; 
    private String secondSemesterStatus;
    private String overallStatus;
    private String academicYear;
    private String remarks;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}