package com.schoolmanagement.Staff_Service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherResponseDTO {

    private StaffResponseDTO staff;

    private Long teacherId;

    private Long streamId;

    private String subjectSpecialization;

    private String qualification;

    private String experience;

}
