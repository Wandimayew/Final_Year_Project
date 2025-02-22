package com.schoolmanagement.Staff_Service.dto;

import java.time.LocalDate;

import com.schoolmanagement.Staff_Service.enums.AssignmentStatus;

import lombok.Data;

@Data
public class TeacherAssignmentRequestDTO {

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

    private String updatedBy;

}
