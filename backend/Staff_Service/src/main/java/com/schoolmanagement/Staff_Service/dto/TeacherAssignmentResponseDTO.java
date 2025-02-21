package com.schoolmanagement.Staff_Service.dto;

import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAssignmentResponseDTO {
    private Long id;
    private Long teacherId;
    private Long schoolId;
    private Long classId;
    private Long subjectId;
    private Long sectionId;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private AssignmentStatus status;
    private String schedule;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Boolean isActive;
}
